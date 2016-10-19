project.Pokemotions = function(game) {
  var
  txtstyle,
  questiontext,
  listgroup,
  current;
};

project.Pokemotions.prototype = {
    preload: function(){
      footergame.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10);
    },
    create: function(){
      this.game.stage.backgroundColor = 0x1c0f0c;
      txtstyle =  {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        fontSize: '36px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      questiontext = footergame.add.text(0, 0, '', txtstyle);
      listgroup = footergame.add.group();
      var _this = this;

      // this.footertext("squilibob's stream", 0);
      // this.footertext("another one", 1);

      // socket.emit("Send vote", {id:'system', vote:'best eeveelution'});
      // this.drawvotes('best eeveelution', [{name: 'Flareon', tally: 10}, {name: 'Leafeon', tally: 10}, {name:'Espeon', tally: 19}, {name: 'Jolteon', tally: 12}, {name:'Vaporeon', tally: 5}, {name: 'Umbreon', tally: 10}, {name: 'Sylveon', tally: 10}, {name: 'Glaceon', tally: 10}]);
      // this.drawvotes('who will your starter be in Sun/Moon?', [{name: 'Litten', tally: 1},{name: 'Rowlet', tally: 2},{name: 'Popplio', tally: 0}]);
      if (socket.hasListeners('receive emote') == false) socket.on('receive emote', function (payload) {
        _this.footertext(payload);
      });
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
    this.drawvotes(title, options, 320, 220);
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
        listvotes[listvotes.length] = footergame.add.graphics(0, 0);
        listvotes[listvotes.length-1].beginFill(sectioncolors[(listvotes.length-1) % sectioncolors.length]);
        listvotes[listvotes.length-1].drawRect((listvotes.length-1)*(footergame.world.width/options.length < maxwidth ? footergame.world.width/options.length : maxwidth), footergame.world.height - increment*options[option].tally, listvotes.length+(footergame.world.width/options.length < maxwidth ? footergame.world.width/options.length-20 : maxwidth-20), increment*options[option].tally);
        listvotes[listvotes.length-1].endFill();
        listtext[listtext.length] = footergame.add.text(listvotes[listvotes.length-1].getBounds().width/2+listvotes[listvotes.length-1].getBounds().x, listvotes[listvotes.length-1].getBounds().y+6 ,options[option].name + ' - ' + options[option].tally, txtstyle);
        listtext[listtext.length-1].inputEnabled = true;
        listtext[listtext.length-1].anchor.x = 0.5;
        listtext[listtext.length-1].anchor.y = listtext[listtext.length-1].getBounds().height+listtext[listtext.length-1].y > footergame.world.height ? 1 : 0;
        var placeholdy = footergame.world.height - increment*options[option].tally;
        listvotes[listvotes.length-1].y = footergame.world.height-increment*lowestvote;
        footergame.add.tween(listvotes[listvotes.length-1]).to( { y: 0}, 2000, Phaser.Easing.Bounce.Out, true);
        if (listtext[listtext.length-1].anchor.y == 0) {
          var placeholdy = listtext[listtext.length-1].y;//-listtext[listtext.length-1].getBounds().height/2;
          listtext[listtext.length-1].y = footergame.world.height-increment*lowestvote;
          footergame.add.tween(listtext[listtext.length-1]).to( { y: placeholdy}, 2000, Phaser.Easing.Bounce.Out, true);
        }
      }
      listgroup.addChild(questiontext);
      listgroup.addMultiple(listvotes);
      listgroup.addMultiple(listtext);
      listgroup.onChildInputOver.add(this.hover, this);
      listgroup.onChildInputOut.add(this.unhover, this);
      listgroup.onChildInputDown.add(this.sendvote, this);
      listgroup.x = footergame.world.width;
      listgroup.offset = 0;
      this.addtween(listgroup);
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
    footertext: function(payload){
      var message = payload.message;
      var picture = payload.picture;
      test = {
        backgroundColor: 'transparent',
        fill: "#ffffff",
        fillAlpha: 1,
        font: 'Extra-Cool',
        fontSize: 36,//window.innerWidth/75,
        stroke: 6,
      }

      newtest = [];

      newtest[newtest.length] = footergame.add.sprite(footergame.world.width, 0, 'pokemotevulpix');
      newtest[newtest.length-1].frame = picture;
      newtest[newtest.length-1].offset = 160;
      this.addtween(newtest[newtest.length-1]);

      var testarray = Array.from(message);

      for (letter in testarray) {
        newtest[newtest.length] = footergame.add.text(footergame.world.width,32,testarray[letter],test);
        newtest[newtest.length-1].alpha = 0;
        if (newtest.length-1 > 0) newtest[newtest.length-1].offset = newtest[newtest.length-2].offset + newtest[newtest.length-2].getBounds().width + 24;
        // console.log(newtest[newtest.length-2].offset, newtest[newtest.length-2].getBounds().width);
        else newtest[newtest.length-1].offset = 0;
        this.addtween(newtest[newtest.length-1]);
      }
      var tempgroup = footergame.add.group();
      tempgroup.addMultiple(newtest);
      tempgroup.y += 32;
    },
    addtween: function(obj){
      var sinData = game.math.sinCosGenerator(1337, 8, 16, 5);
      var sin = sinData.sin;
      footergame.add.tween(obj).to( { alpha: 1, fontSize: 72}, 1000, Phaser.Easing.Bounce.Out, true);
      footergame.add.tween(obj).to( { x: 0+obj.offset}, 1000, Phaser.Easing.Sinusoidal.InOut, true).chain(
      footergame.add.tween(obj).to( { alpha: 0}, 6000-obj.offset*3, Phaser.Easing.Linear.None, false));
      footergame.add.tween(obj).to({y: sin}, 500+obj.offset, Phaser.Easing.Linear.None, true);
    },
  }