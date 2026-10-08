// Draws fighters as chunky jointed pixel figures, styled from each fighter's
// `look` (hair, beard, glasses, clothes, accessories, build). Poses come from
// the simulation state; attacks, intros, victories and gestures use keyframes.
//
// Render-only fields on a fighter (never read by the simulation):
//   _pose      the pose currently drawn (_base before the motion layer)
//   _twist     shoulder / hip rotation from the motion layer
//   _feet, _strike, _trail, _react   motion layer state (motion.js)
//   _override  { anim, t, loop } intro / victory / defeat animation
//   _gesture   { anim, t } a short idle gesture (finger wag, glasses adjust...)
//   _face      { type, t } expression override: 'wince', 'squint', 'grin'
//   _blazer    LOPEZ's blazer is still on
(function () {
  var C = FG.C, POSES = FG.POSES;
  var N = 22;

  function lerp(a, b, t) {
    var out = new Array(N);
    for (var i = 0; i < N; i++) out[i] = a[i] + (b[i] - a[i]) * t;
    return out;
  }
  function ease(t) { return t * t * (3 - 2 * t); }

  // A fighter's own pose overrides the shared one of the same name.
  function getPose(def, name) {
    return (def.poses && def.poses[name]) || POSES[name] || POSES.idle;
  }
  FG.getPose = getPose;

  // Interpolate keyframes [[frame, pose], ...] at the given frame.
  function keyframed(def, anim, frame) {
    if (frame <= anim[0][0]) return getPose(def, anim[0][1]);
    for (var i = 1; i < anim.length; i++) {
      if (frame <= anim[i][0]) {
        var a = anim[i - 1], b = anim[i];
        return lerp(getPose(def, a[1]), getPose(def, b[1]), ease((frame - a[0]) / (b[0] - a[0])));
      }
    }
    return getPose(def, anim[anim.length - 1][1]);
  }
  FG.animLength = function (anim) { return anim[anim.length - 1][0]; };

  // The fighter's stance with its idle animation (breathing, bounce, sway).
  function idlePose(f, t) {
    var def = f.def, ia = def.idleAnim;
    var p = getPose(def, f.stance === 'B' ? 'pw_idle' : 'idle').slice();
    var ph = t * ia.rate + f.index * 2;
    var br = Math.sin(ph) * ia.breath;
    var bob = ia.bob ? Math.abs(Math.sin(ph * 1.5)) * ia.bob : 0;
    var sway = ia.sway ? Math.sin(ph * 0.5) * ia.sway : 0;
    for (var j = 0; j < 22; j += 2) {
      var upper = j >= 2 && j <= 12;
      if (upper) { p[j + 1] += br; p[j] += sway; }
      if (j < 14) p[j + 1] -= bob; // knees bend as the body dips
      if (j === 14 || j === 18) p[j + 1] -= bob * 0.5;
    }
    return p;
  }

  // Target pose for the fighter's current state. `t` is a free-running frame counter.
  function targetPose(f, t) {
    var def = f.def, s = f.state, p;
    if (f._override) {
      var o = f._override, len = FG.animLength(o.anim);
      return keyframed(def, o.anim, o.loop ? (o.t % len) + 1 : Math.min(o.t, len));
    }
    if (f._gesture && s === 'idle') return keyframed(def, f._gesture.anim, f._gesture.t);
    var P = function (n) { return getPose(def, n); };
    switch (s) {
      case 'attack': return keyframed(def, f.move.anim, f.moveFrame);
      case 'walkF':
      case 'walkB': {
        // The feet step for real (see motion.js); the body leans into the walk.
        p = idlePose(f, t);
        var lean = s === 'walkF' ? 1.5 : -1.5;
        for (var i = 2; i <= 12; i += 2) p[i] += lean * (p[i + 1] - p[1]) / 30;
        return p;
      }
      case 'crouch': return P('crouch');
      case 'prejump':
      case 'land': return P('squat');
      case 'air': return f.vy > 2 ? lerp(P('squat'), P('jump'), 0.7) : P('jump');
      case 'dash': return f.stateFrame < 10 ? P('dash') : lerp(P('dash'), P('idle'), (f.stateFrame - 10) / 6);
      case 'backdash': return f.stateFrame < 14 ? P('backdash') : lerp(P('backdash'), P('idle'), (f.stateFrame - 14) / 8);
      case 'sidestep': return lerp(P('idle'), P('squat'), Math.sin(Math.PI * f.stateFrame / C.SIDESTEP_FRAMES) * 0.5);
      case 'blockstun': return f.guardCrouch ? P('cblock') : P('block');
      case 'hitstun': {
        var hp = P('hit_' + f.reaction);
        return f.stun < 6 ? lerp(P('idle'), hp, f.stun / 6) : hp;
      }
      case 'juggle': return P('juggle');
      case 'wallsplat': return P('wall');
      case 'guardbreak': return f.stun < 6 ? lerp(P('idle'), P('gbreak'), f.stun / 6) : P('gbreak');
      case 'roll':
      case 'techroll': {
        var n = s === 'roll' ? C.ROLL_FRAMES : C.TECH_FRAMES;
        var r = f.stateFrame / n;
        return r < 0.75 ? P('roll') : lerp(P('roll'), P('idle'), ease((r - 0.75) * 4));
      }
      case 'throwbreak': return f.stateFrame < 10 ? P('backdash') : lerp(P('backdash'), P('idle'), (f.stateFrame - 10) / 6);
      case 'throwing': {
        var tf = f.stateFrame, hold = C.THROW_BREAK_WINDOW, slam = C.THROW_SLAM_FRAME;
        var reverse = f.lastMove && f.lastMove.reverse;
        var end = reverse ? P('throw_back') : P('throw_slam');
        if (tf <= hold) return P('grab_x');
        if (tf < slam) {
          var u = (tf - hold) / (slam - hold);
          return u < 0.5 ? lerp(P('grab_x'), P('throw_lift'), ease(u * 2)) : lerp(P('throw_lift'), end, ease((u - 0.5) * 2));
        }
        return lerp(end, P('idle'), Math.min(1, (tf - slam) / (C.THROW_END_FRAME - slam)));
      }
      case 'thrown': return f.stateFrame <= C.THROW_BREAK_WINDOW ? P('hit_mid') : P('juggle');
      case 'down':
      case 'ko': return P('down');
      case 'getup': {
        var gu = f.stateFrame / C.GETUP_FRAMES;
        return gu < 0.5 ? lerp(P('down'), P('crouch'), ease(gu * 2)) : lerp(P('crouch'), P('idle'), ease((gu - 0.5) * 2));
      }
      default: return idlePose(f, t);
    }
  }

  // Smoothly blend toward the target, except during attacks and on fresh hits (snap
  // for impact). Then the procedural motion layer (motion.js) adds anticipation,
  // weight shift, planted feet and reactions. opts.frozen: hitstop is on.
  FG.updatePose = function (f, t, opts) {
    // LOPEZ squints while his parry is up, before he counters.
    if (f.state === 'attack' && f.move && f.move.parry && f.def.parryFace) f._face = { type: f.def.parryFace, t: 2 };
    if (f._gesture && (f.state !== 'idle' || ++f._gesture.t > FG.animLength(f._gesture.anim))) f._gesture = null;
    if (f._face && --f._face.t <= 0) f._face = null;
    var target = targetPose(f, t);
    var snap = !f._override && (f.state === 'attack' || f.state === 'juggle' || f.state === 'thrown' || f.state === 'wallsplat' ||
      ((f.state === 'hitstun' || f.state === 'guardbreak') && f.stateFrame <= 1));
    if (!f._base || snap) f._base = target.slice();
    else f._base = lerp(f._base, target, f._override ? 0.6 : 0.45);
    f._pose = FG.applyMotion ? FG.applyMotion(f, f._base, opts) : f._base;
  };

  function shade(c, k) {
    var r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    return (Math.min(255, Math.round(r * k)) << 16) | (Math.min(255, Math.round(g * k)) << 8) | Math.min(255, Math.round(b * k));
  }
  FG.shade = shade;

  // --- Head ---------------------------------------------------------------------

  // Rect in head space: dx, dy from the head centre facing right, mirrored when facing left.
  function headRect(g, hx, hy, s, dir, dx, dy, w, h, color, alpha) {
    g.fillStyle(color, alpha == null ? 1 : alpha);
    var x = dir > 0 ? dx : -dx - w;
    g.fillRect(Math.round(hx + x * s), Math.round(hy + dy * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)));
  }

  function drawHair(g, hx, hy, s, dir, hair, c) {
    var R = function (dx, dy, w, h, col) { headRect(g, hx, hy, s, dir, dx, dy, w, h, c(col)); };
    var col = hair.color, hi = hair.highlight, gray = hair.gray;
    switch (hair.style) {
      case 'up': // styled up and back
        R(-7, -9, 12, 4, col); R(-2, -11, 7, 3, col); R(-8, -7, 4, 8, col); R(3, -10, 2, 1, shade(col, 1.4));
        break;
      case 'spiky':
        R(-7, -8, 13, 3, col); R(-8, -6, 3, 6, col);
        R(-6, -10, 2, 2, col); R(-3, -11, 2, 3, col); R(0, -10, 2, 2, col); R(3, -11, 2, 3, col); R(5, -9, 2, 1, col);
        break;
      case 'longTied': // long wavy hair tied back, blonde highlights
        R(-7, -8, 13, 4, col); R(-8, -6, 4, 8, col); R(-11, -4, 3, 4, col); R(-13, 0, 3, 5, col); R(-12, 5, 3, 4, col); R(-14, 9, 2, 3, col);
        if (hi) { R(-4, -8, 3, 1, hi); R(1, -7, 2, 1, hi); R(-12, 1, 1, 3, hi); R(-11, 6, 1, 2, hi); }
        break;
      case 'messy':
        R(-7, -8, 13, 3, col); R(-8, -6, 4, 7, col); R(-6, -10, 3, 2, col); R(-1, -10, 3, 2, col); R(4, -9, 3, 2, col); R(6, -7, 2, 2, col);
        if (gray) { R(-3, -9, 1, 1, gray); R(2, -8, 1, 1, gray); R(-7, -5, 1, 1, gray); }
        break;
      case 'swept': // salt and pepper, swept back
        R(-7, -8, 12, 3, col); R(-8, -6, 4, 7, col); R(-9, -4, 2, 4, col);
        if (gray) { R(-5, -8, 1, 1, gray); R(-1, -8, 1, 1, gray); R(3, -7, 1, 1, gray); R(-7, -5, 1, 1, gray); R(-6, -2, 1, 1, gray); R(1, -7, 1, 1, gray); }
        break;
      case 'slick': // slicked back
        R(-7, -8, 13, 3, col); R(-8, -6, 4, 6, col); R(-9, -3, 2, 3, col); R(-4, -8, 5, 1, shade(col, 1.45));
        break;
      case 'textured':
        R(-7, -8, 13, 3, col); R(-8, -6, 3, 5, col); R(-6, -9, 2, 1, col); R(-2, -9, 2, 1, col); R(2, -9, 2, 1, col); R(5, -9, 1, 1, col);
        break;
      case 'longBouncy': // the cap; the long part is simulated in drawLongHair
        R(-7, -8, 13, 4, col); R(-8, -6, 4, 7, col); R(-9, -3, 3, 6, col); R(4, -7, 3, 2, col); R(-2, -9, 5, 1, shade(col, 1.6));
        break;
      default: // neat
        R(-7, -8, 13, 3, col); R(-8, -6, 4, 6, col); R(5, -6, 1, 1, col);
    }
  }

  function drawFace(g, hx, hy, s, dir, look, c, face, flash, props) {
    var R = function (dx, dy, w, h, col, a) { headRect(g, hx, hy, s, dir, dx, dy, w, h, c(col), a); };
    var skinDark = shade(look.skin, 0.78);
    // Beard under everything else on the face.
    var bd = look.beard;
    if (bd) {
      if (bd.style === 'full') { R(-2, -1, 2, 4, bd.color); R(-1, 2, 8, 4, bd.color); R(0, 5, 6, 2, bd.color); }
      else if (bd.style === 'short') { R(-2, 0, 2, 3, bd.color); R(-1, 2, 8, 3, bd.color); R(1, 5, 5, 1, bd.color); }
      else if (bd.style === 'goatee') { R(2, 4, 4, 3, bd.color); R(3, 2, 4, 1, bd.color); }
      else if (bd.style === 'stubble') { R(0, 3, 1, 1, bd.color, 0.6); R(2, 5, 1, 1, bd.color, 0.6); R(4, 4, 1, 1, bd.color, 0.6); R(6, 4, 1, 1, bd.color, 0.6); R(1, 5, 1, 1, bd.color, 0.6); R(-1, 1, 1, 1, bd.color, 0.6); }
    }
    if (flash != null) return;
    if (look.lines) { R(1, 1, 1, 2, skinDark); R(7, 0, 1, 2, skinDark); } // smile lines
    if (look.earrings) R(-1, 2, 1, 1, look.earrings);
    // Eyes.
    var type = face ? face.type : null;
    var eyeColor = look.eyeColor || look.eyes;
    if (type === 'wince') { R(2, -1, 4, 1, 0x111111); }
    else if (type === 'fierce') { // cut-ins: narrowed eyes with a glint, brows angled down
      R(3, -2, 2, 1, 0x111111); R(4, -2, 1, 1, 0xffffff); R(3, -1, 3, 1, skinDark);
      R(1, -5, 2, 1, shade(look.hair.color, 0.9)); R(3, -4, 2, 1, shade(look.hair.color, 0.9)); R(5, -3, 2, 1, shade(look.hair.color, 0.9));
    }
    else if (type === 'squint' || look.eyesNarrow) { R(3, -1, 2, 1, 0x111111); R(2, -3, 4, 1, shade(look.hair.color, 0.9)); }
    else {
      if (look.eyeColor) { R(3, -2, 1, 2, eyeColor); R(4, -2, 1, 2, 0x111111); }
      else R(3, -2, 2, 2, 0x111111);
      R(2, -4, 4, 1, shade(look.hair.color, 0.9)); // brow
    }
    // Glasses: thin wire frames.
    if (look.glasses) {
      g.lineStyle(1, c(look.glasses), 1);
      var gx1 = hx + (dir > 0 ? 2 : -6) * s, gy1 = hy - 3 * s;
      g.strokeRect(Math.round(gx1), Math.round(gy1), Math.round(4 * s), Math.round(3 * s));
      R(-2, -2, 4, 1, look.glasses);
    }
    // Mouth.
    var mouth = type === 'wince' ? 'flat' : type === 'grin' ? 'grin' : look.mouth;
    switch (mouth) {
      case 'bigsmile': R(2, 3, 5, 2, 0x3a1010); R(3, 3, 3, 1, 0xffffff); break;
      case 'grin': R(1, 2, 7, 2, 0x3a1010); R(2, 2, 5, 1, 0xffffff); R(7, 1, 1, 1, 0x3a1010); break;
      case 'bright': R(3, 3, 4, 2, 0x3a1010); R(4, 3, 2, 1, 0xffffff); break;
      case 'smirk': R(3, 3, 3, 1, 0x3a1010); R(6, 2, 1, 1, 0x3a1010); break;
      case 'half': R(4, 3, 2, 1, 0x3a1010); R(6, 2, 1, 1, 0x3a1010); break;
      case 'calm': R(3, 3, 3, 1, 0x3a1010); break;
      case 'flat': R(3, 3, 4, 1, 0x3a1010); R(4, 4, 1, 1, 0x3a1010); break;
      default: R(3, 3, 3, 1, 0x3a1010); R(6, 2, 1, 1, 0x3a1010); R(2, 2, 1, 1, 0x3a1010);
    }
    if (props) drawProps(R, hx, hy, s, dir, props);
  }

  // Title-screen props (f._props): dark sunglasses that catch the sunset, with a
  // glint sweeping across (glint 0..1, or -1 for none), and a cigar whose tip glows
  // brighter on a puff. The cigar tip's screen position is left in props.tip.
  function drawProps(R, hx, hy, s, dir, p) {
    if (p.shades) {
      p.lens = { x: hx + (dir > 0 ? 3 : -3) * s, y: hy - 2.5 * s };
      R(1, -3, 7, 3, 0x0b0b10); R(-1, -3, 2, 1, 0x0b0b10);      // lenses, temple arm
      R(2, -1, 5, 1, 0xd8602a, 0.75); R(2, -2, 3, 1, 0x7a3a6a, 0.6); // sunset in the lenses
      if (p.glint >= 0 && p.glint <= 1) R(1 + Math.floor(p.glint * 6), -3, 1, 2, 0xffffff);
    }
    if (p.cigar) {
      R(5, 3, 6, 1, 0x6a3c22); R(5, 3, 1, 1, 0xc8a060);
      R(11, 3, 1, 1, p.puff ? 0xffd23f : 0xff5a1a);
      p.tip = { x: hx + (dir > 0 ? 11.5 : -11.5) * s, y: hy + 3.5 * s };
    }
  }

  // Long hair that swings (RAMOS): a chain of points hanging from the back of the
  // head, simulated each frame so dashes, jumps and throws make it bounce.
  var HAIR_SEGS = 6;
  function drawLongHair(g, f, hx, hy, s, dir, color) {
    var rootX = hx - dir * 6 * s, rootY = hy - 2 * s, seg = 5.5 * s;
    var pts = f._hairPts;
    if (!pts || Math.abs(pts[0].x - rootX) > 60 || Math.abs(pts[0].y - rootY) > 60) {
      pts = f._hairPts = [];
      for (var k = 0; k <= HAIR_SEGS; k++) pts.push({ x: rootX - dir * k * 2 * s, y: rootY + k * seg, px: rootX - dir * k * 2 * s, py: rootY + k * seg });
    }
    pts[0].x = rootX; pts[0].y = rootY;
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i], vx = (p.x - p.px) * 0.9, vy = (p.y - p.py) * 0.9;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + 0.5 * s;
    }
    for (var it = 0; it < 3; it++) {
      for (var j = 1; j < pts.length; j++) {
        var a = pts[j - 1], b = pts[j];
        // A little springiness back toward hanging down-and-behind, so it bounces.
        b.x += (a.x - dir * seg * 0.3 - b.x) * 0.05;
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        b.x = a.x + dx / d * seg; b.y = a.y + dy / d * seg;
      }
    }
    for (var w = 1; w < pts.length; w++) {
      g.lineStyle(Math.max(2, Math.round((7 - w * 0.7) * s)), color, 1);
      g.lineBetween(pts[w - 1].x, pts[w - 1].y, pts[w].x, pts[w].y);
      g.fillStyle(color, 1); g.fillCircle(pts[w].x, pts[w].y, Math.max(1, (3.2 - w * 0.35) * s));
    }
    g.lineStyle(1, shade(color, 2.2), 0.8);
    for (var h2 = 2; h2 < pts.length - 1; h2++) g.lineBetween(pts[h2 - 1].x + dir * s, pts[h2 - 1].y, pts[h2].x + dir * s, pts[h2].y);
  }

  // --- Body ---------------------------------------------------------------------

  // Draw one fighter. opts: { flash: color|null, jitter: px, scale: mult, groundY, noShadow, x }
  FG.drawFighter = function (g, f, opts) {
    var p = f._pose;
    if (!p) return;
    opts = opts || {};
    var def = f.def, look = def.look, build = look.build;
    var depth = 1 - f.z * 0.004;
    var s = def.scale * depth * (opts.scale || 1);
    var dir = f.facing;
    var ox = Math.round((opts.x != null ? opts.x : f.x) + (opts.jitter || 0));
    var oy = Math.round((opts.groundY != null ? opts.groundY : C.GROUND_Y) - f.z * 0.5);
    var lift = f.y * (opts.scale || 1);
    // Shoulder and hip rotation (motion layer): the back shoulder and hip swing
    // forward as the body turns into a strike. Joints 11-14 are the front / back
    // shoulder and front / back hip.
    var tw = f._twist || 0;
    var TW = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1.5 * tw, 3.5 * tw, -1 * tw, 2 * tw];
    function X(i) {
      if (i > 10) return Math.round(ox + (p[i > 12 ? 0 : 2] + TW[i]) * s * dir);
      return Math.round(ox + p[i * 2] * s * dir);
    }
    function Y(i) {
      if (i > 10) return Math.round(oy - (p[i > 12 ? 1 : 3] * s + lift));
      return Math.round(oy - (p[i * 2 + 1] * s + lift));
    }

    if (!opts.noShadow) {
      var sh = Math.max(0.4, 1 - lift / 160);
      g.fillStyle(0x000000, 0.35);
      g.fillEllipse(ox, oy + 1, 46 * s * sh, 8 * s * sh);
    }

    var flash = opts.flash;
    function c(v) { return flash != null ? flash : v; }

    // A streak behind the striking hand or foot (motion layer).
    var tr = f._trail;
    if (tr && tr.length > 1 && flash == null && opts.x == null) {
      for (var ti = 1; ti < tr.length; ti++) {
        var ta = ti / tr.length;
        g.lineStyle(Math.max(1, Math.round((2 + ti * 1.4) * s)), 0xffffff, 0.12 + ta * 0.3);
        g.lineBetween(tr[ti - 1].x, tr[ti - 1].y, tr[ti].x, tr[ti].y);
      }
    }

    var top = look.top, blazer = look.blazer && f._blazer;
    var skin = look.skin, skinBack = shade(skin, 0.8);
    var topCol = top.color, topBack = shade(top.color, 0.72);
    var sleeve = blazer ? look.blazer : topCol, sleeveBack = shade(sleeve, 0.72);
    var lw = build.limb;

    function limb(a, b, w, color) {
      g.lineStyle(Math.max(2, Math.round(w * s * lw)), c(color), 1);
      g.lineBetween(X(a), Y(a), X(b), Y(b));
      g.fillStyle(c(color), 1);
      g.fillCircle(X(b), Y(b), Math.max(1, Math.round(w * s * lw * 0.5)));
    }
    // Part of a segment, from fraction t0 to t1 (sleeves, cuffs).
    function part(a, b, t0, t1, w, color) {
      var ax = X(a), ay = Y(a), bx = X(b), by = Y(b);
      g.lineStyle(Math.max(2, Math.round(w * s * lw)), c(color), 1);
      g.lineBetween(ax + (bx - ax) * t0, ay + (by - ay) * t0, ax + (bx - ax) * t1, ay + (by - ay) * t1);
    }
    function block(i, w, h, color, fwd) {
      var bx = X(i), by = Y(i);
      g.fillStyle(c(color), 1);
      g.fillRect(Math.round(bx - (fwd ? (dir > 0 ? 1 : w * s - 1) : w * s / 2)), Math.round(by - h * s / 2), Math.round(w * s), Math.round(h * s));
    }
    function arm(e, h, back) {
      var sk = back ? skinBack : skin, sl = back ? sleeveBack : sleeve;
      var sleeves = blazer ? 'long' : top.sleeves;
      var sh = back ? 12 : 11;
      limb(sh, e, 7, sk);
      if (sleeves === 'long') { limb(sh, e, 7, sl); limb(e, h, 6, sl); }
      else if (sleeves === 'rolled') { limb(sh, e, 7, sl); limb(e, h, 6, sk); part(e, h, 0, 0.3, 7, shade(sl, 0.9)); }
      else { limb(e, h, 6, sk); part(sh, e, 0, 0.62, 8, sl); }
      if (look.wristband) { // red-white-red band at the wrist
        part(e, h, 0.68, 0.76, 7, look.wristband[0]); part(e, h, 0.76, 0.83, 7, look.wristband[1]); part(e, h, 0.83, 0.9, 7, look.wristband[0]);
      }
      block(h, 7, 7, sk);
    }
    var shoeW = look.flats ? 9 : 11, shoeH = look.flats ? 3 : 5;

    // Joint indices: 0 hip, 1 chest, 2 head, 3 fElbow, 4 fHand, 5 bElbow, 6 bHand, 7 fKnee, 8 fFoot, 9 bKnee, 10 bFoot
    // Back limbs first, in darker shades.
    var legsBack = shade(look.legs, 0.72);
    limb(14, 9, 9, legsBack); limb(9, 10, 7, legsBack);
    block(10, shoeW - 1, shoeH - 1, shade(look.shoes, 0.7), true);
    arm(5, 6, true);

    // Torso: a quad from hips to shoulders.
    var hx = X(0), hy = Y(0), cx = X(1), cy = Y(1);
    var vx = cx - hx, vy = cy - hy, len = Math.sqrt(vx * vx + vy * vy) || 1;
    var nx = -vy / len, ny = vx / len, ux = vx / len, uy = vy / len;
    // A torso turned toward or away from the camera looks narrower.
    var turn = 1 - 0.18 * Math.min(1, Math.abs(tw));
    var wc = 9 * s * build.torso * turn, wh = 7 * s * build.torso * (1 - 0.1 * Math.min(1, Math.abs(tw)));
    function quad(color, a0, a1) { // a0..a1: band across the torso width, -1 (back) .. 1 (front)
      g.fillStyle(c(color), 1);
      g.fillPoints([
        { x: hx + nx * wh * a0, y: hy + ny * wh * a0 }, { x: cx + nx * wc * a0, y: cy + ny * wc * a0 },
        { x: cx + nx * wc * a1, y: cy + ny * wc * a1 }, { x: hx + nx * wh * a1, y: hy + ny * wh * a1 }
      ], true);
    }
    quad(topCol, -1, 1);
    // Front of the torso faces the opponent: "front" side is +n when facing right.
    var fs = dir; // multiply n offsets by fs for the front side
    if (flash == null) drawPattern();
    function drawPattern() {
      var pc = top.patternColor || shade(topCol, 1.3);
      var i, t, px, py, w;
      if (top.pattern === 'stripes') {
        for (i = 1; i <= 5; i++) {
          t = i / 6; px = hx + vx * t; py = hy + vy * t; w = wh + (wc - wh) * t;
          g.lineStyle(Math.max(1, Math.round(1.5 * s)), pc, 0.9);
          g.lineBetween(px - nx * w, py - ny * w, px + nx * w, py + ny * w);
        }
      } else if (top.pattern === 'check' || top.pattern === 'windowpane') {
        var n = top.pattern === 'check' ? 6 : 3, alpha = top.pattern === 'check' ? 0.55 : 0.7;
        g.lineStyle(1, pc, alpha);
        for (i = 1; i < n; i++) {
          t = i / n; px = hx + vx * t; py = hy + vy * t; w = wh + (wc - wh) * t;
          g.lineBetween(px - nx * w, py - ny * w, px + nx * w, py + ny * w);
        }
        for (i = -1; i <= 1; i += top.pattern === 'check' ? 0.5 : 1) {
          g.lineBetween(hx + nx * wh * i, hy + ny * wh * i, cx + nx * wc * i, cy + ny * wc * i);
        }
      } else if (top.pattern === 'heather') {
        var dots = [[0.2, -0.5], [0.35, 0.3], [0.5, -0.2], [0.62, 0.55], [0.75, -0.6], [0.85, 0.1], [0.45, 0.7], [0.3, -0.85]];
        for (i = 0; i < dots.length; i++) {
          t = dots[i][0]; w = wh + (wc - wh) * t;
          g.fillStyle(i % 2 ? shade(topCol, 1.18) : shade(topCol, 0.85), 1);
          g.fillRect(Math.round(hx + vx * t + nx * w * dots[i][1]), Math.round(hy + vy * t + ny * w * dots[i][1]), Math.max(1, Math.round(s)), Math.max(1, Math.round(s)));
        }
      }
    }
    if (blazer) { quad(look.blazer, -1, -0.15); quad(look.blazer, 0.35, 1); }
    // Neckline and accessories.
    if (flash == null) {
      var nk = function (a, d) { return { x: cx + nx * wc * a * fs * 0.4 - ux * d * s, y: cy + ny * wc * a * fs * 0.4 - uy * d * s }; };
      if (top.style === 'vneck') {
        g.fillStyle(skin, 1); g.fillPoints([nk(-0.6, 0), nk(1.4, 0), nk(0.4, 7)], true);
      } else if (top.style === 'blouse') {
        g.fillStyle(skin, 1); g.fillPoints([nk(-0.4, 0), nk(1.2, 0), nk(0.4, 3)], true);
      } else if (top.style === 'polo' || top.style === 'button' || top.style === 'dress') {
        var collar = top.style === 'polo' ? shade(topCol, 0.85) : top.collar || shade(topCol, 1.1);
        g.fillStyle(collar, 1);
        g.fillPoints([nk(-0.8, -1), nk(0.4, 0), nk(-0.2, 4)], true);
        g.fillPoints([nk(1.6, -1), nk(0.4, 0), nk(1.0, 4)], true);
        var pl = nk(0.4, top.style === 'polo' ? 7 : 22);
        g.lineStyle(1, shade(topCol, 0.75), 1);
        g.lineBetween(cx + nx * wc * 0.16 * fs, cy + ny * wc * 0.16 * fs, pl.x, pl.y);
      }
      if (look.tie) {
        var t0 = nk(0.4, 1), t1 = nk(0.4, 24);
        g.fillStyle(look.tie, 1); g.fillRect(Math.round(t0.x - 1.5 * s), Math.round(t0.y), Math.round(3 * s), Math.round(3 * s));
        g.lineStyle(Math.max(2, Math.round(3 * s)), look.tie, 1); g.lineBetween(t0.x, t0.y + 2 * s, t1.x, t1.y);
      }
      if (look.pen) {
        var pk = nk(1.6, 8);
        g.fillStyle(shade(topCol, 0.85), 1); g.fillRect(Math.round(pk.x - 2 * s), Math.round(pk.y), Math.round(4 * s), Math.round(4 * s));
        g.fillStyle(look.pen, 1); g.fillRect(Math.round(pk.x), Math.round(pk.y - 2 * s), Math.max(1, Math.round(s)), Math.round(4 * s));
      }
      if (look.pendant) {
        var pd = nk(0.4, 5);
        g.fillStyle(look.pendant, 1);
        g.fillRect(Math.round(pd.x - s), Math.round(pd.y), Math.round(2 * s), Math.round(2 * s));
        g.fillRect(Math.round(pd.x - 0.5 * s), Math.round(pd.y + 1.5 * s), Math.max(1, Math.round(s)), Math.max(1, Math.round(s)));
      }
    }
    // Belt line.
    g.fillStyle(c(shade(look.legs, 0.55)), 1);
    g.fillRect(Math.round(hx - 8 * s * build.torso), Math.round(hy - 2 * s), Math.round(16 * s * build.torso), Math.round(2 * s));

    // Neck and head (long hair hangs behind the head).
    var hdx = X(2), hdy = Y(2);
    if (look.hair.style === 'longBouncy') drawLongHair(g, f, hdx, hdy, s, dir, c(look.hair.color));
    g.lineStyle(Math.round(5 * s), c(skin), 1);
    g.lineBetween(cx, cy, Math.round((cx + hdx) / 2), Math.round((cy + hdy) / 2));
    g.fillStyle(c(skin), 1);
    g.fillCircle(hdx, hdy, Math.round(7 * s));
    drawFace(g, hdx, hdy, s, dir, look, c, f._face, flash, flash == null ? f._props : null);
    drawHair(g, hdx, hdy, s, dir, look.hair, c);

    // Front limbs on top.
    limb(13, 7, 9, look.legs); limb(7, 8, 7, look.legs);
    block(8, shoeW, shoeH, look.shoes, true);
    arm(3, 4, false);
  };

  // A fighter-like object for drawing outside a match (select screen, title, win screen).
  FG.puppet = function (def, x, facing) {
    return { def: def, x: x, y: 0, z: 0, vx: 0, vy: 0, facing: facing || 1, state: 'idle', stateFrame: 0,
      index: 0, stance: 'A', puppet: true, _pose: null, _override: null, _gesture: null, _face: null, _blazer: false };
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
