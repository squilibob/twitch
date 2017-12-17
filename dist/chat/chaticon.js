
// chat icon display functions
function pokify (text) {
  let location
  let skippoke = -1
  location = text.toLowerCase().indexOf('mewtwo')
  if (location >= 0) {
    let xpos = spritesheet.rowlen * spritesheet.x - ((149 % spritesheet.rowlen) * spritesheet.x),
      ypos = Math.ceil(pokedex.length / spritesheet.rowlen) * spritesheet.y - (Math.floor(149 / spritesheet.rowlen) * spritesheet.y)
    text = text.slice(0, location) + '<span class="w3-tooltip sprsheet" style="background-position: ' + xpos + 'px ' + ypos + 'px;"><span class="w3-text">M&#8203;ewtwo</span></span>' + text.slice(location + 6)
  }
  location = text.toLowerCase().indexOf('nature')
  if (location >= 0) {
    skippoke = 177
  }
  pokifyloop: for (let pokes = pokedex.length - 1; pokes >= 0; pokes--) {
    if (pokes != skippoke - 1 && text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) {
      if (autocry) socket.emit('pokemon cry', pokes + 1)
      let location = text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()),
        namelength = pokedex[pokes].Pokemon.length
      let xpos = spritesheet.rowlen * spritesheet.x - ((pokes % spritesheet.rowlen) * spritesheet.x),
        ypos = Math.ceil(pokedex.length / spritesheet.rowlen) * spritesheet.y - (Math.floor(pokes / spritesheet.rowlen) * spritesheet.y)
      text = text.slice(0, location) + '<span class="w3-tooltip sprsheet" style="background-position: ' + xpos + 'px ' + ypos + 'px;"><span class="w3-text">' + pokedex[pokes].Pokemon.slice(0, pokedex[pokes].Pokemon.length - 1) + '&#8203;' + pokedex[pokes].Pokemon.slice(pokedex[pokes].Pokemon.length - 1, pokedex[pokes].Pokemon.length) + '</span></span>' + text.slice(location + namelength, text.length)
      pokes++
    }
  }
  return text
}

function ffz (text) {
  ffzloop: for (set in emoticons.ffz) {
    emoteloop: for (emote in emoticons.ffz[set].emoticons) {
      let sizeurl = 1
      sizeloop: for (size in emoticons.ffz[set].emoticons[emote].urls) { if (+size > sizeurl) sizeurl = size }
      let thisemote = emoticons.ffz[set].emoticons[emote].name
      if (text.indexOf(thisemote) >= 0) text = text.replace(new RegExp(thisemote, 'g'), '<img class="emoticon" src="http:' + emoticons.ffz[set].emoticons[emote].urls[sizeurl] + '"/>')
    }
  }
  return text
}

function bttv (text) {
  bttvloop: for (set in emoticons.bttv) {
    let thisemote = emoticons.bttv[set].code
    if (text.indexOf(thisemote) >= 0) text = text.replace(new RegExp(thisemote, 'g'), '<img class="emoticon" src="https://cdn.betterttv.net/emote/' + emoticons.bttv[set].id + '/1x"/>')
  }
  return text
}

function parseEmotes (text, emotes) {
 let list = {}
  for (let emote in emotes) {
    let current = emotes[emote].shift().split('-')
    let word = text.slice(+current.shift(), +current.pop()+1)
    list[emote] = word
  }
  for (emoticon in list) {
    text = text.replace(new RegExp(list[emoticon], 'g'), '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + emoticon + '/4.0">')
  }
  return text
}

function formatEmotes2 (text, emotes) {
  console.log('text', text, emotes)
  let splitText = text.split('')

  for (let i in emotes) {
    let e = emotes[i]
    for (let j in e) {
      let mote = e[j]
      if (typeof mote === 'string') {
        mote = mote.split('-')
        mote = [+mote[0], +mote[1]]
        let length = mote[1] - mote[0],
          empty = Array.apply(null, new Array(length + 1)).map(function () {
            return ''
          })
        splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length))
        splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">')
      }
    }
  }
  return htmlEntities(splitText).join('')
}

function createBadge (name) {
  let badge = document.createElement('div')
  badge.className = 'chat-badge-' + name
  return badge
}

function badges (chan, user, isBot) {
  let chatBadges = document.createElement('span')
  chatBadges.className = 'chat-badges'

  if (userbadges[user.username]) chatBadges.appendChild(createBadge(userbadges[user.username]))

  if (!isBot) {
    if (user.username == dehash(chan)) {
    // if (((user || {}).badges || {}).broadcaster) {
      chatBadges.appendChild(createBadge('broadcaster'))
    }
    if (user['user-type']) {
      chatBadges.appendChild(createBadge(user['user-type']))
    }
    if (user.turbo) {
      chatBadges.appendChild(createBadge('turbo'))
    }
    if (((user || {}).badges || {}).premium) {
      chatBadges.appendChild(createBadge('premium'))
    }
    if (((user || {}).badges || {}).subscriber) {
      chatBadges.appendChild(createBadge('subscriber'))
    }
    if (((user || {}).badges || {}).bits) {
      let bit = 1
      if (user.badges.bits > 99) bit = 100
      if (user.badges.bits > 999) bit = 1000
      if (user.badges.bits > 4999) bit = 5000
      if (user.badges.bits > 9999) bit = 10000
      bit = 'bit' + bit
      chatBadges.appendChild(createBadge(bit))
    }
  } else {
    chatBadges.appendChild(createBadge('bot'))
  }

  return chatBadges
}
