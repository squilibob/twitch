// socket functions
socket.on('chat', function (chan, user, message, self, avatar, image) {
  handleChat(chan, user, message, self, avatar, image)
})

socket.on('notice', function (information, noticeFadeDelay, level, additionalClasses) {
  chatNotice(information, noticeFadeDelay, level, additionalClasses)
})

socket.on('user fc', function (user) {
  if (typeof (user) === 'string') submitchat(user)
  else submitchat(user.id + "'s friend code is " + user.fc[0] + '-' + user.fc[1] + '-' + user.fc[2] + ' IGN ' + user.ign)
})

socket.on('receive avatar', function (channel, user, message, self, avatar) {
  useravatars[user.username] = avatar
  handleChat(channel, user, message, self, avatar)
})

socket.on('receive badge', function (username, badge) {
  userbadges[username] = badge
})

socket.on('receive moves', function (movespayload) {
  for (move in movespayload) {
    moves[movespayload[move].id] = movespayload[move]
    delete moves[movespayload[move].id].id
  }
})

socket.on('receive abilities', function (abilitypayload) {
  for (move in abilitypayload) {
    abilities[abilitypayload[move].id] = abilitypayload[move].desc
  }
})

socket.on('receive bttv', function (bttvpayload) {
  if (bttvpayload) emoticons.bttv = bttvpayload
})

socket.on('receive ffz', function (ffzpayload) {
  if (ffzpayload) emoticons.ffz = ffzpayload
})

// socket.on('user pokes', function(payload) {
//  let name = payload.name;
//  let team = payload.team;
//  let TeamTier = 0;
//  for (let j=0; j < 6; j++) {
//    for (let check=0; check < Tiers.length; check++){
//      if (pokedex[team[j]].Tier == Tiers[check] && check > TeamTier) TeamTier = check;
//    }
//  }
//  let replyText = name + ' is ';
//  let total = 0;
//  for (let poke = 0; poke < team.length; poke++){
//    total += team[poke];
//    replyText = replyText + pokedex[team[poke]].Pokemon + ' ';
//    if (Tiers[TeamTier] != pokedex[team[poke]].Tier) replyText = replyText + ' (' + pokedex[team[poke]].Tier + ') ';
//  }
//  replyText = Tiers[TeamTier] + replyText;
//  if (total > 21) submitchat(replyText);
// });

socket.on('raffle winner', function (person) {
  submitchat(person + ' has won the raffle')
})

socket.on('raffle update', function (newraffle) {
  parseraffle(newraffle)
})

socket.on('someone signed up', function (name) {
  chatNotice(name + ' has created an account', 10000, 1)
})

socket.on('invalid raffle user', function (username) {
  submitchat(username + ' tried to enter the raffle but has not registered a FC and IGN (use !signup)')
})

socket.on('Vote options', function (list) {
  submitchat('the current poll is: ' + list.title + ' You can !vote for: ' + list.options.join(', '))
})

function repeating_notice_website () {
  socket.emit('send emote', {message: '!battle - website', picture: 6})
}

function repeating_notice_signup () {
  socket.emit('send emote', {message: '!signup in chat', picture: 6})
}
