module.exports = function(expressServer) {
  server = expressServer.server
  r = expressServer.database
  conn = expressServer.connection
  cached = expressServer.cache
  io = expressServer.io
  socket = expressServer.socket
  dbcall = expressServer.dbcall

  socket.on('request to connect', async function(msg){
    if (msg.id != '' && msg.id != undefined) {
      console.log('user: ' + msg.id, 'connecting...')
      let connected = await dbcall.requesttoconnect(r, conn, msg.id.toLowerCase())
      if (!connected) {
        createanewuser(msg)
      } else {
        socket.emit('login accepted', connected)
      }
    } else {
      console.log('undefined value sent', msg)
    }
  })
  // socket.on('log chat', function(payload){
  //  fs.appendFile('public/chatlog.html', '<li>'  + payload + '<li>\n', (err) => {
  //    if (err) console.log(err)
  //  })
  // })
  socket.on('disconnect', () => console.log('user disconnected', socket.id))
  socket.on('new user', payload => dbcall.newuser(r, conn, payload))
  socket.on("send fusion", (firstpoke, secondpoke) => io.emit('show fusion', firstpoke, secondpoke))
  socket.on('update avatar', (username, newavatar)  => dbcall.updateavatar(r, conn, username, newavatar))
  socket.on('update badge', (username, newbadge) => dbcall.updatebadge(r, conn, username, newbadge))
  socket.on('set current team', (name, payload) =>  dbcall.setcurrentteam(r, conn, name, payload))
  socket.on('save user pokes', (name, payload) =>  dbcall.saveuserpokes(r, conn, name, payload))
  socket.on('metaphone', (meta, message) => socket.emit('texttopika', meta, message))
  socket.on('enter raffle', (username, displayicon, team_name, team) => database.raffleChangeUser(conn, username.toLowerCase(), 12, true, displayicon, team_name, team))
  socket.on('leave raffle', (username, displayicon, team_name) => database.raffleChangeUser(conn, username.toLowerCase(), 12, false, displayicon, '', [0]))
  socket.on("pokemon cry", poke => io.emit("playsound", ('000' + poke).substr(-3)))
  socket.on("Vote poll", payload => dbcall.votepoll(r, conn, payload))
  socket.on("Send vote", payload => dbcall.sendvote(r, conn, payload))
  socket.on("Show vote", () => socket.emit("Vote options", result))
  socket.on('request user pokes', username => sendUserPokes(username))
  socket.on('validate fc', username =>  dbcall.validatefc(r, conn, username))
  socket.on('followed', person => socket.emit('new follower', person))
  socket.on('won raffle', person => database.rafflewinner(conn, person))
  socket.on('clear raffle', ()  => dbcall.clearraffle())
  socket.on('send raffle', needupdate => sendRaffleUpdate(needupdate))
  socket.on('send emote', payload => io.emit('receive emote', payload))
  socket.on('update leaderboard', entry => dbcall.updateleaderboard(r, conn, entry))
  socket.on('create new player', payload => socket.emit('receive new player', payload))
  socket.on('clear leaderboard', () => dbcall.clearleaderboard(r, conn))
  socket.on ("Ask for pokedex", function(){ socket.emit("Receive pokedex", expressServer.cache.pokedex) }) //replace with Ask for table
  socket.on ("Ask for typechart", function(){ socket.emit("Receive typechart", expressServer.cache.typechart) })//replace with Ask for table
  socket.on ("Ask for table", async function(dbname) { socket.emit("receive " + await dbname.toLowerCase(), expressServer.cached[dbname]) })
  socket.on("update vote", async function(){ io.emit('receive vote', await dbcall.gettable(r, conn, 'Vote')) })
  socket.on('Request vote', async function(){ io.emit('receive vote', await dbcall.gettable(r, conn, 'Vote')) })
  socket.on('request user fc', async function(username) { socket.emit('user fc', await dbcall.getfc(r, conn, username.toLowerCase())) })
  socket.on('request avatar', async function(channel, user, message, self) { socket.emit('receive avatar', channel, user, message, self, await dbcall.getavatar(r, conn, user.username.toLowerCase())) })
  socket.on('request badge', async function(user) { socket.emit('receive badge', username, await dbcall.getbadge(user.username.toLowerCase())) })
  socket.on('manually enter raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, true, await dbcall.manuallyenterraffle(r, conn, username, displayicon)) })
  socket.on('manually leave raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, false, await dbcall.manuallyenterraffle(r, conn, username, displayicon)) })
  socket.on('send leaderboard', async function(){ io.emit('receive leaderboard', await dbcall.gettable(r, conn, 'Leaderboard')) })

  socket.on ("Insert pokedex", async function(payload){  //all these need to be a single socket call like Ask for table
    console.log(payload["id"],payload["Pokemon"])
    let result = await dbcall.put(r, conn, 'Pokedex', payload)
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ability", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put(r, conn, 'Abilities', payload)
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert move", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put(r, conn, 'Moves', payload)
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert bttv", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put(r, conn, 'Bttv', payload)
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ffz", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put(r, conn, 'Ffz', payload)
    console.log(JSON.stringify(result, null, 2))
  })

  async function sendUserPokes (username) { io.emit('user pokes', await dbcall.senduserpokes(username)) }

  async function sendRaffleUpdate(updated){
    let current = await dbcall.sendraffleupdate(r, conn)
    io.emit('receive raffle', current)
    if (updated) io.emit('raffle update', current)
  }

  async function createanewuser(payload) {
    let starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88]
    // if (payload.id != '' && payload.id != undefined && payload.pokevalues[0] > 0 && payload.pokevalues[1] > 0 && payload.pokevalues[2] > 0 && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
    if (payload.id != '' && payload.id != undefined && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
      // payload.id = payload.id.split(' ')[0]
      payload.id = payload.id.trim()
      io.emit('someone signed up', await dbcall.createanewuser(r, conn, payload, starter[Math.floor(Math.random()*starter.length)]))
    } else console.log('user not created, there was missing information')
  }
}
