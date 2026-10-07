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
    this.koTimer = 0;
    this.winner = null;
    this.over = false;
  };

  // raws: [rawInputP1, rawInputP2]. Events produced by this step are in this.events.
  Match.prototype.step = function (raws) {
    this.events = [];
    var f = this.fighters, b = this.buffers, i;

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
    for (i = 0; i < 2; i++) {
      if (f[i].startedMove) { this.events.push({ type: 'whiff', fighter: i, move: f[i].startedMove }); f[i].startedMove = null; }
      // MIYASHIRO's Calculated: an opponent's whiff makes his next hit stronger.
      var opp = f[1 - i];
      if (f[i].whiffed && opp.def.passive === 'calculated' && !opp.ko) {
        opp.calculated = C.CALCULATED_FRAMES;
        this.events.push({ type: 'calculated', fighter: 1 - i, x: opp.x });
      }
    }

    this.updateThrow();

    f[0].physics(f[1]);
    f[1].physics(f[0]);
    for (i = 0; i < 2; i++) this.afterPhysics(i);
    this.collide();
    for (i = 0; i < 2; i++) this.checkWallSplat(i);

    this.resolveHits();
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

  // Landing results: floor bounces, knockdowns and tech rolls.
  Match.prototype.afterPhysics = function (i) {
    var fi = this.fighters[i], buf = this.buffers[i];
    if (fi.bounced) {
      fi.bounced = false;
      this.events.push({ type: 'bounce', fighter: i, x: fi.x });
      this.hitstop = Math.max(this.hitstop, 4);
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

  var NO_PUSH = { down: 1, ko: 1, thrown: 1, throwing: 1 };

  Match.prototype.collide = function () {
    var a = this.fighters[0], b = this.fighters[1];
    var wa = C.PUSH_WIDTH * a.def.scale, wb = C.PUSH_WIDTH * b.def.scale;

    // Bodies push each other unless one is lying down, mid-throw, or clearly above the other.
    var solid = !NO_PUSH[a.state] && !NO_PUSH[b.state] && Math.abs(a.y - b.y) < 70;
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
    if (d.state !== 'juggle' || d.ko || d.wallUsed || d.bounding || d.y > C.WALL_SPLAT_MAX_Y) return;
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
  FG.runCombo = function (atk, dfn, combo, frames) {
    var m = new Match(atk, dfn), i;
    for (i = 0; i < 2; i++) m.step([FG.emptyRaw(), FG.emptyRaw()]);
    var dist = combo.dist || 40;
    if (combo.wall) { var w = C.WALL_R - 18 * dfn.scale - 10; m.fighters[1].x = w; m.fighters[0].x = w - 44; }
    else { m.fighters[0].x = 500 - dist / 2; m.fighters[1].x = 500 + dist / 2; }
    var hits = [], damage = 0, next = 0, f0 = m.frame, fired = {}, firedOpp = {};
    function merge(r, notation) { var add = FG.parseInput(notation); for (var k in add) if (add[k]) r[k] = true; }
    for (i = 0; i < (frames || 320); i++) {
      var r1 = FG.emptyRaw(), r2 = FG.emptyRaw(), t = m.frame - f0;
      if (combo.plan && combo.plan[t] && !fired[t]) { merge(r1, combo.plan[t]); fired[t] = true; }
      (combo.hold || []).forEach(function (h) { if (t >= h[0] && t <= h[1]) merge(r1, h[2]); });
      if (combo.queue && next < combo.queue.length && m.fighters[0].state === 'idle' && m.hitstop === 0) merge(r1, combo.queue[next++]);
      if (combo.oppPlan && combo.oppPlan[t] && !firedOpp[t]) { merge(r2, combo.oppPlan[t]); firedOpp[t] = true; }
      m.step([r1, r2]);
      m.events.forEach(function (e) { if (e.type === 'hit' && e.attacker === 0) { hits.push(e.move.id); damage += e.damage; } });
    }
    return { hits: hits, damage: damage, match: m };
  };

  FG.Match = Match;
})();
