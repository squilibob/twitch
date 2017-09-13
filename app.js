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

async function fillcache(server) {
  return {
    pokedex: await server.dbcall.gettable(server.database, server.connection, 'Pokedex').catch(err => console.log(err)),
    typechart: await server.dbcall.gettable(server.database, server.connection, 'TypeChart').catch(err => console.log(err)),
    Moves: await server.dbcall.gettable(server.database, server.connection, 'Moves').catch(err => console.log(err)),
    Abilities: await server.dbcall.gettable(server.database, server.connection, 'Abilities').catch(err => console.log(err)),
    Bttv: await server.dbcall.gettable(server.database, server.connection, 'Bttv').catch(err => console.log(err)),
    Ffz: await server.dbcall.gettable(server.database, server.connection, 'Ffz').catch(err => console.log(err))
    }
}

expressServer.database.connect(defaultDB)
.then((c) => dothings(c))
.catch(err => console.log(err))

async function dothings(c){
  expressServer.connection = c
  global.pokedex = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Pokedex').catch(err => console.log(err))
  global.typechart = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'TypeChart').catch(err => console.log(err))
  global.Moves = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Moves').catch(err => console.log(err))
  global.Abilities = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Abilities').catch(err => console.log(err))
  global.Bttv = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Bttv').catch(err => console.log(err))
  global.Ffz = await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Ffz').catch(err => console.log(err))
  console.log('cache ready', pokedex.length)
  require('./dist/server/instances')(expressServer)
}
