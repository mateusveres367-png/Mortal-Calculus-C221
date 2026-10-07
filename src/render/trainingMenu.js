// Training mode menu: dummy settings, display toggles, reset. Opens with Esc
// (or the on-screen MENU button). Up/down picks a row, left/right changes it,
// Enter or a click activates it. The fight is paused while it's open.
(function () {
  var C = FG.C;
  var X = 150, Y = 62, W = C.VIEW_W - 300, ROW = 13;

  function TrainingMenu(scene, items) {
    this.scene = scene;
    this.items = items;
    this.index = 0;
    this.open = false;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(70);
    this.title = FG.text(scene, C.VIEW_W / 2, Y - 2, 'TRAINING MENU', 'y', 2).setOrigin(0.5, 0).setDepth(71);
    this.labels = [];
    this.values = [];
    var self = this;
    for (var i = 0; i < items.length; i++) {
      var y = Y + 26 + i * ROW;
      this.labels.push(FG.text(scene, X + 16, y, items[i].label, 'w').setDepth(71));
      var v = FG.text(scene, X + W - 16, y, '', 'c').setOrigin(1, 0).setDepth(71);
      this.values.push(v);
      // Clicking a row selects it and changes it.
      (function (idx, label) {
        label.setInteractive({ useHandCursor: true }).on('pointerdown', function () { if (self.open) { self.index = idx; self.activate(1); } });
        v.setInteractive({ useHandCursor: true }).on('pointerdown', function () { if (self.open) { self.index = idx; self.activate(1); } });
      })(i, this.labels[i]);
    }
    this.footer = FG.text(scene, C.VIEW_W / 2, Y + 32 + items.length * ROW, 'UP/DOWN SELECT   LEFT/RIGHT CHANGE   ESC CLOSE', 'g').setOrigin(0.5, 0).setDepth(71);
    this.setOpen(false);
  }

  TrainingMenu.prototype.setOpen = function (on) {
    this.open = on;
    this.title.setVisible(on); this.footer.setVisible(on);
    for (var i = 0; i < this.items.length; i++) { this.labels[i].setVisible(on); this.values[i].setVisible(on); }
    this.draw();
  };

  TrainingMenu.prototype.activate = function (delta) {
    this.items[this.index].change(delta);
    this.draw();
  };

  // Keyboard handling while open. Returns true if the key was used.
  TrainingMenu.prototype.key = function (code) {
    switch (code) {
      case 'ArrowUp': case 'KeyW': this.index = (this.index + this.items.length - 1) % this.items.length; break;
      case 'ArrowDown': case 'KeyS': this.index = (this.index + 1) % this.items.length; break;
      case 'ArrowLeft': case 'KeyA': this.activate(-1); return true;
      case 'ArrowRight': case 'KeyD': case 'Enter': case 'Space': case 'KeyJ': this.activate(1); return true;
      case 'Escape': this.setOpen(false); return true;
      default: return false;
    }
    this.draw();
    return true;
  };

  TrainingMenu.prototype.draw = function () {
    var g = this.g;
    g.clear();
    if (!this.open) return;
    var h = 54 + this.items.length * ROW;
    g.fillStyle(0x07060c, 0.92); g.fillRect(X, Y - 8, W, h);
    g.lineStyle(2, 0xffd23f, 1); g.strokeRect(X, Y - 8, W, h);
    var sy = Y + 26 + this.index * ROW - 2;
    g.fillStyle(0x3c6fb0, 0.6); g.fillRect(X + 6, sy, W - 12, ROW - 1);
    for (var i = 0; i < this.items.length; i++) {
      var v = this.items[i].value();
      this.values[i].setText(v ? '< ' + v + ' >' : '');
      this.labels[i].setFont(i === this.index ? 'pf_y' : 'pf_w');
    }
  };

  FG.TrainingMenu = TrainingMenu;
})();
