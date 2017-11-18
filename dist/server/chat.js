const {dehash, capitalize, hosting, timeout, clearChat, submitchat, dequeue, parseraffle, urlDecode, isMod, checkPoke, checkDb, checkMoves, checkExist, getChunks} = require('./chat/chatfunctions')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer} = require('./chat/chatapi')
const {parseMessage} = require('./chat/chatbackend')
const {process} = require('./chat/metaphone')

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
  global.chatqueue[Twitch.id] = new Store(Twitch.backlog, ['chat'])
  // global.participants = await dbcall.sendraffleupdate('Users').catch(err => console.log(err)) || {}
  global.botqueue[Twitch.id] = {
    channel: Twitch.channel,
    messages: [],
    lastMessage: Date.now(),
    more: [],
    responseSize: 12
  }

  botDelay = 1, // Number of seconds between each bot message
  showConnectionNotices = true // Show messages like "Connected" and "Disconnected"
  //start('56648155') // twitch plays pokemon

  let joinAnnounced = []

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
    if (!useravatars[user.username]) {
      useravatars[user.username] = await dbcall.getavatar('Users', user.username).catch(err => console.log(err))
      chatqueue[Twitch.id].store('displaystreamer', await checkstreamer(user['user-id']))
      chatqueue[Twitch.id].store('receive new player', {poke: 1, name: user.username}) // use card for poke
    }
    if (!badges[user.username]) {
      badges[user.username] = await dbcall.getbadge('Users', user.username).catch(err => console.log(err))
    }
    if (useravatars[user.username] < 0) useravatars[user.username] = await checkAvatar(user['user-id']).catch(err => console.log(err))
    parseMessage(Twitch, user, channel, message, self, useravatars[user.username], badges[user.username]).catch(err => console.log(err))
  })
  client.addListener('timeout', timeout)
  client.addListener('clearchat', clearChat, Twitch)

  client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text: address + ':' + port, fadedelay:1000, level:-4, class:'chat-connection-good-connecting'}) })
  client.addListener('logon', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Authenticating', fadedelay:1000, level:-3, class: 'chat-connection-good-logon' }) })
  client.addListener('connectfail', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Connection failed', fadedelay:1000, level:3, class: 'chat-connection-bad-fail' }) })
  client.addListener('reconnect', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Reconnected', fadedelay:1000, level:-3, class: 'chat-connection-good-reconnect' }) })
  client.addListener('crash', function () { chatqueue[Twitch.id].store('notice', {text:'Crashed', fadedelay:10000, level:4, class: 'chat-crash' }) })
  client.addListener("cheer", async function (channel, userstate, message) {
    console.log(userstate, message)
    chatqueue[Twitch.id].store('bits', {userstate: userstate, message: message})
    // Object { badges: Object, bits: "50", color: "#FF0000", display-name: "jennluv69", emotes: null, id: "9ff6f821-6419-4f9a-a4ab-f4c638012ae2", mod: false, room-id: "39392583", subscriber: false, tmi-sent-ts: "1498980326580", turbo, user-id, user-type, username}
    chatqueue[Twitch.id].store('metaphone', {chunks: await getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')'})
    // expressServer.socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')')
  })

  client.on("subscription", async function (channel, username, method, message, userstate) {
      chatqueue[Twitch.id].store('subscriber', {username: username, method: method, message: message})
      console.log(userstate, message, method)
      chatqueue[Twitch.id].store('metaphone', {chunks: await getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)'})
      // expressServer.socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)')
  })

  client.addListener('connected', function (address, port) {
    showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Connected', fadedelay:1000, level:-2, class: 'chat-connection-good-connected'})
    joinAnnounced = []
    checkfollowers(Twitch, true)
  })

  client.addListener('disconnected', function (reason) {
    showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Disconnected: ' + (reason || ''), fadedelay:3000, level:2, class: 'chat-connection-bad-disconnected'})
    client.connect()
  })

  client.addListener('join', function (channel, username) {
    if (username == client.getUsername()) {
      showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Joined ' + capitalize(dehash(channel)), fadedelay:1000, level:-1, class: 'chat-room-join'})
      joinAnnounced.push(channel)
   // getViewers(channel);
      getStart(Twitch.id)
    }
  })

  client.addListener('part', function (channel, username) {
    joinAnnounced.indexOf(channel) > -1 && joinAnnounced.splice(joinAnnounced.indexOf(channel), 1)
  })

  client.connect()

  let timers = [
    setInterval(getViewers, 525000, Twitch.id),
    // setInterval(repeating_notice_website, 3000000),
    // setInterval(repeating_notice_signup, 7200000),
    setInterval(checkfollowers, 180000, Twitch, false),
    setInterval(dequeue, 1000 * botDelay, botDelay, Twitch.id)
  ]

 // let tm = require('./TM')
 // tm.forEach((item, index) => {
 //  let thismove = Object.keys(item).shift()
 //  if ( item[thismove] !== 'I dunno') {
 //    let send = {
 //      id: index+1
 //    }
 //    send[thismove] = item[thismove]
 //    console.log('',send)
 //    dbcall.put('Users', 'Tm', send).catch(err => console.log(err))
 //  }
 // })

}
