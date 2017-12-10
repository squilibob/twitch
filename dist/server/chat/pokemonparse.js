capitalize = function (n) {
  return n === undefined ? '' : n[0].toUpperCase() + n.substr(1)
}

function validatetype(types) {
  return types
    .map(type => typechart.find(item => type.toLowerCase().includes(item.id.toLowerCase())))
    .filter(type => {
      return type})
    .map(item => item.id)
}

function compareTypeProperty(value, comparison) {
  return {
    weak: value > 1,
    resist: value < 1,
    immune: value === 0
  }[comparison]
}

exports.typeMatchup = function(types, comparison) {
  types = validatetype(types)
  return typechart
    .filter(type => compareTypeProperty(types
        .map(name => type.Elements[name])
        .reduce((a,b) => a * b, 1), comparison))
    .map(type => type.id)
}

exports.effective = function(types) {
  types = validatetype(types)
  return types
    .map(type => typechart.find(item => item.id === type))
    .map(type => {
      let response = []
      for (key in type.Elements) {
        if (type.Elements[key] > 1) {
          response.push(key)
        }
      }
      return response
    })
    .reduce((a,b) => b.concat(a))
}
