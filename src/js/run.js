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
  width: 2200,
  height: 1200,
  transparent: true,
  fps: {
    target: 60,
    min: 12,
    forceSetTimeOut: true
  },
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