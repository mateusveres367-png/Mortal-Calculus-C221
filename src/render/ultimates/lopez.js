// LOPEZ — I Knew It: a counter. Hit him in the stance and he closes the blinds, then
// reveals a corkboard covered in red string, photos and graphs of the opponent's
// habits. They attack three times; he dodges each one without looking. "I knew it."
// Then one perfect punish.
// Camera: noir. A tilted frame, a slow pan along the board as the strings go up, a
// still two-shot for the dodges, and a snap zoom on the punish.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var CUT = 14, BLINDS = [22, 46], WALK = [52, 72], PAN = [76, 122], ATTACKS = [140, 162, 184], LINE = 200, TURN = 226;
  var BOARD = { s1: -262, s2: -66, h1: 66, h2: 196 }, WIN = { s1: 92, s2: 196, h1: 82, h2: 190 };
  var ME = -36; // where he stands, studying the board
  var MOVES = ['jab', 'mid', 'heavy'], DODGES = ['dodge_lean', 'dodge_duck', 'dodge_side'];

  // The office, the window and its blinds (u: 0 open .. 1 closed).
  function drawOffice(fx, g, t, u) {
    var light = 1 - u * 0.75;
    fx.fill(g, 0x2c2a30);
    fx.rect(g, -W * 1.6, -90, W * 1.6, 0, 0x1c1814);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 6, 0x120e0c);
    // The window: daylight through the slats.
    fx.rect(g, WIN.s1 - 6, WIN.h1 - 6, WIN.s2 + 6, WIN.h2 + 6, 0x3a2e24);
    fx.rect(g, WIN.s1, WIN.h1, WIN.s2, WIN.h2, 0xcfe6ff);
    var n = 12, step = (WIN.h2 - WIN.h1) / n;
    for (var k = 0; k < n; k++) {
      var top = WIN.h2 - k * step, th = 2 + (step - 2) * u;
      fx.rect(g, WIN.s1, top - th, WIN.s2, top, 0xd8cdb4);
      fx.rect(g, WIN.s1, top - th, WIN.s2, top - th + 1, 0xa89c84);
    }
    fx.rect(g, (WIN.s1 + WIN.s2) / 2 - 1, WIN.h1, (WIN.s1 + WIN.s2) / 2 + 1, WIN.h2, 0x3a2e24, 0.6);
    // The cord.
    fx.rect(g, WIN.s1 + 8, WIN.h1 - 30 + u * 20, WIN.s1 + 9, WIN.h2, 0xe8e0c8);
    fx.circle(g, WIN.s1 + 8.5, WIN.h1 - 30 + u * 20, 2.5, 0xe8e0c8);
    // Stripes of light across the room, fading as the blinds shut.
    for (var b = 0; b < 7; b++) {
      var h0 = 150 - b * 22;
      fx.poly(g, [[WIN.s1, h0], [WIN.s1, h0 - 8], [WIN.s1 - 300, h0 - 120], [WIN.s1 - 300, h0 - 104]], 0xfff2c8, 0.12 * light + 0.02);
    }
    // Everything darker once they're shut.
    fx.fill(g, 0x000000, 0.45 * u);
  }

  // The board: cork, photos of the opponent, graphs, notes, red string.
  function drawBoard(fx, g, t, k, lit) {
    var hash = K.hash, B = BOARD;
    fx.rect(g, B.s1 - 6, B.h1 - 6, B.s2 + 6, B.h2 + 6, 0x3a2414);
    fx.rect(g, B.s1, B.h1, B.s2, B.h2, 0xc49a6c);
    for (var i = 0; i < 60; i++) fx.rect(g, B.s1 + hash(i, 1) * (B.s2 - B.s1), B.h1 + hash(i, 2) * (B.h2 - B.h1), B.s1 + hash(i, 1) * (B.s2 - B.s1) + 2, B.h1 + hash(i, 2) * (B.h2 - B.h1) + 2, 0x9a7448);
    var l = fx.l, pins = [];
    // Polaroids of their favourite moves.
    var photos = [['jab', -244, 150, 'JAB. ALWAYS.'], ['heavy', -196, 110, 'BIG SWING'], ['mid', -146, 160, 'KICKS 2ND'], ['jump', -112, 100, 'JUMPS IN']];
    photos.forEach(function (p, j) {
      var s0 = p[1], h0 = p[2];
      fx.rect(g, s0 - 1, h0 - 1, s0 + 37, h0 + 43, 0x000000, 0.3);
      fx.rect(g, s0, h0, s0 + 36, h0 + 42, 0xf6f4ee);
      fx.rect(g, s0 + 4, h0 + 12, s0 + 32, h0 + 38, 0x3a4252);
      fx.figure(g, l, p[0] === 'jump' ? 'jump' : fx.strikePose(l, p[0]), s0 + 18, h0 + 13, { scale: 0.24, facing: fx.dir });
      fx.wtext(6 + j, p[3], s0 + 18, h0 + 6, 0x2a2a2a, 0.6);
      pins.push([s0 + 18, h0 + 40]);
    });
    // A bar chart of what they press, a line going the wrong way for them.
    fx.rect(g, -220, 74, -170, 104, 0xffffff);
    [[0.8, 0xd8433b], [0.45, 0x3a6fd8], [0.6, 0xe0a81e]].forEach(function (b, j) { fx.rect(g, -214 + j * 15, 78, -204 + j * 15, 78 + 22 * b[0], b[1]); });
    fx.wtext(10, 'P   K   H', -195, 70, 0x2a2a2a, 0.6);
    fx.rect(g, -160, 74, -116, 98, 0xffffff);
    fx.line(g, -156, 94, -146, 88, 0xd8202a, 2); fx.line(g, -146, 88, -136, 90, 0xd8202a, 2); fx.line(g, -136, 90, -122, 78, 0xd8202a, 2);
    // Notes: their name, and the verdict.
    fx.rect(g, -100, 140, -72, 168, 0xfff07a); fx.wtext(11, '?!', -86, 154, 0x2a4a9a, 1.2);
    fx.rect(g, -106, 172, -70, 192, 0xf6f4ee); fx.wtext(12, l.def.name, -88, 182, 0x2a2a2a, 0.7);
    pins.push([-86, 166], [-88, 190], [-195, 102], [-138, 96]);
    // Red string, pin to pin, going up as the camera passes.
    var order = [[0, 4], [4, 2], [2, 1], [1, 6], [6, 3], [3, 7], [7, 5], [5, 0], [2, 7], [1, 3]];
    var shown = Math.floor(order.length * Math.min(1, k)), cur = order.length * Math.min(1, k) - shown;
    for (var o = 0; o < Math.min(order.length, shown + 1); o++) {
      var a = pins[order[o][0]], b = pins[order[o][1]], v = o < shown ? 1 : cur;
      fx.line(g, a[0], a[1], a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v, 0xd8202a, 1.5);
    }
    pins.forEach(function (p) { fx.circle(g, p[0], p[1], 2.5, 0xd8202a); fx.circle(g, p[0] - 0.8, p[1] + 0.8, 1, 0xff9a8a); });
    // The hanging bulb's light on it.
    if (lit) {
      var c = fx.P((B.s1 + B.s2) / 2, (B.h1 + B.h2) / 2);
      for (var r = 4; r > 0; r--) { g.fillStyle(0xfff0c0, 0.05); g.fillEllipse(c.x, c.y, 120 + r * 50, 80 + r * 30); }
    }
  }

  FG.ULTIMATES.lopez = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0); s.u = 0; s.k = 0;
      // Frozen: they've walked right into it.
      fx.pose(fx.l, fx.strikePose(fx.l));
      fx.pose(fx.w, 'parry');
      fx.cam(fx.S((fx.x0 + fx.lx0) / 2), 90, 1.6, { k: 0.3 });
      fx.sfx(function (S) { S.osc({ dur: 0.6, f0: 98, gain: 0.12, type: 'sawtooth', attack: 0.02 }); S.osc({ dur: 0.6, f0: 147, gain: 0.06, type: 'sawtooth' }); });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // His office.
      if (t === CUT) {
        fx.cutaway = true; s.office = true;
        fx.place(w, WIN.s1 + 6, 0); fx.face(w, -fx.dir); fx.pose(w, 'crossed');
        fx.place(l, 250, 0); fx.face(l, -fx.dir); fx.pose(l, 'idle');
        fx.cam(40, 110, 1.05, { cut: true, rot: 0.05 });
        fx.flash(0x000000, 0.9);
      }
      // The blinds come down.
      if (t === BLINDS[0]) {
        fx.anim(w, [[1, 'blinds'], [10, 'blinds2'], [14, 'blinds'], [20, 'blinds2'], [24, 'crossed']]);
        fx.cam(WIN.s1 - 20, 120, 1.45, { k: 0.15, rot: 0.06 });
        fx.sfx(function (S) { for (var c = 0; c < 14; c++) S.noise({ dur: 0.025, freq: 2400 + c * 60, q: 5, gain: 0.12, at: c * 0.028 }); S.noise({ dur: 0.35, freq: 1200, f1: 3000, q: 2, gain: 0.05 }); });
      }
      if (t >= BLINDS[0] && t <= BLINDS[1]) s.u = K.ease((t - BLINDS[0]) / (BLINDS[1] - BLINDS[0]));
      // Over to the board; the light over it clicks on.
      if (t === WALK[0]) fx.anim(w, [[1, 'crossed'], [6, 'idle'], [12, 'crossed']], true);
      if (t > WALK[0] && t <= WALK[1]) fx.place(w, WIN.s1 + 6 + (ME - WIN.s1 - 6) * K.ease((t - WALK[0]) / (WALK[1] - WALK[0])), 0);
      if (t === WALK[1]) { fx.pose(w, 'study'); s.lit = true; fx.sfx(function (S) { S.noise({ dur: 0.03, freq: 3000, q: 4, gain: 0.25 }); S.osc({ dur: 2.5, f0: 120, gain: 0.02, attack: 0.1 }); }); }
      // A slow pan along the board as the string goes up, pin to pin.
      if (t >= PAN[0] && t <= PAN[1]) {
        var u = (t - PAN[0]) / (PAN[1] - PAN[0]);
        s.k = u;
        fx.cam(BOARD.s1 + 40 + (BOARD.s2 - BOARD.s1 - 80) * u, 132, 1.85, { k: 0.2, rot: 0 });
        if ((t - PAN[0]) % 5 === 0) { var pf = 180 + K.hash(t, 1) * 200; fx.sfx(function (S) { S.osc({ dur: 0.35, f0: pf, gain: 0.08, type: 'triangle' }); S.osc({ dur: 0.2, f0: pf * 2, gain: 0.03 }); }); }
      }
      if (t === PAN[1] + 4) { s.k = 1; fx.cam(ME + 70, 110, 1.15, { k: 0.12, rot: 0.04 }); }
      // They come at him three times. He doesn't even look.
      for (var a = 0; a < 3; a++) {
        var at = ATTACKS[a], id = MOVES[a], from = a === 0 ? 250 : ME + 44 + a * 4;
        if (t === at - 12) { fx.anim(l, [[1, 'dash'], [8, fx.windupPose(l, id)]]); s.run = { from: fx.S(fx.px(l)), to: ME + 34 - a * 2, t: t }; }
        if (s.run && t > s.run.t && t <= s.run.t + 10) fx.place(l, s.run.from + (s.run.to - s.run.from) * K.ease((t - s.run.t) / 10), 0);
        if (t === at - 2) fx.pose(w, DODGES[a]);
        if (t === at) {
          fx.anim(l, [[1, fx.strikePose(l, id)], [10, fx.strikePose(l, id)], [16, 'idle']]);
          s.miss = t;
          fx.sfx(function (S) { S.noise({ dur: 0.2, freq: 700, f1: 2600, q: 1.2, gain: 0.2 }); });
        }
        if (t === at + 10) fx.pose(w, 'study');
      }
      // "I knew it."
      if (t === LINE) {
        fx.say(w, 'I knew it.', 30);
        fx.cam(ME + 40, 104, 1.35, { k: 0.1, rot: 0.06 });
        fx.sfx(function (S) { S.osc({ dur: 1.4, f0: 110, gain: 0.1, type: 'sawtooth', attack: 0.05 }); S.osc({ dur: 1.4, f0: 131, gain: 0.07, type: 'sawtooth', attack: 0.05 }); S.osc({ dur: 1.4, f0: 165, gain: 0.05, type: 'triangle', attack: 0.05 }); });
      }
      // The punish.
      if (t === TURN) { fx.face(w, fx.dir); fx.anim(w, [[1, 'parry'], [hits[0] - TURN, 'counter_x'], [hits[0] - TURN + 30, 'counter_x'], [hits[0] - TURN + 50, 'crossed']]); fx.anim(l, [[1, fx.windupPose(l, 'heavy')], [20, fx.windupPose(l, 'heavy')]]); }
      if (t === hits[0]) {
        fx.hit(l, 'power', { ch: true, hits: 1, shake: 0.035, y: 70 });
        fx.pose(l, 'juggle');
        fx.flash(0xffffff, 0.9); fx.slow(36, 0.25);
        fx.cam(ME + 24, 90, 1.9, { cut: true, rot: -0.04 });
        fx.sfx(function (S) { S.noise({ dur: 0.05, freq: 5000, q: 1, gain: 0.45 }); S.osc({ dur: 0.7, f0: 110, f1: 30, gain: 0.9 }); S.noise({ dur: 0.4, freq: 1200, q: 0.5, gain: 0.3, at: 0.03 }); });
        s.punish = t;
      }
      if (t > hits[0] && t < hits[0] + 36) {
        var v = (t - hits[0]) / 36;
        fx.place(l, ME + 34 + 80 * v, Math.sin(v * Math.PI) * 40);
        fx.cam(ME + 34 + 40 * v, 100, 1.9 - v * 0.6, { k: 0.2, rot: -0.04 });
      }
      if (t === hits[0] + 36) { fx.pose(l, 'down'); fx.dust(fx.px(l), 8, 2); fx.shake(0.012); }
      // Back on the stage.
      if (t === 272) {
        fx.cutaway = false; s.office = false;
        fx.place(w, s.sw, 0); fx.face(w, fx.dir); fx.pose(w, 'crossed');
        fx.place(l, s.sw + 80, 0); fx.pose(l, 'down');
        fx.cam(s.sw + 40, 112, 1.1, { cut: true });
        fx.flash(0x000000, 0.8);
      }
    },
    draw: function (fx, t) {
      var s = fx.s;
      // Frozen on the stage: everything goes grey and blue.
      if (t < CUT) { fx.gs.fillStyle(0x203050, 0.35); fx.gs.fillRect(0, 0, W, H); fx.text(0, 'HMM.', W / 2 + 70, 110, 0x9fe0ff, 3, -4); }
      if (!s.office) return;
      drawOffice(fx, fx.gb, t, s.u);
      drawBoard(fx, fx.gb, t, s.k, s.lit);
      // Each attack misses: a MISS and a streak where they swung.
      if (s.miss && t - s.miss < 22) {
        var p = fx.at2(fx.l, 70), a = 1 - (t - s.miss) / 22;
        fx.text(1, 'MISS', p[0] - fx.dir * 40, p[1] - 40 - (t - s.miss), 0xffffff, 2.5, -6, a);
      }
      if (s.punish && t - s.punish < 50) fx.text(2, 'PERFECT PUNISH', W / 2 + 40, 110, 0xffd23f, 3.5 * K.stamp(t, s.punish), -4, 1 - Math.max(0, (t - s.punish - 38) / 12));
      // Noir: deep shadows at the edges.
      for (var v = 0; v < 6; v++) { fx.gs.fillStyle(0x000000, 0.08); fx.gs.fillRect(0, 0, W, 10 + v * 8); fx.gs.fillRect(0, H - 10 - v * 8, W, 10 + v * 8); }
    }
  };
})();
