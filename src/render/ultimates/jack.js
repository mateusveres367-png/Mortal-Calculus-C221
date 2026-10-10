// JACK — Highlight Reel: the jab lands and it turns into a broadcast. A LIVE bug in the
// corner, his name on a lower third, and a punch-kick flurry called hit by hit: jab, cross,
// hook, body kick, low kick, switch kick, jab, cross, body kick. Then the tape rewinds
// (static, the picture running backwards) and the INSTANT REPLAY plays the finish in slow
// motion: a spinning back fist, and a head kick that freezes on the frame. PLAY OF THE DAY.
// Camera: a tight two-shot that cuts on every strike, wider for the kicks; the replay is a
// low, slow angle; the freeze frame holds.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, K = FG.ultKit;
  var REWIND = 112, REPLAY = 134, FREEZE_LEN = 30, BOW = 246;
  // The flurry: his wind-up, the strike, their reaction, the impact kind, the call.
  var FLURRY = [
    ['jab_c', 'jab_x', 'hit_high', 'jab', 'JAB'],
    ['cross_c', 'cross_x', 'hit_high', 'jab', 'CROSS'],
    ['hook_c', 'hook_x', 'hit_high', 'power', 'HOOK'],
    ['rk_c', 'rk_x', 'hit_mid', 'body', 'BODY KICK'],
    ['lk_c', 'lk_x', 'hit_low', 'low', 'LOW KICK'],
    ['sw_c', 'sw_x', 'hit_mid', 'body', 'SWITCH KICK'],
    ['jab_c', 'jab_x', 'hit_high', 'jab', 'JAB'],
    ['cross_c', 'cross_x', 'hit_high', 'jab', 'CROSS'],
    ['rk_c', 'rk_x', 'hit_mid', 'body', 'BODY KICK']
  ];

  FG.ULTIMATES.jack = {
    start: function (fx) {
      var s = fx.s;
      s.ls = fx.S(fx.lx0);
      fx.place(fx.w, 0, 0); fx.face(fx.w, fx.dir); fx.pose(fx.w, 'jab_x');
      fx.place(fx.l, s.ls, 0); fx.face(fx.l, -fx.dir); fx.pose(fx.l, 'hit_high');
      fx.cam(s.ls * 0.5, 80, 1.6, { k: 0.4 });
      s.live = 1;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir, LAST = hits[hits.length - 1], SPIN = hits[hits.length - 2];
      // The flurry, called hit by hit; he walks them back with every one.
      for (var k = 0; k < FLURRY.length; k++) {
        var f = FLURRY[k], at = hits[k];
        if (t === at - 5) fx.pose(w, f[0]);
        if (t === at) {
          fx.pose(w, f[1]); fx.pose(l, f[2]);
          fx.hit(l, f[3], { strength: k % 3 === 2 ? 'heavy' : 'medium', hits: k + 1, shake: 0.006, y: f[2] === 'hit_low' ? 24 : f[2] === 'hit_mid' ? 48 : 70 });
          s.call = { text: f[4], t: t, n: k + 1 };
          var kick = f[3] === 'body' || f[3] === 'low', side = k % 2 ? 1 : -1;
          fx.cam(s.ls * 0.5 + 4 * k, kick ? 70 : 84, kick ? 1.5 : 1.8, { cut: true, rot: side * 0.025 });
          s.back = (s.back || 0) + 3;
          fx.place(l, s.ls + s.back, 0); fx.place(w, s.back * 0.8, 0);
          var f0 = 160 + k * 18;
          fx.sfx(function (S) { S.osc({ dur: 0.08, f0: f0, f1: 70, gain: 0.35 }); S.noise({ dur: 0.04, freq: 2600, q: 1.5, gain: 0.2, type: 'bandpass' }); });
        }
        if (t === at + 6) fx.pose(w, 'idle');
      }
      // Rewind: static, the picture running backwards, a squeal.
      if (t === REWIND) {
        s.rewind = t; s.live = 0; fx.pose(l, 'idle'); fx.pose(w, 'idle');
        fx.sfx(function (S) { S.noise({ dur: 0.7, freq: 2000, q: 0.4, gain: 0.25 }); S.osc({ dur: 0.7, f0: 1400, f1: 300, gain: 0.08, type: 'square' }); });
      }
      if (s.rewind && t > REWIND && t < REPLAY) {
        var u = (t - REWIND) / (REPLAY - REWIND);
        fx.place(l, s.ls + s.back * (1 - u), 0); fx.place(w, s.back * 0.8 * (1 - u), 0);
        fx.pose(w, t % 4 < 2 ? 'cross_x' : 'jab_x');
      }
      // INSTANT REPLAY, in slow motion: the spin...
      if (t === REPLAY) {
        s.replay = t; fx.place(w, 0, 0); fx.place(l, s.ls, 0); fx.pose(w, 'idle'); fx.pose(l, 'idle');
        fx.cam(s.ls * 0.5, 60, 1.7, { cut: true, rot: -0.04 });
        fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 880, gain: 0.12, type: 'square' }); });
      }
      if (t === SPIN - 8) fx.pose(w, 'sbf_c');
      if (t === SPIN) {
        fx.pose(w, 'sbf_x'); fx.pose(l, 'hit_high'); fx.slow(26, 0.35);
        fx.hit(l, 'power', { strength: 'heavy', hits: hits.length - 1, y: 72, shake: 0.012 });
        s.call = { text: 'SPINNING BACK FIST', t: t, n: 0 };
        fx.cam(s.ls * 0.45, 76, 2.0, { cut: true, rot: 0.03 });
        fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 120, f1: 40, gain: 0.7 }); S.noise({ dur: 0.2, freq: 1800, q: 1, gain: 0.3 }); });
      }
      // ...and the head kick. Freeze frame.
      if (t === LAST - 12) { fx.pose(w, 'hk_c'); fx.cam(s.ls * 0.5, 66, 1.6, { cut: true, rot: -0.05 }); }
      if (t === LAST) {
        fx.pose(w, 'hk_x'); fx.pose(l, 'hit_high'); l._drawRot = -dir * 0.3;
        fx.hit(l, 'power', { ch: true, hits: hits.length, y: 78, shake: 0.04 });
        fx.flash(0xffffff, 0.9); fx.slow(FREEZE_LEN, 0.15); s.freeze = t; s.call = null;
        fx.sfx(function (S) { S.osc({ dur: 1, f0: 90, f1: 26, gain: 1 }); S.noise({ dur: 0.4, freq: 3000, q: 0.6, gain: 0.4 }); S.osc({ dur: 0.1, f0: 2200, gain: 0.15, type: 'square', at: 0.05 }); });
        fx.crowd(3);
      }
      // Off the freeze: they spin away and drop; he hops on the spot.
      if (s.freeze && t > LAST + FREEZE_LEN && t < LAST + FREEZE_LEN + 22) {
        var v = (t - LAST - FREEZE_LEN) / 22;
        fx.place(l, s.ls + 50 * v, Math.sin(v * Math.PI) * 30); l._drawRot = -dir * (0.3 + v * 1.4);
      }
      if (t === LAST + FREEZE_LEN + 22) { l._drawRot = 0; fx.place(l, s.ls + 50, 0); fx.pose(l, 'down'); fx.shake(0.02); FG.Sfx.play({ type: 'land' }); }
      if (t === BOW) { fx.anim(w, [[1, 'idle'], [6, 'hop'], [12, 'idle'], [20, 'shrug']]); fx.say(w, 'Watch the replay.', 60); fx.cam(s.ls * 0.5, 100, 1.3, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, gs = fx.gs;
      var frozen = s.freeze && t - s.freeze < FREEZE_LEN;
      // The broadcast: a LIVE bug and his name on a lower third.
      if (s.live && t < REWIND) {
        gs.fillStyle(0xc0392b, 1); gs.fillRect(W - 76, 64, 56, 18); fx.text(0, 'LIVE', W - 44, 73, 0xffffff, 1.4);
        if (t % 30 < 20) { gs.fillStyle(0xffffff, 1); gs.fillCircle(W - 68, 73, 3); }
        gs.fillStyle(0x10141e, 0.85); gs.fillRect(30, H - 64, 230, 34); gs.fillStyle(0x5fd7ff, 1); gs.fillRect(30, H - 64, 6, 34);
        fx.text(1, 'JACK  "BACK ROW"', 150, H - 54, 0xffffff, 1.4); fx.text(2, 'KICKBOXING  /  10TH GRADE', 150, H - 40, 0x9aa4b8, 1);
      }
      // The call for each strike, and the running count.
      if (s.call && t - s.call.t < 16) {
        fx.text(3, s.call.text, W / 2, 104, 0xffd23f, 2.4 * Math.min(1.4, K.stamp(t, s.call.t)), -3);
        if (s.call.n) fx.text(4, s.call.n + ' HITS', W / 2, 128, 0xffffff, 1.6);
      }
      // Rewind: static and tracking lines, << on screen.
      if (s.rewind && t < REPLAY) {
        gs.fillStyle(0x000000, 0.25); gs.fillRect(0, 0, W, H);
        for (var r = 0; r < 14; r++) { var y = (K.hash(t, r) * H) | 0; gs.fillStyle(0xffffff, 0.15 + K.hash(r, t) * 0.25); gs.fillRect(0, y, W, 1 + (K.hash(t + r, 3) * 3 | 0)); }
        fx.text(5, '<<  REWIND', W - 110, 70, 0xffffff, 2);
      }
      // The replay: a tint, scanlines, a timecode, INSTANT REPLAY.
      if (s.replay && t < BOW) {
        gs.fillStyle(0x203040, frozen ? 0.0 : 0.18); gs.fillRect(0, 0, W, H);
        for (var l2 = 0; l2 < H; l2 += 4) { gs.fillStyle(0x000000, 0.12); gs.fillRect(0, l2, W, 1); }
        fx.text(6, 'INSTANT REPLAY', W - 110, 72, 0x5fd7ff, 1.8);
        var tc = Math.max(0, t - s.replay), ss = ('0' + ((tc / 30) | 0)).slice(-2), ff = ('0' + (tc % 30)).slice(-2);
        if (!frozen) fx.text(7, '00:00:' + ss + ':' + ff, W - 90, H - 40, 0xffffff, 1.4);
      }
      // The freeze frame: a hard white border, FREEZE FRAME, then PLAY OF THE DAY.
      if (frozen) {
        var a = 1 - (t - s.freeze) / FREEZE_LEN;
        gs.lineStyle(8, 0xffffff, 0.6 + 0.4 * a); gs.strokeRect(6, 6, W - 12, H - 12);
        fx.text(8, '|| FREEZE FRAME', W - 100, H - 40, 0xffffff, 1.4);
      }
      if (s.freeze && t - s.freeze >= 8 && t - s.freeze < 54) fx.text(9, 'PLAY OF THE DAY', W / 2, 112, 0xffd23f, 3 * K.stamp(t, s.freeze + 8), -5);
    }
  };
})();
