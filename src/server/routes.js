module.exports = function (expressServer) {
app = expressServer.app
express = expressServer.module
server = expressServer.server
dirname = expressServer.path
let path = require('path')
let router = express.Router()

app.set('port', (process.env.PORT || 80))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

server.listen(app.get('port'), function () {
  console.log('Server started: http://localhost:' + app.get('port') + '/ in base directory ' + dirname)
})

router.get('/server', function (req, res) {
  console.log(dirname + ' server connect')
  res.sendFile(path.join(dirname, '/src','server.html'))
})

router.get('/serverIP.js', function (req, res) {
  res.sendFile(path.join(dirname, '/src','serverIP.js'))
})

router.get('/presets.js', function (req, res) {
  res.sendFile(path.join(dirname, '/src','presets.js'))
})

router.get('/serverpresets.js', function (req, res) {
  res.sendFile(path.join(dirname, '/src','serverpresets.js'))
})

router.get('/style.css', function (req, res) {
  res.sendFile(path.join(dirname, '/src','style.css'))
})

router.get('/extra-cool.ttf', function (req, res) {
  res.sendFile(path.join(dirname, '/src','extra-cool.ttf'))
})

router.get('/consts.js', function (req, res) {
  res.sendFile(path.join(dirname, '/src','consts.js'))
})

router.post('/webhook', expressServer.module.json(), function (req, res, next) {
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

router.get('/webhook', expressServer.module.json(), function (req, res){
  if (((req || {}).query || {})['hub.challenge']) {
    res.send(req.query['hub.challenge'])
  }
  else{
    res.sendStatus(200)
  }
})

router.get('/', function (req, res) {
  console.log(dirname + ' client connect with params: ', req.query)
  res.sendFile(path.join(dirname, '/src','index.html'))
})

app.use('/js', express.static(dirname + '/src/js'))
app.use('/audio', express.static(dirname + '/src/audio'))
app.use('/img', express.static(dirname + '/src/img'))
app.use('/scene', express.static(dirname + '/src/scene'))
app.use('/chat', express.static(dirname + '/src/chat'))

app.use('/', router)
}