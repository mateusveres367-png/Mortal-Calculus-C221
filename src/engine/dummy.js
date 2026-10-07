// Training dummy behaviours for player 2. Each returns a raw input object.
(function () {
  var MODES = [
    { id: 'human', label: 'PLAYER 2 (HUMAN)' },
    { id: 'stand', label: 'DUMMY: STAND' },
    { id: 'crouch', label: 'DUMMY: CROUCH' },
    { id: 'guard', label: 'DUMMY: STAND GUARD' },
    { id: 'cguard', label: 'DUMMY: CROUCH GUARD' },
    { id: 'rguard', label: 'DUMMY: RANDOM GUARD' },
    { id: 'jab', label: 'DUMMY: JAB EVERY SECOND' },
    { id: 'launcher', label: 'DUMMY: LAUNCHER (PUNISH IT)' },
    { id: 'tech', label: 'DUMMY: GUARD, TECH, BREAK THROWS' },
    { id: 'wake', label: 'DUMMY: RANDOM WAKE-UP' },
    { id: 'throw', label: 'DUMMY: THROWS (BREAK THEM)' }
  ];
  var WAKE_CHOICES = [{}, { up: true }, { back: true }, { fwd: true }, { ssIn: true }, { k: true }, { p: true }];

  function Dummy() {
    this.modeIndex = 1;
    this.crouchGuard = false;
    this.timer = 0;
    this.wasStunned = false;
  }

  Dummy.prototype.mode = function () { return MODES[this.modeIndex]; };
  Dummy.prototype.cycle = function () { this.modeIndex = (this.modeIndex + 1) % MODES.length; this.timer = 0; };

  Dummy.prototype.input = function (self, opp, match) {
    var raw = FG.emptyRaw();
    var backKey = self.facing > 0 ? 'left' : 'right';
    var fwdKey = self.facing > 0 ? 'right' : 'left';
    var id = this.mode().id;
    this.timer++;

    switch (id) {
      case 'crouch':
        raw.down = true;
        break;
      case 'guard':
        raw[backKey] = true;
        break;
      case 'cguard':
        raw[backKey] = true; raw.down = true;
        break;
      case 'rguard': {
        // Pick a new stance each time the dummy recovers from being hit or blocking.
        var stunned = self.state === 'hitstun' || self.state === 'blockstun';
        if ((this.wasStunned && !stunned) || this.timer % 50 === 0) this.crouchGuard = Math.random() < 0.5;
        this.wasStunned = stunned;
        raw[backKey] = true; raw.down = this.crouchGuard;
        break;
      }
      case 'jab':
        if (this.timer % 60 === 0) raw.p = true;
        break;
      case 'launcher':
        if (this.timer % 90 === 0 && Math.abs(opp.x - self.x) < 80) { raw.down = true; raw.h = true; }
        break;
      case 'tech': {
        raw[backKey] = true;
        // Break throws with the right button after a human-ish reaction time.
        var t = match && match.throwState;
        if (t && t.d === self.index && match.frame - t.start === 8) { raw[backKey] = false; raw[t.move.breakBtn] = true; }
        // Tech right before landing.
        if (self.state === 'juggle' && self.vy < 0 && self.y < 14) raw.p = true;
        break;
      }
      case 'wake':
        if (self.state === 'down') {
          if (self.stateFrame === 1) this.wake = WAKE_CHOICES[Math.floor(Math.random() * WAKE_CHOICES.length)];
          var w = this.wake || {};
          if (self.stateFrame >= FG.C.QUICK_RISE_FROM - 1) {
            raw.up = !!w.up; raw.k = !!w.k; raw.p = !!w.p; raw.ssIn = !!w.ssIn;
            if (w.back) raw[backKey] = true;
            if (w.fwd) raw[fwdKey] = true;
          }
        }
        break;
      case 'throw':
        if (this.timer % 80 === 0 && Math.abs(opp.x - self.x) < 50) {
          raw.p = true; raw.k = true;
          if (Math.random() < 0.5) raw[backKey] = true;
        }
        break;
    }
    return raw;
  };

  FG.Dummy = Dummy;
  FG.DUMMY_MODES = MODES;
})();
