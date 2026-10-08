// Procedural motion layered on top of the keyframed poses. Render only: the
// simulation never reads any of this.
//
//   Attacks:   anticipation (weight back, shoulders wound up), a full-body strike
//              (hips drive forward, shoulders and hips rotate through, the body
//              leans into it), then recovery that eases back with a small settle.
//              The striking hand or foot is pinned to its authored spot while the
//              move is active, so the visuals still match the hitbox.
//   Feet:      feet stay planted on the floor where they land and take real steps
//              (one at a time, lifted in an arc) when the body moves away from
//              them. Knees and elbows are re-solved with two-bone IK so limbs keep
//              their length. Grounded fighters never float above or sink into the floor.
//   Reactions: getting hit snaps, folds, spins or crumples the body by impact kind.
//   Juggles:   the body tumbles with its vertical speed.
(function () {
  var C = FG.C;

  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function dist(ax, ay, bx, by) { var dx = bx - ax, dy = by - ay; return Math.sqrt(dx * dx + dy * dy); }

  // --- What kind of motion an attack is ------------------------------------------

  var BY_POSE = {
    jab_x: 'jab', cross_x: 'cross', hook_x: 'hook', elbow_x: 'hook', body_x: 'body',
    hv_x: 'straight', hay_x: 'straight', om_x: 'straight', conf_x: 'straight', reflect_x: 'straight',
    counter_x: 'straight', rush_x: 'straight', tangent_x: 'straight', pw_palm: 'straight',
    fk_x: 'kick', kick_x: 'kick', knee_x: 'kick', eps_x: 'kick', poke_x: 'kick', wake_mid: 'kick',
    sk_x: 'roundhouse', delta_x: 'roundhouse', spin_x: 'roundhouse', reg_x: 'roundhouse',
    lk_x: 'low', st_x: 'low', wake_low: 'low', sweep_x: 'sweep', slide: 'sweep',
    up_x: 'launcher', flip_x: 'launcher', fib_x: 'launcher', outlier_x: 'launcher', power_x: 'launcher',
    xprod_x: 'launcher', toss_x: 'launcher',
    ham_x: 'overhead', slam_x: 'overhead', axe_x: 'overhead', feint_x: 'feint',
    shoulder: 'lunge', grab_x: 'throw',
    air_p: 'air', air_k: 'air', air_hx: 'air'
  };

  // The pose an attack shows on its first active frame.
  function activePose(m) {
    for (var i = 0; i < m.anim.length; i++) if (m.anim[i][0] >= m.startup) return m.anim[i][1];
    return m.anim[m.anim.length - 1][1];
  }

  FG.motionKind = function (m) {
    if (!m) return null;
    if (m._kind !== undefined) return m._kind;
    var k = m.motion || null; // a move can name its motion kind outright
    if (k) { /* declared */ }
    else if (m.throw) k = 'throw';
    else if (m.air) k = 'air';
    else if (m.id === 'launcher' || m.strength === 'launch') k = 'launcher';
    else if (m.id === 'sweep') k = 'sweep';
    else if (m.anim) k = BY_POSE[activePose(m)] || null;
    if (!k && m.box) k = m.level === 'low' ? 'low' : m.strength === 'heavy' ? 'straight' : 'jab';
    m._kind = k;
    return k;
  };

  // How a hit looks and sounds: jab (quick), body (heavy), power (roundhouses and
  // big swings), launch (explosive), overhead (slams), low, throw.
  FG.impactKind = function (m) {
    if (!m) return 'jab';
    if (m._impact) return m._impact;
    var k = FG.motionKind(m), heavy = m.strength === 'heavy', out;
    switch (k) {
      case 'jab': case 'cross': out = heavy ? 'power' : 'jab'; break;
      case 'hook': out = heavy ? 'power' : (m.level === 'mid' ? 'body' : 'jab'); break;
      case 'body': out = 'body'; break;
      case 'straight': case 'lunge': out = heavy ? 'power' : 'body'; break;
      case 'kick': out = heavy ? 'power' : 'body'; break;
      case 'roundhouse': out = 'power'; break;
      case 'low': case 'sweep': out = 'low'; break;
      case 'launcher': out = 'launch'; break;
      case 'overhead': out = 'overhead'; break;
      case 'throw': out = 'throw'; break;
      case 'air': out = m.bound ? 'overhead' : m.strength === 'light' ? 'jab' : 'body'; break;
      default: out = m.level === 'low' ? 'low' : heavy ? 'power' : 'jab';
    }
    m._impact = out;
    return out;
  };

  // Per kind: anticipation (a*) and strike (s*) amounts.
  //   lean: degrees (+ forward)   hip: px (+ toward the opponent)
  //   dip:  px (+ lower)          twist: shoulder / hip rotation (+ back shoulder forward)
  var PROFILE = {
    jab:        { aLean: -2,  aHip: -1.5, aDip: 0.5, aTwist: -0.2, sLean: 5,   sHip: 2.5, dip: 0.5, sTwist: 0.4 },
    cross:      { aLean: -4,  aHip: -2.5, aDip: 1,   aTwist: -0.7, sLean: 8,   sHip: 4,   dip: 1,   sTwist: 1.0 },
    hook:       { aLean: -4,  aHip: -2,   aDip: 1,   aTwist: -0.9, sLean: 7,   sHip: 3,   dip: 1.5, sTwist: 1.1 },
    body:       { aLean: -3,  aHip: -2,   aDip: 2,   aTwist: -0.6, sLean: 11,  sHip: 4.5, dip: 5,   sTwist: 0.8 },
    straight:   { aLean: -7,  aHip: -4,   aDip: 2,   aTwist: -1.0, sLean: 9,   sHip: 6,   dip: 2,   sTwist: 1.2 },
    lunge:      { aLean: -5,  aHip: -3,   aDip: 2.5, aTwist: -0.4, sLean: 10,  sHip: 6,   dip: 2,   sTwist: 0.8 },
    kick:       { aLean: -2,  aHip: -1.5, aDip: 1.5, aTwist: -0.3, sLean: -6,  sHip: 1,   dip: 0,   sTwist: 0.4 },
    roundhouse: { aLean: 4,   aHip: -2,   aDip: 2,   aTwist: -1.0, sLean: -12, sHip: 2,   dip: 0,   sTwist: 1.4 },
    low:        { aLean: -2,  aHip: -1,   aDip: 2,   aTwist: -0.3, sLean: 4,   sHip: 2,   dip: 2,   sTwist: 0.5 },
    sweep:      { aLean: 0,   aHip: -1,   aDip: 2,   aTwist: -0.6, sLean: 6,   sHip: 2,   dip: 1,   sTwist: 1.0 },
    launcher:   { aLean: 4,   aHip: -1.5, aDip: 8,   aTwist: -0.5, sLean: -7,  sHip: 3,   dip: -5,  sTwist: 0.7 },
    overhead:   { aLean: -10, aHip: -3,   aDip: -2,  aTwist: -0.5, sLean: 14,  sHip: 5,   dip: 6,   sTwist: 0.7 },
    feint:      { aLean: -10, aHip: -3,   aDip: -2,  aTwist: -0.5, sLean: 3,   sHip: 1,   dip: 0,   sTwist: 0.2 },
    throw:      { aLean: -2,  aHip: -1,   aDip: 2,   aTwist: -0.3, sLean: 6,   sHip: 3,   dip: 2,   sTwist: 0.4 },
    air:        { aLean: -4,  aHip: -1,   aDip: 0,   aTwist: -0.4, sLean: 6,   sHip: 2,   dip: 0,   sTwist: 0.6 }
  };
  FG.MOTION_PROFILE = PROFILE;

  // Anticipation (A) and strike (S) amounts through an attack.
  // A rises to a wind-up peak ~60% into startup and is released into the strike;
  // S snaps in over the last ~40% of startup, holds through the active frames,
  // then eases out in recovery with a small overshoot that settles.
  function phase(f) {
    var m = f.move, su = m.startup, ae = su + m.active - 1, mf = f.moveFrame, A = 0, S = 0;
    if (mf < su) {
      var u = su > 1 ? (mf - 1) / (su - 1) : 1;
      if (u < 0.6) A = ease(u / 0.6);
      else { A = 1 - ease((u - 0.6) / 0.4); S = ease((u - 0.6) / 0.4); }
    } else if (mf <= ae) {
      S = 1;
    } else {
      var r = (mf - ae) / Math.max(1, m.total - ae);
      S = r < 0.75 ? 1 - ease(r / 0.75) : -0.18 * Math.sin(Math.PI * (r - 0.75) / 0.25);
    }
    return { A: A, S: S, active: mf >= su && mf <= ae };
  }
  FG.attackPhase = phase;

  // Which joint does the hitting: the hand or foot nearest the hitbox at the active pose.
  function effector(def, m) {
    if (!m.hitbox || !m.anim) return null;
    var key = '_eff_' + def.id;
    if (m[key] !== undefined) return m[key];
    var p = FG.getPose(def, activePose(m)), hb = m.hitbox;
    var cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2, best = null, bd = 1e9;
    [4, 6, 8, 10].forEach(function (j) {
      var d = dist(p[j * 2], p[j * 2 + 1], cx, cy);
      if (d < bd) { bd = d; best = j; }
    });
    m[key] = best;
    return best;
  }
  FG.effectorJoint = effector;

  // Rotate joints about the hip by `deg` (+ forward), like FG.pose's lean.
  function rotate(p, joints, deg) {
    if (!deg) return;
    var a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), hx = p[0], hy = p[1];
    for (var i = 0; i < joints.length; i++) {
      var j = joints[i], dx = p[j * 2] - hx, dy = p[j * 2 + 1] - hy;
      p[j * 2] = hx + dx * cs + dy * sn;
      p[j * 2 + 1] = hy - dx * sn + dy * cs;
    }
  }
  function shift(p, joints, dx, dy) {
    for (var i = 0; i < joints.length; i++) { p[joints[i] * 2] += dx; p[joints[i] * 2 + 1] += dy; }
  }
  var UPPER = [1, 2, 3, 4, 5, 6], BODY = [0, 1, 2, 3, 4, 5, 6], ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Two-bone IK: place the middle joint so root→mid→end keeps the lengths of `ref`,
  // bending to the same side as it does in `ref`.
  function solve(p, ref, root, mid, end) {
    var rx = p[root * 2], ry = p[root * 2 + 1], ex = p[end * 2], ey = p[end * 2 + 1];
    var L1 = dist(ref[root * 2], ref[root * 2 + 1], ref[mid * 2], ref[mid * 2 + 1]);
    var L2 = dist(ref[mid * 2], ref[mid * 2 + 1], ref[end * 2], ref[end * 2 + 1]);
    var d = dist(rx, ry, ex, ey);
    if (d < 0.01 || L1 < 0.01 || L2 < 0.01) return;
    // Bend side from the reference pose.
    var vx = ref[end * 2] - ref[root * 2], vy = ref[end * 2 + 1] - ref[root * 2 + 1];
    var wx = ref[mid * 2] - ref[root * 2], wy = ref[mid * 2 + 1] - ref[root * 2 + 1];
    var side = vx * wy - vy * wx >= 0 ? 1 : -1;
    var ux = (ex - rx) / d, uy = (ey - ry) / d;
    if (d >= L1 + L2) { p[mid * 2] = rx + ux * d * L1 / (L1 + L2); p[mid * 2 + 1] = ry + uy * d * L1 / (L1 + L2); return; }
    var a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    // (-uy, ux) is the left-hand normal; pick the side matching the reference bend.
    p[mid * 2] = rx + ux * a - uy * h * side;
    p[mid * 2 + 1] = ry + uy * a + ux * h * side;
  }
  FG.solveIK = solve;

  // --- Layers ----------------------------------------------------------------------

  function attackLayer(f, p, ref) {
    var m = f.move, kind = FG.motionKind(m), prof = PROFILE[kind];
    if (!prof || m.taunt || m.parry || m.stanceSwitch) return 0;
    var ph = phase(f), A = ph.A, S = ph.S;
    // Charging (Order of Magnitude): hold the wind-up and tremble with effort.
    if (f.chargeFrames && f.moveFrame === m.charge.at) { A = 1; S = 0; shift(p, BODY, (f.chargeFrames % 2 ? 0.6 : -0.6), 0); }
    var lean = prof.aLean * A + prof.sLean * S;
    var hip = prof.aHip * A + prof.sHip * S;
    var dip = prof.aDip * A + prof.dip * S;
    var twist = prof.aTwist * A + prof.sTwist * S;
    var e = effector(f.def, m);
    var ex = e != null ? p[e * 2] : 0, ey = e != null ? p[e * 2 + 1] : 0;
    rotate(p, UPPER, lean);
    shift(p, BODY, hip, -dip);
    // Pin the striking hand to its authored spot as the strike lands (the foot is
    // never moved by this layer; the leg IK re-solves the knee).
    if (e === 4 || e === 6) {
      var w = Math.max(0, Math.min(1, S));
      p[e * 2] += (ex - p[e * 2]) * w;
      p[e * 2 + 1] += (ey - p[e * 2 + 1]) * w;
      solve(p, ref, 1, e - 1, e);
    }
    f._strike = { e: e, S: S, active: ph.active };
    return twist;
  }

  var REACT = {
    // head snaps back
    jab:      { dur: 10, lean: -7,  hip: -1.5, dip: 0, twist: -0.3, head: -4 },
    // folds over the blow and sinks
    body:     { dur: 16, lean: 14,  hip: -3,   dip: 6, twist: 0.2,  head: 2 },
    // spun round by it
    power:    { dur: 18, lean: -15, hip: -4,   dip: 2, twist: -1.4, head: -3 },
    // crumples down
    overhead: { dur: 16, lean: 12,  hip: -2,   dip: 9, twist: 0,    head: 2 },
    low:      { dur: 12, lean: 5,   hip: -2,   dip: 4, twist: -0.3, head: 0 },
    launch:   { dur: 10, lean: -8,  hip: -2,   dip: 0, twist: -0.6, head: -3 },
    block:    { dur: 8,  lean: -4,  hip: -2,   dip: 1.5, twist: -0.3, head: -1 }
  };

  // f._react = { kind, t }: set by the scene when a hit or block lands.
  function reactLayer(f, p, frozen) {
    var r = f._react;
    if (!r) return 0;
    var R = REACT[r.kind] || REACT.jab;
    if (!frozen) r.t++;
    if (r.t > R.dur || (f.state !== 'hitstun' && f.state !== 'blockstun' && f.state !== 'guardbreak' && f.state !== 'wallsplat')) {
      f._react = null;
      return 0;
    }
    var k = r.t <= 2 ? 1 : Math.pow(1 - (r.t - 2) / (R.dur - 2), 2);
    k *= (r.scale || 1) * (f.def.react || 1); // how hard this fighter reels (PEDERSEN barely, CHAI a lot)
    rotate(p, UPPER, R.lean * k);
    shift(p, BODY, R.hip * k, -R.dip * k);
    p[4] += R.head * k;
    return R.twist * k;
  }

  // --- Planted feet -------------------------------------------------------------------

  var PLANT = { idle: 1, walkF: 1, walkB: 1, crouch: 1, attack: 1, hitstun: 1, blockstun: 1, guardbreak: 1,
    dash: 1, run: 1, backdash: 1, sidestep: 1, land: 1, prejump: 1, throwing: 1, throwbreak: 1, getup: 1 };
  var LIFTED = 4;     // a pose foot higher than this is off the floor (kicks)
  var STEP_AT = 6;    // px of drift before a planted foot steps

  function groundedPose(f) {
    if (!PLANT[f.state] || f.y > 0.5) return false;
    if (f.state === 'attack' && (f.move.air || /^wake/.test(f.move.id))) return false;
    if (f.state === 'getup' && f.stateFrame < C.GETUP_FRAMES * 0.6) return false;
    return true;
  }

  function plantFeet(f, p, ref, frozen) {
    var s = f.def.scale * (1 - f.z * 0.004), dir = f.facing;
    var ft = f._feet;
    if (!ft || ft.dir !== dir) ft = f._feet = { dir: dir, px: f.x, v: 0, legs: [{ wx: null }, { wx: null }] };
    if (!frozen) { ft.v = ft.v * 0.5 + (f.x - ft.px) * 0.5; ft.px = f.x; }
    // Nothing floats: if the pose holds both feet off the floor, bring it down.
    var low = Math.min(p[17], p[21]);
    if (low > 0 && low <= 8) shift(p, ALL, 0, -low);
    var attacking = f.state === 'attack';
    for (var k = 0; k < 2; k++) {
      var j = k ? 10 : 8, leg = ft.legs[k], other = ft.legs[1 - k];
      var want = f.x + p[j * 2] * s * dir;
      if (p[j * 2 + 1] > LIFTED) { leg.wx = null; leg.step = null; continue; } // lifted by the pose
      if (leg.wx == null) leg.wx = want;
      var lift = 0, x = leg.wx;
      if (leg.step) {
        var st = leg.step;
        if (!frozen) st.t++;
        var lead = Math.max(-14, Math.min(14, ft.v * st.dur * 0.55));
        st.to = want + lead;
        var u = Math.min(1, st.t / st.dur);
        x = st.from + (st.to - st.from) * ease(u);
        lift = Math.sin(Math.PI * u) * st.h;
        if (u >= 1) { leg.wx = st.to; leg.step = null; x = leg.wx; lift = 0; }
      } else if (!frozen) {
        var drift = want - leg.wx, th = attacking ? STEP_AT - 2 : STEP_AT;
        if (Math.abs(drift) > th && (!other.step || Math.abs(drift) > th * 4)) {
          var speed = Math.abs(ft.v);
          var dur = Math.max(attacking ? 3 : 4, Math.min(8, Math.round(9 - speed * 0.9)));
          leg.step = { from: leg.wx, to: want, t: 0, dur: dur, h: Math.min(7, 2 + Math.abs(drift) * 0.18 + speed * 0.4) };
        }
      }
      p[j * 2] = (x - f.x) / (s * dir);
      p[j * 2 + 1] = lift;
    }
    // Weight goes into the legs: if a planted leg can't reach the floor, the hips drop.
    var drop = 0;
    for (var q = 0; q < 2; q++) {
      var kn = q ? 9 : 7, fo = q ? 10 : 8;
      if (p[fo * 2 + 1] > 0.5) continue;
      var L = dist(ref[0], ref[1], ref[kn * 2], ref[kn * 2 + 1]) + dist(ref[kn * 2], ref[kn * 2 + 1], ref[fo * 2], ref[fo * 2 + 1]);
      var dx = p[fo * 2] - p[0], reach = Math.sqrt(Math.max(0, L * L * 0.995 - dx * dx));
      drop = Math.max(drop, (p[1] - p[fo * 2 + 1]) - reach);
    }
    if (drop > 0) shift(p, BODY, 0, -Math.min(10, drop));
  }

  // --- Entry point -------------------------------------------------------------------

  // base: the blended keyframe pose. Returns the pose to draw.
  // opts.frozen: hitstop is on (reactions and steps hold still).
  FG.applyMotion = function (f, base, opts) {
    var p = base.slice(), twist = 0, frozen = opts && opts.frozen;
    f._strike = null;
    if (f._override || f.puppet) { f._feet = null; f._twist = 0; f._trail = null; return p; }
    if (f.state === 'attack' && f.move) twist += attackLayer(f, p, base);
    twist += reactLayer(f, p, frozen);
    // Juggled bodies tumble with their vertical speed.
    if (f.state === 'juggle') rotate(p, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], Math.max(-35, Math.min(35, -f.vy * 4)));
    if (groundedPose(f)) {
      plantFeet(f, p, base, frozen);
      solve(p, base, 0, 7, 8);
      solve(p, base, 0, 9, 10);
    } else {
      f._feet = null;
      if (f.state === 'attack' && f.move && f.move.air) { solve(p, base, 0, 7, 8); solve(p, base, 0, 9, 10); }
    }
    f._twist = Math.max(-1.6, Math.min(1.6, twist));
    trail(f, p, frozen);
    return p;
  };

  // A short streak behind the striking hand or foot as it snaps out.
  function trail(f, p, frozen) {
    var st = f._strike;
    if (!f._trail) f._trail = [];
    if (frozen) return;
    if (st && st.e != null && st.S > 0.35 && f.moveFrame <= f.move.startup + f.move.active) {
      var s = f.def.scale * (1 - f.z * 0.004);
      f._trail.push({ x: f.x + p[st.e * 2] * s * f.facing, y: C.GROUND_Y - f.z * 0.5 - (p[st.e * 2 + 1] * s + f.y) });
      if (f._trail.length > 5) f._trail.shift();
    } else if (f._trail.length) {
      f._trail.shift();
    }
  }
})();
