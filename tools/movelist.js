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
function title(s) { return s.toLowerCase().replace(/(^|[\s-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace("L'hopital", "L'Hopital"); }

var ORDER = ['jab', 'jab2', 'fP', 'bP', 'dP', 'dashP', 'ssP', 'ssK', 'mid', 'fK', 'bK', 'low', 'dfK', 'sweep',
  'heavy', 'fH', 'bH', 'launcher', 'throw', 'throwB', 'cmdGrab', 'airP', 'airK', 'airH', 'wakeLow', 'wakeMid'];

var out = [];
out.push('# Mortal Calculus: C221 — Move lists');
out.push('');
out.push('Generated from the fighter data by `node tools/movelist.js`; don\'t edit by hand. Identity, looks and lines are in [`ROSTER.md`](ROSTER.md).');
out.push('');
out.push('Frame data: **i** is startup (the frame the move hits, counting the press as frame 1), then active and recovery frames. Block / hit / counter hit are frame advantage for the attacker. Inputs assume you face right: F = toward the opponent, B = away, D = down.');
out.push('');
FG.ROSTER.forEach(function (d) {
  out.push('## ' + d.name + ' — ' + title(d.archetype) + ' — ' + title(d.theme));
  out.push('');
  out.push(sentence(d.bio));
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
  var ids = Object.keys(d.moves).sort(function (a, b) {
    return rank(a) - rank(b);
  });
  ids.forEach(function (id) {
    var m = d.moves[id], notes = [];
    if (m.tracks) notes.push('tracks');
    if (m.bound) notes.push('bounds');
    if (m.wallSplat) notes.push('wall splats');
    if (m.otg) notes.push('hits downed opponents');
    if (m.crouching) notes.push('ducks highs');
    if (m.feint) notes.push('feint: cancel with P, K, H or P+K during frames 6-18');
    if (m.stanceSwitch) notes.push('switches stance');
    if (m.parry) notes.push('parry');
    if (m.charge) notes.push('hold to charge');
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
  out.push('**Combo routes** (tested in `tests/sim.test.js`):');
  out.push('');
  d.combos.forEach(function (c) {
    var how = c.plan ? 'frames: ' + Object.keys(c.plan).map(function (f) { return c.plan[f] + ' @' + f; }).join(', ') : 'each input as soon as you can act';
    out.push('- **' + title(c.name) + ':** ' + c.notation.replace(/\b([A-Z]{2,})\b/g, function (w) { return ['UP', 'AIR'].indexOf(w) >= 0 ? w.toLowerCase() : w === 'AT' || w === 'THE' || w === 'WALL' || w === 'ON' || w === 'GROUND' || w === 'BOUND' ? w.toLowerCase() : w; }) + ' (' + how + ')');
  });
  out.push('');
});
fs.writeFileSync(path.join(ROOT, 'MOVES.md'), out.join('\n'));
console.log('Wrote MOVES.md (' + FG.ROSTER.length + ' fighters)');
