// Javascript helper functions
exports.dehash = function (channel) {
  return typeof (channel) === 'string' ? channel.replace(/^#/, '') : channel
}

exports.capitalize = function (n) {
  return n === undefined ? '' : n[0].toUpperCase() + n.substr(1)
}

exports.htmlEntities = function (html) {
  function it () {
    return html.map(function (n, i, arr) {
      if (n.length == 1) {
        return n.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
          return '&#' + i.charCodeAt(0) + ';'
        })
      }
      return n
    })
  }
  let isArray = Array.isArray(html)
  if (!isArray) {
    html = html.split('')
  }
  let parser = html
  html = it(parser)

  if (!isArray) html = html.join('')
  return html
}

exports.checkImageExists = function (imageUrl, callBack) {

}

exports.timeout = function (Twitch, username) {
    chatqueue[Twitch.id].store('timeout', {username: username, channel:exports.dehash(channel)})
}

exports.clearChat = function (Twitch) {
  chatqueue[Twitch.id].store('clear', exports.capitalize(exports.dehash(Twitch.channel)))
}

exports.submitchat = function (text, channel) {
  botqueue[channel].messages.push(text)
}

exports.dequeue = function (delay, channel) {
  if (Date.now() - botqueue[channel].lastMessage > (1000 * delay || 1000) && botqueue[channel].messages.length) {
    if (botqueue[channel].messages.join(' / ').length < 500) {
      client.say(botqueue[channel].channel, botqueue[channel].messages.join(' / '))
      botqueue[channel].messages = []
    } else {
      client.say(botqueue[channel].channel, botqueue[channel].messages.shift())
    }
    botqueue[channel].lastMessage = Date.now()
  }
}

// Front End
// exports.parseraffle = function (raff, channel) {
//   let justentered = []
//   let updated = {}
//   for (person in raff) {
//     if (participants[raff[person].id] == undefined && raff[person].entered) {
//       justentered.push(raff[person].id)
//       updated[raff[person].id] = raff[person].chance
//     } else if (raff[person].entered) {
//       updated[raff[person].id] = raff[person].chance
//     }
//   }
//   participants = updated
//   justentered.length > 0 && submitchat(justentered.join(', ') + (justentered.length == 1 ? ' has' : ' have') + ' been entered into the raffle', channel)
// }

exports.urlDecode = function (message) {
  let checkall = message.split(' ')
  extensionloop: for (i in checkall) {
    if (checkall[i].toLowerCase().indexOf('.png') >= 0 || checkall[i].toLowerCase().indexOf('.gif') >= 0 || checkall[i].toLowerCase().indexOf('.jpg') >= 0) {
      return {
        image: checkall[i],
        message: message.slice(0, message.indexOf(checkall[i])) + message.slice(message.indexOf(checkall[i]) + checkall[i].length + 1)
      }
    }
  }
  return {
    image: null,
    message: message
  }
}

exports.isMod = function (user) {
  if ((user || {}).badges) {
    if ('broadcaster' in user.badges) return true
    return user.mod
  }
  return false
}

exports.checkExist = function (checkstring, checkarray, separateword) {
  let exist = false
  if (separateword) {
    checkseparatewordloop: for (word of checkstring.toLowerCase().split(' ')) { if (checkarray.indexOf(word) >= 0) exist = true }
  } else {
    checknotseparatewordloop: for (word of checkarray) {
      if (checkstring.toLowerCase().indexOf(word) >= 0) exist = true
    }
  }
  return exist
}

exports.getChunks = function(message) {
  return new Promise(function(resolve, reject) {
    const {process} = require('./metaphone')
    let chunks = message.split(' ').map(word => process(word).length)
    // let chunks = []
    // for (word of message.split(' ')) {
    //   chunks.push(process(word).length)
    // }
    resolve(chunks)
  })
}

