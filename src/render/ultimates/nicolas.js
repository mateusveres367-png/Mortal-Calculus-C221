// NICOLAS — Five-Minute Passing Period: the bell rings and a huge LED clock slams up
// reading 5:00. It counts down at hyperspeed while he lands a nonstop chain of jumping,
// spinning and flying kicks from one end of the stage to the other, from both sides at
// once, the hallway crowd rushing past in the foreground. At 0:05 everything slows; at
// 0:00 the bell rings again and a flying side kick sends them into the far wall. "Made it."
// Camera: a fast tracking dolly that follows the opponent across the stage, snapping
// a few degrees one way and the other with every hit, pulling back for the last
// seconds, then a hard push-in on the final hit.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var BELL = 8, COUNT = [20, 222], SLOW = 186, LAST = 236, MADE = 252;
  // Snap, double roundhouse, side, tornado, 540, back, axe, roundhouse: kick after kick.
  var STRIKES = ['snap_x', 'dbl_x2', 'side_x', 'tor_x', 'k540_x', 'back_x', 'axe_x', 'rh_x', 'snap2_x', 'dbl_x1'];

  // The clock: 5:00 down to 0:00, slow at first, then a blur, then the last seconds.
  function secondsLeft(t) {
    if (t < COUNT[0]) return 300;
    if (t >= COUNT[1]) return 0;
    var u = (t - COUNT[0]) / (COUNT[1] - COUNT[0]);
    return u < 0.8 ? Math.round(300 - 295 * Math.pow(u / 0.8, 0.7)) : Math.max(0, Math.ceil(5 * (1 - (u - 0.8) / 0.2)));
  }
  function clock(sec) { return Math.floor(sec / 60) + ':' + ('0' + sec % 60).slice(-2); }

  // An LED panel with the time on it (screen space).
  function drawClock(fx, g, x, y, sc, sec, t) {
    var w = 190 * sc, h = 70 * sc, low = sec <= 10;
    g.fillStyle(0x000000, 0.5); g.fillRect(x - w / 2 + 6, y - h / 2 + 6, w, h);
    g.fillStyle(0x16161a, 1); g.fillRect(x - w / 2, y - h / 2, w, h);
    g.lineStyle(3 * sc, 0x5a5a66, 1); g.strokeRect(x - w / 2, y - h / 2, w, h);
    g.fillStyle(low && t % 8 < 4 ? 0x3a0808 : 0x220606, 1); g.fillRect(x - w / 2 + 8 * sc, y - h / 2 + 8 * sc, w - 16 * sc, h - 16 * sc);
    fx.text(0, clock(sec), x, y, low ? 0xff3a2a : 0xff8a2a, 5 * sc);
  }

  FG.ULTIMATES.nicolas = {
    start: function (fx) {
      var s = fx.s;
      s.l0 = fx.S(fx.lx0);
      // The far wall: they're carried all the way over there.
      var wallX = fx.dir > 0 ? C.WALL_R - 70 : C.WALL_L + 70;
      s.far = fx.S(wallX); s.trail = []; s.runners = [];
      for (var r = 0; r < 7; r++) s.runners.push({ s: K.hash(r, 9) * 600 - 300, sp: 6 + K.hash(r, 3) * 5, col: [0x2a5fb8, 0x3a8a3a, 0xd8a020, 0x8a3ab0, 0xc05a2a, 0x2a2a2a, 0xe8e8e8][r] });
      fx.place(fx.l, s.l0, 0); fx.pose(fx.l, 'hit_mid');
      fx.pose(fx.w, 'snap_x');
      fx.cam(s.l0 - 20, 110, 1.3, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === BELL) { FG.Sfx.bell(); s.panel = t; fx.shake(0.01); fx.cam(s.l0, 120, 1.05, { cut: true }); }
      // Where they are: carried toward the far wall a little more with every hit.
      var done = 0; for (var k = 0; k < hits.length - 1; k++) if (t >= hits[k]) done++;
      var target = s.l0 + (s.far - s.l0) * Math.min(1, done / (hits.length - 1)), cur = fx.S(fx.px(l));
      if (t > COUNT[0]) fx.place(l, cur + (target - cur) * 0.25, 0);
      // The blitz: he's everywhere at once. Each hit he appears on the other side.
      var hi = hits.indexOf(t);
      if (hi >= 0 && hi < hits.length - 1) {
        var side = hi % 2 ? 1 : -1, ls = fx.S(fx.px(l));
        fx.place(w, ls + side * 34, 0); fx.face(w, -side * fx.dir);
        var pose = STRIKES[hi % STRIKES.length];
        fx.pose(w, pose); s.trail.push({ s: ls + side * 34, pose: pose, face: -side * fx.dir, t: t });
        fx.hit(l, hi % 3 === 2 ? 'body' : 'jab', { strength: 'medium', hits: hi + 1, shake: 0.005, y: 40 + (hi % 3) * 16 });
        fx.pose(l, hi % 2 ? 'hit_high' : 'hit_mid'); fx.face(l, side * fx.dir);
        fx.cam(ls, 108, 1.25, { k: 0.45, rot: side * 0.035 });
        fx.sfx(function (S) { S.noise({ dur: 0.08, freq: 2400 + hi * 80, q: 1.5, gain: 0.12 }); S.osc({ dur: 0.04, f0: 900 + hi * 40, gain: 0.04, type: 'square' }); });
      }
      // Between hits: a red streak.
      if (t > hits[0] && t < SLOW && hits.indexOf(t) < 0) { s.trail.push({ s: fx.S(fx.px(w)), pose: 'dash', face: fx.dir, t: t, blur: true }); }
      s.trail = s.trail.filter(function (q) { return t - q.t < 8; });
      // The crowd of students in the hall, rushing past.
      s.runners.forEach(function (r) { r.s += r.sp * (t < SLOW ? 1 : 0.2); if (r.s > 420) r.s -= 840; });
      // The last five seconds, slowed right down.
      if (t === SLOW) { fx.slow(40, 0.35); fx.place(w, s.far - 110, 0); fx.face(w, fx.dir); fx.anim(w, [[1, 'dash'], [20, 'side_c']]); fx.cam(s.far - 60, 110, 1.0, { k: 0.1 }); s.trail = []; }
      if (t > SLOW && t < LAST - 8) { var u = (t - SLOW) / (LAST - 8 - SLOW); fx.place(w, s.far - 110 + 20 * u, 0); }
      if (t === COUNT[1]) { FG.Sfx.bell(); s.zero = t; fx.flash(0xff3a2a, 0.4); }
      if (t === LAST - 8) { fx.anim(w, [[1, 'side_c'], [6, 'side_x'], [30, 'side_x'], [40, 'stand']]); fx.sfx(function (S) { S.noise({ dur: 0.3, freq: 700, f1: 3000, q: 1, gain: 0.25 }); }); }
      if (t > LAST - 8 && t <= LAST) fx.place(w, s.far - 90 + 70 * (t - LAST + 8) / 8, 0);
      if (t === LAST) {
        fx.hit(l, 'power', { ch: true, shake: 0.035, hits: hits.length, y: 60 });
        fx.pose(l, 'juggle'); s.slam = t;
        fx.cam(s.far, 100, 1.7, { cut: true, rot: -0.04 * 1 });
        fx.sfx(function (S) { S.osc({ dur: 0.6, f0: 110, f1: 30, gain: 0.9 }); S.noise({ dur: 0.4, freq: 1400, q: 0.5, gain: 0.35 }); });
        fx.crowd(3);
      }
      if (t > LAST && t < LAST + 16) fx.place(l, s.far + 30 * (t - LAST) / 16, 40 * Math.sin((t - LAST) / 16 * Math.PI));
      if (t === MADE) { fx.anim(w, [[1, 'stand'], [10, 'watch'], [40, 'watch'], [50, 'thumb']]); fx.say(w, 'Made it.', 70); fx.cam(s.far - 60, 110, 1.25, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      // Afterimages of the blitz.
      s.trail.forEach(function (q) { fx.figure(fx.gg, fx.w, q.pose, q.s, 0, { flash: q.blur ? 0xff5a4a : 0xffd23f, facing: q.face }); });
      // The hallway crowd in the foreground: blurred students running past.
      if (t > BELL && t < LAST) s.runners.forEach(function (r) {
        var x = fx.sx(fx.X(r.s)), y = H - 20;
        g.fillStyle(r.col, 0.55); g.fillRect(x - 16, y - 70, 32, 70); g.fillStyle(0xd8a878, 0.55); g.fillCircle(x, y - 80, 12);
        g.fillStyle(r.col, 0.25); g.fillRect(x - 60, y - 64, 44, 58); // motion blur
      });
      // Speed lines while the clock races.
      if (t > COUNT[0] && t < SLOW) for (var k = 0; k < 9; k++) { g.fillStyle(0xffffff, 0.45); g.fillRect((K.hash(k, t) * W) | 0, 70 + K.hash(t, k) * 220, 60 + K.hash(k, 2) * 120, 2); }
      // The clock.
      if (s.panel) {
        var sc = t - s.panel < 8 ? 1 + (1 - (t - s.panel) / 8) * 1.2 : 1, y = t > SLOW ? 124 : 112;
        drawClock(fx, g, W / 2, y, t > SLOW ? sc * 1.15 : sc, secondsLeft(t), t);
      }
      if (t > COUNT[0] + 10 && t < SLOW) fx.text(1, 'PASSING PERIOD', W / 2, 162, 0xffd23f, 2, -3);
      if (s.zero && t - s.zero < 40) fx.text(2, 'RIIIING!', W / 2, 176, 0xffffff, 3 * K.stamp(t, s.zero), 6);
      if (s.slam && t - s.slam < 50) fx.text(3, 'TARDY? NOT ME.', W / 2, 300, 0xffd23f, 3 * K.stamp(t, s.slam), -4);
    }
  };
})();
