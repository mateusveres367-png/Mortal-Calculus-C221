# CLAUDE.md

The game is called **Mortal Calculus: C221**. Use that name for the title screen, the browser tab and the docs (`FG.TITLE` in `src/fg.js` holds it for code).

## Start here

Read [`GAME_DESIGN.md`](GAME_DESIGN.md) for the full vision of the game before making changes. It is the source of truth for what we are building.

## How we build

- **We build in phases.** Work on the current phase only; don't pull in features from later phases early.
- **Every phase must stay playable.** At the end of each phase (and ideally after every commit), the game must load in the browser and be playable end to end. Never leave the game in a broken or half-wired state.

## Stack and how it runs (applies to every phase)

This is a browser game: **HTML5 Canvas + JavaScript, using Phaser 3.** It must be **runnable by opening `index.html` directly in a browser** (double-click, `file://`): no install, build step, or local server required. Every phase must keep it that way.

What that means in practice:

- **No build tooling.** No npm, bundler, transpiler, or dev server is needed to play. Ship plain `.js`, `.css`, and `.html` files.
- **Vendor Phaser locally** (e.g. `lib/phaser.min.js`) and load it with a `<script>` tag, so the game also runs offline. Don't depend on a CDN.
- **Use classic `<script>` tags, not ES modules.** Browsers block `type="module"` and `import` over `file://`. Load scripts in dependency order and share code through a single global namespace object.
- **Don't fetch files at runtime.** `fetch`/XHR of local files fails over `file://`, and Phaser's loader uses XHR by default. Instead:
  - put data (move lists, frame data, stage configs) in `.js` files that assign to the global namespace, not `.json`;
  - generate textures and sprites in code, or embed them in `.js` as data URIs, or set Phaser's `loader.imageLoadType: 'HTMLImageElement'` for image files;
  - synthesize sounds with the Web Audio API or embed them as data URIs.
- **Check every phase by opening `index.html` from disk** in a browser, not through a server, and confirm it loads and plays with no console errors.

## Codebase

- `index.html` loads every script in dependency order. A new file must be added there.
- `src/engine/` is pure simulation with no Phaser: it runs at a fixed 60 steps per second and can be tested in Node. Keep rendering, sound and input reading out of it.
- `ROSTER.md` is the source of truth for the eight fighters (identity, look, personality, moves, victory lines). Each fighter is defined in `src/data/fighters/<name>.js` with `FG.defineFighter` (see `src/data/kit.js` for the format and shared move templates). After changing fighter data, run `node tools/movelist.js` to regenerate `MOVES.md`.
- Fighter move data holds each move's frame data. Startup counts the press frame as frame 1, so a 10-frame move hits on the 10th frame. Block and hit values are frame advantage, and the engine derives stun from them.
- `src/engine/combat.js` resolves contact (strikes, juggles, bounds, wall and ground hits, throws, guard pressure). Per-combo limits (one bound, one wall splat, ground hits) live on the fighter and reset when it is free again.
- `src/engine/dummy.js` is the training dummy: it produces raw inputs from its settings, like a keyboard would. Training UI (menu, input display) lives in `src/render/` and training options on the fight scene.
- Smack talk: each fighter's `talk.lines` (pre-round and taunt lines) and `talk.quips` (short lines after big combos and counter hits). Rivalry exchanges are in `src/data/talk.js`. Speech boxes are `src/render/speechBox.js`.
- Stages: `src/data/stages.js` lists them (classroom, hallway, lab, campus, office, parking); `src/render/stage.js` draws each in parallax layers with `anim` layers redrawn every tick and student crowds that `cheer` and `react` ('big' / 'ko'). A fight is on the picked stage or player 2's `homeStage`. PEDERSEN's car (`src/render/car.js`, no real badges or logos) drives in only on `outdoor` stages; otherwise the parking lot shows it in his reserved spot.
- `src/render/` draws from simulation state; `src/scenes/fightScene.js` reads the keyboard (or the dummy / CPU), steps the match and renders.
- Modes: the title menu leads to arcade, versus and training through `src/scenes/selectScene.js` and `src/scenes/stageSelectScene.js`; the fight scene's `mode` is 'training', 'arcade', 'versus' or 'attract' (the title's idle demo). Outside training, `src/engine/rounds.js` runs best of three with a timer, and the scene runs ROUND / READY / FIGHT, round ends and the victory screen. `src/engine/ai.js` is the CPU (levels in `FG.AI_LEVELS`): like the dummy it returns raw inputs, sees attacks only after its reaction delay, and plays the fighter's own combo routes. Settings (difficulty, round time, sound) live in `FG.settings`.
- Combo routes (`combos` in each fighter file) are tested against every opponent as true combos, and drive the training-mode combo trials (`src/render/comboTrials.js`). Each route has a `difficulty` (easy, medium, hard); `FG.comboSteps` splits its `notation` into one trial step per hit (UP and dash taps join the next hit; 'AT THE WALL:' and similar become the setup line). Plans are game frames from the first press (hitstop doesn't count).
- `src/render/motion.js` layers procedural motion on the keyframed poses: anticipation, strike and recovery on every attack (by motion kind), planted feet with real steps, IK for knees and elbows, hit reactions and strike trails. It also classifies each attack's impact kind (jab, body, power, launch, overhead, low) for effects and sounds. Keep the striking hand or foot pinned to its authored pose during active frames so visuals match hitboxes.

## Checks before committing

- `node tests/sim.test.js` must pass. When combo routes or juggle physics change, keep `COMBOS.md` up to date. It checks that the frame advantage the engine actually produces matches the declared frame data, plus hit levels, counter hits, sidestep, juggles and movement. Add tests for new mechanics.
- Open `index.html` from disk and play. `node tests/smoke.js` does a headless version of that when Playwright is available.
