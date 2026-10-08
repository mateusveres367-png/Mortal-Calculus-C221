// BRINKHUS — Balanced — Algebra 1. An athletic kickboxer: an upright, bouncy
// stance, long straight punches and clean kicks in straight lines, and a fast
// dash. Best for new players.
//
// Signature: LONG ARMS. His straights (Slope Jab, Rise Over Run, Linear Rush and
// the F+P Long Arms poke) outrange everyone's, and landing one with the very tip
// (`tip`: at least that far away) hits harder.
(function () {
  // Tall, with long arms: his rig has longer limbs than anyone else's.
  var R = FG.rigger({ torso: 29, neck: 12, upper: 17, fore: 15.5, thigh: 25, shin: 25.5 });
  var GUARD_F = { hand: [17, 86] }, GUARD_B = { hand: [9, 84] };

  var stance = R({ hip: [0, 48], lean: 2, fa: GUARD_F, ba: GUARD_B, fl: { foot: [13, 0] }, bl: { foot: [-15, 0] } });
  var stand = R({ hip: [0, 50], lean: 0, fa: [-82, -88], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    nod: R({ hip: [0, 50], lean: 4, neck: 16, fa: [-82, -88], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    thumb: R({ hip: [0, 50], lean: 0, fa: [-40, 70], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    wave: R({ hip: [0, 50], lean: -2, fa: [55, 95], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    kneel: [0, 26, 6, 50, 10, 60, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 7, 58, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],

    // Movement and defence: upright and springy.
    crouch: R({ hip: [-1, 32], lean: 14, fa: { hand: [18, 64] }, ba: { hand: [10, 62] }, fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } }),
    squat: R({ hip: [0, 38], lean: 10, fa: { hand: [18, 70] }, ba: { hand: [10, 68] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    jump: R({ hip: [0, 48], lean: 6, fa: { hand: [18, 88] }, ba: { hand: [10, 86] }, fl: [-20, -95], bl: [-115, -75] }),
    dash: R({ hip: [4, 46], lean: 14, fa: { hand: [22, 82] }, ba: { hand: [13, 80] }, fl: { foot: [22, 0] }, bl: { foot: [-22, 6] } }),
    backdash: R({ hip: [-4, 48], lean: -8, fa: { hand: [15, 86] }, ba: { hand: [7, 84] }, fl: { foot: [16, 3] }, bl: { foot: [-20, 0] } }),
    sidestep: R({ hip: [0, 46], lean: 4, fa: GUARD_F, ba: GUARD_B, fl: { foot: [6, 2] }, bl: { foot: [-8, 0] } }),
    block: R({ hip: [-2, 47], lean: -3, fa: { hand: [13, 90] }, ba: { hand: [8, 88] }, fl: { foot: [12, 0] }, bl: { foot: [-17, 0] } }),
    cblock: R({ hip: [-2, 30], lean: 12, fa: { hand: [15, 66] }, ba: { hand: [9, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } }),
    hit_high: R({ hip: [-3, 48], lean: -16, neck: -14, fa: [-130, -100], ba: [-140, -115], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    hit_mid: R({ hip: [-4, 44], lean: 24, neck: 10, fa: [-70, -20], ba: [-80, -10], fl: { foot: [12, 0] }, bl: { foot: [-18, 0] } }),
    hit_low: R({ hip: [-2, 40], lean: 12, neck: 6, fa: [-40, 20], ba: [-60, 10], fl: { foot: [10, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -70, neck: -10, fa: [100, 140], ba: [80, 120], fl: [20, -20], bl: [10, -40] }),
    down: R({ hip: [0, 6], lean: -88, fa: [175, 180], ba: [-160, -170], fl: [5, 0], bl: [-5, 5] }),
    gbreak: R({ hip: [-4, 46], lean: -14, fa: [60, 120], ba: [40, 100], fl: { foot: [16, 0] }, bl: { foot: [-18, 0] } }),

    // Slope Jab: a long, straight lead jab.
    jab_c: R({ hip: [1, 47], lean: 4, fa: { hand: [20, 84] }, ba: GUARD_B, fl: { foot: [14, 0] }, bl: { foot: [-15, 0] } }),
    jab_x: R({ hip: [8, 46], lean: 12, fa: [3, 1], ba: { hand: [14, 84] }, fl: { foot: [24, 0] }, bl: { foot: [-14, 0] } }),
    // Rise Over Run: the long straight right behind it.
    cross_c: R({ hip: [2, 47], lean: 6, fa: { hand: [24, 84] }, ba: { hand: [6, 82] }, fl: { foot: [20, 0] }, bl: { foot: [-14, 0] } }),
    cross_x: R({ hip: [10, 45], lean: 16, fa: { hand: [22, 80] }, ba: [2, 0], fl: { foot: [26, 0] }, bl: { foot: [-10, 1] } }),
    // Long Arms: a lunging poke at full stretch.
    long_c: R({ hip: [-2, 46], lean: -2, fa: { hand: [16, 82] }, ba: GUARD_B, fl: { foot: [12, 2] }, bl: { foot: [-17, 0] } }),
    long_x: R({ hip: [16, 42], lean: 20, fa: [0, -2], ba: { hand: [22, 74] }, fl: { foot: [34, 0] }, bl: { foot: [-10, 0] } }),
    // Distribute: a switch kick to the body, leg level.
    eps_c: R({ hip: [-2, 48], lean: -6, fa: { hand: [16, 88] }, ba: { hand: [8, 86] }, fl: [40, -60], bl: { foot: [-12, 0] } }),
    eps_x: R({ hip: [-2, 48], lean: -20, fa: { hand: [12, 88] }, ba: [-150, -110], fl: [10, 6], bl: { foot: [-12, 0] } }),
    // Distributive Property: a spinning back kick, heel driven straight through.
    delta_c: R({ hip: [-4, 48], lean: -8, neck: -6, fa: { hand: [2, 82] }, ba: { hand: [-6, 80] }, fl: { foot: [-4, 0] }, bl: [40, -70] }),
    delta_x: R({ hip: [-6, 48], lean: -38, fa: { hand: [-2, 80] }, ba: [-150, -120], fl: { foot: [-12, 0] }, bl: [4, 2] }),
    // Variable Kick: a long teep (push kick), straight from the hip.
    mid_c: R({ hip: [-2, 48], lean: -6, fa: GUARD_F, ba: GUARD_B, fl: [55, -70], bl: { foot: [-14, 0] } }),
    mid_x: R({ hip: [-2, 49], lean: -14, fa: { hand: [12, 88] }, ba: [-130, -100], fl: [8, 2], bl: { foot: [-14, 0] } }),
    // Inequality: a chopping calf kick.
    low_c: R({ hip: [0, 42], lean: 8, fa: GUARD_F, ba: GUARD_B, fl: [-10, -110], bl: { foot: [-15, 0] } }),
    low_x: R({ hip: [2, 38], lean: 12, fa: { hand: [18, 76] }, ba: { hand: [10, 74] }, fl: { foot: [46, 8] }, bl: { foot: [-15, 0] } }),
    // Zero Product Sweep: a straight-legged low sweep.
    sweep_c: R({ hip: [-2, 26], lean: 26, fa: { hand: [16, 56] }, ba: { hand: [8, 54] }, fl: { foot: [12, 0] }, bl: { foot: [-18, 0] } }),
    sweep_x: R({ hip: [-6, 20], lean: 30, fa: { hand: [10, 4] }, ba: { hand: [14, 50] }, fl: { foot: [50, 3] }, bl: { foot: [-14, 0] } }),
    // Linear Rush: a stepping straight right.
    hv_c: R({ hip: [-3, 47], lean: -8, fa: { hand: [18, 84] }, ba: { hand: [-4, 82] }, fl: { foot: [12, 0] }, bl: { foot: [-17, 0] } }),
    hv_x: R({ hip: [14, 44], lean: 18, fa: { hand: [24, 76] }, ba: [-4, -8], fl: { foot: [32, 0] }, bl: { foot: [-8, 2] } }),
    hv_r: R({ hip: [8, 45], lean: 10, fa: { hand: [22, 80] }, ba: { hand: [24, 76] }, fl: { foot: [24, 0] }, bl: { foot: [-12, 0] } }),
    // Order of Operations: a leaping superman punch, over the top.
    ham_c: R({ hip: [-2, 50], lean: -10, fa: { hand: [14, 84] }, ba: [-160, -120], fl: { foot: [12, 0] }, bl: [-60, -150] }),
    ham_x: R({ hip: [16, 50], lean: 30, fa: { hand: [18, 66] }, ba: [0, -40], fl: { foot: [30, 0] }, bl: [-150, -110] }),
    // Solve for X: a vertical front kick that splits straight up under the chin.
    up_c: R({ hip: [0, 40], lean: 10, fa: GUARD_F, ba: GUARD_B, fl: [60, -80], bl: { foot: [-14, 0] } }),
    up_x: R({ hip: [-2, 50], lean: -22, fa: [-30, -70], ba: [-160, -150], fl: [72, 84], bl: { foot: [-12, 0] } }),
    up_r: R({ hip: [0, 48], lean: -8, fa: GUARD_F, ba: GUARD_B, fl: [30, -50], bl: { foot: [-12, 0] } }),

    // Air: X-Intercept (straight), Y-Intercept (flying knee), Point-Slope Spike (heel drop).
    air_p: R({ hip: [0, 48], lean: 10, fa: [2, 0], ba: GUARD_B, fl: [-20, -95], bl: [-115, -75] }),
    air_k: R({ hip: [0, 48], lean: -10, fa: GUARD_F, ba: [-150, -110], fl: [20, -100], bl: [-100, -60] }),
    air_hc: R({ hip: [0, 48], lean: -16, fa: [-20, -60], ba: [-160, -140], fl: [70, 95], bl: [-110, -80] }),
    air_hx: R({ hip: [0, 48], lean: 14, fa: [-20, -60], ba: [-150, -110], fl: [-20, -60], bl: [-120, -80] }),

    // FOIL: clinch, knee, push away. Substitution: swap places and shove.
    grab_c: R({ hip: [2, 47], lean: 8, fa: { hand: [26, 84] }, ba: { hand: [22, 82] }, fl: { foot: [16, 0] }, bl: { foot: [-14, 0] } }),
    grab_x: R({ hip: [4, 47], lean: 12, fa: { hand: [30, 82] }, ba: { hand: [28, 80] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [2, 48], lean: 8, fa: { hand: [28, 80] }, ba: { hand: [26, 78] }, fl: [50, -60], bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [8, 46], lean: 16, fa: [0, 10], ba: [5, 15], fl: { foot: [26, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-4, 47], lean: -12, fa: [150, 170], ba: [160, 180], fl: { foot: [10, 0] }, bl: { foot: [-20, 0] } }),
    // Wake-ups: a low heel from the floor, and a spring-up front kick.
    wake_low: R({ hip: [-4, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-22, 2] }, fl: { foot: [44, 4] }, bl: { foot: [6, 0] } }),
    wake_mid: R({ hip: [0, 48], lean: -16, fa: GUARD_F, ba: [-150, -110], fl: [20, 12], bl: { foot: [-12, 0] } })
  };

  poses.taunt = poses.thumb;

  FG.defineFighter({
    id: 'brinkhus', order: 1,
    homeStage: 'classroom',
    glyphs: ['Y=MX+B', 'X=?', '2X+3=7', 'RISE/RUN'], // math that flies off their big hits
    stringH: 'COMBINE LIKE TERMS', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x15151a, b: 0xd4a933 }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'SOLVE FOR X', input: 'F, F, H' },
    name: 'BRINKHUS', archetype: 'BALANCED', theme: 'ALGEBRA 1',
    style: 'KICKBOXER', signatureMechanic: 'LONG ARMS',
    signatureText: 'his straights outrange everyone\'s, and landing one with the very tip hits 25% harder',
    bio: 'NICE, EASYGOING, A GOOD SPORT. BEST FOR NEW PLAYERS.',
    signature: ['SLOPE JAB', 'DISTRIBUTIVE PROPERTY', 'LINEAR RUSH', 'SOLVE FOR X', 'FOIL'],
    scale: 1.08, health: 175,
    // Movement: a quick, springy walk and the fastest dash of the straight-line fighters.
    walkF: 2.2, walkB: 1.9, dashSpeed: 9.8, dashFrames: 14, backdashSpeed: 8.4,
    jumpVy: 9.9, weight: 1.0, react: 1.0,
    walk: { lean: 1, bob: 2.5, rate: 0.26 },
    look: {
      skin: 0xd9a066,
      hair: { style: 'up', color: 0x3a2416 },
      beard: { style: 'full', color: 0x2a1a10 },
      mouth: 'bigsmile',
      top: { style: 'vneck', color: 0x1c1c22, sleeves: 'short' },
      legs: 0x34465e, shoes: 0xe8e8e8,
      build: { torso: 1.05, limb: 1.05 }
    },
    idleAnim: { breath: 0.6, bob: 2.6, rate: 0.2 }, // bouncing on his toes
    poses: poses,
    // How the CPU plays him: solid fundamentals, poking with Long Arms from range.
    ai: { spacing: 64, pokes: ['F+P', 'P', 'K'], close: ['P', 'D+K', 'P+K'], aggro: 1.0 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'SLOPE JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab', tip: 52,
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 34, y: 68, h: 16 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }, { btn: 'k', into: 'eps', from: 10, to: 22, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'RISE OVER RUN', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross', tip: 54,
        startup: 9, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 24, w: 34, y: 66, h: 16 }, push: 9, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [12, 'cross_x'], [26, 'idle']]
      },
      // Long Arms: the longest poke in the game. P continues into Rise Over Run.
      fP: {
        name: 'Long Poke', label: 'LONG ARMS', cmd: 'F+P', level: 'high', strength: 'medium', motion: 'jab', tip: 60,
        startup: 13, active: 3, recovery: 18, damage: 11,
        block: -4, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 30, w: 38, y: 68, h: 14 }, push: 10, juggle: 3.4, shake: 0.002,
        step: [5, 12, 1.4],
        cancels: [{ btn: 'p', into: 'jab2', from: 13, to: 26, onContact: true }],
        anim: [[1, 'idle'], [8, 'long_c'], [13, 'long_x'], [16, 'long_x'], [31, 'idle']]
      },
      eps: {
        name: 'Switch Kick', label: 'DISTRIBUTE', cmd: 'P,K', level: 'mid', strength: 'medium', motion: 'roundhouse',
        startup: 11, active: 3, recovery: 18, damage: 11,
        block: -7, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 20, w: 30, y: 44, h: 20 }, push: 8, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'k', into: 'delta', from: 11, to: 24, onContact: true }],
        anim: [[1, 'jab_x'], [7, 'eps_c'], [11, 'eps_x'], [14, 'eps_x'], [31, 'idle']]
      },
      delta: {
        name: 'Spinning Back Kick', label: 'DISTRIBUTIVE PROPERTY', cmd: 'P,K,K', level: 'mid', strength: 'heavy', motion: 'kick', wallSplat: true,
        startup: 13, active: 3, recovery: 22, damage: 16,
        block: -13, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 28, w: 28, y: 40, h: 24 }, push: 18, juggle: 3.6, carry: 1.6, shake: 0.006,
        anim: [[1, 'eps_x'], [8, 'delta_c'], [13, 'delta_x'], [16, 'delta_x'], [26, 'delta_c'], [37, 'idle']]
      },
      mid: {
        name: 'Teep', label: 'VARIABLE KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 14, active: 3, recovery: 18, damage: 14,
        block: -6, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 28, y: 40, h: 20 }, push: 14, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'mid_c'], [14, 'mid_x'], [17, 'mid_x'], [24, 'mid_c'], [34, 'idle']]
      },
      low: {
        name: 'Calf Kick', label: 'INEQUALITY', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low',
        startup: 16, active: 3, recovery: 21, damage: 10, crouching: true, tracks: true, otg: true,
        block: -12, hit: { adv: -1 }, ch: { adv: 5 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'low_c'], [16, 'low_x'], [19, 'low_x'], [30, 'low_c'], [39, 'crouch']]
      },
      sweep: FG.kit.sweep('ZERO PRODUCT SWEEP', { motion: 'sweep' }),
      heavy: {
        name: 'Stepping Straight', label: 'LINEAR RUSH', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight', tip: 50, wallSplat: true,
        startup: 19, active: 3, recovery: 22, damage: 22,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 22, w: 28, y: 56, h: 18 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [11, 20, 1.8],
        anim: [[1, 'idle'], [13, 'hv_c'], [19, 'hv_x'], [22, 'hv_x'], [30, 'hv_r'], [43, 'idle']]
      },
      fH: {
        name: 'Superman Punch', label: 'ORDER OF OPERATIONS', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 24 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.4],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Vertical Kick', label: 'SOLVE FOR X', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [40, 'idle']]
      }
    },
    FG.kit.air(['X-INTERCEPT', 'Y-INTERCEPT', 'POINT-SLOPE SPIKE']),
    FG.kit.throws('FOIL', 'SUBSTITUTION'),
    FG.kit.wake(),
    FG.kit.taunt()),

    // Combo routes: inputs on sim frames counted from the first press (tested in tests/sim.test.js).
    combos: [
      { name: 'DISTRIBUTIVE PROPERTY', difficulty: 'easy', notation: 'P, K, K', plan: { 0: 'P', 12: 'K', 24: 'K' }, hits: ['jab', 'eps', 'delta'] },
      { name: 'LONG ARMS', difficulty: 'easy', notation: 'F+P, P, H', plan: { 0: 'F+P', 15: 'P', 27: 'H' }, hits: ['fP', 'jab2', 'jabH'] },
      { name: 'SOLVE FOR X JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 38: 'P', 56: 'P', 67: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'POINT-SLOPE SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 32: 'P', 41: 'K', 51: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'ISOLATE THE VARIABLE', difficulty: 'medium', notation: 'AT THE WALL: H, P, P, D+H', queue: ['H', 'P', 'P', 'D+H'], wall: true, hits: ['heavy', 'jab', 'jab', 'launcher'] }
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
      'Solve for X. X equals you lose.',
      'Good hustle. Tryouts are next week.',
      'Slope of your comeback: zero.'
    ]
  });
})();
