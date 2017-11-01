let menubuttons = []
// let menugroup = game.add.group();

menubuttons.prototype = {
  onClick: function (name) {
    Presets.externalteams
    ? game.state.start(this.toString())
    : game.state.start(this.toString(), Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight)
  },
  addButton: function (text, color, nextstate) {
    let x = buttonstyle.x
    let y = buttonstyle.y
    for (let nextbutton = 1; nextbutton <= menubuttons.length; nextbutton++) { buttonstyle.horizontalorientation ? x += menubuttons[nextbutton - 1].children[0].graphicsData[0].shape.width : y += menubuttons[nextbutton - 1].children[0].graphicsData[0].shape.height }
    textButton.define(menubuttons.push(game.add.group(), game, text, x, y, color))
    menubuttons.last.onChildInputDown.add(this.onClick, nextstate)
    if (Presets.autohide) {
      menubuttons.last.setAll('alpha', 0)
      menubuttons.last.onChildInputDown.add(this.show, menubuttons.last)
      menubuttons.last.onChildInputOver.add(this.show, menubuttons.last)
      menubuttons.last.onChildInputOut.add(this.hide, menubuttons.last)
    }
  },
  hide: function (whichbutton) {
    whichbutton.parent.setAll('alpha', 0)
  },
  show: function (whichbutton) {
    whichbutton.parent.setAll('alpha', 1)
  },
  create: function (game) {
    let nextcolor = 0
    for (statename in states) {
      this.addButton(statename, sectioncolors[nextcolor], statename)
      nextcolor = (nextcolor + 1) % sectioncolors.length
    }
      // menugroup.addMultiple(menubuttons);
      // console.log(game.world.width/menugroup.getBounds().width);
      // menugroup.scale.set(game.world.width/menugroup.getBounds().width);
  }
}

menubuttons.prototype.create(game)
