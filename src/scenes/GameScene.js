// ── Mapa del nivel ────────────────────────────────────────────────────────────
// 0 = vacío   1 = plataforma   E = enemigo   C = moneda   F = bandera
const LEVEL = [
  '                                                          ',
  '                                                          ',
  '                                                          ',
  '                                          C               ',
  '                                    111111111   F         ',
  '              C      C                          1111      ',
  '         111111  111111        EE                         ',
  '   C                                  C                  ',
  '111111      C           11111111111                       ',
  '          111111   C                  C     C             ',
  '  EE                  C         111111111111111           ',
  '1111111111111111111111111111111111111111111111111111111111',
]

const TILE_W = 32
const TILE_H = 16
const LEVEL_W = LEVEL[0].length * TILE_W

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }

  create() {
    this.coins = 0
    this.isGameOver = false

    // ── Mundo ──────────────────────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL.length * TILE_H * 2)

    // Fondo (scrolling parallax simple)
    this.bgImage = this.add.image(0, 0, 'background')
      .setOrigin(0, 0).setScrollFactor(0.2)

    // ── Plataformas ────────────────────────────────────────────────────────────
    this.platforms = this.physics.add.staticGroup()
    this.enemyGroup = this.physics.add.group()
    this.coinGroup  = this.physics.add.group()

    LEVEL.forEach((row, rowIdx) => {
      for (let col = 0; col < row.length; col++) {
        const ch  = row[col]
        const x   = col * TILE_W + TILE_W / 2
        const y   = rowIdx * (TILE_H * 2) + TILE_H

        if (ch === '1') {
          this.platforms.create(x, y, 'platform')
        } else if (ch === 'E') {
          const enemy = this.enemyGroup.create(x, y - 16, 'enemy')
          enemy.setCollideWorldBounds(true)
          enemy.setBounce(0)
          enemy.body.setGravityY(200)
          enemy.setVelocityX(Phaser.Math.Between(0, 1) === 0 ? -60 : 60)
          enemy.patrolDir = enemy.body.velocity.x > 0 ? 1 : -1
        } else if (ch === 'C') {
          const coin = this.coinGroup.create(x, y - 16, 'coin')
          coin.body.setAllowGravity(false)
          // Animación de flotación
          this.tweens.add({ targets: coin, y: coin.y - 6, duration: 800, yoyo: true, repeat: -1 })
        } else if (ch === 'F') {
          this.flag = this.physics.add.staticImage(x, y - 32, 'flag')
        }
      }
    })

    // ── Jugador ────────────────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(50, 200, 'ninja')
    this.player.setBounce(0.1)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(20, 28).setOffset(6, 4)

    // ── Colisiones ─────────────────────────────────────────────────────────────
    this.physics.add.collider(this.player,     this.platforms)
    this.physics.add.collider(this.enemyGroup, this.platforms)

    // Recoger monedas
    this.physics.add.overlap(this.player, this.coinGroup, (_player, coin) => {
      coin.destroy()
      this.coins++
      this.coinText.setText(`Monedas: ${this.coins}`)
    })

    // Tocar enemigo → game over
    this.physics.add.overlap(this.player, this.enemyGroup, () => {
      if (!this.isGameOver) this.triggerGameOver()
    })

    // Llegar a la bandera → victoria
    if (this.flag) {
      this.physics.add.overlap(this.player, this.flag, () => {
        if (!this.isGameOver) this.triggerWin()
      })
    }

    // ── Cámara ─────────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, LEVEL_W, this.physics.world.bounds.height)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

    // ── Controles ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:    Phaser.Input.Keyboard.KeyCodes.W,
    })

    // ── HUD (fijo en cámara) ───────────────────────────────────────────────────
    this.coinText = this.add.text(12, 12, 'Monedas: 0', {
      fontSize: '16px', fontFamily: 'monospace', color: '#f1c40f',
      stroke: '#0f0f1a', strokeThickness: 3,
    }).setScrollFactor(0)

    this.add.text(12, 34, '← → Mover  |  ↑ / Espacio Saltar', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setScrollFactor(0)
  }

  update() {
    if (this.isGameOver) return

    const onGround = this.player.body.blocked.down
    const goLeft   = this.cursors.left.isDown  || this.wasd.left.isDown
    const goRight  = this.cursors.right.isDown || this.wasd.right.isDown
    const jump     = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                     Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                     Phaser.Input.Keyboard.JustDown(this.wasd.up)

    if (goLeft) {
      this.player.setVelocityX(-200)
      this.player.setFlipX(true)
    } else if (goRight) {
      this.player.setVelocityX(200)
      this.player.setFlipX(false)
    } else {
      this.player.setVelocityX(0)
    }

    if (jump && onGround) {
      this.player.setVelocityY(-540)
    }

    // Caída fuera del nivel
    if (this.player.y > this.physics.world.bounds.height + 50) {
      this.triggerGameOver()
    }

    // Patrulla de enemigos — invierten dirección al llegar al borde de plataforma
    this.enemyGroup.children.iterate((enemy) => {
      if (!enemy || !enemy.body) return
      if (enemy.body.blocked.left)  { enemy.setVelocityX(60);  enemy.patrolDir =  1 }
      if (enemy.body.blocked.right) { enemy.setVelocityX(-60); enemy.patrolDir = -1 }
      // Pequeño oscilado si está detenido
      if (Math.abs(enemy.body.velocity.x) < 10) {
        enemy.setVelocityX(60 * enemy.patrolDir)
      }
    })
  }

  triggerGameOver() {
    this.isGameOver = true
    this.physics.pause()
    this.player.setTint(0xff0000)

    this.add.text(400, 180, 'GAME OVER', {
      fontSize: '56px', fontFamily: 'monospace',
      color: '#e74c3c', stroke: '#0f0f1a', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0)

    this.add.text(400, 260, `Monedas recogidas: ${this.coins}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#cccccc',
    }).setOrigin(0.5).setScrollFactor(0)

    const retry = this.add.text(400, 330, '[ REINTENTAR ]', {
      fontSize: '24px', fontFamily: 'monospace', color: '#2ecc71',
      stroke: '#0f0f1a', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true })

    retry.on('pointerdown', () => this.scene.restart())
    retry.on('pointerover', () => retry.setColor('#f1c40f'))
    retry.on('pointerout',  () => retry.setColor('#2ecc71'))

    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart())
    this.input.keyboard.once('keydown-R',     () => this.scene.restart())
  }

  triggerWin() {
    this.isGameOver = true
    this.physics.pause()
    this.player.setTint(0xf1c40f)

    this.add.text(400, 160, '¡COMPLETADO!', {
      fontSize: '52px', fontFamily: 'monospace',
      color: '#f1c40f', stroke: '#0f0f1a', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0)

    this.add.text(400, 240, `Monedas: ${this.coins} / ${this.coinGroup.getLength() + this.coins}`, {
      fontSize: '20px', fontFamily: 'monospace', color: '#2ecc71',
    }).setOrigin(0.5).setScrollFactor(0)

    const again = this.add.text(400, 320, '[ JUGAR DE NUEVO ]', {
      fontSize: '22px', fontFamily: 'monospace', color: '#2ecc71',
      stroke: '#0f0f1a', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true })

    again.on('pointerdown', () => this.scene.start('MenuScene'))
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('MenuScene'))
  }
}
