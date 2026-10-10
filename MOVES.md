# Mortal Calculus: C221 — Move lists

Generated from the fighter data by `node tools/movelist.js`; don't edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).

**Grade meter:** three bars, C, B and A, under your health bar. They fill as you land hits, block and take damage, a little faster while you're behind, and carry over between rounds. **Enhanced specials** cost one bar: press P+K during the startup of a special that has one (listed under each fighter) and it powers up, the fighter flashing in their colour. **Ultimates** cost all three: press the ultimate key (player 1 U, player 2 Numpad 0 or [, remappable in OPTIONS; ★ on a touch screen), or down, down-forward, forward + P+K+H (either also straight out of a move that hits). If it connects, the fighter's own cinematic plays (each one listed under the fighter) and takes about a third of their health; blocked or whiffed, it leaves you wide open. **Extra Credit:** once a match, under 25% health, P+K+H (no motion) refills the meter and adds 20% damage for 7 seconds. **Stage objects:** next to one, T is a springboard dive (Springboard below) and back + T a vault over the opponent out of the corner (Vault); each object then needs 6 seconds.

**Two sides:** the nine teachers, then the five students (10th graders, on the STUDENTS tab of character select). Students are a little smaller and fight scrappier, and only students have **projectiles**: one of their own on screen at a time, dodged by a sidestep, cancelled by another projectile, knocked away by a parry and soaked by armor. A projectile's frame data is for point-blank range; further out, the hit or block stun never drops below 16 / 10 frames. Some students also **teleport** (vanish, no hurtbox, then reappear next to the opponent).

Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.

# Teachers

## PEDERSEN — Power — Math Analysis

Calm and friendly, but every hit is heavy. Slow, patient, devastating.

**Style:** Power brawler. **Signature:** Exponential Armor — his heavy attacks (Base Hook, the Exponential Haymaker, Order of Magnitude) absorb one hit during their windup and keep going; a fully charged Order of Magnitude absorbs two.

**Movement:** walk 1.4 forward / 1.2 back, dash 6.2 for 13 frames, backdash 6.8, jump 8.6, weight 1.12 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Power Jab | high | 11 | 2 | 14 | 0 | +7 | +10 | 9 |  |
| P,P | Squared | high | 12 | 3 | 19 | -5 | +4 | +10 | 14 |  |
| P,P,H | Exponent Rule | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Right Angle Elbow | mid | 15 | 3 | 18 | -5 | +5 | launch | 16 | enhance with P+K |
| F,F+P | Common Log | mid | 14 | 4 | 22 | -10 | knockdown | knockdown | 18 | enhance with P+K |
| K | Exponent Kick | mid | 16 | 3 | 20 | -7 | +5 | +10 | 17 |  |
| D+K | Negative Exponent | low | 18 | 3 | 22 | -13 | 0 | +6 | 12 | hits downed opponents, ducks highs |
| D/B+K | Zero Power Sweep | low | 22 | 3 | 26 | -18 | knockdown | knockdown | 18 | ducks highs |
| H | Base Hook | mid | 21 | 4 | 20 | +1 | +8 | launch | 20 | wall splats, armor: absorbs 1 hit on frames 6-20 |
| F+H | Exponential Haymaker | mid | 26 | 4 | 22 | -6 | knockdown | launch | 24 | wall splats, armor: absorbs 1 hit on frames 8-25, enhance with P+K |
| B+H (HOLD) | Order Of Magnitude | mid | 20 | 4 | 22 | -8 | +4 | knockdown | 16 | wall splats, armor: absorbs 1 hit on frames 6-19 (2 at full charge), hold to charge |
| D+H | Logarithmic Launcher | mid | 17 | 4 | 24 | -17 | launch | launch | 20 | jump cancel on hit (UP) |
| P+K | Long Division | throw | 12 | 2 | 28 |  |  |  | 33 | break with P |
| B+P+K | Synthetic Division | throw | 12 | 2 | 28 |  |  |  | 34 | break with K |
| AIR P | Exponent Drop | mid | 9 | 4 | 10 |  |  |  | 12 | hitstun 16, blockstun 10, landing 6 |
| AIR K | Power Kick | mid | 11 | 5 | 12 |  |  |  | 15 | hitstun 18, blockstun 12, landing 8 |
| AIR H | Tower Of Powers | mid | 14 | 4 | 16 |  |  |  | 22 | bounds, hitstun 22, blockstun 14, landing 12 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Horsepower | mid | 21 | 4 | 50 | -29 | +8 | launch | 20 | wall splats, armor: absorbs 1 hit on frames 6-20 |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Right Angle Elbow+** (`F+P`, then `P+K`): Two elbows, knockdown — 2 hits of 14, hit: knockdown.
- **Common Log+** (`F,F+P`, then `P+K`): Armored, wall splat — 23 damage (from 18), armor on frames 1-14 (1 hit), wall splats.
- **Exponential Haymaker+** (`F+H`, then `P+K`): Absorbs two hits, launches — 31 damage (from 24), hit: launch, armor on frames 1-26 (2 hits).

**Ultimate:** Horsepower — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: on go the sunglasses; he gets into his red sports car, revs it, and drives straight across the stage into them; they bounce off the hood, the car skids to a stop, and he leans out of the window with his line. 2 hits, 32% of their health; blocked -29, whiffed 74 frames.

**KO finisher:** Escape Velocity — `B, F, H` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Squared:** P, P (frames: P @0, P @16)
- **Logarithmic Juggle:** D+H, P, P, H (frames: D+H @0, P @43, P @57, H @67)
- **Tower Of Powers:** D+H, up, air K, air H, D+K on the ground (frames: D+H @0, UP @19, K @27, H @34, D+K @84)
- **Exponential Growth:** at the wall: H, D+H (each input as soon as you can act)
- **Overdrive Launch (1 bar):** F+H, P+K, P, P, H (frames: F+H @0, P+K @3, P @44, P @56, H @70)
- **Exponential Overdrive (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## BRINKHUS — Balanced — Algebra 1

Nice, easygoing, a good sport. Best for new players.

**Style:** Kickboxer. **Signature:** Long Arms — his straights outrange everyone's, and landing one with the very tip hits 25% harder.

**Movement:** walk 2.2 forward / 1.9 back, dash 9.8 for 14 frames, backdash 8.4, jump 9.9, weight 1 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Slope Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 6 | Long Arms: +25% damage at the tip |
| P,P | Rise Over Run | high | 9 | 2 | 16 | -3 | +6 | +9 | 8 | Long Arms: +25% damage at the tip |
| P,K | Distribute | mid | 11 | 3 | 18 | -7 | +4 | +8 | 10 |  |
| P,K,K | Distributive Property | mid | 13 | 3 | 22 | -13 | knockdown | knockdown | 14 | wall splats, enhance with P+K |
| P,P,H | Combine Like Terms | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Long Arms | high | 13 | 3 | 18 | -4 | +4 | +8 | 10 | enhance with P+K, Long Arms: +25% damage at the tip |
| K | Variable Kick | mid | 14 | 3 | 18 | -6 | +4 | +9 | 12 |  |
| D+K | Inequality | low | 16 | 3 | 21 | -12 | -1 | +5 | 9 | tracks, hits downed opponents, ducks highs |
| D/B+K | Zero Product Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Linear Rush | mid | 19 | 3 | 22 | -4 | +6 | launch | 20 | wall splats, enhance with P+K, Long Arms: +25% damage at the tip |
| F+H | Order Of Operations | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 16 | bounds |
| D+H | Solve For X | mid | 15 | 4 | 22 | -15 | launch | launch | 14 | jump cancel on hit (UP) |
| P+K | Foil | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Substitution | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | X-Intercept | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Y-Intercept | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Point-Slope Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Fast Break | mid | 19 | 3 | 52 | -34 | +6 | launch | 20 | wall splats, Long Arms: +25% damage at the tip |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Distributive Property+** (`P,K,K`, then `P+K`): Three hits — 3 hits of 9.
- **Long Arms+** (`F+P`, then `P+K`): Two hits, knockdown — 2 hits of 9, hit: knockdown.
- **Linear Rush+** (`H`, then `P+K`): Armored, launches — 26 damage (from 20), hit: launch, armor on frames 1-19 (1 hit).

**Ultimate:** Fast Break — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: a blast on the coach's whistle, a sprint down the running track and over a bench, then back into the stage with a flying knee: a giant X stamps SOLVED. 2 hits, 32% of their health; blocked -34, whiffed 73 frames.

**KO finisher:** Solve For X — `F, F, H` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Distributive Property:** P, K, K (frames: P @0, K @12, K @24)
- **Long Arms:** F+P, P, H (frames: F+P @0, P @15, H @27)
- **Solve For X Juggle:** D+H, P, P, H (frames: D+H @0, P @38, P @56, H @67)
- **Point-Slope Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Isolate The Variable:** at the wall: H, P, P, D+H (each input as soon as you can act)
- **Expanded Form (1 bar):** H, P+K, P, P, H (frames: H @0, P+K @3, P @36, P @48, H @56)
- **Order Of Operations (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## CHAI — Technical — Geometry

Very kind, precise and graceful. Bows before fights.

**Style:** Taekwondo. **Signature:** Kick Chain — once a kick connects, K or H into a different kick cancels it, up to four kicks in a row; and the best sidestep in the game.

**Movement:** walk 2.3 forward / 1.9 back, dash 8.6, backdash 9, jump 10.2, weight 0.9 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Right Angle | high | 10 | 2 | 12 | +2 | +8 | +11 | 6 |  |
| P,P | Inscribed Angle | high | 9 | 2 | 16 | -3 | +6 | +9 | 8 |  |
| P,K | Complementary Kick | mid | 12 | 3 | 20 | -9 | +3 | +8 | 13 | kick chain |
| P,P,H | Central Angle | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| SS, P | Tangent Step | mid | 12 | 3 | 16 | -3 | +6 | knockdown | 16 | tracks, stays off the line until it hits, enhance with P+K, kick chain |
| SS, K | Secant Sweep | low | 15 | 3 | 22 | -13 | knockdown | knockdown | 13 | tracks, ducks highs, stays off the line until it hits, kick chain |
| K | Isosceles Kick | mid | 12 | 3 | 19 | -6 | +4 | +9 | 13 | kick chain |
| F+K | Altitude Kick | high | 13 | 3 | 18 | -4 | +5 | +10 | 14 | kick chain |
| B+K | Reflex Angle | mid | 16 | 3 | 22 | -10 | knockdown | knockdown | 17 | enhance with P+K, kick chain |
| D+K | Acute Low | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs, kick chain |
| D/B+K | Obtuse Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs, kick chain |
| H | Hypotenuse | mid | 17 | 3 | 22 | -6 | +5 | launch | 20 | wall splats, kick chain |
| F+H | Vertex Drop | mid | 20 | 3 | 20 | -7 | +3 | knockdown | 18 | bounds, enhance with P+K, kick chain |
| B+H | Reflection Counter | — | 31 total |  |  |  |  |  |  | parry |
| D+H | Arc Launcher | mid | 14 | 4 | 24 | -16 | launch | launch | 16 | kick chain, jump cancel on hit (UP) |
| P+K | Transformation | throw | 12 | 2 | 26 |  |  |  | 29 | break with P |
| B+P+K | Rotation | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | Tangent Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Chord Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Vertex Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| PARRY | Reflection | mid | 6 | 3 | 18 | -6 | knockdown | knockdown | 21 |  |
| D,D/F,F+P+K+H | Compass Construction | high | 13 | 3 | 48 | -34 | +5 | +10 | 14 |  |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Tangent Step+** (`SS, P`, then `P+K`): Three kicks — 3 hits of 10.
- **Reflex Angle+** (`B+K`, then `P+K`): Launches — 22 damage (from 17), hit: launch.
- **Vertex Drop+** (`F+H`, then `P+K`): Two hits, knockdown — 2 hits of 16, hit: knockdown.

**Ultimate:** Compass Construction — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: she plants a giant drawing compass next to them and spins around them, a kick on every pass, while a glowing circle draws itself; a protractor snaps into place at 90 degrees, then an axe kick (and an apology). 7 hits, 32% of their health; blocked -34, whiffed 63 frames.

**KO finisher:** Q.E.D. — `B, F, K` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Right Triangle:** P, K (frames: P @0, K @11)
- **Kick Chain:** K, F+K, B+K (frames: K @0, F+K @14, B+K @29)
- **Arc Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @52, H @59)
- **Full Circle:** D+K, K, F+K, H (frames: D+K @0, K @17, F+K @31, H @46)
- **Vertex Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @31, K @36, H @43, K @77)
- **Double Vertex (1 bar):** F+H, P+K (frames: F+H @0, P+K @3)
- **Circle Theorem (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## DALSASS — Tricky — Geometry Proofs

Happy, sassy, everyone's favorite. Fakes you out with a grin.

**Style:** Trickster. **Signature:** Similar Triangles — a second stance (B+P) with its own moves; tap back during any attack's startup to feint it; Assume the Contrary (B+K) sways out of highs and mids, then P counters with The Converse.

**Movement:** walk 2 forward / 1.8 back, dash 8.6, backdash 9.6, jump 9.4, weight 1.02 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Given | high | 10 | 2 | 13 | +1 | +8 | +10 | 11 |  |
| P,P | Statement | high | 10 | 2 | 17 | -4 | +5 | +9 | 15 |  |
| P,P,H | Therefore | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| B+P | Similar Triangles | — | 13 total |  |  |  |  |  |  | switches stance |
| STANCE P | Similar Palm | mid | 12 | 2 | 18 | -4 | +6 | +10 | 17 |  |
| STANCE K | Scale Factor | low | 13 | 3 | 20 | -12 | +1 | +6 | 16 | hits downed opponents, ducks highs |
| STANCE H | Angle-Angle | mid | 20 | 3 | 20 | -6 | +4 | launch | 28 | bounds |
| K | Reason Kick | mid | 15 | 3 | 19 | -7 | +4 | +9 | 20 |  |
| B+K | Assume The Contrary | — | 26 total |  |  |  |  |  |  | evades highs and mids on frames 3-16, P after a miss: The Converse |
| D+K | Leg Kick | low | 16 | 3 | 20 | -11 | 0 | +6 | 15 | tracks, hits downed opponents, ducks highs |
| D/F+K | Supplementary Slide | low | 18 | 5 | 24 | -16 | knockdown | knockdown | 19 | ducks highs, enhance with P+K |
| D/B+K | Base Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Side-Angle-Side | mid | 18 | 3 | 22 | -5 | +5 | launch | 28 | wall splats |
| F+H | Proof By Contradiction | — | 24 total |  |  |  |  |  |  | feint: cancel with P, K, H or P+K during frames 6-18 |
| F+H, H | Indirect Proof | mid | 14 | 3 | 22 | -8 | +4 | knockdown | 26 | bounds, enhance with P+K |
| D+H | Pythagorean Launcher | mid | 15 | 4 | 23 | -15 | launch | launch | 23 | jump cancel on hit (UP) |
| P+K | Congruence Lock | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Counterexample | throw | 12 | 2 | 26 |  |  |  | 46 | break with K |
| AIR P | Angle Bisector | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Median Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Centroid Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| B+K, P | The Converse | mid | 8 | 3 | 18 | -6 | launch | launch | 21 | enhance with P+K |
| D,D/F,F+P+K+H | Pop Quiz | mid | 18 | 3 | 52 | -35 | +5 | launch | 28 | wall splats |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Supplementary Slide+** (`D/F+K`, then `P+K`): Two hits, launches — 2 hits of 16, hit: launch.
- **Indirect Proof+** (`F+H, H`, then `P+K`): Armored, knockdown — 34 damage (from 26), hit: knockdown, armor on frames 1-14 (1 hit).
- **The Converse+** (`B+K, P`, then `P+K`): Higher launch — 27 damage (from 21).

**Ultimate:** Pop Quiz — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: he slams down a stack of papers: they are at a student desk with a quiz and a ticking timer, sweating; he snatches the paper, red-pens a giant F, and smacks them with the whole stack while the class goes wild. 4 hits, 32% of their health; blocked -35, whiffed 72 frames.

**KO finisher:** See Me After Class — `D, D, P` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Given, Prove:** P, P (frames: P @0, P @15)
- **Pythagorean Juggle:** D+H, P, P, H (frames: D+H @0, P @39, P @53, H @61)
- **Centroid Spike:** D+H, up, air K, air H, K (frames: D+H @0, UP @17, K @31, H @41, K @70)
- **Supplementary Stomp:** D/F+K, D+K on the ground (frames: D/F+K @0, D+K @49)
- **Supplementary Launch (1 bar):** D/F+K, P+K, P, P, H (frames: D/F+K @0, P+K @3, P @44, P @56, H @64)
- **Two-Column Proof (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## LEE — Rushdown — Sequences

Sarcastic and funny. Taunts mid-combo. Relentless pressure.

**Style:** Peekaboo boxer. **Signature:** Arithmetic Sequence — his strings get faster with every hit, and once an attack connects (hit or block) forward, forward dash-cancels its recovery to keep the pressure on (once per string).

**Movement:** walk 2.6 forward / 1.5 back, dash 9.4 for 15 frames, backdash 7.6, jump 9, weight 0.97 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | First Term | high | 10 | 2 | 12 | +2 | +9 | +11 | 8 |  |
| P,P | Second Term | high | 9 | 2 | 14 | -1 | +7 | +10 | 10 |  |
| P,P,P | Third Term | mid | 8 | 2 | 16 | -4 | +5 | +9 | 11 |  |
| P,P,H | Next Term | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| P,P,P,P | Nth Term | mid | 7 | 3 | 22 | -12 | knockdown | knockdown | 20 | enhance with P+K |
| P,P,P,K | Divergent Low | low | 7 | 3 | 22 | -14 | +1 | knockdown | 16 | ducks highs |
| F+P | Recursive Rush | mid | 13 | 3 | 15 | +1 | +5 | +9 | 14 | enhance with P+K |
| K | Common Difference | mid | 12 | 3 | 17 | -3 | +5 | +9 | 17 |  |
| D+K | Geometric Low | low | 15 | 3 | 19 | -10 | +1 | +6 | 13 | hits downed opponents, ducks highs |
| D/B+K | Divergent Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Partial Sum | mid | 17 | 3 | 18 | +2 | +7 | launch | 24 | wall splats, enhance with P+K |
| F+H | Induction Step | mid | 20 | 3 | 20 | -5 | +4 | knockdown | 23 | bounds |
| D+H | Fibonacci Uppercut | mid | 14 | 4 | 22 | -14 | launch | launch | 21 | jump cancel on hit (UP) |
| P+K | Series Expansion | throw | 12 | 2 | 26 |  |  |  | 39 | break with P |
| B+P+K | Telescoping Toss | throw | 12 | 2 | 26 |  |  |  | 45 | break with K |
| AIR P | First Difference | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Second Difference | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Summation Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Grading At 11 Pm | mid | 13 | 3 | 45 | -29 | +5 | +9 | 14 |  |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Nth Term+** (`P,P,P,P`, then `P+K`): Three hits, wall splat — 3 hits of 13, wall splats.
- **Recursive Rush+** (`F+P`, then `P+K`): Two hits — 2 hits of 12.
- **Partial Sum+** (`H`, then `P+K`): Launches — 31 damage (from 24), hit: launch.

**Ultimate:** Grading At 11 Pm — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: cut to his desk at night (a lamp, cold coffee, a mountain of papers): he grades faster and faster and every red check mark is a hit; done, he sighs, adjusts his glasses and flicks the red pen at them. 15 hits, 32% of their health; blocked -29, whiffed 60 frames.

**KO finisher:** Infinite Series — `F, B, F, P` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Arithmetic Sequence:** P, P, P, P (frames: P @0, P @11, P @22, P @32)
- **Recursive Rush:** F+P, P, P (frames: F+P @0, P @13, P @26)
- **Partial Sums:** P, P, F, F, P, P, P (frames: P @0, P @11, F @21, F @23, P @28, P @39, P @50)
- **Fibonacci Juggle:** D+H, P, P, H (frames: D+H @0, P @38, P @50, H @59)
- **Fibonacci Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @31, K @40, H @50, K @79)
- **Partial Sum Plus (1 bar):** H, P+K, P, P, H (frames: H @0, P+K @3, P @41, P @57, H @63)
- **Geometric Series (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## LOPEZ — Defensive — Calculus

Very suspicious. Always watching. Waits for you to commit, then punishes.

**Style:** Counter-fighter. **Signature:** Derivative Read — a parry stance (B+H, hold H to keep it up); attack into it and he counters by level: a wrist lock for a high, a palm strike for a mid, a trapping sweep for a low; throws beat it.

**Movement:** walk 1.5 forward / 1.6 back, dash 6.4 for 14 frames, backdash 12.5, jump 9.2, weight 1.04 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Differential Jab | high | 10 | 2 | 14 | 0 | +7 | +10 | 8 |  |
| P,P | Second Derivative | high | 10 | 2 | 16 | -3 | +6 | +9 | 10 |  |
| P,P,H | Fundamental Theorem | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| K | Chain Rule Kick | mid | 15 | 3 | 18 | -5 | +4 | +9 | 15 |  |
| D+K | Lower Sum | low | 16 | 3 | 20 | -12 | 0 | +6 | 11 | hits downed opponents, ducks highs |
| D/B+K | Riemann Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Definite Integral | mid | 19 | 3 | 21 | -4 | +6 | launch | 22 | wall splats, enhance with P+K |
| F+H | Concave Down | mid | 22 | 3 | 21 | -7 | +3 | knockdown | 19 | bounds, enhance with P+K |
| B+H (HOLD) | Derivative Read | — | 33 total |  |  |  |  |  |  | parry (high → L'Hopital Lock, mid → Critical Point, low → Saddle Point), hold H to keep it up |
| D+H | Limit Break | mid | 16 | 4 | 22 | -15 | launch | launch | 17 | jump cancel on hit (UP) |
| P+K | Squeeze Theorem | throw | 12 | 2 | 26 |  |  |  | 32 | break with P |
| B+P+K | U-Substitution | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | Left-Hand Limit | mid | 8 | 4 | 10 |  |  |  | 10 | hitstun 16, blockstun 10, landing 5 |
| AIR K | Right-Hand Limit | mid | 10 | 5 | 12 |  |  |  | 13 | hitstun 18, blockstun 12, landing 7 |
| AIR H | Inflection Spike | mid | 13 | 4 | 16 |  |  |  | 19 | bounds, hitstun 22, blockstun 14, landing 11 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| P AFTER BLOCK | Mean Value Punish | mid | 8 | 2 | 20 | -10 | knockdown | knockdown | 18 | wall splats, enhance with P+K |
| READ A HIGH | L'Hopital Lock | mid | 6 | 3 | 20 | -6 | knockdown | knockdown | 22 |  |
| READ A MID | Critical Point | mid | 7 | 3 | 18 | -6 | knockdown | knockdown | 22 |  |
| READ A LOW | Saddle Point | low | 7 | 3 | 20 | -12 | knockdown | knockdown | 18 | ducks highs |
| D,D/F,F+P+K+H | I Knew It | — | 100 total |  |  |  |  |  |  | parry |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Definite Integral+** (`H`, then `P+K`): Armored, knockdown — 29 damage (from 22), hit: knockdown, armor on frames 1-19 (1 hit).
- **Concave Down+** (`F+H`, then `P+K`): Two hits, wall splat — 2 hits of 16, wall splats.
- **Mean Value Punish+** (`P AFTER BLOCK`, then `P+K`): Launches — 23 damage (from 18), hit: launch.

**Ultimate:** I Knew It — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars (a counter stance, frames 4-50): hit him in it and he closes the blinds and reveals a corkboard of red string, photos and graphs of your habits; you attack three times and he dodges each one without looking, says "I knew it.", and lands one perfect punish. 1 hits, 32% of their health; whiffed, 100 frames.

**KO finisher:** Area Under The Curve — `B, B, H` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **First Derivative:** P, P (frames: P @0, P @15)
- **Limit Break Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @58, H @69)
- **Inflection Point:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @38, H @47, K @80)
- **Mean Value Punish:** BLOCK THEIR JAB, P, D+K on the ground (frames: P @21, D+K @63; hold B @0-11)
- **Double Concave (1 bar):** F+H, P+K (frames: F+H @0, P+K @3)
- **Fundamental Theorem (3 bars):** THEY ATTACK: D, D/F, F+P+K+H (frames: D @0, D/F @1, F @2, F+P+K+H @3)

## MIYASHIRO — Spacing — Algebra 2

Very smart. Reads opponents, keeps perfect distance, punishes every mistake.

**Style:** Karate. **Signature:** Calculated — when the opponent whiffs, his next hit does bonus damage and he glows until he lands it; Domain Restriction (B+H) is a step-back kick that retreats while it attacks.

**Movement:** walk 1.9 forward / 2 back, dash 8, backdash 11, jump 9.3, weight 1.06 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Function Jab | high | 10 | 3 | 13 | 0 | +7 | +10 | 7 |  |
| P,P | Inverse | high | 10 | 2 | 16 | -3 | +6 | +9 | 9 |  |
| P,P,H | Solution Set | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F,F+P | Range Check | mid | 12 | 3 | 18 | -4 | +6 | launch | 16 | wall splats, enhance with P+K |
| K | Root Kick | mid | 14 | 3 | 18 | -5 | +4 | +9 | 13 |  |
| F+K | Domain Control | mid | 16 | 3 | 18 | -6 | +3 | +8 | 12 | enhance with P+K |
| B+K | Vertex Kick | high | 17 | 4 | 20 | -7 | knockdown | knockdown | 18 | tracks |
| D+K | Y-Intercept | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs |
| D/B+K | X-Axis Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Complex Root | mid | 18 | 3 | 22 | -5 | +5 | launch | 20 | wall splats |
| F+H | End Behavior | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| B+H | Domain Restriction | mid | 13 | 3 | 16 | -2 | +5 | +10 | 12 | steps back as it attacks, enhance with P+K |
| D+H | Quadratic Launcher | mid | 15 | 4 | 23 | -15 | launch | launch | 16 | jump cancel on hit (UP) |
| P+K | Discriminant | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Completing The Square | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Imaginary Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Conjugate Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Focus Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | System Of Equations | mid | 12 | 3 | 48 | -34 | +6 | launch | 16 | wall splats |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Range Check+** (`F,F+P`, then `P+K`): Two hits, knockdown — 2 hits of 14, hit: knockdown.
- **Domain Control+** (`F+K`, then `P+K`): Launches — 16 damage (from 12), hit: launch.
- **Domain Restriction+** (`B+H`, then `P+K`): Armored, wall splat — 16 damage (from 12), armor on frames 1-13 (1 hit), wall splats.

**Ultimate:** System Of Equations — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: two glowing lines draw across the stage from opposite corners and a copy of him charges down each one; they hit exactly where the lines intersect: SOLUTION FOUND. 2 hits, 32% of their health; blocked -34, whiffed 62 frames.

**KO finisher:** Calculated — `D, F, K` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Factor Pair:** P, P (frames: P @0, P @15)
- **Quadratic Juggle:** D+H, P, P, H (frames: D+H @0, P @39, P @53, H @62)
- **Focus Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Calculated Rush:** THEY WHIFF A JAB, F, F+P (CALCULATED BONUS) (frames: F @18, F @20, P @27)
- **Domain And Range:** at the wall: H, F+K, D+H (each input as soon as you can act)
- **Domain Launch (1 bar):** F+K, P+K, P, P, H (frames: F+K @0, P+K @3, P @31, P @55, H @61)
- **Imaginary Unit (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## RAMOS — Grappler — Matrices

Fast, explosive grappler who closes distance quickly. Confident and focused.

**Style:** Wrestler. **Signature:** Cardio — he never slows down: the fastest walk and dash, chained dashes, a guard that recovers twice as fast, and a run he can keep up for as long as he likes (dash, then hold forward), with a tackle, a running knee, a slide, a plancha and a running command grab out of it.

**Movement:** walk 2.8 forward / 1.9 back, dash 10.5 for 14 frames, backdash 9, jump 9.6, weight 0.96 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Row Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 8 |  |
| P,P | Column Elbow | high | 10 | 3 | 16 | -2 | +6 | +10 | 12 |  |
| P,P,H | Row Reduction | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F,F+P | Augmented Charge | mid | 13 | 4 | 20 | -9 | knockdown | knockdown | 18 | enhance with P+K |
| RUN, P | Row Operation | mid | 10 | 4 | 22 | -8 | knockdown | knockdown | 17 | enhance with P+K |
| RUN, K | Elementary Knee | mid | 9 | 3 | 22 | -12 | launch | launch | 16 | enhance with P+K, jump cancel on hit (UP) |
| RUN, D+K | Zero Vector | low | 10 | 6 | 24 | -16 | knockdown | knockdown | 14 | ducks highs |
| RUN, H | Matrix Plancha | mid | 16 | 4 | 26 | -10 | knockdown | knockdown | 24 |  |
| RUN, P+K | Gauss-Jordan | throw | 8 | 4 | 30 |  |  |  | 32 | unbreakable |
| K | Pivot Knee | mid | 13 | 3 | 17 | -4 | +5 | +9 | 14 |  |
| D+K | Lower Triangular | low | 15 | 3 | 20 | -11 | 0 | +6 | 11 | hits downed opponents, ducks highs |
| D/B+K | Null Space Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Row Reduction | mid | 18 | 3 | 21 | -4 | +6 | launch | 22 | wall splats |
| F+H | Scalar Slam | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 19 | bounds |
| D+H | Transpose Toss | mid | 15 | 4 | 23 | -15 | launch | launch | 18 | jump cancel on hit (UP) |
| P+K | Matrix Lock | throw | 12 | 2 | 26 |  |  |  | 37 | break with P |
| B+P+K | Determinant Slam | throw | 12 | 2 | 26 |  |  |  | 41 | break with K |
| F+P+K | Identity | throw | 16 | 3 | 32 |  |  |  | 35 | unbreakable |
| AIR P | Pivot Drop | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Eigen Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Rank Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Max Incline | throw | 16 | 3 | 62 |  |  |  | 35 | unbreakable |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Augmented Charge+** (`F,F+P`, then `P+K`): Armored, launches — 23 damage (from 18), hit: launch, armor on frames 1-13 (1 hit).
- **Row Operation+** (`RUN, P`, then `P+K`): Two hits, wall splat — 2 hits of 15, wall splats.
- **Elementary Knee+** (`RUN, K`, then `P+K`): Higher launch — 21 damage (from 16).

**Ultimate:** Max Incline — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: cut to a 24-hour gym: he cranks a treadmill to max, sparks flying, speed climbing, bowl cut flapping; he launches off the end, smashes back into the stage, and finishes with a flying tackle and a slam. 2 hits, 32% of their health; a grab, so it can't be blocked.

**KO finisher:** Cardio Finale — `F, D, F, P` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Row And Column:** P, P (frames: P @0, P @15)
- **Transpose Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @57, H @70)
- **Rank Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @31, K @36, H @44, K @77)
- **Identity Stomp:** F+P+K, D+K on the ground (frames: F+P+K @0, D+K @66)
- **Cardio:** RUN, K, P, P, H (frames: F @0, F @2, K @24, P @55, P @66, H @75; hold F @2-32)
- **Augmented Juggle (1 bar):** F, F+P, P+K, P, P, H (frames: F @0, F @2, P @10, P+K @13, P @39, P @63, H @69)
- **Matrix Multiplication (3 bars):** D, D/F, F+P+K+H (frames: D @0, D/F @1, F @2, F+P+K+H @3)

## WILSON — Veteran Master — Every Subject

Twenty-nine years at el camino. Teaches every math class. Never smiles. Never wastes a word.

**Style:** Long-limbed, efficient, smooth. **Signature:** 29 Years — faster in round 2, stronger in round 3; once a round, Seen It All counters the move you have used most.

**Movement:** walk 1.9 forward / 1.8 back, dash 7.6 for 15 frames, backdash 9, jump 9.6, weight 1 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Point | high | 9 | 2 | 15 | 0 | +7 | +10 | 6 |  |
| P,P | Chain Rule | high | 10 | 2 | 17 | -3 | +6 | +9 | 7 | Chain Rule: on contact, cancels into any of his other moves (once a string) |
| P,P,H | Common Core | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Distance Formula | mid | 15 | 3 | 19 | -6 | +3 | +9 | 8 | enhance with P+K |
| F,F+P | Slope-Intercept | mid | 13 | 3 | 19 | -6 | +5 | launch | 13 | wall splats, enhance with P+K |
| K | Tangent Line | mid | 13 | 3 | 18 | -4 | +4 | +9 | 10 |  |
| F+K | Sine Wave | mid | 20 | 3 | 16 | -5 | +5 | knockdown | 11 | enhance with P+K, evades highs on frames 3-18 |
| D+K | Floor Function | low | 14 | 3 | 20 | -12 | 0 | +6 | 8 | hits downed opponents, ducks highs |
| D/B+K | Limit To Zero | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Long Division | mid | 18 | 3 | 21 | -4 | +6 | launch | 16 | wall splats |
| F+H | Quadratic Formula | mid | 22 | 3 | 20 | -7 | +3 | knockdown | 15 | bounds |
| B+H | Absolute Value | — | 29 total |  |  |  |  |  |  | parry, the counter hits at least as hard as what it caught |
| D+H | Square Root | mid | 15 | 4 | 22 | -15 | launch | launch | 12 | jump cancel on hit (UP) |
| P+K | Prime Factorization | throw | 12 | 2 | 26 |  |  |  | 26 | break with P |
| B+P+K | Inverse Function | throw | 12 | 2 | 26 |  |  |  | 24 | break with K |
| AIR P | Rational Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Radian Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Vertical Asymptote | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Stare | — | 61 total |  |  |  |  |  |  | he doesn't taunt: he stares, for 25 meter; counter-hittable the whole time |
| PARRY | |absolute Value| | mid | 6 | 3 | 18 | -6 | knockdown | knockdown | 12 |  |
| AUTO (ONCE A ROUND) | Seen It All | mid | 5 | 3 | 16 | -4 | knockdown | knockdown | 14 | comes out on its own, once a round (see 29 Years) |
| D,D/F,F+P+K+H | Tenure | mid | 15 | 3 | 49 | -36 | +3 | +9 | 8 |  |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Distance Formula+** (`F+P`, then `P+K`): Two hits, wall splat — 2 hits of 7, wall splats.
- **Slope-Intercept+** (`F,F+P`, then `P+K`): Armored, launches — 17 damage (from 13), hit: launch, armor on frames 1-13 (1 hit).
- **Sine Wave+** (`F+K`, then `P+K`): Launches — 14 damage (from 11), hit: launch.

**Boss:** the final fight in arcade mode. Playable in training and versus from the start, and in arcade and VS CPU once arcade has been beaten.

**Ultimate:** Tenure — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: the stage goes dark but for a chalkboard; he writes one equation in silence while 29 years of classes flicker past, a hit landing with each year as the counter ticks up to 29; he caps the marker, turns around, and they are already down. 29 hits, 32% of their health; blocked -36, whiffed 66 frames.

**KO finisher:** Class Dismissed — `D, B, H` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Point, Chain:** P, P (frames: P @0, P @14)
- **Square Root Juggle:** D+H, P, P, H (frames: D+H @0, P @38, P @56, H @67)
- **Chain Rule:** P, P, F+P (frames: P @0, P @14, F+P @28)
- **Vertical Asymptote:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @31, K @38, H @47, K @79)
- **Distance Squared (1 bar):** F+P, P+K (frames: F+P @0, P+K @3)
- **Tenure (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

# Students

## MATEUS "GNOME" — Balanced — Eight Limbs

Calm, focused, a little cocky. Lets his shins do the talking.

**Style:** Muay thai. **Signature:** The Clinch — P+K up close locks a Thai clinch, hands behind their head: P drives a knee into the body (up to three, each one stronger), K dumps them on the floor, H is a jumping knee that launches, back breaks off with a short elbow. They get out with P right as it locks, or by mashing. Low Kick (D+K) stacks leg damage: land three and their walk slows. Check: press back just as a low kick lands to take it on the shin; the kicker staggers.

**Movement:** walk 2.3 forward / 1.7 back, dash 8 for 14 frames, backdash 8.6, jump 9.4, weight 1 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Jab | high | 9 | 2 | 13 | +1 | +8 | +10 | 8 |  |
| P,P | Cross | high | 10 | 2 | 15 | -2 | +6 | +9 | 10 |  |
| P,P,H | Rising Knee | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Slashing Elbow | high | 13 | 2 | 13 | +2 | +6 | +10 | 14 |  |
| D+P | Rear Uppercut | mid | 11 | 2 | 17 | -9 | +5 | launch | 15 |  |
| F,F,P | Superman Punch | mid | 13 | 3 | 19 | -5 | +5 | knockdown | 16 |  |
| K | Teep | mid | 13 | 3 | 17 | -3 | +2 | +6 | 12 | wall splats |
| F+K | Body Kick | mid | 15 | 3 | 18 | -6 | +3 | knockdown | 16 | enhance with P+K |
| D+K | Low Kick | low | 14 | 3 | 17 | -10 | +3 | +7 | 12 | leg damage (3 slow their walk) |
| D/B+K | Sweep The Leg | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 14 | ducks highs |
| H | Knee | mid | 17 | 3 | 20 | -5 | +4 | launch | 19 | wall splats |
| F+H | Head Kick | high | 20 | 3 | 22 | -10 | knockdown | knockdown | 24 | jump cancel on hit (UP) |
| B+H | Spinning Elbow | mid | 14 | 2 | 20 | -8 | +3 | knockdown | 16 | enhance with P+K |
| D+H | Jumping Knee | mid | 15 | 4 | 22 | -14 | launch | launch | 15 | jump cancel on hit (UP) |
| P+K (CLOSE) | The Clinch | throw | 12 | 2 | 26 |  |  |  | 0 | enhance with P+K, break with P |
| B+P+K | Turn And Dump | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Elbow Drop | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Flying Knee | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Axe Kick | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Shin From The Floor | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Rising Teep | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Again | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| CLINCH, P | Knee | mid | 9 | 1 | 11 |  | holds the clinch |  | 9 | lands from the clinch (can't be blocked) |
| CLINCH, P, P | Knee 2 | mid | 9 | 1 | 11 |  | holds the clinch |  | 11 | lands from the clinch (can't be blocked) |
| CLINCH, P, P, P | Knee 3 | mid | 10 | 1 | 12 |  | holds the clinch |  | 14 | lands from the clinch (can't be blocked) |
| CLINCH, K | Off-Balance | mid | 12 | 1 | 18 |  | knockdown |  | 14 | lands from the clinch (can't be blocked) |
| CLINCH, H | Jumping Knee To The Head | mid | 12 | 1 | 22 |  | launch |  | 15 | lands from the clinch (can't be blocked), jump cancel on hit (UP) |
| CLINCH, B | Break-Off Elbow | high | 7 | 1 | 14 |  | +4 |  | 10 | lands from the clinch (can't be blocked) |
| D,D/F,F+P+K+H | Eight Limbs | throw | 12 | 2 | 56 |  |  |  | 0 | break with P |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Body Kick+** (`F+K`, then `P+K`): Three kicks — 3 hits of 10, hit: knockdown.
- **Spinning Elbow+** (`B+H`, then `P+K`): Armored — 21 damage (from 16), armor on frames 1-14 (1 hit).
- **The Clinch+** (`P+K (CLOSE)`, then `P+K`): The knees always reach 3 — P+K in the clinch also works; the opponent can't escape until the third knee lands.

**Ultimate:** Eight Limbs — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: he catches them in the clinch, the screen goes black and red, and eight strikes land, each one named: LEFT FIST, RIGHT FIST, LEFT ELBOW, RIGHT ELBOW, LEFT KNEE, RIGHT KNEE, LEFT SHIN, and a RIGHT SHIN head kick. 8 hits, 32% of their health; a grab, so it can't be blocked.

**KO finisher:** Lights Out — `B, B, K` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Jab, Cross, Body Kick:** P, P, F+K (frames: P @0, P @12, F+K @25)
- **Two And A Knee:** P, P, H (frames: P @0, P @12, H @25)
- **Jumping Knee:** D+H, P, P, H (frames: D+H @0, P @42, P @55, H @64)
- **Clinch Knees:** up close: P+K, P, P, H (frames: P+K @0, P @14, P @34, H @54)
- **Teep, Head Kick, Air:** at the wall: K, F+H, up, air K, air H (frames: K @0, F+H @25, UP @47, K @53, H @65)
- **Three Kicks (1 bar):** F+K, P+K (frames: F+K @0, P+K @3)
- **Knees To Three (1 bar):** up close: P+K, P+K, H (frames: P+K @0, P+K @14, H @80)
- **Eight Limbs (3 bars):** up close: D, D/F, F+P+K+H (frames: D @0, D/F @1, F @2, F+P+K+H @3)

## NICOLAS "THE LATE PASS" — Rushdown — Passing Period

Always in a hurry. Flashy, fast, and all kicks.

**Style:** Taekwondo. **Signature:** Kick Chain — any kick that hits cancels into a different kick, up to five in a row. The Snap Kick (K) chains into itself: head, body, head. Double Roundhouse (B+K) is two kicks off one leg; Back Kick (F+K) knocks them across the screen; Axe Kick (F+H) drops the heel on their head; Tornado Kick (D+H) launches; the 540 Kick (B+H) is slow and huge; out of a dash, K is a Hopping Side Kick. He still has the fastest dash in the game.

**Movement:** walk 2.7 forward / 1.7 back, dash 12.5 for 12 frames, backdash 9.4, jump 9.8, weight 0.94 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Late Start | high | 9 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | Running Late | high | 10 | 2 | 15 | -2 | +6 | +9 | 9 |  |
| P,P,H | Detention | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| K | Snap Kick | high | 10 | 2 | 14 | -1 | +6 | +9 | 10 | kick chain |
| F+K | Back Kick | mid | 16 | 3 | 18 | -6 | +2 | knockdown | 17 | wall splats, enhance with P+K, kick chain |
| B+K | Double Roundhouse | mid | 13 | 8 | 16 | -5 | +3 | +7 | 8 | kick chain |
| D+K | Low Cut Kick | low | 12 | 3 | 17 | -8 | +2 | +6 | 9 | kick chain |
| D/B+K | Spinning Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 14 | ducks highs, kick chain |
| H | Roundhouse | mid | 16 | 3 | 19 | -5 | +4 | launch | 18 | wall splats, kick chain |
| F+H | Axe Kick | mid | 20 | 3 | 18 | -6 | +4 | knockdown | 20 | kick chain |
| B+H | 540 Kick | high | 26 | 3 | 24 | -12 | knockdown | knockdown | 28 | enhance with P+K, kick chain |
| D+H | Tornado Kick | mid | 15 | 4 | 22 | -14 | launch | launch | 15 | enhance with P+K, kick chain, jump cancel on hit (UP) |
| P+K | Push And Hook | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Spin Around | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Flying Side Kick | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Scissor Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Butterfly Kick | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Snooze Button | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | First Bell | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| K,K | Snap Kick 2 | mid | 9 | 2 | 14 | -3 | +5 | +8 | 10 | kick chain |
| K,K,K | Snap Kick 3 | high | 10 | 2 | 20 | -8 | knockdown | knockdown | 14 | kick chain |
| F,F,K | Hopping Side Kick | mid | 14 | 4 | 20 | -6 | knockdown | knockdown | 18 | kick chain |
| D,D/F,F+P+K+H | Five-Minute Passing Period | high | 10 | 2 | 44 | -31 | +6 | +9 | 10 |  |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Back Kick+** (`F+K`, then `P+K`): Two spins, wall splat — 2 hits of 15.
- **540 Kick+** (`B+H`, then `P+K`): Armored — 36 damage (from 28), armor on frames 1-26 (1 hit).
- **Tornado Kick+** (`D+H`, then `P+K`): Armored — 20 damage (from 15), armor on frames 1-15 (1 hit).

**Ultimate:** Five-Minute Passing Period — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: a 5:00 timer counts down at hyperspeed while he lands a nonstop chain of jumping, spinning and flying kicks across the whole stage before it hits 0:00. 14 hits, 32% of their health; blocked -31, whiffed 55 frames.

**KO finisher:** Tardy — `F, F, F, K` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Snap, Snap, Snap:** K, K, K (frames: K @0, K @12, K @23)
- **Running Late:** P, P, H (frames: P @0, P @12, H @24)
- **Tornado:** D+H, P, P, H (frames: D+H @0, P @42, P @52, H @59)
- **Kick Chain:** K, K, H (frames: K @0, K @12, H @21)
- **Flying Kicks:** D+H, up, air P, air K, air H (frames: D+H @0, UP @16, P @30, K @39, H @46)
- **Tornado Plus (1 bar):** D+H, P+K, P, P, H (frames: D+H @0, P+K @3, P @41, P @52, H @60)
- **Passing Period (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## MAX "HEAVY COURSE LOAD" — Grappler — Heavy Course Load

Chill and friendly, but strong. Every fight ends on the mat.

**Style:** Wrestling. **Signature:** Submissions — after any knockdown or takedown, H next to the downed opponent starts a submission: H armbar, D+H rear naked choke, F+H kimura, B+H triangle. A struggle meter: they mash to escape, he mashes to tighten, and when it fills they tap. Double-Leg Takedown (F+H) ducks highs and puts them down; Sprawl (B+K) catches lows, takedowns and throws.

**Movement:** walk 2 forward / 1.6 back, dash 8 for 16 frames, backdash 7, jump 8.8, weight 1.06 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Palm Strike | high | 11 | 2 | 14 | 0 | +7 | +10 | 10 |  |
| P,P | Rear Palm | high | 11 | 3 | 17 | -4 | +5 | +9 | 12 |  |
| P,P,H | Palm Shove | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Snap Down | high | 13 | 3 | 18 | -3 | +15 | knockdown | 10 |  |
| K | Knee | mid | 13 | 3 | 17 | -4 | +4 | +9 | 14 |  |
| F+K | Collar-Tie Knee | mid | 17 | 3 | 19 | -6 | +3 | knockdown | 18 |  |
| B+K | Sprawl | — | 34 total |  |  |  |  |  |  | catches lows, takedowns and throws on frames 3-16 → Front Headlock |
| D+K | Ankle Pick | low | 15 | 3 | 19 | -9 | +2 | knockdown | 10 | ducks highs |
| D/B+K | Foot Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Double Palm | mid | 18 | 4 | 21 | -6 | +4 | launch | 22 | wall splats, enhance with P+K |
| F+H | Double-Leg | mid | 18 | 4 | 22 | -10 | knockdown | knockdown | 18 | ducks highs, a takedown (a sprawl catches it), enhance with P+K |
| D+H | Single-Leg | mid | 17 | 4 | 23 | -15 | launch | launch | 17 | a takedown (a sprawl catches it), enhance with P+K, jump cancel on hit (UP) |
| P+K | Body Lock Suplex | throw | 12 | 2 | 26 |  |  |  | 28 | break with P |
| B+P+K | Arm Drag | throw | 12 | 2 | 26 |  |  |  | 26 | break with K |
| AIR P | Flying Palm | mid | 8 | 4 | 10 |  |  |  | 10 | hitstun 16, blockstun 10, landing 5 |
| AIR K | Jumping Knee | mid | 10 | 5 | 12 |  |  |  | 13 | hitstun 18, blockstun 12, landing 7 |
| AIR H | Body Drop | mid | 13 | 4 | 16 |  |  |  | 19 | bounds, hitstun 22, blockstun 14, landing 11 |
| K (DOWN) | Stand-Up | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Switch | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| (SPRAWL) | Front Headlock | mid | 6 | 3 | 18 | -4 | knockdown | knockdown | 12 |  |
| D,D/F,F+P+K+H | Finals Week | mid | 18 | 4 | 52 | -40 | knockdown | knockdown | 18 | ducks highs, a takedown (a sprawl catches it) |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Double Palm+** (`H`, then `P+K`): Two hits, wall splat — 2 hits of 19.
- **Double-Leg+** (`F+H`, then `P+K`): Lift and slam — 29 damage (from 18).
- **Single-Leg+** (`D+H`, then `P+K`): Armored — 22 damage (from 17), armor on frames 1-17 (1 hit).

**Submissions:** after any knockdown or takedown, H within 80 px of the downed opponent starts a hold (from neutral, the recovery of the move that put them down, or a throw once they land; one per knockdown). A struggle meter: it starts where the hold says, each of his presses (P, K or H) tightens it, each of theirs loosens it by 7, and it creeps tighter on its own. Full: they tap. Empty: they escape. After 300 frames it comes apart (half the damage times how tight it got).

| Input | Hold | Meter starts | Each press | Creep a second | Damage (tap) |
| --- | --- | --- | --- | --- | --- |
| H | Armbar | 35 | +6 | +18 | 24 |
| D+H | Rear Naked Choke | 25 | +6 | +18 | 29 |
| F+H | Kimura | 45 | +6 | +15 | 20 |
| B+H | Triangle | 35 | +8 | +6 | 26 |

**Ultimate:** Finals Week — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: a double-leg to the mat, the mount and a flurry of ground strikes, then a rear naked choke until they tap. 7 hits, 32% of their health; blocked -40, whiffed 73 frames.

**KO finisher:** All-Nighter — `D, D, H` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Palm, Palm, Shove:** P, P, H (frames: P @0, P @13, H @26)
- **Two Palms:** P, P (frames: P @0, P @13)
- **Single-Leg:** D+H, P, P, H (frames: D+H @0, P @43, P @56, H @66)
- **Snap Down:** F+P, P, P, H (frames: F+P @0, P @30, P @45, H @59)
- **Cram Session:** D+H, up, air P, air K, air H (frames: D+H @0, UP @20, P @25, K @32, H @40)
- **Double Major (1 bar):** D+H, P+K, P, P, H (frames: D+H @0, P+K @3, P @43, P @56, H @66)
- **Finals Week (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## JACK "BACK OF THE CLASSROOM" — Rushdown — Back Row

Creative and sneaky. Always messing around in the back row.

**Style:** Kickboxing. **Signature:** Flow — a punch that lands makes his next kick faster and stronger, and a kick that lands does the same for his next punch. Jab-Cross-Hook (P, P, P) and Punch-to-Kick (P, P, K); Low Kick (D+K) slows them once three land; Question Mark Kick (F+H) turns over to the head (K during the chamber keeps it on the body); Spinning Back Fist (B+P) is huge on a counter hit.

**Movement:** walk 2.4 forward / 1.8 back, dash 8.6 for 14 frames, backdash 9.4, jump 9.4, weight 0.93 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Jab | high | 9 | 2 | 13 | +1 | +8 | +10 | 9 | punch: a hit makes the next kick flow |
| P,P | Cross | high | 10 | 2 | 16 | -2 | +6 | +9 | 11 | punch: a hit makes the next kick flow |
| P,P,P | Lead Hook | high | 11 | 3 | 18 | -5 | knockdown | knockdown | 13 | punch: a hit makes the next kick flow |
| P,P,K | Punch To Kick | mid | 13 | 3 | 19 | -7 | knockdown | knockdown | 15 | kick: a hit makes the next punch flow |
| P,P,H | Uppercut | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| B+P | Spinning Back Fist | high | 15 | 3 | 18 | -4 | +4 | knockdown | 16 | enhance with P+K, punch: a hit makes the next kick flow |
| K | Front Kick | mid | 12 | 3 | 17 | -3 | +4 | +8 | 13 | kick: a hit makes the next punch flow |
| F+K | Switch Kick | mid | 15 | 3 | 18 | -5 | +3 | knockdown | 18 | enhance with P+K, kick: a hit makes the next punch flow |
| D+K | Low Kick | low | 13 | 3 | 17 | -8 | +2 | +6 | 12 | kick: a hit makes the next punch flow, leg damage (3 slow their walk) |
| D/B+K | Leg Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 14 | ducks highs, kick: a hit makes the next punch flow |
| H | High Kick | high | 16 | 3 | 20 | -6 | +5 | launch | 20 | wall splats, kick: a hit makes the next punch flow |
| F+H | Question Mark Kick | high | 19 | 3 | 19 | -7 | knockdown | knockdown | 20 | kick: a hit makes the next punch flow |
| F+H,K | Question Mark (body) | mid | 9 | 3 | 19 | -6 | +3 | knockdown | 16 | kick: a hit makes the next punch flow |
| D+H | Flying Knee | mid | 15 | 4 | 22 | -15 | launch | launch | 15 | enhance with P+K, jump cancel on hit (UP) |
| P+K | Knee Tap | throw | 12 | 2 | 26 |  |  |  | 28 | break with P |
| B+P+K | Spin Behind | throw | 12 | 2 | 26 |  |  |  | 32 | break with K |
| AIR P | Flying Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Jumping Switch Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Superman Punch | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Not Asleep | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | I Was Listening | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Highlight Reel | high | 9 | 2 | 43 | -29 | +8 | +10 | 9 | punch: a hit makes the next kick flow |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Spinning Back Fist+** (`B+P`, then `P+K`): Armored — 21 damage (from 16), armor on frames 1-15 (1 hit).
- **Switch Kick+** (`F+K`, then `P+K`): Two kicks — 2 hits of 16.
- **Flying Knee+** (`D+H`, then `P+K`): Armored — 20 damage (from 15), armor on frames 1-15 (1 hit).

**Flow:** a punch that hits makes his next kick (within 60 frames) 3 frames faster to come out and 25% stronger, with the same frame advantage; a kick that hits does the same for his next punch.

**Ultimate:** Highlight Reel — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: a punch-kick flurry, an instant replay, and a spinning back fist into a head kick frozen on the frame. 11 hits, 32% of their health; blocked -29, whiffed 53 frames.

**KO finisher:** Back Row — `B, D, F, K` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Jab, Cross, Hook:** P, P, P (frames: P @0, P @12, P @25)
- **Punch To Kick:** P, P, K (frames: P @0, P @12, K @25)
- **Two And An Uppercut:** P, P, H (frames: P @0, P @12, H @25)
- **Flying Knee:** D+H, P, P, H (frames: D+H @0, P @41, P @53, H @63)
- **Highlight:** D+H, up, air P, air K, air H (frames: D+H @0, UP @16, P @28, K @36, H @44)
- **Armored Knee (1 bar):** D+H, P+K, P, P, H (frames: D+H @0, P+K @3, P @41, P @53, H @63)
- **Highlight Reel (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)

## HUDSON "CALCULATOR KID" — Counterpuncher — Calculators

Calm and precise. Already finished the homework.

**Style:** Boxing. **Signature:** Counterpuncher — head movement: Slip (F+K), Duck (D+K), Weave (B+K) and Lean Back (B+P+K) make highs (and, leaning back, mids) miss, chain into each other and into any punch. Anything he lands right after a dodge that made them miss is a counter hit. Pull Counter (B+P) leans back and fires the right hand; Check Hook (B+H) pivots away as it lands.

**Movement:** walk 2.3 forward / 1.9 back, dash 8 for 15 frames, backdash 9, jump 9.2, weight 1 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Jab | high | 9 | 2 | 13 | +1 | +8 | +10 | 9 |  |
| P,P | Double Jab | high | 9 | 2 | 15 | -1 | +6 | +9 | 8 |  |
| P,P,P | Lead Hook | high | 11 | 3 | 18 | -5 | knockdown | knockdown | 14 |  |
| P,P,H | Uppercut | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Shovel Hook | mid | 13 | 3 | 15 | +1 | +5 | +9 | 14 |  |
| B+P | Pull Counter | high | 17 | 3 | 16 | -5 | +4 | knockdown | 15 | enhance with P+K, evades highs and mids on frames 2-11 |
| D+P | Rear Uppercut | mid | 13 | 3 | 18 | -6 | +4 | launch | 16 |  |
| K | Body Jab | mid | 11 | 2 | 15 | -2 | +5 | +8 | 10 |  |
| F+K | Slip | — | 19 total |  |  |  |  |  |  | dodge: from frame 7 it comes out into another dodge or any attack, evades highs on frames 2-13 |
| B+K | Weave | — | 21 total |  |  |  |  |  |  | steps back as it attacks, dodge: from frame 9 it comes out into another dodge or any attack, evades highs on frames 3-15 |
| D+K | Duck | — | 21 total |  |  |  |  |  |  | ducks highs, dodge: from frame 8 it comes out into another dodge or any attack, evades highs on frames 1-15 |
| D/B+K | Stomp | low | 13 | 3 | 18 | -9 | +2 | +6 | 10 |  |
| H | Right Hand | high | 15 | 3 | 19 | -5 | +5 | launch | 21 | wall splats |
| F+H | Overhand Right | high | 19 | 3 | 19 | -6 | knockdown | knockdown | 24 | enhance with P+K |
| B+H | Check Hook | high | 12 | 3 | 18 | -4 | +4 | knockdown | 17 | steps back as it attacks |
| D+H | Bolo Punch | mid | 16 | 4 | 22 | -15 | launch | launch | 15 | enhance with P+K, jump cancel on hit (UP) |
| P+K | Clinch And Spin | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Lean Back | — | 23 total |  |  |  |  |  |  | steps back as it attacks, dodge: from frame 10 it comes out into another dodge or any attack, evades highs and mids on frames 2-14 |
| AIR P | Flying Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Drop Hook | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Overhand Drop | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Still Counting | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Up At Eight | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| D,D/F,F+P+K+H | Can't Touch This | high | 9 | 2 | 43 | -29 | +8 | +10 | 9 |  |
| T (BY AN OBJECT) | Springboard | mid | 16 | 5 | 18 | -6 | knockdown | knockdown | 18 |  |
| B+T (BY AN OBJECT) | Vault | — | 38 total |  |  |  |  |  |  |  |

**Enhanced specials** (P+K during the startup, 1 bar):

- **Pull Counter+** (`B+P`, then `P+K`): Knockdown — 20 damage (from 15), hit: knockdown.
- **Overhand Right+** (`F+H`, then `P+K`): Two overhands — 2 hits of 21.
- **Bolo Punch+** (`D+H`, then `P+K`): Armored — 20 damage (from 15), armor on frames 1-16 (1 hit).

**Counterpuncher:** when a dodge (or the Pull Counter's lean) makes an attack miss, the next thing he lands within 40 frames is a counter hit, 20% harder than a plain one.

**Ultimate:** Can't Touch This — the ultimate key (`U` / `Numpad 0`) or `D, D/F, F + P+K+H`, with all three bars: he slips a whole flurry in slow motion, then counters: body, body, head, and an uppercut that lifts them off the floor. 5 hits, 32% of their health; blocked -29, whiffed 53 frames.

**KO finisher:** Extra Credit — `B, F, P` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).

**Combo routes** (tested in `tests/sim.test.js`):

- **Jab, Jab, Hook:** P, P, P (frames: P @0, P @12, P @24)
- **Double Jab, Uppercut:** P, P, H (frames: P @0, P @12, H @24)
- **Bolo:** D+H, P, P, H (frames: D+H @0, P @42, P @54, H @64)
- **Show Your Work:** D+H, up, air P, air K, air H (frames: D+H @0, UP @17, P @30, K @37, H @44)
- **Armored Bolo (1 bar):** D+H, P+K, P, P, H (frames: D+H @0, P+K @3, P @42, P @54, H @64)
- **Can't Touch This (3 bars):** P, D, D/F, F+P+K+H (frames: P @0, D @3, D/F @4, F @5, F+P+K+H @9)
