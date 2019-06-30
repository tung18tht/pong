var gameState = {};

var config = {
  width: 600,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true
    }
  },
  scene: [GameScene]
};

var game = new Phaser.Game(config);
