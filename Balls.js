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
}

class Balls {
  constructor(scene) {
    this.scene = scene;

    this.mainBall = new Ball(scene, scene.constants.centerX, scene.constants.centerY);
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

  clear() {
    this.phaserGroup.clear(true, true);
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
    this.phaserGroup.add(newBall);

    var [originalAngle, originalVelocity] = this.scene.getAngleVelocity(ball.body.velocity.x, ball.body.velocity.y);
    var newVelocity = originalVelocity * 0.8;

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
      if (newBallAngle < this.scene.constants.ballPosMinAngle) {
        newBallAngle = this.scene.constants.ballPosMinAngle;
      }
    } else if (newBallAngle > 0) {
      newBallAngle += angleAdjust;
      if (newBallAngle > this.scene.constants.ballPosMaxAngle) {
        newBallAngle = this.scene.constants.ballPosMaxAngle;
      }
    } else if (newBallAngle > -90) {
      newBallAngle -= angleAdjust;
      if (newBallAngle < this.scene.constants.ballNegMinAngle) {
        newBallAngle = this.scene.constants.ballNegMinAngle;
      }
    } else {
      newBallAngle += angleAdjust;
      if (newBallAngle > this.scene.constants.ballNegMaxAngle) {
        newBallAngle = this.scene.constants.ballNegMaxAngle;
      }
    }

    var [newBallVelocityX, newBallVelocityY] = this.scene.getVelocityXY(Math.abs(newBallAngle), newVelocity, newBallAngle > 0);
    newBall.setVelocity(newBallVelocityX, newBallVelocityY);
  }
}
