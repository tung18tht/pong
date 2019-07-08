// TODO:
// - timer
//
// - round start animation
//
// - effect
//
// Powers:
// - ball powers
// - paddle powers

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    gameState.p1Score = 0;
    gameState.p2Score = 0;

    this.constants = {};
    this.constants.paddleWidth = 120;
    this.constants.paddleHeight = 15;
    this.constants.paddleHalfWidth = this.constants.paddleWidth / 2;
    this.constants.paddleMinX = this.constants.paddleHalfWidth;
    this.constants.paddleMaxX = gameState.width - this.constants.paddleHalfWidth;
    this.constants.paddleStepPerMs = 500 / 1000;
    this.constants.paddleMaxBounceAngleAdjust = 20;
    this.constants.ballRadius = 15;
    this.constants.ballBounce = 1.015;
    this.constants.ballInitialVelocity = 400;
    this.constants.ballMaxVelocity = 1000;
    this.constants.ballAngleLimit = 20;
    this.constants.ballPosMaxAngle = 180 - this.constants.ballAngleLimit;
    this.constants.ballPosMinAngle = this.constants.ballAngleLimit;
    this.constants.ballNegMaxAngle = - this.constants.ballPosMinAngle;
    this.constants.ballNegMinAngle = - this.constants.ballPosMaxAngle;
  }

  preload() {
    var paddleGraphic = this.add.graphics(0, 0);
    paddleGraphic.fillStyle(0xFFFFFF);
    paddleGraphic.fillRect(0, 0, this.constants.paddleWidth, this.constants.paddleHeight);
    paddleGraphic.generateTexture('paddle', this.constants.paddleWidth, this.constants.paddleHeight)
    paddleGraphic.destroy();

    var ballGraphic = this.add.graphics(0, 0);
    ballGraphic.fillStyle(0xFFFFFF);
    ballGraphic.fillCircle(this.constants.ballRadius, this.constants.ballRadius, this.constants.ballRadius);
    ballGraphic.generateTexture('ball', this.constants.ballRadius * 2, this.constants.ballRadius * 2)
    ballGraphic.destroy();
  }

  create() {
    this.add.rectangle(0, gameState.height / 2 - 1, gameState.width, 2, 0x888888).setOrigin(0, 0);

    gameState.p1ScoreText = this.add.text(gameState.width / 2, gameState.height / 2 + 50, gameState.p1Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5);
    gameState.p2ScoreText = this.add.text(gameState.width / 2, gameState.height / 2 - 50, gameState.p2Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5).setFlip(true, true);

    gameState.paddle1 = this.physics.add.sprite(gameState.width / 2, gameState.height - this.constants.paddleHeight * 3, 'paddle').setOrigin(0.5, 0.5);
    gameState.paddle2 = this.physics.add.sprite(gameState.width / 2, this.constants.paddleHeight * 3, 'paddle').setOrigin(0.5, 0.5);

    gameState.paddle1.setCollideWorldBounds(true);
    gameState.paddle2.setCollideWorldBounds(true);

    gameState.paddle1.setImmovable(true);
    gameState.paddle2.setImmovable(true);

    gameState.ball = this.physics.add.sprite(gameState.width / 2, gameState.height / 2, 'ball').setOrigin(0.5, 0.5);
    gameState.ball.setCollideWorldBounds(true);
    gameState.ball.setBounce(this.constants.ballBounce, this.constants.ballBounce);

    this.physics.add.collider(gameState.ball, gameState.paddle1, (ball, paddle) => {this.ballPaddleCollide(ball, paddle)});
    this.physics.add.collider(gameState.ball, gameState.paddle2, (ball, paddle) => {this.ballPaddleCollide(ball, paddle)});

    this.startNewRound(Math.random() < 0.5);
  }

  update(time, delta) {
    this.controlPaddle(gameState.paddle1, this.input.x, delta);
    this.controlPaddle(gameState.paddle2, gameState.ball.x, delta);

    if (gameState.ball.body.onCeiling()) {
      gameState.p1Score += 1;
      gameState.p1ScoreText.setText(gameState.p1Score);
      // this.startNewRound(false);
    } else if (gameState.ball.body.onFloor()) {
      gameState.p2Score += 1;
      gameState.p2ScoreText.setText(gameState.p2Score);
      // this.startNewRound(true);
    }
  }

  startNewRound(toSideP1) {
    gameState.paddle1.setX(gameState.width / 2);
    gameState.paddle2.setX(gameState.width / 2);

    gameState.ball.setX(gameState.width / 2);
    gameState.ball.setY(gameState.height / 2);

    var ballInitialAngle = Math.random() * 30 + 30 + (Math.random() < 0.5 ? 0 : 90);
    var [velocityX, velocityY] = this.getVelocityXY(ballInitialAngle, this.constants.ballInitialVelocity, toSideP1);
    gameState.ball.setVelocity(velocityX, velocityY);
  }

  controlPaddle(paddle, targetX, delta) {
    var diff = paddle.x - targetX;
    var step = this.constants.paddleStepPerMs * delta;
    if (diff < -step) {
      paddle.x += step;
    } else if (diff > step) {
      paddle.x -= step;
    } else {
      paddle.x = targetX;
    }

    if (paddle.x > this.constants.paddleMaxX) {
      paddle.x = this.constants.paddleMaxX;
    } else if (paddle.x < this.constants.paddleMinX) {
      paddle.x = this.constants.paddleMinX;
    }
  }

  ballPaddleCollide(ball, paddle) {
    if (ball.body.touching.left || ball.body.touching.right) {
      return;
    }

    var [angle, velocity] = this.getAngleVelocity(ball.body.velocity.x, ball.body.velocity.y);

    var diffRatio = (ball.x - paddle.x) / this.constants.paddleHalfWidth;
    var angleAdjust = diffRatio * this.constants.paddleMaxBounceAngleAdjust;

    //  1. /^ R: - L: +
    //  2. ^\ R: - L: +
    //  3. \v R: + L: -
    //  4. v/ R: + L: -

    var newAngle = -angle;
    if (newAngle > 0) {
      newAngle -= angleAdjust;

      if (newAngle > this.constants.ballPosMaxAngle) {
        newAngle = this.constants.ballPosMaxAngle;
      } else if (newAngle < this.constants.ballPosMinAngle) {
        newAngle = this.constants.ballPosMinAngle;
      }
    } else {
      newAngle += angleAdjust;

      if (newAngle > this.constants.ballNegMaxAngle) {
        newAngle = this.constants.ballNegMaxAngle;
      } else if (newAngle < this.constants.ballNegMinAngle) {
        newAngle = this.constants.ballNegMinAngle;
      }
    }

    var newVelocity = velocity * this.constants.ballBounce;
    if (newVelocity > this.constants.ballMaxVelocity) {
      newVelocity = this.constants.ballMaxVelocity;
    }

    var [velocityX, velocityY] = this.getVelocityXY(Math.abs(newAngle), newVelocity, newAngle < 0);
    ball.setVelocity(velocityX, velocityY);
  }

  getAngleVelocity(velocityX, velocityY) {
    var velocity = Math.sqrt((velocityX ** 2) + (velocityY ** 2));
    var angle = Math.atan2(velocityY, velocityX) * 180 / Math.PI;

    return [angle, velocity];
  }

  getVelocityXY(angleDegree, velocity, toSideP1) {
    var velocityX = velocity * Math.cos(angleDegree * Math.PI / 180);
    var velocityY = Math.sqrt((velocity ** 2) - (velocityX ** 2));
    if (!toSideP1) {
      velocityY = -velocityY;
    }

    return [velocityX, velocityY];
  }
}
