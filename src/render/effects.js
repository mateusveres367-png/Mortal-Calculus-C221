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
    this.scuffs = []; // skid marks on the floor, fading
    this.shakeMag = 0;
  }

  // Knocked back across the floor: a puff of dust at the feet and a scuff mark.
  Effects.prototype.skid = function (x, dir, k) {
    this.parts.push({ x: x + (Math.random() - 0.5) * 6, y: C.GROUND_Y - 2, vx: -dir * (0.4 + Math.random() * 1.2) * k, vy: -0.2 - Math.random() * 0.5,
      life: 10 + Math.random() * 6, max: 16, size: 2, color: 0xb8aa92, puff: true });
    var last = this.scuffs[this.scuffs.length - 1];
    if (last && last.life > last.max - 8 && Math.abs(last.x2 - x) < 18) last.x2 = x;
    else this.scuffs.push({ x1: x, x2: x, life: 150, max: 150 });
  };

  // A big hit: a little chalk dust bursting off them.
  Effects.prototype.chalkBurst = function (x, y, dir) {
    for (var i = 0; i < 5; i++) {
      var a = (Math.random() - 0.5) * Math.PI * 1.2 + (dir > 0 ? 0 : Math.PI), sp = 1.2 + Math.random() * 2.4;
      this.parts.push({ x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 24, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6,
        life: 14 + Math.random() * 8, max: 22, size: 2 + Math.random() * 2, color: i % 3 ? 0xf2f6ee : 0xdfe6dc, puff: true });
    }
  };

  // Floor dust kicked up by landings, bounces and tech rolls.
  Effects.prototype.dust = function (x, n, spread) {
    n = Math.ceil(n * 0.5); // kept light: a few specks, not a cloud
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
      case 'cancel': return;
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
      case 'submission': // MAX takes them to the mat
        this.dust(x, 14, 2);
        return;
      case 'tap': // the hold fills: a gold ring and dust off the mat
        this.dust(x, 18, 3);
        this.flashes.push({ x: x, y: y, r: 30, life: 14, max: 14, color: 0xffd23f, ring: true, thick: 3 });
        this.flashes.push({ x: x, y: y, r: 22, life: 8, max: 8, color: 0xffffff, star: true });
        this.shake(0.012);
        return;
      case 'check': // MATEUS's shin meets the kick: a red-white snap and splinters
        this.flashes.push({ x: x, y: y, r: 18, life: 9, max: 9, color: 0xffffff, star: true });
        this.flashes.push({ x: x, y: y, r: 14, life: 12, max: 12, color: 0xc8102e, ring: true });
        for (var cp = 0; cp < 8; cp++) {
          var ca = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
          this.parts.push({ x: x, y: y, vx: Math.cos(ca) * 2.2 + ev.facing * 0.6, vy: Math.sin(ca) * 2.2, life: 14, max: 14, size: 2, color: cp % 2 ? 0xc8102e : 0xffffff });
        }
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
      case 'extracredit': // Extra Credit: gold rings and a shower of sparks
        this.flashes.push({ x: x, y: y, r: 70, life: 26, max: 26, color: 0xffd23f, ring: true, thick: 4 });
        this.flashes.push({ x: x, y: y, r: 40, life: 18, max: 18, color: 0xffffff, ring: true, thick: 3 });
        for (var ec = 0; ec < 18; ec++) {
          var eca = Math.random() * Math.PI * 2;
          this.parts.push({ x: x, y: y, vx: Math.cos(eca) * 3.4, vy: Math.sin(eca) * 3.4 - 1.5, life: 24, max: 24, size: 2, color: ec % 2 ? 0xffd23f : 0xffffff });
        }
        return;
      case 'ultstart': // an ultimate starting: two big rings in the fighter's colour
        this.flashes.push({ x: x, y: y, r: 60, life: 22, max: 22, color: ev.color || 0xffffff, ring: true, thick: 4 });
        this.flashes.push({ x: x, y: y, r: 34, life: 14, max: 14, color: 0xffffff, ring: true, thick: 3 });
        this.flashes.push({ x: x, y: y, r: 22, life: 10, max: 10, color: 0xffffff, star: true });
        return;
      case 'enhance': // an enhanced special: a ring and sparks in the fighter's colour
        this.flashes.push({ x: x, y: y, r: 30, life: 14, max: 14, color: ev.color || 0xffffff, ring: true, thick: 3 });
        this.flashes.push({ x: x, y: y, r: 16, life: 8, max: 8, color: 0xffffff, star: true });
        for (var en = 0; en < 12; en++) {
          var ea = Math.random() * Math.PI * 2;
          this.parts.push({ x: x, y: y, vx: Math.cos(ea) * 3, vy: Math.sin(ea) * 3 - 1, life: 16, max: 16, size: 2, color: en % 2 ? (ev.color || 0xffffff) : 0xffffff });
        }
        return;
      case 'armor': // Exponential Armor: the hit glances off in a gold ring
        this.flashes.push({ x: x, y: y, r: 20, life: 10, max: 10, color: 0xffd23f, ring: true, thick: 3 });
        this.flashes.push({ x: x, y: y, r: 12, life: 6, max: 6, color: 0xffffff, star: true });
        for (var ar = 0; ar < 8; ar++) {
          var aa = Math.random() * Math.PI * 2;
          this.parts.push({ x: x, y: y, vx: Math.cos(aa) * 2.2, vy: Math.sin(aa) * 2.2 - 0.5, life: 12, max: 12, size: 2, color: ar % 2 ? 0xffd23f : 0xffffff });
        }
        return;
    }
    // Everything below is for strikes (hits and blocks); other events have no visual.
    if ((ev.type !== 'hit' && ev.type !== 'block') || !ev.move) return;
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
      // The guard spark: a bright shield arc facing the blow.
      this.flashes.push({ x: x + ev.facing * 4, y: y, r: 16, life: 8, max: 8, color: 0xdff6ff, arc: ev.facing > 0 ? Math.PI : 0 });
      this.flashes.push({ x: x, y: y, r: 7, life: 4, max: 4, color: 0xffffff, star: true });
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
    // Big hits: a brief white flash (and on counter hits and launchers, a little chalk dust).
    if (ev.ch || ev.move.strength === 'heavy' || ev.move.strength === 'launch' || kind === 'launch') {
      if (ev.ch || kind === 'launch') this.chalkBurst(x, y, ev.facing);
      this.flashScreen(0xffffff, ev.ch ? 0.3 : 0.18, 4);
    }
    // A counter-hit Spinning Elbow (MATEUS): the whole screen goes white, then red.
    if (ev.ch && ev.move.chFlash) this.flashScreen(0xffffff, 0.85, 12);
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
      p.x += p.vx; p.y += p.vy;
      if (p.puff) { p.vy = p.vy * 0.9 - 0.01; p.vx *= 0.88; } else { p.vy += 0.15; p.vx *= 0.92; }
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
    for (var sc = this.scuffs.length - 1; sc >= 0; sc--) if (--this.scuffs[sc].life <= 0) this.scuffs.splice(sc, 1);
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
    // Scuff marks where someone skidded, fading out.
    for (var s = 0; s < this.scuffs.length; s++) {
      var sc = this.scuffs[s], sa = Math.min(1, sc.life / 60) * 0.4, x1 = Math.min(sc.x1, sc.x2), w = Math.max(3, Math.abs(sc.x2 - sc.x1));
      g.fillStyle(0x1a140c, sa); g.fillRect(Math.round(x1), C.GROUND_Y + 1, Math.round(w), 2);
      g.fillStyle(0x1a140c, sa * 0.6); g.fillRect(Math.round(x1) + 2, C.GROUND_Y + 4, Math.round(w * 0.7), 1);
    }
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
      if (f.arc != null) { // a guard spark: a bright arc of shield facing the blow
        var ar = Math.round(f.r * (1.3 - 0.4 * k));
        g.lineStyle(3, f.color, k); g.beginPath(); g.arc(f.x, f.y, ar, f.arc - 1.1, f.arc + 1.1); g.strokePath();
        g.lineStyle(1, 0xffffff, k); g.beginPath(); g.arc(f.x, f.y, ar - 3, f.arc - 0.9, f.arc + 0.9); g.strokePath();
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
      if (p.puff) { // dust and chalk: soft puffs that swell as they fade
        g.fillStyle(p.color, 0.35 * Math.min(1, p.life / (p.max * 0.6)));
        g.fillCircle(p.x, p.y, p.size * (1 + (1 - p.life / p.max) * 0.7));
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
      case 'block': // a hard, dry clack
        burst(0.025, 3200, 9, 0.4, 'bandpass');
        burst(0.04, 1700, 7, 0.28, 'bandpass');
        thump(0.06, 340, 170, 0.28);
        if (strength === 'heavy' || strength === 'launch') thump(0.12, 160, 70, 0.3);
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
        else if (strength === 'heavy' || strength === 'launch') thump(0.34, 72, 26, 0.65); // a big hit: a low boom
        if (ev.ko) thump(0.6, 90, 30, 0.7);
        // A shin kick (MATEUS): a loud, flat thwack on top.
        if (ev.move && ev.move.thwack) { burst(0.035, 2600, 1.4, 0.7, 'bandpass'); burst(0.05, 1200, 1, 0.5); thump(0.09, 220, 90, 0.5); }
        break;
      }
      case 'check': // shin on shin: a hard crack
        burst(0.03, 3000, 3, 0.6, 'bandpass'); thump(0.1, 260, 120, 0.5); burst(0.08, 900, 1, 0.3);
        break;
      // MAX's submissions: bodies hitting the mat as it locks in; the tap (three hard slaps on
      // the mat, a boom); getting out (a scramble).
      case 'submission':
        thump(0.2, 120, 40, 0.6); burst(0.15, 500, 1, 0.3);
        break;
      case 'tap':
        thump(0.5, 80, 24, 0.9); burst(0.3, 800, 0.7, 0.4);
        [0, 0.13, 0.26].forEach(function (at) { setTimeout(function () { burst(0.04, 2200, 2, 0.6, 'bandpass'); thump(0.06, 300, 150, 0.4); }, at * 1000); });
        break;
      case 'subend':
        if (ev.how !== 'tap') { burst(0.2, 900, 0.8, 0.3); thump(0.12, 160, 60, 0.35); }
        break;
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
      case 'cancel': // a string flowing into its next hit
        burst(0.05, 3400, 2.5, 0.12, 'bandpass');
        sweep(0.06, 700, 1300, 0.04);
        break;
      case 'parry':
        thump(0.15, 1400, 900, 0.25);
        burst(0.1, 6500, 8, 0.3, 'bandpass');
        break;
      case 'break':
        burst(0.08, 4200, 3, 0.35, 'bandpass');
        thump(0.06, 600, 300, 0.2);
        break;
      case 'armor': // a heavy clank: the hit doesn't move him
        thump(0.18, 160, 60, 0.6);
        burst(0.12, 2600, 4, 0.3, 'bandpass');
        sweep(0.16, 900, 700, 0.06, 'square');
        break;
      case 'feint':
        burst(0.05, 1800, 2, 0.1, 'bandpass');
        break;
      case 'extracredit': // Extra Credit: a bright fanfare up the scale
        [523, 659, 784, 1047].forEach(function (fr, k) { setTimeout(function () { sweep(0.18, fr, fr * 1.01, 0.06, 'square'); }, k * 70); });
        thump(0.3, 180, 60, 0.4);
        break;
      case 'ultstart': // an ultimate: a deep charge-up and a bright sting
        thump(0.35, 140, 40, 0.6);
        sweep(0.4, 120, 1800, 0.08, 'sawtooth');
        sweep(0.5, 240, 3600, 0.04, 'square');
        burst(0.3, 6000, 2, 0.12, 'bandpass');
        break;
      case 'enhance': // an enhanced special: a bright rising surge
        sweep(0.18, 300, 1500, 0.07, 'sawtooth');
        sweep(0.24, 600, 2400, 0.04, 'square');
        burst(0.16, 5200, 3, 0.12, 'bandpass');
        break;
      case 'meter': // a Grade bar filled: a rising chalk chime, higher for each grade
        sweep(0.12, 520 + ev.bars * 180, 900 + ev.bars * 260, 0.05, 'triangle');
        sweep(0.2, 1040 + ev.bars * 260, 1100 + ev.bars * 260, 0.03, 'square');
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

  // Cut-in: a rising whoosh into a bright sting.
  Sfx.cutIn = function () {
    if (!Sfx.ctx || Sfx.muted) return;
    burst(0.22, 2400, 0.6, 0.3, 'bandpass');
    sweep(0.16, 220, 1400, 0.08, 'sawtooth');
    sweep(0.3, 1320, 1240, 0.06, 'square');
    thump(0.2, 160, 50, 0.4);
  };

  // Stage objects being used.
  Sfx.prop = function (kind) {
    if (!Sfx.ctx || Sfx.muted) return;
    switch (kind) {
      case 'lockers': case 'cabinet': case 'trashcan': case 'barrier': // metal
        burst(0.2, 2400, 6, 0.3, 'bandpass'); thump(0.12, 300, 120, 0.4); sweep(0.25, 1320, 1300, 0.04, 'square'); break;
      case 'whiteboard': case 'chair': // squeaky wheels
        sweep(0.18, 2200, 2900, 0.04, 'triangle'); sweep(0.2, 2600, 2100, 0.03, 'triangle'); thump(0.1, 200, 90, 0.3); break;
      case 'vending': case 'crt': // a hum and a clunk
        sweep(0.3, 120, 110, 0.08, 'sawtooth'); thump(0.15, 180, 70, 0.4); break;
      default: // wood and paper
        thump(0.14, 220, 90, 0.45); burst(0.12, 3800, 1, 0.12, 'highpass');
    }
  };

  // Chalk on a board: a few short scratches.
  Sfx.chalk = function () {
    if (!Sfx.ctx || Sfx.muted) return;
    burst(0.07, 5200, 6, 0.16, 'bandpass');
    burst(0.05, 7400, 8, 0.1, 'bandpass');
    sweep(0.08, 3200, 2600, 0.015, 'square');
  };

  // The school bell: a hard metallic ring, a few times over.
  Sfx.bell = function () {
    if (!Sfx.ctx || Sfx.muted) return;
    for (var k = 0; k < 6; k++) (function (k) {
      setTimeout(function () { sweep(0.16, 1760, 1720, 0.07, 'square'); sweep(0.16, 2640, 2600, 0.03, 'triangle'); burst(0.05, 3200, 4, 0.08, 'bandpass'); }, k * 90);
    })(k);
  };

  // Breaking glass: a crack, then tinkles.
  Sfx.glass = function () {
    if (!Sfx.ctx || Sfx.muted) return;
    burst(0.22, 4800, 1.2, 0.5, 'highpass');
    thump(0.2, 220, 60, 0.6);
    [3100, 4200, 5300, 3700].forEach(function (f, i) { sweep(0.18 + i * 0.05, f, f * 0.96, 0.03, 'triangle'); });
  };

  // A big boom (LEE's chalk-dust explosion).
  Sfx.boom = function () {
    if (!Sfx.ctx || Sfx.muted) return;
    thump(0.6, 120, 30, 0.9);
    burst(0.6, 900, 0.5, 0.5, 'lowpass');
    burst(0.3, 3000, 1, 0.2, 'bandpass');
  };

  // Car alarm: a two-tone whoop (high: which half of the cycle).
  Sfx.alarm = function (high) {
    if (!Sfx.ctx || Sfx.muted) return;
    sweep(0.24, high ? 900 : 600, high ? 1300 : 800, 0.08, 'square');
  };

  // Ultimates' own sounds (src/render/ultimates/): Sfx.synth(function (S) { ... }) with
  //   S.noise({ dur, freq, f1, q, gain, type, at, pan, attack }): filtered noise, its
  //     filter sweeping from freq to f1;
  //   S.osc({ dur, f0, f1, gain, type, at, pan, attack, vib: [rate, depth] }): a tone
  //     gliding from f0 to f1, with vibrato.
  // `at` is a delay in seconds, `pan` -1 (left) to 1 (right), `attack` a fade-in.
  function synthOut(ctx, node, pan) {
    if (pan && ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(ctx.destination); }
    else node.connect(ctx.destination);
  }
  function synthEnv(ctx, t, o) {
    var g = ctx.createGain(), a = o.attack || 0;
    if (a) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.gain, t + a); }
    else g.gain.setValueAtTime(o.gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + Math.max(a + 0.01, o.dur));
    return g;
  }
  var SYN = {
    noise: function (o) {
      var ctx = Sfx.ctx, t = ctx.currentTime + (o.at || 0);
      var src = ctx.createBufferSource(); src.buffer = Sfx.noise; src.loop = true;
      var f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
      f.frequency.setValueAtTime(o.freq || 1000, t);
      if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
      var g = synthEnv(ctx, t, o);
      src.connect(f); f.connect(g); synthOut(ctx, g, o.pan);
      src.start(t, Math.random() * 0.5); src.stop(t + o.dur + 0.05);
    },
    osc: function (o) {
      var ctx = Sfx.ctx, t = ctx.currentTime + (o.at || 0);
      var osc = ctx.createOscillator(); osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.f0, t);
      if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
      if (o.vib) {
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
        lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + o.dur + 0.05);
      }
      var g = synthEnv(ctx, t, o);
      osc.connect(g); synthOut(ctx, g, o.pan);
      osc.start(t); osc.stop(t + o.dur + 0.05);
    }
  };
  Sfx.synth = function (fn) { if (Sfx.ctx && !Sfx.muted) fn(SYN); };

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
