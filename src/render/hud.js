// Retro HUD: health bars, combo counters, hit labels, banners, frame data panel,
// and the controls overlay. Everything is fixed to the screen.
(function () {
  var C = FG.C;
  var BAR_W = 262, BAR_H = 10, BAR_Y = 16;

  function fmt(n) { return (n > 0 ? '+' : '') + n; }
  function resultText(r) { return r.launch ? 'LAUNCH' : r.knockdown ? 'KND' : fmt(r.adv); }

  function Hud(scene) {
    this.scene = scene;
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(50);
    var T = function (x, y, s, col, sc) { return FG.text(scene, x, y, s, col, sc).setDepth(51); };

    this.names = [T(16, 4, '', 'w'), T(C.VIEW_W - 16, 4, '', 'w').setOrigin(1, 0)];
    this.vs = T(C.VIEW_W / 2, 13, 'VS', 'y', 2).setOrigin(0.5, 0);
    this.mode = T(C.VIEW_W / 2, 34, '', 'c').setOrigin(0.5, 0);

    // Combo counter: a big hit count, total damage, and a rank for long combos.
    this.counter = [0, 1].map(function (i) {
      return {
        num: T(0, 0, '', 'y', 5).setOrigin(i ? 1 : 0, 0.5),
        word: T(0, 0, 'HITS', 'w', 2).setOrigin(i ? 1 : 0, 0.5),
        dmg: T(0, 0, '', 'w', 1).setOrigin(i ? 1 : 0, 0),
        rank: T(0, 0, '', 'c', 2).setOrigin(i ? 1 : 0, 0.5),
        pop: 0, rankPop: 0, tier: 0, fade: 0
      };
    });
    this.label = [T(16, 148, '', 'o', 2), T(C.VIEW_W - 16, 148, '', 'o', 2).setOrigin(1, 0)];
    this.labelTimer = [0, 0];
    // Enhanced specials: a "+" that pops onto the end of the move name.
    this.plus = [0, 1].map(function () { return T(0, 0, '+', 'y', 2).setOrigin(0.5, 0.5).setVisible(false); });
    this.plusT = [0, 0];
    this.comboShow = [{ hits: 0, damage: 0, timer: 0 }, { hits: 0, damage: 0, timer: 0 }];

    // Big COUNTER! callout on counter hits, on the attacker's side.
    this.counterText = T(0, 0, 'COUNTER!', 'r', 4).setOrigin(0.5, 0.5).setVisible(false);
    this.counterT = 0; this.counterSide = 0;

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

    // Grade meter letters, one per bar (C, B, A from the outside in).
    this.meterText = [0, 1].map(function (i) {
      return Hud.GRADES.map(function (gr, k) { return T(Hud.meterSegX(i, k) + Hud.SEG_W / 2, Hud.METER_Y + 1, gr[0], 'g').setOrigin(0.5, 0); });
    });
    this.meterPop = [0, 0]; this.meterPopSeg = [0, 0];
    // Extra Credit: a prompt when it's available.
    this.ecText = [T(16, Hud.METER_Y + Hud.METER_H + 6, '', 'y'), T(C.VIEW_W - 16, Hud.METER_Y + Hud.METER_H + 6, '', 'y').setOrigin(1, 0)];

    this.trail = [null, null];
    this.trailDelay = [0, 0];
    this.blink = 0;

    // Controls overlay.
    this.overlayG = scene.add.graphics().setScrollFactor(0).setDepth(60);
    this.overlayText = [];
    var lines = Hud.CONTROLS;
    for (var k = 0; k < lines.length; k++) {
      this.overlayText.push(T(54, 46 + k * 11, lines[k][0], lines[k][1]).setDepth(61));
    }
    this.setOverlay(false);
  }

  // Grade meter layout: three bars under the round pips.
  Hud.GRADES = [['C', 0x5fd7ff], ['B', 0x7dff6a], ['A', 0xffd23f]];
  Hud.SEG_W = 44; Hud.SEG_GAP = 4; Hud.METER_Y = 46; Hud.METER_H = 9;
  Hud.meterSegX = function (i, k) {
    var step = Hud.SEG_W + Hud.SEG_GAP;
    return i === 0 ? 16 + k * step : C.VIEW_W - 16 - Hud.SEG_W - k * step;
  };

  Hud.CONTROLS = [
    ['CONTROLS', 'y'],
    ['             PLAYER 1         PLAYER 2', 'c'],
    ['MOVE         A D              LEFT RIGHT', 'w'],
    ['JUMP/CROUCH  W / S            UP / DOWN', 'w'],
    ['GUARD        HOLD BACK  (CROUCH + BACK BLOCKS LOWS)', 'w'],
    ['DASH/BACK    TAP FORWARD/BACK TWICE', 'w'],
    ['SIDESTEP     Q (IN)  E (OUT)  NUM4 / ;  NUM5 / \'', 'w'],
    ['PUNCH  P     J                NUM1 / ,', 'w'],
    ['KICK   K     K                NUM2 / .', 'w'],
    ['HEAVY  H     L                NUM3 / /', 'w'],
    ['TAUNT        T                NUM6 / ]   (TAKES 1 SEC, LEAVES YOU OPEN)', 'w'],
    ['MOVES   P JAB  K MID  H HEAVY  D+K LOW  D/B+K SWEEP  D+H LAUNCHER', 'y'],
    ['        F/B + BUTTON: SPECIALS (SEE MOVES.MD)  UP ON LAUNCH: AIR CHASE', 'y'],
    ['AIR     P / K / H IN THE AIR, CHAIN ON HIT. AIR H BOUNDS', 'y'],
    ['THROW   P+K (BREAK WITH P)   B+P+K (BREAK WITH K)', 'y'],
    ['DOWN    UP RISE  BACK/FWD ROLL  SIDESTEP ROLL  K/P WAKE KICKS', 'y'],
    ['        TECH: PRESS P/K/H JUST BEFORE YOU LAND', 'y'],
    ['ESC TRAINING MENU   1 DUMMY STANCE   2 HITBOXES   3 FRAME DATA', 'g'],
    ['4 SLOW-MO   5 SWAP SIDES   6 INPUTS   R RESET   M MUTE   C HIDE', 'g'],
    ['7 COMBO TRIALS   8/9 PREVIOUS/NEXT TRIAL', 'g']
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
      this.plusT[i] = 0;
      this.comboShow[i] = { hits: 0, damage: 0, timer: 0 };
      this.counter[i].tier = 0; this.counter[i].pop = 0; this.counter[i].rankPop = 0;
      this.trail[i] = null;
    }
    this.counterT = 0; this.counterText.setVisible(false);
  };

  // opts: { scale, y } (defaults: big and centred; long text is smaller).
  Hud.prototype.showBanner = function (text, sub, frames, opts) {
    opts = opts || {};
    var y = opts.y != null ? opts.y : 120;
    this.banner.setText(text);
    this.banner.setScale(opts.scale || (text.length > 12 ? 2 : 4));
    this.banner.setY(y);
    this.subBanner.setY(y + (opts.scale || (text.length > 12 ? 2 : 4)) * 9 + 6);
    this.subBanner.setText(sub || '');
    this.bannerTimer = frames;
  };

  Hud.prototype.setLabel = function (i, text) {
    this.label[i].setText(text);
    this.labelTimer[i] = 70;
    this.plusT[i] = 0;
  };

  // An enhanced special: its name, and a "+" that pops onto the end of it.
  Hud.prototype.setEnhanced = function (i, name) {
    this.setLabel(i, name + ' ');
    this.plusT[i] = 1;
  };

  Hud.prototype.drawPlus = function (i) {
    var p = this.plus[i], t = this.plusT[i], lb = this.label[i];
    if (!t || !this.labelTimer[i]) { p.setVisible(false); this.plusT[i] = 0; return; }
    this.plusT[i]++;
    var cw = lb.width / Math.max(1, lb.text.length);
    var x = i === 0 ? lb.x + lb.width - cw / 2 : lb.x - cw / 2, y = lb.y + lb.height / 2;
    var sc = t < 8 ? 6 - t * 0.5 : 2 + (t < 14 ? Math.sin((t - 8) * 1.2) * 0.4 : 0);
    p.setVisible(true).setScale(sc).setPosition(x, y).setFont(t % 6 < 3 ? 'pf_w' : 'pf_y');
  };

  Hud.prototype.onEvent = function (ev) {
    switch (ev.type) {
      case 'wallsplat': this.setLabel(1 - ev.fighter, 'WALL SPLAT!'); return;
      case 'guardbreak': this.setLabel(ev.attacker, 'GUARD BREAK!'); return;
      case 'break': this.setLabel(ev.defender, ev.clash ? 'THROW CLASH' : 'THROW BREAK!'); return;
      case 'tech': this.setLabel(ev.fighter, 'TECH ROLL'); return;
      case 'meter': this.meterPop[ev.fighter] = 14; this.meterPopSeg[ev.fighter] = ev.bars - 1; return;
      case 'hit': break;
      default: return;
    }
    var i = ev.attacker, text = null;
    if (ev.ch && !ev.throw) { this.counterT = 1; this.counterSide = i; }
    if (ev.throw) text = 'THROW!';
    else if (ev.punish) text = 'PUNISH!';
    else if (ev.bound) text = 'BOUND!';
    else if (ev.ground) text = 'GROUND HIT';
    else if (ev.launch) text = 'LAUNCH!';
    if (text) this.setLabel(i, text);
    if (ev.ko) this.koBanner(ev.attacker);
  };

  Hud.prototype.koBanner = function (attacker) {
    this.showBanner('K.O.', this.roundMode ? '' : (attacker === 0 ? 'P1 ' : 'P2 ') + 'WINS', this.roundMode ? 120 : C.KO_RESET_FRAMES, this.roundMode ? { scale: 5, y: 116 } : null);
  };

  // Called once per display tick.
  Hud.prototype.tick = function (match) {
    for (var i = 0; i < 2; i++) {
      if (this.labelTimer[i] > 0 && --this.labelTimer[i] === 0) this.label[i].setText('');
      // Combo counter for attacker i is the combo on defender 1 - i.
      var c = match.combo[1 - i], show = this.comboShow[i];
      var cc = this.counter[i];
      if (c.hits >= 1 && (c.hits !== show.hits || c.damage !== show.damage)) {
        if (c.hits > show.hits || show.timer === 0) cc.pop = 8;
        show.hits = c.hits; show.damage = c.damage; show.timer = 100;
        var tier = Hud.rankTier(c.hits);
        if (tier > cc.tier) { cc.rankPop = 16; FG.Sfx.ui('confirm'); }
        cc.tier = tier;
      } else if (c.hits === 0 && show.timer > 0) {
        show.timer--;
      }
      if (show.timer === 0) { show.hits = 0; cc.tier = 0; }
      if (cc.pop > 0) cc.pop--;
      if (cc.rankPop > 0) cc.rankPop--;
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
    // COUNTER! slams in big, settles, flickers and fades.
    if (this.counterT > 0) {
      var ct = this.counterT++, ctx = this.counterText;
      if (ct > 54) { this.counterT = 0; ctx.setVisible(false); }
      else {
        var sc = ct < 5 ? 6.5 - ct * 0.5 : ct < 9 ? 4 + Math.sin((ct - 5) * 1.6) * 0.4 : 4;
        var jx = ct < 10 ? (ct % 2 ? 2 : -2) : 0;
        ctx.setVisible(ct < 40 || ct % 4 < 2).setScale(sc).setFont(ct % 6 < 3 ? 'pf_r' : 'pf_y')
          .setPosition((this.counterSide === 0 ? C.VIEW_W * 0.32 : C.VIEW_W * 0.68) + jx, 172);
      }
    }
  };

  // The Grade meter: C, B and A bars. Full bars glow in their grade's colour; a bar
  // that just filled flashes white; all three full pulses.
  Hud.prototype.drawMeter = function (i, f) {
    var g = this.g, y = Hud.METER_Y, h = Hud.METER_H, full = f.meter >= C.METER_MAX;
    if (this.meterPop[i] > 0) this.meterPop[i]--;
    for (var k = 0; k < 3; k++) {
      var x = Hud.meterSegX(i, k), w = Hud.SEG_W, col = Hud.GRADES[k][1];
      var part = Math.max(0, Math.min(1, (f.meter - k * C.METER_BAR) / C.METER_BAR));
      g.fillStyle(0x000000, 1); g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle(0x16131f, 1); g.fillRect(x, y, w, h);
      var pw = Math.round(w * part);
      if (part >= 1) {
        var pulse = full && this.blink % 24 < 12;
        g.fillStyle(pulse ? 0xffffff : col, 1); g.fillRect(x, y, w, h);
        g.fillStyle(0xffffff, 0.4); g.fillRect(x, y + 1, w, 2);
      } else if (pw > 0) {
        g.fillStyle(col, 0.45); g.fillRect(i === 0 ? x : x + w - pw, y, pw, h);
      }
      if (this.meterPop[i] > 0 && this.meterPopSeg[i] === k) {
        var pp = this.meterPop[i] / 14;
        g.fillStyle(0xffffff, pp); g.fillRect(x - 2, y - 2, w + 4, h + 4);
        g.lineStyle(1, 0xffffff, pp); g.strokeRect(x - 2 - (1 - pp) * 6, y - 2 - (1 - pp) * 4, w + 4 + (1 - pp) * 12, h + 4 + (1 - pp) * 8);
      }
      g.lineStyle(1, part >= 1 ? 0xffffff : 0x5a4b2c, 1); g.strokeRect(x - 1, y - 1, w + 2, h + 2);
      this.meterText[i][k].setFont(part >= 1 ? 'pf_k' : 'pf_g');
    }
    // Extra Credit: the boost draining under the meter, or a prompt while it's available.
    var full = Hud.SEG_W * 3 + Hud.SEG_GAP * 2, bx = i === 0 ? 16 : C.VIEW_W - 16 - full, by = y + h + 3;
    if (f.boost > 0) {
      var bw = Math.round(full * f.boost / C.BOOST_FRAMES);
      g.fillStyle(0x000000, 1); g.fillRect(bx - 1, by - 1, full + 2, 5);
      g.fillStyle(this.blink % 10 < 5 ? 0xffd23f : 0xfff2a0, 1); g.fillRect(i === 0 ? bx : bx + full - bw, by, bw, 3);
      this.ecText[i].setText('');
    } else {
      this.ecText[i].setText(f.canExtraCredit && f.canExtraCredit() ? 'EXTRA CREDIT: P+K+H' : '').setVisible(this.blink % 40 < 28);
    }
  };

  // Rank labels by combo length.
  Hud.RANKS = [[15, 'PROOF COMPLETE', 'r'], [12, 'INCREDIBLE', 'o'], [8, 'GREAT', 'y'], [5, 'NICE', 'c']];
  Hud.rankTier = function (hits) {
    for (var k = 0; k < Hud.RANKS.length; k++) if (hits >= Hud.RANKS[k][0]) return Hud.RANKS.length - k;
    return 0;
  };
  Hud.rankFor = function (hits) {
    for (var k = 0; k < Hud.RANKS.length; k++) if (hits >= Hud.RANKS[k][0]) return Hud.RANKS[k];
    return null;
  };

  // The combo counter for attacker i: pops and shakes on every hit, fades when it's over.
  Hud.prototype.drawCounter = function (i) {
    var show = this.comboShow[i], cc = this.counter[i];
    var on = show.hits >= 2;
    cc.num.setVisible(on); cc.word.setVisible(on); cc.dmg.setVisible(on); cc.rank.setVisible(on);
    if (!on) return;
    var over = show.timer < 100; // the combo has ended; it lingers, then blinks out
    if (over && show.timer < 30 && show.timer % 6 < 3) { cc.num.setVisible(false); cc.word.setVisible(false); cc.dmg.setVisible(false); cc.rank.setVisible(false); return; }
    var k = cc.pop / 8, side = i ? -1 : 1, x0 = i ? C.VIEW_W - 16 : 16, y0 = 76;
    // A dark panel behind it so it reads over any stage.
    var rankW = Hud.rankFor(show.hits) ? Hud.rankFor(show.hits)[1].length * 14 + 10 : 0;
    var pw = Math.max(150, rankW + 12), ph = Hud.rankFor(show.hits) ? 76 : 56;
    this.g.fillStyle(0x07060c, over ? 0.3 : 0.5);
    this.g.fillRect(i ? C.VIEW_W - 8 - pw : 8, y0 - 22, pw, ph);
    var jx = cc.pop > 2 ? (cc.pop % 2 ? 2 : -2) : 0, jy = cc.pop > 2 ? (cc.pop % 3 - 1) * 2 : 0;
    var big = show.hits >= 10 ? 6 : 5;
    cc.num.setText(String(show.hits)).setScale(big + 2.5 * k * k).setPosition(x0 + jx, y0 + jy)
      .setFont(cc.pop > 4 ? 'pf_w' : over ? 'pf_g' : 'pf_y');
    cc.word.setPosition(x0 + side * (cc.num.width + 6) + jx, y0 + 4 + jy).setFont(over ? 'pf_g' : 'pf_w');
    cc.dmg.setText(show.damage + ' DAMAGE').setPosition(x0, y0 + 24).setFont(over ? 'pf_g' : 'pf_w');
    var rank = Hud.rankFor(show.hits);
    if (rank) {
      var rk = cc.rankPop / 16, flash = rank[0] >= 15 && this.blink % 8 < 4;
      cc.rank.setText(rank[1]).setScale(2 + 1.2 * rk * rk).setPosition(x0 + (rk > 0.5 ? jx : 0), y0 + 50)
        .setFont(over ? 'pf_g' : flash ? 'pf_w' : 'pf_' + rank[2]);
    } else {
      cc.rank.setText('');
    }
  };

  Hud.prototype.draw = function (match, opts) {
    var g = this.g;
    g.clear();
    this.blink++;

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
      // Guard pressure meter: fills as you block, breaks your guard when full.
      var gw = Math.round(BAR_W * 0.6 * f.guard / C.GUARD_MAX), gx = i === 0 ? x + BAR_W - Math.round(BAR_W * 0.6) : x;
      g.fillStyle(0x000000, 1); g.fillRect(gx - 1, BAR_Y + BAR_H + 3, Math.round(BAR_W * 0.6) + 2, 5);
      var danger = f.guard > C.GUARD_MAX * 0.7;
      g.fillStyle(danger ? (this.blink % 16 < 8 ? 0xff8a1f : 0xffd23f) : 0x5fd7ff, 1);
      g.fillRect(i === 0 ? gx + Math.round(BAR_W * 0.6) - gw : gx, BAR_Y + BAR_H + 4, gw, 3);

      this.names[i].setText((i === 0 ? 'P1 ' : 'P2 ') + f.def.name + '  ' + f.def.archetype);
      this.drawMeter(i, f);
      this.drawPlus(i);

      this.drawCounter(i);
    }

    // Rounds: the timer replaces VS, and won rounds light up under the health bars.
    var r = opts.rounds;
    if (r) {
      this.vs.setText(r.time == null ? '--' : String(r.time)).setScale(3).setY(6).setFont(r.low && this.blink % 20 < 10 ? 'pf_r' : 'pf_y');
      for (var side = 0; side < 2; side++) {
        for (var k = 0; k < r.toWin; k++) {
          var mx = side === 0 ? 16 + k * 14 : C.VIEW_W - 26 - k * 14, my = BAR_Y + BAR_H + 12;
          g.fillStyle(0x000000, 1); g.fillRect(mx - 1, my - 1, 12, 8);
          g.fillStyle(k < r.wins[side] ? 0xffd23f : 0x3a3440, 1); g.fillRect(mx, my, 10, 6);
        }
      }
    } else {
      this.vs.setText('VS').setScale(2).setY(13).setFont('pf_y');
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
      var props = (m.tracks ? '  TRACKS' : '') + (m.bound ? '  BOUND' : '') + (m.wallSplat ? '  SPLAT' : '') + (m.otg ? '  OTG' : '');
      lines[1].setText((m.throw ? 'THROW' : m.level.toUpperCase()) + '  I' + m.startup + '  ACT ' + m.active + '  REC ' + m.recovery + '  TOT ' + m.total + props);
      if (m.taunt) {
        lines[1].setText('TAUNT  ' + m.total + ' FRAMES');
        lines[2].setText('COUNTER-HITTABLE THE WHOLE TIME');
      } else if (m.throw) {
        lines[2].setText('DAMAGE ' + m.damage + (m.breakBtn ? '  BREAK WITH ' + m.breakBtn.toUpperCase() : '  UNBREAKABLE'));
      } else if (m.air) {
        lines[2].setText('HITSTUN ' + m.stunHit + '  BLOCKSTUN ' + m.stunBlock + '  LANDING ' + m.landLag);
      } else {
        // Cancel windows: which buttons chain from this move, and on which frames.
        var chain = '';
        if (m.cancels && m.cancels.length) {
          var btns = m.cancels.map(function (c) { return c.btn === 'up' ? 'UP' : c.btn === 'throw' ? 'P+K' : c.btn.toUpperCase(); });
          chain = '  CHAIN ' + btns.filter(function (b, k) { return btns.indexOf(b) === k; }).join('/') + ' ' + m.cancels[0].from + '-' + m.cancels[0].to;
        }
        lines[2].setText('BLOCK ' + fmt(m.block) + '  HIT ' + resultText(m.hit) + '  CH ' + resultText(m.ch) + chain);
      }
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
