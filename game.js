var player;
var idle, right, left, up, down;
var enemies;
var tb = 0;
var m, myGrid;
var moveTween;
var layer = [];
var isMoving;

bootState = {
  preload: function() {
    game.load.image("progressBar", "assets/sprites/preloader.png"),
    game.load.image("progressBarBg", "assets/sprites/preloaderbg.png"),
    game.load.image("loader", "assets/sprites/loader.png")
  },
  create: function() {
    game.state.start("load")
  }
},
loadState = {
  init: function(){
    if (!game.device.desktop) {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      //screen.orientation.lock('landscape');//on itch it's diffrent
    }
  },
  preload: function() {
    var a = game.add.image(game.world.centerX, 150, "loader");
    a.anchor.setTo(.5, .5);
    var b = game.add.sprite(game.world.centerX, 200, "progressBarBg");
    b.anchor.setTo(.5, .5);
    var c = game.add.sprite(game.world.centerX, 200, "progressBar");
    c.anchor.setTo(.5, .5),
    game.load.setPreloadSprite(c),

    game.load.image("logo","assets/sprites/phaser2.png");
    game.load.image("start","assets/sprites/click.png");

    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/Tilemap/tilemap.png', 16, 16);
    game.load.spritesheet('sprite', 'assets/Tilemap/tilemap_packed.png', 16, 16);

    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png', 32, 32);

  },
  create: function() {
    game.state.start("splash")
  }
},
splashState = {
  create: function() {
    var pic = game.add.image(game.world.centerX, game.world.centerY, 'logo');
    pic.anchor.set(0.5);
    pic.alpha = 0.1;
    //  This tween will wait 0 seconds before starting
    var tween = game.add.tween(pic).to( { alpha: 1 }, 3000, "Linear", true, 0);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},
menuState = {
  create: function() {
    var start = game.add.sprite(game.world.centerX, game.world.centerY, 'start');
    start.anchor.set(0.5);
    game.input.onDown.add(this.start);
  },
  start: function() {
    game.state.start('play')
  }
},
playState = {
  create: function() {
    this.playerMap = {};
    var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

    game.world.setBounds(0, 0, 40*16, 40*16);

    var map = game.add.tilemap('map');
    map.addTilesetImage('tilemap', 'tileset'); // tilesheet is the key of the tileset in map's JSON file

    for(var i = 0; i < map.layers.length; i++) {
        layer[i] = map.createLayer(i);
        layer[i].inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
        layer[i].events.onInputDown.add(this.getCoordinates, this);
    };

    game.physics.startSystem(Phaser.Physics.ARCADE);

    m = game.cache.getTilemapData('map').data.layers[0].data;
    myGrid = new Array();
    for(i=0; i<39; i++){
      myGrid[i] = new Array();
      for(j=0; j<39; j++){
        myGrid[i].push(m[i*j]);
      }
    }

    easystar.setGrid(myGrid);
    easystar.setAcceptableTiles([28,8,9,10,35,36,37,62,63,64,434,441,468]);

    this.addPlayer(14*16, 12*16);

  },
  update: function() {
    //game.physics.arcade.overlap(player, enemies, this.collisionHandler, null, this);
    //game.physics.arcade.overlap(player, home, this.collisionHome, null, this);
  },

  collisionHandler : function(){
    //game.add.tween(tBack).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    moveTween.stop();
    player.kill();
  },

  collisionHome : function(){
    game.state.start("win");
  },

  getCoordinates : function(layer, pointer){
    this.movePlayer(pointer.worldX, pointer.worldY);
  },

  addPlayer : function(x, y){
    player = game.add.sprite(x, y, 'sprite', 24);
    player.smoothed = false;
    game.physics.arcade.enable(player);

    idle = player.animations.add('idle', [24], 10, true);
    right = player.animations.add('right', [26, 53, 80], 10, true);
    left = player.animations.add('left', [23, 50, 77], 10, true);
    up = player.animations.add('up', [24, 51, 78], 10, true);

    isMoving = false;

    game.camera.follow(player);
  },

  addEnemies : function(x, y){
    enemy = game.add.sprite(x, y, 'enemy', 0);
    enemy.smoothed = false;
    game.physics.arcade.enable(enemy);
    enemies.add(enemy);
  },

  movePlayer : function(x, y){
    var i = 0;
    function moveObject(object, p, s){
      var StepX = p[i].x || false, StepY = p[i].y || false;
      moveTween = game.add.tween( object ).to({ x: StepX*16, y: StepY*16}, 150);
      moveTween.start();
      dx = p[i].x;
      moveTween.onComplete.add(function(){
        i++;
        isMoving = true;
        if(i < p.length){
          if (p[i].x > dx) {
            player.play('right');
          };
          if (p[i].x < dx) {
            player.play('left');
          };
          if (p[i].x == dx) {
            player.play('up');
          };
          moveObject(object, p);
        }else{
          console.log("idle");
          isMoving = false;
          player.play('idle');
        };
      });
    }
    easystar.findPath(Math.floor(player.x/16), Math.floor(player.y/16), Math.floor(x/16), Math.floor(y/16), function( path ) {
      if (path === null) {
        console.log("Path was not found.");
    	} else {
        console.log("Path was found.");
        if (isMoving == false){
          console.log(isMoving);
          //isMoving = true;
          moveObject(player, path);
        } else {
          console.log(isMoving);
          isMoving = false;
          player.play('idle');
        }
    	}
    });
    easystar.calculate();
  }
},
winState = {
  create: function() {
    youWin = game.add.sprite(320, -200, 'logo');
    youWin.anchor.setTo(0.5, 0.5);
    //youWin.alpha = 0;
    //youWin.fixedToCamera = true;
    var tween = game.add.tween(youWin).to( { y: 240 }, 3000, Phaser.Easing.Bounce.Out, true);
    //var tween = game.add.tween(youWin).to( { alpha: 1 }, 2000, "Linear", true, 0, 5);
    tween.onComplete.add(this.startMenu, this)
  },
  startMenu: function() {
    game.state.start("menu")
  }
},

game = new Phaser.Game(640, 360);
var easystar = new EasyStar.js();
game.state.add("boot", bootState),
game.state.add("load", loadState),
game.state.add("splash", splashState),
game.state.add("menu", menuState),
game.state.add("play", playState),
game.state.add("win", winState),
game.state.start("boot");
