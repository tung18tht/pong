class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.variables = {};
    this.variables.p1Score = 0;
    this.variables.p2Score = 0;
    this.variables.countdownNumber = 3;

    this.objects = {};

    var paddleGraphic = this.add.graphics(0, 0);
    paddleGraphic.fillStyle(0xFFFFFF);
    paddleGraphic.fillRect(0, 0, gameConfig.paddleWidth, gameConfig.paddleHeight);
    paddleGraphic.generateTexture('paddle', gameConfig.paddleWidth, gameConfig.paddleHeight)
    paddleGraphic.destroy();

    var ballGraphic = this.add.graphics(0, 0);
    ballGraphic.fillStyle(0xFFFFFF);
    ballGraphic.fillCircle(gameConfig.ballRadius, gameConfig.ballRadius, gameConfig.ballRadius);
    ballGraphic.generateTexture('ball', gameConfig.ballRadius * 2, gameConfig.ballRadius * 2)
    ballGraphic.destroy();

    this.load.image('play', 'assets/play.svg');
    this.load.image('quit', 'assets/quit.svg');
    this.load.image('pause', 'assets/pause.svg');

    Object.values(PowerUps.types).forEach(powerUp => {
      this.load.image(powerUp, 'assets/powerups/' + powerUp + '.svg');
      this.load.image(powerUp + 'nobound', 'assets/powerups/' + powerUp + '_nobound.svg');
    });
  }

  create() {
    this.add.rectangle(0, gameConfig.centerY - 1, gameConfig.width, 2, 0x888888).setOrigin(0, 0);

    this.objects.p1ScoreText = this.add.text(gameConfig.centerX, gameConfig.centerY + 50, this.variables.p1Score, {fontSize: 80, color: '#AAAAAA'}).setOrigin(0.5, 0.5);
    this.objects.p2ScoreText = this.add.text(gameConfig.centerX, gameConfig.centerY - 50, this.variables.p2Score, {fontSize: 80, color: '#AAAAAA'}).setOrigin(0.5, 0.5).setFlip(true, true);

    this.objects.effects = new Effects(this);
    this.objects.paddles = new Paddles(this);
    this.objects.balls = new Balls(this);
    this.objects.powerUps = new PowerUps(this);

    this.physics.add.collider(this.objects.balls.phaserGroup, this.objects.balls.phaserGroup, (ball1, ball2) => {this.ballBallCollide(ball1, ball2)});
    this.physics.add.collider(this.objects.balls.phaserGroup, this.objects.paddles.phaserGroup, (ball, paddle) => {this.ballPaddleCollide(ball, paddle)});
    this.physics.add.overlap(this.objects.balls.phaserGroup, this.objects.paddles.phaserGroup, (ball, paddle) => {this.ballPaddleOverlap(ball, paddle)});
    this.physics.add.overlap(this.objects.balls.phaserGroup, this.objects.powerUps.phaserGroup, (ball, powerUp) => {this.ballPowerUpOverlap(ball, powerUp)});

    this.physics.world.on('worldbounds', (ball, up, down, left, right) => {this.ballWorldCollide(ball, up, down, left, right)});

    this.objects.countdownBackground = this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.7).setOrigin(0, 0);
    this.objects.countdownP1 = this.add.text(gameConfig.centerX, gameConfig.centerY * 1.5, this.variables.countdownNumber, {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5);
    this.objects.countdownP2 = this.add.text(gameConfig.centerX, gameConfig.centerY * 0.5, this.variables.countdownNumber, {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setFlip(true, true);

    this.objects.pauseButton = this.add.rectangle(gameConfig.width - 50, gameConfig.centerY, 50, 50).setOrigin(0.5, 0.5).setStrokeStyle(2, 0xFFFFFF);
    this.objects.pauseIcon = this.add.image(gameConfig.width - 50, gameConfig.centerY, 'pause').setOrigin(0.5, 0.5).setDisplaySize(40, 40);

    this.objects.pauseButton.on('pointerover', () => {this.objects.pauseButton.setScale(1.1)});
    this.objects.pauseButton.on('pointerout', () => {this.objects.pauseButton.setScale(1)});
    this.objects.pauseButton.on('pointerup', () => {
      this.objects.pauseButton.disableInteractive();
      this.pause();
    });

    this.objects.pauseBackgound = this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000).setOrigin(0, 0).setAlpha(0);
    this.objects.pauseTextP1 = this.add.text(gameConfig.centerX, gameConfig.centerY * 1.5, "paused", { fontSize: 40, color: '#FFFFFF' }).setOrigin(0.5, 0.5).setAlpha(0);
    this.objects.pauseTextP2 = this.add.text(gameConfig.centerX, gameConfig.centerY * 0.5, "paused", { fontSize: 40, color: '#FFFFFF' }).setOrigin(0.5, 0.5).setFlip(true, true).setAlpha(0);
    this.objects.continueButton = this.add.rectangle(gameConfig.centerX - 90, gameConfig.centerY, 120, 120).setOrigin(0.5, 0.5).setStrokeStyle(8, 0xFFFFFF).setAlpha(0);
    this.objects.continueIcon = this.add.image(gameConfig.centerX - 90, gameConfig.centerY, 'play').setOrigin(0.5, 0.5).setDisplaySize(80, 80).setAlpha(0);
    this.objects.quitButton = this.add.rectangle(gameConfig.centerX + 90, gameConfig.centerY, 120, 120).setOrigin(0.5, 0.5).setStrokeStyle(8, 0xFFFFFF).setAlpha(0);
    this.objects.quitIcon = this.add.image(gameConfig.centerX + 90, gameConfig.centerY, 'quit').setOrigin(0.5, 0.5).setDisplaySize(80, 80).setAlpha(0);

    this.objects.continueButton.on('pointerover', () => {this.objects.continueButton.setScale(1.1)});
    this.objects.continueButton.on('pointerout', () => {this.objects.continueButton.setScale(1)});
    this.objects.continueButton.on('pointerup', () => {this.continue()});

    this.objects.quitButton.on('pointerover', () => { this.objects.quitButton.setScale(1.1) });
    this.objects.quitButton.on('pointerout', () => { this.objects.quitButton.setScale(1) });
    this.objects.quitButton.on('pointerup', () => {this.quit()});

    this.startNewRound(Math.random() < 0.5);
  }

  pause() {
    this.tweens.killAll();
    this.endRound();

    this.tweens.add({
      targets: [this.objects.pauseBackgound, this.objects.pauseTextP1, this.objects.pauseTextP2, this.objects.continueButton, this.objects.continueIcon, this.objects.quitButton, this.objects.quitIcon],
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.objects.continueButton.setInteractive({useHandCursor: true});
        this.objects.quitButton.setInteractive({useHandCursor: true});
      }
    });
  }

  continue() {
    this.objects.continueButton.disableInteractive();
    this.objects.quitButton.disableInteractive();

    this.tweens.add({
      targets: [this.objects.pauseTextP1, this.objects.pauseTextP2, this.objects.continueButton, this.objects.continueIcon, this.objects.quitButton, this.objects.quitIcon],
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.objects.pauseBackgound.setAlpha(0);
        this.startNewRound(this.objects.balls.mainBall.body.velocity.y > 0);
      }
    });
  }

  quit() {
    this.objects.continueButton.disableInteractive();
    this.objects.quitButton.disableInteractive();

    this.tweens.add({
      targets: this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0).setOrigin(0, 0),
      fillAlpha: 1,
      duration: 500,
      onComplete: () => {
        this.scene.start("MenuScene");
      }
    });
  }

  update(time, delta) {
    if (this.physics.world.isPaused) {
      return;
    }

    var [posYVelocityBall, negYVelocityBall] = this.objects.balls.getMostDeadlyBalls();

    this.objects.paddles.p1.move(this.input.x, delta);
    // this.objects.paddles.p1.move(posYVelocityBall.x, delta);
    this.objects.paddles.p2.move(negYVelocityBall.x, delta);
  }

  startNewRound(toSideP1) {
    this.physics.pause();

    this.objects.balls.mainBall.setAlpha(0);
    this.objects.paddles.setAlpha(0);

    this.objects.balls.mainBall.setPosition(gameConfig.centerX, gameConfig.centerY);
    this.objects.paddles.setupNewRoundPosition();

    this.objects.balls.mainBall.trail.stop();
    this.objects.paddles.stopTrails();

    this.objects.paddles.setupNewRoundScale();

    this.variables.countdownNumber = 3;
    this.objects.countdownP1.setText(this.variables.countdownNumber);
    this.objects.countdownP2.setText(this.variables.countdownNumber);

    this.objects.countdownBackground.setAlpha(0);
    this.objects.countdownP1.setAlpha(0);
    this.objects.countdownP2.setAlpha(0);

    this.objects.pauseIcon.setAlpha(0);
    this.objects.pauseButton.setAlpha(0);
    this.objects.pauseButton.disableInteractive();

    this.tweens.add({
      targets: [this.objects.countdownBackground, this.objects.countdownP1, this.objects.countdownP2, this.objects.pauseIcon, this.objects.pauseButton],
      alpha: 1,
      duration: 500,
      onComplete: () => {this.objects.pauseButton.setInteractive({useHandCursor: true})}
    });

    this.tweens.add({
      targets: [this.objects.countdownBackground, this.objects.countdownP1, this.objects.countdownP2, this.objects.pauseIcon, this.objects.pauseButton],
      alpha: 0,
      duration: 500,
      delay: 2500,
      onStart: () => {this.objects.pauseButton.disableInteractive()},
      onComplete: () => {
        this.physics.resume();
        this.objects.powerUps.startSpawning();
      }
    });

    this.time.addEvent({
      delay: 1000, repeat: 1, callback: () => {
        this.objects.countdownP1.setText(--this.variables.countdownNumber);
        this.objects.countdownP2.setText(this.variables.countdownNumber);
      }
    });

    this.tweens.add({
      targets: [this.objects.balls.mainBall, this.objects.paddles.p1, this.objects.paddles.p2],
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.objects.balls.mainBall.trail.start();
        this.objects.paddles.startTrails();
      }
    });

    this.tweens.add({
      targets: [this.objects.paddles.p1, this.objects.paddles.p2],
      scaleY: 1,
      duration: 500
    });

    this.tweens.add({
      targets: this.objects.paddles.p1,
      y: gameConfig.height - gameConfig.paddleYOffset,
      duration: 1000,
      ease: "Back",
      easeParams: [3]
    });

    this.tweens.add({
      targets: this.objects.paddles.p2,
      y: gameConfig.paddleYOffset,
      duration: 1000,
      ease: "Back",
      easeParams: [3]
    });

    this.tweens.add({
      targets: this.objects.balls.mainBall,
      y: gameConfig.centerY + (toSideP1 ? gameConfig.ballRadius : -gameConfig.ballRadius) * 5,
      duration: 1500,
      delay: 1000,
      ease: "Elastic",
      easeParams: [1, 0.5]
    });

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 0.3,
      duration: 2000,
      delay: 5000
    });

    var ballInitialAngle = Math.random() * 30 + 30 + (Math.random() < 0.5 ? 0 : 90);
    var [velocityX, velocityY] = this.getVelocityXY(ballInitialAngle, gameConfig.ballInitialVelocity, toSideP1);
    this.objects.balls.mainBall.setVelocity(velocityX, velocityY);
  }

  endRound() {
    this.physics.pause();
    this.tweens.killTweensOf([this.objects.p1ScoreText, this.objects.p2ScoreText]);
    this.time.removeAllEvents();

    this.objects.balls.stopTrails();
    this.objects.paddles.stopTrails();
    this.objects.powerUps.stopEffects();

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 1,
      duration: 500
    });

    this.tweens.add({
      targets: [this.objects.paddles.p1, this.objects.paddles.p2],
      scaleY: 0,
      duration: 500,
      delay: 500
    });

    this.tweens.add({
      targets: this.objects.balls.children.concat(this.objects.powerUps.children).concat(this.objects.paddles.p1, this.objects.paddles.p2),
      alpha: 0,
      duration: 500,
      delay: 500,
      onComplete: () => {
        this.objects.balls.deleteExtraBalls();
        this.objects.powerUps.clear();
        this.events.emit("roundEnded");
      }
    });
  }

  endMatch(p1Win) {
    this.physics.pause();
    this.tweens.killTweensOf([this.objects.p1ScoreText, this.objects.p2ScoreText]);
    this.time.removeAllEvents();

    this.objects.balls.stopTrails();
    this.objects.paddles.stopTrails();
    this.objects.powerUps.stopEffects();

    this.objects.p1ScoreText.setDepth(1);
    this.objects.p2ScoreText.setDepth(1);

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 1,
      duration: 500
    });

    this.tweens.add({
      targets: this.objects.balls.children.concat(this.objects.powerUps.children).concat(p1Win ? this.objects.paddles.p2 : this.objects.paddles.p1),
      alpha: 0,
      duration: 500,
      delay: 500,
      onComplete: () => {
        this.objects.balls.clear();
        this.objects.powerUps.clear();
      }
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddles.p2 : this.objects.paddles.p1,
      scaleY: 0,
      duration: 500,
      delay: 500
    });

    this.objects.resultBackground = this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.7).setOrigin(0, 0).setAlpha(0);
    this.objects.p1Result = this.add.text(gameConfig.centerX, gameConfig.centerY * 1.5, p1Win ? "Win" : "Lose", {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setAlpha(0);
    this.objects.p2Result = this.add.text(gameConfig.centerX, gameConfig.centerY * 0.5, p1Win ? "Lose" : "Win", {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setFlip(true, true).setAlpha(0);

    this.objects.endMatchButton = this.add.rectangle(gameConfig.width - 50, gameConfig.centerY, 50, 50).setOrigin(0.5, 0.5).setStrokeStyle(2, 0xFFFFFF).setAlpha(0);
    this.objects.endMatchIcon = this.add.image(gameConfig.width - 50, gameConfig.centerY, 'quit').setOrigin(0.5, 0.5).setDisplaySize(40, 40).setAlpha(0);

    this.objects.endMatchButton.on('pointerover', () => {this.objects.endMatchButton.setScale(1.1)});
    this.objects.endMatchButton.on('pointerout', () => {this.objects.endMatchButton.setScale(1)});
    this.objects.endMatchButton.once('pointerup', () => {
      this.tweens.add({
        targets: this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0).setOrigin(0, 0).setDepth(2),
        fillAlpha: 1,
        duration: 500,
        onComplete: () => {
          this.scene.start("MenuScene");
        }
      });
    });

    this.tweens.add({
      targets: [this.objects.resultBackground, this.objects.p1Result, this.objects.p2Result, this.objects.endMatchButton, this.objects.endMatchIcon],
      alpha: 1,
      duration: 500,
      delay: 1000,
      onComplete: () => {this.objects.endMatchButton.setInteractive({useHandCursor: true})}
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddles.p1 : this.objects.paddles.p2,
      x: gameConfig.centerX,
      y: gameConfig.centerY,
      scaleX: 2,
      scaleY: 2,
      duration: 1000,
      delay: 1000,
      onComplete: () => {this.objects.effects.endMatch.start()}
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddles.p1 : this.objects.paddles.p2,
      angle: 360,
      repeat: -1,
      duration: 1000,
      delay: 1000
    });
  }

  ballWorldCollide(ball, up, down, left, right) {
    var lastPoint = false;

    if (up) {
      this.objects.p1ScoreText.setText(++this.variables.p1Score);
      lastPoint = this.variables.p1Score == gameConfig.pointsToWin;
    } else if (down) {
      this.objects.p2ScoreText.setText(++this.variables.p2Score);
      lastPoint = this.variables.p2Score == gameConfig.pointsToWin;
    } else if (left) {
      this.objects.effects.ballLeftCollision.emitParticleAt(0, ball.gameObject.y);
    } else if (right) {
      this.objects.effects.ballRightCollision.emitParticleAt(gameConfig.width, ball.gameObject.y);
    }

    if (up || down) {
      this.objects.effects.ballScored.emitParticleAt(ball.gameObject.x, ball.gameObject.y);

      if (lastPoint) {
        this.endMatch(up);
      } else {
        this.endRound();
        this.events.once("roundEnded", () => {this.startNewRound(down)});
      }
    }
  }

  ballBallCollide(ball1, ball2) {
    ball1.body.update(0);
    ball2.body.update(0);

    ball1.checkMinVelocity();
    ball2.checkMinVelocity();
  }

  ballPaddleCollide(ball, paddle) {
    ball.fromPaddle = paddle;

    if (ball.body.touching.left) {
      this.objects.effects.ballLeftCollision.emitParticleAt(paddle.body.right, ball.y);
      return;
    } else if (ball.body.touching.right) {
      this.objects.effects.ballRightCollision.emitParticleAt(paddle.body.left, ball.y);
      return;
    }

    paddle.ballCollisionEffect.emitParticleAt(ball.x, paddle.y);

    var diffRatio = (ball.x - paddle.x) / paddle.body.halfWidth;
    var angleAdjust = diffRatio * gameConfig.paddleMaxBounceAngleAdjust;

    //  1. /^ R: - L: +
    //  2. ^\ R: - L: +
    //  3. \v R: + L: -
    //  4. v/ R: + L: -

    var newAngle = ball.body.angle * 180 / Math.PI;
    if (newAngle > 0) {
      newAngle -= angleAdjust;

      if (newAngle > Balls.constants.ballPosMaxAngle) {
        newAngle = Balls.constants.ballPosMaxAngle;
      } else if (newAngle < Balls.constants.ballPosMinAngle) {
        newAngle = Balls.constants.ballPosMinAngle;
      }
    } else {
      newAngle += angleAdjust;

      if (newAngle > Balls.constants.ballNegMaxAngle) {
        newAngle = Balls.constants.ballNegMaxAngle;
      } else if (newAngle < Balls.constants.ballNegMinAngle) {
        newAngle = Balls.constants.ballNegMinAngle;
      }
    }

    var newVelocity = ball.body.speed * gameConfig.ballBounce;
    if (newVelocity > gameConfig.ballMaxVelocity) {
      newVelocity = gameConfig.ballMaxVelocity;
    }

    var [velocityX, velocityY] = this.getVelocityXY(Math.abs(newAngle), newVelocity, newAngle < 0);
    ball.setVelocity(velocityX, velocityY);
  }

  ballPaddleOverlap(ball, paddle) {
    if (ball.x > paddle.x) {
      if (ball.body.velocity.x < 0) {
        this.objects.effects.ballLeftCollision.emitParticleAt(paddle.body.right, ball.y);
        ball.setVelocityX(-ball.body.velocity.x);
      }
      ball.x = paddle.body.right + gameConfig.ballRadius;
    } else {
      if (ball.body.velocity.x > 0) {
        this.objects.effects.ballRightCollision.emitParticleAt(paddle.body.left, ball.y);
        ball.setVelocityX(-ball.body.velocity.x);
      }
      ball.x = paddle.body.left - gameConfig.ballRadius;
    }
  }

  ballPowerUpOverlap(ball, powerUp) {
    this.objects.effects.powerUpHit.emitParticleAt(powerUp.x, powerUp.y);

    switch (powerUp.type) {
      case PowerUps.types.X2:
        this.objects.balls.double(ball);
        break;

      case PowerUps.types.EXPAND:
        var targetPaddle = ball.fromPaddle;
        targetPaddle.notifyPowerUp(powerUp.type);

        targetPaddle.updateScaleX(gameConfig.paddleExpand);
        this.time.addEvent({
          delay: gameConfig.powerUpsDuration, callback: () => {
            targetPaddle.updateScaleX(-gameConfig.paddleExpand);
          }
        });
        break;

      case PowerUps.types.SHRINK:
        var targetPaddle = ball.fromPaddle;
        targetPaddle.notifyPowerUp(powerUp.type);

        targetPaddle.updateScaleX(gameConfig.paddleShrink);
        this.time.addEvent({
          delay: gameConfig.powerUpsDuration, callback: () => {
            targetPaddle.updateScaleX(-gameConfig.paddleShrink);
          }
        });
        break;
    }

    this.objects.powerUps.remove(powerUp);
  }

  getVelocityXY(angleDegree, velocity, toSideP1) {
    var velocityX = velocity * Math.cos(angleDegree * Math.PI / 180);
    var velocityY = Math.sqrt((velocity ** 2) - (velocityX ** 2));
    if (!toSideP1) {
      velocityY = -velocityY;
    }

    return [velocityX, velocityY];
  }
}
