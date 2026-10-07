// Hit sparks, screen shake and synthesized sound effects.
(function () {
  var C = FG.C;

  // --- Sparks -----------------------------------------------------------------

  var STYLE = {
    light:  { n: 6,  star: 9,  speed: 2.2, colors: [0xffffff, 0xfff3b0] },
    medium: { n: 10, star: 14, speed: 3.0, colors: [0xffffff, 0xffe066, 0xffb347] },
    heavy:  { n: 16, star: 20, speed: 3.8, colors: [0xffffff, 0xffd23f, 0xff8a1f] },
    launch: { n: 20, star: 24, speed: 4.4, colors: [0xffffff, 0xffd23f, 0xff8a1f, 0xff4a3d] }
  };

  function Effects() {
    this.parts = [];
    this.flashes = [];
    this.shakeMag = 0;
  }

  // ev: a 'hit' or 'block' event from the match.
  Effects.prototype.spawn = function (ev) {
    var x = ev.x, y = C.GROUND_Y - ev.y;
    if (ev.type === 'block') {
      for (var i = 0; i < 7; i++) {
        var a = (i / 6 - 0.5) * Math.PI * 0.9 + (ev.facing > 0 ? Math.PI : 0);
        this.parts.push({ x: x, y: y, vx: Math.cos(a) * 2.2, vy: Math.sin(a) * 2.2, life: 10, max: 10, size: 2, color: i % 2 ? 0x9fdcff : 0xffffff });
      }
      this.flashes.push({ x: x, y: y, r: 10, life: 5, max: 5, color: 0x9fdcff, ring: true });
      return;
    }
    var st = STYLE[ev.move.strength] || STYLE.light;
    var colors = ev.ch ? [0xffffff, 0xff8a1f, 0xff4a3d, 0xffd23f] : st.colors;
    var n = st.n + (ev.ch ? 8 : 0);
    for (var j = 0; j < n; j++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = st.speed * (0.5 + Math.random());
      var up = ev.move.strength === 'launch' ? -1.5 : 0;
      this.parts.push({ x: x, y: y, vx: Math.cos(ang) * sp + ev.facing * 1.2, vy: Math.sin(ang) * sp + up,
        life: 12 + Math.random() * 10, max: 22, size: Math.random() < 0.3 ? 3 : 2, color: colors[j % colors.length] });
    }
    this.flashes.push({ x: x, y: y, r: st.star * (ev.ch ? 1.4 : 1), life: 7, max: 7, color: ev.ch ? 0xffb347 : 0xffffff, star: true });
    if (ev.ch || ev.move.strength === 'heavy' || ev.move.strength === 'launch') {
      this.flashes.push({ x: x, y: y, r: st.star * 0.8, life: 10, max: 10, color: ev.ch ? 0xff4a3d : 0xffd23f, ring: true });
    }
  };

  Effects.prototype.shake = function (intensity) {
    this.shakeMag = Math.max(this.shakeMag, intensity * C.VIEW_W);
  };

  // Called once per display tick, including during hitstop, so sparks keep moving.
  Effects.prototype.update = function () {
    for (var i = this.parts.length - 1; i >= 0; i--) {
      var p = this.parts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.vx *= 0.92;
      if (--p.life <= 0) this.parts.splice(i, 1);
    }
    for (var j = this.flashes.length - 1; j >= 0; j--) {
      if (--this.flashes[j].life <= 0) this.flashes.splice(j, 1);
    }
    this.shakeMag *= 0.82;
    if (this.shakeMag < 0.3) this.shakeMag = 0;
  };

  Effects.prototype.shakeOffset = function () {
    if (!this.shakeMag) return { x: 0, y: 0 };
    return { x: Math.round((Math.random() * 2 - 1) * this.shakeMag), y: Math.round((Math.random() * 2 - 1) * this.shakeMag * 0.6) };
  };

  Effects.prototype.draw = function (g) {
    for (var i = 0; i < this.flashes.length; i++) {
      var f = this.flashes[i], k = f.life / f.max;
      if (f.star) {
        var r = Math.round(f.r * (0.6 + k * 0.6));
        g.fillStyle(f.color, 1);
        g.fillTriangle(f.x - r, f.y, f.x + r, f.y, f.x, f.y - 3);
        g.fillTriangle(f.x - r, f.y, f.x + r, f.y, f.x, f.y + 3);
        g.fillTriangle(f.x, f.y - r, f.x, f.y + r, f.x - 3, f.y);
        g.fillTriangle(f.x, f.y - r, f.x, f.y + r, f.x + 3, f.y);
        g.fillStyle(0xffffff, 1);
        g.fillRect(f.x - 3, f.y - 3, 6, 6);
      }
      if (f.ring) {
        g.lineStyle(2, f.color, k);
        g.strokeCircle(f.x, f.y, Math.round(f.r * (1.6 - k)));
      }
    }
    for (var j = 0; j < this.parts.length; j++) {
      var p = this.parts[j];
      g.fillStyle(p.color, Math.min(1, p.life / 6));
      g.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  };

  FG.Effects = Effects;

  // --- Sound ------------------------------------------------------------------
  // Synthesized with Web Audio so there are no files to load.

  var Sfx = { ctx: null, noise: null, muted: false };

  Sfx.unlock = function () {
    if (Sfx.ctx) { if (Sfx.ctx.state === 'suspended') Sfx.ctx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    Sfx.ctx = new AC();
    var len = Sfx.ctx.sampleRate;
    Sfx.noise = Sfx.ctx.createBuffer(1, len, Sfx.ctx.sampleRate);
    var d = Sfx.noise.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  };

  function burst(dur, freq, q, gain, type) {
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var src = ctx.createBufferSource(); src.buffer = Sfx.noise;
    var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur);
  }
  function thump(dur, f0, f1, gain) {
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  }

  Sfx.play = function (ev) {
    if (!Sfx.ctx || Sfx.muted) return;
    var strength = ev.move ? ev.move.strength : 'light';
    switch (ev.type) {
      case 'whiff':
        burst(strength === 'light' ? 0.06 : 0.12, strength === 'light' ? 2400 : 1500, 1.5, 0.08, 'bandpass');
        break;
      case 'block':
        burst(0.05, 3800, 3, 0.25, 'bandpass');
        thump(0.05, 900, 400, 0.12);
        break;
      case 'hit': {
        var k = { light: 0, medium: 1, heavy: 2, launch: 3 }[strength] || 0;
        burst(0.06 + k * 0.04, 1800 - k * 350, 1, 0.35 + k * 0.08);
        thump(0.08 + k * 0.05, 180 - k * 30, 50, 0.4 + k * 0.12);
        if (ev.ch) { burst(0.12, 5000, 6, 0.18, 'bandpass'); thump(0.18, 120, 40, 0.5); }
        if (ev.ko) thump(0.6, 90, 30, 0.7);
        break;
      }
      case 'land':
        thump(0.12, 110, 40, 0.45);
        burst(0.08, 600, 1, 0.2);
        break;
    }
  };

  FG.Sfx = Sfx;
})();
