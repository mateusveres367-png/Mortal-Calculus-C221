// The match simulation: two fighters, collisions, hit resolution, hitstop,
// combos and frame-advantage measurement. Fixed timestep; step() is one frame.
(function () {
  var C = FG.C;

  function Match(defA, defB) {
    this.fighters = [new FG.Fighter(defA, 0), new FG.Fighter(defB, 1)];
    this.buffers = [new FG.InputBuffer(), new FG.InputBuffer()];
    this.reset();
  }

  Match.prototype.reset = function () {
    var mid = C.WORLD_W / 2;
    this.fighters[0].reset(mid - 90, 1);
    this.fighters[1].reset(mid + 90, -1);
    this.buffers = [new FG.InputBuffer(), new FG.InputBuffer()];
    this.frame = 0;
    this.hitstop = 0;
    this.events = [];
    this.combo = [{ hits: 0, damage: 0 }, { hits: 0, damage: 0 }];
    this.measure = null;
    this.lastResult = [null, null]; // per attacker: { move, kind, adv, label }
    this.koTimer = 0;
    this.winner = null;
  };

  // raws: [rawInputP1, rawInputP2]. Events produced by this step are in this.events.
  Match.prototype.step = function (raws) {
    this.events = [];
    var f = this.fighters, b = this.buffers;

    if (this.hitstop > 0) {
      // Frozen: presses are buffered and come out on the next real frame.
      b[0].update(raws[0], this.frame + 1);
      b[1].update(raws[1], this.frame + 1);
      this.hitstop--;
      return;
    }

    this.frame++;
    b[0].update(raws[0], this.frame);
    b[1].update(raws[1], this.frame);

    f[0].think(b[0], f[1], this.frame);
    f[1].think(b[1], f[0], this.frame);
    for (var i = 0; i < 2; i++) {
      if (f[i].startedMove) { this.events.push({ type: 'whiff', fighter: i, move: f[i].startedMove }); f[i].startedMove = null; }
    }

    f[0].physics(f[1]);
    f[1].physics(f[0]);
    for (i = 0; i < 2; i++) {
      if (f[i].landed) { f[i].landed = false; this.events.push({ type: 'land', fighter: i, x: f[i].x }); }
    }
    this.collide();

    this.resolveHits();
    this.updateMeasure();

    for (i = 0; i < 2; i++) {
      if (f[i].actionable) this.combo[i] = { hits: 0, damage: 0 };
    }

    if (this.koTimer > 0 && --this.koTimer === 0) this.reset();
  };

  // --- Body collision, walls, camera limit ------------------------------------

  Match.prototype.collide = function () {
    var a = this.fighters[0], b = this.fighters[1];
    var wa = C.PUSH_WIDTH * a.def.scale, wb = C.PUSH_WIDTH * b.def.scale;

    // Bodies push each other unless one is clearly above the other.
    var lying = a.state === 'down' || a.state === 'ko' || b.state === 'down' || b.state === 'ko';
    if (!lying && Math.abs(a.y - b.y) < 70) {
      var dx = b.x - a.x;
      var overlap = wa + wb - Math.abs(dx);
      if (overlap > 0) {
        var dir = dx !== 0 ? Math.sign(dx) : a.facing;
        a.x -= dir * overlap / 2;
        b.x += dir * overlap / 2;
      }
    }

    // Walls. A fighter pinned against a wall pushes the other one out instead.
    this.clampWall(a, wa); this.clampWall(b, wb);
    var dx2 = b.x - a.x;
    if (!lying && Math.abs(a.y - b.y) < 70 && Math.abs(dx2) < wa + wb) {
      var d2 = dx2 !== 0 ? Math.sign(dx2) : a.facing;
      var need = wa + wb - Math.abs(dx2);
      if (this.atWall(a, wa)) b.x += d2 * need; else a.x -= d2 * need;
      this.clampWall(a, wa); this.clampWall(b, wb);
    }

    // Both fighters must stay on screen together.
    var sep = Math.abs(b.x - a.x);
    if (sep > C.MAX_SEPARATION) {
      var excess = sep - C.MAX_SEPARATION;
      var left = a.x < b.x ? a : b, right = left === a ? b : a;
      var leftOut = left.x < left.prevX, rightOut = right.x > right.prevX;
      if (leftOut && !rightOut) left.x += excess;
      else if (rightOut && !leftOut) right.x -= excess;
      else { left.x += excess / 2; right.x -= excess / 2; }
    }
  };

  Match.prototype.clampWall = function (f, w) {
    if (f.x < C.WALL_L + w) { f.x = C.WALL_L + w; if (f.slide < 0) f.slide = 0; }
    if (f.x > C.WALL_R - w) { f.x = C.WALL_R - w; if (f.slide > 0) f.slide = 0; }
  };

  Match.prototype.atWall = function (f, w) {
    return f.x <= C.WALL_L + w + 1 || f.x >= C.WALL_R - w - 1;
  };

  // --- Hits -------------------------------------------------------------------

  Match.prototype.resolveHits = function () {
    var f = this.fighters, contacts = [];
    for (var i = 0; i < 2; i++) {
      var a = f[i], d = f[1 - i];
      if (!a.isActiveFrame() || a.contact) continue;
      var m = a.move;
      if (d.isInvulnerable()) continue;
      // Sidestep: linear attacks miss a fighter who has moved off the line.
      if (!m.tracks && Math.abs(a.z - d.z) > C.SIDESTEP_EVADE_Z) continue;
      // Highs go over crouching opponents.
      if (m.level === 'high' && d.isCrouching()) continue;
      var hb = a.hitbox(0), hurts = d.hurtboxes(), touching = false;
      for (var j = 0; j < hurts.length; j++) if (FG.overlap(hb, hurts[j])) { touching = true; break; }
      if (!touching) continue;
      // Snapshot the defender's guard and counter-hit state before anything changes (trades).
      contacts.push({ a: i, d: 1 - i, guard: d.guardStance(this.buffers[1 - i]), ch: d.inCounterHitWindow(), punish: d.inRecovery() });
    }
    for (var k = 0; k < contacts.length; k++) this.applyContact(contacts[k]);
  };

  Match.prototype.applyContact = function (c) {
    var a = this.fighters[c.a], d = this.fighters[c.d], m = a.move;
    var grounded = !d.isAirborne();
    // Neither side is free on a frame where contact happens.
    a.actionable = false;
    d.actionable = false;
    var blocked = grounded && c.guard &&
      ((m.level === 'low' && c.guard === 'crouch') || (m.level !== 'low' && c.guard === 'stand'));

    // Frames until the attacker can act again, counted from this frame.
    var attackerLeft = m.total - a.moveFrame + 1;
    var hb = a.hitbox(0);
    var ev = { type: blocked ? 'block' : 'hit', attacker: c.a, defender: c.d, move: m, level: m.level,
      x: (Math.max(hb.x1, d.x - 16) + Math.min(hb.x2, d.x + 16)) / 2,
      y: (hb.y1 + hb.y2) / 2, facing: a.facing };

    if (blocked) {
      a.contact = 'block';
      d.setState('blockstun');
      d.stun = attackerLeft + m.block;
      d.guardCrouch = c.guard === 'crouch';
      d.vx = 0;
      this.push(a, d, m.push);
      this.hitstop = Math.max(this.hitstop, Math.round(m.hitstop * 0.6));
      ev.shake = m.strength === 'heavy' || m.strength === 'launch' ? m.shake * 0.3 : 0;
      this.combo[c.d] = { hits: 0, damage: 0 };
      this.startMeasure(c.a, c.d, m, 'BLOCK');
      this.events.push(ev);
      return;
    }

    a.contact = 'hit';
    var ch = c.ch;
    var result = ch ? m.ch : m.hit;
    var combo = this.combo[c.d];
    combo.hits++;
    var scale = combo.hits <= 2 ? 1 : Math.max(0.3, 1 - 0.12 * (combo.hits - 2));
    var dmg = Math.max(1, Math.round(m.damage * (ch ? 1.2 : 1) * scale));
    combo.damage += dmg;
    d.health = Math.max(0, d.health - dmg);
    var wasJuggled = d.state === 'juggle';

    if (d.health <= 0) {
      d.ko = true;
      this.winner = c.a;
      this.koTimer = C.KO_RESET_FRAMES;
    }

    if (d.isAirborne() || result.launch || d.ko) {
      var pop;
      if (wasJuggled) pop = m.juggle * Math.max(0.4, 1 - 0.12 * d.juggleHits);
      else if (result.launch) pop = result.launch;
      else pop = d.ko ? 7 : 5;
      d.setState('juggle');
      d.vy = Math.max(pop, 2.5);
      d.vx = a.facing * m.carry;
      d.y = Math.max(d.y, 1);
      d.juggleHits++;
      this.measure = null;
      this.lastResult[c.a] = { move: m, kind: wasJuggled ? 'JUGGLE' : 'LAUNCH', adv: null, ch: ch };
    } else {
      d.setState('hitstun');
      d.stun = attackerLeft + result.adv;
      d.reaction = m.level === 'low' ? 'low' : (m.strength === 'heavy' || m.level === 'mid') ? 'mid' : 'high';
      d.vx = 0;
      this.push(a, d, m.push);
      this.startMeasure(c.a, c.d, m, ch ? 'COUNTER' : 'HIT', ch);
    }

    this.hitstop = Math.max(this.hitstop, d.ko ? 30 : m.hitstop + (ch ? 4 : 0));
    ev.ch = ch;
    ev.punish = c.punish;
    ev.damage = dmg;
    ev.ko = d.ko;
    ev.launch = !!result.launch && !wasJuggled;
    ev.shake = d.ko ? 0.012 : m.shake * (ch ? 1.6 : 1) + (ev.launch ? 0.002 : 0);
    this.events.push(ev);
  };

  // Pushback after contact. If the defender is against a wall the attacker is pushed instead.
  Match.prototype.push = function (a, d, amount) {
    var w = C.PUSH_WIDTH * d.def.scale;
    var nearWall = a.facing > 0 ? d.x >= C.WALL_R - w - 4 : d.x <= C.WALL_L + w + 4;
    if (nearWall) a.slide = -a.facing * amount / 5;
    else d.slide = a.facing * amount / 5;
  };

  // --- Frame advantage measurement -------------------------------------------
  // After a hit or block, count the frames until each side can act again.
  // This checks the declared frame data against what the engine actually does.

  Match.prototype.startMeasure = function (att, def, move, kind, ch) {
    this.measure = { att: att, def: def, move: move, kind: kind, ch: !!ch, attFrame: null, defFrame: null };
  };

  Match.prototype.updateMeasure = function () {
    var ms = this.measure;
    if (!ms) return;
    var f = this.fighters;
    if (ms.attFrame === null && f[ms.att].actionable) ms.attFrame = this.frame;
    if (ms.defFrame === null && f[ms.def].actionable) ms.defFrame = this.frame;
    if (ms.attFrame !== null && ms.defFrame !== null) {
      this.lastResult[ms.att] = { move: ms.move, kind: ms.kind, adv: ms.defFrame - ms.attFrame, ch: ms.ch };
      this.measure = null;
    }
  };

  FG.Match = Match;
})();
