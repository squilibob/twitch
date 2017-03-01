project.Pokemotions = function(game) {
  var
  followergroup,
  followed,
  runningfolloweranimation,
  fusion,
  fusionqueue,
  runningfusionanimation,
  fx,
  decoded,
  txtstyle,
  questiontext,
  listgroup,
  player,
  enemy,
  maxvelocity,
  current;
};

project.Pokemotions.prototype = {
    preload: function(){
      footergame.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236);
      footergame.load.image('followerbg', '/img/paint.png');
      footergame.load.audiosprite('cries', '/audio/cries.ogg', '/audio/cries.json', audioJSON.cries);
      footergame.load.spritesheet('playerpoke', '/img/gen6.png', 32, 32);
      for (currentfuse = 1; currentfuse < 152; currentfuse++) {
        var cachename = 'fuse' + currentfuse;
        var currentfusion = '/img/fusion/' + currentfuse + '.png';
        var loading =  footergame.load.spritesheet(cachename, currentfusion, 240, 240);
      }
    },
    create: function(){
      followed = [];
      runningfolloweranimation = false;
      fusionqueue = [];
      runningfusionanimation = false;
      decoded = false;
      this.game.stage.backgroundColor = 0x1c0f0c;
      txtstyle =  {
        backgroundColor: 'transparent',
        boundsAlignH: "center",
        boundsAlignV: "middle",
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
      player = [];
      enemy = [];
      maxvelocity = 120;

      fx = footergame.add.audioSprite('cries');
      fx.allowMultiple = true;
      footergame.sound.setDecodedCallback(['cries'], this.playsound, this);
      this.nextround();
      this.addsocketlisteners(this);

    },
    addsocketlisteners: function(_this) {

      if (socket.hasListeners('receive emote') == false) socket.on('receive emote', function (payload) {
        _this.footertext(payload);
      });

      if (socket.hasListeners('receive vote') == false) socket.on('receive vote', function (payload) {
        _this.composevote(payload);
      });

      if (socket.hasListeners('playsound') == false)
      socket.on('playsound', function(which) {
        decoded && fx.play(which);
      });

      if (socket.hasListeners('new follower') == false)
      socket.on('new follower', function(who) {
        followed.push(who);
      });

      if (socket.hasListeners('show fusion') == false) socket.on('show fusion', function (firstpoke, secondpoke) {
        fusionqueue.push({firstpoke: firstpoke, secondpoke: secondpoke});
      });

      socket.emit('Request vote');
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
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: "#ffffff",
        fillAlpha: 1,
        font: 'Extra-Cool',
        fontSize: 36,
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
    emptyfusion: function() {
      fusion.destroy(true);
      runningfusionanimation = false;
    },
    fusionshow: function(fusions) {
      runningfusionanimation = true;
      firstpoke = fusions.firstpoke;
      secondpoke = fusions.secondpoke;
      fusion = footergame.add.sprite(0, 0, 'fuse' + firstpoke);
      fusion.frame = secondpoke-1;
      var fusionfadeout = footergame.add.tween(fusion).to({ alpha: 0 }, 8000, Phaser.Easing.Linear.None, true);
      fusionfadeout.onComplete.add(this.emptyfusion, this);
      console.log(fusion, fusionfadeout);
      // footergame.add.tween(folmask).to({ x: 0 }, 500, Phaser.Easing.Linear.None, true)
      // .chain(folfadeout);
    },
    createplayer: function(pokemon, x, y) {
      var namestyle =  {
        backgroundColor: 'transparent',
        boundsAlignH: "center",
        boundsAlignV: "middle",
        fill: Presets.fill,
        fillAlpha: 1,
        fontSize: '8px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      var offset = pokemon * 4;
      var playerpoke = footergame.add.sprite(x, y, 'playerpoke');
      game.physics.enable(playerpoke, Phaser.Physics.ARCADE);
      playerpoke.anchor.set(0.5);
      playerpoke.body.collideWorldBounds = true;
      playerpoke.scale.setTo(3);
      playerpoke.animations.add('idle', [offset, offset+1]);
      playerpoke.animations.add('walk', [offset+2, offset+3]);
      playerpoke.animations.play('walk', 4, true);
      playerpoke.body.velocity.x = -maxvelocity;
      playerpoke.addChild(footergame.add.text(0, -32, 'player', namestyle));
      playerpoke.children[0].anchor.set(0.5, 0);
      playerpoke.setHealth(100);
      playerpoke.exp = 0;
      playerpoke.addChild(footergame.add.graphics());
      // playerpoke.children[1].anchor.set(0.5, 0);
      return playerpoke;
    },
    createenemy: function(pokemon, x, y) {
      var offset = pokemon * 4;
      var playerpoke = footergame.add.sprite(x, y, 'playerpoke');
      game.physics.enable(playerpoke, Phaser.Physics.ARCADE);
      playerpoke.anchor.set(0.5);
      playerpoke.body.collideWorldBounds = true;
      playerpoke.scale.setTo(3);
      playerpoke.animations.add('idle', [offset, offset+1]);
      playerpoke.animations.add('walk', [offset+2, offset+3]);
      playerpoke.animations.play('idle', 4, true);
      playerpoke.setHealth(100);
      playerpoke.addChild(footergame.add.graphics());
      return playerpoke;
    },
    nextround: function(){
      // player[0] = this.createplayer(50, footergame.world.width / 2, footergame.world.height / 2);
      // player[1] = this.createplayer(200, footergame.world.width / 2 + 400, footergame.world.height / 2);
      enemy[0] = this.createenemy(100, footergame.world.width / 2, footergame.world.height / 2);
    },
    toggleplayerdirection: function(whichplayer){
      whichplayer.body.velocity.x *= -1;
      whichplayer.scale.x *= -1;
      whichplayer.children[0].scale.x = Math.sign(whichplayer.scale.x);
    },
    checkBounds: function(){
      for (checkplayer of player) {
        var playerdirection = Math.sign(checkplayer.body.velocity.x);
        if ((checkplayer.x-maxvelocity < 0 && playerdirection == -1) || (checkplayer.x+maxvelocity >= footergame.world.width && playerdirection == 1)) {
          this.toggleplayerdirection(checkplayer);
        }
      }
    },
    checkHP: function(){
      for (checkplayer of player) {
        (checkplayer.health < 1) && checkplayer.kill();
        barcolor = parseInt('0x50' + ('00' + Math.floor(checkplayer.health/100 * 255).toString(16)).substr(-2) + '00', 16);
        checkplayer.children[1]
          .clear()
          .lineStyle(1, 0xffffff, 0.5)
          .beginFill(barcolor)
          .drawRect(-16 * checkplayer.health / 100, -20, 32 * checkplayer.health / 100, 6)
          .endFill();
      }
      for (checkenemy of enemy) {
        (checkenemy.health < 1) && checkenemy.kill();
        barcolor = parseInt('0x' + ('00' + Math.floor(checkenemy.health/100 * 255).toString(16)).substr(-2) + '0000', 16);
        checkenemy.children[0]
          .clear()
          .lineStyle(1, 0xffffff, 0.5)
          .beginFill(barcolor)
          .drawRect(-16 * checkenemy.health / 100, -20, 32 * checkenemy.health / 100, 6)
          .endFill();
      }
    },
    update: function(){
      if (followed.length && !runningfolloweranimation) this.followershow(followed.shift());
      if (fusionqueue.length && !runningfusionanimation) this.fusionshow(fusionqueue.shift());
      this.checkBounds();
      this.checkHP();
      enemy[0].setHealth(enemy[0].health - 0.25);
      // player[0].setHealth(player[0].health - 0.1);
    }
  }