// MATEUS — Balanced — "GNOME". A 10th grader, the cover fighter of the student side.
// Sneaky and smug: he pops up where you don't expect him, and loves the moment you
// realize you got gnomed.
//
// Signature: LAWN STATUE. B+H freezes him perfectly still, like a garden gnome (hold
// H to stay frozen a little longer). Attack him while he's frozen and he pops out and
// counters; throws beat it. Gnome Toss (B+P) lobs a mini garden gnome that tumbles
// along the floor (a low once it lands); Pop-Up (D+P) sinks into the ground and comes
// up right next to them.
(function () {
  // A 10th grader: shorter limbs than the teachers.
  var R = FG.rigger({ torso: 25, neck: 11, upper: 14, fore: 12.5, thigh: 22, shin: 22.5 });
  // Loose fists low, shoulders forward: a little hunched, up to something.
  var stance = R({ hip: [0, 40], lean: 9, neck: -4, fa: { hand: [16, 60] }, ba: { hand: [7, 57] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } });
  var stand = R({ hip: [0, 44], lean: -2, fa: [-80, -70], ba: [-95, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });
  // Lawn Statue: frozen like a garden gnome, hands folded on his belly, chin up.
  var statue = R({ hip: [0, 38], lean: -4, neck: -8, fa: { hand: [9, 52] }, ba: { hand: [7, 51] }, fl: { foot: [6, 0] }, bl: { foot: [-5, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    statue: statue,
    smug: R({ hip: [0, 44], lean: -6, neck: -10, fa: { hand: [4, 62] }, ba: { hand: [10, 63] }, fl: { foot: [7, 0] }, bl: { foot: [-6, 0] } }),
    shrug: R({ hip: [0, 44], lean: -2, neck: -8, fa: [-20, 60], ba: [-160, 120], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    wave: R({ hip: [0, 44], lean: -4, neck: -6, fa: [20, 80], ba: [-95, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    wave2: R({ hip: [0, 44], lean: -4, neck: -6, fa: [30, 100], ba: [-95, -80], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    point: R({ hip: [0, 44], lean: -2, neck: -6, fa: [5, 10], ba: { hand: [6, 52] }, fl: { foot: [7, 0] }, bl: { foot: [-6, 0] } }),
    laugh: R({ hip: [0, 42], lean: 16, neck: 12, fa: { hand: [10, 50] }, ba: { hand: [4, 48] }, fl: { foot: [8, 0] }, bl: { foot: [-6, 0] } }),
    sit: R({ hip: [0, 14], lean: -6, neck: -8, fa: { hand: [14, 30] }, ba: { hand: [-12, 12] }, fl: [10, -40], bl: [20, -60] }),
    peek: R({ hip: [-2, 30], lean: 30, neck: 20, fa: { hand: [16, 50] }, ba: { hand: [8, 46] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    tap: R({ hip: [0, 42], lean: 2, neck: -4, fa: [20, 40], ba: { hand: [6, 56] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),

    // Movement: quick little steps, always crouched a bit.
    crouch: R({ hip: [0, 24], lean: 22, neck: 4, fa: { hand: [16, 44] }, ba: { hand: [8, 42] }, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }),
    squat: R({ hip: [0, 30], lean: 18, fa: { hand: [15, 50] }, ba: { hand: [8, 48] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    jump: R({ hip: [0, 42], lean: 10, fa: [20, 60], ba: [-150, -120], fl: [-20, -100], bl: [-110, -60] }),
    dash: R({ hip: [4, 34], lean: 34, neck: 8, fa: [-140, -110], ba: [-160, -130], fl: { foot: [18, 0] }, bl: { foot: [-16, 6] } }),
    backdash: R({ hip: [-2, 38], lean: -6, fa: { hand: [14, 58] }, ba: { hand: [4, 56] }, fl: { foot: [12, 6] }, bl: { foot: [-14, 0] } }),
    sidestep: R({ hip: [0, 32], lean: 16, neck: 6, fa: { hand: [14, 52] }, ba: { hand: [8, 50] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    // Guard: forearms up in front of his face, ducking behind them.
    block: R({ hip: [-1, 38], lean: 14, neck: 6, fa: { hand: [13, 68] }, ba: { hand: [9, 70] }, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }),
    cblock: R({ hip: [-1, 24], lean: 20, fa: { hand: [14, 50] }, ba: { hand: [10, 52] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    // Hit reactions: he's light, so he reels.
    hit_high: R({ hip: [-3, 42], lean: -14, neck: -16, fa: [60, -40], ba: [-130, -80], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 36], lean: 30, neck: 14, fa: { hand: [10, 36] }, ba: { hand: [4, 38] }, fl: { foot: [9, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 34], lean: 14, fa: [-40, -20], ba: [-150, -110], fl: [-40, -100], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-4, 40], lean: -14, neck: -10, fa: [50, 100], ba: [70, 120], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -56, neck: -16, fa: [70, 130], ba: [100, 150], fl: [40, -20], bl: [10, -50] }),
    down: R({ hip: [0, 6], lean: -84, fa: [110, 170], ba: [-160, -120], fl: [16, -16], bl: [-6, 6] }),

    // Garden Jab and Rake It In: a quick jab and a looping cross.
    jab_c: R({ hip: [2, 40], lean: 12, fa: { hand: [18, 62] }, ba: { hand: [6, 58] }, fl: { foot: [13, 0] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [6, 40], lean: 16, neck: 4, fa: [6, 4], ba: { hand: [8, 60] }, fl: { foot: [17, 0] }, bl: { foot: [-11, 0] } }),
    cross_c: R({ hip: [3, 40], lean: 10, fa: { hand: [16, 62] }, ba: [-120, 60], fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    cross_x: R({ hip: [9, 38], lean: 22, fa: { hand: [12, 58] }, ba: [12, -6], fl: { foot: [19, 0] }, bl: { foot: [-9, 1] } }),
    // Gnome Headbutt: he ducks and drives the top of his head into them.
    head_c: R({ hip: [-1, 38], lean: -10, neck: -14, fa: [-120, -80], ba: [-140, -100], fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }),
    head_x: R({ hip: [10, 36], lean: 56, neck: 26, fa: [-150, -120], ba: [-165, -140], fl: { foot: [20, 0] }, bl: { foot: [-10, 3] } }),
    head_r: R({ hip: [6, 38], lean: 30, neck: 10, fa: { hand: [14, 52] }, ba: { hand: [6, 50] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    // Lawn Kick: a snapping front kick, arms flung back.
    kick_c: R({ hip: [-1, 42], lean: -4, fa: [-140, -100], ba: { hand: [10, 60] }, fl: [20, -60], bl: { foot: [-12, 0] } }),
    kick_x: R({ hip: [0, 42], lean: -14, fa: [-150, -110], ba: { hand: [12, 62] }, fl: [8, 4], bl: { foot: [-12, 0] } }),
    // Weed Whacker: a crouching shin kick.
    wlow_c: R({ hip: [0, 26], lean: 20, fa: { hand: [16, 46] }, ba: { hand: [8, 44] }, fl: [-20, -110], bl: { foot: [-13, 0] } }),
    wlow_x: R({ hip: [2, 24], lean: 8, fa: { hand: [12, 44] }, ba: [-160, -150], fl: { foot: [42, 6] }, bl: { foot: [-13, 0] } }),
    // Garden Sweep: dropping low and spinning a leg along the lawn.
    sweep_c: R({ hip: [-2, 20], lean: 30, fa: { hand: [18, 26] }, ba: { hand: [6, 30] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 16], lean: 20, fa: { hand: [12, 4] }, ba: [-170, -170], fl: { foot: [4, 0] }, bl: { foot: [46, 2] } }),
    // Shovel Swing: both fists together, over the top and down.
    hv_c: R({ hip: [-3, 42], lean: -16, neck: -6, fa: [110, 150], ba: [120, 160], fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }),
    hv_x: R({ hip: [8, 36], lean: 36, neck: 8, fa: [20, -10], ba: [26, -6], fl: { foot: [20, 0] }, bl: { foot: [-10, 2] } }),
    hv_r: R({ hip: [5, 38], lean: 26, fa: { hand: [22, 40] }, ba: { hand: [18, 40] }, fl: { foot: [16, 0] }, bl: { foot: [-12, 0] } }),
    // Got Gnomed: tiny, from the ground up, and it pops them way up.
    up_c: R({ hip: [0, 20], lean: 26, neck: 4, fa: { hand: [10, 18] }, ba: { hand: [6, 30] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    up_x: R({ hip: [4, 46], lean: -6, neck: -10, fa: [80, 92], ba: [-130, -90], fl: { foot: [10, 6] }, bl: { foot: [-12, 0] } }),
    up_r: R({ hip: [2, 42], lean: 2, fa: [70, 100], ba: { hand: [6, 56] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    // Gnome Toss: an underhand lob.
    toss_c: R({ hip: [-2, 38], lean: 4, fa: { hand: [10, 58] }, ba: [-150, -150], fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    toss_x: R({ hip: [4, 38], lean: 12, fa: { hand: [12, 56] }, ba: [40, 50], fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    // Pop-Up: crouch, sink, and come up swinging.
    dig: R({ hip: [0, 16], lean: 34, neck: 8, fa: { hand: [16, 10] }, ba: { hand: [6, 12] }, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }),
    pop_c: R({ hip: [0, 18], lean: 16, fa: { hand: [12, 22] }, ba: { hand: [4, 24] }, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }),
    pop_x: R({ hip: [2, 46], lean: -4, neck: -14, fa: [70, 88], ba: [60, 95], fl: { foot: [8, 4] }, bl: { foot: [-8, 6] } }),
    // The Lawn Statue counter: unfreezing straight into a hopping headbutt.
    spop_x: R({ hip: [8, 46], lean: 34, neck: 16, fa: [-140, -120], ba: [-160, -150], fl: [-40, -110], bl: [-110, -70] }),

    // Air: Acorn Drop (a hammer fist), Pinwheel Kick, Watering Can (both fists down).
    air_p: R({ hip: [0, 44], lean: 10, fa: [-10, -60], ba: [-150, -110], fl: [-20, -100], bl: [-110, -60] }),
    air_k: R({ hip: [0, 44], lean: -10, fa: [100, 140], ba: [-150, -110], fl: [10, -20], bl: [-100, -60] }),
    air_hc: R({ hip: [0, 46], lean: -10, fa: [100, 130], ba: [110, 140], fl: [-30, -110], bl: [-110, -70] }),
    air_hx: R({ hip: [0, 44], lean: 30, fa: [0, -50], ba: [6, -44], fl: [-30, -110], bl: [-110, -70] }),

    // Yard Work: grab, haul them up and plant them. Compost: dump them behind him.
    grab_c: R({ hip: [2, 40], lean: 14, fa: { hand: [20, 62] }, ba: { hand: [16, 60] }, fl: { foot: [13, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [4, 40], lean: 18, fa: { hand: [26, 60] }, ba: { hand: [24, 58] }, fl: { foot: [15, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [2, 42], lean: -6, fa: [80, 100], ba: [70, 95], fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [8, 30], lean: 40, fa: { hand: [32, 20] }, ba: { hand: [28, 22] }, fl: { foot: [20, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 40], lean: -20, fa: [150, 175], ba: [140, 170], fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -60, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [38, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 40], lean: 20, neck: 10, fa: [-140, -110], ba: [-150, -130], fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } })
  };
  poses.taunt = poses.wave;

  FG.defineFighter({
    id: 'mateus', order: 10, student: true,
    homeStage: 'quad',
    glyphs: ['GNOMED', 'HA', '?!', 'SURPRISE'],
    stringH: 'WHEELBARROW',
    cutIn: { a: 0x1d2c5e, b: 0x7dd96a }, // navy and lawn green
    finisher: { name: "YOU'VE BEEN GNOMED", input: 'D, U, P' },
    ultimate: { name: 'GNOME ARMY', text: 'dozens of garden gnomes pop out of the ground; whenever the opponent looks at them they freeze, when they turn away the gnomes swarm, and the last one bonks them with a watering can', from: 'fP', len: 300,
      hits: [118, 150, 168, 182, 194, 204, 212, 220, 262], weights: [1, 1, 1, 1, 1, 1, 1, 1, 6], end: { gap: 70, down: true } },
    name: 'MATEUS', nickname: 'GNOME', archetype: 'BALANCED', theme: 'GNOMES',
    style: 'SCRAPPY TRICKSTER', signatureMechanic: 'LAWN STATUE',
    signatureText: 'B+H freezes him still like a garden gnome (hold H to stay frozen a little longer): attack him while he is frozen and he pops out and counters; throws beat it. Gnome Toss (B+P) lobs a mini gnome that tumbles along the floor as a low; Pop-Up (D+P) sinks into the ground and comes up right next to them',
    bio: 'SNEAKY AND SMUG. POPS UP WHERE YOU DON\'T EXPECT HIM.',
    signature: ['LAWN STATUE', 'GNOME TOSS', 'POP-UP', 'GOT GNOMED'],
    scale: 0.93, health: 184,
    walkF: 2.5, walkB: 1.6, dashSpeed: 8.6, dashFrames: 15, backdashSpeed: 8.2,
    jumpVy: 9.3, weight: 0.96, react: 1.1,
    walk: { lean: 2, bob: 1.2, rate: 0.28 },
    look: {
      skin: 0xe3b48c,
      hair: { style: 'curtain', color: 0x3b2416 },
      mouth: 'smirk', brows: 'normal',
      top: { style: 'tee', color: 0x1d2c5e, sleeves: 'short' },
      legs: 0x3a4152, shoes: 0xe8e8e8,
      build: { torso: 0.92, limb: 0.94 }
    },
    idleAnim: { breath: 0.8, bob: 1.2, sway: 0.8, rate: 0.12 },
    poses: poses,
    // How the CPU plays him: a gnome on the lawn, then he's right next to you.
    ai: { spacing: 70, pokes: ['F+P', 'K', 'D+K'], close: ['P', 'F+P', 'D+K', 'P+K', 'P>P>H'], far: ['B+P', 'D+P'], zone: 0.45, aggro: 0.9, parry: 0.25 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'GARDEN JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 13, damage: 8,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 28, y: 58, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 21, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'RAKE IT IN', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 16, damage: 9,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 20, w: 30, y: 56, h: 32 }, push: 8, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [27, 'idle']]
      },
      // Gnome Headbutt: fast, mid, and it gets in.
      fP: {
        ex: { text: 'TWO HITS, LAUNCHES', multi: 1, hit: { launch: true } },
        name: 'Headbutt', label: 'GNOME HEADBUTT', cmd: 'F+P', level: 'mid', strength: 'medium', motion: 'straight',
        startup: 12, active: 3, recovery: 17, damage: 14,
        block: -3, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 22, y: 52, h: 22 }, push: 10, juggle: 3.5, shake: 0.003,
        step: [4, 12, 2.2],
        cancels: [{ btn: 'p', into: 'jab2', from: 12, to: 24, onContact: true }],
        anim: [[1, 'idle'], [7, 'head_c'], [12, 'head_x'], [15, 'head_x'], [24, 'head_r'], [32, 'idle']]
      },
      mid: {
        name: 'Front Kick', label: 'LAWN KICK', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 18, damage: 13,
        block: -5, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 22, w: 28, y: 30, h: 22 }, push: 12, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'kick_c'], [13, 'kick_x'], [16, 'kick_x'], [26, 'kick_c'], [34, 'idle']]
      },
      low: {
        name: 'Shin Kick', label: 'WEED WHACKER', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low',
        startup: 15, active: 3, recovery: 19, damage: 10, crouching: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 5 },
        hitbox: { x: 24, w: 24, y: 0, h: 14 }, push: 9, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [10, 'wlow_c'], [15, 'wlow_x'], [18, 'wlow_x'], [28, 'wlow_c'], [36, 'crouch']]
      },
      // Garden Sweep: down-back + K takes their legs.
      sweep: FG.kit.sweep('GARDEN SWEEP', { name: 'Garden Sweep', startup: 18, damage: 15, motion: 'sweep' }),
      heavy: {
        name: 'Overhand Swing', label: 'SHOVEL SWING', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'overhead', wallSplat: true,
        startup: 18, active: 3, recovery: 21, damage: 20,
        block: -6, hit: { adv: 4 }, ch: { launch: 5.6 },
        hitbox: { x: 16, w: 28, y: 36, h: 34 }, push: 22, juggle: 3.4, carry: 1.8, shake: 0.006,
        step: [10, 18, 1.4],
        anim: [[1, 'idle'], [11, 'hv_c'], [18, 'hv_x'], [21, 'hv_x'], [30, 'hv_r'], [40, 'idle']]
      },
      // Got Gnomed: a tiny uppercut that pops them way up.
      launcher: {
        name: 'Uppercut', label: 'GOT GNOMED', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 9.4 },
        hitbox: { x: 8, w: 30, y: 26, h: 76 }, push: 6, juggle: 5.5, carry: 0.5, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [9, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [41, 'idle']]
      },
      // Gnome Toss: a mini garden gnome, lobbed. It tumbles along the floor once it
      // lands, and then it's a low.
      bP: {
        ex: { text: 'A BIGGER GNOME, KNOCKDOWN', projectile: { w: 18, h: 18, vx: 5 }, hit: { knockdown: true } },
        name: 'Projectile', label: 'GNOME TOSS', cmd: 'B+P', level: 'mid', strength: 'medium', motion: 'cross',
        startup: 14, active: 1, recovery: 22, damage: 12,
        block: -4, hit: { adv: 3 }, ch: { adv: 7 },
        projectile: { kind: 'gnome', x: 26, y: 40, vx: 4.4, vy: 2.6, g: 0.17, w: 13, h: 15, range: 360, life: 150, ground: 'slide', lowBelow: 10 },
        push: 9, shake: 0.003,
        anim: [[1, 'idle'], [8, 'toss_c'], [14, 'toss_x'], [22, 'toss_x'], [36, 'idle']]
      },
      // Pop-Up: sinks into the ground and comes up right in front of them, swinging.
      dP: {
        ex: { text: 'POPS UP BEHIND THEM', teleport: { to: 'behind' }, hit: { launch: true } },
        name: 'Teleport', label: 'POP-UP', cmd: 'D+P', level: 'mid', strength: 'heavy', motion: 'launcher',
        startup: 25, active: 3, recovery: 22, damage: 15,
        block: -12, hit: { knockdown: true }, ch: { launch: 6.4 },
        teleport: { at: 19, to: 'front', gap: 36, hide: [7, 18] }, invuln: [7, 19],
        hitbox: { x: 8, w: 26, y: 30, h: 60 }, push: 10, juggle: 4, carry: 0.6, shake: 0.006,
        anim: [[1, 'idle'], [5, 'dig'], [18, 'dig'], [20, 'pop_c'], [25, 'pop_x'], [29, 'pop_x'], [38, 'up_r'], [49, 'idle']]
      },
      // Lawn Statue: frozen still (hold H to stay frozen). Attack him and he pops out.
      bH: {
        name: 'Counter Stance', label: 'LAWN STATUE', cmd: 'B+H (HOLD)', level: 'mid', strength: 'light',
        startup: 30, active: 1, recovery: 1, hold: { at: 9, btn: 'h', max: 46 },
        parry: { from: 4, to: 10, levels: ['high', 'mid', 'low'], counter: 'statuePop' }, parryLabel: 'GOT GNOMED!',
        anim: [[1, 'idle'], [4, 'statue'], [30, 'statue'], [31, 'idle']]
      },
      statuePop: {
        name: 'Statue Counter', label: 'GNOMED', cmd: 'LAWN STATUE, ATTACKED', level: 'mid', strength: 'heavy', motion: 'straight',
        startup: 6, active: 3, recovery: 20, damage: 18,
        block: -8, hit: { launch: 6.4 }, ch: { launch: 6.8 },
        hitbox: { x: 12, w: 30, y: 40, h: 40 }, push: 8, juggle: 4, carry: 0.6, shake: 0.007,
        step: [1, 6, 2.6],
        anim: [[1, 'statue'], [6, 'spop_x'], [9, 'spop_x'], [18, 'head_r'], [29, 'idle']]
      }
    },
    FG.kit.air(['ACORN DROP', 'PINWHEEL KICK', 'WATERING CAN']),
    FG.kit.throws('YARD WORK', 'COMPOST', { throw: { damage: 31 }, throwB: { damage: 34 } }),
    FG.kit.wake({ wakeLow: { label: 'SPRINKLER' }, wakeMid: { label: 'SPRING BULB' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'TWO-STEP', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 25: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'HEADS UP', difficulty: 'easy', notation: 'F+P, P, H', plan: { 0: 'F+P', 14: 'P', 27: 'H' }, hits: ['fP', 'jab2', 'jabH'] },
      { name: 'GOT GNOMED', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 55: 'P', 64: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'GARDEN PARTY', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K',
        plan: { 0: 'D+H', 16: 'UP', 22: 'P', 28: 'K', 34: 'H', 66: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'WHEELBARROW PLUS', difficulty: 'medium', meter: 1, notation: 'F+P, P+K, P, P, H', steps: ['F+P, P+K (1 BAR)', '(SECOND HIT)', 'P', 'P', 'H'],
        plan: { 0: 'F+P', 3: 'P+K', 38: 'P', 51: 'P', 60: 'H' }, hits: ['fPEX', 'fPEX', 'jab', 'jab2', 'jabH'] },
      { name: 'GNOME ARMY', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],


    intro: [[1, 'stand'], [16, 'statue'], [50, 'statue'], [58, 'smug'], [80, 'smug'], [92, 'idle']],
    victory: [[1, 'stand'], [14, 'statue'], [40, 'statue'], [50, 'laugh'], [70, 'smug'], [110, 'smug']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { point: [[1, 'idle'], [8, 'point'], [30, 'point'], [40, 'idle']] },
    bigHit: { gesture: 'point' },
    talk: {
      lines: ["You've been gnomed.", "Don't look away.", 'I was here the whole time.'],
      quips: ['Gnomed.', 'Behind you.', 'Surprise.', 'Peekaboo.']
    },
    victoryLines: ['Gnomed.', "Should've checked the garden.", 'Small but deadly.']
  });
})();
