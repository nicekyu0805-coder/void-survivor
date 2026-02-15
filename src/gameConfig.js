import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        // 불변 변수만 여기에 유지
        this.player = null;
        this.cursors = null;
        this.scoreText = null;
    }

    preload() {
        // 임시 도트 이미지 생성 (나중에 실제 이미지로 교체 가능)
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/tinycar.png');
    }

    create() {
        // 매 판 시작 시 데이터 초기화
        this.score = 0;
        this.isGameOver = false;
        this.playerStats = {
            speed: 200,
            scale: 1,
            isInvincible: false
        };
        this.difficulty = {
            enemySpeed: 100,
            spawnRate: 1000
        };

        // 배경 설정
        this.cameras.main.setBackgroundColor('#000033');

        // 플레이어 생성
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        // 점수 텍스트
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

        // 입력 설정
        this.cursors = this.input.keyboard.createCursorKeys();

        // 적 그룹 및 충돌 설정
        this.enemies = this.physics.add.group();
        this.physics.add.overlap(this.player, this.enemies, this.handleGameOver, null, this);

        // 저장된 구매 내역 로드 및 적용
        this.loadPersistentRewards();

        // 타이머 및 이벤트 초기화
        this.initTimers();

        // 외부(React)로부터 보상 이벤트를 받기 위한 전역 리스너 등록
        window.applyGameReward = (rewardType) => {
            this.applyReward(rewardType);
        };
    }

    loadPersistentRewards() {
        const saved = localStorage.getItem('void_survivor_purchases');
        if (saved) {
            const purchases = JSON.parse(saved);
            purchases.forEach(itemKey => {
                this.applyReward(itemKey);
            });
        }
    }

    initTimers() {
        this.time.removeAllEvents();

        // 적 생성 타이머
        this.spawnTimer = this.time.addEvent({
            delay: this.difficulty.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // 점수 증가 타이머
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.score += 10;
                this.scoreText.setText('Score: ' + this.score);
                // 난이도 상승 (10초마다 적이 빨라짐)
                if (this.score % 100 === 0) {
                    this.increaseDifficulty();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    increaseDifficulty() {
        this.difficulty.enemySpeed += 10;
        this.difficulty.spawnRate = Math.max(300, this.difficulty.spawnRate - 50);

        // 비주얼 피드백: 화면 살짝 흔들림 및 짧은 플래시
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(500, 255, 0, 0, 0.1);

        // 스폰 타이머 업데이트
        this.spawnTimer.remove();
        this.spawnTimer = this.time.addEvent({
            delay: this.difficulty.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    applyReward(type) {
        if (!this.player) return;

        // 보상 획득 비주얼 피드백: 강한 플래시
        this.cameras.main.flash(1000, 0, 212, 255, 0.3);

        switch (type) {
            case 'SPEED_BOOST':
                this.playerStats.speed *= 1.5;
                this.player.setTint(0x00ff00); // 초록색 버프 표시
                break;
            case 'GOLDEN_HERO':
                this.playerStats.scale = 1.5;
                this.player.setScale(1.5);
                this.player.setTint(0xffff00); // 황금색 표시
                break;
            case 'RESURRECT':
                this.playerStats.isInvincible = true;
                this.player.setAlpha(0.5); // 유령 상태 표시
                this.time.delayedCall(5000, () => {
                    this.playerStats.isInvincible = false;
                    this.player.setAlpha(1);
                });
                break;
        }
    }

    update() {
        if (this.isGameOver) return;

        // 플레이어 이동 로직
        const speed = this.playerStats.speed;
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
        this.physics.moveToObject(enemy, this.player, this.difficulty.enemySpeed);
    }

    handleGameOver() {
        if (this.isGameOver || this.playerStats.isInvincible) return;
        this.isGameOver = true;

        this.physics.pause();
        this.player.setTint(0xff0000);

        // 점수 타이머를 포함한 모든 타이머 정지
        this.time.removeAllEvents();

        // 최고 기록 관리
        const savedHighScore = localStorage.getItem('void_survivor_highscore') || 0;
        let isNewRecord = false;
        if (this.score > savedHighScore) {
            localStorage.setItem('void_survivor_highscore', this.score);
            isNewRecord = true;
        }
        const currentHighScore = Math.max(this.score, savedHighScore);

        this.add.text(400, 250, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
        this.add.text(400, 330, 'Final Score: ' + this.score, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 380, (isNewRecord ? 'NEW RECORD: ' : 'Best Score: ') + currentHighScore, {
            fontSize: '28px',
            fill: isNewRecord ? '#ffd700' : '#888'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.isGameOver = false;
                this.scene.restart();
            },
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
