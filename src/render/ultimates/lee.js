// LEE — Grading at 11 PM: cut to him at his desk at night (a lamp, cold coffee, a
// mountain of papers). He grades faster and faster, and every red check mark is a hit
// on the opponent, who takes them in a comic panel across the room. He finishes,
// sighs, adjusts his glasses, and flicks the red pen for the final hit.
// Camera: a fade to black, a wide shot of the desk and the panel, a slow push-in as
// the night wears on, then a whip-pan following the pen.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var FADE = 4, ROOM = 20, SIGH = 186, GLASSES = 206, COCK = 222, THROW = 230, BACK = 262;
  var PANEL = { s1: 166, s2: 272, h1: -6, h2: 132 }, OPP = 219, PILE = 30;
  var RED = 0xe0242c, WALL = 0x18203a, WOOD = 0x5a3c22, LAMP = 0xffd27a;

  function minutes(n) { var m = Math.min(59, n * 4); return '11:' + (m < 10 ? '0' : '') + m + ' PM'; }

  // The room at night: window, moon and stars, shelves, the desk in the lamplight.
  function drawRoom(fx, g, t, s) {
    var hash = K.hash;
    fx.fill(g, WALL);
    fx.rect(g, -W * 1.6, -90, W * 1.6, 0, 0x231812);
    for (var b = -12; b < 12; b++) fx.rect(g, b * 52, -90, b * 52 + 2, 0, 0x2e2018);
    // The window: night sky, a moon, stars, the city's lights.
    fx.rect(g, -216, 84, -86, 196, 0x3a2a1c); fx.rect(g, -210, 90, -92, 190, 0x0b1230);
    for (var k = 0; k < 18; k++) { var tw = (t + k * 7) % 40 < 30 ? 1 : 0.4; fx.rect(g, -206 + hash(k, 1) * 108, 120 + hash(k, 2) * 66, -205 + hash(k, 1) * 108, 121 + hash(k, 2) * 66, 0xffffff, tw); }
    fx.circle(g, -120, 168, 11, 0xf2f0d8); fx.circle(g, -114, 171, 10, 0x0b1230);
    for (var c = 0; c < 9; c++) fx.rect(g, -210 + c * 13, 90, -200 + c * 13, 96 + hash(c, 3) * 22, 0x141a33);
    for (var lc = 0; lc < 9; lc++) if (hash(lc, 4) > 0.4) fx.rect(g, -207 + lc * 13, 93, -205 + lc * 13, 95, 0xffd27a, 0.8);
    fx.rect(g, -152, 90, -150, 190, 0x3a2a1c); fx.rect(g, -210, 139, -92, 141, 0x3a2a1c);
    // A bookshelf.
    fx.rect(g, -300, 0, -236, 170, 0x2e2016);
    for (var sh = 0; sh < 4; sh++) {
      fx.rect(g, -298, 6 + sh * 42, -238, 8 + sh * 42, 0x1a120c);
      for (var bk = 0; bk < 7; bk++) fx.rect(g, -296 + bk * 8, 8 + sh * 42, -290 + bk * 8, 30 + sh * 42 + hash(bk, sh) * 8, [0x7a2a2a, 0x2a4a7a, 0x2a6a3a, 0x8a7a3a][(bk + sh) % 4]);
    }
    // The clock on the wall.
    fx.rect(g, 18, 150, 92, 176, 0x0a0a0a); fx.rect(g, 20, 152, 90, 174, 0x101010);
    fx.wtext(3, minutes(s.done || 0), 55, 163, 0xff3d3d, 1.6);
    // Lamplight: a warm glow over the desk.
    var lp = fx.P(70, 104);
    for (var r = 5; r > 0; r--) { g.fillStyle(LAMP, 0.035); g.fillCircle(lp.x, lp.y, 30 + r * 34); }
    // His chair.
    fx.rect(g, -18, 22, 10, 27, 0x3a3a44); fx.rect(g, -20, 22, -15, 74, 0x3a3a44); fx.rect(g, -6, 0, -3, 22, 0x222228);
    fx.rect(g, -14, 0, 4, 2, 0x222228);
  }
  // The desk and everything on it (in front of him).
  function drawDesk(fx, g, t, s) {
    fx.rect(g, 8, 42, 146, 48, WOOD); fx.rect(g, 8, 47, 146, 48, 0x7a5432);
    fx.rect(g, 12, 0, 17, 42, 0x3e2a18); fx.rect(g, 136, 0, 141, 42, 0x3e2a18);
    // The mountain of papers, shrinking; the done pile, growing.
    var left = Math.max(0, PILE - (s.done || 0) * 2), right = (s.done || 0) * 2;
    for (var i = 0; i < left; i++) fx.rect(g, 50 + (K.hash(i, 1) - 0.5) * 4, 48 + i * 1.6, 76 + (K.hash(i, 1) - 0.5) * 4, 49.4 + i * 1.6, i % 2 ? 0xf2efe4 : 0xfdfcf6);
    for (var j = 0; j < right; j++) {
      fx.rect(g, 84 + (K.hash(j, 2) - 0.5) * 5, 48 + j * 1.2, 108 + (K.hash(j, 2) - 0.5) * 5, 49.2 + j * 1.2, j % 2 ? 0xf2efe4 : 0xfdfcf6);
      if (j % 2 === 0) fx.rect(g, 94, 48.4 + j * 1.2, 98, 49 + j * 1.2, RED);
    }
    // The paper he's on, with its check marks.
    if (left > 0 || s.flying) {
      fx.rect(g, 24, 48, 46, 50, 0xfdfcf6);
      if (s.mark) fx.line(g, 30, 50, 33, 49, RED, 2), fx.line(g, 33, 49, 40, 53, RED, 2);
    }
    // A sheet flying from his hand to the done pile.
    if (s.fly && t - s.fly < 6) { var u = (t - s.fly) / 6; fx.rect(g, 30 + 60 * u, 52 + Math.sin(u * Math.PI) * 18, 50 + 60 * u, 54 + Math.sin(u * Math.PI) * 18, 0xfdfcf6); }
    // The coffee: long gone cold (a skin on it, no steam).
    fx.rect(g, 114, 48, 124, 62, 0xe8e4dc); fx.rect(g, 124, 52, 127, 59, 0xe8e4dc); fx.rect(g, 115, 59, 123, 61, 0x3a2414);
    fx.wtext(4, 'COLD', 119, 54, 0x6a7a9a, 0.7);
    // The lamp: a base, a gooseneck arm, a shade, a cone of light.
    fx.rect(g, 128, 48, 142, 52, 0x2a2a30);
    K.stroke(g, [[fx.X(135), GY - 52], [fx.X(132), GY - 90], [fx.X(110), GY - 110], [fx.X(82), GY - 108]], 0x8a8a96, 3, 1);
    fx.poly(g, [[66, 98], [84, 114], [96, 104], [90, 96]], 0x2f7a40);
    fx.line(g, 70, 99, 90, 97, LAMP, 2);
    fx.poly(g, [[74, 99], [88, 99], [110, 49], [36, 49]], LAMP, 0.12 + 0.02 * Math.sin(t * 0.3));
  }
  // The comic panel across the room where they take the hits.
  function drawPanelBack(fx, g, t, s) {
    var cx = fx.X((PANEL.s1 + PANEL.s2) / 2), cy = GY - 66, flash = s.markT && t - s.markT < 3;
    fx.rect(g, PANEL.s1, PANEL.h1, PANEL.s2, PANEL.h2, flash ? 0xffffff : 0x7a1018);
    for (var k = 0; k < 20; k++) {
      var a = k / 20 * Math.PI * 2 + t * 0.01, r1 = 30, r2 = 140;
      g.lineStyle(3, flash ? 0xffd0d0 : 0xb0242c, 0.7); g.lineBetween(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    }
  }
  function drawPanelFront(fx, g, t, s) {
    var x1 = Math.min(fx.X(PANEL.s1), fx.X(PANEL.s2)), x2 = Math.max(fx.X(PANEL.s1), fx.X(PANEL.s2)), y1 = GY - PANEL.h2, y2 = GY - PANEL.h1;
    // Mask the room around the panel's window, then its frame.
    var broken = s.smash && t >= s.smash;
    g.lineStyle(7, 0x0a0a0a, 1); g.strokeRect(x1, y1, x2 - x1, y2 - y1);
    g.lineStyle(2, 0xffffff, 1); g.strokeRect(x1 + 4, y1 + 4, x2 - x1 - 8, y2 - y1 - 8);
    if (!broken) {
      g.fillStyle(0xffe14a, 1); g.fillRect(x1 + 4, y1 + 4, 76, 14); g.lineStyle(1, 0x0a0a0a, 1); g.strokeRect(x1 + 4, y1 + 4, 76, 14);
    }
    // Red check marks slashed across them, one per paper.
    if (s.markT && t - s.markT < 10) {
      var u = Math.min(1, (t - s.markT) / 3), a = 1 - Math.max(0, (t - s.markT - 4) / 6), o = fx.P(OPP, 66), sz = 46 + (s.done % 3) * 6;
      var p1 = [o.x - sz * 0.6, o.y - 4], p2 = [o.x - sz * 0.15, o.y + sz * 0.45], p3 = [o.x + sz * 0.75, o.y - sz * 0.7];
      g.lineStyle(9, RED, a); g.lineBetween(p1[0], p1[1], p2[0], p2[1]);
      if (u > 0.4) { var v = (u - 0.4) / 0.6; g.lineBetween(p2[0], p2[1], p2[0] + (p3[0] - p2[0]) * v, p2[1] + (p3[1] - p2[1]) * v); }
    }
  }

  // Sounds: the pen ticking off answers, a page turning, crickets, a sigh, a click.
  function check(fx, n) { var p = Math.min(2, 1 + n * 0.06); fx.sfx(function (S) { S.noise({ dur: 0.03, freq: 5200 * p, q: 3, gain: 0.18 }); S.noise({ dur: 0.05, freq: 6800 * p, q: 3, gain: 0.14, at: 0.035 }); S.osc({ dur: 0.05, f0: 700 * p, f1: 1400 * p, gain: 0.04, type: 'triangle', at: 0.03 }); }); }
  function page(fx) { fx.sfx(function (S) { S.noise({ dur: 0.12, freq: 1800, f1: 4200, q: 0.8, gain: 0.08 }); }); }

  FG.ULTIMATES.lee = {
    start: function (fx) {
      var s = fx.s;
      s.sw = fx.S(fx.x0); s.done = 0;
      fx.place(fx.l, s.sw + 42, 0); fx.pose(fx.l, 'hit_mid');
      fx.anim(fx.w, [[1, 'idle'], [10, 'stand'], [20, 'stand']]);
      fx.cam(s.sw + 10, 100, 1.3, { k: 0.15 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, last = hits.length - 1;
      if (t === ROOM) {
        fx.cutaway = true; s.room = true;
        fx.place(w, 0, 0); fx.face(w, fx.dir); fx.pose(w, 'grade1');
        fx.place(l, OPP, 0); fx.face(l, -fx.dir); fx.pose(l, 'hit_mid');
        fx.cam(110, 92, 1.12, { cut: true });
        fx.sfx(function (S) { S.osc({ dur: 4.4, f0: 60, gain: 0.03, attack: 0.5 }); }); // the lamp's hum
      }
      if (s.room && t % 46 === 10) fx.sfx(function (S) { for (var c = 0; c < 3; c++) S.osc({ dur: 0.04, f0: 4400, gain: 0.025, at: c * 0.07 }); }); // crickets
      if (t > ROOM && t < SIGH) fx.cam(100 - (t - ROOM) * 0.15, 92, 1.12 + (t - ROOM) * 0.0016, { k: 0.1 });
      // Every check mark lands on them.
      for (var k = 0; k < last; k++) {
        var gap = k ? hits[k] - hits[k - 1] : 24, lead = Math.max(1, Math.min(6, Math.round(gap / 2)));
        if (t === hits[k] - lead) fx.anim(w, [[1, 'grade1'], [lead, 'grade2'], [lead + 2, 'grade2']]);
        if (t === hits[k]) {
          s.done = k + 1; s.markT = t; s.mark = true; s.fly = t + 2;
          fx.hit(l, k % 3 === 2 ? 'body' : 'jab', { strength: 'light', hits: k + 1, shake: 0.003, y: 50 + (k % 3) * 12 });
          fx.pose(l, k % 2 ? 'hit_high' : 'hit_mid');
          check(fx, k);
          if (k % 2 === 0) page(fx);
        }
        if (t === hits[k] + 2) s.mark = false;
      }
      // Done. A sigh, the glasses, the pen.
      if (t === SIGH) {
        fx.anim(w, [[1, 'grade1'], [10, 'sit_sigh'], [18, 'sit_sigh']]);
        fx.cam(10, 84, 1.7, { k: 0.06 });
        fx.sfx(function (S) { S.noise({ dur: 1.1, freq: 700, f1: 380, q: 0.7, gain: 0.12, attack: 0.25 }); });
        s.sighT = t;
      }
      if (t === GLASSES) { fx.anim(w, [[1, 'sit_sigh'], [8, 'sit_glasses'], [14, 'sit_glasses']]); fx.sfx(function (S) { S.noise({ dur: 0.02, freq: 6000, q: 8, gain: 0.12, at: 0.12 }); }); s.glint = t + 8; }
      if (t === COCK) { fx.anim(w, [[1, 'sit_glasses'], [6, 'sit_flick_c'], [THROW - COCK, 'sit_flick_c'], [THROW - COCK + 2, 'sit_flick'], [THROW - COCK + 40, 'sit_flick']]); }
      if (t === THROW) {
        s.pen = t;
        fx.cam(150, 88, 1.25, { k: 0.3 });
        fx.sfx(function (S) { S.osc({ dur: 0.06, f0: 3000, gain: 0.05, type: 'triangle' }); S.noise({ dur: 0.18, freq: 900, f1: 3400, q: 1.5, gain: 0.14 }); });
      }
      if (t === hits[last]) {
        s.smash = t; s.markT = t;
        fx.hit(l, 'power', { ch: true, hits: hits.length, shake: 0.03, y: 70 });
        fx.pose(l, 'juggle');
        fx.flash(0xffffff, 0.8); fx.slow(30, 0.3);
        fx.cam(OPP - 10, 80, 1.6, { k: 0.4 });
        fx.sfx(function (S) { S.noise({ dur: 0.06, freq: 4000, q: 1, gain: 0.4 }); S.osc({ dur: 0.5, f0: 140, f1: 34, gain: 0.85 }); S.noise({ dur: 0.35, freq: 2600, q: 0.6, gain: 0.25, at: 0.04 }); });
      }
      if (t > hits[last] && t < BACK) {
        var u = Math.min(1, (t - hits[last]) / 24);
        fx.place(l, OPP + 30 * u, Math.sin(u * Math.PI) * 30 + 10 * u);
        l._drawRot = -fx.dir * u * 0.6;
      }
      // Back on the stage, still in the air.
      if (t === BACK) {
        fx.cutaway = false; s.room = false; s.pen = 0;
        l._drawRot = 0;
        fx.place(w, s.sw, 0); fx.pose(w, 'glasses2');
        fx.cam(s.sw + 50, 110, 1.05, { cut: true });
        fx.flash(0x000000, 0.7);
      }
      if (t >= BACK) {
        var v = (t - BACK) / (w.def.ultimate.len - BACK);
        fx.place(l, s.sw + 60 + 40 * v, 40 + Math.sin(v * Math.PI) * 30); fx.pose(l, 'juggle');
      }
    },
    draw: function (fx, t) {
      var s = fx.s, w = fx.w;
      // Fade to black, then up on the room.
      if (t >= FADE && t < ROOM + 12) {
        var a = t < ROOM ? (t - FADE) / (ROOM - FADE) : 1 - (t - ROOM) / 12;
        fx.gs.fillStyle(0x000000, Math.max(0, Math.min(1, a))); fx.gs.fillRect(0, 0, W, H);
      }
      if (!s.room) return;
      drawRoom(fx, fx.gb, t, s);
      drawPanelBack(fx, fx.gb, t, s);
      drawDesk(fx, fx.gf, t, s);
      drawPanelFront(fx, fx.gf, t, s);
      if (!(s.smash && t >= s.smash)) { fx.text(5, 'MEANWHILE...', fx.sx(Math.min(fx.X(PANEL.s1), fx.X(PANEL.s2)) + 42), fx.sy(GY - PANEL.h2 + 11), 0x0a0a0a, 1.2 * fx.scene.cameras.main.zoom); }
      // The tally, and DONE when the pile is gone.
      if (s.done) fx.text(0, s.done < 14 ? s.done + ' GRADED' : 'DONE.', W / 2 - 150, 300, s.done < 14 ? 0xff6a6a : 0xffffff, 2.4, -3);
      if (s.sighT && t - s.sighT > 6 && t - s.sighT < 50) fx.text(1, 'HHHHH...', W / 2 - 40, 120, 0x9fb4ff, 2, 0, 1 - (t - s.sighT - 6) / 44);
      // The glint off his glasses.
      if (s.glint && t >= s.glint && t - s.glint < 8) {
        var e = fx.at2(w, 84 * w.def.scale), u = (t - s.glint) / 8;
        fx.gs.fillStyle(0xffffff, 1 - u); fx.gs.fillRect(e[0] + fx.dir * 6 - 1, e[1] - 10 * (1 - u), 2, 20 * (1 - u)); fx.gs.fillRect(e[0] + fx.dir * 6 - 10 * (1 - u), e[1] - 1, 20 * (1 - u), 2);
      }
      // The red pen, spinning across the room.
      if (s.pen && t <= w.def.ultimate.hits[w.def.ultimate.hits.length - 1]) {
        var hits = w.def.ultimate.hits, v = (t - s.pen) / (hits[hits.length - 1] - s.pen);
        var from = fx.P(24, 70), to = fx.P(OPP - 6, 70), px = from.x + (to.x - from.x) * v, py = from.y + (to.y - from.y) * v - Math.sin(v * Math.PI) * 14, ang = t * 0.9;
        var g = fx.gf, ca = Math.cos(ang) * 9, sa = Math.sin(ang) * 9;
        g.lineStyle(4, RED, 1); g.lineBetween(px - ca, py - sa, px + ca, py + sa);
        g.lineStyle(2, 0xffffff, 1); g.lineBetween(px + ca * 0.6, py + sa * 0.6, px + ca, py + sa);
        for (var tr = 1; tr < 5; tr++) { g.fillStyle(RED, 0.5 - tr * 0.1); g.fillCircle(px - (to.x - from.x) * 0.04 * tr, py, 3); }
      }
      // One last check mark, the size of the screen.
      if (s.smash && t >= s.smash && t - s.smash < 40) {
        var sc = K.stamp(t, s.smash), al = 1 - Math.max(0, (t - s.smash - 28) / 12), cx = W / 2 + 70, cy = 150, gs = fx.gs;
        gs.lineStyle(26 * sc, 0x5a0a0e, al * 0.5); gs.lineBetween(cx - 60 * sc + 5, cy + 5, cx - 14 * sc + 5, cy + 50 * sc + 5); gs.lineBetween(cx - 14 * sc + 5, cy + 50 * sc + 5, cx + 80 * sc + 5, cy - 80 * sc + 5);
        gs.lineStyle(22 * sc, RED, al); gs.lineBetween(cx - 60 * sc, cy, cx - 14 * sc, cy + 50 * sc); gs.lineBetween(cx - 14 * sc, cy + 50 * sc, cx + 80 * sc, cy - 80 * sc);
        gs.fillStyle(RED, al); gs.fillCircle(cx - 14 * sc, cy + 50 * sc, 11 * sc);
      }
    }
  };
})();
