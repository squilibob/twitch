// const chatwidth = 400;
const chatheight= 720;


var useravatars = {},
	fadeDelay = 5000, // Set to false to disable chat fade
	showChannel = true, // Show repespective channels if the channels is longer than 1
	useColor = true, // Use chatters' colors or to inherit
	whitethreshold = 192;
	showBadges = true, // Show chatters' badges
	showEmotes = true, // Show emotes in the chat
	doTimeouts = true, // Hide the messages of people who are timed-out
	doChatClears = true, // Hide the chat from an entire channel
	showHosting = true, // Show when the channel is hosting or not
	showConnectionNotices = true; // Show messages like "Connected" and "Disconnected"

var chatcontainer = document.getElementById('chat'),
	defaultColors = ['rgb(255, 0, 0)','rgb(0, 0, 255)','rgb(0, 128, 0)','rgb(178, 34, 34)','rgb(255, 127, 80)','rgb(154, 205, 50)','rgb(255, 69, 0)','rgb(46, 139, 87)','rgb(218, 165, 32)','rgb(210, 105, 30)','rgb(95, 158, 160)','rgb(30, 144, 255)','rgb(255, 105, 180)','rgb(138, 43, 226)','rgb(0, 255, 127)'],
	randomColorsChosen = {},
	client = new tmi.client(clientOptions),
	viewers = [],
	started,
	total = 0,
	cmdTimestamps = {},
	stockavatar = [],
	chat = document.createElement('ul');

	chatcontainer.appendChild(chat);

	var commandlist = {
		'!battle' : ' Viewer Battles: put your 3ds FC in test server http://192.241.226.10/ ',
		'raffle' : ' to enter the raffle put your 3ds FC in test server http://192.241.226.10/ ',
		'!ship' : 'I ship me with someone. It is now canon!',
		'disable music': 'this code NTAW-WWWW-WW2Y-M2PT in Vs Recorder',
		'check level': 'http://mikuia.tv/levels/squilibob',
		'evol pokemon': '',
		'find pokemon': '',
		'route pokemon': '',
		'locat pokemon': '',
		'obtain pokemon': '',
		'nature': '',
		'weak': '',
		'resist': '',
		'strong': '',
		'effective': ''
	};

function dehash(channel) {
	return channel.replace(/^#/, '');
}

function capitalize(n) {
	return n[0].toUpperCase() +  n.substr(1);
}

function htmlEntities(html) {
	function it() {
		return html.map(function(n, i, arr) {
				if(n.length == 1) {
					return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
							 return '&#'+i.charCodeAt(0)+';';
						});
				}
				return n;
			});
	}
	var isArray = Array.isArray(html);
	if(!isArray) {
		html = html.split('');
	}
	var parser = html;
	html = it(parser);

	if(!isArray) html = html.join('');
	return html;
}
function pokify(text) {
	var location;
	var skippoke = -1;
	location = text.toLowerCase().indexOf('mewtwo');
	if (location >= 0) {
		var xpos = spritesheet.rowlen*spritesheet.x-((149 % spritesheet.rowlen) * spritesheet.x),
			ypos = Math.ceil(maxpokes/spritesheet.rowlen)*spritesheet.y-(Math.floor(149 / spritesheet.rowlen)* spritesheet.y);
		text = text.slice(0,location) + '<span class="w3-tooltip sprsheet" style="background-position: '+ xpos + 'px '+ ypos+'px;"><span class="w3-text">M&#8203;ewtwo</span></span>' + text.slice(location+6);
	}
	location = text.toLowerCase().indexOf('nature');
	if (location >= 0) {
		skippoke = 177;
	}
	for (var pokes = maxpokes; pokes >= 0; pokes--)
		if (pokes != skippoke-1 && text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) {
		var location = text.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()),
			namelength = pokedex[pokes].Pokemon.length;
			var xpos = spritesheet.rowlen*spritesheet.x-((pokes % spritesheet.rowlen) * spritesheet.x),
				ypos = Math.ceil(maxpokes/spritesheet.rowlen)*spritesheet.y-(Math.floor(pokes / spritesheet.rowlen)* spritesheet.y);
			text = text.slice(0,location) + '<span class="w3-tooltip sprsheet" style="background-position: '+ xpos + 'px '+ ypos+'px;"><span class="w3-text">'+ pokedex[pokes].Pokemon.slice(0, pokedex[pokes].Pokemon.length-1) +'&#8203;' + pokedex[pokes].Pokemon.slice(pokedex[pokes].Pokemon.length-1, pokedex[pokes].Pokemon.length) +'</span></span>' + text.slice(location+namelength,text.length);
			pokes++;
		}
	return text;
}
function ffz(text) {
	for (set in ffzemotes.sets)
		for (emote in ffzemotes.sets[set].emoticons) {
			var sizeurl = 1;
			for (size in ffzemotes.sets[set].emoticons[emote].urls)
				if (parseInt(size) > sizeurl) sizeurl = size;
			var thisemote = ffzemotes.sets[set].emoticons[emote].name;
			if (text.indexOf(thisemote) >= 0) text = text.slice(0, text.indexOf(thisemote)) + '<img class="emoticon" src="http:' + ffzemotes.sets[set].emoticons[emote].urls[sizeurl] + '"/>' + text.slice(text.indexOf(thisemote)+thisemote.length);
			// console.log(ffzemotes.sets[set].emoticons[emote].name, 'http:' + ffzemotes.sets[set].emoticons[emote].urls[sizeurl]);
		}
	return text;
}

function bttv(text) {
	for (set in bttvemotes.emotes) {
		var thisemote = bttvemotes.emotes[set].code;
		if (text.indexOf(thisemote) >= 0) text = text.slice(0, text.indexOf(thisemote)) + '<img class="emoticon" src="https://cdn.betterttv.net/emote/' + bttvemotes.emotes[set].id + '/1x"/>' + text.slice(text.indexOf(thisemote)+thisemote.length);
	}
	return text;
}

function formatEmotes(text, emotes) {
	var splitText = text.split('');

	for(var i in emotes) {
		var e = emotes[i];
		for(var j in e) {
			var mote = e[j];
			if(typeof mote == 'string') {
				mote = mote.split('-');
				mote = [parseInt(mote[0]), parseInt(mote[1])];
				var length =  mote[1] - mote[0],
					empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
				splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
				splitText.splice(mote[0], 1, '<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
			}
		}
	}
	return htmlEntities(splitText).join('')
}

function badges(chan, user, isBot) {

	function createBadge(name) {
		var badge = document.createElement('div');
		badge.className = 'chat-badge-' + name;
		return badge;
	}

	var chatBadges = document.createElement('span');
	chatBadges.className = 'chat-badges';

	if(user.username == dehash(chan)) {
		chatBadges.appendChild(createBadge('broadcaster'));
	}
	if(!isBot) {
		if(user['user-type']) {
			chatBadges.appendChild(createBadge(user['user-type']));
		}
		if(user.turbo) {
			chatBadges.appendChild(createBadge('turbo'));
		}
	}
	else {
		chatBadges.appendChild(createBadge('bot'));
	}

	return chatBadges;
}

// function getChatlist(chan) {
// 	channel = dehash(chan);
// 	client.api({
// 	    url: 'http://tmi.twitch.tv/group/user/'+channel+'/chatters'
// 	}, function(err, res, body) {
// 	    console.log({ viewers: body.data.chatters.viewers, total: body.data.chatters.viewers.length }, 'inside');
// 	    return { viewers: body.data.chatters.viewers, total: body.data.chatters.viewers.length } ;
// 	});
// }

function getViewers(chan) {
	channel = dehash(chan);
	client.api({url: 'http://tmi.twitch.tv/group/user/'+channel+'/chatters'+'?client_id='+clientid}, function(err, res, body) {
			// document.getElementById('viewers').value = typeof(body.data.chatter_count) == 'number' ? body.data.chatter_count : 0;
			viewers = body.data.chatters.viewers;
			total = body.data.chatters.viewers.length;
	});
}

function getStart(chan) {
	channel = dehash(chan);
	client.api({
			url: 'https://api.twitch.tv/kraken/streams/'+channel+'?client_id='+clientid
	}, function(err, res, body) {
		if (body.stream) {
				started = new Date(body.stream.created_at);
		}
	});
}

// Check if the command is listed in "cmdTimestamps" and check the time difference..
function checkDelay(channel, command, seconds) {
		channel = dehash(channel);
		// Entry doesn't exist, return true.
		if (!cmdTimestamps[channel]) {
				cmdTimestamps[channel] = {};
				return true;
		}
		// Entry exists but the command doesn't, return true.
		if (!cmdTimestamps[channel][command]) {
				return true;
		}

		// Entry exists, check the time difference..
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
function submitchat(text){
	client.say(channels[0], text);
}

function showcommands(channel){
	chan = dehash(channel);
	if (checkDelay(channel, 'cmd', 10)) {
		setDelay(channel, 'cmd');
		submitchat('bot commands: fc - shows your friend code. reload me - reload your chat avatar. !password - whisper your password. ~Chat custom commands~: ' + Object.keys(commandlist).join(', '));
	}
	// chatNotice('the current commands available in ' + channel + ' are:', 12000, 1);
}

function findpoke(name) {
	for (var i = 1; i < pokedex.length; i++){
		if (pokedex[i].Pokemon.toLowerCase() == name.toLowerCase()) return i;
	}
	return -1;
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
function validatetype(type) {
	type = capitalize(type.toLowerCase());
	Object.keys(typechart).forEach((elementindex, index) => {
		if (type.indexOf(typechart[elementindex]['Type']) >= 0) type = typechart[elementindex]['Type'];
	});
	return type;
}

function weakTo(type1, type2 = '') {
	var weaknesses = [];
	type1 = validatetype(type1);
	if (type2) type2 = validatetype(type2);
	Object.keys(typechart).forEach((elementindex, index) => {
		if (typechart[elementindex][type1] * (type2 == "" ? 1 : typechart[elementindex][type2]) > 1) {
			weaknesses.push(typechart[elementindex]["Type"]);
		}
	});
	return weaknesses;
}
function resistantTo(type1, type2 = '') {
	var resistances = [];
	type1 = validatetype(type1);
	if (type2) type2 = validatetype(type2);
	Object.keys(typechart).forEach((elementindex, index) => {
		if (typechart[elementindex][type1] * (type2 == "" ? 1 : typechart[elementindex][type2]) < 1) {
			resistances.push(typechart[elementindex]["Type"]);
		}
	});
	return resistances;
}
function effective(type) {
	var effectiveness = [];
	type = validatetype(type);
	Object.keys(typechart).forEach((elementindex, index) => {
		if (typechart[elementindex]["Type"] == type) {
			Object.keys(typechart[elementindex]).forEach((key, value) => {
				if (key != 'id' && parseInt(typechart[elementindex][key]) > 1) effectiveness.push(key);
			});
		}
	});
	return effectiveness;
}

function handleChat(channel, user, message, self) {
	var chan = dehash(channel),
	image,
	response,
	avatar;

	if (useravatars[user.username] == undefined) {
		socket.emit('request avatar', channel, user, message, self);
	}
	else {
		if (useravatars[user.username] < 0) {
			if (typeof useravatars[user.username] == "number")
				client.api({
					url: 'https://api.twitch.tv/kraken/users/'+user.username+'?client_id='+clientid
				}, function(err, res, body) {
					// console.log(err, res, body);
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
			' me ' : ' ' +  user.username +' ',
			'someone' : viewers[Math.ceil(Math.random()*total)-1]
			// number random
			// link to someone's twitch stream
		};
		var question = ['?', 'do', 'what', 'when', 'where', 'how', 'does', 'can', 'will', 'are', 'which'];//'who ', 'why ', 'did ',
		var containsquestion = false;

		if (self == true)	{
			if (message.toLowerCase().indexOf('!raid') >= 0) {
				var target = message.slice(message.toLowerCase().indexOf('!raid')).split(' ');
				target = target[1];
				if (target.length > 3) {
					submitchat('we are now going to raid ' + target + ' please go to http://twitch.tv/' + target+ ' and type the raid message:');
					submitchat('тo proтecт тнe cнaт froм devasтaтιon, тo υnιтe spaммers wιтнιn oυr naтιon, тo denoυnce тнe evιls of вans and мods, тo eхтend oυr spaм тo тнe space aвove. copy! pasтe! тwιтcн cнaт, scroll aт тнe speed of lιgнт! Ragequιт now or prepare тo fιgнт!');
					submitchat('make sure you type it into the chat of ' + target + '  at http://twitch.tv/' + target+ ' !');
				}
			}
		}
		else {
			var checkall = message.split(' ') ;
			for (var i = 0; i < checkall.length; i++) {
				if (checkall[i].toLowerCase().indexOf('.png') >= 0 || checkall[i].toLowerCase().indexOf('.gif') >= 0 || checkall[i].toLowerCase().indexOf('.jpg') >= 0) {
					image = checkall[i];
					message = message.slice(0, message.indexOf(checkall[i])) + message.slice(message.indexOf(checkall[i])+checkall[i].length+1);
				}
				for (var word = 0; word < question.length; word++) {
					if (checkall[i].indexOf(question[word]) >= 0) containsquestion = true;
				}
			}
			if (containsquestion == true) if (message.toLowerCase().indexOf('tm') >=0) {
				var findtm = parseInt(message.slice(message.toLowerCase().indexOf('tm')+2,message.toLowerCase().indexOf('tm')+5));
				if (findtm > 0 && findtm < 101)
					for (var key in tm[findtm-1]) response = 'TM'+findtm+' '+ key +' can be obtained at '+tm[findtm-1][key];
				else {
					for (num = 1; num < 101; num++) {
						for (var key in tm[num-1]) if (message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'TM'+num+' '+ key +' can be obtained at '+tm[num-1][key];
					}
				}
			}
			if (containsquestion == true) if (message.toLowerCase().indexOf('hm') >=0) {
				var findtm = parseInt(message.slice(message.toLowerCase().indexOf('hm')+2,message.toLowerCase().indexOf('hm')+5));
				if (findtm > 0 && findtm < 8)
					for (var key in hm[findtm-1]) response = 'HM'+findtm+' '+ key +' can be obtained at '+hm[findtm-1][key];
				else {
					for (num = 1; num < 8; num++) {
						for (var key in hm[num-1]) if (message.toLowerCase().indexOf(key.toLowerCase()) >= 0) response = 'HM'+num+' '+ key +' can be obtained at '+hm[num-1][key];
					}
				}
			}
			if (message.toLowerCase().indexOf('fc') >= 0) {
				var notyou = null;
				for (person in useravatars)
					if (message.toLowerCase().indexOf(person.toLowerCase()) >= 0) notyou=person.toLowerCase();
				socket.emit('request user fc', notyou == null ? user.username.toLowerCase() : notyou);
			}
			if (message.toLowerCase().indexOf('reload me') >= 0) {
				delete useravatars[user.username];
				socket.emit('request avatar', chan, user, user.username + ': reloaded avatar image', self);
			}
			if (message.toLowerCase().indexOf('!password') >= 0)  {
				socket.emit("resend password", user.username);
			}
			if (message.toLowerCase().indexOf('!cmd') >= 0 || message.toLowerCase().indexOf('!command') >= 0) showcommands(chan);
			if (message.toLowerCase().indexOf('uptime') >= 0) {
				var now = new Date();
				var uptime = now - started;
				if ((checkDelay(channel,'uptime',120)) && !(isNaN(uptime))) {
					setDelay(channel,'uptime');
					var hours = Math.floor((uptime % 86400000) / 3600000);
					var minutes = Math.floor(((uptime % 86400000) % 3600000) / 60000);
					response = ('Stream has been live for ' + hours + (minutes < 10 ? ':0' : ':') + minutes);
				}
			}
			if (containsquestion == true)  {
				var dexno = -1;
				var sp = false;

				var command = message.toLowerCase().split(' ');
				for (var i = 0; i < command.length; i++) {
					if (command[i].indexOf('mewtwo') >= 0) dexno = 149;
					else for (var pokes = 0; pokes <= maxpokes; pokes++)
						if (command[i].indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) dexno = pokes;
				}
				if (dexno >= 0) {
					if (message.indexOf('egg group') >= 0 && pokedex[dexno]['Egg Group I']) if (pokedex[dexno]['Egg Group II'] && pokedex[dexno]['Egg Group II'] != ' ') response = pokedex[dexno].Pokemon + ' is in egg groups ' + pokedex[dexno]['Egg Group I'] + ' & ' + pokedex[dexno]['Egg Group II'];
					else  response = pokedex[dexno].Pokemon + ' is in egg group ' + pokedex[dexno]['Egg Group I'];
					for (var i = 0; i < command.length; i++) {
						if (command[i].indexOf('type') >= 0 && pokedex[dexno].Secondary)  {
							response = pokedex[dexno].Pokemon + ' types are ' + pokedex[dexno].Type + '/' + pokedex[dexno].Secondary;
						}
						else {
							for(var key in pokedex[dexno]) {
								if (i + 1 < command.length && command[i] == 'sp.')  {
									sp = true;
									if (command[i] + ' ' + command[i+1] == key.toLowerCase()) {
										if (pokedex[dexno][key])
											response = pokedex[dexno].Pokemon + ' ' + key + ': ' + pokedex[dexno][key];
									}
								}
								else {
									if (command[i] == key.toLowerCase() && key != 'Pokemon'  && sp == false) {
											if (pokedex[dexno][key]) response = pokedex[dexno].Pokemon + ' ' + key + ': ' + pokedex[dexno][key];
									}
								}
							}
						}
					}
				}
			}
			for(var key in commandlist) {
				var command = key.split(' ');
				var exists = true;
				var dexno = -1;
				for (var i = 0; i < command.length; i++) {
					command[i] = command[i].toLowerCase();
					if (command[i] == 'pokemon') {
							for (var pokes = 0; pokes <= maxpokes; pokes++) {
								if (message.toLowerCase().indexOf(pokedex[pokes].Pokemon.toLowerCase()) >= 0) dexno = pokes;
							}
					}
					else if (message.toLowerCase().indexOf(command[i]) < 0) exists = false;
				}

				if (exists) {
					// if (checkDelay(channel,command[0],10)) {
					// 	setDelay(channel, command[0]);
					if (containsquestion == true) if (command[0] == 'weak'){
						message.split(' ').forEach((weak, index) => {
							var list = weakTo(weak);
							if (list.length > 0) response = validatetype(weak) + ' is weak to ' + list.join(', ');
						});
					}
					if (containsquestion == true) if (command[0] == 'resist'){
						message.split(' ').forEach((resistant, index) => {
							var list = resistantTo(resistant);
							if (list.length > 0) response = validatetype(resistant) + ' is resistant to ' + list.join(', ');
						});
					}
					if (containsquestion == true) if (command[0] == 'strong' || command[0] == 'effective'){
						message.split(' ').forEach((strength, index) => {
							var list = effective(strength);
							if (list.length > 0) response = validatetype(strength) + ' is super effective against ' + list.join(', ');
						});
					}

						// setDelay(channel, command[0]);
						var reply = commandlist[key];
						for (var replace in substitutions) {
							var insert = substitutions[replace];
							if (reply.indexOf(replace) >= 0) reply = reply.slice(0, reply.indexOf(replace)) + insert + reply.slice(reply.indexOf(replace)+replace.length,reply.length);
						}
						if (containsquestion == true) if (command[0] == 'nature') {
							if (message.toLowerCase().indexOf('+') > 0 && message.toLowerCase().indexOf('-') > 0) {
								var plus = message.slice(message.toLowerCase().indexOf('+') + 1).split(' ');
								var minus = message.slice(message.toLowerCase().indexOf('-') + 1).split(' ');
								if (plus[0].toLowerCase() == 'special') plus = plus [0] + ' ' + plus[1];
								else plus = plus[0];
								if (minus[0].toLowerCase() == 'special') minus = minus [0] + ' ' + minus[1];
								else minus = minus[0];
								for (var count = 0; count < natures.length; count++) {
									if (natures[count].increase)
										if (natures[count].increase.toLowerCase() == plus.toLowerCase() &&
											natures[count].decrease.toLowerCase() == minus.toLowerCase())
												reply = natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease;
								}
							}
							else
							for (var count = 0; count < natures.length; count++) {
								if (message.toLowerCase().indexOf(natures[count].nature.toLowerCase()) >= 0) reply = (natures[count].increase ? natures[count].nature + ' is +' + natures[count].increase + ' and -' + natures[count].decrease : natures[count].nature + ' is neutral');
							}
						}
						if (containsquestion == true) if (dexno >= 0) {
							if (command[0] == 'evol') {
								if (pokedex[dexno].Prevo) {
									reply += pokedex[dexno].Pokemon + ' evolves from ' + pokedex[dexno].Prevo;
									if (pokedex[dexno].Evolve) reply += ' (' + pokedex[dexno].Evolve + ') ';
								}
								else if (!(pokedex[dexno].Evos)) reply = pokedex[dexno].Pokemon + ' has no evolutions';
								if (pokedex[dexno].Evos.length > 0)
									reply += pokedex[dexno].Pokemon + ' evolves into ';
								for (var count = 0; count < pokedex[dexno].Evos.length; count++) {
									reply += pokedex[dexno].Evos[count];
									reply += ' (' + pokedex[findpoke(pokedex[dexno].Evos[count])].Evolve + ') ';
									if (count+2 == pokedex[dexno].Evos.length) reply += ' and ';
									else if (count+1 < pokedex[dexno].Evos.length) reply += ', ';
								}
							}
							else {
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
		putChat(channel, user, message, self, useravatars[user.username], image);
		if (response)	submitchat(response);
	}
}

function putChat(chan, user, message, self, avatar, image) {

	var name=user.username,
		chatLine = document.createElement('li'),
		chatAlignment = document.createElement('div'),
		chatChannel = document.createElement('div'),
		chatName = document.createElement('span'),
		chatColon = document.createElement('span'),
		chatTime = document.createElement('span'),
		chatContainer = document.createElement('div'),
		chatMessage = document.createElement('div'),
		chatImage = document.createElement('img'),
					date = new Date();

	var color = useColor ? user.color : 'inherit';
	if(color === null) {
		if(!randomColorsChosen.hasOwnProperty(chan)) {
			randomColorsChosen[chan] = {};
		}
		if(randomColorsChosen[chan].hasOwnProperty(name)) {
			color = randomColorsChosen[chan][name];
		}
		else {
			color = defaultColors[Math.floor(Math.random()*defaultColors.length)];
			randomColorsChosen[chan][name] = color;
		}
	}
	if (color.indexOf('(') != color.indexOf(')')) {
		var colorstring = color.slice(color.indexOf('(')+1, color.indexOf(')'));
		var colortemp = colorstring.split(',');
		var colortotal = 0;
		for (var string =0; string < colortemp.length; string++) colortotal += parseInt(colortemp[string]);
		if (colortotal > whitethreshold*3) chatMessage.style.color = "#000000";
	}

	chatLine.ondblclick = function() {
		this.className = 'chat-kill';
		setTimeout(this.remove(), 2000);
	};
	chatLine.className = 'chat-line';
	chatLine.dataset.hide = '';
	chatLine.dataset.username = name;
	chatLine.dataset.channel = chan;

	if(user['message-type'] == 'action') {
		chatLine.className += ' chat-action';
	}
	chatChannel.className = 'chat-channel';
	chatChannel.innerHTML = chan;

	if (typeof useravatars[name] != 'number' || useravatars[name] < 0) {
		var chatAvatar = document.createElement('img');
		chatAvatar.className = 'chat-avatar';
		chatAvatar.dataset.hide = '';
		chatAvatar.src = (avatar == null || avatar == -1 ? 'http://www-cdn.jtvnw.net/images/xarth/footer_glitch.png' : avatar);
	}
	else {
		var chatAvatar = document.createElement('span');
		chatAvatar.className =  'avs';
		var xpos = 64*(((useravatars[name]+1) % 7)+1);
		var ypos = 64+64*Math.floor((useravatars[name] +1) / 7);
		chatAvatar.style = 'background-position: right '+ xpos + 'px bottom '+ ypos + 'px;">';
		// chatAvatar.style = 'background-position: '+ 0 + 'px '+ 64 +'px;">';
		// console.log(useravatars[name], (64*Math.floor((useravatars[name] +1) / 7)));
	}


	chatTime.className = 'chat-time';
	chatTime.innerHTML = String.fromCodePoint(date.getHours() > 12 ? 128323 + date.getHours()  : (date.getHours() < 1 ? 128347 : 128335 + date.getHours()))  + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);//(not using seconds right now) + '.' + ('0' + date.getSeconds()).slice(-2) ;

	chatAlignment.className = 'chat-align';
	chatAlignment.appendChild(chatName);
	if(showBadges) chatAlignment.appendChild(badges(chan, user, self));
	chatAlignment.appendChild(chatTime);
	chatLine.appendChild(chatAlignment);

	chatName.className = 'chat-name';
	// chatName.style.color = color;
	chatName.innerHTML = user['display-name'] || name;
	// chatName.innerHTML = chatName.innerHTML.replace(/[^a-z+]+/gi, '');

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
			chatImage.onclick = function() { console.log(this); }; //going to use this later to show a user's image fullscreen
			chatImage.className = 'chat-image';
			chatImage.onload = function() {chatMessage.appendChild(chatImage);};
		}
		//else chatMessage.innerHTML += ' error: <a href="' + image + '">'+image+'</a>';
	});

	// if (chatMessage.innerHTML.length > 256) {
	// 	var newmsg = chatMessage.innerHTML.substr(0, 255);
	// 	putChat(chan, user, chatMessage.innerHTML.substr(255), self, avatar, image);
	// }

	chatContainer.appendChild(chatMessage);

	if(client.opts.channels.length > 1 && showChannel) chatLine.appendChild(chatChannel);
	chatLine.appendChild(chatAvatar);
	chatLine.appendChild(chatColon);
	chatLine.appendChild(chatContainer);

	chatAvatar.onload = chat.appendChild(chatLine);

	if(typeof fadeDelay == 'number') {
		setTimeout(function() {
			chatLine.dataset.faded = '';
			chatMessage.dataset.faded = '';
			chatAvatar.dataset.faded = '';
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

	while(document.getElementById('chat').offsetHeight > chatheight * 1.25 ) {
		var oldMessages = [].slice.call(chat.children).slice(0,1);
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

function chatNotice(information, noticeFadeDelay, level, additionalClasses) {
	var ele = document.createElement('li');

	ele.className = 'chat-line chat-notice';
	ele.innerHTML = information;

	if(additionalClasses !== undefined) {
		if(Array.isArray(additionalClasses)) {
			additionalClasses = additionalClasses.join(' ');
		}
		ele.className += ' ' + additionalClasses;
	}

	if(typeof level == 'number' && level != 0) {
		ele.dataset.level = level;
	}

	chat.appendChild(ele);

	if(typeof noticeFadeDelay == 'number') {
		setTimeout(function() {
				ele.dataset.faded = '';
			}, noticeFadeDelay || 500);
	}

	return ele;
}

var recentTimeouts = {};

function timeout(channel, username) {
	if(!doTimeouts) return false;
	if(!recentTimeouts.hasOwnProperty(channel)) {
		recentTimeouts[channel] = {};
	}
	if(!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000*10 < +new Date) {
		recentTimeouts[channel][username] = +new Date;
		chatNotice(capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-timeout')
	};
	var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message');
	for(var i in toHide) {
		var h = toHide[i];
		if(typeof h == 'object') {
			h.innerText = '<Message deleted>';
			h.parentElement.className += ' chat-timedout';
		}
	}
}
function clearChat(channel) {
	if(!doChatClears) return false;
	var toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]');
	for(var i in toHide) {
		var h = toHide[i];
		if(typeof h == 'object') {
			h.className += ' chat-cleared';
		}
	}
	chatNotice('Chat was cleared in channel ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-clear')
}
function hosting(channel, target, viewers, unhost) {
	if(!showHosting) return false;
	if(viewers == '-') viewers = 0;
	var chan = dehash(channel);
	chan = capitalize(chan);
	if(!unhost) {
		var targ = capitalize(target);
		chatNotice(chan + ' is now hosting ' + targ + ' for ' + viewers + ' viewer' + (viewers !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes');
	}
	else {
		chatNotice(chan + ' is no longer hosting.', null, null, 'chat-hosting-no');
	}
}

client.on("hosted", function (channel, username, viewers) {
	var chan = dehash(channel);
	chan = capitalize(chan);
	if (typeof(viewers) == 'number')
	chatNotice(username + ' is now hosting ' + chan + ' for ' + viewers + ' viewer' + (viewers !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes');
	else chatNotice(username + ' is now hosting ' + chan + '.', null, null, 'chat-hosting-yes');
});

// document.getElementById("chatform").addEventListener("submit", function(event){
// 		event.preventDefault();
// 		if (document.getElementById('chat-input').value != '') submitchat(document.getElementById('chat-input').value);
// 		document.getElementById('chat-input').value = '';
// });

client.addListener('message', handleChat);
client.addListener('timeout', timeout);
client.addListener('clearchat', clearChat);
client.addListener('hosting', hosting);
client.addListener('unhost', function(channel, viewers) { hosting(channel, null, viewers, true) });

var joinAccounced = [];

client.addListener('connecting', function (address, port) {
		if(showConnectionNotices) chatNotice('Connecting', 1000, -4, 'chat-connection-good-connecting');
	});
client.addListener('logon', function () {
		if(showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon');
	});
client.addListener('connectfail', function () {
		if(showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail');
	});
client.addListener('connected', function (address, port) {
		if(showConnectionNotices) chatNotice('Connected', 1000, -2, 'chat-connection-good-connected');
		joinAccounced = [];
	});
client.addListener('disconnected', function (reason) {
		if(showConnectionNotices) chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected');
		client.connect();
	});
client.addListener('reconnect', function () {
		if(showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect');
	});
client.addListener('join', function (channel, username) {
		if(joinAccounced.indexOf(channel) == -1) {
			// if(showConnectionNotices) chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join');
			joinAccounced.push(channel);
			getViewers(channel);
			getStart(channel);
		}
	});
client.addListener('part', function (channel, username) {
		var index = joinAccounced.indexOf(channel);
		if(index > -1) {
			// if(showConnectionNotices) chatNotice('Parted ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-part');
			joinAccounced.splice(joinAccounced.indexOf(channel), 1)
		}
	});

client.addListener('crash', function () {
		chatNotice('Crashed', 10000, 4, 'chat-crash');
	});

client.connect();

socket.on('whisper password', function(user, password) {
	var temptext = "Your password is " + pokedex[password[0]-1].Pokemon + " - " + pokedex[password[1]-1].Pokemon + " - " + pokedex[password[2]-1].Pokemon;
	client.whisper(user, temptext);
});
socket.on('user fc', function(user) {
	if (typeof(user) == 'string') submitchat(user);
	else submitchat(user.id +"'s friend code is " + user.fc[0] + "-" + user.fc[1] + "-"+ user.fc[2] + " IGN " + user.ign);
});

socket.on('receive avatar', function(channel, user, message, self, avatar) {
	useravatars[user.username] = avatar;
	handleChat(channel, user, message, self, avatar);
	// submitchat(message);
});

socket.on('user pokes', function(teamname) {
	var TeamTier = 0;
	for (var j=0; j < 6; j++) {
		for (var check=0; check < Tiers.length; check++){
			if (pokedex[teamname[j]].Tier == Tiers[check] && check > TeamTier) TeamTier = check;
		}
	}
	var replyText = '';
	var total = 0;
	for (var poke = 0; poke < teamname.length; poke++){
		total += teamname[poke];
		replyText = replyText + pokedex[teamname[poke]].Pokemon + ' ';
		if (Tiers[TeamTier] != pokedex[teamname[poke]].Tier) replyText = replyText + ' (' + pokedex[teamname[poke]].Tier + ') ';
	}
	replyText = Tiers[TeamTier] + replyText;
	if (total > 21) submitchat('team is ' + replyText);
});

socket.on('raffle winner', function(person) {
	submitchat(person + ' has won the raffle');
});

socket.on('someone signed up', function(name){
	chatNotice(name + " has created an account", 10000, 1);
});

window.setInterval(getViewers(channels[0]),24000);