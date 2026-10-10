// MAX — Finals Week: a double-leg shot straight through them, up and down onto the mat
// (TAKEDOWN). He takes the mount and a calendar page slams up, MON to FRI, an exam a
// day; every ground strike crosses one off. They turn away to cover up, he takes the
// back, sits them up and sinks a rear naked choke: a struggle meter fills on its own,
// whatever they do, until they TAP. "Pencils down."
// Camera: low and fast on the shot, a crash zoom on the slam, tilted over the mount, then
// tight on the two faces for the choke and a hold on the tap.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H, K = FG.ultKit;
  var SHOOT = 4, MOUNT = 58, TURN = 148, CHOKE = 166, LETGO = 262;
  var DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  FG.ULTIMATES.max = {
    start: function (fx) {
      var s = fx.s;
      s.ls = fx.S(fx.lx0); // where they were standing (set space)
      fx.place(fx.w, 0, 0); fx.face(fx.w, fx.dir); fx.pose(fx.w, 'dl_x');
      fx.place(fx.l, s.ls, 0); fx.face(fx.l, -fx.dir); fx.pose(fx.l, 'hit_mid');
      fx.cam(s.ls * 0.5, 70, 1.7, { k: 0.4 });
      s.crossed = 0;
    },
    step: function (fx, t) {
      var w = fx.w, l = fx.l, s = fx.s, hits = w.def.ultimate.hits, dir = fx.dir, SLAM = hits[0], TAP = hits[hits.length - 1];
      // The shot: he drives through their hips and lifts them off the floor...
      if (t === SHOOT) {
        fx.pose(w, 'dl_lift');
        fx.cam(s.ls - 6, 56, 2.0, { cut: true, rot: 0.04 });
        fx.sfx(function (S) { S.noise({ dur: 0.25, freq: 700, f1: 1800, q: 1, gain: 0.25 }); S.osc({ dur: 0.2, f0: 140, f1: 70, gain: 0.4 }); });
      }
      if (t > SHOOT && t < SLAM) {
        var u = (t - SHOOT) / (SLAM - SHOOT);
        if (t === SHOOT + 14) fx.pose(w, 'throw_lift');
        fx.place(w, s.ls * (0.4 + 0.3 * u), 0);
        fx.place(l, s.ls + 12 * u, Math.sin(u * Math.PI) * 50);
        l._drawRot = -dir * u * 1.5; fx.pose(l, 'juggle');
      }
      // ...and down on the mat.
      if (t === SLAM) {
        l._drawRot = 0; fx.place(l, s.ls + 14, 0); fx.pose(l, 'down');
        fx.place(w, s.ls - 26, 0); fx.pose(w, 'dl_r');
        fx.hit(l, 'overhead', { strength: 'heavy', shake: 0.03, y: 14, hits: 1 });
        fx.flash(0xffffff, 0.5); fx.dust(fx.X(s.ls + 14), 18, 3);
        s.label = { text: 'TAKEDOWN', t: t };
        fx.cam(s.ls, 40, 2.1, { cut: true });
        fx.sfx(function (S) { S.osc({ dur: 0.6, f0: 90, f1: 26, gain: 0.9 }); S.noise({ dur: 0.35, freq: 600, q: 0.5, gain: 0.4 }); });
      }
      // The mount: on top of them. Finals week.
      if (t === MOUNT) {
        fx.place(w, s.ls + 14, 6); fx.pose(w, 'mount'); s.cal = t;
        fx.cam(s.ls + 10, 70, 1.6, { k: 0.15, rot: -0.05 });
        fx.sfx(function (S) { S.osc({ dur: 0.5, f0: 220, f1: 110, gain: 0.3, type: 'sawtooth' }); S.osc({ dur: 0.6, f0: 233, f1: 116, gain: 0.2, type: 'square' }); });
      }
      // Ground strikes, one per exam: the palm comes down, a day is crossed off.
      for (var k = 1; k <= 5; k++) {
        var at = hits[k];
        if (t === at - 6) fx.pose(w, 'gnp_c');
        if (t === at) {
          fx.pose(w, 'gnp_x');
          fx.hit(l, 'overhead', { strength: 'medium', hits: k + 1, y: 14, shake: 0.008 });
          s.crossed = k; s.crossT = t;
          var f0 = 200 + k * 30;
          fx.sfx(function (S) { S.osc({ dur: 0.12, f0: f0, f1: 60, gain: 0.5 }); S.noise({ dur: 0.06, freq: 2200, q: 1.4, gain: 0.25, type: 'bandpass' }); });
        }
      }
      // They turn away to cover up; he takes the back and sits them up into the choke.
      if (t === TURN) { fx.anim(w, [[1, 'gnp_x'], [10, 'crouch']]); fx.anim(l, [[1, 'down'], [14, 'v_rnc']]); fx.face(l, dir); fx.cam(s.ls, 60, 1.7, { k: 0.15 }); }
      if (t === CHOKE) {
        fx.place(l, s.ls + 14, 0); fx.place(w, s.ls + 14 - C.SUB_GAP * w.def.scale, 0);
        fx.pose(w, 'sub_rnc'); fx.pose(l, 'v_rnc'); s.choke = t;
        s.label = { text: 'REAR NAKED CHOKE', t: t };
        fx.cam(s.ls + 4, 46, 2.4, { cut: true });
        fx.sfx(function (S) { S.osc({ dur: 0.3, f0: 120, f1: 60, gain: 0.5 }); S.noise({ dur: 0.2, freq: 500, q: 1, gain: 0.2 }); });
      }
      // The squeeze: the meter fills on its own; they struggle, it doesn't matter.
      if (s.choke && t > CHOKE && t < TAP) {
        var q = (t - CHOKE) / (TAP - CHOKE);
        s.meter = 30 + 70 * q;
        fx.pose(w, q > 0.4 && t % 10 < 5 ? 'sub_rnc2' : 'sub_rnc');
        fx.pose(l, t % 6 < 3 ? 'v_rnc' : 'v_rnc2');
        if (t % 12 === 0) fx.sfx(function (S) { S.osc({ dur: 0.15, f0: 70 + q * 60, f1: 50, gain: 0.25, type: 'sawtooth' }); });
      }
      // TAP.
      if (t === TAP) {
        s.tap = t; s.meter = 100;
        fx.hit(l, 'power', { ch: true, shake: 0.04, y: 40, hits: hits.length });
        fx.flash(0xffd23f, 0.6); fx.slow(30, 0.3); fx.crowd(3);
        fx.cam(s.ls + 8, 40, 2.6, { cut: true, rot: -0.03 });
        fx.sfx(function (S) { S.osc({ dur: 1, f0: 80, f1: 24, gain: 1 }); for (var p = 0; p < 3; p++) S.noise({ dur: 0.05, freq: 2200, q: 2, gain: 0.5, type: 'bandpass', at: 0.15 + p * 0.13 }); });
      }
      if (s.tap && t > s.tap && t < LETGO) fx.pose(l, ((t - s.tap) >> 2) % 2 ? 'v_rnc2' : 'v_rnc_tap');
      // He lets go and gets up. Pencils down.
      if (t === LETGO) {
        fx.face(l, -dir); fx.pose(l, 'down');
        fx.place(w, s.ls - 30, 0); fx.anim(w, [[1, 'sub_rnc'], [14, 'crouch'], [26, 'stand'], [40, 'flex']]);
        fx.say(w, 'Pencils down.', 70);
        fx.cam(s.ls - 10, 100, 1.3, { k: 0.1 });
      }
    },
    draw: function (fx, t) {
      var s = fx.s, gs = fx.gs;
      // The calendar page, every day an exam, crossed off one by one.
      if (s.cal && t < TURN + 8) {
        var sc = K.stamp(t, s.cal), cx = W / 2, cy = 146, cw = 300 * sc, ch = 104 * sc;
        gs.fillStyle(0x000000, 0.4); gs.fillRect(cx - cw / 2 + 6, cy - ch / 2 + 6, cw, ch);
        gs.fillStyle(0xf8f4e8, 1); gs.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
        gs.fillStyle(0x2b3a5a, 1); gs.fillRect(cx - cw / 2, cy - ch / 2, cw, 22 * sc);
        for (var d = 0; d < 5; d++) {
          var dx = cx - cw / 2 + (d + 0.5) * cw / 5, dy = cy + 12 * sc;
          gs.lineStyle(1, 0xb8b4a8, 1); gs.lineBetween(cx - cw / 2 + (d + 1) * cw / 5, cy - ch / 2 + 22 * sc, cx - cw / 2 + (d + 1) * cw / 5, cy + ch / 2);
          fx.text(d + 1, DAYS[d], dx, cy - ch / 2 + 32 * sc, 0x2a2a30, 1.2 * sc);
          gs.lineStyle(2, 0xffa83a, 1); gs.strokeCircle(dx, dy, 13 * sc);
          if (d < s.crossed) { // crossed off: a red X, slammed on
            var xs = (d === s.crossed - 1 ? K.stamp(t, s.crossT) : 1) * 12 * sc;
            gs.lineStyle(4, 0xc0392b, 1); gs.lineBetween(dx - xs, dy - xs, dx + xs, dy + xs); gs.lineBetween(dx - xs, dy + xs, dx + xs, dy - xs);
          }
        }
        fx.text(0, 'FINALS WEEK', cx, cy - ch / 2 + 11 * sc, 0xffa83a, 2 * sc);
      }
      if (s.label && t - s.label.t < 34) fx.text(6, s.label.text, W / 2, 92, 0xffa83a, 3 * K.stamp(t, s.label.t), -4);
      // The choke: a struggle meter that only goes one way.
      if (s.choke && t < LETGO) {
        var bw = 220, bx = W / 2 - bw / 2, by = 300, u = Math.min(1, (s.meter || 0) / 100);
        gs.fillStyle(0x0a0a10, 0.85); gs.fillRect(bx - 4, by - 4, bw + 8, 22);
        gs.fillStyle(0x34343e, 1); gs.fillRect(bx, by, bw, 14);
        gs.fillStyle(u > 0.8 ? 0xff4a3d : u > 0.55 ? 0xff8a1f : 0xffd23f, 1); gs.fillRect(bx, by, Math.round(bw * u), 14);
        if (!s.tap && (t >> 3) % 2 === 0) fx.text(7, 'MASH!', W / 2, by + 30, 0xffffff, 2);
      }
      if (s.tap && t - s.tap < 26) fx.text(8, 'TAP!', W / 2, 130, 0xff4a3d, 5 * K.stamp(t, s.tap), -6);
    }
  };
})();
