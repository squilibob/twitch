// Pokemon sprite
// pokemon name
// 4 stats in a diamond
// level
// types

project.Cards = function (game) {
  var
    cards,
    cardsgroup,
    menu
}

project.Cards.prototype = {
  preload: function () {
    game.load.script('menu', '/js/menubuttons.js')
    game.load.spritesheet('spritesheet', spritesheet.src, spritesheet.x, spritesheet.y, maxpokes)
  },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)

    var MAXHEIGHT = 384
    var LINEWIDTH = 8
    var FILLCOLOR = 0x71bcfd
    var LINECOLOR = 0xa86bfb
    var strokecolor = 0xb8dbff
    var numbercolor = 0xffffff

    var FILLCOLOR2 = 0xfdad71
    var LINECOLOR2 = 0xfdfc71
    var strokecolor2 = 0xfec3b7

    var BACKCOLOR = 0x333232
    var POKEMONS = 36
    var color = 0xcbe4ff
    var scaled = 0.6
    var blocked = 32

    cardsgroup = []
    cards = JSON.parse(game.storage.getItem('cards'))
    for (card in cards) {
      this.card(cardsgroup[cardsgroup.length] = this.add.group(), blocked + card * 256 * scaled, buttonstyle.horizontalorientation ? menu.getBounds().height + Presets.padding * 2 : 0, cards[card].poke, cards[card].level, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR)
      setScale(cardsgroup[cardsgroup.length - 1], 0.6)
    }

    // this.card(cardtemplate = this.add.group(), blocked+0, 150, POKEMONS, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // setScale(cardtemplate, 0.6);
    // this.card(card2 = this.add.group(), blocked+256*scaled, 150, 569, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card3 = this.add.group(), blocked+512*scaled, 150, 185, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card4 = this.add.group(), blocked+768*scaled, 150, 694, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card5 = this.add.group(), blocked+0, 158+MAXHEIGHT*scaled, 714, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card6 = this.add.group(), blocked+256*scaled, 158+MAXHEIGHT*scaled, 207, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card7 = this.add.group(), blocked+512*scaled, 158+MAXHEIGHT*scaled, 183, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card8 = this.add.group(), blocked+768*scaled, 158+MAXHEIGHT*scaled, 629, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card11 = this.add.group(), blocked, MAXHEIGHT*scaled*2+156, 24, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card12 = this.add.group(), blocked+256*scaled, MAXHEIGHT*scaled*2+156, 69, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card13 = this.add.group(), blocked+512*scaled, MAXHEIGHT*scaled*2+156, 85, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card14 = this.add.group(), blocked+768*scaled, MAXHEIGHT*scaled*2+156, 94, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card15 = this.add.group(), blocked+0, MAXHEIGHT*scaled*2+158+MAXHEIGHT*scaled, 14, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card16 = this.add.group(), blocked+256*scaled, MAXHEIGHT*scaled*2+158+MAXHEIGHT*scaled, 07, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);
    // this.card(card17 = this.add.group(), blocked+512*scaled, MAXHEIGHT*scaled*2+158+MAXHEIGHT*scaled, 83, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR2, LINECOLOR2, color, strokecolor2, numbercolor, BACKCOLOR);
    // this.card(card18 = this.add.group(), blocked+768*scaled, MAXHEIGHT*scaled*2+158+MAXHEIGHT*scaled, 29, 1, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR);

    // setScale(card2, scaled);
    // setScale(card3, scaled);
    // setScale(card4, scaled);
    // setScale(card5, scaled);
    // setScale(card6, scaled);
    // setScale(card7, scaled);
    // setScale(card8, scaled);
    // setScale(card11, scaled);
    // setScale(card12, scaled);
    // setScale(card13, scaled);
    // setScale(card14, scaled);
    // setScale(card15, scaled);
    // setScale(card16, scaled);
    // setScale(card17, scaled);
    // setScale(card18, scaled);
  },
  card: function (group, x, y, POKEMONS, LEVEL, MAXHEIGHT, LINEWIDTH, FILLCOLOR, LINECOLOR, color, strokecolor, numbercolor, BACKCOLOR) {
    var graphics = []
    graphics[0] = game.add.graphics(0, 0)
    graphics[0].beginFill(BACKCOLOR, 1)
    graphics[0].drawRoundedRect(0, 0, 256, MAXHEIGHT)
    graphics[0].endFill()

    graphics[1] = game.add.sprite(128, MAXHEIGHT / 2, 'spritesheet')
    graphics[1].anchor.setTo(0.5)
    graphics[1].scale.setTo(3)
    graphics[1].frame = POKEMONS

    var newtextstyle = {
      font: 'Extra-Cool',
      fontSize: '30px ',
                // fontSize: Presets.fontsize.toString() + 'px ',
      fill: hexstring(color),
      backgroundColor: 'transparent',
      strokeThickness: 0,
      fillAlpha: 1,
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }

    graphics[2] = game.add.text(0, 0, pokedex[POKEMONS].Pokemon.toLowerCase(), newtextstyle)
    graphics[2].setTextBounds(graphics[1].x, graphics[1].y + graphics[graphics.length - 1].getBounds().height / 2 + graphics[1].scale.y * graphics[1].getBounds().height / 2)
    graphics[2].anchor.setTo(0.5)

    graphics[3] = game.add.text(0, 0, LEVEL, newtextstyle)
    graphics[3].setTextBounds(graphics[1].x, graphics[1].y - graphics[graphics.length - 1].getBounds().height / 2 - graphics[1].scale.y * graphics[1].getBounds().height / 2)
    graphics[3].anchor.setTo(0.5, 0.25)

    graphics[4] = game.add.text(0, 0, 'level', newtextstyle)
    graphics[4].anchor.setTo(0.5)
    graphics[4].setTextBounds(graphics[1].x, graphics[1].y - graphics[graphics.length - 1].getBounds().height / 2 - graphics[graphics.length - 2].getBounds().height / 2 - graphics[1].scale.y * graphics[1].getBounds().height / 2)

    graphics[5] = game.add.graphics(0, 0)
    graphics[5].beginFill(FILLCOLOR)
    graphics[5].lineStyle(LINEWIDTH, LINECOLOR, 1)
    graphics[5].moveTo(256 + LINEWIDTH, MAXHEIGHT / 2 - 81)
    graphics[5].lineTo(256 + LINEWIDTH, MAXHEIGHT / 2 + 81)
    graphics[5].lineTo(256 - 72, MAXHEIGHT / 2)
    graphics[5].lineTo(256 + LINEWIDTH, MAXHEIGHT / 2 - 81)
    graphics[5].endFill()

    graphics[6] = game.add.graphics(0, 0)
    graphics[6].beginFill(FILLCOLOR)
    graphics[6].lineStyle(LINEWIDTH, LINECOLOR, 1)
    graphics[6].moveTo(48, -LINEWIDTH)
    graphics[6].lineTo(210, -LINEWIDTH)
    graphics[6].lineTo(128, 72)
    graphics[6].lineTo(48, -LINEWIDTH)
    graphics[6].endFill()

    graphics[7] = game.add.graphics(0, 0)
    graphics[7].beginFill(FILLCOLOR)
    graphics[7].lineStyle(LINEWIDTH, LINECOLOR, 1)
    graphics[7].moveTo(48, MAXHEIGHT + LINEWIDTH)
    graphics[7].lineTo(210, MAXHEIGHT + LINEWIDTH)
    graphics[7].lineTo(128, MAXHEIGHT - 72)
    graphics[7].lineTo(48, MAXHEIGHT + LINEWIDTH)
    graphics[7].endFill()

    graphics[8] = game.add.graphics(0, 0)
    graphics[8].beginFill(FILLCOLOR)
    graphics[8].lineStyle(LINEWIDTH, LINECOLOR, 1)
    graphics[8].moveTo(-LINEWIDTH, MAXHEIGHT / 2 - 81)
    graphics[8].lineTo(-LINEWIDTH, MAXHEIGHT / 2 + 81)
    graphics[8].lineTo(72, MAXHEIGHT / 2)
    graphics[8].lineTo(-LINEWIDTH, MAXHEIGHT / 2 - 81)
    graphics[8].endFill()

    newtextstyle.fontSize = '64px'
    newtextstyle.fill = hexstring(numbercolor)
    newtextstyle.stroke = hexstring(strokecolor)
    newtextstyle.strokeThickness = 6
    var value = Math.floor((pokedex[POKEMONS]['Sp. Attack'] / 10 + pokedex[POKEMONS]['Sp. Defense']) / 2) % 10
    if (value == 0) value = '+'
    graphics[9] = game.add.text(256 - LINEWIDTH, MAXHEIGHT / 2, value, newtextstyle)
    graphics[9].anchor.setTo(0.85, 0.5)

    value = Math.floor(pokedex[POKEMONS].Speed / 10) % 10
    if (value == 0) value = '+'
    graphics[10] = game.add.text(128, LINEWIDTH, value, newtextstyle)
    graphics[10].anchor.setTo(0.5, 0.25)

    value = Math.floor(pokedex[POKEMONS].HP / 10) % 10
    if (value == 0) value = '+'
    graphics[11] = game.add.text(128, MAXHEIGHT - LINEWIDTH, value, newtextstyle)
    graphics[11].anchor.setTo(0.5, 0.75)

    value = Math.floor((pokedex[POKEMONS].Attack / 10 + pokedex[POKEMONS].Defense) / 2) % 10
    if (value == 0) value = '+'
    graphics[12] = game.add.text(LINEWIDTH, MAXHEIGHT / 2, value, newtextstyle)
    graphics[12].anchor.setTo(0.15, 0.5)

    group.addMultiple(graphics)
    MASKER = game.add.graphics(0, 0)
    MASKER.beginFill(BACKCOLOR, 1)
    MASKER.drawRoundedRect(0, 0, 256, MAXHEIGHT)
    MASKER.endFill()
    group.mask = MASKER

    group.x = MASKER.x = x
    group.y = MASKER.y = y

    return group
  }
}

// project.Main = function(game) {
//   var buttons;
// };

// project.Main.prototype = {
//   onClick: function(name){
//     game.state.start(this.toString());
//   },
//   getWidth: function(whichButton){
//     return whichButton.children[0].graphicsData[0].shape.width;
//   },
//   addButton: function(text, color, nextstate){
//     var x = buttonstyle.position.x;
//     for (var nextbutton = 1; nextbutton <= buttons.length; nextbutton++)
//       x += this.getWidth(buttons[nextbutton-1]);
//     textButton.define(buttons[buttons.length] = this.add.group(), this, text, x, buttonstyle.position.y, color);
//     buttons[buttons.length-1].onChildInputDown.add(this.onClick, nextstate);
//   },
//   create: function(){
//     buttons = [];
//     this.game.stage.backgroundColor = Presets.bgcolor;
//     this.addButton('Raffle', 0xff8000, 'Login');
//     this.addButton('Go!', 0x00ff00, 'Login');
//     this.addButton('PLAY', 0x0080ff, 'Login');
//   },
// }
