module.exports = async function(expressServer) {
  return {
    pokedex: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Pokedex'),
    typechart: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'TypeChart'),
    Moves: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Moves'),
    Abilities: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Abilities'),
    Bttv: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Bttv'),
    Ffz: await expressServer.dbcall.gettable(expressServer.database, expressServer.connection, 'Ffz')
  }
}