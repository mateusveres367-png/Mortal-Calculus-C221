// Drawing the students' projectiles (match.projectiles, see src/engine/projectiles.js),
// each kind its own little pixel prop, plus their effects and sounds:
//   backpack  NICOLAS: a backpack, spinning flat out
//   bomb      MAX: a stuffed bookbag lobbed high; it bursts into books where it lands
//   plane     JACK: a paper airplane, nosing along its flight path
//   eraser    JACK: a pink eraser, flicked
//   error     HUDSON: a "SYNTAX ERROR" box that pops up in the air
(function () {
  var C = FG.C, GY = C.GROUND_Y;

  // Draw rects rotated about (cx, cy): pts in local units (x forward).
  function shape(g, cx, cy, ang, dir, k, rects) {
    var cs = Math.cos(ang), sn = Math.sin(ang);
    rects.forEach(function (r) {
      var x0 = r[0], y0 = r[1], w = r[2], h = r[3];
      var pts = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(function (p) {
        var px = p[0] * dir * k, py = p[1] * k;
        return { x: cx + px * cs - py * sn, y: cy + px * sn + py * cs };
      });
      g.fillStyle(r[4], r[5] == null ? 1 : r[5]);
      g.fillPoints(pts, true);
    });
  }

  var DRAW = {
    backpack: function (g, p) {
      var cx = p.x, cy = GY - p.y - p.h / 2, k = p.w / 16, ang = p.spin * p.dir * 0.8;
      shape(g, cx, cy, ang, p.dir, k, [
        [-8, -7, 16, 14, 0xc0392b], [-8, -7, 16, 4, 0x8a2a20], [-5, 1, 10, 5, 0xa83224],
        [-6, -10, 3, 4, 0x2a2a2a], [3, -10, 3, 4, 0x2a2a2a], [-1, -4, 2, 1, 0xffd23f]
      ]);
    },
    bomb: function (g, p) {
      var cx = p.x, cy = GY - p.y - p.h / 2, k = p.burst > 0 ? 0 : p.w / 18, ang = p.spin * p.dir * 0.5;
      if (p.burst > 0) return; // the burst is effects (books and papers)
      shape(g, cx, cy, ang, p.dir, k, [
        [-9, -8, 18, 16, 0x2b3a5a], [-9, -8, 18, 5, 0x1e2a44], [-6, 2, 12, 5, 0x34466a],
        [-6, -12, 4, 5, 0x6a3a1e], [-1, -13, 4, 6, 0x2a7a3a], [3, -12, 4, 5, 0xb0302a], // books poking out
        [-2, -3, 4, 1, 0xd8d8d8]
      ]);
    },
    plane: function (g, p) {
      var cx = p.x, cy = GY - p.y - p.h / 2, ang = Math.atan2(-p.vy, Math.max(0.5, Math.abs(p.vx))) * p.dir, d = p.dir, k = p.w / 18;
      var P = function (x, y) { var cs = Math.cos(ang), sn = Math.sin(ang), px = x * d * k, py = y * k; return { x: cx + px * cs - py * sn, y: cy + px * sn + py * cs }; };
      g.fillStyle(0xf6f6f0, 1); g.fillPoints([P(9, 0), P(-9, -5), P(-6, 0)], true);
      g.fillStyle(0xd8d8d0, 1); g.fillPoints([P(9, 0), P(-9, 4), P(-6, 0)], true);
      g.lineStyle(1, 0x9aa4b8, 1); g.lineBetween(P(9, 0).x, P(9, 0).y, P(-7, 0).x, P(-7, 0).y);
      g.lineStyle(1, 0x5a7ad8, 0.7); g.lineBetween(P(-4, -2).x, P(-4, -2).y, P(2, -1).x, P(2, -1).y); // notebook lines
    },
    eraser: function (g, p) {
      var cx = p.x, cy = GY - p.y - p.h / 2, ang = p.spin * p.dir * 2.2;
      shape(g, cx, cy, ang, p.dir, 1, [[-5, -3, 10, 6, 0xf08aa8], [-1, -3, 6, 6, 0x3a6ac8], [-5, -3, 4, 2, 0xffb8c8]]);
    },
    error: function (g, p) {
      var sp = p.move.projectile, u = Math.min(1, p.age / Math.max(1, (sp.arm || 4))), s = 0.3 + 0.7 * u;
      var w = p.w * s, h = p.h * s, x = p.x - w / 2, y = GY - p.y - h;
      g.fillStyle(0x000000, 0.35); g.fillRect(x + 3, y + 3, w, h);
      g.fillStyle(0xd8d8d8, 1); g.fillRect(x, y, w, h);
      g.fillStyle(0x1a3aa8, 1); g.fillRect(x, y, w, Math.max(2, 7 * s));
      g.fillStyle(0xffffff, 1); g.fillRect(x + w - 7 * s, y + 1, 5 * s, 5 * s);
      g.fillStyle(0xc0302a, 1); g.fillCircle(x + 9 * s, y + h * 0.6, 5 * s);
      g.fillStyle(0xffffff, 1); g.fillRect(x + 8.5 * s, y + h * 0.6 - 3 * s, 1.5 * s, 4 * s);
      g.lineStyle(1, 0x5a5a5a, 1); g.strokeRect(x, y, w, h);
    }
  };

  // Every projectile in flight. A burst (MAX's bookbag landing) is drawn by the effects.
  FG.drawProjectiles = function (g, match, t) {
    (match.projectiles || []).forEach(function (p) {
      if (p.dead) return;
      var fn = DRAW[p.kind];
      // A soft shadow on the floor under anything in the air.
      if (p.y > 2 && !p.burst) { g.fillStyle(0x000000, 0.25); g.fillEllipse(p.x, GY + 1, p.w * 1.2, 4); }
      if (fn) fn(g, p, t);
      else { g.fillStyle(0xffffff, 1); g.fillRect(p.x - p.w / 2, GY - p.y - p.h, p.w, p.h); }
    });
  };

  // Training's box overlay: projectile hitboxes in red.
  FG.drawProjectileBoxes = function (g, match) {
    (match.projectiles || []).forEach(function (p) {
      if (p.dead) return;
      var b = match.projectileBox(p);
      g.fillStyle(0xff2a2a, 0.35); g.fillRect(b.x1, GY - b.y2, b.x2 - b.x1, b.y2 - b.y1);
      g.lineStyle(1, 0xff2a2a, 1); g.strokeRect(b.x1, GY - b.y2, b.x2 - b.x1, b.y2 - b.y1);
    });
  };

  // --- Effects --------------------------------------------------------------------
  var Effects = FG.Effects, baseSpawn = Effects.prototype.spawn;
  Effects.prototype.spawn = function (ev) {
    var x = ev.x, y = GY - (ev.y || 0), i;
    switch (ev.type) {
      case 'projectile': return; // its whoosh is enough
      case 'fizzle': // it ran out: a little puff
        for (i = 0; i < 4; i++) this.parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 1.6, vy: -Math.random() * 1.2, life: 12, max: 12, size: 2, color: 0xe8e8e0, puff: true });
        return;
      case 'clash': // two projectiles meet: sparks both ways
        this.flashes.push({ x: x, y: y, r: 16, life: 8, max: 8, color: 0xffffff, ring: true });
        for (i = 0; i < 10; i++) { var a = Math.random() * Math.PI * 2; this.parts.push({ x: x, y: y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 1, life: 14, max: 14, size: 2, color: i % 2 ? 0xffd23f : 0xffffff }); }
        return;
      case 'deflect': // knocked away
        this.flashes.push({ x: x, y: y, r: 18, life: 9, max: 9, color: 0x5fd7ff, ring: true });
        for (i = 0; i < 6; i++) this.parts.push({ x: x, y: y, vx: (Math.random() - 0.5) * 4, vy: -1 - Math.random() * 3, life: 14, max: 14, size: 2, color: 0xbfe6ff });
        return;
      case 'teleport': // where they vanished and where they reappear: loose paper (JACK), or dirt
        var paperFx = ev.fx === 'paper';
        [ev.from, ev.x].forEach(function (tx, k) {
          for (var j = 0; j < 7; j++) this.parts.push({ x: tx + (Math.random() - 0.5) * 16, y: paperFx ? GY - 40 : GY - 2, vx: (Math.random() - 0.5) * 3, vy: -1.5 - Math.random() * 3, life: 18 + k * 4, max: 22, size: 2 + (j % 2), color: paperFx ? (j % 2 ? 0xf4f4ec : 0xd8d8d0) : (j % 3 ? 0x6a4a2a : 0x3a7a3a) });
        }, this);
        return;
      case 'burst': // a bookbag bursting: books and loose paper everywhere
        this.flashes.push({ x: x, y: GY - 10, r: 26, life: 10, max: 10, color: 0xfff2c8, ring: true });
        for (i = 0; i < 16; i++) this.parts.push({ x: x + (Math.random() - 0.5) * 20, y: GY - 6, vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 4, life: 26 + Math.random() * 10, max: 36, size: i % 3 ? 2 : 4, color: [0xf4f4ec, 0x2a7a3a, 0xb0302a, 0x6a3a1e][i % 4] });
        this.shake(0.008);
        return;
    }
    baseSpawn.call(this, ev);
  };

  // --- Sounds -----------------------------------------------------------------------
  var basePlay = FG.Sfx.play;
  FG.Sfx.play = function (ev) {
    var S = FG.Sfx;
    switch (ev.type) {
      case 'projectile': // a throw: a whoosh, pitched by what it is
        S.synth(function (s) {
          var hi = ev.kind === 'eraser' || ev.kind === 'plane';
          s.noise({ dur: hi ? 0.12 : 0.2, freq: hi ? 3200 : 1400, f1: hi ? 5200 : 2200, q: 1.2, gain: 0.12 });
          if (ev.kind === 'error') { s.osc({ dur: 0.09, f0: 880, gain: 0.05, type: 'square' }); s.osc({ dur: 0.12, f0: 660, gain: 0.05, type: 'square', at: 0.1 }); }
        });
        return;
      case 'fizzle':
        S.synth(function (s) { s.noise({ dur: 0.1, freq: 900, q: 1, gain: 0.05 }); });
        return;
      case 'clash':
        S.synth(function (s) { s.noise({ dur: 0.08, freq: 4200, q: 4, gain: 0.25, type: 'bandpass' }); s.osc({ dur: 0.12, f0: 900, f1: 500, gain: 0.08, type: 'square' }); });
        return;
      case 'deflect':
        S.synth(function (s) { s.osc({ dur: 0.1, f0: 1500, f1: 1100, gain: 0.08, type: 'triangle' }); s.noise({ dur: 0.06, freq: 5000, q: 3, gain: 0.1 }); });
        return;
      case 'teleport': // gone, and back
        S.synth(function (s) { s.noise({ dur: 0.14, freq: 500, q: 0.8, gain: 0.18, type: 'lowpass' }); s.osc({ dur: 0.18, f0: 300, f1: 900, gain: 0.05, type: 'triangle', at: 0.05 }); });
        return;
      case 'burst':
        S.synth(function (s) { s.osc({ dur: 0.3, f0: 120, f1: 40, gain: 0.5 }); s.noise({ dur: 0.35, freq: 1800, q: 0.6, gain: 0.25 }); });
        return;
    }
    basePlay(ev);
  };
})();
