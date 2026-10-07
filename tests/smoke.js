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
  await page.waitForFunction(function () { return window.FG_SCENE && window.FG_SCENE.tickCount > 30; }, null, { timeout: 15000 });
  var renderer = await page.evaluate(function () { return FG.game.renderer.type === Phaser.WEBGL ? 'WEBGL' : 'CANVAS'; });
  await page.screenshot({ path: path.join(out, '1-start.png') });

  // Hide the overlay, show hitboxes, and run a scripted air combo through the real scene:
  // launcher, jump cancel, air P > air K > air H (bound), then a mid kick after the bounce.
  await page.keyboard.press('KeyC');
  await page.keyboard.press('Digit2');
  await page.evaluate(function () {
    var s = window.FG_SCENE;
    s.newMatch();
    s.match.fighters[0].x = 500; s.match.fighters[1].x = 540;
    var start = s.tickCount;
    var plan = { 0: { h: true, down: true }, 16: { up: true }, 28: { p: true }, 34: { k: true }, 44: { h: true }, 102: { k: true } };
    window.HITS = [];
    s.forceInput = function (t) {
      var i = t - start, r = FG.emptyRaw(), p = plan[i];
      if (p) for (var k in p) r[k] = p[k];
      return [r, null];
    };
    var orig = s.hud.onEvent.bind(s.hud);
    s.hud.onEvent = function (ev) { if (ev.type === 'hit') window.HITS.push(ev.move.id); orig(ev); };
  });
  await page.waitForFunction(function () { return window.HITS.length >= 1; }, null, { timeout: 5000 });
  await page.waitForTimeout(60);
  await page.screenshot({ path: path.join(out, '2-launch.png') });
  await page.waitForFunction(function () { return window.HITS.length >= 4; }, null, { timeout: 8000 });
  await page.waitForTimeout(30);
  await page.screenshot({ path: path.join(out, '3-air-combo.png') });
  await page.waitForFunction(function () { return window.HITS.length >= 5; }, null, { timeout: 8000 });
  var hits = await page.evaluate(function () { return window.HITS.slice(); });

  // Real keyboard input: walk P1 forward then jab into a standing-guard dummy.
  await page.evaluate(function () { var s = window.FG_SCENE; s.forceInput = null; s.newMatch(); while (s.dummy.mode().id !== 'guard') s.dummy.cycle(); s.showBoxes = false; });
  await page.keyboard.down('KeyD');
  await page.waitForFunction(function () { var f = window.FG_SCENE.match.fighters; return f[1].x - f[0].x < 45; }, null, { timeout: 8000 });
  await page.keyboard.up('KeyD');
  await page.keyboard.press('KeyJ');
  await page.waitForFunction(function () { return !!window.FG_SCENE.match.lastResult[0]; }, null, { timeout: 5000 });
  await page.screenshot({ path: path.join(out, '4-block.png') });
  var p1 = await page.evaluate(function () { var m = window.FG_SCENE.match; var r = m.lastResult[0]; return { x: m.fighters[0].x, last: r && { move: r.move.id, kind: r.kind, adv: r.adv }, hp2: m.fighters[1].health }; });

  await browser.close();
  console.log(JSON.stringify({ renderer: renderer, hits: hits, p1: p1, errors: errors }, null, 1));
  var ok = !errors.length && hits.join() === 'launcher,airP,airK,airH,mid' &&
    p1.last && p1.last.kind === 'BLOCK' && p1.last.adv === 1;
  console.log(ok ? 'SMOKE OK' : 'SMOKE FAILED');
  if (!ok) process.exit(1);
})().catch(function (e) { console.error(e); process.exit(1); });
