// Default values
var W, H;
var SITE = escape('http://dash.breno.io/');
var listener = new window.keypress.Listener();
var msg = null, msg_icon = null;
var game = null;
var end_game_view = null;
var last_score = null;
var last_time = null;
var konami = false;
var best = 0, BEST_SCORE = 0;
var tic = 0;
var shares = {fb: null, tw: null};
var times = {
    press_time: 2000,
    step: 5
};
var konami_lives = 42;
var ROUNDS_TO_HIDE = -1;
var tutorial = 1, message = null;
var tutorial_btn = {on: null, off: null};

var taught = [];

var challenges = [
    {
        alias: 'simple',

        morph: function (tentative, last) {
            return {
                expected: [tentative.expected[0]]
            };
        },

        text: 'Press the key/swipe to the direction of the arrow'
    },

    {   
        alias: 'reverse',
        constraints: ['pressed', 'previous'],
        rounds: 60,

        morph: function (tentative, last) {
            var length = tentative.expected.length;
            var values = {expected: []};

            for (var i = 0; i < length; i++)
                values.expected.push(mod(tentative.expected[i] + 2, 4));

            return values;
        },

        text: 'Press the key/swipe to the opposite direction of the arrow'
    },

    {   
        alias: 'double',
        constraints: ['pressed', 'previous'],
        rounds: 20,

        morph: function (tentative, last) {
            return {
                expected: [tentative.expected[0], tentative.expected[0]]
            };
        },

        text: 'Press the key/swipe twice to the direction of the arrow'
    },

    {   
        alias: 'previous',
        first_turn: false,
        constraints: ['reverse', 'double', 'pressed'],
        rounds: 70,

        morph: function (tentative, last) {
            return {
                expected: last.expected,
                missable: last.missable,
                direction: last.direction
            };
        },

        text: 'Repeat your previous action'
    },

    {   
        alias: 'pressed',
        constraints: ['reverse', 'double', 'pressed'],
        rounds: 40,

        morph: function (tentative, last) {
            return {
                expected: [],
                missable: false
            };
        },

        text: 'Do not do anything!'
    }
];
    
listener.sequence_combo('up up down down left right left right b a enter', function() {
    konami ^= true;
    msg_icon.removeClass().addClass('icon-joystick');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
});


// Toggles fullscreen
function toggleFullScreen () {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// Fetches object
function fetch (name, result) {
    var cookie = $.cookie(name);
    var local  = window.localStorage.getItem(name);

    if (!cookie && !local)
        return null;

    return cookie || local;
}


// Stores object
function store (name, value) {
    $.cookie(name, value, { expires: 365 });
    window.localStorage.setItem(name, value);
}


// Achievement popup
function achievement () {
    msg_icon.removeClass().addClass('icon-trophy');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
}

// A function called to begin dash
function goDash () {
    var hiding = ROUNDS_TO_HIDE;

    hiding += ~~(Math.random() * 20);

    game.prepare(challenges, konami ? konami_lives : 3, 
        BEST_SCORE, -1);
    tic = (new Date()).getTime();
    game.start();   
}

$(document).ready(function() {

    $('#btn_howto').click(function() { $('#info').fadeIn('slow', function () {
        $(this).css('overflow', 'auto');
    }); });
    $('.dismiss').click(function() { $(this).parent().fadeOut(); });

    W = $(window).width();
    H = $(window).height();

    msg = $('#msg');
    msg_icon = $('#msg_icon');

    end_game_view = $('#end_game_view');

    best = $('#best');
    last_score = $('#last_score');
    last_time =  $('#last_time');

    shares.fb = $('#fb_share_score');
    shares.tw = $('#tw_share_score');

    message = $('#tutorial');

    tutorial_btn = {
        on: $('#tutorial_on'),
        off: $('#tutorial_off')
    }

    $('#btn_full').click(toggleFullScreen);

    $('.gp').click(function () {
        var left = ~~((W - 600) / 2);
        var top = ~~((H - 600) / 2);

        window.open('https://plus.google.com/share?url=' + SITE, 'Dash', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,left=' + left + ',top=' + top);
    });

    if (fetch ('best') === null)
        store ('best', 0);

    if (fetch ('tutorial') === null)
        store ('tutorial', challenges.length);

    BEST_SCORE = fetch ('best');
    tutorial = parseInt(fetch('tutorial'));

    if (tutorial !== 0) {
        tutorial_btn.on.toggle();
        tutorial_btn.off.toggle();
    }

    best.html(BEST_SCORE);

    tutorial_btn.on.click(function () {
        tutorial = challenges.length;
        $.cookie('tutorial', challenges.length, { expires: 365 });
        window.localStorage.setItem('tutorial', challenges.length);
        tutorial_btn.on.toggle();
        tutorial_btn.off.toggle();
    });

    tutorial_btn.off.click(function () {
        tutorial = 0;
        $.cookie('tutorial', 0, { expires: 365 });
        window.localStorage.setItem('tutorial', 0);
        tutorial_btn.on.toggle();
        tutorial_btn.off.toggle();
    });

    $('#fb_share').click(function () {
        FB.ui({
            name: 'Dash',
            method: 'share',
            href: 'http://dash.breno.io/',
            caption: 'How fast can you dash?',
            app_id: '903632352992329'
        }, function(response){});
    });

    Interface = new DashGUI(
        {
            panels: ['#panel-0', '#panel-1'],
            icons:  ['#panel-0 i', '#panel-1 i'],
            score:  {main: '#score', timer: '#gauge', 
                    lives: '.lives div', points: '#counter'}
        },
        {  
            base_index: 1000,
            presets: 8,
            panel: 'preset-*',
            icon:  'icon-angle-.',
            wrong_icon: 'icon-cancel',
            life_lost: '+lost',
            correct_icon: '+correct',
            replace_array: ['left', 'up', 'right', 'down'],
            timer_color: 'bg-*'
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
        }
    );

    var handlers = {
        on_panel_retrieve : function (raw, modifiers, expected) {
            var challenge = modifiers[0];

            if (tutorial === 0 || taught.has(challenge))
                return;

            game.pause();

            message.html(challenges[challenge].text);
            message.fadeIn('fast');

            if (expected.length === 0) {
                setTimeout(function () {
                    message.fadeOut('fast');
                    game.resume();
                    game.correct();
                }, 2000);
            }

            if (taught.push(challenge) === challenges.length) { 
                $.cookie('tutorial', '0', { expires: 365 });
                window.localStorage.setItem('tutorial', 0);
                tutorial_btn.on.toggle();
                tutorial_btn.off.toggle();
            }
        },

        after_game  : function (score) {
            var toc = (new Date()).getTime();
            var elapsed = ~~((toc - tic) / 1000);

            last_time.html(elapsed);
            last_score.html(score);

            var text = 'I\'ve made ' + score + ' points in Dash! Can you dash faster? #Dash';
            text = escape(text);

            shares.tw.attr('href', 'https://twitter.com/intent/tweet?text=' + text + '&url=' + SITE);

            _gaq.push(['_setCustomVar',
              1,                   // This custom var is set to slot #1.  Required parameter.
              'Section',           // The top-level name for your online content categories.  Required parameter.
              'Score',  // Sets the value of "Section" to "Life & Style" for this particular aricle.  Required parameter.
              score                    // Sets the scope to page-level.  Optional parameter.
           ]);

            _gaq.push(['_setCustomVar',
              2,                   // This custom var is set to slot #1.  Required parameter.
              'Section',           // The top-level name for your online content categories.  Required parameter.
              'Time',  // Sets the value of "Section" to "Life & Style" for this particular aricle.  Required parameter.
              elapsed                    // Sets the scope to page-level.  Optional parameter.
           ]);

            // shares.fb.click(function () {
            //     FB.ui({
            //         name: 'Dash',
            //         method: 'share',
            //         caption: unescape(text),
            //         href: 'http://dash.breno.io/',
            //         app_id: '903632352992329'
            //     }, function(response){});
            // });

            end_game_view.fadeIn('slow', function () {
                $(this).css('overflow', 'auto');
            });

            if (score > BEST_SCORE) {
                $.cookie('best', score, { expires: 365 });
                window.localStorage.setItem('best', score);
                BEST_SCORE = score;
                best.html(BEST_SCORE);
            }
        },

        best_score  : function () {
            achievement();
        },

        lost_life   : function () {},

        got_point   : function () {},

        key_pressed : function (key) {
            if (tutorial === 0 || !game.is_paused())
                return;

            if (game.test(key)) {
                tutorial--;
                game.resume();
                setTimeout(function () {
                    message.fadeOut('slow');
                }, 1000);
                game.correct();
            }
        }
    };

    game = new Dash(Interface, handlers, times).init();

    $('#btn_play').click(function(){
        goDash();
    });

    $('#btn_again').click(function(){
        goDash();
        end_game_view.fadeOut();
    });
});