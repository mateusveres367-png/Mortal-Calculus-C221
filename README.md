# Mortal Calculus: C221

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

**Phase 5 — animation (playable).** All eight fighters from [`ROSTER.md`](ROSTER.md): **PEDERSEN** (power, exponents; the cover fighter), **BRINKHUS** (balanced, limits), **CHAI** (technical, geometry), **DALSASS** (tricky, functions), **LEE** (rushdown, sequences), **LOPEZ** (defensive, statistics), **MIYASHIRO** (spacing, vectors) and **RAMOS** (grappler, matrices).

What's in the game so far:

- **Fighting engine (phase 1):** frame data, hitboxes and hurtboxes, high/mid/low, counter hits, hitstop, screen shake, and full movement including sidesteps.
- **Combo systems (phase 2):**
  - juggles, air combos, bounds, and wall splats with wall combos
  - knockdowns, ground hits, wake-up options and tech rolls
  - throws and throw breaks, and a guard pressure meter
  - combos only connect with the right timing and spacing
- **Training mode (phase 3):** a practice dummy, frame data, input display, hitbox view, and a reset button.
- **Roster (phase 4):**
  - each fighter is drawn from their described look and has their own stance, idle animation, normals, launcher, throws, combo routes, and intro, victory and defeat animations
  - character select, round intros, and a win screen with a random victory line in a speech box
  - the title screen features PEDERSEN next to his red sports car; his intro drives it in, and his stage is the outdoor campus with the car parked
  - full move lists with frame data are in [`MOVES.md`](MOVES.md)
- **Animation (phase 5):**
  - every attack has anticipation (weight back, shoulders wound up), a full-body strike (hips drive through, shoulders and hips rotate, weight shifts onto the front foot) and a recovery that settles
  - feet stay planted and take real steps when the body moves; knees and elbows are solved so limbs keep their length; nobody slides or floats
  - hit reactions by blow: heads snap back from jabs, bodies fold over body shots, roundhouses spin them, overheads crumple them
  - impact effects and sounds by attack type: quick jabs, heavy body shots, powerful roundhouses, explosive launchers, and dramatic counter hits with a screen flash and a shockwave
- **Combo feel pass:**
  - hit feel: hitstop scales with strength (jabs tiny, heavies longer, launchers and combo finishers longest); each hit in a combo sounds a little higher than the last and throws bigger sparks; counter hits get a bright flash, a big COUNTER! and an extra-heavy sound
  - camera and screen: a quick zoom-in on launchers and combo finishers (the HUD stays put on its own camera); screen shake scales with damage; slow motion on the final hit of a big combo and on round-winning hits; wall splats stick for a moment with a big crack in the wall, and you can keep hitting
  - juggle physics: launchers throw the opponent up on a fast, snappy arc; air hits pop them by the same small amount every time; juggle gravity grows with every hit so combos end on their own; bounds slam them into the floor and they bounce back up (an air bound drives you down with them so you can follow up)

The full vision lives in [`GAME_DESIGN.md`](GAME_DESIGN.md); the game is built in phases, and each phase stays playable.

## Running the game

Open `index.html` directly in a modern browser (double-click it, or drag it into a browser window). No install, build step, or server is needed, and it works offline. On the title screen, press `Enter` (or click), then pick your fighter and your opponent on the character select screen (arrows to move, `Enter` to confirm, `Esc` to go back). Pressing a key also turns on sound.

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
| Taunt | `T` | `Numpad 6` (or `]`) |

Standing guard blocks highs and mids. Crouching guard (down + back) blocks lows, and highs whiff over anyone crouching. Mids beat crouching guard; lows beat standing guard.

### Smack talk

Fighters talk:

- **Before every round** (after character select, and on every rematch), both fighters trade lines in pixel-art speech boxes. Some matchups have rivalry exchanges: LEE vs CHAI, LOPEZ vs DALSASS, RAMOS vs PEDERSEN, and MIYASHIRO vs BRINKHUS. PEDERSEN has a line for everyone else, and he says his signature line as he steps out of his car.
- **Taunt** (`T`): about a second of showing off with a random taunt line. You can be counter-hit the whole time.
- **After a big combo or a counter hit,** fighters sometimes get a short line in.

Lines are in [`ROSTER.md`](ROSTER.md). The fighters' short post-combo lines live in each fighter's `talk.quips`.

### Moves

Every fighter uses the same input layout. What each input does, and its frame data, depends on the fighter; see [`MOVES.md`](MOVES.md).

| Input | What it is |
| --- | --- |
| `P` / `K` / `H` | jab / mid kick / heavy |
| `P, P` and other strings | follow-ups, often only if the first hit connects |
| down + `K` / down-back + `K` | low kick / knockdown sweep |
| down + `H` | launcher; press up when it hits to jump after them |
| forward or back + a button | fighter-specific moves (for example DALSASS's Function Feint, CHAI's parry, LEE's Recursive Rush, MIYASHIRO's Dot Product) |
| dash, then `P` | dash attack (MIYASHIRO's Vector Rush) |
| `P` right after blocking | LOPEZ's Confidence Interval punisher |
| sidestep, then a button | sidestep attack (CHAI's Tangent Step comes out early) |
| `P` / `K` / `H` in the air | air attacks that chain on hit; air `H` bounds |
| `P`+`K` / back + `P`+`K` | front throw (break with `P`) / reverse throw (break with `K`) |
| forward + `P`+`K` | command grab (RAMOS's Identity): unbreakable |
| hold the button | charge moves (PEDERSEN's Order of Magnitude) |
| while knocked down | up gets up, back or forward rolls, a sidestep key rolls sideways, `K` or `P` does a wake-up kick |
| just before landing from a juggle | `P`, `K` or `H` tech rolls (not after sweeps, bounds or wall splats) |

The fighters:

- **PEDERSEN** (power, exponents) — the cover fighter. Slow, with huge damage. His arch-nemesis is Vicky:
  - **Exponential Haymaker** (forward + `H`) splats the wall.
  - **Order of Magnitude** (back + `H`, hold `H` to charge) knocks down at half charge. At full charge it does over double damage and breaks the guard if blocked.
  - **Power Rule** (down + `H`) is his launcher, and **Long Division** (`P`+`K`) is a slam throw.
  - His intro drives his car in; he steps out and loosens his tie.
- **BRINKHUS** (balanced, limits) — best for new players. The Epsilon-Delta string (`P, K, K`) combos naturally on hit. His launcher is Limit Break (down + `H`) and his throw is Squeeze Theorem.
- **DALSASS** (tricky, functions):
  - **Function Feint** (forward + `H`) looks like his overhead. Cancel it into a jab (`P`), a low (`K`), the real overhead (`H`) or a throw (`P`+`K`), or let it fizzle.
  - **Piecewise** (back + `P`) switches to a second stance where `P`, `K` and `H` are different moves. Moving leaves the stance.
  - **Asymptote Slide** (down-forward + `K`) slides under highs and knocks down.
  - The crowd cheers louder for him, and he wags a finger when you fall for a feint.
- **CHAI** (technical, geometry):
  - **Tangent Step:** sidestep, then `P` (or `K` for a low). It comes out earlier than other fighters' sidestep attacks and stays off the line until it hits.
  - **Reflection Counter** (back + `H`) parries highs and mids during frames 2–10, then counters at once. Lows and throws beat it, and a whiffed parry is punishable.
  - Her routes are precise; the Vertex Bound route has a 2-frame window. She winces apologetically after landing a big hit and offers a hand up when she wins.
- **LEE** (rushdown, sequences):
  - **Arithmetic Sequence** (`P, P, P`, then `P` for a mid or `K` for a low) gets faster with every hit.
  - **Recursive Rush** (forward + `P`) repeats on hit when you press `P` again, up to three times.
  - His normals are plus on block. He taunts mid-combo and pushes up his glasses after big hits.
- **LOPEZ** (defensive, statistics):
  - **Standard Deviation:** his backdash goes further, recovers sooner, and lows can't touch it early on.
  - **Confidence Interval:** `P` within 10 frames of blocking is a fast, heavy punisher.
  - **Null Hypothesis** (back + `H`) parries mids and lows; he squints, then counters. Highs and throws beat it.
  - He takes his blazer off during his intro.
- **MIYASHIRO** (spacing, vectors):
  - **Dot Product** (forward + `K`) is the longest mid in the game.
  - **Vector Rush** (dash, then `P`) comes out early in a dash.
  - **Unit Circle** (back + `K`) is a tracking spin kick.
  - **Calculated:** when you whiff near him, his next hit within 2.5 seconds does 30% more damage.
- **RAMOS** (grappler, matrices) — the fastest dash in the game, and a cardio machine. He can chain dashes back to back, and his guard meter recovers twice as fast. Long, bouncy hair that swings when he moves:
  - **Matrix Lock** (`P`+`K`) has a short break window (8 frames instead of 15).
  - **Determinant Slam** (back + `P`+`K`) is his reverse throw.
  - **Identity** (forward + `P`+`K`) is a command grab: slower, but it can't be broken and takes crouching opponents too.
  - **Transpose Toss** (down + `H`) is his launcher, and dash then `P` is a shoulder charge.

### Training mode

After character select the game goes into training mode, starting with both fighters' round intros (any button skips). The stage is player 2's home stage: the outdoor campus for PEDERSEN, the classroom for everyone else. A K.O. shows the win screen: `Enter` for a rematch, `Esc` for character select. Press `Esc`, or click **MENU** at the top of the screen, to open the training menu. The fight pauses while the menu is open. Use up/down to pick a row, left/right to change it, and `Esc` to close. You can also click a row.

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
| Swap sides | P1 and P2 trade fighters |
| Character select | Back to the character select screen |
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
| `5` | Swap sides (P1 and P2 trade fighters) |
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
src/data/               poses, the fighter kit (kit.js) and one file per fighter in fighters/
src/render/             fighter drawing, procedural motion (motion.js), stage, effects and sound,
                        HUD, pixel font, input display, training menu
src/scenes/             title, character select, and the fight scene that ties input, simulation and rendering together
tools/movelist.js       regenerates MOVES.md from the fighter data
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
- [`ROSTER.md`](ROSTER.md) — the eight fighters: archetypes, looks, personalities, moves and victory lines
- [`MOVES.md`](MOVES.md) — generated move lists with frame data and combo routes
- [`CLAUDE.md`](CLAUDE.md) — working rules for AI-assisted development
