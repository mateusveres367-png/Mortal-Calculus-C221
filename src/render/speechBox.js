// Pixel-art speech boxes: the speaker's name on a tab, their line word-wrapped
// inside with a typewriter reveal, and a tail pointing at them.
//   mode 'top':  a wide box near the top of the screen (pre-round lines, win screen)
//   mode 'head': a smaller bubble over the fighter's head (taunts, quips)
(function () {
  var C = FG.C;
  var PAD = 7, LINE = 11;

  function wrap(text, n) {
    var words = text.toUpperCase().split(' '), lines = [], cur = '';
    for (var i = 0; i < words.length; i++) {
      var next = cur ? cur + ' ' + words[i] : words[i];
      if (next.length > n && cur) { lines.push(cur); cur = words[i]; } else cur = next;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  FG.wrapText = wrap;

  // opts: { mode: 'top' | 'head' }
  function SpeechBox(scene, opts) {
    opts = opts || {};
    this.mode = opts.mode || 'top';
    this.w = this.mode === 'top' ? 250 : 176;
    this.chars = this.mode === 'top' ? 32 : 22;
    var depth = this.mode === 'top' ? 56 : 30;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(depth);
    this.name = FG.text(scene, 0, 0, '', 'k').setDepth(depth + 1);
    this.lines = [0, 1, 2, 3].map(function () { return FG.text(scene, 0, 0, '', 'k').setDepth(depth + 1); });
    this.visible = false;
    this.t = 0;
    this.ttl = 0;
    this.hide();
  }

  // frames: how long to stay up (0 = until hidden).
  SpeechBox.prototype.show = function (name, text, frames) {
    this.visible = true;
    this.t = 0;
    this.ttl = frames || 0;
    this.nameText = name;
    this.wrapped = wrap('"' + text + '"', this.chars).slice(0, this.lines.length);
  };

  SpeechBox.prototype.hide = function () {
    this.visible = false;
    this.g.clear();
    this.name.setText('');
    this.lines.forEach(function (l) { l.setText(''); });
  };

  // How long a line needs on screen to be read.
  SpeechBox.readTime = function (text) { return 50 + Math.round(text.length * 1.6); };

  // Advance one display tick (typewriter, expiry).
  SpeechBox.prototype.tick = function () {
    if (!this.visible) return;
    this.t++;
    if (this.ttl && this.t >= this.ttl) this.hide();
  };

  // Draw next to the speaker. camX: camera scroll, to place the box on screen.
  SpeechBox.prototype.draw = function (fighter, camX, drawX) {
    if (!this.visible) return;
    var g = this.g, W = this.w;
    g.clear();
    var n = this.wrapped.length, h = PAD * 2 + n * LINE;
    var fx = (drawX != null ? drawX : fighter.x) - camX;
    var headY = C.GROUND_Y - fighter.y - 100 * fighter.def.scale;
    var bx, by, tipX, tipY;
    if (this.mode === 'top') {
      bx = Math.round(Math.max(10, Math.min(C.VIEW_W - W - 10, fx - W / 2 + (fx < C.VIEW_W / 2 ? 60 : -60))));
      by = 64;
    } else {
      bx = Math.round(Math.max(6, Math.min(C.VIEW_W - W - 6, fx - W / 2)));
      by = Math.round(Math.max(64, headY - h - 16));
    }
    var tx = Math.max(bx + 16, Math.min(bx + W - 16, fx));
    tipX = tx + (fx - tx) * 0.5;
    tipY = this.mode === 'top' ? by + h + 14 : Math.min(headY - 4, by + h + 12);
    var shown = Math.floor(this.t * 1.4);
    g.fillStyle(0x000000, 0.5); g.fillRect(bx + 3, by + 3, W, h);
    g.fillStyle(0x1a1a22, 1); g.fillRect(bx - 2, by - 2, W + 4, h + 4);
    g.fillStyle(0xf4f1e6, 1); g.fillRect(bx, by, W, h);
    g.fillStyle(0xd8d2c0, 1); g.fillRect(bx, by + h - 3, W, 3);
    g.fillStyle(0x1a1a22, 1); g.fillTriangle(tx - 8, by + h, tx + 8, by + h, tipX, tipY + 2);
    g.fillStyle(0xf4f1e6, 1); g.fillTriangle(tx - 5, by + h - 1, tx + 5, by + h - 1, tipX, tipY - 1);
    var nw = this.nameText.length * 7 + 10;
    g.fillStyle(0x1a1a22, 1); g.fillRect(bx + 6, by - 13, nw + 4, 13);
    g.fillStyle(0xffd23f, 1); g.fillRect(bx + 8, by - 11, nw, 11);
    this.name.setText(this.nameText).setPosition(bx + 13, by - 10);
    var count = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.wrapped[i] || '';
      var take = Math.max(0, Math.min(line.length, shown - count));
      count += line.length;
      this.lines[i].setText(line.slice(0, take)).setPosition(bx + PAD, by + PAD + i * LINE);
    }
  };

  FG.SpeechBox = SpeechBox;
})();
