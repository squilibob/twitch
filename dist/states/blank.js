project.Blank = (function (game) {
  let
  menu
})

project.Blank.prototype = {
  preload: function () {
    game.load.script('menu', '/js/menubuttons.js')
  },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)
  }
}
