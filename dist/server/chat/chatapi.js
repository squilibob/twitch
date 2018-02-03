// api call functions
function header (id, endpoint, extraparams, version) {
  let clientOptions = require('./clientoptions')
  if (!version) version = 5
  let paramstring = ''
  if (id) paramstring += '/' + id
  if (endpoint) paramstring += '/' + endpoint
  paramstring += '?'
  if (extraparams) paramstring += extraparams + '&'
  paramstring += 'api_version=' + version
  paramstring += '&client_id=' + clientOptions.options.clientId
  return paramstring
}

function helix(options, Twitch) {
  return new Promise(function(resolve, reject) {
    const rate = 'ratelimit-'
    let apireset = +Twitch.api.reset - +Date.now() / 1000
    if (Twitch.api.remaining < 1 && apireset > 0) {
      // if (!Twitch.queue) Twitch.queue = 0
      // if (Twitch.queue < 0) Twitch.queue = 0
      // if (Twitch.queue < Twitch.api.limit - Twitch.api.remaining) {
      //   Twitch.queue++
      //   console.log(apireset + ' seconds until API limit resets. Queueing: ', Twitch.queue)
      //   setTimeout(() => {
      //     console.log('dequeue ', Twitch.queue)
      //     Twitch.api.remaining++
      //     Twitch.queue--
      //     resolve(helix(options, Twitch))
      //   },  (Twitch.queue * 1000) + apireset * 1000)
      // }
      reject(new Error((+Twitch.api.reset - +Date.now() / 1000) + ' seconds until API limit resets'))
    } else client.api(options, function (err, res, body) {
      if ((res || {}).headers) {
        Object.keys(res.headers)
          .filter(key => key.includes(rate))
          .forEach(key => Twitch.api[key.substr(rate.length)] = res.headers[key])
      }
      err && reject(err)
      resolve((((body || {}).data || {}).length) ? body.data.shift() : null)
    })
  })
}

exports.checkAvatar = function(id, Twitch) {
  return helix({
    url: 'https://api.twitch.tv/helix/users?id=' + id,
    headers: {
        "Client-ID":  Twitch.clientOptions.options.clientId
    }
  }, Twitch)
  .then(data => data.profile_image_url ? data.profile_image_url : null)
  .catch(data => null)
  .then(data => !!data && !data.includes('user-default-pictures') ? data : 1 + ~~(Math.random()*48))
  .catch(console.log)
}

exports.getName = function(id, Twitch) {
  return helix({
    url: 'https://api.twitch.tv/helix/users?id=' + id,
    headers: {
        "Client-ID":  Twitch.clientOptions.options.clientId
    }
  }, Twitch)
  .then(data => !!data ? data.login : id)
  .catch(console.log)
}

exports.getViewers = function(Twitch) {
  helix({
    url: 'https://api.twitch.tv/helix/streams?user_login=' + Twitch.id,
    headers: {
        "Client-ID":  Twitch.clientOptions.options.clientId
    }
  }, Twitch)
  .then(data => {
    if (!!data && !!data.type) { //if the streamer is live
      client.api({
        url: 'http://tmi.twitch.tv/group/user' + header(Twitch.channel, 'chatters', null, 3)
      }, function (err, res, tmibody) {
        if ((tmibody || {}).chatter_count) {
          console.log('getViewers', data.viewer_count, tmibody.chatter_count)
          chatqueue[Twitch.id].store('audience', {chatters: tmibody.chatter_count, watchers: !!data.viewer_count ? data.viewer_count : 0})
        }
      })
    }
  })
  .catch(console.log)
}

exports.getStart = function(channel) {  // eventually this function will be replaced with a webhook for start time
  return new Promise(function(resolve, reject) {
    let clientOptions = require('./clientoptions')
    client.api({
      url: 'https://api.twitch.tv/helix/streams?user_id=' + channel,
      headers: {
          "Client-ID":  clientOptions.options.clientId
      }
    }, function (err, res, body) {
      console.log('body', body);
      err && reject(err)
      ((body || {}).data || {}).length ? body.data.forEach(field => resolve(new Date(field.started_at))) : resolve(false)
       // catches if the stream is not online when the users requests that the chatbot connect to irc
    })
  })
}
  // client.api({
  //   url: 'https://api.twitch.tv/kraken/streams' + header(channel)
  // }, function (err, res, body) {
  //   if ((body || {}).stream) {
  //     started = new Date(body.stream.created_at)
  //   }
  // })
// }
// exports.getStart = function(channel) {
//   client.api({
//     url: 'https://api.twitch.tv/kraken/streams' + header(channel)
//   }, function (err, res, body) {
//     if ((body || {}).stream) {
//       started = new Date(body.stream.created_at)
//     }
//   })
// }

exports.checkfollowers = function(Twitch, hidenotify, current) {
  let maxcursor = 100
  if (!current) current = 0
  client.api({
    url: 'https://api.twitch.tv/kraken/channels' + header(Twitch.id, 'follows', 'offset=' + current + '&limit=' + maxcursor)
  }, function (err, res, body) {
    if ((body || {}).follows) {
      if (current + body.follows.length < body._total) exports.checkfollowers(Twitch, hidenotify, current + body.follows.length)
      followerloop: for (viewer in body.follows) {
        if (!streamers[Twitch.id].followers[body.follows[viewer].user.name]) {
          let datefollowed = new Date(body.follows[viewer].created_at)
     // followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed))/8.64e7) + ' days ago (' + body.follows[viewer].created_at.split('T').shift().split('-').reverse().join('/') + ')'};
          streamers[Twitch.id].followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed) / 8.64e7) + ' days ago (' + datefollowed.toDateString() + ')'}
          if (!hidenotify) {
            chatqueue[Twitch.id].store('follower', {username: body.follows[viewer].user.name, number:Object.keys(Twitch.followers).length.toLocaleString()})
            chatqueue[Twitch.id].store('notice', {text: body.follows[viewer].user.name + ' is now following (follower #' + Object.keys(Twitch.followers).length.toLocaleString()+ ')', fadedelay: 20000, level:1})
          }
        }
      }
    }
    err && reject(err)
  })
}

exports.checkstreamer = function(userId) {  // waiting for new client.api to have all this data
  return new Promise(function(resolve, reject) {
    client.api({
      url: 'https://api.twitch.tv/kraken/channels' + header(userId)
    }, function (err, res, body) {
      if (body) {
        resolve({
          username: body.name,
          banner: body.profile_banner ? body.profile_banner : body.logo,
          followers: body.followers,
          views: body.views,
          url: body.url})
                  // socket.emit('send emote', {message: 'hi ' + body.name, picture: 9})
      }
      else reject(err)
    })
  })
}
