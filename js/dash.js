// The score handlers
var best = null;

// The level handler
var Level = null;

// The GUI handler
var Interface = null;

// The number of right pressed panels
var right = 0;

// The number of remaining lives
var lives = 3;

// Default configurations
var DEFAULTS = {
    PRESETS: 8
};

// The user's best score
var BEST_SCORE = 0;

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
        return;
    }

    sequence.push(key);

    var sequence_length = sequence.length;
    var expected_length = Level.expected.length;

    if (expected_length === 0)
        return sequence;

    if (sequence_length > expected_length)
        sequence.shift();

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
function wrong () {
    Interface.toc();
    Interface.fails(lives);

    clearTimeout(timer);

    if (--lives === 0)
        return game_over();
    
    game();
}

// The function that deals with getting points
function correct () {
    Interface.toc();
    Interface.scores(++right);

    clearTimeout(timer);
    game();
}

// The game over handler
function game_over () {
    if (right > BEST_SCORE) {
        BEST_SCORE = right;
        $.cookie('best', right + '', { expires: 365 });
    }
    
    Interface.dismiss();
    best.html(BEST_SCORE);
    clearTimeout(timer);
    playing = false;
}

// Evaluate the keycode related to the pan
function evaluate_pan (type) {
    var names = ['left', 'up', 'right', 'down'];

    for (var i = 0; i < 4; i++)
        if (type.indexOf(names[i]) >= 0)
            break;

    evaluate(i + 37);
}

// The unstack function which evaluates a key pressed
function evaluate (key) {
    if (!playing || paused || !allowed)
        return;

    key = adjust_key(key);

    if (key === -1)
        return;

    var answer = stack_key(key);

    if (answer === null)
        return;

    if (!answer.compare(Level.expected))
        wrong();

    else
        correct();
}

// The game function which places the tiles and is recursively called
function game () {
    if (!playing || paused)
        return;

    Level.new_round();
    stack_key();

    allowed = false;

    Interface.retrieve(Level.raw, Level.challenges, function () {
        Interface.tic(Level.press_time);

        allowed = true;

        clearTimeout(timer);
        timer = setTimeout(function () {
            if (Level.missable)
                wrong();

            if (sequence.compare(Level.expected))
                correct();
            else
                wrong();

        }, Level.press_time);
    });
}

// Function used for reseting the game's values
function prepare () {
    Level = new DashLevel([
        { rounds: 0,  challenges: [0] },
        { rounds: 20, challenges: [2] },
        { rounds: 30, challenges: [1] },
        { rounds: 40, challenges: [4] },
        { rounds: 60, challenges: [3] }
    ]);

    Interface.prepare();

    lives = 3;
    right = 0;

    playing = true;
}

// Let the games begin!
$(document).ready(function() {
    Interface = new DashGUI(
    {
        panels: ['#panel-0', '#panel-1'],
        icons:  ['#panel-0 i', '#panel-1 i'],
        score:  {main: '#score', timer: '#gauge', 
                lives: '.lives div', points: '#counter'}
    },
    {  
        presets: DEFAULTS.PRESETS,
        panel: 'preset-*',
        icon:  'icon-angle-.',
        wrong_icon: 'icon-cancel',
        life_lost: '+lost',
        correct_icon: '+correct',
        replace_array: ['left', 'up', 'right', 'down']
    }, 
    {
        1 : {
            panel: 'reverse-*'
        },

        2 : {
            icon: 'icon-angle-double-.'
        },

        3 : {
            icon: 'icon-cw'
        },

        4 : {
            icon: '+pressed'
        }
    });

    window.addEventListener('focus', function () {
        paused = false;
        game();
    });

    window.addEventListener('blur', function () {
        paused = true;
        clearTimeout(timer);
    });

    $('body').keydown(function (e) {
        evaluate(e.keyCode);
    });

    Hammer(document.body, {
        recognizers: [
            [ Hammer.Swipe,
                {
                    direction: Hammer.DIRECTION_ALL 
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
    
    best = $('#best');

    if ($.cookie('best') === undefined)
        $.cookie('best', '0', { expires: 365 });

    BEST_SCORE = $.cookie('best');

    best.html(BEST_SCORE);

    $('#btn_play').click(function(){
        prepare();
        game();
    });
});