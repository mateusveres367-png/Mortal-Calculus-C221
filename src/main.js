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
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [FG.TitleScene, FG.SelectScene, FG.StageSelectScene, FG.FightScene, FG.EndingScene]
  });
})();
