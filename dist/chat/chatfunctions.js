// Javascript helper functions
function dehash (channel) {
  return typeof (channel) === 'string' ? channel.replace(/^#/, '') : channel
}

function capitalize (str) {
  return str === undefined ? '' : str.replace(/^./,  i => i.toUpperCase())
}

function htmlEntities (html) {
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

  return isArray ? html.join('') : html
}

function checkImageExists (imageUrl, callBack) {
  let imageData = new Image()
  imageData.onload = function () {
    callBack(true)
  }
  imageData.onerror = function () {
    callBack(false)
  }
  imageData.src = imageUrl
}

function chatNotice (obj) {
  let ele = document.createElement('li')
  ele.className = 'chat-line chat-notice'
  ele.innerHTML = obj.text
  if (obj.class !== undefined) {
    if (Array.isArray(obj.class)) obj.class = obj.class.join(' ')
    ele.className += ' ' + obj.class
  }
  if (typeof obj.level === 'number' && obj.level != 0) ele.dataset.level = obj.level
  chat.appendChild(ele)
  if (typeof obj.fadedelay === 'number') {
    setTimeout(function () {
      ele.dataset.faded = ''
    }, obj.fadedelay || 500)
  }
    setTimeout(function () {
      ele.className = 'chat-kill'
      ele.dataset = null
      // [].slice.call(chat.children).pop().remove()
      setTimeout(function () {
        ele.remove()
      }, 2000)
    }, killDelay)

  return ele
}

function timeout (obj) {
  channel = obj.channel
  username = obj.username
  if (!doTimeouts) return false
  if (!recentTimeouts.hasOwnProperty(channel)) recentTimeouts[channel] = {}
  if (!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000 * 10 < +new Date()) {
    recentTimeouts[channel][username] = +new Date()
    chatNotice({text: capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), fadedelay:1000, level:1, class:'chat-delete-timeout'})
  }
  let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message')
  for (let i in toHide) {
    let h = toHide[i]
    if (typeof h === 'object') {
      h.innerText = '<Message deleted>'
      h.parentElement.className += ' chat-timedout'
    }
  }
}

function clearChat (channel) {
  if (!doChatClears) return false
  let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]')
  for (let i in toHide) {
    let h = toHide[i]
    if (typeof h === 'object') {
      h.className += ' chat-cleared'
    }
  }
  chatNotice({text: 'Chat was cleared in channel ' + capitalize(dehash(channel)), fadedelay:1000, level:1, class:'chat-delete-clear'})
}

function host (obj) {
  if (!showHosting) return false
  let text = {
    hosted: obj.username + ' is now hosting ' + capitalize(dehash(obj.channel)),
    hosting: capitalize(dehash(obj.channel)) + ' is now hosting ' + obj.username,
    stopped: capitalize(dehash(obj.channel)) + ' stopped hosting'
  }[obj.type] + (obj.viewers ? ' for ' + obj.viewers + ' viewer' + (obj.viewers !== 1 ? 's' : '') : '')
  chatNotice({text: text, fadedelay:null, level:null, class:'chat-hosting-yes'})
}

function submitchat (text) {
  queue.messages.push(text)
}

function dequeue () {
  if (Date.now() - queue.lastMessage > (1000 * botDelay || 1000) && queue.messages.length) {
    if (queue.messages.join(' / ').length < 500) {
      client.say(queue.channel, queue.messages.join(' / '))
      queue.messages = []
    } else {
      client.say(queue.channel, queue.messages.shift())
    }
    queue.lastMessage = Date.now()
  }
}

function parseraffle (raff) {
  let justentered = []
  let updated = {}
  for (person in raff) {
    if (participants[raff[person].id] == undefined && raff[person].entered) {
      justentered.push(raff[person].id)
      updated[raff[person].id] = raff[person].chance
    } else if (raff[person].entered) {
      updated[raff[person].id] = raff[person].chance
    }
  }
  participants = updated
  justentered.length > 0 && submitchat(justentered.join(', ') + (justentered.length == 1 ? ' has' : ' have') + ' been entered into the raffle')
}

function urlDecode (message) {
  let checkall = message.split(' ')
  extensionloop: for (i in checkall) {
    // if (['.png', '.gif', '.jpg'].forEach())
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

function isMod (user) {
  if ((user || {}).badges) {
    if ('broadcaster' in user.badges) return true
    return user.mod
  }
  return false
}

function checkPoke (message) {
  message = message.toLowerCase().replace('nature', '') // fixes Natu false positive
  let listofpokemon = []
  if (message.toLowerCase().indexOf('mewtwo') >= 0) {
    listofpokemon.push(pokedex[149])
    message = message.toLowerCase().replace('mewtwo', '')
  }
  pokemonnameloop: for (let pokes = maxpokes - 1; pokes >= 0; pokes--) {
    if (message.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) {
      if (pokedex[pokes].Forme) {
        let mergeforme
        findformeloop: for (forme in pokedex[pokes].Forme) {
          if (message.toLowerCase().indexOf(forme.toLowerCase()) >= 0) {
            mergeforme = JSON.parse(JSON.stringify(pokedex[pokes]))
            mergeformeloop: for (merge in pokedex[pokes].Forme[forme]) { mergeforme[merge] = pokedex[pokes].Forme[forme][merge] }
            mergeforme.Pokemon = forme
            listofpokemon.push(mergeforme)
          }
        }
        !mergeforme && listofpokemon.push(pokedex[pokes])
      } else listofpokemon.push(pokedex[pokes])
      message = message.substr(0, message.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase())) + message.substr(message.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) + pokedex[pokes].Pokemon.length)
    }
  }
  if (!listofpokemon.length) return []
  return listofpokemon.sort(function (a, b) {
    return message.indexOf(a.Pokemon.toLowerCase()) - message.indexOf(b.Pokemon.toLowerCase())
  })
}

function checkDb (obj) {
  let message = obj.message
  let dexno = obj.pokemon[0]

  let sp = false
  let command = message.toLowerCase().split(' ')
  let response

  testtypeloop: for (let iterate in command) {
    iterate = parseInt(iterate)
    if (command[iterate].indexOf('type') >= 0 && obj.pokemon[0].Secondary) {
      response = obj.pokemon[0].Pokemon + ' types are ' + obj.pokemon[0].Type + '/' + obj.pokemon[0].Secondary
    } else {
      sploop: for (let key in obj.pokemon[0]) {
        if (iterate + 1 < command.length && (command[iterate] == 'sp.' || command[iterate] == 'special')) {
          sp = true
          if ('sp. ' + command[iterate + 1] == key.toLowerCase()) {
            response = obj.pokemon[0].Pokemon + ' ' + key + ': ' + obj.pokemon[0][key]
          }
        } else {
          if (command[iterate] == key.toLowerCase() && key != 'Pokemon' && key != 'EVs' && key != 'Forme' && key != 'Evolve' && key != 'Ability' && sp == false) {
            if (obj.pokemon[0][key] !== undefined) if (obj.pokemon[0][key].length) response = obj.pokemon[0].Pokemon + ' ' + key + ': ' + obj.pokemon[0][key]
            if (key == 'Nature' || key == 'Attack' || key == 'Defense' || key == 'Speed') {
              let tempresponse = checkMoves(obj)
              if (tempresponse) response = tempresponse
            }
          }
          if ((command[iterate] == key.toLowerCase() || command[iterate] == 'abilities') && key == 'Ability') {
            if (obj.pokemon[0][key].length) {
              response = obj.pokemon[0].Pokemon + ' has the abilit' + (obj.pokemon[0][key].length > 0 ? 'y' : 'ies') + ' ' + obj.pokemon[0].Ability.join(', ')
              if (obj.pokemon[0][key].length > 2) response += ' (hidden ability)'
            }
          }
          if ((command[iterate] == key.toLowerCase() || command[iterate] == 'formes') && key == 'Forme') {
            response = obj.pokemon[0].Pokemon + ' Formes are'
            for (forme in obj.pokemon[0].Forme) response += ', ' + forme
          }
          if (key == 'Mass' && (command[iterate].indexOf('mass') >= 0 || command[iterate] == 'heavy' || command[iterate].indexOf('weigh') >= 0)) response = obj.pokemon[0].Pokemon + "'s mass is " + obj.pokemon[0][key] + ' kg'
       // if (key == 'Mass' && command[iterate] == key.toLowerCase()) response += ' kg';
          if (key == 'Height' && (command[iterate] == 'height' || command[iterate] == 'high' || command[iterate] == 'tall')) response = obj.pokemon[0].Pokemon + "'s height is " + obj.pokemon[0][key] + ' m'
       // if (key == 'Height' && command[iterate] == key.toLowerCase()) response += ' m';
        }
      }
    }
  }
  return response
}

function checkMoves (obj) {
  let message = obj.message
  let dexno = obj.pokemon.length ? obj.pokemon[0].id : -1
  let response
  let fullmove = ''
  moveloop: for (move in moves) {
    let testmessage = (dexno > -1) ? message.toLowerCase().replace(obj.pokemon[0].Pokemon.toLowerCase(), '').split(' ') : message.toLowerCase().split(' ')
    let testIndex = false
    let testmove = move.toLowerCase().split(' ')
    if (testmove.length == 1) {
      for (testfirst of testmessage) {
        if (testfirst == testmove[0]) testIndex = testfirst
      }
    } else {
      if (testmessage.join(' ').indexOf(move.toLowerCase()) >= 0) testIndex = move.toLowerCase()
    }
    if (testIndex && fullmove.indexOf(move.toLowerCase()) < 0) {
      fullmove = move.toLowerCase()
      property = Object.keys(moves[move])
      response = move + ': ' + moves[move].Description
      moveproploop: for (key in property) {
        if (message.toLowerCase().indexOf(property[key].toLowerCase()) >= 0) { response = move + ' ' + property[key] + ': ' + moves[move][property[key]] }
        if (message.toLowerCase().indexOf('pokemon') >= 0) {
          let learnlist = []
          pokemoveloop: for (poke in moves[move].Pokemon) {
            learnlist.push(poke)
          }
          response = 'The pokemon that can learn ' + move + ' are: '
          if (learnlist.length < response_length + 1) response += learnlist.join(', ')
          else {
            pokemonthatcanlearnloop: for (let learnresponse = 0; learnresponse < response_length - 1; learnresponse++) {
              response += learnlist[learnresponse] + ', '
            }
            response += (learnlist.length - response_length) + ' more'
          }
        }
        if (dexno > -1) {
          if (moves[move].Pokemon[obj.pokemon[0].Pokemon]) {
            response = obj.pokemon[0].Pokemon + ' learns ' + move
            if (typeof (moves[move].Pokemon[obj.pokemon[0].Pokemon]) === 'number') { response += ' at level ' + moves[move].Pokemon[obj.pokemon[0].Pokemon] } else
            if (moves[move].Pokemon[obj.pokemon[0].Pokemon].toLowerCase() == 'start') response = obj.pokemon[0].Pokemon + ' starts with the move ' + move
            else
              if (moves[move].Pokemon[obj.pokemon[0].Pokemon].toLowerCase() == 'egg') response += ' as an egg move by breeding'
              else response += ' by ' + moves[move].Pokemon[obj.pokemon[0].Pokemon]
          } else response = obj.pokemon[0].Pokemon + ' does not learn ' + move
        }
      }
    }
  }

  return response
}

function checkExist (checkstring, checkarray, separateword) {
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

function getChunks(){
  const {process} = require('./metaphone')
  let chunks = []
  for (word of message.split(' ')) {
    chunks.push(process(word).length)
  }
  return chunks

}