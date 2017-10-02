  exports.raffleChangeUser = function(username, defaultchance, entered, displayicon){
    r.db('Users').table('Raffle').get(username)
    .run(conn, function(err, result) {
      if (err) throw err
      if (result) {
        if (result.errors) console.log(result.first_error)
        else exports.modifyRaffleUser(username, result.chance, entered, displayicon)
      }
      else {
        exports.modifyRaffleUser(username, defaultchance, entered, displayicon)
      }
    })
  }

  exports.rafflewinner = function(username){
    r.db('Users').table('Raffle').get(username)
    .run(conn, function(err, result) {
      if (err) throw err
      if (result) {
        if (result.errors) console.log(result.first_error)
        else {
          sendUserPokes (result.id)
          r.db('Users').table('Raffle').get(result.id).update({id: result.id, chance: 1, entered: false, displayicon: result.displayicon, winner: true})
          .run(conn, function(err, result) {
            if (err) throw err
            if (result.errors) console.log(result.first_error)
            r.db('Users').table('Raffle').filter(r.row('id').ne(username))
            .run(conn, function(err, cursor) {
              cursor.toArray(function(err, result) {
                for (loser in result){
                  if (result[loser].entered)
                    r.db('Users').table('Raffle').get(result[loser].id).update({winner: false, chance: result[loser].chance*2}).run(conn, function(err, temp) {
                    if (err) throw err
                  })
                }
              })
            })
            // sendRaffleUpdate()
          })
        }
      }
    })
  }

  exports.modifyRaffleUser = function(username, chance, entered, displayicon) {
  r.db('Users').table('Raffle').get(username)
    .replace({
      id: username,
      chance: chance,
      entered: entered,
      displayicon:displayicon,
    })
    .run(conn)
    .catch(error => reject(error))
}

exports.manualraffle = function(username, enter) {
  r.table('Users')
  .get(username)
  .run(conn)
  .then(result => { exports.raffleChangeUser(username.toLowerCase(), 12, enter, result.cards[0].poke) })
  .catch(error => reject(error))
}

exports.sendraffleupdate = function() {
  return new Promise(function(resolve, reject) {
    r.db('Users').table('Raffle')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result || {}) })
    .catch(error => reject(error))
  })
}

exports.getfc = function(username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
      .pluck('id', 'fc', 'ign')
      .run(conn)
      .then(cursor => cursor.toArray())
      .then(result => { resolve(result ? result[0] : null) })
      .catch(error => reject(error))
  })
}

exports.getavatar = function(username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username))
    .getField('avatar')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { (result[0] == undefined || result == []) ? resolve(-1) : resolve(result[0]) })
    .catch(error => reject(error))
  })
}

exports.getbadge = function(username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .getField('badge')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result ? result[0] : null) })
    .catch(error => reject(error))
  })
}

// exports.getpokedex = function() {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('Pokedex')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }

// exports.gettypechart = function() {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('TypeChart')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }
exports.votepoll = function(payload) {
  r.table('Vote')
  .get('system')
  .replace({id: 'system', options: payload.options, title: payload.title})
  .run(conn)
  .catch(error => reject(error))
}

exports.put = function(table, payload) {
  return new Promise(function(resolve, reject) {
    r.table('table')
    .get(payload["id"])
    .replace(payload)
    .run(conn)
    .then(result => resolve(result))
    .catch(error => reject(error))
  })
}

exports.gettable = function(dbname) {
  return new Promise(function(resolve, reject) {
    r.db('Users').table(dbname)
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
    })
}

exports.updateleaderboard = function(entry) {
  r.db('Users').table('Leaderboard')
  .get(entry.id)
  .replace(entry)
  .run(conn)
  .catch(error => reject(error))
}

exports.clearleaderboard = function() {
  r.db('Users').table('Leaderboard')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}

exports.sendvote = function(payload) {
  r.table('Vote')
  .get(payload.id)
  .replace({id: payload.id, vote: payload.vote})
  .run(conn)
  .catch(error => reject(error))
}

exports.showvote = function() {
  return new Promise(function(resolve, reject) {
    r.table('Vote')
    .get('system')
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
  })
}
exports.updateavatar = function(username, newavatar) {
  r.table('Users')
  .get(username.toLowerCase())
  .update({"avatar": newavatar})
  .run(conn)
  .catch(error => reject(error))
}

exports.updatebadge = function(username, newbadge) {
  r.table('Users')
  .get(username.toLowerCase())
  .update({"badge": newbadge})
  .run(conn)
  .catch(error => reject(error))
}

exports.setcurrentteam = function(name, payload) {
  r.table('Users')
  .get(name.toLowerCase())
  .replace(function (row) {
      return row
        .without("active")
        .merge({
          "active": payload
        })
   })
  .run(conn)
  .catch(error => reject(error))
}

exports.saveuserpokes = function(name, payload) {
    r.table('Users')
    .get(name.toLowerCase())
    .replace(function (row) {
        return row
          .without("teams")
          .merge({
            "teams": payload
          })
       })
  .run(conn)
  .catch(error => reject(error))
 }

exports.validatefc = function(username) {
  let starter = [191, 298, 401, 010, 013, 265, 280, 129, 349, 664, 011, 014, 172, 266, 268, 174, 194, 236, 665, 161, 173, 261, 270, 273, 440, 412]
  r.table('Users')
  .get(username)
  .update({cards: [{'poke': starter[Math.floor(Math.random()*starter.length)], 'level': 1}], validated: true})
  .run(conn)
  .catch(error => reject(error))
}

exports.clearraffle = function() {
  r.db('Users')
  .table('Raffle')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}

exports.senduserpokes = function(username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .without('pokevalues')
    .getField('active')
    .run(conn)
    .then(active => {
      if (err || active[0] == undefined || active == [] || active == -1) reject(err ? err : active)
      else {
        r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
        .without('pokevalues')
        .getField('teams')
        .run(conn)
        .then(cursor => cursor.toArray())
        .then(result => { resolve({user: username, name: active, team: result[0][active]}) })
      }
    })
    .catch(error => reject(error))
  })
}

exports.newuser = function(payload) {
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
}

exports.createanewuser = function(payload, firstcard) { //wtf fix this
  // return new Promise(function(resolve, reject) {
  //       r.table('Users')
  //       .insert(payload)
  //       .run(conn, function(err, result) {
  //         if (err) throw err
  //         if (result.errors) console.log(result.first_error)
  //         else {
  //           r.table('Users').get(payload.id).update({
  //             validated: false,
  //             cards: [{'poke': firstcard, 'level': 1}],
  //             active: "default",
  //             avatar: -1,
  //             teams: {
  //                 "default": [
  //                     0 ,
  //                     1 ,
  //                     2 ,
  //                     3 ,
  //                     4 ,
  //                     5
  //                 ]}
  //           }).run(conn, function(err, result) {
  //             if (err) throw err
  //             if (result.errors) console.log(result.first_error)
  //             // else socket.emit('login accepted', result[0])
  //           })
  //           exports.raffleChangeUser(payload.id.toLowerCase(), 12, true, firstcard, "default", [
  //                     0 ,
  //                     1 ,
  //                     2 ,
  //                     3 ,
  //                     4 ,
  //                     5
  //                 ])
  //           resolve(payload.id)
  //           // socket.broadcast.emit('someone signed up',payload.id)
  //         }
  //       })
  // })
}

exports.newuser = function(payload) {
    r.table('Users').get(payload.id.toLowerCase())
    .run(conn, function(err, cursor) {
      if (!cursor || err) createanewuser(payload) //////////////fix
      else {
        r.table('Users').get(payload.id.toLowerCase()).update({
          ign: payload.ign,
          fc: payload.fc
        }).run(conn, function(err, result) {
          if (err) throw err
          if (result.errors) console.log(result.first_error)
        })
      }
    })
}


exports.requesttoconnect = function(username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username))
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result[0]) })
    .catch(error => reject(error))
  })
}

