// Headless engine tests: load the simulation scripts (no Phaser) and check
// that measured frame advantage matches the declared frame data, plus core rules.
// Run with: node tests/sim.test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
// Seeded Math.random, so runs are repeatable (the dummy and smack talk pick at random).
var seededMath = Object.create(Math);
seededMath.random = (function (a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
})(20261008);
var ctx = { console: console, Math: seededMath };
ctx.window = ctx; vm.createContext(ctx);
// Load the same simulation and data scripts the game loads, in index.html order
// (everything except Phaser, rendering and scenes; inputDisplay has the pure input history).
var html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
var re = /<script src="(src\/(?:fg\.js|engine\/[^"]+|data\/[^"]+|render\/inputDisplay\.js))"><\/script>/g, mt;
while ((mt = re.exec(html))) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', mt[1]), 'utf8'), ctx, { filename: mt[1] });
}
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

// Inputs for each standard move id. P1 faces right, so forward is right.
var INPUT = {
  jab: { p: true }, mid: { k: true }, low: { k: true, down: true }, sweep: { k: true, down: true, left: true },
  dfK: { k: true, down: true, right: true }, fK: { k: true, right: true }, bK: { k: true, left: true },
  fP: { p: true, right: true }, bP: { p: true, left: true }, heavy: { h: true }, fH: { h: true, right: true },
  bH: { h: true, left: true }, launcher: { h: true, down: true }
};
// Moves measured by the generic frame data check: plain strikes with an input above.
function measurable(m) {
  return INPUT[m.id] && m.box && !m.feint && !m.stanceSwitch && !m.parry && !m.charge && !m.throw && !m.air;
}

var defs = FG.ROSTER;
defs.forEach(function (atk) {
  defs.forEach(function (dfn) {
    var tag = atk.name + ' vs ' + dfn.name;
    // Single moves: measure on block and hit at close range.
    Object.keys(atk.moves).forEach(function (id) {
      var mv = atk.moves[id];
      if (!measurable(mv)) return;
      var press = INPUT[id], dist = 40;
      // P2 faces left, so holding right is back.
      var guardRaw = mv.level === 'low' ? { right: true, down: true } : { right: true };
      var r = exchange(atk, dfn, dist, [press], guardRaw);
      var blk = r.events.filter(function (e) { return e.type === 'block'; });
      check(tag + ' ' + id + ' is blocked', blk.length === 1, r.events.map(function (e) { return e.type; }));
      check(tag + ' ' + id + ' block adv', r.m.lastResult[0] && r.m.lastResult[0].adv === mv.block,
        { got: r.m.lastResult[0] && r.m.lastResult[0].adv, want: mv.block });
      r = exchange(atk, dfn, dist, [press], {});
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

// Every fighter has the full kit.
defs.forEach(function (d) {
  ['jab', 'mid', 'low', 'sweep', 'heavy', 'launcher', 'throw', 'throwB', 'airP', 'airK', 'airH', 'wakeLow', 'wakeMid'].forEach(function (id) {
    check(d.name + ' has ' + id, !!d.moves[id]);
  });
  check(d.name + ' has victory lines', d.victoryLines && d.victoryLines.length >= 3);
  check(d.name + ' has smack talk', d.talk && d.talk.lines.length >= 3 && d.talk.quips.length >= 3);
  check(d.name + ' has a taunt', d.moves.taunt && d.moves.taunt.taunt);
  check(d.name + ' has intro, victory and defeat animations', d.intro && d.victory && d.defeat);
  check(d.name + ' has a stance', !!d.poses.idle);
  // Every pose a move, intro or victory uses exists.
  var anims = [d.intro, d.victory, d.defeat];
  Object.keys(d.moves).forEach(function (id) { anims.push(d.moves[id].anim); });
  Object.keys(d.gestures || {}).forEach(function (id) { anims.push(d.gestures[id]); });
  anims.forEach(function (a) {
    (a || []).forEach(function (k) { check(d.name + ' pose ' + k[1] + ' exists', !!(d.poses[k[1]] || FG.POSES[k[1]])); });
  });
});

// Hit level rules ------------------------------------------------------------
var S = FG.fighterById('brinkhus'), D = FG.fighterById('dalsass');
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
  // BRINKHUS's low kick tracks.
  m = setup(D, S, 44); evs = [];
  for (i = 0; i < 60; i++) {
    m.step([raw(i === 0 ? { ssIn: true } : {}), raw(i === 2 ? { k: true, down: true } : {})]);
    evs = evs.concat(m.events);
  }
  check('tracking low catches sidestep', evs.some(function (e) { return e.type === 'hit'; }), evs.map(function (e) { return e.type; }));
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

// Every fighter's documented combo routes connect exactly as listed, against every opponent.
// Timed routes press each input on its frame; queued routes press the next input
// on the first frame the attacker is free. Wall routes start next to the wall.
// Optional route fields: dist (start distance), hold ([[from, to, 'B'], ...] held inputs),
// oppPlan (the opponent's inputs, for routes that start from their attack).
function runCombo(atk, combo, dfn) {
  return FG.runCombo(atk, dfn, combo).hits;
}
defs.forEach(function (d) {
  check(d.name + ' has combo routes', d.combos.length >= 3, d.combos.length);
  // Routes must work against every opponent (fighters differ in size).
  d.combos.forEach(function (c) {
    defs.forEach(function (opp) {
      var r = FG.runCombo(d, opp, c), hits = r.hits;
      check(d.name + ' combo ' + c.name + ' vs ' + opp.name, hits.join() === c.hits.join(), { got: hits, want: c.hits });
      // A true combo: every hit lands before the opponent is free again.
      check(d.name + ' combo ' + c.name + ' is a true combo vs ' + opp.name, r.trueCombo, r.counts);
    });
  });
});

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

// Run a scripted exchange. plans: { frame: rawInput } for P1 and P2, on game frames
// (hitstop doesn't count, like FG.runCombo), or functions of (step, match).
function play(atk, dfn, dist, plan1, plan2, frames, setupFn) {
  var m = setup(atk, dfn, dist), evs = [];
  if (setupFn) setupFn(m);
  var f0 = m.frame, fired1 = {}, fired2 = {};
  function at(plan, fired, i) {
    if (typeof plan === 'function') return plan(i, m);
    var t = m.frame - f0;
    if (!plan[t] || fired[t]) return {};
    fired[t] = true;
    return plan[t];
  }
  for (var i = 0; i < frames; i++) {
    var r1 = raw(at(plan1, fired1, i));
    var r2 = raw(at(plan2, fired2, i));
    m.step([r1, r2]);
    evs = evs.concat(m.events);
  }
  return { m: m, events: evs, hits: evs.filter(function (e) { return e.type === 'hit' && e.attacker === 0; }) };
}
function types(r) { return r.events.map(function (e) { return e.type; }); }
function has(r, type) { return r.events.some(function (e) { return e.type === type; }); }
var LAUNCH = { h: true, down: true };

// Air combos are skill-based: drop the jump cancel or a timing and the route fails.
(function () {
  var route = S.combos.filter(function (c) { return c.name === 'POINT-SLOPE SPIKE'; })[0];
  function toRaw(plan) { var o = {}; for (var f in plan) o[f] = FG.parseInput(plan[f]); return o; }
  var noJump = {}; for (var f in route.plan) if (route.plan[f] !== 'UP') noJump[f] = route.plan[f];
  var r = play(S, D, 40, toRaw(noJump), {}, 200);
  check('no jump cancel, no air combo', r.hits.length <= 2, r.hits.map(function (e) { return e.move.id; }));
  var late = { 0: 'D+H', 16: 'UP', 66: 'P' };
  r = play(S, D, 40, toRaw(late), {}, 200);
  check('late air punch drops the combo', r.hits.length === 1, r.hits.map(function (e) { return e.move.id; }));
  r = play(S, D, 40, { 0: LAUNCH, 16: { up: true } }, function (i) { return i >= 6 ? { right: true } : {}; }, 60);
  check('no jump cancel on block', r.m.fighters[0].y === 0 && r.m.fighters[0].state !== 'air', r.m.fighters[0].state);
})();

// One bound per combo: a second bound move just juggles.
(function () {
  var plan = {};
  var route = S.combos.filter(function (c) { return c.name === 'POINT-SLOPE SPIKE'; })[0].plan;
  Object.keys(route).forEach(function (f) { if (+f < 100) plan[f] = FG.parseInput(route[f]); });
  var r = play(S, D, 40, plan, {}, 110, null);
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
  r = play(S, D, 40, { 0: SWEEP, 48: { k: true, down: true } }, {}, 100);
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
  // Step back into range before each heavy (pushback moves the attacker away from the wall).
  var plan = function (i, m) {
    if (i % 50 !== 0) return {};
    m.fighters[0].x = m.fighters[1].x - 40;
    return { h: true };
  };
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
  var r = play(S, D, 70, { 0: { up: true, right: true }, 16: { k: true } }, function (i) { return i >= 2 ? { right: true } : {}; }, 80);
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

// =========================== Phase 4 =========================================

// DALSASS: Similar Triangles stance, Proof by Contradiction (feint), Supplementary Slide.
(function () {
  function ids(r, who) { return r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === (who || 0); }).map(function (e) { return e.move.id; }); }
  // B+P enters the stance; P from the stance is Step Function and leaves the stance.
  var r = play(D, S, 40, { 0: FG.parseInput('B+P'), 20: { p: true } }, {}, 60);
  check('piecewise stance move', ids(r).join() === 'bP,pwP', ids(r));
  check('stance attack leaves the stance', r.m.fighters[0].stance === 'A', r.m.fighters[0].stance);
  r = play(D, S, 40, { 0: FG.parseInput('B+P') }, {}, 20);
  check('in piecewise stance', r.m.fighters[0].stance === 'B', r.m.fighters[0].stance);
  r = play(D, S, 40, { 0: FG.parseInput('B+P'), 20: { right: true } }, {}, 24);
  check('moving leaves the stance', r.m.fighters[0].stance === 'A', r.m.fighters[0].stance);
  r = play(D, S, 40, { 0: FG.parseInput('B+P'), 20: { k: true } }, {}, 60);
  check('stance K is a low', ids(r).join() === 'bP,pwK' && D.moves.pwK.level === 'low', ids(r));
  // Getting hit knocks him out of the stance.
  r = play(D, S, 40, { 0: FG.parseInput('B+P') }, { 14: { p: true } }, 40);
  check('hit leaves the stance', r.m.fighters[0].stance === 'A', r.m.fighters[0].stance);

  // The feint alone never hits.
  r = play(D, S, 40, { 0: FG.parseInput('F+H') }, {}, 40);
  check('feint does not hit', count(r, 'hit') === 0 && count(r, 'block') === 0, types(r));
  // Feint cancels: jab, low, real overhead, throw. Hits out of a feint are flagged.
  [['P', 'jab'], ['K', 'low'], ['H', 'drop']].forEach(function (t) {
    var q = play(D, S, 40, { 0: FG.parseInput('F+H'), 10: FG.parseInput(t[0]) }, {}, 70);
    var hit = q.events.filter(function (e) { return e.type === 'hit' && e.attacker === 0; })[0];
    check('feint cancels into ' + t[1], hit && hit.move.id === t[1] && hit.feint === true, hit && hit.move.id);
  });
  r = play(D, S, 40, { 0: FG.parseInput('F+H'), 10: FG.parseInput('P+K') }, {}, 70);
  var grab = r.events.filter(function (e) { return e.type === 'grab'; })[0];
  check('feint cancels into throw', grab && grab.feint === true, types(r));
  // Too late to cancel once the window closes.
  r = play(D, S, 40, { 0: FG.parseInput('F+H'), 21: { p: true } }, {}, 60);
  check('feint cancel window closes', ids(r).join() === 'fH,jab' && count(r, 'hit') === 1, ids(r));
  // The feint's real overhead bounds a juggled opponent.
  check('inverse drop bounds', D.moves.drop.bound === true);

  // Supplementary Slide travels and goes under highs.
  var x0;
  r = play(D, S, 160, { 0: FG.parseInput('D/F+K') }, {}, 30, function (m) { x0 = m.fighters[0].x; });
  check('slide travels', r.m.fighters[0].x - x0 > 40, r.m.fighters[0].x - x0);
  r = play(D, S, 40, { 4: FG.parseInput('D/F+K') }, { 0: { p: true } }, 40);
  check('slide ducks a jab', count(r, 'hit', 1) === 0, types(r));
})();

// BRINKHUS: the Distributive Property string only continues when the jab connects (out of range it stops).
(function () {
  var plan = { 0: { p: true }, 14: { k: true }, 32: { k: true } };
  var r = play(S, D, 120, plan, {}, 80);
  var ids = r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).map(function (e) { return e.move.id; });
  check('Distribute needs the jab to connect', ids.indexOf('eps') < 0 && ids.indexOf('delta') < 0, ids);
})();

// CHAI: Reflection Counter (parry) and Tangent Step (sidestep attack).
(function () {
  var CH = FG.fighterById('chai');
  // P2 jabs; CHAI parries so the jab arrives inside frames 2-10 of the parry.
  var r = play(CH, S, 40, { 4: FG.parseInput('B+H') }, { 0: { p: true } }, 60);
  var hits = r.events.filter(function (e) { return e.type === 'hit'; });
  check('parry catches a high', count(r, 'parry') === 1, types(r));
  check('parry counters at once', hits.length === 1 && hits[0].attacker === 0 && hits[0].move.id === 'reflect', hits.map(function (e) { return e.move.id; }));
  // Mids too.
  r = play(CH, S, 40, { 8: FG.parseInput('B+H') }, { 0: { k: true } }, 60);
  check('parry catches a mid', count(r, 'parry') === 1, types(r));
  // Lows go through and counter-hit the parry.
  r = play(CH, S, 40, { 10: FG.parseInput('B+H') }, { 0: { k: true, down: true } }, 60);
  hits = r.events.filter(function (e) { return e.type === 'hit'; });
  check('lows beat the parry', count(r, 'parry') === 0 && hits.length === 1 && hits[0].attacker === 1 && hits[0].ch, hits.map(function (e) { return e.move.id; }));
  // A whiffed parry is punishable.
  r = play(CH, S, 40, { 0: FG.parseInput('B+H') }, { 14: { p: true } }, 60);
  hits = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 1; });
  check('whiffed parry gets punished', hits.length === 1, types(r));
  // Throws beat the parry.
  r = play(CH, S, 40, { 4: FG.parseInput('B+H') }, { 0: FG.parseInput('P+K') }, 60);
  check('throw beats the parry', count(r, 'grab', 1) === 1 && count(r, 'parry') === 0, types(r));

  // Tangent Step: sidestep a jab, then P comes out early and hits.
  r = play(CH, S, 40, { 0: { ssIn: true }, 6: { p: true } }, { 2: { p: true } }, 60);
  hits = r.events.filter(function (e) { return e.type === 'hit'; });
  check('tangent step dodges and hits', hits.length === 1 && hits[0].attacker === 0 && hits[0].move.id === 'ssP', hits.map(function (e) { return e.attacker + e.move.id; }));
  // Other fighters can't attack that early out of a sidestep.
  r = play(S, D, 40, { 0: { ssIn: true }, 4: { p: true } }, {}, 40);
  var started = r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).length;
  check('early sidestep attack is CHAI only', started === 0, types(r));
})();

// LEE: the Arithmetic Sequence speeds up, and Recursive Rush repeats at most three times.
(function () {
  var L = FG.fighterById('lee');
  var st = ['jab', 'seq2', 'seq3', 'seqP'].map(function (id) { return L.moves[id].startup; });
  check('arithmetic sequence gets faster', st[0] > st[1] && st[1] > st[2] && st[2] > st[3], st);
  var r = play(L, S, 40, { 0: FG.parseInput('F+P'), 15: { p: true }, 33: { p: true }, 51: { p: true } }, {}, 120);
  var rushes = r.events.filter(function (e) { return e.type === 'hit' && e.move.id === 'fP'; }).length;
  check('recursive rush stops at three', rushes === 3, rushes);
  // On block it doesn't repeat.
  r = play(L, S, 40, { 0: FG.parseInput('F+P'), 15: { p: true } }, function (i) { return i >= 3 ? { right: true } : {}; }, 60);
  var ids = r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).map(function (e) { return e.move.id; });
  check('recursive rush only repeats on hit', ids.join() === 'fP,jab' || ids.join() === 'fP', ids);
})();

// LOPEZ: Asymptote Backdash, Mean Value Punish, Derivative Read (parry).
(function () {
  var LZ = FG.fighterById('lopez');
  // His backdash goes further than BRINKHUS's.
  function backdashDist(def) {
    var x0, r = play(def, D, 200, { 0: { left: true }, 2: { left: true } }, {}, 30, function (m) { x0 = m.fighters[0].x; });
    return x0 - r.m.fighters[0].x;
  }
  check('standard deviation goes further', backdashDist(LZ) > backdashDist(S) + 15, [backdashDist(LZ), backdashDist(S)]);
  // Lows can't touch it early on; a normal backdash gets hit.
  var r = play(LZ, S, 40, { 0: { left: true }, 2: { left: true } }, { 0: { k: true, down: true } }, 30);
  check('standard deviation evades a low', count(r, 'hit', 1) === 0, types(r));
  // Mean Value Punish only right after blocking.
  r = play(LZ, S, 40, { 25: { p: true } }, { 0: { p: true } }, 60, null);
  var plan = { 25: { p: true } };
  r = play(LZ, S, 40, function (i) { return i <= 14 ? { left: true } : plan[i] || {}; }, { 0: { p: true } }, 60);
  var ids = r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).map(function (e) { return e.move.id; });
  check('confidence interval after block', ids.join() === 'postBlockP', ids);
  r = play(LZ, S, 40, { 0: { p: true } }, {}, 30);
  ids = r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).map(function (e) { return e.move.id; });
  check('plain jab otherwise', ids.join() === 'jab', ids);
  // Derivative Read parries mids and lows but not highs.
  r = play(LZ, S, 40, { 6: FG.parseInput('B+H') }, { 0: { k: true, down: true } }, 60);
  check('null hypothesis parries a low', count(r, 'parry') === 1, types(r));
  r = play(LZ, S, 40, { 4: FG.parseInput('B+H') }, { 0: { p: true } }, 60);
  check('null hypothesis loses to a high', count(r, 'parry') === 0 && count(r, 'hit', 1) === 1, types(r));
})();

// MIYASHIRO: Calculated bonus after the opponent whiffs; Range Check out of a dash; Domain Control range.
(function () {
  var MY = FG.fighterById('miyashiro');
  var route = MY.combos.filter(function (c) { return c.name === 'CALCULATED RUSH'; })[0];
  var res = FG.runCombo(MY, S, route);
  check('calculated: whiff, then a bonus hit', res.hits.join() === 'dashP' && res.damage === Math.round(MY.moves.dashP.damage * FG.C.CALCULATED_BONUS), res);
  // Without the whiff there's no bonus.
  var plain = Object.assign({}, route, { oppPlan: null });
  res = FG.runCombo(MY, S, plain);
  check('no whiff, no bonus', res.damage === MY.moves.dashP.damage, res);
  // Domain Control outranges every other fighter's mid.
  var reach = MY.moves.fK.box.x + MY.moves.fK.box.w;
  var others = FG.ROSTER.filter(function (d) { return d !== MY; }).map(function (d) { return d.moves.mid.box.x + d.moves.mid.box.w; });
  check('dot product is the longest mid', others.every(function (o) { return reach > o; }), [reach, others]);
  // Vertex Kick tracks a sidestep.
  var r = play(MY, S, 44, { 0: FG.parseInput('B+K') }, { 2: { ssIn: true } }, 40);
  check('unit circle tracks', count(r, 'hit') === 1, types(r));
})();

// PEDERSEN: Order of Magnitude charges; a full charge breaks the guard.
(function () {
  var PD = FG.fighterById('pedersen');
  // The guarding opponent is against the wall so holding back can't walk out of range.
  function charge(holdFrames, guard) {
    return play(PD, S, 40, function (i) { return i === 0 ? FG.parseInput('B+H') : i <= holdFrames ? { h: true } : {}; },
      function (i) { return guard && i >= 3 ? { right: true } : {}; }, 120, function (m) {
        var w = FG.C.WALL_R - 18 * S.scale; m.fighters[1].x = w; m.fighters[0].x = w - 40;
      });
  }
  var tap = charge(0, false), half = charge(32, false), full = charge(60, false);
  function dmg(r) { var h = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 0; })[0]; return h ? h.damage : 0; }
  check('charge does more damage', dmg(tap) < dmg(half) && dmg(half) < dmg(full), [dmg(tap), dmg(half), dmg(full)]);
  check('full charge is over double damage', dmg(full) >= 2 * dmg(tap), [dmg(tap), dmg(full)]);
  var blocked = charge(60, true);
  check('full charge breaks the guard', count(blocked, 'guardbreak') === 1, types(blocked));
  var tapBlocked = charge(0, true);
  check('a tap is just blocked', count(tapBlocked, 'block') === 1 && count(tapBlocked, 'guardbreak') === 0, types(tapBlocked));
})();

// RAMOS: Matrix Lock's short break window; Identity can't be broken and grabs crouchers.
(function () {
  var RM = FG.fighterById('ramos');
  function breakAt(frameAfterGrab, throwInput) {
    return play(RM, S, 40, { 0: FG.parseInput(throwInput) }, function (i, m) {
      return m.throwState && m.frame - m.throwState.start === frameAfterGrab ? { p: true } : {};
    }, 80);
  }
  check('matrix lock breaks early', count(breakAt(6, 'P+K'), 'break') === 1);
  check('matrix lock window is short', count(breakAt(11, 'P+K'), 'break') === 0);
  check('other throws still break at 11', count(play(S, D, 40, { 0: FG.parseInput('P+K') }, function (i, m) {
    return m.throwState && m.frame - m.throwState.start === 11 ? { p: true } : {};
  }, 80), 'break') === 1);
  // Identity: unbreakable, grabs a crouching opponent.
  var r = play(RM, S, 40, { 0: FG.parseInput('F+P+K') }, function (i, m) {
    return m.throwState && m.frame - m.throwState.start === 4 ? { p: true, down: true } : { down: true };
  }, 90);
  check('identity grabs a crouching opponent', count(r, 'grab') === 1, types(r));
  check('identity cannot be broken', count(r, 'break') === 0 && r.m.fighters[1].health === S.health - RM.moves.cmdGrab.damage, r.m.fighters[1].health);
  // A normal throw whiffs on crouchers.
  r = play(RM, S, 40, { 0: FG.parseInput('P+K') }, function () { return { down: true }; }, 60);
  check('matrix lock whiffs on crouch', count(r, 'grab') === 0, types(r));
  // His dash covers the most ground.
  function dashDist(def) { var x0, q = play(def, D, 300, { 0: { right: true }, 2: { right: true } }, {}, 20, function (m) { x0 = m.fighters[0].x; }); return q.m.fighters[0].x - x0; }
  var others = FG.ROSTER.filter(function (d) { return d !== RM; }).map(dashDist);
  check('ramos has the fastest dash', others.every(function (o) { return dashDist(RM) > o; }), [dashDist(RM), others]);
})();

// PEDERSEN is the cover fighter: first on the roster.
check('pedersen is first on character select', FG.ROSTER[0].id === 'pedersen', FG.ROSTER.map(function (d) { return d.id; }));
check('all eight fighters', FG.ROSTER.length === 8, FG.ROSTER.length);

// =========================== Smack talk ======================================

// Taunt: about a second, and counter-hittable the whole time.
(function () {
  var r = play(S, D, 40, { 0: { t: true } }, {}, 70);
  var tauntLen = S.moves.taunt.total;
  check('taunt lasts about a second', tauntLen >= 55 && tauntLen <= 65, tauntLen);
  check('taunt starts', r.events.some(function (e) { return e.type === 'whiff' && e.move.taunt; }), types(r));
  // Hit during the taunt: counter hit.
  r = play(S, D, 40, { 0: { t: true } }, { 30: { p: true } }, 70);
  var hit = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 1; })[0];
  check('taunt leaves you open (counter hit)', hit && hit.ch, hit);
})();

// Pre-round lines: rivalries (either side, first-listed speaks first), PEDERSEN, everyone else.
(function () {
  function by(id) { return FG.fighterById(id); }
  function texts(a, b) { return FG.preRoundLines(by(a), by(b), function () { return 0; }); }
  FG.RIVALRIES.forEach(function (rv) {
    [[rv.a, rv.b], [rv.b, rv.a]].forEach(function (pair) {
      var lines = texts(pair[0], pair[1]).filter(function (l) { return l.text !== by(pair[0]).talk.introLine && l.text !== by(pair[1]).talk.introLine; });
      var who = lines.map(function (l) { return (l.speaker === 0 ? pair[0] : pair[1]); });
      check('rivalry ' + pair.join(' vs '), lines.length === 2 && who[0] === rv.a && who[1] === rv.b && lines[0].text === rv.lines[0][1], lines);
    });
  });
  var pb = texts('pedersen', 'brinkhus');
  check('pedersen says his signature line first', pb[0].speaker === 0 && /horse to water/.test(pb[0].text), pb);
  check('pedersen vs anyone else', pb[1].speaker === 0 && pb[1].text === "You're not Vicky, but you'll do." && pb[2].speaker === 1, pb);
  var bp = texts('brinkhus', 'pedersen');
  check('pedersen line from either side', bp[0].speaker === 1 && bp[1].speaker === 1 && bp[2].speaker === 0, bp);
  var rp = texts('ramos', 'pedersen').map(function (l) { return l.text; });
  check('ramos vs pedersen uses the rivalry', rp.indexOf("When's the last time you did cardio?") >= 0 && rp.indexOf("You're not Vicky, but you'll do.") < 0, rp);
  var gen = texts('lee', 'dalsass');
  check('everyone else trades their own lines', gen.length === 2 && gen[0].speaker === 0 && by('lee').talk.lines.indexOf(gen[0].text) >= 0 &&
    by('dalsass').talk.lines.indexOf(gen[1].text) >= 0, gen);
  check('pedersen victory lines include the new ones', by('pedersen').victoryLines.indexOf('Even Vicky lasted longer than that.') >= 0 &&
    by('pedersen').victoryLines.some(function (l) { return /horse to water/.test(l); }));
  check('ramos new victory line', by('ramos').victoryLines.indexOf('Cardio wins again.') >= 0 &&
    by('ramos').victoryLines.every(function (l) { return !/loser/.test(l); }));
})();

// RAMOS: cardio. Dashes chain back to back, and his guard meter recovers twice as fast.
(function () {
  var RM = FG.fighterById('ramos');
  function dist(def, plan) { var x0, r = play(def, D, 400, plan, {}, 26, function (m) { x0 = m.fighters[0].x; }); return r.m.fighters[0].x - x0; }
  var chain = { 0: { right: true }, 2: { right: true }, 8: { right: true }, 10: { right: true } };
  check('ramos chains dashes', dist(RM, chain) > dist(RM, { 0: { right: true }, 2: { right: true } }) + 25, [dist(RM, chain)]);
  check('others cannot chain dashes', dist(S, chain) < dist(S, { 0: { right: true }, 2: { right: true } }) + 10, [dist(S, chain)]);
  function regen(def) { var m = setup(def, D, 200); m.fighters[0].guard = 60; run(m, 30); return 60 - m.fighters[0].guard; }
  check('ramos guard recovers twice as fast', Math.abs(regen(RM) - 2 * regen(S)) < 0.01, [regen(RM), regen(S)]);
})();

// =========================== Combo feel ======================================

// Hit feel: hitstop scales with strength; combo finishers and launchers hang longest;
// every hit carries its number in the combo (sound pitch and spark size use it).
(function () {
  function stopOf(def, input, dist) {
    var m = setup(def, D, dist || 40), stop = 0;
    for (var i = 0; i < 40; i++) {
      m.step([raw(i === 0 ? input : {}), raw({})]);
      if (m.events.some(function (e) { return e.type === 'hit'; })) { stop = m.hitstop; break; }
    }
    return stop;
  }
  defs.forEach(function (d) {
    var jab = stopOf(d, { p: true }), heavy = stopOf(d, { h: true }), launch = stopOf(d, LAUNCH);
    check(d.name + ' hitstop: jab < heavy < launcher', jab > 0 && jab < heavy && heavy < launch, [jab, heavy, launch]);
    check(d.name + ' jab hitstop is tiny', jab <= 5, jab);
  });
  // A sweep (knockdown) is a finisher.
  check('finisher hitstop', stopOf(S, { k: true, down: true, left: true }) >= FG.C.HITSTOP_FINISHER, stopOf(S, { k: true, down: true, left: true }));
  var m = setup(S, D, 40), seen = [];
  var plan = S.combos[0].plan, f0 = m.frame, fired = {};
  for (var i = 0; i < 120; i++) {
    var t = m.frame - f0, in1 = {};
    if (plan[t] && !fired[t]) { in1 = FG.parseInput(plan[t]); fired[t] = true; }
    m.step([raw(in1), raw({})]);
    m.events.forEach(function (e) { if (e.type === 'hit') seen.push(e.hits); });
  }
  check('combo hits are numbered', seen.join() === '1,2,3', seen);
})();

// Juggle physics: launchers throw them up on a snappy arc; air hits pop them by a
// fixed amount per strength; gravity grows with the combo so juggles end; bounds
// slam them into the floor and they bounce back up.
(function () {
  defs.forEach(function (d) {
    var r = play(d, D, 40, { 0: LAUNCH }, {}, 140), opp = r.m.fighters[1];
    var m = setup(d, D, 40), apexT = null, top = 0, landT = null, launchedT = null;
    var f0 = m.frame;
    for (var i = 0; i < 200; i++) {
      m.step([raw(i === 0 ? LAUNCH : {}), raw({})]);
      var o = m.fighters[1];
      if (launchedT === null && o.state === 'juggle') launchedT = m.frame;
      if (launchedT !== null && o.y > top) { top = o.y; apexT = m.frame; }
      if (launchedT !== null && landT === null && o.state === 'down') landT = m.frame;
    }
    check(d.name + ' launch is high and snappy', top >= 85 && apexT - launchedT <= 26 && landT - launchedT <= 52, [top, apexT - launchedT, landT - launchedT]);
  });
  check('juggle gravity grows with the combo', FG.juggleGravity(1) < FG.juggleGravity(4) && FG.juggleGravity(4) < FG.juggleGravity(10), [FG.juggleGravity(1), FG.juggleGravity(10)]);
  check('juggle gravity is capped', FG.juggleGravity(100) === FG.C.JUGGLE_GRAVITY * FG.C.JUGGLE_GRAVITY_MAX);
  // The same air hit pops the same amount, whoever you are.
  var pops = defs.map(function (d) {
    var m = setup(S, d, 40);
    var o = m.fighters[1]; o.setState('juggle'); o.y = 60; o.vy = -2; o.juggleHits = 1;
    m.juggleHit({ a: 0, d: 1 }, m.fighters[0], o, S.moves.jab, {});
    return Math.round(o.vy * 100) / 100;
  });
  check('air hit pops are consistent', pops.every(function (v) { return v === pops[0]; }) && pops[0] > 2, pops);
  // Bound: an air H slams them down; they bounce back up.
  var route = S.combos.filter(function (c) { return c.difficulty === 'hard'; })[0];
  var res = FG.runCombo(S, D, route), bounce = false;
  var m2 = res.match;
  check('hard route bounds', route.hits.indexOf('airH') >= 0 && res.hits.join() === route.hits.join());
  var b = play(S, D, 40, (function () { var o = {}; for (var k in route.plan) if (+k <= 51) o[k] = FG.parseInput(route.plan[k]); return o; })(), {}, 140);
  check('bound bounces them back up', has(b, 'bounce'), types(b));
  // Juggles end on their own: launch, then jab as fast as possible.
  defs.forEach(function (d) {
    var r = play(d, D, 40, function (i) { return i === 0 ? LAUNCH : (i > 30 && i % 2 ? { p: true } : {}); }, {}, 400);
    check(d.name + ' mashed juggle ends', r.hits.length <= 8 && r.m.fighters[1].state !== 'juggle', r.hits.length);
  });
})();

// Wall splats stick for a moment before sliding down, and you can keep hitting.
(function () {
  var m = setup(S, D, 40);
  var d = m.fighters[1];
  d.y = 30; m.wallSplat(d, 1);
  var y0 = d.y, stuck = true;
  for (var i = 0; i < FG.C.WALL_STICK - 1; i++) { m.step([raw({}), raw({})]); if (d.y !== y0) stuck = false; }
  check('wall splat sticks', stuck && d.state === 'wallsplat', [d.y, y0, d.state]);
  for (i = 0; i < 10; i++) m.step([raw({}), raw({})]);
  check('then slides down the wall', d.y < y0, d.y);
})();

// Input feel: an 8-frame buffer, directions read from when the button was pressed,
// and routes that forgive slightly early or late presses.
(function () {
  check('buffer is 6-8 frames', FG.C.BUFFER_FRAMES >= 6 && FG.C.BUFFER_FRAMES <= 8, FG.C.BUFFER_FRAMES);
  // A kick pressed during a whiffed jab's recovery comes out on the first free frame.
  function afterJab(early) {
    var m = setup(S, D, 200), at = S.moves.jab.total - early, start = null;
    for (var i = 0; i < 80; i++) {
      m.step([raw(i === 0 ? { p: true } : i === at ? { k: true } : {}), raw({})]);
      var a = m.fighters[0];
      if (start === null && a.state === 'attack' && a.move.id === 'mid') start = i;
    }
    return start;
  }
  check('early press within the buffer comes out on the first free frame', afterJab(6) !== null && afterJab(6) === afterJab(0), [afterJab(6), afterJab(0)]);
  check('press too early is dropped', afterJab(12) === null, afterJab(12));
  // D+H pressed during recovery, down let go before it comes out: still a launcher.
  var m = setup(S, D, 200), got = null;
  for (var i = 0; i < 60; i++) {
    var r = {};
    if (i === 0) r = { p: true };
    if (i === S.moves.jab.total - 3) r = { h: true, down: true };
    m.step([raw(r), raw({})]);
    var a = m.fighters[0];
    if (a.state === 'attack' && a.move.id !== 'jab' && !got) got = a.move.id;
  }
  check('buffered D+H keeps its direction', got === 'launcher', got);

  defs.forEach(function (d) {
    var tiers = {};
    d.combos.forEach(function (c) { (tiers[c.difficulty] = tiers[c.difficulty] || []).push(c); });
    check(d.name + ' has easy, medium and hard routes', tiers.easy && tiers.medium && tiers.hard, Object.keys(tiers));
    function best(list) { return Math.max.apply(null, list.map(function (c) { return FG.runCombo(d, D, c).damage; })); }
    check(d.name + ' damage rises with difficulty', best(tiers.easy) < best(tiers.medium) && best(tiers.medium) < best(tiers.hard),
      [best(tiers.easy), best(tiers.medium), best(tiers.hard)]);
    // Forgiving timing: every follow-up still works 3 frames early or 3 frames late.
    d.combos.forEach(function (c) {
      if (!c.plan) return;
      var keys = Object.keys(c.plan).map(Number).sort(function (x, y) { return x - y; });
      keys.slice(1).forEach(function (k) {
        if (/^[FB]$/.test(c.plan[k])) return; // dash taps
        [-3, 3].forEach(function (dt) {
          var plan = {};
          keys.forEach(function (kk) { plan[kk === k ? k + dt : kk] = c.plan[kk]; });
          var r2 = FG.runCombo(d, D, Object.assign({}, c, { plan: plan }));
          check(d.name + ' ' + c.name + ': ' + c.plan[k] + ' ' + (dt < 0 ? 'early' : 'late') + ' by 3 still combos',
            r2.hits.join() === c.hits.join(), r2.hits);
        });
      });
    });
  });
})();

// Combo trials show one input step per hit of every route.
defs.forEach(function (d) {
  d.combos.forEach(function (c) {
    var st = FG.comboSteps(c);
    check(d.name + ' ' + c.name + ' trial steps match its hits', st.steps.length === c.hits.length, st.steps);
    check(d.name + ' ' + c.name + ' has a difficulty', ['easy', 'medium', 'hard'].indexOf(c.difficulty) >= 0, c.difficulty);
  });
});

// Self-check: nothing infinite, and nothing too easy.
(function () {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var TOKENS = ['P', 'K', 'H', 'D+H', 'D+K', 'F+P', 'F+K', 'F+H', 'B+P', 'B+K', 'B+H', 'UP', 'D/F+K', 'D/B+K', 'P+K', 'F', 'B'];
  // Mash inputs against a dummy that never guards. Returns the longest combo (hits)
  // and the most frames any one combo kept the dummy from being free.
  function mash(d, pick, frames, wall) {
    var m = new FG.Match(d, D); m.step([raw({}), raw({})]);
    if (wall) { m.fighters[1].x = FG.C.WALL_R - 30; m.fighters[0].x = FG.C.WALL_R - 74; } else { m.fighters[0].x = 480; m.fighters[1].x = 520; }
    var best = 0, longest = 0, since = null;
    for (var i = 0; i < frames; i++) {
      var tok = pick(i);
      m.step([tok ? FG.parseInput(tok) : raw({}), raw({})]);
      m.events.forEach(function (e) { if (e.type === 'hit' && e.attacker === 0) { best = Math.max(best, e.hits); if (e.hits === 1) since = i; } });
      if (m.fighters[1].actionable) since = null; else if (since !== null) longest = Math.max(longest, i - since);
      var a = m.fighters[0], o = m.fighters[1];
      if (!wall && o.actionable && Math.abs(a.x - o.x) > 120) a.x = o.x - 40 * a.facing; // keep them close
    }
    return { hits: best, frames: longest };
  }
  defs.forEach(function (d) {
    var R = rng(d.id.length * 7919 + 1), worst = { hits: 0, frames: 0 };
    for (var s = 0; s < 24; s++) {
      var r = mash(d, function () { return R() < 0.3 ? TOKENS[Math.floor(R() * TOKENS.length)] : null; }, 700, s % 3 === 0);
      worst.hits = Math.max(worst.hits, r.hits); worst.frames = Math.max(worst.frames, r.frames);
    }
    check(d.name + ': random mashing never lands a big combo', worst.hits < 8, worst);
    check(d.name + ': every combo ends (no infinite)', worst.frames < 400, worst);
    ['P', 'K', 'H', 'D+H'].forEach(function (b) {
      [false, true].forEach(function (wall) {
        var r = mash(d, function (i) { return i % 2 ? null : b; }, 600, wall);
        check(d.name + ': mashing ' + b + (wall ? ' at the wall' : '') + ' stays short', r.hits <= 4 && r.frames < 300, r);
      });
    });
    // Each hard route has a real timing check: an input with no more than 14 frames
    // of leeway (counted from 15 early to 15 late).
    d.combos.filter(function (c) { return c.difficulty === 'hard' && c.plan; }).forEach(function (c) {
      var keys = Object.keys(c.plan).map(Number).sort(function (x, y) { return x - y; }), tight = 99;
      keys.slice(1).forEach(function (k) {
        var n = 0;
        for (var dt = -15; dt <= 15; dt++) {
          var plan = {};
          keys.forEach(function (kk) { plan[kk === k ? k + dt : kk] = c.plan[kk]; });
          if (Object.keys(plan).length === keys.length && FG.runCombo(d, D, Object.assign({}, c, { plan: plan })).hits.join() === c.hits.join()) n++;
        }
        tight = Math.min(tight, n);
      });
      check(d.name + ' ' + c.name + ' has a tight input', tight <= 14, tight);
    });
    // No route takes more than 40% of anyone's health.
    var minHealth = Math.min.apply(null, defs.map(function (o) { return o.health; }));
    d.combos.forEach(function (c) {
      var dmg = FG.runCombo(d, D, c).damage;
      check(d.name + ' ' + c.name + ' damage is fair', dmg <= minHealth * 0.4, [dmg, minHealth]);
    });
  });
  // Long combos lose hitstun.
  function stunAfterJab(comboHits) {
    var m = setup(S, D, 40), o = m.fighters[1];
    o.setState('hitstun'); o.stun = 40; m.combo[1].hits = comboHits; // already in a combo
    m.fighters[0].startMove('jab');
    for (var i = 0; i < 20; i++) { m.step([raw({}), raw({})]); if (m.events.some(function (e) { return e.type === 'hit'; })) return o.stun; }
    return null;
  }
  check('hitstun decays deep into a combo', stunAfterJab(FG.C.COMBO_DECAY_FROM + 4) < stunAfterJab(1), [stunAfterJab(FG.C.COMBO_DECAY_FROM + 4), stunAfterJab(1)]);
})();

// Stages: the five from the design doc plus PEDERSEN's faculty parking lot.
(function () {
  var ids = FG.STAGES.map(function (st) { return st.id; });
  check('all stages exist', ['classroom', 'hallway', 'lab', 'campus', 'office', 'parking'].every(function (id) { return ids.indexOf(id) >= 0; }), ids);
  defs.forEach(function (d) { check(d.name + ' home stage exists', ids.indexOf(d.homeStage) >= 0, d.homeStage); });
  check('pedersen fights in the faculty parking lot', FG.fighterById('pedersen').homeStage === 'parking' && FG.stageById('parking').outdoor);
})();

// Trades: both jabs land on the same frame; both get hit, nothing breaks.
(function () {
  var r = play(S, S, 40, { 0: { p: true } }, { 0: { p: true } }, 40);
  var hits = r.events.filter(function (e) { return e.type === 'hit'; });
  check('a trade hits both fighters', hits.length === 2 && hits[0].attacker !== hits[1].attacker, hits.map(function (e) { return e.attacker; }));
})();

// =========================== Phase 7 =========================================

// CPU opponents: every level finishes fights, harder levels win more, guard, and combo.
(function () {
  function fight(d0, d1, l0, l1, seed) {
    var m = new FG.Match(d0, d1), ai = [new FG.AI(l0, seed), new FG.AI(l1, seed * 31 + 7)], st = { blocks: [0, 0], combo: [0, 0] };
    m.autoReset = false;
    for (var i = 0; i < 60 * 120 && m.winner === null; i++) {
      var f = m.fighters;
      m.step([ai[0].input(f[0], f[1], m), ai[1].input(f[1], f[0], m)]);
      m.events.forEach(function (e) {
        if (e.type === 'block') st.blocks[e.defender]++;
        if (e.type === 'hit') st.combo[e.attacker] = Math.max(st.combo[e.attacker], e.hits || 1);
      });
    }
    st.winner = m.winner; st.frames = i;
    return st;
  }
  function series(l0, l1) {
    var w = [0, 0], ends = 0, blocks = [0, 0], combo = [0, 0];
    for (var a = 0; a < defs.length; a++) for (var k = 1; k <= 2; k++) {
      var r = fight(defs[a], defs[(a + k) % defs.length], l0, l1, a * 10 + k);
      if (r.winner !== null) { w[r.winner]++; ends++; }
      blocks[0] += r.blocks[0]; blocks[1] += r.blocks[1];
      combo[0] = Math.max(combo[0], r.combo[0]); combo[1] = Math.max(combo[1], r.combo[1]);
    }
    return { wins: w, ends: ends, n: defs.length * 2, blocks: blocks, combo: combo };
  }
  var hn = series('hard', 'normal'), ne = series('normal', 'easy'), hh = series('hard', 'hard');
  check('AI fights always end in a K.O.', hn.ends === hn.n && ne.ends === ne.n && hh.ends === hh.n, [hn.ends, ne.ends, hh.ends]);
  check('hard beats normal most of the time', hn.wins[0] >= hn.n * 0.65, hn.wins);
  check('normal beats easy most of the time', ne.wins[0] >= ne.n * 0.65, ne.wins);
  check('hard AI guards a lot', hh.blocks[0] > 40 && hh.blocks[1] > 40, hh.blocks);
  check('hard AI lands real combos', Math.max(hh.combo[0], hh.combo[1]) >= 5, hh.combo);
  check('every level is defined', FG.AI_ORDER.every(function (l) { return !!FG.AI_LEVELS[l]; }));
  // The same CPU keeps fighting into the next round (a new match).
  var ai = new FG.AI('normal', 3), acted = 0;
  [0, 1].forEach(function (round) {
    var m = setup(S, D, 160);
    for (var i = 0; i < (round ? 300 : 900); i++) {
      var r = ai.input(m.fighters[1], m.fighters[0], m);
      if (round && (r.left || r.right || r.p || r.k || r.h)) acted++;
      m.step([raw({}), r]);
    }
  });
  check('CPU keeps fighting in the next round', acted > 10, acted);
})();

// Round rules: best of three, timer, time out by health share, perfect rounds.
(function () {
  var R = new FG.Rounds({ seconds: 2, toWin: 2 }), m = setup(S, D, 100);
  check('timer starts full', R.timeLeft() === 2, R.timeLeft());
  m.fighters[1].health = D.health - 20;
  for (var i = 0; i < 2 * FG.C.FPS && !R.result; i++) R.tick(m);
  check('time out goes to the fighter with more health', R.result && R.result.winner === 0 && R.result.how === 'time', R.result);
  check('a round with no damage taken is perfect', R.result.perfect === true);
  check('no match winner after one round', R.matchWinner() === null);
  R.next();
  check('round 2', R.round === 2 && R.timeLeft() === 2);
  m.fighters[0].health = 10;
  R.end(1, 'ko', m);
  check('one round each: final round next', R.wins.join() === '1,1' && (R.next(), R.isFinal()), R.wins);
  R.end(0, 'ko', m);
  check('two wins take the match', R.matchWinner() === 0, R.wins);
  var tie = new FG.Rounds({ seconds: 1 }), m2 = setup(S, S, 100);
  for (i = 0; i < FG.C.FPS; i++) tie.tick(m2);
  check('equal health at time is a draw', tie.result.winner === -1 && tie.wins.join() === '0,0', tie.result);
  var none = new FG.Rounds({ seconds: 0 });
  for (i = 0; i < 99 * 60; i++) none.tick(m2);
  check('no timer: never times out', none.result === null && none.timeLeft() === null);
})();

console.log(passes + ' passed, ' + failures + ' failed');
process.exit(failures ? 1 : 0);
