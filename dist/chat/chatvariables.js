var chatcontainer = document.getElementById('chat'),
 client = new tmi.client(clientOptions),
 chat = document.createElement('ul'),
 defaultColors = ['rgb(255, 0, 0)', 'rgb(0, 0, 255)', 'rgb(0, 128, 0)', 'rgb(178, 34, 34)', 'rgb(255, 127, 80)', 'rgb(154, 205, 50)', 'rgb(255, 69, 0)', 'rgb(46, 139, 87)', 'rgb(218, 165, 32)', 'rgb(210, 105, 30)', 'rgb(95, 158, 160)', 'rgb(30, 144, 255)', 'rgb(255, 105, 180)', 'rgb(138, 43, 226)', 'rgb(0, 255, 127)'];

chatcontainer.appendChild(chat);

var started,
 followers = [],
 viewers = [],
 stockavatar = [],
 useravatars = {},
 userbadges = {},
 participants = {},
 cmdTimestamps = {},
 randomColorsChosen = {},
 abilities = {},
 moves = {};
