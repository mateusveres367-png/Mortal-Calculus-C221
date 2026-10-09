// Generates MOVES.md (every fighter's move list, frame data and combo routes)
// from the fighter definitions, so the docs always match the game.
// Run with: node tools/movelist.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var ROOT = path.join(__dirname, '..');
var ctx = { console: console, Math: Math }; ctx.window = ctx; vm.createContext(ctx);
var html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
var re = /<script src="(src\/(?:fg\.js|engine\/[^"]+|data\/[^"]+))"><\/script>/g, mt;
while ((mt = re.exec(html))) vm.runInContext(fs.readFileSync(path.join(ROOT, mt[1]), 'utf8'), ctx, { filename: mt[1] });
var FG = ctx.FG;

function fmt(n) { return n > 0 ? '+' + n : String(n); }
function result(r) { return r.launch ? 'launch' : r.knockdown ? 'knockdown' : fmt(r.adv); }
function sentence(s) { return s.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
function title(s) { return s.toLowerCase().replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace("L'hopital", "L'Hopital").replace('Q.e.d.', 'Q.E.D.'); }

var ORDER = ['jab', 'jab2', 'fP', 'bP', 'dP', 'dashP', 'runP', 'runK', 'runDK', 'runH', 'runGrab', 'ssP', 'ssK', 'mid', 'fK', 'bK', 'low', 'dfK', 'sweep',
  'heavy', 'fH', 'bH', 'launcher', 'throw', 'throwB', 'cmdGrab', 'airP', 'airK', 'airH', 'wakeLow', 'wakeMid', 'taunt'];

var out = [];
out.push('# Mortal Calculus: C221 — Move lists');
out.push('');
out.push('Generated from the fighter data by `node tools/movelist.js`; don\'t edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).');
out.push('');
out.push('**Grade meter:** three bars, C, B and A, under your health bar. They fill as you land hits, block and take damage, a little faster while you\'re behind, and carry over between rounds. **Enhanced specials** cost one bar: press P+K during the startup of a special that has one (listed under each fighter) and it powers up, the fighter flashing in their colour. **Ultimates** cost all three: down, down-forward, forward + P+K+H (also straight out of a move that hits). If it connects, the fighter\'s own cinematic plays (each one listed under the fighter) and takes about a third of their health; blocked or whiffed, it leaves you wide open. **Extra Credit:** once a match, under 25% health, P+K+H (no motion) refills the meter and adds 20% damage for 7 seconds. **Stage objects:** next to one, T is a springboard dive (Springboard below) and back + T a vault over the opponent out of the corner (Vault); each object then needs 6 seconds.');
out.push('');
out.push('Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.');
out.push('');
FG.ROSTER.forEach(function (d) {
  out.push('## ' + d.name + ' — ' + title(d.archetype) + ' — ' + title(d.theme));
  out.push('');
  out.push(sentence(d.bio));
  out.push('');
  // Style, signature mechanic and how they move (fighters without these fields skip the lines).
  if (d.style) out.push('**Style:** ' + sentence(d.style) + (d.signatureMechanic ? '. **Signature:** ' + title(d.signatureMechanic) + (d.signatureText ? ' — ' + d.signatureText : '') : '') + '.');
  if (d.style) {
    out.push('');
    out.push('**Movement:** walk ' + d.walkF + ' forward / ' + d.walkB + ' back, dash ' + d.dashSpeed + (d.dashFrames ? ' for ' + d.dashFrames + ' frames' : '') +
      ', backdash ' + d.backdashSpeed + ', jump ' + (d.jumpVy || 9.5) + ', weight ' + (d.weight || 1) + ' (higher falls faster in juggles).');
  }
  out.push('');
  out.push('| Input | Move | Level | i | Active | Recovery | Block | Hit | Counter hit | Damage | Notes |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  // Strings sit right after the move they start from; stance moves after the stance switch.
  function rank(id) {
    var i = ORDER.indexOf(id), cmd = d.moves[id].cmd;
    if (i >= 0) return i;
    if (/^P,/.test(cmd)) return 1 + cmd.length / 100;
    if (/^STANCE/.test(cmd)) return ORDER.indexOf('bP') + 0.5;
    if (/^F\+H,/.test(cmd)) return ORDER.indexOf('fH') + 0.5;
    return 40;
  }
  var ids = Object.keys(d.moves).filter(function (id) { return !d.moves[id].enhanced; }).sort(function (a, b) {
    return rank(a) - rank(b);
  });
  ids.forEach(function (id) {
    var m = d.moves[id], notes = [];
    if (m.tracks) notes.push('tracks');
    if (m.bound) notes.push('bounds');
    if (m.wallSplat) notes.push('wall splats');
    if (m.otg) notes.push('hits downed opponents');
    if (m.crouching) notes.push('ducks highs');
    if (m.keepZ) notes.push('stays off the line until it hits');
    if (m.feint) notes.push('feint: cancel with P, K, H or P+K during frames 6-18');
    if (m.stanceSwitch) notes.push('switches stance');
    if (m.parry) notes.push('parry' + (m.parry.counters ? ' (' + m.parry.levels.map(function (l) { return l + ' → ' + title(d.moves[m.parry.counters[l]].label); }).join(', ') + ')' : ''));
    if (m.hold) notes.push('hold ' + m.hold.btn.toUpperCase() + ' to keep it up');
    if (m.step && m.step[2] < 0) notes.push('steps back as it attacks');
    if (m.armor) notes.push('armor: absorbs ' + m.armor.hits + ' hit on frames ' + m.armor.from + '-' + m.armor.to + (m.charge ? ' (2 at full charge)' : ''));
    if (m.charge) notes.push('hold to charge');
    if (m.ex) notes.push('enhance with P+K');
    if (m.taunt) notes.push(m.stare ? 'he doesn\'t taunt: he stares, for ' + FG.C.STARE_METER + ' meter; counter-hittable the whole time' : 'says a taunt line; counter-hittable the whole time');
    if (m.cancels && m.cancels.some(function (c) { return c.btn === 'any'; })) notes.push('Chain Rule: on contact, cancels into any of his other moves (once a string)');
    if (m.parry && m.parry.reflect) notes.push('the counter hits at least as hard as what it caught');
    if (id === 'seenCounter') notes.push('comes out on its own, once a round (see 29 Years)');
    if (m.kick && d.kickChain) notes.push('kick chain');
    if (m.tip) notes.push('Long Arms: +' + Math.round((FG.C.TIP_BONUS - 1) * 100) + '% damage at the tip');
    if (m.evade) notes.push('evades ' + m.evade.levels.map(function (l) { return l + 's'; }).join(' and ') + ' on frames ' + m.evade.from + '-' + m.evade.to);
    if (m.cancels) m.cancels.forEach(function (c) { if (c.onSway) notes.push('P after a miss: ' + title(d.moves[c.into].label)); });
    if (m.throw) notes.push(m.breakBtn ? 'break with ' + m.breakBtn.toUpperCase() : 'unbreakable');
    if (m.cancels) m.cancels.forEach(function (c) { if (c.into === 'jump') notes.push('jump cancel on hit (UP)'); });
    if (m.air) notes.push('hitstun ' + m.stunHit + ', blockstun ' + m.stunBlock + ', landing ' + m.landLag);
    var noHit = !m.box;
    var level = m.throw ? 'throw' : noHit ? '—' : m.level;
    var frameCols = noHit ? [m.total + ' total', '', ''] : [m.startup, m.active, m.recovery];
    var adv = m.throw || m.air || noHit ? ['', '', ''] : [fmt(m.block), result(m.hit), result(m.ch)];
    out.push('| ' + [m.cmd, title(m.label), level].concat(frameCols, adv, [noHit ? '' : m.damage, notes.join(', ')]).join(' | ') + ' |');
  });
  out.push('');
  var exIds = ids.filter(function (id) { return d.moves[id].ex; });
  if (exIds.length) {
    out.push('**Enhanced specials** (P+K during the startup, 1 bar):');
    out.push('');
    exIds.forEach(function (id) {
      var b = d.moves[id], x = d.moves[id + FG.EX_SUFFIX];
      var dmg = x.multi ? (x.multi + 1) + ' hits of ' + x.damage : x.damage + ' damage (from ' + b.damage + ')';
      var res = result(x.hit) !== result(b.hit) ? ', hit: ' + result(x.hit) : '';
      out.push('- **' + title(x.label) + '** (`' + b.cmd + '`, then `P+K`): ' + sentence(x.exText) + ' — ' + dmg + res +
        (x.armor ? ', armor on frames ' + x.armor.from + '-' + x.armor.to + ' (' + x.armor.hits + (x.armor.hits > 1 ? ' hits' : ' hit') + ')' : '') +
        (x.wallSplat && !b.wallSplat ? ', wall splats' : '') + '.');
    });
    out.push('');
  }
  if (d.boss) {
    out.push('**Boss:** the final fight in arcade mode. Playable in training and versus from the start, and in arcade and VS CPU once arcade has been beaten.');
    out.push('');
  }
  if (d.ultimate) {
    var um = d.moves.ultimate;
    out.push('**Ultimate:** ' + title(d.ultimate.name) + ' — `D, D/F, F + P+K+H` with all three bars' + (d.ultimate.counter ? ' (a counter stance, frames ' + um.parry.from + '-' + um.parry.to + ')' : '') +
      ': ' + d.ultimate.text + '. ' + d.ultimate.hits.length + ' hits, ' + Math.round(FG.C.ULT_DAMAGE * 100) + '% of their health' +
      (d.ultimate.counter ? '; whiffed, ' + um.total + ' frames' : um.throw ? '; a grab, so it can\'t be blocked' : '; blocked ' + fmt(um.block) + ', whiffed ' + um.total + ' frames') + '.');
    out.push('');
  }
  if (d.finisher) {
    out.push('**KO finisher:** ' + title(d.finisher.name) + ' — `' + d.finisher.input + '` within 2 seconds of the K.O. that wins the match (training: menu, FINISHER).');
    out.push('');
  }
  out.push('**Combo routes** (tested in `tests/sim.test.js`):');
  out.push('');
  d.combos.forEach(function (c) {
    var how = c.plan ? 'frames: ' + Object.keys(c.plan).map(function (f) { return c.plan[f] + ' @' + f; }).join(', ') : 'each input as soon as you can act';
    if (c.hold) how += '; hold ' + c.hold.map(function (h) { return h[2] + ' @' + h[0] + '-' + h[1]; }).join(', ');
    out.push('- **' + title(c.name) + (c.meter ? ' (' + c.meter + (c.meter > 1 ? ' bars' : ' bar') + ')' : '') + ':** ' + c.notation.replace(/\b([A-Z]{2,})\b/g, function (w) { return ['UP', 'AIR'].indexOf(w) >= 0 ? w.toLowerCase() : w === 'AT' || w === 'THE' || w === 'WALL' || w === 'ON' || w === 'GROUND' || w === 'BOUND' ? w.toLowerCase() : w; }) + ' (' + how + ')');
  });
  out.push('');
});
fs.writeFileSync(path.join(ROOT, 'MOVES.md'), out.join('\n'));
console.log('Wrote MOVES.md (' + FG.ROSTER.length + ' fighters)');
