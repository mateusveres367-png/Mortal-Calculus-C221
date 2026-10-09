// The announcer: a big voice calling the fight (ROUND 1, FIGHT!, COUNTER!, K.O.!,
// PERFECT!, the fighters' names), through the browser's speech synthesis, with a short
// synthesized sting under each call so it lands even where there's no voice. Quiet
// when the sound is off.
//
//   FG.Announcer.say(text, { sting, cooldown (ms), interrupt, key })
//   FG.Announcer.stop()
(function () {
  var A = FG.Announcer = { last: {} };

  function speech() { return typeof window !== 'undefined' && window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null; }

  // A deep English voice if there is one.
  var PREFER = /(male|daniel|fred|alex|george|david|guy|uk english male)/i;
  function voice() {
    var s = speech(), vs;
    try { vs = s ? s.getVoices() : []; } catch (e) { vs = []; }
    var en = vs.filter(function (v) { return /^en/i.test(v.lang); });
    return en.filter(function (v) { return PREFER.test(v.name); })[0] || en[0] || null;
  }

  // Names as they're said, not spelled: 'BRINKHUS' -> 'Brinkhus'.
  A.name = function (n) { return n.charAt(0) + n.slice(1).toLowerCase(); };

  A.say = function (text, opts) {
    opts = opts || {};
    if (FG.Sfx.muted || !FG.settings.sound) return;
    var now = Date.now(), key = opts.key || text;
    if (opts.cooldown && A.last[key] && now - A.last[key] < opts.cooldown) return;
    A.last[key] = now;
    if (opts.sting) A.sting(opts.sting);
    var s = speech();
    if (!s) return;
    try {
      if (opts.interrupt) s.cancel();
      var u = new window.SpeechSynthesisUtterance(text);
      u.pitch = 0.45; u.rate = opts.rate || 0.92; u.volume = 1;
      var v = voice();
      if (v) u.voice = v;
      s.speak(u);
    } catch (e) { /* no voice here: the sting still plays */ }
  };

  A.stop = function () { var s = speech(); try { if (s) s.cancel(); } catch (e) { /* nothing to stop */ } };

  // Stings: brassy synth hits under the calls.
  A.sting = function (kind) {
    FG.Sfx.synth(function (S) {
      function brass(f, at, dur, g) { S.osc({ dur: dur, f0: f, gain: g, type: 'sawtooth', at: at, attack: 0.02 }); S.osc({ dur: dur, f0: f * 1.005, gain: g * 0.6, type: 'square', at: at, attack: 0.02 }); }
      switch (kind) {
        case 'round': brass(220, 0, 0.5, 0.05); brass(330, 0.12, 0.6, 0.05); break;
        case 'fight': brass(220, 0, 0.35, 0.06); brass(277, 0, 0.35, 0.05); brass(330, 0, 0.35, 0.05); S.noise({ dur: 0.3, freq: 1200, q: 0.6, gain: 0.15 }); S.osc({ dur: 0.4, f0: 110, f1: 40, gain: 0.5 }); break;
        case 'counter': brass(440, 0, 0.18, 0.05); brass(659, 0.06, 0.22, 0.05); break;
        case 'ko': S.osc({ dur: 0.9, f0: 90, f1: 28, gain: 0.8 }); brass(147, 0.02, 0.9, 0.06); brass(196, 0.02, 0.9, 0.05); brass(110, 0.02, 0.9, 0.05); break;
        case 'perfect': [523, 659, 784, 1047].forEach(function (f, i) { brass(f, i * 0.07, 0.3, 0.04); }); break;
        case 'close': brass(196, 0, 0.3, 0.05); brass(185, 0.15, 0.4, 0.05); break;
        case 'win': [392, 523, 659].forEach(function (f, i) { brass(f, i * 0.09, 0.5, 0.045); }); break;
      }
    });
  };
})();
