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
    this.showBoxes = false;
    this.showData = true;
    this.slow = false;
    this.acc = 0;
    this.tickCount = 0;
    this.impact = null;
    this.newMatch();
    this.setupKeys();
    // The page can be loaded headlessly for testing; expose the scene there.
    window.FG_SCENE = this;
  };

  FightScene.prototype.newMatch = function () {
    var a = FG.FIGHTERS[this.swapped ? 1 : 0], b = FG.FIGHTERS[this.swapped ? 0 : 1];
    this.match = new FG.Match(a, b);
    this.effects = new FG.Effects();
    this.impact = null;
    this.hud.clear();
    this.hud.showBanner('FIGHT!', '', 50);
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
    var self = this;
    kb.on('keydown', function (e) {
      FG.Sfx.unlock();
      switch (e.code) {
        case 'Digit1': self.dummy.cycle(); break;
        case 'Digit2': self.showBoxes = !self.showBoxes; break;
        case 'Digit3': self.showData = !self.showData; break;
        case 'Digit4': self.slow = !self.slow; break;
        case 'Digit5': self.swapped = !self.swapped; self.newMatch(); break;
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
    this.acc += Math.min(delta, 100) * (this.slow ? 0.25 : 1);
    while (this.acc >= STEP_MS) {
      this.tick();
      this.acc -= STEP_MS;
    }
    this.render();
  };

  FightScene.prototype.tick = function () {
    var m = this.match, f = m.fighters;
    var raw1 = this.readP1();
    var raw2 = this.dummy.mode().id === 'human' ? this.readP2() : this.dummy.input(f[1], f[0]);
    if (this.forceInput) { var fi = this.forceInput(this.tickCount); if (fi) { raw1 = fi[0] || raw1; raw2 = fi[1] || raw2; } }

    var wasKo = m.koTimer > 0;
    m.step([raw1, raw2]);
    if (wasKo && m.koTimer === 0) { this.hud.clear(); this.hud.showBanner('FIGHT!', '', 50); }

    for (var i = 0; i < m.events.length; i++) {
      var ev = m.events[i];
      FG.Sfx.play(ev);
      if (ev.type === 'hit' || ev.type === 'block') {
        this.effects.spawn(ev);
        if (ev.shake) this.effects.shake(ev.shake);
        if (ev.type === 'hit') this.impact = { who: ev.defender, frames: ev.ch ? 4 : 2, color: ev.ch ? 0xffb347 : 0xffffff };
      } else if (ev.type === 'land') {
        this.effects.shake(0.003);
      }
      this.hud.onEvent(ev);
    }

    this.effects.update();
    this.stage.update();
    this.hud.tick(m);
    if (this.impact && --this.impact.frames < 0) this.impact = null;
    this.tickCount++;
    FG.updatePose(f[0], this.tickCount);
    FG.updatePose(f[1], this.tickCount);
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
    if (this.showBoxes) { FG.drawBoxes(g, f[0]); FG.drawBoxes(g, f[1]); }

    this.hud.draw(m, { modeLabel: this.dummy.mode().label, showData: this.showData, slow: this.slow });
  };

  FG.FightScene = FightScene;
})();
