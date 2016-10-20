var pokedex = [];
var typechart = [];

socket.on('Receive pokedex', function(payload){
  // pokedex[payload.id-1]=payload;
  for (entry in payload) {
    // console.log(payload[entry]);
    pokedex[parseInt(payload[entry].id)-1] = payload[entry];
  }
  game.storage.setItem("pokedex", JSON.stringify(pokedex));
});

socket.on('Receive typechart', function(payload){
  // typechart.push(payload);
  typechart = payload;
  game.storage.setItem("typechart", JSON.stringify(typechart));
});