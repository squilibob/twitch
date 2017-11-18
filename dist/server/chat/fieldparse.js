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

function getKeyList(poke, message) {
  let keys = []
  Object.keys(poke)
    .reverse()
    .forEach(field => {
      if (message.toLowerCase().includes(field.toLowerCase())) {
        keys.push(field)
        message = message.replace(field, '')
      }
    })
  if (keys.includes('Sp. Attack') && keys.includes('Attack')) keys.splice(keys.indexOf('Attack'), 1)
  if (keys.includes('Sp. Defense') && keys.includes('Defense')) keys.splice(keys.indexOf('Defense'), 1)
  return keys.reverse()
}

function conflictCheck(key, movelist) {
  // ['Nature', 'Attack', 'Defense', 'Speed']
  for (move of movelist){
    if (move.id.toLowerCase().includes(key.toLowerCase())) return false
  }
  return true
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

function formatDbmessage(pokename, keys, movelist) {
  let response = [pokename + "'s"]
  keys.forEach(item => {
      response.push(item.key)
      if (Array.isArray(item.value)){
        response.push(item.value.length > 1 ? 'are': 'is')
        response.push(item.value.join(', '))
      } else response.push('is', item.value === -1 ? 'none' : item.value)
    //POKEMON's KEY [KEYSUFFIX, KEYSUFFIXplural] [is, are] VALUE SUFFIX
  })
  if (movelist.length) {
    response = response.concat(movelist
      .filter(move => Object.keys(move.Pokemon).includes(pokename))
      .map(move => formatMove(pokename, move)))
  }
  return response
}

function filterByType(key, msg) {
  let message = msg.toLowerCase()
  if (typeof(key) === 'number') {
    let comparison = ' === '
    if (['higher', 'more', '>', 'greater', 'faster', 'over'].some(item => message.includes(item))){
      comparison = ' > '
    } else if (['lower', 'fewer', '<', 'less', 'slower', 'under'].some(item => message.includes(item))) {
      comparison = ' < '
    }
    if (!message.match(new RegExp('\\d+'))) return false
    let numbers = message
      .match(new RegExp('\\d+'))
      .map(num => parseInt(num))
      .filter(num => eval(key + comparison + num))
    return numbers.length > 0
  }
  if (typeof(key) === 'string') return message.includes(key.toLowerCase())
  if (Array.isArray(key)) return message.includes(key.join(' ').toLowerCase())
  return false // things that are objects - color, EVs, Forme
}

function multipleKey(message, movelist) {
  let response = getKeyList(pokedex[0], filterMessage(message))
    .filter(item => conflictCheck(item, movelist))
    .map(key => pokedex
        .filter(poke => filterByType(poke[key], message))
        .map(poke => poke.Pokemon)
    )
    response = response.length > 1 ? response.reduce((a, b) =>  a.filter(x => b.includes(x))) : response.shift()
    return response
}

function multipleSplitCheck(obj, movelist) {
  let response = messageWithoutPokes(obj.pokemon, obj.message)
    .split(new RegExp(' and ', 'i'))
    .map(message => multipleKey(message, movelist))
    .filter(item => item !== undefined)
    response = response.length > 1 ? response.reduce((a, b) =>  a.filter(x => b.includes(x))) : response.shift()
    return response
}

exports.compoundCheck = function (obj, movelist) {
  let compound = []
  let moves = movelist.map(move => Object.keys(move.Pokemon))
  if (moves) moves = moves.length > 1 ? moves.reduce((a, b) =>  a.filter(x => b.includes(x))) : moves.shift()
  let fields = multipleSplitCheck(obj, movelist)
  fields && fields.length && compound.push(fields)
  if (!fields || !fields.length) return exports.checkMoves(obj, movelist)
  moves && moves.length && compound.push(moves)
  compound = compound.length > 1 ? compound.reduce((a, b) =>  a.filter(x => b.includes(x))) : compound.shift()
  return compound.length ? pruneArray(compound, obj) : 'No pokemon'
}

exports.checkDb = function (obj, movelist) {
  let poke = obj.pokemon[0]
  let response = formatDbmessage(poke.Pokemon,
    getKeyList(poke, filterMessage(messageWithoutPokes(obj.pokemon, obj.message)))
      .filter(item => conflictCheck(item, movelist))
      .map(item => keyValuePair(poke, item)),
    movelist)
  return response.length > 1 ? response.join(' ') : false
}

function messageWithoutPokes(pokes, message) {
  let msg = message
  pokes.forEach(poke => msg = msg.replace(new RegExp(poke.Pokemon, 'i'),''))
  return msg
}

exports.getMoveList =function(obj) {
  let message = obj.message
  let findmoves = []
  let sortmoves = moves
    .sort((a,b) => b.id.length-a.id.length)
    .filter(move => message.toLowerCase().includes(move.id.toLowerCase()))

  for (currentmove of sortmoves) {
    let found = false
    for (move of sortmoves) {
      if (move.id.toLowerCase().includes(currentmove.id.toLowerCase()) && currentmove.id.toLowerCase() != move.id.toLowerCase()) found = true
    }
    !found && findmoves.push(currentmove)
  }
  return findmoves
}

function pruneArray(arr, obj) {
  if (!arr.length) return false
  arrSize = obj.responseSize
  botqueue[obj.twitchID].more = arr.slice(arrSize)
  return arr.slice(0, arrSize).join(', ') + (' ' + arr.length > arrSize ? '... ' + (arr.length - arrSize) + ' more' : '')
}

exports.checkMoves = function (obj, movelist) {
  // return movelist.map(move => 'The pokemon that can learn ' + move.id + ' are: ' + Object.keys(move.Pokemon).slice(0, obj.responseSize).join(', ') + (' ' + Object.keys(move.Pokemon).length > obj.responseSize ? '... ' + (Object.keys(move.Pokemon).length - obj.responseSize) + ' more' : ''))
  return movelist.map(move => 'The pokemon that can learn ' + move.id + ' are: ' + pruneArray(Object.keys(move.Pokemon), obj))
}

exports.describeMove = function (movelist, message) {
  let movekey = Object.keys(movelist.last)
    .filter(key => message.toLowerCase().includes(key.toLowerCase()))
  !movekey.length && movekey.push('Description')
  return movekey
    .map(key => movelist.map(move => move.id + ': ' + move[key]))
    .join(', ')
}

function formatMove(pokename, move) {
 response = ' learns ' + move.id
 if (typeof (move.Pokemon[pokename]) === 'number') {
    response += ' at level ' + move.Pokemon[pokename]
 } else {
  if (move.Pokemon[pokename].toLowerCase() == 'start') {
    response = pokename + ' starts with the move ' + move.id
  } else {
    if (move.Pokemon[pokename].toLowerCase() == 'egg') {
      response += ' as an egg move by breeding'
    } else {
      response += ' by ' + move.Pokemon[pokename]
    }
  }
}
return response
}
