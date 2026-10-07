// Global namespace. The game runs from file://, so there are no ES modules:
// every script attaches what it defines to FG and is loaded in order by index.html.
var FG = (typeof window !== 'undefined' ? window : globalThis).FG = {};

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
  JUGGLE_GRAVITY: 0.3,

  // Input
  BUFFER_FRAMES: 8,
  DASH_TAP_WINDOW: 12,

  // Sidestep: depth offset (z) and the gap beyond which linear attacks whiff.
  SIDESTEP_FRAMES: 20,
  SIDESTEP_DEPTH: 30,
  SIDESTEP_EVADE_Z: 12,

  // Air
  SUPER_JUMP_VY: 9.4,     // launcher jump-cancel
  SUPER_JUMP_VX: 1.7,
  AIR_ACTIONS: 3,         // air attacks per jump
  JUGGLE_GRAVITY_SCALE: 0.05, // extra juggle gravity per juggle hit
  BOUNCE_VY: 5.4,         // floor bounce after a bound

  // Walls
  WALL_STUN: 46,
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

  // Guard pressure meter (0..100)
  GUARD_MAX: 100,
  GUARD_REGEN_DELAY: 60,
  GUARD_REGEN: 0.5,
  GUARD_BREAK_ADV: 22,

  KO_RESET_FRAMES: 180
};
