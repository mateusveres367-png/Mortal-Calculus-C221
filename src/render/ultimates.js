// Ultimates: the toolkit for the cinematics that play when an ultimate connects (see
// match.js for the engine side: the fight stands still, the damage lands on
// def.ultimate.hits). Each fighter's cinematic is its own script, in
// src/render/ultimates/<id>.js, with its own set, camera work and sounds. No gore:
// big hits stay cartoony.
//
//   FG.ULTIMATES[id] = { start(fx), step(fx, t), draw(fx, t) }
// t is the cinematic frame (match.cinematic.t), so hits line up with the engine.
// fx (FG.ultimateFx) moves the fighters only on screen (_drawX, _drawY, _drawRot,
// _drawFacing, _drawScale, _drawGround, _hidden); the simulation places them when the
// cinematic ends. Sets are drawn in the world (fx.gb behind the fighters, fx.gf in
// front), screen overlays on fx.gs, and fx.cam points the camera.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y;
  var TAU = Math.PI * 2;

  // Stable jitter, so chalk lines don't shimmer from frame to frame.
  function hash(a, b) { var x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function ease(u) { u = clamp01(u); return u * u * (3 - 2 * u); }

  // World to screen (the world camera zooms around the middle of the screen).
  function sx(scene, wx) { var c = scene.cameras.main; return (wx - c.scrollX - W / 2) * c.zoom + W / 2; }
  function sy(scene, wy) { var c = scene.cameras.main; return (wy - c.scrollY - H / 2) * c.zoom + H / 2; }

  // --- Chalk ------------------------------------------------------------------------

  function poly(g, pts) {
    if (pts.length < 2) return;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
  }
  // A glowing chalk stroke through points (k: how much of it is drawn so far).
  function stroke(g, pts, col, w, k) {
    k = k == null ? 1 : clamp01(k);
    if (k <= 0 || pts.length < 2) return;
    var n = (pts.length - 1) * k, out = [];
    for (var i = 0; i <= Math.floor(n); i++) out.push(pts[i]);
    var fr = n - Math.floor(n), a = pts[Math.floor(n)], b = pts[Math.min(pts.length - 1, Math.floor(n) + 1)];
    if (fr > 0) out.push([a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr]);
    g.lineStyle(w * 3.4, col, 0.13); poly(g, out);
    g.lineStyle(w * 1.8, col, 0.2); poly(g, out);
    g.lineStyle(w, col, 0.95); poly(g, out);
  }
  function linePts(x1, y1, x2, y2) {
    var n = Math.max(2, Math.round(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) / 12)), pts = [];
    for (var i = 0; i <= n; i++) {
      var u = i / n, j = i > 0 && i < n ? (hash(x1 * 0.37 + i, y2 * 0.71 + n) - 0.5) * 1.4 : 0;
      pts.push([x1 + (x2 - x1) * u + j, y1 + (y2 - y1) * u - j]);
    }
    return pts;
  }
  function chalkLine(g, x1, y1, x2, y2, col, w, k) { stroke(g, linePts(x1, y1, x2, y2), col, w || 2, k); }
  function chalkArc(g, cx, cy, r, a0, a1, col, w, k) {
    var n = Math.max(6, Math.round(Math.abs(a1 - a0) * r / 8)), pts = [];
    for (var i = 0; i <= n; i++) {
      var a = a0 + (a1 - a0) * i / n, j = (hash(cx + i, r) - 0.5) * 1.2;
      pts.push([cx + Math.cos(a) * (r + j), cy + Math.sin(a) * (r + j)]);
    }
    stroke(g, pts, col, w || 2, k);
  }
  function dot(g, x, y, r, col) { g.fillStyle(col, 0.2); g.fillCircle(x, y, r * 2.2); g.fillStyle(col, 1); g.fillCircle(x, y, r); }

  // --- The toolkit ------------------------------------------------------------------

  FG.ultimateFx = function (scene, wi) {
    var m = scene.match, f = m.fighters, w = f[wi], l = f[1 - wi], cin = m.cinematic;
    var fx = {
      scene: scene, w: w, l: l, wi: wi, li: 1 - wi, dir: cin.dir, x0: w.x, lx0: l.x, ly0: l.y, s: {},
      name: w.def.ultimate.name, glow: FG.fighterGlow(w.def),
      gb: scene.finBack, gf: scene.finFront, gs: scene.finScreen, top: scene.ultTop, gg: scene.ultGhost,
      pose: function (who, name) { who._override = { anim: [[1, name]], t: 1 }; },
      anim: function (who, anim, loop) { who._override = { anim: anim, t: 0, loop: !!loop }; },
      // A strike: from windup pose `c` to strike pose `x` landing `at` frames later, then held.
      strike: function (who, c, x, at, hold) { at = at || 5; fx.anim(who, [[1, c], [at, x], [at + (hold || 8), x]]); },
      at: function (who, x, y) {
        if (x != null) who._drawX = Math.max(C.WALL_L + 16, Math.min(C.WALL_R - 16, x));
        if (y != null) who._drawY = y;
      },
      px: function (who) { return who._drawX != null ? who._drawX : who.x; },
      py: function (who) { return who._drawY != null ? who._drawY : who.y; },
      face: function (who, d) { who._drawFacing = d; },
      // Sparks, sound and a flash at a fighter (kind: jab, body, power, launch, overhead, low).
      hit: function (who, kind, opts) {
        opts = opts || {};
        var ev = { type: 'hit', x: fx.px(who) - (who._drawFacing || who.facing) * 6, y: opts.y || (fx.py(who) + 60), facing: fx.dir,
          move: { strength: opts.strength || 'heavy' }, impact: kind || 'power', ch: !!opts.ch, hits: opts.hits || 1, damage: 20 };
        scene.effects.spawn(ev);
        FG.Sfx.play(ev);
        scene.effects.shake(opts.shake || 0.01);
        scene.impact = { who: who === w ? wi : 1 - wi, frames: 3, color: opts.color || (opts.ch ? 0xffb347 : 0xffffff) };
      },
      shake: function (a) { scene.effects.shake(a); },
      slow: function (frames, scale) { scene.slowmo = { frames: frames, scale: scale }; },
      flash: function (color, alpha) { scene.effects.screen = { color: color, alpha: alpha || 0.8, life: 10, max: 10 }; },
      zoom: function (amount, x, y, hold) { scene.zoom = { t: 0, amount: amount, x: x, y: y, hold: hold || 30 }; },
      dust: function (x, n, s) { scene.effects.dust(x, n, s); },
      sx: function (wx) { return sx(scene, wx); },
      sy: function (wy) { return sy(scene, wy); },
      // Screen position of a point `h` above a fighter's feet.
      at2: function (who, h) { return [sx(scene, fx.px(who)), sy(scene, GY - fx.py(who) - (h || 0))]; },
      // Big pixel text on screen (pooled; hidden again every frame unless redrawn).
      text: function (i, str, x, y, color, scale, angle, alpha) {
        var t = scene.ultTexts[i];
        t.setText(str).setPosition(x, y).setScale(scale || 2).setAngle(angle || 0).setTint(color == null ? 0xffffff : color)
          .setAlpha(alpha == null ? 1 : alpha).setVisible(true);
      },
      // A pose from a fighter's own move: the frame it strikes (for freezing them mid-attack).
      strikePose: function (who, id) {
        var mv = id ? who.def.moves[id] : who.lastMove;
        if (!mv || !mv.anim) return 'hit_mid';
        var k = mv.anim.filter(function (a) { return a[0] >= mv.startup; })[0] || mv.anim[mv.anim.length - 1];
        return k[1];
      },
      // ...and the pose it winds up from.
      windupPose: function (who, id) {
        var mv = who.def.moves[id];
        if (!mv || !mv.anim) return 'idle';
        var ks = mv.anim.filter(function (a) { return a[0] < mv.startup; });
        return (ks[ks.length - 1] || mv.anim[0])[1];
      },

      // --- Sets and camera work ---
      // A set is drawn in the world around an anchor (fx.ax), in set space: s is how far
      // forward of the anchor (toward where the attacker faces), h how high off the floor.
      // A cutaway (fx.cutaway = true) is somewhere else: its set covers the stage and the
      // camera may leave the stage's bounds.
      ax: Math.max(W / 2, Math.min(C.WORLD_W - W / 2, (w.x + l.x) / 2)),
      cutaway: false,
      X: function (s) { return fx.ax + fx.dir * s; },
      Y: function (h) { return GY - h; },
      S: function (wx) { return (wx - fx.ax) * fx.dir; }, // a world x in set space
      P: function (s, h) { return { x: fx.X(s), y: GY - h }; },
      // Put a fighter somewhere on the set (on screen only; never clamped to the walls).
      place: function (who, s, h) { who._drawX = fx.X(s); who._drawY = h || 0; },
      // Point the camera at (s, h) in set space (h = 120 frames the fight as usual).
      // opts: { rot (a tilt, radians), k (how fast it eases there, 1 = at once), cut }.
      cam: function (s, h, zoom, opts) {
        opts = opts || {};
        scene.ultCam = { x: fx.X(s), y: GY - h, zoom: zoom || 1, rot: (opts.rot || 0) * fx.dir, k: opts.k == null ? 0.12 : opts.k, cut: !!opts.cut };
      },
      // Fill the whole view (however the camera moves) with a colour.
      fill: function (g, col, a) { g.fillStyle(col, a == null ? 1 : a); g.fillRect(fx.ax - W * 1.6, GY - H * 2.2, W * 3.2, H * 3.4); },
      rect: function (g, s1, h1, s2, h2, col, a) {
        var x1 = fx.X(s1), x2 = fx.X(s2);
        g.fillStyle(col, a == null ? 1 : a);
        g.fillRect(Math.min(x1, x2), GY - Math.max(h1, h2), Math.abs(x2 - x1), Math.abs(h2 - h1));
      },
      poly: function (g, pts, col, a) {
        g.fillStyle(col, a == null ? 1 : a);
        g.fillPoints(pts.map(function (p) { return fx.P(p[0], p[1]); }), true);
      },
      line: function (g, s1, h1, s2, h2, col, wid, a) {
        g.lineStyle(wid || 1, col, a == null ? 1 : a);
        g.lineBetween(fx.X(s1), GY - h1, fx.X(s2), GY - h2);
      },
      circle: function (g, s, h, r, col, a) { g.fillStyle(col, a == null ? 1 : a); g.fillCircle(fx.X(s), GY - h, r); },
      // Another figure of a fighter (a copy, a photo, a silhouette) in one of their poses.
      figure: function (g, who, pose, s, h, opts) {
        opts = Object.assign({ noShadow: true }, opts);
        var x = fx.X(s);
        opts.x = x; opts.y = 0; opts.groundY = GY - (h || 0); // (a lift would be scaled with the figure)
        FG.drawFighter(g, { def: who.def, alt: who.alt, x: x, y: h || 0, z: 0, facing: opts.facing || who.facing, _pose: FG.getPose(who.def, pose), _twist: 0 }, opts);
      },
      // Text on the set (it moves and zooms with the camera): s, h in set space.
      wtext: function (i, str, s, h, color, scale, angle, alpha) {
        var y = fx.sy(GY - h);
        if (y < 60 || y > H + 20) return; // out of the shot (or under the health bars)
        fx.text(i, str, fx.sx(fx.X(s)), y, color, (scale || 2) * scene.cameras.main.zoom, angle, alpha);
      },
      // A speech box over a fighter.
      say: function (who, text, dur) { scene.speech.show(who.def.name, text, dur || FG.SpeechBox.readTime(text)); fx.speaker = who; },
      // The ultimate's own sounds: fx.sfx(function (S) { S.osc({...}); S.noise({...}); }).
      sfx: function (fn) { FG.Sfx.synth(fn); },
      // Cheering students (the stage's crowd, or a set's own).
      crowd: function (level) { scene.stage.cheer(level, true); FG.Sfx.cheer(Math.min(1, level / 3)); }
    };
    return fx;
  };

  // Shared drawing helpers for the ultimate scripts in src/render/ultimates/.
  FG.ultKit = { hash: hash, clamp01: clamp01, ease: ease, stroke: stroke, poly: poly, chalkLine: chalkLine, chalkArc: chalkArc, dot: dot, TAU: TAU,
    stamp: function (t, at) { return stamp(t, at); } };

  // How big a stamp is `t - at` frames after it slams down.
  function stamp(t, at) { var u = clamp01((t - at) / 6); return 1 + (1 - u) * (1 - u) * 2.5; }
  // Clear the screen-only placement of both fighters (the cinematic is over).
  FG.clearUltimateDraw = function (f) {
    f.forEach(function (fi) { fi._override = null; fi._drawX = null; fi._drawY = null; fi._drawRot = null; fi._drawFacing = null; fi._drawScale = null; fi._drawGround = 0; fi._hairFlick = null; fi._hidden = false; fi._drawBehind = false; fi._props = null; fi._face = null; });
  };

  // --- The ultimates ----------------------------------------------------------------
  // Each fighter's script is in src/render/ultimates/<id>.js.

  FG.ULTIMATES = {};
})();
