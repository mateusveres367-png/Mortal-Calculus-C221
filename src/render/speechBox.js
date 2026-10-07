// Pixel-art speech box for the win screen: the winner's name on a tab, their
// victory line word-wrapped inside, and a tail pointing at their head.
(function () {
  var C = FG.C;
  var W = 250, PAD = 8, LINE = 11, CHARS = 32;

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

  function SpeechBox(scene) {
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(56);
    this.name = FG.text(scene, 0, 0, '', 'k').setDepth(57);
    this.lines = [0, 1, 2, 3].map(function () { return FG.text(scene, 0, 0, '', 'k').setDepth(57); });
    this.visible = false;
    this.t = 0;
    this.hide();
  }

  SpeechBox.prototype.show = function (name, text) {
    this.visible = true;
    this.t = 0;
    this.nameText = name;
    this.wrapped = wrap('"' + text + '"', CHARS);
  };

  SpeechBox.prototype.hide = function () {
    this.visible = false;
    this.g.clear();
    this.name.setText('');
    this.lines.forEach(function (l) { l.setText(''); });
  };

  // Draw next to the winner. camX: camera scroll, to place the box on screen.
  SpeechBox.prototype.draw = function (fighter, camX) {
    if (!this.visible) return;
    this.t++;
    var g = this.g;
    g.clear();
    var n = this.wrapped.length, h = PAD * 2 + n * LINE;
    var headX = fighter.x - camX, headY = C.GROUND_Y - 100 * fighter.def.scale;
    // Box sits above and to the side of the winner, kept on screen.
    var bx = Math.round(Math.max(10, Math.min(C.VIEW_W - W - 10, headX - W / 2 + (headX < C.VIEW_W / 2 ? 60 : -60))));
    var by = 64; // above the WINS banner
    // Typewriter reveal.
    var shown = Math.floor(this.t * 1.2);
    // Shadow, border, fill.
    g.fillStyle(0x000000, 0.5); g.fillRect(bx + 3, by + 3, W, h);
    g.fillStyle(0x1a1a22, 1); g.fillRect(bx - 2, by - 2, W + 4, h + 4);
    g.fillStyle(0xf4f1e6, 1); g.fillRect(bx, by, W, h);
    g.fillStyle(0xd8d2c0, 1); g.fillRect(bx, by + h - 3, W, 3);
    // Tail toward the winner's head.
    var tx = Math.max(bx + 16, Math.min(bx + W - 16, headX));
    var tipX = tx + (headX - tx) * 0.5, tipY = by + h + 14;
    g.fillStyle(0x1a1a22, 1); g.fillTriangle(tx - 9, by + h, tx + 9, by + h, tipX, tipY + 2);
    g.fillStyle(0xf4f1e6, 1); g.fillTriangle(tx - 6, by + h - 1, tx + 6, by + h - 1, tipX, tipY - 1);
    // Name tab.
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
