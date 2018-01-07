const unwrap = cursor => cursor.toArray().then(cursor => cursor.length ? cursor.shift() : null)

exports.put = (database, table, payload) => r.db(database).table(table)
    .get(payload.id.toLowerCase())
    .replace(payload)
    .run(conn)

exports.gettable = (database, dbname) => r.db(database).table(dbname)
    .run(conn)
    .then(cursor => cursor.toArray())

exports.getfc = (database, username) => r.db(database).table('Users')
    .filter(r.row('id').eq(username.toLowerCase()))
    .pluck('id', 'fc', 'ign')
    .run(conn)
    .then(unwrap)

exports.getavatar = (database, username) => r.db(database).table('Users').filter(r.row('id').eq(username))
    .getField('avatar')
    .run(conn)
    .then(unwrap)

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

exports.getbadge = (database, username) => r.db(database).table('Users').filter(r.row('id').eq(username.toLowerCase()))
    .getField('badge')
    .run(conn)
    .then(unwrap)

exports.votepoll = function(database, payload) {
  r.db(database).table('Vote')
  .get('system')
  .replace({id: 'system', options: payload.options, title: payload.title})
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

exports.showvote = (database) => r.db(database).table('Vote')
    .get('system')
    .then(cursor => cursor.toArray())

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

exports.userexists = (database, username) => r.db(database).table('Users')
    .get(username.toLowerCase())
    .run(conn)
    .then(cursor => !!cursor)

exports.updateuser = function(database, payload) {
  r.db(database).table('Users')
  .get(payload.id.toLowerCase())
  .update({
    ign: payload.ign,
    fc: payload.fc
  })
  .run(conn)
  .catch(err => console.log(err))
}

function startingcard() {
  // let starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88]
  let starter = [191, 298, 401, 10, 13, 265, 280, 129, 349, 664, 11, 14, 172, 266, 268, 174, 194, 236, 665, 161, 173, 261, 270, 273, 440, 412]
  return starter[~~(Math.random()*starter.length)]
}

exports.createuser = function(database, payload) {
  r.db(database).table('Users')
  .insert({
    id: payload.id,
    ign: payload.ign,
    fc: payload.fc,
    avatar: -1,
    validated: false,
    cards: [{'poke': startingcard, 'level': 1}],
    active: 0,
    teams: [{"default": [0, 1, 2, 3, 4, 5]}]
  }, {conflict: 'error'})
  .run(conn)
  .catch(error => console.log(error))
}

exports.setcurrentteam = function(database, name, teamnumber) {
  r.db(database).table('Users')
  .get(name.toLowerCase())
  .replace(function(row) {
      return row
        .without("active")
        .merge({
          "active": teamnumber
        })
   })
  .run(conn)
  .catch(error => reject(error))
}

exports.getcurrentteam = (database, username) => r.db(database).table('Users')
    .filter(r.row('id').eq(username.toLowerCase()))
    .without('pokevalues')
    .run(conn)
    .then(cursor => cursor.toArray())
    .then(result => result.teams[+result.active])

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

exports.subscribetoraffle = function(Twitch) {
  r.table(Twitch.raffle)
    .changes({includeInitial: true})
    .run(conn)
    .then(stream => stream.each((err, cursor) => getrafflechanges(cursor).id && chatqueue[Twitch.id].store('raffle update', getrafflechanges(cursor))))
    .catch(err => console.log(err))
}

function getrafflechanges(cursor) {
  let newval = cursor.new_val
  let oldval = cursor.old_val
  if (!!newval) return {id:newval.id, entered:newval.entered, chance: newval.chance, displayicon: newval.displayicon, winner: newval.winner}
  if (!!oldval) return {id: oldval.id, entered: oldval.entered, chance: oldval.chance, displayicon: oldval.displayicon, winner: oldval.winner}
  return {id: false, entered: false, chance: 0, displayicon: 1}
}

exports.clearraffle = function(database) {
  r.db(database)
  .table('Raffle')
  .delete()
  .run(conn)
  .catch(error => reject(error))
}

exports.modifyRaffleUser = function(database, username, entered) {
  r.db(database).table('Raffle')
  .get(username.toLowerCase())
  .replace(function(row) {
      return row
        .without("entered")
        .merge({
          "entered": entered
        })
   })
  .run(conn)
  .catch(error => reject(error))
}

exports.raffleUserExists = (database, username) => r.db(database).table('Raffle')
    .get(username.toLowerCase())
    .run(conn)
    .then(cursor => !!cursor)

exports.newRaffleUser = function(database, username, displayicon) {
  r.db(database).table('Users')
  .insert({
    id: username.toLowerCase(),
    chance: 12,
    entered: true,
    displayicon: displayicon
  }, {conflict: 'update'})
  .run(conn)
  .catch(err => console.log(err))
}

exports.rafflewinner = async function(database, username){
  await r.db(database).table('Raffle')
  .filter(r.row.hasFields('entered'))
  .filter(r.row('entered').eq(true))
  .update({ winner: false, chance: r.row("chance").mul(2).default(1) })
  .run(conn)
  .catch(err => console.log(err))

  await r.db(database).table('Raffle')
  .filter(r.row('id').eq(username.toLowerCase()))
  .update({ winner: true, chance: 1, entered: false })
  .run(conn)
  .catch(err => console.log(err))

  return await exports.getfc(username)
}
