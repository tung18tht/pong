var gameConfig = {};

gameConfig.width = 600;
gameConfig.height = 800;
gameConfig.centerX = gameConfig.width / 2;
gameConfig.centerY = gameConfig.height / 2;

gameConfig.pointsToWin = 3;

gameConfig.paddleWidth = 120;
gameConfig.paddleHeight = 15;
gameConfig.paddleYOffset = gameConfig.paddleHeight * 3;
gameConfig.paddleStepPerMs = 2000 / 1000;
gameConfig.paddleMaxBounceAngleAdjust = 20;
gameConfig.paddleMinScaleX = 0.3;

gameConfig.ballRadius = 15;
gameConfig.ballBounce = 1.02;
gameConfig.ballInitialVelocity = 400;
gameConfig.ballMaxVelocity = 1000;
gameConfig.ballMinVelocity = 300;
gameConfig.ballAngleLimit = 20;

gameConfig.powerUpsInterval = 4000;
gameConfig.powerUpsDuration = 5000;
gameConfig.powerUpsRadius = gameConfig.ballRadius;
gameConfig.powerUpsExpand = 0.5;
gameConfig.powerUpsShrink = -0.3;
gameConfig.powerUpsPowerful = 1.3;
gameConfig.powerUpsSnow = 200 / 1000;

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

Paddles.constants = {
  defaultHalfTrailWidth: gameConfig.paddleWidth / 2 * 0.8
}

Balls.constants = {
  ballPosMaxAngle: 180 - gameConfig.ballAngleLimit,
  ballPosMinAngle: gameConfig.ballAngleLimit,
  ballNegMaxAngle: - gameConfig.ballAngleLimit,
  ballNegMinAngle: gameConfig.ballAngleLimit - 180
}

PowerUps.constants = {
  powerUpsDiameter: gameConfig.powerUpsRadius * 2,
  powerUpsRadiusSquared: gameConfig.powerUpsRadius ** 2
}

PowerUps.types = {
  X2: "x2",
  EXPLODE: "explode",
  EXPAND: "expand",
  SHRINK: "shrink",
  POWERFUL: "powerful",
  WALL: "wall",
  SNOW: "snow"
}
