// Smack talk: who says what before a round.
// Rivalry exchanges replace the usual lines for specific matchups (either side);
// the first fighter listed speaks first. PEDERSEN has a line for everyone else.
(function () {
  FG.RIVALRIES = [
    { a: 'lee', b: 'chai', lines: [['lee', 'You gonna apologize every time you hit me?'], ['chai', 'Only the first ten times.']] },
    { a: 'lopez', b: 'dalsass', lines: [['lopez', 'I know all your tricks.'], ['dalsass', 'Oh honey, you know some of them.']] },
    { a: 'ramos', b: 'pedersen', lines: [['ramos', "When's the last time you did cardio?"], ['pedersen', 'I drove here. Fast. That counts.']] },
    { a: 'miyashiro', b: 'brinkhus', lines: [['miyashiro', 'I calculated your reach.'], ['brinkhus', 'Did you calculate my height?']] },
    { a: 'brinkhus', b: 'wilson', lines: [['brinkhus', 'Go easy on me?'], ['wilson', 'No.']] },
    { a: 'pedersen', b: 'wilson', lines: [['pedersen', 'You can lead a horse to water...'], ['wilson', "I'm not the horse."]] },
    { a: 'lee', b: 'wilson', lines: [['lee', 'Wow, intense. You ever smile?'], ['wilson', 'Once. 2003.']] }
  ];
  // PEDERSEN vs anyone without a rivalry exchange.
  var PEDERSEN_VS_ANYONE = "You're not Vicky, but you'll do.";

  function pick(list, rnd) { return list[Math.floor(rnd() * list.length)]; }

  // The pre-round dialogue for P1 (defA) vs P2 (defB): [{ speaker: 0 | 1, text }, ...].
  // A fighter with a signature intro line (PEDERSEN) says it first, as he steps out.
  FG.preRoundLines = function (defA, defB, rnd) {
    rnd = rnd || Math.random;
    var defs = [defA, defB], out = [], i;
    function side(id) { return defA.id === id ? 0 : 1; }
    var rival = null;
    for (var r = 0; r < FG.RIVALRIES.length && defA.id !== defB.id; r++) {
      var rv = FG.RIVALRIES[r];
      if ((rv.a === defA.id && rv.b === defB.id) || (rv.a === defB.id && rv.b === defA.id)) rival = rv;
    }
    // A signature intro line comes first, unless the rivalry gives them a different opener.
    for (i = 0; i < 2; i++) {
      var opener = rival && rival.lines[0][0] === defs[i].id;
      if (defs[i].talk && defs[i].talk.introLine && !opener) out.push({ speaker: i, text: defs[i].talk.introLine });
    }
    if (defA.id !== defB.id) {
      if (rival) {
        rival.lines.forEach(function (l) { out.push({ speaker: side(l[0]), text: l[1] }); });
        return out;
      }
      var ped = defA.id === 'pedersen' ? 0 : defB.id === 'pedersen' ? 1 : -1;
      if (ped >= 0) {
        out.push({ speaker: ped, text: PEDERSEN_VS_ANYONE });
        out.push({ speaker: 1 - ped, text: pick(defs[1 - ped].talk.lines, rnd) });
        return out;
      }
    }
    // Everyone else: P1 then P2, each with one of their own lines (no repeats of the intro line).
    for (i = 0; i < 2; i++) {
      var pool = defs[i].talk.lines.filter(function (l) { return l !== defs[i].talk.introLine; });
      out.push({ speaker: i, text: pick(pool, rnd) });
    }
    return out;
  };
})();
