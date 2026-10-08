// The fight scene: reads the keyboard (or a CPU), runs the fixed-step simulation, and draws.
// Modes:
//   training  practice with the dummy, frame data, combo trials (no rounds)
//   arcade    player 1 against a ladder of CPU opponents, best of three each
//   versus    player 1 against player 2, best of three
//   attract   the title screen's demo: short CPU vs CPU clips; any key goes back
(function () {
  var C = FG.C;
  var STEP_MS = 1000 / C.FPS;
  var ATTRACT_CLIPS = 3, CLIP_TICKS = 60 * 15; // demo: three clips of about 15 seconds

  // Scene data for attract clip n: a random matchup on a random stage.
  FG.attractClip = function (n) {
    var r = FG.ROSTER, a = Math.floor(Math.random() * r.length), b = (a + 1 + Math.floor(Math.random() * (r.length - 1))) % r.length;
    return { mode: 'attract', clip: n, p1: r[a].id, p2: r[b].id, stage: FG.STAGES[Math.floor(Math.random() * FG.STAGES.length)].id };
  };

  var FightScene = function () { Phaser.Scene.call(this, { key: 'fight' }); };
  FightScene.prototype = Object.create(Phaser.Scene.prototype);
  FightScene.prototype.constructor = FightScene;

  // data: { mode, p1, p2, stage, arcade } (arcade: the run, see FG.arcadeStart).
  FightScene.prototype.init = function (data) {
    data = data || {};
    this.mode = data.mode || 'training';
    this.arcade = data.arcade || null;
    this.clip = data.clip || 0;
    var roster = FG.ROSTER;
    this.ids = { p1: data.p1 || roster[0].id, p2: data.p2 || roster[Math.min(1, roster.length - 1)].id };
    // The stage: picked on stage select, or player 2's home stage.
    this.stageId = data.stage || FG.fighterById(this.ids.p2).homeStage || 'classroom';
  };

  FightScene.prototype.create = function () {
    FG.makeFonts(this);
    // PEDERSEN drives in on outdoor stages; his car is then part of the fight scene.
    var stageDef = FG.stageById(this.stageId);
    var carInWorld = !!stageDef.outdoor && (FG.fighterById(this.ids.p1).car || FG.fighterById(this.ids.p2).car);
    this.stage = new FG.Stage(this, { id: this.stageId, carInWorld: carInWorld });
    this.ghosts = this.add.graphics().setDepth(-1).setAlpha(0.45); // cancel afterimages
    this.world = this.add.graphics().setDepth(0);
    this.screenFlash = this.add.graphics().setScrollFactor(0).setDepth(40); // impact flashes over the world
    this.hud = new FG.Hud(this);
    this.effects = new FG.Effects();
    this.dummy = new FG.Dummy();
    // CPU players (arcade: player 2; attract: both).
    this.ai = [null, null];
    var seed = Math.floor(Math.random() * 100000);
    if (this.mode === 'arcade') this.ai[1] = new FG.AI(this.cpuLevel(), seed);
    if (this.mode === 'attract') { this.ai[0] = new FG.AI('hard', seed); this.ai[1] = new FG.AI('hard', seed + 1); }
    // Rounds: best of three with a timer, outside training.
    this.rounds = this.mode === 'training' ? null : new FG.Rounds({ seconds: this.mode === 'attract' ? 60 : FG.settings.time, toWin: 2 });
    this.phase = 'fight'; // round modes: 'announce' | 'fight' | 'roundEnd'
    this.phaseT = 0;
    this.intro = null;   // round intro animation in progress
    this.win = null;     // win screen after a K.O.
    // Training mode options (changed from the training menu or hotkeys).
    this.training = {
      p2Human: false, refill: true, showData: true, showInputs: true,
      showBoxes: false, slow: false, startPos: 'center'
    };
    if (this.mode !== 'training') { this.training.showData = false; this.training.showInputs = false; this.training.refill = false; }
    this.histories = [new FG.InputHistory(), new FG.InputHistory()];
    this.inputDisplays = [new FG.InputDisplay(this, 0), new FG.InputDisplay(this, 1)];
    this.refillTimer = [0, 0];
    this.acc = 0;
    this.tickCount = 0;
    this.impact = null;
    // Labels that float over a fighter (alternate stance, taunts).
    this.tags = [0, 1].map(function () { return FG.text(this, 0, 0, '', 'y').setOrigin(0.5, 1).setScrollFactor(1).setDepth(20); }, this);
    this.speech = new FG.SpeechBox(this, { mode: 'top' });                            // pre-round lines, win screen
    this.bubbles = [new FG.SpeechBox(this, { mode: 'head' }), new FG.SpeechBox(this, { mode: 'head' })]; // taunts, quips
    this.prevCombo = [0, 0];
    this.trials = new FG.ComboTrials(this);
    // Math that flies off big hits (each fighter's `glyphs`): a small pool of world texts.
    this.glyphs = [0, 1, 2, 3, 4, 5].map(function () { return { text: FG.text(this, 0, 0, '', 'y').setScrollFactor(1).setOrigin(0.5, 0.5).setDepth(21), t: 0 }; }, this);
    // Full-screen cut-ins for big moments and the round-start VS panel.
    this.cutin = new FG.CutIn(this);
    this.newMatch({ intro: true });
    this.setupKeys();
    this.setupButtons();
    this.menu = this.mode === 'training' ? new FG.TrainingMenu(this, this.menuItems()) : new FG.TrainingMenu(this, this.pauseItems(), { title: 'PAUSED' });
    this.hud.roundMode = !!this.rounds;
    // The world camera zooms on big moments; a second camera draws the HUD, unzoomed.
    this.uiCam = this.cameras.add(0, 0, C.VIEW_W, C.VIEW_H);
    this.sortCameras();
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
    this.zoom = null;     // { t, amount, x, y, hold }: a quick zoom-in on a big hit
    this.slowmo = null;   // { frames, scale }: slow motion on a big finish
    this.win = null;
    this.speech.hide();
    this.bubbles[0].hide(); this.bubbles[1].hide();
    this.prevCombo = [0, 0];
    this.cutin.stop();
    this.cutinUsed = [false, false]; // one cut-in per combo
    this.cutinCool = 0;              // ticks before another may play
    this.histories[0].clear(); this.histories[1].clear();
    this.hud.clear();
    var f = this.match.fighters;
    // Only intros start with LOPEZ's blazer on; he takes it off during his.
    for (var i = 0; i < 2; i++) { f[i]._blazer = !!(opts.intro && f[i].def.look.blazer); f[i]._pending = null; }
    // PEDERSEN's car parks behind his starting spot (and drives in during his intro).
    this.cars = [];
    for (var c = 0; c < 2; c++) {
      if (!f[c].def.car || !this.stage.outdoor) continue; // indoors he walks in
      var park = Math.max(C.WALL_L + 80, Math.min(C.WALL_R - 80, f[c].x - f[c].facing * 95));
      this.cars.push({ owner: c, parkX: park, x: park, facing: f[c].facing, door: 0, spin: 0 });
      f[c]._hidden = false;
    }
    if (opts.intro) this.startIntro();
    else { this.intro = null; if (!opts.quiet) this.hud.showBanner('FIGHT!', '', 50); }
  };

  // The car intro: drive in, stop, open the door, PEDERSEN steps out, door closes.
  FightScene.prototype.updateCars = function () {
    var f = this.match.fighters;
    for (var i = 0; i < this.cars.length; i++) {
      var car = this.cars[i], who = f[car.owner];
      if (!this.intro) { car.x = car.parkX; car.door = 0; who._hidden = false; who._drawX = null; continue; }
      var t = this.intro.t, start = car.parkX - car.facing * 420;
      if (t <= 40) {
        var u = t / 40, e = 1 - (1 - u) * (1 - u);
        var nx = start + (car.parkX - start) * e;
        car.spin += (nx - car.x) * 0.12 * car.facing;
        car.x = nx;
      }
      car.door = t < 48 ? 0 : t < 56 ? (t - 48) / 8 : t < 66 ? 1 : t < 74 ? 1 - (t - 66) / 8 : 0;
      who._hidden = t < 56;
      var doorX = car.parkX + car.facing * 12;
      who._drawX = t < 56 ? null : t < 68 ? doorX + (who.x - doorX) * ((t - 56) / 12) : null;
    }
  };

  FightScene.prototype.drawCars = function (g) {
    for (var i = 0; i < this.cars.length; i++) {
      var car = this.cars[i];
      FG.drawCar(g, car.x, C.GROUND_Y - 26, { scale: 0.82, facing: car.facing, door: car.door, wheelSpin: car.spin });
    }
  };

  // Round intro: each fighter's intro animation while they trade lines in speech
  // boxes (rivalry exchanges where they apply), then FIGHT. Any button skips it.
  FightScene.prototype.startIntro = function () {
    var f = this.match.fighters, len = 0;
    for (var c = 0; c < this.cars.length; c++) this.cars[c].x = this.cars[c].parkX - this.cars[c].facing * 420;
    for (var i = 0; i < 2; i++) {
      f[i]._override = { anim: f[i].def.intro, t: 0 };
      len = Math.max(len, FG.animLength(f[i].def.intro));
    }
    // Schedule the dialogue. PEDERSEN talks once he's out of the car.
    var t = this.cars.length ? 66 : 36, lines = FG.preRoundLines(f[0].def, f[1].def);
    // The VS panel opens with each fighter's first line; the rest are spoken after it.
    var vsLines = ['', ''];
    lines = lines.filter(function (l) {
      if (vsLines[l.speaker]) return true;
      vsLines[l.speaker] = l.text;
      return false;
    });
    this.cutin.playVs(f[0].def, f[1].def, vsLines);
    var dialogue = lines.map(function (l) {
      var d = { at: t, speaker: l.speaker, text: l.text, dur: FG.SpeechBox.readTime(l.text) };
      t += d.dur;
      return d;
    });
    this.intro = { t: 0, len: Math.max(len + 10, t + 6), dialogue: dialogue };
    this.hud.showBanner(f[0].def.name + ' VS ' + f[1].def.name, '', 34);
  };

  // The line being spoken at intro frame t, if any.
  FightScene.prototype.introLine = function () {
    var d = this.intro && this.intro.dialogue;
    if (!d) return null;
    for (var i = 0; i < d.length; i++) if (this.intro.t >= d[i].at && this.intro.t < d[i].at + d[i].dur) return d[i];
    return null;
  };

  FightScene.prototype.endIntro = function () {
    var f = this.match.fighters;
    for (var i = 0; i < 2; i++) { f[i]._override = null; f[i]._blazer = false; }
    this.intro = null;
    this.cutin.stop();
    this.speech.hide();
    this.updateCars();
    if (this.rounds) { this.startRound(); return; }
    this.hud.showBanner('FIGHT!', '', 50);
    // Show the controls once per session, after the first intro.
    if (!FG.seenControls) { FG.seenControls = true; this.hud.setOverlay(true); }
  };

  // --- Rounds (arcade, versus, attract) -------------------------------------------

  // How hard the CPU fights: the OPTIONS setting, a notch easier for the first
  // two arcade opponents.
  FightScene.prototype.cpuLevel = function () {
    var order = FG.AI_ORDER, base = order.indexOf(FG.settings.difficulty);
    if (this.arcade && this.arcade.index < 2) base = Math.max(0, base - 1);
    return order[Math.max(0, base)];
  };

  // ROUND n (or FINAL ROUND), READY, FIGHT.
  FightScene.prototype.startRound = function () {
    this.phase = 'announce';
    this.phaseT = 0;
    var r = this.rounds;
    this.hud.showBanner(r.isFinal() ? 'FINAL ROUND' : 'ROUND ' + r.round, '', 48, { scale: 4, y: 120 });
    FG.Sfx.ui('confirm');
  };

  // Called every tick in round modes, after the match steps.
  FightScene.prototype.roundTick = function (advanced) {
    var r = this.rounds, m = this.match;
    this.phaseT++;
    if (this.phase === 'announce') {
      if (this.phaseT === 50) this.hud.showBanner('READY', '', 34, { scale: 4, y: 120 });
      if (this.phaseT >= 86) { this.phase = 'fight'; this.phaseT = 0; this.hud.showBanner('FIGHT!', '', 40, { scale: 5, y: 116 }); FG.Sfx.ui('confirm'); }
      return;
    }
    if (this.phase === 'fight') {
      if (m.winner !== null) r.end(m.winner, 'ko', m);
      else if (advanced) {
        r.tick(m);
        if (r.result) {
          this.hud.showBanner(r.result.winner < 0 ? 'DRAW' : 'TIME', r.result.winner < 0 ? '' : m.fighters[r.result.winner].def.name + ' WINS THE ROUND', 120, { scale: 4, y: 120 });
          FG.Sfx.ui('confirm');
        }
      }
      if (r.result) { this.phase = 'roundEnd'; this.phaseT = 0; }
      return;
    }
    if (this.phase === 'roundEnd') {
      if (this.phaseT === 80 && r.result.perfect) { this.hud.showBanner('PERFECT', '', 60, { scale: 4, y: 160 }); this.stage.cheer(3, true); }
      if (this.phaseT >= 170) {
        var mw = r.matchWinner();
        if (mw !== null) { this.startWin(mw); return; }
        r.next();
        this.newMatch({ quiet: true });
        this.startRound();
      }
    }
  };

  // Rows of the pause menu (arcade, versus).
  FightScene.prototype.pauseItems = function () {
    var self = this;
    var items = [{ label: 'RESUME', value: function () { return ''; }, change: function () { self.menu.setOpen(false); } }];
    if (this.mode === 'versus') items.push({ label: 'RESTART MATCH', value: function () { return ''; }, change: function () { self.menu.setOpen(false); self.rematch(); } });
    items.push({ label: 'EASY COMBOS', value: function () { return FG.settings.easyCombos ? 'ON' : 'OFF'; }, change: function () { FG.settings.easyCombos = !FG.settings.easyCombos; FG.saveSettings(); } });
    items.push({ label: 'SOUND', value: function () { return FG.Sfx.muted ? 'OFF' : 'ON'; }, change: function () { FG.Sfx.muted = !FG.Sfx.muted; FG.settings.sound = !FG.Sfx.muted; FG.saveSettings(); } });
    items.push({ label: 'CHARACTER SELECT', value: function () { return ''; }, change: function () { self.toSelect(); } });
    items.push({ label: 'QUIT TO TITLE', value: function () { return ''; }, change: function () { self.toTitle(); } });
    return items;
  };

  FightScene.prototype.rematch = function () {
    if (this.rounds) this.rounds = new FG.Rounds({ seconds: this.rounds.seconds, toWin: this.rounds.toWin });
    this.newMatch({ intro: true });
  };

  // Attract: the next clip, or back to the title after the last.
  FightScene.prototype.nextClip = function () {
    if (this.clip + 1 >= ATTRACT_CLIPS) { this.toTitle(); return; }
    this.scene.start('fight', FG.attractClip(this.clip + 1));
  };

  FightScene.prototype.toTitle = function () {
    this.scene.start('title', { menu: this.mode !== 'attract' });
  };

  // Arcade: on to the next opponent, or the ending after the last one.
  FightScene.prototype.nextArcade = function () {
    var run = this.arcade;
    run.index++;
    if (run.index >= run.ladder.length) { this.scene.start('ending', run); return; }
    this.scene.start('fight', FG.arcadeFight(run));
  };

  // Arcade: lost the match. Continue (same opponent) or game over.
  FightScene.prototype.continueArcade = function () {
    this.arcade.continues++;
    this.scene.start('fight', FG.arcadeFight(this.arcade));
  };

  // Win screen: the winner's victory animation and a random victory line.
  FightScene.prototype.startWin = function (winner) {
    var m = this.match;
    if (winner == null) winner = m.winner;
    var w = m.fighters[winner], l = m.fighters[1 - winner];
    var lines = w.def.victoryLines;
    this.win = { winner: winner, t: 0 };
    w._override = { anim: w.def.victory, t: 0, loop: true };
    l._override = { anim: l.def.defeat, t: 0, loop: true };
    w._gesture = null; w._face = null;
    this.speech.show(w.def.name, lines[Math.floor(Math.random() * lines.length)]);
    this.bubbles[0].hide(); this.bubbles[1].hide();
    var sub = 'ENTER: REMATCH   ESC: CHARACTER SELECT', score = this.rounds ? '  ' + this.rounds.wins[winner] + '-' + this.rounds.wins[1 - winner] : '';
    if (this.mode === 'arcade') {
      var last = this.arcade.index + 1 >= this.arcade.ladder.length;
      if (winner === 0) sub = last ? 'ENTER: CONTINUE' : 'NEXT: ' + FG.fighterById(this.arcade.ladder[this.arcade.index + 1]).name + '   ENTER: FIGHT';
      else { sub = ''; this.win.cont = 10 * 60; } // the continue countdown
    }
    if (this.mode === 'attract') sub = 'PRESS ENTER';
    this.hud.showBanner(w.def.name + ' WINS' + score, sub, 100000, { scale: 3, y: 150 });
    if (this.rounds) this.stage.react('ko');
  };

  // --- Combo trials ---------------------------------------------------------------

  FightScene.prototype.toggleTrials = function () {
    var t = this.training;
    if (this.trials.active) {
      this.trials.stop();
      // Put the dummy and start position back the way they were.
      if (this.trialSaved) { this.dummy.settings = this.trialSaved.dummy; t.startPos = this.trialSaved.startPos; t.refill = this.trialSaved.refill; }
      this.trialSaved = null;
      this.newMatch();
      return;
    }
    this.trialSaved = { dummy: Object.assign({}, this.dummy.settings), startPos: t.startPos, refill: t.refill };
    this.trials.start(this.match.fighters[0].def);
  };

  // Set the scene up for a trial: a dummy that just stands there (or jabs, for routes
  // that start from the opponent's jab), at the wall for wall routes.
  FightScene.prototype.setupTrial = function (c) {
    var d = this.dummy, t = this.training;
    d.settings = { stance: 0, action: c.oppPlan ? 1 : 0, recovery: 0, breaks: 0 };
    d.timer = 0;
    t.refill = true;
    t.startPos = c.wall ? 'right' : 'center';
    this.newMatch({ quiet: true });
    if (c.dist) {
      var f = this.match.fighters, mid = (f[0].x + f[1].x) / 2;
      f[0].x = mid - c.dist / 2; f[1].x = mid + c.dist / 2;
    }
  };

  FightScene.prototype.toSelect = function () {
    this.scene.start('select', { mode: this.mode === 'attract' ? 'training' : this.mode, p1: this.ids.p1, p2: this.ids.p2, stage: this.stageId });
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
      { label: 'EASY COMBOS', value: function () { return FG.settings.easyCombos ? 'ON' : 'OFF'; }, change: function () { FG.settings.easyCombos = !FG.settings.easyCombos; FG.saveSettings(); } },
      toggle('showData', 'FRAME DATA'),
      toggle('showInputs', 'INPUT DISPLAY'),
      toggle('showBoxes', 'HITBOXES'),
      toggle('slow', 'SLOW MOTION'),
      { label: 'START POSITION', value: function () { return posLabel[t.startPos]; },
        change: function (delta) { t.startPos = positions[(positions.indexOf(t.startPos) + delta + 3) % 3]; self.newMatch(); } },
      { label: 'COMBO TRIALS (7)', value: function () { return self.trials.active ? 'ON' : 'OFF'; }, change: function () { self.toggleTrials(); } },
      { label: 'TRIAL (8/9)', value: function () { var c = self.trials.active && self.trials.current(); return c ? (self.trials.index + 1) + '/' + self.trials.list.length + ' ' + c.name : '-'; },
        change: function (delta) { if (self.trials.active) self.trials.select(self.trials.index + delta); } },
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
    if (this.trials.active) this.trials.start(FG.fighterById(this.ids.p1)); else this.newMatch();
  };

  FightScene.prototype.setupKeys = function () {
    var K = Phaser.Input.Keyboard.KeyCodes;
    var kb = this.input.keyboard;
    this.keys1 = kb.addKeys({ left: K.A, right: K.D, up: K.W, down: K.S, p: K.J, k: K.K, h: K.L, ssIn: K.Q, ssOut: K.E, t: K.T });
    this.keys2 = kb.addKeys({
      left: K.LEFT, right: K.RIGHT, up: K.UP, down: K.DOWN,
      p: K.NUMPAD_ONE, k: K.NUMPAD_TWO, h: K.NUMPAD_THREE, ssIn: K.NUMPAD_FOUR, ssOut: K.NUMPAD_FIVE,
      p2: K.COMMA, k2: K.PERIOD, h2: K.FORWARD_SLASH, ssIn2: K.SEMICOLON, ssIn3: K.SEMICOLON_FIREFOX, ssOut2: K.QUOTES,
      t: K.NUMPAD_SIX, t2: K.CLOSED_BRACKET
    });
    kb.addCapture([K.ESC, K.ENTER, K.SPACE]);
    var self = this, t = this.training;
    TAPS = {};
    kb.on('keydown', function (e) {
      FG.Sfx.unlock();
      TAPS[e.keyCode] = true;
      if (self.mode === 'attract') { self.toTitle(); return; } // any key ends the demo
      if (self.menu.open) { self.menu.key(e.code); return; }
      if (self.intro) {
        if (['Enter', 'Space', 'Escape', 'KeyJ', 'KeyK', 'KeyL'].indexOf(e.code) >= 0) self.endIntro();
        return;
      }
      if (self.win) {
        if (self.win.t < 20) return;
        var ok = e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyJ', esc = e.code === 'Escape' || e.code === 'KeyK';
        if (self.mode === 'arcade') {
          if (self.win.winner === 0) { if (ok) self.nextArcade(); }
          else if (self.win.cont > 0) { if (ok) self.continueArcade(); else if (esc) self.win.cont = 1; }
          return;
        }
        if (ok) self.rematch();
        else if (esc) self.toSelect();
        return;
      }
      if (self.mode !== 'training') {
        if (e.code === 'Escape') self.menu.setOpen(true);
        if (e.code === 'KeyM') FG.Sfx.muted = !FG.Sfx.muted;
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
        case 'Digit7': self.toggleTrials(); break;
        case 'Digit8': if (self.trials.active) self.trials.select(self.trials.index - 1); break;
        case 'Digit9': if (self.trials.active) self.trials.select(self.trials.index + 1); break;
        case 'KeyR': if (self.trials.active) self.trials.select(self.trials.index); else self.newMatch(); break;
        case 'KeyM': FG.Sfx.muted = !FG.Sfx.muted; break;
        case 'KeyC': self.hud.setOverlay(!self.hud.overlayOn); break;
      }
    });
  };

  // Raw input for player i this tick: keyboard, the training dummy, or the CPU.
  FightScene.prototype.inputFor = function (i) {
    var f = this.match.fighters, m = this.match;
    f[i].easy = !this.ai[i] && FG.settings.easyCombos && (i === 0 || this.mode === 'versus' || this.training.p2Human);
    if (this.ai[i]) return this.ai[i].input(f[i], f[1 - i], m);
    if (i === 0) return this.readP1();
    if (this.mode === 'versus' || (this.mode === 'training' && this.training.p2Human)) { f[1].holdGuard = false; return this.readP2(); }
    f[1].holdGuard = false;
    return this.dummy.input(f[1], f[0], m);
  };

  // A key counts as down this tick if it is held, or was tapped since the last tick
  // (a quick tap can start and end between two ticks; taps are recorded from keydown).
  var TAPS = {};
  function on(key) { return key.isDown || !!TAPS[key.keyCode]; }

  FightScene.prototype.readP1 = function () {
    var k = this.keys1;
    return { left: on(k.left), right: on(k.right), up: on(k.up), down: on(k.down),
      p: on(k.p), k: on(k.k), h: on(k.h), ssIn: on(k.ssIn), ssOut: on(k.ssOut), t: on(k.t) };
  };

  FightScene.prototype.readP2 = function () {
    var k = this.keys2;
    return { left: on(k.left), right: on(k.right), up: on(k.up), down: on(k.down),
      p: on(k.p) || on(k.p2), k: on(k.k) || on(k.k2), h: on(k.h) || on(k.h2),
      ssIn: on(k.ssIn) || on(k.ssIn2) || on(k.ssIn3), ssOut: on(k.ssOut) || on(k.ssOut2), t: on(k.t) || on(k.t2) };
  };

  // Test hook: override inputs for the next ticks (used by the headless smoke test).
  FightScene.prototype.forceInput = null;

  FightScene.prototype.update = function (time, delta) {
    // The training menu pauses the fight.
    var rate = (this.training.slow && !this.intro && !this.win ? 0.25 : 1) * (this.slowmo ? this.slowmo.scale : 1);
    this.acc = this.menu.open ? 0 : this.acc + Math.min(delta, 100) * rate;
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
    // The intro waits while the VS panel is up (the demo skips the rest of it).
    if (this.intro && this.cutin.busy()) this.cutin.tick();
    else if (this.intro && this.mode === 'attract') this.endIntro();
    else if (this.intro) {
      this.intro.t++;
      // Intro events, e.g. LOPEZ taking off his blazer.
      for (var e = 0; e < 2; e++) {
        var evs = f[e].def.introEvents || [];
        for (var k = 0; k < evs.length; k++) {
          if (evs[k].t !== this.intro.t) continue;
          if (evs[k].blazerOff && f[e]._blazer) {
            f[e]._blazer = false;
            this.effects.spawn({ type: 'blazer', x: f[e].x, y: 70, facing: f[e].facing, color: f[e].def.look.blazer });
          }
        }
      }
      this.updateCars();
      var line = this.introLine();
      if (line && line.at === this.intro.t) this.speech.show(f[line.speaker].def.name, line.text, line.dur);
      if (this.intro.t >= this.intro.len) this.endIntro();
    }
    this.speech.tick();
    if (this.win) {
      this.win.t++;
      // Arcade continue countdown, then GAME OVER and back to the title.
      if (this.win.cont > 0) {
        this.win.cont--;
        var secs = Math.ceil(this.win.cont / 60);
        this.hud.showBanner('CONTINUE? ' + secs, 'ENTER: CONTINUE   ESC: GIVE UP', 100000, { scale: 3, y: 150 });
        if (this.win.cont === 0) { this.win.over = 150; this.hud.showBanner('GAME OVER', '', 100000, { scale: 4, y: 140 }); }
      } else if (this.win.over && --this.win.over === 0) {
        this.toTitle();
        return;
      }
      if (this.mode === 'attract' && this.win.t > 150) { this.nextClip(); return; }
    }
    this.bubbles[0].tick(); this.bubbles[1].tick();
    this.effects.update();
    this.stage.update();
    this.hud.tick(m);
  };

  FightScene.prototype.tick = function () {
    if (this.intro || this.win) { this.presentationTick(); return; }
    var m = this.match, f = m.fighters;
    // A cut-in freezes the fight while it plays (presses still buffer: TAPS are kept).
    if (this.cutin.busy()) { this.cutin.tick(); this.tickCount++; this.stage.update(); return; }
    if (this.cutinCool > 0) this.cutinCool--;
    var raw1 = this.inputFor(0), raw2 = this.inputFor(1);
    TAPS = {}; // taps since the last tick have been read
    // Nobody moves until FIGHT!, or after the round is over.
    if (this.rounds && this.phase !== 'fight') { raw1 = FG.emptyRaw(); raw2 = FG.emptyRaw(); }
    if (this.forceInput) { var fi = this.forceInput(this.tickCount); if (fi) { raw1 = fi[0] || raw1; raw2 = fi[1] || raw2; } }
    this.histories[0].record(raw1, f[0].facing);
    this.histories[1].record(raw2, f[1].facing);

    var wasKo = m.koTimer > 0, frameBefore = m.frame;
    m.step([raw1, raw2]);
    if (wasKo && m.koTimer === 0 && !this.rounds) { this.hud.clear(); this.hud.showBanner('FIGHT!', '', 50); }
    if (this.rounds) this.roundTick(m.frame > frameBefore);
    if (this.win || m !== this.match) return; // the match just ended, or the next round just started

    for (var i = 0; i < m.events.length; i++) {
      var ev = m.events[i];
      if ((ev.type === 'hit' || ev.type === 'block') && ev.move && !ev.throw) {
        ev.impact = FG.impactKind(ev.move);
        // The body reacts to the kind of blow (motion.js).
        var dfn = f[ev.defender];
        dfn._react = ev.type === 'block' ? { kind: 'block', t: 0 } : { kind: ev.impact, t: 0, scale: ev.ch ? 1.3 : 1 };
      }
      FG.Sfx.play(ev);
      // A cancel leaves an afterimage of the move it came out of.
      if (ev.type === 'cancel' && f[ev.fighter]._pose) {
        var cf = f[ev.fighter];
        cf._ghost = { pose: cf._pose.slice(), x: cf.x, y: cf.y, facing: cf.facing, t: 0 };
      }
      if (ev.type !== 'whiff') this.effects.spawn(ev);
      if (ev.type === 'hit') {
        this.cutInFor(ev);
        this.bigMoment(ev);
        var bigHit = ev.ch || ev.launch || ev.throw || ev.finisher || (ev.move && ev.move.strength === 'heavy');
        if (bigHit && !ev.ground) this.spawnGlyph(ev);
      }
      else if (ev.shake) this.effects.shake(ev.shake);
      if (ev.type === 'land' || ev.type === 'bounce') this.effects.shake(ev.type === 'bounce' ? 0.006 : 0.003);
      if (ev.type === 'hit' && !ev.ground) this.impact = { who: ev.defender, frames: ev.ch ? 4 : 2, color: ev.ch ? 0xffb347 : 0xffffff };
      if (ev.type === 'guardbreak') this.impact = { who: ev.defender, frames: 4, color: 0x5fd7ff };
      this.personality(ev);
      this.hud.onEvent(ev);
      this.trials.onEvent(ev);
    }

    // A big juggle combo that just ended: the landing plays in slow motion.
    for (var lj = 0; lj < m.events.length; lj++) {
      var le = m.events[lj];
      if (le.type === 'land' && f[le.fighter].state === 'down' && this.prevCombo[1 - le.fighter] >= C.BIG_COMBO) this.startSlowmo(20, 0.4);
    }
    if (this.slowmo && --this.slowmo.frames <= 0) this.slowmo = null;
    this.trials.tick(m);
    if (this.zoom) this.zoom.t++;
    if (m.over && !this.win && !this.rounds) this.startWin();
    if (this.mode === 'attract' && this.tickCount > CLIP_TICKS) { this.nextClip(); return; }
    this.chargeFeedback();
    this.bubbles[0].tick(); this.bubbles[1].tick();
    // A big combo just ended: the attacker may say something.
    for (var q = 0; q < 2; q++) {
      var hits = m.combo[q].hits;
      if (this.prevCombo[q] >= 4 && hits === 0 && !m.koTimer) this.quip(1 - q, 0.7);
      if (hits === 0) this.cutinUsed[1 - q] = false;
      this.prevCombo[q] = hits;
    }
    if (this.training.refill) this.refillHealth();
    for (var g = 0; g < 2; g++) {
      if (f[g]._tag && --f[g]._tag.t <= 0) f[g]._tag = null;
      if (f[g]._ghost && ++f[g]._ghost.t > 10) f[g]._ghost = null;
      // Start a queued gesture once the fighter is back to neutral.
      var pg = f[g]._pending;
      if (pg && (f[g].state === 'idle' || --pg.ttl <= 0)) {
        if (f[g].state === 'idle' && f[g].def.gestures && f[g].def.gestures[pg.name]) f[g]._gesture = { anim: f[g].def.gestures[pg.name], t: 0 };
        f[g]._pending = null;
      }
    }
    this.effects.update();
    this.updateGlyphs();
    this.stage.update();
    this.hud.tick(m);
    if (this.impact && --this.impact.frames < 0) this.impact = null;
    this.tickCount++;
    var frozen = { frozen: m.hitstop > 0 };
    FG.updatePose(f[0], this.tickCount, frozen);
    FG.updatePose(f[1], this.tickCount, frozen);
  };

  // Cut-ins: a launcher landing as a counter hit, or a combo reaching 10 hits. At most
  // one per combo, with a cooldown, and never during combo trials.
  FightScene.prototype.cutInFor = function (ev) {
    if (this.trials.active || this.cutinCool > 0 || this.cutinUsed[ev.attacker] || ev.ko || !ev.move) return;
    var text = null;
    var demo = this.mode === 'attract'; // the demo shows them off more often
    if (ev.ch && ev.launch || demo && ev.launch) text = ev.move.label;
    else if (ev.hits === (demo ? 6 : C.CUTIN_HITS)) text = ev.hits + ' HIT COMBO';
    if (!text) return;
    this.playCutIn(ev.attacker, text);
  };

  FightScene.prototype.playCutIn = function (who, text) {
    var f = this.match.fighters;
    this.cutinUsed[who] = true;
    this.cutinCool = C.CUTIN_COOLDOWN;
    this.cutin.play(f[who].def, f[who].x <= f[1 - who].x ? 0 : 1, text);
  };

  // A piece of the attacker's math pops off a big hit and floats up.
  FightScene.prototype.spawnGlyph = function (ev) {
    var def = this.match.fighters[ev.attacker].def, list = def.glyphs;
    if (!list || !list.length) return;
    var slot = this.glyphs.filter(function (g) { return g.t <= 0; })[0];
    if (!slot) return;
    slot.t = 46; slot.vx = (Math.random() - 0.5) * 0.8; slot.x = ev.x; slot.y = C.GROUND_Y - (ev.y || 60) - 14;
    slot.text.setText(list[Math.floor(Math.random() * list.length)]).setFont(ev.ch ? 'pf_o' : 'pf_y').setScale(ev.ch || ev.launch ? 2 : 1.5).setVisible(true);
  };

  FightScene.prototype.updateGlyphs = function () {
    for (var i = 0; i < this.glyphs.length; i++) {
      var g = this.glyphs[i];
      if (g.t <= 0) { g.text.setVisible(false); continue; }
      g.t--; g.y -= 0.8; g.x += g.vx;
      g.text.setPosition(Math.round(g.x), Math.round(g.y)).setAlpha(Math.min(1, g.t / 12)).setVisible(g.t > 0);
    }
  };

  // Screen feel for a hit: shake scales with damage; launchers and combo finishers
  // zoom in; the final hit of a big combo, and a round-winning hit, go slow-motion.
  FightScene.prototype.bigMoment = function (ev) {
    var dmg = ev.damage || 0;
    this.effects.shake(Math.min(0.016, 0.0012 + dmg * 0.00034) * (ev.ch ? 1.4 : 1));
    var y = ev.y || 60;
    if (ev.ko) { this.startZoom(0.22, ev.x, y, 40); this.startSlowmo(60, 0.3); return; }
    if (ev.launch) this.startZoom(0.1, ev.x, y + 20, 10);
    else if (ev.finisher && !ev.bound && !ev.wall) this.startZoom(ev.hits >= C.BIG_COMBO ? 0.16 : 0.1, ev.x, y, ev.hits >= C.BIG_COMBO ? 18 : 8);
    else if (ev.bound) this.startZoom(0.07, ev.x, y, 6);
    // The last hit of a big combo: knockdowns, wall blasts and throws end it.
    if (ev.finisher && !ev.bound && ev.hits >= C.BIG_COMBO && (ev.knockdown || ev.wallBlast)) this.startSlowmo(28, 0.35);
  };

  FightScene.prototype.startZoom = function (amount, x, y, hold) {
    if (this.zoom && this.zoom.amount > amount && this.zoom.t < this.zoom.hold + 6) return;
    this.zoom = { t: 0, amount: amount, x: x, y: y, hold: hold || 8 };
  };

  FightScene.prototype.startSlowmo = function (frames, scale) {
    if (this.slowmo && this.slowmo.frames > frames) return;
    this.slowmo = { frames: frames, scale: scale };
  };

  // Zoom amount now: snaps in over 4 ticks, holds, eases back out over 24.
  FightScene.prototype.zoomLevel = function () {
    var z = this.zoom;
    if (!z) return 0;
    var t = z.t, k;
    if (t < 4) k = t / 4;
    else if (t < 4 + z.hold) k = 1;
    else k = 1 - Math.min(1, (t - 4 - z.hold) / 24);
    if (k <= 0 && t > 4) { this.zoom = null; return 0; }
    k = k * k * (3 - 2 * k);
    return z.amount * k;
  };

  // Every object fixed to the screen is drawn by the UI camera only, the rest by the
  // world camera only (so zooming the world leaves the HUD alone).
  FightScene.prototype.sortCameras = function () {
    if (!this.uiCam) return;
    var list = this.children.list, main = this.cameras.main;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o._camSorted) continue;
      o._camSorted = true;
      if (o.scrollFactorX === 0 && o.scrollFactorY === 0) main.ignore(o); else this.uiCam.ignore(o);
    }
  };

  // Order of Magnitude: sparks gather at the fist while charging; x10 / x100 at each level.
  FightScene.prototype.chargeFeedback = function () {
    var f = this.match.fighters;
    for (var i = 0; i < 2; i++) {
      var fi = f[i], m = fi.move;
      if (fi.state !== 'attack' || !m || !m.charge || !fi.chargeFrames) continue;
      var c = m.charge, fx = fi.x - fi.facing * 26 * fi.def.scale, fy = C.GROUND_Y - 62 * fi.def.scale;
      if (fi.chargeFrames === c.mid) { fi._tag = { text: 'X10', t: 40 }; FG.Sfx.ui('move'); }
      if (fi.chargeFrames === c.max) {
        fi._tag = { text: 'X100', t: 60 };
        this.effects.spawn({ type: 'grab', x: fx, y: C.GROUND_Y - fy });
        FG.Sfx.ui('confirm');
      }
      var a = Math.random() * Math.PI * 2, r = 18;
      this.effects.parts.push({ x: fx + Math.cos(a) * r, y: fy + Math.sin(a) * r, vx: -Math.cos(a) * 1.2, vy: -Math.sin(a) * 1.2,
        life: 14, max: 14, size: 2, color: fi.chargeFrames >= c.max ? 0xff4a3d : fi.chargeFrames >= c.mid ? 0xffd23f : 0xffffff });
    }
  };

  // A short line after a big combo or counter hit, `chance` of the time.
  FightScene.prototype.quip = function (i, chance) {
    var fi = this.match.fighters[i], b = this.bubbles[i];
    if (b.visible || Math.random() > chance || !fi.def.talk) return;
    var q = fi.def.talk.quips;
    b.show(fi.def.name, q[Math.floor(Math.random() * q.length)], 80);
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
        // The students in the background flinch at big hits and jump up for a K.O.
        if (ev.ko) this.stage.react('ko');
        else if (big || ev.ch || ev.finisher || ev.damage >= 18) this.stage.react('big');
        f[ev.defender]._face = { type: 'wince', t: 30 };
        // After a big hit: CHAI winces apologetically, LEE pushes up his glasses.
        if (big && a.def.bigHit) {
          if (a.def.bigHit.gesture) a._pending = { name: a.def.bigHit.gesture, ttl: 120 };
          if (a.def.bigHit.face) a._face = { type: a.def.bigHit.face, t: 50 };
        }
        // Counter hits sometimes get a word in.
        if (ev.ch) this.quip(ev.attacker, 0.5);
      }
    }
    // Taunt: say one of their lines.
    if (ev.type === 'whiff' && ev.move.taunt) {
      var tf = f[ev.fighter], tl = tf.def.talk.lines;
      this.bubbles[ev.fighter].show(tf.def.name, tl[Math.floor(Math.random() * tl.length)], 120);
    }
    if (ev.type === 'calculated') {
      f[ev.fighter]._tag = { text: 'CALCULATED', t: 60 };
    }
    if (ev.type === 'hit' && ev.calculated) this.hud.setLabel(ev.attacker, 'CALCULATED!');
    if (ev.type === 'hit' && ev.tip) this.hud.setLabel(ev.attacker, 'LONG ARMS!');
    if ((ev.type === 'hit' || ev.type === 'guardbreak') && ev.charge === 2) { this.hud.setLabel(ev.attacker, 'ORDER OF MAGNITUDE!'); this.effects.shake(0.012); }
    if (ev.type === 'parry') {
      this.hud.setLabel(ev.attacker, ev.label || 'PARRY!');
      if (f[ev.attacker].def.parryFace) f[ev.attacker]._face = { type: f[ev.attacker].def.parryFace, t: 30 };
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
    // The camera centres between the fighters; a zoom pulls it toward the impact.
    var zl = this.zoomLevel(), zoom = 1 + zl, zk = this.zoom ? zl / this.zoom.amount : 0;
    var cx = mid, cy = C.VIEW_H / 2;
    if (this.zoom) { cx += (this.zoom.x - mid) * 0.45 * zk; cy += (C.GROUND_Y - this.zoom.y - cy) * 0.35 * zk; }
    var halfW = C.VIEW_W / 2 / zoom, halfH = C.VIEW_H / 2 / zoom;
    cx = Phaser.Math.Clamp(cx, halfW, C.WORLD_W - halfW);
    cy = Math.min(cy, C.VIEW_H - halfH); // never show below the bottom of the stage
    cam.setZoom(zoom);
    cam.scrollX = Math.round(cx - C.VIEW_W / 2) + shake.x;
    cam.scrollY = Math.round(cy - C.VIEW_H / 2) + shake.y;
    this.sortCameras();

    g.clear();
    this.drawCars(g);
    this.effects.drawBack(g);
    this.ghosts.clear();
    for (var gi = 0; gi < 2; gi++) {
      var gh = f[gi]._ghost;
      if (!gh) continue;
      this.ghosts.setAlpha(0.5 * (1 - gh.t / 10));
      FG.drawFighter(this.ghosts, { def: f[gi].def, x: gh.x, y: gh.y, z: f[gi].z, facing: gh.facing, _pose: gh.pose, _twist: 0 },
        { flash: 0x9fdcff, noShadow: true });
    }
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
      if (fi._hidden) continue;
      if (!fi._pose) FG.updatePose(fi, this.tickCount);
      if (fi._drawX != null) opts.x = fi._drawX;
      FG.drawFighter(g, fi, opts);
    }
    this.effects.draw(g);
    var sf = this.effects.screen, fl = this.screenFlash;
    fl.clear();
    if (sf) { fl.fillStyle(sf.color, sf.alpha * sf.life / sf.max); fl.fillRect(0, 0, C.VIEW_W, C.VIEW_H); }
    var t = this.training;
    if (t.showBoxes) { FG.drawBoxes(g, f[0]); FG.drawBoxes(g, f[1]); }

    // Floating labels: alternate stance.
    for (var k = 0; k < 2; k++) {
      var fk = f[k], tag = this.tags[k];
      tag.setText(this.win ? '' : fk._tag ? fk._tag.text : fk.stance === 'B' ? (fk.def.stanceName || 'STANCE') : '');
      tag.setPosition(Math.round(fk.x), Math.round(C.GROUND_Y - fk.y - 104 * fk.def.scale));
    }
    // Speech boxes are on the UI camera: place them where the (zoomed) world shows the fighter.
    var camX = cam.scrollX;
    function onScreen(wx) { return camX + (wx - camX - C.VIEW_W / 2) * zoom + C.VIEW_W / 2; }
    if (this.win) this.speech.draw(f[this.win.winner], camX, onScreen(f[this.win.winner].x));
    var spoken = this.introLine();
    if (spoken) { var sp = f[spoken.speaker]; this.speech.draw(sp, camX, onScreen(sp._drawX != null ? sp._drawX : sp.x)); }
    for (var bi = 0; bi < 2; bi++) this.bubbles[bi].draw(f[bi], camX, onScreen(f[bi].x));

    var modeLabel = this.modeLabel();
    var clean = !!(this.intro || this.win);
    var r = this.rounds;
    this.hud.draw(m, { modeLabel: clean && this.mode === 'training' ? '' : modeLabel, showData: t.showData && !clean, slow: t.slow,
      rounds: r ? { wins: r.wins, toWin: r.toWin, time: r.timeLeft(), low: r.seconds && r.frames < 10 * 60 && this.phase === 'fight' } : null });
    // The intro and win screen hide the training clutter.
    this.inputDisplays[0].draw(this.histories[0], t.showInputs && !clean);
    this.inputDisplays[1].draw(this.histories[1], t.showInputs && !clean && !this.trials.active); // the trial panel sits there
    this.drawButtons(clean || this.mode !== 'training');
    if (clean) this.trials.hide(); else this.trials.draw();
    this.cutin.draw();
  };

  FightScene.prototype.modeLabel = function () {
    var t = this.training;
    switch (this.mode) {
      case 'arcade': return 'ARCADE   ' + (this.arcade.index + 1) + '/' + this.arcade.ladder.length + '   CPU ' + FG.AI_LEVELS[this.ai[1].level].name;
      case 'versus': return 'VERSUS';
      case 'attract': return this.tickCount % 60 < 40 ? 'DEMO PLAY   PRESS ENTER' : 'DEMO PLAY';
    }
    if (this.trials.active) return 'TRAINING   COMBO TRIALS';
    return 'TRAINING   P2: ' + (t.p2Human ? 'HUMAN' : this.dummy.label('stance') + (this.dummy.get('action') !== 'none' ? ' + ' + this.dummy.label('action') : ''));
  };

  FG.FightScene = FightScene;
})();
