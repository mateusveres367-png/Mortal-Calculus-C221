// RECORDS: your progress (see src/progress.js). Wins and matches per fighter with
// their outfits unlocked, the longest combo, your most-used fighter, finishers landed,
// perfect rounds, arcade clears and the Detention and Timed Test bests, and every
// title: the ones you've earned (pick the one shown under your name with left/right)
// and how to earn the rest.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H;

  var RecordsScene = function () { Phaser.Scene.call(this, { key: 'records' }); };
  RecordsScene.prototype = Object.create(Phaser.Scene.prototype);
  RecordsScene.prototype.constructor = RecordsScene;

  function clock(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

  RecordsScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this, P = FG.progress;
    var bg = this.add.graphics();
    bg.fillGradientStyle(0x1b1830, 0x1b1830, 0x07060c, 0x07060c, 1); bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x2a2440, 1); for (var y = 0; y < H; y += 8) bg.lineBetween(0, y, W, y);
    bg.fillStyle(0x000000, 0.5); bg.fillRect(0, 0, W, 30);
    FG.text(this, W / 2, 7, 'RECORDS', 'y', 2).setOrigin(0.5, 0);
    FG.text(this, W / 2, H - 12, 'LEFT/RIGHT: YOUR TITLE    ESC BACK', 'g').setOrigin(0.5, 0);

    // Fighters: wins, matches, outfits.
    var x0 = 20, y0 = 40;
    FG.text(this, x0, y0, 'FIGHTER       WINS  PLAYED  OUTFITS', 'c');
    FG.ROSTER.forEach(function (d, k) {
      var wins = P.wins[d.id] || 0, played = P.played[d.id] || 0;
      var row = (d.name + '            ').slice(0, 13) + ' ' + ('   ' + wins).slice(-4) + '  ' + ('    ' + played).slice(-6) + '   ' + FG.outfitsUnlocked(d.id) + '/' + FG.OUTFITS.length;
      FG.text(self, x0, y0 + 12 + k * 11, row, played ? 'w' : 'g');
    });

    // The numbers.
    var fav = FG.Progress.favourite(), favDef = fav && FG.fighterById(fav), cdef = P.combo.fighter && FG.fighterById(P.combo.fighter);
    var stats = [
      ['TOTAL WINS', String(FG.Progress.totalWins())],
      ['MOST USED', favDef ? favDef.name + ' (' + P.played[fav] + ')' : '-'],
      ['LONGEST COMBO', P.combo.hits ? P.combo.hits + ' HITS' + (cdef ? ' (' + cdef.name + ')' : '') : '-'],
      ['FINISHERS LANDED', String(P.finishers)],
      ['PERFECT ROUNDS', String(P.perfects)],
      ['CLOSE CALLS', String(P.closeCalls)],
      ['ARCADE CLEARS', String(P.arcadeClears)],
      ['DETENTION BEST', P.detentionBest ? P.detentionBest + ' BEATEN' : '-'],
      ['TIMED TEST BEST', P.timedBest ? clock(P.timedBest) : '-']
    ];
    stats.forEach(function (s, k) {
      FG.text(self, 330, y0 + 12 + k * 11, s[0], 'c');
      FG.text(self, W - 20, y0 + 12 + k * 11, s[1], 'w').setOrigin(1, 0);
    });

    // Titles: earned ones bright, the rest with what it takes.
    var ty = 156;
    FG.text(this, x0, ty, 'TITLES', 'y');
    this.titleRows = FG.TITLES.map(function (t, k) {
      var col = k % 2, row = Math.floor(k / 2), tx = x0 + col * 310, yy = ty + 14 + row * 22;
      var earned = t.test();
      var name = FG.text(self, tx, yy, t.name, earned ? 'w' : 'g');
      FG.text(self, tx, yy + 9, earned ? 'EARNED' : t.how, earned ? 'c' : 'g').setScale(0.75);
      return { t: t, name: name, earned: earned, x: tx, y: yy };
    });
    this.mark = this.add.graphics();
    this.shown = FG.text(this, W / 2, 318, '', 'y').setOrigin(0.5, 0);
    this.refresh();

    this.input.keyboard.on('keydown', function (e) {
      FG.Sfx.unlock();
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': self.pick(-1); break;
        case 'ArrowRight': case 'KeyD': self.pick(1); break;
        case 'Escape': case 'Backspace': case 'Enter': case 'KeyK': case 'KeyJ': FG.Sfx.ui('move'); self.scene.start('title', { menu: true }); break;
      }
    });
    this.input.on('pointerdown', function () { self.scene.start('title', { menu: true }); });
    window.FG_RECORDS = this;
  };

  // Choose which earned title shows under your name.
  RecordsScene.prototype.pick = function (d) {
    var earned = FG.titlesEarned(), i = Math.max(0, earned.map(function (t) { return t.id; }).indexOf(FG.progress.title));
    var next = earned[(i + d + earned.length) % earned.length];
    FG.Progress.setTitle(next.id);
    FG.Sfx.ui('move');
    this.refresh();
  };

  RecordsScene.prototype.refresh = function () {
    var cur = FG.titleById(FG.progress.title), g = this.mark;
    g.clear();
    this.titleRows.forEach(function (r) {
      if (r.t.id !== cur.id) return;
      g.lineStyle(1, 0xffd23f, 1); g.strokeRect(r.x - 4, r.y - 3, 300, 20);
    });
    this.shown.setText('YOUR TITLE: < ' + cur.name + ' >');
  };

  FG.RecordsScene = RecordsScene;
})();
