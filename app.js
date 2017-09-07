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

async function fillcache(server) {
  return {
    pokedex: await server.dbcall.gettable(server.database, server.connection, 'Pokedex'),
    typechart: await server.dbcall.gettable(server.database, server.connection, 'TypeChart'),
    Moves: await server.dbcall.gettable(server.database, server.connection, 'Moves'),
    Abilities: await server.dbcall.gettable(server.database, server.connection, 'Abilities'),
    Bttv: await server.dbcall.gettable(server.database, server.connection, 'Bttv'),
    Ffz: await server.dbcall.gettable(server.database, server.connection, 'Ffz')
  }
}

expressServer.database.connect(defaultDB).then((c) => {
	expressServer.connection = c
     fillcache(expressServer).then(result => expressServer.cached = result)

	expressServer.database.table('Vote').changes().run(expressServer.connection, function(err, cursor) {
     if (err) throw err
     else {
	     cursor.each(function(err, result) {
      		if (err) throw err
          		sendVoteUpdate()
		})
          }
	})
	expressServer.database.table('Raffle').changes().run(expressServer.connection, function(err, cursor) {
     if (err) throw err
     else {
	     cursor.each(function(err, result) {
      		if (err) throw err
          		sendRaffleUpdate(true)
		})
          }
	})
  expressServer.io.on('connection', function(socket){
    expressServer.socket = socket
	require('./dist/server/listeners')(expressServer)
  })

})
