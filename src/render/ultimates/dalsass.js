// DALSASS — Pop Quiz: he slams a stack of papers down. Suddenly they're sitting at a
// student desk with a quiz and a ticking timer, sweating. DALSASS snatches the paper,
// red-pens a giant F, and smacks them with the whole stack. The class goes wild.
// Camera: a slow, sweaty push-in on them, a whip-pan to him walking in, a dead-centre
// close-up of the paper, then wide and shaking for the smack.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var SLAM = 18, CUT = 22, WALK = 98, SNATCH = 120, PAPER = 128, RAISE = 172, SMACK = 196, BACK = 252;
  var SO = 50; // where they sit, in set space
  var CREAM = 0xe9dfc4, BOARD = 0x234a35, RED = 0xd81e28;

  // The classroom: a wall, the board, a wall clock, two rows of students at desks.
  function drawRoom(fx, g, t, wild) {
    var hash = K.hash;
    fx.fill(g, CREAM);
    fx.rect(g, -W * 1.6, -80, W * 1.6, 0, 0x8a6a48);           // floor
    for (var b = -12; b < 12; b++) fx.rect(g, b * 44, -80, b * 44 + 2, 0, 0x76583a);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 8, 0x5a4632);              // baseboard
    // The board.
    fx.rect(g, -170, 96, 170, 200, 0x6b4a2a); fx.rect(g, -164, 102, 164, 194, BOARD);
    fx.rect(g, -164, 102, 164, 106, 0xffffff, 0.05);
    if (!fx.s.paper) { // (the close-up of the quiz covers the board)
      fx.wtext(3, 'POP QUIZ!', 0, 176, 0xf2f6ee, 3.2, -3);
      fx.wtext(4, 'PENCILS DOWN WHEN THE TIMER ENDS', 0, 140, 0xf2f6ee, 1.1, -2, 0.85);
      fx.wtext(5, 'NO TALKING', -110, 116, 0xffe98a, 1.1, 0, 0.8);
    }
    // The clock, its second hand racing.
    var c = fx.P(200, 176);
    g.fillStyle(0x222222, 1); g.fillCircle(c.x, c.y, 19); g.fillStyle(0xffffff, 1); g.fillCircle(c.x, c.y, 16);
    var a = t * 0.2;
    g.lineStyle(2, 0x111111, 1); g.lineBetween(c.x, c.y, c.x + Math.cos(a) * 13, c.y + Math.sin(a) * 13);
    g.lineStyle(3, 0x111111, 1); g.lineBetween(c.x, c.y, c.x, c.y - 9);
    // Students at their desks, two rows; they leap up when it all goes off.
    for (var row = 0; row < 2; row++) {
      for (var k = -6; k < 7; k++) {
        var s = k * 62 + row * 31, lift = 22 + row * 14, sc = 0.7 - row * 0.1;
        if (Math.abs(s - SO) < 40 && row === 0) continue; // their own seat is in front
        var id = k * 3 + row, jump = wild ? Math.abs(Math.sin(t * 0.35 + id)) * 12 : 0, col = [0x3a6fd8, 0xd8433b, 0x2f9e6e, 0x8a4ad8, 0xe08a2a][Math.floor(hash(id, 1) * 5)];
        var skin = [0xf0c8a0, 0xc68e5e, 0x8a5a36, 0xe0b48a][Math.floor(hash(id, 2) * 4)], hair = [0x2a1a10, 0x5a3a1a, 0x111111, 0xb08040][Math.floor(hash(id, 3) * 4)];
        fx.rect(g, s - 18 * sc, lift, s + 18 * sc, lift + 22 * sc, 0x6b5238);                 // desk
        fx.rect(g, s - 9 * sc, lift + 22 * sc + jump, s + 9 * sc, lift + 50 * sc + jump, col); // body
        fx.circle(g, s, lift + 58 * sc + jump, 8 * sc, skin);
        fx.rect(g, s - 8 * sc, lift + 60 * sc + jump, s + 8 * sc, lift + 66 * sc + jump, hair);
        if (wild) { // arms up, waving
          var wv = Math.sin(t * 0.5 + id) * 6;
          fx.line(g, s - 8 * sc, lift + 46 * sc + jump, s - 16 * sc + wv, lift + 74 * sc + jump, col, 4 * sc);
          fx.line(g, s + 8 * sc, lift + 46 * sc + jump, s + 16 * sc - wv, lift + 74 * sc + jump, col, 4 * sc);
        }
        fx.rect(g, s - 20 * sc, lift + 20 * sc, s + 20 * sc, lift + 24 * sc, 0x8a6a48);         // desktop in front
      }
    }
  }

  // Their desk and chair: the chair behind them, the desk (and the quiz) in front.
  function drawChair(fx, g, s, tip) {
    var b = fx.P(s - 6, 0);
    g.save(); g.translateCanvas(b.x, b.y); g.rotateCanvas(-tip * fx.dir); g.translateCanvas(-b.x, -b.y);
    fx.rect(g, s - 16, 0, s - 13, 26, 0x3a3a44); fx.rect(g, s + 10, 0, s + 13, 26, 0x3a3a44);
    fx.rect(g, s - 18, 24, s + 14, 28, 0x9a6a3a); fx.rect(g, s - 18, 28, s - 14, 60, 0x9a6a3a);
    g.restore();
  }
  function drawDesk(fx, g, s, paper, fly) {
    var ds = s - 30 + fly.x;
    fx.rect(g, ds - 20, 42 + fly.y, ds + 18, 47 + fly.y, 0x8a6a48);
    fx.rect(g, ds - 18, fly.y, ds - 15, 42 + fly.y, 0x3a3a44); fx.rect(g, ds + 13, fly.y, ds + 16, 42 + fly.y, 0x3a3a44);
    if (paper) { fx.rect(g, ds - 10, 47 + fly.y, ds + 8, 49 + fly.y, 0xffffff); fx.rect(g, ds - 7, 49 + fly.y, ds - 5, 52 + fly.y, 0xe0a81e); }
  }

  // The quiz, close up: their name, three wrong answers, and the giant red F.
  function drawPaper(fx, g, t, k) {
    var cx = W / 2 + 70, cy = 196, pw = 230, ph = 210, x0 = cx - pw / 2, y0 = cy - ph / 2;
    g.fillStyle(0x000000, 0.35); g.fillRect(x0 + 6, y0 + 6, pw, ph);
    g.fillStyle(0xfdfcf6, 1); g.fillRect(x0, y0, pw, ph);
    for (var i = 0; i < 10; i++) { g.fillStyle(0x9fc4e8, 0.7); g.fillRect(x0 + 8, y0 + 30 + i * 18, pw - 16, 1); }
    g.fillStyle(0xe88a8a, 1); g.fillRect(x0 + 26, y0, 1, ph);
    fx.text(6, 'NAME: ' + fx.l.def.name, x0 + 90, y0 + 18, 0x1a1a22, 1.5);
    fx.text(7, '1. 2X + 3 = 7     X = 5', x0 + 110, y0 + 46, 0x2a4a9a, 1.2);
    fx.text(8, '2. √49 = ?        ¡ DUNNO', x0 + 110, y0 + 64, 0x2a4a9a, 1.2);
    fx.text(9, '3. 0.999... = 1   NO WAY', x0 + 110, y0 + 82, 0x2a4a9a, 1.2);
    // The F: down, across the top, across the middle (k: 0..3 strokes drawn).
    var fx0 = cx - 40, fy0 = cy - 70;
    function seg(x1, y1, x2, y2, u) {
      if (u <= 0) return;
      var ex = x1 + (x2 - x1) * Math.min(1, u), ey = y1 + (y2 - y1) * Math.min(1, u);
      g.lineStyle(20, 0x8a0d12, 0.35); g.lineBetween(x1 + 3, y1 + 3, ex + 3, ey + 3);
      g.lineStyle(17, RED, 1); g.lineBetween(x1, y1, ex, ey);
      g.fillStyle(RED, 1); g.fillCircle(x1, y1, 8.5); g.fillCircle(ex, ey, 8.5);
    }
    seg(fx0, fy0, fx0 - 6, fy0 + 150, k);
    seg(fx0 - 2, fy0, fx0 + 92, fy0 - 6, k - 1);
    seg(fx0 - 3, fy0 + 66, fx0 + 66, fy0 + 62, k - 2);
    if (k >= 3) { g.lineStyle(5, RED, 1); g.strokeEllipse(cx + 10, cy + 6, 220, 196); }
    return { pen: k < 3 ? [k < 1 ? fx0 - 6 * k : k < 2 ? fx0 - 2 + 94 * (k - 1) : fx0 - 3 + 69 * (k - 2), k < 1 ? fy0 + 150 * k : k < 2 ? fy0 - 6 * (k - 1) : fy0 + 66 - 4 * (k - 2)] : null };
  }

  // Sounds: the wall clock, a heartbeat, the red pen squeaking, the smack.
  function tick(fx, hi) { fx.sfx(function (S) { S.noise({ dur: 0.03, freq: hi ? 3200 : 2400, q: 6, gain: 0.3 }); S.osc({ dur: 0.05, f0: hi ? 1900 : 1500, gain: 0.05, type: 'triangle' }); }); }
  function beat(fx) { fx.sfx(function (S) { S.osc({ dur: 0.12, f0: 70, f1: 40, gain: 0.5 }); S.osc({ dur: 0.12, f0: 64, f1: 36, gain: 0.4, at: 0.16 }); }); }
  function squeak(fx, up) { fx.sfx(function (S) { S.osc({ dur: 0.22, f0: up ? 1800 : 2400, f1: up ? 2600 : 1700, gain: 0.05, type: 'sawtooth', vib: [40, 80] }); S.noise({ dur: 0.2, freq: 5000, q: 5, gain: 0.05 }); }); }

  FG.ULTIMATES.dalsass = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0);
      fx.place(fx.l, s.sw + 46, 0); fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [8, 'papers_up'], [14, 'papers_up'], [SLAM, 'papers_slam'], [CUT, 'papers_slam']]);
      fx.cam(s.sw + 20, 100, 1.4, { k: 0.2 });
      s.k = 0; s.flyX = 0; s.flyY = 0; s.tip = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === SLAM) {
        fx.shake(0.02);
        fx.sfx(function (S) { S.osc({ dur: 0.25, f0: 140, f1: 50, gain: 0.7 }); S.noise({ dur: 0.15, freq: 2500, q: 0.6, gain: 0.3 }); });
        for (var p = 0; p < 10; p++) fx.scene.effects.props.push({ x: fx.px(w) + fx.dir * 26, y: GY - 40, vx: (Math.random() - 0.5) * 5, vy: -2 - Math.random() * 3, rot: 0, vr: (Math.random() - 0.5) * 0.4, life: 40, w: 9, h: 11, color: 0xfdfcf6 });
      }
      // The classroom: they're at a desk, he's nowhere to be seen.
      if (t === CUT) {
        fx.cutaway = true;
        w._hidden = true;
        fx.place(l, SO, 0); fx.face(l, -fx.dir); fx.pose(l, 'desk_sit');
        fx.cam(SO - 10, 80, 1.25, { cut: true });
        fx.flash(0xffffff, 0.9);
        s.room = t;
      }
      if (t > CUT && t < WALK) {
        var u = (t - CUT) / (WALK - CUT);
        fx.cam(SO - 14, 72, 1.25 + u * 0.75, { k: 0.08 }); // closer and closer
        if (t === CUT + 20) { fx.pose(l, 'desk_sweat'); l._face = { type: 'wince' }; }
        var gap = Math.max(6, Math.round(22 - u * 16));
        if ((t - CUT) % gap === 0) tick(fx, (t - CUT) / gap % 2 === 0);
        if ((t - CUT) % 30 === 0) beat(fx);
        if (t % 5 === 0) { var hp = fx.P(SO - 2, 84); fx.scene.effects.parts.push({ x: hp.x + (Math.random() - 0.5) * 14, y: hp.y, vx: (Math.random() - 0.5) * 1.6, vy: -1.4, life: 26, size: 3, color: 0x7ac8ff }); }
      }
      // In he walks.
      if (t === WALK) {
        w._hidden = false; fx.face(w, fx.dir);
        fx.place(w, -180, 0); fx.anim(w, [[1, 'idle'], [6, 'idle2'], [12, 'idle']], true);
        fx.cam(SO - 60, 96, 1.3, { k: 0.3 });
        fx.sfx(function (S) { S.noise({ dur: 0.25, freq: 600, f1: 2400, q: 0.7, gain: 0.12 }); });
      }
      if (t > WALK && t < SNATCH) {
        fx.place(w, -180 + (SO - 46 + 180) * K.ease((t - WALK) / (SNATCH - WALK - 4)), 0);
        if ((t - WALK) % 10 === 5) fx.sfx(function (S) { S.osc({ dur: 0.07, f0: 180, f1: 90, gain: 0.25 }); S.noise({ dur: 0.04, freq: 2600, q: 3, gain: 0.08 }); });
      }
      if (t === SNATCH) {
        fx.anim(w, [[1, 'snatch'], [6, 'pen'], [10, 'pen']]);
        fx.pose(l, 'desk_panic');
        s.snatched = true;
        fx.sfx(function (S) { S.noise({ dur: 0.18, freq: 1800, f1: 5200, q: 2, gain: 0.25 }); });
      }
      // Red pen: three strokes, three hits.
      if (t === PAPER) { s.paper = t; fx.cam(SO - 30, 96, 1.2, { k: 0.3 }); }
      var strokes = [[PAPER + 2, hits[0]], [hits[0] + 2, hits[1]], [hits[1] + 2, hits[2]]];
      for (var k = 0; k < 3; k++) {
        if (t === strokes[k][0]) { squeak(fx, k !== 0); fx.pose(w, k % 2 ? 'pen' : 'pen2'); }
        if (t >= strokes[k][0] && t <= strokes[k][1]) s.k = k + (t - strokes[k][0]) / (strokes[k][1] - strokes[k][0]);
        if (t === hits[k]) {
          fx.hit(l, 'jab', { strength: 'light', hits: k + 1, shake: 0.006, y: 60 });
          fx.pose(l, k === 2 ? 'desk_panic' : 'desk_sweat');
        }
      }
      if (t === hits[2]) { s.k = 3; fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 220, f1: 110, gain: 0.12, type: 'square' }); }); }
      // The whole stack.
      if (t === RAISE) {
        s.paper = 0; s.stack = true;
        fx.anim(w, [[1, 'pen'], [8, 'stack_up'], [SMACK - RAISE - 2, 'stack_up'], [SMACK - RAISE + 2, 'stack_x'], [SMACK - RAISE + 30, 'stack_x'], [SMACK - RAISE + 44, 'idle']]);
        fx.cam(SO - 30, 110, 1.15, { k: 0.2 });
        fx.sfx(function (S) { S.noise({ dur: 0.5, freq: 300, f1: 1200, q: 0.6, gain: 0.1, attack: 0.3 }); });
      }
      if (t === SMACK) {
        s.stack = false; s.wild = t;
        fx.hit(l, 'overhead', { ch: true, hits: 4, shake: 0.035, y: 70 });
        l._face = null; fx.pose(l, 'hit_high');
        fx.flash(0xffffff, 0.7); fx.slow(26, 0.4);
        fx.cam(SO - 20, 120, 1.0, { k: 0.4 });
        fx.sfx(function (S) {
          S.osc({ dur: 0.4, f0: 120, f1: 35, gain: 0.9 });
          S.noise({ dur: 0.3, freq: 900, q: 0.5, gain: 0.5, type: 'lowpass' });
          for (var q = 0; q < 8; q++) S.noise({ dur: 0.06, freq: 4000 + q * 300, q: 2, gain: 0.08, at: 0.05 + q * 0.05 });
          S.noise({ dur: 2.6, freq: 1100, q: 0.6, gain: 0.16, attack: 0.25, at: 0.2 }); // the class goes wild
        });
        for (var pp = 0; pp < 36; pp++) fx.scene.effects.props.push({ x: fx.px(l) + (Math.random() - 0.5) * 30, y: GY - 60 - Math.random() * 30, vx: (Math.random() - 0.5) * 9, vy: -3 - Math.random() * 5, rot: 0, vr: (Math.random() - 0.5) * 0.5, life: 70, w: 10, h: 12, color: 0xfdfcf6 });
        fx.scene.stage.cheer(3, true);
      }
      // Over they go, chair and all; the desk skids off.
      if (t > SMACK && t <= SMACK + 30) {
        var v = (t - SMACK) / 30;
        s.tip = Math.min(1.5, v * 2) ; l._drawRot = -fx.dir * s.tip;
        fx.place(l, SO + 18 * v, Math.max(0, Math.sin(v * Math.PI) * 14));
        s.flyX = -60 * v; s.flyY = Math.sin(v * Math.PI) * 30;
      }
      if (t === SMACK + 30) { l._drawRot = 0; fx.pose(l, 'down'); fx.place(l, SO + 30, 0); fx.dust(fx.px(l), 8, 2); }
      if (t > SMACK + 4 && t < BACK) fx.cam(SO - 20 + Math.sin(t * 0.7) * 3, 120 + Math.sin(t * 1.1) * 2, 1.0, { k: 0.5 });
      if (t === SMACK + 40) fx.anim(w, [[1, 'wag'], [8, 'wag2'], [16, 'wag'], [24, 'wag2']], true);
      // Back on the stage.
      if (t === BACK) {
        fx.cutaway = false; s.room = 0;
        fx.place(w, s.sw, 0); fx.place(l, s.sw + 76, 0); fx.pose(l, 'down'); l._drawRot = 0;
        fx.cam(s.sw + 38, 120, 1.05, { cut: true });
        fx.flash(0xffffff, 0.6);
      }
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w, l = fx.l;
      // His stack of papers, in his hands from the start to the smack.
      function stack(g, hx, hy, n) {
        for (var i = 0; i < n; i++) { g.fillStyle(i % 2 ? 0xf2efe4 : 0xfdfcf6, 1); g.fillRect(hx - 12 + (K.hash(i, 1) - 0.5) * 3, hy - i * 1.6, 24, 2); }
      }
      var hand = w._pose ? fx.P(fx.S(fx.px(w)) + w._pose[8] * w.def.scale * (w._drawFacing || w.facing) * fx.dir, (fx.py(w)) + w._pose[9] * w.def.scale) : null;
      if (hand && t < CUT) stack(fx.gf, hand.x, hand.y, 16);
      if (hand && s.stack) stack(fx.gf, hand.x, hand.y, 22);
      if (!s.room) return;
      drawRoom(fx, fx.gb, t, !!s.wild);
      drawChair(fx, fx.gb, SO, s.tip);
      drawDesk(fx, fx.gf, SO, !s.snatched, { x: s.flyX, y: s.flyY });
      // The timer: counting down, red at the end.
      if (!s.wild) {
        var left = Math.max(0, 10 - Math.floor((t - CUT) / 10)), col = left <= 3 ? 0xff3d3d : 0xffffff;
        fx.gs.fillStyle(0x111111, 0.85); fx.gs.fillRect(W - 120, 72, 104, 40);
        fx.gs.lineStyle(2, col, 1); fx.gs.strokeRect(W - 120, 72, 104, 40);
        fx.text(0, '0:' + (left < 10 ? '0' : '') + left, W - 68, 92, col, 3 * (left <= 3 && t % 10 < 5 ? 1.15 : 1));
      }
      // The paper close up while he marks it.
      if (s.paper) {
        var r = drawPaper(fx, fx.gs, t, s.k);
        if (r.pen) { fx.gs.fillStyle(0x1a1a22, 1); fx.gs.fillRect(r.pen[0] - 2, r.pen[1] - 34, 5, 30); fx.gs.fillStyle(RED, 1); fx.gs.fillRect(r.pen[0] - 2, r.pen[1] - 8, 5, 8); }
      }
      if (s.wild) {
        var age = t - s.wild;
        if (age > 6 && age < 70) fx.text(2, 'OOOOOOOOH!', W - 130, 150, 0xffe98a, 2.5, 4, Math.min(1, (age - 6) / 8));
      }
    }
  };
})();
