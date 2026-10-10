// JACK — Paper Airplane Squadron: cut to the back row of an empty classroom. He folds
// paper airplanes at hyperspeed, stacks them up, stands on his chair and launches the
// lot. Dozens of planes fly in formation across the room (a V, a loop, an arrow
// pointing straight at the opponent), then dive-bomb them one after another. The last
// one is his best: a plane with his doodle on the wing. He sits back down.
// Camera: low behind his desk looking up the aisle, then a long smooth tracking pan
// with the formation, rolling with the loop, and a steep low angle up at the dives.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var ROOM = 8, FOLD = [14, 62], LAUNCH = 66, LOOP = [80, 108], DIVE = 112, ACE = 196, SIT = 240;
  var N = 30, DESK = -120, FRONT = 160;

  // A plane in screen space: nose toward `ang`, scale k.
  function plane(g, x, y, ang, k, col) {
    var cs = Math.cos(ang), sn = Math.sin(ang);
    var P = function (u, v) { return { x: x + (u * cs - v * sn) * k, y: y + (u * sn + v * cs) * k }; };
    g.fillStyle(col || 0xf6f6f0, 1); g.fillPoints([P(9, 0), P(-9, -5), P(-6, 0)], true);
    g.fillStyle(0xd0d0c8, 1); g.fillPoints([P(9, 0), P(-9, 4), P(-6, 0)], true);
    g.lineStyle(1, 0x8a94a8, 1); var a = P(9, 0), b = P(-7, 0); g.lineBetween(a.x, a.y, b.x, b.y);
  }

  // Where plane i of the squadron is at time t (set space s, h), and its heading.
  function wing(i, t, fx, s) {
    var row = Math.floor(i / 2) + 1, side = i % 2 ? 1 : -1;
    // A V formation flying across the room, then a loop, then an arrow aimed at them.
    if (t < LOOP[0]) {
      var u = (t - LAUNCH) / (LOOP[0] - LAUNCH);
      return { s: DESK + 40 + u * 260 - row * 11, h: 120 + u * 30 + side * row * 9, ang: -0.1 };
    }
    if (t < LOOP[1]) {
      var a = (t - LOOP[0]) / (LOOP[1] - LOOP[0]) * K.TAU, r = 60;
      return { s: DESK + 300 - row * 9 * Math.cos(a) + Math.sin(a) * r, h: 150 + (1 - Math.cos(a)) * r + side * row * 5, ang: a - 0.1 };
    }
    var dv = s.dive[i];
    if (t < dv) { var w = (t - LOOP[1]) / 20; return { s: FRONT - 120 - row * 10 + Math.min(1, w) * 40, h: 220 + side * row * 6, ang: 0.15 }; }
    var p = Math.min(1, (t - dv) / 10), from = { s: FRONT - 80 - row * 10, h: 220 + side * row * 6 };
    return { s: from.s + (FRONT - from.s) * p, h: from.h + (70 - from.h) * p, ang: Math.atan2(150, 90), hit: p >= 1 };
  }

  // The classroom from the back row: desks, the whiteboard, windows.
  function drawRoom(fx, g) {
    fx.fill(g, 0xd8d0b8);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 300, 0xe8e0c8);
    fx.rect(g, -W * 1.6, 0, W * 1.6, 30, 0x8a7a5a);
    fx.rect(g, 60, 70, 300, 170, 0xf4f6f8); fx.rect(g, 60, 66, 300, 70, 0x9aa0aa); // the whiteboard
    for (var ln = 0; ln < 5; ln++) fx.rect(g, 76, 152 - ln * 16, 76 + 40 + K.hash(ln, 3) * 120, 150 - ln * 16, [0x3a5fc0, 0xc03a3a, 0x2a8a4a][ln % 3]);
    fx.line(g, 250, 90, 280, 150, 0x2a3a8a, 2); fx.line(g, 280, 150, 290, 120, 0x2a3a8a, 2); // someone's doodle
    fx.rect(g, -280, 80, -200, 200, 0x8ab8e0); fx.rect(g, -400, 80, -320, 200, 0x8ab8e0); // windows
    for (var r = 0; r < 4; r++) for (var c = -3; c < 4; c++) { var ds = c * 70 + r * 8, dh = 10 + r * 16; fx.rect(g, ds, dh + 24, ds + 40, dh + 28, 0xc89a5a); fx.rect(g, ds + 4, dh, ds + 6, dh + 24, 0x5a5f6a); }
  }

  FG.ULTIMATES.jack = {
    start: function (fx) {
      var s = fx.s;
      s.dive = [];
      var hits = fx.w.def.ultimate.hits;
      for (var i = 0; i < N; i++) s.dive.push(i < 10 ? hits[i] - 10 : DIVE + 4 + i * 2); // the hitting planes land on the hit frames
      fx.place(fx.l, fx.S(fx.lx0), 0); fx.pose(fx.l, 'hit_mid');
      fx.pose(fx.w, 'ruler_x');
      fx.cam(fx.S(fx.lx0) - 30, 110, 1.3, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      if (t === ROOM) {
        fx.cutaway = true; s.room = true;
        fx.place(w, DESK, 0); fx.face(w, fx.dir); fx.pose(w, 'fold');
        fx.place(l, FRONT, 0); fx.face(l, -fx.dir); fx.anim(l, FG.dazedAnim, true);
        fx.cam(DESK + 30, 80, 1.5, { cut: true });
        fx.flash(0xffffff, 0.7);
      }
      // Folding at hyperspeed: the stack grows.
      if (t >= FOLD[0] && t < FOLD[1]) {
        s.folded = Math.floor((t - FOLD[0]) * N / (FOLD[1] - FOLD[0]));
        if (t % 3 === 0) { fx.pose(w, t % 6 ? 'fold' : 'doodle2'); fx.sfx(function (S) { S.noise({ dur: 0.03, freq: 5000, q: 3, gain: 0.05, type: 'highpass' }); }); }
        fx.cam(DESK + 30 + (t - FOLD[0]) * 0.3, 80, 1.5 + (t - FOLD[0]) * 0.006, { k: 0.2 });
      }
      // Up on the chair, and the whole stack goes.
      if (t === LAUNCH) {
        s.flying = true; s.folded = 0; fx.place(w, DESK, 22); fx.pose(w, 'plane_x');
        fx.cam(DESK + 120, 140, 1.0, { k: 0.08 });
        fx.sfx(function (S) { S.noise({ dur: 0.8, freq: 1200, f1: 3000, q: 0.8, gain: 0.2 }); });
      }
      if (t > LAUNCH && t < LOOP[1]) fx.cam(DESK + 120 + (t - LAUNCH) * 4, 150, 1.0, { k: 0.1, rot: t > LOOP[0] ? Math.sin((t - LOOP[0]) / (LOOP[1] - LOOP[0]) * K.TAU) * 0.06 : 0 });
      if (t === LOOP[1]) { fx.cam(FRONT - 30, 130, 1.1, { k: 0.15, rot: -0.05 }); fx.pose(l, 'block'); }
      // The dives.
      var hi = hits.indexOf(t);
      if (hi >= 0 && hi < hits.length - 1) {
        fx.hit(l, hi % 3 ? 'jab' : 'body', { strength: 'light', hits: hi + 1, shake: 0.005, y: 60 + (hi % 3) * 10 });
        fx.pose(l, hi % 2 ? 'hit_high' : 'hit_mid');
        fx.sfx(function (S) { S.noise({ dur: 0.05, freq: 3600, q: 2, gain: 0.12 }); S.osc({ dur: 0.05, f0: 800 + hi * 50, f1: 400, gain: 0.05, type: 'triangle' }); });
      }
      if (t > DIVE && t < ACE && t % 5 === 0) fx.sfx(function (S) { S.noise({ dur: 0.18, freq: 2600, f1: 1400, q: 1.5, gain: 0.05 }); }); // whooshes
      // His best plane, last.
      if (t === ACE) { s.ace = t; fx.cam(FRONT - 60, 140, 1.25, { k: 0.12, rot: 0.04 }); }
      if (t === hits[hits.length - 1]) {
        s.aceHit = t; fx.pose(l, 'down');
        fx.hit(l, 'power', { ch: true, shake: 0.035, y: 70, hits: hits.length });
        fx.flash(0xffffff, 0.6); fx.slow(26, 0.35);
        fx.cam(FRONT, 80, 1.7, { cut: true, rot: -0.04 });
        fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 140, f1: 40, gain: 0.7 }); S.noise({ dur: 0.4, freq: 2000, q: 0.6, gain: 0.3 }); });
        fx.crowd(3);
      }
      if (t === SIT) { s.flying = false; fx.place(w, DESK, 0); fx.anim(w, [[1, 'stand'], [10, 'lounge']]); fx.say(w, "Didn't even look up.", 80); fx.cam(DESK + 60, 100, 1.3, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb, gf = fx.gf;
      if (!s.room) return;
      drawRoom(fx, g);
      // His desk, the stack of planes on it.
      fx.rect(gf, DESK - 30, 30, DESK + 30, 36, 0xc89a5a); fx.rect(gf, DESK - 26, 0, DESK - 23, 30, 0x5a5f6a); fx.rect(gf, DESK + 23, 0, DESK + 26, 30, 0x5a5f6a);
      for (var k = 0; k < (s.folded || 0); k++) { var sp = fx.P(DESK - 14 + (k % 3) * 10, 38 + Math.floor(k / 3) * 3); plane(gf, sp.x, sp.y, 0, 0.9); }
      // The squadron.
      if (s.flying && t > LAUNCH) for (var i = 0; i < N; i++) {
        if (t >= s.dive[i] + 12) continue; // landed
        var q = wing(i, t, fx, s), p = fx.P(q.s, q.h);
        plane(gf, p.x, p.y, fx.dir > 0 ? q.ang : Math.PI - q.ang, 1.2, i === 0 ? 0xfff8d0 : null);
      }
      // The ace: big, with a doodle on its wing.
      if (s.ace && t < (s.aceHit || 1e9) + 2) {
        var u = Math.min(1, (t - s.ace) / 32), a = fx.P(FRONT - 220 + 220 * u, 240 - 170 * u), ang = Math.atan2(170, 220);
        plane(gf, a.x, a.y, fx.dir > 0 ? ang : Math.PI - ang, 3.2, 0xffffff);
        gf.lineStyle(2, 0x2a3a8a, 1); gf.strokeCircle(a.x - fx.dir * 6, a.y - 4, 4); // a smiley on the wing
      }
      if (t >= FOLD[0] && t < LAUNCH) fx.text(0, 'PLANES FOLDED: ' + (s.folded || 0), W / 2, 300, 0x2a3a8a, 2);
      if (t >= LOOP[0] && t < DIVE) fx.text(1, 'SQUADRON!', W / 2, 80, 0x5fd7ff, 3, -4);
      if (s.aceHit && t - s.aceHit < 50) fx.text(2, 'DIRECT HIT!', W / 2, 110, 0xe03a2a, 3 * K.stamp(t, s.aceHit), -5);
    }
  };
})();
