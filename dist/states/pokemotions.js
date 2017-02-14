project.Pokemotions = function(game) {
  var
  followergroup,
  followed,
  runningfolloweranimation,
  fx,
  decoded,
  txtstyle,
  questiontext,
  listgroup,
  current;
};

project.Pokemotions.prototype = {
    preload: function(){
      footergame.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236, 10);
      footergame.load.image('followerbg', '/img/paint.png');
      footergame.load.audiosprite('cries', '/audio/cries.ogg', '/audio/cries.json', audioJSON.cries);
    },
    create: function(){
      followed = [];
      runningfolloweranimation = false;
      decoded = false;
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

      if (socket.hasListeners('receive emote') == false) socket.on('receive emote', function (payload) {
        _this.footertext(payload);
      });
      if (socket.hasListeners('receive vote') == false) socket.on('receive vote', function (payload) {
        _this.composevote(payload);
      });
      socket.emit('Request vote');

      fx = footergame.add.audioSprite('cries');
      fx.allowMultiple = true;
      footergame.sound.setDecodedCallback(['cries'], this.playsound, this);

      if (socket.hasListeners('playsound') == false)
      socket.on('playsound', function(which) {
        decoded && fx.play(which);
      });

      if (socket.hasListeners('new follower') == false)
      socket.on('new follower', function(who) {
        followed.push(who);
      });
    },
    followershow: function(person) {
      runningfolloweranimation = true;
      var fol = [];
      followergroup = footergame.add.group();
      fol[0] = footergame.add.sprite(0, 0, 'followerbg');
      var folscale = footergame.world.height / fol[0].height ;
      fol[0].scale.setTo(folscale);
      fol[1] = footergame.add.text(0, 0, person, txtstyle);
      fol[1].x = fol[0].x + fol[0].width - fol[1].width - 64;
      fol[1].y = fol[0].height / 4;
      fol[2] = footergame.add.text(0, 0, 'follow', txtstyle);
      fol[2].x = fol[0].x + fol[0].width - fol[2].width - 64;
      fol[2].y = fol[1].height / 2 + fol[1].y + 8;
      followergroup.addMultiple(fol)
      followergroup.x = footergame.world.width - followergroup.width;
      var folmask = footergame.add.graphics();
      folmask.beginFill(0x000000);
      folmask.drawRect(followergroup.x, followergroup.y, followergroup.width, followergroup.height);
      folmask.endFill();
      folmask.x = followergroup.width;
      followergroup.mask = folmask;
      // followergroup.alpha = 0.2;
      var folfadeout = footergame.add.tween(followergroup).to({ alpha: 0 }, 4000, Phaser.Easing.Linear.None, false);
      folfadeout.onComplete.add(this.emptygroup, this);
      footergame.add.tween(folmask).to({ x: 0 }, 500, Phaser.Easing.Linear.None, true)
      .chain(folfadeout);
    },
    emptygroup: function() {
      followergroup.destroy(true, true);
      runningfolloweranimation = false;
    },
    playsound: function(){
      decoded = true;
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
      // tempgroup.y += 32;
    },
    addtween: function(obj){
      var sinData = game.math.sinCosGenerator(1337, 8, 16, 5);
      var sin = sinData.sin;
      footergame.add.tween(obj).to( { alpha: 1, fontSize: 72}, 1000, Phaser.Easing.Bounce.Out, true);
      footergame.add.tween(obj).to( { x: 0+obj.offset}, 1000, Phaser.Easing.Sinusoidal.InOut, true).chain(
      footergame.add.tween(obj).to( { alpha: 0}, 6000-obj.offset*3, Phaser.Easing.Linear.None, false));
      footergame.add.tween(obj).to({y: sin}, 500+obj.offset, Phaser.Easing.Linear.None, true);
    },
    update: function(){
      if (followed.length && !runningfolloweranimation) this.followershow(followed.shift());
    }
  }