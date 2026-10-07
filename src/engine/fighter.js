// A fighter: state machine, movement and boxes. Pure simulation, no rendering.
(function () {
  var C = FG.C;

  // States in which the fighter is free to act (and can guard).
  var NEUTRAL = { idle: 1, walkF: 1, walkB: 1, crouch: 1 };
  // States that a throw can grab.
  var THROWABLE = { idle: 1, walkF: 1, walkB: 1, dash: 1, backdash: 1, sidestep: 1, land: 1, attack: 1, guardbreak: 1, prejump: 1 };

  var DASH_FRAMES = 16, DASH_ACT_FROM = 9;
  var BACKDASH_FRAMES = 22, BACKDASH_ACT_FROM = 17;
  var SIDESTEP_ACT_FROM = 14;
  var PREJUMP_FRAMES = 4, LAND_FRAMES = 4;
  var JUMP_VY = 9.5, JUMP_VX = 2.6;

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
    this.clearComboFlags();
  };

  // Per-combo limits, cleared whenever the fighter is free again.
  Fighter.prototype.clearComboFlags = function () {
    this.juggleHits = 0;
    this.wallUsed = false;
    this.wallHits = 0;
    this.boundUsed = false;
    this.bounding = false;
    this.groundHits = 0;
    this.noTech = false;
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

  Fighter.prototype.isThrowable = function () {
    return !!THROWABLE[this.state] && !this.isCrouching() && !this.isAirborne();
  };

  Fighter.prototype.inCounterHitWindow = function () {
    return this.state === 'attack' && this.moveFrame <= this.move.startup + this.move.active - 1;
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
    this.stateFrame++;
    var s = this.state;

    switch (s) {
      case 'attack': {
        var m = this.move;
        this.moveFrame++;
        if (!m.air) this.vx = (m.step && this.moveFrame >= m.step[0] && this.moveFrame <= m.step[1]) ? m.step[2] * this.facing : 0;
        if (this.tryThrowConversion(buf, frame)) return;
        if (this.tryCancel(buf, frame)) return;
        if (this.moveFrame <= m.total) return;
        if (m.air) { this.setState('air'); return; }
        this.setState('idle');
        break;
      }
      case 'hitstun':
      case 'blockstun':
      case 'guardbreak':
        this.vx = 0;
        if (s === 'blockstun') this.guardCrouch = buf.held.down;
        if (--this.stun > 0) return;
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
        this.vx *= 0.86;
        if (this.stateFrame >= DASH_FRAMES) { this.setState('idle'); break; }
        if (this.stateFrame >= DASH_ACT_FROM && this.tryAttack(buf, frame)) return;
        return;
      case 'backdash':
        this.vx *= 0.87;
        if (this.stateFrame >= BACKDASH_FRAMES) { this.setState('idle'); break; }
        if (this.stateFrame >= BACKDASH_ACT_FROM && this.tryAttack(buf, frame)) return;
        return;
      case 'sidestep':
        this.vx = 0;
        if (this.stateFrame >= C.SIDESTEP_FRAMES) { this.setState('idle'); break; }
        if (this.stateFrame >= SIDESTEP_ACT_FROM && this.tryAttack(buf, frame)) return;
        return;
      case 'prejump':
        if (this.stateFrame >= PREJUMP_FRAMES) {
          this.setState('air');
          this.vy = JUMP_VY;
          this.vx = this.jumpDir * JUMP_VX * this.facing;
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

  Fighter.prototype.startThrow = function (buf) {
    buf.consume('p'); buf.consume('k');
    this.startMove(buf.back(this.facing) ? 'throwB' : 'throw');
  };

  Fighter.prototype.tryAttack = function (buf, frame) {
    if (throwPressed(buf, frame)) { this.startThrow(buf); return true; }
    var btn = buf.latest(['p', 'k', 'h'], frame);
    if (!btn) return false;
    buf.consume(btn);
    var down = buf.held.down, back = buf.back(this.facing), fwd = buf.forward(this.facing);
    var id;
    if (btn === 'p') id = 'jab';
    else if (btn === 'k') id = down ? (back ? 'sweep' : 'low') : 'mid';
    else id = down ? 'launcher' : (fwd ? 'slam' : 'heavy');
    this.startMove(id);
    return true;
  };

  // The second throw button can arrive a frame or two after the first: turn the
  // jab or kick that just started into the throw.
  Fighter.prototype.tryThrowConversion = function (buf, frame) {
    var m = this.move;
    if (this.moveFrame > 3) return false;
    if ((m.id === 'jab' && buf.wasPressed('k', frame, 3)) || (m.id === 'mid' && buf.wasPressed('p', frame, 3))) {
      this.startThrow(buf);
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

  Fighter.prototype.tryCancel = function (buf, frame) {
    var cancels = this.move.cancels;
    if (!cancels) return false;
    for (var i = 0; i < cancels.length; i++) {
      var c = cancels[i];
      if (this.moveFrame < c.from || this.moveFrame > c.to) continue;
      if (c.onContact && !this.contact) continue;
      if (c.onHit && this.contact !== 'hit') continue;
      if (!buf.wasPressed(c.btn, frame)) continue;
      buf.consume(c.btn);
      if (c.into === 'jump') {
        // Jump cancel: chase the launched opponent into the air.
        this.setState('air');
        this.vy = C.SUPER_JUMP_VY;
        this.vx = C.SUPER_JUMP_VX * this.facing;
        this.airActions = 0;
        this.superJump = true;
      } else {
        if (this.move.air) this.airActions++;
        this.startMove(c.into);
      }
      return true;
    }
    return false;
  };

  Fighter.prototype.neutral = function (buf, frame) {
    var d = this.def;
    if (this.tryAttack(buf, frame)) return;

    if (buf.wasPressed('ssIn', frame) || buf.wasPressed('ssOut', frame)) {
      this.sideDir = buf.wasPressed('ssIn', frame) ? 1 : -1;
      buf.consume('ssIn'); buf.consume('ssOut');
      this.setState('sidestep');
      return;
    }
    if (buf.doubleTap('forward', this.facing, frame)) {
      buf.clearTaps();
      this.setState('dash');
      this.vx = d.dashSpeed * this.facing;
      return;
    }
    if (buf.doubleTap('back', this.facing, frame)) {
      buf.clearTaps();
      this.setState('backdash');
      this.vx = -d.backdashSpeed * this.facing;
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
      this.vx = d.walkF * this.facing;
      return;
    }
    if (buf.back(this.facing)) {
      if (this.state !== 'walkB') this.setState('walkB');
      this.vx = -d.walkB * this.facing;
      return;
    }
    if (this.state !== 'idle') this.setState('idle');
    this.vx = 0;
  };

  Fighter.prototype.physics = function (opp) {
    this.prevX = this.x;
    if (this.state === 'throwing' || this.state === 'thrown') {
      // Positions are driven by the throw script in the match.
      this.slide = 0;
    } else if (this.isAirborne()) {
      var juggled = this.state === 'juggle';
      this.vy -= juggled ? C.JUGGLE_GRAVITY * (1 + C.JUGGLE_GRAVITY_SCALE * this.juggleHits) : C.GRAVITY;
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
      this.y = Math.max(0, this.y - 1.5); // slide down the wall
    } else {
      this.x += this.vx;
    }
    if (this.slide) {
      this.x += this.slide;
      this.slide *= 0.8;
      if (Math.abs(this.slide) < 0.1) this.slide = 0;
    }
    var depthFrames = this.state === 'sidestep' ? C.SIDESTEP_FRAMES :
      this.state === 'techroll' ? C.TECH_FRAMES :
      (this.state === 'roll' && this.rollDir === 'side') ? C.ROLL_FRAMES : 0;
    if (depthFrames) {
      this.z = this.sideDir * C.SIDESTEP_DEPTH * Math.sin(Math.PI * Math.min(1, this.stateFrame / depthFrames));
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
      case 'getup': case 'ko': case 'thrown': case 'throwing': return true;
      case 'roll': return this.stateFrame <= C.ROLL_INVULN;
      case 'techroll': return this.stateFrame <= C.TECH_INVULN;
      case 'throwbreak': return this.stateFrame <= 6;
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
    if (this.state !== 'attack') return null;
    var b = this.move.box, i = inset || 0;
    var x1 = this.x + (b.x + i) * this.facing;
    var x2 = this.x + (b.x + b.w - i) * this.facing;
    return rect(x1, x2, this.y + b.y + i, this.y + b.y + b.h - i);
  };

  Fighter.prototype.isActiveFrame = function () {
    return this.state === 'attack' && this.moveFrame >= this.move.startup &&
      this.moveFrame <= this.move.startup + this.move.active - 1;
  };

  FG.Fighter = Fighter;
  FG.rect = rect;
  FG.overlap = function (a, b) {
    return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
  };
})();
