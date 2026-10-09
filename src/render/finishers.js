// KO finishers: a short cinematic the winner of the final round can trigger by
// entering their finisher command (def.finisher.input) within 2 seconds of the K.O.
// No gore: big moves, slow motion, a cut-in and a big pixel effect.
//
// The fight scene owns the flow (the input window, then the cinematic, then the
// win screen). This file has one script per fighter:
//   FG.FINISHERS[id] = { len, start(fx), step(fx, t), draw(fx, t) }
// fx is the toolkit the scene builds (see FG.finisherFx): the winner `w`, the
// loser `l`, `dir` (the winner's facing), pose / anim helpers, hits, shake, slow
// motion, flashes, speech, and three graphics layers: `gb` (world, behind the
// fighters), `gf` (world, in front) and `gs` (screen).
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y;

  // The toolkit for one finisher run.
  FG.finisherFx = function (scene, wi) {
    var f = scene.match.fighters, w = f[wi], l = f[1 - wi];
    var fx = {
      scene: scene, w: w, l: l, wi: wi, li: 1 - wi, dir: w.facing, s: {},
      gb: scene.finBack, gf: scene.finFront, gs: scene.finScreen, texts: scene.finTexts,
      // Hold a pose / play keyframes ([[frame, pose], ...]) on a fighter.
      pose: function (who, name) { who._override = { anim: [[1, name]], t: 1 }; },
      anim: function (who, anim, loop) { who._override = { anim: anim, t: 0, loop: !!loop }; },
      // A hit's sparks and sound at a fighter (kind: jab, body, power, launch, overhead, low).
      hit: function (who, kind, opts) {
        opts = opts || {};
        var ev = { type: 'hit', x: who.x - fx.dir * 6, y: opts.y || (who.y + 60), facing: fx.dir, move: { strength: opts.strength || 'heavy' },
          impact: kind || 'power', ch: !!opts.ch, hits: opts.hits || 1, damage: 20 };
        scene.effects.spawn(ev);
        FG.Sfx.play(ev);
        scene.effects.shake(opts.shake || 0.01);
        scene.impact = { who: who === w ? wi : 1 - wi, frames: 3, color: opts.ch ? 0xffb347 : 0xffffff };
      },
      shake: function (a) { scene.effects.shake(a); },
      slow: function (frames, scale) { scene.slowmo = { frames: frames, scale: scale }; },
      flash: function (color, alpha) { scene.effects.screen = { color: color, alpha: alpha || 0.8, life: 10, max: 10 }; },
      label: function (text) { scene.hud.setLabel(wi, text); },
      say: function (who, text, dur) { scene.speech.show(who.def.name, text, dur || 150); fx.speaker = who; },
      // World x to screen x (the camera centres between the fighters, no zoom here).
      sx: function (wx) { return wx - scene.cameras.main.scrollX; },
      text: function (i) { return fx.texts[i]; }
    };
    return fx;
  };

  // Shared drawing helpers ------------------------------------------------------------

  // Big pixel text on screen (pooled), with a drop shadow.
  function bigText(fx, i, str, x, y, color, scale, angle, alpha) {
    var t = fx.texts[i];
    t.setText(str).setPosition(x, y).setScale(scale).setAngle(angle || 0).setTint(color).setAlpha(alpha == null ? 1 : alpha).setVisible(true);
  }
  function stampScale(t, at) { var u = Math.min(1, Math.max(0, (t - at) / 6)); return 1 + (1 - u) * (1 - u) * 2.5; }

  // A dazed opponent standing up for it.
  FG.dazedAnim = [[1, 'hit_mid'], [24, 'hit_high'], [48, 'hit_mid']];

  FG.FINISHERS = {};

  // BRINKHUS — Solve for X: a flurry, a towering uppercut off the top of the screen,
  // and a giant X stamps the screen.
  FG.FINISHERS.brinkhus = {
    len: 200,
    step: function (fx, t) {
      var w = fx.w, l = fx.l;
      if (t < 58 && (t - 1) % 8 === 0) {
        var k = (t - 1) / 8, a = k % 2 ? 'cross' : 'jab';
        fx.anim(w, [[1, a + '_c'], [4, a + '_x'], [8, a + '_x']]);
      }
      if (t < 58 && (t - 4) % 8 === 0) { fx.hit(l, 'jab', { strength: 'light', y: 72, hits: (t - 4) / 8 + 1, shake: 0.004 }); fx.pose(l, (t / 8) % 2 < 1 ? 'hit_high' : 'hit_mid'); l.x += fx.dir * 1.5; }
      if (t === 60) fx.anim(w, [[1, 'crouch'], [6, 'up_c'], [12, 'up_x'], [70, 'up_x'], [90, 'up_r']]);
      if (t === 72) { fx.hit(l, 'launch', { ch: true, shake: 0.02 }); fx.pose(l, 'juggle'); fx.slow(26, 0.4); }
      if (t > 72) l.y = Math.min(420, (t - 72) * 9);
      if (t === 112) { FG.Sfx.play({ type: 'hit', move: { strength: 'heavy' }, impact: 'overhead', ch: true, hits: 1 }); fx.shake(0.025); fx.flash(0xffd23f, 0.6); }
      if (t === 130) fx.anim(w, FG.fighterById('brinkhus').victory, true);
    },
    draw: function (fx, t) {
      if (t < 112) return;
      var g = fx.gs, sc = stampScale(t, 112), cx = W / 2, cy = H / 2 - 10, r = 120 * sc;
      g.lineStyle(34 * sc, 0x111111, 1);
      g.lineBetween(cx - r + 4, cy - r * 0.8 + 6, cx + r + 4, cy + r * 0.8 + 6); g.lineBetween(cx + r + 4, cy - r * 0.8 + 6, cx - r + 4, cy + r * 0.8 + 6);
      g.lineStyle(26 * sc, 0xd4a933, 1);
      g.lineBetween(cx - r, cy - r * 0.8, cx + r, cy + r * 0.8); g.lineBetween(cx + r, cy - r * 0.8, cx - r, cy + r * 0.8);
      g.lineStyle(6 * sc, 0xfff2a0, 1);
      g.lineBetween(cx - r, cy - r * 0.8 - 8, cx + r, cy + r * 0.8 - 8);
      if (t > 124) bigText(fx, 0, 'X = K.O.', cx, cy + 112, 0xffffff, 3, -4);
    }
  };

  // CHAI — Q.E.D.: a spinning combo of kicks, a Q.E.D. box stamps, then she bows and
  // offers a hand.
  FG.FINISHERS.chai = {
    len: 230,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, KICKS = ['tk', 'rk', 'hk', 'hv', 'bk', 'tangent'];
      var k = Math.floor((t - 1) / 12);
      if (k < KICKS.length && (t - 1) % 12 === 0) {
        var p = KICKS[k], wind = FG.getPose(w.def, p + '_c') !== FG.POSES.idle ? p + '_c' : 'idle';
        fx.anim(w, [[1, wind], [5, p + '_x'], [11, p + '_x']]);
      }
      if (k < KICKS.length && (t - 6) % 12 === 0) {
        fx.hit(l, k > 3 ? 'power' : 'body', { strength: k > 3 ? 'heavy' : 'medium', y: 50 + (k % 3) * 12, hits: k + 1 });
        fx.pose(l, k % 2 ? 'hit_high' : 'hit_mid'); l.x += fx.dir * 3; w.x += fx.dir * 3;
      }
      if (t === 78) { fx.hit(l, 'power', { ch: true, shake: 0.016 }); fx.anim(l, [[1, 'hit_high'], [8, 'juggle'], [20, 'down']]); fx.slow(20, 0.45); }
      if (t > 78 && t < 98) { l.y = Math.max(0, Math.sin((t - 78) / 20 * Math.PI) * 40); l.x += fx.dir * 1.5; }
      if (t === 98) { l.y = 0; FG.Sfx.play({ type: 'land' }); }
      if (t === 104) { FG.Sfx.play({ type: 'hit', move: { strength: 'heavy' }, impact: 'overhead', hits: 1 }); fx.shake(0.012); }
      if (t === 120) fx.anim(w, [[1, 'stand'], [14, 'bow'], [44, 'bow'], [56, 'stand'], [70, 'offer'], [110, 'offer2']]);
      if (t === 190) fx.anim(l, [[1, 'down'], [20, 'crouch']]);
    },
    draw: function (fx, t) {
      if (t < 104) return;
      var g = fx.gs, sc = stampScale(t, 104), cx = W / 2, cy = 120, bw = 220 * sc, bh = 92 * sc;
      g.fillStyle(0x111111, 0.6); g.fillRect(cx - bw / 2 + 6, cy - bh / 2 + 6, bw, bh);
      g.fillStyle(0xf6ecd0, 1); g.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
      g.lineStyle(6 * sc, 0xe2702a, 1); g.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
      g.fillStyle(0x111111, 1); g.fillRect(cx + bw / 2 - 34 * sc, cy + bh / 2 - 34 * sc, 20 * sc, 20 * sc); // the tombstone square
      bigText(fx, 0, 'Q.E.D.', cx - 12 * sc, cy - 4, 0x2a1a10, 6 * sc, 0);
    }
  };

  // DALSASS — See Me After Class: three fake punches (they flinch every time), a finger
  // flick knocks them down, and a sticky note slaps onto the screen.
  FG.FINISHERS.dalsass = {
    len: 220,
    step: function (fx, t) {
      var w = fx.w, l = fx.l;
      if (t === 1 || t === 25 || t === 49) fx.anim(w, [[1, 'idle'], [8, 'feint_c'], [16, 'feint_x'], [24, 'idle']]);
      if (t === 10 || t === 34 || t === 58) {
        fx.anim(l, [[1, 'block'], [12, 'block'], [20, 'hit_mid']]);
        FG.Sfx.play({ type: 'feint' }); fx.s.flinch = t;
      }
      if (t === 76) fx.anim(w, [[1, 'wag'], [6, 'jab_x'], [14, 'wag']]);
      if (t === 82) { FG.Sfx.play({ type: 'hit', move: { strength: 'light' }, impact: 'jab', hits: 1 }); fx.anim(l, [[1, 'hit_high'], [8, 'juggle'], [18, 'down']]); fx.slow(24, 0.4); }
      if (t > 82 && t < 100) { l.y = Math.max(0, Math.sin((t - 82) / 18 * Math.PI) * 20); l.x += fx.dir * 1.2; }
      if (t === 100) { l.y = 0; FG.Sfx.play({ type: 'land' }); }
      if (t === 108) { FG.Sfx.play({ type: 'hit', move: { strength: 'heavy' }, impact: 'overhead', hits: 1 }); fx.shake(0.012); fx.scene.stage.cheer(3, true); FG.Sfx.cheer(1); }
      if (t === 124) fx.anim(w, FG.fighterById('dalsass').victory, true);
    },
    draw: function (fx, t) {
      var g = fx.gs;
      // "!" over their head at each flinch.
      if (fx.s.flinch && t - fx.s.flinch < 14 && t < 70) bigText(fx, 1, '!', fx.sx(fx.l.x), GY - 120, 0xffd23f, 4, 0);
      else fx.texts[1].setVisible(false);
      if (t < 108) return;
      // A yellow sticky note, slapped on crooked, a frowny face doodled on it.
      var sc = stampScale(t, 108), cx = W / 2 + 40, cy = 124, nw = 150 * sc, nh = 120 * sc;
      g.save(); g.translateCanvas(cx, cy); g.rotateCanvas(-0.08); g.translateCanvas(-cx, -cy);
      g.fillStyle(0x000000, 0.3); g.fillRect(cx - nw / 2 + 5, cy - nh / 2 + 6, nw, nh);
      g.fillStyle(0xfff07a, 1); g.fillRect(cx - nw / 2, cy - nh / 2, nw, nh);
      g.fillStyle(0xf2dc50, 1); g.fillRect(cx - nw / 2, cy - nh / 2, nw, 14 * sc);
      g.lineStyle(3 * sc, 0x2a4a9a, 1); g.strokeCircle(cx + 50 * sc, cy + 36 * sc, 13 * sc);
      g.fillStyle(0x2a4a9a, 1); g.fillCircle(cx + 45 * sc, cy + 32 * sc, 2 * sc); g.fillCircle(cx + 55 * sc, cy + 32 * sc, 2 * sc);
      g.beginPath(); g.arc(cx + 50 * sc, cy + 46 * sc, 6 * sc, Math.PI + 0.5, -0.5); g.strokePath();
      g.restore();
      bigText(fx, 0, 'SEE ME', cx - 10 * sc, cy - 22 * sc, 0x2a4a9a, 3 * sc, -5);
      if (t > 120) bigText(fx, 2, 'AFTER CLASS', cx - 12, cy + 6, 0x2a4a9a, 1.5, -5);
    }
  };

  // LEE — Infinite Series: the hits speed up into a blur while a counter climbs, then
  // he adjusts his glasses as they drop.
  FG.FINISHERS.lee = {
    len: 240,
    start: function (fx) { fx.s.next = 2; fx.s.gap = 14; fx.s.n = 0; fx.s.sum = 0; },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, P = ['jab', 'cross', 'body', 'elbow'];
      if (t === s.next && t < 150) {
        var p = P[s.n % P.length];
        fx.anim(w, [[1, p + '_c'], [Math.max(2, Math.round(s.gap / 3)), p + '_x'], [s.gap, p + '_x']]);
        s.n++; s.sum += s.n;
        fx.hit(l, s.n % 3 ? 'jab' : 'body', { strength: 'light', y: 50 + (s.n % 3) * 10, hits: s.n, shake: 0.003 });
        fx.pose(l, s.n % 2 ? 'hit_high' : 'hit_mid');
        s.gap = Math.max(2, s.gap - 1);
        s.next = t + s.gap;
      }
      if (t === 156) { fx.anim(w, [[1, 'fib_c'], [6, 'fib_x'], [30, 'fib_x'], [40, 'idle']]); }
      if (t === 162) { fx.hit(l, 'launch', { ch: true, shake: 0.02 }); fx.pose(l, 'juggle'); fx.slow(30, 0.4); }
      if (t > 162 && t < 200) l.y = Math.max(0, Math.sin((t - 162) / 38 * Math.PI) * 90);
      if (t === 178) fx.anim(w, [[1, 'stand'], [10, 'glasses2'], [40, 'glasses2'], [60, 'folded']]);
      if (t === 200) { l.y = 0; fx.pose(l, 'down'); FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
    },
    draw: function (fx, t) {
      var g = fx.gs, s = fx.s;
      // A blur of afterimages once it's fast.
      if (s.gap <= 5 && t < 156) {
        g.lineStyle(2, 0x39ff5a, 0.5);
        for (var k = 0; k < 8; k++) { var yy = GY - 40 - k * 9; g.lineBetween(fx.sx(fx.w.x) + fx.dir * 10, yy, fx.sx(fx.l.x), yy + (k % 2 ? 3 : -3)); }
      }
      var cx = W / 2, cy = 96;
      if (t < 162) bigText(fx, 0, 'S = ' + s.sum, cx, cy, 0x39ff5a, 4 + Math.min(2, s.n / 12), -4);
      else {
        // Infinity: two loops.
        var sc = stampScale(t, 162);
        g.lineStyle(10 * sc, 0x111111, 1); g.strokeCircle(cx - 34 * sc + 3, cy + 3, 30 * sc); g.strokeCircle(cx + 34 * sc + 3, cy + 3, 30 * sc);
        g.lineStyle(8 * sc, 0x39ff5a, 1); g.strokeCircle(cx - 34 * sc, cy, 30 * sc); g.strokeCircle(cx + 34 * sc, cy, 30 * sc);
        bigText(fx, 0, 'S = ', cx - 120 * sc, cy, 0x39ff5a, 4, -4);
        bigText(fx, 2, 'DIVERGES', cx, cy + 56, 0xffffff, 3, -4);
      }
    }
  };

  // LOPEZ — Area Under the Curve: he stands still; they swing; he catches it and
  // punishes once; a giant graph shades the area under the curve as they fall.
  FG.FINISHERS.lopez = {
    len: 240,
    start: function (fx) { fx.s.path = []; },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.pose(w, 'parry'); fx.anim(l, [[1, 'hit_mid'], [20, 'idle']]); }
      if (t === 30) { var hv = l.def.moves.heavy; fx.anim(l, hv.anim); s.swing = t; }
      if (t === 30 + 12) { fx.anim(w, [[1, 'parry'], [4, 'lock_x'], [16, 'lock_x'], [22, 'counter_x'], [50, 'counter_x'], [70, 'idle']]); FG.Sfx.play({ type: 'parry' }); fx.label('DERIVATIVE READ!'); fx.flash(0xdff6ff, 0.5); }
      if (t === 64) {
        fx.hit(l, 'power', { ch: true, shake: 0.02 }); fx.pose(l, 'juggle'); fx.slow(30, 0.45);
        s.x0 = l.x; s.vx = fx.dir * 2.4; s.vy = 8.5;
      }
      if (t > 64 && s.vy !== null) {
        l.x += s.vx; l.y += s.vy; s.vy -= 0.32;
        if (l.y <= 0) { l.y = 0; s.vy = null; fx.pose(l, 'down'); FG.Sfx.play({ type: 'land' }); fx.shake(0.01); s.landed = t; }
        s.path.push({ x: l.x, y: l.y });
      }
      if (t === 150) fx.anim(w, FG.fighterById('lopez').victory, true);
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb;
      if (t < 64 || !s.path.length) return;
      var x0 = s.x0, grid = 0x9aa4b8;
      // Axes from where they were hit.
      g.lineStyle(2, 0xffffff, 0.9);
      g.lineBetween(x0, GY, x0 + fx.dir * 260, GY); g.lineBetween(x0, GY, x0, GY - 150);
      g.lineStyle(1, grid, 0.35);
      for (var k = 1; k <= 6; k++) { g.lineBetween(x0 + fx.dir * k * 40, GY, x0 + fx.dir * k * 40, GY - 150); g.lineBetween(x0, GY - k * 24, x0 + fx.dir * 260, GY - k * 24); }
      // Shade the area under the curve, then trace the curve on top.
      g.fillStyle(0x5fd7ff, 0.32);
      for (var i = 1; i < s.path.length; i++) {
        var a = s.path[i - 1], b = s.path[i];
        g.fillPoints([{ x: a.x, y: GY - a.y - 40 }, { x: b.x, y: GY - b.y - 40 }, { x: b.x, y: GY }, { x: a.x, y: GY }], true);
      }
      g.lineStyle(3, 0xffffff, 1);
      g.beginPath();
      s.path.forEach(function (p, j) { if (j) g.lineTo(p.x, GY - p.y - 40); else g.moveTo(p.x, GY - p.y - 40); });
      g.strokePath();
      bigText(fx, 0, 'AREA UNDER THE CURVE', W / 2, 70, 0xffffff, 3, -3);
      if (s.landed && t > s.landed + 10) bigText(fx, 2, '= 1 K.O.', W / 2, 104, 0x5fd7ff, 4, -3);
    }
  };

  // MIYASHIRO — Calculated: a glowing parabola, one strike at the exact point, and they
  // fly along the arc into the whiteboard.
  FG.FINISHERS.miyashiro = {
    len: 230,
    start: function (fx) {
      var l = fx.l, wall = fx.dir > 0 ? C.WALL_R - 6 : C.WALL_L + 6;
      fx.s.x0 = l.x; fx.s.y0 = 60; fx.s.x1 = wall; fx.s.y1 = 70;
      fx.s.vx = (fx.s.x0 + fx.s.x1) / 2; fx.s.vy = 150; // the vertex
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.pose(w, 'idle'); fx.label('CALCULATED'); }
      if (t === 54) fx.anim(w, [[1, 'poke_c'], [8, 'poke_x'], [40, 'poke_x'], [60, 'idle']]);
      if (t === 62) { fx.hit(l, 'power', { ch: true, shake: 0.02 }); fx.pose(l, 'juggle'); fx.slow(26, 0.4); fx.flash(0x5fd7ff, 0.5); }
      if (t > 62 && t <= 112) {
        var u = (t - 62) / 50, p = point(s, u);
        l.x = p.x; l.y = Math.max(0, p.y - 40);
      }
      if (t === 112) {
        fx.scene.effects.spawn({ type: 'wallsplat', x: s.x1, y: s.y1 + 20, fighter: fx.li });
        FG.Sfx.play({ type: 'wallsplat' }); fx.shake(0.02); fx.pose(l, 'wall');
      }
      if (t > 124 && l.y > 0) l.y = Math.max(0, l.y - 3);
      if (t === 146) fx.pose(l, 'down');
      if (t === 150) fx.anim(w, FG.fighterById('miyashiro').victory, true);
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gf, shown = Math.min(1, t / 44), n = 40;
      // The path, drawn on over the first frames, glowing.
      for (var k = 0; k <= n * shown; k++) {
        var p = point(s, k / n), pulse = 0.5 + 0.5 * Math.sin(t * 0.3 - k * 0.4);
        g.fillStyle(0x5fd7ff, 0.25 + 0.5 * pulse); g.fillCircle(p.x, GY - p.y, 4);
        g.fillStyle(0xffffff, 0.9); g.fillRect(Math.round(p.x) - 1, Math.round(GY - p.y) - 1, 2, 2);
      }
      if (shown >= 1 && t < 112) {
        g.lineStyle(2, 0xffd23f, 1); g.strokeCircle(s.vx, GY - s.vy, 7 + Math.sin(t * 0.4) * 2);
        bigText(fx, 0, 'VERTEX', fx.sx(s.vx), GY - s.vy - 22, 0xffd23f, 2, 0);
      } else fx.texts[0].setVisible(false);
      if (t >= 112) bigText(fx, 2, 'Y = A(X-H)*(X-H)+K', W / 2, 74, 0x5fd7ff, 2, -3);
    }
  };
  // A point on the parabola through (x0, y0), the vertex and (x1, y1), u in 0..1.
  function point(s, u) {
    var x = s.x0 + (s.x1 - s.x0) * u, a = (s.y0 - s.vy) / ((s.x0 - s.vx) * (s.x0 - s.vx));
    var y = s.vy + a * (x - s.vx) * (x - s.vx);
    if (u > 0.5) { var a2 = (s.y1 - s.vy) / ((s.x1 - s.vx) * (s.x1 - s.vx)); y = s.vy + a2 * (x - s.vx) * (x - s.vx); }
    return { x: x, y: y };
  }

  // PEDERSEN — Horse to Water: he loosens his tie, one massive Exponential Haymaker,
  // and they fly into his red sports car and set off the alarm.
  FG.FINISHERS.pedersen = {
    len: 280,
    start: function (fx) {
      var wall = fx.dir > 0 ? C.WALL_R : C.WALL_L;
      fx.s.carX = wall - fx.dir * 90;
      fx.s.from = fx.l.x;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'stand'], [10, 'tie'], [24, 'tie2'], [36, 'tie'], [50, 'idle']]); fx.anim(l, FG.dazedAnim, true); }
      if (t === 56) fx.anim(w, [[1, 'hay_c'], [16, 'hay_x'], [50, 'hay_x'], [70, 'idle']]);
      if (t === 72) { fx.hit(l, 'power', { ch: true, shake: 0.03 }); fx.flash(0xffffff, 0.8); fx.pose(l, 'juggle'); fx.slow(36, 0.3); fx.label('EXPONENTIAL!'); }
      if (t > 72 && t <= 112) {
        var u = (t - 72) / 40;
        l.x = s.from + (s.carX - s.from) * u; l.y = 40 + Math.sin(u * Math.PI) * 70;
      }
      if (t === 112) { l.y = 40; fx.pose(l, 'down'); FG.Sfx.play({ type: 'wallsplat' }); fx.shake(0.025); s.alarm = t; }
      if (t > 112 && t < 140) l.y = Math.max(0, l.y - 1.5);
      if (s.alarm && (t - s.alarm) % 16 === 0 && t - s.alarm < 150) FG.Sfx.alarm((t - s.alarm) % 32 === 0);
      if (t === 130) fx.anim(w, [[1, 'stand'], [10, 'calm'], [60, 'calm']], true);
      if (t === 136) fx.say(w, "You can lead a horse to water, but you can't make them drink.", 140);
    },
    draw: function (fx, t) {
      var s = fx.s, lights = s.alarm && t > s.alarm ? ((t - s.alarm) % 16 < 8 ? 1 : 0) : 0, bump = s.alarm && t - s.alarm < 10 ? Math.sin((t - s.alarm) * 1.5) * 2 : 0;
      FG.drawCar(fx.gb, s.carX, GY - 26 + bump, { scale: 0.82, facing: -fx.dir, lights: lights });
      if (lights) bigText(fx, 0, 'WEE-OO WEE-OO', fx.sx(s.carX), GY - 90, 0xff4a3d, 2, -6);
      else if (!s.alarm || t - s.alarm > 150) fx.texts[0].setVisible(false);
    }
  };

  // RAMOS — Cardio Finale: he grabs them, runs a full lap of the stage carrying them,
  // a big slam, then a hair flip.
  FG.FINISHERS.ramos = {
    len: 400,
    start: function (fx) {
      var s = fx.s;
      s.home = fx.w.x; s.dir = fx.dir; s.leg = 0; // legs: to the far wall, back to the near wall, home
      s.walls = [fx.dir > 0 ? C.WALL_R - 40 : C.WALL_L + 40, fx.dir > 0 ? C.WALL_L + 40 : C.WALL_R - 40];
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, SPEED = 11;
      if (t === 1) fx.anim(w, [[1, 'grab_c'], [8, 'grab_x'], [14, 'throw_lift']]);
      if (t === 6) { FG.Sfx.play({ type: 'grab' }); fx.pose(l, 'hit_mid'); }
      if (t === 16) { fx.anim(w, [[1, 'run1'], [6, 'run2'], [12, 'run1']], true); fx.pose(l, 'down'); s.running = true; }
      if (s.running) {
        var target = s.leg < 2 ? s.walls[s.leg] : s.home, d = target - w.x;
        w.facing = d >= 0 ? 1 : -1;
        w.x += Math.max(-SPEED, Math.min(SPEED, d));
        if (Math.abs(target - w.x) < 1) { s.leg++; if (s.leg > 2) { s.running = false; s.slam = t; } }
        if (t % 9 === 0) fx.scene.effects.dust ? fx.scene.effects.dust(w.x - w.facing * 10, 4, 1) : null;
      }
      if (s.running || (s.slam && t < s.slam + 12)) { l.x = w.x + w.facing * 2; l.y = 54; l.facing = -w.facing; }
      if (s.slam && t === s.slam) { w.facing = s.dir; fx.anim(w, [[1, 'throw_lift'], [10, 'throw_slam'], [30, 'throw_slam'], [40, 'stand']]); }
      if (s.slam && t === s.slam + 12) {
        l.x = w.x + s.dir * 30; l.y = 0; fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, shake: 0.03, y: 10 }); fx.scene.effects.dust && fx.scene.effects.dust(l.x, 20, 4); fx.slow(24, 0.4);
      }
      if (s.slam && t === s.slam + 50) {
        fx.anim(w, [[1, 'stand'], [8, 'hairflip'], [16, 'hairflip2'], [30, 'stretch'], [50, 'stand']]);
        // Give the hair a big swing.
        (w._hairPts || []).forEach(function (p, i) { p.px = p.x + s.dir * i * 3; p.py = p.y + i * 2; });
      }
      if (s.slam && t >= s.slam + 110) fx.done = true;
    },
    draw: function (fx, t) {
      var s = fx.s;
      if (s.running) bigText(fx, 0, 'CARDIO!', W / 2, 70, 0xd8283a, 4, -5);
      else if (s.slam && t > s.slam + 12) bigText(fx, 0, 'CARDIO FINALE', W / 2, 70, 0xffffff, 4, -5);
    }
  };

  // WILSON — Class Dismissed: he checks his watch; one clean strike; the bell rings;
  // they drop; he walks off without looking back.
  FG.FINISHERS.wilson = {
    len: 230,
    step: function (fx, t) {
      var w = fx.w, l = fx.l;
      if (t === 1) fx.anim(w, [[1, 'stand'], [10, 'watch'], [40, 'watch'], [46, 'idle']]);
      if (t === 46) fx.anim(w, [[1, 'dist_c'], [6, 'dist_x'], [30, 'dist_x'], [40, 'stand']]);
      if (t === 52) { fx.hit(l, 'power', { ch: true, shake: 0.02 }); fx.pose(l, 'hit_high'); fx.slow(20, 0.4); }
      if (t === 66) { FG.Sfx.bell(); fx.s.bell = t; fx.scene.stage.react('ko'); }
      if (t === 84) fx.anim(l, [[1, 'hit_mid'], [10, 'kneel'], [24, 'down']]);
      if (t === 108) { FG.Sfx.play({ type: 'land' }); fx.shake(0.006); }
      // He turns his back and walks off.
      if (t === 116) { w.facing = -fx.dir; fx.anim(w, [[1, 'walk1'], [10, 'walk2'], [20, 'walk1']], true); }
      if (t > 116) w.x -= fx.dir * 1.1;
    },
    draw: function (fx, t) {
      var g = fx.gs;
      if (fx.s.bell && t - fx.s.bell < 50) {
        // The bell, shaking on the wall.
        var j = Math.sin((t - fx.s.bell) * 1.6) * 3, bx = W / 2 + j, by = 70;
        g.fillStyle(0x111111, 0.6); g.fillCircle(bx + 3, by + 3, 22);
        g.fillStyle(0xc8a030, 1); g.fillCircle(bx, by, 22);
        g.fillStyle(0xf0d070, 1); g.fillCircle(bx - 6, by - 6, 7);
        g.fillStyle(0x3a2a10, 1); g.fillCircle(bx, by, 4);
        bigText(fx, 1, 'RIIIING', bx, by + 36, 0xffffff, 2, j);
      } else fx.texts[1].setVisible(false);
      if (t > 130) bigText(fx, 0, 'CLASS DISMISSED.', W / 2, 130, 0xffd23f, 3 * stampScale(t, 130), -4);
    }
  };
})();
