// MATEUS — Balanced / Striker — "GNOME". A 10th grader, the cover fighter of the student
// side, and a Muay Thai fighter: calm, focused, a little cocky. He uses all eight limbs
// (fists, elbows, knees, shins) from a tall, square stance, hands high, lead leg light,
// bouncing on the balls of his feet. He doesn't talk much in a fight; he says one cold
// line after a big hit.
//
// Signature: THE CLINCH. His throw (P+K up close) locks a Thai clinch, hands behind their
// head (src/engine/clinch.js). From it: P a knee to the body (up to three, each one
// stronger), K an off-balance dump, H a jumping knee that launches, back a short elbow
// on the way out. They escape on timing (P right as he locks it) or by mashing.
// Low Kick (D+K) stacks leg damage: three that land slow their walk. Check: press back
// just as a low kick lands and he takes it on the shin; the kicker staggers.
(function () {
  // A 10th grader, long-limbed for his size: a tall stance.
  var R = FG.rigger({ torso: 26, neck: 11, upper: 14.5, fore: 13, thigh: 23, shin: 23.5 });
  var hands = function (fx, fy, bx, by) { return { fa: { hand: [fx, fy] }, ba: { hand: [bx, by] } }; };
  var pose = function (spec, h) { return R(Object.assign(spec, h || {})); };
  var GUARD = hands(13, 79, 7, 80);       // hands high: lead glove at the brow, rear at the cheek
  var FEET = { fl: { foot: [9, 0] }, bl: { foot: [-10, 0] } }; // square, not wide

  var poses = {
    // Tall and square, chin tucked, leaning back a touch over the rear leg.
    idle: pose(Object.assign({ hip: [0, 44.5], lean: -3, neck: 4 }, FEET), GUARD),
    stand: R({ hip: [0, 45.5], lean: -1, fa: [-84, -76], ba: [-92, -86], fl: { foot: [5, 0] }, bl: { foot: [-6, 0] } }),
    // Wai: palms together at his chest, a small bow.
    wai: R({ hip: [0, 45], lean: 20, neck: 18, fa: { hand: [10, 68] }, ba: { hand: [9, 67] }, fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),
    // Touching the red armband on his lead arm.
    band: R({ hip: [0, 45.5], lean: -2, neck: 6, fa: [-80, -60], ba: { hand: [8, 60] }, fl: { foot: [5, 0] }, bl: { foot: [-6, 0] } }),
    nod: pose({ hip: [0, 44.5], lean: 0, neck: 14, fl: { foot: [9, 0] }, bl: { foot: [-10, 0] } }, GUARD),
    // Taunt: lead glove up and open, two fingers beckoning.
    beckon: R({ hip: [0, 45], lean: -6, neck: -4, fa: [20, 80], ba: { hand: [7, 80] }, fl: { foot: [9, 0] }, bl: { foot: [-10, 0] } }),
    beckon2: R({ hip: [0, 45], lean: -6, neck: -4, fa: [20, 110], ba: { hand: [7, 80] }, fl: { foot: [9, 0] }, bl: { foot: [-10, 0] } }),
    // Walking away: hands down, shoulders loose.
    away1: R({ hip: [0, 45.5], lean: 2, fa: [-84, -80], ba: [-96, -90], fl: { foot: [10, 3] }, bl: { foot: [-8, 0] } }),
    away2: R({ hip: [0, 45.5], lean: 2, fa: [-96, -90], ba: [-84, -80], fl: { foot: [2, 0] }, bl: { foot: [-2, 3] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),

    // Movement: upright, bouncing; a shuffle forward, a skip back. Never low.
    crouch: pose({ hip: [0, 28], lean: 16, neck: 6, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }, hands(13, 60, 8, 62)),
    squat: pose({ hip: [0, 34], lean: 10, fl: { foot: [11, 0] }, bl: { foot: [-11, 0] } }, hands(13, 66, 7, 68)),
    jump: pose({ hip: [0, 46], lean: 0, fl: [-40, -110], bl: [-120, -80] }, hands(14, 80, 8, 80)),
    dash: pose({ hip: [3, 43], lean: 6, neck: 6, fl: { foot: [16, 3] }, bl: { foot: [-6, 0] } }, hands(15, 78, 9, 79)),
    backdash: pose({ hip: [-3, 45], lean: -8, fl: { foot: [12, 0] }, bl: { foot: [-14, 4] } }, hands(12, 80, 6, 81)),
    sidestep: pose({ hip: [0, 40], lean: 6, neck: 6, fl: { foot: [8, 0] }, bl: { foot: [-9, 0] } }, hands(12, 76, 7, 77)),
    // Guard: both forearms up tight round his head, elbows in.
    block: pose({ hip: [-1, 44], lean: 4, neck: 10, fl: { foot: [9, 0] }, bl: { foot: [-11, 0] } }, hands(11, 82, 9, 83)),
    cblock: pose({ hip: [-1, 27], lean: 18, neck: 8, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }, hands(13, 58, 10, 54)),
    // The check: lead knee up and out, the shin taking the kick.
    check: pose({ hip: [-1, 45.5], lean: -5, neck: 4, fl: [20, -95], bl: { foot: [-10, 0] } }, hands(14, 80, 6, 80)),
    // Hit reactions: he takes them standing tall, the head snapping back.
    hit_high: R({ hip: [-3, 45], lean: -14, neck: -16, fa: [50, -10], ba: { hand: [2, 76] }, fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }),
    hit_mid: R({ hip: [-4, 40], lean: 24, neck: 10, fa: { hand: [12, 44] }, ba: { hand: [6, 46] }, fl: { foot: [9, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 40], lean: 10, fa: { hand: [14, 76] }, ba: [-130, -100], fl: [-50, -100], bl: { foot: [-13, 0] } }),
    gbreak: R({ hip: [-4, 44], lean: -14, neck: -8, fa: [40, 100], ba: [60, 120], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -54, neck: -14, fa: [70, 130], ba: [100, 150], fl: [40, -20], bl: [10, -50] }),
    down: R({ hip: [0, 6], lean: -86, fa: [110, 170], ba: [-170, -130], fl: [14, -14], bl: [-6, 6] }),

    // Jab-Cross: a snapping lead jab, then the rear hand straight down the middle with the
    // hip turning in and the rear heel coming up.
    jab_c: pose({ hip: [1, 45], lean: 0, neck: 4, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }, hands(15, 78, 7, 80)),
    jab_x: R({ hip: [3, 45], lean: 6, neck: 4, fa: [8, 3], ba: { hand: [7, 80] }, fl: { foot: [13, 0] }, bl: { foot: [-9, 0] } }),
    cross_c: pose({ hip: [2, 45], lean: 4, neck: 4, fl: { foot: [11, 0] }, bl: { foot: [-9, 0] } }, hands(10, 80, 4, 76)),
    cross_x: R({ hip: [6, 45], lean: 12, neck: 6, fa: { hand: [9, 79] }, ba: [6, 2], fl: { foot: [14, 0] }, bl: { foot: [-5, 2] } }),
    // Rear Uppercut: dip, then drive up through the rear hip.
    upper_c: R({ hip: [0, 38], lean: 10, neck: 6, fa: { hand: [13, 74] }, ba: { hand: [8, 52] }, fl: { foot: [11, 0] }, bl: { foot: [-11, 0] } }),
    upper_x: R({ hip: [4, 46], lean: -4, neck: -2, fa: { hand: [10, 80] }, ba: [35, 80], fl: { foot: [12, 0] }, bl: { foot: [-6, 2] } }),
    upper_r: pose({ hip: [2, 45], lean: 0, fl: { foot: [11, 0] }, bl: { foot: [-9, 0] } }, hands(12, 80, 10, 78)),
    // Slashing Elbow: the lead elbow raised and cut across, short.
    slash_c: R({ hip: [1, 45], lean: 2, neck: 4, fa: [70, -130], ba: { hand: [7, 80] }, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }),
    slash_x: R({ hip: [5, 44], lean: 12, neck: 6, fa: [8, 172], ba: { hand: [6, 78] }, fl: { foot: [14, 0] }, bl: { foot: [-8, 1] } }),
    slash_r: pose({ hip: [3, 44], lean: 6, fl: { foot: [12, 0] }, bl: { foot: [-9, 0] } }, hands(12, 78, 6, 79)),
    // Spinning Elbow: the feet cross as he turns his back, then the rear elbow whips
    // round at head height.
    spin_c: R({ hip: [-1, 44], lean: 0, neck: 8, fa: { hand: [-4, 74] }, ba: { hand: [2, 70] }, fl: { foot: [-4, 0] }, bl: { foot: [8, 0] } }),
    spin_x: R({ hip: [6, 44], lean: 8, neck: 2, fa: { hand: [-6, 66] }, ba: [6, 176], fl: { foot: [15, 0] }, bl: { foot: [-7, 0] } }),
    spin_r: pose({ hip: [3, 44], lean: 4, fl: { foot: [12, 0] }, bl: { foot: [-10, 0] } }, hands(10, 78, 6, 76)),
    // Teep: the lead knee chambers, then the foot drives into the stomach, body back.
    teep_c: pose({ hip: [-2, 45], lean: -10, neck: 6, fl: [45, -75], bl: { foot: [-11, 0] } }, hands(13, 80, 6, 80)),
    teep_x: R({ hip: [-4, 45], lean: -22, neck: 10, fa: [-50, 40], ba: { hand: [2, 79] }, fl: [6, 2], bl: { foot: [-12, 0] } }),
    // Low Kick: the rear leg swings through with the hip, shin into the thigh, the rear
    // arm flung down and back.
    lowk_c: R({ hip: [1, 44], lean: -2, neck: 4, fa: { hand: [13, 79] }, ba: [-110, -70], fl: { foot: [13, 0] }, bl: { foot: [-8, 4] } }),
    lowk_x: R({ hip: [3, 43], lean: -12, neck: 6, fa: { hand: [12, 79] }, ba: [-140, -110], fl: { foot: [12, 0] }, bl: { foot: [32, 16] } }),
    lowk_r: pose({ hip: [2, 44], lean: -4, fl: { foot: [12, 0] }, bl: { foot: [-6, 2] } }, hands(13, 78, 6, 76)),
    // Body Kick: the rear roundhouse, shin level with the ribs.
    body_c: R({ hip: [0, 45], lean: -6, neck: 4, fa: { hand: [13, 80] }, ba: [-100, -60], fl: { foot: [11, 0] }, bl: [-60, -100] }),
    body_x: R({ hip: [1, 46], lean: -20, neck: 10, fa: { hand: [10, 78] }, ba: [-150, -120], fl: { foot: [6, 0] }, bl: [14, 6] }),
    body_r: R({ hip: [1, 45], lean: -10, fa: { hand: [12, 79] }, ba: [-110, -80], fl: { foot: [8, 0] }, bl: [-40, -100] }),
    // Head Kick: the same kick, all the way up: shin to the head.
    head_c: R({ hip: [-1, 45], lean: -8, neck: 4, fa: { hand: [12, 80] }, ba: [-110, -60], fl: { foot: [10, 0] }, bl: [-40, -110] }),
    head_x: R({ hip: [-4, 45], lean: -30, neck: 12, fa: { hand: [6, 78] }, ba: [-150, -130], fl: { foot: [2, 0] }, bl: [40, 34] }),
    head_r: R({ hip: [-2, 45], lean: -16, fa: { hand: [10, 79] }, ba: [-120, -90], fl: { foot: [6, 0] }, bl: [-10, -80] }),
    // Knee (H): both hands reach for the head, the rear knee drives up the middle.
    kn_c: R({ hip: [-1, 45], lean: -6, fa: { hand: [20, 78] }, ba: { hand: [18, 76] }, fl: { foot: [11, 0] }, bl: [-120, -70] }),
    kn_x: R({ hip: [5, 46], lean: -16, neck: 12, fa: { hand: [22, 70] }, ba: { hand: [20, 68] }, fl: { foot: [10, 0] }, bl: [55, -120] }),
    kn_r: pose({ hip: [3, 45], lean: -4, fl: { foot: [12, 0] }, bl: { foot: [-6, 3] } }, hands(15, 78, 9, 78)),
    // Jumping Knee (D+H): a crouch, then up off the floor, the knee straight up the middle.
    jknee_c: pose({ hip: [0, 34], lean: 12, neck: 6, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }, hands(14, 66, 8, 68)),
    jknee_x: R({ hip: [6, 60], lean: -6, neck: 6, fa: { hand: [22, 84] }, ba: { hand: [16, 86] }, fl: [-100, -140], bl: [62, -115] }),
    jknee_r: pose({ hip: [2, 42], lean: 2, fl: { foot: [11, 0] }, bl: { foot: [-10, 0] } }, hands(13, 76, 7, 78)),
    // Superman Punch: a hop off the rear leg, which kicks back as the cross flies out.
    super_c: R({ hip: [2, 47], lean: 4, neck: 4, fa: { hand: [14, 80] }, ba: { hand: [6, 79] }, fl: { foot: [12, 0] }, bl: [-60, -150] }),
    super_x: R({ hip: [10, 58], lean: 18, neck: 4, fa: { hand: [12, 74] }, ba: [8, 4], fl: [-60, -110], bl: [-155, -170] }),
    super_r: pose({ hip: [6, 44], lean: 6, fl: { foot: [14, 0] }, bl: { foot: [-6, 0] } }, hands(13, 78, 8, 79)),
    // Sweep: a low pivot, the rear shin raking along the floor.
    sweep_c: R({ hip: [-1, 24], lean: 24, fa: { hand: [14, 46] }, ba: { hand: [6, 30] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 18], lean: 14, fa: { hand: [12, 40] }, ba: { hand: [-4, 8] }, fl: { foot: [6, 0] }, bl: { foot: [48, 3] } }),

    // The clinch: hands locked behind their head, forehead to forehead, weight shifting.
    clinch: R({ hip: [0, 44], lean: 14, neck: 18, fa: { hand: [24, 80] }, ba: { hand: [22, 78] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    clinch2: R({ hip: [2, 43], lean: 18, neck: 20, fa: { hand: [24, 76] }, ba: { hand: [22, 74] }, fl: { foot: [14, 0] }, bl: { foot: [-9, 0] } }),
    // ...a knee: rear leg back, then driven up into the body as he pulls them down.
    cknee_c: R({ hip: [-3, 45], lean: 8, neck: 16, fa: { hand: [23, 76] }, ba: { hand: [21, 74] }, fl: { foot: [10, 0] }, bl: [-130, -60] }),
    cknee_x: R({ hip: [4, 46], lean: -6, neck: 18, fa: { hand: [22, 66] }, ba: { hand: [20, 64] }, fl: { foot: [9, 0] }, bl: [52, -115] }),
    // ...the dump: a twist, one hand pushing the head, the other pulling the arm, his
    // lead leg sweeping theirs out.
    cdump_c: R({ hip: [0, 42], lean: 6, neck: 12, fa: { hand: [22, 72] }, ba: { hand: [16, 82] }, fl: { foot: [18, 2] }, bl: { foot: [-12, 0] } }),
    cdump_x: R({ hip: [-4, 40], lean: -14, neck: 6, fa: { hand: [6, 48] }, ba: { hand: [18, 84] }, fl: { foot: [28, 7] }, bl: { foot: [-12, 0] } }),
    // ...the jumping knee: pulling the head down into it.
    claunch_c: R({ hip: [0, 40], lean: 18, neck: 18, fa: { hand: [22, 64] }, ba: { hand: [20, 62] }, fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }),
    claunch_x: R({ hip: [6, 58], lean: -6, neck: 10, fa: { hand: [24, 70] }, ba: { hand: [22, 68] }, fl: [-95, -120], bl: [70, -110] }),
    // ...and the elbow on the way out, stepping back.
    celb_c: R({ hip: [-2, 44], lean: 4, neck: 8, fa: [60, -140], ba: { hand: [8, 80] }, fl: { foot: [6, 0] }, bl: { foot: [-15, 0] } }),
    celb_x: R({ hip: [-6, 44], lean: 8, neck: 6, fa: [-4, 176], ba: { hand: [2, 80] }, fl: { foot: [4, 0] }, bl: { foot: [-20, 0] } }),

    // Air: Elbow Drop (the point of the elbow down), Flying Knee, Axe Kick (heel up, then down).
    air_p: R({ hip: [0, 46], lean: 22, neck: 8, fa: [-70, 100], ba: { hand: [6, 76] }, fl: [-40, -100], bl: [-120, -80] }),
    air_k: R({ hip: [0, 46], lean: -4, fa: { hand: [16, 80] }, ba: { hand: [10, 79] }, fl: [55, -120], bl: [-120, -90] }),
    air_hc: R({ hip: [0, 46], lean: -20, fa: [30, 20], ba: [150, 160], fl: [86, 94], bl: [-110, -80] }),
    air_hx: R({ hip: [0, 44], lean: 16, fa: [10, -10], ba: [160, 170], fl: [-30, -40], bl: [-120, -80] }),

    // The clinch grab (and the reverse throw: a turn and a dump behind him).
    grab_c: R({ hip: [2, 45], lean: 8, neck: 8, fa: { hand: [22, 78] }, ba: { hand: [18, 76] }, fl: { foot: [12, 0] }, bl: { foot: [-11, 0] } }),
    grab_x: R({ hip: [4, 45], lean: 12, neck: 14, fa: { hand: [26, 80] }, ba: { hand: [24, 78] }, fl: { foot: [14, 0] }, bl: { foot: [-10, 0] } }),
    throw_lift: R({ hip: [0, 44], lean: 0, fa: { hand: [18, 84] }, ba: { hand: [14, 82] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 32], lean: 36, fa: { hand: [30, 18] }, ba: { hand: [24, 22] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-4, 42], lean: -18, fa: [150, 172], ba: [140, 165], fl: { foot: [8, 0] }, bl: { foot: [-16, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -60, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [42, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [-2, 45], lean: -18, fa: [-50, 40], ba: { hand: [4, 80] }, fl: [8, 2], bl: { foot: [-12, 0] } }),

    // EIGHT LIMBS (the ultimate): his own versions of each limb for the sequence.
    relb_x: R({ hip: [6, 44], lean: 10, neck: 4, fa: { hand: [8, 78] }, ba: [-2, 176], fl: { foot: [14, 0] }, bl: { foot: [-6, 2] } }),
    lknee_x: R({ hip: [3, 46], lean: -10, neck: 14, fa: { hand: [22, 70] }, ba: { hand: [20, 68] }, fl: [52, -115], bl: { foot: [-10, 0] } }),
    lshin_x: R({ hip: [-2, 46], lean: -20, neck: 10, fa: [-150, -120], ba: { hand: [6, 78] }, fl: [16, 6], bl: { foot: [-6, 0] } })
  };
  poses.taunt = poses.beckon;

  FG.defineFighter({
    id: 'mateus', order: 10, student: true,
    homeStage: 'quad',
    glyphs: ['GNOMED', 'CHECK', '8', 'OOF'],
    stringH: 'RISING KNEE',
    cutIn: { a: 0x0c0c0e, b: 0xc8102e, style: 'brush' }, // black and deep red, brushstrokes
    check: true,
    finisher: { name: 'LIGHTS OUT', input: 'B, B, K' },
    ultimate: { name: 'EIGHT LIMBS', text: 'he catches them in the clinch, the screen goes black and red, and eight strikes land, each one named: LEFT FIST, RIGHT FIST, LEFT ELBOW, RIGHT ELBOW, LEFT KNEE, RIGHT KNEE, LEFT SHIN, and a RIGHT SHIN head kick', from: 'throw', len: 300,
      hits: [78, 98, 118, 138, 158, 178, 198, 240], weights: [1, 1, 1, 1, 1, 1, 1, 5], end: { gap: 70, down: true } },
    name: 'MATEUS', nickname: 'GNOME', archetype: 'BALANCED', theme: 'EIGHT LIMBS',
    style: 'MUAY THAI', signatureMechanic: 'THE CLINCH',
    signatureText: 'P+K up close locks a Thai clinch, hands behind their head: P drives a knee into the body (up to three, each one stronger), K dumps them on the floor, H is a jumping knee that launches, back breaks off with a short elbow. They get out with P right as it locks, or by mashing. Low Kick (D+K) stacks leg damage: land three and their walk slows. Check: press back just as a low kick lands to take it on the shin; the kicker staggers',
    bio: 'CALM, FOCUSED, A LITTLE COCKY. LETS HIS SHINS DO THE TALKING.',
    signature: ['THE CLINCH', 'LOW KICK', 'CHECK', 'SPINNING ELBOW'],
    scale: 0.93, health: 220,
    walkF: 2.3, walkB: 1.7, dashSpeed: 8.0, dashFrames: 14, backdashSpeed: 8.6,
    jumpVy: 9.4, weight: 1.0, react: 0.95,
    walk: { lean: -1.5, bob: 1.8, rate: 0.36 }, // springy steps, upright
    look: {
      skin: 0xe3b48c,
      hair: { style: 'curtain', color: 0x3b2416 },
      mouth: 'smirk', brows: 'stern',
      top: { style: 'tee', color: 0x1d2c5e, sleeves: 'short' },
      legs: 0x16161a, shorts: true, shoes: 0xe3b48c, // athletic shorts, barefoot
      wraps: 0xc8102e, armband: 0xc8102e,           // red hand wraps; a red armband on the lead arm
      build: { torso: 0.94, limb: 0.95 }
    },
    // On the balls of his feet: a rhythmic bounce, the lead foot light.
    idleAnim: { breath: 0.4, bob: 0, sway: 0, rate: 0.16, hop: 1.8, leadLift: 5 },
    poses: poses,
    // How the CPU plays him: kicks at mid range, the clinch up close.
    ai: { spacing: 70, pokes: ['K', 'F+P', 'D+K', 'K', 'F+P', 'D+K', 'F+K'], close: ['P', 'F+P', 'D+K', 'P+K', 'P>P>F+K', 'P', 'F+P', 'D+K', 'P+K', 'D+P', 'B+H'], aggro: 0.9, check: 0.3 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 13, damage: 8,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 30, y: 60, h: 20 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 21, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'CROSS', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 15, damage: 10,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 34, y: 52, h: 38 }, push: 7, juggle: 3.4,
        cancels: [{ btn: 'k', into: 'fK', from: 10, to: 22, onContact: true }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [26, 'idle']]
      },
      // Rear Uppercut: short and powerful, his punish.
      dP: {
        name: 'Rear Uppercut', label: 'REAR UPPERCUT', cmd: 'D+P', level: 'mid', strength: 'medium', motion: 'launcher',
        startup: 11, active: 2, recovery: 17, damage: 15,
        block: -9, hit: { adv: 5 }, ch: { launch: 5.4 },
        hitbox: { x: 12, w: 26, y: 46, h: 40 }, push: 8, juggle: 4, carry: 0.6, shake: 0.004,
        step: [4, 11, 1.2],
        anim: [[1, 'idle'], [6, 'upper_c'], [11, 'upper_x'], [13, 'upper_x'], [22, 'upper_r'], [30, 'idle']]
      },
      // Slashing Elbow: short, plus on block, and hard on the guard.
      fP: {
        name: 'Slashing Elbow', label: 'SLASHING ELBOW', cmd: 'F+P', level: 'high', strength: 'medium', motion: 'hook',
        startup: 13, active: 2, recovery: 13, damage: 14, guardDmg: 24,
        block: 2, hit: { adv: 6 }, ch: { adv: 10 },
        hitbox: { x: 10, w: 26, y: 56, h: 28 }, push: 6, juggle: 3.5, shake: 0.004,
        step: [5, 13, 1.4],
        anim: [[1, 'idle'], [7, 'slash_c'], [13, 'slash_x'], [15, 'slash_x'], [22, 'slash_r'], [28, 'idle']]
      },
      // Teep: a push kick to the stomach that sends them back (and pins them at the wall).
      mid: {
        name: 'Teep', label: 'TEEP', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick', wallSplat: true,
        startup: 13, active: 3, recovery: 17, damage: 12,
        block: -3, hit: { adv: 2 }, ch: { adv: 6 },
        hitbox: { x: 22, w: 32, y: 34, h: 22 }, push: 28, juggle: 3.6, shake: 0.004,
        anim: [[1, 'idle'], [8, 'teep_c'], [13, 'teep_x'], [16, 'teep_x'], [24, 'teep_c'], [32, 'idle']]
      },
      // Low Kick: the rear shin into the thigh. Three that land and their walk slows.
      low: {
        name: 'Low Kick', label: 'LOW KICK', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', legKick: true, thwack: true,
        startup: 14, active: 3, recovery: 17, damage: 12,
        block: -10, hit: { adv: 3 }, ch: { adv: 7 },
        hitbox: { x: 20, w: 28, y: 6, h: 24 }, push: 9, juggle: 2.5, shake: 0.004,
        anim: [[1, 'idle'], [8, 'lowk_c'], [14, 'lowk_x'], [17, 'lowk_x'], [26, 'lowk_r'], [34, 'idle']]
      },
      sweep: FG.kit.sweep('SWEEP THE LEG', { startup: 19, damage: 14, motion: 'sweep' }),
      // Body Kick: the rear roundhouse into the ribs. A loud thwack.
      fK: {
        ex: { text: 'THREE KICKS', multi: 2, hit: { knockdown: true } },
        name: 'Body Kick', label: 'BODY KICK', cmd: 'F+K', level: 'mid', strength: 'heavy', motion: 'roundhouse', thwack: true,
        startup: 15, active: 3, recovery: 18, damage: 16,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 14, w: 34, y: 40, h: 24 }, push: 14, juggle: 3.6, carry: 1.4, shake: 0.007,
        anim: [[1, 'idle'], [9, 'body_c'], [15, 'body_x'], [18, 'body_x'], [27, 'body_r'], [36, 'idle']]
      },
      // Knee (H): both hands reach, the rear knee drives up the middle.
      heavy: {
        name: 'Straight Knee', label: 'KNEE', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'kick', wallSplat: true,
        startup: 17, active: 3, recovery: 20, damage: 19,
        block: -5, hit: { adv: 4 }, ch: { launch: 5.6 },
        hitbox: { x: 10, w: 30, y: 40, h: 34 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [8, 17, 1.6],
        anim: [[1, 'idle'], [10, 'kn_c'], [17, 'kn_x'], [20, 'kn_x'], [29, 'kn_r'], [38, 'idle']]
      },
      // Head Kick: the shin to the head. Big damage; on a counter hit it carries them
      // to the wall.
      fH: {
        name: 'Head Kick', label: 'HEAD KICK', cmd: 'F+H', level: 'high', strength: 'heavy', motion: 'roundhouse', thwack: true,
        startup: 20, active: 3, recovery: 22, damage: 24,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true, wallSplat: true, carry: 5 },
        hitbox: { x: 14, w: 36, y: 64, h: 26 }, push: 8, juggle: 3.8, carry: 1.6, shake: 0.009, wallPop: 7,
        step: [10, 20, 2.0],
        cancels: [{ btn: 'up', into: 'jump', from: 21, to: 34, onHit: true }],
        anim: [[1, 'idle'], [11, 'head_c'], [20, 'head_x'], [23, 'head_x'], [34, 'head_r'], [44, 'idle']]
      },
      // Spinning Elbow: fast, and on a counter hit it hits enormously hard.
      bH: {
        ex: { text: 'ARMORED', armor: { hits: 1 } },
        name: 'Spinning Back Elbow', label: 'SPINNING ELBOW', cmd: 'B+H', level: 'mid', strength: 'heavy', motion: 'hook', chDamage: 1.9, chFlash: true,
        startup: 14, active: 2, recovery: 20, damage: 16,
        block: -8, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 10, w: 28, y: 58, h: 26 }, push: 12, juggle: 3.6, carry: 1.4, shake: 0.008,
        step: [5, 14, 1.2],
        anim: [[1, 'idle'], [8, 'spin_c'], [14, 'spin_x'], [16, 'spin_x'], [26, 'spin_r'], [36, 'idle']]
      },
      // Jumping Knee: his launcher, a flying knee straight up the middle.
      launcher: {
        name: 'Jumping Knee', label: 'JUMPING KNEE', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -14, hit: { launch: 7.6 }, ch: { launch: 9 },
        hitbox: { x: 6, w: 32, y: 30, h: 72 }, push: 6, juggle: 5.5, carry: 0.5, shake: 0.008,
        step: [8, 15, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'idle'], [8, 'jknee_c'], [15, 'jknee_x'], [19, 'jknee_x'], [28, 'jknee_r'], [41, 'idle']]
      },
      // Superman Punch: out of a dash, a hop and a flying cross.
      dashP: {
        name: 'Superman Punch', label: 'SUPERMAN PUNCH', cmd: 'F,F,P', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 13, active: 3, recovery: 19, damage: 16,
        block: -5, hit: { adv: 5 }, ch: { knockdown: true },
        hitbox: { x: 12, w: 34, y: 56, h: 26 }, push: 14, juggle: 3.6, carry: 1.4, shake: 0.006,
        step: [1, 14, 3.6],
        anim: [[1, 'super_c'], [7, 'super_c'], [13, 'super_x'], [16, 'super_x'], [24, 'super_r'], [35, 'idle']]
      },

      // THE CLINCH: the follow-ups (no hitbox: the clinch lands them; see clinch.js).
      clinchKnee1: {
        name: 'Clinch Knee', label: 'KNEE', cmd: 'CLINCH, P', level: 'mid', strength: 'medium', motion: 'kick', clinchKnee: true, hitY: 52,
        startup: 9, active: 1, recovery: 11, damage: 9, block: 0, hit: { adv: 0 }, ch: { adv: 0 }, shake: 0.004,
        anim: [[1, 'clinch'], [5, 'cknee_c'], [9, 'cknee_x'], [12, 'cknee_x'], [21, 'clinch']]
      },
      clinchKnee2: {
        name: 'Clinch Knee', label: 'KNEE 2', cmd: 'CLINCH, P, P', level: 'mid', strength: 'medium', motion: 'kick', clinchKnee: true, hitY: 54,
        startup: 9, active: 1, recovery: 11, damage: 11, block: 0, hit: { adv: 0 }, ch: { adv: 0 }, shake: 0.006,
        anim: [[1, 'clinch2'], [5, 'cknee_c'], [9, 'cknee_x'], [12, 'cknee_x'], [21, 'clinch2']]
      },
      clinchKnee3: {
        name: 'Clinch Knee', label: 'KNEE 3', cmd: 'CLINCH, P, P, P', level: 'mid', strength: 'heavy', motion: 'kick', clinchKnee: true, hitY: 56,
        startup: 10, active: 1, recovery: 12, damage: 14, block: 0, hit: { adv: 0 }, ch: { adv: 0 }, shake: 0.008,
        anim: [[1, 'clinch'], [5, 'cknee_c'], [10, 'cknee_x'], [13, 'cknee_x'], [23, 'clinch']]
      },
      clinchDump: {
        name: 'Clinch Dump', label: 'OFF-BALANCE', cmd: 'CLINCH, K', level: 'mid', strength: 'heavy', motion: 'sweep', hitY: 30,
        startup: 12, active: 1, recovery: 18, damage: 14, block: 0, hit: { knockdown: true }, ch: { knockdown: true }, carry: 1.2, shake: 0.008,
        anim: [[1, 'clinch'], [6, 'cdump_c'], [12, 'cdump_x'], [20, 'cdump_x'], [31, 'idle']]
      },
      clinchLaunch: {
        name: 'Clinch Jumping Knee', label: 'JUMPING KNEE TO THE HEAD', cmd: 'CLINCH, H', level: 'mid', strength: 'launch', motion: 'launcher', hitY: 72,
        startup: 12, active: 1, recovery: 22, damage: 15, block: 0, hit: { launch: 7.4 }, ch: { launch: 7.4 }, carry: 0.5, shake: 0.01,
        cancels: [{ btn: 'up', into: 'jump', from: 14, to: 26, onHit: true }],
        anim: [[1, 'clinch'], [6, 'claunch_c'], [12, 'claunch_x'], [17, 'claunch_x'], [26, 'jknee_r'], [35, 'idle']]
      },
      clinchElbow: {
        name: 'Break-off Elbow', label: 'BREAK-OFF ELBOW', cmd: 'CLINCH, B', level: 'high', strength: 'medium', motion: 'hook', hitY: 66,
        startup: 7, active: 1, recovery: 14, damage: 10, block: 0, hit: { adv: 4 }, ch: { adv: 4 }, push: 14, shake: 0.005,
        anim: [[1, 'clinch'], [4, 'celb_c'], [7, 'celb_x'], [10, 'celb_x'], [22, 'idle']]
      }
    },
    // Air: the elbow drops and the knee drives level with them, the axe kick comes down.
    FG.kit.air(['ELBOW DROP', 'FLYING KNEE', 'AXE KICK'], {
      airP: { hitbox: { x: 16, w: 28, y: 30, h: 34 } },
      airK: { hitbox: { x: 14, w: 30, y: 26, h: 32 } },
      airH: { hitbox: { x: 12, w: 32, y: 8, h: 48 } }
    }),
    FG.kit.throws('THE CLINCH', 'TURN AND DUMP', {
      throw: { clinch: true, damage: 0, cmd: 'P+K (CLOSE)', hit: { adv: 0 }, ch: { adv: 0 }, block: 0,
        ex: { text: 'THE KNEES ALWAYS REACH 3', clinchEx: true } },
      throwB: { damage: 33 }
    }),
    FG.kit.wake({ wakeLow: { label: 'SHIN FROM THE FLOOR' }, wakeMid: { label: 'RISING TEEP' } }),
    FG.kit.taunt({ label: 'AGAIN' })),

    combos: [
      { name: 'JAB, CROSS, BODY KICK', difficulty: 'easy', notation: 'P, P, F+K', plan: { 0: 'P', 12: 'P', 25: 'F+K' }, hits: ['jab', 'jab2', 'fK'] },
      { name: 'TWO AND A KNEE', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 25: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'JUMPING KNEE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 55: 'P', 64: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'CLINCH KNEES', difficulty: 'medium', notation: 'UP CLOSE: P+K, P, P, H', setup: 'UP CLOSE', steps: ['P+K, P (THE CLINCH, A KNEE)', 'P (ANOTHER KNEE)', 'H (JUMPING KNEE)'],
        plan: { 0: 'P+K', 14: 'P', 34: 'P', 54: 'H' }, hits: ['clinchKnee1', 'clinchKnee2', 'clinchLaunch'] },
      { name: 'TEEP, HEAD KICK, AIR', difficulty: 'hard', wall: true, notation: 'AT THE WALL: K, F+H, UP, AIR K, AIR H',
        plan: { 0: 'K', 25: 'F+H', 47: 'UP', 53: 'K', 65: 'H' }, hits: ['mid', 'fH', 'airK', 'airH'] },
      // Meter routes (combo trials): enhanced specials, and the ultimate.
      { name: 'THREE KICKS', difficulty: 'medium', meter: 1, notation: 'F+K, P+K', steps: ['F+K, P+K (1 BAR)', '(SECOND KICK)', '(THIRD KICK)'],
        plan: { 0: 'F+K', 3: 'P+K' }, hits: ['fKEX', 'fKEX', 'fKEX'] },
      { name: 'KNEES TO THREE', difficulty: 'medium', meter: 1, notation: 'UP CLOSE: P+K, P+K, H', setup: 'UP CLOSE', steps: ['P+K, P+K (THE CLINCH, 1 BAR)', '(SECOND KNEE)', '(THIRD KNEE)', 'H (JUMPING KNEE)'],
        plan: { 0: 'P+K', 14: 'P+K', 80: 'H' }, hits: ['clinchKnee1', 'clinchKnee2', 'clinchKnee3', 'clinchLaunch'] },
      { name: 'EIGHT LIMBS', difficulty: 'hard', meter: 3, notation: 'UP CLOSE: D, D/F, F+P+K+H', plan: { 0: 'D', 1: 'D/F', 2: 'F', 3: 'F+P+K+H' }, hits: ['ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'wai'], [44, 'wai'], [56, 'band'], [72, 'band'], [84, 'idle']],
    victory: [[1, 'idle'], [16, 'stand'], [30, 'band'], [56, 'band'], [66, 'wai'], [110, 'wai']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { nod: [[1, 'idle'], [6, 'nod'], [20, 'nod'], [28, 'idle']] },
    bigHit: { gesture: 'nod' },
    talk: {
      lines: ['Hands up.', "You've been gnomed. You just don't know it yet.", "Let's go."],
      quips: ['Check that.', 'Too slow.', 'Again.'],
      quipChance: 1 // quiet all fight, then one cold line after every big hit
    },
    victoryLines: ['Gnomed.', 'Eight limbs. You had four.', "Should've checked the kick."]
  });
})();
