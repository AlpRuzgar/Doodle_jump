const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//platformlar standart boyutta 30px/30px

const game = new Phaser.Game(config);
let cursors;
let platforms;
let player;
let ground;
let lastPlatformY = 900;
let platformGap = 250;
let lastY = 0;
let jumpPower = 1100;
let coins;
let lastCoinY = -1000;
let coinGap = 1000;
let coinScore = 0;
let coinScoreText;
let gameOverText;


function preload() {
    this.load.image('coin', 'assets/coin.png');
}

function create() {
    this.physics.world.setBounds(0, 0, config.width, Number.MAX_SAFE_INTEGER);

    ground = this.physics.add.staticGroup();
    platforms = this.physics.add.staticGroup();
    coins = this.physics.add.group();

    // Create player
    player = this.physics.add.sprite(config.width / 2, 700, 'player');
    player.setDisplaySize(75, 120);
    player.setCollideWorldBounds(true);
    player.body.world.bounds.bottom = Number.MAX_SAFE_INTEGER; // ✅ Alt sınır sonsuz olsun
    player.body.world.bounds.top = -Number.MAX_SAFE_INTEGER; // ✅ Üst sınır sonsuz olsun


    this.physics.add.collider(player, ground, startingJump)

    // Kamera ayarları
    this.cameras.main.startFollow(player, false, 0, 0);
    this.cameras.main.setFollowOffset(0, -config.height / 4);

    // Klavye girişlerini oluştur
    cursors = this.input.keyboard.createCursorKeys();

    createInitialGround(this);

    for (let index = 0; index < 10; index++) {
        addPlatform(this);
    }

    this.physics.add.collider(player, platforms, (player, platform) => {
        let playerBottom = player.y + player.height / 2;
        let platformTop = platform.y - platform.height / 2;

        // Karakterin yalnızca düşerken çarpışmasını sağla
        if (player.body.velocity.y >= 0) {
            if (playerBottom <= platformTop + 5) { // 5 piksel tolerans
                player.setVelocityY(-800);  // Zıpla
            }
        }
    });

    this.physics.add.overlap(player, coins, collectCoin, null, this);

    //Coin yazısı
    coinScoreText = this.add.text(16, 48, 'Coins: 0', {
        fontSize: '32px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 4
    }).setScrollFactor(0);

    //Game over ekranı
    gameOverText = this.add.text(150, config.height / 2, 'Game Over!', {
        fontSize: '50px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6
    }).setScrollFactor(0).setVisible(false);


}

function update() {
    handlePlayerMovement();

    // Yeni platformlar ekle
    if (player.y < lastPlatformY + 500) {
        addPlatform(this);
    }
    if (player.y < lastCoinY + 500) {
        addCoin(this);
    }

    // Delete old platforms that are far behind
    platforms.children.each(function (platform) {
        if (platform.y > player.y + 1200) {
            platforms.remove(platform, true, true);
        }
    });

    coins.children.each(function (coin) {
        if (coin.y > player.y + 1200) {
            coins.remove(coin, true, true);
        }
    });

    // Karakter yeni bir yüksekliğe çıkarsa kamera takip etsin
    if (player.y < this.cameras.main.scrollY + jumpPower / 3) {
        this.cameras.main.scrollY = player.y - jumpPower / 3;
    }
    if (player.y > this.cameras.main.scrollY) {

    }

    //game over
    let cameraBottomY = this.cameras.main.scrollY + config.height;
    if (player.y - player.height > cameraBottomY) {
        this.physics.pause();
        gameOverText.setVisible(true);
    }
}

function handlePlayerMovement() {
    if (cursors.left.isDown) {
        player.setVelocityX(-500);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(500);
    }
    else {
        player.setVelocityX(0);
    }
}

function createInitialGround(scene) {
    let startGround = ground.create(300, 870)
    startGround.setScale(20, 2);
    startGround.refreshBody();

}

function addPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    let y = lastPlatformY - platformGap;
    let platform = platforms.create(x, y);
    platform.setScale(5, 0.5)
    platform.refreshBody();
    lastPlatformY = y;

    //sadece üstten collision
    player.body.checkCollision.up = false;
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;
}

function addMovingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    //TODO
}

function addBreakingPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    //TODO

}

function addPhantomPlatform(scene) {
    let x = Phaser.Math.Between(0, config.width);
    //TODO

}

function startingJump() {
    player.setVelocityY(-(jumpPower + 200));
    //TODO

}

function jump(player, platform) {
    player.setVelocityY(-jumpPower)
}

function addCoin(scene) {
    let coinX = Phaser.Math.Between(0, config.width)
    let coinY = lastCoinY - coinGap;
    let coin = coins.create(coinX, coinY, 'coin');
    coin.body.allowGravity = false;
    coin.setScale(0.15);
    lastCoinY = coinY;
}

function collectCoin(player, coin) {
    // Altını oyundan kaldır
    coin.disableBody(true, true);

    // Altın skorunu artır
    coinScore += 1;
    coinScoreText.setText('Coins: ' + coinScore);
}

