class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    var ballGraphic = this.add.graphics(0, 0);
    ballGraphic.fillStyle(0xFFFFFF);
    ballGraphic.fillCircle(gameConfig.ballRadius, gameConfig.ballRadius, gameConfig.ballRadius);
    ballGraphic.generateTexture('ball', gameConfig.ballRadius * 2, gameConfig.ballRadius * 2)
    ballGraphic.destroy();

    this.load.image('play', 'assets/play.svg');
  }

  create() {
    var effects = new Effects(this);

    var firework = effects.createEmitter({
      frequency: -1,
      gravityY: 200,
      lifespan: {min: 2000, max: 3000},
      speed: {min: 0, max: 250},
      scale: 0.3,
      alpha: {start: 0.5, end: 0}
    });
    this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        firework.emitParticle((Math.random() * 300 + 100), Math.random() * gameConfig.width, Math.random() * gameConfig.height);
      }
    });

    var balls = [];
    for (let i = 0; i < 5; i++) {
      balls.push(this.physics.add.sprite(Math.random() * gameConfig.width, Math.random() * gameConfig.height, 'ball').setOrigin(0.5, 0.5).setCollideWorldBounds(true).setBounce(1, 1).setAlpha(0));
      balls[i].body.onWorldBounds = true;

      balls[i].trail = effects.createEmitter({
        on: false,
        follow: balls[i],
        lifespan: 200,
        scale: {start: 1, end: 0},
        alpha: {start: 0.2, end: 0}
      });

      balls[i].setVelocity((Math.random() * 400 + 100) * (Math.random() < 0.5 ? 1 : -1), (Math.random() * 400 + 100) * (Math.random() < 0.5 ? 1 : -1));
    }
    this.physics.add.collider(balls, balls, (ball1, ball2) => {
      effects.explodeBallCollisionEffect(ball1, ball2);
      effects.explodeBallCollisionEffect(ball2, ball1);
    });
    this.physics.world.on('worldbounds', (ball, up, down, left, right) => {
      if (up) {
        effects.ballUpCollision.emitParticleAt(ball.gameObject.x, 0);
      } else if (down) {
        effects.ballDownCollision.emitParticleAt(ball.gameObject.x, gameConfig.height);
      } else if (left) {
        effects.ballLeftCollision.emitParticleAt(0, ball.gameObject.y);
      } else if (right) {
        effects.ballRightCollision.emitParticleAt(gameConfig.width, ball.gameObject.y);
      }
    });

    this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0.3).setOrigin(0, 0)

    var title = this.add.text(gameConfig.centerX, 150, "PONG", {fontSize: 120, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setAlpha(0);
    var copyright = this.add.text(gameConfig.centerX, gameConfig.height - 50, "© 2019 #tung18tht", {fontSize: 20, color: '#FFFFFF'}).setOrigin(0.5, 0.5).setAlpha(0);

    var playButton = this.add.rectangle(gameConfig.centerX, gameConfig.centerY, 150, 150).setOrigin(0.5, 0.5).setStrokeStyle(10, 0xFFFFFF).setAlpha(0);
    var playIcon = this.add.image(gameConfig.centerX, gameConfig.centerY, 'play').setOrigin(0.5, 0.5).setDisplaySize(100, 100).setAlpha(0);

    playButton.on('pointerover', () => {playButton.setScale(1.1)});
    playButton.on('pointerout', () => {playButton.setScale(1)});
    playButton.once('pointerup', () => {
      this.tweens.add({
        targets: this.add.rectangle(0, 0, gameConfig.width, gameConfig.height, 0x000000, 0).setOrigin(0, 0),
        fillAlpha: 1,
        duration: 500,
        onComplete: () => {
          this.scene.start("GameScene");
        }
      });
    });

    this.tweens.add({
      targets: balls.concat([title, copyright, playButton, playIcon]),
      alpha: 1,
      duration: 500,
      onComplete: () => {
        playButton.setInteractive({useHandCursor: true});
        balls.forEach(ball => {ball.trail.start()});
      }
    });
  }
}
