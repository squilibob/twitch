project.Emote = (function (game) {
  let
    gameTimer,
    startTime,
    totalTime,
    timeElapsed,
    canSend,
    menu
})

project.Emote.prototype = {
  preload: function () {
    game.load.script('menu', '/js/menubuttons.js')
    game.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10)
  },
  sendemote: function (picture) {
    console.log(canSend)
    if (canSend == true) {
      canSend = false
      socket.emit('send emote', {message: game.storage.getItem('id') + 's pokemotion', picture: picture.frame})
    }
  },
  updateTimer: function () {
    let currentTime = new Date()
    let timeDifference = startTime.getTime() - currentTime.getTime()
    timeElapsed = Math.abs(timeDifference / 1000)
  },
  update: function () {
    if (timeElapsed >= totalTime) {
      canSend = true
      timeElapsed = 0
      startTime = new Date()
    }
  },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)

    canSend = true
    startTime = new Date()
    totalTime = 12
    timeElapsed = 0

    let me = this
    gameTimer = game.time.events.loop(100, function () {
      me.updateTimer()
    })

    poke = []
    let width = 206 + Presets.padding
    let height = 236 + Presets.padding
    let x = -width
    let y = 200
    for (let i = 0; i < 10; i++) {
      x += width
      if (x + width > game.world.width) {
        x = 0
        y += height
      }
      poke.push(game.add.sprite(x, y, 'pokemotevulpix'))
      poke.last.frame = i
      poke.last.inputEnabled = true
      poke.last.events.onInputDown.add(this.sendemote)
    }
  }
}
