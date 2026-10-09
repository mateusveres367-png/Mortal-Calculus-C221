// CHAI — Compass Construction: she pulls out a giant drawing compass, plants it next
// to them and spins around them, a kick on every pass, while a glowing perfect circle
// draws itself. A giant protractor snaps into place at 90 degrees, then a final axe
// kick. Afterward she covers her mouth: "Sorry!"
// Camera: an orbit that tilts with her as she circles, dead level and still for the
// protractor, a drop with the axe kick, then a push-in on the apology.
(function () {
  var C = FG.C, W = C.VIEW_W, GY = C.GROUND_Y, K = FG.ultKit, TAU = Math.PI * 2;
  var PLANT = 30, ORBIT = 40, SNAP = 146, LEAP = 168, AXE = 190, SORRY = 212;
  var R = 62, DEPTH = 0.3, HINGE = 150;
  var KICKS = [['rk_c', 'rk_x'], ['tk_c', 'tk_x'], ['hk_c', 'hk_x'], ['bk_c', 'bk_x'], ['tangent_c', 'tangent_x'], ['hk_c', 'hk_x']];
  var GOLD = 0xffd23f, STEEL = 0xc4cad4, STEEL_D = 0x6a717c;

  // Her angle around the circle: half a turn between kicks, slowing into each one.
  function theta(hits, t) {
    if (t <= ORBIT) return Math.PI;
    var prev = ORBIT;
    for (var k = 0; k < 6; k++) {
      if (t <= hits[k]) return Math.PI * (1 + k) + Math.PI * K.ease((t - prev) / (hits[k] - prev));
      prev = hits[k];
    }
    return Math.PI * 7;
  }
  // A point on the circle on the floor, seen from the side: s across, h up (farther is higher).
  function onCircle(cs, a) { return [cs + R * Math.cos(a), R * DEPTH * Math.sin(a)]; }

  // The compass: a knurled handle, a hinge, a steel needle leg and a pencil leg.
  function drawCompass(fx, g, hs, hh, ns, nh, ps, ph) {
    var hinge = fx.P(hs, hh), needle = fx.P(ns, nh), pencil = fx.P(ps, ph);
    g.lineStyle(9, STEEL_D, 1); g.lineBetween(hinge.x, hinge.y, needle.x, needle.y);
    g.lineStyle(6, STEEL, 1); g.lineBetween(hinge.x, hinge.y, needle.x, needle.y);
    // The needle: a sharp point.
    var nx = needle.x - hinge.x, ny = needle.y - hinge.y, nl = Math.sqrt(nx * nx + ny * ny) || 1;
    g.fillStyle(0xe8ecf2, 1); g.fillTriangle(needle.x - ny / nl * 3, needle.y + nx / nl * 3, needle.x + ny / nl * 3, needle.y - nx / nl * 3, needle.x + nx / nl * 10, needle.y + ny / nl * 10);
    // The pencil leg: steel to a clamp, then a yellow pencil with its sharpened tip.
    var mx = hinge.x + (pencil.x - hinge.x) * 0.6, my = hinge.y + (pencil.y - hinge.y) * 0.6;
    g.lineStyle(9, STEEL_D, 1); g.lineBetween(hinge.x, hinge.y, mx, my);
    g.lineStyle(6, STEEL, 1); g.lineBetween(hinge.x, hinge.y, mx, my);
    var tx = hinge.x + (pencil.x - hinge.x) * 0.9, ty = hinge.y + (pencil.y - hinge.y) * 0.9;
    g.lineStyle(9, 0xe0a81e, 1); g.lineBetween(mx, my, tx, ty);
    g.lineStyle(3, 0xffd86a, 1); g.lineBetween(mx, my, tx, ty);
    g.fillStyle(0x3a3a44, 1); g.fillRect(mx - 6, my - 4, 12, 8);
    g.lineStyle(5, 0xe8c99a, 1); g.lineBetween(tx, ty, pencil.x, pencil.y);
    g.fillStyle(0x2a2a2a, 1); g.fillCircle(pencil.x, pencil.y, 2.5);
    // Hinge and handle.
    g.fillStyle(STEEL_D, 1); g.fillCircle(hinge.x, hinge.y, 9);
    g.fillStyle(STEEL, 1); g.fillCircle(hinge.x, hinge.y, 6);
    g.fillStyle(0x2e2e36, 1); g.fillRect(hinge.x - 3, hinge.y - 24, 6, 16);
    for (var k = 0; k < 4; k++) { g.fillStyle(0x55555f, 1); g.fillRect(hinge.x - 3, hinge.y - 22 + k * 4, 6, 1); }
  }

  // The protractor, upright over them: clear plastic, ticks every 10 degrees.
  function drawProtractor(fx, g, cs, scale, alpha, t) {
    var c = fx.P(cs, 0), r = 112 * scale, pts = [];
    for (var i = 0; i <= 36; i++) { var a = Math.PI * i / 36; pts.push({ x: c.x - Math.cos(a) * r, y: c.y - Math.sin(a) * r }); }
    g.fillStyle(0x9fe0ff, 0.22 * alpha); g.fillPoints(pts, true);
    g.lineStyle(3, 0x9fe0ff, 0.9 * alpha); g.strokePoints(pts, true);
    g.lineStyle(1.5, 0x9fe0ff, 0.6 * alpha);
    var r2 = r * 0.72, inner = [];
    for (var j = 0; j <= 36; j++) { var b = Math.PI * j / 36; inner.push({ x: c.x - Math.cos(b) * r2, y: c.y - Math.sin(b) * r2 }); }
    g.strokePoints(inner, false);
    for (var d = 0; d <= 180; d += 10) {
      var ang = d * Math.PI / 180, long = d % 30 === 0 ? 14 : 7;
      g.lineStyle(d % 30 === 0 ? 2 : 1, 0xffffff, 0.85 * alpha);
      g.lineBetween(c.x - Math.cos(ang) * r, c.y - Math.sin(ang) * r, c.x - Math.cos(ang) * (r - long * scale), c.y - Math.sin(ang) * (r - long * scale));
    }
    g.fillStyle(0xffffff, alpha); g.fillCircle(c.x, c.y, 3);
  }

  FG.ULTIMATES.chai = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0);
      s.cs = s.sw + R + 8; // the circle's centre: where they stand (and fall)
      fx.place(fx.l, s.cs, 0); fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'stand'], [8, 'compass_up'], [22, 'compass_up'], [28, 'compass_plant'], [38, 'compass_plant'], [44, 'sidestep']]);
      fx.cam(s.sw + 10, 112, 1.5, { k: 0.2 });
      s.trail = 0; // how much of the circle is drawn (radians)
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === 6) fx.sfx(function (S) { S.osc({ dur: 0.35, f0: 2300, f1: 2700, gain: 0.05, type: 'triangle' }); S.noise({ dur: 0.25, freq: 7000, q: 6, gain: 0.08 }); });
      if (t === PLANT) {
        s.planted = t;
        fx.shake(0.012); fx.dust(fx.X(s.cs - 6), 6, 2);
        fx.sfx(function (S) { S.osc({ dur: 0.18, f0: 140, f1: 60, gain: 0.6 }); S.osc({ dur: 0.8, f0: 330, gain: 0.08, type: 'triangle', vib: [11, 40] }); });
        fx.cam(s.cs, 112, 1.2, { k: 0.12 });
      }
      // Round and round, kicking on every pass.
      if (t >= ORBIT && t <= hits[5] + 2) {
        var a = theta(hits, t), p = onCircle(s.cs, a);
        fx.place(w, p[0], 0);
        w._drawBehind = p[1] > 2;
        w._drawScale = 1 - 0.08 * Math.max(0, Math.sin(a));
        w._drawGround = p[1]; // farther round the circle is higher up the screen
        var wx = fx.X(p[0]), lx = fx.X(s.cs);
        fx.face(w, wx < lx ? 1 : -1);
        l._drawFacing = wx < lx ? -1 : 1;
        s.trail = Math.max(s.trail, a - Math.PI);
        fx.cam(s.cs + (p[0] - s.cs) * 0.25, 112, 1.3, { rot: 0.05 * Math.sin(a), k: 0.15 });
        if (t % 3 === 0) fx.sfx(function (S) { S.noise({ dur: 0.05, freq: 5200, q: 4, gain: 0.05 }); }); // the pencil scratching
        if (s.trail >= TAU && !s.closed) { s.closed = t; fx.sfx(function (S) { S.osc({ dur: 0.7, f0: 1320, gain: 0.07 }); S.osc({ dur: 0.7, f0: 1980, gain: 0.03 }); }); }
      }
      for (var k = 0; k < 6; k++) {
        if (t === hits[k] - 4) fx.strike(w, KICKS[k][0], KICKS[k][1], 4, 6);
        if (t === hits[k]) {
          fx.hit(l, k % 2 ? 'power' : 'body', { strength: 'medium', hits: k + 1, y: 44 + (k % 3) * 14, shake: 0.008 });
          fx.pose(l, k % 2 ? 'hit_high' : 'hit_mid');
          fx.sfx(function (S) { S.noise({ dur: 0.12, freq: 1800, f1: 600, q: 1.2, gain: 0.12 }); });
        }
        if (t === hits[k] + 8 && k < 5) fx.pose(w, 'sidestep');
      }
      // Back on her side; the protractor snaps into place, dead level.
      if (t === hits[5] + 6) { w._drawBehind = false; w._drawScale = null; w._drawGround = 0; fx.face(w, fx.dir); fx.place(w, s.cs - R, 0); fx.pose(w, 'idle'); }
      if (t === SNAP) {
        s.snap = t;
        fx.cam(s.cs, 120, 1.25, { k: 0.5 });
        fx.sfx(function (S) { S.noise({ dur: 0.04, freq: 3000, q: 3, gain: 0.3 }); S.osc({ dur: 0.25, f0: 2600, f1: 2500, gain: 0.06, type: 'triangle' }); S.osc({ dur: 0.1, f0: 900, f1: 500, gain: 0.15, type: 'square' }); });
      }
      if (t === SNAP + 10) fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 880, gain: 0.05, type: 'triangle' }); S.osc({ dur: 0.5, f0: 1100, gain: 0.04, type: 'triangle', at: 0.08 }); });
      // The axe kick, straight down the 90-degree line.
      if (t === LEAP) { fx.anim(w, [[1, 'squat'], [6, 'axe_c'], [22, 'axe_c'], [24, 'axe_x'], [40, 'axe_x'], [52, 'idle']]); fx.sfx(function (S) { S.noise({ dur: 0.3, freq: 500, f1: 2000, q: 0.8, gain: 0.12 }); }); }
      if (t > LEAP && t <= AXE + 6) {
        var u = (t - LEAP) / (AXE - LEAP), up = u < 0.65 ? Math.sin(u / 0.65 * Math.PI / 2) * 74 : 74 * (1 - (u - 0.65) / 0.35);
        fx.place(w, s.cs - R + (R - 26) * Math.min(1, u * 1.4), Math.max(0, up));
        fx.cam(s.cs - 10, 120 + Math.max(0, up) * 0.5, 1.3, { k: 0.3 });
      }
      if (t === AXE) {
        fx.hit(l, 'overhead', { ch: true, hits: 7, shake: 0.03, y: 86 });
        fx.pose(l, 'down');
        fx.flash(0xff9a3d, 0.6); fx.slow(30, 0.35);
        fx.dust(fx.X(s.cs), 10, 3);
        fx.cam(s.cs - 6, 70, 1.5, { k: 0.45, rot: 0.03 });
        fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 110, f1: 28, gain: 0.9 }); S.noise({ dur: 0.25, freq: 1400, q: 0.7, gain: 0.35 }); S.noise({ dur: 0.4, freq: 4000, f1: 1500, q: 2, gain: 0.08, at: 0.05 }); });
        s.axe = t;
      }
      if (t > AXE + 6 && t < SORRY) fx.place(w, s.cs - 26 - (t - AXE - 6) * 0.7, 0);
      // Oops.
      if (t === SORRY) {
        fx.anim(w, [[1, 'oops'], [40, 'oops'], [50, 'sorry'], [58, 'sorry']]);
        w._face = { type: 'wince' };
        fx.say(w, 'Sorry!', 56);
        fx.cam(fx.S(fx.px(w)) + 6, 100, 1.9, { k: 0.15 });
        fx.sfx(function (S) { S.osc({ dur: 0.08, f0: 1200, f1: 1650, gain: 0.07, type: 'triangle' }); S.osc({ dur: 0.1, f0: 1400, f1: 1900, gain: 0.07, type: 'triangle', at: 0.11 }); });
      }
      if (t > SORRY && t < SORRY + 40) fx.place(w, fx.S(fx.px(w)) - (fx.S(fx.px(w)) - s.sw) * 0.08, 0);
      if (t === SORRY + 44) w._face = null;
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w, gb = fx.gb, gf = fx.gf;
      // The compass: in her hands, then planted with its pencil on her.
      if (t < PLANT) {
        // Overhead in both hands, legs opening, then driven down beside them.
        var hand = s.sw + 4, spread = Math.min(1, t / 14) * 20, u = K.ease((t - 22) / (PLANT - 22));
        var hs = hand + (s.cs - hand) * u, hh = 176 + (HINGE - 176) * u + (t < 22 ? Math.sin(t * 0.4) * 3 : 0);
        var ns = hs + (s.cs - hs) * u, nh = (hh - 82) * (1 - u), ps = hs + spread + (s.cs - R - hs - spread) * u, ph = (hh - 80) * (1 - u);
        drawCompass(fx, t < 22 ? gf : gb, hs, hh, ns, nh, ps, ph);
        return;
      }
      var a = t < ORBIT ? Math.PI : theta(fx.w.def.ultimate.hits, Math.min(t, fx.w.def.ultimate.hits[5])), wob = s.planted && t - s.planted < 24 ? Math.sin((t - s.planted) * 1.2) * (24 - (t - s.planted)) * 0.25 : 0;
      var pen = onCircle(s.cs, a), fade = t > AXE + 30 ? Math.max(0, 1 - (t - AXE - 30) / 30) : 1;
      // The circle on the floor, glowing gold where the pencil has been.
      var pts = [], n = Math.max(2, Math.round(48 * Math.min(TAU, s.trail) / TAU));
      for (var i = 0; i <= n; i++) { var b = Math.PI + Math.min(TAU, s.trail) * i / n, q = onCircle(s.cs, b); pts.push([fx.X(q[0]), GY - q[1]]); }
      gb.setAlpha(1);
      if (s.trail > 0 && fade > 0) {
        var glow = s.closed ? 1 + 0.3 * Math.sin(t * 0.4) : 1;
        K.stroke(gb, pts, GOLD, 3 * glow * fade, 1);
        if (s.closed) fx.text(0, 'C = 2ΠR', W / 2, 332, GOLD, 2, 0, fade);
      }
      // The radius: from the needle to the pencil.
      if (t < hitsEnd(fx) + 6) {
        K.chalkLine(gb, fx.X(s.cs), GY, fx.X(pen[0]), GY - pen[1], 0xffffff, 1.5);
        fx.text(1, 'R', fx.sx(fx.X((s.cs + pen[0]) / 2)), fx.sy(GY - pen[1] / 2 - 10), 0xffffff, 1.5);
      }
      // The compass itself: hinge over the needle, the pencil leg reaching to her feet.
      if (fade > 0) {
        var g = gb; // planted just behind them
        g.setAlpha(fade);
        drawCompass(fx, g, s.cs + wob + (pen[0] - s.cs) * 0.15, HINGE + pen[1] * 0.3, s.cs, 0, pen[0], pen[1]);
        g.setAlpha(1);
        if (t < hitsEnd(fx) + 6 && t % 2 === 0) { var sp = fx.P(pen[0], pen[1]); fx.scene.effects.parts.push({ x: sp.x, y: sp.y, vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 1.5, life: 14, size: 2, color: GOLD }); }
      }
      // The protractor: snaps in, 90 degrees marked.
      if (s.snap && t >= s.snap) {
        var u = (t - s.snap) / 6, sc = u < 1 ? 1.35 - 0.35 * u : 1 + Math.sin((t - s.snap - 6) * 0.9) * 0.03 * Math.max(0, 1 - (t - s.snap - 6) / 12);
        var alpha = t > AXE ? Math.max(0, 1 - (t - AXE) / 16) : Math.min(1, u * 2);
        drawProtractor(fx, gb, s.cs, sc, alpha, t);
        var c = fx.P(s.cs, 0), len = 112 * sc * Math.min(1, (t - s.snap - 8) / 10);
        if (len > 0 && alpha > 0) {
          gf.lineStyle(3, 0xff6a3d, alpha); gf.lineBetween(c.x, c.y, c.x, c.y - len);
          gf.lineStyle(2, 0xff6a3d, alpha); gf.strokeRect(c.x + (fx.dir > 0 ? 0 : -12), c.y - 12, 12, 12);
          if (t - s.snap > 16) fx.text(2, '90°', fx.sx(c.x) + 34, fx.sy(c.y - 128 * sc), 0xff6a3d, 3 * K.stamp(t, s.snap + 16), -4, alpha);
        }
      }
      // The axe kick's shock ring.
      if (s.axe && t - s.axe < 20) {
        var p = fx.at2(fx.l, 0), r = 10 + (t - s.axe) * 7;
        fx.gs.lineStyle(4, 0xff9a3d, 1 - (t - s.axe) / 20); fx.gs.strokeEllipse(p[0], p[1], r * 2, r * 0.6);
      }
    }
  };
  function hitsEnd(fx) { return fx.w.def.ultimate.hits[5]; }
})();
