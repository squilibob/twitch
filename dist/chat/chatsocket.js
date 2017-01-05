//socket functions

socket.on('whisper password', function(user, password) {
 var temptext = "Your password is " + pokedex[password[0] - 1].Pokemon + " - " + pokedex[password[1] - 1].Pokemon + " - " + pokedex[password[2] - 1].Pokemon;
 client.whisper(user, temptext);
});

socket.on('user fc', function(user) {
 if (typeof(user) == 'string') submitchat(user);
 else submitchat(user.id + "'s friend code is " + user.fc[0] + "-" + user.fc[1] + "-" + user.fc[2] + " IGN " + user.ign);
});

socket.on('receive avatar', function(channel, user, message, self, avatar) {
 useravatars[user.username] = avatar;
 handleChat(channel, user, message, self, avatar);
});

socket.on('receive badge', function(username, badge) {
 userbadges[username] = badge;
});

socket.on ("receive moves", function(payload) {
 for (move in payload) {
  moves[payload[move].id] = payload[move];
  delete moves[payload[move].id].id;
 }
});

socket.on ("receive abilities", function(payload) {
 for (move in payload) {
  abilities[payload[move].id] = payload[move].desc;
 }
});
// socket.on('user pokes', function(payload) {
//  var name = payload.name;
//  var team = payload.team;
//  var TeamTier = 0;
//  for (var j=0; j < 6; j++) {
//    for (var check=0; check < Tiers.length; check++){
//      if (pokedex[team[j]].Tier == Tiers[check] && check > TeamTier) TeamTier = check;
//    }
//  }
//  var replyText = name + ' is ';
//  var total = 0;
//  for (var poke = 0; poke < team.length; poke++){
//    total += team[poke];
//    replyText = replyText + pokedex[team[poke]].Pokemon + ' ';
//    if (Tiers[TeamTier] != pokedex[team[poke]].Tier) replyText = replyText + ' (' + pokedex[team[poke]].Tier + ') ';
//  }
//  replyText = Tiers[TeamTier] + replyText;
//  if (total > 21) submitchat(replyText);
// });

socket.on('raffle winner', function(person) {
 submitchat(person + ' has won the raffle');
});

socket.on('raffle update', function(newraffle) {
  parseraffle(newraffle);
});

socket.on('someone signed up', function(name) {
 chatNotice(name + " has created an account", 10000, 1);
});

socket.on('invalid raffle user', function(username) {
 submitchat(username + ' tried to enter the raffle but has not registered a FC and IGN (use !signup)');
});

socket.on("Vote options", function(list){
  submitchat(list.title + ' You can !vote for: ' + list.options.join(', '));
});

function repeating_notice_website () {
  socket.emit('send emote', {message:'!battle - website', picture:6});
}

function repeating_notice_signup () {
  socket.emit('send emote', {message:'!signup in chat', picture:6});
}
