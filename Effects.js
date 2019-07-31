class Effects {
  constructor(scene) {
    this.particles = scene.add.particles('ball');
    this.snow = scene.add.particles(PowerUps.types.SNOW + 'nobound');

    this.gravity = scene.add.particles('wind').createEmitter({
      on: false,
      x: {min: 0, max: gameConfig.width},
      y: {min: 0, max: gameConfig.height},
      frequency: 10,
      lifespan: 1000,
      alpha: {start: 0.3, end: 0}
    });

    this.smoke = scene.add.particles('smoke_effect').setDepth(gameConfig.overlayDepth).createEmitter({
      on: false,
      x: gameConfig.centerX,
      y: gameConfig.centerY,
      frequency: 50,
      lifespan: {min: 2000, max: 3000},
      speed: {min: 50, max: 100},
      alpha: {start: 0.3, end: 0}
    });

    this.ballLeftCollision = this.createEmitter({
      frequency: -1,
      quantity: 10,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: -70, max: 70},
      alpha: {start: 0.5, end: 0}
    });

    this.ballRightCollision = this.createEmitter({
      frequency: -1,
      quantity: 10,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: 110, max: 250},
      alpha: {start: 0.5, end: 0}
    });

    this.ballDownCollision = this.createEmitter({
      frequency: -1,
      quantity: 10,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: -160, max: -20},
      alpha: {start: 0.5, end: 0}
    });

    this.ballUpCollision = this.createEmitter({
      frequency: -1,
      quantity: 10,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: 20, max: 160},
      alpha: {start: 0.5, end: 0}
    });

    this.powerUpHit = this.createEmitter({
      frequency: -1,
      quantity: 1000,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      alpha: {start: 0.2, end: 0}
    });

    this.explosion = this.createEmitter({
      frequency: -1,
      lifespan: {min: 450, max: 550},
      speed: {min: 450, max: 550},
      scale: 0.5,
      alpha: {start: 0.5, end: 0}
    });

    this.endMatch = this.createEmitter({
      on: false,
      x: gameConfig.centerX,
      y: gameConfig.centerY,
      lifespan: {min: 1000, max: 2000},
      speed: {min: 200, max: 400},
      quantity: 3,
      scale: 0.5,
      alpha: {start: 1, end: 0}
    });
  }

  createEmitter(config) {
    return this.particles.createEmitter(config);
  }

  removeEmitter(emitter) {
    this.particles.emitters.remove(emitter);
  }

  explodeBallCollisionEffect(ball, object) {
    if (ball.body.touching.up) {
      this.ballUpCollision.emitParticleAt(ball.x, object.body.bottom);
    } else if (ball.body.touching.down) {
      this.ballDownCollision.emitParticleAt(ball.x, object.body.top);
    } else if (ball.body.touching.left) {
      this.ballLeftCollision.emitParticleAt(object.body.right, ball.y);
    } else {
      this.ballRightCollision.emitParticleAt(object.body.left, ball.y);
    }
  }
}
