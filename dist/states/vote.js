project.Vote = (function (game) {
  let
    txtstyle,
    questiontext,
    listgroup,
    current,
    menu
})

project.Vote.prototype = {
  preload: function () {
    game.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10)
    game.load.script('menu', '/js/menubuttons.js')
  },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)
    txtstyle = {
      backgroundColor: 'transparent',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: Presets.fontsize + 'px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }
    questiontext = game.add.text(0, menu.getBounds().height + Presets.padding, '', txtstyle)
    listgroup = game.add.group()
    let _this = this
    if (socket.hasListeners('receive vote') == false) {
      socket.on('receive vote', function (payload) {
        _this.composevote(payload)
      })
    }
    socket.emit('Request vote')
  },
  composevote: function (payload) {
    let title, options = [], names
    for (entry in payload) {
      if (payload[entry].title) title = payload[entry].title
      if (payload[entry].options) names = payload[entry].options
    }
    for (name in names) options.push({name: names[name], tally: 0})
    for (entry in payload) {
      for (vote in options) {
        if (payload[entry].vote == options[vote].name) options[vote].tally ++
      }
    }
    this.drawvotes(title, options, 320, game.world.height - menu.getBounds().height - questiontext.getBounds().height)
  },
  drawvotes: function (title, options, maxwidth, maxheight) {
    if (!sectioncolors) {
      let sectioncolors = [
        0xeb485b,
        0x1f9b76,
        0x9f5fff,
        0xd39e14,
        0x1688c7,
        0x7f7f7f
      ]
    }
    listgroup.removeChildren()
    let listvotes = []
    let listtext = []
    let increment = 0
    let lowestvote = options[0].tally
    questiontext.setText('vote: ' + title)
    for (option in options) {
      increment += options[option].tally
      lowestvote = lowestvote > options[option].tally ? options[option].tally : lowestvote
    }
    if (increment > 0) increment = (maxheight - 40) / increment
    for (option in options) {
      listvotes.push(game.add.graphics(0, 0))
      listvotes.last.beginFill(sectioncolors[(listvotes.length - 1) % sectioncolors.length])
      listvotes.last.drawRect((listvotes.length - 1) * (game.world.width / options.length < maxwidth ? game.world.width / options.length : maxwidth), game.world.height - increment * options[option].tally, listvotes.length + (game.world.width / options.length < maxwidth ? game.world.width / options.length - 20 : maxwidth - 20), increment * options[option].tally)
      listvotes.last.endFill()
      listtext.push(game.add.text(listvotes.last.getBounds().width / 2 + listvotes.last.getBounds().x, listvotes.last.getBounds().y + 6, options[option].name + ' - ' + options[option].tally, txtstyle))
      listtext.last.inputEnabled = true
      listtext.last.anchor.x = 0.5
      listtext.last.anchor.y = listtext.last.getBounds().height + listtext.last.y > game.world.height ? 1 : 0
      let placeholdy = game.world.height - increment * options[option].tally
      listvotes.last.y = game.world.height - increment * lowestvote
      game.add.tween(listvotes.last).to({ y: 0}, 2000, Phaser.Easing.Bounce.Out, true)
      if (listtext.last.anchor.y == 0) {
        let placeholdy = listtext.last.y// -listtext.last.getBounds().height/2;
        listtext.last.y = game.world.height - increment * lowestvote
        game.add.tween(listtext.last).to({ y: placeholdy}, 2000, Phaser.Easing.Bounce.Out, true)
      }
    }
    listgroup.addChild(questiontext)
    listgroup.addMultiple(listvotes)
    listgroup.addMultiple(listtext)
    listgroup.onChildInputOver.add(this.hover, this)
    listgroup.onChildInputOut.add(this.unhover, this)
    listgroup.onChildInputDown.add(this.sendvote, this)
  },
  hover: function (which) {
    which.tint = '0x7f7f7f'
  },
  unhover: function (which) {
    which.tint = '0xffffff'
  },
  sendvote: function (which) {
    which.tint = '0xffff00'
    if (game.storage) { socket.emit('Send vote', {id: game.storage.getItem('id'), vote: which.text.substr(0, which.text.indexOf(' -'))}) }
  }
}
