project.Pokedex = (function (game) {
  let
    filter,
    fullteam,
    rated,
    totalscore,
    pokemoncontainer,
    pokemonname,
    tierlabel,
    tier,
    type2bg,
    type2,
    typebg,
    type1,
    statcontainer,
    statbar,
    statvaluelabel,
    statname,
    stattotal,
    infocontainer,
    weaklabel,
    weakto,
    weaktolabel,
    resistslabel,
    resistantto,
    resistanttolabel,
    immunelabel,
    immuneto,
    immunetolabel,
    recommendedcontainer,
    recommendedlabel,
    abilitylabel,
    ability,
    itemlabel,
    item,
    moveslabel,
    move1,
    move2,
    move3,
    move4,
    misccontainer,
    gender,
    genderlabel,
    evslabel,
    ev,
    explabel,
    expv,
    masslabel,
    mass,
    catchlabel,
    catchr,
    hatchlabel,
    hatch,
    egglabel,
    egg,
    evolvelabel,
    evolve,
    loclabel,
    loc,
    bg,
    bg1fade,
    bg2fade,
    bonusgroup,
    winner

  let
    scale,
    statvalue,
    statmax,
    menu
})

project.Pokedex.prototype = {
  preload: function () {
    game.load.spritesheet('spritesheet', spritesheet.src, spritesheet.x, spritesheet.y, maxpokes)
    game.load.spritesheet('dexspritesheet', dexspritesheet.src, dexspritesheet.x, dexspritesheet.y, maxpokes)
    game.load.script('menu', '/js/menubuttons.js')
  },
  // text: function(obj, text: "", fontsize: 12, color: 0x000000, newx: 0, newy: 0) {
  text: function (params) {
    if (!params.text) params.text = ''
    if (!params.fontsize) params.fontsize = 12
    if (!params.color) params.color = 0x000000
    if (!params.newx) params.newx = 0
    if (!params.newy) params.newy = 0
    params.obj.setText(params.text)
    // params.obj.font = fontsize+"px Extra-Cool";
    params.obj.style.fill = hexstring(params.color)
    params.obj.x = params.newx
    params.obj.y = params.newy
    params.obj.anchor.setTo(0, 0)
    return params.obj
  },

  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)

    filter = new Phaser.Filter(game, null, fragmentSrc)

    statvalue = [0, 0, 0, 0, 0, 0]
    statmax = [0, 0, 0, 0, 0, 0]

    this.init()

    fullteam = this.add.group()

      // if (Presets.externalteams) {
      //   if (game.storage.getItem("externalteams")) {
      //     winner = JSON.parse(game.storage.getItem("externalteams"));
      //     team_to_rate = winner.team;
      //   }
      // };
    for (let name in teams) {
      if (!team_name) team_name = name
      if (!teams[team_name]) team_name = name
    }
    if (!team_to_rate) team_to_rate = teams ? teams[team_name] : [0, 3, 6]
    let teamarray = []
    totalbonuses = 0

    for (let currentmember = 0; currentmember < team_to_rate.length; currentmember++) {
      teamarray.push(game.add.sprite(spritesheet.x * currentmember, 0, 'spritesheet', team_to_rate[currentmember]))
      teamarray.last.inputEnabled = true
    }

    fullteam.addMultiple(teamarray)
    fullteam.x = pokedexoptions.team.x
    fullteam.y = pokedexoptions.team.y
    fullteam.onChildInputDown.add(this.change, this)
    this.change(teamarray[0])

      // if(teams) {
      //   if(teams[team_name])
      //     for (thismember in teams[team_name])
      //       team_to_rate.push(pokedex[teams[team_name][thismember]]);
      //   else if (Array.isArray(teams)) team_to_rate = teams;
      // }

    if (pokedexoptions.scoring) {
        // rated = game.add.text(fullteam.getBounds().x+fullteam.getBounds().width, fullteam.getBounds().y, ' = ' + rate(team_to_rate), textstyle);
      let textpad = ''
      paddingloop: for (let textpadding = 0; textpadding < rate(team_to_rate).toString().length; textpadding++) textpad += '0'
      textButton.define(rated = game.add.group(), game, (textpad + rate(team_to_rate)).substr(-textpadding), fullteam.getBounds().x + fullteam.getBounds().width + 8, fullteam.getBounds().y + 8, sectioncolors[4])
      rated.onChildInputDown.add(this.toggle, this)

      bonusgroup = this.add.group()

      let bonuses = []
      numberButton.define(bonuses[0] = this.add.group(), game, 'kills', 0, 0, 0, sectioncolors[1])
      numberButton.define(bonuses[1] = this.add.group(), game, 'crits', 0, bonuses[0].getBounds().x + bonuses[0].getBounds().width + Presets.padding * 2, 0, sectioncolors[3])
      numberButton.define(bonuses[2] = this.add.group(), game, 'hax', 0, bonuses[1].getBounds().x + bonuses[1].getBounds().width + Presets.padding * 2, 0, sectioncolors[2])
      numberButton.define(bonuses[3] = this.add.group(), game, 'law', 0, bonuses[2].getBounds().x + bonuses[2].getBounds().width + Presets.padding * 2, 0, sectioncolors[0])
      bonusgroup.addMultiple(bonuses)

      bonusgroup.x = fullteam.getBounds().x + Presets.padding
      bonusgroup.y = fullteam.getBounds().y + fullteam.getBounds().height + Presets.padding
      setScale(bonusgroup, 0.8)
      textButton.define(totalscore = game.add.group(), game, (textpad + this.total().toString()).substr(-textpadding), rated.getBounds().x + rated.getBounds().width + Presets.padding * 2, rated.getBounds().y + Presets.padding * 2, sectioncolors[1])
      totalscore.onChildInputDown.add(this.submit, this)
      setScale(totalscore, (rated.getBounds().height + bonusgroup.getBounds().height * bonusgroup.scale.y - Presets.padding) / totalscore.getBounds().height)
    }
  },
  total: function () {
    let runningtotal = 0
    let thisbonus
    for (countchild in bonusgroup.children) {
      thisbonus = parseInt(bonusgroup.children[countchild].children[1].text)
        // console.log(parseInt(countchild));
        runningtotal += [thisbonus * points_system.score_for_kill,
         thisbonus * points_system.score_for_crit,
         thisbonus * points_system.score_for_hax,
        -(thisbonus * points_system.penalty_for_clause)][parseInt(countchild)]

      // switch (parseInt(countchild)) {
      //   case 0: runningtotal += thisbonus * points_system.score_for_kill; break
      //   case 1: runningtotal += thisbonus * points_system.score_for_crit; break
      //   case 2: runningtotal += thisbonus * points_system.score_for_hax; break
      //   case 3: runningtotal -= thisbonus * points_system.penalty_for_clause; break
      // }
    }
      // console.log(thisbonus, runningtotal);
    return runningtotal + parseInt(rated.children[1].text)
  },
  toggle: function () {
    let can_change = true
    for (max in statmax) {
      if (statvalue[max] != statmax[max]) can_change = false
    }
    if (can_change) {
        // pokemonsprite.visible = !pokemonsprite.visible;
      bgcontainer.visible = !bgcontainer.visible
      pokemoncontainer.visible = !pokemoncontainer.visible
      statcontainer.visible = !statcontainer.visible
      infocontainer.visible = !infocontainer.visible
      recommendedcontainer.visible = !recommendedcontainer.visible
      misccontainer.visible = !misccontainer.visible
    }
  },

  redraw: function (statcount) {
    switch (statcount) {
      case 0: stat = 'HP'; statcolor = HPcolor; break
      case 1: stat = 'Attack'; statcolor = Attcolor; break
      case 2: stat = 'Defense'; statcolor = Defcolor; break
      case 3: stat = 'Sp. Attack'; statcolor = SpAttcolor; break
      case 4: stat = 'Sp. Defense'; statcolor = SpDefcolor; break
      case 5: stat = 'Speed'; statcolor = Specolor; break
    }
    statbar[statcount]
      .clear()
      .beginFill(statcolor)
      .drawRect(statname[statcount].x, statname[statcount].y, 2 * statvalue[statcount], scale / 4)
      .endFill()
    statvaluelabel[statcount].x = statbar[statcount].getBounds().width
    statvaluelabel[statcount].setText(statvalue[statcount])
  },
  gradient: function (options) {
    let myBitmap = game.add.bitmapData(options.length, options.height)
    let grd = myBitmap.context.createLinearGradient(0, 0, options.length, 1)
    grd.addColorStop(options.balance[0], hexstring(options.start))
    grd.addColorStop(options.balance[1], hexstring(options.end))
    myBitmap.context.fillStyle = grd
    myBitmap.context.fillRect(0, 0, options.length, options.height)
    return myBitmap
  },
  submit: function () {
      // if (winner)
    socket.emit('update leaderboard', {
          // "id": lastraffleuser ? lastraffleuser : ' ',
      'id': game.storage.getItem('id'),
      'score': this.total(),
      'teamname': team_name,
      'team': teams[team_name]
          // "teamname": winner.team_name,
          // "team": winner.team
    })
  },
  overlay: function (destination) {
    overlayselect.create(destination, pokemonname.text.substr(0, 1).toUpperCase())
  },
  change: function (which) {
    if (!pokemoncontainer.visible) return this

    let color = {
      Green: 0x00ff00,
      Red: 0xff0000,
      Blue: 0x0000ff,
      White: 0xffffff,
      Brown: 0xaf7500,
      Yellow: 0xffff00,
      Purple: 0x7f00ff,
      Pink: 0xff00ff,
      Gray: 0xafafaf,
      Black: 0xafafaf
    }

    thepokemon = which.frame
    let dexinfo = pokedex[thepokemon]
    let alphacolor = 1
    scale = dexspritesheet.y * 1
    let span = 1
    let textoffset = 8
    let textcolor = 0x000000
    let softcolor = 0x7f7f7f
    let brightcolor = 0xffffff

    pokemoncontainer.x = pokedexoptions.dex.x
    pokemoncontainer.y = pokedexoptions.dex.y
    let x = 0
    let y = 0

    pokemonname = this.text({obj: pokemonname, text: dexinfo['Pokemon'].toLowerCase(), fontsize: scale / 4, color: brightcolor, newx: x + textoffset, newy: y})
    y += pokemonname.getBounds().height

    let pokemonsprite = game.add.sprite(0, 0, 'dexspritesheet')

    pokemonsprite.x = x
    pokemonsprite.y = y
    pokemonsprite.frame = thepokemon
    pokemonsprite.scaleX = scale / dexspritesheet.x
    pokemonsprite.scaleY = scale / dexspritesheet.y
    pokemonsprite.inputEnabled = true
    pokemonsprite.events.onInputDown.add(this.overlay, pokemonsprite)

    pokemoncontainer.addChild(pokemonsprite)
    y += scale
    tierlabel = this.text({obj: tierlabel, text: 'tier ', fontsize: scale / 4, color: brightcolor, newx: x, newy: y})
    tier = this.text({obj: tier, text: dexinfo['Tier'], fontsize: scale / 4, color: brightcolor, newx: x + tierlabel.getBounds().width, newy: y})
    y += tierlabel.getBounds().height * 0.9
    typebg.anchor.setTo(0.5, 0.5)
    type2bg.anchor.setTo(0.5, 0.5)
    type2bg.clear()
    if (dexinfo.Secondary) {
      type2 = this.text({obj: type2, text: dexinfo['Secondary'].toLowerCase(), fontsize: scale / 4, color: textcolor, newx: x + textoffset, newy: y})
      Object.keys(colors).forEach(function (element, index) {
        if (element == dexinfo['Secondary']) type2bg.beginFill(colors[element]).drawRoundedRect(x, y + type2.getBounds().height, scale * 0.9, scale / 4, scale / 8).endFill()
      })
    } else {
      span = 2
      type2 = this.text({obj: type2, text: ''})
    }
    Object.keys(colors).forEach(function (element, index) {
      if (element == dexinfo['Type']) typebg.clear().beginFill(colors[element]).drawRoundedRect(x, y, scale * 0.9, span * scale / 4, scale / 8).endFill()
    })
    type1 = this.text({obj: type1, text: dexinfo['Type'].toLowerCase(), fontsize: scale / 4, color: textcolor, newx: x + textoffset, newy: y + (span - 1) * type2.getBounds().height / 2})
    type2.y = y + type1.getBounds().height
      //    // this.setState({maxstatvalue: statmax}) ;
      //   // this.setState({statvalue: statmax});
    y += Math.floor(scale / 4)
    infocontainer.x = pokedexoptions.dex.x
    infocontainer.y = pokemoncontainer.getBounds().y + pokemoncontainer.getBounds().height
    x = pokedexoptions.dex.x
    y = 0
    weaklabel = this.text({obj: weaklabel, text: 'weak to ', fontsize: scale / 4, color: softcolor, newx: x, newy: y + textoffset})
    x += scale
    let weaktoindex = -1
    let contextthis = this
    Object.keys(typechart).forEach(function (elementindex, index) {
      if (typechart[elementindex][dexinfo['Type']] * (dexinfo['Secondary'] == '' ? 1 : typechart[elementindex][dexinfo['Secondary']]) > 1) {
        weaktoindex++
        Object.keys(colors).forEach(function (element, index) {
          if (element == typechart[elementindex]['Type']) weakto[weaktoindex].beginFill(colors[element]).drawRoundedRect(x, y + 8, scale, scale / 4, scale / 8).endFill()
        })
        weaktolabel[weaktoindex] = contextthis.text({obj: weaktolabel[weaktoindex], text: typechart[elementindex]['Type'].toLowerCase(), fontsize: scale / 4, color: textcolor, newx: x + textoffset, newy: y + textoffset})
        x += scale
      }
    })
    for (let weakloop = 0; weakloop <= weaktoindex; weakloop++) {
      infocontainer.addChild(weakto[weakloop])
      infocontainer.addChild(weaktolabel[weakloop])
    }
    for (clearlist = weaktoindex + 1; clearlist < weakto.length; clearlist++) {
      weakto[clearlist].clear()
      weaktolabel[clearlist] = this.text({obj: weaktolabel[clearlist], text: ''})
    }
    x = pokedexoptions.dex.x
    y += Math.floor(scale / 4) + textoffset
    resistslabel = this.text({obj: resistslabel, text: 'resists ', fontsize: scale / 4, color: softcolor, newx: x, newy: y + textoffset})
    x += scale

    let resistanttoindex = -1
    contextthis = this
    Object.keys(typechart).forEach(function (elementindex, index) {
      if (typechart[elementindex][dexinfo['Type']] * (dexinfo['Secondary'] == '' ? 1 : typechart[elementindex][dexinfo['Secondary']]) < 1 && typechart[elementindex][dexinfo['Type']] * (dexinfo['Secondary'] == '' ? 1 : typechart[elementindex][dexinfo['Secondary']]) > 0) {
        resistanttoindex++
        Object.keys(colors).forEach(function (element, index) {
          if (element == typechart[elementindex]['Type']) resistantto[resistanttoindex].beginFill(colors[element]).drawRoundedRect(x, y + 8, scale, scale / 4, scale / 8)
        })
        resistanttolabel[resistanttoindex] = contextthis.text({obj: resistanttolabel[resistanttoindex], text: typechart[elementindex]['Type'].toLowerCase(), fontsize: scale / 4, color: textcolor, newx: x + textoffset, newy: y + textoffset})
        x += scale
      }
    })
    for (let resistantloop = 0; resistantloop <= resistanttoindex; resistantloop++) {
      infocontainer.addChild(resistantto[resistantloop])
      infocontainer.addChild(resistanttolabel[resistantloop])
    }
    for (clearlist = resistanttoindex + 1; clearlist < resistantto.length; clearlist++) {
      resistantto[clearlist].clear()
      resistanttolabel[clearlist] = this.text({obj: resistanttolabel[clearlist], text: ''})
    }

    x = pokedexoptions.dex.x
    y += Math.floor(scale / 4) + textoffset
    immunelabel = this.text({obj: immunelabel, text: 'immune ', fontsize: scale / 4, color: softcolor, newx: x, newy: y + textoffset})
    x += scale
    let immunetoindex = -1
    contextthis = this
    Object.keys(typechart).forEach(function (elementindex, index) {
      if (typechart[elementindex][dexinfo['Type']] * (dexinfo['Secondary'] == '' ? 1 : typechart[elementindex][dexinfo['Secondary']]) == 0) {
        immunetoindex++
        Object.keys(colors).forEach(function (element, index) {
          if (element == typechart[elementindex]['Type']) immuneto[immunetoindex].beginFill(colors[element]).drawRoundedRect(x, y + textoffset, scale, scale / 4, scale / 8)
        })
        immunetolabel[immunetoindex] = contextthis.text({obj: immunetolabel[immunetoindex], text: typechart[elementindex]['Type'].toLowerCase(), fontsize: scale / 4, color: textcolor, newx: x + textoffset, newy: y + textoffset})
        x += scale
      }
    })
    for (let immuneloop = 0; immuneloop <= immunetoindex; immuneloop++) {
      infocontainer.addChild(immuneto[immuneloop])
      infocontainer.addChild(immunetolabel[immuneloop])
    }
    for (clearlist = immunetoindex + 1; clearlist < immuneto.length; clearlist++) {
      immuneto[clearlist].clear()
      immunetolabel[clearlist] = this.text({obj: immunetolabel[clearlist], text: ''})
    }
      // infocontainer.cache(bounds.x, bounds.y, bounds.width*2, bounds.height*2);
      // x = pokedexoptions.dex.x;
      // y += Math.floor(scale/4)+textoffset*2;

      // if (this.state.scrollfrequency < this.props.freq / 2)      {
      // recommendedcontainer.visible = true;
      // misccontainer.visible = false;
    recommendedcontainer.x = pokedexoptions.dex.x
    recommendedcontainer.y = infocontainer.getBounds().y + infocontainer.getBounds().height
    x = pokedexoptions.dex.x
    y = 0

    abilitylabel = this.text({obj: abilitylabel, text: 'abilities ', fontsize: scale / 4, color: softcolor, newx: x, newy: y})
      // abilitylabel.visible = (dexinfo["Ability"].toLowerCase() != '' );
    x += scale
    ability = this.text({obj: ability, text: dexinfo['Ability'].join(', ').toLowerCase(), fontsize: scale / 4, color: brightcolor, newx: x, newy: y})

      // recommendedlabel = this.text({obj : recommendedlabel, text : "recommended ", fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      // y += Math.floor(scale/4);
      // if (dexinfo["Item"] != "") {
      //   x = pokedexoptions.dex.x;
      //   y += Math.floor(scale/4);

      //   itemlabel = this.text({obj : itemlabel, text : "item ", fontsize : scale/4, color : softcolor, newx : x, newy : y});
      //   x += scale;
      //   item = this.text({obj : item, text : dexinfo["Item"].toLowerCase(), fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      // }
      // itemlabel.visible = (dexinfo["Item"].toLowerCase() != '' );
      // item.visible = (dexinfo["Item"].toLowerCase() != '' );
      // if (dexinfo["Move"]) {
      //   x = pokedexoptions.dex.x;
      //   y += Math.floor(scale/4);
      //   moveslabel = this.text({obj : moveslabel, text : "moves ", fontsize : scale/4, color : softcolor, newx : x, newy : y});
      //   moveslabel.visible = true;

      //   x += scale;
      //   move1 = this.text({obj : move1, text : dexinfo["Move"][0].toLowerCase(), fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      //   move1.visible = true;
      //   x += scale*2;
      //   move2 = this.text({obj : move2, text : dexinfo["Move"][1].toLowerCase(), fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      //   move2.visible = (dexinfo["Move2"] != undefined);
      //   x -= scale*2;
      //   y += Math.floor(scale/4);
      //   move3 = this.text({obj : move3, text : dexinfo["Move"][2].toLowerCase(), fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      //   move3.visible = (dexinfo["Move3"] != undefined);
      //   x += scale*2;
      //   move4 = this.text({obj : move4, text : dexinfo["Move"][3].toLowerCase(), fontsize : scale/4, color : brightcolor, newx : x, newy : y});
      //   move4.visible = (dexinfo["Move4"] != undefined);
      // }
      // else {
      //   moveslabel.visible = false;
      //   move1.visible = false;
      //   move2.visible = false;
      //   move3.visible = false;
      //   move4.visible = false;
      // }
      //    // }

      // x = pokedexoptions.dex.x;
      // y += Math.floor(scale/4);

      // else {
      // recommendedcontainer.visible = false;
      // misccontainer.visible = true;
    misccontainer.x = pokedexoptions.dex.x
    misccontainer.y = recommendedcontainer.getBounds().y + recommendedcontainer.getBounds().height
      // x = 0;
      // y = 0;

    if (dexinfo['Gender'] >= 0) {
      let genderwidth = scale * 2 - textoffset
      let genderbalance = []
      let gendertext = ''
      if (Math.sign((50 - dexinfo['Gender']) * -2) > 0) genderbalance.push((50 - dexinfo['Gender']) * -2 / 100)
      else genderbalance.push(0)
      if (Math.sign((50 - dexinfo['Gender']) * -2) < 0) genderbalance.push(1 - (50 - dexinfo['Gender']) * 2 / 100)
      else genderbalance.push(1)
      gender.loadTexture(this.gradient({length: genderwidth, height: scale / 4, balance: genderbalance, start: Femalecolor, end: Malecolor}))
      // gender.x = x;
      // gender.y = y;

      // gender.sendToBack();

      gender.visible = true
      gendertext = (Math.sign((50 - dexinfo['Gender']) * -2) < 0 ? 'male ' + (100 - dexinfo['Gender']) : 'female ' + dexinfo['Gender']) + '%'
      genderlabel = this.text({obj: genderlabel, text: gendertext, fontsize: scale / 4, color: textcolor, newy: y})
      genderlabel.x = genderwidth / 2 - genderlabel.getBounds().width / 2
      genderlabel.y = y
      genderlabel.visible = true
      x += scale * 2
    } else {
      gender.visible = false
      genderlabel.visible = false
    }
      // ability.visible = (dexinfo["Ability"].toLowerCase() != '' );

      // evslabel = this.text({obj: evslabel, text: "evs: ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      // let evlist = '';
      // for (ev in dexinfo['EVs']){
      //   evlist += ev + ': ' + dexinfo['EVs'][ev] + ' ';
      // }
      // if (dexinfo["EVHP"] > 0) evlist += "hp ";
      // if (dexinfo["EVHP"] > 1) evlist += "x" + dexinfo["EVHP"] + " ";
      // if (dexinfo["Atk"] > 0) evlist += "att ";
      // if (dexinfo["Atk"] > 1) evlist += "x" + dexinfo["Atk"] + " ";
      // if (dexinfo["Def"] > 0) evlist += "def ";
      // if (dexinfo["Def"] > 1) evlist += "x" + dexinfo["Def"] + " ";
      // if (dexinfo["SpA"] > 0) evlist += "spatt ";
      // if (dexinfo["SpA"] > 1) evlist += "x" + dexinfo["SpA"] + " ";
      // if (dexinfo["SpD"] > 0) evlist += "spdef ";
      // if (dexinfo["SpD"] > 1) evlist += "x" + dexinfo["SpD"] + " ";
      // if (dexinfo["Spe"] > 0) evlist += "speed ";
      // if (dexinfo["Spe"] > 1) evlist += "x" + dexinfo["Spe"] + " ";
      // ev = this.text({obj: ev, text: evlist, fontsize: scale/4, color: brightcolor, newx: x+textoffset+evslabel.getBounds().width, newy: y});
      // x = pokedexoptions.dex.x;
      // y += scale/4;
      // explabel = this.text({obj: explabel, text: "base xp: ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      // expv = this.text({obj: expv, text: dexinfo["EXPV"], fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      // x += scale*2;
      // masslabel = this.text({obj: masslabel, text: "Mass: ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      // mass = this.text({obj: mass, text: dexinfo["Mass"], fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      // x += scale*2;
      // catchlabel = this.text({obj: catchlabel, text: "catch ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      // catchlabel.visible = (dexinfo["Catch"] > 0);
      // catchr = this.text({obj: catchr, text: dexinfo["Catch"], fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      // catchr.visible = (dexinfo["Catch"] > 0);
      // x = pokedexoptions.dex.x;
      // y +=scale/4;
      // if (dexinfo["Hatch"]) {
      //   hatchlabel.visible = true;
      //   hatch.visible = true;
      //   hatchlabel = this.text({obj: hatchlabel, text: "hatch ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      //   hatch = this.text({obj: hatch, text: dexinfo["Hatch"], fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      //   x += scale*2;
      // }
      // else {
      //   hatchlabel.visible = false;
      //   hatch.visible = false;
      // }
      // if (dexinfo["Egg Group I"]) {
      //   egglabel.visible = true;
      //   egg.visible = true;
      //   egglabel = this.text({obj: egglabel, text: "egg ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      //   egg = this.text({obj: egg, text: dexinfo["Egg Group I"].toLowerCase() + "   " + dexinfo["Egg Group II"].toLowerCase(), fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      // }
      // else {
      //   egglabel.visible = false;
      //   egg.visible = false;
      // }
      //   x = pokedexoptions.dex.x;
      //   y +=scale/4;
      //   if (dexinfo["Evolve"] != "0" && dexinfo["Evolve"].toLowerCase() != 'n') {
      //   evolvelabel = this.text({obj: evolvelabel, text: "evolves: ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      //   evolvelabel.visible = true;
      //   evolve = this.text({obj: evolve, text: dexinfo["Evolve"].toLowerCase(), fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      //   evolve.visible = true;
      //   x = pokedexoptions.dex.x;
      //   y +=scale/4;
      // }
      // else {
      //   evolvelabel.visible = false;
      //   evolve.visible = false;
      // }
      // if (dexinfo["locationORAS"] != "") {
      //   loclabel = this.text({obj: loclabel, text: "location: ", fontsize: scale/4, color: softcolor, newx: x, newy: y});
      //   loclabel.visible = true;
      //   loc = this.text({obj: loc, text: dexinfo["locationORAS"].toLowerCase(), fontsize: scale/4, color: brightcolor, newx: x+scale, newy: y});
      //   loc.visible = true;
      // }
      // else {
      //   loclabel.visible = false;
      //   loc.visible = false;
      // }

    statcontainer.x = 0 + scale
    statcontainer.y = pokedexoptions.dex.y
    x = 0
    y = 0

    span = 2
    let stat, statcolor
    for (let statcount = 0; statcount <= 5; statcount++) {
      switch (statcount) {
        case 0: stat = 'HP'; statcolor = HPcolor; break
        case 1: stat = 'Attack'; statcolor = Attcolor; break
        case 2: stat = 'Defense'; statcolor = Defcolor; break
        case 3: stat = 'Sp. Attack'; statcolor = SpAttcolor; break
        case 4: stat = 'Sp. Defense'; statcolor = SpDefcolor; break
        case 5: stat = 'Speed'; statcolor = Specolor; break
      }
      statmax[statcount] = dexinfo[stat]

      y += Math.floor(scale / 4)
      if (stat.length > 9) stat = stat.substring(0, 1) + stat.substring(4, 5)
      else stat = stat.substring(0, 3)
      statname[statcount] = this.text({obj: statname[statcount], text: stat, fontsize: scale / 4, color: textcolor, newx: x, newy: y})
      if (statvalue[statcount] < statmax[statcount]) statvalue[statcount]++
      statbar[statcount]
        .clear()
        // .beginLinearGradientFill([brightcolor, statcolor], [0.25, 0.5], 0,0,3*(scale+statvalue[statcount]),0)
        .beginFill(statcolor)
        .drawRect(statname[statcount].x, statname[statcount].y, span * statvalue[statcount], scale / 4)
        .endFill()
      statvaluelabel[statcount] = this.text({obj: statvaluelabel[statcount], text: statvalue[statcount], fontsize: scale / 4, color: statcolor, newx: statbar[statcount].getBounds().width, newy: 0})
    }
    stattotal = this.text({obj: stattotal, text: dexinfo['HP'] + dexinfo['Attack'] + dexinfo['Defense'] + dexinfo['Sp. Attack'] + dexinfo['Sp. Defense'] + dexinfo['Speed'] + '  total', fontsize: scale / 4, color: brightcolor, newx: x + textoffset, newy: y + scale / 4 + textoffset / 2})
    bg[2]
      .clear()
      .beginFill(0x000000)
      .drawRect(pokemoncontainer.getBounds().x, pokemoncontainer.getBounds().y, infocontainer.getBounds().width > misccontainer.getBounds().width ? infocontainer.getBounds().width : misccontainer.getBounds().width, pokemoncontainer.getBounds().height + infocontainer.getBounds().height + recommendedcontainer.getBounds().height + misccontainer.getBounds().height)
      .endFill()
    bg[3].width = bg[2].getBounds().width
    bg[3].height = bg[2].getBounds().height
    bg[3].x = 8
    bg[3].y = 8
    bg[1]
      .clear()
      .beginFill(0xffffff)
      .drawRect(bg[2].getBounds().x - 4, bg[2].getBounds().y - 4, bg[2].getBounds().width + 8, bg[2].getBounds().height + 8)
      .endFill()
    bg[0].x = (bg[2].getBounds().width - bg[2].getBounds().x + 4) / 2
    bg[0].y = (bg[2].getBounds().height + bg[2].getBounds().y + 4) / 2
    let bordercolor = color[dexinfo.Color] || 0xffffff
    bg[0]
        .clear()
        .beginFill(bordercolor)
        .arc(0, 0, bg[2].getBounds().width, 0, -Math.PI / 8, true)
        .arc(0, 0, bg[2].getBounds().width, Math.PI, Math.PI - Math.PI / 8, true)
        .arc(0, 0, bg[2].getBounds().width, Math.PI / 2, Math.PI / 2 - Math.PI / 8, true)
        .arc(0, 0, bg[2].getBounds().width, Math.PI + Math.PI / 2, Math.PI + Math.PI / 2 - Math.PI / 8, true)
        .endFill()
    bg[0].mask = bg[1]
    filter.setResolution(bg[2].getBounds().width, bg[2].getBounds().height)
  },
  update: function () {
    // if (!bgcontainer.filters) bgcontainer.children[3].filters = [ filter ];
    filter.update()
    if (!isNaN(+pokemoncontainer.children[2].text)) {
      dexinfo = pokedex[+pokemoncontainer.children[2].text]
      this.change({frame: +pokemoncontainer.children[2].text - 1})
    }
    for (let statcount = 0; statcount <= 5; statcount++) {
      if (statvalue[statcount] + 10 < statmax[statcount]) statvalue[statcount]++
      if (statvalue[statcount] < statmax[statcount]) {
        statvalue[statcount]++
        this.redraw(statcount)
      }
      if (statvalue[statcount] - 10 > statmax[statcount]) statvalue[statcount]--
      if (statvalue[statcount] > statmax[statcount]) {
        statvalue[statcount]--
        this.redraw(statcount)
      }
    }
    if (pokedexoptions.scoring) totalscore.children[1].setText(this.total())
    bg[0].angle += 0.4
  },
  init: function () {
    let textstyle = {
      backgroundColor: 'transparent',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: '24px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }

    bgcontainer = this.add.group()
    bg = []

    bg[0] = game.add.graphics(0, 0)
    bg[1] = game.add.graphics(0, 0)
    bg[2] = game.add.graphics(0, 0)
    bg[3] = game.add.sprite()

    bgcontainer.addMultiple(bg)

    pokemoncontainer = this.add.group()
    pokemonname = game.add.text(0, 0, '', textstyle)
    tierlabel = game.add.text(0, 0, '', textstyle)
    tier = game.add.text(0, 0, '', textstyle)
    type2bg = game.add.graphics(0, 0)
    type2 = game.add.text(0, 0, '', textstyle)
    typebg = game.add.graphics(0, 0)
    type1 = game.add.text(0, 0, '', textstyle)
    statcontainer = this.add.group()
    statbar = [game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0)]
    statvaluelabel = [game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle)]
    statname = [game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle)]
    stattotal = game.add.text(0, 0, '', textstyle)
    infocontainer = this.add.group()
    weaklabel = game.add.text(0, 0, '', textstyle)
    weakto = [game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0)]
    weaktolabel = [game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle)]
    resistslabel = game.add.text(0, 0, '', textstyle)
    resistantto = [game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0)]
    resistanttolabel = [game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle)]
    immunelabel = game.add.text(0, 0, '', textstyle)
    immuneto = [game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0), game.add.graphics(0, 0)]
    immunetolabel = [game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle), game.add.text(0, 0, '', textstyle)]
    recommendedcontainer = this.add.group()
    recommendedlabel = game.add.text(0, 0, '', textstyle)
    abilitylabel = game.add.text(0, 0, '', textstyle)
    ability = game.add.text(0, 0, '', textstyle)
    itemlabel = game.add.text(0, 0, '', textstyle)
    item = game.add.text(0, 0, '', textstyle)
    moveslabel = game.add.text(0, 0, '', textstyle)
    move1 = game.add.text(0, 0, '', textstyle)
    move2 = game.add.text(0, 0, '', textstyle)
    move3 = game.add.text(0, 0, '', textstyle)
    move4 = game.add.text(0, 0, '', textstyle)
    misccontainer = this.add.group()
    gender = game.add.sprite(0, 0)
    genderlabel = game.add.text(0, 0, '', textstyle)
    evslabel = game.add.text(0, 0, '', textstyle)
    ev = game.add.text(0, 0, '', textstyle)
    explabel = game.add.text(0, 0, '', textstyle)
    expv = game.add.text(0, 0, '', textstyle)
    masslabel = game.add.text(0, 0, '', textstyle)
    mass = game.add.text(0, 0, '', textstyle)
    catchlabel = game.add.text(0, 0, '', textstyle)
    catchr = game.add.text(0, 0, '', textstyle)
    hatchlabel = game.add.text(0, 0, '', textstyle)
    hatch = game.add.text(0, 0, '', textstyle)
    egglabel = game.add.text(0, 0, '', textstyle)
    egg = game.add.text(0, 0, '', textstyle)
    evolvelabel = game.add.text(0, 0, '', textstyle)
    evolve = game.add.text(0, 0, '', textstyle)
    loclabel = game.add.text(0, 0, '', textstyle)
    loc = game.add.text(0, 0, '', textstyle)

    pokemoncontainer.addChild(pokemonname)
    pokemoncontainer.addChild(tierlabel)
    pokemoncontainer.addChild(tier)
    pokemoncontainer.addChild(type2bg)
    pokemoncontainer.addChild(typebg)
    pokemoncontainer.addChild(type1)
    pokemoncontainer.addChild(type2)
    for (let statcount = 0; statcount <= 5; statcount++) {
      statcontainer
      .addChild(statbar[statcount])
      .addChild(statname[statcount])
      .addChild(statvaluelabel[statcount])
    }
    statcontainer.addChild(stattotal)
    infocontainer.addChild(weaklabel)
    infocontainer.addChild(resistslabel)
    infocontainer.addChild(immunelabel)
    recommendedcontainer.addChild(recommendedlabel)
    recommendedcontainer.addChild(abilitylabel)
    recommendedcontainer.addChild(ability)
    recommendedcontainer.addChild(itemlabel)
    recommendedcontainer.addChild(item)
    recommendedcontainer.addChild(moveslabel)
    recommendedcontainer.addChild(move1)
    recommendedcontainer.addChild(move2)
    recommendedcontainer.addChild(move3)
    recommendedcontainer.addChild(move4)
    misccontainer.addChild(gender)
    misccontainer.addChild(genderlabel)
    misccontainer.addChild(evslabel)
    misccontainer.addChild(ev)
    misccontainer.addChild(explabel)
    misccontainer.addChild(expv)
    misccontainer.addChild(masslabel)
    misccontainer.addChild(mass)
    misccontainer.addChild(catchlabel)
    misccontainer.addChild(catchr)
    misccontainer.addChild(hatchlabel)
    misccontainer.addChild(hatch)
    misccontainer.addChild(egglabel)
    misccontainer.addChild(egg)
    misccontainer.addChild(evolvelabel)
    misccontainer.addChild(evolve)
    misccontainer.addChild(loclabel)
    misccontainer.addChild(loc)
  }
}
