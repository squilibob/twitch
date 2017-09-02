  exports.raffleChangeUser = function(r, conn, username, defaultchance, entered, displayicon){
    r.db('Users').table('Raffle').get(username)
    .run(conn, function(err, result) {
      if (err) throw err
      if (result) {
        if (result.errors) console.log(result.first_error)
        else modifyRaffleUser(conn, username, result.chance, entered, displayicon)
      }
      else {
        modifyRaffleUser(conn, username, defaultchance, entered, displayicon)
      }
    })
  }

  exports.rafflewinner = function(r, conn, username){
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

  exports.modifyRaffleUser = function(r, conn, username, chance, entered, displayicon) {
  r.db('Users').table('Raffle').get(username).replace({
    id: username,
    chance: chance,
    entered: entered,
    displayicon:displayicon,
  })
  .run(conn, function(err, result) {
    if (err) throw err
    if (result.errors) console.log(result.first_error)
  })
  }

exports.getfc = function(r, conn, username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
      .pluck('id', 'fc', 'ign')
      .run(conn)
      .then(cursor => cursor.toArray())
      .then(result => { resolve(result[0]) })
      .catch(error => reject(error))
  })
}

exports.getavatar = function(r, conn, username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username))
    .getField('avatar')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { (result[0] == undefined || result == []) ? resolve(-1) : resolve(result[0]) })
    .catch(error => reject(error))
  })
}

exports.getbadge = function(r, conn, username) {
  return new Promise(function(resolve, reject) {
    r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .getField('badge')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result[0]) })
    .catch(error => reject(error))
  })
}

// exports.getpokedex = function(r, conn) {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('Pokedex')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }

// exports.gettypechart = function(r, conn) {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('TypeChart')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }
exports.votepoll = function(r, conn, payload) {
  r.table('Vote')
  .get('system')
  .replace({id: 'system', options: payload.options, title: payload.title})
  .run(conn)
  .catch(error => reject(error))
}

exports.put = function(r, conn, table, payload) {
  return new Promise(function(resolve, reject) {
    r.table('table')
    .get(payload["id"])
    .replace(payload)
    .run(conn)
    .then(result => resolve(result))
    .catch(error => reject(error))
  })
}

exports.gettable = function(r, conn, dbname) {
  return new Promise(function(resolve, reject) {
    r.db('Users').table(dbname)
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
    })
}

exports.updateleaderboard = function(r, conn, entry) {
  r.db('Users').table('Leaderboard')
  .get(entry.id)
  .replace(entry)
  .run(conn)
  .catch(error => reject(error))
}

exports.clearleaderboard = function(r, conn) {
  r.db('Users').table('Leaderboard')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}

exports.sendvote = function(r, conn, payload) {
  r.table('Vote')
  .get(payload.id)
  .replace({id: payload.id, vote: payload.vote})
  .run(conn)
  .catch(error => reject(error))
}

exports.showvote = function(r, conn, payload) {
  return new Promise(function(resolve, reject) {
    r.table('Vote')
    .get('system')
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
  })
}
exports.updateavatar = function(r, conn, username, newavatar) {
  r.table('Users')
  .get(username.toLowerCase())
  .update({"avatar": newavatar})
  .run(conn)
  .catch(error => reject(error))
}

exports.updatebadge = function(r, conn, username, newbadge) {
  r.table('Users')
  .get(username.toLowerCase())
  .update({"badge": newbadge})
  .run(conn)
  .catch(error => reject(error))
}

exports.setcurrentteam = function(r, conn, name, payload) {
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

exports.saveuserpokes = function(r, conn, name, payload) {
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

exports.validatefc = function(r, conn, username) {
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

exports.manuallyenterraffle = function(r, conn, username, displayicon) {
  return new Promise(function(resolve, reject) {
    r.table('Users')
    .get(username)
    .run(conn)
    .then(result => { resolve(result.cards[0].poke) })
    .catch(error => reject(error))
  })
}
// exports.getavatar = function(r, conn, username) {
//   return new Promise(function(resolve, reject) {
//   })
// }

