// Placeholder stage: a dim math classroom with parallax layers.
// Everything is drawn with Graphics at startup; only the lights animate.
(function () {
  var C = FG.C;

  function Stage(scene) {
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

    // Mid layer: rows of desks and student silhouettes.
    var mid = scene.add.graphics().setScrollFactor(0.7, 1).setDepth(-20);
    var rnd2 = mulberry(42);
    for (var dx = -20; dx < W; dx += 64) {
      var heads = rnd2() < 0.7;
      if (heads) {
        mid.fillStyle(0x15131f, 1);
        mid.fillCircle(dx + 24, horizon - 30, 7);
        mid.fillRect(dx + 14, horizon - 24, 20, 18);
      }
      mid.fillStyle(0x4a3a2c, 1); mid.fillRect(dx, horizon - 12, 48, 6);
      mid.fillStyle(0x2f251c, 1); mid.fillRect(dx + 4, horizon - 6, 4, 8); mid.fillRect(dx + 40, horizon - 6, 4, 8);
    }

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

  Stage.prototype.update = function () {
    this.t++;
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
