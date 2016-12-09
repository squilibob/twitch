// Javascript helper functions
function dehash(channel) {
 return typeof(channel) == 'string' ? channel.replace(/^#/, '') : channel;
}

function capitalize(n) {
 return n[0].toUpperCase() + n.substr(1);
}

function checkDelay(channel, command, seconds) {
 channel = dehash(channel);
 if (!cmdTimestamps[channel]) {
  cmdTimestamps[channel] = {};
  return true;
 }
 if (!cmdTimestamps[channel][command]) {
  return true;
 }
 var currentTime = new Date().getTime() / 1000;
 if (currentTime - cmdTimestamps[channel][command] >= seconds) {
  return true;
 }
 return false;
}

function setDelay(channel, command) {
 channel = dehash(channel);
 if (!cmdTimestamps[channel]) cmdTimestamps[channel] = {};
 // Update the time in "cmdTimestamps" variable to the last time the command was executed (now)..
 cmdTimestamps[channel][command] = new Date().getTime() / 1000;
}

function htmlEntities(html) {
 function it() {
  return html.map(function(n, i, arr) {
   if (n.length == 1) {
    return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
     return '&#' + i.charCodeAt(0) + ';';
    });
   }
   return n;
  });
 }
 var isArray = Array.isArray(html);
 if (!isArray) {
  html = html.split('');
 }
 var parser = html;
 html = it(parser);

 if (!isArray) html = html.join('');
 return html;
}

function checkImageExists(imageUrl, callBack) {
 var imageData = new Image();
 imageData.onload = function() {
  callBack(true);
 };
 imageData.onerror = function() {
  callBack(false);
 };
 imageData.src = imageUrl;
}


function chatNotice(information, noticeFadeDelay, level, additionalClasses) {
 var ele = document.createElement('li');

 ele.className = 'chat-line chat-notice';
 ele.innerHTML = information;

 if (additionalClasses !== undefined) {
  if (Array.isArray(additionalClasses)) {
   additionalClasses = additionalClasses.join(' ');
  }
  ele.className += ' ' + additionalClasses;
 }

 if (typeof level == 'number' && level != 0) {
  ele.dataset.level = level;
 }

 chat.appendChild(ele);

 if (typeof noticeFadeDelay == 'number') {
  setTimeout(function() {
   ele.dataset.faded = '';
  }, noticeFadeDelay || 500);
 }

 return ele;
}

var recentTimeouts = {};

function timeout(channel, username) {
 if (!doTimeouts) return false;
 if (!recentTimeouts.hasOwnProperty(channel)) {
  recentTimeouts[channel] = {};
 }
 if (!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000 * 10 < +new Date) {
  recentTimeouts[channel][username] = +new Date;
  chatNotice(capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-timeout')
 };
 var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message');
 for (var i in toHide) {
  var h = toHide[i];
  if (typeof h == 'object') {
   h.innerText = '<Message deleted>';
   h.parentElement.className += ' chat-timedout';
  }
 }
}

function clearChat(channel) {
 if (!doChatClears) return false;
 var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]');
 for (var i in toHide) {
  var h = toHide[i];
  if (typeof h == 'object') {
   h.className += ' chat-cleared';
  }
 }
 chatNotice('Chat was cleared in channel ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-clear')
}

function hosting(channel, target, total, unhost) {
 if (!showHosting) return false;
 if (total == '-') total = 0;
 var chan = dehash(channel);
 chan = capitalize(chan);
 if (!unhost) {
  var targ = capitalize(target);
  chatNotice(chan + ' is now hosting ' + targ + ' for ' + total + ' viewer' + (total !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes');
 } else {
  chatNotice(chan + ' is no longer hosting.', null, null, 'chat-hosting-no');
 }
}

function submitchat(text) {
 client.say(channels[0], text);
}

function showcommands(channel) {
 chan = dehash(channel);
 if (checkDelay(channel, 'cmd', 10)) {
  setDelay(channel, 'cmd');
  submitchat('bot commands: !vote !signup !enter !battle !raffle !fc !uptime !follow !level reload me');
   //~Chat custom commands~: ' + Object.keys(commandlist).join(', '));
 }
 // chatNotice('the current commands available in ' + channel + ' are:', 12000, 1);
}

function parseraffle (raff) {
  var justentered = [];
  var updated = {};
  for (person in raff) {
    if (participants[raff[person].id] == undefined && raff[person].entered) {
      justentered.push(raff[person].id);
      updated[raff[person].id] = raff[person].chance;
    }
    else if (raff[person].entered) {
      updated[raff[person].id] = raff[person].chance;
    }
  }
  participants = updated;
  if (justentered.length > 0) submitchat(justentered.join(', ') + ' has been entered into the raffle');
}