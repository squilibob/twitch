var pokedex = []
var typechart = []

socket.on('Receive pokedex', function (payload) {
  // pokedex[payload.id-1]=payload;
  for (entry in payload) {
    // console.log(payload[entry]);
    pokedex[parseInt(payload[entry].id) - 1] = payload[entry]
  }
  console.log('receiving pokedex ' + payload.length)
  game.storage.setItem('pokedex', JSON.stringify(pokedex))
})

socket.on('Receive typechart', function (payload) {
  // typechart.push(payload);
  typechart = payload
  console.log('receiving typechart ' + payload.length)
  game.storage.setItem('typechart', JSON.stringify(typechart))
})

// function populatetypechart(){
//   // for (var i=0; i <= 18; i++) {
//     socket.emit('Ask for typechart');
//   // }
// }

// function populatedata(){
//   // for (var i=1; i <= maxpokes; i++) {
//     socket.emit('Ask for pokedex', Presets.simple);
//     // socket.emit('Ask for pokedex');
//   // }
// }

// pokedex = JSON.parse(game.storage.getItem("pokedex"));
// typechart = JSON.parse(game.storage.getItem("typechart"));
// if (pokedex.length && typechart.length) {
//   if (typechart.length != 19) populatetypechart();
//   if (pokedex.length < maxpokes) populatedata();
// }
// else {
//   typechart = [];
//   pokedex = [];
//   populatetypechart();
//   populatedata();
// }
