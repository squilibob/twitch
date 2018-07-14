const request = require('request')

// exports.bttvapi = function (room) {
//   return new Promise(function(resolve, reject) {
//     let first = 'https://cdn.betterttv.net/emote/56d6fbb4d5d429963e27410c/1x'
//     // request(({ method: 'GET', json: true, url: first}),
//     request(first,
//     (err, res, body) => {
//         err && reject(err)
//         resolve(body)
//     })
//   })
// }
exports.bttvapi = function (room) {
  return new Promise(function(resolve, reject) {
    request(({ method: 'GET', json: true, url: 'https://api.betterttv.net/2/channels/' + room}),
    (err, res, body) => {
      err && reject(err)
      let temp = new Map()
      res.toJSON().statusCode === 200 && body.emotes.forEach(item => temp.set(item.id, item.code))
      res.toJSON().statusCode === 200 ? resolve(temp)
      : reject(res.toJSON().statusCode + ' Error: ' + body.message)
    })
  })
}
exports.ffzapi = function (room) {
  return new Promise(function(resolve, reject) {
    request(({ method: 'GET', json: true, url: 'https://api.frankerfacez.com/v1/room/' + room}),
    (err, res, body) => {
      err && reject(err)
      let temp = new Map()
      res.toJSON().statusCode === 200 && Object.values(body.sets).forEach(set => set.emoticons.forEach(item => temp.set(item.id, item.name)))
      res.toJSON().statusCode === 200 ? resolve(temp)
      : reject(res.toJSON().statusCode + ' Error: ' + body.message)
    })
  })
}
