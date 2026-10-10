// Projectiles and teleports: the students' tools (no teacher throws anything).
// Extends FG.Match.
//
// A move with `projectile` releases one on its startup frame (or projectile.at):
//   projectile: { kind, x, y (where it leaves the hand, forward / up), vx (forward
//     speed), vy (upward speed), g (gravity), curve (steady lift, + up / - down),
//     w, h (its box), range (distance before it fizzles), life (frames),
//     ground: 'slide' (tumbles along the floor) | 'burst' (explodes where it lands:
//     burst { w, h, frames }) | nothing (gone when it lands),
//     spawn: distance ahead to appear at instead of flying there (a pop-up box;
//     never past the opponent),
//     arm: frames before it can hit (it's still appearing), lowBelow: below this
//     height it hits low (a plane diving, a gnome tumbling along the floor) }
// It hits with the move's own level, damage, hit / ch / block results, push and
// strength. Frame advantage is declared as for a strike at point-blank range; further
// out, the hit or block stun never drops below PROJ_MIN_HIT / PROJ_MIN_BLOCK.
// One projectile per fighter at a time; two projectiles that meet cancel out.
// Sidesteps dodge them (unless the move tracks), highs sail over crouchers, lows
// must be blocked low, a sway lets them by, a parry knocks them away and armor
// soaks them.
//
// A move with `teleport: { at, to: 'front' | 'behind', gap, hide: [from, to] }`
// vanishes on the hide frames (no hurtbox, no body) and reappears on frame `at`,
// `gap` in front of the opponent or behind them (then facing them: sides switched).
(function () {
  var C = FG.C, Match = FG.Match;
  var PROJ_MIN_HIT = 16, PROJ_MIN_BLOCK = 10;
  FG.C.PROJ_MIN_HIT = PROJ_MIN_HIT; FG.C.PROJ_MIN_BLOCK = PROJ_MIN_BLOCK;

  Match.prototype.clearProjectiles = function () {
    this.projectiles = [];
    for (var i = 0; i < 2; i++) this.fighters[i].projOut = 0;
  };

  Match.prototype.spawnProjectile = function (i, m) {
    var a = this.fighters[i], sp = m.projectile, s = a.def.scale, dir = a.facing;
    var ahead = (sp.spawn || sp.x || 20) * s;
    // A pop-up box opens in front of them, never past them.
    if (sp.spawn) ahead = Math.min(ahead, Math.max((sp.x || 20) * s, Math.abs(this.fighters[1 - i].x - a.x)));
    var p = {
      owner: i, move: m, kind: sp.kind, serial: a.projSerial, dir: dir, z: a.z, age: 0, travelled: 0,
      x: a.x + dir * ahead, y: a.y + (sp.y || 40) * s, vx: sp.vx || 0, vy: sp.vy || 0,
      w: sp.w || 14, h: sp.h || 14, burst: 0, dead: false, spin: 0
    };
    if (sp.spawn) p.x = Math.max(C.WALL_L + 8, Math.min(C.WALL_R - 8, p.x));
    this.projectiles.push(p);
    a.projOut++;
    this.events.push({ type: 'projectile', fighter: i, kind: sp.kind, move: m, x: p.x, y: p.y });
    return p;
  };

  // The projectile's box in world space (y up).
  function pbox(p) { return FG.rect(p.x - p.w / 2, p.x + p.w / 2, p.y, p.y + p.h); }
  Match.prototype.projectileBox = pbox;

  // The level it hits at right now (a plane diving low, a gnome rolling on the floor).
  function plevel(p) {
    var sp = p.move.projectile;
    if (sp.lowBelow != null && p.y + p.h / 2 < sp.lowBelow) return 'low';
    return p.move.level;
  }
  FG.projectileLevel = plevel;

  Match.prototype.updateProjectiles = function () {
    var list = this.projectiles, f = this.fighters, i, p;
    for (i = 0; i < list.length; i++) {
      p = list[i];
      var sp = p.move.projectile;
      p.age++;
      p.spin += p.vx * 0.12 + 0.05;
      if (p.burst > 0) {
        if (--p.burst <= 0) this.killProjectile(p, 'burst');
      } else if (!sp.spawn) {
        p.vy += (sp.curve || 0) - (sp.g || 0);
        p.x += p.vx * p.dir;
        p.y += p.vy;
        p.travelled += Math.abs(p.vx);
        if (p.y <= 0 && p.vy <= 0) {
          p.y = 0;
          if (sp.ground === 'slide') { p.vy = 0; p.vx *= 0.97; }
          else if (sp.ground === 'burst') { p.burst = sp.burst.frames; p.vx = 0; p.vy = 0; p.w = sp.burst.w; p.h = sp.burst.h; this.events.push({ type: 'burst', fighter: p.owner, kind: p.kind, x: p.x, y: 0 }); }
          else this.killProjectile(p, 'land');
        }
      }
      if (p.dead) continue;
      if (p.travelled > (sp.range || 600) || p.age > (sp.life || 240) || p.x < C.WALL_L - 10 || p.x > C.WALL_R + 10 || (sp.ground === 'slide' && p.y <= 0 && Math.abs(p.vx) < 0.6)) {
        this.killProjectile(p, 'fizzle');
      }
    }
    // Two projectiles that meet cancel each other out.
    for (i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var a = list[i], b = list[j];
      if (a.dead || b.dead || a.owner === b.owner || a.burst || b.burst) continue;
      if (FG.overlap(pbox(a), pbox(b))) {
        this.killProjectile(a, 'clash'); this.killProjectile(b, 'clash');
        this.events.push({ type: 'clash', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 6, shake: 0.004 });
      }
    }
    for (i = 0; i < list.length; i++) {
      p = list[i];
      if (p.dead || p.spent || p.age <= (p.move.projectile.arm || 0)) continue;
      var di = 1 - p.owner, d = f[di];
      if (this.cinematic) break;
      var lvl = plevel(p), m = p.move;
      if (d.isInvulnerable()) continue;
      if (!m.tracks && Math.abs(p.z - d.z) > C.SIDESTEP_EVADE_Z) continue;
      if (lvl === 'high' && d.isCrouching()) continue;
      if ((d.state === 'down' || (d.state === 'juggle' && d.tripped)) && (!m.otg || d.groundHits >= C.GROUND_HITS_MAX)) continue;
      var box = pbox(p), hurts = d.hurtboxes(), touching = false;
      for (var k = 0; k < hurts.length; k++) if (FG.overlap(box, hurts[k])) { touching = true; break; }
      if (!touching) continue;
      if (d.evades({ level: lvl })) { d.swayed = true; continue; }
      var pr = d.parryWindow();
      if (pr && pr.levels.indexOf(lvl) >= 0) {
        // Knocked away: the parry holds, the projectile is gone.
        this.killProjectile(p, 'parry');
        this.hitstop = Math.max(this.hitstop, 6);
        this.events.push({ type: 'deflect', attacker: di, defender: p.owner, x: p.x, y: p.y + p.h / 2, shake: 0.003, label: d.move.parryLabel });
        continue;
      }
      this.projectileContact(p, di, lvl);
      if (p.burst <= 0) this.killProjectile(p, 'hit');
      else p.spent = true; // a burst hits once, then plays out
    }
    this.projectiles = list.filter(function (q) { return !q.dead; });
    for (i = 0; i < 2; i++) f[i].projOut = 0;
    for (i = 0; i < this.projectiles.length; i++) f[this.projectiles[i].owner].projOut++;
  };

  Match.prototype.killProjectile = function (p, why) {
    if (p.dead) return;
    p.dead = true;
    if (why !== 'hit' && why !== 'clash') this.events.push({ type: 'fizzle', fighter: p.owner, kind: p.kind, why: why, x: p.x, y: p.y + p.h / 2 });
  };

  // A projectile reaches the opponent: blocked, armored, or a hit (a strike without the
  // attacker's body: no tip bonus, no string bonus, no charge).
  Match.prototype.projectileContact = function (p, di, lvl) {
    var ai = p.owner, a = this.fighters[ai], d = this.fighters[di], m = p.move;
    var guard = d.guardStance(this.buffers[di]), ch = d.inCounterHitWindow(), punish = d.inRecovery();
    var mine = a.state === 'attack' && a.move === m && a.projSerial === p.serial; // still throwing it
    var ownerLeft = mine ? m.total - a.moveFrame + 1 : 0;
    var grounded = !d.isAirborne() && d.state !== 'down' && d.state !== 'wallsplat';
    var blocked = grounded && guard && ((lvl === 'low' && guard === 'crouch') || (lvl !== 'low' && guard === 'stand'));
    var dir = p.dir, by = { facing: dir, isAirborne: function () { return false; } };
    d.actionable = false;
    if (mine) { a.contactAt = a.moveFrame; a.actionable = false; }
    var ev = { type: blocked ? 'block' : 'hit', attacker: ai, defender: di, move: m, level: lvl, projectile: p.kind,
      x: Math.max(d.x - 16, Math.min(d.x + 16, p.x)), y: p.y + p.h / 2, facing: dir };

    if (!blocked && d.armorUp(m) && d.health > Math.round(m.damage * C.ARMOR_DAMAGE)) {
      d.armorHits++;
      var adm = Math.max(1, Math.round(m.damage * C.ARMOR_DAMAGE));
      d.health -= adm;
      this.gainMeter(ai, adm * C.METER_HIT); this.gainMeter(di, adm * C.METER_TAKEN);
      this.hitstop = Math.max(this.hitstop, C.ARMOR_HITSTOP);
      this.events.push({ type: 'armor', attacker: ai, defender: di, move: m, damage: adm, x: d.x, y: ev.y, shake: 0.005 });
      return;
    }

    if (blocked) {
      if (mine) a.contact = 'block';
      this.events.push(ev);
      d.guard += m.guardDmg != null ? m.guardDmg : 8;
      this.gainMeter(di, C.METER_BLOCK); this.gainMeter(ai, C.METER_BLOCKED);
      d.guardDelay = C.GUARD_REGEN_DELAY;
      this.combo[di] = { hits: 0, damage: 0 };
      if (d.guard >= C.GUARD_MAX) {
        d.guard = 0;
        d.setState('guardbreak');
        d.stun = Math.max(PROJ_MIN_BLOCK, ownerLeft) + C.GUARD_BREAK_ADV;
        this.hitstop = Math.max(this.hitstop, 18);
        this.startMeasure(ai, di, m, 'GUARD BREAK');
        this.events.push({ type: 'guardbreak', attacker: ai, defender: di, x: d.x, y: 60, shake: 0.01 });
        return;
      }
      d.setState('blockstun');
      d.stun = Math.max(PROJ_MIN_BLOCK, ownerLeft + m.block);
      d.guardCrouch = guard === 'crouch';
      d.vx = 0;
      this.pushAway(dir, d, m.push);
      this.hitstop = Math.max(this.hitstop, Math.round((C.HITSTOP[m.strength] || 6) * 0.5));
      this.startMeasure(ai, di, m, 'BLOCK');
      return;
    }

    if (mine) a.contact = 'hit';
    d.stance = 'A';
    var result = ch ? m.ch : m.hit, state = d.state;
    var mult = (ch ? 1.2 : 1) * (state === 'down' ? 0.6 : 1);
    if (a.calculated > 0) { mult *= C.CALCULATED_BONUS; a.calculated = 0; ev.calculated = true; }
    var dmg = this.dealDamage(ai, di, m.damage, mult);
    var hitstop = Math.round((C.HITSTOP[m.strength] || 6) * 0.8) + (ch ? C.HITSTOP_CH : 0);
    ev.ch = ch; ev.punish = punish; ev.damage = dmg; ev.hits = this.combo[di].hits;
    ev.shake = (m.shake || 0.002) * (ch ? 1.6 : 1);
    this.measure = null;
    if (d.ko && state !== 'down') {
      this.toJuggle(d, by, 7, m); d.noTech = true;
      hitstop = C.HITSTOP_KO; ev.shake = 0.012; ev.finisher = true;
    } else if (state === 'down' || d.tripped) {
      d.groundHits++;
      d.stateFrame = Math.max(0, d.stateFrame - 10);
      ev.ground = true;
    } else if (state === 'wallsplat') {
      d.wallHits++;
      d.stun = Math.max(12, C.WALL_STUN - 6 * d.wallHits);
      ev.wall = true;
    } else if (d.isAirborne()) {
      this.juggleHit({ a: ai, d: di }, by, d, m, ev);
    } else if (result.launch) {
      this.toJuggle(d, by, result.launch * C.LAUNCH_SNAP, m);
      ev.launch = true;
    } else if (result.knockdown) {
      this.toJuggle(d, by, 2.4, m);
      d.vx = dir * 0.8;
      d.tripped = true;
      ev.knockdown = true; ev.finisher = true;
      this.lastResult[ai] = { move: m, kind: 'KNOCKDOWN', adv: null };
    } else {
      d.setState('hitstun');
      d.stun = Math.max(PROJ_MIN_HIT, ownerLeft + result.adv);
      d.stringBonus = 0;
      d.reaction = lvl === 'low' ? 'low' : lvl === 'mid' ? 'mid' : 'high';
      d.vx = 0;
      this.pushAway(dir, d, m.push);
      this.startMeasure(ai, di, m, ch ? 'COUNTER' : 'HIT', ch);
    }
    if (ev.finisher && !d.ko) hitstop = Math.max(hitstop, C.HITSTOP_FINISHER - 4);
    this.hitstop = Math.max(this.hitstop, hitstop);
    ev.ko = d.ko;
    this.events.push(ev);
  };

  // Knocked back the way the projectile was going (nothing pushes the thrower).
  Match.prototype.pushAway = function (dir, d, amount) {
    if (this.wallDistance(d, dir) > 4) d.slide = dir * (amount || 8) / 5;
  };

  // MATEUS's Pop-Up, JACK's Seat Swap: reappear next to the opponent.
  Match.prototype.teleport = function (i, tp) {
    var a = this.fighters[i], o = this.fighters[1 - i], side = a.x <= o.x ? -1 : 1; // which side of them a is on
    var gap = (tp.gap || 36) * a.def.scale, w = C.PUSH_WIDTH * a.def.scale;
    var to = tp.to === 'behind' ? -side : side, x = o.x + to * gap;
    if (x < C.WALL_L + w || x > C.WALL_R - w) { to = side; x = o.x + to * gap; } // no room behind them: in front
    var from = a.x;
    a.x = a.prevX = Math.max(C.WALL_L + w, Math.min(C.WALL_R - w, x));
    a.facing = o.x > a.x ? 1 : -1;
    a.slide = 0; a.vx = 0;
    this.events.push({ type: 'teleport', fighter: i, from: from, x: a.x, y: 0, behind: to !== side, opp: o.x });
  };
})();
