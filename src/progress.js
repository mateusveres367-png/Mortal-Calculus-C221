// Progress: what you've done and earned, remembered in this browser (localStorage,
// when it's there; everything still works without it).
//
//   FG.progress            the record: wins and matches per fighter, longest combo,
//                          finishers, perfect rounds, arcade clears, Detention and
//                          Timed Test bests, the title you show, your outfit picks
//   FG.Progress.record*    update it after something happens; each returns what was
//                          newly earned ([{ kind: 'title' | 'outfit', name, fighter }])
//   FG.OUTFITS             alternate colours, unlocked by winning with that fighter
//   FG.TITLES              titles shown under your fighter's name, earned by milestones
(function () {
  var KEY = 'mc221.progress';
  var P = FG.progress = {
    wins: {}, played: {}, combo: { hits: 0, fighter: null }, finishers: 0, perfects: 0, closeCalls: 0,
    arcadeClears: 0, detentionBest: 0, timedBest: 0, title: 'freshman', outfit: {}
  };
  try {
    var saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (saved) for (var k in P) if (saved[k] !== undefined) P[k] = saved[k];
  } catch (e) { /* storage unavailable: a fresh record */ }

  function save() { try { window.localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* not saved */ } }

  // --- Student mode ------------------------------------------------------------------
  // The STUDENTS tab on character select is locked behind a code, typed on a keypad
  // (selectScene.js). Once it's open it stays open in this browser.
  var STUDENTS_KEY = 'mc221.students', studentsOpen = false;
  FG.STUDENT_CODE = '0620';
  FG.studentsUnlocked = function () {
    if (studentsOpen) return true;
    try { studentsOpen = window.localStorage.getItem(STUDENTS_KEY) === '1'; } catch (e) { /* no storage: still locked */ }
    return studentsOpen;
  };
  FG.unlockStudents = function () {
    studentsOpen = true; // open for this visit even if it can't be saved
    try { window.localStorage.setItem(STUDENTS_KEY, '1'); } catch (e) { /* not saved */ }
  };

  // --- Outfits ------------------------------------------------------------------------
  // Each fighter's own look recoloured; `wins` with that fighter unlocks it.
  FG.OUTFITS = [
    { name: 'CLASSIC', wins: 0 },
    { name: 'NIGHT SCHOOL', wins: 1, top: 0x22304e, legs: 0x15151c, trim: 0x5fd7ff },
    { name: 'GOLD STAR', wins: 3, top: 0xd4a017, legs: 0x2a241a, trim: 0xfff2a0 },
    { name: 'CHALK DUST', wins: 6, top: 0xe6e6dc, legs: 0x4a5060, trim: 0x9aa4b8 },
    { name: 'RED PEN', wins: 10, top: 0xb0181e, legs: 0x1c1416, trim: 0xffd0c8 }
  ];
  // The outfits picked on character select for each side: [{ id, k }, { id, k }].
  FG.outfitPick = [null, null];
  // A side's outfit for this fighter (0 unless it was picked for them).
  FG.outfitFor = function (def, side) {
    var picks = side == null ? FG.outfitPick : [FG.outfitPick[side]];
    for (var i = 0; i < picks.length; i++) if (picks[i] && picks[i].id === def.id) return picks[i].k;
    return 0;
  };
  FG.outfitsUnlocked = function (id) {
    var w = P.wins[id] || 0;
    return FG.OUTFITS.filter(function (o) { return w >= o.wins; }).length;
  };
  function shade(c, k) { return FG.shade ? FG.shade(c, k) : c; }
  // The look a fighter wears: outfit k (0: their own), or a mirror match's other colours.
  FG.outfitLook = function (def, k) {
    var o = FG.OUTFITS[k];
    if (!o || !o.top) return def.look;
    def._outfits = def._outfits || {};
    if (def._outfits[k]) return def._outfits[k];
    var l = Object.assign({}, def.look);
    l.top = Object.assign({}, l.top, { color: o.top });
    if (l.top.patternColor != null) l.top.patternColor = o.trim;
    if (l.top.collar != null) l.top.collar = shade(o.top, 1.25);
    l.legs = o.legs;
    if (l.blazer) l.blazer = shade(o.top, 0.55);
    def._outfits[k] = l;
    return l;
  };

  // --- Titles -------------------------------------------------------------------------
  function totalWins() { var n = 0; for (var id in P.wins) n += P.wins[id]; return n; }
  FG.TITLES = [
    { id: 'freshman', name: 'FRESHMAN', how: 'EVERYONE STARTS HERE', test: function () { return true; } },
    { id: 'honor', name: 'HONOR ROLL', how: 'WIN 10 MATCHES', test: function () { return totalWins() >= 10; } },
    { id: 'perfect', name: 'PERFECT ATTENDANCE', how: 'WIN A ROUND WITHOUT TAKING DAMAGE', test: function () { return P.perfects >= 1; } },
    { id: 'close', name: 'CLOSE CALL', how: 'WIN A ROUND WITH UNDER 10% HEALTH', test: function () { return P.closeCalls >= 1; } },
    { id: 'goldstar', name: 'GOLD STAR', how: 'LAND A KO FINISHER', test: function () { return P.finishers >= 1; } },
    { id: 'division', name: 'LONG DIVISION', how: 'LAND A 15-HIT COMBO', test: function () { return P.combo.hits >= 15; } },
    { id: 'detention', name: 'DETENTION SURVIVOR', how: 'BEAT 5 IN DETENTION', test: function () { return P.detentionBest >= 5; } },
    { id: 'speed', name: 'SPEED READER', how: 'FINISH THE TIMED TEST IN UNDER 6 MINUTES', test: function () { return P.timedBest > 0 && P.timedBest < 6 * 60 * 1000; } },
    { id: 'dean', name: "DEAN'S LIST", how: 'WIN 25 MATCHES', test: function () { return totalWins() >= 25; } },
    { id: 'faculty', name: 'FACULTY LOUNGE', how: 'WIN WITH ALL NINE FIGHTERS', test: function () { return FG.ROSTER.every(function (d) { return (P.wins[d.id] || 0) > 0; }); } },
    { id: 'valedictorian', name: 'VALEDICTORIAN', how: 'BEAT ARCADE MODE', test: function () { return P.arcadeClears >= 1; } },
    { id: 'tenure', name: 'TENURED', how: 'WIN 100 MATCHES', test: function () { return totalWins() >= 100; } }
  ];
  FG.titleById = function (id) { return FG.TITLES.filter(function (t) { return t.id === id; })[0] || FG.TITLES[0]; };
  FG.titlesEarned = function () { return FG.TITLES.filter(function (t) { return t.test(); }); };

  // --- Recording ------------------------------------------------------------------------
  // Run fn, then report the titles and outfits it newly earned (the newest title becomes
  // the one you show).
  function track(fn) {
    var before = FG.titlesEarned().map(function (t) { return t.id; }), outfits = {};
    FG.ROSTER.forEach(function (d) { outfits[d.id] = FG.outfitsUnlocked(d.id); });
    fn();
    var gained = [];
    FG.titlesEarned().forEach(function (t) { if (before.indexOf(t.id) < 0) { gained.push({ kind: 'title', name: t.name }); P.title = t.id; } });
    FG.ROSTER.forEach(function (d) {
      var n = FG.outfitsUnlocked(d.id);
      for (var k = outfits[d.id]; k < n; k++) gained.push({ kind: 'outfit', name: FG.OUTFITS[k].name, fighter: d.name });
    });
    save();
    return gained;
  }
  FG.Progress = {
    save: save,
    // A match is over. sides: [{ id, human }, { id, human }]; winner: 0, 1 (or -1).
    recordMatch: function (sides, winner) {
      return track(function () {
        sides.forEach(function (s, i) {
          if (!s.human) return;
          P.played[s.id] = (P.played[s.id] || 0) + 1;
          if (i === winner) P.wins[s.id] = (P.wins[s.id] || 0) + 1;
        });
      });
    },
    recordCombo: function (hits, id) { return track(function () { if (hits > P.combo.hits) P.combo = { hits: hits, fighter: id }; }); },
    recordFinisher: function () { return track(function () { P.finishers++; }); },
    recordPerfect: function () { return track(function () { P.perfects++; }); },
    recordCloseCall: function () { return track(function () { P.closeCalls++; }); },
    recordArcade: function () { return track(function () { P.arcadeClears++; }); },
    recordDetention: function (n) { return track(function () { P.detentionBest = Math.max(P.detentionBest, n); }); },
    recordTimed: function (ms) { return track(function () { if (!P.timedBest || ms < P.timedBest) P.timedBest = ms; }); },
    setTitle: function (id) { P.title = id; save(); },
    setOutfit: function (id, k) { P.outfit[id] = k; save(); },
    // The fighter you've played most.
    favourite: function () {
      var best = null;
      for (var id in P.played) if (!best || P.played[id] > P.played[best]) best = id;
      return best;
    },
    totalWins: totalWins
  };
})();
