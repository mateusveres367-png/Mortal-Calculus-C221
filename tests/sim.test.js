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
var re = /<script src="(src\/(?:fg\.js|engine\/[^"?]+|data\/[^"?]+|render\/inputDisplay\.js))(?:\?[^"]*)?"><\/script>/g, mt;
while ((mt = re.exec(html))) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', mt[1]), 'utf8'), ctx, { filename: mt[1] });
}
var FG = ctx.FG, failures = 0, passes = 0;

function check(name, cond, info) {
  if (cond) passes++; else { failures++; console.log('FAIL', name, info === undefined ? '' : JSON.stringify(info)); }
}
// index.html: every script it loads exists, and all carry the same ?v= version stamp
// (so a browser never runs cached old files next to new ones).
(function () {
  var tags = html.match(/<script src="[^"]+"><\/script>/g) || [], vs = {};
  tags.forEach(function (t) {
    var m = /src="([^"?]+)(?:\?v=([^"]+))?"/.exec(t);
    check('index.html script exists: ' + m[1], fs.existsSync(path.join(__dirname, '..', m[1])));
    vs[m[2] || '(none)'] = true;
  });
  check('index.html scripts share one ?v= stamp', Object.keys(vs).length === 1 && !vs['(none)'], Object.keys(vs));
})();
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

// No two fighters share an attack animation: every keyframe of every attack is the
// fighter's own pose, and no two fighters strike with the same pose.
(function () {
  var seen = {};
  defs.forEach(function (d) {
    Object.keys(d.moves).forEach(function (id) {
      var m = d.moves[id];
      if (m.taunt) return;
      (m.anim || []).forEach(function (k) {
        check(d.name + ' ' + id + ' uses their own pose ' + k[1], !!d.poses[k[1]], k[1]);
      });
      if (!m.box) return;
      // The pose on the first active frame.
      var active = m.anim.filter(function (k) { return k[0] >= m.startup; })[0] || m.anim[m.anim.length - 1];
      var key = (d.poses[active[1]] || []).join(',');
      if (seen[key] && seen[key].def !== d.id) check(d.name + ' ' + id + ' strikes with a pose of their own', false, [seen[key].def, seen[key].id]);
      else seen[key] = { def: d.id, id: id };
    });
  });
  // Movement and defence differ too.
  ['idle', 'crouch', 'jump', 'dash', 'block', 'hit_high', 'hit_mid'].forEach(function (pose) {
    var keys = defs.map(function (d) { return (d.poses[pose] || []).join(','); });
    check('every fighter has their own ' + pose + ' pose', keys.every(function (k, i) { return k && keys.indexOf(k) === i; }), pose);
  });
  // And how they move: walk speed, dash, jump and weight are not all the same.
  ['walkF', 'dashSpeed', 'jumpVy', 'weight'].forEach(function (f) {
    var vals = defs.map(function (d) { return d[f]; });
    check('fighters differ in ' + f, vals.every(function (v) { return v != null; }) && new Set(vals).size >= 6, vals);
  });
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
  var r = play(S, D, 70, { 0: { up: true, right: true }, 20: { k: true } }, function (i) { return i >= 2 ? { right: true } : {}; }, 80);
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

// BRINKHUS: Long Arms. His straights outreach everyone's, and the tip hits harder.
(function () {
  function reach(d, id) { var m = d.moves[id]; return m && m.box ? m.box.x + m.box.w : 0; }
  defs.filter(function (d) { return d !== S; }).forEach(function (d) {
    check('Long Arms: his jab outreaches ' + d.name + "'s", reach(S, 'jab') > reach(d, 'jab'), [reach(S, 'jab'), reach(d, 'jab')]);
    Object.keys(d.moves).forEach(function (id) {
      var m = d.moves[id];
      if (m.level === 'high' && !m.air && m.box) check('Long Arms: F+P outreaches ' + d.name + ' ' + id, reach(S, 'fP') > reach(d, id), [reach(S, 'fP'), reach(d, id)]);
    });
  });
  var far = play(S, D, 82, { 0: FG.parseInput('F+P') }, {}, 40);
  var hit = far.events.filter(function (e) { return e.type === 'hit'; })[0];
  check('Long Arms: the tip lands from far away and hits harder', hit && hit.tip && hit.damage === Math.round(S.moves.fP.damage * FG.C.TIP_BONUS), hit && [hit.tip, hit.damage]);
  var near = play(S, D, 40, { 0: FG.parseInput('F+P') }, {}, 40);
  hit = near.events.filter(function (e) { return e.type === 'hit'; })[0];
  check('Long Arms: up close it is a normal hit', hit && !hit.tip && hit.damage === S.moves.fP.damage, hit && [hit.tip, hit.damage]);
})();

// DALSASS: Assume the Contrary sways out of highs and mids (not lows), then counters;
// any of his attacks can be feinted by tapping back during its startup.
(function () {
  var r = play(D, S, 44, { 0: FG.parseInput('B+K'), 16: { p: true } }, { 0: { k: true } }, 60);
  check('sway: a mid kick misses him', count(r, 'hit', 1) === 0 && count(r, 'block', 1) === 0, types(r));
  var counter = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 0; })[0];
  check('sway: P counters with The Converse', counter && counter.move.id === 'swayP', counter && counter.move.id);
  r = play(D, S, 44, { 0: FG.parseInput('B+K'), 16: { p: true } }, { 0: FG.parseInput('D+K') }, 60);
  check('sway: lows still hit him', count(r, 'hit', 1) === 1, types(r));
  check('sway: no counter without a miss', count(r, 'hit', 0) === 0, types(r));
  r = play(D, S, 44, { 0: FG.parseInput('B+K'), 16: { p: true } }, {}, 60);
  check('sway: nothing to counter, no Converse', !r.events.some(function (e) { return e.type === 'whiff' && e.move.id === 'swayP'; }), types(r));
  // Feint: K, then tap back before it comes out. It never hits; the next attack is flagged.
  r = play(D, S, 40, { 0: { k: true }, 5: { left: true } }, {}, 40);
  check('feint: tapping back cancels the kick', count(r, 'hit', 0) === 0 && has(r, 'feint'), types(r));
  r = play(D, S, 40, { 0: { k: true }, 5: { left: true }, 14: { p: true } }, {}, 50);
  var fj = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 0; })[0];
  check('feint: the next attack is out of a feint', fj && fj.move.id === 'jab' && fj.feint === true, fj && [fj.move.id, fj.feint]);
  r = play(D, S, 40, { 0: { k: true }, 13: { left: true } }, {}, 40);
  check('feint: too late once the kick is coming out', count(r, 'hit', 0) === 1, types(r));
  check('only DALSASS feints like that', defs.filter(function (d) { return d.feintCancel; }).length === 1);
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
  var firstAttack = null;
  r = play(S, D, 40, function (i, m) {
    if (firstAttack === null && m.fighters[0].state === 'attack') firstAttack = i;
    return i === 0 ? { ssIn: true } : i === 4 ? { p: true } : {};
  }, {}, 40);
  check('early sidestep attack is CHAI only', firstAttack === null || firstAttack >= 14, firstAttack);
})();

// CHAI: Kick Chain. Kicks cancel into different kicks on contact, up to four in a row.
(function () {
  var CH = FG.fighterById('chai');
  function hitIds(r, who) { return r.events.filter(function (e) { return e.type === 'hit' && e.attacker === (who || 0); }).map(function (e) { return e.move.id; }); }
  var r = play(CH, S, 40, { 0: { k: true }, 14: FG.parseInput('F+K'), 29: FG.parseInput('B+K') }, {}, 90);
  check('kick chain: K, F+K, B+K', hitIds(r).join() === 'mid,fK,bK', hitIds(r));
  r = play(CH, S, 40, { 0: { k: true }, 14: { k: true } }, {}, 70);
  check('kick chain: the same kick does not chain into itself', hitIds(r).join() === 'mid', hitIds(r));
  r = play(CH, S, 120, { 0: { k: true }, 14: FG.parseInput('F+K') }, {}, 70);
  check('kick chain: only once a kick connects', hitIds(r).length === 0 && r.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).length === 1, types(r));
  r = play(CH, S, 40, { 0: { k: true }, 14: FG.parseInput('F+K') }, function (i) { return i >= 2 ? { right: true } : {}; }, 70);
  check('kick chain: works on block too', count(r, 'block', 0) === 2, types(r));
  r = play(CH, S, 40, { 0: FG.parseInput('D+K'), 17: { k: true }, 31: FG.parseInput('F+K'), 46: { h: true }, 66: FG.parseInput('B+K') }, {}, 120);
  check('kick chain: four kicks at most', hitIds(r).join() === 'low,mid,fK,heavy', hitIds(r));
  r = play(S, D, 40, { 0: { k: true }, 15: FG.parseInput('F+K') }, {}, 70);
  check('kick chain is CHAI only', hitIds(r).length === 1, hitIds(r));
  // The best sidestep: the quickest and the deepest.
  defs.filter(function (d) { return d !== CH; }).forEach(function (d) {
    var frames = function (x) { return x.sidestepFrames || FG.C.SIDESTEP_FRAMES; }, depth = function (x) { return x.sidestepDepth || FG.C.SIDESTEP_DEPTH; };
    check('CHAI sidesteps quicker and deeper than ' + d.name, frames(CH) < frames(d) && depth(CH) > depth(d), [frames(CH), depth(CH)]);
  });
})();

// LEE: dash cancel. Once an attack connects (hit or block), forward, forward cancels
// its recovery into a dash, once per string; not on a whiff.
(function () {
  var L = FG.fighterById('lee');
  function stateAt(plan, guard, n) { var r = play(L, S, 40, plan, guard ? function (i) { return i >= 2 ? { right: true } : {}; } : {}, n); return r; }
  var plan = { 0: { p: true }, 13: { right: true }, 15: { right: true } };
  var r = stateAt(plan, true, 20);
  check('lee dash-cancels a blocked jab', r.m.fighters[0].state === 'dash', r.m.fighters[0].state);
  r = stateAt(plan, false, 20);
  check('lee dash-cancels a jab on hit', r.m.fighters[0].state === 'dash', r.m.fighters[0].state);
  r = play(L, S, 140, plan, {}, 20);
  check('no dash cancel on a whiff', r.m.fighters[0].state !== 'dash', r.m.fighters[0].state);
  r = play(S, D, 40, plan, function (i) { return i >= 2 ? { right: true } : {}; }, 20);
  check('dash cancel is LEE only', r.m.fighters[0].state !== 'dash', r.m.fighters[0].state);
  // Once per string: jab, dash cancel, jab, then a second dash cancel doesn't come out.
  r = play(L, S, 40, { 0: { p: true }, 13: { right: true }, 15: { right: true }, 20: { p: true }, 33: { right: true }, 35: { right: true } }, function (i) { return i >= 2 ? { right: true } : {}; }, 40);
  check('dash cancel once per string', r.m.fighters[0].state !== 'dash' && count(r, 'block', 0) === 2, [r.m.fighters[0].state, types(r)]);
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
  // Derivative Read reads every level and counters with a different move for each.
  function counterOf(r) { var h = r.events.filter(function (e) { return e.type === 'hit' && e.attacker === 0; })[0]; return h && h.move.id; }
  r = play(LZ, S, 40, { 6: FG.parseInput('B+H') }, { 0: { k: true, down: true } }, 60);
  check('derivative read: a low gets the trapping sweep', count(r, 'parry') === 1 && counterOf(r) === 'readLow', [types(r), counterOf(r)]);
  r = play(LZ, S, 40, { 4: FG.parseInput('B+H') }, { 0: { p: true } }, 60);
  check('derivative read: a high gets the wrist lock', count(r, 'parry') === 1 && counterOf(r) === 'readHigh', [types(r), counterOf(r)]);
  r = play(LZ, S, 40, { 8: FG.parseInput('B+H') }, { 0: { k: true } }, 60);
  check('derivative read: a mid gets the palm', count(r, 'parry') === 1 && counterOf(r) === 'reject', [types(r), counterOf(r)]);
  // Throws beat it.
  r = play(LZ, S, 40, { 4: FG.parseInput('B+H') }, { 0: FG.parseInput('P+K') }, 60);
  check('derivative read: throws beat it', count(r, 'grab', 1) === 1 && count(r, 'parry') === 0, types(r));
  // Hold H and the stance stays up: a late jab is still read.
  var held = function (i) { return i <= 50 ? FG.parseInput('B+H') : {}; };
  r = play(LZ, S, 40, held, { 36: { p: true } }, 90);
  check('derivative read: holding H keeps the stance up', count(r, 'parry') === 1, types(r));
  r = play(LZ, S, 40, { 0: FG.parseInput('B+H') }, { 36: { p: true } }, 90);
  check('derivative read: tapped, it ends early', count(r, 'parry') === 0 && count(r, 'hit', 1) === 1, types(r));
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
  // Domain Restriction: the step-back kick hits, and he ends up further away than he started.
  var x0, sb = play(MY, S, 40, { 0: FG.parseInput('B+H') }, {}, 40, function (m) { x0 = m.fighters[0].x; });
  check('step-back kick hits', count(sb, 'hit', 0) === 1, types(sb));
  check('step-back kick retreats while attacking', x0 - sb.m.fighters[0].x > 20, x0 - sb.m.fighters[0].x);
  // A strong backdash: further than BRINKHUS's.
  function bd(def) { var x1, r = play(def, D, 200, { 0: { left: true }, 2: { left: true } }, {}, 30, function (m) { x1 = m.fighters[0].x; }); return x1 - r.m.fighters[0].x; }
  check('strong backdash', bd(MY) > bd(S) + 10, [bd(MY), bd(S)]);
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

// PEDERSEN: Exponential Armor. His heavies absorb a hit in their windup and keep going.
(function () {
  var PD = FG.fighterById('pedersen');
  function hits(r, who) { return r.events.filter(function (e) { return e.type === 'hit' && e.attacker === who; }); }
  // He starts the Base Hook; a jab lands in its windup, is absorbed, and the hook connects.
  var r = play(PD, S, 40, { 0: { h: true } }, { 2: { p: true } }, 60);
  check('armor absorbs a jab', count(r, 'armor') === 1 && hits(r, 1).length === 0, types(r));
  check('the armored hook still lands', hits(r, 0).length === 1 && hits(r, 0)[0].move.id === 'heavy', types(r));
  check('armor still costs health', r.m.fighters[0].health === PD.health - Math.round(S.moves.jab.damage * FG.C.ARMOR_DAMAGE), r.m.fighters[0].health);
  // Two hits: the second one gets through.
  r = play(PD, S, 40, { 0: { h: true } }, { 0: { p: true }, 11: { p: true } }, 60);
  check('armor takes one hit only', count(r, 'armor') === 1 && hits(r, 1).length === 1 && hits(r, 0).length === 0, types(r));
  // Throws go through armor.
  r = play(PD, S, 40, { 0: { h: true } }, { 2: FG.parseInput('P+K') }, 70);
  check('throws beat armor', count(r, 'grab', 1) === 1 && count(r, 'armor') === 0, types(r));
  // A full charge on Order of Magnitude absorbs two.
  r = play(PD, S, 40, function (i) { return i === 0 ? FG.parseInput('B+H') : i <= 60 ? { h: true } : {}; }, { 30: { p: true }, 46: { p: true } }, 100);
  check('full charge absorbs two hits', count(r, 'armor') === 2 && hits(r, 0).length === 1, types(r));
  // No other teacher has armor (MAX's Course Load is the one student exception).
  var MX = FG.fighterById('max');
  defs.filter(function (d) { return d !== PD && d !== MX; }).forEach(function (d) {
    check(d.name + ' has no armor', Object.keys(d.moves).every(function (id) { return !d.moves[id].armor || d.moves[id].enhanced; }));
  });
  if (MX) check('MAX: Course Load is a charge move with armor', MX.moves.fH.charge && MX.moves.fH.armor && Object.keys(MX.moves).every(function (id) { return id === 'fH' || !MX.moves[id].armor || MX.moves[id].enhanced; }));
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
  // Cardio: dash, keep holding forward, and he runs for as long as forward is held.
  var held = function (i) { return i === 0 || i >= 2 ? { right: true } : {}; };
  var x0, run = play(RM, D, 100, held, {}, 40, function (m) { m.fighters[0].x = 60; m.fighters[1].x = FG.C.WALL_R - 20; x0 = m.fighters[0].x; });
  check('ramos runs: a dash held forward turns into a run', run.m.fighters[0].state === 'run', run.m.fighters[0].state);
  var far = play(RM, D, 100, held, {}, 70, function (m) { m.fighters[0].x = 60; m.fighters[1].x = FG.C.WALL_R - 20; });
  check('ramos never slows down', far.m.fighters[0].state === 'run' && Math.abs(far.m.fighters[0].vx - RM.runSpeed) < 0.01, [far.m.fighters[0].state, far.m.fighters[0].vx]);
  var stop = play(RM, D, 100, function (i) { return i === 0 || (i >= 2 && i < 30) ? { right: true } : {}; }, {}, 40, function (m) { m.fighters[0].x = 60; m.fighters[1].x = FG.C.WALL_R - 20; });
  check('letting go of forward stops the run', stop.m.fighters[0].state !== 'run', stop.m.fighters[0].state);
  check('nobody else runs', play(S, D, 100, held, {}, 40, function (m) { m.fighters[0].x = 60; m.fighters[1].x = FG.C.WALL_R - 20; }).m.fighters[0].state !== 'run');
  // Attacks out of the run: P, K, D+K, H, and P+K grabs.
  [['P', 'runP'], ['K', 'runK'], ['D+K', 'runDK'], ['H', 'runH']].forEach(function (t) {
    var q = play(RM, D, 100, function (i) { return i === 0 || (i >= 2 && i < 24) ? { right: true } : i === 24 ? Object.assign(FG.parseInput(t[0]), { right: true }) : {}; }, {}, 70,
      function (m) { m.fighters[0].x = 60; m.fighters[1].x = FG.C.WALL_R - 20; });
    var ids = q.events.filter(function (e) { return e.type === 'whiff' && e.fighter === 0; }).map(function (e) { return e.move.id; });
    check('run, ' + t[0] + ': ' + t[1], ids.join() === t[1], ids);
  });
  var rg = play(RM, D, 150, function (i) { return i === 0 || (i >= 2 && i < 40) ? { right: true } : {}; }, function (i, m) {
    return { down: true, p: m.throwState && m.frame - m.throwState.start === 4 };
  }, 120, function () {});
  var grabbed = false;
  rg = play(RM, D, 150, function (i, m) {
    var f = m.fighters[0], d = Math.abs(m.fighters[1].x - f.x);
    if (f.state === 'run' && d < 44 && !grabbed) { grabbed = true; return FG.parseInput('F+P+K'); }
    return i === 0 || i >= 2 ? { right: true } : {};
  }, function (i, m) { return m.throwState && m.frame - m.throwState.start === 4 ? { p: true, down: true } : { down: true }; }, 120);
  var grabEv = rg.events.filter(function (e) { return e.type === 'grab'; })[0];
  check('running grab: Gauss-Jordan grabs a crouching opponent', grabEv && grabEv.move.id === 'runGrab', types(rg));
  check('running grab cannot be broken', count(rg, 'break') === 0 && rg.m.fighters[1].health === D.health - RM.moves.runGrab.damage, rg.m.fighters[1].health);
  // The fastest walk in the game.
  check('ramos walks fastest', FG.ROSTER.every(function (d) { return d === RM || d.walkF < RM.walkF; }));
  // His dash covers the most ground.
  function dashDist(def) { var x0, q = play(def, D, 300, { 0: { right: true }, 2: { right: true } }, {}, 20, function (m) { x0 = m.fighters[0].x; }); return q.m.fighters[0].x - x0; }
  var others = FG.rosterSide('teacher').filter(function (d) { return d !== RM; }).map(dashDist);
  check('ramos has the fastest dash of the teachers', others.every(function (o) { return dashDist(RM) > o; }), [dashDist(RM), others]);
  // NICOLAS's Bell Sprint: the fastest dash in the game.
  var NI = FG.fighterById('nicolas');
  if (NI) check('nicolas has the fastest dash in the game', FG.ROSTER.every(function (d) { return d === NI || dashDist(d) < dashDist(NI); }), dashDist(NI));
})();

// KO finishers: every fighter has one, with its own input; the command reader works
// relative to facing.
(function () {
  var inputs = {};
  defs.forEach(function (d) {
    check(d.name + ' has a finisher', d.finisher && d.finisher.name && /^[FBDUPKH](, [FBDUPKH])+$/.test(d.finisher.input), d.finisher);
    check(d.name + "'s finisher input is their own", !inputs[d.finisher.input], d.finisher.input);
    inputs[d.finisher.input] = true;
  });
  var none = FG.emptyRaw();
  check('command tokens: forward when facing right', FG.inputTokens(none, FG.parseInput('F'), 1).join() === 'F');
  check('command tokens: right is back when facing left', FG.inputTokens(none, FG.parseInput('F'), -1).join() === 'B');
  check('command tokens: only new presses', FG.inputTokens(FG.parseInput('F'), FG.parseInput('F'), 1).length === 0);
  check('command tokens: buttons', FG.inputTokens(none, FG.parseInput('D+H'), 1).join() === 'D,H');
  check('command match: the end of the history', FG.matchesCommand(['K', 'B', 'F', 'H'], 'B, F, H') && !FG.matchesCommand(['B', 'F', 'K'], 'B, F, H'));
})();

// PEDERSEN is the cover fighter: first on the roster.
check('pedersen is first on character select', FG.ROSTER[0].id === 'pedersen', FG.ROSTER.map(function (d) { return d.id; }));
check('nine teachers', FG.rosterSide('teacher').length === 9, FG.rosterSide('teacher').length);

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
    if (!by(rv.a) || !by(rv.b)) return; // (a student not on the roster yet)
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
  check('buffer is about 10 frames', FG.C.BUFFER_FRAMES >= 9 && FG.C.BUFFER_FRAMES <= 12, FG.C.BUFFER_FRAMES);
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
    // Meter routes (enhanced specials, ultimates) sit outside the damage tiers.
    d.combos.forEach(function (c) { if (!c.meter) (tiers[c.difficulty] = tiers[c.difficulty] || []).push(c); });
    check(d.name + ' has easy, medium and hard routes', tiers.easy && tiers.medium && tiers.hard, Object.keys(tiers));
    function best(list) { return Math.max.apply(null, list.map(function (c) { return FG.runCombo(d, D, c).damage; })); }
    check(d.name + ' damage rises with difficulty', best(tiers.easy) < best(tiers.medium) && best(tiers.medium) < best(tiers.hard),
      [best(tiers.easy), best(tiers.medium), best(tiers.hard)]);
    // Forgiving timing: every follow-up still works 3 frames early or 3 frames late.
    d.combos.forEach(function (c) {
      if (!c.plan) return;
      var keys = Object.keys(c.plan).map(Number).sort(function (x, y) { return x - y; });
      // The opener is the first hitting input (dash taps and motions before it are setup).
      var opener = keys.filter(function (k) { return !/^(F|B|D|D\/F)$/.test(c.plan[k]); })[0];
      keys.filter(function (k) { return k > opener; }).forEach(function (k) {
        if (/^(F|B|D|D\/F)$/.test(c.plan[k])) return; // dash taps and motions
        if (c.meter && c.plan[k] === 'P+K') return; // powering up the opener is part of it
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
      m.fighters[0].meter = 0; // without meter (enhanced specials add hits by design)
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
    // Each hard route has a real timing check: an input with no more than 16 frames
    // of leeway (counted from 15 early to 15 late).
    d.combos.filter(function (c) { return c.difficulty === 'hard' && c.plan && !c.meter; }).forEach(function (c) {
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
      check(d.name + ' ' + c.name + ' has a tight input', tight <= 16, tight);
    });
    // No route takes more than 40% of anyone's health.
    var minHealth = Math.min.apply(null, defs.map(function (o) { return o.health; }));
    d.combos.forEach(function (c) {
      if (c.meter) return; // spending meter is allowed to hurt more
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
    // Three seeds per pairing: enough fights that one lucky round doesn't decide it.
    for (var sd = 0; sd < 3; sd++) for (var a = 0; a < defs.length; a++) for (var k = 1; k <= 2; k++) {
      var r = fight(defs[a], defs[(a + k) % defs.length], l0, l1, a * 10 + k + sd * 1000);
      if (r.winner !== null) { w[r.winner]++; ends++; }
      blocks[0] += r.blocks[0]; blocks[1] += r.blocks[1];
      combo[0] = Math.max(combo[0], r.combo[0]); combo[1] = Math.max(combo[1], r.combo[1]);
    }
    return { wins: w, ends: ends, n: defs.length * 6, blocks: blocks, combo: combo };
  }
  var hn = series('hard', 'normal'), ne = series('normal', 'easy'), hh = series('hard', 'hard'), ph = series('professor', 'hard');
  check('professor beats hard more often than not', ph.wins[0] > ph.wins[1], ph.wins);
  check('AI fights always end in a K.O.', hn.ends === hn.n && ne.ends === ne.n && hh.ends === hh.n, [hn.ends, ne.ends, hh.ends]);
  check('hard beats normal most of the time', hn.wins[0] >= hn.n * 0.65, hn.wins);
  check('normal beats easy most of the time', ne.wins[0] >= ne.n * 0.65, ne.wins);
  check('hard AI guards a lot', hh.blocks[0] > 40 && hh.blocks[1] > 40, hh.blocks);
  check('hard AI lands real combos', Math.max(hh.combo[0], hh.combo[1]) >= 5, hh.combo);
  check('every level is defined', FG.AI_ORDER.every(function (l) { return !!FG.AI_LEVELS[l]; }));
  check('four levels: easy, normal, hard, professor', FG.AI_ORDER.join() === 'easy,normal,hard,professor');
  // The PROFESSOR learns a repeated move: it stops landing once it's been seen a few times.
  function repeatHeavy(level) {
    var m = new FG.Match(S, FG.fighterById('lopez')), ai = new FG.AI(level, 5), res = [], last = -99;
    m.step([raw({}), raw({})]);
    m.fighters[0].x = 480; m.fighters[1].x = 525;
    for (var i = 0; i < 60 * 60; i++) {
      var f = m.fighters, r1 = raw({});
      if (f[0].actionable && i - last > 70) { if (Math.abs(f[0].x - f[1].x) > 55) r1 = raw({ right: true }); else { r1 = raw({ h: true }); last = i; res.push('-'); } }
      m.step([r1, ai.input(f[1], f[0], m)]);
      m.events.forEach(function (e) { if (e.attacker === 0 && e.move && e.move.id === 'heavy' && e.type === 'hit') res[res.length - 1] = 'H'; });
      f[0].health = S.health; f[1].health = f[1].def.health;
    }
    return { res: res, ai: ai };
  }
  var prof = repeatHeavy('professor'), late = prof.res.slice(-12).filter(function (x) { return x === 'H'; }).length;
  check('professor learns a repeated move', prof.ai.learned.heavy && prof.ai.noticed === S.moves.heavy.label, prof.ai.noticed);
  check('a learned move stops landing', late <= 2, prof.res.join(''));
  check('hard does not read habits', !Object.keys(repeatHeavy('hard').ai.learned).length);
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

// Easier combos: launcher > P > P > H works for everyone, with room to spare.
(function () {
  defs.forEach(function (d) {
    var c = d.combos.filter(function (x) { return x.notation === 'D+H, P, P, H'; })[0];
    check(d.name + ' has launcher > P > P > H', !!c && c.hits[3] === 'jabH', c && c.hits);
    if (!c) return;
    var keys = Object.keys(c.plan).map(Number).sort(function (x, y) { return x - y; });
    keys.slice(1).forEach(function (k) {
      var n = 0;
      for (var dt = -15; dt <= 15; dt++) {
        var plan = {};
        keys.forEach(function (kk) { plan[kk === k ? k + dt : kk] = c.plan[kk]; });
        if (Object.keys(plan).length === keys.length && FG.runCombo(d, D, Object.assign({}, c, { plan: plan })).hits.join() === c.hits.join()) n++;
      }
      check(d.name + ' launcher > P > P > H: ' + c.plan[k] + ' has a wide window', n >= 12, n);
    });
  });
  // Easy Combos: mashing P after a launcher plays the whole string.
  defs.forEach(function (d) {
    var m = setup(d, D, 40), hits = [];
    m.fighters[0].easy = true;
    for (var i = 0; i < 160; i++) {
      var r = i === 0 ? LAUNCH : (i > 30 && i % 3 === 0 ? { p: true } : {});
      m.step([raw(r), raw({})]);
      m.events.forEach(function (e) { if (e.type === 'hit' && e.attacker === 0) hits.push(e.move.id); });
    }
    check(d.name + ' Easy Combos: mash P after a launcher', hits.length >= 4 && hits[hits.length - 1] === 'jabH', hits);
  });
})();

// Trial timing bar: each route input has a window around its planned frame.
(function () {
  var c = S.combos.filter(function (x) { return x.notation === 'D+H, P, P, H'; })[0];
  var w = FG.routeWindows(S, D, c);
  check('route windows: one per input', w.length === Object.keys(c.plan).length, w.length);
  check('route windows contain the planned frame and are wide', w.slice(1).every(function (x) { return x.lo <= x.frame && x.hi >= x.frame && x.hi - x.lo >= 10; }), w);
})();

// Grade meter: landing hits, blocking and taking damage fill it; faster when behind.
(function () {
  var m = setup(S, D, 40), ev = [];
  run(m, 40, function (i) { return [raw(i === 0 ? { p: true } : {}), raw({})]; });
  var a = m.fighters[0], d = m.fighters[1];
  check('meter: landing a hit fills it', a.meter > 0, a.meter);
  check('meter: taking damage fills it', d.meter > 0 && d.meter < a.meter, [a.meter, d.meter]);
  var b = setup(S, D, 40);
  for (var i = 0; i < 40; i++) b.step([raw(i === 0 ? { p: true } : {}), raw(i >= 2 ? { right: true } : {})]);
  check('meter: blocking fills it', b.fighters[1].meter >= FG.C.METER_BLOCK && b.fighters[0].meter > 0, [b.fighters[0].meter, b.fighters[1].meter]);
  // Behind on health: the same hit gives more.
  var e = setup(S, D, 40);
  e.fighters[0].health = 50;
  run(e, 40, function (i) { return [raw(i === 0 ? { p: true } : {}), raw({})]; });
  check('meter: fills faster when losing', Math.abs(e.fighters[0].meter - a.meter * FG.C.METER_LOSING) < 0.01, [e.fighters[0].meter, a.meter]);
  // Bars: an event for each bar filled, capped at three.
  var g = setup(S, D, 40);
  g.fighters[0].meter = FG.C.METER_BAR - 1;
  run(g, 40, function (i) { return [raw(i === 0 ? { p: true } : {}), raw({})]; });
  var me = []; g.gainMeter(0, 1000); me = g.events.filter(function (x) { return x.type === 'meter'; });
  check('meter: capped at three bars', g.fighters[0].meter === FG.C.METER_MAX, g.fighters[0].meter);
  check('meter: filling a bar is an event', me.length === 1 && me[0].bars === 3, me);
  check('meter: spend takes whole bars', g.spendMeter(0, 2) && g.fighters[0].meter === FG.C.METER_BAR && !g.spendMeter(0, 2) && g.fighters[0].meter === FG.C.METER_BAR, g.fighters[0].meter);
  var inf = setup(S, D, 40);
  inf.fighters[0].infiniteMeter = true; inf.gainMeter(0, 0);
  check('meter: infinite meter stays full', inf.spendMeter(0, 3) && inf.fighters[0].meter === FG.C.METER_MAX, inf.fighters[0].meter);
  // Armored hits fill it too.
  var P = FG.fighterById('pedersen'), am = setup(S, P, 40);
  am.fighters[1].meter = 0;
  am.absorb({ a: 0, d: 1, hb: { y1: 40, y2: 60 } }, am.fighters[0], am.fighters[1], S.moves.jab);
  check('meter: armored hits fill both', am.fighters[0].meter > 0 && am.fighters[1].meter > 0, [am.fighters[0].meter, am.fighters[1].meter]);
})();

// Enhanced specials: P+K in a special's startup powers it up for one bar.
(function () {
  function enhanced(d, id, meter, opts) {
    opts = opts || {};
    var m = setup(d, opts.opp || D, opts.dist || 36), ev = [];
    m.fighters[0].meter = meter;
    m.fighters[0].startMove(id);
    for (var i = 0; i < 90; i++) {
      m.step([raw(i === 1 && !opts.noPress ? { p: true, k: true } : {}), raw(opts.oppPress && i === opts.oppPress[0] ? opts.oppPress[1] : {})]);
      ev = ev.concat(m.events);
    }
    return { m: m, ev: ev, hits: ev.filter(function (e) { return e.type === 'hit' && e.attacker === 0; }) };
  }
  defs.forEach(function (d) {
    var exIds = Object.keys(d.moves).filter(function (id) { return d.moves[id].ex; });
    check(d.name + ' has three enhanced specials', exIds.length === 3, exIds);
    exIds.forEach(function (id) {
      var base = d.moves[id], ex = d.moves[id + 'EX'], tag = d.name + ' ' + id + '+: ';
      check(tag + 'labelled with a +', ex && ex.label === base.label + '+' && ex.exText, ex && ex.label);
      var r = enhanced(d, id, FG.C.METER_BAR);
      var en = r.ev.filter(function (e) { return e.type === 'enhance'; });
      check(tag + 'P+K powers it up', en.length === 1 && en[0].move === ex, r.ev.map(function (e) { return e.type; }));
      check(tag + 'costs one bar', r.m.fighters[0].meter < FG.C.METER_BAR, r.m.fighters[0].meter);
      check(tag + 'it lands', r.hits.length >= 1 && r.hits.every(function (h) { return h.move === ex; }), r.hits.map(function (h) { return h.move.id; }));
      var plain = enhanced(d, id, 0);
      check(tag + 'no meter, no power-up', plain.ev.every(function (e) { return e.type !== 'enhance'; }) && plain.hits.length && plain.hits[0].move === base);
      var dmg = function (x) { return x.hits.reduce(function (t, h) { return t + h.damage; }, 0); };
      var basic = enhanced(d, id, 0, { noPress: true });
      check(tag + 'more damage', dmg(r) > dmg(basic), [dmg(r), dmg(basic)]);
      if (ex.multi) check(tag + (ex.multi + 1) + ' hits', r.hits.length === ex.multi + 1 && r.hits.every(function (h, k) { return h.hits === k + 1; }), r.hits.length);
      if (ex.hit.launch) check(tag + 'launches', r.hits[r.hits.length - 1].launch, r.hits.map(function (h) { return h.launch; }));
      if (ex.hit.knockdown && !base.hit.knockdown) check(tag + 'knocks down', r.hits[r.hits.length - 1].knockdown || r.hits[r.hits.length - 1].launch);
      if (ex.armor) {
        // The opponent jabs into the startup: it's absorbed and the move still lands.
        var ar = enhanced(d, id, FG.C.METER_BAR, { opp: S, oppPress: [0, { p: true }], dist: 34 });
        check(tag + 'armored', ar.ev.some(function (e) { return e.type === 'armor' && e.defender === 0; }) && ar.hits.length >= 1, ar.ev.map(function (e) { return e.type; }));
      }
    });
  });
  var inf = setup(S, D, 36);
  inf.fighters[0].infiniteMeter = true; inf.fighters[0].meter = FG.C.METER_MAX;
  inf.fighters[0].startMove('fP');
  run(inf, 30, function (i) { return [raw(i === 1 ? { p: true, k: true } : {}), raw({})]; });
  check('enhanced: infinite meter never runs out', inf.fighters[0].meter === FG.C.METER_MAX && inf.fighters[0].lastMove.id === 'fPEX', inf.fighters[0].meter);
  // Too late: once the special is active, P+K does nothing.
  var late = setup(S, D, 36);
  late.fighters[0].meter = FG.C.METER_BAR;
  late.fighters[0].startMove('heavy');
  var lateEv = [];
  run(late, 40, function (i) { lateEv = lateEv.concat(late.events); return [raw(i === S.moves.heavy.startup ? { p: true, k: true } : {}), raw({})]; });
  check('enhanced: only during startup', lateEv.every(function (e) { return e.type !== 'enhance'; }) && late.fighters[0].lastMove.id === 'heavy', late.fighters[0].lastMove.id);
})();

// Ultimates: the ultimate key, or down, down-forward, forward + P+K+H, with three bars; a cinematic on hit.
(function () {
  var QCF = ['D', 'D/F', 'F', 'F+P+K+H'];
  function ult(d, opp, opts) {
    opts = opts || {};
    var m = setup(d, opp, opts.dist || 40), ev = [];
    m.autoReset = false;
    m.fighters[1].holdGuard = !!opts.holdGuard; // guard in place, like the training dummy
    m.fighters[0].meter = opts.meter == null ? FG.C.METER_MAX : opts.meter;
    if (opts.oppHealth) m.fighters[1].health = opts.oppHealth;
    var seq = opts.seq || (d.ultimate.counter ? ['D', 'D/F', 'F', 'P+K+H'] : QCF), cinFrames = 0;
    for (var i = 0; i < (opts.frames || 520); i++) {
      var r1 = i < seq.length ? FG.parseInput(seq[i]) : raw({});
      var r2 = opts.opp2 ? opts.opp2(i, m) : raw({});
      m.step([r1, r2]);
      if (m.cinematic) cinFrames++;
      ev = ev.concat(m.events);
    }
    return { m: m, ev: ev, cinFrames: cinFrames, type: function (t) { return ev.filter(function (e) { return e.type === t; }); } };
  }
  defs.forEach(function (d) {
    var u = d.ultimate, tag = d.name + ' ultimate: ';
    check(tag + 'has a cinematic script entry', !!u && u.hits.length >= 1 && u.len > u.hits[u.hits.length - 1], u);
    // The opponent attacks into LOPEZ's counter stance.
    var poke = u.counter ? function (i) { return raw(i === 10 ? { p: true } : {}); } : null;
    var r = ult(d, D, { opp2: poke });
    var st = r.type('ultstart'), cin = r.type('ultimate'), hits = r.type('ulthit'), end = r.type('ultend');
    check(tag + 'starts with three bars', st.length === 1 && r.m.fighters[0].meter < FG.C.METER_MAX, [st.length, r.m.fighters[0].meter]);
    check(tag + 'connects and plays', cin.length === 1 && end.length === 1, r.ev.map(function (e) { return e.type; }).filter(function (t) { return /ult/.test(t); }));
    check(tag + 'one hit per beat', hits.length === u.hits.length, hits.length);
    var dmg = hits.reduce(function (t, h) { return t + h.damage; }, 0), want = Math.round(D.health * FG.C.ULT_DAMAGE);
    check(tag + 'takes about a third of their health', dmg === want && dmg / D.health >= 0.3 && dmg / D.health <= 0.35, [dmg, want]);
    check(tag + 'the counter climbs', hits.every(function (h, k) { return h.hits === k + 1 + (hits[0].hits - 1); }), hits.map(function (h) { return h.hits; }));
    check(tag + 'the fight stands still while it plays', r.cinFrames >= u.len, r.cinFrames);
    var a = r.m.fighters[0], o = r.m.fighters[1];
    check(tag + 'both are free again after', a.actionable && (o.actionable || o.state === 'down' || o.state === 'getup'), [a.state, o.state]);
    // Not enough meter: nothing.
    var poor = ult(d, D, { meter: FG.C.METER_MAX - 1, opp2: poke });
    check(tag + 'needs all three bars', poor.type('ultstart').length === 0 && poor.type('ultimate').length === 0);
    // The ultimate key on its own does it too (and does nothing without the meter).
    var key = ult(d, D, { seq: ['ULT'], opp2: poke });
    check(tag + 'the ultimate key fires it', key.type('ultstart').length === 1 && key.type('ultimate').length === 1 && key.type('ulthit').length === u.hits.length, key.ev.filter(function (e) { return /ult/.test(e.type); }).length);
    var keyPoor = ult(d, D, { seq: ['ULT'], meter: FG.C.METER_MAX - 1, opp2: poke });
    check(tag + 'the key needs all three bars', keyPoor.type('ultstart').length === 0);
    // The motion matters: F, D/F, D (backwards) doesn't do it.
    var wrong = ult(d, D, { seq: ['F', 'D/F', 'D', 'P+K+H'], opp2: poke });
    check(tag + 'needs the motion', wrong.type('ultstart').length === 0);
    if (u.counter) {
      // Nobody attacks: the stance runs out and leaves him open.
      var idle = ult(d, D, { frames: 200 });
      check(tag + 'whiffs if nobody attacks', idle.type('ultimate').length === 0 && idle.type('ultstart').length === 1);
      return;
    }
    // Blocked: a huge disadvantage (a grab ultimate can't be blocked at all).
    var guard = ult(d, D, { holdGuard: true, opp2: function () { return raw({ right: true }); } });
    var res = guard.m.lastResult[0];
    if (d.moves.ultimate.throw) { check(tag + 'a grab: guarding does not stop it', guard.type('ultimate').length === 1); return; }
    check(tag + 'blocked leaves them wide open', guard.type('ultimate').length === 0 && res && res.adv <= -25, res && [res.kind, res.adv]);
    // Whiffed from far away: a long recovery.
    var far = ult(d, D, { dist: 260, frames: 30 });
    check(tag + 'whiffed is a long recovery', far.m.fighters[0].state === 'attack' && d.moves.ultimate.total >= d.moves[u.from].total + FG.C.ULT_EXTRA_RECOVERY, d.moves.ultimate.total);
  });
  // A K.O. in the middle: the cinematic plays out, then the match is over.
  var ko = ult(S, D, { oppHealth: 20 });
  check('ultimate: a K.O. waits for the cinematic', ko.type('ultend').length === 1 && ko.m.fighters[1].ko && ko.m.winner === 0, [ko.m.winner, ko.m.fighters[1].ko]);
  // Cancelled from a jab that hits.
  var m = setup(S, D, 40), ev = [];
  m.fighters[0].meter = FG.C.METER_MAX;
  var seq = { 0: 'P', 4: 'D', 5: 'D/F', 6: 'F', 11: 'F+P+K+H' };
  for (var i = 0; i < 400; i++) { m.step([seq[i] ? FG.parseInput(seq[i]) : raw({}), raw({})]); ev = ev.concat(m.events); }
  var uh = ev.filter(function (e) { return e.type === 'ulthit'; });
  check('ultimate: cancels from a hit into a combo', uh.length === S.ultimate.hits.length && uh[0].hits === 2, uh.map(function (e) { return e.hits; }));
  check('ultimate: less damage at the end of a combo', ult(S, D).type('ulthit').reduce(function (t, e) { return t + e.damage; }, 0) >= uh.reduce(function (t, e) { return t + e.damage; }, 0));
  // ...and with the ultimate key.
  m = setup(S, D, 40); ev = [];
  m.fighters[0].meter = FG.C.METER_MAX;
  for (i = 0; i < 400; i++) { m.step([i === 0 ? FG.parseInput('P') : i === 8 ? FG.parseInput('ULT') : raw({}), raw({})]); ev = ev.concat(m.events); }
  uh = ev.filter(function (e) { return e.type === 'ulthit'; });
  check('ultimate key: cancels from a hit into a combo', uh.length === S.ultimate.hits.length && uh[0].hits === 2, uh.map(function (e) { return e.hits; }));
  // The motion itself, in the input buffer.
  var b = new FG.InputBuffer(), f = 100;
  ['D', 'D/F', 'F'].forEach(function (x) { b.update(FG.parseInput(x), f++); });
  check('input: down, down-forward, forward is a quarter circle', b.qcf(1, f) && !b.qcf(-1, f));
  check('input: too slow is not', !b.qcf(1, f + FG.C.QCF_FRAMES + 2));
})();

// Extra Credit: under a quarter of their health, once a match, P+K+H refills the
// meter and boosts damage for a while.
(function () {
  function ec(health, used) {
    var m = setup(S, D, 40), ev = [];
    m.fighters[0].health = health; m.fighters[0].extraCredit = !!used;
    m.step([raw({ p: true, k: true, h: true }), raw({})]); ev = ev.concat(m.events);
    for (var i = 0; i < 4; i++) { m.step([raw({}), raw({})]); ev = ev.concat(m.events); }
    return { m: m, ev: ev, on: ev.some(function (e) { return e.type === 'extracredit'; }) };
  }
  var low = Math.floor(S.health * FG.C.EXTRA_CREDIT_HEALTH);
  var r = ec(low);
  check('extra credit: under a quarter of health', r.on && r.m.fighters[0].meter === FG.C.METER_MAX && r.m.fighters[0].boost > 0 && r.m.fighters[0].extraCredit, r.ev.map(function (e) { return e.type; }));
  check('extra credit: not with more health', !ec(low + 2).on);
  check('extra credit: once a match', !ec(low, true).on);
  // P+K+H at full health is still just a throw attempt.
  var full = ec(S.health);
  check('extra credit: P+K+H at full health throws', !full.on && full.m.fighters[0].lastMove && /throw/.test(full.m.fighters[0].lastMove.id), full.m.fighters[0].lastMove && full.m.fighters[0].lastMove.id);
  // The boost: the same jab does more damage, until it runs out.
  function jab(boost) {
    var m = setup(S, D, 40); m.fighters[0].boost = boost;
    var d = 0;
    for (var i = 0; i < 30; i++) { m.step([raw(i === 0 ? { p: true } : {}), raw({})]); m.events.forEach(function (e) { if (e.type === 'hit') d += e.damage; }); }
    return d;
  }
  check('extra credit: damage boost', jab(100) === Math.round(S.moves.jab.damage * FG.C.BOOST_DAMAGE) && jab(0) === S.moves.jab.damage, [jab(100), jab(0)]);
  var b = ec(low).m.fighters[0];
  check('extra credit: the boost runs out', b.boost < FG.C.BOOST_FRAMES && b.boost > FG.C.BOOST_FRAMES - 10, b.boost);
  // With the meter it gives, the ultimate comes right after.
  var m = setup(S, D, 40), seen = [];
  m.fighters[0].health = low;
  var seq = { 0: 'P+K+H', 8: 'D', 9: 'D/F', 10: 'F', 11: 'F+P+K+H' };
  for (var i = 0; i < 60; i++) { m.step([seq[i] ? FG.parseInput(seq[i]) : raw({}), raw({})]); m.events.forEach(function (e) { seen.push(e.type); }); }
  check('extra credit: then an ultimate', seen.indexOf('extracredit') >= 0 && seen.indexOf('ultstart') > seen.indexOf('extracredit'), seen);
})();

// Stage objects: T next to one uses it (a springboard attack, or back + T to vault
// out of the corner), then it cools down. Taunt is still T everywhere else.
(function () {
  check('every stage has one or two objects near the walls', FG.STAGES.every(function (st) {
    var ps = FG.stageProps(st.id);
    return ps.length >= 1 && ps.length <= 2 && ps.every(function (p) { return Math.min(p.x - FG.C.WALL_L, FG.C.WALL_R - p.x) <= 80 && p.atk && p.esc; });
  }));
  function near(press, opts) {
    opts = opts || {};
    var m = new FG.Match(S, D); m.step([raw({}), raw({})]);
    m.setProps(FG.stageProps('classroom'));
    var a = m.fighters[0], d = m.fighters[1];
    a.x = opts.ax || 100; d.x = opts.dx || 160;
    var ev = [];
    for (var i = 0; i < (opts.frames || 80); i++) { m.step([raw(typeof press === 'function' ? press(i) : i === 0 ? press : {}), raw({})]); ev = ev.concat(m.events); }
    return { m: m, ev: ev, a: a, d: d, type: function (t) { return ev.filter(function (e) { return e.type === t; }); } };
  }
  var r = near({ t: true });
  var used = r.type('prop');
  check('stage object: T next to it uses it', used.length === 1 && used[0].use === 'attack' && used[0].prop.kind === 'whiteboard', r.ev.map(function (e) { return e.type; }));
  check('stage object: the springboard hits and knocks down', r.type('hit').some(function (e) { return e.move.id === 'propAtk' && e.knockdown; }), r.type('hit').map(function (e) { return e.move.id; }));
  check('stage object: then it cools down', r.m.props[0].cool > 0 && r.m.props[0].cool <= FG.C.PROP_COOLDOWN, r.m.props[0].cool);
  var twice = near(function (i) { return i === 0 || i === 60 ? { t: true } : {}; }, { frames: 120 });
  check('stage object: not again until it is ready', twice.type('prop').length === 1 && twice.type('whiff').some(function (e) { return e.move.taunt; }), twice.ev.map(function (e) { return e.type; }));
  var far = near({ t: true }, { ax: 400, dx: 460 });
  check('stage object: away from them, T is a taunt', far.type('prop').length === 0 && far.a.lastMove.taunt);
  // Cornered: back + T vaults over them, untouchable, to the open side.
  var esc = near({ t: true, left: true }, { ax: 70, dx: 115, frames: 60 });
  check('stage object: back + T vaults out of the corner', esc.type('prop').length === 1 && esc.type('prop')[0].use === 'escape' && esc.a.x > esc.d.x, [esc.a.x, esc.d.x]);
  // The opponent swings at them mid-vault: it goes through.
  var m = new FG.Match(S, D); m.step([raw({}), raw({})]); m.setProps(FG.stageProps('classroom'));
  m.fighters[0].x = 70; m.fighters[1].x = 115;
  var hitV = false;
  for (var i = 0; i < 40; i++) { m.step([raw(i === 0 ? { t: true, left: true } : {}), raw(i === 4 ? { k: true } : {})]); m.events.forEach(function (e) { if (e.type === 'hit' && e.defender === 0) hitV = true; }); }
  check('stage object: the vault is invulnerable', !hitV);
  check('stage objects: reset each round', (function () { m.reset(); return m.props.every(function (p) { return p.cool === 0; }); })());
})();

// The CPU uses its meter, Extra Credit and stage objects.
(function () {
  var counts = { enhance: 0, ultstart: 0, ulthit: 0, extracredit: 0, prop: 0 }, lopezUlt = 0;
  defs.forEach(function (d, k) {
    var m = new FG.Match(d, defs[(k + 3) % defs.length]); m.autoReset = false;
    m.setProps(FG.stageProps(FG.STAGES[k % FG.STAGES.length].id));
    var a = new FG.AI('hard', 11 + k), b = new FG.AI('hard', 99 + k);
    m.fighters[0].meter = m.fighters[1].meter = FG.C.METER_MAX;
    for (var i = 0; i < 60 * 70 && !m.over; i++) {
      m.step([a.input(m.fighters[0], m.fighters[1], m), b.input(m.fighters[1], m.fighters[0], m)]);
      m.events.forEach(function (e) {
        if (counts[e.type] != null) counts[e.type]++;
        if (e.type === 'ultimate' && m.fighters[e.attacker].def.id === 'lopez') lopezUlt++;
      });
    }
  });
  if (process.env.SHOW_AI) console.log('CPU meter use:', JSON.stringify(counts), 'LOPEZ counter ultimates:', lopezUlt);
  check('CPU: enhances specials', counts.enhance > 0, counts);
  check('CPU: lands ultimates', counts.ultstart > 0 && counts.ulthit > 0, counts);
  check('CPU: cashes in Extra Credit', counts.extracredit > 0, counts);
  // Cornered next to an object, with the opponent in its face: it vaults out.
  var esc = 0;
  for (var s2 = 0; s2 < 6 && !esc; s2++) {
    var m = new FG.Match(D, S); m.step([raw({}), raw({})]);
    m.setProps(FG.stageProps('classroom'));
    m.fighters[0].x = 470; m.fighters[1].x = 70; // the CPU (player 2) in the left corner
    var ai = new FG.AI('hard', 3 + s2);
    for (var i = 0; i < 300; i++) {
      m.step([raw({}), ai.input(m.fighters[1], m.fighters[0], m)]);
      if (i === 20) m.fighters[0].x = m.fighters[1].x + 60;
      m.events.forEach(function (e) { if (e.type === 'prop' && e.fighter === 1 && e.use === 'escape') esc++; });
    }
  }
  check('CPU: vaults out of the corner with a stage object', esc > 0, esc);
})();

// WILSON: Chain Rule, Sine Wave, Absolute Value, 29 YEARS, Seen It All, Stare.
(function () {
  var W = FG.fighterById('wilson'), B = FG.fighterById('brinkhus');
  check('WILSON is the ninth fighter and the boss', W && W.order === 9 && W.boss && FG.ROSTER[8] === W);
  function play2(a, b, dist, p1, p2, frames, setupFn) {
    var m = setup(a, b, dist), ev = [];
    if (setupFn) setupFn(m);
    for (var i = 0; i < (frames || 80); i++) {
      m.step([raw((typeof p1 === 'function' ? p1(i) : p1[i]) || {}), raw((typeof p2 === 'function' ? p2(i) : p2[i]) || {})]);
      ev = ev.concat(m.events);
    }
    return { m: m, ev: ev, hits: ev.filter(function (e) { return e.type === 'hit' && e.attacker === 0; }).map(function (e) { return e.move.id; }) };
  }
  // Chain Rule: P, P cancels into any of his moves (here F+H), but only once a string.
  var cr = play2(W, D, 40, { 0: { p: true }, 14: { p: true }, 28: FG.parseInput('F+H') }, {}, 90);
  check('Chain Rule: P, P cancels into anything', cr.hits.join() === 'jab,jab2,fH', cr.hits);
  var once = play2(W, D, 40, { 0: { p: true }, 14: { p: true }, 28: FG.parseInput('F+P'), 40: FG.parseInput('D+H') }, {}, 90);
  check('Chain Rule: once a string', once.hits.indexOf('launcher') < 0 || once.hits.indexOf('launcher') > 2 && once.m.combo[1].hits === 0, once.hits);
  check('Chain Rule: P, P, H is still the string ender', play2(W, D, 40, { 0: { p: true }, 14: { p: true }, 28: { h: true } }, {}, 90).hits.join() === 'jab,jab2,jabH');
  // Sine Wave: a high goes over him.
  var sw = play2(W, B, 50, { 0: FG.parseInput('F+K') }, { 2: { p: true } }, 60);
  check('Sine Wave dodges highs', sw.ev.every(function (e) { return !(e.type === 'hit' && e.attacker === 1); }) && sw.m.fighters[0].swayed !== undefined, sw.ev.map(function (e) { return e.type; }));
  // Absolute Value: their attack comes back at them, at least as hard.
  var av = play2(W, B, 44, { 8: FG.parseInput('B+H') }, { 0: { h: true } }, 90);
  var back = av.ev.filter(function (e) { return e.type === 'hit' && e.attacker === 0 && e.move.id === 'absCounter'; })[0];
  check('Absolute Value: parries and hits back as hard as what it caught', av.ev.some(function (e) { return e.type === 'parry'; }) && back && back.damage >= B.moves.heavy.damage, back && back.damage);
  // 29 YEARS: faster in round 2, stronger in round 3.
  function walked(exp) { return play2(W, D, 200, function () { return { right: true }; }, {}, 30, function (m) { m.fighters[0].experience = exp; }).m.fighters[0].x; }
  check('29 YEARS: faster from round 2', walked(1) > walked(0) + 5, [walked(0), walked(1)]);
  function jabDmg(exp) { var r = play2(W, D, 40, { 0: { p: true } }, {}, 30, function (m) { m.fighters[0].experience = exp; }); return r.ev.filter(function (e) { return e.type === 'hit'; })[0].damage; }
  check('29 YEARS: stronger in round 3', jabDmg(2) > jabDmg(1) && jabDmg(1) === jabDmg(0), [jabDmg(0), jabDmg(1), jabDmg(2)]);
  // Seen It All: the third time they start their favourite move, he counters it. Once a round.
  var seen = play2(D, W, 46, function (i) { return i % 60 === 0 && i < 300 ? { p: true } : {}; }, {}, 320);
  var sa = seen.ev.filter(function (e) { return e.type === 'parry' && e.label === 'SEEN IT ALL!'; });
  var landed = seen.ev.filter(function (e) { return e.type === 'hit' && e.attacker === 1 && e.move.id === 'seenCounter'; });
  check('Seen It All: counters their most-used move, once a round', sa.length === 1 && landed.length === 1 && seen.m.fighters[1].seenUsed, [sa.length, landed.length]);
  seen.m.reset();
  check('Seen It All: ready again next round', !seen.m.fighters[1].seenUsed && Object.keys(seen.m.fighters[1].seen).length === 0);
  // Stare: no taunt line, a second of standing still, a little meter; still counter-hittable.
  var st = play2(W, D, 120, { 0: { t: true } }, {}, 80);
  check('Stare: a little meter', st.ev.some(function (e) { return e.type === 'stare'; }) && Math.round(st.m.fighters[0].meter) === FG.C.STARE_METER, st.m.fighters[0].meter);
  var punished = play2(W, D, 40, { 0: { t: true } }, { 10: { p: true } }, 40);
  check('Stare: leaves him open', punished.ev.some(function (e) { return e.type === 'hit' && e.attacker === 1 && e.ch; }));
  // Arcade: WILSON is the final boss, PEDERSEN right before him.
})();

// Controls respond on the frame they're pressed: attacks, guard, crouch, sidestep,
// walking and turning round all take effect in the step that reads the press.
(function () {
  defs.forEach(function (d) {
    var tag = d.name + ' controls: ';
    function fresh() { var m = setup(d, D, 120); for (var i = 0; i < 4; i++) m.step([raw({}), raw({})]); return m; }
    var m = fresh(); m.step([raw({ p: true }), raw({})]);
    check(tag + 'an attack starts on the press frame', m.fighters[0].state === 'attack' && m.fighters[0].moveFrame === 1, [m.fighters[0].state, m.fighters[0].moveFrame]);
    m = fresh(); m.step([raw({ down: true }), raw({})]);
    check(tag + 'crouching is immediate', m.fighters[0].state === 'crouch');
    m = fresh(); m.step([raw({ ssIn: true }), raw({})]);
    check(tag + 'sidestepping is immediate', m.fighters[0].state === 'sidestep');
    m = fresh(); var x0 = m.fighters[0].x; m.step([raw({ right: true }), raw({})]);
    check(tag + 'walking starts at full speed', m.fighters[0].state === 'walkF' && m.fighters[0].x > x0 && Math.abs(m.fighters[0].vx) >= d.walkF * 0.99, m.fighters[0].vx);
    m = fresh(); m.step([raw({ up: true }), raw({})]);
    check(tag + 'a jump starts at once', m.fighters[0].state === 'prejump');
  });
  // Turning round: the moment they're on the other side.
  var m = setup(S, D, 60);
  m.step([raw({}), raw({})]);
  m.fighters[1].x = m.fighters[0].x - 30; // they've crossed over
  m.step([raw({}), raw({})]);
  check('controls: turning round is immediate', m.fighters[0].facing === -1 && m.fighters[1].facing === 1, [m.fighters[0].facing, m.fighters[1].facing]);
  // Guard: holding back blocks an attack that lands the very next frame.
  var g2 = setup(S, D, 40), r = [], jab = D.moves.jab;
  for (var i = 0; i < 30; i++) {
    g2.step([raw(i >= jab.startup - 2 ? { left: true } : {}), raw(i === 0 ? { p: true } : {})]);
    r = r.concat(g2.events);
  }
  check('controls: back held just before the hit still guards', r.some(function (e) { return e.type === 'block' && e.defender === 0; }), r.map(function (e) { return e.type; }));
})();


// =========================== Students =========================================
// Projectiles (only students throw things), teleports and each student's signature.
(function () {
  var MA = FG.fighterById('mateus'), P = FG.fighterById('pedersen');
  if (!MA) return;
  function evs(m, frames, fn) { var out = []; for (var i = 0; i < frames; i++) { var r = fn(i, m); m.step([raw(r[0] || {}), raw(r[1] || {})]); out = out.concat(m.events); } return out; }
  function types(list) { return list.map(function (e) { return e.type; }); }
  var students = defs.filter(function (d) { return d.side === 'student'; }), teachers = defs.filter(function (d) { return d.side === 'teacher'; });
  var PLANNED = ['mateus', 'nicolas', 'max', 'jack', 'hudson'];
  check('the students are the ones in ROSTER.md', teachers.length === 9 && students.length >= 1 && students.every(function (s, k) { return s.id === PLANNED[k]; }), students.map(function (s) { return s.id; }));
  check('students are smaller than every teacher', students.every(function (s) { return teachers.every(function (t) { return s.scale < t.scale; }); }), students.map(function (s) { return s.scale; }));
  check('only students throw projectiles', defs.every(function (d) {
    var has = Object.keys(d.moves).some(function (id) { return !!d.moves[id].projectile; });
    return d.side === 'student' ? has : !has;
  }));
  // Every student's projectiles: frame data at point-blank range like any strike.
  students.forEach(function (d) {
    Object.keys(d.moves).forEach(function (id) {
      var mv = d.moves[id], press = INPUT[id];
      if (!mv.projectile || mv.enhanced || !press) return;
      var tag = d.name + ' ' + id + ' (projectile) ';
      var guard = FG.projectileLevel({ move: mv, y: (mv.projectile.y || 40) * d.scale, h: mv.projectile.h }) === 'low' ? { right: true, down: true } : { right: true };
      var r = exchange(d, P, 40, [press], guard);
      check(tag + 'is blocked up close', types(r.events).indexOf('block') >= 0 && r.m.lastResult[0] && r.m.lastResult[0].adv === mv.block, { ev: types(r.events), got: r.m.lastResult[0] && r.m.lastResult[0].adv, want: mv.block });
      r = exchange(d, P, 40, [press], {});
      check(tag + 'hits up close', types(r.events).indexOf('hit') >= 0 && r.m.fighters[1].health === P.health - mv.damage, [types(r.events), r.m.fighters[1].health]);
      if (!mv.hit.knockdown && !mv.hit.launch) check(tag + 'hit adv up close', r.m.lastResult[0] && r.m.lastResult[0].adv === mv.hit.adv, { got: r.m.lastResult[0] && r.m.lastResult[0].adv, want: mv.hit.adv });
      // From across the screen it still gets there.
      var far = setup(d, P, 220), e = evs(far, 160, function (i) { return [i === 0 ? press : {}]; });
      check(tag + 'reaches them from across the screen', e.some(function (x) { return x.type === 'hit' && x.projectile; }) || e.some(function (x) { return x.type === 'fizzle'; }), types(e));
    });
  });

  // Gnome Toss: it flies, lands, and tumbles along the floor as a low.
  var m = setup(MA, P, 300); m.fighters[1].holdGuard = true; // guard in place
  var e = evs(m, 140, function (i) { return [i === 0 ? { p: true, left: true } : {}, { right: true }]; });
  check('gnome toss: a projectile leaves his hand', e.some(function (x) { return x.type === 'projectile' && x.kind === 'gnome'; }), types(e));
  check('gnome toss: rolling along the floor it beats a standing guard', e.some(function (x) { return x.type === 'hit' && x.projectile === 'gnome' && x.level === 'low'; }), e.filter(function (x) { return x.type === 'hit' || x.type === 'block'; }).map(function (x) { return x.type + ':' + x.level; }));
  m = setup(MA, P, 300); m.fighters[1].holdGuard = true;
  e = evs(m, 140, function (i) { return [i === 0 ? { p: true, left: true } : {}, i >= 50 ? { right: true, down: true } : {}]; });
  check('gnome toss: a crouching guard blocks it on the floor', e.some(function (x) { return x.type === 'block' && x.projectile === 'gnome'; }), types(e));
  // One at a time: with the gnome still out, B+P is a jab.
  m = setup(MA, P, 400); evs(m, 20, function (i) { return [i === 0 ? { p: true, left: true } : {}]; });
  check('gnome toss: one on screen at a time', m.projectiles.length === 1, m.projectiles.length);
  m.fighters[0].setState('idle');
  evs(m, 1, function () { return [{ p: true, left: true }]; });
  check('gnome toss: with one out, B+P is a jab', m.fighters[0].move && m.fighters[0].move.id === 'jab', m.fighters[0].move && m.fighters[0].move.id);
  // A sidestep lets it go by.
  m = setup(MA, P, 70); e = evs(m, 80, function (i) { return [i === 0 ? { p: true, left: true } : {}, i === 12 ? { ssIn: true } : {}]; });
  check('a sidestep dodges a projectile', !e.some(function (x) { return x.type === 'hit' || x.type === 'block'; }), types(e));
  // Two projectiles that meet cancel out.
  m = setup(MA, MA, 300); e = evs(m, 120, function (i) { return [i === 0 ? { p: true, left: true } : {}, i === 0 ? { p: true, right: true } : {}]; });
  check('two projectiles cancel each other out', e.some(function (x) { return x.type === 'clash'; }) && !e.some(function (x) { return x.type === 'hit'; }), types(e));
  // Lawn Statue knocks one away.
  m = setup(MA, MA, 160); e = evs(m, 120, function (i) { return [i === 0 ? { p: true, left: true } : {}, i >= 10 && i < 60 ? { h: true, right: true } : {}]; });
  check('lawn statue knocks a projectile away', e.some(function (x) { return x.type === 'deflect'; }) && m.fighters[1].health === MA.health, [types(e), m.fighters[1].health]);
  // Highs sail over a crouch, lows can't be blocked standing (checked above).

  // Lawn Statue: attack him while he's frozen and he pops out and counters; a throw beats it.
  m = setup(MA, P, 44); e = evs(m, 80, function (i) { return [i < 30 ? { h: true, left: true } : {}, i === 8 ? { p: true } : {}]; });
  var pr = e.filter(function (x) { return x.type === 'parry'; })[0];
  check('lawn statue: a strike into it gets countered', pr && pr.counter === 'statuePop' && e.some(function (x) { return x.type === 'hit' && x.attacker === 0 && x.move.id === 'statuePop'; }), types(e));
  m = setup(MA, P, 44); var held = 0;
  evs(m, 60, function (i, mm) { if (mm.fighters[0].state === 'attack' && mm.fighters[0].move.id === 'bH') held = i; return [{ h: true, left: true }]; });
  check('lawn statue: holding H keeps him frozen longer', held > MA.moves.bH.total, held);
  m = setup(MA, P, 40); e = evs(m, 80, function (i) { return [i < 30 ? { h: true, left: true } : {}, i === 8 ? { p: true, k: true } : {}]; });
  check('lawn statue: a throw beats it', e.some(function (x) { return x.type === 'grab' && x.attacker === 1; }) && !e.some(function (x) { return x.type === 'parry'; }), types(e));

  // Pop-Up: gone underground (no hurtbox), then right next to them, on the same side.
  m = setup(MA, P, 260); var hidden = false, x0 = m.fighters[0].x;
  e = evs(m, 60, function (i, mm) { if (mm.fighters[0].state === 'attack' && mm.fighters[0].moveFrame === 12 && !mm.fighters[0].hurtboxes().length) hidden = true; return [i === 0 ? { p: true, down: true } : {}]; });
  var tp = e.filter(function (x) { return x.type === 'teleport'; })[0];
  check('pop-up: vanishes underground', hidden);
  check('pop-up: comes up right in front of them', tp && !tp.behind && Math.abs(tp.opp - tp.x) < 45 && tp.x < tp.opp, tp);
  check('pop-up: and hits them', e.some(function (x) { return x.type === 'hit' && x.move.id === 'dP'; }), types(e));
  // Enhanced: behind them, sides switched.
  m = setup(MA, P, 260); m.fighters[0].meter = 100;
  e = evs(m, 60, function (i) { return [i === 0 ? { p: true, down: true } : i === 3 ? { p: true, k: true } : {}]; });
  tp = e.filter(function (x) { return x.type === 'teleport'; })[0];
  check('pop-up+: comes up behind them', tp && tp.behind && m.fighters[0].x > m.fighters[1].x, tp);

  // JACK: the paper airplane curves up, the nose dive skims the floor as a low, and Seat
  // Swap switches sides.
  var JA = FG.fighterById('jack');
  if (JA) {
    m = setup(JA, P, 300); var ys = [];
    evs(m, 60, function (i, mm) { if (mm.projectiles[0]) ys.push(mm.projectiles[0].y); return [i === 0 ? { p: true, left: true } : {}]; });
    check('paper airplane: curves up', ys.length > 20 && ys[ys.length - 1] > ys[0] + 10, [ys[0], ys[ys.length - 1]]);
    m = setup(JA, P, 330); m.fighters[1].holdGuard = true;
    e = evs(m, 120, function (i) { return [i === 0 ? { p: true, down: true } : {}, i >= 4 ? { right: true } : {}]; });
    check('nose dive: on the floor it beats a standing guard', e.some(function (x) { return x.type === 'hit' && x.projectile === 'plane' && x.level === 'low'; }), types(e));
    m = setup(JA, P, 60);
    e = evs(m, 40, function (i) { return [i === 0 ? { h: true, left: true } : {}]; });
    tp = e.filter(function (x) { return x.type === 'teleport'; })[0];
    check('seat swap: switches sides', tp && tp.behind && m.fighters[0].x > m.fighters[1].x, tp);
  }

  // HUDSON: Show Your Work catches highs and mids (not lows) and counters; Pop-Up Error
  // opens in front of them, never past them, and can't hit until it has opened; every
  // hit of Calculator Combo shows its number.
  var HU = FG.fighterById('hudson');
  if (HU) {
    m = setup(HU, P, 44); e = evs(m, 80, function (i) { return [i === 4 ? { h: true, left: true } : {}, i === 0 ? { p: true } : {}]; });
    pr = e.filter(function (x) { return x.type === 'parry'; })[0];
    check('show your work: a strike gets caught and countered', pr && pr.counter === 'checkWork' && e.some(function (x) { return x.type === 'hit' && x.attacker === 0 && x.move.id === 'checkWork' && x.launch; }), types(e));
    m = setup(HU, P, 44); e = evs(m, 80, function (i) { return [i === 8 ? { h: true, left: true } : {}, i === 0 ? { k: true, down: true } : {}]; });
    check('show your work: lows go through it', !e.some(function (x) { return x.type === 'parry'; }) && e.some(function (x) { return x.type === 'hit' && x.attacker === 1; }), types(e));
    m = setup(HU, P, 300); var x0 = m.fighters[0].x, born = null, hitAt = null;
    e = evs(m, 80, function (i, mm) { mm.events.forEach(function (x) { if (x.type === 'projectile') born = i; if (x.type === 'hit' && x.projectile) hitAt = i; }); return [i === 0 ? { p: true, left: true } : {}]; });
    var pe = e.filter(function (x) { return x.type === 'projectile'; })[0];
    check('pop-up error: opens 150 ahead, not flying there', pe && pe.kind === 'error' && Math.abs(pe.x - x0 - 150 * HU.scale) < 2, pe && pe.x - x0);
    m = setup(HU, P, 70); x0 = m.fighters[0].x;
    e = evs(m, 80, function (i, mm) { mm.events.forEach(function (x) { if (x.type === 'projectile') born = i; if (x.type === 'hit' && x.projectile) hitAt = i; }); return [i === 0 ? { p: true, left: true } : {}]; });
    pe = e.filter(function (x) { return x.type === 'projectile'; })[0];
    check('pop-up error: never opens past them', pe && pe.x <= m.fighters[1].x + 1 && pe.x > x0 + 50, pe && [pe.x - x0, m.fighters[1].x - x0]);
    check('pop-up error: hits only once it has opened', born != null && hitAt != null && hitAt - born >= HU.moves.bP.projectile.arm, [born, hitAt]);
    m = setup(HU, P, 70);
    e = evs(m, 80, function (i) { return [i === 0 ? { p: true, left: true } : {}, i >= 4 ? { down: true } : {}]; });
    check('pop-up error: a crouch ducks it', !e.some(function (x) { return (x.type === 'hit' || x.type === 'block') && x.projectile; }), types(e));
    var calc = HU.combos.filter(function (c) { return c.name === 'CALCULATOR COMBO'; })[0], cr = FG.runCombo(HU, P, { plan: calc.plan, hits: calc.hits });
    check('calculator combo: 1, +2, +3, =6, one number per hit', cr.trueCombo && cr.hits.map(function (id) { return HU.moves[id].hitText; }).join(' ') === '1 +2 +3 =6', cr.hits);
  }
})();

console.log(passes + ' passed, ' + failures + ' failed');
process.exit(failures ? 1 : 0);
