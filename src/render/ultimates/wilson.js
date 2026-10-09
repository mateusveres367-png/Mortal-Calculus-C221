// WILSON — Tenure: the stage goes dark except for a chalkboard. He writes one equation
// in silence while flashbacks of 29 years of classes flicker by, a hit landing on each
// year, the counter ticking up to 29. He caps the marker and turns around, and the
// opponent is already down.
// Camera: locked off and patient, creeping in the whole time; nothing else moves it.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var DARK = [2, 14], WALK = [16, 36], CAP = 252, TURN = 266, LIGHTS = 272;
  var EQ = '1997 + 29 = 2026', BOARD = { s1: -130, s2: 70, h1: 70, h2: 180 }; // (across from where he stands)
  var BOARD_MATH = ['Y = MX + B', 'A² + B² = C²', "F'(X)", 'SIN²X + COS²X = 1', '√(B² - 4AC)', 'ΣN = N(N+1)/2', '|X| < 3', 'LOG(AB)', '∫ X DX', 'ΔY / ΔX', 'X = -B / 2A', 'P(A) + P(B)', 'Π R²'];

  // A memory of one year's class: sepia, rows of students, the year on the board.
  function flashback(fx, g, year, k, a) {
    var hash = K.hash;
    g.fillStyle(0x6a4a2a, 0.5 * a); g.fillRect(0, 0, W, H);
    g.fillStyle(0x2a3a2a, 0.7 * a); g.fillRect(70 + hash(k, 1) * 40, 70, 300, 110);
    g.lineStyle(4, 0x8a6a3a, 0.8 * a); g.strokeRect(70 + hash(k, 1) * 40, 70, 300, 110);
    for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) {
      var x = 60 + c * 96 + r * 40 + hash(k, c + r * 6) * 10, y = 240 + r * 50;
      g.fillStyle(0x2a1a0a, 0.6 * a); g.fillCircle(x, y - 26, 10); g.fillRect(x - 12, y - 16, 24, 26);
      g.fillStyle(0x4a2e14, 0.6 * a); g.fillRect(x - 22, y + 8, 44, 8);
    }
    fx.text(4, String(year), 120 + hash(k, 1) * 40 + 30, 100, 0xf2e2b8, 3, -3, a);
    fx.text(5, BOARD_MATH[k % BOARD_MATH.length], 220 + hash(k, 1) * 40, 140, 0xf2e2b8, 1.6, -2, a * 0.9);
  }

  FG.ULTIMATES.wilson = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0); s.sl = s.sw + 92; s.n = 0; s.chars = 0;
      s.b1 = s.sw + BOARD.s1; s.b2 = s.sw + BOARD.s2;
      fx.place(fx.l, s.sl - 40, 0); fx.pose(fx.l, fx.strikePose(fx.l));
      fx.pose(fx.w, 'stare');
      fx.cam(s.sw + 30, 110, 1.15, { k: 0.2 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, last = hits.length - 1;
      // The lights go out, all but one.
      if (t === DARK[0]) fx.sfx(function (S) { S.noise({ dur: 0.05, freq: 2000, q: 2, gain: 0.3 }); S.osc({ dur: 0.4, f0: 60, f1: 40, gain: 0.3 }); });
      if (t === DARK[1]) {
        fx.cutaway = true; s.dark = true;
        fx.place(l, s.sl, 0); fx.face(l, -fx.dir); fx.pose(l, 'idle');
        fx.cam(s.sw + 20, 112, 1.08, { cut: true });
      }
      // To the board, his back to them.
      if (t === WALK[0]) { fx.face(w, -fx.dir); fx.anim(w, [[1, 'stand'], [8, 'idle'], [16, 'stand']], true); }
      if (t > WALK[0] && t <= WALK[1]) fx.place(w, s.sw - 40 * K.ease((t - WALK[0]) / (WALK[1] - WALK[0])), 0);
      if (t === WALK[1]) fx.anim(w, [[1, 'write1'], [5, 'write2'], [10, 'write1']], true);
      // Patient: the camera creeps in, the whole time.
      if (t > DARK[1] && t < TURN) fx.cam(s.sw + 10, 112, 1.08 + (t - DARK[1]) * 0.0011, { k: 0.05 });
      // The equation, one character at a time, the marker squeaking.
      if (t >= WALK[1] && t < CAP) {
        var c = Math.min(EQ.length, Math.floor((t - WALK[1]) / ((CAP - 8 - WALK[1]) / EQ.length)));
        if (c > s.chars && EQ[c - 1] !== ' ') fx.sfx(function (S) { var f = 2200 + K.hash(c, 7) * 900; S.osc({ dur: 0.07, f0: f, f1: f * 1.15, gain: 0.025, type: 'sine', vib: [60, 120] }); });
        s.chars = c;
      }
      // Every year lands.
      for (var k = 0; k <= last; k++) {
        if (t !== hits[k]) continue;
        s.n = k + 1; s.nT = t; s.year = 1997 + k;
        var end = k === last;
        fx.hit(l, k % 3 ? 'jab' : 'body', { strength: end ? 'heavy' : 'light', hits: k + 1, shake: end ? 0.01 : 0.002, y: 46 + (k % 4) * 10 });
        fx.pose(l, end ? 'down' : k % 2 ? 'hit_high' : 'hit_mid');
        fx.sfx(function (S) { S.noise({ dur: 0.02, freq: 1200, q: 1, gain: 0.12 }); }); // a projector clicking to the next slide
      }
      // The cap goes on. He turns round.
      if (t === CAP) { fx.anim(w, [[1, 'write1'], [6, 'cap'], [14, 'cap']]); fx.sfx(function (S) { S.noise({ dur: 0.02, freq: 4200, q: 6, gain: 0.35, at: 0.08 }); S.osc({ dur: 0.04, f0: 1800, gain: 0.05, type: 'triangle', at: 0.08 }); }); }
      if (t === TURN) { fx.face(w, fx.dir); fx.anim(w, [[1, 'cap'], [10, 'stand'], [24, 'folded']]); }
      if (t === LIGHTS) {
        s.lights = t; fx.cutaway = false;
        fx.place(w, s.sw, 0);
        fx.cam(s.sw + 46, 112, 1.0, { cut: true });
        fx.sfx(function (S) { S.osc({ dur: 2.0, f0: 55, gain: 0.25, attack: 0.02 }); S.osc({ dur: 2.0, f0: 82.4, gain: 0.12 }); });
      }
      if (t > LIGHTS) s.dark = false;
    },
    draw: function (fx, t) {
      var s = fx.s, gb = fx.gb, gs = fx.gs;
      // Going dark on the stage.
      if (t >= DARK[0] && t < DARK[1]) { gs.fillStyle(0x000000, (t - DARK[0]) / (DARK[1] - DARK[0])); gs.fillRect(0, 0, W, H); }
      if (s.dark) {
        fx.fill(gb, 0x050507);
        // The board, under its one light.
        var b1 = s.b1, b2 = s.b2, c = fx.P((b1 + b2) / 2, 230);
        gb.fillStyle(0xfff2c8, 0.06); gb.fillTriangle(c.x, c.y, fx.X(b1 - 40), GY, fx.X(b2 + 40), GY);
        fx.rect(gb, b1 - 6, BOARD.h1 - 6, b2 + 6, BOARD.h2 + 6, 0x4a3420);
        fx.rect(gb, b1, BOARD.h1, b2, BOARD.h2, 0x1e3a2a);
        for (var sm = 0; sm < 5; sm++) { var sp = fx.P(b1 + K.hash(sm, 1) * 200, BOARD.h1 + K.hash(sm, 2) * 110); gb.fillStyle(0xffffff, 0.035); gb.fillEllipse(sp.x, sp.y, 70, 18); }
        fx.rect(gb, b1, BOARD.h1 - 4, b2, BOARD.h1, 0x6a4a2a);
        // A dim pool of light where they stand.
        var lp = fx.P(s.sl, 0); gb.fillStyle(0x8a90b0, 0.08); gb.fillEllipse(lp.x, lp.y, 120, 20);
        // What he's written so far.
        if (s.chars) fx.wtext(6, EQ.slice(0, s.chars), (s.b1 + s.b2) / 2, 128, 0xf4f4ec, 1.7, 0);
        // The flashbacks: one year at a time, flickering.
        if (s.nT && t - s.nT < 5 && t < CAP) flashback(fx, gs, s.year, s.n, 0.9 - (t - s.nT) * 0.15);
        // The edges stay black: a vignette.
        for (var v = 0; v < 5; v++) { gs.fillStyle(0x000000, 0.12); gs.fillRect(0, 0, 40 + v * 18, H); gs.fillRect(W - 40 - v * 18, 0, 40 + v * 18, H); }
      }
      // The count: 1 to 29, years.
      if (s.n && (!s.lights || t - s.lights < 40)) {
        var sc = s.n === 29 ? 5 * K.stamp(t, s.nT) : 4 + (t - s.nT < 3 ? 0.8 : 0);
        fx.text(0, String(s.n), W - 110, 196, s.n === 29 ? 0xffd23f : 0xffffff, sc, 0, s.lights ? 1 - (t - s.lights) / 40 : 1);
        fx.text(1, s.n === 1 ? 'YEAR' : 'YEARS', W - 110, 232, 0xd6b0ff, 2, 0, s.lights ? 1 - (t - s.lights) / 40 : 1);
      }
      // Lights up.
      if (s.lights && t - s.lights < 18) { gs.fillStyle(0x000000, 1 - (t - s.lights) / 18); gs.fillRect(0, 0, W, H); }
    }
  };
})();
