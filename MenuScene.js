class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('play', 'assets/play.png');
  }

  create() {
    var title = this.add.text(gameState.width / 2, 150, "PONG", { fontSize: 120, color: '#FFFFFF' }).setOrigin(0.5, 0.5).setAlpha(0);

    var playButton = this.add.rectangle(gameState.width / 2, gameState.height / 2, 150, 150).setOrigin(0.5, 0.5).setStrokeStyle(10, 0xFFFFFF).setInteractive().setAlpha(0);
    var playIcon = this.add.image(gameState.width / 2, gameState.height / 2, 'play').setOrigin(0.5, 0.5).setDisplaySize(100, 100).setAlpha(0);

    this.tweens.add({
      targets: [title, playButton, playIcon],
      alpha: 1,
      duration: 500
    });

    var blackCover = this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000, 0).setOrigin(0, 0);

    playButton.on('pointerover', () => {playButton.setScale(1.1)});
    playButton.on('pointerout', () => {playButton.setScale(1)});
    playButton.once('pointerup', () => {
      this.tweens.add({
        targets: blackCover,
        fillAlpha: 1,
        duration: 500,
        onComplete: () => {
          this.scene.start("GameScene");
        }
      });
    });
  }

  update() {

  }
}
