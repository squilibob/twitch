var menubuttons = [];

menubuttons.prototype = {
  onClick: function(name){
    game.state.start(this.toString(), Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);
  },
  addButton: function(text, color, nextstate){
    var x = buttonstyle.x;
    var y = buttonstyle.y;
    for (var nextbutton = 1; nextbutton <= menubuttons.length; nextbutton++)
      buttonstyle.horizontalorientation ? x += menubuttons[nextbutton-1].children[0].graphicsData[0].shape.width : y += menubuttons[nextbutton-1].children[0].graphicsData[0].shape.height;
    textButton.define(menubuttons[menubuttons.length] = game.add.group(), game, text, x, y, color);
    menubuttons[menubuttons.length-1].onChildInputDown.add(this.onClick, nextstate);
  },
  create: function(game){
    var nextcolor = 0;
    for (statename in states) {
      this.addButton(statename, sectioncolors[nextcolor], statename);
      nextcolor = (nextcolor + 1) % sectioncolors.length;
    }
  },
}

menubuttons.prototype.create(game);