// LEE — Rushdown — Sequences. Relentless pressure: the Arithmetic Sequence
// string gets faster with every hit, Recursive Rush repeats itself on hit,
// and his normals are plus on block.
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [2, 44], lean: 10, fe: [18, 70], fh: [22, 80], be: [6, 66], bh: [16, 78], fk: [12, 22], ff: [18, 0], bk: [-8, 22], bf: [-16, 2] });
  var stand = P('idle', { lean: -2, fe: [6, 56], fh: [10, 46], be: [-2, 56], bh: [0, 46], fk: [4, 24], ff: [8, 0], bk: [-4, 24], bf: [-8, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    glasses: P(stance, { lean: 4, fe: [14, 80], fh: [10, 88] }),
    glasses2: P(stand, { fe: [12, 80], fh: [8, 88] }),
    folded: P(stand, { fe: [10, 66], fh: [-2, 68], be: [4, 66], bh: [12, 68] }),
    shrug: P(stand, { fe: [12, 70], fh: [20, 78], be: [-8, 70], bh: [-16, 78], head: [4, 88] }),
    hands: [0, 26, 12, 30, 22, 34, 16, 20, 18, 4, 10, 20, 12, 4, 4, 8, -10, 2, -2, 8, -14, 2],
    hands2: [0, 26, 12, 31, 22, 36, 16, 20, 18, 4, 10, 20, 12, 4, 4, 8, -10, 2, -2, 8, -14, 2],
    jab_c: P('jab_c', { lean: 10 }),
    jab_x: P('jab_x', { lean: 12, fh: [44, 77] }),
    cross_x: P('cross_x', { lean: 12 }),
    rush_c: P('dash', { fe: [10, 66], fh: [14, 74] }),
    rush_x: P('dash', { lean: 6, fe: [30, 70], fh: [48, 70] }),
    knee_c: P('idle', { lean: 6, fk: [20, 46], ff: [12, 26], bk: [-6, 24], bf: [-8, 0] }),
    knee_x: P('idle', { lean: 10, hip: [4, 48], fk: [26, 60], ff: [14, 40], bk: [-4, 24], bf: [-6, 0], fh: [22, 82], bh: [12, 80] }),
    body_c: P('hook_c', { lean: 6, all: [0, -4] }),
    body_x: P('hv_x', { all: [0, -6], bh: [48, 54] }),
    fib_c: P('up_c', { lean: 6 }),
    fib_x: P('up_x', { fe: [20, 92], fh: [26, 110] })
  };

  poses.taunt = poses['glasses2'];

  FG.defineFighter({
    id: 'lee', order: 4,
    homeStage: 'hallway',
    name: 'LEE', archetype: 'RUSHDOWN', theme: 'SEQUENCES',
    bio: 'SARCASTIC AND FUNNY. TAUNTS MID-COMBO. RELENTLESS PRESSURE.',
    signature: ['ARITHMETIC SEQUENCE', 'RECURSIVE RUSH', 'FIBONACCI UPPERCUT', 'SERIES EXPANSION'],
    scale: 1.0, health: 165,
    walkF: 2.3, walkB: 1.5, dashSpeed: 9.0, backdashSpeed: 8.0,
    bigHit: { gesture: 'glasses' }, // pushes his glasses up after a big hit
    look: {
      skin: 0xd8a578,
      hair: { style: 'messy', color: 0x1e1814, gray: 0x9a9a9a },
      beard: { style: 'stubble', color: 0x3a2e26 },
      glasses: 0xb8b8c0, mouth: 'smirk',
      top: { style: 'polo', color: 0x18181c, sleeves: 'short' },
      legs: 0x3a3e48, shoes: 0x2a2a2a,
      build: { torso: 0.98, limb: 0.98 }
    },
    idleAnim: { breath: 0.8, bob: 2, rate: 0.16 },
    poses: poses,

    moves: FG.kit.moves({
      // Arithmetic Sequence: P, P, P, then P or K. Each hit is faster than the last.
      jab: {
        name: 'Jab', label: 'FIRST TERM', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 12, damage: 6,
        block: 2, hit: { adv: 9 }, ch: { adv: 11 },
        hitbox: { x: 22, w: 26, y: 70, h: 14 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'seq2', from: 10, to: 21, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [23, 'idle']]
      },
      seq2: {
        name: 'String 2', label: 'SECOND TERM', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 9, active: 2, recovery: 14, damage: 7,
        block: -1, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 24, w: 28, y: 68, h: 14 }, push: 6, juggle: 3.3,
        cancels: [{ btn: 'p', into: 'seq3', from: 9, to: 21, onContact: true }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [11, 'cross_x'], [24, 'idle']]
      },
      seq3: {
        name: 'String 3', label: 'THIRD TERM', cmd: 'P,P,P', level: 'mid', strength: 'medium',
        startup: 8, active: 2, recovery: 16, damage: 8,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 20, w: 28, y: 50, h: 18 }, push: 7, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'p', into: 'seqP', from: 8, to: 20, onContact: true }, { btn: 'k', into: 'seqK', from: 8, to: 20, onContact: true }],
        anim: [[1, 'cross_x'], [5, 'body_c'], [8, 'body_x'], [10, 'body_x'], [25, 'idle']]
      },
      seqP: {
        name: 'String 4 (mid)', label: 'NTH TERM', cmd: 'P,P,P,P', level: 'mid', strength: 'heavy',
        startup: 7, active: 3, recovery: 22, damage: 14,
        block: -12, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 26, w: 26, y: 56, h: 20 }, push: 18, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'body_x'], [4, 'rush_c'], [7, 'rush_x'], [10, 'rush_x'], [31, 'idle']]
      },
      seqK: {
        name: 'String 4 (low)', label: 'DIVERGENT LOW', cmd: 'P,P,P,K', level: 'low', strength: 'medium', crouching: true,
        startup: 7, active: 3, recovery: 22, damage: 11,
        block: -14, hit: { adv: 1 }, ch: { knockdown: true },
        hitbox: { x: 26, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.003,
        anim: [[1, 'body_x'], [4, 'lk_c'], [7, 'lk_x'], [10, 'lk_x'], [31, 'crouch']]
      },
      // Recursive Rush: forward + P lunges in; press P again on hit to repeat it (up to 3).
      fP: {
        name: 'Rush', label: 'RECURSIVE RUSH', cmd: 'F+P', level: 'mid', strength: 'medium',
        startup: 13, active: 3, recovery: 15, damage: 10,
        block: 1, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 28, y: 52, h: 20 }, push: 10, juggle: 3.4, shake: 0.003,
        step: [5, 14, 2.6],
        cancels: [{ btn: 'p', into: 'fP', from: 13, to: 24, onHit: true, max: 2 }],
        anim: [[1, 'idle'], [8, 'rush_c'], [13, 'rush_x'], [16, 'rush_x'], [30, 'idle']]
      },
      mid: {
        name: 'Knee', label: 'COMMON DIFFERENCE', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 12, active: 3, recovery: 17, damage: 12,
        block: -3, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 24, y: 46, h: 22 }, push: 10, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'knee_c'], [12, 'knee_x'], [15, 'knee_x'], [31, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'GEOMETRIC LOW', cmd: 'D+K', level: 'low', strength: 'light',
        startup: 15, active: 3, recovery: 19, damage: 9, crouching: true, otg: true,
        block: -10, hit: { adv: 1 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'lk_c'], [15, 'lk_x'], [18, 'lk_x'], [28, 'lk_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('DIVERGENT SWEEP', { startup: 19 }),
      heavy: {
        name: 'Body Blow', label: 'PARTIAL SUM', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 17, active: 3, recovery: 18, damage: 18, wallSplat: true,
        block: 2, hit: { adv: 7 }, ch: { launch: 5.8 },
        hitbox: { x: 30, w: 24, y: 44, h: 18 }, push: 22, juggle: 3.6, carry: 2, shake: 0.005,
        step: [9, 17, 2],
        anim: [[1, 'idle'], [11, 'body_c'], [17, 'body_x'], [20, 'body_x'], [28, 'hv_r'], [37, 'idle']]
      },
      fH: {
        name: 'Overhead', label: 'INDUCTION STEP', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 20, active: 3, recovery: 20, damage: 17, guardDmg: 22,
        block: -5, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 22 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [10, 20, 1.6],
        anim: [[1, 'idle'], [13, 'ham_c'], [20, 'ham_x'], [23, 'ham_x'], [32, 'hv_r'], [43, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'FIBONACCI UPPERCUT', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 14, active: 4, recovery: 22, damage: 15,
        block: -14, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 14, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 16, to: 27, onHit: true }],
        anim: [[1, 'crouch'], [9, 'fib_c'], [14, 'fib_x'], [18, 'fib_x'], [27, 'up_r'], [39, 'idle']]
      }
    },
    FG.kit.air(['FIRST DIFFERENCE', 'SECOND DIFFERENCE', 'SUMMATION SPIKE']),
    FG.kit.throws('SERIES EXPANSION', 'TELESCOPING TOSS', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'ARITHMETIC SEQUENCE', difficulty: 'easy', notation: 'P, P, P, P', plan: { 0: 'P', 11: 'P', 22: 'P', 32: 'P' }, hits: ['jab', 'seq2', 'seq3', 'seqP'] },
      { name: 'RECURSIVE RUSH', difficulty: 'easy', notation: 'F+P, P, P', plan: { 0: 'F+P', 13: 'P', 26: 'P' }, hits: ['fP', 'fP', 'fP'] },
      { name: 'FIBONACCI JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, P, D+K ON THE GROUND',
        plan: { 0: 'D+H', 37: 'P', 50: 'P', 57: 'P', 99: 'D+K' }, hits: ['launcher', 'jab', 'seq2', 'seq3', 'low'] },
      { name: 'FIBONACCI SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 16: 'UP', 31: 'P', 40: 'K', 50: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] }
    ],

    intro: [[1, 'idle'], [14, 'stand'], [26, 'glasses2'], [44, 'glasses2'], [56, 'shrug'], [74, 'shrug'], [86, 'idle']],
    victory: [[1, 'stand'], [16, 'folded'], [50, 'folded'], [60, 'glasses2'], [76, 'glasses2'], [90, 'folded'], [110, 'folded']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { glasses: [[1, 'idle'], [8, 'glasses'], [26, 'glasses'], [36, 'idle']] },
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'Wow. Bold of you to show up.',
        'I\'ve seen better form in a group project.',
        'Take notes. You\'ll need them for the retake.'
      ],
      quips: ['Keep up.', 'This is review.', 'Next question.', 'Taking notes?']
    },
    victoryLines: [
      "Show your work next time. Oh wait, you didn't have any.",
      "I've graded better fights on a Friday at 11 PM.",
      "I'd explain what went wrong, but we only have 52 minutes."
    ]
  });
})();
