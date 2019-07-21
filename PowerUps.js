class PowerUp extends Phaser.GameObjects.Image {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    this.scene = scene;
    this.type = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setDisplaySize(gameConfig.ballDiameter, gameConfig.ballDiameter);

    this.tween = scene.tweens.add({
      targets: this,
      angle: 360,
      repeat: -1,
      duration: 3000
    });

    this.effect = scene.objects.effects.createEmitter({
      x: x,
      y: y,
      quantity: 2,
      lifespan: {min: 250, max: 300},
      speed: {min: 15, max: 20},
      scale: 0.2,
      alpha: {start: 0.25, end: 0},
      emitCallback: (particle) => {
        var newX = gameConfig.ballRadius * Math.cos(Math.atan2(particle.velocityY, particle.velocityX));
        var newY = Math.sqrt((gameConfig.ballRadius ** 2) - (newX ** 2));
        if (particle.velocityY < 0) {
          newY = -newY;
        }

        particle.fire(newX, newY);
      }
    });
  }

  destroy(fromScene) {
    if (this.scene) {
      this.scene.objects.effects.removeEmitter(this.effect);
      this.tween.remove();
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
  }

  startSpawning() {
    this.scene.time.addEvent({
      delay: gameConfig.powerUpsInterval, loop: true, callback: () => {
        this.phaserGroup.add(new PowerUp(
          this.scene,
          50 + Math.random() * (gameConfig.width - 100),
          100 + Math.random() * (gameConfig.height - 200),
          this.powerUpsValues[Math.floor(Math.random() * this.powerUpsValues.length)]
        ));
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
}

PowerUps.types = {
  X2: "x2",
  EXPAND: "expand",
  SHRINK: "shrink"
}
