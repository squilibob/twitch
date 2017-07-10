const Presets = {
  width: 1600,
  height: 958,
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
  cors: 'https://crossorigin.me/'
}
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
  // {'Pokemotions': '/states/pokemotions'},
  {'Battle': '/states/battle'},
  // {'Vote': '/states/vote'},
  // {'Cards': '/states/cards'},
  {'Pokedex': '/states/pokedex'},
  {'Blank': '/states/blank'},
  '/chat/clientoptions',
  '/chat/tmi.min',
  '/chat/chatvariables',
  '/chat/tm',
  '/chat/natures',
  '/chat/hiddenpowers',
  '/chat/twemoji.min',
  '/js/metaphone',
  '/chat/chatfunctions',
  '/chat/chatapi',
  '/chat/chaticon',
  '/chat/chatsocket',
  '/chat/pokemonparse',
  '/chat/chatfrontend',
  '/chat/chat'
]

const firststate = 'Blank'

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

var fragmentSrc = [
  'precision mediump float;',
  'uniform vec2      resolution;',
  'uniform float     time;',
  '#define PI 90',
  'void main( void ) {',
  'vec2 p = ( gl_FragCoord.xy / resolution.xy ) - 0.5;',
  'float sx = 0.3 * (p.x + 0.8) * sin( 900.0 * p.x - 1. * pow(time, 0.55)*5.);',
  'float dy = 4./ ( 500.0 * abs(p.y - sx));',
  'gl_FragColor = vec4( (p.x + 0.1) * dy, 0.3 * dy, dy, 1.1 );',
  '}']
