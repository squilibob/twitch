project.Emote = function(game) {
  var
  menu;
};

project.Emote.prototype = {
    preload: function(){
      game.load.script('menu','/js/menubuttons.js');
      game.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10);
    },
    sendemote: function(picture){
      socket.emit('send emote', {message:game.storage.getItem('id')+'s pokemotion', picture:picture.frame});
    },
    create: function(){
      game.stage.backgroundColor = Presets.bgcolor;

      menu = this.add.group();
      menu.addMultiple(menubuttons);
      scaleup(menu);

      poke = [];
      var width =206+Presets.padding;
      var height = 236+Presets.padding;
      var x = - width;
      var y = 200;
      for (var i = 0; i < 10; i++){
        x += width;
        if (x+width > game.world.width) {
          x = 0;
          y += height;
        }
        poke[poke.length] = game.add.sprite(x, y, 'pokemotevulpix');
        poke[poke.length-1].frame = i;
        poke[poke.length-1].inputEnabled = true;
        poke[poke.length-1].events.onInputDown.add(this.sendemote);
      }
    }
  }