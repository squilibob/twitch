
// chat icon display functions
function pokify (text, pokes) {
  console.log('pokify', text)

  pokes.forEach(poke => {
    let location = text.toLowerCase().indexOf(poke.Pokemon.toLowerCase())
    if (location < 0) return
    let xpos = spritesheet.rowlen * spritesheet.x - (((poke.id - 1) % spritesheet.rowlen) * spritesheet.x)
    let ypos = Math.ceil(maxpokes / spritesheet.rowlen) * spritesheet.y - (~~((poke.id - 1) / (spritesheet.rowlen)) * spritesheet.y)
    text = text.slice(0, location) + '<span class="w3-tooltip sprsheet" style="background-position: ' + xpos + 'px ' + ypos + 'px;"><span class="w3-text">' + poke.Pokemon.slice(0, poke.Pokemon.length - 1) + '&#8203;' + poke.Pokemon.slice(poke.Pokemon.length - 1, poke.Pokemon.length) + '</span></span>' + text.slice(location + poke.Pokemon.length, text.length)
  })

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
  console.log('emotes', text)
  return text
}

// function formatEmotes (text, emotes) {
//   let splitText = text.split('')

//   for (let i in emotes) {
//     let e = emotes[i]
//     for (let j in e) {
//       let mote = e[j]
//       if (typeof mote === 'string') {
//         mote = mote.split('-')
//         mote = [+mote[0], +mote[1]]
//         let length = mote[1] - mote[0],
//           empty = Array.apply(null, new Array(length + 1)).map(function () {
//             return ''
//           })
//         splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length))
//         splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">')
//       }
//     }
//   }
//   return htmlEntities(splitText).join('')
// }

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
