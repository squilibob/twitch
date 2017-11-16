project.Blank = (function (game) {
  let
  menu
})

project.Blank.prototype = {
  // preload: function () {
  //   game.load.script('menu', '/js/menubuttons.js')
  // },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor
    game.add.text(20,20,"This will be back soon!", {
      backgroundColor: 'transparent',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: Presets.fontsize.toString() + 'px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    })
    // menu = this.add.group()
    // menu.addMultiple(menubuttons)
    // scaleup(menu)
  }
}
