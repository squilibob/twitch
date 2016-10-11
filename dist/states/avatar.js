project.Avatar = function(game) {
  var menu, av, rot, avatars, chosen, hover;
};

project.Avatar.prototype = {
  preload: function(){
    game.load.script('menu','/js/menubuttons.js');
    game.load.crossOrigin = 'anonymous';
    game.load.spritesheet('avatar', Useravatars.src, Useravatars.x, Useravatars.y, Useravatars.total);
  },
  create: function(){
    av = [];
    rot = 0.45;
    hover = -1;
    var nextx = Useravatars.x/4;
    var nexty = Useravatars.y/(buttonstyle.horizontalorientation ? 2 : 4);

    game.stage.backgroundColor = Presets.bgcolor;

    menu = this.add.group();
    menu.addMultiple(menubuttons);

    avatars = this.add.group();
    chosen = game.add.sprite(Useravatars.x/2, Useravatars.y*0.75, 'avatar', 0);
    chosen.mask = this.addmask(chosen, 1);
    if (game.storage.getItem("avatar")) if (parseInt(game.storage.getItem("avatar")) >=0 && parseInt(game.storage.getItem("avatar")) < Useravatars.total) chosen.frame = 1 + parseInt(game.storage.getItem("avatar"));
    // for (var nextavatar = 0; nextavatar < Math.floor(Presets.width / (Useravatars.x/2 - 1)); nextavatar++) {

    for (var nextavatar = 0; nextavatar < Useravatars.total; nextavatar++) {
      while (game.math.distance(chosen.x, chosen.y, nextx, nexty) < Useravatars.x*0.8) nextx++;
      av.push(game.add.sprite(nextx, nexty, 'avatar', nextavatar));
      nextx = nextx + Useravatars.x/2;
      if (nextx+Useravatars.x/4 > Presets.width) {
        nextx = Useravatars.x/4;
        nexty += Useravatars.y/2;
      }
      // Useravatars.x/2+Useravatars.x/2*nextavatar % (Presets.width-Useravatars.x)
      // av.push(game.add.sprite(Useravatars.x/2+Useravatars.x/2*nextavatar % (Presets.width-Useravatars.x), Useravatars.y*2+Useravatars.y/2*Math.floor(Useravatars.x/2*nextavatar / (Presets.width-Useravatars.x)), 'avatar', nextavatar));
      av[nextavatar].scale.setTo(0.5);
      av[nextavatar].alpha=0.5;
      av[nextavatar].mask = this.addmask(av[nextavatar], 0.5);
      // av[nextavatar].rotation += rot;
      av[nextavatar].inputEnabled = true;
    }
    avatars.addMultiple(av);
    avatars.onChildInputDown.add(this.set, this);
    avatars.onChildInputOver.add(this.hovered, this);
    avatars.onChildInputOut.add(this.unhovered, this);
  },
  hovered: function(avatar){
    hover = avatars.getChildIndex(avatar);
  },
  unhovered: function(avatar){
    avatar.rotation = 0;
    hover = -1;
  },
  addmask: function(obj, scale) {
    obj.anchor.setTo(0.5);
    mask = game.add.graphics(0, 0);
    mask.beginFill(0xffffff);
    mask.drawCircle(obj.centerX, obj.centerY, Useravatars.x*scale);
    mask.endFill();
    return mask;
  },
  set: function(avatar){
    chosen.frame = avatars.getChildIndex(avatar);
    socket.emit('update avatar', game.storage.getItem("id"), chosen.frame-1);
    game.storage.setItem("avatar", chosen.frame-1);
  },
  rotate: function(avatar){
    avatar.rotation = Math.sin(rot)/16;
  },
  update: function(){
    rot += 0.05;
    this.rotate(chosen);
    for (var nextavatar = 0; nextavatar < Useravatars.total; nextavatar++) {
      if (nextavatar == hover) {
        this.rotate(avatars.children[nextavatar]);
        if (avatars.children[nextavatar].alpha < 1) avatars.children[nextavatar].alpha += 0.025;
      }
      else if (avatars.children[nextavatar].alpha > 0.5) avatars.children[nextavatar].alpha -= 0.025;
    }
  },

}
