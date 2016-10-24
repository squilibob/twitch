project.Emote = function(game) {
  var
  gameTimer,
  startTime,
  totalTime,
  timeElapsed,
  canSend,
  menu;
};

project.Emote.prototype = {
    preload: function(){
      game.load.script('menu','/js/menubuttons.js');
      game.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10);
    },
    sendemote: function(picture){
      console.log(canSend);
      if (canSend == true){
        canSend = false;
        socket.emit('send emote', {message:game.storage.getItem('id')+'s pokemotion', picture:picture.frame});
      }
    },
    updateTimer: function(){
        var currentTime = new Date();
        var timeDifference = startTime.getTime() - currentTime.getTime();
        timeElapsed = Math.abs(timeDifference / 1000);
    },
    update: function () {
      if(timeElapsed >= totalTime){
          canSend = true;
          timeElapsed = 0;
          startTime = new Date();
      }
    },
    create: function(){
      game.stage.backgroundColor = Presets.bgcolor;

      menu = this.add.group();
      menu.addMultiple(menubuttons);
      scaleup(menu);

      canSend = true;
      startTime = new Date();
      totalTime = 12;
      timeElapsed = 0;

      var me = this;
      gameTimer = game.time.events.loop(100, function(){
          me.updateTimer();
      });

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