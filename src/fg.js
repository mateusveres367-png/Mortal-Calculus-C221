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

  // Knockdown
  DOWN_FRAMES: 40,
  QUICK_RISE_FROM: 16,
  GETUP_FRAMES: 18,

  KO_RESET_FRAMES: 180
};
