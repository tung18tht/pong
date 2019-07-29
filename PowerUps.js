class PowerUp extends Phaser.GameObjects.Image {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    this.scene = scene;
    this.type = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setDisplaySize(PowerUps.constants.powerUpsDiameter, PowerUps.constants.powerUpsDiameter);

    var effectMaxLifespan = 300;
    var effectSpeed = {min: 15, max: 20};
    var effectScale = 0.2;
    var effectAlpha = 0.25;

    if (type == PowerUps.types.POINT) {
      this.scaleTween = scene.tweens.add({
        targets: this,
        displayWidth: PowerUps.constants.powerUpsDiameter * 1.5,
        displayHeight: PowerUps.constants.powerUpsDiameter * 1.5,
        yoyo: true,
        repeat: -1,
        duration: 1000
      });

      effectMaxLifespan = 500;
      effectSpeed = {min: 25, max: 50};
      effectScale = 0.25;
      effectAlpha = 0.5;
    }

    this.effect = scene.objects.effects.createEmitter({
      x: x,
      y: y,
      quantity: 2,
      lifespan: {min: 250, max: effectMaxLifespan},
      speed: effectSpeed,
      scale: effectScale,
      alpha: {start: effectAlpha, end: 0},
      emitCallback: (particle) => {
        var newX = this.body.halfWidth * Math.cos(Math.atan2(particle.velocityY, particle.velocityX));
        var newY = Math.sqrt((this.body.halfWidth ** 2) - (newX ** 2));
        if (particle.velocityY < 0) {
          newY = -newY;
        }

        particle.fire(newX, newY);
      }
    });

    this.tween = scene.tweens.add({
      targets: this,
      angle: 360,
      repeat: -1,
      duration: 3000
    });

    this.alphaTween = scene.tweens.add({
      targets: this,
      alpha: 0,
      yoyo: true,
      repeat: 2,
      duration: 500,
      delay: 6500,
      onUpdate: () => {
        this.effect.setAlpha({start: effectAlpha * this.alpha, end: 0});
      },
      onComplete: () => {
        scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 500,
          onStart: () => {
            this.effect.stop();
          }
        });
      }
    });

    this.selfDestroyEvent = scene.time.addEvent({
      delay: gameConfig.powerUpsLifespan, callback: () => {
        switch (type) {
          case PowerUps.types.EXPLODE:
            scene.objects.powerUps.explodeAvailable++;
            break;
          case PowerUps.types.POINT:
            scene.objects.powerUps.pointAvailable = true;
            break;
        }

        this.destroy();
      }
    });
  }

  destroy(fromScene) {
    if (this.scene) {
      this.scene.objects.effects.removeEmitter(this.effect);
      this.tween.remove();
      this.alphaTween.remove();
      this.selfDestroyEvent.remove();

      if (this.scaleTween) {
        this.scaleTween.remove();
      }
    }

    super.destroy(fromScene);
  }
}

class PowerUps {
  constructor(scene) {
    this.scene = scene;
    this.powerUpsValues = Object.values(PowerUps.types);

    this.phaserGroup = scene.physics.add.group();
    this.children = this.phaserGroup.getChildren();

    this.explodeAvailable = 0;
    this.pointAvailable = true;
  }

  startSpawning() {
    this.scene.time.addEvent({
      delay: gameConfig.powerUpsInterval, loop: true, callback: () => {
        var powerUp;
        while (true) {
          powerUp = this.powerUpsValues[Math.floor(Math.random() * this.powerUpsValues.length)];
          var flag = false;
          switch (powerUp) {
            case PowerUps.types.EXPLODE:
              if (this.explodeAvailable > 0) {
                this.explodeAvailable--;
                flag = true;
              }
              break;

            case PowerUps.types.POINT:
              if (this.pointAvailable && Math.random() < 0.1) {
                this.pointAvailable = false;
                flag = true;
              }
              break;

            default:
              flag = true;
              break;
          }

          if (flag) {
            break;
          }
        }

        this.phaserGroup.add(new PowerUp(this.scene, 50 + Math.random() * (gameConfig.width - 100), 200 + Math.random() * (gameConfig.height - 400), powerUp));
      }
    });
  }

  stopEffects() {
    this.children.forEach(powerUp => {
      powerUp.effect.stop();
    });
  }

  remove(powerUp) {
    this.phaserGroup.remove(powerUp, true, true);
  }

  clear() {
    this.phaserGroup.clear(true, true);
  }

  setupForNewRound() {
    this.explodeAvailable = 0;

    if (this.scene.variables.p1Score < gameConfig.pointsToWin - 1 && this.scene.variables.p2Score < gameConfig.pointsToWin - 1) {
      this.pointAvailable = true;
    } else {
      this.pointAvailable = false;
    }
  }
}
