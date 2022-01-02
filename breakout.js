let ball;
let paddle;
let bricks;
let scoreText;
let livesText;
let startSpeedX;
let startSpeedY;
let startButton;
let rotation;
let gameOverText;
let wonTheGameText;

let score = 0;
let lives = 3;


const textStyle = { 
    font: 'bold 2rem Arial', 
    fill: '#595757' 
};

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#F8D8CE',
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            checkCollision: {
                up: true,
                down: false,
                left: true,
                right: true
            }
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.svg('paddle', 'img/ball.svg');
    this.load.svg('brick', 'img/brick.svg');
    this.load.svg('destroyed', 'img/ball.svg');
    this.load.svg('ball', 'img/ball.svg');
    
    this.load.audio('hit', 'audio/test.wav');

    startSpeedX = -800;
    startSpeedY = -800;


}

function create() {
    paddle = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 150, 'paddle')
       .setImmovable();

    ball = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 400, 'ball')
        .setCollideWorldBounds(true)
        .setBounce(1);

    bricks = this.physics.add.staticGroup({
        key: 'brick',
        frameQuantity: 30,
        gridAlign: { width: 10, cellWidth: 180, cellHeight: 180, x: this.cameras.main.centerX - 780, y: 300 }
    });

    scoreText = this.add.text(20, 20, 'Score: 0', textStyle);
    livesText = this.add.text(this.game.config.width - 20, 20, 'Lives: '+lives, textStyle).setOrigin(1, 0);
    
    gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game over!', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111', fill: '#e74c3c' })
        .setVisible(false);

    wonTheGameText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'You won the game!', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111', fill: '#27ae60' })
        .setVisible(false);

    startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start game', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => startGame.call(this))
        .on('pointerover', () => startButton.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => startButton.setStyle({ fill: '#FFF' }));

    this.physics.add.collider(ball, bricks, brickHit, null, this);
    this.physics.add.collider(ball, paddle, paddleHit, null, this);
}

function update() {
    if (rotation) {
        ball.rotation = rotation === 'left' ?  ball.rotation - .05 : ball.rotation + .05;
    }

    if (ball.y > paddle.y) {
        lives--;

        if (lives > 0) {
            livesText.setText(`Lives: ${lives}`);

            ball.setPosition(this.cameras.main.centerX, this.game.config.height - 100)
                .setVelocity(startSpeedX + 500, startSpeedY + 500);
        } else {
            ball.destroy();

            gameOverText.setVisible(true);
        }
    }
}


function paddleHit(ball, paddle) {
    var diff = 0;

    if (ball.x < paddle.x) {
        diff = paddle.x - ball.x;
        ball.setVelocityX(-20 * diff);
        rotation = 'left';
    } else if (ball.x > paddle.x) {
        diff = ball.x - paddle.x;
        ball.setVelocityX(20 * diff);
        rotation = 'right';
    } else {
        ball.setVelocityX(2 + Math.random() * 10);
    }
}

function brickHit(ball, brick) {
    hit = this.sound.add("hit", { loop: false });
    hit.play();
    brick.setTexture('destroyed');
   
    score += 5;
    scoreText.setText(`Score: ${score}`);

    this.tweens.add({
        targets: brick,
        scaleX: 0,
        scaleY: 0,
        ease: 'Power1',
        duration: 500,
        delay: 250,
        angle: 180,
        onComplete: () => { 
            brick.destroy();

            if (bricks.countActive() === 0) {
                ball.destroy();

                wonTheGameText.setVisible(true);
            }
        }
    });
}

function startGame() {
    startButton.destroy();
    ball.setVelocity(startSpeedX, startSpeedY);
    rotation = 'left';

    this.input.on('pointermove', pointer => {
        paddle.x = Phaser.Math.Clamp(pointer.x, paddle.width / 2, this.game.config.width - paddle.width / 2);
    });
}