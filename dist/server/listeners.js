module.exports = function(expressServer) {
  server = expressServer.server
  r = expressServer.database
  conn = expressServer.connection
  cached = expressServer.cache
  io = expressServer.io
  socket = expressServer.socket
  dbcall = expressServer.dbcall

    socket.on('disconnect', function(){
      console.log('user disconnected', socket.id)
    })
    socket.on('request to connect', function(msg){
      // if (msg.id != '' && msg.id != undefined && msg.pokevalues[0] > 0 && msg.pokevalues[1] > 0 && msg.pokevalues[2] > 0) {
      if (msg.id != '' && msg.id != undefined) {
        console.log('user: ' + msg.id, 'connecting...')
        r.table('Users').filter(r.row('id').eq(msg.id.toLowerCase()))
        .run(conn, function(err, cursor) {
          if (err) createanewuser(msg)
          else cursor.toArray(function(err, result) {
            if (err || result[0] == undefined || result == []) createanewuser(msg)
            else {
              // if (result[0].pokevalues[0] == msg.pokevalues[0] && result[0].pokevalues[1] == msg.pokevalues[1] && result[0].pokevalues[2] == msg.pokevalues[2]) {
                socket.emit('login accepted',result[0])
              // }
              // else socket.emit('wrong password')
            }
          })
        })
      } else {
        socket.emit('user not found')
        console.log('undefined value sent', msg)
      }
    })

    // socket.on('log chat', function(payload){
    //  fs.appendFile('public/chatlog.html', '<li>'  + payload + '<li>\n', (err) => {
    //    if (err) console.log(err)
    //  })
    // })

    function createanewuser(payload) {
      var starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88]
      // if (payload.id != '' && payload.id != undefined && payload.pokevalues[0] > 0 && payload.pokevalues[1] > 0 && payload.pokevalues[2] > 0 && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
      if (payload.id != '' && payload.id != undefined && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
        // payload.id = payload.id.split(' ')[0]
        payload.id = payload.id.trim()
        r.table('Users').insert(payload).run(conn, function(err, result) {
          if (err) throw err
          if (result.errors) console.log(result.first_error)
          else {
            firstcard = starter[Math.floor(Math.random()*starter.length)]
            r.table('Users').get(payload.id).update({
              validated: false,
              cards: [{'poke': fir, 'level': 1}],
              active: "default",
              avatar: -1,
              teams: {
                  "default": [
                      0 ,
                      1 ,
                      2 ,
                      3 ,
                      4 ,
                      5
                  ]}
            }).run(conn, function(err, result) {
              if (err) throw err
              if (result.errors) console.log(result.first_error)
              // else socket.emit('login accepted', result[0])
            })
            io.emit('someone signed up',payload.id)
            database.raffleChangeUser(conn, payload.id.toLowerCase(), 12, true, firstcard, "default", [
                      0 ,
                      1 ,
                      2 ,
                      3 ,
                      4 ,
                      5
                  ])
            // socket.broadcast.emit('someone signed up',payload.id)
          }
        })
      } else console.log('user not created, there was missing information')
    }

    socket.on('new user', function(payload){
      r.table('Users').get(payload.id.toLowerCase())
      .run(conn, function(err, cursor) {
        if (!cursor || err) createanewuser(payload)
        else {
          r.table('Users').get(payload.id).update({
            ign: payload.ign,
            fc: payload.fc
          }).run(conn, function(err, result) {
            if (err) throw err
            if (result.errors) console.log(result.first_error)
          })
        }
      })
    })

    socket.on ("Ask for pokedex", function(){ socket.emit("Receive pokedex", expressServer.cache.pokedex) }) //replace with Ask for table

    socket.on ("Ask for typechart", function(){ socket.emit("Receive typechart", expressServer.cache.typechart) })//replace with Ask for table

    socket.on ("Ask for table", (dbname) => socket.emit("receive " + dbname.toLowerCase(), expressServer.cached[dbname]))

    socket.on ("Insert pokedex", async function(payload){  //all these need to be a single socket call like Ask for table
      console.log(payload["id"],payload["Pokemon"])
      let result = expressServer.dbcall.put(r, conn, 'Pokedex', payload)
      console.log(JSON.stringify(result, null, 2))
    })

    socket.on ("Insert ability", function(payload){//all these need to be a single socket call like Ask for table
      let result = expressServer.dbcall.put(r, conn, 'Abilities', payload)
      console.log(JSON.stringify(result, null, 2))
    })

    socket.on ("Insert move", function(payload){//all these need to be a single socket call like Ask for table
      let result = expressServer.dbcall.put(r, conn, 'Moves', payload)
      console.log(JSON.stringify(result, null, 2))
    })

    socket.on ("Insert bttv", function(payload){//all these need to be a single socket call like Ask for table
      let result = expressServer.dbcall.put(r, conn, 'Bttv', payload)
      console.log(JSON.stringify(result, null, 2))
    })

    socket.on ("Insert ffz", function(payload){//all these need to be a single socket call like Ask for table
      let result = expressServer.dbcall.put(r, conn, 'Ffz', payload)
      console.log(JSON.stringify(result, null, 2))
    })

    socket.on("pokemon cry", function(poke){ io.emit("playsound", ('000' + poke).substr(-3)) })

    socket.on("update vote", async function(){ io.emit('receive vote', await expressServer.dbcall.gettable(r, conn, 'Vote')) })

    socket.on("Vote poll", payload => expressServer.dbcall.votepoll(r, conn, payload))

    socket.on("Send vote", payload => expressServer.dbcall.sendvote(r, conn, payload))

    socket.on("Show vote", () => socket.emit("Vote options", result))

    socket.on("send fusion", (firstpoke, secondpoke) => io.emit('show fusion', firstpoke, secondpoke))

    socket.on('Request vote', async function(){ io.emit('receive vote', await expressServer.dbcall.gettable(r, conn, 'Vote')) })

    socket.on('request user fc', async function(username) { socket.emit('user fc', await dbcall.getfc(r, conn, username.toLowerCase())) })

    socket.on('request avatar', async function(channel, user, message, self) { socket.emit('receive avatar', channel, user, message, self, await dbcall.getavatar(r, conn, user.username.toLowerCase())) })

    socket.on('request badge', async function(user) { socket.emit('receive badge', username, await dbcall.getbadge(user.username.toLowerCase())) })

    socket.on('update avatar', (username, newavatar)  => expressServer.dbcall.updateavatar(r, conn, username, newavatar))

    socket.on('update badge', (username, newbadge) => expressServer.dbcall.updatebadge(r, conn, username, newbadge))

    socket.on('request user pokes', function(username) { sendUserPokes(username) })

    // socket.on('request unvalidated', function() {
    //   r.table('Users')
    //   .filter({validated: false})
    //   .run(conn, function(err, cursor) {
    //     cursor.toArray(function(err, result) {
    //       if (err || result[0] == undefined || result == []) console.log('user not found')
    //       else {
    //         socket.emit('unvalidated users', result)
    //       }
    //     })
    //   })
    // })

    socket.on('set current team', (name, payload) =>  expressServer.dbcall.setcurrentteam(r, conn, name, payload))

    socket.on('save user pokes', (name, payload) =>  expressServer.dbcall.saveuserpokes(r, conn, name, payload))

    socket.on('validate fc', (username) =>  expressServer.dbcall.validatefc(r, conn, username))

    socket.on('followed', function(person) { socket.emit('new follower', person) })

    socket.on('metaphone', function(meta, message) { socket.emit('texttopika', meta, message) })

    socket.on('won raffle', function(person) { database.rafflewinner(conn, person) })

    socket.on('manually enter raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, true, await expressServer.dbcall.manuallyenterraffle(r, conn, username, displayicon)) })

    socket.on('manually leave raffle', async function(username, displayicon) { database.raffleChangeUser(conn, username.toLowerCase(), 12, false, await expressServer.dbcall.manuallyenterraffle(r, conn, username, displayicon)) })

    socket.on('enter raffle', function(username, displayicon, team_name, team) { database.raffleChangeUser(conn, username.toLowerCase(), 12, true, displayicon, team_name, team) })

    socket.on('leave raffle', function(username, displayicon, team_name) { database.raffleChangeUser(conn, username.toLowerCase(), 12, false, displayicon, '', [0]) })

    socket.on('clear raffle', ()  => expressServer.dbcall.clearraffle())

    socket.on('send raffle', function(needupdate) { sendRaffleUpdate(needupdate) })

    socket.on('send emote', function(payload) {
      io.emit('receive emote', payload)
      // socket.broadcast.emit('receive emote', payload)
      socket.emit('receive emote', payload)
    })

    socket.on('update leaderboard', entry => expressServer.dbcall.updateleaderboard(r, conn, entry))

    socket.on('create new player', function(payload) { socket.emit('receive new player', payload) })


    socket.on('send leaderboard', async function(){ io.emit('receive leaderboard', await expressServer.dbcall.gettable(r, conn, 'Leaderboard')) })

    socket.on('clear leaderboard', () => expressServer.dbcall.clearleaderboard(r, conn))

  function sendUserPokes (username) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .without('pokevalues')
    .getField('active')
    .run(conn, function(err, active) {
      if (err || active[0] == undefined || active == [] || active == -1) io.emit('no user active team found')
      else if (result) {
        r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
        .without('pokevalues')
        .getField('teams')
        .run(conn, function(err, cursor) {
          cursor.toArray(function(err, result) {
            if (err || result[0] == undefined || result == []) io.emit('user not found')
            else {
              io.emit('user pokes', {user: username, name: active, team: result[0][active]})
            }
          })
        })
      }
    })
  }



  function sendRaffleUpdate(updated){
    var current = []
    r.db('Users').table('Raffle')
      .run(conn, function(err, cursor) {
        cursor.toArray(function(err, result) {
          if (err) console.log('error not found')
          else {
            if (result[0] == undefined || result == []) current = []
            else current = result
            io.emit('receive raffle', current)
            if (updated) io.emit('raffle update', current)
          }
        })
      })
  }

}