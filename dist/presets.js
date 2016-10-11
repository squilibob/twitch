const Presets = {
  'width': window.innerWidth-32,
  'height': window.innerHeight-32,
  bgcolor: '#1c0f0c',
  selectedcolor: '#604040',
  font: 'Extra-Cool',
  fontsize: 24,//window.innerWidth/75,
  fill: '#ffffff',
  pressedstate: 0xffffff,
  normalstate: 0x888888,
  highlightedstate:0xe0e0e0,
  padding: 8,
  showdonutchart: true,
  allowroll: false,
  externalteams:false,
};

const preloadscripts = [
  'consts',
  '/js/phaser-super-storage.min',
  '/js/localstorage',
  '/js/dex',
  '/js/phaser-input',
  '/js/helperfunctions',
  {'Login': '/states/login'},
  {'Avatar': '/states/avatar'},
  {'Teams': '/states/teams'},
  {'Raffle': '/states/raffle'},
  {'Battle': '/states/battle'},
  {'Cards': '/states/cards'},
  {'Pokedex': '/states/pokedex'},
  ];

  const pokedexoptions = {
    scoring: false,
    dex : {
      x : 0,
      y : 128,
    },
    team : {
      x : 0,
      y : 64,
    },
  };

  var buttonstyle = {
    x: 8,
    y: 8,
    horizontalorientation: true
  };
