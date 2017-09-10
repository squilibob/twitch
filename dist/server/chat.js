const tmi = require('tmi.js')
global.clientOptions = require('./chat/clientoptions')
global.client = new tmi.client(clientOptions)
  // require('./chat/tm')
  // require('./chat/natures')
  // require('./chat/hiddenpowers')
const {dehash, capitalize, htmlEntities, checkImageExists, chatNotice, timeout, clearChat, hosting, submitchat, dequeue, parseraffle, urlDecode, isMod, checkPoke, checkDb, checkMoves, checkExist} = require('./chat/chatfunctions')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer} = require('./chat/chatapi')
const {parseMessage} = require('./chat/chatbackend')

module.exports = function(expressServer) {
require('./chat/chatsocket')(client, expressServer.socket)

let TwitchID = '32218175',
  botDelay = 1, // Number of seconds between each bot message
  showConnectionNotices = true // Show messages like "Connected" and "Disconnected"
  global.followers = {}
  global.queue = {
    channel: clientOptions.channels[0],
    messages: [],
    lastMessage: Date.now()
  }

  let joinAnnounced = []

  client.on('hosted', function (channel, username, total, autohost) {
    let chan = dehash(channel)
    chan = capitalize(chan)
    if (typeof (total) === 'number') { chatNotice(username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + ' for ' + total + ' viewer' + (total !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes') } else chatNotice(username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + '.', null, null, 'chat-hosting-yes')
  })

  client.addListener('message', function(channel, user, message, self) {
    checkAvatar(user)
    .then(avatar => parseMessage(channel, user, message, self, avatar, expressServer))
  })
  client.addListener('timeout', timeout)
  client.addListener('clearchat', clearChat)
  client.addListener('hosting', hosting)
  client.addListener('unhost', function (channel, viewers) {
    hosting(channel, null, viewers, true)
  })

  client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatNotice(address + ':' + port, 1000, -4, 'chat-connection-good-connecting') })
  client.addListener('logon', function () { if (showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon') })
  client.addListener('connectfail', function () { if (showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail') })
  client.addListener('reconnect', function () { if (showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect') })
  client.addListener('crash', function () { chatNotice('Crashed', 10000, 4, 'chat-crash') })
  client.addListener("cheer", function (channel, userstate, message) {
    console.log(userstate, message)
    chatNotice(userstate.username + ' has donated ' + userstate.bits + ' bits', 10000, 1)
    // Object { badges: Object, bits: "50", color: "#FF0000", display-name: "jennluv69", emotes: null, id: "9ff6f821-6419-4f9a-a4ab-f4c638012ae2", mod: false, room-id: "39392583", subscriber: false, tmi-sent-ts: "1498980326580", turbo, user-id, user-type, username}
    let chunks = []
    for (word of message.split(' ')) {
      chunks.push(process(word).length)
    }
    socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')')
  })


  client.on("subscription", function (channel, username, method, message, userstate) {
      chatNotice(username + ' has subscribed (' + method + ')', 10000, 1)
      console.log(userstate, message)
      let chunks = []
      for (word of message.split(' ')) {
        chunks.push(process(word).length)
      }
      socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)')
  })



  client.addListener('connected', function (address, port) {
    showConnectionNotices && chatNotice('Connected', 1000, -2, 'chat-connection-good-connected')
    joinAnnounced = []
    checkfollowers(TwitchID, true)
  })

  client.addListener('disconnected', function (reason) {
    showConnectionNotices && chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected')
    client.connect()
  })

  client.addListener('join', function (channel, username) {
    if (username == client.getUsername()) {
      showConnectionNotices && chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join')
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
    setInterval(checkfollowers, 180000, TwitchID, false),
    setInterval(dequeue, 1000 * botDelay, botDelay)
  ]
}
