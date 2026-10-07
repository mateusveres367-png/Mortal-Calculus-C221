// Placeholder stage: a dim math classroom with parallax layers.
// Everything is drawn with Graphics at startup; only the lights animate.
(function () {
  var C = FG.C;

  // opts.home: the home fighter (decides stage details).
  function Stage(scene, opts) {
    var W = C.WORLD_W, H = C.VIEW_H, GY = C.GROUND_Y;
    var horizon = GY - 46;

    // Far wall (slow parallax).
    var far = scene.add.graphics().setScrollFactor(0.35, 1).setDepth(-30);
    far.fillGradientStyle(0x1b1830, 0x1b1830, 0x2a2440, 0x2a2440, 1);
    far.fillRect(-40, 0, W, horizon);
    // Whiteboards with equation scribbles.
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

    // Mid layer: rows of desks, with student silhouettes behind them (animated).
    this.crowd = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-21);
    var mid = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-20);
    var rnd2 = mulberry(42);
    this.students = [];
    this.horizon = horizon;
    for (var dx = -20; dx < W; dx += 64) {
      if (rnd2() < 0.8) this.students.push({ x: dx + 24, phase: rnd2() * 6.28, shirt: [0x15131f, 0x1d1a2b, 0x221c2e][Math.floor(rnd2() * 3)] });
      mid.fillStyle(0x4a3a2c, 1); mid.fillRect(dx, horizon - 12, 48, 6);
      mid.fillStyle(0x2f251c, 1); mid.fillRect(dx + 4, horizon - 6, 4, 8); mid.fillRect(dx + 40, horizon - 6, 4, 8);
    }
    this.cheerT = 0;
    this.cheerAmp = 0;
    this.cheerFav = false;

    // Floor (moves with the fighters).
    var floor = scene.add.graphics().setDepth(-10);
    floor.fillGradientStyle(0x3b3442, 0x3b3442, 0x231f29, 0x231f29, 1);
    floor.fillRect(0, horizon, W, H - horizon);
    floor.lineStyle(1, 0x4a4252, 1);
    for (var row = 0; row < 6; row++) {
      var yy = horizon + Math.round(Math.pow(row / 5, 1.6) * (H - horizon));
      floor.lineBetween(0, yy, W, yy);
    }
    var vpX = W / 2;
    for (var col = -30; col <= 30; col++) {
      var x0 = vpX + col * 26, x1 = vpX + col * 70;
      floor.lineBetween(x0, horizon, x1, H);
    }
    // Walls at the stage edges.
    floor.fillStyle(0x121018, 1);
    floor.fillRect(0, 0, C.WALL_L, H);
    floor.fillRect(C.WALL_R, 0, W - C.WALL_R, H);
    floor.fillStyle(0x5a4b2c, 1);
    floor.fillRect(C.WALL_L - 4, 0, 4, H);
    floor.fillRect(C.WALL_R, 0, 4, H);

    this.t = 0;
  }

  // The students react to big moments. favorite: louder, arms up (DALSASS).
  Stage.prototype.cheer = function (amount, favorite) {
    this.cheerT = Math.max(this.cheerT, 40 + amount * 15);
    this.cheerAmp = Math.min(6, Math.max(this.cheerAmp, amount * 1.5));
    this.cheerFav = this.cheerFav || favorite;
    if (amount >= 2) FG.Sfx.cheer(favorite ? 1 : 0.5);
  };

  Stage.prototype.drawCrowd = function () {
    var g = this.crowd, hz = this.horizon;
    g.clear();
    var cheering = this.cheerT > 0;
    for (var i = 0; i < this.students.length; i++) {
      var st = this.students[i];
      var bounce = cheering ? Math.abs(Math.sin(this.t * 0.35 + st.phase)) * this.cheerAmp : Math.sin(this.t * 0.02 + st.phase) * 0.6;
      var y = Math.round(hz - 30 - bounce);
      g.fillStyle(st.shirt, 1);
      g.fillCircle(st.x, y, 7);
      g.fillRect(st.x - 10, y + 6, 20, 18);
      // Arms up when the crowd goes wild.
      if (cheering && (this.cheerFav || i % 3 === 0) && this.cheerAmp > 2) {
        var up = Math.sin(this.t * 0.5 + st.phase) > 0 ? 2 : 0;
        g.fillRect(st.x - 13, y - 8 - up, 3, 14);
        g.fillRect(st.x + 10, y - 8 - (2 - up), 3, 14);
      }
    }
  };

  Stage.prototype.update = function () {
    this.t++;
    if (this.cheerT > 0 && --this.cheerT === 0) { this.cheerAmp = 0; this.cheerFav = false; }
    this.drawCrowd();
    var g = this.lights;
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

  // Small deterministic RNG so the scribbles look the same every load.
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
