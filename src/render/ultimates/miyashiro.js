// MIYASHIRO — System of Equations: two glowing lines draw across the stage from
// opposite corners, and a copy of him charges down each one. They hit the opponent
// exactly where the lines intersect. SOLUTION FOUND stamps the screen.
// Camera: locked off, wide and perfectly level (he's already worked it out), then a
// snap zoom on the point of intersection and a slow pull back.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var GRID = 6, LINES = [18, 34], SPLIT = 52, CHARGE = 62, STAMP = 118, MERGE = 150;
  var CYAN = 0x5fd7ff, MAGENTA = 0xff5fd2, PX = 60; // the intersection: their chest
  var REACH = 290, RISE = 190;

  // The two lines: from the top corners, down through the point, into the floor.
  function lineAt(side, u) { // side -1: from the back corner, +1: from the front corner; u 0 (corner) .. 1 (point)
    return [side * REACH * (1 - u), PX + RISE * (1 - u)];
  }

  // A copy of him diving down a line, tilted to its slope, ringed in its colour.
  function drawCopy(fx, gBack, gFront, s, h, side, col, t) {
    var w = fx.w, p = fx.P(s, h + 40), facing = side > 0 ? -fx.dir : fx.dir, ang = Math.atan2(RISE, REACH) * facing; // tilted down its line
    [[-2, 0], [2, 0], [0, -2], [0, 2]].forEach(function (o) {
      gBack.save(); gBack.translateCanvas(p.x + o[0], p.y + o[1]); gBack.rotateCanvas(ang); gBack.translateCanvas(-p.x - o[0], -p.y - o[1]);
      fx.figure(gBack, w, 'dive', s + o[0] * fx.dir, h - o[1], { flash: col, facing: facing });
      gBack.restore();
    });
    gFront.save(); gFront.translateCanvas(p.x, p.y); gFront.rotateCanvas(ang); gFront.translateCanvas(-p.x, -p.y);
    fx.figure(gFront, w, 'dive', s, h, { facing: facing });
    gFront.restore();
  }

  FG.ULTIMATES.miyashiro = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0); s.sl = s.sw + 70;
      fx.place(fx.l, s.sl, 0); fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [6, 'sleeve'], [14, 'sleeve2'], [22, 'sleeve'], [30, 'idle']]);
      fx.cam(s.sl, 126, 1.0, { k: 0.15 });
      s.k1 = 0; s.k2 = 0; s.u = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === GRID) fx.sfx(function (S) { [523, 784, 1047].forEach(function (f, i) { S.osc({ dur: 0.6, f0: f, gain: 0.035, type: 'triangle', at: i * 0.05, attack: 0.02 }); }); });
      // The lines draw themselves, one from each corner.
      [0, 1].forEach(function (n) {
        var at = LINES[n];
        if (t === at) fx.sfx(function (S) { S.osc({ dur: 0.45, f0: 300, f1: 1400, gain: 0.05, type: 'sawtooth', pan: n ? 0.7 : -0.7 }); S.osc({ dur: 0.45, f0: 600, f1: 2800, gain: 0.03, pan: n ? 0.7 : -0.7 }); });
        if (t >= at && t <= at + 14) s['k' + (n + 1)] = (t - at) / 14;
      });
      // He's gone; there are two of him, one at the top of each line.
      if (t === SPLIT) {
        w._hidden = true; s.split = t;
        fx.dust(fx.px(w), 10, 2);
        fx.sfx(function (S) { S.osc({ dur: 0.2, f0: 1200, f1: 600, gain: 0.06, type: 'square', pan: -0.6 }); S.osc({ dur: 0.2, f0: 1200, f1: 600, gain: 0.06, type: 'square', pan: 0.6, at: 0.03 }); });
      }
      if (t === CHARGE) fx.sfx(function (S) {
        S.noise({ dur: 0.62, freq: 400, f1: 4000, q: 1.2, gain: 0.18, pan: -0.9, attack: 0.4 });
        S.noise({ dur: 0.62, freq: 420, f1: 4200, q: 1.2, gain: 0.18, pan: 0.9, attack: 0.4 });
      });
      if (t >= CHARGE && t <= hits[0]) s.u = Math.pow((t - CHARGE) / (hits[0] - CHARGE), 2.2);
      // Exactly at the intersection.
      if (t === hits[0] || t === hits[1]) {
        var first = t === hits[0];
        fx.hit(l, first ? 'power' : 'launch', { ch: !first, hits: first ? 1 : 2, shake: first ? 0.015 : 0.035, y: PX });
        if (first) {
          s.impact = t; fx.pose(l, 'hit_high');
          fx.flash(0xffffff, 0.9); fx.slow(40, 0.2);
          fx.cam(s.sl, PX, 1.9, { cut: true });
          fx.sfx(function (S) { S.osc({ dur: 1.0, f0: 880, gain: 0.07 }); S.osc({ dur: 1.0, f0: 1320, gain: 0.05 }); S.osc({ dur: 0.6, f0: 120, f1: 30, gain: 0.9 }); S.noise({ dur: 0.3, freq: 2000, q: 0.6, gain: 0.35 }); });
        } else fx.pose(l, 'juggle');
      }
      if (t > hits[1] && !s.down) {
        var v = Math.min(1, (t - hits[1]) / 44);
        fx.place(l, s.sl + 12 * Math.sin(v * Math.PI), Math.sin(v * Math.PI) * 56 + (1 - v) * 10);
        l._drawRot = -fx.dir * v * Math.PI * 2; // a full turn on the way down
        if (v >= 1) { s.down = true; l._drawRot = 0; fx.pose(l, 'down'); fx.place(l, s.sl, 0); fx.dust(fx.px(l), 8, 2); fx.shake(0.01); }
      }
      if (t > hits[1]) {
        if (t === hits[1] + 16) fx.cam(s.sl, 110, 1.15, { k: 0.05 });
      }
      if (t === STAMP) {
        s.stamp = t;
        fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 90, f1: 40, gain: 0.7 }); S.noise({ dur: 0.1, freq: 1500, q: 0.6, gain: 0.3 }); [523, 659, 784, 1047].forEach(function (f, i) { S.osc({ dur: 0.25, f0: f, gain: 0.04, type: 'square', at: 0.15 + i * 0.08 }); }); });
      }
      // The copies slide back together into him.
      if (t === MERGE) { s.merge = t; }
      if (t === MERGE + 20) { w._hidden = false; fx.place(w, s.sw, 0); fx.face(w, fx.dir); fx.anim(w, [[1, 'stand'], [14, 'bow'], [44, 'bow'], [56, 'stand']]); fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 600, f1: 1200, gain: 0.05, type: 'triangle' }); }); }
    },
    draw: function (fx, t) {
      var s = fx.s, gb = fx.gb, gf = fx.gf, fade = t > MERGE + 30 ? Math.max(0, 1 - (t - MERGE - 30) / 24) : 1;
      if (fade <= 0) return;
      // Graph paper over the stage, axes through them.
      var ga = Math.min(1, (t - GRID) / 10) * fade, sl = s.sl;
      if (ga > 0) {
        fx.fill(gb, 0x0a1830, 0.55 * ga);
        for (var gx = -16; gx <= 16; gx++) fx.line(gb, sl + gx * 30, -60, sl + gx * 30, 330, 0x5fd7ff, 1, (gx % 5 ? 0.12 : 0.3) * ga);
        for (var gy = -2; gy <= 11; gy++) fx.line(gb, sl - 500, gy * 30, sl + 500, gy * 30, 0x5fd7ff, 1, (gy % 5 ? 0.12 : 0.3) * ga);
        fx.line(gb, sl - 500, PX, sl + 500, PX, 0xffffff, 2, 0.5 * ga);
        fx.line(gb, sl, -60, sl, 330, 0xffffff, 2, 0.5 * ga);
      }
      // The two lines, glowing, and their equations.
      [[s.k1, -1, CYAN, 'Y = 2X + 1'], [s.k2, 1, MAGENTA, 'Y = -X + 7']].forEach(function (L, n) {
        if (L[0] <= 0) return;
        var k = L[0];
        var pts = []; for (var i = 0; i <= 20; i++) { var q = lineAt(L[1], 1.45 * i / 20 * k); pts.push([fx.X(sl + q[0]), GY - q[1]]); }
        gb.setAlpha(fade);
        K.stroke(gb, pts, L[2], 3 + (s.u > 0 ? s.u * 3 : 0), 1);
        gb.setAlpha(1);
        var lab = lineAt(L[1], 0.3);
        if (k >= 1) fx.wtext(1 + n, L[3], sl + lab[0], lab[1] + 18, L[2], 1.6, 0, fade);
      });
      // The copies, charging down their lines.
      if (s.split && t < (s.impact || 1e9) + 4) {
        [[-1, CYAN], [1, MAGENTA]].forEach(function (c) {
          var p = lineAt(c[0], Math.min(1, s.u * 0.96)), shake = t < CHARGE ? Math.sin(t * 2) * 0.6 : 0;
          drawCopy(fx, fx.gg, gf, sl + p[0] + shake, p[1] - 40, c[0], c[1], t);
          // Streaks behind them.
          if (s.u > 0) for (var tr = 1; tr <= 4; tr++) { var q = lineAt(c[0], Math.max(0, s.u * 0.96 - tr * 0.05)); fx.circle(fx.gg, sl + q[0], q[1], 6 - tr, c[1], 1); }
        });
      }
      // The point of intersection.
      if (s.impact) {
        var age = t - s.impact, pt = fx.P(sl, PX), r = 8 + Math.min(age, 12) * 2;
        gf.lineStyle(3, 0xffffff, Math.max(0, 1 - age / 60) * fade); gf.strokeCircle(pt.x, pt.y, r);
        gf.fillStyle(0xffffff, Math.max(0, 1 - age / 30)); gf.fillCircle(pt.x, pt.y, 5);
        if (age < 70) fx.wtext(3, '(2, 5)', sl + 46, PX - 22, 0xffffff, 2, 0, Math.max(0, 1 - Math.max(0, age - 50) / 20));
      }
      // The copies merge back: two dots sliding into one.
      if (s.merge && t < MERGE + 20) {
        var m = (t - MERGE) / 20;
        [-1, 1].forEach(function (side) { fx.circle(fx.gf, s.sw + side * 60 * (1 - m), 50, 5, side < 0 ? CYAN : MAGENTA, 1 - m * 0.5); });
      }
      if (s.stamp) {
        var sc = K.stamp(t, s.stamp), al = Math.max(0, 1 - Math.max(0, t - s.stamp - 70) / 20), cx = W / 2 + 40, cy = 120, g = fx.gs;
        g.fillStyle(0x062a1a, 0.6 * al); g.fillRect(cx - 164 * sc, cy - 26 * sc, 328 * sc, 52 * sc);
        g.lineStyle(5 * sc, 0x39ff9a, al); g.strokeRect(cx - 164 * sc, cy - 26 * sc, 328 * sc, 52 * sc);
        g.lineStyle(2 * sc, 0x39ff9a, al); g.strokeRect(cx - 156 * sc, cy - 19 * sc, 312 * sc, 38 * sc);
        fx.text(0, 'SOLUTION FOUND', cx, cy, 0x39ff9a, 3 * sc, 0, al);
        if (t - s.stamp > 10) fx.text(4, 'X = 2   Y = 5', cx, cy + 40, 0xffffff, 2, 0, al);
      }
    }
  };
})();
