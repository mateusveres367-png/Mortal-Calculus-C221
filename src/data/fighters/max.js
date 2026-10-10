// MAX — Power / Grappler — "HEAVY COURSE LOAD". A 10th grader: chill and friendly,
// but strong. He carries a huge backpack and uses it as a weapon.
//
// Signature: COURSE LOAD. F+H is a charge attack (hold H to load it up) with armor
// through its windup: it soaks a hit and keeps coming, and fully loaded it breaks a
// guard. Study Hall (D+K) stomps the floor (a low that also hits them when they're
// down); Bookbag Bomb (B+P) lobs his backpack high, and it bursts where it lands.
(function () {
  // The biggest of the students: long torso, thick limbs.
  var R = FG.rigger({ torso: 27, neck: 10, upper: 15, fore: 13, thigh: 23, shin: 23 });
  // Easygoing: square to you, hands on his backpack straps.
  var stance = R({ hip: [0, 42], lean: 3, neck: -2, fa: { hand: [8, 64] }, ba: { hand: [2, 63] }, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } });
  var stand = R({ hip: [0, 45], lean: -2, fa: { hand: [6, 66] }, ba: { hand: [0, 65] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    wave: R({ hip: [0, 45], lean: -3, fa: [50, 100], ba: { hand: [0, 65] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    yawn: R({ hip: [0, 45], lean: -10, neck: -16, fa: [100, 120], ba: [80, 110], fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    flex: R({ hip: [0, 45], lean: -2, fa: [10, 100], ba: [170, 80], fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    sleep: R({ hip: [0, 10], lean: -84, neck: -10, fa: [150, 175], ba: [120, 160], fl: [10, -10], bl: [-10, 10] }),
    hands: R({ hip: [0, 43], lean: 12, neck: 12, fa: { hand: [12, 36] }, ba: { hand: [6, 34] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    hands2: R({ hip: [0, 42], lean: 16, neck: 14, fa: { hand: [12, 35] }, ba: { hand: [6, 33] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),

    // Movement: heavy, flat-footed.
    crouch: R({ hip: [0, 27], lean: 16, fa: { hand: [12, 50] }, ba: { hand: [4, 48] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    squat: R({ hip: [0, 32], lean: 12, fa: { hand: [12, 54] }, ba: { hand: [4, 52] }, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }),
    jump: R({ hip: [0, 44], lean: 4, fa: [60, 100], ba: [70, 110], fl: [-40, -100], bl: [-110, -70] }),
    dash: R({ hip: [4, 38], lean: 24, neck: 4, fa: { hand: [16, 56] }, ba: { hand: [8, 56] }, fl: { foot: [18, 0] }, bl: { foot: [-16, 4] } }),
    backdash: R({ hip: [-2, 40], lean: -4, fa: { hand: [10, 62] }, ba: { hand: [2, 60] }, fl: { foot: [12, 4] }, bl: { foot: [-15, 0] } }),
    sidestep: R({ hip: [0, 36], lean: 10, fa: { hand: [10, 58] }, ba: { hand: [4, 56] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    // Guard: big forearms crossed in front.
    block: R({ hip: [-1, 41], lean: 8, neck: 6, fa: { hand: [16, 66] }, ba: { hand: [14, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    cblock: R({ hip: [-1, 27], lean: 16, fa: { hand: [16, 48] }, ba: { hand: [14, 44] }, fl: { foot: [13, 0] }, bl: { foot: [-14, 0] } }),
    // Hit reactions: he barely budges.
    hit_high: R({ hip: [-2, 43], lean: -8, neck: -14, fa: { hand: [12, 60] }, ba: [-120, -80], fl: { foot: [13, 0] }, bl: { foot: [-15, 0] } }),
    hit_mid: R({ hip: [-3, 40], lean: 24, neck: 10, fa: { hand: [12, 40] }, ba: { hand: [6, 42] }, fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-1, 38], lean: 10, fa: { hand: [10, 56] }, ba: { hand: [2, 54] }, fl: [-60, -100], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-3, 43], lean: -10, neck: -8, fa: [40, 90], ba: [60, 110], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -46, neck: -14, fa: [70, 120], ba: [100, 150], fl: [30, -30], bl: [0, -60] }),
    down: R({ hip: [0, 7], lean: -84, fa: [120, 165], ba: [-150, -115], fl: [16, -12], bl: [-6, 8] }),

    // Syllabus and Prereq: a heavy jab and a looping hook.
    jab_c: R({ hip: [1, 42], lean: 6, fa: { hand: [16, 64] }, ba: { hand: [2, 63] }, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }),
    jab_x: R({ hip: [5, 42], lean: 12, fa: [2, 0], ba: { hand: [4, 63] }, fl: { foot: [17, 0] }, bl: { foot: [-12, 0] } }),
    hook_c: R({ hip: [-1, 42], lean: -4, fa: { hand: [12, 62] }, ba: [-160, 70], fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    hook_x: R({ hip: [6, 41], lean: 16, fa: { hand: [10, 58] }, ba: [20, -20], fl: { foot: [17, 0] }, bl: { foot: [-11, 1] } }),
    // Doorstop: a big flat-footed push kick.
    kick_c: R({ hip: [-2, 44], lean: -6, fa: { hand: [12, 62] }, ba: { hand: [4, 60] }, fl: [40, -40], bl: { foot: [-13, 0] } }),
    kick_x: R({ hip: [0, 44], lean: -14, fa: { hand: [10, 62] }, ba: { hand: [2, 60] }, fl: [4, 0], bl: { foot: [-13, 0] } }),
    // Study Hall: knee up high, then a stomp that shakes the floor.
    stomp_c: R({ hip: [0, 44], lean: -4, fa: [30, 70], ba: [20, 60], fl: [70, -60], bl: { foot: [-12, 0] } }),
    stomp_x: R({ hip: [4, 36], lean: 18, fa: [-40, -80], ba: [-50, -90], fl: { foot: [22, 0] }, bl: { foot: [-12, 0] } }),
    // Drop Class: a sweeping low heel.
    sweep_c: R({ hip: [-2, 24], lean: 22, fa: { hand: [16, 30] }, ba: { hand: [6, 34] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 20], lean: 12, fa: { hand: [12, 10] }, ba: [-160, -170], fl: { foot: [4, 0] }, bl: { foot: [46, 4] } }),
    // Textbook Swing: both hands wound way back, then a huge swing across.
    hv_c: R({ hip: [-3, 42], lean: -12, neck: -4, fa: [170, 140], ba: [175, 150], fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }),
    hv_x: R({ hip: [8, 38], lean: 26, fa: [10, 4], ba: [16, 8], fl: { foot: [20, 0] }, bl: { foot: [-10, 2] } }),
    hv_r: R({ hip: [6, 40], lean: 20, fa: [-30, -60], ba: [-20, -50], fl: { foot: [17, 0] }, bl: { foot: [-11, 0] } }),
    // Course Load: shoulder down, loading up, then a charging body blow.
    load_c: R({ hip: [-4, 36], lean: 30, neck: 10, fa: [-150, -110], ba: { hand: [-10, 48] }, fl: { foot: [12, 0] }, bl: { foot: [-18, 0] } }),
    load_x: R({ hip: [14, 38], lean: 40, neck: 14, fa: { hand: [34, 54] }, ba: { hand: [28, 46] }, fl: { foot: [26, 0] }, bl: { foot: [-8, 4] } }),
    // AP Lift: from a deadlift squat, both arms straight up.
    up_c: R({ hip: [0, 22], lean: 30, fa: { hand: [12, 16] }, ba: { hand: [6, 16] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    up_x: R({ hip: [2, 46], lean: -6, neck: -12, fa: [86, 92], ba: [80, 94], fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    up_r: R({ hip: [1, 43], lean: 2, fa: [60, 100], ba: [50, 90], fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }),
    // Bookbag Bomb: the backpack swung off his shoulder and lobbed up high.
    toss_c: R({ hip: [-2, 38], lean: -14, fa: [-160, -170], ba: [-150, -160], fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    toss_x: R({ hip: [3, 44], lean: -8, fa: [70, 80], ba: [60, 70], fl: { foot: [14, 0] }, bl: { foot: [-12, 2] } }),

    air_p: R({ hip: [0, 44], lean: 10, fa: [-20, -40], ba: [60, 100], fl: [-30, -100], bl: [-110, -70] }),
    air_k: R({ hip: [0, 44], lean: -10, fa: [100, 140], ba: [80, 120], fl: [-10, -60], bl: [-100, -60] }),
    air_hc: R({ hip: [0, 46], lean: -14, fa: [110, 150], ba: [120, 160], fl: [-30, -100], bl: [-110, -70] }),
    air_hx: R({ hip: [0, 42], lean: 30, fa: [-30, -80], ba: [-20, -70], fl: [-20, -90], bl: [-100, -60] }),

    // Backpack Slam: lifts them clean overhead, slams them down. Group Project: tosses them behind.
    grab_c: R({ hip: [1, 42], lean: 10, fa: { hand: [20, 62] }, ba: { hand: [16, 60] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [3, 42], lean: 14, fa: { hand: [26, 60] }, ba: { hand: [24, 58] }, fl: { foot: [15, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [0, 44], lean: -6, fa: [88, 92], ba: [84, 96], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 30], lean: 46, fa: { hand: [34, 12] }, ba: { hand: [30, 14] }, fl: { foot: [22, 0] }, bl: { foot: [-14, 0] } }),
    throw_back: R({ hip: [-4, 38], lean: -30, fa: [160, 175], ba: [150, 170], fl: { foot: [8, 0] }, bl: { foot: [-16, 0] } }),
    suplex: R({ hip: [-6, 30], lean: -70, neck: -20, fa: [170, 180], ba: [165, 180], fl: { foot: [10, 0] }, bl: { foot: [-6, 0] } }),
    // The body slam off the top of the textbook pile: flat out, arms and legs spread.
    splash: R({ hip: [0, 22], lean: 86, neck: 6, fa: [20, 10], ba: [-20, -30], fl: [-160, -175], bl: [-150, -165] }),
    climb: R({ hip: [0, 40], lean: 20, fa: [70, 60], ba: [40, 20], fl: [-20, -110], bl: { foot: [-12, 0] } }),
    wake_low: R({ hip: [-2, 9], lean: -58, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [40, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 42], lean: 14, fa: [60, 90], ba: [50, 85], fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } })
  };
  poses.taunt = poses.flex;

  FG.defineFighter({
    id: 'max', order: 12, student: true,
    homeStage: 'quad',
    glyphs: ['A+', 'AP', 'FINALS', 'HW'],
    stringH: 'CLOSED BOOK',
    cutIn: { a: 0x2b3a5a, b: 0xffa83a }, // his navy backpack, highlighter orange
    finisher: { name: 'ALL-NIGHTER', input: 'D, D, H' },
    ultimate: { name: 'FINALS WEEK', text: 'a mountain of textbooks rains down on them, then he body-slams them on top of the pile', from: 'heavy', len: 290,
      hits: [70, 86, 100, 112, 122, 132, 140, 236], weights: [1, 1, 1, 1, 1, 1, 1, 6], end: { gap: 60, down: true } },
    name: 'MAX', nickname: 'HEAVY COURSE LOAD', archetype: 'POWER', theme: 'HEAVY COURSE LOAD',
    style: 'BACKPACK BRAWLER', signatureMechanic: 'COURSE LOAD',
    signatureText: 'F+H is a charge attack (hold H to load it up) with armor through its windup: it soaks a hit and keeps coming, and fully loaded it breaks a guard. Study Hall (D+K) stomps the floor, a low that also hits them when they are down; Bookbag Bomb (B+P) lobs his backpack high and it bursts where it lands',
    bio: 'CHILL AND FRIENDLY, BUT STRONG. HIS BACKPACK IS A WEAPON.',
    signature: ['COURSE LOAD', 'TEXTBOOK SWING', 'AP LIFT', 'STUDY HALL', 'BOOKBAG BOMB'],
    scale: 0.95, health: 214,
    walkF: 2.0, walkB: 1.5, dashSpeed: 7.6, dashFrames: 17, backdashSpeed: 7, backdashFrames: 24,
    jumpVy: 8.8, weight: 1.06, react: 0.8,
    walk: { lean: 1, bob: 1.4, rate: 0.17 },
    look: {
      skin: 0xe0b090,
      hair: { style: 'wavyShort', color: 0x6a4527 },
      mouth: 'bigsmile', brows: 'normal',
      top: { style: 'tee', color: 0x18181c, sleeves: 'short' },
      legs: 0x4a5266, shoes: 0x3a3a3a,
      backpack: { color: 0x2b3a5a, zip: 0xd8d8d8 },
      build: { torso: 1.06, limb: 1.05 }
    },
    idleAnim: { breath: 1.3, bob: 0.4, sway: 0.4, rate: 0.07 }, // slow and easy
    poses: poses,
    // How the CPU plays him: walks you down, loads up Course Load, lobs the bag.
    ai: { spacing: 48, pokes: ['K', 'D+K', 'H', 'F+H'], close: ['P', 'P+K', 'P+K', 'H', 'D+K', 'P>P>H', 'F+H'], far: ['B+P'], zone: 0.3, aggro: 1.05 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'SYLLABUS', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 11, active: 2, recovery: 14, damage: 10,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 26, y: 58, h: 18 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 11, to: 22, onContact: true }],
        anim: [[1, 'idle'], [8, 'jab_c'], [11, 'jab_x'], [14, 'jab_x'], [26, 'idle']]
      },
      jab2: {
        name: 'Hook', label: 'PREREQ', cmd: 'P,P', level: 'high', strength: 'medium', motion: 'hook',
        startup: 11, active: 3, recovery: 17, damage: 12,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 32, y: 54, h: 36 }, push: 6, juggle: 3.4, shake: 0.003,
        anim: [[1, 'jab_x'], [7, 'hook_c'], [11, 'hook_x'], [14, 'hook_x'], [30, 'idle']]
      },
      mid: {
        name: 'Push Kick', label: 'DOORSTOP', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 14, active: 3, recovery: 19, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 24, w: 28, y: 32, h: 22 }, push: 16, juggle: 3.6, shake: 0.004,
        anim: [[1, 'idle'], [9, 'kick_c'], [14, 'kick_x'], [17, 'kick_x'], [26, 'kick_c'], [36, 'idle']]
      },
      // Study Hall: a stomp that shakes the floor. A low that also catches them on the ground.
      low: {
        name: 'Stomp', label: 'STUDY HALL', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', crouching: false, tracks: true, otg: true,
        startup: 18, active: 4, recovery: 20, damage: 14,
        block: -11, hit: { adv: 2 }, ch: { knockdown: true },
        hitbox: { x: 8, w: 44, y: 0, h: 12 }, push: 10, juggle: 2.5, shake: 0.008,
        anim: [[1, 'idle'], [10, 'stomp_c'], [18, 'stomp_x'], [22, 'stomp_x'], [32, 'stomp_c'], [42, 'idle']]
      },
      sweep: FG.kit.sweep('DROP CLASS', { startup: 21, damage: 18, motion: 'sweep' }),
      // Textbook Swing: everything he's got, across.
      heavy: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true },
        name: 'Big Swing', label: 'TEXTBOOK SWING', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'roundhouse', wallSplat: true,
        startup: 19, active: 4, recovery: 22, damage: 25,
        block: -6, hit: { adv: 4 }, ch: { launch: 5.8 },
        hitbox: { x: 14, w: 34, y: 40, h: 34 }, push: 26, juggle: 3.4, carry: 2.2, shake: 0.008,
        step: [10, 19, 1.2],
        anim: [[1, 'idle'], [12, 'hv_c'], [19, 'hv_x'], [23, 'hv_x'], [32, 'hv_r'], [44, 'idle']]
      },
      // Course Load: hold H to load it up. Armor through the windup.
      fH: {
        name: 'Charge', label: 'COURSE LOAD', cmd: 'F+H (HOLD)', level: 'mid', strength: 'heavy', motion: 'lunge',
        startup: 22, active: 4, recovery: 22, damage: 23, armor: { from: 6, to: 21, hits: 1 },
        block: -8, hit: { adv: 3 }, ch: { knockdown: true },
        charge: { at: 12, btn: 'h', mid: 16, max: 40, damage: [1, 1.4, 1.9] },
        hitbox: { x: 20, w: 30, y: 36, h: 40 }, push: 26, juggle: 3.6, carry: 2.2, shake: 0.009,
        step: [14, 22, 3],
        anim: [[1, 'idle'], [10, 'load_c'], [22, 'load_x'], [26, 'load_x'], [36, 'hv_r'], [48, 'idle']]
      },
      // AP Lift: a two-handed uppercut from a squat.
      launcher: {
        ex: { text: 'ARMORED, HIGHER', armor: { hits: 1 }, hit: { launch: 8.4 } },
        name: 'Lift', label: 'AP LIFT', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 17, active: 4, recovery: 23, damage: 19,
        block: -16, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 8, w: 38, y: 26, h: 82 }, push: 6, juggle: 5.5, carry: 0.5, shake: 0.009,
        step: [10, 17, 1],
        cancels: [{ btn: 'up', into: 'jump', from: 19, to: 30, onHit: true }],
        anim: [[1, 'crouch'], [10, 'up_c'], [17, 'up_x'], [21, 'up_x'], [30, 'up_r'], [44, 'idle']]
      },
      // Bookbag Bomb: lobbed high; it bursts where it lands.
      bP: {
        ex: { text: 'A BIGGER BLAST', projectile: { burst: { w: 80, h: 44, frames: 12 } } },
        name: 'Projectile', label: 'BOOKBAG BOMB', cmd: 'B+P', level: 'mid', strength: 'heavy', motion: 'launcher',
        startup: 18, active: 1, recovery: 22, damage: 16,
        block: -4, hit: { knockdown: true }, ch: { knockdown: true },
        projectile: { kind: 'bomb', x: 22, y: 60, vx: 3.4, vy: 6.2, g: 0.3, w: 18, h: 18, range: 400, life: 160, ground: 'burst', burst: { w: 56, h: 34, frames: 10 } },
        push: 12, shake: 0.006,
        anim: [[1, 'idle'], [9, 'toss_c'], [18, 'toss_x'], [26, 'toss_x'], [40, 'idle']]
      }
    },
    FG.kit.air(['NOTEBOOK DROP', 'LOCKER KICK', 'DOG PILE'], { slow: 1 }),
    FG.kit.throws('BACKPACK SLAM', 'GROUP PROJECT', { throw: { damage: 38, shake: 0.012 }, throwB: { damage: 36 } }),
    FG.kit.wake({ wakeLow: { label: 'FIVE MORE MINUTES' }, wakeMid: { label: 'ALARM CLOCK' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'REQUIRED READING', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 13: 'P', 26: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'OPEN BOOK', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 13: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'AP LIFT', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 54: 'P', 63: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'CRAM SESSION', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K',
        plan: { 0: 'D+H', 20: 'UP', 25: 'P', 32: 'K', 38: 'H', 71: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      { name: 'DOUBLE MAJOR', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 49: 'P', 59: 'P', 68: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'FINALS WEEK', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'wave'], [40, 'wave'], [50, 'stand'], [62, 'yawn'], [84, 'yawn'], [96, 'idle']],
    victory: [[1, 'stand'], [14, 'flex'], [46, 'flex'], [56, 'yawn'], [80, 'yawn'], [90, 'wave'], [110, 'wave']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { yawn: [[1, 'idle'], [10, 'yawn'], [34, 'yawn'], [44, 'idle']] },
    bigHit: { gesture: 'yawn' },
    talk: {
      lines: ['Hope you did the reading.', 'This backpack weighs more than you.', "Let's get this over with."],
      quips: ['Heavy.', 'Read the chapter.', 'Easy A.', 'Oops.']
    },
    victoryLines: ['Heavy course load.', "Should've studied.", 'Nap time.']
  });
})();
