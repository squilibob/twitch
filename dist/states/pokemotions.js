project.Pokemotions = function (game) {
  var
    fusion,
    fusionqueue,
    runningfusionanimation,
    leftfuse,
    rightfuse,
    txtstyle,
    questiontext,
    listgroup,
    player,
    enemy,
    maxvelocity,
    current
}

project.Pokemotions.prototype = {
  preload: function () {
    footergame.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236)
    footergame.load.spritesheet('playerpoke', '/img/gen6.png', 32, 32)
    for (currentfuse = 1; currentfuse < 152; currentfuse++) {
      var cachename = 'fuse' + currentfuse
      var currentfusion = '/img/fusion/' + currentfuse + '.png'
      var loading = footergame.load.spritesheet(cachename, currentfusion, 240, 240)
    }
  },
  create: function () {
    fusionqueue = []
    runningfusionanimation = false
    this.game.stage.backgroundColor = 0x1c0f0c
    txtstyle = {
      backgroundColor: 'transparent',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: '36px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }
    questiontext = footergame.add.text(0, 0, '', txtstyle)
    listgroup = footergame.add.group()
    player = []
    enemy = []
    maxvelocity = 36
    this.firstround()
    this.addsocketlisteners(this)
  },
  addsocketlisteners: function (_this) {
    if (socket.hasListeners('receive emote') == false) {
      socket.on('receive emote', function (payload) {
        _this.footertext(payload)
      })
    }

    if (socket.hasListeners('receive vote') == false) {
      socket.on('receive vote', function (payload) {
        _this.composevote(payload)
      })
    }

    if (socket.hasListeners('receive new player') == false) {
      socket.on('receive new player', function (payload) {
        player.push(_this.createplayer(payload.poke, footergame.world.width / 2, footergame.world.height / 2, payload.name))
      })
    }

    if (socket.hasListeners('show fusion') == false) {
      socket.on('show fusion', function (firstpoke, secondpoke) {
        fusionqueue.push({firstpoke: firstpoke, secondpoke: secondpoke})
      })
    }

    socket.emit('Request vote')
  },
  composevote: function (payload) {
    var title, options = [], names
    for (entry in payload) {
      if (payload[entry].title) title = payload[entry].title
      if (payload[entry].options) names = payload[entry].options
    }
    for (name in names) options.push({name: names[name], tally: 0})
    for (entry in payload) {
      for (vote in options) {
        if (payload[entry].vote == options[vote].name) options[vote].tally ++
      }
    }
    this.drawvotes(title, options, 320, 220)
  },
  drawvotes: function (title, options, maxwidth, maxheight) {
    if (!sectioncolors) {
      var sectioncolors = [
        0xeb485b,
        0x1f9b76,
        0x9f5fff,
        0xd39e14,
        0x1688c7,
        0x7f7f7f
      ]
    }
    listgroup.removeChildren()
    var listvotes = []
    var listtext = []
    var increment = 0
    var lowestvote = options[0].tally
    questiontext.setText('vote: ' + title)
    for (option in options) {
      increment += options[option].tally
      lowestvote = lowestvote > options[option].tally ? options[option].tally : lowestvote
    }
    if (increment > 0) increment = (maxheight - 40) / increment
    for (option in options) {
      listvotes[listvotes.length] = footergame.add.graphics(0, 0)
      listvotes[listvotes.length - 1].beginFill(sectioncolors[(listvotes.length - 1) % sectioncolors.length])
      listvotes[listvotes.length - 1].drawRect((listvotes.length - 1) * (footergame.world.width / options.length < maxwidth ? footergame.world.width / options.length : maxwidth), footergame.world.height - increment * options[option].tally, listvotes.length + (footergame.world.width / options.length < maxwidth ? footergame.world.width / options.length - 20 : maxwidth - 20), increment * options[option].tally)
      listvotes[listvotes.length - 1].endFill()
      listtext[listtext.length] = footergame.add.text(listvotes[listvotes.length - 1].getBounds().width / 2 + listvotes[listvotes.length - 1].getBounds().x, listvotes[listvotes.length - 1].getBounds().y + 6, options[option].name + ' - ' + options[option].tally, txtstyle)
      listtext[listtext.length - 1].inputEnabled = true
      listtext[listtext.length - 1].anchor.x = 0.5
      listtext[listtext.length - 1].anchor.y = listtext[listtext.length - 1].getBounds().height + listtext[listtext.length - 1].y > footergame.world.height ? 1 : 0
      var placeholdy = footergame.world.height - increment * options[option].tally
      listvotes[listvotes.length - 1].y = footergame.world.height - increment * lowestvote
      footergame.add.tween(listvotes[listvotes.length - 1]).to({ y: 0}, 2000, Phaser.Easing.Bounce.Out, true)
      if (listtext[listtext.length - 1].anchor.y == 0) {
        var placeholdy = listtext[listtext.length - 1].y// -listtext[listtext.length-1].getBounds().height/2;
        listtext[listtext.length - 1].y = footergame.world.height - increment * lowestvote
        footergame.add.tween(listtext[listtext.length - 1]).to({ y: placeholdy}, 2000, Phaser.Easing.Bounce.Out, true)
      }
    }
    listgroup.addChild(questiontext)
    listgroup.addMultiple(listvotes)
    listgroup.addMultiple(listtext)
    listgroup.onChildInputOver.add(this.hover, this)
    listgroup.onChildInputOut.add(this.unhover, this)
    listgroup.onChildInputDown.add(this.sendvote, this)
    listgroup.x = footergame.world.width
    listgroup.offset = 0
    this.addtween(listgroup)
  },
  hover: function (which) {
    which.tint = '0x7f7f7f'
  },
  unhover: function (which) {
    which.tint = '0xffffff'
  },
  sendvote: function (which) {
    which.tint = '0xffff00'
    if (game.storage) { socket.emit('Send vote', {id: game.storage.getItem('id'), vote: which.text.substr(0, which.text.indexOf(' -'))}) }
  },
  footertext: function (payload) {
    var message = payload.message
    var picture = payload.picture
    test = {
      backgroundColor: 'transparent',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fill: '#ffffff',
      fillAlpha: 1,
      font: 'Extra-Cool',
      fontSize: 36,
      stroke: 6
    }

    newtest = []

    newtest[newtest.length] = footergame.add.sprite(footergame.world.width, 0, 'pokemotevulpix')
    newtest[newtest.length - 1].frame = picture
    newtest[newtest.length - 1].offset = 160
    this.addtween(newtest[newtest.length - 1])

    var testarray = Array.from(message)

    for (letter in testarray) {
      newtest[newtest.length] = footergame.add.text(footergame.world.width, 32, testarray[letter], test)
      newtest[newtest.length - 1].alpha = 0
      if (newtest.length - 1 > 0) newtest[newtest.length - 1].offset = newtest[newtest.length - 2].offset + newtest[newtest.length - 2].getBounds().width + 24
      else newtest[newtest.length - 1].offset = 0
      this.addtween(newtest[newtest.length - 1])
    }
    var tempgroup = footergame.add.group()
    tempgroup.addMultiple(newtest)
      // tempgroup.y += 32;
  },
  addtween: function (obj) {
    var sinData = footergame.math.sinCosGenerator(1337, 8, 16, 5)
    var sin = sinData.sin
    footergame.add.tween(obj).to({ alpha: 1, fontSize: 72}, 1000, Phaser.Easing.Bounce.Out, true)
    footergame.add.tween(obj).to({ x: 0 + obj.offset}, 1000, Phaser.Easing.Sinusoidal.InOut, true).chain(
      footergame.add.tween(obj).to({ alpha: 0}, 6000 - obj.offset * 3, Phaser.Easing.Linear.None, false))
    footergame.add.tween(obj).to({y: sin}, 500 + obj.offset, Phaser.Easing.Linear.None, true)
  },
  emptyfusion: function () {
    fusion.destroy(true)
    runningfusionanimation = false
  },
  destroy: function () {
    leftfuse.destroy(true)
    rightfuse.destroy(true)
    this.fusionmake()
  },
  fusionshow: function (fusions) {
    runningfusionanimation = true
    firstpoke = fusions.firstpoke
    secondpoke = fusions.secondpoke
    leftfuse = footergame.add.sprite(0, 0, 'fuse' + firstpoke)
    leftfuse.frame = firstpoke - 1
    rightfuse = footergame.add.sprite(footergame.width - 240, 0, 'fuse' + secondpoke)
    rightfuse.frame = secondpoke - 1
    fusion = footergame.add.sprite(footergame.world.centerX, 0, 'fuse' + firstpoke)
    fusion.frame = secondpoke - 1
    fusion.alpha = 0
    footergame.add.tween(leftfuse).to({ x: footergame.world.centerX - 120 }, 1000, Phaser.Easing.Sinusoidal.In, true)
    footergame.add.tween(rightfuse).to({ x: footergame.world.centerX - 120 }, 1000, Phaser.Easing.Sinusoidal.In, true)
      .onComplete.add(this.destroy, this)
  },
  fusionmake: function () {
    var fusionfadeout = footergame.add.tween(fusion).to({ alpha: 0 }, 8000, Phaser.Easing.Linear.None, false)
    fusionfadeout.onComplete.add(this.emptyfusion, this)
    footergame.add.tween(fusion).to({ alpha: 1 }, 250, Phaser.Easing.Linear.None, true)
      .chain(fusionfadeout)
  },
  createplayer: function (pokemon, x, y, username) {
    var namestyle = {
      backgroundColor: 'transparent',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fill: Presets.fill,
      fillAlpha: 1,
      fontSize: '8px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }
    var offset = pokemon * 4
    var playerpoke = footergame.add.sprite(x, y, 'playerpoke')
    game.physics.enable(playerpoke, Phaser.Physics.ARCADE)
    playerpoke.anchor.set(0.5)
    playerpoke.body.collideWorldBounds = true
    playerpoke.scale.setTo(3)
    playerpoke.animations.add('idle', [offset, offset + 1])
    playerpoke.animations.add('walk', [offset + 2, offset + 3])
    playerpoke.animations.play('walk', 4, true)
    playerpoke.body.velocity.x = -maxvelocity
    playerpoke.addChild(footergame.add.text(0, -32, username, namestyle))
    playerpoke.children[0].anchor.set(0.5, 0)
    playerpoke.setHealth(100)
    playerpoke.exp = 0
    playerpoke.addChild(footergame.add.graphics())
      // playerpoke.children[1].anchor.set(0.5, 0);
    return playerpoke
  },
  createenemy: function (pokemon, x, y) {
    var offset = pokemon * 4
    var playerpoke = footergame.add.sprite(x, y, 'playerpoke')
    footergame.physics.enable(playerpoke, Phaser.Physics.ARCADE)
    playerpoke.anchor.set(0.5)
    playerpoke.body.collideWorldBounds = true
    playerpoke.scale.setTo(3)
    playerpoke.animations.add('idle', [offset, offset + 1])
    playerpoke.animations.add('walk', [offset + 2, offset + 3])
    playerpoke.animations.play('idle', 4, true)
    playerpoke.setHealth(100)
    playerpoke.addChild(footergame.add.graphics())
    return playerpoke
  },
  firstround: function () {
      // player[0] = this.createplayer(25, footergame.world.width / 2, footergame.world.height / 2, 'player1');
      // player[1] = this.createplayer(25, footergame.world.width / 2 + 400, footergame.world.height / 2, 'player2');
      // player[2] = this.createplayer(25, footergame.world.width / 2 + 580, footergame.world.height / 2, 'player3');
    enemy[0] = this.createenemy(19, footergame.world.width / 2 - 200, footergame.world.height / 2)
    enemy[1] = this.createenemy(19, footergame.world.width / 2 - 100, footergame.world.height / 2)
    enemy[2] = this.createenemy(19, footergame.world.width / 2 - 400, footergame.world.height / 2)
  },
  nextround: function () {
    for (checkenemy of enemy) {
      checkenemy.health = 100
      checkenemy.revive()
      checkenemy.x = checkenemy.body.width + Math.floor(Math.random() * footergame.world.width - checkenemy.body.width * 2)
    }
  },
  toggleplayerdirection: function (whichplayer) {
    whichplayer.body.velocity.x *= -1
    whichplayer.scale.x *= -1
    whichplayer.children[0].scale.x = Math.sign(whichplayer.scale.x)
  },
  checkBounds: function () {
    for (checkplayer of player) {
      var playerdirection = Math.sign(checkplayer.body.velocity.x)
        // console.log(checkplayer.x+maxvelocity, footergame.world.width);
      if ((checkplayer.x - checkplayer.body.width < 0 && playerdirection == -1) || (checkplayer.x + checkplayer.body.width >= footergame.world.width && playerdirection == 1)) {
        this.toggleplayerdirection(checkplayer)
      }
    }
  },
  checkHP: function () {
    var playersalive = false
    for (checkplayer of player) {
      (checkplayer.health < 1) && checkplayer.kill()
        // barcolor = parseInt('0x50' + ('00' + Math.floor(checkplayer.health/100 * 255).toString(16)).substr(-2) + '00', 16);
      barcolor = Phaser.Color.getColor32(255, 80, Math.floor(checkplayer.health / 100 * 255), 80)

      checkplayer.children[1]
          .clear()
          .lineStyle(1, 0xffffff, 0.5)
          .beginFill(barcolor)
          .drawRect(-16 * checkplayer.health / 100, -20, 32 * checkplayer.health / 100, 6)
          .endFill()
      if (checkplayer.alive) playersalive = true
    }
    var enemiesalive = false
    for (checkenemy of enemy) {
      (checkenemy.health < 1) && checkenemy.kill()
        // barcolor = parseInt('0x' + ('00' + Math.floor(checkenemy.health/100 * 255).toString(16)).substr(-2) + '0000', 16);
      barcolor = Phaser.Color.getColor32(255, Math.floor(checkenemy.health / 100 * 255), 0, 0)
      checkenemy.children[0]
          .clear()
          .lineStyle(1, 0xffffff, 0.5)
          .beginFill(barcolor)
          .drawRect(-16 * checkenemy.health / 100, -20, 32 * checkenemy.health / 100, 6)
          .endFill()
      if (checkenemy.alive) enemiesalive = true
    }
    if (!enemiesalive && playersalive) this.nextround()
    else if (!playersalive) {
      for (checkenemy of enemy) {
          // currentenemy.animations.play('walk', 4, true);
        checkenemy.kill()
          // checkenemy.body.velocity.x = Math.sign(checkenemy.scale.x) * maxvelocity;
      }
    }
  },
  checkPromixity: function () {
    for (currentenemy of enemy) {
      currentenemy.alpha = 1
      currentenemy.animations.play('idle', 4, true)
    }
    for (currentplayer of player) {
      currentplayer.enemytarget = null
      for (currentenemy of enemy) {
        if (currentplayer.alive && currentenemy.alive && Math.abs(currentplayer.x - currentenemy.x) < 60) {
          currentenemy.animations.play('walk', 4, true)
          currentenemy.alpha = 0.5
          if (Math.sign(currentplayer.x - currentenemy.x)) currentenemy.scale.x = -currentplayer.scale.x
          currentplayer.body.velocity.x = 0
          currentplayer.enemytarget = currentenemy.position.x
            // currentenemy.enemytarget = currentplayer.position.x;
        }
      }
      if (!currentplayer.enemytarget && Math.abs(currentplayer.body.velocity.x) < maxvelocity) currentplayer.body.velocity.x = maxvelocity * -Math.sign(currentplayer.scale.x)
        // if (!currentplayer.enemytarget && Math.abs(currentplayer.body.velocity.x) < maxvelocity) currentplayer.body.velocity.x = currentplayer.body.velocity.x+Math.random(Math.abs(maxvelocity-currentplayer.body.velocity.x))* -Math.sign(currentplayer.scale.x);
    }
  },
  calcAttack: function () {
    for (currentplayer of player) {
      if (currentplayer.alive) {
        for (currentenemy of enemy) {
          if (currentplayer.enemytarget == currentenemy.x) {
            currentenemy.setHealth(currentenemy.health - 1)
            currentplayer.setHealth(currentplayer.health - 0.125)
          }
        }
      }
    }
  },
  decideDirection: function () {
    for (currentplayer of player) if (!currentplayer.enemytarget && Math.random() < 0.002) this.toggleplayerdirection(currentplayer)
  },
  update: function () {
    if (fusionqueue.length && !runningfusionanimation) this.fusionshow(fusionqueue.shift())
    if (player.length) {
      this.checkBounds()
      this.checkHP()
      this.checkPromixity()
      this.calcAttack()
      this.decideDirection()
    }
  }
}

function  getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max) + 1
  return ("0" + (Math.floor(Math.random() * max) + 1)).substr(-2)
}
