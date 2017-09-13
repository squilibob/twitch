// api call functions
function header(id, endpoint, extraparams, version) {
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
      url: 'https://api.twitch.tv/kraken/users' + header(username)
    }, function (err, res, body) {
      let avatar= body.logo ? body.logo : 'http://www-cdn.jtvnw.net/images/xarth/footer_glitch.png'
      resolve(avatar)
    })
  })
}

exports.getViewers = function(channel) {
  client.api({
    url: 'https://api.twitch.tv/kraken/streams' + header(channel)
  }, function (err, res, body) {
    if (((body || {}).stream || {}).viewers) watching.viewers = body.stream.viewers
    if (((body || {}).stream || {}).channel) {
      client.api({
        url: 'http://tmi.twitch.tv/group/user' + header(body.stream.channel.name, 'chatters', null, 3)
      }, function (err, res, tmibody) {
        if ((tmibody || {}).data) {
          watching.chatters = tmibody.data.chatters.viewers
          socket.emit('send emote', {message: watching.chatters.length.toLocaleString() + ' in chat ' + watching.viewers.toLocaleString() + ' reported viewers', picture: 5})
        }
      })
    }
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

exports.checkfollowers = function(socket, userid, hidenotify, current) {
  let maxcursor = 100
  if (!current) current = 0
  client.api({
    url: 'https://api.twitch.tv/kraken/channels' + header(userid, 'follows', 'offset=' + current + '&limit=' + maxcursor)
  }, function (err, res, body) {
    if (body) {
      if (current + body.follows.length < body._total) exports.checkfollowers(socket, userid, hidenotify, current + body.follows.length)
      followerloop: for (viewer in body.follows) {
        if (!followers[body.follows[viewer].user.name]) {
          let datefollowed = new Date(body.follows[viewer].created_at)
     // followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed))/8.64e7) + ' days ago (' + body.follows[viewer].created_at.split('T').shift().split('-').reverse().join('/') + ')'};
          followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed) / 8.64e7) + ' days ago (' + datefollowed.toDateString() + ')'}
          if (!hidenotify) {
            chatNotice(socket, body.follows[viewer].user.name + ' is now following (follower #' + Object.keys(followers).length.toLocaleString() + ')', 10000, 1)
            socket.emit('followed', body.follows[viewer].user.name)
          }
        }
      }
    }
  })
}

exports.checkstreamer = function(username) {
  client.api({
    url: 'https://api.twitch.tv/kraken/channels' + header(username)
  }, function (err, res, body) {
    if (body) {
      displaystreamer(body.name, body.profile_banner ? body.profile_banner : body.logo, body.followers, body.views, body.url)
      socket.emit('send emote', {message: 'hi ' + body.name, picture: 9})
    }
  })
}
