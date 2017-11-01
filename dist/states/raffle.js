project.Raffle = (function (game) {
  let
    cards,
    // displaygroup,
    // queuegroup,
    // spinuser,
    // spinusername,
    arrow,
    spinspeed,
    spinslow,
    usersraffle,
    // enterbutton,
    // leavebutton,
    rollbutton,
    clearbutton,
    donutchart,
    donutchartradius,
    radian,
    yoffset,
    previouswinner,
    winnercircle,
    // allraffle,
    menu
})

project.Raffle.prototype = {
  preload: function () {
    game.load.script('menu', '/js/menubuttons.js')
    game.load.spritesheet('playersprite', playersprite.src, playersprite.x, playersprite.y, maxpokes * 4)
    game.load.image('arrow', '/img/arrow.png')
  },
  winraffle: function (person) {
    previouswinner = person
    socket.emit('won raffle', person)
    socket.emit('request user pokes', person)
    socket.emit('request user fc', person)
    socket.emit('request to connect', {id: person})
  },
  rollraffle: function () {
    spinspeed = 100 + Math.floor(Math.random() * 45)
    spinslow += 1
  },
  enterraffle: function () {
    if (!team_name) if (teams) if (teams['default']) team_name = 'default'
    if (team_name) {
      if (teams[team_name]) {
        socket.emit('set current team', game.storage.getItem('id'), team_name, teams[team_name])
        socket.emit('enter raffle', game.storage.getItem('id'), cards[0].poke, team_name, teams[team_name])
      }
    }
  },
  leaveraffle: function () {
    if (team_name) socket.emit('leave raffle', game.storage.getItem('id'), 0, '')
  },
  clearraffle: function () {
    socket.emit('clear raffle')
    this.respin()
  },
  respin: function () {
    spinspeed = 1
  },
  update: function () {
    winnercircle.children[3].setText(previouswinner)

    if (spinspeed > 0) {
      spinspeed -= spinslow
      if (spinspeed == 0) {
        testRad = radian - (arrow.rotation - Math.PI * 0.5) % radian

        let drawnwinner = usersraffle.find(user => testRad > user.startradian && testRad < user.endradian)
        drawnwinner && this.winraffle(drawnwinner.id)
        // for (user of usersraffle) {
        //   if (testRad > user.startradian && testRad < user.endradian) this.winraffle(user.id)
        // }
        spinslow = 0
      }
      if (spinspeed) arrow.rotation += spinspeed / 100

    //   for (let movement = 0; movement < spinspeed; movement++) {
    //     displaygroup.subAll('x', 1)

    //     if (displaygroup.children.length > 1) {
    //       let showcurrent = Math.floor(displaygroup.children.length / 2)
    //       spinuser.frame = displaygroup.children[showcurrent].frame
    //       spinusername.setText(displaygroup.children[showcurrent].username)
    //     }

    //     if (displaygroup.children.length > 2) {
    //       if (displaygroup.children[0]) {
    //         for (member in displaygroup.children) {
    //           if (displaygroup.children[member].x < -playersprite.x) {
    //             queuegroup.addChild(displaygroup.children[member])
    //             displaygroup.addChild(queuegroup.children[0])
    //             displaygroup.children.last.x = displaygroup.children[displaygroup.children.length - 2].x + displaygroup.children.last.width
    //           }
    //         }
    //       }
    //     }
    //   }
    }
  },
  findpoint: function (oX, oY, angle, radius) {
    return {x: oX + radius * Math.cos(angle), y: oY + radius * Math.sin(angle)}
  },
  fillchart: function () {
    if (Presets.showdonutchart) {
      let graphics = []
      let text = []
      let percent = []
      let icons = []
      let totalchance = 0
      let startradian = 0
      let endradian = radian
      let arc = 0
      let totalusers = 0
      for (user in usersraffle) {
        if (usersraffle[user].entered) {
          totalchance += usersraffle[user].chance
          totalusers++
        }
      }
      arrow.visible = winnercircle.visible = totalusers > 0
      for (user in usersraffle) {
        if (usersraffle[user].entered) {
          let userchance = radian * usersraffle[user].chance / totalchance
          endradian = startradian + userchance
          usersraffle[user].startradian = startradian
          usersraffle[user].endradian = endradian
          let angle = (startradian + endradian) / 2
          graphics.push(game.add.graphics(0, 0))
          graphics
            .last
            .clear()
            .beginFill(sectioncolors[arc % sectioncolors.length])
            .arc(0, 0, donutchartradius, -startradian, -endradian, true, 360)
            .endFill()
          text.push(game.add.text(0, 0, usersraffle[user].id, { font: '24px Arial', fill: hexstring(sectioncolors[arc % sectioncolors.length])}))
          if (angle > Math.PI / 2 && angle < Math.PI * 3 / 2) text.last.angle = -game.math.radToDeg(angle) - 180
          else text.last.angle = -game.math.radToDeg(angle)
          donutcoords = this.findpoint(0, 0, -angle, donutchartradius + text.last.getBounds().width / 2)
          with_object(text.last, {
            x: donutcoords.x,
            y: donutcoords.y
          })
            .anchor.setTo(0.5)
          donutcoords = this.findpoint(0, 0, -angle, donutchartradius + text.last.getBounds().width + playersprite.x / 2)
          icons.push(game.add.sprite(donutcoords.x, donutcoords.y, 'playersprite'))
          with_object(icons.last, {
            frame: usersraffle[user].displayicon * 4,
            angle: text.last.angle
          })
            .anchor.setTo(0.5)
          percent.push(game.add.text(0, 0, Math.floor(usersraffle[user].chance / totalchance * 1000) / 10 + '% ', { font: '24px Arial', fill: hexstring(sectioncolors[arc % sectioncolors.length])}))
          donutcoords = this.findpoint(0, 0, -angle, donutchartradius * 0.85 - percent.last.getBounds().width / 2)
          with_object(percent.last, {
            x: donutcoords.x,
            y: donutcoords.y,
            angle: text.last.angle
          })
            .anchor.setTo(0.5)
          startradian = endradian
          arc++
          if (totalusers % sectioncolors.length == 1 && arc == totalusers - 1) arc++
        }
      }
      let mask = game.add.graphics(0, 0)
      mask
        .beginFill(0x1c0f0c)
        .drawCircle(0, 0, donutchartradius * 1.75)
        .endFill()

      donutchart.removeAll(true)
      donutchart
        .addGroup(graphics)
        .addGroup(text)
        .addGroup(icons)
        .addGroup(mask)
        .addGroup(percent)
        .pivot.setTo(0.5)
      donutchart.x = arrow.x = game.world.centerX// + donutchart.getBounds().width / 2
      // if (game.world.height < donutchart.getBounds().height+winnercircle.getBounds().height)
        donutchart.y = arrow.y = game.world.centerY //+ donutchart.getBounds().height / 2;
      // else
      // donutchart.y = leavebutton.getBounds().y + leavebutton.getBounds().height + donutchart.getBounds().height / 2
    }
  },
  // fillraffle: function (members) {
  //   displaygroup.removeAll(true)
  //   queuegroup.removeAll(true)
  //   let xoffset = 0
  //   let maxwidth = Math.ceil(Presets.width / playersprite.x)
  //   let temp = []
  //   for (member in members) {
  //     if (members[member].entered) {
  //       for (let index = 0; index < members[member].chance; index++) {
  //         let x = xoffset + index * playersprite.x
  //         let y = 0
  //         // while (x > Presets.width){
  //         //   x -= Presets.width+playersprite.x;
  //         //   y += playersprite.y;
  //         // }
  //         temp.push(game.add.sprite(x, yoffset + y, 'playersprite'))
  //         temp.last.frame = members[member].displayicon * 4
  //         temp.last['username'] = members[member].id
  //         if (displaygroup.children.length < maxwidth && temp.length > maxwidth) {
  //           displaygroup.addMultiple(temp)
  //           temp = []
  //         }
  //       }
  //     }
  //     xoffset = x
  //   }
  //   if (displaygroup.children.length == 0) {
  //     displaygroup.addMultiple(temp)
  //     temp = []
  //   }
  //   queuegroup.addMultiple(temp)
  //   queuegroup.visible = false

  //   // make queuegroup first -- add items to it
  //   // steal items from queuegroup for displaygroup that is length of the screen
  //   // if item in displaygroup is < 0 for x put it at the end of the queuegroup
  //       // add  first queuegroup item into displaygroup -- function
  // },
  create: function () {
    cards = JSON.parse(game.storage.getItem('cards'))
    spinspeed = 1
    radian = Math.PI * 2
    donutchartradius = Presets.height < Presets.width ? Presets.height / 4 : Presets.width / 4

    game.stage.backgroundColor = Presets.bgcolor

    // displaygroup = this.add.group()
    // queuegroup = this.add.group()
    donutchart = this.add.group()
    winnercircle = this.add.group()
    allraffle = this.add.group()
    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)
    yoffset = buttonstyle.horizontalorientation ? menu.getBounds().height + Presets.padding : 0

    let padding = 32
    let textstyle = {
      backgroundColor: 'transparent',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: Presets.fontsize.toString() + 'px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    }
      // textstyle.backgroundColor = hexstring(sectioncolors[1]);

    previouswinner = ''
    spinslow = 0

    winner = []
    winner[0] = game.add.graphics(0, 0)
    winner[1] = game.add.graphics(0, 0)
    winner[2] = game.add.text(padding * 0.75, yoffset + padding / 2 + spritesheet.y * 1.5, 'Current Winner:', textstyle)
    winner[1]
        .beginFill(sectioncolors[1], 1)
        .drawRoundedRect(padding / 4, yoffset + spritesheet.y * 1.5, winner[2].getBounds().width + padding, winner[2].getBounds().height + padding, padding)
        .endFill()
    winner[0]
          .beginFill(sectioncolors[1], 1)
          .drawRoundedRect(padding * 0.75, yoffset + padding / 2 + spritesheet.y * 1.5, winner[1].getBounds().width * 2, winner[1].getBounds().height * 2, padding)
          .endFill()
    winner[3] = game.add.text(winner[0].getBounds().width / 2 + winner[0].getBounds().x, winner[0].getBounds().height / 2 + winner[0].getBounds().y, previouswinner, {
      backgroundColor: 'transparent',
      fill: Presets.fill,
      fillAlpha: 1,
      font: Presets.font,
      fontSize: '48px ',
      fontWeight: 'Bold',
      textAlign: 'left',
      stroke: 0
    })
    winner[3].anchor.setTo(0.5)

    winner[0].inputEnabled = true
    winner[1].inputEnabled = true
    winner[2].inputEnabled = true
    winner[3].inputEnabled = true
    winnercircle.addMultiple(winner)
    winnercircle.inputEnableChildren = true  // does NOT work
    winnercircle.onChildInputDown.add(this.respin, this)
    winnercircle.y = yoffset + 90
      // winnercircle.setAll('tint', Presets.normalstate);

    // textButton.define(enterbutton = game.add.group(), game, 'enter ' + (team_name || 'raffle'), 8, winnercircle.getBounds().y + winnercircle.getBounds().height + 32, sectioncolors[0])
    //    .onChildInputDown.add(this.enterraffle, this)
    // textButton.define(leavebutton = game.add.group(), game, 'leave raffle', enterbutton.getBounds().x + enterbutton.getBounds().width + 16, winnercircle.getBounds().y + winnercircle.getBounds().height + 32, sectioncolors[3])
    //    .onChildInputDown.add(this.leaveraffle, this)
    if (Presets.allowroll) {
      textButton.define(rollbutton = game.add.group(), game, 'roll raffle', 16, 90, sectioncolors[1])
         .onChildInputDown.add(this.rollraffle, this)
      textButton.define(clearbutton = game.add.group(), game, 'clear raffle', 16, rollbutton.getBounds().height + 100, sectioncolors[0])
         .onChildInputDown.add(this.clearraffle, this)
      arrow = game.add.sprite(0, 0, 'arrow')
      arrow.anchor.setTo(0.5)
      arrow.scale.setTo(0.5)
      arrow.inputEnabled = true
      arrow.events.onInputDown.add(this.rollraffle, this)
    }

      // previouswinner
    let contextthis = this
    if (socket.hasListeners('receive raffle') == false) {
      socket.on('receive raffle', function (fullraffle) {
        usersraffle = []
        for (user in fullraffle) {
          if (fullraffle && fullraffle[user] && fullraffle[user].entered == true && fullraffle[user].winner == true) {
            if (fullraffle[user].id) {
              winnercircle.children[3].setText(fullraffle[user].id)
              previouswinner = fullraffle[user].id
            }
          }
        }
        for (user in fullraffle) {
          if (fullraffle[user].entered == true) {
            usersraffle.push(fullraffle[user])
          }
        }
        // contextthis.fillraffle(usersraffle)
        contextthis.fillchart()
          // if (Presets.externalteams) {
          //   for (member in fullraffle) {
          //       if (fullraffle[member].winner)
          //           game.storage.setItem("externalteams", JSON.stringify({team: fullraffle[member].team, team_name: fullraffle[member].team_name}));
          //   }
          // }
      })
    }

    socket.emit('send raffle')

    // spinuser = game.add.sprite(winnercircle.getBounds().x + winnercircle.getBounds().width * 1.5, winnercircle.getBounds().y, 'playersprite')
    // spinuser.anchor.setTo(0.5, 0)
    // spinuser.scale.setTo(2.5)
    // spinusername = game.add.text(spinuser.x, spinuser.y + spinuser.getBounds().height * 2, '', {
    //   backgroundColor: 'transparent',
    //   fill: Presets.fill,
    //   fillAlpha: 1,
    //   font: Presets.font,
    //   fontSize: '60px ',
    //   fontWeight: 'Bold',
    //   textAlign: 'left',
    //   stroke: 0
    // })
    // spinusername.anchor.setTo(0.5, 0)

    // allraffle.addChild(winnercircle)
    // allraffle.addChild(spinuser)
    // allraffle.addChild(spinusername)
      // scaleup(allraffle);
  }
}
