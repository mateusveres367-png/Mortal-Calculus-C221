// The fight scene: reads the keyboard, runs the fixed-step simulation, and draws.
(function () {
  var C = FG.C;
  var STEP_MS = 1000 / C.FPS;

  var FightScene = function () { Phaser.Scene.call(this, { key: 'fight' }); };
  FightScene.prototype = Object.create(Phaser.Scene.prototype);
  FightScene.prototype.constructor = FightScene;

  FightScene.prototype.create = function () {
    FG.makeFonts(this);
    this.stage = new FG.Stage(this);
    this.world = this.add.graphics().setDepth(0);
    this.hud = new FG.Hud(this);
    this.effects = new FG.Effects();
    this.dummy = new FG.Dummy();
    this.swapped = false;
    // Training mode options (changed from the training menu or hotkeys).
    this.training = {
      p2Human: false, refill: true, showData: true, showInputs: true,
      showBoxes: false, slow: false, startPos: 'center'
    };
    this.histories = [new FG.InputHistory(), new FG.InputHistory()];
    this.inputDisplays = [new FG.InputDisplay(this, 0), new FG.InputDisplay(this, 1)];
    this.refillTimer = [0, 0];
    this.acc = 0;
    this.tickCount = 0;
    this.impact = null;
    this.newMatch();
    this.setupKeys();
    this.setupButtons();
    this.menu = new FG.TrainingMenu(this, this.menuItems());
    // The page can be loaded headlessly for testing; expose the scene there.
    window.FG_SCENE = this;
  };

  FightScene.prototype.newMatch = function () {
    var a = FG.FIGHTERS[this.swapped ? 1 : 0], b = FG.FIGHTERS[this.swapped ? 0 : 1];
    this.match = new FG.Match(a, b);
    this.match.reset(this.training.startPos);
    this.effects = new FG.Effects();
    this.impact = null;
    this.histories[0].clear(); this.histories[1].clear();
    this.hud.clear();
    this.hud.showBanner('FIGHT!', '', 50);
  };

  // Rows of the training menu. Each has a label, a value() and change(delta).
  FightScene.prototype.menuItems = function () {
    var self = this, t = this.training, d = this.dummy;
    function toggle(key, label) {
      return { label: label, value: function () { return t[key] ? 'ON' : 'OFF'; }, change: function () { t[key] = !t[key]; } };
    }
    function dummyItem(key, label) {
      return { label: label, value: function () { return d.label(key); }, change: function (delta) { d.change(key, delta); } };
    }
    var positions = ['center', 'left', 'right'], posLabel = { center: 'CENTER', left: 'LEFT WALL', right: 'RIGHT WALL' };
    return [
      { label: 'PLAYER 2', value: function () { return t.p2Human ? 'HUMAN' : 'DUMMY'; }, change: function () { t.p2Human = !t.p2Human; } },
      dummyItem('stance', 'DUMMY STANCE'),
      dummyItem('action', 'DUMMY ACTION'),
      dummyItem('recovery', 'DUMMY KNOCKDOWN'),
      dummyItem('breaks', 'DUMMY THROW BREAKS'),
      { label: 'HEALTH', value: function () { return t.refill ? 'REFILL' : 'NORMAL'; }, change: function () { t.refill = !t.refill; } },
      toggle('showData', 'FRAME DATA'),
      toggle('showInputs', 'INPUT DISPLAY'),
      toggle('showBoxes', 'HITBOXES'),
      toggle('slow', 'SLOW MOTION'),
      { label: 'START POSITION', value: function () { return posLabel[t.startPos]; },
        change: function (delta) { t.startPos = positions[(positions.indexOf(t.startPos) + delta + 3) % 3]; self.newMatch(); } },
      { label: 'FIGHTERS', value: function () { var f = self.match.fighters; return f[0].def.name + ' VS ' + f[1].def.name; },
        change: function () { self.swapped = !self.swapped; self.newMatch(); } },
      { label: 'RESET (R)', value: function () { return ''; }, change: function () { self.newMatch(); self.menu.setOpen(false); } },
      { label: 'CLOSE (ESC)', value: function () { return ''; }, change: function () { self.menu.setOpen(false); } }
    ];
  };

  // Clickable on-screen buttons: MENU and RESET.
  FightScene.prototype.setupButtons = function () {
    var self = this;
    this.buttonG = this.add.graphics().setScrollFactor(0).setDepth(54);
    this.buttons = [
      { label: 'MENU (ESC)', x: C.VIEW_W / 2 - 66, onClick: function () { self.menu.setOpen(!self.menu.open); } },
      { label: 'RESET (R)', x: C.VIEW_W / 2 + 66, onClick: function () { self.newMatch(); } }
    ];
    this.buttons.forEach(function (b) {
      b.text = FG.text(self, b.x, 47, b.label, 'w').setOrigin(0.5, 0).setDepth(55);
      b.w = b.label.length * 7 + 12;
      var zone = self.add.zone(b.x, 51, b.w, 13).setScrollFactor(0).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', function () { FG.Sfx.unlock(); b.onClick(); });
      zone.on('pointerover', function () { b.hover = true; });
      zone.on('pointerout', function () { b.hover = false; });
    });
  };

  FightScene.prototype.drawButtons = function () {
    var g = this.buttonG;
    g.clear();
    for (var i = 0; i < this.buttons.length; i++) {
      var b = this.buttons[i];
      g.fillStyle(b.hover ? 0x3c6fb0 : 0x000000, 0.75);
      g.fillRect(Math.round(b.x - b.w / 2), 44, b.w, 13);
      g.lineStyle(1, b.hover ? 0xffd23f : 0xd8c79a, 1);
      g.strokeRect(Math.round(b.x - b.w / 2), 44, b.w, 13);
    }
  };

  FightScene.prototype.setupKeys = function () {
    var K = Phaser.Input.Keyboard.KeyCodes;
    var kb = this.input.keyboard;
    this.keys1 = kb.addKeys({ left: K.A, right: K.D, up: K.W, down: K.S, p: K.J, k: K.K, h: K.L, ssIn: K.Q, ssOut: K.E });
    this.keys2 = kb.addKeys({
      left: K.LEFT, right: K.RIGHT, up: K.UP, down: K.DOWN,
      p: K.NUMPAD_ONE, k: K.NUMPAD_TWO, h: K.NUMPAD_THREE, ssIn: K.NUMPAD_FOUR, ssOut: K.NUMPAD_FIVE,
      p2: K.COMMA, k2: K.PERIOD, h2: K.FORWARD_SLASH, ssIn2: K.SEMICOLON, ssIn3: K.SEMICOLON_FIREFOX, ssOut2: K.QUOTES
    });
    kb.addCapture([K.ESC, K.ENTER, K.SPACE]);
    var self = this, t = this.training;
    kb.on('keydown', function (e) {
      FG.Sfx.unlock();
      if (self.menu.open) { self.menu.key(e.code); return; }
      switch (e.code) {
        case 'Escape': self.menu.setOpen(true); break;
        case 'Digit1': self.dummy.change('stance', 1); break;
        case 'Digit2': t.showBoxes = !t.showBoxes; break;
        case 'Digit3': t.showData = !t.showData; break;
        case 'Digit4': t.slow = !t.slow; break;
        case 'Digit5': self.swapped = !self.swapped; self.newMatch(); break;
        case 'Digit6': t.showInputs = !t.showInputs; break;
        case 'KeyR': self.newMatch(); break;
        case 'KeyM': FG.Sfx.muted = !FG.Sfx.muted; break;
        case 'KeyC': self.hud.setOverlay(!self.hud.overlayOn); break;
      }
    });
  };

  FightScene.prototype.readP1 = function () {
    var k = this.keys1;
    return { left: k.left.isDown, right: k.right.isDown, up: k.up.isDown, down: k.down.isDown,
      p: k.p.isDown, k: k.k.isDown, h: k.h.isDown, ssIn: k.ssIn.isDown, ssOut: k.ssOut.isDown };
  };

  FightScene.prototype.readP2 = function () {
    var k = this.keys2;
    return { left: k.left.isDown, right: k.right.isDown, up: k.up.isDown, down: k.down.isDown,
      p: k.p.isDown || k.p2.isDown, k: k.k.isDown || k.k2.isDown, h: k.h.isDown || k.h2.isDown,
      ssIn: k.ssIn.isDown || k.ssIn2.isDown || k.ssIn3.isDown, ssOut: k.ssOut.isDown || k.ssOut2.isDown };
  };

  // Test hook: override inputs for the next ticks (used by the headless smoke test).
  FightScene.prototype.forceInput = null;

  FightScene.prototype.update = function (time, delta) {
    // The training menu pauses the fight.
    this.acc = this.menu.open ? 0 : this.acc + Math.min(delta, 100) * (this.training.slow ? 0.25 : 1);
    while (this.acc >= STEP_MS) {
      this.tick();
      this.acc -= STEP_MS;
    }
    this.render();
  };

  FightScene.prototype.tick = function () {
    var m = this.match, f = m.fighters;
    var raw1 = this.readP1();
    var human = this.training.p2Human;
    f[1].holdGuard = false;
    var raw2 = human ? this.readP2() : this.dummy.input(f[1], f[0], m);
    if (this.forceInput) { var fi = this.forceInput(this.tickCount); if (fi) { raw1 = fi[0] || raw1; raw2 = fi[1] || raw2; } }
    this.histories[0].record(raw1, f[0].facing);
    this.histories[1].record(raw2, f[1].facing);

    var wasKo = m.koTimer > 0;
    m.step([raw1, raw2]);
    if (wasKo && m.koTimer === 0) { this.hud.clear(); this.hud.showBanner('FIGHT!', '', 50); }

    for (var i = 0; i < m.events.length; i++) {
      var ev = m.events[i];
      FG.Sfx.play(ev);
      if (ev.type !== 'whiff') this.effects.spawn(ev);
      if (ev.shake) this.effects.shake(ev.shake);
      if (ev.type === 'land' || ev.type === 'bounce') this.effects.shake(ev.type === 'bounce' ? 0.006 : 0.003);
      if (ev.type === 'hit' && !ev.ground) this.impact = { who: ev.defender, frames: ev.ch ? 4 : 2, color: ev.ch ? 0xffb347 : 0xffffff };
      if (ev.type === 'guardbreak') this.impact = { who: ev.defender, frames: 4, color: 0x5fd7ff };
      this.hud.onEvent(ev);
    }

    if (this.training.refill) this.refillHealth();
    this.effects.update();
    this.stage.update();
    this.hud.tick(m);
    if (this.impact && --this.impact.frames < 0) this.impact = null;
    this.tickCount++;
    FG.updatePose(f[0], this.tickCount);
    FG.updatePose(f[1], this.tickCount);
  };

  // Training: refill health a moment after a combo ends, so practice never stops.
  FightScene.prototype.refillHealth = function () {
    var m = this.match;
    if (m.koTimer > 0) return;
    for (var i = 0; i < 2; i++) {
      var f = m.fighters[i];
      if (f.health < f.def.health && f.actionable && m.combo[i].hits === 0) {
        if (++this.refillTimer[i] >= 50) { f.health = f.def.health; this.refillTimer[i] = 0; }
      } else {
        this.refillTimer[i] = 0;
      }
    }
  };

  FightScene.prototype.render = function () {
    var m = this.match, f = m.fighters, g = this.world;
    var mid = (f[0].x + f[1].x) / 2;
    var shake = this.effects.shakeOffset();
    var cam = this.cameras.main;
    cam.scrollX = Phaser.Math.Clamp(Math.round(mid - C.VIEW_W / 2), 0, C.WORLD_W - C.VIEW_W) + shake.x;
    cam.scrollY = shake.y;

    g.clear();
    // Draw the fighter further into the background first.
    var order = f[0].z > f[1].z ? [0, 1] : f[1].z > f[0].z ? [1, 0] : (f[0].state === 'attack' ? [1, 0] : [0, 1]);
    for (var i = 0; i < 2; i++) {
      var idx = order[i], fi = f[idx];
      var opts = { flash: null, jitter: 0 };
      if (this.impact && this.impact.who === idx) opts.flash = this.impact.color;
      // The victim trembles during hitstop.
      if (m.hitstop > 0 && (fi.state === 'hitstun' || fi.state === 'juggle' || fi.state === 'blockstun')) {
        opts.jitter = (this.tickCount % 2 ? 1 : -1) * (fi.state === 'blockstun' ? 1 : 2);
      }
      FG.drawFighter(g, fi, opts);
    }
    this.effects.draw(g);
    var t = this.training;
    if (t.showBoxes) { FG.drawBoxes(g, f[0]); FG.drawBoxes(g, f[1]); }

    var modeLabel = 'TRAINING   P2: ' + (t.p2Human ? 'HUMAN' : this.dummy.label('stance') +
      (this.dummy.get('action') !== 'none' ? ' + ' + this.dummy.label('action') : ''));
    this.hud.draw(m, { modeLabel: modeLabel, showData: t.showData, slow: t.slow });
    this.inputDisplays[0].draw(this.histories[0], t.showInputs);
    this.inputDisplays[1].draw(this.histories[1], t.showInputs);
    this.drawButtons();
  };

  FG.FightScene = FightScene;
})();
