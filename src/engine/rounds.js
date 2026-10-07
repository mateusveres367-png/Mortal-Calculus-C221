// Round rules for arcade and versus: best of three rounds, a round timer, and a
// round ends on a K.O. or when time runs out (most health left, as a share of
// full health, wins; a tie is a draw and nobody scores). Pure rules, no drawing.
//
//   var r = new FG.Rounds({ seconds: 60, toWin: 2 });
//   r.tick(match)            once per game frame while the round is on
//   r.end(winner, 'ko')      when someone is knocked out
//   r.result                 { winner, how: 'ko' | 'time', perfect } once the round is over
//   r.matchWinner()          0 / 1 once someone has won enough rounds, else null
//   r.next()                 start the next round
(function () {
  var C = FG.C;

  function Rounds(opts) {
    opts = opts || {};
    this.seconds = opts.seconds == null ? 60 : opts.seconds; // 0: no timer
    this.toWin = opts.toWin || 2;
    this.wins = [0, 0];
    this.history = [];
    this.round = 0;
    this.next();
  }

  Rounds.prototype.next = function () {
    this.round++;
    this.frames = this.seconds * C.FPS;
    this.result = null;
  };

  // Whole seconds left on the clock (null with no timer).
  Rounds.prototype.timeLeft = function () {
    return this.seconds ? Math.ceil(this.frames / C.FPS) : null;
  };

  // The deciding round: both players one win from the match.
  Rounds.prototype.isFinal = function () {
    return this.wins[0] === this.toWin - 1 && this.wins[1] === this.toWin - 1;
  };

  Rounds.prototype.tick = function (match) {
    if (this.result || !this.seconds) return;
    if (--this.frames <= 0) { this.frames = 0; this.end(Rounds.byHealth(match), 'time', match); }
  };

  // Who has more health left (as a share of their full health); -1 for a tie.
  Rounds.byHealth = function (match) {
    var f = match.fighters, a = f[0].health / f[0].def.health, b = f[1].health / f[1].def.health;
    return a > b ? 0 : b > a ? 1 : -1;
  };

  Rounds.prototype.end = function (winner, how, match) {
    if (this.result) return this.result;
    var perfect = winner >= 0 && match && match.fighters[winner].health === match.fighters[winner].def.health;
    this.result = { winner: winner, how: how, perfect: !!perfect };
    if (winner >= 0) this.wins[winner]++;
    this.history.push(this.result);
    return this.result;
  };

  Rounds.prototype.matchWinner = function () {
    return this.wins[0] >= this.toWin ? 0 : this.wins[1] >= this.toWin ? 1 : null;
  };

  FG.Rounds = Rounds;
})();
