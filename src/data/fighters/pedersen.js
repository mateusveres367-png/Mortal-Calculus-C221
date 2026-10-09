// PEDERSEN — Power — Geometry & Math Analysis. The cover fighter. A punch-based
// power brawler: huge haymakers, hammer fists, a shoulder charge, ground stomps
// and a body splash. A wide stance with his tie loosened; a slow walk, a short
// dash, and he's heavy (he falls fast in juggles and barely flinches).
//
// Signature: EXPONENTIAL ARMOR. His heavy attacks (Base Hook, the Exponential
// Haymaker, Order of Magnitude) absorb one hit during their windup and keep going.
// Charging Order of Magnitude all the way makes it absorb two.
(function () {
  var P = FG.pose;
  // Big: a long torso and heavy arms.
  var R = FG.rigger({ torso: 30, neck: 12, upper: 16, fore: 14, thigh: 24, shin: 24.5 });
  // Wide and planted, fists up and out like a brawler.
  var GF = { hand: [24, 72] }, GB = { hand: [14, 68] };
  var stance = R({ hip: [0, 42], lean: 6, fa: GF, ba: GB, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } });
  var stand = R({ hip: [0, 47], lean: 0, fa: [-80, -86], ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    tie: P(stand, { fe: [12, 72], fh: [6, 80], be: [-2, 58], bh: [2, 48] }),     // hand at the knot
    tie2: P(stand, { fe: [12, 70], fh: [8, 76], be: [-2, 58], bh: [2, 48], head: [2, 87] }),
    wave: P(stand, { fe: [16, 78], fh: [22, 94] }),
    calm: P(stand, { head: [5, 85] }),
    // Horsepower (the ultimate): sunglasses on, then leaning out of the driver's window.
    shades_on: R({ hip: [0, 47], lean: -2, neck: -6, fa: { hand: [12, 86], bend: -1 }, ba: [-96, -92], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    lean_out: R({ hip: [0, 24], lean: 34, neck: -10, fa: [-14, -100], ba: { hand: [22, 40] }, fl: [0, -90], bl: [6, -86] }),
    // Title screen: leaning back on the hood of his car, arms crossed, ankles crossed;
    // now and then a puff on the cigar.
    lean: P('idle', { hip: [-5, 40], chest: [-8, 66], head: [-8, 78], fe: [0, 57], fh: [-12, 60], be: [-15, 58], bh: [-3, 61], fk: [4, 21], ff: [10, 0], bk: [2, 20], bf: [12, 1] }),
    lean_puff: P('idle', { hip: [-5, 40], chest: [-8, 66], head: [-7, 79], fe: [2, 63], fh: [-1, 75], be: [-15, 58], bh: [-3, 61], fk: [4, 21], ff: [10, 0], bk: [2, 20], bf: [12, 1] }),
    sit: [0, 12, -4, 38, -2, 50, 6, 30, 14, 22, -12, 28, -18, 16, 18, 26, 32, 2, 12, 22, 26, 0],
    sit2: [0, 12, -5, 37, -4, 48, 6, 30, 14, 22, -12, 28, -18, 16, 18, 26, 32, 2, 12, 22, 26, 0],

    // Movement: heavy, planted, lumbering.
    crouch: R({ hip: [0, 28], lean: 14, fa: { hand: [24, 56] }, ba: { hand: [14, 52] }, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    squat: R({ hip: [0, 34], lean: 10, fa: { hand: [24, 62] }, ba: { hand: [14, 58] }, fl: { foot: [16, 0] }, bl: { foot: [-18, 0] } }),
    jump: R({ hip: [0, 44], lean: 4, fa: [60, 100], ba: [80, 110], fl: [-40, -90], bl: [-100, -80] }),
    dash: R({ hip: [4, 40], lean: 18, fa: { hand: [26, 66] }, ba: { hand: [16, 62] }, fl: { foot: [24, 0] }, bl: { foot: [-18, 4] } }),
    backdash: R({ hip: [-4, 43], lean: -2, fa: GF, ba: GB, fl: { foot: [14, 3] }, bl: { foot: [-24, 0] } }),
    sidestep: R({ hip: [0, 40], lean: 6, fa: GF, ba: GB, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    // Guard: forearms stacked in front of the face.
    block: R({ hip: [-1, 42], lean: 2, fa: { hand: [18, 86] }, ba: { hand: [16, 80] }, fl: { foot: [18, 0] }, bl: { foot: [-21, 0] } }),
    cblock: R({ hip: [0, 28], lean: 12, fa: { hand: [20, 64] }, ba: { hand: [16, 58] }, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    // Hit reactions: he barely moves.
    hit_high: R({ hip: [-2, 43], lean: -4, neck: -10, fa: { hand: [22, 70] }, ba: { hand: [12, 66] }, fl: { foot: [18, 0] }, bl: { foot: [-21, 0] } }),
    hit_mid: R({ hip: [-2, 41], lean: 14, neck: 4, fa: { hand: [20, 60] }, ba: { hand: [12, 58] }, fl: { foot: [18, 0] }, bl: { foot: [-21, 0] } }),
    hit_low: R({ hip: [-1, 40], lean: 8, fa: GF, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-20, 0] } }),
    gbreak: R({ hip: [-3, 42], lean: -8, fa: [30, 70], ba: [10, 50], fl: { foot: [18, 0] }, bl: { foot: [-21, 0] } }),
    juggle: R({ hip: [0, 22], lean: -70, neck: -8, fa: [60, 30], ba: [40, 10], fl: [20, -30], bl: [0, -40] }),
    down: R({ hip: [0, 6], lean: -88, fa: [170, 150], ba: [-150, -160], fl: [10, 0], bl: [-10, 0] }),

    // Power Jab: a heavy, shoving jab.
    jab_c: R({ hip: [1, 42], lean: 8, fa: { hand: [22, 74] }, ba: GB, fl: { foot: [18, 0] }, bl: { foot: [-19, 0] } }),
    jab_x: R({ hip: [6, 42], lean: 12, fa: [2, 2], ba: GB, fl: { foot: [22, 0] }, bl: { foot: [-18, 0] } }),
    // Squared: a clubbing hammer fist, over the top.
    cross_c: R({ hip: [-1, 42], lean: -4, fa: GF, ba: [100, 140], fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    cross_x: R({ hip: [8, 40], lean: 18, fa: { hand: [18, 62] }, ba: [20, -40], fl: { foot: [22, 0] }, bl: { foot: [-18, 0] } }),
    // Right Angle Elbow: the forearm square to the upper arm, driven in at chest height.
    elbow_c: R({ hip: [-2, 42], lean: -6, fa: [-20, 100], ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-21, 0] } }),
    elbow_x: R({ hip: [10, 41], lean: 16, fa: [8, 98], ba: GB, fl: { foot: [26, 0] }, bl: { foot: [-16, 0] } }),
    // Common Log: a dropping shoulder charge out of a dash.
    shoulder: R({ hip: [8, 36], lean: 34, neck: -10, fa: { hand: [20, 44] }, ba: { hand: [10, 40] }, fl: { foot: [24, 0] }, bl: { foot: [-16, 2] } }),
    // Exponent Kick: a push stomp to the gut.
    stomp_c: R({ hip: [-2, 44], lean: -6, fa: GF, ba: GB, fl: [60, -60], bl: { foot: [-20, 0] } }),
    stomp_x: R({ hip: [-1, 44], lean: -12, fa: GF, ba: GB, fl: [6, -4], bl: { foot: [-20, 0] } }),
    // Negative Exponent: a ground stomp.
    st_c: R({ hip: [0, 42], lean: 6, fa: GF, ba: GB, fl: [70, -40], bl: { foot: [-20, 0] } }),
    st_x: R({ hip: [4, 38], lean: 12, fa: { hand: [26, 62] }, ba: GB, fl: { foot: [32, 0] }, bl: { foot: [-18, 0] } }),
    // Zero Power Sweep: both fists pound the floor and the shockwave takes their feet.
    pound_c: R({ hip: [0, 34], lean: 6, fa: [100, 120], ba: [110, 130], fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    pound_x: R({ hip: [2, 22], lean: 46, fa: { hand: [30, 2] }, ba: { hand: [24, 2] }, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    // Base Hook: a big looping hook.
    hook_c: R({ hip: [-3, 42], lean: -8, fa: GF, ba: [-150, -120], fl: { foot: [16, 0] }, bl: { foot: [-21, 0] } }),
    hook_x: R({ hip: [8, 40], lean: 16, fa: { hand: [18, 62] }, ba: [10, 50], fl: { foot: [24, 0] }, bl: { foot: [-16, 0] } }),
    hv_r: R({ hip: [6, 41], lean: 12, fa: GF, ba: { hand: [22, 64] }, fl: { foot: [22, 0] }, bl: { foot: [-18, 0] } }),
    // Exponential Haymaker: wound all the way back, then everything into it.
    hay_c: R({ hip: [-6, 43], lean: -16, fa: { hand: [16, 74] }, ba: [-170, -150], fl: { foot: [14, 0] }, bl: { foot: [-24, 0] } }),
    hay_x: R({ hip: [12, 40], lean: 22, fa: { hand: [14, 58] }, ba: [6, 10], fl: { foot: [28, 0] }, bl: { foot: [-12, 2] } }),
    // Order of Magnitude: the charge-up, then a straight that goes through anything.
    om_c: R({ hip: [-6, 40], lean: -18, fa: { hand: [14, 72] }, ba: [-180, -170], fl: { foot: [14, 0] }, bl: { foot: [-26, 0] } }),
    om_x: R({ hip: [14, 38], lean: 20, fa: { hand: [16, 56] }, ba: [0, 0], fl: { foot: [30, 0] }, bl: { foot: [-10, 2] } }),
    // Logarithmic Launcher: a double-fisted uppercut.
    power_c: R({ hip: [0, 26], lean: 20, fa: { hand: [16, 30] }, ba: { hand: [10, 30] }, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),
    power_x: R({ hip: [4, 46], lean: -6, fa: [70, 90], ba: [75, 92], fl: { foot: [18, 0] }, bl: { foot: [-18, 0] } }),
    up_r: R({ hip: [2, 44], lean: 2, fa: [50, 90], ba: [60, 92], fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }),

    // Air: Exponent Drop (a hammer fist), Power Kick (a stomp), Tower of Powers (a body splash).
    air_p: R({ hip: [0, 46], lean: 14, fa: [20, -40], ba: GB, fl: [-40, -90], bl: [-100, -80] }),
    air_k: R({ hip: [0, 46], lean: -6, fa: GF, ba: GB, fl: [-30, -60], bl: [-100, -80] }),
    air_hc: R({ hip: [0, 48], lean: -10, fa: [110, 140], ba: [120, 150], fl: [-40, -90], bl: [-100, -80] }),
    air_hx: R({ hip: [0, 40], lean: 80, neck: -40, fa: [20, 10], ba: [-10, -20], fl: [170, 180], bl: [175, 185] }),

    // Long Division: hoist them overhead and slam. Synthetic Division: over the shoulder.
    grab_c: R({ hip: [2, 42], lean: 8, fa: { hand: [28, 68] }, ba: { hand: [24, 64] }, fl: { foot: [20, 0] }, bl: { foot: [-18, 0] } }),
    grab_x: R({ hip: [4, 42], lean: 12, fa: { hand: [30, 64] }, ba: { hand: [28, 60] }, fl: { foot: [22, 0] }, bl: { foot: [-18, 0] } }),
    throw_lift: R({ hip: [0, 44], lean: -4, fa: [80, 95], ba: [85, 100], fl: { foot: [16, 0] }, bl: { foot: [-20, 0] } }),
    throw_slam: R({ hip: [8, 30], lean: 34, fa: [-20, -50], ba: [-25, -55], fl: { foot: [24, 0] }, bl: { foot: [-16, 0] } }),
    throw_back: R({ hip: [-4, 42], lean: -20, fa: [140, 170], ba: [150, 180], fl: { foot: [14, 0] }, bl: { foot: [-22, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [40, 10] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [4, 42], lean: 12, fa: [70, 90], ba: [75, 92], fl: { foot: [18, 0] }, bl: { foot: [-18, 3] } })
  };

  poses.taunt = poses['tie'];

  FG.defineFighter({
    id: 'pedersen', order: 0, // the cover fighter: first on character select
    name: 'PEDERSEN', archetype: 'POWER', theme: 'MATH ANALYSIS',
    style: 'POWER BRAWLER', signatureMechanic: 'EXPONENTIAL ARMOR',
    signatureText: 'his heavy attacks (Base Hook, the Exponential Haymaker, Order of Magnitude) absorb one hit during their windup and keep going; a fully charged Order of Magnitude absorbs two',
    bio: 'CALM AND FRIENDLY, BUT EVERY HIT IS HEAVY. SLOW, PATIENT, DEVASTATING.',
    signature: ['EXPONENTIAL HAYMAKER', 'ORDER OF MAGNITUDE', 'LOGARITHMIC LAUNCHER', 'RIGHT ANGLE ELBOW', 'LONG DIVISION'],
    scale: 1.12, health: 200,
    // Movement: a slow walk, a short dash, a low jump; heavy in juggles, barely flinches.
    walkF: 1.4, walkB: 1.2, dashSpeed: 6.2, dashFrames: 13, backdashSpeed: 6.8,
    jumpVy: 8.6, weight: 1.12, react: 0.6,
    walk: { lean: 2, bob: 1.8, rate: 0.12 },
    car: true,            // drives in for his intro; parks in the background
    homeStage: 'parking', // his stage: the faculty parking lot, his car in the reserved spot
    glyphs: ['LOG(X)', 'X*10', '90', 'E'], // math that flies off their big hits
    stringH: 'EXPONENT RULE', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0xc8202a, b: 0x111111 }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'ESCAPE VELOCITY', input: 'B, F, H' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'HORSEPOWER', text: 'on go the sunglasses; he gets into his red sports car, revs it, and drives straight across the stage into them; they bounce off the hood, the car skids to a stop, and he leans out of the window with his line', from: 'heavy', len: 310, hits: [124, 166], weights: [4, 1], end: { gap: 110, down: true } },
    look: {
      skin: 0xe2ad85, eyeColor: 0x7cc4f0,
      hair: { style: 'slick', color: 0x5a3c24 },
      beard: { style: 'short', color: 0x8a7462 },
      mouth: 'smile',
      top: { style: 'dress', color: 0xb01e24, sleeves: 'rolled', collar: 0xc8282e },
      tie: 0x141414, tieLoose: true, pen: 0x1c2a6a,
      legs: 0x2a2a30, shoes: 0x111111,
      build: { torso: 1.22, limb: 1.12 }
    },
    idleAnim: { breath: 1.6, rate: 0.05 },
    poses: poses,
    // How the CPU plays him: walks you down and swings big, trading through your hits.
    ai: { spacing: 40, pokes: ['F+P', 'K'], close: ['H', 'F+H', 'B+H', 'P', 'P+K'], aggro: 0.9, armorTrade: 0.35 },

    moves: FG.kit.moves({
      jab: {
        name: 'Power Jab', label: 'POWER JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 11, active: 2, recovery: 14, damage: 10,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 64, h: 18 }, push: 9, juggle: 3,
        cancels: [{ btn: 'p', into: 'jab2', from: 11, to: 23 }],
        anim: [[1, 'idle'], [8, 'jab_c'], [11, 'jab_x'], [14, 'jab_x'], [26, 'idle']]
      },
      jab2: {
        name: 'Hammer Fist', label: 'SQUARED', cmd: 'P,P', level: 'high', strength: 'medium', motion: 'overhead',
        startup: 12, active: 3, recovery: 19, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { adv: 10 },
        hitbox: { x: 24, w: 28, y: 60, h: 22 }, push: 14, juggle: 3.4, shake: 0.003,
        anim: [[1, 'jab_x'], [7, 'cross_c'], [12, 'cross_x'], [15, 'cross_x'], [33, 'idle']]
      },
      // Common Log: dash, then P. A shoulder charge that knocks down.
      dashP: {
        ex: { text: 'ARMORED, WALL SPLAT', armor: { hits: 1 }, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Shoulder Charge', label: 'COMMON LOG', cmd: 'F,F+P', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 14, active: 4, recovery: 22, damage: 20,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 10, w: 30, y: 36, h: 34 }, push: 24, juggle: 3.6, carry: 2, shake: 0.008,
        step: [1, 14, 2.8],
        anim: [[1, 'dash'], [9, 'shoulder'], [14, 'shoulder'], [18, 'shoulder'], [40, 'idle']]
      },
      mid: {
        name: 'Push Stomp', label: 'EXPONENT KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 16, active: 3, recovery: 20, damage: 19,
        block: -7, hit: { adv: 5 }, ch: { adv: 10 },
        hitbox: { x: 28, w: 28, y: 36, h: 24 }, push: 18, juggle: 3.6, shake: 0.004,
        anim: [[1, 'idle'], [11, 'stomp_c'], [16, 'stomp_x'], [19, 'stomp_x'], [27, 'stomp_c'], [38, 'idle']]
      },
      low: {
        name: 'Ground Stomp', label: 'NEGATIVE EXPONENT', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', crouching: true, otg: true,
        startup: 18, active: 3, recovery: 22, damage: 13,
        block: -13, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 28, y: 0, h: 18 }, push: 10, juggle: 2.5, shake: 0.004,
        anim: [[1, 'crouch'], [12, 'st_c'], [18, 'st_x'], [21, 'st_x'], [32, 'st_c'], [42, 'crouch']]
      },
      sweep: FG.kit.sweep('ZERO POWER SWEEP', { startup: 22, damage: 20, strength: 'heavy', shake: 0.008, motion: 'low',
        anim: [[1, 'crouch'], [12, 'pound_c'], [22, 'pound_x'], [25, 'pound_x'], [38, 'crouch'], [49, 'crouch']] }),
      heavy: {
        name: 'Big Hook', label: 'BASE HOOK', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'hook', wallSplat: true,
        startup: 21, active: 4, recovery: 20, damage: 28, armor: { from: 6, to: 20, hits: 1 },
        block: 1, hit: { adv: 8 }, ch: { launch: 6.2 },
        hitbox: { x: 24, w: 28, y: 52, h: 22 }, push: 30, juggle: 3.6, carry: 2.2, shake: 0.008,
        step: [12, 21, 1.5],
        anim: [[1, 'idle'], [14, 'hook_c'], [21, 'hook_x'], [25, 'hook_x'], [33, 'hv_r'], [44, 'idle']]
      },
      // Right Angle Elbow: a stepping elbow, plus on hit; a counter hit launches.
      fP: {
        ex: { text: 'TWO ELBOWS, KNOCKDOWN', multi: 1, hit: { knockdown: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Elbow', label: 'RIGHT ANGLE ELBOW', cmd: 'F+P', level: 'mid', strength: 'heavy', motion: 'hook',
        startup: 15, active: 3, recovery: 18, damage: 18,
        block: -5, hit: { adv: 5 }, ch: { launch: 6.4 },
        hitbox: { x: 14, w: 30, y: 56, h: 24 }, push: 14, carry: 0.8, shake: 0.006,
        step: [6, 14, 2.2],
        anim: [[1, 'idle'], [9, 'elbow_c'], [15, 'elbow_x'], [18, 'elbow_x'], [26, 'hv_r'], [36, 'idle']]
      },
      // Exponential Haymaker: a huge, slow, wall-splatting haymaker.
      fH: {
        ex: { text: 'ABSORBS TWO HITS, LAUNCHES', armor: { hits: 2 }, hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Haymaker', label: 'EXPONENTIAL HAYMAKER', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true, guardDmg: 34,
        startup: 26, active: 4, recovery: 22, damage: 36, armor: { from: 8, to: 25, hits: 1 },
        block: -6, hit: { knockdown: true }, ch: { launch: 6.6 },
        hitbox: { x: 28, w: 32, y: 54, h: 24 }, push: 34, juggle: 3.6, carry: 2.6, shake: 0.011,
        step: [14, 26, 1.8],
        anim: [[1, 'idle'], [18, 'hay_c'], [26, 'hay_x'], [30, 'hay_x'], [40, 'hv_r'], [52, 'idle']]
      },
      // Order of Magnitude: hold H to charge. Half charge knocks down; full charge breaks the guard.
      bH: {
        name: 'Charge Punch', label: 'ORDER OF MAGNITUDE', cmd: 'B+H (HOLD)', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 20, active: 4, recovery: 22, damage: 20, armor: { from: 6, to: 19, hits: 1 },
        block: -8, hit: { adv: 4 }, ch: { knockdown: true },
        charge: { at: 12, btn: 'h', mid: 16, max: 40, damage: [1, 1.5, 2.1] },
        hitbox: { x: 28, w: 32, y: 48, h: 24 }, push: 30, juggle: 3.6, carry: 2.4, shake: 0.009,
        step: [13, 20, 2.4],
        anim: [[1, 'idle'], [12, 'om_c'], [20, 'om_x'], [24, 'om_x'], [34, 'hv_r'], [46, 'idle']]
      },
      launcher: {
        name: 'Double Uppercut', label: 'LOGARITHMIC LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
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
      { name: 'LOGARITHMIC JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 43: 'P', 57: 'P', 67: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'TOWER OF POWERS', difficulty: 'hard', notation: 'D+H, UP, AIR K, AIR H, D+K ON THE GROUND',
        plan: { 0: 'D+H', 19: 'UP', 27: 'K', 34: 'H', 84: 'D+K' }, hits: ['launcher', 'airK', 'airH', 'low'] },
      { name: 'EXPONENTIAL GROWTH', difficulty: 'medium', notation: 'AT THE WALL: H, D+H', queue: ['H', 'D+H'], wall: true, hits: ['heavy', 'launcher'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'OVERDRIVE LAUNCH', difficulty: 'medium', meter: 1, notation: 'F+H, P+K, P, P, H', steps: ['F+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'F+H', 3: 'P+K', 44: 'P', 56: 'P', 70: 'H' }, hits: ['fHEX', 'jab', 'jab2', 'jabH'] },
      { name: 'EXPONENTIAL OVERDRIVE', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
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
