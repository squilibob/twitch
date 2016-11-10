 function displaystreamer(username, banner, followamount, views, url) {
  console.log(followamount, minfollowerstoshoutout);
  if (!followamount || followamount <= minfollowerstoshoutout) return false;
  console.log(username, banner, followers, views, url);
  if(banner == null) banner = defaultavatar;
  var chatLine = document.createElement('li');
  var chatLineBanner = document.createElement('li');
  var chatBanner = document.createElement('img');
  var chatStreamerName = document.createElement('div');
  var chatStreamerFollowers = document.createElement('div');
  var chatStreamerViews = document.createElement('div');
  chatLine.ondblclick = function() {
   this.className = 'chat-kill';
   setTimeout(this.remove(), 2000);
  };
  chatLine.className = 'chat-line';
  chatStreamerName.className = 'chat-shoutout';
  chatStreamerFollowers.className = 'chat-shoutout';
  chatStreamerViews.className = 'chat-shoutout';
  chatLineBanner.appendChild(chatBanner);
  chatBanner.className = 'chat-image';
  chatBanner.src = banner;
  chatStreamerName.innerHTML = username;
  chatStreamerFollowers.innerHTML = followamount + ' followers';
  chatStreamerViews.innerHTML = views + ' views';
  chatLine.appendChild(chatStreamerName);
  chatLine.appendChild(chatStreamerFollowers);
  chatLine.appendChild(chatStreamerViews);
  chatBanner.onload = function() {
   chat.appendChild(chatLineBanner);
   chat.appendChild(chatLine);
   client.say(channels[0], 'check out ' + username + ' at ' + url);
  }
 }

 function handleChat(channel, user, message, self) {
  if (user["message-type"] != 'chat' && user["message-type"] != 'action') return false;

  var chan = dehash(channel),
   image,
   response,
   avatar;

  if (useravatars[user.username] == undefined) {
   socket.emit('request avatar', channel, user, message, self);
   socket.emit('request badge', user);
   if (user.username != chan && !self) checkstreamer(user.username);
  } else {
   if (useravatars[user.username] < 0) {
    if (typeof useravatars[user.username] == "number")
     client.api({
      url: 'https://api.twitch.tv/kraken/users/' + user.username + clientid
     }, function(err, res, body) {
      if (body.logo)
       checkImageExists(body.logo, function(existsImage) {
        if (existsImage) {
         useravatars[user.username] = body.logo;
        }
       });
     });
   }
   // else if (typeof(useravatars[user.username]) == 'number') preloadavatar.src = '/avatars/'+useravatars[user.username]+'.png';

   var substitutions = {
    ' me ': ' ' + user.username + ' ',
    'someone': viewers[Math.ceil(Math.random() * viewers.length) - 1]
     // number random
     // link to someone's twitch stream
   };
   var question = ['?', 'do', 'what', 'when', 'where', 'how', 'does', 'can', 'will', 'are', 'which']; //'who ', 'why ', 'did ',
   var containsquestion = false;
   if (message.toLowerCase().indexOf('!raid') >= 0)
    if (user.username == dehash(channel)) self = true;
   if (self == true) {
    if (message.toLowerCase().indexOf('!raid') >= 0) {
     var target = message.slice(message.toLowerCase().indexOf('!raid')).split(' ');
     target = target[1];
     if (target.length > 3) {
      submitchat('we are now going to raid ' + target + ' please go to http://twitch.tv/' + target + ' and type the raid message:');
      submitchat('тo proтecт тнe cнaт froм devasтaтιon, тo υnιтe spaммers wιтнιn oυr naтιon, тo denoυnce тнe evιls of вans and мods, тo eхтend oυr spaм тo тнe space aвove. copy! pasтe! тwιтcн cнaт, scroll aт тнe speed of lιgнт! Ragequιт now or prepare тo fιgнт!');
      submitchat('make sure you type it into the chat of ' + target + '  at http://twitch.tv/' + target + ' !');
     }
    }
   } else {
    var checkall = message.split(' ');
    extensionloop: for (var i = 0; i < checkall.length; i++) {
     if (checkall[i].toLowerCase().indexOf('.png') >= 0 || checkall[i].toLowerCase().indexOf('.gif') >= 0 || checkall[i].toLowerCase().indexOf('.jpg') >= 0) {
      image = checkall[i];
      message = message.slice(0, message.indexOf(checkall[i])) + message.slice(message.indexOf(checkall[i]) + checkall[i].length + 1);
     }
     checkquestionloop: for (var word = 0; word < question.length; word++) {
      if (checkall[i].toLowerCase().indexOf(question[word]) >= 0) containsquestion = true;
     }
    }
    if (containsquestion == true)
     if (message.toLowerCase().indexOf('tm') >= 0) {
      var findtm = parseInt(message.slice(message.toLowerCase().indexOf('tm') + 2, message.toLowerCase().indexOf('tm') + 5));
      if (findtm > 0 && findtm < 101)
       tmnameloop: for (var key in tm[findtm - 1]) response = 'TM' + findtm + ' ' + key + ' can be obtained at ' + tm[findtm - 1][key];
      else {
       tmnumberloop: for (num = 1; num < 101; num++) {
        tmnamefromnumberloop: for (var key in tm[num - 1])
         if (message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'TM' + num + ' ' + key + ' can be obtained at ' + tm[num - 1][key];
       }
      }
     }
    if (containsquestion == true)
     if (message.toLowerCase().indexOf('hm') >= 0) {
      var findtm = parseInt(message.slice(message.toLowerCase().indexOf('hm') + 2, message.toLowerCase().indexOf('hm') + 5));
      if (findtm > 0 && findtm < 8)
       hmloop: for (var key in hm[findtm - 1]) response = 'HM' + findtm + ' ' + key + ' can be obtained at ' + hm[findtm - 1][key];
      else {
       hmnumberloop: for (num = 1; num < 8; num++) {
        hmnamefromnumberloop: for (var key in hm[num - 1])
         if (message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'HM' + num + ' ' + key + ' can be obtained at ' + hm[num - 1][key];
       }
      }
     }
    if (containsquestion == true)
     if (message.toLowerCase().indexOf('hidden power') >= 0) {
      hiddenpowerloop: for (hptype in hiddenpower)
      if (message.toLowerCase().indexOf(hptype) >= 0) response = 'in order to get hidden power '+ hptype +' your pokemon needs IVs to be hp: ' + hiddenpower[hptype][0] + ' att: ' + hiddenpower[hptype][1] + ' def: ' + hiddenpower[hptype][2] + ' sp. att: ' + hiddenpower[hptype][3] + ' sp. def: ' + hiddenpower[hptype][4] + ' speed: ' + hiddenpower[hptype][5];
     }
     if (message.toLowerCase().indexOf('!sign') >= 0) {
      var fc = [];
      var validfc = true;
      if (message.toLowerCase().indexOf('-') >= 0) {
       var ign;
       var fcindex = message.indexOf('-') - 4;
       var fccode = message.substr(fcindex, 14);
       var parseign = message.substr(0, message.indexOf(fccode)) + message.substr(message.indexOf(fccode) + fccode.length);
       parseign.trim(' ').split(' ').forEach((name, index) => {
        if (name.indexOf('!') < 0 && name.toLowerCase() != 'fc' && name.toLowerCase() != 'ign' && name.toLowerCase() != 'name') ign = name;
       });
       fccode.split('-').forEach((fcnumber, index) => {
        fc.push(fcnumber);
       });
       if (fc.length != 3) validfc = false;
       validfcloop: for (number in fc) {
        if (!(fc[number] > 0 && fc[number] < 10000)) validfc = false;
       }
       if (!ign) validfc = false;
       payload = {
        id: user.username,
        ign: ign,
        fc: fc
       }
       if (validfc) {
        socket.emit('new user', payload);
        response ='create: twitch username: ' + user.username + ' IGN: ' + ign + ' fc: '+ fc.join('-');
       }
       else response = fc.join('-') + ' ' + ign + ' is invalid combination of fc and ign';
      } else response = message + ' invalid please include your ign and fc like this: !signup squilibob 3609-1058-1166';
     }
    if (message.toLowerCase().indexOf('fc') >= 0) {
     var notyou = null;
     fcloop: for (person in useravatars)
      if (message.toLowerCase().indexOf(person.toLowerCase()) >= 0) notyou = person.toLowerCase();
     socket.emit('request user fc', notyou == null ? user.username.toLowerCase() : notyou);
    }
    if (message.toLowerCase().indexOf('reload me') >= 0) {
     delete useravatars[user.username];
     socket.emit('request avatar', chan, user, user.username + ': reloaded avatar image', self);
     socket.emit('request badge', user);
    }
    if (message.toLowerCase().indexOf('!enter') >= 0) {
     socket.emit("manually enter raffle", user.username, Math.floor(Math.random() * 719));
    }
    // if (message.toLowerCase().indexOf('!password') >= 0) {
    //  socket.emit("resend password", user.username);
    // }
    if (message.toLowerCase().indexOf('!cmd') >= 0 || message.toLowerCase().indexOf('!command') >= 0) showcommands(chan);
    if (message.toLowerCase().indexOf('uptime') >= 0) {
     var now = new Date();
     var uptime = now - started;
     if ((checkDelay(channel, 'uptime', 120)) && !(isNaN(uptime))) {
      setDelay(channel, 'uptime');
      var hours = Math.floor((uptime % 86400000) / 3600000);
      var minutes = Math.floor(((uptime % 86400000) % 3600000) / 60000);
      response = ('Stream has been live for ' + hours + (minutes < 10 ? ':0' : ':') + minutes);
     }
    }
    if (containsquestion == true) {
     var dexno = -1;
     var sp = false;

     var command = message.toLowerCase().split(' ');
     mewtwoloop: for (var i = 0; i < command.length; i++) {
      if (command[i].indexOf('mewtwo') >= 0) dexno = 149;
      else
       pokemonnameloop: for (var pokes = 0; pokes < maxpokes; pokes++)
        if (command[i].indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) dexno = pokes;
     }
     if (dexno >= 0) {
      if (message.indexOf('egg group') >= 0 && pokedex[dexno]['Egg Group I'])
       if (pokedex[dexno]['Egg Group II'] && pokedex[dexno]['Egg Group II'] != ' ') response = pokedex[dexno].Pokemon + ' is in egg groups ' + pokedex[dexno]['Egg Group I'] + ' & ' + pokedex[dexno]['Egg Group II'];
       else response = pokedex[dexno].Pokemon + ' is in egg group ' + pokedex[dexno]['Egg Group I'];
      testtypeloop: for (var i = 0; i < command.length; i++) {
       if (command[i].indexOf('type') >= 0 && pokedex[dexno].Secondary) {
        response = pokedex[dexno].Pokemon + ' types are ' + pokedex[dexno].Type + '/' + pokedex[dexno].Secondary;
       } else {
        sploop: for (var key in pokedex[dexno]) {
         if (i + 1 < command.length && command[i] == 'sp.') {
          sp = true;
          if (command[i] + ' ' + command[i + 1] == key.toLowerCase()) {
           if (pokedex[dexno][key])
            response = pokedex[dexno].Pokemon + ' ' + key + ': ' + pokedex[dexno][key];
          }
         } else {
          if (command[i] == key.toLowerCase() && key != 'Pokemon' && sp == false) {
           if (pokedex[dexno][key]) response = pokedex[dexno].Pokemon + ' ' + key + ': ' + pokedex[dexno][key];
          }
         }
        }
       }
      }
     }
    }
    commandloop: for (var key in commandlist) {
     var command = key.split(' ');
     var exists = true;
     var dexno = -1;
     existsloop: for (var i = 0; i < command.length; i++) {
      command[i] = command[i].toLowerCase();
      if (command[i] == 'pokemon') {
       testifexistloop: for (var pokes = 0; pokes < maxpokes; pokes++) {
        if (message.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) dexno = pokes;
       }
      } else if (message.toLowerCase().indexOf(command[i]) < 0) exists = false;
     }

     if (exists) {
      if (checkDelay(channel, command[0], 10)) {
       setDelay(channel, command[0]);
       if (command[0] == '!raffle') {
        response = 'In the raffle: ';
        var participants = (JSON.parse(localStorage.getItem("participants"))); //.join(', ');
        var totalraffle = 0;
        totalloop: for (person in participants) {
         totalraffle += participants[person].chance;
        }
        enteredloop: for (person in participants) {
         if (participants[person].entered) response = response + participants[person].id + ' (' + Math.floor(participants[person].chance / totalraffle * 10000) / 100 + '%) ';
        }
       }
       if (containsquestion == true)
        if (command[0] == 'weak') {
          if (dexno >= 0) {
            response = pokedex[dexno].Pokemon + ' is weak to ' + weakTo(pokedex[dexno].Type, pokedex[dexno].Secondary).join(', ');
          }
          else {
             message.split(' ').forEach((weak, index) => {
              var list = weakTo(weak);
              if (list.length > 0) response = validatetype(weak) + ' is weak to ' + list.join(', ');
             });
           }
        }
       if (containsquestion == true)
        if (command[0] == 'resist' || command[0] == 'immun') {
          if (dexno >= 0) {
            var list = resistantTo(pokedex[dexno].Type, pokedex[dexno].Secondary);
            response = pokedex[dexno].Pokemon + ' is resistant to ' + (list.resist.length > 0 ? list.resist.join(', ') : 'nothing');
            if (list.immune.length > 0) response += ' and immune to ' + list.immune.join(', ');
          }
          else {
            message.split(' ').forEach((resistant, index) => {
            var list = resistantTo(resistant);
            if (list.resist.length > 0) response = validatetype(resistant) + ' is resistant to ' + list.resist.join(', ');
            if (list.immune.length > 0) response += ' and immune to ' + list.immune.join(', ');
            });
          }
        }
       if (containsquestion == true)
        if (command[0] == 'strong' || command[0] == 'effective') {
         message.split(' ').forEach((strength, index) => {
          var list = effective(strength);
          if (list.length > 0) response = validatetype(strength) + ' is super effective against ' + list.join(', ');
         });
        }

        // setDelay(channel, command[0]);
       var reply = commandlist[key];
       substitutionloop: for (var replace in substitutions) {
        var insert = substitutions[replace];
        if (reply.indexOf(replace) >= 0) reply = reply.slice(0, reply.indexOf(replace)) + insert + reply.slice(reply.indexOf(replace) + replace.length, reply.length);
       }
       if (containsquestion == true)
        if (command[0] == 'nature') {
         if (message.toLowerCase().indexOf('+') > 0 && message.toLowerCase().indexOf('-') > 0) {
          var plus = message.slice(message.toLowerCase().indexOf('+') + 1).split(' ');
          var minus = message.slice(message.toLowerCase().indexOf('-') + 1).split(' ');
          if (plus[0].toLowerCase() == 'special') plus = plus[0] + ' ' + plus[1];
          else plus = plus[0];
          if (minus[0].toLowerCase() == 'special') minus = minus[0] + ' ' + minus[1];
          else minus = minus[0];
          detectnaturesloop: for (var count = 0; count < natures.length; count++) {
           if (natures[count].increase)
            if (natures[count].increase.toLowerCase() == plus.toLowerCase() &&
             natures[count].decrease.toLowerCase() == minus.toLowerCase())
             reply = natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease;
          }
         } else
          shownatureloop: for (var count = 0; count < natures.length; count++) {
           if (message.toLowerCase().indexOf(natures[count].nature.toLowerCase()) >= 0) reply = (natures[count].increase ? natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease : natures[count].nature + ' is neutral');
          }
        }
       if (containsquestion == true)
        if (dexno >= 0) {
         if (command[0] == 'evol') {
          if (pokedex[dexno].Prevo) {
           reply += pokedex[dexno].Pokemon + ' evolves from ' + pokedex[dexno].Prevo;
           if (pokedex[dexno].Evolve) reply += ' (' + pokedex[dexno].Evolve + ') ';
          } else if (!(pokedex[dexno].Evos)) reply = pokedex[dexno].Pokemon + ' has no evolutions';
          if (pokedex[dexno].Evos.length > 0)
           reply += pokedex[dexno].Pokemon + ' evolves into ';
          evolutionsloop: for (var count = 0; count < pokedex[dexno].Evos.length; count++) {
           reply += pokedex[dexno].Evos[count];
           reply += ' (' + pokedex[findpoke(pokedex[dexno].Evos[count])].Evolve + ') ';
           if (count + 2 == pokedex[dexno].Evos.length) reply += ' and ';
           else if (count + 1 < pokedex[dexno].Evos.length) reply += ', ';
          }
         } else {
          if (command[0] == 'find' || command[0] == 'route' || command[0] == 'locat' || command[0] == 'obtain' || command[0] == 'catch') {
           if (pokedex[dexno].locationORAS) reply += pokedex[dexno].Pokemon + ' ORAS locations: ' + pokedex[dexno].locationORAS;
           else reply = 'No location in ORAS for ' + pokedex[dexno].Pokemon;
          }
         }
        }
       if (reply != message && reply != '') response = reply;

      }
     }
    }
   }
   putChat(channel, user, message, self, useravatars[user.username], image);
   if (response) submitchat(response);
  }
 }

 function putChat(chan, user, message, self, avatar, image) {
  var name = user.username,
   chatLine = document.createElement('li'),
   chatAlignment = document.createElement('div'),
   chatChannel = document.createElement('div'),
   chatName = document.createElement('span'),
   chatBadge,
   chatColon = document.createElement('span'),
   chatTime = document.createElement('span'),
   chatContainer = document.createElement('div'),
   chatMessage = document.createElement('div'),
   chatImage = document.createElement('img'),
   date = new Date();

  var color = useColor ? user.color : 'inherit';
  if (color === null) {
   if (!randomColorsChosen.hasOwnProperty(chan)) {
    randomColorsChosen[chan] = {};
   }
   if (randomColorsChosen[chan].hasOwnProperty(name)) {
    color = randomColorsChosen[chan][name];
   } else {
    color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    randomColorsChosen[chan][name] = color;
   }
  }
  if (color.indexOf('(') != color.indexOf(')')) {
   var colorstring = color.slice(color.indexOf('(') + 1, color.indexOf(')'));
   var colortemp = colorstring.split(',');
   var colortotal = 0;
   colorloop: for (var string = 0; string < colortemp.length; string++) colortotal += parseInt(colortemp[string]);
   if (colortotal > whitethreshold * 3) chatMessage.style.color = "#000000";
  }

  chatLine.ondblclick = function() {
   this.className = 'chat-kill';
   setTimeout(this.remove(), 2000);
  };
  chatLine.className = 'chat-line';
  chatLine.dataset.hide = '';
  chatLine.dataset.username = name;
  chatLine.dataset.channel = chan;

  if (user['message-type'] == 'action') {
   chatLine.className += ' chat-action';
  }
  chatChannel.className = 'chat-channel';
  chatChannel.innerHTML = chan;

  if (typeof useravatars[name] != 'number' || useravatars[name] < 0) {
   var chatAvatar = document.createElement('img');
   chatAvatar.className = 'chat-avatar';
   chatAvatar.dataset.hide = '';
   chatAvatar.src = (avatar == null || avatar == -1 ? defaultavatar : avatar);
  } else {
   var chatAvatar = document.createElement('span');
   chatAvatar.className = 'avs';
   var xpos = 64 * ((Useravatars.total - (useravatars[name] + 1) % 7));
   var ypos = 64 * (Useravatars.total - Math.floor((useravatars[name] + 1) / 7));
   chatAvatar.style = 'background-position:  ' + xpos + 'px  ' + ypos + 'px';
  }

  chatTime.className = 'chat-time';
  chatTime.innerHTML = String.fromCodePoint(date.getHours() > 12 ? 128323 + date.getHours() : (date.getHours() < 1 ? 128347 : 128335 + date.getHours())) + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2); //(not using seconds right now) + '.' + ('0' + date.getSeconds()).slice(-2) ;

  chatName.className = 'chat-name';
  chatName.style.color = color;
  chatName.innerHTML = user['display-name'] || name;
  // chatName.innerHTML = chatName.innerHTML.replace(/[^a-z+]+/gi, '');

  chatAlignment.className = 'chat-align';
  chatAlignment.appendChild(chatName);
  if (showBadges) {
   chatBadge = badges(chan, user, self)
   chatAlignment.appendChild(chatBadge);
  }
  chatAlignment.appendChild(chatTime);
  chatLine.appendChild(chatAlignment);

  chatColon.className = 'chat-colon-hide';
  chatColon.style.color = color;

  chatContainer.className = 'chat-message-container';
  chatContainer.dataset.hide = '';
  chatContainer.style.background = color;

  chatMessage.className = 'chat-message';
  chatMessage.dataset.hide = '';
  // chatMessage.style.background = color;
  chatMessage.innerHTML = showEmotes ? formatEmotes(message, user.emotes) : htmlEntities(message);
  chatMessage.innerHTML = pokify(chatMessage.innerHTML);
  chatMessage.innerHTML = ffz(chatMessage.innerHTML);
  chatMessage.innerHTML = bttv(chatMessage.innerHTML);

  if (image) checkImageExists(image, function(existsImage) {
   if (existsImage) {
    chatImage.src = image;
    chatImage.onclick = function() {
     console.log(this);
    }; //going to use this later to show a user's image fullscreen
    chatImage.className = 'chat-image';
    chatImage.onload = function() {
     chatMessage.appendChild(chatImage);
    };
   }
  });

  chatContainer.appendChild(chatMessage);

  if (client.opts.channels.length > 1 && showChannel) chatLine.appendChild(chatChannel);
  chatLine.appendChild(chatAvatar);
  chatLine.appendChild(chatColon);
  chatLine.appendChild(chatContainer);

  chatAvatar.onload = chat.appendChild(chatLine);
  // chatAvatar.onload = chatAvatar.src ? (chatAvatar.src != defaultavatar ? temp = (btoa(chatAvatar)) : null) : null ;

  if (typeof fadeDelay == 'number') {
   setTimeout(function() {
    chatLine.dataset.faded = '';
    chatMessage.dataset.faded = '';
    // chatMessage.style.opacity = 1;
    chatAvatar.dataset.faded = '';
    chatName.dataset.faded = '';
    chatName.style.color = '#ffffff';
    if (chatBadge) chatBadge.dataset.faded = '';
    chatTime.dataset.faded = '';
    chatImage.dataset.faded = '';
   }, fadeDelay);
  }
  setTimeout(function() {
   chatColon.className = 'chat-colon';
   delete chatLine.dataset.hide;
   delete chatMessage.dataset.hide;
   delete chatAvatar.dataset.hide;
  }, 64);

  while (document.getElementById('chat').offsetHeight > chatheight * 1.25) {
   var oldMessages = [].slice.call(chat.children).slice(0, 1);
   var logmsg = oldMessages[0]
   socket.emit('log chat', logmsg.innerHTML);
   oldMessages[0].remove();
   // var oldMessages = [].slice.call(chat.children).slice(0, 10);
   // for(var i in oldMessages) oldMessages[i].remove();
  }
  if (document.getElementById('chat').offsetHeight > chatheight) {
   chat.firstChild.className = 'chat-kill';
   chat.firstChild.dataset = null;
  }

 }
