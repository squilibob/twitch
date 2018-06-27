let styles = {
  nametext: {
    fontSize: 22,
    fontFamily: 'Gill Sans MT',
    fill: '#ffffff',
  },
  timetext: {
    fontSize: 22,
    fontFamily: 'Extra-Cool',
    fill: '#cfcfcf',
  },
  streamertext: {
    fontSize: 16,
    fontFamily: 'Dimitri Swank',
    fill: '#cfcfcf',//   fill: '#6441a4',
  },
  bodytext: {
    fontSize: 20,
    fontFamily: 'ChunkFive',
    fill: '#ffffff',
    stroke: '#000000',
    strokethickness: 3,
    radius: 12,
    margin: 12,
    maxLines: 4,
    wordWrap: { width: 400, useAdvancedWrap: true }
  }
}

let chat = {
  AVSIZE: 96,
  sidebar: [],
  avatars: new Map(),
  emotes: new Set(),
  badges: new Set(),
  space: styles.bodytext.fontSize / 4,
  time: new Date(),
  unique: 0,
  CORS: 'https://cors-anywhere.herokuapp.com/'
}

//preload image functions
chat.cache = function (obj) {
  return new Promise((resolve, reject) => {
      let cacheimage = this.load.image(obj)
      cacheimage.on('complete', () => resolve(cacheimage))
      cacheimage.start()
  })
}

chat.cacheNewImages = function (arr) {
  return this.cache(arr
    .filter(image => !!image.name && !this.emotes.has(image.name) && !image.pokemon)
    .map(image => {
      this.emotes.add(image.name)
      return {key: image.name, url:this.CORS + image.emote}}))
}

chat.avatarCheck = async function (obj) {
  !(((obj || {}).user || {}).username) && console.log('Missing obj')
  !(((obj || {}).user || {}).avatar) && console.log('Missing avatar')
  if (!this.avatars.has(obj.user.username)) {
    if(typeof obj.user.avatar === 'number') {
      this.avatars.set(obj.user.username, obj.user.avatar)
    } else {
      await this.cache({key: obj.user.username, url:obj.user.avatar}).catch(console.error)
      this.avatars.set(obj.user.username, 0)
    }
  }
}

//functions that create objects
chat.createAvatar = function (key) {
  // let newav = this.avatarImage(key)
  // let contain = this.add.container(0, 0, newav)
  // let temp = this.avatarMask(contain)
  // return temp
  return this.avatarMask(this.avatarImage(key))
}

chat.badgeCheck = async function (user) {
  if (!user.badges) return null
  await this.cacheBadges(user.badges).catch(console.error)
    // .map(image => ({key: image.url, url:`https://static-cdn.jtvnw.net/badges/v1/${image.url}/1`}))).catch(console.error)
  user.badges.forEach(item => this.badges.add(item.url))
}

chat.avatarImage = function (key) {
    let avatar = !this.avatars.get(key) ? this.make.sprite({
        x: 0,
        y: 0,
        key: key,
        add: true
    })
    : this.make.sprite({
        x: 0,
        y: 0,
        key: 'defaultavatars',
        frame: this.avatars.get(key),
        add: true
    })
  avatar.setScale(this.AVSIZE / avatar.width)
  .setOrigin(0)
  return avatar
}

chat.avatarMask = function (avatar) {
  return this.make.graphics({ fillStyle: { color: 0x000000 }, add: false})
    .fillCircleShape(new Phaser.Geom.Circle(this.AVSIZE >>> 1, this.AVSIZE >>> 1, this.AVSIZE >>> 1))//.setVisible(false)
}

chat.createMessage = async function (message) {
  await this.cacheNewImages(message).catch(console.error)
  return message
    .map(section => !!section.text ?
      this.add.text(0, 0, section.text, styles.bodytext).setStroke(styles.bodytext.stroke, styles.bodytext.strokethickness)
      : !!section.pokemon
      ? this.make.sprite({
        x: 0,
        y: 0,
        key: 'pokeicon',
        frame: --section.pokemon,
        add: true})
        .setOrigin(0, 0)
      : this.make.sprite({
        x: 0,
        y: 0,
        key: section.name,
        add: true})
        .setOrigin(0))
    .map((section, index, arr) => {
      index && section.setX(arr[index-1].getBounds().x + arr[index-1].getBounds().width + this.space)
      .setY(section.getBounds().height > 32 && !(arr[index-1].getBounds().height > 32) ?
        arr[index-1].getBounds().y - 3
        : arr[index-1].getBounds().height > 32 && !(section.getBounds().height > 32)
        ? arr[index-1].getBounds().y + 3
        : arr[index-1].getBounds().y)
      if (section.getBounds().x + section.getBounds().width > 0 + styles.bodytext.wordWrap.width) {
        section.setX(0).setY(section.getBounds().y+section.getBounds().height + this.space)
      }
    //   this.tweens.add({
    //     targets: section,
    //     ease: 'Back.easeInOut',
    //     duration: 150,
    //     // yoyo: true,
    //     loop: -1,
    //     paused: false
    // })
      return section
    })
}

chat.badgeURL = id => `https://static-cdn.jtvnw.net/badges/v1/${id}/1`

chat.cacheBadges = async function (badges) {
  await this.cache(badges
    .filter(image => !this.badges.has(image.url))
    .map(image => ({key: image.url, url: this.badgeURL(image.url)}))).catch(console.error)
    // .map(image => ({key: image.url, url:`https://static-cdn.jtvnw.net/badges/v1/${image.url}/1`}))).catch(console.error)
}

chat.createBadges = async function (user) {
  if (!user.badges) return null
  let circ = new Phaser.Geom.Circle(0, 0, (this.AVSIZE + 8) >> 1)
  return user.badges.map((image, index) => ({
    url: image.url,
    color: image.color,
    points: Phaser.Geom.Circle.CircumferencePoint(circ, (25 + index * 25) * Math.PI/180)
  }))
  .map(item => [this.make.graphics({ fillStyle: { color: item.color }, add: false})
    .fillCircleShape(new Phaser.Geom.Circle(item.points.x, item.points.y, 13)),
    this.make.sprite({
      x: item.points.x,
      y: item.points.y,
      key: item.url,
      add: true
    })
  ]).reduce((acc, val) => acc.concat(val), [])
}

chat.createLatest = async function (obj){
  // console.log(obj.user)
  this.unique += 1
  let bg = obj.user.username + this.unique
  let parts = {
    flair: this.avatarImage(obj.user.username).setAlpha(0, 0, 0, 0),
    mask: this.avatarMask(),
    text: this.add.container(0, 0, await this.createMessage(obj.message)).setAlpha(0, 0, 0, 0),
    name: this.add.text(0, 0, obj.user.username.toLowerCase() != obj.user['display-name'].toLowerCase() ? `${obj.user['display-name']} (${obj.user.username})` :obj.user.username, styles.nametext).setColor(`#${obj.user.color.toString(16).padStart(6, '0')}`).setStroke(this.strokecolor(obj.user.color), styles.bodytext.strokethickness >> 1).setAlpha(0, 0, 0, 0),
    // time: this.add.text(0, 0, String.fromCodePoint(date.getHours() > 12 ? 128323 + date.getHours() : (date.getHours() < 1 ? 128347 : 128335 + date.getHours())) + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) , styles.timetext).setAlpha(0, 0, 0, 0),
    streamer: this.add.text(0, 0, obj.user.isStreamer ? 'streamer' : '', styles.streamertext).setAlpha(0, 0, 0, 0),
    pokemon: this.make.sprite({
        x: 0,
        y: 0,
        key: 'yencat',
        frame: obj.user.card.poke,
        add: true}).setOrigin(0)
  }
  if (obj.user.badges.length) {
    parts.badges = this.add.container(0, 0, await this.createBadges(obj.user).catch(console.error)).setAlpha(0, 0, 0, 0)
  }
  parts.background = this.rounded(bg, parts.text.getBounds(), styles.bodytext.radius, obj.user.color)
  parts.flair.setMask(new Phaser.Display.Masks.BitmapMask(this, parts.mask))
  parts.text.setX(parts.flair.getBounds().width + this.space + styles.bodytext.margin)
  parts.text.setY(parts.flair.getBounds().y + (parts.flair.getBounds().height - parts.text.getBounds().height) / 2).setDepth(2)
  parts.background.setX(parts.text.getBounds().x - (styles.bodytext.margin >> 1)).setY(parts.text.getBounds().y - (styles.bodytext.margin >> 1)).setDepth(0)
  parts.name.setY((parts.text.getBounds().y < parts.flair.getBounds().y ? parts.text.getBounds().y : parts.flair.getBounds().y) - parts.name.getBounds().height - this.space)
  // parts.time.setX(parts.name.getBounds().width + this.space).setY(parts.name.getBounds().y + parts.name.getTextMetrics().ascent - parts.time.getTextMetrics().ascent)
  parts.streamer.setX(parts.name.getBounds().x + parts.name.getBounds().width + this.space).setY(parts.name.getBounds().y + parts.name.getTextMetrics().ascent - parts.streamer.getTextMetrics().ascent)
  parts.streamer.setX(parts.name.getBounds().x + parts.name.getBounds().width + this.space).setY(parts.name.getBounds().y + parts.name.getTextMetrics().ascent - parts.streamer.getTextMetrics().ascent)
  parts.pokemon.setX(parts.text.getBounds().x + parts.text.getBounds().width - (parts.pokemon.getBounds().width >> 2)).setY(parts.flair.getBounds().y + parts.flair.getBounds().height - parts.pokemon.getBounds().height * 1.5)
  if (obj.user.badges.length) parts.badges.setX(parts.flair.getBounds().x + (parts.flair.getBounds().width >> 1)).setY(parts.flair.getBounds().y+(parts.flair.getBounds().height >> 1))
  return Object.values(parts)
}


// functions that position objects
chat.addLatest =  function (latest) {
  let offscreen = false
  // console.log('this.sidebar.length', this.sidebar.length)
  if (!latest) return false
  let lowBounds = latest.filter(item => !!item.getBounds).reduce((a, b) => Math.min(a, b.getBounds().y), this.AVSIZE)
  let highBounds = latest.filter(item => !!item.getBounds).reduce((a, b) => Math.max(a, b.getBounds().y + b.getBounds().height), 0)
  lowBounds < 0 && latest.forEach(item => item.setY(item.y - lowBounds))
  let latestheight = highBounds - lowBounds + this.space
  this.sidebar.forEach(item => item.setData('positionY', item.getData('positionY') - latestheight))
  latest.forEach(item => item.setData('positionY', Scenes.get('Chat').height - latestheight + item.y).setY(Scenes.get('Chat').height))//.setVisible(true))
  this.sidebar = this.sidebar.concat(latest)
  this.sidebar.forEach((item, index) => {
      this.tweens.add({
        targets: item,
        alphaBottomLeft: 1,
        alphaBottomRight: 1,
        alphaTopLeft: 1,
        alphaTopRight: 1,
        y: item.getData('positionY'),
        ease: 'Back.easeInOut',
        duration: 750,
        paused: false
    })
    if (item.y < 0) {
      offscreen = index
    }
  })
  if (offscreen !== false) {
    this.sidebar.splice(0, offscreen)
      .forEach(item => item.destroy())
  }
 // console.log('latest', offscreen)
}

// trigger functions from event listeners
chat.notice =  function (obj) {
  this.addLatest([this.add.text(0, 0, obj.text, styles.nametext)])
  //{ text: "irc-ws.chat.twitch.tv:80", fadedelay: 1000, level: -4, class: "chat-connection-good-connecting" }
}

chat.message = async function (obj) {
  if (this.time.getMinutes() < new Date().getMinutes()) {
    this.time = new Date()
    this.addLatest([this.add.text(0, 0, String.fromCodePoint(this.time.getHours() > 12 ? 128323 + this.time.getHours() : (this.time.getHours() < 1 ? 128347 : 128335 + this.time.getHours())) + ('0' + this.time.getHours()).slice(-2) + ':' + ('0' + this.time.getMinutes()).slice(-2) , styles.timetext)])
  }
  if (obj.user.username == 'mikuia') return false
  await this.avatarCheck(obj).catch(console.error)
  await this.badgeCheck(obj.user).catch(console.error)
  this.addLatest(await this.createLatest(obj).catch(console.error))

     // var rect = new Phaser.Geom.Rectangle(250, 200, 300, 200);
    // var graphics = this.add.graphics();
    // graphics.fillStyle(+('0x' + RegExp('([0-9A-F]{6})','g').exec(obj.user.color).shift()))
    // graphics.fillRectShape(rect);
  //messagepayload.user.color = messagepayload.user.color ? +('0x' + RegExp('([0-9A-F]{6})','g').exec(messagepayload.user.color).shift()) : 0

//     if (image) {
//       checkImageExists(image, function (existsImage) {
//         if (existsImage) {
//           chatImage.src = image
//           chatImage.onclick = function () {
//             console.log(this)
//           } // going to use this latest to show a user's image fullscreen
//           chatImage.className = 'chat-image'
//           chatImage.onload = function () {
//             chatMessage.appendChild(chatImage)
//           }
//         }
//       })
//     }

//     setTimeout(function () {
//       chatLine.className = 'chat-kill'
//       chatLine.dataset = null
//       // [].slice.call(chat.children).pop().remove()
//       setTimeout(function () {
//         chatLine.remove()
//       }, 2000)
//     }, killDelay)

//     if (document.getElementById('chat').offsetHeight > chatheight) {
//       chat.firstChild.className = 'chat-kill'
//       chat.firstChild.dataset = null
//       // [].slice.call(chat.children).pop().remove()
//       setTimeout(function () {
//         chat.firstChild.remove()
//       }, 2000)
//     }
  }

  chat.rounded = function (key, obj, radius, color) {
    let x = +obj.x
    let y = +obj.y
    let width = +obj.width + styles.bodytext.margin
    let height = +obj.height + styles.bodytext.margin

    if (width < radius * 2 || height < radius * 2) return this.make.graphics({ fillStyle: { color: color}, x: x, y: y, add: false}).generateTexture(key, width, height)
    let options = Array.from({length: 4}, (_, index) => ({
      radians: (index * Math.PI / 2 + Math.PI) % (2 * Math.PI),
      x:  x + (((index + 1) & 2) >> 1) * width,
      y:  y + ~~(index > 1) * height,
      lx: radius * ~~((index-2) * ((index-2) & 1)),
      ly: radius * ~~-((index + 1) & 1),
      ax: radius * (~((index + 1) & 2) + 2),
      ay: radius * (~~(index < 2) || -1)
    }))
    let shape = this.make.graphics({ fillStyle: { color: color}, x: x, y: y, add: false})
      .beginPath()
      .moveTo(x, y + height >> 1)
    options.forEach((current, index, arr) => {
      shape
        .lineTo(current.x + current.lx, current.y + current.ly)
        .arc(current.x + current.ax, current.y + current.ay, +radius, current.radians, arr[index < arr.length - 1 ? index + 1 : 0].radians)
    })
    shape
      .closePath()
      .fillPath()
      .generateTexture(key, width, height)
  return this.make.sprite({
        x: 0,
        y: 0,
        key: key,
        add: true
    }).setOrigin(0)
  }

  chat.strokecolor = function (color) {
    let col = Phaser.Display.Color.IntegerToRGB(color)
    return col.r * 0.2126 + col.g * 0.7152 + col.b * 0.0722 > 255 / 2 ? '#000000' : '#6f6f6f'
  }

  chat.displaystreamer = async function ({username, banner, metrics, url}) {
    await this.cache({key: username + metrics.followers, url: this.CORS + banner}).catch(console.error)
    let info = {}
    let height = 0
    info.sprite = this.make.sprite({
      x: 0,
      y: height,
      key: username + metrics.followers,
      add: true
    }).setOrigin(0)
    height += info.sprite.getBounds().height
    info.name = this.add.text(0, height, `${username} (${url})`, styles.nametext)
    height += info.name.getBounds().height
    Object.keys(metrics).forEach(item => {
      info[item] = this.add.text(0, height, `${metrics[item]} ${item}`, styles.bodytext).setStroke(styles.bodytext.stroke, styles.bodytext.strokethickness)
      height += info[item].getBounds().height
    })
    // info.followers = (this.add.text(0, height, `${followers} followers`, styles.bodytext).setStroke(styles.bodytext.stroke, styles.bodytext.strokethickness))
    // height += info.followers.getBounds().height
    // info.views = (this.add.text(0, height, `${views} views`, styles.bodytext).setStroke(styles.bodytext.stroke, styles.bodytext.strokethickness))
    this.addLatest(Object.values(info))
  }

  chat.bits = async function ({userstate, message, url}) {
    await badgeCheck([{url}]).catch(console.error)
    let info = {}
    info.url = this.make.sprite({
      x: 0,
      y: 0,
      key: url,
      add: true
    })
    //userstate
    //message
    //url
    console.log(userstate, url)
    this.addLatest(Object.values(info))
    this.chatNotice({text: url})
  }


Scenes.set('Chat', {
  x: 64,
  y: 64,
  width: 550,
  height: 1000,
  key: 'chat',
  extend: chat,
  pack: {
      files: [
          { type: 'spritesheet', key: 'pokeicon', url: 'img/pokemonsumo.png', frameConfig: { frameWidth: 38, frameHeight: 38, endFrame: 806 }},
          { type: 'spritesheet', key: 'defaultavatars', url: 'img/avatars.png', frameConfig: { frameWidth: 256, frameHeight: 256, endFrame: 49 }},
          { type: 'spritesheet', key: 'yencat', url: 'img/yencat.png', frameConfig: { frameWidth: 92, frameHeight: 92, endFrame: 802 }}
      ]
  },
  loaderBaseURL: '/',
  baseURL: '/',

  // preload: function () {
  //     this.load.spritesheet({
  //       key: 'pokeicon',
  //       url: '/img/pokemonsumo.png',
  //       frameConfig: { frameWidth: 38, frameHeight: 38, endFrame: 806 }
  //   })
  //     this.load.spritesheet({
  //       key: 'defaultavatars',
  //       url: '/img/avatars.png',
  //       frameConfig: { frameWidth: 256, frameHeight: 256, endFrame: 49 }
  //   })
  //   this.load.setCORS('anonymous')
  // },

  create: function () {
      socket.on('message', payload => this.message(payload))
      socket.on('notice', payload => this.notice(payload))
      socket.on('history', payload => {payload.forEach((item, index) => setTimeout( () => ['message', 'notice'].forEach(type => item.type === type && this[type](item.obj)), 250 * index))})
      socket.on('displaystreamer', payload => this.displaystreamer(payload))
      socket.on('bits', payload => this.bits(payload))
      // socket.on('raffle update', payload => {
      //   payload.winner ? chatNotice({text: payload.id + ' has won the raffle', fadedelay: 24000, level:1}) :
      //   chatNotice({text: payload.id + (payload.entered ? ' enters' : ' leaves') + ' the raffle', fadedelay: 20000, level:1})
      // })
      // socket.on('host', payload => host(payload))
      // socket.on('subscriber', payload => chatNotice({text: payload.username + ' has subscribed (' + payload.method.plan + ') ' + payload.method.planName, fadedelay: 20000, level:1}))
      // { prime: true, plan: 'Prime', planName: 'The Undead' }
      // socket.on('clear', clearChat)
      // socket.on('timeout', timeout)
      socket.emit('chatbot', {  id: 32218175,  channel: 'squilibob'  })

 // this.addLatest([
    // let temp = this.add.container(0, 0, [
    // this.make.sprite({
    //     x: 0,
    //     y: 0,
    //     key: 'defaultavatars',
    //     frame: 48,
    //     add: true}).setOrigin(0)//)
    // ]).mask = new Phaser.Display.Masks.BitmapMask(this, this.avatarMask())
  },

  // update: function () {
  // }
})