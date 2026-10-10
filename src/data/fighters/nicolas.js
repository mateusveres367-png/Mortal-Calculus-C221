// NICOLAS — Rushdown — "THE LATE PASS". A 10th grader who is always in a hurry, and a
// Taekwondo fighter: flashy, fast and aggressive, all jumping and spinning kicks. He
// barely punches (a jab and a cross). Nothing like CHAI, precise and defensive: he
// comes at you.
//
// Signature: KICK CHAIN. Any kick that hits cancels into a different kick, up to five
// in a row (def.kickChain: { max, onHit }). The Snap Kick (K) chains into itself: head,
// body, head. Double Roundhouse (B+K) is two kicks off one leg without touching down;
// Back Kick (F+K) knocks them across the screen; Axe Kick (F+H) drops the heel on their
// head; Tornado Kick (D+H) launches; the 540 Kick (B+H) is slow and huge; out of a dash,
// K is a Hopping Side Kick that covers the whole screen. He still has the fastest dash.
(function () {
  var R = FG.rigger({ torso: 25, neck: 11, upper: 14.5, fore: 12.5, thigh: 22.5, shin: 23 });
  // Bladed, side-on and upright, up on his toes: lead hand low, rear hand by his chin,
  // the long lead leg ready to flick.
  var stance = R({ hip: [0, 45], lean: 2, neck: -2, fa: { hand: [15, 58] }, ba: { hand: [5, 66] }, fl: { foot: [15, 0] }, bl: { foot: [-12, 0] } });
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

    // Hands: a quick jab and a cross, Taekwondo style (he barely punches).
    jab_c: R({ hip: [1, 45], lean: 4, fa: { hand: [18, 62] }, ba: { hand: [6, 66] }, fl: { foot: [15, 0] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [4, 45], lean: 8, fa: [6, 2], ba: { hand: [6, 66] }, fl: { foot: [18, 0] }, bl: { foot: [-11, 0] } }),
    cross_c: R({ hip: [2, 45], lean: 4, fa: { hand: [16, 60] }, ba: { hand: [2, 64] }, fl: { foot: [16, 0] }, bl: { foot: [-11, 0] } }),
    cross_x: R({ hip: [8, 44], lean: 16, fa: { hand: [10, 58] }, ba: [6, 0], fl: { foot: [19, 0] }, bl: { foot: [-7, 2] } }),
    // Snap Kick: the lead knee chambers, the foot snaps out (head, then body, then head).
    snap_c: R({ hip: [-2, 46], lean: -8, fa: [-60, -40], ba: { hand: [4, 66] }, fl: [62, -70], bl: { foot: [-12, 0] } }),
    snap_x: R({ hip: [-3, 46], lean: -26, neck: 6, fa: [-60, -30], ba: { hand: [2, 68] }, fl: [42, 30], bl: { foot: [-12, 0] } }),
    snap2_x: R({ hip: [-2, 46], lean: -18, neck: 4, fa: [-70, -40], ba: { hand: [2, 66] }, fl: [12, 4], bl: { foot: [-12, 0] } }),
    // Double Roundhouse: one leg, twice, without touching the floor (body, then head).
    dbl_c: R({ hip: [-1, 47], lean: -10, fa: [-50, -20], ba: { hand: [4, 66] }, fl: [70, -40], bl: { foot: [-11, 0] } }),
    dbl_x1: R({ hip: [-2, 47], lean: -24, fa: [-60, -30], ba: { hand: [2, 66] }, fl: [24, 14], bl: { foot: [-11, 0] } }),
    dbl_x2: R({ hip: [-3, 48], lean: -30, neck: 8, fa: [-70, -40], ba: { hand: [0, 68] }, fl: [48, 40], bl: { foot: [-11, 0] } }),
    // Back Kick: a quick turn (back to them), then the rear foot drives straight back into
    // the stomach.
    back_c: R({ hip: [-2, 44], lean: 10, neck: 24, fa: { hand: [-6, 62] }, ba: { hand: [6, 64] }, fl: { foot: [6, 0] }, bl: [70, -110] }),
    back_x: R({ hip: [0, 45], lean: -40, neck: 30, fa: [-170, -140], ba: [150, 175], fl: { foot: [-2, 0] }, bl: [6, -2] }),
    back_r: R({ hip: [2, 44], lean: -8, fa: { hand: [12, 60] }, ba: { hand: [4, 64] }, fl: { foot: [8, 0] }, bl: [-60, -110] }),
    // Axe Kick: the leg swings straight up, then the heel comes down on the head.
    axe_c: R({ hip: [-2, 47], lean: -16, neck: -8, fa: [40, 20], ba: [160, 150], fl: [96, 92], bl: { foot: [-12, 0] } }),
    axe_x: R({ hip: [4, 44], lean: 16, neck: 6, fa: [-40, -20], ba: [-160, -150], fl: [-18, -34], bl: { foot: [-12, 0] } }),
    axe_r: R({ hip: [3, 44], lean: 8, fa: { hand: [14, 58] }, ba: { hand: [4, 64] }, fl: { foot: [20, 0] }, bl: { foot: [-11, 0] } }),
    // Tornado Kick: a crouch and a spin, then up off the floor, the rear leg sweeping up.
    tor_c: R({ hip: [0, 34], lean: 12, neck: 4, fa: [-170, -150], ba: { hand: [10, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    tor_x: R({ hip: [4, 62], lean: -22, neck: -8, fa: [150, 170], ba: [-170, -160], fl: [-80, -120], bl: [60, 46] }),
    tor_r: R({ hip: [2, 42], lean: 2, fa: { hand: [14, 58] }, ba: { hand: [4, 64] }, fl: { foot: [13, 0] }, bl: { foot: [-12, 0] } }),
    // 540 Kick: a big jump and a full turn, then the hooking leg whips round at head height.
    k540_c: R({ hip: [-2, 58], lean: 22, neck: 18, fa: [-170, -150], ba: [-140, -110], fl: [-70, -150], bl: [-130, -80] }),
    k540_x: R({ hip: [2, 68], lean: -38, neck: -10, fa: [150, 160], ba: [-170, -170], fl: [52, 42], bl: [-110, -60] }),
    k540_r: R({ hip: [0, 36], lean: 14, fa: { hand: [14, 52] }, ba: { hand: [4, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    // Hopping Side Kick: up off the back foot, the blade of the lead foot out flat.
    side_c: R({ hip: [6, 50], lean: -8, fa: { hand: [14, 60] }, ba: { hand: [4, 66] }, fl: [62, -70], bl: { foot: [-6, 8] } }),
    side_x: R({ hip: [10, 52], lean: -32, neck: 8, fa: [-80, -60], ba: { hand: [0, 68] }, fl: [4, 2], bl: [-120, -80] }),
    // Low Cut Kick: a quick lead-leg kick to the shin, dropping his weight a little.
    lowc_c: R({ hip: [0, 40], lean: 6, fa: { hand: [15, 56] }, ba: { hand: [5, 62] }, fl: [30, -100], bl: { foot: [-12, 0] } }),
    lowc_x: R({ hip: [1, 38], lean: -6, fa: [-60, -40], ba: { hand: [4, 62] }, fl: { foot: [36, 8] }, bl: { foot: [-12, 0] } }),
    // Roundhouse (H): the rear leg, hip turned over, the instep into the ribs.
    rh_c: R({ hip: [0, 45], lean: -6, fa: { hand: [14, 60] }, ba: [-110, -70], fl: { foot: [12, 0] }, bl: [-50, -110] }),
    rh_x: R({ hip: [0, 46], lean: -24, neck: 8, fa: { hand: [10, 62] }, ba: [-150, -130], fl: { foot: [6, 0] }, bl: [20, 12] }),
    rh_r: R({ hip: [1, 45], lean: -10, fa: { hand: [12, 60] }, ba: [-110, -80], fl: { foot: [9, 0] }, bl: [-40, -100] }),
    // Spinning Sweep: down low, a full turn, the rear leg raking the floor.
    sweep_c: R({ hip: [-1, 22], lean: 26, fa: { hand: [18, 30] }, ba: { hand: [8, 34] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [1, 18], lean: 14, fa: { hand: [14, 8] }, ba: [-160, -175], fl: { foot: [5, 0] }, bl: { foot: [48, 3] } }),
    // A Taekwondo bow (the intro), and the bell for the finisher.
    bow: R({ hip: [0, 45], lean: 26, neck: 20, fa: [-100, -96], ba: [-96, -92], fl: { foot: [4, 0] }, bl: { foot: [-4, 0] } }),

    // Air: Flying Side Kick (P), Scissor Kick (K), Butterfly Kick (H, body flat, legs wide).
    air_p: R({ hip: [0, 46], lean: -30, fa: [-80, -60], ba: { hand: [2, 66] }, fl: [4, 2], bl: [-120, -80] }),
    air_k: R({ hip: [0, 46], lean: -10, fa: [130, 150], ba: [-150, -120], fl: [36, 30], bl: [-60, -100] }),
    air_hc: R({ hip: [0, 48], lean: 30, fa: [-170, -160], ba: [-150, -130], fl: [-60, -120], bl: [-120, -70] }),
    air_hx: R({ hip: [0, 48], lean: -66, neck: -10, fa: [150, 170], ba: [-160, -170], fl: [24, 40], bl: [-170, -150] }),

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
    glyphs: ['LATE', 'TARDY', '5:00', 'HYAH'],
    stringH: 'DETENTION',
    cutIn: { a: 0xc8282e, b: 0xffd23f }, // red tee, a gold hall pass
    finisher: { name: 'TARDY', input: 'F, F, F, K' },
    ultimate: { name: 'FIVE-MINUTE PASSING PERIOD', text: 'a 5:00 timer counts down at hyperspeed while he lands a nonstop chain of jumping, spinning and flying kicks across the whole stage before it hits 0:00', from: 'mid', len: 280,
      hits: [40, 58, 72, 86, 98, 110, 120, 130, 138, 146, 154, 162, 170, 236], weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7], end: { gap: 90, launch: 4, height: 30 } },
    name: 'NICOLAS', nickname: 'THE LATE PASS', archetype: 'RUSHDOWN', theme: 'PASSING PERIOD',
    style: 'TAEKWONDO', signatureMechanic: 'KICK CHAIN',
    signatureText: 'any kick that hits cancels into a different kick, up to five in a row. The Snap Kick (K) chains into itself: head, body, head. Double Roundhouse (B+K) is two kicks off one leg; Back Kick (F+K) knocks them across the screen; Axe Kick (F+H) drops the heel on their head; Tornado Kick (D+H) launches; the 540 Kick (B+H) is slow and huge; out of a dash, K is a Hopping Side Kick. He still has the fastest dash in the game',
    bio: 'ALWAYS IN A HURRY. FLASHY, FAST, AND ALL KICKS.',
    signature: ['KICK CHAIN', 'SNAP KICK', 'TORNADO KICK', '540 KICK', 'HOPPING SIDE KICK'],
    kickChain: { max: 5, onHit: true },
    scale: 0.92, health: 194,
    walkF: 2.7, walkB: 1.7, dashSpeed: 12.5, dashFrames: 12, dashAttackFrom: 3, dashChainFrom: 7, backdashSpeed: 9.4,
    jumpVy: 9.8, weight: 0.94, react: 1.05,
    walk: { lean: -2, bob: 2.2, rate: 0.4 }, // light, springy steps
    look: {
      skin: 0xc9946a,
      hair: { style: 'fringe', color: 0x1e1712 },
      mouth: 'half', brows: 'normal',
      top: { style: 'tee', color: 0xc8282e, sleeves: 'short' },
      legs: 0x2a3248, shoes: 0xd8d8d8,
      build: { torso: 0.9, limb: 0.93 }
    },
    // Bouncing on his toes, the lead leg flicking up off the floor.
    idleAnim: { breath: 0.5, bob: 0, sway: 0.4, rate: 0.24, hop: 2.4, leadLift: 8 },
    poses: poses,
    // How the CPU plays him: kicks from everywhere, chains when they land, dashes in.
    ai: { spacing: 50, pokes: ['K', 'K', 'D+K', 'F+K', 'B+K', 'K'], close: ['K>K>K', 'P>P>H', 'K>K>K', 'B+K', 'D+K', 'P+K', 'P', 'K>K>H', 'F+H', 'D+H', 'B+H'], aggro: 1.15, dashIn: 0.65 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'LATE START', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 28, y: 58, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 20, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Cross', label: 'RUNNING LATE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 15, damage: 9,
        block: -2, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 34, y: 52, h: 38 }, push: 6, juggle: 3.4,
        anim: [[1, 'jab_x'], [5, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [26, 'idle']]
      },
      // Snap Kick: lightning-fast, and it chains into itself: head, body, head.
      mid: {
        name: 'Snap Kick', label: 'SNAP KICK', cmd: 'K', level: 'high', strength: 'light', motion: 'kick', kick: true,
        startup: 10, active: 2, recovery: 14, damage: 10,
        block: -1, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 20, w: 30, y: 62, h: 22 }, push: 6, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'k', into: 'snap2', from: 10, to: 21, onContact: true, plain: true }],
        anim: [[1, 'idle'], [5, 'snap_c'], [10, 'snap_x'], [12, 'snap_x'], [18, 'snap_c'], [25, 'idle']]
      },
      snap2: {
        name: 'Snap Kick (Body)', label: 'SNAP KICK 2', cmd: 'K,K', level: 'mid', strength: 'light', motion: 'kick', kick: true,
        startup: 9, active: 2, recovery: 14, damage: 10,
        block: -3, hit: { adv: 5 }, ch: { adv: 8 },
        hitbox: { x: 20, w: 30, y: 40, h: 22 }, push: 6, juggle: 3.4, shake: 0.002,
        cancels: [{ btn: 'k', into: 'snap3', from: 9, to: 20, onContact: true, plain: true }],
        anim: [[1, 'snap_x'], [4, 'snap_c'], [9, 'snap2_x'], [11, 'snap2_x'], [17, 'snap_c'], [24, 'idle']]
      },
      snap3: {
        name: 'Snap Kick (Head)', label: 'SNAP KICK 3', cmd: 'K,K,K', level: 'high', strength: 'medium', motion: 'kick', kick: true,
        startup: 10, active: 2, recovery: 20, damage: 14,
        block: -8, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 32, y: 60, h: 26 }, push: 16, juggle: 3.6, carry: 1.4, shake: 0.005,
        anim: [[1, 'snap2_x'], [4, 'snap_c'], [10, 'snap_x'], [12, 'snap_x'], [22, 'snap_c'], [31, 'idle']]
      },
      // Double Roundhouse: two kicks off the same leg, without touching the floor.
      bK: {
        name: 'Double Roundhouse', label: 'DOUBLE ROUNDHOUSE', cmd: 'B+K', level: 'mid', strength: 'medium', motion: 'roundhouse', kick: true, multi: 1,
        startup: 13, active: 8, recovery: 16, damage: 8,
        block: -5, hit: { adv: 3 }, ch: { adv: 7 },
        hitbox: { x: 18, w: 32, y: 44, h: 34 }, push: 8, juggle: 3.4, shake: 0.004,
        anim: [[1, 'idle'], [7, 'dbl_c'], [13, 'dbl_x1'], [16, 'dbl_c'], [19, 'dbl_x2'], [21, 'dbl_x2'], [30, 'dbl_c'], [37, 'idle']]
      },
      // Back Kick: a spin, and the rear foot into the stomach. Big knockback, and at the
      // wall it splats them.
      fK: {
        ex: { text: 'TWO SPINS, WALL SPLAT', multi: 1, wallSplat: true },
        name: 'Spinning Back Kick', label: 'BACK KICK', cmd: 'F+K', level: 'mid', strength: 'heavy', motion: 'kick', kick: true, wallSplat: true,
        startup: 16, active: 3, recovery: 18, damage: 17,
        block: -6, hit: { adv: 2 }, ch: { knockdown: true },
        hitbox: { x: 18, w: 34, y: 34, h: 24 }, push: 32, juggle: 3.6, carry: 2, shake: 0.007,
        anim: [[1, 'idle'], [8, 'back_c'], [16, 'back_x'], [19, 'back_x'], [28, 'back_r'], [37, 'idle']]
      },
      // Axe Kick: the heel straight down on the head (a mid: crouching doesn't block it).
      fH: {
        name: 'Axe Kick', label: 'AXE KICK', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'overhead', kick: true,
        startup: 20, active: 3, recovery: 18, damage: 20,
        block: -6, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 16, w: 30, y: 40, h: 50 }, push: 12, juggle: 3.4, shake: 0.008,
        step: [8, 18, 1.2],
        anim: [[1, 'idle'], [10, 'axe_c'], [20, 'axe_x'], [23, 'axe_x'], [30, 'axe_r'], [38, 'idle']]
      },
      // Tornado Kick: his launcher, a jumping 360 spin kick.
      launcher: {
        ex: { text: 'ARMORED', armor: { hits: 1 }, hit: { launch: true } },
        name: 'Tornado Kick', label: 'TORNADO KICK', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher', kick: true,
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -14, hit: { launch: 7.6 }, ch: { launch: 9 },
        hitbox: { x: 6, w: 34, y: 28, h: 78 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [8, 15, 1.4],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'idle'], [8, 'tor_c'], [15, 'tor_x'], [19, 'tor_x'], [28, 'tor_r'], [41, 'idle']]
      },
      // 540 Kick: a huge jumping, spinning hook kick. Slow, and massive.
      bH: {
        ex: { text: 'ARMORED', armor: { hits: 1 } },
        name: '540 Kick', label: '540 KICK', cmd: 'B+H', level: 'high', strength: 'heavy', motion: 'roundhouse', kick: true,
        startup: 26, active: 3, recovery: 24, damage: 28,
        block: -12, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 10, w: 36, y: 60, h: 30 }, push: 20, juggle: 3.8, carry: 2, shake: 0.012,
        step: [10, 24, 1.6],
        anim: [[1, 'idle'], [10, 'tor_c'], [18, 'k540_c'], [26, 'k540_x'], [29, 'k540_x'], [40, 'k540_r'], [52, 'idle']]
      },
      // Hopping Side Kick: out of a dash (F, F, K), across the whole screen.
      dashK: {
        name: 'Hopping Side Kick', label: 'HOPPING SIDE KICK', cmd: 'F,F,K', level: 'mid', strength: 'heavy', motion: 'kick', kick: true,
        startup: 14, active: 4, recovery: 20, damage: 18,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 16, w: 34, y: 40, h: 26 }, push: 18, juggle: 3.6, carry: 1.8, shake: 0.006,
        step: [1, 16, 7],
        anim: [[1, 'side_c'], [8, 'side_c'], [14, 'side_x'], [18, 'side_x'], [26, 'axe_r'], [37, 'idle']]
      },
      // Low Cut Kick: quick, to the shin.
      low: {
        name: 'Low Cut Kick', label: 'LOW CUT KICK', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low', kick: true,
        startup: 12, active: 3, recovery: 17, damage: 9,
        block: -8, hit: { adv: 2 }, ch: { adv: 6 },
        hitbox: { x: 22, w: 26, y: 0, h: 16 }, push: 8, juggle: 2.5, shake: 0.002,
        anim: [[1, 'idle'], [7, 'lowc_c'], [12, 'lowc_x'], [15, 'lowc_x'], [24, 'lowc_c'], [30, 'idle']]
      },
      sweep: FG.kit.sweep('SPINNING SWEEP', { startup: 19, damage: 14, motion: 'sweep', kick: true }),
      // Roundhouse (H): the rear leg, the hip turned all the way over.
      heavy: {
        name: 'Roundhouse', label: 'ROUNDHOUSE', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'roundhouse', kick: true, wallSplat: true,
        startup: 16, active: 3, recovery: 19, damage: 18,
        block: -5, hit: { adv: 4 }, ch: { launch: 5.6 },
        hitbox: { x: 16, w: 34, y: 42, h: 26 }, push: 20, juggle: 3.6, carry: 1.8, shake: 0.006,
        anim: [[1, 'idle'], [9, 'rh_c'], [16, 'rh_x'], [19, 'rh_x'], [28, 'rh_r'], [37, 'idle']]
      }
    },
    FG.kit.air(['FLYING SIDE KICK', 'SCISSOR KICK', 'BUTTERFLY KICK'], {
      airP: { hitbox: { x: 18, w: 30, y: 30, h: 26 } },
      airK: { hitbox: { x: 14, w: 30, y: 24, h: 30 } },
      airH: { hitbox: { x: 10, w: 34, y: 14, h: 40 } }
    }),
    FG.kit.throws('PUSH AND HOOK', 'SPIN AROUND', { throw: { damage: 30 }, throwB: { damage: 33 } }),
    FG.kit.wake({ wakeLow: { label: 'SNOOZE BUTTON' }, wakeMid: { label: 'FIRST BELL' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'SNAP, SNAP, SNAP', difficulty: 'easy', notation: 'K, K, K', plan: { 0: 'K', 12: 'K', 23: 'K' }, hits: ['mid', 'snap2', 'snap3'] },
      { name: 'RUNNING LATE', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 24: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'TORNADO', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 52: 'P', 59: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'KICK CHAIN', difficulty: 'medium', notation: 'K, K, H', plan: { 0: 'K', 12: 'K', 21: 'H' }, hits: ['mid', 'snap2', 'heavy'] },
      { name: 'FLYING KICKS', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H',
        plan: { 0: 'D+H', 16: 'UP', 30: 'P', 39: 'K', 46: 'H' }, hits: ['launcher', 'airP', 'airK', 'airH'] },
      // Meter routes (combo trials): an enhanced special, and the ultimate.
      { name: 'TORNADO PLUS', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 41: 'P', 52: 'P', 60: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'PASSING PERIOD', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],


    intro: [[1, 'run1'], [6, 'run2'], [12, 'run1'], [18, 'run2'], [26, 'stand'], [36, 'bow'], [54, 'bow'], [62, 'watch'], [74, 'idle']],
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
