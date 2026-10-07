// The fight scene: reads the keyboard, runs the fixed-step simulation, and draws.
(function () {
  var C = FG.C;
  var STEP_MS = 1000 / C.FPS;

  var FightScene = function () { Phaser.Scene.call(this, { key: 'fight' }); };
  FightScene.prototype = Object.create(Phaser.Scene.prototype);
  FightScene.prototype.constructor = FightScene;

  // data: { p1, p2 } fighter ids from the select screen.
  FightScene.prototype.init = function (data) {
    data = data || {};
    var roster = FG.ROSTER;
    this.ids = { p1: data.p1 || roster[0].id, p2: data.p2 || roster[Math.min(1, roster.length - 1)].id };
  };

  FightScene.prototype.create = function () {
    FG.makeFonts(this);
    this.stage = new FG.Stage(this, { home: FG.fighterById(this.ids.p2) });
    this.world = this.add.graphics().setDepth(0);
    this.hud = new FG.Hud(this);
    this.effects = new FG.Effects();
    this.dummy = new FG.Dummy();
    this.intro = null;   // round intro animation in progress
    this.win = null;     // win screen after a K.O.
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
    // Labels that float over a fighter (alternate stance, taunts).
    this.tags = [0, 1].map(function () { return FG.text(this, 0, 0, '', 'y').setOrigin(0.5, 1).setScrollFactor(1).setDepth(20); }, this);
    this.speech = new FG.SpeechBox(this);
    this.newMatch({ intro: true });
    this.setupKeys();
    this.setupButtons();
    this.menu = new FG.TrainingMenu(this, this.menuItems());
    // The page can be loaded headlessly for testing; expose the scene there.
    window.FG_SCENE = this;
  };

  // opts.intro plays both fighters' round intros first.
  FightScene.prototype.newMatch = function (opts) {
    opts = opts || {};
    this.match = new FG.Match(FG.fighterById(this.ids.p1), FG.fighterById(this.ids.p2));
    this.match.autoReset = false; // K.O. shows the win screen instead
    this.match.reset(this.training.startPos);
    this.effects = new FG.Effects();
    this.impact = null;
    this.win = null;
    this.speech.hide();
    this.histories[0].clear(); this.histories[1].clear();
    this.hud.clear();
    var f = this.match.fighters;
    for (var i = 0; i < 2; i++) { f[i]._blazer = !!f[i].def.look.blazer; f[i]._pending = null; }
    if (opts.intro) this.startIntro();
    else { this.intro = null; this.hud.showBanner('FIGHT!', '', 50); }
  };

  // Round intro: each fighter's intro animation, then READY / FIGHT. Any button skips it.
  FightScene.prototype.startIntro = function () {
    var f = this.match.fighters, len = 0;
    for (var i = 0; i < 2; i++) {
      f[i]._override = { anim: f[i].def.intro, t: 0 };
      len = Math.max(len, FG.animLength(f[i].def.intro));
    }
    this.intro = { t: 0, len: len + 10 };
    this.hud.showBanner(f[0].def.name + ' VS ' + f[1].def.name, '', len - 20);
  };

  FightScene.prototype.endIntro = function () {
    var f = this.match.fighters;
    for (var i = 0; i < 2; i++) { f[i]._override = null; f[i]._blazer = false; }
    this.intro = null;
    this.hud.showBanner('FIGHT!', '', 50);
    // Show the controls once per session, after the first intro.
    if (!FG.seenControls) { FG.seenControls = true; this.hud.setOverlay(true); }
  };

  // Win screen: the winner's victory animation and a random victory line.
  FightScene.prototype.startWin = function () {
    var m = this.match, w = m.fighters[m.winner], l = m.fighters[1 - m.winner];
    var lines = w.def.victoryLines;
    this.win = { winner: m.winner, t: 0 };
    w._override = { anim: w.def.victory, t: 0, loop: true };
    l._override = { anim: l.def.defeat, t: 0, loop: true };
    w._gesture = null; w._face = null;
    this.speech.show(w.def.name, lines[Math.floor(Math.random() * lines.length)]);
    this.hud.showBanner(w.def.name + ' WINS', 'ENTER: REMATCH   ESC: CHARACTER SELECT', 100000, { scale: 3, y: 150 });
  };

  FightScene.prototype.toSelect = function () {
    this.scene.start('select', { p1: this.ids.p1, p2: this.ids.p2 });
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
      { label: 'SWAP SIDES', value: function () { var f = self.match.fighters; return f[0].def.name + ' VS ' + f[1].def.name; },
        change: function () { self.swapSides(); } },
      { label: 'CHARACTER SELECT', value: function () { return ''; }, change: function () { self.toSelect(); } },
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

  FightScene.prototype.drawButtons = function (hidden) {
    var g = this.buttonG;
    g.clear();
    for (var i = 0; i < this.buttons.length; i++) {
      var b = this.buttons[i];
      b.text.setVisible(!hidden);
      if (hidden) continue;
      g.fillStyle(b.hover ? 0x3c6fb0 : 0x000000, 0.75);
      g.fillRect(Math.round(b.x - b.w / 2), 44, b.w, 13);
      g.lineStyle(1, b.hover ? 0xffd23f : 0xd8c79a, 1);
      g.strokeRect(Math.round(b.x - b.w / 2), 44, b.w, 13);
    }
  };

  FightScene.prototype.swapSides = function () {
    var p1 = this.ids.p1;
    this.ids.p1 = this.ids.p2; this.ids.p2 = p1;
    this.newMatch();
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
      if (self.intro) {
        if (['Enter', 'Space', 'Escape', 'KeyJ', 'KeyK', 'KeyL'].indexOf(e.code) >= 0) self.endIntro();
        return;
      }
      if (self.win) {
        if (self.win.t < 20) return;
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyJ') self.newMatch();
        else if (e.code === 'Escape' || e.code === 'KeyK') self.toSelect();
        return;
      }
      switch (e.code) {
        case 'Escape': self.menu.setOpen(true); break;
        case 'Digit1': self.dummy.change('stance', 1); break;
        case 'Digit2': t.showBoxes = !t.showBoxes; break;
        case 'Digit3': t.showData = !t.showData; break;
        case 'Digit4': t.slow = !t.slow; break;
        case 'Digit5': self.swapSides(); break;
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
    this.acc = this.menu.open ? 0 : this.acc + Math.min(delta, 100) * (this.training.slow && !this.intro && !this.win ? 0.25 : 1);
    while (this.acc >= STEP_MS) {
      this.tick();
      this.acc -= STEP_MS;
    }
    this.render();
  };

  // Intro and win screen: animate the fighters but don't run the fight.
  FightScene.prototype.presentationTick = function () {
    var m = this.match, f = m.fighters;
    this.tickCount++;
    for (var i = 0; i < 2; i++) {
      if (f[i]._override) f[i]._override.t++;
      FG.updatePose(f[i], this.tickCount);
    }
    if (this.intro) {
      // LOPEZ-style intros take something off partway through.
      if (++this.intro.t >= this.intro.len) this.endIntro();
    }
    if (this.win) this.win.t++;
    this.effects.update();
    this.stage.update();
    this.hud.tick(m);
  };

  FightScene.prototype.tick = function () {
    if (this.intro || this.win) { this.presentationTick(); return; }
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
      this.personality(ev);
      this.hud.onEvent(ev);
    }

    if (m.over && !this.win) this.startWin();
    if (this.training.refill) this.refillHealth();
    for (var g = 0; g < 2; g++) {
      // Start a queued gesture once the fighter is back to neutral.
      var pg = f[g]._pending;
      if (pg && (f[g].state === 'idle' || --pg.ttl <= 0)) {
        if (f[g].state === 'idle' && f[g].def.gestures && f[g].def.gestures[pg.name]) f[g]._gesture = { anim: f[g].def.gestures[pg.name], t: 0 };
        f[g]._pending = null;
      }
    }
    this.effects.update();
    this.stage.update();
    this.hud.tick(m);
    if (this.impact && --this.impact.frames < 0) this.impact = null;
    this.tickCount++;
    FG.updatePose(f[0], this.tickCount);
    FG.updatePose(f[1], this.tickCount);
  };

  // Personality reactions to match events: gestures, expressions, the crowd.
  FightScene.prototype.personality = function (ev) {
    var f = this.match.fighters;
    if (ev.type === 'hit' || ev.type === 'grab') {
      var a = f[ev.attacker];
      if (ev.feint) {
        a._pending = { name: 'wag', ttl: 120 };
        this.hud.setLabel(ev.attacker, 'FAKED OUT!');
      }
      if (ev.type === 'hit') {
        var big = ev.move && (ev.move.strength === 'heavy' || ev.move.strength === 'launch' || ev.ko);
        this.stage.cheer((big ? 2 : 1) * (a.def.crowdFavorite ? 2 : 1), !!a.def.crowdFavorite);
        f[ev.defender]._face = { type: 'wince', t: 30 };
      }
    }
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

    // Floating labels: alternate stance.
    for (var k = 0; k < 2; k++) {
      var fk = f[k], tag = this.tags[k];
      tag.setText(fk.stance === 'B' && !this.win ? 'PIECEWISE' : '');
      tag.setPosition(Math.round(fk.x), Math.round(C.GROUND_Y - fk.y - 104 * fk.def.scale));
    }
    if (this.win) this.speech.draw(f[this.win.winner], this.cameras.main.scrollX);

    var modeLabel = 'TRAINING   P2: ' + (t.p2Human ? 'HUMAN' : this.dummy.label('stance') +
      (this.dummy.get('action') !== 'none' ? ' + ' + this.dummy.label('action') : ''));
    var clean = !!(this.intro || this.win);
    this.hud.draw(m, { modeLabel: clean ? '' : modeLabel, showData: t.showData && !clean, slow: t.slow });
    // The intro and win screen hide the training clutter.
    this.inputDisplays[0].draw(this.histories[0], t.showInputs && !clean);
    this.inputDisplays[1].draw(this.histories[1], t.showInputs && !clean);
    this.drawButtons(clean);
  };

  FG.FightScene = FightScene;
})();
