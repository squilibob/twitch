const {dehash, capitalize, hosting, timeout, clearChat, submitchat, dequeue, parseraffle, urlDecode, isMod, checkPoke, checkDb, checkMoves, checkExist, getChunks} = require('./chat/chatfunctions')
const {getBitImage} = require('./chat/user')
const {checkAvatar, getViewers, getStart, checkfollowers, checkstreamer, getName} = require('./chat/chatapi')
const {parseMessage} = require('./chat/chatbackend')
const {followerhook, streaminghook} = require('./webhooks')
const addListeners = require('./chat/customlisteners')
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

module.exports = function (Twitch) {
  Twitch.channel = dehash(Twitch.channel)
  global.chatqueue[Twitch.id] = new Store(Twitch.backlog, ['message'])
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

  alerts.on('follower', async function (obj) {
      chatqueue[Twitch.id].store('follower', {username: await getName(obj.from_id, Twitch), number:Twitch.followers || 0})
      chatqueue[Twitch.id].store('notice', {text: await getName(obj.from_id, Twitch) + ' is now following (follower #' + Object.keys(Twitch.followers).length.toLocaleString()+ ')', fadedelay: 20000, level:1})
  })

  // client.addListener('ban', function(channel, username, reason) {
  // })
  // client.addListener("cheer", function (channel, userstate, message) {
  //   console.log('userstate, message', userstate, message)
  //   chatqueue[Twitch.id].store('bits', {userstate: userstate, message: message, url: getBitImage(userstate.bits)})
  //   chatqueue[Twitch.id].store('texttopika', {chunks: getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + userstate['display-name'] + ')'})
  // })
  // client.addListener('crash', function () { chatqueue[Twitch.id].store('notice', {text:'Crashed', fadedelay:10000, level:4, class: 'chat-crash' }) })
  // client.addListener('clearchat', channel => clearChat(channel, Twitch))
  // client.addListener('connected', async function (address, port) {
  //   showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Connected', fadedelay:1000, level:-2, class: 'chat-connection-good-connected'})
  //   joinAnnounced = []
  //   // chatqueue[Twitch.id].store('notice', {text: 'followers ' + await followerhook(Twitch.id).catch(console.error), fadedelay:2000, level:-2, class:'chat-connection-good-connecting'})
  //   // chatqueue[Twitch.id].store('notice', {text: 'online check ' + await streaminghook(Twitch.id).catch(console.error), fadedelay:2000, level:-3, class:'chat-connection-good-connecting'})
  // })
  // client.addListener('connecting', function (address, port) { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text: address + ':' + port, fadedelay:1000, level:-4, class:'chat-connection-good-connecting'}) })
  // client.addListener('connectfail', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Connection failed', fadedelay:1000, level:3, class: 'chat-connection-bad-fail' }) })
  // client.addListener('disconnected', function (reason) {
  //   showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Disconnected: ' + (reason || ''), fadedelay:3000, level:2, class: 'chat-connection-bad-disconnected'})
  //   client.connect()
  // })
  // client.addListener('emoteonly', function(channel, enabled) {
  // })
  // client.addListener('emotesets', function(sets, obj) {
  // })
  // client.addListener('followersonly', function(channel, enabled, length) {
  // })
  // client.addListener('hosted', function (channel, username, viewers, autohost) {
  //     chatqueue[Twitch.id].store('host', {type: 'hosted', channel:channel, username:username, viewers:viewers, autohost:autohost})
  // })
  // client.addListener('hosting', function (channel, target, viewers) {
  //     chatqueue[Twitch.id].store('host', {type: 'hosting', channel:channel, username:target, viewers:viewers})
  // })
  // client.addListener('join', async function (channel, username) {
  //   if (!joinAnnounced.includes(channel)) {// (username == client.getUsername()) {
  //     showConnectionNotices && chatqueue[Twitch.id].store('notice', {text:'Joined ' + capitalize(dehash(channel)), fadedelay:1000, level:-1, class: 'chat-room-join'})
  //     joinAnnounced.push(channel)
  //     Twitch.followers = checkfollowers(Twitch)
  //   }
  // })
  // client.addListener('logon', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Authenticating', fadedelay:1000, level:-3, class: 'chat-connection-good-logon' }) })

  //   /*Message - Received a message. can be any of:
  //   Action - Received action message on channel.
  //   Chat - Received message on channel.
  //   Whisper - Received a whisper.*/
  // client.addListener('message', async function (channel, user, message, self) {
  //   if (user.username === 'mikuia') return false
  //   if (!usercache.has(user.username)) {
  //     let avatar = await dbcall.getavatar('Users', user.username).catch(console.error) || -1
  //     let cards = await dbcall.getcards('Users', user.username).catch(console.error)
  //     let card = Array.isArray(cards) && cards.length ? cards.shift() : {poke: ~~(Math.random()*802), level: 1}
  //     usercache.set(user.username, {
  //       avatar: ~avatar ? avatar : await checkAvatar(user['user-id'], Twitch).catch(console.error),
  //       badge: await dbcall.getbadge('Users', user.username).catch(console.error),
  //       card: card
  //     })
  //     let obj = await checkstreamer(user['user-id']).catch(console.error)
  //     if (((user || {})['user-id'] || {}) !== Twitch.id && !self && obj.metrics.followers && obj.metrics.followers > Twitch.shoutout) {
  //       streamers.push(user.username)
  //       chatqueue[Twitch.id].store('displaystreamer', obj)
  //       submitchat('Check out ' + obj.username + ' at ' + obj.url, Twitch.id)
  //     }
  //     if (~card) chatqueue[Twitch.id].store('receive new player', {poke: card, name: user.username})
  //   }
  //   parseMessage(Twitch, user, channel, message, self, usercache.get(user.username)).catch(console.error)
  // })
  // client.addListener('mod', function(channel, username) {
  // })
  // client.addListener('mods', function(channel, mods) {
  // })
  // client.addListener('notice', function(channel, msgid, message) {

  //     already_banned: X is already banned in this room.
  //     already_emote_only_on: This room is already in emote-only mode.
  //     already_emote_only_off: This room is not in emote-only mode.
  //     already_subs_on: This room is already in subscribers-only mode.
  //     already_subs_off: This room is not in subscribers-only mode.
  //     bad_ban_admin: You cannot ban admin X.
  //     bad_ban_broadcaster: You cannot ban the broadcaster.
  //     bad_ban_global_mod: You cannot ban global moderator X.
  //     bad_ban_self: You cannot ban yourself.
  //     bad_ban_staff: You cannot ban staff X.
  //     bad_commercial_error: Failed to start commercial.
  //     bad_host_hosting: This channel is already hosting X.
  //     bad_host_rate_exceeded: Host target cannot be changed more than 3 times every half hour.
  //     bad_mod_mod: X is already a moderator of this room.
  //     bad_mod_banned: X is banned in this room.
  //     bad_timeout_admin: You cannot timeout admin X.
  //     bad_timeout_global_mod: You cannot timeout global moderator X.
  //     bad_timeout_self: You cannot timeout yourself.
  //     bad_timeout_staff: You cannot timeout staff X.
  //     bad_unban_no_ban: X is not banned from this room.
  //     bad_unmod_mod: X is not a moderator of this room.
  //     ban_success: X is now banned from this room.
  //     cmds_available: Commands available to you in this room (use /help for details)..
  //     color_changed: Your color has been changed.
  //     commercial_success: Initiating X second commercial break. Please keep in mind..
  //     emote_only_on: This room is now in emote-only mode.
  //     emote_only_off: This room is no longer in emote-only mode.
  //     hosts_remaining: X host commands remaining this half hour.
  //     host_target_went_offline: X has gone offline. Exiting host mode
  //     mod_success: You have added X as a moderator of this room.
  //     msg_banned: You are permanently banned from talking in channel.
  //     msg_censored_broadcaster: Your message was modified for using words banned by X.
  //     msg_channel_suspended: This channel has been suspended.
  //     msg_duplicate: Your message was not sent because you are sending messages too quickly.
  //     msg_emoteonly: This room is in emote only mode.
  //     msg_ratelimit: Your message was not sent because you are sending messages too quickly.
  //     msg_subsonly: This room is in subscribers only mode. To talk, purchase..
  //     msg_timedout: You are banned from talking in X for Y more seconds.
  //     msg_verified_email: This room requires a verified email address to chat.
  //     no_help: No help available.
  //     no_permission: You don't have permission to perform that action.
  //     not_hosting: No channel is currently being hosted.
  //     timeout_success: X has been timed out for length seconds.
  //     unban_success: X is no longer banned from this room.
  //     unmod_success: You have removed X as a moderator of this room.
  //     unrecognized_cmd: Unrecognized command: X
  //     usage_ban: Usage: "/ban " - Permanently prevent a user from chatting..
  //     usage_clear: Usage: "/clear" - Clear chat history for all users in this room.
  //     usage_color: Usage: "/color " - Change your username color. Color must be..
  //     usage_commercial: Usage: "/commercial [length]" - Triggers a commercial.
  //     usage_disconnect: Usage: "/disconnect" - Reconnects to chat.
  //     usage_emote_only_on: Usage: "/emoteonly" - Enables emote-only mode..
  //     usage_emote_only_off: Usage: "/emoteonlyoff" - Disables emote-only mode..
  //     usage_help: Usage: "/help" - Lists the commands available to you in this room.
  //     usage_host: Usage: "/host " - Host another channel. Use "unhost" to unset host mode.
  //     usage_me: Usage: "/me " - Send an "emote" message in the third person.
  //     usage_mod: Usage: "/mod " - Grant mod status to a user. Use "mods" to list the..
  //     usage_mods: Usage: "/mods" - Lists the moderators of this channel.
  //     usage_r9k_on: Usage: "/r9kbeta" - Enables r9k mode. See http://bit.ly/bGtBDf for details.
  //     usage_r9k_off: Usage: "/r9kbetaoff" - Disables r9k mode.
  //     usage_slow_on: Usage: "/slow [duration]" - Enables slow mode..
  //     usage_slow_off: Usage: "/slowoff" - Disables slow mode.
  //     usage_subs_on: Usage: "/subscribers" - Enables subscribers-only mode..
  //     usage_subs_off: Usage: "/subscribersoff" - Disables subscribers-only mode.
  //     usage_timeout: Usage: "/timeout [duration]" - Temporarily prevent a user from chatting.
  //     usage_unban: Usage: "/unban " - Removes a ban on a user.
  //     usage_unhost: Usage: "/unhost" - Stop hosting another channel.
  //     usage_unmod: Usage: "/unmod " - Revoke mod status from a user..
  //     whisper_invalid_self: You cannot whisper to yourself.
  //     whisper_limit_per_min: You are sending whispers too fast. Try again in a minute.
  //     whisper_limit_per_sec: You are sending whispers too fast. Try again in a second.
  //     whisper_restricted_recipient: That user's settings prevent them from receiving this whisper.

  // })
  // client.addListener('part', function (channel, username) {
  //   //joinAnnounced.includes(channel) && joinAnnounced.splice(joinAnnounced.indexOf(channel), 1)
  // })
  // client.addListener('raid', function({ channel, raider, viewers, userstate }) {
  // })
  // client.addListener('reconnect', function () { if (showConnectionNotices) chatqueue[Twitch.id].store('notice', {text:'Reconnected', fadedelay:1000, level:-3, class: 'chat-connection-good-reconnect' }) })
  // client.addListener('resub', function(
  //   channel,
  //   username,
  //   months,
  //   message,
  //   userstate,
  //   methods,
  // ) {

  // })
  // client.addListener('ritual', function({ channel, username, type, userstate }) {

  // })
  // client.addListener('slowmode', function(channel, enabled, length) {

  // })
  // client.addListener('subgift', function(channel, username, recipient, method, userstate) {

  // })
  // client.addListener('subscribers', function(channel, enabled) {

  // })
  // client.addListener("subscription", function (channel, username, method, message, userstate) {
  //   if (!userstate) userstate = username
  //   if (!message) message = 'new subscriber'
  //     console.log('username, method, message, userstate', username, method, message, userstate)
  //     chatqueue[Twitch.id].store('subscriber', {username: username, method: method, message: message})
  //     chatqueue[Twitch.id].store('texttopika', {chunks: getChunks(message), message: 'pikachu said:\n' + message + '\n(from ' + username + ' new subscriber)'})
  // })
  // client.addListener('timeout', (channel, username, reason, duration) => timeout(channel, username, reason, duration, Twitch))
  // client.addListener('unhost', function (channel, viewers) {
  //     chatqueue[Twitch.id].store('host', {type: 'stopped', channel:channel, viewers:viewers})
  // })
  // client.addListener('unmod', function(channel, username) {
  // })

  addListeners(Twitch)
  client.connect()

  let timers = [
    setInterval(dequeue, 1000 * botDelay, botDelay, Twitch.id)
  ]
}
