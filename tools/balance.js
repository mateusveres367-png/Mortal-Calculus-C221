// Self-playtest: HARD CPU against HARD CPU, every pairing, best of three with a 60-second
// timer, headless on the engine (no Phaser). Prints each fighter's win rate, the matchup
// grid, how matches end, and which moves get used (and which never do).
//
//   node tools/balance.js [matches per pairing, default 8] [seed]
//   node tools/balance.js 8 --json     (machine-readable)
//   node tools/balance.js 8 1 --only lee   (just one fighter's matchups, for quick tuning)
var fs = require('fs'), path = require('path'), vm = require('vm');
var args = process.argv.slice(2), N = parseInt(args[0], 10) || 8, SEED = parseInt(args[1], 10) || 4242, JSON_OUT = args.indexOf('--json') >= 0;
var ONLY = args.indexOf('--only') >= 0 ? args[args.indexOf('--only') + 1] : null;

var seededMath = Object.create(Math);
seededMath.random = (function (a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
})(SEED);
var ctx = { console: console, Math: seededMath };
ctx.window = ctx; vm.createContext(ctx);
var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var re = /<script src="(src\/(?:fg\.js|engine\/[^"?]+|data\/[^"?]+))(?:\?[^"]*)?"><\/script>/g, mt;
while ((mt = re.exec(html))) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', mt[1]), 'utf8'), ctx, { filename: mt[1] });
var FG = ctx.FG, C = FG.C, roster = FG.ROSTER;

var stats = {};
roster.forEach(function (d) {
  stats[d.id] = { wins: 0, played: 0, rounds: 0, roundWins: 0, ko: 0, time: 0, ults: 0, perfects: 0, moves: {}, vs: {} };
  roster.forEach(function (o) { stats[d.id].vs[o.id] = { w: 0, n: 0 }; });
});
var totalFrames = 0, matches = 0, roundsPlayed = 0, timeouts = 0;

// One best-of-three, as the fight scene runs it: a fresh match each round, the meter
// carried over, WILSON's experience set from the round number.
function playMatch(a, b, seed) {
  var rounds = new FG.Rounds({ seconds: 60, toWin: 2 }), carry = null;
  var ai = [new FG.AI('hard', seed), new FG.AI('hard', seed + 1)];
  while (rounds.matchWinner() === null) {
    var m = new FG.Match(a, b);
    m.autoReset = false;
    m.reset('center');
    if (carry) for (var i = 0; i < 2; i++) m.fighters[i].meter = carry[i];
    m.fighters.forEach(function (fi) { if (fi.def.passive === '29years') fi.experience = rounds.round - 1; });
    var f = m.fighters, frames = 0, prev = [null, null];
    while (!rounds.result && frames < 60 * 200) {
      m.step([ai[0].input(f[0], f[1], m), ai[1].input(f[1], f[0], m)]);
      frames++;
      for (var k = 0; k < 2; k++) {
        // A move starting (once: hitstop can hold it on its first frame).
        var started = f[k].state === 'attack' && f[k].moveFrame === 1 && f[k].move && !(prev[k] && prev[k].move === f[k].move && prev[k].mf === 1);
        if (started) { var id = f[k].move.id; stats[f[k].def.id].moves[id] = (stats[f[k].def.id].moves[id] || 0) + 1; }
        prev[k] = { move: f[k].move, mf: f[k].state === 'attack' ? f[k].moveFrame : 0 };
      }
      m.events.forEach(function (e) { if (e.type === 'ultimate') stats[f[e.attacker].def.id].ults++; });
      if (m.cinematic) continue;
      if (m.winner !== null) rounds.end(m.winner, 'ko', m);
      else rounds.tick(m);
    }
    totalFrames += frames; roundsPlayed++;
    var r = rounds.result;
    if (!r) { rounds.end(-1, 'time', m); r = rounds.result; }
    [a, b].forEach(function (d, i) { stats[d.id].rounds++; if (r.winner === i) { stats[d.id].roundWins++; if (r.how === 'ko') stats[d.id].ko++; else stats[d.id].time++; if (r.perfect) stats[d.id].perfects++; } });
    if (r.how === 'time') timeouts++;
    carry = [f[0].meter, f[1].meter];
    if (rounds.matchWinner() === null) {
      if (rounds.round >= 9) break; // draws forever: call it
      rounds.next();
    }
  }
  return rounds.matchWinner();
}

var t0 = Date.now(), seed = SEED;
roster.forEach(function (a) {
  roster.forEach(function (b) {
    if (a.id === b.id) return;
    if (ONLY && a.id !== ONLY && b.id !== ONLY) return;
    for (var n = 0; n < N; n++) {
      var w = playMatch(a, b, seed += 17);
      matches++;
      stats[a.id].played++; stats[b.id].played++;
      stats[a.id].vs[b.id].n++; stats[b.id].vs[a.id].n++;
      if (w === 0) { stats[a.id].wins++; stats[a.id].vs[b.id].w++; }
      if (w === 1) { stats[b.id].wins++; stats[b.id].vs[a.id].w++; }
    }
  });
});

var out = { matches: matches, seconds: Math.round((Date.now() - t0) / 1000), avgRound: Math.round(totalFrames / roundsPlayed / 60), timeouts: timeouts, rounds: roundsPlayed, fighters: {} };
roster.forEach(function (d) {
  var s = stats[d.id], moves = Object.keys(d.moves).filter(function (id) {
    var mv = d.moves[id];
    return !mv.enhanced && !mv.prop && !mv.taunt && !/^(wake|air|runP|absCounter|seenCounter|counter|read|reject)/.test(id) && !mv.parryCounter;
  });
  var used = s.moves, total = Object.keys(used).reduce(function (t, k) { return t + used[k]; }, 0);
  out.fighters[d.id] = {
    name: d.name, winRate: s.played ? Math.round(s.wins / s.played * 1000) / 10 : 0, wins: s.wins, played: s.played,
    roundWinRate: s.rounds ? Math.round(s.roundWins / s.rounds * 1000) / 10 : 0, ko: s.ko, timeWins: s.time, perfects: s.perfects, ults: s.ults,
    never: moves.filter(function (id) { return !used[id]; }),
    top: Object.keys(used).sort(function (x, y) { return used[y] - used[x]; }).slice(0, 4).map(function (id) { return id + ' ' + Math.round(used[id] / total * 100) + '%'; }),
    vs: Object.keys(s.vs).filter(function (o) { return o !== d.id; }).map(function (o) { return [o, s.vs[o].n ? Math.round(s.vs[o].w / s.vs[o].n * 100) : null]; })
  };
});

if (JSON_OUT) { console.log(JSON.stringify(out, null, 1)); return; }
console.log(matches + ' matches (' + N + ' per pairing, each side), ' + roundsPlayed + ' rounds, avg round ' + out.avgRound + ' s, ' + timeouts + ' time-outs, ' + out.seconds + ' s');
console.log('\nFIGHTER     WIN%  ROUND%   KO  TIME  PERFECT  ULTS');
roster.slice().sort(function (x, y) { return out.fighters[y.id].winRate - out.fighters[x.id].winRate; }).forEach(function (d) {
  var o = out.fighters[d.id];
  console.log((d.name + '          ').slice(0, 10) + ('     ' + o.winRate).slice(-6) + ('      ' + o.roundWinRate).slice(-8) + ('     ' + o.ko).slice(-5) + ('     ' + o.timeWins).slice(-6) + ('        ' + o.perfects).slice(-9) + ('      ' + o.ults).slice(-6));
});
console.log('\nMATCHUPS (row wins % against column)');
console.log('          ' + roster.map(function (d) { return d.name.slice(0, 4); }).join('  '));
roster.forEach(function (d) {
  var o = out.fighters[d.id], row = roster.map(function (c) { if (c.id === d.id) return '  - '; var v = o.vs.filter(function (x) { return x[0] === c.id; })[0]; return ('   ' + v[1]).slice(-4); });
  console.log((d.name + '          ').slice(0, 10) + row.join('  '));
});
console.log('\nMOVES');
roster.forEach(function (d) {
  var o = out.fighters[d.id];
  console.log(d.name + ': top ' + o.top.join(', ') + (o.never.length ? '   NEVER: ' + o.never.join(', ') : ''));
});
