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

exports.gettable = function(r, conn, dbname) {
  return new Promise(function(resolve, reject) {
    r.db('Users').table(dbname)
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
    })
}

// exports.getavatar = function(r, conn, username) {
//   return new Promise(function(resolve, reject) {
//   })
// }

