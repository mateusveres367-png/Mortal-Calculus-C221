// Character select: pick your fighter, then your opponent (the training dummy
// or player 2). Arrows / WASD move, Enter / Space / J confirm, Esc / K go back.
// Fighters appear in roster order (FG.ROSTER is sorted by each fighter's `order`).
(function () {
  var C = FG.C;
  var CARD_W = 66, CARD_H = 70, GAP = 6, COLS = 4;

  var SelectScene = function () { Phaser.Scene.call(this, { key: 'select' }); };
  SelectScene.prototype = Object.create(Phaser.Scene.prototype);
  SelectScene.prototype.constructor = SelectScene;

  SelectScene.prototype.init = function (data) {
    this.prev = data || {};
  };

  SelectScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this, roster = FG.ROSTER;
    this.t = 0;
    this.step = 0; // 0: choosing P1, 1: choosing the opponent
    this.cursor = [0, Math.min(1, roster.length - 1)];
    if (this.prev.p1) this.cursor[0] = Math.max(0, roster.indexOf(FG.fighterById(this.prev.p1)));
    if (this.prev.p2) this.cursor[1] = Math.max(0, roster.indexOf(FG.fighterById(this.prev.p2)));
    this.chosen = [null, null];

    var bg = this.add.graphics();
    bg.fillGradientStyle(0x1b1830, 0x1b1830, 0x07060c, 0x07060c, 1);
    bg.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    bg.lineStyle(1, 0x2a2440, 1);
    for (var y = 0; y < C.VIEW_H; y += 8) bg.lineBetween(0, y, C.VIEW_W, y);
    bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, C.VIEW_W, 30);

    FG.text(this, C.VIEW_W / 2, 7, 'CHOOSE YOUR FIGHTER', 'y', 2).setOrigin(0.5, 0);
    this.stepText = FG.text(this, C.VIEW_W / 2, 36, '', 'c').setOrigin(0.5, 0);
    FG.text(this, C.VIEW_W / 2, C.VIEW_H - 12, 'ARROWS MOVE   ENTER CONFIRM   ESC BACK', 'g').setOrigin(0.5, 0);

    // Cards.
    var rows = Math.ceil(roster.length / COLS), cols = Math.min(COLS, roster.length);
    var gridW = cols * CARD_W + (cols - 1) * GAP;
    this.gridX = Math.round((C.VIEW_W - gridW) / 2);
    this.gridY = rows > 1 ? 162 : 200;
    this.cards = [];
    for (var i = 0; i < roster.length; i++) {
      var col = i % COLS, row = Math.floor(i / COLS);
      var inRow = Math.min(COLS, roster.length - row * COLS);
      var rowX = Math.round((C.VIEW_W - (inRow * CARD_W + (inRow - 1) * GAP)) / 2);
      var cx = rowX + col * (CARD_W + GAP), cy = this.gridY + row * (CARD_H + GAP);
      var g = this.add.graphics();
      var maskShape = this.make.graphics({ add: false });
      maskShape.fillStyle(0xffffff, 1); maskShape.fillRect(cx + 2, cy + 2, CARD_W - 4, CARD_H - 14);
      g.setMask(maskShape.createGeometryMask());
      var puppet = FG.puppet(roster[i], cx + CARD_W / 2 - 2, 1);
      puppet.index = i;
      var name = FG.text(this, cx + CARD_W / 2, cy + CARD_H - 11, roster[i].name, 'w').setOrigin(0.5, 0).setDepth(5);
      if (roster[i].name.length > 9) name.setScale(0.8);
      var zone = this.add.zone(cx + CARD_W / 2, cy + CARD_H / 2, CARD_W, CARD_H).setInteractive({ useHandCursor: true });
      (function (idx) {
        zone.on('pointerdown', function () { FG.Sfx.unlock(); if (self.cursor[self.step] === idx) self.confirm(); else { self.cursor[self.step] = idx; FG.Sfx.ui('move'); } });
      })(i);
      this.cards.push({ x: cx, y: cy, g: g, puppet: puppet, name: name });
    }
    this.frameG = this.add.graphics().setDepth(6);

    // Previews: big idle fighters with their details.
    this.previews = [0, 1].map(function (side) {
      var x = side === 0 ? 70 : C.VIEW_W - 70;
      var p = {
        side: side, x: x,
        g: self.add.graphics(),
        puppet: null,
        name: FG.text(self, side === 0 ? 10 : C.VIEW_W - 10, 54, '', side === 0 ? 'c' : 'r', 2),
        sub: FG.text(self, side === 0 ? 10 : C.VIEW_W - 10, 74, '', 'y'),
        moves: [0, 1, 2, 3, 4].map(function (k) { return FG.text(self, side === 0 ? 10 : C.VIEW_W - 10, 88 + k * 10, '', 'w'); }),
        tag: FG.text(self, x, 300, side === 0 ? 'P1' : 'OPPONENT', side === 0 ? 'c' : 'r').setOrigin(0.5, 0)
      };
      if (side === 1) { p.name.setOrigin(1, 0); p.sub.setOrigin(1, 0); p.moves.forEach(function (m) { m.setOrigin(1, 0); }); }
      return p;
    });

    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ESC]);
    kb.on('keydown', function (e) { FG.Sfx.unlock(); self.key(e.code); });
    window.FG_SELECT = this;
    this.refresh();
  };

  SelectScene.prototype.key = function (code) {
    var n = FG.ROSTER.length, c = this.cursor[this.step];
    switch (code) {
      case 'ArrowLeft': case 'KeyA': c = (c + n - 1) % n; break;
      case 'ArrowRight': case 'KeyD': c = (c + 1) % n; break;
      case 'ArrowUp': case 'KeyW': c = c - COLS >= 0 ? c - COLS : c; break;
      case 'ArrowDown': case 'KeyS': c = c + COLS < n ? c + COLS : c; break;
      case 'Enter': case 'Space': case 'KeyJ': case 'NumpadEnter': this.confirm(); return;
      case 'Escape': case 'KeyK': case 'Backspace': this.back(); return;
      default: return;
    }
    if (c !== this.cursor[this.step]) FG.Sfx.ui('move');
    this.cursor[this.step] = c;
    this.refresh();
  };

  SelectScene.prototype.confirm = function () {
    FG.Sfx.ui('confirm');
    this.chosen[this.step] = FG.ROSTER[this.cursor[this.step]].id;
    if (this.step === 0) { this.step = 1; this.refresh(); return; }
    this.scene.start('fight', { p1: this.chosen[0], p2: this.chosen[1] });
  };

  SelectScene.prototype.back = function () {
    FG.Sfx.ui('move');
    if (this.step === 1) { this.step = 0; this.chosen[0] = null; this.refresh(); return; }
    this.scene.start('title');
  };

  SelectScene.prototype.refresh = function () {
    this.stepText.setText(this.step === 0 ? 'PLAYER 1: CHOOSE YOUR FIGHTER' : 'CHOOSE YOUR OPPONENT');
    this.stepText.setFont(this.step === 0 ? 'pf_c' : 'pf_r');
    for (var side = 0; side < 2; side++) {
      var def = FG.ROSTER[this.cursor[side]], p = this.previews[side];
      if (!p.puppet || p.puppet.def !== def) {
        p.puppet = FG.puppet(def, p.x, side === 0 ? 1 : -1);
        p.puppet.index = side;
      }
      var showing = side === 0 || this.step === 1;
      p.name.setText(showing ? def.name : '');
      p.sub.setText(showing ? def.archetype + '  ' + def.theme : '');
      for (var k = 0; k < p.moves.length; k++) p.moves[k].setText(showing && def.signature[k] ? def.signature[k] : '');
      p.tag.setVisible(showing);
    }
  };

  SelectScene.prototype.update = function () {
    this.t++;
    var t = this.t;
    // Card portraits.
    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      card.g.clear();
      card.g.fillStyle(0x2a2440, 1); card.g.fillRect(card.x, card.y, CARD_W, CARD_H);
      FG.updatePose(card.puppet, t);
      // Centre each portrait on the fighter's head (stances differ in height and lean).
      var def = card.puppet.def, sc = 1.75 * def.scale, base = FG.getPose(def, 'idle');
      card.puppet.x = card.x + CARD_W / 2 - base[4] * sc;
      FG.drawFighter(card.g, card.puppet, { scale: 1.75, groundY: card.y + 26 + base[5] * sc, noShadow: true });
    }
    // Cursor frames.
    var fg = this.frameG;
    fg.clear();
    for (i = 0; i < this.cards.length; i++) {
      var cd = this.cards[i];
      fg.lineStyle(1, 0x5a4b2c, 1); fg.strokeRect(cd.x, cd.y, CARD_W, CARD_H);
    }
    for (var side = 0; side < 2; side++) {
      if (side === 1 && this.step === 0) continue;
      var c2 = this.cards[this.cursor[side]];
      var col = side === 0 ? 0x5fd7ff : 0xff4a3d;
      var blink = (side === this.step) && (t % 30 < 15);
      fg.lineStyle(blink ? 3 : 2, col, 1);
      fg.strokeRect(c2.x - 1 - side * 2, c2.y - 1 - side * 2, CARD_W + 2 + side * 4, CARD_H + 2 + side * 4);
    }
    // Big previews.
    for (side = 0; side < 2; side++) {
      var p = this.previews[side];
      p.g.clear();
      if (side === 1 && this.step === 0) continue;
      FG.updatePose(p.puppet, t);
      p.g.fillStyle(0x000000, 0.35); p.g.fillEllipse(p.x, 296, 70, 8);
      FG.drawFighter(p.g, p.puppet, { scale: 1.45, groundY: 296, noShadow: true });
    }
  };

  FG.SelectScene = SelectScene;
})();
