class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "ball");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setCollideWorldBounds(true).setBounce(1, 1);
    this.body.onWorldBounds = true;

    this.trail = scene.objects.particles.createEmitter({
      follow: this,
      lifespan: 200,
      scale: {start: 1, end: 0},
      alpha: {start: 0.2, end: 0}
    });
  }

  destroy(fromScene) {
    if (typeof this.scene !== "undefined") {
      this.scene.objects.particles.emitters.remove(this.trail);
    }

    super.destroy(fromScene);
  }
}

class Balls {
  constructor(scene) {
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

  getMostDeadlyP2Ball() {
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

    return negYVelocityBall ? negYVelocityBall : posYVelocityBall;
  }
}
