// BRINKHUS — Fast Break: he blows a coach's whistle; cut to a running track, where he
// sprints in a blur past the yard lines and hurdles a bench; then he comes back into
// the stage with a flying knee, and a giant X stamps the screen: SOLVED.
// Camera: an extreme close-up on the whistle, a tilted tracking shot on the track,
// a punch-in on the knee, then still for the stamp.
(function () {
  var C = FG.C, W = C.VIEW_W, GY = C.GROUND_Y, K = FG.ultKit;
  var RUN = { from: 34, to: 108 }, HURDLE = { from: 70, to: 88 }, BACK = 110, JUMP = 124, KNEE = 136, STAMP = 170;
  var TRACK = 0xb5462e, LANE = 0xf4efe6, GRASS = 0x3f8f3a, GRASS2 = 0x4aa043;

  // How far down the track he is at each frame (he speeds up as he goes).
  function speed(t) { return t < RUN.from ? 0 : Math.min(26, 8 + (t - RUN.from) * 0.4); }
  function offsets() { var o = [0]; for (var t = 1; t <= 260; t++) o.push(o[t - 1] + speed(t)); return o; }

  // The track: sky, bleachers full of students, the infield's yard lines, the lanes.
  // Each layer scrolls at its own rate (off: how far he has run).
  function drawTrack(fx, g, off, t) {
    var hash = K.hash;
    fx.fill(g, 0x9cd0ef);
    fx.rect(g, -W * 1.6, 120, W * 1.6, 170, 0xc6e3f2);
    // Bleachers: rows of benches, students with their arms up.
    var b0 = -(off * 0.18) % 48;
    fx.rect(g, -W * 1.6, 62, W * 1.6, 128, 0x6d7380);
    for (var r = 0; r < 5; r++) fx.rect(g, -W * 1.6, 66 + r * 13, W * 1.6, 68 + r * 13, 0x9aa1ad);
    for (var k = -16; k < 16; k++) {
      var bs = b0 + k * 48;
      for (var j = 0; j < 4; j++) {
        var id = Math.floor((off * 0.18 + bs) / 48) * 7 + j, hs = bs + hash(id, 1) * 40, hh = 70 + j * 13 + 2;
        var col = [0xd8433b, 0x3a6fd8, 0xf2c94c, 0x2f9e6e, 0xf4efe6][Math.floor(hash(id, 2) * 5)];
        var jump = (t + Math.floor(hash(id, 3) * 20)) % 20 < 10 ? 2 : 0;
        fx.rect(g, hs, hh + jump, hs + 4, hh + 7 + jump, col);
        fx.rect(g, hs + 1, hh + 7 + jump, hs + 3, hh + 9 + jump, 0xe0b48a);
      }
    }
    // A padded wall, then the infield: grass with yard lines and their numbers.
    fx.rect(g, -W * 1.6, 54, W * 1.6, 62, 0x1f4d36);
    fx.rect(g, -W * 1.6, 20, W * 1.6, 54, GRASS);
    var y0 = -(off * 0.55) % 70;
    for (var y = -14; y < 14; y++) {
      var ys = y0 + y * 70, n = Math.floor((off * 0.55 + ys) / 70);
      fx.rect(g, ys, 20, ys + 34, 54, GRASS2, 0.6);
      fx.line(g, ys, 22, ys - 8, 52, 0xffffff, 2, 0.8);
      var num = 10 * (1 + ((n % 9) + 9) % 9);
      if (y > -3 && y < 4) fx.text(12 + y + 3, String(num > 50 ? 100 - num : num), fx.sx(fx.X(ys + 14)), fx.sy(GY - 38), 0xffffff, 1.5, 0, 0.7);
    }
    // The track: lanes, lane lines and the hash marks rushing past.
    fx.rect(g, -W * 1.6, -70, W * 1.6, 20, TRACK);
    [18, 6, -10, -30, -54].forEach(function (h) { fx.rect(g, -W * 1.6, h - 1, W * 1.6, h + 1, LANE, 0.85); });
    var m0 = -off % 90;
    for (var m = -12; m < 12; m++) {
      var ms = m0 + m * 90;
      fx.rect(g, ms, -54, ms + 3, -30, LANE, 0.6);
      fx.rect(g, ms + 30, 6, ms + 33, 18, LANE, 0.5);
    }
    fx.rect(g, -W * 1.6, -90, W * 1.6, -70, 0x2e7a34);
  }

  // A park bench: slats and legs.
  function drawBench(fx, g, s) {
    fx.rect(g, s - 30, 20, s + 30, 23, 0x8a5a2b);
    fx.rect(g, s - 30, 25, s + 30, 28, 0x9c6a36);
    fx.rect(g, s - 30, 30, s + 30, 34, 0x8a5a2b);
    fx.rect(g, s - 26, 0, s - 22, 20, 0x3a3a3a); fx.rect(g, s + 22, 0, s + 26, 20, 0x3a3a3a);
    fx.rect(g, s - 30, -2, s + 30, 0, 0x000000, 0.25);
  }

  // His whistle: a sharp pea-whistle trill.
  function whistle(fx, len) {
    fx.sfx(function (S) {
      S.osc({ dur: len, f0: 2750, gain: 0.07, type: 'square', vib: [34, 260], attack: 0.02 });
      S.osc({ dur: len, f0: 5500, gain: 0.02, type: 'sine', vib: [34, 520], attack: 0.02 });
      S.noise({ dur: len * 0.8, freq: 4200, q: 3, gain: 0.05 });
    });
  }

  FG.ULTIMATES.brinkhus = {
    start: function (fx) {
      var s = fx.s;
      s.off = offsets();
      s.sw = fx.S(fx.x0); s.sl = s.sw + 40;
      fx.place(fx.l, s.sl, 0);
      fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'stand'], [6, 'whistle'], [12, 'whistle2'], [28, 'whistle2'], [32, 'whistle']]);
      fx.cam(s.sw + 5, 96, 2.6, { k: 0.22 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 10) { whistle(fx, 0.55); s.tweet = t; }
      // Cut to the track.
      if (t === RUN.from) {
        fx.cutaway = true; l._hidden = true;
        fx.place(w, 0, 0);
        fx.anim(w, [[1, 'sprint1'], [4, 'sprint2'], [8, 'sprint1']], true);
        fx.cam(30, 74, 1.3, { cut: true, rot: -0.05 });
        fx.flash(0xffffff, 0.8);
        fx.sfx(function (S) { S.noise({ dur: 2.2, freq: 900, q: 0.6, gain: 0.07, attack: 0.5 }); }); // the bleachers roar
      }
      if (t > RUN.from && t < RUN.to) {
        var air = t >= HURDLE.from && t <= HURDLE.to;
        // Cleats on the track, faster and faster.
        if (!air && t % 5 === 0) fx.sfx(function (S) { S.noise({ dur: 0.04, freq: 3600, q: 2, gain: 0.12, pan: t % 10 ? 0.2 : -0.2 }); S.osc({ dur: 0.06, f0: 160, f1: 70, gain: 0.25 }); });
        if (!air && t % 5 === 0) fx.dust(fx.px(w) - fx.dir * 10, 2, 1);
        fx.place(w, Math.min(40, (t - RUN.from) * 0.6), air ? Math.sin((t - HURDLE.from) / (HURDLE.to - HURDLE.from) * Math.PI) * 40 : 0);
        fx.cam(40 + Math.sin(t * 0.21) * 3, 76 + Math.sin(t * 0.43) * 2, 1.3 + (t - RUN.from) * 0.002, { rot: -0.05, k: 0.2 });
      }
      if (t === HURDLE.from) { fx.anim(w, [[1, 'hurdle'], [18, 'hurdle']]); fx.sfx(function (S) { S.noise({ dur: 0.3, freq: 600, f1: 2400, q: 0.8, gain: 0.16 }); }); }
      if (t === HURDLE.to) fx.anim(w, [[1, 'sprint1'], [4, 'sprint2'], [8, 'sprint1']], true);
      // He takes off out of the shot...
      if (t >= RUN.to - 10 && t < BACK) fx.place(w, 40 + (t - RUN.to + 10) * 28, 0);
      // ...and back on the stage, he comes in from behind at full speed.
      if (t === BACK) {
        fx.cutaway = false; l._hidden = false;
        fx.place(l, s.sl, 0); fx.pose(l, 'hit_mid'); l._drawFacing = -fx.dir;
        fx.place(w, s.sw - 300, 0);
        fx.cam(s.sw - 30, 110, 1.1, { cut: true });
        s.wipe = t;
        fx.sfx(function (S) { S.noise({ dur: 0.35, freq: 400, f1: 3000, q: 0.7, gain: 0.2 }); });
      }
      if (t > BACK && t < JUMP) {
        var u = (t - BACK) / (JUMP - BACK);
        fx.place(w, s.sw - 300 + 260 * u, 0);
        if (t % 4 === 0) fx.dust(fx.px(w) - fx.dir * 8, 2, 1);
        fx.cam(s.sw - 40 + 40 * u, 105, 1.15, { k: 0.3 });
      }
      if (t === JUMP - 4) fx.pose(w, 'fknee_c');
      if (t === JUMP) { fx.anim(w, [[1, 'fknee'], [30, 'fknee'], [40, 'fland'], [56, 'fland'], [70, 'stand'], [80, 'thumb']]); fx.sfx(function (S) { S.noise({ dur: 0.25, freq: 900, f1: 300, q: 1, gain: 0.18 }); }); }
      if (t > JUMP && t <= KNEE) {
        var v = (t - JUMP) / (KNEE - JUMP);
        fx.place(w, s.sw - 40 + 52 * v, Math.sin(v * Math.PI * 0.6) * 34);
      }
      // The flying knee.
      if (t === KNEE) {
        fx.hit(l, 'power', { ch: true, hits: 1, shake: 0.03, y: 76 });
        fx.pose(l, 'juggle');
        fx.flash(0xffffff, 0.85);
        fx.slow(30, 0.3);
        fx.cam(s.sl, 80, 1.75, { k: 0.5 });
        fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 120, f1: 32, gain: 0.8 }); S.noise({ dur: 0.18, freq: 2600, q: 0.8, gain: 0.4 }); S.noise({ dur: 0.6, freq: 700, q: 0.6, gain: 0.14, at: 0.05 }); });
        fx.crowd(3);
      }
      if (t > KNEE) {
        var k = Math.min(1, (t - KNEE) / 30);
        fx.place(l, s.sl + 50 * k, Math.sin(k * Math.PI) * 52);
        if (t < KNEE + 18) fx.place(w, s.sw + 12, Math.max(0, 20 - (t - KNEE) * 1.6));
        else fx.place(w, s.sw + 12, 0);
        if (k >= 1 && !s.down) { s.down = true; fx.pose(l, 'down'); fx.dust(fx.px(l), 8, 2); fx.shake(0.01); }
      }
      if (t === KNEE + 14) fx.cam(s.sw + 40, 100, 1.2, { k: 0.08 });
      // X marks it: SOLVED.
      if (t === STAMP - 6) s.x1 = t;
      if (t === STAMP) {
        s.x2 = t;
        fx.hit(l, 'overhead', { hits: 2, shake: 0.025, y: 12 });
        fx.sfx(function (S) { S.osc({ dur: 0.45, f0: 70, f1: 30, gain: 0.9 }); S.noise({ dur: 0.12, freq: 1800, q: 0.5, gain: 0.35 }); });
      }
      if (t === STAMP + 26) { whistle(fx, 0.25); s.tweet = t; }
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w;
      // Sound waves off the whistle.
      if (s.tweet && t - s.tweet < 30) {
        var p = fx.at2(w, 88 * w.def.scale), d = fx.dir;
        for (var i = 0; i < 3; i++) {
          var r = 8 + ((t - s.tweet) * 2 + i * 10) % 30;
          fx.gs.lineStyle(2, 0xffffff, 0.9 * (1 - r / 38));
          fx.gs.beginPath(); fx.gs.arc(p[0] + d * 10, p[1], r, d > 0 ? -0.7 : Math.PI - 0.7, d > 0 ? 0.7 : Math.PI + 0.7); fx.gs.strokePath();
        }
        if (t < RUN.from) fx.text(0, 'TWEEEET!', p[0] + d * 70, p[1] - 30, 0xffffff, 2.5, d * -8);
      }
      // The track and the bench.
      if (t >= RUN.from && t < BACK) {
        var off = s.off[Math.min(t, s.off.length - 1)];
        drawTrack(fx, fx.gb, off, t);
        var benchAt = s.off[HURDLE.from + 9] + 26; // he clears it at the top of the hurdle
        drawBench(fx, fx.gb, benchAt - off + Math.min(40, (t - RUN.from) * 0.6));
        // Speed lines, a blur and a stopwatch.
        var sp = speed(t);
        for (var k = 0; k < 14; k++) {
          var ly = 40 + K.hash(k, 4) * 260, lx = (K.hash(k, 5) * 900 - (t * sp * 1.4) % 900 + 900) % 900 - 130;
          fx.gs.fillStyle(0xffffff, 0.12 + sp / 120); fx.gs.fillRect(fx.dir > 0 ? lx : W - lx - 60, ly, 40 + sp * 3, 2);
        }
        for (var gh = 1; gh <= 3; gh++) fx.figure(fx.gg, w, gh % 2 ? 'sprint2' : 'sprint1', fx.S(fx.px(w)) - gh * sp * 0.9, fx.py(w), { flash: 0xffd23f });
        var secs = ((t - RUN.from) / 60 * 0.62).toFixed(2);
        fx.text(1, '40 YD  ' + secs + ' S', W / 2, 330, 0xffd23f, 2, 0);
      }
      // The wipe back to the stage: white streaks sliding off.
      if (s.wipe && t - s.wipe < 10) {
        var u = (t - s.wipe) / 10;
        for (var b = 0; b < 6; b++) { fx.gs.fillStyle(0xffffff, 0.9 - u * 0.8); fx.gs.fillRect(fx.dir > 0 ? W * u * (1.2 + b * 0.1) - 60 : W - W * u * (1.2 + b * 0.1), b * 60, 120, 58); }
      }
      // The giant X over them, and SOLVED.
      if (s.x1) {
        var c = [W / 2, 190], R = 92, g = fx.gs;
        var sc1 = K.stamp(t, s.x1), sc2 = s.x2 ? K.stamp(t, s.x2) : 0;
        function bar(scale, a) {
          var ex = Math.cos(a) * R * scale, ey = Math.sin(a) * R * scale;
          g.lineStyle(26 * scale, 0x000000, 0.35); g.lineBetween(c[0] - ex + 4, c[1] - ey + 4, c[0] + ex + 4, c[1] + ey + 4);
          g.lineStyle(22 * scale, 0xd8202a, 1); g.lineBetween(c[0] - ex, c[1] - ey, c[0] + ex, c[1] + ey);
          g.lineStyle(4 * scale, 0xff6a5a, 1); g.lineBetween(c[0] - ex * 0.9, c[1] - ey * 0.9 - 6 * scale, c[0] + ex * 0.9, c[1] + ey * 0.9 - 6 * scale);
        }
        bar(sc1, 0.8);
        if (s.x2) {
          bar(sc2, -0.8);
          fx.text(2, 'SOLVED', W / 2, 190, 0xffd23f, 6 * (1 + (sc2 - 1) * 0.5), -6);
        }
      }
    }
  };
})();
