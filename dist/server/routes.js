module.exports = function(expressServer) {
app = expressServer.app
express = expressServer.module
server = expressServer.server
dirname = expressServer.path
let path = require('path')
let router = express.Router()

app.set('port', (process.env.PORT || 80))

server.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/ in base directory ' + dirname)
})

router.get('/server', function (req, res) {
  console.log(dirname + ' server connect')
  res.sendFile(path.join(dirname, '/dist','server.html'))
})

router.get('/serverIP.js', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','serverIP.js'))
})

router.get('/presets.js', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','presets.js'))
})

router.get('/serverpresets.js', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','serverpresets.js'))
})

router.get('/style.css', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','style.css'))
})

router.get('/extra-cool.ttf', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','extra-cool.ttf'))
})

router.get('/consts.js', function (req, res) {
  res.sendFile(path.join(dirname, '/dist','consts.js'))
})

router.post('/webhook', expressServer.module.json(), function(req, res, next) {
  res.sendStatus(202)
  let obj = req.body
  let types = {
      'started_at': 'online',
      'to_id': 'follower'
  }

  for (key in types) {
     (((obj || {}).data  || []).length) && obj.data.forEach(body => !!body[key] && alerts.emit(types[key], body))
  }
})

router.get('/webhook', expressServer.module.json(), function(req, res){
  if (((req || {}).query || {})['hub.challenge']) {
    res.send(req.query['hub.challenge'])
  }
  else{
    res.sendStatus(200)
  }
})

router.get('/', function (req, res) {
  console.log(dirname + ' client connect with params: ', req.query)
  res.sendFile(path.join(dirname, '/dist','index.html'))
})

app.use('/js', express.static(dirname + '/dist/js'))
app.use('/audio', express.static(dirname + '/dist/audio'))
app.use('/img', express.static(dirname + '/dist/img'))
app.use('/states', express.static(dirname + '/dist/states'))
app.use('/chat', express.static(dirname + '/dist/chat'))

// app.get('editpokedex.html', function (req, res) {
//  res.sendfile(path.join(dirname, 'public', 'editpokedex.html'))
// })

// app.get('/fc', function (req, res) {
//  res.sendfile(path.join(dirname, 'public', 'fc.html'))
// })


// app.get('/chat', function (req, res) {
//  var chat1, chat2, chat3
//  fs.readFile('./public/chat1.html', { encoding: 'utf8' }, function(error, buffer){
//    if(error) return res.status(404).end()
//    chat1=buffer
//    fs.readFile('./public/chat2.html', { encoding: 'utf8' }, function(error, buffer2){
//      if(error) return res.status(404).end()
//      chat3=buffer2
//      fs.readFile('./public/chatlog.html', { encoding: 'utf8' }, function(error, buffer3){
//        if(error) return res.status(404).end()
//        chat2=buffer3
//        res.send(chat1+chat2+chat3)
//      })
//    })
//  })
// })

// app.use('/', express.static(dirname + '/dist'))
app.use('/', router)
}