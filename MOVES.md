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
