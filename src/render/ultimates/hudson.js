// HUDSON — Calculator Overflow: a giant graphing calculator slams down beside him. He
// types, calm as anything (9^9^9^9^9...), and presses ENTER. The display reads ERROR,
// and then the whole screen does: error boxes pop up everywhere, faster and faster,
// until there's no room left. Then every one of them flies at the opponent at once, and
// the biggest one lands last. "That's a syntax error."
// Camera: a slow push in on the display while he types, a cut to the opponent on
// ENTER, a slight roll as the boxes fill the screen, and a hard push-in on the last box.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var DROP = 8, TYPE = [24, 116], ENTER = 120, OVER = [128, 190], FLY = 186, LAST = 236, DONE = 252;
  var CALC = { s1: -170, s2: -90, h: 186 }, ME = -56, THEM = 70, N = 40;
  var KEYS = '789/456*123-0.^+';
  var TYPED = '9^9^9^9^9^9^9^9^9^9';

  // An error box (screen space): title bar, a red X, two lines of "text".
  function errBox(g, x, y, w, h, a) {
    g.fillStyle(0x000000, 0.35 * a); g.fillRect(x + 3, y + 3, w, h);
    g.fillStyle(0xdcdcdc, a); g.fillRect(x, y, w, h);
    g.fillStyle(0x1a3aa8, a); g.fillRect(x, y, w, Math.max(3, h * 0.22));
    g.fillStyle(0xffffff, a); g.fillRect(x + w - h * 0.2, y + 1, h * 0.16, h * 0.16);
    g.fillStyle(0xc0302a, a); g.fillCircle(x + h * 0.3, y + h * 0.6, h * 0.17);
    g.fillStyle(0xffffff, a); g.fillRect(x + h * 0.3 - 1, y + h * 0.48, 2, h * 0.16);
    g.fillStyle(0x6a6a6a, a); g.fillRect(x + h * 0.56, y + h * 0.48, w - h * 0.8, 2); g.fillRect(x + h * 0.56, y + h * 0.66, (w - h * 0.8) * 0.6, 2);
    g.lineStyle(1, 0x5a5a5a, a); g.strokeRect(x, y, w, h);
  }

  // The calculator, standing on the floor of the set, `drop` above where it lands.
  function drawCalc(fx, g, drop, lit, t) {
    var s1 = CALC.s1, s2 = CALC.s2, top = CALC.h + drop, bot = drop;
    fx.rect(g, s1 - 4, bot, s2 + 4, top + 4, 0x16181e);
    fx.rect(g, s1, bot + 4, s2, top, 0x2c313a);
    fx.rect(g, s1 + 6, top - 50, s2 - 6, top - 10, 0x5a6a5a); // the display bezel
    fx.rect(g, s1 + 9, top - 47, s2 - 9, top - 13, 0x9ad8a0);
    fx.rect(g, s1 + 8, top - 8, s1 + 40, top - 4, 0x8a8f9a); // the brand strip (no logo)
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var k = r * 4 + c, ks = s1 + 8 + c * 17, kh = top - 68 - r * 26, ch = KEYS[k];
      var col = /[0-9.]/.test(ch) ? 0x4a4f5a : 0xd87a2a;
      if (lit === k) col = 0xffffff;
      fx.rect(g, ks, kh - 18, ks + 13, kh, FG.shade(col, 0.6));
      fx.rect(g, ks, kh - 16, ks + 13, kh, col);
    }
    var ek = lit === 'enter' ? 0xffffff : 0x3a8ad8; // ENTER, along the bottom
    fx.rect(g, s1 + 8, bot + 8, s2 - 8, bot + 24, FG.shade(ek, 0.6)); fx.rect(g, s1 + 8, bot + 10, s2 - 8, bot + 24, ek);
  }

  FG.ULTIMATES.hudson = {
    start: function (fx) {
      var s = fx.s;
      s.boxes = [];
      var hits = fx.w.def.ultimate.hits;
      for (var i = 0; i < N; i++) {
        s.boxes.push({ x: 30 + K.hash(i, 1) * (W - 120), y: 40 + K.hash(i, 2) * (H - 150), w: 46 + K.hash(i, 3) * 40, born: OVER[0] + Math.floor(Math.pow(i / N, 0.6) * (OVER[1] - OVER[0])),
          land: hits[i % (hits.length - 1)] });
        s.boxes[i].h = s.boxes[i].w * 0.55;
      }
      fx.place(fx.l, fx.S(fx.lx0), 0); fx.pose(fx.l, 'hit_mid');
      fx.pose(fx.w, 'c1_x');
      fx.cam(fx.S(fx.lx0) - 30, 110, 1.3, { k: 0.3 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // The calculator drops in from above.
      if (t === DROP) {
        s.drop = t; fx.place(w, ME, 0); fx.face(w, fx.dir); fx.pose(w, 'stand');
        fx.place(l, THEM, 0); fx.face(l, -fx.dir); fx.anim(l, FG.dazedAnim, true);
        fx.cam(-40, 130, 0.95, { cut: true });
        fx.sfx(function (S) { S.noise({ dur: 0.4, freq: 1400, f1: 300, q: 0.8, gain: 0.2 }); });
      }
      if (t === DROP + 8) { fx.shake(0.02); fx.dust(fx.X((CALC.s1 + CALC.s2) / 2), 20, 3); fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 90, f1: 30, gain: 0.8 }); S.noise({ dur: 0.3, freq: 600, q: 0.5, gain: 0.3 }); }); }
      // He types. Calmly.
      if (t === TYPE[0]) { fx.anim(w, [[1, 'type1'], [4, 'type2'], [8, 'type1']], true); fx.cam(CALC.s2 - 20, 150, 1.6, { k: 0.08 }); }
      if (t > TYPE[0] && t < TYPE[1]) {
        fx.cam(CALC.s2 - 20 - (t - TYPE[0]) * 0.2, 150, 1.6 + (t - TYPE[0]) * 0.004, { k: 0.08 });
        if ((t - TYPE[0]) % 5 === 0) {
          s.typed = Math.min(TYPED.length, (s.typed || 0) + 1);
          var ch = TYPED[s.typed - 1]; s.lit = KEYS.indexOf(ch); s.litT = t;
          var f0 = ch === '^' ? 1400 : 900;
          fx.sfx(function (S) { S.osc({ dur: 0.05, f0: f0, gain: 0.05, type: 'square' }); });
        }
      }
      if (s.litT && t - s.litT > 3) s.lit = -1;
      // ENTER.
      if (t === ENTER - 6) { fx.pose(w, 'enter'); fx.cam(-60, 120, 1.15, { k: 0.2 }); }
      if (t === ENTER) {
        s.enter = t; s.lit = 'enter'; s.litT = t;
        fx.flash(0xffffff, 0.5);
        fx.sfx(function (S) { S.osc({ dur: 0.08, f0: 1200, gain: 0.08, type: 'square' }); S.osc({ dur: 0.5, f0: 140, gain: 0.2, type: 'sawtooth', at: 0.12 }); });
      }
      if (t === ENTER + 10) { fx.pose(w, 'wait'); fx.cam(THEM - 10, 110, 1.3, { cut: true }); }
      // The screen fills with errors.
      s.boxes.forEach(function (b) {
        if (t === b.born) fx.sfx(function (S) { S.osc({ dur: 0.06, f0: 660 + K.hash(b.x, 4) * 400, gain: 0.04, type: 'square' }); });
      });
      if (t > OVER[0] && t < FLY) fx.cam(THEM - 10 - (t - OVER[0]) * 0.6, 120, 1.3 - (t - OVER[0]) * 0.004, { k: 0.15, rot: Math.sin((t - OVER[0]) / 20) * 0.03 });
      if (t > OVER[0] && t < FLY && t % 9 === 0) fx.face(l, t % 18 ? fx.dir : -fx.dir); // looking around
      if (t === FLY) { fx.face(l, -fx.dir); fx.cam(THEM, 110, 1.35, { k: 0.3 }); fx.sfx(function (S) { S.noise({ dur: 0.5, freq: 900, f1: 3000, q: 1, gain: 0.2 }); }); }
      // ...and they all hit at once.
      var hi = hits.indexOf(t);
      if (hi >= 0 && hi < hits.length - 1) {
        fx.hit(l, hi % 2 ? 'jab' : 'body', { strength: 'medium', hits: hi + 1, shake: 0.006, y: 50 + (hi % 3) * 14 });
        fx.pose(l, hi % 2 ? 'hit_high' : 'hit_mid');
        fx.sfx(function (S) { S.osc({ dur: 0.08, f0: 520 - hi * 20, gain: 0.08, type: 'square' }); S.noise({ dur: 0.06, freq: 2200, q: 1, gain: 0.1 }); });
      }
      // The biggest one, last.
      if (t === LAST - 14) { s.big = t; fx.cam(THEM, 140, 1.0, { k: 0.2 }); }
      if (t === LAST) {
        s.slam = t; fx.pose(l, 'down');
        fx.hit(l, 'overhead', { ch: true, shake: 0.04, y: 40, hits: hits.length });
        fx.flash(0xffffff, 0.6); fx.slow(26, 0.35);
        fx.cam(THEM, 70, 1.7, { cut: true, rot: -0.04 });
        fx.sfx(function (S) { S.osc({ dur: 0.7, f0: 110, f1: 30, gain: 0.9 }); S.osc({ dur: 0.4, f0: 220, gain: 0.15, type: 'square' }); S.noise({ dur: 0.4, freq: 1200, q: 0.5, gain: 0.3 }); });
        fx.crowd(3);
      }
      if (t === DONE) { fx.anim(w, [[1, 'stand'], [8, 'check'], [40, 'nod']]); fx.say(w, "That's a syntax error.", 80); fx.cam(ME + 30, 110, 1.25, { k: 0.1 }); }
    },
    draw: function (fx, t) {
      var s = fx.s, g = fx.gb, gs = fx.gs, hits = fx.w.def.ultimate.hits;
      // The calculator: drops in, stays until the last box lands.
      if (s.drop && t < DONE + 40) {
        var d = Math.max(0, 1 - (t - s.drop) / 8), drop = d * d * 320;
        drawCalc(fx, g, drop, s.lit, t);
        var disp = s.enter ? (t % 16 < 10 ? 'ERROR' : '') : TYPED.slice(Math.max(0, (s.typed || 0) - 8), s.typed || 0);
        fx.wtext(0, disp, (CALC.s1 + CALC.s2) / 2, CALC.h + drop - 30, 0x1a2a1a, s.enter ? 1.5 : 1.3);
      }
      if (t >= TYPE[0] && t < ENTER) fx.text(1, 'TYPING...', W / 2, 300, 0x8ae0b0, 2);
      // The boxes: pop up, then fly into them on their own hit frame.
      var tgt = fx.at2(fx.l, 60), n = 0;
      s.boxes.forEach(function (b, i) {
        if (t < b.born || t >= b.land || !s.enter) return;
        var pop = Math.min(1, (t - b.born) / 4), x = b.x, y = b.y, ww = b.w * pop, hh = b.h * pop;
        if (t > b.land - 10) { var u = K.ease((t - (b.land - 10)) / 10); x += (tgt[0] - b.w / 2 - x) * u; y += (tgt[1] - b.h / 2 - y) * u; ww *= 1 - 0.6 * u; hh *= 1 - 0.6 * u; }
        errBox(gs, x, y, ww, hh, 1);
        if (n < 12 && pop >= 1 && t < b.land - 10) fx.text(4 + n++, 'ERROR', x + ww * 0.62, y + hh * 0.42, 0x2a2a2a, 1);
      });
      for (var k = n; k < 12; k++) fx.text(4 + k, '', 0, 0, 0, 1, 0, 0);
      if (t >= OVER[0] && t < FLY) fx.text(2, 'OVERFLOW', W / 2, 112, 0xff5a3a, 2.5 + Math.sin(t / 3) * 0.2, -3);
      // The giant one.
      if (s.big && t < LAST + 24) {
        var v = Math.min(1, (t - s.big) / 14), bw = 260, bh = 150, bx = tgt[0] - bw / 2, by = -bh + (tgt[1] - bh / 2 + 20 + bh) * K.ease(v);
        var fade = t > LAST + 10 ? 1 - (t - LAST - 10) / 14 : 1; // it closes, and there they are
        errBox(gs, bx, by, bw, bh, fade);
        fx.text(3, 'SYNTAX ERROR', bx + bw * 0.58, by + bh * 0.48, 0x2a2a2a, 2, 0, fade);
      }
      if (s.slam && t - s.slam < 50) fx.text(16, 'OVERFLOW!', W / 2, 90, 0x8ae0b0, 3 * K.stamp(t, s.slam), -5);
    }
  };
})();
