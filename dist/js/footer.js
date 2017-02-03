var footergame = new Phaser.Game(1600, 220, Phaser.AUTO, "footer");
var project = {};
var teams;
var team_name;
var loader_elements = {};
var audioJSON = {};

project.Footer = function () {
  states = {};
};

project.Footer.prototype = {

  preload: function () {
    footergame.load.json('audiojsoncries', '/audio/cries.json');
    footergame.load.script('Pokemotions', '/states/pokemotions.js');
    // {'Pokemotions': '/states/pokemotions'},
    // var script;
    // for (testscript in preloadscripts) {
    //   if (typeof(preloadscripts[testscript]) == 'object')
    //     for (key in preloadscripts[testscript]) {
    //       script = preloadscripts[testscript][key];
    //       states[key] = this.filename(script);
    //     }
    //   else script = preloadscripts[testscript];
    //   game.load.script(this.filename(script), script + '.js');
    // }
    // game.load.json('userJSON', 'https://api.twitch.tv/kraken/users/'+localStorage.getItem("id"));
  },

  loadUpdate: function(){
    // loader_elements.tween = game.add.tween(loader_elements.redgraphics).to({angle:this.load.progress*1.8}, 250, Phaser.Easing.Linear.None,true);
    // if (this.load.progress == 100) loader_elements.graphics.destroy(true);
  },

  create: function () {
    audioJSON.cries = footergame.cache.getJSON('audiojsoncries');
    footergame.stage.disableVisibilityChange = true;
    footergame.state.add('Pokemotions', project.Pokemotions);
    footergame.state.start('Pokemotions');
  },
};
footergame.state.add('Footer', project.Footer);
footergame.state.start('Footer');

