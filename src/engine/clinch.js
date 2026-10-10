// THE CLINCH (MATEUS). Extends FG.Match.
//
// His front throw (P+K up close: moves.throw with `clinch`) doesn't throw: it locks a
// Thai clinch, hands behind their head, heads tied up. From the clinch his buttons are
// follow-ups, moves in his kit with no hitbox (the match lands them):
//   P      clinchKnee1..3: a knee to the body, up to three, each one stronger
//   K      clinchDump: an off-balance dump that knocks them down
//   H      clinchLaunch: a jumping knee to the head that launches
//   back   clinchElbow: break off with a short elbow (he's plus)
//   P+K    for a bar (or the enhanced grab, throwEX): the knees always reach three, one
//          after another, and they can't fight out until the third has landed
// They get out with timing (P within CLINCH_BREAK_WINDOW of the lock, like a throw
// break) or by mashing P / K / H (CLINCH_MASH presses; each knee that lands knocks
// CLINCH_KNEE_RELIEF of them back out). Left alone for CLINCH_HOLD frames, it comes
// apart on its own.
(function () {
  var C = FG.C, Match = FG.Match;
  var KNEES = ['clinchKnee1', 'clinchKnee2', 'clinchKnee3'];

  function throwPressed(buf, frame) {
    return buf.wasPressed('p', frame) && buf.wasPressed('k', frame) && Math.abs(buf.pressed.p - buf.pressed.k) <= 2;
  }

  Match.prototype.startClinch = function (c, m) {
    var a = this.fighters[c.a], d = this.fighters[c.d];
    a.actionable = false; d.actionable = false;
    a.contact = 'hit';
    a.setState('clinch'); d.setState('clinched');
    a.clinchAct = null; d.clinchHurt = 0;
    d.stance = 'A';
    d.facing = -a.facing;
    a.vx = d.vx = 0; a.slide = d.slide = 0;
    this.measure = null;
    this.clinch = { a: c.a, d: c.d, start: this.frame, knees: 0, mash: 0, seen: {}, idle: 0, act: null, ex: !!m.clinchEx, move: m };
    this.placeClinch();
    this.lastResult[c.a] = { move: m, kind: 'CLINCH', adv: null };
    this.events.push({ type: 'grab', attacker: c.a, defender: c.d, move: m, x: d.x, y: 70, clinch: true, feint: a.fromFeint });
  };

  // Hold them at clinch distance (and off the walls).
  Match.prototype.placeClinch = function () {
    var cl = this.clinch, a = this.fighters[cl.a], d = this.fighters[cl.d];
    var gap = C.CLINCH_GAP * a.def.scale, w = C.PUSH_WIDTH * d.def.scale;
    a.y = 0; d.y = 0;
    d.x = a.x + a.facing * gap;
    if (d.x > C.WALL_R - w) d.x = C.WALL_R - w;
    if (d.x < C.WALL_L + w) d.x = C.WALL_L + w;
    a.x = d.x - a.facing * gap;
  };

  Match.prototype.updateClinch = function () {
    var cl = this.clinch;
    if (!cl) return;
    var a = this.fighters[cl.a], d = this.fighters[cl.d], ab = this.buffers[cl.a], db = this.buffers[cl.d], fr = this.frame;
    if (a.state !== 'clinch' || d.state !== 'clinched') { this.clinch = null; a.clinchAct = null; return; }
    if (d.clinchHurt > 0) d.clinchHurt--;
    var tf = fr - cl.start;

    // Getting out: P on time (like breaking a throw)...
    if (!cl.ex && tf <= C.CLINCH_BREAK_WINDOW && db.pressed.p >= cl.start - 2 && db.pressed.k < cl.start - 2) { this.endClinch(); return; }
    // ...or fighting out of it.
    if (!cl.ex) {
      for (var k = 0; k < 3; k++) {
        var b = 'pkh'[k];
        if (db.pressed[b] >= cl.start - 2 && db.pressed[b] !== cl.seen[b]) { cl.seen[b] = db.pressed[b]; cl.mash++; }
      }
      if (cl.mash >= C.CLINCH_MASH) { this.endClinch(); return; }
    }

    // A follow-up playing out.
    if (cl.act) {
      var act = cl.act;
      act.t++;
      if (act.t === act.move.startup) { this.clinchHit(act.move); if (!this.clinch) return; }
      if (act.t >= act.move.total) { cl.act = null; a.clinchAct = null; cl.idle = 0; }
      this.placeClinch();
      return;
    }
    if (tf < C.CLINCH_LOCK) { this.placeClinch(); return; }

    // His next follow-up (a back tap is buffered like a button).
    var id = null, backTaps = a.facing > 0 ? ab.leftTaps : ab.rightTaps;
    if (throwPressed(ab, fr)) {
      ab.consume('p'); ab.consume('k');
      if (!cl.ex && cl.knees < 3 && this.spendMeter(cl.a, 1)) {
        cl.ex = true;
        this.events.push({ type: 'enhance', fighter: cl.a, move: a.def.moves.throwEX || cl.move, x: a.x, y: 60 });
      }
    }
    if (cl.ex && cl.knees < 3) id = KNEES[cl.knees];
    else if (ab.wasPressed('h', fr)) { id = 'clinchLaunch'; ab.consume('h'); }
    else if (ab.wasPressed('k', fr)) { id = 'clinchDump'; ab.consume('k'); }
    else if (ab.wasPressed('p', fr) && cl.knees < 3) { id = KNEES[cl.knees]; ab.consume('p'); }
    else if (ab.back(a.facing) || (fr - backTaps[1] <= C.BUFFER_FRAMES && backTaps[1] >= cl.start - 2)) id = 'clinchElbow';
    if (id) {
      cl.act = { move: a.def.moves[id], t: 0 };
      a.clinchAct = cl.act;
      cl.idle = 0;
    } else if (++cl.idle > C.CLINCH_HOLD) { this.endClinch(); return; }
    this.placeClinch();
  };

  // They got out (or he let it come apart): both stagger back, like a broken throw.
  Match.prototype.endClinch = function () {
    var cl = this.clinch;
    this.clinch = null;
    this.fighters[cl.a].clinchAct = null;
    this.throwBreak(cl.a, cl.d, 'break');
  };

  // A follow-up lands. Knees keep the clinch; the others end it.
  Match.prototype.clinchHit = function (mv) {
    var cl = this.clinch, a = this.fighters[cl.a], d = this.fighters[cl.d];
    var dmg = this.dealDamage(cl.a, cl.d, mv.damage);
    var hitstop = C.HITSTOP[mv.strength] || 8;
    var ev = { type: 'hit', attacker: cl.a, defender: cl.d, move: mv, level: 'mid', clinch: true,
      x: d.x - a.facing * 8 * d.def.scale, y: mv.hitY || 50, facing: a.facing, damage: dmg, hits: this.combo[cl.d].hits, shake: mv.shake || 0.004 };
    this.measure = null;
    if (d.ko) {
      this.leaveClinch(mv);
      this.toJuggle(d, a, 7, mv);
      d.noTech = true;
      hitstop = C.HITSTOP_KO; ev.shake = 0.012; ev.finisher = true;
      this.lastResult[cl.a] = { move: mv, kind: 'K.O.', adv: null };
    } else if (mv.clinchKnee) {
      cl.knees++;
      cl.mash = Math.max(0, cl.mash - C.CLINCH_KNEE_RELIEF);
      d.clinchHurt = 12;
      ev.knee = cl.knees;
      this.lastResult[cl.a] = { move: mv, kind: 'KNEE ' + cl.knees, adv: null };
    } else if (mv.hit.launch) {
      this.leaveClinch(mv);
      this.toJuggle(d, a, mv.hit.launch * C.LAUNCH_SNAP, mv);
      ev.launch = true;
      this.lastResult[cl.a] = { move: mv, kind: 'LAUNCH', adv: null };
    } else if (mv.hit.knockdown) {
      this.leaveClinch(mv);
      this.toJuggle(d, a, 2.6, mv);
      d.vx = a.facing * 1.2;
      d.tripped = true; // dumped on the floor: not a juggle
      ev.knockdown = true; ev.finisher = true;
      this.lastResult[cl.a] = { move: mv, kind: 'KNOCKDOWN', adv: null };
    } else {
      // The elbow on the way out: hitstun, and he's plus.
      this.leaveClinch(mv);
      d.setState('hitstun');
      d.stun = (mv.total - mv.startup + 1) + mv.hit.adv;
      d.reaction = 'high';
      d.vx = 0;
      this.push(a, d, mv.push);
      this.startMeasure(cl.a, cl.d, mv, 'HIT', false);
    }
    if (ev.finisher && !d.ko) hitstop = Math.max(hitstop, C.HITSTOP_FINISHER);
    this.hitstop = Math.max(this.hitstop, hitstop);
    ev.ko = d.ko;
    this.events.push(ev);
  };

  // The clinch is over: he plays out the rest of the move that ended it.
  Match.prototype.leaveClinch = function (mv) {
    var cl = this.clinch, a = this.fighters[cl.a];
    this.clinch = null;
    a.clinchAct = null;
    a.startMove(mv.id);
    a.startedMove = null; // it landed: no whiff
    a.moveFrame = mv.startup;
    a.contact = 'hit';
    a.contactAt = mv.startup;
    a.actionable = false;
  };
})();
