let fuse = {
  mask: [255, 19, 252, 254, 167, 255, 164, 0, 166, 123, 0, 124, 254, 209, 255, 77, 0, 78, 1, 231, 23, 160, 252, 70, 17, 160, 6, 34, 73,
  11, 0, 52, 246, 112, 141, 248, 7, 14, 149, 11, 14, 77, 246, 197, 0, 248, 221, 112, 148, 143, 8, 76, 74, 12, 240, 0, 0, 247, 125, 125,
  146, 14, 8, 71, 11, 11],
    spritesheetwidth: 31,
    fusescale: 3,
    fuseSize: 96,
    fuseTypes: {
      'left': {x: 500, y: 810, parts: [0, 0], color: 0},
      'right': {x: 1450, y: 810, parts: [1, 1], color: 1},
      'fused': {x: 1000 , y: 810, parts: [1, 0], color: 1}
    },
    fuseParts: ['body', 'face'],
    canvasTypes: {},
    fusionqueue: [],
    runningfusionanimation: false
}

fuse.addsocketlisteners = function () {
  !socket.hasListeners('show fusion') && socket.on('show fusion',  fused => this.fusionqueue.push(fused))
}

fuse.init = function () {
  Object.keys(this.fuseTypes)
    .forEach(item => {
    this.canvasTypes[item] = { canvas:{}, image: {}}
    this.fuseParts.forEach(part => {
      this.canvasTypes[item].canvas[part] = this.textures.createCanvas(item + part, this.fuseSize, this.fuseSize)
      this.canvasTypes[item].image[part] = this.add.image(0, 0, item + part).setScale(this.fusescale).setOrigin(0)
      })
  })
}

fuse.resetPositions = function() {
  Object.entries(this.fuseTypes)
    .forEach(([key, value]) => {
      this.fuseParts.forEach(part => {
        this.canvasTypes[key].canvas[part].clear()
        this.canvasTypes[key].image[part].setX(value.x).setY(value.y)
        this.canvasTypes[key].image[part].setAlpha(+(key !== 'fused'))
      })
    })
}

fuse.makefusions = function(arr) {
  arr.forEach((item, index) => {
    this.makepoke(item)
    this.fuseParts.forEach(part => this.replaceRGB({canvas: item.canvas[part], colors: item.colors}))
    this.headcorrect({faces: item.parts.map(part => item.fusions[part].Faces[0]), index})
  })
}

fuse.makepoke = function({fusions, parts, canvas}) {
  let textures = ['faces', 'bodies']
  return [...this.fuseParts]
    .reverse()
    .forEach((part, index) => {
      canvas[part]
        .getSourceImage()
        .getContext('2d')
        .drawImage(this.textures.get(textures[index]).getSourceImage(),
          -((+fusions[parts[index]].id - 1) % this.spritesheetwidth) * this.fuseSize,
          -~~((+fusions[parts[index]].id - 1) / this.spritesheetwidth) * this.fuseSize)
      canvas[part].refresh()
    })
}

fuse.arrayToRGB = (arr) => [...Array(~~(arr.length / 3))].map(item => arr.splice(0, 3))

fuse.replaceRGB = function ({canvas, colors: replacement}) {
  let mask = this.arrayToRGB([...this.mask])
  let colors = this.arrayToRGB([...replacement])
  let pixels = canvas.getSourceImage().getContext('2d').getImageData(0, 0, this.fuseSize, this.fuseSize)
  for (let i = 0; i < pixels.data.length / 4; i++) {
    let batch = i * 4
    let change = mask.findIndex(item => item.every((subpixel, index) => pixels.data.slice(batch, batch + 3)[index] === subpixel))
    ~change && colors[change].forEach((value, index) => pixels.data[batch + index] = value)
  }
  canvas.getSourceImage().getContext('2d').putImageData(pixels, 0, 0);
  canvas.refresh()
}

fuse.headcorrect = function ({faces: [body, face], index}) {
  let scale = (body.scale / face.scale) * this.fusescale
  let obj = this.canvasTypes[Object.keys(this.fuseTypes)[index]].image.face
  obj
    .setScale(scale)
    .setX(obj.x + scale * (body.x - face.x))
    .setY(obj.y + scale * (body.y - face.y))
}

fuse.getColor = ({fusions: obj, index}) =>
  Array.isArray(obj) && obj.length >= index && !!obj[index].Color && Object.values(obj[index].Color).shift()

fuse.fusionshow = function (fusions) {
  this.runningfusionanimation = true
  this.resetPositions()
  this.makefusions(Object.entries(this.fuseTypes)
    .map(([key, value]) => ({
      parts: value.parts,
      colors: this.getColor({fusions, index: value.color}),
      fusions,
      canvas: this.canvasTypes[key].canvas
    })))
    this.setTweens(this.canvasTypes)
  }

fuse.setTweens = function(obj) {
  let endpoint = obj.fused.image.body.x
Object.entries(obj)
    .filter(item => item[0] !== 'fused')
    .map(item => item.pop().image)
    .forEach(part => Object.values(part)
      .forEach(item => {
        this.tweens.add({
          targets: item,
          x: endpoint,
          ease: 'Linear',
          duration: 1000,
          loop: 0,
          paused: false,
          onComplete: item => item.targets.forEach(tweenImage => {
            tweenImage.setAlpha(0)
            this.fuseParts.forEach(showfuse => {
              obj.fused.image[showfuse].setAlpha(1)
              this.tweens.add({
                targets: obj.fused.image[showfuse],
                alpha: 0,
                ease: 'Linear',
                delay: 2500,
                duration: 125,
                loop: 0,
                paused: false,
                onComplete: () => this.runningfusionanimation = false
              })
            })
          })
        })
      }))
}

Scenes.set('Fuse', {
  x: 64,
  y: 800,
  width: 1000,
  height: 400,
  pixelArt: true,
  key: 'fuse',
  extend: fuse,
  pack: {
    files: [
        { type: 'spritesheet', key: 'faces', url: 'img/fuseface.png', frameConfig: { frameWidth: 96, frameHeight: 96, endFrame: 493 }},
        { type: 'spritesheet', key: 'bodies', url: 'img/fusebody.png', frameConfig: { frameWidth: 96, frameHeight: 96, endFrame: 493 }}
    ]
},

  create: function () {
    this.backgroundColor = 0x1c0f0c
    this.addsocketlisteners()
  },

  update: function () {
    if (this.fusionqueue.length && !this.runningfusionanimation) this.fusionshow(this.fusionqueue.shift())
  }
})