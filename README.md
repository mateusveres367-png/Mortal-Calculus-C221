# Browser Fighting Game

A retro, Tekken-inspired 2D/2.5D fighting game themed around the El Camino Real Math Department. It runs in the browser and is built with HTML5 Canvas and JavaScript using [Phaser 3](https://phaser.io/).

## Status

Early setup. The full vision lives in [`GAME_DESIGN.md`](GAME_DESIGN.md); the game is built in phases, and each phase ships something playable.

## Tech stack

- **Engine:** Phaser 3 (renders to HTML5 Canvas / WebGL)
- **Language:** JavaScript (ES modules)
- **Dev server / build:** Vite (planned)

## Getting started

Once the first playable phase lands:

```bash
npm install
npm run dev      # start a local dev server with hot reload
npm run build    # produce a static build in dist/
```

Open the URL Vite prints (usually http://localhost:5173) in a modern browser.

## Project docs

- [`GAME_DESIGN.md`](GAME_DESIGN.md) — full game vision and design
- [`CLAUDE.md`](CLAUDE.md) — working rules for AI-assisted development
