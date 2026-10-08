// Fighter definitions: the shared kit and the roster registry.
//
// Each fighter lives in its own file under src/data/fighters/ and calls
// FG.defineFighter(def). A definition holds identity (name, archetype, theme,
// bio), look (drawn in code), stance and idle animation, poses, moves, combo
// routes, intro / victory / defeat animations and victory lines.
//
// Frame data follows the usual convention: a move with startup 10 hits on the
// 10th frame after the button press (the press frame is frame 1).
// block / hit.adv / ch.adv are frame advantage for the attacker once both
// fighters can act again. A result with `launch` sends the opponent airborne
// (the number is the launch velocity), `knockdown` trips them.
//
// hitbox: { x, w, y, h } relative to the fighter's feet, x forward, y up.
// anim:   [[moveFrame, poseName], ...] keyframes, eased between.
// step:   [fromFrame, toFrame, speed] forward movement during the move.
// cancels: follow-ups that can interrupt this move (strings). btn is a button,
//          'up' (jump), or 'throw' (P+K).
//
// Move ids the input system looks for (missing ones fall back to the plain move):
//   P: jab, fP, bP, dP          K: mid, fK, bK, low (D), dfK (D/F), sweep (D/B)
//   H: heavy, fH, bH, launcher (D)         P+K: throw, throwB (back), cmdGrab (forward)
//   air: airP, airK, airH      knocked down: wakeLow (K), wakeMid (P/H)
//   from a dash: dashP; from a sidestep: ssP, ssK; stance B: pwP, pwK, pwH
//   T: taunt
(function () {
  FG.ROSTER = [];
  FG.FIGHTERS = FG.ROSTER; // older name

  var LOOK = {
    skin: 0xd9a066, eyes: 0x111111,
    hair: { style: 'neat', color: 0x2b1d14 },
    beard: null, glasses: null, mouth: 'smile', brows: 'normal',
    top: { style: 'tee', color: 0x3c6fb0, pattern: null, sleeves: 'short' },
    legs: 0x2a2d3a, shoes: 0x1c1c1c,
    build: { torso: 1, limb: 1 }
  };

  FG.defineFighter = function (def) {
    def.look = Object.assign({}, LOOK, def.look);
    def.look.build = Object.assign({}, LOOK.build, def.look.build);
    def.poses = def.poses || {};
    def.idleAnim = Object.assign({ breath: 1.2, bob: 0, sway: 0, rate: 0.09 }, def.idleAnim);
    def.combos = def.combos || [];
    if (def.stringH) addStringHeavy(def);
    for (var key in def.moves) prepareMove(def, key, def.moves[key]);
    for (key in def.moves) if (def.moves[key].ex) addEnhanced(def, key, def.moves[key]);
    if (def.ultimate) addUltimate(def);
    addPropMoves(def);
    FG.ROSTER.push(def);
    FG.ROSTER.sort(function (a, b) { return a.order - b.order; });
    return def;
  };

  FG.fighterById = function (id) {
    for (var i = 0; i < FG.ROSTER.length; i++) if (FG.ROSTER[i].id === id) return FG.ROSTER[i];
    return null;
  };

  // Every fighter's universal string ender: P, P, H. A quick version of their heavy
  // that the second hit of their P, P string cancels into, so launcher > P > P > H
  // always has an easy, reliable finish. def.stringH is its name.
  function addStringHeavy(def) {
    var mv = def.moves, hv = mv.heavy, a = hv.anim, la = mv.launcher.anim;
    var second = ((mv.jab.cancels || []).filter(function (c) { return c.btn === 'p'; })[0] || {}).into;
    mv.jabH = {
      name: 'String Heavy', label: def.stringH, cmd: 'P,P,H', level: 'mid', strength: 'heavy',
      startup: 12, active: 3, recovery: 20, damage: 13,
      block: -9, hit: { knockdown: true }, ch: { knockdown: true },
      // A rising heavy (the windup of their heavy, the strike of their launcher) that
      // reaches a juggled opponent high or low.
      hitbox: { x: 10, w: 32, y: 34, h: 80 }, push: 18, carry: 1.2, shake: 0.006,
      step: [4, 12, 1.2],
      anim: [[1, a[0][1]], [7, a[1][1]], [12, la[2][1]], [14, la[2][1]], [24, la[la.length - 2][1]], [34, 'idle']]
    };
    if (second && mv[second]) {
      var m2 = mv[second];
      m2.cancels = (m2.cancels || []).filter(function (c) { return c.btn !== 'h'; });
      m2.cancels.push({ btn: 'h', into: 'jabH', from: m2.startup, to: m2.startup + 14, onContact: true });
    }
  }

  // Enhanced specials: a special with `ex` gets a powered-up version, moves[id + 'EX'],
  // that P+K turns it into during its startup for one bar of Grade meter.
  //   ex: { text, damage (multiplier, default 1.3), multi (extra hits), armor: { hits },
  //         hit / ch (new results), wallSplat }
  // Extra hits come every MULTI_GAP frames (the active frames grow to fit them); only
  // the last one has the move's real result (the others keep the opponent in hitstun).
  // Armor covers the rest of the startup and the first active frame (so it wins trades).
  FG.EX_SUFFIX = 'EX';
  function addEnhanced(def, key, base) {
    var x = base.ex, gap = FG.C.MULTI_GAP, multi = x.multi || 0, extra = multi * gap;
    var m = Object.assign({}, base, {
      id: key + FG.EX_SUFFIX, base: key, enhanced: true, ex: null, label: base.label + '+', exText: x.text,
      active: base.active + extra, multi: multi,
      // Total damage grows; with extra hits it's shared out between them.
      damage: Math.max(4, Math.round(base.damage * (x.damage || 1.3) / (1 + multi * 0.5))),
      push: multi ? base.push * 0.35 : base.push
    });
    m.total = m.startup + m.active - 1 + m.recovery;
    if (x.armor) m.armor = { from: 1, to: base.startup, hits: x.armor.hits || 1 };
    if (x.hit) m.hit = x.hit;
    m.ch = x.ch || (x.hit ? (x.hit.launch ? { launch: x.hit.launch } : x.hit.knockdown ? { knockdown: true } : { adv: x.hit.adv + 3 }) : base.ch);
    if (x.wallSplat) m.wallSplat = true;
    // The animation: the strike re-fires for each extra hit, then the recovery plays late.
    if (extra) {
      var end = base.startup + base.active - 1, a = base.anim, strike = null, wind = null, out = [];
      a.forEach(function (k) { if (k[0] <= end) { wind = strike; strike = k[1]; } });
      a.forEach(function (k) { if (k[0] <= end) out.push(k); });
      for (var h = 1; h <= multi; h++) {
        out.push([end + h * gap - Math.ceil(gap / 2), wind || strike]);
        out.push([end + h * gap, strike]);
      }
      a.forEach(function (k) { if (k[0] > end) out.push([k[0] + extra, k[1]]); });
      m.anim = out;
    }
    def.moves[m.id] = m;
  }

  // Ultimates: def.ultimate { name, from, len, hits, weights, end, counter } becomes
  // moves.ultimate, the opening strike (or grab, or counter stance) built from the move
  // it names. It costs all three bars (down, down-forward, forward + P+K+H); if it
  // connects the match plays the cinematic (match.js), and blocked or whiffed it
  // leaves them open for ULT_EXTRA_RECOVERY frames more.
  function addUltimate(def) {
    var u = def.ultimate, base = def.moves[u.from], extra = FG.C.ULT_EXTRA_RECOVERY;
    var m = Object.assign({}, base, {
      id: 'ultimate', name: 'Ultimate', label: u.name, cmd: 'D,D/F,F+P+K+H', ultimate: true, strength: 'heavy',
      cancels: null, ex: null, feint: false, charge: null, hold: null, kick: false, multi: 0, evade: null,
      recovery: base.recovery + extra, block: (base.block || 0) - extra
    });
    if (u.counter) {
      // A counter stance: any strike that touches it starts the cinematic.
      m.parry = { from: 4, to: u.window || 44, levels: ['high', 'mid', 'low'], ult: true };
      m.startup = m.parry.to; m.active = 1; m.recovery = 20 + extra;
      m.box = null;
    }
    m.total = m.startup + m.active - 1 + m.recovery;
    // The recovery plays out slower.
    var end = base.startup + base.active - 1;
    m.anim = base.anim.map(function (k) { return [k[0] > end ? k[0] + extra : k[0], k[1]]; });
    if (u.counter) m.anim = [[1, base.anim[0][1]], [4, u.pose || 'parry'], [m.parry.to, u.pose || 'parry'], [m.total, 'idle']];
    def.moves.ultimate = m;
  }

  // Stage objects (T next to one): a springboard dive at the opponent, or (back + T)
  // a vault over them out of the corner, invulnerable and passing through. Built from
  // each fighter's own jump and air kick poses.
  function addPropMoves(def) {
    var atk = {
      name: 'Springboard', label: 'SPRINGBOARD', cmd: 'T (BY AN OBJECT)', level: 'mid', strength: 'heavy', motion: 'kick', prop: true,
      startup: 16, active: 5, recovery: 18, damage: 18, block: -6, hit: { knockdown: true }, ch: { knockdown: true },
      hitbox: { x: 16, w: 34, y: 30, h: 44 }, push: 14, carry: 1, shake: 0.008, step: [3, 20, 6],
      anim: [[1, 'squat'], [6, 'jump'], [16, 'air_k'], [21, 'air_k'], [31, 'squat'], [39, 'idle']]
    };
    var esc = {
      name: 'Vault', label: 'VAULT', cmd: 'B+T (BY AN OBJECT)', level: 'mid', strength: 'light', prop: true, vault: true,
      startup: 30, active: 1, recovery: 8, invuln: [1, 30], step: [4, 28, 6.2],
      anim: [[1, 'squat'], [6, 'jump'], [26, 'jump'], [31, 'squat'], [39, 'idle']]
    };
    prepareMove(def, 'propAtk', atk); prepareMove(def, 'propEsc', esc);
    def.moves.propAtk = atk; def.moves.propEsc = esc;
  }

  function prepareMove(def, key, m) {
    m.id = key;
    m.total = m.startup + m.active - 1 + m.recovery;
    // Easier chains: button cancels stay open a little later (never past the move).
    (m.cancels || []).forEach(function (c) {
      if (c.btn !== 'up' && !c._late) { c.to = Math.min(c.to + FG.C.CHAIN_LATE, m.startup + m.active - 1 + m.recovery); c._late = true; }
    });
    if (m.hitbox) {
      var hb = m.hitbox;
      m.box = { x: hb.x * def.scale, w: hb.w * def.scale, y: hb.y * def.scale, h: hb.h * def.scale };
    } else {
      m.box = null; // feints, stance switches, parries
    }
    if (!m.hit) m.hit = { adv: 0 };
    if (m.block == null) m.block = 0;
    if (!m.ch) m.ch = m.hit.launch ? { launch: m.hit.launch } : m.hit.knockdown ? { knockdown: true } : { adv: m.hit.adv + 3 };
    if (m.carry == null) m.carry = 0.5;
    if (m.juggle == null) m.juggle = 3;
    if (m.push == null) m.push = 8;
    if (m.shake == null) m.shake = 0;
  }

  // --- Combo trial steps ------------------------------------------------------------
  // Splits a route's notation into one step per hit, for combo trials:
  //   'D+H, UP, AIR P, AIR K' -> ['D+H', 'UP, AIR P', 'AIR K'] (UP, dash taps and RUN join the next hit)
  // and pulls out a setup condition ('AT THE WALL', 'BLOCK THEIR JAB', ...).
  // A route can also list its own `steps` and `setup`.
  var SETUPS = [/^AT THE WALL:\s*/, /^BLOCK THEIR JAB,\s*/, /^THEY WHIFF A JAB,\s*/];
  FG.comboSteps = function (combo) {
    if (combo.steps) return { setup: combo.setup || '', steps: combo.steps.slice() };
    var text = combo.notation, setup = '';
    SETUPS.forEach(function (re) {
      var m = text.match(re);
      if (m) { setup = m[0].replace(/[:,]\s*$/, ''); text = text.slice(m[0].length); }
    });
    var tokens = text.split(/,\s*/), steps = [], carry = '';
    tokens.forEach(function (t) {
      if (/^(UP|F|B|RUN)$/.test(t)) { carry += t + ', '; return; }
      steps.push(carry + t);
      carry = '';
    });
    return { setup: setup, steps: steps };
  };

  // --- Shared move templates ------------------------------------------------------
  // Each returns fresh move objects; fighters pass names and tweaks.

  function merge(base, over) { return Object.assign(base, over || {}); }

  FG.kit = {
    // Three air attacks. names: [airP, airK, airH]. o.slow adds startup for heavier fighters.
    // chain: which air buttons each air attack can cancel into on contact.
    air: function (names, o) {
      o = o || {};
      var sl = o.slow || 0;
      var chain = o.chain || { airP: ['k', 'h'], airK: ['h'] };
      function cancels(id, from, to) {
        var list = (chain[id] || []).map(function (b) { return { btn: b, into: b === 'k' ? 'airK' : 'airH', from: from, to: to, onContact: true }; });
        return list.length ? list : undefined;
      }
      return {
        airP: merge({
          name: 'Air Punch', label: names[0], cmd: 'AIR P', level: 'mid', strength: 'light', air: true,
          startup: 7 + sl, active: 4, recovery: 10, damage: 8 + sl * 2, landLag: 4 + sl,
          stunHit: 16, stunBlock: 10,
          hitbox: { x: 24, w: 18, y: 52, h: 16 }, push: 6, juggle: 2.6, carry: 0.4, stall: 2.6,
          cancels: cancels('airP', 7 + sl, 18 + sl),
          anim: [[1, 'jump'], [5 + sl, 'air_p'], [11 + sl, 'air_p'], [20 + sl, 'jump']]
        }, o.airP),
        airK: merge({
          name: 'Air Kick', label: names[1], cmd: 'AIR K', level: 'mid', strength: 'medium', air: true,
          startup: 9 + sl, active: 5, recovery: 12, damage: 11 + sl * 2, landLag: 6 + sl,
          stunHit: 18, stunBlock: 12,
          hitbox: { x: 26, w: 20, y: 14, h: 20 }, push: 10, juggle: 3, carry: 0.5, stall: 2.4, shake: 0.002,
          cancels: cancels('airK', 9 + sl, 22 + sl),
          anim: [[1, 'jump'], [6 + sl, 'air_k'], [14 + sl, 'air_k'], [25 + sl, 'jump']]
        }, o.airK),
        airH: merge({
          name: 'Air Heavy', label: names[2], cmd: 'AIR H', level: 'mid', strength: 'heavy', air: true, bound: true,
          startup: 12 + sl, active: 4, recovery: 16, damage: 16 + sl * 3, landLag: 10 + sl,
          stunHit: 22, stunBlock: 14,
          hitbox: { x: 16, w: 24, y: 26, h: 26 }, push: 14, juggle: 2, carry: 0.3, stall: 1.5, shake: 0.006,
          anim: [[1, 'jump'], [8 + sl, 'air_hc'], [12 + sl, 'air_hx'], [16 + sl, 'air_hx'], [31 + sl, 'jump']]
        }, o.airH)
      };
    },

    // Wake-up kicks from a knockdown.
    wake: function (o) {
      o = o || {};
      return {
        wakeLow: merge({
          name: 'Wake-up Low', label: 'ROLLING ZERO', cmd: 'K (DOWN)', level: 'low', strength: 'medium', crouching: true,
          startup: 14, active: 3, recovery: 22, damage: 10, block: -14, hit: { adv: -2 },
          hitbox: { x: 26, w: 22, y: 0, h: 14 }, push: 10, juggle: 2.5, shake: 0.002,
          anim: [[1, 'down'], [14, 'wake_low'], [17, 'wake_low'], [27, 'crouch'], [38, 'idle']]
        }, o.wakeLow),
        wakeMid: merge({
          name: 'Wake-up Mid', label: 'SPRING THEOREM', cmd: 'P/H (DOWN)', level: 'mid', strength: 'medium',
          startup: 18, active: 3, recovery: 22, damage: 14, block: -12, hit: { adv: 2 },
          hitbox: { x: 28, w: 22, y: 44, h: 20 }, push: 12, juggle: 3, shake: 0.003,
          anim: [[1, 'down'], [10, 'crouch'], [18, 'wake_mid'], [21, 'wake_mid'], [30, 'squat'], [42, 'idle']]
        }, o.wakeMid)
      };
    },

    // Low sweep that knocks down (down-back + K).
    sweep: function (label, o) {
      return merge({
        name: 'Sweep', label: label, cmd: 'D/B+K', level: 'low', strength: 'medium', crouching: true,
        startup: 20, active: 3, recovery: 26, damage: 16, noTech: true,
        block: -18, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 0, h: 14 }, push: 8, juggle: 2.5, shake: 0.004,
        anim: [[1, 'crouch'], [12, 'sweep_c'], [20, 'sweep_x'], [23, 'sweep_x'], [36, 'sweep_c'], [49, 'crouch']]
      }, o);
    },

    // Front throw (P+K, break with P) and reverse throw (back+P+K, break with K).
    throws: function (front, back, o) {
      o = o || {};
      var grab = [[1, 'idle'], [8, 'grab_c'], [12, 'grab_x'], [14, 'grab_x'], [39, 'idle']];
      return {
        throw: merge({
          name: 'Throw', label: front, cmd: 'P+K', level: 'high', strength: 'heavy', throw: true, breakBtn: 'p',
          startup: 12, active: 2, recovery: 26, damage: 30, hitbox: { x: 12, w: 26, y: 40, h: 40 },
          push: 0, juggle: 0, shake: 0.009, anim: grab
        }, o.throw),
        throwB: merge({
          name: 'Reverse Throw', label: back, cmd: 'B+P+K', level: 'high', strength: 'heavy', throw: true, breakBtn: 'k', reverse: true,
          startup: 12, active: 2, recovery: 26, damage: 34, hitbox: { x: 12, w: 26, y: 40, h: 40 },
          push: 0, juggle: 0, shake: 0.009, anim: grab
        }, o.throwB)
      };
    },

    // Taunt (T): about a second of showing off. Counter-hittable the whole time.
    taunt: function (o) {
      return {
        taunt: merge({
          name: 'Taunt', label: 'TAUNT', cmd: 'T', level: 'mid', strength: 'light', taunt: true,
          startup: 60, active: 1, recovery: 1,
          anim: [[1, 'idle'], [10, 'taunt'], [52, 'taunt'], [61, 'idle']]
        }, o)
      };
    },

    // Combine move groups into one moves object.
    moves: function () {
      var out = {};
      for (var i = 0; i < arguments.length; i++) Object.assign(out, arguments[i]);
      return out;
    }
  };
})();
