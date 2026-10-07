// Title screen: the game's name, with the cover fighter PEDERSEN front and center
// next to his red sports car, in his faculty parking lot at dusk. Press Enter for
// the main menu: ARCADE, VERSUS, TRAINING, OPTIONS. Left alone for a while, it
// runs the attract demo (two CPU fighters), then comes back.
(function () {
  var C = FG.C;
  var IDLE_DEMO = 15 * 60; // frames on the title before the demo starts
  var BOX = { x: 452, y: 118, w: 170, h: 108 };

  var TitleScene = function () { Phaser.Scene.call(this, { key: 'title' }); };
  TitleScene.prototype = Object.create(Phaser.Scene.prototype);
  TitleScene.prototype.constructor = TitleScene;

  // PEDERSEN on the title screen: stands easy, now and then fixes his tie.
  var TITLE_POSE = [[1, 'stand'], [80, 'stand'], [92, 'tie'], [110, 'tie2'], [122, 'tie'], [136, 'calm'], [170, 'stand']];

  var MENU = [
    { id: 'arcade', label: 'ARCADE', help: 'FIGHT THROUGH THE WHOLE DEPARTMENT' },
    { id: 'versus', label: 'VERSUS', help: 'PLAYER 1 VS PLAYER 2, BEST OF THREE' },
    { id: 'training', label: 'TRAINING', help: 'PRACTICE, FRAME DATA AND COMBO TRIALS' },
    { id: 'options', label: 'OPTIONS', help: 'DIFFICULTY, ROUND TIME, SOUND' }
  ];
  var TIMES = [30, 60, 99, 0];

  TitleScene.prototype.init = function (data) { this.data0 = data || {}; };

  TitleScene.prototype.create = function () {
    FG.makeFonts(this);
    this.stage = new FG.Stage(this, { id: 'parking', carInWorld: true }); // his car is out front instead
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
    this.footer = FG.text(this, cx, C.VIEW_H - 14, 'ENTER, SPACE OR CLICK TO START', 'g').setOrigin(0.5, 0).setDepth(11);

    // Main menu and options, in a box above the car.
    var self = this;
    this.menuG = this.add.graphics().setScrollFactor(0).setDepth(12);
    this.rows = [0, 1, 2, 3].map(function (k) {
      var t = FG.text(self, BOX.x + 16, BOX.y + 12 + k * 18, '', 'w', 2).setDepth(13);
      t.setInteractive({ useHandCursor: true }).on('pointerdown', function () { FG.Sfx.unlock(); if (self.menuOn) { self.index = k; self.choose(0); } });
      return t;
    });
    this.help = FG.text(this, cx, 300, '', 'c').setOrigin(0.5, 0).setDepth(13);

    this.t = 0;
    this.idle = 0;
    this.menuOn = !!this.data0.menu;   // back from another screen: straight to the menu
    this.options = false;
    this.index = 0;
    this.started = false;
    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ESC]);
    kb.on('keydown', function (e) { FG.Sfx.unlock(); self.idle = 0; self.key(e.code); });
    this.input.on('pointerdown', function () { FG.Sfx.unlock(); self.idle = 0; if (!self.menuOn) self.openMenu(); });
    window.FG_TITLE = this;
    this.refresh();
  };

  TitleScene.prototype.openMenu = function () {
    this.menuOn = true; this.options = false; this.index = 0;
    FG.Sfx.ui('confirm');
    this.refresh();
  };

  TitleScene.prototype.key = function (code) {
    if (this.started) return;
    if (!this.menuOn) {
      if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter' || code === 'KeyJ') this.openMenu();
      return;
    }
    var n = 4;
    switch (code) {
      case 'ArrowUp': case 'KeyW': this.index = (this.index + n - 1) % n; FG.Sfx.ui('move'); break;
      case 'ArrowDown': case 'KeyS': this.index = (this.index + 1) % n; FG.Sfx.ui('move'); break;
      case 'ArrowLeft': case 'KeyA': if (this.options) this.choose(-1); break;
      case 'ArrowRight': case 'KeyD': if (this.options) this.choose(1); break;
      case 'Enter': case 'Space': case 'NumpadEnter': case 'KeyJ': this.choose(0); break;
      case 'Escape': case 'KeyK': case 'Backspace':
        if (this.options) { this.options = false; this.index = 3; } else this.menuOn = false;
        FG.Sfx.ui('move');
        break;
    }
    this.refresh();
  };

  // Activate the selected row. delta: -1 / +1 to change an option, 0 to confirm.
  TitleScene.prototype.choose = function (delta) {
    var s = FG.settings;
    if (!this.options) {
      var item = MENU[this.index];
      if (item.id === 'options') { this.options = true; this.index = 0; FG.Sfx.ui('confirm'); this.refresh(); return; }
      this.go(item.id);
      return;
    }
    var d = delta || 1;
    switch (this.index) {
      case 0: s.difficulty = FG.AI_ORDER[(FG.AI_ORDER.indexOf(s.difficulty) + d + 3) % 3]; break;
      case 1: s.time = TIMES[(TIMES.indexOf(s.time) + d + TIMES.length) % TIMES.length]; break;
      case 2: s.sound = !s.sound; FG.Sfx.muted = !s.sound; break;
      case 3: if (!delta) { this.options = false; this.index = 3; } break;
    }
    FG.saveSettings();
    FG.Sfx.ui('move');
    this.refresh();
  };

  TitleScene.prototype.go = function (mode) {
    if (this.started) return;
    this.started = true;
    FG.Sfx.ui('confirm');
    this.scene.start('select', { mode: mode });
  };

  // The attract demo: two CPU fighters on a random stage.
  TitleScene.prototype.demo = function () {
    if (this.started) return;
    this.started = true;
    var r = FG.ROSTER, a = Math.floor(Math.random() * r.length), b = (a + 1 + Math.floor(Math.random() * (r.length - 1))) % r.length;
    this.scene.start('fight', { mode: 'attract', p1: r[a].id, p2: r[b].id, stage: FG.STAGES[Math.floor(Math.random() * FG.STAGES.length)].id });
  };

  TitleScene.prototype.refresh = function () {
    var on = this.menuOn, s = FG.settings, self = this;
    this.prompt.setVisible(!on);
    this.footer.setText(on ? 'UP/DOWN SELECT   ENTER CONFIRM   ESC BACK' : 'ENTER, SPACE OR CLICK TO START');
    var g = this.menuG;
    g.clear();
    if (!on) { this.rows.forEach(function (r) { r.setText(''); }); this.help.setText(''); return; }
    g.fillStyle(0x07060c, 0.88); g.fillRect(BOX.x, BOX.y, BOX.w, BOX.h);
    g.lineStyle(2, 0xffd23f, 1); g.strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
    g.fillStyle(0x3c6fb0, 0.7); g.fillRect(BOX.x + 6, BOX.y + 9 + this.index * 18, BOX.w - 12, 18);
    var labels;
    if (this.options) {
      labels = ['CPU ' + FG.AI_LEVELS[s.difficulty].name, 'TIME ' + (s.time ? s.time : 'NONE'), 'SOUND ' + (s.sound ? 'ON' : 'OFF'), 'BACK'];
      this.help.setText(['HOW HARD THE CPU FIGHTS', 'SECONDS PER ROUND', 'SOUND EFFECTS', 'BACK TO THE MENU'][this.index] + (this.index < 3 ? '   LEFT/RIGHT CHANGE' : ''));
    } else {
      labels = MENU.map(function (m) { return m.label; });
      this.help.setText(MENU[this.index].help);
    }
    this.rows.forEach(function (r, k) { r.setText(labels[k]).setScale(self.options ? 1.5 : 2).setFont(k === self.index ? 'pf_y' : 'pf_w'); });
  };

  TitleScene.prototype.update = function () {
    this.t++;
    this.stage.update();
    this.prompt.setVisible(!this.menuOn && this.t % 60 < 40);
    if (++this.idle > IDLE_DEMO) this.demo();
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
