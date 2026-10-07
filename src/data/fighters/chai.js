// CHAI — Technical — Geometry. Precise and graceful: sidestep attacks that
// come out early (Tangent Step), a parry that counters highs and mids
// (Reflection Counter), and tight but rewarding combo routes.
(function () {
  var P = FG.pose;

  var stance = P('idle', { lean: 2, fe: [18, 70], fh: [28, 76], be: [2, 64], bh: [10, 74], fk: [8, 24], ff: [13, 0], bk: [-6, 23], bf: [-12, 0] });
  var stand = P('idle', { lean: 0, fe: [6, 58], fh: [10, 52], be: [2, 58], bh: [8, 52], fk: [4, 24], ff: [6, 0], bk: [-3, 24], bf: [-5, 0] });

  var poses = {
    idle: stance,
    stand: stand,
    bow: P(stand, { lean: 32 }),
    offer: P(stand, { lean: 18, fe: [18, 60], fh: [30, 48], be: [0, 58], bh: [4, 48] }),
    offer2: P(stand, { lean: 20, fe: [18, 58], fh: [31, 46], be: [0, 58], bh: [4, 48] }),
    smile: P(stand, { fe: [10, 70], fh: [14, 84] }),
    sorry: P(stand, { lean: 14, fe: [10, 64], fh: [14, 74] }),
    kneel: [0, 20, 4, 44, 6, 56, 10, 34, 14, 24, 0, 34, 6, 24, 14, 14, 4, 0, -4, 8, -12, 0],
    kneel2: [0, 20, 3, 43, 4, 54, 10, 34, 14, 24, 0, 34, 6, 24, 14, 14, 4, 0, -4, 8, -12, 0],
    jab_x: P('jab_x', { lean: 4, fh: [46, 80] }),
    kick_x: P('fk_x', { lean: -10, fk: [26, 58], ff: [50, 60] }),
    parry: P('block', { lean: 4, fe: [16, 74], fh: [24, 84], be: [12, 70], bh: [22, 78] }),
    reflect_x: P('cross_x', { lean: 12, bh: [48, 70] }),
    tangent_c: P('hook_c', { lean: -6 }),
    tangent_x: P('hook_x', { lean: 14, fe: [24, 70], fh: [38, 66] }),
    flip_c: P('crouch', { lean: -6 }),
    flip_x: P('idle', { hip: [0, 52], lean: -22, fk: [16, 82], ff: [28, 106], bk: [-6, 28], bf: [-10, 2] }),
    axe_c: P('idle', { lean: -10, fk: [20, 80], ff: [26, 104] }),
    axe_x: P('idle', { lean: 6, fk: [26, 50], ff: [44, 40] })
  };

  FG.defineFighter({
    id: 'chai', order: 2,
    name: 'CHAI', archetype: 'TECHNICAL', theme: 'GEOMETRY',
    bio: 'VERY KIND, PRECISE AND GRACEFUL. BOWS BEFORE FIGHTS.',
    signature: ['TANGENT STEP', 'REFLECTION COUNTER', 'PARABOLA LAUNCHER', 'TRANSFORMATION'],
    scale: 0.96, health: 160,
    walkF: 2.2, walkB: 1.9, dashSpeed: 8.2, backdashSpeed: 9.2,
    ssAttackFrom: 6, // Tangent Step comes out early in the sidestep
    bigHit: { gesture: 'sorry', face: 'wince' }, // apologetic after landing a big hit
    look: {
      skin: 0xe8b98f,
      hair: { style: 'longTied', color: 0x6b4423, highlight: 0xd9b26a },
      mouth: 'bright', earrings: 0xe8e8e8, pendant: 0x9b59d0,
      top: { style: 'blouse', color: 0xb5562a, sleeves: 'short' },
      legs: 0x3a3a44, shoes: 0x1c1c1c, flats: true,
      build: { torso: 0.86, limb: 0.85 }
    },
    idleAnim: { breath: 1, bob: 1.2, rate: 0.11 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'RIGHT ANGLE', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 12, damage: 6,
        block: 2, hit: { adv: 8 }, ch: { adv: 11 },
        hitbox: { x: 22, w: 28, y: 70, h: 14 }, push: 6, juggle: 3.2, hitstop: 6,
        cancels: [{ btn: 'k', into: 'jabK', from: 10, to: 22, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [23, 'idle']]
      },
      jabK: {
        name: 'Jab Kick', label: 'COMPLEMENTARY KICK', cmd: 'P,K', level: 'mid', strength: 'medium',
        startup: 12, active: 3, recovery: 20, damage: 12,
        block: -9, hit: { adv: 3 }, ch: { adv: 8 },
        hitbox: { x: 30, w: 26, y: 48, h: 20 }, push: 14, juggle: 3.6, hitstop: 9, shake: 0.002,
        anim: [[1, 'jab_x'], [8, 'fk_c'], [12, 'kick_x'], [15, 'kick_x'], [34, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'ISOSCELES KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 13, active: 3, recovery: 19, damage: 13,
        block: -6, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 26, y: 46, h: 20 }, push: 14, juggle: 3.8, hitstop: 9, shake: 0.002,
        anim: [[1, 'idle'], [9, 'fk_c'], [13, 'kick_x'], [16, 'kick_x'], [24, 'fk_c'], [34, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'ACUTE LOW', cmd: 'D+K', level: 'low', strength: 'light',
        startup: 15, active: 3, recovery: 19, damage: 9, crouching: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, hitstop: 7, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'lk_c'], [15, 'lk_x'], [18, 'lk_x'], [28, 'lk_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('OBTUSE SWEEP', { startup: 19, damage: 15 }),
      heavy: {
        name: 'Heavy', label: 'HYPOTENUSE', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 17, active: 3, recovery: 22, damage: 19, wallSplat: true,
        block: -6, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 34, w: 24, y: 52, h: 16 }, push: 24, juggle: 3.6, carry: 2, hitstop: 11, shake: 0.005,
        step: [9, 18, 1.8],
        anim: [[1, 'idle'], [11, 'hv_c'], [17, 'hv_x'], [20, 'hv_x'], [28, 'hv_r'], [41, 'idle']]
      },
      fH: {
        name: 'Axe Kick', label: 'VERTEX DROP', cmd: 'F+H', level: 'mid', strength: 'heavy', bound: true,
        startup: 20, active: 3, recovery: 20, damage: 17, guardDmg: 22,
        block: -7, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 30, w: 22, y: 30, h: 30 }, push: 14, juggle: 2.5, hitstop: 12, shake: 0.006,
        step: [12, 20, 1.3],
        anim: [[1, 'idle'], [12, 'axe_c'], [20, 'axe_x'], [23, 'axe_x'], [32, 'hv_r'], [42, 'idle']]
      },
      // Reflection Counter: catch a high or mid during frames 2-10 and counter at once.
      bH: {
        name: 'Parry', label: 'REFLECTION COUNTER', cmd: 'B+H', level: 'mid', strength: 'light',
        startup: 30, active: 1, recovery: 1, parry: { from: 2, to: 10, levels: ['high', 'mid'], counter: 'reflect' }, parryLabel: 'REFLECTED!',
        anim: [[1, 'idle'], [3, 'parry'], [12, 'parry'], [30, 'idle']]
      },
      reflect: {
        name: 'Counter', label: 'REFLECTION', cmd: 'PARRY', level: 'mid', strength: 'heavy',
        startup: 6, active: 3, recovery: 18, damage: 20,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 34, y: 50, h: 30 }, push: 20, juggle: 3.5, carry: 1.6, hitstop: 13, shake: 0.007,
        anim: [[1, 'parry'], [6, 'reflect_x'], [9, 'reflect_x'], [26, 'idle']]
      },
      // Tangent Step: an attack out of a sidestep (sidestep, then P). Tracks.
      ssP: {
        name: 'Sidestep Attack', label: 'TANGENT STEP', cmd: 'SS, P', level: 'mid', strength: 'medium', tracks: true, keepZ: true,
        startup: 12, active: 3, recovery: 16, damage: 15,
        block: -3, hit: { adv: 6 }, ch: { knockdown: true },
        hitbox: { x: 18, w: 28, y: 54, h: 22 }, push: 14, juggle: 3.6, hitstop: 10, shake: 0.004,
        anim: [[1, 'squat'], [7, 'tangent_c'], [12, 'tangent_x'], [15, 'tangent_x'], [31, 'idle']]
      },
      ssK: {
        name: 'Sidestep Low', label: 'SECANT SWEEP', cmd: 'SS, K', level: 'low', strength: 'medium', tracks: true, crouching: true, keepZ: true,
        startup: 15, active: 3, recovery: 22, damage: 12,
        block: -13, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 28, w: 24, y: 0, h: 14 }, push: 8, juggle: 2.5, hitstop: 9, shake: 0.003,
        anim: [[1, 'squat'], [9, 'sweep_c'], [15, 'sweep_x'], [18, 'sweep_x'], [30, 'sweep_c'], [40, 'crouch']]
      },
      launcher: {
        name: 'Launcher', label: 'PARABOLA LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 14, active: 4, recovery: 24, damage: 15,
        block: -16, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 10, w: 28, y: 36, h: 76 }, push: 6, juggle: 5.5, carry: 0.6, hitstop: 13, shake: 0.008,
        step: [8, 14, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 16, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [8, 'flip_c'], [14, 'flip_x'], [18, 'flip_x'], [30, 'squat'], [41, 'idle']]
      }
    },
    FG.kit.air(['TANGENT JAB', 'CHORD KICK', 'VERTEX SPIKE']),
    FG.kit.throws('TRANSFORMATION', 'ROTATION', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake()),

    combos: [
      { name: 'RIGHT TRIANGLE', notation: 'P, K', plan: { 0: 'P', 14: 'K' }, hits: ['jab', 'jabK'] },
      { name: 'PARABOLA JUGGLE', notation: 'D+H, P, K', plan: { 0: 'D+H', 55: 'P', 85: 'K' }, hits: ['launcher', 'jab', 'mid'] },
      { name: 'VERTEX SPIKE', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 16: 'UP', 35: 'P', 47: 'K', 60: 'H', 115: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'VERTEX BOUND (HARD)', notation: 'D+H, F+H (2-FRAME WINDOW), K',
        plan: { 0: 'D+H', 55: 'F+H', 110: 'K' }, hits: ['launcher', 'fH', 'mid'] }
    ],

    intro: [[1, 'idle'], [14, 'stand'], [30, 'bow'], [48, 'bow'], [62, 'stand'], [84, 'idle']],
    victory: [[1, 'stand'], [16, 'offer'], [40, 'offer2'], [64, 'offer'], [80, 'smile'], [100, 'offer']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    gestures: { sorry: [[1, 'idle'], [8, 'sorry'], [32, 'sorry'], [42, 'idle']] },
    victoryLines: [
      "Don't worry, I curve fights too.",
      'That was acute attempt. Mine was just more right.',
      'Office hours are Tuesdays if you want to go over that.'
    ]
  });
})();
