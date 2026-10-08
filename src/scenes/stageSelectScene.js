// Stage select (versus, VS CPU and training): the highlighted stage plays live behind
// the menu, with the camera panning slowly across it. Left/right (A/D or arrows) pick,
// Enter / J / NUM1 confirm, Esc goes back to character select. RANDOM picks one.
// In VS CPU, up/down (W/S) set the CPU's level.
(function () {
  var C = FG.C;

  var StageSelectScene = function () { Phaser.Scene.call(this, { key: 'stage' }); };
  StageSelectScene.prototype = Object.create(Phaser.Scene.prototype);
  StageSelectScene.prototype.constructor = StageSelectScene;

  StageSelectScene.prototype.init = function (data) { this.data0 = data || {}; };

  StageSelectScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this, d = this.data0;
    var hasCar = FG.fighterById(d.p1).car || FG.fighterById(d.p2).car;
    // Every stage, built once; only the highlighted one is shown and animated.
    this.stages = FG.STAGES.map(function (st) {
      var s = new FG.Stage(self, { id: st.id, carInWorld: !!st.outdoor && hasCar });
      s.setVisible(false);
      return s;
    });
    this.choices = FG.STAGES.map(function (st) { return st.id; }).concat(['random']);
    var start = d.stage || FG.fighterById(d.p2).homeStage;
    this.index = Math.max(0, this.choices.indexOf(start));
    this.t = 0;
    this.leaving = false;

    var ui = this.add.graphics().setScrollFactor(0).setDepth(20);
    ui.fillStyle(0x000000, 0.6); ui.fillRect(0, 0, C.VIEW_W, 30);
    ui.fillStyle(0x07060c, 0.85); ui.fillRect(0, C.VIEW_H - 112, C.VIEW_W, 112);
    ui.lineStyle(2, 0xffd23f, 1); ui.lineBetween(0, C.VIEW_H - 112, C.VIEW_W, C.VIEW_H - 112);
    FG.text(this, C.VIEW_W / 2, 7, 'SELECT STAGE', 'y', 2).setOrigin(0.5, 0).setDepth(21);
    FG.text(this, 8, 10, { versus: 'VERSUS', cpu: 'VS CPU' }[d.mode] || 'TRAINING', 'c').setDepth(21);
    // VS CPU: the CPU's level.
    this.level = d.mode === 'cpu' ? d.level || FG.settings.difficulty : null;
    this.levelText = FG.text(this, C.VIEW_W / 2, 40, '', 'y', 2).setOrigin(0.5, 0).setDepth(21);
    this.levelHelp = FG.text(this, C.VIEW_W / 2, 60, '', 'w').setOrigin(0.5, 0).setDepth(21);
    FG.text(this, C.VIEW_W - 8, 10, FG.fighterById(d.p1).name + ' VS ' + FG.fighterById(d.p2).name, 'w').setOrigin(1, 0).setDepth(21);
    this.name = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 104, '', 'w', 3).setOrigin(0.5, 0).setDepth(21);
    this.place = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 74, '', 'y').setOrigin(0.5, 0).setDepth(21);
    this.desc = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 62, '', 'w').setOrigin(0.5, 0).setDepth(21);
    this.home = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 50, '', 'c').setOrigin(0.5, 0).setDepth(21);
    this.strip = this.add.graphics().setScrollFactor(0).setDepth(21);
    this.tiles = this.choices.map(function (id, k) {
      var label = id === 'random' ? 'RANDOM' : FG.stageById(id).short;
      return FG.text(self, 0, 0, label, 'w').setOrigin(0.5, 0).setDepth(22);
    });
    FG.text(this, C.VIEW_W / 2, C.VIEW_H - 12, d.mode === 'cpu' ? 'LEFT/RIGHT STAGE   UP/DOWN CPU LEVEL   ENTER FIGHT   ESC BACK' : 'LEFT/RIGHT CHOOSE   ENTER FIGHT   ESC BACK', 'g').setOrigin(0.5, 0).setDepth(21);

    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ESC]);
    kb.on('keydown', function (e) { FG.Sfx.unlock(); self.key(e.code); });
    window.FG_STAGE = this;
    this.show();
  };

  StageSelectScene.prototype.key = function (code) {
    if (this.leaving) return;
    var n = this.choices.length;
    switch (code) {
      case 'ArrowLeft': case 'KeyA': this.index = (this.index + n - 1) % n; FG.Sfx.ui('move'); this.show(); break;
      case 'ArrowRight': case 'KeyD': this.index = (this.index + 1) % n; FG.Sfx.ui('move'); this.show(); break;
      case 'ArrowUp': case 'KeyW': case 'ArrowDown': case 'KeyS':
        if (this.level) {
          var L = FG.AI_ORDER, up = code === 'ArrowUp' || code === 'KeyW';
          this.level = L[(L.indexOf(this.level) + (up ? 1 : -1) + L.length) % L.length];
          FG.settings.difficulty = this.level; FG.saveSettings();
          FG.Sfx.ui('move'); this.show();
        }
        break;
      case 'Enter': case 'Space': case 'KeyJ': case 'Numpad1': case 'Comma': case 'NumpadEnter': this.confirm(); break;
      case 'Escape': case 'KeyK': case 'Backspace': case 'Numpad2': case 'Period':
        this.leaving = true; FG.Sfx.ui('move');
        this.scene.start('select', { mode: this.data0.mode, p1: this.data0.p1, p2: this.data0.p2, stage: this.current(), level: this.level });
        break;
    }
  };

  StageSelectScene.prototype.current = function () { return this.choices[this.index]; };

  StageSelectScene.prototype.show = function () {
    var id = this.current(), random = id === 'random';
    var shown = random ? Math.floor(this.t / 40) % FG.STAGES.length : this.index;
    for (var i = 0; i < this.stages.length; i++) this.stages[i].setVisible(i === shown);
    var def = random ? null : FG.stageById(id);
    this.name.setText(random ? 'RANDOM' : def.name);
    this.place.setText(random ? '' : def.place);
    this.desc.setText(random ? 'ANY STAGE. MATH IS EVERYWHERE.' : def.desc);
    var homes = random ? [] : FG.ROSTER.filter(function (f) { return f.homeStage === id; }).map(function (f) { return f.name; });
    this.home.setText(homes.length ? 'HOME OF ' + homes.join(' AND ') : '');
    if (this.level) {
      this.levelText.setText('< CPU: ' + FG.AI_LEVELS[this.level].name + ' >');
      this.levelHelp.setText({ easy: 'SLOW REACTIONS, RARELY BLOCKS, SHORT COMBOS', normal: 'BLOCKS MOST HIGHS AND MIDS, PUNISHES SOME WHIFFS',
        hard: 'BLOCKS LOWS, SIDESTEPS, PUNISHES WHIFFS, FULL COMBOS', professor: 'LEARNS YOUR HABITS. REPEAT A MOVE AND IT WILL KNOW.' }[this.level] || '');
    }
    this.shownIndex = shown;
  };

  StageSelectScene.prototype.confirm = function () {
    this.leaving = true;
    FG.Sfx.ui('confirm');
    var id = this.current();
    if (id === 'random') id = FG.STAGES[Math.floor(Math.random() * FG.STAGES.length)].id;
    var d = this.data0;
    this.scene.start('fight', { mode: d.mode, p1: d.p1, p2: d.p2, stage: id, level: this.level });
  };

  StageSelectScene.prototype.update = function () {
    this.t++;
    if (this.current() === 'random' && this.t % 40 === 0) this.show();
    var st = this.stages[this.shownIndex];
    st.update();
    // A slow pan across the stage.
    this.cameras.main.scrollX = Math.round((C.WORLD_W - C.VIEW_W) / 2 + Math.sin(this.t * 0.006) * (C.WORLD_W - C.VIEW_W) / 2);
    // The strip of choices.
    var g = this.strip, n = this.choices.length, w = 82, x0 = Math.round((C.VIEW_W - n * w) / 2), y = C.VIEW_H - 34;
    g.clear();
    for (var k = 0; k < n; k++) {
      var sel = k === this.index;
      g.fillStyle(sel ? 0x3c6fb0 : 0x1b1830, 1); g.fillRect(x0 + k * w + 2, y, w - 4, 16);
      g.lineStyle(1, sel ? 0xffd23f : 0x5a4b2c, 1); g.strokeRect(x0 + k * w + 2, y, w - 4, 16);
      this.tiles[k].setPosition(x0 + k * w + w / 2, y + 4).setFont(sel ? 'pf_y' : 'pf_w');
    }
  };

  FG.StageSelectScene = StageSelectScene;
})();
