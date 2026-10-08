# Mortal Calculus: C221 — Move lists

Generated from the fighter data by `node tools/movelist.js`; don't edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).

Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.

## PEDERSEN — Power — Math Analysis

Calm and friendly, but every hit is heavy. Slow, patient, devastating.

**Style:** Power brawler. **Signature:** Exponential Armor — his heavy attacks (Base Hook, the Exponential Haymaker, Order of Magnitude) absorb one hit during their windup and keep going; a fully charged Order of Magnitude absorbs two.

**Movement:** walk 1.4 forward / 1.2 back, dash 6.2 for 13 frames, backdash 6.8, jump 8.6, weight 1.12 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Power Jab | high | 11 | 2 | 14 | 0 | +7 | +10 | 10 |  |
| P,P | Squared | high | 12 | 3 | 19 | -5 | +4 | +10 | 15 |  |
| P,P,H | Exponent Rule | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Right Angle Elbow | mid | 15 | 3 | 18 | -5 | +5 | launch | 18 |  |
| F,F+P | Common Log | mid | 14 | 4 | 22 | -10 | knockdown | knockdown | 20 |  |
| K | Exponent Kick | mid | 16 | 3 | 20 | -7 | +5 | +10 | 19 |  |
| D+K | Negative Exponent | low | 18 | 3 | 22 | -13 | 0 | +6 | 13 | hits downed opponents, ducks highs |
| D/B+K | Zero Power Sweep | low | 22 | 3 | 26 | -18 | knockdown | knockdown | 20 | ducks highs |
| H | Base Hook | mid | 21 | 4 | 20 | +1 | +8 | launch | 28 | wall splats, armor: absorbs 1 hit on frames 6-20 |
| F+H | Exponential Haymaker | mid | 26 | 4 | 22 | -6 | knockdown | launch | 36 | wall splats, armor: absorbs 1 hit on frames 8-25 |
| B+H (HOLD) | Order Of Magnitude | mid | 20 | 4 | 22 | -8 | +4 | knockdown | 20 | wall splats, armor: absorbs 1 hit on frames 6-19 (2 at full charge), hold to charge |
| D+H | Logarithmic Launcher | mid | 17 | 4 | 24 | -17 | launch | launch | 22 | jump cancel on hit (UP) |
| P+K | Long Division | throw | 12 | 2 | 28 |  |  |  | 40 | break with P |
| B+P+K | Synthetic Division | throw | 12 | 2 | 28 |  |  |  | 38 | break with K |
| AIR P | Exponent Drop | mid | 9 | 4 | 10 |  |  |  | 12 | hitstun 16, blockstun 10, landing 6 |
| AIR K | Power Kick | mid | 11 | 5 | 12 |  |  |  | 15 | hitstun 18, blockstun 12, landing 8 |
| AIR H | Tower Of Powers | mid | 14 | 4 | 16 |  |  |  | 22 | bounds, hitstun 22, blockstun 14, landing 12 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Squared:** P, P (frames: P @0, P @16)
- **Logarithmic Juggle:** D+H, P, P, H (frames: D+H @0, P @43, P @57, H @67)
- **Tower Of Powers:** D+H, up, air K, air H, D+K on the ground (frames: D+H @0, UP @19, K @27, H @34, D+K @84)
- **Exponential Growth:** at the wall: H, D+H (each input as soon as you can act)

## BRINKHUS — Balanced — Algebra 1

Nice, easygoing, a good sport. Best for new players.

**Style:** Kickboxer. **Signature:** Long Arms — his straights outrange everyone's, and landing one with the very tip hits 25% harder.

**Movement:** walk 2.2 forward / 1.9 back, dash 9.8 for 14 frames, backdash 8.4, jump 9.9, weight 1 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Slope Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 | Long Arms: +25% damage at the tip |
| P,P | Rise Over Run | high | 9 | 2 | 16 | -3 | +6 | +9 | 9 | Long Arms: +25% damage at the tip |
| P,K | Distribute | mid | 11 | 3 | 18 | -7 | +4 | +8 | 11 |  |
| P,K,K | Distributive Property | mid | 13 | 3 | 22 | -13 | knockdown | knockdown | 16 | wall splats |
| P,P,H | Combine Like Terms | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F+P | Long Arms | high | 13 | 3 | 18 | -4 | +4 | +8 | 11 | Long Arms: +25% damage at the tip |
| K | Variable Kick | mid | 14 | 3 | 18 | -6 | +4 | +9 | 14 |  |
| D+K | Inequality | low | 16 | 3 | 21 | -12 | -1 | +5 | 10 | tracks, hits downed opponents, ducks highs |
| D/B+K | Zero Product Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Linear Rush | mid | 19 | 3 | 22 | -4 | +6 | launch | 22 | wall splats, Long Arms: +25% damage at the tip |
| F+H | Order Of Operations | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| D+H | Solve For X | mid | 15 | 4 | 22 | -15 | launch | launch | 16 | jump cancel on hit (UP) |
| P+K | Foil | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Substitution | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | X-Intercept | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Y-Intercept | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Point-Slope Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Distributive Property:** P, K, K (frames: P @0, K @12, K @24)
- **Long Arms:** F+P, P, H (frames: F+P @0, P @15, H @27)
- **Solve For X Juggle:** D+H, P, P, H (frames: D+H @0, P @38, P @56, H @67)
- **Point-Slope Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Isolate The Variable:** at the wall: H, P, P, D+H (each input as soon as you can act)

## CHAI — Technical — Geometry

Very kind, precise and graceful. Bows before fights.

**Style:** Taekwondo. **Signature:** Kick Chain — once a kick connects, K or H into a different kick cancels it, up to four kicks in a row; and the best sidestep in the game.

**Movement:** walk 2.3 forward / 1.9 back, dash 8.6, backdash 9, jump 10.2, weight 0.9 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Right Angle | high | 10 | 2 | 12 | +2 | +8 | +11 | 6 |  |
| P,P | Inscribed Angle | high | 9 | 2 | 16 | -3 | +6 | +9 | 8 |  |
| P,K | Complementary Kick | mid | 12 | 3 | 20 | -9 | +3 | +8 | 12 | kick chain |
| P,P,H | Central Angle | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| SS, P | Tangent Step | mid | 12 | 3 | 16 | -3 | +6 | knockdown | 15 | tracks, stays off the line until it hits, kick chain |
| SS, K | Secant Sweep | low | 15 | 3 | 22 | -13 | knockdown | knockdown | 12 | tracks, ducks highs, stays off the line until it hits, kick chain |
| K | Isosceles Kick | mid | 12 | 3 | 19 | -6 | +4 | +9 | 12 | kick chain |
| F+K | Altitude Kick | high | 13 | 3 | 18 | -4 | +5 | +10 | 13 | kick chain |
| B+K | Reflex Angle | mid | 16 | 3 | 22 | -10 | knockdown | knockdown | 16 | kick chain |
| D+K | Acute Low | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs, kick chain |
| D/B+K | Obtuse Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 15 | ducks highs, kick chain |
| H | Hypotenuse | mid | 17 | 3 | 22 | -6 | +5 | launch | 19 | wall splats, kick chain |
| F+H | Vertex Drop | mid | 20 | 3 | 20 | -7 | +3 | knockdown | 17 | bounds, kick chain |
| B+H | Reflection Counter | — | 31 total |  |  |  |  |  |  | parry |
| D+H | Arc Launcher | mid | 14 | 4 | 24 | -16 | launch | launch | 15 | kick chain, jump cancel on hit (UP) |
| P+K | Transformation | throw | 12 | 2 | 26 |  |  |  | 28 | break with P |
| B+P+K | Rotation | throw | 12 | 2 | 26 |  |  |  | 32 | break with K |
| AIR P | Tangent Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Chord Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Vertex Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| PARRY | Reflection | mid | 6 | 3 | 18 | -6 | knockdown | knockdown | 20 |  |

**Combo routes** (tested in `tests/sim.test.js`):

- **Right Triangle:** P, K (frames: P @0, K @11)
- **Kick Chain:** K, F+K, B+K (frames: K @0, F+K @14, B+K @29)
- **Arc Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @52, H @59)
- **Full Circle:** D+K, K, F+K, H (frames: D+K @0, K @17, F+K @31, H @46)
- **Vertex Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @31, K @36, H @43, K @77)

## DALSASS — Tricky — Geometry Proofs

Happy, sassy, everyone's favorite. Fakes you out with a grin.

**Style:** Trickster. **Signature:** Similar Triangles — a second stance (B+P) with its own moves; tap back during any attack's startup to feint it; Assume the Contrary (B+K) sways out of highs and mids, then P counters with The Converse.

**Movement:** walk 2 forward / 1.8 back, dash 8.6, backdash 9.6, jump 9.4, weight 1.02 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Given | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | Statement | high | 10 | 2 | 17 | -4 | +5 | +9 | 10 |  |
| P,P,H | Therefore | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| B+P | Similar Triangles | — | 13 total |  |  |  |  |  |  | switches stance |
| STANCE P | Similar Palm | mid | 12 | 2 | 18 | -4 | +6 | +10 | 12 |  |
| STANCE K | Scale Factor | low | 13 | 3 | 20 | -12 | +1 | +6 | 11 | hits downed opponents, ducks highs |
| STANCE H | Angle-Angle | mid | 20 | 3 | 20 | -6 | +4 | launch | 20 | bounds |
| K | Reason Kick | mid | 15 | 3 | 19 | -7 | +4 | +9 | 15 |  |
| B+K | Assume The Contrary | — | 26 total |  |  |  |  |  |  | evades highs and mids on frames 3-16, P after a miss: The Converse |
| D+K | Leg Kick | low | 16 | 3 | 20 | -11 | 0 | +6 | 10 | tracks, hits downed opponents, ducks highs |
| D/F+K | Supplementary Slide | low | 18 | 5 | 24 | -16 | knockdown | knockdown | 14 | ducks highs |
| D/B+K | Base Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Side-Angle-Side | mid | 18 | 3 | 22 | -5 | +5 | launch | 20 | wall splats |
| F+H | Proof By Contradiction | — | 24 total |  |  |  |  |  |  | feint: cancel with P, K, H or P+K during frames 6-18 |
| F+H, H | Indirect Proof | mid | 14 | 3 | 22 | -8 | +4 | knockdown | 18 | bounds |
| D+H | Pythagorean Launcher | mid | 15 | 4 | 23 | -15 | launch | launch | 17 | jump cancel on hit (UP) |
| P+K | Congruence Lock | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Counterexample | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Angle Bisector | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Median Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Centroid Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| B+K, P | The Converse | mid | 8 | 3 | 18 | -6 | launch | launch | 16 |  |

**Combo routes** (tested in `tests/sim.test.js`):

- **Given, Prove:** P, P (frames: P @0, P @15)
- **Pythagorean Juggle:** D+H, P, P, H (frames: D+H @0, P @39, P @53, H @61)
- **Centroid Spike:** D+H, up, air K, air H, K (frames: D+H @0, UP @17, K @31, H @41, K @70)
- **Supplementary Stomp:** D/F+K, D+K on the ground (frames: D/F+K @0, D+K @49)

## LEE — Rushdown — Sequences

Sarcastic and funny. Taunts mid-combo. Relentless pressure.

**Style:** Muay thai boxer. **Signature:** Arithmetic Sequence — his strings get faster with every hit, and once an attack connects (hit or block) forward, forward dash-cancels its recovery to keep the pressure on (once per string).

**Movement:** walk 2.6 forward / 1.5 back, dash 9.4 for 15 frames, backdash 7.6, jump 9, weight 0.97 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | First Term | high | 10 | 2 | 12 | +2 | +9 | +11 | 6 |  |
| P,P | Second Term | high | 9 | 2 | 14 | -1 | +7 | +10 | 7 |  |
| P,P,P | Third Term | mid | 8 | 2 | 16 | -4 | +5 | +9 | 8 |  |
| P,P,H | Next Term | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| P,P,P,P | Nth Term | mid | 7 | 3 | 22 | -12 | knockdown | knockdown | 14 |  |
| P,P,P,K | Divergent Low | low | 7 | 3 | 22 | -14 | +1 | knockdown | 11 | ducks highs |
| F+P | Recursive Rush | mid | 13 | 3 | 15 | +1 | +5 | +9 | 10 |  |
| K | Common Difference | mid | 12 | 3 | 17 | -3 | +5 | +9 | 12 |  |
| D+K | Geometric Low | low | 15 | 3 | 19 | -10 | +1 | +6 | 9 | hits downed opponents, ducks highs |
| D/B+K | Divergent Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Partial Sum | mid | 17 | 3 | 18 | +2 | +7 | launch | 18 | wall splats |
| F+H | Induction Step | mid | 20 | 3 | 20 | -5 | +4 | knockdown | 17 | bounds |
| D+H | Fibonacci Uppercut | mid | 14 | 4 | 22 | -14 | launch | launch | 15 | jump cancel on hit (UP) |
| P+K | Series Expansion | throw | 12 | 2 | 26 |  |  |  | 28 | break with P |
| B+P+K | Telescoping Toss | throw | 12 | 2 | 26 |  |  |  | 32 | break with K |
| AIR P | First Difference | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Second Difference | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Summation Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Arithmetic Sequence:** P, P, P, P (frames: P @0, P @11, P @22, P @32)
- **Recursive Rush:** F+P, P, P (frames: F+P @0, P @13, P @26)
- **Partial Sums:** P, P, F, F, P, P, P (frames: P @0, P @11, F @21, F @23, P @28, P @39, P @50)
- **Fibonacci Juggle:** D+H, P, P, H (frames: D+H @0, P @38, P @50, H @59)
- **Fibonacci Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @31, K @40, H @50, K @79)

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
| H | Definite Integral | mid | 19 | 3 | 21 | -4 | +6 | launch | 22 | wall splats |
| F+H | Concave Down | mid | 22 | 3 | 21 | -7 | +3 | knockdown | 19 | bounds |
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
| P AFTER BLOCK | Mean Value Punish | mid | 8 | 2 | 20 | -10 | knockdown | knockdown | 18 | wall splats |
| READ A HIGH | L'Hopital Lock | mid | 6 | 3 | 20 | -6 | knockdown | knockdown | 22 |  |
| READ A MID | Critical Point | mid | 7 | 3 | 18 | -6 | knockdown | knockdown | 22 |  |
| READ A LOW | Saddle Point | low | 7 | 3 | 20 | -12 | knockdown | knockdown | 18 | ducks highs |

**Combo routes** (tested in `tests/sim.test.js`):

- **First Derivative:** P, P (frames: P @0, P @15)
- **Limit Break Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @58, H @69)
- **Inflection Point:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @38, H @47, K @80)
- **Mean Value Punish:** BLOCK THEIR JAB, P, D+K on the ground (frames: P @21, D+K @63; hold B @0-11)

## MIYASHIRO — Spacing — Algebra 2

Very smart. Reads opponents, keeps perfect distance, punishes every mistake.

**Style:** Karate. **Signature:** Calculated — when the opponent whiffs, his next hit does bonus damage and he glows until he lands it; Domain Restriction (B+H) is a step-back kick that retreats while it attacks.

**Movement:** walk 1.9 forward / 2 back, dash 8, backdash 11, jump 9.3, weight 1.06 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Function Jab | high | 10 | 3 | 13 | 0 | +7 | +10 | 7 |  |
| P,P | Inverse | high | 10 | 2 | 16 | -3 | +6 | +9 | 9 |  |
| P,P,H | Solution Set | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F,F+P | Range Check | mid | 12 | 3 | 18 | -4 | +6 | launch | 16 | wall splats |
| K | Root Kick | mid | 14 | 3 | 18 | -5 | +4 | +9 | 13 |  |
| F+K | Domain Control | mid | 16 | 3 | 18 | -6 | +3 | +8 | 12 |  |
| B+K | Vertex Kick | high | 17 | 4 | 20 | -7 | knockdown | knockdown | 18 | tracks |
| D+K | Y-Intercept | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs |
| D/B+K | X-Axis Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Complex Root | mid | 18 | 3 | 22 | -5 | +5 | launch | 20 | wall splats |
| F+H | End Behavior | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| B+H | Domain Restriction | mid | 13 | 3 | 16 | -2 | +5 | +10 | 12 | steps back as it attacks |
| D+H | Quadratic Launcher | mid | 15 | 4 | 23 | -15 | launch | launch | 16 | jump cancel on hit (UP) |
| P+K | Discriminant | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Completing The Square | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Imaginary Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Conjugate Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Focus Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Factor Pair:** P, P (frames: P @0, P @15)
- **Quadratic Juggle:** D+H, P, P, H (frames: D+H @0, P @39, P @53, H @62)
- **Focus Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Calculated Rush:** THEY WHIFF A JAB, F, F+P (CALCULATED BONUS) (frames: F @18, F @20, P @27)
- **Domain And Range:** at the wall: H, F+K, D+H (each input as soon as you can act)

## RAMOS — Grappler — Matrices

Fast, explosive grappler who closes distance quickly. Confident and focused.

**Style:** Wrestler. **Signature:** Cardio — he never slows down: the fastest walk and dash, chained dashes, a guard that recovers twice as fast, and a run he can keep up for as long as he likes (dash, then hold forward), with a tackle, a running knee, a slide, a plancha and a running command grab out of it.

**Movement:** walk 2.8 forward / 1.9 back, dash 10.5 for 14 frames, backdash 9, jump 9.6, weight 0.96 (higher falls faster in juggles).

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Row Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | Column Elbow | high | 10 | 3 | 16 | -2 | +6 | +10 | 11 |  |
| P,P,H | Row Reduction | mid | 12 | 3 | 20 | -9 | knockdown | knockdown | 13 |  |
| F,F+P | Augmented Charge | mid | 13 | 4 | 20 | -9 | knockdown | knockdown | 17 |  |
| RUN, P | Row Operation | mid | 10 | 4 | 22 | -8 | knockdown | knockdown | 16 |  |
| RUN, K | Elementary Knee | mid | 9 | 3 | 22 | -12 | launch | launch | 15 | jump cancel on hit (UP) |
| RUN, D+K | Zero Vector | low | 10 | 6 | 24 | -16 | knockdown | knockdown | 13 | ducks highs |
| RUN, H | Matrix Plancha | mid | 16 | 4 | 26 | -10 | knockdown | knockdown | 22 |  |
| RUN, P+K | Gauss-Jordan | throw | 8 | 4 | 30 |  |  |  | 30 | unbreakable |
| K | Pivot Knee | mid | 13 | 3 | 17 | -4 | +5 | +9 | 13 |  |
| D+K | Lower Triangular | low | 15 | 3 | 20 | -11 | 0 | +6 | 10 | hits downed opponents, ducks highs |
| D/B+K | Null Space Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Row Reduction | mid | 18 | 3 | 21 | -4 | +6 | launch | 20 | wall splats |
| F+H | Scalar Slam | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| D+H | Transpose Toss | mid | 15 | 4 | 23 | -15 | launch | launch | 17 | jump cancel on hit (UP) |
| P+K | Matrix Lock | throw | 12 | 2 | 26 |  |  |  | 34 | break with P |
| B+P+K | Determinant Slam | throw | 12 | 2 | 26 |  |  |  | 38 | break with K |
| F+P+K | Identity | throw | 16 | 3 | 32 |  |  |  | 32 | unbreakable |
| AIR P | Pivot Drop | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Eigen Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Rank Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Row And Column:** P, P (frames: P @0, P @15)
- **Transpose Juggle:** D+H, P, P, H (frames: D+H @0, P @40, P @57, H @70)
- **Rank Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @31, K @36, H @44, K @77)
- **Identity Stomp:** F+P+K, D+K on the ground (frames: F+P+K @0, D+K @66)
- **Cardio:** RUN, K, P, P, H (frames: F @0, F @2, K @24, P @55, P @66, H @75; hold F @2-32)
