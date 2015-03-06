/*
    Dash v 0.4  | (c) 2015 Breno Lima de Freitas - breno.io | Licensed under CC-NC-ND

    The Dash object handles the game logic, assigning
    the proper listeners and taking care of calling the correct
    interface-related objects, as well as handling life points
    and how the player press the correct key.

    To begin a game, the user must call .init() first and only once.
    After that, before every gameplay, the user must call
    .prepare() followed by .start(). Using the desired attributes
    for the "prepare" method.

    To instantiate Dash, there are two attributes that must
    be given:
    @Interface: A properly initialized Dash-GUI object
    
    @handlers: An object that can have the following attributes
    (all are callback functions):
        - before_game: Triggered right before each new panel
        being called. Has two input parameters: @direction that is 
        the raw arrow direction that should be displayed. @modifier
        is an array of indexes for a specific style that must be applied.

        - after_game: Triggered when the game ends. Has one
        input parameter that is the final score.

        - best_score: Achieved at maximum once in a run. Triggered
        when the player beats his/her best score. Has one input 
        parameter that is the current score.

        - lost_life: Triggered when the player loses a life. Has
        one input parameter that is current life points.

        - got_point: Triggered when the player gets a point. Has
        one input parameter that is current score.

        - key_pressed: Triggered right after a valid key is computed.
        Has three input parameters: the key pressed (Number), the expected 
        sequence to be performed (Array) and the challenged in the
        current panel (Array).

        - on_panel_retrieve: Triggered right after a panel is fully
        retrieved. Has three input parameters: The raw arrow direction that
        should be displayed; An array of indexes for the challenge being applied;
        And what the expected value of key pressing is.

    And two optional attributes related to DashLevel:

    @times: A object with the following attributes:
      press_time: The time the player has to press
                  (default 2 seconds)
      step: The amount of seconds that the next 
            turn will have less than the current
            (default 40 ms)

    @overlaid_challenges: The number of allowed
    overlays in a challenge (default 1).

    The function prepare takes three arguments:
    @n_lives: The number of lives for this run. (default 3). 

    @best_score: The current best score. Used to trigger handlers.
    best_score. (default 0).

    @challenges: Mandatory argument. This is an object that defines
    the challenges to be beaten, as explained in DashLevel definition.
*/


;(function (w) {
    'use strict';


    w.Dash = function (Interface, handlers, times, overlaid_challenges) {
        // A valid Dash-GUI object is mandatory
        if (!Interface)
            return false;

        // The this handler
        var _ = this;

        // The level handler
        var Level = null;

        // The number of right pressed panels
        var right = 0;

        // The number of remaining lives
        var lives = 3;

        // The player's best score
        var BEST_SCORE = 0;

        // The number of panels that must be dismissed
        // in order to call Interface.hide_timer
        var HIDE_TIMER = -1;

        // Whether or not this run has a new best
        var new_best = false;

        // The timer handler
        var timer = null;

        // Whether or not the player paused the game
        var paused = false;

        // Whether or not the game is active
        var playing = false;

        // Whether or not the player can press the key
        var allowed = false;

        // The pressed sequence
        var sequence = [];

        // The function that manages the sequence
        // pressed by the user. It adds key to
        // the sequence and return an array containing
        // what the test array should be, regarding
        // Level.expected length. If the expected length
        // has not been achieved, it returns null. 
        // If key is undefined, then sequence is set 
        // to an empty array.
        function stack_key (key) {
            if (key === undefined) {
                sequence = [];
                return null;
            }

            sequence.push(key);

            var sequence_length = sequence.length;
            var expected_length = Level.expected.length;

            if (expected_length === 0)
                return sequence;

            if (sequence_length > expected_length) {
                sequence.shift();
                return sequence;
            }

            if (sequence_length === expected_length)
                return sequence;

            if (sequence_length < expected_length)
                return null;
        }

        // Helper function that converts a keycode
        // to a code in [0, 3], also allowing awsd
        function adjust_key (key) {
            var awsd = {
                65 : 0, 
                87 : 1, 
                68 : 2, 
                83 : 3
            };

            if (key >= 37 && key <= 40)
                return key - 37;

            if (awsd[key] !== undefined)
                return awsd[key];

            return -1;
        }

        // The function that deals with losing lives
        _.wrong = function () {
            handlers.lost_life(lives - 1);

            Interface.toc();
            Interface.fails(lives);

            clearTimeout(timer);

            if (--lives === 0)
                return game_over();
            
            _.start();
        }

        // The function that deals with getting points
        _.correct = function () {
            right++;

            handlers.got_point(right);

            Interface.toc();
            Interface.scores(right);

            if (right > BEST_SCORE && !new_best) {
                handlers.best_score(right);
                new_best = true;
            }

            if (right === HIDE_TIMER)
                Interface.hide_timer();

            clearTimeout(timer);
            _.start();
        }

        // The game over handler
        function game_over () {
            Interface.dismiss();
            clearTimeout(timer);
            playing = false;

            handlers.after_game(right);
        }

        // Evaluate the keycode related to the pan
        function evaluate_pan (type) {
            var names = ['left', 'up', 'right', 'down'];

            for (var i = 0; i < 4; i++)
                if (type.indexOf(names[i]) >= 0)
                    break;

            evaluate(i + 37);
        }

        // The unstack function which evaluates a key pressed.
        function evaluate (key) {
            if (!playing)
                return;

            handlers.key_pressed(key, Level.expected.clone(), 
                Level.challenges.clone());

            if (paused || !allowed)
                return false;

            if (_.test(key) === true)
                _.correct();

            else if (_.test(key) === false)
                _.wrong();
        }

        // Checks whether or not the game is paused
        _.is_paused = function () {
            return paused;
        }

        // An interface so that the user can emulate the interaction
        // with the system by inputing a key (that will be normally)
        // computed and compared to the expected value.
        _.test = function (key) {
            key = adjust_key(key);

            if (key === -1)
                return null;

            var answer = stack_key(key);

            if (answer === null)
                return null;

            if (answer.compare(Level.expected))
                return true;

            else
                return false;          
        }

        // A function that pauses the whole game
        _.pause = function () {
            paused = true;
            clearTimeout(timer);
            Interface.toc();
        }

        // A function that resumes the whole game
        _.resume = function () {
            paused = false;
        }

        // The game function which places the tiles and is recursively called
        _.start = function () {
            if (!playing || paused)
                return;

            Level.new_round();
            stack_key();

            allowed = false;

            handlers.before_game(Level.raw, Level.challenges);

            Interface.retrieve(Level.raw, Level.challenges, function () {
                Interface.tic(Level.press_time);

                allowed = true;

                clearTimeout(timer);
                timer = setTimeout(function () {
                    if (Level.missable) 
                        return _.wrong();

                    if (sequence.compare(Level.expected))
                        _.correct();
                    else
                        _.wrong();

                }, Level.press_time);

                setTimeout(function () {
                    handlers.on_panel_retrieve(Level.raw, Level.challenges.clone(), 
                        Level.expected.clone());
                }, 5);
            });
        }

        // Function used for reseting the game's values
        _.prepare = function (challenges, n_lives, best_score, no_timer_turns) {
            if (n_lives === undefined)
                n_lives = 3;

            if (best_score === undefined)
                best_score = 0;

            if (no_timer_turns === undefined)
                no_timer_turns = -1;

            BEST_SCORE = best_score;
            HIDE_TIMER = no_timer_turns;

            Level = new DashLevel(challenges, times, overlaid_challenges);

            Interface.prepare();

            lives = n_lives;
            right = 0;

            playing = true;
            new_best = false;
        }

        // Prepare interface and set listeners
        _.init = function () {

            var handler_names = ['before_game', 'after_game', 
            'best_score', 'lost_life', 'got_point', 'key_pressed'];

            var length = handler_names.length;

            if (handlers === undefined)
                handlers = {};

            for (var i = 0; i < length; i++) {
                var name = handler_names[i];

                if (handlers[name] === undefined)
                    handlers[name] = function () {};
            }

            window.addEventListener('focus', function () {
                _.resume();
                _.start();
                var text = $('title').html();
                $('title').html(text.replace(' - Paused', ''));
            });

            window.addEventListener('blur', function () {
                _.pause();
                var text = $('title').html();
                $('title').html(text + ' - Paused');
            });

            $('body').keydown(function (e) {
                var key = e.keyCode;

                if (key >= 37 && key <= 40) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                evaluate(key);
            });

            var panels = Interface.getPanels();
            length = panels.length;

            for (var i = 0; i < length; i++) {
                Hammer(panels[i].get(0), {
                    recognizers: [
                        [ Hammer.Swipe,
                            {
                                direction: Hammer.DIRECTION_ALL,
                                velocity: 0.2,
                                threshold: 10
                            }
                        ]
                    ]
                }).on('swipeleft', function (event) {
                    evaluate_pan(event.type);
                }).on('swipeup', function (event) {
                    evaluate_pan(event.type);
                }).on('swiperight', function (event) {
                    evaluate_pan(event.type);
                }).on('swipedown', function (event) {
                    evaluate_pan(event.type);
                });
            }

            return _;
        }
    }
}) (window);