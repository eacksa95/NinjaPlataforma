// BootScene — genera todos los assets gráficos proceduralmente
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene') }

  create() {
    this._sky()
    this._mountainsFar()
    this._mountainsNear()
    this._bambooTile()
    this._platforms()
    this._ninja()
    this._shuriken()
    this._heart()
    this._samurai()
    this._scroll()
    this._banner()
    this.scene.start('MenuScene')
  }

  // ── Cielo nocturno con luna ────────────────────────────────────────────────
  _sky() {
    const g = this.make.graphics({ add: false })
    // Fondo
    g.fillStyle(0x070714)
    g.fillRect(0, 0, 800, 450)
    // Estrellas
    const stars = [
      [40,20],[90,55],[150,15],[210,40],[290,10],[350,50],[430,18],[510,38],
      [580,12],[650,48],[720,22],[770,35],[60,120],[130,95],[200,140],[280,110],
      [370,130],[450,100],[540,115],[620,85],[700,125],[760,90],[30,200],
      [110,180],[190,220],[260,190],[340,210],[410,175],[490,200],[570,185],
      [640,215],[710,170],[780,200],[25,300],[100,280],[180,320],[250,290],
      [330,310],[400,275],[475,305],[545,285],[615,315],[685,270],[755,300],
    ]
    stars.forEach(([x, y]) => {
      const r = Math.random() > 0.8 ? 2 : 1
      g.fillStyle(0xeeeeff, Math.random() * 0.5 + 0.5)
      g.fillRect(x, y, r, r)
    })
    // Halo de luna
    g.fillStyle(0xc8b870, 0.08)
    g.fillCircle(660, 75, 65)
    g.fillStyle(0xd4c880, 0.15)
    g.fillCircle(660, 75, 50)
    // Luna
    g.fillStyle(0xe8e0a8)
    g.fillCircle(660, 75, 38)
    // Cráteres
    g.fillStyle(0xd0c090)
    g.fillCircle(648, 62, 8)
    g.fillCircle(672, 80, 6)
    g.fillCircle(655, 88, 4)
    g.generateTexture('bg_sky', 800, 450)
    g.destroy()
  }

  // ── Montañas lejanas (silueta violeta) ────────────────────────────────────
  _mountainsFar() {
    const g = this.make.graphics({ add: false })
    g.fillStyle(0x2d1b4e)
    g.fillPoints([
      {x:0,y:450},{x:0,y:290},{x:50,y:240},{x:100,y:280},
      {x:140,y:190},{x:190,y:230},{x:230,y:150},{x:280,y:200},
      {x:320,y:120},{x:370,y:175},{x:410,y:100},{x:460,y:160},
      {x:500,y:130},{x:550,y:185},{x:590,y:95},{x:640,y:155},
      {x:680,y:180},{x:720,y:110},{x:760,y:170},{x:800,y:220},
      {x:800,y:450},
    ], true)
    // Niebla suave en base
    g.fillStyle(0x150d28, 0.6)
    g.fillRect(0, 360, 800, 90)
    g.generateTexture('bg_mountains_far', 800, 450)
    g.destroy()
  }

  // ── Montañas cercanas + pagoda + pinos ────────────────────────────────────
  _mountainsNear() {
    const g = this.make.graphics({ add: false })
    g.fillStyle(0x130c24)
    g.fillPoints([
      {x:0,y:450},{x:0,y:350},{x:60,y:280},{x:110,y:330},
      {x:160,y:240},{x:220,y:300},{x:270,y:200},{x:330,y:270},
      {x:380,y:215},{x:430,y:280},{x:490,y:175},{x:550,y:250},
      {x:600,y:220},{x:650,y:290},{x:700,y:195},{x:750,y:260},
      {x:800,y:310},{x:800,y:450},
    ], true)

    // Pagoda (silueta) — posición x=470, base y=420
    const px = 470, py = 420
    g.fillStyle(0x0a0818)
    // Torre principal
    g.fillRect(px-10, py-90, 20, 90)
    // 4 techos escalonados
    ;[[56,py-90],[44,py-112],[30,py-130],[18,py-145]].forEach(([w, ry]) => {
      g.fillTriangle(px-w/2, ry+8, px, ry-12, px+w/2, ry+8)
    })
    // Aguja
    g.fillRect(px-2, py-165, 4, 25)
    // Ventanas
    g.fillStyle(0x1a0a2e)
    g.fillRect(px-4, py-70, 8, 8)
    g.fillRect(px-4, py-50, 8, 8)

    // Pinos en silueta
    ;[[80,410],[130,405],[600,408],[680,400],[730,412]].forEach(([tx, ty]) => {
      g.fillStyle(0x0a0818)
      g.fillTriangle(tx-18, ty, tx, ty-38, tx+18, ty)
      g.fillTriangle(tx-13, ty-20, tx, ty-52, tx+13, ty-20)
      g.fillRect(tx-4, ty, 8, 14)
    })
    g.generateTexture('bg_mountains_near', 800, 450)
    g.destroy()
  }

  // ── Bambú (tile repetible) ────────────────────────────────────────────────
  _bambooTile() {
    const g = this.make.graphics({ add: false })
    ;[[30,0x2d6b1a],[90,0x1e4a12],[150,0x366020]].forEach(([bx, col]) => {
      for (let seg = 0; seg < 12; seg++) {
        const by = seg * 40
        g.fillStyle(col)
        g.fillRect(bx-5, by, 10, 38)
        // Nudo (joint)
        g.fillStyle(0x142e09)
        g.fillRect(bx-7, by+36, 14, 5)
        // Hoja cada 3 segmentos
        if (seg % 3 === 0) {
          g.fillStyle(col)
          g.fillTriangle(bx+5, by+8, bx+28, by-4, bx+22, by+18)
        }
      }
    })
    g.generateTexture('bg_bamboo_tile', 200, 480)
    g.destroy()
  }

  // ── Plataformas ──────────────────────────────────────────────────────────
  _platforms() {
    // Madera oscura (andamio)
    const w = this.make.graphics({ add: false })
    w.fillStyle(0x3b1e08)
    w.fillRect(0, 0, 32, 16)
    w.fillStyle(0x4e2a0e)
    w.fillRect(0, 0, 15, 16)
    w.fillStyle(0x5c3412)
    w.fillRect(0, 0, 32, 4)
    w.lineStyle(1, 0x2a1206)
    w.strokeRect(0, 0, 15, 16)
    w.strokeRect(17, 0, 15, 16)
    // Vetas de madera
    w.lineStyle(1, 0x6a3e18, 0.5)
    w.lineBetween(3, 6, 12, 9)
    w.lineBetween(20, 4, 29, 12)
    w.generateTexture('platform_wood', 32, 16)
    w.destroy()

    // Piedra de castillo
    const s = this.make.graphics({ add: false })
    s.fillStyle(0x2a2a2a)
    s.fillRect(0, 0, 32, 16)
    s.fillStyle(0x333333)
    s.fillRect(0, 0, 14, 7)
    s.fillRect(18, 8, 14, 8)
    s.fillStyle(0x3a3a3a)
    s.fillRect(0, 0, 32, 2)
    s.lineStyle(1, 0x1a1a1a)
    s.strokeRect(0, 0, 32, 16)
    s.generateTexture('platform_stone', 32, 16)
    s.destroy()
  }

  // ── Ninja (sprite negro con máscara roja) ────────────────────────────────
  _ninja() {
    const g = this.make.graphics({ add: false })
    // Cuerpo
    g.fillStyle(0x0f0f1e)
    g.fillRect(5, 10, 22, 22)
    // Bufanda ninja (cuello)
    g.fillStyle(0x8b0000)
    g.fillRect(5, 10, 22, 5)
    // Cabeza
    g.fillStyle(0x0f0f1e)
    g.fillRect(7, 1, 18, 18)
    // Máscara (franja roja)
    g.fillStyle(0xcc0000)
    g.fillRect(7, 7, 18, 6)
    // Ojos (ranura blanca brillante)
    g.fillStyle(0xffffff)
    g.fillRect(9, 8, 5, 3)
    g.fillRect(18, 8, 5, 3)
    // Cinturón
    g.fillStyle(0x8b0000)
    g.fillRect(5, 24, 22, 4)
    // Piernas
    g.fillStyle(0x0f0f1e)
    g.fillRect(7, 28, 8, 4)
    g.fillRect(17, 28, 8, 4)
    g.generateTexture('ninja', 32, 32)
    g.destroy()
  }

  // ── Shuriken (estrella de 8 puntas) ──────────────────────────────────────
  _shuriken() {
    const g = this.make.graphics({ add: false })
    const cx = 9, cy = 9, r1 = 9, r2 = 4
    const pts = []
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI / 4) - Math.PI / 2
      const r = i % 2 === 0 ? r1 : r2
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    }
    g.fillStyle(0xb0b8c8)
    g.fillPoints(pts, true)
    g.fillStyle(0x707888)
    g.fillCircle(cx, cy, 3)
    g.fillStyle(0xd8e0f0)
    g.fillCircle(cx - 1, cy - 1, 1)
    g.generateTexture('shuriken', 18, 18)
    g.destroy()
  }

  // ── Corazón (vida) ────────────────────────────────────────────────────────
  _heart() {
    const g = this.make.graphics({ add: false })
    g.fillStyle(0xdd1111)
    g.fillCircle(5, 5, 5)
    g.fillCircle(11, 5, 5)
    g.fillTriangle(0, 7, 16, 7, 8, 16)
    g.generateTexture('heart', 16, 16)
    g.destroy()
  }

  // ── Samurái enemigo ──────────────────────────────────────────────────────
  _samurai() {
    const g = this.make.graphics({ add: false })
    // Cuerpo (armadura roja oscura)
    g.fillStyle(0x6b0000)
    g.fillRect(5, 12, 22, 20)
    // Hombreras
    g.fillStyle(0x8b0000)
    g.fillRect(1, 12, 8, 6)
    g.fillRect(23, 12, 8, 6)
    // Casco (kabuto)
    g.fillStyle(0x1a0000)
    g.fillRect(6, 1, 20, 16)
    // Cuerno del casco
    g.fillStyle(0xcc8800)
    g.fillTriangle(16, 0, 11, 8, 21, 8)
    // Visera metálica
    g.fillStyle(0x555566)
    g.fillRect(8, 10, 16, 7)
    // Ojos (brillo rojo)
    g.fillStyle(0xff2200)
    g.fillRect(10, 12, 4, 3)
    g.fillRect(18, 12, 4, 3)
    // Espada (katana)
    g.fillStyle(0xaaaaaa)
    g.fillRect(28, 8, 3, 22)
    g.fillStyle(0x8b6914)
    g.fillRect(26, 18, 7, 4)
    g.generateTexture('enemy_samurai', 32, 32)
    g.destroy()
  }

  // ── Pergamino coleccionable ───────────────────────────────────────────────
  _scroll() {
    const g = this.make.graphics({ add: false })
    // Cuerpo del pergamino
    g.fillStyle(0xf0d070)
    g.fillRect(3, 4, 16, 14)
    // Rodillos
    g.fillStyle(0x8b6914)
    g.fillRect(1, 2, 20, 4)
    g.fillRect(1, 16, 20, 4)
    g.fillRect(1, 2, 4, 18)
    g.fillRect(17, 2, 4, 18)
    // Sello rojo
    g.fillStyle(0xcc0000)
    g.fillRect(8, 7, 7, 7)
    g.fillStyle(0xff4444)
    g.fillRect(9, 8, 5, 5)
    g.generateTexture('item_scroll', 22, 22)
    g.destroy()
  }

  // ── Estandarte final (bandera japonesa) ──────────────────────────────────
  _banner() {
    const g = this.make.graphics({ add: false })
    // Palo de bambú
    g.fillStyle(0x4a7a1e)
    g.fillRect(11, 0, 6, 64)
    // Estandarte rojo
    g.fillStyle(0xcc0000)
    g.fillRect(17, 4, 24, 36)
    // Círculo blanco (sol naciente)
    g.fillStyle(0xffffff)
    g.fillCircle(29, 22, 10)
    // Borde dorado
    g.lineStyle(2, 0xffcc00)
    g.strokeRect(17, 4, 24, 36)
    g.generateTexture('banner_goal', 44, 64)
    g.destroy()
  }
}
