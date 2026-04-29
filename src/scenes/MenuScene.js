export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene') }

  create() {
    // Fondo
    this.add.image(400, 225, 'background')

    // Título
    this.add.text(400, 120, 'NINJA', {
      fontSize: '72px', fontFamily: 'monospace',
      color: '#e74c3c', stroke: '#0f0f1a', strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(400, 190, 'PLATAFORMA', {
      fontSize: '32px', fontFamily: 'monospace',
      color: '#f1c40f', stroke: '#0f0f1a', strokeThickness: 4,
    }).setOrigin(0.5)

    // Instrucciones
    this.add.text(400, 270, [
      '← → para mover',
      'ESPACIO o ↑ para saltar',
      'Recogé monedas · Evitá enemigos',
      'Llegá a la bandera 🏁',
    ], {
      fontSize: '16px', fontFamily: 'monospace',
      color: '#cccccc', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5)

    // Botón Jugar
    const playBtn = this.add.text(400, 380, '[ JUGAR ]', {
      fontSize: '28px', fontFamily: 'monospace',
      color: '#2ecc71', stroke: '#0f0f1a', strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    // Parpadeo del botón
    this.tweens.add({
      targets: playBtn, alpha: 0.2, duration: 700,
      yoyo: true, repeat: -1,
    })

    playBtn.on('pointerover', () => playBtn.setColor('#f1c40f'))
    playBtn.on('pointerout',  () => playBtn.setColor('#2ecc71'))
    playBtn.on('pointerdown', () => this.scene.start('GameScene'))

    // También con ENTER / ESPACIO
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('GameScene'))
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene'))
  }
}
