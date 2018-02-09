project.Pokemotions = (function (game) {
  let
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
})

project.Pokemotions.prototype = {
  preload: function () {
    footergame.load.spritesheet('pokemotevulpix', '/img/pokemotions.png', 206, 236)
    footergame.load.spritesheet('playerpoke', '/img/gen6.png', 32, 32)
    footergame.load.spritesheet('faces', '/img/fuseface.png', 96, 96, 493)
    footergame.load.spritesheet('bodies', '/img/fusebody.png', 96, 96, 493)
  },
  create: function () {
    fusionqueue = []
    footergame.mask = [255, 19, 252, 254, 167, 255, 164, 0, 166, 123, 0, 124, 254, 209, 255, 77, 0, 78, 1, 231, 23, 160, 252, 70, 17, 160, 6, 34, 73, 11, 0, 52, 246, 112, 141, 248, 7, 14, 149, 11, 14, 77, 246, 197, 0, 248, 221, 112, 148, 143, 8, 76, 74, 12, 240, 0, 0, 247, 125, 125, 146, 14, 8, 71, 11, 11]
    footergame.bmds = []
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
        player.length < 144 && player.push(_this.createplayer(payload.poke, footergame.world.width / 2, footergame.world.height / 2, payload.name))
      })
    }

    if (socket.hasListeners('show fusion') == false) {
      socket.on('show fusion', function (fused) {
        fusionqueue.push(fused)
      })
    }

    socket.emit('Request vote')
  },
  composevote: function (payload) {
    let title, options = [], names
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
      let sectioncolors = [
        0xeb485b,
        0x1f9b76,
        0x9f5fff,
        0xd39e14,
        0x1688c7,
        0x7f7f7f
      ]
    }
    listgroup.removeChildren()
    let listvotes = []
    let listtext = []
    let increment = 0
    let lowestvote = options[0].tally
    questiontext.setText('vote: ' + title)
    for (option in options) {
      increment += options[option].tally
      lowestvote = lowestvote > options[option].tally ? options[option].tally : lowestvote
    }
    if (increment > 0) increment = (maxheight - 40) / increment
    for (option in options) {
      listvotes.push(footergame.add.graphics(0, 0))
      console.log('listvotes', listvotes)
      listvotes.last.beginFill(sectioncolors[(listvotes.length - 1) % sectioncolors.length])
      listvotes.last.drawRect((listvotes.length - 1) * (footergame.world.width / options.length < maxwidth ? footergame.world.width / options.length : maxwidth), footergame.world.height - increment * options[option].tally, listvotes.length + (footergame.world.width / options.length < maxwidth ? footergame.world.width / options.length - 20 : maxwidth - 20), increment * options[option].tally)
      listvotes.last.endFill()
      listtext.push(footergame.add.text(listvotes.last.getBounds().width / 2 + listvotes.last.getBounds().x, listvotes.last.getBounds().y + 6, options[option].name + ' - ' + options[option].tally, txtstyle))
      listtext.last.inputEnabled = true
      listtext.last.anchor.x = 0.5
      listtext.last.anchor.y = listtext.last.getBounds().height + listtext.last.y > footergame.world.height ? 1 : 0
      let placeholdy = footergame.world.height - increment * options[option].tally
      listvotes.last.y = footergame.world.height - increment * lowestvote
      footergame.add.tween(listvotes.last).to({ y: 0}, 2000, Phaser.Easing.Bounce.Out, true)
      if (listtext.last.anchor.y == 0) {
        let placeholdy = listtext.last.y// -listtext.last.getBounds().height/2;
        listtext.last.y = footergame.world.height - increment * lowestvote
        footergame.add.tween(listtext.last).to({ y: placeholdy}, 2000, Phaser.Easing.Bounce.Out, true)
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
    let message = payload.message
    let picture = payload.picture
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

    newtest.push(footergame.add.sprite(footergame.world.width, 0, 'pokemotevulpix'))
    newtest.last.frame = picture
    newtest.last.offset = 160
    this.addtween(newtest.last)

    for (letter of Array.from(message)) {
      newtest.push(footergame.add.text(footergame.world.width, 32, letter, test))
      newtest.last.alpha = 0
      if (newtest.length - 1 > 0) newtest.last.offset = newtest[newtest.length - 2].offset + newtest[newtest.length - 2].getBounds().width + 24
      else newtest.last.offset = 0
      this.addtween(newtest.last)
    }
    let tempgroup = footergame.add.group()
    tempgroup.addMultiple(newtest)
      // tempgroup.y += 32;
  },
  addtween: function (obj) {
    let sinData = footergame.math.sinCosGenerator(1337, 8, 16, 5)
    let sin = sinData.sin
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
    leftfuse = this.redrawsprite(this.newbody(Array(2).fill(fusions[0])), fusions[0].Color)
    rightfuse = this.redrawsprite(this.newbody(Array(2).fill(fusions[1])), fusions[1].Color)
    rightfuse.x = footergame.width - 96
    fusion = this.redrawsprite(this.newbody(fusions), fusions.last.Color)
    fusion.x = footergame.world.centerX - 144
    this.headcorrect(fusion.children[1], fusions)
    fusion.alpha = 0
    footergame.add.tween(leftfuse).to({ x: footergame.world.centerX - 120 }, 1000, Phaser.Easing.Sinusoidal.In, true)
    footergame.add.tween(rightfuse).to({ x: footergame.world.centerX - 120 }, 1000, Phaser.Easing.Sinusoidal.In, true)
      .onComplete.add(this.destroy, this)
  },
  newbody: function(which){
    let fusiongroup = footergame.add.group()
    let face = footergame.add.sprite(0, 0,'faces')
    let body = footergame.add.sprite(0, 0,'bodies')
    let skin = footergame.add.sprite(0, 0,'bodies')
    face.frame = which[0].id - 1
    body.frame = which[1].id - 1
    skin.frame = which.last.id - 1
    fusiongroup.addChild(body)
    fusiongroup.addChild(face)
    fusiongroup.addChild(skin)
    fusiongroup.visible = false
    return fusiongroup.children
  },
  redrawsprite: function(original, newColor) {
    let redrawn = footergame.add.group()
    redrawn.addChild(footergame.add.sprite(0,0, this.recolor(this.bitmap(original[0], 0, 0), newColor)))
    redrawn.addChild(footergame.head = footergame.add.sprite(0,0, this.recolor(this.bitmap(original[1], 0, 0), newColor)))
    redrawn.scale.setTo(2.75)
    return redrawn
  },
  headcorrect: function(obj, which) {
    let head = which[0].id - 1
    let body = which[1].id - 1
    obj.scale.x = obj.scale.y = which[0].Faces[0].scale/which[1].Faces[0].scale
    obj.x = which[0].Faces[0].x - which[1].Faces[0].x
    obj.y = which[0].Faces[0].y - which[1].Faces[0].y
  },
  bitmap: function(bitmapdata, x, y) {
    footergame.bmds.push(footergame.make.bitmapData())
    footergame.bmds.last.load(bitmapdata)
    return footergame.bmds.last
  },
  destroyBitmaps: function() {
    while (footergame.bmds.length) {
      bmd.pop().destroy()
    }
  },
  recolor: function(img, newColor) {
    console.log('thisfuse', newColor)
    for (let colorindex = 0; colorindex < footergame.mask.length; colorindex+= 3) {
      let colarr
      for (col in newColor) {
        colarr = newColor[col]
      }
      img.replaceRGB(footergame.mask[colorindex], footergame.mask[colorindex+1], footergame.mask[colorindex+2], 255, colarr[colorindex], colarr[colorindex+1], colarr[colorindex+2], 255)
    }
    return img
  } ,
  fusionmake: function () {
    let fusionfadeout = footergame.add.tween(fusion).to({ alpha: 0 }, 8000, Phaser.Easing.Linear.None, false)
    fusionfadeout.onComplete.add(this.emptyfusion, this)
    footergame.add.tween(fusion).to({ alpha: 1 }, 250, Phaser.Easing.Linear.None, true)
      .chain(fusionfadeout)
  },
  createplayer: function (pokemon, x, y, username) {
    let namestyle = {
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
    let offset = pokemon * 4
    let playerpoke = footergame.add.sprite(x, y, 'playerpoke')
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
    let offset = pokemon * 4
    let playerpoke = footergame.add.sprite(x, y, 'playerpoke')
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
    console.log('whichplayer.enemytarget', whichplayer.enemytarget)
    whichplayer.body.velocity.x *= -1
    whichplayer.scale.x *= -1
    whichplayer.children[0].scale.x = Math.sign(whichplayer.scale.x)
  },
  checkBounds: function () {
    for (checkplayer of player) {
      let playerdirection = Math.sign(checkplayer.body.velocity.x)
      if ((checkplayer.x - checkplayer.body.width < 0 && playerdirection == -1) || (checkplayer.x + checkplayer.body.width >= footergame.world.width && playerdirection == 1)) {
        this.toggleplayerdirection(checkplayer)
      }
    }
  },
  drawHpBar: function(target, health) {
    target
        .clear()
        .lineStyle(1, 0xffffff, 0.5)
        .beginFill(Phaser.Color.getColor32(255, 80, Math.floor(health / 100 * 255), 80))
        // var color = { r: 186, g: 218, b: 85 };

        // var rgb2hex = function(r, g, b) {
        //   return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        // }
        .drawRect(-16 * health / 100, -20, 32 * health / 100, 6)
        .endFill()
  },
  checkHP: function () {
    let playersalive = false
    for (checkplayer of player) {
      (checkplayer.health < 1) && checkplayer.kill()
      this.drawHpBar(checkplayer.children[1], checkplayer.health)
      // barcolor = Phaser.Color.getColor32(255, 80, Math.floor(checkplayer.health / 100 * 255), 80)

      // checkplayer.children[1]
      //     .clear()
      //     .lineStyle(1, 0xffffff, 0.5)
      //     .beginFill(barcolor)
      //     .drawRect(-16 * checkplayer.health / 100, -20, 32 * checkplayer.health / 100, 6)
      //     .endFill()
      if (checkplayer.alive) playersalive = true
    }
    let enemiesalive = false
    for (checkenemy of enemy) {
      (checkenemy.health < 1) && checkenemy.kill()
      this.drawHpBar(checkenemy.children[0], checkenemy.health)
      // barcolor = Phaser.Color.getColor32(255, Math.floor(checkenemy.health / 100 * 255), 0, 0)
      // checkenemy.children[0]
      //     .clear()
      //     .lineStyle(1, 0xffffff, 0.5)
      //     .beginFill(barcolor)
      //     .drawRect(-16 * checkenemy.health / 100, -20, 32 * checkenemy.health / 100, 6)
      //     .endFill()
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
      enemy
        .filter(currentenemy => currentplayer.alive && currentenemy.alive && Math.abs(currentplayer.x - currentenemy.x) < 60)
        .forEach(currentenemy => {
          currentenemy.animations.play('walk', 4, true)
          currentenemy.alpha = 0.5
          if (Math.sign(currentplayer.x - currentenemy.x)) currentenemy.scale.x = -currentplayer.scale.x
          currentplayer.body.velocity.x = 0
          currentplayer.enemytarget = currentenemy.position.x
        })
      if (!currentplayer.enemytarget && Math.abs(currentplayer.body.velocity.x) < maxvelocity) this.resumeMotion(currentplayer)
     }
        // if (!currentplayer.enemytarget && Math.abs(currentplayer.body.velocity.x) < maxvelocity) currentplayer.body.velocity.x = currentplayer.body.velocity.x+Math.random(Math.abs(maxvelocity-currentplayer.body.velocity.x))* -Math.sign(currentplayer.scale.x);
    // }
  },
  resumeMotion: function (target) {
    target.body.velocity.x = maxvelocity * -Math.sign(target.scale.x)
  },
  calcAttack: function () {
    player
      .filter(currentplayer => currentplayer.alive)
      .forEach(currentplayer => {
        enemy
          .filter(currentenemy => currentplayer.enemytarget == currentenemy.x)
          .forEach(currentenemy => {
            currentenemy.setHealth(currentenemy.health - 1)
            currentplayer.setHealth(currentplayer.health - 0.125)
          })
      })
    // for (currentplayer of player) {
    //   if (currentplayer.alive) {
    //     for (currentenemy of enemy) {
    //       if (currentplayer.enemytarget == currentenemy.x) {
    //         currentenemy.setHealth(currentenemy.health - 1)
    //         currentplayer.setHealth(currentplayer.health - 0.125)
    //       }
    //     }
    //   }
    // }
  },
  decideDirection: function () {
    player
      .filter(currentplayer => !currentplayer.enemytarget && Math.random() < 0.002)
      .forEach(currentplayer => this.toggleplayerdirection(currentplayer))
    // for (currentplayer of player) if (!currentplayer.enemytarget && Math.random() < 0.002) this.toggleplayerdirection(currentplayer)
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