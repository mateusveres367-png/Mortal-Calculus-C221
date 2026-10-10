// SUBMISSIONS (MAX, def.submissions). Extends FG.Match.
//
// After any knockdown or takedown, H next to the downed opponent (within SUB_REACH)
// starts a hold. The direction held picks it (each in def.submissions, with `dir`):
//   H      armbar         D+H    rear naked choke
//   F+H    kimura         B+H    triangle
// It works from neutral, out of a move that knocked them down (its recovery), out of
// a throw once they've hit the floor, and lands before they get up. One per knockdown.
//
// A struggle meter (0..100) starts at the hold's `start`. His presses (P / K / H)
// tighten it by `tighten`, theirs loosen it by SUB_ESCAPE, and it creeps tighter on its
// own (`drift` a frame). Full: they TAP (the hold's `damage`). Empty: they're out. If
// it runs SUB_TIME frames it comes apart, and they take part of the damage (half of
// it times how tight it got).
(function () {
  var C = FG.C, Match = FG.Match;
  var BTNS = 'pkh';

  // Can fighter i start a hold right now? Returns the hold's id, or null.
  Match.prototype.submissionFor = function (i) {
    var a = this.fighters[i], d = this.fighters[1 - i], subs = a.def.submissions, buf = this.buffers[i];
    if (!subs || this.sub || this.cinematic || this.clinch) return null;
    if (d.state !== 'down' || d.ko || d.subUsed || a.ko) return null;
    var t = this.throwState;
    var free = a.actionable ||
      // Out of a throw, once they've hit the floor.
      (a.state === 'throwing' && t && t.a === i && this.frame - t.start > C.THROW_SLAM_FRAME) ||
      // Out of the move that put them down.
      (a.state === 'attack' && a.contact === 'hit' && a.inRecovery()) ||
      (a.state === 'land' && a.stateFrame > 2);
    if (!free || a.isAirborne()) return null;
    if (Math.abs(a.x - d.x) > C.SUB_REACH * a.def.scale) return null;
    if (!buf.wasPressed('h', this.frame)) return null;
    // Pressing P+K+H is the ultimate or Extra Credit, not a hold.
    if (buf.wasPressed('p', this.frame) && buf.wasPressed('k', this.frame)) return null;
    var facing = d.x >= a.x ? 1 : -1, dir = 'n';
    if (buf.held.down) dir = 'down';
    else if (buf.forward(facing)) dir = 'fwd';
    else if (buf.back(facing)) dir = 'back';
    for (var id in subs) if (subs[id].dir === dir) return id;
    return null;
  };

  Match.prototype.trySubmissions = function () {
    for (var i = 0; i < 2; i++) {
      var id = this.submissionFor(i);
      if (id) { this.startSubmission(i, id); return; }
    }
  };

  Match.prototype.startSubmission = function (ai, id) {
    var a = this.fighters[ai], d = this.fighters[1 - ai], s = a.def.submissions[id], buf = this.buffers[ai];
    buf.consume('h');
    if (this.throwState) this.throwState = null;
    a.actionable = false; d.actionable = false;
    a.facing = d.x >= a.x ? 1 : -1;
    // `away`: turned away from him (on their back with their head at his end, or sat up
    // with their back to him); otherwise facing him.
    d.facing = s.away ? a.facing : -a.facing;
    a.setState('submit'); d.setState('submitted');
    a.vx = d.vx = a.vy = d.vy = 0; a.slide = d.slide = 0; a.y = d.y = 0;
    d.stance = 'A';
    d.subUsed = true;
    this.measure = null;
    var bufD = this.buffers[1 - ai];
    this.sub = { a: ai, d: 1 - ai, id: id, def: s, start: this.frame, t: 0, meter: s.start,
      seen: [{ p: buf.pressed.p, k: buf.pressed.k, h: buf.pressed.h }, { p: bufD.pressed.p, k: bufD.pressed.k, h: bufD.pressed.h }],
      end: null, endT: 0 };
    a.sub = d.sub = this.sub;
    this.placeSubmission();
    this.lastResult[ai] = { move: null, kind: s.name, adv: null };
    this.events.push({ type: 'submission', attacker: ai, defender: 1 - ai, id: id, name: s.name, x: d.x, y: 30 });
  };

  // Him at his place next to them for this hold (and both off the walls).
  Match.prototype.placeSubmission = function () {
    var sb = this.sub, a = this.fighters[sb.a], d = this.fighters[sb.d];
    var gap = (sb.def.gap || C.SUB_GAP) * a.def.scale, w = C.PUSH_WIDTH * d.def.scale;
    var lo = Math.min(C.WALL_L + w + Math.max(0, -a.facing * gap), C.WALL_R - w),
      hi = Math.max(C.WALL_R - w - Math.max(0, a.facing * gap), C.WALL_L + w);
    d.x = Math.max(lo, Math.min(hi, d.x));
    a.x = d.x - a.facing * gap;
  };

  // New presses of P / K / H by side k since last frame.
  function presses(sb, k, buf) {
    var n = 0, seen = sb.seen[k];
    for (var j = 0; j < 3; j++) {
      var b = BTNS[j];
      if (buf.pressed[b] > seen[b]) { n++; seen[b] = buf.pressed[b]; }
    }
    return n;
  }

  Match.prototype.updateSubmission = function () {
    var sb = this.sub;
    if (!sb) return;
    var a = this.fighters[sb.a], d = this.fighters[sb.d], s = sb.def;
    if (a.state !== 'submit' || d.state !== 'submitted') { this.clearSubmission(); return; }
    sb.t++;
    this.placeSubmission();
    // Tapped: hold it a moment for the tap, then let go.
    if (sb.end) {
      if (++sb.endT >= C.SUB_TAP_FRAMES) this.releaseSubmission();
      return;
    }
    var pa = presses(sb, 0, this.buffers[sb.a]), pd = presses(sb, 1, this.buffers[sb.d]);
    // Setting it in: presses count only once it's locked.
    if (sb.t <= C.SUB_SET) return;
    sb.meter += (s.drift || 0) + pa * s.tighten - pd * C.SUB_ESCAPE;
    sb.lastA = pa ? sb.t : sb.lastA; sb.lastD = pd ? sb.t : sb.lastD;
    if (sb.meter >= 100) {
      sb.meter = 100;
      sb.end = 'tap';
      var dmg = this.dealDamage(sb.a, sb.d, s.damage);
      this.hitstop = Math.max(this.hitstop, 12);
      this.lastResult[sb.a] = { move: null, kind: 'TAP!', adv: null };
      this.events.push({ type: 'tap', attacker: sb.a, defender: sb.d, id: sb.id, name: s.name, damage: dmg, ko: d.ko, hits: this.combo[sb.d].hits, x: d.x, y: 24, shake: 0.01 });
      if (d.ko) this.releaseSubmission();
      return;
    }
    if (sb.meter <= 0) { sb.meter = 0; this.releaseSubmission('escape'); return; }
    if (sb.t >= C.SUB_TIME) this.releaseSubmission('time');
  };

  // It's over: they get up (invulnerable while they do), a little ahead of him.
  Match.prototype.releaseSubmission = function (how) {
    var sb = this.sub, a = this.fighters[sb.a], d = this.fighters[sb.d], s = sb.def;
    how = how || sb.end;
    if (how === 'time') {
      var part = Math.round(s.damage * sb.meter / 100 * 0.5);
      if (part > 0) this.dealDamage(sb.a, sb.d, part);
    }
    this.clearSubmission();
    d.facing = -a.facing;
    if (d.ko) d.setState('ko');
    else d.setState('getup'); // they roll out of it and up (a tap has done its damage)
    a.setState('land');
    a.landLag = how === 'tap' ? C.SUB_RECOVER : C.SUB_RECOVER + 4;
    a.riseFrom = 'sub_' + sb.id + '2'; // he gets up out of the hold (the renderer)
    this.events.push({ type: 'subend', attacker: sb.a, defender: sb.d, how: how, x: d.x, y: 30 });
  };

  Match.prototype.clearSubmission = function () {
    var sb = this.sub;
    if (!sb) return;
    this.sub = null;
    this.fighters[sb.a].sub = null;
    this.fighters[sb.d].sub = null;
  };
})();
