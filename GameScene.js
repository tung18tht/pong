class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    this.constants = {};
    this.constants.centerX = gameState.width / 2;
    this.constants.centerY = gameState.height / 2;
    this.constants.pointsToWin = 3;

    this.constants.paddleWidth = 120;
    this.constants.paddleHeight = 15;
    this.constants.paddleHalfWidth = this.constants.paddleWidth / 2;
    this.constants.paddleMinX = this.constants.paddleHalfWidth;
    this.constants.paddleMaxX = gameState.width - this.constants.paddleHalfWidth;
    this.constants.paddleYOffset = this.constants.paddleHeight * 3;
    this.constants.paddleStepPerMs = 1000 / 1000;
    this.constants.paddleMaxBounceAngleAdjust = 20;

    this.constants.ballRadius = 15;
    this.constants.ballBounce = 1.02;
    this.constants.ballInitialVelocity = 400;
    this.constants.ballMaxVelocity = 1000;
    this.constants.ballAngleLimit = 20;
    this.constants.ballPosMaxAngle = 180 - this.constants.ballAngleLimit;
    this.constants.ballPosMinAngle = this.constants.ballAngleLimit;
    this.constants.ballNegMaxAngle = - this.constants.ballPosMinAngle;
    this.constants.ballNegMinAngle = - this.constants.ballPosMaxAngle;
  }

  preload() {
    this.variables = {};
    this.variables.p1Score = 0;
    this.variables.p2Score = 0;
    this.variables.countdownNumber = 3;

    this.objects = {};

    var paddleGraphic = this.add.graphics(0, 0);
    paddleGraphic.fillStyle(0xFFFFFF);
    paddleGraphic.fillRect(0, 0, this.constants.paddleWidth, this.constants.paddleHeight);
    paddleGraphic.generateTexture('paddle', this.constants.paddleWidth, this.constants.paddleHeight)
    paddleGraphic.destroy();

    var ballGraphic = this.add.graphics(0, 0);
    ballGraphic.fillStyle(0xFFFFFF);
    ballGraphic.fillCircle(this.constants.ballRadius, this.constants.ballRadius, this.constants.ballRadius);
    ballGraphic.generateTexture('ball', this.constants.ballRadius * 2, this.constants.ballRadius * 2)
    ballGraphic.destroy();

    this.load.image('play', 'assets/play.png');
    this.load.image('quit', 'assets/quit.png');
    this.load.image('pause', 'assets/pause.png');
  }

  create() {
    this.add.rectangle(0, this.constants.centerY - 1, gameState.width, 2, 0x888888).setOrigin(0, 0);

    this.objects.p1ScoreText = this.add.text(this.constants.centerX, this.constants.centerY + 50, this.variables.p1Score, {fontSize: 80, color: '#AAAAAA'}).setOrigin(0.5, 0.5);
    this.objects.p2ScoreText = this.add.text(this.constants.centerX, this.constants.centerY - 50, this.variables.p2Score, {fontSize: 80, color: '#AAAAAA'}).setOrigin(0.5, 0.5).setFlip(true, true);

    this.objects.paddle1 = this.physics.add.sprite(this.constants.centerX, gameState.height - this.constants.paddleYOffset, 'paddle').setOrigin(0.5, 0.5).setCollideWorldBounds(true).setImmovable(true);
    this.objects.paddle2 = this.physics.add.sprite(this.constants.centerX, this.constants.paddleYOffset, 'paddle').setOrigin(0.5, 0.5).setCollideWorldBounds(true).setImmovable(true);

    this.objects.particles = this.add.particles('ball');

    this.objects.paddle1.trail = this.objects.particles.createEmitter({
      follow: this.objects.paddle1,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: {min: 30, max: 150},
      alpha: {start: 0.5, end: 0},
      emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Line(-this.constants.paddleHalfWidth * 0.8, 0, this.constants.paddleHalfWidth * 0.8, 0))
    });

    this.objects.paddle2.trail = this.objects.particles.createEmitter({
      follow: this.objects.paddle2,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: {min: 210, max: 330},
      alpha: {start: 0.5, end: 0},
      emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Line(-this.constants.paddleHalfWidth * 0.8, 0, this.constants.paddleHalfWidth * 0.8, 0))
    });

    this.objects.paddle1.ballCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: -160, max: -20},
      alpha: {start: 0.5, end: 0}
    });

    this.objects.paddle2.ballCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: 20, max: 160},
      alpha: {start: 0.5, end: 0}
    });

    this.objects.worldLeftCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: -70, max: 70},
      alpha: {start: 0.5, end: 0}
    });

    this.objects.worldRightCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 200, max: 300},
      speed: {min: 200, max: 300},
      scale: 0.2,
      angle: {min: 110, max: 250},
      alpha: {start: 0.5, end: 0}
    });

    this.objects.worldUpCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 450, max: 550},
      speed: {min: 450, max: 550},
      scale: 0.5,
      alpha: {start: 0.5, end: 0}
    });

    this.objects.worldDownCollisionEffect = this.objects.particles.createEmitter({
      on: false,
      lifespan: {min: 450, max: 550},
      speed: {min: 450, max: 550},
      scale: 0.5,
      alpha: {start: 0.5, end: 0}
    });

    this.objects.ball = new Ball(this, this.constants.centerX, this.constants.centerY);

    this.physics.world.on('worldbounds', (ball, up, down, left, right) => {this.ballWorldCollide(ball, up, down, left, right)});

    this.objects.countdownBackground = this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000, 0.7).setOrigin(0, 0);
    this.objects.countdownP1 = this.add.text(this.constants.centerX, this.constants.centerY * 1.5, this.variables.countdownNumber, {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5);
    this.objects.countdownP2 = this.add.text(this.constants.centerX, this.constants.centerY * 0.5, this.variables.countdownNumber, {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setFlip(true, true);

    this.objects.pauseButton = this.add.rectangle(gameState.width - 50, this.constants.centerY, 50, 50).setOrigin(0.5, 0.5).setStrokeStyle(2, 0xFFFFFF).setInteractive();
    this.objects.pauseIcon = this.add.image(gameState.width - 50, this.constants.centerY, 'pause').setOrigin(0.5, 0.5).setDisplaySize(40, 40);

    this.objects.pauseButton.on('pointerover', () => {this.objects.pauseButton.setScale(1.1)});
    this.objects.pauseButton.on('pointerout', () => {this.objects.pauseButton.setScale(1)});
    this.objects.pauseButton.on('pointerup', () => {
      this.objects.pauseButton.disableInteractive();
      this.pause();
    });

    this.objects.pauseBackgound = this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000).setOrigin(0, 0).setAlpha(0);
    this.objects.pauseTextP1 = this.add.text(this.constants.centerX, this.constants.centerY * 1.5, "paused", { fontSize: 40, color: '#FFFFFF' }).setOrigin(0.5, 0.5).setAlpha(0);
    this.objects.pauseTextP2 = this.add.text(this.constants.centerX, this.constants.centerY * 0.5, "paused", { fontSize: 40, color: '#FFFFFF' }).setOrigin(0.5, 0.5).setFlip(true, true).setAlpha(0);
    this.objects.continueButton = this.add.rectangle(this.constants.centerX - 90, this.constants.centerY, 120, 120).setOrigin(0.5, 0.5).setStrokeStyle(8, 0xFFFFFF).setInteractive().disableInteractive().setAlpha(0);
    this.objects.continueIcon = this.add.image(this.constants.centerX - 90, this.constants.centerY, 'play').setOrigin(0.5, 0.5).setDisplaySize(80, 80).setAlpha(0);
    this.objects.quitButton = this.add.rectangle(this.constants.centerX + 90, this.constants.centerY, 120, 120).setOrigin(0.5, 0.5).setStrokeStyle(8, 0xFFFFFF).setInteractive().disableInteractive().setAlpha(0);
    this.objects.quitIcon = this.add.image(this.constants.centerX + 90, this.constants.centerY, 'quit').setOrigin(0.5, 0.5).setDisplaySize(80, 80).setAlpha(0);

    this.objects.continueButton.on('pointerover', () => {this.objects.continueButton.setScale(1.1)});
    this.objects.continueButton.on('pointerout', () => {this.objects.continueButton.setScale(1)});
    this.objects.continueButton.on('pointerup', () => {this.continue()});

    this.objects.quitButton.on('pointerover', () => { this.objects.quitButton.setScale(1.1) });
    this.objects.quitButton.on('pointerout', () => { this.objects.quitButton.setScale(1) });
    this.objects.quitButton.on('pointerup', () => {this.quit()});

    this.startNewRound(Math.random() < 0.5);
  }

  pause() {
    this.endRound();

    this.tweens.add({
      targets: [this.objects.pauseBackgound, this.objects.pauseTextP1, this.objects.pauseTextP2, this.objects.continueButton, this.objects.continueIcon, this.objects.quitButton, this.objects.quitIcon],
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.objects.continueButton.setInteractive();
        this.objects.quitButton.setInteractive();
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
        this.startNewRound(this.objects.ball.body.velocity.y > 0);
      }
    });
  }

  quit() {
    this.objects.continueButton.disableInteractive();
    this.objects.quitButton.disableInteractive();

    this.tweens.add({
      targets: this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000, 0).setOrigin(0, 0),
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

    this.controlPaddle(this.objects.paddle1, this.input.x, delta);
    this.controlPaddle(this.objects.paddle2, this.objects.ball.x, delta);
  }

  controlPaddle(paddle, targetX, delta) {
    var diff = paddle.x - targetX;
    var step = this.constants.paddleStepPerMs * delta;
    if (diff < -step) {
      paddle.x += step;
    } else if (diff > step) {
      paddle.x -= step;
    } else {
      paddle.x = targetX;
    }

    if (paddle.x > this.constants.paddleMaxX) {
      paddle.x = this.constants.paddleMaxX;
    } else if (paddle.x < this.constants.paddleMinX) {
      paddle.x = this.constants.paddleMinX;
    }
  }

  startNewRound(toSideP1) {
    this.physics.pause();

    this.objects.ball.setAlpha(0);
    this.objects.paddle1.setAlpha(0);
    this.objects.paddle2.setAlpha(0);

    this.objects.ball.setPosition(this.constants.centerX, this.constants.centerY);
    this.objects.paddle1.setPosition(this.constants.centerX, gameState.height);
    this.objects.paddle2.setPosition(this.constants.centerX, 0);

    this.objects.ball.trail.stop();
    this.objects.paddle1.trail.stop();
    this.objects.paddle2.trail.stop();

    this.objects.paddle1.setScale(1, 0);
    this.objects.paddle2.setScale(1, 0);

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
      onComplete: () => {this.objects.pauseButton.setInteractive()}
    });

    this.tweens.add({
      targets: [this.objects.countdownBackground, this.objects.countdownP1, this.objects.countdownP2, this.objects.pauseIcon, this.objects.pauseButton],
      alpha: 0,
      duration: 500,
      delay: 2500,
      onStart: () => {this.objects.pauseButton.disableInteractive()},
      onComplete: () => {this.physics.resume()}
    });

    this.time.addEvent({
      delay: 1000, repeat: 1, callback: () => {
        this.objects.countdownP1.setText(--this.variables.countdownNumber);
        this.objects.countdownP2.setText(this.variables.countdownNumber);
      }
    });

    this.tweens.add({
      targets: [this.objects.ball, this.objects.paddle1, this.objects.paddle2],
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.objects.ball.trail.start();
        this.objects.paddle1.trail.start();
        this.objects.paddle2.trail.start();
      }
    });

    this.tweens.add({
      targets: [this.objects.paddle1, this.objects.paddle2],
      scaleY: 1,
      duration: 500
    });

    this.tweens.add({
      targets: this.objects.paddle1,
      y: gameState.height - this.constants.paddleYOffset,
      duration: 1000,
      ease: "Back",
      easeParams: [3]
    });

    this.tweens.add({
      targets: this.objects.paddle2,
      y: this.constants.paddleYOffset,
      duration: 1000,
      ease: "Back",
      easeParams: [3]
    });

    this.tweens.add({
      targets: this.objects.ball,
      y: this.constants.centerY + (toSideP1 ? this.constants.ballRadius : -this.constants.ballRadius) * 5,
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
    var [velocityX, velocityY] = this.getVelocityXY(ballInitialAngle, this.constants.ballInitialVelocity, toSideP1);
    this.objects.ball.setVelocity(velocityX, velocityY);
  }

  endRound() {
    this.physics.pause();
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.objects.ball.trail.stop();
    this.objects.paddle1.trail.stop();
    this.objects.paddle2.trail.stop();

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 1,
      duration: 500
    });

    this.tweens.add({
      targets: [this.objects.paddle1, this.objects.paddle2],
      scaleY: 0,
      duration: 500,
      delay: 500
    });

    this.tweens.add({
      targets: [this.objects.ball, this.objects.paddle1, this.objects.paddle2],
      alpha: 0,
      duration: 500,
      delay: 500,
      onComplete: () => {this.events.emit("roundEnded")}
    });
  }

  endMatch(p1Win) {
    this.physics.pause();
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.objects.ball.trail.stop();
    this.objects.paddle1.trail.stop();
    this.objects.paddle2.trail.stop();

    this.objects.p1ScoreText.setDepth(1);
    this.objects.p2ScoreText.setDepth(1);

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 1,
      duration: 500
    });

    this.tweens.add({
      targets: [this.objects.ball, p1Win ? this.objects.paddle2 : this.objects.paddle1],
      alpha: 0,
      duration: 500,
      delay: 500
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddle2 : this.objects.paddle1,
      scaleY: 0,
      duration: 500,
      delay: 500
    });

    this.objects.resultBackground = this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000, 0.7).setOrigin(0, 0).setAlpha(0);
    this.objects.p1Result = this.add.text(this.constants.centerX, this.constants.centerY * 1.5, p1Win ? "Win" : "Lose", {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setAlpha(0);
    this.objects.p2Result = this.add.text(this.constants.centerX, this.constants.centerY * 0.5, p1Win ? "Lose" : "Win", {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setFlip(true, true).setAlpha(0);

    this.objects.endMatchButton = this.add.rectangle(gameState.width - 50, this.constants.centerY, 50, 50).setOrigin(0.5, 0.5).setStrokeStyle(2, 0xFFFFFF).setInteractive().disableInteractive().setAlpha(0);
    this.objects.endMatchIcon = this.add.image(gameState.width - 50, this.constants.centerY, 'quit').setOrigin(0.5, 0.5).setDisplaySize(40, 40).setAlpha(0);

    this.objects.endMatchButton.on('pointerover', () => { this.objects.endMatchButton.setScale(1.1) });
    this.objects.endMatchButton.on('pointerout', () => { this.objects.endMatchButton.setScale(1) });
    this.objects.endMatchButton.once('pointerup', () => {
      this.tweens.add({
        targets: this.add.rectangle(0, 0, gameState.width, gameState.height, 0x000000, 0).setOrigin(0, 0).setDepth(2),
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
      onComplete: () => {this.objects.endMatchButton.setInteractive()}
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddle1 : this.objects.paddle2,
      x: this.constants.centerX,
      y: this.constants.centerY,
      scaleX: 2,
      scaleY: 2,
      duration: 1000,
      delay: 1000,
      onComplete: () => {
        this.objects.particles.createEmitter({
          x: this.constants.centerX,
          y: this.constants.centerY,
          lifespan: {min: 1000, max: 2000},
          speed: {min: 200, max: 400},
          quantity: 3,
          scale: 0.5,
          alpha: {start: 1, end: 0}
        });
      }
    });

    this.tweens.add({
      targets: p1Win ? this.objects.paddle1 : this.objects.paddle2,
      angle: 360,
      repeat: -1,
      duration: 1000,
      delay: 1000
    });
  }

  ballWorldCollide(ball, up, down, left, right) {
    var lastPoint = false;

    if (up) {
      this.objects.worldUpCollisionEffect.explode(1000, ball.x, ball.y);
      this.objects.p1ScoreText.setText(++this.variables.p1Score);
      lastPoint = this.variables.p1Score == this.constants.pointsToWin;
    } else if (down) {
      this.objects.worldDownCollisionEffect.explode(1000, ball.x, ball.y);
      this.objects.p2ScoreText.setText(++this.variables.p2Score);
      lastPoint = this.variables.p2Score == this.constants.pointsToWin;
    } else if (left) {
      this.objects.worldLeftCollisionEffect.explode(10, 0, ball.y);
    } else if (right) {
      this.objects.worldRightCollisionEffect.explode(10, gameState.width, ball.y);
    }

    if (up || down) {
      if (lastPoint) {
        this.endMatch(up);
      } else {
        this.endRound();
        this.events.once("roundEnded", () => {this.startNewRound(down)});
      }
    }
  }

  ballPaddleCollide(ball, paddle) {
    if (ball.body.touching.left) {
      this.objects.worldLeftCollisionEffect.explode(10, paddle.x + this.constants.paddleHalfWidth, ball.y);
      return;
    } else if (ball.body.touching.right) {
      this.objects.worldRightCollisionEffect.explode(10, paddle.x - this.constants.paddleHalfWidth, ball.y);
      return;
    }

    paddle.ballCollisionEffect.explode(10, ball.x, paddle.y);

    var [angle, velocity] = this.getAngleVelocity(ball.body.velocity.x, ball.body.velocity.y);

    var diffRatio = (ball.x - paddle.x) / this.constants.paddleHalfWidth;
    var angleAdjust = diffRatio * this.constants.paddleMaxBounceAngleAdjust;

    //  1. /^ R: - L: +
    //  2. ^\ R: - L: +
    //  3. \v R: + L: -
    //  4. v/ R: + L: -

    var newAngle = -angle;
    if (newAngle > 0) {
      newAngle -= angleAdjust;

      if (newAngle > this.constants.ballPosMaxAngle) {
        newAngle = this.constants.ballPosMaxAngle;
      } else if (newAngle < this.constants.ballPosMinAngle) {
        newAngle = this.constants.ballPosMinAngle;
      }
    } else {
      newAngle += angleAdjust;

      if (newAngle > this.constants.ballNegMaxAngle) {
        newAngle = this.constants.ballNegMaxAngle;
      } else if (newAngle < this.constants.ballNegMinAngle) {
        newAngle = this.constants.ballNegMinAngle;
      }
    }

    var newVelocity = velocity * this.constants.ballBounce;
    if (newVelocity > this.constants.ballMaxVelocity) {
      newVelocity = this.constants.ballMaxVelocity;
    }

    var [velocityX, velocityY] = this.getVelocityXY(Math.abs(newAngle), newVelocity, newAngle < 0);
    ball.setVelocity(velocityX, velocityY);
  }

  ballPaddleOverlap(ball, paddle) {
    if (ball.x > paddle.x) {
      if (ball.body.velocity.x < 0) {
        this.objects.worldLeftCollisionEffect.explode(10, paddle.x + this.constants.paddleHalfWidth, ball.y);
        ball.setVelocityX(-ball.body.velocity.x);
      }
      ball.x = paddle.x + this.constants.paddleHalfWidth + this.constants.ballRadius;
    } else {
      if (ball.body.velocity.x > 0) {
        this.objects.worldRightCollisionEffect.explode(10, paddle.x - this.constants.paddleHalfWidth, ball.y);
        ball.setVelocityX(-ball.body.velocity.x);
      }
      ball.x = paddle.x - this.constants.paddleHalfWidth - this.constants.ballRadius;
    }
  }

  getAngleVelocity(velocityX, velocityY) {
    var velocity = Math.sqrt((velocityX ** 2) + (velocityY ** 2));
    var angle = Math.atan2(velocityY, velocityX) * 180 / Math.PI;

    return [angle, velocity];
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
