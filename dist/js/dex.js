var pokedex = [];
var typechart = [];

socket.on('Receive pokedex', function(payload){
  console.log(payload);
  pokedex[payload.id-1]=payload;
  game.storage.setItem("pokedex", JSON.stringify(pokedex));
});

socket.on('Receive typechart', function(payload){
  typechart.push(payload);
  game.storage.setItem("typechart", JSON.stringify(typechart));
});