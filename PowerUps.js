class PowerUp extends Phaser.GameObjects.Image {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    this.scene = scene;
    this.type = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setDisplaySize(scene.constants.ballDiameter, scene.constants.ballDiameter);

    scene.tweens.add({
      targets: this,
      angle: 360,
      repeat: -1,
      duration: 3000
    });

    this.effect = scene.objects.effects.createEmitter({
      x: x,
      y: y,
      lifespan: {min: 250, max: 300},
      speed: {min: 25, max: 50},
      scale: 0.2,
      alpha: {start: 0.5, end: 0},
      emitZone: {source: new Phaser.Geom.Circle(0, 0, scene.constants.ballRadius), type: 'edge', quantity: 12},
      deathZone: {source: new Phaser.Geom.Circle(x, y, scene.constants.ballRadius)}
    });
  }

  destroy(fromScene) {
    if (this.scene) {
      this.scene.objects.effects.removeEmitter(this.effect);
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
      delay: this.scene.constants.powerUpsInterval, loop: true, callback: () => {
        this.phaserGroup.add(new PowerUp(
          this.scene,
          Math.random() * gameState.width,
          Math.random() * gameState.height,
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
  EXPAND: "expand"
}
