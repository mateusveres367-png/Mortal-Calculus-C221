// Global namespace. The game runs from file://, so there are no ES modules:
// every script attaches what it defines to FG and is loaded in order by index.html.
var FG = (typeof window !== 'undefined' ? window : globalThis).FG = {};

FG.TITLE = 'Mortal Calculus: C221';
FG.TITLE_MAIN = 'MORTAL CALCULUS';
FG.TITLE_SUB = 'C221';

FG.C = {
  // Simulation runs at a fixed 60 steps per second; all frame data is in these frames.
  FPS: 60,

  // Internal render resolution (scaled up with nearest-neighbour filtering).
  VIEW_W: 640,
  VIEW_H: 360,
  GROUND_Y: 300,

  // World / stage, in pixels. Fighters live between the walls.
  WORLD_W: 1040,
  WALL_L: 40,
  WALL_R: 1000,
  MAX_SEPARATION: 540,
  PUSH_WIDTH: 18, // half-width of the body pushbox

  GRAVITY: 0.5,
  // Juggles: launchers throw the opponent up fast on a snappy arc (launch speed
  // is scaled by LAUNCH_SNAP), and juggle gravity grows with every hit in the
  // combo, up to JUGGLE_GRAVITY_MAX times, so juggles end on their own.
  // Gravity starts gentle (time for follow-ups) and climbs faster later on.
  JUGGLE_GRAVITY: 0.36,
  JUGGLE_GRAVITY_SCALE: 0.1,   // extra juggle gravity per combo hit after the first
  JUGGLE_GRAVITY_MAX: 2.2,
  LAUNCH_SNAP: 1.12,
  // Air hits pop a juggled opponent up a little, by the same amount for every
  // move of a strength (so juggles are predictable), shrinking with each juggle hit.
  JUGGLE_POP: { light: 3.8, medium: 4.3, heavy: 4.8, launch: 5.6 },
  JUGGLE_POP_DECAY: 0.1,

  // Input
  BUFFER_FRAMES: 10,
  // Easier combos: string follow-ups (cancels) in a combo leave the opponent in hitstun
  // a little longer, and string cancel windows stay open a little later, so chains are forgiving.
  COMBO_STUN_BONUS: 4,
  CHAIN_LATE: 4,
  DASH_TAP_WINDOW: 12,

  // Sidestep: depth offset (z) and the gap beyond which linear attacks whiff.
  SIDESTEP_FRAMES: 20,
  SIDESTEP_DEPTH: 30,
  SIDESTEP_EVADE_Z: 12,

  // Air
  SUPER_JUMP_VY: 9.4,     // launcher jump-cancel
  SUPER_JUMP_VX: 1.7,
  AIR_ACTIONS: 3,         // air attacks per jump
  BOUND_VY: 9,            // a bound slams the opponent into the floor this fast
  BOUNCE_VY: 7,           // ...and they bounce back up at this speed
  BOUND_DRIVE: 3,         // an air bound sends the attacker down at least this fast

  // Walls
  WALL_STUN: 46,
  WALL_STICK: 18,         // a splatted fighter sticks to the wall this long before sliding down
  WALL_SPLAT_MAX_Y: 110,
  WALL_HITS_MAX: 4,

  // Knockdown and wake-up
  DOWN_FRAMES: 40,
  QUICK_RISE_FROM: 14,    // ground hits land before this; wake-up options after it
  GETUP_FRAMES: 18,
  ROLL_FRAMES: 24,
  ROLL_INVULN: 16,
  TECH_WINDOW: 8,         // press P/K/H this many frames before landing to tech
  TECH_FRAMES: 20,
  TECH_INVULN: 14,
  GROUND_HITS_MAX: 1,

  // Throws
  THROW_BREAK_WINDOW: 15,
  THROW_SLAM_FRAME: 34,
  THROW_END_FRAME: 46,
  THROW_BREAK_FRAMES: 16,

  // MIYASHIRO's Calculated: after an opponent whiffs, his next hit within this
  // many frames does extra damage.
  CALCULATED_FRAMES: 150,
  CALCULATED_BONUS: 1.3,

  // Parries: how long a parried attacker staggers.
  PARRY_STUN: 30,

  // Guard pressure meter (0..100)
  GUARD_MAX: 100,
  GUARD_REGEN_DELAY: 60,
  GUARD_REGEN: 0.5,
  GUARD_BREAK_ADV: 22,

  // Hitstop (frames both fighters freeze on contact) by move strength: jabs
  // barely stop, heavies hang, launchers and combo finishers hang longest.
  HITSTOP: { light: 4, medium: 7, heavy: 11, launch: 15 },
  HITSTOP_CH: 5,        // added on a counter hit
  HITSTOP_FINISHER: 17, // knockdowns, wall splats, bounds, wall blasts
  HITSTOP_KO: 30,
  // Safety net against ground loops: from this many hits into a combo, each hit
  // leaves the opponent in hitstun a few frames less.
  COMBO_DECAY_FROM: 10,
  COMBO_DECAY_STUN: 3,
  // Grade meter: 3 bars (C, B, A) of METER_BAR each.
  METER_BAR: 100,
  METER_MAX: 300,
  METER_HIT: 1.1,       // per point of damage dealt
  METER_TAKEN: 0.6,     // per point of damage taken
  METER_BLOCK: 4,       // for blocking an attack
  METER_BLOCKED: 2,     // for an attack that was blocked
  METER_LOSING: 1.25,   // gain multiplier while you're behind on health
  MULTI_GAP: 5,         // frames between the hits of a multi-hit (enhanced) move
  QCF_FRAMES: 24,       // frames for a down, down-forward, forward motion (ultimates)
  ULT_DAMAGE: 0.32,     // an ultimate takes this share of the opponent's full health
  ULT_EXTRA_RECOVERY: 30, // a blocked or whiffed ultimate leaves them open this much longer
  TIP_BONUS: 1.25,      // Long Arms: damage for landing with the tip of a straight
  ARMOR_DAMAGE: 0.7,    // Exponential Armor: share of an absorbed hit's damage taken
  ARMOR_HITSTOP: 8,     // Exponential Armor: the freeze on an absorbed hit
  FINISH_WINDOW: 120,   // frames after the final K.O. to enter a finisher (2 seconds)
  CUTIN_HITS: 10,       // a combo this long gets a cut-in
  CUTIN_COOLDOWN: 240,  // ticks between cut-ins
  BIG_COMBO: 5,         // hits for a combo to count as big (slow-mo finish, NICE label)

  KO_RESET_FRAMES: 180
};

// Player settings (title screen OPTIONS), remembered in this browser when possible.
(function () {
  FG.settings = { difficulty: 'normal', time: 60, sound: true, easyCombos: false };
  try {
    var saved = JSON.parse(window.localStorage.getItem('mc221.settings') || 'null');
    if (saved) for (var k in FG.settings) if (saved[k] !== undefined) FG.settings[k] = saved[k];
  } catch (e) { /* storage unavailable: defaults */ }
  FG.saveSettings = function () {
    try { window.localStorage.setItem('mc221.settings', JSON.stringify(FG.settings)); } catch (e) { /* not saved */ }
  };
})();
