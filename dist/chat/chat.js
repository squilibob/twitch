function chatbot () {
  let joinAnnounced = []
  socket.on('chat', payload => handleChat(payload))
  socket.on('notice', payload => chatNotice(payload))
  socket.on('displaystreamer', payload => displaystreamer(payload))
  socket.on('clear', payload => clearChat(payload))
  socket.on('bits', payload => chatNotice({notice: payload.userstate.username + ' has donated ' + payload.userstate.bits + ' bits', fadedelay: 10000, level:1}))
  socket.on('subscriber', payload => chatNotice({notice: payload.username + ' has subscribed (' + payload.method + ')', fadedelay: 10000, level:1}))
  socket.on('timeout', payload =>  timeout(payload))
  socket.on('starthost', payload => hosting(payload.channel, payload.target, payload.total, true))
  socket.on('stophost', payload => hosting(payload, '-', '-', true))
      // command -

      // metaphone - chunks: await getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)'
      // follower - {username: number:}
  /*
    Ban - Username has been banned on a channel.
    Emoteonly - Channel enabled or disabled emote-only mode.
    Followersonly - Channel enabled or disabled followers-only mode.
    Mod - Someone got modded on a channel.
    Notice - Received a notice from server.
    Resub - Username has resubbed on a channel.
    Roomstate - The current state of the channel.
    Subscription - Username has subscribed to a channel.
    Unmod - Someone got unmodded on a channel.
*/

  socket.emit('chatbot', {  id: TwitchID,  channel: clientOptions.channels[0]  })
  // client.on('hosted', function (channel, username, total, autohost) {
  //   let chan = dehash(channel)
  //   chan = capitalize(chan)
  //   if (typeof (total) === 'number') { chatNotice(username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + ' for ' + total + ' viewer' + (total !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes') } else chatNotice(username + ' is now ' + (autohost ? 'auto' : '') + 'hosting ' + chan + '.', null, null, 'chat-hosting-yes')
  // })

  // client.addListener('message', parseMessage)
  // client.addListener('timeout', timeout)
  // client.addListener('clearchat', clearChat)
  // client.addListener('hosting', hosting)
  // client.addListener('unhost', function (channel, viewers) {
  //   hosting(channel, null, viewers, true)
  // })

  // client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatNotice(address + ':' + port, 1000, -4, 'chat-connection-good-connecting') })
  // client.addListener('logon', function () { if (showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon') })
  // client.addListener('connectfail', function () { if (showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail') })
  // client.addListener('reconnect', function () { if (showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect') })
  // client.addListener('crash', function () { chatNotice('Crashed', 10000, 4, 'chat-crash') })
  // client.addListener("cheer", function (channel, userstate, message) {
  //   console.log(userstate, message)
  //   chatNotice(userstate.username + ' has donated ' + userstate.bits + ' bits', 10000, 1)
  //   // Object { badges: Object, bits: "50", color: "#FF0000", display-name: "jennluv69", emotes: null, id: "9ff6f821-6419-4f9a-a4ab-f4c638012ae2", mod: false, room-id: "39392583", subscriber: false, tmi-sent-ts: "1498980326580", turbo, user-id, user-type, username}
  //   let chunks = []
  //   for (word of message.split(' ')) {
  //     chunks.push(process(word).length)
  //   }
  //   socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')')
  // })


  // client.on("subscription", function (channel, username, method, message, userstate) {
  //     chatNotice(username + ' has subscribed (' + method + ')', 10000, 1)
  //     console.log(userstate, message)
  //     let chunks = []
  //     for (word of message.split(' ')) {
  //       chunks.push(process(word).length)
  //     }
  //     socket.emit('metaphone', chunks, 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)')
  // })



  // client.addListener('connected', function (address, port) {
  //   showConnectionNotices && chatNotice('Connected', 1000, -2, 'chat-connection-good-connected')
  //   joinAnnounced = []
  //   checkfollowers(TwitchID, true)
  // })

  // client.addListener('disconnected', function (reason) {
  //   showConnectionNotices && chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected')
  //   client.connect()
  // })

  // client.addListener('join', function (channel, username) {
  //   if (username == client.getUsername()) {
  //     showConnectionNotices && chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join')
  //     joinAnnounced.push(channel)
  //  // getViewers(channel);
  //     getStart(TwitchID)
  //   }
  // })

  // client.addListener('part', function (channel, username) {
  //   joinAnnounced.indexOf(channel) > -1 && joinAnnounced.splice(joinAnnounced.indexOf(channel), 1)
  // })

  // client.connect()
  // socket.emit('send raffle', true)
  // socket.emit('Ask for table', 'Moves')
  // socket.emit('Ask for table', 'Abilities')
  // socket.emit('Ask for table', 'Bttv')
  // socket.emit('Ask for table', 'Ffz')

  // let timers = [
  //   window.setInterval(getViewers, 525000, TwitchID),
  //   window.setInterval(repeating_notice_website, 3000000),
  //   window.setInterval(repeating_notice_signup, 7200000),
  //   window.setInterval(checkfollowers, 180000, TwitchID, false),
  //   window.setInterval(dequeue, 1000 * botDelay || 1000)
  // ]
}
