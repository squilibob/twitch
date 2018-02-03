module.exports = function(io, socket) {

  socket.on('chatbot', function(Twitch) {
    chatqueue[Twitch.id].socket = socket
    chatqueue[Twitch.id].release()
    chatqueue[Twitch.id].store('ffz', Ffz)
    chatqueue[Twitch.id].store('bttv', Bttv)
  })

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
  socket.on("pokemon cry", poke => io.emit("playsound", ('000' + poke).substr(-3))) // use .padStart for this? poke.padStart(3, '0')
  socket.on("Vote poll", payload => dbcall.votepoll('Users', payload))
  socket.on("Send vote", payload => dbcall.sendvote('Users', payload))
  socket.on('request user pokes', username => sendUserPokes(username))
  socket.on('validate fc', username =>  dbcall.validatefc('Users', username))
  // socket.on('followed', person => socket.emit('new follower', person))
  socket.on('clear raffle', ()  => dbcall.clearraffle('Users'))
  socket.on('send emote', payload => io.emit('receive emote', payload))
  socket.on('update leaderboard', entry => dbcall.updateleaderboard('Users', entry))
  socket.on('clear leaderboard', () => dbcall.clearleaderboard('Users'))
  // socket.on('manually enter raffle', username => dbcall.manualraffle(username, true))
  // socket.on('manually leave raffle', username => dbcall.manualraffle(username, true))
  socket.on("Show vote", async function(){ socket.emit("Vote options", await dbcall.showvote()).catch(console.log) })
  socket.on('send raffle',  async function(db, raffle) {await dbcall.gettable(db, raffle)
    .then(list => list.forEach(user => io.emit('raffle update', user)))
    .catch(console.log)})
  socket.on('won raffle', async function(person){ await dbcall.rafflewinner('Users', person).catch(console.log) })
  socket.on('Ask for pokedex',  async function(simple){ io.emit('Receive pokedex', await dbcall.gettable('Users', 'Pokedex').then(dex => dex.sort((a, b) => a.id - b.id)).catch(console.log)) })
  socket.on("update vote", async function(){ io.emit('receive vote', await dbcall.gettable('Users', 'Vote').catch(console.log)) })
  socket.on('Request vote', async function(){ io.emit('receive vote', await dbcall.gettable('Users', 'Vote').catch(console.log)) })
  socket.on('request user fc', async function(username) { socket.emit('user fc', await dbcall.getfc('Users', username.toLowerCase()).catch(console.log)) })
  // socket.on('request avatar', async function(channel, user, message, self) { socket.emit('receive avatar', channel, user, message, self, await dbcall.getavatar('Users', user.username.toLowerCase()).catch(console.log)) })
  // socket.on('request badge', async function(user) { socket.emit('receive badge', username, await dbcall.getbadge('Users', user.username.toLowerCase()).catch(console.log)) })
  socket.on('send leaderboard', async function(){ io.emit('receive leaderboard', await dbcall.gettable('Users', 'Leaderboard')).catch(console.log) })

  async function sendUserPokes (username) { io.emit('user pokes', await dbcall.senduserpokes('Users', username).catch(console.log)) }

}

  // socket.on('request to connect', async function(msg){
  //   if (msg.id != '' && msg.id != undefined) {
  //     console.log('user: ' + msg.id, 'connecting...')
  //     let connected = await dbcall.requesttoconnect('Users', msg.id.toLowerCase()).catch(console.log)
  //     if (!connected) {
  //       createanewuser(msg)
  //     } else {
  //       socket.emit('login accepted', connected)
  //     }
  //   } else {
  //     console.log('undefined value sent', msg)
  //   }
  // })
  // socket.on('log chat', function(payload){
  //  fs.appendFile('public/chatlog.html', '<li>'  + payload + '<li>\n', (err) => {
  //    if (err) console.log(err)
  //  })
  // })

    // expressServer.database.table('Vote')
  //   .changes()
  //   .run(expressServer.connection)
  //   .then(result => sendVoteUpdate())
  //   .catch(console.log)
