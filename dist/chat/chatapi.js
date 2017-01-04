//api call functions
function header(id, endpoint, extraparams, version){
  if (!version) version = 5;
  var paramstring = '';
  if (id) paramstring += '/' + id;
  if (endpoint) paramstring += '/' + endpoint;
  paramstring += '?';
  if (extraparams) paramstring += extraparams + '&';
  paramstring += 'api_version=' + version;
  paramstring += '&client_id=' + clientOptions.options.clientId;
  return paramstring;
}

// function nametoid(username) {
//  username = dehash(username);
//  var idcall = new Promise(
//   function(resolve, reject) {
//    client.api({
//     url: 'https://api.twitch.tv/kraken/users/' + header(null, null, 'login=' + username)
//    }, function (err, res, body) {
//     console.log(body.users[0]._id);
//     resolve(body.users[0]._id);
//    });
//   });
//  idcall.then(function(converted) { console.log(converted) });
// }
function checkAvatar(obj) {
  var existed = false;
  if (useravatars[obj.user.username] == undefined) {
   if (followers[obj.user.username])
    useravatars[obj.user.username] = followers[obj.user.username].logo;
   socket.emit('request avatar', obj.channel, obj.user, obj.message, obj.self);
   socket.emit('request badge', obj.user);
   if (obj.user.username != obj.channel && !obj.self) checkstreamer(obj.user['user-id']);
  } else {
   existed = true;
   if (useravatars[obj.user.username] < 0 && obj.user['user-id']) {
    if (typeof useravatars[obj.user.username] == "number")
     client.api({
      url: 'https://api.twitch.tv/kraken/users' + header(obj.user['user-id'])
     }, function(err, res, body) {
      if (body.logo)
       checkImageExists(body.logo, function(existsImage) {
        if (existsImage) {
         useravatars[obj.user.username] = body.logo;
        }
       });
     });
   }
  }
  return existed;
}

function getViewers(chan) {
 channel = dehash(chan);
 client.api({
  // url: 'http://tmi.twitch.tv/group/user/' + chan + '/chatters' + clientid
  url: 'http://tmi.twitch.tv/group/user' + header(channel, 'chatters', null, 3)
 }, function(err, res, body) {
  // document.getElementById('viewers').value = typeof(body.data.chatter_count) == 'number' ? body.data.chatter_count : 0;
  if (body) viewers = body.data.chatters.viewers;
  socket.emit('send emote', {message:viewers.length+' viewers', picture:5});
 });
}

function getStart(chan) {
 channel = dehash(chan);
 client.api({
  url: 'https://api.twitch.tv/kraken/streams' + header(channel)
 }, function(err, res, body) {
  if (body.stream) {
   started = new Date(body.stream.created_at);
  }
 });
}

function checkfollowers(userid, hidenotify, current) {
 var maxcursor = 100;
 if (!current) current = 0;
 client.api({
  url: 'https://api.twitch.tv/kraken/channels' + header(userid, 'follows', 'offset=' + current + '&limit=' + maxcursor)
 }, function(err, res, body) {
  if (body) {
   if (current + body.follows.length < body._total) checkfollowers(userid, hidenotify, current + body.follows.length);
   followerloop: for (viewer in body.follows)
    if (!followers[body.follows[viewer].user.name]) {
      var datefollowed = new Date(body.follows[viewer].created_at);
     // followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed))/8.64e7) + ' days ago (' + body.follows[viewer].created_at.split('T').shift().split('-').reverse().join('/') + ')'};
     followers[body.follows[viewer].user.name] = {logo: body.follows[viewer].user.logo, followed: Math.floor((Date.now() - datefollowed)/8.64e7) + ' days ago (' + datefollowed.toDateString() + ')'};
     if (!hidenotify) chatNotice(body.follows[viewer].user.name + " is now following (follower #" + Object.keys(followers).length + ")", 10000, 1);
    }
  }
 });
}

function checkstreamer(username) {
 client.api({
  url: 'https://api.twitch.tv/kraken/channels' + header(username)
 }, function(err, res, body) {
  if (body) {
   displaystreamer(body.name, body.profile_banner ? body.profile_banner : body.logo, body.followers, body.views, body.url);
   socket.emit('send emote', {message:'hi '+body.name, picture:9});
  }
 });
}
