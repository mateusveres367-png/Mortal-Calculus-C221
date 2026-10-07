# CLAUDE.md

## Start here

Read [`GAME_DESIGN.md`](GAME_DESIGN.md) for the full vision of the game before making changes. It is the source of truth for what we are building.

## How we build

- **We build in phases.** Work on the current phase only; don't pull in features from later phases early.
- **Every phase must stay playable.** At the end of each phase (and ideally after every commit), the game must load in the browser and be playable end to end. Never leave the game in a broken or half-wired state.

## Stack

- Browser game: HTML5 Canvas + JavaScript, using Phaser 3.
