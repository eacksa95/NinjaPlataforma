export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  create() {
    const W = 800, H = 450

    // ── Fondo parallax (estático en menú) ────────────────────────────────
    this.add.image(W/2, H/2, 'bg_sky')
    this.bgMtnFar  = this.add.tileSprite(W/2, H/2, W, H, 'bg_mountains_far')
    this.bgMtnNear = this.add.tileSprite(W/2, H/2, W, H, 'bg_mountains_near')
    this.bgBamboo  = this.add.tileSprite(W/2, H/2, W, H, 'bg_bamboo_tile').setAlpha(0.18)

    // Oscurecer levemente para legibilidad
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.45)

    // ── Título ────────────────────────────────────────────────────────────
    // Subtítulo japonés
    this.add.text(W/2, 100, '黒影', {
      fontSize: '28px', fontFamily: 'serif',
      color: '#cc9933', alpha: 0.8,
    }).setOrigin(0.5)

    // Título principal
    const title = this.add.text(W/2, 155, 'KUROKAGE', {
      fontSize: '80px', fontFamily: 'monospace',
      color: '#f0f0f0',
      stroke: '#8b0000', strokeThickness: 8,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5)

    // Pulso sutil en el título
    this.tweens.add({
      targets: title, scaleX: 1.02, scaleY: 1.02,
      duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Slogan
    this.add.text(W/2, 225, 'EL CAMINO DE LA SOMBRA', {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#cc9933', letterSpacing: 6,
    }).setOrigin(0.5)

    // ── Instrucciones ────────────────────────────────────────────────────
    this.add.text(W/2, 285, [
      '← → / A D  ·  Mover',
      '↑ / W / ESPACIO  ·  Saltar',
      'Z  ·  Lanzar shuriken',
    ], {
      fontSize: '15px', fontFamily: 'monospace',
      color: '#c8c8c8', align: 'center', lineSpacing: 10,
    }).setOrigin(0.5)

    // ── Botón jugar ──────────────────────────────────────────────────────
    const playText = this.add.text(W/2, 380, '[ PRESIONÁ CUALQUIER TECLA ]', {
      fontSize: '17px', fontFamily: 'monospace', color: '#cc9933',
    }).setOrigin(0.5)

    this.tweens.add({
      targets: playText, alpha: 0.15, duration: 700, yoyo: true, repeat: -1,
    })

    // Animación del bambú
    this.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        this.bgMtnFar.tilePositionX  += 0.3
        this.bgMtnNear.tilePositionX += 0.6
        this.bgBamboo.tilePositionX  += 1.2
      },
    })

    // Iniciar con cualquier tecla o click
    this.input.keyboard.once('keydown', () => this.scene.start('GameScene'))
    this.input.once('pointerdown',       () => this.scene.start('GameScene'))
  }
}
