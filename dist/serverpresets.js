const Presets = {
  width: 1920,
  height: 1100,
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

if (!Array.prototype.hasOwnProperty('last')) {
    Object.defineProperty(Array.prototype, 'last', {
      get: function last() {
        return this[this.length - 1]
      },
      set: function last(newValue) {
        this[this.length - 1] = newValue
      }
    })
}