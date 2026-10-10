// MAX — Power / Grappler — "HEAVY COURSE LOAD". A 10th grader: chill and friendly, but
// strong, and a wrestler. Low, wide stance, hands out in front; he wants your legs.
// Palm strikes (P) and knees (K) to get in, then takedowns.
//
// Moves: Double-Leg Takedown (F+H) ducks under highs and puts them on the floor;
// Single-Leg (D+H) is his launcher; Snap Down (F+P) yanks the head down and staggers
// them; Sprawl (B+K) kicks his legs back to catch lows, takedowns and throws; Body Lock
// Suplex (P+K) and Arm Drag (B+P+K) are his throws. Not a RAMOS: no running, no slams
// off the ropes. Everything ends on the mat.
//
// Signature: SUBMISSIONS (src/engine/submission.js). After any knockdown or takedown, H
// next to the downed opponent starts a hold, by the direction held: H armbar, D+H rear
// naked choke, F+H kimura, B+H triangle. A struggle meter: they mash to escape, he mashes
// to tighten, and when it fills they TAP.
(function () {
  // The biggest of the students: long torso, thick limbs.
  var R = FG.rigger({ torso: 27, neck: 10, upper: 15, fore: 13, thigh: 23, shin: 23 });
  var hands = function (fx, fy, bx, by) { return { fa: { hand: [fx, fy] }, ba: { hand: [bx, by] } }; };
  var pose = function (spec, h) { return R(Object.assign(spec, h || {})); };
  var WIDE = { fl: { foot: [20, 0] }, bl: { foot: [-20, 0] } }; // wide base, weight in the middle

  var poses = {
    // Low and wide: knees bent, chest over his knees, chin up, hands out to hand-fight.
    idle: pose(Object.assign({ hip: [0, 36], lean: 24, neck: -14 }, WIDE), hands(25, 51, 17, 47)),
    stand: R({ hip: [0, 45], lean: -2, fa: [-84, -80], ba: [-94, -90], fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    wave: R({ hip: [0, 45], lean: -3, fa: [50, 100], ba: [-94, -90], fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    yawn: R({ hip: [0, 45], lean: -10, neck: -16, fa: [100, 120], ba: [80, 110], fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    flex: R({ hip: [0, 45], lean: -2, fa: [10, 100], ba: [170, 80], fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    // Slapping the mat to start (a wrestler's habit), then hands on his knees.
    slap: R({ hip: [0, 28], lean: 50, neck: -20, fa: { hand: [18, 2] }, ba: { hand: [10, 4] }, fl: { foot: [16, 0] }, bl: { foot: [-18, 0] } }),
    knees: R({ hip: [0, 34], lean: 40, neck: -22, fa: { hand: [16, 26] }, ba: { hand: [10, 25] }, fl: { foot: [16, 0] }, bl: { foot: [-16, 0] } }),
    sleep: R({ hip: [0, 8], lean: -86, neck: -10, fa: [150, 175], ba: [120, 160], fl: [14, -8], bl: [-4, 10] }),
    lieback: R({ hip: [0, 9], lean: -70, neck: -6, fa: { hand: [-14, 2] }, ba: { hand: [-20, 2] }, fl: { foot: [36, 0] }, bl: { foot: [30, 10] } }),
    hands: R({ hip: [0, 43], lean: 12, neck: 12, fa: { hand: [12, 36] }, ba: { hand: [6, 34] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),
    hands2: R({ hip: [0, 42], lean: 16, neck: 14, fa: { hand: [12, 35] }, ba: { hand: [6, 33] }, fl: { foot: [9, 0] }, bl: { foot: [-9, 0] } }),

    // Movement: heavy, flat-footed, always low.
    crouch: pose({ hip: [0, 26], lean: 34, neck: -18, fl: { foot: [19, 0] }, bl: { foot: [-19, 0] } }, hands(26, 38, 18, 34)),
    squat: pose({ hip: [0, 31], lean: 28, neck: -14, fl: { foot: [18, 0] }, bl: { foot: [-18, 0] } }, hands(25, 44, 17, 40)),
    jump: pose({ hip: [0, 44], lean: 10, neck: -10, fl: [-40, -100], bl: [-110, -70] }, hands(24, 60, 18, 56)),
    dash: pose({ hip: [6, 31], lean: 38, neck: -20, fl: { foot: [24, 0] }, bl: { foot: [-18, 4] } }, hands(34, 42, 27, 38)),
    backdash: pose({ hip: [-4, 36], lean: 14, neck: -10, fl: { foot: [16, 4] }, bl: { foot: [-22, 0] } }, hands(20, 50, 13, 47)),
    sidestep: pose({ hip: [0, 33], lean: 22, neck: -12, fl: { foot: [14, 0] }, bl: { foot: [-15, 0] } }, hands(22, 48, 15, 45)),
    // Guard: forearms up in a frame, elbows tight.
    block: pose({ hip: [-2, 36], lean: 16, neck: -6, fl: { foot: [18, 0] }, bl: { foot: [-21, 0] } }, hands(21, 62, 17, 57)),
    cblock: pose({ hip: [-2, 25], lean: 26, neck: -8, fl: { foot: [18, 0] }, bl: { foot: [-20, 0] } }, hands(22, 44, 17, 40)),
    // Hit reactions: he barely budges.
    hit_high: R({ hip: [-2, 37], lean: 4, neck: -18, fa: { hand: [16, 52] }, ba: [-130, -90], fl: { foot: [17, 0] }, bl: { foot: [-21, 0] } }),
    hit_mid: R({ hip: [-3, 35], lean: 36, neck: 12, fa: { hand: [12, 34] }, ba: { hand: [6, 36] }, fl: { foot: [16, 0] }, bl: { foot: [-21, 0] } }),
    hit_low: R({ hip: [-1, 34], lean: 20, fa: { hand: [18, 46] }, ba: { hand: [10, 44] }, fl: [-60, -100], bl: { foot: [-20, 0] } }),
    gbreak: R({ hip: [-3, 42], lean: -10, neck: -8, fa: [40, 90], ba: [60, 110], fl: { foot: [14, 0] }, bl: { foot: [-18, 0] } }),
    juggle: R({ hip: [0, 22], lean: -46, neck: -14, fa: [70, 120], ba: [100, 150], fl: [30, -30], bl: [0, -60] }),
    down: R({ hip: [0, 7], lean: -84, fa: [120, 165], ba: [-150, -115], fl: [16, -12], bl: [-6, 8] }),

    // Palm Strike (P): the lead palm, heel of the hand first, the hips coming through.
    palm_c: pose({ hip: [-1, 36], lean: 18, neck: -12, fl: { foot: [20, 0] }, bl: { foot: [-20, 0] } }, hands(17, 58, 14, 46)),
    palm_x: R({ hip: [6, 37], lean: 28, neck: -14, fa: [10, 4], ba: { hand: [20, 45] }, fl: { foot: [28, 0] }, bl: { foot: [-17, 0] } }),
    // ...and the rear palm (P, P): the rear hip and shoulder turning all the way over.
    palm2_c: pose({ hip: [-2, 36], lean: 14, neck: -12, fl: { foot: [22, 0] }, bl: { foot: [-19, 0] } }, hands(24, 52, 3, 57)),
    palm2_x: R({ hip: [8, 37], lean: 32, neck: -14, fa: { hand: [20, 46] }, ba: [8, 2], fl: { foot: [30, 0] }, bl: { foot: [-12, 2] } }),
    // Knee (K): hands snatch the back of the neck, the rear knee drives up the middle.
    knee_c: pose({ hip: [2, 39], lean: 12, neck: -6, fl: { foot: [16, 0] }, bl: { foot: [-16, 4] } }, hands(31, 64, 27, 62)),
    knee_x: R({ hip: [6, 44], lean: -6, neck: 10, fa: { hand: [29, 56] }, ba: { hand: [25, 54] }, fl: { foot: [9, 0] }, bl: [38, -76] }),
    // Collar-Tie Knee (F+K): a step in with the collar tie, and the knee comes up to the chin.
    ctk_c: pose({ hip: [7, 40], lean: 10, neck: -8, fl: { foot: [27, 0] }, bl: { foot: [-10, 4] } }, hands(35, 70, 31, 68)),
    ctk_x: R({ hip: [11, 46], lean: -10, neck: 18, fa: { hand: [33, 58] }, ba: { hand: [29, 56] }, fl: { foot: [14, 0] }, bl: [62, -48] }),
    ctk_r: pose({ hip: [9, 40], lean: 6, neck: 4, fl: { foot: [22, 0] }, bl: { foot: [-6, 4] } }, hands(30, 60, 26, 58)),
    // Snap Down (F+P): both hands over the back of the head, then yanked down to the mat.
    snap_c: pose({ hip: [2, 41], lean: 4, neck: -4, fl: { foot: [22, 0] }, bl: { foot: [-16, 0] } }, hands(33, 76, 29, 78)),
    snap_x: pose({ hip: [-7, 29], lean: 36, neck: -10, fl: { foot: [15, 0] }, bl: { foot: [-28, 0] } }, hands(25, 26, 21, 24)),
    snap_r: pose({ hip: [-4, 33], lean: 28, neck: -12, fl: { foot: [17, 0] }, bl: { foot: [-24, 0] } }, hands(26, 40, 19, 37)),
    // Double Palm (H): both palms pulled to the chest, then shoved out with everything.
    dp_c: pose({ hip: [-5, 37], lean: 6, neck: -10, fl: { foot: [17, 0] }, bl: { foot: [-25, 0] } }, hands(9, 56, 5, 53)),
    dp_x: R({ hip: [11, 38], lean: 30, neck: -12, fa: [6, 2], ba: [0, -4], fl: { foot: [35, 0] }, bl: { foot: [-12, 1] } }),
    dp_r: pose({ hip: [9, 37], lean: 26, neck: -12, fl: { foot: [31, 0] }, bl: { foot: [-14, 0] } }, hands(28, 52, 21, 48)),
    // Ankle Pick (D+K): a level change and a hand snatching the ankle.
    pick_c: pose({ hip: [2, 28], lean: 42, neck: -24, fl: { foot: [22, 0] }, bl: { foot: [-16, 0] } }, hands(25, 34, 17, 30)),
    pick_x: R({ hip: [13, 22], lean: 62, neck: -30, fa: { hand: [52, 4] }, ba: { hand: [32, 14] }, fl: { foot: [31, 0] }, bl: { foot: [-12, 0] } }),
    // Foot Sweep (D/B+K): low, the outside of his foot through their heels.
    sweep_c: R({ hip: [-2, 24], lean: 34, neck: -16, fa: { hand: [18, 28] }, ba: { hand: [8, 30] }, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }),
    sweep_x: R({ hip: [2, 20], lean: 26, neck: -10, fa: { hand: [14, 8] }, ba: [-160, -170], fl: { foot: [4, 0] }, bl: { foot: [48, 4] } }),
    // Double-Leg Takedown (F+H): level change, the penetration step (knee nearly on the
    // mat, head up), arms round both legs, then he drives through them.
    dl_c: pose({ hip: [0, 24], lean: 42, neck: -28, fl: { foot: [22, 0] }, bl: { foot: [-20, 0] } }, hands(29, 34, 23, 30)),
    dl_x: pose({ hip: [18, 18], lean: 72, neck: -40, fl: { foot: [34, 0] }, bl: { foot: [-20, 0] } }, hands(57, 26, 51, 20)),
    dl_lift: pose({ hip: [24, 28], lean: 54, neck: -30, fl: { foot: [42, 0] }, bl: { foot: [-4, 0] } }, hands(53, 38, 47, 32)),
    dl_r: pose({ hip: [18, 21], lean: 38, neck: -12, fl: { foot: [37, 0] }, bl: { foot: [-2, 0] } }, hands(44, 8, 37, 10)),
    // Single-Leg (D+H): dips under, catches a leg, and comes up with it over his shoulder.
    sl_c: pose({ hip: [2, 25], lean: 48, neck: -26, fl: { foot: [25, 0] }, bl: { foot: [-17, 0] } }, hands(32, 22, 27, 18)),
    sl_x: pose({ hip: [7, 44], lean: -10, neck: -14, fl: { foot: [15, 0] }, bl: { foot: [-15, 0] } }, hands(28, 74, 22, 68)),
    sl_r: pose({ hip: [4, 40], lean: 4, neck: -8, fl: { foot: [16, 0] }, bl: { foot: [-16, 0] } }, hands(25, 60, 19, 56)),
    // Sprawl (B+K): the hips thrown back and down, legs kicked out behind, chest heavy.
    spr_c: pose({ hip: [-8, 30], lean: 50, neck: -20, fl: { foot: [6, 0] }, bl: { foot: [-30, 4] } }, hands(27, 24, 21, 22)),
    spr: pose({ hip: [-18, 16], lean: 74, neck: -30, fl: { foot: [-56, 0] }, bl: { foot: [-62, 2] } }, hands(20, 6, 12, 4)),
    // ...it caught something: a front headlock, and he spins them flat to the mat.
    sprx_c: pose({ hip: [-10, 28], lean: 56, neck: -20, fl: { foot: [-4, 0] }, bl: { foot: [-36, 0] } }, hands(27, 34, 19, 30)),
    sprx_x: pose({ hip: [2, 24], lean: 66, neck: -20, fl: { foot: [16, 0] }, bl: { foot: [-24, 0] } }, hands(35, 6, 27, 8)),

    air_p: R({ hip: [0, 44], lean: 10, fa: [-10, -20], ba: [60, 100], fl: [-30, -100], bl: [-110, -70] }),
    air_k: R({ hip: [0, 44], lean: -6, fa: { hand: [22, 70] }, ba: { hand: [18, 68] }, fl: [-60, -100], bl: [40, -70] }),
    air_hc: R({ hip: [0, 46], lean: -14, fa: [110, 150], ba: [120, 160], fl: [-30, -100], bl: [-110, -70] }),
    air_hx: R({ hip: [0, 40], lean: 40, neck: -20, fa: [-10, -40], ba: [-20, -50], fl: [-30, -100], bl: [-120, -80] }),

    // Body Lock Suplex: arms locked round the waist, the lift, and the bridge over the top.
    grab_c: pose({ hip: [4, 34], lean: 30, neck: -16, fl: { foot: [24, 0] }, bl: { foot: [-16, 0] } }, hands(35, 42, 29, 40)),
    grab_x: pose({ hip: [10, 37], lean: 16, neck: 6, fl: { foot: [25, 0] }, bl: { foot: [-12, 0] } }, hands(31, 40, 27, 38)),
    throw_lift: pose({ hip: [2, 33], lean: -16, neck: -10, fl: { foot: [19, 0] }, bl: { foot: [-15, 0] } }, hands(21, 54, 17, 52)),
    throw_back: pose({ hip: [-6, 26], lean: -112, neck: -20, fl: { foot: [12, 0] }, bl: { foot: [-1, 0] } }, hands(-46, 2, -42, 1)),
    // Arm Drag: he grabs an arm and drags them past him, face first into the mat.
    throw_slam: pose({ hip: [6, 26], lean: 50, neck: -10, fl: { foot: [28, 0] }, bl: { foot: [-20, 0] } }, hands(40, 12, 32, 18)),
    wake_low: R({ hip: [-2, 9], lean: -58, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [40, 8] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 42], lean: 14, fa: [60, 90], ba: [50, 85], fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } }),

    // --- Submissions (the one held: v_* in src/data/poses.js). He's placed SUB gap behind
    // them; each hold has a loose pose and a tight one (the struggle meter blends them).
    // Armbar: they're on their back, head toward him; he's down at their shoulder, legs
    // across their chest, their arm pulled straight up, and he leans back on it.
    sub_armbar: R({ hip: [6, 8], lean: -60, neck: 6, fa: { hand: [9, 36] }, ba: { hand: [6, 33] }, fl: [26, -18], bl: [38, -30] }),
    sub_armbar2: R({ hip: [6, 13], lean: -76, neck: 12, fa: { hand: [2, 32] }, ba: { hand: [-1, 30] }, fl: [20, -22], bl: [32, -34] }),
    // Rear naked choke: sat behind them, hooks in, one arm under the chin.
    sub_rnc: R({ hip: [14, 9], lean: -6, neck: 20, fa: { hand: [32, 42] }, ba: { hand: [26, 49] }, fl: { foot: [50, 4] }, bl: { foot: [46, 2] } }),
    sub_rnc2: R({ hip: [12, 9], lean: -18, neck: 12, fa: { hand: [27, 40] }, ba: { hand: [21, 46] }, fl: { foot: [48, 6] }, bl: { foot: [44, 3] } }),
    // Kimura: on his knees past their head, their wrist in a figure-four, cranking it back.
    sub_kimura: R({ hip: [-10, 22], lean: 46, neck: 14, fa: { hand: [6, 30] }, ba: { hand: [2, 33] }, fl: [-86, 178], bl: [-96, 182] }),
    sub_kimura2: R({ hip: [-9, 25], lean: 58, neck: 22, fa: { hand: [-4, 24] }, ba: { hand: [-8, 27] }, fl: [-80, 176], bl: [-92, 180] }),
    // Triangle: on his back, legs locked round their head and arm, pulling their head down.
    sub_triangle: R({ hip: [-2, 8], lean: -84, neck: 4, fa: { hand: [6, 40] }, ba: { hand: [2, 36] }, fl: [85, 10], bl: [100, 0] }),
    sub_triangle2: R({ hip: [-2, 12], lean: -76, neck: 10, fa: { hand: [8, 32] }, ba: { hand: [4, 29] }, fl: [80, -2], bl: [96, -10] }),
    // Ground strikes from the mount (the ultimate).
    mount: R({ hip: [0, 20], lean: 10, neck: 6, fa: { hand: [14, 40] }, ba: { hand: [8, 38] }, fl: [-60, -150], bl: [-120, -30] }),
    gnp_c: R({ hip: [0, 22], lean: 0, neck: 0, fa: [100, 150], ba: { hand: [12, 30] }, fl: [-60, -150], bl: [-120, -30] }),
    gnp_x: R({ hip: [0, 19], lean: 30, neck: 14, fa: [-20, -70], ba: { hand: [10, 30] }, fl: [-60, -150], bl: [-120, -30] })
  };
  poses.taunt = poses.flex;

  FG.defineFighter({
    id: 'max', order: 12, student: true,
    homeStage: 'quad',
    glyphs: ['TAP', 'A+', 'FINALS', 'PIN'],
    stringH: 'PALM SHOVE',
    cutIn: { a: 0x2b3a5a, b: 0xffa83a }, // navy and highlighter orange, a wrestling singlet's colours
    finisher: { name: 'ALL-NIGHTER', input: 'D, D, H' },
    ultimate: { name: 'FINALS WEEK', text: 'a double-leg to the mat, the mount and a flurry of ground strikes, then a rear naked choke until they tap', from: 'fH', len: 300,
      hits: [40, 92, 102, 112, 122, 132, 236], weights: [2, 1, 1, 1, 1, 1, 6], end: { gap: 54, down: true } },
    name: 'MAX', nickname: 'HEAVY COURSE LOAD', archetype: 'GRAPPLER', theme: 'HEAVY COURSE LOAD',
    style: 'WRESTLING', signatureMechanic: 'SUBMISSIONS',
    signatureText: 'after any knockdown or takedown, H next to the downed opponent starts a submission: H armbar, D+H rear naked choke, F+H kimura, B+H triangle. A struggle meter: they mash to escape, he mashes to tighten, and when it fills they tap. Double-Leg Takedown (F+H) ducks highs and puts them down; Sprawl (B+K) catches lows, takedowns and throws',
    bio: 'CHILL AND FRIENDLY, BUT STRONG. EVERY FIGHT ENDS ON THE MAT.',
    signature: ['SUBMISSIONS', 'DOUBLE-LEG', 'SPRAWL', 'SNAP DOWN', 'BODY LOCK SUPLEX'],
    submissions: {
      // start: where the struggle meter starts; tighten: each of his presses; drift: a frame.
      armbar: { name: 'ARMBAR', dir: 'n', away: true, start: 35, tighten: 6, drift: 0.3, damage: 24 },
      rnc: { name: 'REAR NAKED CHOKE', dir: 'down', away: true, start: 25, tighten: 6, drift: 0.3, damage: 29 },
      kimura: { name: 'KIMURA', dir: 'fwd', away: true, start: 45, tighten: 6, drift: 0.25, damage: 20 },
      triangle: { name: 'TRIANGLE', dir: 'back', start: 35, tighten: 8, drift: 0.1, damage: 26 }
    },
    scale: 0.95, health: 198,
    walkF: 2.0, walkB: 1.6, dashSpeed: 8.0, dashFrames: 16, backdashSpeed: 7, backdashFrames: 24,
    jumpVy: 8.8, weight: 1.06, react: 0.8,
    walk: { lean: 2, bob: 1.2, rate: 0.2 }, // short shuffling steps, never crossing his feet
    look: {
      skin: 0xe0b090,
      hair: { style: 'wavyShort', color: 0x6a4527 },
      mouth: 'bigsmile', brows: 'normal',
      top: { style: 'tee', color: 0x18181c, sleeves: 'short' },
      legs: 0x4a5266, shoes: 0x3a3a3a,
      build: { torso: 1.06, limb: 1.05 }
    },
    idleAnim: { breath: 1.1, bob: 0.6, sway: 0.8, rate: 0.09 }, // shifting his weight, hands fighting
    poses: poses,
    // How the CPU plays him: hand-fights at close range, shoots takedowns, sprawls on lows,
    // and submits whatever ends up on the floor.
    ai: { spacing: 44, pokes: ['P', 'K', 'D+K', 'F+P'], close: ['P', 'P+K', 'F+H', 'P>P>H', 'F+P', 'K', 'B+P+K', 'D+H', 'F+K', 'P+K'], aggro: 1.1, dashIn: 0.35, sprawl: 0.5, submit: 0.9 },

    moves: FG.kit.moves({
      jab: {
        name: 'Palm Strike', label: 'PALM STRIKE', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 11, active: 2, recovery: 14, damage: 10,
        block: 0, hit: { adv: 7 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 28, y: 52, h: 20 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 11, to: 22, onContact: true }],
        anim: [[1, 'idle'], [7, 'palm_c'], [11, 'palm_x'], [14, 'palm_x'], [26, 'idle']]
      },
      jab2: {
        name: 'Rear Palm', label: 'REAR PALM', cmd: 'P,P', level: 'high', strength: 'medium', motion: 'cross',
        startup: 11, active: 3, recovery: 17, damage: 12,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 32, y: 50, h: 40 }, push: 6, juggle: 3.4, shake: 0.003,
        anim: [[1, 'palm_x'], [6, 'palm2_c'], [11, 'palm2_x'], [14, 'palm2_x'], [30, 'idle']]
      },
      // Knee (K): up the middle, out of a quick collar grab.
      mid: {
        name: 'Knee', label: 'KNEE', cmd: 'K', level: 'mid', strength: 'medium', motion: 'kick',
        startup: 13, active: 3, recovery: 17, damage: 14,
        block: -4, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 26, y: 30, h: 28 }, push: 10, juggle: 3.6, shake: 0.004,
        anim: [[1, 'idle'], [8, 'knee_c'], [13, 'knee_x'], [16, 'knee_x'], [24, 'knee_c'], [33, 'idle']]
      },
      // Collar-Tie Knee (F+K): a step in, the head tied up, the knee to the chin.
      fK: {
        name: 'Collar-Tie Knee', label: 'COLLAR-TIE KNEE', cmd: 'F+K', level: 'mid', strength: 'heavy', motion: 'kick',
        startup: 17, active: 3, recovery: 19, damage: 18,
        block: -6, hit: { adv: 3 }, ch: { knockdown: true },
        hitbox: { x: 18, w: 28, y: 40, h: 36 }, push: 12, juggle: 3.6, shake: 0.006,
        step: [4, 15, 1.8],
        anim: [[1, 'idle'], [10, 'ctk_c'], [17, 'ctk_x'], [20, 'ctk_x'], [28, 'ctk_r'], [36, 'idle']]
      },
      // Sprawl (B+K): his legs kick back and his chest comes down. It catches lows,
      // takedowns and throws (frames 3-16), and turns them into a front headlock that spins
      // them flat to the mat.
      bK: {
        name: 'Sprawl', label: 'SPRAWL', cmd: 'B+K', level: 'mid', strength: 'medium', motion: 'low',
        startup: 30, active: 1, recovery: 4,
        parry: { from: 3, to: 16, levels: ['low'], takedowns: true, counter: 'sprawlX' }, parryLabel: 'SPRAWL!',
        anim: [[1, 'idle'], [3, 'spr_c'], [6, 'spr'], [22, 'spr'], [30, 'spr_c'], [35, 'idle']]
      },
      sprawlX: {
        name: 'Front Headlock', label: 'FRONT HEADLOCK', cmd: '(SPRAWL)', level: 'mid', strength: 'heavy', motion: 'overhead', noTech: true,
        startup: 6, active: 3, recovery: 18, damage: 12,
        block: -4, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 4, w: 40, y: 0, h: 60 }, push: 4, juggle: 3, shake: 0.008,
        anim: [[1, 'spr'], [3, 'sprx_c'], [6, 'sprx_x'], [10, 'sprx_x'], [20, 'crouch'], [27, 'idle']]
      },
      // Snap Down (F+P): both hands on the back of their head, yanked down. Staggers them.
      fP: {
        name: 'Snap Down', label: 'SNAP DOWN', cmd: 'F+P', level: 'high', strength: 'medium', motion: 'overhead',
        startup: 13, active: 3, recovery: 18, damage: 10,
        block: -3, hit: { adv: 15 }, ch: { knockdown: true },
        hitbox: { x: 18, w: 28, y: 52, h: 34 }, push: 2, juggle: 3, shake: 0.005,
        anim: [[1, 'idle'], [8, 'snap_c'], [13, 'snap_x'], [16, 'snap_x'], [26, 'snap_r'], [34, 'idle']]
      },
      // Ankle Pick (D+K): a low snatch at the ankle. On a counter hit they go down.
      low: {
        name: 'Ankle Pick', label: 'ANKLE PICK', cmd: 'D+K', level: 'low', strength: 'medium', motion: 'low', crouching: true, noTech: true,
        startup: 15, active: 3, recovery: 19, damage: 10,
        block: -9, hit: { adv: 2 }, ch: { knockdown: true },
        hitbox: { x: 20, w: 34, y: 0, h: 16 }, push: 6, juggle: 2.5, shake: 0.004,
        step: [6, 14, 1.4],
        anim: [[1, 'crouch'], [9, 'pick_c'], [15, 'pick_x'], [18, 'pick_x'], [27, 'pick_c'], [34, 'crouch']]
      },
      sweep: FG.kit.sweep('FOOT SWEEP', { startup: 21, damage: 16, motion: 'sweep' }),
      // Double Palm (H): both palms into the chest; at the wall it pins them there.
      heavy: {
        ex: { text: 'TWO HITS, WALL SPLAT', multi: 1, wallSplat: true },
        name: 'Double Palm', label: 'DOUBLE PALM', cmd: 'H', level: 'mid', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 18, active: 4, recovery: 21, damage: 22,
        block: -6, hit: { adv: 4 }, ch: { launch: 5.8 },
        hitbox: { x: 16, w: 34, y: 38, h: 30 }, push: 26, juggle: 3.4, carry: 2.2, shake: 0.008,
        step: [9, 18, 1.4],
        anim: [[1, 'idle'], [10, 'dp_c'], [18, 'dp_x'], [22, 'dp_x'], [31, 'dp_r'], [42, 'idle']]
      },
      // Double-Leg Takedown (F+H): ducks under highs (he's low from the first frames) and
      // drives them to the mat. A takedown: a sprawl stops it.
      fH: {
        ex: { text: 'LIFT AND SLAM', damage: 1.6 },
        name: 'Double-Leg Takedown', label: 'DOUBLE-LEG', cmd: 'F+H', level: 'mid', strength: 'heavy', motion: 'lunge',
        crouching: true, takedown: true, noTech: true,
        startup: 18, active: 4, recovery: 22, damage: 18,
        block: -10, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 18, w: 34, y: 0, h: 40 }, push: 4, juggle: 3, shake: 0.01,
        step: [8, 20, 4],
        anim: [[1, 'idle'], [8, 'dl_c'], [18, 'dl_x'], [22, 'dl_lift'], [32, 'dl_r'], [44, 'idle']]
      },
      // Single-Leg (D+H): his launcher. Catches a leg and stands up with it.
      launcher: {
        ex: { text: 'ARMORED', armor: { hits: 1 }, hit: { launch: true } },
        name: 'Single-Leg', label: 'SINGLE-LEG', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher', takedown: true,
        startup: 17, active: 4, recovery: 23, damage: 17,
        block: -15, hit: { launch: 7.8 }, ch: { launch: 8.4 },
        hitbox: { x: 8, w: 38, y: 0, h: 82 }, push: 6, juggle: 5.5, carry: 0.5, shake: 0.009,
        step: [10, 17, 1],
        cancels: [{ btn: 'up', into: 'jump', from: 19, to: 30, onHit: true }],
        anim: [[1, 'crouch'], [9, 'sl_c'], [17, 'sl_x'], [21, 'sl_x'], [31, 'sl_r'], [44, 'idle']]
      }
    },
    FG.kit.air(['FLYING PALM', 'JUMPING KNEE', 'BODY DROP'], { slow: 1 }),
    FG.kit.throws('BODY LOCK SUPLEX', 'ARM DRAG', {
      throw: { damage: 28, shake: 0.012, reverse: true },
      throwB: { damage: 26, reverse: false }
    }),
    FG.kit.wake({ wakeLow: { label: 'STAND-UP' }, wakeMid: { label: 'SWITCH' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'PALM, PALM, SHOVE', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 13: 'P', 26: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'TWO PALMS', difficulty: 'easy', notation: 'P, P', plan: { 0: 'P', 13: 'P' }, hits: ['jab', 'jab2'] },
      { name: 'SINGLE-LEG', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 43: 'P', 56: 'P', 66: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'SNAP DOWN', difficulty: 'medium', notation: 'F+P, P, P, H', plan: { 0: 'F+P', 30: 'P', 45: 'P', 59: 'H' }, hits: ['fP', 'jab', 'jab2', 'jabH'] },
      { name: 'CRAM SESSION', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H',
        plan: { 0: 'D+H', 20: 'UP', 25: 'P', 32: 'K', 40: 'H' }, hits: ['launcher', 'airP', 'airK', 'airH'] },
      { name: 'DOUBLE MAJOR', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 43: 'P', 56: 'P', 66: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: 'FINALS WEEK', difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'wave'], [40, 'wave'], [50, 'knees'], [62, 'slap'], [70, 'knees'], [78, 'slap'], [90, 'idle']],
    victory: [[1, 'stand'], [14, 'flex'], [46, 'flex'], [56, 'yawn'], [80, 'yawn'], [90, 'wave'], [110, 'wave']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { yawn: [[1, 'idle'], [10, 'yawn'], [34, 'yawn'], [44, 'idle']] },
    bigHit: { gesture: 'yawn' },
    talk: {
      lines: ['Hope you did the reading.', "Let's take this to the mat.", "Let's get this over with."],
      quips: ['Tap.', 'Read the chapter.', 'Easy A.', 'Oops.']
    },
    victoryLines: ['Heavy course load.', "Should've tapped sooner.", 'Nap time.']
  });
})();
