// HUDSON — Defensive / Counterpuncher — "CALCULATOR KID". A 10th grader who already did
// the homework, and a boxer who lets you make the mistake. Low, bent at the waist, lead
// hand down across his body (a shoulder roll), always bobbing.
//
// Moves: Jab (P), Double Jab (P, P), Lead Hook (P, P, P), Rear Uppercut (D+P), Shovel
// Hook (F+P), Overhand Right (F+H), Check Hook (B+H: pivots away as it lands), Bolo
// Punch (D+H, his launcher), Pull Counter (B+P: leans back, then the right hand), Body
// Jab (K), and one stomp for lows (D/B+K). Not a LEE: no peekaboo rush. He waits, makes
// you miss, and makes you pay.
//
// Head movement: Slip (F+K), Duck (D+K), Weave (B+K), Lean Back (B+P+K). Dodges chain
// into each other and into any punch (move.dodge).
// Signature: COUNTERPUNCHER. A dodge that makes something miss turns the next thing he
// lands (within COUNTER_FRAMES) into a counter hit, with a big flash.
(function () {
  // A 10th grader: shorter limbs than the teachers, a little lanky.
  var R = FG.rigger({ torso: 25, neck: 11.5, upper: 14.5, fore: 12.5, thigh: 23, shin: 23 });
  var hands = function (fx, fy, bx, by) { return { fa: { hand: [fx, fy] }, ba: { hand: [bx, by] } }; };
  var pose = function (spec, h) { return R(Object.assign(spec, h || {})); };
  var SHELL = hands(15, 45, 18, 68);    // lead hand low across the belly, rear glove at the chin
  var FEET = { fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } };

  var poses = {
    // The shoulder roll: bent at the waist, lead shoulder up, chin tucked behind it.
    idle: pose(Object.assign({ hip: [0, 39], lean: 22, neck: -8 }, FEET), SHELL),
    stand: R({ hip: [0, 45], lean: 0, fa: [-88, -80], ba: [-92, -84], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    // Arms folded, weight on one leg: "I'll wait."
    wait: R({ hip: [0, 45], lean: -2, neck: -4, fa: { hand: [8, 64] }, ba: { hand: [10, 62] }, fl: { foot: [6, 0] }, bl: { foot: [-7, 0] } }),
    // Holding up his calculator, checking the answer.
    check: R({ hip: [0, 45], lean: 2, neck: 8, fa: { hand: [14, 66] }, ba: { hand: [10, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    type1: R({ hip: [0, 45], lean: 6, neck: 10, fa: { hand: [16, 62] }, ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    type2: R({ hip: [0, 45], lean: 6, neck: 10, fa: { hand: [15, 58] }, ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    enter: R({ hip: [0, 45], lean: 4, neck: 4, fa: [10, 30], ba: { hand: [12, 60] }, fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    // A gold star, held up for the class.
    star: R({ hip: [0, 45], lean: -2, neck: -6, fa: [60, 70], ba: [-95, -84], fl: { foot: [6, 0] }, bl: { foot: [-6, 0] } }),
    nod: R({ hip: [0, 45], lean: 4, neck: 12, fa: [-88, -80], ba: [-92, -84], fl: { foot: [5, 0] }, bl: { foot: [-5, 0] } }),
    hands: R({ hip: [0, 42], lean: 14, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 32] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),
    hands2: R({ hip: [0, 41], lean: 18, neck: 14, fa: { hand: [10, 33] }, ba: { hand: [4, 31] }, fl: { foot: [8, 0] }, bl: { foot: [-8, 0] } }),

    // Movement: short steps, the shell never opens.
    crouch: pose({ hip: [0, 25], lean: 26, neck: -4, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(17, 38, 19, 54)),
    squat: pose({ hip: [0, 31], lean: 22, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }, hands(15, 40, 18, 59)),
    jump: pose({ hip: [0, 42], lean: 10, fl: [-30, -110], bl: [-100, -70] }, hands(14, 52, 14, 72)),
    dash: pose({ hip: [4, 36], lean: 28, neck: -8, fl: { foot: [16, 0] }, bl: { foot: [-14, 5] } }, hands(20, 46, 22, 64)),
    backdash: pose({ hip: [-3, 40], lean: 8, neck: -4, fl: { foot: [12, 5] }, bl: { foot: [-15, 0] } }, hands(12, 46, 12, 68)),
    sidestep: pose({ hip: [0, 33], lean: 24, neck: -6, fl: { foot: [10, 0] }, bl: { foot: [-10, 0] } }, hands(15, 42, 18, 62)),
    // Guard: the shoulder up, the rear glove catching.
    block: pose({ hip: [-2, 38], lean: 18, neck: 4, fl: { foot: [11, 0] }, bl: { foot: [-14, 0] } }, hands(15, 56, 14, 68)),
    cblock: pose({ hip: [-2, 24], lean: 24, neck: 2, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(16, 42, 17, 52)),
    hit_high: R({ hip: [-3, 42], lean: -14, neck: -16, fa: [50, -10], ba: { hand: [4, 62] }, fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }),
    hit_mid: R({ hip: [-4, 36], lean: 34, neck: 12, fa: { hand: [10, 34] }, ba: { hand: [4, 36] }, fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    hit_low: R({ hip: [-2, 36], lean: 14, fa: { hand: [14, 48] }, ba: { hand: [8, 60] }, fl: [-50, -110], bl: { foot: [-13, 0] } }),
    gbreak: R({ hip: [-4, 43], lean: -14, neck: -8, fa: [40, 100], ba: [60, 120], fl: { foot: [12, 0] }, bl: { foot: [-16, 0] } }),
    juggle: R({ hip: [0, 22], lean: -56, neck: -14, fa: [70, 130], ba: [100, 150], fl: [40, -20], bl: [10, -50] }),
    down: R({ hip: [0, 6], lean: -86, fa: [110, 170], ba: [-170, -130], fl: [14, -14], bl: [-6, 6] }),

    // Jab (P): flicked up from the low lead hand.
    jab_c: pose({ hip: [0, 39], lean: 20, neck: -8, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(17, 48, 18, 68)),
    jab_x: R({ hip: [4, 39], lean: 24, neck: -10, fa: [12, 6], ba: { hand: [21, 67] }, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }),
    // Double Jab (P, P): the second one steps in behind the first.
    jab2_c: pose({ hip: [3, 39], lean: 22, neck: -8, fl: { foot: [15, 0] }, bl: { foot: [-11, 0] } }, hands(20, 52, 20, 67)),
    jab2_x: R({ hip: [8, 39], lean: 26, neck: -10, fa: [8, 4], ba: { hand: [25, 66] }, fl: { foot: [20, 0] }, bl: { foot: [-7, 1] } }),
    // Lead Hook (P, P, P): the lead elbow comes up and the hips snap round.
    hook_c: pose({ hip: [3, 39], lean: 18, neck: -6, fl: { foot: [16, 0] }, bl: { foot: [-9, 0] } }, hands(16, 54, 19, 67)),
    hook_x: R({ hip: [4, 39], lean: 28, neck: -8, fa: { hand: [27, 62], bend: 1 }, ba: { hand: [22, 66] }, fl: { foot: [14, 1] }, bl: { foot: [-11, 0] } }),
    // Body Jab (K): dropping the level, the jab to the stomach.
    bj_c: pose({ hip: [0, 32], lean: 30, neck: -10, fl: { foot: [14, 0] }, bl: { foot: [-13, 0] } }, hands(18, 40, 20, 58)),
    bj_x: R({ hip: [6, 30], lean: 36, neck: -12, fa: [-6, -2], ba: { hand: [27, 56] }, fl: { foot: [19, 0] }, bl: { foot: [-11, 0] } }),
    // Rear Uppercut (D+P): sinking on the rear leg, then up through the middle.
    upc_c: pose({ hip: [-2, 32], lean: 30, neck: -6, fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }, hands(13, 44, 7, 40)),
    upc_x: R({ hip: [4, 41], lean: 6, neck: -10, fa: { hand: [14, 48] }, ba: [40, 95], fl: { foot: [13, 0] }, bl: { foot: [-11, 2] } }),
    // Shovel Hook (F+P): half hook, half uppercut, into the liver.
    shv_c: pose({ hip: [0, 34], lean: 30, neck: -8, fl: { foot: [13, 0] }, bl: { foot: [-13, 0] } }, hands(10, 34, 19, 62)),
    shv_x: R({ hip: [5, 33], lean: 34, neck: -8, fa: { hand: [26, 40], bend: -1 }, ba: { hand: [24, 60] }, fl: { foot: [16, 0] }, bl: { foot: [-11, 0] } }),
    // Overhand Right (F+H): the rear hand looping over the top, all his weight behind it.
    ovh_c: R({ hip: [-3, 40], lean: 8, neck: -6, fa: { hand: [14, 48] }, ba: [150, 100], fl: { foot: [12, 0] }, bl: { foot: [-15, 0] } }),
    ovh_x: R({ hip: [8, 35], lean: 42, neck: 6, fa: { hand: [10, 44] }, ba: [24, -24], fl: { foot: [20, 0] }, bl: { foot: [-9, 2] } }),
    ovh_r: pose({ hip: [6, 36], lean: 32, neck: -4, fl: { foot: [17, 0] }, bl: { foot: [-11, 0] } }, hands(18, 46, 24, 62)),
    // Check Hook (B+H): the lead hook as he pivots off the line, away from their rush.
    chk_c: pose({ hip: [0, 39], lean: 20, neck: -6, fl: { foot: [12, 0] }, bl: { foot: [-13, 0] } }, hands(16, 52, 18, 67)),
    chk_x: R({ hip: [-6, 40], lean: 16, neck: -6, fa: { hand: [22, 62], bend: 1 }, ba: { hand: [9, 68] }, fl: { foot: [6, 0] }, bl: { foot: [-20, 0] } }),
    // Bolo Punch (D+H): the arm winds down and round, and comes up under the chin.
    bolo_c: R({ hip: [-2, 33], lean: 22, neck: -6, fa: { hand: [13, 46] }, ba: [-150, -110], fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }),
    bolo_x: R({ hip: [5, 41], lean: 4, neck: -10, fa: { hand: [13, 50] }, ba: [-20, 70], fl: { foot: [15, 0] }, bl: { foot: [-11, 2] } }),
    bolo_r: pose({ hip: [3, 40], lean: 10, neck: -6, fl: { foot: [13, 0] }, bl: { foot: [-12, 0] } }, hands(13, 48, 18, 70)),
    // Right Hand (H): the rear straight, the hips through.
    rh_c: pose({ hip: [-2, 39], lean: 18, neck: -8, fl: { foot: [12, 0] }, bl: { foot: [-14, 0] } }, hands(15, 46, 14, 66)),
    rh_x: R({ hip: [7, 39], lean: 30, neck: -8, fa: { hand: [12, 48] }, ba: [6, 2], fl: { foot: [17, 0] }, bl: { foot: [-8, 2] } }),
    // Stomp (D/B+K): his one low, the heel on their lead foot.
    stomp_c: pose({ hip: [0, 41], lean: 14, neck: -6, fl: [60, -60], bl: { foot: [-13, 0] } }, hands(15, 46, 15, 68)),
    stomp_x: pose({ hip: [3, 36], lean: 24, neck: -8, fl: { foot: [24, 0] }, bl: { foot: [-13, 0] } }, hands(17, 42, 20, 64)),
    // Head movement. Slip (F+K): the head off the line and forward, inside their punch.
    slip: pose({ hip: [6, 34], lean: 36, neck: 6, fl: { foot: [18, 0] }, bl: { foot: [-10, 0] } }, hands(24, 46, 27, 60)),
    // Duck (D+K): straight down under it.
    duck: pose({ hip: [0, 22], lean: 36, neck: -6, fl: { foot: [14, 0] }, bl: { foot: [-14, 0] } }, hands(22, 46, 24, 52)),
    // Weave (B+K): down, under and up the other side, giving a little ground.
    weave1: pose({ hip: [-3, 30], lean: 30, neck: 4, fl: { foot: [11, 0] }, bl: { foot: [-15, 0] } }, hands(18, 50, 20, 56)),
    weave2: pose({ hip: [-5, 24], lean: 38, neck: 8, fl: { foot: [10, 0] }, bl: { foot: [-16, 0] } }, hands(20, 44, 22, 50)),
    weave3: pose({ hip: [-6, 32], lean: 26, neck: -2, fl: { foot: [9, 0] }, bl: { foot: [-17, 0] } }, hands(14, 50, 15, 62)),
    // Lean Back (B+P+K): the upper body leans away, the weight on the back foot.
    lean: pose({ hip: [-5, 41], lean: -22, neck: -10, fl: { foot: [10, 0] }, bl: { foot: [-15, 0] } }, hands(12, 52, 6, 62)),

    air_p: R({ hip: [0, 44], lean: 10, fa: [-10, -30], ba: { hand: [8, 64] }, fl: [-30, -110], bl: [-110, -70] }),
    air_k: R({ hip: [0, 44], lean: 4, fa: { hand: [14, 50] }, ba: [10, 0], fl: [-30, -110], bl: [-110, -70] }),
    air_hc: R({ hip: [0, 46], lean: -8, fa: { hand: [14, 52] }, ba: [150, 110], fl: [-30, -110], bl: [-110, -70] }),
    air_hx: R({ hip: [0, 44], lean: 30, fa: { hand: [12, 48] }, ba: [-10, -60], fl: [-30, -110], bl: [-110, -70] }),

    // Throw: a clinch, a spin, and down.
    grab_c: R({ hip: [2, 40], lean: 16, fa: { hand: [22, 58] }, ba: { hand: [14, 60] }, fl: { foot: [12, 0] }, bl: { foot: [-12, 0] } }),
    grab_x: R({ hip: [4, 40], lean: 18, fa: { hand: [26, 58] }, ba: { hand: [22, 58] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 0] } }),
    throw_lift: R({ hip: [0, 42], lean: -6, fa: [60, 80], ba: { hand: [14, 66] }, fl: { foot: [10, 0] }, bl: { foot: [-12, 0] } }),
    throw_slam: R({ hip: [6, 32], lean: 34, fa: { hand: [30, 18] }, ba: { hand: [24, 24] }, fl: { foot: [18, 0] }, bl: { foot: [-12, 0] } }),
    throw_back: R({ hip: [-2, 42], lean: -14, fa: [140, 170], ba: [120, 160], fl: { foot: [8, 0] }, bl: { foot: [-15, 0] } }),
    wake_low: R({ hip: [-2, 8], lean: -58, fa: { hand: [-14, 0] }, ba: { hand: [-20, 0] }, fl: { foot: [40, 6] }, bl: { foot: [4, 0] } }),
    wake_mid: R({ hip: [3, 42], lean: 14, fa: [-10, -10], ba: { hand: [6, 64] }, fl: { foot: [14, 0] }, bl: { foot: [-12, 3] } })
  };
  poses.taunt = poses.wait;

  // A dodge: no hitbox; it makes attacks of `levels` miss on frames from..to, and from
  // frame `from` it can come out of itself into another dodge or any attack.
  function dodge(name, label, cmd, total, ev, from, anim, extra) {
    return Object.assign({ name: name, label: label, cmd: cmd, level: 'mid', strength: 'light', motion: 'dodge',
      startup: total, active: 1, recovery: 1, evade: ev, dodge: { from: from }, anim: anim }, extra || {});
  }

  FG.defineFighter({
    id: 'hudson', order: 14, student: true,
    homeStage: 'lab',
    glyphs: ['MISS', 'CORRECT', 'QED', '100%', 'ANS'],
    stringH: 'UPPERCUT',
    cutIn: { a: 0x22262e, b: 0x8ae0b0 }, // calculator gray and LCD green
    finisher: { name: 'EXTRA CREDIT', input: 'B, F, P' },
    ultimate: { name: "CAN'T TOUCH THIS", text: 'he slips a whole flurry in slow motion, then counters: body, body, head, and an uppercut that lifts them off the floor', from: 'jab', len: 290,
      hits: [168, 180, 192, 204, 232], weights: [1, 1, 1, 1, 6], end: { gap: 70, launch: 6, height: 50 } },
    name: 'HUDSON', nickname: 'CALCULATOR KID', archetype: 'COUNTERPUNCHER', theme: 'CALCULATORS',
    style: 'BOXING', signatureMechanic: 'COUNTERPUNCHER',
    signatureText: 'head movement: Slip (F+K), Duck (D+K), Weave (B+K) and Lean Back (B+P+K) make highs (and, leaning back, mids) miss, chain into each other and into any punch. Anything he lands right after a dodge that made them miss is a counter hit. Pull Counter (B+P) leans back and fires the right hand; Check Hook (B+H) pivots away as it lands',
    bio: 'CALM AND PRECISE. ALREADY FINISHED THE HOMEWORK.',
    signature: ['COUNTERPUNCHER', 'SLIP', 'PULL COUNTER', 'CHECK HOOK', 'BOLO PUNCH'],
    counterpuncher: true,
    scale: 0.93, health: 232,
    walkF: 2.3, walkB: 1.9, dashSpeed: 8.0, dashFrames: 15, backdashSpeed: 9.0,
    jumpVy: 9.2, weight: 1.0, react: 0.95,
    walk: { lean: 2, bob: 1.6, rate: 0.24 }, // bobbing as he steps
    look: {
      skin: 0xe6c29e,
      hair: { style: 'straight', color: 0x121214 },
      mouth: 'calm', brows: 'normal',
      top: { style: 'tee', color: 0xf2f2f0, sleeves: 'short' },
      legs: 0x2c3444, shoes: 0x2a2a2e,
      build: { torso: 0.9, limb: 0.93 }
    },
    idleAnim: { breath: 0.6, bob: 2.4, sway: 1.4, rate: 0.12 }, // bobbing and rolling the shoulder
    poses: poses,
    // How the CPU plays him: waits in the shell, makes highs and mids miss with his head
    // and counters (the counter hit is automatic), pokes the body, and punishes.
    ai: { spacing: 52, pokes: ['P', 'K', 'P', 'F+P', 'P>P'], close: ['P>P>P', 'P>P>H', 'F+K>P', 'D+P', 'F+P', 'B+K>H', 'B+H', 'F+H', 'B+P', 'D+H', 'P+K', 'D+K>D+P', 'D/B+K', 'K', 'F+K>F+P'], aggro: 1.15, dashIn: 0.4, dodge: 0.7 },

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'JAB', cmd: 'P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 13, damage: 9,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 18, w: 38, y: 52, h: 24 }, push: 5, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 9, to: 20, onContact: true }],
        anim: [[1, 'idle'], [6, 'jab_c'], [9, 'jab_x'], [12, 'jab_x'], [22, 'idle']]
      },
      jab2: {
        name: 'Double Jab', label: 'DOUBLE JAB', cmd: 'P,P', level: 'high', strength: 'light', motion: 'jab',
        startup: 9, active: 2, recovery: 15, damage: 8,
        block: -1, hit: { adv: 6 }, ch: { adv: 9 },
        hitbox: { x: 18, w: 32, y: 50, h: 44 }, push: 6, juggle: 3.4,
        cancels: [{ btn: 'p', into: 'jab3', from: 9, to: 20, onContact: true }],
        anim: [[1, 'jab_x'], [5, 'jab2_c'], [9, 'jab2_x'], [12, 'jab2_x'], [24, 'idle']]
      },
      jab3: {
        name: 'Lead Hook', label: 'LEAD HOOK', cmd: 'P,P,P', level: 'high', strength: 'medium', motion: 'hook',
        startup: 11, active: 3, recovery: 18, damage: 14,
        block: -5, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 30, y: 52, h: 30 }, push: 14, juggle: 3.4, carry: 1.2, shake: 0.004,
        anim: [[1, 'jab2_x'], [6, 'hook_c'], [11, 'hook_x'], [14, 'hook_x'], [24, 'hook_c'], [31, 'idle']]
      },
      // Body Jab (K): the level drops, the jab goes to the stomach.
      mid: {
        name: 'Body Jab', label: 'BODY JAB', cmd: 'K', level: 'mid', strength: 'light', motion: 'jab',
        startup: 11, active: 2, recovery: 15, damage: 10,
        block: -2, hit: { adv: 5 }, ch: { adv: 8 },
        hitbox: { x: 20, w: 36, y: 26, h: 22 }, push: 6, juggle: 3.4,
        anim: [[1, 'idle'], [6, 'bj_c'], [11, 'bj_x'], [14, 'bj_x'], [26, 'idle']]
      },
      // Rear Uppercut (D+P): up the middle (it hits crouching opponents).
      dP: {
        name: 'Rear Uppercut', label: 'REAR UPPERCUT', cmd: 'D+P', level: 'mid', strength: 'medium', motion: 'launcher',
        startup: 13, active: 3, recovery: 18, damage: 16,
        block: -6, hit: { adv: 4 }, ch: { launch: 5.4 },
        hitbox: { x: 12, w: 26, y: 30, h: 50 }, push: 8, juggle: 4, shake: 0.004,
        anim: [[1, 'idle'], [7, 'upc_c'], [13, 'upc_x'], [16, 'upc_x'], [26, 'upc_c'], [33, 'idle']]
      },
      // Shovel Hook (F+P): to the liver; plus on block.
      fP: {
        name: 'Shovel Hook', label: 'SHOVEL HOOK', cmd: 'F+P', level: 'mid', strength: 'medium', motion: 'hook',
        startup: 13, active: 3, recovery: 15, damage: 14,
        block: 1, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 16, w: 34, y: 28, h: 26 }, push: 8, juggle: 3.4, shake: 0.004,
        step: [4, 12, 1.2],
        anim: [[1, 'idle'], [7, 'shv_c'], [13, 'shv_x'], [16, 'shv_x'], [25, 'shv_c'], [31, 'idle']]
      },
      // Pull Counter (B+P): he leans back out of it (highs and mids), then the right hand.
      bP: {
        ex: { text: 'KNOCKDOWN', hit: { knockdown: true } },
        name: 'Pull Counter', label: 'PULL COUNTER', cmd: 'B+P', level: 'high', strength: 'heavy', motion: 'cross',
        startup: 17, active: 3, recovery: 16, damage: 15,
        block: -5, hit: { adv: 4 }, ch: { knockdown: true },
        evade: { from: 2, to: 11, levels: ['high', 'mid'] },
        hitbox: { x: 16, w: 32, y: 50, h: 28 }, push: 14, juggle: 3.4, carry: 1.2, shake: 0.006,
        step: [12, 17, 2.4],
        anim: [[1, 'idle'], [3, 'lean'], [11, 'lean'], [17, 'rh_x'], [20, 'rh_x'], [29, 'rh_c'], [36, 'idle']]
      },
      // Stomp (D/B+K): his one low.
      sweep: {
        name: 'Stomp', label: 'STOMP', cmd: 'D/B+K', level: 'low', strength: 'medium', motion: 'low',
        startup: 13, active: 3, recovery: 18, damage: 10,
        block: -9, hit: { adv: 2 }, ch: { adv: 6 },
        hitbox: { x: 16, w: 28, y: 0, h: 14 }, push: 6, juggle: 2.5, shake: 0.004,
        anim: [[1, 'idle'], [7, 'stomp_c'], [13, 'stomp_x'], [16, 'stomp_x'], [24, 'stomp_c'], [31, 'idle']]
      },
      // Right Hand (H): the rear straight.
      heavy: {
        name: 'Right Hand', label: 'RIGHT HAND', cmd: 'H', level: 'high', strength: 'heavy', motion: 'straight', wallSplat: true,
        startup: 15, active: 3, recovery: 19, damage: 21,
        block: -5, hit: { adv: 5 }, ch: { launch: 5.6 },
        hitbox: { x: 16, w: 40, y: 48, h: 30 }, push: 20, juggle: 3.4, carry: 1.8, shake: 0.006,
        step: [6, 15, 1.2],
        anim: [[1, 'idle'], [8, 'rh_c'], [15, 'rh_x'], [18, 'rh_x'], [27, 'rh_c'], [36, 'idle']]
      },
      // Overhand Right (F+H): looping over the top, his whole weight behind it.
      fH: {
        ex: { text: 'TWO OVERHANDS', multi: 1 },
        name: 'Overhand Right', label: 'OVERHAND RIGHT', cmd: 'F+H', level: 'high', strength: 'heavy', motion: 'overhead',
        startup: 19, active: 3, recovery: 19, damage: 24,
        block: -6, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 14, w: 32, y: 44, h: 40 }, push: 18, juggle: 3.4, carry: 1.4, shake: 0.008,
        step: [8, 19, 1.8],
        anim: [[1, 'idle'], [9, 'ovh_c'], [19, 'ovh_x'], [22, 'ovh_x'], [31, 'ovh_r'], [41, 'idle']]
      },
      // Check Hook (B+H): the lead hook as he pivots away: it stops a rush.
      bH: {
        name: 'Check Hook', label: 'CHECK HOOK', cmd: 'B+H', level: 'high', strength: 'heavy', motion: 'hook',
        startup: 12, active: 3, recovery: 18, damage: 17,
        block: -4, hit: { adv: 4 }, ch: { knockdown: true, carry: 1.2 },
        hitbox: { x: 10, w: 36, y: 50, h: 30 }, push: 16, juggle: 3.4, carry: 1.2, shake: 0.006,
        step: [13, 24, -1.6], // the pivot away comes as it lands
        anim: [[1, 'idle'], [6, 'chk_c'], [12, 'chk_x'], [15, 'chk_x'], [24, 'chk_c'], [31, 'idle']]
      },
      // Bolo Punch (D+H): his launcher.
      launcher: {
        ex: { text: 'ARMORED', armor: { hits: 1 }, hit: { launch: true } },
        name: 'Bolo Punch', label: 'BOLO PUNCH', cmd: 'D+H', level: 'mid', strength: 'launch', motion: 'launcher',
        startup: 16, active: 4, recovery: 22, damage: 15,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 30, y: 28, h: 80 }, push: 6, juggle: 5.5, carry: 0.3, shake: 0.008,
        step: [9, 16, 1.6],
        cancels: [{ btn: 'up', into: 'jump', from: 18, to: 29, onHit: true }],
        anim: [[1, 'crouch'], [8, 'bolo_c'], [16, 'bolo_x'], [20, 'bolo_x'], [30, 'bolo_r'], [42, 'idle']]
      },
      // Head movement: dodges (no hitbox). They chain, and come out into any punch.
      fK: dodge('Slip', 'SLIP', 'F+K', 18, { from: 2, to: 13, levels: ['high'] }, 7,
        [[1, 'idle'], [4, 'slip'], [13, 'slip'], [19, 'idle']], { step: [2, 10, 1.6] }),
      low: dodge('Duck', 'DUCK', 'D+K', 20, { from: 1, to: 15, levels: ['high'] }, 8,
        [[1, 'idle'], [4, 'duck'], [15, 'duck'], [21, 'idle']], { crouching: true }),
      bK: dodge('Weave', 'WEAVE', 'B+K', 20, { from: 3, to: 15, levels: ['high'] }, 9,
        [[1, 'idle'], [5, 'weave1'], [10, 'weave2'], [16, 'weave3'], [21, 'idle']], { step: [2, 14, -1] })
    },
    FG.kit.air(['FLYING JAB', 'DROP HOOK', 'OVERHAND DROP']),
    FG.kit.throws('CLINCH AND SPIN', 'SPIN OUT', { throw: { damage: 30 } }),
    // Lean Back (B+P+K) takes the place of a back throw.
    { throwB: dodge('Lean Back', 'LEAN BACK', 'B+P+K', 22, { from: 2, to: 14, levels: ['high', 'mid'] }, 10,
      [[1, 'idle'], [3, 'lean'], [14, 'lean'], [23, 'idle']], { step: [1, 10, -1.4] }) },
    FG.kit.wake({ wakeLow: { label: 'STILL COUNTING' }, wakeMid: { label: 'UP AT EIGHT' } }),
    FG.kit.taunt()),

    combos: [
      { name: 'JAB, JAB, HOOK', difficulty: 'easy', notation: 'P, P, P', plan: { 0: 'P', 12: 'P', 24: 'P' }, hits: ['jab', 'jab2', 'jab3'] },
      { name: 'DOUBLE JAB, UPPERCUT', difficulty: 'easy', notation: 'P, P, H', plan: { 0: 'P', 12: 'P', 24: 'H' }, hits: ['jab', 'jab2', 'jabH'] },
      { name: 'BOLO', difficulty: 'medium', notation: 'D+H, P, P, H', plan: { 0: 'D+H', 42: 'P', 54: 'P', 64: 'H' }, hits: ['launcher', 'jab', 'jab2', 'jabH'] },
      { name: 'SHOW YOUR WORK', difficulty: 'hard', notation: 'D+H, UP, AIR P, AIR K, AIR H',
        plan: { 0: 'D+H', 17: 'UP', 30: 'P', 37: 'K', 44: 'H' }, hits: ['launcher', 'airP', 'airK', 'airH'] },
      { name: 'ARMORED BOLO', difficulty: 'medium', meter: 1, notation: 'D+H, P+K, P, P, H', steps: ['D+H, P+K (1 BAR)', 'P', 'P', 'H'],
        plan: { 0: 'D+H', 3: 'P+K', 42: 'P', 54: 'P', 64: 'H' }, hits: ['launcherEX', 'jab', 'jab2', 'jabH'] },
      { name: "CAN'T TOUCH THIS", difficulty: 'hard', meter: 3, notation: 'P, D, D/F, F+P+K+H', plan: { 0: 'P', 3: 'D', 4: 'D/F', 5: 'F', 9: 'F+P+K+H' }, hits: ['jab', 'ultimate'] }
    ],

    intro: [[1, 'stand'], [14, 'check'], [40, 'type1'], [44, 'type2'], [48, 'type1'], [52, 'enter'], [66, 'wait'], [86, 'idle']],
    victory: [[1, 'stand'], [12, 'check'], [40, 'nod'], [52, 'nod'], [60, 'wait'], [110, 'wait']],
    defeat: [[1, 'hands'], [40, 'hands2'], [80, 'hands']],
    gestures: { nod: [[1, 'idle'], [8, 'nod'], [22, 'nod'], [30, 'idle']] },
    bigHit: { gesture: 'nod' },
    talk: {
      lines: ['Already did the homework.', "You'll miss.", "I'll wait."],
      quips: ['Missed.', 'Correct.', 'Show your work.', 'Too slow.']
    },
    victoryLines: ['Checked my answer. Still right.', "Couldn't touch me.", 'Extra credit.']
  });
})();
