# Mortal Calculus: C221 — Move lists

Generated from the fighter data by `node tools/movelist.js`; don't edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).

Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.

## PEDERSEN — Power — Exponents

Calm and friendly, but every hit is heavy. Slow, patient, devastating.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Power Jab | high | 11 | 2 | 14 | 0 | +7 | +10 | 10 |  |
| P,P | Squared | high | 12 | 3 | 19 | -5 | +4 | +10 | 15 |  |
| K | Exponent Kick | mid | 16 | 3 | 20 | -7 | +5 | +10 | 19 |  |
| D+K | Negative Exponent | low | 18 | 3 | 22 | -13 | 0 | +6 | 13 | hits downed opponents, ducks highs |
| D/B+K | Zero Power Sweep | low | 22 | 3 | 26 | -18 | knockdown | knockdown | 20 | ducks highs |
| H | Base Hook | mid | 21 | 4 | 20 | +1 | +8 | launch | 28 | wall splats |
| F+H | Exponential Haymaker | mid | 26 | 4 | 22 | -6 | knockdown | launch | 36 | wall splats |
| B+H (HOLD) | Order Of Magnitude | mid | 20 | 4 | 22 | -8 | +4 | knockdown | 20 | wall splats, hold to charge |
| D+H | Power Rule | mid | 17 | 4 | 24 | -17 | launch | launch | 22 | jump cancel on hit (UP) |
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
- **Power Rule Juggle:** D+H, P, P (frames: D+H @0, P @42, P @59)
- **Tower Of Powers:** D+H, up, air K, air H, D+K on the ground (frames: D+H @0, UP @20, K @31, H @40, D+K @94)
- **Exponential Growth:** at the wall: H, D+H (each input as soon as you can act)

## BRINKHUS — Balanced — Limits

Nice, easygoing, a good sport. Best for new players.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Limit Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | One-Sided Limit | high | 9 | 2 | 16 | -3 | +6 | +9 | 9 |  |
| P,K | Epsilon | mid | 11 | 3 | 18 | -7 | +4 | +8 | 11 |  |
| P,K,K | Delta | mid | 13 | 3 | 22 | -13 | knockdown | knockdown | 16 | wall splats |
| K | Convergent Kick | mid | 14 | 3 | 18 | -6 | +4 | +9 | 14 |  |
| D+K | Lower Bound | low | 16 | 3 | 21 | -12 | -1 | +5 | 10 | tracks, hits downed opponents, ducks highs |
| D/B+K | Zero Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | L'Hopital Hook | mid | 19 | 3 | 22 | -4 | +6 | launch | 22 | wall splats |
| F+H | Infinite Limit | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| D+H | Limit Break | mid | 15 | 4 | 22 | -15 | launch | launch | 16 | jump cancel on hit (UP) |
| P+K | Squeeze Theorem | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Direct Substitution | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | Left Limit | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Right Limit | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Limit At Infinity | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Epsilon-Delta:** P, K, K (frames: P @0, K @12, K @24)
- **Limit Break Juggle:** D+H, P, P, D+K on the ground (frames: D+H @0, P @38, P @55, D+K @95)
- **Limit At Infinity:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Hard Limit:** at the wall: H, P, P, D+H (each input as soon as you can act)

## CHAI — Technical — Geometry

Very kind, precise and graceful. Bows before fights.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Right Angle | high | 10 | 2 | 12 | +2 | +8 | +11 | 6 |  |
| P,K | Complementary Kick | mid | 12 | 3 | 20 | -9 | +3 | +8 | 12 |  |
| SS, P | Tangent Step | mid | 12 | 3 | 16 | -3 | +6 | knockdown | 15 | tracks, stays off the line until it hits |
| SS, K | Secant Sweep | low | 15 | 3 | 22 | -13 | knockdown | knockdown | 12 | tracks, ducks highs, stays off the line until it hits |
| K | Isosceles Kick | mid | 13 | 3 | 19 | -6 | +4 | +9 | 13 |  |
| D+K | Acute Low | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs |
| D/B+K | Obtuse Sweep | low | 19 | 3 | 26 | -18 | knockdown | knockdown | 15 | ducks highs |
| H | Hypotenuse | mid | 17 | 3 | 22 | -6 | +5 | launch | 19 | wall splats |
| F+H | Vertex Drop | mid | 20 | 3 | 20 | -7 | +3 | knockdown | 17 | bounds |
| B+H | Reflection Counter | — | 31 total |  |  |  |  |  |  | parry |
| D+H | Parabola Launcher | mid | 14 | 4 | 24 | -16 | launch | launch | 15 | jump cancel on hit (UP) |
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
- **Parabola Juggle:** D+H, P, K (frames: D+H @0, P @39, K @53)
- **Vertex Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @40, H @50, K @79)

## DALSASS — Tricky — Functions

Happy, sassy, everyone's favorite. Fakes you out with a grin.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Domain Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | Range Cross | high | 10 | 2 | 17 | -4 | +5 | +9 | 10 |  |
| B+P | Piecewise | — | 13 total |  |  |  |  |  |  | switches stance |
| STANCE P | Step Function | mid | 12 | 2 | 18 | -4 | +6 | +10 | 12 |  |
| STANCE K | Absolute Value | low | 13 | 3 | 20 | -12 | +1 | +6 | 11 | hits downed opponents, ducks highs |
| STANCE H | Jump Discontinuity | mid | 20 | 3 | 20 | -6 | +4 | launch | 20 | bounds |
| K | Function Kick | mid | 15 | 3 | 19 | -7 | +4 | +9 | 15 |  |
| D+K | Floor Function | low | 16 | 3 | 20 | -11 | 0 | +6 | 10 | tracks, hits downed opponents, ducks highs |
| D/F+K | Asymptote Slide | low | 18 | 5 | 24 | -16 | knockdown | knockdown | 14 | ducks highs |
| D/B+K | Root Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Composite Hook | mid | 18 | 3 | 22 | -5 | +5 | launch | 20 | wall splats |
| F+H | Function Feint | — | 24 total |  |  |  |  |  |  | feint: cancel with P, K, H or P+K during frames 6-18 |
| F+H, H | Inverse Drop | mid | 14 | 3 | 22 | -8 | +4 | knockdown | 18 | bounds |
| D+H | Discontinuity | mid | 15 | 4 | 23 | -15 | launch | launch | 17 | jump cancel on hit (UP) |
| P+K | Contradiction | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Counterexample | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Image Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Preimage Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Inverse Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Composition:** P, P (frames: P @0, P @15)
- **Discontinuity Juggle:** D+H, P, P (frames: D+H @0, P @38, P @56)
- **Inverse Spike:** D+H, up, air K, air H, K (frames: D+H @0, UP @17, K @31, H @41, K @70)
- **Slide And Stomp:** D/F+K, D+K on the ground (frames: D/F+K @0, D+K @49)

## LEE — Rushdown — Sequences

Sarcastic and funny. Taunts mid-combo. Relentless pressure.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | First Term | high | 10 | 2 | 12 | +2 | +9 | +11 | 6 |  |
| P,P | Second Term | high | 9 | 2 | 14 | -1 | +7 | +10 | 7 |  |
| P,P,P | Third Term | mid | 8 | 2 | 16 | -4 | +5 | +9 | 8 |  |
| P,P,P,P | Nth Term | mid | 7 | 3 | 22 | -12 | knockdown | knockdown | 14 | wall splats |
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
- **Fibonacci Juggle:** D+H, P, P, D+K on the ground (frames: D+H @0, P @37, P @50, D+K @90)
- **Fibonacci Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @31, K @40, H @50, K @79)

## LOPEZ — Defensive — Statistics

Very suspicious. Always watching. Waits for you to commit, then punishes.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Sample Jab | high | 10 | 2 | 14 | 0 | +7 | +10 | 8 |  |
| P,P | Mean Straight | high | 10 | 2 | 16 | -3 | +6 | +9 | 10 |  |
| K | Regression Kick | mid | 15 | 3 | 18 | -5 | +4 | +9 | 15 |  |
| D+K | Lower Quartile | low | 16 | 3 | 20 | -12 | 0 | +6 | 11 | hits downed opponents, ducks highs |
| D/B+K | Bell Curve Sweep | low | 21 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Significant Figure | mid | 19 | 3 | 21 | -4 | +6 | launch | 22 | wall splats |
| F+H | Median Drop | mid | 22 | 3 | 21 | -7 | +3 | knockdown | 19 | bounds |
| B+H | Null Hypothesis | — | 33 total |  |  |  |  |  |  | parry |
| D+H | Outlier | mid | 16 | 4 | 22 | -15 | launch | launch | 17 | jump cancel on hit (UP) |
| P+K | Regression | throw | 12 | 2 | 26 |  |  |  | 32 | break with P |
| B+P+K | Residual | throw | 12 | 2 | 26 |  |  |  | 34 | break with K |
| AIR P | Sample Drop | mid | 8 | 4 | 10 |  |  |  | 10 | hitstun 16, blockstun 10, landing 5 |
| AIR K | Variance Kick | mid | 10 | 5 | 12 |  |  |  | 13 | hitstun 18, blockstun 12, landing 7 |
| AIR H | Normal Distribution | mid | 13 | 4 | 16 |  |  |  | 19 | bounds, hitstun 22, blockstun 14, landing 11 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |
| P AFTER BLOCK | Confidence Interval | mid | 8 | 2 | 20 | -10 | knockdown | knockdown | 18 | wall splats |
| PARRY | Rejection | mid | 7 | 3 | 18 | -6 | knockdown | knockdown | 22 |  |

**Combo routes** (tested in `tests/sim.test.js`):

- **Sample Mean:** P, P (frames: P @0, P @15)
- **Outlier Juggle:** D+H, P, P, D+K on the ground (frames: D+H @0, P @39, P @56, D+K @97)
- **Normal Distribution:** D+H, up, air P, air K, air H, D+K on the ground (frames: D+H @0, UP @18, P @32, K @41, H @51, D+K @103)
- **Confidence Interval:** BLOCK THEIR JAB, P, D+K on the ground (frames: P @21, D+K @63; hold B @0-11)

## MIYASHIRO — Spacing — Vectors

Very smart. Reads opponents, keeps perfect distance, punishes every mistake.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Unit Vector | high | 10 | 3 | 13 | 0 | +7 | +10 | 7 |  |
| P,P | Scalar | high | 10 | 2 | 16 | -3 | +6 | +9 | 9 |  |
| F,F+P | Vector Rush | mid | 12 | 3 | 18 | -4 | +6 | launch | 16 | wall splats |
| K | Magnitude Kick | mid | 14 | 3 | 18 | -5 | +4 | +9 | 13 |  |
| F+K | Dot Product | mid | 16 | 3 | 18 | -6 | +3 | +8 | 12 |  |
| B+K | Unit Circle | high | 17 | 4 | 20 | -7 | knockdown | knockdown | 18 | tracks |
| D+K | Component Low | low | 15 | 3 | 19 | -11 | 0 | +6 | 9 | hits downed opponents, ducks highs |
| D/B+K | Orthogonal Sweep | low | 20 | 3 | 26 | -18 | knockdown | knockdown | 16 | ducks highs |
| H | Resultant | mid | 18 | 3 | 22 | -5 | +5 | launch | 20 | wall splats |
| F+H | Normal Vector | mid | 21 | 3 | 21 | -6 | +3 | knockdown | 18 | bounds |
| D+H | Cross Product | mid | 15 | 4 | 23 | -15 | launch | launch | 16 | jump cancel on hit (UP) |
| P+K | Projection | throw | 12 | 2 | 26 |  |  |  | 30 | break with P |
| B+P+K | Reflection Matrix | throw | 12 | 2 | 26 |  |  |  | 33 | break with K |
| AIR P | Component Jab | mid | 7 | 4 | 10 |  |  |  | 8 | hitstun 16, blockstun 10, landing 4 |
| AIR K | Direction Kick | mid | 9 | 5 | 12 |  |  |  | 11 | hitstun 18, blockstun 12, landing 6 |
| AIR H | Projection Spike | mid | 12 | 4 | 16 |  |  |  | 16 | bounds, hitstun 22, blockstun 14, landing 10 |
| K (DOWN) | Rolling Zero | low | 14 | 3 | 22 | -14 | -2 | +1 | 10 | ducks highs |
| P/H (DOWN) | Spring Theorem | mid | 18 | 3 | 22 | -12 | +2 | +5 | 14 |  |
| T | Taunt | — | 61 total |  |  |  |  |  |  | says a taunt line; counter-hittable the whole time |

**Combo routes** (tested in `tests/sim.test.js`):

- **Unit Vectors:** P, P (frames: P @0, P @15)
- **Cross Product Juggle:** D+H, P, P, D+K on the ground (frames: D+H @0, P @38, P @56, D+K @97)
- **Projection Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @41, H @51, K @79)
- **Calculated Rush:** THEY WHIFF A JAB, F, F+P (CALCULATED BONUS) (frames: F @18, F @20, P @27)
- **Vector Space:** at the wall: H, F+K, D+H (each input as soon as you can act)

## RAMOS — Grappler — Matrices

Fast, explosive grappler who closes distance quickly. Confident and focused.

| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P | Row Jab | high | 10 | 2 | 13 | +1 | +8 | +10 | 7 |  |
| P,P | Column Elbow | high | 10 | 3 | 16 | -2 | +6 | +10 | 11 |  |
| F,F+P | Augmented Charge | mid | 13 | 4 | 20 | -9 | knockdown | knockdown | 17 |  |
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
- **Transpose Juggle:** D+H, P, D+K on the ground (frames: D+H @0, P @39, D+K @82)
- **Rank Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @17, P @32, K @40, H @50, K @79)
- **Identity Stomp:** F+P+K, D+K on the ground (frames: F+P+K @0, D+K @66)
