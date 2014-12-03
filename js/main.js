window.onload = function(){

//stage width, height, render context Phaser.CANVAS / Phaser.WEBGL /Phaser.AUTO,
// DOM element id to insert the game CANVAS, set of essential functions mapping
//    to local functions
    var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    }),
        platforms,
        player,
        cursors,
        stars,
        score = 0,
        scoreText,
        resultText,
        running = false,
        win = false,
        timeLeft = 13,
        timeElapsed = 0,
        startTime,
        timerText; //need to be accessed in both create and update

    //load assets in preload
    function preload () {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    }

    //initialize game in create
    function create () {
        //game.add.sprite(0, 0, 'star');

        //enable physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //add background
        game.add.sprite(0, 0, 'sky');

        createPlatforms();
        createPlayer();
        createStars();

        // init arrow key controls
        cursors = game.input.keyboard.createCursorKeys();
        // add score text (x, y, default text, style
        scoreText = game.add.text(16, 16, 'Score: 0', { fontSize : '32px', fill : '#000' });
        resultText = game.add.text(300, 300, '', { fontSize : '64px', fill: '#000' });
        timerText = game.add.text(300, 16, 'Time left: ' + timeLeft + 's', { fontSize : '32px', fill: '#000' });

        running = true;
        startTime = game.time.time;
    }

    function createPlatforms () {

        //add platforms group
        platforms = game.add.group();
        //enable physics on all objects created in this group
        platforms.enableBody = true;


        //create the ground in the platforms group, using the 'ground' image
        var ground = platforms.create(0, game.world.height - 64, 'ground');
        //scale the image to fit
        ground.scale.setTo(2, 2);
        //make it stand still
        ground.body.immovable = true;

        //create the ledges in the platforms group, still using the 'ground' image
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;
        //create another ledge
        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;

    }

    function createPlayer () {

        //create the player as a sprite
        player = game.add.sprite(32, game.world.height - 150, 'dude');

        // enable physics on the player
        game.physics.arcade.enable(player);
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;

        //add player animation: name, spritesheet indexes, framerate, loop
        player.animations.add('left', [0, 1, 2, 3], 10, true)
        player.animations.add('right', [5, 6, 7, 8], 10, true)

    }

    function createStars () {
        //create stars group and add it to game
        stars = game.add.group();
        //let members in this group have a body to manipulate
        stars.enableBody = true;
        // create 12 stars in the stars group
        for ( var i = 0; i < 12; i++ ) {
            //evenly spread them across the stage top, use "star" image
            var star = stars.create( i * 70, 0, 'star');
            //let the stars fall
            star.body.velocity.y = (Math.random() - .5) * 1650;
            star.body.velocity.x = (Math.random() - .5) * 1600;
            //let them bounce between .7 to .9 (maximal bounce is 1)
            star.body.bounce.y = star.body.bounce.x = 1;
            star.body.collideWorldBounds = true;
        }

    }

    function update () {

        // collide player and the platforms
        game.physics.arcade.collide(player, platforms);
        // collide stars group and platforms group
        game.physics.arcade.collide(stars, platforms);
        // check overlap between player and any of the stars, call eventhandler function collectStar
        game.physics.arcade.overlap(player, stars, collectStar, null, this);

        if(running) {

            // reset horizontal velocity
            player.body.velocity.x = 0;

            if ( cursors.left.isDown ) {

                player.body.velocity.x = -150;

                player.animations.play('left');

            } else if ( cursors.right.isDown ) {

                player.body.velocity.x = 150;

                player.animations.play('right');

            } else {

                player.animations.stop();

                player.frame = 4;

            }

            if ( cursors.up.isDown && player.body.touching.down ) {

                player.body.velocity.y = -350;

            }

            updateTimer();

        } else {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.body.gravity.y = 0;

            for(var i = 0; i < stars.children.length; i++) {
                var star = stars.children[i];
                star.body.velocity.x = 0;
                star.body.velocity.y = 0;
            }

            player.animations.stop();

            player.frame = 4;

            if ( win ) {

                resultText.text = "You win!";

            } else {

                resultText.text = "Game over!";

            }


        }

    }

    function updateTimer () {

        var newTimeElapsed = Math.floor( (game.time.time - startTime) / 1000 ) % 60 ;

        if( newTimeElapsed !== timeElapsed ) {
            timeElapsed = newTimeElapsed;
            timeLeft--;
        }

        if( timeLeft > 0) {

            timerText.text = 'Time left: ' + timeLeft + 's';

        } else {

            timerText.text = "Time out!";
            win = false;
            running = false;

        }


    }

    function collectStar ( player, star ) {

        //remove the star
        star.kill();

        stars.remove(star);

        score += 10;
        scoreText.text = 'Score: ' + score;

        if ( stars.children.length == 0 ) {
            win = true;
            running = false;
        }

    }

}