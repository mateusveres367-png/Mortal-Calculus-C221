# Browser Fighting Game

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

**Phase 3 — training mode (playable).** Two placeholder fighters on a placeholder classroom stage.

Phase 1, the fighting engine:

- Frame data for every move (startup / active / recovery, advantage on block, hit and counter hit)
- Hitboxes and hurtboxes (extended limbs can be hit, so whiffs can be punished)
- Hitstun, blockstun, high / mid / low hit levels, counter hits, launchers
- Hitstop, screen shake, hit sparks and synthesized impact sounds
- Walk, dash, backdash, crouch, jump, and sidestep (linear attacks miss a sidestepping opponent; tracking attacks don't)

Phase 2, combos, knockdowns, throws:

- **Juggles** with rising gravity and shrinking pops per hit, so every juggle ends on its own
- **Air combos:** jump-cancel a launcher that hits (press up), then chain air attacks; air H bounds
- **Bounds:** a bound slams an airborne opponent into the floor for a bounce, once per combo
- **Wall splats and wall combos:** a heavy next to the wall, or a juggle carried into it, pins the opponent; each wall hit gives less time, and a heavy or launcher blasts them off
- **Knockdowns:** sweeps, throws and juggles; lows can hit a downed opponent once
- **Wake-up options:** stay down, get up, roll back / forward / sideways, wake-up low or mid kick, or tech roll by pressing a button just before landing
- **Throws and throw breaks:** P+K front throw (break with P), back+P+K reverse throw (break with K); crouching ducks throws
- **Guard pressure meter:** blocking fills it, not blocking drains it, and a full meter breaks your guard

Phase 3, training mode:

- **Practice dummy** with a stance (stand, crouch, block all, random, stand guard, crouch guard), an optional action (jab, launcher, throw), a knockdown behaviour (stay down, tech, random wake-up) and throw breaks on or off. The blocking dummy guards in place instead of walking away.
- **Frame data display:** each move's data plus the frame advantage the engine actually measured
- **Input display:** both players' recent inputs with how many frames each was held
- **Hitbox view:** hitboxes, hurtboxes and pushboxes
- **Reset button** on screen (and `R`), with start positions in the center or against either wall
- Training menu (`Esc`), health refill, slow motion, and player 2 can be the dummy or a second human

Combos only connect when the timing and spacing are right. Strings and cancels need the hit to land, juggle hits need the opponent at the right height, and bounds and wall splats can each happen only once per combo.

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
| Throw | `J`+`K` (with back: reverse throw) | `Num1`+`Num2` |

Standing guard blocks highs and mids. Crouching guard (down + back) blocks lows, and highs whiff over anyone crouching. Mids beat crouching guard; lows beat standing guard.

### Moves

| Input | SIGMA (balanced) | DELTA (power) | Level |
| --- | --- | --- | --- |
| `P` | Prime Jab, i10 | Delta Jab, i11 | high |
| `P, P` | Straight; add `K` after it connects for a 3-hit string | Derivative Hook (tracks) | high |
| `K` | Vector Kick, i14 | Normal Force, i16 | mid |
| down + `K` | Floor Function, i16 (tracks) | Floor Stomp, i18 | low |
| `H` | Prime Impact, i19 (launches on counter hit) | Quadratic Hammer, i22, +2 on block (launches on counter hit) | mid |
| down + `H` | Parabola Launcher, i15, −15 on block; press up on hit to jump after them | Limit Break, i16, −17 on block; same jump cancel | mid |
| down-back + `K` | Integral Sweep, i20, knockdown, −18 on block | Root Sweep, i22, knockdown, −20 on block | low |
| forward + `H` | Derivative Drop, i21, bounds airborne opponents | Vertical Asymptote, i24, bounds | mid |
| in the air: `P` / `K` / `H` | Tangent Jab → Secant Kick → Asymptote Spike (bound) | Delta Drop Jab / Falling Normal → Terminal Velocity (bound) | mid |
| `P`+`K` / back+`P`+`K` | Function Toss (break: P) / Inverse Throw (break: K) | Body Slam / Inverse Function | throw |
| while down: `K` / `P` or `H` | Rolling Zero (low) / Spring Theorem (mid) wake-up kicks | same | low / mid |

**Knocked down:** up gets up, back or forward rolls, a sidestep key rolls sideways, and `K` or `P` does a wake-up kick. Doing nothing leaves you open to a ground hit. To **tech roll**, press `P`, `K` or `H` just before you land from a juggle. Sweeps, bounds and wall splats can't be teched.

Things to try:

- **SIGMA air combo:** launcher, up, air P, air K, air H (bound), then K after the bounce.
- **DELTA air route:** launcher, up, air K, air H.
- **Wall combo:** set the start position to a wall, then heavy, jab, jab, launcher.
- **Punish practice:** set the dummy action to Launcher, block it, and punish it.
- **Throw breaks:** set the dummy action to Throw and break its throws.

### Training mode

The game starts in training mode. Press `Esc`, or click **MENU** at the top of the screen, to open the training menu. The fight pauses while the menu is open. Use up/down to pick a row, left/right to change it, and `Esc` to close. You can also click a row.

| Setting | Options |
| --- | --- |
| Player 2 | Dummy, or Human (second player on the keyboard) |
| Dummy stance | Stand, Crouch, Block all (reads high/mid/low), Random (hit, stand guard or crouch guard per attack), Stand guard, Crouch guard |
| Dummy action | None, Jab, Launcher (punish it), Throw (break it) |
| Dummy knockdown | Stay down, Tech, Random wake-up |
| Dummy throw breaks | Off, On |
| Health | Refill a moment after each combo, or Normal (K.O. resets) |
| Frame data / Input display / Hitboxes / Slow motion | On, Off |
| Start position | Center, Left wall, Right wall (for wall combos) |
| Fighters | Swap who plays which fighter |
| Reset | Reset positions, health and meters (also `R`, or the **RESET** button) |

**Frame data panel:** each move's startup, active and recovery frames, its frame advantage, and properties (tracks, bound, splat, hits downed opponents). The `LAST` line is the advantage the engine measured for your last hit or block: blue for plus, red for minus. It shows the kind of hit for launches, wall splats and throws.

**Input display:** the newest input is at the top. Arrows are relative to the way you face (→ is always forward), with buttons and the number of frames each was held. Sidesteps show as `SI` / `SO`.

Hotkeys:

| Key | Action |
| --- | --- |
| `Esc` | Training menu |
| `1` | Next dummy stance |
| `2` | Hitboxes (red), hurtboxes (green), pushboxes (yellow) |
| `3` | Frame data panel |
| `4` | Slow motion |
| `5` | Swap fighters |
| `6` | Input display |
| `R` | Reset |
| `M` | Mute |
| `C` | Controls overlay |

## Project layout

```
index.html              loads every script in order (no modules, no build)
lib/phaser.min.js       Phaser 3.90, vendored
src/fg.js               global namespace and tuning constants
src/engine/             pure simulation, no Phaser: input buffer, fighter state machine, match loop and walls,
                        combat (hits, juggles, bounds, wall hits, throws, guard meter), dummy
src/data/               fighter definitions with frame data, and skeleton poses
src/render/             fighter drawing, stage, effects and sound, HUD, pixel font,
                        input display, training menu
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
