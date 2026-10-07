# CLAUDE.md

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
