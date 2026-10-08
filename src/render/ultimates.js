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
      gb: scene.finBack, gf: scene.finFront, gs: scene.finScreen, top: scene.ultTop,
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
      strikePose: function (who) {
        var mv = who.lastMove;
        if (!mv || !mv.anim) return 'hit_mid';
        var k = mv.anim.filter(function (a) { return a[0] >= mv.startup; })[0] || mv.anim[mv.anim.length - 1];
        return k[1];
      }
    };
    return fx;
  };

  // How big a stamp is `t - at` frames after it slams down.
  function stamp(t, at) { var u = clamp01((t - at) / 6); return 1 + (1 - u) * (1 - u) * 2.5; }
  // Clear the screen-only placement of both fighters (the cinematic is over).
  FG.clearUltimateDraw = function (f) {
    f.forEach(function (fi) { fi._override = null; fi._drawX = null; fi._drawY = null; fi._drawRot = null; fi._drawFacing = null; fi._hidden = false; fi._drawBehind = false; fi._props = null; });
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

  // --- The eight ultimates ---------------------------------------------------------

  FG.ULTIMATES = {};

  // BRINKHUS — Order of Operations: six hits in PEMDAS order, a letter for each,
  // the last (Subtraction) a launch that takes away the ground under them.
  var PEMDAS = [
    { l: 'P', word: 'PARENTHESES', c: 'jab_c', x: 'jab_x', kind: 'jab', react: 'hit_high' },
    { l: 'E', word: 'EXPONENTS', c: 'up_c', x: 'up_x', kind: 'launch', react: 'hit_high', lift: 26 },
    { l: 'M', word: 'MULTIPLICATION', c: 'cross_c', x: 'cross_x', kind: 'power', react: 'hit_mid' },
    { l: 'D', word: 'DIVISION', c: 'ham_c', x: 'ham_x', kind: 'overhead', react: 'hit_low' },
    { l: 'A', word: 'ADDITION', c: 'long_c', x: 'long_x', kind: 'body', react: 'hit_mid' },
    { l: 'S', word: 'SUBTRACTION', c: 'up_c', x: 'up_x', kind: 'launch', react: 'juggle' }
  ];
  FG.ULTIMATES.brinkhus = {
    start: function (fx) {
      fx.at(fx.l, fx.x0 + fx.dir * 44, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [10, 'nod'], [24, 'idle']]);
      fx.zoom(0.12, fx.x0 + fx.dir * 22, 60, 200);
      fx.s.lit = -1;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, hits = w.def.ultimate.hits, s = fx.s;
      for (var k = 0; k < 6; k++) {
        var h = PEMDAS[k], at = hits[k];
        if (t === at - (k === 5 ? 18 : 6)) fx.strike(w, h.c, h.x, k === 5 ? 18 : 6, k === 5 ? 30 : 8);
        if (t === at) {
          s.lit = k; s.litT = t;
          fx.hit(l, h.kind, { strength: k === 5 ? 'heavy' : 'medium', hits: k + 1, ch: k === 5, shake: k === 5 ? 0.02 : 0.008 });
          fx.pose(l, h.react);
          if (k === 1) fx.diagram({ kind: 'force', angle: -Math.PI / 2, caption: 'E: EXPONENTS', sub: 'THE FORCE GOES UP. SO DO YOU.', formula: 'F = MA^2' });
          if (k === 5) { fx.slow(34, 0.35); fx.flash(0xffd23f, 0.5); }
        }
      }
      // Exponents lifts them a little; Subtraction takes the floor away.
      if (t > hits[1] && t < hits[1] + 16) fx.at(l, null, Math.sin((t - hits[1]) / 16 * Math.PI) * 26);
      if (t === hits[1] + 16) fx.at(l, null, 0);
      if (t > hits[5]) {
        var u = (t - hits[5]) / (w.def.ultimate.len - hits[5]);
        fx.at(l, fx.x0 + fx.dir * (44 + 52 * u), 70 * u + 130 * Math.sin(u * Math.PI));
      }
      if (t === hits[5] + 30) fx.diagram({ kind: 'parabola', caption: 'S: SUBTRACTION', sub: 'SUBTRACT ONE FLOOR.', formula: 'Y = -X² + BX' });
      if (t === hits[5] + 40) fx.anim(w, [[1, 'up_r'], [12, 'stand'], [24, 'thumb']]);
    },
    draw: function (fx, t) {
      // P E M D A S across the top: each letter lights up and stays lit.
      var s = fx.s, x0 = W / 2 - 5 * 26;
      for (var k = 0; k < 6; k++) {
        var on = s.lit >= k, sc = on && s.lit === k ? stamp(t, s.litT) * 3 : 3;
        fx.text(k, PEMDAS[k].l, x0 + k * 52, 82, on ? (k === 5 ? 0xff6a3d : 0xffd23f) : 0x5a5a6a, sc, -4, on ? 1 : 0.6);
      }
      if (s.lit >= 0 && t - s.litT < 40) fx.text(6, PEMDAS[s.lit].word, W / 2, 112, 0xffffff, 2, -4, Math.min(1, (40 - (t - s.litT)) / 10));
    }
  };

  // CHAI — Circle Theorem: a full 360-degree sidestep around them, a kick from every
  // sixth of the circle, the circle and its radius drawn behind, an arc kick to end.
  var ORBIT = { from: 24, to: 144 };
  var CHAI_KICKS = [['rk_c', 'rk_x'], ['tk_c', 'tk_x'], ['hk_c', 'hk_x'], ['bk_c', 'bk_x'], ['tangent_c', 'tangent_x']];
  var RADIANS = ['Π/3', '2Π/3', 'Π', '4Π/3', '5Π/3'];
  FG.ULTIMATES.chai = {
    start: function (fx) {
      fx.s.R = Math.max(54, Math.abs(fx.lx0 - fx.x0));
      fx.s.cx = fx.x0 + fx.dir * fx.s.R;
      fx.at(fx.l, fx.s.cx, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.pose(fx.w, 'sidestep');
      fx.zoom(0.1, fx.s.cx, 60, 220);
    },
    // Her angle around the circle (0 = where she started, a full turn by ORBIT.to).
    theta: function (t) { return TAU * clamp01((t - ORBIT.from) / (ORBIT.to - ORBIT.from)); },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir;
      if (t >= ORBIT.from && t <= ORBIT.to + 4) {
        var th = this.theta(t), x = s.cx - dir * s.R * Math.cos(th);
        fx.at(w, x, 0);
        fx.face(w, x < s.cx ? 1 : -1);
        w._drawBehind = Math.sin(th) > 0.15; // the far side of the circle
        w._drawScale = 1 - 0.1 * Math.max(0, Math.sin(th));
        l._drawFacing = x < s.cx ? -1 : 1; // they turn to follow her
      }
      for (var k = 0; k < 5; k++) {
        if (t === hits[k] - 5) fx.strike(w, CHAI_KICKS[k][0], CHAI_KICKS[k][1], 5, 8);
        if (t === hits[k]) {
          fx.hit(l, k % 2 ? 'power' : 'body', { strength: 'medium', hits: k + 1, y: 40 + (k % 3) * 14 });
          fx.pose(l, k % 2 ? 'hit_high' : 'hit_mid');
          s.mark = k; s.markT = t;
          if (k === 2) fx.diagram({ kind: 'inscribed', caption: 'INSCRIBED ANGLE', sub: 'EVERY ANGLE ON THE CIRCLE SEES YOU.' });
        }
        if (t === hits[k] + 12) fx.pose(w, 'sidestep');
      }
      if (t === ORBIT.to + 6) { w._drawBehind = false; w._drawScale = null; fx.face(w, dir); fx.anim(w, [[1, 'squat'], [12, 'flip_c'], [32, 'flip_x'], [46, 'flip_x'], [60, 'flip_r'], [74, 'stand']]); }
      // The arc kick: up, over and down on them.
      if (t > ORBIT.to + 10 && t < hits[5] + 14) fx.at(w, null, Math.sin((t - ORBIT.to - 10) / (hits[5] + 14 - ORBIT.to - 10) * Math.PI) * 54);
      if (t === hits[5]) {
        fx.hit(l, 'overhead', { ch: true, hits: 6, shake: 0.02 });
        fx.pose(l, 'juggle'); fx.slow(30, 0.4); fx.flash(0xff9a3d, 0.5);
        s.arcT = t;
      }
      if (t > hits[5]) {
        var u = clamp01((t - hits[5]) / 40), endX = fx.x0 + dir * w.def.ultimate.end.gap;
        fx.at(l, s.cx + (endX - s.cx) * u, Math.sin(u * Math.PI) * 50);
        if (u >= 1 && !s.down) { s.down = true; fx.pose(l, 'down'); fx.dust(endX, 8, 2); }
      }
      if (t === hits[5] + 14) { fx.at(w, null, 0); fx.diagram({ kind: 'circle', caption: 'CIRCLE THEOREM', sub: 'ALL POINTS THE SAME DISTANCE FROM THE PAIN.', r: 70 }); }
      if (t === hits[5] + 30) fx.anim(w, [[1, 'stand'], [14, 'bow'], [40, 'bow']]);
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb, scene = fx.scene;
      if (t < ORBIT.from - 10) return;
      // The circle she runs, drawn as she goes, its centre and radius to her.
      var cx = s.cx, cy = GY - 6, r = s.R, th = this.theta(Math.min(t, ORBIT.to)), fade = t > fx.w.def.ultimate.hits[5] + 40 ? 0.4 : 1;
      var pts = [];
      for (var i = 0; i <= 48; i++) { var a = th * i / 48; pts.push([cx - fx.dir * r * Math.cos(a), cy - r * 0.32 * Math.sin(a)]); }
      g.setAlpha(fade);
      stroke(g, pts, 0xffd23f, 3, 1);
      dot(g, cx, cy, 3, 0xffffff);
      var hx = cx - fx.dir * r * Math.cos(th), hy = cy - r * 0.32 * Math.sin(th);
      if (t <= ORBIT.to + 6) { chalkLine(g, cx, cy, hx, hy, 0xffffff, 2); var sp = fx.at2(fx.w, 0); fx.text(0, 'R', (fx.sx(cx) + sp[0]) / 2, fx.sy(cy) - 14, 0xffffff, 2); }
      // Each kick marks its angle on the circle.
      for (var k = 0; k <= Math.min(4, s.mark == null ? -1 : s.mark); k++) {
        var ak = TAU * (k + 1) / 6, mx = cx - fx.dir * r * Math.cos(ak), my = cy - r * 0.32 * Math.sin(ak);
        dot(g, mx, my, 3, 0xff9a3d);
        fx.text(1 + k, RADIANS[k], fx.sx(mx), fx.sy(my) + 14, 0xff9a3d, 1.5, 0, s.mark === k ? Math.min(1, (t - s.markT) / 4) : 0.8);
      }
      // The giant circle on screen for the finish.
      if (s.arcT && t >= s.arcT) {
        var u = clamp01((t - s.arcT) / 14), sc = fx.sx(cx), scy = fx.sy(GY - 76), R = 100;
        chalkArc(fx.gs, sc, scy, R, -Math.PI / 2, -Math.PI / 2 + TAU * u, 0xffd23f, 4);
        if (u >= 1) { chalkLine(fx.gs, sc, scy, sc + R * 0.8, scy - R * 0.6, 0xffffff, 3); fx.text(6, 'R', sc + R * 0.4 + 10, scy - R * 0.3 - 14, 0xffffff, 3); fx.text(7, 'C = 2ΠR', sc, scy - R - 14, 0xffd23f, 2); }
      }
    }
  };

  // DALSASS — Two-Column Proof: the screen splits into STATEMENTS | REASONS, every
  // hit proves a line, and the last stamps the conclusion.
  var PROOF = [
    ['YOU ATTACKED', 'GIVEN'],
    ['YOU LEFT AN OPENING', 'DEF. OF A WHIFF'],
    ['∠ GUARD ≅ ∠ ZERO', 'VERTICAL ANGLES'],
    ['YOU ≅ DIZZY', 'S.A.S.'],
    ['∴ YOU LOSE.', 'BY CONTRADICTION']
  ];
  var DAL_HITS = [['jab_c', 'jab_x', 'jab', 'hit_high'], ['feint_c', 'drop_x', 'overhead', 'hit_low'], ['pw_palm_c', 'pw_palm', 'body', 'hit_mid'], ['axe_c', 'axe_x', 'overhead', 'hit_high'], ['spin', 'hv_x', 'power', 'juggle']];
  FG.ULTIMATES.dalsass = {
    start: function (fx) {
      fx.at(fx.l, fx.x0 + fx.dir * 46, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [8, 'point'], [30, 'point'], [36, 'idle']]);
      fx.zoom(0.08, fx.x0 + fx.dir * 24, 50, 260);
      fx.s.lines = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      for (var k = 0; k < 5; k++) {
        var h = DAL_HITS[k], lead = k === 4 ? 20 : k === 1 ? 10 : 6;
        if (t === hits[k] - lead) {
          if (k === 1) fx.anim(w, [[1, 'feint_c'], [5, 'feint_x'], [8, 'idle'], [10, 'drop_x'], [18, 'drop_x']]); // a feint first
          else fx.strike(w, h[0], h[1], lead, 10);
        }
        if (t === hits[k]) {
          fx.hit(l, h[2], { strength: k === 4 ? 'heavy' : 'medium', hits: k + 1, ch: k === 4, shake: k === 4 ? 0.02 : 0.008 });
          fx.pose(l, h[3]);
          s.lines = k + 1; s.lineT = t;
          FG.Sfx.chalk();
          if (k === 2) fx.diagram({ kind: 'triangles', caption: 'CONGRUENT', sub: 'SAME SIDES. SAME ANGLES. SAME RESULT.' });
          if (k === 4) { fx.slow(30, 0.4); fx.shake(0.02); }
        }
      }
      if (t === hits[3] + 10) fx.diagram({ kind: 'angles', caption: 'VERTICAL ANGLES', sub: 'OPPOSITE ANGLES ARE CONGRUENT. SO ARE WE.' });
      if (t > hits[4]) { var u = clamp01((t - hits[4]) / 36); fx.at(l, fx.x0 + fx.dir * (46 + 30 * u), Math.sin(u * Math.PI) * 40); }
      if (t === hits[4] + 36) { fx.pose(l, 'down'); fx.dust(fx.px(l), 8, 2); }
      if (t === hits[4] + 8) { FG.Sfx.play({ type: 'hit', move: { strength: 'heavy' }, impact: 'overhead', hits: 1 }); fx.scene.stage.cheer(3, true); }
      if (t === hits[4] + 24) fx.anim(w, [[1, 'wag'], [10, 'wag2'], [20, 'wag'], [30, 'wag2']], true);
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      // The split: a line drops down the middle, then the two columns.
      // The table sits right of the combo counter.
      var u = clamp01((t - 2) / 14), top = 62, rowH = 18, bh = 28 + rowH * 5, x0 = 166, x1 = W - 12, mid = (x0 + x1) / 2;
      var cl = (x0 + mid) / 2, cr = (mid + x1) / 2;
      g.fillStyle(0x0d1a12, 0.82 * u); g.fillRect(x0, top, x1 - x0, bh * u);
      g.lineStyle(2, CHALK, 0.9 * u); g.strokeRect(x0, top, x1 - x0, bh * u);
      chalkLine(g, mid, top, mid, top + bh * u, CHALK, 3);
      if (u < 1) return;
      chalkLine(g, x0 + 6, top + 26, x1 - 6, top + 26, CHALK, 2);
      fx.text(0, 'STATEMENTS', cl, top + 13, 0xffd23f, 2);
      fx.text(1, 'REASONS', cr, top + 13, 0xffd23f, 2);
      for (var k = 0; k < s.lines; k++) {
        var y = top + 38 + k * rowH, a = k === s.lines - 1 ? clamp01((t - s.lineT) / 6) : 1, last = k === 4;
        if (last) continue; // the conclusion gets the stamp
        fx.text(2 + k, (k + 1) + '. ' + PROOF[k][0], cl, y, CHALK, 1.5, 0, a);
        fx.text(8 + k, PROOF[k][1], cr, y, CHALK_B, 1.5, 0, a);
      }
      if (s.lines >= 5) {
        var sc = stamp(t, s.lineT), yy = top + 38 + 4 * rowH + 6;
        fx.text(6, '∴ YOU LOSE.', cl, yy, 0xff3d3d, 2.4 * sc, -6);
        fx.text(7, PROOF[4][1], cr, yy, CHALK_B, 1.5, 0, clamp01((t - s.lineT - 8) / 6));
        g.lineStyle(3, 0xff3d3d, 0.9); g.strokeRect(cl - 106 * sc, yy - 13 * sc, 212 * sc, 26 * sc);
      }
    }
  };

  // LEE — Geometric Series: every hit twice as fast as the last until he's a blur,
  // "r > 1: DIVERGES", then it all goes off in a cloud of chalk dust.
  var LEE_P = [['jab_c', 'jab_x'], ['cross_c', 'cross_x'], ['body_c', 'body_x'], ['elbow_c', 'elbow_x'], ['knee_c', 'knee_x'], ['rush_c', 'rush_x'], ['lowk_c', 'lowk_x']];
  FG.ULTIMATES.lee = {
    start: function (fx) {
      fx.at(fx.l, fx.x0 + fx.dir * 40, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [8, 'glasses'], [18, 'idle']]);
      fx.zoom(0.12, fx.x0 + fx.dir * 20, 60, 220);
      fx.s.n = 0; fx.s.ghosts = [];
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, last = hits.length - 1;
      for (var k = 0; k < last; k++) {
        var gap = k === 0 ? 8 : Math.max(1, hits[k] - hits[k - 1]), lead = Math.max(1, Math.min(6, Math.round(gap / 3)));
        if (t === hits[k] - lead) fx.strike(w, LEE_P[k % LEE_P.length][0], LEE_P[k % LEE_P.length][1], lead, Math.max(1, gap - lead));
        if (t === hits[k]) {
          s.n = k + 1; s.nT = t;
          fx.hit(l, k % 3 === 2 ? 'body' : 'jab', { strength: 'light', hits: k + 1, shake: 0.004 + k * 0.001, y: 50 + (k % 3) * 10 });
          fx.pose(l, k % 2 ? 'hit_high' : 'hit_mid');
          if (k === 1) fx.diagram({ kind: 'series', caption: 'GEOMETRIC SERIES', sub: 'EACH HIT TWICE AS FAST AS THE LAST.', formula: 'A·R^N, R = 2' });
        }
      }
      // A blur once the hits come every frame or two.
      if (t >= hits[3] && t < hits[last - 1] + 30) s.ghosts.push({ pose: w._pose ? w._pose.slice() : null, x: fx.px(w) + (Math.random() - 0.5) * 16, t: t });
      s.ghosts = s.ghosts.filter(function (gh) { return t - gh.t < 6; });
      if (t > hits[last - 1] && t < hits[last] - 24 && (t % 3 === 0)) {
        fx.anim(w, [[1, LEE_P[t % LEE_P.length][1]], [3, LEE_P[(t + 1) % LEE_P.length][1]]]);
        if (t % 6 === 0) fx.hit(l, 'jab', { strength: 'light', hits: s.n, shake: 0.004 });
        fx.pose(l, t % 2 ? 'hit_high' : 'hit_mid');
      }
      if (t === hits[last - 1] + 6) { s.diverge = t; FG.Sfx.chalk(); }
      if (t === hits[last] - 24) fx.anim(w, [[1, 'fib_c'], [24, 'fib_x'], [50, 'fib_x'], [64, 'fib_r'], [80, 'glasses2']]);
      if (t === hits[last]) {
        fx.hit(l, 'launch', { ch: true, hits: hits.length, shake: 0.03 });
        fx.pose(l, 'juggle'); fx.slow(40, 0.35); fx.flash(0xffffff, 0.9);
        FG.Sfx.boom();
        s.boom = t;
        for (var i = 0; i < 6; i++) fx.dust(fx.px(l) + (i - 3) * 14, 10, 4);
      }
      if (t > hits[last]) { var u = clamp01((t - hits[last]) / (w.def.ultimate.len - hits[last])); fx.at(l, fx.x0 + fx.dir * (40 + 70 * u), 50 * u + 80 * Math.sin(u * Math.PI)); }
      if (t === hits[last] + 20) fx.diagram({ kind: 'series', caption: 'R > 1: DIVERGES', sub: 'THE SUM IS INFINITE. SO IS THE DAMAGE.', formula: 'Σ 2^N = ∞' });
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w, g = fx.gb, hits = w.def.ultimate.hits;
      // Afterimages in his green.
      s.ghosts.forEach(function (gh) {
        if (!gh.pose) return;
        g.setAlpha(0.35 * (1 - (t - gh.t) / 6));
        FG.drawFighter(g, { def: w.def, x: gh.x, y: 0, z: 0, facing: fx.dir, _pose: gh.pose, _twist: 0 }, { flash: 0x39ff5a, noShadow: true, x: gh.x });
      });
      g.setAlpha(1);
      // The terms, doubling.
      if (s.n && !s.boom) {
        var terms = []; for (var k = Math.max(0, s.n - 4); k < s.n; k++) terms.push(String(Math.pow(2, k)));
        fx.text(0, (s.n > 4 ? '... + ' : '') + terms.join(' + ') + ' + ...', W / 2 + 60, 84, 0x39ff5a, 2.5, -3);
      }
      if (s.diverge && !s.boom) fx.text(1, 'R > 1: DIVERGES', W / 2, 120, 0xff4a3d, 3 * stamp(t, s.diverge), -6);
      // The explosion: a ring of chalk dust and a white-out.
      if (s.boom) {
        var u = clamp01((t - s.boom) / 30), p = fx.at2(fx.l, 50);
        fx.gs.fillStyle(0xffffff, 0.5 * (1 - u)); fx.gs.fillCircle(p[0], p[1], 40 + 260 * u);
        fx.gs.lineStyle(6, 0xf2f6ee, 0.8 * (1 - u)); fx.gs.strokeCircle(p[0], p[1], 30 + 300 * u);
        for (var i = 0; i < 18; i++) {
          var a = i / 18 * TAU + hash(i, 3), rr = 20 + 220 * u * (0.6 + hash(i, 5) * 0.6);
          fx.gs.fillStyle(0xe8ece4, 0.6 * (1 - u)); fx.gs.fillCircle(p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr * 0.7, 6 + 10 * u);
        }
        fx.text(2, 'Σ = ∞', W / 2, 96, 0x39ff5a, 4 * stamp(t, s.boom), -4, 1 - clamp01((t - s.boom - 40) / 20));
      }
    }
  };

  // LOPEZ — Fundamental Theorem: a counter. Hit him in the stance and time stops;
  // the derivative and the integral flash up; then the punish.
  FG.ULTIMATES.lopez = {
    start: function (fx) {
      // The opponent is frozen mid-attack.
      fx.pose(fx.l, fx.strikePose(fx.l));
      fx.pose(fx.w, 'parry');
      fx.zoom(0.14, (fx.x0 + fx.lx0) / 2, 60, 240);
      fx.s.freeze = 1;
      FG.Sfx.chalk();
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === 24) s.dT = t;
      if (t === 46) s.iT = t;
      if (t === hits[0] - 8) { s.freeze = 0; fx.strike(w, 'parry', 'counter_x', 8, 14); }
      if (t === hits[0]) {
        fx.hit(l, 'power', { hits: 1, shake: 0.012 });
        fx.pose(l, 'hit_high');
        fx.diagram({ kind: 'derivative', caption: 'THE DERIVATIVE', sub: 'I READ YOUR RATE OF CHANGE.' });
      }
      if (t > hits[0] && t < hits[0] + 20) fx.at(l, fx.lx0 + fx.dir * (t - hits[0]) * 0.8, 0);
      if (t === hits[1] - 30) fx.anim(w, [[1, 'outlier_c'], [30, 'outlier_x'], [48, 'outlier_x'], [64, 'hv_r'], [80, 'crossed']]);
      if (t === hits[1]) {
        fx.hit(l, 'power', { ch: true, hits: 2, shake: 0.03 });
        fx.pose(l, 'juggle'); fx.slow(36, 0.35); fx.flash(0xffffff, 0.7);
        s.punch = t;
      }
      if (t > hits[1]) {
        var u = clamp01((t - hits[1]) / 40), from = fx.lx0 + fx.dir * 16, to = fx.x0 + fx.dir * w.def.ultimate.end.gap;
        fx.at(l, from + (to - from) * u, Math.sin(u * Math.PI) * 50);
        if (u >= 1 && !s.down) { s.down = true; fx.pose(l, 'down'); fx.dust(to, 8, 2); }
      }
      if (t === hits[1] + 16) fx.diagram({ kind: 'integral', caption: 'THE FUNDAMENTAL THEOREM', sub: 'ADD UP EVERY MISTAKE YOU MADE.' });
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      // Time stops: everything goes cold, a clock hand stands still.
      if (s.freeze) {
        g.fillStyle(0x2a3c6a, 0.35); g.fillRect(0, 0, W, H);
        fx.text(0, 'DT → 0', W / 2, 84, 0x9fe0ff, 3, -3, t % 30 < 22 ? 1 : 0.5);
      }
      // Two panels slide in: the derivative on one side, the integral on the other.
      function panel(at, side, title, kind) {
        if (!at || t < at || t > fx.w.def.ultimate.hits[0] + 2) return;
        var u = ease((t - at) / 10), pw = 170, ph = 120, x = side < 0 ? -pw + (pw + 16) * u : W - (pw + 16) * u, y = 120;
        g.fillStyle(BOARD, 0.92); g.fillRect(x, y, pw, ph);
        g.lineStyle(3, 0x6b4a2a, 1); g.strokeRect(x, y, pw, ph);
        var ox = x + 18, oy = y + ph - 18, pts = [];
        chalkLine(g, ox, oy, ox + pw - 36, oy, CHALK, 2); chalkLine(g, ox, oy, ox, y + 18, CHALK, 2);
        for (var i = 0; i <= 20; i++) { var v = i / 20; pts.push([ox + v * (pw - 40), oy - 10 - 60 * v * v]); }
        stroke(g, pts, CHALK, 2, 1);
        if (kind === 'd') { var px = ox + 0.6 * (pw - 40), py = oy - 10 - 60 * 0.36; chalkLine(g, px - 40, py + 30, px + 40, py - 30, CHALK_Y, 2); dot(g, px, py, 3, CHALK_Y); }
        else for (var sx2 = 0.15; sx2 < 0.85; sx2 += 0.06) { g.lineStyle(2, CHALK_Y, 0.5); g.lineBetween(ox + sx2 * (pw - 40), oy, ox + sx2 * (pw - 40), oy - 10 - 60 * sx2 * sx2); }
        fx.text(side < 0 ? 1 : 2, title, x + pw / 2, y - 10, kind === 'd' ? CHALK_Y : CHALK_B, 2, 0, t % 8 < 6 ? 1 : 0.6);
      }
      panel(s.dT, -1, "F'(X)", 'd');
      panel(s.iT, 1, '∫ F(X) DX', 'i');
      if (s.punch && t - s.punch < 50) fx.text(3, 'F(B) - F(A)', W / 2 + 40, 112, 0xffd23f, 3 * stamp(t, s.punch), -4);
    }
  };

  // MIYASHIRO — Imaginary Unit: he vanishes, appears behind them, combos, and
  // multiplying by i twice turns them upside down: i² = −1.
  FG.ULTIMATES.miyashiro = {
    start: function (fx) {
      fx.at(fx.l, fx.lx0, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'rush_x'], [8, 'sleeve'], [18, 'sleeve2']]);
      fx.zoom(0.1, fx.lx0, 60, 230);
      fx.s.bx = fx.lx0 + fx.dir * 70; // behind them
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir;
      if (t === 20) { fx.dust(fx.px(w), 14, 3); w._hidden = true; FG.Sfx.play({ type: 'feint' }); s.gone = t; }
      if (t === 36) { w._hidden = false; fx.at(w, s.bx, 0); fx.face(w, -dir); fx.dust(s.bx, 10, 2); fx.pose(w, 'behind'); s.back = t; FG.Sfx.play({ type: 'parry' }); }
      if (t === 44) fx.face(l, dir); // they turn round, too late
      var P = [['jab_c', 'jab_x', 'jab', 'hit_high'], ['mk_c', 'mk_x', 'body', 'hit_mid'], ['xprod_c', 'xprod_x', 'power', 'hit_high']];
      for (var k = 0; k < 3; k++) {
        if (t === hits[k] - 6) fx.strike(w, P[k][0], P[k][1], 6, 8);
        if (t === hits[k]) {
          fx.hit(l, P[k][2], { strength: 'medium', hits: k + 1 });
          fx.pose(l, P[k][3]);
          if (k === 1) fx.diagram({ kind: 'complex', caption: '× ¡', sub: 'MULTIPLY BY ¡: A QUARTER TURN.', at: l });
        }
      }
      // Up they go, turning over: two quarter turns.
      if (t === hits[2] + 12) { fx.anim(w, [[1, 'spin_c'], [8, 'spin_x'], [20, 'spin_x']]); fx.hit(l, 'launch', { hits: 3, shake: 0.012 }); fx.pose(l, 'hit_high'); }
      if (t > hits[2] + 12 && t <= hits[3]) {
        var u = (t - hits[2] - 12) / (hits[3] - hits[2] - 12);
        fx.at(l, s.bx - dir * 70 + -dir * 10 * u, Math.sin(u * Math.PI) * 90 + (u > 0.5 ? (1 - u) * 20 : 0));
        l._drawRot = Math.PI * ease(u);
      }
      if (t === hits[3] - 10) fx.anim(w, [[1, 'ret_c'], [10, 'ret_x'], [24, 'ret_x']]);
      if (t === hits[3]) {
        fx.hit(l, 'overhead', { ch: true, hits: 4, shake: 0.025 });
        fx.slow(36, 0.35); fx.flash(0x9fe0ff, 0.6);
        s.stamp = t;
      }
      if (t > hits[3]) { fx.at(l, null, 0); l._drawRot = Math.PI; }
      if (t === hits[3] + 12) fx.diagram({ kind: 'complex', half: true, caption: '¡² = -1', sub: 'TWO QUARTER TURNS: UPSIDE DOWN.', formula: '¡ × ¡ = -1', at: l, y: 40 });
      if (t === hits[3] + 30) fx.anim(w, [[1, 'stand'], [14, 'bow'], [40, 'bow']]);
    },
    draw: function (fx, t) {
      var s = fx.s;
      if (s.gone && !s.back) fx.text(0, '¡', fx.sx(fx.x0), fx.sy(GY - 90) - (t - s.gone) * 2, 0x5fd7ff, 4, 0, 1 - (t - s.gone) / 16);
      if (s.stamp) {
        var sc = stamp(t, s.stamp), p = fx.at2(fx.l, 40);
        fx.text(1, '¡² = -1', W / 2 + 50, 92, 0x5fd7ff, 3.5 * (1 + (sc - 1) * 0.5), -6);
        fx.gs.lineStyle(3, 0x5fd7ff, 0.8); fx.gs.strokeCircle(p[0], p[1], 30 * sc);
      }
    }
  };

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
