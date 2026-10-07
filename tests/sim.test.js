// Headless engine tests: load the simulation scripts (no Phaser) and check
// that measured frame advantage matches the declared frame data, plus core rules.
// Run with: node tests/sim.test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var ctx = { console: console, Math: Math };
ctx.window = ctx; vm.createContext(ctx);
['src/fg.js', 'src/engine/input.js', 'src/data/poses.js', 'src/data/fighters.js',
 'src/engine/fighter.js', 'src/engine/match.js', 'src/engine/combat.js', 'src/engine/dummy.js', 'src/render/inputDisplay.js'].forEach(function (f) {
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
     ['launcher', { h: true, down: true }, false, 'stand'],
     ['sweep', { k: true, down: true, left: true }, true, 'crouch'], ['slam', { h: true, right: true }, false, 'stand']].forEach(function (t) {
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
      if (mv.hit.knockdown) {
        check(tag + ' ' + id + ' knocks down', hit[0] && hit[0].knockdown);
      } else if (mv.hit.launch) {
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

// Launcher -> jab -> mid juggle connects.
(function () {
  var m = setup(S, D, 40), evs = [];
  var script = { 0: { h: true, down: true }, 48: { p: true }, 76: { k: true } };
  for (var i = 0; i < 200; i++) {
    m.step([raw(script[i] || {}), raw({})]);
    evs = evs.concat(m.events);
  }
  var hits = evs.filter(function (e) { return e.type === 'hit'; }).map(function (e) { return e.move.id; });
  check('launcher > jab > mid juggle', hits.join() === 'launcher,jab,mid', hits);
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

// =========================== Phase 2 =========================================

// Run a scripted exchange. plans: { frame: rawInput } for P1 and P2.
function play(atk, dfn, dist, plan1, plan2, frames, setupFn) {
  var m = setup(atk, dfn, dist), evs = [];
  if (setupFn) setupFn(m);
  for (var i = 0; i < frames; i++) {
    var r1 = raw(typeof plan1 === 'function' ? plan1(i, m) : (plan1[i] || {}));
    var r2 = raw(typeof plan2 === 'function' ? plan2(i, m) : (plan2[i] || {}));
    m.step([r1, r2]);
    evs = evs.concat(m.events);
  }
  return { m: m, events: evs, hits: evs.filter(function (e) { return e.type === 'hit' && e.attacker === 0; }) };
}
function types(r) { return r.events.map(function (e) { return e.type; }); }
function has(r, type) { return r.events.some(function (e) { return e.type === type; }); }
var LAUNCH = { h: true, down: true };

// Air combo: launcher, jump cancel, air P > air K > air H (bound), ground follow-up.
(function () {
  var plan = { 0: LAUNCH, 16: { up: true }, 28: { p: true }, 34: { k: true }, 44: { h: true }, 102: { k: true } };
  var r = play(S, D, 40, plan, {}, 260);
  var ids = r.hits.map(function (e) { return e.move.id; });
  check('air combo route', ids.join() === 'launcher,airP,airK,airH,mid', ids);
  check('air heavy bounds', r.hits.some(function (e) { return e.bound; }) && has(r, 'bounce'));
  // Skill: the same inputs without the jump cancel just whiff in place.
  var plan2 = { 0: LAUNCH, 28: { p: true }, 34: { k: true }, 44: { h: true } };
  r = play(S, D, 40, plan2, {}, 200);
  check('no jump cancel, no air combo', r.hits.length <= 2, r.hits.map(function (e) { return e.move.id; }));
  // Skill: mistimed air punch misses.
  var plan3 = { 0: LAUNCH, 16: { up: true }, 66: { p: true } };
  r = play(S, D, 40, plan3, {}, 200);
  check('late air punch drops the combo', r.hits.length === 1, r.hits.map(function (e) { return e.move.id; }));
  // Jump cancel only works on hit, not on block.
  r = play(S, D, 40, { 0: LAUNCH, 16: { up: true } }, function (i) { return i >= 6 ? { right: true } : {}; }, 60);
  check('no jump cancel on block', r.m.fighters[0].y === 0 && r.m.fighters[0].state !== 'air', r.m.fighters[0].state);
})();

// DELTA's shorter air route: launcher, jump cancel, air K > air H.
(function () {
  var plan = { 0: LAUNCH, 16: { up: true }, 28: { k: true }, 34: { h: true }, 96: { k: true } };
  var r = play(D, S, 40, plan, {}, 260);
  var ids = r.hits.map(function (e) { return e.move.id; });
  check('DELTA air route', ids.join() === 'launcher,airK,airH,mid', ids);
})();

// One bound per combo: a second bound move just juggles.
(function () {
  var plan = { 0: LAUNCH, 16: { up: true }, 28: { p: true }, 34: { k: true }, 44: { h: true } };
  var r = play(S, D, 40, plan, {}, 102, null);
  var m = r.m, d = m.fighters[1];
  check('bound used', d.boundUsed === true, d.boundUsed);
  var bounds = r.events.filter(function (e) { return e.bound; }).length;
  check('exactly one bound', bounds === 1, bounds);
})();

// Juggles end on their own: mashing jab after a launcher can't loop forever.
(function () {
  var r = play(S, D, 40, function (i) { return i === 0 ? LAUNCH : (i > 40 && i % 12 === 0 ? { p: true } : {}); }, {}, 400);
  var d = r.m.fighters[1];
  check('juggle ends (mash)', r.hits.length < 8 && d.state !== 'juggle', { hits: r.hits.length, state: d.state });
})();

// Wall splat from a heavy next to the wall, then a wall combo.
(function () {
  function nearWall(m) { var w = FG.C.WALL_R - 18 * D.scale - 10; m.fighters[1].x = w; m.fighters[0].x = w - 44; }
  var r = play(S, D, 44, { 0: { h: true } }, {}, 40, nearWall);
  check('heavy at the wall splats', has(r, 'wallsplat') && r.m.fighters[1].state === 'wallsplat', types(r));
  // Wall combo: heavy splat, jab, jab (still pinned), then launcher blasts them off the wall.
  // Each follow-up is pressed on the first frame the attacker is free.
  var queue = [{ h: true }, { p: true }, { p: true }, LAUNCH], next = 0;
  r = play(S, D, 44, function (i, m) {
    var a = m.fighters[0];
    return a.state === 'idle' && m.hitstop === 0 && next < queue.length ? queue[next++] : {};
  }, {}, 200, nearWall);
  var kinds = r.hits.map(function (e) { return e.move.id; });
  check('wall combo hits', kinds.join() === 'heavy,jab,jab,launcher', kinds);
  check('wall combo ends in the air or down', ['juggle', 'down', 'getup', 'idle'].indexOf(r.m.fighters[1].state) >= 0, r.m.fighters[1].state);
  // Away from the wall the same heavy is a normal hit.
  r = play(S, D, 44, { 0: { h: true } }, {}, 40);
  check('heavy in midscreen does not splat', !has(r, 'wallsplat'), types(r));
})();

// A juggled fighter carried into the wall splats (once per combo).
(function () {
  var r = play(S, D, 44, {}, {}, 30, function (m) {
    var d = m.fighters[1];
    d.x = FG.C.WALL_R - 18 * D.scale - 20; m.fighters[0].x = d.x - 120;
    d.setState('juggle'); d.y = 40; d.vy = 2; d.vx = 2; d.juggleHits = 1;
  });
  check('juggle into the wall splats', has(r, 'wallsplat'), types(r));
  r = play(S, D, 44, {}, {}, 30, function (m) {
    var d = m.fighters[1];
    d.x = FG.C.WALL_R - 18 * D.scale - 20; m.fighters[0].x = d.x - 120;
    d.setState('juggle'); d.y = 40; d.vy = 2; d.vx = 2; d.wallUsed = true;
  });
  check('second wall splat in a combo is ignored', !has(r, 'wallsplat'), types(r));
})();

// Sweep knocks down; lows hit a downed opponent (once); highs and mids don't.
(function () {
  var SWEEP = { k: true, down: true, left: true };
  var r = play(S, D, 40, { 0: SWEEP }, {}, 60);
  check('sweep knocks down', r.m.fighters[1].state === 'down', r.m.fighters[1].state);
  // Low kick as a ground hit while they are down.
  r = play(S, D, 40, { 0: SWEEP, 60: { k: true, down: true } }, {}, 100);
  check('low hits downed opponent', r.hits.filter(function (e) { return e.ground; }).length === 1, r.hits.map(function (e) { return e.move.id + (e.ground ? '(G)' : ''); }));
  // Jab cannot.
  r = play(S, D, 40, { 0: SWEEP, 60: { p: true } }, {}, 100);
  check('jab misses downed opponent', r.hits.length === 1, r.hits.map(function (e) { return e.move.id; }));
})();

// Wake-up options.
(function () {
  var SWEEP = { k: true, down: true, left: true };
  function wake(p2) {
    return play(S, D, 40, { 0: SWEEP }, function (i, m) {
      var d = m.fighters[1];
      return d.state === 'down' && d.stateFrame >= FG.C.QUICK_RISE_FROM - 1 ? p2 : {};
    }, 75);
  }
  var r = wake({ k: true });
  check('wake-up low kick', r.m.fighters[1].lastMove && r.m.fighters[1].lastMove.id === 'wakeLow', r.m.fighters[1].lastMove && r.m.fighters[1].lastMove.id);
  r = wake({ p: true });
  check('wake-up mid kick', r.m.fighters[1].lastMove && r.m.fighters[1].lastMove.id === 'wakeMid');
  var x0;
  r = play(S, D, 40, { 0: SWEEP }, function (i, m) {
    var d = m.fighters[1];
    if (d.state === 'down' && d.stateFrame === 1) x0 = d.x;
    return d.state === 'down' && d.stateFrame >= FG.C.QUICK_RISE_FROM - 1 ? { right: true } : {};
  }, 100);
  check('back roll moves away', r.m.fighters[1].x - x0 > 30, r.m.fighters[1].x - x0);
  r = wake({ up: true });
  check('quick getup', ['getup', 'idle'].indexOf(r.m.fighters[1].state) >= 0, r.m.fighters[1].state);
  // Rolls are invulnerable early on.
  var f = new FG.Fighter(D, 1); f.setState('roll'); f.stateFrame = 5;
  check('roll is invulnerable', f.hurtboxes().length === 0);
})();

// Tech roll: press a button just before landing from a juggle. Sweeps can't be teched.
(function () {
  var r = play(S, D, 40, { 0: LAUNCH }, function (i, m) {
    var d = m.fighters[1];
    return d.state === 'juggle' && d.vy < 0 && d.y < 12 ? { p: true } : {};
  }, 120);
  check('tech roll', has(r, 'tech'), types(r));
  r = play(S, D, 40, { 0: { k: true, down: true, left: true } }, function (i, m) {
    var d = m.fighters[1];
    return d.state === 'juggle' && d.vy < 0 && d.y < 12 ? { p: true } : {};
  }, 80);
  check('sweep is not techable', !has(r, 'tech') && r.m.fighters[1].state === 'down', types(r));
})();

// Throws and throw breaks.
(function () {
  var THROW = { p: true, k: true };
  var r = play(S, D, 40, { 0: THROW }, {}, 80);
  check('throw grabs', has(r, 'grab'), types(r));
  check('throw damage', r.m.fighters[1].health === D.health - S.moves.throw.damage, r.m.fighters[1].health);
  check('thrown fighter is down', ['down', 'getup'].indexOf(r.m.fighters[1].state) >= 0, r.m.fighters[1].state);
  // P then K one frame apart still throws.
  r = play(S, D, 40, { 0: { p: true }, 1: { p: true, k: true } }, {}, 80);
  check('throw with 1-frame stagger', has(r, 'grab'), types(r));
  // Break with P during the window.
  function breakWith(btns, throwInput) {
    return play(S, D, 40, { 0: throwInput || THROW }, function (i, m) { return m.throwState && m.frame - m.throwState.start === 6 ? btns : {}; }, 80);
  }
  r = breakWith({ p: true });
  check('front throw broken with P', has(r, 'break') && r.m.fighters[1].health === D.health, types(r));
  r = breakWith({ k: true });
  check('front throw not broken with K', !has(r, 'break'), types(r));
  r = breakWith({ p: true, k: true });
  check('mashing both buttons does not break', !has(r, 'break'), types(r));
  // Reverse throw (back + P + K): break with K, and it swaps sides.
  var RTHROW = { p: true, k: true, left: true };
  r = breakWith({ k: true }, RTHROW);
  check('reverse throw broken with K', has(r, 'break'), types(r));
  r = play(S, D, 40, { 0: RTHROW }, {}, 80);
  check('reverse throw swaps sides', r.m.fighters[1].x < r.m.fighters[0].x, [r.m.fighters[0].x, r.m.fighters[1].x]);
  check('reverse throw damage', r.m.fighters[1].health === D.health - S.moves.throwB.damage, r.m.fighters[1].health);
  // Crouching ducks throws.
  r = play(S, D, 40, { 0: THROW }, function () { return { down: true }; }, 60);
  check('throw whiffs on crouch', !has(r, 'grab'), types(r));
  // Can't throw an opponent in blockstun.
  r = play(S, D, 40, { 0: { h: true }, 22: THROW }, function (i) { return i >= 6 ? { right: true } : {}; }, 60, null);
  var grabFrame = r.events.filter(function (e) { return e.type === 'grab'; }).length;
  check('throw does not grab during blockstun', grabFrame === 0, types(r));
  // Late break (after the window) fails.
  r = play(S, D, 40, { 0: THROW }, function (i, m) { return m.throwState && m.frame - m.throwState.start === FG.C.THROW_BREAK_WINDOW + 3 ? { p: true } : {}; }, 80);
  check('late break fails', !has(r, 'break'), types(r));
})();

// Guard pressure: repeated blocked heavies break the guard; the meter recovers.
(function () {
  var plan = function (i) { return i % 50 === 0 ? { h: true } : {}; };
  var guardHold = function (i) { return i >= 6 ? { right: true } : {}; };
  var r = play(S, D, 40, plan, guardHold, 50 * 6, function (m) {
    // Keep them in range against the wall so pushback doesn't separate them.
    var w = FG.C.WALL_R - 18 * D.scale; m.fighters[1].x = w; m.fighters[0].x = w - 40;
  });
  check('guard break happens', has(r, 'guardbreak'), types(r).filter(function (t) { return t !== 'whiff'; }));
  var gb = r.m.lastResult[0];
  var m = setup(S, D, 40);
  var d = m.fighters[1];
  d.guard = 50; d.guardDelay = 0;
  run(m, 20);
  check('guard meter recovers', d.guard < 50, d.guard);
  // Measured advantage on guard break.
  m = setup(S, D, 40);
  m.fighters[1].guard = FG.C.GUARD_MAX - 1;
  for (var i = 0; i < 140; i++) m.step([raw(i === 0 ? { h: true } : {}), raw(i >= 6 ? { right: true } : {})]);
  var res = m.lastResult[0];
  check('guard break advantage', res && res.kind === 'GUARD BREAK' && res.adv === FG.C.GUARD_BREAK_ADV, res && { kind: res.kind, adv: res.adv });
})();

// Air attacks against a standing opponent: blocked standing, and the attacker lands.
(function () {
  var r = play(S, D, 70, { 0: { up: true, right: true }, 14: { k: true } }, function (i) { return i >= 2 ? { right: true } : {}; }, 80);
  check('jump-in kick is blocked standing', has(r, 'block'), types(r));
  check('air attacker lands', r.m.fighters[0].y === 0 && r.m.fighters[0].state !== 'air', r.m.fighters[0].state);
})();

// =========================== Phase 3 =========================================

// Run P1's plan against the training dummy with the given settings (option ids).
function vsDummy(settings, plan1, frames, setupFn) {
  var dm = new FG.Dummy();
  for (var key in settings) {
    var opts = FG.Dummy.OPTIONS[key];
    for (var i = 0; i < opts.length; i++) if (opts[i].id === settings[key]) dm.settings[key] = i;
  }
  return play(S, D, 40, plan1, function (i, m) { return dm.input(m.fighters[1], m.fighters[0], m); }, frames, setupFn);
}
function count(r, type, attacker) {
  return r.events.filter(function (e) { return e.type === type && (attacker == null || e.attacker === attacker); }).length;
}

(function () {
  // BLOCK ALL reads the attack: mids and highs standing, lows crouching, without walking away.
  [['jab', { p: true }], ['mid', { k: true }], ['low', { k: true, down: true }], ['heavy', { h: true }], ['sweep', { k: true, down: true, left: true }]].forEach(function (t) {
    var x0;
    var r = vsDummy({ stance: 'block' }, { 0: t[1] }, 60, function (m) { x0 = m.fighters[1].x; });
    check('dummy BLOCK ALL blocks ' + t[0], count(r, 'block') === 1 && count(r, 'hit') === 0, types(r));
  });
  var x1;
  var r = vsDummy({ stance: 'block' }, { 0: { k: true } }, 14, function (m) { x1 = m.fighters[1].x; });
  check('dummy guards in place', Math.abs(r.m.fighters[1].x - x1) < 0.5, r.m.fighters[1].x - x1);
  // STAND gets hit; CROUCH ducks a jab.
  r = vsDummy({ stance: 'stand' }, { 0: { p: true } }, 40);
  check('dummy STAND gets hit', count(r, 'hit') === 1, types(r));
  r = vsDummy({ stance: 'crouch' }, { 0: { p: true } }, 40);
  check('dummy CROUCH ducks highs', count(r, 'hit') === 0 && count(r, 'block') === 0, types(r));
  // STAND GUARD loses to lows; CROUCH GUARD loses to mids.
  r = vsDummy({ stance: 'sguard' }, { 0: { k: true, down: true } }, 40);
  check('dummy STAND GUARD hit by low', count(r, 'hit') === 1, types(r));
  r = vsDummy({ stance: 'cguard' }, { 0: { k: true } }, 40);
  check('dummy CROUCH GUARD hit by mid', count(r, 'hit') === 1, types(r));
  // RANDOM: a mix of hits and blocks over many jabs.
  var hits = 0, blocks = 0;
  for (var n = 0; n < 40; n++) {
    r = vsDummy({ stance: 'random' }, { 0: { k: true } }, 40);
    hits += count(r, 'hit'); blocks += count(r, 'block');
  }
  check('dummy RANDOM mixes hits and blocks', hits > 5 && blocks > 5, { hits: hits, blocks: blocks });
  // Actions.
  r = vsDummy({ stance: 'stand', action: 'jab' }, {}, 80);
  check('dummy action JAB', r.events.some(function (e) { return e.type === 'whiff' && e.fighter === 1 && e.move.id === 'jab'; }), types(r));
  r = vsDummy({ stance: 'stand', action: 'throw' }, {}, 120);
  check('dummy action THROW', count(r, 'grab', 1) === 1, types(r));
  // Throw breaks.
  r = vsDummy({ breaks: 'on' }, { 0: { p: true, k: true } }, 60);
  check('dummy breaks front throw', count(r, 'break') === 1, types(r));
  r = vsDummy({ breaks: 'on' }, { 0: { p: true, k: true, left: true } }, 60);
  check('dummy breaks reverse throw', count(r, 'break') === 1, types(r));
  r = vsDummy({ breaks: 'off' }, { 0: { p: true, k: true } }, 60);
  check('dummy without breaks gets thrown', count(r, 'break') === 0 && count(r, 'grab') === 1, types(r));
  // Knockdown recovery.
  r = vsDummy({ recovery: 'tech' }, { 0: LAUNCH }, 120);
  check('dummy techs', count(r, 'tech') === 1, types(r));
  r = vsDummy({ recovery: 'none' }, { 0: LAUNCH }, 120);
  var landed = r.events.some(function (e) { return e.type === 'land' && e.fighter === 1; });
  check('dummy stays down (no tech)', count(r, 'tech') === 0 && landed, types(r));
})();

// Input history: rows per change, frame counts, directions relative to facing.
(function () {
  var h = new FG.InputHistory();
  for (var i = 0; i < 5; i++) h.record(raw({ right: true }), 1);
  for (i = 0; i < 3; i++) h.record(raw({ right: true, down: true, k: true }), 1);
  h.record(raw({}), 1);
  check('input history rows', h.rows.length === 3 && h.rows[2].dir === 6 && h.rows[2].frames === 5 &&
    h.rows[1].dir === 3 && h.rows[1].btns === 'K' && h.rows[1].frames === 3 && h.rows[0].dir === 5, h.rows);
  check('direction is relative to facing', FG.InputHistory.direction(raw({ left: true }), -1) === 6 &&
    FG.InputHistory.direction(raw({ left: true, up: true }), 1) === 7, null);
  check('throw shows both buttons', FG.InputHistory.buttons(raw({ p: true, k: true })) === 'P+K');
})();

// Reset positions: center, or with player 2 against either wall.
(function () {
  var m = new FG.Match(S, D);
  m.reset('left');
  var a = m.fighters[0], d = m.fighters[1];
  check('reset left wall', d.x < a.x && d.x - FG.C.WALL_L < 60 && d.facing === 1 && a.facing === -1, [a.x, d.x]);
  m.reset('right');
  check('reset right wall', d.x > a.x && FG.C.WALL_R - d.x < 60, [a.x, d.x]);
  m.reset('center');
  check('reset center', Math.abs((a.x + d.x) / 2 - FG.C.WORLD_W / 2) < 1, [a.x, d.x]);
  m.reset('left'); a.health = 10;
  for (var i = 0; i < 3; i++) m.step([raw({}), raw({})]);
  m.koTimer = 1; m.step([raw({}), raw({})]);
  check('round reset keeps the chosen start position', d.x < a.x && a.health === S.health, [a.x, d.x]);
})();

console.log(passes + ' passed, ' + failures + ' failed');
process.exit(failures ? 1 : 0);
