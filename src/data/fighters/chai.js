// CHAI — Technical — Geometry (circles, angles, transformations). Taekwondo:
// almost all kicks (fast high kicks, a spinning hook kick, an axe kick, a flip
// kick, kicks out of her sidesteps), only three punches. Light and graceful in a
// side-on stance, with the best sidestep in the game.
//
// Signature: KICK CHAIN. Once a kick connects (hit or block), K or H into a
// different kick cancels it, up to four kicks in a row.
(function () {
  // Slim, long-legged: short arms, long legs.
  var R = FG.rigger({ torso: 26, neck: 11, upper: 14, fore: 12.5, thigh: 25, shin: 25.5 });
  // Side-on, up on the balls of her feet, hands low and loose.
  var GF = { hand: [20, 66] }, GB = { hand: [6, 70] };
  var stance = R({ hip: [0, 48], lean: -2, fa: GF, ba: GB, fl: { foot: [11, 1] }, bl: { foot: [-12, 0] } });
  var stand = R({ hip: [0, 50], lean: 0, fa: [-80, -70], ba: [-95, -80], fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    bow: R({ hip: [-2, 49], lean: 34, neck: 10, fa: [-70, -80], ba: [-85, -90], fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),
    offer: R({ hip: [0, 49], lean: 18, fa: [-20, -30], ba: [-90, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    offer2: R({ hip: [0, 49], lean: 20, fa: [-25, -35], ba: [-90, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    smile: R({ hip: [0, 50], lean: 0, fa: [-50, 80], ba: [-95, -80], fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),
    sorry: R({ hip: [0, 49], lean: 14, neck: 8, fa: [-40, 60], ba: [-60, 70], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    kneel: [0, 20, 4, 44, 6, 56, 10, 34, 14, 24, 0, 34, 6, 24, 14, 14, 4, 0, -4, 8, -12, 0],
    kneel2: [0, 20, 3, 43, 4, 54, 10, 34, 14, 24, 0, 34, 6, 24, 14, 14, 4, 0, -4, 8, -12, 0],

    // Movement: light, upright, graceful.
    crouch: R({ hip: [0, 32], lean: 10, fa: { hand: [20, 52] }, ba: { hand: [8, 56] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    squat: R({ hip: [0, 38], lean: 6, fa: { hand: [20, 56] }, ba: { hand: [8, 60] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    jump: R({ hip: [0, 48], lean: -4, fa: [30, 70], ba: [160, 130], fl: [-10, -90], bl: [-100, -90] }),
    dash: R({ hip: [3, 47], lean: 8, fa: { hand: [22, 62] }, ba: { hand: [8, 66] }, fl: { foot: [20, 4] }, bl: { foot: [-18, 0] } }),
    backdash: R({ hip: [-3, 48], lean: -8, fa: { hand: [18, 66] }, ba: { hand: [4, 70] }, fl: { foot: [12, 0] }, bl: { foot: [-18, 4] } }),
    sidestep: R({ hip: [0, 46], lean: 2, neck: -6, fa: [-20, 20], ba: [180, 150], fl: { foot: [4, 6] }, bl: { foot: [-6, 0] } }),
    // Guard: forearms up, side-on, the front knee lifted to check kicks.
    block: R({ hip: [-2, 48], lean: -4, fa: { hand: [16, 80] }, ba: { hand: [10, 78] }, fl: [-30, -100], bl: { foot: [-12, 0] } }),
    cblock: R({ hip: [-1, 30], lean: 10, fa: { hand: [18, 56] }, ba: { hand: [10, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    // Hit reactions: light, she spins and skips back.
    hit_high: R({ hip: [-3, 48], lean: -14, neck: -18, fa: [-110, -80], ba: [170, 200], fl: { foot: [12, 3] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 46], lean: 22, neck: 8, fa: [-60, -30], ba: [-80, -40], fl: [-40, -110], bl: { foot: [-14, 0] } }),
    hit_low: R({ hip: [-2, 44], lean: 8, fa: [-10, 50], ba: [170, 140], fl: [20, -80], bl: { foot: [-12, 0] } }),
    gbreak: R({ hip: [-4, 48], lean: -16, fa: [80, 130], ba: [180, 210], fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -80, neck: -10, fa: [130, 170], ba: [160, 190], fl: [30, 0], bl: [20, -20] }),
    down: R({ hip: [0, 6], lean: -86, fa: [150, 140], ba: [-170, -180], fl: [8, 0], bl: [10, 20] }),

    // Right Angle: a quick jab from the side-on stance.
    jab_c: R({ hip: [1, 48], lean: 0, fa: { hand: [18, 74] }, ba: GB, fl: { foot: [12, 1] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [6, 47], lean: 10, fa: [6, 4], ba: { hand: [10, 70] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    // Inscribed Angle: a reverse punch, hips square.
    cross_c: R({ hip: [2, 47], lean: 4, fa: { hand: [22, 70] }, ba: { hand: [2, 66] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    cross_x: R({ hip: [8, 46], lean: 12, fa: { hand: [12, 62] }, ba: [4, 2], fl: { foot: [22, 0] }, bl: { foot: [-10, 0] } }),
    // Complementary Kick: the back leg's roundhouse, after the jab.
    rk_c: R({ hip: [0, 48], lean: -6, fa: { hand: [16, 72] }, ba: [-150, -110], fl: { foot: [8, 0] }, bl: [10, -80] }),
    rk_x: R({ hip: [-2, 49], lean: -20, fa: { hand: [14, 76] }, ba: [-160, -130], fl: { foot: [-6, 0] }, bl: [18, 10] }),
    // Isosceles Kick: the front leg's fast turning kick to the body.
    tk_c: R({ hip: [0, 49], lean: -6, fa: GF, ba: GB, fl: [35, -70], bl: { foot: [-12, 0] } }),
    tk_x: R({ hip: [0, 50], lean: -18, fa: { hand: [12, 74] }, ba: [-170, -140], fl: [12, 8], bl: { foot: [-12, 0] } }),
    // Altitude Kick: a fast high kick to the head.
    hk_c: R({ hip: [0, 49], lean: -10, fa: GF, ba: GB, fl: [55, -40], bl: { foot: [-12, 0] } }),
    hk_x: R({ hip: [-2, 50], lean: -28, fa: { hand: [10, 76] }, ba: [-170, -150], fl: [36, 30], bl: { foot: [-12, 0] } }),
    // Reflex Angle: a spinning back kick, heel first.
    bk_c: R({ hip: [-2, 48], lean: -4, neck: -8, fa: { hand: [4, 70] }, ba: { hand: [-6, 66] }, fl: { foot: [-6, 0] }, bl: [60, -60] }),
    bk_x: R({ hip: [-4, 48], lean: -40, fa: { hand: [-4, 70] }, ba: [-150, -130], fl: { foot: [-12, 0] }, bl: [2, 4] }),
    // Acute Low: a snapping low front kick.
    low_c: R({ hip: [0, 42], lean: 6, fa: GF, ba: GB, fl: [10, -100], bl: { foot: [-12, 0] } }),
    low_x: R({ hip: [2, 40], lean: 4, fa: { hand: [20, 60] }, ba: { hand: [6, 64] }, fl: { foot: [46, 8] }, bl: { foot: [-12, 0] } }),
    // Obtuse Sweep: a spinning back sweep, low to the floor.
    sweep_c: R({ hip: [0, 26], lean: 30, fa: { hand: [18, 2] }, ba: { hand: [6, 30] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [-2, 20], lean: 34, fa: { hand: [14, 2] }, ba: [-150, -160], fl: { foot: [-4, 0] }, bl: { foot: [50, 4] } }),
    // Hypotenuse: a spinning hook kick, heel whipping across at head height.
    hv_c: R({ hip: [-2, 48], lean: -4, neck: -10, fa: { hand: [2, 70] }, ba: { hand: [-8, 64] }, fl: { foot: [-4, 0] }, bl: [40, -50] }),
    hv_x: R({ hip: [-2, 50], lean: -30, fa: [-150, -160], ba: [-170, -160], fl: { foot: [-10, 0] }, bl: [30, 40] }),
    hv_r: R({ hip: [0, 48], lean: -10, fa: GF, ba: GB, fl: { foot: [8, 0] }, bl: [10, -70] }),
    // Vertex Drop: the axe kick, leg straight up, then down.
    axe_c: R({ hip: [-1, 50], lean: -18, fa: [-30, -60], ba: [-160, -140], fl: [86, 92], bl: { foot: [-12, 0] } }),
    axe_x: R({ hip: [3, 46], lean: 10, fa: { hand: [16, 62] }, ba: [-160, -140], fl: [20, -30], bl: { foot: [-12, 0] } }),
    // Arc Launcher: a flip kick, the whole body arcing back.
    flip_c: R({ hip: [0, 36], lean: 10, fa: { hand: [18, 54] }, ba: { hand: [6, 58] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    flip_x: R({ hip: [0, 56], lean: -40, neck: -10, fa: [-150, -170], ba: [-170, -180], fl: [80, 95], bl: { foot: [-8, 8] } }),
    flip_r: R({ hip: [0, 44], lean: -14, fa: [-120, -100], ba: [-150, -130], fl: [20, -60], bl: { foot: [-10, 0] } }),
    // Reflection Counter: hands up in a circle; the counter is a reverse roundhouse.
    parry: R({ hip: [-1, 48], lean: 0, fa: { hand: [20, 80] }, ba: { hand: [14, 84] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    reflect_x: R({ hip: [-2, 49], lean: -30, fa: [-140, -150], ba: [-160, -170], fl: { foot: [-8, 0] }, bl: [24, 20] }),
    // Tangent Step: a spinning hook kick out of the sidestep. Secant Sweep: a low one.
    tangent_c: R({ hip: [0, 46], lean: -2, neck: -10, fa: [-20, 20], ba: [180, 150], fl: { foot: [-2, 0] }, bl: [50, -40] }),
    tangent_x: R({ hip: [-2, 49], lean: -26, fa: [-150, -150], ba: [-170, -170], fl: { foot: [-10, 0] }, bl: [10, 30] }),
    secant_x: R({ hip: [-2, 22], lean: 24, fa: { hand: [12, 2] }, ba: [160, 140], fl: { foot: [48, 4] }, bl: { foot: [-12, 0] } }),

    // Air: Tangent Jab (her third punch), Chord Kick (a flying side kick), Vertex Spike (an air axe kick).
    air_p: R({ hip: [0, 48], lean: 8, fa: [4, 0], ba: GB, fl: [-10, -90], bl: [-100, -90] }),
    air_k: R({ hip: [0, 48], lean: -30, fa: { hand: [10, 74] }, ba: [-170, -150], fl: [4, 0], bl: [-60, -130] }),
    air_hc: R({ hip: [0, 48], lean: -20, fa: [-30, -60], ba: [-160, -140], fl: [84, 92], bl: [-100, -90] }),
    air_hx: R({ hip: [0, 48], lean: 12, fa: [-30, -60], ba: [-160, -140], fl: [-10, -50], bl: [-100, -90] }),

    // Transformation: wrap the arm and spin them over. Rotation: a turning hip throw.
    grab_c: R({ hip: [2, 48], lean: 8, fa: { hand: [24, 70] }, ba: { hand: [18, 74] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [4, 48], lean: 12, fa: { hand: [28, 68] }, ba: { hand: [24, 72] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [0, 46], lean: -4, fa: [70, 100], ba: [60, 90], fl: { foot: [6, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 40], lean: 30, fa: [-20, -40], ba: [-30, -50], fl: { foot: [20, 0] }, bl: { foot: [-10, 0] } }),
    throw_back: R({ hip: [-2, 46], lean: -24, fa: [140, 170], ba: [150, 180], fl: { foot: [6, 0] }, bl: { foot: [-18, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [44, 6] }, bl: { foot: [6, 0] } }),
    wake_mid: R({ hip: [0, 48], lean: -22, fa: GF, ba: [-170, -150], fl: [18, 16], bl: { foot: [-12, 0] } })
  };

  poses.taunt = poses.smile;

  FG.defineFighter({
    id: 'chai', order: 2,
    homeStage: 'classroom',
    glyphs: ['360', 'C=2*PI*R', '(X,Y)->(-X,Y)', '180'], // math that flies off their big hits
    stringH: 'CENTRAL ANGLE', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0xe2702a, b: 0xf6ecd0 }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'Q.E.D.', input: 'B, F, K' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'CIRCLE THEOREM', text: 'a full 360-degree sidestep around them with a kick from every sixth of the circle, the circle and its radius drawn behind, then an arc kick', from: 'fK', len: 250, hits: [44, 64, 84, 104, 124, 182], end: { gap: 84, down: true } },
    name: 'CHAI', archetype: 'TECHNICAL', theme: 'GEOMETRY',
    style: 'TAEKWONDO', signatureMechanic: 'KICK CHAIN',
    signatureText: 'once a kick connects, K or H into a different kick cancels it, up to four kicks in a row; and the best sidestep in the game',
    bio: 'VERY KIND, PRECISE AND GRACEFUL. BOWS BEFORE FIGHTS.',
    signature: ['TANGENT STEP', 'REFLECTION COUNTER', 'ARC LAUNCHER', 'TRANSFORMATION'],
    scale: 0.96, health: 160,
    // Movement: light and quick, a high jump, and the best sidestep: short, deep,
    // and she can attack out of it almost at once.
    walkF: 2.3, walkB: 1.9, dashSpeed: 8.6, backdashSpeed: 9.0,
    jumpVy: 10.2, jumpVx: 2.8, weight: 0.9, react: 1.15,
    sidestepFrames: 16, sidestepDepth: 40, ssAttackFrom: 4,
    walk: { lean: 0.5, bob: 1.2, rate: 0.18 },
    kickChain: true,
    bigHit: { gesture: 'sorry', face: 'wince' }, // apologetic after landing a big hit
    look: {
      skin: 0xe8b98f,
      hair: { style: 'longTied', color: 0x6b4423, highlight: 0xd9b26a },
      mouth: 'bright', earrings: 0xe8e8e8, pendant: 0x9b59d0,
      top: { style: 'blouse', color: 0xb5562a, sleeves: 'short' },
      legs: 0x3a3a44, shoes: 0x1c1c1c, flats: true,
      build: { torso: 0.86, limb: 0.85 }
    },
    idleAnim: { breath: 0.8, bob: 1.6, rate: 0.13 }, // a light bounce on her toes
    poses: poses,
    // How the CPU plays her: sidesteps and counters, then kick chains.
    ai: { spacing: 52, pokes: ['K', 'F+K', 'D+K'], close: ['P', 'K', 'B+K', 'P+K'], aggro: 0.9, sidestep: 3, ssFollow: 'P', parry: 0.2 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'RIGHT ANGLE', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 12, damage: 6,
        block: 2, hit: { adv: 8 }, ch: { adv: 11 },
        hitbox: { x: 20, w: 28, y: 66, h: 18 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }, { btn: 'k', into: 'jabK', from: 10, to: 22, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [23, 'idle']]
      },
      jab2: {
        name: 'Reverse Punch', label: 'INSCRIBED ANGLE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 9, active: 2, recovery: 16, damage: 8,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 22, w: 28, y: 64, h: 24 }, push: 8, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [12, 'cross_x'], [26, 'idle']]
      },
      jabK: {
        name: 'Roundhouse', label: 'COMPLEMENTARY KICK', cmd: 'P,K', level: 'mid', strength: 'medium', motion: 'roundhouse', kick: true,
        startup: 12, active: 3, recovery: 20, damage: 12,
        block: -9, hit: { adv: 3 }, ch: { adv: 8 },
        hitbox: { x: 26, w: 28, y: 48, h: 22 }, push: 14, juggle: 3.6, shake: 0.002,
        anim: [[1, 'jab_x'], [8, 'rk_c'], [12, 'rk_x'], [15, 'rk_x'], [34, 'idle']]
      },
      mid: {
        name: 'Turning Kick', label: 'ISOSCELES KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'roundhouse', kick: true,
        startup: 12, active: 3, recovery: 19, damage: 12,
        block: -6, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 28, w: 28, y: 48, h: 20 }, push: 12, juggle: 3.8, shake: 0.002,
        anim: [[1, 'idle'], [8, 'tk_c'], [12, 'tk_x'], [15, 'tk_x'], [23, 'tk_c'], [33, 'idle']]
      },
      fK: {
        name: 'High Kick', label: 'ALTITUDE KICK', cmd: 'F+K', level: 'high', strength: 'medium', motion: 'kick', kick: true,
        startup: 13, active: 3, recovery: 18, damage: 13,
        block: -4, hit: { adv: 5 }, ch: { adv: 10 },
        hitbox: { x: 26, w: 28, y: 66, h: 22 }, push: 12, juggle: 3.8, shake: 0.003,
        step: [4, 10, 1],
        anim: [[1, 'idle'], [9, 'hk_c'], [13, 'hk_x'], [16, 'hk_x'], [24, 'hk_c'], [34, 'idle']]
      },
      bK: {
        ex: { text: 'LAUNCHES', hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Spinning Back Kick', label: 'REFLEX ANGLE', cmd: 'B+K', level: 'mid', strength: 'heavy', motion: 'kick', kick: true,
        startup: 16, active: 3, recovery: 22, damage: 16,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 26, w: 30, y: 40, h: 22 }, push: 18, juggle: 3.6, carry: 1.6, shake: 0.006,
        anim: [[1, 'idle'], [10, 'bk_c'], [16, 'bk_x'], [19, 'bk_x'], [29, 'bk_c'], [41, 'idle']]
      },
      low: {
        name: 'Low Front Kick', label: 'ACUTE LOW', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low', kick: true,
        startup: 15, active: 3, recovery: 19, damage: 9, crouching: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'low_c'], [15, 'low_x'], [18, 'low_x'], [28, 'low_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('OBTUSE SWEEP', { startup: 19, damage: 15, motion: 'sweep', kick: true }),
      heavy: {
        name: 'Spinning Hook Kick', label: 'HYPOTENUSE', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'roundhouse', kick: true, wallSplat: true,
        startup: 17, active: 3, recovery: 22, damage: 19,
        block: -6, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 30, w: 26, y: 54, h: 20 }, push: 24, juggle: 3.6, carry: 2, shake: 0.005,
        step: [9, 18, 1.8],
        anim: [[1, 'idle'], [11, 'hv_c'], [17, 'hv_x'], [20, 'hv_x'], [28, 'hv_r'], [41, 'idle']]
      },
      fH: {
        ex: { text: 'TWO HITS, KNOCKDOWN', multi: 1, hit: { knockdown: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Axe Kick', label: 'VERTEX DROP', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', kick: true, bound: true,
        startup: 20, active: 3, recovery: 20, damage: 17, guardDmg: 22,
        block: -7, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 28, w: 24, y: 30, h: 30 }, push: 14, juggle: 2.5, shake: 0.006,
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
        name: 'Counter Kick', label: 'REFLECTION', cmd: 'PARRY', level: 'mid', strength: 'heavy', motion: 'roundhouse',
        startup: 6, active: 3, recovery: 18, damage: 20,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 18, w: 36, y: 46, h: 32 }, push: 20, juggle: 3.5, carry: 1.6, shake: 0.007,
        anim: [[1, 'parry'], [6, 'reflect_x'], [9, 'reflect_x'], [26, 'idle']]
      },
      // Tangent Step: a spinning hook kick out of a sidestep (sidestep, then P). Tracks.
      ssP: {
        ex: { text: 'THREE KICKS', multi: 2 }, // enhanced (P+K during startup, 1 bar)
        name: 'Sidestep Kick', label: 'TANGENT STEP', cmd: 'SS, P', level: 'mid', strength: 'medium', motion: 'roundhouse', kick: true, tracks: true, keepZ: true,
        startup: 12, active: 3, recovery: 16, damage: 15,
        block: -3, hit: { adv: 6 }, ch: { knockdown: true },
        hitbox: { x: 18, w: 30, y: 52, h: 24 }, push: 14, juggle: 3.6, shake: 0.004,
        anim: [[1, 'sidestep'], [7, 'tangent_c'], [12, 'tangent_x'], [15, 'tangent_x'], [31, 'idle']]
      },
      ssK: {
        name: 'Sidestep Low', label: 'SECANT SWEEP', cmd: 'SS, K', level: 'low', strength: 'medium', motion: 'sweep', kick: true, tracks: true, crouching: true, keepZ: true,
        startup: 15, active: 3, recovery: 22, damage: 12,
        block: -13, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 28, w: 24, y: 0, h: 14 }, push: 8, juggle: 2.5, shake: 0.003,
        anim: [[1, 'sidestep'], [9, 'sweep_c'], [15, 'secant_x'], [18, 'secant_x'], [30, 'sweep_c'], [40, 'crouch']]
      },
      launcher: {
        name: 'Flip Kick', label: 'ARC LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher', kick: true,
        startup: 14, active: 4, recovery: 24, damage: 15,
        block: -16, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 10, w: 28, y: 36, h: 76 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 14, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 16, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [8, 'flip_c'], [14, 'flip_x'], [18, 'flip_x'], [30, 'flip_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['TANGENT JAB', 'CHORD KICK', 'VERTEX SPIKE']),
    FG.kit.throws('TRANSFORMATION', 'ROTATION', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'RIGHT TRIANGLE', difficulty: 'easy', notation: 'P, K', plan: { 0: 'P', 11: 'K' }, hits: ['jab', 'jabK'] },
      { name: 'KICK CHAIN', difficulty: 'easy', notation: 'K, F+K, B+K', plan: { 0: 'K', 14: 'F+K', 29: 'B+K' }, hits: ['mid', 'fK', 'bK'] },
      { name: 'ARC JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 40: 'P', 52: 'P', 59: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'FULL CIRCLE', difficulty: 'medium', notation: 'D+K, K, F+K, H', plan: { 0: 'D+K', 17: 'K', 31: 'F+K', 46: 'H' }, hits: ['low', 'mid', 'fK', 'heavy'] },
      { name: 'VERTEX SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 31: 'P', 36: 'K', 43: 'H', 77: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'DOUBLE VERTEX', difficulty: 'medium', meter: 1, notation: 'F+H, P+K', steps: ['F+H, P+K (1 BAR)', 'SECOND KICK'],
        plan: { 0: 'F+H', 3: 'P+K' }, hits: ['fHEX', 'fHEX'] },
      { name: 'CIRCLE THEOREM', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'idle'], [14, 'stand'], [30, 'bow'], [48, 'bow'], [62, 'stand'], [84, 'idle']],
    victory: [[1, 'stand'], [16, 'offer'], [40, 'offer2'], [64, 'offer'], [80, 'smile'], [100, 'offer']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    gestures: { sorry: [[1, 'idle'], [8, 'sorry'], [32, 'sorry'], [42, 'idle']] },
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I\'m sorry in advance. Really.',
        'I believe in you! Just... not right now.',
        'This won\'t be on the test, but it will hurt.'
      ],
      quips: ['Sorry! Sorry!', 'Oh no, are you okay?', 'That was a right angle.']
    },
    victoryLines: [
      "Don't worry, I curve fights too.",
      'That was acute attempt. Mine was just more right.',
      'Office hours are Tuesdays if you want to go over that.'
    ]
  });
})();
