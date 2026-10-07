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
    this.cracks = [];
    this.props = []; // tumbling objects (LOPEZ's blazer)
    this.shakeMag = 0;
  }

  // Floor dust kicked up by landings, bounces and tech rolls.
  Effects.prototype.dust = function (x, n, spread) {
    for (var i = 0; i < n; i++) {
      var dir = i % 2 ? 1 : -1;
      this.parts.push({ x: x + dir * Math.random() * 10, y: C.GROUND_Y - 2, vx: dir * (0.6 + Math.random() * (spread || 2)),
        vy: -0.5 - Math.random() * 1.6, life: 14 + Math.random() * 10, max: 24, size: Math.random() < 0.4 ? 3 : 2,
        color: i % 3 ? 0x8a7d6a : 0xb8aa92 });
    }
  };

  // ev: any match event that has a visual.
  Effects.prototype.spawn = function (ev) {
    var x = ev.x, y = C.GROUND_Y - (ev.y || 0);
    switch (ev.type) {
      case 'land': this.dust(x, 6, 1.5); return;
      case 'tech': this.dust(x, 8, 2.5); return;
      case 'bounce':
        this.dust(x, 14, 3);
        this.flashes.push({ x: x, y: C.GROUND_Y, r: 14, life: 8, max: 8, color: 0xd8c79a, ring: true });
        return;
      case 'wallsplat':
        // A big crack in the wall where they hit, plaster raining down.
        this.cracks.push({ x: x, y: y, life: 150, seed: Math.random() * 1000, size: 1.4 });
        this.dust(x, 6, 1);
        for (var w = 0; w < 18; w++) {
          this.parts.push({ x: x, y: y + (Math.random() - 0.5) * 40, vx: (x < C.WORLD_W / 2 ? 1 : -1) * Math.random() * 2.5, vy: -Math.random() * 2.5,
            life: 22 + Math.random() * 12, max: 34, size: w % 4 ? 2 : 3, color: w % 2 ? 0xc9cfd6 : 0x6b6f7a });
        }
        this.flashes.push({ x: x, y: y, r: 26, life: 10, max: 10, color: 0xffd23f, ring: true, thick: 3 });
        this.flashes.push({ x: x, y: y, r: 20, life: 6, max: 6, color: 0xffffff, star: true });
        this.shake(0.012, 'x');
        return;
      case 'guardbreak':
        for (var g = 0; g < 18; g++) {
          var ga = Math.random() * Math.PI * 2;
          this.parts.push({ x: x, y: y, vx: Math.cos(ga) * 3.5, vy: Math.sin(ga) * 3.5 - 1, life: 20, max: 20, size: 3,
            color: g % 3 ? 0x9fdcff : 0xffffff });
        }
        this.flashes.push({ x: x, y: y, r: 26, life: 12, max: 12, color: 0x5fd7ff, ring: true });
        return;
      case 'grab':
        this.flashes.push({ x: x, y: y, r: 8, life: 5, max: 5, color: 0xffffff, star: true });
        return;
      case 'blazer': // LOPEZ tosses his blazer off behind him
        this.props.push({ x: x, y: y, vx: -ev.facing * 2.6, vy: -3.2, rot: 0, vr: -ev.facing * 0.18, life: 70, w: 14, h: 18, color: ev.color });
        return;
      case 'parry':
        this.flashes.push({ x: x, y: y, r: 22, life: 10, max: 10, color: 0xdff6ff, star: true });
        this.flashes.push({ x: x, y: y, r: 16, life: 14, max: 14, color: 0x5fd7ff, ring: true });
        for (var pp = 0; pp < 10; pp++) {
          var pa = Math.random() * Math.PI * 2;
          this.parts.push({ x: x, y: y, vx: Math.cos(pa) * 2.5, vy: Math.sin(pa) * 2.5, life: 14, max: 14, size: 2, color: pp % 2 ? 0x5fd7ff : 0xffffff });
        }
        return;
      case 'break':
        this.flashes.push({ x: x, y: y, r: 18, life: 9, max: 9, color: 0xffffff, star: true });
        this.flashes.push({ x: x, y: y, r: 14, life: 10, max: 10, color: 0x5fd7ff, ring: true });
        return;
    }
    if (ev.type === 'hit' && ev.throw) this.dust(x, 16, 3);
    // Each hit on a splatted fighter cracks the wall a little more.
    if (ev.type === 'hit' && ev.wall) {
      var wx = x < C.WORLD_W / 2 ? C.WALL_L : C.WALL_R;
      this.cracks.push({ x: wx, y: y, life: 100, seed: Math.random() * 1000, size: 0.8 });
    }
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
    var kind = ev.impact || FG.impactKind(ev.move);
    // Sparks grow as the combo goes on.
    var grow = 1 + Math.min(1.1, Math.max(0, (ev.hits || 1) - 1) * 0.1);
    var n = Math.round((st.n + (ev.ch ? 8 : 0)) * grow);
    for (var j = 0; j < n; j++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = st.speed * (0.5 + Math.random()) * Math.sqrt(grow);
      var up = kind === 'launch' ? -1.5 : 0;
      this.parts.push({ x: x, y: y, vx: Math.cos(ang) * sp + ev.facing * 1.2, vy: Math.sin(ang) * sp + up,
        life: 12 + Math.random() * 10, max: 22, size: Math.random() < 0.3 ? 3 : 2, color: colors[j % colors.length] });
    }
    this.flashes.push({ x: x, y: y, r: st.star * (ev.ch ? 1.4 : 1) * grow, life: 7, max: 7, color: ev.ch ? 0xffb347 : 0xffffff, star: true });
    if (grow > 1.25) this.flashes.push({ x: x, y: y, r: 12 * grow, life: 9, max: 9, color: 0xffffff, ring: true });
    this.impact(kind, x, y, ev);
    if (ev.ch) this.counterHit(x, y, ev);
  };

  // Each kind of blow has its own look:
  //   jab       quick: a small snap and a few speed lines
  //   body      heavy: a compression ring, sweat flying, a vertical jolt
  //   power     powerful (roundhouses, haymakers): a crescent arc, streaks, a hard sideways shake
  //   launch    explosive: a burst column, debris flung upward, a screen flash
  //   overhead  a slam: dust ring on the floor, streaks driving down
  //   low       sparks skittering along the floor
  Effects.prototype.impact = function (kind, x, y, ev) {
    var f = ev.facing, i, a;
    switch (kind) {
      case 'jab':
        this.flashes.push({ x: x, y: y, r: 10, life: 4, max: 4, color: 0xffffff, ring: true });
        for (i = 0; i < 3; i++) this.parts.push({ x: x - f * 4, y: y - 5 + i * 5, vx: f * 6, vy: 0, life: 4, max: 4, size: 2, streak: 10, color: 0xffffff });
        break;
      case 'body':
        this.flashes.push({ x: x, y: y, r: 14, life: 10, max: 10, color: 0xffffff, squash: true });
        this.flashes.push({ x: x, y: y, r: 18, life: 12, max: 12, color: 0xffd23f, ring: true });
        for (i = 0; i < 7; i++) {
          a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
          this.parts.push({ x: x, y: y, vx: Math.cos(a) * 2 + f * 1.5, vy: Math.sin(a) * 2.6, life: 22, max: 22, size: 2, color: i % 2 ? 0xbfe6ff : 0xffffff });
        }
        this.shake(0.007, 'y');
        break;
      case 'power':
        this.flashes.push({ x: x, y: y, r: 26, life: 10, max: 10, color: 0xffe066, arc: f });
        this.flashes.push({ x: x, y: y, r: 22, life: 12, max: 12, color: 0xff8a1f, ring: true });
        for (i = 0; i < 7; i++) {
          this.parts.push({ x: x, y: y + (Math.random() - 0.5) * 26, vx: f * (5 + Math.random() * 4), vy: (Math.random() - 0.5) * 0.6,
            life: 9, max: 9, size: 2, streak: 14, color: i % 2 ? 0xffffff : 0xffd23f });
        }
        this.shake(0.011, 'x');
        break;
      case 'launch':
        this.flashes.push({ x: x, y: y, r: 16, life: 14, max: 14, color: 0xffd23f, column: true });
        this.flashes.push({ x: x, y: y, r: 26, life: 12, max: 12, color: 0xffffff, ring: true });
        for (i = 0; i < 14; i++) {
          this.parts.push({ x: x + (Math.random() - 0.5) * 18, y: y + 6, vx: (Math.random() - 0.5) * 2.4, vy: -4 - Math.random() * 5,
            life: 20 + Math.random() * 8, max: 28, size: i % 3 ? 2 : 3, streak: i % 2 ? 8 : 0, color: i % 2 ? 0xffd23f : 0xff8a1f });
        }
        this.dust(x, 10, 2.5);
        this.flashScreen(0xfff3c4, 0.28, 7);
        this.shake(0.008, 'y');
        break;
      case 'overhead':
        this.flashes.push({ x: x, y: C.GROUND_Y, r: 22, life: 12, max: 12, color: 0xd8c79a, ring: true, flat: true });
        for (i = 0; i < 5; i++) this.parts.push({ x: x + (i - 2) * 6, y: y - 10, vx: 0, vy: 6, life: 6, max: 6, size: 2, streak: 12, color: 0xffffff });
        this.dust(x, 14, 3);
        this.shake(0.009, 'y');
        break;
      case 'low':
        for (i = 0; i < 10; i++) {
          this.parts.push({ x: x, y: C.GROUND_Y - 2, vx: f * (1 + Math.random() * 4) * (i % 4 ? 1 : -0.5), vy: -Math.random() * 2.2,
            life: 12 + Math.random() * 8, max: 20, size: 2, color: i % 2 ? 0xffb347 : 0xffffff });
        }
        this.dust(x, 4, 1.5);
        break;
    }
  };

  // Counter hit: a dramatic orange flash, speed lines bursting out and a big shockwave.
  Effects.prototype.counterHit = function (x, y, ev) {
    this.flashes.push({ x: x, y: y, r: 44, life: 16, max: 16, color: 0xff4a3d, ring: true, thick: 3 });
    this.flashes.push({ x: x, y: y, r: 60, life: 10, max: 10, color: 0xffd23f, radial: true });
    this.flashScreen(0xffe2b0, 0.5, 9);
    this.shake(0.012);
  };

  // A full-screen flash, drawn by the scene over the world.
  Effects.prototype.flashScreen = function (color, alpha, frames) {
    if (this.screen && this.screen.alpha * this.screen.life / this.screen.max > alpha) return;
    this.screen = { color: color, alpha: alpha, life: frames, max: frames };
  };

  // axis: 'x' or 'y' for a directional jolt, or omitted for both.
  Effects.prototype.shake = function (intensity, axis) {
    var mag = intensity * C.VIEW_W;
    if (axis === 'x') this.shakeX = Math.max(this.shakeX || 0, mag);
    else if (axis === 'y') this.shakeY = Math.max(this.shakeY || 0, mag);
    else this.shakeMag = Math.max(this.shakeMag, mag);
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
    for (var q = this.props.length - 1; q >= 0; q--) {
      var pr = this.props[q];
      pr.x += pr.vx; pr.y += pr.vy; pr.vy += 0.18; pr.rot += pr.vr;
      if (pr.y > C.GROUND_Y - 3) { pr.y = C.GROUND_Y - 3; pr.vy = 0; pr.vx *= 0.8; pr.vr = 0; pr.rot = Math.PI / 2; }
      if (--pr.life <= 0) this.props.splice(q, 1);
    }
    for (var k = this.cracks.length - 1; k >= 0; k--) {
      if (--this.cracks[k].life <= 0) this.cracks.splice(k, 1);
    }
    this.shakeMag *= 0.82;
    if (this.shakeMag < 0.3) this.shakeMag = 0;
    this.shakeX = (this.shakeX || 0) * 0.8; if (this.shakeX < 0.3) this.shakeX = 0;
    this.shakeY = (this.shakeY || 0) * 0.78; if (this.shakeY < 0.3) this.shakeY = 0;
    if (this.screen && --this.screen.life <= 0) this.screen = null;
  };

  Effects.prototype.shakeOffset = function () {
    var mx = this.shakeMag + (this.shakeX || 0), my = this.shakeMag * 0.6 + (this.shakeY || 0);
    if (!mx && !my) return { x: 0, y: 0 };
    return { x: Math.round((Math.random() * 2 - 1) * mx), y: Math.round((Math.random() * 2 - 1) * my) };
  };

  Effects.prototype.draw = function (g) {
    for (var pi = 0; pi < this.props.length; pi++) {
      var o = this.props[pi], cs = Math.cos(o.rot), sn = Math.sin(o.rot), hw = o.w / 2, hh = o.h / 2;
      g.fillStyle(o.color, Math.min(1, o.life / 15));
      g.fillPoints([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (p) {
        return { x: o.x + p[0] * cs - p[1] * sn, y: o.y + p[0] * sn + p[1] * cs };
      }), true);
    }
    this.drawFront(g);
  };

  // Drawn before the fighters: wall cracks sit on the wall, behind whoever is splatted.
  Effects.prototype.drawBack = function (g) {
    // Wall cracks: jagged lines radiating from the impact point.
    for (var c = 0; c < this.cracks.length; c++) {
      var cr = this.cracks[c], alpha = Math.min(1, cr.life / 30), sz = cr.size || 1;
      // A dark dent at the centre, then jagged cracks radiating out.
      g.fillStyle(0x000000, 0.35 * alpha); g.fillCircle(cr.x, cr.y, Math.round(7 * sz));
      for (var ray = 0; ray < 9; ray++) {
        var ang = ray / 9 * Math.PI * 2 + cr.seed, px = cr.x, py = cr.y;
        for (var seg = 0; seg < 4; seg++) {
          var len = (7 + ((cr.seed * (ray + 3) * (seg + 1)) % 8)) * sz;
          ang += (((cr.seed * (seg + 7) * (ray + 1)) % 10) - 5) * 0.08;
          var nx = px + Math.cos(ang) * len, ny = py + Math.sin(ang) * len;
          g.lineStyle(seg < 2 ? 2 : 1, 0x111111, alpha);
          g.lineBetween(Math.round(px), Math.round(py), Math.round(nx), Math.round(ny));
          px = nx; py = ny;
        }
      }
    }
  };

  Effects.prototype.drawFront = function (g) {
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
        g.lineStyle(f.thick || 2, f.color, k);
        if (f.flat) g.strokeEllipse(f.x, f.y, Math.round(f.r * (3.2 - 2 * k)), Math.round(f.r * (0.8 - 0.5 * k)));
        else g.strokeCircle(f.x, f.y, Math.round(f.r * (1.6 - k)));
      }
      if (f.squash) { // compression: a ring squeezed flat as it expands
        g.lineStyle(3, f.color, k);
        g.strokeEllipse(f.x, f.y, Math.round(f.r * (1 + (1 - k) * 2.2)), Math.round(f.r * (0.5 + k * 1.2)));
      }
      if (f.arc) { // crescent swept in the direction of the blow
        var ar = f.r * (1.4 - k * 0.5), a0 = f.arc > 0 ? -1.1 : Math.PI - 1.1, ac = f.arc > 0 ? 0 : Math.PI;
        g.lineStyle(Math.max(2, Math.round(6 * k)), f.color, Math.min(1, k * 1.4));
        g.beginPath(); g.arc(f.x - f.arc * ar * 0.6, f.y, ar, a0, a0 + 2.2, false); g.strokePath();
        g.lineStyle(2, 0xffffff, k);
        g.beginPath(); g.arc(f.x - f.arc * ar * 0.6, f.y, ar - 3, ac - 0.7, ac + 0.7, false); g.strokePath();
      }
      if (f.column) { // burst column shooting up from the hit
        var ch = Math.round(150 * (1 - k * 0.6)), cw = Math.round(f.r * (0.4 + k));
        g.fillStyle(f.color, k * 0.7); g.fillRect(f.x - cw, f.y - ch, cw * 2, ch + 6);
        g.fillStyle(0xffffff, k * 0.9); g.fillRect(f.x - Math.round(cw * 0.4), f.y - ch, Math.round(cw * 0.8), ch + 6);
      }
      if (f.radial) { // speed lines bursting out
        g.lineStyle(2, f.color, k);
        for (var rl = 0; rl < 14; rl++) {
          var ra = rl / 14 * Math.PI * 2 + (rl % 2) * 0.15, r0 = f.r * (0.35 + (1 - k) * 0.5), r1 = r0 + f.r * (0.4 + (rl % 3) * 0.15);
          g.lineBetween(f.x + Math.cos(ra) * r0, f.y + Math.sin(ra) * r0, f.x + Math.cos(ra) * r1, f.y + Math.sin(ra) * r1);
        }
      }
    }
    for (var j = 0; j < this.parts.length; j++) {
      var p = this.parts[j];
      if (p.streak) { // a short line trailing behind the particle
        var sv = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
        g.lineStyle(p.size, p.color, Math.min(1, p.life / 4));
        g.lineBetween(p.x, p.y, p.x - p.vx / sv * p.streak, p.y - p.vy / sv * p.streak);
        continue;
      }
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

  // Pitch multiplier for the sound being played: each hit in a combo rings a little higher.
  var PITCH = 1;

  function burst(dur, freq, q, gain, type) {
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var src = ctx.createBufferSource(); src.buffer = Sfx.noise;
    src.playbackRate.value = PITCH;
    var f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq * PITCH; f.Q.value = q;
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + dur);
  }
  function thump(dur, f0, f1, gain) {
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0 * PITCH, t); o.frequency.exponentialRampToValueAtTime(f1 * PITCH, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  }

  function sweep(dur, f0, f1, gain, type) {
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(); o.type = type || 'triangle';
    o.frequency.setValueAtTime(f0 * PITCH, t); o.frequency.exponentialRampToValueAtTime(f1 * PITCH, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur);
  }

  // Hit sounds by impact kind (see Effects.impact).
  function impactSound(kind, strength) {
    switch (kind) {
      case 'jab':      burst(0.04, 3200, 1.2, 0.32, 'bandpass'); thump(0.05, 260, 120, 0.28); break;
      case 'body':     thump(0.16, 130, 40, 0.75); burst(0.1, 520, 1, 0.42); break;
      case 'power':    burst(0.07, 2300, 0.8, 0.45); thump(0.2, 170, 35, 0.75); burst(0.16, 900, 0.7, 0.32); break;
      case 'launch':   burst(0.28, 1300, 0.5, 0.55); thump(0.32, 95, 28, 0.85); sweep(0.18, 180, 640, 0.12); break;
      case 'overhead': thump(0.24, 100, 26, 0.85); burst(0.16, 420, 1, 0.48); break;
      case 'low':      burst(0.06, 2600, 2, 0.3, 'bandpass'); thump(0.08, 210, 80, 0.32); break;
      default: {
        var k = { light: 0, medium: 1, heavy: 2, launch: 3 }[strength] || 0;
        burst(0.06 + k * 0.04, 1800 - k * 350, 1, 0.35 + k * 0.08);
        thump(0.08 + k * 0.05, 180 - k * 30, 50, 0.4 + k * 0.12);
      }
    }
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
        if (ev.throw) { thump(0.25, 110, 30, 0.8); burst(0.18, 700, 1, 0.45); break; }
        // Each hit in a combo is a semitone-ish higher than the last.
        PITCH = Math.min(1.9, Math.pow(1.06, Math.max(0, (ev.hits || 1) - 1)));
        impactSound(ev.impact || FG.impactKind(ev.move), strength);
        PITCH = 1;
        if (ev.ch) { // extra heavy: a deep boom, a crack and a ringing clang
          thump(0.45, 95, 22, 0.95);
          burst(0.3, 900, 0.6, 0.55);
          burst(0.22, 5200, 5, 0.32, 'bandpass');
          sweep(0.3, 1500, 380, 0.1, 'square');
        }
        if (ev.ko) thump(0.6, 90, 30, 0.7);
        break;
      }
      case 'land':
      case 'tech':
        thump(0.12, 110, 40, 0.45);
        burst(0.08, 600, 1, 0.2);
        break;
      case 'bounce':
        thump(0.2, 140, 35, 0.6);
        burst(0.12, 700, 1, 0.3);
        break;
      case 'wallsplat':
        thump(0.25, 100, 30, 0.7);
        burst(0.2, 1200, 0.8, 0.45);
        break;
      case 'guardbreak':
        burst(0.3, 6000, 4, 0.35, 'bandpass');
        burst(0.2, 3000, 2, 0.3, 'bandpass');
        thump(0.25, 220, 60, 0.5);
        break;
      case 'grab':
        burst(0.05, 1500, 2, 0.2, 'bandpass');
        break;
      case 'parry':
        thump(0.15, 1400, 900, 0.25);
        burst(0.1, 6500, 8, 0.3, 'bandpass');
        break;
      case 'break':
        burst(0.08, 4200, 3, 0.35, 'bandpass');
        thump(0.06, 600, 300, 0.2);
        break;
    }
  };

  // Crowd cheer: a swell of filtered noise. level 0..1.
  Sfx.cheer = function (level) {
    if (!Sfx.ctx || Sfx.muted) return;
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var src = ctx.createBufferSource(); src.buffer = Sfx.noise;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.05 + 0.08 * level, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6 + level * 0.5);
    src.connect(f); f.connect(g); g.connect(ctx.destination);
    src.start(t); src.stop(t + 1.2);
  };

  // Menu blips.
  Sfx.ui = function (kind) {
    if (!Sfx.ctx || Sfx.muted) return;
    var ctx = Sfx.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(kind === 'confirm' ? 660 : 440, t);
    if (kind === 'confirm') o.frequency.setValueAtTime(990, t + 0.06);
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + (kind === 'confirm' ? 0.16 : 0.06));
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.2);
  };

  FG.Sfx = Sfx;
})();
