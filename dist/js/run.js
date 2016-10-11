var game = new Phaser.Game(Presets.width, Presets.height, Phaser.AUTO, "content");

var project = {};
var teams;
var team_name;

project.Init = function () {
  states = {};
  var
  graphics,
  redgraphics,
  whitegraphics,
  blackgraphics,
  smallgraphics;
};

project.Init.prototype = {

  preload: function () {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    var radius = game.world.height /4;

    graphics = this.add.group();

    redgraphics = game.add.graphics(0,0);
    redgraphics
      .clear()
      .beginFill(0xeb485b)
      .arc(0,0, radius, 3.14, 0, true, 360)
      .endFill();
      redgraphics.anchor.setTo(0.5);
      redgraphics.x = game.world.centerX;
      redgraphics.y = radius;

    whitegraphics = game.add.graphics(0,0);
    whitegraphics
      .clear()
      .beginFill(0xffffff)
      .arc(0,0, radius, 3.14, 0, true, 360)
      .endFill();
      whitegraphics.anchor.setTo(0.5);
      whitegraphics.x = game.world.centerX;
      whitegraphics.y = radius;

    blackgraphics = game.add.graphics(0,0);
    blackgraphics
      .clear()
      .beginFill(0x000000)
      .drawCircle(0,0, radius*0.75)
      .endFill();
      blackgraphics.anchor.setTo(0.5);
      blackgraphics.x = game.world.centerX;
      blackgraphics.y = radius;

    smallgraphics = game.add.graphics(0,0);
    smallgraphics
      .clear()
      .beginFill(0xffffff)
      .drawCircle(0,0, radius/2)
      .endFill();
      smallgraphics.anchor.setTo(0.5);
      smallgraphics.x = game.world.centerX;
      smallgraphics.y = radius;

      graphics.addChild(redgraphics);
      graphics.addChild(whitegraphics);
      graphics.addChild(blackgraphics);
      graphics.addChild(smallgraphics);


    var script;
    for (testscript in preloadscripts) {
      if (typeof(preloadscripts[testscript]) == 'object')
        for (key in preloadscripts[testscript]) {
          script = preloadscripts[testscript][key];
          states[key] = this.filename(script);
        }
      else script = preloadscripts[testscript];
      game.load.script(this.filename(script), script + '.js');
    }
    // game.load.json('userJSON', 'https://api.twitch.tv/kraken/users/'+localStorage.getItem("id"));
  },

  loadUpdate: function(){
    // if (redgraphics.angle > -1)
    redgraphics.angle = this.load.progress*1.8;
    if (this.load.progress == 100) graphics.destroy(true);
  },

  create: function () {
    game.plugins.add(Fabrique.Plugins.InputField);
    game.plugins.add(Fabrique.Plugins.SuperStorage);
    for (statename in states)
      game.state.add(statename, project[statename]);
    this.socketready = new Phaser.Signal();
    this.socketready.add(this.ready, this);
    pokedex = JSON.parse(game.storage.getItem("pokedex"));
    typechart = JSON.parse(game.storage.getItem("typechart"));
    if (pokedex && typechart) {
      if (typechart.length != 19) this.populatetypechart();
      if (pokedex.length < maxpokes) this.populatedata();
    }
    else {
      typechart = [];
      pokedex = [];
      this.populatetypechart();
      this.populatedata();
    }

      // var userJSON = game.cache.getJSON('userJSON');
      // localStorage.setItem('twitchlogo', userJSON.logo);
  },

  update: function(){
    if (pokedex) {
      if (pokedex.length >= maxpokes) this.socketready.dispatch();
    }
  },

  populatetypechart: function(){
    for (var i=0; i <= 18; i++) {
      socket.emit('Ask for typechart',i);
    }
  },

  populatedata: function(){
    for (var i=1; i <= maxpokes; i++) {
      socket.emit('Ask for pokedex',i);
    }
  },

  ready: function() {
    game.state.start('Login', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);
    // game.state.start('Cards');
  },

  filename: function(string){
    return string.substr(string.lastIndexOf('/')+1);
  }

};
game.state.add('Init', project.Init);
game.state.start('Init', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);
