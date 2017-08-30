let footergame = new Phaser.Game(1600, 220, Phaser.AUTO, 'footer')

project.Footer = function () {
  states = {}
}

project.Footer.prototype = {

  preload: function () {
    footergame.load.script('Pokemotions', '/states/pokemotions.js')
    // let script;
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

  loadUpdate: function () {
    // loader_elements.tween = game.add.tween(loader_elements.redgraphics).to({angle:this.load.progress*1.8}, 250, Phaser.Easing.Linear.None,true);
    // if (this.load.progress == 100) loader_elements.graphics.destroy(true);
  },

  create: function () {
    footergame.stage.disableVisibilityChange = true
    // footergame.transparent = true
    footergame.state.add('Pokemotions', project.Pokemotions)
    footergame.state.start('Pokemotions')
  }
}
footergame.state.add('Footer', project.Footer)
footergame.state.start('Footer')
