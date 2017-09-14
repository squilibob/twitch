const defaultDB = {host: '192.241.226.10', port: 28015, db: 'Users'}
const fs = require('fs')
const expressServer = { module: require('express') }
expressServer.app = expressServer.module(),
expressServer.server = require('http').Server(expressServer.app)
expressServer.io = require('socket.io')(expressServer.server)
expressServer.path = __dirname
expressServer.database = require('rethinkdb')
expressServer.dbcall = require('./dist/server/database')
require('./dist/server/routes')(expressServer)
global.cached = {}

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

expressServer.database.connect(defaultDB)
.then((c) => dothings(c))
.catch(err => console.log(err))

async function dothings(c){
  expressServer.connection = c
  global.pokedex = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Pokedex').catch(err => console.log(err))
  global.typechart = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'TypeChart').catch(err => console.log(err))
  global.moves = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Moves').catch(err => console.log(err))
  global.tm = db_id_to_duple(await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Tm').catch(err => console.log(err)))
  global.hm = db_id_to_duple(await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Hm').catch(err => console.log(err)))
  global.natures = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Natures').catch(err => console.log(err))
  global.hiddenpower = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'HiddenPowers').catch(err => console.log(err))
  global.Abilities = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Abilities').catch(err => console.log(err))
  global.Bttv = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Bttv').catch(err => console.log(err))
  global.Ffz = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Ffz').catch(err => console.log(err))
  console.log('cache ready', pokedex.length)
  require('./dist/server/instances')(expressServer)
}
