// Per-player input state. Raw input is a plain object of held booleans:
//   { left, right, up, down, p, k, h, ssIn, ssOut, t, u }  (t = taunt, u = the ultimate key)
// The buffer stamps button presses with the simulation frame so a press made
// slightly early (or during hitstop) still comes out on the first legal frame.
(function () {
  var C = FG.C;
  var BUTTONS = ['p', 'k', 'h', 'ssIn', 'ssOut', 'up', 't', 'u'];
  var DIR_SLOP = 2; // frames after a button press in which a direction still joins it

  function emptyRaw() {
    return { left: false, right: false, up: false, down: false, p: false, k: false, h: false, ssIn: false, ssOut: false, t: false, u: false };
  }

  function InputBuffer() {
    this.held = emptyRaw();
    this.prev = emptyRaw();
    this.pressed = {};
    this.pressDirs = {}; // directions held when each button was pressed
    for (var i = 0; i < BUTTONS.length; i++) { this.pressed[BUTTONS[i]] = -9999; this.pressDirs[BUTTONS[i]] = emptyRaw(); }
    // Last two press frames for each horizontal direction, for dash detection.
    this.leftTaps = [-9999, -9999];
    this.rightTaps = [-9999, -9999];
    this.dirHist = []; // [{ f, down, left, right }] every change of the held directions, for motions
  }

  // Called once per simulation tick (including hitstop ticks) with the raw state.
  InputBuffer.prototype.update = function (raw, frame) {
    this.prev = this.held;
    this.held = raw;
    for (var i = 0; i < BUTTONS.length; i++) {
      var b = BUTTONS[i];
      if (raw[b] && !this.prev[b]) {
        this.pressed[b] = frame;
        this.pressDirs[b] = { left: raw.left, right: raw.right, up: raw.up, down: raw.down };
      } else if (frame - this.pressed[b] <= DIR_SLOP) {
        // A direction that arrives a frame or two after the button still counts.
        var d = this.pressDirs[b];
        d.left = d.left || raw.left; d.right = d.right || raw.right; d.up = d.up || raw.up; d.down = d.down || raw.down;
      }
    }
    if (raw.down !== this.prev.down || raw.left !== this.prev.left || raw.right !== this.prev.right) {
      this.dirHist.push({ f: frame, down: raw.down, left: raw.left, right: raw.right });
      if (this.dirHist.length > 16) this.dirHist.shift();
    }
    if (raw.left && !this.prev.left) { this.leftTaps[0] = this.leftTaps[1]; this.leftTaps[1] = frame; }
    if (raw.right && !this.prev.right) { this.rightTaps[0] = this.rightTaps[1]; this.rightTaps[1] = frame; }
  };

  InputBuffer.prototype.wasPressed = function (btn, frame, window) {
    return frame - this.pressed[btn] <= (window == null ? C.BUFFER_FRAMES : window);
  };

  // Directions for a (possibly buffered) button press: what was held when it was
  // pressed, so an early D+H still launches after down is let go.
  InputBuffer.prototype.dirsFor = function (btn, frame) {
    var d = this.pressDirs[btn], h = this.held;
    if (!d) return h;
    // Pressed this frame: what's held now, plus what was held at the press (a press
    // during hitstop is stamped for this frame, and its direction may be let go already).
    if (this.pressed[btn] === frame) return { left: h.left || d.left, right: h.right || d.right, up: h.up || d.up, down: h.down || d.down };
    return d;
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

  // Directions relative to facing (1 = facing right), from the held state or a press snapshot.
  function fwd(h, facing) { return facing > 0 ? h.right && !h.left : h.left && !h.right; }
  function bck(h, facing) { return facing > 0 ? h.left && !h.right : h.right && !h.left; }
  InputBuffer.prototype.forward = function (facing, dirs) { return fwd(dirs || this.held, facing); };
  InputBuffer.prototype.back = function (facing, dirs) { return bck(dirs || this.held, facing); };

  // Double tap of a direction: the second tap must be very recent.
  InputBuffer.prototype.doubleTap = function (dir, facing, frame) {
    var taps = (dir === 'forward') === (facing > 0) ? this.rightTaps : this.leftTaps;
    return frame - taps[1] <= 2 && taps[1] - taps[0] <= C.DASH_TAP_WINDOW;
  };

  // Quarter circle forward: down, down-forward, forward, in that order within the
  // last QCF_FRAMES frames (relative to facing).
  InputBuffer.prototype.qcf = function (facing, frame) {
    var stage = 0, h = this.dirHist;
    for (var i = 0; i < h.length; i++) {
      var e = h[i];
      if (frame - e.f > C.QCF_FRAMES) continue;
      var fw = fwd(e, facing), bk = bck(e, facing);
      if (stage === 0 && e.down && !fw && !bk) stage = 1;
      else if (stage === 1 && e.down && fw) stage = 2;
      else if (stage === 2 && fw && !e.down) return true;
    }
    return false;
  };

  // P, K and H pressed together (within a few frames of each other).
  InputBuffer.prototype.allThree = function (frame) {
    var p = this.pressed.p, k = this.pressed.k, h = this.pressed.h;
    if (!this.wasPressed('p', frame) || !this.wasPressed('k', frame) || !this.wasPressed('h', frame)) return false;
    return Math.max(p, k, h) - Math.min(p, k, h) <= 3;
  };

  InputBuffer.prototype.clearTaps = function () {
    this.leftTaps = [-9999, -9999];
    this.rightTaps = [-9999, -9999];
  };

  // Parse move notation like 'D+H', 'F+H', 'D/F+K', 'P+K' or 'UP' into a raw input
  // for a fighter facing right (F = right, B = left).
  function parseInput(notation) {
    var r = emptyRaw();
    notation.split('+').forEach(function (t) {
      switch (t) {
        case 'P': r.p = true; break;
        case 'K': r.k = true; break;
        case 'H': r.h = true; break;
        case 'D': r.down = true; break;
        case 'U': case 'UP': r.up = true; break;
        case 'F': r.right = true; break;
        case 'B': r.left = true; break;
        case 'D/F': r.down = true; r.right = true; break;
        case 'D/B': r.down = true; r.left = true; break;
        case 'SI': r.ssIn = true; break;
        case 'SO': r.ssOut = true; break;
        case 'T': r.t = true; break;
        case 'ULT': r.u = true; break; // the ultimate key
      }
    });
    return r;
  }

  // Command input (KO finishers): the presses that are new this tick, as tokens
  // relative to facing: F, B, D, U, P, K, H.
  function inputTokens(prev, raw, facing) {
    var fwd = facing > 0 ? 'right' : 'left', back = facing > 0 ? 'left' : 'right', out = [];
    if (raw[fwd] && !prev[fwd]) out.push('F');
    if (raw[back] && !prev[back]) out.push('B');
    if (raw.down && !prev.down) out.push('D');
    if (raw.up && !prev.up) out.push('U');
    if (raw.p && !prev.p) out.push('P');
    if (raw.k && !prev.k) out.push('K');
    if (raw.h && !prev.h) out.push('H');
    return out;
  }
  // Does the token history end with this command ('B, F, H')?
  function matchesCommand(tokens, notation) {
    var want = notation.split(/,\s*/);
    return tokens.length >= want.length && tokens.slice(-want.length).join() === want.join();
  }

  FG.inputTokens = inputTokens;
  FG.matchesCommand = matchesCommand;
  FG.InputBuffer = InputBuffer;
  FG.emptyRaw = emptyRaw;
  FG.parseInput = parseInput;
})();
