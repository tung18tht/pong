class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "ball");

    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5).setCollideWorldBounds(true).setBounce(1, 1);
    this.body.onWorldBounds = true;

    this.trail = scene.objects.particles.createEmitter({
      follow: this,
      lifespan: 200,
      scale: {start: 1, end: 0},
      alpha: {start: 0.2, end: 0}
    });

    scene.physics.add.collider(this, scene.objects.paddle1, (ball, paddle) => {scene.ballPaddleCollide(ball, paddle)});
    scene.physics.add.collider(this, scene.objects.paddle2, (ball, paddle) => {scene.ballPaddleCollide(ball, paddle)});

    scene.physics.add.overlap(this, scene.objects.paddle1, (ball, paddle) => {scene.ballPaddleOverlap(ball, paddle)});
    scene.physics.add.overlap(this, scene.objects.paddle2, (ball, paddle) => {scene.ballPaddleOverlap(ball, paddle)});
  }
}
