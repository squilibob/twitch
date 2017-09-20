module.exports = function(io, socket) {

  socket.on('chatbot', function(Twitch) {
    chatqueue[Twitch.id].socket = socket
    chatqueue[Twitch.id].release()
  })

  socket.on('request to connect', async function(msg){
    if (msg.id != '' && msg.id != undefined) {
      console.log('user: ' + msg.id, 'connecting...')
      let connected = await dbcall.requesttoconnect(msg.id.toLowerCase()).catch(err => console.log(err))
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

    // expressServer.database.table('Vote')
  //   .changes()
  //   .run(expressServer.connection)
  //   .then(result => sendVoteUpdate())
  //   .catch(err => console.log(err))

  r.table('Raffle')
    .changes()
    .run(conn)
    .then(result => sendRaffleUpdate(true))
    .catch(err => console.log(err))


  socket.on('disconnect', () => console.log('user disconnected', socket.id))
  socket.on('new user', payload => dbcall.newuser(payload))
  socket.on("send fusion", (firstpoke, secondpoke) => io.emit('show fusion', firstpoke, secondpoke))
  socket.on('update avatar', (username, newavatar)  => dbcall.updateavatar(username, newavatar))
  socket.on('update badge', (username, newbadge) => dbcall.updatebadge(username, newbadge))
  socket.on('set current team', (name, payload) =>  dbcall.setcurrentteam(name, payload))
  socket.on('save user pokes', (name, payload) =>  dbcall.saveuserpokes(name, payload))
  socket.on('metaphone', (meta, message) => socket.emit('texttopika', meta, message))
  socket.on('enter raffle', (username, displayicon, team_name, team) => database.raffleChangeUser(conn, username.toLowerCase(), 12, true, displayicon, team_name, team))
  socket.on('leave raffle', (username, displayicon, team_name) => database.raffleChangeUser(conn, username.toLowerCase(), 12, false, displayicon, '', [0]))
  socket.on("pokemon cry", poke => io.emit("playsound", ('000' + poke).substr(-3)))
  socket.on("Vote poll", payload => dbcall.votepoll(payload))
  socket.on("Send vote", payload => dbcall.sendvote(payload))
  socket.on("Show vote", () => socket.emit("Vote options", result))
  socket.on('request user pokes', username => sendUserPokes(username))
  socket.on('validate fc', username =>  dbcall.validatefc(username))
  socket.on('followed', person => socket.emit('new follower', person))
  socket.on('won raffle', person => database.rafflewinner(conn, person))
  socket.on('clear raffle', ()  => dbcall.clearraffle())
  socket.on('send raffle', needupdate => sendRaffleUpdate(needupdate))
  socket.on('send emote', payload => io.emit('receive emote', payload))
  socket.on('update leaderboard', entry => dbcall.updateleaderboard(entry))
  socket.on('create new player', payload => socket.emit('receive new player', payload))
  socket.on('clear leaderboard', () => dbcall.clearleaderboard())
//  socket.on ("Ask for pokedex", function(){ socket.emit("Receive pokedex", expressServer.pokedex) }) //replace with Ask for table
  // socket.on ("Ask for typechart", function(){ socket.emit("Receive typechart", expressServer.typechart) })//replace with Ask for table
  socket.on("update vote", async function(){ io.emit('receive vote', await dbcall.gettable('Vote').catch(err => console.log(err))) })
  socket.on('Request vote', async function(){ io.emit('receive vote', await dbcall.gettable('Vote').catch(err => console.log(err))) })
  socket.on('request user fc', async function(username) { socket.emit('user fc', await dbcall.getfc(username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('request avatar', async function(channel, user, message, self) { socket.emit('receive avatar', channel, user, message, self, await dbcall.getavatar(user.username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('request badge', async function(user) { socket.emit('receive badge', username, await dbcall.getbadge(user.username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('manually enter raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, true, await dbcall.manuallyenterraffle(username, displayicon).catch(err => console.log(err))) })
  socket.on('manually leave raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, false, await dbcall.manuallyenterraffle(username, displayicon).catch(err => console.log(err))) })
  socket.on('send leaderboard', async function(){ io.emit('receive leaderboard', await dbcall.gettable('Leaderboard')).catch(err => console.log(err)) })

  socket.on ("Insert pokedex", async function(payload){  //all these need to be a single socket call like Ask for table
    console.log(payload["id"],payload["Pokemon"])
    let result = await dbcall.put('Pokedex', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ability", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Abilities', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert move", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Moves', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert bttv", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Bttv', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ffz", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Ffz', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  async function sendUserPokes (username) { io.emit('user pokes', await dbcall.senduserpokes(username).catch(err => console.log(err))) }

  async function sendRaffleUpdate(updated){
    let current = await dbcall.sendraffleupdate().catch(err => console.log(err))
    io.emit('receive raffle', current)
    if (updated) io.emit('raffle update', current)
  }

  async function createanewuser(payload) {
    let starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88]
    // if (payload.id != '' && payload.id != undefined && payload.pokevalues[0] > 0 && payload.pokevalues[1] > 0 && payload.pokevalues[2] > 0 && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
    if (payload.id != '' && payload.id != undefined && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
      // payload.id = payload.id.split(' ')[0]
      payload.id = payload.id.trim()
      io.emit('someone signed up', await dbcall.createanewuser(payload, starter[Math.floor(Math.random()*starter.length)]).catch(err => console.log(err)))
    } else console.log('user not created, there was missing information')
  }
}
