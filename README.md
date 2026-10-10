# Mortal Calculus: C221

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

**Phase 7 — modes and screens (playable).** All nine fighters from [`ROSTER.md`](ROSTER.md): **PEDERSEN** (power, math analysis; the cover fighter), **BRINKHUS** (balanced, Algebra 1), **CHAI** (technical, geometry), **DALSASS** (tricky, triangles and proofs), **LEE** (rushdown, sequences), **LOPEZ** (defensive, calculus), **MIYASHIRO** (spacing, Algebra 2), **RAMOS** (grappler, matrices) and **WILSON** (veteran master, every subject; the arcade boss). And on the **student side**, 10th graders: **MATEUS** "Gnome" (Muay Thai striker; the student side's cover fighter), **NICOLAS** "The Late Pass" (Taekwondo: flashy jumping and spinning kicks that chain into each other on hit), **MAX** "Heavy Course Load" (a wrestler: takedowns, a sprawl, and submissions on the mat) and **JACK** "Back of the Classroom" (a kickboxer whose punches flow into faster kicks and back) and **HUDSON** "Calculator Kid" (a counterpunching boxer: slips, ducks, weaves and lean-backs, and every hit after a dodge is a counter hit) (see [`ROSTER.md`](ROSTER.md)). No two fight alike: each has their own style, stance, movement, weight, hit reactions and signature mechanic.

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
- **Stages (phase 6):** seven stages with parallax depth and small animations, and students in the background who cheer on big combos, flinch at big hits, gasp at counter hits, jump up for a K.O. and go wild for a finisher:
  - **Classroom C221:** whiteboards full of math, desks with calculators, a ticking clock, a flickering tube light
  - **Math Hallway:** lockers, classroom doors, bulletin boards, a humming vending machine, students walking past
  - **Computer Lab:** a bench of CRT monitors plotting sine waves, bar charts and spirals; students spin round to watch
  - **Outdoor Campus:** buildings at dusk, a clock tower, swaying trees, a waving flag, drifting clouds and birds
  - **Department Office:** bookshelves, filing cabinets, a turning ceiling fan, a printer that never stops, screensavers
  - **Faculty Parking:** PEDERSEN's stage; his red sports car sits in his reserved spot, cars pass on the road behind
  - **Lunch Quad:** the students' stage at noon: lunch tables full of students eating (they stop to watch the big moments), trash cans, backpacks dumped everywhere, pigeons, and a paper airplane drifting past now and then
  - each fighter has a home stage (player 2's is used); PEDERSEN drives in only on outdoor stages and walks in indoors
- **Modes and screens (phase 7):**
  - a late-90s arcade title screen: the faculty lot at sunset, PEDERSEN in sunglasses leaning on his red sports car with a smoking cigar, the other seven in silhouette behind him catching rim light in their colours, a chrome MORTAL CALCULUS logo that slams in with a red C221 stamp, PRESS START, CRT scanlines and a synth-rock loop (Web Audio). The menu: **Arcade**, **Detention**, **Timed Test**, **VS CPU**, **Versus**, **Training**, **Records**, **Options**. Leave it for 15 seconds and the attract demo plays three short CPU vs CPU clips with cut-ins, then comes back; any key ends it
  - character select with pixel portraits on two tabs, **TEACHERS | STUDENTS** (`Q`/`E` or tap a tab; player 2 in versus `[`/`]`). **Student mode** is locked: opening the STUDENTS tab brings up a retro keypad; type the 4-digit code (number keys, or tap the keys): a wrong one is ACCESS DENIED, the right one is ACCESS GRANTED and the students stay unlocked in that browser; both players pick at the same time in versus; then stage select with a live, panning preview of each stage (or RANDOM)
  - **The student side:** 10th graders, a little smaller than the teachers, who fight scrappier with whatever school stuff is at hand. Each of them has their own martial art (Muay Thai, Taekwondo, wrestling, kickboxing, boxing). Students and teachers fight each other in every mode. Their cut-ins are pages of notebook paper with doodles in the margins (MATEUS's are red brushstrokes on black)
  - **Arcade:** one CPU opponent at a time on their home stage, WILSON last (as a teacher, the students first, then the rest of the department; as a student, all nine teachers); win to see who's next, lose and you get a 10-second CONTINUE?; beat everyone for the ending
  - **Versus:** player 1 against player 2 on one keyboard
  - **Detention** (survival): one opponent after another at random, one round each, on a single health bar that only refills 30% after each win; the CPU gets tougher as you go, and the win screen keeps count of how many you've beaten (your best is in Records)
  - **Timed Test:** arcade against the clock (fight time only); the ladder shows your time and your best, and the ending shows NEW RECORD when you beat it
  - **Quick rematch:** `R` on any win screen runs the same fight again at once (in arcade it counts as a continue if you lost; in Detention it starts a fresh run)
  - best of three rounds with ROUND 1 / READY / FIGHT, a round timer (time out goes to whoever has more health left), round markers, K.O., TIME, PERFECT (a round won without taking damage), CLOSE CALL (won with under 10% health left) and FINAL ROUND, and a victory screen with the score
  - fight music (synthesized) that picks up in the final round and again when either fighter is low
  - **Rewards** (saved in your browser): winning with a fighter unlocks their alternate outfits (NIGHT SCHOOL at 1 win, GOLD STAR at 3, CHALK DUST at 6, RED PEN at 10; `Z`/`X` on character select, player 2 `Num4`/`Num5`); milestones earn titles shown under your fighter's name (FRESHMAN, HONOR ROLL for 10 wins, VALEDICTORIAN for beating arcade, DETENTION SURVIVOR, PERFECT ATTENDANCE, GOLD STAR for a finisher, LONG DIVISION for a 15-hit combo, SPEED READER, DEAN'S LIST, FACULTY LOUNGE, TENURED); **Records** on the title menu shows wins per fighter, your longest combo, most-used fighter, finishers landed and more, and picks which title you show
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

- **Arcade:** pick your fighter (arrows or WASD, `Enter` or `J`). As a teacher, fight the students first, then the rest of the department (your own mirror match included, then PEDERSEN, then WILSON, the final boss); as a student, fight all nine teachers, ending with WILSON. Beat arcade once to unlock WILSON for arcade and VS CPU (he's always playable in training and versus). The CPU gets harder with every fight; a ladder screen before each one shows the tower and the next opponent's line for you. Lose and CONTINUE? counts down; win them all for the ending and your fighter's victory line.
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
| Ultimate (3 bars) | `U` | `Numpad 0` (or `[`) |

Standing guard blocks highs and mids. Crouching guard (down + back) blocks lows, and highs whiff over anyone crouching. Mids beat crouching guard; lows beat standing guard.

### Playing on a phone or tablet

Open `index.html` on a touch screen (or add `?touch=1` to the address) and touch controls appear over the game: a d-pad on the left, and **P** (punch), **K** (kick), **H** (heavy) and **★** on the right, with **START** and **II** (pause) in the corner. Tap the game to get past the title and confirm on menus; the d-pad and P work every menu. The game goes fullscreen and landscape where the browser allows; in portrait it sits at the top with the controls below.

Kept simple on purpose:

- **Mash P** to keep a string going (Easy Combos is always on for touch players). Down + H is still the launcher, hold back to block, and tap forward twice to dash.
- **★ does the big thing for you:** with a full meter it fires your ultimate (it presses the ultimate key); when you're low it cashes in Extra Credit; next to a stage object it uses it (and vaults out if you're cornered); during a special with a bar it powers it up; otherwise it throws.

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
| `P`+`K` up close (MATEUS) | the clinch: then `P` knees, `K` dump, `H` jumping knee, back elbow; escape with `P` as it locks, or mash |
| hold the button | charge moves (PEDERSEN's Order of Magnitude) |
| while knocked down | up gets up, back or forward rolls, a sidestep key rolls sideways, `K` or `P` does a wake-up kick |
| just before landing from a juggle | `P`, `K` or `H` tech rolls (not after sweeps, bounds or wall splats) |

### Meter and big moves

- **Grade meter:** three bars under your health bar, graded **C**, **B** and **A**. It fills when you land hits, when you block and when you take damage, and a little faster (×1.25) while you're behind on health. A bar chimes and flashes when it fills, and all three full pulses. The meter carries over between rounds.
- **Enhanced specials (1 bar):** press `P`+`K` during the startup of a special to power it up: more damage plus extra hits, armor, a launch or a wall splat, depending on the move. The fighter flashes in their colour and a `+` pops onto the move's name. Every fighter has three; they're listed in [`MOVES.md`](MOVES.md).
- **Ultimates (3 bars):** press the ultimate key (`U` for player 1, `Numpad 0` or `[` for player 2; both can be remapped in OPTIONS), or the motion down, down-forward, forward + `P`+`K`+`H` (either also works straight out of a move that hits). When your meter is full, the key flashes next to it. If it connects, the fighter's own cinematic plays: a cut-in, then a scene of their own (often somewhere else entirely) with its own camera work and sounds. Big hits stay cartoony. It takes about a third of their health; blocked or whiffed, it leaves you wide open.
  - **BRINKHUS — Fast Break:** a whistle, a cut to the running track (a sprint, a hurdle over a bench), back in with a flying knee; a giant X stamps SOLVED.
  - **CHAI — Compass Construction:** a giant compass planted beside them; she circles them kicking on every pass as the circle draws itself, a protractor snaps to 90°, an axe kick, and "Sorry!"
  - **DALSASS — Pop Quiz:** they're suddenly at a student desk with a quiz and a ticking timer; he snatches it, red-pens a giant F, and smacks them with the whole stack as the class goes wild.
  - **LEE — Grading at 11 PM:** his desk at night; every red check mark is a hit, faster and faster; a sigh, the glasses, and the red pen flicked across the room.
  - **LOPEZ — I Knew It:** a counter stance: hit him in it and the blinds come down on a corkboard of red string and photos of your habits; you attack three times, he dodges without looking, "I knew it.", one perfect punish.
  - **MIYASHIRO — System of Equations:** two glowing lines from opposite corners, a copy of him charging down each; they meet exactly at the intersection: SOLUTION FOUND.
  - **PEDERSEN — Horsepower:** on go the sunglasses; he revs his red sports car and drives straight across the stage into them; they bounce off the hood, the car skids to a stop, and he leans out of the window with his line.
  - **RAMOS — Max Incline:** a grab, then a 24-hour gym: a treadmill cranked to max, sparks, the speed climbing, his bowl cut flapping; he launches off the end, crashes back into the stage, and finishes with a flying tackle and a slam.
  - **WILSON — Tenure:** the stage goes dark but for a chalkboard; he writes one equation in silence while 29 years of classes flicker past, a hit on every year; he caps the marker, turns around, and they're already down.
  - **MATEUS — Eight Limbs:** he catches them in the clinch, the screen goes black and red, and eight strikes land, each named as it hits: LEFT FIST, RIGHT FIST, LEFT ELBOW, RIGHT ELBOW, LEFT KNEE, RIGHT KNEE, LEFT SHIN, and a RIGHT SHIN head kick with a huge impact freeze.
  - **NICOLAS — Five-Minute Passing Period:** the bell rings and a huge LED clock counts down 5:00 at hyperspeed while he lands a nonstop chain of jumping, spinning and flying kicks from both sides, the hallway crowd rushing past; at 0:00 a flying side kick into the far wall. "Made it."
  - **MAX — Finals Week:** a double-leg down onto the mat, the mount and a ground strike for every exam on the calendar (MON to FRI, crossed off one by one), then a rear naked choke until they TAP. "Pencils down."
  - **JACK — Highlight Reel:** the fight turns into a broadcast (LIVE, his name on a lower third) for a punch-kick flurry called hit by hit; the tape rewinds, and the instant replay plays a spinning back fist and a head kick that freezes on the frame. PLAY OF THE DAY.
  - **HUDSON — Can't Touch This:** everything slows down; they throw punch after punch and he slips, ducks, weaves and leans back from every one (MISS, MISS, MISS...), then time snaps back for body, body, head, the right hand and an uppercut off the floor.
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
- **LEE** (rushdown; geometry, Algebra 1 & 2: sequences) — a boxer, from a low, hunched peekaboo stance:
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
- **RAMOS** (grappler; Algebra 2: matrices) — a wrestler and luchador, and a cardio machine: the fastest movement in the game, chained dashes, and his guard meter recovers twice as fast. A black helmet of a bowl cut that bounces with every step:
  - **Run:** dash, then keep holding forward. Out of the run: `P` spear tackle, `K` running knee (launches), down + `K` slide, `H` plancha, `P`+`K` **Gauss-Jordan** (a running command grab).
  - **Matrix Lock** (`P`+`K`) has a short break window (8 frames instead of 15).
  - **Determinant Slam** (back + `P`+`K`) is his reverse throw.
  - **Identity** (forward + `P`+`K`) is a command grab: slower, but it can't be broken and takes crouching opponents too.
  - **Transpose Toss** (down + `H`) is his launcher, and dash then `P` is a shoulder charge.

The students (10th graders, each with their own martial art):

- **MATEUS** "Gnome" (balanced / striker) — Muay Thai, the student side's cover fighter: calm, a little cocky, all eight limbs from a tall, square stance. **The Clinch** (`P`+`K` up close) locks his hands behind their head: `P` knees (up to three, each stronger), `K` dumps them, `H` is a jumping knee that launches, back breaks off with an elbow; they escape with `P` right as it locks, or by mashing. **Low Kick** (down + `K`) stacks leg damage (three slow their walk); **Check** (press back just as a low kick lands) takes it on the shin and staggers the kicker; **Spinning Elbow** (back + `H`) hits almost twice as hard on a counter; **Head Kick** (forward + `H`) carries them into the wall on a counter; **Superman Punch** out of a dash.
- **NICOLAS** "The Late Pass" (Taekwondo) — **Kick Chain** (his signature): any kick that hits cancels into a different kick, up to five in a row. The **Snap Kick** (`K`) chains into itself (`K, K, K`: head, body, head); **Double Roundhouse** (back + `K`), **Back Kick** (forward + `K`, wall splat), **Axe Kick** (forward + `H`, an overhead), **Tornado Kick** (down + `H`, his launcher), the slow, huge **540 Kick** (back + `H`) and the **Hopping Side Kick** (`F, F, K`) across the screen. His hands are only a jab and a cross; he still has the fastest dash in the game.
- **MAX** "Heavy Course Load" (wrestling) — **Submissions** (his signature): after any knockdown or takedown, `H` next to the downed opponent starts a hold: `H` armbar, down + `H` rear naked choke, forward + `H` kimura, back + `H` triangle. A struggle meter: they mash to escape, he mashes to tighten, and when it fills they tap. The **Double-Leg Takedown** (forward + `H`) ducks under highs and puts them down; the **Sprawl** (back + `K`) catches lows, takedowns and throws; **Snap Down** (forward + `P`) staggers; **Body Lock Suplex** (`P`+`K`) and **Arm Drag** (back + `P`+`K`) are his throws.
- **JACK** "Back of the Classroom" (kickboxing) — **Flow** (his signature): a punch that lands makes his next kick faster and stronger, and a kick his next punch. **Jab–Cross–Hook** (`P, P, P`), **Punch-to-Kick** (`P, P, K`), **Switch Kick** (forward + `K`), **Low Kick** (down + `K`, three slow their walk), the **Question Mark Kick** (forward + `H`: a high, or press `K` in its chamber to keep it on the body), the **Spinning Back Fist** (back + `P`, huge on a counter hit) and the **Flying Knee** (down + `H`, his launcher).
- **HUDSON** "Calculator Kid" (boxing) — **Counterpuncher** (his signature): head movement, **Slip** (forward + `K`), **Duck** (down + `K`), **Weave** (back + `K`) and **Lean Back** (back + `P`+`K`), makes attacks miss, and anything he lands right after is a counter hit. Dodges chain into each other and into any punch. **Jab, Double Jab, Lead Hook** (`P, P, P`), **Rear Uppercut** (down + `P`), **Shovel Hook** (forward + `P`), **Pull Counter** (back + `P`), **Overhand Right** (forward + `H`), **Check Hook** (back + `H`), **Bolo Punch** (down + `H`, his launcher) and one **Stomp** for lows (down-back + `K`).

**KO finishers.** When a fighter wins the final round by K.O., FINISH IT! appears: enter their finisher within 2 seconds for a cinematic (a cut-in, slow motion and a big pixel effect, no gore). The CPU uses its finisher when it wins. Practise them in training (menu, FINISHER); the inputs are also in [`MOVES.md`](MOVES.md).

| Fighter | Finisher | Input |
| --- | --- | --- |
| PEDERSEN | Escape Velocity: loosens his tie, one massive Exponential Haymaker sends them off the top of the screen to twinkle out like a star | `B, F, H` |
| BRINKHUS | Solve for X: a flurry, an uppercut off the top of the screen, a giant X stamp | `F, F, H` |
| CHAI | Q.E.D.: a spinning combo of kicks, a Q.E.D. box, a bow and a hand up | `B, F, K` |
| DALSASS | See Me After Class: three fake punches (they flinch every time), a finger flick, a sticky note | `D, D, P` |
| LEE | Infinite Series: hits that speed up into a blur while the sum climbs, then a shrug | `F, B, F, P` |
| LOPEZ | Area Under the Curve: arms folded, one rising palm launches them; a graph shades the area as they fall | `B, B, H` |
| MIYASHIRO | Calculated: a glowing parabola, one strike at the exact point, into the whiteboard | `D, F, K` |
| RAMOS | Cardio Finale: grabs them, runs a full lap of the stage carrying them, slams, hair flip | `F, D, F, P` |
| WILSON | Class Dismissed: checks his watch, one clean strike, the bell rings, and he walks off without looking back | `D, B, H` |
| MATEUS | Lights Out: he steps back, the crowd goes silent, a slow-motion flying knee; he walks away before they hit the floor, GNOMED. | `B, B, K` |
| NICOLAS | Tardy: a slow-motion 540 kick, the bell rings on impact, they spin and drop, a TARDY SLIP | `F, F, F, K` |
| MAX | All-Nighter: a slow-motion suplex into an armbar, they tap, then he lies back and falls asleep, snoring, at 3:00 AM | `D, D, H` |
| JACK | Back Row: a slow-motion question mark kick, a little hop, and he walks off to his seat | `B, D, F, K` |
| HUDSON | Extra Credit: their last swing misses by an inch as he leans back, one counter hook, a gold star | `B, F, P` |

Big hits throw a little of each fighter's math into the air (Y=MX+B, DY/DX, A*A+B*B=C*C...; GNOMED, ERROR...).

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
                        combat (hits, juggles, bounds, wall hits, throws, guard meter), projectiles and teleports, training dummy,
                        CPU opponent (ai.js) and round rules (rounds.js)
src/data/               poses, the fighter kit (kit.js), the stage list (stages.js) and one file per fighter in fighters/
src/render/             fighter drawing, procedural motion (motion.js), stage, effects and sound,
                        HUD, pixel font, input display, training menu
src/scenes/             title (menu, options, attract demo), character select, stage select, the fight scene
                        (training, arcade, versus, attract) and the arcade ending
tools/movelist.js       regenerates MOVES.md from the fighter data
tools/combotable.js     regenerates the route tables in COMBOS.md
tools/balance.js        headless Hard CPU vs Hard CPU matches: win rates, matchups, move use (see BALANCE.md)
tests/sim.test.js       headless engine tests (node tests/sim.test.js)
tests/smoke.js          optional browser smoke test over file:// (needs Playwright)
```

## Tests

Playing needs nothing but a browser. For development:

```bash
node tests/sim.test.js   # engine tests: frame data, hit levels, counter hits, sidestep, juggles, movement
node tests/smoke.js      # optional: opens index.html from disk in headless Chromium (requires Playwright)
node tools/balance.js 24 # self-playtest: every pairing, 24 matches each side, Hard CPU vs Hard CPU
```

## Tech stack

- **Engine:** Phaser 3 (renders to HTML5 Canvas / WebGL), vendored locally
- **Language:** plain JavaScript loaded with classic `<script>` tags
- **Build:** none

## Project docs

- [`GAME_DESIGN.md`](GAME_DESIGN.md) — full game vision and design
- [`ROSTER.md`](ROSTER.md) — the fourteen fighters (nine teachers, five students): archetypes, looks, personalities, moves and victory lines
- [`MOVES.md`](MOVES.md) — generated move lists with frame data and combo routes
- [`COMBOS.md`](COMBOS.md) — every fighter's combo routes by difficulty, and what the combo feel pass changed
- [`BALANCE.md`](BALANCE.md) — Hard CPU vs Hard CPU win rates before and after tuning, and what changed
- [`CLAUDE.md`](CLAUDE.md) — working rules for AI-assisted development
