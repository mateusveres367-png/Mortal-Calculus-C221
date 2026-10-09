// Music: synth-rock loops synthesized with Web Audio (nothing loaded from disk): a
// low one for the title screen and a tense one for fights that intensifies (faster,
// more drums, a lead, then an urgent arpeggio) in the final round and when either
// fighter is low. A tiny step sequencer schedules notes a little ahead of the audio
// clock; call FG.Music.update() every frame while it plays.
//
//   FG.Music.play(song)        start a loop: 'title' (the default) or 'fight'
//   FG.Music.setIntensity(k)   the fight loop: 0 calm, 1 final round, 2 someone's low
//   FG.Music.stop()            fade out
(function () {
  var BPM = 112, STEP = 60 / BPM / 4; // sixteenth notes (the title loop)
  var AHEAD = 0.25;                   // seconds scheduled ahead

  // Four bars of sixteenths. Chord roots per bar (MIDI): E, E, C, D.
  var ROOTS = [40, 40, 36, 38];
  // Guitar: 'x' palm-muted chug, 'O' open accent, '.' rest.
  var GTR = ['x.x.x.xOx.x.x.O.', 'x.x.x.xOx.x.O.O.', 'O...x.x.O...x.x.', 'O...x.x.O.x.O.O.'];
  var KICK = 'x.....x.x.......';
  var SNARE = '....x.......x...';
  var HAT = 'x.x.x.x.x.x.x.x.';
  // A lead synth over the last two bars: [step in bar, MIDI note, length in steps].
  var LEAD = { 2: [[0, 64, 6], [6, 67, 2], [8, 71, 8]], 3: [[0, 69, 6], [6, 67, 2], [8, 66, 4], [12, 62, 4]] };

  var M = { playing: false };

  function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function curve(amount) {
    var n = 1024, c = new Float32Array(n);
    for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = (1 + amount) * x / (1 + amount * Math.abs(x)); }
    return c;
  }

  function setup() {
    var ctx = FG.Sfx.ctx;
    M.out = ctx.createGain(); M.out.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    M.out.connect(comp); comp.connect(ctx.destination);
    // Guitar bus: distortion, then a lowpass to keep it dark.
    M.gtr = ctx.createWaveShaper(); M.gtr.curve = curve(14); M.gtr.oversample = '2x';
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700;
    var g = ctx.createGain(); g.gain.value = 0.22;
    M.gtr.connect(lp); lp.connect(g); g.connect(M.out);
  }

  function osc(type, freq, t, dur, gain, dest, attack) {
    var ctx = FG.Sfx.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + (attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(t, dur, freq, type, gain) {
    var ctx = FG.Sfx.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = FG.Sfx.noise;
    f.type = type; f.frequency.value = freq;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(M.out);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // The fight loop, in A minor: A, A, F, G. Layers come in with the intensity.
  var F_ROOTS = [45, 45, 41, 43];
  var F_GTR = ['x.x.x.x.x.x.x.x.', 'x.x.x.x.x.x.O...', 'x.x.x.x.x.x.x.x.', 'x.x.x.x.O...O...'];
  var F_KICK = ['x.......x.x.....', 'x.....x.x.x.....', 'x...x...x...x...'];
  var F_SNARE = '....x.......x...';
  var F_LEAD = { 1: [[0, 69, 3], [4, 72, 3], [8, 76, 6], [14, 74, 2]], 3: [[0, 74, 4], [4, 72, 4], [8, 71, 4], [12, 67, 4]] };
  function fightStep(n, t) {
    var k = M.intensity, bar = Math.floor(n / 16) % 4, s = n % 16, root = F_ROOTS[bar], st = M.stepLen;
    var gc = F_GTR[bar][s];
    if (gc !== '.' && (k > 0 || s % 4 === 0 || gc === 'O')) {
      var len = gc === 'x' ? st * 0.85 : st * 3.5;
      [0, 7].forEach(function (iv) { osc('sawtooth', hz(root + 12 + iv), t, len, 0.12 + 0.03 * k, M.gtr); });
    }
    if (s % 2 === 0) osc('triangle', hz(root + (k > 0 && s % 4 === 2 ? 12 : 0)), t, st * 1.8, 0.3, M.out); // bass, octaves when it heats up
    if (F_KICK[k][s] === 'x') { osc('sine', 120, t, 0.16, 0.7, M.out); osc('sine', 50, t + 0.01, 0.15, 0.5, M.out); }
    if (F_SNARE[s] === 'x') { noise(t, 0.15, 1900, 'bandpass', 0.42); osc('triangle', 200, t, 0.07, 0.2, M.out); }
    if (k >= 1 ? true : s % 2 === 0) noise(t, 0.035, 7400, 'highpass', k >= 1 ? 0.1 : 0.12);
    if (k >= 1) {
      var lead = F_LEAD[bar];
      if (lead) lead.forEach(function (l) { if (l[0] === s) osc('square', hz(l[1]), t, st * l[2], 0.045, M.out, 0.02); });
    }
    if (k >= 2) { // the urgent arpeggio: chord tones racing up on sixteenths
      var arp = [0, 3, 7, 12][s % 4];
      osc('square', hz(root + 36 + arp), t, st * 0.8, 0.03, M.out);
      if (s === 0) noise(t, 0.4, 5000, 'highpass', 0.1); // a crash on each bar
    }
  }

  function step(n, t) {
    if (M.song === 'fight') { fightStep(n, t); return; }
    var bar = Math.floor(n / 16) % 4, s = n % 16, root = ROOTS[bar];
    var gc = GTR[bar][s];
    if (gc !== '.') {
      // Power chord: root, fifth, octave; chugs are short, accents ring.
      var len = gc === 'x' ? STEP * 0.9 : STEP * 3.5;
      [0, 7, 12].forEach(function (iv) {
        osc('sawtooth', hz(root + 12 + iv), t, len, 0.16, M.gtr);
        osc('square', hz(root + 12 + iv) * 1.004, t, len, 0.08, M.gtr);
      });
    }
    if (s % 2 === 0) osc('triangle', hz(root), t, STEP * 1.8, 0.32, M.out); // bass on eighths
    if (KICK[s] === 'x') { osc('sine', 120, t, 0.18, 0.7, M.out); osc('sine', 55, t + 0.01, 0.16, 0.5, M.out); }
    if (SNARE[s] === 'x') { noise(t, 0.16, 1800, 'bandpass', 0.45); osc('triangle', 190, t, 0.08, 0.2, M.out); }
    if (HAT[s] === 'x') noise(t, 0.04, 7000, 'highpass', 0.12);
    var lead = LEAD[bar];
    if (lead) lead.forEach(function (l) {
      if (l[0] === s) osc('square', hz(l[1]), t, STEP * l[2], 0.05, M.out, 0.03);
    });
  }

  M.intensity = 0;
  M.song = 'title';
  M.stepLen = STEP;
  M.play = function (song) {
    var ctx = FG.Sfx.ctx;
    song = song || 'title';
    if (!ctx || FG.Sfx.muted || (M.playing && M.song === song)) return;
    if (!M.out) setup();
    M.song = song;
    M.intensity = 0;
    M.stepLen = song === 'fight' ? 60 / 126 / 4 : STEP;
    M.playing = true;
    M.next = ctx.currentTime + 0.1;
    M.n = 0;
    M.out.gain.cancelScheduledValues(ctx.currentTime);
    M.out.gain.setValueAtTime(M.out.gain.value, ctx.currentTime);
    M.out.gain.linearRampToValueAtTime(song === 'fight' ? 0.3 : 0.5, ctx.currentTime + 1.5); // under the fight's sounds
  };
  // The fight loop speeds up a little with each level.
  M.setIntensity = function (k) {
    if (k === M.intensity) return;
    M.intensity = k;
    if (M.song === 'fight') M.stepLen = 60 / (126 + 10 * k) / 4;
  };

  M.stop = function () {
    if (!M.playing) return;
    M.playing = false;
    var ctx = FG.Sfx.ctx;
    M.out.gain.cancelScheduledValues(ctx.currentTime);
    M.out.gain.setValueAtTime(M.out.gain.value, ctx.currentTime);
    M.out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  };

  M.update = function () {
    if (!M.playing) return;
    if (FG.Sfx.muted) { M.stop(); return; }
    var ctx = FG.Sfx.ctx;
    if (M.next < ctx.currentTime) M.next = ctx.currentTime + 0.05; // the tab was hidden: don't burst-play
    while (M.next < ctx.currentTime + AHEAD) {
      step(M.n++, M.next);
      M.next += M.stepLen;
    }
  };

  FG.Music = M;
})();
