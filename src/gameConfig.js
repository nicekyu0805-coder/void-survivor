import Phaser from 'phaser';

// 전역 변수 공유를 위한 간단한 객체 (Scene 간 통신용)
const GameState = {
    joystickData: { x: 0, y: 0, isDown: false, angle: 0 },
    joystickPos: null, // 저장된 위치 {x, y}
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

        // 1. 가상 조이스틱 생성 (저장된 위치가 있으면 불러오고 없으면 기본값)
        const savedPos = localStorage.getItem('joystick_position');
        if (savedPos) {
            const pos = JSON.parse(savedPos);
            this.joystickX = pos.x;
            this.joystickY = pos.y;
        } else {
            this.joystickX = width * 0.2;
            this.joystickY = height * 0.75;
        }

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
        const fsButton = this.add.text(width - 20, 20, ' [ FULLSCREEN ] ', {
            fontSize: '28px',
            fill: '#00ff00',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 15, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(1000);

        fsButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                fsButton.setText(' [ FULLSCREEN ] ');
            } else {
                this.scale.startFullscreen();
                fsButton.setText(' [ EXIT FS ] ');
            }
        });

        // 3. 최신 버전 표시 (v3.2)
        this.versionText = this.add.text(width / 2, height - 30, 'v3.2 - Smart Control Active', {
            fontSize: '18px',
            fill: '#ffd700',
            fontStyle: 'bold',
            backgroundColor: '#000'
        }).setOrigin(0.5).setDepth(1000);
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });

        // 조작 변수 초기화
        this.isRepositioning = false;
        this.pressDuration = 0;
        this.activePointer = null;

        // 롱프레스 충전용 그래픽
        this.chargeRing = this.add.graphics().setDepth(199);

        this.input.on('pointerdown', (pointer) => {
            const dist = Phaser.Math.Distance.Between(this.joystickX, this.joystickY, pointer.x, pointer.y);

            // 조이스틱 본체 또는 근처를 터치했을 때 추적 시작
            // v3.0 배지 (제거)

            if (dist < 120) {
                this.activePointer = pointer;
                this.pressDuration = 0;
                this.joystickActive = true;
            } else if (pointer.x < width * 0.4) {
                // 빈 공간 터치 시 즉시 이동 (v2.5 기능 유지)
                this.joystickX = pointer.x;
                this.joystickY = pointer.y;
                this.joystickBase.setPosition(this.joystickX, this.joystickY);
                this.joystickStick.setPosition(this.joystickX, this.joystickY);
                this.activePointer = pointer;
                this.joystickActive = true;
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.activePointer === pointer) {
                // 조이스틱 위치가 바뀌었다면 로컬 저장소에 저장
                if (this.isRepositioning) {
                    localStorage.setItem('joystick_position', JSON.stringify({ x: this.joystickX, y: this.joystickY }));
                    console.log("Saved Joystick Position:", this.joystickX, this.joystickY);
                }

                this.isRepositioning = false;
                this.joystickActive = false;
                this.activePointer = null;
                this.pressDuration = 0;
                this.chargeRing.clear();

                // 원래 상태로 복원
                this.joystickBase.clear();
                this.joystickBase.fillStyle(0xff00ff, 0.2).fillCircle(0, 0, 80);
                this.joystickBase.lineStyle(4, 0x00ff00, 0.8).strokeCircle(0, 0, 80);
                this.joystickBase.setScale(1).setAlpha(0.6);

                this.joystickStick.setScale(1).setAlpha(0.8);
                this.joystickStick.setPosition(this.joystickX, this.joystickY);

                GameState.joystickData.isDown = false;
                GameState.joystickData.force = 0;
            }
        });
    }

    update(time, delta) {
        // UI 텍스트들은 항상 업데이트 (포인터 상태 무관)
        this.scoreText.setText('Score: ' + GameState.score);

        if (!this.activePointer || !this.activePointer.isDown) {
            this.chargeRing.clear();
            this.pressDuration = 0;
            return;
        }

        // [v3.2 핵심] 조작(드래그) 중인지 확인 (중심에서 30px 이상인지)
        const distFromCenter = Phaser.Math.Distance.Between(this.joystickX, this.joystickY, this.activePointer.x, this.activePointer.y);
        const isDraggingForMovement = distFromCenter > 30;

        // 롱프레스 시간 측정 및 충전 효과 (제자리에 가만히 있을 때만 작동)
        if (this.joystickActive && !this.isRepositioning && !isDraggingForMovement) {
            this.pressDuration += delta;

            // 충전 링 그리기
            const progress = Math.min(this.pressDuration / 600, 1);
            this.chargeRing.clear();
            this.chargeRing.lineStyle(6, 0xffffff, 0.8);
            this.chargeRing.beginPath();
            this.chargeRing.arc(this.joystickX, this.joystickY, 95, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * progress));
            this.chargeRing.strokePath();

            if (this.pressDuration > 600) { // 0.6초간 제자리에 유지 시 편집 모드 진입
                this.isRepositioning = true;
                this.chargeRing.clear();
                this.joystickBase.clear();
                this.joystickBase.fillStyle(0xffffff, 0.5).fillCircle(0, 0, 100);
                this.joystickBase.lineStyle(6, 0xffd700, 1).strokeCircle(0, 0, 100);
                this.joystickStick.setScale(1.5).setAlpha(1);

                if (window.navigator.vibrate) window.navigator.vibrate(100);
                console.log("Joystick Edit Mode Active (Stationary Success)");
            }
        } else if (isDraggingForMovement && !this.isRepositioning) {
            // 조작 중에는 타이머 리셋 및 링 제거
            this.pressDuration = 0;
            this.chargeRing.clear();
        }

        if (this.isRepositioning) {
            // 위치 조정 모드: 조이스틱 본체가 손가락을 따라감
            this.joystickX = this.activePointer.x;
            this.joystickY = this.activePointer.y;
            this.joystickBase.setPosition(this.joystickX, this.joystickY);
            this.joystickStick.setPosition(this.joystickX, this.joystickY);
            GameState.joystickData.isDown = false; // 이동 중에는 캐릭터 정지
        } else if (this.joystickActive) {
            // 일반 조작 모드
            const dist = Phaser.Math.Distance.Between(this.joystickX, this.joystickY, this.activePointer.x, this.activePointer.y);
            const angle = Phaser.Math.Angle.Between(this.joystickX, this.joystickY, this.activePointer.x, this.activePointer.y);

            const maxDist = 80;
            const finalDist = Math.min(dist, maxDist);

            const stickX = this.joystickX + Math.cos(angle) * finalDist;
            const stickY = this.joystickY + Math.sin(angle) * finalDist;
            this.joystickStick.setPosition(stickX, stickY);

            GameState.joystickData.isDown = true;
            GameState.joystickData.angle = angle;
            GameState.joystickData.force = finalDist / maxDist;
        }
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

        // 조이스틱 입력 처리 (아날로그 정밀 제어)
        if (GameState.joystickData.isDown) {
            const angle = GameState.joystickData.angle;
            const force = GameState.joystickData.force || 1;
            this.player.setVelocity(
                Math.cos(angle) * GameState.speed * force,
                Math.sin(angle) * GameState.speed * force
            );
        }
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        autoRound: true
    },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    parent: 'game-container',
    scene: [GameScene, UIScene]
};

export default config;
