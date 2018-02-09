const Presets = {
  width: 1600,
  height: 900,
  bgcolor: '#1c0f0c',
  selectedcolor: '#604040',
  font: 'Extra-Cool',
  fontsize: 24,
  fill: '#ffffff',
  pressedstate: 0xffffff,
  normalstate: 0x888888,
  highlightedstate: 0xe0e0e0,
  autohide: true,
  padding: 8,
  showdonutchart: true,
  allowroll: true,
  externalteams: true,
  scalingallowed: false,
  simple: false,
  cors: 'https://crossorigin.me/' //'https://cors-anywhere.herokuapp.com/'
}
const preloadscripts = [
  'consts',
  '/js/phaser-super-storage.min',
  '/js/localstorage',
  '/js/polyfill',
  // '/js/dex',
  // '/js/phaser-input',
  '/js/helperfunctions',
  // {'Login': '/states/login'},
  // {'Avatar': '/states/avatar'},
  // {'Teams': '/states/teams'},
  // {'Raffle': '/states/raffle'},
  // {'Pokemotions': '/states/pokemotions'},
  // {'Battle': '/states/battle'},
  // {'Vote': '/states/vote'},
  // {'Cards': '/states/cards'},
  // {'Pokedex': '/states/pokedex'},
  {'Layout': '/states/layout'},
  // {'Blank': '/states/blank'},
  '/chat/chatvariables',
  '/chat/twemoji.min',
  '/chat/chatfunctions',
  '/chat/chaticon',
  '/chat/chatfrontend',
  '/chat/chat'
]

const firststate = 'Layout'

const pokedexoptions = {
  scoring: true,
  dex: {
    x: 8,
    y: 8
  },
  team: {
    x: 1002,
    y: 620
  }
}