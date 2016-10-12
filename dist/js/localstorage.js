if (socket.hasListeners('login accepted') == false) socket.on('login accepted', function(user) {
    // console.log('good, set up complete', user);
    game.storage.setItem("id", user.id);
    game.storage.setItem("fcleft", user.fc[0]);
    game.storage.setItem("fcmid", user.fc[1]);
    game.storage.setItem("fcright", user.fc[2]);
    game.storage.setItem("avatar", user.avatar);
    game.storage.setItem("cards", JSON.stringify(user.cards));
    teams = Array.isArray(user.teams) ? {'default': user.teams} : user.teams;
    game.state.start('Teams', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);
});

if (socket.hasListeners('user pokes') == false) socket.on('user pokes', function(payload) {
    game.storage.setItem("externalteams", JSON.stringify(payload));
});