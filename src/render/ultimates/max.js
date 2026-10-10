// MAX — Finals Week: a calendar page slams up (MON to FRI, an exam every day), the
// sky goes dark, and textbooks start raining down on the opponent: a few, then dozens,
// piling up into a mountain with them on top of it. MAX climbs, leaps off the top of
// the screen and body-slams them into the pile. Books everywhere.
// Camera: a tilt up into the storm, a whip down with the first falling book, a slow
// crane up the growing pile, a worm's-eye view of the leap, and a heavy shake on the
// slam.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var CAL = 8, STORM = 34, RAIN = [52, 176], CLIMB = 182, LEAP = 204, SLAM = 236, NAP = 262;
  var DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'], EXAMS = ['ALGEBRA', 'BIOLOGY', 'HISTORY', 'ENGLISH', 'CHEM'];
  var COLS = [0xc0392b, 0x2a5fb8, 0x3a8a3a, 0xd8a020, 0x8a3ab0, 0x2a2a30, 0xc05a2a];

  // The pile under them: how tall it has grown.
  function pileH(t) { return t < RAIN[0] ? 0 : Math.min(64, (t - RAIN[0]) * 0.55); }

  // A textbook: a slab with a spine and white page edges, rotated by `a` (world coords).
  function book(g, x, y, w, h, a, col) {
    var cs = Math.cos(a), sn = Math.sin(a);
    var P = function (u, v) { return { x: x + u * cs - v * sn, y: y + u * sn + v * cs }; };
    g.fillStyle(col, 1); g.fillPoints([P(-w / 2, -h / 2), P(w / 2, -h / 2), P(w / 2, h / 2), P(-w / 2, h / 2)], true);
    g.fillStyle(0xf4f0e0, 1); g.fillPoints([P(-w / 2 + 2, h / 2 - 3), P(w / 2 - 1, h / 2 - 3), P(w / 2 - 1, h / 2 - 1), P(-w / 2 + 2, h / 2 - 1)], true);
    g.fillStyle(FG.shade(col, 0.6), 1); g.fillPoints([P(-w / 2, -h / 2), P(-w / 2 + 3, -h / 2), P(-w / 2 + 3, h / 2), P(-w / 2, h / 2)], true);
  }

  FG.ULTIMATES.max = {
    start: function (fx) {
      var s = fx.s;
      s.ls = fx.S(fx.lx0); s.falling = []; s.pile = [];
      for (var i = 0; i < 46; i++) s.pile.push({ ds: (K.hash(i, 1) - 0.5) * 120 * (0.4 + (i % 7) / 7), h: i * 1.4, a: (K.hash(i, 2) - 0.5) * 0.5, w: 22 + K.hash(i, 3) * 10, col: COLS[i % COLS.length] });
      fx.place(fx.l, s.ls, 0); fx.pose(fx.l, 'hit_mid');
      fx.pose(fx.w, 'hv_x');
      fx.cam(s.ls - 30, 110, 1.3, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // The calendar: finals week.
      if (t === CAL) { s.cal = t; fx.flash(0xffffff, 0.6); fx.anim(l, FG.dazedAnim, true); fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 220, f1: 110, gain: 0.3, type: 'sawtooth' }); S.osc({ dur: 0.6, f0: 233, f1: 116, gain: 0.2, type: 'square' }); }); }
      // The sky darkens; the camera tilts up into the storm.
      if (t === STORM) { s.storm = t; fx.cam(s.ls, 260, 1.0, { k: 0.08, rot: -0.04 }); fx.sfx(function (S) { S.noise({ dur: 1.4, freq: 180, q: 0.6, gain: 0.35, type: 'lowpass', attack: 0.3 }); }); }
      if (s.storm && t % 37 === 5 && t < SLAM) { s.bolt = t; fx.sfx(function (S) { S.noise({ dur: 0.6, freq: 400, q: 0.5, gain: 0.3, type: 'lowpass' }); }); }
      // The books come down: a few, then dozens.
      if (t >= RAIN[0] - 18 && t < RAIN[1] - 18) {
        var rate = t < 90 ? 6 : t < 130 ? 3 : 1;
        if (t % rate === 0) s.falling.push({ ds: (K.hash(t, 4) - 0.5) * 70, h: 380 + K.hash(t, 5) * 80, v: 6 + K.hash(t, 6) * 3, a: K.hash(t, 7) * 6, spin: (K.hash(t, 8) - 0.5) * 0.4, w: 22 + K.hash(t, 9) * 10, col: COLS[t % COLS.length] });
      }
      if (t === RAIN[0] - 18) fx.cam(s.ls, 200, 1.2, { k: 0.25 }); // whip down after the first one
      var ph = pileH(t);
      s.falling.forEach(function (b) { b.h -= b.v; b.v += 0.25; b.a += b.spin; });
      s.falling = s.falling.filter(function (b) {
        if (b.h > ph + 30) return true;
        if (t % 2 === 0) fx.sfx(function (S) { S.osc({ dur: 0.07, f0: 150 + K.hash(b.ds, 1) * 80, f1: 70, gain: 0.12 }); });
        return false;
      });
      // They end up on top of the pile, getting hit by book after book.
      if (t >= RAIN[0]) fx.place(l, s.ls, ph);
      if (t >= RAIN[0] && t < RAIN[1]) fx.cam(s.ls, 120 + ph * 0.8, 1.35 - ph * 0.004, { k: 0.15 });
      var hi = hits.indexOf(t);
      if (hi >= 0 && hi < hits.length - 1) {
        fx.hit(l, hi % 2 ? 'overhead' : 'body', { strength: 'medium', hits: hi + 1, shake: 0.006, y: ph + 70 });
        fx.pose(l, hi % 2 ? 'hit_high' : 'hit_mid');
        fx.sfx(function (S) { S.osc({ dur: 0.1, f0: 180, f1: 60, gain: 0.3 }); S.noise({ dur: 0.08, freq: 2400, q: 1, gain: 0.08, type: 'highpass' }); });
      }
      if (t === RAIN[1] + 4) fx.pose(l, 'down');
      // MAX climbs up the side of the pile...
      if (t === CLIMB) { fx.place(w, s.ls - 90, 0); fx.face(w, fx.dir); fx.anim(w, [[1, 'climb'], [8, 'idle'], [16, 'climb']], true); fx.cam(s.ls - 40, 120, 1.15, { k: 0.12 }); }
      if (t > CLIMB && t < LEAP) { var u = (t - CLIMB) / (LEAP - CLIMB); fx.place(w, s.ls - 90 + 30 * u, ph * u); }
      // ...and leaps off the top of the screen. A worm's-eye view.
      if (t === LEAP) { fx.pose(w, 'jump'); fx.cam(s.ls - 20, 160, 1.0, { cut: true, rot: 0.08 }); fx.sfx(function (S) { S.noise({ dur: 0.4, freq: 600, f1: 2400, q: 1, gain: 0.2 }); }); }
      if (t > LEAP && t < SLAM) {
        var v = (t - LEAP) / (SLAM - LEAP);
        fx.place(w, s.ls - 60 + 60 * v, ph + 30 + Math.sin(v * Math.PI) * 220);
        if (v > 0.55) fx.pose(w, 'splash');
        fx.cam(s.ls - 20, 140 + Math.sin(v * Math.PI) * 90, 1.0, { k: 0.3, rot: 0.08 });
      }
      if (t === SLAM) {
        fx.place(w, s.ls, ph + 14); fx.pose(w, 'splash'); fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, shake: 0.05, y: ph + 20, hits: hits.length });
        fx.flash(0xffffff, 0.7); fx.slow(30, 0.3); s.slam = t;
        fx.cam(s.ls, 90 + ph, 1.6, { cut: true, rot: -0.03 });
        fx.sfx(function (S) { S.osc({ dur: 1, f0: 70, f1: 22, gain: 1 }); S.noise({ dur: 0.6, freq: 800, q: 0.4, gain: 0.5 }); for (var p = 0; p < 8; p++) S.noise({ dur: 0.1, freq: 3000 + p * 300, q: 2, gain: 0.06, type: 'highpass', at: 0.1 + p * 0.07 }); });
        for (var k = 0; k < 18; k++) s.falling.push({ ds: 0, h: ph + 20, v: -5 - K.hash(k, 11) * 6, vx: (K.hash(k, 12) - 0.5) * 12, a: K.hash(k, 13) * 6, spin: (K.hash(k, 14) - 0.5) * 0.6, w: 24, col: COLS[k % COLS.length], fly: true });
        fx.crowd(3);
      }
      s.falling.forEach(function (b) { if (b.fly) b.ds += b.vx; });
      if (t === NAP) { fx.anim(w, [[1, 'splash'], [10, 'stand'], [24, 'flex']]); fx.place(w, s.ls - 50, 0); fx.say(w, 'Heavy course load.', 80); fx.cam(s.ls - 30, 110, 1.2, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb, gf = fx.gf, gs = fx.gs;
      // The storm: the sky darkens, lightning now and then.
      if (s.storm && t < SLAM + 30) {
        var dk = Math.min(0.6, (t - s.storm) / 40);
        gs.fillStyle(0x0a0a20, dk); gs.fillRect(0, 0, W, H);
        if (s.bolt && t - s.bolt < 4) { gs.fillStyle(0xffffff, 0.35); gs.fillRect(0, 0, W, H); }
      }
      // The pile.
      var ph = pileH(t);
      if (ph > 0) s.pile.forEach(function (b, i) {
        if (b.h > ph + 6) return;
        var p = fx.P(s.ls + b.ds * Math.min(1, ph / 50), Math.min(b.h, ph));
        book(i % 3 ? g : gf, p.x, p.y - 4, b.w, 8, b.a, b.col);
      });
      s.falling.forEach(function (b) { var p = fx.P(s.ls + b.ds, b.h); book(gf, p.x, p.y, b.w, 8, b.a, b.col); });
      // The calendar page.
      if (s.cal && t < STORM + 20) {
        var sc = K.stamp(t, s.cal), cx = W / 2, cy = 150, cw = 300 * sc, ch = 120 * sc;
        gs.fillStyle(0x000000, 0.4); gs.fillRect(cx - cw / 2 + 6, cy - ch / 2 + 6, cw, ch);
        gs.fillStyle(0xf8f4e8, 1); gs.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
        gs.fillStyle(0xc0392b, 1); gs.fillRect(cx - cw / 2, cy - ch / 2, cw, 22 * sc);
        for (var d = 0; d < 5; d++) {
          var dx = cx - cw / 2 + (d + 0.5) * cw / 5;
          gs.lineStyle(1, 0xb8b4a8, 1); gs.lineBetween(cx - cw / 2 + (d + 1) * cw / 5, cy - ch / 2 + 22 * sc, cx - cw / 2 + (d + 1) * cw / 5, cy + ch / 2);
          fx.text(d + 1, DAYS[d], dx, cy - ch / 2 + 34 * sc, 0x2a2a30, 1.2 * sc);
          gs.lineStyle(2, 0xc0392b, 1); gs.strokeCircle(dx, cy + 10 * sc, 14 * sc); // every day circled
        }
        fx.text(0, 'FINALS WEEK', cx, cy - ch / 2 + 11 * sc, 0xffffff, 2 * sc);
      }
      if (t >= RAIN[0] && t < RAIN[1]) fx.text(6, 'BOOKS: ' + Math.round(ph * 1.2), W - 100, 330, 0xffffff, 2);
      if (s.slam && t - s.slam < 50) fx.text(7, 'FINALS WEEK!', W / 2, 110, 0xffa83a, 3 * K.stamp(t, s.slam), -5);
    }
  };
})();
