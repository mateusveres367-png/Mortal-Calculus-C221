# Mortal Calculus: C221 — Move lists

Generated from the fighter data by `node tools/movelist.js`; don't edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).

Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.

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

**Combo routes** (tested in `tests/sim.test.js`):

- **Epsilon-Delta:** P, K, K (frames: P @0, K @14, K @32)
- **Limit Break Juggle:** D+H, P, K (frames: D+H @0, P @53, K @83)
- **Limit At Infinity:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @43, K @55, H @68, K @123)
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
| PARRY | Reflection | mid | 6 | 3 | 18 | -6 | knockdown | knockdown | 20 |  |

**Combo routes** (tested in `tests/sim.test.js`):

- **Right Triangle:** P, K (frames: P @0, K @14)
- **Parabola Juggle:** D+H, P, K (frames: D+H @0, P @55, K @85)
- **Vertex Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @35, K @47, H @60, K @115)
- **Vertex Bound (hard):** D+H, F+H (2-FRAME WINDOW), K (frames: D+H @0, F+H @55, K @110)

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

**Combo routes** (tested in `tests/sim.test.js`):

- **Discontinuity Juggle:** D+H, P, K (frames: D+H @0, P @50, K @84)
- **Inverse Spike:** D+H, up, air K, air H, K (frames: D+H @0, UP @16, K @35, H @48, K @101)
- **Fake Out:** D+H, F+H, H (bound), D+K on the ground (frames: D+H @0, F+H @55, H @60, D+K @133)
- **Slide And Stomp:** D/F+K, D+K on the ground (frames: D/F+K @0, D+K @91)

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

**Combo routes** (tested in `tests/sim.test.js`):

- **Arithmetic Sequence:** P, P, P, P (frames: P @0, P @12, P @26, P @40)
- **Recursive Rush:** F+P, P, P (frames: F+P @0, P @15, P @33)
- **Fibonacci Spike:** D+H, up, air P, air K, air H, K (frames: D+H @0, UP @16, P @42, K @54, H @67, K @123)
- **Fibonacci Juggle:** D+H, P, P, D+K on the ground (frames: D+H @0, P @53, P @65, D+K @115)
