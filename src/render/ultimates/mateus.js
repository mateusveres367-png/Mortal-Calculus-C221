// MATEUS — Gnome Army: cut to a front lawn at dusk. Dozens of garden gnomes pop out
// of the ground around the opponent. Whenever they look at the gnomes, the gnomes
// freeze; whenever they turn away, the gnomes creep closer. Then they swarm, and the
// last one waddles up and bonks them with a watering can. MATEUS was one of the
// gnomes the whole time.
// Camera: a slow wide push on the lawn, whip pans every time the opponent spins
// round, a tight close-up on their face before the swarm, a handheld shake in the
// pile, then a low angle on the bonk.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var LAWN = 8, POP = [12, 52], LOOKS = [[56, -1], [74, 1], [92, -1], [106, 1]], SWARM = 118, SCATTER = 228, CAN = 236, BONK = 262, REVEAL = 272;
  var N = 28, OPP = 0, ME = -170;

  // The gnomes: where each starts on the lawn (s across, row: 0 near, 1 mid, 2 far),
  // when it pops up, and how far it has crept toward the opponent.
  function makeGnomes() {
    var out = [];
    for (var i = 0; i < N; i++) {
      var side = i % 2 ? 1 : -1, row = i % 3, s0 = side * (70 + K.hash(i, 1) * 230);
      out.push({ s0: s0, s: s0, row: row, side: side, pop: POP[0] + Math.floor(i * (POP[1] - POP[0]) / N), tilt: 0, hop: 0, jump: null });
    }
    return out;
  }
  // How far a gnome is in front of (row 0) or behind (row 2) the fight line.
  function rowH(row) { return [-14, 6, 22][row]; }
  function rowK(row) { return [1.15, 1, 0.85][row]; }

  // A garden gnome, in world space at (x, y = its feet), facing dir.
  // opts: { k (scale), frozen, step (0..1 walk), tilt, can (a watering can) }
  function gnome(g, x, y, dir, o) {
    var k = (o.k || 1) * 1.6, step = o.step || 0, sw = Math.sin(step * Math.PI * 2) * 1.5 * k;
    var R = function (dx, dy, w, h, col) { g.fillStyle(col, 1); g.fillRect(Math.round(x + (dir > 0 ? dx : -dx - w) * k), Math.round(y + dy * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))); };
    g.fillStyle(0x000000, 0.25); g.fillEllipse(x, y + 1, 14 * k, 3 * k);
    R(-3, -3 + (sw > 0 ? -1 : 0), 3, 3, 0x5a3a1e); R(1, -3 + (sw < 0 ? -1 : 0), 3, 3, 0x5a3a1e); // boots
    R(-4, -11, 9, 8, 0x2a5fb8); R(-4, -6, 9, 1, 0x1a1a1a); R(0, -6, 1, 1, 0xd4a933);              // coat, belt
    R(-3, -16, 7, 5, 0xf0c8a0);                                                                   // face
    R(-4, -13, 8, 5, 0xf4f4f0); R(-2, -9, 4, 2, 0xf4f4f0);                                        // beard
    R(-4, -18, 9, 2, 0xc0302a); R(-3, -21, 7, 3, 0xc0302a); R(-1, -24, 4, 3, 0xc0302a); R(1, -26, 2, 2, 0xd8403a); // hat
    R(2, -15, 1, 1, o.frozen ? 0x111111 : 0x111111); R(3, -13, 2, 1, 0xe08a7a);                   // eye, nose
    if (!o.frozen) R(1, -15, 2, 1, 0x111111); // eyes narrowed while it creeps
    if (o.can) { // a green watering can held up
      R(4, -14, 9, 7, 0x2a8a4a); R(12, -17, 2, 6, 0x2a8a4a); R(13, -18, 5, 2, 0x3aaa5a); R(5, -16, 6, 2, 0x1e6a3a);
    }
  }

  // The lawn at dusk: a house with a lit window, a picket fence, the grass.
  function drawLawn(fx, g, t) {
    fx.fill(g, 0x2a2550);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 260, 0x3a3060);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 120, 0x6a4a6a);
    fx.circle(g, 220, 230, 16, 0xf4f0d0); fx.circle(g, 226, 234, 14, 0x3a3060); // the moon
    // The house.
    fx.rect(g, -120, 40, 120, 150, 0x8a6a5a); fx.poly(g, [[-140, 150], [0, 210], [140, 150]], 0x5a2a2a);
    fx.rect(g, -86, 80, -40, 120, 0xffd88a); fx.rect(g, -64, 80, -62, 120, 0x5a4a3a); fx.rect(g, 40, 40, 80, 110, 0x4a2a1a);
    // Hedge and fence.
    fx.rect(g, -W * 1.6, 20, W * 1.6, 44, 0x1e4a2a);
    for (var f = -14; f < 14; f++) { var fs = f * 34; fx.rect(g, fs, 22, fs + 8, 60, 0xe8e8e0); fx.poly(g, [[fs, 60], [fs + 4, 66], [fs + 8, 60]], 0xe8e8e0); }
    fx.rect(g, -W * 1.6, 34, W * 1.6, 38, 0xd8d8d0); fx.rect(g, -W * 1.6, 48, W * 1.6, 52, 0xd8d8d0);
    // The grass, with stripes from the mower.
    fx.rect(g, -W * 1.6, -120, W * 1.6, 22, 0x2a6a2a);
    for (var st = -12; st < 12; st++) fx.rect(g, st * 60, -120, st * 60 + 30, 22, 0x327a32);
    fx.rect(g, -W * 1.6, 20, W * 1.6, 22, 0x245a24);
  }

  FG.ULTIMATES.mateus = {
    start: function (fx) {
      var s = fx.s;
      s.g = makeGnomes(); s.look = -1;
      fx.place(fx.l, fx.S(fx.lx0), 0); fx.pose(fx.l, 'hit_high');
      fx.pose(fx.w, 'head_x');
      fx.cam(fx.S((fx.x0 + fx.lx0) / 2), 110, 1.3, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // The lawn. MATEUS freezes into a gnome himself, off to one side.
      if (t === LAWN) {
        fx.cutaway = true; s.lawn = true;
        fx.place(l, OPP, 0); fx.face(l, -fx.dir); fx.anim(l, FG.dazedAnim, true);
        fx.place(w, ME, 0); fx.face(w, fx.dir); fx.pose(w, 'statue'); w._drawScale = 0.8;
        fx.cam(-20, 130, 0.9, { cut: true });
        fx.flash(0x2a2550, 0.9);
        fx.sfx(function (S) { S.noise({ dur: 1.2, freq: 3500, q: 6, gain: 0.03, type: 'bandpass' }); for (var c = 0; c < 6; c++) S.osc({ dur: 0.03, f0: 4200, gain: 0.02, type: 'square', at: 0.2 + c * 0.18 }); }); // crickets
      }
      // They pop up out of the ground, one after another.
      if (s.lawn && t < SWARM) s.g.forEach(function (gn) {
        if (t === gn.pop) { gn.hop = 1; fx.dust(fx.X(gn.s), 3, 1.2); fx.sfx(function (S) { S.osc({ dur: 0.07, f0: 500 + gn.row * 120, f1: 900, gain: 0.06, type: 'triangle' }); }); }
        if (gn.hop > 0) gn.hop = Math.max(0, gn.hop - 0.12);
      });
      if (t > LAWN && t < POP[1]) fx.cam(-20 + (t - LAWN) * 0.3, 128 - (t - LAWN) * 0.4, 0.9 + (t - LAWN) * 0.004, { k: 0.2 });
      // Look left, look right: whoever is looked at freezes, the others creep.
      LOOKS.forEach(function (lk, k) {
        if (t !== lk[0]) return;
        s.look = lk[1]; fx.face(l, lk[1] * fx.dir); fx.pose(l, k % 2 ? 'hit_high' : 'block');
        s.g.forEach(function (gn) { if (gn.side === lk[1]) gn.tilt = 1; });
        // Whip pan to the side they looked at: the gnomes there, frozen, closer than before.
        fx.cam(lk[1] * 90, 100, 1.25 + k * 0.12, { k: 0.55 });
        fx.sfx(function (S) { S.noise({ dur: 0.14, freq: 1800, f1: 600, q: 1, gain: 0.12 }); S.osc({ dur: 0.35, f0: 220, f1: 210, gain: 0.08, type: 'square', at: 0.05 }); S.osc({ dur: 0.35, f0: 233, gain: 0.06, type: 'square', at: 0.05 }); });
      });
      if (s.lawn && t >= LOOKS[0][0] && t < SWARM) {
        s.g.forEach(function (gn) {
          if (gn.side === s.look || t < gn.pop) { gn.tilt *= 0.8; return; }
          var target = OPP + gn.side * (26 + gn.row * 10 + (Math.abs(gn.s0) % 30));
          gn.s += (target - gn.s) * 0.035; gn.step = (gn.step || 0) + 0.18;
        });
        if (t % 4 === 0 && t < LOOKS[3][0] + 8) fx.sfx(function (S) { S.noise({ dur: 0.03, freq: 2600, q: 3, gain: 0.05 }); }); // skittering
      }
      // A close-up: they feel it.
      if (t === LOOKS[3][0] + 6) { fx.cam(OPP + 6, 96, 2.6, { cut: true }); fx.pose(l, 'block'); s.sweat = t; }
      // The swarm.
      if (t === SWARM) {
        s.swarm = true; fx.face(l, -fx.dir);
        s.g.forEach(function (gn, i) { gn.jump = { t0: SWARM + (i % 10) * 3, from: gn.s }; });
        fx.cam(OPP, 110, 1.55, { cut: true });
        fx.sfx(function (S) { S.noise({ dur: 0.6, freq: 1400, q: 0.7, gain: 0.25 }); for (var c = 0; c < 10; c++) S.osc({ dur: 0.06, f0: 600 + c * 40, f1: 900, gain: 0.05, type: 'triangle', at: c * 0.05 }); });
      }
      if (s.swarm && t < SCATTER) {
        fx.cam(OPP + (K.hash(t, 1) - 0.5) * 10, 110 + (K.hash(t, 2) - 0.5) * 8, 1.55, { k: 0.5, rot: (K.hash(t, 3) - 0.5) * 0.05 });
        var hi = hits.indexOf(t);
        if (hi >= 0 && hi < hits.length - 1) {
          fx.hit(l, hi % 3 === 2 ? 'body' : 'jab', { strength: 'light', hits: hi + 1, shake: 0.006, y: 30 + (hi % 4) * 14 });
          fx.pose(l, hi % 2 ? 'hit_mid' : 'hit_high');
          fx.sfx(function (S) { S.osc({ dur: 0.05, f0: 300 + hi * 30, f1: 160, gain: 0.12, type: 'square' }); });
        }
      }
      // The pile breaks up; the gnomes scatter back out and freeze, all looking at them.
      if (t === SCATTER) { s.swarm = false; s.scatter = t; fx.anim(l, FG.dazedAnim, true); fx.cam(OPP - 20, 100, 1.1, { k: 0.15 }); }
      if (s.scatter && t < CAN) s.g.forEach(function (gn) { gn.s += (OPP + gn.side * (60 + Math.abs(gn.s0) * 0.3) - gn.s) * 0.2; gn.jump = null; gn.tilt = 1; });
      // The last one, with the watering can.
      if (t === CAN) { s.last = { s: OPP - 120 }; fx.cam(OPP - 50, 70, 1.6, { k: 0.12, rot: -0.03 }); }
      if (s.last && t < BONK) { s.last.s += (OPP - 18 - s.last.s) * 0.08; s.last.step = (s.last.step || 0) + 0.15; if (t % 6 === 0) fx.sfx(function (S) { S.osc({ dur: 0.04, f0: 180, gain: 0.08 }); }); }
      if (t === BONK - 6) { s.last.raise = true; fx.sfx(function (S) { S.noise({ dur: 0.2, freq: 900, f1: 2000, q: 1, gain: 0.1 }); }); }
      if (t === BONK) {
        s.last.raise = false; s.bonk = t;
        fx.hit(l, 'overhead', { ch: true, shake: 0.03, y: 90, hits: hits.length });
        fx.pose(l, 'down'); fx.slow(26, 0.35); fx.flash(0x9fdcff, 0.5);
        fx.cam(OPP - 10, 60, 1.9, { cut: true, rot: 0.05 });
        fx.sfx(function (S) { S.osc({ dur: 0.6, f0: 620, f1: 610, gain: 0.25, type: 'square' }); S.osc({ dur: 0.6, f0: 930, f1: 920, gain: 0.12, type: 'square' }); S.noise({ dur: 0.5, freq: 4000, q: 0.5, gain: 0.2, type: 'highpass', at: 0.05 }); });
        for (var sp = 0; sp < 14; sp++) { var p = fx.P(OPP, 70); fx.scene.effects.parts.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 5, vy: -1 - Math.random() * 4, life: 24, max: 24, size: 2, color: 0x7ac8ff }); }
      }
      // MATEUS steps out of his statue pose. Gnomed.
      if (t === REVEAL) { w._drawScale = null; fx.place(w, OPP - 70, 0); fx.anim(w, [[1, 'statue'], [10, 'laugh'], [26, 'laugh'], [34, 'smug']]); fx.cam(OPP - 40, 100, 1.3, { k: 0.12 }); fx.say(w, 'Gnomed.', 90); }
      if (t > REVEAL && t < REVEAL + 10) fx.place(w, ME + (OPP - 70 - ME) * (t - REVEAL) / 10, 0);
    },
    draw: function (fx, t) {
      var s = fx.s, gb = fx.gb, gf = fx.gf;
      if (!s.lawn) return;
      drawLawn(fx, gb, t);
      var dir = fx.dir;
      s.g.forEach(function (gn) {
        if (t < gn.pop) return;
        var g = gn.row === 0 ? gf : gb, h = rowH(gn.row), k = rowK(gn.row);
        var x = fx.X(gn.s), y = GY - h, lift = gn.hop * 14 * k;
        if (gn.jump && t >= gn.jump.t0) { // leaping onto the pile
          var u = Math.min(1, (t - gn.jump.t0) / 10), tx = fx.X(OPP + gn.side * (6 + (gn.row * 5)));
          x = fx.X(gn.jump.from) + (tx - fx.X(gn.jump.from)) * u; lift = Math.sin(u * Math.PI) * 40 + u * (20 + (gn.s0 % 30));
          if (u >= 1) lift = 10 + ((t + gn.pop) % 7) + gn.row * 8; // clinging on
        }
        var face = gn.side > 0 ? -dir : dir; // toward the opponent
        if (s.scatter && t >= s.scatter) face = gn.side > 0 ? -dir : dir;
        if (gn.tilt > 0.3 && !gn.jump) { // a freeze: a tiny guilty wobble
          var wob = Math.sin(t * 1.2) * gn.tilt * 0.6;
          gnome(g, x + wob, y - lift, face, { k: k, frozen: true });
        } else gnome(g, x, y - lift, face, { k: k, frozen: !gn.jump && (gn.side === s.look), step: gn.step });
      });
      if (s.last) gnome(gf, fx.X(s.last.s), GY + 4 - (s.last.raise ? 8 : 0), dir, { k: 1.5, step: s.last.step, can: true });
      // Text: the count of gnomes, the freeze, the bonk.
      if (t >= POP[0] && t < SWARM) fx.text(0, 'GNOMES: ' + s.g.filter(function (gn) { return t >= gn.pop; }).length, W - 110, 330, 0xffffff, 2);
      LOOKS.forEach(function (lk) { if (t >= lk[0] && t < lk[0] + 12) fx.text(1, 'FREEZE!', W / 2, 90, 0x9fdcff, 3 * K.stamp(t, lk[0]), -6); });
      if (s.sweat && t < SWARM) { var q = fx.at2(fx.l, 86); fx.gs.fillStyle(0x9fdcff, 1); fx.gs.fillRect(q[0] + 12, q[1] + (t - s.sweat) * 0.8, 3, 5); }
      if (t >= SWARM && t < SCATTER) fx.text(2, 'GNOME ARMY!', W / 2, 70, 0xff4a3d, 4, -5);
      if (s.bonk && t - s.bonk < 40) fx.text(3, 'BONK!', W / 2 + 30, 120, 0xffffff, 4.5 * K.stamp(t, s.bonk), 8);
    }
  };
})();
