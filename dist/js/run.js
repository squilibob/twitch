let game = new Phaser.Game(Presets.width, Presets.height, Phaser.AUTO, 'content')

project = {}
let mobile = true
let teams
let migrateteam = false
let lastraffleuser
let team_name
let loader_elements = {}

function pokeball_loader () {
  let radius = game.world.height / 4

  loader_elements.graphics = game.add.group()

  loader_elements.redgraphics = game.add.graphics(0, 0)
  loader_elements.redgraphics
    .clear()
    .beginFill(0xeb485b)
    .arc(0, 0, radius, 3.14, 0, true, 360)
    .endFill()
  loader_elements.redgraphics.anchor.setTo(0.5)
  loader_elements.redgraphics.x = game.world.centerX
  loader_elements.redgraphics.y = radius

  loader_elements.whitegraphics = game.add.graphics(0, 0)
  loader_elements.whitegraphics
    .clear()
    .beginFill(0xffffff)
    .arc(0, 0, radius, 3.14, 0, true, 360)
    .endFill()
  loader_elements.whitegraphics.anchor.setTo(0.5)
  loader_elements.whitegraphics.x = game.world.centerX
  loader_elements.whitegraphics.y = radius

  loader_elements.blackgraphics = game.add.graphics(0, 0)
  loader_elements.blackgraphics
    .clear()
    .beginFill(0x000000)
    .drawCircle(0, 0, radius * 0.75)
    .endFill()
  loader_elements.blackgraphics.anchor.setTo(0.5)
  loader_elements.blackgraphics.x = game.world.centerX
  loader_elements.blackgraphics.y = radius

  loader_elements.smallgraphics = game.add.graphics(0, 0)
  loader_elements.smallgraphics
    .clear()
    .beginFill(0xffffff)
    .drawCircle(0, 0, radius / 2)
    .endFill()
  loader_elements.smallgraphics.anchor.setTo(0.5)
  loader_elements.smallgraphics.x = game.world.centerX
  loader_elements.smallgraphics.y = radius

  loader_elements.graphics.addChild(loader_elements.redgraphics)
  loader_elements.graphics.addChild(loader_elements.whitegraphics)
  loader_elements.graphics.addChild(loader_elements.blackgraphics)
  loader_elements.graphics.addChild(loader_elements.smallgraphics)
}

project.Init = function () {
  states = {}
}

project.Init.prototype = {

  preload: function () {
    // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    if (game.device.iOS == true) mobile = true
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    game.scale.pageAlignHorizontally = true
    game.scale.pageAlignVertically = true
    game.canvas.style.width = '100%'
    game.canvas.style.height = '100%'
    game.scale.refresh()
    pokeball_loader()
    let script
    for (testscript in preloadscripts) {
      // console.log(preloadscripts[testscript])
      if (typeof (preloadscripts[testscript]) === 'object') {
        for (key in preloadscripts[testscript]) {
          script = preloadscripts[testscript][key]
          states[key] = this.filename(script)
        }
      } else script = preloadscripts[testscript]
      game.load.script(this.filename(script), script + '.js')
    }
    game.load.json('audiojsoncries', '/audio/cries.json')
    game.load.json('texttopikajson', '/audio/pikachu.json')
  },

  loadUpdate: function () {
    loader_elements.tween = game.add.tween(loader_elements.redgraphics).to({angle: this.load.progress * 1.8}, 250, Phaser.Easing.Linear.None, true)
    // if (this.load.progress == 100) loader_elements.graphics.destroy(true);
  },

  create: function () {
    console.log('preload finished')
    game.audioJSON = {}
    game.stage.disableVisibilityChange = true
    // game.plugins.add(Fabrique.Plugins.InputField)
    game.plugins.add(Fabrique.Plugins.SuperStorage)
    // game.plugins.add( Phaser.Plugin.StateTransition)

    for (statename in states) { game.state.add(statename, project[statename]) }
    this.socketready = new Phaser.Signal()
    this.socketready.add(this.ready, this)
    // pokedex = JSON.parse(game.storage.getItem('pokedex'))
    // typechart = JSON.parse(game.storage.getItem('typechart'))
    // if (pokedex && typechart) {
    //   typechart.length != 19 && this.populatetypechart()
    //   pokedex.length < maxpokes && this.populatedata()
    // } else {
    //   typechart = []
    //   pokedex = []
    //   this.populatetypechart()
    //   this.populatedata()
    // }
    console.log('create finished')
  },

  update: function () {
    //pokedex && pokedex.length >= maxpokes &&
    this.socketready.dispatch()
  },

  populatetypechart: function () {
    socket.emit('Ask for typechart')
  },

  populatedata: function () {
    socket.emit('Ask for pokedex', Presets.simple)
  },

  ready: function () {
    pokedexoptions.scoring && chatbot()
    loader_elements.graphics.destroy(true)
    game.state.start(firststate, Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight)
  },

  filename: function (string) {
    return string.substr(string.lastIndexOf('/') + 1)
  }

}
game.state.add('Init', project.Init)
game.state.start('Init', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight)
