// PEDERSEN — Power — Exponents. The cover fighter. Slow, patient, and
// devastating when he connects: the Exponential Haymaker, the chargeable
// Order of Magnitude, the Power Rule launcher and the Long Division slam.
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [0, 44], lean: 2, fe: [16, 64], fh: [20, 76], be: [2, 62], bh: [12, 72], fk: [12, 22], ff: [20, 0], bk: [-12, 22], bf: [-22, 0] });
  var stand = P('idle', { lean: 0, fe: [8, 56], fh: [10, 46], be: [-4, 56], bh: [-2, 46], fk: [6, 24], ff: [10, 0], bk: [-6, 24], bf: [-10, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    tie: P(stand, { fe: [12, 72], fh: [6, 80], be: [-2, 58], bh: [2, 48] }),     // hand at the knot
    tie2: P(stand, { fe: [12, 70], fh: [8, 76], be: [-2, 58], bh: [2, 48], head: [2, 87] }),
    wave: P(stand, { fe: [16, 78], fh: [22, 94] }),
    calm: P(stand, { head: [5, 85] }),
    sit: [0, 12, -4, 38, -2, 50, 6, 30, 14, 22, -12, 28, -18, 16, 18, 26, 32, 2, 12, 22, 26, 0],
    sit2: [0, 12, -5, 37, -4, 48, 6, 30, 14, 22, -12, 28, -18, 16, 18, 26, 32, 2, 12, 22, 26, 0],
    jab_x: P('jab_x', { lean: 4, fh: [42, 76] }),
    hay_c: P('idle', { lean: -12, fe: [10, 64], fh: [14, 76], be: [-20, 70], bh: [-30, 78], fk: [12, 24], ff: [18, 0] }),
    hay_x: P('hv_x', { lean: 6, be: [34, 72], bh: [54, 74] }),
    om_c: P('idle', { lean: -16, hip: [-4, 42], fe: [8, 64], fh: [12, 76], be: [-22, 60], bh: [-32, 60], fk: [12, 22], ff: [20, 0], bk: [-14, 22], bf: [-24, 0] }),
    om_x: P('hv_x', { lean: 10, all: [4, 0], be: [36, 64], bh: [58, 62] }),
    power_c: P('crouch', { lean: 4, fe: [14, 38], fh: [18, 26] }),
    power_x: P('up_x', { fe: [18, 94], fh: [24, 112], be: [4, 86], bh: [10, 100] }),
    throw_lift: P('throw_lift', { fe: [14, 92], fh: [22, 106], be: [8, 90], bh: [16, 104] }),
    throw_slam: P('throw_slam', { all: [4, -6], lean: 10 })
  };

  poses.taunt = poses['tie'];

  FG.defineFighter({
    id: 'pedersen', order: 0, // the cover fighter: first on character select
    name: 'PEDERSEN', archetype: 'POWER', theme: 'EXPONENTS',
    bio: 'CALM AND FRIENDLY, BUT EVERY HIT IS HEAVY. SLOW, PATIENT, DEVASTATING.',
    signature: ['EXPONENTIAL HAYMAKER', 'ORDER OF MAGNITUDE', 'POWER RULE', 'LONG DIVISION'],
    scale: 1.12, health: 200,
    walkF: 1.5, walkB: 1.3, dashSpeed: 6.4, backdashSpeed: 7.4,
    car: true,            // drives in for his intro; parks in the background
    homeStage: 'campus',  // his stage: outdoor campus with the car parked
    look: {
      skin: 0xe2ad85, eyeColor: 0x7cc4f0,
      hair: { style: 'slick', color: 0x5a3c24 },
      beard: { style: 'short', color: 0x8a7462 },
      mouth: 'smile',
      top: { style: 'dress', color: 0xb01e24, sleeves: 'rolled', collar: 0xc8282e },
      tie: 0x141414, pen: 0x1c2a6a,
      legs: 0x2a2a30, shoes: 0x111111,
      build: { torso: 1.22, limb: 1.12 }
    },
    idleAnim: { breath: 1.5, rate: 0.05 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'POWER JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 11, active: 2, recovery: 14, damage: 10,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 68, h: 14 }, push: 9, juggle: 3,
        cancels: [{ btn: 'p', into: 'jab2', from: 11, to: 23 }],
        anim: [[1, 'idle'], [8, 'jab_c'], [11, 'jab_x'], [14, 'jab_x'], [26, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'SQUARED', cmd: 'P,P', level: 'high', strength: 'medium',
        startup: 12, active: 3, recovery: 19, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { adv: 10 },
        hitbox: { x: 24, w: 28, y: 66, h: 16 }, push: 14, juggle: 3.4, shake: 0.003,
        anim: [[1, 'jab_x'], [7, 'cross_c'], [12, 'cross_x'], [15, 'cross_x'], [33, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'EXPONENT KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 16, active: 3, recovery: 20, damage: 19,
        block: -7, hit: { adv: 5 }, ch: { adv: 10 },
        hitbox: { x: 30, w: 28, y: 38, h: 22 }, push: 18, juggle: 3.6, shake: 0.004,
        anim: [[1, 'idle'], [11, 'fk_c'], [16, 'fk_x'], [19, 'fk_x'], [27, 'fk_c'], [38, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'NEGATIVE EXPONENT', cmd: 'D+K', level: 'low', strength: 'medium', crouching: true, otg: true,
        startup: 18, active: 3, recovery: 22, damage: 13,
        block: -13, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 30, w: 26, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.003,
        anim: [[1, 'crouch'], [12, 'st_c'], [18, 'st_x'], [21, 'st_x'], [32, 'st_c'], [42, 'crouch']]
      },
      sweep: FG.kit.sweep('ZERO POWER SWEEP', { startup: 22, damage: 20, strength: 'heavy', shake: 0.006 }),
      heavy: {
        name: 'Heavy', label: 'BASE HOOK', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 21, active: 4, recovery: 20, damage: 28, wallSplat: true,
        block: 1, hit: { adv: 8 }, ch: { launch: 6.2 },
        hitbox: { x: 26, w: 26, y: 52, h: 20 }, push: 30, juggle: 3.6, carry: 2.2, shake: 0.008,
        step: [12, 21, 1.5],
        anim: [[1, 'idle'], [14, 'hook_c'], [21, 'hook_x'], [25, 'hook_x'], [33, 'hv_r'], [44, 'idle']]
      },
      // Exponential Haymaker: a huge, slow, wall-splatting haymaker.
      fH: {
        name: 'Haymaker', label: 'EXPONENTIAL HAYMAKER', cmd: 'F+H', level: 'mid', strength: 'heavy',
        startup: 26, active: 4, recovery: 22, damage: 36, wallSplat: true, guardDmg: 34,
        block: -6, hit: { knockdown: true }, ch: { launch: 6.6 },
        hitbox: { x: 30, w: 30, y: 58, h: 20 }, push: 34, juggle: 3.6, carry: 2.6, shake: 0.011,
        step: [14, 26, 1.8],
        anim: [[1, 'idle'], [18, 'hay_c'], [26, 'hay_x'], [30, 'hay_x'], [40, 'hv_r'], [52, 'idle']]
      },
      // Order of Magnitude: hold H to charge. Half charge knocks down; full charge breaks the guard.
      bH: {
        name: 'Charge Punch', label: 'ORDER OF MAGNITUDE', cmd: 'B+H (HOLD)', level: 'mid', strength: 'heavy',
        startup: 20, active: 4, recovery: 22, damage: 20, wallSplat: true,
        block: -8, hit: { adv: 4 }, ch: { knockdown: true },
        charge: { at: 12, btn: 'h', mid: 16, max: 40, damage: [1, 1.5, 2.1] },
        hitbox: { x: 30, w: 30, y: 50, h: 20 }, push: 30, juggle: 3.6, carry: 2.4, shake: 0.009,
        step: [13, 20, 2.4],
        anim: [[1, 'idle'], [12, 'om_c'], [20, 'om_x'], [24, 'om_x'], [34, 'hv_r'], [46, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'POWER RULE', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 17, active: 4, recovery: 24, damage: 22,
        block: -17, hit: { launch: 8.2 }, ch: { launch: 8.8 },
        hitbox: { x: 8, w: 28, y: 30, h: 82 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.01,
        step: [10, 17, 1.3],
        cancels: [{ btn: 'up', into: 'jump', from: 19, to: 31, onHit: true }],
        anim: [[1, 'crouch'], [11, 'power_c'], [17, 'power_x'], [21, 'power_x'], [31, 'up_r'], [44, 'idle']]
      }
    },
    FG.kit.air(['EXPONENT DROP', 'POWER KICK', 'TOWER OF POWERS'], { slow: 2, chain: { airP: ['h'], airK: ['h'] } }),
    // Long Division: a slam throw.
    FG.kit.throws('LONG DIVISION', 'SYNTHETIC DIVISION', { throw: { damage: 40, shake: 0.013, recovery: 28 }, throwB: { damage: 38, recovery: 28 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'SQUARED', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 16: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'POWER RULE JUGGLE', difficulty: 'medium', notation: 'D+H, P, P', plan: { 0: 'D+H', 42: 'P', 59: 'P' }, hits: ['launcher', 'jab', 'jab2'] },
      { name: 'TOWER OF POWERS', difficulty: 'hard', notation: 'D+H, UP, AIR K, AIR H, D+K ON THE GROUND',
        plan: { 0: 'D+H', 20: 'UP', 31: 'K', 40: 'H', 94: 'D+K' }, hits: ['launcher', 'airK', 'airH', 'low'] },
      { name: 'EXPONENTIAL GROWTH', difficulty: 'medium', notation: 'AT THE WALL: H, D+H', queue: ['H', 'D+H'], wall: true, hits: ['heavy', 'launcher'] }
    ],

    // The car drives in, he steps out (the scene handles the car), then loosens his tie.
    intro: [[1, 'stand'], [62, 'stand'], [72, 'tie'], [82, 'tie2'], [92, 'tie'], [102, 'calm'], [118, 'idle']],
    victory: [[1, 'stand'], [14, 'tie'], [30, 'tie2'], [44, 'calm'], [70, 'wave'], [90, 'calm'], [110, 'calm']],
    defeat: [[1, 'sit'], [40, 'sit2'], [80, 'sit']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'You can lead a horse to water, but you can\'t make them drink.',
        'Vicky sent you, didn\'t she?',
        'Don\'t make me loosen the tie.',
        'Vicky would\'ve blocked that. Barely.',
        'Don\'t tell Vicky about this.'
      ],
      quips: ['Exponential.', 'That\'s a lot of zeros.', 'Vicky could never.'],
      // His signature line: he says it in his round intro (and it's a victory line).
      introLine: "You can lead a horse to water, but you can't make them drink."
    },
    victoryLines: [
      "That's exponential growth. Of your bruises.",
      'Long division. Short fight.',
      "Raised to a power you weren't ready for.",
      "You can lead a horse to water, but you can't make them drink.",
      'Even Vicky lasted longer than that.'
    ]
  });
})();
