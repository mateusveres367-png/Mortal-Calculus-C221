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
    { id: 'launcher', label: 'DUMMY: LAUNCHER (PUNISH IT)' }
  ];

  function Dummy() {
    this.modeIndex = 1;
    this.crouchGuard = false;
    this.timer = 0;
    this.wasStunned = false;
  }

  Dummy.prototype.mode = function () { return MODES[this.modeIndex]; };
  Dummy.prototype.cycle = function () { this.modeIndex = (this.modeIndex + 1) % MODES.length; this.timer = 0; };

  Dummy.prototype.input = function (self, opp) {
    var raw = FG.emptyRaw();
    var backKey = self.facing > 0 ? 'left' : 'right';
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
    }
    return raw;
  };

  FG.Dummy = Dummy;
  FG.DUMMY_MODES = MODES;
})();
