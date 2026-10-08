// RAMOS — Grappler — Algebra 2 (matrices). A movement-based grappler, wrestler and
// luchador: suplexes, spinning throws and tackles, from a low wrestler's stance,
// long hair always swinging.
//
// Signature: CARDIO. He never slows down: the fastest walk and dash in the game,
// dashes that chain back to back, a guard that recovers twice as fast, and he can
// run for as long as he likes (dash, then keep holding forward). Out of a run:
// P tackle, K running knee, D+K slide, H leaping plancha, P+K a running command grab.
(function () {
  var P = FG.pose;
  var R = FG.rigger({ torso: 27, neck: 11, upper: 15, fore: 13, thigh: 24.5, shin: 25 });
  // Low and ready to shoot: hands out in front, open, ready to grab.
  var GF = { hand: [28, 54] }, GB = { hand: [22, 50] };
  var stance = R({ hip: [2, 38], lean: 24, fa: GF, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } });
  var stand = R({ hip: [0, 46], lean: 0, fa: [-80, -86], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    knuckles: R({ hip: [0, 46], lean: 2, fa: { hand: [14, 70] }, ba: { hand: [10, 70] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    stretch: R({ hip: [0, 46], lean: -4, fa: [85, 95], ba: [95, 92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    hairflip: R({ hip: [0, 46], lean: 14, neck: 20, fa: [60, 140], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    hairflip2: R({ hip: [0, 46], lean: -14, neck: -24, fa: [80, 160], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    pump: R({ hip: [0, 46], lean: 0, fa: [70, 100], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    pump2: R({ hip: [0, 46], lean: 0, fa: [40, 100], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    kneel: [0, 26, 6, 50, 10, 60, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 12, 40, 14, 30, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],

    // Movement: explosive. A sprint cycle for his run.
    crouch: R({ hip: [2, 26], lean: 30, fa: { hand: [28, 40] }, ba: { hand: [22, 36] }, fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } }),
    squat: R({ hip: [2, 30], lean: 28, fa: { hand: [28, 44] }, ba: { hand: [22, 40] }, fl: { foot: [13, 0] }, bl: { foot: [-15, 0] } }),
    jump: R({ hip: [0, 44], lean: 10, fa: [30, 60], ba: [10, 40], fl: [-20, -110], bl: [-110, -70] }),
    dash: R({ hip: [6, 36], lean: 36, fa: { hand: [30, 46] }, ba: { hand: [20, 42] }, fl: { foot: [24, 3] }, bl: { foot: [-22, 6] } }),
    run1: R({ hip: [4, 40], lean: 26, fa: [-120, -60], ba: [20, 90], fl: [-50, -100], bl: [-120, -170] }),
    run2: R({ hip: [4, 40], lean: 26, fa: [20, 90], ba: [-120, -60], fl: [-110, -170], bl: [-60, -100] }),
    backdash: R({ hip: [-2, 40], lean: 10, fa: GF, ba: GB, fl: { foot: [12, 4] }, bl: { foot: [-20, 0] } }),
    sidestep: R({ hip: [2, 34], lean: 24, fa: GF, ba: GB, fl: { foot: [8, 0] }, bl: { foot: [-10, 0] } }),
    // Guard: forearms up, chin tucked, still low.
    block: R({ hip: [0, 37], lean: 20, neck: 8, fa: { hand: [20, 72] }, ba: { hand: [14, 68] }, fl: { foot: [13, 0] }, bl: { foot: [-18, 0] } }),
    cblock: R({ hip: [1, 26], lean: 28, fa: { hand: [22, 56] }, ba: { hand: [16, 52] }, fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } }),
    // Hit reactions: he rolls with it, springy.
    hit_high: R({ hip: [-3, 40], lean: -14, neck: -16, fa: [-60, 0], ba: [-80, -20], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    hit_mid: R({ hip: [-4, 36], lean: 34, neck: 10, fa: [-70, -40], ba: [-80, -50], fl: { foot: [12, 0] }, bl: { foot: [-17, 0] } }),
    hit_low: R({ hip: [-2, 36], lean: 18, fa: GF, ba: GB, fl: [-40, -110], bl: { foot: [-16, 0] } }),
    gbreak: R({ hip: [-4, 40], lean: -10, fa: [50, 110], ba: [70, 130], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    juggle: R({ hip: [0, 22], lean: -56, neck: -16, fa: [140, 180], ba: [110, 150], fl: [40, 0], bl: [10, -30] }),
    down: R({ hip: [0, 6], lean: -88, fa: [140, 170], ba: [-140, -170], fl: [20, -10], bl: [-5, 5] }),

    // Row Jab: a quick snap jab from the crouch.
    jab_c: R({ hip: [3, 38], lean: 24, fa: { hand: [24, 64] }, ba: GB, fl: { foot: [15, 0] }, bl: { foot: [-16, 0] } }),
    jab_x: R({ hip: [7, 38], lean: 26, fa: [6, 6], ba: GB, fl: { foot: [19, 0] }, bl: { foot: [-15, 0] } }),
    // Column Elbow: an elbow smash.
    elbow_c: R({ hip: [3, 38], lean: 18, fa: GF, ba: [-150, 130], fl: { foot: [16, 0] }, bl: { foot: [-15, 0] } }),
    elbow_x: R({ hip: [10, 38], lean: 30, fa: GF, ba: [10, 170], fl: { foot: [22, 0] }, bl: { foot: [-12, 0] } }),
    // Augmented Charge: a shoulder charge out of the dash.
    shoulder: R({ hip: [8, 34], lean: 40, neck: -12, fa: { hand: [22, 40] }, ba: { hand: [12, 36] }, fl: { foot: [26, 0] }, bl: { foot: [-18, 4] } }),
    // Pivot Knee: a jumping knee from the clinch.
    knee_c: R({ hip: [3, 38], lean: 16, fa: { hand: [28, 70] }, ba: { hand: [24, 66] }, fl: { foot: [14, 0] }, bl: [10, -80] }),
    knee_x: R({ hip: [6, 44], lean: 0, fa: { hand: [30, 72] }, ba: { hand: [26, 70] }, fl: { foot: [8, 3] }, bl: [50, -50] }),
    // Lower Triangular: a low shin trip.
    low_c: R({ hip: [2, 30], lean: 26, fa: GF, ba: GB, fl: [10, -90], bl: { foot: [-16, 0] } }),
    low_x: R({ hip: [4, 26], lean: 24, fa: { hand: [30, 40] }, ba: { hand: [22, 38] }, fl: { foot: [44, 6] }, bl: { foot: [-16, 0] } }),
    // Null Space Sweep: a diving crab scissors at the ankles.
    sweep_c: R({ hip: [2, 22], lean: 40, fa: { hand: [26, 2] }, ba: { hand: [16, 2] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    sweep_x: R({ hip: [6, 10], lean: -70, fa: { hand: [-12, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [48, 10] }, bl: { foot: [44, 2] } }),
    // Row Reduction: a lariat, arm out straight at neck height.
    hv_c: R({ hip: [0, 40], lean: 10, fa: GF, ba: [-150, -170], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    hv_x: R({ hip: [10, 42], lean: 14, fa: { hand: [16, 56] }, ba: [10, 6], fl: { foot: [24, 0] }, bl: { foot: [-12, 3] } }),
    hv_r: R({ hip: [6, 40], lean: 16, fa: GF, ba: { hand: [26, 60] }, fl: { foot: [20, 0] }, bl: { foot: [-14, 0] } }),
    // Scalar Slam: a leaping double axe handle.
    ham_c: R({ hip: [0, 48], lean: -10, fa: [110, 100], ba: [120, 110], fl: { foot: [12, 4] }, bl: [-80, -130] }),
    ham_x: R({ hip: [10, 40], lean: 30, fa: { hand: [34, 46] }, ba: { hand: [30, 48] }, fl: { foot: [24, 0] }, bl: { foot: [-12, 2] } }),
    // Transpose Toss: a European uppercut, forearm first.
    toss_c: R({ hip: [2, 28], lean: 26, fa: { hand: [22, 32] }, ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-16, 0] } }),
    toss_x: R({ hip: [6, 46], lean: 4, fa: [60, 110], ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-12, 3] } }),
    up_r: R({ hip: [4, 42], lean: 12, fa: [50, 100], ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    // Out of the run: a spear tackle, a running knee, a slide, a leaping plancha.
    spear: R({ hip: [10, 26], lean: 62, neck: -20, fa: { hand: [30, 18] }, ba: { hand: [24, 14] }, fl: { foot: [24, 0] }, bl: { foot: [-24, 8] } }),
    rknee: R({ hip: [8, 48], lean: -6, fa: [-140, -110], ba: [20, 70], fl: { foot: [0, 8] }, bl: [60, -40] }),
    slide: R({ hip: [4, 10], lean: -60, fa: [60, 100], ba: { hand: [-18, 2] }, fl: { foot: [46, 4] }, bl: [-10, -60] }),
    plancha_c: R({ hip: [4, 56], lean: 20, fa: [80, 100], ba: [90, 110], fl: [-80, -120], bl: [-110, -150] }),
    plancha: R({ hip: [8, 40], lean: 82, neck: -40, fa: [10, 0], ba: [-10, -20], fl: [170, 180], bl: [175, 185] }),
    // Gauss-Jordan: grab on the run and spin them down.
    rgrab: R({ hip: [8, 36], lean: 34, fa: { hand: [32, 52] }, ba: { hand: [30, 46] }, fl: { foot: [22, 0] }, bl: { foot: [-18, 3] } }),

    // Air: Pivot Drop (an elbow drop), Eigen Kick (a dropkick), Rank Spike (a leg drop).
    air_p: R({ hip: [0, 46], lean: 30, fa: [-30, 130], ba: GB, fl: [-20, -110], bl: [-110, -70] }),
    air_k: R({ hip: [0, 40], lean: -60, fa: [150, 170], ba: [160, 180], fl: [8, 4], bl: [2, -4] }),
    air_hc: R({ hip: [0, 48], lean: -20, fa: [60, 90], ba: [80, 110], fl: [60, 80], bl: [-100, -80] }),
    air_hx: R({ hip: [0, 40], lean: -50, fa: [150, 170], ba: [160, 180], fl: [-20, -20], bl: [-30, -60] }),

    // Throws: Matrix Lock (a German suplex), Determinant Slam (a spinning slam), Identity (a spinning throw).
    grab_c: R({ hip: [3, 38], lean: 22, fa: { hand: [28, 60] }, ba: { hand: [24, 56] }, fl: { foot: [16, 0] }, bl: { foot: [-15, 0] } }),
    grab_x: R({ hip: [6, 36], lean: 26, fa: { hand: [30, 56] }, ba: { hand: [28, 52] }, fl: { foot: [18, 0] }, bl: { foot: [-14, 0] } }),
    throw_lift: R({ hip: [-2, 40], lean: -30, neck: -10, fa: [100, 120], ba: [110, 130], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    throw_slam: R({ hip: [-6, 26], lean: -70, neck: -20, fa: [170, 190], ba: [175, 195], fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-4, 40], lean: -20, fa: [150, 180], ba: [140, 170], fl: { foot: [10, 0] }, bl: { foot: [-18, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [44, 6] }, bl: { foot: [40, 2] } }),
    wake_mid: R({ hip: [4, 42], lean: 14, fa: [60, 110], ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-12, 4] } })
  };

  poses.taunt = poses.stretch;

  FG.defineFighter({
    id: 'ramos', order: 7,
    homeStage: 'campus',
    glyphs: ['[A B]', 'DET=0', 'A*I=A', '[1 0]'], // math that flies off their big hits
    stringH: 'ROW REDUCTION', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0xd8283a, b: 0xffffff }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'CARDIO FINALE', input: 'F, D, F, P' },
    name: 'RAMOS', archetype: 'GRAPPLER', theme: 'MATRICES',
    style: 'WRESTLER', signatureMechanic: 'CARDIO',
    signatureText: 'he never slows down: the fastest walk and dash, chained dashes, a guard that recovers twice as fast, and a run he can keep up for as long as he likes (dash, then hold forward), with a tackle, a running knee, a slide, a plancha and a running command grab out of it',
    bio: 'FAST, EXPLOSIVE GRAPPLER WHO CLOSES DISTANCE QUICKLY. CONFIDENT AND FOCUSED.',
    signature: ['MATRIX LOCK', 'DETERMINANT SLAM', 'IDENTITY', 'TRANSPOSE TOSS'],
    scale: 1.02, health: 178,
    // Movement: the fastest in the game, in every direction.
    walkF: 2.8, walkB: 1.9, dashSpeed: 10.5, dashFrames: 14, backdashSpeed: 9.0,
    jumpVy: 9.6, weight: 0.96, react: 1.0,
    walk: { lean: 2, bob: 2.2, rate: 0.28 },
    dashAttackFrom: 5,
    // Cardio: chains dashes back to back, runs for as long as forward is held, and his
    // guard meter recovers twice as fast.
    dashChainFrom: 7, runSpeed: 7.4, guardRegenRate: 2,
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
    idleAnim: { breath: 1, bob: 1.6, sway: 1.6, rate: 0.14 },
    poses: poses,
    // How the CPU plays him: runs in and grabs.
    ai: { spacing: 26, pokes: ['K', 'D+K'], close: ['P+K', 'F+P+K', 'P', 'K'], aggro: 1.2, run: 0.55 },

    moves: FG.kit.moves({
      jab: {
        name: 'Snap Jab', label: 'ROW JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 28, y: 60, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Elbow Smash', label: 'COLUMN ELBOW', cmd: 'P,P', level: 'high', strength: 'medium', motion: 'hook',
        startup: 10, active: 3, recovery: 16, damage: 11,
        block: -2, hit: { adv: 6 }, ch: { adv: 10 },
        hitbox: { x: 14, w: 32, y: 58, h: 24 }, push: 6, juggle: 3.4, shake: 0.002,
        anim: [[1, 'jab_x'], [6, 'elbow_c'], [10, 'elbow_x'], [13, 'elbow_x'], [28, 'idle']]
      },
      // Out of his fast dash: a shoulder charge that knocks down.
      dashP: {
        ex: { text: 'ARMORED, LAUNCHES', armor: { hits: 1 }, hit: { launch: 6.5 } }, // enhanced (P+K during startup, 1 bar)
        name: 'Shoulder Charge', label: 'AUGMENTED CHARGE', cmd: 'F,F+P', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 13, active: 4, recovery: 20, damage: 17,
        block: -9, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 10, w: 30, y: 36, h: 32 }, push: 22, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [1, 13, 3.4],
        anim: [[1, 'dash'], [8, 'shoulder'], [13, 'shoulder'], [17, 'shoulder'], [36, 'idle']]
      },
      mid: {
        name: 'Jumping Knee', label: 'PIVOT KNEE', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 17, damage: 13,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 14, w: 26, y: 42, h: 26 }, push: 8, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'knee_c'], [13, 'knee_x'], [16, 'knee_x'], [32, 'idle']]
      },
      low: {
        name: 'Shin Trip', label: 'LOWER TRIANGULAR', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low', crouching: true, otg: true,
        startup: 15, active: 3, recovery: 20, damage: 10,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 24, y: 0, h: 16 }, push: 8, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'low_c'], [15, 'low_x'], [18, 'low_x'], [28, 'low_c'], [37, 'crouch']]
      },
      sweep: FG.kit.sweep('NULL SPACE SWEEP', { motion: 'sweep' }),
      heavy: {
        name: 'Lariat', label: 'ROW REDUCTION', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 18, active: 3, recovery: 21, damage: 20,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 20, w: 28, y: 50, h: 24 }, push: 24, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 2],
        anim: [[1, 'idle'], [12, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [29, 'hv_r'], [41, 'idle']]
      },
      fH: {
        name: 'Double Axe Handle', label: 'SCALAR SLAM', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 28, w: 26, y: 40, h: 26 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.4],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'European Uppercut', label: 'TRANSPOSE TOSS', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 23, damage: 17,
        block: -15, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 8, w: 28, y: 26, h: 80 }, push: 6, juggle: 5.5, carry: 0.35, shake: 0.008,
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
      },
      // Out of a run (dash, then hold forward).
      runP: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Spear Tackle', label: 'ROW OPERATION', cmd: 'RUN, P', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 10, active: 4, recovery: 22, damage: 16,
        block: -8, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 8, w: 30, y: 20, h: 40 }, push: 24, juggle: 3.6, carry: 2.2, shake: 0.008,
        step: [1, 12, 4],
        anim: [[1, 'run1'], [6, 'spear'], [10, 'spear'], [14, 'spear'], [36, 'idle']]
      },
      runK: {
        ex: { text: 'HIGHER LAUNCH', hit: { launch: 8.4 } }, // enhanced (P+K during startup, 1 bar)
        name: 'Running Knee', label: 'ELEMENTARY KNEE', cmd: 'RUN, K', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 9, active: 3, recovery: 22, damage: 15,
        block: -12, hit: { launch: 7 }, ch: { launch: 7.6 },
        hitbox: { x: 12, w: 26, y: 44, h: 32 }, push: 6, juggle: 5, carry: 0.5, shake: 0.008,
        step: [1, 9, 3.6],
        cancels: [{ btn: 'up', into: 'jump', from: 11, to: 22, onHit: true }],
        anim: [[1, 'run2'], [5, 'knee_c'], [9, 'rknee'], [12, 'rknee'], [22, 'up_r'], [34, 'idle']]
      },
      runDK: {
        name: 'Baseball Slide', label: 'ZERO VECTOR', cmd: 'RUN, D+K', level: 'low', strength: 'heavy', motion: 'sweep', crouching: true,
        startup: 10, active: 6, recovery: 24, damage: 13,
        block: -16, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 18, w: 34, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.004,
        step: [1, 18, 4.6],
        anim: [[1, 'crouch'], [6, 'sweep_c'], [10, 'slide'], [16, 'slide'], [28, 'sweep_c'], [40, 'crouch']]
      },
      runH: {
        name: 'Plancha', label: 'MATRIX PLANCHA', cmd: 'RUN, H', level: 'mid', strength: 'heavy', motion: 'overhead', guardDmg: 26,
        startup: 16, active: 4, recovery: 26, damage: 22,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 34, y: 20, h: 40 }, push: 18, juggle: 3, shake: 0.01,
        step: [1, 16, 4.2],
        anim: [[1, 'run1'], [8, 'plancha_c'], [16, 'plancha'], [20, 'plancha'], [32, 'crouch'], [46, 'idle']]
      },
      // Gauss-Jordan: P+K on the run. A running command grab: no break, and it takes crouchers.
      runGrab: {
        name: 'Running Grab', label: 'GAUSS-JORDAN', cmd: 'RUN, P+K', level: 'mid', strength: 'heavy', throw: true, grabsCrouch: true, breakBtn: null,
        startup: 8, active: 4, recovery: 30, damage: 30,
        hitbox: { x: 8, w: 30, y: 20, h: 60 }, push: 0, juggle: 0, shake: 0.011,
        step: [1, 10, 3.4],
        anim: [[1, 'run1'], [5, 'rgrab'], [8, 'grab_x'], [12, 'grab_x'], [42, 'idle']]
      }
    },
    FG.kit.air(['PIVOT DROP', 'EIGEN KICK', 'RANK SPIKE']),
    // Matrix Lock has a short break window (8 frames instead of 15).
    FG.kit.throws('MATRIX LOCK', 'DETERMINANT SLAM', { throw: { damage: 34, breakWindow: 8 }, throwB: { damage: 38, shake: 0.012 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'ROW AND COLUMN', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 15: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'TRANSPOSE JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 40: 'P', 57: 'P', 70: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'RANK SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 16: 'UP', 31: 'P', 36: 'K', 44: 'H', 77: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'IDENTITY STOMP', difficulty: 'medium', notation: 'F+P+K, D+K ON THE GROUND', plan: { 0: 'F+P+K', 66: 'D+K' }, hits: ['cmdGrab', 'low'] },
      // Cardio: dash, keep holding forward to run, then the running knee and a juggle.
      { name: 'CARDIO', difficulty: 'medium', notation: 'RUN, K, P, P, H', dist: 200, hold: [[2, 32, 'F']],
        plan: { 0: 'F', 2: 'F', 24: 'K', 55: 'P', 66: 'P', 75: 'H' }, hits: ['runK', 'jab', 'jab2', 'jabH'] }
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
