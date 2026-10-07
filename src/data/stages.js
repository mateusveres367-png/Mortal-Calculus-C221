// The stages, in stage-select order. Each fighter's `homeStage` names one of these
// ids; a fight is on player 2's home stage unless one is picked. Drawing lives in
// src/render/stage.js.
//   outdoor: PEDERSEN drives his car in for his intro (he walks in indoors)
(function () {
  FG.STAGES = [
    { id: 'classroom', name: 'CLASSROOM C221', place: 'EL CAMINO REAL MATH, ROOM C221',
      desc: 'WHITEBOARDS FULL OF PROOFS, ROWS OF DESKS, STUDENTS IN THE BACK ROW.' },
    { id: 'hallway', name: 'MATH HALLWAY', place: 'C BUILDING, SECOND FLOOR',
      desc: 'LOCKERS, CLASSROOM DOORS, BULLETIN BOARDS AND A HUMMING VENDING MACHINE.' },
    { id: 'lab', name: 'COMPUTER LAB', place: 'C BUILDING, ROOM C110',
      desc: 'OLD CRT MONITORS PLOTTING GRAPHS, CABLES EVERYWHERE.' },
    { id: 'campus', name: 'OUTDOOR CAMPUS', place: 'THE QUAD',
      desc: 'SCHOOL BUILDINGS AT DUSK, TREES, BENCHES, STUDENTS ON THEIR WAY OUT.', outdoor: true },
    { id: 'office', name: 'DEPARTMENT OFFICE', place: 'MATH DEPARTMENT OFFICE',
      desc: 'DESKS, FILING CABINETS, BOOKSHELVES AND STACKS OF UNGRADED TESTS.' },
    { id: 'parking', name: 'FACULTY PARKING', place: 'FACULTY LOT B',
      desc: 'PEDERSEN\'S RESERVED SPOT. HIS RED SPORTS CAR IS PARKED IN THE BACK.', outdoor: true }
  ];

  FG.stageById = function (id) {
    for (var i = 0; i < FG.STAGES.length; i++) if (FG.STAGES[i].id === id) return FG.STAGES[i];
    return FG.STAGES[0];
  };
})();
