// JACK — Rushdown / Kickboxer — "BACK OF THE CLASSROOM". A 10th grader: creative,
// sneaky, always messing around in the back row, and a kickboxer. Orthodox stance, hands
// high, light switch steps; punches and kicks mixed together in long combinations.
//
// Moves: Jab-Cross-Hook (P, P, P) and Punch-to-Kick (P, P, K: a body roundhouse off the
// cross), Front Kick (K), Switch Kick (F+K), Low Kick (D+K: land three and their walk
// slows), Question Mark Kick (F+H: chambered like a body kick, it turns over to the head;
// K during the chamber keeps it on the body), Spinning Back Fist (B+P: big on a counter
// hit), Flying Knee (D+H, his launcher), High Kick (H). Not a BRINKHUS: no long arms
// from the outside, he walks in and flows.
//
// Signature: FLOW. A punch that lands makes his next kick faster and stronger; a kick
// that lands does the same for his next punch (FG.flowMove, def.flow).
(function () {
  // The smallest of them: short limbs, quick.
  var R = FG.rigger({ torso: 24, neck: 11, upper: 14, fore: 12, thigh: 22, shin: 22.5 });
  var hands = function (fx, fy, bx, by) { return { fa: { hand: [fx, fy] }, ba: { hand: [bx, by] } }; };
  var pose = function (spec, h) { return R(Object.assign(spec, h || {})); };
  var GUARD = hands(14, 64, 8, 62);  // hands high: lead fist at the brow, rear at the chin
  var FEET = { fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } };

  var poses = {
    // Orthodox, hands high, chin down, weight even: light on his feet.
    idle: pose(Object.assign({ hip: [0, 40.5], lean: 5, neck: 8 }, FEET), GUARD),
    stand: R({ hip: [0, 44], lean: -4, fa: [-84, -74], ba: [-96, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // A switch step: the feet trade places for a beat.
    switch: pose({ hip: [1, 41], lean: 4, neck: 8, fl: { foot: [-4, 2] }, bl: { foot: [8, 0] } }, GUARD),
    fold: R({ hip: [0, 44], lean: 10, neck: 20, fa: { hand: [12, 54] }, ba: { hand: [8, 54] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    shrug: R({ hip: [0, 44], lean: -4, neck: -8, fa: [-20, 60], ba: [-160, 120], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    lounge: R({ hip: [0, 44], lean: -12, neck: -6, fa: [150, -60], ba: [160, -50], fl: { foot: [9, 0] }, bl: { foot: [-6, 0] } }),
    glasses: R({ hip: [0, 44], lean: -2, fa: [40, 130], ba: [-96, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // Hands up, touching gloves that aren't there.
    touch: R({ hip: [0, 43], lean: 6, neck: 10, fa: { hand: [20, 60] }, ba: { hand: [19, 58] }, fl: { foot: [8, 0] }, bl: { foot: [-9, 0] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    // Walking off, back to his seat.
    away1: R({ hip: [0, 44], lean: 2, fa: [-84, -80], ba: [-96, -90], fl: { foot: [10, 3] }, bl: { foot: [-8, 0] } }),
    away2: R({ hip: [0, 44], lean: 2, fa: [-96, -90], ba: [-84, -80], fl: { foot: [2, 0] }, bl: { foot: [-2, 3] } }),
    hop: R({ hip: [0, 48], lean: -4, fa: [40, 90], ba: [-120, -90], fl: [-40, -110], bl: [-100, -60] }),

    // Movement: on the balls of his feet; a shuffle in, a skip out.
    crouch: pose({ hip: [-1, 26], lean: 18, neck: 8, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(14, 50, 8, 48)),
    squat: pose({ hip: [-1, 31], lean: 14, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(14, 54, 8, 52)),
    jump: pose({ hip: [0, 44], lean: 2, fl: [-50, -110], bl: [-100, -50] }, hands(15, 66, 9, 64)),
    dash: pose({ hip: [4, 38], lean: 16, neck: 10, fl: { foot: [17, 0] }, bl: { foot: [-12, 5] } }, hands(18, 62, 12, 60)),
    backdash: pose({ hip: [-3, 41], lean: -6, fl: { foot: [12, 5] }, bl: { foot: [-15, 0] } }, hands(13, 64, 7, 62)),
    sidestep: pose({ hip: [0, 34], lean: 12, neck: 10, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }, hands(13, 58, 7, 56)),
    // Guard: a high, tight shell.
    block: pose({ hip: [-2, 40], lean: 8, neck: 12, fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }, hands(12, 68, 9, 67)),
    cblock: pose({ hip: [-2, 25], lean: 18, neck: 10, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }, hands(13, 52, 9, 50)),
    hit_high: R({ hip: [-3, 42], lean: -16, neck: -18, fa: [70, -30], ba: { hand: [4, 58] }, fl: { foot: [11, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 36], lean: 32, neck: 14, fa: { hand: [10, 34] }, ba: { hand: [4, 36] }, fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 36], lean: 12, fa: { hand: [14, 60] }, ba: { hand: [8, 58] }, fl: [-50, -110], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-4, 40], lean: -16, neck: -10, fa: [50, 110], ba: [80, 130], fl: { foot: [11, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -58, neck: -18, fa: [90, 140], ba: [110, 160], fl: [36, -26], bl: [6, -56] }),
    down: R({ hip: [0, 6], lean: -86, fa: [120, 170], ba: [-160, -120], fl: [14, -12], bl: [-6, 6] }),

    // Jab (P): the lead hand snaps straight out, the lead shoulder up over the chin.
    jab_c: pose({ hip: [0, 40], lean: 6, neck: 8, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }, hands(16, 64, 8, 62)),
    jab_x: R({ hip: [4, 40], lean: 12, neck: 10, fa: [8, 3], ba: { hand: [9, 62] }, fl: { foot: [15, 0] }, bl: { foot: [-10, 0] } }),
    // Cross (P, P): the rear hip turns over, the rear heel comes up.
    cross_c: pose({ hip: [-1, 40], lean: 6, neck: 8, fl: { foot: [13, 0] }, bl: { foot: [-11, 0] } }, hands(14, 63, 4, 62)),
    cross_x: R({ hip: [6, 40], lean: 18, neck: 8, fa: { hand: [13, 60] }, ba: [6, 2], fl: { foot: [16, 0] }, bl: { foot: [-8, 2] } }),
    // Lead Hook (P, P, P): the lead elbow up, the whole body turning through it.
    hook_c: pose({ hip: [2, 40], lean: 8, neck: 8, fl: { foot: [15, 0] }, bl: { foot: [-9, 1] } }, hands(10, 58, 10, 62)),
    hook_x: R({ hip: [3, 40], lean: 14, neck: 6, fa: { hand: [26, 66], bend: 1 }, ba: { hand: [10, 62] }, fl: { foot: [13, 1] }, bl: { foot: [-11, 0] } }),
    // Body Roundhouse (P, P, K): off the cross, the rear shin round into the ribs, leaning away.
    rk_c: R({ hip: [-2, 41], lean: -2, neck: 8, fa: { hand: [12, 64] }, ba: { hand: [8, 60] }, fl: { foot: [12, 0] }, bl: [20, -70] }),
    rk_x: R({ hip: [2, 43], lean: -24, neck: 10, fa: { hand: [9, 64] }, ba: [-130, -100], fl: { foot: [3, 0] }, bl: [8, 2] }),
    rk_r: R({ hip: [0, 42], lean: -8, neck: 8, fa: { hand: [12, 62] }, ba: { hand: [6, 56] }, fl: { foot: [6, 0] }, bl: [-30, -90] }),
    // Front Kick (K): the lead knee up, the foot driven straight through the middle.
    fk_c: pose({ hip: [0, 42], lean: -4, neck: 8, fl: [42, -62], bl: { foot: [-12, 0] } }, hands(13, 64, 8, 62)),
    fk_x: pose({ hip: [-2, 43], lean: -14, neck: 10, fl: [12, 8], bl: { foot: [-12, 0] } }, hands(11, 64, 7, 62)),
    // Switch Kick (F+K): a switch step, then the (new) rear leg whips round to the body.
    sw_c: pose({ hip: [2, 40], lean: 4, neck: 8, fl: { foot: [-5, 1] }, bl: { foot: [9, 0] } }, hands(14, 64, 8, 62)),
    sw_x: R({ hip: [1, 44], lean: -26, neck: 12, fa: { hand: [10, 66] }, ba: [-140, -110], fl: [20, 14], bl: { foot: [-8, 0] } }),
    // Low Kick (D+K): the rear shin chopped down into the thigh.
    lk_c: R({ hip: [-1, 40], lean: 2, neck: 8, fa: { hand: [13, 64] }, ba: { hand: [6, 60] }, fl: { foot: [11, 0] }, bl: [12, -70] }),
    lk_x: R({ hip: [3, 41], lean: -14, neck: 8, fa: { hand: [12, 64] }, ba: [-130, -100], fl: { foot: [6, 0] }, bl: [-12, -46] }),
    // Question Mark Kick (F+H): the chamber says body kick... and it turns over to the head.
    qm_c: R({ hip: [-1, 42], lean: -6, neck: 8, fa: { hand: [12, 64] }, ba: { hand: [6, 60] }, fl: { foot: [9, 0] }, bl: [32, -66] }),
    qm_x: R({ hip: [1, 44], lean: -40, neck: 16, fa: { hand: [6, 64] }, ba: [-140, -110], fl: { foot: [4, 0] }, bl: [44, 56] }),
    qm_r: R({ hip: [0, 43], lean: -14, neck: 10, fa: { hand: [12, 62] }, ba: { hand: [4, 56] }, fl: { foot: [6, 0] }, bl: [10, -80] }),
    // Spinning Back Fist (B+P): his back to them for a beat, then the arm whips round.
    sbf_c: R({ hip: [-4, 40], lean: -2, neck: 4, fa: { hand: [-6, 58] }, ba: { hand: [-2, 60] }, fl: { foot: [-6, 0] }, bl: { foot: [8, 0] } }),
    sbf_x: R({ hip: [6, 41], lean: 12, neck: 6, fa: [6, 4], ba: { hand: [4, 58] }, fl: { foot: [15, 0] }, bl: { foot: [-10, 1] } }),
    // Flying Knee (D+H): a step, a jump, the knee straight up the middle, hands pulling.
    fkn_c: pose({ hip: [0, 30], lean: 14, neck: 8, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }, hands(15, 56, 9, 54)),
    fkn_x: R({ hip: [6, 56], lean: -8, neck: 10, fa: { hand: [24, 74] }, ba: { hand: [20, 72] }, fl: [-100, -150], bl: [74, -50] }),
    fkn_r: pose({ hip: [2, 36], lean: 10, neck: 8, fl: { foot: [12, 0] }, bl: { foot: [-12, 2] } }, hands(15, 60, 9, 58)),
    // High Kick (H): the rear leg all the way up to the head, the arm swinging down for balance.
    hk_c: R({ hip: [-2, 41], lean: -2, neck: 8, fa: { hand: [12, 64] }, ba: { hand: [6, 60] }, fl: { foot: [10, 0] }, bl: [30, -60] }),
    hk_x: R({ hip: [2, 43], lean: -36, neck: 14, fa: { hand: [8, 66] }, ba: [-120, -80], fl: { foot: [3, 0] }, bl: [36, 30] }),
    hk_r: R({ hip: [0, 42], lean: -12, neck: 10, fa: { hand: [12, 62] }, ba: { hand: [4, 54] }, fl: { foot: [6, 0] }, bl: [0, -80] }),
    // Leg Sweep (D/B+K): low, spinning, the rear leg through their heels.
    sweep_c: R({ hip: [-2, 20], lean: 26, fa: { hand: [16, 24] }, ba: { hand: [4, 28] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 16], lean: 16, fa: { hand: [12, 4] }, ba: [-170, -175], fl: { foot: [4, 0] }, bl: { foot: [44, 2] } }),

    air_p: R({ hip: [0, 44], lean: 6, fa: [-10, -30], ba: { hand: [8, 62] }, fl: [-50, -110], bl: [-100, -50] }),
    air_k: R({ hip: [0, 44], lean: -16, fa: { hand: [10, 66] }, ba: [-150, -110], fl: [6, -4], bl: [-100, -50] }),
    air_hc: R({ hip: [0, 46], lean: -6, fa: [120, 170], ba: { hand: [8, 62] }, fl: [-50, -110], bl: [-100, -50] }),
    air_hx: R({ hip: [0, 44], lean: 26, fa: [-10, -50], ba: { hand: [6, 60] }, fl: [-50, -110], bl: [-100, -50] }),

    // Throws: a clinch and a knee-tap dump; a spin round behind them.
    grab_c: R({ hip: [1, 41], lean: 12, fa: { hand: [20, 62] }, ba: { hand: [14, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [3, 41], lean: 16, fa: { hand: [26, 60] }, ba: { hand: [22, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [2, 42], lean: -4, fa: [70, 100], ba: [60, 95], fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [8, 32], lean: 36, fa: { hand: [30, 20] }, ba: { hand: [26, 22] }, fl: { foot: [20, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 40], lean: -16, fa: [150, 175], ba: [140, 170], fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -60, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [38, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 40], lean: 10, fa: [60, 95], ba: { hand: [2, 52] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } })
  };
  poses.taunt = poses.lounge;

  FG.defineFighter({
    id: 'jack', order: 13, student: true,
    homeStage: 'classroom',
    glyphs: ['FLOW', 'LOL', '10/10', 'REPLAY'],
    stringH: 'UPPERCUT',
    cutIn: { a: 0x8a8a92, b: 0x5fd7ff }, // gray raglan, ballpoint blue
    finisher: { name: 'BACK ROW', input: 'B, D, F, K' },
    ultimate: { name: 'HIGHLIGHT REEL', text: 'a punch-kick flurry, an instant replay, and a spinning back fist into a head kick frozen on the frame', from: 'jab', len: 272,
      hits: [22, 30, 38, 48, 58, 68, 78, 90, 102, 156, 186], weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 6], end: { gap: 84, down: true } },
    name: 'JACK', nickname: 'BACK OF THE CLASSROOM', archetype: 'RUSHDOWN', theme: 'BACK ROW',
    style: 'KICKBOXING', signatureMechanic: 'FLOW',
    signatureText: 'a punch that lands makes his next kick faster and stronger, and a kick that lands does the same for his next punch. Jab-Cross-Hook (P, P, P) and Punch-to-Kick (P, P, K); Low Kick (D+K) slows them once three land; Question Mark Kick (F+H) turns over to the head (K during the chamber keeps it on the body); Spinning Back Fist (B+P) is huge on a counter hit',
    bio: 'CREATIVE AND SNEAKY. ALWAYS MESSING AROUND IN THE BACK ROW.',
    signature: ['FLOW', 'SWITCH KICK', 'QUESTION MARK KICK', 'SPINNING BACK FIST', 'FLYING KNEE'],
    flow: { speed: 3, damage: 1.25 },
    scale: 0.92, health: 212,
    walkF: 2.4, walkB: 1.8, dashSpeed: 8.6, dashFrames: 14, backdashSpeed: 9.4,
    jumpVy: 9.4, weight: 0.93, react: 1.15,
    walk: { lean: 2, bob: 1.6, rate: 0.3 }, // light, bouncing steps
    look: {
      skin: 0xe8c09a,
      hair: { style: 'shaggy', color: 0x5a3a20 },
      glasses: 0x2a2a30, mouth: 'smirk',
      top: { style: 'raglan', color: 0x9a9aa2, sleeveColor: 0x2a2a32, sleeves: 'short' },
      legs: 0x3a4a6a, shoes: 0xb8b8b8,
      build: { torso: 0.9, limb: 0.92 }
    },
    idleAnim: { breath: 0.5, bob: 0, sway: 0.4, rate: 0.2, hop: 1.4, leadLift: 3 }, // light on his feet
    poses: poses,
    // How the CPU plays him: walks in behind the jab, mixes punches into kicks (FLOW), low
    // kicks the legs, and goes for the back fist and the question mark kick up close.
    ai: { spacing: 50, pokes: ['K', 'D+K', 'P', 'F+K', 'D+K', 'K'], close: ['P>P>K', 'P>P>P', 'P>K', 'P', 'B+P', 'F+H', 'F+H>K', 'D+K', 'P+K', 'P>P>H', 'K', 'D+H', 'F+K'], aggro: 1.3, dashIn: 0.55 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab', punch: true,
        startup: 9, active: 2, recovery: 13, damage: 9,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 26, y: 50, h: 28 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 20, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'CROSS', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross', punch: true,
        startup: 10, active: 2, recovery: 16, damage: 11,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 32, y: 50, h: 46 }, push: 5, juggle: 3.4,
        cancels: [{ btn: 'p', into: 'jab3', from: 10, to: 21, onContact: true }, { btn: 'k', into: 'pkick', from: 10, to: 21, onContact: true }],
        anim: [[1, 'jab_x'], [5, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      jab3: {
        name: 'Lead Hook', label: 'LEAD HOOK', cmd: 'P,P,P', level: 'high', strength: 'medium', motion: 'hook', punch: true,
        startup: 11, active: 3, recovery: 18, damage: 13,
        block: -5, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 30, y: 54, h: 30 }, push: 14, juggle: 3.4, carry: 1.2, shake: 0.004,
        anim: [[1, 'cross_x'], [6, 'hook_c'], [11, 'hook_x'], [14, 'hook_x'], [24, 'hook_c'], [31, 'idle']]
      },
      // Punch-to-Kick (P, P, K): off the cross, the rear shin into the ribs.
      pkick: {
        name: 'Body Roundhouse', label: 'PUNCH TO KICK', cmd: 'P,P,K', level: 'mid', strength: 'heavy', motion: 'roundhouse', kick: true,
        startup: 13, active: 3, recovery: 19, damage: 15,
        block: -7, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 32, y: 34, h: 26 }, push: 18, juggle: 3.6, carry: 1.4, shake: 0.006,
        anim: [[1, 'cross_x'], [7, 'rk_c'], [13, 'rk_x'], [16, 'rk_x'], [25, 'rk_r'], [34, 'idle']]
      },
      // Front Kick (K): the lead foot straight into the middle.
      mid: {
        name: 'Front Kick', label: 'FRONT KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick', kick: true,
        startup: 12, active: 3, recovery: 17, damage: 13,
        block: -3, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 22, w: 36, y: 30, h: 20 }, push: 14, juggle: 3.6, shake: 0.003,
        step: [4, 12, 1],
        anim: [[1, 'idle'], [7, 'fk_c'], [12, 'fk_x'], [15, 'fk_x'], [23, 'fk_c'], [31, 'idle']]
      },
      // Switch Kick (F+K): a switch step and the lead leg (now the rear) round to the body.
      fK: {
        ex: { text: 'TWO KICKS', multi: 1 },
        name: 'Switch Kick', label: 'SWITCH KICK', cmd: 'F+K', level: 'mid', strength: 'heavy', motion: 'roundhouse', kick: true,
        startup: 15, active: 3, recovery: 18, damage: 18,
        block: -5, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 16, w: 38, y: 36, h: 28 }, push: 14, juggle: 3.6, shake: 0.006,
        step: [2, 12, 1.4],
        anim: [[1, 'idle'], [6, 'sw_c'], [15, 'sw_x'], [18, 'sw_x'], [26, 'rk_r'], [33, 'idle']]
      },
      // Low Kick (D+K): the shin into the thigh. Three that land slow their walk.
      low: {
        name: 'Low Kick', label: 'LOW KICK', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', kick: true, legKick: true, thwack: true,
        startup: 13, active: 3, recovery: 17, damage: 12,
        block: -8, hit: { adv: 2 }, ch: { adv: 6 },
        hitbox: { x: 18, w: 36, y: 6, h: 18 }, push: 8, juggle: 2.5, shake: 0.004,
        step: [4, 13, 1.2],
        anim: [[1, 'idle'], [7, 'lk_c'], [13, 'lk_x'], [16, 'lk_x'], [24, 'lk_c'], [30, 'idle']]
      },
      sweep: FG.kit.sweep('LEG SWEEP', { startup: 19, damage: 14, motion: 'sweep', kick: true }),
      // High Kick (H): the rear shin to the head.
      heavy: {
        name: 'High Kick', label: 'HIGH KICK', cmd: 'H', level: 'high', strength: 'heavy', motion: 'roundhouse', kick: true, wallSplat: true,
        startup: 16, active: 3, recovery: 20, damage: 20,
        block: -6, hit: { adv: 5 }, ch: { launch: 5.8 },
        hitbox: { x: 14, w: 32, y: 44, h: 38 }, push: 20, juggle: 3.4, carry: 1.8, shake: 0.007,
        step: [8, 16, 1.4],
        anim: [[1, 'idle'], [9, 'hk_c'], [16, 'hk_x'], [19, 'hk_x'], [28, 'hk_r'], [37, 'idle']]
      },
      // Question Mark Kick (F+H): chambered like a body kick, it turns over to the head.
      // K during the chamber keeps it on the body.
      fH: {
        name: 'Question Mark Kick', label: 'QUESTION MARK KICK', cmd: 'F+H', level: 'high', strength: 'heavy', motion: 'roundhouse', kick: true,
        startup: 19, active: 3, recovery: 19, damage: 20,
        block: -7, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 32, y: 46, h: 38 }, push: 18, juggle: 3.4, carry: 1.6, shake: 0.008,
        step: [8, 19, 1.6],
        cancels: [{ btn: 'k', into: 'qmBody', from: 5, to: 11 }],
        anim: [[1, 'idle'], [9, 'qm_c'], [19, 'qm_x'], [22, 'qm_x'], [31, 'qm_r'], [41, 'idle']]
      },
      qmBody: {
        name: 'Question Mark Kick (Body)', label: 'QUESTION MARK (BODY)', cmd: 'F+H,K', level: 'mid', strength: 'heavy', motion: 'roundhouse', kick: true,
        startup: 9, active: 3, recovery: 19, damage: 16,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 14, w: 32, y: 34, h: 26 }, push: 16, juggle: 3.6, shake: 0.006,
        anim: [[1, 'qm_c'], [9, 'rk_x'], [12, 'rk_x'], [21, 'rk_r'], [31, 'idle']]
      },
      // Spinning Back Fist (B+P): fast, and on a counter hit it spins them round and down.
      bP: {
        ex: { text: 'ARMORED', armor: { hits: 1 } },
        name: 'Spinning Back Fist', label: 'SPINNING BACK FIST', cmd: 'B+P', level: 'high', strength: 'heavy', motion: 'hook', punch: true,
        startup: 15, active: 3, recovery: 18, damage: 16, chDamage: 1.7, chFlash: true,
        block: -4, hit: { adv: 4 }, ch: { knockdown: true, carry: 1.6 },
        hitbox: { x: 14, w: 34, y: 56, h: 26 }, push: 14, juggle: 3.4, carry: 1.6, shake: 0.006,
        step: [4, 15, 1.4],
        anim: [[1, 'idle'], [8, 'sbf_c'], [15, 'sbf_x'], [18, 'sbf_x'], [27, 'jab_c'], [35, 'idle']]
      },
      // Flying Knee (D+H): his launcher.
      launcher: {
        ex: { text: 'ARMORED', armor: { hits: 1 }, hit: { launch: true } },
        name: 'Flying Knee', label: 'FLYING KNEE', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher', // a knee: no FLOW
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 30, y: 28, h: 80 }, push: 6, juggle: 5.5, carry: 0.3, shake: 0.008,
        step: [9, 15, 1.6],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [8, 'fkn_c'], [15, 'fkn_x'], [19, 'fkn_x'], [28, 'fkn_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['FLYING JAB', 'JUMPING SWITCH KICK', 'SUPERMAN PUNCH']),
    FG.kit.throws('KNEE TAP', 'SPIN BEHIND', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake({ wakeLow: { label: 'NOT ASLEEP' }, wakeMid: { label: 'I WAS LISTENING' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'JAB, CROSS, HOOK', difficulty: 'easy', notation: 'P, P, P', plan: { 0: 'P', 12: 'P', 25: 'P' }, hits: ['jab', 'jab2', 'jab3'] },
      { name: 'PUNCH TO KICK', difficulty: 'easy', notation: 'P, P, K', plan: { 0: 'P', 12: 'P', 25: 'K' }, hits: ['jab', 'jab2', 'pkick'] },
      { name: 'TWO AND AN UPPERCUT', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 25: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'FLYING KNEE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 41: 'P', 53: 'P', 63: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'HIGHLIGHT', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H',
        plan: { 0: 'D+H', 16: 'UP', 28: 'P', 36: 'K', 44: 'H' }, hits: ['launcher', 'airP', 'airK', 'airH'] },
      { name: 'ARMORED KNEE', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 41: 'P', 53: 'P', 63: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'HIGHLIGHT REEL', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'touch'], [36, 'touch'], [46, 'switch'], [54, 'idle'], [62, 'switch'], [70, 'glasses'], [86, 'idle']],
    victory: [[1, 'stand'], [14, 'fold'], [44, 'fold'], [54, 'lounge'], [80, 'lounge'], [92, 'shrug'], [110, 'shrug']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { glasses: [[1, 'idle'], [8, 'glasses'], [26, 'glasses'], [36, 'idle']] },
    bigHit: { gesture: 'glasses' },
    talk: {
      lines: ["Wasn't paying attention. Doesn't matter.", 'Hands up. Mine are.', 'Watch the replay.'],
      quips: ['Ten out of ten.', 'Replay that.', 'Flow.', 'Too easy.']
    },
    victoryLines: ["Didn't even look up.", 'Highlight reel.', 'Back to my seat.']
  });
})();
