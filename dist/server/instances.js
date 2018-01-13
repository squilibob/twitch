const tmi = require('tmi.js')
let clientOptions = require('./chat/clientoptions')
global.client = new tmi.client(clientOptions)
require('./chat')({  id: '32218175',  clientOptions:clientOptions, channel: clientOptions.channels[0], raffle: 'Raffle', backlog: 5, shoutout: 100, api: {limit: 30, remaining: 0, reset: +Date.now()/1000}, followers: {}, participants: {} })// maybe use a Map instead of an object for participants

module.exports = function(expressServer) {
  expressServer.io.on('connection', function(socket){
    require('./listeners')(expressServer.io, socket)
  })
}