let sceneConfig = [
{
  key: 'loading',
  preload: preload,
  create: create
},
...Scenes.values()
]

let game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'content',
  width: Presets.width,
  height: Presets.height,
  transparent: true,
  scene: sceneConfig
})

  function preload () {
    // this.load.crossOrigin = 'anonymous'
    // this.load.json('audiojsoncries', '/audio/cries.json')
    // this.load.json('texttopikajson', '/audio/pikachu.json')
  }

  function create() {
    // console.log(Scenes)
    Scenes.forEach(item => this.scene.launch(item.key))
  }