// Character select, with pixel portraits of every fighter, on two tabs: TEACHERS and
// STUDENTS (Q/E switch tabs, or tap one; player 2 in versus: [ and ]). Students and
// teachers can fight each other in every mode.
//   arcade:   player 1 picks; the CPU ladder follows (see FG.arcadeRun)
//   cpu:      VS CPU: pick your fighter, then the CPU's
//   versus:   both players pick at the same time, each with their own cursor
//             (P1: WASD + J, K to undo; P2: arrows + NUM1 or ',', NUM2 or '.' to undo)
//   training: pick your fighter, then the opponent
// Z/X (player 2: NUM4/NUM5 or ; and ') pick an unlocked outfit.
// Then stage select (versus, training) or the first arcade fight.
(function () {
  var C = FG.C;
  var CARD_W = 66, CARD_H = 70, GAP = 6, COLS = 5;
  var P1KEYS = { KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down', KeyJ: 'ok', KeyK: 'back', Space: 'ok', KeyQ: 'prevTab', KeyE: 'nextTab', KeyZ: 'prevOutfit', KeyX: 'nextOutfit' };
  var P2KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Numpad1: 'ok', Comma: 'ok', Numpad2: 'back', Period: 'back', NumpadEnter: 'ok',
    Numpad4: 'prevOutfit', Numpad5: 'nextOutfit', Semicolon: 'prevOutfit', Quote: 'nextOutfit', BracketLeft: 'prevTab', BracketRight: 'nextTab', Numpad7: 'prevTab', Numpad9: 'nextTab' };
  var TAB_NAME = { teacher: 'TEACHERS', student: 'STUDENTS' };

  var SelectScene = function () { Phaser.Scene.call(this, { key: 'select' }); };
  SelectScene.prototype = Object.create(Phaser.Scene.prototype);
  SelectScene.prototype.constructor = SelectScene;

  SelectScene.prototype.init = function (data) {
    this.prev = data || {};
    this.mode = this.prev.mode || 'training';
  };

  SelectScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this;
    this.t = 0;
    this.step = 0; // training: 0 choosing P1, 1 choosing the opponent
    // Each side's tab and cursor (an index into that tab's fighters).
    this.tab = ['teacher', 'teacher'];
    this.cursor = [0, 1];
    var self2 = this;
    ['p1', 'p2'].forEach(function (key, side) {
      var d = self2.prev[key] && FG.fighterById(self2.prev[key]);
      if (d) { self2.tab[side] = d.side; self2.cursor[side] = Math.max(0, FG.rosterSide(d.side).indexOf(d)); }
    });
    // The STUDENTS tab is locked until its code has been entered (the keypad below).
    if (!FG.studentsUnlocked()) for (var ls = 0; ls < 2; ls++) if (this.tab[ls] === 'student') { this.tab[ls] = 'teacher'; this.cursor[ls] = 0; }
    this.view = this.tab[0]; // the tab the grid shows
    this.chosen = [null, null];
    this.outfit = [0, 0]; // the outfit each side wears (unlocked by winning with that fighter)
    this.leaving = false;

    var bg = this.add.graphics();
    bg.fillGradientStyle(0x1b1830, 0x1b1830, 0x07060c, 0x07060c, 1);
    bg.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    bg.lineStyle(1, 0x2a2440, 1);
    for (var y = 0; y < C.VIEW_H; y += 8) bg.lineBetween(0, y, C.VIEW_W, y);
    bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, C.VIEW_W, 30);

    var title = { arcade: 'ARCADE', versus: 'VERSUS', training: 'TRAINING', cpu: 'VS CPU', detention: 'DETENTION', timed: 'TIMED TEST' }[this.mode];
    FG.text(this, C.VIEW_W / 2, 7, 'CHOOSE YOUR FIGHTER', 'y', 2).setOrigin(0.5, 0);
    FG.text(this, 8, 10, title, 'c');
    this.stepText = FG.text(this, C.VIEW_W / 2, 36, '', 'c').setOrigin(0.5, 0);
    this.footer = FG.text(this, C.VIEW_W / 2, C.VIEW_H - 12, '', 'g').setOrigin(0.5, 0);

    // The tabs: TEACHERS | STUDENTS, over the grid. Tap one to switch.
    this.tabG = this.add.graphics().setDepth(4);
    this.tabs = FG.SIDES.map(function (side, k) {
      var x = C.VIEW_W / 2 + (k ? 44 : -44);
      var t = FG.text(self, x, 145, TAB_NAME[side], 'w').setOrigin(0.5, 0).setDepth(5);
      var zone = self.add.zone(x, 150, 84, 18).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', function () { FG.Sfx.unlock(); self.setTab(self.activeSide(), side); });
      return { side: side, x: x, text: t };
    });
    this.tabMarks = [FG.text(this, 0, 0, 'P1', 'c').setDepth(5), FG.text(this, 0, 0, 'P2', 'r').setDepth(5)];

    // Cards: a pixel portrait (head and shoulders) of each fighter, one grid per tab.
    this.gridY = 162;
    this.cards = {};
    FG.SIDES.forEach(function (side) {
      var list = FG.rosterSide(side), rowsN = Math.ceil(list.length / COLS);
      var gy = rowsN > 1 ? 162 : 200;
      self.cards[side] = list.map(function (def, i) {
        var col = i % COLS, row = Math.floor(i / COLS);
        var inRow = Math.min(COLS, list.length - row * COLS);
        var rowX = Math.round((C.VIEW_W - (inRow * CARD_W + (inRow - 1) * GAP)) / 2);
        var cx = rowX + col * (CARD_W + GAP), cy = gy + row * (CARD_H + GAP);
        var g = self.add.graphics();
        var maskShape = self.make.graphics({ add: false });
        maskShape.fillStyle(0xffffff, 1); maskShape.fillRect(cx + 2, cy + 2, CARD_W - 4, CARD_H - 14);
        g.setMask(maskShape.createGeometryMask());
        var puppet = FG.puppet(def, cx + CARD_W / 2 - 2, 1);
        puppet.index = i; puppet.outfit = 0;
        var name = FG.text(self, cx + CARD_W / 2, cy + CARD_H - 11, def.name, 'w').setOrigin(0.5, 0).setDepth(5);
        if (def.name.length > 9) name.setScale(0.8);
        var zone = self.add.zone(cx + CARD_W / 2, cy + CARD_H / 2, CARD_W, CARD_H).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', function () {
          if (self.view !== side) return;
          FG.Sfx.unlock();
          var sd = self.activeSide();
          if (self.tab[sd] === side && self.cursor[sd] === i) self.confirm(sd);
          else { self.tab[sd] = side; self.cursor[sd] = i; FG.Sfx.ui('move'); self.refresh(); }
        });
        return { x: cx, y: cy, g: g, puppet: puppet, name: name, zone: zone, def: def, tint: def.look.top.color };
      });
    });
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
        outfit: FG.text(self, side === 0 ? 10 : C.VIEW_W - 10, 140, '', 'g'),
        outfit2: FG.text(self, side === 0 ? 10 : C.VIEW_W - 10, 150, '', 'g'),
        ready: FG.text(self, x, 312, '', 'y').setOrigin(0.5, 0)
      };
      if (side === 1) { p.name.setOrigin(1, 0); p.sub.setOrigin(1, 0); p.outfit.setOrigin(1, 0); p.outfit2.setOrigin(1, 0); p.moves.forEach(function (m) { m.setOrigin(1, 0); }); }
      return p;
    });

    this.makeKeypad();

    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ESC]);
    kb.on('keydown', function (e) { FG.Sfx.unlock(); self.key(e.code); });
    window.FG_SELECT = this;
    this.refresh();
  };

  // The side the single-player controls (and taps) act for right now.
  SelectScene.prototype.activeSide = function () {
    if (this.mode === 'versus') return this.chosen[0] && !this.chosen[1] ? 1 : 0;
    return this.twoStep() ? this.step : 0;
  };
  SelectScene.prototype.list = function (side) { return FG.rosterSide(this.tab[side]); };
  SelectScene.prototype.def = function (side) { var l = this.list(side); return l[Math.min(this.cursor[side], l.length - 1)]; };

  // Switch a side's tab (TEACHERS / STUDENTS); the grid follows. A locked STUDENTS tab
  // opens the keypad instead.
  SelectScene.prototype.setTab = function (side, tab) {
    if (this.pad.open) return;
    if (this.chosen[side] && this.mode === 'versus') return;
    if (tab === 'student' && this.tab[side] !== 'student' && !FG.studentsUnlocked()) { this.openKeypad(side); return; }
    if (this.tab[side] !== tab) { this.tab[side] = tab; this.cursor[side] = 0; FG.Sfx.ui('move'); }
    this.view = tab;
    this.refresh();
  };

  // Which player a key belongs to, and what it does.
  SelectScene.prototype.key = function (code) {
    if (this.leaving) return;
    if (this.pad.open) { this.keypadKey(code); return; }
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
    if (act === 'prevTab' || act === 'nextTab') { this.setTab(side, this.tab[side] === 'teacher' ? 'student' : 'teacher'); return; }
    this.view = this.tab[side];
    if (act === 'ok') { this.confirm(side); return; }
    if (act === 'back') { this.back(side); return; }
    if (act === 'prevOutfit' || act === 'nextOutfit') { this.cycleOutfit(side, act === 'nextOutfit' ? 1 : -1); return; }
    if (this.chosen[side] && this.mode === 'versus') return; // locked in
    var n = this.list(side).length, c = this.cursor[side];
    if (act === 'left') c = (c + n - 1) % n;
    if (act === 'right') c = (c + 1) % n;
    if (act === 'up') c = c - COLS >= 0 ? c - COLS : c;
    if (act === 'down') c = c + COLS < n ? c + COLS : c;
    if (c !== this.cursor[side]) FG.Sfx.ui('move');
    this.cursor[side] = c;
    this.refresh();
  };

  // Z / X (player 2: NUM4 / NUM5 or ; / '): the next unlocked outfit.
  SelectScene.prototype.cycleOutfit = function (side, d) {
    if (this.chosen[side] && this.mode === 'versus') return;
    var def = this.def(side), n = FG.outfitsUnlocked(def.id);
    if (n <= 1 || this.locked(side)) { FG.Sfx.ui('move'); return; }
    this.outfit[side] = (this.outfit[side] + d + n) % n;
    FG.Progress.setOutfit(def.id, this.outfit[side]);
    FG.Sfx.ui('confirm');
    this.refresh();
  };

  // WILSON, the arcade boss: player 1 can't pick him in arcade or VS CPU until arcade
  // has been beaten once (he's always open in training and versus, and as the CPU).
  SelectScene.prototype.locked = function (side, def) {
    def = def || this.def(side);
    var mine = side === 0 && (this.solo() || (this.mode === 'cpu' && this.step === 0));
    return !!(def.boss && mine && !FG.settings.wilsonUnlocked);
  };

  SelectScene.prototype.confirm = function (side) {
    if (this.chosen[side] && this.mode === 'versus') return;
    if (this.locked(side)) { FG.Sfx.ui('move'); this.lockMsg = 90; this.refresh(); return; }
    FG.Sfx.ui('confirm');
    this.chosen[side] = this.def(side).id;
    FG.outfitPick[side] = { id: this.chosen[side], k: this.outfit[side] };
    if (this.twoStep() && side === 0) { this.step = 1; this.view = this.tab[1]; this.refresh(); return; }
    if (this.mode === 'versus' && !(this.chosen[0] && this.chosen[1])) { this.view = this.tab[this.chosen[0] ? 1 : 0]; this.refresh(); return; }
    this.refresh();
    this.leaving = true;
    var self = this;
    this.time.delayedCall(350, function () { self.next(); });
  };

  SelectScene.prototype.next = function () {
    if (this.mode === 'arcade' || this.mode === 'timed') {
      this.scene.start('ladder', FG.arcadeRun(this.chosen[0], this.mode === 'timed'));
      return;
    }
    if (this.mode === 'detention') {
      this.scene.start('fight', FG.detentionFight(FG.detentionRun(this.chosen[0])));
      return;
    }
    this.scene.start('stage', { mode: this.mode, p1: this.chosen[0], p2: this.chosen[1], stage: this.prev.stage, level: this.prev.level });
  };

  // side: which player backs out (null: Esc in versus).
  SelectScene.prototype.back = function (side) {
    FG.Sfx.ui('move');
    if (this.twoStep() && this.step === 1) { this.step = 0; this.chosen[0] = null; this.view = this.tab[0]; this.refresh(); return; }
    if (this.mode === 'versus' && side !== null && this.chosen[side]) { this.chosen[side] = null; this.refresh(); return; }
    this.leaving = true;
    this.scene.start('title', { menu: true });
  };

  SelectScene.prototype.refresh = function () {
    var m = this.mode, txt, col = 'pf_c', self = this;
    if (this.solo()) txt = 'PLAYER 1: CHOOSE YOUR FIGHTER';
    else if (m === 'versus') txt = (this.chosen[0] ? 'P1 READY' : 'P1 CHOOSING') + '      ' + (this.chosen[1] ? 'P2 READY' : 'P2 CHOOSING');
    else { txt = this.step === 0 ? 'PLAYER 1: CHOOSE YOUR FIGHTER' : m === 'cpu' ? "CHOOSE THE CPU'S FIGHTER" : 'CHOOSE YOUR OPPONENT'; col = this.step === 0 ? 'pf_c' : 'pf_r'; }
    this.stepText.setText(txt).setFont(col);
    this.footer.setText(m === 'versus' ? 'P1: WASD+J (K UNDO) Q/E TAB   P2: ARROWS+NUM1 (NUM2 UNDO) [ ] TAB   ESC BACK' : 'ARROWS MOVE   Q/E TEACHERS/STUDENTS   Z/X OUTFIT   ENTER CONFIRM   ESC BACK');
    // Only the shown tab's cards.
    FG.SIDES.forEach(function (side) {
      self.cards[side].forEach(function (cd) { var on = side === self.view; cd.g.setVisible(on); cd.name.setVisible(on); if (cd.zone.input) cd.zone.input.enabled = on && !self.pad.open; });
    });
    var studentsLocked = !FG.studentsUnlocked();
    this.tabs.forEach(function (tb) {
      tb.text.setFont(tb.side === self.view ? 'pf_y' : 'pf_g').setText(TAB_NAME[tb.side] + (tb.side === 'student' && studentsLocked ? ' [LOCKED]' : ''));
    });
    for (var side = 0; side < 2; side++) {
      var def = this.def(side), p = this.previews[side];
      if (!p.puppet || p.puppet.def !== def) {
        p.puppet = FG.puppet(def, p.x, side === 0 ? 1 : -1);
        p.puppet.index = side;
        // The outfit you last wore with them (if it's still unlocked).
        this.outfit[side] = Math.min(FG.progress.outfit[def.id] || 0, FG.outfitsUnlocked(def.id) - 1);
      }
      p.puppet.outfit = this.outfit[side];
      var nOut = FG.outfitsUnlocked(def.id), next = FG.OUTFITS[nOut];
      var showing = this.showing(side), lock = this.locked(side);
      p.name.setText(showing ? (lock ? '???' : def.name) : '');
      p.sub.setText(showing ? (lock ? 'BEAT ARCADE TO UNLOCK' : def.archetype + '  ' + (def.nickname ? '"' + def.nickname + '"' : def.theme)) : '');
      for (var k = 0; k < p.moves.length; k++) p.moves[k].setText(showing && !lock && def.signature[k] ? def.signature[k] : '');
      p.tag.setText(!showing ? '' : side === 0 ? 'P1' : m === 'versus' ? 'P2' : m === 'cpu' ? 'CPU' : 'OPPONENT').setVisible(showing);
      p.ready.setText(showing && this.chosen[side] && !this.twoStep() ? 'READY!' : '');
      var keys = side === 0 || this.twoStep() ? 'Z/X' : 'NUM4/5';
      p.outfit.setText(!showing || lock ? '' : 'OUTFIT ' + (this.outfit[side] + 1) + '/' + nOut + ': ' + FG.OUTFITS[this.outfit[side]].name);
      p.outfit2.setText(!showing || lock ? '' : (next ? 'NEXT AT ' + next.wins + (next.wins > 1 ? ' WINS' : ' WIN') : 'ALL UNLOCKED') + (nOut > 1 ? '  ' + keys : ''));
    }
  };

  // --- The student keypad ------------------------------------------------------------
  // A retro keypad over the screen: a green LCD and twelve keys. Four digits (number keys,
  // or tap the keys); FG.STUDENT_CODE opens the STUDENTS tab for good (FG.unlockStudents),
  // anything else is ACCESS DENIED (a red flash and a shake) and it clears.
  var PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'X'];
  var PAD = { x: C.VIEW_W / 2 - 92, y: 52, w: 184, h: 262, kw: 48, kh: 26, gap: 6, kx: 0, ky: 112 };
  PAD.kx = (PAD.w - 3 * PAD.kw - 2 * PAD.gap) / 2;

  SelectScene.prototype.makeKeypad = function () {
    var self = this;
    this.pad = { open: false, side: 0, digits: '', state: null, t: 0, press: null };
    this.padG = this.add.graphics().setDepth(40);
    this.padTitle = FG.text(this, C.VIEW_W / 2, PAD.y + 10, 'STUDENT ACCESS', 'k').setOrigin(0.5, 0).setDepth(41).setVisible(false);
    this.padSub = FG.text(this, C.VIEW_W / 2, PAD.y + 22, 'ENTER YOUR 4-DIGIT CODE', 'k').setOrigin(0.5, 0).setDepth(41).setVisible(false);
    this.padLcd = FG.text(this, C.VIEW_W / 2, PAD.y + 50, '', 'g', 3).setOrigin(0.5, 0).setDepth(41).setVisible(false);
    this.padMsg = FG.text(this, C.VIEW_W / 2, PAD.y + 88, '', 'r', 1).setOrigin(0.5, 0).setDepth(41).setVisible(false);
    this.padHint = FG.text(this, C.VIEW_W / 2, PAD.y + PAD.h - 12, 'TYPE OR TAP   ESC CANCEL', 'k').setOrigin(0.5, 0).setDepth(41).setVisible(false);
    this.padKeys = PAD_KEYS.map(function (label, i) {
      var col = i % 3, row = Math.floor(i / 3);
      var x = PAD.x + PAD.kx + col * (PAD.kw + PAD.gap), y = PAD.y + PAD.ky + row * (PAD.kh + PAD.gap);
      var text = FG.text(self, x + PAD.kw / 2, y + PAD.kh / 2 - 4, label, label === 'X' ? 'r' : 'w', label.length > 1 ? 1 : 2).setOrigin(0.5, 0).setDepth(42).setVisible(false);
      var zone = self.add.zone(x, y, PAD.kw, PAD.kh).setOrigin(0, 0).setDepth(43).setInteractive();
      zone.input.enabled = false;
      zone.on('pointerdown', function () { FG.Sfx.unlock(); self.keypadPress(label); });
      return { label: label, x: x, y: y, text: text, zone: zone };
    });
  };

  SelectScene.prototype.openKeypad = function (side) {
    var pd = this.pad;
    pd.open = true; pd.side = side; pd.digits = ''; pd.state = null; pd.t = 0; pd.press = null;
    this.padKeys.forEach(function (k) { k.zone.input.enabled = true; });
    FG.Sfx.ui('move');
    this.refresh();
  };

  SelectScene.prototype.closeKeypad = function () {
    this.pad.open = false;
    this.padKeys.forEach(function (k) { k.zone.input.enabled = false; });
    this.refresh();
  };

  // A key from the keyboard while the keypad is up.
  SelectScene.prototype.keypadKey = function (code) {
    var m = /^(?:Digit|Numpad)(\d)$/.exec(code);
    if (m) { this.keypadPress(m[1]); return; }
    if (code === 'Escape') { this.keypadPress('X'); return; }
    if (code === 'Backspace' || code === 'Delete') { this.keypadPress('<'); return; }
  };

  SelectScene.prototype.keypadPress = function (label) {
    var pd = this.pad;
    if (!pd.open || pd.state === 'granted') return;
    if (pd.state === 'denied') { pd.state = null; pd.digits = ''; } // a key cuts the denial short
    pd.press = { label: label, t: 0 };
    if (label === 'X') { FG.Sfx.ui('back'); this.closeKeypad(); return; }
    if (label === 'CLR') { pd.digits = ''; FG.Sfx.ui('move'); return; }
    if (label === '<') { pd.digits = pd.digits.slice(0, -1); FG.Sfx.ui('move'); return; }
    if (pd.digits.length >= 4) return;
    pd.digits += label;
    FG.Sfx.synth(function (S) { S.osc({ dur: 0.06, f0: 1320, gain: 0.06, type: 'square' }); });
    if (pd.digits.length < 4) return;
    pd.t = 0;
    if (pd.digits === FG.STUDENT_CODE) {
      pd.state = 'granted';
      FG.unlockStudents();
      FG.Sfx.synth(function (S) { [660, 880, 1320].forEach(function (f, k) { S.osc({ dur: 0.12, f0: f, gain: 0.08, type: 'square', at: k * 0.09 }); }); });
    } else {
      pd.state = 'denied';
      FG.Sfx.synth(function (S) { S.osc({ dur: 0.45, f0: 110, f1: 90, gain: 0.18, type: 'sawtooth' }); S.osc({ dur: 0.45, f0: 116, gain: 0.12, type: 'square' }); });
    }
  };

  SelectScene.prototype.drawKeypad = function () {
    var pd = this.pad, g = this.padG, texts = [this.padTitle, this.padSub, this.padLcd, this.padMsg, this.padHint];
    g.clear();
    texts.forEach(function (t) { t.setVisible(pd.open); });
    this.padKeys.forEach(function (k) { k.text.setVisible(pd.open); });
    if (!pd.open) return;
    pd.t++;
    if (pd.press && ++pd.press.t > 6) pd.press = null;
    // Granted: hold the message a moment, then open the tab. Denied: clear and try again.
    if (pd.state === 'granted' && pd.t > 55) { var side = pd.side; this.closeKeypad(); this.setTab(side, 'student'); return; }
    if (pd.state === 'denied' && pd.t > 45) { pd.state = null; pd.digits = ''; }
    var shake = pd.state === 'denied' && pd.t < 18 ? Math.round(Math.sin(pd.t * 1.9) * 6 * (1 - pd.t / 18)) : 0;
    var x = PAD.x + shake, y = PAD.y;
    g.fillStyle(0x000000, 0.6); g.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
    // The case: beige plastic, a darker rim, screws in the corners.
    g.fillStyle(0x1a1610, 1); g.fillRect(x - 3, y - 3, PAD.w + 6, PAD.h + 6);
    g.fillStyle(0xcfc6aa, 1); g.fillRect(x, y, PAD.w, PAD.h);
    g.fillStyle(0xe4dcc2, 1); g.fillRect(x, y, PAD.w, 3);
    g.fillStyle(0x9a927a, 1); g.fillRect(x, y + PAD.h - 3, PAD.w, 3);
    [[6, 6], [PAD.w - 9, 6], [6, PAD.h - 9], [PAD.w - 9, PAD.h - 9]].forEach(function (c) { g.fillStyle(0x7a735e, 1); g.fillRect(x + c[0], y + c[1], 3, 3); });
    // The LCD.
    var red = pd.state === 'denied', green = pd.state === 'granted';
    g.fillStyle(0x1a1610, 1); g.fillRect(x + 14, y + 38, PAD.w - 28, 44);
    g.fillStyle(red ? (pd.t % 8 < 4 ? 0x5a1010 : 0x3a0a0a) : green ? 0x10401c : 0x1c2e1c, 1); g.fillRect(x + 16, y + 40, PAD.w - 32, 40);
    g.fillStyle(0xffffff, 0.06); for (var sl = 0; sl < 40; sl += 3) g.fillRect(x + 16, y + 40 + sl, PAD.w - 32, 1);
    var shown = '';
    for (var i = 0; i < 4; i++) shown += (i ? ' ' : '') + (pd.digits[i] || '_');
    this.padLcd.setText(shown).setFont(red ? 'pf_r' : green ? 'pf_c' : 'pf_g').setX(C.VIEW_W / 2 + shake);
    this.padMsg.setText(red ? 'ACCESS DENIED' : green ? 'ACCESS GRANTED' : '').setFont(red ? 'pf_r' : 'pf_c').setScale(red || green ? 1.5 : 1).setX(C.VIEW_W / 2 + shake);
    this.padTitle.setX(C.VIEW_W / 2 + shake); this.padSub.setX(C.VIEW_W / 2 + shake); this.padHint.setX(C.VIEW_W / 2 + shake);
    // The keys: raised gray buttons, pushed in when pressed.
    this.padKeys.forEach(function (k) {
      var down = pd.press && pd.press.label === k.label, kx = k.x + shake, ky = k.y + (down ? 2 : 0);
      g.fillStyle(0x4a4538, 1); g.fillRect(kx, k.y + 3, PAD.kw, PAD.kh);
      g.fillStyle(down ? 0x8a8474 : k.label === 'X' ? 0xb86a5a : k.label === 'CLR' ? 0xa8a088 : 0xb8b2a0, 1); g.fillRect(kx, ky, PAD.kw, PAD.kh - 1);
      g.fillStyle(0xffffff, 0.25); g.fillRect(kx, ky, PAD.kw, 2);
      k.text.setPosition(kx + PAD.kw / 2, ky + PAD.kh / 2 - (k.label.length > 1 ? 3 : 6));
    });
  };

  SelectScene.prototype.showing = function (side) {
    if (side === 0) return true;
    return this.mode === 'versus' || (this.twoStep() && this.step === 1);
  };

  // Arcade, Detention and the Timed Test: player 1 picks, the CPU's opponents follow.
  SelectScene.prototype.solo = function () { return this.mode === 'arcade' || this.mode === 'timed' || this.mode === 'detention'; };

  // Training and VS CPU: one player picks both fighters, one after the other.
  SelectScene.prototype.twoStep = function () { return this.mode === 'training' || this.mode === 'cpu'; };

  SelectScene.prototype.update = function () {
    this.t++;
    this.drawKeypad();
    var t = this.t, self = this, view = this.view, cards = this.cards[view];
    // Card portraits: head and shoulders, on the fighter's colour.
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      card.g.clear();
      card.g.fillStyle(0x2a2440, 1); card.g.fillRect(card.x, card.y, CARD_W, CARD_H);
      card.g.fillStyle(FG.shade(card.tint, 0.45), 1); card.g.fillRect(card.x + 2, card.y + 2, CARD_W - 4, CARD_H - 14);
      if (card.def.student) { // notebook paper behind the students
        card.g.fillStyle(0xf4f1e6, 0.18); card.g.fillRect(card.x + 2, card.y + 2, CARD_W - 4, CARD_H - 14);
        card.g.fillStyle(0x5a7ad8, 0.35); for (var nl = 8; nl < CARD_H - 14; nl += 7) card.g.fillRect(card.x + 2, card.y + 2 + nl, CARD_W - 4, 1);
        card.g.fillStyle(0xd84a4a, 0.5); card.g.fillRect(card.x + 10, card.y + 2, 1, CARD_H - 14);
      } else {
        card.g.fillStyle(0xffffff, 0.06); for (var sl = 0; sl < CARD_H - 14; sl += 4) card.g.fillRect(card.x + 2, card.y + 2 + sl, CARD_W - 4, 1);
      }
      FG.updatePose(card.puppet, t);
      var def = card.def, sc = 2.3 * def.scale, base = FG.getPose(def, 'idle');
      card.puppet.x = card.x + CARD_W / 2 - base[4] * sc;
      var cardLocked = this.locked(this.activeSide(), def) || (this.solo() && def.boss && !FG.settings.wilsonUnlocked);
      FG.drawFighter(card.g, card.puppet, { scale: 2.3, groundY: card.y + 34 + base[5] * sc, noShadow: true, flash: cardLocked ? 0x07060c : null });
      card.name.setText(cardLocked ? '???' : def.name);
    }
    // The tab bar: the shown tab underlined, a P1 / P2 tag over each player's tab.
    var tg = this.tabG;
    tg.clear();
    tg.lineStyle(1, 0x5a4b2c, 1); tg.lineBetween(C.VIEW_W / 2 - 88, 158, C.VIEW_W / 2 + 88, 158);
    this.tabs.forEach(function (tb) {
      if (tb.side === view) { tg.fillStyle(0xffd23f, 1); tg.fillRect(tb.x - 38, 156, 76, 3); }
    });
    for (var sd = 0; sd < 2; sd++) {
      var mark = this.tabMarks[sd], show = this.showing(sd), tb2 = this.tabs[this.tab[sd] === 'teacher' ? 0 : 1];
      mark.setVisible(show).setPosition(tb2.x + (sd ? 8 : -22), 133);
    }
    // Cursor frames.
    var fg = this.frameG;
    fg.clear();
    for (i = 0; i < cards.length; i++) {
      var cd = cards[i];
      fg.lineStyle(1, 0x5a4b2c, 1); fg.strokeRect(cd.x, cd.y, CARD_W, CARD_H);
    }
    for (var side = 0; side < 2; side++) {
      if (!this.showing(side) || this.tab[side] !== view) continue;
      var c2 = cards[Math.min(this.cursor[side], cards.length - 1)];
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

  // Arcade. As a teacher: the students first (in a shuffled order), then the other
  // teachers (shuffled), your own mirror match, PEDERSEN, the cover fighter, and last
  // WILSON, the boss (if you are one of them, your mirror match takes their place).
  // As a student: every teacher, shuffled, ending with WILSON.
  var BOSSES = ['pedersen', 'wilson'];
  function shuffled(list) {
    for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = list[i]; list[i] = list[j]; list[j] = x; }
    return list;
  }
  FG.arcadeRun = function (p1, timed) {
    var me = FG.fighterById(p1), ids = function (l) { return l.map(function (d) { return d.id; }); }, ladder;
    if (me && me.side === 'student') {
      ladder = shuffled(ids(FG.rosterSide('teacher').filter(function (d) { return d.id !== 'wilson'; })));
      if (FG.fighterById('wilson')) ladder.push('wilson');
    } else {
      var others = shuffled(ids(FG.rosterSide('teacher').filter(function (d) { return d.id !== p1 && BOSSES.indexOf(d.id) < 0; })));
      ladder = shuffled(ids(FG.rosterSide('student'))).concat(others);
      if (BOSSES.indexOf(p1) < 0) ladder.push(p1);
      BOSSES.forEach(function (b) { if (FG.fighterById(b)) ladder.push(b); });
    }
    return { p1: p1, ladder: ladder, index: 0, continues: 0, started: Date.now(), timed: !!timed, frames: 0 };
  };

  // Detention: survival. One opponent after another at random (never the same twice
  // in a row), on one health bar that only partly refills between fights.
  FG.detentionRun = function (p1) { return { kind: 'detention', p1: p1, beaten: 0, health: null, meter: 0, last: null }; };
  FG.detentionFight = function (run) {
    var pool = FG.ROSTER.filter(function (d) { return d.id !== run.last; });
    var p2 = pool[Math.floor(Math.random() * pool.length)].id;
    run.last = p2;
    return { mode: 'detention', p1: run.p1, p2: p2, stage: FG.fighterById(p2).homeStage, arcade: run };
  };
  // The CPU gets tougher the more you've beaten.
  FG.detentionLevel = function (beaten) { return FG.AI_ORDER[Math.min(FG.AI_ORDER.length - 1, Math.floor(beaten / 2.5))]; };
  // Seconds as m:ss.
  FG.clock = function (secs) { secs = Math.floor(secs); return Math.floor(secs / 60) + ':' + ('0' + secs % 60).slice(-2); };
  // Straight into the first fight (skipping the ladder screen).
  FG.arcadeStart = function (p1) { return FG.arcadeFight(FG.arcadeRun(p1)); };
  // Scene data for the arcade fight at run.index.
  FG.arcadeFight = function (run) {
    var p2 = run.ladder[run.index];
    return { mode: 'arcade', p1: run.p1, p2: p2, stage: FG.fighterById(p2).homeStage, arcade: run };
  };

  FG.SelectScene = SelectScene;
})();
