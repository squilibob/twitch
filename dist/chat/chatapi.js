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

function getViewers(chan) {
 channel = dehash(chan);
 client.api({
  // url: 'http://tmi.twitch.tv/group/user/' + chan + '/chatters' + clientid
  url: 'http://tmi.twitch.tv/group/user' + header(chan, 'chatters', null, 3)
 }, function(err, res, body) {
  console.log(body.data.chatters.viewers);
  // document.getElementById('viewers').value = typeof(body.data.chatter_count) == 'number' ? body.data.chatter_count : 0;
  if (body) viewers = body.data.chatters.viewers;
  socket.emit('send emote', {message:viewers.length+' viewers', picture:5});
 });
}

function getStart(chan) {
 // channel = dehash(chan);
 client.api({
  url: 'https://api.twitch.tv/kraken/streams' + header(chan)
 }, function(err, res, body) {
  if (body.stream) {
   started = new Date(body.stream.created_at);
  }
 });
}

function checkfollowers(userid, hidenotify, current) {
 var maxcursor = 100;
 if (!current) current = 0;
 // var cursor = url ? url : 'https://api.twitch.tv/kraken/channels/' + userid + '/follows';
 client.api({
  // url: cursor + '&' + clientOptions.options.clientId.substr(1)
  url: 'https://api.twitch.tv/kraken/channels' + header(userid, 'follows', 'offset=' + current + '&limit=' + maxcursor)
 }, function(err, res, body) {
  if (body) {
   // if (body.follows.length == maxcursor) checkfollowers(userid, hidenotify, body._links.next);
   if (current + body.follows.length < body._total) checkfollowers(userid, hidenotify, current + body.follows.length);
   followerloop: for (viewer in body.follows)
    if (followers.indexOf(body.follows[viewer].user.name) < 0) {
     followers.push(body.follows[viewer].user.name);
     if (!hidenotify) chatNotice(body.follows[viewer].user.name + " is now following (follower #" + followers.length + ")", 10000, 1);
    }
  }
 });
}

function checkstreamer(username) {
 client.api({
  // url: 'https://api.twitch.tv/kraken/channels/' + username + clientOptions.options.clientId
  url: 'https://api.twitch.tv/kraken/channels' + header(username)
 }, function(err, res, body) {
  if (body) {
   displaystreamer(body.name, body.profile_banner ? body.profile_banner : body.logo, body.followers, body.views, body.url);
   socket.emit('send emote', {message:'hi '+body.name, picture:9});
  }
 });
}
