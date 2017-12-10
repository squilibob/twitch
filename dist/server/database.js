  exports.raffleChangeUser = function(database, username, defaultchance, entered, displayicon){
    r.db(database).table('Raffle').get(username)
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

  exports.rafflewinner = function(database, username){
    r.db(database).table('Raffle').get(username)
    .run(conn, function(err, result) {
      if (err) throw err
      if (result) {
        if (result.errors) console.log(result.first_error)
        else {
          sendUserPokes (result.id)
          r.db(database).table('Raffle').get(result.id).update({id: result.id, chance: 1, entered: false, displayicon: result.displayicon, winner: true})
          .run(conn, function(err, result) {
            if (err) throw err
            if (result.errors) console.log(result.first_error)
            r.db(database).table('Raffle').filter(r.row('id').ne(username))
            .run(conn, function(err, cursor) {
              cursor.toArray(function(err, result) {
                for (loser in result){
                  if (result[loser].entered)
                    r.db(database).table('Raffle').get(result[loser].id).update({winner: false, chance: result[loser].chance*2}).run(conn, function(err, temp) {
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

  exports.modifyRaffleUser = function(database, username, chance, entered, displayicon) {
  r.db(database).table('Raffle').get(username)
    .replace({
      id: username,
      chance: chance,
      entered: entered,
      displayicon:displayicon,
    })
    .run(conn)
    .catch(error => reject(error))
}

exports.manualraffle = function(database, username, enter) {
  r.db(database).table('Users')
  .get(username)
  .run(conn)
  .then(result => { exports.raffleChangeUser(username.toLowerCase(), 12, enter, result.cards[0].poke) })
  .catch(error => reject(error))
}

exports.getfc = function(database, username) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Users').filter(r.row('id').eq(username.toLowerCase()))
      .pluck('id', 'fc', 'ign')
      .run(conn)
      .then(cursor => cursor.toArray())
      .then(result => { resolve(result ? result[0] : null) })
      .catch(error => reject(error))
  })
}

exports.getavatar = function(database, username) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Users').filter(r.row('id').eq(username))
    .getField('avatar')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { (result[0] == undefined || result == []) ? resolve(-1) : resolve(result[0]) })
    .catch(error => reject(error))
  })
}

exports.getbadge = function(database, username) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .getField('badge')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result ? result[0] : null) })
    .catch(error => reject(error))
  })
}

// exports.getpokedex = function(database, ) {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('Pokedex')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }

// exports.gettypechart = function(database, ) {
//   return new Promise(function(resolve, reject) {
//     r.db('Users').table('TypeChart')
//     .run(conn)
//     .then(cursor => cursor.toArray())
//     .then(result => { resolve(result) })
//     .catch(error => reject(error))
//   })
// }
exports.votepoll = function(database, payload) {
  r.db(database).table('Vote')
  .get('system')
  .replace({id: 'system', options: payload.options, title: payload.title})
  .run(conn)
  .catch(error => reject(error))
}

exports.put = function(database, table, payload) {
  return new Promise(function(resolve, reject) {
    r.db(database).table(table)
    .get(payload["id"])
    .replace(payload)
    .run(conn)
    .then(result => resolve(result))
    .catch(error => reject(error))
  })
}

exports.gettable = function(database, dbname) {
  return new Promise(function(resolve, reject) {
    r.db(database).table(dbname)
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
    })
}

exports.updateleaderboard = function(database, entry) {
  r.db(database).table('Leaderboard')
  .get(entry.id)
  .replace(entry)
  .run(conn)
  .catch(error => reject(error))
}

exports.clearleaderboard = function(database) {
  r.db(database).table('Leaderboard')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}

exports.sendvote = function(database, payload) {
  r.db(database).table('Vote')
  .get(payload.id)
  .replace({id: payload.id, vote: payload.vote})
  .run(conn)
  .catch(error => reject(error))
}

exports.showvote = function(database) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Vote')
    .get('system')
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result) })
    .catch(error => reject(error))
  })
}
exports.updateavatar = function(database, username, newavatar) {
  r.db(database).table('Users')
  .get(username.toLowerCase())
  .update({"avatar": newavatar})
  .run(conn)
  .catch(error => reject(error))
}

exports.updatebadge = function(database, username, newbadge) {
  r.db(database).table('Users')
  .get(username.toLowerCase())
  .update({"badge": newbadge})
  .run(conn)
  .catch(error => reject(error))
}

exports.setcurrentteam = function(database, name, payload) {
  r.db(database).table('Users')
  .get(name.toLowerCase())
  .replace(function(row) {
      return row
        .without("active")
        .merge({
          "active": payload
        })
   })
  .run(conn)
  .catch(error => reject(error))
}

exports.saveuserpokes = function(database, name, payload) {
    r.db(database).table('Users')
    .get(name.toLowerCase())
    .replace(function(row) {
        return row
          .without("teams")
          .merge({
            "teams": payload
          })
       })
  .run(conn)
  .catch(error => reject(error))
 }

exports.validatefc = function(database, username) {
  let starter = [191, 298, 401, 010, 013, 265, 280, 129, 349, 664, 011, 014, 172, 266, 268, 174, 194, 236, 665, 161, 173, 261, 270, 273, 440, 412]
  r.db(database).table('Users')
  .get(username)
  .update({cards: [{'poke': starter[Math.floor(Math.random()*starter.length)], 'level': 1}], validated: true})
  .run(conn)
  .catch(error => reject(error))
}

exports.senduserpokes = function(database, username) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .without('pokevalues')
    .getField('active')
    .run(conn)
    .then(active => {
      if (err || active[0] == undefined || active == [] || active == -1) reject(err ? err : active)
      else {
        r.db(database).table('Users').filter(r.row('id').eq(username.toLowerCase()))
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

exports.newuser = function(database, payload) {
  r.db(database).table('Users').get(payload.id.toLowerCase())
  .run(conn, function(err, cursor) {
    if (!cursor || err) createanewuser(payload)
    else {
      r.db(database).table('Users').get(payload.id).update({
        ign: payload.ign,
        fc: payload.fc
      }).run(conn, function(err, result) {
        if (err) throw err
        if (result.errors) console.log(result.first_error)
      })
    }
  })
}

exports.createanewuser = function(database, payload, firstcard) { //wtf fix this
  // return new Promise(function(resolve, reject) {
  //       r.db(database).table('Users')
  //       .insert(payload)
  //       .run(conn, function(database, err, result) {
  //         if (err) throw err
  //         if (result.errors) console.log(result.first_error)
  //         else {
  //           r.db(database).table('Users').get(payload.id).update({
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
  //           }).run(conn, function(database, err, result) {
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

exports.newuser = function(database, payload) {
    r.db(database).table('Users').get(payload.id.toLowerCase())
    .run(conn, function(err, cursor) {
      if (!cursor || err) createanewuser(payload) //////////////fix
      else {
        r.db(database).table('Users').get(payload.id.toLowerCase()).update({
          ign: payload.ign,
          fc: payload.fc
        }).run(conn, function(err, result) {
          if (err) throw err
          if (result.errors) console.log(result.first_error)
        })
      }
    })
}

exports.requesttoconnect = function(database, username) {
  return new Promise(function(resolve, reject) {
    r.db(database).table('Users').filter(r.row('id').eq(username))
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result[0]) })
    .catch(error => reject(error))
  })
}

exports.subscribetoraffle = function(Twitch) {
  r.table(Twitch.raffle)
    .changes()
    .run(conn, (err, stream) => stream.each((err, cursor) => getrafflechanges(cursor).user && chatqueue[Twitch.id].store('raffle update', getrafflechanges(cursor))))
    .catch(err => console.log(err))
}

function getrafflechanges(cursor) {
  let oldval = cursor.old_val
  let newval = cursor.new_val
  console.log('cursor', cursor)
  if (!!oldval) return {id: oldval.id, entered: oldval.entered && !!newval, chance: oldval.chance, displayicon: oldval.displayicon}
  if (!!newval) return {id:newval.id, entered:newval.entered, chance: newval.chance, displayicon: newval.displayicon}
  return {id: null, entered: false, chance: 0, displayicon: 1}
}
  // async function sendRaffleUpdate(Twitch, needupdate){
  //   let current = await dbcall.sendraffleupdate('Users', Twitch.raffle).catch(err => console.log(err))
  //   let justentered = []
  //   let updated = {}
  //   for (person in current) {
  //     if (participants[current[person].id] == undefined && current[person].entered) {
  //       justentered.push(current[person].id)
  //       updated[current[person].id] = current[person].chance
  //     } else if (current[person].entered) {
  //       updated[current[person].id] = current[person].chance
  //     }
  //   }
  //   participants = updated
  //   io.emit('receive raffle', current)
  //   if (needupdate) io.emit('raffle update', {raffle: current, new: justentered})
  // }

exports.sendraffleupdate = function(database, table) {
  return new Promise(function(resolve, reject) {
    r.db(database).table(table)
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => { resolve(result || {}) })
    .catch(error => reject(error))
  })
}

exports.clearraffle = function(database) {
  r.db(database)
  .table('Raffle')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}
