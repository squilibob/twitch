const defaultDB = {host: '192.241.226.10', port: 28015, db: 'Users'}
const expressServer = { module: require('express') }
expressServer.app = expressServer.module(),
expressServer.server = require('http').Server(expressServer.app)
expressServer.io = require('socket.io')(expressServer.server)
expressServer.path = __dirname
require('./dist/js/polyfill')
const EventEmitter = require('events')

global.r = require('rethinkdb')

r.connect(defaultDB)
.then((c) => init(c))
.catch(err => console.log(err))

function db_id_to_duple(original) {
  let finalarray = []
  original.forEach(elem => {
    for(key in elem) {
      if (elem[key] !== elem.id) {
        finalarray[elem.id-1]={}
        finalarray[elem.id-1][key] = elem[key]
      }
    }
  })
  return finalarray
}

async function init(c){
  global.conn = c
  global.alerts = new EventEmitter()
  global.apiqueue = {}
  global.chatqueue = {}
  global.botqueue = {}
  global.useravatars = {}
  global.badges = {}
  global.streamers = {}
  global.dbcall = require('./dist/server/database')
  require('./dist/server/routes')(expressServer)
  global.pokedex = await dbcall.gettable('Users', 'Pokedex').catch(err => console.log(err))
  pokedex.sort((a, b) => a.id - b.id)
  global.typechart = await dbcall.gettable('Users', 'TypeChart').catch(err => console.log(err))
  global.moves = await dbcall.gettable('Users', 'Moves').catch(err => console.log(err))
  global.tm = db_id_to_duple(await dbcall.gettable('Users', 'Tm').catch(err => console.log(err)))
  global.hm = db_id_to_duple(await dbcall.gettable('Users', 'Hm').catch(err => console.log(err)))
  global.natures = await dbcall.gettable('Users', 'Natures').catch(err => console.log(err))
  global.hiddenpower = await dbcall.gettable('Users', 'HiddenPowers').catch(err => console.log(err))
  global.abilities = await dbcall.gettable('Users', 'Abilities').catch(err => console.log(err))
  global.Bttv = await dbcall.gettable('Users', 'Bttv').catch(err => console.log(err))
  global.Ffz = await dbcall.gettable('Users', 'Ffz').catch(err => console.log(err))

  console.log('cache ready', pokedex.length)
  require('./dist/server/instances')(expressServer)
}
