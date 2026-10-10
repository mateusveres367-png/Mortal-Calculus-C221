// HUDSON — Defensive / Technical — "CALCULATOR KID". A 10th grader who already did the
// homework. Calm and precise: he lets you make the mistake, then shows you the answer.
//
// Signature: SHOW YOUR WORK. B+H is a quick parry for highs and mids (lows and throws
// beat it): catch a strike and he counters with a palm and a rising elbow that
// launches; catch a projectile and it's knocked away. Calculator Combo (F+P, P, P, H)
// is a string where every hit shows a number: 1, +2, +3, =6. Graphing Mode (F+K) is
// the longest poke on the student side; Pop-Up Error (B+P) opens a "SYNTAX ERROR" box
// in the air in front of them (a high, up to 150 away).
(function () {
  // A 10th grader: shorter limbs than the teachers, a little lanky.
  var R = FG.rigger({ torso: 25, neck: 11.5, upper: 14.5, fore: 12.5, thigh: 23, shin: 23 });
  // Upright and still: lead hand open at chest height, rear hand by his chin. Waiting.
  var stance = R({ hip: [0, 44], lean: 3, neck: -2, fa: { hand: [17, 66] }, ba: { hand: [6, 70] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } });
  var stand = R({ hip: [0, 45], lean: 0, fa: [-88, -80], ba: [-92, -84], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    // Arms folded, weight on one leg: "I'll wait."
    wait: R({ hip: [0, 45], lean: -2, neck: -4, fa: { hand: [8, 64] }, ba: { hand: [10, 62] }, fl: { foot: [6, 0] }, bl: { foot: [-7, 0] } }),
    // Holding up his calculator, checking the answer.
    check: R({ hip: [0, 45], lean: 2, neck: 8, fa: { hand: [14, 66] }, ba: { hand: [10, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // Typing: the lead hand taps, up and down.
    type1: R({ hip: [0, 45], lean: 6, neck: 10, fa: { hand: [16, 62] }, ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    type2: R({ hip: [0, 45], lean: 6, neck: 10, fa: { hand: [15, 58] }, ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // Pressing ENTER: one finger, a little flourish.
    enter: R({ hip: [0, 45], lean: 4, neck: 4, fa: [10, 30], ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // A gold star, held up for the class.
    star: R({ hip: [0, 45], lean: -2, neck: -6, fa: [60, 70], ba: [-95, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    nod: R({ hip: [0, 45], lean: 4, neck: 12, fa: [-88, -80], ba: [-92, -84], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),

    // Movement: small, measured steps; he never lunges.
    crouch: R({ hip: [0, 26], lean: 16, neck: 2, fa: { hand: [17, 50] }, ba: { hand: [7, 52] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    squat: R({ hip: [0, 32], lean: 12, fa: { hand: [16, 54] }, ba: { hand: [7, 56] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    jump: R({ hip: [0, 42], lean: 4, fa: { hand: [16, 66] }, ba: { hand: [6, 70] }, fl: [-30, -110], bl: [-100, -70] }),
    dash: R({ hip: [3, 38], lean: 20, neck: 4, fa: { hand: [18, 62] }, ba: { hand: [6, 64] }, fl: { foot: [16, 0] }, bl: { foot: [-14, 5] } }),
    backdash: R({ hip: [-3, 42], lean: -4, fa: { hand: [15, 68] }, ba: { hand: [5, 70] }, fl: { foot: [12, 5] }, bl: { foot: [-15, 0] } }),
    sidestep: R({ hip: [0, 36], lean: 10, neck: 4, fa: { hand: [15, 60] }, ba: { hand: [6, 64] }, fl: { foot: [8, 0] }, bl: { foot: [-9, 0] } }),
    // Guard: both forearms stacked up the centre line, chin tucked.
    block: R({ hip: [-1, 41], lean: 10, neck: 6, fa: { hand: [12, 72] }, ba: { hand: [10, 64] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    cblock: R({ hip: [-1, 26], lean: 16, fa: { hand: [14, 52] }, ba: { hand: [11, 46] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    // Hit reactions: he keeps his feet, mostly; the head snaps.
    hit_high: R({ hip: [-3, 44], lean: -12, neck: -18, fa: [40, -20], ba: { hand: [2, 66] }, fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }),
    hit_mid: R({ hip: [-4, 38], lean: 26, neck: 12, fa: { hand: [12, 40] }, ba: { hand: [5, 42] }, fl: { foot: [9, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 36], lean: 12, fa: { hand: [16, 52] }, ba: [-140, -100], fl: [-50, -100], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-4, 42], lean: -12, neck: -8, fa: [40, 90], ba: [60, 110], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -52, neck: -14, fa: [60, 120], ba: [90, 150], fl: [30, -30], bl: [0, -60] }),
    down: R({ hip: [0, 6], lean: -86, fa: [120, 170], ba: [-170, -130], fl: [12, -12], bl: [-4, 4] }),

    // Carry the One and Double Check: a straight lead jab, then a short, exact cross.
    jab_c: R({ hip: [1, 44], lean: 6, fa: { hand: [15, 68] }, ba: { hand: [6, 70] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [5, 44], lean: 8, neck: 2, fa: [0, 0], ba: { hand: [6, 70] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    cross_c: R({ hip: [2, 44], lean: 4, fa: { hand: [14, 68] }, ba: { hand: [2, 68] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    cross_x: R({ hip: [8, 42], lean: 14, fa: { hand: [10, 64] }, ba: [4, -2], fl: { foot: [17, 0] }, bl: { foot: [-9, 1] } }),
    // Calculator Combo: 1 (a palm), +2 (a backfist), +3 (a knee), =6 (a two-handed push).
    c1_c: R({ hip: [0, 43], lean: 2, fa: [-150, -40], ba: { hand: [6, 70] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    c1_x: R({ hip: [6, 42], lean: 12, fa: [-10, -14], ba: { hand: [7, 68] }, fl: { foot: [16, 0] }, bl: { foot: [-11, 0] } }),
    c2_c: R({ hip: [5, 42], lean: 8, fa: { hand: [4, 72] }, ba: { hand: [6, 66] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    c2_x: R({ hip: [7, 42], lean: 6, neck: -2, fa: [-20, 50], ba: { hand: [6, 66] }, fl: { foot: [16, 0] }, bl: { foot: [-10, 0] } }),
    c3_c: R({ hip: [6, 44], lean: 6, fa: { hand: [12, 66] }, ba: { hand: [4, 66] }, fl: [30, -110], bl: { foot: [-11, 0] } }),
    c3_x: R({ hip: [9, 46], lean: 16, fa: { hand: [14, 60] }, ba: { hand: [2, 62] }, fl: [70, -100], bl: { foot: [-10, 0] } }),
    c4_c: R({ hip: [4, 42], lean: -6, neck: -4, fa: { hand: [6, 60] }, ba: { hand: [2, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    c4_x: R({ hip: [12, 40], lean: 20, neck: 6, fa: [0, -4], ba: [6, 4], fl: { foot: [22, 0] }, bl: { foot: [-8, 2] } }),
    c4_r: R({ hip: [9, 42], lean: 10, fa: { hand: [18, 58] }, ba: { hand: [14, 56] }, fl: { foot: [18, 0] }, bl: { foot: [-10, 0] } }),
    // Straight Edge: a clean front kick, arms still up.
    kick_c: R({ hip: [-1, 45], lean: -4, fa: { hand: [15, 68] }, ba: { hand: [6, 70] }, fl: [40, -60], bl: { foot: [-12, 0] } }),
    kick_x: R({ hip: [0, 45], lean: -10, fa: { hand: [12, 70] }, ba: { hand: [4, 70] }, fl: [4, 2], bl: { foot: [-12, 0] } }),
    // Graphing Mode: a long side kick, flat as a line on a graph, lead arm pointing along it.
    graph_c: R({ hip: [-4, 44], lean: -10, fa: { hand: [12, 64] }, ba: { hand: [2, 70] }, fl: [60, -110], bl: { foot: [-12, 0] } }),
    graph_x: R({ hip: [-2, 44], lean: -30, neck: 10, fa: [-20, -10], ba: [-160, -150], fl: [-6, -2], bl: { foot: [-14, 0] } }),
    // Scratch Work: a quick crouching heel scrape.
    low_c: R({ hip: [0, 27], lean: 14, fa: { hand: [16, 50] }, ba: { hand: [7, 52] }, fl: [-30, -110], bl: { foot: [-13, 0] } }),
    low_x: R({ hip: [2, 25], lean: 6, fa: { hand: [14, 50] }, ba: { hand: [6, 52] }, fl: { foot: [44, 4] }, bl: { foot: [-13, 0] } }),
    // Drop the Decimal: a low spinning sweep.
    sweep_c: R({ hip: [-2, 22], lean: 26, fa: { hand: [16, 30] }, ba: { hand: [6, 34] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 17], lean: 18, fa: { hand: [10, 6] }, ba: [-170, -160], fl: { foot: [5, 0] }, bl: { foot: [48, 2] } }),
    // Long Division: a straight-down chop with the edge of the hand.
    hv_c: R({ hip: [-2, 46], lean: -10, neck: -6, fa: [140, 170], ba: { hand: [6, 66] }, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }),
    hv_x: R({ hip: [8, 40], lean: 28, neck: 8, fa: [10, -40], ba: { hand: [4, 58] }, fl: { foot: [19, 0] }, bl: { foot: [-10, 2] } }),
    hv_r: R({ hip: [5, 41], lean: 18, fa: { hand: [20, 40] }, ba: { hand: [6, 60] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    // Round Up: a rising palm, straight up the middle.
    up_c: R({ hip: [0, 24], lean: 20, neck: 2, fa: { hand: [12, 26] }, ba: { hand: [7, 48] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    up_x: R({ hip: [3, 48], lean: -4, neck: -10, fa: [96, 100], ba: { hand: [8, 62] }, fl: { foot: [10, 4] }, bl: { foot: [-12, 0] } }),
    up_r: R({ hip: [2, 44], lean: 0, fa: [80, 96], ba: { hand: [7, 64] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    // Pop-Up Error: he points, and the box opens where he points.
    err_c: R({ hip: [0, 44], lean: 2, neck: 4, fa: { hand: [12, 62] }, ba: { hand: [10, 60] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    err_x: R({ hip: [2, 44], lean: 4, neck: -2, fa: [-6, 10], ba: { hand: [10, 60] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    // Show Your Work: open palm out, catching it.
    parry: R({ hip: [-2, 42], lean: -4, neck: -2, fa: [-30, 30], ba: { hand: [6, 66] }, fl: { foot: [9, 0] }, bl: { foot: [-14, 0] } }),
    // Checked: a palm to the chest, then a rising elbow.
    chk_x: R({ hip: [8, 42], lean: 16, fa: [-6, -6], ba: { hand: [6, 64] }, fl: { foot: [17, 0] }, bl: { foot: [-11, 0] } }),
    chk_r: R({ hip: [6, 46], lean: -2, neck: -8, fa: [130, 40], ba: { hand: [6, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),

    // Air: Decimal Point (a short punch down), Slope (a straight kick), Divide (an axe chop).
    air_p: R({ hip: [0, 44], lean: 12, fa: [-20, -40], ba: { hand: [6, 66] }, fl: [-30, -110], bl: [-100, -70] }),
    air_k: R({ hip: [0, 44], lean: -14, fa: { hand: [14, 66] }, ba: { hand: [4, 68] }, fl: [-10, -10], bl: [-110, -70] }),
    air_hc: R({ hip: [0, 46], lean: -8, fa: [150, 170], ba: { hand: [6, 64] }, fl: [-30, -110], bl: [-110, -70] }),
    air_hx: R({ hip: [0, 44], lean: 26, fa: [-10, -50], ba: { hand: [6, 60] }, fl: [-30, -110], bl: [-110, -70] }),

    // Answer Key: a wrist lock, turned over, and down. Wrong Answer: walked past, behind.
    grab_c: R({ hip: [2, 44], lean: 10, fa: { hand: [22, 64] }, ba: { hand: [12, 66] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [4, 44], lean: 12, fa: { hand: [26, 62] }, ba: { hand: [22, 62] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [0, 44], lean: -8, fa: [60, 80], ba: { hand: [14, 70] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 32], lean: 34, fa: { hand: [30, 18] }, ba: { hand: [24, 24] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 44], lean: -14, fa: [140, 170], ba: [120, 160], fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -58, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [40, 6] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 44], lean: 14, fa: [-10, -10], ba: { hand: [6, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } })
  };
  poses.taunt = poses.wait;

  FG.defineFighter({
    id: 'hudson', order: 14, student: true,
    homeStage: 'lab',
    glyphs: ['=', 'ERROR', 'QED', '100%', 'ANS'],
    stringH: 'EQUALS SIGN',
    cutIn: { a: 0x22262e, b: 0x8ae0b0 }, // calculator gray and LCD green
    finisher: { name: 'EXTRA CREDIT', input: 'B, F, P' },
    ultimate: { name: 'CALCULATOR OVERFLOW', text: 'he types into a giant calculator, the screen fills with ERROR boxes, and every one of them hits at once', from: 'fP', len: 280,
      hits: [196, 199, 202, 205, 208, 211, 214, 217, 236], weights: [1, 1, 1, 1, 1, 1, 1, 1, 6], end: { gap: 70, down: true } },
    name: 'HUDSON', nickname: 'CALCULATOR KID', archetype: 'DEFENSIVE', theme: 'CALCULATORS',
    style: 'PRECISE COUNTER-FIGHTER', signatureMechanic: 'SHOW YOUR WORK',
    signatureText: 'B+H is a quick parry for highs and mids (lows and throws beat it): catch a strike and he counters with a launching palm and elbow; catch a projectile and it is knocked away. Calculator Combo (F+P, P, P, H) shows a number on every hit: 1, +2, +3, =6. Graphing Mode (F+K) is a very long poke; Pop-Up Error (B+P) opens a SYNTAX ERROR box in the air in front of them',
    bio: 'CALM AND PRECISE. ALREADY FINISHED THE HOMEWORK.',
    signature: ['SHOW YOUR WORK', 'CALCULATOR COMBO', 'GRAPHING MODE', 'POP-UP ERROR'],
    scale: 0.93, health: 172,
    walkF: 2.3, walkB: 1.7, dashSpeed: 8.0, dashFrames: 15, backdashSpeed: 8.8,
    jumpVy: 9.2, weight: 1.0, react: 0.95,
    walk: { lean: 0, bob: 0.6, rate: 0.2 },
    look: {
      skin: 0xe6c29e,
      hair: { style: 'straight', color: 0x121214 },
      mouth: 'calm', brows: 'normal',
      top: { style: 'tee', color: 0xf2f2f0, sleeves: 'short' },
      legs: 0x2c3444, shoes: 0x2a2a2e,
      build: { torso: 0.9, limb: 0.93 }
    },
    idleAnim: { breath: 0.6, bob: 0.4, sway: 0.2, rate: 0.07 }, // barely moves
    poses: poses,
    // How the CPU plays him: waits at the end of Graphing Mode, parries, punishes.
    ai: { spacing: 92, pokes: ['F+K', 'K', 'D+K', 'F+K'], close: ['P', 'F+P>P>P>H', 'P>P>H', 'D+K', 'P+K', 'H'], far: ['B+P'], zone: 0.3, zoneDist: 120, aggro: 0.8, parry: 0.35 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'CARRY THE ONE', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 30, y: 60, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 20, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'DOUBLE CHECK', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 15, damage: 9,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 34, y: 54, h: 36 }, push: 7, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [25, 'idle']]
      },
      // Calculator Combo: every hit shows its number (hitText).
      fP: {
        name: 'Palm', label: 'CALCULATOR COMBO', cmd: 'F+P', level: 'mid', strength: 'medium', motion: 'straight', hitText: '1',
        startup: 12, active: 3, recovery: 16, damage: 9,
        block: -3, hit: { adv: 5 }, ch: { adv: 8 },
        hitbox: { x: 18, w: 26, y: 46, h: 26 }, push: 6, juggle: 3.4, shake: 0.002,
        step: [4, 12, 1.4],
        cancels: [{ btn: 'p', into: 'calc2', from: 12, to: 24, onContact: true }],
        anim: [[1, 'idle'], [7, 'c1_c'], [12, 'c1_x'], [15, 'c1_x'], [24, 'c1_c'], [31, 'idle']]
      },
      calc2: {
        name: 'Backfist', label: 'PLUS TWO', cmd: 'F+P,P', level: 'high', strength: 'light', motion: 'hook', hitText: '+2',
        startup: 10, active: 2, recovery: 16, damage: 8,
        block: -4, hit: { adv: 5 }, ch: { adv: 8 },
        hitbox: { x: 16, w: 30, y: 56, h: 30 }, push: 6, juggle: 3.4,
        cancels: [{ btn: 'p', into: 'calc3', from: 10, to: 22, onContact: true }],
        anim: [[1, 'c1_x'], [6, 'c2_c'], [10, 'c2_x'], [12, 'c2_x'], [26, 'idle']]
      },
      calc3: {
        name: 'Knee', label: 'PLUS THREE', cmd: 'F+P,P,P', level: 'mid', strength: 'medium', motion: 'kick', hitText: '+3',
        startup: 10, active: 3, recovery: 18, damage: 9,
        block: -6, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 12, w: 30, y: 34, h: 30 }, push: 6, juggle: 3.6, shake: 0.002,
        cancels: [{ btn: 'h', into: 'calc4', from: 10, to: 22, onContact: true }],
        anim: [[1, 'c2_x'], [6, 'c3_c'], [10, 'c3_x'], [13, 'c3_x'], [28, 'idle']]
      },
      calc4: {
        name: 'Double Palm', label: 'EQUALS SIX', cmd: 'F+P,P,P,H', level: 'mid', strength: 'heavy', motion: 'straight', hitText: '=6',
        startup: 12, active: 3, recovery: 22, damage: 15,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 16, w: 32, y: 40, h: 34 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [6, 12, 2.2],
        anim: [[1, 'c3_x'], [7, 'c4_c'], [12, 'c4_x'], [15, 'c4_x'], [26, 'c4_r'], [37, 'idle']]
      },
      mid: {
        name: 'Front Kick', label: 'STRAIGHT EDGE', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 17, damage: 12,
        block: -4, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 22, w: 30, y: 32, h: 22 }, push: 12, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'kick_c'], [13, 'kick_x'], [16, 'kick_x'], [25, 'kick_c'], [33, 'idle']]
      },
      // Graphing Mode: the longest reach on the student side.
      fK: {
        ex: { text: 'LAUNCHES', hit: { launch: true } },
        name: 'Long Side Kick', label: 'GRAPHING MODE', cmd: 'F+K', level: 'mid', strength: 'medium', motion: 'kick', hitText: 'Y=MX+B',
        startup: 16, active: 3, recovery: 19, damage: 13,
        block: -6, hit: { adv: 3 }, ch: { adv: 8 },
        hitbox: { x: 26, w: 48, y: 36, h: 18 }, push: 14, juggle: 3.6, shake: 0.003,
        anim: [[1, 'idle'], [9, 'graph_c'], [16, 'graph_x'], [19, 'graph_x'], [28, 'graph_c'], [38, 'idle']]
      },
      low: {
        name: 'Heel Scrape', label: 'SCRATCH WORK', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low',
        startup: 14, active: 3, recovery: 19, damage: 9, crouching: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 5 },
        hitbox: { x: 24, w: 26, y: 0, h: 14 }, push: 9, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [9, 'low_c'], [14, 'low_x'], [17, 'low_x'], [27, 'low_c'], [35, 'crouch']]
      },
      sweep: FG.kit.sweep('DROP THE DECIMAL', { startup: 19, damage: 14, motion: 'sweep' }),
      heavy: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true },
        name: 'Chop', label: 'LONG DIVISION', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'overhead', wallSplat: true,
        startup: 18, active: 3, recovery: 20, damage: 19,
        block: -5, hit: { adv: 4 }, ch: { launch: 5.6 },
        hitbox: { x: 16, w: 28, y: 36, h: 36 }, push: 20, juggle: 3.4, carry: 1.8, shake: 0.005,
        step: [9, 18, 1.2],
        anim: [[1, 'idle'], [11, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [29, 'hv_r'], [38, 'idle']]
      },
      launcher: {
        ex: { text: 'ARMORED, LAUNCHES HIGHER', armor: { hits: 1 }, hit: { launch: 8.4 } },
        name: 'Rising Palm', label: 'ROUND UP', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 9 },
        hitbox: { x: 8, w: 32, y: 26, h: 78 }, push: 6, juggle: 5.5, carry: 0.5, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [9, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [41, 'idle']]
      },
      // Pop-Up Error: a SYNTAX ERROR box opens in the air in front of them (up to 150
      // away, never past them) and hits a moment later. A high: duck it.
      bP: {
        name: 'Projectile', label: 'POP-UP ERROR', cmd: 'B+P', level: 'high', strength: 'medium', motion: 'jab',
        startup: 16, active: 1, recovery: 22, damage: 11,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        projectile: { kind: 'error', x: 24, y: 50, spawn: 150, arm: 10, w: 34, h: 24, life: 40 },
        push: 8, shake: 0.003,
        anim: [[1, 'idle'], [8, 'err_c'], [16, 'err_x'], [30, 'err_x'], [39, 'idle']]
      },
      // Show Your Work: a quick parry for highs and mids, then the counter.
      bH: {
        name: 'Parry', label: 'SHOW YOUR WORK', cmd: 'B+H', level: 'mid', strength: 'light',
        startup: 26, active: 1, recovery: 1,
        parry: { from: 3, to: 12, levels: ['high', 'mid'], counter: 'checkWork' }, parryLabel: 'SHOW YOUR WORK!',
        anim: [[1, 'idle'], [3, 'parry'], [14, 'parry'], [20, 'block'], [27, 'idle']]
      },
      checkWork: {
        name: 'Palm and Elbow', label: 'CHECKED', cmd: 'SHOW YOUR WORK, CAUGHT', level: 'mid', strength: 'heavy', motion: 'launcher',
        startup: 5, active: 3, recovery: 20, damage: 17,
        block: -8, hit: { launch: 6.6 }, ch: { launch: 7 },
        hitbox: { x: 10, w: 30, y: 40, h: 46 }, push: 8, juggle: 4, carry: 0.6, shake: 0.007,
        step: [1, 5, 2.2],
        anim: [[1, 'parry'], [5, 'chk_x'], [8, 'chk_r'], [18, 'chk_r'], [28, 'idle']]
      }
    },
    FG.kit.air(['DECIMAL POINT', 'SLOPE', 'DIVIDE']),
    FG.kit.throws('ANSWER KEY', 'WRONG ANSWER', { throw: { damage: 30 }, throwB: { damage: 33 } }),
    FG.kit.wake({ wakeLow: { label: 'RECALCULATE' }, wakeMid: { label: 'CLEAR ENTRY' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'CALCULATOR COMBO', difficulty: 'easy', notation: 'F+P, P, P, H', plan: { 0: 'F+P', 14: 'P', 28: 'P', 41: 'H' }, hits: ['fP', 'calc2', 'calc3', 'calc4'] },
      { name: 'DOUBLE CHECK', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 25: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'ROUND UP', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 41: 'P', 53: 'P', 63: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'SHOW YOUR WORK', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K',
        plan: { 0: 'D+H', 16: 'UP', 31: 'P', 37: 'K', 44: 'H', 98: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'ROUNDED UP', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 50: 'P', 59: 'P', 68: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'CALCULATOR OVERFLOW', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'check'], [40, 'type1'], [44, 'type2'], [48, 'type1'], [52, 'enter'], [66, 'wait'], [86, 'idle']],
    victory: [[1, 'stand'], [12, 'check'], [40, 'nod'], [52, 'nod'], [60, 'wait'], [110, 'wait']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { nod: [[1, 'idle'], [8, 'nod'], [22, 'nod'], [30, 'idle']] },
    bigHit: { gesture: 'nod' },
    talk: {
      lines: ['Already did the homework.', 'Show your work.', "I'll wait."],
      quips: ['Checks out.', 'Correct.', 'Show your work.', 'Carry the one.']
    },
    victoryLines: ['Checked my answer. Still right.', "That's a syntax error.", 'Extra credit.']
  });
})();
