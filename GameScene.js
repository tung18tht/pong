class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    this.constants = {};
    this.constants.centerX = gameState.width / 2;
    this.constants.centerY = gameState.height / 2;

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

    this.variables = {};
    this.variables.p1Score = 0;
    this.variables.p2Score = 0;
    this.variables.countdownNumber = 3;

    this.objects = {};
  }

  preload() {
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

    this.objects.p1ScoreText = this.add.text(this.constants.centerX, this.constants.centerY + 50, this.variables.p1Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5);
    this.objects.p2ScoreText = this.add.text(this.constants.centerX, this.constants.centerY - 50, this.variables.p2Score, {fontSize: 80, color: '#888888'}).setOrigin(0.5, 0.5).setFlip(true, true);

    this.objects.paddle1 = this.physics.add.sprite(this.constants.centerX, gameState.height - this.constants.paddleYOffset, 'paddle').setOrigin(0.5, 0.5);
    this.objects.paddle2 = this.physics.add.sprite(this.constants.centerX, this.constants.paddleYOffset, 'paddle').setOrigin(0.5, 0.5);

    this.objects.paddle1.setCollideWorldBounds(true);
    this.objects.paddle2.setCollideWorldBounds(true);

    this.objects.paddle1.setImmovable(true);
    this.objects.paddle2.setImmovable(true);

    this.objects.ball = this.physics.add.sprite(this.constants.centerX, this.constants.centerY, 'ball').setOrigin(0.5, 0.5);
    this.objects.ball.setBounce(1, 1);

    this.physics.add.collider(this.objects.ball, this.objects.paddle1, (ball, paddle) => {this.ballPaddleCollide(ball, paddle)});
    this.physics.add.collider(this.objects.ball, this.objects.paddle2, (ball, paddle) => {this.ballPaddleCollide(ball, paddle)});

    this.objects.ball.setCollideWorldBounds(true);
    this.objects.ball.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', (ball, up, down, left, right) => {this.ballWorldCollide(ball, up, down, left, right)});

    this.objects.particles = this.add.particles('ball');

    this.objects.ball.emitters = this.objects.particles.createEmitter({
      follow: this.objects.ball,
      lifespan: 200,
      scale: {start: 1, end: 0},
      alpha: {start: 0.2, end: 0}
    });

    this.objects.paddle1.emitters = this.objects.particles.createEmitter({
      follow: this.objects.paddle1,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: {min: 30, max: 150},
      alpha: {start: 0.5, end: 0},
      emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Line(-this.constants.paddleHalfWidth * 0.8, 0, this.constants.paddleHalfWidth * 0.8, 0))
    });

    this.objects.paddle2.emitters = this.objects.particles.createEmitter({
      follow: this.objects.paddle2,
      lifespan: {min: 400, max: 600},
      speed: {min: 40, max: 60},
      scale: 0.3,
      angle: {min: 210, max: 330},
      alpha: {start: 0.5, end: 0},
      emitZone: new Phaser.GameObjects.Particles.Zones.RandomZone(new Phaser.Geom.Line(-this.constants.paddleHalfWidth * 0.8, 0, this.constants.paddleHalfWidth * 0.8, 0))
    });

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

    this.objects.ball.emitters.stop();
    this.objects.paddle1.emitters.stop();
    this.objects.paddle2.emitters.stop();

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
        this.objects.ball.emitters.start();
        this.objects.paddle1.emitters.start();
        this.objects.paddle2.emitters.start();
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

    this.tweens.add({
      targets: [this.objects.ball, this.objects.paddle1, this.objects.paddle2],
      alpha: 0,
      duration: 500,
      delay: 500
    });

    this.tweens.add({
      targets: [this.objects.paddle1, this.objects.paddle2],
      scaleY: 0,
      duration: 500,
      delay: 500
    });

    this.tweens.add({
      targets: [this.objects.p1ScoreText, this.objects.p2ScoreText],
      alpha: 1,
      duration: 500
    });

    this.objects.ball.emitters.stop();
    this.objects.paddle1.emitters.stop();
    this.objects.paddle2.emitters.stop();
  }

  ballWorldCollide(ball, up, down, left, right) {
    if (up) {
      this.objects.p1ScoreText.setText(++this.variables.p1Score);
      this.endRound();
      this.time.addEvent({delay: 1000, callback: () => {this.startNewRound(false)}});
    } else if (down) {
      this.objects.p2ScoreText.setText(++this.variables.p2Score);
      this.endRound();
      this.time.addEvent({delay: 1000, callback: () => {this.startNewRound(true)}});
    }
  }

  ballPaddleCollide(ball, paddle) {
    if (ball.body.touching.left || ball.body.touching.right) {
      return;
    }

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
