project.Layout = (function (game) {
  let
    overlayqueue,
    overlayqueueready,
    followergroup,
    followed,
    fx,
    followersound,
    decoded,
    pikatxtstyle,
    actualmessage,
    pikaqueue,
    pikatextqueue,
    pikacharqueue,
    counts,
    pikachutalking,
    pikawave,
    pikadance,
    lengths,
    textorigin
})

project.Layout.prototype = {
  preload: function () {
    game.load.spritesheet('pikachuhi', '/img/pikachu hi.png', 800, 800)
    game.load.spritesheet('pikachudance', '/img/pikachu dance.png', 99, 99)
    game.load.image('followerbg', '/img/paint.png')
    game.load.audio('followersound', '/audio/ability.mp3')
    game.load.audiosprite('cries', '/audio/cries.ogg', '/audio/cries.json')
    game.load.audiosprite('texttopika', '/audio/pikachu.ogg', '/audio/pikachu.json')
  },
  create: function () {
    pikawave = game.add.sprite(game.world.width / 4, game.world.height-800, 'pikachuhi')
    pikawave.visible = false
    pikadance = game.add.sprite(game.world.width / 2, game.world.height-800, 'pikachudance')
    pikadance.anchor.x = 0.5
    pikadance.visible = false
    overlayqueueready = true
    let wave = pikawave.animations.add('wave')
    let dance = pikadance.animations.add('dance')
    pikawave.animations.play('wave', 30, true)
    pikadance.animations.play('dance', 12, true)
    overlayqueue = []
    followed = []
    actualmessage = []
    pikaqueue = []
    pikatextqueue = []
    pikacharqueue = []
    pikachutalking = false
    decoded = false
    game.audioJSON.cries = game.cache.getJSON('audiojsoncries')
    game.audioJSON.texttopika = game.cache.getJSON('texttopikajson')
    this.game.stage.backgroundColor = 0x1c0f0c
    fx = game.add.audioSprite('cries')
    fx.allowMultiple = true
    texttopika = game.add.audioSprite('texttopika')
    game.sound.setDecodedCallback(['cries', 'texttopika'], this.playsound, this)
    followersound = game.add.audio('followersound')
    counts = {}
    differentsounds = []
    lengths = {}
    pikatxtstyle = {
      align: 'center',
      backgroundColor: 'transparent',
      boundsAlignH: 'center',
      boundsAlignV: 'middle',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: '48px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0,
      wordWrap: true,
      wordWrapWidth: game.world.width
    }
    // textorigin = {x: game.world.width - 100, y: game.world.height-64}
    textorigin = {x: game.world.width / 2, y: game.world.height-64}
    this.getCounts()
    this.addsocketlisteners(this)
  },
  getCounts: function(){
    for (current in game.audioJSON.texttopika.spritemap) {
      name = current.split(" ")[0]
      lengths[name] = {}
      if (counts[name] === undefined) counts[name] =  []
      for (key in game.audioJSON.texttopika.spritemap[current].sounds) {
          counts[name].push(game.audioJSON.texttopika.spritemap[current].sounds[key])
          temp = Object.keys(game.audioJSON.texttopika.spritemap[current].sounds[key])[0]
          !differentsounds.includes(temp) && differentsounds.push(temp)
      }
    }
    differentsounds.sort(function(a, b) {
      return a.length - b.length
    })
    for (emotion in counts) {
      for (blob in counts[emotion]) {
        bloblen = 0
        for (current in counts[emotion][blob]) {
          let len
           switch (counts[emotion][blob][current]) {
            case 'Short': len = 0.5
            break
            case 'Normal': len = 1
            break
            case 'Long': len = 1.5
            break
            case 'Very Long': len = 2
            break
            default: len = counts[emotion][blob][current]
          }
          switch (current) {

          case "Pi":
          case "Ka": len *= 1
          break
          case "Cha": len *= 1.5
          break
          case "Pika":
          case "Bree": len *= 2
          break
          case "Pikachu":
          case "Pikacha": len *= 3
          break
          case "Pika Pi":
          case "Pi Pika" : len *= 2.75
          break
          }
          bloblen += len
        }
       if (!lengths[emotion][Math.ceil(bloblen)]) lengths[emotion][Math.ceil(bloblen)] = []
       lengths[emotion][Math.ceil(bloblen)].push(emotion + ' ' + ("00" + (+blob + 1)).substr(-2))
      }
    }
  },
  addsocketlisteners: function (_this) {
    if (socket.hasListeners('playsound') == false) {
      socket.on('playsound', function (which) {
        decoded && fx.play(which)
      })
    }
    if (socket.hasListeners('follower') == false) {
      socket.on('follower', function (payload) {
        console.log('payload', payload)
        overlayqueue.push({type:'follower', value: payload.username})
        // followed.push(who)
      })
    }
    if (socket.hasListeners('texttopika') == false) {
      socket.on('texttopika', function (obj) {
        _this.guesspikas(obj)
      })
    }
  },
  guesspikas: function (obj) {
    console.log('metaphone, message', obj)
    pikaemotion = 'Happy'
    pikamessage = []
    for (phone of obj.chunks) {
      wordlength = phone
      while (!lengths[pikaemotion][wordlength]) wordlength--
      randomsound = lengths[pikaemotion][wordlength][Math.floor(Math.random() * lengths[pikaemotion][wordlength].length)]
      pikaword = []
      for (character in counts[pikaemotion][+randomsound.split(' ')[1] - 1]) {
        pikaword.push([ "ピ", "カ", "チャ", "ピカ", "ブレ", "ピカチュウ", "ピカチャ", "ピカ ピ", "ピ ピカ" ][[ "Pi", "Ka", "Cha", "Pika", "Bree", "Pikachu", "Pikacha", "Pika Pi", "Pi Pika" ].indexOf(character)])
        // pikatextqueue.last.pivot.x = 0
        // pikatextqueue.last.pivot.y = 800
        // pikatextqueue.last.angle = 90
      }
      pikacharqueue.push(pikaword.join(' '))
      pikamessage.push(randomsound)
    }
    overlayqueue.push({type: 'pika', value: pikamessage}, {type: 'message', value: obj.message})
  },
  saypikas: function () {
    if (!pikachutalking && pikaqueue.length) {
      pikachutalking = true
      texttopika.play(pikaqueue.shift()).onStop.add(() => { pikachutalking = false }, this)
      if (pikacharqueue.length) {
        pikatextqueue.push(game.add.text(textorigin.x, textorigin.y, pikacharqueue.shift(), pikatxtstyle))
        pikatextqueue.last.pivot.y = 800
        pikatextqueue.last.angle = 90
      }
    }
  },
  followershow: function (person) {
    let fol = []
    followergroup = game.add.group()
    fol[0] = game.add.sprite(0, 0, 'followerbg')
    let folscale = 0.5//game.world.width / fol[0].width
    fol[0].scale.setTo(folscale)
    fol[1] = game.add.text(0, 0, person, pikatxtstyle)
    fol[1].x = fol[0].x + fol[0].width - fol[1].width - 64
    fol[1].y = fol[0].height / 4
    fol[2] = game.add.text(0, 0, 'follow', pikatxtstyle)
    fol[2].x = fol[0].x + fol[0].width - fol[2].width - 64
    fol[2].y = fol[1].height / 2 + fol[1].y + 8
    followergroup.addMultiple(fol)
    followergroup.x = game.world.width - followergroup.width
    followergroup.y = game.world.height / 4
    let folmask = game.add.graphics()
    folmask.beginFill(0x000000)
    folmask.drawRect(followergroup.x, followergroup.y, followergroup.width, followergroup.height)
    folmask.endFill()
    folmask.x = followergroup.width
    followergroup.mask = folmask
      // followergroup.alpha = 0.2;
    let folfadeout = game.add.tween(followergroup).to({ alpha: 0 }, 4000, Phaser.Easing.Linear.None, false)
    folfadeout.onComplete.add(this.emptygroup, this, followergroup)
    game.add.tween(folmask).to({ x: 0 }, 500, Phaser.Easing.Linear.None, true)
      .chain(folfadeout)
    followersound.play()
  },
  emptygroup: function (toDestroy) {
    toDestroy.destroy(true, true)
    overlayqueueready = true
    pikadance.visible = false
  },
  playsound: function () {
    console.log('decoded')
    decoded = true
  },
  showmessage: function(message) {
    overlayqueueready = false
    if (!message) message = 'no message'
    messagetoshow = game.add.text(game.world.width / 2, game.world.height / 2, message, pikatxtstyle)
    messagetoshow.anchor.setTo(0.5)
    pikadance.y = messagetoshow.y - messagetoshow.getBounds().height / 2 - pikadance.getBounds().height
    pikadance.visible = true
    messagetween = game.add.tween(messagetoshow).to({ alpha: 0 }, 12000, Phaser.Easing.Linear.None, true)
    messagetween.onComplete.add(this.emptygroup, this, messagetoshow)
  },
  movetext: function () {
    for (text in pikatextqueue) {
      pikatextqueue[text].angle--
      if (pikatextqueue[text].angle < -135) {
        texttoremove = pikatextqueue.shift()
        texttoremove.destroy(true)
        if (!pikatextqueue.length)  overlayqueueready = true
      }
    }
  },
  dequeue: function() {
    pikawave.visible = pikatextqueue.length ? true : false
    if (overlayqueue.length && overlayqueueready) {
      overlayqueueready = false
      next = overlayqueue.shift()
      switch (next.type) {
        case 'follower': this.followershow(next.value)
        break;
        case 'pika': pikaqueue = next.value
        break;
        case 'message': this.showmessage(next.value)
        break;
      }
    }
  },
  update: function () {
    this.saypikas()
    this.movetext()
    this.dequeue()
  }
}
