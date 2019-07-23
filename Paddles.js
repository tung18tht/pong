class Paddle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, p1) {
    super(scene, gameConfig.centerX, p1 ? gameConfig.height - gameConfig.paddleYOffset : gameConfig.paddleYOffset, "paddle");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setImmovable(true);

    this.trueScaleX = 1;
    this.scaleXDebt = 0;

    this.trail = scene.objects.effects.createEmitter({
      follow: this,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: p1 ? {min: 30, max: 150} : {min: 210, max: 330},
      alpha: {start: 0.5, end: 0},
      emitZone: {source: new Phaser.Geom.Line(-gameConfig.paddleHalfTrailWidth, 0, gameConfig.paddleHalfTrailWidth, 0)}
    });

    this.ballCollisionEffect = scene.objects.effects.createEmitter({
      frequency: -1,
      quantity: 10,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: p1 ? {min: -160, max: -20} : {min: 20, max: 160},
      alpha: {start: 0.5, end: 0}
    });

    this.powerUpsNoti = {};
    Object.values(PowerUps.types).forEach(powerUp => {
      this.powerUpsNoti[powerUp] = scene.add.image(gameConfig.centerX, gameConfig.centerY * (p1 ? 1.5 : 0.5), powerUp + 'nobound').setOrigin(0.5, 0.5).setDisplaySize(250, 250).setAlpha(0);
    });
    this.powerUpsNotiValues = Object.values(this.powerUpsNoti);
  }

  notifyPowerUp(type) {
    this.scene.tweens.killTweensOf(this.powerUpsNotiValues);
    this.powerUpsNotiValues.forEach(noti => {noti.setAlpha(0)});

    this.powerUpsNoti[type].setAlpha(0.5);

    this.scene.tweens.add({
      targets: this.powerUpsNoti[type],
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.powerUpsNoti[type],
          alpha: 0,
          duration: 100
        });
      }
    });
  }

  move(targetX, delta) {
    var diff = this.x - targetX;
    var step = gameConfig.paddleStepPerMs * delta;

    if (diff < -step) {
      this.x += step;
    } else if (diff > step) {
      this.x -= step;
    } else {
      this.x = targetX;
    }

    if (this.x < this.body.halfWidth) {
      this.x = this.body.halfWidth;
    } else {
      var maxX = gameConfig.width - this.body.halfWidth;
      if (this.x > maxX) {
        this.x = maxX;
      }
    }
  }

  updateScaleX(value) {
    this.trueScaleX += value;
    this.trueScaleX -= this.scaleXDebt;
    this.scaleXDebt =  0;

    if (this.trueScaleX < gameConfig.paddleMinScaleX) {
      this.scaleXDebt = gameConfig.paddleMinScaleX - this.trueScaleX;
      this.trueScaleX = gameConfig.paddleMinScaleX;
    }

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleX: this.trueScaleX,
      duration: 500
    });

    this.trail.setEmitZone({source: new Phaser.Geom.Line(-gameConfig.paddleHalfTrailWidth * this.trueScaleX, 0, gameConfig.paddleHalfTrailWidth * this.trueScaleX, 0)});
  }
}

class Paddles {
  constructor(scene) {
    this.p1 = new Paddle(scene, true);
    this.p2 = new Paddle(scene, false);

    this.phaserGroup = scene.physics.add.group([this.p1, this.p2]);
  }

  setAlpha(value) {
    this.p1.setAlpha(value);
    this.p2.setAlpha(value);
  }

  setupNewRoundPosition() {
    this.p1.setPosition(gameConfig.centerX, gameConfig.height);
    this.p2.setPosition(gameConfig.centerX, 0);
  }

  setupNewRoundScale() {
    this.p1.setScale(1, 0);
    this.p2.setScale(1, 0);

    this.p1.trail.setEmitZone({source: new Phaser.Geom.Line(-gameConfig.paddleHalfTrailWidth, 0, gameConfig.paddleHalfTrailWidth, 0)});
    this.p2.trail.setEmitZone({source: new Phaser.Geom.Line(-gameConfig.paddleHalfTrailWidth, 0, gameConfig.paddleHalfTrailWidth, 0)});
  }

  startTrails() {
    this.p1.trail.start();
    this.p2.trail.start();
  }

  stopTrails() {
    this.p1.trail.stop();
    this.p2.trail.stop();
  }
}
