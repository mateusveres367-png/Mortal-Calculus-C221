// Boot Phaser. Loaded last by index.html.
(function () {
  var C = FG.C;
  FG.Sfx.muted = !FG.settings.sound;
  FG.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: C.VIEW_W,
    height: C.VIEW_H,
    backgroundColor: '#000000',
    pixelArt: true,
    banner: false,
    audio: { noAudio: true }, // sounds are synthesized directly with Web Audio
    // On touch screens the game sits at the top, leaving room for the controls in portrait.
    scale: { mode: Phaser.Scale.FIT, autoCenter: FG.Touch && FG.Touch.on ? Phaser.Scale.CENTER_HORIZONTALLY : Phaser.Scale.CENTER_BOTH },
    scene: [FG.TitleScene, FG.SelectScene, FG.StageSelectScene, FG.LadderScene, FG.FightScene, FG.EndingScene, FG.RecordsScene]
  });
})();
