import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = null;
    }

    preload() {
        // 임시 도트 이미지 생성 (나중에 실제 이미지로 교체 가능)
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/tinycar.png');
    }

    create() {
        // 배경 설정
        this.cameras.main.setBackgroundColor('#000033');

        // 플레이어 생성
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        // 점수 텍스트
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

        // 입력 설정
        this.cursors = this.input.keyboard.createCursorKeys();

        // 적 생성 타이머
        this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // 충돌 설정 (임시 그룹)
        this.enemies = this.physics.add.group();
        this.physics.add.overlap(this.player, this.enemies, this.handleGameOver, null, this);
    }

    update() {
        // 플레이어 이동 로직
        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
        }
    }

    spawnEnemy() {
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(0, 600);
        
        // 플레이어와 너무 가까운 곳에는 생성 안함
        if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200) return;

        const enemy = this.enemies.create(x, y, 'enemy');
        this.physics.moveToObject(enemy, this.player, 100);
    }

    handleGameOver() {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
        this.time.addEvent({
            delay: 2000,
            callback: () => this.scene.restart(),
            loop: false
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    parent: 'game-container',
    scene: MainScene
};

export default config;
