// Character select, with pixel portraits of every fighter in roster order.
//   arcade:   player 1 picks; the CPU ladder is all nine (PEDERSEN, then WILSON, the boss)
//   cpu:      VS CPU: pick your fighter, then the CPU's
//   versus:   both players pick at the same time, each with their own cursor
//             (P1: WASD + J, K to undo; P2: arrows + NUM1 or ',', NUM2 or '.' to undo)
//   training: pick your fighter, then the opponent
// Then stage select (versus, training) or the first arcade fight.
(function () {
  var C = FG.C;
  var CARD_W = 66, CARD_H = 70, GAP = 6, COLS = 4; // COLS: set for the roster size in create()
  var P1KEYS = { KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down', KeyJ: 'ok', KeyK: 'back', Space: 'ok' };
  var P2KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Numpad1: 'ok', Comma: 'ok', Numpad2: 'back', Period: 'back', NumpadEnter: 'ok' };

  var SelectScene = function () { Phaser.Scene.call(this, { key: 'select' }); };
  SelectScene.prototype = Object.create(Phaser.Scene.prototype);
  SelectScene.prototype.constructor = SelectScene;

  SelectScene.prototype.init = function (data) {
    this.prev = data || {};
    this.mode = this.prev.mode || 'training';
  };

  SelectScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this, roster = FG.ROSTER;
    COLS = Math.ceil(roster.length / 2); // two rows
    this.t = 0;
    this.step = 0; // training: 0 choosing P1, 1 choosing the opponent
    this.cursor = [0, Math.min(1, roster.length - 1)];
    if (this.prev.p1) this.cursor[0] = Math.max(0, roster.indexOf(FG.fighterById(this.prev.p1)));
    if (this.prev.p2) this.cursor[1] = Math.max(0, roster.indexOf(FG.fighterById(this.prev.p2)));
    this.chosen = [null, null];
    this.leaving = false;

    var bg = this.add.graphics();
    bg.fillGradientStyle(0x1b1830, 0x1b1830, 0x07060c, 0x07060c, 1);
    bg.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    bg.lineStyle(1, 0x2a2440, 1);
    for (var y = 0; y < C.VIEW_H; y += 8) bg.lineBetween(0, y, C.VIEW_W, y);
    bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, C.VIEW_W, 30);

    var title = { arcade: 'ARCADE', versus: 'VERSUS', training: 'TRAINING', cpu: 'VS CPU' }[this.mode];
    FG.text(this, C.VIEW_W / 2, 7, 'CHOOSE YOUR FIGHTER', 'y', 2).setOrigin(0.5, 0);
    FG.text(this, 8, 10, title, 'c');
    this.stepText = FG.text(this, C.VIEW_W / 2, 36, '', 'c').setOrigin(0.5, 0);
    this.footer = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 12, '', 'g').setOrigin(0.5, 0);

    // Cards: a pixel portrait (head and shoulders) of each fighter.
    var rows = Math.ceil(roster.length / COLS);
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
        zone.on('pointerdown', function () {
          FG.Sfx.unlock();
          var side = self.twoStep() ? self.step : 0;
          if (self.cursor[side] === idx) self.confirm(side); else { self.cursor[side] = idx; FG.Sfx.ui('move'); self.refresh(); }
        });
      })(i);
      this.cards.push({ x: cx, y: cy, g: g, puppet: puppet, name: name, tint: roster[i].look.top.color });
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
        tag: FG.text(self, x, 300, '', side === 0 ? 'c' : 'r').setOrigin(0.5, 0),
        ready: FG.text(self, x, 312, '', 'y').setOrigin(0.5, 0)
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

  // Which player a key belongs to, and what it does.
  SelectScene.prototype.key = function (code) {
    if (this.leaving) return;
    if (code === 'Escape' || code === 'Backspace') { this.back(this.mode === 'versus' ? null : this.step); return; }
    var side, act;
    if (this.mode === 'versus') {
      if (P1KEYS[code]) { side = 0; act = P1KEYS[code]; }
      else if (P2KEYS[code]) { side = 1; act = P2KEYS[code]; }
      else if (code === 'Enter') { side = this.chosen[0] ? 1 : 0; act = 'ok'; }
      else return;
    } else {
      side = this.twoStep() ? this.step : 0;
      act = P1KEYS[code] || P2KEYS[code] || (code === 'Enter' ? 'ok' : null);
      if (!act) return;
    }
    if (act === 'ok') { this.confirm(side); return; }
    if (act === 'back') { this.back(side); return; }
    if (this.chosen[side] && this.mode === 'versus') return; // locked in
    var n = FG.ROSTER.length, c = this.cursor[side];
    if (act === 'left') c = (c + n - 1) % n;
    if (act === 'right') c = (c + 1) % n;
    if (act === 'up') c = c - COLS >= 0 ? c - COLS : c;
    if (act === 'down') c = c + COLS < n ? c + COLS : c;
    if (c !== this.cursor[side]) FG.Sfx.ui('move');
    this.cursor[side] = c;
    this.refresh();
  };

  // WILSON, the arcade boss: player 1 can't pick him in arcade or VS CPU until arcade
  // has been beaten once (he's always open in training and versus, and as the CPU).
  SelectScene.prototype.locked = function (side, idx) {
    var def = FG.ROSTER[idx == null ? this.cursor[side] : idx];
    var mine = side === 0 && (this.mode === 'arcade' || (this.mode === 'cpu' && this.step === 0));
    return !!(def.boss && mine && !FG.settings.wilsonUnlocked);
  };

  SelectScene.prototype.confirm = function (side) {
    if (this.chosen[side] && this.mode === 'versus') return;
    if (this.locked(side)) { FG.Sfx.ui('move'); this.lockMsg = 90; this.refresh(); return; }
    FG.Sfx.ui('confirm');
    this.chosen[side] = FG.ROSTER[this.cursor[side]].id;
    if (this.twoStep() && side === 0) { this.step = 1; this.refresh(); return; }
    if (this.mode === 'versus' && !(this.chosen[0] && this.chosen[1])) { this.refresh(); return; }
    this.refresh();
    this.leaving = true;
    var self = this;
    this.time.delayedCall(350, function () { self.next(); });
  };

  SelectScene.prototype.next = function () {
    if (this.mode === 'arcade') {
      this.scene.start('ladder', FG.arcadeRun(this.chosen[0]));
      return;
    }
    this.scene.start('stage', { mode: this.mode, p1: this.chosen[0], p2: this.chosen[1], stage: this.prev.stage, level: this.prev.level });
  };

  // side: which player backs out (null: Esc in versus).
  SelectScene.prototype.back = function (side) {
    FG.Sfx.ui('move');
    if (this.twoStep() && this.step === 1) { this.step = 0; this.chosen[0] = null; this.refresh(); return; }
    if (this.mode === 'versus' && side !== null && this.chosen[side]) { this.chosen[side] = null; this.refresh(); return; }
    this.leaving = true;
    this.scene.start('title', { menu: true });
  };

  SelectScene.prototype.refresh = function () {
    var m = this.mode, txt, col = 'pf_c';
    if (m === 'arcade') txt = 'PLAYER 1: CHOOSE YOUR FIGHTER';
    else if (m === 'versus') txt = (this.chosen[0] ? 'P1 READY' : 'P1 CHOOSING') + '      ' + (this.chosen[1] ? 'P2 READY' : 'P2 CHOOSING');
    else { txt = this.step === 0 ? 'PLAYER 1: CHOOSE YOUR FIGHTER' : m === 'cpu' ? "CHOOSE THE CPU'S FIGHTER" : 'CHOOSE YOUR OPPONENT'; col = this.step === 0 ? 'pf_c' : 'pf_r'; }
    this.stepText.setText(txt).setFont(col);
    this.footer.setText(m === 'versus' ? 'P1: WASD + J (K UNDO)    P2: ARROWS + NUM1 OR , (NUM2 OR . UNDO)    ESC BACK' : 'ARROWS MOVE   ENTER CONFIRM   ESC BACK');
    for (var side = 0; side < 2; side++) {
      var def = FG.ROSTER[this.cursor[side]], p = this.previews[side];
      if (!p.puppet || p.puppet.def !== def) {
        p.puppet = FG.puppet(def, p.x, side === 0 ? 1 : -1);
        p.puppet.index = side;
      }
      var showing = this.showing(side), lock = this.locked(side);
      p.name.setText(showing ? (lock ? '???' : def.name) : '');
      p.sub.setText(showing ? (lock ? 'BEAT ARCADE TO UNLOCK' : def.archetype + '  ' + def.theme) : '');
      if (lock) { for (var k0 = 0; k0 < p.moves.length; k0++) p.moves[k0].setText(''); }
      for (var k = 0; k < p.moves.length; k++) p.moves[k].setText(showing && !lock && def.signature[k] ? def.signature[k] : '');
      p.tag.setText(!showing ? '' : side === 0 ? 'P1' : m === 'versus' ? 'P2' : m === 'cpu' ? 'CPU' : 'OPPONENT').setVisible(showing);
      p.ready.setText(showing && this.chosen[side] && !this.twoStep() ? 'READY!' : '');
    }
  };

  SelectScene.prototype.showing = function (side) {
    if (side === 0) return true;
    return this.mode === 'versus' || (this.twoStep() && this.step === 1);
  };

  // Training and VS CPU: one player picks both fighters, one after the other.
  SelectScene.prototype.twoStep = function () { return this.mode === 'training' || this.mode === 'cpu'; };

  SelectScene.prototype.update = function () {
    this.t++;
    var t = this.t;
    // Card portraits: head and shoulders, on the fighter's colour.
    for (var i = 0; i < this.cards.length; i++) {
      var card = this.cards[i];
      card.g.clear();
      card.g.fillStyle(0x2a2440, 1); card.g.fillRect(card.x, card.y, CARD_W, CARD_H);
      card.g.fillStyle(FG.shade(card.tint, 0.45), 1); card.g.fillRect(card.x + 2, card.y + 2, CARD_W - 4, CARD_H - 14);
      card.g.fillStyle(0xffffff, 0.06); for (var sl = 0; sl < CARD_H - 14; sl += 4) card.g.fillRect(card.x + 2, card.y + 2 + sl, CARD_W - 4, 1);
      FG.updatePose(card.puppet, t);
      var def = card.puppet.def, sc = 2.3 * def.scale, base = FG.getPose(def, 'idle');
      card.puppet.x = card.x + CARD_W / 2 - base[4] * sc;
      var cardLocked = this.locked(this.twoStep() ? this.step : 0, i) || (this.mode === 'arcade' && def.boss && !FG.settings.wilsonUnlocked);
      FG.drawFighter(card.g, card.puppet, { scale: 2.3, groundY: card.y + 34 + base[5] * sc, noShadow: true, flash: cardLocked ? 0x07060c : null });
      card.name.setText(cardLocked ? '???' : def.name);
    }
    // Cursor frames.
    var fg = this.frameG;
    fg.clear();
    for (i = 0; i < this.cards.length; i++) {
      var cd = this.cards[i];
      fg.lineStyle(1, 0x5a4b2c, 1); fg.strokeRect(cd.x, cd.y, CARD_W, CARD_H);
    }
    for (var side = 0; side < 2; side++) {
      if (!this.showing(side)) continue;
      var c2 = this.cards[this.cursor[side]];
      var col = side === 0 ? 0x5fd7ff : 0xff4a3d;
      var active = this.mode === 'versus' ? !this.chosen[side] : side === this.step;
      var blink = active && (t % 30 < 15);
      fg.lineStyle(blink ? 3 : 2, col, 1);
      fg.strokeRect(c2.x - 1 - side * 2, c2.y - 1 - side * 2, CARD_W + 2 + side * 4, CARD_H + 2 + side * 4);
    }
    // Big previews (a locked boss is a shadow).
    for (side = 0; side < 2; side++) {
      var p = this.previews[side];
      p.g.clear();
      if (!this.showing(side)) continue;
      FG.updatePose(p.puppet, t);
      p.g.fillStyle(0x000000, 0.35); p.g.fillEllipse(p.x, 296, 70, 8);
      FG.drawFighter(p.g, p.puppet, { scale: 1.45, groundY: 296, noShadow: true, flash: this.locked(side) ? 0x07060c : null });
    }
    if (this.lockMsg > 0) this.lockMsg--;
    this.stepText.setVisible(!(this.lockMsg > 0 && t % 10 < 5));
    if (this.lockMsg > 0) this.stepText.setText('LOCKED: BEAT ARCADE MODE ONCE TO PLAY WILSON').setFont('pf_r');
    else if (this.lockMsg === 0) { this.lockMsg = null; this.refresh(); }
  };

  // Arcade: all nine fighters in a row. Everyone else in a shuffled order, then your
  // own mirror match, then PEDERSEN, the cover fighter, and last WILSON, the boss
  // (if you are one of them, your mirror match takes their place).
  var BOSSES = ['pedersen', 'wilson'];
  FG.arcadeRun = function (p1) {
    var others = FG.ROSTER.filter(function (d) { return d.id !== p1 && BOSSES.indexOf(d.id) < 0; }).map(function (d) { return d.id; });
    for (var i = others.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = others[i]; others[i] = others[j]; others[j] = x; }
    if (BOSSES.indexOf(p1) < 0) others.push(p1);
    BOSSES.forEach(function (b) { if (FG.fighterById(b)) others.push(b); });
    return { p1: p1, ladder: others, index: 0, continues: 0, started: Date.now() };
  };
  // Straight into the first fight (skipping the ladder screen).
  FG.arcadeStart = function (p1) { return FG.arcadeFight(FG.arcadeRun(p1)); };
  // Scene data for the arcade fight at run.index.
  FG.arcadeFight = function (run) {
    var p2 = run.ladder[run.index];
    return { mode: 'arcade', p1: run.p1, p2: p2, stage: FG.fighterById(p2).homeStage, arcade: run };
  };

  FG.SelectScene = SelectScene;
})();
