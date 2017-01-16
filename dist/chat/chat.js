function chatbot() {
 var joinAccounced = [];

 client.on("hosted", function(channel, username, total) {
  var chan = dehash(channel);
  chan = capitalize(chan);
  if (typeof(total) == 'number')
   chatNotice(username + ' is now hosting ' + chan + ' for ' + total + ' viewer' + (total !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes');
  else chatNotice(username + ' is now hosting ' + chan + '.', null, null, 'chat-hosting-yes');
 });

 client.addListener('message', parseMessage);
 client.addListener('timeout', timeout);
 client.addListener('clearchat', clearChat);
 client.addListener('hosting', hosting);
 client.addListener('unhost', function(channel, viewers) {
  hosting(channel, null, viewers, true)
 });

 client.addListener('connecting', function(address, port) {if (showConnectionNotices) chatNotice('Connecting', 1000, -4, 'chat-connection-good-connecting');});
 client.addListener('logon', function() {if (showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon');});
 client.addListener('connectfail', function() {if (showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail');});
 client.addListener('reconnect', function() {if (showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect');});
 client.addListener('crash', function() {chatNotice('Crashed', 10000, 4, 'chat-crash');});

 client.addListener('connected', function(address, port) {
  if (showConnectionNotices) chatNotice('Connected', 1000, -2, 'chat-connection-good-connected');
  joinAccounced = [];
  checkfollowers(TwitchID, true);
 });

 client.addListener('disconnected', function(reason) {
  if (showConnectionNotices) chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected');
  client.connect();
 });

 client.addListener('join', function(channel, username) {
  if(username == client.getUsername()) {
   if(showConnectionNotices) chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join');
   joinAccounced.push(channel);
   // getViewers(channel);
   getStart(TwitchID);
  }
 });

 client.addListener('part', function(channel, username) {
  var index = joinAccounced.indexOf(channel);
  if (index > -1) {
   joinAccounced.splice(joinAccounced.indexOf(channel), 1)
  }
 });

 client.connect();
 socket.emit('send raffle', true);
 socket.emit("Ask for table", 'Moves');
 socket.emit("Ask for table", 'Abilities');
 socket.emit("Ask for table", 'Bttv');
 socket.emit("Ask for table", 'Ffz');

var timers = [
 window.setInterval(getViewers, 525000, TwitchID),
 window.setInterval(repeating_notice_website, 3000000),
 window.setInterval(repeating_notice_signup, 7200000),
 window.setInterval(checkfollowers, 180000, TwitchID, false),
 window.setInterval(dequeue, 1000*botDelay || 1000),
];
}