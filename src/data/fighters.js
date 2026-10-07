// Placeholder fighters and their move lists.
//
// Frame data follows the usual convention: a move with startup 10 hits on the
// 10th frame after the button press (the press frame is frame 1).
// block / hit.adv / ch.adv are frame advantage for the attacker once both
// fighters can act again. A result with `launch` sends the opponent airborne
// (the number is the launch velocity) instead of putting them in hitstun.
//
// hitbox: { x, w, y, h } relative to the fighter's feet, x forward, y up.
// anim:   [[moveFrame, poseName], ...] keyframes, eased between.
// step:   [fromFrame, toFrame, speed] forward movement during the move.
// cancels: follow-ups that can interrupt this move (strings).
(function () {
  var SIGMA = {
    id: 'sigma',
    name: 'SIGMA',
    archetype: 'BALANCED',
    scale: 1.0,
    health: 170,
    walkF: 2.0, walkB: 1.6,
    dashSpeed: 7.5, backdashSpeed: 8.6,
    colors: { skin: 0xd9a066, hair: 0x2b1d14, top: 0x3c6fb0, topDark: 0x24477a, legs: 0x2a2d3a, legsDark: 0x1a1c26, shoes: 0xe8e8e8, accent: 0xf2c94c },
    moves: {
      jab: {
        name: 'Jab', label: 'PRIME JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 70, h: 14 }, push: 6, juggle: 3.2,
        hitstop: 6, shake: 0,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'STRAIGHT', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 9, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 26, y: 68, h: 14 }, push: 9, juggle: 3.4,
        hitstop: 7, shake: 0,
        cancels: [{ btn: 'k', into: 'mid', from: 9, to: 24, onContact: true }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [12, 'cross_x'], [26, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'VECTOR KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 14, active: 3, recovery: 18, damage: 14,
        block: -6, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 26, y: 40, h: 18 }, push: 14, juggle: 3.8,
        hitstop: 9, shake: 0.003,
        anim: [[1, 'idle'], [10, 'fk_c'], [14, 'fk_x'], [17, 'fk_x'], [24, 'fk_c'], [34, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'FLOOR FUNCTION', cmd: 'D+K', level: 'low', strength: 'medium',
        startup: 16, active: 3, recovery: 21, damage: 10, crouching: true, tracks: true,
        block: -12, hit: { adv: -1 }, ch: { adv: 5 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5,
        hitstop: 8, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'lk_c'], [16, 'lk_x'], [19, 'lk_x'], [30, 'lk_c'], [39, 'crouch']]
      },
      heavy: {
        name: 'Heavy', label: 'PRIME IMPACT', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 19, active: 3, recovery: 22, damage: 22,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 34, w: 24, y: 52, h: 16 }, push: 26, juggle: 3.6, carry: 2,
        hitstop: 12, shake: 0.006,
        step: [11, 20, 1.8],
        anim: [[1, 'idle'], [13, 'hv_c'], [19, 'hv_x'], [22, 'hv_x'], [30, 'hv_r'], [43, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'PARABOLA LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 15, active: 4, recovery: 22, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.5, carry: 0.6,
        hitstop: 13, shake: 0.008,
        step: [9, 15, 1.2],
        anim: [[1, 'crouch'], [10, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [40, 'idle']]
      }
    }
  };

  var DELTA = {
    id: 'delta',
    name: 'DELTA',
    archetype: 'POWER',
    scale: 1.1,
    health: 190,
    walkF: 1.6, walkB: 1.3,
    dashSpeed: 6.6, backdashSpeed: 7.6,
    colors: { skin: 0xa8714a, hair: 0x111111, top: 0x9e2b25, topDark: 0x641a16, legs: 0x3b3328, legsDark: 0x26201a, shoes: 0x1c1c1c, accent: 0xe0e0e0 },
    moves: {
      jab: {
        name: 'Jab', label: 'DELTA JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 11, active: 2, recovery: 14, damage: 9,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 70, h: 14 }, push: 7, juggle: 3.2,
        hitstop: 7, shake: 0,
        cancels: [{ btn: 'p', into: 'jab2', from: 11, to: 24 }],
        anim: [[1, 'idle'], [8, 'jab_c'], [11, 'jab_x'], [14, 'jab_x'], [26, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'DERIVATIVE HOOK', cmd: 'P,P', level: 'high', strength: 'medium', tracks: true,
        startup: 12, active: 3, recovery: 20, damage: 14,
        block: -5, hit: { adv: 4 }, ch: { adv: 12 },
        hitbox: { x: 18, w: 26, y: 70, h: 18 }, push: 14, juggle: 3.6,
        hitstop: 10, shake: 0.004,
        anim: [[1, 'jab_x'], [8, 'hook_c'], [12, 'hook_x'], [15, 'hook_x'], [34, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'NORMAL FORCE', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 16, active: 3, recovery: 20, damage: 18,
        block: -8, hit: { adv: 5 }, ch: { adv: 10 },
        hitbox: { x: 34, w: 28, y: 34, h: 22 }, push: 18, juggle: 3.8,
        hitstop: 10, shake: 0.004,
        anim: [[1, 'idle'], [11, 'sk_c'], [16, 'sk_x'], [19, 'sk_x'], [27, 'sk_c'], [38, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'FLOOR STOMP', cmd: 'D+K', level: 'low', strength: 'medium', crouching: true,
        startup: 18, active: 3, recovery: 22, damage: 12,
        block: -13, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 32, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5,
        hitstop: 9, shake: 0.003,
        anim: [[1, 'crouch'], [12, 'st_c'], [18, 'st_x'], [21, 'st_x'], [32, 'st_c'], [42, 'crouch']]
      },
      heavy: {
        name: 'Heavy', label: 'QUADRATIC HAMMER', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 22, active: 4, recovery: 20, damage: 30,
        block: 2, hit: { adv: 8 }, ch: { launch: 6.2 },
        hitbox: { x: 30, w: 24, y: 50, h: 20 }, push: 30, juggle: 3.6, carry: 2.2,
        hitstop: 14, shake: 0.008,
        step: [12, 22, 1.5],
        anim: [[1, 'idle'], [15, 'ham_c'], [22, 'ham_x'], [26, 'ham_x'], [34, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'LIMIT BREAK', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 16, active: 4, recovery: 24, damage: 20,
        block: -17, hit: { launch: 7.3 }, ch: { launch: 8 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.2, carry: 0.6,
        hitstop: 14, shake: 0.009,
        step: [10, 16, 1.2],
        anim: [[1, 'crouch'], [11, 'up_c'], [16, 'up_x'], [20, 'up_x'], [30, 'up_r'], [43, 'idle']]
      }
    }
  };

  // Fill in derived values: total length, and hitboxes scaled to the fighter's size.
  function prepare(def) {
    for (var key in def.moves) {
      var m = def.moves[key];
      m.id = key;
      m.total = m.startup + m.active - 1 + m.recovery;
      var hb = m.hitbox;
      m.box = { x: hb.x * def.scale, w: hb.w * def.scale, y: hb.y * def.scale, h: hb.h * def.scale };
      if (!m.ch) m.ch = m.hit.launch ? { launch: m.hit.launch } : { adv: m.hit.adv + 3 };
      if (m.carry == null) m.carry = 0.5;
    }
    return def;
  }

  FG.FIGHTERS = [prepare(SIGMA), prepare(DELTA)];
})();
