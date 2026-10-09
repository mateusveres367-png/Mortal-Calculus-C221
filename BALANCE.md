# Balance

How Mortal Calculus: C221 was balanced, and how to check it again.

## The self-playtest

`tools/balance.js` runs the engine headless (no Phaser, no browser): Hard CPU against Hard
CPU, every pairing of the nine fighters, from both sides. Each match is a best of three with a
60-second timer, run like the fight scene runs it (meter carried between rounds, WILSON's 29 YEARS
set per round). The randomness is seeded, so a run can be repeated exactly.

```bash
node tools/balance.js 24          # 24 matches per pairing, each side (1728 matches, about a minute)
node tools/balance.js 24 777      # the same with seed 777
node tools/balance.js 8 1 --only lee   # just one fighter's matchups, for quick tuning
node tools/balance.js 24 --json   # machine-readable
```

It prints each fighter's match and round win rates, how their rounds were won (KO, time, perfect),
how many ultimates they landed, the matchup grid (row's win % against column), each fighter's
most-used moves and any move the CPU **never** used.

A run of 8 per pairing is noisy: a fighter moves by ±4% from one seed to the next. Judge changes on
24 per pairing, or pool a few seeds.

The CPU plays the way the game teaches: its own style list (`ai` in each fighter file), its combo
routes, throws, meter and stage objects. So a fighter that loses here is either weak or played
badly by the CPU, and both matter: the CPU is what arcade, VS CPU and Detention players fight.

## Before and after

Match win %, Hard vs Hard. The baseline is 8 per pairing (576 matches); the final run is 24 per
pairing (1728 matches, seed 777). Pooled over seeds 11, 22 and 33 (3456 matches), the final spread
is 43.5% to 58.5%.

| Fighter   | Before | After | Change |
|-----------|-------:|------:|-------:|
| WILSON    | 89.8   | 58.3  | −31.5 |
| PEDERSEN  | 78.9   | 52.3  | −26.6 |
| LOPEZ     | 64.8   | 48.2  | −16.6 |
| BRINKHUS  | 60.9   | 58.1  | −2.8  |
| CHAI      | 56.3   | 47.4  | −8.9  |
| MIYASHIRO | 39.1   | 44.5  | +5.4  |
| RAMOS     | 35.9   | 47.9  | +12.0 |
| DALSASS   | 18.0   | 41.7  | +23.7 |
| LEE       | 6.3    | 51.6  | +45.3 |

The worst matchup went from 0–100 (LEE lost every match to six fighters) to about 20–80 (LOPEZ's
counter stance against RAMOS's rushdown, and RAMOS's grab game against MIYASHIRO), which is in
character for both pairs.

Final matchup grid (row wins % against column):

```
          PEDE  BRIN  CHAI  DALS  LEE  LOPE  MIYA  RAMO  WILS
PEDERSEN    -     48    44    65    58    31    60    63    50
BRINKHUS    52    -     65    60    60    69    35    79    44
CHAI        56    35    -     42    42    40    65    65    35
DALSASS     35    40    58    -     44    40    38    44    35
LEE         42    40    58    56    -     46    56    77    38
LOPEZ       69    31    60    60    54    -     50    19    42
MIYASHIRO   40    65    35    63    44    50    -     19    42
RAMOS       38    21    35    56    23    81    81    -     48
WILSON      50    56    65    65    63    58    58    52    -
```

Rounds average 33 seconds; about 1% end on time.

## What was wrong, and the fixes

### The CPU (src/engine/ai.js)

Most of the spread came from the CPU, not the numbers.

- **Poking range only looked at K.** The CPU only poked from as far as its K reached, so a
  fighter whose poke is a lunge (LEE's F+P) walked in to K range and never used it. LEE won 6% of
  matches. The poking range is now the furthest of K and the fighter's own style pokes. LEE alone
  went from 7% to 44% with this.
- **Grab ultimate never fired.** `reach()` only read `box`, and grabs have only a `hitbox`, so the
  CPU thought RAMOS's ultimate (a grab) had no range: 2 ultimates in 576 matches. It now reads
  either. With three bars and up close, the CPU goes for the grab ultimate (it can't be blocked).
  RAMOS now lands about as many ultimates as anyone.
- **Scripted strings in style lists.** A style token like `'P>K>K'` or `'F+H>H'` now plays as a
  move and its follow-up 8 frames apart, so the CPU uses string enders and feint follow-ups on
  purpose instead of hoping a random press lines up.
- **The generic close-range mix had holes.** It never used the reverse throw, the sweep or the
  heavies. It now picks P routes, throws (30% of them the reverse throw), D+H routes, a low, a mid
  or the sweep, and the heavy (F+H when it has a hitbox, otherwise H), with slightly less P.
- **Dash attacks.** A dash-in from close enough sometimes ends in the dash attack.

### Fighter data

All damage changes keep every combo route inside the fair-damage test (`tests/sim.test.js`), and
`MOVES.md` and `COMBOS.md` are regenerated from the data.

- **WILSON** (89.8%: fastest jab, strongest poke, the boss's numbers in a fair fight).
  - Health 175 → 160.
  - Every hit is about 25% weaker; throws 34/32 → 26/24.
  - His F+P poke: startup 14 → 15, damage 13 → 8, +3 on hit instead of +4.
  - 29 YEARS: movement ×1.2 → ×1.1 from round 2, damage ×1.15 → ×1.1 in round 3.
  - He is still the best fighter here, and the hardest arcade fight on top of that (he gets the
    highest CPU level).
- **PEDERSEN** (78.9%: armored heavies traded through everything and hit 43% of the time).
  - Health 200 → 172.
  - Armored heavies 28/36/20 → 22/26/18; the rest of the kit −1 or −2.
  - Throws 40/38 → 36/34.
- **LOPEZ**: no data changes. He came down from the others' fixes.
- **BRINKHUS** (rose to 67% once the CPU used his strings).
  - Health 175 → 170.
  - Damage −1 or −2 on every move.
- **CHAI**: +1 damage on most moves, and throws 28/32 → 29/34. Two new style tokens: `SI>K`
  (sidestep into a kick) and `P>K`.
- **MIYASHIRO**: health 172 → 178. B+K added to his pokes.
- **RAMOS**
  - Health 178 → 197.
  - +1 or +2 damage on most moves; throws 34/38 → 37/41.
  - The grab-ultimate fix above.
- **DALSASS** (18%: feints and sways cancelled into nothing, and the hits were light).
  - Health 170 → 198.
  - About +5 damage per move (jab 7 → 11, launcher 20 → 28); reverse throw 33 → 46.
  - CPU feints 30% → 12% and sways 25% → 15%. Feints now come as scripted `F+H>H` /
    `F+H>P+K` mix-ups.
- **LEE** (6%: the lowest damage in the game on the shortest reach).
  - Health 165 → 176.
  - About +40% damage; throws 28/32 → 39/45.
  - CPU spacing 30 → 44, less blind dashing (aggro 1.35 → 1.1, dash-in 0.7 → 0.5).
  - Full-string tokens `P>P>P>P` / `P>P>P>K` added to his style list.

### Never-used moves

The baseline run had moves no CPU ever threw:

- every **sweep** and **reverse throw**;
- most **F+H**;
- **dashP** for PEDERSEN, MIYASHIRO, RAMOS and WILSON;
- the P, K strings for BRINKHUS (eps, delta), LEE (seqP, seqK) and CHAI (jabK);
- MIYASHIRO's **B+K** and H, and RAMOS's H.

The fixes were the close-range mix (sweeps, heavies, reverse throws), the dash attack and the
string tokens in each style list. The final runs list no never-used moves.

**Always-used moves.** No single move is more than about a quarter of a fighter's attacks. The jab
leads for most (14–25%), which is right for the fastest button. DALSASS's D+K (23%) and LEE's D+K
(20%) are next: their lows are good, and blocking low is what the CPU is worst at.
