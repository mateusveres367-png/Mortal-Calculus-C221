// LOPEZ — Defensive — Calculus. A counter-fighter in the Wing Chun / aikido mould:
// short palm strikes and chain punches down the centerline, trapping hands,
// parries and wrist locks. He barely moves, in small, calm steps, from a centered
// stance with both hands up.
//
// Signature: DERIVATIVE READ. A parry stance (B+H, hold H to keep it up). Attack
// into it and he reads your rate of change and counters by level: a wrist lock
// for a high, a palm strike for a mid, a trapping sweep for a low. Throws beat it.
// Also: the Asymptote Backdash and Mean Value Punish (P right after blocking).
(function () {
  var R = FG.rigger({ torso: 28, neck: 12, upper: 15, fore: 13, thigh: 24, shin: 24.5 });
  // Centered: the lead hand out on the centerline, the rear hand guarding behind it.
  var GF = { hand: [26, 72] }, GB = { hand: [16, 74] };
  var stance = R({ hip: [0, 45], lean: 0, fa: GF, ba: GB, fl: { foot: [10, 0] }, bl: { foot: [-11, 0] } });
  var stand = R({ hip: [0, 47], lean: 0, fa: [-82, -88], ba: [-96, -92], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    // Taking off the blazer: arms back and out of the sleeves, then a toss.
    shrugoff: R({ hip: [0, 47], lean: 4, fa: [-120, -130], ba: [-130, -140], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    toss: R({ hip: [0, 47], lean: -2, fa: [120, 100], ba: [-96, -92], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    crossed: R({ hip: [0, 47], lean: 0, fa: { hand: [-2, 68] }, ba: { hand: [12, 68] }, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    nod: R({ hip: [0, 47], lean: 4, neck: 14, fa: { hand: [-2, 68] }, ba: { hand: [12, 68] }, fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    point: R({ hip: [0, 47], lean: 0, fa: [-30, 110], ba: [-96, -92], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }), // taps his temple
    kneel: [0, 26, 6, 50, 10, 60, 14, 50, 12, 62, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],
    kneel2: [0, 26, 5, 49, 8, 59, 14, 50, 12, 62, 0, 40, 4, 30, 14, 26, 18, 0, -6, 4, -22, 0],

    // Movement: small, calm, centered.
    crouch: R({ hip: [0, 30], lean: 8, fa: { hand: [24, 56] }, ba: { hand: [14, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    squat: R({ hip: [0, 36], lean: 6, fa: { hand: [24, 62] }, ba: { hand: [14, 64] }, fl: { foot: [10, 0] }, bl: { foot: [-11, 0] } }),
    jump: R({ hip: [0, 46], lean: 0, fa: GF, ba: GB, fl: [-40, -100], bl: [-100, -80] }),
    dash: R({ hip: [2, 44], lean: 6, fa: GF, ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-12, 3] } }),
    backdash: R({ hip: [-3, 46], lean: -4, fa: GF, ba: GB, fl: { foot: [8, 3] }, bl: { foot: [-16, 0] } }),
    sidestep: R({ hip: [0, 44], lean: 0, fa: GF, ba: GB, fl: { foot: [4, 0] }, bl: { foot: [-6, 0] } }),
    // Guard: a bong sau, the forearm angled across the line.
    block: R({ hip: [-1, 45], lean: -2, fa: [10, 100], ba: { hand: [14, 76] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    cblock: R({ hip: [0, 30], lean: 8, fa: [-20, 80], ba: { hand: [14, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    // Hit reactions: composed; he gives ground but keeps his frame.
    hit_high: R({ hip: [-3, 46], lean: -10, neck: -10, fa: { hand: [20, 72] }, ba: { hand: [12, 76] }, fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    hit_mid: R({ hip: [-4, 44], lean: 18, neck: 6, fa: { hand: [14, 56] }, ba: { hand: [8, 58] }, fl: { foot: [10, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-1, 42], lean: 6, fa: GF, ba: GB, fl: [-40, -110], bl: { foot: [-12, 0] } }),
    gbreak: R({ hip: [-4, 45], lean: -12, fa: [40, 60], ba: [20, 40], fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    juggle: R({ hip: [0, 22], lean: -76, fa: [100, 80], ba: [80, 60], fl: [10, -10], bl: [0, -20] }),
    down: R({ hip: [0, 6], lean: -88, fa: [-170, -175], ba: [170, 175], fl: [4, 0], bl: [-4, 0] }),

    // Differential Jab: a vertical-fist chain punch down the centerline.
    jab_c: R({ hip: [1, 45], lean: 2, fa: { hand: [20, 70] }, ba: { hand: [22, 72] }, fl: { foot: [10, 0] }, bl: { foot: [-11, 0] } }),
    jab_x: R({ hip: [5, 45], lean: 6, fa: [2, 0], ba: { hand: [18, 70] }, fl: { foot: [14, 0] }, bl: { foot: [-10, 0] } }),
    // Second Derivative: the other hand, rolling over the first.
    cross_c: R({ hip: [3, 45], lean: 4, fa: { hand: [18, 68] }, ba: { hand: [24, 72] }, fl: { foot: [12, 0] }, bl: { foot: [-10, 0] } }),
    cross_x: R({ hip: [6, 45], lean: 8, fa: { hand: [18, 66] }, ba: [2, -2], fl: { foot: [15, 0] }, bl: { foot: [-9, 0] } }),
    // Mean Value Punish: trap the arm, then a palm strike.
    conf_c: R({ hip: [2, 45], lean: 4, fa: { hand: [28, 64] }, ba: { hand: [6, 66] }, fl: { foot: [12, 0] }, bl: { foot: [-10, 0] } }),
    conf_x: R({ hip: [8, 44], lean: 10, fa: { hand: [22, 58] }, ba: [6, 20], fl: { foot: [16, 0] }, bl: { foot: [-9, 0] } }),
    // Chain Rule Kick: a short heel kick to the stomach, hands still on guard.
    reg_c: R({ hip: [0, 46], lean: -2, fa: GF, ba: GB, fl: [50, -90], bl: { foot: [-11, 0] } }),
    reg_x: R({ hip: [0, 46], lean: -8, fa: GF, ba: GB, fl: [12, -6], bl: { foot: [-11, 0] } }),
    // Lower Sum: a stamp to the knee.
    low_c: R({ hip: [0, 40], lean: 4, fa: GF, ba: GB, fl: [40, -60], bl: { foot: [-11, 0] } }),
    low_x: R({ hip: [2, 38], lean: 6, fa: GF, ba: GB, fl: { foot: [38, 12] }, bl: { foot: [-11, 0] } }),
    // Riemann Sweep: hook the ankle and draw it out.
    sweep_c: R({ hip: [0, 32], lean: 10, fa: { hand: [26, 56] }, ba: { hand: [16, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [2, 28], lean: 14, fa: { hand: [28, 50] }, ba: { hand: [10, 54] }, fl: { foot: [44, 3] }, bl: { foot: [-12, 0] } }),
    // Definite Integral: a stepping double palm strike.
    hv_c: R({ hip: [-2, 45], lean: -2, fa: { hand: [12, 62] }, ba: { hand: [8, 66] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    hv_x: R({ hip: [10, 44], lean: 12, fa: [2, 10], ba: [-4, 4], fl: { foot: [20, 0] }, bl: { foot: [-8, 0] } }),
    hv_r: R({ hip: [6, 45], lean: 6, fa: GF, ba: GB, fl: { foot: [16, 0] }, bl: { foot: [-10, 0] } }),
    // Concave Down: a downward chopping palm.
    ham_c: R({ hip: [-1, 46], lean: -4, fa: [80, 100], ba: GB, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    ham_x: R({ hip: [8, 42], lean: 16, fa: [-10, -40], ba: GB, fl: { foot: [18, 0] }, bl: { foot: [-10, 0] } }),
    // Derivative Read: the parry stance, hands floating on the line; the counters.
    parry: R({ hip: [-1, 44], lean: -2, neck: 4, fa: { hand: [28, 66] }, ba: { hand: [22, 54] }, fl: { foot: [9, 0] }, bl: { foot: [-12, 0] } }),
    lock_x: R({ hip: [2, 40], lean: 20, fa: { hand: [26, 40] }, ba: { hand: [22, 46] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    counter_x: R({ hip: [8, 43], lean: 10, fa: { hand: [18, 70] }, ba: [0, 8], fl: { foot: [16, 0] }, bl: { foot: [-9, 0] } }),
    trip_x: R({ hip: [4, 30], lean: 18, fa: { hand: [30, 40] }, ba: { hand: [20, 50] }, fl: { foot: [36, 3] }, bl: { foot: [-12, 0] } }),
    // Limit Break: a rising palm under the chin.
    outlier_c: R({ hip: [0, 32], lean: 10, fa: { hand: [16, 44] }, ba: GB, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    outlier_x: R({ hip: [3, 48], lean: -4, fa: [70, 85], ba: { hand: [16, 70] }, fl: { foot: [12, 0] }, bl: { foot: [-10, 2] } }),
    up_r: R({ hip: [2, 46], lean: 0, fa: [50, 80], ba: GB, fl: { foot: [10, 0] }, bl: { foot: [-11, 0] } }),

    // Air: Left-Hand Limit (a chain punch), Right-Hand Limit (a heel kick), Inflection Spike (a falling palm).
    air_p: R({ hip: [0, 46], lean: 6, fa: [2, 0], ba: GB, fl: [-40, -100], bl: [-100, -80] }),
    air_k: R({ hip: [0, 46], lean: -10, fa: GF, ba: GB, fl: [10, -10], bl: [-100, -80] }),
    air_hc: R({ hip: [0, 48], lean: -6, fa: [90, 110], ba: GB, fl: [-40, -100], bl: [-100, -80] }),
    air_hx: R({ hip: [0, 46], lean: 18, fa: [-30, -50], ba: GB, fl: [-40, -100], bl: [-100, -80] }),

    // Squeeze Theorem: a wrist lock that turns them over. U-Substitution: an entering throw.
    grab_c: R({ hip: [2, 45], lean: 4, fa: { hand: [28, 66] }, ba: { hand: [24, 68] }, fl: { foot: [12, 0] }, bl: { foot: [-10, 0] } }),
    grab_x: R({ hip: [4, 45], lean: 6, fa: { hand: [30, 62] }, ba: { hand: [28, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-10, 0] } }),
    throw_lift: R({ hip: [2, 44], lean: 2, fa: [40, 60], ba: [30, 50], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 36], lean: 24, fa: [-30, -60], ba: [-40, -70], fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 44], lean: -10, fa: [150, 190], ba: [140, 180], fl: { foot: [8, 0] }, bl: { foot: [-14, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [40, 6] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [4, 44], lean: 8, fa: [2, 10], ba: [-4, 4], fl: { foot: [14, 0] }, bl: { foot: [-10, 3] } })
  };

  poses.taunt = poses.point;

  FG.defineFighter({
    id: 'lopez', order: 5,
    homeStage: 'office',
    glyphs: ['DY/DX', "F'(X)", 'LIM', 'DX'], // math that flies off their big hits
    stringH: 'FUNDAMENTAL THEOREM', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x1a2a5a, b: 0xffffff }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'AREA UNDER THE CURVE', input: 'B, B, H' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'FUNDAMENTAL THEOREM', text: 'hit him in it and time stops, the derivative and the integral flash up, then the punish', from: 'bH', counter: true, window: 50, pose: 'parry', len: 230, hits: [96, 168], weights: [1, 3], end: { gap: 80, down: true } },
    name: 'LOPEZ', archetype: 'DEFENSIVE', theme: 'CALCULUS',
    style: 'COUNTER-FIGHTER', signatureMechanic: 'DERIVATIVE READ',
    signatureText: 'a parry stance (B+H, hold H to keep it up); attack into it and he counters by level: a wrist lock for a high, a palm strike for a mid, a trapping sweep for a low; throws beat it',
    bio: 'VERY SUSPICIOUS. ALWAYS WATCHING. WAITS FOR YOU TO COMMIT, THEN PUNISHES.',
    signature: ['DERIVATIVE READ', 'ASYMPTOTE BACKDASH', 'MEAN VALUE PUNISH', 'LIMIT BREAK', 'SQUEEZE THEOREM'],
    scale: 1.03, health: 180,
    // Movement: barely moves: small steps and a short dash. His one big move is the backdash.
    walkF: 1.5, walkB: 1.6, dashSpeed: 6.4, dashFrames: 14,
    jumpVy: 9.2, weight: 1.04, react: 0.75,
    walk: { lean: 0, bob: 0.3, rate: 0.12 },
    // Asymptote Backdash: a long backdash that recovers early and that lows can't touch at first.
    backdashSpeed: 12.5, backdashDecay: 0.86, backdashFrames: 22, backdashActFrom: 13, backdashLowInvuln: 10,
    postBlockWindow: 10, // Mean Value Punish: P within 10 frames of leaving blockstun
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
    idleAnim: { breath: 0.5, rate: 0.04 }, // perfectly still, just breathing
    poses: poses,
    // How the CPU plays him: waits, reads, punishes.
    ai: { spacing: 56, pokes: ['P', 'K'], close: ['P', 'D+K', 'P+K'], aggro: 0.55, parry: 0.35 },

    moves: FG.kit.moves({
      jab: {
        name: 'Chain Punch', label: 'DIFFERENTIAL JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 14, damage: 8,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 28, y: 64, h: 16 }, push: 8, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [25, 'idle']]
      },
      jab2: {
        name: 'Chain Punch 2', label: 'SECOND DERIVATIVE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 16, damage: 10,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 24, w: 28, y: 62, h: 18 }, push: 10, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      // Mean Value Punish: P right after blocking becomes this fast, heavy punisher.
      postBlockP: {
        ex: { text: 'LAUNCHES', hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Trap and Palm', label: 'MEAN VALUE PUNISH', cmd: 'P AFTER BLOCK', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 8, active: 2, recovery: 20, damage: 18,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 30, y: 52, h: 24 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'idle'], [5, 'conf_c'], [8, 'conf_x'], [10, 'conf_x'], [29, 'idle']]
      },
      mid: {
        name: 'Heel Kick', label: 'CHAIN RULE KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 15, active: 3, recovery: 18, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 26, y: 36, h: 22 }, push: 16, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'reg_c'], [15, 'reg_x'], [18, 'reg_x'], [26, 'reg_c'], [35, 'idle']]
      },
      low: {
        name: 'Knee Stamp', label: 'LOWER SUM', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', crouching: true, otg: true,
        startup: 16, active: 3, recovery: 20, damage: 11,
        block: -12, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 26, y: 0, h: 18 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'low_c'], [16, 'low_x'], [19, 'low_x'], [29, 'low_c'], [38, 'crouch']]
      },
      sweep: FG.kit.sweep('RIEMANN SWEEP', { startup: 21, motion: 'sweep' }),
      heavy: {
        ex: { text: 'ARMORED, KNOCKDOWN', armor: { hits: 1 }, hit: { knockdown: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Double Palm', label: 'DEFINITE INTEGRAL', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 19, active: 3, recovery: 21, damage: 22,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 26, w: 28, y: 52, h: 22 }, push: 26, juggle: 3.6, carry: 2, shake: 0.006,
        step: [11, 19, 1.6],
        anim: [[1, 'idle'], [13, 'hv_c'], [19, 'hv_x'], [22, 'hv_x'], [30, 'hv_r'], [42, 'idle']]
      },
      fH: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Chopping Palm', label: 'CONCAVE DOWN', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 22, active: 3, recovery: 21, damage: 19, guardDmg: 24,
        block: -7, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 28, w: 24, y: 44, h: 26 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 22, 1.2],
        anim: [[1, 'idle'], [14, 'ham_c'], [22, 'ham_x'], [25, 'ham_x'], [34, 'hv_r'], [46, 'idle']]
      },
      // Derivative Read: a parry stance (hold H to keep it up). He reads the level and counters.
      bH: {
        name: 'Parry Stance', label: 'DERIVATIVE READ', cmd: 'B+H (HOLD)', level: 'mid', strength: 'light',
        startup: 32, active: 1, recovery: 1, hold: { at: 10, btn: 'h', max: 50 },
        parry: { from: 3, to: 12, levels: ['high', 'mid', 'low'], counters: { high: 'readHigh', mid: 'reject', low: 'readLow' } },
        parryLabel: 'DERIVATIVE READ!',
        anim: [[1, 'idle'], [3, 'parry'], [14, 'parry'], [32, 'idle']]
      },
      readHigh: {
        name: 'Wrist Lock', label: "L'HOPITAL LOCK", cmd: 'READ A HIGH', level: 'mid', strength: 'heavy', motion: 'throw',
        startup: 6, active: 3, recovery: 20, damage: 22,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 16, w: 32, y: 40, h: 40 }, push: 6, juggle: 3.5, carry: 0.4, shake: 0.007,
        anim: [[1, 'parry'], [6, 'lock_x'], [10, 'lock_x'], [28, 'idle']]
      },
      reject: {
        name: 'Counter Palm', label: 'CRITICAL POINT', cmd: 'READ A MID', level: 'mid', strength: 'heavy', motion: 'straight',
        startup: 7, active: 3, recovery: 18, damage: 22,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 22, w: 32, y: 44, h: 30 }, push: 22, juggle: 3.5, carry: 1.8, shake: 0.007,
        anim: [[1, 'parry'], [7, 'counter_x'], [10, 'counter_x'], [27, 'idle']]
      },
      readLow: {
        name: 'Trapping Sweep', label: 'SADDLE POINT', cmd: 'READ A LOW', level: 'low', strength: 'heavy', motion: 'sweep', crouching: true,
        startup: 7, active: 3, recovery: 20, damage: 18, noTech: true,
        block: -12, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 30, y: 0, h: 20 }, push: 8, juggle: 2.5, shake: 0.006,
        anim: [[1, 'parry'], [7, 'trip_x'], [10, 'trip_x'], [28, 'idle']]
      },
      launcher: {
        name: 'Rising Palm', label: 'LIMIT BREAK', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 16, active: 4, recovery: 22, damage: 17,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 16, 1.3],
        cancels: [{ btn: 'up', into: 'jump', from: 18, to: 29, onHit: true }],
        anim: [[1, 'crouch'], [10, 'outlier_c'], [16, 'outlier_x'], [20, 'outlier_x'], [29, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['LEFT-HAND LIMIT', 'RIGHT-HAND LIMIT', 'INFLECTION SPIKE'], { slow: 1 }),
    FG.kit.throws('SQUEEZE THEOREM', 'U-SUBSTITUTION', { throw: { damage: 32 }, throwB: { damage: 34 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'FIRST DERIVATIVE', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 15: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'LIMIT BREAK JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 40: 'P', 58: 'P', 69: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'INFLECTION POINT', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 32: 'P', 38: 'K', 47: 'H', 80: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      { name: 'MEAN VALUE PUNISH', difficulty: 'medium', notation: 'BLOCK THEIR JAB, P, D+K ON THE GROUND',
        hold: [[0, 11, 'B']], oppPlan: { 0: 'P' }, plan: { 21: 'P', 63: 'D+K' }, hits: ['postBlockP', 'low'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'DOUBLE CONCAVE', difficulty: 'medium', meter: 1, notation: 'F+H, P+K', steps: ['F+H, P+K (1 BAR)', 'SECOND HIT'],
        plan: { 0: 'F+H', 3: 'P+K' }, hits: ['fHEX', 'fHEX'] },
      { name: 'FUNDAMENTAL THEOREM', difficulty: 'hard', meter: 3, notation: 'THEY ATTACK: D, D/F, F+P+K+H', oppPlan: { 12: 'P' },
        plan: { 0: 'D', 1: 'D/F', 2: 'F', 3: 'F+P+K+H' }, hits: ['ultimate'] }
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
      quips: ['Predictable.', 'As expected.', 'Rate of change: zero.']
    },
    victoryLines: [
      "I knew you'd do that.",
      'I took the derivative of your chances. Decreasing.',
      "Integrate your mistakes. That's a lot of area."
    ]
  });
})();
