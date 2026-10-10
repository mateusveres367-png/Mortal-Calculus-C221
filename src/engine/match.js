// The match simulation: two fighters, the frame loop, body collision, walls,
// teching, and frame-advantage measurement. Fixed timestep; step() is one frame.
// Hit resolution, throws and the guard meter live in combat.js.
(function () {
  var C = FG.C;

  function Match(defA, defB) {
    this.fighters = [new FG.Fighter(defA, 0), new FG.Fighter(defB, 1)];
    this.buffers = [new FG.InputBuffer(), new FG.InputBuffer()];
    this.autoReset = true;
    this.reset();
  }

  // where: 'center' (default), 'left' or 'right' (P2 starts with its back to that wall).
  Match.prototype.reset = function (where) {
    where = where || this.startPos || 'center';
    this.startPos = where;
    var mid = C.WORLD_W / 2, gap = 90;
    if (where === 'left') mid = C.WALL_L + 30 + gap;
    if (where === 'right') mid = C.WALL_R - 30 - gap;
    var p2Left = where === 'left';
    this.fighters[0].reset(p2Left ? mid + gap : mid - gap, p2Left ? -1 : 1);
    this.fighters[1].reset(p2Left ? mid - gap : mid + gap, p2Left ? 1 : -1);
    this.buffers = [new FG.InputBuffer(), new FG.InputBuffer()];
    this.frame = 0;
    this.hitstop = 0;
    this.events = [];
    this.combo = [{ hits: 0, damage: 0 }, { hits: 0, damage: 0 }];
    this.measure = null;
    this.lastResult = [null, null]; // per attacker: { move, kind, adv }
    this.throwState = null;
    this.clinch = null;    // MATEUS's clinch: { a, d, start, knees, act, mash, ex } (clinch.js)
    this.sub = null;       // MAX's submissions: { a, d, id, meter, t, end } (submission.js)
    this.koTimer = 0;
    this.winner = null;
    this.over = false;
    this.cinematic = null; // an ultimate playing: { a, d, t, len, hits, done, total }
    this.projectiles = []; // thrown things in flight (projectiles.js)
    (this.props || []).forEach(function (p) { p.cool = 0; p.t = 999; p.use = null; });
  };

  // The stage's interactive objects (FG.stageProps): both fighters can use them.
  Match.prototype.setProps = function (list) {
    this.props = list || [];
    for (var i = 0; i < 2; i++) this.fighters[i].props = this.props;
  };

  // raws: [rawInputP1, rawInputP2]. Events produced by this step are in this.events.
  Match.prototype.step = function (raws) {
    this.events = [];
    var f = this.fighters, b = this.buffers, i;

    // An ultimate's cinematic: the fight stands still (like a long hitstop) while its
    // hits land on their frames.
    if (this.cinematic) {
      b[0].update(raws[0], this.frame + 1);
      b[1].update(raws[1], this.frame + 1);
      this.stepCinematic();
      return;
    }

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
    (this.props || []).forEach(function (p) { if (p.cool > 0) p.cool--; p.t++; });

    // MAX: H next to a downed opponent starts a submission (before either one acts).
    this.trySubmissions();
    f[0].think(b[0], f[1], this.frame);
    f[1].think(b[1], f[0], this.frame);
    // A fighter who is free this frame is out of any combo: a hit landing now
    // (they could have guarded) starts a new one.
    for (i = 0; i < 2; i++) if (f[i].actionable) this.combo[i] = { hits: 0, damage: 0 };
    // The string's extra hitstun only lasts while the attacker stays in the string:
    // once they're free, it's taken back (frame advantage after a string is unchanged).
    for (i = 0; i < 2; i++) {
      var dv = f[1 - i];
      if (f[i].actionable && dv.stringBonus) {
        if (dv.state === 'hitstun') dv.stun = Math.max(1, dv.stun - dv.stringBonus);
        dv.stringBonus = 0;
      }
    }
    for (i = 0; i < 2; i++) {
      if (f[i].cancelled) { this.events.push({ type: f[i].cancelled === 'feint' ? 'feint' : 'cancel', fighter: i, into: f[i].cancelled, x: f[i].x }); f[i].cancelled = null; }
      if (f[i].propUsed) { var pu = f[i].propUsed; this.events.push({ type: 'prop', fighter: i, prop: pu, use: pu.use, x: pu.x, y: 40 }); f[i].propUsed = null; }
      if (f[i].extraCreditNow) { this.events.push({ type: 'extracredit', fighter: i, x: f[i].x, y: 60 }); f[i].extraCreditNow = false; }
      if (f[i].ultStarted) { this.events.push({ type: 'ultstart', fighter: i, move: f[i].move, x: f[i].x, y: 60 }); f[i].ultStarted = false; }
      if (f[i].enhancedNow) { this.events.push({ type: 'enhance', fighter: i, move: f[i].move, x: f[i].x, y: 60 }); f[i].enhancedNow = false; }
      if (f[i].startedMove) {
        var sm = f[i].startedMove;
        this.events.push({ type: 'whiff', fighter: i, move: sm });
        f[i].startedMove = null;
        this.seenItAll(1 - i, i, sm);
      }
      if (f[i].stared) { f[i].stared = false; this.gainMeter(i, C.STARE_METER); this.events.push({ type: 'stare', fighter: i, x: f[i].x }); }
      // MIYASHIRO's Calculated: an opponent's whiff makes his next hit stronger.
      var opp = f[1 - i];
      if (f[i].whiffed && opp.def.passive === 'calculated' && !opp.ko) {
        opp.calculated = C.CALCULATED_FRAMES;
        this.events.push({ type: 'calculated', fighter: 1 - i, x: opp.x });
      }
    }

    this.updateThrow();
    this.updateClinch();
    this.updateSubmission();
    for (i = 0; i < 2; i++) {
      if (f[i].teleportNow) { this.teleport(i, f[i].teleportNow); f[i].teleportNow = null; }
      if (f[i].throwNow) { this.spawnProjectile(i, f[i].throwNow); f[i].throwNow = null; }
    }

    f[0].physics(f[1]);
    f[1].physics(f[0]);
    for (i = 0; i < 2; i++) this.afterPhysics(i);
    this.collide();
    for (i = 0; i < 2; i++) this.checkWallSplat(i);

    this.resolveHits();
    this.updateProjectiles();
    this.updateGuard();
    this.updateMeasure();

    for (i = 0; i < 2; i++) {
      if (f[i].actionable) this.combo[i] = { hits: 0, damage: 0 };
    }

    if (this.koTimer > 0 && --this.koTimer === 0) {
      // The scene turns autoReset off and shows a win screen when `over` is set.
      if (this.autoReset) this.reset(); else this.over = true;
    }
  };

  // --- Seen It All (WILSON) ----------------------------------------------------------
  // He counts the opponent's moves each round. Once a round, when they start their
  // most-used move (used SEEN_IT_ALL times or more) and he's free, he counters it on
  // sight: they're stopped cold, and his counter comes out.
  Match.prototype.seenItAll = function (wi, oi, m) {
    var w = this.fighters[wi], o = this.fighters[oi];
    if (!w.def.seenItAll || m.taunt || m.air || (!m.box && !m.throw)) return;
    var n = w.seen[m.id] = (w.seen[m.id] || 0) + 1;
    if (w.seenUsed || n < C.SEEN_IT_ALL || w.ko || o.ko || this.cinematic) return;
    for (var id in w.seen) if (w.seen[id] > n) return; // not their favourite
    var free = { idle: 1, walkF: 1, walkB: 1, crouch: 1 };
    if (!free[w.state] || o.state !== 'attack' || o.move !== m) return;
    w.seenUsed = true;
    o.actionable = false; w.actionable = false;
    o.contact = 'parried';
    o.setState('hitstun');
    o.stun = C.PARRY_STUN + 6;
    o.reaction = 'high';
    o.vx = 0;
    w.faceOpponent(o);
    w.startMove('seenCounter');
    this.hitstop = Math.max(this.hitstop, 14);
    this.lastResult[wi] = { move: w.def.moves.seenCounter, kind: 'SEEN IT ALL', adv: null };
    this.events.push({ type: 'parry', attacker: wi, defender: oi, x: (w.x + o.x) / 2, y: 70, shake: 0.006, label: 'SEEN IT ALL!', level: m.level, counter: 'seenCounter', seen: m.label });
  };

  // --- Ultimates ------------------------------------------------------------------
  // def.ultimate: { name, len, hits: [t...], weights: [...], end: { gap, down, launch, height, swap } }:
  // the defender ends `gap` in front of the attacker (who has swapped sides with them
  // if `swap`), lying down, or falling from `height` with an upward `launch`.
  // The damage (ULT_DAMAGE of the defender's full health, less late in a combo) is
  // shared out over the hits, the last one weighing double unless weights say otherwise.

  Match.prototype.startCinematic = function (ai, di) {
    var a = this.fighters[ai], d = this.fighters[di], u = a.def.ultimate, combo = this.combo[di];
    var scale = combo.hits <= 2 ? 1 : Math.max(0.5, 1 - 0.08 * (combo.hits - 2));
    var w = u.weights || u.hits.map(function (t, k) { return k === u.hits.length - 1 ? 2 : 1; });
    var sum = w.reduce(function (s, x) { return s + x; }, 0), total = Math.round(d.def.health * C.ULT_DAMAGE * scale * (a.boost > 0 ? C.BOOST_DAMAGE : 1));
    var parts = w.map(function (x) { return Math.max(1, Math.floor(total * x / sum)); });
    parts[parts.length - 1] += total - parts.reduce(function (s, x) { return s + x; }, 0);
    a.actionable = false; d.actionable = false;
    a.contact = 'hit';
    a.setState('cinematic'); d.setState('cinematic');
    a.vx = d.vx = a.vy = d.vy = 0; a.slide = d.slide = 0;
    d.stance = 'A';
    this.throwState = null;
    this.clinch = null;
    a.clinchAct = null;
    this.measure = null;
    this.hitstop = 0;
    this.clearProjectiles();
    this.cinematic = { a: ai, d: di, t: 0, len: u.len, hits: u.hits, parts: parts, total: total, x0: a.x, y0: d.y, dx0: d.x, dir: a.facing };
    this.lastResult[ai] = { move: a.lastMove, kind: 'ULTIMATE', adv: null };
    this.events.push({ type: 'ultimate', attacker: ai, defender: di, name: u.name, x: d.x, y: 60 });
  };

  Match.prototype.stepCinematic = function () {
    var cin = this.cinematic, a = this.fighters[cin.a], d = this.fighters[cin.d], combo = this.combo[cin.d];
    cin.t++;
    var k = cin.hits.indexOf(cin.t);
    if (k >= 0 && !d.ko) {
      var dmg = Math.min(d.health, cin.parts[k]);
      combo.hits++; combo.damage += dmg;
      d.comboHits = combo.hits;
      d.health -= dmg;
      this.gainMeter(cin.a, dmg * C.METER_HIT * 0.25); // an ultimate builds a little back
      this.gainMeter(cin.d, dmg * C.METER_TAKEN);
      var last = k === cin.hits.length - 1;
      if (d.health <= 0) { d.ko = true; this.winner = cin.a; this.koTimer = C.KO_RESET_FRAMES; }
      this.events.push({ type: 'ulthit', attacker: cin.a, defender: cin.d, n: k, last: last, damage: dmg, hits: combo.hits, ko: d.ko, x: d.x, y: 60 });
    }
    if (cin.t < cin.len) return;
    // The end: the defender lands some way off (or the fighters have swapped sides).
    var end = a.def.ultimate.end || {}, dir = cin.dir;
    if (end.swap) {
      a.x = cin.dx0 + dir * (end.gap || 50);
      a.facing = -dir;
      dir = -dir;
    }
    var w = C.PUSH_WIDTH * d.def.scale;
    d.x = Math.max(C.WALL_L + w, Math.min(C.WALL_R - w, a.x + dir * (end.gap || 70)));
    d.facing = -dir;
    if (end.down) {
      // They're already on the floor.
      d.setState('down');
      d.y = 0; d.vy = 0; d.vx = 0;
      d.groundHits = 0;
    } else {
      // Still in the air: they fall from where the cinematic left them.
      d.setState('juggle');
      d.y = Math.max(1, end.height || 30);
      d.vy = end.launch || 4;
      d.vx = dir * 0.6;
      d.noTech = true; d.tripped = true; d.bounding = false;
    }
    a.y = 0;
    a.setState('land');
    a.landLag = 10;
    this.cinematic = null;
    this.events.push({ type: 'ultend', attacker: cin.a, defender: cin.d, x: d.x });
  };

  // Landing results: floor bounces, knockdowns and tech rolls.
  Match.prototype.afterPhysics = function (i) {
    var fi = this.fighters[i], buf = this.buffers[i];
    if (fi.bounced) {
      fi.bounced = false;
      this.events.push({ type: 'bounce', fighter: i, x: fi.x });
      this.hitstop = Math.max(this.hitstop, 6);
    }
    if (!fi.landed) return;
    fi.landed = false;
    var w = C.TECH_WINDOW;
    if (!fi.ko && !fi.noTech &&
        (buf.wasPressed('p', this.frame, w) || buf.wasPressed('k', this.frame, w) || buf.wasPressed('h', this.frame, w))) {
      buf.consume('p'); buf.consume('k'); buf.consume('h');
      fi.sideDir = buf.held.down ? -1 : 1;
      fi.setState('techroll');
      this.events.push({ type: 'tech', fighter: i, x: fi.x });
      return;
    }
    this.events.push({ type: 'land', fighter: i, x: fi.x });
  };

  // --- Body collision, walls, camera limit ------------------------------------

  var NO_PUSH = { down: 1, ko: 1, thrown: 1, throwing: 1, clinch: 1, clinched: 1, submit: 1, submitted: 1 };

  Match.prototype.collide = function () {
    var a = this.fighters[0], b = this.fighters[1];
    var wa = C.PUSH_WIDTH * a.def.scale, wb = C.PUSH_WIDTH * b.def.scale;

    // Bodies push each other unless one is lying down, mid-throw, or clearly above the other.
    var solid = !NO_PUSH[a.state] && !NO_PUSH[b.state] && Math.abs(a.y - b.y) < 70 && !a.vaulting() && !b.vaulting();
    if (solid) {
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
    if (solid && Math.abs(dx2) < wa + wb) {
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

  // Distance from the fighter to the wall in the given direction (+1 right, -1 left).
  Match.prototype.wallDistance = function (f, dir) {
    var w = C.PUSH_WIDTH * f.def.scale;
    return dir > 0 ? C.WALL_R - w - f.x : f.x - (C.WALL_L + w);
  };

  // A juggled fighter carried into the wall sticks to it (once per combo).
  Match.prototype.checkWallSplat = function (i) {
    var d = this.fighters[i];
    if (d.state !== 'juggle' || d.ko || d.wallUsed || d.bounding || d.tripped || d.y > C.WALL_SPLAT_MAX_Y) return;
    var dir = d.vx > 0.1 ? 1 : d.vx < -0.1 ? -1 : 0;
    if (dir && this.wallDistance(d, dir) <= 1) this.wallSplat(d, i);
  };

  Match.prototype.wallSplat = function (d, i) {
    var dir = d.x < C.WORLD_W / 2 ? -1 : 1; // which wall
    d.setState('wallsplat');
    d.stun = C.WALL_STUN;
    d.wallUsed = true;
    d.wallHits = 0;
    d.vx = 0; d.vy = 0; d.slide = 0;
    d.facing = -dir; // back to the wall, facing out
    this.hitstop = Math.max(this.hitstop, 8);
    this.measure = null;
    this.events.push({ type: 'wallsplat', fighter: i, x: d.x + dir * 16 * d.def.scale, y: d.y + 50, shake: 0.008 });
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

  // Play a documented combo route (see the fighter files) and return what happened.
  // Timed `plan` inputs fire on their frame, `queue` inputs fire as soon as the
  // attacker is free, `hold` inputs are held over a frame range, and `oppPlan`
  // is the opponent's script. Starts at `dist` apart, or next to the wall.
  // Frames are game frames counted from the first press: hitstop doesn't count
  // (a press during hitstop comes out on the next game frame anyway).
  // combo.meter: bars of Grade meter the attacker starts with (enhanced specials,
  // ultimates). An ultimate counts as one hit, 'ultimate', with all of its damage.
  FG.runCombo = function (atk, dfn, combo, frames) {
    var m = new Match(atk, dfn), i;
    for (i = 0; i < 2; i++) m.step([FG.emptyRaw(), FG.emptyRaw()]);
    if (combo.meter) m.fighters[0].meter = combo.meter * C.METER_BAR;
    var dist = combo.dist || 40;
    if (combo.wall) { var w = C.WALL_R - 18 * dfn.scale - 10; m.fighters[1].x = w; m.fighters[0].x = w - 44; }
    else { m.fighters[0].x = 500 - dist / 2; m.fighters[1].x = 500 + dist / 2; }
    var hits = [], counts = [], damage = 0, next = 0, f0 = m.frame, fired = {}, firedOpp = {};
    function merge(r, notation) { var add = FG.parseInput(notation); for (var k in add) if (add[k]) r[k] = true; }
    for (i = 0; i < (frames || (combo.meter >= 3 ? 640 : 320)); i++) {
      var r1 = FG.emptyRaw(), r2 = FG.emptyRaw(), t = m.frame - f0;
      if (combo.plan && combo.plan[t] && !fired[t]) { merge(r1, combo.plan[t]); fired[t] = true; }
      (combo.hold || []).forEach(function (h) { if (t >= h[0] && t <= h[1]) merge(r1, h[2]); });
      if (combo.queue && next < combo.queue.length && m.fighters[0].state === 'idle' && m.hitstop === 0) merge(r1, combo.queue[next++]);
      if (combo.oppPlan && combo.oppPlan[t] && !firedOpp[t]) { merge(r2, combo.oppPlan[t]); firedOpp[t] = true; }
      m.step([r1, r2]);
      m.events.forEach(function (e) {
        if (e.type === 'hit' && e.attacker === 0) { hits.push(e.move.id); damage += e.damage; counts.push(e.hits); }
        if (e.type === 'ulthit' && e.attacker === 0) { if (e.n === 0) { hits.push('ultimate'); counts.push(e.hits); } damage += e.damage; }
      });
    }
    // A true combo: the combo counter climbs 1, 2, 3... (the opponent never got free).
    var trueCombo = counts.every(function (n, k) { return n === k + 1; });
    return { hits: hits, damage: damage, counts: counts, trueCombo: trueCombo, match: m };
  };

  // Timing windows for a route: for each timed input after the first, the range of
  // frames (moving only that input) on which the whole route still works against
  // `opp`. Used by the combo trials' timing bar. Returns [{ frame, token, lo, hi }].
  FG.routeWindows = function (atk, opp, combo, reach) {
    if (!combo.plan) return [];
    reach = reach || 18;
    var keys = Object.keys(combo.plan).map(Number).sort(function (a, b) { return a - b; });
    var want = combo.hits.join();
    return keys.map(function (k, idx) {
      if (idx === 0) return { frame: k, token: combo.plan[k], lo: k, hi: k };
      var lo = k, hi = k;
      function works(f) {
        if (f <= keys[idx - 1] || (idx + 1 < keys.length && f >= keys[idx + 1])) return false;
        var plan = {};
        keys.forEach(function (kk) { plan[kk === k ? f : kk] = combo.plan[kk]; });
        return FG.runCombo(atk, opp, Object.assign({}, combo, { plan: plan })).hits.join() === want;
      }
      while (lo - 1 >= k - reach && works(lo - 1)) lo--;
      while (hi + 1 <= k + reach && works(hi + 1)) hi++;
      return { frame: k, token: combo.plan[k], lo: lo, hi: hi };
    });
  };

  FG.Match = Match;
})();
