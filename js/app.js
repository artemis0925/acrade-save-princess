'use strict';

/**
 * This is a project of Udacity front-end developer nanodegree.
 * It is for practicing OOP of javascript and how to develop a simple game.
 * The codes will generate a frogger game in a canvas.
 *
 * @require     state-machine.js
 * @author      afa
 *
 *
 */

var BLOCKWIDTH              = 101;
var BLOCKHEIGHT             = 83;
var START_X                 = 202;
var START_Y                 = 415;
var PRI_START_X             = 202;
var PRI_START_Y             = 0;
var ROW_EDGE                = 404;
var COLOMN_EDGE             = 415;
// var COLLECTION_TOP_X        = 25;

/**
 * Base class, every item in the canvas is an actor
 * @constructor
 * @param {float} x - The x posision of the actor.
 * @param {float} y - The y posision of the actor.
 * @param {string} imageUrl - The images url
 */
var Actor = function(x, y, imageUrl) {
    this.x = x;
    this.y = y;
    this.imageUrl = imageUrl;
};

/** @Actor#render */
Actor.prototype.render = function() {
    ctx.drawImage(Resources.get(this.imageUrl), this.x, this.y);
};

/**
 * Enemies our player must avoid
 * @constructor
 */
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    Actor.call(this,
               Math.floor((Math.random() * (4 - 0) + 0)) * BLOCKWIDTH,
               Math.floor((Math.random() * (4 - 1) + 1)) * BLOCKHEIGHT,
               'images/enemy-bug.png');
    this.speed = Math.random() * (4 - 1) + 1;

};

Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Enemy#update
 * Update the enemy's position, required method for game
 * @param {float} dt - A time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + dt * 100 * this.speed;
    if(this.x > 1000) { //set the bugs will run 1000 long...
        this.x = 0;
    }
};

/**
 * Represent a player.
 * @constructor
 */
var Player = function() {
    Actor.call(this, START_X, START_Y, 'images/char-boy.png');
    // the first element of this.movement represents the x movement.
    // and the second represent the y movement.
    // positive number to the right and down.
    this.movement = [0, 0];
    this.collection = [];
    this.faceTo = ''; //five options: left, right, up, down and none...
};

Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;

/** Player#checkOutOfCanvas - Check if out of the canvas. */
Player.prototype.checkOutOfCanvas = function() {
    if(this.x + this.movement[0] < 0 || this.x + this.movement[0] > ROW_EDGE) {
        this.x = this.x;
    }
    else{
        this.x = this.x + this.movement[0];
    }
    if(this.y + this.movement[1] < 0 || this.y + this.movement[1] > COLOMN_EDGE) {
        this.y = this.y;
    }
    else {
        this.y = this.y + this.movement[1];
    }
};

/** Player#collectItem - handler when collide with gems */
Player.prototype.collectItem = function() {
    var that = this;
    allItems.forEach(function(e) {
        if(that.x === e.x && that.y === e.y) {
            e.eaten();
            that.collection.push(e.name);
            console.log(that.collection);
        }
    });
};

/** Player#update - update player property. */
Player.prototype.update = function() {

    this.checkOutOfCanvas();
    this.movement = [0, 0]; // reset the movement when finish one move...

    // check collision.
    if(this.collision() === 1) {
        this.reset(START_X, START_Y);
    }
    if(this.collision() === 2) {
        this.reset(PRI_START_X, PRI_START_Y);
    }

    this.collectItem();
};

/** Player#renderCollection - render the collcting state in the left top conner. */
Player.prototype.renderCollection = function() {
    ctx.restore();
    ctx.drawImage(Resources.get('images/blue-gem.png'), 10, 60, 20, 20);
    ctx.strokeText('x', 35, 75);
    ctx.drawImage(Resources.get('images/green-gem.png'), 10, 80, 20, 20);
    ctx.strokeText('x', 35, 95);
    ctx.drawImage(Resources.get('images/orange-gem.png'), 10, 100, 20, 20);
    ctx.strokeText('x', 35, 115);

    if(this.collection.indexOf('blue-gem') !== -1) {
        ctx.strokeText('1', 50, 75);
    }else {
        ctx.strokeText('0', 50, 75);
    }

    if(this.collection.indexOf('green-gem') !== -1) {
        ctx.strokeText('1', 50, 95);
    }else {
        ctx.strokeText('0', 50, 95);
    }

    if(this.collection.indexOf('orange-gem') !== -1) {
        ctx.strokeText('1', 50, 115);
    }else {
        ctx.strokeText('0', 50, 115);
    }
};

/**
 * Player#handleInput
 * handle keypress, save the movement into this.movement array.
 * param {string} keyPress - the key press from the user.
 */
Player.prototype.handleInput = function(keyPress) {
    switch(keyPress) {
        case 'left':
            this.movement = [-BLOCKWIDTH, 0];
            this.faceTo = 'left';
            break;
        case 'right':
            this.movement = [BLOCKWIDTH, 0];
            this.faceTo = 'right';
            break;
        case 'up':
            this.movement = [0, -BLOCKHEIGHT];
            this.faceTo = 'up';
            break;
        case 'down':
            this.movement = [0 ,BLOCKHEIGHT];
            this.faceTo = 'down';
            break;
    }
};

/** Player#collision - collision with bugs handler. */
Player.prototype.collision = function() {
    // flag can be 0, 1, 2.
    // 0: no collision...
    // 1: collision without princess, then go back to starting point..
    // 2: collision with princess, then go back to river...
    var flag = 0;
    var that = this;
    allEnemies.forEach(function(e) {
        if(that.x - e.x > -20 && that.x - e.x < 20 && that.y === e.y && princess.status === 0) {
            flag = 1;
            console.log('collision and back to start point.');
        }
        if(that.x - e.x > -20 && that.x - e.x < 20 && that.y === e.y && princess.status === 1) {
            flag = 2;
            that.faceTo = 'none';
            console.log('collision and back to river.');
        }
        if(princess.x - e.x > -20 && princess.x - e.x < 20 && princess.y === e.y) {
            flag = 2;
            that.faceTo = 'none';
            console.log('collision and back to river.');
        }
    });
    return flag;
};

/** Player#reset - reset the position of the player. */
Player.prototype.reset = function(x,y) {
    this.x = x;
    this.y = y;
};

/**
 * Represent the gems.
 * @constructor
 * @param {string} name - The name of the gem.
 */
var CollectibleItem = function(name) {
    Actor.call(this,
               Math.floor((Math.random() * (4 - 0) + 0))*BLOCKWIDTH,
               Math.floor((Math.random() * (4 - 1) + 1))*BLOCKHEIGHT,
               'images/' + name + '.png');
    this.name = name;
};

CollectibleItem.prototype = Object.create(Actor.prototype);
CollectibleItem.prototype.constructor = CollectibleItem;

/** CollectibleItem#eaten - shift the item position to -1000 when is eaten. */
CollectibleItem.prototype.eaten = function() {
    this.x = -1000;
    this.y = -1000;
};

/**
 * Represent the princess.
 * @constructor
 */
var Princess = function() {
    Actor.call(this, PRI_START_X, PRI_START_Y, 'images/char-princess-girl.png');
    this.status = 0; // store status of if the boy collects enough gem and get to her...
};

Princess.prototype = Object.create(Actor.prototype);
Princess.prototype.constructor = Princess;

/** Princess#say - princess will say somethings when the player get to her. */
Princess.prototype.say = function() {
    // if player get the gems, she would say...
    if(player.x === this.x && player.y === this.y && player.collection.length === 3){
        ctx.drawImage(Resources.get('images/bubble.png'), 200, 100);
        ctx.save();
        ctx.font = "20px Arial";
        ctx.fillText('Take me home, my warrior.', 235, 250);
        ctx.restore();
        player.faceTo = 'none';
        this.status = 1;

    }
    // if player did not get all the gems, she would say...
    if(player.x === this.x && player.y === this.y && player.collection.length !== 3){
        ctx.drawImage(Resources.get('images/bubble.png'), 200, 100);
        ctx.save();
        ctx.font = "20px Arial";
        ctx.fillText('Oh, I will not go with', 250, 200);
        ctx.fillText('you unless you get all', 250, 220);
        ctx.fillText('the gems.', 250, 240);
        ctx.restore();
    }
};

/** Princess#update - update princess position based on the player position and his faceTo. */
Princess.prototype.update = function() {
    if(this.status === 1){
        switch(player.faceTo) {
            case 'left':
                this.x = player.x + BLOCKWIDTH;
                this.y = player.y;
                break;
            case 'right':
                this.x = player.x - BLOCKWIDTH;
                this.y = player.y;
                break;
            case 'up':
                this.x = player.x;
                this.y = player.y + BLOCKHEIGHT;
                break;
            case 'down':
                this.x = player.x;
                this.y = player.y - BLOCKHEIGHT;
                break;
            case 'none':
                this.x = player.x;
                this.y = player.y;
        }
    }
};

/** Princess#reset - reset princess to the river. */
Princess.prototype.reset = function() {
    this.x = PRI_START_X;
    this.y = PRI_START_Y;
};

// initial princess
var princess = new Princess();


// initial collectible items
var allItems = [];
var nameArr = ['blue-gem', 'green-gem', 'orange-gem'];
nameArr.forEach(function(e){
    var item = new CollectibleItem(e);
    allItems.push(item);
});


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for(var i = 0; i < 10; i++) {
    var enemy = new Enemy();
    allEnemies.push(enemy);
}
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.

var handler = function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
};

document.addEventListener('keyup', handler);
