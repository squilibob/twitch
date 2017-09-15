const tmi = require('tmi.js')
global.clientOptions = require('./chat/clientoptions')
global.client = new tmi.client(clientOptions)
  // require('./chat/tm')
  // require('./chat/natures')
  // require('./chat/hiddenpowers')
const {dehash, capitalize, chatNotice, hosting, timeout, clearChat, submitchat, dequeue, parseraffle, urlDecode, isMod, checkPoke, checkDb, checkMoves, checkExist} = require('./chat/chatfunctions')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer} = require('./chat/chatapi')
const {parseMessage} = require('./chat/chatbackend')

module.exports = function(expressServer) {
  let TwitchID = '32218175',
  botDelay = 1, // Number of seconds between each bot message
  showConnectionNotices = true // Show messages like "Connected" and "Disconnected"
  global.followers = {}
  global.watching = {}
  global.useravatars = {}
  global.badges = {}
  global.queue = {
    channel: clientOptions.channels[0],
    messages: [],
    lastMessage: Date.now()
  }

  let joinAnnounced = []

  client.on('hosted', function (channel, username, total, autohost) {
    let chan = dehash(channel)
    chan = capitalize(chan)
    if (typeof (total) === 'number') { chatNotice(expressServer.socket, username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + ' for ' + total + ' viewer' + (total !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes') } else chatNotice(expressServer.socket, username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + '.', null, null, 'chat-hosting-yes')
  })

  client.addListener('message', async function(channel, user, message, self) {
    if (!useravatars[user.username]) {
      useravatars[user.username] = await expressServer.dbcall.getavatar(expressServer.database, expressServer.connection, user.username).catch(err => console.log(err))
      expressServer.socket.emit('displaystreamer', await checkstreamer(TwitchID))
    }
    if (!badges[user.username]) {
      badges[user.username] = await expressServer.dbcall.getbadge(expressServer.database, expressServer.connection, user.username).catch(err => console.log(err))
    }
    if (useravatars[user.username] < 0) useravatars[user.username] = await checkAvatar(user['user-id']).catch(err => console.log(err))
    parseMessage(channel, user, message, self, useravatars[user.username], badges[user.username], expressServer)
  })
  client.addListener('timeout', timeout)
  client.addListener('clearchat', clearChat, expressServer.socket)
  client.addListener('hosting', hosting)
  client.addListener('unhost', function (channel, viewers) {
    hosting(channel, null, viewers, true)
  })

  client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatNotice(expressServer.socket, address + ':' + port, 1000, -4, 'chat-connection-good-connecting') })
  client.addListener('logon', function () { if (showConnectionNotices) chatNotice(expressServer.socket, 'Authenticating', 1000, -3, 'chat-connection-good-logon') })
  client.addListener('connectfail', function () { if (showConnectionNotices) chatNotice(expressServer.socket, 'Connection failed', 1000, 3, 'chat-connection-bad-fail') })
  client.addListener('reconnect', function () { if (showConnectionNotices) chatNotice(expressServer.socket, 'Reconnected', 1000, 'chat-connection-good-reconnect') })
  client.addListener('crash', function () { chatNotice(expressServer.socket, 'Crashed', 10000, 4, 'chat-crash') })
  client.addListener("cheer", function (channel, userstate, message) {
    console.log(userstate, message)
    chatNotice(expressServer.socket, userstate.username + ' has donated ' + userstate.bits + ' bits', 10000, 1)
    // Object { badges: Object, bits: "50", color: "#FF0000", display-name: "jennluv69", emotes: null, id: "9ff6f821-6419-4f9a-a4ab-f4c638012ae2", mod: false, room-id: "39392583", subscriber: false, tmi-sent-ts: "1498980326580", turbo, user-id, user-type, username}
    let chunks = []
    for (word of message.split(' ')) {
      chunks.push(process(word).length)
    }
    expressServer.socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')')
  })


  client.on("subscription", function (channel, username, method, message, userstate) {
      chatNotice(expressServer.socket, username + ' has subscribed (' + method + ')', 10000, 1)
      console.log(userstate, message)
      let chunks = []
      for (word of message.split(' ')) {
        chunks.push(process(word).length)
      }
      expressServer.socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)')
  })



  client.addListener('connected', function (address, port) {
    showConnectionNotices && chatNotice(expressServer.socket, 'Connected', 1000, -2, 'chat-connection-good-connected')
    joinAnnounced = []
    checkfollowers(expressServer.socket, TwitchID, true)
  })

  client.addListener('disconnected', function (reason) {
    showConnectionNotices && chatNotice(expressServer.socket, 'Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected')
    client.connect()
  })

  client.addListener('join', function (channel, username) {
    if (username == client.getUsername()) {
      showConnectionNotices && chatNotice(expressServer.socket, 'Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join')
      joinAnnounced.push(channel)
   // getViewers(channel);
      getStart(TwitchID)
    }
  })

  client.addListener('part', function (channel, username) {
    joinAnnounced.indexOf(channel) > -1 && joinAnnounced.splice(joinAnnounced.indexOf(channel), 1)
  })

  client.connect()

  let timers = [
    setInterval(getViewers, 525000, TwitchID),
    // setInterval(repeating_notice_website, 3000000),
    // setInterval(repeating_notice_signup, 7200000),
    setInterval(checkfollowers, 180000, expressServer.socket, TwitchID, false),
    setInterval(dequeue, 1000 * botDelay, botDelay)
  ]
}
