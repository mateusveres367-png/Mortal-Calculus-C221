// RAMOS — Max Incline: cut to a 24-hour gym. He's on a treadmill cranked to max,
// sparks flying, the speed climbing, his bowl cut flapping. He launches off the end
// of the treadmill, smashes back into the stage, and finishes with a flying tackle
// and a slam.
// Camera: handheld and shaking harder as the speed climbs, a push-in on him, then a
// crash zoom on the landing and a heavy shake on the slam.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var GYM = 10, RUN = [14, 120], LAUNCH = 120, BACK = 134, LAND = 148, TACKLE = 158, LIFT = 192, FLIP = 236;
  var DECK = { s1: -96, s2: 70, h: 10 }, RUNNER = -12;
  var SPEEDS = [[14, '6.0'], [36, '9.5'], [56, '14.0'], [76, '19.5'], [94, '25.0'], [108, 'MAX']];

  function level(t) { return Math.max(0, Math.min(1, (t - RUN[0]) / (LAUNCH - RUN[0]))); }
  // The treadmill tilts up about its back end as the incline goes up.
  function tilt(t) { return Math.min(0.2, level(t) * 0.26); }
  function deckPoint(s, h, a) { var ds = s - DECK.s1; return [DECK.s1 + ds * Math.cos(a) - h * Math.sin(a), ds * Math.sin(a) + h * Math.cos(a)]; }

  // The gym at night: neon, racks of weights, flickering strip lights.
  function drawGym(fx, g, t) {
    var hash = K.hash;
    fx.fill(g, 0x1c2230);
    fx.rect(g, -W * 1.6, -90, W * 1.6, 0, 0x16161a);
    for (var m = -14; m < 14; m++) fx.rect(g, m * 40, -90, m * 40 + 38, 0, 0x1b1b20);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 4, 0x2a2a30);
    // Windows: the night outside.
    for (var wi = -2; wi < 2; wi++) { var ws = wi * 150 + 30; fx.rect(g, ws - 3, 87, ws + 123, 163, 0x3a4050); fx.rect(g, ws, 90, ws + 120, 160, 0x0a0f22); fx.rect(g, ws + 58, 90, ws + 62, 160, 0x3a4050); for (var st = 0; st < 5; st++) fx.rect(g, ws + hash(wi, st) * 110, 124 + hash(st, wi) * 30, ws + hash(wi, st) * 110 + 1, 125 + hash(st, wi) * 30, 0xffffff, 0.7); }
    // The neon sign (no names, just the hours), flickering.
    var on = (t % 47 < 44) && (t % 13 !== 0);
    fx.rect(g, -180, 168, -30, 196, 0x0a0a10);
    fx.wtext(5, 'OPEN 24 HRS', -105, 182, on ? 0xff4fd8 : 0x5a2a50, 1.8);
    if (on) { var np = fx.P(-105, 182); g.fillStyle(0xff4fd8, 0.1); g.fillEllipse(np.x, np.y, 190, 60); }
    // Dumbbell racks and a squat rack.
    fx.rect(g, -320, 0, -170, 34, 0x2e2e36); fx.rect(g, -320, 34, -170, 38, 0x4a4a54);
    for (var d = 0; d < 9; d++) { var dsx = -312 + d * 16; fx.rect(g, dsx, 38, dsx + 12, 44, 0x111114); fx.circle(g, dsx + 1, 41, 4, 0x2a2a2e); fx.circle(g, dsx + 11, 41, 4, 0x2a2a2e); }
    fx.rect(g, 160, 0, 166, 150, 0x6a6a74); fx.rect(g, 230, 0, 236, 150, 0x6a6a74); fx.rect(g, 156, 100, 240, 104, 0x8a8a94);
    fx.circle(g, 152, 102, 16, 0x111114); fx.circle(g, 244, 102, 16, 0x111114);
    // Strip lights.
    for (var l = -3; l < 3; l++) { var lit = (t + l * 17) % 61 > 3; fx.rect(g, l * 110 - 40, 204, l * 110 + 40, 209, lit ? 0xe8f4ff : 0x5a6070); if (lit) { var lp = fx.P(l * 110, 204); g.fillStyle(0xe8f4ff, 0.04); g.fillEllipse(lp.x, lp.y + 60, 200, 160); } }
  }

  // The treadmill: a tilting deck with a moving belt, the console and its display.
  function drawTreadmill(fx, g, gf, t, s) {
    var a = tilt(t), lev = level(t);
    var P = function (ps, ph) { var q = deckPoint(ps, ph, a); return [q[0], q[1]]; };
    fx.poly(g, [P(DECK.s1 - 6, 0), P(DECK.s2 + 10, 0), P(DECK.s2 + 10, DECK.h), P(DECK.s1 - 6, DECK.h)], 0x2a2a30);
    fx.poly(g, [P(DECK.s1, DECK.h), P(DECK.s2, DECK.h), P(DECK.s2, DECK.h + 3), P(DECK.s1, DECK.h + 3)], 0x0e0e10);
    // The belt's stripes rush backward.
    var off = (s.belt || 0) % 24;
    for (var b = 0; b < 8; b++) { var bs = DECK.s2 - ((b * 24 + off) % (DECK.s2 - DECK.s1)); var p1 = P(bs, DECK.h + 3), p2 = P(bs - 6, DECK.h + 3); fx.line(g, p1[0], p1[1], p2[0], p2[1], 0x3a3a44, 2); }
    // Rollers, the legs under the front, the console.
    var r1 = P(DECK.s1, DECK.h / 2), r2 = P(DECK.s2, DECK.h / 2);
    fx.circle(g, r1[0], r1[1], 5, 0x4a4a54); fx.circle(g, r2[0], r2[1], 5, 0x4a4a54);
    var front = P(DECK.s2 + 6, 0);
    fx.line(g, front[0], 0, front[0], front[1], 0x4a4a54, 4);
    var post = P(DECK.s2, DECK.h), top = P(DECK.s2 - 8, DECK.h + 86);
    fx.line(gf, post[0], post[1], top[0], top[1], 0x6a6a74, 5);
    var hr = P(DECK.s2 - 50, DECK.h + 64);
    fx.line(gf, top[0], top[1] - 18, hr[0], hr[1], 0x8a8a94, 3);
    // The display: speed, incline.
    var c = fx.P(top[0] - 6, top[1] + 4);
    gf.fillStyle(0x111114, 1); gf.fillRect(c.x - 20, c.y - 14, 40, 22);
    gf.fillStyle(lev > 0.85 && t % 6 < 3 ? 0x5a1010 : 0x0a2a14, 1); gf.fillRect(c.x - 18, c.y - 12, 36, 18);
    // Sparks off the back roller once it's really going.
    if (lev > 0.35 && t < LAUNCH) for (var k = 0; k < 1 + Math.round(lev * 4); k++) {
      var sp = fx.P(r1[0], r1[1]);
      fx.scene.effects.parts.push({ x: sp.x, y: sp.y, vx: -fx.dir * (2 + Math.random() * 4), vy: -1 - Math.random() * 3, life: 14 + Math.random() * 8, size: 2, color: Math.random() < 0.5 ? 0xffd23f : 0xff8a1f, streak: 5 });
    }
    return c;
  }

  FG.ULTIMATES.ramos = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0); s.belt = 0;
      fx.place(fx.l, s.sw + 34, 30); fx.pose(fx.l, 'hit_high');
      fx.pose(fx.w, 'grab_x');
      fx.cam(s.sw + 20, 100, 1.4, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, lev = level(t);
      // The gym.
      if (t === GYM) {
        fx.cutaway = true; s.gym = true; l._hidden = true;
        fx.face(w, fx.dir);
        fx.cam(RUNNER + 20, 70, 1.2, { cut: true });
        fx.flash(0xffffff, 0.8);
        fx.sfx(function (S) { S.osc({ dur: 0.1, f0: 1200, gain: 0.05, type: 'square' }); S.osc({ dur: 0.1, f0: 1600, gain: 0.05, type: 'square', at: 0.12 }); });
      }
      if (s.gym && t >= RUN[0] && t < LAUNCH) {
        var a = tilt(t), q = deckPoint(RUNNER, DECK.h + 3, a), pace = Math.max(3, Math.round(7 - lev * 4));
        fx.place(w, q[0], q[1]);
        if ((t - RUN[0]) % pace === 0) { fx.pose(w, (Math.floor((t - RUN[0]) / pace) % 2) ? 'run1' : 'run2'); fx.sfx(function (S) { S.osc({ dur: 0.05, f0: 140, f1: 70, gain: 0.25 }); }); }
        w._hairFlick = 0.35 + lev * 0.4 + Math.sin(t * (0.6 + lev)) * 0.25;
        s.belt += 3 + lev * 16;
        // Handheld: shakier as it speeds up.
        var j = 0.6 + lev * 3;
        fx.cam(RUNNER + 14 + (K.hash(t, 1) - 0.5) * j * 2, 74 + (K.hash(t, 2) - 0.5) * j * 2, 1.2 + lev * 0.45, { k: 0.4, rot: (K.hash(t, 3) - 0.5) * 0.02 * (1 + lev * 3) });
        if (t % 8 === 0) fx.sfx(function (S) { S.osc({ dur: 0.2, f0: 90 + lev * 300, f1: 95 + lev * 310, gain: 0.05, type: 'sawtooth' }); });
        if (lev > 0.35 && t % 4 === 0) fx.sfx(function (S) { S.noise({ dur: 0.04, freq: 6000, q: 2, gain: 0.06 + lev * 0.06, type: 'highpass' }); });
        SPEEDS.forEach(function (sp) { if (t === sp[0]) { s.speed = sp[1]; s.speedT = t; fx.sfx(function (S) { S.osc({ dur: 0.08, f0: 1500, gain: 0.05, type: 'square' }); }); } });
      }
      // Off the end.
      if (t === LAUNCH) {
        fx.pose(w, 'superman'); s.launch = t; w._hairFlick = 1;
        fx.sfx(function (S) { S.noise({ dur: 0.5, freq: 500, f1: 4000, q: 1, gain: 0.25 }); S.osc({ dur: 0.4, f0: 300, f1: 900, gain: 0.06, type: 'sawtooth' }); });
      }
      if (t > LAUNCH && t < BACK) { var u = (t - LAUNCH) / (BACK - LAUNCH); fx.place(w, RUNNER + 400 * u * u, 30 + 120 * u); fx.cam(RUNNER + 120 * u, 90, 1.3, { k: 0.3 }); }
      // Back on the stage: he comes crashing down out of the sky.
      if (t === BACK) {
        fx.cutaway = false; s.gym = false; l._hidden = false;
        fx.place(l, s.sw + 40, 0); fx.face(l, -fx.dir); fx.anim(l, FG.dazedAnim, true);
        fx.place(w, s.sw - 70, 300); fx.pose(w, 'superman'); w._drawRot = fx.dir * 0.9;
        fx.cam(s.sw - 10, 110, 1.05, { cut: true });
      }
      if (t > BACK && t < LAND) { var v = (t - BACK) / (LAND - BACK); fx.place(w, s.sw - 70 + 30 * v, 300 * (1 - v * v)); }
      if (t === LAND) {
        w._drawRot = 0; fx.place(w, s.sw - 40, 0); fx.anim(w, [[1, 'squat'], [6, 'tackle_c'], [10, 'tackle_c']]);
        fx.shake(0.04); fx.flash(0xffffff, 0.5);
        for (var dd = 0; dd < 5; dd++) fx.dust(fx.X(s.sw - 40) + (dd - 2) * 16, 8, 4);
        s.crater = t;
        fx.cam(s.sw - 10, 80, 1.4, { k: 0.5 });
        fx.sfx(function (S) { S.osc({ dur: 0.7, f0: 90, f1: 26, gain: 0.95 }); S.noise({ dur: 0.5, freq: 500, q: 0.5, gain: 0.45, type: 'lowpass' }); for (var r = 0; r < 6; r++) S.noise({ dur: 0.05, freq: 2000 + r * 400, q: 2, gain: 0.08, at: 0.1 + r * 0.06 }); });
      }
      // The flying tackle.
      if (t === TACKLE) { fx.pose(w, 'spear'); fx.sfx(function (S) { S.noise({ dur: 0.25, freq: 700, f1: 2200, q: 1, gain: 0.2 }); }); }
      if (t > TACKLE && t <= hits[0]) { var p = (t - TACKLE) / (hits[0] - TACKLE); fx.place(w, s.sw - 40 + 50 * p, Math.sin(p * Math.PI) * 18); }
      if (t === hits[0]) {
        fx.hit(l, 'power', { hits: 1, shake: 0.02, y: 50 });
        fx.pose(l, 'juggle'); fx.slow(14, 0.5);
        fx.cam(s.sw + 30, 80, 1.3, { k: 0.3 });
      }
      if (t > hits[0] && t < LIFT) { var c = (t - hits[0]) / (LIFT - hits[0]); fx.place(w, s.sw + 10 + 20 * c, 0); fx.place(l, s.sw + 40 + 20 * c, 20 + 10 * Math.sin(c * Math.PI)); }
      if (t === hits[0] + 6) fx.pose(w, 'grab_x');
      // Up and over, and down: the slam.
      if (t === LIFT) { fx.anim(w, [[1, 'throw_lift'], [hits[1] - LIFT - 4, 'throw_lift'], [hits[1] - LIFT, 'pbomb'], [hits[1] - LIFT + 30, 'pbomb'], [hits[1] - LIFT + 40, 'stand']]); fx.pose(l, 'juggle'); fx.sfx(function (S) { S.noise({ dur: 0.4, freq: 300, f1: 900, q: 0.8, gain: 0.12 }); }); }
      if (t > LIFT && t < hits[1]) { var e = (t - LIFT) / (hits[1] - LIFT); fx.place(l, s.sw + 50 + 10 * e, e < 0.7 ? 30 + 70 * Math.sin(e / 0.7 * Math.PI / 2) : 100 * (1 - (e - 0.7) / 0.3)); l._drawRot = fx.dir * Math.PI * e; }
      if (t === hits[1]) {
        l._drawRot = 0; fx.place(l, s.sw + 60, 0); fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, hits: 2, shake: 0.045, y: 10 });
        fx.flash(0xffd23f, 0.6); fx.slow(30, 0.3);
        for (var dz = 0; dz < 6; dz++) fx.dust(fx.X(s.sw + 60) + (dz - 3) * 14, 8, 3);
        s.slam = t;
        fx.cam(s.sw + 40, 70, 1.6, { cut: true, rot: 0.04 });
        fx.sfx(function (S) { S.osc({ dur: 0.8, f0: 80, f1: 24, gain: 1 }); S.noise({ dur: 0.4, freq: 1000, q: 0.5, gain: 0.5 }); S.noise({ dur: 1.4, freq: 1100, q: 0.6, gain: 0.12, attack: 0.3, at: 0.2 }); });
        fx.crowd(3);
      }
      if (t === hits[1] + 20) fx.cam(s.sw + 30, 110, 1.15, { k: 0.08 });
      // The hair flip.
      if (t === FLIP) { w._hairFlick = null; fx.place(w, s.sw, 0); fx.anim(w, [[1, 'stand'], [8, 'hairflip'], [18, 'hairflip2'], [28, 'hairflip'], [40, 'pump'], [54, 'pump2']]); }
      if (t > hits[1] + 30 && t < FLIP) fx.place(w, s.sw + 30 - 30 * (t - hits[1] - 30) / (FLIP - hits[1] - 30), 0);
    },
    draw: function (fx, t) {
      var s = fx.s;
      if (s.gym) {
        drawGym(fx, fx.gb, t);
        var c = drawTreadmill(fx, fx.gb, fx.gf, t, s);
        if (s.speed) {
          fx.text(0, s.speed, fx.sx(c.x), fx.sy(c.y - 3), s.speed === 'MAX' ? 0xff4a3d : 0x6aff8a, 1.2 * fx.scene.cameras.main.zoom);
          // The speed, big, on screen.
          var sc = t - s.speedT < 6 ? 1.3 : 1;
          fx.text(1, 'SPEED ' + s.speed, W / 2 + 120, 300, s.speed === 'MAX' ? 0xff4a3d : 0x6aff8a, 3 * sc, -4);
          fx.text(2, 'INCLINE ' + (level(t) >= 0.9 ? 'MAX' : Math.round(level(t) * 15)), W / 2 + 120, 330, 0xffd23f, 2, -4);
        }
      }
      if (s.launch && t >= s.launch && t < BACK) {
        for (var k = 0; k < 10; k++) { fx.gs.fillStyle(0xffffff, 0.5); fx.gs.fillRect(K.hash(k, 1) * W, 40 + K.hash(k, 2) * 280, 60 + K.hash(k, 3) * 120, 2); }
      }
      if (s.crater && t - s.crater < 40) { var p = fx.P(fx.S(fx.px(fx.w)), 0), r = 20 + (t - s.crater) * 3; fx.gb.fillStyle(0x000000, 0.35 * (1 - (t - s.crater) / 40)); fx.gb.fillEllipse(p.x, p.y + 2, r * 2, r * 0.4); }
      if (s.slam && t - s.slam < 50) {
        var q = fx.at2(fx.l, 0), rr = 10 + (t - s.slam) * 6;
        fx.gs.lineStyle(5, 0xffd23f, 1 - (t - s.slam) / 50); fx.gs.strokeEllipse(q[0], q[1], rr * 2, rr * 0.5);
        fx.text(3, 'MAX INCLINE!', W / 2 + 40, 110, 0xff4a3d, 4 * K.stamp(t, s.slam), -5, 1 - Math.max(0, (t - s.slam - 36) / 14));
      }
    }
  };
})();
