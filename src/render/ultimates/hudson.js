// HUDSON — Can't Touch This: the jab lands, the world drains to blue-gray and slows to
// a crawl. They throw everything, one punch after another, faster and faster, and he
// isn't there for any of it: a slip, a duck, a weave, a lean back, his afterimages
// hanging in the air, MISS after MISS. Time snaps back. Body, body, head, the right hand,
// and a rear uppercut that lifts them off the floor. "Missed."
// Camera: tight on his face through the dodges (a slow drift round him), a hard cut wide
// for the counters, and a low angle up the uppercut.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, K = FG.ultKit;
  var SLOW = 14, SNAP = 150;
  // Their swings: the frame, their move, and his dodge.
  var SWINGS = [[28, 'jab', 'slip'], [44, 'heavy', 'duck'], [58, 'jab', 'lean'], [70, 'fP', 'weave2'], [82, 'heavy', 'slip'],
    [93, 'jab', 'duck'], [103, 'launcher', 'lean'], [112, 'heavy', 'weave2'], [121, 'jab', 'slip'], [134, 'heavy', 'lean']];
  // The counters: his poses (wind-up, strike), their reaction, the impact kind.
  var COUNTERS = [['shv_c', 'shv_x', 'hit_mid', 'body'], ['bj_c', 'bj_x', 'hit_mid', 'body'], ['hook_c', 'hook_x', 'hit_high', 'power'], ['rh_c', 'rh_x', 'hit_high', 'power']];

  FG.ULTIMATES.hudson = {
    start: function (fx) {
      var s = fx.s;
      s.ls = fx.S(fx.lx0);
      fx.place(fx.w, 0, 0); fx.face(fx.w, fx.dir); fx.pose(fx.w, 'jab_x');
      fx.place(fx.l, s.ls, 0); fx.face(fx.l, -fx.dir); fx.pose(fx.l, 'hit_high');
      fx.cam(s.ls * 0.5, 80, 1.6, { k: 0.4 });
      s.ghosts = []; s.misses = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir;
      // Everything slows down.
      if (t === SLOW) {
        s.slow = t; fx.pose(w, 'idle'); fx.pose(l, 'idle');
        fx.cam(s.ls * 0.3, 74, 2.0, { k: 0.08, rot: 0.03 });
        fx.sfx(function (S) { S.osc({ dur: 1.2, f0: 220, f1: 70, gain: 0.25, type: 'sawtooth' }); });
      }
      // They swing; he isn't there.
      SWINGS.forEach(function (sw, k) {
        if (t === sw[0] - 6) fx.pose(l, fx.windupPose(l, sw[1]));
        if (t === sw[0]) {
          fx.pose(l, fx.strikePose(l, sw[1]));
          s.ghosts.push({ pose: w._override ? w._override.anim[0][1] : 'idle', t: t });
          fx.pose(w, sw[2]); s.misses = k + 1; s.miss = t;
          fx.cam(s.ls * 0.3 + (k % 2 ? 6 : -6), 70, 2.0 + k * 0.03, { k: 0.12, rot: (k % 2 ? 1 : -1) * 0.03 });
          fx.sfx(function (S) { S.noise({ dur: 0.18, freq: 1600, q: 1.2, gain: 0.18, type: 'bandpass' }); S.osc({ dur: 0.14, f0: 700, f1: 300, gain: 0.05 }); });
        }
        if (t === sw[0] + 7) fx.pose(l, 'idle');
      });
      if (t === SWINGS[SWINGS.length - 1][0] + 8) fx.pose(w, 'idle');
      // Time snaps back.
      if (t === SNAP) {
        s.slow = 0; s.snap = t; fx.pose(w, 'idle'); fx.pose(l, 'gbreak');
        fx.flash(0xffffff, 0.6);
        fx.cam(s.ls * 0.5, 84, 1.5, { cut: true });
        fx.sfx(function (S) { S.osc({ dur: 0.25, f0: 90, f1: 400, gain: 0.3 }); });
      }
      // The counters: body, body, head, the right hand.
      for (var k = 0; k < COUNTERS.length; k++) {
        var c = COUNTERS[k], at = hits[k];
        if (t === at - 5) fx.pose(w, c[0]);
        if (t === at) {
          fx.pose(w, c[1]); fx.pose(l, c[2]);
          fx.hit(l, c[3], { ch: true, strength: 'heavy', hits: k + 1, y: c[2] === 'hit_mid' ? 46 : 72, shake: 0.012 });
          s.count = { n: k + 1, t: t };
          fx.cam(s.ls * 0.5 + 4 * k, c[2] === 'hit_mid' ? 70 : 82, 1.7 + k * 0.08, { cut: true, rot: (k % 2 ? 0.03 : -0.03) });
          var f0 = 150 + k * 20;
          fx.sfx(function (S) { S.osc({ dur: 0.16, f0: f0, f1: 50, gain: 0.6 }); S.noise({ dur: 0.07, freq: 2400, q: 1.4, gain: 0.3, type: 'bandpass' }); });
        }
      }
      // ...and the uppercut. Off the floor.
      var UP = hits[hits.length - 1];
      if (t === UP - 12) { fx.pose(w, 'upc_c'); fx.cam(s.ls * 0.5, 60, 1.6, { cut: true, rot: -0.06 }); }
      if (t === UP) {
        fx.pose(w, 'upc_x'); fx.pose(l, 'juggle'); s.up = t;
        fx.hit(l, 'launch', { ch: true, hits: hits.length, y: 72, shake: 0.04 });
        fx.flash(0xffffff, 0.8); fx.slow(26, 0.25); fx.crowd(3);
        fx.sfx(function (S) { S.osc({ dur: 1, f0: 80, f1: 24, gain: 1 }); S.noise({ dur: 0.4, freq: 2800, q: 0.6, gain: 0.4 }); });
      }
      if (s.up && t > UP && t < UP + 30) { var u = (t - UP) / 30; fx.place(l, s.ls + 10 * u, Math.sin(u * Math.PI * 0.5) * 50); l._drawRot = -dir * u * 0.8; }
      if (t === UP + 34) { fx.anim(w, [[1, 'upc_x'], [10, 'idle'], [20, 'nod']]); fx.say(w, 'Missed.', 50); }
    },
    draw: function (fx, t) {
      var s = fx.s, gs = fx.gs;
      // Slow motion: the colour drains out, lines streak past.
      if (s.slow) {
        var u = Math.min(1, (t - s.slow) / 12);
        gs.fillStyle(0x203048, 0.32 * u); gs.fillRect(0, 0, W, H);
        for (var r = 0; r < 10; r++) { var y = (K.hash(r, 3) * H) | 0, x = ((K.hash(r, 5) * W + t * 3) % (W + 80)) - 40; gs.fillStyle(0xffffff, 0.1); gs.fillRect(x, y, 60, 1); }
      }
      // His afterimages: where he was a moment ago.
      s.ghosts = s.ghosts.filter(function (g) { return t - g.t < 18; });
      s.ghosts.forEach(function (g) { fx.figure(fx.gg, fx.w, g.pose, 0, 0, { flash: 0x8ae0b0, facing: fx.dir }); });
      if (s.miss && t - s.miss < 12 && t < SNAP) fx.text(0, 'MISS', W / 2 + (s.misses % 2 ? 60 : -60), 110 + (s.misses % 3) * 14, 0xffffff, 2.2 * K.stamp(t, s.miss), s.misses % 2 ? 6 : -6);
      if (s.misses && t < SNAP + 20) fx.text(1, 'MISSED: ' + s.misses, W - 90, H - 40, 0x8ae0b0, 1.6);
      if (s.snap && t - s.snap < 30) fx.text(2, "CAN'T TOUCH THIS", W / 2, 96, 0x8ae0b0, 2.2 * K.stamp(t, s.snap), -4);
      if (s.count && t - s.count.t < 14) fx.text(3, 'COUNTER!', W / 2, 120, 0xffd23f, 2.4 * K.stamp(t, s.count.t), -3);
      if (s.up && t - s.up < 40) fx.text(4, 'UPPERCUT', W / 2, 100, 0xffd23f, 3.2 * K.stamp(t, s.up), -5);
    }
  };
})();
