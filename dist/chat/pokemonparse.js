function findpoke(name) {
 findpokeloop: for (var i = 1; i < pokedex.length; i++) {
  if (pokedex[i].Pokemon.toLowerCase() == name.toLowerCase()) return i;
 }
 return -1;
}


function validatetype(type) {
 type = capitalize(type.toLowerCase());
 Object.keys(typechart).forEach((elementindex, index) => {
  if (type.indexOf(typechart[elementindex]['Type']) >= 0) type = typechart[elementindex]['Type'];
 });
 return type;
}

function weakTo(type1, type2) {
 type2 = type2 || '';
 var weaknesses = [];
 type1 = validatetype(type1);
 if (type2) type2 = validatetype(type2);
 Object.keys(typechart).forEach((elementindex, index) => {
  if (typechart[elementindex][type1] * (type2 == "" ? 1 : typechart[elementindex][type2]) > 1) {
   weaknesses.push(typechart[elementindex]["Type"]);
  }
 });
 return weaknesses;
}

function resistantTo(type1, type2) {
  type2 = type2 || '';
 var typecalc = {
   resist:  [],
   immune:  []
 }
 type1 = validatetype(type1);
 if (type2) type2 = validatetype(type2);
 Object.keys(typechart).forEach((elementindex, index) => {
  if (typechart[elementindex][type1] * (type2 == "" ? 1 : typechart[elementindex][type2]) < 1) {
   if (typechart[elementindex][type1] * (type2 == "" ? 1 : typechart[elementindex][type2]) == 0)
     typecalc.immune.push(typechart[elementindex]["Type"]);
     else typecalc.resist.push(typechart[elementindex]["Type"]);
  }
 });
 return typecalc;
}

function effective(type) {
 var effectiveness = [];
 type = validatetype(type);
 Object.keys(typechart).forEach((elementindex, index) => {
  if (typechart[elementindex]["Type"] == type) {
   Object.keys(typechart[elementindex]).forEach((key, value) => {
    if (key != 'id' && parseInt(typechart[elementindex][key]) > 1) effectiveness.push(key);
   });
  }
 });
 return effectiveness;
}
