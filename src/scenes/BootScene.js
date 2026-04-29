export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }

  preload() {
    // ── Colores procedurales — no necesitamos archivos de imagen externos ──
    // Todos los gráficos se generan con texturas programáticas en create()
  }

  create() {
    // Plataforma (tierra, ladrillo rojo-marrón)
    const platGfx = this.make.graphics({ x: 0, y: 0, add: false })
    platGfx.fillStyle(0x8b4513)
    platGfx.fillRect(0, 0, 32, 16)
    platGfx.fillStyle(0xa0522d)
    platGfx.fillRect(0, 0, 32, 6)
    platGfx.lineStyle(1, 0x5c2e00)
    platGfx.strokeRect(0, 0, 32, 16)
    platGfx.generateTexture('platform', 32, 16)
    platGfx.destroy()

    // Ninja (sprite simple: cuerpo negro + máscara roja)
    const ninjaGfx = this.make.graphics({ x: 0, y: 0, add: false })
    // Cuerpo
    ninjaGfx.fillStyle(0x1a1a2e)
    ninjaGfx.fillRect(4, 8, 24, 24)
    // Cabeza
    ninjaGfx.fillStyle(0x1a1a2e)
    ninjaGfx.fillRect(6, 0, 20, 20)
    // Máscara (franja roja)
    ninjaGfx.fillStyle(0xe74c3c)
    ninjaGfx.fillRect(6, 6, 20, 6)
    // Ojos (blancos)
    ninjaGfx.fillStyle(0xffffff)
    ninjaGfx.fillRect(9, 7, 4, 4)
    ninjaGfx.fillRect(19, 7, 4, 4)
    // Cinturón
    ninjaGfx.fillStyle(0xe74c3c)
    ninjaGfx.fillRect(4, 22, 24, 4)
    ninjaGfx.generateTexture('ninja', 32, 32)
    ninjaGfx.destroy()

    // Moneda (círculo dorado)
    const coinGfx = this.make.graphics({ x: 0, y: 0, add: false })
    coinGfx.fillStyle(0xf39c12)
    coinGfx.fillCircle(10, 10, 10)
    coinGfx.fillStyle(0xf1c40f)
    coinGfx.fillCircle(10, 10, 7)
    coinGfx.generateTexture('coin', 20, 20)
    coinGfx.destroy()

    // Enemigo (cuadrado rojo con ojos)
    const enemyGfx = this.make.graphics({ x: 0, y: 0, add: false })
    enemyGfx.fillStyle(0xc0392b)
    enemyGfx.fillRect(0, 0, 32, 32)
    enemyGfx.fillStyle(0xffffff)
    enemyGfx.fillRect(5, 8, 8, 8)
    enemyGfx.fillRect(19, 8, 8, 8)
    enemyGfx.fillStyle(0x1a1a2e)
    enemyGfx.fillRect(8, 11, 4, 4)
    enemyGfx.fillRect(22, 11, 4, 4)
    // Boca enojada
    enemyGfx.fillStyle(0x1a1a2e)
    enemyGfx.fillRect(8, 22, 16, 3)
    enemyGfx.generateTexture('enemy', 32, 32)
    enemyGfx.destroy()

    // Bandera de meta (triángulo verde en palo)
    const flagGfx = this.make.graphics({ x: 0, y: 0, add: false })
    flagGfx.fillStyle(0x555555)
    flagGfx.fillRect(10, 0, 4, 64)
    flagGfx.fillStyle(0x2ecc71)
    flagGfx.fillTriangle(14, 4, 14, 28, 38, 16)
    flagGfx.generateTexture('flag', 40, 64)
    flagGfx.destroy()

    // Fondo estrellado (capas de parallax)
    const bgGfx = this.make.graphics({ x: 0, y: 0, add: false })
    bgGfx.fillStyle(0x0f0f1a)
    bgGfx.fillRect(0, 0, 800, 450)
    // Estrellas aleatorias (seed fijo para reproducibilidad)
    bgGfx.fillStyle(0xffffff)
    const starPos = [
      [50,30],[120,80],[200,20],[300,60],[400,15],[500,90],[650,40],[750,70],
      [80,200],[170,250],[260,180],[380,230],[480,190],[580,260],[700,210],
      [30,380],[140,350],[240,400],[360,370],[460,340],[560,390],[680,360],[780,320],
    ]
    starPos.forEach(([x,y]) => bgGfx.fillRect(x, y, 2, 2))
    bgGfx.generateTexture('background', 800, 450)
    bgGfx.destroy()

    this.scene.start('MenuScene')
  }
}
