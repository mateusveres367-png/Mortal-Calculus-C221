// KO finishers for the student side (see src/render/finishers.js for the flow and the
// FG.finisherFx toolkit). One script per student: FG.FINISHERS[id].
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y;

  function bigText(fx, i, str, x, y, color, scale, angle, alpha) {
    fx.texts[i].setText(str).setPosition(x, y).setScale(scale).setAngle(angle || 0).setTint(color).setAlpha(alpha == null ? 1 : alpha).setVisible(true);
  }
  function stampScale(t, at) { var u = Math.min(1, Math.max(0, (t - at) / 6)); return 1 + (1 - u) * (1 - u) * 2.5; }
  function sfx(fn) { FG.Sfx.synth(fn); }

  // MATEUS — Lights Out: he steps back. The crowd goes silent. Then a flying knee, in
  // slow motion. As they drop he's already turned round and walking away, and GNOMED.
  // stamps the screen in red before they hit the floor.
  FG.FINISHERS.mateus = {
    len: 230,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'idle'], [6, 'backdash'], [16, 'idle']]); fx.anim(l, FG.dazedAnim, true); }
      if (t > 1 && t < 14) w.x -= fx.dir * 1.6; // a step back
      // The hush: the lights dim, a heartbeat.
      if (t === 18) s.hush = t;
      if (s.hush && t < 60 && (t - 18) % 22 === 0) sfx(function (S) { S.osc({ dur: 0.12, f0: 60, gain: 0.5 }); S.osc({ dur: 0.1, f0: 55, gain: 0.35, at: 0.16 }); });
      // Two quick steps in...
      if (t === 46) { fx.anim(w, [[1, 'dash'], [6, 'jknee_c']]); s.x0 = w.x; s.goal = l.x - fx.dir * 34 * w.def.scale; }
      if (t > 46 && t < 56) w.x = s.x0 + (s.goal - fx.dir * 14 - s.x0) * (t - 46) / 10;
      // ...and the flying knee, in slow motion.
      if (t === 56) { fx.anim(w, [[1, 'jknee_c'], [4, 'jknee_x'], [30, 'jknee_x']]); fx.slow(70, 0.3); sfx(function (S) { S.noise({ dur: 0.5, freq: 500, f1: 2400, q: 0.8, gain: 0.25 }); }); }
      if (t > 56 && t < 72) { var u = (t - 56) / 16; w.y = Math.sin(u * Math.PI) * 34; w.x = s.goal - fx.dir * 14 * (1 - u); }
      if (t === 64) {
        s.hit = t; fx.hit(l, 'launch', { ch: true, shake: 0.03, y: 80 });
        fx.anim(l, [[1, 'hit_high'], [24, 'juggle'], [60, 'juggle']]); fx.flash(0xffffff, 0.5);
      }
      // They topple, slowly...
      if (s.hit && t > s.hit && t < s.hit + 60) { var v = (t - s.hit) / 60; l.y = Math.sin(Math.min(1, v * 1.6) * Math.PI * 0.5) * 30 * (1 - v); l.x += fx.dir * 0.8; }
      // ...and he's already turned round, walking away.
      if (t === 76) { w.y = 0; w.facing = -fx.dir; fx.anim(w, [[1, 'stand'], [8, 'away1'], [16, 'away2'], [24, 'away1']], true); }
      if (t > 76 && t < 190) w.x -= fx.dir * 0.9;
      if (t === 104) { s.stamp = t; fx.shake(0.012); sfx(function (S) { S.osc({ dur: 0.35, f0: 160, f1: 50, gain: 0.6 }); S.noise({ dur: 0.2, freq: 1400, q: 0.6, gain: 0.3 }); }); }
      if (s.hit && t === s.hit + 60) { l.y = 0; fx.pose(l, 'down'); FG.Sfx.play({ type: 'land' }); fx.shake(0.01); fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.hush) { // the lights go down, and stay down
        var d = Math.min(0.45, (t - s.hush) / 30);
        g.fillStyle(0x000000, d); g.fillRect(0, 0, W, H);
      }
      if (s.hush && t - s.hush < 40) bigText(fx, 1, '...', W / 2, 90, 0xffffff, 3, 0, Math.min(1, (t - s.hush) / 10));
      else fx.texts[1].setVisible(false);
      if (s.stamp) {
        var sc = stampScale(t, s.stamp), a = -0.12, cx = W / 2, cy = 140;
        // A red brushstroke behind the word.
        g.fillStyle(0x6a0a18, 0.9);
        g.fillPoints([{ x: cx - 200 * sc, y: cy - 30 * sc }, { x: cx + 190 * sc, y: cy - 50 * sc }, { x: cx + 210 * sc, y: cy + 22 * sc }, { x: cx - 180 * sc, y: cy + 36 * sc }], true);
        bigText(fx, 0, 'GNOMED.', cx + 4, cy + 4, 0x000000, 6 * sc, a * 57);
        bigText(fx, 2, 'GNOMED.', cx, cy, 0xe8182e, 6 * sc, a * 57);
      } else { fx.texts[0].setVisible(false); fx.texts[2].setVisible(false); }
    }
  };

  // NICOLAS — Tardy: he checks his watch. Then a 540 kick, in slow motion; the bell
  // rings as it lands, they spin like a top and drop, and a pink TARDY SLIP stamps it.
  FG.FINISHERS.nicolas = {
    len: 220,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.anim(w, [[1, 'stand'], [8, 'watch'], [26, 'watch'], [32, 'idle']]); fx.anim(l, FG.dazedAnim, true); s.x0 = w.x; s.to = l.x - fx.dir * 36 * w.def.scale; }
      // The jump, the full turn, slowed right down.
      if (t === 34) { fx.anim(w, [[1, 'tor_c'], [8, 'k540_c'], [18, 'k540_x'], [40, 'k540_x'], [52, 'k540_r'], [64, 'stand'], [80, 'watch'], [110, 'watch'], [120, 'thumb']]); fx.slow(70, 0.25); sfx(function (S) { S.noise({ dur: 0.6, freq: 500, f1: 2600, q: 0.8, gain: 0.25 }); }); }
      if (t > 34 && t < 64) { var u = (t - 34) / 30; w.y = Math.sin(u * Math.PI) * 40; w.x = s.x0 + (s.to - s.x0) * Math.min(1, u * 1.4); }
      if (t === 64) w.y = 0;
      // It lands, and the bell rings.
      if (t === 52) { s.hit = t; fx.hit(l, 'power', { ch: true, shake: 0.025, y: 72 }); fx.pose(l, 'hit_high'); FG.Sfx.bell(); s.bell = t; fx.flash(0xffffff, 0.5); }
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

  // MAX — All-Nighter: a slow-motion body lock suplex, and as they land he rolls straight
  // into an armbar. They tap. He lets go, lies back on the mat... and falls asleep right
  // there, snoring. The lights go down: 3:00 AM.
  FG.FINISHERS.max = {
    len: 260,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, gap = FG.C.SUB_GAP * w.def.scale;
      if (t === 1) { fx.anim(w, [[1, 'grab_c'], [8, 'grab_x'], [16, 'throw_lift']]); fx.anim(l, FG.dazedAnim, true); s.x0 = w.x; }
      if (t === 8) { FG.Sfx.play({ type: 'grab' }); fx.pose(l, 'hit_mid'); fx.slow(60, 0.35); }
      // Up...
      if (t >= 16 && t < 30) { var u = (t - 16) / 14; l.x = w.x + fx.dir * 26 * (1 - u * 0.6); l.y = 40 + 30 * u; fx.pose(l, 'juggle'); }
      // ...and over, in slow motion: the bridge.
      if (t === 30) { fx.anim(w, [[1, 'throw_lift'], [10, 'throw_back'], [30, 'throw_back']]); sfx(function (S) { S.noise({ dur: 0.3, freq: 500, f1: 1400, q: 1, gain: 0.15 }); }); }
      if (t > 30 && t < 44) { var v = (t - 30) / 14; l.x = w.x + fx.dir * (10 - 46 * v); l.y = 70 * Math.sin((1 - v) * Math.PI / 2) + 10 * (1 - v); l._drawRot = -fx.dir * Math.PI * v; }
      if (t === 44) {
        l._drawRot = 0; l.y = 0; l.x = w.x - fx.dir * 36; fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, shake: 0.03, y: 12 }); fx.scene.effects.dust(l.x, 16, 3);
      }
      // Straight into the armbar (their head toward him, his legs across their chest).
      if (t === 58) {
        s.fd = -fx.dir; w._drawFacing = s.fd; l._drawFacing = s.fd;
        w.x = l.x - s.fd * gap; w.y = 0;
        fx.pose(w, 'sub_armbar'); fx.pose(l, 'v_armbar'); s.hold = t;
        sfx(function (S) { S.osc({ dur: 0.2, f0: 120, f1: 50, gain: 0.5 }); S.noise({ dur: 0.15, freq: 500, q: 1, gain: 0.2 }); });
      }
      if (s.hold && t > 58 && t < 96) { fx.pose(w, t % 10 < 5 ? 'sub_armbar2' : 'sub_armbar'); fx.pose(l, t % 6 < 3 ? 'v_armbar' : 'v_armbar2'); }
      // They tap.
      if (t === 96) { s.tap = t; fx.pose(w, 'sub_armbar2'); fx.flash(0xffd23f, 0.5); fx.scene.effects.shake(0.01); }
      if (s.tap && t > 96 && t < 132) {
        fx.pose(l, ((t - 96) >> 2) % 2 ? 'v_armbar2' : 'v_armbar_tap');
        if ((t - 96) % 8 === 1) sfx(function (S) { S.noise({ dur: 0.05, freq: 2200, q: 2, gain: 0.5, type: 'bandpass' }); S.osc({ dur: 0.06, f0: 300, f1: 150, gain: 0.3 }); });
      }
      // He lets go, lies back on the mat... and he's out.
      if (t === 132) { fx.pose(l, 'down'); fx.anim(w, [[1, 'sub_armbar'], [16, 'lieback']]); }
      if (t === 160) { fx.anim(w, [[1, 'lieback'], [20, 'sleep']]); s.sleep = t; s.night = t; }
      if (s.sleep && (t - s.sleep) % 60 === 10) sfx(function (S) { S.osc({ dur: 0.9, f0: 70, f1: 60, gain: 0.25, type: 'sawtooth', vib: [6, 8], attack: 0.3 }); S.noise({ dur: 0.6, freq: 300, q: 1, gain: 0.08, at: 0.2 }); });
      if (t === 176) { s.stamp = t; fx.scene.stage.react('wild'); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.night) { // the lights go down: an all-nighter
        var d = Math.min(0.55, (t - s.night) / 40);
        g.fillStyle(0x0a0a28, d); g.fillRect(0, 0, W, H);
        g.fillStyle(0xf4f0d0, d * 1.6); g.fillCircle(W - 90, 70, 18); g.fillStyle(0x0a0a28, d * 1.6); g.fillCircle(W - 82, 64, 16);
        bigText(fx, 2, '3:00 AM', W - 90, 110, 0xff5a3a, 2, 0);
      } else fx.texts[2].setVisible(false);
      if (s.tap && t - s.tap < 36) bigText(fx, 3, 'TAP!', fx.sx(fx.l.x), GY - 96, 0xff4a3d, 3.4 * stampScale(t, s.tap), -6);
      else fx.texts[3].setVisible(false);
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

  // JACK — Back Row: in slow motion, the question mark kick: chambered low like a body
  // kick... turning over to the head. They spin and drop. He lands, does a little hop on
  // the spot, turns his back and walks off to his seat. BACK ROW.
  FG.FINISHERS.jack = {
    len: 230,
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s;
      if (t === 1) { fx.pose(w, 'idle'); fx.anim(l, FG.dazedAnim, true); }
      // The chamber, slowed right down: it looks like a body kick...
      if (t === 10) { fx.anim(w, [[1, 'idle'], [8, 'qm_c']]); fx.slow(70, 0.3); sfx(function (S) { S.noise({ dur: 0.5, freq: 600, f1: 1600, q: 1, gain: 0.1 }); }); }
      // ...and it turns over to the head.
      if (t === 26) {
        fx.pose(w, 'qm_x'); s.hit = t;
        fx.hit(l, 'power', { ch: true, shake: 0.03, y: 76 }); fx.flash(0xffffff, 0.6);
        fx.anim(l, [[1, 'hit_high'], [8, 'juggle'], [34, 'down']]);
      }
      if (s.hit && t > s.hit + 4 && t < s.hit + 34) { var u = (t - s.hit - 4) / 30; l.y = Math.sin(u * Math.PI) * 34; l.x += fx.dir * 1.6; l._drawRot = -fx.dir * u * 1.6; }
      if (s.hit && t === s.hit + 34) { l.y = 0; l._drawRot = 0; FG.Sfx.play({ type: 'land' }); fx.shake(0.01); }
      // A little hop on the spot...
      if (t === 66) { fx.anim(w, [[1, 'qm_r'], [8, 'idle'], [14, 'hop'], [20, 'idle']]); }
      if (t > 79 && t < 86) w.y = Math.sin((t - 79) / 6 * Math.PI) * 10;
      if (t === 86) w.y = 0;
      // ...then he turns his back and walks off to his seat.
      if (t === 100) { w._drawFacing = -fx.dir; fx.anim(w, [[1, 'away1'], [10, 'away2'], [20, 'away1']], true); s.walk = t; }
      if (s.walk && t > s.walk) w.x -= fx.dir * 1.3;
      if (t === 120) { s.stamp = t; fx.scene.stage.react('wild'); sfx(function (S) { S.osc({ dur: 0.2, f0: 660, f1: 990, gain: 0.08, type: 'triangle' }); }); }
    },
    draw: function (fx, t) {
      var s = fx.s;
      if (s.stamp) bigText(fx, 0, 'BACK ROW', W / 2, 110, 0x5fd7ff, 4 * stampScale(t, s.stamp), -5);
      else fx.texts[0].setVisible(false);
    }
  };

  // HUDSON — Extra Credit: he waits in the shell. They throw one last desperate swing; in
  // slow motion he leans back and it misses by an inch. One counter hook, clean, and they
  // drop. He checks his calculator, nods, and a gold star stamps the screen.
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
      // Their last swing... and he leans back out of it, in slow motion.
      if (t === 30) { fx.pose(l, movePose(l, 'heavy', false)); sfx(function (S) { S.noise({ dur: 0.2, freq: 700, f1: 1600, q: 1, gain: 0.12 }); }); }
      if (t === 40) {
        fx.pose(l, movePose(l, 'heavy', true)); fx.pose(w, 'lean'); s.miss = t;
        FG.Sfx.play({ type: 'dodge' }); fx.slow(30, 0.3);
      }
      // ...and one clean counter hook.
      if (t === 52) fx.anim(w, [[1, 'hook_c'], [4, 'hook_x'], [30, 'hook_x'], [40, 'stand']]);
      if (t === 55) { fx.hit(l, 'power', { ch: true, shake: 0.02, y: 72 }); fx.flash(0xffffff, 0.5); fx.anim(l, [[1, 'hit_high'], [8, 'juggle'], [32, 'down']]); s.fall = t; }
      if (s.fall && t > s.fall && t < s.fall + 32) { var v = (t - s.fall) / 32; l.y = Math.sin(v * Math.PI) * 40; l.x -= fx.dir * 1.4; l._drawRot = fx.dir * v * 1.2; }
      if (s.fall && t === s.fall + 32) { l.y = 0; l._drawRot = 0; FG.Sfx.play({ type: 'land' }); fx.shake(0.008); }
      // He checks the answer.
      if (t === 100) { fx.anim(w, [[1, 'check'], [26, 'nod'], [36, 'star']]); sfx(function (S) { S.osc({ dur: 0.05, f0: 900, gain: 0.05, type: 'square' }); S.osc({ dur: 0.05, f0: 1200, gain: 0.05, type: 'square', at: 0.08 }); }); }
      if (t === 140) {
        s.stamp = t; fx.shake(0.015); fx.scene.stage.react('wild');
        sfx(function (S) { S.osc({ dur: 0.3, f0: 180, f1: 60, gain: 0.5 }); [880, 1110, 1320, 1760].forEach(function (f, k) { S.osc({ dur: 0.18, f0: f, gain: 0.07, type: 'triangle', at: 0.12 + k * 0.07 }); }); });
      }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gs;
      if (s.miss && t - s.miss < 26) bigText(fx, 1, 'MISS', fx.sx(fx.w.x), 130, 0x8ae0b0, 2.4, -3);
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
