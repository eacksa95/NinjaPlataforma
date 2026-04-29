// ── Mapa del nivel ────────────────────────────────────────────────────────────
// ' '=vacío  '1'=madera  '2'=piedra  'E'=samurái  'C'=pergamino  'F'=bandera
const LEVEL = [
  '                                                                                        ',
  '                     C                  C          C                     C             ',
  '          C    1111111111    C     11111111111           C         111111111            ',
  '   C  1111111                  1111            11111111                          C     ',
  '111111           E      C               E                  E          C      1111111  F',
  '          11111111  C      11111111          C       11111111    C                 1111',
  '  E                    E            E  C                    E       C  E              ',
  '1111111      C     1111111     C        111111111       C       1111111      C    1111',
  '        E  E            E   E      E           E   E       E  E        E  E          E',
  '22222222222222222222222222222222222222222222222222222222222222222222222222222222222222222',
]

const TILE_W  = 32
const TILE_H  = 16
const LEVEL_W = LEVEL[0].length * TILE_W
const LEVEL_H = LEVEL.length  * TILE_H * 2

// Cantidad total de pergaminos en el nivel (para HUD)
const TOTAL_SCROLLS = LEVEL.reduce((n, row) => n + (row.match(/C/g) || []).length, 0)

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene') }

  // ── create ────────────────────────────────────────────────────────────────
  create() {
    this.lives        = 3
    this.score        = 0
    this.scrollsFound = 0
    this.gameOver     = false
    this.lastShuriken = 0
    this.invincible   = false

    this.physics.world.setBounds(0, 0, LEVEL_W, LEVEL_H)

    this._buildBackground()
    this._buildLevel()
    this._buildPlayer()
    this._buildCollisions()
    this._buildHUD()
    this._buildControls()

    this.cameras.main.setBounds(0, 0, LEVEL_W, LEVEL_H)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
  }

  // ── update ────────────────────────────────────────────────────────────────
  update(time) {
    if (this.gameOver) return

    this._updateParallax()
    this._handleMovement()
    this._handleShuriken(time)
    this._handleEnemyPatrol()

    // Caer fuera del mundo
    if (this.player.y > LEVEL_H + 60) this._loseLife()
  }

  // ── background con parallax ───────────────────────────────────────────────
  _buildBackground() {
    const W = 800, H = 450
    this.add.image(W/2, H/2, 'bg_sky').setScrollFactor(0)
    this.bgFar  = this.add.tileSprite(W/2, H/2, W, H, 'bg_mountains_far').setScrollFactor(0)
    this.bgNear = this.add.tileSprite(W/2, H/2, W, H, 'bg_mountains_near').setScrollFactor(0)
    this.bgBam  = this.add.tileSprite(W/2, H/2, W, H, 'bg_bamboo_tile')
                    .setScrollFactor(0).setAlpha(0.12)
  }

  _updateParallax() {
    const cx = this.cameras.main.scrollX
    this.bgFar.tilePositionX  = cx * 0.05
    this.bgNear.tilePositionX = cx * 0.15
    this.bgBam.tilePositionX  = cx * 0.28
  }

  // ── construir nivel desde el mapa ─────────────────────────────────────────
  _buildLevel() {
    this.platforms  = this.physics.add.staticGroup()
    this.enemies    = this.physics.add.group()
    this.scrolls    = this.physics.add.group()
    this.shurikens  = this.physics.add.group()

    LEVEL.forEach((row, ri) => {
      for (let ci = 0; ci < row.length; ci++) {
        const ch = row[ci]
        const x  = ci * TILE_W + TILE_W / 2
        const y  = ri * TILE_H * 2 + TILE_H

        if (ch === '1') {
          this.platforms.create(x, y, 'platform_wood')
        } else if (ch === '2') {
          this.platforms.create(x, y, 'platform_stone')
        } else if (ch === 'E') {
          const e = this.enemies.create(x, y - 16, 'enemy_samurai')
          e.setCollideWorldBounds(true)
          e.body.setGravityY(200)
          e.setVelocityX(Phaser.Math.RND.pick([-55, 55]))
          e.patrolDir = e.body.velocity.x > 0 ? 1 : -1
        } else if (ch === 'C') {
          const sc = this.scrolls.create(x, y - 14, 'item_scroll')
          sc.body.setAllowGravity(false)
          this.tweens.add({ targets: sc, y: sc.y - 7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        } else if (ch === 'F') {
          this.flag = this.physics.add.staticImage(x + 8, y - 32, 'banner_goal')
        }
      }
    })
  }

  // ── jugador ───────────────────────────────────────────────────────────────
  _buildPlayer() {
    this.player = this.physics.add.sprite(48, 200, 'ninja')
    this.player.setBounce(0.05)
    this.player.setCollideWorldBounds(true)
    this.player.body.setSize(18, 26).setOffset(7, 6)
  }

  // ── colisiones y overlaps ─────────────────────────────────────────────────
  _buildCollisions() {
    this.physics.add.collider(this.player,  this.platforms)
    this.physics.add.collider(this.enemies, this.platforms)

    // Recoger pergamino
    this.physics.add.overlap(this.player, this.scrolls, (_p, sc) => {
      sc.destroy()
      this.scrollsFound++
      this.score += 100
      this._updateHUD()
      this._spawnScoreText(sc.x, sc.y, '+100')
    })

    // Shuriken vs enemigo
    this.physics.add.overlap(this.shurikens, this.enemies, (sh, en) => {
      sh.destroy()
      en.destroy()
      this.score += 50
      this._updateHUD()
      this._spawnScoreText(en.x, en.y, '+50', '#ffaa00')
    })

    // Jugador vs enemigo
    this.physics.add.overlap(this.player, this.enemies, () => {
      if (!this.invincible) this._loseLife()
    })

    // Meta
    if (this.flag) {
      this.physics.add.overlap(this.player, this.flag, () => {
        if (!this.gameOver) this._win()
      })
    }
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  _buildHUD() {
    // Corazones (vidas)
    this.heartIcons = []
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(18 + i * 22, 16, 'heart').setScrollFactor(0).setScale(1.2)
      this.heartIcons.push(h)
    }
    // Score
    this.scoreText = this.add.text(800 - 12, 10, `${this.score}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#f0d070',
      stroke: '#000', strokeThickness: 3,
    }).setScrollFactor(0).setOrigin(1, 0)

    // Pergaminos
    this.scrollText = this.add.text(800 - 12, 28, `📜 ${this.scrollsFound}/${TOTAL_SCROLLS}`, {
      fontSize: '13px', fontFamily: 'monospace', color: '#c8c890',
      stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setOrigin(1, 0)

    // Ayuda controles (desaparece)
    const ctrl = this.add.text(400, 434, 'Z = shuriken  |  ← → moverse  |  ↑ saltar', {
      fontSize: '11px', fontFamily: 'monospace', color: '#888888',
    }).setScrollFactor(0).setOrigin(0.5, 1)
    this.time.delayedCall(5000, () => this.tweens.add({ targets: ctrl, alpha: 0, duration: 800 }))
  }

  _updateHUD() {
    this.scoreText.setText(`${this.score}`)
    this.scrollText.setText(`📜 ${this.scrollsFound}/${TOTAL_SCROLLS}`)
    // Corazones
    this.heartIcons.forEach((h, i) => {
      h.setAlpha(i < this.lives ? 1 : 0.15)
    })
  }

  _spawnScoreText(x, y, msg, color = '#ffffff') {
    const t = this.add.text(x, y - 10, msg, {
      fontSize: '14px', fontFamily: 'monospace', color,
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5)
    this.tweens.add({ targets: t, y: y - 45, alpha: 0, duration: 800, onComplete: () => t.destroy() })
  }

  // ── controles ─────────────────────────────────────────────────────────────
  _buildControls() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd    = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:    Phaser.Input.Keyboard.KeyCodes.W,
    })
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
  }

  // ── movimiento ────────────────────────────────────────────────────────────
  _handleMovement() {
    const onGround = this.player.body.blocked.down
    const left     = this.cursors.left.isDown  || this.wasd.left.isDown
    const right    = this.cursors.right.isDown || this.wasd.right.isDown
    const jump     = Phaser.Input.Keyboard.JustDown(this.cursors.up)    ||
                     Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                     Phaser.Input.Keyboard.JustDown(this.wasd.up)

    if (left)       { this.player.setVelocityX(-210); this.player.setFlipX(true)  }
    else if (right) { this.player.setVelocityX(210);  this.player.setFlipX(false) }
    else            { this.player.setVelocityX(0) }

    if (jump && onGround) this.player.setVelocityY(-570)
  }

  // ── shuriken ──────────────────────────────────────────────────────────────
  _handleShuriken(time) {
    if (Phaser.Input.Keyboard.JustDown(this.zKey) && time - this.lastShuriken > 350) {
      this.lastShuriken = time
      const dir = this.player.flipX ? -1 : 1
      const sh  = this.shurikens.create(this.player.x + dir * 20, this.player.y - 2, 'shuriken')
      sh.setVelocityX(dir * 520)
      sh.body.setAllowGravity(false)
      // Rotación continua
      this.tweens.add({ targets: sh, angle: dir > 0 ? 360 : -360, duration: 280, repeat: -1 })
      // Destruir fuera de pantalla o tras 2s
      this.time.delayedCall(2000, () => { if (sh?.active) sh.destroy() })
    }
    // Destruir shurikens que salen del mundo
    this.shurikens.children.iterate(sh => {
      if (sh && (sh.x < 0 || sh.x > LEVEL_W)) sh.destroy()
    })
  }

  // ── patrulla de enemigos ──────────────────────────────────────────────────
  _handleEnemyPatrol() {
    this.enemies.children.iterate(e => {
      if (!e?.body) return
      if (e.body.blocked.left)  { e.setVelocityX(55);  e.patrolDir =  1; e.setFlipX(false) }
      if (e.body.blocked.right) { e.setVelocityX(-55); e.patrolDir = -1; e.setFlipX(true)  }
      if (Math.abs(e.body.velocity.x) < 5) e.setVelocityX(55 * e.patrolDir)
    })
  }

  // ── perder vida ───────────────────────────────────────────────────────────
  _loseLife() {
    this.lives--
    this._updateHUD()
    this._flashPlayer()

    if (this.lives <= 0) {
      this.gameOver = true
      this.physics.pause()
      this.player.setTint(0xff2222)
      this._showGameOver()
    }
  }

  _flashPlayer() {
    this.invincible = true
    this.player.setTint(0xff6666)
    // Parpadeo de invulnerabilidad
    this.tweens.add({
      targets: this.player, alpha: 0.2, duration: 120,
      yoyo: true, repeat: 5,
      onComplete: () => {
        this.player.clearTint()
        this.player.setAlpha(1)
        this.invincible = false
      },
    })
  }

  // ── game over ─────────────────────────────────────────────────────────────
  _showGameOver() {
    const cx = this.cameras.main.scrollX + 400
    const cy = this.cameras.main.scrollY + 225

    this.add.rectangle(cx, cy, 440, 200, 0x000000, 0.75)
    this.add.text(cx, cy - 60, 'GAME OVER', {
      fontSize: '52px', fontFamily: 'monospace',
      color: '#dd1111', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5)
    this.add.text(cx, cy, `Puntuación: ${this.score}  |  Pergaminos: ${this.scrollsFound}/${TOTAL_SCROLLS}`, {
      fontSize: '15px', fontFamily: 'monospace', color: '#cccccc',
    }).setOrigin(0.5)

    const retry = this.add.text(cx, cy + 60, '[ REINTENTAR  —  ENTER ]', {
      fontSize: '20px', fontFamily: 'monospace', color: '#cc9933',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: retry, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 })
    retry.on('pointerdown', () => this.scene.restart())
    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart())
    this.input.keyboard.once('keydown-R',     () => this.scene.restart())
  }

  // ── victoria ──────────────────────────────────────────────────────────────
  _win() {
    this.gameOver = true
    this.physics.pause()
    this.player.setTint(0xf0d070)

    const cx = this.cameras.main.scrollX + 400
    const cy = this.cameras.main.scrollY + 225

    this.add.rectangle(cx, cy, 480, 210, 0x000000, 0.78)
    this.add.text(cx, cy - 70, '黒影', {
      fontSize: '24px', fontFamily: 'serif', color: '#cc9933',
    }).setOrigin(0.5)
    this.add.text(cx, cy - 35, '¡NIVEL COMPLETADO!', {
      fontSize: '40px', fontFamily: 'monospace',
      color: '#f0d070', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5)
    this.add.text(cx, cy + 20, [
      `Puntuación: ${this.score}`,
      `Pergaminos: ${this.scrollsFound} / ${TOTAL_SCROLLS}`,
    ], {
      fontSize: '16px', fontFamily: 'monospace', color: '#cccccc', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5)

    const again = this.add.text(cx, cy + 80, '[ VOLVER AL MENÚ  —  ENTER ]', {
      fontSize: '18px', fontFamily: 'monospace', color: '#cc9933',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    this.tweens.add({ targets: again, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 })
    again.on('pointerdown', () => this.scene.start('MenuScene'))
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('MenuScene'))
  }
}
