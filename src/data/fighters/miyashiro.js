// MIYASHIRO — Spacing / Footsies — Algebra 2. Traditional karate, kick-based:
// long front kicks, a side kick, back kicks and foot sweeps that keep people at
// the edge of his range, from a deep, wide, steady stance. A strong backdash.
//
// Signature: CALCULATED. When the opponent whiffs, his next hit does bonus damage
// (and he glows until he lands it). Domain Restriction (B+H) is a step-back kick
// that retreats while it attacks.
(function () {
  // Sturdy, with long legs for kicking.
  var R = FG.rigger({ torso: 28, neck: 12, upper: 15.5, fore: 13.5, thigh: 25.5, shin: 26 });
  // A deep front stance: lead hand out, the rear fist chambered at the hip.
  var GF = { hand: [26, 62] }, GB = { hand: [2, 48] };
  var stance = R({ hip: [-2, 40], lean: 0, fa: GF, ba: GB, fl: { foot: [22, 0] }, bl: { foot: [-28, 0] } });
  var stand = R({ hip: [0, 50], lean: 0, fa: [-82, -88], ba: [-96, -92], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } });
  var behind = { hand: [-10, 50] };

  var poses = {
    idle: stance,
    stand: stand,
    sleeve: R({ hip: [0, 50], lean: 0, fa: { hand: [-2, 64] }, ba: { hand: [8, 62] }, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),   // rolling up a sleeve
    sleeve2: R({ hip: [0, 50], lean: 0, fa: { hand: [12, 62] }, ba: { hand: [-2, 62] }, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    // System of Equations (the ultimate): each copy dives down its line, fist first.
    dive: R({ hip: [0, 46], lean: 34, neck: -10, fa: [24, 22], ba: [-150, -160], fl: [-60, -120], bl: [-150, -120] }),
    bow: R({ hip: [-2, 49], lean: 22, fa: [-90, -90], ba: [-95, -92], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    behind: R({ hip: [0, 50], lean: 0, fa: behind, ba: behind, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }), // hands behind his back
    nod: R({ hip: [0, 50], lean: 4, neck: 14, fa: behind, ba: behind, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    kneel: [0, 26, 6, 50, 10, 60, 14, 40, 18, 28, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 14, 40, 18, 28, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],

    // Movement: steady and low; he glides rather than steps.
    crouch: R({ hip: [-2, 28], lean: 6, fa: { hand: [26, 50] }, ba: { hand: [4, 40] }, fl: { foot: [20, 0] }, bl: { foot: [-24, 0] } }),
    squat: R({ hip: [-2, 34], lean: 4, fa: { hand: [26, 56] }, ba: { hand: [4, 44] }, fl: { foot: [18, 0] }, bl: { foot: [-22, 0] } }),
    jump: R({ hip: [0, 46], lean: 0, fa: GF, ba: GB, fl: [-30, -120], bl: [-110, -110] }),
    dash: R({ hip: [4, 38], lean: 8, fa: { hand: [30, 60] }, ba: GB, fl: { foot: [28, 0] }, bl: { foot: [-24, 2] } }),
    backdash: R({ hip: [-6, 40], lean: -6, fa: GF, ba: GB, fl: { foot: [18, 2] }, bl: { foot: [-32, 0] } }),
    sidestep: R({ hip: [-2, 38], lean: 2, fa: GF, ba: GB, fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    // Guard: a forearm block, the stance unchanged.
    block: R({ hip: [-3, 40], lean: -2, fa: [40, 100], ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-28, 0] } }),
    cblock: R({ hip: [-2, 28], lean: 6, fa: [-30, -80], ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-24, 0] } }),
    // Hit reactions: rooted; the stance absorbs it.
    hit_high: R({ hip: [-4, 41], lean: -12, neck: -12, fa: [10, 40], ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-28, 0] } }),
    hit_mid: R({ hip: [-5, 38], lean: 16, neck: 6, fa: { hand: [16, 48] }, ba: GB, fl: { foot: [18, 0] }, bl: { foot: [-28, 0] } }),
    hit_low: R({ hip: [-3, 38], lean: 4, fa: GF, ba: GB, fl: [-50, -100], bl: { foot: [-26, 0] } }),
    gbreak: R({ hip: [-5, 40], lean: -14, fa: [60, 120], ba: [-150, -110], fl: { foot: [20, 0] }, bl: { foot: [-28, 0] } }),
    juggle: R({ hip: [0, 22], lean: -66, neck: -6, fa: [80, 120], ba: [60, 100], fl: [20, -10], bl: [10, -30] }),
    down: R({ hip: [0, 6], lean: -88, fa: [-160, -170], ba: [-170, -175], fl: [10, 0], bl: [0, 0] }),

    // Function Jab: a lunging lead punch.
    jab_c: R({ hip: [0, 40], lean: 2, fa: { hand: [22, 66] }, ba: GB, fl: { foot: [24, 0] }, bl: { foot: [-26, 0] } }),
    jab_x: R({ hip: [6, 40], lean: 8, fa: [2, 0], ba: GB, fl: { foot: [28, 0] }, bl: { foot: [-24, 0] } }),
    // Inverse: the reverse punch from the hip, the lead hand pulling back.
    cross_c: R({ hip: [1, 40], lean: 2, fa: { hand: [28, 62] }, ba: { hand: [2, 46] }, fl: { foot: [24, 0] }, bl: { foot: [-26, 0] } }),
    cross_x: R({ hip: [8, 39], lean: 10, fa: { hand: [4, 48] }, ba: [0, 0], fl: { foot: [28, 0] }, bl: { foot: [-22, 0] } }),
    // Range Check: the lunge punch, covering ground in a deep stance.
    rush_c: R({ hip: [2, 38], lean: 6, fa: { hand: [28, 60] }, ba: GB, fl: { foot: [26, 0] }, bl: { foot: [-24, 0] } }),
    rush_x: R({ hip: [14, 34], lean: 12, fa: { hand: [12, 46] }, ba: [0, 2], fl: { foot: [36, 0] }, bl: { foot: [-22, 0] } }),
    // Root Kick: the front snap kick.
    mk_c: R({ hip: [-2, 44], lean: -2, fa: GF, ba: GB, fl: [60, -80], bl: { foot: [-22, 0] } }),
    mk_x: R({ hip: [-2, 45], lean: -10, fa: GF, ba: GB, fl: [14, 4], bl: { foot: [-22, 0] } }),
    // Domain Control: the long side kick, the body leaning away behind it.
    poke_c: R({ hip: [-2, 44], lean: -10, fa: { hand: [22, 66] }, ba: GB, fl: [40, -120], bl: { foot: [-20, 0] } }),
    poke_x: R({ hip: [2, 46], lean: -34, fa: { hand: [14, 66] }, ba: GB, fl: [4, 2], bl: { foot: [-22, 0] } }),
    // Vertex Kick: a spinning back hook kick to the head.
    spin_c: R({ hip: [-2, 42], lean: -4, neck: -10, fa: { hand: [4, 66] }, ba: GB, fl: { foot: [-6, 0] }, bl: [40, -50] }),
    spin_x: R({ hip: [-2, 46], lean: -36, fa: [-150, -160], ba: GB, fl: { foot: [-14, 0] }, bl: [30, 30] }),
    // Domain Restriction: stepping back, the front kick snaps out as he goes.
    ret_c: R({ hip: [-8, 44], lean: -6, fa: GF, ba: GB, fl: [50, -80], bl: { foot: [-30, 0] } }),
    ret_x: R({ hip: [-8, 45], lean: -16, fa: GF, ba: GB, fl: [10, 2], bl: { foot: [-30, 0] } }),
    // Y-Intercept: a stopping side kick to the knee.
    low_c: R({ hip: [-2, 34], lean: -4, fa: GF, ba: GB, fl: [30, -100], bl: { foot: [-24, 0] } }),
    low_x: R({ hip: [0, 32], lean: -12, fa: GF, ba: GB, fl: { foot: [48, 10] }, bl: { foot: [-24, 0] } }),
    // X-Axis Sweep: a standing foot sweep.
    sweep_c: R({ hip: [-2, 40], lean: 2, fa: GF, ba: GB, fl: { foot: [18, 0] }, bl: [-60, -40] }),
    sweep_x: R({ hip: [0, 38], lean: -6, fa: { hand: [30, 58] }, ba: GB, fl: { foot: [6, 0] }, bl: { foot: [46, 2] } }),
    // Complex Root: a back kick, heel driven straight back through them.
    hv_c: R({ hip: [-2, 42], lean: 4, neck: -10, fa: GF, ba: GB, fl: { foot: [4, 0] }, bl: [50, -60] }),
    hv_x: R({ hip: [-2, 44], lean: 30, neck: 10, fa: { hand: [6, 40] }, ba: GB, fl: { foot: [-10, 0] }, bl: [2, -2] }),
    hv_r: R({ hip: [0, 42], lean: 6, fa: GF, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-20, 0] } }),
    // End Behavior: a stepping hammer fist, straight down.
    ham_c: R({ hip: [-2, 42], lean: -6, fa: [100, 140], ba: GB, fl: { foot: [22, 0] }, bl: { foot: [-26, 0] } }),
    ham_x: R({ hip: [8, 36], lean: 18, fa: [-20, -70], ba: GB, fl: { foot: [30, 0] }, bl: { foot: [-22, 0] } }),
    // Quadratic Launcher: a rising punch from a crouch.
    xprod_c: R({ hip: [-2, 28], lean: 10, fa: { hand: [20, 36] }, ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-24, 0] } }),
    xprod_x: R({ hip: [4, 46], lean: -2, fa: [70, 88], ba: GB, fl: { foot: [22, 0] }, bl: { foot: [-22, 2] } }),
    up_r: R({ hip: [2, 42], lean: 2, fa: [50, 80], ba: GB, fl: { foot: [22, 0] }, bl: { foot: [-24, 0] } }),

    // Air: Imaginary Jab (a punch), Conjugate Kick (a flying front kick), Focus Spike (a hammer fist down).
    air_p: R({ hip: [0, 46], lean: 6, fa: [2, 0], ba: GB, fl: [-30, -120], bl: [-110, -110] }),
    air_k: R({ hip: [0, 46], lean: -14, fa: GF, ba: GB, fl: [6, 4], bl: [-80, -140] }),
    air_hc: R({ hip: [0, 48], lean: -6, fa: [110, 140], ba: GB, fl: [-30, -120], bl: [-110, -110] }),
    air_hx: R({ hip: [0, 46], lean: 20, fa: [-30, -80], ba: GB, fl: [-30, -120], bl: [-110, -110] }),

    // Discriminant: a sweeping hip throw. Completing the Square: turn and throw behind.
    grab_c: R({ hip: [0, 40], lean: 6, fa: { hand: [28, 64] }, ba: { hand: [22, 60] }, fl: { foot: [22, 0] }, bl: { foot: [-24, 0] } }),
    grab_x: R({ hip: [4, 40], lean: 10, fa: { hand: [30, 62] }, ba: { hand: [26, 60] }, fl: { foot: [24, 0] }, bl: { foot: [-22, 0] } }),
    throw_lift: R({ hip: [2, 42], lean: 0, fa: [40, 70], ba: [30, 60], fl: { foot: [14, 0] }, bl: [10, -60] }),
    throw_slam: R({ hip: [6, 34], lean: 26, fa: [-30, -60], ba: [-40, -70], fl: { foot: [24, 0] }, bl: { foot: [-20, 0] } }),
    throw_back: R({ hip: [-4, 40], lean: -14, fa: [150, 180], ba: [140, 170], fl: { foot: [14, 0] }, bl: { foot: [-26, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [46, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [0, 46], lean: -10, fa: GF, ba: GB, fl: [14, 4], bl: { foot: [-20, 0] } })
  };

  poses.taunt = poses.nod;

  FG.defineFighter({
    id: 'miyashiro', order: 6,
    homeStage: 'lab',
    glyphs: ['B*B-4AC', 'F(X)', 'I*I=-1', 'VERTEX'], // math that flies off their big hits
    stringH: 'SOLUTION SET', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x2a5ad8, b: 0xc8ccd8 }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'CALCULATED', input: 'D, F, K' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'SYSTEM OF EQUATIONS', text: 'two glowing lines draw across the stage from opposite corners and a copy of him charges down each one; they hit exactly where the lines intersect: SOLUTION FOUND', from: 'dashP', len: 236, hits: [100, 101], end: { gap: 70, down: true } },
    name: 'MIYASHIRO', archetype: 'SPACING', theme: 'ALGEBRA 2',
    style: 'KARATE', signatureMechanic: 'CALCULATED',
    signatureText: 'when the opponent whiffs, his next hit does bonus damage and he glows until he lands it; Domain Restriction (B+H) is a step-back kick that retreats while it attacks',
    bio: 'VERY SMART. READS OPPONENTS, KEEPS PERFECT DISTANCE, PUNISHES EVERY MISTAKE.',
    signature: ['DOMAIN CONTROL', 'RANGE CHECK', 'VERTEX KICK', 'QUADRATIC LAUNCHER', 'DISCRIMINANT', 'CALCULATED'],
    scale: 1.02, health: 178,
    // Movement: a steady glide, and a strong backdash to reset the distance.
    walkF: 1.9, walkB: 2.0, dashSpeed: 8.0, backdashSpeed: 11.0, backdashFrames: 20, backdashActFrom: 14,
    jumpVy: 9.3, weight: 1.06, react: 0.85,
    walk: { lean: 0, bob: 0.2, rate: 0.1 },
    dashAttackFrom: 4, // Range Check comes out early in a dash
    passive: 'calculated',
    look: {
      skin: 0xd9a87a,
      hair: { style: 'neat', color: 0x111111 },
      mouth: 'calm',
      top: { style: 'button', color: 0x4a78b8, pattern: 'check', patternColor: 0xbcd2f0, sleeves: 'rolled' },
      legs: 0x8c7f68, shoes: 0x3a2a1e,
      build: { torso: 1.06, limb: 1.04 }
    },
    idleAnim: { breath: 0.9, sway: 0.4, rate: 0.05 }, // rock steady
    poses: poses,
    // How the CPU plays him: keeps you at the tip of his kicks and backs off when you get close.
    ai: { spacing: 74, pokes: ['F+K', 'K', 'B+H', 'B+K'], close: ['B+H', 'P', 'D+K'], aggro: 0.8, backdash: 0.3 },

    moves: FG.kit.moves({
      jab: {
        name: 'Lead Punch', label: 'FUNCTION JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 3, recovery: 13, damage: 7,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 30, y: 62, h: 16 }, push: 8, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [14, 'jab_x'], [25, 'idle']]
      },
      jab2: {
        name: 'Reverse Punch', label: 'INVERSE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 28, y: 60, h: 18 }, push: 12, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      // Range Check: dash, then P. A lunging straight that covers ground.
      dashP: {
        ex: { text: 'TWO HITS, KNOCKDOWN', multi: 1, hit: { knockdown: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Lunge Punch', label: 'RANGE CHECK', cmd: 'F,F+P', level: 'mid', strength: 'heavy', motion: 'lunge', wallSplat: true,
        startup: 12, active: 3, recovery: 18, damage: 16,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 26, w: 30, y: 50, h: 22 }, push: 20, juggle: 3.6, carry: 1.6, shake: 0.005,
        step: [1, 12, 3.2],
        anim: [[1, 'rush_c'], [8, 'rush_c'], [12, 'rush_x'], [15, 'rush_x'], [32, 'idle']]
      },
      mid: {
        name: 'Front Kick', label: 'ROOT KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 14, active: 3, recovery: 18, damage: 13,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 32, w: 28, y: 40, h: 20 }, push: 16, juggle: 3.8, shake: 0.002,
        anim: [[1, 'idle'], [10, 'mk_c'], [14, 'mk_x'], [17, 'mk_x'], [24, 'mk_c'], [34, 'idle']]
      },
      // Domain Control: the longest poke in the game. Mid, safe at its tip.
      fK: {
        ex: { text: 'LAUNCHES', hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Side Kick', label: 'DOMAIN CONTROL', cmd: 'F+K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 16, active: 3, recovery: 18, damage: 12,
        block: -6, hit: { adv: 3 }, ch: { adv: 8 },
        hitbox: { x: 40, w: 36, y: 42, h: 20 }, push: 18, juggle: 3.6, shake: 0.002,
        step: [8, 16, 1.4],
        anim: [[1, 'idle'], [10, 'poke_c'], [16, 'poke_x'], [19, 'poke_x'], [27, 'poke_c'], [37, 'idle']]
      },
      // Vertex Kick: a spinning back hook kick that tracks.
      bK: {
        name: 'Spinning Hook Kick', label: 'VERTEX KICK', cmd: 'B+K', level: 'high', strength: 'heavy', motion: 'roundhouse', tracks: true,
        startup: 17, active: 4, recovery: 20, damage: 18,
        block: -7, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 30, y: 62, h: 24 }, push: 18, juggle: 3.6, carry: 1.6, shake: 0.006,
        anim: [[1, 'idle'], [8, 'spin_c'], [17, 'spin_x'], [21, 'spin_x'], [30, 'spin_c'], [41, 'idle']]
      },
      // Domain Restriction: a front kick that steps back as it goes, keeping them at range.
      bH: {
        ex: { text: 'ARMORED, WALL SPLAT', armor: { hits: 1 }, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Step-Back Kick', label: 'DOMAIN RESTRICTION', cmd: 'B+H', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 16, damage: 12,
        block: -2, hit: { adv: 5 }, ch: { adv: 10 },
        hitbox: { x: 28, w: 28, y: 40, h: 20 }, push: 18, juggle: 3.6, shake: 0.003,
        step: [11, 28, -2.4],
        anim: [[1, 'idle'], [8, 'ret_c'], [13, 'ret_x'], [16, 'ret_x'], [23, 'ret_c'], [32, 'idle']]
      },
      low: {
        name: 'Knee Stop Kick', label: 'Y-INTERCEPT', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low', crouching: true, otg: true,
        startup: 15, active: 3, recovery: 19, damage: 9,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 30, w: 26, y: 0, h: 18 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'low_c'], [15, 'low_x'], [18, 'low_x'], [28, 'low_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('X-AXIS SWEEP', { motion: 'sweep' }),
      heavy: {
        name: 'Back Kick', label: 'COMPLEX ROOT', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'kick', wallSplat: true,
        startup: 18, active: 3, recovery: 22, damage: 20,
        block: -5, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 28, w: 30, y: 38, h: 22 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 1.8],
        anim: [[1, 'idle'], [12, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [29, 'hv_r'], [42, 'idle']]
      },
      fH: {
        name: 'Hammer Fist', label: 'END BEHAVIOR', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 21, active: 3, recovery: 21, damage: 18, guardDmg: 24,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 26, w: 26, y: 40, h: 26 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 21, 1.2],
        anim: [[1, 'idle'], [14, 'ham_c'], [21, 'ham_x'], [24, 'ham_x'], [33, 'hv_r'], [45, 'idle']]
      },
      launcher: {
        name: 'Rising Punch', label: 'QUADRATIC LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 23, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 28, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'xprod_c'], [15, 'xprod_x'], [19, 'xprod_x'], [28, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['IMAGINARY JAB', 'CONJUGATE KICK', 'FOCUS SPIKE']),
    FG.kit.throws('DISCRIMINANT', 'COMPLETING THE SQUARE', { throw: { damage: 30 }, throwB: { damage: 33 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'FACTOR PAIR', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 15: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'QUADRATIC JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 39: 'P', 53: 'P', 62: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'FOCUS SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 32: 'P', 41: 'K', 51: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'CALCULATED RUSH', difficulty: 'medium', notation: 'THEY WHIFF A JAB, F, F+P (CALCULATED BONUS)',
        dist: 100, oppPlan: { 0: 'P' }, plan: { 18: 'F', 20: 'F', 27: 'P' }, hits: ['dashP'] },
      { name: 'DOMAIN AND RANGE', difficulty: 'medium', notation: 'AT THE WALL: H, F+K, D+H', queue: ['H', 'F+K', 'D+H'], wall: true, hits: ['heavy', 'fK', 'launcher'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'DOMAIN LAUNCH', difficulty: 'medium', meter: 1, notation: 'F+K, P+K, P, P, H', steps: ['F+K, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'F+K', 3: 'P+K', 31: 'P', 55: 'P', 61: 'H' }, hits: ['fKEX', 'jab', 'jab2', 'jabH'] },
      { name: 'IMAGINARY UNIT', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [12, 'sleeve'], [26, 'sleeve'], [34, 'sleeve2'], [48, 'sleeve2'], [58, 'bow'], [70, 'stand'], [86, 'idle']],
    victory: [[1, 'stand'], [16, 'behind'], [46, 'behind'], [56, 'nod'], [64, 'behind'], [100, 'behind']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'I ran the numbers. You should forfeit.',
        'Every move you make, I\'ve already graphed.',
        'Your odds are rounding down to zero.'
      ],
      quips: ['As calculated.', 'Within tolerance.', 'Another data point.']
    },
    victoryLines: [
      'I calculated this outcome before the bell rang.',
      'Your domain was fine. Your range, however...',
      'Every mistake was a data point. You gave me plenty.'
    ]
  });
})();
