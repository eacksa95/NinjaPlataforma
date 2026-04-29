import Phaser from 'phaser'
import BootScene  from './scenes/BootScene.js'
import MenuScene  from './scenes/MenuScene.js'
import GameScene  from './scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#070714',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false },
  },
  scene: [BootScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

new Phaser.Game(config)
