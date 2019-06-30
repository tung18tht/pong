// TODO:
// - timer
// - ball bounce back affected by collide position
//
// - round start animation
//
// - smoother move to pointer

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    gameState.p1Score = 0
    gameState.p2Score = 0
  }

  preload() {
    var paddleGraphic = this.add.graphics(0, 0);
    paddleGraphic.fillStyle(0xFFFFFF);
    paddleGraphic.fillRect(0, 0, 120, 15);
    paddleGraphic.generateTexture('paddle', 120, 15)
    paddleGraphic.destroy();

    var ballGraphic = this.add.graphics(0, 0);
    ballGraphic.fillStyle(0xFFFFFF);
    ballGraphic.fillCircle(15, 15, 15);
    ballGraphic.generateTexture('ball', 30, 30)
    ballGraphic.destroy();
  }

  create() {
    this.add.rectangle(0, 399, 600, 2, 0x888888).setOrigin(0, 0);

    gameState.p1ScoreText = this.add.text(300, 450, gameState.p1Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5);
    gameState.p2ScoreText = this.add.text(300, 350, gameState.p2Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5).setFlip(true, true);

    gameState.paddle1 = this.physics.add.sprite(300, 750, 'paddle');
    gameState.paddle2 = this.physics.add.sprite(300, 50, 'paddle');

    gameState.paddle1.setCollideWorldBounds(true);
    gameState.paddle2.setCollideWorldBounds(true);

    gameState.paddle1.setImmovable(true);
    gameState.paddle2.setImmovable(true);

    gameState.ball = this.physics.add.sprite(300, 400, 'ball').setOrigin(0.5, 0.5);
    gameState.ball.setCollideWorldBounds(true);
    gameState.ball.setBounce(1.02, 1.02);
    gameState.ball.setMaxVelocity(800, 800);

    this.physics.add.collider(gameState.ball, gameState.paddle1);
    this.physics.add.collider(gameState.ball, gameState.paddle2);

    this.startNewRound(Math.random() < 0.5);
  }

  update() {
    this.controlPaddle(gameState.paddle1, this.input.x);
    this.controlPaddle(gameState.paddle2, gameState.ball.x);

    if (gameState.ball.body.blocked.up) {
      gameState.p1Score += 1;
      gameState.p1ScoreText.setText(gameState.p1Score);
      // this.startNewRound(false);
    } else if (gameState.ball.body.blocked.down) {
      gameState.p2Score += 1;
      gameState.p2ScoreText.setText(gameState.p2Score);
      // this.startNewRound(true);
    }
  }

  startNewRound(ballSideP1) {
    gameState.paddle1.setX(300);
    gameState.paddle2.setX(300);

    gameState.ball.setX(300);
    gameState.ball.setY(400);

    var ballInitialAngle = (Math.random() * 120 + 30) * Math.PI / 180;
    var xVelocity = 400 * Math.cos(ballInitialAngle);
    var yVelocity = Math.sqrt((400 ** 2) + (xVelocity ** 2));
    gameState.ball.setVelocity(xVelocity, ballSideP1 ? yVelocity : -yVelocity);
  }

  controlPaddle(paddle, targetX) {
    if (Math.abs(paddle.x - targetX) > 10) {
      this.physics.moveTo(paddle, targetX, paddle.y, 500);
    } else {
      paddle.setVelocityX(0);
      paddle.x = targetX;
    }
  }
}
