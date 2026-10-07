// Training dummy for player 2. Behaviour comes from four settings:
//   stance:   what it does when attacked (stand, crouch, block all, random, fixed guards)
//   action:   what it does on its own (nothing, jab, launcher, throw)
//   recovery: what it does after a knockdown (nothing, tech, random wake-up)
//   breaks:   whether it breaks throws
// input() returns a raw input object, like a keyboard would.
(function () {
  var OPTIONS = {
    stance: [
      { id: 'stand', label: 'STAND' },
      { id: 'crouch', label: 'CROUCH' },
      { id: 'block', label: 'BLOCK ALL' },
      { id: 'random', label: 'RANDOM' },
      { id: 'sguard', label: 'STAND GUARD' },
      { id: 'cguard', label: 'CROUCH GUARD' }
    ],
    action: [
      { id: 'none', label: 'NONE' },
      { id: 'jab', label: 'JAB' },
      { id: 'launcher', label: 'LAUNCHER' },
      { id: 'throw', label: 'THROW' }
    ],
    recovery: [
      { id: 'none', label: 'STAY DOWN' },
      { id: 'tech', label: 'TECH' },
      { id: 'wake', label: 'RANDOM WAKE-UP' }
    ],
    breaks: [
      { id: 'off', label: 'OFF' },
      { id: 'on', label: 'ON' }
    ]
  };
  var WAKE_CHOICES = [{}, { up: true }, { back: true }, { fwd: true }, { ssIn: true }, { k: true }, { p: true }];
  var ACTION_EVERY = 70;

  function Dummy() {
    this.settings = { stance: 0, action: 0, recovery: 0, breaks: 0 };
    this.timer = 0;
    this.guardChoice = null; // random stance: 'hit' | 'stand' | 'crouch' for the current attack
    this.seenMove = null;
    this.wake = null;
  }

  Dummy.OPTIONS = OPTIONS;

  Dummy.prototype.get = function (key) { return OPTIONS[key][this.settings[key]].id; };
  Dummy.prototype.label = function (key) { return OPTIONS[key][this.settings[key]].label; };
  Dummy.prototype.change = function (key, delta) {
    var n = OPTIONS[key].length;
    this.settings[key] = (this.settings[key] + (delta || 1) + n) % n;
    this.timer = 0;
  };

  // True while the opponent has an attack coming (startup or active frames).
  function threat(opp) {
    return opp.state === 'attack' && !opp.move.throw && opp.moveFrame <= opp.move.startup + opp.move.active - 1;
  }

  Dummy.prototype.input = function (self, opp, match) {
    var raw = FG.emptyRaw();
    var backKey = self.facing > 0 ? 'left' : 'right';
    var fwdKey = self.facing > 0 ? 'right' : 'left';
    var C = FG.C;
    this.timer++;
    // The dummy guards in place instead of walking backwards while holding back.
    self.holdGuard = true;

    // --- Stance / guard ---------------------------------------------------------
    var stance = this.get('stance');
    var guarding = threat(opp) || self.state === 'blockstun';
    switch (stance) {
      case 'crouch':
        raw.down = true;
        break;
      case 'block':
        // Reads the incoming attack and blocks it correctly (lows crouching).
        if (guarding) {
          raw[backKey] = true;
          raw.down = opp.state === 'attack' ? opp.move.level === 'low' : self.guardCrouch;
        }
        break;
      case 'random':
        // A fresh coin flip for every attack: get hit, stand guard, or crouch guard.
        if (opp.state === 'attack' && opp.move !== this.seenMove) {
          this.seenMove = opp.move;
          this.guardChoice = ['hit', 'stand', 'crouch'][Math.floor(Math.random() * 3)];
        }
        if (opp.state !== 'attack') this.seenMove = null;
        if (guarding && this.guardChoice !== 'hit') {
          raw[backKey] = true;
          raw.down = this.guardChoice === 'crouch';
        }
        break;
      case 'sguard':
        raw[backKey] = true;
        break;
      case 'cguard':
        raw[backKey] = true; raw.down = true;
        break;
    }

    // --- Own action -------------------------------------------------------------
    var action = this.get('action');
    if (action !== 'none' && this.timer % ACTION_EVERY === 0 && self.actionable !== false) {
      var close = Math.abs(opp.x - self.x) < (action === 'throw' ? 50 : 80);
      if (action === 'jab') raw.p = true;
      else if (action === 'launcher' && close) { raw.down = true; raw.h = true; }
      else if (action === 'throw' && close) {
        raw.p = true; raw.k = true; raw.down = false;
        raw[backKey] = Math.random() < 0.5;
      }
    }

    // --- Throw breaks -----------------------------------------------------------
    var t = match && match.throwState;
    if (this.get('breaks') === 'on' && t && t.move.breakBtn && t.d === self.index && match.frame - t.start === 6) {
      raw.p = false; raw.k = false;
      raw[t.move.breakBtn] = true;
    }

    // --- Knockdown recovery -----------------------------------------------------
    var recovery = this.get('recovery');
    if (recovery === 'tech' && self.state === 'juggle' && self.vy < 0 && self.y < 14) raw.p = true;
    if (self.state === 'down') {
      raw.down = false; raw[backKey] = false;
      if (recovery === 'wake') {
        if (self.stateFrame === 1) this.wake = WAKE_CHOICES[Math.floor(Math.random() * WAKE_CHOICES.length)];
        var w = this.wake || {};
        if (self.stateFrame >= C.QUICK_RISE_FROM - 1) {
          raw.up = !!w.up; raw.k = !!w.k; raw.p = !!w.p; raw.ssIn = !!w.ssIn;
          if (w.back) raw[backKey] = true;
          if (w.fwd) raw[fwdKey] = true;
        }
      }
    }
    return raw;
  };

  FG.Dummy = Dummy;
})();
