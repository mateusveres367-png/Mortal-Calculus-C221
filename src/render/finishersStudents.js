// KO finishers for the student side (see src/render/finishers.js for the flow and the
// FG.finisherFx toolkit). One script per student: FG.FINISHERS[id].
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y;

  function bigText(fx, i, str, x, y, color, scale, angle, alpha) {
    fx.texts[i].setText(str).setPosition(x, y).setScale(scale).setAngle(angle || 0).setTint(color).setAlpha(alpha == null ? 1 : alpha).setVisible(true);
  }
  function stampScale(t, at) { var u = Math.min(1, Math.max(0, (t - at) / 6)); return 1 + (1 - u) * (1 - u) * 2.5; }
  function sfx(fn) { FG.Sfx.synth(fn); }

  // A little garden gnome on screen space g at (x, y = feet), scale k, facing dir.
  function tinyGnome(g, x, y, k, dir) {
    var R = function (dx, dy, w, h, col) { g.fillStyle(col, 1); g.fillRect(Math.round(x + (dir > 0 ? dx : -dx - w) * k), Math.round(y + dy * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k))); };
    R(-3, -3, 3, 3, 0x5a3a1e); R(1, -3, 3, 3, 0x5a3a1e); R(-4, -11, 9, 8, 0x2a5fb8);
    R(-3, -16, 7, 5, 0xf0c8a0); R(-4, -13, 8, 5, 0xf4f4f0); R(-4, -18, 9, 2, 0xc0302a); R(-3, -21, 7, 3, 0xc0302a); R(-1, -24, 4, 3, 0xc0302a);
    R(2, -15, 1, 1, 0x111111); R(3, -13, 2, 1, 0xe08a7a);
  }

  // MATEUS — You've Been Gnomed: he sinks into the ground, pops up right behind them and
  // taps their shoulder. They turn round: one hit. As they fall, a tiny garden gnome
  // pops up out of the ground next to them. GNOMED stamps the screen.
  FG.FINISHERS.mateus = {
    len: 220,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'idle'], [8, 'dig']]); fx.anim(l, FG.dazedAnim, true); s.x0 = w.x; }
      if (t === 12) { w._hidden = true; s.dig = t; sfx(function (S) { S.noise({ dur: 0.25, freq: 500, q: 0.8, gain: 0.2, type: 'lowpass' }); }); fx.scene.effects.dust(w.x, 8, 2); }
      // The mound tunnels round behind them.
      if (s.dig && !s.up) { var u = Math.min(1, (t - s.dig) / 30); s.mx = s.x0 + (l.x + fx.dir * 34 - s.x0) * u; }
      if (t === 46) {
        s.up = t; w._hidden = false; w.x = l.x + fx.dir * 34; w.facing = -fx.dir;
        fx.anim(w, [[1, 'dig'], [6, 'pop_c'], [12, 'stand'], [20, 'tap'], [34, 'tap'], [40, 'idle']]);
        fx.scene.effects.dust(w.x, 10, 2);
        sfx(function (S) { S.osc({ dur: 0.12, f0: 300, f1: 900, gain: 0.06, type: 'triangle' }); });
      }
      if (t === 64) sfx(function (S) { S.osc({ dur: 0.05, f0: 1400, gain: 0.05, type: 'triangle' }); S.osc({ dur: 0.05, f0: 1400, gain: 0.05, type: 'triangle', at: 0.12 }); }); // tap tap
      if (t === 78) { l.facing = fx.dir; fx.pose(l, 'idle'); s.turn = t; } // they turn round...
      if (t === 92) { fx.anim(w, [[1, 'up_c'], [5, 'up_x'], [26, 'up_x'], [36, 'smug']]); }
      if (t === 96) { fx.hit(l, 'launch', { ch: true, shake: 0.02, y: 70 }); fx.anim(l, [[1, 'hit_high'], [10, 'juggle'], [30, 'down']]); fx.slow(22, 0.4); s.fall = t; }
      if (s.fall && t > s.fall && t < s.fall + 30) { var v = (t - s.fall) / 30; l.y = Math.sin(v * Math.PI) * 50; l.x -= fx.dir * 1.6; }
      if (s.fall && t === s.fall + 30) { l.y = 0; FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
      // The tiny gnome pops up beside them.
      if (t === 110) { s.gnome = t; s.gx = l.x - fx.dir * 30; fx.scene.effects.dust(s.gx, 6, 1.5); sfx(function (S) { S.osc({ dur: 0.1, f0: 700, f1: 1100, gain: 0.07, type: 'triangle' }); }); }
      if (t === 132) { s.stamp = t; sfx(function (S) { S.osc({ dur: 0.3, f0: 180, f1: 60, gain: 0.5 }); S.noise({ dur: 0.2, freq: 1200, q: 0.6, gain: 0.25 }); }); fx.shake(0.015); fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.dig && !s.up) { // the mound, on screen
        var mx = fx.sx(s.mx), my = GY;
        g.fillStyle(0x4a3220, 1); g.fillEllipse(mx, my - 3, 30, 10); g.fillStyle(0x6a4a2a, 1); g.fillEllipse(mx, my - 4, 22, 7);
      }
      if (s.up && t - s.up > 18 && t - s.up < 40) bigText(fx, 1, 'TAP TAP', fx.sx(fx.w.x), 150, 0xffffff, 2, -4);
      else if (s.turn && t - s.turn < 14) bigText(fx, 1, '?!', fx.sx(fx.l.x), 140, 0xffd23f, 3, 0);
      else fx.texts[1].setVisible(false);
      if (s.gnome) { var up = Math.min(1, (t - s.gnome) / 8); tinyGnome(g, fx.sx(s.gx), GY + 2 - up * 2, 1.4 * up, fx.dir); }
      if (s.stamp) {
        var sc = stampScale(t, s.stamp);
        bigText(fx, 0, 'GNOMED', W / 2, 120, 0xc0302a, 6 * sc, -6);
        // A gnome hat on the O.
        var hx = W / 2 - 18 * sc, hy = 120 - 30 * sc;
        g.fillStyle(0xc0302a, 1); g.fillTriangle(hx - 10 * sc, hy + 10 * sc, hx + 10 * sc, hy + 10 * sc, hx + 2 * sc, hy - 14 * sc);
      }
    }
  };

  // NICOLAS — Tardy: the bell rings, he sprints right past them (one hit on the way),
  // they spin like a top and drop, and a pink TARDY SLIP stamps the screen.
  FG.FINISHERS.nicolas = {
    len: 210,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'stand'], [8, 'watch'], [30, 'watch'], [36, 'dash']]); fx.anim(l, FG.dazedAnim, true); s.x0 = w.x; }
      if (t === 14) { FG.Sfx.bell(); s.bell = t; }
      if (t === 38) { s.run = t; fx.anim(w, [[1, 'run1'], [4, 'run2'], [8, 'run1']], true); sfx(function (S) { S.noise({ dur: 0.35, freq: 800, f1: 3200, q: 1, gain: 0.25 }); }); }
      if (s.run && !s.stop) {
        w.x += fx.dir * 14;
        if (t % 2 === 0) fx.scene.effects.dust(w.x - fx.dir * 10, 2, 1);
        if (!s.hit && (w.x - l.x) * fx.dir > -6) { s.hit = t; fx.hit(l, 'power', { ch: true, shake: 0.02, y: 56 }); fx.slow(18, 0.45); fx.pose(l, 'hit_high'); }
        if ((w.x - l.x) * fx.dir > 150 || w.x < C.WALL_L + 30 || w.x > C.WALL_R - 30) { s.stop = t; fx.anim(w, [[1, 'dash'], [8, 'stand'], [20, 'watch'], [60, 'watch'], [70, 'thumb']]); }
      }
      // They spin like a top, then drop.
      if (s.hit && t > s.hit && t < s.hit + 34) { if ((t - s.hit) % 3 === 0) l.facing = -l.facing; }
      if (s.hit && t === s.hit + 34) { l.facing = -fx.dir; fx.anim(l, [[1, 'hit_mid'], [10, 'down']]); }
      if (s.hit && t === s.hit + 44) { FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
      if (s.hit && t === s.hit + 56) { s.slip = t; sfx(function (S) { S.osc({ dur: 0.25, f0: 160, f1: 60, gain: 0.5 }); S.noise({ dur: 0.15, freq: 2000, q: 0.8, gain: 0.2 }); }); fx.shake(0.012); fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.bell && t - s.bell < 26) bigText(fx, 1, 'BRRRRING!', W / 2, 90, 0xffd23f, 3, Math.sin(t) * 3);
      else fx.texts[1].setVisible(false);
      if (s.slip) { // a pink hall slip, slapped on at an angle
        var sc = stampScale(t, s.slip), cx = W / 2, cy = 150, sw = 230 * sc, sh = 110 * sc, a = -0.1;
        var P = function (x, y) { return { x: cx + x * Math.cos(a) - y * Math.sin(a), y: cy + x * Math.sin(a) + y * Math.cos(a) }; };
        g.fillStyle(0x000000, 0.4); g.fillPoints([P(-sw / 2 + 6, -sh / 2 + 6), P(sw / 2 + 6, -sh / 2 + 6), P(sw / 2 + 6, sh / 2 + 6), P(-sw / 2 + 6, sh / 2 + 6)], true);
        g.fillStyle(0xf8b8d0, 1); g.fillPoints([P(-sw / 2, -sh / 2), P(sw / 2, -sh / 2), P(sw / 2, sh / 2), P(-sw / 2, sh / 2)], true);
        g.lineStyle(2, 0xd06a90, 1);
        for (var k = 1; k < 4; k++) { var a1 = P(-sw / 2 + 14 * sc, -sh / 2 + (26 + k * 20) * sc), a2 = P(sw / 2 - 14 * sc, -sh / 2 + (26 + k * 20) * sc); g.lineBetween(a1.x, a1.y, a2.x, a2.y); }
        g.lineStyle(2, 0x2a3a8a, 1); var q1 = P(30 * sc, 30 * sc), q2 = P(60 * sc, 22 * sc), q3 = P(90 * sc, 36 * sc); g.lineBetween(q1.x, q1.y, q2.x, q2.y); g.lineBetween(q2.x, q2.y, q3.x, q3.y); // a signature
        bigText(fx, 0, 'TARDY SLIP', cx, cy - 18 * sc, 0xb0203a, 3.2 * sc, -6);
        bigText(fx, 2, 'TIME IN: 0:00', cx - 30 * sc, cy + 34 * sc, 0x2a3a8a, 1.6 * sc, -6);
      } else fx.texts[2].setVisible(false);
    }
  };

  // MAX — All-Nighter: a suplex, then he rolls over onto them and falls asleep right
  // there, snoring. The lights go down.
  FG.FINISHERS.max = {
    len: 240,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'grab_c'], [8, 'grab_x'], [16, 'throw_lift']]); fx.anim(l, FG.dazedAnim, true); s.x0 = w.x; }
      if (t === 8) { FG.Sfx.play({ type: 'grab' }); fx.pose(l, 'hit_mid'); }
      // Up...
      if (t >= 16 && t < 30) { var u = (t - 16) / 14; l.x = w.x + fx.dir * 26 * (1 - u * 0.6); l.y = 40 + 30 * u; fx.pose(l, 'juggle'); }
      // ...and over: a suplex.
      if (t === 30) { fx.anim(w, [[1, 'throw_lift'], [10, 'suplex'], [40, 'suplex'], [52, 'crouch']]); sfx(function (S) { S.noise({ dur: 0.3, freq: 500, f1: 1400, q: 1, gain: 0.15 }); }); }
      if (t > 30 && t < 44) { var v = (t - 30) / 14; l.x = w.x + fx.dir * (10 - 46 * v); l.y = 70 * Math.sin((1 - v) * Math.PI / 2) + 10 * (1 - v); l._drawRot = -fx.dir * Math.PI * v; }
      if (t === 44) {
        l._drawRot = 0; l.y = 0; l.x = w.x - fx.dir * 36; fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, shake: 0.03, y: 12 }); fx.slow(22, 0.4); fx.scene.effects.dust(l.x, 16, 3);
      }
      // He rolls over onto them... and falls asleep.
      if (t === 80) { fx.pose(w, 'sleep'); w.x = l.x + fx.dir * 4; w.y = 8; s.sleep = t; s.night = t; }
      if (s.sleep && (t - s.sleep) % 60 === 10) sfx(function (S) { S.osc({ dur: 0.9, f0: 70, f1: 60, gain: 0.25, type: 'sawtooth', vib: [6, 8], attack: 0.3 }); S.noise({ dur: 0.6, freq: 300, q: 1, gain: 0.08, at: 0.2 }); });
      if (t === 120) { s.stamp = t; fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.night) { // the lights go down: an all-nighter
        var d = Math.min(0.55, (t - s.night) / 40);
        g.fillStyle(0x0a0a28, d); g.fillRect(0, 0, W, H);
        g.fillStyle(0xf4f0d0, d * 1.6); g.fillCircle(W - 90, 70, 18); g.fillStyle(0x0a0a28, d * 1.6); g.fillCircle(W - 82, 64, 16);
        bigText(fx, 2, '3:00 AM', W - 90, 110, 0xff5a3a, 2, 0);
      } else fx.texts[2].setVisible(false);
      if (s.sleep) { // the Zzz's drift up
        for (var k = 0; k < 3; k++) {
          var a = ((t - s.sleep) + k * 20) % 60, zx = fx.sx(fx.w.x) + 10 + a * 0.6 + k * 4, zy = GY - 40 - a * 1.4;
          if (k === 0) bigText(fx, 1, 'Z', zx, zy, 0xffffff, 2.4 - a / 40, 0, 1 - a / 60);
          else { g.lineStyle(2, 0xffffff, 1 - a / 60); g.lineBetween(zx, zy, zx + 8, zy); g.lineBetween(zx + 8, zy, zx, zy + 8); g.lineBetween(zx, zy + 8, zx + 8, zy + 8); }
        }
      } else fx.texts[1].setVisible(false);
      if (s.stamp) bigText(fx, 0, 'ALL-NIGHTER', W / 2, 140, 0xffa83a, 4 * stampScale(t, s.stamp), -5);
    }
  };

  // JACK — Back Row: he folds a giant paper airplane, climbs on and rides it across the
  // stage straight into them, then glides down and lands it perfectly. The judges agree.
  function bigPlane(g, x, y, dir, k, fold) {
    var P = function (u, v) { return { x: x + u * dir * k, y: y + v * k }; };
    if (fold < 1) { // still a sheet of paper, folding
      var f = fold;
      g.fillStyle(0xf6f6f0, 1); g.fillPoints([P(-30 + 20 * f, -14 + 10 * f), P(30, -14 + 14 * f), P(30, 14 - 14 * f), P(-30 + 20 * f, 14 - 10 * f)], true);
      g.lineStyle(1, 0x8aa8e0, 0.8); for (var r = -10; r <= 10; r += 5) { var a = P(-28 + 20 * f, r * (1 - f)), b = P(28, r * (1 - f)); g.lineBetween(a.x, a.y, b.x, b.y); }
      return;
    }
    g.fillStyle(0xf6f6f0, 1); g.fillPoints([P(32, 0), P(-30, -12), P(-20, 0)], true);
    g.fillStyle(0xd8d8d0, 1); g.fillPoints([P(32, 0), P(-30, 10), P(-20, 0)], true);
    g.lineStyle(2, 0x8a94a8, 1); var c = P(32, 0), e = P(-26, 0); g.lineBetween(c.x, c.y, e.x, e.y);
    g.lineStyle(2, 0x2a3a8a, 1); g.strokeCircle(P(-8, -5).x, P(-8, -5).y, 3 * k); // a doodle on the wing
  }
  FG.FINISHERS.jack = {
    len: 220,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'stand'], [8, 'fold'], [40, 'fold']]); fx.anim(l, FG.dazedAnim, true); s.px = w.x + fx.dir * 10; }
      if (t > 1 && t < 40 && t % 4 === 0) sfx(function (S) { S.noise({ dur: 0.05, freq: 5200, q: 3, gain: 0.06, type: 'highpass' }); });
      if (t === 44) { fx.pose(w, 'ride'); s.ride = t; sfx(function (S) { S.noise({ dur: 0.6, freq: 900, f1: 2600, q: 1, gain: 0.2 }); }); }
      if (s.ride && !s.landed) {
        var u = t - s.ride;
        w.x += fx.dir * (u < 6 ? 2 : 9);
        w.y = 30 + Math.sin(u * 0.2) * 4;
        s.px = w.x; s.py = w.y;
        if (!s.hit && (l.x - w.x) * fx.dir < 20) { s.hit = t; fx.hit(l, 'power', { ch: true, shake: 0.025, y: 50 }); fx.anim(l, [[1, 'juggle'], [30, 'down']]); fx.slow(18, 0.4); }
        // Glide down and land it.
        if (s.hit && t - s.hit > 10) { w.y = Math.max(0, 30 - (t - s.hit - 10) * 1.2); s.py = w.y; if (w.y === 0) { s.landed = t; fx.anim(w, [[1, 'ride'], [8, 'stand'], [24, 'lounge']]); sfx(function (S) { S.noise({ dur: 0.2, freq: 1400, q: 1, gain: 0.08 }); }); } }
        if (w.x < C.WALL_L + 30 || w.x > C.WALL_R - 30) { s.landed = t; w.y = 0; fx.anim(w, [[1, 'stand'], [16, 'lounge']]); }
      }
      if (s.hit && t > s.hit && t < s.hit + 30) { l.y = Math.sin((t - s.hit) / 30 * Math.PI) * 60; l.x += fx.dir * 3; }
      if (s.hit && t === s.hit + 30) { l.y = 0; FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
      if (s.landed && t === s.landed + 20) { s.cards = t; sfx(function (S) { [0, 0.12, 0.24].forEach(function (d) { S.osc({ dur: 0.08, f0: 1100, gain: 0.05, type: 'square', at: d }); }); }); fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gf;
      if (t > 4) {
        var fold = Math.min(1, (t - 4) / 34), x = s.ride ? s.px : fx.w.x + fx.dir * 30, y = GY - (s.ride ? s.py - 6 : 10);
        bigPlane(s.ride ? fx.gb : g, x, y, fx.dir, s.ride ? 1.8 : 1.2, fold);
      }
      if (s.cards) { // the judges: 10, 10, 10
        var gs = fx.gs;
        for (var k = 0; k < 3; k++) {
          var up = Math.min(1, (t - s.cards - k * 6) / 8);
          if (up <= 0) continue;
          var cx = W / 2 - 110 + k * 110, cy = 120 + (1 - up) * 60;
          gs.fillStyle(0x000000, 0.4); gs.fillRect(cx - 34, cy - 24, 72, 52);
          gs.fillStyle(0xf8f8f0, 1); gs.fillRect(cx - 38, cy - 28, 72, 52);
          gs.fillStyle(0x6a4a2a, 1); gs.fillRect(cx - 4, cy + 24, 6, 40);
          bigText(fx, k, '10', cx - 2, cy - 2, 0x2a3a8a, 4, 0);
        }
      } else if (s.landed && t - s.landed < 20) bigText(fx, 0, 'BACK ROW', W / 2, 100, 0x5fd7ff, 4, -5);
      else if (!s.cards) { fx.texts[0].setVisible(false); fx.texts[1].setVisible(false); fx.texts[2].setVisible(false); }
    }
  };

  // HUDSON — Extra Credit: he folds his arms and waits. They throw one last desperate
  // swing; he catches it (SHOW YOUR WORK), counters once, cleanly, and they drop. He
  // checks his calculator, nods, and a gold star stamps the screen.
  function star(g, cx, cy, r, col, a) {
    var pts = [];
    for (var k = 0; k < 10; k++) { var ang = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; pts.push({ x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr }); }
    g.fillStyle(col, a == null ? 1 : a); g.fillPoints(pts, true);
  }
  // A pose from one of the loser's own moves: its windup (before startup) or its strike.
  function movePose(who, id, strike) {
    var mv = who.def.moves[id], ks = mv.anim.filter(function (k) { return strike ? k[0] >= mv.startup : k[0] < mv.startup; });
    return (strike ? ks[0] : ks[ks.length - 1])[1];
  }
  FG.FINISHERS.hudson = {
    len: 230,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'stand'], [10, 'wait']]); fx.anim(l, FG.dazedAnim, true); }
      // Their last swing...
      if (t === 30) { fx.pose(l, movePose(l, 'heavy', false)); sfx(function (S) { S.noise({ dur: 0.2, freq: 700, f1: 1600, q: 1, gain: 0.12 }); }); }
      if (t === 40) {
        fx.pose(l, movePose(l, 'heavy', true)); fx.pose(w, 'parry'); s.catch = t;
        FG.Sfx.play({ type: 'parry' }); fx.scene.effects.spawn({ type: 'parry', x: (w.x + l.x) / 2, y: 70, facing: fx.dir });
        fx.slow(16, 0.4);
      }
      // ...caught, and one clean counter.
      if (t === 52) fx.anim(w, [[1, 'chk_x'], [4, 'chk_r'], [30, 'chk_r'], [40, 'stand']]);
      if (t === 55) { fx.hit(l, 'launch', { ch: true, shake: 0.02, y: 66 }); fx.anim(l, [[1, 'hit_high'], [8, 'juggle'], [32, 'down']]); s.fall = t; }
      if (s.fall && t > s.fall && t < s.fall + 32) { var v = (t - s.fall) / 32; l.y = Math.sin(v * Math.PI) * 60; l.x -= fx.dir * 1.4; }
      if (s.fall && t === s.fall + 32) { l.y = 0; FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
      // He checks the answer.
      if (t === 100) { fx.anim(w, [[1, 'check'], [26, 'nod'], [36, 'star']]); sfx(function (S) { S.osc({ dur: 0.05, f0: 900, gain: 0.05, type: 'square' }); S.osc({ dur: 0.05, f0: 1200, gain: 0.05, type: 'square', at: 0.08 }); }); }
      if (t === 140) {
        s.stamp = t; fx.shake(0.015); fx.scene.stage.react('wild');
        sfx(function (S) { S.osc({ dur: 0.3, f0: 180, f1: 60, gain: 0.5 }); [880, 1110, 1320, 1760].forEach(function (f, k) { S.osc({ dur: 0.18, f0: f, gain: 0.07, type: 'triangle', at: 0.12 + k * 0.07 }); }); });
      }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.catch && t - s.catch < 26) bigText(fx, 1, 'SHOW YOUR WORK!', fx.sx(fx.w.x), 130, 0x8ae0b0, 2, -3);
      else fx.texts[1].setVisible(false);
      if (s.stamp) {
        var sc = stampScale(t, s.stamp), cx = W / 2, cy = 130, r = 70 * sc, spin = (t - s.stamp) * 0.01;
        g.fillStyle(0x000000, 0.35); star(g, cx + 6, cy + 6, r, 0x000000, 0.35);
        star(g, cx, cy, r, 0xc8901a); star(g, cx, cy - 2, r * 0.86, 0xffd23f); star(g, cx - r * 0.12, cy - r * 0.16, r * 0.3, 0xfff2a8, 0.8);
        for (var k = 0; k < 8; k++) { // sparkles
          var a = k * Math.PI / 4 + spin, d = r * 1.3 + Math.sin(t / 4 + k) * 6;
          g.fillStyle(0xfff2a8, 0.8); g.fillRect(cx + Math.cos(a) * d - 2, cy + Math.sin(a) * d - 2, 4, 4);
        }
        bigText(fx, 0, 'A+', cx, cy + 4 * sc, 0xa0300a, 3 * sc, -4);
        bigText(fx, 2, 'EXTRA CREDIT', cx, cy + r + 24, 0xffd23f, 3 * Math.min(1.4, sc), -4);
      } else { fx.texts[0].setVisible(false); fx.texts[2].setVisible(false); }
    }
  };
})();
