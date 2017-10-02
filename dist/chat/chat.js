function chatbot () {
  let joinAnnounced = []
  socket.on('chat', payload => handleChat(payload))
  socket.on('notice', payload => chatNotice(payload))
  socket.on('displaystreamer', payload => displaystreamer(payload))
  socket.on('clear', payload => clearChat(payload))
  socket.on('bits', payload => chatNotice({notice: payload.userstate.username + ' has donated ' + payload.userstate.bits + ' bits', fadedelay: 20000, level:1}))
  socket.on('subscriber', payload => chatNotice({notice: payload.username + ' has subscribed (' + payload.method + ')', fadedelay: 20000, level:1}))
  socket.on('timeout', payload =>  timeout(payload))
  socket.on('starthost', payload => hosting(payload.channel, payload.target, payload.total, true))
  socket.on('stophost', payload => hosting(payload, '-', '-', true))
  socket.on('follower', payload => chatNotice({notice: payload.username +  ' is now following (follower #' + Object.keys(payload.number).length.toLocaleString() + ')', fadedelay: 20000, level:1}))


  //justentered.length > 0 && submitchat(justentered.join(', ') + (justentered.length == 1 ? ' has' : ' have') + ' been entered into the raffle')
      // command -
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
  socket.emit('send raffle', true)
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
