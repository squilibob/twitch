//api call functions
function getViewers(chan) {
 channel = dehash(chan);
 client.api({
  url: 'http://tmi.twitch.tv/group/user/' + channel + '/chatters' + clientid
 }, function(err, res, body) {
  // document.getElementById('viewers').value = typeof(body.data.chatter_count) == 'number' ? body.data.chatter_count : 0;
  if (body) viewers = body.data.chatters.viewers;
  socket.emit('send emote', {message:viewers.length+' viewers', picture:5});
 });
}

function getStart(chan) {
 channel = dehash(chan);
 client.api({
  url: 'https://api.twitch.tv/kraken/streams/' + channel + clientid
 }, function(err, res, body) {
  if (body.stream) {
   started = new Date(body.stream.created_at);
  }
 });
}

function checkfollowers(username, hidenotify, url) {
 var maxcursor = 100;
 var followerslength = followers.length;
 var cursor = url ? url : 'https://api.twitch.tv/kraken/channels/' + username + '/follows?limit=100';
 client.api({
  url: cursor + '&' + clientid.substr(1)
 }, function(err, res, body) {
  if (body) {
   if (body.follows.length == maxcursor) checkfollowers(username, hidenotify, body._links.next);
   followerloop: for (viewer in body.follows)
    if (followers.indexOf(body.follows[viewer].user.name) < 0) {
     followers.push(body.follows[viewer].user.name);
     if (!hidenotify) chatNotice(body.follows[viewer].user.name + " is now following", 10000, 1);
    }
  }
 });
}

function checkstreamer(username) {
 client.api({
  url: 'https://api.twitch.tv/kraken/channels/' + username + clientid
 }, function(err, res, body) {
  if (body) {
   displaystreamer(username, body.profile_banner ? body.profile_banner : body.logo, body.followers, body.views, body.url);
  }
 });
 socket.emit('send emote', {message:'hi '+username, picture:9});
}
