project.Raffle = function(game) {
  var
    cards,
    displaygroup,
    queuegroup,
    spinuser,
    spinusername,
    spinspeed,
    spinslow,
    usersraffle,
    enterbutton,
    leavebutton,
    rollbutton,
    clearbutton,
    donutchart,
    donutchartradius,
    radian,
    yoffset,
    previouswinner,
    winnercircle,
    menu;
};

project.Raffle.prototype = {
    preload: function(){
      game.load.script('menu','/js/menubuttons.js')
      game.load.spritesheet('playersprite', playersprite.src, playersprite.x, playersprite.y, maxpokes*4);
    },
  winraffle: function(person){
    socket.emit('won raffle', person);
  },
  rollraffle: function(){
    spinslow += 1;
  },
  enterraffle: function() {
    if (team_name) socket.emit('enter raffle', game.storage.getItem("id"), cards[0].poke, team_name);
  },
  leaveraffle: function() {
    socket.emit('leave raffle', game.storage.getItem("id"), 0, '');
  },
  clearraffle: function() {
    socket.emit('clear raffle');
    game.state.restart();
  },
  update: function() {
    winnercircle.children[3].setText(previouswinner);

    displaygroup.subAll('x', spinspeed);
    if (spinspeed > 0) {
      spinspeed -= spinslow;
      if (spinspeed == 0) this.winraffle(spinusername.text);

    if (displaygroup.children.length > 1) {
      var showcurrent = Math.floor(displaygroup.children.length / 2);
      spinuser.frame = displaygroup.children[showcurrent].frame;
      spinusername.setText(displaygroup.children[showcurrent].username);
    }

    if (displaygroup.children.length > 2)
    if (displaygroup.children[0])
      for (member in displaygroup.children) {
        if (displaygroup.children[member].x < -playersprite.x) {
          queuegroup.addChild(displaygroup.children[member]);
          displaygroup.addChild(queuegroup.children[0]);
          displaygroup.children[displaygroup.children.length-1].x = displaygroup.children[displaygroup.children.length-2].x + displaygroup.children[displaygroup.children.length-1].width;
        }
      }
    }
  },
  findpoint: function(oX, oY, angle, radius) {
    return {x: oX + radius * Math.cos( angle ), y: oY + radius * Math.sin( angle )};
  },
  fillchart: function(fullraffle) {
    if (Presets.showdonutchart) {
      var graphics = [];
      var text = [];
      var percent = [];
      var icons = [];
      var totalchance = 0;
      var startradian = 0;
      var endradian = radian;
      var arc = 0;
      var totalusers = 0;
      for (user in fullraffle){
        if (fullraffle[user].entered) {
          totalchance += fullraffle[user].chance;
          totalusers++;
        }
      }
      for (user in fullraffle){
        if (fullraffle[user].entered) {
          var userchance = radian * fullraffle[user].chance / totalchance;
          endradian = startradian+userchance;
          var angle = (startradian+endradian)/2;
          graphics.push(game.add.graphics(0, 0));
          graphics[graphics.length-1]
            .clear()
            .beginFill(sectioncolors[arc % sectioncolors.length])
            .arc(0, 0, donutchartradius, -startradian, -endradian, true, 360)
            .endFill();
          text.push(game.add.text(0, 0, fullraffle[user].id, { font: "24px Arial", fill: hexstring(sectioncolors[arc % sectioncolors.length])}));
          if (angle > Math.PI/2 && angle <Math.PI*3/2) text[text.length-1].angle =  -game.math.radToDeg(angle)-180;
          else text[text.length-1].angle =  -game.math.radToDeg(angle);
          var coords = this.findpoint(0, 0, -angle, donutchartradius + text[text.length-1].getBounds().width/2);
          with_object(text[text.length-1], {
            x: coords.x,
            y: coords.y,
          })
            .anchor.setTo(0.5);
          var coords = this.findpoint(0, 0, -angle, donutchartradius+text[text.length-1].getBounds().width+ playersprite.x/2);
          icons.push(game.add.sprite(coords.x, coords.y, 'playersprite'));
          with_object(icons[icons.length-1] , {
            frame:  fullraffle[user].displayicon*4,
            angle: text[text.length-1].angle
          })
            .anchor.setTo(0.5);
          percent.push(game.add.text(0, 0, Math.floor(fullraffle[user].chance / totalchance * 1000) / 10 + "% ", { font: "24px Arial", fill: hexstring(sectioncolors[arc % sectioncolors.length])}));
          var coords = this.findpoint(0, 0, -angle, donutchartradius*0.85-percent[percent.length-1].getBounds().width/2);
          with_object(percent[percent.length-1], {
            x: coords.x,
            y: coords.y,
            angle: text[text.length-1].angle
          })
            .anchor.setTo(0.5);

          startradian = endradian;
          arc++;
          if (totalusers % sectioncolors.length == 1 && arc == totalusers - 1) arc++;
        }
      }
      var mask = game.add.graphics(0, 0);
      mask
        .beginFill(0x1c0f0c)
        .drawCircle(0, 0, donutchartradius*1.75)
        .endFill();

      donutchart.removeAll(true);
      donutchart
        .addGroup(graphics)
        .addGroup(text)
        .addGroup(icons)
        .addGroup(mask)
        .addGroup(percent)
        .pivot.setTo(0.5);
      donutchart.x = Presets.width - spritesheet.x - donutchart.getBounds().width /2;
      if (game.world.height < donutchart.getBounds().height+winnercircle.getBounds().height)
        donutchart.y = yoffset + playersprite.y + donutchart.getBounds().height / 2;
      else
        donutchart.y = game.world.height - donutchart.getBounds().height;
    }
  },
  fillraffle: function(members) {
    displaygroup.removeAll(true);
    queuegroup.removeAll(true);
    var xoffset = 0;
    var maxwidth = Math.ceil(Presets.width / playersprite.x);
    var temp = [];
    for (member in members) {
      if (members[member].entered)
      for (var index=0; index < members[member].chance; index++)
        {
          var x = xoffset+index*playersprite.x;
          var y = 0;
          // while (x > Presets.width){
          //   x -= Presets.width+playersprite.x;
          //   y += playersprite.y;
          // }
          temp.push(game.add.sprite(x, yoffset + y, 'playersprite'));
          temp[temp.length-1].frame = members[member].displayicon*4;
          temp[temp.length-1]['username'] = members[member].id;
          if (displaygroup.children.length < maxwidth && temp.length > maxwidth) {
            displaygroup.addMultiple(temp);
            temp = [];
          }
        }
        xoffset = x;
    }
    if (displaygroup.children.length == 0) {
      displaygroup.addMultiple(temp);
      temp = [];
    }
    queuegroup.addMultiple(temp);
    queuegroup.visible = false;

    // make queuegroup first -- add items to it
    // steal items from queuegroup for displaygroup that is length of the screen
    // if item in displaygroup is < 0 for x put it at the end of the queuegroup
        // add  first queuegroup item into displaygroup -- function

  },
    create: function(){
      cards = JSON.parse(game.storage.getItem('cards'));
      spinspeed = 24;
      radian = Math.PI * 2;
      donutchartradius = Presets.height / 4 <  Presets.width / 4 ?  Presets.height / 4 :  Presets.width / 4;

      game.stage.backgroundColor = Presets.bgcolor;

      displaygroup = this.add.group();
      queuegroup = this.add.group();
      donutchart = this.add.group();
      winnercircle = this.add.group();
      menu = this.add.group();
      menu.addMultiple(menubuttons);
      yoffset = buttonstyle.horizontalorientation ?  menu.getBounds().height+Presets.padding : 0;

      var padding = 32;
      var textstyle =  {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        fontSize: Presets.fontsize.toString() + 'px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      };
      // textstyle.backgroundColor = hexstring(sectioncolors[1]);

      previouswinner = '';
      spinslow = 0;

      winner = [];
      winner[0] = game.add.graphics(0, 0);
      winner[1] = game.add.graphics(0, 0);
      winner[2] = game.add.text(padding * 0.75, yoffset + padding / 2 + spritesheet.y * 1.5, 'Current Winner:', textstyle);
      winner[1]
        .beginFill(sectioncolors[1], 1)
        .drawRoundedRect(padding / 4, yoffset + spritesheet.y * 1.5, winner[2].getBounds().width + padding, winner[2].getBounds().height + padding, padding)
        .endFill();
        winner[0]
          .beginFill(sectioncolors[1], 1)
          .drawRoundedRect(padding * 0.75, yoffset + padding / 2 + spritesheet.y * 1.5, winner[1].getBounds().width*2, winner[1].getBounds().height*2, padding)
          .endFill();
      winner[3] = game.add.text(winner[0].getBounds().width/2 + winner[0].getBounds().x, winner[0].getBounds().height/2 + winner[0].getBounds().y, previouswinner, {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        fontSize: '48px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      });
      winner[3].anchor.setTo(0.5);

      winnercircle.addMultiple(winner);
      // winnercircle.setAll('tint', Presets.normalstate);

      textButton.define(enterbutton = game.add.group(), game, 'enter ' + (team_name ? team_name : 'raffle'), 8, winnercircle.getBounds().y + winnercircle.getBounds().height + 32 , sectioncolors[0])
       .onChildInputDown.add(this.enterraffle, this);
      textButton.define(leavebutton = game.add.group(), game, 'leave raffle', enterbutton.getBounds().x + enterbutton.getBounds().width + 16, winnercircle.getBounds().y + winnercircle.getBounds().height + 32, sectioncolors[3])
       .onChildInputDown.add(this.leaveraffle, this);
      if (Presets.allowroll) {
        textButton.define(rollbutton = game.add.group(), game, 'roll raffle', leavebutton.getBounds().x + leavebutton.getBounds().width + 16, winnercircle.getBounds().y + winnercircle.getBounds().height + 32, sectioncolors[1])
         .onChildInputDown.add(this.rollraffle, this);
        textButton.define(clearbutton = game.add.group(), game, 'clear raffle', rollbutton.getBounds().x + rollbutton.getBounds().width + 16, winnercircle.getBounds().y + winnercircle.getBounds().height + 32, sectioncolors[4])
         .onChildInputDown.add(this.clearraffle, this);
     }

      // previouswinner
      var contextthis = this;
      if (socket.hasListeners('receive raffle') == false) socket.on('receive raffle', function(fullraffle) {
        usersraffle = [];
          for (user in fullraffle){
            if (fullraffle[user].winner == true) {
              winnercircle.children[3].setText(fullraffle[user].id);
              previouswinner = fullraffle[user].id;
            }
          }
          for (user in fullraffle){
            if (fullraffle[user].entered == true) {
              usersraffle.push(fullraffle[user]);
            }
          }
          contextthis.fillraffle(fullraffle);
          contextthis.fillchart(fullraffle);
      });

      // socket.emit('enter raffle', 'joey', 37);
      // socket.emit('enter raffle', 'george', 133);
      // socket.emit('enter raffle', 'someone', 715);
      socket.emit('send raffle');

      spinuser = game.add.sprite(winnercircle.getBounds().x+winnercircle.getBounds().width*1.5, winnercircle.getBounds().y, 'playersprite');
      spinuser.anchor.setTo(0.5, 0);
      spinuser.scale.setTo (2.5);
      spinusername = game.add.text(spinuser.x, spinuser.y+spinuser.getBounds().height*2, '', {
        backgroundColor: 'transparent',
        fill: Presets.fill,
        fillAlpha: 1,
        font: Presets.font,
        fontSize: '60px ',
        fontWeight: 'Bold',
        textAlign: 'left',
        stroke: 0
      });
      spinusername.anchor.setTo(0.5, 0);
  },
}

