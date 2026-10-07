// Title screen: the game's name, with the cover fighter PEDERSEN front and
// center next to his red sports car, over his campus stage at dusk.
// Enter, Space or a click goes to character select (then training mode).
(function () {
  var C = FG.C;

  var TitleScene = function () { Phaser.Scene.call(this, { key: 'title' }); };
  TitleScene.prototype = Object.create(Phaser.Scene.prototype);
  TitleScene.prototype.constructor = TitleScene;

  // PEDERSEN on the title screen: stands easy, now and then fixes his tie.
  var TITLE_POSE = [[1, 'stand'], [80, 'stand'], [92, 'tie'], [110, 'tie2'], [122, 'tie'], [136, 'calm'], [170, 'stand']];

  TitleScene.prototype.create = function () {
    FG.makeFonts(this);
    this.stage = new FG.Stage(this, { variant: 'campus' });
    this.cameras.main.scrollX = (C.WORLD_W - C.VIEW_W) / 2;

    var shade = this.add.graphics().setScrollFactor(0).setDepth(5);
    shade.fillStyle(0x000000, 0.35); shade.fillRect(0, 0, C.VIEW_W, C.VIEW_H);

    // The cover: PEDERSEN and his car.
    this.cover = this.add.graphics().setScrollFactor(0).setDepth(6);
    var ped = FG.fighterById('pedersen') || FG.ROSTER[0];
    this.ped = FG.puppet(ped, 236, 1);
    this.ped._override = { anim: TITLE_POSE, t: 0, loop: true };

    // Title plate.
    var g = this.add.graphics().setScrollFactor(0).setDepth(10);
    g.fillStyle(0x07060c, 0.85); g.fillRect(40, 10, C.VIEW_W - 80, 96);
    g.lineStyle(2, 0xffd23f, 1); g.strokeRect(40, 10, C.VIEW_W - 80, 96);
    g.lineStyle(1, 0x9e2b25, 1); g.strokeRect(44, 14, C.VIEW_W - 88, 88);
    var cx = C.VIEW_W / 2;
    FG.text(this, cx, 20, FG.TITLE_MAIN, 'w', 5).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 66, FG.TITLE_SUB, 'r', 3).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 94, 'EL CAMINO REAL MATH DEPARTMENT', 'y').setOrigin(0.5, 0).setDepth(11);

    this.prompt = FG.text(this, cx, 318, 'PRESS ENTER', 'w', 2).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, C.VIEW_H - 14, 'ENTER, SPACE OR CLICK TO START', 'g').setOrigin(0.5, 0).setDepth(11);

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
    this.scene.start('select');
  };

  TitleScene.prototype.update = function () {
    this.t++;
    this.stage.update();
    this.prompt.setVisible(this.t % 60 < 40);
    var g = this.cover;
    g.clear();
    // Car parked just behind and beside him, nose toward him.
    FG.drawCar(g, 430, 296, { scale: 1.55, facing: -1 });
    this.ped._override.t++;
    FG.updatePose(this.ped, this.t);
    g.fillStyle(0x000000, 0.4); g.fillEllipse(236, 300, 110, 12);
    FG.drawFighter(g, this.ped, { scale: 1.75, groundY: 300, noShadow: true });
  };

  FG.TitleScene = TitleScene;
})();
