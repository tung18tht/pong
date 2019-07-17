class Paddle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, p1) {
    super(scene, scene.constants.centerX, p1 ? gameState.height - scene.constants.paddleYOffset : scene.constants.paddleYOffset, "paddle");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setCollideWorldBounds(true).setImmovable(true);

    this.trail = scene.objects.effects.createEmitter({
      follow: this,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: p1 ? {min: 30, max: 150} : {min: 210, max: 330},
      alpha: {start: 0.5, end: 0},
      emitZone: {source: new Phaser.Geom.Line(-scene.constants.paddleHalfWidth * 0.8, 0, scene.constants.paddleHalfWidth * 0.8, 0)}
    });

    this.ballCollisionEffect = scene.objects.effects.createEmitter({
      frequency: -1,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: p1 ? {min: -160, max: -20} : {min: 20, max: 160},
      alpha: {start: 0.5, end: 0}
    });
  }

  move(targetX, delta) {
    var diff = this.x - targetX;
    var step = this.scene.constants.paddleStepPerMs * delta;

    if (diff < -step) {
      this.x += step;
    } else if (diff > step) {
      this.x -= step;
    } else {
      this.x = targetX;
    }

    if (this.x > this.scene.constants.paddleMaxX) {
      this.x = this.scene.constants.paddleMaxX;
    } else if (this.x < this.scene.constants.paddleMinX) {
      this.x = this.scene.constants.paddleMinX;
    }
  }
}

class Paddles {
  constructor(scene) {
    this.scene = scene;

    this.p1 = new Paddle(scene, true);
    this.p2 = new Paddle(scene, false);

    this.phaserGroup = scene.physics.add.group([this.p1, this.p2]);
  }

  setAlpha(value) {
    this.p1.setAlpha(value);
    this.p2.setAlpha(value);
  }

  setupNewRoundPosition() {
    this.p1.setPosition(this.scene.constants.centerX, gameState.height);
    this.p2.setPosition(this.scene.constants.centerX, 0);
  }

  setupNewRoundScale() {
    this.p1.setScale(1, 0);
    this.p2.setScale(1, 0);
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
