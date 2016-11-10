var defaultDB = {host: '192.241.226.10', port: 28015, db: 'Users'};
var express = require('express');
var fs = require('fs');
var path = require('path');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var r = require('rethinkdb');
var pokedex;
var typechart;

app.set('port', (process.env.PORT || 80));

server.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/ in base directory ' + __dirname);
});

app.get('/server', function (req, res) {
	console.log(__dirname + ' server connect');
	res.sendfile(path.join(__dirname, '/dist','server.html'));
});

// app.get('editpokedex.html', function (req, res) {
// 	res.sendfile(path.join(__dirname, 'public', 'editpokedex.html'));
// });

// app.get('/fc', function (req, res) {
// 	res.sendfile(path.join(__dirname, 'public', 'fc.html'));
// });


// app.get('/chat', function (req, res) {
// 	var chat1, chat2, chat3;
// 	fs.readFile('./public/chat1.html', { encoding: 'utf8' }, function(error, buffer){
// 		if(error) return res.status(404).end();
// 		chat1=buffer;
// 		fs.readFile('./public/chat2.html', { encoding: 'utf8' }, function(error, buffer2){
// 			if(error) return res.status(404).end();
// 			chat3=buffer2;
// 			fs.readFile('./public/chatlog.html', { encoding: 'utf8' }, function(error, buffer3){
// 				if(error) return res.status(404).end();
// 				chat2=buffer3;
// 				res.send(chat1+chat2+chat3);
// 			});
// 		});
// 	});
// });

app.use('/', express.static(__dirname + '/dist'));

var conn = null;

function connect() {
	return r.connect(defaultDB);
}

connect().then((c) => {
    conn = c;
	r.table('Vote').changes().run(conn, function(err, cursor) {
     if (err) throw err;
     else {
	     cursor.each(function(err, result) {
      		if (err) throw err;
          		sendVoteUpdate();
		});
          }
	});
	r.table('Raffle').changes().run(conn, function(err, cursor) {
     if (err) throw err;
     else {
	     cursor.each(function(err, result) {
      		if (err) throw err;
          		sendRaffleUpdate();
		});
          }
	});
});

io.on('connection', function(socket){
	socket.on('disconnect', function(){
		console.log('user disconnected', socket.id);
	});
	socket.on('request to connect', function(msg){
		// if (msg.id != '' && msg.id != undefined && msg.pokevalues[0] > 0 && msg.pokevalues[1] > 0 && msg.pokevalues[2] > 0) {
		if (msg.id != '' && msg.id != undefined) {
			console.log('user: ' + msg.id, 'connecting...');
			r.table('Users').filter(r.row('id').eq(msg.id.toLowerCase()))
			.run(conn, function(err, cursor) {
				if (err) createanewuser(msg);
				else cursor.toArray(function(err, result) {
					if (err || result[0] == undefined || result == []) createanewuser(msg);
					else {
						// if (result[0].pokevalues[0] == msg.pokevalues[0] && result[0].pokevalues[1] == msg.pokevalues[1] && result[0].pokevalues[2] == msg.pokevalues[2]) {
							socket.emit('login accepted',result[0]);
						// }
						// else socket.emit('wrong password');
					}
				});
			});
		} else {
			socket.emit('user not found');
			console.log('undefined value sent', msg);
		}
	});

	// socket.on('log chat', function(payload){
	// 	fs.appendFile('public/chatlog.html', '<li>'  + payload + '<li>\n', (err) => {
	// 		if (err) console.log(err);
	// 	});
	// });

	function createanewuser(payload) {
		var starter = [198, 313, 314, 546, 661, 300, 431, 509, 677, 52, 352, 335, 619, 86, 283, 211, 296, 615, 165 , 167, 88];
		// if (payload.id != '' && payload.id != undefined && payload.pokevalues[0] > 0 && payload.pokevalues[1] > 0 && payload.pokevalues[2] > 0 && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
		if (payload.id != '' && payload.id != undefined && payload.fc[0] >0 && payload.fc[0] < 10000 && payload.fc[1] >0 && payload.fc[1] < 10000  && payload.fc[2] >0 && payload.fc[2] < 10000  && payload.ign != '' && payload.ign != undefined) {
			// payload.id = payload.id.split(' ')[0];
			payload.id = payload.id.trim();
			r.table('Users').insert(payload).run(conn, function(err, result) {
				if (err) throw err;
				if (result.errors) console.log(result.first_error);
				else {
					r.table('Users').get(payload.id).update({
						validated: false,
						cards: [{'poke': starter[Math.floor(Math.random()*starter.length)], 'level': 1}],
						active: "default",
						avatar: -1,
						teams: {
						    "default": [
						        0 ,
						        1 ,
						        2 ,
						        3 ,
						        4 ,
						        5
						    ]}
					}).run(conn, function(err, result) {
						if (err) throw err;
						if (result.errors) console.log(result.first_error);
						// else socket.emit('login accepted', result[0]);
					});
					socket.broadcast.emit('someone signed up',payload.id);
				}
			})
		} else console.log('user not created, there was missing information');
	}

	socket.on('new user', function(payload){
		r.table('Users').get(payload.id.toLowerCase())
		.run(conn, function(err, cursor) {
			if (!cursor || err) createanewuser(payload);
			else {
				r.table('Users').get(payload.id).update({
					ign: payload.ign,
					fc: payload.fc
				}).run(conn, function(err, result) {
					if (err) throw err;
					if (result.errors) console.log(result.first_error);
				});
			}
		});
	});

	socket.on ("Ask for pokedex", function(){
		if (!pokedex)
			r.db('Users').table('Pokedex')
				.run(conn, function(err, cursor) {
					cursor.toArray(function(err, result) {
						if (err || result[0] == undefined || result == []) socket.emit('dex not found');
						else {
							socket.emit("Receive pokedex", result);
							pokedex = result;
						}
					});
				});
		else socket.emit("Receive pokedex", pokedex);
	});
	// socket.on ("Ask for pokedex", function(number){
	// 	number = parseInt(number);
	// 		// console.log("sending pokedex", number);
	// 		r.db('Users').table('Pokedex').get(number).run(conn, function(err, result) {
	// 			if (err) throw err;
	// 			socket.emit("Receive pokedex" , result);
	// 		});
	// 	});
	socket.on ("Ask for typechart", function(){
	  if (!typechart)
		r.db('Users').table('TypeChart')
			.run(conn, function(err, cursor) {
				cursor.toArray(function(err, result) {
					if (err || result[0] == undefined || result == []) socket.emit('typechart not found');
					else {
						socket.emit("Receive typechart", result);
						typechart = result;
					}
				});
			});
	  else socket.emit("Receive typechart", typechart);
	});
	// socket.on ("Ask for typechart", function(number){
	// 	r.db('Users').table('TypeChart').nth(number).run(conn, function(err, result) {
	// 		if (err) throw err;
	// 		socket.emit("Receive typechart" , result);
	// 	});
	// });
	socket.on("resend password", function(username){
		r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
		.pluck('pokevalues')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err || result[0] == undefined || result == []) socket.emit('user not found');
				else {
					password = result[0].pokevalues.slice(0, 3);
					socket.emit('whisper password', username, password);
				}
			});
		});
	});
	socket.on ("Insert pokedex", function(payload){
	console.log(payload["id"],payload["Pokemon"]);
	r.table('Pokedex').
	get(payload["id"]).
		update(payload).
		run(conn, function(err, result) {
			if (err) throw err;
			console.log(JSON.stringify(result, null, 2));
		});
	});

	socket.on("Send vote", function(payload){
		r.table('Vote')
		.get(payload.id)
		.replace({id: payload.id, vote: payload.vote}).
		run(conn, function(err, result) {
			if (err) throw err;
		});
	});

	socket.on('Request vote', function() {
		var current = [];
		r.db('Users').table('Vote')
			.run(conn, function(err, cursor) {
				cursor.toArray(function(err, result) {
					if (err) console.log('error not found');
					else {
						if (result[0] == undefined || result == []) current = [];
						else socket.emit('receive vote', result);
					}
				});
			});
	});

	socket.on('request user fc', function(username) {
		username = username.toLowerCase();
		r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
		.pluck('id', 'fc', 'ign')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err || result[0] == undefined || result == []) socket.emit('user fc', 'user not found');
				else {
					socket.emit('user fc', result[0]);
				}
			});
		});
	});

	socket.on('request avatar', function(channel, user, message, self) {
		var username = user.username;
		r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
		.getField('avatar')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err || result[0] == undefined || result == []) {
					socket.emit('receive avatar', channel, user, message, self, -1);
				}
				else {
					socket.emit('receive avatar', channel, user, message, self, result[0]);
				}
			});
		});
	});

	socket.on('request badge', function(user) {
		var username = user.username;
		r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
		.getField('badge')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err || result[0] == undefined || result == []) {
					console.log(result);
				}
				else socket.emit('receive badge', username, result[0]);
			});
		});
	});

	socket.on('update avatar', function(username, newavatar) {
		username = username.toLowerCase();
		r.table('Users').get(username).update({"avatar": newavatar})
		.run(conn, null)
	});

	socket.on('update badge', function(username, newbadge) {
		username = username.toLowerCase();
		r.table('Users').get(username).update({"badge": newbadge})
		.run(conn, null)
	});

	socket.on('request user pokes', function(username) {
		sendUserPokes(username);
	});

	socket.on('request unvalidated', function() {
		r.table('Users')
		.filter({validated: false})
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err || result[0] == undefined || result == []) console.log('user not found');
				else {
					socket.emit('unvalidated users', result);
				}
			});
		});
	});

	socket.on('set current team', function(name, payload){
		name = name.toLowerCase();
		// r.db('Users').table('Users').get(name).update({"teams" : payload})
		r.db('Users').table('Users').get(name).replace(function (row) {
		    return row
		      .without("active")
		      .merge({
		        "active": payload
		      })
		 })
		.run(conn, function(err, result) {
			if (err) throw err;
			if (result.errors) console.log(result.first_error);
		});
	});


	socket.on('save user pokes', function(name, payload){
		name = name.toLowerCase();
		// r.db('Users').table('Users').get(name).update({"teams" : payload})
		r.db('Users').table('Users').get(name).replace(function (row) {
		    return row
		      .without("teams")
		      .merge({
		        "teams": payload
		      })
		 })
		.run(conn, function(err, result) {
			if (err) throw err;
			if (result.errors) console.log(result.first_error);
		});
	});

	socket.on('validate fc', function(username) {
		var starter = [191, 298, 401, 010, 013, 265, 280, 129, 349, 664, 011, 014, 172, 266, 268, 174, 194, 236, 665, 161, 173, 261, 270, 273, 440, 412];
		r.db('Users').table('Users').get(username).update({cards: [{'poke': starter[Math.floor(Math.random()*starter.length)], 'level': 1}], validated: true})
		.run(conn, function(err, result) {
			if (err) throw err;
			if (result.errors) console.log(result.first_error);
		});
	});

	socket.on('won raffle', function(person) {
		rafflewinner(person);
	});

	socket.on('manually enter raffle', function(username, displayicon) {
		r.table('Users').get(username)
		.run(conn, function(err, result) {
			if (err) socket.emit('invalid raffle user', username);
			else {
				raffleChangeUser(username.toLowerCase(), 12, true, result.cards[0].poke);
			}
		});
	});

	socket.on('enter raffle', function(username, displayicon, team_name, team) {
		raffleChangeUser(username.toLowerCase(), 12, true, displayicon, team_name, team);
	});

	socket.on('leave raffle', function(username, displayicon, team_name) {
		raffleChangeUser(username.toLowerCase(), 12, false, displayicon, '', [0]);
	});

	socket.on('clear raffle', function() {
		r.db('Users').table('Raffle').delete()
		.run(conn, function(err, result) {
			if (err) throw err;
			if (result) {
				if (result.errors) console.log(result.first_error);
			}
		});
	});

	socket.on('send raffle', function() {
		sendRaffleUpdate();
	});

	socket.on('send emote', function(payload) {
		socket.broadcast.emit('receive emote', payload);
	});

	socket.on('update leaderboard', function(entry) {
		r.db('Users').table('Leaderboard').get(entry.id)
		.replace(entry).run(conn, function(err, result) {
			if (err) throw err;
			if (result.errors) console.log(result.first_error);
		});
	});

	socket.on('send leaderboard', function() {
		var current = [];
		r.db('Users').table('Leaderboard')
			.run(conn, function(err, cursor) {
				cursor.toArray(function(err, result) {
					if (err) console.log('error not found');
					else {
						if (result[0] == undefined || result == []) current = [];
						else current = result;
						socket.emit('receive leaderboard', current);
					}
				});
			});
	});
	socket.on('clear leaderboard', function() {
		r.db('Users').table('Leaderboard').delete()
		.run(conn, function(err, result) {
			if (err) throw err;
			if (result) {
				if (result.errors) console.log(result.first_error);
			}
		});
	});
});
function sendUserPokes (username) {
	r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
	.without('pokevalues')
	.getField('active')
	.run(conn, function(err, active) {
		if (err || active[0] == undefined || active == [] || active == -1) io.emit('no user active team found');
		else if (result) {
			r.table('Users').filter(r.row('id').eq(username.toLowerCase()))
			.without('pokevalues')
			.getField('teams')
			.run(conn, function(err, cursor) {
				cursor.toArray(function(err, result) {
					if (err || result[0] == undefined || result == []) io.emit('user not found');
					else {
						io.emit('user pokes', {user: username, name: active, team: result[0][active]});
					}
				});
			});
		}
	});
}

function sendVoteUpdate(){
	var current = [];
	r.db('Users').table('Vote')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err) console.log('error not found');
				else {
					if (result[0] == undefined || result == []) current = [];
					else current = result;
					io.emit('receive vote', current);
				}
			});
		});
}

function sendRaffleUpdate(){
	var current = [];
	r.db('Users').table('Raffle')
		.run(conn, function(err, cursor) {
			cursor.toArray(function(err, result) {
				if (err) console.log('error not found');
				else {
					if (result[0] == undefined || result == []) current = [];
					else current = result;
					io.emit('receive raffle', current);
				}
			});
		});
}

function raffleChangeUser(username, defaultchance, entered, displayicon){
	r.db('Users').table('Raffle').get(username)
	.run(conn, function(err, result) {
		if (err) throw err;
		if (result) {
			if (result.errors) console.log(result.first_error);
			else modifyRaffleUser(username, result.chance, entered, displayicon);
		}
		else {
			modifyRaffleUser(username, defaultchance, entered, displayicon);
		}
	});
}

function rafflewinner(username){
	r.db('Users').table('Raffle').get(username)
	.run(conn, function(err, result) {
		if (err) throw err;
		if (result) {
			if (result.errors) console.log(result.first_error);
			else {
				sendUserPokes (result.id);
				r.db('Users').table('Raffle').get(result.id).update({id: result.id, chance: 1, entered: false, displayicon: result.displayicon, winner: true})
				.run(conn, function(err, result) {
					if (err) throw err;
					if (result.errors) console.log(result.first_error);
					r.db('Users').table('Raffle').filter(r.row('id').ne(username))
					.run(conn, function(err, cursor) {
						cursor.toArray(function(err, result) {
							for (loser in result){
								if (result[loser].entered)
									r.db('Users').table('Raffle').get(result[loser].id).update({winner: false, chance: result[loser].chance*2}).run(conn, function(err, temp) {
									if (err) throw err;
								});
							}
						});
					});
					sendRaffleUpdate();
				});
			}
		}
	});
}

function modifyRaffleUser(username, chance, entered, displayicon) {
r.db('Users').table('Raffle').get(username).replace({
	id: username,
	chance: chance,
	entered: entered,
	displayicon:displayicon,
})
.run(conn, function(err, result) {
	if (err) throw err;
	if (result.errors) console.log(result.first_error);
});
}

