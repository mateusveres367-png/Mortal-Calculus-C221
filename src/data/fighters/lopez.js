// LOPEZ — Defensive — Statistics. Waits for you to commit, then punishes:
// a long, low-proof backdash (Standard Deviation), a fast punisher right
// after blocking (Confidence Interval), and a parry for mids and lows
// (Null Hypothesis).
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [-2, 46], lean: -4, fe: [12, 70], fh: [14, 84], be: [4, 68], bh: [8, 82], fk: [8, 24], ff: [13, 0], bk: [-10, 23], bf: [-17, 0] });
  var stand = P('idle', { lean: 0, fe: [6, 56], fh: [8, 46], be: [-2, 56], bh: [0, 46], fk: [4, 24], ff: [8, 0], bk: [-4, 24], bf: [-8, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    // Taking off the blazer: arms back and out of the sleeves, then a toss.
    shrugoff: P(stand, { fe: [-4, 66], fh: [-12, 56], be: [-10, 66], bh: [-18, 56], lean: 4 }),
    toss: P(stand, { fe: [-8, 76], fh: [-20, 88], be: [2, 58], bh: [4, 48] }),
    crossed: P(stand, { fe: [10, 66], fh: [-2, 68], be: [4, 66], bh: [12, 68] }),
    nod: P(stand, { fe: [10, 66], fh: [-2, 68], be: [4, 66], bh: [12, 68], head: [6, 83] }),
    point: P(stand, { fe: [10, 72], fh: [10, 86] }), // taps his temple
    kneel: [0, 26, 6, 50, 10, 60, 14, 50, 12, 62, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 14, 50, 12, 62, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    jab_x: P('jab_x', { lean: 0, fh: [42, 80] }),
    parry: P('cblock', { lean: 6, fe: [16, 44], fh: [26, 40], be: [10, 46], bh: [20, 42] }),
    counter_x: P('hv_x', { all: [0, -4] }),
    conf_c: P('jab_c', { lean: 8 }),
    conf_x: P('cross_x', { lean: 14, bh: [50, 72] }),
    outlier_c: P('crouch', { lean: 4 }),
    outlier_x: P('up_x', { fe: [16, 94], fh: [20, 112], lean: -4 }),
    reg_c: P('sk_c', { lean: -4 }),
    reg_x: P('sk_x', { lean: -10, fk: [24, 50], ff: [52, 52] })
  };

  poses.taunt = poses['point'];

  FG.defineFighter({
    id: 'lopez', order: 5,
    name: 'LOPEZ', archetype: 'DEFENSIVE', theme: 'STATISTICS',
    bio: 'VERY SUSPICIOUS. ALWAYS WATCHING. WAITS FOR YOU TO COMMIT, THEN PUNISHES.',
    signature: ['STANDARD DEVIATION', 'CONFIDENCE INTERVAL', 'NULL HYPOTHESIS', 'OUTLIER', 'REGRESSION'],
    scale: 1.03, health: 180,
    walkF: 1.7, walkB: 1.9, dashSpeed: 7.0,
    // Standard Deviation: a long backdash that recovers early and that lows can't touch at first.
    backdashSpeed: 12.5, backdashDecay: 0.86, backdashFrames: 22, backdashActFrom: 13, backdashLowInvuln: 10,
    postBlockWindow: 10, // Confidence Interval: P within 10 frames of leaving blockstun
    parryFace: 'squint',
    look: {
      skin: 0xc98e62, eyesNarrow: true,
      hair: { style: 'swept', color: 0x4a4440, gray: 0xc8c8c8 },
      mouth: 'half',
      top: { style: 'button', color: 0xf2f2ee, pattern: 'windowpane', patternColor: 0x9aa4b8, sleeves: 'long', collar: 0xffffff },
      blazer: 0x1c2a4a,
      legs: 0x2e3038, shoes: 0x1c1410,
      build: { torso: 1.1, limb: 1.04 }
    },
    idleAnim: { breath: 0.6, rate: 0.05 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'SAMPLE JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 14, damage: 8,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 28, y: 70, h: 14 }, push: 8, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [25, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'MEAN STRAIGHT', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 16, damage: 10,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 28, y: 68, h: 14 }, push: 10, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      // Confidence Interval: P right after blocking becomes this fast, heavy punisher.
      postBlockP: {
        name: 'Punisher', label: 'CONFIDENCE INTERVAL', cmd: 'P AFTER BLOCK', level: 'mid', strength: 'heavy',
        startup: 8, active: 2, recovery: 20, damage: 18, wallSplat: true,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 30, y: 56, h: 22 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'idle'], [5, 'conf_c'], [8, 'conf_x'], [10, 'conf_x'], [29, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'REGRESSION KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 15, active: 3, recovery: 18, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 36, w: 28, y: 40, h: 20 }, push: 16, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'reg_c'], [15, 'reg_x'], [18, 'reg_x'], [26, 'reg_c'], [35, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'LOWER QUARTILE', cmd: 'D+K', level: 'low', strength: 'medium', crouching: true, otg: true,
        startup: 16, active: 3, recovery: 20, damage: 11,
        block: -12, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 26, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'lk_c'], [16, 'lk_x'], [19, 'lk_x'], [29, 'lk_c'], [38, 'crouch']]
      },
      sweep: FG.kit.sweep('BELL CURVE SWEEP', { startup: 21 }),
      heavy: {
        name: 'Heavy', label: 'SIGNIFICANT FIGURE', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 19, active: 3, recovery: 21, damage: 22, wallSplat: true,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 34, w: 24, y: 52, h: 16 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [11, 19, 1.6],
        anim: [[1, 'idle'], [13, 'hv_c'], [19, 'hv_x'], [22, 'hv_x'], [30, 'hv_r'], [42, 'idle']]
      },
      fH: {
        name: 'Overhead', label: 'MEDIAN DROP', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 22, active: 3, recovery: 21, damage: 19, guardDmg: 24,
        block: -7, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 22 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 22, 1.2],
        anim: [[1, 'idle'], [14, 'ham_c'], [22, 'ham_x'], [25, 'ham_x'], [34, 'hv_r'], [46, 'idle']]
      },
      // Null Hypothesis: parries mids and lows (frames 3-12), squints, then counters.
      bH: {
        name: 'Parry', label: 'NULL HYPOTHESIS', cmd: 'B+H', level: 'mid', strength: 'light',
        startup: 32, active: 1, recovery: 1, parry: { from: 3, to: 12, levels: ['mid', 'low'], counter: 'reject' }, parryLabel: 'REJECTED!',
        anim: [[1, 'idle'], [3, 'parry'], [14, 'parry'], [32, 'idle']]
      },
      reject: {
        name: 'Counter', label: 'REJECTION', cmd: 'PARRY', level: 'mid', strength: 'heavy',
        startup: 7, active: 3, recovery: 18, damage: 22,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 24, w: 32, y: 44, h: 30 }, push: 22, juggle: 3.5, carry: 1.8, shake: 0.007,
        anim: [[1, 'parry'], [7, 'counter_x'], [10, 'counter_x'], [27, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'OUTLIER', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 16, active: 4, recovery: 22, damage: 17,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 16, 1.3],
        cancels: [{ btn: 'up', into: 'jump', from: 18, to: 29, onHit: true }],
        anim: [[1, 'crouch'], [10, 'outlier_c'], [16, 'outlier_x'], [20, 'outlier_x'], [29, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['SAMPLE DROP', 'VARIANCE KICK', 'NORMAL DISTRIBUTION'], { slow: 1 }),
    FG.kit.throws('REGRESSION', 'RESIDUAL', { throw: { damage: 32 }, throwB: { damage: 34 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'SAMPLE MEAN', notation: 'P, P', plan: { 0: 'P', 10: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'OUTLIER JUGGLE', notation: 'D+H, P, P', plan: { 0: 'D+H', 41: 'P', 53: 'P' }, hits: ['launcher', 'jab', 'jab2'] },
      { name: 'NORMAL DISTRIBUTION', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K ON THE GROUND',
        plan: { 0: 'D+H', 16: 'UP', 32: 'P', 40: 'K', 50: 'H', 105: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      { name: 'CONFIDENCE INTERVAL', notation: 'BLOCK THEIR JAB, P, D+K ON THE GROUND',
        hold: [[0, 11, 'B']], oppPlan: { 0: 'P' }, plan: { 21: 'P', 63: 'D+K' }, hits: ['postBlockP', 'low'] }
    ],

    // Takes the blazer off before the round (the intro hides it at frame 38).
    intro: [[1, 'stand'], [14, 'stand'], [26, 'shrugoff'], [38, 'toss'], [50, 'stand'], [64, 'point'], [76, 'point'], [88, 'idle']],
    introEvents: [{ t: 38, blazerOff: true }],
    victory: [[1, 'stand'], [14, 'crossed'], [40, 'crossed'], [50, 'nod'], [58, 'crossed'], [80, 'point'], [96, 'crossed'], [110, 'crossed']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I already know what you\'re going to do.',
        'Go ahead. Make the first move. I\'ll wait.',
        'Interesting. Very... interesting.'
      ],
      quips: ['Predictable.', 'As expected.', 'Significant.']
    },
    victoryLines: [
      "I knew you'd do that.",
      'Statistically, you never had a chance.',
      'Your strategy? Insignificant. P less than 0.05.'
    ]
  });
})();
