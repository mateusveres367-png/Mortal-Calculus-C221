# Mortal Calculus: C221

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

**Phase 7 — modes and screens (playable).** All nine fighters from [`ROSTER.md`](ROSTER.md): **PEDERSEN** (power, math analysis; the cover fighter), **BRINKHUS** (balanced, Algebra 1), **CHAI** (technical, geometry), **DALSASS** (tricky, triangles and proofs), **LEE** (rushdown, sequences), **LOPEZ** (defensive, calculus), **MIYASHIRO** (spacing, Algebra 2), **RAMOS** (grappler, matrices) and **WILSON** (veteran master, every subject; the arcade boss). No two fight alike: each has their own style, stance, movement, weight, hit reactions and signature mechanic.

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
  - the title screen features PEDERSEN next to his red sports car; his intro drives it in
  - full move lists with frame data are in [`MOVES.md`](MOVES.md)
- **Animation (phase 5):**
  - every attack has anticipation (weight back, shoulders wound up), a full-body strike (hips drive through, shoulders and hips rotate, weight shifts onto the front foot) and a recovery that settles
  - feet stay planted and take real steps when the body moves; knees and elbows are solved so limbs keep their length; nobody slides or floats
  - hit reactions by blow: heads snap back from jabs, bodies fold over body shots, roundhouses spin them, overheads crumple them
  - impact effects and sounds by attack type: quick jabs, heavy body shots, powerful roundhouses, explosive launchers, and dramatic counter hits with a screen flash and a shockwave
- **Stages (phase 6):** six stages with parallax depth and small animations, and students in the background who cheer, flinch at big hits and jump up for a K.O.:
  - **Classroom C221:** whiteboards full of math, desks with calculators, a ticking clock, a flickering tube light
  - **Math Hallway:** lockers, classroom doors, bulletin boards, a humming vending machine, students walking past
  - **Computer Lab:** a bench of CRT monitors plotting sine waves, bar charts and spirals; students spin round to watch
  - **Outdoor Campus:** buildings at dusk, a clock tower, swaying trees, a waving flag, drifting clouds and birds
  - **Department Office:** bookshelves, filing cabinets, a turning ceiling fan, a printer that never stops, screensavers
  - **Faculty Parking:** PEDERSEN's stage; his red sports car sits in his reserved spot, cars pass on the road behind
  - each fighter has a home stage (player 2's is used); PEDERSEN drives in only on outdoor stages and walks in indoors
- **Modes and screens (phase 7):**
  - a late-90s arcade title screen: the faculty lot at sunset, PEDERSEN in sunglasses leaning on his red sports car with a smoking cigar, the other seven in silhouette behind him catching rim light in their colours, a chrome MORTAL CALCULUS logo that slams in with a red C221 stamp, PRESS START, CRT scanlines and a synth-rock loop (Web Audio). The menu: **Arcade**, **Versus**, **Training**, **Options**. Leave it for 15 seconds and the attract demo plays three short CPU vs CPU clips with cut-ins, then comes back; any key ends it
  - character select with pixel portraits (both players pick at the same time in versus), then stage select with a live, panning preview of each stage (or RANDOM)
  - **Arcade:** fight the whole department, one CPU opponent at a time on their home stage, PEDERSEN last; win to see who's next, lose and you get a 10-second CONTINUE?; beat everyone for the ending
  - **Versus:** player 1 against player 2 on one keyboard
  - best of three rounds with ROUND 1 / READY / FIGHT, a round timer (time out goes to whoever has more health left), round markers, K.O., TIME, PERFECT and FINAL ROUND, and a victory screen with the score
  - CPU opponents at three levels (Options: Easy, Normal, Hard): they react with a delay, guard and read lows, punish whiffs and blocked moves, run real combo routes, tech, break throws and pick wake-up options; harder levels do each of these more often and faster
  - Options also set the round time (30, 60, 99 or none) and sound, and are remembered in your browser
- **Easier combos:** a 10-frame input buffer, wider windows between string hits, gentler early juggle gravity, and a universal P, P, H string ender so launcher > P > P > H works for every fighter; **Easy Combos** (Options, off by default) lets you mash P to keep a string going; combo trials show a timing bar. Details in [`COMBOS.md`](COMBOS.md).
- **Combo feel pass:**
  - hit feel: hitstop scales with strength (jabs tiny, heavies longer, launchers and combo finishers longest); each hit in a combo sounds a little higher than the last and throws bigger sparks; counter hits get a bright flash, a big COUNTER! and an extra-heavy sound
  - self-check: tests play every route against every fighter, mash buttons at random to make sure nothing is infinite or too easy, and check damage rises with difficulty; see [`COMBOS.md`](COMBOS.md)
  - combo trials (training mode, key 7 or the menu): every fighter's routes from easy to hard; the panel shows each input and its move, checks them off as they land, resets on a drop or wrong move, and loads the next trial when you finish one (8/9 switch trials, R restarts)
  - input feel: an input buffer (now 10 frames); a buffered press keeps the direction you held when you pressed it (an early D+H still launches); every route forgives presses 3 frames early or late; string cancels leave a quick afterimage and a whip sound, and the frame data panel shows each move's chain buttons and window; every fighter has an easy, a medium and a hard combo route (more damage as they get harder)
  - combo counter: a big pixel hit count with total damage that pops and shakes on every hit, ranked NICE (5+), GREAT (8+), INCREDIBLE (12+) and PROOF COMPLETE (15+)
  - camera and screen: a quick zoom-in on launchers and combo finishers (the HUD stays put on its own camera); screen shake scales with damage; slow motion on the final hit of a big combo and on round-winning hits; wall splats stick for a moment with a big crack in the wall, and you can keep hitting
  - cut-ins: a half-second full-screen panel in the fighter's colours (slashed bands, halftone dots, a huge close-up of their face, the move name in big tilted letters) when a launcher lands as a counter hit or a combo reaches 10 hits. The fight freezes while it plays; at most one per combo, with a cooldown, and never during combo trials
  - juggle physics: launchers throw the opponent up on a fast, snappy arc; air hits pop them by the same small amount every time; juggle gravity grows with every hit so combos end on their own; bounds slam them into the floor and they bounce back up (an air bound drives you down with them so you can follow up)

The full vision lives in [`GAME_DESIGN.md`](GAME_DESIGN.md); the game is built in phases, and each phase stays playable.

## Running the game

Open `index.html` directly in a modern browser (double-click it, or drag it into a browser window). No install, build step, or server is needed, and it works offline. Pressing a key also turns on sound.

On the title screen, press `Enter` (or click) for the menu, then up/down and `Enter`:

- **Arcade:** pick your fighter (arrows or WASD, `Enter` or `J`), then fight all nine in a row (your own mirror match included, then PEDERSEN, then WILSON, the final boss). Beat arcade once to unlock WILSON for arcade and VS CPU (he's always playable in training and versus). The CPU gets harder with every fight; a ladder screen before each one shows the tower and the next opponent's line for you. Lose and CONTINUE? counts down; win them all for the ending and your fighter's victory line.
- **VS CPU:** pick your fighter, then the CPU's, then a stage; up/down on stage select sets the CPU's level.
- **Versus:** both players pick at once: player 1 with `WASD` and `J` (`K` to undo), player 2 with the arrows and `Numpad 1` or `,` (`Numpad 2` or `.` to undo). Then pick a stage.
- **Training:** pick your fighter, then the opponent, then a stage. In the training menu, PLAYER 2 can be the dummy, a second human, or the CPU at any level.
- **Options:** CPU difficulty, round time, sound and Easy Combos (left/right to change).

**CPU levels.** The CPU presses real inputs and plays by the same rules; it only sees what you do after a reaction delay. Each fighter plays to their style (LEE rushes in, LOPEZ waits and punishes, MIYASHIRO keeps distance, RAMOS runs in for grabs, DALSASS feints, PEDERSEN swings big through your hits, CHAI sidesteps and counters, BRINKHUS plays solid fundamentals), taunts when there's room, and uses its finisher when it wins. It spends meter too: it powers up its specials, runs its meter routes, throws out its ultimate to punish a big opening (LOPEZ sets his counter stance when you come in), cashes in Extra Credit when it's low, and uses the stage objects (vaulting out of a corner, springboarding in). Harder levels do all of that more.

| Level | How it plays |
| --- | --- |
| Easy | slow reactions, rarely blocks, short combos |
| Normal | blocks most highs and mids, punishes some whiffs, mid-length combos |
| Hard | blocks lows too, sidesteps, punishes whiffs, full combos and wall combos |
| Professor | Hard, and it reads your habits: repeat a move and it learns it (READ: over its head), then sees it coming, guards it right, beats it to the punch or punishes it |

`Esc` goes back a screen. In a fight, `Esc` pauses (arcade, VS CPU and versus) or opens the training menu. After a match: `Enter` for a rematch (or the next arcade fight), `Esc` for character select.

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

### Playing on a phone or tablet

Open `index.html` on a touch screen (or add `?touch=1` to the address) and touch controls appear over the game: a d-pad on the left, and **P** (punch), **K** (kick), **H** (heavy) and **★** on the right, with **START** and **II** (pause) in the corner. Tap the game to get past the title and confirm on menus; the d-pad and P work every menu. The game goes fullscreen and landscape where the browser allows; in portrait it sits at the top with the controls below.

Kept simple on purpose:

- **Mash P** to keep a string going (Easy Combos is always on for touch players). Down + H is still the launcher, hold back to block, and tap forward twice to dash.
- **★ does the big thing for you:** with a full meter it does your ultimate's motion for you; when you're low it cashes in Extra Credit; next to a stage object it uses it (and vaults out if you're cornered); during a special with a bar it powers it up; otherwise it throws.

### Smack talk

Fighters talk:

- **Before every round** (after character select, and on every rematch), a split-screen VS cut-in shows both fighters with their opening lines, then they trade the rest in pixel-art speech boxes. Some matchups have rivalry exchanges: LEE vs CHAI, LOPEZ vs DALSASS, RAMOS vs PEDERSEN, and MIYASHIRO vs BRINKHUS. PEDERSEN has a line for everyone else, and he says his signature line as he steps out of his car.
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
| forward or back + a button | fighter-specific moves (for example DALSASS's Proof by Contradiction, CHAI's parry, LEE's Recursive Rush, MIYASHIRO's Domain Control, PEDERSEN's Right Angle Elbow) |
| dash, then `P` | dash attack (MIYASHIRO's Range Check) |
| `P` right after blocking | LOPEZ's Mean Value Punish |
| sidestep, then a button | sidestep attack (CHAI's Tangent Step comes out early) |
| `P` / `K` / `H` in the air | air attacks that chain on hit; air `H` bounds |
| `P`+`K` / back + `P`+`K` | front throw (break with `P`) / reverse throw (break with `K`) |
| forward + `P`+`K` | command grab (RAMOS's Identity): unbreakable |
| hold the button | charge moves (PEDERSEN's Order of Magnitude) |
| while knocked down | up gets up, back or forward rolls, a sidestep key rolls sideways, `K` or `P` does a wake-up kick |
| just before landing from a juggle | `P`, `K` or `H` tech rolls (not after sweeps, bounds or wall splats) |

### Meter and big moves

- **Grade meter:** three bars under your health bar, graded **C**, **B** and **A**. It fills when you land hits, when you block and when you take damage, and a little faster (×1.25) while you're behind on health. A bar chimes and flashes when it fills, and all three full pulses. The meter carries over between rounds.
- **Enhanced specials (1 bar):** press `P`+`K` during the startup of a special to power it up: more damage plus extra hits, armor, a launch or a wall splat, depending on the move. The fighter flashes in their colour and a `+` pops onto the move's name. Every fighter has three; they're listed in [`MOVES.md`](MOVES.md).
- **Ultimates (3 bars):** down, down-forward, forward + `P`+`K`+`H` (also straight out of a move that hits). If it connects, a cinematic plays: a cut-in, a camera zoom, slow motion, and **DIAGRAM VIEW** freeze frames where the impact is drawn as a glowing chalkboard diagram. It takes about a third of their health; blocked or whiffed, it leaves you wide open.
  - **BRINKHUS — Order of Operations:** six hits labelled P, E, M, D, A, S, the last a launch.
  - **CHAI — Circle Theorem:** a 360° sidestep around them, kicking from every angle, the circle and its radius drawn behind; an arc kick finishes.
  - **DALSASS — Two-Column Proof:** the screen splits into STATEMENTS | REASONS, each hit proves a line, and the last stamps "∴ YOU LOSE."
  - **LEE — Geometric Series:** each hit twice as fast as the last until he blurs; "r > 1: DIVERGES"; a chalk-dust explosion.
  - **LOPEZ — Fundamental Theorem:** a counter stance: hit him in it and time freezes, the derivative and integral panels flash, then the punish.
  - **MIYASHIRO — Imaginary Unit:** he vanishes, reappears behind them and combos; "i² = −1" stamps as they flip upside down.
  - **PEDERSEN — Exponential Overdrive:** off come the sunglasses; three punches marked 2¹, 2², 2³; the last cracks the screen like glass.
  - **RAMOS — Matrix Multiplication:** a grab, then slams across the stage in a 3×3 grid, row by column, and a hair flip.
- **Stage objects:** every stage has one or two things near the walls you can use: a rolling whiteboard and a student desk (Classroom C221), lockers and the vending machine (Math Hallway), a monitor cart and a swivel chair (Computer Lab), a bench and a trash can (Outdoor Campus), a filing cabinet and a desk (Department Office), the gate arm and PEDERSEN's own car, alarm and all (Faculty Parking). Stand next to one and press `T` for a springboard dive at your opponent, or back + `T` to vault over them out of the corner (you can't be hit during the vault). They're free, but each needs 6 seconds before it can be used again (a dial shows it); a `T` key shows when you're close enough. Away from them, `T` is still your taunt.
- **Extra Credit (last chance):** under 25% health, once per match, press `P`+`K`+`H` (no motion): a big EXTRA CREDIT cut-in, your meter refills to three bars, and you hit 20% harder for 7 seconds (you glow gold while it lasts). The HUD tells you when it's ready.

The fighters, and what they teach:

- **PEDERSEN** (power; geometry & math analysis) — the cover fighter, a power brawler with his tie loosened. Slow, heavy, with huge damage. His arch-nemesis is Vicky:
  - **Exponential Armor** (his signature): his heavy attacks absorb a hit during their windup and keep going; a fully charged Order of Magnitude absorbs two. Throws go through it.
  - **Exponential Haymaker** (forward + `H`) splats the wall.
  - **Order of Magnitude** (back + `H`, hold `H` to charge) knocks down at half charge. At full charge it does over double damage and breaks the guard if blocked.
  - **Right Angle Elbow** (forward + `P`) steps in, is plus on hit, and launches on a counter hit.
  - **Logarithmic Launcher** (down + `H`) is his launcher, and **Long Division** (`P`+`K`) is a slam throw.
  - His intro drives his car in (on outdoor stages); he steps out and loosens his tie.
- **BRINKHUS** (balanced; Algebra 1) — an athletic kickboxer, best for new players. Upright and bouncy, with a fast dash:
  - **Long Arms** (his signature): his straights outrange everyone's, and landing one with the very tip hits harder. Forward + `P` is the longest poke in the game.
  - The **Distributive Property** string (`P, K, K`: jab, switch kick, spinning back kick) combos naturally on hit, **Linear Rush** (`H`) is a stepping straight, his launcher is **Solve for X** (down + `H`, a vertical kick) and his throw is **FOIL**.
- **DALSASS** (tricky; geometry: triangles and proofs) — a movement trickster who bobs, sways and keeps switching his lead:
  - **Feint anything:** tap back during the startup of any of his attacks and it never comes out.
  - **Assume the Contrary** (back + `K`) sways back out of highs and mids; if something misses him, `P` counters with **The Converse** (a launcher).
  - **Proof by Contradiction** (forward + `H`) is a feint that looks like his overhead. Cancel it into a jab (`P`), a low (`K`), the real overhead (`H`) or a throw (`P`+`K`), or let it fizzle.
  - **Similar Triangles** (back + `P`) switches to a second stance where `P`, `K` and `H` are different moves. Moving leaves the stance.
  - **Supplementary Slide** (down-forward + `K`) slides under highs and knocks down. **Pythagorean Launcher** (down + `H`), **Congruence Lock** (throw).
  - The crowd cheers louder for him, and he wags a finger when you fall for a feint.
- **CHAI** (technical; geometry: circles, angles, transformations) — taekwondo, almost all kicks, from a light, side-on stance:
  - **Kick Chain** (her signature): once a kick connects, `K` or `H` into a different kick cancels it, up to four kicks (for example `K`, forward + `K`, back + `K`).
  - **Tangent Step:** sidestep, then `P` for a spinning hook kick (or `K` for a low). Her sidestep is the quickest and deepest in the game, and she attacks out of it almost at once; it stays off the line until it hits.
  - **Reflection Counter** (back + `H`) parries highs and mids during frames 2–10, then counters at once. Lows and throws beat it, and a whiffed parry is punishable.
  - **Arc Launcher** (down + `H`) and **Transformation** (throw). She winces apologetically after landing a big hit and offers a hand up when she wins.
- **LEE** (rushdown; geometry, Algebra 1 & 2: sequences) — Muay Thai and boxing from a low, hunched peekaboo stance:
  - **Arithmetic Sequence** (`P, P, P`, then `P` for an elbow or `K` for a low kick) gets faster with every hit.
  - **Dash cancel:** once an attack connects (hit or block), forward, forward cancels its recovery into a dash (once per string).
  - **Recursive Rush** (forward + `P`) repeats on hit when you press `P` again, up to three times.
  - His normals are plus on block. He taunts mid-combo and pushes up his glasses after big hits.
- **LOPEZ** (defensive; calculus) — a Wing Chun / aikido counter-fighter who barely moves:
  - **Asymptote Backdash:** his backdash goes further, recovers sooner, and lows can't touch it early on.
  - **Mean Value Punish:** `P` within 10 frames of blocking is a fast, heavy punisher.
  - **Derivative Read** (back + `H`, hold `H` to keep it up) reads your rate of change: it parries highs, mids and lows and counters each differently (a wrist lock, a palm strike, a trapping sweep). He squints before he counters. Throws beat it.
  - **Limit Break** (down + `H`) is his launcher and **Squeeze Theorem** his throw. He takes his blazer off during his intro.
- **MIYASHIRO** (spacing; Algebra 2) — traditional karate kicks from a deep, wide stance, and a strong backdash:
  - **Domain Control** (forward + `K`, a side kick) is the longest mid in the game.
  - **Domain Restriction** (back + `H`) is a step-back kick that retreats while it attacks.
  - **Range Check** (dash, then `P`) comes out early in a dash.
  - **Vertex Kick** (back + `K`) is a tracking spin kick. **Quadratic Launcher** (down + `H`), **Discriminant** (throw).
  - **Calculated** (his signature): when you whiff near him, his next hit within 2.5 seconds does 30% more damage, and he glows until he lands it.
- **RAMOS** (grappler; Algebra 2: matrices) — a wrestler and luchador, and a cardio machine: the fastest movement in the game, chained dashes, and his guard meter recovers twice as fast. Long, bouncy hair that never stops swinging:
  - **Run:** dash, then keep holding forward. Out of the run: `P` spear tackle, `K` running knee (launches), down + `K` slide, `H` plancha, `P`+`K` **Gauss-Jordan** (a running command grab).
  - **Matrix Lock** (`P`+`K`) has a short break window (8 frames instead of 15).
  - **Determinant Slam** (back + `P`+`K`) is his reverse throw.
  - **Identity** (forward + `P`+`K`) is a command grab: slower, but it can't be broken and takes crouching opponents too.
  - **Transpose Toss** (down + `H`) is his launcher, and dash then `P` is a shoulder charge.

**KO finishers.** When a fighter wins the final round by K.O., FINISH IT! appears: enter their finisher within 2 seconds for a cinematic (a cut-in, slow motion and a big pixel effect, no gore). The CPU uses its finisher when it wins. Practise them in training (menu, FINISHER); the inputs are also in [`MOVES.md`](MOVES.md).

| Fighter | Finisher | Input |
| --- | --- | --- |
| PEDERSEN | Horse to Water: loosens his tie, one massive Exponential Haymaker into his red sports car, car alarm, and his line | `B, F, H` |
| BRINKHUS | Solve for X: a flurry, an uppercut off the top of the screen, a giant X stamp | `F, F, H` |
| CHAI | Q.E.D.: a spinning combo of kicks, a Q.E.D. box, a bow and a hand up | `B, F, K` |
| DALSASS | Pop Quiz: three fake punches (they flinch every time), a finger flick, a red 0/10 | `D, D, P` |
| LEE | Infinite Series: hits that speed up into a blur while the sum climbs, then he fixes his glasses | `F, B, F, P` |
| LOPEZ | Area Under the Curve: he waits, catches their swing, punishes once; a graph shades the area as they fall | `B, B, H` |
| MIYASHIRO | Calculated: a glowing parabola, one strike at the exact point, into the whiteboard | `D, F, K` |
| RAMOS | Cardio Finale: grabs them, runs a full lap of the stage carrying them, slams, hair flip | `F, D, F, P` |

Big hits throw a little of each teacher's math into the air (Y=MX+B, DY/DX, A*A+B*B=C*C...).

### Training mode

Training starts with both fighters' round intros (any button skips) on the stage you picked. There are no rounds or timer. A K.O. shows the win screen: `Enter` for a rematch, `Esc` for character select. Press `Esc`, or click **MENU** at the top of the screen, to open the training menu. The fight pauses while the menu is open. Use up/down to pick a row, left/right to change it, and `Esc` to close. You can also click a row.

| Setting | Options |
| --- | --- |
| Player 2 | Dummy, or Human (second player on the keyboard) |
| Dummy stance | Stand, Crouch, Block all (reads high/mid/low), Random (hit, stand guard or crouch guard per attack), Stand guard, Crouch guard |
| Dummy action | None, Jab, Launcher (punish it), Throw (break it) |
| Dummy knockdown | Stay down, Tech, Random wake-up |
| Dummy throw breaks | Off, On |
| Health | Refill a moment after each combo, or Normal (K.O. resets) |
| Infinite meter | On keeps both Grade meters full (player 2's only when it isn't the CPU), Off |
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
| `7` | Combo trials on/off |
| `8` / `9` | Previous / next combo trial |
| `M` | Mute |
| `C` | Controls overlay |

## Project layout

```
index.html              loads every script in order (no modules, no build)
lib/phaser.min.js       Phaser 3.90, vendored
src/fg.js               global namespace and tuning constants
src/engine/             pure simulation, no Phaser: input buffer, fighter state machine, match loop and walls,
                        combat (hits, juggles, bounds, wall hits, throws, guard meter), training dummy,
                        CPU opponent (ai.js) and round rules (rounds.js)
src/data/               poses, the fighter kit (kit.js), the stage list (stages.js) and one file per fighter in fighters/
src/render/             fighter drawing, procedural motion (motion.js), stage, effects and sound,
                        HUD, pixel font, input display, training menu
src/scenes/             title (menu, options, attract demo), character select, stage select, the fight scene
                        (training, arcade, versus, attract) and the arcade ending
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
- [`ROSTER.md`](ROSTER.md) — the nine fighters: archetypes, looks, personalities, moves and victory lines
- [`MOVES.md`](MOVES.md) — generated move lists with frame data and combo routes
- [`COMBOS.md`](COMBOS.md) — every fighter's combo routes by difficulty, and what the combo feel pass changed
- [`CLAUDE.md`](CLAUDE.md) — working rules for AI-assisted development
