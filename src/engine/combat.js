// Hit resolution, throws and the guard pressure meter. Extends FG.Match.
(function () {
  var C = FG.C, Match = FG.Match;

  var GUARD_DMG = { light: 6, medium: 11, heavy: 20, launch: 16 };

  // --- Finding contacts ---------------------------------------------------------

  Match.prototype.resolveHits = function () {
    var f = this.fighters, strikes = [], grabs = [], parries = [];
    for (var i = 0; i < 2; i++) {
      var a = f[i], d = f[1 - i];
      if (!a.isActiveFrame() || a.contact) continue;
      var m = a.move;
      if (d.isInvulnerable()) continue;
      // Sidestep: linear attacks and throws miss a fighter who has moved off the line.
      if (!m.tracks && Math.abs(a.z - d.z) > C.SIDESTEP_EVADE_Z) continue;
      // Highs (and throws) go over crouching opponents.
      if (m.level === 'high' && d.isCrouching()) continue;
      // A backdash that evades lows early on (LOPEZ's Standard Deviation).
      if (m.level === 'low' && d.state === 'backdash' && d.stateFrame <= (d.def.backdashLowInvuln || 0)) continue;
      // Only ground-hitting moves reach a fighter who is lying down, or tripped and falling.
      if ((d.state === 'down' || (d.state === 'juggle' && d.tripped)) && (!m.otg || d.groundHits >= C.GROUND_HITS_MAX)) continue;
      if (m.throw && !d.isThrowable(m.grabsCrouch)) continue;
      var hb = a.hitbox(0), hurts = d.hurtboxes(), touching = false;
      for (var j = 0; j < hurts.length; j++) if (FG.overlap(hb, hurts[j])) { touching = true; break; }
      if (!touching) continue;
      // Snapshot the defender's guard and counter-hit state before anything changes (trades).
      var c = { a: i, d: 1 - i, guard: d.guardStance(this.buffers[1 - i]), ch: d.inCounterHitWindow(), punish: d.inRecovery() };
      // A parry catches strikes of the levels it covers (never throws).
      var pr = !m.throw && d.parryWindow();
      if (pr && pr.levels.indexOf(m.level) >= 0) { parries.push(c); continue; }
      (m.throw ? grabs : strikes).push(c);
    }
    for (var q = 0; q < parries.length; q++) this.applyParry(parries[q]);
    // A strike beats a throw on the same frame; two throws at once clash and break.
    if (grabs.length === 2) { this.throwBreak(0, 1, 'clash'); grabs = []; }
    for (var k = 0; k < strikes.length; k++) this.applyContact(strikes[k]);
    if (grabs.length && !strikes.length) this.startGrab(grabs[0]);
  };

  // Parry: the attacker staggers and the parrying fighter counters at once.
  Match.prototype.applyParry = function (c) {
    var a = this.fighters[c.a], d = this.fighters[c.d], pr = d.move.parry, label = d.move.parryLabel;
    a.actionable = false; d.actionable = false;
    a.contact = 'parried';
    a.setState('hitstun');
    a.stun = C.PARRY_STUN;
    a.reaction = 'high';
    a.vx = 0;
    d.startMove(pr.counter);
    this.measure = null;
    this.hitstop = Math.max(this.hitstop, 12);
    this.lastResult[c.d] = { move: d.def.moves[pr.counter], kind: 'PARRY', adv: null };
    this.events.push({ type: 'parry', attacker: c.d, defender: c.a, x: (a.x + d.x) / 2, y: 70, shake: 0.004, label: label });
  };

  // --- Damage -------------------------------------------------------------------

  // Applies combo-scaled damage and handles KO. Returns the damage dealt.
  Match.prototype.dealDamage = function (ai, di, base, mult) {
    var d = this.fighters[di], combo = this.combo[di];
    combo.hits++;
    var scale = combo.hits <= 2 ? 1 : Math.max(0.3, 1 - 0.12 * (combo.hits - 2));
    var dmg = Math.max(1, Math.round(base * scale * (mult || 1)));
    combo.damage += dmg;
    d.comboHits = combo.hits;
    d.health = Math.max(0, d.health - dmg);
    if (d.health <= 0 && !d.ko) {
      d.ko = true;
      this.winner = ai;
      this.koTimer = C.KO_RESET_FRAMES;
    }
    return dmg;
  };

  // --- Strikes ------------------------------------------------------------------

  Match.prototype.applyContact = function (c) {
    var a = this.fighters[c.a], d = this.fighters[c.d], m = a.move;
    // Neither side is free on a frame where contact happens.
    a.actionable = false;
    d.actionable = false;
    var grounded = !d.isAirborne() && d.state !== 'down' && d.state !== 'wallsplat';
    var blocked = grounded && c.guard &&
      ((m.level === 'low' && c.guard === 'crouch') || (m.level !== 'low' && c.guard === 'stand'));

    // Frames until the attacker can act again, counted from this frame.
    var attackerLeft = m.total - a.moveFrame + 1;
    var hb = a.hitbox(0);
    var ev = { type: blocked ? 'block' : 'hit', attacker: c.a, defender: c.d, move: m, level: m.level,
      x: (Math.max(hb.x1, d.x - 16) + Math.min(hb.x2, d.x + 16)) / 2,
      y: (hb.y1 + hb.y2) / 2, facing: a.facing };

    // Air attacks hang the attacker in the air a moment so they can chain.
    if (m.air) a.vy = Math.max(a.vy, m.stall || 2.5);

    var charge = a.chargeLevel();
    if (blocked) {
      a.contact = 'block';
      this.events.push(ev);
      // A fully charged Order of Magnitude breaks the guard outright.
      if (charge === 2) d.guard = C.GUARD_MAX;
      this.addGuardPressure(c, m, attackerLeft);
      return;
    }

    a.contact = 'hit';
    d.stance = 'A'; // getting hit knocks you out of a stance
    var ch = c.ch;
    ev.feint = a.fromFeint; // the hit came out of a feint: the opponent fell for it
    var result = ch ? m.ch : m.hit;
    var state = d.state;
    var mult = (ch ? 1.2 : 1) * (state === 'down' ? 0.6 : 1) * (state === 'wallsplat' ? 0.85 : 1);
    if (a.calculated > 0) { mult *= C.CALCULATED_BONUS; a.calculated = 0; ev.calculated = true; }
    if (m.charge) {
      mult *= m.charge.damage[charge];
      ev.charge = charge;
      if (charge >= 1) result = { knockdown: true };
    }
    var dmg = this.dealDamage(c.a, c.d, m.damage, mult);
    var hitstop = (C.HITSTOP[m.strength] || 6) + (ch ? C.HITSTOP_CH : 0);
    ev.ch = ch; ev.punish = c.punish; ev.damage = dmg; ev.hits = this.combo[c.d].hits;
    ev.shake = m.shake * (ch ? 1.6 : 1);
    this.measure = null;

    if (d.ko && state !== 'down') {
      this.toJuggle(d, a, 7, m);
      d.noTech = true;
      hitstop = C.HITSTOP_KO; ev.shake = 0.012; ev.finisher = true;
      this.lastResult[c.a] = { move: m, kind: 'K.O.', adv: null };
    } else if (state === 'down' || d.tripped) {
      // Ground hit: limited, and it only delays the wake-up a little.
      d.groundHits++;
      d.stateFrame = Math.max(0, d.stateFrame - 10);
      ev.ground = true;
      hitstop = Math.round(hitstop * 0.7);
      this.lastResult[c.a] = { move: m, kind: 'GROUND HIT', adv: null };
    } else if (state === 'wallsplat') {
      this.wallHit(c, a, d, m, result, ev);
    } else if (d.isAirborne()) {
      this.juggleHit(c, a, d, m, ev);
    } else if (result.launch) {
      this.toJuggle(d, a, result.launch * C.LAUNCH_SNAP, m);
      ev.launch = true;
      ev.shake += 0.002;
      this.lastResult[c.a] = { move: m, kind: 'LAUNCH', adv: null };
    } else if (m.wallSplat && this.wallDistance(d, a.facing) < 40) {
      // A heavy blow next to the wall splats the opponent against it.
      d.y = 0;
      this.wallSplat(d, c.d);
      ev.finisher = true;
      this.lastResult[c.a] = { move: m, kind: 'WALL SPLAT', adv: null };
    } else if (result.knockdown) {
      this.toJuggle(d, a, 2.4, m);
      d.vx = a.facing * 0.8;
      d.tripped = true; // falling to the floor: not a juggle
      ev.knockdown = true; ev.finisher = true;
      this.lastResult[c.a] = { move: m, kind: 'KNOCKDOWN', adv: null };
    } else {
      d.setState('hitstun');
      d.stun = m.air ? m.stunHit : attackerLeft + result.adv;
      // Long combos lose hitstun, so no ground loop lasts forever.
      d.stun = Math.max(1, d.stun - C.COMBO_DECAY_STUN * Math.max(0, this.combo[c.d].hits - C.COMBO_DECAY_FROM));
      d.reaction = m.level === 'low' ? 'low' : (m.strength === 'heavy' || m.level === 'mid') ? 'mid' : 'high';
      d.vx = 0;
      this.push(a, d, m.push);
      this.startMeasure(c.a, c.d, m, ch ? 'COUNTER' : 'HIT', ch);
    }

    // Combo enders (knockdowns, splats, bounds, wall blasts) hang the longest.
    if (ev.finisher && !d.ko) hitstop = Math.max(hitstop, C.HITSTOP_FINISHER + (ch ? C.HITSTOP_CH : 0));
    this.hitstop = Math.max(this.hitstop, hitstop);
    ev.ko = d.ko;
    this.events.push(ev);
  };

  // Send the defender airborne.
  Match.prototype.toJuggle = function (d, a, vy, m) {
    d.setState('juggle');
    d.vy = Math.max(vy, 2.5);
    d.vx = a.facing * m.carry;
    d.y = Math.max(d.y, 1);
    d.juggleHits++;
    d.bounding = false;
    d.tripped = false;
    d.noTech = !!m.noTech;
  };

  // Hitting an airborne opponent: juggle pop (decaying), or a bound slam.
  Match.prototype.juggleHit = function (c, a, d, m, ev) {
    if (m.bound && !d.boundUsed) {
      // Bound: slam them into the floor; they bounce back up for more.
      d.setState('juggle');
      d.boundUsed = true;
      d.bounding = true;
      d.vy = -C.BOUND_VY;
      d.vx = a.facing * 0.4;
      d.juggleHits = Math.max(0, d.juggleHits - 1);
      d.noTech = true;
      ev.bound = true; ev.finisher = true;
      // An air spike drives the attacker down with it, to land in time to follow up.
      if (a.isAirborne()) a.vy = Math.min(a.vy, -C.BOUND_DRIVE);
      ev.shake = Math.max(ev.shake, 0.007);
      this.lastResult[c.a] = { move: m, kind: 'BOUND', adv: null };
      return;
    }
    // A controlled pop: the same move always lifts by about the same amount,
    // a little less with each juggle hit.
    var pop = (m.pop || C.JUGGLE_POP[m.strength] || 4) * Math.max(0.45, 1 - C.JUGGLE_POP_DECAY * d.juggleHits);
    this.toJuggle(d, a, pop, m);
    this.lastResult[c.a] = { move: m, kind: 'JUGGLE', adv: null };
  };

  // Hitting a wall-splatted opponent: keep them pinned (with less time per hit),
  // or blow them off the wall with a heavy or launcher.
  Match.prototype.wallHit = function (c, a, d, m, result, ev) {
    d.wallHits++;
    var heavy = m.strength === 'heavy' || m.strength === 'launch' || result.launch;
    if (heavy || d.wallHits >= C.WALL_HITS_MAX) {
      this.toJuggle(d, a, result.launch ? result.launch * 0.75 * C.LAUNCH_SNAP : 4.5, m);
      d.vx = a.facing * 0.6;
      ev.finisher = true; ev.wallBlast = true;
      this.lastResult[c.a] = { move: m, kind: 'WALL BLAST', adv: null };
      return;
    }
    d.stun = Math.max(12, C.WALL_STUN - 6 * d.wallHits);
    d.y = Math.min(d.y + 4, 40);
    d.stateFrame = Math.min(d.stateFrame, Math.floor(C.WALL_STICK / 2)); // pinned again, briefly
    ev.wall = true;
    this.lastResult[c.a] = { move: m, kind: 'WALL HIT', adv: null };
  };

  // Pushback after contact. If the defender is against a wall the attacker is pushed instead.
  Match.prototype.push = function (a, d, amount) {
    if (this.wallDistance(d, a.facing) <= 4) a.slide = -a.facing * amount / 5;
    else d.slide = a.facing * amount / 5;
  };

  // --- Guard pressure -----------------------------------------------------------

  Match.prototype.addGuardPressure = function (c, m, attackerLeft) {
    var a = this.fighters[c.a], d = this.fighters[c.d];
    d.guard += m.guardDmg != null ? m.guardDmg : GUARD_DMG[m.strength] || 8;
    d.guardDelay = C.GUARD_REGEN_DELAY;
    this.combo[c.d] = { hits: 0, damage: 0 };

    if (d.guard >= C.GUARD_MAX) {
      // Guard break: the defender staggers open and the attacker gets a big advantage.
      d.guard = 0;
      d.setState('guardbreak');
      d.stun = attackerLeft + C.GUARD_BREAK_ADV;
      d.vx = 0;
      this.push(a, d, m.push * 0.5);
      this.hitstop = Math.max(this.hitstop, 18);
      this.startMeasure(c.a, c.d, m, 'GUARD BREAK');
      this.events.push({ type: 'guardbreak', attacker: c.a, defender: c.d, x: d.x, y: 60, shake: 0.01, charge: a.chargeLevel() });
      return;
    }

    d.setState('blockstun');
    d.stun = m.air ? m.stunBlock : attackerLeft + m.block;
    d.guardCrouch = c.guard === 'crouch';
    d.vx = 0;
    this.push(a, d, m.push);
    this.hitstop = Math.max(this.hitstop, Math.round((C.HITSTOP[m.strength] || 6) * 0.6));
    this.startMeasure(c.a, c.d, m, 'BLOCK');
  };

  // Guard pressure drains once the defender hasn't blocked for a while.
  Match.prototype.updateGuard = function () {
    for (var i = 0; i < 2; i++) {
      var f = this.fighters[i];
      if (f.guardDelay > 0) f.guardDelay--;
      else if (f.guard > 0) f.guard = Math.max(0, f.guard - C.GUARD_REGEN * (f.def.guardRegenRate || 1));
    }
  };

  // --- Throws -------------------------------------------------------------------
  // A throw grabs, then the defender has a short window to press the matching
  // button (P for the front throw, K for the reverse throw) to break it.

  Match.prototype.startGrab = function (c) {
    var a = this.fighters[c.a], d = this.fighters[c.d], m = a.move;
    a.actionable = false; d.actionable = false;
    a.contact = 'hit';
    a.setState('throwing');
    d.setState('thrown');
    d.stance = 'A';
    var feinted = a.fromFeint;
    d.facing = -a.facing;
    d.vx = 0; a.vx = 0;
    this.measure = null;
    this.throwState = { a: c.a, d: c.d, move: m, start: this.frame, x0: a.x };
    this.placeThrown(0);
    this.events.push({ type: 'grab', attacker: c.a, defender: c.d, move: m, x: d.x, y: 60, feint: feinted });
  };

  Match.prototype.throwBreak = function (ai, di, why) {
    var a = this.fighters[ai], d = this.fighters[di];
    a.setState('throwbreak'); d.setState('throwbreak');
    a.faceOpponent(d); d.faceOpponent(a);
    a.slide = -a.facing * 3.5; d.slide = -d.facing * 3.5;
    this.throwState = null;
    this.hitstop = Math.max(this.hitstop, 8);
    this.lastResult[ai] = { move: a.lastMove, kind: 'BROKEN', adv: null };
    this.events.push({ type: 'break', attacker: ai, defender: di, x: (a.x + d.x) / 2, y: 64, clash: why === 'clash' });
  };

  // Position the thrown fighter along the throw's arc. u: 0..1 through the toss.
  Match.prototype.placeThrown = function (u) {
    var t = this.throwState, a = this.fighters[t.a], d = this.fighters[t.d], f = a.facing;
    var reach = 30 * a.def.scale;
    if (t.move.reverse) {
      d.x = a.x + f * (reach - (reach + 48) * u);
      d.y = 80 * Math.sin(Math.PI * u);
    } else {
      d.x = a.x + f * (reach + 26 * u);
      d.y = 64 * Math.sin(Math.PI * u);
    }
  };

  Match.prototype.updateThrow = function () {
    var t = this.throwState;
    if (!t) return;
    var a = this.fighters[t.a], d = this.fighters[t.d], buf = this.buffers[t.d];
    var tf = this.frame - t.start; // frames since the grab
    var m = t.move;

    if (tf <= C.THROW_BREAK_WINDOW) {
      // The press may come slightly before the grab lands. Pressing both buttons doesn't count.
      // Some throws have a shorter break window; command grabs (no breakBtn) can't be broken.
      if (m.breakBtn && tf <= (m.breakWindow || C.THROW_BREAK_WINDOW)) {
        var wrong = m.breakBtn === 'p' ? 'k' : 'p';
        var pressedRight = buf.pressed[m.breakBtn] >= t.start - 2 && buf.pressed[m.breakBtn] <= t.start + (m.breakWindow || C.THROW_BREAK_WINDOW);
        var pressedWrong = buf.pressed[wrong] >= t.start - 2;
        if (pressedRight && !pressedWrong) { this.throwBreak(t.a, t.d, 'break'); return; }
      }
      this.placeThrown(0);
      return;
    }
    var lift = C.THROW_SLAM_FRAME - C.THROW_BREAK_WINDOW;
    if (tf < C.THROW_SLAM_FRAME) {
      this.placeThrown((tf - C.THROW_BREAK_WINDOW) / lift);
      return;
    }
    if (tf === C.THROW_SLAM_FRAME) {
      this.placeThrown(1);
      d.y = 0;
      var dmg = this.dealDamage(t.a, t.d, m.damage);
      d.setState(d.ko ? 'ko' : 'down');
      d.groundHits = 0;
      d.faceOpponent(a);
      this.clampWall(d, C.PUSH_WIDTH * d.def.scale);
      this.hitstop = Math.max(this.hitstop, d.ko ? 30 : 14);
      this.lastResult[t.a] = { move: m, kind: 'THROW', adv: null };
      this.events.push({ type: 'hit', attacker: t.a, defender: t.d, move: m, level: 'throw', throw: true,
        x: d.x, y: 12, facing: a.facing, damage: dmg, ko: d.ko, shake: 0.009, hits: this.combo[t.d].hits });
      return;
    }
    if (tf >= C.THROW_END_FRAME) {
      a.setState('idle');
      this.throwState = null;
    }
  };
})();
