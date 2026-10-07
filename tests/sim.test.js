// Headless engine tests: load the simulation scripts (no Phaser) and check
// that measured frame advantage matches the declared frame data, plus core rules.
// Run with: node tests/sim.test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var ctx = { console: console, Math: Math };
ctx.window = ctx; vm.createContext(ctx);
['src/fg.js', 'src/engine/input.js', 'src/data/poses.js', 'src/data/fighters.js',
 'src/engine/fighter.js', 'src/engine/match.js', 'src/engine/dummy.js'].forEach(function (f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
});
var FG = ctx.FG, failures = 0, passes = 0;

function check(name, cond, info) {
  if (cond) passes++; else { failures++; console.log('FAIL', name, info === undefined ? '' : JSON.stringify(info)); }
}
function raw(o) { var r = FG.emptyRaw(); for (var k in o) r[k] = o[k]; return r; }
function run(m, frames, fn) {
  for (var i = 0; i < frames; i++) { var r = fn ? fn(i) : [raw({}), raw({})]; m.step(r); }
}
// Place both fighters at a given distance, both idle, facing each other.
function setup(defA, defB, dist) {
  var m = new FG.Match(defA, defB);
  run(m, 2);
  m.fighters[0].x = 500 - dist / 2; m.fighters[1].x = 500 + dist / 2;
  return m;
}
// Attacker P1 presses a button sequence; defender holds `defRaw`. Runs until measured.
function exchange(defA, defB, dist, press, defRaw, extraFrames) {
  var m = setup(defA, defB, dist);
  var events = [];
  for (var i = 0; i < 160; i++) {
    var p1 = raw(i < press.length ? press[i] : {});
    // The defender starts guarding a few frames in (holding back also walks back).
    m.step([p1, raw(i >= 6 ? defRaw || {} : {})]);
    events = events.concat(m.events);
  }
  return { m: m, events: events };
}

var defs = FG.FIGHTERS;
defs.forEach(function (atk) {
  defs.forEach(function (dfn) {
    var tag = atk.name + ' vs ' + dfn.name;
    // Single moves: measure on block and hit at close range.
    [['jab', { p: true }, false, 'stand'], ['mid', { k: true }, false, 'stand'],
     ['heavy', { h: true }, false, 'stand'], ['low', { k: true, down: true }, true, 'crouch'],
     ['launcher', { h: true, down: true }, false, 'stand']].forEach(function (t) {
      var id = t[0], mv = atk.moves[id];
      var dist = 40;
      // Block
      var backKey = 'right'; // P2 faces left, so holding right is back
      var guardRaw = t[3] === 'crouch' ? { right: true, down: true } : { right: true };
      var r = exchange(atk, dfn, dist, [t[1]], guardRaw);
      var blk = r.events.filter(function (e) { return e.type === 'block'; });
      check(tag + ' ' + id + ' is blocked', blk.length === 1, r.events.map(function (e) { return e.type; }));
      check(tag + ' ' + id + ' block adv', r.m.lastResult[0] && r.m.lastResult[0].adv === mv.block,
        { got: r.m.lastResult[0] && r.m.lastResult[0].adv, want: mv.block });
      // Hit (defender standing still, or crouching for lows is irrelevant: standing gets hit by lows)
      r = exchange(atk, dfn, dist, [t[1]], {});
      var hit = r.events.filter(function (e) { return e.type === 'hit'; });
      check(tag + ' ' + id + ' hits', hit.length === 1, r.events.map(function (e) { return e.type; }));
      if (mv.hit.launch) {
        check(tag + ' ' + id + ' launches', hit[0] && hit[0].launch);
      } else {
        check(tag + ' ' + id + ' hit adv', r.m.lastResult[0] && r.m.lastResult[0].adv === mv.hit.adv,
          { got: r.m.lastResult[0] && r.m.lastResult[0].adv, want: mv.hit.adv });
      }
      check(tag + ' ' + id + ' damage', r.m.fighters[1].health === dfn.health - mv.damage,
        { hp: r.m.fighters[1].health, want: dfn.health - mv.damage });
    });
  });
});

// Hit level rules ------------------------------------------------------------
var S = defs[0], D = defs[1];
(function () {
  // Jab whiffs over a crouching opponent.
  var r = exchange(S, D, 44, [{ p: true }], { down: true });
  check('high whiffs on crouch', r.events.filter(function (e) { return e.type === 'hit' || e.type === 'block'; }).length === 0);
  // Low hits a standing guard.
  r = exchange(S, D, 44, [{ k: true, down: true }], { right: true });
  check('low beats standing guard', r.events.some(function (e) { return e.type === 'hit'; }));
  // Mid hits a crouching guard.
  r = exchange(S, D, 44, [{ k: true }], { right: true, down: true });
  check('mid beats crouch guard', r.events.some(function (e) { return e.type === 'hit'; }));
  // Startup frame check: jab connects exactly on frame 10.
  var m = setup(S, D, 44), hitFrame = null, start = m.frame + 1;
  for (var i = 0; i < 30; i++) { m.step([raw(i === 0 ? { p: true } : {}), raw({})]); if (m.events.some(function (e) { return e.type === 'hit'; })) { hitFrame = m.frame - start + 1; break; } }
  check('jab is i10', hitFrame === 10, hitFrame);
})();

// Counter hit: hit the opponent during their startup.
(function () {
  var m = setup(S, D, 44), evs = [];
  for (var i = 0; i < 80; i++) {
    m.step([raw(i === 0 ? { p: true } : {}), raw(i === 2 ? { h: true } : {})]);
    evs = evs.concat(m.events);
  }
  var hit = evs.filter(function (e) { return e.type === 'hit'; })[0];
  check('counter hit during startup', hit && hit.ch && hit.attacker === 0, hit);
  check('counter hit damage bonus', m.fighters[1].health === D.health - Math.round(S.moves.jab.damage * 1.2), m.fighters[1].health);
})();

// Sidestep evades a linear attack, but a tracking one still connects.
(function () {
  var m = setup(S, D, 44), evs = [];
  for (var i = 0; i < 60; i++) {
    m.step([raw(i === 0 ? { ssIn: true } : {}), raw(i === 2 ? { p: true } : {})]);
    evs = evs.concat(m.events);
  }
  check('sidestep evades linear jab', !evs.some(function (e) { return e.type === 'hit' || e.type === 'block'; }), evs.map(function (e) { return e.type; }));
  m = setup(D, S, 44); evs = [];
  for (i = 0; i < 60; i++) {
    m.step([raw(i === 0 ? {} : {}), raw(i === 0 ? { ssIn: true } : {})]);
  }
  // SIGMA's low kick tracks.
  m = setup(D, S, 44); evs = [];
  for (i = 0; i < 60; i++) {
    m.step([raw(i === 0 ? { ssIn: true } : {}), raw(i === 2 ? { k: true, down: true } : {})]);
    evs = evs.concat(m.events);
  }
  check('tracking low catches sidestep', evs.some(function (e) { return e.type === 'hit'; }), evs.map(function (e) { return e.type; }));
})();

// Launcher -> jab -> heavy juggle connects.
(function () {
  var m = setup(S, D, 40), evs = [];
  var script = { 0: { h: true, down: true }, 48: { p: true }, 76: { h: true } };
  for (var i = 0; i < 200; i++) {
    m.step([raw(script[i] || {}), raw({})]);
    evs = evs.concat(m.events);
  }
  var hits = evs.filter(function (e) { return e.type === 'hit'; }).map(function (e) { return e.move.id; });
  check('launcher > jab > heavy juggle', hits.join() === 'launcher,jab,heavy', hits);
  check('defender knocked down after juggle', ['down', 'getup', 'idle'].indexOf(m.fighters[1].state) >= 0, m.fighters[1].state);
})();

// Blocked launcher is punishable by a jab.
(function () {
  var m = setup(S, D, 44), evs = [];
  for (var i = 0; i < 120; i++) {
    var p2 = raw({ right: true });
    if (i > 20) p2 = raw(i === 24 || i === 25 ? { p: true } : {});
    m.step([raw(i === 0 ? { h: true, down: true } : {}), p2]);
    evs = evs.concat(m.events);
  }
  var punish = evs.filter(function (e) { return e.type === 'hit' && e.attacker === 1; })[0];
  check('blocked launcher gets punished', punish && punish.punish, evs.map(function (e) { return e.type + e.attacker; }));
})();

// Movement: dash, backdash, jump, crouch.
(function () {
  var m = setup(S, D, 300), x0 = m.fighters[0].x;
  run(m, 30, function (i) { return [raw(i === 0 || i === 2 ? { right: true } : {}), raw({})]; });
  check('dash moves forward fast', m.fighters[0].x - x0 > 40, m.fighters[0].x - x0);
  m = setup(S, D, 300); x0 = m.fighters[0].x;
  run(m, 30, function (i) { return [raw(i === 0 || i === 2 ? { left: true } : {}), raw({})]; });
  check('backdash moves back', x0 - m.fighters[0].x > 50, x0 - m.fighters[0].x);
  m = setup(S, D, 300); var maxY = 0;
  run(m, 50, function (i) { maxY = Math.max(maxY, m.fighters[0].y); return [raw(i < 3 ? { up: true } : {}), raw({})]; });
  check('jump leaves the ground and lands', maxY > 60 && m.fighters[0].y === 0, maxY);
  m = setup(S, D, 300);
  run(m, 5, function () { return [raw({ down: true }), raw({})]; });
  check('crouch', m.fighters[0].state === 'crouch', m.fighters[0].state);
  m = setup(S, D, 300); x0 = m.fighters[0].x;
  run(m, 30, function () { return [raw({ right: true }), raw({})]; });
  check('walk forward', Math.abs(m.fighters[0].x - x0 - 30 * S.walkF) < 3, m.fighters[0].x - x0);
})();

// String: SIGMA jab, jab, kick is a natural combo on hit.
(function () {
  var m = setup(S, D, 44), evs = [];
  for (var i = 0; i < 120; i++) {
    m.step([raw(i === 0 || i === 12 ? { p: true } : i === 24 ? { k: true } : {}), raw({})]);
    evs = evs.concat(m.events);
  }
  var hits = evs.filter(function (e) { return e.type === 'hit'; }).map(function (e) { return e.move.id; });
  check('P,P,K string', hits.join() === 'jab,jab2,mid', hits);
})();

// KO resets the round.
(function () {
  var m = setup(S, D, 44);
  m.fighters[1].health = 3;
  var ko = false;
  for (var i = 0; i < 300; i++) { m.step([raw(i === 0 ? { p: true } : {}), raw({})]); if (m.events.some(function (e) { return e.ko; })) ko = true; }
  check('KO happens', ko);
  check('round resets after KO', m.fighters[1].health === D.health, m.fighters[1].health);
})();

console.log(passes + ' passed, ' + failures + ' failed');
process.exit(failures ? 1 : 0);
