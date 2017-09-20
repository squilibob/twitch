  function displaystreamer(obj) {
    if (!obj.followers || obj.followers <= minfollowerstoshoutout) return false
    if (obj.banner == null) obj.banner = defaultavatar
    var chatLine = document.createElement('li')
    var chatLineBanner = document.createElement('li')
    var chatBanner = document.createElement('img')
    var chatStreamerName = document.createElement('div')
    var chatStreamerFollowers = document.createElement('div')
    var chatStreamerViews = document.createElement('div')
    chatLine.ondblclick = function () {
      this.className = 'chat-kill'
      setTimeout(this.remove(), 2000)
    }
    chatLine.className = 'chat-line'
    chatStreamerName.className = 'chat-shoutout'
    chatStreamerFollowers.className = 'chat-shoutout'
    chatStreamerViews.className = 'chat-shoutout'
    chatLineBanner.appendChild(chatBanner)
    chatBanner.className = 'chat-image'
    chatBanner.src = obj.banner
    chatStreamerName.innerHTML = obj.username
    chatStreamerFollowers.innerHTML = obj.followers.toLocaleString() + ' followers'
    chatStreamerViews.innerHTML = obj.views.toLocaleString() + ' views'
    chatLine.appendChild(chatStreamerName)
    chatLine.appendChild(chatStreamerFollowers)
    chatLine.appendChild(chatStreamerViews)
    chatBanner.onload = function () {
      chat.appendChild(chatLineBanner)
      chat.appendChild(chatLine)
      submitchat('check out ' + obj.username + ' at ' + obj.url)
      streamers.push(obj.username)
    }
  }

/*
          socket.on('newchatter', function (avatar){
            console.log(avatar)
                if (typeof(avatar) !== 'number') tempload = game.load.image('temp1', avatar, 32, 32)
                tempload.onLoadComplete.add(_this.work, _this)
                tempload.start()
          })
  work: function () {
    game.add.sprite(300, 300, 'temp1')
  },
      game.load.crossOrigin = 'anonymous'
      */

  function handleChat (obj) {
    var name = obj.user.username,
      user = obj.user,
      message = obj.message,
      self = obj.self,
      avatar = obj.avatar,
      image = obj.image,
      chan = dehash(obj.channel),
      chatLine = document.createElement('li'),
      chatAlignment = document.createElement('div'),
      chatChannel = document.createElement('span'),
      chatName = document.createElement('span'),
      chatStreamer = document.createElement('span'),
      chatBadge,
      chatColon = document.createElement('span'),
      chatTime = document.createElement('span'),
      chatContainer = document.createElement('div'),
      chatMessage = document.createElement('div'),
      chatImage = document.createElement('img'),
      date = new Date()

    var color = useColor ? user.color : 'inherit'
    if (color === null) {
      if (!randomColorsChosen.hasOwnProperty(chan)) {
        randomColorsChosen[chan] = {}
      }
      if (randomColorsChosen[chan].hasOwnProperty(name)) {
        color = randomColorsChosen[chan][name]
      } else {
        color = defaultColors[Math.floor(Math.random() * defaultColors.length)]
        randomColorsChosen[chan][name] = color
      }
    }
    if (color.indexOf('(') != color.indexOf(')')) {
      var colorstring = color.slice(color.indexOf('(') + 1, color.indexOf(')'))
      var colortemp = colorstring.split(',')
      var colortotal = 0
      colorloop: for (var string = 0; string < colortemp.length; string++) colortotal += parseInt(colortemp[string])
      if (colortotal > whitethreshold * 3) chatMessage.style.color = '#000000'
    }
   // else {
   //   var colortemp = color.match( /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
   //   if (colortemp.length) var colorstring = 'rgba(' + parseInt(colortemp[colortemp.length-3], 16) + ', ' + parseInt(colortemp[colortemp.length-2], 16) + ', ' + parseInt(colortemp[colortemp.length-1], 16) + ', ' + colorbrightness + ')';
   //   if (colorstring) color = colorstring;
   // }

    if (name == 'mikuia') return false

    chatLine.ondblclick = function () {
      this.className = 'chat-kill'
      setTimeout(this.remove(), 2000)
    }
    chatLine.className = 'chat-line'
    chatLine.dataset.hide = ''
    chatLine.dataset.username = name
    chatLine.dataset.channel = chan

    if (user['message-type'] == 'action') {
      chatLine.className += ' chat-action'
    }
    chatChannel.className = 'chat-channel'
    chatChannel.innerHTML = chan

    console.log(avatar)
    if (typeof avatar !== 'number' || avatar < 0) {
      var chatAvatar = document.createElement('img')
      chatAvatar.className = 'chat-avatar'
      chatAvatar.dataset.hide = ''
      chatAvatar.src = avatar
    } else {
      var chatAvatar = document.createElement('span')
      chatAvatar.className = 'avs'
      var xpos = 128 * ((Useravatars.total - (avatar + 1) % 7))
      var ypos = 128 * (Useravatars.total - Math.floor((avatar + 1) / 7))
    // chatAvatar.style = 'background-position:  ' + xpos + 'px  ' + ypos + 'px';
      chatAvatar.style.backgroundPositionX = xpos + 'px'
      chatAvatar.style.backgroundPositionY = ypos + 'px'
    }
    chatAvatar.style.border = '6px solid ' + color
    chatTime.className = 'chat-time'
    chatTime.innerHTML = String.fromCodePoint(date.getHours() > 12 ? 128323 + date.getHours() : (date.getHours() < 1 ? 128347 : 128335 + date.getHours())) + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) // (not using seconds right now) + '.' + ('0' + date.getSeconds()).slice(-2) ;

    chatName.className = 'chat-name'
    chatName.style.color = color
    chatName.innerHTML = user['display-name'] || name
   // chatName.innerHTML = chatName.innerHTML.replace(/[^a-z+]+/gi, '');

    if (streamers.includes(name)) {
      chatStreamer.className = 'chat-streamer'
      chatStreamer.innerHTML = 'streamer'
    }

    chatAlignment.className = 'chat-align'
    chatAlignment.appendChild(chatName)
    if (showBadges) {
      chatBadge = badges(chan, user, self)
      chatAlignment.appendChild(chatBadge)
    }
    streamers.includes(name) && chatAlignment.appendChild(chatStreamer)
    if (showChannel && client.channels.length > 1) chatAlignment.appendChild(chatChannel)
    chatAlignment.appendChild(chatTime)
    chatLine.appendChild(chatAlignment)

    chatColon.className = 'chat-colon-hide'
    chatColon.style.color = color

    chatContainer.className = 'chat-message-container'
    chatContainer.dataset.hide = ''
    chatContainer.style.background = color
   // chatContainer.style.opacity = chatopacity;

    chatMessage.className = 'chat-message'
    chatMessage.dataset.hide = ''
   // chatMessage.style.background = color;
    chatMessage.innerHTML = showEmotes ? formatEmotes(message, user.emotes) : htmlEntities(message)
    chatMessage.innerHTML = pokify(chatMessage.innerHTML)
    chatMessage.innerHTML = ffz(chatMessage.innerHTML)
    chatMessage.innerHTML = bttv(chatMessage.innerHTML)
    chatMessage.innerHTML = twemoji.parse(chatMessage.innerHTML)

    if (image) {
      checkImageExists(image, function (existsImage) {
        if (existsImage) {
          chatImage.src = image
          chatImage.onclick = function () {
            console.log(this)
          } // going to use this later to show a user's image fullscreen
          chatImage.className = 'chat-image'
          chatImage.onload = function () {
            chatMessage.appendChild(chatImage)
          }
        }
      })
    }

    chatContainer.appendChild(chatMessage)

    chatLine.appendChild(chatAvatar)
    chatLine.appendChild(chatColon)
    chatLine.appendChild(chatContainer)

    chatAvatar.onload = chat.appendChild(chatLine)
   // chatAvatar.onload = chatAvatar.src ? (chatAvatar.src != defaultavatar ? temp = (btoa(chatAvatar)) : null) : null ;

    if (typeof fadeDelay === 'number') {
      setTimeout(function () {
        chatLine.dataset.faded = ''
        chatMessage.dataset.faded = ''
        chatColon.dataset.faded = ''
        chatContainer.dataset.faded = ''
     // chatMessage.style.opacity = 1;
        chatChannel.dataset.faded = ''
        chatAvatar.dataset.faded = ''
        chatName.dataset.faded = ''
        chatName.style.color = '#ffffff'
        chatName.style.fontSize = '24px'
        if (chatBadge) chatBadge.dataset.faded = ''
        chatTime.dataset.faded = ''
        chatImage.dataset.faded = ''
      }, fadeDelay)
    }
    setTimeout(function () {
      chatColon.className = 'chat-colon'
      delete chatLine.dataset.hide
      delete chatMessage.dataset.hide
      delete chatAvatar.dataset.hide
    }, 64)

    while (document.getElementById('chat').offsetHeight > chatheight * 1.25) {
      var oldMessages = [].slice.call(chat.children).slice(0, 1)
      var logmsg = oldMessages[0]
      socket.emit('log chat', logmsg.innerHTML)
      oldMessages[0].remove()
    // var oldMessages = [].slice.call(chat.children).slice(0, 10);
    // for(var i in oldMessages) oldMessages[i].remove();
    }
    if (document.getElementById('chat').offsetHeight > chatheight) {
      chat.firstChild.className = 'chat-kill'
      chat.firstChild.dataset = null
    }
  }
