// The stages, in stage-select order. Each fighter's `homeStage` names one of these
// ids; a fight is on player 2's home stage unless one is picked. Drawing lives in
// src/render/stage.js.
//   outdoor: PEDERSEN drives his car in for his intro (he walks in indoors)
(function () {
  FG.STAGES = [
    { id: 'classroom', short: 'C221', name: 'CLASSROOM C221', place: 'EL CAMINO REAL MATH, ROOM C221',
      desc: 'WHITEBOARDS FULL OF PROOFS, ROWS OF DESKS, STUDENTS IN THE BACK ROW.' },
    { id: 'hallway', short: 'HALLWAY', name: 'MATH HALLWAY', place: 'C BUILDING, SECOND FLOOR',
      desc: 'LOCKERS, CLASSROOM DOORS, BULLETIN BOARDS AND A HUMMING VENDING MACHINE.' },
    { id: 'lab', short: 'LAB', name: 'COMPUTER LAB', place: 'C BUILDING, ROOM C110',
      desc: 'OLD CRT MONITORS PLOTTING GRAPHS, CABLES EVERYWHERE.' },
    { id: 'campus', short: 'CAMPUS', name: 'OUTDOOR CAMPUS', place: 'THE QUAD',
      desc: 'SCHOOL BUILDINGS AT DUSK, TREES, BENCHES, STUDENTS ON THEIR WAY OUT.', outdoor: true },
    { id: 'office', short: 'OFFICE', name: 'DEPARTMENT OFFICE', place: 'MATH DEPARTMENT OFFICE',
      desc: 'DESKS, FILING CABINETS, BOOKSHELVES AND STACKS OF UNGRADED TESTS.' },
    { id: 'parking', short: 'PARKING', name: 'FACULTY PARKING', place: 'FACULTY LOT B',
      desc: 'PEDERSEN\'S RESERVED SPOT. HIS RED SPORTS CAR IS PARKED IN THE BACK.', outdoor: true }
  ];

  // Interactive objects near the walls (press T next to one: a springboard attack, or
  // with back held, a vault out of the corner). x is where you stand to use it.
  //   atk / esc: what the HUD calls each use.
  FG.STAGE_PROPS = {
    classroom: [{ kind: 'whiteboard', x: 88, name: 'WHITEBOARD', atk: 'WHITEBOARD SPIN', esc: 'OVER THE BOARD' },
      { kind: 'desk', x: 954, name: 'DESK', atk: 'DESK DIVE', esc: 'DESK VAULT' }],
    hallway: [{ kind: 'lockers', x: 80, name: 'LOCKERS', atk: 'LOCKER LEAP', esc: 'LOCKER KICK-OFF' },
      { kind: 'vending', x: 960, name: 'VENDING MACHINE', atk: 'VENDING DROP', esc: 'SNACK BREAK' }],
    lab: [{ kind: 'crt', x: 86, name: 'MONITOR CART', atk: 'SCREEN SAVER', esc: 'LOG OFF' },
      { kind: 'chair', x: 956, name: 'SWIVEL CHAIR', atk: 'ROLLING START', esc: 'SPIN AWAY' }],
    campus: [{ kind: 'bench', x: 90, name: 'BENCH', atk: 'BENCH PRESS', esc: 'BENCH HOP' },
      { kind: 'trashcan', x: 958, name: 'TRASH CAN', atk: 'TAKE OUT THE TRASH', esc: 'CAN HOP' }],
    office: [{ kind: 'cabinet', x: 82, name: 'FILING CABINET', atk: 'FILED AWAY', esc: 'OUT OF OFFICE' },
      { kind: 'officeDesk', x: 954, name: 'DESK', atk: 'PAPERWORK', esc: 'OFFICE HOURS OVER' }],
    parking: [{ kind: 'barrier', x: 84, name: 'GATE ARM', atk: 'GATE CRASH', esc: 'NO PARKING' },
      { kind: 'hood', x: 966, name: "PEDERSEN'S CAR", atk: 'HOOD SLIDE', esc: 'OVER THE HOOD' }]
  };

  // A fresh copy of a stage's objects. opts.flip: mirror them (on the parking lot,
  // PEDERSEN's car is on his side of the lot).
  FG.stageProps = function (id, opts) {
    var C = FG.C;
    return (FG.STAGE_PROPS[id] || []).map(function (p) {
      var q = Object.assign({}, p, { cool: 0, t: 999, use: null, by: null });
      if (opts && opts.flip) q.x = C.WALL_L + C.WALL_R - q.x;
      return q;
    });
  };

  FG.stageById = function (id) {
    for (var i = 0; i < FG.STAGES.length; i++) if (FG.STAGES[i].id === id) return FG.STAGES[i];
    return FG.STAGES[0];
  };
})();
