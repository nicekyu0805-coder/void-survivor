import Phaser from 'phaser';

// 전역 변수 공유를 위한 간단한 객체 (Scene 간 통신용)
const GameState = {
    joystickData: { x: 0, y: 0, isDown: false, angle: 0 },
    speed: 200,
    weaponLevel: 1,
    canShoot: false,
    score: 0,
    isGameOver: false
};

class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
        this.joystickBase = null;
        this.joystickStick = null;
        this.joystickActive = false;
        this.joystickX = 0;
        this.joystickY = 0;
    }

    create() {
        const { width, height } = this.scale;

        // 1. 가상 조이스틱 생성
        this.joystickX = width * 0.2;
        this.joystickY = height * 0.75;

        this.joystickBase = this.add.graphics();
        this.joystickBase.fillStyle(0xff00ff, 0.2).fillCircle(0, 0, 80);
        this.joystickBase.lineStyle(4, 0x00ff00, 0.8).strokeCircle(0, 0, 80);

        this.joystickStick = this.add.graphics();
        this.joystickStick.fillStyle(0x00ff00, 0.9).fillCircle(0, 0, 40);

        this.joystickBase.setPosition(this.joystickX, this.joystickY);
        this.joystickStick.setPosition(this.joystickX, this.joystickY);
        this.joystickBase.setDepth(100);
        this.joystickStick.setDepth(101);

        // 2. 전체 화면 버튼
        const fsButton = this.add.text(width - 20, 20, ' [ FULLSCREEN MODE ] ', {
            fontSize: '32px',
            fill: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 15, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

        fsButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                fsButton.setText(' [ FULLSCREEN MODE ] ');
            } else {
                this.scale.startFullscreen();
                fsButton.setText(' [ EXIT FULLSCREEN ] ');
            }
        });

        // 3. 배포 확인용 버전 텍스트 (눈에 확 띄게)
        this.add.text(width / 2, 50, 'V2.2 - EMERGENCY UI FIX', {
            fontSize: '24px',
            fill: '#ff0000',
            backgroundColor: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 4. 점수 표시
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });

        // 입력 리스너 (조이스틱용)
        this.input.on('pointerdown', (pointer) => {
            const dist = Phaser.Math.Distance.Between(this.joystickX, this.joystickY, pointer.x, pointer.y);
            if (dist < 120) {
                this.joystickActive = true;
            }
        });

        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickStick.setPosition(this.joystickX, this.joystickY);
            GameState.joystickData.isDown = false;
        });
    }

    update() {
        const pointer = this.input.activePointer;
        if (this.joystickActive && pointer.isDown) {
            const dist = Phaser.Math.Distance.Between(this.joystickX, this.joystickY, pointer.x, pointer.y);
            const angle = Phaser.Math.Angle.Between(this.joystickX, this.joystickY, pointer.x, pointer.y);

            const maxDist = 80;
            const finalDist = Math.min(dist, maxDist);

            const stickX = this.joystickX + Math.cos(angle) * finalDist;
            const stickY = this.joystickY + Math.sin(angle) * finalDist;
            this.joystickStick.setPosition(stickX, stickY);

            GameState.joystickData.isDown = true;
            GameState.joystickData.angle = angle;
        }

        this.scoreText.setText('Score: ' + GameState.score);
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/tinycar.png');
        this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet5.png');
    }

    create() {
        // 비주얼적으로 바뀐거 티나게 배경색 변경
        this.cameras.main.setBackgroundColor('#1a0033');

        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();

        this.physics.add.overlap(this.player, this.enemies, this.handleGameOver, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

        GameState.score = 0;
        GameState.isGameOver = false;

        // 타이머 설정
        this.initGameLogic();

        // UI 씬 실행 (위에 덮음)
        this.scene.launch('UIScene');

        // 외부(React) 연동
        window.applyGameReward = (type) => this.applyReward(type);
        this.loadPersistentRewards();
    }

    loadPersistentRewards() {
        const saved = localStorage.getItem('void_survivor_purchases');
        if (saved) {
            const purchases = JSON.parse(saved);
            purchases.forEach(itemKey => this.applyReward(itemKey));
        }
    }

    applyReward(type) {
        if (!this.player) return;
        this.cameras.main.flash(500, 0, 255, 255, 0.3);
        switch (type) {
            case 'SPEED_BOOST': GameState.speed *= 1.5; GameState.canShoot = true; this.player.setTint(0x00ff00); break;
            case 'GOLDEN_HERO': GameState.weaponLevel = 2; GameState.canShoot = true; this.player.setScale(1.5).setTint(0xffff00); break;
            case 'RESURRECT': this.player.setAlpha(0.5); this.time.delayedCall(5000, () => this.player.setAlpha(1)); break;
        }
    }

    initGameLogic() {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (GameState.isGameOver) return;
                GameState.score += 10;
                if (GameState.canShoot) this.shoot();
            },
            loop: true
        });

        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: () => this.spawnEnemy(),
            loop: true
        });
    }

    shoot() {
        const closest = this.getClosestEnemy();
        if (!closest) return;
        const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closest.x, closest.y);
        this.physics.velocityFromRotation(angle, 500, bullet.body.velocity);
        this.time.delayedCall(2000, () => bullet.active && bullet.destroy());
    }

    getClosestEnemy() {
        let min = Infinity, closest = null;
        this.enemies.getChildren().forEach(e => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
            if (d < min) { min = d; closest = e; }
        });
        return closest;
    }

    spawnEnemy() {
        if (GameState.isGameOver) return;
        const x = Phaser.Math.Between(0, 800), y = Phaser.Math.Between(0, 600);
        if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 200) return;
        const enemy = this.enemies.create(x, y, 'enemy');
        this.physics.moveToObject(enemy, this.player, 100 + (GameState.score / 10));
    }

    hitEnemy(bullet, enemy) {
        if (bullet) bullet.destroy();
        enemy.destroy();
        GameState.score += 50;
    }

    handleGameOver() {
        if (GameState.isGameOver) return;
        GameState.isGameOver = true;
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5).setDepth(200);

        setTimeout(() => {
            this.scene.stop('UIScene');
            this.scene.restart();
        }, 3000);
    }

    update() {
        if (GameState.isGameOver) return;
        this.player.setVelocity(0);

        // 조이스틱 입력 처리
        if (GameState.joystickData.isDown) {
            const angle = GameState.joystickData.angle;
            this.player.setVelocity(Math.cos(angle) * GameState.speed, Math.sin(angle) * GameState.speed);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    parent: 'game-container',
    scene: [GameScene, UIScene]
};

export default config;
