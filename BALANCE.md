# Balance

How Mortal Calculus: C221 was balanced, and how to check it again.

## The self-playtest

`tools/balance.js` runs the engine headless (no Phaser, no browser): Hard CPU against Hard
CPU, every pairing of the fighters (teachers and students), from both sides. Each match is a best of three with a
60-second timer, run like the fight scene runs it (meter carried between rounds, WILSON's 29 YEARS
set per round). The randomness is seeded, so a run can be repeated exactly.

```bash
node tools/balance.js 24          # 24 matches per pairing, each side (4368 matches, about two minutes)
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

## The student side (14 fighters)

Adding the five students made it 14 fighters and 4368 matches per run (24 per pairing). Judged on
two seeds pooled (777 and 4242, 8736 matches), the spread is **42.4% to 59.6%**, and neither run
lists a never-used move.

| Fighter   | Seed 777 | Seed 4242 | Pooled |
|-----------|---------:|----------:|-------:|
| RAMOS     | 60.1 | 59.1 | 59.6 |
| BRINKHUS  | 57.9 | 56.7 | 57.3 |
| WILSON    | 53.4 | 58.0 | 55.7 |
| PEDERSEN  | 53.4 | 57.2 | 55.3 |
| LEE       | 54.2 | 53.5 | 53.9 |
| JACK      | 53.0 | 53.7 | 53.4 |
| NICOLAS   | 49.7 | 50.2 | 50.0 |
| HUDSON    | 47.8 | 47.4 | 47.6 |
| LOPEZ     | 48.6 | 45.8 | 47.2 |
| CHAI      | 47.4 | 46.5 | 47.0 |
| DALSASS   | 45.8 | 42.3 | 44.0 |
| MIYASHIRO | 43.6 | 43.4 | 43.5 |
| MATEUS    | 43.3 | 43.3 | 43.3 |
| MAX       | 42.0 | 42.8 | 42.4 |

Matchup grid, seed 777 (row wins % against column):

```
          PEDE  BRIN  CHAI  DALS  LEE  LOPE  MIYA  RAMO  WILS  MATE  NICO  MAX  JACK  HUDS
PEDERSEN    -     40    38    65    54    38    48    58    50    48    79    79    46    52
BRINKHUS    60    -     58    58    60    63    48    58    50    69    63    69    31    65
CHAI        63    42    -     31    48    44    56    42    48    67    46    48    44    40
DALSASS     35    42    69    -     46    63    33    31    40    58    50    52    35    42
LEE         46    40    52    54    -     60    38    67    35    75    48    77    65    48
LOPEZ       63    38    56    38    40    -     58    27    65    46    69    67    27    40
MIYASHIRO   52    52    44    67    63    42    -     17    46    35    46    50    15    40
RAMOS       42    42    58    69    33    73    83    -     54    67    40    60    79    81
WILSON      50    50    52    60    65    35    54    46    -     60    63    79    33    46
MATEUS      52    31    33    42    25    54    65    33    40    -     31    46    60    50
NICOLAS     21    38    54    50    52    31    54    60    38    69    -     52    67    60
MAX         21    31    52    48    23    33    50    40    21    54    48    -     67    58
JACK        54    69    56    65    35    73    85    21    67    40    33    33    -     58
HUDSON      48    35    60    58    52    60    60    19    54    50    40    42    42    - 
```

What changed on the way:

- **The CPU against projectiles** (src/engine/ai.js). JACK swung from 14% to 82% after his
  zoning tweaks because the CPU dashed straight into paper airplanes. Now it sees incoming
  projectiles with its reaction delay (`AI.incoming`), blocks them at the right height,
  sidesteps or jumps low ones, and walks rather than dashes while one is in flight. Students
  zone with their `far` tokens only past their `zoneDist`.
- **MAX** (30%: an 11-frame jab loses most exchanges). Health 204 → 228, and a third throw
  in his close-range mix (he's the grappler). JACK's CPU zoning 0.6 → 0.5.
- **MATEUS** health 170 → 184.
- **HUDSON** came in at 47–55% with no changes. The one fix was a mashing loop: his string
  ender wall-splatted, so a jab at the wall could restart the whole Calculator Combo. Only Long
  Division (H) splats now.
- **Teachers**, pushed out of range by the new matchups: BRINKHUS 170 → 166 and PEDERSEN
  172 → 168 health (both about 61%), MIYASHIRO 178 → 190 (38%), RAMOS 197 → 192 (62%: his
  grabs eat the smaller students).

RAMOS is at the top edge, mostly from his grab game against MIYASHIRO and the students
(about 80% against JACK and HUDSON), which is in character for a wrestler against people who
want to keep him out.

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
