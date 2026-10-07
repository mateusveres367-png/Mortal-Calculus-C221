// BRINKHUS — Balanced — Limits. Best for new players: honest frame data,
// a natural three-hit string, and an easy launcher route.
(function () {
  var P = FG.pose;

  var stand = P('idle', { lean: -2, fe: [6, 56], fh: [8, 44], be: [-4, 56], bh: [-2, 44], fk: [4, 24], ff: [8, 0], bk: [-4, 24], bf: [-8, 0] });
  var stance = P('idle', { lean: 4, fe: [15, 67], fh: [19, 80], be: [0, 64], bh: [10, 77], fk: [11, 24], ff: [16, 0], bk: [-9, 23], bf: [-16, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    nod: P(stand, { head: [7, 82] }),
    thumb: P(stand, { fe: [14, 70], fh: [16, 86] }),
    wave: P(stand, { fe: [16, 76], fh: [22, 96] }),
    kneel: [0, 26, 6, 50, 10, 60, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 7, 58, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    jab_c: P('jab_c', { lean: 4 }),
    jab_x: P('jab_x', { lean: 6, fh: [44, 79] }),
    cross_x: P('cross_x', { lean: 6 }),
    eps_c: P('idle', { lean: 4, fk: [20, 46], ff: [12, 26], bk: [-6, 24], bf: [-8, 0], fh: [20, 82], bh: [12, 80] }),
    eps_x: P('idle', { lean: 8, hip: [4, 48], fk: [28, 58], ff: [16, 40], bk: [-4, 24], bf: [-6, 0], fe: [16, 70], fh: [22, 82], be: [4, 68], bh: [12, 80] }),
    delta_c: P('sk_c', { lean: -6 }),
    delta_x: P('fk_x', { lean: -14, fk: [26, 58], ff: [50, 64] }),
    hook_c: P('hook_c', { lean: -4 }),
    hook_x: P('hook_x', { lean: 10, fe: [24, 66], fh: [36, 62] }),
    throw_lift: P('throw_lift', { fe: [16, 70], fh: [26, 66], be: [12, 70], bh: [24, 64] }) // bear hug squeeze
  };

  poses.taunt = poses['thumb'];

  FG.defineFighter({
    id: 'brinkhus', order: 1,
    name: 'BRINKHUS', archetype: 'BALANCED', theme: 'LIMITS',
    bio: 'NICE, EASYGOING, A GOOD SPORT. BEST FOR NEW PLAYERS.',
    signature: ['LIMIT JAB', 'EPSILON-DELTA STRING', 'LIMIT BREAK', 'SQUEEZE THEOREM'],
    scale: 1.08, health: 175,
    walkF: 2.0, walkB: 1.6, dashSpeed: 7.5, backdashSpeed: 8.6,
    look: {
      skin: 0xd9a066,
      hair: { style: 'up', color: 0x3a2416 },
      beard: { style: 'full', color: 0x2a1a10 },
      mouth: 'bigsmile',
      top: { style: 'vneck', color: 0x1c1c22, sleeves: 'short' },
      legs: 0x34465e, shoes: 0xe8e8e8,
      build: { torso: 1.05, limb: 1.05 }
    },
    idleAnim: { breath: 1.2, bob: 0.8, rate: 0.09 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'LIMIT JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 70, h: 14 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }, { btn: 'k', into: 'eps', from: 10, to: 22, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'ONE-SIDED LIMIT', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 9, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 26, y: 68, h: 14 }, push: 9, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [12, 'cross_x'], [26, 'idle']]
      },
      eps: {
        name: 'Epsilon', label: 'EPSILON', cmd: 'P,K', level: 'mid', strength: 'medium',
        startup: 11, active: 3, recovery: 18, damage: 11,
        block: -7, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 16, w: 22, y: 44, h: 22 }, push: 8, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'k', into: 'delta', from: 11, to: 24, onContact: true }],
        anim: [[1, 'jab_x'], [7, 'eps_c'], [11, 'eps_x'], [14, 'eps_x'], [31, 'idle']]
      },
      delta: {
        name: 'Delta', label: 'DELTA', cmd: 'P,K,K', level: 'mid', strength: 'heavy',
        startup: 13, active: 3, recovery: 22, damage: 16, wallSplat: true,
        block: -13, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 30, w: 26, y: 52, h: 20 }, push: 18, juggle: 3.6, carry: 1.6, shake: 0.006,
        anim: [[1, 'eps_x'], [8, 'delta_c'], [13, 'delta_x'], [16, 'delta_x'], [26, 'delta_c'], [37, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'CONVERGENT KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 14, active: 3, recovery: 18, damage: 14,
        block: -6, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 26, y: 40, h: 18 }, push: 14, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'fk_c'], [14, 'fk_x'], [17, 'fk_x'], [24, 'fk_c'], [34, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'LOWER BOUND', cmd: 'D+K', level: 'low', strength: 'medium',
        startup: 16, active: 3, recovery: 21, damage: 10, crouching: true, tracks: true, otg: true,
        block: -12, hit: { adv: -1 }, ch: { adv: 5 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'lk_c'], [16, 'lk_x'], [19, 'lk_x'], [30, 'lk_c'], [39, 'crouch']]
      },
      sweep: FG.kit.sweep('ZERO SWEEP'),
      heavy: {
        name: 'Heavy', label: "L'HOPITAL HOOK", cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 19, active: 3, recovery: 22, damage: 22, wallSplat: true,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 22, w: 24, y: 52, h: 18 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [11, 20, 1.8],
        anim: [[1, 'idle'], [13, 'hook_c'], [19, 'hook_x'], [22, 'hook_x'], [30, 'hv_r'], [43, 'idle']]
      },
      fH: {
        name: 'Overhead', label: 'INFINITE LIMIT', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 22 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.2],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'LIMIT BREAK', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 15, active: 4, recovery: 22, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [40, 'idle']]
      }
    },
    FG.kit.air(['LEFT LIMIT', 'RIGHT LIMIT', 'LIMIT AT INFINITY']),
    FG.kit.throws('SQUEEZE THEOREM', 'DIRECT SUBSTITUTION'),
    FG.kit.wake(),
    FG.kit.taunt()),

    // Combo routes: inputs on sim frames counted from the first press (tested in tests/sim.test.js).
    combos: [
      { name: 'EPSILON-DELTA', difficulty: 'easy', notation: 'P, K, K', plan: { 0: 'P', 12: 'K', 24: 'K' }, hits: ['jab', 'eps', 'delta'] },
      { name: 'LIMIT BREAK JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, D+K ON THE GROUND',
        plan: { 0: 'D+H', 38: 'P', 55: 'P', 95: 'D+K' }, hits: ['launcher', 'jab', 'jab2', 'low'] },
      { name: 'LIMIT AT INFINITY', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 32: 'P', 41: 'K', 51: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'HARD LIMIT', difficulty: 'medium', notation: 'AT THE WALL: H, P, P, D+H', queue: ['H', 'P', 'P', 'D+H'], wall: true, hits: ['heavy', 'jab', 'jab', 'launcher'] }
    ],


    intro: [[1, 'idle'], [16, 'stand'], [30, 'nod'], [40, 'stand'], [52, 'nod'], [60, 'stand'], [84, 'idle']],
    victory: [[1, 'stand'], [14, 'thumb'], [50, 'thumb'], [62, 'wave'], [74, 'thumb'], [100, 'thumb']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I\'ll go easy. Like, homework-pass easy.',
        'Stretch first. I\'m not carrying you to the nurse.',
        'Let\'s keep it clean. Mostly.'
      ],
      quips: ['Good rep!', 'Nice try, though.', 'Keep that guard up.']
    },
    victoryLines: [
      'As you approach me, your chances approach zero.',
      'Good hustle. Tryouts are next week.',
      "That's what we call a hard limit."
    ]
  });
})();
