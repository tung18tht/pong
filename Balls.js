class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "ball");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setCollideWorldBounds(true).setBounce(1, 1);
    this.body.onWorldBounds = true;

    this.trail = scene.objects.effects.createEmitter({
      follow: this,
      lifespan: 200,
      scale: {start: 1, end: 0},
      alpha: {start: 0.2, end: 0}
    });
  }

  destroy(fromScene) {
    if (this.scene) {
      this.scene.objects.effects.removeEmitter(this.trail);
    }

    super.destroy(fromScene);
  }

  recomputeAngleVelocity() {
    var newSpeed = this.body.speed;
    if (newSpeed < gameConfig.ballMinVelocity) {
      newSpeed = gameConfig.ballMinVelocity;
    } else if (newSpeed > gameConfig.ballMaxVelocity) {
      newSpeed = gameConfig.ballMaxVelocity;
    }

    var newAngle = this.body.angle * 180 / Math.PI;
    if (newAngle > 0) {
      if (newAngle > Balls.constants.ballPosMaxAngle) {
        newAngle = Balls.constants.ballPosMaxAngle;
      } else if (newAngle < Balls.constants.ballPosMinAngle) {
        newAngle = Balls.constants.ballPosMinAngle;
      }
    } else {
      if (newAngle > Balls.constants.ballNegMaxAngle) {
        newAngle = Balls.constants.ballNegMaxAngle;
      } else if (newAngle < Balls.constants.ballNegMinAngle) {
        newAngle = Balls.constants.ballNegMinAngle;
      }
    }

    var [newVelocityX, newVelocityY] = this.scene.getVelocityXY(Math.abs(newAngle), newSpeed, newAngle > 0);
    this.setVelocity(newVelocityX, newVelocityY);
  }
}

class Balls {
  constructor(scene) {
    this.scene = scene;

    this.mainBall = new Ball(scene, gameConfig.centerX, gameConfig.centerY);
    this.phaserGroup = scene.physics.add.group([this.mainBall]);
    this.children = this.phaserGroup.getChildren();
  }

  stopTrails() {
    this.children.forEach(ball => {
      ball.trail.stop();
    });
  }

  deleteExtraBalls() {
    for (var i = this.children.length - 1; i > 0; i--) {
      this.phaserGroup.remove(this.children[i], true, true);
    }

    this.mainBall = this.children[0];
  }

  remove(ball) {
    this.phaserGroup.remove(ball, true, true);
  }

  clear() {
    this.phaserGroup.clear(true, true);
  }

  setupForNewRound() {
    this.mainBall.setAlpha(0);
    this.mainBall.setPosition(gameConfig.centerX, gameConfig.centerY);
    this.mainBall.trail.stop();
  }

  getMostDeadlyBalls() {
    var posYVelocityBall, maxY = Number.MIN_SAFE_INTEGER, negYVelocityBall, minY = Number.MAX_SAFE_INTEGER;

    this.children.forEach(ball => {
      if (ball.body.velocity.y > 0) {
        if (ball.y > maxY) {
          maxY = ball.y;
          posYVelocityBall = ball;
        }
      } else {
        if (ball.y < minY) {
          minY = ball.y;
          negYVelocityBall = ball;
        }
      }
    });

    if (posYVelocityBall) {
      if (negYVelocityBall) {
        return [posYVelocityBall, negYVelocityBall];
      } else {
        return [posYVelocityBall, posYVelocityBall];
      }
    } else {
      return [negYVelocityBall, negYVelocityBall];
    }
  }

  double(ball) {
    var newBall = new Ball(this.scene, ball.x, ball.y);
    newBall.fromPaddle = ball.fromPaddle;
    this.phaserGroup.add(newBall);

    var originalAngle = ball.body.angle * 180 / Math.PI;
    var newVelocity = ball.body.speed * 0.8;
    if (newVelocity < gameConfig.ballMinVelocity) {
      newVelocity = gameConfig.ballMinVelocity;
    }

    var [oldBallVelocityX, oldBallVelocityY] = this.scene.getVelocityXY(Math.abs(originalAngle), newVelocity, originalAngle > 0);
    ball.setVelocity(oldBallVelocityX, oldBallVelocityY);

    //  1. ^\ -
    //  2. /^ +
    //  3. \v -
    //  4. v/ +

    var newBallAngle = originalAngle;
    var angleAdjust = Math.random() * 60 + 30;
    if (newBallAngle > 90) {
      newBallAngle -= angleAdjust;
      if (newBallAngle < Balls.constants.ballPosMinAngle) {
        newBallAngle = Balls.constants.ballPosMinAngle;
      }
    } else if (newBallAngle > 0) {
      newBallAngle += angleAdjust;
      if (newBallAngle > Balls.constants.ballPosMaxAngle) {
        newBallAngle = Balls.constants.ballPosMaxAngle;
      }
    } else if (newBallAngle > -90) {
      newBallAngle -= angleAdjust;
      if (newBallAngle < Balls.constants.ballNegMinAngle) {
        newBallAngle = Balls.constants.ballNegMinAngle;
      }
    } else {
      newBallAngle += angleAdjust;
      if (newBallAngle > Balls.constants.ballNegMaxAngle) {
        newBallAngle = Balls.constants.ballNegMaxAngle;
      }
    }

    var [newBallVelocityX, newBallVelocityY] = this.scene.getVelocityXY(Math.abs(newBallAngle), gameConfig.ballInitialVelocity, newBallAngle > 0);
    newBall.setVelocity(newBallVelocityX, newBallVelocityY);
  }
}
