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
    for (var key in def.moves) prepareMove(def, key, def.moves[key]);
    FG.ROSTER.push(def);
    FG.ROSTER.sort(function (a, b) { return a.order - b.order; });
    return def;
  };

  FG.fighterById = function (id) {
    for (var i = 0; i < FG.ROSTER.length; i++) if (FG.ROSTER[i].id === id) return FG.ROSTER[i];
    return null;
  };

  function prepareMove(def, key, m) {
    m.id = key;
    m.total = m.startup + m.active - 1 + m.recovery;
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
    if (m.hitstop == null) m.hitstop = 8;
    if (m.shake == null) m.shake = 0;
  }

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
          hitbox: { x: 24, w: 18, y: 52, h: 16 }, push: 6, juggle: 2.6, carry: 0.4, stall: 2.6, hitstop: 6,
          cancels: cancels('airP', 7 + sl, 18 + sl),
          anim: [[1, 'jump'], [5 + sl, 'air_p'], [11 + sl, 'air_p'], [20 + sl, 'jump']]
        }, o.airP),
        airK: merge({
          name: 'Air Kick', label: names[1], cmd: 'AIR K', level: 'mid', strength: 'medium', air: true,
          startup: 9 + sl, active: 5, recovery: 12, damage: 11 + sl * 2, landLag: 6 + sl,
          stunHit: 18, stunBlock: 12,
          hitbox: { x: 26, w: 20, y: 14, h: 20 }, push: 10, juggle: 3, carry: 0.5, stall: 2.4, hitstop: 8, shake: 0.002,
          cancels: cancels('airK', 9 + sl, 22 + sl),
          anim: [[1, 'jump'], [6 + sl, 'air_k'], [14 + sl, 'air_k'], [25 + sl, 'jump']]
        }, o.airK),
        airH: merge({
          name: 'Air Heavy', label: names[2], cmd: 'AIR H', level: 'mid', strength: 'heavy', air: true, bound: true,
          startup: 12 + sl, active: 4, recovery: 16, damage: 16 + sl * 3, landLag: 10 + sl,
          stunHit: 22, stunBlock: 14,
          hitbox: { x: 16, w: 24, y: 26, h: 26 }, push: 14, juggle: 2, carry: 0.3, stall: 1.5, hitstop: 11, shake: 0.006,
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
          hitbox: { x: 26, w: 22, y: 0, h: 14 }, push: 10, juggle: 2.5, hitstop: 8, shake: 0.002,
          anim: [[1, 'down'], [14, 'wake_low'], [17, 'wake_low'], [27, 'crouch'], [38, 'idle']]
        }, o.wakeLow),
        wakeMid: merge({
          name: 'Wake-up Mid', label: 'SPRING THEOREM', cmd: 'P/H (DOWN)', level: 'mid', strength: 'medium',
          startup: 18, active: 3, recovery: 22, damage: 14, block: -12, hit: { adv: 2 },
          hitbox: { x: 28, w: 22, y: 44, h: 20 }, push: 12, juggle: 3, hitstop: 9, shake: 0.003,
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
        hitbox: { x: 30, w: 24, y: 0, h: 14 }, push: 8, juggle: 2.5, hitstop: 10, shake: 0.004,
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
          push: 0, juggle: 0, hitstop: 0, shake: 0.009, anim: grab
        }, o.throw),
        throwB: merge({
          name: 'Reverse Throw', label: back, cmd: 'B+P+K', level: 'high', strength: 'heavy', throw: true, breakBtn: 'k', reverse: true,
          startup: 12, active: 2, recovery: 26, damage: 34, hitbox: { x: 12, w: 26, y: 40, h: 40 },
          push: 0, juggle: 0, hitstop: 0, shake: 0.009, anim: grab
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
