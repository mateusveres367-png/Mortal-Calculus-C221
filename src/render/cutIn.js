// Cut-ins: quick, full-screen graphic flashes for big moments, in each fighter's
// colours (def.cutIn: { a: main, b: accent }). Pixel art all the way: slashed,
// angled bands slide in, halftone dots, a huge close-up of the fighter's face and
// eyes, and the move's name in big tilted letters.
//
//   cut.play(def, side, text)     a single fighter (side 0: from the left, 1: from the right)
//   cut.playVs(defA, defB, lines) round start: split screen, VS, both fighters' lines
//
// Everything is drawn by the UI camera (scroll factor 0), above the HUD.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H;
  var SINGLE = 30, VS = 120;

  function CutIn(scene) {
    this.scene = scene;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(57);
    // Faces are drawn into their own graphics, masked to their panel.
    this.faces = [0, 1].map(function () {
      var g = scene.add.graphics().setScrollFactor(0).setDepth(57.2);
      var shape = scene.make.graphics({ add: false }).setScrollFactor(0);
      g.setMask(shape.createGeometryMask());
      return { g: g, shape: shape, puppet: null };
    });
    // Halftone dots are baked once into two textures (dots growing right / left),
    // shown tinted; redrawing thousands of dots every frame is far too slow.
    halftoneTexture(scene, 'cutin_ht_r', 1);
    halftoneTexture(scene, 'cutin_ht_l', -1);
    var self = this;
    this.ht = [0, 1].map(function (k) {
      var im = scene.add.image(0, 0, 'cutin_ht_r').setOrigin(0, 0).setScrollFactor(0).setDepth(57.1).setVisible(false);
      im._mask = self.faces[k].shape.createGeometryMask();
      return im;
    });
    this.top = scene.add.graphics().setScrollFactor(0).setDepth(57.4);
    var T = function (col, sc) { return FG.text(scene, 0, 0, '', col, sc).setDepth(57.6).setOrigin(0.5, 0.5); };
    this.shadow = T('w', 5); this.title = T('w', 5);
    this.names = [T('w', 3), T('w', 3)];
    this.lines = [0, 1, 2, 3].map(function () { return T('w', 1); });
    this.vsText = T('y', 6);
    this.active = null;
    this.hide();
  }

  CutIn.prototype.hide = function () {
    this.g.clear(); this.top.clear();
    this.ht.forEach(function (im) { im.setVisible(false); });
    this.faces.forEach(function (f) { f.g.clear(); });
    [this.shadow, this.title, this.vsText].concat(this.names, this.lines).forEach(function (t) { t.setText('').setVisible(false); });
  };

  CutIn.prototype.play = function (def, side, text) {
    this.active = { kind: 'single', defs: [def], side: side, text: String(text).toUpperCase(), t: 0, len: SINGLE };
    this.faces[0].puppet = face(def, side === 0 ? 1 : -1);
    FG.Sfx.cutIn();
  };

  // lines: [lineA, lineB] (either may be empty).
  CutIn.prototype.playVs = function (defA, defB, lines) {
    this.active = { kind: 'vs', defs: [defA, defB], lines: lines || [], t: 0, len: VS };
    this.faces[0].puppet = face(defA, 1);
    this.faces[1].puppet = face(defB, -1);
    FG.Sfx.cutIn();
  };

  CutIn.prototype.busy = function () { return !!this.active; };
  CutIn.prototype.left = function () { return this.active ? this.active.len - this.active.t : 0; };
  CutIn.prototype.stop = function () { this.active = null; this.hide(); };

  CutIn.prototype.tick = function () {
    if (!this.active) return;
    if (++this.active.t >= this.active.len) this.stop();
  };

  function face(def, facing) {
    var p = FG.puppet(def, 0, facing);
    p._face = { type: 'fierce', t: 1e9 };
    return p;
  }

  function ease(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u) * (1 - u); }

  // A slanted band (parallelogram) from x0 to x1, y0 to y1, leaning by `lean` px.
  function band(g, x0, x1, y0, y1, lean, color, alpha) {
    g.fillStyle(color, alpha == null ? 1 : alpha);
    g.fillPoints([{ x: x0 + lean, y: y0 }, { x: x1 + lean, y: y0 }, { x: x1 - lean, y: y1 }, { x: x0 - lean, y: y1 }], true);
  }

  // Halftone: a screen of white dots that grow toward one side, baked into a texture.
  function halftoneTexture(scene, key, grow) {
    if (scene.textures.exists(key)) return;
    var g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    for (var y = 3, row = 0; y < H; y += 7, row++) {
      for (var x = row % 2 ? 3 : 0; x < W; x += 7) {
        var u = x / W;
        g.fillCircle(x, y, Math.max(0.5, 0.5 + 2.6 * (grow > 0 ? u : 1 - u)));
      }
    }
    g.generateTexture(key, W, H);
    g.destroy();
  }

  // Show halftone image k: tinted, at x offset `dx`, either cropped to rows y0..y1 or
  // masked to its panel.
  CutIn.prototype.halftone = function (k, grow, color, alpha, dx, y0, y1, masked) {
    var im = this.ht[k];
    im.setTexture(grow > 0 ? 'cutin_ht_r' : 'cutin_ht_l').setTint(color).setAlpha(alpha).setPosition(Math.round(dx), 0).setVisible(true);
    if (masked) { im.setCrop(); im.setMask(im._mask); } else { im.clearMask(); im.setCrop(0, y0, W, y1 - y0); }
  };

  // The fighter's face, huge, eyes at (ex, ey).
  function drawFace(fc, ex, ey, scale, t) {
    var p = fc.puppet;
    FG.updatePose(p, t);
    var pose = p._pose, s = p.def.scale * scale;
    // The head joint, then nudge so the eye (a little in front of and above it) lands at ex, ey.
    p.x = ex - (pose[4] + 3.5) * s * p.facing;
    fc.g.clear();
    FG.drawFighter(fc.g, p, { scale: scale, groundY: ey + (pose[5] - 2) * s, noShadow: true });
  }

  CutIn.prototype.draw = function () {
    var a = this.active;
    this.g.clear(); this.top.clear();
    this.faces.forEach(function (f) { f.g.clear(); f.shape.clear(); });
    this.ht.forEach(function (im) { im.setVisible(false); });
    [this.shadow, this.title, this.vsText].concat(this.names, this.lines).forEach(function (t) { t.setVisible(false); });
    if (!a) return;
    if (a.kind === 'single') this.drawSingle(a); else this.drawVs(a);
  };

  CutIn.prototype.drawSingle = function (a) {
    var g = this.g, def = a.defs[0], col = def.cutIn || { a: 0x222222, b: 0xffffff };
    var t = a.t, dir = a.side === 0 ? 1 : -1;
    var inU = ease(t / 6), outU = t > a.len - 6 ? ease((t - (a.len - 6)) / 6) : 0;
    var slide = (1 - inU) * -dir * W + outU * dir * W;
    // Dim the fight behind it.
    g.fillStyle(0x000000, 0.45 * inU * (1 - outU)); g.fillRect(0, 0, W, H);
    var y0 = 96, y1 = 258, lean = 26 * dir;
    // Accent slash, main band, a thin second accent.
    band(g, -60 + slide, W + 60 + slide, y0 - 12, y0 - 2, lean, col.b, 1);
    band(g, -60 + slide, W + 60 + slide, y0, y1, lean, col.a, 1);
    band(g, -60 + slide * 1.3, W + 60 + slide * 1.3, y1 + 2, y1 + 8, lean, col.b, 1);
    this.halftone(0, dir, col.b, 0.22, slide, y0 + 4, y1 - 4, false);
    // Speed streaks across the band.
    g.fillStyle(col.b, 0.5);
    for (var k = 0; k < 6; k++) {
      var sy = y0 + 14 + k * 25, len = 60 + ((k * 53 + t * 37) % 140), sx = ((k * 97 + t * 23 * dir) % (W + 200)) - 100;
      g.fillRect(Math.round(sx + slide), sy, len, 2);
    }
    // The face: a close-up in a panel on the attacker's side.
    var fc = this.faces[0], px0 = a.side === 0 ? 20 : W - 300, px1 = px0 + 280;
    fc.shape.fillStyle(0xffffff, 1);
    fc.shape.fillPoints([{ x: px0 + lean + slide, y: y0 }, { x: px1 + lean + slide, y: y0 }, { x: px1 - lean + slide, y: y1 }, { x: px0 - lean + slide, y: y1 }], true);
    var drift = (t - 15) * 0.4 * dir;
    drawFace(fc, (px0 + px1) / 2 + slide + drift, (y0 + y1) / 2 - 6, 6.5, this.scene.tickCount || t);
    // Frame the face panel.
    this.top.lineStyle(3, col.b, 1);
    this.top.strokePoints([{ x: px0 + lean + slide, y: y0 }, { x: px1 + lean + slide, y: y0 }, { x: px1 - lean + slide, y: y1 }, { x: px0 - lean + slide, y: y1 }], true);
    // The move name, huge and tilted, sliding in a beat later.
    var tu = ease((t - 3) / 6), tx = (a.side === 0 ? W * 0.68 : W * 0.32) + (1 - tu) * -dir * 200 + slide;
    var scale = a.text.length > 14 ? 3 : a.text.length > 9 ? 4 : 5;
    this.shadow.setText(a.text).setScale(scale).setAngle(-8).setPosition(tx + 4, 178 + 4).setTint(col.b === 0xffffff || col.b === 0xf6ecd0 ? 0x000000 : col.b).setVisible(t >= 3);
    this.title.setText(a.text).setScale(scale).setAngle(-8).setPosition(tx, 178).setTint(contrast(col.a)).setVisible(t >= 3);
    this.names[0].setText(def.name).setScale(2).setAngle(-8).setPosition(tx - dir * 40, 128).setTint(col.b).setVisible(t >= 5);
  };

  // Readable text colour on the main colour.
  function contrast(c) {
    var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    return (r * 0.3 + g * 0.59 + b * 0.11) > 150 ? 0x111111 : 0xffffff;
  }

  CutIn.prototype.drawVs = function (a) {
    var g = this.g, t = a.t;
    var inU = ease(t / 10), outU = t > a.len - 10 ? ease((t - (a.len - 10)) / 10) : 0;
    if (inU < 1 || outU > 0) { g.fillStyle(0x000000, 0.7 * (1 - outU)); g.fillRect(0, 0, W, H); } // the halves cover it once in
    for (var side = 0; side < 2; side++) {
      var def = a.defs[side], col = def.cutIn || { a: 0x222222, b: 0xffffff }, dir = side === 0 ? 1 : -1;
      var slide = (1 - inU) * -dir * W + outU * -dir * W;
      // Each fighter gets half the screen, split by a diagonal slash.
      var mid = W / 2, lean = 40;
      var pts = side === 0
        ? [{ x: 0 + slide, y: 0 }, { x: mid + lean + slide, y: 0 }, { x: mid - lean + slide, y: H }, { x: 0 + slide, y: H }]
        : [{ x: mid + lean + slide, y: 0 }, { x: W + slide, y: 0 }, { x: W + slide, y: H }, { x: mid - lean + slide, y: H }];
      g.fillStyle(col.a, 1); g.fillPoints(pts, true);
      var fc = this.faces[side];
      fc.shape.fillStyle(0xffffff, 1); fc.shape.fillPoints(pts, true);
      this.halftone(side, dir, col.b, 0.18, slide, 0, H, true);
      drawFace(fc, (side === 0 ? W * 0.25 : W * 0.75) + slide + Math.sin(t * 0.05) * 3, 150, 7, this.scene.tickCount || t);
      // Name and line on a strip along the bottom of each half.
      var nx = (side === 0 ? W * 0.25 : W * 0.75) + slide;
      this.top.fillStyle(col.b, 1); this.top.fillRect(Math.round(nx - 150), 254, 300, 4);
      this.names[side].setText(def.name).setScale(3).setAngle(-6).setPosition(nx, 236).setTint(contrast(col.a)).setVisible(true);
      var wrapped = a.lines[side] ? FG.wrapText('"' + a.lines[side] + '"', 34) : [];
      for (var k = 0; k < 2; k++) {
        var lt = this.lines[side * 2 + k];
        lt.setText(wrapped[k] || '').setScale(1).setAngle(0).setPosition(nx, 272 + k * 12).setTint(contrast(col.a)).setVisible(t > 20 && !!wrapped[k]);
      }
    }
    // The slash between them, and VS.
    var vsU = ease((t - 8) / 8);
    this.top.lineStyle(6, 0xffffff, 1 - outU);
    this.top.lineBetween(W / 2 + 40, 0, W / 2 - 40, H);
    this.vsText.setText('VS').setScale(6 + (1 - vsU) * 6).setAngle(-6).setPosition(W / 2, 150).setTint(0xffd23f).setVisible(t >= 8 && outU < 1);
  };

  // A fighter's signature colour: their cut-in colour, the brighter one if the main is
  // near black (ladder chips, enhanced-special flashes, ultimate auras).
  FG.fighterGlow = function (d) {
    if (!d.cutIn) return 0xffd23f;
    var lum = function (c) { return ((c >> 16) & 255) * 0.3 + ((c >> 8) & 255) * 0.59 + (c & 255) * 0.11; };
    return lum(d.cutIn.a) < 40 ? d.cutIn.b : d.cutIn.a;
  };

  FG.CutIn = CutIn;
})();
