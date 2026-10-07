// Stages (see src/data/stages.js), drawn with Graphics at startup in parallax
// layers: far layers scroll slowly, near ones faster. Each stage has a few small
// animations (redrawn every tick) and students in the background who cheer, flinch
// at big hits and jump up for a K.O.
//
// new FG.Stage(scene, { id, home, carInWorld })
//   id:         stage id; otherwise home.homeStage; otherwise the classroom
//   carInWorld: PEDERSEN's car is in the fight (the scene draws it), so the parking
//               lot leaves his reserved spot empty
(function () {
  var C = FG.C;
  var W = C.WORLD_W, H = C.VIEW_H;

  function Stage(scene, opts) {
    opts = opts || {};
    var id = opts.id || opts.variant || (opts.home && opts.home.homeStage) || 'classroom';
    this.def = FG.stageById(id);
    this.id = this.def.id;
    this.outdoor = !!this.def.outdoor;
    this.scene = scene;
    this.opts = opts;
    this.horizon = C.GROUND_Y - 46;
    this.t = 0;
    this.cheerT = 0; this.cheerAmp = 0; this.cheerFav = false;
    this.flinchT = 0; this.koT = 0;
    this.crowds = [];   // { g, people }
    this.anims = [];    // { g, fn } redrawn every tick
    BUILD[this.id].call(this, scene);
  }

  // --- Building blocks ----------------------------------------------------------------

  Stage.prototype.layer = function (scene, sf, depth) {
    return scene.add.graphics().setScrollFactor(sf, 1).setDepth(depth);
  };
  // An animated layer: fn(g, t) redraws it every tick.
  Stage.prototype.anim = function (scene, sf, depth, fn) {
    var g = this.layer(scene, sf, depth);
    this.anims.push({ g: g, fn: fn });
    return g;
  };
  Stage.prototype.crowd = function (scene, sf, depth) {
    var c = { g: this.layer(scene, sf, depth), people: [] };
    this.crowds.push(c);
    return c.people;
  };
  // Text painted on the scenery (posters, signs).
  Stage.prototype.label = function (scene, x, y, text, color, sf, depth, scale) {
    return FG.text(scene, x, y, text, color || 'k', scale || 1).setScrollFactor(sf, 1).setDepth(depth + 0.5).setOrigin(0.5, 0);
  };

  var SKINS = [0xc99a6e, 0xa8774f, 0xe0b48a, 0x8a5a3a, 0xd6a77a];
  var HAIRS = [0x1a1410, 0x3a2416, 0x5a3a1e, 0x111111, 0x7a5a30];
  function person(rnd, x, y, type, size, shirts) {
    return { x: x, y: y, type: type, size: size || 1, phase: rnd() * 6.28,
      shirt: shirts[Math.floor(rnd() * shirts.length)], skin: SKINS[Math.floor(rnd() * SKINS.length)],
      hair: HAIRS[Math.floor(rnd() * HAIRS.length)], pack: rnd() < 0.4 };
  }

  // Fluorescent tubes across the ceiling; one flickers now and then.
  function tubes(stage, scene, sf, y, every) {
    stage.anim(scene, sf, -25, function (g, t) {
      for (var x = 20, i = 0; x < W; x += every, i++) {
        var on = !(i === 3 && (t % 200 < 6 || (t % 200 > 10 && t % 200 < 13)));
        g.fillStyle(0x3a3a46, 1); g.fillRect(x - 2, y, 64, 6);
        g.fillStyle(on ? 0xeef4ff : 0x6c7280, 1); g.fillRect(x, y + 2, 60, 3);
        if (on) { g.fillStyle(0xdfe8ff, 0.05); g.fillTriangle(x - 30, y + 120, x + 90, y + 120, x + 30, y + 5); }
      }
    });
  }

  // A wall clock with a ticking second hand.
  function clock(stage, scene, sf, depth, x, y, r) {
    stage.anim(scene, sf, depth, function (g, t) {
      g.fillStyle(0x2a2a30, 1); g.fillCircle(x, y, r + 2);
      g.fillStyle(0xf2efe4, 1); g.fillCircle(x, y, r);
      g.fillStyle(0x222222, 1);
      for (var k = 0; k < 12; k++) { var a = k / 12 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * (r - 2)), Math.round(y + Math.sin(a) * (r - 2)), 1, 1); }
      var s = Math.floor(t / 60) % 60, sa = s / 60 * Math.PI * 2 - Math.PI / 2;
      g.lineStyle(1, 0x222222, 1); g.lineBetween(x, y, x + Math.cos(-2.2) * r * 0.5, y + Math.sin(-2.2) * r * 0.5);
      g.lineBetween(x, y, x + Math.cos(-0.4) * r * 0.75, y + Math.sin(-0.4) * r * 0.75);
      g.lineStyle(1, 0xc0392b, 1); g.lineBetween(x, y, x + Math.cos(sa) * r * 0.85, y + Math.sin(sa) * r * 0.85);
    });
  }

  // Indoor floor: tiles or carpet in perspective.
  Stage.prototype.floor = function (scene, top, bottom, line, opts) {
    opts = opts || {};
    var g = scene.add.graphics().setDepth(-10), horizon = this.horizon;
    g.fillGradientStyle(top, top, bottom, bottom, 1);
    g.fillRect(0, horizon, W, H - horizon);
    g.lineStyle(1, line, 1);
    for (var row = 0; row < 6; row++) {
      var yy = horizon + Math.round(Math.pow(row / 5, 1.6) * (H - horizon));
      g.lineBetween(0, yy, W, yy);
    }
    if (!opts.noColumns) for (var col = -30; col <= 30; col++) g.lineBetween(W / 2 + col * 26, horizon, W / 2 + col * 70, H);
    if (opts.shine) { // polished floor: soft reflections of the lights
      for (var x = 20; x < W; x += 150) { g.fillStyle(0xffffff, 0.05); g.fillRect(x, horizon + 6, 60, 3); g.fillRect(x + 6, horizon + 20, 48, 5); }
    }
    return g;
  };

  // Stage-edge walls (where wall splats happen).
  Stage.prototype.walls = function (g, fill, edge, style) {
    g.fillStyle(fill, 1);
    g.fillRect(0, 0, C.WALL_L, H);
    g.fillRect(C.WALL_R, 0, W - C.WALL_R, H);
    var x, y;
    if (style === 'bricks') {
      g.lineStyle(1, edge, 1);
      for (y = 0; y < H; y += 8) {
        g.lineBetween(0, y, C.WALL_L, y); g.lineBetween(C.WALL_R, y, W, y);
        var off = (y / 8) % 2 ? 0 : 10;
        for (x = off; x < C.WALL_L; x += 20) g.lineBetween(x, y, x, y + 8);
        for (x = C.WALL_R + off; x < W; x += 20) g.lineBetween(x, y, x, y + 8);
      }
    } else if (style === 'lockers') {
      g.lineStyle(1, edge, 1);
      for (x = 4; x < C.WALL_L; x += 12) g.lineBetween(x, 40, x, H);
      for (x = C.WALL_R + 8; x < W; x += 12) g.lineBetween(x, 40, x, H);
    } else if (style === 'fence') {
      g.lineStyle(1, edge, 0.8);
      for (y = -40; y < H; y += 8) { g.lineBetween(0, y, C.WALL_L, y + 40); g.lineBetween(0, y + 40, C.WALL_L, y); g.lineBetween(C.WALL_R, y, W, y + 40); g.lineBetween(C.WALL_R, y + 40, W, y); }
    }
    g.fillStyle(edge, 1);
    g.fillRect(C.WALL_L - 4, 0, 4, H);
    g.fillRect(C.WALL_R, 0, 4, H);
  };

  // --- Stages ------------------------------------------------------------------------

  var BUILD = {};

  // Classroom C221: whiteboards full of math, desks, students in the back rows.
  BUILD.classroom = function (scene) {
    var horizon = this.horizon;
    var far = this.layer(scene, 0.35, -30);
    far.fillGradientStyle(0x1b1830, 0x1b1830, 0x2a2440, 0x2a2440, 1);
    far.fillRect(-40, 0, W, horizon);
    for (var b = 0; b < 3; b++) whiteboard(far, 40 + b * 230, 60, b);
    // Posters between the boards: the unit circle and SOH CAH TOA.
    far.fillStyle(0xe8dcc0, 1); far.fillRect(-6, 70, 40, 52);
    far.lineStyle(1, 0x2a4b8d, 1); far.strokeCircle(14, 92, 13); far.lineBetween(0, 92, 28, 92); far.lineBetween(14, 78, 14, 106);
    far.fillStyle(0x9e2b25, 1); far.fillRect(23, 84, 2, 2);
    far.fillStyle(0xd8e4c8, 1); far.fillRect(690, 66, 44, 60);
    this.label(scene, 712, 72, 'SOH', 'k', 0.35, -30); this.label(scene, 712, 86, 'CAH', 'k', 0.35, -30); this.label(scene, 712, 100, 'TOA', 'k', 0.35, -30);
    // Room number plaque by the door.
    far.fillStyle(0x3a3226, 1); far.fillRect(250, 22, 50, 16);
    this.label(scene, 275, 26, 'C221', 'y', 0.35, -30);
    clock(this, scene, 0.35, -29, 465, 34, 10);
    tubes(this, scene, 0.6, 0, 150);

    // Rows of desks with calculators, students behind them.
    var people = this.crowd(scene, 0.7, -21);
    var mid = this.layer(scene, 0.7, -20);
    var rnd = mulberry(42);
    for (var dx = -20; dx < W; dx += 64) {
      if (rnd() < 0.8) people.push(person(rnd, dx + 24, horizon - 12, 'seated', 1, [0x2f3a52, 0x4a3040, 0x3a4a3a, 0x50463a]));
      mid.fillStyle(0x4a3a2c, 1); mid.fillRect(dx, horizon - 12, 48, 6);
      mid.fillStyle(0x2f251c, 1); mid.fillRect(dx + 4, horizon - 6, 4, 8); mid.fillRect(dx + 40, horizon - 6, 4, 8);
      if (rnd() < 0.5) { mid.fillStyle(0x2a2a30, 1); mid.fillRect(dx + 30, horizon - 15, 8, 3); mid.fillStyle(0x9fd88a, 1); mid.fillRect(dx + 31, horizon - 15, 6, 1); }
      if (rnd() < 0.5) { mid.fillStyle(0xf2efe4, 1); mid.fillRect(dx + 8, horizon - 14, 10, 2); }
    }
    var floor = this.floor(scene, 0x3b3442, 0x231f29, 0x4a4252);
    this.walls(floor, 0x121018, 0x5a4b2c);
  };

  function whiteboard(g, bx, by, b) {
    g.fillStyle(0x6b6f7a, 1); g.fillRect(bx - 4, by - 4, 188, 98);
    g.fillStyle(0xc9cfd6, 1); g.fillRect(bx, by, 180, 90);
    g.fillStyle(0xaeb5bf, 1); g.fillRect(bx, by + 84, 180, 6);
    var rnd = mulberry(7 + b), colors = [0x2a4b8d, 0x9e2b25, 0x2a6b3a];
    for (var line = 0; line < 6; line++) {
      var lx = bx + 8, ly = by + 10 + line * 12, segs = 3 + Math.floor(rnd() * 6);
      g.fillStyle(colors[line % 3], 1);
      for (var s = 0; s < segs; s++) {
        var w = 4 + Math.floor(rnd() * 14);
        g.fillRect(lx, ly + Math.floor(rnd() * 3), w, 2);
        lx += w + 4;
        if (lx > bx + 170) break;
      }
    }
    if (b === 1) { // a parabola on the middle board
      g.fillStyle(0x9e2b25, 1);
      for (var px = -40; px <= 40; px += 2) g.fillRect(bx + 120 + px * 0.6, by + 78 - (1600 - px * px) / 32, 2, 2);
    }
  }

  // Math hallway: lockers, classroom doors, bulletin boards, a vending machine.
  BUILD.hallway = function (scene) {
    var horizon = this.horizon, self = this;
    var far = this.layer(scene, 0.3, -30);
    far.fillGradientStyle(0x2c3140, 0x2c3140, 0x3a3f4e, 0x3a3f4e, 1);
    far.fillRect(-40, 0, W, horizon);
    far.fillStyle(0x24283a, 1); far.fillRect(-40, horizon - 50, W, 50); // wainscot
    var x, k;
    // Lockers in banks, with doors to classrooms in between.
    var doors = [150, 430, 700];
    for (x = -30; x < W; x += 16) {
      var nearDoor = doors.some(function (d) { return x > d - 30 && x < d + 50; });
      if (nearDoor) continue;
      far.fillStyle((Math.floor((x + 30) / 16) % 7 === 3) ? 0x3d6b8a : 0x2f5a78, 1); far.fillRect(x, horizon - 92, 15, 92);
      far.fillStyle(0x23455c, 1); for (k = 0; k < 4; k++) far.fillRect(x + 3, horizon - 86 + k * 3, 9, 1);
      far.fillStyle(0xb8c0c8, 1); far.fillRect(x + 11, horizon - 50, 2, 6);
    }
    doors.forEach(function (d, i) {
      far.fillStyle(0x5a4030, 1); far.fillRect(d - 4, horizon - 104, 52, 104);
      far.fillStyle(0x7a5a3a, 1); far.fillRect(d, horizon - 100, 44, 100);
      far.fillStyle(0x9fc4d8, 1); far.fillRect(d + 14, horizon - 90, 16, 24);
      far.fillStyle(0xd8c79a, 1); far.fillRect(d + 36, horizon - 54, 4, 3);
      self.label(scene, d + 22, horizon - 118, ['C219', 'C221', 'C223'][i], 'w', 0.3, -30);
    });
    // Bulletin boards with flyers.
    [[250, 'MATH CLUB'], [560, 'AP CALC REVIEW'], [860, 'PI DAY 3.14']].forEach(function (bb, i) {
      far.fillStyle(0x6a4a2a, 1); far.fillRect(bb[0] - 4, 34, 108, 64);
      far.fillStyle(0xb58a5a, 1); far.fillRect(bb[0], 38, 100, 56);
      var rnd = mulberry(30 + i);
      for (k = 0; k < 5; k++) { far.fillStyle([0xf2efe4, 0xffd23f, 0x9fd8ff, 0xffb0b0][k % 4], 1); far.fillRect(bb[0] + 4 + k * 19, 52 + Math.floor(rnd() * 14), 15, 20); }
      self.label(scene, bb[0] + 50, 40, bb[1], 'k', 0.3, -30);
    });
    // Exit sign and the vending machine (lit, animated below).
    far.fillStyle(0x3a3a3a, 1); far.fillRect(318, 10, 40, 14);
    this.label(scene, 338, 13, 'EXIT', 'r', 0.3, -30);
    far.fillStyle(0x7a1f2a, 1); far.fillRect(980, horizon - 110, 54, 110);
    far.fillStyle(0x1a1a22, 1); far.fillRect(986, horizon - 100, 34, 70);
    var rndv = mulberry(5);
    for (k = 0; k < 12; k++) { far.fillStyle([0xd23a2a, 0x2a6bd2, 0xf2c23f, 0x3aa64a][k % 4], 1); far.fillRect(989 + (k % 4) * 8, horizon - 96 + Math.floor(k / 4) * 22, 5, 14); }
    this.anim(scene, 0.3, -29, function (g, t) {
      g.fillStyle(0xbfe6ff, 0.1 + 0.05 * Math.sin(t * 0.05)); g.fillRect(986, horizon - 100, 34, 70);
      g.fillStyle(t % 50 < 25 ? 0x6cff6c : 0x1a4a1a, 1); g.fillRect(1024, horizon - 70, 3, 3);
      // Students walking past at the far end of the hall now and then.
      var cycle = t % 900;
      if (cycle < 420) {
        var wx = -40 + cycle * 2.6, step = Math.floor(t / 8) % 2;
        walker(g, wx, horizon - 4, 0x3a5a8a, step);
        walker(g, wx - 24, horizon - 4, 0x8a4a3a, 1 - step);
      }
    });
    tubes(this, scene, 0.5, 0, 160);
    // Students leaning on the lockers, watching.
    var people = this.crowd(scene, 0.6, -21);
    var rnd2 = mulberry(77);
    for (x = 10; x < W; x += 58) if (rnd2() < 0.75) people.push(person(rnd2, x + rnd2() * 20, horizon - 2, 'standing', 0.95, [0x2f3a52, 0x5a3040, 0x3a5a3a, 0x6a5a3a, 0x3a3a5a]));
    var floor = this.floor(scene, 0x5a5a62, 0x2e2e36, 0x6a6a72, { shine: true });
    this.walls(floor, 0x1f3d52, 0x16303f, 'lockers');
  };

  function walker(g, x, y, shirt, step) {
    g.fillStyle(0x22222a, 1); g.fillRect(x - 3 + step * 2, y - 14, 3, 14); g.fillRect(x + 1 - step * 2, y - 14, 3, 14);
    g.fillStyle(shirt, 1); g.fillRect(x - 5, y - 30, 11, 16);
    g.fillStyle(0xc99a6e, 1); g.fillCircle(x, y - 35, 5);
    g.fillStyle(0x2a2a2a, 1); g.fillRect(x - 8, y - 28, 4, 10); // backpack
  }

  // Computer lab: CRT monitors plotting math, cables, students at the machines.
  BUILD.lab = function (scene) {
    var horizon = this.horizon;
    var far = this.layer(scene, 0.35, -30);
    far.fillGradientStyle(0x1e2a2e, 0x1e2a2e, 0x2c3a3e, 0x2c3a3e, 1);
    far.fillRect(-40, 0, W, horizon);
    // Windows with blinds, dusk outside.
    for (var wx = 0; wx < W; wx += 210) {
      far.fillStyle(0x3a2f45, 1); far.fillRect(wx + 20, 28, 120, 76);
      far.fillGradientStyle(0x2b2350, 0x2b2350, 0xc07040, 0xc07040, 1); far.fillRect(wx + 24, 32, 112, 68);
      far.fillStyle(0xb8b0a0, 0.85); for (var bl = 0; bl < 9; bl++) far.fillRect(wx + 24, 32 + bl * 7, 112, 3);
    }
    this.label(scene, 520, 112, 'NO FOOD OR DRINK NEAR THE COMPUTERS', 'g', 0.35, -30);
    tubes(this, scene, 0.6, 0, 170);
    // A long bench of CRTs; the screens are animated.
    var desk = this.layer(scene, 0.55, -24);
    var screens = [];
    for (var x = -10; x < W; x += 56) {
      desk.fillStyle(0xcfc6aa, 1); desk.fillRect(x, horizon - 64, 40, 34);   // monitor
      desk.fillStyle(0xb8ae92, 1); desk.fillRect(x + 4, horizon - 30, 32, 6); // base
      desk.fillStyle(0xcfc6aa, 1); desk.fillRect(x - 2, horizon - 24, 46, 8); // tower / keyboard
      desk.fillStyle(0x3a3a3a, 1); desk.fillRect(x + 36, horizon - 60, 2, 2);
      desk.lineStyle(1, 0x111111, 1); desk.lineBetween(x + 20, horizon - 16, x + 14 + (x % 3) * 4, horizon - 4); // cables
      screens.push(x + 4);
    }
    desk.fillStyle(0x4a4a52, 1); desk.fillRect(-40, horizon - 16, W + 40, 6); // bench top
    desk.fillStyle(0x34343a, 1); desk.fillRect(-40, horizon - 10, W + 40, 10);
    this.anim(scene, 0.55, -23, function (g, t) {
      for (var i = 0; i < screens.length; i++) {
        var sx = screens[i], sy = horizon - 60, kind = i % 4;
        g.fillStyle(0x0a1a12, 1); g.fillRect(sx, sy, 32, 24);
        g.fillStyle(0x6cff8a, 1);
        if (kind === 0) for (var p = 0; p < 32; p += 2) g.fillRect(sx + p, sy + 12 + Math.round(Math.sin((p + t * 0.6) * 0.3) * 7), 2, 1);
        else if (kind === 1) for (var bar = 0; bar < 6; bar++) { var bh = 4 + Math.round(9 + 8 * Math.sin(t * 0.04 + bar)); g.fillRect(sx + 2 + bar * 5, sy + 22 - bh, 3, bh); }
        else if (kind === 2) { for (var a = 0; a < (t % 120) / 3; a++) { var r = a * 0.3; g.fillRect(sx + 16 + Math.round(Math.cos(a * 0.5) * r), sy + 12 + Math.round(Math.sin(a * 0.5) * r * 0.8), 1, 1); } }
        else { var rows = (Math.floor(t / 10) + i) % 6; for (var ln = 0; ln < 6; ln++) g.fillRect(sx + 2, sy + 2 + ln * 4, (ln <= rows ? 8 + ((ln * 7 + i) % 18) : 0), 1); }
        g.fillStyle(0xffffff, 0.04); g.fillRect(sx, sy + (t % 24), 32, 1); // scanline
      }
    });
    // Students at the machines with their backs to us; they spin round to watch big hits.
    var people = this.crowd(scene, 0.62, -21);
    var rnd = mulberry(13);
    for (var px = 6; px < W; px += 56) if (rnd() < 0.7) people.push(person(rnd, px + 12, horizon - 2, 'chair', 0.95, [0x2f3a52, 0x4a3040, 0x3a4a3a, 0x50463a]));
    var floor = this.floor(scene, 0x3a4044, 0x22272a, 0x434a4e, { noColumns: true });
    this.walls(floor, 0x141c20, 0x3a4a4e);
  };

  // Outdoor campus at dusk: buildings, trees, benches, students in the distance.
  BUILD.campus = function (scene) {
    var horizon = this.horizon;
    sky(this, scene, horizon);
    var bld = this.layer(scene, 0.35, -30);
    buildings(bld, horizon, 91);
    // The clock tower, with moving hands.
    bld.fillStyle(0x3a2f45, 1); bld.fillRect(375, horizon - 220, 40, 60);
    clock(this, scene, 0.35, -29, 395, horizon - 196, 10);
    // A flag waving on its pole.
    this.anim(scene, 0.45, -28, function (g, t) {
      g.fillStyle(0x8a8a90, 1); g.fillRect(620, horizon - 150, 2, 150);
      for (var s = 0; s < 14; s++) {
        var wave = Math.sin(t * 0.12 - s * 0.5) * 2;
        g.fillStyle(s % 4 < 2 ? 0x9e2b25 : 0xf2efe4, 1); g.fillRect(622 + s * 2, horizon - 148 + Math.round(wave), 2, 16);
      }
    });
    // Trees sway; leaves drift down.
    this.anim(scene, 0.55, -26, function (g, t) {
      for (var tx = 10; tx < W; tx += 140) {
        var th = 50 + (tx % 3) * 12, sway = Math.round(Math.sin(t * 0.03 + tx) * 2);
        g.fillStyle(0x2a1e18, 1); g.fillRect(tx + 18, horizon - th + 20, 6, th - 20);
        g.fillStyle(0x1f3b2a, 1); g.fillCircle(tx + 21 + sway, horizon - th + 10, 24);
        g.fillStyle(0x2a4d36, 1); g.fillCircle(tx + 14 + sway, horizon - th + 4, 14);
        var lf = (t * 0.5 + tx * 3) % 90;
        g.fillStyle(0xc0803a, 1); g.fillRect(tx + 30 + Math.round(Math.sin(lf * 0.2) * 6), horizon - th + 20 + lf, 2, 2);
      }
    });
    var people = this.crowd(scene, 0.7, -21);
    var mid = this.layer(scene, 0.7, -20), rnd = mulberry(17);
    for (var bx = 30; bx < W; bx += 110) {
      mid.fillStyle(0x5a4030, 1); mid.fillRect(bx, horizon - 10, 40, 4); mid.fillRect(bx, horizon - 18, 40, 3);
      mid.fillStyle(0x2a2a2a, 1); mid.fillRect(bx + 3, horizon - 6, 3, 6); mid.fillRect(bx + 34, horizon - 6, 3, 6);
      if (rnd() < 0.85) people.push(person(rnd, bx + 20, horizon - 10, 'seated', 0.8, [0x2a2440, 0x3a2a30, 0x24303a, 0x3a3a2a]));
    }
    asphalt(this, scene, horizon, rnd, true);
  };

  function sky(stage, scene, horizon) {
    var g = stage.layer(scene, 0.1, -32);
    g.fillGradientStyle(0x2b2350, 0x2b2350, 0xe0884a, 0xe0884a, 1);
    g.fillRect(-40, 0, W, horizon);
    g.fillStyle(0xffd38a, 1); g.fillCircle(520, horizon - 30, 22);
    g.fillStyle(0xf2b070, 0.6); g.fillRect(-40, horizon - 40, W, 4);
    // Clouds drifting, a few birds.
    stage.anim(scene, 0.1, -31, function (c, t) {
      for (var i = 0; i < 5; i++) {
        var cx = ((i * 230 + t * 0.08 * (1 + i % 2)) % (W + 200)) - 100, cy = 30 + i * 17;
        c.fillStyle(0xf0b8a0, 0.35); c.fillRect(Math.round(cx), cy, 70, 6); c.fillRect(Math.round(cx) + 12, cy - 4, 40, 4);
      }
      var bt = t % 700;
      if (bt < 400) for (var b = 0; b < 3; b++) {
        var bx = bt * 1.4 + b * 14, by = 60 + b * 6 + Math.sin(bt * 0.1 + b) * 3, flap = Math.floor((t + b * 3) / 6) % 2;
        c.fillStyle(0x1a1420, 1); c.fillRect(Math.round(bx) - 3, Math.round(by) - flap, 3, 1); c.fillRect(Math.round(bx), Math.round(by), 1, 1); c.fillRect(Math.round(bx) + 1, Math.round(by) - flap, 3, 1);
      }
    });
  }

  function buildings(g, horizon, seed) {
    var rnd = mulberry(seed);
    [[-20, 120, 150], [150, 170, 110], [340, 110, 170], [470, 230, 120], [720, 150, 140]].forEach(function (bk) {
      var bx = bk[0], bw = bk[1], bh = bk[2], top = horizon - bh;
      g.fillStyle(0x3a2f45, 1); g.fillRect(bx, top, bw, bh);
      g.fillStyle(0x2a2233, 1); g.fillRect(bx, top, bw, 6);
      for (var wy = top + 16; wy < horizon - 16; wy += 22) {
        for (var wx = bx + 10; wx < bx + bw - 14; wx += 20) {
          g.fillStyle(rnd() < 0.45 ? 0xffd88a : 0x1e1828, 1);
          g.fillRect(wx, wy, 10, 12);
        }
      }
    });
  }

  function asphalt(stage, scene, horizon, rnd, spaces) {
    var floor = scene.add.graphics().setDepth(-10);
    floor.fillGradientStyle(0x5a5660, 0x5a5660, 0x34313a, 0x34313a, 1);
    floor.fillRect(0, horizon, W, H - horizon);
    if (spaces) { floor.lineStyle(2, 0xd8d2b8, 0.55); for (var sx = 10; sx < W; sx += 90) floor.lineBetween(sx, horizon + 2, sx - 8, horizon + 26); }
    floor.lineStyle(1, 0x4a4652, 1);
    for (var row = 2; row < 6; row++) {
      var yy = horizon + Math.round(Math.pow(row / 5, 1.6) * (H - horizon));
      floor.lineBetween(0, yy, W, yy);
    }
    floor.fillStyle(0x45414c, 1);
    for (var k = 0; k < 14; k++) floor.fillRect(Math.round(rnd() * W), horizon + 30 + Math.round(rnd() * 50), 10 + Math.round(rnd() * 20), 2);
    stage.walls(floor, 0x5a2e24, 0x2e1a16, 'bricks');
    return floor;
  }

  // Department office: desks, filing cabinets, bookshelves, a printer that never stops.
  BUILD.office = function (scene) {
    var horizon = this.horizon, self = this;
    var far = this.layer(scene, 0.35, -30);
    far.fillGradientStyle(0x2e2a24, 0x2e2a24, 0x3e3830, 0x3e3830, 1);
    far.fillRect(-40, 0, W, horizon);
    var rnd = mulberry(55), x, k;
    // Bookshelves full of textbooks.
    [[-20, 150], [420, 120], [820, 160]].forEach(function (sh) {
      far.fillStyle(0x4a3220, 1); far.fillRect(sh[0], 30, sh[1], horizon - 30);
      for (var s = 0; s < 5; s++) {
        var sy = 36 + s * 34;
        far.fillStyle(0x2e1e12, 1); far.fillRect(sh[0] + 4, sy + 28, sh[1] - 8, 3);
        for (var bx = sh[0] + 6; bx < sh[0] + sh[1] - 10;) {
          var bw = 4 + Math.floor(rnd() * 5), bh = 18 + Math.floor(rnd() * 9);
          far.fillStyle([0x8a2a2a, 0x2a4a7a, 0x2a6a3a, 0xc0a040, 0x5a3a6a, 0xd8d0c0][Math.floor(rnd() * 6)], 1);
          far.fillRect(bx, sy + 28 - bh, bw, bh);
          bx += bw + 1;
        }
      }
    });
    // Posters and a schedule whiteboard.
    far.fillStyle(0xe8dcc0, 1); far.fillRect(190, 40, 90, 50);
    this.label(scene, 235, 52, 'E^(I*PI)+1=0', 'k', 0.35, -30);
    this.label(scene, 235, 70, 'BEAUTIFUL.', 'r', 0.35, -30);
    far.fillStyle(0xc9cfd6, 1); far.fillRect(580, 34, 200, 80);
    far.lineStyle(1, 0x6b6f7a, 1);
    for (k = 1; k < 5; k++) far.lineBetween(580 + k * 40, 34, 580 + k * 40, 114);
    for (k = 1; k < 4; k++) far.lineBetween(580, 34 + k * 20, 780, 34 + k * 20);
    this.label(scene, 680, 20, 'OFFICE HOURS', 'y', 0.35, -30);
    for (k = 0; k < 9; k++) { far.fillStyle([0x2a4b8d, 0x9e2b25, 0x2a6b3a][k % 3], 1); far.fillRect(586 + (k % 5) * 40, 42 + Math.floor(k / 3) * 20, 20 + (k * 7) % 10, 2); }
    clock(this, scene, 0.35, -29, 340, 50, 11);
    // A ceiling fan turning.
    this.anim(scene, 0.5, -25, function (g, t) {
      var cx = 520, cy = 8;
      g.fillStyle(0x3a3a3a, 1); g.fillRect(cx - 1, 0, 2, cy);
      for (var b = 0; b < 3; b++) {
        var a = t * 0.15 + b * 2.09, len = Math.cos(a) * 34;
        g.fillStyle(0x5a4a3a, 1); g.fillRect(Math.round(Math.min(cx, cx + len)), cy, Math.max(2, Math.round(Math.abs(len))), 3);
      }
      g.fillStyle(0x2a2a2a, 1); g.fillRect(cx - 4, cy - 1, 8, 5);
    });
    // Desks, monitors, filing cabinets, the printer, coffee.
    var mid = this.layer(scene, 0.6, -20);
    var people = this.crowd(scene, 0.6, -21);
    var desks = [40, 250, 470, 690, 900];
    desks.forEach(function (dx, i) {
      if (i % 2 === 0) people.push(person(rnd, dx + 40, horizon - 14, 'seated', 1, [0x4a3a2a, 0x2f3a52, 0x5a3040, 0x3a4a3a]));
      mid.fillStyle(0x6a5038, 1); mid.fillRect(dx, horizon - 14, 90, 6);
      mid.fillStyle(0x4a3826, 1); mid.fillRect(dx + 4, horizon - 8, 24, 8); mid.fillRect(dx + 72, horizon - 8, 14, 8);
      mid.fillStyle(0x2a2a30, 1); mid.fillRect(dx + 54, horizon - 34, 26, 18); mid.fillRect(dx + 64, horizon - 16, 6, 3);
      mid.fillStyle(0xf2efe4, 1); for (k = 0; k < 4; k++) mid.fillRect(dx + 8 + k, horizon - 18 - k * 2, 18, 2); // papers
    });
    [160, 380, 600, 820].forEach(function (cx) {
      mid.fillStyle(0x6a707a, 1); mid.fillRect(cx, horizon - 52, 28, 52);
      for (k = 0; k < 4; k++) { mid.fillStyle(0x50565e, 1); mid.fillRect(cx + 2, horizon - 50 + k * 13, 24, 11); mid.fillStyle(0xb8c0c8, 1); mid.fillRect(cx + 11, horizon - 46 + k * 13, 6, 2); }
    });
    mid.fillStyle(0xb8b4a8, 1); mid.fillRect(700, horizon - 34, 34, 20); // printer
    this.anim(scene, 0.6, -19, function (g, t) {
      // The printer pushing out paper.
      var pp = (t % 120) / 120;
      g.fillStyle(0xf2efe4, 1); g.fillRect(704, horizon - 34 - Math.round(pp * 12), 26, Math.round(pp * 12) + 2);
      g.fillStyle(t % 30 < 15 ? 0x6cff6c : 0x2a4a2a, 1); g.fillRect(728, horizon - 20, 2, 2);
      // Steam off a coffee mug, and the screensavers.
      g.fillStyle(0xf2efe4, 1); g.fillRect(270, horizon - 22, 6, 7);
      for (var st = 0; st < 3; st++) { g.fillStyle(0xffffff, 0.25); g.fillRect(272 + Math.round(Math.sin(t * 0.08 + st) * 2), horizon - 26 - st * 4 - (t % 12) / 4, 1, 3); }
      desks.forEach(function (dx, i) {
        var bx = dx + 56 + Math.round((Math.sin(t * 0.03 + i) + 1) * 9), by = horizon - 32 + Math.round((Math.cos(t * 0.05 + i) + 1) * 5);
        g.fillStyle(0x0a1020, 1); g.fillRect(dx + 56, horizon - 32, 22, 14);
        g.fillStyle([0x5fd7ff, 0xffd23f, 0xff8a1f][i % 3], 1); g.fillRect(bx, by, 4, 3);
      });
    });
    // Students peeking in through the door.
    var door = this.layer(scene, 0.45, -22);
    door.fillStyle(0x5a4030, 1); door.fillRect(306, horizon - 104, 52, 104);
    door.fillStyle(0x1a1410, 1); door.fillRect(310, horizon - 100, 44, 100);
    var peek = this.crowd(scene, 0.45, -21.5);
    peek.push(person(rnd, 322, horizon - 2, 'standing', 0.9, [0x3a5a8a]));
    peek.push(person(rnd, 342, horizon - 2, 'standing', 0.9, [0x8a4a3a]));
    tubes(this, scene, 0.6, 0, 200);
    var floor = this.floor(scene, 0x4a3e3a, 0x2a2420, 0x52463e, { noColumns: true });
    this.walls(floor, 0x1e1a16, 0x5a4b2c);
    self.horizon = horizon;
  };

  // Faculty parking: PEDERSEN's reserved spot, his red sports car in the back.
  BUILD.parking = function (scene) {
    var horizon = this.horizon, self = this;
    sky(this, scene, horizon);
    var bld = this.layer(scene, 0.3, -30);
    buildings(bld, horizon - 30, 61);
    bld.fillStyle(0x2a2233, 1); bld.fillRect(-40, horizon - 30, W, 30); // a low wall in front of the buildings
    // The road behind the lot, with a car going by now and then.
    this.anim(scene, 0.4, -27, function (g, t) {
      g.fillStyle(0x26232c, 1); g.fillRect(-40, horizon - 30, W + 80, 10);
      var ct = t % 500;
      if (ct < 260) {
        var x = ct * 4.5 - 100;
        g.fillStyle(0x2a3a5a, 1); g.fillRect(Math.round(x), horizon - 34, 26, 8);
        g.fillStyle(0xfff2b0, 1); g.fillRect(Math.round(x) + 25, horizon - 31, 2, 2);
        g.fillStyle(0xfff2b0, 0.15); g.fillTriangle(x + 27, horizon - 30, x + 70, horizon - 36, x + 70, horizon - 24);
      }
    });
    // A row of parked cars (plain, no badges) and the reserved spot.
    var lot = this.layer(scene, 0.6, -24), rnd = mulberry(23);
    var colors = [0x6a7a8a, 0xd8d8d0, 0x3a4a6a, 0x8a7a5a, 0x2a2a2e, 0x5a6a4a];
    for (var cx = -30, i = 0; cx < W; cx += 96, i++) {
      lot.lineStyle(2, 0xd8d2b8, 0.5); lot.lineBetween(cx - 8, horizon - 2, cx - 12, horizon + 10);
      if (i === 5) { this.reservedX = cx + 44; continue; } // PEDERSEN's spot
      if (rnd() < 0.15) continue;
      plainCar(lot, cx + 44, horizon - 2, colors[i % colors.length], rnd() < 0.3);
    }
    var sign = this.layer(scene, 0.6, -23);
    sign.fillStyle(0x8a8a90, 1); sign.fillRect(this.reservedX - 1, horizon - 54, 2, 40);
    sign.fillStyle(0xf2efe4, 1); sign.fillRect(this.reservedX - 32, horizon - 78, 64, 24);
    this.label(scene, this.reservedX, horizon - 76, 'RESERVED', 'r', 0.6, -23);
    this.label(scene, this.reservedX, horizon - 65, 'PEDERSEN', 'k', 0.6, -23);
    // His car is in the spot unless he's fighting (then the scene drives it in).
    if (!this.opts.carInWorld) {
      var car = this.layer(scene, 0.6, -22.5);
      FG.drawCar(car, this.reservedX, horizon + 1, { scale: 0.5, facing: -1 });
    }
    // The faculty parking sign and lamp posts that buzz on.
    sign.fillStyle(0x2a4b8d, 1); sign.fillRect(140, horizon - 96, 92, 26);
    sign.fillStyle(0x8a8a90, 1); sign.fillRect(184, horizon - 70, 3, 70);
    this.label(scene, 186, horizon - 93, 'FACULTY', 'w', 0.6, -23);
    this.label(scene, 186, horizon - 83, 'PARKING', 'w', 0.6, -23);
    this.anim(scene, 0.75, -21, function (g, t) {
      for (var lx = 60, k = 0; lx < W; lx += 260, k++) {
        g.fillStyle(0x4a4a50, 1); g.fillRect(lx, horizon - 150, 4, 150); g.fillRect(lx - 10, horizon - 152, 24, 4);
        var on = !(k === 2 && t % 260 < 30 && Math.floor(t / 3) % 2);
        g.fillStyle(on ? 0xfff2b0 : 0x6a6450, 1); g.fillRect(lx - 8, horizon - 148, 20, 3);
        if (on) { g.fillStyle(0xfff2b0, 0.06); g.fillTriangle(lx - 40, horizon, lx + 44, horizon, lx + 2, horizon - 146); }
      }
    });
    // Students hanging around by the low wall.
    var people = this.crowd(scene, 0.5, -26);
    var rnd2 = mulberry(8);
    for (var px = 30; px < W; px += 80) if (rnd2() < 0.55) people.push(person(rnd2, px, horizon - 30, 'standing', 0.7, [0x2a2440, 0x3a2a30, 0x24303a]));
    asphalt(this, scene, horizon, rnd, true);
    self.horizon = horizon;
  };

  function plainCar(g, x, y, color, tall) {
    var dark = FG.shade ? FG.shade(color, 0.7) : color;
    g.fillStyle(color, 1); g.fillRect(x - 30, y - 16, 60, 10);
    g.fillStyle(dark, 1); g.fillRect(x - 18, y - (tall ? 28 : 24), 34, tall ? 12 : 8);
    g.fillStyle(0x9fb4c8, 0.8); g.fillRect(x - 15, y - (tall ? 26 : 22), 13, tall ? 9 : 6); g.fillRect(x, y - (tall ? 26 : 22), 13, tall ? 9 : 6);
    g.fillStyle(0x151515, 1); g.fillCircle(x - 18, y - 5, 5); g.fillCircle(x + 18, y - 5, 5);
    g.fillStyle(0x6a6a6a, 1); g.fillCircle(x - 18, y - 5, 2); g.fillCircle(x + 18, y - 5, 2);
  }

  // --- Crowd --------------------------------------------------------------------------

  // The students react to the fight. favorite: louder, arms up (DALSASS).
  Stage.prototype.cheer = function (amount, favorite) {
    this.cheerT = Math.max(this.cheerT, 40 + amount * 15);
    this.cheerAmp = Math.min(6, Math.max(this.cheerAmp, amount * 1.5));
    this.cheerFav = this.cheerFav || favorite;
    if (amount >= 2) FG.Sfx.cheer(favorite ? 1 : 0.5);
  };

  // Big hits make them flinch (lean back, hands up); a K.O. brings them to their feet.
  Stage.prototype.react = function (kind) {
    if (kind === 'ko') { this.koT = 120; this.cheer(3, this.cheerFav); FG.Sfx.cheer(1); }
    else this.flinchT = Math.max(this.flinchT, 18);
  };

  function drawPerson(g, st, t, i, mood) {
    var z = st.size, x = Math.round(st.x), y = Math.round(st.y - mood.bounce), s = function (v) { return Math.max(1, Math.round(v * z)); };
    var lean = mood.flinch ? -2 : 0, turned = st.type !== 'chair' || mood.watching;
    if (st.type === 'standing') {
      g.fillStyle(0x23232a, 1); g.fillRect(x - s(5), y - s(16), s(4), s(16)); g.fillRect(x + s(1), y - s(16), s(4), s(16));
      y -= s(16);
    }
    if (st.type === 'chair') { // office chair back
      g.fillStyle(0x1e1e24, 1); g.fillRect(x - s(9), y - s(16), s(18), s(16));
    }
    // Torso and head.
    g.fillStyle(st.shirt, 1); g.fillRect(x - s(8) + lean, y - s(18), s(16), s(18));
    if (st.pack && st.type === 'standing') { g.fillStyle(0x2a2a2a, 1); g.fillRect(x - s(11) + lean, y - s(16), s(4), s(10)); }
    var hx = x + lean, hy = y - s(23);
    g.fillStyle(st.skin, 1); g.fillCircle(hx, hy, s(5));
    g.fillStyle(st.hair, 1);
    if (turned) g.fillRect(hx - s(5), hy - s(6), s(10), s(3)); else g.fillCircle(hx, hy - s(1), s(5)); // back of the head
    if (turned && mood.mouth) { g.fillStyle(0x3a1010, 1); g.fillRect(hx - s(1), hy + s(2), s(2), s(2)); } // "ooh"
    // Arms: up when cheering or flinching.
    if (mood.armsUp) {
      var up = Math.sin(t * 0.5 + st.phase) > 0 ? 2 : 0;
      g.fillStyle(st.shirt, 1);
      g.fillRect(x - s(11) + lean, y - s(26) - up, s(3), s(12));
      g.fillRect(x + s(8) + lean, y - s(26) - (2 - up), s(3), s(12));
      g.fillStyle(st.skin, 1); g.fillRect(x - s(11) + lean, y - s(28) - up, s(3), s(3)); g.fillRect(x + s(8) + lean, y - s(28) - (2 - up), s(3), s(3));
    }
  }

  Stage.prototype.drawCrowds = function () {
    var t = this.t, cheering = this.cheerT > 0, ko = this.koT > 0, flinch = this.flinchT > 0;
    for (var c = 0; c < this.crowds.length; c++) {
      var g = this.crowds[c].g, people = this.crowds[c].people;
      g.clear();
      for (var i = 0; i < people.length; i++) {
        var st = people[i], bounce;
        if (ko) bounce = 4 + Math.abs(Math.sin(t * 0.3 + st.phase)) * 6;
        else if (cheering) bounce = Math.abs(Math.sin(t * 0.35 + st.phase)) * this.cheerAmp;
        else bounce = Math.sin(t * 0.02 + st.phase) * 0.6;
        if (flinch) bounce += 2;
        drawPerson(g, st, t, i, {
          bounce: bounce,
          armsUp: ko || flinch || (cheering && (this.cheerFav || i % 3 === 0) && this.cheerAmp > 2),
          flinch: flinch,
          watching: cheering || flinch || ko,
          mouth: flinch || ko
        });
      }
    }
  };

  Stage.prototype.update = function () {
    this.t++;
    if (this.cheerT > 0 && --this.cheerT === 0) { this.cheerAmp = 0; this.cheerFav = false; }
    if (this.flinchT > 0) this.flinchT--;
    if (this.koT > 0) this.koT--;
    this.drawCrowds();
    for (var i = 0; i < this.anims.length; i++) { var a = this.anims[i]; a.g.clear(); a.fn(a.g, this.t); }
  };

  // Small deterministic RNG so the scenery looks the same every load.
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  FG.Stage = Stage;
})();
