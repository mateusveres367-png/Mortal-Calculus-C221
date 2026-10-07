// Per-player input state. Raw input is a plain object of held booleans:
//   { left, right, up, down, p, k, h, ssIn, ssOut }
// The buffer stamps button presses with the simulation frame so a press made
// slightly early (or during hitstop) still comes out on the first legal frame.
(function () {
  var C = FG.C;
  var BUTTONS = ['p', 'k', 'h', 'ssIn', 'ssOut', 'up'];

  function emptyRaw() {
    return { left: false, right: false, up: false, down: false, p: false, k: false, h: false, ssIn: false, ssOut: false };
  }

  function InputBuffer() {
    this.held = emptyRaw();
    this.prev = emptyRaw();
    this.pressed = {};
    for (var i = 0; i < BUTTONS.length; i++) this.pressed[BUTTONS[i]] = -9999;
    // Last two press frames for each horizontal direction, for dash detection.
    this.leftTaps = [-9999, -9999];
    this.rightTaps = [-9999, -9999];
  }

  // Called once per simulation tick (including hitstop ticks) with the raw state.
  InputBuffer.prototype.update = function (raw, frame) {
    this.prev = this.held;
    this.held = raw;
    for (var i = 0; i < BUTTONS.length; i++) {
      var b = BUTTONS[i];
      if (raw[b] && !this.prev[b]) this.pressed[b] = frame;
    }
    if (raw.left && !this.prev.left) { this.leftTaps[0] = this.leftTaps[1]; this.leftTaps[1] = frame; }
    if (raw.right && !this.prev.right) { this.rightTaps[0] = this.rightTaps[1]; this.rightTaps[1] = frame; }
  };

  InputBuffer.prototype.wasPressed = function (btn, frame, window) {
    return frame - this.pressed[btn] <= (window == null ? C.BUFFER_FRAMES : window);
  };

  InputBuffer.prototype.consume = function (btn) {
    this.pressed[btn] = -9999;
  };

  // The most recently pressed of the given buttons that is still in the buffer.
  InputBuffer.prototype.latest = function (btns, frame) {
    var best = null, bestFrame = -9999;
    for (var i = 0; i < btns.length; i++) {
      var f = this.pressed[btns[i]];
      if (frame - f <= C.BUFFER_FRAMES && f > bestFrame) { best = btns[i]; bestFrame = f; }
    }
    return best;
  };

  // Directions relative to facing (1 = facing right).
  InputBuffer.prototype.forward = function (facing) { return facing > 0 ? this.held.right && !this.held.left : this.held.left && !this.held.right; };
  InputBuffer.prototype.back = function (facing) { return facing > 0 ? this.held.left && !this.held.right : this.held.right && !this.held.left; };

  // Double tap of a direction: the second tap must be very recent.
  InputBuffer.prototype.doubleTap = function (dir, facing, frame) {
    var taps = (dir === 'forward') === (facing > 0) ? this.rightTaps : this.leftTaps;
    return frame - taps[1] <= 2 && taps[1] - taps[0] <= C.DASH_TAP_WINDOW;
  };

  InputBuffer.prototype.clearTaps = function () {
    this.leftTaps = [-9999, -9999];
    this.rightTaps = [-9999, -9999];
  };

  FG.InputBuffer = InputBuffer;
  FG.emptyRaw = emptyRaw;
})();
