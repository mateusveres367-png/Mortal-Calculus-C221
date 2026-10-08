// Touch controls for phones and tablets: a d-pad and four big buttons over the game.
// They send the same keys player 1 uses on a keyboard (WASD, J K L, T, Enter, Esc),
// so every screen works as it does with keys. Shown on touch devices (or with
// ?touch=1 in the address). The ★ button does the right big thing for you:
//   ultimate (full meter: it does the motion), Extra Credit (when it's there),
//   a stage object (when you're next to one), a power-up (in a special's startup
//   with a bar), otherwise a throw. Outside a fight it confirms.
(function () {
  var KEYS = {
    KeyW: ['w', 87], KeyA: ['a', 65], KeyS: ['s', 83], KeyD: ['d', 68],
    KeyJ: ['j', 74], KeyK: ['k', 75], KeyL: ['l', 76], KeyT: ['t', 84],
    Enter: ['Enter', 13], Escape: ['Escape', 27]
  };
  var Touch = FG.Touch = {
    on: /[?&]touch=1/.test(location.search) || (('ontouchstart' in window || navigator.maxTouchPoints > 0) && !/[?&]touch=0/.test(location.search)),
    held: {}
  };

  // A synthetic key event, as the keyboard would send it (Phaser reads keyCode).
  function send(type, code) {
    var k = KEYS[code], ev = new KeyboardEvent(type, { key: k[0], code: code, bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'keyCode', { get: function () { return k[1]; } });
    Object.defineProperty(ev, 'which', { get: function () { return k[1]; } });
    window.dispatchEvent(ev);
  }
  function down(code) { if (Touch.held[code]) return; Touch.held[code] = true; send('keydown', code); }
  function up(code) { if (!Touch.held[code]) return; Touch.held[code] = false; send('keyup', code); }
  function tap(codes, ms) { codes.forEach(down); setTimeout(function () { codes.forEach(up); }, ms || 60); }
  Touch.send = send; Touch.down = down; Touch.up = up;

  // The fight player 1 is in right now, if any.
  function fight() {
    var s = window.FG_SCENE;
    return s && s.sys && s.sys.isActive() && !s.intro && !s.win && !s.menu.open && s.match ? s : null;
  }

  // ★: the smart button.
  function star() {
    var s = fight();
    if (!s) { tap(['Enter']); return; }
    var f = s.match.fighters[0], fwd = f.facing > 0 ? 'KeyD' : 'KeyA', back = f.facing > 0 ? 'KeyA' : 'KeyD';
    if (f.def.moves.ultimate && f.meter >= FG.C.METER_MAX) {
      // Down, down-forward, forward + P+K+H, a couple of frames each.
      var steps = [['KeyS'], ['KeyS', fwd], [fwd, 'KeyJ', 'KeyK', 'KeyL']];
      steps.forEach(function (codes, i) {
        setTimeout(function () {
          ['KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyK', 'KeyL'].forEach(function (c) { if (codes.indexOf(c) < 0) up(c); });
          codes.forEach(down);
        }, i * 40);
      });
      setTimeout(function () { ['KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyK', 'KeyL'].forEach(up); }, steps.length * 40 + 60);
      return;
    }
    if (f.canExtraCredit()) { tap(['KeyJ', 'KeyK', 'KeyL']); return; }
    var prop = (s.match.props || []).filter(function (p) { return p.cool === 0 && Math.abs(p.x - f.x) <= FG.C.PROP_REACH; })[0];
    if (prop) {
      // Cornered: vault out; otherwise spring off it at them.
      var cornered = s.match.wallDistance(f, -f.facing) < 50;
      tap(cornered ? [back, 'KeyT'] : ['KeyT']);
      return;
    }
    tap(['KeyJ', 'KeyK']); // power up a special in its startup, or a throw
  }

  function build() {
    var css = document.createElement('style');
    css.textContent = [
      '#touch { position: fixed; inset: 0; pointer-events: none; z-index: 10; font-family: monospace; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }',
      '#touch .pad, #touch .btn, #touch .top { pointer-events: auto; touch-action: none; position: absolute; }',
      '#touch .pad { left: max(12px, env(safe-area-inset-left)); bottom: 14px; width: 150px; height: 150px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.25); }',
      '#touch .pad .nub { position: absolute; left: 50%; top: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%; background: rgba(255,210,63,0.45); border: 2px solid rgba(255,210,63,0.8); }',
      '#touch .pad i { position: absolute; color: rgba(255,255,255,0.45); font-style: normal; font-size: 16px; }',
      '#touch .btn { width: 66px; height: 66px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; color: #fff; border: 2px solid rgba(255,255,255,0.55); background: rgba(0,0,0,0.35); text-shadow: 0 2px 0 #000; }',
      '#touch .btn small { position: absolute; bottom: 7px; font-size: 9px; font-weight: normal; opacity: 0.8; }',
      '#touch .btn.on, #touch .top.on { transform: scale(0.92); filter: brightness(1.6); }',
      '#touch .p { right: calc(max(12px, env(safe-area-inset-right)) + 150px); bottom: 74px; background: rgba(60,111,176,0.55); }',
      '#touch .k { right: calc(max(12px, env(safe-area-inset-right)) + 76px); bottom: 14px; background: rgba(46,160,90,0.55); }',
      '#touch .h { right: calc(max(12px, env(safe-area-inset-right)) + 76px); bottom: 134px; background: rgba(200,40,40,0.55); }',
      '#touch .s { right: max(12px, env(safe-area-inset-right)); bottom: 74px; background: rgba(255,210,63,0.6); color: #1a1a22; text-shadow: none; }',
      '#touch .top { top: 8px; padding: 6px 12px; border-radius: 8px; font-size: 13px; color: #fff; background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.45); }',
      '#touch .pause { right: max(10px, env(safe-area-inset-right)); }',
      '#touch .start { right: max(10px, env(safe-area-inset-right)); top: 46px; padding: 6px 6px; font-size: 11px; }',
      // Short landscape screens (phones on their side): smaller, see-through controls.
      '@media (max-height: 460px) { #touch .pad { width: 124px; height: 124px; opacity: 0.8; } #touch .pad i { display: none; }',
      '  #touch .btn { width: 54px; height: 54px; font-size: 18px; opacity: 0.75; } #touch .btn small { display: none; }',
      '  #touch .p { right: calc(max(10px, env(safe-area-inset-right)) + 122px); bottom: 62px; } #touch .k { right: calc(max(10px, env(safe-area-inset-right)) + 62px); bottom: 10px; }',
      '  #touch .h { right: calc(max(10px, env(safe-area-inset-right)) + 62px); bottom: 114px; } #touch .s { right: max(10px, env(safe-area-inset-right)); bottom: 62px; } }'
    ].join('\n');
    document.head.appendChild(css);
    var root = document.createElement('div');
    root.id = 'touch';
    root.innerHTML = '<div class="pad"><i style="left:66px;top:4px">▲</i><i style="left:66px;bottom:4px">▼</i><i style="left:6px;top:64px">◀</i><i style="right:6px;top:64px">▶</i><div class="nub"></div></div>' +
      '<div class="btn p">P<small>PUNCH</small></div><div class="btn k">K<small>KICK</small></div><div class="btn h">H<small>HEAVY</small></div><div class="btn s">★<small>SUPER</small></div>' +
      '<div class="top start">START</div><div class="top pause">II</div>';
    document.body.appendChild(root);

    // Buttons: held while touched (multi-touch: each finger on its own button).
    function button(sel, press, release) {
      var el = root.querySelector(sel);
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault(); FG.Sfx.unlock(); goFullscreen();
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
        el.classList.add('on'); press();
      });
      var off = function (e) { e.preventDefault(); el.classList.remove('on'); if (release) release(); };
      el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', function () { el.classList.remove('on'); if (release) release(); });
    }
    button('.p', function () { down('KeyJ'); }, function () { up('KeyJ'); });
    button('.k', function () { down('KeyK'); }, function () { up('KeyK'); });
    button('.h', function () { down('KeyL'); }, function () { up('KeyL'); });
    button('.s', star);
    button('.start', function () { tap(['Enter']); });
    button('.pause', function () { tap(['Escape']); });

    // The d-pad: 8 directions from where the thumb is, with a dead zone in the middle.
    var pad = root.querySelector('.pad'), nub = pad.querySelector('.nub'), padId = null;
    function steer(e) {
      var r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var dist = Math.sqrt(dx * dx + dy * dy), dead = r.width * 0.16, want = {};
      if (dist > dead) {
        var a = Math.atan2(dy, dx), oct = Math.round(a / (Math.PI / 4)); // 0 right, 2 down, -2 up, 4 / -4 left
        if (oct === 0 || oct === 1 || oct === -1) want.KeyD = true;
        if (oct === 4 || oct === -4 || oct === 3 || oct === -3) want.KeyA = true;
        if (oct >= 1 && oct <= 3) want.KeyS = true;
        if (oct <= -1 && oct >= -3) want.KeyW = true;
      }
      ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach(function (c) { if (want[c]) down(c); else up(c); });
      var k = Math.min(1, dist / (r.width / 2)) * (r.width / 2 - 28);
      nub.style.transform = dist > 0 ? 'translate(' + (dx / dist * k) + 'px,' + (dy / dist * k) + 'px)' : '';
    }
    function release() { padId = null; nub.style.transform = ''; ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach(up); }
    pad.addEventListener('pointerdown', function (e) {
      e.preventDefault(); FG.Sfx.unlock(); goFullscreen();
      padId = e.pointerId;
      try { pad.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
      steer(e);
    });
    pad.addEventListener('pointermove', function (e) { if (e.pointerId === padId) { e.preventDefault(); steer(e); } });
    pad.addEventListener('pointerup', function (e) { if (e.pointerId === padId) release(); });
    pad.addEventListener('pointercancel', function (e) { if (e.pointerId === padId) release(); });

    // Tapping the game itself confirms on menus (and starts the title).
    document.getElementById('game').addEventListener('pointerdown', function () {
      FG.Sfx.unlock(); goFullscreen();
      if (!fight()) tap(['Enter']);
    });
    // No scrolling, pinch-zoom or long-press menus while playing.
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Fullscreen and landscape where the browser allows it (once, on the first touch).
  var triedFull = false;
  function goFullscreen() {
    if (triedFull) return;
    triedFull = true;
    var el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
    try {
      var p = req && req.call(el);
      if (p && p.then) p.then(function () { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); }).catch(function () {});
    } catch (err) { /* not allowed: carry on */ }
  }

  if (Touch.on) {
    FG.seenControls = true; // the keyboard controls card is no use here
    if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
  }
})();
