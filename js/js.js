// The panel handlers
var panels = [null, null];

// The arrow handlers
var arrows = [null, null];

// The gauge handler
var gauge = null;

// The score handlers
var last = null, points = null, msg = null;

// The names of the directions
var names = ['left', 'up', 'right', 'down'];

// Direction animations
var positions = [
    {x: '100%', y: '0'},
    {x: '0', y: '100%'},
    {x: '-100%', y: '0'},
    {x: '0', y: '-100%'}
];

// The number of rounds elapsed
var rounds = 0;

// The number of right pressed panels
var right = 0;

// The number of remaining lives
var lives = 3;

// The time (ms) that panels are going to come and are
// going to awaits to be dismissed
var fall_time = 0, press_time = 0;

// Default configurations
var DEFAULTS = {
    PRESETS: 8,
    FALL_TIME: 700,
    PRESS_TIME: 2000,
    ROUND_DECREASE: 30,
    MINIMUM_VELOCITY: 600
};

// The user's best score
var BEST_SCORE = 0;

// The timer handler
var timer = null;

// Whether or not the player paused the game
var paused = false;

// Whether or not the game is active
var playing = false;

// A flag to determine whether or not the player 
// can press the key
var allowed = false;

// The direction to be pressed
var expected = 0;

// The panel being displayed
var current = 1;

// The function that stops the gauge timer
function stop_gauge () {
    gauge.stop();
}

// The function that starts the gauge timer
function start_gauge () {
    gauge.css('width', 0).animate({width: '100%'}, press_time);
}

// The function that deals with losing lp
function wrong () {
    arrows[current].removeClass().addClass('icon-cancel');

    $('.lives i:nth-child(' + lives + ')').removeClass().addClass('icon-circle-empty')

    clearTimeout(timer);

    if (--lives === 0)
        return game_over();
    
    game();
}

// The game over handler
function game_over () {

    if (right > BEST_SCORE) {
        BEST_SCORE = right;
        $.cookie('best', right + '', { expires: 365 });
    }

    last.html(right);
    best.html(BEST_SCORE)

    clearTimeout(timer);
    panels[0].fadeOut();
    panels[1].fadeOut();
    $('.lives').fadeOut();
    $('.timer').fadeOut();
    $('h2').fadeOut();
    playing = false;
}

// Evaluate the keycode related to the pan
function evaluate_pan (type) {
    for (var i = 0; i < 4; i++)
        if (type.indexOf(names[i]) >= 0)
            break;

    evaluate(i + 37);
}

// The unstack function which evaluates a key pressed
function evaluate (key) {
    if (!playing || paused || !allowed)
        return;

    stop_gauge();

    allowed = false;

    key -= 37;

    if (key < 0 || key > 3)
        return;

    if (key !== expected)
        return wrong();

    $('#counter').html(++right);

    clearTimeout(timer);

    arrows[current].addClass('correct');

    game();
}

// Updates the difficulty of the game
function difficulty () {
    press_time -= DEFAULTS.ROUND_DECREASE;
    press_time = Math.max(press_time, DEFAULTS.MINIMUM_VELOCITY);

    // fall_time -= 5;
    // fall_time = Math.max(fall_time, 200);    
}

// Generates a number in [0, 4]
function rand () {
    return ~~(Math.random() * 4);
}

// The game function which places the tiles and is recursively called
function game () {
    if (!playing || paused)
        return;

    difficulty();

    allowed = false;

    var next = current ^ 1;

    panels[current].css('z-index', 0);
    panels[next].css('z-index', 1);

    panels[next].removeClass().addClass('preset-' + (rounds % DEFAULTS.PRESETS));

    var direction = rand();

    expected = direction;

    current = next;

    arrows[current].removeClass().addClass('icon-' + names[direction] + '-open');

    var pos = positions[rand()];

    panels[current].css({left: pos.x, top: pos.y});

    panels[current].animate({left: 0, top: 0}, fall_time, function () {
        start_gauge();

        allowed = true;

        clearTimeout(timer);
        timer = setTimeout(wrong, press_time);
    });

    rounds++;
}

// Let the games begin!
$(document).ready(function() {

    window.addEventListener('focus', function () {
        paused = false;
        game();
    });

    window.addEventListener('blur', function () {
        paused = true;
        clearTimeout(timer);
    });

    best = $('#best');
    msg = $('.msg');
    last = $('#last');

    gauge = $('#gauge');

    panels[0] = $('#panel-0');
    panels[1] = $('#panel-1');

    arrows[0] = $('#panel-0 i');
    arrows[1] = $('#panel-1 i');

    W = panels[0].width();
    H = panels[0].height();

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
    

    if ($.cookie('best') === undefined)
        $.cookie('best', '0', { expires: 365 });

    BEST_SCORE = $.cookie('best');

    best.html(BEST_SCORE);
    last.html(0);

    msg.fadeIn();

    $('.txt a').click(function(){
        $('.lives i').removeClass().addClass('icon-circle');

        $('h2').html('0');

        $('h2').fadeIn();
        $('.lives').fadeIn();
        $('.timer').fadeIn();

        fall_time = DEFAULTS.FALL_TIME;
        press_time = DEFAULTS.PRESS_TIME;
        rounds = 0;
        lives = 3;
        right = 0;

        gauge.css('width', 0);

        panels[0].fadeIn();
        panels[1].fadeIn();

        panels[0].css({top: '-100%', left: '-100%'});
        panels[1].css({top: '-100%', left: '-100%'});

        playing = true;
        game();
    });
});