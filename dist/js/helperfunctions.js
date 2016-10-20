function hexstring(color) {
 return '#' + ('000000' + color.toString(16)).substr(-6);
}

function inputform(placeHolder, max, InputType) {
  return {
    backgroundColor: 'transparent',
    borderColor: '#4090ff',
    borderRadius: 0,
    borderWidth: 1,
    cursorColor: '#ffff00',
    fill: Presets.fill,
    fillAlpha: 1,
    font: Presets.fontsize + 'px Arial' + Presets.font,
    // font: Presets.fontsize.toString() + 'px ' + Presets.font,
    // fontSize: Presets.fontsize.toString() + 'px ',
    height: 32,
    max: max,//(InputType != 'number' ? max : Math.pow(10, max)-1),
    padding: Presets.padding,
    placeHolder: placeHolder || ' ',
    stroke: 0,
    textAlign: 'left',
    // type: Fabrique.InputType[InputType],
    width: max*Presets.fontsize/1.5,
    zoom: true
  }
};

var textButton = {
  onOver: function  (whichbutton){
  whichbutton.parent.setAll('tint', Presets.highlightedstate);
  },
  onOut: function  (whichbutton){
    whichbutton.parent.setAll('tint', Presets.normalstate);
  },
  onClick: function  (whichbutton){
    whichbutton.parent.setAll('tint', Presets.pressedstate);
  },
  create: function (game, text, color) {
      var buttonelement = [];
      var textstyle =  {
        backgroundColor: hexstring(color),
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        // fontSize: Presets.fontsize.toString() + 'px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      buttonelement[0] = game.add.graphics(0, 0);
      buttonelement[1] = game.add.text(0, 0, text.toString().toLowerCase(), textstyle);
      buttonelement[0].beginFill(color, 1);
      buttonelement[0].drawRoundedRect(buttonelement[1].getBounds().x-Presets.padding, buttonelement[1].getBounds().y-Presets.padding, buttonelement[1].getBounds().width+2*Presets.padding, buttonelement[1].getBounds().height+Presets.padding, 9);
      buttonelement[0].endFill();
      buttonelement[0].inputEnabled = true;
      return buttonelement;
  },
  define: function (group, game, text, x, y, color) {
    group.addMultiple(this.create(game, text, color));
    group.x = x;
    group.y = y;
    group.onChildInputOver.add(this.onOver, game);
    group.onChildInputOut.add(this.onOut, game);
    group.onChildInputDown.add(this.onClick, game);
    group.setAll('tint', Presets.normalstate);
    return group;
  }
}

var numberButton = {
  onOver: function  (whichbutton){
  whichbutton.parent.setAll('tint', Presets.highlightedstate);
  },
  onOut: function  (whichbutton){
    whichbutton.parent.setAll('tint', Presets.normalstate);
  },
  onClick: function  (whichbutton){
    var newvalue = parseInt(whichbutton.parent.children[1].text) + whichbutton.value;
    whichbutton.parent.setAll('tint', Presets.pressedstate);
    if (newvalue >= 0 && newvalue < 10)
      whichbutton.parent.children[1].setText(newvalue.toString());
  },
  create: function (game, text, value, color) {
      var buttonelement = [];
      var textstyle =  {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        // fontSize: Presets.fontsize.toString() + 'px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      buttonelement[0] = game.add.graphics(0, 2);
      buttonelement[2] = game.add.graphics(0, 2);
      buttonelement[3] = game.add.graphics(0, 2);
      // buttonelement[0].inputEnabled = true;
      buttonelement[2].beginFill(0x000000, 0.5);
      buttonelement[2].lineStyle(0, 0xffffff, 1);
      buttonelement[2].moveTo(16, 0);
      buttonelement[2].lineTo(8, 0);
      buttonelement[2].lineTo(0, 12);
      buttonelement[2].lineTo(8, 24);
      buttonelement[2].lineTo(16, 24);
      buttonelement[2].lineTo(8, 12);
      buttonelement[2].lineTo(16, 0);
      buttonelement[2].endFill();
      buttonelement[2].inputEnabled = true;
      buttonelement[1] = game.add.text(buttonelement[2].getBounds().width+Presets.padding, 0, value.toString(), textstyle);
      buttonelement[3].beginFill(0x000000, 0.5);
      buttonelement[3].lineStyle(0, 0xffffff, 1);
      buttonelement[3].moveTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+0, 0);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+8, 0);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+16, 12);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+8, 24);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+0, 24);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+8, 12);
      buttonelement[3].lineTo(buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+Presets.padding*2+0, 0);
      buttonelement[3].endFill();
      buttonelement[3].inputEnabled = true;
      buttonelement[2].value = -1;
      buttonelement[3].value = 1;
      buttonelement[0].beginFill(color, 1);
      buttonelement[0].drawRoundedRect(buttonelement[2].getBounds().x-Presets.padding, buttonelement[1].getBounds().y-Presets.padding, buttonelement[1].getBounds().width+buttonelement[2].getBounds().width+buttonelement[3].getBounds().width+4*Presets.padding, buttonelement[1].getBounds().height+Presets.padding, 9);
      buttonelement[0].endFill();
      buttonelement[4] = game.add.text(0, buttonelement[1].getBounds().height, text.toString().toLowerCase(), textstyle);
      // buttonelement[4].anchor.setTo(0.5,0);
      // buttonelement[3].beginFill(color, 1);
      // buttonelement[3].drawRoundedRect(buttonelement[1].getBounds().x-Presets.padding, buttonelement[1].getBounds().y-Presets.padding, buttonelement[1].getBounds().width+2*Presets.padding, buttonelement[1].getBounds().height+Presets.padding, 9);
      // buttonelement[3].endFill();
      // buttonelement[3].inputEnabled = true;

      return buttonelement;
  },
  define: function (group, game, text, value, x, y, color) {
    group.addMultiple(this.create(game, text, value, color));
    group.x = x;
    group.y = y;
    group.onChildInputOver.add(this.onOver, game);
    group.onChildInputOut.add(this.onOut, game);
    group.onChildInputDown.add(this.onClick, game);
    group.setAll('tint', Presets.normalstate);
    return group;
  }
}


var textInput = {
  label: function(group, game, options){
    var style = {
      backgroundColor: 'transparent',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      // fontSize: Presets.fontsize.toString() + 'px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    };
    var temp = game.add.text(options.x, options.y, options.label+':', style);
    temp.x -= temp.getBounds().width;
    temp.anchor.setTo(0, 0.1);
    return temp;
  },
  input: function(group, game, options){
    return game.add.inputField(options.x+options.margin+options.divider, options.y, inputform(options.placeholder, options.charwidth, options.type));
  },
  create: function (group, game, options) {
    var fields = [];
    fields.push(this.input(group, game, options));
    if (options.label) {
      fields.push(this.label(group, game, options));
      fields[fields.length-1].y = fields[fields.length-2].y;
    }
    return fields;
  },
  define: function(group, game, options) {
      group.addMultiple(this.create(group, game, options));
      return group;
  }
}

var selector = {
  textinput: function(group, game, options){
    return game.add.inputField(options.x, options.y, {
    backgroundColor: Presets.bgcolor,
    borderColor: '#4090ff',
    borderRadius: 0,
    borderWidth: 1,
    cursorColor: '#ffff00',
    fill: Presets.fill,
    fillAlpha: 1,
    // font: 0.5*Presets.fontsize.toString() + 'px ' + Presets.font,
    font: '16px Arial' + Presets.font,
    height: 16,
    max: 11,
    padding: Presets.padding/2,
    placeHolder: ' ',
    textAlign: 'center',
    width: 100,
    zoom: true
  });
  },
  numberinput: function(group, game, options){
    return game.add.inputField(options.x, options.y, {
    backgroundColor: Presets.bgcolor,
    borderColor: '#4090ff',
    borderRadius: 0,
    borderWidth: 1,
    cursorColor: '#ffff00',
    fill: Presets.fill,
    fillAlpha: 1,
    // font: 0.5*Presets.fontsize.toString() + 'px ' + Presets.font,
    font: '24px Arial' + Presets.font,
    height: 16,
    max: maxpokes,
    min:1,
    padding: Presets.padding/2,
    placeHolder: ' ',
    textAlign: 'center',
    type: Fabrique.InputType['number'],
    width: 100,
    zoom: true
  });
  },
  validatename: function(name){
    var counter = 0;
    if (name.length < 1) return null;
    var namelength = name.length;
    while (( pokedex[counter].Pokemon.toLowerCase() != name.toLowerCase()) && (counter < pokedex.length-1)) {
      counter++;
    }
    if (counter == pokedex.length-1){
      while (namelength > 1 && pokedex[counter].Pokemon.toLowerCase().substr(0,namelength) != name.toLowerCase().substr(0,namelength)) {
        counter = 0;
        while (( pokedex[counter].Pokemon.toLowerCase().substr(0,namelength) != name.toLowerCase().substr(0,namelength)) && (counter < pokedex.length-1)) {
          counter++;
        }
        namelength--;
      }
    }
    if (counter != pokedex.length-1) {
      return counter+1;
    }
  },
  sprite: function(group, game, options) {
    return game.add.sprite(options.x, options.y, options.id);
  },
  set: function(group, value){
    if (!value) value = 1;
    group[0].setText(pokedex[parseInt(value)-1].Pokemon);
    group[1].frame = parseInt(value)-1;
    group[2].setText(value);
    return group;
  },
  update: function(child){
    if (child.value) {
      var value = (child.frame ? child.frame+1 : (isNaN(parseInt(child.value)) ? value = this.validatename(child.value) : child.value));
      this.set(child.parent.children, value);
    }
    return child.parent;
  },
  overlay: function (which) {
    overlayselect.create(which, 'A');
  },
  create: function (group, game, options) {
    var fields = [];
    fields.push(this.textinput(group, game, options));
    fields.push(this.sprite(group, game, options));
    fields[1].inputEnabled = true;
    fields[1].width = fields[1].height = fields[0].width;
    fields[1].y += fields[0].height;
    fields[1].events.onInputDown.add(this.overlay, this);
    fields.push(this.numberinput(group, game, options));
    fields[2].y += fields[0].height + fields[1].height;
    return fields;
  },
  define: function(group, game, options) {
      group.addMultiple(this.create(group, game, options));
      this.set(group.children, 1);
      // group.onChildInputDown.add(this.update, this);
      group.onChildInputOut.add(this.update, this);
      return group;
  }
}

function with_object(chain, params) {
  for (field in params) {
    chain[field] = params[field];
  }
  return chain;
}

Phaser.Group.prototype.addGroup = function (children, silent) {
  if (Array.isArray(children)) this.addMultiple(children, silent);
  else this.addChild(children);
  return this;
}

function setScale(group, size) {
  group.scale.setTo(size);
  if (group.mask) group.mask.scale.setTo(size);
}

function rate (teamtoassess) {
  var teamscore = 0;
  var assess = [];
  for (member in teamtoassess)
    assess[assess.length] = pokedex[teamtoassess[member]];
      for (member in assess){
        for (checktier in Tiers){
          if (Tiers[checktier] == assess[member].Tier) teamscore += 144/(parseInt(checktier)+1)+
            540-(assess[member]['HP']+assess[member]['Attack']+assess[member]['Defense']+assess[member]['Sp. Attack']+assess[member]['Sp. Defense']+assess[member]['Speed']);
        }
      }
  return Math.floor(teamscore);
}

function drawteam(group, members, name, color){
  var team = [];
  var TeamTier = 0;
  for (var currentmember = 0; currentmember < members.length; currentmember++){
    team.push(game.add.sprite(spritesheet.x*currentmember, 0, 'spritesheet', members[currentmember]));
    team[team.length-1].anchor.setTo(0.5);
      for (var check=0; check < Tiers.length; check++){
        if (pokedex[members[currentmember]].Tier == Tiers[check] && check > TeamTier) TeamTier = check;
      }
  }

  var textstyle =  {
    backgroundColor: hexstring(color),
    fill: Presets.fill,
    fillAlpha: 1,
    font: Presets.font,
    fontSize: Presets.fontsize.toString() + 'px ',
    fontWeight: 'Bold',
    textAlign: 'left',
    stroke: 0
  };
  var buttontext = game.add.text(spritesheet.x*members.length, 0, name.toLowerCase(), textstyle);
  buttontext.anchor.setTo(0, 0.5);
  var tiertext = game.add.text(spritesheet.x*(members.length+0.5) + buttontext.getBounds().width, 0, Tiers[TeamTier], textstyle);
  tiertext.anchor.setTo(0, 0.5);

  var buttonelement = game.add.graphics(0, 0);
  buttonelement.beginFill(color, 1)
    // .drawRoundedRect(-spritesheet.x/2-8, -spritesheet.y/2-8, spritesheet.x*(1.5+members.length)+buttontext.getBounds().width+tiertext.getBounds().width+16, spritesheet.y+16)
    .drawRoundedRect(-spritesheet.x/2-8, (spritesheet.y+Presets.padding*2 > buttontext.getBounds().height ? -spritesheet.y/2-8 : buttontext.getBounds().y), spritesheet.x*(1.5+members.length)+buttontext.getBounds().width+tiertext.getBounds().width+Presets.padding*2, (spritesheet.y+Presets.padding*2 > buttontext.getBounds().height ? spritesheet.y+Presets.padding*2 : buttontext.getBounds().height))
    .endFill()
    .inputEnabled = true;

  group.addGroup(buttonelement)
    .addGroup(buttontext)
    .addGroup(tiertext)
    .addGroup(team);
  group.setAll('tint', Presets.normalstate);
  return group;
}

function alphabeticalpokelist(requestedletter)  {
    var namelist = {};
    for (poke in pokedex) {
      var current = pokedex[poke].Pokemon.substr(0, 1);
      if (!namelist[current]) namelist[current] = [];
      namelist[current].push(pokedex[poke]);
    }
    for (letter in namelist) {
      namelist[letter].sort();
      if (requestedletter == letter) return namelist[letter];
    }
    return namelist;
}

var overlayselect = {
  // originx: 0, originy: 0, maxwidth: 0,
  renew: function (which) {
    var letter = which.parent.letter;
    destination = which.parent.parent.destination;
    which.parent.parent.destroy(true);
    this.create(destination, letter);
  },
  send: function (which) {
    selector.set(which.parent.destination.parent.children, which.frame+1)
    which.parent.destroy(true);
  },
  create: function (destination, show) {
    var overlaygraphic = game.add.graphics(0, 0);
    var overlayletters = [];
    var group = game.add.group();
    var pokemongroup = game.add.group();
    var maxwidth = 0;

    overlaycurrentposition = {x: 0, y: 0};

    var alphabet = [];
    for (letter in alphabeticalpokelist()){
      if (!show) show = letter;
      alphabet.push(letter);
    }
    alphabet.sort();
    for (letter in alphabet) {
      textButton.define(overlayletters[overlayletters.length] = game.add.group(), game, '  ' + alphabet[letter] + '  ', overlaycurrentposition.x, overlaycurrentposition.y, sectioncolors[5]);
      overlaycurrentposition.x+=overlayletters[overlayletters.length-1].getBounds().width+Presets.padding;
      if (overlaycurrentposition.x > maxwidth) maxwidth = overlaycurrentposition.x;
      if (overlaycurrentposition.x+overlayletters[overlayletters.length-1].getBounds().width+Presets.padding > game.world.width){
          overlaycurrentposition.x = 0;
          overlaycurrentposition.y += overlayletters[overlayletters.length-1].getBounds().height+Presets.padding;
      }
      overlayletters[overlayletters.length-1].letter = alphabet[letter];
      overlayletters[overlayletters.length-1].onChildInputDown.add(this.renew, this);
    }
    overlaycurrentposition.y += overlayletters[overlayletters.length-1].getBounds().height+Presets.padding;
    pokemongroup = this.list(pokemongroup, 0, overlaycurrentposition.y, show, maxwidth);
    overlaycurrentposition.y = pokemongroup.getBounds().y+pokemongroup.getBounds().height;

    overlaygraphic.beginFill(0xffffff);
    overlaygraphic.drawRect(0, 0, maxwidth, overlaycurrentposition.y);
    overlaygraphic.endFill();

    group.addChild(overlaygraphic);
    group.addMultiple(overlayletters);
    group.addMultiple(pokemongroup);
    group.destination = destination;
    return group;
  },
  list: function (group, originx, originy, letter, maxwidth) {
      var list = [];
      var pokemon = alphabeticalpokelist(letter);
      var x = originx;
      var y = originy;
      for (poke in pokemon) {
        list[list.length] = game.add.sprite(x, y, 'spritesheet');
        list[list.length-1].frame = pokemon[poke].id-1;
        list[list.length-1].inputEnabled = true;
        list[list.length-1].events.onInputDown.add(this.send, this);
        x += list[list.length-1].width+Presets.padding;
        if (x+list[list.length-1].width+Presets.padding > maxwidth){
          x = originx;
          y += list[list.length-1].height+Presets.padding;
        }
      }
      y += list[list.length-1].height+Presets.padding;
        group.addMultiple(list);
        return group;
  }
}

Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return Number(x);
  }
  return x > 0 ? 1 : -1;
}