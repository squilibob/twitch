const tmi = require('tmi.js')
global.clientOptions = require('./chat/clientoptions')
global.client = new tmi.client(clientOptions)
require('./chat')({  id: '32218175',  channel: clientOptions.channels[0], raffle: 'Raffle', backlog: 5, shoutout: 100, followers: {}, participants: {} })// maybe use a Map instead of an object for participants

module.exports = function(expressServer) {
  expressServer.io.on('connection', function(socket){
    require('./listeners')(expressServer.io, socket)
  })
}