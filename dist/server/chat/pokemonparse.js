exports.findpoke = function(name) {
  findpokeloop: for (let i = 0; i < cached.pokedex.length; i++) {
    if (cached.pokedex[i].Pokemon.toLowerCase() == name.toLowerCase()) return i + 1
  }
  return -1
}

exports.validatetype = function(type) {
  type = capitalize(type.toLowerCase())
  Object.keys(cached.typechart).forEach((elementindex, index) => {
    if (type.indexOf(cached.typechart[elementindex]['Type']) >= 0) type = cached.typechart[elementindex]['Type']
  })
  return type
}

exports.weakTo = function(type1, type2) {
  type2 = type2 || ''
  let weaknesses = []
  type1 = validatetype(type1)
  if (type2) type2 = validatetype(type2)
  Object.keys(cached.typechart).forEach((elementindex, index) => {
    if (cached.typechart[elementindex][type1] * (type2 == '' ? 1 : cached.typechart[elementindex][type2]) > 1) {
      weaknesses.push(cached.typechart[elementindex]['Type'])
    }
  })
  return weaknesses
}

exports.resistantTo = function(type1, type2) {
  type2 = type2 || ''
  let typecalc = {
    resist: [],
    immune: []
  }
  type1 = validatetype(type1)
  if (type2) type2 = validatetype(type2)
  Object.keys(cached.typechart).forEach((elementindex, index) => {
    if (cached.typechart[elementindex][type1] * (type2 == '' ? 1 : cached.typechart[elementindex][type2]) < 1) {
      if (cached.typechart[elementindex][type1] * (type2 == '' ? 1 : cached.typechart[elementindex][type2]) == 0) { typecalc.immune.push(cached.typechart[elementindex]['Type']) } else typecalc.resist.push(cached.typechart[elementindex]['Type'])
    }
  })
  return typecalc
}

exports.effective = function(type) {
  let effectiveness = []
  type = validatetype(type)
  Object.keys(cached.typechart).forEach((elementindex, index) => {
    if (cached.typechart[elementindex]['Type'] == type) {
      Object.keys(cached.typechart[elementindex]).forEach((key, value) => {
        if (key != 'id' && parseInt(cached.typechart[elementindex][key]) > 1) effectiveness.push(key)
      })
    }
  })
  return effectiveness
}
