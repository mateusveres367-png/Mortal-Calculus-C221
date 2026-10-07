# Mortal Calculus: C221 — Combos

Every fighter's combo routes, and what the combo feel pass changed. The routes live in each fighter's file (`combos` in `src/data/fighters/*.js`) and drive the training-mode **combo trials** (key `7`). `node tests/sim.test.js` plays every route against all eight fighters.

## How to read the routes

- **Level:** easy is a basic string anyone can land; medium is a launcher juggle or a wall/setup route; hard is the big one (launcher, jump-cancel air combo, bound, follow-up) and always does the most damage.
- **Inputs:** `UP` after a launcher is the jump cancel (chase them into the air). `D+K ON THE GROUND` is a ground hit on a downed opponent. Damage is the lowest against any opponent.
- Every route is a true combo (the counter climbs 1, 2, 3 and the opponent is never free), works against every fighter, and still works with any input 3 frames early or late.

### PEDERSEN (power)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| SQUARED | easy | P, P | 2 | 25 |
| POWER RULE JUGGLE | medium | D+H, P, P | 3 | 45 |
| EXPONENTIAL GROWTH | medium | AT THE WALL: H, D+H | 2 | 47 |
| TOWER OF POWERS | hard | D+H, UP, AIR K, AIR H, D+K ON THE GROUND | 4 | 62 |

### BRINKHUS (balanced)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| EPSILON-DELTA | easy | P, K, K | 3 | 32 |
| LIMIT BREAK JUGGLE | medium | D+H, P, P, D+K ON THE GROUND | 4 | 36 |
| HARD LIMIT | medium | AT THE WALL: H, P, P, D+H | 4 | 43 |
| LIMIT AT INFINITY | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 55 |

### CHAI (technical)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| RIGHT TRIANGLE | easy | P, K | 2 | 18 |
| PARABOLA JUGGLE | medium | D+H, P, K | 3 | 32 |
| VERTEX SPIKE | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 53 |

### DALSASS (tricky)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| COMPOSITION | easy | P, P | 2 | 17 |
| DISCONTINUITY JUGGLE | medium | D+H, P, P | 3 | 33 |
| SLIDE AND STOMP | medium | D/F+K, D+K ON THE GROUND | 2 | 20 |
| INVERSE SPIKE | hard | D+H, UP, AIR K, AIR H, K | 4 | 53 |

### LEE (rushdown)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| ARITHMETIC SEQUENCE | easy | P, P, P, P | 4 | 31 |
| RECURSIVE RUSH | easy | F+P, P, P | 3 | 29 |
| FIBONACCI JUGGLE | medium | D+H, P, P, P, D+K ON THE GROUND | 5 | 36 |
| FIBONACCI SPIKE | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 53 |

### LOPEZ (defensive)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| SAMPLE MEAN | easy | P, P | 2 | 18 |
| OUTLIER JUGGLE | medium | D+H, P, P, D+K ON THE GROUND | 4 | 39 |
| CONFIDENCE INTERVAL | medium | BLOCK THEIR JAB, P, D+K ON THE GROUND | 2 | 25 |
| NORMAL DISTRIBUTION | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 62 |

### MIYASHIRO (spacing)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| UNIT VECTORS | easy | P, P | 2 | 16 |
| CROSS PRODUCT JUGGLE | medium | D+H, P, P, D+K ON THE GROUND | 4 | 35 |
| CALCULATED RUSH | medium | THEY WHIFF A JAB, F, F+P (CALCULATED BONUS) | 1 | 21 |
| VECTOR SPACE | medium | AT THE WALL: H, F+K, D+H | 3 | 42 |
| PROJECTION SPIKE | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 54 |

### RAMOS (grappler)

| Route | Level | Inputs | Hits | Damage |
| --- | --- | --- | --- | --- |
| ROW AND COLUMN | easy | P, P | 2 | 18 |
| TRANSPOSE JUGGLE | medium | D+H, P, D+K ON THE GROUND | 3 | 29 |
| IDENTITY STOMP | medium | F+P+K, D+K ON THE GROUND | 2 | 38 |
| RANK SPIKE | hard | D+H, UP, AIR P, AIR K, AIR H, K | 5 | 55 |

## What changed in the combo feel pass

**Hit feel**
- Hitstop now comes from move strength: jabs 4 frames, mediums 7, heavies 11, launchers 15. Combo finishers (knockdowns, wall splats, bounds, wall blasts) hang 17, counter hits add 5, and a K.O. hangs 30.
- Each hit in a combo plays a little higher in pitch than the last, and its sparks get bigger.
- Counter hits flash the screen, slam a big COUNTER! onto the attacker's side, and add a deep boom and clang.

**Juggle physics**
- Launchers throw the opponent up 20% faster on a heavier arc (juggle gravity 0.3 → 0.42): high, quick, not floaty.
- Hits on an airborne opponent pop them by a fixed amount per strength (light 3.8, medium 4.3, heavy 4.8), 10% less per juggle hit, so the same juggle always behaves the same way.
- Juggle gravity grows 7% per hit in the combo (up to double), so juggles end on their own.
- Bounds slam down harder (9) and bounce higher (7); an air bound also drives the attacker down so the ground follow-up connects.
- A knocked-down opponent falling to the floor can't be juggled (only ground hits reach them) and doesn't wall splat.

**Camera and screen**
- The camera zooms in toward the impact on launchers, bounds and combo finishers, more for the end of a big combo and most for a K.O. The HUD has its own camera and never zooms.
- Screen shake scales with damage.
- The final hit of a 5+ hit combo, the landing after a big juggle, and round-winning hits play in slow motion.
- Wall splats pin the opponent to the wall for 18 frames (briefly again on each wall hit) with a big crack behind them, then they slide down. Moves marked to wall splat do so before their knockdown applies.

**Combo counter**
- A big pixel hit count with total damage on the attacker's side, popping and shaking on every hit, with rank labels: NICE (5+), GREAT (8+), INCREDIBLE (12+), PROOF COMPLETE (15+).

**Input feel**
- 8-frame input buffer (and presses during hitstop wait for the next frame).
- A buffered press keeps the directions you held when you pressed it, plus any added within 2 frames: an early D+H still launches after you let go of down.
- Cancels show as a quick afterimage with a whip sound, and the frame data panel lists each move's chain buttons and window.
- The combo counter resets the moment the opponent is free, so a hit on the frame they recover starts a new combo.

**Routes**
- Every fighter has an easy, a medium and a hard route (plus their specials), retimed for the new physics. Damage rises with difficulty.
- New easy strings: DALSASS's COMPOSITION and MIYASHIRO's UNIT VECTORS.
- Longer medium juggles for BRINKHUS, LEE, LOPEZ and MIYASHIRO (an extra ground hit); BRINKHUS, CHAI, DALSASS and MIYASHIRO's juggles now chain their jab strings instead of a slow mid.
- LOPEZ's hard route now ends on a mid kick after the bound (a real timing check instead of a lenient ground hit).
- PEDERSEN's launcher goes higher (launch 7.4 → 8.2) so his slow follow-ups still connect.
- Removed: CHAI's VERTEX BOUND and DALSASS's FAKE OUT (no longer combos with snappier juggles). LEE's string ender no longer wall splats, so mashing P at the wall stays a 4-hit string.
- Combo routes are timed in game frames (hitstop doesn't count).

## Self-check (in `tests/sim.test.js`)

- Every route against every fighter: right hits, true combo, ±3 frames of slack on each input, a difficulty, one trial step per hit.
- Damage rises easy → medium → hard, and no route takes more than 40% of anyone's health.
- Nothing infinite: juggle gravity is capped and grows with every hit, pops shrink, wall hits are limited, a mashed juggle ends, and 10+ hits into a combo hitstun starts to decay. Random button mashing (24 seeded runs per fighter, at the wall and in the open) never lands 8 hits and never keeps the dummy from being free for 400 frames.
- Nothing too easy: mashing a single button (P, K, H or D+H) never gets more than 4 hits, even at the wall, and every hard route contains an input with no more than 14 frames of leeway (the post-bound follow-up, 9-13 frames).
