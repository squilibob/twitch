let alerts = {
}

Scenes.set('Alerts', {
  x: 64,
  y: 800,
  width: 2200,
  height: 1200,
  key: 'alerts',
  extend: alerts,
  pack: {
      files: [
          { type: 'image', key: 'paint', url: 'img/paint.png', width: 1575, height: 520},
      ]
  },
  loaderBaseURL: '/',
  baseURL: '/',

  create: function () {
      // socket.on('message', payload => this.message(payload))
      let paint = this.make.sprite({
        scale: 0.4,
        origin: 0,
        key: 'paint',
        add: true
    })
    .setAlpha(0, 0, 0, 0)
    // .setScale(0.4)
    // .setOrigin(0, 0)

    paint
      // .setX(Scenes.get('Alerts').width - paint.getBounds().width)
      .setY(Scenes.get('Alerts').height >> 1)

      this.tweens.add({
        targets: paint,
        alphaBottomRight: 1,
        alphaTopRight: 1,
        ease: 'Linear',
        duration: 500,
        paused: false
    })

      this.tweens.add({
        targets: paint,
        alphaBottomLeft: 1,
        alphaTopLeft: 1,
        ease: 'Linear',
        duration: 1250,
        paused: false
    })
  },

  // update: function () {
  // }
})