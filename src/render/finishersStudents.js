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
})();
