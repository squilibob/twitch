const tmi = require('tmi.js')
global.clientOptions = require('./chat/clientoptions')
global.client = new tmi.client(clientOptions)
require('./chat')({  id: '32218175',  channel: clientOptions.channels[0], backlog: 5  })

module.exports = function(expressServer) {
  expressServer.io.on('connection', function(socket){
    require('./listeners')(expressServer.io, socket)
  })
}