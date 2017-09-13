module.exports = function(expressServer) {
      expressServer.io.on('connection', function(socket){
        expressServer.socket = socket
        require('./listeners')(expressServer)
        require('./chat')(expressServer)
      })
    }