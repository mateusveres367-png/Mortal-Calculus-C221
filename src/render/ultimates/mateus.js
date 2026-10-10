// MATEUS — Eight Limbs: he catches them in the clinch, the world drops away to black and
// red (brushstrokes of red ink across the dark), and eight strikes land one after
// another, each named on screen as it hits: LEFT FIST, RIGHT FIST, LEFT ELBOW, RIGHT
// ELBOW, LEFT KNEE, RIGHT KNEE, LEFT SHIN, and last a RIGHT SHIN head kick that freezes
// the whole frame on impact. "Again."
// Camera: tight on the clinch, then a cut for every strike from alternating sides, each
// one a little closer; the head kick is a low angle, held in slow motion.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, K = FG.ultKit;
  var CATCH = 6, DARK = 24, AFTER = 262;
  var RED = 0xc8102e, DEEP = 0x6a0a18;
  // The eight: label, wind-up, strike, the opponent's reaction, where it lands (height).
  var STRIKES = [
    ['LEFT FIST', 'jab_c', 'jab_x', 'hit_high', 70],
    ['RIGHT FIST', 'cross_c', 'cross_x', 'hit_high', 72],
    ['LEFT ELBOW', 'slash_c', 'slash_x', 'hit_high', 74],
    ['RIGHT ELBOW', 'celb_c', 'relb_x', 'hit_high', 72],
    ['LEFT KNEE', 'clinch', 'lknee_x', 'hit_mid', 50],
    ['RIGHT KNEE', 'cknee_c', 'cknee_x', 'hit_mid', 52],
    ['LEFT SHIN', 'lowk_c', 'lshin_x', 'hit_mid', 46],
    ['RIGHT SHIN', 'head_c', 'head_x', 'hit_high', 78]
  ];

  // A ragged brushstroke of red ink across the set (world space, s = set x, h = height).
  function stroke(fx, g, s0, s1, h, thick, rise, col, seed) {
    var top = [], bot = [], n = 24;
    for (var i = 0; i <= n; i++) {
      var u = i / n, w = thick * (u < 0.12 ? 0.3 + u / 0.12 * 0.7 : u > 0.75 ? Math.max(0.05, (1 - u) / 0.25) : 1);
      var p = fx.P(s0 + (s1 - s0) * u, h + rise * u);
      top.push({ x: p.x, y: p.y - w / 2 + (K.hash(seed, i) - 0.5) * thick * 0.3 });
      bot.push({ x: p.x, y: p.y + w / 2 + (K.hash(seed + 5, i) - 0.5) * thick * 0.3 });
    }
    g.fillStyle(col, 1); g.fillPoints(top.concat(bot.reverse()), true);
  }

  FG.ULTIMATES.mateus = {
    start: function (fx) {
      var s = fx.s;
      s.ls = 28 * fx.l.def.scale + 6;
      fx.place(fx.w, 0, 0); fx.face(fx.w, fx.dir); fx.pose(fx.w, 'grab_x');
      fx.place(fx.l, s.ls, 0); fx.face(fx.l, -fx.dir); fx.pose(fx.l, 'hit_mid');
      fx.cam(14, 90, 1.5, { k: 0.35 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // The clinch: heads tied up, pulled in.
      if (t === CATCH) {
        fx.pose(w, 'clinch'); s.clinch = t;
        fx.sfx(function (S) { S.osc({ dur: 0.18, f0: 120, f1: 60, gain: 0.5 }); S.noise({ dur: 0.1, freq: 600, q: 1, gain: 0.15 }); });
        fx.cam(14, 86, 1.9, { cut: true });
      }
      // Everything drops away: black and red.
      if (t === DARK) {
        s.dark = t; fx.cutaway = true;
        fx.flash(RED, 0.6);
        fx.sfx(function (S) { S.osc({ dur: 0.9, f0: 55, f1: 40, gain: 0.5, type: 'sawtooth' }); S.noise({ dur: 0.6, freq: 300, q: 0.6, gain: 0.25, type: 'lowpass' }); });
        fx.cam(14, 96, 1.4, { k: 0.1 });
      }
      // The eight: a wind-up a few frames before each hit, then the strike, named.
      for (var k = 0; k < STRIKES.length; k++) {
        var st = STRIKES[k], at = hits[k], last = k === STRIKES.length - 1;
        if (t === at - (last ? 14 : 7)) {
          fx.pose(w, st[1]);
          // A new angle for every strike, closer each time (the last from low down).
          var side = k % 2 ? 1 : -1;
          if (last) fx.cam(s.ls * 0.6, 60, 1.25, { cut: true, rot: -0.06 });
          else fx.cam(s.ls * 0.5 + side * 10, st[4] + 6, 1.55 + k * 0.05, { cut: true, rot: side * 0.03 });
        }
        if (t === at) {
          fx.pose(w, st[2]); fx.pose(l, st[3]);
          s.label = { text: st[0], t: t, n: k + 1 };
          if (last) {
            fx.hit(l, 'power', { ch: true, shake: 0.05, y: st[4], hits: hits.length });
            fx.flash(0xffffff, 0.9); fx.slow(46, 0.12); s.freeze = t;
            fx.sfx(function (S) { S.osc({ dur: 1.1, f0: 80, f1: 24, gain: 1 }); S.noise({ dur: 0.5, freq: 2600, q: 0.6, gain: 0.5 }); S.osc({ dur: 0.08, f0: 1800, gain: 0.2, type: 'square' }); });
            fx.crowd(3);
          } else {
            fx.hit(l, st[4] < 60 ? 'body' : 'jab', { strength: 'heavy', shake: 0.01, y: st[4], hits: k + 1 });
            var f0 = 140 + k * 12;
            fx.sfx(function (S) { S.noise({ dur: 0.05, freq: 2400, q: 1.6, gain: 0.35, type: 'bandpass' }); S.osc({ dur: 0.14, f0: f0, f1: 60, gain: 0.6 }); });
          }
        }
        if (t === at + 9 && !last) fx.pose(w, k >= 3 && k <= 5 ? 'clinch' : 'idle');
      }
      // After the head kick: they spin away and drop.
      var fin = hits[hits.length - 1];
      if (t > fin + 4 && t < fin + 30) { var u = (t - fin - 4) / 26; fx.place(l, s.ls + 70 * u, Math.sin(u * Math.PI) * 40); l._drawRot = -fx.dir * u * 1.4; }
      if (t === fin + 30) { l._drawRot = 0; fx.place(l, s.ls + 70, 0); fx.pose(l, 'down'); fx.shake(0.02); FG.Sfx.play({ type: 'land' }); }
      if (t === fin + 6) fx.cam(s.ls + 30, 80, 1.1, { k: 0.12 });
      if (t === AFTER) { fx.anim(w, [[1, 'idle'], [10, 'band'], [40, 'band'], [52, 'idle']]); fx.say(w, 'Again.', 70); fx.cam(20, 100, 1.3, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb, gs = fx.gs;
      // Black, slashed with red ink behind them.
      if (s.dark) {
        var u = Math.min(1, (t - s.dark) / 8);
        fx.fill(g, 0x070708, u);
        if (u >= 1) {
          stroke(fx, g, -260, 300, 150, 70, -40, DEEP, 3);
          stroke(fx, g, 320, -200, 60, 44, 30, RED, 7);
          stroke(fx, g, -120, 260, 20, 18, 10, RED, 11);
        }
      }
      // The name of each strike as it lands, with a count.
      if (s.label && t - s.label.t < (s.label.n === 8 ? 48 : 18)) {
        var big = s.label.n === 8, sc = (big ? 3.2 : 2.2) * Math.min(1.5, K.stamp(t, s.label.t)), y = big ? 96 : 304;
        fx.text(0, s.label.text, W / 2 + 3, y + 3, RED, sc, -4);
        fx.text(1, s.label.text, W / 2, y, 0xffffff, sc, -4);
        fx.text(2, s.label.n + ' / 8', W / 2, y + (big ? 36 : 28), RED, 2, -4);
      }
      // The freeze on the head kick: a hard red frame round the screen.
      if (s.freeze && t - s.freeze < 40) {
        gs.lineStyle(10, RED, 1 - (t - s.freeze) / 40); gs.strokeRect(5, 5, W - 10, H - 10);
      }
    }
  };
})();
