const Presets = {
  'width': 900*2,
  'height': 475*2,
  bgcolor: '#1c0f0c',
  selectedcolor: '#604040',
  font: 'Extra-Cool',
  fontsize: 24,//window.innerWidth/75,
  fill: '#ffffff',
  pressedstate: 0xffffff,
  normalstate: 0x888888,
  highlightedstate:0xe0e0e0,
  padding: 8,
  showdonutchart: false,
  allowroll: true,
  externalteams:true,
};
const preloadscripts = [
  'consts',
  '/js/phaser-super-storage.min',
  '/js/localstorage',
  '/js/dex',
  '/js/phaser-input',
  '/js/helperfunctions',
  {'Login': '/states/login'},
  // {'Avatar': '/states/avatar'},
  {'Teams': '/states/teams'},
  {'Raffle': '/states/raffle'},
  {'Battle': '/states/battle'},
  // {'Cards': '/states/cards'},
  {'Pokedex': '/states/pokedex'},
  {'Blank': '/states/blank'},
  '/chat/clientoptions',
  '/chat/tmi.min',
  '/chat/tm',
  '/chat/natures',
  '/chat/ffzemotes',
  '/chat/bttvemotes',
  '/chat/chat'
  ];

  const pokedexoptions = {
    scoring: true,
    dex : {
      x : 0,
      y : 0,
    },
    team : {
      x : 1002,
      y : 620,
    },
  };

  var buttonstyle = {
    x: Presets.width-128,
    y: 8,
    horizontalorientation: false
  };
