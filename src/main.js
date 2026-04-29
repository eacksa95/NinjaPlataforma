import Phaser from 'phaser'
import BootScene  from './scenes/BootScene.js'
import MenuScene  from './scenes/MenuScene.js'
import GameScene  from './scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#0f0f1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false },
  },
  scene: [BootScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

new Phaser.Game(config)
