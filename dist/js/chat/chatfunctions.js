// Javascript helper functions
function dehash (channel) {
  return typeof (channel) === 'string' ? channel.replace(/^#/, '') : channel
}

function capitalize (str) {
  return !!str ? str : str.replace(/^./,  String.toUpperCase)
}

function htmlEntities (html) {
  function it () {
    return html.map(function (n, i, arr) {
      if (n.length == 1) {
        return n.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
          return '&#' + i.charCodeAt(0) + ';'
        })
      }
      return n
    })
  }
  let isArray = Array.isArray(html)
  if (!isArray) {
    html = html.split('')
  }
  let parser = html
  html = it(parser)

  return isArray ? html.join('') : html
}

function checkImageExists (imageUrl, callBack) {
  let imageData = new Image()
  imageData.onload = function () {
    callBack(true)
  }
  imageData.onerror = function () {
    callBack(false)
  }
  imageData.src = imageUrl
}

function chatNotice (obj) {
  let ele = document.createElement('li')
  ele.className = 'chat-line chat-notice'
  ele.innerHTML = obj.text
  if (obj.class !== undefined) {
    if (Array.isArray(obj.class)) obj.class = obj.class.join(' ')
    ele.className += ' ' + obj.class
  }
  if (typeof obj.level === 'number' && obj.level != 0) ele.dataset.level = obj.level
  chat.appendChild(ele)
  if (typeof obj.fadedelay === 'number') {
    setTimeout(function () {
      ele.dataset.faded = ''
    }, obj.fadedelay || 500)
  }
    setTimeout(function () {
      ele.className = 'chat-kill'
      ele.dataset = null
      // [].slice.call(chat.children).pop().remove()
      setTimeout(function () {
        ele.remove()
      }, 2000)
    }, killDelay)

  return ele
}

function timeout (obj) {
  channel = obj.channel
  username = obj.username
  if (!doTimeouts) return false
  if (!recentTimeouts.hasOwnProperty(channel)) recentTimeouts[channel] = {}
  if (!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000 * 10 < +new Date()) {
    recentTimeouts[channel][username] = +new Date()
    chatNotice({text: capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), fadedelay:1000, level:1, class:'chat-delete-timeout'})
  }
  let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message')
  for (let i in toHide) {
    let h = toHide[i]
    if (typeof h === 'object') {
      h.innerText = '<Message deleted>'
      h.parentElement.className += ' chat-timedout'
    }
  }
}

function clearChat (channel) {
  if (!doChatClears) return false
  let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]')
  for (let i in toHide) {
    let h = toHide[i]
    if (typeof h === 'object') {
      h.className += ' chat-cleared'
    }
  }
  chatNotice({text: 'Chat was cleared in channel ' + capitalize(dehash(channel)), fadedelay:1000, level:1, class:'chat-delete-clear'})
}

function host (obj) {
  if (!showHosting) return false
  let text = {
    hosted: obj.username + ' is now hosting ' + capitalize(dehash(obj.channel)),
    hosting: capitalize(dehash(obj.channel)) + ' is now hosting ' + obj.username,
    stopped: capitalize(dehash(obj.channel)) + ' stopped hosting'
  }[obj.type] + (obj.viewers ? ' for ' + obj.viewers + ' viewer' + (obj.viewers !== 1 ? 's' : '') : '')
  chatNotice({text: text, fadedelay:null, level:null, class:'chat-hosting-yes'})
}

function urlDecode (message) {
  let checkall = message.split(' ')
  extensionloop: for (i in checkall) {
    // if (['.png', '.gif', '.jpg'].forEach())
    if (checkall[i].toLowerCase().indexOf('.png') >= 0 || checkall[i].toLowerCase().indexOf('.gif') >= 0 || checkall[i].toLowerCase().indexOf('.jpg') >= 0) {
      return {
        image: checkall[i],
        message: message.slice(0, message.indexOf(checkall[i])) + message.slice(message.indexOf(checkall[i]) + checkall[i].length + 1)
      }
    }
  }
  return {
    image: null,
    message: message
  }
}

function isMod (user) {
  if ((user || {}).badges) {
    if ('broadcaster' in user.badges) return true
    return user.mod
  }
  return false
}
