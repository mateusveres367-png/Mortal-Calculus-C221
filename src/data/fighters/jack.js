// JACK — Tricky / Zoner — "BACK OF THE CLASSROOM". A 10th grader: creative and
// sneaky, always messing around in the back row.
//
// Signature: DOODLE. B+K drops him into his sketchbook stance: he doodles, and his
// next attack comes from a weird angle (P a hopping overhead from above, K a skidding
// low, H a cartwheel kick that launches). Paper Airplane flies out and curves: up
// (B+P) or diving down (D+P), a low once it skims the floor. Eraser Flick (F+P) is a
// fast little high. Pass the Note (F+H) is a feint; Seat Swap (B+H) switches sides.
(function () {
  // The smallest of them: short limbs, a slouch.
  var R = FG.rigger({ torso: 24, neck: 11, upper: 14, fore: 12, thigh: 22, shin: 22.5 });
  // A slouch with a pencil behind his ear: hands loose, one up near his face.
  var stance = R({ hip: [-1, 41], lean: -2, neck: 6, fa: { hand: [14, 62] }, ba: { hand: [2, 50] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } });
  var stand = R({ hip: [0, 44], lean: -4, fa: [-84, -74], ba: [-96, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } });
  // Doodling: hunched over a sketchbook held in the back hand, pencil going.
  var doodle = R({ hip: [0, 38], lean: 16, neck: 22, fa: { hand: [14, 52] }, ba: { hand: [10, 46] }, fl: { foot: [9, 0] }, bl: { foot: [-11, 0] } });

  var poses = {
    idle: stance,
    stand: stand,
    pw_idle: doodle,
    doodle2: R({ hip: [0, 38], lean: 18, neck: 24, fa: { hand: [12, 50] }, ba: { hand: [10, 46] }, fl: { foot: [9, 0] }, bl: { foot: [-11, 0] } }),
    fold: R({ hip: [0, 44], lean: 10, neck: 20, fa: { hand: [12, 54] }, ba: { hand: [8, 54] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    shrug: R({ hip: [0, 44], lean: -4, neck: -8, fa: [-20, 60], ba: [-160, 120], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    lounge: R({ hip: [0, 44], lean: -12, neck: -6, fa: [150, -60], ba: [160, -50], fl: { foot: [9, 0] }, bl: { foot: [-6, 0] } }),
    glasses: R({ hip: [0, 44], lean: -2, fa: [40, 130], ba: [-96, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    ride: R({ hip: [0, 30], lean: 20, neck: 10, fa: { hand: [22, 30] }, ba: { hand: [-14, 32] }, fl: { foot: [16, 0] }, bl: { foot: [-16, 0] } }),

    crouch: R({ hip: [-1, 24], lean: 18, fa: { hand: [14, 46] }, ba: { hand: [4, 40] }, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }),
    squat: R({ hip: [-1, 30], lean: 14, fa: { hand: [13, 50] }, ba: { hand: [4, 46] }, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }),
    jump: R({ hip: [0, 44], lean: 0, fa: [40, 80], ba: [-140, -100], fl: [-50, -110], bl: [-100, -50] }),
    dash: R({ hip: [3, 36], lean: 28, neck: 8, fa: { hand: [18, 56] }, ba: [-150, -120], fl: { foot: [18, 0] }, bl: { foot: [-16, 6] } }),
    backdash: R({ hip: [-3, 40], lean: -10, fa: { hand: [12, 60] }, ba: { hand: [0, 50] }, fl: { foot: [12, 6] }, bl: { foot: [-15, 0] } }),
    sidestep: R({ hip: [0, 32], lean: 12, neck: 8, fa: { hand: [12, 52] }, ba: { hand: [4, 48] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    block: R({ hip: [-2, 39], lean: 6, neck: 10, fa: { hand: [12, 68] }, ba: { hand: [6, 66] }, fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }),
    cblock: R({ hip: [-2, 24], lean: 14, fa: { hand: [13, 50] }, ba: { hand: [7, 48] }, fl: { foot: [11, 0] }, bl: { foot: [-13, 0] } }),
    hit_high: R({ hip: [-3, 42], lean: -16, neck: -18, fa: [70, -30], ba: [-120, -70], fl: { foot: [11, 0] }, bl: { foot: [-16, 0] } }),
    hit_mid: R({ hip: [-4, 36], lean: 32, neck: 14, fa: { hand: [10, 34] }, ba: { hand: [4, 36] }, fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 34], lean: 12, fa: [-30, -10], ba: [-150, -110], fl: [-50, -110], bl: { foot: [-14, 0] } }),
    gbreak: R({ hip: [-4, 40], lean: -16, neck: -10, fa: [50, 110], ba: [80, 130], fl: { foot: [11, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -58, neck: -18, fa: [90, 140], ba: [110, 160], fl: [36, -26], bl: [6, -56] }),
    down: R({ hip: [0, 6], lean: -86, fa: [120, 170], ba: [-160, -120], fl: [14, -12], bl: [-6, 6] }),

    // Spitball and Pencil Poke: a flicked jab and a straight jab with the pencil.
    jab_c: R({ hip: [0, 41], lean: 4, fa: { hand: [16, 62] }, ba: { hand: [2, 52] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    jab_x: R({ hip: [4, 41], lean: 10, neck: 4, fa: [10, 8], ba: { hand: [4, 54] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    poke_c: R({ hip: [1, 41], lean: 2, fa: { hand: [12, 60] }, ba: [-140, 40], fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    poke_x: R({ hip: [8, 40], lean: 18, fa: { hand: [10, 56] }, ba: [4, 4], fl: { foot: [18, 0] }, bl: { foot: [-9, 1] } }),
    // Ruler Snap: leaning way in, the ruler at arm's length (a long poke).
    ruler_c: R({ hip: [-2, 42], lean: -6, fa: [160, 120], ba: { hand: [4, 54] }, fl: { foot: [10, 0] }, bl: { foot: [-14, 0] } }),
    ruler_x: R({ hip: [8, 38], lean: 26, fa: [0, 0], ba: { hand: [0, 48] }, fl: { foot: [22, 0] }, bl: { foot: [-10, 2] } }),
    // Under the Desk: a crouching toe poke.
    low_c: R({ hip: [-1, 24], lean: 16, fa: { hand: [12, 44] }, ba: { hand: [4, 40] }, fl: [-10, -100], bl: { foot: [-13, 0] } }),
    low_x: R({ hip: [1, 22], lean: 6, fa: { hand: [10, 42] }, ba: [-160, -150], fl: { foot: [40, 4] }, bl: { foot: [-13, 0] } }),
    sweep_c: R({ hip: [-2, 20], lean: 26, fa: { hand: [16, 24] }, ba: { hand: [4, 28] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    sweep_x: R({ hip: [0, 16], lean: 16, fa: { hand: [12, 4] }, ba: [-170, -175], fl: { foot: [4, 0] }, bl: { foot: [44, 2] } }),
    // Binder Slap: a backhand swing with the binder.
    hv_c: R({ hip: [-3, 42], lean: -14, fa: [170, -150], ba: { hand: [2, 50] }, fl: { foot: [9, 0] }, bl: { foot: [-14, 0] } }),
    hv_x: R({ hip: [6, 40], lean: 20, fa: [20, 30], ba: { hand: [-4, 52] }, fl: { foot: [17, 0] }, bl: { foot: [-10, 1] } }),
    hv_r: R({ hip: [4, 40], lean: 12, fa: [-20, -60], ba: { hand: [0, 52] }, fl: { foot: [14, 0] }, bl: { foot: [-11, 0] } }),
    // Pencil Flip: a flick kick straight up.
    up_c: R({ hip: [-1, 26], lean: 20, fa: { hand: [12, 40] }, ba: { hand: [2, 36] }, fl: { foot: [11, 0] }, bl: { foot: [-12, 0] } }),
    up_x: R({ hip: [-2, 44], lean: -20, neck: -10, fa: [150, 170], ba: [-150, -120], fl: [80, 80], bl: { foot: [-12, 0] } }),
    up_r: R({ hip: [0, 42], lean: -8, fa: [130, 170], ba: { hand: [2, 50] }, fl: [40, -30], bl: { foot: [-12, 0] } }),
    // Paper Airplane: a flick of the wrist from the hip; Eraser Flick: a thumb flick.
    plane_c: R({ hip: [-2, 40], lean: -6, fa: [-140, 160], ba: { hand: [2, 50] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    plane_x: R({ hip: [4, 40], lean: 10, fa: [10, 20], ba: { hand: [0, 50] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    dplane_c: R({ hip: [-1, 42], lean: -10, fa: [140, 110], ba: { hand: [2, 52] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    dplane_x: R({ hip: [3, 41], lean: 8, fa: [40, -10], ba: { hand: [0, 52] }, fl: { foot: [14, 0] }, bl: { foot: [-11, 0] } }),
    flick_c: R({ hip: [0, 41], lean: 2, fa: { hand: [14, 64] }, ba: { hand: [2, 52] }, fl: { foot: [10, 0] }, bl: { foot: [-13, 0] } }),
    flick_x: R({ hip: [2, 41], lean: 6, fa: [16, 30], ba: { hand: [2, 52] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    // Pass the Note: reaching out with a folded note. And the things it turns into.
    note_c: R({ hip: [1, 41], lean: 10, neck: -6, fa: { hand: [24, 56] }, ba: { hand: [2, 50] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    note_x: R({ hip: [4, 41], lean: 14, neck: -10, fa: { hand: [30, 58] }, ba: { hand: [4, 52] }, fl: { foot: [14, 0] }, bl: { foot: [-11, 0] } }),
    // Seat Swap: ducking out of sight.
    swap: R({ hip: [0, 18], lean: 36, neck: 14, fa: { hand: [12, 12] }, ba: { hand: [2, 14] }, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }),
    // The doodle attacks: from above, along the floor, and a cartwheel.
    pw_drop_c: R({ hip: [0, 52], lean: -4, fa: [110, 150], ba: [120, 160], fl: [-40, -120], bl: [-110, -60] }),
    pw_drop_x: R({ hip: [6, 40], lean: 34, fa: [-30, -70], ba: [-20, -60], fl: { foot: [16, 0] }, bl: { foot: [-12, 4] } }),
    pw_skid: R({ hip: [2, 14], lean: -40, fa: [-170, 170], ba: [150, 175], fl: { foot: [42, 2] }, bl: [-30, -60] }),
    pw_cart_c: R({ hip: [0, 30], lean: 70, neck: 20, fa: { hand: [20, 4] }, ba: { hand: [12, 4] }, fl: [-60, -120], bl: { foot: [-12, 0] } }),
    pw_cart_x: R({ hip: [2, 40], lean: 120, fa: { hand: [14, 2] }, ba: { hand: [4, 2] }, fl: [80, 70], bl: [100, 120] }),

    air_p: R({ hip: [0, 44], lean: 6, fa: [-10, -30], ba: [-140, -100], fl: [-50, -110], bl: [-100, -50] }),
    air_k: R({ hip: [0, 44], lean: -16, fa: [100, 150], ba: [-150, -110], fl: [6, -4], bl: [-100, -50] }),
    air_hc: R({ hip: [0, 46], lean: -6, fa: [120, 170], ba: [-150, -110], fl: [-50, -110], bl: [-100, -50] }),
    air_hx: R({ hip: [0, 44], lean: 26, fa: [-10, -50], ba: [-150, -110], fl: [-50, -110], bl: [-100, -50] }),

    // Fold in Half: a headlock and a fold. Switcheroo: spins them round behind him.
    grab_c: R({ hip: [1, 41], lean: 12, fa: { hand: [20, 60] }, ba: { hand: [14, 58] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [3, 41], lean: 16, fa: { hand: [26, 58] }, ba: { hand: [22, 56] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
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
    glyphs: ['NOTE', 'LOL', '10/10', 'DOODLE'],
    stringH: 'BOOK REPORT',
    stanceName: 'DOODLING',
    cutIn: { a: 0x8a8a92, b: 0x5fd7ff }, // gray raglan, ballpoint blue
    finisher: { name: 'BACK ROW', input: 'B, D, F, K' },
    ultimate: { name: 'PAPER AIRPLANE SQUADRON', text: 'dozens of paper airplanes fill the screen in formation and dive-bomb them', from: 'mid', len: 270,
      hits: [118, 128, 136, 144, 150, 156, 162, 168, 174, 180, 228], weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6], end: { gap: 80, down: true } },
    name: 'JACK', nickname: 'BACK OF THE CLASSROOM', archetype: 'TRICKY', theme: 'BACK ROW',
    style: 'SCHOOL-SUPPLY ZONER', signatureMechanic: 'DOODLE',
    signatureText: 'B+K drops him into his sketchbook stance (DOODLING): his next attack comes from a weird angle (P a hopping overhead from above, K a skidding low, H a cartwheel kick that launches). Paper Airplane flies out and curves, up (B+P) or diving (D+P, a low once it skims the floor); Eraser Flick (F+P) is a fast little high; Pass the Note (F+H) is a feint; Seat Swap (B+H) switches sides',
    bio: 'CREATIVE AND SNEAKY. ALWAYS MESSING AROUND IN THE BACK ROW.',
    signature: ['PAPER AIRPLANE', 'ERASER FLICK', 'RULER SNAP', 'DOODLE', 'SEAT SWAP'],
    scale: 0.92, health: 170,
    walkF: 2.2, walkB: 1.6, dashSpeed: 8.2, dashFrames: 15, backdashSpeed: 9.6,
    jumpVy: 9.4, weight: 0.93, react: 1.15,
    walk: { lean: -1, bob: 1.0, rate: 0.22 },
    look: {
      skin: 0xe8c09a,
      hair: { style: 'shaggy', color: 0x5a3a20 },
      glasses: 0x2a2a30, mouth: 'smirk',
      top: { style: 'raglan', color: 0x9a9aa2, sleeveColor: 0x2a2a32, sleeves: 'short' },
      legs: 0x3a4a6a, shoes: 0xb8b8b8,
      build: { torso: 0.9, limb: 0.92 }
    },
    idleAnim: { breath: 0.9, bob: 0.6, sway: 1.2, rate: 0.08 }, // slouching, swaying
    poses: poses,
    // How the CPU plays him: keeps you out with paper and erasers, then doodles a mix-up.
    ai: { spacing: 100, pokes: ['K', 'F+P', 'K', 'B+P', 'H'], close: ['P', 'B+H', 'F+H>H', 'P+K', 'B+K>H', 'B+K>P', 'B+K>K', 'P>P>H', 'H', 'D+H'], far: ['B+P', 'D+P', 'F+P', 'B+P'], zone: 0.5, zoneDist: 100, aggro: 1.0, backdash: 0.2 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'SPITBALL', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 10, active: 2, recovery: 13, damage: 8,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 26, y: 58, h: 18 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 21, onContact: true }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Straight', label: 'PENCIL POKE', cmd: 'P,P', level: 'high', strength: 'light', motion: 'cross',
        startup: 10, active: 2, recovery: 16, damage: 10,
        block: -3, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 32, y: 54, h: 36 }, push: 5, juggle: 3.4,
        anim: [[1, 'jab_x'], [6, 'poke_c'], [10, 'poke_x'], [13, 'poke_x'], [27, 'idle']]
      },
      // Ruler Snap: a long poke with a ruler.
      mid: {
        name: 'Long Poke', label: 'RULER SNAP', cmd: 'K', level: 'mid', strength: 'medium', motion: 'straight',
        startup: 14, active: 3, recovery: 17, damage: 14,
        block: -5, hit: { adv: 4 }, ch: { adv: 8 },
        hitbox: { x: 26, w: 40, y: 48, h: 16 }, push: 14, juggle: 3.6, shake: 0.002,
        step: [8, 14, 1.2],
        anim: [[1, 'idle'], [9, 'ruler_c'], [14, 'ruler_x'], [17, 'ruler_x'], [27, 'hv_r'], [34, 'idle']]
      },
      low: {
        name: 'Toe Poke', label: 'UNDER THE DESK', cmd: 'D+K', level: 'low', strength: 'light', motion: 'low',
        startup: 14, active: 3, recovery: 18, damage: 9, crouching: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 5 },
        hitbox: { x: 24, w: 24, y: 0, h: 14 }, push: 9, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [9, 'low_c'], [14, 'low_x'], [17, 'low_x'], [27, 'low_c'], [34, 'crouch']]
      },
      sweep: FG.kit.sweep('TRIP THE AISLE', { startup: 19, damage: 14, motion: 'sweep' }),
      heavy: {
        name: 'Backhand', label: 'BINDER SLAP', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'hook', wallSplat: true,
        startup: 17, active: 3, recovery: 20, damage: 21,
        block: -5, hit: { adv: 5 }, ch: { launch: 5.6 },
        hitbox: { x: 18, w: 30, y: 46, h: 26 }, push: 20, juggle: 3.4, carry: 1.8, shake: 0.005,
        step: [9, 17, 1.2],
        anim: [[1, 'idle'], [10, 'hv_c'], [17, 'hv_x'], [20, 'hv_x'], [28, 'hv_r'], [37, 'idle']]
      },
      launcher: {
        ex: { text: 'ARMORED', armor: { hits: 1 } },
        name: 'Flick Kick', label: 'PENCIL FLIP', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 15, active: 4, recovery: 22, damage: 15,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 30, y: 28, h: 80 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [9, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [41, 'idle']]
      },
      // Paper Airplane: out, then curving up (B+P) or diving down (D+P).
      bP: {
        ex: { text: 'FASTER, KNOCKDOWN', projectile: { vx: 6.2 }, hit: { knockdown: true } },
        name: 'Projectile', label: 'PAPER AIRPLANE', cmd: 'B+P', level: 'mid', strength: 'medium', motion: 'cross',
        startup: 14, active: 1, recovery: 16, damage: 13,
        block: -1, hit: { adv: 6 }, ch: { adv: 9 },
        projectile: { kind: 'plane', x: 26, y: 30, vx: 4.4, vy: 0.2, curve: 0.035, w: 18, h: 10, range: 520, life: 150 },
        push: 8, shake: 0.002,
        anim: [[1, 'idle'], [8, 'plane_c'], [14, 'plane_x'], [20, 'plane_x'], [34, 'idle']]
      },
      dP: {
        name: 'Projectile', label: 'NOSE DIVE', cmd: 'D+P', level: 'mid', strength: 'medium', motion: 'cross',
        startup: 15, active: 1, recovery: 16, damage: 13,
        block: -1, hit: { adv: 6 }, ch: { adv: 9 },
        projectile: { kind: 'plane', x: 26, y: 66, vx: 4.2, vy: 0.6, curve: -0.05, w: 18, h: 10, range: 520, life: 150, ground: 'slide', lowBelow: 16 },
        push: 8, shake: 0.002,
        anim: [[1, 'idle'], [8, 'dplane_c'], [15, 'dplane_x'], [21, 'dplane_x'], [35, 'idle']]
      },
      // Eraser Flick: fast and small. A high.
      fP: {
        ex: { text: 'A BIGGER ERASER, KNOCKDOWN', projectile: { w: 14, h: 10, vx: 10 }, hit: { knockdown: true } },
        name: 'Projectile', label: 'ERASER FLICK', cmd: 'F+P', level: 'high', strength: 'light', motion: 'jab',
        startup: 11, active: 1, recovery: 13, damage: 9,
        block: 1, hit: { adv: 7 }, ch: { adv: 10 },
        projectile: { kind: 'eraser', x: 24, y: 64, vx: 8.5, vy: 0, w: 10, h: 7, range: 340, life: 60 },
        push: 6,
        anim: [[1, 'idle'], [7, 'flick_c'], [11, 'flick_x'], [16, 'flick_x'], [27, 'idle']]
      },
      // Pass the Note: looks like he's passing a note. Cancel it into P, K, H or a throw.
      fH: {
        name: 'Feint', label: 'PASS THE NOTE', cmd: 'F+H', level: 'mid', strength: 'light', feint: true,
        startup: 22, active: 1, recovery: 1,
        cancels: [
          { btn: 'throw', into: 'throw', from: 6, to: 18 },
          { btn: 'h', into: 'heavy', from: 6, to: 18 },
          { btn: 'k', into: 'low', from: 6, to: 18 },
          { btn: 'p', into: 'jab', from: 6, to: 18 }
        ],
        anim: [[1, 'idle'], [8, 'note_c'], [18, 'note_x'], [23, 'idle']]
      },
      // Seat Swap: he ducks out of sight and turns up on their other side.
      bH: {
        name: 'Teleport', label: 'SEAT SWAP', cmd: 'B+H', level: 'mid', strength: 'light',
        startup: 26, active: 1, recovery: 1,
        teleport: { at: 15, to: 'behind', gap: 38, hide: [5, 14], fx: 'paper' }, invuln: [5, 15],
        anim: [[1, 'idle'], [5, 'swap'], [15, 'swap'], [20, 'crouch'], [27, 'idle']]
      },
      // Doodle: B+K, a sketchbook stance. Its attacks come from weird angles.
      bK: {
        name: 'Stance', label: 'DOODLE', cmd: 'B+K', level: 'mid', strength: 'light', stanceSwitch: true,
        startup: 12, active: 1, recovery: 1,
        anim: [[1, 'idle'], [6, 'doodle2'], [12, 'pw_idle']]
      },
      pwP: {
        name: 'Hopping Overhead', label: 'MARGIN NOTE', cmd: 'STANCE P', level: 'mid', strength: 'heavy', motion: 'overhead', bound: true,
        startup: 18, active: 3, recovery: 20, damage: 17, guardDmg: 22,
        block: -6, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 20, w: 26, y: 40, h: 34 }, push: 14, juggle: 2.5, shake: 0.006,
        step: [6, 18, 1.6],
        anim: [[1, 'pw_idle'], [10, 'pw_drop_c'], [18, 'pw_drop_x'], [21, 'pw_drop_x'], [30, 'hv_r'], [41, 'idle']]
      },
      pwK: {
        name: 'Skidding Low', label: 'SCRIBBLE', cmd: 'STANCE K', level: 'low', strength: 'medium', motion: 'sweep', crouching: true,
        startup: 14, active: 4, recovery: 20, damage: 13,
        block: -12, hit: { adv: 2 }, ch: { knockdown: true },
        hitbox: { x: 24, w: 30, y: 0, h: 14 }, push: 10, juggle: 2.5, shake: 0.004,
        step: [4, 15, 3],
        anim: [[1, 'pw_idle'], [8, 'crouch'], [14, 'pw_skid'], [18, 'pw_skid'], [30, 'crouch'], [38, 'idle']]
      },
      pwH: {
        name: 'Cartwheel Kick', label: 'OUTSIDE THE LINES', cmd: 'STANCE H', level: 'mid', strength: 'launch', motion: 'roundhouse',
        startup: 16, active: 4, recovery: 22, damage: 16,
        block: -13, hit: { launch: 6.8 }, ch: { launch: 7.4 },
        hitbox: { x: 10, w: 30, y: 40, h: 50 }, push: 8, juggle: 4.5, carry: 0.6, shake: 0.006,
        step: [6, 16, 2],
        anim: [[1, 'pw_idle'], [9, 'pw_cart_c'], [16, 'pw_cart_x'], [20, 'pw_cart_x'], [30, 'squat'], [42, 'idle']]
      }
    },
    FG.kit.air(['NOTEBOOK SWAT', 'DESK HOP', 'PENCIL DROP']),
    FG.kit.throws('FOLD IN HALF', 'SWITCHEROO', { throw: { damage: 28 }, throwB: { damage: 32 } }),
    FG.kit.wake({ wakeLow: { label: 'NOT ASLEEP' }, wakeMid: { label: 'I WAS LISTENING' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'SPITBALLS', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 25: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'PASS IT BACK', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 12: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'PENCIL FLIP', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 41: 'P', 51: 'P', 58: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'OUTSIDE THE LINES', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H, D+K',
        plan: { 0: 'D+H', 16: 'UP', 23: 'P', 31: 'K', 39: 'H', 92: 'D+K' }, hits: ['launcher', 'airP', 'airK', 'airH', 'low'] },
      { name: 'ARMORED FLIP', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 41: 'P', 51: 'P', 58: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'PAPER AIRPLANE SQUADRON', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'pw_idle'], [44, 'doodle2'], [56, 'glasses'], [72, 'glasses'], [82, 'idle']],
    victory: [[1, 'stand'], [14, 'fold'], [44, 'fold'], [54, 'lounge'], [80, 'lounge'], [92, 'shrug'], [110, 'shrug']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { glasses: [[1, 'idle'], [8, 'glasses'], [26, 'glasses'], [36, 'idle']] },
    bigHit: { gesture: 'glasses' },
    talk: {
      lines: ["Wasn't paying attention. Doesn't matter.", "Back row's got range.", 'Incoming.'],
      quips: ['Incoming.', 'Heads up.', 'Ten out of ten.', 'Pass it back.']
    },
    victoryLines: ["Didn't even look up.", 'Ten out of ten landing.', 'Pass it to the back.']
  });
})();
