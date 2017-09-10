 client = new require('./dist/server/chat/tmi.min').client(clientOptions),

let started,
 stockavatar = [],
 followers = {},
 useravatars = {},
 userbadges = {},
 participants = {},
 streamers = [],
 randomColorsChosen = {},
 abilities = {},
 moves = {},
 recentTimeouts = {},
 emoticons = { bttv: [], ffz:[] },
 watching = {chatters: [], viewers: 0},
 queue = {
  channel: channels[0],
  messages: [],
  lastMessage: Date.now()
 }
