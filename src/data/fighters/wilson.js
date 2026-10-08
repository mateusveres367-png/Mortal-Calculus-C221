// WILSON — Veteran Master — Every Subject. Twenty-nine years at El Camino; he has
// taught every math class in the building. Tall, lean and long-limbed, and he
// fights the way he teaches: no wasted motion. Long jabs, whip-like kicks and
// perfectly timed counters, with a move from every subject.
//
// Signature: 29 YEARS. He gets better as the match goes on: faster in round 2,
// stronger in round 3. Once a round, SEEN IT ALL: the opponent's most-used move
// (three times or more) is countered on sight. Also: Chain Rule (P, P cancels into
// any of his other moves, once a string), Sine Wave (a weaving advance that ducks
// under highs), Absolute Value (a parry that sends their own attack back at them).
// He doesn't taunt; T is STARE: a second of standing still, for a little meter.
(function () {
  var R = FG.rigger({ torso: 29, neck: 12, upper: 16.5, fore: 15, thigh: 27, shin: 27.5 });
  // Upright and economical: the lead hand loose and long, the rear hand at the chin.
  var GF = { hand: [24, 70] }, GB = { hand: [12, 80] };
  var stance = R({ hip: [0, 51], lean: 2, fa: GF, ba: GB, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } });
  var stand = R({ hip: [0, 53], lean: 0, fa: [-86, -90], ba: [-94, -90], fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    // Arms folded; the stare; checking his watch; walking away.
    folded: R({ hip: [0, 53], lean: 0, fa: { hand: [-1, 80] }, ba: { hand: [10, 80] }, fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),
    stare: R({ hip: [0, 53], lean: -1, neck: -2, fa: [-88, -92], ba: [-92, -88], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    watch: R({ hip: [0, 53], lean: 2, neck: 8, fa: { hand: [8, 72] }, ba: { hand: [14, 76] }, fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),
    walk1: R({ hip: [-2, 52], lean: 0, fa: [-80, -86], ba: [-100, -94], fl: { foot: [10, 0] }, bl: { foot: [-14, 2] } }),
    walk2: R({ hip: [-2, 52], lean: 0, fa: [-100, -94], ba: [-80, -86], fl: { foot: [-12, 2] }, bl: { foot: [12, 0] } }),
    kneel: [0, 28, 6, 54, 10, 64, 16, 54, 14, 66, 0, 42, 4, 32, 16, 28, 20, 0, -6, 4, -24, 0],
    kneel2: [0, 28, 5, 53, 8, 63, 16, 54, 14, 66, 0, 42, 4, 32, 16, 28, 20, 0, -6, 4, -24, 0],

    // Movement: smooth and low-effort.
    crouch: R({ hip: [0, 34], lean: 10, fa: { hand: [22, 56] }, ba: { hand: [12, 62] }, fl: { foot: [14, 0] }, bl: { foot: [-13, 0] } }),
    squat: R({ hip: [0, 40], lean: 6, fa: { hand: [22, 62] }, ba: { hand: [12, 68] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    jump: R({ hip: [0, 52], lean: 0, fa: GF, ba: GB, fl: [-50, -110], bl: [-100, -96] }),
    dash: R({ hip: [3, 49], lean: 8, fa: GF, ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-16, 4] } }),
    backdash: R({ hip: [-3, 51], lean: -4, fa: GF, ba: GB, fl: { foot: [8, 3] }, bl: { foot: [-18, 0] } }),
    sidestep: R({ hip: [0, 50], lean: 0, fa: GF, ba: GB, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // Guard: the long lead forearm up and across.
    block: R({ hip: [-1, 51], lean: -3, fa: [30, 104], ba: { hand: [12, 82] }, fl: { foot: [11, 0] }, bl: { foot: [-14, 0] } }),
    cblock: R({ hip: [0, 34], lean: 8, fa: [-6, 84], ba: { hand: [12, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-13, 0] } }),
    // Hit reactions: he barely gives anything away.
    hit_high: R({ hip: [-3, 52], lean: -9, neck: -8, fa: { hand: [20, 74] }, ba: { hand: [10, 80] }, fl: { foot: [13, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 49], lean: 16, neck: 4, fa: { hand: [14, 60] }, ba: { hand: [8, 64] }, fl: { foot: [11, 0] }, bl: { foot: [-16, 0] } }),
    hit_low: R({ hip: [-1, 47], lean: 6, fa: GF, ba: GB, fl: [-46, -116], bl: { foot: [-13, 0] } }),
    gbreak: R({ hip: [-4, 51], lean: -12, fa: [44, 66], ba: [24, 44], fl: { foot: [13, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 24], lean: -78, fa: [104, 86], ba: [84, 64], fl: [12, -8], bl: [2, -18] }),
    down: R({ hip: [0, 6], lean: -88, fa: [-168, -174], ba: [168, 174], fl: [4, 0], bl: [-4, 0] }),

    // Point: a long, loose jab.
    jab_c: R({ hip: [1, 51], lean: 3, fa: { hand: [22, 74] }, ba: GB, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [4, 51], lean: 6, fa: [4, 2], ba: GB, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    // Chain Rule: the rear hand straight down the pipe.
    chain_c: R({ hip: [3, 51], lean: 5, fa: { hand: [16, 72] }, ba: { hand: [18, 78] }, fl: { foot: [14, 0] }, bl: { foot: [-11, 0] } }),
    chain_x: R({ hip: [7, 50], lean: 10, fa: { hand: [12, 74] }, ba: [1, -1], fl: { foot: [17, 0] }, bl: { foot: [-10, 0] } }),
    // Distance Formula: a long poke, all the way out.
    dist_c: R({ hip: [-2, 51], lean: -3, fa: { hand: [14, 70] }, ba: GB, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    dist_x: R({ hip: [9, 49], lean: 14, fa: [0, -2], ba: { hand: [4, 76] }, fl: { foot: [24, 0] }, bl: { foot: [-12, 0] } }),
    // Slope-Intercept: out of a dash, a rising straight on a line.
    slope_c: R({ hip: [4, 46], lean: 14, fa: { hand: [18, 60] }, ba: GB, fl: { foot: [20, 0] }, bl: { foot: [-14, 2] } }),
    slope_x: R({ hip: [10, 48], lean: 12, fa: [14, 12], ba: { hand: [6, 76] }, fl: { foot: [24, 0] }, bl: { foot: [-12, 0] } }),
    // Tangent Line: a whip kick, the shin snapping out level.
    whip_c: R({ hip: [0, 52], lean: -4, fa: GF, ba: GB, fl: [40, -70], bl: { foot: [-12, 0] } }),
    whip_x: R({ hip: [0, 52], lean: -14, fa: { hand: [18, 66] }, ba: GB, fl: [6, 4], bl: { foot: [-12, 0] } }),
    // Sine Wave: down and under, then up the other side with a body blow.
    sine_a: R({ hip: [4, 40], lean: 24, neck: 10, fa: { hand: [20, 54] }, ba: { hand: [12, 58] }, fl: { foot: [16, 0] }, bl: { foot: [-14, 0] } }),
    sine_b: R({ hip: [8, 36], lean: 30, neck: 12, fa: { hand: [24, 48] }, ba: { hand: [14, 54] }, fl: { foot: [20, 0] }, bl: { foot: [-12, 2] } }),
    sine_x: R({ hip: [10, 46], lean: 16, fa: [-10, 20], ba: { hand: [8, 70] }, fl: { foot: [22, 0] }, bl: { foot: [-10, 0] } }),
    // Floor Function: a low whip at the shin.
    low_c: R({ hip: [0, 42], lean: 6, fa: GF, ba: GB, fl: [30, -70], bl: { foot: [-12, 0] } }),
    low_x: R({ hip: [2, 40], lean: 8, fa: { hand: [22, 64] }, ba: GB, fl: { foot: [46, 8] }, bl: { foot: [-12, 0] } }),
    // Limit to Zero: a long, flat sweep.
    sweep_c: R({ hip: [0, 32], lean: 12, fa: { hand: [24, 54] }, ba: { hand: [14, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [2, 26], lean: 16, fa: { hand: [26, 46] }, ba: { hand: [10, 52] }, fl: { foot: [52, 3] }, bl: { foot: [-12, 0] } }),
    // Long Division: a stepping straight, the whole frame behind it.
    hv_c: R({ hip: [-3, 51], lean: -4, fa: { hand: [14, 68] }, ba: { hand: [6, 76] }, fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    hv_x: R({ hip: [12, 49], lean: 16, fa: { hand: [10, 74] }, ba: [3, 4], fl: { foot: [26, 0] }, bl: { foot: [-9, 0] } }),
    hv_r: R({ hip: [7, 51], lean: 6, fa: GF, ba: GB, fl: { foot: [19, 0] }, bl: { foot: [-11, 0] } }),
    // Quadratic Formula: a falling axe kick, up and over.
    axe_c: R({ hip: [-1, 52], lean: -10, fa: GF, ba: GB, fl: [100, 90], bl: { foot: [-12, 0] } }),
    axe_x: R({ hip: [4, 49], lean: 8, fa: { hand: [20, 62] }, ba: GB, fl: [-10, -30], bl: { foot: [-12, 0] } }),
    // Absolute Value: the parry (palms open, reading), and sending it back.
    parry: R({ hip: [-1, 50], lean: -3, neck: 3, fa: { hand: [30, 72] }, ba: { hand: [24, 62] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    abs_x: R({ hip: [10, 50], lean: 12, fa: [10, 6], ba: [-8, -4], fl: { foot: [22, 0] }, bl: { foot: [-10, 0] } }),
    // Seen It All: the answer before the question.
    seen_x: R({ hip: [8, 49], lean: 8, fa: [24, 18], ba: { hand: [10, 76] }, fl: { foot: [20, 0] }, bl: { foot: [-11, 0] } }),
    // Square Root: a rising heel, straight up the middle.
    up_c: R({ hip: [0, 36], lean: 12, fa: { hand: [20, 56] }, ba: GB, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    up_x: R({ hip: [-2, 54], lean: -14, fa: { hand: [16, 70] }, ba: GB, fl: [80, 90], bl: { foot: [-10, 2] } }),
    up_r: R({ hip: [1, 52], lean: -4, fa: GF, ba: GB, fl: [30, -40], bl: { foot: [-11, 0] } }),

    // Air: Rational Jab, Radian Kick, Vertical Asymptote (a dropping elbow).
    air_p: R({ hip: [0, 52], lean: 6, fa: [0, -2], ba: GB, fl: [-50, -110], bl: [-100, -96] }),
    air_k: R({ hip: [0, 52], lean: -14, fa: GF, ba: GB, fl: [4, 0], bl: [-100, -96] }),
    air_hc: R({ hip: [0, 54], lean: -8, fa: [100, 150], ba: GB, fl: [-50, -110], bl: [-100, -96] }),
    air_hx: R({ hip: [0, 52], lean: 22, fa: [-40, -120], ba: GB, fl: [-50, -110], bl: [-100, -96] }),

    // Prime Factorization: take hold, then break them down with a flurry.
    grab_c: R({ hip: [2, 51], lean: 5, fa: { hand: [30, 70] }, ba: { hand: [26, 72] }, fl: { foot: [13, 0] }, bl: { foot: [-11, 0] } }),
    grab_x: R({ hip: [5, 51], lean: 7, fa: { hand: [32, 66] }, ba: { hand: [30, 70] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    throw_lift: R({ hip: [3, 50], lean: 4, fa: [36, 30], ba: { hand: [24, 60] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [7, 42], lean: 22, fa: [-24, -50], ba: [-34, -60], fl: { foot: [20, 0] }, bl: { foot: [-13, 0] } }),
    throw_back: R({ hip: [-2, 50], lean: -10, fa: [146, 186], ba: [136, 176], fl: { foot: [9, 0] }, bl: { foot: [-16, 0] } }),
    wake_low: R({ hip: [-2, 10], lean: -60, fa: { hand: [-15, 2] }, ba: { hand: [-21, 2] }, fl: { foot: [46, 6] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [4, 49], lean: 9, fa: [6, 12], ba: [-2, 6], fl: { foot: [16, 0] }, bl: { foot: [-11, 3] } })
  };

  poses.taunt = poses.stare;

  FG.defineFighter({
    id: 'wilson', order: 9,
    homeStage: 'classroom',
    boss: true, // arcade's final fight; playable in arcade and VS CPU once arcade is beaten
    glyphs: ['29', 'D = √(ΔX² + ΔY²)', 'Y = MX + B', '|X|', '√X'], // math that flies off their big hits
    stringH: 'COMMON CORE', // P, P, H: the universal string ender (see FG.defineFighter)
    cutIn: { a: 0x4a1a7a, b: 0xffd23f }, // purple and gold
    finisher: { name: 'CLASS DISMISSED', input: 'D, B, H' },
    ultimate: { name: 'TENURE', text: 'time freezes, chalkboard flashbacks flicker past labelled with the years, then 29 rapid hits with a counter ticking up to 29', from: 'fP',
      len: 250, hits: (function () { var h = []; for (var k = 0; k < 29; k++) h.push(84 + k * 4); return h; })(), end: { gap: 92, down: true } },
    name: 'WILSON', archetype: 'VETERAN MASTER', theme: 'EVERY SUBJECT',
    style: 'LONG-LIMBED, EFFICIENT, SMOOTH', signatureMechanic: '29 YEARS',
    signatureText: 'faster in round 2, stronger in round 3; once a round, Seen It All counters the move you have used most',
    passive: '29years', seenItAll: true,
    bio: 'TWENTY-NINE YEARS AT EL CAMINO. TEACHES EVERY MATH CLASS. NEVER SMILES. NEVER WASTES A WORD.',
    signature: ['29 YEARS', 'SEEN IT ALL', 'CHAIN RULE', 'SINE WAVE', 'ABSOLUTE VALUE'],
    scale: 1.06, health: 175,
    // Movement: smooth and unhurried, with a long reach to cover the gaps.
    walkF: 1.9, walkB: 1.8, dashSpeed: 7.6, dashFrames: 15, dashAttackFrom: 6, backdashSpeed: 9,
    jumpVy: 9.6, weight: 1, react: 0.7,
    walk: { lean: 0.6, bob: 0, rate: 0.14 },
    look: {
      skin: 0x6b4128,
      hair: { style: 'cropped', color: 0x16100c },
      earrings: 0xd8d8e0,
      mouth: 'stern', brows: 'stern',
      top: { style: 'tee', color: 0x141418, sleeves: 'short' },
      legs: 0x24262e, shoes: 0x101014,
      build: { torso: 0.95, limb: 1.0 }
    },
    idleAnim: { breath: 0.25, bob: 0, sway: 0, rate: 0.03 }, // perfectly still between exchanges
    poses: poses,
    // How the CPU plays him: patient at long range, pokes, counters, punishes.
    ai: { spacing: 64, pokes: ['F+P', 'K', 'P'], close: ['P', 'D+K', 'P+K', 'F+K'], aggro: 0.6, parry: 0.3, dashIn: 0.2 },
    gestures: { stare: [[1, 'stare'], [60, 'stare']] },

    moves: FG.kit.moves({
      jab: {
        name: 'Long Jab', label: 'POINT', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 15, damage: 8,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 32, y: 66, h: 16 }, push: 9, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 21 }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [25, 'idle']]
      },
      // Chain Rule: the second hit, which cancels into any of his other moves (once a string).
      jab2: {
        name: 'Chain Straight', label: 'CHAIN RULE', cmd: 'P,P', level: 'high', strength: 'medium', motion: 'cross',
        startup: 10, active: 2, recovery: 17, damage: 10,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 24, w: 32, y: 64, h: 18 }, push: 10, juggle: 3.4,
        cancels: [{ btn: 'any', from: 10, to: 24, onContact: true }],
        anim: [[1, 'jab_x'], [6, 'chain_c'], [10, 'chain_x'], [13, 'chain_x'], [28, 'idle']]
      },
      // Distance Formula: a long poke with all his reach.
      fP: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true }, // enhanced (P+K during startup, 1 bar)
        name: 'Long Poke', label: 'DISTANCE FORMULA', cmd: 'F+P', level: 'mid', strength: 'medium', motion: 'straight',
        startup: 14, active: 3, recovery: 19, damage: 13,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 36, y: 60, h: 18 }, push: 16, juggle: 3.4, shake: 0.003,
        step: [6, 14, 1.6],
        anim: [[1, 'idle'], [9, 'dist_c'], [14, 'dist_x'], [17, 'dist_x'], [33, 'idle']]
      },
      // Slope-Intercept: out of a dash, a rising straight on a line.
      dashP: {
        ex: { text: 'ARMORED, LAUNCHES', armor: { hits: 1 }, hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Dash Straight', label: 'SLOPE-INTERCEPT', cmd: 'F,F+P', level: 'mid', strength: 'heavy', motion: 'lunge', wallSplat: true,
        startup: 13, active: 3, recovery: 19, damage: 17,
        block: -6, hit: { adv: 5 }, ch: { launch: 6.4 },
        hitbox: { x: 26, w: 32, y: 52, h: 24 }, push: 20, juggle: 3.6, carry: 1.6, shake: 0.005,
        step: [1, 13, 3.4],
        anim: [[1, 'slope_c'], [9, 'slope_c'], [13, 'slope_x'], [16, 'slope_x'], [34, 'idle']]
      },
      mid: {
        name: 'Whip Kick', label: 'TANGENT LINE', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 18, damage: 14,
        block: -4, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 30, w: 32, y: 40, h: 20 }, push: 16, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [8, 'whip_c'], [13, 'whip_x'], [16, 'whip_x'], [24, 'whip_c'], [33, 'idle']]
      },
      // Sine Wave: a weaving advance under highs, ending in a body blow.
      fK: {
        ex: { text: 'LAUNCHES', hit: { launch: true } }, // enhanced (P+K during startup, 1 bar)
        name: 'Weave', label: 'SINE WAVE', cmd: 'F+K', level: 'mid', strength: 'medium', motion: 'hook',
        startup: 20, active: 3, recovery: 16, damage: 15,
        block: -5, hit: { adv: 5 }, ch: { knockdown: true },
        evade: { from: 3, to: 18, levels: ['high'] },
        hitbox: { x: 22, w: 30, y: 40, h: 24 }, push: 14, juggle: 3.4, shake: 0.004,
        step: [3, 18, 2.4],
        anim: [[1, 'idle'], [6, 'sine_a'], [12, 'sine_b'], [17, 'sine_a'], [20, 'sine_x'], [23, 'sine_x'], [38, 'idle']]
      },
      low: {
        name: 'Low Whip', label: 'FLOOR FUNCTION', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', crouching: true, otg: true,
        startup: 14, active: 3, recovery: 20, damage: 11,
        block: -12, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 30, y: 0, h: 18 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [9, 'low_c'], [14, 'low_x'], [17, 'low_x'], [27, 'low_c'], [36, 'crouch']]
      },
      sweep: FG.kit.sweep('LIMIT TO ZERO', { startup: 20, motion: 'sweep', hitbox: { x: 32, w: 28, y: 0, h: 14 } }),
      heavy: {
        name: 'Stepping Straight', label: 'LONG DIVISION', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 18, active: 3, recovery: 21, damage: 21,
        block: -4, hit: { adv: 6 }, ch: { launch: 6 },
        hitbox: { x: 28, w: 32, y: 54, h: 22 }, push: 24, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 1.8],
        anim: [[1, 'idle'], [12, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [29, 'hv_r'], [41, 'idle']]
      },
      fH: {
        name: 'Axe Kick', label: 'QUADRATIC FORMULA', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 22, active: 3, recovery: 20, damage: 19, guardDmg: 22,
        block: -7, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 24, w: 30, y: 36, h: 40 }, push: 16, juggle: 2.5, shake: 0.006,
        step: [12, 22, 1.2],
        anim: [[1, 'idle'], [14, 'axe_c'], [22, 'axe_x'], [25, 'axe_x'], [34, 'hv_r'], [45, 'idle']]
      },
      // Absolute Value: a parry that sends their attack back at them (as hard as theirs, at least).
      bH: {
        name: 'Parry', label: 'ABSOLUTE VALUE', cmd: 'B+H', level: 'mid', strength: 'light',
        startup: 28, active: 1, recovery: 1, parry: { from: 3, to: 12, levels: ['high', 'mid', 'low'], counter: 'absCounter', reflect: true },
        parryLabel: 'ABSOLUTE VALUE!',
        anim: [[1, 'idle'], [3, 'parry'], [13, 'parry'], [28, 'idle']]
      },
      absCounter: {
        name: 'Reflected Strike', label: '|ABSOLUTE VALUE|', cmd: 'PARRY', level: 'mid', strength: 'heavy', motion: 'straight', reflect: true,
        startup: 6, active: 3, recovery: 18, damage: 16,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 34, y: 46, h: 30 }, push: 20, juggle: 3.5, carry: 1.6, shake: 0.007,
        anim: [[1, 'parry'], [6, 'abs_x'], [9, 'abs_x'], [26, 'idle']]
      },
      // Seen It All: the counter (see 29 YEARS); it comes out on its own.
      seenCounter: {
        name: 'Counter', label: 'SEEN IT ALL', cmd: 'AUTO (ONCE A ROUND)', level: 'mid', strength: 'heavy', motion: 'straight',
        startup: 5, active: 3, recovery: 16, damage: 18,
        block: -4, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 18, w: 38, y: 40, h: 40 }, push: 20, juggle: 3.5, carry: 1.6, shake: 0.008,
        anim: [[1, 'parry'], [5, 'seen_x'], [8, 'seen_x'], [24, 'idle']]
      },
      launcher: {
        name: 'Rising Heel', label: 'SQUARE ROOT', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 16,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 10, w: 28, y: 30, h: 84 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [9, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [40, 'idle']]
      }
    },
    FG.kit.air(['RATIONAL JAB', 'RADIAN KICK', 'VERTICAL ASYMPTOTE']),
    FG.kit.throws('PRIME FACTORIZATION', 'INVERSE FUNCTION', { throw: { damage: 34, flurry: 6 }, throwB: { damage: 32 } }),
    FG.kit.wake(),
    // He doesn't taunt. STARE: a second of standing still, for a little meter. Still leaves him open.
    FG.kit.taunt({ name: 'Stare', label: 'STARE', stare: true, anim: [[1, 'idle'], [8, 'stare'], [56, 'stare'], [61, 'idle']] })),

    combos: [
      { name: 'POINT, CHAIN', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 14: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'SQUARE ROOT JUGGLE', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 38: 'P', 56: 'P', 67: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'CHAIN RULE', difficulty: 'medium', notation: 'P, P, F+P', plan: { 0: 'P', 14: 'P', 28: 'F+P' }, hits: ['jab', 'jab2', 'fP'] },
      { name: 'VERTICAL ASYMPTOTE', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, K',
        plan: { 0: 'D+H', 17: 'UP', 31: 'P', 38: 'K', 47: 'H', 79: 'K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'mid'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'DISTANCE SQUARED', difficulty: 'medium', meter: 1, notation: 'F+P, P+K', steps: ['F+P, P+K (1 BAR)', 'SECOND HIT'],
        plan: { 0: 'F+P', 3: 'P+K' }, hits: ['fPEX', 'fPEX'] },
      { name: 'TENURE', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    // Walks in, stops, stares.
    intro: [[1, 'walk1'], [10, 'walk2'], [20, 'walk1'], [30, 'stand'], [44, 'stand'], [56, 'stare'], [80, 'stare'], [90, 'idle']],
    victory: [[1, 'stand'], [16, 'folded'], [60, 'folded'], [70, 'stare'], [110, 'stare'], [120, 'folded']],
    defeat: [[1, 'kneel'], [40, 'kneel2'], [80, 'kneel']],
    talk: {
      lines: ['Phones away.', "Twenty-nine years. Let's begin.", 'Sit down.'],
      quips: ['Again.', 'Sloppy.', 'Focus.']
    },
    victoryLines: ['Class dismissed.', 'Again. Tomorrow. Better.', 'That will be on the final.']
  });
})();
