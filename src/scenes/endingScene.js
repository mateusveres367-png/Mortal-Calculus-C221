// Arcade ending: the champion's victory pose on their home stage, a closing line,
// and the run's stats. Enter goes back to the title.
(function () {
  var C = FG.C;

  var EndingScene = function () { Phaser.Scene.call(this, { key: 'ending' }); };
  EndingScene.prototype = Object.create(Phaser.Scene.prototype);
  EndingScene.prototype.constructor = EndingScene;

  EndingScene.prototype.init = function (data) { this.run = data || {}; };

  EndingScene.prototype.create = function () {
    FG.makeFonts(this);
    var run = this.run, def = FG.fighterById(run.p1) || FG.ROSTER[0], self = this;
    this.stage = new FG.Stage(this, { id: def.homeStage, carInWorld: !!def.car });
    this.cameras.main.scrollX = (C.WORLD_W - C.VIEW_W) / 2;
    var shade = this.add.graphics().setScrollFactor(0).setDepth(5);
    shade.fillStyle(0x000000, 0.45); shade.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    this.g = this.add.graphics().setScrollFactor(0).setDepth(6);
    this.champ = FG.puppet(def, C.VIEW_W / 2, 1);
    this.champ._override = { anim: def.victory, t: 0, loop: true };
    this.t = 0;

    var cx = C.VIEW_W / 2;
    var plate = this.add.graphics().setScrollFactor(0).setDepth(10);
    plate.fillStyle(0x07060c, 0.85); plate.fillRect(40, 14, C.VIEW_W - 80, 92);
    plate.lineStyle(2, 0xffd23f, 1); plate.strokeRect(40, 14, C.VIEW_W - 80, 92);
    FG.text(this, cx, 24, 'PROOF COMPLETE', 'y', 4).setOrigin(0.5, 0).setDepth(11);
    FG.text(this, cx, 64, def.name + ' CONQUERED THE MATH DEPARTMENT', 'w').setOrigin(0.5, 0).setDepth(11);
    var secs = run.started ? Math.round((Date.now() - run.started) / 1000) : 0;
    var stats = (run.ladder ? run.ladder.length : 0) + ' WINS   ' + (run.continues || 0) + (run.continues === 1 ? ' CONTINUE   ' : ' CONTINUES   ') +
      Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2) + '   CPU ' + FG.AI_LEVELS[FG.settings.difficulty].name;
    FG.text(this, cx, 80, stats, 'c').setOrigin(0.5, 0).setDepth(11);
    var lines = def.victoryLines, line = FG.wrapText('"' + lines[Math.floor(Math.random() * lines.length)] + '"', 56);
    line.forEach(function (l, k) { FG.text(self, cx, 116 + k * 11, l, 'y').setOrigin(0.5, 0).setDepth(11); });
    this.prompt = FG.text(this, cx, C.VIEW_H - 26, 'THANKS FOR PLAYING   PRESS ENTER', 'w').setOrigin(0.5, 0).setDepth(11);
    // Valedictorian (and any outfits that came with the last win).
    var gained = FG.Progress.recordArcade();
    var earnedTitle = gained.filter(function (g) { return g.kind === 'title'; }).map(function (g) { return g.name; });
    if (earnedTitle.length) FG.text(this, cx, C.VIEW_H - 64, 'NEW TITLE: ' + earnedTitle.join(', '), 'c', 1).setOrigin(0.5, 0).setDepth(11);
    // Beating arcade unlocks WILSON for arcade and VS CPU (he's always in training and versus).
    if (!FG.settings.wilsonUnlocked && FG.fighterById('wilson')) {
      FG.settings.wilsonUnlocked = true; FG.saveSettings();
      this.unlock = FG.text(this, cx, C.VIEW_H - 50, 'NEW CHALLENGER: WILSON IS NOW PLAYABLE', 'y', 1.5).setOrigin(0.5, 0).setDepth(11);
    }

    var kb = this.input.keyboard;
    kb.on('keydown', function (e) {
      if (self.t > 40 && (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape' || e.code === 'KeyJ')) self.scene.start('title', { menu: true });
    });
    this.stage.cheer(3, true);
    this.stage.react('ko');
    FG.Sfx.ui('confirm');
    window.FG_ENDING = this;
  };

  EndingScene.prototype.update = function () {
    this.t++;
    this.stage.update();
    if (this.t % 150 === 0) this.stage.cheer(2, true);
    this.prompt.setVisible(this.t % 60 < 40);
    this.champ._override.t++;
    FG.updatePose(this.champ, this.t);
    var g = this.g;
    g.clear();
    g.fillStyle(0x000000, 0.4); g.fillEllipse(C.VIEW_W / 2, 302, 100, 12);
    FG.drawFighter(g, this.champ, { scale: 1.6, groundY: 300, noShadow: true });
  };

  FG.EndingScene = EndingScene;
})();
