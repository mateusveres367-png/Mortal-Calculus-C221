// LEE — Rushdown — Sequences. Muay Thai and boxing: fast jabs, hooks, elbows and
// knees, and constant forward pressure from a low, hunched, aggressive stance.
// Short range, but fast.
//
// Signature: ARITHMETIC SEQUENCE. His strings get faster with every hit, and once
// an attack connects (hit or block) he can dash-cancel its recovery (forward,
// forward) to keep the pressure on, once per string.
(function () {
  // Compact: short limbs, a hunched torso.
  var R = FG.rigger({ torso: 26, neck: 11, upper: 14.5, fore: 12.5, thigh: 23, shin: 23.5 });
  // Peekaboo: gloves at the forehead, chin tucked, knees bent.
  var GF = { hand: [17, 76] }, GB = { hand: [11, 74] };
  var stance = R({ hip: [2, 40], lean: 18, neck: 8, fa: GF, ba: GB, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } });
  var stand = R({ hip: [0, 46], lean: -2, fa: [-80, -70], ba: [-95, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    glasses: R({ hip: [2, 41], lean: 12, fa: [40, 130], ba: GB, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }),
    glasses2: R({ hip: [0, 46], lean: 0, fa: [40, 135], ba: [-95, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    folded: R({ hip: [0, 46], lean: -2, fa: { hand: [-2, 66] }, ba: { hand: [12, 68] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    shrug: R({ hip: [0, 46], lean: -2, neck: -6, fa: [-30, 50], ba: [-150, 130], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    hands: [0, 26, 12, 30, 22, 34, 16, 20, 18, 4, 10, 20, 12, 4, 4, 8, -10, 2, -2, 8, -14, 2],
    hands2: [0, 26, 12, 31, 22, 36, 16, 20, 18, 4, 10, 20, 12, 4, 4, 8, -10, 2, -2, 8, -14, 2],

    // Movement: always low and coming forward.
    crouch: R({ hip: [2, 26], lean: 26, neck: 6, fa: { hand: [20, 56] }, ba: { hand: [14, 54] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    squat: R({ hip: [2, 32], lean: 22, fa: { hand: [19, 62] }, ba: { hand: [13, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    jump: R({ hip: [0, 44], lean: 14, fa: GF, ba: GB, fl: [-30, -110], bl: [-120, -70] }),
    dash: R({ hip: [6, 36], lean: 30, neck: 6, fa: { hand: [22, 66] }, ba: { hand: [16, 64] }, fl: { foot: [22, 0] }, bl: { foot: [-18, 6] } }),
    backdash: R({ hip: [-2, 40], lean: 8, fa: GF, ba: GB, fl: { foot: [12, 4] }, bl: { foot: [-16, 0] } }),
    sidestep: R({ hip: [2, 34], lean: 22, fa: GF, ba: GB, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    // Guard: a high, tight shell; elbows in.
    block: R({ hip: [0, 39], lean: 22, neck: 10, fa: { hand: [15, 74] }, ba: { hand: [10, 72] }, fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    cblock: R({ hip: [1, 26], lean: 26, fa: { hand: [17, 56] }, ba: { hand: [12, 54] }, fl: { foot: [13, 0] }, bl: { foot: [-14, 0] } }),
    // Hit reactions: short and compact; he shells up and keeps his feet.
    hit_high: R({ hip: [-2, 42], lean: -6, neck: -14, fa: { hand: [12, 70] }, ba: [-110, -60], fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-3, 38], lean: 34, neck: 10, fa: { hand: [12, 42] }, ba: { hand: [8, 44] }, fl: { foot: [10, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-1, 36], lean: 18, fa: GF, ba: GB, fl: [-50, -110], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-3, 42], lean: -10, fa: [40, 80], ba: [60, 100], fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -50, neck: -20, fa: [60, 110], ba: [90, 140], fl: [30, -40], bl: [0, -60] }),
    down: R({ hip: [0, 6], lean: -84, fa: [120, 160], ba: [-150, -110], fl: [20, -20], bl: [-10, 10] }),

    // First Term: a short, snapping jab.
    jab_c: R({ hip: [3, 40], lean: 20, neck: 8, fa: { hand: [20, 72] }, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-13, 0] } }),
    jab_x: R({ hip: [7, 40], lean: 24, neck: 6, fa: [8, 6], ba: { hand: [14, 72] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    // Second Term: the straight right.
    cross_c: R({ hip: [4, 40], lean: 20, fa: { hand: [22, 72] }, ba: { hand: [10, 70] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    cross_x: R({ hip: [9, 39], lean: 28, fa: { hand: [18, 70] }, ba: [6, 4], fl: { foot: [20, 0] }, bl: { foot: [-10, 1] } }),
    // Third Term: a dipping hook to the body.
    body_c: R({ hip: [3, 36], lean: 24, fa: { hand: [12, 62] }, ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    body_x: R({ hip: [7, 34], lean: 30, fa: [-10, 40], ba: { hand: [14, 66] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    // Nth Term: a slicing elbow, point first.
    elbow_c: R({ hip: [3, 38], lean: 14, fa: GF, ba: [-150, 120], fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    elbow_x: R({ hip: [11, 38], lean: 30, fa: { hand: [16, 70] }, ba: [20, 160], fl: { foot: [22, 0] }, bl: { foot: [-8, 1] } }),
    // Divergent Low: a Muay Thai low kick to the thigh.
    lowk_c: R({ hip: [2, 38], lean: 14, fa: GF, ba: GB, fl: { foot: [12, 0] }, bl: [-30, -60] }),
    lowk_x: R({ hip: [4, 38], lean: 4, fa: { hand: [18, 66] }, ba: [-150, -110], fl: { foot: [10, 0] }, bl: { foot: [44, 14] } }),
    // Recursive Rush: lunging in behind a straight, the back leg trailing.
    rush_c: R({ hip: [2, 38], lean: 22, fa: { hand: [20, 70] }, ba: GB, fl: { foot: [16, 2] }, bl: { foot: [-14, 0] } }),
    rush_x: R({ hip: [14, 34], lean: 36, fa: [2, -2], ba: { hand: [24, 62] }, fl: { foot: [30, 0] }, bl: { foot: [-12, 4] } }),
    // Common Difference: a straight knee, pulling them in.
    knee_c: R({ hip: [3, 40], lean: 10, fa: { hand: [22, 76] }, ba: { hand: [18, 74] }, fl: { foot: [12, 0] }, bl: [10, -80] }),
    knee_x: R({ hip: [5, 42], lean: -8, fa: { hand: [26, 74] }, ba: { hand: [22, 72] }, fl: { foot: [8, 0] }, bl: [45, -60] }),
    // Geometric Low: a push kick to the knee, from a crouch.
    low_c: R({ hip: [2, 28], lean: 22, fa: { hand: [18, 58] }, ba: { hand: [12, 56] }, fl: [20, -90], bl: { foot: [-14, 0] } }),
    low_x: R({ hip: [0, 28], lean: 14, fa: { hand: [18, 58] }, ba: { hand: [12, 56] }, fl: { foot: [44, 8] }, bl: { foot: [-14, 0] } }),
    // Divergent Sweep: kicking the standing leg out.
    sweep_c: R({ hip: [2, 26], lean: 24, fa: { hand: [20, 54] }, ba: { hand: [14, 52] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    sweep_x: R({ hip: [2, 22], lean: 18, fa: { hand: [22, 50] }, ba: [-140, -160], fl: { foot: [6, 0] }, bl: { foot: [46, 3] } }),
    // Partial Sum: a liver shot, dipping under.
    hv_c: R({ hip: [3, 34], lean: 30, neck: 6, fa: GF, ba: { hand: [2, 56] }, fl: { foot: [16, 0] }, bl: { foot: [-13, 0] } }),
    hv_x: R({ hip: [10, 32], lean: 36, fa: { hand: [16, 66] }, ba: [-20, 20], fl: { foot: [22, 0] }, bl: { foot: [-10, 2] } }),
    hv_r: R({ hip: [6, 36], lean: 24, fa: GF, ba: { hand: [16, 62] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    // Induction Step: a hopping elbow straight down.
    ham_c: R({ hip: [2, 46], lean: 4, fa: GF, ba: [100, 160], fl: { foot: [12, 4] }, bl: [-60, -120] }),
    ham_x: R({ hip: [12, 40], lean: 34, fa: { hand: [18, 66] }, ba: [30, -150], fl: { foot: [24, 0] }, bl: { foot: [-10, 2] } }),
    // Fibonacci Uppercut: from a deep crouch, straight up.
    fib_c: R({ hip: [2, 24], lean: 30, fa: { hand: [14, 40] }, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    fib_x: R({ hip: [6, 46], lean: -4, fa: [60, 95], ba: { hand: [12, 70] }, fl: { foot: [16, 0] }, bl: { foot: [-10, 3] } }),
    fib_r: R({ hip: [4, 42], lean: 6, fa: [50, 100], ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),

    // Air: First Difference (a hook), Second Difference (a flying knee), Summation Spike (a flying elbow).
    air_p: R({ hip: [0, 46], lean: 20, fa: [-10, 50], ba: GB, fl: [-30, -110], bl: [-120, -70] }),
    air_k: R({ hip: [0, 46], lean: -4, fa: { hand: [20, 72] }, ba: [-150, -110], fl: [40, -50], bl: [-110, -60] }),
    air_hc: R({ hip: [0, 48], lean: -4, fa: GF, ba: [110, 170], fl: [-30, -110], bl: [-120, -70] }),
    air_hx: R({ hip: [0, 46], lean: 30, fa: GF, ba: [-20, 160], fl: [-30, -110], bl: [-120, -70] }),

    // Series Expansion: the clinch and a run of knees. Telescoping Toss: turn and dump.
    grab_c: R({ hip: [3, 40], lean: 20, fa: { hand: [24, 76] }, ba: { hand: [20, 74] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [5, 40], lean: 24, fa: { hand: [28, 74] }, ba: { hand: [26, 72] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [5, 42], lean: 18, fa: { hand: [26, 72] }, ba: { hand: [24, 70] }, fl: { foot: [10, 0] }, bl: [50, -50] }),
    throw_slam: R({ hip: [8, 36], lean: 34, fa: { hand: [30, 40] }, ba: { hand: [26, 42] }, fl: { foot: [20, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 40], lean: -14, fa: [150, 180], ba: [140, 170], fl: { foot: [8, 0] }, bl: { foot: [-16, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -56, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [40, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [4, 42], lean: 14, fa: [60, 95], ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-12, 4] } })
  };

  poses.taunt = poses.glasses2;

  FG.defineFighter({
    id: 'lee', order: 4,
    homeStage: 'hallway',
    glyphs: ['A(N)=A+(N-1)D', '1,1,2,3,5', 'SUM', '...'], // math that flies off their big hits
    stringH: 'NEXT TERM', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x111111, b: 0x39ff5a }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'INFINITE SERIES', input: 'F, B, F, P' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'GEOMETRIC SERIES', text: 'every hit twice as fast as the last until he blurs, r > 1: DIVERGES, then a chalk-dust explosion', from: 'fP', len: 220, hits: [24, 56, 72, 80, 84, 86, 87, 150], weights: [1, 1, 1, 1, 1, 1, 1, 5], end: { gap: 110, launch: 8, height: 50 } },
    name: 'LEE', archetype: 'RUSHDOWN', theme: 'SEQUENCES',
    style: 'MUAY THAI BOXER', signatureMechanic: 'ARITHMETIC SEQUENCE',
    signatureText: 'his strings get faster with every hit, and once an attack connects (hit or block) forward, forward dash-cancels its recovery to keep the pressure on (once per string)',
    bio: 'SARCASTIC AND FUNNY. TAUNTS MID-COMBO. RELENTLESS PRESSURE.',
    signature: ['ARITHMETIC SEQUENCE', 'RECURSIVE RUSH', 'FIBONACCI UPPERCUT', 'SERIES EXPANSION'],
    scale: 1.0, health: 165,
    // Movement: walks forward fast and backward slowly; a quick dash he can attack out of early.
    walkF: 2.6, walkB: 1.5, dashSpeed: 9.4, dashFrames: 15, dashAttackFrom: 4, backdashSpeed: 7.6,
    jumpVy: 9.0, weight: 0.97, react: 0.9,
    walk: { lean: 3, bob: 1.6, rate: 0.3 },
    dashCancel: true,
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
    idleAnim: { breath: 0.8, bob: 2.2, sway: 1.5, rate: 0.2 }, // bobbing and weaving
    poses: poses,
    // How the CPU plays him: rushes in and never lets up.
    ai: { spacing: 30, pokes: ['F+P', 'P'], close: ['P', 'F+P', 'K', 'D+K', 'P+K'], aggro: 1.35, dashIn: 0.7, dashCancel: 0.6 },

    moves: FG.kit.moves({
      // Arithmetic Sequence: P, P, P, then P or K. Each hit is faster than the last.
      jab: {
        name: 'Jab', label: 'FIRST TERM', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 12, damage: 6,
        block: 2, hit: { adv: 9 }, ch: { adv: 11 },
        hitbox: { x: 20, w: 26, y: 62, h: 16 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'seq2', from: 10, to: 21, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [23, 'idle']]
      },
      seq2: {
        name: 'Cross', label: 'SECOND TERM', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 9, active: 2, recovery: 14, damage: 7,
        block: -1, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 28, y: 60, h: 18 }, push: 6, juggle: 3.3,
        cancels: [{ btn: 'p', into: 'seq3', from: 9, to: 21, onContact: true }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [9, 'cross_x'], [11, 'cross_x'], [24, 'idle']]
      },
      seq3: {
        name: 'Body Hook', label: 'THIRD TERM', cmd: 'P,P,P', level: 'mid', strength: 'medium', motion: 'hook',
        startup: 8, active: 2, recovery: 16, damage: 8,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 28, y: 44, h: 20 }, push: 7, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'p', into: 'seqP', from: 8, to: 20, onContact: true }, { btn: 'k', into: 'seqK', from: 8, to: 20, onContact: true }],
        anim: [[1, 'cross_x'], [5, 'body_c'], [8, 'body_x'], [10, 'body_x'], [25, 'idle']]
      },
      seqP: {
        ex: { text: 'THREE HITS, WALL SPLAT', multi: 2, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Elbow', label: 'NTH TERM', cmd: 'P,P,P,P', level: 'mid', strength: 'heavy', motion: 'hook',
        startup: 7, active: 3, recovery: 22, damage: 14,
        block: -12, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 26, y: 54, h: 22 }, push: 18, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'body_x'], [4, 'elbow_c'], [7, 'elbow_x'], [10, 'elbow_x'], [31, 'idle']]
      },
      seqK: {
        name: 'Low Kick', label: 'DIVERGENT LOW', cmd: 'P,P,P,K', level: 'low', strength: 'medium', motion: 'low', crouching: true,
        startup: 7, active: 3, recovery: 22, damage: 11,
        block: -14, hit: { adv: 1 }, ch: { knockdown: true },
        hitbox: { x: 24, w: 26, y: 0, h: 18 }, push: 10, juggle: 2.5, shake: 0.003,
        anim: [[1, 'body_x'], [4, 'lowk_c'], [7, 'lowk_x'], [10, 'lowk_x'], [31, 'crouch']]
      },
      // Recursive Rush: forward + P lunges in; press P again on hit to repeat it (up to 3).
      fP: {
        ex: { text: 'TWO HITS', multi: 1 }, // enhanced (P+K during startup, 1 bar)
        name: 'Rush', label: 'RECURSIVE RUSH', cmd: 'F+P', level: 'mid', strength: 'medium', motion: 'lunge',
        startup: 13, active: 3, recovery: 15, damage: 10,
        block: 1, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 28, y: 52, h: 20 }, push: 10, juggle: 3.4, shake: 0.003,
        step: [5, 14, 2.6],
        cancels: [{ btn: 'p', into: 'fP', from: 13, to: 24, onHit: true, max: 2 }],
        anim: [[1, 'idle'], [8, 'rush_c'], [13, 'rush_x'], [16, 'rush_x'], [30, 'idle']]
      },
      mid: {
        name: 'Knee', label: 'COMMON DIFFERENCE', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 12, active: 3, recovery: 17, damage: 12,
        block: -3, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 14, w: 26, y: 44, h: 24 }, push: 10, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'knee_c'], [12, 'knee_x'], [15, 'knee_x'], [31, 'idle']]
      },
      low: {
        name: 'Low Push Kick', label: 'GEOMETRIC LOW', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low',
        startup: 15, active: 3, recovery: 19, damage: 9, crouching: true, otg: true,
        block: -10, hit: { adv: 1 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'low_c'], [15, 'low_x'], [18, 'low_x'], [28, 'low_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('DIVERGENT SWEEP', { startup: 19, motion: 'sweep' }),
      heavy: {
        ex: { text: 'LAUNCHES', hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Liver Shot', label: 'PARTIAL SUM', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'body', wallSplat: true,
        startup: 17, active: 3, recovery: 18, damage: 18,
        block: 2, hit: { adv: 7 }, ch: { launch: 5.8 },
        hitbox: { x: 26, w: 26, y: 42, h: 20 }, push: 22, juggle: 3.6, carry: 2, shake: 0.005,
        step: [9, 17, 2],
        anim: [[1, 'idle'], [11, 'hv_c'], [17, 'hv_x'], [20, 'hv_x'], [28, 'hv_r'], [37, 'idle']]
      },
      fH: {
        name: 'Hopping Elbow', label: 'INDUCTION STEP', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 20, active: 3, recovery: 20, damage: 17, guardDmg: 22,
        block: -5, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 26, w: 26, y: 44, h: 26 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [10, 20, 1.6],
        anim: [[1, 'idle'], [13, 'ham_c'], [20, 'ham_x'], [23, 'ham_x'], [32, 'hv_r'], [43, 'idle']]
      },
      launcher: {
        name: 'Uppercut', label: 'FIBONACCI UPPERCUT', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 14, active: 4, recovery: 22, damage: 15,
        block: -14, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 14, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 16, to: 27, onHit: true }],
        anim: [[1, 'crouch'], [9, 'fib_c'], [14, 'fib_x'], [18, 'fib_x'], [27, 'fib_r'], [39, 'idle']]
      }
    },
    FG.kit.air(['FIRST DIFFERENCE', 'SECOND DIFFERENCE', 'SUMMATION SPIKE']),
    FG.kit.throws('SERIES EXPANSION', 'TELESCOPING TOSS', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'ARITHMETIC SEQUENCE', difficulty: 'easy', notation: 'P, P, P, P', plan: { 0: 'P', 11: 'P', 22: 'P', 32: 'P' }, hits: ['jab', 'seq2', 'seq3', 'seqP'] },
      { name: 'RECURSIVE RUSH', difficulty: 'easy', notation: 'F+P, P, P', plan: { 0: 'F+P', 13: 'P', 26: 'P' }, hits: ['fP', 'fP', 'fP'] },
      { name: 'PARTIAL SUMS', difficulty: 'medium', notation: 'P, P, F, F, P, P, P', plan: { 0: 'P', 11: 'P', 21: 'F', 23: 'F', 28: 'P', 39: 'P', 50: 'P' }, hits: ['jab', 'seq2', 'jab', 'seq2', 'seq3'] },
      { name: 'FIBONACCI JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 38: 'P', 50: 'P', 59: 'H' }, hits: ['launcher', 'jab', 'seq2', 'jabH'] },
      { name: 'FIBONACCI SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 16: 'UP', 31: 'P', 40: 'K', 50: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'PARTIAL SUM PLUS', difficulty: 'medium', meter: 1, notation: 'H, P+K, P, P, H', steps: ['H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'H', 3: 'P+K', 41: 'P', 57: 'P', 63: 'H' }, hits: ['heavyEX', 'jab', 'seq2', 'jabH'] },
      { name: 'GEOMETRIC SERIES', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
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
