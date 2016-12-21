/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {

    //Predefine the variables we'll be using within this scope,


    var doc = global.document,
        win = global.window,

        // create the canvas element, grab the 2D context for that canvas
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),

        // variable that is required for the game loop & for time delta information
        lastTime,

        // To be used by setTimer()
        seconds,
        timer;

        game = new Game();

    // Set the canvas elements height/width and add it to the DOM.
    canvas.width = 808;
    canvas.height = 606;
    doc.getElementById('game-play').appendChild(canvas);

    /*
    This function serves as the kickoff point for the game loop itself and
    handles properly calling the update and render methods.
     */
    function main() {

        //Get our time delta information which is required if your game requires smooth animation.

        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /*
        Call our update/render functions, pass along the time delta to our update function
        since it may be used for smooth animation.
         */
        update(dt);
        render();

        /*
        Set our lastTime variable which is used to determine the time delta
        for the next time this function is called.
         */
        lastTime = now;

        /*
        Use the browser's requestAnimationFrame function to call this
        function again as soon as the browser is able to draw another frame.
        If game's stop value is set to true, the game will end.
         */
        if(!game.stop){
            win.requestAnimationFrame(main);
        }
    }

    /*
    Sets a time limit for the game.
    Parameters:
     time {number} - Total seconds of the timer
     game {Game} - The new game instance
     */
    function setTimer(time, game) {
        timer = doc.getElementById('timer');
        seconds = time;

        // Sets the game's stop value to true if the value of seconds become zero. The game ends.
        if (seconds === 0) {
            game.gameOver();
            game.stop = true;
        }

        // If game's stop value is false, update timer and continue the game.
        if (!game.stop) {
            seconds--;

            // updateTimer() defined after setTimer()
            updateTimer();
            win.setTimeout(function(){
                setTimer(seconds, game);
            }, 1000);
        }
    }

    // Updates the timer every second.
    function updateTimer() {
        var timerStr;
        var tempSeconds = seconds;
        var tempMinutes = Math.floor(seconds / 60) % 60;
        tempSeconds -= tempMinutes * 60;

        // formatTimer() defined after updateTimer()
        timerStr = formatTimer(tempMinutes, tempSeconds);
        timer.innerHTML = timerStr;
    }

    /*
    Formatted timer {string} - displayed above game
    Parameters:
     minutes {number} - Remaining minutes of the timer
     seconds {number} - Ramaining seconds of the timer
    Returns a formatted time string.
     */
    function formatTimer(minutes, seconds) {
        var formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
        var formattedSeconds = (seconds < 10) ? '0' + seconds : seconds;

        return formattedMinutes + ":" + formattedSeconds;
    }

    /*
    Initial setup that should only occur once,
    particularly setting the lastTime variable that is required for the game loop.
     */
    function init() {
        lastTime = Date.now();
        doc.getElementById('game-start').onclick = function() {
           main();
           setTimer(90, game);

           doc.getElementById('score').innerHTML = 'Score: ' + game.score;
           doc.getElementById('life').innerHTML = 'Life: ' + game.life;
           doc.getElementById('timer').style.display = 'inline-block';
           doc.getElementById('life').style.display = 'inline-block';
           doc.getElementById('score').style.display = 'inline-block';
           doc.getElementById('try-again').style.display = 'inline-block';
           doc.getElementById('game-play').style.display = 'inline-block';

           var gameRules = doc.getElementById('game-rules');
           gameRules.parentNode.removeChild(gameRules);
           var gameStart = doc.getElementById('game-start');
           gameStart.parentNode.removeChild(gameStart);
           var gameTitle = doc.getElementById('game-title');
           gameTitle.parentNode.removeChild(gameTitle);
        };
    }

    /*
    This function is called by main (our game loop) and
    itself calls all of the functions which may need to update entity's data.
    Parameter : dt {number} - A time delta between ticks
     */
    function update(dt) {
        updateEntities(dt);
        game.checkCollisions();
        game.checkDestination();
        game.checkPlayerHelpers();
    }

    /*
    This is called by the update function and loops through all of the
    objects within your allEnemies array as defined in app.js and calls their update() methods.
    Parameter : dt {number} - A time delta between ticks
     */

    function updateEntities(dt) {
        game.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        game.player.update(dt);
        game.playerHelper.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Row 1 is water
                'images/stone-block.png',   // Row 2 is stone
                'images/stone-block.png',   // Row 3 is stone
                'images/stone-block.png',   // Row 4 is stone
                'images/grass-block.png',   // Row 5 is grass
                'images/grass-block.png'    // Row 6 is grass
            ],
            numRows = 6,
            numCols = 8,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /*
                The drawImage function of the canvas' context element requires 3 parameters:
                * the image to draw,
                * the x coordinate to start drawing and
                * the y coordinate to start drawing.
                We're using our Resources helpers to refer to our images
                so that we get the benefits of caching these images, since
                we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /*
    This function is called by the render function and is called on each game tick.
    It's purpose is to then call the render functions defined on enemy and player entities within app.js.
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call the render function you have defined.
         */
        game.allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        game.player.render();
        game.playerHelper.render();
        game.render();
    }

    // load all of the images we know we're going to need to draw our game level.
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',

        'images/enemy-bug.png',
        'images/char-boy.png',

        'images/Heart.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Rock.png'
    ]);

    /*
    set init as the callback method, so that...
    when all of these images are properly loaded our game will start.
    */
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
