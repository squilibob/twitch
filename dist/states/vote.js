project.Vote = function(game) {
  var
  txtstyle,
  questiontext,
  listgroup,
  current,
  menu;
};

project.Vote.prototype = {
    preload: function(){
      game.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10);
      game.load.script('menu','/js/menubuttons.js')
    },
    create: function(){
      game.stage.backgroundColor = Presets.bgcolor;

      menu = this.add.group();
      menu.addMultiple(menubuttons);
      txtstyle =  {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        fontSize: Presets.fontsize + 'px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      questiontext = game.add.text(0, menu.getBounds().height+Presets.padding, '', txtstyle);
      listgroup = game.add.group();
      var _this = this;
      if (socket.hasListeners('receive vote') == false) socket.on('receive vote', function (payload) {
        _this.composevote(payload);
      });
      socket.emit('Request vote');
    },
    composevote: function(payload){
      var title, options = [], names;
      for (entry in payload) {
        if (payload[entry].title) title = payload[entry].title
        if (payload[entry].options) names = payload[entry].options
      }
    for (name in names) options.push({name: names[name], tally: 0});
    for (entry in payload) {
      for (vote in options) {
        if (payload[entry].vote == options[vote].name) options[vote].tally ++;
      }
    }
    this.drawvotes(title, options, 320, game.world.height-menu.getBounds().height-questiontext.getBounds().height);
    },
    drawvotes: function(title, options, maxwidth, maxheight){
      if (!sectioncolors) var sectioncolors = [
  0xeb485b,
  0x1f9b76,
  0x9f5fff,
  0xd39e14,
  0x1688c7,
  0x7f7f7f
  ];
      listgroup.removeChildren();
      var listvotes = [];
      var listtext = [];
      var increment = 0;
      var lowestvote = options[0].tally;
      questiontext.setText('vote: ' + title);
      for (option in options) {
        increment += options[option].tally;
        lowestvote = lowestvote > options[option].tally ? options[option].tally : lowestvote;
      }
      if (increment > 0) increment = (maxheight-40) / increment;
      for (option in options) {
        listvotes[listvotes.length] = game.add.graphics(0, 0);
        listvotes[listvotes.length-1].beginFill(sectioncolors[(listvotes.length-1) % sectioncolors.length]);
        listvotes[listvotes.length-1].drawRect((listvotes.length-1)*(game.world.width/options.length < maxwidth ? game.world.width/options.length : maxwidth), game.world.height - increment*options[option].tally, listvotes.length+(game.world.width/options.length < maxwidth ? game.world.width/options.length-20 : maxwidth-20), increment*options[option].tally);
        listvotes[listvotes.length-1].endFill();
        listtext[listtext.length] = game.add.text(listvotes[listvotes.length-1].getBounds().width/2+listvotes[listvotes.length-1].getBounds().x, listvotes[listvotes.length-1].getBounds().y+6 ,options[option].name + ' - ' + options[option].tally, txtstyle);
        listtext[listtext.length-1].inputEnabled = true;
        listtext[listtext.length-1].anchor.x = 0.5;
        listtext[listtext.length-1].anchor.y = listtext[listtext.length-1].getBounds().height+listtext[listtext.length-1].y > game.world.height ? 1 : 0;
        var placeholdy = game.world.height - increment*options[option].tally;
        listvotes[listvotes.length-1].y = game.world.height-increment*lowestvote;
        game.add.tween(listvotes[listvotes.length-1]).to( { y: 0}, 2000, Phaser.Easing.Bounce.Out, true);
        if (listtext[listtext.length-1].anchor.y == 0) {
          var placeholdy = listtext[listtext.length-1].y;//-listtext[listtext.length-1].getBounds().height/2;
          listtext[listtext.length-1].y = game.world.height-increment*lowestvote;
          game.add.tween(listtext[listtext.length-1]).to( { y: placeholdy}, 2000, Phaser.Easing.Bounce.Out, true);
        }
      }
      listgroup.addChild(questiontext);
      listgroup.addMultiple(listvotes);
      listgroup.addMultiple(listtext);
      listgroup.onChildInputOver.add(this.hover, this);
      listgroup.onChildInputOut.add(this.unhover, this);
      listgroup.onChildInputDown.add(this.sendvote, this);
    },
    hover: function(which){
      which.tint = "0x7f7f7f";
    },
    unhover: function(which){
      which.tint = "0xffffff";
    },
    sendvote: function(which){
      which.tint = "0xffff00";
      if (game.storage)
      console.log(game.storage.getItem("id"), which.text.substr(0,which.text.indexOf(' -')));
      socket.emit("Send vote", {id: game.storage.getItem("id"), vote:which.text.substr(0,which.text.indexOf(' -'))})
    },
}