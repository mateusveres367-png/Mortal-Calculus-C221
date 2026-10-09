// Input display for training mode: a scrolling history of each player's inputs
// with how many frames each was held. Directions are relative to the fighter's
// facing in numpad notation (6 = forward, 4 = back, 2 = down, 8 = up, 5 = neutral).
(function () {
  var MAX_ROWS = 10, ROW_H = 12, TOP = 170;

  // Pure history logic (no Phaser), so it can be tested in Node.
  function InputHistory() { this.rows = []; }

  InputHistory.direction = function (raw, facing) {
    var right = raw.right && !raw.left, left = raw.left && !raw.right;
    var fwd = facing > 0 ? right : left, back = facing > 0 ? left : right;
    var h = fwd ? 1 : back ? -1 : 0;
    var v = raw.up && !raw.down ? 1 : raw.down && !raw.up ? -1 : 0;
    return 5 + h + 3 * v;
  };

  InputHistory.buttons = function (raw) {
    var b = [];
    if (raw.p) b.push('P');
    if (raw.k) b.push('K');
    if (raw.h) b.push('H');
    if (raw.ssIn) b.push('SI');
    if (raw.ssOut) b.push('SO');
    if (raw.u) b.push('ULT');
    return b.join('+');
  };

  // Call once per simulation tick with the raw input that was fed to the match.
  InputHistory.prototype.record = function (raw, facing) {
    var dir = InputHistory.direction(raw, facing), btns = InputHistory.buttons(raw);
    var top = this.rows[0];
    if (top && top.dir === dir && top.btns === btns) {
      if (top.frames < 99) top.frames++;
      return;
    }
    this.rows.unshift({ dir: dir, btns: btns, frames: 1 });
    if (this.rows.length > MAX_ROWS) this.rows.length = MAX_ROWS;
  };

  InputHistory.prototype.clear = function () { this.rows = []; };

  // --- Display ----------------------------------------------------------------

  function InputDisplay(scene, side) {
    this.side = side; // 0 = left (P1), 1 = right (P2)
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(52);
    this.texts = [];
    this.counts = [];
    var x = side === 0 ? 8 : FG.C.VIEW_W - 92;
    this.x = x;
    for (var r = 0; r < MAX_ROWS; r++) {
      this.texts.push(FG.text(scene, x + 14, TOP + r * ROW_H, '', 'w').setDepth(53));
      this.counts.push(FG.text(scene, x + 84, TOP + r * ROW_H, '', 'g').setOrigin(1, 0).setDepth(53));
    }
  }

  // Draw a direction arrow (or a dot for neutral) centred on cx, cy.
  function arrow(g, dir, cx, cy, color) {
    g.fillStyle(color, 1);
    if (dir === 5) { g.fillRect(cx - 1, cy - 1, 3, 3); return; }
    var dx = (dir - 1) % 3 - 1, dy = 1 - Math.floor((dir - 1) / 3); // screen y down
    var len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len, px = -uy, py = ux;
    // Shaft from the tail to the base of the head, then a solid triangular head.
    g.lineStyle(2, color, 1);
    g.lineBetween(cx - ux * 4, cy - uy * 4, cx + ux * 1, cy + uy * 1);
    g.fillTriangle(cx + ux * 5, cy + uy * 5, cx + px * 3.5, cy + py * 3.5, cx - px * 3.5, cy - py * 3.5);
  }

  InputDisplay.prototype.draw = function (history, visible) {
    var g = this.g;
    g.clear();
    for (var r = 0; r < MAX_ROWS; r++) {
      var row = visible ? history.rows[r] : null;
      this.texts[r].setText(row ? row.btns : '');
      this.counts[r].setText(row ? String(row.frames) : '');
      if (!row) continue;
      var y = TOP + r * ROW_H;
      g.fillStyle(0x000000, r === 0 ? 0.65 : 0.45);
      g.fillRect(this.x - 2, y - 2, 90, ROW_H);
      arrow(g, row.dir, this.x + 5, y + 4, r === 0 ? 0xffd23f : 0xd8c79a);
    }
  };

  FG.InputHistory = InputHistory;
  FG.InputDisplay = InputDisplay;
})();
