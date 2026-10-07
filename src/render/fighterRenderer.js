// Draws a placeholder fighter as a chunky jointed figure from FG.POSES.
// Poses are picked from the simulation state; attacks use their keyframes.
(function () {
  var C = FG.C, POSES = FG.POSES;
  var N = 22;

  function lerp(a, b, t) {
    var out = new Array(N);
    for (var i = 0; i < N; i++) out[i] = a[i] + (b[i] - a[i]) * t;
    return out;
  }
  function ease(t) { return t * t * (3 - 2 * t); }

  // Interpolate attack keyframes [[frame, pose], ...] at the given move frame.
  function keyframed(anim, frame) {
    if (frame <= anim[0][0]) return POSES[anim[0][1]];
    for (var i = 1; i < anim.length; i++) {
      if (frame <= anim[i][0]) {
        var a = anim[i - 1], b = anim[i];
        return lerp(POSES[a[1]], POSES[b[1]], ease((frame - a[0]) / (b[0] - a[0])));
      }
    }
    return POSES[anim[anim.length - 1][1]];
  }

  // Target pose for the fighter's current state. `t` is a free-running frame counter.
  function targetPose(f, t) {
    var s = f.state, p;
    switch (s) {
      case 'attack': return keyframed(f.move.anim, f.moveFrame);
      case 'walkF':
      case 'walkB': {
        p = POSES.idle.slice();
        var ph = f.stateFrame * (s === 'walkF' ? 0.22 : -0.2);
        var sw = Math.sin(ph) * 5;
        p[16] += sw; p[20] -= sw;                       // feet slide
        p[17] += Math.max(0, Math.cos(ph)) * 3;          // lift front foot
        p[21] += Math.max(0, -Math.cos(ph)) * 3;         // lift back foot
        p[14] += sw * 0.6; p[18] -= sw * 0.6;            // knees follow
        var bob = Math.abs(Math.sin(ph)) * 1.5;
        for (var i = 1; i < 14; i += 2) p[i] -= bob;
        return p;
      }
      case 'crouch': return POSES.crouch;
      case 'prejump':
      case 'land': return POSES.squat;
      case 'air': return f.vy > 2 ? lerp(POSES.squat, POSES.jump, 0.7) : POSES.jump;
      case 'dash': return f.stateFrame < 10 ? POSES.dash : lerp(POSES.dash, POSES.idle, (f.stateFrame - 10) / 6);
      case 'backdash': return f.stateFrame < 14 ? POSES.backdash : lerp(POSES.backdash, POSES.idle, (f.stateFrame - 14) / 8);
      case 'sidestep': return lerp(POSES.idle, POSES.squat, Math.sin(Math.PI * f.stateFrame / C.SIDESTEP_FRAMES) * 0.5);
      case 'blockstun': return f.guardCrouch ? POSES.cblock : POSES.block;
      case 'hitstun': {
        var hp = POSES['hit_' + f.reaction];
        return f.stun < 6 ? lerp(POSES.idle, hp, f.stun / 6) : hp;
      }
      case 'juggle': return POSES.juggle;
      case 'down':
      case 'ko': return POSES.down;
      case 'getup': {
        var g = f.stateFrame / C.GETUP_FRAMES;
        return g < 0.5 ? lerp(POSES.down, POSES.crouch, ease(g * 2)) : lerp(POSES.crouch, POSES.idle, ease((g - 0.5) * 2));
      }
      default: {
        // Idle: breathing.
        p = POSES.idle.slice();
        var br = Math.sin(t * 0.09 + f.index * 2) * 1.2;
        for (var j = 3; j < 14; j += 2) p[j] += br;
        return p;
      }
    }
  }

  // Smoothly blend toward the target, except during attacks and on fresh hits (snap for impact).
  FG.updatePose = function (f, t) {
    var target = targetPose(f, t);
    var snap = f.state === 'attack' || (f.state === 'hitstun' && f.stateFrame <= 1) || f.state === 'juggle';
    if (!f._pose || snap) f._pose = target.slice();
    else f._pose = lerp(f._pose, target, 0.45);
  };

  function shade(c, k) {
    var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    return (Math.min(255, r * k) << 16) | (Math.min(255, g * k) << 8) | Math.min(255, b * k);
  }

  // Draw one fighter. opts: { flash: color|null, jitter: px }
  FG.drawFighter = function (g, f, opts) {
    var p = f._pose;
    if (!p) return;
    var def = f.def, col = def.colors;
    var depth = 1 - f.z * 0.004;
    var s = def.scale * depth;
    var dir = f.facing;
    var ox = Math.round(f.x + (opts.jitter || 0));
    var oy = Math.round(C.GROUND_Y - f.z * 0.5);
    var lift = f.y;
    function X(i) { return Math.round(ox + p[i * 2] * s * dir); }
    function Y(i) { return Math.round(oy - (p[i * 2 + 1] * s + lift)); }

    // Shadow stays on the floor and shrinks with height.
    var sh = Math.max(0.4, 1 - lift / 160);
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(ox, oy + 1, 46 * s * sh, 8 * sh);

    var flash = opts.flash;
    function c(v) { return flash != null ? flash : v; }

    function limb(a, b, w, color) {
      g.lineStyle(Math.max(2, Math.round(w * s)), c(color), 1);
      g.lineBetween(X(a), Y(a), X(b), Y(b));
      // Round the joint so bent limbs don't look broken.
      g.fillStyle(c(color), 1);
      g.fillCircle(X(b), Y(b), Math.max(1, Math.round(w * s * 0.5)));
    }
    function block(i, w, h, color, fwd) {
      var bx = X(i), by = Y(i);
      g.fillStyle(c(color), 1);
      g.fillRect(Math.round(bx - (fwd ? (dir > 0 ? 1 : w * s - 1) : w * s / 2)), Math.round(by - h * s / 2), Math.round(w * s), Math.round(h * s));
    }

    // Joint indices: 0 hip, 1 chest, 2 head, 3 fElbow, 4 fHand, 5 bElbow, 6 bHand, 7 fKnee, 8 fFoot, 9 bKnee, 10 bFoot
    // Back limbs first, in darker shades.
    limb(0, 9, 9, col.legsDark); limb(9, 10, 7, col.legsDark);
    block(10, 10, 4, shade(col.shoes, 0.7), true);
    limb(1, 5, 7, col.topDark); limb(5, 6, 6, shade(col.skin, 0.8));
    block(6, 7, 7, shade(col.skin, 0.8));

    // Torso: a quad from hips to shoulders.
    var hx = X(0), hy = Y(0), cx = X(1), cy = Y(1);
    var vx = cx - hx, vy = cy - hy, len = Math.sqrt(vx * vx + vy * vy) || 1;
    var nx = -vy / len, ny = vx / len;
    var wc = 9 * s, wh = 7 * s;
    g.fillStyle(c(col.top), 1);
    g.fillPoints([
      { x: hx + nx * wh, y: hy + ny * wh }, { x: cx + nx * wc, y: cy + ny * wc },
      { x: cx - nx * wc, y: cy - ny * wc }, { x: hx - nx * wh, y: hy - ny * wh }
    ], true);
    // Belt.
    g.fillStyle(c(col.accent), 1);
    g.fillRect(Math.round(hx - 8 * s), Math.round(hy - 2 * s), Math.round(16 * s), Math.round(3 * s));
    // Neck and head.
    var hdx = X(2), hdy = Y(2);
    g.lineStyle(Math.round(5 * s), c(col.skin), 1);
    g.lineBetween(cx, cy, Math.round((cx + hdx) / 2), Math.round((cy + hdy) / 2));
    g.fillStyle(c(col.skin), 1);
    g.fillCircle(hdx, hdy, Math.round(7 * s));
    g.fillStyle(c(col.hair), 1);
    g.fillRect(Math.round(hdx - 7 * s), Math.round(hdy - 8 * s), Math.round(14 * s), Math.round(5 * s));
    g.fillRect(Math.round(hdx - (dir > 0 ? 7 : -3) * s), Math.round(hdy - 6 * s), Math.round(4 * s), Math.round(7 * s));
    if (flash == null) {
      g.fillStyle(0x111111, 1);
      g.fillRect(Math.round(hdx + 3 * s * dir), Math.round(hdy - 2 * s), Math.max(1, Math.round(2 * s)), Math.max(1, Math.round(2 * s)));
    }

    // Front limbs on top.
    limb(0, 7, 9, col.legs); limb(7, 8, 7, col.legs);
    block(8, 11, 5, col.shoes, true);
    limb(1, 3, 7, col.top); limb(3, 4, 6, col.skin);
    block(4, 7, 7, col.skin);
  };

  // Debug overlay: hurtboxes (green), hitbox (red), pushbox (yellow line).
  FG.drawBoxes = function (g, f) {
    var gy = C.GROUND_Y;
    var hurts = f.hurtboxes();
    g.lineStyle(1, 0x3cff6e, 0.9);
    for (var i = 0; i < hurts.length; i++) {
      var h = hurts[i];
      g.strokeRect(h.x1, gy - h.y2, h.x2 - h.x1, h.y2 - h.y1);
    }
    var hb = f.hitbox(0);
    if (hb) {
      var active = f.isActiveFrame() && !f.contact;
      g.fillStyle(0xff2a2a, active ? 0.45 : 0.12);
      g.fillRect(hb.x1, gy - hb.y2, hb.x2 - hb.x1, hb.y2 - hb.y1);
      g.lineStyle(1, 0xff2a2a, active ? 1 : 0.4);
      g.strokeRect(hb.x1, gy - hb.y2, hb.x2 - hb.x1, hb.y2 - hb.y1);
    }
    var w = C.PUSH_WIDTH * f.def.scale;
    g.lineStyle(1, 0xffe14a, 0.8);
    g.lineBetween(f.x - w, gy + 3, f.x + w, gy + 3);
  };
})();
