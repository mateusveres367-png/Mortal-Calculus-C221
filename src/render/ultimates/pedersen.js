// PEDERSEN — Horsepower: he puts on his sunglasses, gets into his red sports car,
// revs the engine and drives straight across the stage into the opponent, who bounces
// off the hood cartoon-style. The car skids to a stop and he leans out of the window:
// "You can lead a horse to water, but you can't make them drink."
// Camera: a close-up on the shades, low and tilted for the car, a whip-pan tracking
// it across the stage, then an iris out on him, cartoon-style.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, GY = C.GROUND_Y, K = FG.ultKit;
  var SHADES = 6, ARRIVE = [24, 46], DOOR = [46, 66], WIDE = 68, REVS = [74, 86, 98], GO = 108, SKID = 128, LEAN = 186, IRIS = 274, BACK = 290;
  var CS = 1.5, CAR_START = -230, OPP = 150, STOP = 150, HALF = 75 * CS;
  var LINE = "You can lead a horse to water, but you can't make them drink.";

  // Where the car is (its middle, in set space) at frame t once it sets off.
  function carAt(t) {
    if (t < GO) return CAR_START;
    var hit = OPP - HALF + 8, tHit = 124;
    if (t <= tHit) { var u = (t - GO) / (tHit - GO); return CAR_START + (hit - CAR_START) * u * u; }
    // Then it slides to a stop.
    var v = Math.min(1, (t - tHit) / (SKID + 22 - tHit));
    return hit + (STOP - hit) * (1 - (1 - v) * (1 - v));
  }

  // The engine, revving (k: how hard).
  function rev(fx, k) {
    fx.sfx(function (S) {
      S.osc({ dur: 0.55, f0: 70 + k * 10, f1: 160 + k * 60, gain: 0.09, type: 'sawtooth', attack: 0.05 });
      S.osc({ dur: 0.55, f0: 140 + k * 20, f1: 320 + k * 120, gain: 0.04, type: 'square', attack: 0.05 });
      S.noise({ dur: 0.5, freq: 300, f1: 900, q: 0.8, gain: 0.12, type: 'lowpass' });
    });
  }

  FG.ULTIMATES.pedersen = {
    start: function (fx) {
      var s = fx.s, w = fx.w;
      s.sw = fx.S(fx.x0); s.car = s.sw - 400; s.door = 0; s.hp = 0;
      fx.hideCars = true;
      fx.place(fx.l, s.sw + 50, 0); fx.pose(fx.l, 'hit_mid');
      fx.anim(w, [[1, 'stand'], [SHADES, 'shades_on'], [18, 'shades_on'], [24, 'calm']]);
      fx.cam(s.sw + 4, 100 * w.def.scale, 2.3, { k: 0.25 });
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits;
      // The sunglasses go on, and catch the light.
      if (t === SHADES + 4) { w._props = { shades: true, glint: -1 }; fx.sfx(function (S) { S.noise({ dur: 0.03, freq: 3500, q: 5, gain: 0.2 }); }); }
      if (t >= 14 && t <= 24) { w._props.glint = (t - 14) / 10; if (t === 14) fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 3000, f1: 4200, gain: 0.04, type: 'triangle' }); }); }
      // The car rolls up beside him.
      if (t === ARRIVE[0]) {
        fx.cam(s.sw - 70, 64, 1.3, { k: 0.12, rot: -0.05 });
        fx.sfx(function (S) { S.osc({ dur: 0.7, f0: 60, f1: 85, gain: 0.08, type: 'sawtooth', attack: 0.4 }); S.noise({ dur: 0.7, freq: 250, q: 0.7, gain: 0.14, type: 'lowpass', attack: 0.4 }); });
      }
      if (t >= ARRIVE[0] && t <= ARRIVE[1]) s.car = s.sw - 400 + (330) * (1 - Math.pow(1 - (t - ARRIVE[0]) / (ARRIVE[1] - ARRIVE[0]), 2));
      // In he gets.
      if (t >= DOOR[0] && t <= DOOR[1]) s.door = Math.sin((t - DOOR[0]) / (DOOR[1] - DOOR[0]) * Math.PI);
      if (t === DOOR[0] + 6) fx.place(w, s.sw - 50, 0);
      if (t === DOOR[0] + 10) { w._hidden = true; }
      if (t === DOOR[1]) fx.sfx(function (S) { S.osc({ dur: 0.12, f0: 140, f1: 70, gain: 0.5 }); S.noise({ dur: 0.08, freq: 900, q: 1, gain: 0.2 }); });
      // A wide shot: the car at one end, them at the other.
      if (t === WIDE) {
        s.car = CAR_START; s.wide = true;
        fx.place(l, OPP, 0); fx.face(l, -fx.dir); fx.anim(l, FG.dazedAnim, true);
        fx.cam(-20, 70, 1.05, { cut: true, rot: -0.04 });
      }
      REVS.forEach(function (at, k) { if (t === at) { rev(fx, k); s.revT = t; s.revK = k; fx.dust(fx.X(CAR_START - HALF - 4), 4 + k * 2, 1 + k); } });
      if (t > REVS[0] && t < GO) s.hp = Math.min(700, s.hp + 14);
      // Off it goes.
      if (t === GO) {
        fx.sfx(function (S) { S.noise({ dur: 0.5, freq: 2600, q: 6, gain: 0.18 }); S.osc({ dur: 1.0, f0: 90, f1: 260, gain: 0.1, type: 'sawtooth' }); });
        s.go = t;
      }
      if (t >= GO) s.car = carAt(t);
      if (t >= GO && t < hits[0] + 30) fx.cam(s.car + 90, 70, 1.15, { k: 0.35, rot: -0.03 });
      if (t > GO && t < SKID + 20 && t % 3 === 0) fx.dust(fx.X(s.car - HALF), 3, 2);
      // Bonk: off the hood and up, cartoon-style.
      if (t === hits[0]) {
        fx.hit(l, 'power', { ch: true, hits: 1, shake: 0.03, y: 40 });
        fx.pose(l, 'juggle'); fx.flash(0xffffff, 0.8); fx.slow(20, 0.4);
        s.boing = t;
        fx.sfx(function (S) { S.osc({ dur: 0.2, f0: 160, f1: 60, gain: 0.7 }); S.noise({ dur: 0.12, freq: 1500, q: 1, gain: 0.3 }); S.osc({ dur: 0.7, f0: 220, f1: 660, gain: 0.08, vib: [14, 80] }); });
        fx.crowd(3);
      }
      if (t > hits[0] && t < hits[1]) {
        var u = (t - hits[0]) / (hits[1] - hits[0]);
        fx.place(l, OPP - 140 * u, Math.sin(u * Math.PI) * 130 + 10 * (1 - u));
        l._drawRot = fx.dir * u * Math.PI * 3;
      }
      if (t === SKID) { s.skid = t; fx.sfx(function (S) { S.noise({ dur: 1.0, freq: 2600, f1: 1700, q: 7, gain: 0.2 }); S.noise({ dur: 0.9, freq: 600, q: 0.6, gain: 0.1 }); }); }
      // Down they come behind it, and bounce once.
      if (t === hits[1]) {
        l._drawRot = 0; fx.place(l, OPP - 140, 0); fx.pose(l, 'down');
        fx.hit(l, 'overhead', { hits: 2, shake: 0.015, y: 10 });
        fx.sfx(function (S) { S.osc({ dur: 0.4, f0: 300, f1: 520, gain: 0.06, vib: [16, 60] }); });
        s.bounce = t;
      }
      if (t > hits[1] && t < hits[1] + 12) fx.place(l, OPP - 140, Math.sin((t - hits[1]) / 12 * Math.PI) * 14);
      if (t === hits[1] + 12) { fx.place(l, OPP - 140, 0); fx.dust(fx.px(l), 6, 2); }
      // He leans out of the window.
      if (t === LEAN) {
        w._hidden = false; fx.face(w, -fx.dir); fx.pose(w, 'lean_out');
        fx.place(w, s.car + 18 * CS, -6);
        fx.say(w, LINE, IRIS - LEAN);
        fx.cam(s.car, 64, 1.55, { k: 0.12, rot: 0.03 });
        fx.sfx(function (S) { S.osc({ dur: 0.2, f0: 520, gain: 0.05, type: 'triangle' }); S.osc({ dur: 0.3, f0: 660, gain: 0.05, type: 'triangle', at: 0.12 }); });
      }
      // That's all: an iris closes on him, and opens on the stage.
      if (t === IRIS) s.iris = t;
      if (t === BACK) {
        s.wide = false; s.car = null; fx.hideCars = false;
        fx.place(w, s.sw, 0); fx.face(w, fx.dir); fx.pose(w, 'calm');
        fx.place(l, s.sw + 110, 0); fx.pose(l, 'down'); l._drawRot = 0;
        fx.cam(s.sw + 55, 112, 1.1, { cut: true });
      }
    },
    draw: function (fx, t) {
      var s = fx.s, gb = fx.gb, gf = fx.gf, w = fx.w;
      if (s.car != null && t >= ARRIVE[0]) {
        var rock = s.revT && t - s.revT < 12 ? Math.sin((t - s.revT) * 1.6) * (1 + s.revK) * 0.8 : 0;
        var skid = s.skid && t - s.skid < 22 ? -1.5 : 0, cx = fx.X(s.car), gy = GY - rock * 0.5 + skid;
        // Skid marks behind the back wheels.
        if (s.skid) {
          var from = carAt(s.skid) - HALF + 30 * CS, to = s.car - HALF + 30 * CS;
          fx.rect(gb, Math.min(from, to), -3, Math.max(from, to), -1, 0x111111, 0.7);
          fx.rect(gb, Math.min(from, to) + 140, -3, Math.max(from, to) + 140, -1, 0x111111, 0.5);
        }
        var opts = { scale: CS, facing: fx.dir, door: s.door, wheelSpin: s.go ? (t - s.go) * 0.9 : 0, lights: 1 };
        FG.drawCar(gb, cx, gy, opts);
        // Him at the wheel: a head and shades in the window.
        if (w._hidden && t > DOOR[1] - 2) {
          var hp = fx.P(s.car + 10 * CS, 50 * CS);
          gb.fillStyle(0xe8b48c, 1); gb.fillCircle(hp.x, hp.y, 7);
          gb.fillStyle(0x5a3a22, 1); gb.fillRect(hp.x - 7, hp.y - 8, 14, 5);
          gb.fillStyle(0x0b0b10, 1); gb.fillRect(hp.x + fx.dir * 1 - 4, hp.y - 3, 8, 3);
        }
        // Leaning out: the door's lower half over his legs.
        if (!w._hidden && t >= LEAN) FG.drawCar(gf, cx, gy, { scale: CS, facing: fx.dir, lower: true });
        // Speed lines and tyre smoke as it goes.
        if (s.go && t < SKID + 20) {
          for (var k = 0; k < 8; k++) { var ly = GY - 10 - K.hash(k, 2) * 90; gb.fillStyle(0xffffff, 0.35); gb.fillRect(fx.X(s.car - HALF - 20 - K.hash(k, 3) * 160), ly, -fx.dir * (40 + K.hash(k, 4) * 60), 2); }
        }
      }
      // The tachometer and the horsepower climbing.
      if (s.wide && t < GO + 16) {
        var g = fx.gs, cx2 = W - 86, cy2 = 300, r = 44, rpm = Math.min(1, (s.revT ? 0.3 + 0.25 * s.revK + Math.max(0, 0.2 - (t - s.revT) * 0.01) : 0.1) + (t >= GO ? 0.4 : 0));
        g.fillStyle(0x0b0b10, 0.9); g.fillCircle(cx2, cy2, r + 6);
        g.lineStyle(3, 0xffffff, 0.9); g.beginPath(); g.arc(cx2, cy2, r, Math.PI * 0.8, Math.PI * 2.2); g.strokePath();
        g.lineStyle(5, 0xff3d3d, 1); g.beginPath(); g.arc(cx2, cy2, r - 3, Math.PI * 1.9, Math.PI * 2.2); g.strokePath();
        var a = Math.PI * 0.8 + rpm * Math.PI * 1.4;
        g.lineStyle(3, 0xffd23f, 1); g.lineBetween(cx2, cy2, cx2 + Math.cos(a) * (r - 6), cy2 + Math.sin(a) * (r - 6));
        fx.text(0, s.hp + ' HP', cx2, cy2 + 26, s.hp >= 700 ? 0xff3d3d : 0xffffff, 1.6);
        fx.text(1, 'RPM', cx2, cy2 - 14, 0x8d93a6, 1);
      }
      if (s.revT && t - s.revT < 20 && t < GO) fx.text(2, ['VROOM', 'VROOOM', 'VROOOOOM!'][s.revK], W / 2 - 120, 100, 0xff3d3d, 2 + s.revK, -8, 1 - (t - s.revT) / 20);
      if (s.boing && t - s.boing < 40) { var bp = fx.at2(fx.l, 60); fx.text(3, 'BOING!', bp[0], bp[1] - 40, 0xffd23f, 4 * K.stamp(t, s.boing), -10); }
      if (s.skid && t - s.skid < 30) fx.text(4, 'SCREEEECH', W / 2 + 80, 250, 0xffffff, 2.2, 4, 1 - (t - s.skid) / 30);
      // Stars round their head once they're down.
      if (s.bounce && t > s.bounce + 12 && t < BACK) {
        var sp = fx.at2(fx.l, 16);
        for (var st = 0; st < 3; st++) { var ang = t * 0.12 + st * 2.1; fx.gs.fillStyle(0xffd23f, 1); fx.gs.fillCircle(sp[0] + Math.cos(ang) * 16, sp[1] + Math.sin(ang) * 5 - 10, 3); }
      }
      // The iris: a black ring closing on him, then opening on the stage.
      if (s.iris) {
        var p = fx.at2(w, 70), u = t < BACK ? (t - s.iris) / (BACK - s.iris) : 1 - (t - BACK) / 14;
        if (u > 0) {
          var rad = Math.max(0, 700 * (1 - u)), gs = fx.gs, cxx = t < BACK ? p[0] : W / 2, cyy = t < BACK ? p[1] : H / 2;
          gs.lineStyle(1400, 0x000000, 1); gs.strokeCircle(cxx, cyy, rad + 700);
          if (rad < 2) { gs.fillStyle(0x000000, 1); gs.fillRect(0, 0, W, H); }
        }
      }
      // Sunglasses glint while he talks.
      if (t >= LEAN && t < IRIS && w._props) w._props.glint = ((t - LEAN) % 60) / 20;
    }
  };
})();
