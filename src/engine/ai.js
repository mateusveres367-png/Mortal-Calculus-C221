// CPU opponent. Like the training dummy, it produces raw inputs every tick, as a
// keyboard would; it only sees the match the way a player does, with a reaction
// delay. Difficulty sets how fast it reacts and how well it guards, punishes,
// breaks throws and finishes combos.
//
//   var ai = new FG.AI('normal', seed);   raw = ai.input(self, opp, match);
(function () {
  var C = FG.C;

  FG.AI_LEVELS = {
    //        react: frames before it sees an attack coming; block/lowRead/punish/combo/...: chances
    easy:   { name: 'EASY',   react: 22, block: 0.3,  lowRead: 0.25, punish: 0.2,  combo: 0.25, aggression: 0.35, breakThrow: 0.1,  tech: 0.15, sidestep: 0.04, think: [14, 30], tiers: ['easy'] },
    normal: { name: 'NORMAL', react: 15, block: 0.5,  lowRead: 0.45, punish: 0.45, combo: 0.55, aggression: 0.5,  breakThrow: 0.3,  tech: 0.45, sidestep: 0.08, think: [9, 22],  tiers: ['easy', 'medium'] },
    hard:   { name: 'HARD',   react: 7,  block: 0.9,  lowRead: 0.85, punish: 0.95, combo: 0.95, aggression: 0.6,  breakThrow: 0.7,  tech: 0.85, sidestep: 0.2,  think: [4, 12],  tiers: ['medium', 'hard'] }
  };
  FG.AI_ORDER = ['easy', 'normal', 'hard'];

  function AI(level, seed) {
    this.setLevel(level || 'normal');
    this.rng = mulberry(seed || 7);
    this.seen = [];          // what the opponent was doing, one entry per tick
    this.script = null;      // a planned input sequence (string, combo) on game frames
    this.walk = null;        // { dir, until } a short walk
    this.guard = null;       // { move, block, low } decision about the attack coming in
    this.wake = null;
    this.techRoll = null;
    this.breakRoll = null;
    this.nextThink = 0;
  }

  AI.prototype.setLevel = function (level) {
    this.level = level;
    this.L = FG.AI_LEVELS[level] || FG.AI_LEVELS.normal;
  };

  // A notation like 'D+H' or 'F+P' as raw input for a fighter facing `facing`.
  function toRaw(notation, facing) {
    var r = FG.parseInput(notation);
    if (facing < 0) { var l = r.left; r.left = r.right; r.right = l; }
    return r;
  }

  function reach(self, m) { return m && m.box ? m.box.x + m.box.w : 0; }
  function attacking(f) { return f.state === 'attack' && f.move && f.move.box; }

  // Combo routes it knows: ones that start with a plain press at any spacing.
  AI.prototype.routes = function (def, first) {
    var L = this.L;
    return def.combos.filter(function (c) {
      if (!c.plan || c.wall || c.oppPlan || c.hold || c.dist || L.tiers.indexOf(c.difficulty) < 0) return false;
      var keys = Object.keys(c.plan).map(Number).sort(function (a, b) { return a - b; });
      return c.plan[keys[0]] === first && keys[0] === 0;
    });
  };

  AI.prototype.startScript = function (plan, match, self) {
    this.script = { plan: plan, start: match.frame, fired: {}, last: Math.max.apply(null, Object.keys(plan).map(Number)), first: null };
    this.walk = null;
  };

  // Start a combo route (or just its first hit, if it doesn't roll the combo).
  AI.prototype.startRoute = function (first, match, self) {
    var routes = this.routes(self.def, first);
    if (routes.length && this.rng() < this.L.combo) {
      this.startScript(routes[Math.floor(this.rng() * routes.length)].plan, match, self);
    } else {
      var p = {}; p[0] = first; this.startScript(p, match, self);
    }
  };

  AI.prototype.input = function (self, opp, match) {
    var L = this.L, rnd = this.rng, raw = FG.emptyRaw();
    var fwdKey = self.facing > 0 ? 'right' : 'left', backKey = self.facing > 0 ? 'left' : 'right';
    var dist = Math.abs(opp.x - self.x);
    self.holdGuard = false;
    // A new match (next round): forget plans timed on the old one's frames.
    if (match !== this.match) {
      this.match = match;
      this.seen = []; this.script = null; this.walk = null; this.guard = null; this.nextThink = 0;
      this.wake = null; this.techRoll = null; this.breakRoll = null; this.punishRoll = null;
    }

    // Perception: what the opponent was doing `react` ticks ago.
    this.seen.push({ attacking: attacking(opp), move: opp.move, frame: opp.moveFrame, state: opp.state });
    if (this.seen.length > 60) this.seen.shift();
    var seen = this.seen[Math.max(0, this.seen.length - 1 - L.react)];

    // --- Being thrown: maybe break it (with the right button). -------------------
    var t = match.throwState;
    if (t && t.d === self.index && t.move.breakBtn) {
      if (this.breakRoll === null) this.breakRoll = rnd() < L.breakThrow;
      if (this.breakRoll && match.frame - t.start === Math.min(8, Math.round(L.react / 2))) raw[t.move.breakBtn] = true;
      return raw;
    }
    this.breakRoll = null;

    // --- Juggled: maybe tech the landing. ------------------------------------------
    if (self.state === 'juggle') {
      if (this.techRoll === null) this.techRoll = rnd() < L.tech;
      if (this.techRoll && self.vy < 0 && self.y < 14) raw.p = true;
      this.script = null;
      return raw;
    }
    this.techRoll = null;

    // --- Knocked down: pick a wake-up. -------------------------------------------
    if (self.state === 'down') {
      if (!this.wake) {
        var opts = [{}, { up: true }, { back: true }, { ss: true }, { k: true }, { p: true }];
        this.wake = opts[Math.floor(rnd() * opts.length)];
      }
      var w = this.wake;
      if (self.stateFrame >= C.QUICK_RISE_FROM) {
        if (w.up) raw.up = true;
        if (w.back) raw[backKey] = true;
        if (w.ss) raw.ssIn = true;
        if (w.k && self.stateFrame === C.QUICK_RISE_FROM) raw.k = true;
        if (w.p && self.stateFrame === C.QUICK_RISE_FROM) raw.p = true;
      }
      return raw;
    }
    this.wake = null;
    if (self.state === 'hitstun' || self.state === 'wallsplat' || self.state === 'thrown' || self.state === 'guardbreak') { this.script = null; return raw; }

    // --- A planned sequence (string, combo, dash in). ----------------------------
    if (this.script) {
      var sc = this.script, ft = match.frame - sc.start;
      // Give up on a combo that was blocked or whiffed.
      var opener = sc.first;
      if (!opener && self.state === 'attack') opener = sc.first = self.move;
      var blocked = self.contact === 'block';
      var whiffed = !sc.keep && opener && self.state !== 'attack' && self.state !== 'air' && ft > 2 && match.combo[opp.index].hits === 0;
      if (blocked || whiffed || ft > sc.last + 40) this.script = null;
      else {
        var tok = sc.plan[ft];
        if (tok && !sc.fired[ft]) { sc.fired[ft] = true; raw = toRaw(tok, self.facing); }
        return raw;
      }
    }

    // --- Guarding: an attack is coming (seen with the reaction delay). ---------------
    var threat = seen.attacking && seen.move && seen.frame <= seen.move.startup + seen.move.active - 1 && attacking(opp);
    if (threat && dist < reach(opp, opp.move) + 40) {
      if (!this.guard || this.guard.move !== opp.move) {
        var m = opp.move, low = m.level === 'low';
        this.guard = {
          move: m,
          block: rnd() < L.block,
          // Lows need a read; highs can be ducked.
          low: low ? rnd() < L.lowRead : (m.level === 'high' && rnd() < L.lowRead * 0.3),
          step: !m.tracks && m.startup >= 16 && rnd() < L.sidestep
        };
      }
      var gd = this.guard, st = self.def.ai || {};
      // Style: DALSASS sways back out of highs and mids, then counters.
      if (gd.sway == null) gd.sway = !!(st.sway && m === opp.move && opp.move.level !== 'low' && self.def.moves.bK && self.def.moves.bK.evade && rnd() < st.sway * L.block);
      if (gd.sway && self.actionable) { gd.sway = false; gd.block = false; this.startScript({ 0: 'B+K', 8: 'P' }, match, self); return toRaw('B+K', self.facing); }
      if (gd.step && self.actionable) { raw.ssIn = true; gd.step = false; return raw; }
      if (gd.block) { raw[backKey] = true; raw.down = gd.low; self.holdGuard = true; return raw; }
    } else if (!attacking(opp)) {
      this.guard = null;
    }
    // Keep guarding through blockstun.
    if (self.state === 'blockstun') { raw[backKey] = true; raw.down = self.guardCrouch; return raw; }

    if (!self.actionable) return raw;

    // --- Punish: the opponent is stuck recovering in range. ---------------------
    if (opp.state === 'attack' && opp.inRecovery() && (opp.contact === 'block' || !opp.contact)) {
      var left = opp.move.total - opp.moveFrame, mv = self.def.moves;
      if (!this.punishRoll) this.punishRoll = { move: opp.move, go: rnd() < L.punish };
      if (this.punishRoll.move === opp.move && this.punishRoll.go) {
        if (left >= mv.launcher.startup && dist < reach(self, mv.launcher) + 10) { this.startRoute('D+H', match, self); return toRaw('D+H', self.facing); }
        if (left >= mv.jab.startup && dist < reach(self, mv.jab) + 12) { this.startRoute('P', match, self); return toRaw('P', self.facing); }
      }
    } else {
      this.punishRoll = null;
    }

    // --- Neutral: walk, poke, pressure, throw. ------------------------------------
    if (this.walk && match.frame < this.walk.until) {
      raw[this.walk.dir === 'fwd' ? fwdKey : backKey] = true;
      if (this.walk.dir === 'back') self.holdGuard = false;
      if (match.frame < this.nextThink) return raw;
    }
    if (match.frame < this.nextThink) return raw;
    this.nextThink = match.frame + L.think[0] + Math.floor(rnd() * (L.think[1] - L.think[0]));
    this.walk = null;
    var moves = self.def.moves, st = self.def.ai || {}, a = Math.min(0.95, L.aggression * (st.aggro || 1)), roll = rnd();
    var close = dist < reach(self, moves.jab) + 10, mid = dist < reach(self, moves.mid) + 18;
    // Each fighter's style (def.ai): the moves they like up close and at poking range,
    // the distance they like to fight from, and their tricks.
    var pick = function (list) { return list && list.length ? list[Math.floor(rnd() * list.length)] : null; };
    if (st.spacing && opp.state !== 'down') {
      if (dist < st.spacing - 18 && roll < 0.3 && !close) { this.walk = { dir: 'back', until: match.frame + 10 }; return raw; }
    }
    var styled = L.combo; // better CPUs play to their style more
    if (close && st.close && roll < a * 0.5 * styled) return this.styleAttack(pick(st.close), match, self);
    if (!close && mid && st.pokes && roll < a * 0.45 * styled) return this.styleAttack(pick(st.pokes), match, self);
    if (opp.state === 'down' && dist < 90) {
      // They're down: a low ground hit, or wait for them to get up.
      if (moves.low && moves.low.otg && dist < reach(self, moves.low) + 6 && roll < 0.5) return toRaw('D+K', self.facing);
      this.walk = { dir: 'back', until: match.frame + 10 };
      return raw;
    }
    if (close) {
      if (roll < a * 0.45) { this.startRoute('P', match, self); return toRaw('P', self.facing); }
      if (roll < a * 0.6) return toRaw('P+K', self.facing);                       // throw
      if (roll < a * 0.75) { this.startRoute('D+H', match, self); return toRaw('D+H', self.facing); }
      if (roll < a * 0.9) return toRaw(rnd() < 0.5 ? 'D+K' : 'K', self.facing);
      if (roll < a + 0.15) { this.walk = { dir: 'back', until: match.frame + 12 }; return raw; }
      // Hold your ground and guard for a moment.
      this.walk = { dir: 'back', until: match.frame + 6 };
      self.holdGuard = true;
      return raw;
    }
    if (mid) {
      if (roll < a * 0.35) return toRaw('K', self.facing);                         // poke
      if (roll < a * 0.5 && moves.fK) return toRaw('F+K', self.facing);
      if (roll < a * 0.6 && moves.low) return toRaw('D+K', self.facing);
      if (roll < 0.75) { this.walk = { dir: 'fwd', until: match.frame + 8 + Math.floor(rnd() * 10) }; return raw; }
      if (roll < 0.85) return { left: false, right: false, up: false, down: false, p: false, k: false, h: false, ssIn: rnd() < 0.5, ssOut: false, t: false };
      this.walk = { dir: 'back', until: match.frame + 10 };
      return raw;
    }
    // Far: close the distance (dash when feeling aggressive).
    if (roll < a * 0.5) { var dp = {}; dp[0] = 'F'; dp[2] = 'F'; this.startScript(dp, match, self); return raw; }
    this.walk = { dir: 'fwd', until: match.frame + 16 + Math.floor(rnd() * 20) };
    return raw;
  };

  // A move from the fighter's style list: combo routes that start with it, and
  // DALSASS-style feints (start it, tap back to cancel, then mix up).
  AI.prototype.styleAttack = function (tok, match, self) {
    var st = self.def.ai || {}, rnd = this.rng;
    if (st.feint && self.def.feintCancel && /[PKH]/.test(tok) && tok !== 'P+K' && rnd() < st.feint) {
      var follow = ['P+K', 'D+K', 'P', 'F+H'][Math.floor(rnd() * 4)];
      this.startScript({ 0: tok, 5: 'B', 13: follow }, match, self);
      this.script.keep = true; // the feinted move never connects: don't give up on the plan
      return toRaw(tok, self.facing);
    }
    this.startRoute(tok, match, self);
    return toRaw(tok, self.facing);
  };

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  FG.AI = AI;
})();
