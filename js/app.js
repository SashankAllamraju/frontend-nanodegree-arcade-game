// game class to initialize the game
var Game = function() {
    this.minEnemySpeed = 100;
    this.maxEnemySpeed = 300;
    this.score= 0;
    this.life = 5;
    // initially stop's value will be false. Once true, game ends.
    this.stop = false;

    // Once the game begins, all the bugs will be added to this array one by one
    this.allEnemies = [];
    // Initialize Bugs
    this.initEnemy();
    // Initialize Player
    this.player = new Player();
    // Initialize Player Helpers
    this.playerHelper = new PlayerHelper();
    // new var "that" to use the object in a nested "keyup" function below.
    var that = this;
    // Use keyboard to move player in the game.
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        that.player.handleInput(allowedKeys[e.keyCode]);
    });
};

// Initialize bugs and put them in 'allEnemies' array
Game.prototype.initEnemy = function() {
  // Initialize 4 enemies on each row.
  for (var i = 0; i < 4; i++) {
    var enemy = new Enemy();
    // vary speeds randomly between minEnemySpeed and maxEnemySpeed.
    enemy.speed = Math.floor(Math.random()*this.maxEnemySpeed + this.minEnemySpeed);
    // Push each enemy to 'allEnemies' array.
    this.allEnemies.push(enemy);
  }
};

// Check if there are collisions between the player and enemies.
Game.prototype.checkCollisions = function() {
  for (var i = 0; i < this.allEnemies.length; i++) {
    if (Math.abs(this.player.x - this.allEnemies[i].x) < 50 && Math.abs(this.player.y - this.allEnemies[i].y) < 50) {
      // If player is hit, reset player position.
      this.player.reset();
      if (this.life > 0) {
        // If player has more than 0 lives, subtract one life.
        this.life --;
        // Update life.
        document.getElementById('life').innerHTML = 'Life: ' + this.life;
      }
    }
  }
};

// update stats and enemy behavior after player collects items.
Game.prototype.checkPlayerHelpers = function() {
  // If the player collects an item.
  if (Math.abs(this.player.x - this.playerHelper.x) < 50 && Math.abs(this.player.y - this.playerHelper.y) < 50) {

    // If the player collects a heart, add one life.
    if (this.playerHelper.sprite == 'images/Heart.png') {
      this.life ++;
      document.getElementById('life').innerHTML = 'Life: ' + this.life;

    // If the player collects a Orange gem, slow enemies speed for one second.
    } else if (this.playerHelper.sprite == 'images/Gem Orange.png') {
      // Save enemies original speed.
      var originalEnemySpeeds = new Array(3);
      var allEnemies = this.allEnemies;
      // Slow each enemy's speed.
      for (var i = 0; i < allEnemies.length; i++) {
        originalEnemySpeeds[i] = allEnemies[i].speed;
        allEnemies[i].speed = allEnemies[i].speed / 3;
      }
      // Change back to original speed after 2 seconds.
      setTimeout(function() {
        for (var i = 0; i < originalEnemySpeeds.length; i++) {
          allEnemies[i].speed = originalEnemySpeeds[i];
        }
      }, 2000);

    // If the player collects a green gem, add 10 points.
    } else if (this.playerHelper.sprite == 'images/Gem Green.png') {
      this.score += 10;
      document.getElementById('score').innerHTML = 'Score: ' + this.score;

    // If the player collects a blue gem, add 20 points.
    } else if (this.playerHelper.sprite == 'images/Gem Blue.png') {
      this.score += 20;
      document.getElementById('score').innerHTML = 'Score: ' + this.score;

    // If the player collects a rock, subtract 1 life
    } else if (this.playerHelper.sprite == 'images/Rock.png') {
      this.life --;
      document.getElementById('life').innerHTML = 'Life: ' + this.life;
    }

    // Once the player collects items, move them off the screen.
    this.playerHelper.x = -100;
    this.playerHelper.y = -100;
  }
};

// If player hits water, reset the player location and subtract one life.
Game.prototype.checkDestination = function() {
    if (this.player.y < 0) {
        this.player.reset();
        this.life --;
        document.getElementById('life').innerHTML = 'Life: ' + this.life;
    }
};

// If total life is zero, the game will stop.
Game.prototype.render = function() {
  if(this.life === 0){
    this.stop = true;
    this.gameOver();
  }
};

// Set Game Ended Message
Game.prototype.gameOver = function() {
  var gamePlay = document.getElementById('game-play');
  gamePlay.parentNode.removeChild(gamePlay);
  var gameOverMessage = document.getElementById('game-end');
  var gameScoreMessage = 'Your final score is ' + game.score;
  // If game ended, display the score.
  gameOverMessage.innerHTML = gameScoreMessage;
};

// Enemies our player must avoid
var Enemy = function() {
    // Enemy's initial x position value.
    this.x = -101;
    //Enemy's all y position values.
    this.enemyY = [60,145,230];

    //Enemy's randomized y position values.
    this.y = this.enemyY[Math.round(Math.random()*2)];
    this.speed;
    // Load enemy's image.
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    // Move enemy
    this.x += this.speed * dt;
    // If enemies move off the screen, restart from -101
    // right before the start of the screen.
    if (this.x > 800) {
    this.x = -101;
    // randomize enemy's y value every time it moves off the screen and start from the begining again.
    this.y = this.enemyY[Math.round(Math.random()*2)];
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Item class (for collectibles)
var Item = function(){
    //Item's all x position values.
    this.itemX = [100,200,300,400,500,600];
    //Item's all y position values.
    this.itemY = [80,160,240,320];

    //Item's x position value.
    this.x = this.startPosX();
    //Item's y position value.
    this.y = this.startPosY();
};

// Set the x position value of the item.
Item.prototype.startPosX = function() {
    var startX = this.itemX[Math.round(Math.random()*this.itemX.length)];
    return startX;
};

// Set the y position value of the item.
Item.prototype.startPosY = function() {
    var startY = this.itemY[Math.round(Math.random()*this.itemY.length)];
    return startY;
};

// Update item's position.
Item.prototype.update = function(dt) {
    this.x*dt;
    this.y*dt;
};

// Reset item's position.
Item.prototype.reset = function() {
    this.x = this.startPosX();
    this.y = this.startPosY();
};

// Renders an item in the game.
Item.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// PlayerHelper class.
// Constructs an helper item that player can collect during the game.
var PlayerHelper = function() {
    Item.call(this);
    this.loadNewHelper();
    this.reset();
};

// PlayerHelper inherites Item.
PlayerHelper.prototype = Object.create(Item.prototype);
// Set PlayerHelper constructor.
PlayerHelper.prototype.constructor = PlayerHelper;

// Loads an random new helper item.
PlayerHelper.prototype.loadNewHelper = function() {
    this.spriteOptions = ['images/Rock.png','images/Heart.png','images/Gem Blue.png', 'images/Gem Green.png', 'images/Gem Orange.png'];
    this.sprite = this.spriteOptions[Math.floor(Math.random()*this.spriteOptions.length)];
};

// Renders a new item.
PlayerHelper.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset helper item's position every five seconds.
PlayerHelper.prototype.reset = function() {
    var that = this;
    // Move the helper off the screen.
    that.x = -100;
    that.y = -100;
    setInterval(function() {
        that.loadNewHelper();
        Item.prototype.reset.call(that);
    }, 5000);
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.sprite = 'images/char-boy.png';
  this.x = 300;
  this.y = 400;
};

// Update player's position.
Player.prototype.update = function(dt) {
  this.x*dt;
  this.y*dt;
};

// Reset player's position.
Player.prototype.reset = function() {
  this.x = 300;
  this.y = 400;
};

// Renders a player in the game.
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handles keyboard pressed events.
Player.prototype.handleInput = function(key) {
  switch(key) {
    case 'left':
      if (this.x > 0)
        this.x -= 100;
      break;
    case 'up':
      if (this.y > 0)
        this.y -= 90;
      break;
    case 'right':
      if (this.x < 700)
        this.x += 100;
      break;
    case 'down':
      if (this.y < 375)
        this.y += 90;
      break;
    default:
      return;
  };
};
