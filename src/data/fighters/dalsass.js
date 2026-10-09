// DALSASS — Tricky — Geometry (triangles and proofs). A movement-based trickster:
// he bobs and sways, ducks under highs, leans back from attacks, and his loose,
// playful stance keeps switching its lead.
//
// Signature: SIMILAR TRIANGLES. A second stance (B+P) with a completely different
// set of moves. Any of his attacks, from either stance, can be feinted: tap back
// during its startup and it never comes out (the next attack counts as out of a
// feint). Assume the Contrary (B+K) sways back out of highs and mids; if something
// misses him, P springs back in with The Converse.
(function () {
  var R = FG.rigger({ torso: 27, neck: 12, upper: 15, fore: 13, thigh: 23.5, shin: 24 });

  // Loose and low-handed, leaning back; the lead hand hangs by the hip.
  var stance = R({ hip: [-1, 44], lean: -7, fa: { hand: [18, 58] }, ba: { hand: [7, 78] }, fl: { foot: [15, 0] }, bl: { foot: [-15, 0] } });
  // The same stance with the lead swapped: feet trade places, hands trade heights.
  var stance2 = R({ hip: [1, 44], lean: -2, fa: { hand: [12, 78] }, ba: { hand: [16, 56] }, fl: { foot: [6, 0] }, bl: { foot: [-9, 0] } });
  // Similar Triangles: low and wide, arms out in a triangle.
  var pw = R({ hip: [0, 34], lean: 20, fa: { hand: [26, 54] }, ba: { hand: [-12, 50] }, fl: { foot: [20, 0] }, bl: { foot: [-22, 0] } });

  var poses = {
    idle: stance,
    idle2: stance2,
    pw_idle: pw,
    point: R({ hip: [0, 45], lean: -4, fa: [10, 12], ba: { hand: [4, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    shrug: R({ hip: [0, 45], lean: -4, neck: -8, fa: [-30, 60], ba: [-150, 120], fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }),
    // Pop Quiz (the ultimate): the stack of papers, the red pen, the smack.
    papers_up: R({ hip: [0, 46], lean: -6, neck: -6, fa: [72, 96], ba: [66, 92], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    papers_slam: R({ hip: [3, 38], lean: 32, neck: 10, fa: { hand: [28, 40] }, ba: { hand: [24, 42] }, fl: { foot: [17, 0] }, bl: { foot: [-14, 0] } }),
    snatch: R({ hip: [3, 45], lean: 8, fa: [12, 26], ba: { hand: [4, 60] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    pen: R({ hip: [0, 46], lean: 2, neck: 8, fa: { hand: [17, 84] }, ba: { hand: [20, 80] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    pen2: R({ hip: [0, 46], lean: 4, neck: 10, fa: { hand: [17, 84] }, ba: { hand: [19, 70] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    stack_up: R({ hip: [-2, 47], lean: -16, neck: -8, fa: [104, 124], ba: [98, 118], fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    stack_x: R({ hip: [7, 40], lean: 36, neck: 8, fa: [-8, -26], ba: [-4, -22], fl: { foot: [22, 0] }, bl: { foot: [-12, 0] } }),
    wag: R({ hip: [0, 45], lean: -4, fa: [-40, 85], ba: { hand: [4, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    wag2: R({ hip: [0, 45], lean: -4, fa: [-40, 78], ba: { hand: [4, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    guns: R({ hip: [0, 45], lean: -6, fa: [5, 10], ba: [-5, 5], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    guns2: R({ hip: [0, 45], lean: -10, fa: [15, 30], ba: [5, 25], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sit: [0, 10, -4, 36, -2, 48, 6, 28, 12, 20, -12, 26, -18, 14, 18, 24, 30, 2, 12, 20, 24, 0],
    sit2: [0, 10, -5, 35, -4, 46, 6, 28, 12, 20, -12, 26, -18, 14, 18, 24, 30, 2, 12, 20, 24, 0],

    // Movement: ducking, bobbing, leaning back.
    crouch: R({ hip: [-2, 28], lean: 32, fa: { hand: [22, 56] }, ba: { hand: [16, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    squat: R({ hip: [0, 34], lean: 18, fa: { hand: [22, 54] }, ba: { hand: [16, 66] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    jump: R({ hip: [0, 46], lean: -10, fa: [40, 80], ba: [150, 110], fl: [-10, -90], bl: [-100, -40] }),
    dash: R({ hip: [4, 40], lean: 26, fa: { hand: [24, 56] }, ba: { hand: [14, 62] }, fl: { foot: [20, 0] }, bl: { foot: [-20, 5] } }),
    backdash: R({ hip: [-6, 44], lean: -26, fa: [-30, 30], ba: [-150, -120], fl: { foot: [14, 4] }, bl: { foot: [-20, 0] } }),
    sidestep: R({ hip: [0, 36], lean: 24, fa: { hand: [20, 58] }, ba: { hand: [12, 62] }, fl: { foot: [8, 0] }, bl: { foot: [-10, 0] } }),
    // The shoulder roll: lead hand low across the body, rear hand high at the cheek.
    block: R({ hip: [-3, 44], lean: -14, neck: 6, fa: { hand: [10, 56] }, ba: { hand: [8, 82] }, fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    cblock: R({ hip: [-2, 28], lean: 24, fa: { hand: [16, 58] }, ba: { hand: [12, 62] }, fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    // Hit reactions: big and theatrical.
    hit_high: R({ hip: [-4, 45], lean: -26, neck: -16, fa: [120, 160], ba: [150, 200], fl: { foot: [16, 0] }, bl: { foot: [-18, 0] } }),
    hit_mid: R({ hip: [-5, 40], lean: 30, neck: 12, fa: [-60, -10], ba: [-75, 0], fl: { foot: [8, 0] }, bl: { foot: [-12, 0] } }),
    hit_low: R({ hip: [-2, 46], lean: -6, fa: [30, 90], ba: [160, 120], fl: [20, -60], bl: { foot: [-10, 0] } }),
    gbreak: R({ hip: [-5, 44], lean: -20, fa: [70, 140], ba: [110, 170], fl: { foot: [18, 0] }, bl: { foot: [-18, 0] } }),
    juggle: R({ hip: [0, 22], lean: -60, neck: -20, fa: [150, 200], ba: [120, 170], fl: [40, 10], bl: [-10, -50] }),
    down: R({ hip: [0, 6], lean: -88, fa: [140, 120], ba: [-170, 170], fl: [30, -30], bl: [-5, 0] }),
    roll: R({ hip: [0, 20], lean: 60, fa: [-80, -60], ba: [-100, -70], fl: [-20, -120], bl: [-60, -150] }),

    // Given: a flicker jab from the low lead hand.
    jab_c: R({ hip: [0, 44], lean: -4, fa: { hand: [20, 56] }, ba: { hand: [8, 78] }, fl: { foot: [16, 0] }, bl: { foot: [-15, 0] } }),
    jab_x: R({ hip: [7, 44], lean: 18, fa: [4, 14], ba: { hand: [14, 76] }, fl: { foot: [22, 0] }, bl: { foot: [-13, 0] } }),
    // Statement: a whipping backfist.
    cross_c: R({ hip: [2, 44], lean: 4, neck: -6, fa: { hand: [2, 74] }, ba: { hand: [10, 76] }, fl: { foot: [18, 0] }, bl: { foot: [-14, 0] } }),
    cross_x: R({ hip: [7, 44], lean: 14, fa: [20, 8], ba: { hand: [12, 70] }, fl: { foot: [22, 0] }, bl: { foot: [-12, 0] } }),
    // Reason Kick: a lazy snap kick, leaning way back.
    mid_c: R({ hip: [-3, 45], lean: -18, fa: [-20, 40], ba: [-150, -110], fl: [45, -70], bl: { foot: [-14, 0] } }),
    mid_x: R({ hip: [-4, 46], lean: -30, fa: [60, 120], ba: [-160, -120], fl: [16, 22], bl: { foot: [-15, 0] } }),
    // Leg Kick: ducks under and pokes the shin with a straight leg.
    low_c: R({ hip: [-2, 30], lean: 34, fa: { hand: [22, 58] }, ba: { hand: [14, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    low_x: R({ hip: [0, 26], lean: 30, fa: { hand: [22, 52] }, ba: { hand: [12, 56] }, fl: { foot: [46, 6] }, bl: { foot: [-14, 0] } }),
    // Base Sweep: hands on the floor, a breakdancer's sweep.
    sweep_c: R({ hip: [0, 22], lean: 48, fa: { hand: [22, 2] }, ba: { hand: [10, 2] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [-2, 18], lean: 52, fa: { hand: [16, 2] }, ba: { hand: [4, 2] }, fl: { foot: [50, 4] }, bl: { foot: [-6, 6] } }),
    // Supplementary Slide: a baseball slide.
    slide: R({ hip: [0, 10], lean: -62, fa: [60, 100], ba: { hand: [-20, 2] }, fl: { foot: [46, 4] }, bl: [-20, -60] }),
    // Side-Angle-Side: a windmill bolo punch.
    hv_c: R({ hip: [-4, 44], lean: -12, fa: { hand: [12, 70] }, ba: [-150, -110], fl: { foot: [14, 0] }, bl: { foot: [-17, 0] } }),
    hv_x: R({ hip: [9, 42], lean: 20, fa: { hand: [6, 60] }, ba: [12, 40], fl: { foot: [26, 0] }, bl: { foot: [-12, 2] } }),
    hv_r: R({ hip: [5, 43], lean: 10, fa: { hand: [14, 62] }, ba: { hand: [16, 74] }, fl: { foot: [20, 0] }, bl: { foot: [-14, 0] } }),
    // Proof by Contradiction: a huge overhead windup... that might be nothing.
    feint_c: R({ hip: [-4, 46], lean: -16, fa: [110, 150], ba: [125, 165], fl: { foot: [14, 0] }, bl: { foot: [-16, 0] } }),
    feint_x: R({ hip: [0, 45], lean: -6, neck: -10, fa: [-40, 60], ba: [-150, 120], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    // Indirect Proof: the real one, a double-axe-handle hammer.
    drop_x: R({ hip: [8, 40], lean: 32, fa: { hand: [38, 44] }, ba: { hand: [34, 46] }, fl: { foot: [24, 0] }, bl: { foot: [-12, 0] } }),
    // Similar Triangles: a spin into the stance; twin palms, a spinning low heel, an axe kick.
    spin: R({ hip: [0, 42], lean: 6, fa: [-150, -100], ba: [20, 60], fl: { foot: [-4, 0] }, bl: { foot: [6, 0] } }),
    pw_palm_c: R({ hip: [-2, 34], lean: 12, fa: { hand: [14, 56] }, ba: { hand: [6, 54] }, fl: { foot: [20, 0] }, bl: { foot: [-22, 0] } }),
    pw_palm: R({ hip: [10, 34], lean: 26, fa: [0, 6], ba: [-4, 0], fl: { foot: [30, 0] }, bl: { foot: [-16, 0] } }),
    pw_low: R({ hip: [-2, 20], lean: 40, fa: { hand: [20, 2] }, ba: { hand: [30, 40] }, fl: { foot: [-10, 0] }, bl: { foot: [48, 4] } }),
    axe_c: R({ hip: [0, 44], lean: -14, fa: [40, 90], ba: [150, 110], fl: [85, 95], bl: { foot: [-12, 0] } }),
    axe_x: R({ hip: [4, 42], lean: 14, fa: [-30, 20], ba: [-150, -120], fl: [10, -50], bl: { foot: [-12, 0] } }),
    // Pythagorean Launcher: duck under, then spring up with an uppercut, feet off the floor.
    up_c: R({ hip: [-2, 26], lean: 34, fa: { hand: [14, 30] }, ba: { hand: [12, 56] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    up_x: R({ hip: [4, 54], lean: -6, fa: [75, 95], ba: [-150, -120], fl: { foot: [10, 6] }, bl: { foot: [-10, 8] } }),
    up_r: R({ hip: [2, 46], lean: -10, fa: [60, 100], ba: [-150, -120], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    // Assume the Contrary: sways way back. The Converse: springs back in with a straight.
    sway: R({ hip: [-9, 40], lean: -40, neck: -10, fa: [-60, -20], ba: [-120, -90], fl: { foot: [14, 0] }, bl: { foot: [-20, 0] } }),
    sway_x: R({ hip: [10, 42], lean: 24, fa: [5, 5], ba: { hand: [16, 66] }, fl: { foot: [26, 0] }, bl: { foot: [-12, 2] } }),

    // Air: Angle Bisector (a diving slap), Median Kick (a scissor kick), Centroid Spike (a seat drop).
    air_p: R({ hip: [0, 46], lean: 22, fa: [-10, -20], ba: [150, 110], fl: [-10, -90], bl: [-100, -40] }),
    air_k: R({ hip: [0, 46], lean: -24, fa: [60, 120], ba: [150, 120], fl: [10, -10], bl: [-60, -120] }),
    air_hc: R({ hip: [0, 50], lean: -20, fa: [90, 120], ba: [110, 140], fl: [30, -20], bl: [20, -40] }),
    air_hx: R({ hip: [0, 40], lean: -14, fa: [100, 140], ba: [120, 150], fl: [10, -10], bl: [0, -30] }),

    // Congruence Lock: a headlock noogie. Counterexample: a hip toss the other way.
    grab_c: R({ hip: [2, 44], lean: 10, fa: { hand: [24, 76] }, ba: { hand: [18, 70] }, fl: { foot: [16, 0] }, bl: { foot: [-14, 0] } }),
    grab_x: R({ hip: [6, 42], lean: 22, fa: { hand: [28, 66] }, ba: { hand: [24, 72] }, fl: { foot: [20, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [4, 42], lean: 16, fa: { hand: [26, 66] }, ba: [40, 80], fl: { foot: [18, 0] }, bl: { foot: [-14, 0] } }),
    throw_slam: R({ hip: [6, 36], lean: 30, fa: { hand: [30, 30] }, ba: [-20, -50], fl: { foot: [22, 0] }, bl: { foot: [-14, 0] } }),
    throw_back: R({ hip: [-2, 40], lean: -20, fa: [150, 200], ba: [130, 180], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    wake_low: R({ hip: [-2, 12], lean: -50, fa: { hand: [-14, 2] }, ba: [40, 100], fl: { foot: [42, 4] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [2, 46], lean: 20, fa: [10, 30], ba: [-150, -120], fl: { foot: [16, 0] }, bl: { foot: [-12, 4] } })
  };

  poses.taunt = poses.wag;

  FG.defineFighter({
    id: 'dalsass', order: 3,
    homeStage: 'hallway',
    glyphs: ['A*A+B*B=C*C', 'SAS', 'ASA', 'GIVEN:'], // math that flies off their big hits
    stringH: 'THEREFORE', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x2fc4c0, b: 0xffffff }, // cut-in colours: main and accent
    // KO finisher: after winning the final round, this input within 2 seconds of the K.O.
    finisher: { name: 'SEE ME AFTER CLASS', input: 'D, D, P' },
    // Ultimate (D, D/F, F + P+K+H, three bars): a cinematic in src/render/ultimates.js.
    ultimate: { name: 'POP QUIZ', text: 'he slams down a stack of papers: they are at a student desk with a quiz and a ticking timer, sweating; he snatches the paper, red-pens a giant F, and smacks them with the whole stack while the class goes wild', from: 'heavy', len: 280, hits: [142, 152, 160, 196], weights: [1, 1, 1, 5], end: { gap: 76, down: true } },
    name: 'DALSASS', archetype: 'TRICKY', theme: 'GEOMETRY PROOFS',
    style: 'TRICKSTER', signatureMechanic: 'SIMILAR TRIANGLES',
    signatureText: 'a second stance (B+P) with its own moves; tap back during any attack\'s startup to feint it; Assume the Contrary (B+K) sways out of highs and mids, then P counters with The Converse',
    stanceName: 'SIMILAR TRIANGLES', // the alternate stance, shown over his head
    bio: "HAPPY, SASSY, EVERYONE'S FAVORITE. FAKES YOU OUT WITH A GRIN.",
    signature: ['SIMILAR TRIANGLES', 'PROOF BY CONTRADICTION', 'SUPPLEMENTARY SLIDE', 'PYTHAGOREAN LAUNCHER', 'CONGRUENCE LOCK'],
    scale: 1.0, health: 170,
    // Movement: light on his feet backward, the best backdash of the strikers.
    walkF: 2.0, walkB: 1.8, dashSpeed: 8.6, backdashSpeed: 9.6,
    jumpVy: 9.4, weight: 1.02, react: 1.35,
    walk: { lean: -1, bob: 2.5, rate: 0.18 },
    feintCancel: true, // tap back during any attack's startup to cancel it
    crowdFavorite: true, // the background students cheer louder for him
    look: {
      skin: 0xe0ac7e,
      hair: { style: 'spiky', color: 0x5a3a22 },
      beard: { style: 'goatee', color: 0x8a7d70 },
      mouth: 'grin', lines: true,
      top: { style: 'polo', color: 0x9fe0d8, pattern: 'stripes', patternColor: 0xf2fbfa, sleeves: 'short' },
      legs: 0xb59a72, shoes: 0x5a3a22,
      build: { torso: 1.12, limb: 1.05 }
    },
    // Bobbing and swaying; every couple of seconds he switches his lead.
    idleAnim: { breath: 1.4, sway: 3.5, bob: 1.5, rate: 0.08, switchEvery: 150 },
    poses: poses,
    // How the CPU plays him: feints, sways, stance mixups.
    ai: { spacing: 48, pokes: ['K', 'D/F+K', 'B+P'], close: ['P', 'F+H', 'D+K', 'B+K'], aggro: 1.0, feint: 0.3, sway: 0.25 },

    moves: FG.kit.moves({
      jab: {
        name: 'Flicker Jab', label: 'GIVEN', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 66, h: 16 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Backfist', label: 'STATEMENT', cmd: 'P,P', level: 'high', strength: 'light', motion: 'hook',
        startup: 10, active: 2, recovery: 17, damage: 10,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 26, y: 66, h: 16 }, push: 9, juggle: 3.4,
        // Into the feint straight from the string: P, P, K (P, P, H is the string heavy).
        cancels: [{ btn: 'k', into: 'fH', from: 10, to: 24 }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [28, 'idle']]
      },
      mid: {
        name: 'Lazy Snap Kick', label: 'REASON KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 15, active: 3, recovery: 19, damage: 15,
        block: -7, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 28, y: 44, h: 24 }, push: 16, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'mid_c'], [15, 'mid_x'], [18, 'mid_x'], [26, 'mid_c'], [37, 'idle']]
      },
      low: {
        name: 'Ducking Shin Poke', label: 'LEG KICK', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low',
        startup: 16, active: 3, recovery: 20, damage: 10, crouching: true, tracks: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'low_c'], [16, 'low_x'], [19, 'low_x'], [29, 'low_c'], [38, 'crouch']]
      },
      sweep: FG.kit.sweep('BASE SWEEP', { startup: 21, recovery: 26, motion: 'sweep' }),
      dfK: {
        ex: { text: 'TWO HITS, LAUNCHES', multi: 1, hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Slide', label: 'SUPPLEMENTARY SLIDE', cmd: 'D/F+K', level: 'low', strength: 'heavy', motion: 'sweep', crouching: true,
        startup: 18, active: 5, recovery: 24, damage: 14,
        block: -16, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 32, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.004,
        step: [6, 22, 4.2],
        anim: [[1, 'crouch'], [8, 'sweep_c'], [18, 'slide'], [26, 'slide'], [36, 'sweep_c'], [46, 'crouch']]
      },
      heavy: {
        name: 'Bolo Punch', label: 'SIDE-ANGLE-SIDE', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'hook', wallSplat: true,
        startup: 18, active: 3, recovery: 22, damage: 20,
        block: -5, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 20, w: 26, y: 50, h: 22 }, push: 24, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 1.6],
        anim: [[1, 'idle'], [12, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [30, 'hv_r'], [42, 'idle']]
      },
      // Proof by Contradiction: looks exactly like the Indirect Proof windup. Cancel it into
      // P (jab), D+K (low), H (the real overhead) or P+K (throw), or let it fizzle.
      fH: {
        name: 'Feint', label: 'PROOF BY CONTRADICTION', cmd: 'F+H', level: 'mid', strength: 'light', feint: true,
        startup: 23, active: 1, recovery: 1,
        cancels: [
          { btn: 'throw', into: 'throw', from: 6, to: 18 },
          { btn: 'h', into: 'drop', from: 6, to: 18 },
          { btn: 'k', into: 'low', from: 6, to: 18 },
          { btn: 'p', into: 'jab', from: 6, to: 18 }
        ],
        anim: [[1, 'idle'], [10, 'feint_c'], [18, 'feint_c'], [24, 'feint_x']]
      },
      drop: {
        ex: { text: 'ARMORED, KNOCKDOWN', armor: { hits: 1 }, hit: { knockdown: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Overhead', label: 'INDIRECT PROOF', cmd: 'F+H, H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 14, active: 3, recovery: 22, damage: 18, guardDmg: 22,
        block: -8, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 26, w: 20, y: 32, h: 26 }, push: 16, juggle: 2.5, shake: 0.007,
        step: [6, 14, 1.4],
        anim: [[1, 'feint_c'], [14, 'drop_x'], [17, 'drop_x'], [26, 'hv_r'], [38, 'idle']]
      },
      // Assume the Contrary: sway back out of highs and mids (not lows or throws). If something
      // misses him, P springs back in with The Converse.
      bK: {
        name: 'Sway', label: 'ASSUME THE CONTRARY', cmd: 'B+K', level: 'mid', strength: 'light',
        startup: 20, active: 1, recovery: 6, evade: { from: 3, to: 16, levels: ['high', 'mid'] },
        cancels: [{ btn: 'p', into: 'swayP', from: 5, to: 26, onSway: true }],
        anim: [[1, 'idle'], [4, 'sway'], [16, 'sway'], [26, 'idle']]
      },
      swayP: {
        ex: { text: 'HIGHER LAUNCH', hit: { launch: 7.6 } }, // enhanced (P+K during startup, 1 bar)
        name: 'Sway Counter', label: 'THE CONVERSE', cmd: 'B+K, P', level: 'mid', strength: 'heavy', motion: 'straight',
        startup: 8, active: 3, recovery: 18, damage: 16,
        block: -6, hit: { launch: 6.2 }, ch: { launch: 6.8 },
        hitbox: { x: 22, w: 30, y: 52, h: 22 }, push: 8, juggle: 4, carry: 0.6, shake: 0.006,
        step: [2, 8, 2.4],
        anim: [[1, 'sway'], [8, 'sway_x'], [11, 'sway_x'], [20, 'hv_r'], [29, 'idle']]
      },
      // Similar Triangles: back + P switches stance; in stance P/K/H become pwP/pwK/pwH.
      bP: {
        name: 'Stance', label: 'SIMILAR TRIANGLES', cmd: 'B+P', level: 'mid', strength: 'light', stanceSwitch: true,
        startup: 12, active: 1, recovery: 1,
        anim: [[1, 'idle'], [6, 'spin'], [12, 'pw_idle']]
      },
      pwP: {
        name: 'Twin Palms', label: 'SIMILAR PALM', cmd: 'STANCE P', level: 'mid', strength: 'medium', motion: 'straight',
        startup: 12, active: 2, recovery: 18, damage: 12,
        block: -4, hit: { adv: 6 }, ch: { adv: 10 },
        hitbox: { x: 24, w: 22, y: 40, h: 22 }, push: 12, juggle: 3.4, shake: 0.002,
        anim: [[1, 'pw_idle'], [8, 'pw_palm_c'], [12, 'pw_palm'], [14, 'pw_palm'], [31, 'idle']]
      },
      pwK: {
        name: 'Spinning Low Heel', label: 'SCALE FACTOR', cmd: 'STANCE K', level: 'low', strength: 'medium', motion: 'sweep', crouching: true,
        startup: 13, active: 3, recovery: 20, damage: 11, otg: true,
        block: -12, hit: { adv: 1 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'pw_idle'], [9, 'sweep_c'], [13, 'pw_low'], [16, 'pw_low'], [26, 'crouch'], [35, 'idle']]
      },
      pwH: {
        name: 'Axe Kick', label: 'ANGLE-ANGLE', cmd: 'STANCE H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 20, active: 3, recovery: 20, damage: 20, guardDmg: 22,
        block: -6, hit: { adv: 4 }, ch: { launch: 6 },
        hitbox: { x: 30, w: 22, y: 30, h: 30 }, push: 14, juggle: 2.5, shake: 0.007,
        anim: [[1, 'pw_idle'], [12, 'axe_c'], [20, 'axe_x'], [23, 'axe_x'], [32, 'hv_r'], [42, 'idle']]
      },
      launcher: {
        name: 'Rising Uppercut', label: 'PYTHAGOREAN LAUNCHER', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 23, damage: 17,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['ANGLE BISECTOR', 'MEDIAN KICK', 'CENTROID SPIKE'], { chain: { airP: ['h'], airK: ['h'] } }),
    FG.kit.throws('CONGRUENCE LOCK', 'COUNTEREXAMPLE', { throwB: { damage: 33 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'GIVEN, PROVE', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 15: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'PYTHAGOREAN JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 39: 'P', 53: 'P', 61: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'CENTROID SPIKE', difficulty: 'hard', notation: 'D+H, UP, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 31: 'K', 41: 'H', 70: 'K' }, hits: ['launcher', 'airK', 'airH', 'mid'] },
      { name: 'SUPPLEMENTARY STOMP', difficulty: 'medium', notation: 'D/F+K, D+K ON THE GROUND', plan: { 0: 'D/F+K', 49: 'D+K' }, hits: ['dfK', 'low'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'SUPPLEMENTARY LAUNCH', difficulty: 'medium', meter: 1, notation: 'D/F+K, P+K, P, P, H', steps: ['D/F+K, P+K (1 BAR)', 'SECOND HIT', 'P', 'P', 'H'],
        plan: { 0: 'D/F+K', 3: 'P+K', 44: 'P', 56: 'P', 64: 'H' }, hits: ['dfKEX', 'dfKEX', 'jab', 'jab2', 'jabH'] },
      { name: 'TWO-COLUMN PROOF', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'idle'], [14, 'point'], [36, 'point'], [50, 'shrug'], [72, 'shrug'], [86, 'idle']],
    victory: [[1, 'shrug'], [16, 'guns'], [30, 'guns2'], [44, 'guns'], [58, 'guns2'], [76, 'shrug'], [100, 'shrug']],
    defeat: [[1, 'sit'], [40, 'sit2'], [80, 'sit']],
    gestures: { wag: [[1, 'idle'], [6, 'wag'], [12, 'wag2'], [18, 'wag'], [24, 'wag2'], [30, 'wag'], [40, 'idle']] },
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'Oh, you brought a strategy? Cute.',
        'Pop quiz, sweetie. You\'re not ready.',
        'I\'d say good luck, but I don\'t lie to students.'
      ],
      quips: ['Gotcha!', 'Too easy, sweetie.', 'Ooh, partial credit.']
    },
    victoryLines: [
      "That's a ten out of ten, no partial credit.",
      'Oh honey, that was not on the study guide.',
      'You fell for that? It was in the syllabus.'
    ]
  });
})();
