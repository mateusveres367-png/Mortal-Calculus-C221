// Title screen, late-90s arcade style: the faculty parking lot at sunset, PEDERSEN
// leaning on the hood of his red sports car in sunglasses with a cigar, the other
// seven fighters in silhouette behind him (each catching a flash of rim light in
// their colour), a chrome MORTAL CALCULUS logo that slams in with a red C221 stamp,
// PRESS START, CRT scanlines and a synth-rock loop. Press Enter for the main menu:
// ARCADE, VS CPU, VERSUS, TRAINING, OPTIONS. Left alone for 15 seconds, it runs the attract
// demo (CPU vs CPU clips), then comes back.
(function () {
  var C = FG.C, W = C.VIEW_W, H = C.VIEW_H;
  var IDLE_DEMO = 15 * 60; // frames on the title before the demo starts
  var BOX = { x: 452, y: 150, w: 170, h: 126 };
  var OPTION_ROWS = 7;
  var HY = 214;            // horizon
  var SUN = { x: 330, y: HY + 6, r: 74 };
  var CAR = { x: 196, y: 300, scale: 1.9 };
  var PED = { x: 316, y: 304, scale: 1.75 };
  var LOGO_HIT = 18, STAMP_HIT = 50;

  var TitleScene = function () { Phaser.Scene.call(this, { key: 'title' }); };
  TitleScene.prototype = Object.create(Phaser.Scene.prototype);
  TitleScene.prototype.constructor = TitleScene;

  // PEDERSEN on the hood: leans, now and then a slow puff on the cigar.
  var LEAN = [[1, 'lean'], [200, 'lean'], [214, 'lean_puff'], [256, 'lean_puff'], [270, 'lean'], [360, 'lean']];
  var PUFF = [214, 256], EXHALE = 268;

  // The other seven, in a row behind him.
  var SIL_X = [58, 128, 198, 420, 480, 540, 600], SIL_Y = 262, SIL_SCALE = 1.2;
  // Rim-light colour per fighter (their cut-in colour, brightened where it's dark).
  var RIM = { brinkhus: 0xffd23f, chai: 0xff8a2a, dalsass: 0x3ff0e8, lee: 0x39ff5a, lopez: 0x7aa8ff, miyashiro: 0x6a9aff, ramos: 0xff3a4a };

  // Math symbols twinkling in the sky like stars: 5x5 pixel patterns.
  var SYMBOLS = [
    '#####.#.#..#.#..#.#..#.#.', // pi
    '#####.#.....#...#...#####', // sigma
    '..##..#....#....#...##...', // integral
    '..###..#...#..##.#...#...', // root
    '.#.#.#.#.##.#.#.#.#......', // infinity
    '..#...#.#.#...######.....', // delta
    '.###.#...######...#.###..', // theta
    '..#..#####..#.......#####', // plus-minus
    '#...#.#.#...#...#.#.#...#', // x
    '.....#####.....#####.....'  // equals
  ];

  var MENU = [
    { id: 'arcade', label: 'ARCADE', help: 'FIGHT THEM ALL IN A ROW. IT GETS HARDER EVERY FIGHT' },
    { id: 'cpu', label: 'VS CPU', help: 'YOU AGAINST THE COMPUTER: BOTH FIGHTERS, A STAGE, A LEVEL' },
    { id: 'versus', label: 'VERSUS', help: 'PLAYER 1 VS PLAYER 2, BEST OF THREE' },
    { id: 'training', label: 'TRAINING', help: 'PRACTICE, FRAME DATA AND COMBO TRIALS' },
    { id: 'options', label: 'OPTIONS', help: 'DIFFICULTY, ROUND TIME, SOUND, EASY COMBOS, ULTIMATE KEYS' }
  ];
  var TIMES = [30, 60, 99, 0];

  function hex(c) { return '#' + ('00000' + c.toString(16)).slice(-6); }
  function mix(a, b, u) {
    var r = ((a >> 16) & 255) + (((b >> 16) & 255) - ((a >> 16) & 255)) * u;
    var g = ((a >> 8) & 255) + (((b >> 8) & 255) - ((a >> 8) & 255)) * u;
    var bl = (a & 255) + ((b & 255) - (a & 255)) * u;
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl);
  }
  // A fixed pseudo-random sequence, so the skyline is the same every time.
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  // --- Baked textures ----------------------------------------------------------

  // The sky, the setting sun, the campus skyline and the lot, painted once.
  function backdrop(scene) {
    if (scene.textures.exists('title_bg')) return;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), r = rng(221), i, y;
    function rect(c, px, py, w, h, a) { x.globalAlpha = a == null ? 1 : a; x.fillStyle = hex(c); x.fillRect(px, py, w, h); }
    // Sky in hard bands, dithered where they meet.
    var BANDS = [[0, 0x120824], [28, 0x1d0a34], [56, 0x2e0f48], [84, 0x47165a], [108, 0x6a1f62], [130, 0x93295e], [150, 0xbc3a55], [168, 0xdc5a45], [184, 0xf0803a], [200, 0xfba845], [HY, 0]];
    for (i = 0; i < BANDS.length - 1; i++) {
      rect(BANDS[i][1], 0, BANDS[i][0], W, BANDS[i + 1][0] - BANDS[i][0]);
      if (i > 0) for (y = BANDS[i][0]; y < BANDS[i][0] + 4; y += 2) for (var dx = (y / 2) % 2 ? 2 : 0; dx < W; dx += 4) rect(BANDS[i - 1][1], dx, y, 2, 2);
    }
    // Sun glow, then the disc in stripes that thin out toward the horizon.
    for (i = 6; i >= 1; i--) { x.globalAlpha = 0.07; x.fillStyle = '#ffb060'; x.beginPath(); x.arc(SUN.x, SUN.y, SUN.r + i * 14, 0, Math.PI * 2); x.fill(); }
    for (y = SUN.y - SUN.r; y < HY; y++) {
      var dy = y - SUN.y, half = Math.sqrt(Math.max(0, SUN.r * SUN.r - dy * dy));
      var u = (y - (SUN.y - SUN.r)) / SUN.r;
      var gap = u > 0.45 && ((y - HY) % Math.max(3, Math.round(12 - u * 8)) === 0 || (y - HY) % Math.max(3, Math.round(12 - u * 8)) === 1);
      if (gap) continue;
      rect(mix(0xfff2a0, 0xff4a6a, Math.min(1, u * 1.05)), Math.round(SUN.x - half), y, Math.round(half * 2), 1);
    }
    // Long thin clouds across the sun.
    [[150, 120, 0.5], [168, 200, 0.55], [178, 90, 0.45], [122, 160, 0.35], [96, 220, 0.3]].forEach(function (cl, k) {
      var cx = (k * 173 + 60) % W;
      rect(0x5a1a58, cx - cl[1] / 2, cl[0], cl[1], 3, cl[2]); rect(0xff9a6a, cx - cl[1] / 2 + 8, cl[0], cl[1] - 30, 1, cl[2] * 0.7);
    });
    // Campus skyline: buildings, a bell tower, a few lit windows.
    x.globalAlpha = 1;
    var bx = 0;
    while (bx < W) {
      var bw = 18 + Math.floor(r() * 46), bh = 8 + Math.floor(r() * 30);
      if (Math.abs(bx + bw / 2 - 470) < 20) bh = 52; // the bell tower
      rect(0x2a1036, bx, HY - bh, bw, bh);
      for (var wy = HY - bh + 4; wy < HY - 3; wy += 6) for (var wx = bx + 3; wx < bx + bw - 3; wx += 5) if (r() < 0.12) rect(r() < 0.5 ? 0xffd27a : 0xff9a4a, wx, wy, 2, 2);
      bx += bw + Math.floor(r() * 6);
    }
    rect(0x2a1036, 466, HY - 64, 8, 14); rect(0x2a1036, 462, HY - 52, 16, 4); // tower top
    rect(0x6a2a3a, 0, HY - 1, W, 1);
    // The lot: asphalt catching the sunset, the sun's reflection, stall lines in perspective.
    for (y = HY; y < H; y++) rect(mix(0x4a2440, 0x120d18, Math.pow((y - HY) / (H - HY), 0.6)), 0, y, W, 1);
    for (y = HY + 1; y < H; y += 2) {
      var k2 = (y - HY) / (H - HY), w2 = 30 + k2 * 120;
      rect(0xff8a4a, SUN.x - w2 / 2 + Math.sin(y * 0.7) * 6, y, w2, 1, 0.22 * (1 - k2));
    }
    x.strokeStyle = '#d8c8e8';
    for (i = -7; i <= 7; i++) {
      x.globalAlpha = 0.16; x.lineWidth = 2;
      x.beginPath(); x.moveTo(SUN.x + i * 30, HY + 14); x.lineTo(SUN.x + i * 150, H); x.stroke();
    }
    rect(0xd8c8e8, 0, HY + 14, W, 1, 0.12);
    cv._done = true;
    scene.textures.addCanvas('title_bg', cv);
  }

  // The chrome logo: chunky pixel letters, a metal gradient by row, bevelled
  // blocks, a black outline and a drop shadow. white: an all-white copy (the shine).
  function logoTexture(scene, key, text, B, white) {
    if (scene.textures.exists(key)) return;
    var G = FG.GLYPHS, cols = text.length * 6 - 1, pad = 4;
    var cv = document.createElement('canvas'); cv.width = cols * B + pad * 2 + B; cv.height = 7 * B + pad * 2 + B;
    var x = cv.getContext('2d');
    var METAL = [0xffffff, 0xe6ecf6, 0xbcc8dc, 0x5e6a86, 0x8a96ae, 0xc8d2e4, 0xf2f6fc];
    function each(fn) {
      for (var ci = 0; ci < text.length; ci++) {
        var gl = G[text[ci]] || G[' '];
        for (var p = 0; p < 35; p++) if (gl[p] === '#') fn(pad + (ci * 6 + p % 5) * B, pad + Math.floor(p / 5) * B, Math.floor(p / 5));
      }
    }
    if (!white) {
      x.fillStyle = '#1a0610'; each(function (px, py) { x.fillRect(px + B, py + B, B, B); });              // shadow
      x.fillStyle = '#07030a'; each(function (px, py) { x.fillRect(px - 3, py - 3, B + 6, B + 6); });      // outline
    }
    each(function (px, py, row) {
      if (white) { x.fillStyle = '#ffffff'; x.fillRect(px, py, B, B); return; }
      x.fillStyle = hex(METAL[row]); x.fillRect(px, py, B, B);
      x.fillStyle = hex(mix(METAL[row], 0xffffff, 0.6)); x.fillRect(px, py, B, 1);
      x.fillStyle = hex(mix(METAL[row], 0x101020, 0.45)); x.fillRect(px, py + B - 1, B, 1);
    });
    scene.textures.addCanvas(key, cv);
  }

  // The red C221 stamp: block letters in a box, with worn-out ink.
  function stampTexture(scene) {
    if (scene.textures.exists('title_stamp')) return;
    var G = FG.GLYPHS, text = FG.TITLE_SUB, B = 5, r = rng(42);
    var w = (text.length * 6 - 1) * B + 28, h = 7 * B + 22;
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var x = cv.getContext('2d');
    x.fillStyle = '#d8202a';
    x.fillRect(0, 0, w, 4); x.fillRect(0, h - 4, w, 4); x.fillRect(0, 0, 4, h); x.fillRect(w - 4, 0, 4, h);
    for (var ci = 0; ci < text.length; ci++) {
      var gl = G[text[ci]];
      for (var p = 0; p < 35; p++) if (gl[p] === '#') x.fillRect(14 + (ci * 6 + p % 5) * B, 11 + Math.floor(p / 5) * B, B, B);
    }
    // Worn ink: knock out specks.
    x.globalCompositeOperation = 'destination-out';
    for (var k = 0; k < 120; k++) x.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1 + Math.floor(r() * 2), 1 + Math.floor(r() * 2));
    scene.textures.addCanvas('title_stamp', cv);
  }

  // CRT: dark scanlines and darkened, rounded corners.
  function crtTexture(scene) {
    if (scene.textures.exists('title_crt')) return;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    x.fillStyle = 'rgba(0,0,0,0.22)';
    for (var y = 0; y < H; y += 3) x.fillRect(0, y, W, 1);
    var gr = x.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    // Rounded corners of the tube.
    x.fillStyle = '#000';
    var R = 18;
    [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(function (c) {
      x.beginPath(); x.moveTo(c[0], c[1]); x.lineTo(c[0] + c[2] * R, c[1]);
      x.quadraticCurveTo(c[0], c[1], c[0], c[1] + c[3] * R); x.closePath(); x.fill();
    });
    scene.textures.addCanvas('title_crt', cv);
  }

  // --- Scene ---------------------------------------------------------------------

  TitleScene.prototype.init = function (data) { this.data0 = data || {}; };

  TitleScene.prototype.create = function () {
    FG.makeFonts(this);
    var self = this, cx = W / 2;
    backdrop(this);
    logoTexture(this, 'title_logo', FG.TITLE_MAIN, 6, false);
    logoTexture(this, 'title_logo_w', FG.TITLE_MAIN, 6, true);
    stampTexture(this);
    crtTexture(this);
    this.add.image(0, 0, 'title_bg').setOrigin(0, 0).setDepth(0);
    this.sky = this.add.graphics().setDepth(1);         // math stars
    this.sil = this.add.graphics().setDepth(2);         // the seven silhouettes
    this.shadows = this.add.graphics().setDepth(3);     // long shadows toward us
    this.lamps = this.add.graphics().setDepth(3.5);     // lot lights
    this.cover = this.add.graphics().setDepth(6);       // car and PEDERSEN
    this.air = this.add.graphics().setDepth(7);         // smoke, heat shimmer, glint
    this.drawShadows();

    // PEDERSEN, with shades and a cigar.
    var ped = FG.fighterById('pedersen') || FG.ROSTER[0];
    this.ped = FG.puppet(ped, PED.x, 1);
    this.ped._override = { anim: LEAN, t: 0, loop: true };
    this.ped._props = { shades: true, cigar: true, glint: -1, puff: false };
    this.smoke = [];
    // Everyone else.
    var others = FG.ROSTER.filter(function (d) { return d.id !== ped.id; }).slice(0, SIL_X.length);
    this.sils = others.map(function (d, k) {
      var p = FG.puppet(d, SIL_X[k], SIL_X[k] < W / 2 ? 1 : -1);
      return { p: p, rim: RIM[d.id] || (d.cutIn ? d.cutIn.b : 0xffffff), flash: 0 };
    });
    this.stars = SYMBOLS.concat(SYMBOLS.slice(0, 8)).map(function (pat, k) {
      var r = rng(k * 31 + 7);
      return { pat: pat, x: r() * W, y: 8 + r() * 120, size: r() < 0.3 ? 2 : 1, ph: r() * 6.28, sp: 0.03 + r() * 0.05 };
    });
    this.lampState = [1, 1];

    // Logo, its shine, and the stamp.
    this.logo = this.add.image(cx, 44, 'title_logo').setDepth(10);
    this.shine = this.add.image(cx, 44, 'title_logo_w').setDepth(10.1).setAlpha(0.65);
    this.shineMask = this.make.graphics({ add: false });
    this.shine.setMask(this.shineMask.createGeometryMask());
    this.stamp = this.add.image(cx + 4, 102, 'title_stamp').setDepth(10.2).setAngle(-7);
    this.flash = this.add.graphics().setDepth(50);

    this.prompt = FG.text(this, cx, 316, 'PRESS START', 'y', 3).setOrigin(0.5, 0).setDepth(11);
    this.footer = FG.text(this, cx, H - 18, 'EL CAMINO REAL MATH DEPARTMENT', 'g').setOrigin(0.5, 0).setDepth(11);
    this.add.image(0, 0, 'title_crt').setOrigin(0, 0).setDepth(60);
    // A touch of tube curvature, where the renderer supports it.
    var cam = this.cameras.main;
    if (cam.postFX && FG.game && FG.game.renderer.type === Phaser.WEBGL) { try { cam.postFX.addBarrel(1.04); } catch (e) { /* no FX: flat screen */ } }

    // Main menu and options, in a box over the right of the lot.
    this.menuG = this.add.graphics().setDepth(12);
    this.rows = [0, 1, 2, 3, 4, 5, 6].map(function (k) {
      var t = FG.text(self, BOX.x + 16, BOX.y + 12 + k * 18, '', 'w', 2).setDepth(13);
      t.setInteractive({ useHandCursor: true }).on('pointerdown', function () { FG.Sfx.unlock(); if (self.menuOn) { self.index = k; self.choose(0); } });
      return t;
    });
    this.help = FG.text(this, cx, 300, '', 'c').setOrigin(0.5, 0).setDepth(13);

    this.t = this.data0.menu ? 200 : 0; // back from another screen: the logo is already up
    this.idle = 0;
    this.menuOn = !!this.data0.menu;
    this.options = false;
    this.capture = null; // an ultimate key being remapped ('ultKey1' / 'ultKey2')
    this.index = 0;
    this.started = false;
    var kb = this.input.keyboard;
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ESC]);
    kb.on('keydown', function (e) { FG.Sfx.unlock(); self.idle = 0; self.key(e.code); });
    this.input.on('pointerdown', function () { FG.Sfx.unlock(); self.idle = 0; if (!self.menuOn) self.openMenu(); });
    this.events.once('shutdown', function () { FG.Music.stop(); });
    window.FG_TITLE = this;
    this.refresh();
  };

  TitleScene.prototype.openMenu = function () {
    this.menuOn = true; this.options = false; this.index = 0;
    if (this.t < STAMP_HIT) this.t = STAMP_HIT; // skip the logo slam
    FG.Sfx.ui('confirm');
    this.refresh();
  };

  TitleScene.prototype.key = function (code) {
    if (this.started) return;
    // Remapping an ultimate key: the next key pressed (Esc cancels).
    if (this.capture) {
      var s = FG.settings, other = s[this.capture === 'ultKey1' ? 'ultKey2' : 'ultKey1'];
      if (code === 'Escape') this.capture = null;
      else if (FG.TAKEN_KEYS.indexOf(code) >= 0 || code === other) { this.taken = code; FG.Sfx.ui('move'); }
      else { s[this.capture] = code; this.capture = null; this.taken = null; FG.saveSettings(); FG.Sfx.ui('confirm'); }
      this.refresh();
      return;
    }
    if (!this.menuOn) {
      if (code === 'Enter' || code === 'Space' || code === 'NumpadEnter' || code === 'KeyJ') this.openMenu();
      return;
    }
    var n = this.options ? OPTION_ROWS : MENU.length;
    switch (code) {
      case 'ArrowUp': case 'KeyW': this.index = (this.index + n - 1) % n; FG.Sfx.ui('move'); break;
      case 'ArrowDown': case 'KeyS': this.index = (this.index + 1) % n; FG.Sfx.ui('move'); break;
      case 'ArrowLeft': case 'KeyA': if (this.options) this.choose(-1); break;
      case 'ArrowRight': case 'KeyD': if (this.options) this.choose(1); break;
      case 'Enter': case 'Space': case 'NumpadEnter': case 'KeyJ': this.choose(0); break;
      case 'Escape': case 'KeyK': case 'Backspace':
        if (this.options) { this.options = false; this.index = MENU.length - 1; } else this.menuOn = false;
        FG.Sfx.ui('move');
        break;
    }
    this.refresh();
  };

  // Activate the selected row. delta: -1 / +1 to change an option, 0 to confirm.
  TitleScene.prototype.choose = function (delta) {
    var s = FG.settings;
    if (!this.options) {
      var item = MENU[this.index];
      if (item.id === 'options') { this.options = true; this.index = 0; FG.Sfx.ui('confirm'); this.refresh(); return; }
      this.go(item.id);
      return;
    }
    var d = delta || 1, levels = FG.AI_ORDER;
    switch (this.index) {
      case 0: s.difficulty = levels[(levels.indexOf(s.difficulty) + d + levels.length) % levels.length]; break;
      case 1: s.time = TIMES[(TIMES.indexOf(s.time) + d + TIMES.length) % TIMES.length]; break;
      case 2: s.sound = !s.sound; FG.Sfx.muted = !s.sound; break;
      case 3: s.easyCombos = !s.easyCombos; break;
      case 4: case 5: // press a key to remap it
        if (!delta) { this.capture = this.index === 4 ? 'ultKey1' : 'ultKey2'; this.taken = null; FG.Sfx.ui('confirm'); this.refresh(); return; }
        break;
      case 6: if (!delta) { this.options = false; this.index = MENU.length - 1; } break;
    }
    FG.saveSettings();
    FG.Sfx.ui('move');
    this.refresh();
  };

  TitleScene.prototype.go = function (mode) {
    if (this.started) return;
    this.started = true;
    FG.Sfx.ui('confirm');
    this.scene.start('select', { mode: mode });
  };

  // The attract demo: CPU vs CPU clips (see FG.attractClip in the fight scene).
  TitleScene.prototype.demo = function () {
    if (this.started) return;
    this.started = true;
    this.scene.start('fight', FG.attractClip(0));
  };

  TitleScene.prototype.refresh = function () {
    var on = this.menuOn, s = FG.settings, self = this;
    this.footer.setText(on ? 'UP/DOWN SELECT   ENTER CONFIRM   ESC BACK' : 'EL CAMINO REAL MATH DEPARTMENT');
    var g = this.menuG;
    g.clear();
    if (!on) { this.rows.forEach(function (r) { r.setText(''); }); this.help.setText(''); return; }
    var rowH = this.options ? 15 : 18, h = this.options ? 12 + OPTION_ROWS * 15 + 6 : BOX.h;
    g.fillStyle(0x07060c, 0.88); g.fillRect(BOX.x, BOX.y, BOX.w, h);
    g.lineStyle(2, 0xffd23f, 1); g.strokeRect(BOX.x, BOX.y, BOX.w, h);
    g.fillStyle(0x3c6fb0, 0.7); g.fillRect(BOX.x + 6, BOX.y + 9 + this.index * rowH, BOX.w - 12, rowH);
    var labels;
    if (this.options) {
      var cap = this.capture;
      labels = ['CPU ' + FG.AI_LEVELS[s.difficulty].name, 'TIME ' + (s.time ? s.time : 'NONE'), 'SOUND ' + (s.sound ? 'ON' : 'OFF'), 'EASY COMBOS ' + (s.easyCombos ? 'ON' : 'OFF'),
        'P1 ULT  ' + (cap === 'ultKey1' ? '...' : FG.keyName(s.ultKey1)), 'P2 ULT  ' + (cap === 'ultKey2' ? '...' : FG.keyName(s.ultKey2)), 'BACK'];
      if (cap) this.help.setText(this.taken ? FG.keyName(this.taken) + ' IS ALREADY USED: PRESS ANOTHER KEY   (ESC CANCELS)' : 'PRESS THE KEY FOR THE ULTIMATE   (ESC CANCELS)');
      else this.help.setText(['HOW HARD THE CPU FIGHTS', 'SECONDS PER ROUND', 'SOUND EFFECTS', 'MASH P TO KEEP A STRING GOING (P, P, H...)',
        'FIRES THE ULTIMATE WITH 3 BARS   ENTER: REMAP', 'FIRES THE ULTIMATE WITH 3 BARS   ENTER: REMAP', 'BACK TO THE MENU'][this.index] + (this.index < 4 ? '   LEFT/RIGHT CHANGE' : ''));
    } else {
      labels = MENU.map(function (m) { return m.label; });
      this.help.setText(MENU[this.index].help);
    }
    this.rows.forEach(function (r, k) {
      r.setText(labels[k] || '').setScale(self.options ? 1.5 : 2).setY(BOX.y + 12 + k * (self.options ? 15 : 18)).setFont(k === self.index ? 'pf_y' : 'pf_w');
    });
  };

  // Long shadows: the sun is low behind everyone, so shadows stretch toward us.
  TitleScene.prototype.drawShadows = function () {
    var g = this.shadows;
    g.fillStyle(0x07040c, 0.4);
    function shadow(x, y, w, len) {
      var skew = (x - SUN.x) * 0.55;
      g.fillPoints([{ x: x - w / 2, y: y }, { x: x + w / 2, y: y }, { x: x + w * 0.9 + skew, y: y + len }, { x: x - w * 0.9 + skew, y: y + len }], true);
    }
    SIL_X.forEach(function (x) { shadow(x, SIL_Y, 20, 60); });
    shadow(CAR.x, CAR.y, 250, 70);
    shadow(PED.x, PED.y, 26, 64);
  };

  TitleScene.prototype.update = function () {
    var t = ++this.t;
    if (FG.Sfx.ctx && FG.settings.sound && !FG.Music.playing && !this.started) FG.Music.play();
    FG.Music.update();
    this.prompt.setVisible(!this.menuOn && t > STAMP_HIT && t % 60 < 40);
    if (++this.idle > IDLE_DEMO) this.demo();
    this.updateLogo(t);
    this.drawSky(t);
    this.drawSilhouettes(t);
    this.drawLamps(t);
    this.drawCover(t);
    this.drawAir(t);
  };

  // The logo slams in (screen shake and a flash), then the C221 stamp hits.
  TitleScene.prototype.updateLogo = function (t) {
    var lu = Math.min(1, t / LOGO_HIT), su = Math.max(0, Math.min(1, (t - (STAMP_HIT - 10)) / 10));
    this.logo.setScale(1 + (1 - lu * lu) * 3).setAlpha(Math.min(1, lu * 1.5));
    this.stamp.setScale(1 + (1 - su * su) * 2.2).setAlpha(su).setVisible(t > STAMP_HIT - 10);
    if (t === LOGO_HIT) { this.cameras.main.shake(260, 0.014); FG.Sfx.play({ type: 'hit', move: { strength: 'heavy' }, impact: 'power', ch: true, hits: 1 }); }
    if (t === STAMP_HIT) { this.cameras.main.shake(140, 0.006); FG.Sfx.play({ type: 'hit', move: { strength: 'medium' }, impact: 'overhead', hits: 1 }); }
    var f = this.flash;
    f.clear();
    if (t >= LOGO_HIT && t < LOGO_HIT + 14) { f.fillStyle(0xffffff, 0.9 * (1 - (t - LOGO_HIT) / 14)); f.fillRect(0, 0, W, H); }
    if (t >= STAMP_HIT && t < STAMP_HIT + 8) { f.fillStyle(0xff3030, 0.35 * (1 - (t - STAMP_HIT) / 8)); f.fillRect(0, 0, W, H); }
    // A shine sweeps across the chrome every few seconds.
    var m = this.shineMask, st = (t - LOGO_HIT - 20) % 240;
    m.clear();
    this.shine.setVisible(t > LOGO_HIT && st >= 0 && st < 40);
    if (this.shine.visible) {
      var sx = -40 + st / 40 * (W + 80);
      m.fillStyle(0xffffff, 1);
      m.fillPoints([{ x: sx, y: 10 }, { x: sx + 22, y: 10 }, { x: sx - 8, y: 80 }, { x: sx - 30, y: 80 }], true);
    }
  };

  TitleScene.prototype.drawSky = function (t) {
    var g = this.sky;
    g.clear();
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      s.x -= s.sp; if (s.x < -12) s.x = W + 4;
      var a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.04 + s.ph));
      g.fillStyle(0xffe8c8, a);
      for (var p = 0; p < 25; p++) if (s.pat[p] === '#') g.fillRect(Math.round(s.x) + (p % 5) * s.size, Math.round(s.y) + Math.floor(p / 5) * s.size, s.size, s.size);
    }
  };

  // Black silhouettes with a rim of sunset light; every so often one flashes in
  // their own colour, left to right.
  TitleScene.prototype.drawSilhouettes = function (t) {
    var g = this.sil, n = this.sils.length;
    g.clear();
    var turn = Math.floor((t - 60) / 26), phase = (t - 60) % 26;
    for (var k = 0; k < n; k++) {
      var s = this.sils[k], p = s.p;
      FG.updatePose(p, t + k * 17);
      s.flash = t > 60 && turn % (n + 4) === k ? Math.sin(phase / 26 * Math.PI) : 0;
      var rim = s.flash > 0.05 ? mix(0x8a3a5a, s.rim, Math.min(1, s.flash * 1.4)) : 0x8a3a5a;
      var off = 1 + Math.round(s.flash * 2), toSun = p.x < SUN.x ? 1 : -1;
      FG.drawFighter(g, p, { scale: SIL_SCALE, groundY: SIL_Y - off, flash: rim, noShadow: true, x: p.x + toSun * off });
      if (s.flash > 0.05) FG.drawFighter(g, p, { scale: SIL_SCALE, groundY: SIL_Y - off, flash: rim, noShadow: true, x: p.x - toSun * off });
      FG.drawFighter(g, p, { scale: SIL_SCALE, groundY: SIL_Y, flash: 0x0c0612, noShadow: true });
    }
  };

  // Two lot lights; the right one flickers.
  TitleScene.prototype.drawLamps = function (t) {
    var g = this.lamps;
    g.clear();
    if (t % 7 === 0) this.lampState[1] = Math.random() < (Math.floor(t / 300) % 2 ? 0.55 : 0.97) ? 1 : 0;
    var POLES = [{ x: 20, top: 128 }, { x: 626, top: 120 }];
    for (var i = 0; i < 2; i++) {
      var pl = POLES[i], on = this.lampState[i], dir = i === 0 ? 1 : -1, hx = pl.x + dir * 22;
      g.fillStyle(0x0c0812, 1); g.fillRect(pl.x - 2, pl.top, 4, 306 - pl.top); g.fillRect(Math.min(pl.x, hx), pl.top, 22, 3);
      g.fillStyle(on ? 0xfff0c0 : 0x3a3040, 1); g.fillRect(hx - 6, pl.top + 2, 12, 3);
      if (on) {
        g.fillStyle(0xffe0a0, 0.08);
        g.fillPoints([{ x: hx - 6, y: pl.top + 5 }, { x: hx + 6, y: pl.top + 5 }, { x: hx + 50, y: 306 }, { x: hx - 50, y: 306 }], true);
        g.fillStyle(0xffe0a0, 0.18); g.fillEllipse(hx, 306, 100, 12);
        g.fillStyle(0xfff4d0, 0.35); g.fillCircle(hx, pl.top + 4, 6);
      }
    }
  };

  // The car (its lights blink once, like it was just locked) and PEDERSEN.
  TitleScene.prototype.drawCover = function (t) {
    var g = this.cover;
    g.clear();
    var lt = t - 90, lights = lt >= 0 && lt < 24 ? (lt < 8 || (lt >= 14 && lt < 22) ? 1 : 0) : 0;
    if (lt === 0) FG.Sfx.ui('confirm');
    FG.drawCar(g, CAR.x, CAR.y, { scale: CAR.scale, facing: 1, lights: lights });
    var p = this.ped, pt = p._override.t = (p._override.t + 1) % 360;
    p._props.puff = pt >= PUFF[0] + 8 && pt < PUFF[1];
    var gl = t % 210;
    p._props.glint = gl < 14 ? gl / 13 : -1;
    FG.updatePose(p, t);
    FG.drawFighter(g, p, { scale: PED.scale, groundY: PED.y, noShadow: true });
  };

  // Cigar smoke, the exhale, heat shimmer off the engine, the glint on his shades.
  TitleScene.prototype.drawAir = function (t) {
    var g = this.air, p = this.ped, pr = p._props, pt = p._override.t;
    g.clear();
    if (pr.tip && t % 5 === 0) this.smoke.push({ x: pr.tip.x, y: pr.tip.y, vx: 0.08, vy: -0.45, t: 0, life: 100, size: 1.5 });
    if (pt === EXHALE && pr.lens) {
      for (var e = 0; e < 10; e++) this.smoke.push({ x: pr.lens.x + 10, y: pr.lens.y + 10, vx: 0.5 + Math.random() * 0.6, vy: -0.2 - Math.random() * 0.4, t: 0, life: 80 + e * 6, size: 2.5 });
    }
    for (var i = this.smoke.length - 1; i >= 0; i--) {
      var s = this.smoke[i];
      s.t++; s.x += s.vx + Math.sin((s.t + i * 9) * 0.07) * 0.35; s.y += s.vy; s.vx *= 0.99; s.vy *= 0.995;
      if (s.t > s.life) { this.smoke.splice(i, 1); continue; }
      var u = s.t / s.life, sz = Math.round(s.size + u * 4);
      g.fillStyle(0xc8bcd0, 0.5 * (1 - u));
      g.fillRect(Math.round(s.x - sz / 2), Math.round(s.y - sz / 2), sz, sz);
    }
    // Heat shimmer: wavy, faint lines rising off the engine cover.
    var ex = CAR.x - 36 * CAR.scale, ey = CAR.y - 34 * CAR.scale;
    for (var k = 0; k < 5; k++) {
      var age = (t * 0.6 + k * 12) % 60, y = ey - age, a = 0.16 * (1 - age / 60);
      g.lineStyle(1, 0xffd8b0, a);
      g.beginPath();
      for (var x = -26; x <= 26; x += 4) {
        var px = ex + x, py = y + Math.sin(x * 0.3 + t * 0.15 + k) * 1.6;
        if (x === -26) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    // The sunset glints off his sunglasses: a four-point sparkle.
    if (pr.glint >= 0.3 && pr.glint <= 0.9 && pr.lens) {
      var gx = pr.lens.x + 4, gy = pr.lens.y, r = 3 + Math.round(Math.sin(pr.glint * Math.PI) * 5);
      g.fillStyle(0xffffff, 1);
      g.fillRect(gx - r, gy, r * 2 + 1, 1); g.fillRect(gx, gy - r, 1, r * 2 + 1);
      g.fillRect(gx - 1, gy - 1, 3, 3);
    }
  };

  FG.TitleScene = TitleScene;
})();
