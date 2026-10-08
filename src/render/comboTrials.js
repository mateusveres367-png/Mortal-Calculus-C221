// Combo trials (training mode): each fighter's combo routes, easy to hard. The panel
// lists the route's inputs, one per hit, and checks them off as they land. Drop the
// combo or use the wrong move and it starts over; land it all and the next trial loads.
// A timing bar under the list shows when to press: each input's window (the frames on
// which it still works), a cursor running from your first hit, and marks for your presses.
(function () {
  var C = FG.C;
  var W = 248, X = C.VIEW_W - W - 8, Y = 64, LINE = 11, MAX_STEPS = 7;
  var ORDER = { easy: 0, medium: 1, hard: 2 };

  function ComboTrials(scene) {
    this.scene = scene;
    this.active = false;
    this.list = [];
    this.index = 0;
    this.progress = 0;   // hits of the route landed so far, in order
    this.status = null;  // { text, font, t, complete }
    this.done = FG.trialsDone || (FG.trialsDone = {}); // completed this session
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(52);
    var T = function (y, col) { return FG.text(scene, X + 8, y, '', col).setDepth(53); };
    this.title = T(Y + 4, 'y');
    this.name = T(Y + 16, 'w');
    this.setup = T(Y + 28, 'o');
    this.lines = [];
    for (var k = 0; k < MAX_STEPS; k++) this.lines.push(T(Y + 42 + k * LINE, 'w'));
    this.hint = T(0, 'g');
    this.barLabels = [];
    for (k = 0; k < 8; k++) this.barLabels.push(FG.text(scene, 0, 0, '', 'w').setDepth(53).setScale(0.75).setOrigin(0.5, 1));
    this.windows = null;  // FG.routeWindows for the current route
    this.t0 = null;       // game frame of the route's first press, once it has landed
    this.presses = [];    // frames (from t0) of the player's button presses
    this.lastStamps = {};
    this.statusText = FG.text(scene, C.VIEW_W / 2, 200, '', 'y', 3).setOrigin(0.5, 0.5).setDepth(53);
    this.hide();
  }

  // The fighter's routes, easiest first.
  ComboTrials.prototype.setFighter = function (def) {
    this.def = def;
    this.list = def.combos.map(function (c, i) { return { c: c, i: i }; })
      .sort(function (a, b) { return (ORDER[a.c.difficulty] - ORDER[b.c.difficulty]) || a.i - b.i; })
      .map(function (e) { return e.c; });
  };

  ComboTrials.prototype.current = function () { return this.list[this.index]; };
  ComboTrials.prototype.key = function (c) { return this.def.id + ':' + c.name; };

  ComboTrials.prototype.start = function (def, index) {
    this.active = true;
    this.setFighter(def);
    this.select(index || 0);
  };

  ComboTrials.prototype.stop = function () {
    this.active = false;
    this.hide();
  };

  ComboTrials.prototype.select = function (i) {
    var n = this.list.length;
    this.index = ((i % n) + n) % n;
    this.progress = 0;
    this.status = null;
    this.t0 = null;
    this.presses = [];
    this.scene.setupTrial(this.current());
    // The route's timing windows against the dummy (worked out once per trial).
    var c = this.current();
    this.windows = c.plan ? FG.routeWindows(this.def, this.scene.match.fighters[1].def, c) : null;
  };

  ComboTrials.prototype.hide = function () {
    this.g.clear();
    [this.title, this.name, this.setup, this.hint, this.statusText].concat(this.lines, this.barLabels).forEach(function (t) { t.setText(''); });
  };

  // Hits by player 1 move the trial along.
  ComboTrials.prototype.onEvent = function (ev) {
    // An ultimate's first hit counts as one step ('ultimate'); the rest are its cinematic.
    if (ev.type === 'ulthit' && ev.n === 0) ev = { type: 'hit', attacker: ev.attacker, hits: ev.hits, move: { id: 'ultimate', startup: 1 } };
    if (!this.active || ev.type !== 'hit' || ev.attacker !== 0) return;
    if (this.status && this.status.complete) return;
    var c = this.current(), want = c.hits;
    if (ev.hits === 1 && this.progress > 0) this.progress = 0; // a fresh combo starts over
    if (ev.hits === this.progress + 1 && ev.move.id === want[this.progress]) {
      if (this.progress === 0) this.startClock(ev);
      this.progress++;
      FG.Sfx.ui('move');
      if (this.progress === want.length) {
        if (/CALCULATED/.test(c.notation) && !ev.calculated) {
          this.fail('NO CALCULATED BONUS');
          return;
        }
        this.done[this.key(c)] = true;
        this.status = { text: 'TRIAL COMPLETE!', font: 'pf_y', t: 110, complete: true };
        FG.Sfx.ui('confirm');
        FG.Sfx.cheer(0.8);
      }
    } else if (this.progress > 0) {
      this.fail('WRONG MOVE');
    }
  };

  // The timing bar's clock starts from the first input's press (the hit landed
  // `startup - 1` frames after it).
  ComboTrials.prototype.startClock = function (ev) {
    var m = this.scene.match, keys = this.windows && this.windows.map(function (w) { return w.frame; });
    this.t0 = m.frame - (ev.move.startup - 1) - (keys ? keys[0] : 0);
    this.presses = [];
    this.lastStamps = Object.assign({}, m.buffers[0].pressed);
  };

  ComboTrials.prototype.fail = function (text) {
    this.progress = 0;
    this.t0 = null;
    this.status = { text: text, font: 'pf_r', t: 50 };
    FG.Sfx.ui('move');
  };

  // Once per tick: notice a dropped combo, run the status timer, advance after a win.
  ComboTrials.prototype.tick = function (match) {
    if (!this.active) return;
    var c = this.current();
    if (this.progress > 0 && this.progress < c.hits.length && match.combo[1].hits === 0) this.fail('DROPPED - TRY AGAIN');
    // Record the player's presses on the timing bar.
    if (this.t0 !== null) {
      var st = match.buffers[0].pressed, self = this;
      ['p', 'k', 'h', 'up'].forEach(function (b) {
        if (st[b] !== self.lastStamps[b] && st[b] > 0) self.presses.push({ f: st[b] - self.t0, b: b });
      });
      this.lastStamps = Object.assign({}, st);
      if (match.frame - this.t0 > this.barEnd() + 30 && !(this.status && this.status.complete)) this.t0 = null;
    }
    if (this.status && --this.status.t <= 0) {
      var complete = this.status.complete;
      this.status = null;
      if (complete) this.select(this.index + 1);
    }
  };

  ComboTrials.prototype.draw = function () {
    if (!this.active) return;
    var c = this.current(), def = this.def, st = FG.comboSteps(c), g = this.g;
    var n = Math.min(MAX_STEPS, st.steps.length);
    var bar = !!(this.windows && this.windows.length > 1);
    var h = 50 + n * LINE + 14 + (bar ? 30 : 0);
    g.clear();
    g.fillStyle(0x07060c, 0.78); g.fillRect(X, Y, W, h);
    g.lineStyle(1, this.status && this.status.complete ? 0xffd23f : 0x5a4b2c, 1); g.strokeRect(X, Y, W, h);
    this.title.setText('COMBO TRIAL ' + (this.index + 1) + '/' + this.list.length + '  ' + c.difficulty.toUpperCase());
    this.title.setFont(c.difficulty === 'hard' ? 'pf_r' : c.difficulty === 'medium' ? 'pf_o' : 'pf_c');
    this.name.setText(c.name + (this.done[this.key(c)] ? '  *DONE*' : ''));
    this.setup.setText(st.setup ? 'SETUP: ' + st.setup : '');
    for (var k = 0; k < MAX_STEPS; k++) {
      var line = this.lines[k];
      if (k >= n) { line.setText(''); continue; }
      var m = def.moves[c.hits[k]], hit = k < this.progress, next = k === this.progress;
      line.setText((hit ? '[X] ' : next ? '[>] ' : '[ ] ') + st.steps[k] + (m ? '  ' + m.label : ''));
      line.setFont(hit ? 'pf_c' : next ? 'pf_y' : 'pf_w');
      if (line.width > W - 14) line.setText((hit ? '[X] ' : next ? '[>] ' : '[ ] ') + st.steps[k]);
    }
    this.hint.setPosition(X + 8, Y + 44 + n * LINE + (bar ? 30 : 0)).setText('8/9 PREV/NEXT TRIAL   7 EXIT');
    this.drawBar(bar ? Y + 46 + n * LINE : null);
    var s = this.status;
    if (s) {
      var pop = s.complete ? Math.max(0, (s.t - 96) / 14) : 0;
      this.statusText.setText(s.text).setFont(s.complete && s.t % 8 < 4 ? 'pf_w' : s.font).setScale(3 + pop * 2).setVisible(true);
    } else {
      this.statusText.setText('');
    }
  };

  ComboTrials.prototype.barEnd = function () {
    var w = this.windows;
    return w && w.length ? w[w.length - 1].hi + 12 : 60;
  };

  // The timing bar: press windows (done: blue, next: yellow, later: grey), the
  // planned frame of each press, the clock, and the player's presses (white).
  ComboTrials.prototype.drawBar = function (y) {
    var k;
    for (k = 0; k < this.barLabels.length; k++) this.barLabels[k].setText('');
    if (y === null) return;
    var g = this.g, w = this.windows, x0 = X + 8, width = W - 16, end = this.barEnd();
    var fx = function (f) { return x0 + Math.max(0, Math.min(width, f / end * width)); };
    var by = y + 12;
    g.fillStyle(0x1b1830, 1); g.fillRect(x0, by, width, 8);
    // Which step each window belongs to: windows map to plan keys; a step with
    // "UP, ..." has two keys. Count hits to know which are done.
    var stepOf = [], s = -1;
    for (k = 0; k < w.length; k++) { if (!/^(UP|F|B)$/.test(w[k].token)) s++; stepOf.push(Math.max(0, s + (/^(UP|F|B)$/.test(w[k].token) ? 1 : 0))); }
    // The opening input starts the clock.
    g.fillStyle(0xffffff, 1); g.fillRect(x0, by - 2, 1, 12);
    this.barLabels[0].setText(w[0].token).setPosition(x0 + 6, by - 2).setFont(this.progress === 0 ? 'pf_y' : 'pf_w');
    for (k = 1; k < w.length; k++) {
      var done = stepOf[k] < this.progress, next = stepOf[k] === this.progress;
      g.fillStyle(done ? 0x5fd7ff : next ? 0xffd23f : 0x6b6f7a, done || next ? 0.85 : 0.55);
      g.fillRect(Math.round(fx(w[k].lo)), by, Math.max(2, Math.round(fx(w[k].hi) - fx(w[k].lo))), 8);
      g.fillStyle(0xffffff, 1); g.fillRect(Math.round(fx(w[k].frame)), by - 2, 1, 12);
      if (k < this.barLabels.length) this.barLabels[k].setText(w[k].token).setPosition(Math.round(fx(w[k].frame)), by - 2).setFont(next ? 'pf_y' : 'pf_w');
    }
    for (k = 0; k < this.presses.length; k++) {
      var pf = this.presses[k].f;
      if (pf < 0 || pf > end) continue;
      g.fillStyle(0xffffff, 1); g.fillRect(Math.round(fx(pf)) - 1, by + 9, 3, 3);
    }
    if (this.t0 !== null) {
      var now = this.scene.match.frame - this.t0;
      g.fillStyle(0xff4a3d, 1); g.fillRect(Math.round(fx(now)), by - 3, 2, 14);
    }
  };

  FG.ComboTrials = ComboTrials;
})();
