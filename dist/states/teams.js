project.Teams = function(game) {
var
currentTeam,
teamname,
selectnew,
useteam,
saveteam,
deleteteam,
teamlist,
teampadding,
putonteam,
scale,
menu;
};

project.Teams.prototype = {
  preload: function(){
    game.load.script('menu','/js/menubuttons.js');
    game.load.spritesheet('spritesheet', spritesheet.src, spritesheet.x, spritesheet.y, maxpokes);
  },
  onOver: function  (whichbutton){
    whichbutton.parent.setAll('tint', Presets.highlightedstate);
  },
  onOut: function  (whichbutton){
    whichbutton.parent.setAll('tint', Presets.normalstate);
  },
  onClick: function  (whichbutton){
    currentTeam.removeAll(true);
    for (var eachpoke = 3; eachpoke < whichbutton.parent.children.length; eachpoke++) {
      this.newmember(whichbutton.parent.children[eachpoke].frame);
    }
   teamname.setText(whichbutton.parent.children[1].text);
  },
  removefromteam: function  (which){
    currentTeam.remove(which);
    this.positioncurrent();
    return this;
  },
  positioncurrent: function(){
    for (member in currentTeam.children)
      currentTeam.children[member].x = teampadding.width + ((spritesheet.x * scale) + 8) * member;
    return this;
  },
  positionteams: function(){
    var horizontal = spritesheet.x;
    // var vertical =  spritesheet.y*2.5*scale+48;
    var vertical =  saveteam.getBounds().y+saveteam.getBounds().height*1.5+Presets.padding;
    // var vertical =  teamname.y + teamname.getBounds().height*1.5+Presets.padding;

    for (var teamcounter = 0; teamcounter < teamlist.length; teamcounter++) {
      if (horizontal + teamlist[teamcounter].getBounds().width > Presets.width) {
        horizontal = spritesheet.x;
        vertical += teamlist[0].getBounds().height;
      }
      teamlist[teamcounter].x = horizontal;
      teamlist[teamcounter].y = vertical;

      horizontal += teamlist[teamcounter].getBounds().width + 1;
    }
    return this;
  },
  addtoteam: function(){
    if(currentTeam.children.length < 6) this.newmember(parseInt(selectnew.children[2].value)-1);
    return this;
  },
  newmember: function(index){
    currentTeam.create(0, 0, 'spritesheet', index);
    currentTeam.children[currentTeam.children.length-1].scale.setTo(scale);
    currentTeam.children[currentTeam.children.length-1].inputEnabled = true;
    currentTeam.children[currentTeam.children.length-1].events.onInputDown.add(this.removefromteam, this);
    this.positioncurrent();
    currentTeam.y = teampadding.height-saveteam.getBounds().height-currentTeam.getBounds().height;
    return this;
},
  create: function(){

    scale = 12*spritesheet.x < Presets.width ? 2 : 1;

    teamlist = [];
    currentTeam = game.add.group();

    game.stage.backgroundColor = Presets.bgcolor;

    menu = this.add.group();
    menu.addMultiple(menubuttons);

    teampadding = {height: buttonstyle.horizontalorientation ?  menu.getBounds().height+Presets.padding : 0, width: 256};

    selector.define(selectnew = this.add.group(), this, {x:16, y:teampadding.height, id: 'spritesheet'});
    // textButton.define(putonteam = game.add.group(), game, 'add', 144, 108, sectioncolors[0])
    textButton.define(putonteam = game.add.group(), game, 'add', selectnew.getBounds().x+selectnew.getBounds().width+Presets.padding, selectnew.getBounds().y+selectnew.getBounds().height/2, sectioncolors[0])
    .onChildInputDown.add(this.addtoteam, this);
    putonteam.y -= putonteam.getBounds().height/2;
    teampadding.width = putonteam.getBounds().x+putonteam.getBounds().width+Presets.padding;
    teampadding.height += selectnew.getBounds().height;
    teamname = game.add.inputField(teampadding.width, teampadding.height+spritesheet.y*scale, inputform('Team name', 30, 'text'));
    teampadding.height -= teamname.getBounds().height;
    teamname.y = teampadding.height;
    textButton.define(saveteam = game.add.group(), game, 'save', teampadding.width+12+teamname.getBounds().width, teampadding.height+Presets.padding, sectioncolors[1])
    .onChildInputDown.add(this.saveteam, this);
    textButton.define(deleteteam = game.add.group(), game, 'delete', teampadding.width+16+teamname.getBounds().width+saveteam.getBounds().width, teampadding.height+Presets.padding, sectioncolors[0])
    .onChildInputDown.add(this.deleteteam, this);
    textButton.define(useteam = game.add.group(), game, 'use for battle', teampadding.width+12+teamname.getBounds().width, selectnew.getBounds().y+Presets.padding, sectioncolors[3])
    .onChildInputDown.add(this.setteam, this);

    for (var name in teams) {
      if (!team_name) team_name = name;
      drawteam(teamlist[teamlist.length] = game.add.group(), teams[name], name, sectioncolors[teamlist.length % sectioncolors.length]);
      teamlist[teamlist.length-1].onChildInputOver.add(this.onOver, this);
      teamlist[teamlist.length-1].onChildInputOut.add(this.onOut, this);
      teamlist[teamlist.length-1].onChildInputDown.add(this.onClick, this);
    }
    this.positionteams();
    if (migrateteam) this.updatedb();
  },
    checkname: function(teamtocheck){
      for (member in teamlist) if (teamlist[member].children[1].text == teamtocheck) return member;
      return -1;
    },
    updatedb: function(){
      var fullist = {};
      for (member in teamlist) {
        var currentlist = [];
        for (var eachpoke = 3; eachpoke < teamlist[member].children.length; eachpoke++) {
        currentlist.push(teamlist[member].children[eachpoke].frame);
       }
       fullist[teamlist[member].children[1].text] = currentlist;
     }
      socket.emit('save user pokes', game.storage.getItem('id'), fullist);
      teams = fullist;
      return this;
    },
   saveteam: function() {
    if (teamname.value == '') teamname.setText('no name');
    var thisteam = [];
    if (currentTeam.children.length > 0 && this.checkname(teamname.value) == -1) {
      for (member in currentTeam.children) thisteam.push(currentTeam.children[member].frame);
      drawteam(teamlist[teamlist.length] = game.add.group(), thisteam, teamname.value, sectioncolors[0]);
      teamlist[teamlist.length-1].onChildInputOver.add(this.onOver, this);
      teamlist[teamlist.length-1].onChildInputOut.add(this.onOut, this);
      teamlist[teamlist.length-1].onChildInputDown.add(this.onClick, this);

      this
        .positionteams()
        .updatedb();
    }
    return this;
  },
   deleteteam: function() {
      var which = this.checkname(teamname.value);
       if (which >= 0) {
         var deleted = teamlist.splice(which, 1);
         deleted[0].destroy(true);
      }
     this
       .positionteams()
       .updatedb();
     return this;
  },
   setteam: function() {
      if (this.checkname(teamname.value) >= 0) if (teams[team_name]) {
        team_name = teamname.value.trim().toLowerCase();
        socket.emit('set current team', game.storage.getItem("id"), team_name);
      }
    return this;
  },
}