// MIYASHIRO — Spacing / Footsies — Vectors. Keeps perfect distance: the
// longest poke in the game (Dot Product), a dash punch that closes ground
// (Vector Rush), a spin kick that tracks (Unit Circle), and Calculated:
// whiff a move near him and his next hit does extra damage.
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [-2, 46], lean: 0, fe: [16, 66], fh: [22, 74], be: [2, 64], bh: [10, 72], fk: [12, 24], ff: [20, 0], bk: [-12, 23], bf: [-20, 0] });
  var stand = P('idle', { lean: 0, fe: [6, 56], fh: [8, 46], be: [-2, 56], bh: [0, 46], fk: [4, 24], ff: [8, 0], bk: [-4, 24], bf: [-8, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    sleeve: P(stand, { fe: [8, 66], fh: [-2, 62], be: [-2, 58], bh: [6, 62] }),   // rolling up a sleeve
    sleeve2: P(stand, { be: [8, 66], bh: [-2, 62], fe: [6, 58], fh: [12, 62] }),
    bow: P(stand, { lean: 18 }),
    behind: P(stand, { fe: [-2, 58], fh: [-8, 50], be: [-6, 58], bh: [-10, 50] }), // hands behind his back
    nod: P(stand, { fe: [-2, 58], fh: [-8, 50], be: [-6, 58], bh: [-10, 50], head: [6, 84] }),
    kneel: [0, 26, 6, 50, 10, 60, 14, 40, 18, 28, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 14, 40, 18, 28, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    poke_c: P('fk_c', { lean: -6, fk: [18, 48], ff: [12, 30] }),
    poke_x: P('fk_x', { lean: -16, hip: [4, 48], fk: [30, 50], ff: [60, 52], bk: [-4, 24], bf: [-8, 0] }),
    spin_c: P('idle', { lean: -6, fe: [-6, 72], fh: [-14, 78], be: [12, 70], bh: [20, 76] }),
    spin_x: P('fk_x', { lean: -20, fk: [24, 70], ff: [46, 82] }),
    rush_c: P('dash', { fe: [10, 66], fh: [14, 74] }),
    rush_x: P('dash', { lean: 8, fe: [32, 72], fh: [52, 72] }),
    xprod_c: P('crouch', { lean: 6, fe: [16, 40], fh: [20, 30] }),
    xprod_x: P('up_x', { fe: [22, 88], fh: [30, 104] })
  };

  poses.taunt = poses['nod'];

  FG.defineFighter({
    id: 'miyashiro', order: 6,
    name: 'MIYASHIRO', archetype: 'SPACING', theme: 'VECTORS',
    bio: 'VERY SMART. READS OPPONENTS, KEEPS PERFECT DISTANCE, PUNISHES EVERY MISTAKE.',
    signature: ['VECTOR RUSH', 'DOT PRODUCT', 'UNIT CIRCLE', 'CROSS PRODUCT', 'PROJECTION', 'CALCULATED'],
    scale: 1.02, health: 172,
    walkF: 2.1, walkB: 2.0, dashSpeed: 8.4, backdashSpeed: 9.0,
    dashAttackFrom: 4, // Vector Rush comes out early in a dash
    passive: 'calculated',
    look: {
      skin: 0xd9a87a,
      hair: { style: 'neat', color: 0x111111 },
      mouth: 'calm',
      top: { style: 'button', color: 0x4a78b8, pattern: 'check', patternColor: 0xbcd2f0, sleeves: 'rolled' },
      legs: 0x8c7f68, shoes: 0x3a2a1e,
      build: { torso: 1.06, limb: 1.04 }
    },
    idleAnim: { breath: 0.9, sway: 1.2, rate: 0.06 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'UNIT VECTOR', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 3, recovery: 13, damage: 7,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 30, y: 70, h: 14 }, push: 8, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [14, 'jab_x'], [25, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'SCALAR', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 28, y: 68, h: 14 }, push: 12, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      // Vector Rush: dash, then P. A lunging straight that covers ground.
      dashP: {
        name: 'Dash Punch', label: 'VECTOR RUSH', cmd: 'F,F+P', level: 'mid', strength: 'heavy',
        startup: 12, active: 3, recovery: 18, damage: 16, wallSplat: true,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 26, w: 30, y: 54, h: 20 }, push: 20, juggle: 3.6, carry: 1.6, shake: 0.005,
        step: [1, 12, 3.2],
        anim: [[1, 'rush_c'], [8, 'rush_c'], [12, 'rush_x'], [15, 'rush_x'], [32, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'MAGNITUDE KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 14, active: 3, recovery: 18, damage: 13,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 32, w: 28, y: 40, h: 18 }, push: 16, juggle: 3.8, shake: 0.002,
        anim: [[1, 'idle'], [10, 'fk_c'], [14, 'fk_x'], [17, 'fk_x'], [24, 'fk_c'], [34, 'idle']]
      },
      // Dot Product: the longest poke in the game. Mid, safe at its tip.
      fK: {
        name: 'Long Poke', label: 'DOT PRODUCT', cmd: 'F+K', level: 'mid', strength: 'medium',
        startup: 16, active: 3, recovery: 18, damage: 12,
        block: -6, hit: { adv: 3 }, ch: { adv: 8 },
        hitbox: { x: 40, w: 36, y: 42, h: 18 }, push: 18, juggle: 3.6, shake: 0.002,
        step: [8, 16, 1.4],
        anim: [[1, 'idle'], [10, 'poke_c'], [16, 'poke_x'], [19, 'poke_x'], [27, 'poke_c'], [37, 'idle']]
      },
      // Unit Circle: a spinning high kick that tracks.
      bK: {
        name: 'Spin Kick', label: 'UNIT CIRCLE', cmd: 'B+K', level: 'high', strength: 'heavy', tracks: true,
        startup: 17, active: 4, recovery: 20, damage: 18,
        block: -7, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 30, y: 66, h: 22 }, push: 18, juggle: 3.6, carry: 1.6, shake: 0.006,
        anim: [[1, 'idle'], [8, 'spin_c'], [17, 'spin_x'], [21, 'spin_x'], [30, 'spin_c'], [41, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'COMPONENT LOW', cmd: 'D+K', level: 'low', strength: 'light', crouching: true, otg: true,
        startup: 15, active: 3, recovery: 19, damage: 9,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 30, w: 26, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'lk_c'], [15, 'lk_x'], [18, 'lk_x'], [28, 'lk_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('ORTHOGONAL SWEEP'),
      heavy: {
        name: 'Heavy', label: 'RESULTANT', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 18, active: 3, recovery: 22, damage: 20, wallSplat: true,
        block: -5, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 36, w: 24, y: 52, h: 16 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 1.8],
        anim: [[1, 'idle'], [12, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [29, 'hv_r'], [42, 'idle']]
      },
      fH: {
        name: 'Overhead', label: 'NORMAL VECTOR', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 22 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.2],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'CROSS PRODUCT', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 15, active: 4, recovery: 23, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 28, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'xprod_c'], [15, 'xprod_x'], [19, 'xprod_x'], [28, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['COMPONENT JAB', 'DIRECTION KICK', 'PROJECTION SPIKE']),
    FG.kit.throws('PROJECTION', 'REFLECTION MATRIX', { throw: { damage: 30 }, throwB: { damage: 33 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'CROSS PRODUCT JUGGLE', notation: 'D+H, P, K', plan: { 0: 'D+H', 41: 'P', 62: 'K' }, hits: ['launcher', 'jab', 'mid'] },
      { name: 'PROJECTION SPIKE', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 15: 'UP', 30: 'P', 37: 'K', 46: 'H', 81: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'CALCULATED RUSH', notation: 'THEY WHIFF A JAB, F, F+P (CALCULATED BONUS)',
        dist: 100, oppPlan: { 0: 'P' }, plan: { 18: 'F', 20: 'F', 27: 'P' }, hits: ['dashP'] },
      { name: 'VECTOR SPACE', notation: 'AT THE WALL: H, F+K, D+H', queue: ['H', 'F+K', 'D+H'], wall: true, hits: ['heavy', 'fK', 'launcher'] }
    ],

    intro: [[1, 'stand'], [12, 'sleeve'], [26, 'sleeve'], [34, 'sleeve2'], [48, 'sleeve2'], [58, 'bow'], [70, 'stand'], [86, 'idle']],
    victory: [[1, 'stand'], [16, 'behind'], [46, 'behind'], [56, 'nod'], [64, 'behind'], [100, 'behind']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I ran the numbers. You should forfeit.',
        'Every move you make, I\'ve already graphed.',
        'Your odds are rounding down to zero.'
      ],
      quips: ['As calculated.', 'Within tolerance.', 'Another data point.']
    },
    victoryLines: [
      'I calculated this outcome before the bell rang.',
      'Your vector was correct. Your magnitude, however...',
      'Every mistake was a data point. You gave me plenty.'
    ]
  });
})();
