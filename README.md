# Browser Fighting Game

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

**Phase 1 — fighting engine (playable).** Two placeholder fighters on a placeholder classroom stage, with the core combat systems in place:

- Frame data for every move (startup / active / recovery, advantage on block, hit and counter hit)
- Hitboxes and hurtboxes (extended limbs can be hit, so whiffs can be punished)
- Hitstun, blockstun, high / mid / low hit levels, counter hits, launchers and juggles
- Hitstop, screen shake, hit sparks and synthesized impact sounds
- Walk, dash, backdash, crouch, jump, and sidestep (linear attacks miss a sidestepping opponent; tracking attacks don't)
- Training tools: P2 dummy modes, hitbox display, frame data panel with measured frame advantage, slow motion

The full vision lives in [`GAME_DESIGN.md`](GAME_DESIGN.md); the game is built in phases, and each phase stays playable.

## Running the game

Open `index.html` directly in a modern browser (double-click it, or drag it into a browser window). No install, build step, or server is needed, and it works offline. Press any key once to enable sound.

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Walk | `A` / `D` | `←` / `→` |
| Jump | `W` | `↑` |
| Crouch | `S` | `↓` |
| Guard | hold back (away from the opponent) | hold back |
| Dash / backdash | tap forward / back twice | tap forward / back twice |
| Sidestep in / out | `Q` / `E` | `Numpad 4` / `Numpad 5` (or `;` / `'`) |
| Punch (P) | `J` | `Numpad 1` (or `,`) |
| Kick (K) | `K` | `Numpad 2` (or `.`) |
| Heavy (H) | `L` | `Numpad 3` (or `/`) |

Standing guard blocks highs and mids. Crouching guard (down + back) blocks lows, and highs whiff over anyone crouching. Mids beat crouching guard; lows beat standing guard.

### Moves

| Input | SIGMA (balanced) | DELTA (power) | Level |
| --- | --- | --- | --- |
| `P` | Prime Jab, i10 | Delta Jab, i11 | high |
| `P, P` | Straight; add `K` after it connects for a 3-hit string | Derivative Hook (tracks) | high |
| `K` | Vector Kick, i14 | Normal Force, i16 | mid |
| down + `K` | Floor Function, i16 (tracks) | Floor Stomp, i18 | low |
| `H` | Prime Impact, i19 (launches on counter hit) | Quadratic Hammer, i22, +2 on block (launches on counter hit) | mid |
| down + `H` | Parabola Launcher, i15, −15 on block | Limit Break, i16, −17 on block | mid |

Things to try: launcher → jab → heavy as a juggle; block the dummy's launcher and punish it with a jab; sidestep the jabbing dummy and counter-hit it.

### Training keys

| Key | Action |
| --- | --- |
| `1` | Cycle P2: human, or a dummy (stand, crouch, stand guard, crouch guard, random guard, jab every second, launcher) |
| `2` | Show hitboxes (red), hurtboxes (green) and pushboxes (yellow) |
| `3` | Show / hide the frame data panel. "LAST" is the frame advantage the engine measured for your last hit or block |
| `4` | Slow motion |
| `5` | Swap fighters |
| `R` | Reset positions and health |
| `M` | Mute |
| `C` | Show / hide the controls overlay |

## Project layout

```
index.html              loads every script in order (no modules, no build)
lib/phaser.min.js       Phaser 3.90, vendored
src/fg.js               global namespace and tuning constants
src/engine/             pure simulation, no Phaser: input buffer, fighter state machine, match (hits, hitstop, combos), dummy
src/data/               fighter definitions with frame data, and skeleton poses
src/render/             fighter drawing, stage, effects and sound, HUD, pixel font
src/scenes/             the Phaser scene that ties input, simulation and rendering together
tests/sim.test.js       headless engine tests (node tests/sim.test.js)
tests/smoke.js          optional browser smoke test over file:// (needs Playwright)
```

## Tests

Playing needs nothing but a browser. For development:

```bash
node tests/sim.test.js   # engine tests: frame data, hit levels, counter hits, sidestep, juggles, movement
node tests/smoke.js      # optional: opens index.html from disk in headless Chromium (requires Playwright)
```

## Tech stack

- **Engine:** Phaser 3 (renders to HTML5 Canvas / WebGL), vendored locally
- **Language:** plain JavaScript loaded with classic `<script>` tags
- **Build:** none

## Project docs

- [`GAME_DESIGN.md`](GAME_DESIGN.md) — full game vision and design
- [`CLAUDE.md`](CLAUDE.md) — working rules for AI-assisted development
