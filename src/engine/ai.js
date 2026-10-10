// CPU opponent. Like the training dummy, it produces raw inputs every tick, as a
// keyboard would; it only sees the match the way a player does, with a reaction
// delay, and plays by the same rules. Difficulty sets how fast it reacts and how
// well it guards, punishes, breaks throws and finishes combos:
//   EASY       slow reactions, rarely blocks, short combos
//   NORMAL     blocks most highs and mids, punishes some whiffs, mid-length combos
//   HARD       blocks lows too, sidesteps, punishes whiffs, full combos and wall combos
//   PROFESSOR  HARD, and it reads your habits: repeat a move and it learns it,
//              then sees it coming, guards it correctly and punishes it
// Each fighter's def.ai gives its style (spacing, favourite moves, tricks).
//
//   var ai = new FG.AI('normal', seed);   raw = ai.input(self, opp, match);
(function () {
  var C = FG.C;

  FG.AI_LEVELS = {
    //        react: frames before it sees an attack coming; block/lowRead/punish/combo/...: chances
    easy:      { name: 'EASY',      react: 24, block: 0.2,  lowRead: 0.15, punish: 0.15, combo: 0.3,  aggression: 0.35, breakThrow: 0.1, tech: 0.1,  sidestep: 0.02, think: [16, 32], tiers: ['easy'], taunt: 0.06 },
    normal:    { name: 'NORMAL',    react: 14, block: 0.8,  lowRead: 0.3,  punish: 0.45, combo: 0.6,  aggression: 0.5,  breakThrow: 0.3, tech: 0.45, sidestep: 0.06, think: [9, 22],  tiers: ['easy', 'medium'], taunt: 0.05 },
    hard:      { name: 'HARD',      react: 8,  block: 0.92, lowRead: 0.88, punish: 0.95, combo: 0.95, aggression: 0.6,  breakThrow: 0.7, tech: 0.85, sidestep: 0.25, think: [4, 12],  tiers: ['medium', 'hard'], wall: true, taunt: 0.04 },
    professor: { name: 'PROFESSOR', react: 4,  block: 0.97, lowRead: 0.95, punish: 1,    combo: 1,    aggression: 0.65, breakThrow: 0.9, tech: 0.95, sidestep: 0.3,  think: [2, 8],   tiers: ['medium', 'hard'], wall: true, reads: 3, taunt: 0.04 }
  };
  // Meter and stage use by level: meter (enhanced specials and meter routes), ult
  // (ultimates), credit (Extra Credit when it's there), props (stage objects).
  var METER_USE = {
    easy: { meter: 0.15, ult: 0.2, credit: 0.4, props: 0.1 },
    normal: { meter: 0.4, ult: 0.5, credit: 0.8, props: 0.3 },
    hard: { meter: 0.7, ult: 0.85, credit: 1, props: 0.5 },
    professor: { meter: 0.9, ult: 1, credit: 1, props: 0.6 }
  };
  Object.keys(METER_USE).forEach(function (k) { Object.assign(FG.AI_LEVELS[k], METER_USE[k]); });
  var QCF = { 0: 'D', 1: 'D/F', 2: 'F', 3: 'F+P+K+H' }; // the ultimate's input
  // The move a style token starts (for enhancing it).
  var TOKEN_MOVE = { 'F+P': 'fP', 'F+K': 'fK', 'F+H': 'fH', 'B+P': 'bP', 'B+K': 'bK', 'B+H': 'bH', 'D/F+K': 'dfK', 'D+P': 'dP', 'D+K': 'low', 'D+H': 'launcher', H: 'heavy', K: 'mid', P: 'jab' };
  FG.AI_ORDER = ['easy', 'normal', 'hard', 'professor'];
  var HABIT_MEMORY = 10; // the opponent's last attacks the PROFESSOR remembers

  function AI(level, seed) {
    this.setLevel(level || 'normal');
    this.rng = mulberry(seed || 7);
    this.mrng = mulberry((seed || 7) + 7919); // meter and stage-object decisions (kept apart from the rest)
    this.seen = [];          // what the opponent was doing, one entry per tick
    this.script = null;      // a planned input sequence (string, combo) on game frames
    this.walk = null;        // { dir, until } a short walk
    this.guard = null;       // { move, block, low } decision about the attack coming in
    this.wake = null;
    this.techRoll = null;
    this.breakRoll = null;
    this.nextThink = 0;
    this.habits = [];        // PROFESSOR: the opponent's recent attacks (move ids)
    this.learned = {};       // move ids it has learned
    this.noticed = null;     // the label of a move it just learned (the scene shows it)
  }

  // PROFESSOR: the learned move the opponent uses most.
  AI.prototype.favourite = function (opp) {
    var count = {}, best = null, n = 0;
    for (var i = 0; i < this.habits.length; i++) count[this.habits[i]] = (count[this.habits[i]] || 0) + 1;
    for (var id in count) if (this.learned[id] && count[id] > n && opp.def.moves[id]) { n = count[id]; best = opp.def.moves[id]; }
    return n >= 4 ? best : null; // only a real habit
  };

  // PROFESSOR: has it seen this move often enough to read it?
  AI.prototype.knows = function (m) {
    if (!this.L.reads || !m) return false;
    var n = 0;
    for (var i = 0; i < this.habits.length; i++) if (this.habits[i] === m.id) n++;
    if (n >= this.L.reads && !this.learned[m.id]) { this.learned[m.id] = true; this.noticed = m.label; }
    return n >= this.L.reads;
  };

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

  function reach(self, m) { var b = m && (m.box || m.hitbox); return b ? b.x + b.w : 0; } // (grabs have only a hitbox)
  function attacking(f) { return f.state === 'attack' && f.move && f.move.box; }

  // Combo routes it knows: ones that start with a plain press at any spacing.
  AI.prototype.routes = function (def, first, self) {
    var L = this.L, bars = self ? Math.floor(self.meter / C.METER_BAR) : 0, useMeter = bars > 0 && this.mrng() < L.meter;
    return def.combos.filter(function (c) {
      if (!c.plan || c.wall || c.oppPlan || c.hold || c.dist || L.tiers.indexOf(c.difficulty) < 0) return false;
      if (c.meter && (!useMeter || bars < c.meter)) return false; // meter routes need the bars (and the will)
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
    var routes = this.routes(self.def, first, self);
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
      this.seen = []; this.script = null; this.walk = null; this.guard = null; this.nextThink = 0; this.hold = null; this.runIn = null;
      this.wake = null; this.techRoll = null; this.breakRoll = null; this.punishRoll = null;
    }

    // Habits: every attack the opponent starts (the PROFESSOR learns from them).
    var last = this.seen[this.seen.length - 1];
    if (attacking(opp) && opp.move && !(last && last.move === opp.move && last.frame <= opp.moveFrame && last.attacking)) {
      this.habits.push(opp.move.id);
      if (this.habits.length > HABIT_MEMORY) this.habits.shift();
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

    // --- Running in (RAMOS): double-tap, hold forward, then strike or grab up close.
    if (this.runIn) {
      var ri = this.runIn, rt = ri.t++;
      var okState = self.state === 'dash' || self.state === 'run' || self.actionable;
      if (!okState || match.frame > ri.until) { this.runIn = null; }
      else {
        raw[fwdKey] = rt !== 1;
        if (self.state === 'run' && dist < 56) {
          this.runIn = null;
          var finish = rnd() < 0.5 ? 'P+K' : ['P', 'K', 'D+K', 'H'][Math.floor(rnd() * 4)];
          var fr = toRaw(finish, self.facing); fr[fwdKey] = true;
          return fr;
        }
        return raw;
      }
    }

    // --- A held input (a parry stance). --------------------------------------------
    if (this.hold) {
      if (match.frame < this.hold.until && self.state === 'attack' && self.move && self.move.hold) return Object.assign({}, this.hold.raw);
      this.hold = null;
    }

    // --- A planned sequence (string, combo, dash in). ----------------------------
    if (this.script && this.script.queue) {
      // A queued route (wall combos): each input as soon as it can act again.
      var qs = this.script;
      if (qs.qi >= qs.queue.length || (qs.qi > 0 && match.combo[opp.index].hits === 0 && self.actionable) || match.frame - qs.start > 240) this.script = null;
      else {
        if (self.state === 'idle' && match.hitstop === 0) return toRaw(qs.queue[qs.qi++], self.facing);
        return raw;
      }
    }
    if (this.script) {
      var sc = this.script, ft = match.frame - sc.start;
      // Give up on a combo that was blocked or whiffed.
      var opener = sc.first;
      if (!opener && self.state === 'attack') opener = sc.first = self.move;
      var blocked = self.contact === 'block';
      // Style: LEE dash-cancels a blocked attack and keeps pushing.
      var stl = self.def.ai || {};
      if (blocked && self.def.dashCancel && stl.dashCancel && !sc.dashed && self.inRecovery() && rnd() < stl.dashCancel * L.combo) {
        this.startScript({ 0: 'F', 2: 'F', 8: rnd() < 0.5 ? 'P' : 'P+K' }, match, self);
        this.script.dashed = true; this.script.keep = true;
        return toRaw('F', self.facing);
      }
      var whiffed = !sc.keep && opener && self.state !== 'attack' && self.state !== 'air' && ft > 2 && match.combo[opp.index].hits === 0;
      if (blocked || whiffed || ft > sc.last + 40) this.script = null;
      else {
        var tok = sc.plan[ft];
        if (tok && !sc.fired[ft]) { sc.fired[ft] = true; raw = toRaw(tok, self.facing); }
        return raw;
      }
    }

    // --- A projectile coming at it (seen with the reaction delay): guard it at the
    // right height, sidestep it, or jump a low one. -------------------------------
    var pj = this.incoming(self, match);
    if (pj && (self.actionable || self.state === 'blockstun')) {
      if (!this.projGuard || this.projGuard.p !== pj) {
        var plow = FG.projectileLevel(pj) === 'low';
        this.projGuard = { p: pj, block: rnd() < L.block, step: self.state !== 'blockstun' && rnd() < L.sidestep * 1.5,
          jump: plow && pj.y <= 0 && rnd() < L.sidestep * 2 && self.state !== 'blockstun' };
      }
      var pg = this.projGuard;
      if (pg.step && self.actionable) { pg.step = false; pg.block = false; raw.ssIn = true; return raw; }
      if (pg.jump && self.actionable) { pg.jump = false; pg.block = false; raw.up = true; raw[fwdKey] = true; return raw; }
      if (pg.block) {
        var lv = FG.projectileLevel(pj);
        raw[backKey] = true; raw.down = lv === 'low' || (lv === 'high' && rnd() < L.lowRead * 0.5); self.holdGuard = true;
        return raw;
      }
    } else if (!pj) this.projGuard = null;

    // --- Guarding: an attack is coming (seen with the reaction delay). ---------------
    var threat = seen.attacking && seen.move && seen.frame <= seen.move.startup + seen.move.active - 1 && attacking(opp);
    // A move the PROFESSOR has learned: it sees it coming at once.
    var read = attacking(opp) && opp.moveFrame <= opp.move.startup + opp.move.active - 1 && this.knows(opp.move);
    threat = threat || read;
    if (threat && dist < reach(opp, opp.move) + 40) {
      if (!this.guard || this.guard.move !== opp.move) {
        var m = opp.move, low = m.level === 'low', st = self.def.ai || {};
        this.guard = read ? {
          // A learned move: guarded right, or sidestepped if it's slow and linear.
          move: m, block: true, low: low, read: true,
          step: !m.tracks && m.startup >= 16 && rnd() < 0.5
        } : {
          move: m,
          block: rnd() < L.block,
          // Lows need a read; highs can be ducked.
          low: low ? rnd() < L.lowRead : (m.level === 'high' && rnd() < L.lowRead * 0.3),
          step: !m.tracks && m.startup >= (st.sidestep ? 12 : 16) && rnd() < L.sidestep * (st.sidestep || 1)
        };
      }
      var gd = this.guard, st = self.def.ai || {};
      // Style: LOPEZ steps into his Derivative Read parry stance and holds it.
      if (gd.read) {
        gd.parry = gd.parry || false; gd.sway = gd.sway || false; gd.armor = gd.armor || false;
        // ...or beat it to the punch: a slow move it knows gets a counter-hit jab.
        var jb = self.def.moves.jab;
        if (gd.counter == null) gd.counter = !opp.move.armor && opp.move.startup - opp.moveFrame > jb.startup + 1 && dist < reach(self, jb) + 6 && rnd() < 0.6;
        if (gd.counter && self.actionable) { gd.counter = false; gd.block = false; this.startRoute('P', match, self); return toRaw('P', self.facing); }
      }
      // LOPEZ with three bars: the Fundamental Theorem stance instead of a plain parry.
      if (gd.ult == null) gd.ult = !!(self.def.ultimate && self.def.ultimate.counter && opp.move.startup - opp.moveFrame > 12 && this.hasUltimate(self));
      if (gd.ult && self.actionable) { gd.ult = false; gd.block = false; return this.ultimate(match, self); }
      if (gd.parry == null) gd.parry = !!(st.parry && self.def.moves.bH && self.def.moves.bH.parry && rnd() < st.parry * L.block);
      if (gd.parry && self.actionable) {
        gd.parry = false; gd.block = false;
        this.hold = { raw: toRaw('B+H', self.facing), until: match.frame + 24 };
        return toRaw('B+H', self.facing);
      }
      // Style: DALSASS sways back out of highs and mids, then counters.
      if (gd.sway == null) gd.sway = !!(st.sway && m === opp.move && opp.move.level !== 'low' && self.def.moves.bK && self.def.moves.bK.evade && rnd() < st.sway * L.block);
      if (gd.sway && self.actionable) { gd.sway = false; gd.block = false; this.startScript({ 0: 'B+K', 8: 'P' }, match, self); return toRaw('B+K', self.facing); }
      // Style: PEDERSEN swings through your attack on his armor.
      if (gd.armor == null) gd.armor = !!(st.armorTrade && self.def.moves.heavy.armor && m.level !== 'low' && rnd() < st.armorTrade * L.combo);
      if (gd.armor && self.actionable) { gd.armor = false; gd.block = false; return toRaw('H', self.facing); }
      if (gd.step && self.actionable) {
        gd.step = false;
        // CHAI follows her sidestep with an attack out of it.
        if (st.ssFollow) { this.startScript({ 0: 'SI', 6: st.ssFollow }, match, self); this.script.keep = true; }
        raw.ssIn = true;
        return raw;
      }
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
        // Three bars and a big opening: the ultimate (not LOPEZ's: his is a counter).
        var ult = mv.ultimate;
        if (ult && !self.def.ultimate.counter && left >= ult.startup + 4 && dist < reach(self, ult) + 6 && this.hasUltimate(self)) return this.ultimate(match, self);
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
    // LOPEZ with three bars: when they come in, set the Fundamental Theorem stance.
    if (self.def.ultimate && self.def.ultimate.counter && dist < 120 && (opp.state === 'walkF' || opp.state === 'dash' || opp.state === 'run') && self.meter >= C.METER_MAX && this.mrng() < 0.25 * L.ult) return this.ultimate(match, self);
    // Low on health: cash in Extra Credit (P+K+H) when there's a moment.
    if (self.canExtraCredit() && dist > 60 && this.mrng() < L.credit) return toRaw('P+K+H', self.facing);
    // Stage objects: vault out of a corner, or springboard in from beside one.
    var prop = (match.props || []).filter(function (p) { return p.cool === 0 && Math.abs(p.x - self.x) <= C.PROP_REACH - 4; })[0];
    if (prop && this.mrng() < L.props) {
      var cornered = match.wallDistance(self, -self.facing) < 50 && dist < 100;
      if (cornered) return toRaw('B+T', self.facing);
      if (dist > 50 && dist < 130) return toRaw('T', self.facing);
    }
    // Poking range: as far as their K, or their own pokes (a lunge like LEE's F+P), reach.
    var pokeReach = reach(self, moves.mid);
    (st.pokes || []).forEach(function (tok) { var pm = moves[TOKEN_MOVE[tok]]; if (pm) pokeReach = Math.max(pokeReach, reach(self, pm)); });
    var close = dist < reach(self, moves.jab) + 10, mid = dist < pokeReach + 18;
    // Each fighter's style (def.ai): the moves they like up close and at poking range,
    // the distance they like to fight from, and their tricks.
    var pick = function (list) { return list && list.length ? list[Math.floor(rnd() * list.length)] : null; };
    if (st.spacing && opp.state !== 'down') {
      if (dist < st.spacing - 18 && roll < 0.3 && !close) { this.walk = { dir: 'back', until: match.frame + 10 }; return raw; }
    }
    var styled = L.combo; // better CPUs play to their style more
    // Spacing styles (MIYASHIRO) backdash out when you get close.
    if (close && st.backdash && rnd() < st.backdash * styled) { this.startScript({ 0: 'B', 2: 'B' }, match, self); return toRaw('B', self.facing); }
    // Wall combos (HARD and up): with them against the wall, start a wall route.
    if (close && L.wall && match.wallDistance(opp, self.facing) < 30 && roll < a * 0.6) {
      var wr = self.def.combos.filter(function (c) { return c.wall && c.queue && L.tiers.indexOf(c.difficulty) >= 0; });
      if (!wr.length) wr = self.def.combos.filter(function (c) { return c.wall && c.queue; });
      if (wr.length) {
        var q = wr[Math.floor(rnd() * wr.length)].queue;
        this.script = { queue: q, qi: 1, start: match.frame };
        return toRaw(q[0], self.facing);
      }
    }
    // A grab ultimate (RAMOS) can't be blocked: with three bars, up close, go for it.
    if (close && moves.ultimate && moves.ultimate.throw && this.hasUltimate(self) && roll < 0.4) return this.ultimate(match, self);
    if (close && st.close && roll < a * 0.5 * styled) return this.styleAttack(pick(st.close), match, self);
    if (!close && mid && st.pokes && roll < a * 0.45 * styled) return this.styleAttack(pick(st.pokes), match, self);
    // PROFESSOR: in range of a move it has learned, it waits for it, guard up.
    if (L.reads && opp.actionable) {
      var fav = this.favourite(opp);
      if (fav && dist < reach(opp, fav) + 12 && roll < 0.55) { this.walk = { dir: 'back', until: match.frame + 8 }; self.holdGuard = true; raw[backKey] = true; raw.down = fav.level === 'low'; return raw; }
    }
    // A taunt when there's room (they're down, or far away).
    if ((opp.state === 'down' || dist > 200) && rnd() < L.taunt && self.def.moves.taunt && dist > 110) return toRaw('T', self.facing);
    if (opp.state === 'down' && dist < 90) {
      // They're down: a low ground hit, or wait for them to get up.
      if (moves.low && moves.low.otg && dist < reach(self, moves.low) + 6 && roll < 0.5) return toRaw('D+K', self.facing);
      this.walk = { dir: 'back', until: match.frame + 10 };
      return raw;
    }
    if (close) {
      if (roll < a * 0.42) { this.startRoute('P', match, self); return toRaw('P', self.facing); }
      if (roll < a * 0.56) return toRaw(rnd() < 0.3 ? 'B+P+K' : 'P+K', self.facing); // throw (sometimes the reverse one)
      if (roll < a * 0.7) { this.startRoute('D+H', match, self); return toRaw('D+H', self.facing); }
      if (roll < a * 0.82) { var lowTok = ['D+K', 'K', 'D/B+K'][Math.floor(rnd() * 3)]; return toRaw(lowTok, self.facing); } // a low, a mid or the sweep
      if (roll < a * 0.92) { // something heavy (not a feint: that's in their style list with its follow-up)
        var hTok = rnd() < 0.5 && moves.fH && moves.fH.box ? 'F+H' : 'H';
        this.startRoute(hTok, match, self); return toRaw(hTok, self.facing);
      }
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
    // Students zone from range: a projectile (one at a time), or a teleport in.
    if (st.far && dist > 130 && !self.projOut && rnd() < (st.zone || 0.3) * (0.4 + L.combo * 0.6)) return this.styleAttack(pick(st.far), match, self);
    // Runners (RAMOS) sprint in from range.
    if (st.run && self.def.runSpeed && dist > 90 && rnd() < st.run * (0.4 + L.combo * 0.6)) { this.runIn = { t: 1, until: match.frame + 70 }; raw[fwdKey] = true; return raw; }
    // Far: close the distance (dash when feeling aggressive; rushdown styles dash more).
    if (roll < a * 0.5 + (st.dashIn || 0) * 0.4) {
      var dp = {}; dp[0] = 'F'; dp[2] = 'F';
      if (moves.dashP && dist < 150 && rnd() < 0.3) dp[8] = 'P'; // straight into the dash attack
      this.startScript(dp, match, self); return raw;
    }
    this.walk = { dir: 'fwd', until: match.frame + 16 + Math.floor(rnd() * 20) };
    return raw;
  };

  // A move from the fighter's style list: combo routes that start with it, and
  // DALSASS-style feints (start it, tap back to cancel, then mix up).
  AI.prototype.styleAttack = function (tok, match, self) {
    var st = self.def.ai || {}, rnd = this.rng;
    // 'F+H>H': a move and its follow-up (DALSASS's feint into the drop), 8 frames apart.
    if (tok.indexOf('>') > 0) {
      var parts = tok.split('>'), sc = {};
      parts.forEach(function (p, i) { sc[i * 8] = p; });
      this.startScript(sc, match, self);
      this.script.keep = true;
      return toRaw(parts[0], self.facing);
    }
    if (st.feint && self.def.feintCancel && /[PKH]/.test(tok) && tok !== 'P+K' && rnd() < st.feint) {
      var follow = ['P+K', 'D+K', 'P', 'F+H'][Math.floor(rnd() * 4)];
      this.startScript({ 0: tok, 5: 'B', 13: follow }, match, self);
      this.script.keep = true; // the feinted move never connects: don't give up on the plan
      return toRaw(tok, self.facing);
    }
    // With a bar to spare, power the special up (P+K in its startup).
    var exId = TOKEN_MOVE[tok], exm = exId && self.def.moves[exId];
    if (exm && exm.ex && self.meter >= C.METER_BAR && this.mrng() < this.L.meter * 0.5) {
      this.startScript({ 0: tok, 3: 'P+K' }, match, self);
      return toRaw(tok, self.facing);
    }
    this.startRoute(tok, match, self);
    return toRaw(tok, self.facing);
  };

  // The opponent's projectile heading this way and about to arrive (seen once it's been
  // out for the reaction delay).
  AI.prototype.incoming = function (self, match) {
    var best = null, bt = 1e9, L = this.L;
    (match.projectiles || []).forEach(function (p) {
      if (p.dead || p.owner === self.index || p.spent || p.age < Math.min(10, L.react)) return;
      var dx = self.x - p.x, sp = p.move.projectile;
      if (sp.spawn) { if (Math.abs(dx) < 50 && p.age <= (sp.arm || 0) + 2) { best = p; bt = 0; } return; }
      if (Math.sign(dx) !== p.dir && Math.abs(dx) > 20) return;
      var t = (Math.abs(dx) - 16 * self.def.scale) / Math.max(0.6, Math.abs(p.vx));
      if (t < 16 && t < bt) { bt = t; best = p; }
    });
    return best;
  };

  // The ultimate's input as a script (it comes out 3 frames later).
  AI.prototype.ultimate = function (match, self) {
    this.startScript(QCF, match, self);
    this.script.keep = true;
    return toRaw(QCF[0], self.facing);
  };
  AI.prototype.hasUltimate = function (self) {
    return !!self.def.moves.ultimate && self.meter >= C.METER_MAX && this.mrng() < this.L.ult;
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
