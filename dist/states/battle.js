project.Battle = (function (game) {
  let
    filter,
    clearleaderboard,
    menu
})

project.Battle.prototype = {
  preload: function () {
    game.load.script('menu', '/js/menubuttons.js')
    game.load.spritesheet('spritesheet', spritesheet.src, spritesheet.x, spritesheet.y, maxpokes)
  },
    // drawteam: function(group, members, name, color){
    //   let textstyle =  {
    //     backgroundColor: 'transparent',
    //     fill: Presets.fill,
    //     fillAlpha: 1,
    //     font: Presets.font,
    //     fontSize: Presets.fontsize.toString() + 'px ',
    //     fontWeight: 'Bold',
    //     textAlign: 'left',
    //     stroke: 0
    //   };

    //   let team = [];
    //   let TeamTier = 0;
    //   for (let currentmember = 0; currentmember < members.length; currentmember++){
    //     team.push(game.add.sprite(spritesheet.x*currentmember, 0, 'spritesheet', members[currentmember]));
    //     team.last.anchor.setTo(0.5);
    //       for (let check=0; check < Tiers.length; check++){
    //         if (pokedex[members[currentmember]].Tier == Tiers[check] && check > TeamTier) TeamTier = check;
    //       }
    //   }

    //   textstyle.backgroundColor = hexstring(color);
    //   let buttontext = game.add.text(spritesheet.x*members.length, 0, name.toLowerCase(), textstyle);
    //   buttontext.anchor.setTo(0, 0.5);
    //   let tiertext = game.add.text(spritesheet.x*(members.length+0.5) + buttontext.getBounds().width, 0, Tiers[TeamTier], textstyle);
    //   tiertext.anchor.setTo(0, 0.5);

    //   let buttonelement = game.add.graphics(0, 0);
    //   buttonelement.beginFill(color, 1)
    //     .drawRoundedRect(-spritesheet.x/2-8, -spritesheet.y/2-8, spritesheet.x*(1.5+members.length)+buttontext.getBounds().width+tiertext.getBounds().width+16, spritesheet.y+16)
    //     .endFill()
    //     .inputEnabled = true;

    //   group.addGroup(buttonelement)
    //     .addGroup(buttontext)
    //     .addGroup(tiertext)
    //     .addGroup(team);
    //   group.setAll('tint', Presets.normalstate);
    //   return this;
    // },
  create: function () {
    game.stage.backgroundColor = Presets.bgcolor

    menu = this.add.group()
    menu.addMultiple(menubuttons)
    scaleup(menu)

    filter = new Phaser.Filter(game, null, fragmentSrc)

    let entireleaderboard = this.add.group()
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
    if (socket.hasListeners('receive leaderboard')) socket.removeListener('receive leaderboard')
    socket.on('receive leaderboard', function (payload) {
        // let bg = game.add.graphics(0,0);
      let bg = game.add.sprite()
      let leaderboardlabel = game.add.text(Presets.padding, buttonstyle.horizontalorientation ? menu.getBounds().height + Presets.padding * 2 : 0, 'leaderboard', textstyle)
      let currentline = leaderboardlabel.y + leaderboardlabel.getBounds().height + Presets.padding
      let board = []
      for (entry in payload) {
        payload.sort(function (a, b) {
          return b.score - a.score
        })
        let temp = []
        temp[0] = game.add.graphics(0, 0)
        temp[1] = game.add.text(Presets.padding, currentline, payload[entry].id, textstyle)
        temp[0].beginFill(0x243c4b)
        temp[0].drawRoundedRect(temp[1].x - Presets.padding, temp[1].y - Presets.padding, temp[1].getBounds().width + 2 * Presets.padding, temp[1].getBounds().height + Presets.padding, 9)
        temp[0].endFill()
        drawteam(temp[2] = game.add.group(), payload[entry].team, payload[entry].teamname, 0x243c4b)
          .setAll('tint', Presets.highlightedstate)
        temp[3] = game.add.graphics(0, 0)
        temp[2].x = temp[0].x + temp[0].getBounds().width + Presets.padding * 4
        temp[2].y = temp[0].getBounds().y + temp[0].getBounds().height / 2
        temp[4] = game.add.text(temp[2].getBounds().x + temp[2].getBounds().width + Presets.padding * 2, currentline, payload[entry].score, textstyle)
          // textButton.define(temp[2] = game.add.group(), game, payload[entry].score, temp[1].getBounds().x + temp[1].getBounds().width +Presets.padding*2, currentline,  0x0e92f0);
        temp[3].beginFill(0x0e92f0)
        temp[3].drawRoundedRect(temp[4].x - Presets.padding, temp[4].y - Presets.padding, temp[4].getBounds().width + 2 * Presets.padding, temp[4].getBounds().height + Presets.padding, 9)
        temp[3].endFill()
        currentline += temp[0].getBounds().height + Presets.padding
        board.push(game.add.group())
        board.last.addMultiple(temp)

        let dim = {x: leaderboardlabel.x - Presets.padding, y: leaderboardlabel.y - Presets.padding, width: 0, height: leaderboardlabel.getBounds().height + Presets.padding}
        for (grp in board) {
          dim.width = dim.width < board[grp].getBounds().width ? board[grp].getBounds().width : dim.width
          dim.height += board[grp].getBounds().height
        }
        dim.width += Presets.padding * 2
        dim.height += Presets.padding * 2
          // bg.beginFill(0x435a6a);
          // bg.drawRect(dim.x, dim.y, dim.width, dim.height);
          // bg.endFill();
        bg.x = dim.x
        bg.y = dim.y
        bg.width = dim.width
        bg.height = dim.height
        if (!bg.filters) bg.filters = [ filter ]
      }
      if (pokedexoptions.scoring) {
        clearleaderboard = game.add.group()
          // if (dim) textButton.define(clearleaderboard, game, 'clear', dim.x+16, dim.y+dim.height+60, sectioncolors[4]);
        if (dim) textButton.define(clearleaderboard, game, 'clear', 1540, 600, sectioncolors[4])
        clearleaderboard.onChildInputDown.add(function () {
          socket.emit('clear leaderboard')
          game.state.restart()
        }, this)
      }
      entireleaderboard.addChild(bg)
      entireleaderboard.addMultiple(board)
      entireleaderboard.addChild(leaderboardlabel)
      entireleaderboard.scale.setTo(1.5)
    })
    socket.emit('send leaderboard')
  },
  update: function () {
    filter.update()
  }
}
