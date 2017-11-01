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

exports.submitchat = function (text) {
  botqueue.messages.push(text)
}

exports.dequeue = function (delay) {
  if (Date.now() - botqueue.lastMessage > (1000 * delay || 1000) && botqueue.messages.length) {
    if (botqueue.messages.join(' / ').length < 500) {
      client.say(botqueue.channel, botqueue.messages.join(' / '))
      botqueue.messages = []
    } else {
      client.say(botqueue.channel, botqueue.messages.shift())
    }
    botqueue.lastMessage = Date.now()
  }
}

exports.parseraffle = function (raff) {
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

exports.checkPoke = function (originalmessage, maxpokes) {
  let message = originalmessage.toLowerCase().replace('nature', '') // fixes Natu false positive
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
    return originalmessage.toLowerCase().indexOf(a.Pokemon.toLowerCase()) - originalmessage.toLowerCase().indexOf(b.Pokemon.toLowerCase())
  })
}

// make a list of keys first - func name: "getkeys"
// if asked pokemon by name then for each pokemon by name return each keys "answer" - func name "formatsingle"
// if asked how many pokemon - func name: "composite"
function filterMessage(message) {
  let ignore = ['pokemon', 'evs', 'evolve', 'faces']
  let substitutions = {
    'Height': ['high', 'tall'],
    'Mass': ['heavy', 'weigh', ' kilo'],
    'Sp.':  ['special']
  }
  return message
    .split(' ')
    .filter(item => !ignore.includes(item.toLowerCase()))
    .map(item => {
      for (sub in substitutions) {
        if (substitutions[sub].includes(item.toLowerCase())) return sub
      }
      return item
    })
    .join(' ')
}

function getKeyList(poke, msg) {
  let message = msg.toLowerCase()
  let keys = []
  Object.keys(poke)
    .map(item => item.toLowerCase())
    .reverse()
    .forEach(field => {
      let found = message.indexOf(field)
      if (found >= 0) {
        keys.push(message.substr(found, field.length))
        message = message.replace(field, '')
      }
    })
  return keys.reverse()
}

function keyValuePair(poke, key) {
  let substitutions = {
    'ability': 'possible ability to have',
    'catch': 'catch rate',
    'hatch': 'hatch rate',
    'evolve': 'evolution',
    'expv': 'base experience given',
    'gender': 'chance of being female gender',
    'item': 'recommended item',
    'nature': 'recommended nature'
  }
  let suffixes = {
    'Height': 'm',
    'Mass': 'kg',
    'Gender': '%',
    'Ability': ' (hidden ability)'
  }
  let value = []
  let field = poke[key]
  if (field === undefined) return { key: [],  value: [] }
  if (Array.isArray(field)) {
    value = field
  } else if (typeof(field) === 'object') {
     value  = Object.keys(field)
  } else value =[field]
  value.last = value.last + (suffixes[key] === undefined ? '' : suffixes[key])
  return {
    key: substitutions[key.toLowerCase()] || key,
    value: value
  }
}

   //POKEMON's KEY KEYSUFFIX, [is, are] VALUE SUFFIX
  // must check if VALUE is an object and only return the key of that object for Color and Forme

exports.checkDb = function (obj) {

  // suffixes
  // 'Height' 'm'
  // 'Mass' 'kg'
  // 'Gender' '%'
  // 'Ability' '(hidden ability)'

  //KEYSUFFIX
  //possible ability to have
  //catch rate
  //hatch rate
  //evolution
  //base experience given
  //chance of being female gender
  //recommended item
  //recommended nature

  //POKEMON's KEY [KEYSUFFIX, KEYSUFFIXplural] [is, are] VALUE SUFFIX
  // must check if VALUE is an object and only return the key of that object for Color and Forme
  let message = obj.message
  let dexno = obj.pokemon[0]

  let sp = false
  let command = message.toLowerCase().split(' ')
  let response

  testtypeloop: for (let iterate in command) {
    iterate = parseInt(iterate)
    if (command[iterate].indexOf('type') >= 0 && dexno.Secondary) {
      response = dexno.Pokemon + ' types are ' + dexno.Type + '/' + dexno.Secondary
    } else {
      sploop: for (let key in dexno) {
        if (iterate + 1 < command.length && (command[iterate] == 'sp.' || command[iterate] == 'special')) {
          sp = true
          if ('sp. ' + command[iterate + 1] == key.toLowerCase()) {
            response = dexno.Pokemon + ' ' + key + ': ' + dexno[key]
          }
        } else {
          if (command[iterate] == key.toLowerCase() && key != 'Pokemon' && key != 'EVs' && key != 'Forme' && key != 'Evolve' && key != 'Ability' && sp == false) {
            if (dexno[key] !== undefined) if (dexno[key].length) response = dexno.Pokemon + ' ' + key + ': ' + dexno[key]
            if (key == 'Nature' || key == 'Attack' || key == 'Defense' || key == 'Speed') { //conflict check against moves
              let tempresponse = checkMoves(obj)
              if (tempresponse) response = tempresponse
            }
          }
          if ((command[iterate] == key.toLowerCase() || command[iterate] == 'abilities') && key == 'Ability') {
            if (dexno[key].length) {
              response = dexno.Pokemon + ' has the abilit' + (dexno[key].length > 0 ? 'y' : 'ies') + ' ' + dexno.Ability.join(', ')
              if (dexno[key].length > 2) response += ' (hidden ability)'
            }
          }
          if ((command[iterate] == key.toLowerCase() || command[iterate] == 'formes') && key == 'Forme') {
            response = dexno.Pokemon + ' Formes are'
            for (forme in dexno.Forme) response += ', ' + forme
          }
          if (key == 'Mass' && (command[iterate].indexOf('mass') >= 0 || command[iterate] == 'heavy' || command[iterate].indexOf('weigh') >= 0)) response = dexno.Pokemon + "'s mass is " + dexno[key] + ' kg'
       // if (key == 'Mass' && command[iterate] == key.toLowerCase()) response += ' kg';
          if (key == 'Height' && (command[iterate] == 'height' || command[iterate] == 'high' || command[iterate] == 'tall')) response = dexno.Pokemon + "'s height is " + dexno[key] + ' m'
       // if (key == 'Height' && command[iterate] == key.toLowerCase()) response += ' m';
        }
      }
    }
  }
  return response
}

exports.checkMoves = function (obj) {
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

