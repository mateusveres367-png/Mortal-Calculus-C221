// NICOLAS — Rushdown — "THE LATE PASS". A 10th grader who is always in a hurry, talks
// fast and never stops moving.
//
// Signature: BELL SPRINT. The fastest dash in the game: he can chain one dash straight
// into the next, attack out of it almost at once, and F, F, P is a flying shoulder
// out of the sprint. Tardy Rush is his string (P, P, K, K); Skip Day (P out of a
// sidestep) skips right past your attack; Backpack Toss (B+P) throws his bag.
(function () {
  var R = FG.rigger({ torso: 25, neck: 11, upper: 14.5, fore: 12.5, thigh: 22.5, shin: 23 });
  // Up on his toes, leaning in, fists loose: ready to go.
  var stance = R({ hip: [2, 43], lean: 14, neck: -2, fa: { hand: [18, 64] }, ba: { hand: [10, 62] }, fl: { foot: [11, 0] }, bl: { foot: [-11, 1] } });
  var stand = R({ hip: [0, 45], lean: 0, fa: [-82, -72], ba: [-96, -82], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    watch: R({ hip: [0, 45], lean: 4, neck: 14, fa: { hand: [12, 70] }, ba: { hand: [14, 68] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    tap_foot: R({ hip: [0, 45], lean: 2, neck: 8, fa: { hand: [6, 56] }, ba: { hand: [-6, 54] }, fl: [-60, -100], bl: { foot: [-6, 0] } }),
    wave: R({ hip: [0, 45], lean: -2, fa: [40, 100], ba: [-96, -82], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    thumb: R({ hip: [0, 45], lean: -4, neck: -6, fa: [10, 80], ba: { hand: [4, 52] }, fl: { foot: [7, 0] }, bl: { foot: [-6, 0] } }),
    hands: R({ hip: [0, 42], lean: 16, neck: 14, fa: { hand: [12, 34] }, ba: { hand: [6, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 20, neck: 16, fa: { hand: [12, 33] }, ba: { hand: [6, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    run1: R({ hip: [4, 42], lean: 26, neck: 4, fa: [-150, -100], ba: [20, 70], fl: [-30, -80], bl: [-130, -60] }),
    run2: R({ hip: [4, 43], lean: 26, neck: 4, fa: [20, 70], ba: [-150, -100], fl: [-120, -60], bl: [-50, -100] }),

    // Movement: light, bouncy, always on his toes.
    crouch: R({ hip: [2, 26], lean: 24, fa: { hand: [18, 46] }, ba: { hand: [10, 44] }, fl: { foot: [13, 0] }, bl: { foot: [-12, 1] } }),
    squat: R({ hip: [2, 32], lean: 20, fa: { hand: [17, 52] }, ba: { hand: [10, 50] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    jump: R({ hip: [0, 44], lean: 18, fa: [-140, -110], ba: [-160, -130], fl: [-10, -90], bl: [-130, -70] }),
    dash: R({ hip: [6, 36], lean: 42, neck: 10, fa: [-160, -120], ba: [-170, -140], fl: { foot: [22, 0] }, bl: { foot: [-20, 8] } }),
    backdash: R({ hip: [-2, 42], lean: 2, fa: { hand: [16, 62] }, ba: { hand: [6, 60] }, fl: { foot: [12, 6] }, bl: { foot: [-15, 0] } }),
    sidestep: R({ hip: [2, 34], lean: 22, neck: 4, fa: { hand: [16, 54] }, ba: { hand: [8, 52] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    block: R({ hip: [-1, 40], lean: 18, neck: 8, fa: { hand: [14, 70] }, ba: { hand: [10, 66] }, fl: { foot: [11, 0] }, bl: { foot: [-14, 0] } }),
    cblock: R({ hip: [-1, 25], lean: 24, fa: { hand: [15, 50] }, ba: { hand: [11, 48] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    hit_high: R({ hip: [-3, 43], lean: -12, neck: -18, fa: [50, -50], ba: [-120, -70], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 38], lean: 34, neck: 12, fa: { hand: [12, 38] }, ba: { hand: [6, 40] }, fl: { foot: [9, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 36], lean: 16, fa: [-30, -10], ba: [-140, -100], fl: [-50, -110], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-4, 42], lean: -12, neck: -8, fa: [60, 110], ba: [80, 130], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -52, neck: -18, fa: [80, 140], ba: [110, 160], fl: [30, -30], bl: [0, -60] }),
    down: R({ hip: [0, 6], lean: -86, fa: [130, 170], ba: [-150, -110], fl: [18, -10], bl: [-4, 8] }),

    // Tardy Rush: P, P, K, K. A flicking jab, a straight, a knee, a flying roundhouse.
    jab_c: R({ hip: [3, 43], lean: 16, fa: { hand: [20, 66] }, ba: { hand: [10, 62] }, fl: { foot: [12, 0] }, bl: { foot: [-11, 1] } }),
    jab_x: R({ hip: [7, 43], lean: 20, fa: [4, 2], ba: { hand: [12, 64] }, fl: { foot: [16, 0] }, bl: { foot: [-10, 1] } }),
    cross_c: R({ hip: [4, 42], lean: 14, fa: { hand: [18, 66] }, ba: [-130, 40], fl: { foot: [13, 0] }, bl: { foot: [-11, 0] } }),
    cross_x: R({ hip: [10, 41], lean: 24, fa: { hand: [12, 62] }, ba: [8, 0], fl: { foot: [19, 0] }, bl: { foot: [-8, 2] } }),
    knee_c: R({ hip: [4, 43], lean: 8, fa: { hand: [22, 68] }, ba: { hand: [18, 66] }, fl: { foot: [12, 0] }, bl: [-10, -90] }),
    knee_x: R({ hip: [8, 46], lean: -10, fa: { hand: [26, 66] }, ba: { hand: [22, 64] }, fl: { foot: [10, 0] }, bl: [50, -50] }),
    rh_c: R({ hip: [2, 44], lean: -10, fa: [100, 140], ba: [-160, -120], fl: { foot: [10, 0] }, bl: [-60, -120] }),
    rh_x: R({ hip: [4, 50], lean: -26, fa: [120, 160], ba: [-170, -150], fl: [-60, -100], bl: [16, 10] }),
    // Shortcut: a quick teep.
    kick_c: R({ hip: [-1, 44], lean: -2, fa: { hand: [14, 62] }, ba: { hand: [6, 60] }, fl: [30, -50], bl: { foot: [-12, 0] } }),
    kick_x: R({ hip: [1, 44], lean: -12, fa: { hand: [12, 62] }, ba: [-150, -110], fl: [6, 2], bl: { foot: [-12, 0] } }),
    // Slide In: a baseball slide along the floor.
    slide_c: R({ hip: [0, 24], lean: 4, fa: [-150, -160], ba: [-120, -130], fl: [-30, -100], bl: { foot: [-12, 0] } }),
    slide_x: R({ hip: [4, 12], lean: -50, fa: [-160, -170], ba: [140, 170], fl: { foot: [44, 3] }, bl: [-20, -50] }),
    // Trip Hazard: a sweeping hook of the ankle.
    sweep_c: R({ hip: [-1, 22], lean: 26, fa: { hand: [18, 30] }, ba: { hand: [8, 34] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [1, 18], lean: 14, fa: { hand: [14, 8] }, ba: [-160, -175], fl: { foot: [5, 0] }, bl: { foot: [48, 3] } }),
    // Speed Bump: a lunging straight right, both feet off the floor for a moment.
    hv_c: R({ hip: [-2, 42], lean: -4, fa: { hand: [16, 66] }, ba: [-150, -20], fl: { foot: [10, 0] }, bl: { foot: [-15, 0] } }),
    hv_x: R({ hip: [14, 40], lean: 30, fa: [-120, -160], ba: [6, 2], fl: { foot: [26, 2] }, bl: { foot: [-8, 6] } }),
    hv_r: R({ hip: [10, 40], lean: 22, fa: { hand: [18, 58] }, ba: { hand: [24, 60] }, fl: { foot: [20, 0] }, bl: { foot: [-10, 0] } }),
    // Hall Pass: a leaping uppercut, like waving the pass overhead.
    up_c: R({ hip: [2, 24], lean: 30, fa: { hand: [10, 22] }, ba: { hand: [6, 34] }, fl: { foot: [13, 0] }, bl: { foot: [-12, 0] } }),
    up_x: R({ hip: [4, 50], lean: -8, neck: -12, fa: [84, 96], ba: [-120, -80], fl: [-40, -110], bl: { foot: [-10, 6] } }),
    up_r: R({ hip: [2, 44], lean: 4, fa: [74, 104], ba: { hand: [8, 58] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    // Bell Sprint: the flying shoulder out of the dash.
    shoulder_c: R({ hip: [6, 38], lean: 40, neck: 10, fa: [-160, -120], ba: [-170, -140], fl: { foot: [20, 0] }, bl: { foot: [-18, 6] } }),
    shoulder_x: R({ hip: [12, 40], lean: 20, neck: -6, fa: { hand: [14, 52] }, ba: [-160, -110], fl: [-30, -100], bl: [-140, -80] }),
    // Skip Day: a spinning backfist out of the sidestep.
    skip_c: R({ hip: [0, 38], lean: 4, fa: [-160, -120], ba: { hand: [6, 60] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    skip_x: R({ hip: [6, 40], lean: 14, fa: [12, 14], ba: { hand: [-4, 58] }, fl: { foot: [16, 0] }, bl: { foot: [-10, 0] } }),
    // Backpack Toss: slings the bag off his shoulder.
    toss_c: R({ hip: [-2, 42], lean: -10, fa: [-170, 160], ba: { hand: [6, 60] }, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }),
    toss_x: R({ hip: [6, 41], lean: 18, fa: [10, 20], ba: { hand: [4, 56] }, fl: { foot: [16, 0] }, bl: { foot: [-10, 1] } }),

    air_p: R({ hip: [0, 44], lean: 16, fa: [0, -6], ba: [-150, -110], fl: [-10, -90], bl: [-130, -70] }),
    air_k: R({ hip: [0, 44], lean: -14, fa: [100, 150], ba: [-150, -120], fl: [20, 10], bl: [-110, -60] }),
    air_hc: R({ hip: [0, 46], lean: -8, fa: [110, 160], ba: [-160, -120], fl: [-20, -100], bl: [-120, -60] }),
    air_hx: R({ hip: [0, 44], lean: 24, fa: [-20, -60], ba: [-160, -120], fl: [-60, -110], bl: [10, -30] }),

    // Locker Slam: grab, spin and slam them into a locker that isn't there. Wrong Room: shoves them past.
    grab_c: R({ hip: [3, 43], lean: 16, fa: { hand: [22, 66] }, ba: { hand: [18, 64] }, fl: { foot: [12, 0] }, bl: { foot: [-11, 0] } }),
    grab_x: R({ hip: [5, 43], lean: 20, fa: { hand: [28, 64] }, ba: { hand: [26, 62] }, fl: { foot: [14, 0] }, bl: { foot: [-11, 0] } }),
    throw_lift: R({ hip: [2, 44], lean: -4, fa: [70, 100], ba: [60, 95], fl: { foot: [10, 0] }, bl: [-60, -110] }),
    throw_slam: R({ hip: [10, 36], lean: 34, fa: { hand: [34, 46] }, ba: { hand: [30, 48] }, fl: { foot: [22, 0] }, bl: { foot: [-10, 0] } }),
    throw_back: R({ hip: [-2, 42], lean: -18, fa: [160, 175], ba: [150, 170], fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -60, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [40, 6] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [4, 44], lean: 10, fa: [70, 100], ba: [-150, -110], fl: { foot: [14, 0] }, bl: { foot: [-12, 4] } })
  };
  poses.taunt = poses.watch;

  FG.defineFighter({
    id: 'nicolas', order: 11, student: true,
    homeStage: 'hallway',
    glyphs: ['LATE', 'TARDY', '5:00', 'GO GO GO'],
    stringH: 'DETENTION',
    cutIn: { a: 0xc8282e, b: 0xffd23f }, // red tee, a gold hall pass
    finisher: { name: 'TARDY', input: 'F, F, F, K' },
    ultimate: { name: 'FIVE-MINUTE PASSING PERIOD', text: 'a 5:00 timer counts down at hyperspeed while he blitzes them from one end of the stage to the other before it hits 0:00', from: 'heavy', len: 280,
      hits: [40, 58, 72, 86, 98, 110, 120, 130, 138, 146, 154, 162, 170, 236], weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7], end: { gap: 90, launch: 4, height: 30 } },
    name: 'NICOLAS', nickname: 'THE LATE PASS', archetype: 'RUSHDOWN', theme: 'PASSING PERIOD',
    style: 'HALLWAY SPRINTER', signatureMechanic: 'BELL SPRINT',
    signatureText: 'the fastest dash in the game: forward, forward again during a dash chains another one, he can attack out of it almost at once, and F, F, P is Bell Sprint, a flying shoulder. Tardy Rush (P, P, K, K) is his string; Skip Day (P out of a sidestep) slips past your attack; Backpack Toss (B+P) throws his bag',
    bio: 'ALWAYS IN A HURRY. TALKS FAST. NEVER STOPS MOVING.',
    signature: ['BELL SPRINT', 'TARDY RUSH', 'HALL PASS', 'SKIP DAY', 'BACKPACK TOSS'],
    scale: 0.92, health: 166,
    walkF: 2.7, walkB: 1.7, dashSpeed: 12.5, dashFrames: 12, dashAttackFrom: 3, dashChainFrom: 7, backdashSpeed: 9.4,
    jumpVy: 9.7, weight: 0.94, react: 1.05,
    ssAttackFrom: 6,
    walk: { lean: 4, bob: 1.8, rate: 0.36 },
    look: {
      skin: 0xc9946a,
      hair: { style: 'fringe', color: 0x1e1712 },
      mouth: 'half', brows: 'normal',
      top: { style: 'tee', color: 0xc8282e, sleeves: 'short' },
      legs: 0x2a3248, shoes: 0xd8d8d8,
      build: { torso: 0.9, limb: 0.93 }
    },
    idleAnim: { breath: 0.6, bob: 2.4, sway: 0.6, rate: 0.26 }, // bouncing on his toes
    poses: poses,
    // How the CPU plays him: never stops coming.
    ai: { spacing: 38, pokes: ['K', 'D+K', 'H'], close: ['P', 'P>P>K>K', 'P+K', 'D+K', 'P>P>K'], far: ['B+P'], zone: 0.18, aggro: 1.25, dashIn: 0.75, sidestep: 1.6, ssFollow: 'P' },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'LATE START', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 28, y: 60, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 20, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Straight', label: 'RUNNING LATE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 9, active: 2, recovery: 15, damage: 9,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 34, y: 54, h: 38 }, push: 5, juggle: 3.4,
        cancels: [{ btn: 'k', into: 'rush3', from: 9, to: 20, onContact: true }],
        anim: [[1, 'jab_x'], [5, 'cross_c'], [9, 'cross_x'], [12, 'cross_x'], [25, 'idle']]
      },
      rush3: {
        name: 'Knee', label: 'TARDY RUSH', cmd: 'P,P,K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 9, active: 3, recovery: 18, damage: 11,
        block: -6, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 14, w: 32, y: 36, h: 28 }, push: 7, juggle: 3.6, shake: 0.002,
        cancels: [{ btn: 'k', into: 'rush4', from: 9, to: 20, onContact: true }],
        anim: [[1, 'cross_x'], [5, 'knee_c'], [9, 'knee_x'], [12, 'knee_x'], [27, 'idle']]
      },
      rush4: {
        name: 'Flying Roundhouse', label: 'LATE BELL', cmd: 'P,P,K,K', level: 'mid', strength: 'heavy', motion: 'roundhouse',
        startup: 10, active: 3, recovery: 22, damage: 16,
        block: -12, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 18, w: 34, y: 50, h: 28 }, push: 18, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'knee_x'], [6, 'rh_c'], [10, 'rh_x'], [13, 'rh_x'], [24, 'rh_c'], [34, 'idle']]
      },
      mid: {
        name: 'Teep', label: 'SHORTCUT', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 12, active: 3, recovery: 17, damage: 12,
        block: -4, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 22, w: 28, y: 32, h: 22 }, push: 12, juggle: 3.6, shake: 0.002,
        anim: [[1, 'idle'], [8, 'kick_c'], [12, 'kick_x'], [15, 'kick_x'], [24, 'kick_c'], [32, 'idle']]
      },
      low: {
        name: 'Slide', label: 'SLIDE IN', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'sweep', crouching: true, otg: true,
        startup: 15, active: 4, recovery: 20, damage: 11,
        block: -12, hit: { adv: 1 }, ch: { adv: 6 },
        hitbox: { x: 22, w: 30, y: 0, h: 14 }, push: 10, juggle: 2.5, shake: 0.003,
        step: [6, 16, 3],
        anim: [[1, 'crouch'], [8, 'slide_c'], [15, 'slide_x'], [19, 'slide_x'], [30, 'slide_c'], [38, 'crouch']]
      },
      sweep: FG.kit.sweep('TRIP HAZARD', { startup: 19, damage: 14, motion: 'sweep' }),
      heavy: {
        ex: { text: 'ARMORED, LAUNCHES', armor: { hits: 1 }, hit: { launch: true } },
        name: 'Lunging Straight', label: 'SPEED BUMP', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight',
        startup: 17, active: 3, recovery: 19, damage: 19,
        block: -4, hit: { adv: 5 }, ch: { launch: 5.6 },
        hitbox: { x: 22, w: 28, y: 52, h: 22 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.005,
        step: [8, 17, 2.6],
        anim: [[1, 'idle'], [10, 'hv_c'], [17, 'hv_x'], [20, 'hv_x'], [28, 'hv_r'], [37, 'idle']]
      },
      launcher: {
        name: 'Leaping Uppercut', label: 'HALL PASS', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 14, active: 4, recovery: 22, damage: 15,
        block: -14, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 30, y: 28, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 14, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 16, to: 27, onHit: true }],
        anim: [[1, 'crouch'], [8, 'up_c'], [14, 'up_x'], [18, 'up_x'], [27, 'up_r'], [39, 'idle']]
      },
      // Bell Sprint: forward, forward and P: a flying shoulder out of the sprint.
      dashP: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true },
        name: 'Dash Attack', label: 'BELL SPRINT', cmd: 'F,F,P', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 11, active: 4, recovery: 20, damage: 16,
        block: -8, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 10, w: 30, y: 40, h: 34 }, push: 18, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [1, 12, 4.2],
        anim: [[1, 'shoulder_c'], [11, 'shoulder_x'], [15, 'shoulder_x'], [26, 'hv_r'], [35, 'idle']]
      },
      // Skip Day: out of a sidestep, a spinning backfist that slips past your attack.
      ssP: {
        name: 'Sidestep Backfist', label: 'SKIP DAY', cmd: 'SIDESTEP, P', level: 'mid', strength: 'medium', motion: 'hook', keepZ: true,
        startup: 12, active: 3, recovery: 17, damage: 14,
        block: -4, hit: { adv: 6 }, ch: { knockdown: true },
        hitbox: { x: 16, w: 30, y: 52, h: 24 }, push: 12, juggle: 3.5, shake: 0.004,
        step: [4, 12, 1.6],
        anim: [[1, 'sidestep'], [7, 'skip_c'], [12, 'skip_x'], [15, 'skip_x'], [29, 'idle']]
      },
      // Backpack Toss: straight and fast.
      bP: {
        ex: { text: 'FASTER, KNOCKDOWN', projectile: { vx: 8.5 }, hit: { knockdown: true } },
        name: 'Projectile', label: 'BACKPACK TOSS', cmd: 'B+P', level: 'mid', strength: 'medium', motion: 'cross',
        startup: 15, active: 1, recovery: 21, damage: 12,
        block: -5, hit: { adv: 3 }, ch: { adv: 7 },
        projectile: { kind: 'backpack', x: 24, y: 50, vx: 6.4, vy: 0.9, g: 0.05, w: 16, h: 16, range: 420, life: 120 },
        push: 10, shake: 0.003,
        anim: [[1, 'idle'], [8, 'toss_c'], [15, 'toss_x'], [22, 'toss_x'], [36, 'idle']]
      }
    },
    FG.kit.air(['HALLWAY HOP', 'DOOR KICK', 'SLAM DUNK']),
    FG.kit.throws('LOCKER SLAM', 'WRONG ROOM', { throw: { damage: 30 }, throwB: { damage: 33 } }),
    FG.kit.wake({ wakeLow: { label: 'SNOOZE BUTTON' }, wakeMid: { label: 'FIRST BELL' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'TARDY RUSH', difficulty: 'easy', notation: 'P, P, K, K', plan: { 0: 'P', 12: 'P', 24: 'K', 37: 'K' }, hits: ['jab', 'jab2', 'rush3', 'rush4'] },
      { name: 'RUNNING LATE', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 24: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'HALL PASS', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 52: 'P', 59: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'NEVER STOPS', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K',
        plan: { 0: 'D+H', 16: 'UP', 22: 'P', 28: 'K', 34: 'H', 66: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'SPEED BUMP PLUS', difficulty: 'medium', meter: 1, notation: 'H, P+K, P, P, H', steps: ['H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'H', 3: 'P+K', 45: 'P', 55: 'P', 62: 'H' }, hits: ['heavyEX', 'jab', 'jab2', 'jabH'] },
      { name: 'PASSING PERIOD', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],


    intro: [[1, 'run1'], [6, 'run2'], [12, 'run1'], [18, 'run2'], [26, 'stand'], [40, 'watch'], [64, 'watch'], [74, 'idle']],
    victory: [[1, 'stand'], [12, 'watch'], [40, 'watch'], [50, 'thumb'], [76, 'thumb'], [86, 'wave'], [110, 'wave']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { watch: [[1, 'idle'], [8, 'watch'], [28, 'watch'], [36, 'idle']] },
    bigHit: { gesture: 'watch' },
    talk: {
      lines: ["Can we make this quick? I'm late.", 'Catch me if you can.', 'I already left.'],
      quips: ['Too slow.', 'Gotta go.', 'Bell rang.', 'Late!']
    },
    victoryLines: ['Too slow.', "Gotta go, bell's ringing.", 'Made it on time.']
  });
})();
