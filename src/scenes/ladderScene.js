// Arcade ladder: shown before every arcade fight. The tower of every fight in the run
// (won ones ticked off, the next one lit), the next opponent in their stance with a
// short rival line for you, and how hard the CPU will fight. Enter (or a few
// seconds) starts the fight.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H;
  var SHOW_FOR = 200; // frames before it goes on by itself

  var LadderScene = function () { Phaser.Scene.call(this, { key: 'ladder' }); };
  LadderScene.prototype = Object.create(Phaser.Scene.prototype);
  LadderScene.prototype.constructor = LadderScene;

  LadderScene.prototype.init = function (run) { this.run = run; };

  // What the next opponent says to you: their side of a rivalry, or one of their lines.
  FG.rivalLine = function (cpuId, p1Id) {
    var cpu = FG.fighterById(cpuId), you = FG.fighterById(p1Id);
    if (cpuId === p1Id) return 'Oh good. Someone who finally gets it.';
    var lines = FG.preRoundLines(cpu, you, function () { return 0; }).filter(function (l) { return l.speaker === 0; });
    return lines.length ? lines[lines.length - 1].text : cpu.talk.lines[0];
  };

  // A fighter's colour chip.
  function chip(d) { return d.cutIn ? FG.fighterGlow(d) : 0x444444; }

  LadderScene.prototype.create = function () {
    FG.makeFonts(this);
    var run = this.run, self = this, n = run.ladder.length, next = FG.fighterById(run.ladder[run.index]);
    var you = FG.fighterById(run.p1);
    this.t = 0;
    this.started = false;
    var bg = this.add.graphics();
    bg.fillGradientStyle(0x1b1830, 0x1b1830, 0x07060c, 0x07060c, 1); bg.fillRect(0, 0, W, H);
    bg.lineStyle(1, 0x2a2440, 1);
    for (var y = 0; y < H; y += 8) bg.lineBetween(0, y, W, y);
    FG.text(this, W / 2, 8, run.timed ? 'TIMED TEST' : 'ARCADE', 'y', 3).setOrigin(0.5, 0);
    FG.text(this, W / 2, 34, 'FIGHT ' + (run.index + 1) + ' OF ' + n + '   CPU: ' + FG.AI_LEVELS[FG.arcadeLevel(run.index, n)].name +
      (run.timed ? '   TIME ' + FG.clock(run.frames / 60) + (FG.progress.timedBest ? '   BEST ' + FG.clock(FG.progress.timedBest / 1000) : '') : ''), 'c').setOrigin(0.5, 0);

    // The tower: fight 1 at the bottom, the last fight at the top.
    var tower = this.add.graphics(), x0 = 40, tw = 170, rowH = Math.min(28, Math.floor((H - 84) / n)), top = H - 30 - n * rowH;
    for (var i = 0; i < n; i++) {
      var d = FG.fighterById(run.ladder[i]), yy = top + (n - 1 - i) * rowH;
      var done = i < run.index, cur = i === run.index;
      tower.fillStyle(cur ? 0x3c6fb0 : done ? 0x1f3a24 : 0x16131f, 1); tower.fillRect(x0, yy, tw, rowH - 4);
      tower.lineStyle(cur ? 2 : 1, cur ? 0xffd23f : 0x5a4b2c, 1); tower.strokeRect(x0, yy, tw, rowH - 4);
      tower.fillStyle(chip(d), 1); tower.fillRect(x0 + 4, yy + 3, 14, Math.max(4, rowH - 10));
      var ty = yy + Math.max(2, Math.round((rowH - 4) / 2) - 4);
      FG.text(this, x0 + 24, ty, (i + 1) + '. ' + d.name + (d.id === run.p1 ? ' (MIRROR)' : '') + (d.student ? '  10TH' : ''), done ? 'g' : cur ? 'y' : 'w');
      if (done) FG.text(this, x0 + tw - 8, ty, 'WIN', 'c').setOrigin(1, 0);
      else if (d.boss && i === n - 1) FG.text(this, x0 + tw - 8, ty, 'BOSS', 'r').setOrigin(1, 0);
    }

    // The next opponent, their line, and you.
    this.foe = FG.puppet(next, W - 150, -1);
    this.foe.alt = next.id === run.p1;
    this.me = FG.puppet(you, W - 300, 1);
    this.g = this.add.graphics();
    FG.text(this, W - 150, 70, next.name, 'r', 3).setOrigin(0.5, 0);
    if (next.boss && run.index === n - 1) FG.text(this, W - 150, 56, 'FINAL BOSS', 'y').setOrigin(0.5, 0);
    FG.text(this, W - 150, 96, next.archetype + '  ' + next.theme, 'w').setOrigin(0.5, 0);
    var line = FG.wrapText('"' + FG.rivalLine(next.id, run.p1) + '"', 36);
    var box = this.add.graphics();
    box.fillStyle(0xf4f1e6, 1); box.fillRect(W - 290, 112, 280, 12 + line.length * 11);
    box.lineStyle(2, 0x111111, 1); box.strokeRect(W - 290, 112, 280, 12 + line.length * 11);
    line.forEach(function (l, k) { FG.text(self, W - 150, 118 + k * 11, l, 'k').setOrigin(0.5, 0); });
    this.prompt = FG.text(this, W / 2, H - 16, 'ENTER: FIGHT', 'w').setOrigin(0.5, 0);

    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE]);
    kb.on('keydown', function (e) {
      FG.Sfx.unlock();
      if (self.t > 15 && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyJ')) self.go();
    });
    FG.Sfx.ui('confirm');
    window.FG_LADDER = this;
  };

  LadderScene.prototype.go = function () {
    if (this.started) return;
    this.started = true;
    FG.Sfx.ui('confirm');
    this.scene.start('fight', FG.arcadeFight(this.run));
  };

  LadderScene.prototype.update = function () {
    this.t++;
    if (this.t >= SHOW_FOR) this.go();
    this.prompt.setVisible(this.t % 60 < 40);
    var g = this.g;
    g.clear();
    [this.me, this.foe].forEach(function (p) {
      FG.updatePose(p, this.t);
      g.fillStyle(0x000000, 0.35); g.fillEllipse(p.x, H - 40, 60, 8);
      FG.drawFighter(g, p, { scale: 1.3, groundY: H - 40, noShadow: true });
    }, this);
  };

  FG.LadderScene = LadderScene;
})();
