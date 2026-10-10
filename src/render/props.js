// Stage objects (FG.STAGE_PROPS): drawn on the floor near the walls, behind the
// fighters. Each reacts when used (p.t frames ago): the whiteboard spins, lockers
// bang, the car bounces and its alarm goes off. A dial shows the cooldown; a T key
// shows when someone is close enough to use one.
(function () {
  var C = FG.C, GY = C.GROUND_Y;

  function rect(g, x, y, w, h, col, a) { g.fillStyle(col, a == null ? 1 : a); g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function line(g, x1, y1, x2, y2, col, w, a) { g.lineStyle(w || 1, col, a == null ? 1 : a); g.lineBetween(x1, y1, x2, y2); }
  function wheel(g, x, y) { g.fillStyle(0x1a1a1e, 1); g.fillCircle(x, y, 3); g.fillStyle(0x6a6a72, 1); g.fillCircle(x, y, 1); }
  // A decaying wobble: amplitude a, over `len` frames since use.
  function wob(p, a, len, rate) { return p.t < len ? Math.sin(p.t * (rate || 0.9)) * a * (1 - p.t / len) : 0; }

  var DRAW = {
    // A rolling whiteboard: it spins on its stand when used.
    whiteboard: function (g, p) {
      var x = p.x, base = GY - 2, spin = p.t < 46 ? Math.cos(p.t * 0.42) : 1, bh = 34 * Math.abs(spin), by = base - 58;
      line(g, x - 22, base - 6, x - 22, base - 40, 0x7a7f8a, 2); line(g, x + 22, base - 6, x + 22, base - 40, 0x7a7f8a, 2);
      line(g, x - 28, base - 4, x - 16, base - 4, 0x5a5f6a, 2); line(g, x + 16, base - 4, x + 28, base - 4, 0x5a5f6a, 2);
      wheel(g, x - 27, base - 1); wheel(g, x - 17, base - 1); wheel(g, x + 17, base - 1); wheel(g, x + 27, base - 1);
      rect(g, x - 30, by - bh / 2 - 2, 60, bh + 4, 0x9aa0aa);
      rect(g, x - 28, by - bh / 2, 56, bh, spin > 0 ? 0xf4f6f8 : 0xe2e6ea);
      if (spin > 0.4) { // the math on it
        line(g, x - 22, by - 8 * spin, x - 4, by - 8 * spin, 0x3a5fc0, 1); line(g, x - 22, by, x + 2, by, 0xc03a3a, 1); line(g, x - 22, by + 8 * spin, x - 8, by + 8 * spin, 0x2a8a4a, 1);
        g.lineStyle(1, 0xc03a3a, 1); g.beginPath(); g.moveTo(x + 6, by + 10 * spin); g.lineTo(x + 14, by - 10 * spin); g.lineTo(x + 22, by + 10 * spin); g.strokePath();
      }
      rect(g, x - 18, by + bh / 2 + 2, 36, 2, 0x7a7f8a);
    },
    // A lunch table with its benches: the trays jump when it's used.
    lunchTable: function (g, p) {
      var x = p.x, base = GY - 2, hop = -Math.abs(wob(p, 6, 26, 0.6));
      rect(g, x - 34, base - 14, 68, 4, 0x2a6a8a); line(g, x - 28, base, x - 28, base - 12, 0x4a4f5a, 2); line(g, x + 28, base, x + 28, base - 12, 0x4a4f5a, 2); // the bench
      rect(g, x - 30, base - 30, 60, 5, 0x3a8aaa); rect(g, x - 30, base - 26, 60, 1, 0x1e4a5a);
      line(g, x - 22, base, x - 18, base - 26, 0x4a4f5a, 3); line(g, x + 22, base, x + 18, base - 26, 0x4a4f5a, 3);
      rect(g, x - 20, base - 34 + hop, 18, 3, 0xd8d8d0); rect(g, x - 17, base - 37 + hop, 6, 3, 0xe0a050); rect(g, x - 9, base - 36 + hop, 4, 2, 0x5a9a3a); // a tray: pizza and a salad
      rect(g, x + 6, base - 38 + hop * 1.4, 5, 8, 0xf4f4f0); rect(g, x + 6, base - 38 + hop * 1.4, 5, 2, 0xc0302a); // a milk carton
    },
    // A student desk with its chair: it hops.
    desk: function (g, p) {
      var x = p.x, hop = -Math.abs(wob(p, 7, 26, 0.5)), base = GY - 2 + hop;
      line(g, x - 16, base, x - 16, base - 26, 0x5a5f6a, 2); line(g, x + 16, base, x + 16, base - 26, 0x5a5f6a, 2);
      rect(g, x - 22, base - 30, 44, 5, 0xc89a5a); rect(g, x - 22, base - 26, 44, 1, 0x8a6a3a);
      rect(g, x + 22, base - 20, 12, 3, 0x2a3a6a); line(g, x + 33, base - 20, x + 33, base - 44, 0x2a3a6a, 3); line(g, x + 30, base, x + 30, base - 18, 0x5a5f6a, 2);
      rect(g, x - 12, base - 33, 14, 3, 0xf4f1e6); rect(g, x + 4, base - 33, 6, 2, 0x5a5a6a); // a test and a calculator
    },
    // A bank of two lockers: a door bangs open and shut.
    lockers: function (g, p) {
      var x = p.x - 26, base = GY - 2, open = p.t < 30 ? Math.sin(Math.min(1, p.t / 14) * Math.PI) : 0;
      for (var k = 0; k < 2; k++) {
        var lx = x + k * 26;
        rect(g, lx, base - 78, 25, 78, 0x2f6a8a); rect(g, lx, base - 78, 25, 2, 0x4a8aaa);
        for (var v = 0; v < 4; v++) rect(g, lx + 6, base - 70 + v * 3, 13, 1, 0x1a3a4a);
        rect(g, lx + 19, base - 44, 2, 8, 0xc8c8d0);
      }
      if (open > 0) { // the door swings out toward the fight
        var w = 25 * (1 - open * 0.8);
        rect(g, x + 26, base - 78, 25, 78, 0x111418);
        rect(g, x + 26, base - 78, w, 78, 0x3a7a9a);
        rect(g, x + 30, base - 40, 14, 10, 0xf4f1e6, 0.8); // books inside
      }
    },
    // A humming vending machine: it shakes and drops a can.
    vending: function (g, p) {
      var x = p.x + wob(p, 3, 30, 2.2), base = GY - 2;
      rect(g, x - 22, base - 84, 44, 84, 0xb8202a); rect(g, x - 22, base - 84, 44, 3, 0xe04a4a);
      rect(g, x - 18, base - 78, 28, 54, 0x18222e);
      var cols = [0xffd23f, 0x5fd7ff, 0x7dff6a, 0xff8a1f];
      for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) rect(g, x - 16 + c * 7, base - 74 + r * 10, 4, 6, cols[(r + c) % 4], 0.9);
      rect(g, x + 13, base - 74, 6, 18, 0x2a2a30); rect(g, x + 14, base - 60, 4, 3, 0x7dff6a);
      rect(g, x - 16, base - 18, 26, 9, 0x0c0c0e);
      g.fillStyle(0xfff4c8, 0.12 + 0.04 * Math.sin(p.t * 0.2)); g.fillRect(x - 18, base - 78, 28, 54);
    },
    // A CRT on a cart: the screen bursts into static.
    crt: function (g, p) {
      var x = p.x, base = GY - 2, w = wob(p, 2, 30, 1.6);
      line(g, x - 18, base, x - 18, base - 36, 0x5a5f6a, 2); line(g, x + 18, base, x + 18, base - 36, 0x5a5f6a, 2);
      rect(g, x - 22, base - 38, 44, 4, 0x6a6f7a); rect(g, x - 22, base - 16, 44, 3, 0x6a6f7a);
      wheel(g, x - 18, base); wheel(g, x + 18, base);
      rect(g, x - 17 + w, base - 68, 34, 30, 0xd8ccb0); rect(g, x - 13 + w, base - 64, 26, 20, 0x0c1a10);
      if (p.t < 36 && p.t % 4 < 2) { for (var s = 0; s < 6; s++) rect(g, x - 13 + w, base - 64 + s * 3 + (p.t % 3), 26, 1, 0xd0d8d0, 0.8); }
      else { g.lineStyle(1, 0x39ff5a, 1); g.beginPath(); for (var i = 0; i <= 12; i++) { var px = x - 12 + w + i * 2, py = base - 54 - Math.sin(i * 0.7 + p.t * 0.05) * 6; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.strokePath(); }
    },
    // A swivel chair: it spins and rolls.
    chair: function (g, p) {
      var x = p.x + wob(p, 8, 40, 0.3), base = GY - 2, turn = p.t < 40 ? Math.cos(p.t * 0.5) : 1;
      line(g, x - 14, base - 2, x + 14, base - 2, 0x2a2a30, 3); wheel(g, x - 14, base); wheel(g, x + 14, base); wheel(g, x, base);
      line(g, x, base - 2, x, base - 20, 0x6a6a72, 3);
      rect(g, x - 14, base - 24, 28, 5, 0x2a2a34);
      rect(g, x + 8 * turn - 3, base - 50, 6 + 14 * Math.abs(turn), 26, 0x2a2a34);
    },
    // A park bench: the slats spring.
    bench: function (g, p) {
      var x = p.x, base = GY - 2, b = -Math.abs(wob(p, 6, 26, 0.7));
      line(g, x - 26, base, x - 26, base - 18, 0x3a3a40, 3); line(g, x + 26, base, x + 26, base - 18, 0x3a3a40, 3);
      for (var k = 0; k < 2; k++) rect(g, x - 32, base - 20 - k * 4 + b, 64, 3, 0x8a5a2a);
      line(g, x - 26, base - 18 + b, x - 28, base - 40 + b, 0x3a3a40, 3); line(g, x + 26, base - 18 + b, x + 28, base - 40 + b, 0x3a3a40, 3);
      for (k = 0; k < 2; k++) rect(g, x - 32, base - 32 - k * 6 + b, 64, 3, 0x8a5a2a);
    },
    // A metal trash can: it wobbles and its lid flies.
    trashcan: function (g, p) {
      var x = p.x, base = GY - 2, tilt = wob(p, 6, 36, 0.8);
      g.fillStyle(0x7a7f88, 1); g.fillPoints([{ x: x - 12, y: base }, { x: x + 12, y: base }, { x: x + 14 + tilt, y: base - 36 }, { x: x - 14 + tilt, y: base - 36 }], true);
      for (var k = 1; k < 4; k++) line(g, x - 12 + tilt * k / 4, base - k * 9, x + 12 + tilt * k / 4, base - k * 9, 0x5a5f68, 1);
      if (p.t > 40 || p.use == null) { rect(g, x - 16 + tilt, base - 40, 32, 4, 0x8a8f98); rect(g, x - 3 + tilt, base - 43, 6, 3, 0x5a5f68); }
    },
    // A filing cabinet: a drawer shoots out.
    cabinet: function (g, p) {
      var x = p.x, base = GY - 2, out = p.t < 34 ? Math.sin(Math.min(1, p.t / 10) * Math.PI / 2) * (1 - Math.max(0, p.t - 20) / 14) : 0;
      rect(g, x - 16, base - 66, 32, 66, 0x8a8f78);
      for (var k = 0; k < 3; k++) { rect(g, x - 14, base - 62 + k * 21, 28, 18, 0x9aa088); rect(g, x - 5, base - 55 + k * 21, 10, 2, 0x3a3a30); }
      if (out > 0) { var dir = x < C.WORLD_W / 2 ? 1 : -1; rect(g, x + (dir > 0 ? 14 : -14 - 22 * out), base - 62, 22 * out, 18, 0x9aa088); rect(g, x + dir * (14 + 18 * out) - 1, base - 66, 3, 6, 0xf4f1e6); }
    },
    // A teacher's desk: papers everywhere when used.
    officeDesk: function (g, p) {
      var x = p.x, base = GY - 2, j = wob(p, 2, 20, 2);
      rect(g, x - 30, base - 32 + j, 60, 6, 0x6a4a2a); rect(g, x - 28, base - 26 + j, 14, 26, 0x5a3a1e); rect(g, x + 14, base - 26 + j, 14, 26, 0x5a3a1e);
      for (var k = 0; k < 4; k++) rect(g, x - 20 + k, base - 36 - k * 2 + j, 16, 2, 0xf4f1e6);
      line(g, x + 18, base - 32 + j, x + 18, base - 46 + j, 0x2a2a30, 2); rect(g, x + 13, base - 50 + j, 12, 5, 0x2a6a3a);
    },
    // A parking gate: the arm swings up.
    barrier: function (g, p) {
      var x = p.x, base = GY - 2, dir = x < C.WORLD_W / 2 ? 1 : -1, up = p.t < 50 ? Math.sin(Math.min(1, p.t / 12) * Math.PI / 2) * (1 - Math.max(0, p.t - 30) / 20) : 0;
      rect(g, x - 7, base - 38, 14, 38, 0xe0c020); for (var k = 0; k < 4; k++) rect(g, x - 7, base - 34 + k * 9, 14, 4, 0x1a1a1e);
      var a = -up * 1.3, len = 70, ex = x + dir * Math.cos(a) * len, ey = base - 30 + Math.sin(a) * len;
      line(g, x, base - 30, ex, ey, 0xf4f1e6, 4);
      for (var s = 0; s < 4; s++) { var u0 = (s * 2 + 1) / 8, u1 = (s * 2 + 2) / 8; line(g, x + (ex - x) * u0, base - 30 + (ey - base + 30) * u0, x + (ex - x) * u1, base - 30 + (ey - base + 30) * u1, 0xd8202a, 4); }
    },
    // PEDERSEN's car, nose into the lot: it bounces, flashes its lights, the alarm goes.
    hood: function (g, p, opts) {
      if (opts.carDrawn) return; // he drove it in: the scene draws it
      var dir = p.x > C.WORLD_W / 2 ? -1 : 1, b = -Math.abs(wob(p, 4, 30, 0.9)), lights = p.t < 120 && p.t % 16 < 8 ? 1 : 0;
      FG.drawCar(g, dir < 0 ? C.WORLD_W : 0, GY - 26 + b, { scale: 0.82, facing: dir, lights: lights });
    }
  };

  // opts: { carDrawn, near (someone can use it now) }
  FG.drawStageProp = function (g, p, opts) {
    opts = opts || {};
    (DRAW[p.kind] || DRAW.desk)(g, p, opts);
    var y = GY - (p.kind === 'hood' ? 70 : p.kind === 'vending' ? 100 : p.kind === 'lockers' ? 92 : 80);
    if (p.cool > 0) {
      // The cooldown: a dial that fills back up.
      var u = 1 - p.cool / C.PROP_COOLDOWN;
      g.fillStyle(0x000000, 0.5); g.fillCircle(p.x, y, 7);
      g.fillStyle(0x8d93a6, 0.9); g.slice(p.x, y, 6, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2, false); g.fillPath();
    } else if (opts.near) {
      // Ready, and someone is next to it: the T key.
      var bob = Math.sin(opts.tick * 0.15) * 2;
      g.fillStyle(0x07060c, 0.85); g.fillRect(p.x - 8, y - 9 + bob, 16, 16);
      g.lineStyle(1, 0xffd23f, 1); g.strokeRect(p.x - 8, y - 9 + bob, 16, 16);
      g.fillStyle(0xffd23f, 1); g.fillRect(p.x - 5, y - 6 + bob, 10, 2); g.fillRect(p.x - 1, y - 6 + bob, 2, 10);
    }
  };
})();
