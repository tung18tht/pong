var gameState = {};
gameState.width = 600;
gameState.height = 800;

var config = {
  width: gameState.width,
  height: gameState.height,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true
    }
  },
  scene: [MenuScene, GameScene]
};

var game = new Phaser.Game(config);
