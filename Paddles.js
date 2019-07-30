class Paddle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, p1) {
    super(scene, gameConfig.centerX, p1 ? gameConfig.height - gameConfig.paddleYOffset : gameConfig.paddleYOffset, "paddle");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setImmovable(true);

    this.trail = scene.objects.effects.createEmitter({
      follow: this,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: p1 ? {min: 30, max: 150} : {min: 210, max: 330},
      alpha: {start: 0.5, end: 0},
      emitZone: {source: new Phaser.Geom.Line(-Paddles.constants.defaultHalfTrailWidth, 0, Paddles.constants.defaultHalfTrailWidth, 0)}
    });

    this.powerUpsNoti = {};
    Object.values(PowerUps.types).forEach(powerUp => {
      this.powerUpsNoti[powerUp] = scene.add.image(gameConfig.centerX, gameConfig.centerY * (p1 ? 1.5 : 0.5), powerUp + 'nobound').setOrigin(0.5, 0.5).setDisplaySize(250, 250).setFlip(!p1, !p1).setAlpha(0);
    });
    this.powerUpsNotiValues = Object.values(this.powerUpsNoti);

    this.trueScaleX = 1;
    this.scaleXDebt = 0;
    this.scaleXTween;

    this.isPowerful = false;
    this.powerfulSet = 0;
    this.powerfulIcon = scene.add.image(this.x, this.y, PowerUps.types.POWERFUL + 'nobound').setOrigin(0.5, 0.5).setDisplaySize(gameConfig.paddleHeight, gameConfig.paddleHeight).setTint(0x000000).setAlpha(0);

    this.wallLeft = scene.physics.add.sprite(0, p1 ? gameConfig.height - gameConfig.paddleHeight : gameConfig.paddleHeight, "paddle").setOrigin(1, 0.5).setImmovable(true).setDisplaySize(gameConfig.centerX, this.body.halfHeight);
    this.wallRight = scene.physics.add.sprite(gameConfig.width, p1 ? gameConfig.height - gameConfig.paddleHeight : gameConfig.paddleHeight, "paddle").setOrigin(0, 0.5).setImmovable(true).setDisplaySize(gameConfig.centerX, this.body.halfHeight);
    this.wallSet = 0;

    this.isSnowed = false;
    this.snowSet = 0;
    this.snowEffect = scene.objects.effects.snow.createEmitter({
      on: false,
      x: {min: -gameConfig.width, max: gameConfig.width * 2},
      y: gameConfig.centerY,
      frequency: 50,
      lifespan: 3000,
      speed: {min: 150, max: 200},
      scale: 0.1,
      angle: p1 ? 60 : -120,
      alpha: 0.2,
      rotate: {start: 0, end: 360}
    });

    this.isInvisible = false;
    this.invisibleSet = 0;
    this.alphaTween;
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

  move(targetX, delta, stepPerMs = gameConfig.paddleStepPerMs) {
    var diff = this.x - targetX;
    var step = stepPerMs * delta;

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

    if (this.isPowerful) {
      this.powerfulIcon.x = this.x;
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

    if (this.scaleXTween) {
      this.scaleXTween.remove();
    }
    this.scaleXTween = this.scene.tweens.add({
      targets: this,
      scaleX: this.trueScaleX,
      duration: 500,
      onComplete: () => {
        var halfTrailWidth = this.body.halfWidth * 0.8;
        this.trail.setEmitZone({source: new Phaser.Geom.Line(-halfTrailWidth, 0, halfTrailWidth, 0)});
      }
    });
  }

  beginPowerful() {
    this.isPowerful = true;
    this.powerfulSet++;
    this.powerfulIcon.setAlpha(1);
  }

  endPowerful(force = false) {
    if (force) {
      this.powerfulSet = 0;
    } else {
      this.powerfulSet--;
    }

    if (this.powerfulSet == 0) {
      this.isPowerful = false;
      this.powerfulIcon.setAlpha(0);
    }
  }

  beginWalled() {
    this.wallSet++;
    this.scene.tweens.killTweensOf([this.wallLeft, this.wallRight]);
    this.scene.tweens.add({
      targets: [this.wallLeft, this.wallRight],
      x: gameConfig.centerX,
      duration: 2000
    });
  }

  endWalled(force = false) {
    if (force) {
      this.wallSet = 0;
    } else {
      this.wallSet--;
    }

    if (this.wallSet == 0) {
      this.scene.tweens.killTweensOf([this.wallLeft, this.wallRight]);

      this.scene.tweens.add({
        targets: this.wallLeft,
        x: 0,
        duration: 2000
      });
      this.scene.tweens.add({
        targets: this.wallRight,
        x: gameConfig.width,
        duration: 2000
      });
    }
  }

  beginSnowed() {
    this.isSnowed = true;
    this.snowSet++;
    this.snowEffect.start();
  }

  endSnowed(force = false) {
    if (force) {
      this.snowSet = 0;
    } else {
      this.snowSet--;
    }

    if (this.snowSet == 0) {
      this.isSnowed = false;
      this.snowEffect.stop();
    }
  }

  beginInvisible() {
    this.isInvisible = true;
    this.invisibleSet++;

    if (this.alphaTween) {
      this.alphaTween.remove();
    }
    this.alphaTween = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.trail.stop();
      }
    });
  }

  endInvisible(force = false) {
    if (force) {
      this.invisibleSet = 0;
      this.isInvisible = false;
      if (this.alphaTween) {
        this.alphaTween.remove();
      }
      this.setAlpha(1);
      this.trail.start();
    } else if (--this.invisibleSet == 0) {
      this.isInvisible = false;

      if (this.alphaTween) {
        this.alphaTween.remove();
      }
      this.alphaTween = this.scene.tweens.add({
        targets: this,
        alpha: 1,
        duration: 500,
        onComplete: () => {
          this.trail.start();
        }
      });
    }
  }

  ballContactWhenInvisible() {
    if (this.alphaTween) {
      this.alphaTween.remove();
    }

    this.setAlpha(1);

    this.alphaTween = this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500
    });
  }
}

class Paddles {
  constructor(scene) {
    this.p1 = new Paddle(scene, true);
    this.p2 = new Paddle(scene, false);

    this.phaserGroup = scene.physics.add.group([this.p1, this.p2]);
    this.walls = scene.physics.add.group([this.p1.wallLeft, this.p1.wallRight, this.p2.wallLeft, this.p2.wallRight]);
  }

  startTrails() {
    this.p1.trail.start();
    this.p2.trail.start();
  }

  stopTrails() {
    this.p1.trail.stop();
    this.p2.trail.stop();
  }

  setupNewRoundScale() {
    this.p1.setScale(1, 0);
    this.p2.setScale(1, 0);

    this.p1.trueScaleX = 1;
    this.p1.scaleXDebt = 0;
    this.p2.trueScaleX = 1;
    this.p2.scaleXDebt = 0;

    this.p1.trail.setEmitZone({source: new Phaser.Geom.Line(-Paddles.constants.defaultHalfTrailWidth, 0, Paddles.constants.defaultHalfTrailWidth, 0)});
    this.p2.trail.setEmitZone({source: new Phaser.Geom.Line(-Paddles.constants.defaultHalfTrailWidth, 0, Paddles.constants.defaultHalfTrailWidth, 0)});
  }

  setupForNewRound() {
    this.resetPowerful();
    this.resetWalled();
    this.resetSnowed();
    this.resetInvisible();

    this.p1.setAlpha(0);
    this.p2.setAlpha(0);

    this.p1.setPosition(gameConfig.centerX, gameConfig.height);
    this.p2.setPosition(gameConfig.centerX, 0);

    this.stopTrails();
    this.setupNewRoundScale();
  }

  resetPowerful() {
    this.p1.endPowerful(true);
    this.p2.endPowerful(true);
  }

  resetWalled() {
    this.p1.endWalled(true);
    this.p2.endWalled(true);
  }

  resetSnowed() {
    this.p1.endSnowed(true);
    this.p2.endSnowed(true);
  }

  resetInvisible() {
    this.p1.endInvisible(true);
    this.p2.endInvisible(true);
  }
}
