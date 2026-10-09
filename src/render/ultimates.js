// Ultimates: the cinematics that play when an ultimate connects (see match.js for
// the engine side: the fight stands still, the damage lands on def.ultimate.hits).
// No gore: big moves, a cut-in, camera zoom, slow motion, and DIAGRAM VIEW freeze
// frames where the impact is drawn as a glowing chalkboard diagram.
//
//   FG.ULTIMATES[id] = { start(fx), step(fx, t), draw(fx, t) }
// t is the cinematic frame (match.cinematic.t), so hits line up with the engine.
// fx (FG.ultimateFx) moves the fighters only on screen (_drawX, _drawY, _drawRot,
// _drawFacing, _hidden); the simulation places them when the cinematic ends.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y;
  var CHALK = 0xf2f6ee, CHALK_Y = 0xffe98a, CHALK_B = 0x9fe0ff, CHALK_R = 0xff8f7a, CHALK_G = 0xa8f0a0, BOARD = 0x163324;
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
  function chalkArrow(g, x1, y1, x2, y2, col, w, k) {
    k = k == null ? 1 : clamp01(k);
    chalkLine(g, x1, y1, x2, y2, col, w, k);
    if (k < 1) return;
    var a = Math.atan2(y2 - y1, x2 - x1), hl = 10;
    chalkLine(g, x2, y2, x2 - Math.cos(a - 0.45) * hl, y2 - Math.sin(a - 0.45) * hl, col, w);
    chalkLine(g, x2, y2, x2 - Math.cos(a + 0.45) * hl, y2 - Math.sin(a + 0.45) * hl, col, w);
  }
  function dashed(g, x1, y1, x2, y2, col, k) {
    var n = 10;
    for (var i = 0; i < n * clamp01(k == null ? 1 : k); i += 1) {
      var u0 = i / n, u1 = (i + 0.5) / n;
      g.lineStyle(1.5, col, 0.7); g.lineBetween(x1 + (x2 - x1) * u0, y1 + (y2 - y1) * u0, x1 + (x2 - x1) * u1, y1 + (y2 - y1) * u1);
    }
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
      // DIAGRAM VIEW: freeze, chalkboard, a diagram over the hit. spec: { kind, caption, sub, at (fighter), y, len, ... }
      diagram: function (spec) {
        spec.x = spec.x != null ? spec.x : fx.px(spec.at || l);
        spec.y = spec.y != null ? spec.y : fx.py(spec.at || l) + 56;
        spec.dir = fx.dir;
        scene.startDiagram(spec);
      },
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
    f.forEach(function (fi) { fi._override = null; fi._drawX = null; fi._drawY = null; fi._drawRot = null; fi._drawFacing = null; fi._drawScale = null; fi._drawGround = 0; fi._hidden = false; fi._drawBehind = false; fi._props = null; fi._face = null; });
  };

  // --- DIAGRAM VIEW -----------------------------------------------------------------
  // Drawn on the screen over a chalkboard: both fighters as chalk outlines, the
  // diagram at the impact, a caption. dg: { spec, t, len }.

  var DIAGRAMS = {
    // Free-body diagram: the blow as a force arrow into a mass, with gravity.
    force: function (g, T, cx, cy, k, d) {
      var a = d.angle != null ? d.angle : (d.dir > 0 ? 0 : Math.PI), L = 96;
      var x1 = cx - Math.cos(a) * L, y1 = cy - Math.sin(a) * L;
      g.lineStyle(2, CHALK, 0.9 * clamp01(k * 3)); g.strokeRect(cx - 12, cy - 12, 24, 24);
      chalkArrow(g, x1, y1, cx - Math.cos(a) * 14, cy - Math.sin(a) * 14, CHALK_Y, 3, k * 1.4);
      chalkArrow(g, cx, cy + 12, cx, cy + 56, CHALK_B, 2, k * 1.4 - 0.4);
      dashed(g, cx - 120, cy, cx + 120, cy, CHALK, k);
      if (k > 0.5) { T(0, 'F', (x1 + cx) / 2 - Math.sin(a) * 14, (y1 + cy) / 2 + Math.cos(a) * 14 - 10, CHALK_Y, 2); T(1, 'M', cx, cy, CHALK, 1.5); T(2, 'MG', cx + 18, cy + 46, CHALK_B, 1.5); }
      if (k > 0.8) T(3, d.formula || 'ΣF = MA', cx, cy - 64, CHALK, 2);
    },
    // A projectile's arc: the launch, its vertex and the way down.
    parabola: function (g, T, cx, cy, k, d) {
      var dir = d.dir, ox = cx - dir * 30, oy = cy + 60, wdt = 190, ht = 130, pts = [];
      chalkLine(g, ox - dir * 10, oy, ox + dir * (wdt + 20), oy, CHALK, 2, k * 2);
      chalkLine(g, ox, oy + 10, ox, oy - ht - 20, CHALK, 2, k * 2);
      for (var i = 0; i <= 24; i++) { var u = i / 24; pts.push([ox + dir * wdt * u, oy - ht * 4 * u * (1 - u)]); }
      stroke(g, pts, CHALK_Y, 3, k * 1.3 - 0.2);
      if (k > 0.6) {
        dashed(g, ox + dir * wdt / 2, oy, ox + dir * wdt / 2, oy - ht, CHALK, (k - 0.6) * 3);
        dot(g, ox + dir * wdt / 2, oy - ht, 3, CHALK_Y);
        T(0, 'VERTEX', ox + dir * wdt / 2, oy - ht - 16, CHALK_Y, 1.5);
        chalkArrow(g, ox, oy, ox + dir * 34, oy - 52, CHALK_B, 2);
        T(1, 'V', ox + dir * 26, oy - 60, CHALK_B, 1.5);
      }
      if (k > 0.9) T(2, d.formula || 'Y = -X² + BX', ox + dir * wdt * 0.8, oy - ht * 0.5, CHALK, 1.5);
    },
    // A circle with its radius drawn.
    circle: function (g, T, cx, cy, k, d) {
      var r = d.r || 74, a = -0.6;
      chalkArc(g, cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU, CHALK, 3, k * 1.2);
      if (k > 0.4) {
        dot(g, cx, cy, 3, CHALK_Y);
        chalkLine(g, cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, CHALK_Y, 2, (k - 0.4) * 3);
        T(0, 'R', cx + Math.cos(a) * r / 2 + 6, cy + Math.sin(a) * r / 2 - 12, CHALK_Y, 2);
        T(1, 'O', cx - 10, cy + 8, CHALK, 1.5);
      }
      if (k > 0.8) T(2, d.formula || 'A = ΠR²', cx, cy + r + 18, CHALK, 2);
    },
    // An inscribed angle and its central angle.
    inscribed: function (g, T, cx, cy, k, d) {
      var r = 70, pA = -2.5, pB = -0.6, pC = 1.9;
      chalkArc(g, cx, cy, r, 0, TAU, CHALK, 2, k * 1.5);
      var A = [cx + Math.cos(pA) * r, cy + Math.sin(pA) * r], B = [cx + Math.cos(pB) * r, cy + Math.sin(pB) * r], P = [cx + Math.cos(pC) * r, cy + Math.sin(pC) * r];
      chalkLine(g, P[0], P[1], A[0], A[1], CHALK_Y, 2, k * 2 - 0.5);
      chalkLine(g, P[0], P[1], B[0], B[1], CHALK_Y, 2, k * 2 - 0.5);
      chalkLine(g, cx, cy, A[0], A[1], CHALK_B, 2, k * 2 - 0.8);
      chalkLine(g, cx, cy, B[0], B[1], CHALK_B, 2, k * 2 - 0.8);
      if (k > 0.7) {
        dot(g, cx, cy, 3, CHALK_B); dot(g, P[0], P[1], 3, CHALK_Y);
        T(0, '2X', cx + 14, cy - 18, CHALK_B, 1.5); T(1, 'X', P[0], P[1] - 18, CHALK_Y, 1.5);
      }
      if (k > 0.9) T(2, d.formula || 'CENTRAL ∠ = 2 × INSCRIBED ∠', cx, cy + r + 18, CHALK, 1.5);
    },
    // Vertical angles: two crossing lines, opposite angles marked congruent.
    angles: function (g, T, cx, cy, k, d) {
      chalkLine(g, cx - 110, cy - 50, cx + 110, cy + 50, CHALK, 3, k * 1.6);
      chalkLine(g, cx - 110, cy + 50, cx + 110, cy - 50, CHALK, 3, k * 1.6 - 0.3);
      var a = Math.atan2(50, 110);
      if (k > 0.5) {
        chalkArc(g, cx, cy, 26, -a, a, CHALK_Y, 2); chalkArc(g, cx, cy, 26, Math.PI - a, Math.PI + a, CHALK_Y, 2);
        chalkArc(g, cx, cy, 32, -a, a, CHALK_Y, 2); chalkArc(g, cx, cy, 32, Math.PI - a, Math.PI + a, CHALK_Y, 2);
        T(0, '∠1', cx + 50, cy - 6, CHALK_Y, 1.5); T(1, '∠2', cx - 50, cy - 6, CHALK_Y, 1.5);
      }
      if (k > 0.85) T(2, d.formula || '∠1 ≅ ∠2', cx, cy + 66, CHALK, 2);
    },
    // Two congruent triangles with their side ticks.
    triangles: function (g, T, cx, cy, k, d) {
      function tri(ox, flip, kk) {
        var A = [ox, cy + 40], B = [ox + flip * 80, cy + 40], P = [ox + flip * 26, cy - 50];
        chalkLine(g, A[0], A[1], B[0], B[1], CHALK, 2, kk * 3);
        chalkLine(g, B[0], B[1], P[0], P[1], CHALK, 2, kk * 3 - 1);
        chalkLine(g, P[0], P[1], A[0], A[1], CHALK, 2, kk * 3 - 2);
        if (kk > 0.9) {
          var mx = (A[0] + B[0]) / 2; chalkLine(g, mx, cy + 34, mx, cy + 46, CHALK_Y, 2);
          var nx = (A[0] + P[0]) / 2, ny = (A[1] + P[1]) / 2; chalkLine(g, nx - 6, ny - 2, nx + 6, ny + 2, CHALK_Y, 2); chalkLine(g, nx - 6, ny + 4, nx + 6, ny + 8, CHALK_Y, 2);
          chalkArc(g, A[0], A[1], 16, flip > 0 ? -1.3 : Math.PI + 0.05, flip > 0 ? -0.05 : Math.PI + 1.3, CHALK_B, 2);
        }
      }
      tri(cx - 130, 1, k * 1.3); tri(cx + 130, -1, k * 1.3 - 0.3);
      if (k > 0.8) T(0, '≅', cx, cy, CHALK_Y, 4);
      if (k > 0.9) T(1, d.formula || 'S . A . S', cx, cy + 66, CHALK, 2);
    },
    // A sequence of bars, each twice the last, running off the board.
    series: function (g, T, cx, cy, k, d) {
      var n = 6, bw = 22, base = cy + 70, x0 = cx - n * (bw + 8) / 2;
      chalkLine(g, x0 - 10, base, x0 + n * (bw + 8) + 10, base, CHALK, 2, k * 2);
      for (var i = 0; i < n; i++) {
        var h = Math.min(170, 5 * Math.pow(2, i)), kk = k * n * 1.2 - i;
        if (kk <= 0) continue;
        var bx = x0 + i * (bw + 8), hh = h * clamp01(kk);
        g.fillStyle(i === n - 1 ? CHALK_R : CHALK_Y, 0.18); g.fillRect(bx, base - hh, bw, hh);
        g.lineStyle(2, i === n - 1 ? CHALK_R : CHALK_Y, 0.9); g.strokeRect(bx, base - hh, bw, hh);
        T(i, String(Math.pow(2, i)), bx + bw / 2, base + 12, CHALK, 1.5);
      }
      if (k > 0.85) { chalkArrow(g, x0 + (n - 1) * (bw + 8) + bw / 2, base - 172, x0 + (n - 1) * (bw + 8) + bw / 2, base - 200, CHALK_R, 2); T(6, d.formula || 'A·R^N, R = 2', cx, base - 214, CHALK, 1.5); }
    },
    // The slope of a curve at a point: tangent line and rise over run.
    derivative: function (g, T, cx, cy, k, d) {
      var ox = cx - 110, oy = cy + 60, pts = [];
      chalkLine(g, ox, oy, ox + 230, oy, CHALK, 2, k * 2); chalkLine(g, ox, oy, ox, oy - 150, CHALK, 2, k * 2);
      for (var i = 0; i <= 30; i++) { var u = i / 30; pts.push([ox + u * 220, oy - 30 - 90 * u * u]); }
      stroke(g, pts, CHALK, 3, k * 1.4 - 0.2);
      var u0 = 0.6, px = ox + u0 * 220, py = oy - 30 - 90 * u0 * u0, sl = 2 * 90 * u0 / 220;
      if (k > 0.55) {
        chalkLine(g, px - 70, py + 70 * sl, px + 70, py - 70 * sl, CHALK_Y, 2, (k - 0.55) * 3);
        dot(g, px, py, 3, CHALK_Y);
        dashed(g, px, py, px + 40, py, CHALK_B); dashed(g, px + 40, py, px + 40, py - 40 * sl, CHALK_B);
        T(0, 'DX', px + 20, py + 10, CHALK_B, 1.5); T(1, 'DY', px + 58, py - 20 * sl, CHALK_B, 1.5);
      }
      if (k > 0.9) T(2, d.formula || "F'(X) = DY / DX", cx, oy + 22, CHALK, 2);
    },
    // The area under a curve, shaded between A and B.
    integral: function (g, T, cx, cy, k, d) {
      var ox = cx - 110, oy = cy + 60, pts = [], fx = function (u) { return oy - 40 - 70 * Math.sin(u * Math.PI * 0.9); };
      chalkLine(g, ox, oy, ox + 230, oy, CHALK, 2, k * 2); chalkLine(g, ox, oy, ox, oy - 150, CHALK, 2, k * 2);
      for (var i = 0; i <= 30; i++) { var u = i / 30; pts.push([ox + u * 220, fx(u)]); }
      stroke(g, pts, CHALK, 3, k * 1.4 - 0.2);
      var a = 0.2, b = 0.8, shade = clamp01((k - 0.45) * 2.2);
      for (var s = a; s <= a + (b - a) * shade; s += 0.025) { g.lineStyle(2, CHALK_Y, 0.55); g.lineBetween(ox + s * 220, oy, ox + s * 220, fx(s)); }
      if (k > 0.5) { T(0, 'A', ox + a * 220, oy + 10, CHALK_Y, 1.5); T(1, 'B', ox + b * 220, oy + 10, CHALK_Y, 1.5); }
      if (k > 0.9) T(2, d.formula || "∫ F'(X) DX = F(B) - F(A)", cx, oy + 26, CHALK, 1.5);
    },
    // The complex plane: multiplying by i turns a quarter circle.
    complex: function (g, T, cx, cy, k, d) {
      var r = 64;
      chalkLine(g, cx - 110, cy, cx + 110, cy, CHALK, 2, k * 2); chalkLine(g, cx, cy + 90, cx, cy - 90, CHALK, 2, k * 2);
      chalkArc(g, cx, cy, r, 0, TAU, CHALK_B, 2, k * 1.4 - 0.2);
      if (k > 0.4) { T(0, 'RE', cx + 100, cy + 12, CHALK, 1.5); T(1, 'IM', cx + 16, cy - 86, CHALK, 1.5); }
      var turn = clamp01((k - 0.45) * 2) * (d.half ? Math.PI : Math.PI / 2);
      if (k > 0.45) {
        chalkArc(g, cx, cy, r + 14, 0, -turn, CHALK_Y, 3);
        var ex = cx + Math.cos(-turn) * (r + 14), ey = cy + Math.sin(-turn) * (r + 14);
        chalkArrow(g, ex + 6 * Math.sin(-turn), ey - 6 * Math.cos(-turn), ex, ey, CHALK_Y, 3);
        dot(g, cx + r, cy, 3, CHALK); T(2, '1', cx + r + 10, cy + 12, CHALK, 1.5);
        dot(g, cx, cy - r, 3, CHALK_Y); T(3, '¡', cx + 10, cy - r - 12, CHALK_Y, 2);
        if (d.half) { dot(g, cx - r, cy, 3, CHALK_R); T(4, '-1', cx - r - 16, cy + 12, CHALK_R, 1.5); }
      }
      if (k > 0.9) T(5, d.formula || '× ¡ = TURN 90', cx, cy + 104, CHALK, 2);
    },
    // y = 2^x with its doubling points.
    exp: function (g, T, cx, cy, k, d) {
      var ox = cx - 100, oy = cy + 70, pts = [], sc = 18;
      chalkLine(g, ox, oy, ox + 210, oy, CHALK, 2, k * 2); chalkLine(g, ox, oy, ox, oy - 170, CHALK, 2, k * 2);
      for (var i = 0; i <= 30; i++) { var x = i / 30 * 3.1; pts.push([ox + x * 60, oy - Math.pow(2, x) * sc]); }
      stroke(g, pts, CHALK_R, 3, k * 1.4 - 0.2);
      [1, 2, 3].forEach(function (x, j) {
        if (k < 0.5 + j * 0.15) return;
        var px = ox + x * 60, py = oy - Math.pow(2, x) * sc;
        dashed(g, px, oy, px, py, CHALK_B); dot(g, px, py, 3, CHALK_Y);
        T(j, String(Math.pow(2, x)), px - 14, py - 10, CHALK_Y, 1.5);
      });
      if (k > 0.9) T(3, d.formula || 'Y = 2^X', cx, oy + 22, CHALK, 2);
    },
    // Row times column: two 3x3 matrices, a highlighted row and column, their product.
    matrix: function (g, T, cx, cy, k, d) {
      var cs = 22, row = d.row == null ? 0 : d.row, col = d.col == null ? 0 : d.col;
      function mat(ox, hiRow, hiCol, kk, vals) {
        var x0 = ox - cs * 1.5, y0 = cy - cs * 1.5;
        chalkLine(g, x0 - 6, y0 - 4, x0 - 6, y0 + cs * 3 + 4, CHALK, 2, kk * 3); chalkLine(g, x0 - 6, y0 - 4, x0, y0 - 4, CHALK, 2, kk * 3); chalkLine(g, x0 - 6, y0 + cs * 3 + 4, x0, y0 + cs * 3 + 4, CHALK, 2, kk * 3);
        var x1 = x0 + cs * 3 + 6;
        chalkLine(g, x1, y0 - 4, x1, y0 + cs * 3 + 4, CHALK, 2, kk * 3); chalkLine(g, x1, y0 - 4, x1 - 6, y0 - 4, CHALK, 2, kk * 3); chalkLine(g, x1, y0 + cs * 3 + 4, x1 - 6, y0 + cs * 3 + 4, CHALK, 2, kk * 3);
        if (hiRow != null && kk > 0.4) { g.fillStyle(CHALK_Y, 0.2); g.fillRect(x0, y0 + hiRow * cs, cs * 3, cs); }
        if (hiCol != null && kk > 0.4) { g.fillStyle(CHALK_B, 0.2); g.fillRect(x0 + hiCol * cs, y0, cs, cs * 3); }
        return { x0: x0, y0: y0, vals: vals };
      }
      var A = mat(cx - 140, row, null, k * 1.5), B = mat(cx, null, col, k * 1.5 - 0.2), P = mat(cx + 140, null, null, k * 1.5 - 0.4);
      if (k > 0.3) T(0, '×', cx - 70, cy, CHALK, 2.5);
      if (k > 0.5) T(1, '=', cx + 70, cy, CHALK, 2.5);
      if (k > 0.6) { g.fillStyle(CHALK_R, 0.35); g.fillRect(P.x0 + col * cs, P.y0 + row * cs, cs, cs); g.lineStyle(2, CHALK_R, 1); g.strokeRect(P.x0 + col * cs, P.y0 + row * cs, cs, cs); }
      if (k > 0.9) T(2, d.formula || 'ROW × COLUMN', cx, cy + cs * 2 + 26, CHALK, 2);
    }
  };

  // How high on screen each diagram's middle may go (they reach up different amounts).
  var MIN_Y = { parabola: 214, series: 230, exp: 220, derivative: 200, integral: 200, complex: 200 };

  FG.drawDiagram = function (scene, dg) {
    var d = dg.spec, t = dg.t, len = dg.len, g = scene.diagG, gf = scene.diagFig, gt = scene.diagTop, texts = scene.ultTexts;
    var a = t < 5 ? t / 5 : t > len - 6 ? Math.max(0, (len - t) / 6) : 1;
    // The chalkboard, a few smudges, and a scan wiping down as it appears.
    g.fillStyle(BOARD, 0.9 * a); g.fillRect(0, 0, W, H);
    for (var s = 0; s < 14; s++) { g.fillStyle(0xffffff, 0.03 * a); g.fillEllipse(hash(s, 1) * W, hash(s, 2) * H, 60 + hash(s, 3) * 140, 16 + hash(s, 4) * 40); }
    if (t < 10) { g.fillStyle(0xffffff, 0.5 * (1 - t / 10)); g.fillRect(0, (t / 10) * H, W, 3); }
    g.lineStyle(4, 0x6b4a2a, a); g.strokeRect(4, 4, W - 8, H - 8);
    // Both fighters as chalk outlines, the one taking the hit brighter.
    gf.setAlpha(0.5 * a);
    scene.match.fighters.forEach(function (fi, i) {
      if (fi._hidden || !fi._pose) return;
      scene.drawFigure(gf, fi, { flash: i === scene.ult.fx.li ? 0xffffff : 0x9fd0a8, noShadow: true, screen: true });
    });
    if (a < 0.3) return;
    var cx = sx(scene, d.x), cy = sy(scene, GY - d.y), k = clamp01((t - 4) / 22);
    cx = Math.max(150, Math.min(W - 150, cx)); cy = Math.max(MIN_Y[d.kind] || 160, Math.min(H - 120, cy));
    var used = 8;
    function T(i, str, x, y, col, sc) {
      var tx = texts[used + Math.min(i, 9)];
      tx.setText(str).setPosition(x, y).setScale(sc || 2).setAngle(0).setTint(col).setAlpha(a).setVisible(true);
    }
    gt.setAlpha(a);
    (DIAGRAMS[d.kind] || DIAGRAMS.force)(gt, T, cx, cy, k, d);
    // The header and the caption.
    var head = texts[18], cap = texts[19], sub = texts[20];
    head.setText('DIAGRAM VIEW').setPosition(16, H - 22).setScale(2).setAngle(0).setTint(CHALK_Y).setAlpha(a).setVisible(true).setOrigin(0, 0.5);
    gt.lineStyle(2, CHALK_Y, 0.8); gt.lineBetween(16, H - 12, 16 + head.width * clamp01(t / 12), H - 12);
    // Captions sit away from the attacker's combo counter.
    var capX = W / 2 + (scene.ult.wi === 0 ? 70 : -70);
    if (d.caption) cap.setText(d.caption).setPosition(capX, 74).setScale(d.caption.length > 14 ? 2.4 : 3).setAngle(-2).setTint(CHALK).setAlpha(a * clamp01((t - 6) / 6)).setVisible(true);
    if (d.sub) sub.setText(d.sub).setPosition(capX, 100).setScale(1.5).setAngle(-2).setTint(CHALK_B).setAlpha(a * clamp01((t - 12) / 6)).setVisible(true);
  };

  // --- The ultimates ----------------------------------------------------------------
  // Each fighter's script is in src/render/ultimates/<id>.js.

  FG.ULTIMATES = {};

  // PEDERSEN — Exponential Overdrive: off come the sunglasses; three punches, each
  // worth twice the last (2¹, 2², 2³); the last one cracks the screen.
  FG.ULTIMATES.pedersen = {
    start: function (fx) {
      fx.at(fx.l, fx.x0 + fx.dir * 48, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.w._props = { shades: true, glint: -1 };
      fx.anim(fx.w, [[1, 'idle'], [10, 'calm'], [30, 'calm'], [38, 'wave'], [54, 'idle']]);
      fx.zoom(0.18, fx.x0, 80, 60);
      fx.s.nums = [];
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t >= 22 && t < 34) w._props.glint = (t - 22) / 11;
      if (t === 40) {
        w._props = null; // off they come
        fx.scene.effects.props.push({ x: fx.px(w) - fx.dir * 4, y: GY - 96, vx: -fx.dir * 2.2, vy: -3.6, rot: 0, vr: 0.3, life: 60, w: 9, h: 3, color: 0x111111 });
        FG.Sfx.play({ type: 'whiff', move: { strength: 'light' } });
        s.eyes = t;
        fx.zoom(0.1, fx.x0 + fx.dir * 24, 60, 200);
      }
      var P = [['jab_c', 'jab_x', 'jab', 'hit_high', 6], ['cross_c', 'cross_x', 'power', 'hit_mid', 10], ['om_c', 'power_x', 'power', 'juggle', 30]];
      for (var k = 0; k < 3; k++) {
        if (t === hits[k] - P[k][4]) {
          if (k === 2) fx.anim(w, [[1, 'om_c'], [24, 'om_c'], [30, 'power_x'], [60, 'power_x'], [76, 'hv_r'], [90, 'stand']]);
          else fx.strike(w, P[k][0], P[k][1], P[k][4], 10);
        }
        if (t === hits[k]) {
          fx.hit(l, P[k][2], { strength: 'heavy', hits: k + 1, ch: k === 2, shake: 0.008 * Math.pow(2, k) });
          fx.pose(l, P[k][3]);
          s.nums.push({ k: k, t: t, x: fx.px(l), y: fx.py(l) + 80 });
          if (k === 1) fx.diagram({ kind: 'exp', caption: 'Y = 2^X', sub: 'EVERY HIT DOUBLES THE LAST.' });
          if (k === 2) { s.crack = t; s.crackAt = fx.at2(l, 60); fx.slow(40, 0.3); fx.flash(0xffffff, 0.9); FG.Sfx.glass(); }
        }
      }
      if (t > hits[0] && t < hits[0] + 10) fx.at(l, fx.px(l) + fx.dir * 0.6, 0);
      if (t > hits[1] && t < hits[1] + 14) fx.at(l, fx.px(l) + fx.dir * 1.2, 0);
      if (t > hits[2]) { var u = clamp01((t - hits[2]) / (w.def.ultimate.len - hits[2])); fx.at(l, fx.x0 + fx.dir * (60 + 60 * u), 40 * u + 50 * Math.sin(u * Math.PI)); }
      if (t === hits[2] + 20) fx.diagram({ kind: 'exp', caption: '2³ = 8', sub: 'THAT IS EXPONENTIAL GROWTH.', formula: 'F = 2^3' });
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w;
      // His eyes flash once the shades are off.
      if (s.eyes && t - s.eyes < 16) {
        var e = fx.at2(w, 94);
        fx.gs.fillStyle(0xff3d3d, 1 - (t - s.eyes) / 16); fx.gs.fillRect(e[0] + fx.dir * 2 - 4, e[1] - 1, 8, 2);
      }
      // 2¹, 2², 2³: each bigger than the last.
      var SUP = ['¹', '²', '³'];
      s.nums.forEach(function (n, i) {
        var age = t - n.t, sc = (2 + n.k * 1.2) * (1 + (stamp(t, n.t) - 1) * 0.4);
        fx.text(i, '2' + SUP[n.k], fx.sx(n.x), fx.sy(GY - n.y) - Math.min(30, age), [0xffd23f, 0xff8a1f, 0xff3d3d][n.k], sc, -6, 1 - clamp01((age - 50) / 20));
      });
    },
    // Drawn even over DIAGRAM VIEW: the screen stays cracked.
    drawTop: function (fx, t) {
      var s = fx.s;
      // The crack: lines spreading from the impact like broken glass, on top of everything.
      if (s.crack) {
        var g = fx.top, c = s.crackAt, grow = clamp01((t - s.crack) / 8);
        for (var r = 0; r < 14; r++) {
          var a = r / 14 * TAU + hash(r, 7) * 0.4, len = (80 + hash(r, 9) * 260) * grow, px = c[0], py = c[1];
          g.lineStyle(3, 0x000000, 0.5);
          for (var sgi = 1; sgi <= 4; sgi++) {
            var nx = c[0] + Math.cos(a + (hash(r, sgi) - 0.5) * 0.3) * len * sgi / 4, ny = c[1] + Math.sin(a + (hash(r, sgi) - 0.5) * 0.3) * len * sgi / 4;
            g.lineStyle(3, 0x000000, 0.45); g.lineBetween(px + 1, py + 1, nx + 1, ny + 1);
            g.lineStyle(1.5, 0xffffff, 0.9); g.lineBetween(px, py, nx, ny);
            px = nx; py = ny;
          }
        }
        for (var ring = 1; ring <= 3; ring++) {
          var rr = ring * 34 * grow, pts = [];
          for (var q = 0; q <= 14; q++) { var aa = q / 14 * TAU; pts.push([c[0] + Math.cos(aa) * rr * (0.8 + hash(q, ring) * 0.4), c[1] + Math.sin(aa) * rr * (0.8 + hash(q, ring + 3) * 0.4)]); }
          g.lineStyle(1.5, 0xffffff, 0.7); poly(g, pts);
        }
        g.fillStyle(0xffffff, 0.08); g.fillCircle(c[0], c[1], 30 * grow);
      }
    }
  };

  // RAMOS — Matrix Multiplication: he grabs them and slams them across the stage in
  // a 3x3 grid, row by column, then flips his hair.
  FG.ULTIMATES.ramos = {
    start: function (fx) {
      var dir = fx.dir, c3 = fx.x0 + dir * 70, lo = C.WALL_L + 40, hi = C.WALL_R - 40;
      var cols = [c3 - dir * 180, c3 - dir * 90, c3].map(function (x) { return Math.max(lo, Math.min(hi, x)); });
      // Row by row, back and forth (a snake), ending on the third column.
      fx.s.cells = [];
      [[0, 1, 2], [2, 1, 0], [0, 1, 2]].forEach(function (order, r) { order.forEach(function (c) { fx.s.cells.push({ r: r, c: c, x: cols[c] }); }); });
      fx.s.done = 0;
      fx.at(fx.l, fx.x0 + dir * 30, 30);
      fx.pose(fx.l, 'hit_high');
      fx.pose(fx.w, 'grab_x');
      fx.zoom(0.05, (cols[0] + cols[2]) / 2, 60, 240);
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir;
      for (var k = 0; k < 9; k++) {
        var cell = s.cells[k], prev = k ? hits[k - 1] : 4, at = hits[k];
        if (t > prev && t <= at) {
          // Lift them overhead on the way, then slam them down on the cell.
          var u = (t - prev) / (at - prev), from = k ? s.cells[k - 1].x : fx.x0 + dir * 30, x = from + (cell.x - from) * ease(u);
          var side = cell.x >= from ? 1 : -1;
          fx.at(w, x - side * 26, Math.sin(u * Math.PI) * 18);
          fx.face(w, side);
          fx.at(l, x, u < 0.75 ? 70 + Math.sin(u * Math.PI) * 30 : 70 * (1 - (u - 0.75) / 0.25));
          if (t === prev + 1) { fx.pose(w, 'throw_lift'); fx.pose(l, 'juggle'); }
          if (t === at - 3) fx.pose(w, 'throw_slam');
        }
        if (t === at) {
          s.done = k + 1; s.doneT = t;
          fx.hit(l, 'overhead', { strength: 'heavy', hits: k + 1, y: 20, shake: k === 8 ? 0.03 : 0.012 });
          fx.dust(cell.x, 10, 3);
          fx.pose(l, 'down');
          if (k === 2) fx.diagram({ kind: 'matrix', row: 0, col: 2, caption: 'ROW × COLUMN', sub: 'ONE ROW DOWN. TWO TO GO.', at: l, y: 30 });
          if (k === 8) { fx.slow(30, 0.4); fx.flash(0xffd23f, 0.5); }
        }
      }
      if (t === hits[8] + 14) fx.diagram({ kind: 'matrix', row: 2, col: 2, caption: 'AB = PAIN', sub: 'A 3 × 3 MATRIX OF SLAMS.', formula: 'ROW 3 × COLUMN 3', at: l, y: 30 });
      if (t === hits[8] + 20) { fx.at(w, fx.x0, 0); fx.face(w, dir); fx.anim(w, [[1, 'stand'], [8, 'hairflip'], [20, 'hairflip2'], [30, 'hairflip'], [44, 'pump'], [60, 'pump2']]); FG.Sfx.cheer(1); fx.scene.stage.cheer(3, true); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs, cs = 22, x0 = W / 2 - cs * 1.5, y0 = 70;
      // The grid at the top: each slam fills its cell, in order.
      g.fillStyle(0x0d1a12, 0.8); g.fillRect(x0 - 12, y0 - 8, cs * 3 + 24, cs * 3 + 16);
      chalkLine(g, x0 - 6, y0 - 4, x0 - 6, y0 + cs * 3 + 4, CHALK, 2); chalkLine(g, x0 + cs * 3 + 6, y0 - 4, x0 + cs * 3 + 6, y0 + cs * 3 + 4, CHALK, 2);
      for (var k = 0; k < 9; k++) {
        var cell = s.cells[k], cx = x0 + cell.c * cs, cy = y0 + cell.r * cs, on = k < s.done;
        if (on) { g.fillStyle(k === s.done - 1 ? 0xffd23f : 0x7a6a3a, k === s.done - 1 ? 0.6 : 0.35); g.fillRect(cx + 1, cy + 1, cs - 2, cs - 2); }
        fx.text(k, on ? String(k + 1) : '.', cx + cs / 2, cy + cs / 2, on ? 0xffffff : 0x8d93a6, 1.5);
      }
      // The grid on the floor: the cells he slams them into.
      [0, 1, 2].forEach(function (c) {
        var cell = s.cells.filter(function (x) { return x.c === c; })[0];
        fx.gb.lineStyle(2, 0xffd23f, 0.5); fx.gb.strokeRect(cell.x - 40, GY - 2, 80, 8);
      });
    }
  };

  // WILSON — Tenure: time stops; chalkboards from twenty-nine years flicker past,
  // each with its year; then 29 hits, a counter ticking up to 29.
  var YEARS = [1997, 1999, 2001, 2003, 2006, 2008, 2011, 2014, 2016, 2019, 2021, 2024, 2026];
  var BOARD_MATH = ['Y = MX + B', 'A² + B² = C²', "F'(X)", 'SIN²X + COS²X = 1', '√(B² - 4AC)', 'ΣN = N(N+1)/2', '|X| < 3', 'LOG(AB)', '∫ X DX', 'ΔY / ΔX', 'P(A∩B)', 'X = -B / 2A', 'E = MC²'];
  var WIL_P = [['jab_c', 'jab_x'], ['chain_c', 'chain_x'], ['whip_c', 'whip_x'], ['sine_a', 'sine_x'], ['dist_c', 'dist_x'], ['low_c', 'low_x'], ['hv_c', 'hv_x']];
  FG.ULTIMATES.wilson = {
    start: function (fx) {
      fx.at(fx.l, fx.x0 + fx.dir * 46, 0);
      fx.pose(fx.l, fx.strikePose(fx.l));
      fx.pose(fx.w, 'stare');
      fx.zoom(0.14, fx.x0 + fx.dir * 24, 80, 70);
      fx.s.n = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === 2) FG.Sfx.chalk();
      if (t < 76 && t % 6 === 0) FG.Sfx.chalk();
      if (t === 76) { fx.zoom(0.08, fx.x0 + fx.dir * 30, 60, 160); fx.pose(fx.l, 'hit_mid'); }
      for (var k = 0; k < hits.length; k++) {
        var p = WIL_P[k % WIL_P.length];
        if (t === hits[k] - 2) fx.anim(w, [[1, p[0]], [2, p[1]], [4, p[1]]]);
        if (t === hits[k]) {
          s.n = k + 1; s.nT = t;
          var last = k === hits.length - 1;
          fx.hit(l, last ? 'power' : k % 3 ? 'jab' : 'body', { strength: last ? 'heavy' : 'light', hits: k + 1, ch: last, shake: last ? 0.03 : 0.003, y: 46 + (k % 4) * 9 });
          fx.pose(l, last ? 'juggle' : k % 2 ? 'hit_high' : 'hit_mid');
          if (k === 9) fx.diagram({ kind: 'triangles', caption: 'EVERY SUBJECT', sub: 'GEOMETRY. ALGEBRA. CALCULUS. ALL OF IT.' });
          if (last) { fx.slow(36, 0.35); fx.flash(0xffd23f, 0.6); }
        }
      }
      if (t > hits[0] && t < hits[hits.length - 1]) fx.at(l, fx.px(l) + fx.dir * 0.12, null);
      var end = hits[hits.length - 1];
      if (t > end) {
        var u = Math.min(1, (t - end) / 40), from = s.from || (s.from = fx.px(l)), to = fx.x0 + fx.dir * w.def.ultimate.end.gap;
        fx.at(l, from + (to - from) * u, Math.sin(u * Math.PI) * 46);
        if (u >= 1 && !s.down) { s.down = true; fx.pose(l, 'down'); fx.dust(to, 8, 2); }
      }
      if (t === end + 14) fx.diagram({ kind: 'integral', caption: 'TENURE', sub: 'THE AREA UNDER TWENTY-NINE YEARS.', formula: '∫ 1997 → 2026' });
      if (t === end + 24) fx.anim(w, [[1, 'stand'], [14, 'folded'], [60, 'folded']]);
    },
    draw: function (fx, t) {
      var g = fx.gs, s = fx.s;
      // Time stops: everything goes purple and still; chalkboards flicker past.
      if (t < 80) {
        g.fillStyle(0x2a1240, 0.45); g.fillRect(0, 0, W, H);
        var k = Math.floor(t / 6) % YEARS.length, flick = t % 6 < 4;
        if (flick) {
          var bx = 70 + hash(k, 1) * (W - 300), by = 66 + hash(k, 2) * 110, bw = 160, bh = 84;
          g.fillStyle(0x6b4a2a, 1); g.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
          g.fillStyle(BOARD, 0.95); g.fillRect(bx, by, bw, bh);
          for (var sm = 0; sm < 3; sm++) { g.fillStyle(0xffffff, 0.04); g.fillEllipse(bx + hash(k, sm + 3) * bw, by + hash(k, sm + 6) * bh, 60, 18); }
          fx.text(0, String(YEARS[k]), bx + bw / 2, by + 20, 0xffd23f, 3, -3);
          fx.text(1, BOARD_MATH[k % BOARD_MATH.length], bx + bw / 2, by + 56, CHALK, 1.5, -2);
        }
        fx.text(2, 'TIME OUT', W / 2, 300, 0xd6b0ff, 2, 0, t % 30 < 22 ? 1 : 0.5);
      }
      // The count: up to 29.
      if (s.n) {
        var sc = s.n === 29 ? 5 * stamp(t, s.nT) : 4 + (t - s.nT < 3 ? 1 : 0);
        fx.text(3, String(s.n), W / 2 + 40, 92, s.n === 29 ? 0xffd23f : 0xffffff, sc, -4);
        fx.text(4, s.n === 29 ? 'YEARS' : 'HITS', W / 2 + 40, 128, 0xd6b0ff, 2, -4);
      }
    }
  };
})();
