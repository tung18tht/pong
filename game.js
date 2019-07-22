var gameConfig = {};

gameConfig.width = 600;
gameConfig.height = 800;
gameConfig.centerX = gameConfig.width / 2;
gameConfig.centerY = gameConfig.height / 2;

gameConfig.pointsToWin = 3;
gameConfig.powerUpsInterval = 4000;
gameConfig.powerUpsDuration = 5000;

gameConfig.paddleWidth = 120;
gameConfig.paddleHeight = 15;
gameConfig.paddleHalfWidth = gameConfig.paddleWidth / 2;
gameConfig.paddleHalfTrailWidth = gameConfig.paddleHalfWidth * 0.8;
gameConfig.paddleMinX = gameConfig.paddleHalfWidth;
gameConfig.paddleMaxX = gameConfig.width - gameConfig.paddleHalfWidth;
gameConfig.paddleYOffset = gameConfig.paddleHeight * 3;
gameConfig.paddleStepPerMs = 1000 / 1000;
gameConfig.paddleMaxBounceAngleAdjust = 20;
gameConfig.paddleMinScaleX = 0.3;
gameConfig.paddleExpand = 0.5;
gameConfig.paddleShrink = -0.3;

gameConfig.ballRadius = 15;
gameConfig.ballDiameter = gameConfig.ballRadius * 2;
gameConfig.ballBounce = 1.02;
gameConfig.ballInitialVelocity = 400;
gameConfig.ballMaxVelocity = 1000;
gameConfig.ballMinVelocity = 300;
gameConfig.ballAngleLimit = 20;
gameConfig.ballPosMaxAngle = 180 - gameConfig.ballAngleLimit;
gameConfig.ballPosMinAngle = gameConfig.ballAngleLimit;
gameConfig.ballNegMaxAngle = - gameConfig.ballPosMinAngle;
gameConfig.ballNegMinAngle = - gameConfig.ballPosMaxAngle;

var phaserConfig = {
  width: gameConfig.width,
  height: gameConfig.height,
  physics: {
    default: 'arcade',
    arcade: {
      // debug: true
    }
  },
  scene: [MenuScene, GameScene]
};

var game = new Phaser.Game(phaserConfig);
