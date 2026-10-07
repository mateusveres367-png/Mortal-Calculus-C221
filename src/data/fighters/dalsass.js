// DALSASS — Tricky — Functions. Mixups from two angles: the Function Feint
// (an overhead windup that can turn into a jab, a low, a throw or the real
// overhead) and the Piecewise stance, which swaps his P/K/H for a second set.
(function () {
  var P = FG.pose;

  var stance = P('idle', { hip: [-1, 44], lean: -4, fe: [14, 58], fh: [20, 66], be: [0, 58], bh: [8, 64], fk: [10, 22], ff: [16, 0], bk: [-10, 22], bf: [-18, 0] });
  var pw = P('crouch', { all: [0, 6], fe: [18, 52], fh: [26, 58], be: [-8, 50], bh: [-16, 56] });

  var poses = {
    idle: stance,
    pw_idle: pw,
    point: P(stance, { fe: [22, 74], fh: [40, 78] }),
    shrug: P(stance, { fe: [14, 70], fh: [22, 78], be: [-10, 70], bh: [-18, 78] }),
    wag: P(stance, { fe: [12, 70], fh: [16, 88] }),
    wag2: P(stance, { fe: [12, 70], fh: [21, 87] }),
    guns: P(stance, { fe: [22, 72], fh: [38, 74], be: [14, 70], bh: [32, 70] }),
    guns2: P(stance, { fe: [22, 74], fh: [38, 80], be: [14, 72], bh: [32, 76] }),
    sit: [0, 10, -4, 36, -2, 48, 6, 28, 12, 20, -12, 26, -18, 14, 18, 24, 30, 2, 12, 20, 24, 0],
    sit2: [0, 10, -5, 35, -4, 46, 6, 28, 12, 20, -12, 26, -18, 14, 18, 24, 30, 2, 12, 20, 24, 0],
    feint_c: P('slam_c', { lean: -6 }),
    feint_x: P(stance, { fe: [12, 72], fh: [18, 84], bh: [6, 76] }),
    spin: P('idle', { fe: [-6, 70], fh: [-14, 78], be: [10, 70], bh: [18, 78] }),
    pw_palm: P(pw, { lean: 10, fe: [24, 58], fh: [40, 60] }),
    axe_c: P('idle', { lean: -10, fk: [20, 80], ff: [26, 104] }),
    axe_x: P('idle', { lean: 6, fk: [26, 50], ff: [44, 40] }),
    slide: P('sweep_x', { all: [0, -6], lean: -20, fk: [24, 8], ff: [50, 4] })
  };

  poses.taunt = poses['wag'];

  FG.defineFighter({
    id: 'dalsass', order: 3,
    name: 'DALSASS', archetype: 'TRICKY', theme: 'FUNCTIONS',
    bio: "HAPPY, SASSY, EVERYONE'S FAVORITE. FAKES YOU OUT WITH A GRIN.",
    signature: ['PIECEWISE', 'FUNCTION FEINT', 'ASYMPTOTE SLIDE', 'DISCONTINUITY', 'CONTRADICTION'],
    scale: 1.0, health: 170,
    walkF: 1.9, walkB: 1.7, dashSpeed: 8.0, backdashSpeed: 8.8,
    crowdFavorite: true, // the background students cheer louder for him
    look: {
      skin: 0xe0ac7e,
      hair: { style: 'spiky', color: 0x5a3a22 },
      beard: { style: 'goatee', color: 0x8a7d70 },
      mouth: 'grin', lines: true,
      top: { style: 'polo', color: 0x9fe0d8, pattern: 'stripes', patternColor: 0xf2fbfa, sleeves: 'short' },
      legs: 0xb59a72, shoes: 0x5a3a22,
      build: { torso: 1.12, limb: 1.05 }
    },
    idleAnim: { breath: 1.4, sway: 1.5, rate: 0.07 },
    poses: poses,

    moves: FG.kit.moves({
      jab: {
        name: 'Jab', label: 'DOMAIN JAB', cmd: 'P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 13, damage: 7,
        block: 1, hit: { adv: 8 }, ch: { adv: 10 },
        hitbox: { x: 22, w: 26, y: 70, h: 14 }, push: 6, juggle: 3.2,
        cancels: [{ btn: 'p', into: 'jab2', from: 10, to: 22 }],
        anim: [[1, 'idle'], [7, 'jab_c'], [10, 'jab_x'], [13, 'jab_x'], [24, 'idle']]
      },
      jab2: {
        name: 'Jab 2', label: 'RANGE CROSS', cmd: 'P,P', level: 'high', strength: 'light',
        startup: 10, active: 2, recovery: 17, damage: 10,
        block: -4, hit: { adv: 5 }, ch: { adv: 9 },
        hitbox: { x: 26, w: 26, y: 68, h: 14 }, push: 9, juggle: 3.4,
        // Into the feint straight from the string: P, P, F+H.
        cancels: [{ btn: 'h', into: 'fH', from: 10, to: 24 }],
        anim: [[1, 'jab_x'], [6, 'cross_c'], [10, 'cross_x'], [13, 'cross_x'], [28, 'idle']]
      },
      mid: {
        name: 'Mid Kick', label: 'FUNCTION KICK', cmd: 'K', level: 'mid', strength: 'medium',
        startup: 15, active: 3, recovery: 19, damage: 15,
        block: -7, hit: { adv: 4 }, ch: { adv: 9 },
        hitbox: { x: 34, w: 28, y: 34, h: 22 }, push: 16, juggle: 3.8, shake: 0.003,
        anim: [[1, 'idle'], [10, 'sk_c'], [15, 'sk_x'], [18, 'sk_x'], [26, 'sk_c'], [37, 'idle']]
      },
      low: {
        name: 'Low Kick', label: 'FLOOR FUNCTION', cmd: 'D+K', level: 'low', strength: 'medium',
        startup: 16, active: 3, recovery: 20, damage: 10, crouching: true, tracks: true, otg: true,
        block: -11, hit: { adv: 0 }, ch: { adv: 6 },
        hitbox: { x: 28, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'crouch'], [11, 'lk_c'], [16, 'lk_x'], [19, 'lk_x'], [29, 'lk_c'], [38, 'crouch']]
      },
      sweep: FG.kit.sweep('ROOT SWEEP', { startup: 21, recovery: 26 }),
      dfK: {
        name: 'Slide', label: 'ASYMPTOTE SLIDE', cmd: 'D/F+K', level: 'low', strength: 'heavy', crouching: true,
        startup: 18, active: 5, recovery: 24, damage: 14,
        block: -16, hit: { knockdown: true }, ch: { knockdown: true },
        hitbox: { x: 20, w: 32, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.004,
        step: [6, 22, 4.2],
        anim: [[1, 'crouch'], [8, 'sweep_c'], [18, 'slide'], [26, 'slide'], [36, 'sweep_c'], [46, 'crouch']]
      },
      heavy: {
        name: 'Heavy', label: 'COMPOSITE HOOK', cmd: 'H', level: 'mid', strength: 'heavy',
        startup: 18, active: 3, recovery: 22, damage: 20, wallSplat: true,
        block: -5, hit: { adv: 5 }, ch: { launch: 6 },
        hitbox: { x: 20, w: 26, y: 54, h: 20 }, push: 24, juggle: 3.6, carry: 2, shake: 0.006,
        step: [10, 18, 1.6],
        anim: [[1, 'idle'], [12, 'hook_c'], [18, 'hook_x'], [21, 'hook_x'], [30, 'hv_r'], [42, 'idle']]
      },
      // Function Feint: looks exactly like the Inverse Drop windup. Cancel it into
      // P (jab), D+K (low), H (the real overhead) or P+K (throw), or let it fizzle.
      fH: {
        name: 'Feint', label: 'FUNCTION FEINT', cmd: 'F+H', level: 'mid', strength: 'light', feint: true,
        startup: 23, active: 1, recovery: 1,
        cancels: [
          { btn: 'throw', into: 'throw', from: 6, to: 18 },
          { btn: 'h', into: 'drop', from: 6, to: 18 },
          { btn: 'k', into: 'low', from: 6, to: 18 },
          { btn: 'p', into: 'jab', from: 6, to: 18 }
        ],
        anim: [[1, 'idle'], [10, 'feint_c'], [18, 'feint_c'], [24, 'feint_x']]
      },
      drop: {
        name: 'Overhead', label: 'INVERSE DROP', cmd: 'F+H, H', level: 'mid', strength: 'heavy', bound: true,
        startup: 14, active: 3, recovery: 22, damage: 18, guardDmg: 22,
        block: -8, hit: { adv: 4 }, ch: { knockdown: true },
        hitbox: { x: 26, w: 20, y: 32, h: 26 }, push: 16, juggle: 2.5, shake: 0.007,
        step: [6, 14, 1.4],
        anim: [[1, 'feint_c'], [14, 'slam_x'], [17, 'slam_x'], [26, 'hv_r'], [38, 'idle']]
      },
      // Piecewise: back + P switches stance; in stance P/K/H become pwP/pwK/pwH.
      bP: {
        name: 'Stance', label: 'PIECEWISE', cmd: 'B+P', level: 'mid', strength: 'light', stanceSwitch: true,
        startup: 12, active: 1, recovery: 1,
        anim: [[1, 'idle'], [6, 'spin'], [12, 'pw_idle']]
      },
      pwP: {
        name: 'Stance Palm', label: 'STEP FUNCTION', cmd: 'STANCE P', level: 'mid', strength: 'medium',
        startup: 12, active: 2, recovery: 18, damage: 12,
        block: -4, hit: { adv: 6 }, ch: { adv: 10 },
        hitbox: { x: 24, w: 22, y: 44, h: 20 }, push: 12, juggle: 3.4, shake: 0.002,
        anim: [[1, 'pw_idle'], [8, 'pw_idle'], [12, 'pw_palm'], [14, 'pw_palm'], [31, 'idle']]
      },
      pwK: {
        name: 'Stance Low', label: 'ABSOLUTE VALUE', cmd: 'STANCE K', level: 'low', strength: 'medium', crouching: true,
        startup: 13, active: 3, recovery: 20, damage: 11, otg: true,
        block: -12, hit: { adv: 1 }, ch: { adv: 6 },
        hitbox: { x: 26, w: 24, y: 0, h: 16 }, push: 10, juggle: 2.5, shake: 0.002,
        anim: [[1, 'pw_idle'], [9, 'lk_c'], [13, 'lk_x'], [16, 'lk_x'], [26, 'crouch'], [35, 'idle']]
      },
      pwH: {
        name: 'Stance Axe Kick', label: 'JUMP DISCONTINUITY', cmd: 'STANCE H', level: 'mid', strength: 'heavy', bound: true,
        startup: 20, active: 3, recovery: 20, damage: 20, guardDmg: 22,
        block: -6, hit: { adv: 4 }, ch: { launch: 6 },
        hitbox: { x: 30, w: 22, y: 30, h: 30 }, push: 14, juggle: 2.5, shake: 0.007,
        anim: [[1, 'pw_idle'], [12, 'axe_c'], [20, 'axe_x'], [23, 'axe_x'], [32, 'hv_r'], [42, 'idle']]
      },
      launcher: {
        name: 'Launcher', label: 'DISCONTINUITY', cmd: 'D+H', level: 'mid', strength: 'launch',
        startup: 15, active: 4, recovery: 23, damage: 17,
        block: -15, hit: { launch: 7.6 }, ch: { launch: 8.2 },
        hitbox: { x: 8, w: 26, y: 30, h: 78 }, push: 6, juggle: 5.5, carry: 0.6, shake: 0.008,
        step: [9, 15, 1.2],
        cancels: [{ btn: 'up', into: 'jump', from: 17, to: 28, onHit: true }],
        anim: [[1, 'crouch'], [10, 'up_c'], [15, 'up_x'], [19, 'up_x'], [28, 'up_r'], [41, 'idle']]
      }
    },
    FG.kit.air(['IMAGE JAB', 'PREIMAGE KICK', 'INVERSE SPIKE'], { chain: { airP: ['h'], airK: ['h'] } }),
    FG.kit.throws('CONTRADICTION', 'COUNTEREXAMPLE', { throwB: { damage: 33 } }),
    FG.kit.wake(),
    FG.kit.taunt()),

    combos: [
      { name: 'DISCONTINUITY JUGGLE', notation: 'D+H, P, K', plan: { 0: 'D+H', 37: 'P', 65: 'K' }, hits: ['launcher', 'jab', 'mid'] },
      { name: 'INVERSE SPIKE', notation: 'D+H, UP, AIR K, AIR H, K',
        plan: { 0: 'D+H', 15: 'UP', 22: 'K', 31: 'H', 65: 'K' }, hits: ['launcher', 'airK', 'airH', 'mid'] },
      { name: 'FAKE OUT', notation: 'D+H, F+H, H (BOUND), D+K ON THE GROUND',
        plan: { 0: 'D+H', 42: 'F+H', 47: 'H', 104: 'D+K' }, hits: ['launcher', 'drop', 'low'] },
      { name: 'SLIDE AND STOMP', notation: 'D/F+K, D+K ON THE GROUND', plan: { 0: 'D/F+K', 81: 'D+K' }, hits: ['dfK', 'low'] }
    ],


    intro: [[1, 'idle'], [14, 'point'], [36, 'point'], [50, 'shrug'], [72, 'shrug'], [86, 'idle']],
    victory: [[1, 'shrug'], [16, 'guns'], [30, 'guns2'], [44, 'guns'], [58, 'guns2'], [76, 'shrug'], [100, 'shrug']],
    defeat: [[1, 'sit'], [40, 'sit2'], [80, 'sit']],
    gestures: { wag: [[1, 'idle'], [6, 'wag'], [12, 'wag2'], [18, 'wag'], [24, 'wag2'], [30, 'wag'], [40, 'idle']] },
    // Smack talk: pre-round and taunt lines, and short lines after a big combo or counter hit.
    talk: {
      lines: [
        'Oh, you brought a strategy? Cute.',
        'Pop quiz, sweetie. You\'re not ready.',
        'I\'d say good luck, but I don\'t lie to students.'
      ],
      quips: ['Gotcha!', 'Too easy, sweetie.', 'Ooh, partial credit.']
    },
    victoryLines: [
      "That's a ten out of ten, no partial credit.",
      'Oh honey, that was not on the study guide.',
      'You fell for that? It was in the syllabus.'
    ]
  });
})();
