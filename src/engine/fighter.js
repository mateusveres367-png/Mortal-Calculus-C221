// A fighter: state machine, movement and boxes. Pure simulation, no rendering.
(function () {
  var C = FG.C;

  // States in which the fighter is free to act (and can guard).
  var NEUTRAL = { idle: 1, walkF: 1, walkB: 1, crouch: 1 };
  // States that a throw can grab.
  var THROWABLE = { idle: 1, walkF: 1, walkB: 1, dash: 1, run: 1, backdash: 1, sidestep: 1, land: 1, attack: 1, guardbreak: 1, prejump: 1 };
  var RUN_STOP = 6; // frames to skid to a stop out of a run

  var DASH_FRAMES = 16, DASH_ACT_FROM = 9;
  var BACKDASH_FRAMES = 22, BACKDASH_ACT_FROM = 17;
  var SIDESTEP_ACT_FROM = 14;
  var PREJUMP_FRAMES = 4, LAND_FRAMES = 4;
  var JUMP_VY = 9.5, JUMP_VX = 2.6;
  var FEINT_RECOVERY = 6, FEINT_MEMORY = 24;
  var KICK_CHAIN_MAX = 4, KICK_CHAIN_LATE = 12; // CHAI: kicks in one chain; frames after the active ones it stays open

  function Fighter(def, index) {
    this.def = def;
    this.index = index;
    this.reset(0, 1);
  }

  Fighter.prototype.reset = function (x, facing) {
    this.x = x; this.y = 0; this.z = 0;
    this.vx = 0; this.vy = 0; this.slide = 0;
    this.facing = facing;
    this.health = this.def.health;
    this.state = 'idle';
    this.stateFrame = 0;
    this.move = null; this.moveFrame = 0;
    this.contact = null;   // 'hit' | 'block' once the current move has connected
    this.stun = 0;
    this.reaction = 'high'; // hit reaction pose
    this.guardCrouch = false;
    this.sideDir = 1;
    this.ko = false;
    this.actionable = true;
    this.lastMove = null;
    this.prevX = x;
    this.landLag = LAND_FRAMES;
    this.airActions = 0;
    this.rollDir = 'back';
    this.guard = 0;        // guard pressure meter
    this.guardDelay = 0;
    this.holdGuard = false; // set by the training dummy
    this.easy = false;      // Easy Combos (player setting): mashing P continues strings
    this.stringBonus = 0;   // extra hitstun from a string follow-up (taken back if the string stops)
    this.stance = 'A';      // 'B' = alternate stance (e.g. DALSASS's Similar Triangles)
    this.fromFeint = false; // current move was cancelled out of a feint
    this.blockEndFrame = -999; // last frame this fighter came out of blockstun
    this.whiffed = false;      // an attack just ended without touching anything (read by the match)
    this.calculated = 0;       // MIYASHIRO's Calculated: frames left of the damage bonus
    this.meter = 0;            // Grade meter, 0..METER_MAX (C, B, A: one bar each)
    this.infiniteMeter = false; // training: the meter stays full
    this.extraCredit = false;  // Extra Credit used this match (the scene carries it between rounds)
    this.boost = 0;            // Extra Credit: frames left of the damage boost
    this.experience = this.experience || 0; // WILSON's 29 YEARS: rounds behind him this match (the scene sets it)
    this.seen = {};            // WILSON's Seen It All: how often the opponent used each move this round
    this.seenUsed = false;     // ...and whether he has countered one yet
    this.feintPending = 0;     // DALSASS feinted a move: frames in which the next one counts as out of a feint
    this.swayed = false;       // DALSASS's sway made an attack miss (opens the sway counter)
    this.projOut = 0;          // their projectiles on screen (the match counts them; one at a time)
    this.projSerial = 0;       // which throw of a projectile move this is (the match matches them up)
    this.throwNow = null;      // a projectile to release this frame (read and cleared by the match)
    this.teleportNow = null;   // a teleport to make this frame (read and cleared by the match)
    this.legHits = 0;          // MATEUS's Low Kick: kicks landed toward leg damage
    this.legDamage = 0;        // ...and frames left of the slowed walk
    this.clinchAct = null;     // MATEUS in the clinch: the follow-up playing { move, t }
    this.checking = 0;         // MATEUS's Check: frames left of the shin-check pose
    this.clearComboFlags();
  };

  // Per-combo limits, cleared whenever the fighter is free again.
  Fighter.prototype.clearComboFlags = function () {
    this.dashCancelUsed = false;
    this.chainUsed = false; // WILSON's Chain Rule: one cancel into anything per string
    this.juggleHits = 0;
    this.comboHits = 0;     // hits taken in the current combo (juggle gravity grows with it)
    this.wallUsed = false;
    this.wallHits = 0;
    this.boundUsed = false;
    this.bounding = false;
    this.groundHits = 0;
    this.noTech = false;
    this.tripped = false;   // knocked down and falling: only ground hits reach them
  };

  Fighter.prototype.setState = function (s) {
    this.state = s;
    this.stateFrame = 0;
    if (s !== 'attack') { this.move = null; this.moveFrame = 0; }
  };

  Fighter.prototype.isAirborne = function () {
    return this.state === 'air' || this.state === 'juggle' || (this.state === 'attack' && this.move.air);
  };

  Fighter.prototype.isCrouching = function () {
    if (this.state === 'crouch') return true;
    if (this.state === 'blockstun' && this.guardCrouch) return true;
    if (this.state === 'attack' && this.move.crouching) return true;
    return false;
  };

  // grabsCrouch: command grabs (RAMOS's Identity) also take crouching opponents.
  Fighter.prototype.isThrowable = function (grabsCrouch) {
    var crouchOk = grabsCrouch && (this.state === 'crouch' || this.state === 'attack');
    return (!!THROWABLE[this.state] || crouchOk) && (!this.isCrouching() || grabsCrouch) && !this.isAirborne();
  };

  // Charge level of the current charge move: 0 (tap), 1, or 2 (full).
  Fighter.prototype.chargeLevel = function () {
    var c = this.move && this.move.charge;
    if (!c) return 0;
    return this.chargeFrames >= c.max ? 2 : this.chargeFrames >= c.mid ? 1 : 0;
  };

  Fighter.prototype.inCounterHitWindow = function () {
    return this.state === 'attack' && this.moveFrame <= this.move.startup + this.move.active - 1;
  };

  // In the active window of a parry move (CHAI's Reflection Counter, LOPEZ's Derivative Read)?
  Fighter.prototype.parryWindow = function () {
    if (this.state !== 'attack' || !this.move.parry) return null;
    var pr = this.move.parry;
    return this.moveFrame >= pr.from && this.moveFrame <= pr.to ? pr : null;
  };

  Fighter.prototype.inRecovery = function () {
    return this.state === 'attack' && this.moveFrame > this.move.startup + this.move.active - 1;
  };

  // Guard stance if hit right now: null, 'stand' or 'crouch'.
  Fighter.prototype.guardStance = function (buf) {
    if (this.state === 'blockstun') return buf.held.down ? 'crouch' : 'stand';
    if (!NEUTRAL[this.state] && this.state !== 'land') return null;
    if (!buf.back(this.facing)) return null;
    return buf.held.down ? 'crouch' : 'stand';
  };

  Fighter.prototype.startMove = function (id) {
    var m = this.def.moves[id];
    if (m.projectile) this.projSerial++;
    var prev = this.state === 'attack' ? this.move : null;
    this.fromFeint = !!(prev && prev.feint) || this.feintPending > 0;
    // Kick Chain: the kicks used so far in this chain (a fresh attack starts a new one).
    this.kickChain = this.chainNext || [];
    this.chainNext = null;
    this.feintPending = 0;
    this.swayed = false;
    this.fromCancel = false;
    // How many times in a row this move has cancelled into itself (Recursive Rush).
    this.repeatCount = prev && prev.id === id ? (this.repeatCount || 0) + 1 : 0;
    this.chargeFrames = 0;
    this.holdFrames = 0;
    this.armorHits = 0; // hits absorbed by this move's armor (PEDERSEN)
    this.multiHits = 0; // extra hits a multi-hit move has made
    this.contactAt = 0; // move frame of the latest contact
    this.setState('attack');
    this.move = m;
    this.moveFrame = 1;
    this.contact = null;
    if (!m.air) this.vx = 0;
    this.lastMove = m;
    this.startedMove = m; // read (and cleared) by the match for whiff sounds
  };

  Fighter.prototype.faceOpponent = function (opp) {
    if (opp.x > this.x + 0.5) this.facing = 1;
    else if (opp.x < this.x - 0.5) this.facing = -1;
  };

  // One frame of decision making. Sets this.actionable when the fighter is free.
  Fighter.prototype.think = function (buf, opp, frame) {
    this.actionable = false;
    this.whiffed = false;
    if (this.calculated > 0) this.calculated--;
    if (this.boost > 0) this.boost--;
    if (this.legDamage > 0) this.legDamage--;
    if (this.checking > 0) this.checking--;
    if (this.feintPending > 0) this.feintPending--;
    this.stateFrame++;
    var s = this.state;

    switch (s) {
      case 'attack': {
        var m = this.move;
        // Charge moves (PEDERSEN's Order of Magnitude) pause their windup while the button is held.
        if (m.charge && this.moveFrame === m.charge.at && buf.held[m.charge.btn] && this.chargeFrames < m.charge.max) {
          this.chargeFrames++;
          this.vx = 0;
          return;
        }
        // Held stances (LOPEZ's Derivative Read) stay up while the button is held.
        if (m.hold && this.moveFrame === m.hold.at && buf.held[m.hold.btn] && this.holdFrames < m.hold.max) {
          this.holdFrames++;
          this.vx = 0;
          return;
        }
        this.moveFrame++;
        if (!m.air) this.vx = (m.step && this.moveFrame >= m.step[0] && this.moveFrame <= m.step[1]) ? m.step[2] * this.facing : 0;
        // Projectiles (students): released on their frame. Teleports (JACK's Seat
        // Swap): the match moves them next to the opponent on theirs.
        if (m.projectile && this.moveFrame === (m.projectile.at || m.startup)) this.throwNow = m;
        if (m.teleport && this.moveFrame === m.teleport.at) this.teleportNow = m.teleport;
        // A multi-hit move gets another hit in a few frames after each contact.
        if (m.multi && this.contact && this.multiHits < m.multi && this.moveFrame - this.contactAt >= C.MULTI_GAP && this.isActiveFrame()) {
          this.contact = null;
          this.multiHits++;
        }
        if (this.tryEnhance(buf, frame)) return;
        if (this.contact === 'hit' && this.tryUltimate(buf, frame)) return; // cancel a hit into the ultimate
        if (this.tryThrowConversion(buf, frame)) return;
        if (this.tryFeint(buf, frame)) return;
        if (this.tryKickChain(buf, frame)) return;
        if (this.tryDashCancel(buf, frame)) return;
        if (this.tryCancel(buf, frame, opp)) return;
        if (this.moveFrame <= m.total) return;
        if (!this.contact && m.box) this.whiffed = true;
        if (m.stare) this.stared = true; // WILSON's Stare: read by the match (a little meter)
        if (m.air) { this.setState('air'); return; }
        if (m.stanceSwitch) this.stance = this.stance === 'B' ? 'A' : 'B';
        this.setState('idle');
        break;
      }
      case 'hitstun':
      case 'blockstun':
      case 'guardbreak':
        this.vx = 0;
        if (s === 'blockstun') this.guardCrouch = buf.held.down;
        if (--this.stun > 0) return;
        if (s === 'blockstun') this.blockEndFrame = frame;
        this.setState(buf.held.down ? 'crouch' : 'idle');
        break;
      case 'wallsplat':
        this.vx = 0;
        if (--this.stun > 0) return;
        // Slump to the floor; there's no teching out of a wall splat.
        this.y = 0;
        this.setState('down');
        this.groundHits = 0;
        return;
      case 'dash':
        this.vx *= this.def.dashDecay || 0.86;
        // Cardio: some fighters (RAMOS) can chain straight into another dash.
        if (this.def.dashChainFrom && this.stateFrame >= this.def.dashChainFrom && buf.doubleTap('forward', this.facing, frame)) {
          buf.clearTaps();
          this.setState('dash');
          this.vx = this.def.dashSpeed * this.facing;
          return;
        }
        if (this.stateFrame >= (this.def.dashFrames || DASH_FRAMES)) {
          // Cardio (RAMOS): keep holding forward and the dash turns into a run.
          if (this.def.runSpeed && buf.forward(this.facing)) { this.setState('run'); this.vx = this.def.runSpeed * this.facing; return; }
          this.setState('idle');
          break;
        }
        if (this.stateFrame >= (this.def.dashAttackFrom || DASH_ACT_FROM) && this.tryAttack(buf, frame)) return;
        return;
      case 'run':
        // He can run for as long as forward is held; let go and he skids to a stop.
        if (!buf.forward(this.facing)) { this.setState('land'); this.landLag = RUN_STOP; this.vx = 0; return; }
        this.vx = this.def.runSpeed * this.facing;
        if (this.tryAttack(buf, frame)) return;
        return;
      case 'backdash':
        // Fighters can have their own backdash (LOPEZ's Asymptote Backdash).
        this.vx *= this.def.backdashDecay || 0.87;
        if (this.stateFrame >= (this.def.backdashFrames || BACKDASH_FRAMES)) { this.setState('idle'); break; }
        if (this.stateFrame >= (this.def.backdashActFrom || BACKDASH_ACT_FROM) && this.tryAttack(buf, frame)) return;
        return;
      case 'sidestep':
        this.vx = 0;
        if (this.stateFrame >= this.sidestepFrames()) { this.setState('idle'); break; }
        // Some fighters (CHAI) can attack out of a sidestep earlier than others.
        if (this.stateFrame >= (this.def.ssAttackFrom || SIDESTEP_ACT_FROM) && this.tryAttack(buf, frame)) return;
        return;
      case 'prejump':
        if (this.stateFrame >= PREJUMP_FRAMES) {
          this.setState('air');
          this.vy = this.def.jumpVy || JUMP_VY;
          this.vx = this.jumpDir * (this.def.jumpVx || JUMP_VX) * this.facing;
          this.airActions = 0;
        }
        return;
      case 'air':
        if (this.airActions < C.AIR_ACTIONS && this.tryAirAttack(buf, frame)) return;
        return;
      case 'juggle':
      case 'ko':
      case 'throwing':
      case 'thrown':
      case 'clinch':    // the clinch (the match drives it)
      case 'clinched':
      case 'cinematic': // an ultimate is playing (the match drives it)
        return;
      case 'land':
        this.vx = 0;
        if (this.stateFrame < this.landLag) return;
        this.setState('idle');
        break;
      case 'down':
        this.vx = 0;
        if (this.ko) return;
        if (this.stateFrame === 1) this.faceOpponent(opp);
        if (this.stateFrame >= C.DOWN_FRAMES) { this.setState('getup'); return; }
        if (this.stateFrame >= C.QUICK_RISE_FROM) this.wakeUp(buf, frame);
        return;
      case 'getup':
        if (this.stateFrame < C.GETUP_FRAMES) return;
        this.setState('idle');
        break;
      case 'roll':
        this.vx = this.rollDir === 'back' ? -2.6 * this.facing : this.rollDir === 'fwd' ? 2.6 * this.facing : 0;
        if (this.stateFrame < C.ROLL_FRAMES) return;
        this.vx = 0;
        this.setState('idle');
        break;
      case 'techroll':
        this.vx = -1.0 * this.facing;
        if (this.stateFrame < C.TECH_FRAMES) return;
        this.vx = 0;
        this.setState('idle');
        break;
      case 'throwbreak':
        if (this.stateFrame < C.THROW_BREAK_FRAMES) return;
        this.setState('idle');
        break;
    }

    // Neutral: free to act this frame.
    this.actionable = true;
    this.clearComboFlags();
    this.faceOpponent(opp);
    this.neutral(buf, frame);
  };

  // Wake-up options from a knockdown.
  Fighter.prototype.wakeUp = function (buf, frame) {
    var btn = buf.latest(['p', 'k', 'h'], frame);
    if (btn) { buf.consume(btn); this.startMove(btn === 'k' ? 'wakeLow' : 'wakeMid'); return; }
    if (buf.wasPressed('ssIn', frame) || buf.wasPressed('ssOut', frame)) {
      this.sideDir = buf.wasPressed('ssIn', frame) ? 1 : -1;
      buf.consume('ssIn'); buf.consume('ssOut');
      this.rollDir = 'side'; this.setState('roll');
      return;
    }
    if (buf.back(this.facing)) { this.rollDir = 'back'; this.setState('roll'); return; }
    if (buf.forward(this.facing)) { this.rollDir = 'fwd'; this.setState('roll'); return; }
    if (buf.held.up) { buf.consume('up'); this.setState('getup'); }
  };

  // P and K pressed together throws (back + P + K is the reverse throw).
  function throwPressed(buf, frame) {
    return buf.wasPressed('p', frame) && buf.wasPressed('k', frame) && Math.abs(buf.pressed.p - buf.pressed.k) <= 2;
  }

  Fighter.prototype.startThrow = function (buf, frame) {
    var dirs = buf.dirsFor('p', frame);
    buf.consume('p'); buf.consume('k');
    this.stance = 'A';
    // Out of a run (RAMOS): the running command grab.
    if (this.state === 'run' && this.def.moves.runGrab) { this.startMove('runGrab'); return; }
    this.startMove(buf.back(this.facing, dirs) ? 'throwB' : this.pick(buf.forward(this.facing, dirs) ? ['cmdGrab', 'throw'] : ['throw']));
  };

  // Enhanced specials: P+K during a special's startup powers it up (moves[id + 'EX'])
  // for one bar of Grade meter. The move keeps its timing; the match reports it.
  Fighter.prototype.tryEnhance = function (buf, frame) {
    var m = this.move, ex = m.ex && this.def.moves[m.id + FG.EX_SUFFIX];
    if (!ex || this.contact || this.moveFrame >= m.startup || !throwPressed(buf, frame)) return false;
    if (this.meter < C.METER_BAR) return false;
    if (!this.infiniteMeter) this.meter -= C.METER_BAR;
    buf.consume('p'); buf.consume('k');
    this.move = ex;
    this.lastMove = ex;
    this.enhancedNow = true; // read (and cleared) by the match for the event
    return true;
  };

  // Feint (DALSASS): tapping back during a move's startup cancels it before it
  // comes out. The next attack counts as out of a feint.
  Fighter.prototype.tryFeint = function (buf, frame) {
    var m = this.move;
    if (!this.def.feintCancel || !m.box || m.air || m.throw || this.contact) return false;
    if (this.moveFrame < 3 || this.moveFrame >= m.startup - 1) return false;
    var tap = (this.facing > 0 ? buf.leftTaps : buf.rightTaps)[1];
    if (tap <= frame - (this.moveFrame - 1) || frame - tap > 1) return false; // a fresh tap since the move began
    this.cancelled = 'feint';
    this.setState('land');
    this.landLag = FEINT_RECOVERY;
    this.feintPending = FEINT_MEMORY;
    return true;
  };

  // Kick Chain (CHAI): once a kick connects, K or H into a different kick cancels
  // it, up to KICK_CHAIN_MAX kicks in a row. def.kickChain can be { max, onHit }
  // (NICOLAS: only kicks that hit chain, but the chains run longer).
  Fighter.prototype.tryKickChain = function (buf, frame) {
    var m = this.move, kc = this.def.kickChain;
    if (!kc || !m.kick || !this.contact) return false;
    if (kc.onHit && this.contact !== 'hit') return false;
    if (this.moveFrame < m.startup || this.moveFrame > m.startup + m.active - 1 + KICK_CHAIN_LATE) return false;
    var used = (this.kickChain || []).concat([m.id]);
    if (used.length >= (kc.max || KICK_CHAIN_MAX)) return false;
    var btn = buf.latest(['k', 'h'], frame);
    if (!btn) return false;
    // The move's own follow-up on that button wins (NICOLAS's Snap Kick: K, K, K).
    var self = this;
    if ((m.cancels || []).some(function (c) { return c.btn === btn && self.cancelOpen(c) && self.plainOk(c, buf, frame); })) return false;
    var id = this.resolveMove(btn, buf, frame), next = id && this.def.moves[id];
    if (!next || !next.kick || used.indexOf(id) >= 0) return false;
    buf.consume(btn);
    this.chainNext = used;
    return this.doCancel({ into: id });
  };

  // Dash cancel (LEE): once an attack connects (hit or block), a forward double tap
  // in its recovery cancels into a dash, to keep up the pressure.
  Fighter.prototype.tryDashCancel = function (buf, frame) {
    var m = this.move;
    if (!this.def.dashCancel || m.air || !this.contact || !this.inRecovery() || this.dashCancelUsed) return false;
    if (!buf.doubleTap('forward', this.facing, frame)) return false;
    buf.clearTaps();
    this.dashCancelUsed = true; // once per string: it resets when he's free again
    this.cancelled = 'dash';
    this.setState('dash');
    this.vx = this.def.dashSpeed * this.facing;
    return true;
  };

  // Exponential Armor (PEDERSEN): during a move's armor window, the first hit (two at
  // a full charge) is absorbed and the move keeps going.
  Fighter.prototype.armorUp = function (m) {
    var ar = this.state === 'attack' && this.move.armor;
    if (!ar || m.throw || this.moveFrame < ar.from || this.moveFrame > ar.to) return false;
    var hits = ar.hits + (this.move.charge && this.chargeLevel() === 2 ? 1 : 0);
    return this.armorHits < hits;
  };

  // In the evasive window of a sway (DALSASS): attacks of these levels miss.
  Fighter.prototype.evades = function (m) {
    var ev = this.state === 'attack' && this.move.evade;
    return !!(ev && !m.throw && this.moveFrame >= ev.from && this.moveFrame <= ev.to && ev.levels.indexOf(m.level) >= 0);
  };

  // WILSON's 29 YEARS: faster from round 2.
  Fighter.prototype.speedK = function () {
    return this.def.passive === '29years' && this.experience >= 1 ? C.YEARS_SPEED : 1;
  };

  // Leg damage (MATEUS's Low Kick) slows the walk.
  Fighter.prototype.legK = function () { return this.legDamage > 0 ? C.LEG_SLOW : 1; };

  Fighter.prototype.sidestepFrames = function () { return this.def.sidestepFrames || C.SIDESTEP_FRAMES; };

  // Pick the first move this fighter has from a list of candidates.
  Fighter.prototype.pick = function (ids) {
    for (var i = 0; i < ids.length; i++) if (this.def.moves[ids[i]]) return ids[i];
    return null;
  };

  // Which move a button press means right now, from the directions held and the
  // fighter's state. Missing directional moves fall back to the plain one.
  Fighter.prototype.resolveMove = function (btn, buf, frame) {
    var id = this.resolveMoveRaw(btn, buf, frame), m = id && this.def.moves[id];
    // One projectile on screen at a time: with one out, the button is the plain move.
    if (m && m.projectile && this.projOut > 0) return this.pick([PLAIN[btn]]);
    return id;
  };
  Fighter.prototype.resolveMoveRaw = function (btn, buf, frame) {
    // Directions as they were when the button was pressed (it may have been buffered).
    var dirs = buf.dirsFor(btn, frame);
    var down = dirs.down, back = buf.back(this.facing, dirs), fwd = buf.forward(this.facing, dirs);
    var B = btn.toUpperCase();
    // Right after blocking (LOPEZ's Mean Value Punish).
    if (btn === 'p' && this.def.moves.postBlockP && frame - this.blockEndFrame <= this.def.postBlockWindow) return 'postBlockP';
    if (this.stance === 'B') {
      if (btn === 'p' && back && this.def.moves.bP) return 'bP'; // switch back
      var st = this.pick(['pw' + B]);
      if (st) return st;
    }
    if (this.state === 'dash' && btn === 'p') { var dp = this.pick(['dashP']); if (dp) return dp; }
    if (this.state === 'dash' && btn === 'k') { var dk = this.pick(['dashK']); if (dk) return dk; } // NICOLAS's Hopping Side Kick
    // Attacks out of a run: P, K, D+K, H.
    if (this.state === 'run') { var rn = this.pick([btn === 'k' && down ? 'runDK' : 'run' + B]); if (rn) return rn; }
    if (this.state === 'sidestep') { var sp = this.pick(['ss' + B]); if (sp) return sp; }
    if (btn === 'p') return this.pick(down ? ['dP', 'jab'] : fwd ? ['fP', 'jab'] : back ? ['bP', 'jab'] : ['jab']);
    if (btn === 'k') {
      if (down) return this.pick(back ? ['sweep', 'low'] : fwd ? ['dfK', 'low'] : ['low']);
      return this.pick(fwd ? ['fK', 'mid'] : back ? ['bK', 'mid'] : ['mid']);
    }
    if (down) return this.pick(['launcher']);
    return this.pick(fwd ? ['fH', 'heavy'] : back ? ['bH', 'heavy'] : ['heavy']);
  };

  // Ultimate: with all three bars of Grade meter, the ultimate key, or down,
  // down-forward, forward + P+K+H.
  Fighter.prototype.tryUltimate = function (buf, frame) {
    if (!this.def.moves.ultimate) return false;
    var key = buf.wasPressed('u', frame);
    if (!key && (!buf.allThree(frame) || !buf.qcf(this.facing, frame))) return false;
    if (this.meter < C.METER_MAX) { if (key) buf.consume('u'); return false; }
    if (!this.infiniteMeter) this.meter = 0;
    if (key) buf.consume('u');
    else { buf.consume('p'); buf.consume('k'); buf.consume('h'); }
    this.stance = 'A';
    this.startMove('ultimate');
    this.ultStarted = true; // read (and cleared) by the match for the event
    return true;
  };

  // Extra Credit: below a quarter of their health, once a match, P+K+H refills the
  // Grade meter and boosts their damage for a while.
  Fighter.prototype.canExtraCredit = function () {
    return !this.extraCredit && !this.ko && this.health <= this.def.health * C.EXTRA_CREDIT_HEALTH;
  };
  Fighter.prototype.tryExtraCredit = function (buf, frame) {
    if (!this.canExtraCredit() || !buf.allThree(frame)) return false;
    buf.consume('p'); buf.consume('k'); buf.consume('h');
    this.extraCredit = true;
    this.meter = C.METER_MAX;
    this.boost = C.BOOST_FRAMES;
    this.extraCreditNow = true; // read (and cleared) by the match for the event
    return true;
  };

  // Stage objects: T next to one that's ready uses it (back + T vaults out).
  Fighter.prototype.tryProp = function (buf, frame) {
    if (!this.props || !NEUTRAL[this.state] || !buf.wasPressed('t', frame)) return false;
    var best = null, self = this;
    this.props.forEach(function (p) { if (p.cool === 0 && Math.abs(p.x - self.x) <= C.PROP_REACH && (!best || Math.abs(p.x - self.x) < Math.abs(best.x - self.x))) best = p; });
    if (!best) return false;
    buf.consume('t');
    var esc = buf.back(this.facing);
    this.stance = 'A';
    this.startMove(esc ? 'propEsc' : 'propAtk');
    best.cool = C.PROP_COOLDOWN; best.use = esc ? 'escape' : 'attack'; best.by = this.index; best.t = 0;
    this.propUsed = best; // read (and cleared) by the match for the event
    return true;
  };

  // Vaulting over the opponent: no body collision.
  Fighter.prototype.vaulting = function () {
    if (this.state !== 'attack') return false;
    var tp = this.move.teleport;
    if (tp) return this.moveFrame >= tp.hide[0] && this.moveFrame <= tp.hide[1]; // gone (underground, or mid-swap)
    return !!this.move.vault && this.moveFrame >= this.move.step[0] && this.moveFrame <= this.move.step[1];
  };

  Fighter.prototype.tryAttack = function (buf, frame) {
    if (this.tryUltimate(buf, frame)) return true;
    if (this.tryExtraCredit(buf, frame)) return true;
    if (this.tryProp(buf, frame)) return true;
    if (throwPressed(buf, frame)) { this.startThrow(buf, frame); return true; }
    if (buf.wasPressed('t', frame) && this.def.moves.taunt && this.state !== 'sidestep') {
      buf.consume('t');
      this.stance = 'A';
      this.startMove('taunt');
      return true;
    }
    var btn = buf.latest(['p', 'k', 'h'], frame);
    if (!btn) return false;
    buf.consume(btn);
    var id = this.resolveMove(btn, buf, frame);
    var wasStance = this.stance === 'B' && id && id.indexOf('pw') === 0;
    if (wasStance) this.stance = 'A'; // stance attacks leave the stance
    this.startMove(id);
    return true;
  };

  // The second throw button can arrive a frame or two after the first: turn the
  // jab or kick that just started into the throw.
  Fighter.prototype.tryThrowConversion = function (buf, frame) {
    var m = this.move;
    if (this.moveFrame > 3) return false;
    if ((m.id === 'jab' && buf.wasPressed('k', frame, 3)) || (m.id === 'mid' && buf.wasPressed('p', frame, 3))) {
      this.startThrow(buf, frame);
      return true;
    }
    return false;
  };

  Fighter.prototype.tryAirAttack = function (buf, frame) {
    var btn = buf.latest(['p', 'k', 'h'], frame);
    if (!btn) return false;
    buf.consume(btn);
    this.startMove(btn === 'p' ? 'airP' : btn === 'k' ? 'airK' : 'airH');
    this.airActions++;
    return true;
  };

  // A cancel marked `plain` only takes the button with no direction (NICOLAS's Snap
  // Kick: K, K, K; F+K out of it is a Kick Chain into the Back Kick instead).
  Fighter.prototype.plainOk = function (c, buf, frame) {
    if (!c.plain) return true;
    var d = buf.dirsFor(c.btn, frame);
    return !d.down && !buf.forward(this.facing, d) && !buf.back(this.facing, d);
  };

  // Is cancel c open on this frame?
  Fighter.prototype.cancelOpen = function (c) {
    if (this.moveFrame < c.from || this.moveFrame > c.to) return false;
    // A hit gets its chance to land: until the move connects, it can't be
    // cancelled during its active frames.
    if (!this.contact && c.btn !== 'up' && this.isActiveFrame()) return false;
    if (c.onContact && !this.contact) return false;
    if (c.onHit && this.contact !== 'hit') return false;
    if (c.onSway && !this.swayed) return false;
    if (c.into === this.move.id && (this.repeatCount || 0) >= (c.max || 0)) return false;
    return true;
  };

  Fighter.prototype.tryCancel = function (buf, frame, opp) {
    var cancels = this.move.cancels, i, c;
    if (!cancels) return false;
    // Easy Combos (a player setting): mashing P continues any string with the best
    // follow-up: the string heavy against an airborne opponent, otherwise the first
    // listed hit (never a feint, a jump or a throw).
    if (this.easy && buf.wasPressed('p', frame)) {
      var moves = this.def.moves;
      var hits = cancels.filter(function (x) { return x.btn !== 'up' && x.btn !== 'throw' && moves[x.into] && moves[x.into].box; });
      if (opp && opp.isAirborne()) hits.sort(function (x, y) { return (y.into === 'jabH') - (x.into === 'jabH'); });
      for (i = 0; i < hits.length; i++) {
        if (!this.cancelOpen(hits[i])) continue;
        buf.consume('p');
        return this.doCancel(hits[i]);
      }
    }
    if (this.tryAnyCancel(buf, frame, true)) return true;
    for (i = 0; i < cancels.length; i++) {
      c = cancels[i];
      if (c.btn === 'any' || !this.cancelOpen(c)) continue;
      if (c.btn === 'throw') {
        if (!throwPressed(buf, frame)) continue;
        buf.consume('p'); buf.consume('k');
      } else {
        if (!buf.wasPressed(c.btn, frame) || !this.plainOk(c, buf, frame)) continue;
        buf.consume(c.btn);
      }
      return this.doCancel(c);
    }
    return this.tryAnyCancel(buf, frame, false);
  };

  // Chain Rule (WILSON): cancel into any of his other moves, once a string. A press
  // with a direction (F+P, D+H...) goes here first; a plain button keeps the string's
  // own follow-up (P, P, H is still the string ender).
  var PLAIN = { p: 'jab', k: 'mid', h: 'heavy' };
  Fighter.prototype.tryAnyCancel = function (buf, frame, directedOnly) {
    var cancels = this.move.cancels || [];
    for (var i = 0; i < cancels.length; i++) {
      var c = cancels[i];
      if (c.btn !== 'any' || this.chainUsed || !this.cancelOpen(c)) continue;
      var btn = buf.latest(['p', 'k', 'h'], frame);
      if (!btn) return false;
      var id = this.resolveMove(btn, buf, frame), mv = id && this.def.moves[id];
      if (directedOnly && id === PLAIN[btn]) return false;
      if (!mv || id === this.move.id || id === 'jab' || mv.throw || mv.taunt) return false;
      buf.consume(btn);
      this.chainUsed = true;
      return this.doCancel({ into: id });
    }
    return false;
  };

  Fighter.prototype.doCancel = function (c) {
    this.cancelled = c.into; // read (and cleared) by the match for the cancel event
    if (c.into === 'jump') {
      // Jump cancel: chase the launched opponent into the air.
      this.setState('air');
      this.vy = C.SUPER_JUMP_VY;
      this.vx = C.SUPER_JUMP_VX * this.facing;
      this.airActions = 0;
      this.superJump = true;
    } else {
      if (this.move.air) this.airActions++;
      // A kick cancelled into another kick keeps the Kick Chain's count going.
      if (this.def.kickChain && this.move.kick && this.def.moves[c.into] && this.def.moves[c.into].kick && !this.chainNext) this.chainNext = (this.kickChain || []).concat([this.move.id]);
      this.startMove(c.into);
      this.fromCancel = true; // a string follow-up (gets the combo hitstun bonus)
    }
    return true;
  };

  Fighter.prototype.neutral = function (buf, frame) {
    var d = this.def;
    if (this.tryAttack(buf, frame)) return;
    // Any movement leaves an alternate stance; standing still keeps it.
    if (this.stance === 'B') {
      var h = buf.held;
      if (h.left || h.right || h.up || h.down || buf.wasPressed('ssIn', frame) || buf.wasPressed('ssOut', frame)) this.stance = 'A';
      else { if (this.state !== 'idle') this.setState('idle'); this.vx = 0; return; }
    }

    if (buf.wasPressed('ssIn', frame) || buf.wasPressed('ssOut', frame)) {
      this.sideDir = buf.wasPressed('ssIn', frame) ? 1 : -1;
      buf.consume('ssIn'); buf.consume('ssOut');
      this.setState('sidestep');
      return;
    }
    if (buf.doubleTap('forward', this.facing, frame)) {
      buf.clearTaps();
      this.setState('dash');
      this.vx = d.dashSpeed * this.speedK() * this.facing;
      return;
    }
    if (buf.doubleTap('back', this.facing, frame)) {
      buf.clearTaps();
      this.setState('backdash');
      this.vx = -d.backdashSpeed * this.speedK() * this.facing;
      return;
    }
    if (buf.held.up) {
      this.jumpDir = buf.forward(this.facing) ? 1 : buf.back(this.facing) ? -1 : 0;
      this.setState('prejump');
      this.vx = 0;
      return;
    }
    if (buf.held.down) {
      if (this.state !== 'crouch') this.setState('crouch');
      this.vx = 0;
      return;
    }
    if (buf.forward(this.facing)) {
      if (this.state !== 'walkF') this.setState('walkF');
      this.vx = d.walkF * this.speedK() * this.legK() * this.facing;
      return;
    }
    if (buf.back(this.facing)) {
      if (this.holdGuard) {
        // Training dummy: guard in place rather than walking away.
        if (this.state !== 'idle') this.setState('idle');
        this.vx = 0;
        return;
      }
      if (this.state !== 'walkB') this.setState('walkB');
      this.vx = -d.walkB * this.speedK() * this.legK() * this.facing;
      return;
    }
    if (this.state !== 'idle') this.setState('idle');
    this.vx = 0;
  };

  Fighter.prototype.physics = function (opp) {
    this.prevX = this.x;
    if (this.state === 'throwing' || this.state === 'thrown' || this.state === 'clinch' || this.state === 'clinched') {
      // Positions are driven by the throw (or clinch) script in the match.
      this.slide = 0;
    } else if (this.isAirborne()) {
      var juggled = this.state === 'juggle';
      // Heavier fighters (def.weight) fall faster in juggles; the difference phases in
      // over the first few hits, so a launcher's opener feels the same on everyone.
      this.vy -= juggled ? FG.juggleGravity(this.comboHits) * FG.weightFactor(this.def.weight, this.comboHits) : C.GRAVITY;
      this.y += this.vy;
      this.x += this.vx;
      if (this.y <= 0) {
        this.y = 0;
        if (juggled && this.bounding) {
          // Bound: bounce off the floor back into a juggle.
          this.bounding = false;
          this.vy = C.BOUNCE_VY;
          this.vx *= 0.5;
          this.bounced = true;
        } else if (juggled) {
          this.vy = 0; this.vx = 0;
          this.setState(this.ko ? 'ko' : 'down');
          this.groundHits = 0;
          this.landed = true;
        } else {
          // Jump or air attack landing; air attacks have their own landing lag.
          this.landLag = this.state === 'attack' ? this.move.landLag : LAND_FRAMES;
          this.vy = 0; this.vx = 0;
          this.setState('land');
          this.superJump = false;
          this.faceOpponent(opp);
        }
      }
    } else if (this.state === 'wallsplat') {
      // Stuck to the wall for a moment, then sliding down it.
      if (this.stateFrame > C.WALL_STICK) this.y = Math.max(0, this.y - 1.5);
    } else {
      this.x += this.vx;
    }
    if (this.slide) {
      this.x += this.slide;
      this.slide *= 0.8;
      if (Math.abs(this.slide) < 0.1) this.slide = 0;
    }
    var depthFrames = this.state === 'sidestep' ? this.sidestepFrames() :
      this.state === 'techroll' ? C.TECH_FRAMES :
      (this.state === 'roll' && this.rollDir === 'side') ? C.ROLL_FRAMES : 0;
    if (depthFrames) {
      this.z = this.sideDir * (this.state === 'sidestep' && this.def.sidestepDepth || C.SIDESTEP_DEPTH) * Math.sin(Math.PI * Math.min(1, this.stateFrame / depthFrames));
    } else if (this.state === 'attack' && this.move.keepZ && this.moveFrame < this.move.startup) {
      // Sidestep attacks stay off the line until they hit.
    } else {
      this.z *= 0.7;
      if (Math.abs(this.z) < 0.2) this.z = 0;
    }
  };

  // --- Boxes (world space, y = height above the floor) ------------------------

  function rect(x1, x2, y1, y2) {
    return { x1: Math.min(x1, x2), x2: Math.max(x1, x2), y1: y1, y2: y2 };
  }

  Fighter.prototype.isInvulnerable = function () {
    switch (this.state) {
      case 'getup': case 'ko': case 'thrown': case 'throwing': case 'clinch': case 'clinched': return true;
      case 'roll': return this.stateFrame <= C.ROLL_INVULN;
      case 'techroll': return this.stateFrame <= C.TECH_INVULN;
      case 'throwbreak': return this.stateFrame <= 6;
      case 'cinematic': return true;
      case 'attack': { var iv = this.move.invuln; return !!iv && this.moveFrame >= iv[0] && this.moveFrame <= iv[1]; } // a vault
    }
    return false;
  };

  Fighter.prototype.hurtboxes = function () {
    if (this.isInvulnerable()) return [];
    var s = this.def.scale, x = this.x, y = this.y, f = this.facing;
    var boxes;
    if (this.state === 'down') {
      boxes = [rect(x - 34 * s, x + 34 * s, 0, 14 * s)];
    } else if (this.state === 'juggle') {
      boxes = [rect(x - 30 * s * f, x + 20 * s * f, Math.max(0, y - 8 * s), y + 50 * s)];
    } else if (this.isAirborne()) {
      boxes = [rect(x - 16 * s, x + 16 * s, y + 8 * s, y + 86 * s)];
    } else if (this.state === 'wallsplat') {
      boxes = [rect(x - 16 * s, x + 16 * s, y, y + 80 * s)];
    } else if (this.isCrouching()) {
      boxes = [rect(x - 18 * s, x + 18 * s, 0, 60 * s)];
    } else {
      boxes = [rect(x - 16 * s, x + 16 * s, 0, 92 * s)];
    }
    // An extended limb can be hit during active and recovery frames (whiff punishing).
    if (this.state === 'attack' && this.moveFrame >= this.move.startup) {
      var hb = this.hitbox(4);
      if (hb) boxes.push(hb);
    }
    return boxes;
  };

  // Current hitbox in world space, shrunk by `inset` pixels on each side.
  Fighter.prototype.hitbox = function (inset) {
    if (this.state !== 'attack' || !this.move.box) return null;
    var b = this.move.box, i = inset || 0;
    var x1 = this.x + (b.x + i) * this.facing;
    var x2 = this.x + (b.x + b.w - i) * this.facing;
    return rect(x1, x2, this.y + b.y + i, this.y + b.y + b.h - i);
  };

  Fighter.prototype.isActiveFrame = function () {
    return this.state === 'attack' && !!this.move.box && this.moveFrame >= this.move.startup &&
      this.moveFrame <= this.move.startup + this.move.active - 1;
  };

  // Juggle gravity after `hits` hits in the combo.
  FG.juggleGravity = function (hits) {
    return C.JUGGLE_GRAVITY * Math.min(C.JUGGLE_GRAVITY_MAX, 1 + C.JUGGLE_GRAVITY_SCALE * Math.max(0, (hits || 1) - 1));
  };

  // Gravity multiplier for a fighter of `weight` after `hits` hits in the combo.
  FG.weightFactor = function (weight, hits) {
    var w = weight || 1;
    return 1 + (w - 1) * Math.max(0, Math.min(1, ((hits || 1) - 2) / 3));
  };

  FG.Fighter = Fighter;
  FG.rect = rect;
  FG.overlap = function (a, b) {
    return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
  };
})();
