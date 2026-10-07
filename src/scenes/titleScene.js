// Title screen: the game's name over the dimmed stage. Enter, Space or a
// click starts training mode.
(function () {
  var C = FG.C;

  var TitleScene = function () { Phaser.Scene.call(this, { key: 'title' }); };
  TitleScene.prototype = Object.create(Phaser.Scene.prototype);
  TitleScene.prototype.constructor = TitleScene;

  TitleScene.prototype.create = function () {
    FG.makeFonts(this);
    this.stage = new FG.Stage(this);
    this.cameras.main.scrollX = (C.WORLD_W - C.VIEW_W) / 2;

    var g = this.add.graphics().setScrollFactor(0).setDepth(10);
    g.fillStyle(0x000000, 0.62); g.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    // Title plate.
    g.fillStyle(0x07060c, 0.85); g.fillRect(40, 70, C.VIEW_W - 80, 132);
    g.lineStyle(2, 0xffd23f, 1); g.strokeRect(40, 70, C.VIEW_W - 80, 132);
    g.lineStyle(1, 0x9e2b25, 1); g.strokeRect(44, 74, C.VIEW_W - 88, 124);

    var cx = C.VIEW_W / 2;
    FG.text(this, cx, 88, FG.TITLE_MAIN, 'w', 5).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 138, FG.TITLE_SUB, 'r', 5).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 186, 'EL CAMINO REAL MATH DEPARTMENT', 'y').setOrigin(0.5, 0).setDepth(11);
    this.prompt = FG.text(this, cx, 248, 'PRESS ENTER', 'w', 2).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 276, 'TRAINING MODE', 'c').setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, C.VIEW_H - 16, 'ENTER, SPACE OR CLICK TO START', 'g').setOrigin(0.5, 0).setDepth(11);

    var self = this;
    this.t = 0;
    this.started = false;
    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE]);
    kb.on('keydown', function (e) {
      FG.Sfx.unlock();
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') self.start();
    });
    this.input.on('pointerdown', function () { FG.Sfx.unlock(); self.start(); });
    window.FG_TITLE = this;
  };

  TitleScene.prototype.start = function () {
    if (this.started) return;
    this.started = true;
    this.scene.start('fight');
  };

  TitleScene.prototype.update = function () {
    this.t++;
    this.stage.update();
    this.prompt.setVisible(this.t % 60 < 40);
  };

  FG.TitleScene = TitleScene;
})();
