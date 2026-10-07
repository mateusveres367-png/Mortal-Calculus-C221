// Stages, drawn with Graphics at startup in parallax layers. Two so far:
//   classroom: a dim math classroom (the default)
//   campus:    the outdoor campus at dusk (PEDERSEN's stage), with a parking lot
// The stage is the home stage of player 2 (the opponent). Both have a crowd of
// students that cheers on big hits.
(function () {
  var C = FG.C;

  // opts.home: the home fighter; opts.variant forces a stage.
  function Stage(scene, opts) {
    opts = opts || {};
    this.variant = opts.variant || (opts.home && opts.home.homeStage) || 'classroom';
    this.horizon = C.GROUND_Y - 46;
    this.t = 0;
    this.cheerT = 0;
    this.cheerAmp = 0;
    this.cheerFav = false;
    this.lights = null;
    this.crowd = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-21);
    this.students = [];
    if (this.variant === 'campus') this.buildCampus(scene); else this.buildClassroom(scene);
  }

  // --- Classroom ------------------------------------------------------------------

  Stage.prototype.buildClassroom = function (scene) {
    var W = C.WORLD_W, H = C.VIEW_H, horizon = this.horizon;

    // Far wall (slow parallax) with whiteboards.
    var far = scene.add.graphics().setScrollFactor(0.35, 1).setDepth(-30);
    far.fillGradientStyle(0x1b1830, 0x1b1830, 0x2a2440, 0x2a2440, 1);
    far.fillRect(-40, 0, W, horizon);
    for (var b = 0; b < 3; b++) {
      var bx = 40 + b * 230, by = 60;
      far.fillStyle(0x6b6f7a, 1); far.fillRect(bx - 4, by - 4, 188, 98);
      far.fillStyle(0xc9cfd6, 1); far.fillRect(bx, by, 180, 90);
      far.fillStyle(0xaeb5bf, 1); far.fillRect(bx, by + 84, 180, 6);
      var rnd = mulberry(7 + b);
      var colors = [0x2a4b8d, 0x9e2b25, 0x2a6b3a];
      for (var line = 0; line < 6; line++) {
        var lx = bx + 8, ly = by + 10 + line * 12;
        var segs = 3 + Math.floor(rnd() * 6);
        far.fillStyle(colors[line % 3], 1);
        for (var sgi = 0; sgi < segs; sgi++) {
          var w = 4 + Math.floor(rnd() * 14);
          far.fillRect(lx, ly + Math.floor(rnd() * 3), w, 2);
          lx += w + 4;
          if (lx > bx + 170) break;
        }
      }
      // A drawn parabola on the middle board.
      if (b === 1) {
        far.fillStyle(0x9e2b25, 1);
        for (var px = -40; px <= 40; px += 2) far.fillRect(bx + 120 + px * 0.6, by + 78 - (1600 - px * px) / 32, 2, 2);
      }
    }

    // Ceiling lights (redrawn for flicker).
    this.lights = scene.add.graphics().setScrollFactor(0.6, 1).setDepth(-25);
    this.lightXs = [];
    for (var lxp = 20; lxp < W; lxp += 150) this.lightXs.push(lxp);

    // Rows of desks, with students behind them.
    var mid = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-20);
    var rnd2 = mulberry(42);
    for (var dx = -20; dx < W; dx += 64) {
      if (rnd2() < 0.8) this.students.push({ x: dx + 24, y: horizon - 30, phase: rnd2() * 6.28, size: 1, shirt: [0x15131f, 0x1d1a2b, 0x221c2e][Math.floor(rnd2() * 3)] });
      mid.fillStyle(0x4a3a2c, 1); mid.fillRect(dx, horizon - 12, 48, 6);
      mid.fillStyle(0x2f251c, 1); mid.fillRect(dx + 4, horizon - 6, 4, 8); mid.fillRect(dx + 40, horizon - 6, 4, 8);
    }

    // Floor tiles in perspective.
    var floor = scene.add.graphics().setDepth(-10);
    floor.fillGradientStyle(0x3b3442, 0x3b3442, 0x231f29, 0x231f29, 1);
    floor.fillRect(0, horizon, W, H - horizon);
    floor.lineStyle(1, 0x4a4252, 1);
    for (var row = 0; row < 6; row++) {
      var yy = horizon + Math.round(Math.pow(row / 5, 1.6) * (H - horizon));
      floor.lineBetween(0, yy, W, yy);
    }
    var vpX = W / 2;
    for (var col = -30; col <= 30; col++) floor.lineBetween(vpX + col * 26, horizon, vpX + col * 70, H);
    this.walls(floor, 0x121018, 0x5a4b2c);
  };

  // --- Outdoor campus (PEDERSEN) ------------------------------------------------------

  Stage.prototype.buildCampus = function (scene) {
    var W = C.WORLD_W, H = C.VIEW_H, horizon = this.horizon;

    // Dusk sky.
    var sky = scene.add.graphics().setScrollFactor(0.1, 1).setDepth(-32);
    sky.fillGradientStyle(0x2b2350, 0x2b2350, 0xe0884a, 0xe0884a, 1);
    sky.fillRect(-40, 0, W, horizon);
    sky.fillStyle(0xffd38a, 1); sky.fillCircle(520, horizon - 30, 22); // low sun
    sky.fillStyle(0xf2b070, 0.6); sky.fillRect(-40, horizon - 40, W, 4);

    // School buildings with lit windows.
    var bld = scene.add.graphics().setScrollFactor(0.35, 1).setDepth(-30);
    var rnd = mulberry(91);
    var blocks = [[-20, 120, 150], [150, 170, 110], [340, 110, 170], [470, 230, 120], [720, 150, 140]];
    blocks.forEach(function (bk) {
      var bx = bk[0], bw = bk[1], bh = bk[2], top = horizon - bh;
      bld.fillStyle(0x3a2f45, 1); bld.fillRect(bx, top, bw, bh);
      bld.fillStyle(0x2a2233, 1); bld.fillRect(bx, top, bw, 6);
      for (var wy = top + 16; wy < horizon - 16; wy += 22) {
        for (var wx = bx + 10; wx < bx + bw - 14; wx += 20) {
          bld.fillStyle(rnd() < 0.45 ? 0xffd88a : 0x1e1828, 1);
          bld.fillRect(wx, wy, 10, 12);
        }
      }
    });
    // A clock tower on the middle building.
    bld.fillStyle(0x3a2f45, 1); bld.fillRect(375, horizon - 220, 40, 60);
    bld.fillStyle(0xf2e6c8, 1); bld.fillCircle(395, horizon - 196, 10);
    bld.fillStyle(0x222222, 1); bld.fillRect(394, horizon - 203, 2, 8); bld.fillRect(395, horizon - 197, 6, 2);

    // Trees.
    var trees = scene.add.graphics().setScrollFactor(0.55, 1).setDepth(-26);
    for (var tx = 10; tx < W; tx += 140) {
      var th = 50 + (tx % 3) * 12;
      trees.fillStyle(0x2a1e18, 1); trees.fillRect(tx + 18, horizon - th + 20, 6, th - 20);
      trees.fillStyle(0x1f3b2a, 1); trees.fillCircle(tx + 21, horizon - th + 10, 24);
      trees.fillStyle(0x2a4d36, 1); trees.fillCircle(tx + 14, horizon - th + 4, 14);
    }

    // Benches and students in the distance.
    var mid = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-20);
    var rnd2 = mulberry(17);
    for (var bxp = 30; bxp < W; bxp += 110) {
      mid.fillStyle(0x5a4030, 1); mid.fillRect(bxp, horizon - 10, 40, 4); mid.fillRect(bxp, horizon - 18, 40, 3);
      mid.fillStyle(0x2a2a2a, 1); mid.fillRect(bxp + 3, horizon - 6, 3, 6); mid.fillRect(bxp + 34, horizon - 6, 3, 6);
      if (rnd2() < 0.85) this.students.push({ x: bxp + 20, y: horizon - 26, phase: rnd2() * 6.28, size: 0.8, shirt: [0x2a2440, 0x3a2a30, 0x24303a][Math.floor(rnd2() * 3)] });
    }

    // Pavement with a row of parking spaces at the back.
    var floor = scene.add.graphics().setDepth(-10);
    floor.fillGradientStyle(0x5a5660, 0x5a5660, 0x34313a, 0x34313a, 1);
    floor.fillRect(0, horizon, W, H - horizon);
    floor.lineStyle(2, 0xd8d2b8, 0.55);
    for (var sx = 10; sx < W; sx += 90) floor.lineBetween(sx, horizon + 2, sx - 8, horizon + 26);
    floor.lineStyle(1, 0x4a4652, 1);
    for (var row = 2; row < 6; row++) {
      var yy = horizon + Math.round(Math.pow(row / 5, 1.6) * (H - horizon));
      floor.lineBetween(0, yy, W, yy);
    }
    // Patches in the asphalt.
    floor.fillStyle(0x45414c, 1);
    for (var k = 0; k < 14; k++) floor.fillRect(Math.round(rnd2() * W), horizon + 30 + Math.round(rnd2() * 50), 10 + Math.round(rnd2() * 20), 2);
    // Edges: brick walls.
    this.walls(floor, 0x5a2e24, 0x2e1a16, true);
  };

  // Stage-edge walls (where wall splats happen).
  Stage.prototype.walls = function (g, fill, edge, bricks) {
    var W = C.WORLD_W, H = C.VIEW_H;
    g.fillStyle(fill, 1);
    g.fillRect(0, 0, C.WALL_L, H);
    g.fillRect(C.WALL_R, 0, W - C.WALL_R, H);
    if (bricks) {
      g.lineStyle(1, edge, 1);
      for (var y = 0; y < H; y += 8) {
        g.lineBetween(0, y, C.WALL_L, y); g.lineBetween(C.WALL_R, y, W, y);
        var off = (y / 8) % 2 ? 0 : 10;
        for (var x = off; x < C.WALL_L; x += 20) g.lineBetween(x, y, x, y + 8);
        for (var x2 = C.WALL_R + off; x2 < W; x2 += 20) g.lineBetween(x2, y, x2, y + 8);
      }
    }
    g.fillStyle(edge, 1);
    g.fillRect(C.WALL_L - 4, 0, 4, H);
    g.fillRect(C.WALL_R, 0, 4, H);
  };

  // --- Crowd ------------------------------------------------------------------------

  // The students react to big moments. favorite: louder, arms up (DALSASS).
  Stage.prototype.cheer = function (amount, favorite) {
    this.cheerT = Math.max(this.cheerT, 40 + amount * 15);
    this.cheerAmp = Math.min(6, Math.max(this.cheerAmp, amount * 1.5));
    this.cheerFav = this.cheerFav || favorite;
    if (amount >= 2) FG.Sfx.cheer(favorite ? 1 : 0.5);
  };

  Stage.prototype.drawCrowd = function () {
    var g = this.crowd;
    g.clear();
    var cheering = this.cheerT > 0;
    for (var i = 0; i < this.students.length; i++) {
      var st = this.students[i], z = st.size;
      var bounce = cheering ? Math.abs(Math.sin(this.t * 0.35 + st.phase)) * this.cheerAmp : Math.sin(this.t * 0.02 + st.phase) * 0.6;
      var y = Math.round(st.y - bounce);
      g.fillStyle(st.shirt, 1);
      g.fillCircle(st.x, y, 7 * z);
      g.fillRect(st.x - 10 * z, y + 6 * z, 20 * z, 18 * z);
      // Arms up when the crowd goes wild.
      if (cheering && (this.cheerFav || i % 3 === 0) && this.cheerAmp > 2) {
        var up = Math.sin(this.t * 0.5 + st.phase) > 0 ? 2 : 0;
        g.fillRect(st.x - 13 * z, y - 8 * z - up, 3 * z, 14 * z);
        g.fillRect(st.x + 10 * z, y - 8 * z - (2 - up), 3 * z, 14 * z);
      }
    }
  };

  Stage.prototype.update = function () {
    this.t++;
    if (this.cheerT > 0 && --this.cheerT === 0) { this.cheerAmp = 0; this.cheerFav = false; }
    this.drawCrowd();
    var g = this.lights;
    if (!g) return;
    g.clear();
    for (var i = 0; i < this.lightXs.length; i++) {
      var x = this.lightXs[i];
      // One tube flickers now and then.
      var on = !(i === 3 && (this.t % 200 < 6 || (this.t % 200 > 10 && this.t % 200 < 13)));
      g.fillStyle(0x3a3a46, 1); g.fillRect(x - 2, 0, 64, 6);
      g.fillStyle(on ? 0xeef4ff : 0x6c7280, 1); g.fillRect(x, 2, 60, 3);
      if (on) { g.fillStyle(0xdfe8ff, 0.05); g.fillTriangle(x - 30, 120, x + 90, 120, x + 30, 5); }
    }
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
