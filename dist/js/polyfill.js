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