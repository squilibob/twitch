const {dehash, capitalize, checkImageExists, timeout, hosting, submitchat, dequeue, parseraffle, urlDecode, isMod, checkExist, splitMessage} = require('./chatfunctions')
const {checkPoke, checkDb, getMoveList, checkMoves, compoundCheck, describeMove} = require('./fieldparse')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer, getFollowDate} = require('./chatapi')
const {typeMatchup, effective} = require('./pokemonparse')
const {bttvapi, ffzapi} = require('./externalapi')
const {parseUser} = require('./user')

let started,
  // maxpokes = 802,
  botDelay = 1, // Number of seconds between each bot message
  autocry = false // Play the pokemon's cry sound whenever it is mentioned in chat

exports.parseMessage = async function (Twitch, user, channel, message, self, userdata) {
  if (user['message-type'] != 'chat' && user['message-type'] != 'action') return false
  let messagepayload = {
    channel: dehash(channel),
    twitchID: Twitch.id,
    user: user,
    message: message,
    self: self,
    pokemon: checkPoke(message),
    responseSize: botqueue[Twitch.id].responseSize,
  }
  messagepayload.user = parseUser(messagepayload.user, userdata)
  let modmessage = isMod(user)
  let question = ['?', 'do', 'what', 'when', 'where', 'how', 'does', 'can', 'will', 'are', 'which'] // 'who ', 'why ', 'did ',
  // let containsquestion = checkExist(message, question, true)
  let containsquestion = question.includes(message.toLowerCase().split(' ').shift())
  let containsmoves = getMoveList(messagepayload)
  let response
  let displaycommand = true

  if (!self) {
    for (command in parser) {
      let cmdexist = false
      let cmdarr = parser[command].altcmds ? [command].concat(parser[command].altcmds) : [command]
      cmdexist = checkExist(message, cmdarr, parser[command].requires.exclusive)
      if (cmdexist) {
        if (messagepayload.pokemon.length < parser[command].requires.pokemon) cmdexist = false
        if (parser[command].requires.question && !containsquestion) cmdexist = false
        if (parser[command].requires.modonly && !modmessage) cmdexist = false
      }
      if (cmdexist) {
        messagepayload.parameters = message.split(' ').filter(item => !!item).splice(1, parser[command].requires.parameters)
        parser[command].times += 1
        response = await parser[command].action(messagepayload).catch(console.error)
      }
      displaycommand = parser[command].requires.display
    }
  }
  let parseurl = urlDecode(messagepayload.message)
  messagepayload.message = parseurl.message
  let image = parseurl.image
  if (!self && containsquestion && !response) {
    if (messagepayload.pokemon.length) {
      response = checkDb(messagepayload, containsmoves)
    } else {
      if (messagepayload.message.toLowerCase().includes('pokemon')) {
        response = compoundCheck(messagepayload, containsmoves)
      } else {
        if (containsmoves.length) response = describeMove(containsmoves, messagepayload.message)
      }
    }
  }
  let messagearr = splitMessage(messagepayload.user, messagepayload.message)
  displaycommand && chatqueue[Twitch.id].store('message', {channel:messagepayload.channel, message: messagearr, user: messagepayload.user, self: messagepayload.self, image: image})
  response && submitchat(response, Twitch.id)
}

  var parser = {
    '!bot': {
      altcmds: [],
      help: 'this command shows information about the bot',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        return 'This bot was created by squilibob. It is open source and available at https://github.com/squilibob/twitch'
      }
    },
    '!join': {
      altcmds: [],
      help: 'this command joins chat of another twitch streamers channel',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: true,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        await client.join(obj.parameters[0])
        return false
      }
    },
    '!part': {
      altcmds: [],
      help: 'this command leaves chat of another twitch streamers channel',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: true,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        let success = await client.part(dehash(obj.parameters[0]))
        return dehash(success.pop()) === dehash(obj.parameters[0]) ? 'parted ' + obj.parameters[0] : false
      }
    },
    '!raid': {
      altcmds: [],
      help: 'this command shows a raid message and link to a streamers channel',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: true,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        if (!obj.parameters[0]) return false
        client.say(obj.channel, '/me we are now going to raid ' + obj.parameters[0] + ' please go to http://twitch.tv/' + obj.parameters[0] + ' and type the raid message:')
        client.say(obj.channel, 'тo proтecт тнe cнaт froм devasтaтιon, тo υnιтe spaммers wιтнιn oυr naтιon, тo denoυnce тнe evιls of вans and мods, тo eхтend oυr spaм тo тнe space aвove. copy! pasтe! тwιтcн cнaт, scroll aт тнe speed of lιgнт! Ragequιт now or prepare тo fιgнт!')
        client.say(obj.channel, '/me make sure you type it into the chat of ' + obj.parameters[0] + '  at http://twitch.tv/' + obj.parameters[0] + ' !')
        return false
      }
    },
    'tm': {
      altcmds: [],
      help: 'this command displays what a TM is based on its number or name',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1, // refactor
        modonly: false
      },
      action: async function (obj) {
        let response
        let findtm = +obj.message.slice(obj.message.toLowerCase().indexOf('tm') + 2, obj.message.toLowerCase().indexOf('tm') + 5)
        if (findtm > 0 && findtm < 101) { tmnameloop: for (var key in tm[findtm - 1]) response = 'TM' + findtm + ' ' + key + ' can be obtained at ' + tm[findtm - 1][key] } else {
          tmnumberloop: for (num = tm.length; num > 0; num--) {
            tmnamefromnumberloop: for (var key in tm[num - 1]) {
             if (obj.message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'TM' + num + ' ' + key + ' can be obtained at ' + tm[num - 1][key]
            }
          }
        }
        return response
      }
    },
    // 'hm': {
    //   altcmds: [],
    //   help: 'this command displays what a HM is based on its name or number',
    //   times: 0,
    //   requires:
    //   {
    //     question: true,
    //     display: true,
    //     exclusive: false,
    //     pokemon: 0,
    //     parameters: 1, // refactor
    //     modonly: false
    //   },
    //   action: async function (obj) {
    //     let response
    //     if (obj.message.toLowerCase().indexOf('hm') >= 0) {
    //       let findtm = +obj.message.slice(obj.message.toLowerCase().indexOf('hm') + 2, obj.message.toLowerCase().indexOf('hm') + 5)
    //       if (findtm > 0 && findtm < 8) { hmloop: for (var key in hm[findtm - 1]) response = 'HM' + findtm + ' ' + key + ' can be obtained in ORAS at ' + hm[findtm - 1][key] } else {
    //         hmnumberloop: for (num = 1; num < 8; num++) {
    //           hmnamefromnumberloop: for (var key in hm[num - 1]) { if (obj.message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'HM' + num + ' ' + key + ' can be obtained at ' + hm[num - 1][key] }
    //         }
    //       }
    //     }
    //     return response
    //   }
    // },
    'hidden power': {
      altcmds: [],
      help: 'this command shows the IVs required to get a hidden power based on its type',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1, // refactor
        modonly: false
      },
      action: async function (obj) {
        let response =
        hiddenpower
          .filter(hptype => obj.message.toLowerCase().includes(hptype.id))
          .map(hptype => 'in order to get hidden power ' + hptype.id + ' your pokemon needs IVs to be hp: ' + hptype.iv[0] + ' att: ' + hptype.iv[1] + ' def: ' + hptype.iv[2] + ' sp. att: ' + hptype.iv[3] + ' sp. def: ' + hptype.iv[4] + ' speed: ' + hptype.iv[5])
          .join(' and ')
        return response
      }
    },
    '!sign': {
      altcmds: [],
      help: 'this command registers a viewers friend code and in game name',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 2,
        modonly: false
      },
      action: async function (obj) {  //needs some cleanup
        let response
        var fc = []
        var validfc = true
        if (obj.message.toLowerCase().indexOf('-') >= 0) {
          var ign
        // var fcindex = obj.message.indexOf('-') - 4;
        // var fccode = obj.message.substr(fcindex, 14);
          var fccode = obj.message.match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/)[0]
          var parseign = obj.message.substr(0, obj.message.indexOf(fccode)) + obj.message.substr(obj.message.indexOf(fccode) + fccode.length)
          parseign.trim(' ').split(' ').forEach((name, index) => {
            if (name.indexOf('!') < 0 && name.toLowerCase() != 'fc' && name.toLowerCase() != 'ign' && name.toLowerCase() != 'name') ign = name
          })
          fccode.split('-').forEach((fcnumber, index) => fc.push(fcnumber))
          if (fc.length != 3) validfc = false
          validfcloop: for (number in fc) {
            if (!(fc[number] > 0 && fc[number] < 10000)) validfc = false
          }
          if (!ign) validfc = false
          payload = {
            id: obj.user.username,
            ign: ign,
            fc: fc
          }
          if (validfc) {
            await dbcall.userexists('Users', obj.user.username.toLowerCase()) ? dbcall.updateuser('Users', payload) : dbcall.createuser('Users', payload)
            response = 'create: twitch username: ' + obj.user.username + ' IGN: ' + ign + ' fc: ' + fc.join('-')
          } else response = fc.join('-') + ' ' + ign + ' is invalid combination of fc and ign. Please include your ign and fc like this: !signup squilibob 3609-1058-1166'
        } else response = obj.message + ' invalid please include your ign and fc like this: !signup squilibob 3609-1058-1166'
        return response
      }
    },
    '!fc': {
      altcmds: [' fc '],
      help: 'displays the users friend code or the FC of the person specified',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let users = await [...usercache.keys()]
          .map(person => person.toLowerCase())
          .filter(person => obj.message.toLowerCase().split(' ').includes(person))
          .map(async function (person) {
           return await dbcall.getfc('Users', person).catch(console.error)
          })
          // .concat([await dbcall.getfc('Users', obj.user.username.toLowerCase()).catch(console.error)])
          !users.length && users.concat([await dbcall.getfc('Users', obj.user.username.toLowerCase()).catch(console.error)])
          return Promise.all(users)
            .then(found => {
              let response = 'user not found'
              if (found.length) {
                // if (found.length > 1) found = found.filter(user=> user !== obj.user.username.toLowerCase())
                response = found
                  .filter(user => !!user)
                  .filter(user => !!user.id)
                  .map(user => user.id + "'s friend code is " + user.fc[0] + '-' + user.fc[1] + '-' + user.fc[2] + ' IGN ' + user.ign)
                  .join(', ')
              }
              return response
            })
            .catch(console.error)
      }
    },
    '!reload': {
      altcmds: [],
      help: 'this command resets the cached copy of the users avatar to the actual avatar',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        usercache.delete(obj.user.username)
        chatqueue[obj.twitchID].store('notice', {text:'reloaded ' + obj.user.username, fadedelay:1000, level:-4})
      }
    },
    '!enter': {
      altcmds: [],
      help: 'this command enters the user into the raffle',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        await dbcall.raffleUserExists('Users', obj.user.username) ? dbcall.modifyRaffleUser('Users', obj.user.username, true) : dbcall.newRaffleUser('Users', obj.user.username, 1)
        return false
      }
    },
    '!leave': {
      altcmds: [],
      help: 'this command removes a user from the raffle',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        dbcall.modifyRaffleUser('Users', obj.user.username, false, 1)
        return false
      }
    },
    '!vote': {
      altcmds: [],
      help: 'this command votes for a poll option',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        var voteoption = obj.message.split(' ')
        (voteoption.length > 1 && voteoption[0].indexOf('!vote') >= 0) ? dbcall.sendvote('Users', {id: obj.user.username.toLowerCase(), vote: capitalize(voteoption[1].toLowerCase())}) : chatqueue[obj.twitchID].store('showvote', await dbcall.showvote('Users', 'Show vote'))
        return false
      }
    },
    '!cmd': {
      altcmds: ['!command'],
      help: 'this command shows a list of all the commands',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let response = 'The bot keywords for ' + obj.channel + ' are'
        for (command in parser) {
          response += ' ' + command
          if (parser[command].altcmds.length > 0) response += ' (or ' + parser[command].altcmds.join(' ') + ')'
        }
        return response
      }
    },
    '!uptime': {
      altcmds: [],
      help: 'this command shows how long the stream has been live',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        let response
        let uptime = +(new Date()) - await getStart(obj.twitchID)
        console.log('uptime', uptime)
        let hours = ~~((uptime % 86400000) / 3600000)
        let minutes = ~~(((uptime % 86400000) % 3600000) / 60000)
        response = ('Stream has been live for ' + hours + (minutes < 10 ? ':0' : ':') + minutes)
        return response
      }
    },
    // '!viewers': {
    //   altcmds: [],
    //   help: 'this command shows how many people in chat and how many reported viewers from the API',
    //   times: 0,
    //   requires:
    //   {
    //     question: false,
    //     display: true,
    //     exclusive: false,
    //     pokemon: 0,
    //     parameters: 1,
    //     modonly: false
    //   },
    //   action: async function (obj) {
    //     return watching.chatters.length.toLocaleString() + ' in chat ' + watching.viewers.toLocaleString() + ' reported viewers'
    //   }
    // },
    '!follow': {
      altcmds: [],
      help: 'this command shows how long the user has been following',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let followtime = await getFollowDate(obj.user['user-id'], obj.twitchID)
        console.log('followtime', followtime)
        return !!followtime ? obj.user.username + ' followed ' + ~~((Date.now() - datefollowed) / 8.64e7) + ' days ago (' + datefollowed.toDateString() + ')' : obj.user.username + ' is not a follower'
        // let response = obj.user.username + ' is not a follower'
        // if (obj.followers[obj.user.username.toLowerCase()]) response = obj.user.username + ' followed ' + obj.followers[obj.user.username.toLowerCase()].followed
        // return response
      }
    },
    '!raffle': {
      altcmds: [],
      help: 'this command shows a users chance to win the raffle if they are in the raffle',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        let users = await dbcall.gettable('Users', 'Raffle')
        if (users.filter(user => user.entered).length === 0) return 'The raffle is empty.'
        let rafflettotal = users
          .filter(user => user.entered)
          .map(user => +user.chance)
          .reduce((a, b) => a + b, 0)
        let response
        let requestingchatter = users
          .filter(user => user.entered)
          .find(user => user.id.toLowerCase() === obj.user.username.toLowerCase())
        if (!requestingchatter) {
          if (users.length > 0) {
            response = users
              .filter(user => user.entered)
              .length + ' in the raffle: ' + users
              .filter(user => user.entered)
              .map(person => person.id + ' (' + ~~(+person.chance / rafflettotal * 10000) / 100 + '%)')
              .join(', ')
          } else {
            response = 'You must provide your Friend Code to join raffles and then use !enter. Signup page: ' + websiteurl + ' or use !signup'
          }
        } else {
          response = obj.user.username + ' has a ' + ~~(requestingchatter.chance / rafflettotal * 10000) / 100 + '% chance to win the raffle'
        }
        return response
      }
    },
    '!draw': {
      altcmds: [],
      help: 'draws a user from the raffle from those whom have entered it',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: true
      },
      action: async function (obj) {
        let raffle = []
        let users = await dbcall.gettable('Users', 'Raffle')
        if (users.filter(user => user.entered).length === 0) return 'The raffle is empty.'
        users = users
          .filter(user => user.entered)
          // .map(user => new Array(+user.chance).fill(user.id))
          .map(user => Array.from({length: +user.chance}, () => user.id))
          .reduce((a,b) => b.concat(a))
        let winner = users[~~(Math.random() * users.length)]
        await dbcall.rafflewinner('Users', winner)
        return winner + ' has won the raffle'
      }
    },
    'sound': {
      altcmds: [],
      help: 'this command plays the sound of the cry of a pokemon',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 1,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        obj.pokemon.forEach(poke => typeof (poke.id === 'number') && chatqueue[obj.twitchID].store('playsound', poke.id.toString().padStart(3, "0")))
        return false
      }
    },
    'weak': {
      altcmds: [],
      help: 'this command shows what types a pokemon is weak to',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        return obj.pokemon[0] ? obj.pokemon[0].Pokemon + ' is weak to ' + typeMatchup(obj.pokemon[0].Type, 'weak').join(', ') : typeMatchup(obj.message.split(' '), 'weak').join(', ')
      }
    },
    'resist': {
      altcmds: ['immun'],
      help: 'this command shows what types a pokemon resists or is immune to',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        let response = ' '
        let resist, immune
        if (obj.pokemon.length) {
          response = obj.pokemon[0].Pokemon + ' '
          immune = typeMatchup(obj.pokemon[0].Type, 'immune')
          resist = typeMatchup(obj.pokemon[0].Type, 'resist')
            .filter(item => !immune.includes(item))
        } else {
          immune = typeMatchup(obj.message.split(' '), 'immune')
          resist = typeMatchup(obj.message.split(' '), 'resist')
            .filter(item => !immune.includes(item))
        }
        if (resist.length) response += 'resists ' + resist.join(', ')
        if (resist.length && immune.length) response += ' and '
        if (immune.length) response += 'is immune to ' + immune.join(', ')
        return response.length ? response : 'does not resist anything'
      }
    },
    'strong': {
      altcmds: ['effective'],
      help: 'this command shows what a type is effective against',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        let response
        if (obj.pokemon[0]) {
          response = obj.pokemon[0].Pokemon + ' is super effective against ' + effective(obj.pokemon[0].Type).join(', ')
        } else {
          response = effective(obj.message.split(' ')).join(', ')
        }
        return response
      }
    },
    'evol': {
      altcmds: [],
      help: 'this command shows how a pokemon family line evolves',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 1,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let response = []
        obj.pokemon.forEach(poke => {
          if (poke.Prevo) {
            response.push(poke.Pokemon + ' evolves from ' + poke.Prevo)
            poke.Evolve && poke.Evolve !== 0 && response.push(' (' + poke.Evolve + ') ')
          } else {
            !poke.Evos && response.push(poke.Pokemon + 'cannot evolve')
          }
          poke.Evos && poke.Evos.length > 0 && response.push(poke.Pokemon + ' evolves into ' + poke.Evos.map(evo => evo + ' (' + pokedex.find(method => method.Pokemon === evo)['Evolve'] + ')').join(', '))
      })
      return response.join(' ')
      }
    },
    'find': {
      altcmds: ['route', 'locat', 'obtain', 'catch'],
      help: 'this command shows the in game location of a pokemon',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 1,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let locKeys = ['Location', 'SuMo', 'ORAS']
        return obj.pokemon
          .filter(poke => locKeys.some(key => !!poke[key]))
          .map(poke => poke.Pokemon + ' ' + locKeys.find(key => !!poke[key])  + ' ' + poke[locKeys.find(key => !!poke[key])])
          .join(', ')  || 'No location for ' + obj.pokemon.map(poke => poke.Pokemon).join('  or ')
      }
    },
   '!more': {
     altcmds: [],
     help: 'this command shows the pokemon that were omitted in the previous search due to space restrictions',
     requires :
     {
       question: false,
       exclusive: false,
       display: false,
       pokemon: 0,
       parameters: 0,
       modonly: false
     },
     action: async function (obj){
        let more = botqueue[obj.twitchID].more.length > botqueue[obj.twitchID].responseSize ? '... ' + (botqueue[obj.twitchID].more.length - botqueue[obj.twitchID].responseSize) + ' more' : ''
        let response = botqueue[obj.twitchID].more.splice(0, botqueue[obj.twitchID].responseSize).join(', ')
        return response + more
     }
   },
    '!battle': {
      altcmds: [],
      help: 'this command dispays help on how to battle',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        return 'We do raffles for battles. You must s!signup to join raffles and then use !enter. !raffle will show if you are entered'
      }
    },
    'nature': {
      altcmds: [],
      help: 'this command shows what attributes a nature gives a pokemon',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {  // Need to rewrite the loops on these to use proper es6 array methods
        var reply = ""
        if (obj.message.toLowerCase().indexOf('+') > 0 && obj.message.toLowerCase().indexOf('-') > 0) {
          var plus = obj.message.slice(obj.message.toLowerCase().indexOf('+') + 1).split(' ')
          var minus = obj.message.slice(obj.message.toLowerCase().indexOf('-') + 1).split(' ')
          if (plus[0].toLowerCase() == 'special') plus = plus[0] + ' ' + plus[1]
          else plus = plus[0]
          if (minus[0].toLowerCase() == 'special') minus = minus[0] + ' ' + minus[1]
          else minus = minus[0]
          natures
            .filter(nature => !!nature.increase)
            .filter(nature => (nature.increase.toLowerCase() == plus.toLowerCase() && nature.decrease.toLowerCase() == minus.toLowerCase()))
            .forEach(nature => reply += nature.id + ' is +' + nature.increase + ' and -' + nature.decrease + ' and likes to eat ' + nature.favorite + ' berries' )
        } else {
            natures
              .filter(item => obj.message.toLowerCase().includes(item.id.toLowerCase()))
              .forEach(nature => reply += (nature.increase ? nature.id + ' is +' + nature.increase + ' and -' + nature.decrease + ' and likes to eat ' + nature.favorite + ' berries' : nature.id + ' is neutral'))
        }
        return reply
      }
    },
    'ev': {
      altcmds: ['evs'],
      help: 'this command shows what effort values a defeated pokemon will yield',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: true,
        pokemon: 1,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let response
        response = obj.pokemon[0].Pokemon + ' will reward the EVs:'
        evloop: for (ev in obj.pokemon[0].EVs) response += ' ' + obj.pokemon[0].EVs[ev] + ' x ' + ev
        return response
      }
    },
    'abilit': {
      altcmds: [],
      help: 'this command displays the abilities of a pokemon',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        if (obj.pokemon.length || obj.message.toLowerCase().includes('pokemon')) return
        let response = abilities
          .filter(ability => obj.message.toLowerCase().includes(ability.id.toLowerCase()))
          .map(ability => {
            if (obj.message.toLowerCase().includes('pokemon')) {
              let matches = pokedex.filter(poke => poke.Ability.includes(ability.id))
              let hasability = 'the pokemon with the ability ' + ability.id + ' are: ' + matches
                .splice(0, response_length)
                .map(poke => poke.Pokemon)
                .join(', ')
              if (matches.length) {
                hasability += '(' + matches.length + ' more)'
              }
              return hasability
            }
            else {
             return (ability.id + ': ' + ability.desc)
            }
          })
         return response
      }
    },
    '!fuse': {
      altcmds: [],
      help: 'this command displays alexonsager fusion on the stream',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 2,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        let fused = []
        if (typeof (obj.pokemon[0].id) === 'number' && typeof (obj.pokemon[1].id) === 'number') {
          if (obj.pokemon[0].id > 0 && obj.pokemon[0].id < 493 && obj.pokemon[1].id > 0 && obj.pokemon[1].id < 493) {
             fused.push(obj.pokemon[0])
             obj.pokemon[1] && fused.push(obj.pokemon[1])
             obj.pokemon[2] && fused.push(obj.pokemon[2])
             chatqueue[obj.twitchID].store('show fusion', fused)
           }
        }
      }
    },
    'stat': {
      altcmds: [],
      help: 'this command shows all stats of a pokemon',
      times: 0,
      requires:
      {
        question: true,
        display: true,
        exclusive: false,
        pokemon: 1,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        let response = ''
        obj.pokemon.forEach (poke => {
          response += poke.Pokemon + ' stats: '
          let stat = ['HP', 'Attack', 'Defense', 'Sp. Attack', 'Sp. Defense', 'Speed']
          let total = stat
            .map(stat =>  poke[stat])
            .reduce((a,b) => a + b, 0)
          stat.forEach(stat => response += stat + ': ' + poke[stat] + ', ')
          response += ' (Total: ' + total + ') '
        })
        return response
      }
    },
    '!bttv': {
      altcmds: [],
      help: 'this command incorporates the users bttv emotes into the database',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        let response = []
        let room = await bttvapi(obj.parameters[0]).catch(console.error)
        // console.log('room', Buffer.from(room, 'base64').length) //GIF89a+5188C4+/E7/4G/S+/94065838I4G8XBDU6IA=
        if (room && room.size) {
          let emotelist = {}
          response.unshift('The following emotes were added to the channel:')
          for (item of room.entries()) {
            [key, value] = item
            response.push(value)
            emotelist[key] = value
            Bttv.set(key, value)
          }
          //dbcall.put('Users', 'Ffz', emotelist)
          console.log('Bttv', emotelist)
        }
        return response.join(' ')
      }
    //     if (!self.fetch) {
    //       return
    //     }
    //     var bttvurl = obj.parameters.length ? 'https://api.betterttv.net/2/channels/' + obj.parameters[0] : bttvemotesurl
    //     fetch(bttvurl).then(function (response) {
    //       var contentType = response.headers.get('content-type')
    //       if (contentType && contentType.indexOf('application/json') !== -1) {
    //         return response.json().then(function (json) {
    //           if ((json || {}).emotes) {
    //             for (key in json.emotes) {
    //               dbcall.put('Users', 'Bttv', json.emotes[key]).catch(console.error)
    //             }
    //             chatqueue[obj.twitchID].store('notice', {text:'loaded ' + json.emotes.length + ' emotes', fadedelay:1000, level:-4})
    //             socket.emit('Ask for table', 'Bttv')
    //           }
    //         })
    //       }
    //     })
    //   }
    },
    '!ffz': {
      altcmds: [],
      help: 'this command incorporates the users ffz emotes into the database',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        let response = []
        let room = await ffzapi(obj.parameters[0]).catch(console.error)
        if (room && room.size) {
          let emotelist = {}
          response.unshift('The following emotes were added to the channel:')
          for (item of room.entries()) {
            [key, value] = item
            response.push(value)
            emotelist[key] = value
            Ffz.set(key, value)
          }
          dbcall.put('Users', 'Ffz', emotelist)
        }
        return response.join(' ')
      }
    },
    '!poll': {
      altcmds: [],
      help: 'this command sets up a poll based on the vote options given',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: true,
        pokemon: 0,
        parameters: 1,
        modonly: true
      },
      action: async function (obj) {
        var title
        var options = obj.message.substr(obj.message.toLowerCase().indexOf('!poll') + '!poll'.length).split('|')
        title = options.shift()
        for (voteoption in options) options[voteoption] = capitalize(options[voteoption])
        if (options.length > 1) socket.emit('Vote poll', {options: options, title: title})
      }
    },
    '!showpoll': {
      altcmds: [],
      help: 'this command shows the poll on the stream',
      times: 0,
      requires:
      {
        question: false,
        display: true,
        exclusive: false,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        socket.emit('update vote')
      }
    },
    '!topsyturvy': {
      altcmds: [],
      help: 'this command displays the given text upside down',
      times: 0,
      requires:
      {
        question: false,
        display: false,
        exclusive: false,
        pokemon: 0,
        parameters: 1,
        modonly: false
      },
      action: async function (obj) {
        if (!obj.message.length) return
        var map = {
          'A': '∀',
          'B': '𐐒',
          'C': 'Ɔ',
          'E': 'Ǝ',
          'F': 'Ⅎ',
          'G': 'פ',
          'J': 'ſ',
          'L': '˥',
          'M': 'W',
          'N': 'N',
          'P': 'Ԁ',
          'R': 'ᴚ',
          'T': '⊥',
          'U': '∩',
          'V': 'Λ',
          'W': 'M',
          'Y': '⅄',
          'a': 'ɐ',
          'b': 'q',
          'c': 'ɔ',
          'd': 'p',
          'e': 'ǝ',
          'f': 'ɟ',
          'g': 'ƃ',
          'h': 'ɥ',
          'i': '!',
          'j': 'ɾ',
          'k': 'ʞ',
          'm': 'ɯ',
          'n': 'u',
          'p': 'd',
          'q': 'b',
          'r': 'ɹ',
          't': 'ʇ',
          'u': 'n',
          'v': 'ʌ',
          'w': 'ʍ',
          'y': 'ʎ',
          '1': 'Ɩ',
          '2': 'ᄅ',
          '3': 'Ɛ',
          '4': 'ㄣ',
          '5': 'ϛ',
          '6': '9',
          '7': 'ㄥ',
          '8': '8',
          '9': '6',
          '.': '˙',
          ',': "'",
          '': ',',
          '"': ',,',
          '`': ',',
          '<': '>',
          '>': '<',
          '∴': '∵',
          '&': '⅋',
          '_': '‾',
          '?': '¿',
          '¿': '?',
          '!': '¡',
          '¡': '!',
          '[': ']',
          ']': '[',
          '(': ')',
          ')': '(',
          '{': '}',
          '}': '{'
        }
        return obj.message
          .split(' ')
          .reverse()
          .filter(element => element.toLowerCase() !== '!topsyturvy')
          .map(element => map[element] || map[element.toLowerCase()] || element)
          .join(' ')
      }
    },
    '!discord': {
      altcmds: ['!chat'],
      help: 'this command shows an invite link',
      requires:
      {
        question: false,
        exclusive: false,
        display: true,
        pokemon: 0,
        parameters: 0,
        modonly: false
      },
      action: async function (obj) {
        return "We don't use discord, join us on the twitch app chat server at https://invite.twitch.tv/EdlanMizliPaws"
      }
    },
   '!give': {
     altcmds: [],
     help: 'this command ',
     requires :
     {
       question: false,
       exclusive: false,
       display: true,
       pokemon: 1,
       parameters: 2,
       modonly: false
     },
     action: async function (obj){
      let poke = pokedex
        .filter(item => item.Pokemon.toLowerCase() === obj.pokemon[0].Pokemon.toLowerCase())
        .shift()
        .id
      dbcall.updatecard('Users', obj.parameters[0].toLowerCase(), poke - 1)
      // return `Set ${obj.parameters[0]} card to ${obj.pokemon[0].Pokemon}.`
     }
   },
   // '!test': {
   //   altcmds: [],
   //   help: 'this command ',
   //   requires :
   //   {
   //     question: true,
   //     exclusive: false,
    //    display: true,
   //     pokemon: 0,
   //     parameters: 1,
   //     modonly: false
   //   },
   //   action: async function (obj){
   //     let response;

   //     return response;
   //   }
   // },
  }

 // console.log(parser);
