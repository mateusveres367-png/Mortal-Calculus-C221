// RAMOS — Grappler — Matrices. Fast and explosive: closes distance with the
// quickest dash in the game, then grabs. Matrix Lock has a short break
// window, Determinant Slam is his reverse throw, and Identity is a command
// grab that can't be broken and takes crouching opponents too. A cardio
// machine: he never gets tired.
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [0, 40], lean: 14, fe: [20, 58], fh: [30, 62], be: [8, 56], bh: [20, 58], fk: [14, 20], ff: [20, 0], bk: [-10, 20], bf: [-18, 0] });
  var stand = P('idle', { lean: 0, fe: [8, 56], fh: [10, 46], be: [-4, 56], bh: [-2, 46], fk: [6, 24], ff: [10, 0], bk: [-6, 24], bf: [-10, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    knuckles: P(stand, { fe: [12, 66], fh: [10, 70], be: [6, 66], bh: [12, 70] }),
    stretch: P(stand, { fe: [6, 86], fh: [4, 102], be: [-4, 86], bh: [-2, 102] }),
    pump: P(stand, { fe: [14, 80], fh: [12, 98] }),
    pump2: P(stand, { fe: [14, 74], fh: [16, 88] }),
    kneel: [0, 26, 6, 50, 10, 60, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    knee_x: P('idle', { lean: 10, hip: [4, 48], fk: [28, 58], ff: [16, 40], bk: [-4, 24], bf: [-6, 0], fe: [16, 70], fh: [22, 82], be: [4, 68], bh: [12, 80] }),
    shoulder: P('dash', { lean: 16, fe: [14, 60], fh: [18, 50], be: [6, 58], bh: [10, 48] }),
    elbow_c: P('hook_c', { lean: 6 }),
    elbow_x: P('hook_x', { lean: 16, fe: [26, 70], fh: [16, 74] }),
    toss_c: P('crouch', { lean: 14, fe: [22, 40], fh: [30, 34], be: [16, 38], bh: [24, 32] }),
    toss_x: P('up_x', { lean: -4, fe: [20, 88], fh: [26, 102], be: [14, 86], bh: [20, 100] }),
    // Throws: a lock-up and a suplex.
    grab_x: P('grab_x', { all: [0, -4], lean: 10 }),
    throw_lift: P('throw_lift', { lean: -14, fe: [10, 90], fh: [14, 104], be: [4, 88], bh: [8, 102] }),
    throw_slam: P('throw_slam', { lean: 18, all: [6, -8] }),
    throw_back: P('throw_back', { lean: -10 })
  };

  poses.taunt = poses['stretch'];

  FG.defineFighter({
    id: 'ramos', order: 7,
    name: 'RAMOS', archetype: 'GRAPPLER', theme: 'MATRICES',
    bio: 'FAST, EXPLOSIVE GRAPPLER WHO CLOSES DISTANCE QUICKLY. CONFIDENT AND FOCUSED.',
    signature: ['MATRIX LOCK', 'DETERMINANT SLAM', 'IDENTITY', 'TRANSPOSE TOSS'],
    scale: 1.02, health: 178,
    walkF: 2.3, walkB: 1.6, dashSpeed: 10, backdashSpeed: 8.2,
    dashAttackFrom: 5,
    // Cardio machine: chains dashes back to back, and his guard meter recovers twice as fast.
    dashChainFrom: 7, guardRegenRate: 2,
    look: {
      skin: 0xc28a5c,
      hair: { style: 'longBouncy', color: 0x0e0c0c }, // long, bouncy, swings when he moves
      wristband: [0xd01c28, 0xffffff],                 // red and white (he's Peruvian)
      beard: { style: 'stubble', color: 0x2a1e16 },
      mouth: 'smile',
      top: { style: 'polo', color: 0x6b5f3a, pattern: 'heather', sleeves: 'short' },
      legs: 0x2e3442, shoes: 0xd8d8d8,
      build: { torso: 1.02, limb: 1.0 }
    },
    idleAnim: { breath: 1, bob: 1, sway: 1.2, rate: 0.12 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'ROW JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 66, h: 14 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'COLUMN ELBOW', cmd: 'P,P', level: 'high', strength: 'medium',
        startup: 10, active: 3, recovery: 16, damage: 11,
        block: -2, hit: { adv: 6 }, ch: { adv: 10 },
        hitbox: { x: 14, w: 26, y: 64, h: 18 }, push: 6, juggle: 3.4, shake: 0.002,
        anim: [[1, 'jab_x'], [6, 'elbow_c'], [10, 'elbow_x'], [13, 'elbow_x'], [28, 'idle']]
      },
      // Out of his fast dash: a shoulder charge that knocks down.
      dashP: {
        name: 'Shoulder Charge', label: 'AUGMENTED CHARGE', cmd: 'F,F+P', level: 'mid', strength: 'heavy',
        startup: 13, active: 4, recovery: 20, damage: 17,
        block: -9, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 10, w: 30, y: 40, h: 30 }, push: 22, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [1, 13, 3.4],
        anim: [[1, 'dash'], [8, 'shoulder'], [13, 'shoulder'], [17, 'shoulder'], [36, 'idle']]
      },
      mid: {
        name: 'Knee', label: 'PIVOT KNEE', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 13, active: 3, recovery: 17, damage: 13,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 24, y: 44, h: 22 }, push: 8, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'fk_c'], [13, 'knee_x'], [16, 'knee_x'], [32, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'LOWER TRIANGULAR', cmd: 'D+K', level: 'low', strength: 'light', crouching: true, otg: true,
        startup: 15, active: 3, recovery: 20, damage: 10,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 24, y: 0, h: 16 }, push: 8, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'lk_c'], [15, 'lk_x'], [18, 'lk_x'], [28, 'lk_c'], [37, 'crouch']]
      },
      sweep: FG.kit.sweep('NULL SPACE SWEEP'),
      heavy: {
        name: 'Heavy', label: 'ROW REDUCTION', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 18, active: 3, recovery: 21, damage: 20, wallSplat: true,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 20, w: 26, y: 50, h: 22 }, push: 24, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 2],
        anim: [[1, 'idle'], [12, 'elbow_c'], [18, 'elbow_x'], [21, 'elbow_x'], [29, 'hv_r'], [41, 'idle']]
      },
      fH: {
        name: 'Overhead', label: 'SCALAR SLAM', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 24, y: 48, h: 22 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.4],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'TRANSPOSE TOSS', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 15, active: 4, recovery: 23, damage: 17,
        block: -15, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 8, w: 28, y: 26, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 15, 1.6],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [9, 'toss_c'], [15, 'toss_x'], [19, 'toss_x'], [28, 'up_r'], [41, 'idle']]
      },
      // Identity: forward + P+K. A slower command grab: no break, and it takes crouching opponents.
      cmdGrab: {
        name: 'Command Grab', label: 'IDENTITY', cmd: 'F+P+K', level: 'mid', strength: 'heavy', throw: true, grabsCrouch: true, breakBtn: null,
        startup: 16, active: 3, recovery: 32, damage: 32,
        hitbox: { x: 10, w: 28, y: 20, h: 60 }, push: 0, juggle: 0, shake: 0.011,
        anim: [[1, 'idle'], [10, 'grab_c'], [16, 'grab_x'], [19, 'grab_x'], [50, 'idle']]
      }
    },
    FG.kit.air(['PIVOT DROP', 'EIGEN KICK', 'RANK SPIKE']),
    // Matrix Lock has a short break window (8 frames instead of 15).
    FG.kit.throws('MATRIX LOCK', 'DETERMINANT SLAM', { throw: { damage: 34, breakWindow: 8 }, throwB: { damage: 38, shake: 0.012 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'ROW AND COLUMN', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 15: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'TRANSPOSE JUGGLE', difficulty: 'medium', notation: 'D+H, P, D+K ON THE GROUND', plan: { 0: 'D+H', 39: 'P', 82: 'D+K' }, hits: ['launcher', 'jab', 'low'] },
      { name: 'RANK SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 32: 'P', 40: 'K', 50: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'IDENTITY STOMP', difficulty: 'medium', notation: 'F+P+K, D+K ON THE GROUND', plan: { 0: 'F+P+K', 66: 'D+K' }, hits: ['cmdGrab', 'low'] }
    ],

    intro: [[1, 'stand'], [12, 'knuckles'], [28, 'knuckles'], [38, 'stretch'], [56, 'stretch'], [66, 'stand'], [84, 'idle']],
    victory: [[1, 'stand'], [12, 'pump'], [24, 'pump2'], [36, 'pump'], [48, 'pump2'], [62, 'stand'], [100, 'stand']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I did cardio before this. Did you?',
        'Forty-five minutes on the stair climber. This is my cooldown.',
        'Try to keep up. My hair can.'
      ],
      quips: ['Cardio!', 'Not even winded.', 'Keep up!']
    },
    victoryLines: [
      'Matrix Lock: no inverse, no escape.',
      'Your determinant was zero. So was your chance.',
      'Cardio wins again.'
    ]
  });
})();
