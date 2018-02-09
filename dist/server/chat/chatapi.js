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
    // let apireset = +Twitch.api.reset - +Date.now() / 1000
    // if (Twitch.api.remaining < 1 && apireset > 0) {
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
      // reject(new Error((+Twitch.api.reset - +Date.now() / 1000) + ' seconds until API limit resets'))
    // } else
    client.api(options, function (err, res, body) {
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
  .then(data => data.login || id)
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

exports.getStart = function(Twitch) {  // eventually this function will be replaced with a webhook for start time
  return helix({
    url: 'https://api.twitch.tv/helix/streams?id=' + Twitch.id,
    headers: {
        "Client-ID":  Twitch.clientOptions.options.clientId
    }
  }, Twitch)
  .then(data => new Date(data.started_at) || 0)
  .catch(console.log)
}

exports.checkfollowers = function(Twitch) {
  return new Promise(function(resolve, reject) {
    const rate = 'ratelimit-'
    let apireset = +Twitch.api.reset - +Date.now() / 1000
    if (Twitch.api.remaining < 1 && apireset > 0) {
      reject(new Error((+Twitch.api.reset - +Date.now() / 1000) + ' seconds until API limit resets'))
    } else client.api(options, function (err, res, body) {
      if ((res || {}).headers) {
        Object.keys(res.headers)
          .filter(key => key.includes(rate))
          .forEach(key => Twitch.api[key.substr(rate.length)] = res.headers[key])
      }
      err && reject(err)
      resolve(((body || {}).total) ? body.total : 0)
    })
  })
}

exports.getFollowDate = function(id, Twitch) {
  return helix({
    url: 'https://api.twitch.tv/helix/users/follows?from_id=' + id + '&to_id=' + Twitch.id,
    headers: {
        "Client-ID":  Twitch.clientOptions.options.clientId
    }
  }, Twitch)
  .then(data => new Date(data.followed_at) || 0)
  .catch(console.log)
}

exports.checkstreamer = function(userId) {  // waiting for new helix api to have all this data
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
