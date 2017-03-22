 function displaystreamer(username, banner, followamount, views, url) {
  if (!followamount || followamount <= minfollowerstoshoutout) return false;
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
  chatStreamerFollowers.innerHTML = followamount.toLocaleString()  + ' followers';
  chatStreamerViews.innerHTML = views.toLocaleString()  + ' views';
  chatLine.appendChild(chatStreamerName);
  chatLine.appendChild(chatStreamerFollowers);
  chatLine.appendChild(chatStreamerViews);
  chatBanner.onload = function() {
   chat.appendChild(chatLineBanner);
   chat.appendChild(chatLine);
   submitchat('check out ' + username + ' at ' + url);
  }
 }

var parser = {
  '!bot': {
    altcmds: [],
    help: 'this command shows information about the bot',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      return 'This bot was created by squilibob. It is open source and available at https://github.com/squilibob/twitch';
    }
  },
  '!join': {
    altcmds: [],
    help: 'this command joins chat of another twitch streamers channel',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: true,
      pokemon: false,
      parameters: 1,
      modonly: true
    },
    action: function(obj){
      client.join(obj.parameters[0]);
      return false;
    }
  },
  '!raid': {
    altcmds: [],
    help: 'this command shows a raid message and link to a streamers channel',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: true
    },
    action: function(obj){
      if (!obj.parameters[0]) return false;
      client.say(obj.channel, '/me we are now going to raid ' + obj.parameters[0] + ' please go to http://twitch.tv/' + obj.parameters[0] + ' and type the raid message:');
      client.say(obj.channel, 'тo proтecт тнe cнaт froм devasтaтιon, тo υnιтe spaммers wιтнιn oυr naтιon, тo denoυnce тнe evιls of вans and мods, тo eхтend oυr spaм тo тнe space aвove. copy! pasтe! тwιтcн cнaт, scroll aт тнe speed of lιgнт! Ragequιт now or prepare тo fιgнт!');
      client.say(obj.channel, '/me make sure you type it into the chat of ' + obj.parameters[0] + '  at http://twitch.tv/' + obj.parameters[0] + ' !');
      return false;
    }
  },
  'tm': {
    altcmds: [],
    help: 'this command displays what a TM is based on its number or name',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1, //refactor
      modonly: false
    },
    action: function(obj){
      var response;
      var findtm = parseInt(obj.message.slice(obj.message.toLowerCase().indexOf('tm') + 2, obj.message.toLowerCase().indexOf('tm') + 5));
      if (findtm > 0 && findtm < 101)
       tmnameloop: for (var key in tm[findtm - 1]) response = 'TM' + findtm + ' ' + key + ' can be obtained at ' + tm[findtm - 1][key];
      else {
       tmnumberloop: for (num = 1; num < 101; num++) {
        tmnamefromnumberloop: for (var key in tm[num - 1])
         if (obj.message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'TM' + num + ' ' + key + ' can be obtained at ' + tm[num - 1][key];
       }
      }
      return response;
    }
  },
  'hm': {
    altcmds: [],
    help: 'this command displays what a HM is based on its name or number',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1, //refactor
      modonly: false
    },
    action: function(obj){
      var response;
      if (obj.message.toLowerCase().indexOf('hm') >= 0) {
       var findtm = parseInt(obj.message.slice(obj.message.toLowerCase().indexOf('hm') + 2, obj.message.toLowerCase().indexOf('hm') + 5));
       if (findtm > 0 && findtm < 8)
        hmloop: for (var key in hm[findtm - 1]) response = 'HM' + findtm + ' ' + key + ' can be obtained in ORAS at ' + hm[findtm - 1][key];
       else {
        hmnumberloop: for (num = 1; num < 8; num++) {
         hmnamefromnumberloop: for (var key in hm[num - 1])
          if (obj.message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'HM' + num + ' ' + key + ' can be obtained at ' + hm[num - 1][key];
        }
       }
      }
      return response;
    }
  },
  'hidden power': {
    altcmds: [],
    help: 'this command shows the IVs required to get a hidden power based on its type',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1, //refactor
      modonly: false
    },
    action: function(obj){
      var response;
      hiddenpowerloop: for (hptype in hiddenpower)
      if (obj.message.toLowerCase().indexOf(hptype) >= 0) response = 'in order to get hidden power '+ hptype +' your pokemon needs IVs to be hp: ' + hiddenpower[hptype][0] + ' att: ' + hiddenpower[hptype][1] + ' def: ' + hiddenpower[hptype][2] + ' sp. att: ' + hiddenpower[hptype][3] + ' sp. def: ' + hiddenpower[hptype][4] + ' speed: ' + hiddenpower[hptype][5];
      return response;
    }
  },
  '!sign': {
    altcmds: [],
    help: 'this command registers a viewers friend code and in game name',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 2,
      modonly: false
    },
    action: function(obj){
      var response;
      var fc = [];
      var validfc = true;
      if (obj.message.toLowerCase().indexOf('-') >= 0) {
       var ign;
       // var fcindex = obj.message.indexOf('-') - 4;
       // var fccode = obj.message.substr(fcindex, 14);
       var fccode = obj.message.match(/[0-9]{4}-[0-9]{4}-[0-9]{4}/)[0];
       var parseign = obj.message.substr(0, obj.message.indexOf(fccode)) + obj.message.substr(obj.message.indexOf(fccode) + fccode.length);
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
        id: obj.user.username,
        ign: ign,
        fc: fc
       }
       if (validfc) {
        socket.emit('new user', payload);
        response ='create: twitch username: ' + obj.user.username + ' IGN: ' + ign + ' fc: '+ fc.join('-');
       }
       else response = fc.join('-') + ' ' + ign + ' is invalid combination of fc and ign. Please include your ign and fc like this: !signup squilibob 3609-1058-1166';
      } else response = obj.message + ' invalid please include your ign and fc like this: !signup squilibob 3609-1058-1166';
      return response;
    }
  },
  '!fc': {
    altcmds: [' fc '],
    help: 'displays the users friend code or the FC of the person specified',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var notyou = null;
       fcloop: for (person in useravatars)
        if (obj.message.toLowerCase().indexOf(person.toLowerCase()) >= 0) notyou = person.toLowerCase();
       socket.emit('request user fc', notyou == null ? obj.user.username.toLowerCase() : notyou);
      return false;
    }
  },
  '!reload': {
    altcmds: [],
    help: 'this command resets the cached copy of the users avatar to the actual avatar',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
       delete useravatars[obj.user.username];
       socket.emit('request avatar', obj.channel, obj.user, obj.user.username + ': reloaded avatar image', false);
       socket.emit('request badge', obj.user);
      return false;
    }
  },
  '!enter': {
    altcmds: [],
    help: 'this command enters the user into the raffle',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      socket.emit("manually enter raffle", obj.user.username, Math.floor(Math.random() * 719));
      return false;
    }
  },
  '!leave': {
    altcmds: [],
    help: 'this command removes a user from the raffle',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      socket.emit("manually leave raffle", obj.user.username, Math.floor(Math.random() * 719));
      return false;
    }
  },
  '!vote': {
    altcmds: [],
    help: 'this command votes for a poll option',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
       var voteoption = obj.message.split(' ');
       (voteoption.length > 1 && voteoption[0].indexOf('!vote') >= 0) ? socket.emit("Send vote", {id: obj.user.username.toLowerCase(), vote: capitalize(voteoption[1].toLowerCase())}) : socket.emit("Show vote");
      return false;
    }
  },
  '!cmd': {
    altcmds: ['!command'],
    help: 'this command shows a list of all the commands',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var response = 'The bot keywords for ' + obj.channel + ' are';
      for (command in parser) {
        response += ' ' + command;
        if (parser[command].altcmds.length > 0) response += ' (or ' + parser[command].altcmds.join(' ') + ')';
      }
      return response;
    }
  },
  '!uptime': {
    altcmds: [],
    help: 'this command shows how long the stream has been live',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response;
      var now = new Date();
      var uptime = now - started;
      if ((isNaN(uptime))) {
        getStart(TwitchID);
      }
      else {
       var hours = Math.floor((uptime % 86400000) / 3600000); //should really simplify this
       var minutes = Math.floor(((uptime % 86400000) % 3600000) / 60000);
       response = ('Stream has been live for ' + hours + (minutes < 10 ? ':0' : ':') + minutes);
      }
      return response;
    }
  },
  '!viewers': {
    altcmds: [],
    help: 'this command shows how many people in chat and how many reported viewers from the API',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      return watching.chatters.length.toLocaleString() + ' in chat ' + watching.viewers.toLocaleString() + ' reported viewers';
    }
  },
  '!follow': {
    altcmds: [],
    help: 'this command shows how long the user has been following',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var response = obj.user.username + ' is not a follower';
      if (followers[obj.user.username.toLowerCase()]) response = obj.user.username + ' followed ' + followers[obj.user.username.toLowerCase()].followed;
      return response;
    }
  },
  'egg group': {
    altcmds: [],
    help: 'this command displays what egg groups a pokemon is in',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: 1,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response;
      if (obj.pokemon[0]['Egg Group I'])
       if (obj.pokemon[0]['Egg Group II'] && obj.pokemon[0]['Egg Group II'] != ' ') response = obj.pokemon[0].Pokemon + ' is in egg groups ' + obj.pokemon[0]['Egg Group I'] + ' & ' + obj.pokemon[0]['Egg Group II'];
       else if (obj.pokemon[0]['Egg Group I'].length) response = obj.pokemon[0].Pokemon + ' is in egg group ' + obj.pokemon[0]['Egg Group I'];
      return response;
    }
  },
  'ev': {
    altcmds: ['evs'],
    help: 'this command shows what effort values a defeated pokemon will yield',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: true,
      pokemon: 1,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var response;
       response = obj.pokemon[0].Pokemon + ' will reward the EVs:'
        evloop: for (ev in obj.pokemon[0].EVs) response += ' ' + obj.pokemon[0].EVs[ev] + ' x ' + ev
      return response;
    }
  },
  '!raffle': {
    altcmds: [],
    help: 'this command shows a users chance to win the raffle if they are in the raffle',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response;
      if (Object.keys(participants).length > 0) {
       response = Object.keys(participants).length + ' in the raffle: ';
       var totalraffle = 0;
       totalloop: for (person in participants) {
        totalraffle += participants[person];
       }
       if (participants[obj.user.username.toLowerCase()]) response = obj.user.username + ' has a ' + Math.floor(participants[obj.user.username] / totalraffle * 10000) / 100 + '% chance to win the raffle';
       else {
        if (obj.self || obj.user.username === obj.channel)
        enteredloop: for (person in participants) {
         response = response + person + ' (' + Math.floor(participants[person] / totalraffle * 10000) / 100 + '%) ';
        }
        else response = 'You must sign up to join raffles and then use !enter. Signup page: ' + websiteurl + ' or !signup';
       }
      }
      return response;
    }
  },
  'sound': {
    altcmds: [],
    help: 'this command plays the sound of the cry of a pokemon',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: 1,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      typeof(obj.pokemon[0].id === 'number') && socket.emit("pokemon cry", obj.pokemon[0].id);
      return false;
    }
  },  'weak': {
    altcmds: [],
    help: 'this command shows what types a pokemon is weak to',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response;
      if (obj.pokemon[0]) {
        response = obj.pokemon[0].Pokemon + ' is weak to ' + weakTo(obj.pokemon[0].Type, obj.pokemon[0].Secondary).join(', ');
      }
      else {
         obj.message.split(' ').forEach((weak, index) => {
          var list = weakTo(weak);
          if (list.length > 0) response = validatetype(weak) + ' is weak to ' + list.join(', ');
         });
       }
      return response;
    }
  },
  'resist': {
    altcmds: ['immun'],
    help: 'this command shows what types a pokemon resists or is immune to',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response = 'Does not resist anything';
        if (obj.pokemon[0]) {
          var list = resistantTo(obj.pokemon[0].Type, obj.pokemon[0].Secondary);
          response = obj.pokemon[0].Pokemon + ' is resistant to ' + (list.resist.length > 0 ? list.resist.join(', ') : 'nothing');
          if (list.immune.length > 0) response += ' and immune to ' + list.immune.join(', ');
        }
        else {
          message.split(' ').forEach((resistant, index) => {
          var list = resistantTo(resistant);
          if (list.resist.length > 0) response = validatetype(resistant) + ' is resistant to ' + list.resist.join(', ');
          if (list.immune.length > 0) response += ' and immune to ' + list.immune.join(', ');
          });
        }
      return response;
    }
  },
  'strong': {
    altcmds: ['effective'],
    help: 'this command shows what a type is effective against',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
     var response;
     obj.message.split(' ').forEach((strength, index) => {
      var list = effective(strength);
      if (list.length > 0) response = validatetype(strength) + ' is super effective against ' + list.join(', ');
     });
     return response;
    }
  },
  'evol': {
    altcmds: [],
    help: 'this command shows how a pokemon family evolves',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: 1,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var reply ='';
      var dexno = obj.pokemon[0];
       if (obj.pokemon[0].Prevo) {
        reply += obj.pokemon[0].Pokemon + ' evolves from ' + obj.pokemon[0].Prevo;
        if (obj.pokemon[0].Evolve) if (obj.pokemon[0].Evolve != 0) reply += ' (' + obj.pokemon[0].Evolve + ') ';
       } else if (!(obj.pokemon[0].Evos)) reply = obj.pokemon[0].Pokemon + ' has no evolutions';
       if (obj.pokemon[0].Evos.length > 0)
        reply += obj.pokemon[0].Pokemon + ' evolves into ';
       evolutionsloop: for (var count = 0; count < obj.pokemon[0].Evos.length; count++) {
        reply += obj.pokemon[0].Evos[count];
        reply += ' (' + pokedex[findpoke(obj.pokemon[0].Evos[count])-1].Evolve + ') ';
        if (count + 2 == obj.pokemon[0].Evos.length) reply += ' and ';
        else if (count + 1 < obj.pokemon[0].Evos.length) reply += ', ';
       }
       if (reply != obj.message && reply != '')
         return reply;
    }
  },
  'find': {
    altcmds: ['route', 'locat', 'obtain', 'catch'],
    help: 'this command shows the in game location of a pokemon',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: 1,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var reply ='';
      if (obj.pokemon[0].Location) reply += obj.pokemon[0].Pokemon + ' SuMo locations: ' + obj.pokemon[0].Location;
      else if (obj.pokemon[0].locationORAS) reply += obj.pokemon[0].Pokemon + ' ORAS locations: ' + obj.pokemon[0].locationORAS;
      else reply = 'No location in ORAS for ' + obj.pokemon[0].Pokemon;
      if (reply != obj.message && reply != '')
        return reply;
    }
  },
  '!battle': {
    altcmds: [],
    help: 'this command dispays help on how to battle',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      return 'We do raffles for battles. You must sign up to join raffles and then use !enter. Signup webpage: squi.li or !signup. !raffle will show if you are entered';
    }
  },
  'nature': {
    altcmds: [],
    help: 'this command shows what attributes a nature gives a pokemon',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var reply;
      if (obj.message.toLowerCase().indexOf('+') > 0 && obj.message.toLowerCase().indexOf('-') > 0) {
       var plus = obj.message.slice(obj.message.toLowerCase().indexOf('+') + 1).split(' ');
       var minus = obj.message.slice(obj.message.toLowerCase().indexOf('-') + 1).split(' ');
       if (plus[0].toLowerCase() == 'special') plus = plus[0] + ' ' + plus[1];
       else plus = plus[0];
       if (minus[0].toLowerCase() == 'special') minus = minus[0] + ' ' + minus[1];
       else minus = minus[0];
       detectnaturesloop: for (var count = 0; count < natures.length; count++) {
        if (natures[count].increase)
         if (natures[count].increase.toLowerCase() == plus.toLowerCase() &&
          natures[count].decrease.toLowerCase() == minus.toLowerCase())
          reply = natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease + ' and likes to eat ' + natures[count].favorite + ' berries';
       }
      } else
       shownatureloop: for (var count = 0; count < natures.length; count++) {
        if (obj.message.toLowerCase().indexOf(natures[count].nature.toLowerCase()) >= 0) reply = (natures[count].increase ? natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease + ' and likes to eat ' + natures[count].favorite + ' berries' : natures[count].nature + ' is neutral');
       }
      return reply;
    }
  },
  'abilit': {
    altcmds: [],
    help: 'this command displays the abilities of a pokemon',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response;
      abilityloop: for (ability in abilities) {
        if (obj.message.toLowerCase().indexOf(ability.toLowerCase()) >= 0)
          if (obj.message.toLowerCase().indexOf('pokemon') >= 0) {
            var hasability = [];
            for (testpoke of pokedex)
              for (testability of testpoke.Ability)
                if (testability == ability) hasability.push(testpoke.Pokemon);
            if (hasability.length) response = 'the pokemon with the ability ' + ability + ' are: ';
            if (hasability.length < response_length+1) response += hasability.join(', ');
            else {
                  pokemonthatcanlearnloop: for (var learnresponse=0; learnresponse<response_length-1; learnresponse++){
                  response += hasability[learnresponse] + ', ';
                }
                response += (hasability.length - response_length) + ' more';
            }
          }
          else response = ability + ': ' + abilities[ability];
      }
      return response;
    }
  },
  '!fuse': {
    altcmds: [],
    help: 'this command displays alexonsager fusion on the stream',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: 2,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      var fusion = 'http://images.alexonsager.net/pokemon/fused/'+ (obj.pokemon[0].id) + '/'+ (obj.pokemon[0].id) + '.' + (obj.pokemon[1].id) + '.png';
      if (typeof(obj.pokemon[0].id) == 'number' && typeof(obj.pokemon[1].id) == 'number')
        if (obj.pokemon[0].id > 0 && obj.pokemon[0].id < 152 && obj.pokemon[1].id > 0 && obj.pokemon[1].id < 152 ) {
          // handleChat(obj.channel, obj.user, '', true, -1, fusion);
          socket.emit('send fusion', obj.pokemon[0].id, obj.pokemon[1].id);
        }
      }
  },
  'stat': {
    altcmds: [],
    help: 'this command shows all stats of a pokemon',
    times: 0,
    requires :
    {
      question: true,
      display: true,
      exclusive: false,
      pokemon: 1,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      var response = obj.pokemon[0].Pokemon + ' stats: ';
      response += obj.pokemon[0].HP + '/';
      response += obj.pokemon[0].Attack + '/';
      response += obj.pokemon[0].Defense + '/';
      response += obj.pokemon[0]['Sp. Attack'] + '/';
      response += obj.pokemon[0]['Sp. Defense'] + '/';
      response += obj.pokemon[0].Speed;
      return response;
    }
  },
  '!bttv': {
    altcmds: [],
    help: 'this command incorporates the users bttv emotes into the database',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: true
    },
    action: function(obj){
      if (!self.fetch) {
          return
      }
      var bttvurl = obj.parameters.length ? 'https://api.betterttv.net/2/channels/' +  obj.parameters[0] : bttvemotesurl;
      fetch(bttvurl).then(function(response) {
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function(json) {
            if ((json || {}).emotes) {
              for (key in json.emotes) {
                socket.emit("Insert bttv", json.emotes[key]);
              }
              submitchat('loaded ' + json.emotes.length + ' emotes');
              socket.emit("Ask for table", 'Bttv');
            }
          });
        }
      });
    }
  },
  '!ffz': {
    altcmds: [],
    help: 'this command incorporates the users ffz emotes into the database',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: true
    },
    action: function(obj){
      if (!self.fetch) {
          return
      }
      var ffzurl = obj.parameters.length ? 'https://api.frankerfacez.com/v1/room/' +  obj.parameters[0] : ffzemotesurl;
      fetch(ffzurl).then(function(response) {
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function(json) {
            if ((json || {}).sets) {
              for (key in json.sets) {
                socket.emit("Insert ffz", json.sets[key]);
                submitchat('loaded ' + json.sets[key].emoticons.length + ' emotes from ' +json.sets[key].title);
              }
              socket.emit("Ask for table", 'Ffz');
            }
          });
        }
      });
    }
  },
  '!poll': {
    altcmds: [],
    help: 'this command sets up a poll based on the vote options given',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: true,
      pokemon: false,
      parameters: 1,
      modonly: true
    },
    action: function(obj){
      var title;
      var options = obj.message.substr(obj.message.toLowerCase().indexOf('!poll')+'!poll'.length).split('|');
      title = options.shift();
      for (voteoption in options) options[voteoption] = capitalize(options[voteoption]);
      if (options.length > 1) socket.emit("Vote poll", {options: options, title: title});
    }
  },
  '!showpoll': {
    altcmds: [],
    help: 'this command shows the poll on the stream',
    times: 0,
    requires :
    {
      question: false,
      display: true,
      exclusive: false,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      socket.emit("update vote");
    }
  },
  '!topsyturvy': {
    altcmds: [],
    help: 'this command displays the given text upside down',
    times: 0,
    requires :
    {
      question: false,
      display: false,
      exclusive: false,
      pokemon: false,
      parameters: 1,
      modonly: false
    },
    action: function(obj){
      if (!obj.message.length) return;
      var map = {
        'A': '∀',
        'B': '𐐒',
        'C': 'Ɔ',
        'E': 'Ǝ',
        'F': 'Ⅎ',
        'G': 'פ',
        'J': 'ſ',
        'L': '˥',
        'M': 'W',
        'N': 'N',
        'P': 'Ԁ',
        'R': 'ᴚ',
        'T': '⊥',
        'U': '∩',
        'V': 'Λ',
        'W': 'M',
        'Y': '⅄',
        'a': 'ɐ',
        'b': 'q',
        'c': 'ɔ',
        'd': 'p',
        'e': 'ǝ',
        'f': 'ɟ',
        'g': 'ƃ',
        'h': 'ɥ',
        'i': '!',
        'j': 'ɾ',
        'k': 'ʞ',
        'm': 'ɯ',
        'n': 'u',
        'p': 'd',
        'q': 'b',
        'r': 'ɹ',
        't': 'ʇ',
        'u': 'n',
        'v': 'ʌ',
        'w': 'ʍ',
        'y': 'ʎ',
        '1': 'Ɩ',
        '2': 'ᄅ',
        '3': 'Ɛ',
        '4': 'ㄣ',
        '5': 'ϛ',
        '6': '9',
        '7': 'ㄥ',
        '8': '8',
        '9': '6',
        '.': '˙',
        ',': "'",
        "": ',',
        '"': ',,',
        '`': ',',
        '<': '>',
        '>': '<',
        '∴': '∵',
        '&': '⅋',
        '_': '‾',
        '?': '¿',
        '¿': '?',
        '!': '¡',
        '¡': '!',
        '[': ']',
        ']': '[',
        '(': ')',
        ')': '(',
        '{': '}',
        '}': '{'
      };
      return obj.message.split('').reverse().map(function (element) {
        return map[element] || map[element.toLowerCase()] || element;
      }).join('');
    }
  },
  '!discord': {
    altcmds: ['!chat'],
    help: 'this command shows an invite link',
    requires :
    {
      question: false,
      exclusive: false,
      display: true,
      pokemon: false,
      parameters: 0,
      modonly: false
    },
    action: function(obj){
      return "We don't use discord, join us on the twitch app chat server at https://invite.twitch.tv/EdlanMizliPaws";
    }
  },
  // '!test': {
  //   altcmds: [],
  //   help: 'this command ',
  //   requires :
  //   {
  //     question: true,
  //     exclusive: false,
   //    display: true,
  //     pokemon: false,
  //     parameters: 1,
  //     modonly: false
  //   },
  //   action: function(obj){
  //     var response;

  //     return response;
  //   }
  // },
};

// console.log(parser);

function parseMessage(channel, user, message, self) {
  if (user["message-type"] != 'chat' && user["message-type"] != 'action') return false;
  var messagepayload = {
    channel: dehash(channel),
    user: user,
    message: message,
    self: self,
    pokemon: checkPoke(message)
  }
  var modmessage = isMod(user);
  var userexisted = checkAvatar(messagepayload);
  var question = ['?', 'do', 'what', 'when', 'where', 'how', 'does', 'can', 'will', 'are', 'which']; //'who ', 'why ', 'did ',
  var containsquestion = checkExist(message, question, true);
  var response;
  var displaycommand = true;

  if (!self && userexisted)
   commandparseloop: for (command in parser){
    var cmdexist = false;
    var cmdarr = parser[command].altcmds ? [command].concat(parser[command].altcmds) : [command];
    cmdexist = checkExist(message, cmdarr, parser[command].requires.exclusive);

    if (!self && cmdexist) {
      var parameters = [];
      if (parser[command].requires.pokemon && messagepayload.pokemon.length < parser[command].requires.pokemon.length) cmdexist = false;
      if (parser[command].requires.question && !containsquestion) cmdexist = false;
      if (parser[command].requires.modonly && !modmessage) cmdexist = false;
      if (parser[command].requires.parameters) {
        fillparaloop: for (var fill = 1; fill <= parser[command].requires.parameters; fill++)
          if (message.split(' ').length > fill) parameters.push(message.toLowerCase().split(' ')[fill]);
      }
      messagepayload.parameters = parameters;
      response = parser[command].action(messagepayload);
      displaycommand = parser[command].requires.display;
    }
   }

   var parseurl = urlDecode(messagepayload.message);
   messagepayload.message = parseurl.message;
   var image = parseurl.image;

   if (!self && userexisted && containsquestion && !response && messagepayload.pokemon.length)
    response = checkDb(messagepayload);

  if (response && (response.toLowerCase().indexOf('attack') >= 0 || response.toLowerCase().indexOf('defense') >= 0 || response.toLowerCase().indexOf('speed') >= 0  || response.toLowerCase().indexOf('nature') >= 0 )) {
    var tempresponse = checkMoves(messagepayload);
    if (tempresponse) response = tempresponse;
  }

  if (!self && userexisted && containsquestion && !response)
   response = checkMoves(messagepayload);

   userexisted && displaycommand && handleChat(messagepayload.channel, messagepayload.user, messagepayload.message, messagepayload.self, useravatars[user.username], image);
   if (response && userexisted) submitchat(response);
 }

function handleChat(chan, user, message, self, avatar, image) {
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
  // else {
  //   var colortemp = color.match( /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  //   if (colortemp.length) var colorstring = 'rgba(' + parseInt(colortemp[colortemp.length-3], 16) + ', ' + parseInt(colortemp[colortemp.length-2], 16) + ', ' + parseInt(colortemp[colortemp.length-1], 16) + ', ' + colorbrightness + ')';
  //   if (colorstring) color = colorstring;
  // }

  if (name == 'mikuia') return false;

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
   var xpos = 128 * ((Useravatars.total - (useravatars[name] + 1) % 7));
   var ypos = 128 * (Useravatars.total - Math.floor((useravatars[name] + 1) / 7));
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
  // chatContainer.style.opacity = chatopacity;

  chatMessage.className = 'chat-message';
  chatMessage.dataset.hide = '';
  // chatMessage.style.background = color;
  chatMessage.innerHTML = showEmotes ? formatEmotes(message, user.emotes) : htmlEntities(message);
  chatMessage.innerHTML = pokify(chatMessage.innerHTML);
  chatMessage.innerHTML = ffz(chatMessage.innerHTML);
  chatMessage.innerHTML = bttv(chatMessage.innerHTML);
  chatMessage.innerHTML = twemoji.parse(chatMessage.innerHTML);

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
    chatColon.dataset.faded = '';
    chatContainer.dataset.faded = '';
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