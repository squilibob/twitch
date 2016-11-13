
//chat icon display functions
function pokify(text) {
 var location;
 var skippoke = -1;
 location = text.toLowerCase().indexOf('mewtwo');
 if (location >= 0) {
  var xpos = spritesheet.rowlen * spritesheet.x - ((149 % spritesheet.rowlen) * spritesheet.x),
   ypos = Math.ceil(pokedex.length / spritesheet.rowlen) * spritesheet.y - (Math.floor(149 / spritesheet.rowlen) * spritesheet.y);
  text = text.slice(0, location) + '<span class="w3-tooltip sprsheet" style="background-position: ' + xpos + 'px ' + ypos + 'px;"><span class="w3-text">M&#8203;ewtwo</span></span>' + text.slice(location + 6);
 }
 location = text.toLowerCase().indexOf('nature');
 if (location >= 0) {
  skippoke = 177;
 }
 pokifyloop: for (var pokes = pokedex.length - 1; pokes >= 0; pokes--)
  if (pokes != skippoke - 1 && text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) {
   if (autocry) socket.emit("pokemon cry", pokes+1);
   var location = text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()),
    namelength = pokedex[pokes].Pokemon.length;
   var xpos = spritesheet.rowlen * spritesheet.x - ((pokes % spritesheet.rowlen) * spritesheet.x),
    ypos = Math.ceil(pokedex.length / spritesheet.rowlen) * spritesheet.y - (Math.floor(pokes / spritesheet.rowlen) * spritesheet.y);
   text = text.slice(0, location) + '<span class="w3-tooltip sprsheet" style="background-position: ' + xpos + 'px ' + ypos + 'px;"><span class="w3-text">' + pokedex[pokes].Pokemon.slice(0, pokedex[pokes].Pokemon.length - 1) + '&#8203;' + pokedex[pokes].Pokemon.slice(pokedex[pokes].Pokemon.length - 1, pokedex[pokes].Pokemon.length) + '</span></span>' + text.slice(location + namelength, text.length);
   pokes++;
  }
 return text;
}

function ffz(text) {
 ffzloop: for (set in ffzemotes.sets)
  emoteloop: for (emote in ffzemotes.sets[set].emoticons) {
   var sizeurl = 1;
   sizeloop: for (size in ffzemotes.sets[set].emoticons[emote].urls)
    if (parseInt(size) > sizeurl) sizeurl = size;
   var thisemote = ffzemotes.sets[set].emoticons[emote].name;
   if (text.indexOf(thisemote) >= 0) text = text.slice(0, text.indexOf(thisemote)) + '<img class="emoticon" src="http:' + ffzemotes.sets[set].emoticons[emote].urls[sizeurl] + '"/>' + text.slice(text.indexOf(thisemote) + thisemote.length);
  }
 return text;
}

function bttv(text) {
 bttvloop: for (set in bttvemotes.emotes) {
  var thisemote = bttvemotes.emotes[set].code;
  if (text.indexOf(thisemote) >= 0) text = text.slice(0, text.indexOf(thisemote)) + '<img class="emoticon" src="https://cdn.betterttv.net/emote/' + bttvemotes.emotes[set].id + '/1x"/>' + text.slice(text.indexOf(thisemote) + thisemote.length);
 }
 return text;
}

function formatEmotes(text, emotes) {
 var splitText = text.split('');

 for (var i in emotes) {
  var e = emotes[i];
  for (var j in e) {
   var mote = e[j];
   if (typeof mote == 'string') {
    mote = mote.split('-');
    mote = [parseInt(mote[0]), parseInt(mote[1])];
    var length = mote[1] - mote[0],
     empty = Array.apply(null, new Array(length + 1)).map(function() {
      return ''
     });
    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
    splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
   }
  }
 }
 return htmlEntities(splitText).join('')
}

function createBadge(name) {
  var badge = document.createElement('div');
  badge.className = 'chat-badge-' + name;
  return badge;
}

function badges(chan, user, isBot, custom) {

 var chatBadges = document.createElement('span');
 chatBadges.className = 'chat-badges';

 if (userbadges[user.username]) chatBadges.appendChild(createBadge(userbadges[user.username]));

 if (user.username == dehash(chan)) {
  chatBadges.appendChild(createBadge('broadcaster'));
 }
 if (!isBot) {
  if (user['user-type']) {
   chatBadges.appendChild(createBadge(user['user-type']));
  }
  if (user.turbo) {
   chatBadges.appendChild(createBadge('turbo'));
  }
 } else {
  chatBadges.appendChild(createBadge('bot'));
 }

 return chatBadges;
}
