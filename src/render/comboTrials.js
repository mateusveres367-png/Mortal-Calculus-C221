// Combo trials (training mode): each fighter's combo routes, easy to hard. The panel
// lists the route's inputs, one per hit, and checks them off as they land. Drop the
// combo or use the wrong move and it starts over; land it all and the next trial loads.
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
    this.scene.setupTrial(this.current());
  };

  ComboTrials.prototype.hide = function () {
    this.g.clear();
    [this.title, this.name, this.setup, this.hint, this.statusText].concat(this.lines).forEach(function (t) { t.setText(''); });
  };

  // Hits by player 1 move the trial along.
  ComboTrials.prototype.onEvent = function (ev) {
    if (!this.active || ev.type !== 'hit' || ev.attacker !== 0) return;
    if (this.status && this.status.complete) return;
    var c = this.current(), want = c.hits;
    if (ev.hits === 1 && this.progress > 0) this.progress = 0; // a fresh combo starts over
    if (ev.hits === this.progress + 1 && ev.move.id === want[this.progress]) {
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

  ComboTrials.prototype.fail = function (text) {
    this.progress = 0;
    this.status = { text: text, font: 'pf_r', t: 50 };
    FG.Sfx.ui('move');
  };

  // Once per tick: notice a dropped combo, run the status timer, advance after a win.
  ComboTrials.prototype.tick = function (match) {
    if (!this.active) return;
    var c = this.current();
    if (this.progress > 0 && this.progress < c.hits.length && match.combo[1].hits === 0) this.fail('DROPPED - TRY AGAIN');
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
    var h = 50 + n * LINE + 14;
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
    this.hint.setPosition(X + 8, Y + 44 + n * LINE).setText('8/9 PREV/NEXT TRIAL   7 EXIT');
    var s = this.status;
    if (s) {
      var pop = s.complete ? Math.max(0, (s.t - 96) / 14) : 0;
      this.statusText.setText(s.text).setFont(s.complete && s.t % 8 < 4 ? 'pf_w' : s.font).setScale(3 + pop * 2).setVisible(true);
    } else {
      this.statusText.setText('');
    }
  };

  FG.ComboTrials = ComboTrials;
})();
