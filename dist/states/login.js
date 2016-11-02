project.Login = function(game) {

  var
   form,
   focused,
   button,
   buttonbox;

};
project.Login.prototype = {
  preload: function (){
    // game.load.script('/chat/chat');
    // game.load.spritesheet('spritesheet', spritesheet.src, spritesheet.x, spritesheet.y, maxpokes);
  },
  create: function (){
    var
    margin = Presets.padding,
    divider = Presets.width / 6,
    x = 0,
    y = {spacing: 64, next: 0};

    form = [];
    focused = 0;

    this.game.stage.backgroundColor = Presets.bgcolor;
    textInput.define(form[form.length] = this.add.group(), this, {label: 'Twitch user name', placeholder: 'Username', type: 'text', margin: Presets.padding, divider: Presets.padding, x: x+margin, y: 0, charwidth: 24});
    y.next++;
    textInput.define(form[form.length] = this.add.group(), this, {label: 'In game name', placeholder: 'in game name', type: 'text', margin: Presets.padding, divider: Presets.padding, x: x+margin, y: y.spacing*y.next, charwidth: 12});
    y.next++;
    textInput.define(form[form.length] = this.add.group(), this, {label: '3DS friend code', placeholder: 'fc', type: 'number', margin: Presets.padding, divider: Presets.padding, x: x+margin, y: y.spacing*y.next, charwidth: 4});
    textInput.define(form[form.length] = this.add.group(), this, {type: 'number', margin: Presets.padding, divider: Presets.padding, x: x+form[2].children[0].width+margin, y: y.spacing*y.next, charwidth: 4});
    textInput.define(form[form.length] = this.add.group(), this, {type: 'number', margin: Presets.padding, divider: Presets.padding, x: x+form[2].children[0].width*2+margin, y: y.spacing*y.next, charwidth: 4});
    y.next++;

    // selector.define(form[form.length] = this.add.group(), this, {x:x-divider, y:y.spacing*y.next, id: 'spritesheet'});
    // selector.define(form[form.length] = this.add.group(), this, {x:x, y:y.spacing*y.next, id: 'spritesheet'});
    // selector.define(form[form.length] = this.add.group(), this, {x:x+divider, y:y.spacing*y.next, id: 'spritesheet'});

    // y.next++;
    // y.next++;
    // y.next++;
    // y.next++;

    textButton.define(button = this.add.group(), game, "Save these details", 0, y.spacing*y.next, sectioncolors[1]);
    button.onChildInputDown.add(this.connect, this);
    // button.x -= button.getBounds().width/2;

    form[0].children[0].setText(game.storage.getItem("id"));
    form[1].children[0].setText(game.storage.getItem("ign"));
    form[2].children[0].setText(game.storage.getItem("fcleft"));
    form[3].children[0].setText(game.storage.getItem("fcmid"));
    form[4].children[0].setText(game.storage.getItem("fcright"));
    // selector.set(form[5].children, game.storage.getItem("pokevalues0"));
    // selector.set(form[6].children, game.storage.getItem("pokevalues1"));
    // selector.set(form[7].children, game.storage.getItem("pokevalues2"));

    form[0].children[0].startFocus();
    form[0].children[0].focus = true;

    formgroup = game.add.group()
    formgroup.addMultiple(form);
    formgroup.addChild(button);
    // formgroup.scale.setTo(game.world.width/formgroup.getBounds().width < game.world.height/formgroup.getBounds().height ? game.world.width/formgroup.getBounds().width : game.world.height/formgroup.getBounds().height);
    scaleup(formgroup);
    formgroup.x = formgroup.getBounds().width/2;
  },
  validatefc: function(digits){
    return ('0000' + (digits == undefined ? '0' : digits)).substr(-4);
  },
  logindetails: function() {
    game.storage.setItem("id", form[0].children[0].value);
    game.storage.setItem("ign", form[1].children[0].value);
    game.storage.setItem("fcleft", form[2].children[0].value);
    game.storage.setItem("fcmid", form[3].children[0].value);
    game.storage.setItem("fcright", form[4].children[0].value);
    // game.storage.setItem("pokevalues0", form[5].children[2].value);
    // game.storage.setItem("pokevalues1", form[6].children[2].value);
    // game.storage.setItem("pokevalues2", form[7].children[2].value);
    return {
      id: form[0].children[0].value.toLowerCase(),
      ign: form[1].children[0].value,
      fc: [this.validatefc(form[2].children[0].value), this.validatefc(form[3].children[0].value), this.validatefc(form[4].children[0].value)],
      // pokevalues: [parseInt(form[5].children[2].value),
      //  parseInt(form[6].children[2].value),
      //  parseInt(form[7].children[2].value)]
    };
  },
  connect: function () {
    var logindetails = this.logindetails();
    if (logindetails.id && logindetails.ign) {
      form[2].children[0].setText(this.validatefc(form[2].children[0].value));
      form[3].children[0].setText(this.validatefc(form[3].children[0].value));
      form[4].children[0].setText(this.validatefc(form[4].children[0].value));
      this.changestate(logindetails);
    }
  },
  changestate: function (login) {
    // button.children[1].setText('Password check');
    socket.emit('request to connect', login);
  },

  update: function () {
    // this._inputField.update();
    var pushupdate = null;
    for (var testfc = 2; testfc <= 4; testfc++) {
      var testlength;
      if (form[testfc].children[0].focus == false && form[testfc].children[0].value > 0 && form[testfc].children[0].value < 1000) form[testfc].children[0].setText(this.validatefc(form[testfc].children[0].value));
       if (/^[0-9]+$/.test(form[testfc].children[0].value) == false && form[testfc].children[0].value.length > 0) {
        var testno = /[0-9]+/g.exec(form[testfc].children[0].value);
        form[testfc].children[0].setText(testno ? testno.toString() : '');
      }
    }

    tab = game.input.keyboard.addKey(Phaser.KeyCode.TAB);
    if (tab.downDuration(1)) {
      for (var blurform=5; blurform < 8; blurform++) {
        for (var checkfocus = 0; checkfocus < form[blurform].children.length; checkfocus++) {
          if (form[blurform].children[checkfocus].focus == true && form[blurform].children[checkfocus].value)  {
            pushupdate = {form: blurform, child: checkfocus};
          }
        }
      }
      for (var blurform=0; blurform < form.length; blurform++) {
        if (form[blurform].children[0].focus) focused = blurform;
        form[blurform].children[0].endFocus();
        form[blurform].children[0].focus = false;
      }
      focused = focused+1 < form.length ? focused+1 : 0;
      if (pushupdate) selector.update(form[pushupdate.form].children[pushupdate.child]);
      form[focused].children[0].startFocus();
      form[focused].children[0].focus = true;
      form[focused].children[0].placeHolder.visible = false;
    };
    if (form[0].children[0].value && form[1].children[0].value) {
      button.visible = true;
    }
    else button.visible = false;
  }
}