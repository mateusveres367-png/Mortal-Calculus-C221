// PEDERSEN's car: a red mid-engine sports car in side view, drawn in code.
// Styled after a modern mid-engine coupe; no real badges or logos.
// Coordinates are in car space: x from the rear bumper (0) to the nose (150),
// y up from the ground; drawn mirrored when facing left.
(function () {
  var RED = 0xc8161c, RED_DARK = 0x8a0d12, RED_LIGHT = 0xf04a4a, GLASS = 0x141821, TRIM = 0x1c1c22;

  var BODY = [[0, 10], [0, 27], [8, 31], [44, 34], [62, 39], [74, 44], [96, 44], [118, 33], [140, 26], [149, 22], [150, 12], [140, 8], [8, 8]];
  var LOWER = [[0, 10], [0, 18], [150, 18], [150, 12], [140, 8], [8, 8]];
  var GLASSES = [[60, 36], [74, 42], [95, 42], [114, 33], [62, 33]];
  var INTAKE = [[50, 30], [64, 34], [68, 22], [52, 18]];
  var DOOR = [[64, 33], [114, 33], [112, 16], [70, 14]];

  // opts: { scale, facing (1 = nose to the right), door (0..1 open), wheelSpin (radians), alpha }
  FG.drawCar = function (g, x, groundY, opts) {
    opts = opts || {};
    var s = opts.scale || 1, dir = opts.facing || 1, a = opts.alpha == null ? 1 : opts.alpha;
    function P(pt) { return { x: Math.round(x + (pt[0] - 75) * s * dir), y: Math.round(groundY - pt[1] * s) }; }
    function poly(points, color) { g.fillStyle(color, a); g.fillPoints(points.map(P), true); }

    // Shadow.
    g.fillStyle(0x000000, 0.35 * a);
    g.fillEllipse(x, groundY + 1, 150 * s, 9 * s);
    // Body.
    poly(BODY, RED);
    poly(LOWER, RED_DARK);
    // Shoulder highlight along the beltline.
    g.lineStyle(Math.max(1, Math.round(1.5 * s)), RED_LIGHT, a);
    var h1 = P([10, 30]), h2 = P([60, 35]), h3 = P([118, 31]), h4 = P([146, 24]);
    g.lineBetween(h1.x, h1.y, h2.x, h2.y); g.lineBetween(h3.x, h3.y, h4.x, h4.y);
    // Glass and the side intake behind the door.
    poly(GLASSES, GLASS);
    poly(INTAKE, TRIM);
    // Door (swings up and out when open).
    if (opts.door > 0) {
      var o = opts.door;
      poly(DOOR.map(function (pt) { return [pt[0] + o * 6, pt[1] + o * 22]; }), RED);
      poly([[66, 34 + o * 22], [100, 34 + o * 22], [96, 40 + o * 18], [72, 40 + o * 18]], GLASS);
      poly(DOOR, 0x2a0a0c); // the open doorway
    } else {
      g.lineStyle(1, RED_DARK, a);
      var d1 = P([66, 32]), d2 = P([70, 15]), d3 = P([112, 16]);
      g.lineBetween(d1.x, d1.y, d2.x, d2.y); g.lineBetween(d2.x, d2.y, d3.x, d3.y);
    }
    // Mirror, lights.
    poly([[110, 34], [116, 34], [116, 31], [110, 31]], TRIM);
    poly([[0, 22], [3, 22], [3, 27], [0, 26]], 0xff5a2a);       // tail light
    poly([[138, 25], [148, 22], [148, 20], [138, 22]], 0xfff4c8); // headlight slit
    // Wheels: tyre, rim, spokes.
    [[30, 11], [122, 11]].forEach(function (w) {
      var c = P([w[0], w[1]]), r = 11 * s;
      g.fillStyle(0x0c0c0e, a); g.fillCircle(c.x, c.y, r + 1);
      g.fillStyle(0x7a7f8a, a); g.fillCircle(c.x, c.y, r * 0.58);
      g.fillStyle(0x30333a, a); g.fillCircle(c.x, c.y, r * 0.2);
      g.lineStyle(Math.max(1, Math.round(s)), 0x30333a, a);
      for (var k = 0; k < 5; k++) {
        var ang = (opts.wheelSpin || 0) + k * Math.PI * 2 / 5;
        g.lineBetween(c.x, c.y, c.x + Math.cos(ang) * r * 0.55, c.y + Math.sin(ang) * r * 0.55);
      }
    });
  };
})();
