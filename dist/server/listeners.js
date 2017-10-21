module.exports = function(io, socket) {

  socket.on('chatbot', function(Twitch) {
    chatqueue[Twitch.id].socket = socket
    chatqueue[Twitch.id].release()
  })

  socket.on('request to connect', async function(msg){
    if (msg.id != '' && msg.id != undefined) {
      console.log('user: ' + msg.id, 'connecting...')
      let connected = await dbcall.requesttoconnect('Users', msg.id.toLowerCase()).catch(err => console.log(err))
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
  socket.on('new user', payload => dbcall.newuser('Users', payload))
  socket.on("send fusion", (firstpoke, secondpoke) => io.emit('show fusion', firstpoke, secondpoke))
  socket.on('update avatar', (username, newavatar)  => dbcall.updateavatar('Users', username, newavatar))
  socket.on('update badge', (username, newbadge) => dbcall.updatebadge('Users', username, newbadge))
  socket.on('set current team', (name, payload) =>  dbcall.setcurrentteam('Users', name, payload))
  socket.on('save user pokes', (name, payload) =>  dbcall.saveuserpokes('Users', name, payload))
  socket.on('metaphone', (meta, message) => socket.emit('texttopika', meta, message))
  socket.on('enter raffle', (username, displayicon, team_name, team) => dbcall.raffleChangeUser('Users', username.toLowerCase(), 12, true, displayicon))
  socket.on('leave raffle', (username, displayicon, team_name) => dbcall.raffleChangeUser('Users', username.toLowerCase(), 12, false, displayicon))
  socket.on("pokemon cry", poke => io.emit("playsound", ('000' + poke).substr(-3)))
  socket.on("Vote poll", payload => dbcall.votepoll('Users', payload))
  socket.on("Send vote", payload => dbcall.sendvote('Users', payload))
  socket.on("Show vote", () => socket.emit("Vote options", result)) // wtf is this
  socket.on('request user pokes', username => sendUserPokes(username))
  socket.on('validate fc', username =>  dbcall.validatefc('Users', username))
  // socket.on('followed', person => socket.emit('new follower', person))
  socket.on('won raffle', person => dbcall.rafflewinner('Users', person)) // wtf is this
  socket.on('clear raffle', ()  => dbcall.clearraffle('Users'))
  socket.on('send raffle', needupdate => sendRaffleUpdate('Users', needupdate))
  socket.on('send emote', payload => io.emit('receive emote', payload))
  socket.on('update leaderboard', entry => dbcall.updateleaderboard('Users', entry))
  socket.on('create new player', payload => socket.emit('receive new player', payload)) //wtf is this
  socket.on('clear leaderboard', () => dbcall.clearleaderboard('Users'))
  // socket.on('manually enter raffle', username => dbcall.manualraffle(username, true))
  // socket.on('manually leave raffle', username => dbcall.manualraffle(username, true))
  socket.on('Ask for pokedex',  async function(simple){ io.emit('Receive pokedex', await dbcall.gettable('Users', 'Pokedex').catch(err => console.log(err))) })
  socket.on("update vote", async function(){ io.emit('receive vote', await dbcall.gettable('Users', 'Vote').catch(err => console.log(err))) })
  socket.on('Request vote', async function(){ io.emit('receive vote', await dbcall.gettable('Users', 'Vote').catch(err => console.log(err))) })
  socket.on('request user fc', async function(username) { socket.emit('user fc', await dbcall.getfc('Users', username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('request avatar', async function(channel, user, message, self) { socket.emit('receive avatar', channel, user, message, self, await dbcall.getavatar('Users', user.username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('request badge', async function(user) { socket.emit('receive badge', username, await dbcall.getbadge('Users', user.username.toLowerCase()).catch(err => console.log(err))) })
  socket.on('send leaderboard', async function(){ io.emit('receive leaderboard', await dbcall.gettable('Users', 'Leaderboard')).catch(err => console.log(err)) })

  socket.on ("Insert pokedex", async function(payload){  //all these need to be a single socket call like Ask for table
    console.log(payload["id"],payload["Pokemon"])
    let result = await dbcall.put('Users', 'Pokedex', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ability", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Users', 'Abilities', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert move", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Users', 'Moves', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert bttv", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Users', 'Bttv', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  socket.on ("Insert ffz", function(payload){//all these need to be a single socket call like Ask for table
    let result = dbcall.put('Users', 'Ffz', payload).catch(err => console.log(err))
    console.log(JSON.stringify(result, null, 2))
  })

  async function sendUserPokes (username) { io.emit('user pokes', await dbcall.senduserpokes('Users', username).catch(err => console.log(err))) }

  async function sendRaffleUpdate(needupdate){
    let current = await dbcall.sendraffleupdate('Users').catch(err => console.log(err))
    let justentered = []
    let updated = {}
    for (person in current) {
      if (participants[current[person].id] == undefined && current[person].entered) {
        justentered.push(current[person].id)
        updated[current[person].id] = current[person].chance
      } else if (current[person].entered) {
        updated[current[person].id] = current[person].chance
      }
    }
    participants = updated
    io.emit('receive raffle', current)
    if (needupdate) io.emit('raffle update', {raffle: current, new: justentered})
  }

  async function createanewuser(payload) {
    let starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88]
    // if (payload.id != '' && payload.id != undefined && payload.pokevalues[0] > 0 && payload.pokevalues[1] > 0 && payload.pokevalues[2] > 0 && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
    if (payload.id != '' && payload.id != undefined && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
      // payload.id = payload.id.split(' ')[0]
      payload.id = payload.id.trim()
      io.emit('someone signed up', await dbcall.createanewuser('Users', payload, starter[Math.floor(Math.random()*starter.length)]).catch(err => console.log(err)))
    } else console.log('user not created, there was missing information')
  }
}
