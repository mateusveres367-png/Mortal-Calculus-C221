// Retro HUD: health bars, combo counters, hit labels, banners, frame data panel,
// and the controls overlay. Everything is fixed to the screen.
(function () {
  var C = FG.C;
  var BAR_W = 262, BAR_H = 10, BAR_Y = 16;

  function fmt(n) { return (n > 0 ? '+' : '') + n; }

  function Hud(scene) {
    this.scene = scene;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(50);
    var T = function (x, y, s, col, sc) { return FG.text(scene, x, y, s, col, sc).setDepth(51); };

    this.names = [T(16, 4, '', 'w'), T(C.VIEW_W - 16, 4, '', 'w').setOrigin(1, 0)];
    this.vs = T(C.VIEW_W / 2, 13, 'VS', 'y', 2).setOrigin(0.5, 0);
    this.mode = T(C.VIEW_W / 2, 34, '', 'c').setOrigin(0.5, 0);
    this.hint = T(C.VIEW_W / 2, 44, 'C: CONTROLS', 'g').setOrigin(0.5, 0);

    this.combo = [T(16, 64, '', 'y', 2), T(C.VIEW_W - 16, 64, '', 'y', 2).setOrigin(1, 0)];
    this.comboDmg = [T(16, 84, '', 'w'), T(C.VIEW_W - 16, 84, '', 'w').setOrigin(1, 0)];
    this.label = [T(16, 96, '', 'o', 2), T(C.VIEW_W - 16, 96, '', 'o', 2).setOrigin(1, 0)];
    this.labelTimer = [0, 0];
    this.comboShow = [{ hits: 0, damage: 0, timer: 0 }, { hits: 0, damage: 0, timer: 0 }];

    this.banner = T(C.VIEW_W / 2, 120, '', 'y', 4).setOrigin(0.5, 0);
    this.subBanner = T(C.VIEW_W / 2, 160, '', 'w', 2).setOrigin(0.5, 0);
    this.bannerTimer = 0;

    this.panel = [];
    for (var i = 0; i < 2; i++) {
      var col = [];
      for (var l = 0; l < 4; l++) col.push(T(8 + i * 320, C.GROUND_Y + 24 + l * 9, '', l === 0 ? 'y' : 'w'));
      this.panel.push(col);
    }
    this.slowText = T(C.VIEW_W - 8, 34, '', 'r').setOrigin(1, 0);

    this.trail = [null, null];
    this.trailDelay = [0, 0];

    // Controls overlay.
    this.overlayG = scene.add.graphics().setScrollFactor(0).setDepth(60);
    this.overlayText = [];
    var lines = Hud.CONTROLS;
    for (var k = 0; k < lines.length; k++) {
      this.overlayText.push(T(54, 46 + k * 11, lines[k][0], lines[k][1]).setDepth(61));
    }
    this.setOverlay(true);
  }

  Hud.CONTROLS = [
    ['CONTROLS', 'y'],
    ['', 'w'],
    ['             PLAYER 1         PLAYER 2', 'c'],
    ['MOVE         A D              LEFT RIGHT', 'w'],
    ['JUMP         W                UP', 'w'],
    ['CROUCH       S                DOWN', 'w'],
    ['GUARD        HOLD BACK  (CROUCH + BACK BLOCKS LOWS)', 'w'],
    ['DASH/BACK    TAP FORWARD/BACK TWICE', 'w'],
    ['SIDESTEP     Q (IN)  E (OUT)  NUM4 / ;  NUM5 / \'', 'w'],
    ['PUNCH  P     J                NUM1 / ,', 'w'],
    ['KICK   K     K                NUM2 / .', 'w'],
    ['HEAVY  H     L                NUM3 / /', 'w'],
    ['', 'w'],
    ['MOVES   P JAB   P,P STRING   K MID   D+K LOW   H HEAVY   D+H LAUNCHER', 'y'],
    ['', 'w'],
    ['1 P2 MODE (HUMAN / DUMMIES)   2 HITBOXES   3 FRAME DATA   4 SLOW-MO', 'g'],
    ['5 SWAP FIGHTERS   R RESET   M MUTE   C HIDE THIS', 'g']
  ];

  Hud.prototype.setOverlay = function (on) {
    this.overlayOn = on;
    this.overlayG.clear();
    if (on) {
      this.overlayG.fillStyle(0x07060c, 0.88);
      this.overlayG.fillRect(40, 36, C.VIEW_W - 80, Hud.CONTROLS.length * 11 + 18);
      this.overlayG.lineStyle(2, 0xffd23f, 1);
      this.overlayG.strokeRect(40, 36, C.VIEW_W - 80, Hud.CONTROLS.length * 11 + 18);
    }
    for (var i = 0; i < this.overlayText.length; i++) this.overlayText[i].setVisible(on);
  };

  // Forget per-round state (labels, combo counters, health trails).
  Hud.prototype.clear = function () {
    for (var i = 0; i < 2; i++) {
      this.label[i].setText('');
      this.labelTimer[i] = 0;
      this.comboShow[i] = { hits: 0, damage: 0, timer: 0 };
      this.trail[i] = null;
    }
  };

  Hud.prototype.showBanner = function (text, sub, frames) {
    this.banner.setText(text);
    this.subBanner.setText(sub || '');
    this.bannerTimer = frames;
  };

  Hud.prototype.onEvent = function (ev) {
    if (ev.type !== 'hit') return;
    var i = ev.attacker, text = null;
    if (ev.ch) text = 'COUNTER HIT!';
    else if (ev.punish) text = 'PUNISH!';
    else if (ev.launch) text = 'LAUNCH!';
    if (text) { this.label[i].setText(text); this.labelTimer[i] = 70; }
    if (ev.ko) this.showBanner('K.O.', (ev.attacker === 0 ? 'P1 ' : 'P2 ') + 'WINS', C.KO_RESET_FRAMES);
  };

  // Called once per display tick.
  Hud.prototype.tick = function (match) {
    for (var i = 0; i < 2; i++) {
      if (this.labelTimer[i] > 0 && --this.labelTimer[i] === 0) this.label[i].setText('');
      // Combo counter for attacker i is the combo on defender 1 - i.
      var c = match.combo[1 - i], show = this.comboShow[i];
      if (c.hits >= 1 && (c.hits !== show.hits || c.damage !== show.damage)) {
        show.hits = c.hits; show.damage = c.damage; show.timer = 90;
      } else if (c.hits === 0 && show.timer > 0) {
        show.timer--;
      }
      if (show.timer === 0) show.hits = 0;
      // Health trail drains after a short delay.
      var f = match.fighters[i];
      if (this.trail[i] === null || f.health > this.trail[i]) this.trail[i] = f.health;
      if (f.health < this.trail[i]) {
        if (match.combo[i].hits > 0 || match.hitstop > 0) this.trailDelay[i] = 30;
        else if (this.trailDelay[i] > 0) this.trailDelay[i]--;
        else this.trail[i] = Math.max(f.health, this.trail[i] - 0.8);
      }
    }
    if (this.bannerTimer > 0 && --this.bannerTimer === 0) { this.banner.setText(''); this.subBanner.setText(''); }
  };

  Hud.prototype.draw = function (match, opts) {
    var g = this.g;
    g.clear();

    for (var i = 0; i < 2; i++) {
      var f = match.fighters[i];
      var x = i === 0 ? 16 : C.VIEW_W - 16 - BAR_W;
      g.fillStyle(0x000000, 1); g.fillRect(x - 2, BAR_Y - 2, BAR_W + 4, BAR_H + 4);
      g.fillStyle(0x3a0d0d, 1); g.fillRect(x, BAR_Y, BAR_W, BAR_H);
      var tw = Math.round(BAR_W * this.trail[i] / f.def.health);
      var hw = Math.round(BAR_W * f.health / f.def.health);
      // P1 drains toward the centre from the left edge, P2 mirrored.
      var tx = i === 0 ? x + BAR_W - tw : x, hx = i === 0 ? x + BAR_W - hw : x;
      g.fillStyle(0xd23a2a, 1); g.fillRect(tx, BAR_Y, tw, BAR_H);
      var low = f.health / f.def.health < 0.25;
      g.fillStyle(low ? 0xff8a1f : 0xffd23f, 1); g.fillRect(hx, BAR_Y, hw, BAR_H);
      g.fillStyle(0xffffff, 0.35); g.fillRect(hx, BAR_Y + 1, hw, 2);
      g.lineStyle(1, 0xd8c79a, 1); g.strokeRect(x - 1, BAR_Y - 1, BAR_W + 2, BAR_H + 2);

      this.names[i].setText((i === 0 ? 'P1 ' : 'P2 ') + f.def.name + '  ' + f.def.archetype);

      var show = this.comboShow[i];
      if (show.hits >= 2) {
        this.combo[i].setText(show.hits + ' HITS');
        this.comboDmg[i].setText(show.damage + ' DAMAGE');
      } else {
        this.combo[i].setText(''); this.comboDmg[i].setText('');
      }
    }

    this.mode.setText(opts.modeLabel);
    this.slowText.setText(opts.slow ? 'SLOW-MO' : '');

    // Frame data panel.
    var show = opts.showData;
    if (show) {
      g.fillStyle(0x000000, 0.7);
      g.fillRect(0, C.GROUND_Y + 20, C.VIEW_W, C.VIEW_H - C.GROUND_Y - 20);
      g.fillStyle(0x5a4b2c, 1);
      g.fillRect(0, C.GROUND_Y + 20, C.VIEW_W, 1);
    }
    for (var p = 0; p < 2; p++) {
      var lines = this.panel[p];
      for (var l = 0; l < 4; l++) lines[l].setVisible(show);
      if (!show) continue;
      var fr = match.fighters[p], m = fr.lastMove, res = match.lastResult[p];
      if (!m) {
        lines[0].setText('P' + (p + 1) + ' ' + fr.def.name + ': NO MOVE YET');
        lines[1].setText(''); lines[2].setText(''); lines[3].setText('');
        continue;
      }
      lines[0].setText('P' + (p + 1) + ' ' + m.label + ' [' + m.cmd + ']');
      lines[1].setText(m.level.toUpperCase() + '  I' + m.startup + '  ACT ' + m.active + '  REC ' + m.recovery + '  TOT ' + m.total + (m.tracks ? '  TRACKS' : ''));
      var onHit = m.hit.launch ? 'LAUNCH' : fmt(m.hit.adv);
      var onCh = m.ch.launch ? 'LAUNCH' : fmt(m.ch.adv);
      lines[2].setText('BLOCK ' + fmt(m.block) + '  HIT ' + onHit + '  CH ' + onCh);
      if (res && res.move === m) {
        var txt = res.adv === null ? res.kind : res.kind + ' ' + fmt(res.adv);
        lines[3].setText('LAST: ' + txt);
        lines[3].setFont('pf_' + (res.adv === null ? 'o' : res.adv > 0 ? 'c' : res.adv < 0 ? 'r' : 'w'));
      } else if (fr.contact) {
        lines[3].setText('LAST: ' + (fr.contact === 'hit' ? 'HIT' : 'BLOCK') + ' ...');
        lines[3].setFont('pf_g');
      } else {
        lines[3].setText(fr.state === 'attack' && fr.move === m ? 'LAST:' : 'LAST: WHIFF');
        lines[3].setFont('pf_g');
      }
    }
  };

  FG.Hud = Hud;
})();
