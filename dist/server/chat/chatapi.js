// api call functions
function header (id, endpoint, extraparams, version) {
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

exports.checkAvatar = function(username) {
  return new Promise(function(resolve, reject) {
    client.api({
      url: 'https://api.twitch.tv/helix/users?id=' + username,
      headers: {
          "Client-ID":  clientOptions.options.clientId
      }
    // })
  //   .then(result => resolve(body.data[0].profile_image_url ? body.data[0].profile_image_url : 'http://www-cdn.jtvnw.net/images/xarth/footer_glitch.png'))
  //   .catch(err => console.log(err))
  // })
    }, function (err, res, body) {
      let avatar= body.data[0].profile_image_url ? body.data[0].profile_image_url : 'http://www-cdn.jtvnw.net/images/xarth/footer_glitch.png'
      resolve(avatar)
    })
  })
}

exports.getViewers = function(channel) {
  return new Promise(function(resolve, reject) {
    client.api({
      url: 'https://api.twitch.tv/helix/streams?user_login=' + 'twitchplayspokemon',//channel,
      headers: {
          "Client-ID":  clientOptions.options.clientId
      }
    }, function (err, res, body) {
      if (((body || {}).data || {})[0]) watching.viewers = body.data[0].viewer_count
      if (((body || {}).data || {})[0].type) {
        client.api({
          url: 'http://tmi.twitch.tv/group/user' + header(body.data[0].user_login, 'chatters', null, 3)
        }, function (err, res, tmibody) {
          if ((tmibody || {}).data) {
            watching.chatters = tmibody.data.chatters.viewers
            socket.emit('send emote', {message: watching.chatters.length.toLocaleString() + ' in chat ' + watching.viewers.toLocaleString() + ' reported viewers', picture: 5})
          }
        })
      }
    })
  })
}

exports.getStart = function(channel) {
  client.api({
    url: 'https://api.twitch.tv/kraken/streams' + header(channel)
  }, function (err, res, body) {
    if ((body || {}).stream) {
      started = new Date(body.stream.created_at)
    }
  })
}

exports.checkfollowers = function(Twitch, hidenotify, current) {
  let maxcursor = 100
  if (!current) current = 0
  client.api({
    url: 'https://api.twitch.tv/kraken/channels' + header(Twitch.id, 'follows', 'offset=' + current + '&limit=' + maxcursor)
  }, function (err, res, body) {
    if (body) {
      if (current + body.follows.length < body._total) exports.checkfollowers(Twitch, hidenotify, current + body.follows.length)
      followerloop: for (viewer in body.follows) {
        if (!followers[body.follows[viewer].user.name]) {
          let datefollowed = new Date(body.follows[viewer].created_at)
     // followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed))/8.64e7) + ' days ago (' + body.follows[viewer].created_at.split('T').shift().split('-').reverse().join('/') + ')'};
          followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed) / 8.64e7) + ' days ago (' + datefollowed.toDateString() + ')'}
          if (!hidenotify) {
            chatqueue[Twitch.id].store('follower', {username: body.follows[viewer].user.name, number:Object.keys(followers).length.toLocaleString()})
          }
        }
      }
    }
  })
}

exports.checkstreamer = function(userId) {  // waiting for new API to have all this data
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
