// Browser smoke test: opens index.html straight from disk (file://) in headless
// Chromium, checks for console errors, drives a few inputs and saves screenshots.
// Run with: node tests/smoke.js [outDir]   (needs Playwright installed)
var path = require('path');
var playwright;
try { playwright = require('playwright'); } catch (e) {
  console.error('Playwright is not installed (npm i -g playwright, or set NODE_PATH to where it is).');
  process.exit(2);
}

(async function () {
  var out = process.argv[2] || path.join(__dirname, 'out');
  require('fs').mkdirSync(out, { recursive: true });
  var browser = await playwright.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  var page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  var errors = [];
  page.on('console', function (m) { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', function (e) { errors.push('pageerror: ' + e.message); });

  var url = 'file://' + path.resolve(__dirname, '..', 'index.html');
  await page.goto(url);
  // Title screen first: check the name, then press Enter to start training mode.
  await page.waitForFunction(function () { return window.FG_TITLE && window.FG_TITLE.t > 10; }, null, { timeout: 15000 });
  var title = await page.title();
  await page.screenshot({ path: path.join(out, '0-title.png') });
  await page.keyboard.press('Enter');      // PRESS ENTER: the main menu
  await page.keyboard.press('ArrowDown');  // ARCADE > VERSUS
  await page.keyboard.press('ArrowDown');  // > TRAINING
  await page.screenshot({ path: path.join(out, '0-menu.png') });
  await page.keyboard.press('Enter');
  // Character select: the first two fighters on the roster.
  await page.waitForFunction(function () { return window.FG_SELECT && window.FG_SELECT.sys.isActive() && window.FG_SELECT.t > 10; }, null, { timeout: 15000 });
  await page.screenshot({ path: path.join(out, '0-select.png') });
  await page.keyboard.press('Enter'); // P1: the cursor starts on the first fighter
  await page.keyboard.press('Enter'); // opponent: the cursor starts on the second
  // Stage select: player 2's home stage is highlighted.
  await page.waitForFunction(function () { return window.FG_STAGE && window.FG_STAGE.sys.isActive() && window.FG_STAGE.t > 10; }, null, { timeout: 15000 });
  await page.screenshot({ path: path.join(out, '0-stage.png') });
  var stagePick = await page.evaluate(function () { return window.FG_STAGE.current(); });
  await page.keyboard.press('Enter');
  // The round intro opens on the VS cut-in panel.
  await page.waitForFunction(function () { return window.FG_SCENE && window.FG_SCENE.intro; }, null, { timeout: 15000 });
  var vsPanel = await page.evaluate(function () { var c = window.FG_SCENE.cutin.active; return !!(c && c.kind === 'vs'); });
  // Round intro, then skip the rest of it.
  await page.waitForFunction(function () { return window.FG_SCENE && window.FG_SCENE.intro && window.FG_SCENE.intro.t > 30; }, null, { timeout: 15000 });
  await page.screenshot({ path: path.join(out, '0-intro.png') });
  var matchup = await page.evaluate(function () { var f = window.FG_SCENE.match.fighters; return f[0].def.id + ' vs ' + f[1].def.id; });
  var expectMatchup = await page.evaluate(function () { return FG.ROSTER[0].id + ' vs ' + FG.ROSTER[1].id; });
  await page.keyboard.press('Enter');
  await page.waitForFunction(function () { return window.FG_SCENE && !window.FG_SCENE.intro && window.FG_SCENE.tickCount > 30; }, null, { timeout: 15000 });
  // A cut-in freezes the fight while it plays, then the fight goes on.
  var cutFreeze = await page.evaluate(function () {
    var s = window.FG_SCENE, f0 = s.match.frame;
    s.playCutIn(0, 'TEST');
    for (var i = 0; i < 10; i++) s.tick();
    var frozen = s.match.frame === f0 && s.cutin.busy();
    for (i = 0; i < 40; i++) s.tick();
    return frozen && !s.cutin.busy() && s.match.frame > f0;
  });
  var renderer = await page.evaluate(function () { return FG.game.renderer.type === Phaser.WEBGL ? 'WEBGL' : 'CANVAS'; });
  await page.screenshot({ path: path.join(out, '1-start.png') });

  // Hide the overlay, show hitboxes, and run a scripted air combo through the real scene:
  // launcher, jump cancel, air P > air K > air H (bound), then a mid kick after the bounce.
  await page.keyboard.press('KeyC');
  await page.keyboard.press('Digit2');
  await page.evaluate(function () {
    var s = window.FG_SCENE;
    s.newMatch();
    s.match.fighters[0].x = 480; s.match.fighters[1].x = 520;
    var f0 = s.match.frame, fired = {};
    // P1's longest timed combo route (they all work against every opponent).
    var route = s.match.fighters[0].def.combos.filter(function (c) { return c.plan && !c.wall; })
      .sort(function (a, b) { return b.hits.length - a.hits.length; })[0];
    window.EXPECT_HITS = route.hits.join();
    var plan = {};
    Object.keys(route.plan).forEach(function (f) { plan[f] = FG.parseInput(route.plan[f]); });
    window.HITS = [];
    // Route frames are game frames (hitstop doesn't count), like FG.runCombo.
    s.forceInput = function () {
      var t = s.match.frame - f0, p = !fired[t] && plan[t];
      if (p) fired[t] = true;
      return [p || FG.emptyRaw(), null];
    };
    var orig = s.hud.onEvent.bind(s.hud);
    s.hud.onEvent = function (ev) { if (ev.type === 'hit') window.HITS.push(ev.move.id); orig(ev); };
  });
  await page.waitForFunction(function () { return window.HITS.length >= 1; }, null, { timeout: 5000 });
  await page.waitForTimeout(60);
  await page.screenshot({ path: path.join(out, '2-launch.png') });
  await page.waitForFunction(function () { return window.HITS.length >= 3; }, null, { timeout: 8000 });
  await page.waitForTimeout(30);
  await page.screenshot({ path: path.join(out, '3-air-combo.png') });
  await page.waitForFunction(function () { return window.HITS.length >= window.EXPECT_HITS.split(',').length; }, null, { timeout: 8000 });
  var hits = await page.evaluate(function () { return window.HITS.slice(); });
  await page.waitForTimeout(50);
  var counterText = await page.evaluate(function () { return window.FG_SCENE.hud.counter[0].num.text; });
  var expectHits = await page.evaluate(function () { return window.EXPECT_HITS; });

  // Real keyboard input: walk P1 forward then jab into a standing-guard dummy.
  await page.evaluate(function () { var s = window.FG_SCENE; s.forceInput = null; s.newMatch(); s.dummy.settings.stance = 4; s.training.showBoxes = false; });
  await page.keyboard.down('KeyD');
  await page.waitForFunction(function () { var f = window.FG_SCENE.match.fighters; return f[1].x - f[0].x < 45; }, null, { timeout: 8000 });
  await page.keyboard.up('KeyD');
  await page.keyboard.press('KeyJ');
  await page.waitForFunction(function () { return !!window.FG_SCENE.match.lastResult[0]; }, null, { timeout: 5000 });
  await page.screenshot({ path: path.join(out, '4-block.png') });
  var p1 = await page.evaluate(function () { var m = window.FG_SCENE.match; var r = m.lastResult[0]; return { x: m.fighters[0].x, last: r && { move: r.move.id, kind: r.kind, adv: r.adv }, jabBlock: m.fighters[0].def.moves.jab.block, hp2: m.fighters[1].health }; });

  // Training menu: Esc opens it and pauses the fight; arrows change a setting; Esc closes.
  await page.keyboard.press('Escape');
  var menu1 = await page.evaluate(function () { var s = window.FG_SCENE; return { open: s.menu.open, tick: s.tickCount, stance: s.dummy.label('stance') }; });
  await page.waitForTimeout(250);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await page.screenshot({ path: path.join(out, '5-menu.png') });
  var menu2 = await page.evaluate(function () { var s = window.FG_SCENE; return { tick: s.tickCount, stance: s.dummy.label('stance') }; });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100); // keys are handled on the next game step
  var menuOk = menu1.open && menu2.tick === menu1.tick && menu2.stance !== menu1.stance &&
    !(await page.evaluate(function () { return window.FG_SCENE.menu.open; }));

  // On-screen RESET button: move P1, click it, and P1 is back at the start.
  await page.evaluate(function () { window.FG_SCENE.match.fighters[0].x = 300; });
  var box = await page.locator('canvas').boundingBox();
  var sx = box.width / 640, sy = box.height / 360;
  await page.mouse.click(box.x + (320 + 66) * sx, box.y + 51 * sy);
  await page.waitForTimeout(100);
  var resetX = await page.evaluate(function () { return window.FG_SCENE.match.fighters[0].x; });
  var resetOk = Math.abs(resetX - (1040 / 2 - 90)) < 5;
  await page.screenshot({ path: path.join(out, '6-training.png') });

  // Combo trials: 7 turns them on; landing the first (easy) route checks it off.
  await page.keyboard.press('Digit7');
  var trial = await page.evaluate(function () {
    var s = window.FG_SCENE, tr = s.trials, c = tr.current(), m = s.match;
    m.fighters[0].x = 480; m.fighters[1].x = 520;
    var f0 = m.frame, fired = {};
    var first = { active: tr.active, title: tr.title.text, name: c.name };
    s.forceInput = function () {
      var t = m.frame - f0, p = !fired[t] && c.plan && c.plan[t];
      if (p) fired[t] = true;
      return [p ? FG.parseInput(p) : FG.emptyRaw(), null];
    };
    var completed = false;
    for (var i = 0; i < 200 && !completed; i++) { s.tick(); if (tr.status && tr.status.complete) completed = true; }
    s.render();
    s.forceInput = null;
    first.completed = completed;
    first.done = !!tr.done[tr.key(c)];
    return first;
  });
  await page.screenshot({ path: path.join(out, '7-trial.png') });
  await page.keyboard.press('Digit7');
  var trialOk = trial.active && /COMBO TRIAL 1\//.test(trial.title) && trial.completed && trial.done &&
    !(await page.evaluate(function () { return window.FG_SCENE.trials.active; }));

  // A round-winning hit zooms the world camera in and plays in slow motion; the HUD
  // (drawn by its own camera) doesn't zoom.
  var ko = await page.evaluate(function () {
    var s = window.FG_SCENE, m;
    s.training.refill = false; s.newMatch(); m = s.match;
    m.fighters[0].x = 480; m.fighters[1].x = 520; m.fighters[1].health = 2;
    var seen = null;
    for (var t = 0; t < 120 && !seen; t++) {
      var r1 = t === 0 ? FG.parseInput('P') : FG.emptyRaw();
      s.forceInput = function () { return [r1, FG.emptyRaw()]; };
      s.tick(); s.render();
      if (m.fighters[1].ko) seen = { slow: !!s.slowmo, zoom: s.cameras.main.zoom, ui: s.uiCam.zoom };
    }
    s.forceInput = null; s.training.refill = true;
    return seen;
  });
  var koOk = !!ko && ko.slow && ko.ui === 1;
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(out, '8-ko.png') });

  // Arcade: a CPU opponent, ROUND 1 / READY / FIGHT, a timer, best of three.
  var arcade = await page.evaluate(function () {
    var s = window.FG_SCENE;
    s.scene.start('fight', FG.arcadeStart(FG.ROSTER[1].id));
    return true;
  });
  await page.waitForFunction(function () { var s = window.FG_SCENE; return s && s.sys.isActive() && s.mode === 'arcade' && s.intro; }, null, { timeout: 15000 });
  arcade = await page.evaluate(function () {
    var s = window.FG_SCENE, out = {};
    s.sys.sceneUpdate = function () { s.render(); };
    s.endIntro();
    out.announce = s.phase;
    for (var i = 0; i < 100; i++) s.tick();
    out.phase = s.phase;
    out.timer = s.hud.vs.text;
    var x0 = s.match.fighters[1].x, st0 = s.match.fighters[1].state, moved = false;
    for (i = 0; i < 240; i++) { s.tick(); if (s.match.fighters[1].x !== x0 || s.match.fighters[1].state !== st0) moved = true; }
    out.cpuMoves = moved;
    // Win round 1 by K.O.
    s.match.dealDamage(0, 1, 9999); // K.O.
    for (i = 0; i < 400 && s.rounds.round === 1; i++) s.tick();
    out.round = s.rounds.round; out.wins = s.rounds.wins.slice();
    // Win round 2 by K.O. too: the finisher window opens; enter the command.
    for (i = 0; i < 300 && s.phase !== 'fight'; i++) s.tick();
    s.match.dealDamage(0, 1, 9999);
    for (i = 0; i < 300 && !s.finishWin; i++) s.tick();
    out.window = !!s.finishWin;
    var cmd = s.match.fighters[0].def.finisher.input.split(/,\s*/), k = 0, T0 = s.tickCount;
    s.forceInput = function (tc) { var j = tc - T0; if (j % 4 || k >= cmd.length) return [FG.emptyRaw(), null]; return [FG.parseInput(cmd[k++]), null]; };
    for (i = 0; i < 60 && !s.finisher; i++) s.tick();
    out.finisher = !!s.finisher;
    for (i = 0; i < 900 && !s.win; i++) s.tick();
    s.forceInput = null;
    out.finisherWin = !!(s.win && s.win.finisher);
    s.render();
    return out;
  });
  await page.screenshot({ path: path.join(out, '9-arcade.png') });
  var arcadeOk = arcade.announce === 'announce' && arcade.phase === 'fight' && /^\d+$/.test(arcade.timer) && arcade.cpuMoves && arcade.round === 2 && arcade.wins.join() === '1,0' &&
    arcade.window && arcade.finisher && arcade.finisherWin;

  // The attract demo from the title: two CPU fighters; a key press goes back.
  await page.evaluate(function () { window.FG_SCENE.scene.start('title'); });
  await page.waitForFunction(function () { return window.FG_TITLE && window.FG_TITLE.sys.isActive() && window.FG_TITLE.t > 5; }, null, { timeout: 15000 });
  await page.evaluate(function () { window.FG_TITLE.demo(); });
  await page.waitForFunction(function () { var s = window.FG_SCENE; return s && s.sys.isActive() && s.mode === 'attract' && s.tickCount > 30; }, null, { timeout: 15000 });
  await page.keyboard.press('KeyX');
  await page.waitForFunction(function () { return window.FG_TITLE && window.FG_TITLE.sys.isActive(); }, null, { timeout: 15000 });
  var attractOk = true;

  // The arcade ending.
  await page.evaluate(function () { window.FG_TITLE.scene.start('ending', { p1: 'pedersen', ladder: ['a', 'b'], continues: 1, started: Date.now() - 65000 }); });
  await page.waitForFunction(function () { return window.FG_ENDING && window.FG_ENDING.sys.isActive() && window.FG_ENDING.t > 30; }, null, { timeout: 15000 });
  await page.screenshot({ path: path.join(out, '10-ending.png') });

  await browser.close();
  console.log(JSON.stringify({ title: title, matchup: matchup, renderer: renderer, hits: hits, counter: counterText, p1: p1, menuOk: menuOk, resetX: resetX, trial: trial, ko: ko, stage: stagePick, arcade: arcade, vsPanel: vsPanel, cutFreeze: cutFreeze, errors: errors }, null, 1));
  var ok = !errors.length && title === 'Mortal Calculus: C221' && matchup === expectMatchup && hits.join() === expectHits && counterText === String(hits.length) &&
    p1.last && p1.last.kind === 'BLOCK' && p1.last.adv === p1.jabBlock && menuOk && resetOk && trialOk && koOk && stagePick === 'classroom' && arcadeOk && attractOk && vsPanel && cutFreeze;
  console.log(ok ? 'SMOKE OK' : 'SMOKE FAILED');
  if (!ok) process.exit(1);
})().catch(function (e) { console.error(e); process.exit(1); });
