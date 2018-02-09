const {dehash, capitalize, hosting, timeout, clearChat, submitchat, dequeue, parseraffle, urlDecode, isMod, checkPoke, checkDb, checkMoves, checkExist, getChunks} = require('./chat/chatfunctions')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer, getName} = require('./chat/chatapi')
const {parseMessage} = require('./chat/chatbackend')
const {followerhook, streaminghook} = require('./webhooks')

class Store {
  constructor(backlog, logtypes) {
    this.queue = []
    this.history = []
    this.backlog = typeof(backlog) === 'number' ? backlog : 0
    this.logtypes = Array.isArray(logtypes) ? logtypes : []
  }
  store(type, obj) {
    this.queue.push({type, obj})
    this.release()
  }
  archive(payload) {
    this.history.push(payload)
    this.history = this.history.slice(-this.backlog)
  }
  restore(){
    (this.socket && this.history.length) && this.socket.emit('history', this.history)
  }
  release() {
     (this.socket && this.queue.length) && this.emit(this.queue.shift())
  }
  emit(payload) {
    this.logtypes.includes(payload.type) && this.archive(payload)
    this.socket.emit(payload.type, payload.obj, this.release())
  }
}

module.exports = function(Twitch) {
  Twitch.channel = dehash(Twitch.channel)
  global.chatqueue[Twitch.id] = new Store(Twitch.backlog, ['chat'])
  global.botqueue[Twitch.id] = {
    channel: Twitch.channel,
    messages: [],
    lastMessage: Date.now(),
    more: [],
    responseSize: 12
  }

  dbcall.subscribetoraffle(Twitch)

  botDelay = 1, // Number of seconds between each bot message
  showConnectionNotices = true // Show messages like "Connected" and "Disconnected"

  let joinAnnounced = []

  alerts.on('follower', async function(obj) {
      chatqueue[Twitch.id].store('follower', {username: await getName(obj.from_id, Twitch), number:Object.keys(Twitch.followers).length.toLocaleString()})
      chatqueue[Twitch.id].store('notice', {text: await getName(obj.from_id, Twitch) + ' is now following (follower #' + Object.keys(Twitch.followers).length.toLocaleString()+ ')', fadedelay: 20000, level:1})
  })

  client.on('hosted', function (channel, username, viewers, autohost) {
      chatqueue[Twitch.id].store('host', {type: 'hosted', channel:channel, username:username, viewers:viewers, autohost:autohost})
  })
  client.addListener('hosting', function(channel, target, viewers) {
      chatqueue[Twitch.id].store('host', {type: 'hosting', channel:channel, username:target, viewers:viewers})
  })
  client.addListener('unhost', function (channel, viewers) {
      chatqueue[Twitch.id].store('host', {type: 'stopped', channel:channel, viewers:viewers})
  })

  client.addListener('message', async function(channel, user, message, self) {
    if (user.username === 'mikuia') return false
    if (!useravatars[user.username]) {
      useravatars[user.username] = await dbcall.getavatar('Users', user.username).catch(console.log)
      if (!useravatars[user.username]) useravatars[user.username] = -1
      let obj = await checkstreamer(user['user-id']).catch(console.log)
      if (((user || {})['user-id'] || {}) !== Twitch.id && !self && obj.followers && obj.followers > Twitch.shoutout) {
        chatqueue[Twitch.id].store('displaystreamer', obj)
        submitchat('Check out ' + obj.username + ' at ' + obj.url, Twitch.id)
      }
      chatqueue[Twitch.id].store('receive new player', {poke:  ~~(Math.random()*151), name: user.username}) // use card for poke
    }
    if (!badges[user.username]) {
      badges[user.username] = await dbcall.getbadge('Users', user.username).catch(console.log)
    }
    if (useravatars[user.username] < 0) useravatars[user.username] = await checkAvatar(user['user-id'], Twitch).catch(console.log)
                     if (typeof useravatars[user.username] === 'number') console.log(useravatars[user.username])
    parseMessage(Twitch, user, channel, message, self, useravatars[user.username], badges[user.username]).catch(console.log)
  })
  client.addListener('timeout', (channel, username, reason, duration) => timeout(channel, username, reason, duration, Twitch))
  client.addListener('clearchat', channel => clearChat(channel, Twitch))

  client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text: address + ':' + port, fadedelay:1000, level:-4, class:'chat-connection-good-connecting'}) })
  client.addListener('logon', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Authenticating', fadedelay:1000, level:-3, class: 'chat-connection-good-logon' }) })
  client.addListener('connectfail', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Connection failed', fadedelay:1000, level:3, class: 'chat-connection-bad-fail' }) })
  client.addListener('reconnect', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Reconnected', fadedelay:1000, level:-3, class: 'chat-connection-good-reconnect' }) })
  client.addListener('crash', function () { chatqueue[Twitch.id].store('notice', {text:'Crashed', fadedelay:10000, level:4, class: 'chat-crash' }) })
  client.addListener("cheer", function (channel, userstate, message) {
    console.log(userstate, message)
    chatqueue[Twitch.id].store('bits', {userstate: userstate, message: message})
    chatqueue[Twitch.id].store('texttopika', {chunks: getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')'})
  })

  client.on("subscription", function (channel, username, method, message, userstate) {
    if (!userstate) userstate = username
    if (!message) message = 'new subscriber'
      console.log(username, method, message, userstate)
      chatqueue[Twitch.id].store('subscriber', {username: username, method: method, message: message})
      chatqueue[Twitch.id].store('texttopika', {chunks: getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)'})
  })

  client.addListener('connected', async function (address, port) {
    showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Connected', fadedelay:1000, level:-2, class: 'chat-connection-good-connected'})
    joinAnnounced = []
    chatqueue[Twitch.id].store('notice', {text: 'followers ' + await followerhook(Twitch.id).catch(console.log), fadedelay:2000, level:-2, class:'chat-connection-good-connecting'})
    chatqueue[Twitch.id].store('notice', {text: 'online check ' + await streaminghook(Twitch.id).catch(console.log), fadedelay:2000, level:-3, class:'chat-connection-good-connecting'})
  })

  client.addListener('disconnected', function (reason) {
    showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Disconnected: ' + (reason || ''), fadedelay:3000, level:2, class: 'chat-connection-bad-disconnected'})
    client.connect()
  })

  client.addListener('join', async function (channel, username) {
    if (!joinAnnounced.includes(channel)) {// (username == client.getUsername()) {
      showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Joined ' + capitalize(dehash(channel)), fadedelay:1000, level:-1, class: 'chat-room-join'})
      joinAnnounced.push(channel)
    }
  })

  client.addListener('part', function (channel, username) {
    joinAnnounced.includes(channel) && joinAnnounced.splice(joinAnnounced.indexOf(channel), 1)
  })

  client.connect()

  let timers = [
    setInterval(dequeue, 1000 * botDelay, botDelay, Twitch.id)
  ]
}
