// Default values
var TITLE = 'Try to be as fast as you can in Dash!';
var URL = 'http://breno.io/dash';
var W, H;
var listener = new window.keypress.Listener();
var msg = null, msg_icon = null;
var game = null;
var konami = false;
var best = 0, BEST_SCORE = 0;

var challenges = [
    { // 0 - simple arrow
        morph: function (tentative, last) {
            return {
                expected: [tentative.expected[0]]
            };
        }
    },

    { // 1 - reverse
        constraints: [3, 4],
        rounds: 30,

        morph: function (tentative, last) {
            var length = tentative.expected.length;
            var values = {expected: []};

            for (var i = 0; i < length; i++)
                values.expected.push(mod(tentative.expected[i] + 2, 4));

            return values;
        }
    },

    { // 2 - double arrow
        constraints: [3, 4],
        rounds: 20,

        morph: function (tentative, last) {
            return {
                expected: [tentative.expected[0], tentative.expected[0]]
            };
        }
    },

    { // 3 - pressed arrow
        constraints: [1, 2, 4],
        rounds: 60,

        morph: function (tentative, last) {
            return {
                expected: last.expected,
                missable: last.missable
            };
        }
    },

    { // 4 - previous action
        first_turn: false,
        constraints: [1, 2, 3],
        rounds: 40,

        morph: function (tentative, last) {
            return {
                expected: [],
                missable: false
            };
        }
    }
];

listener.sequence_combo('up up down down left right left right b a enter', function() {
    konami ^= true;
    msg_icon.removeClass().addClass('icon-joystick');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
});

// Function used for sharing on social networks
function share (media) {
    var url;

    switch (media) {
        case 'facebook': 
            url = 'https://www.facebook.com/dialog/share?app_id=903632352992329&display=popup&href=http%3A//breno.io/dash&redirect_uri=http%3A//breno.io/dash/close.html';
        break;

        case 'twitter': 
            url = 'http://twitter.com/home?status=' + TITLE + '+' + URL;
        break;

        case 'google+': 
            url = 'https://plus.google.com/share?url=' + URL;
        break;
    }

    var mH = (H - 250) / 2;
    var mW = (W - 500) / 2;

    window.open(url, 'Dash', 'width=500, height=250, top=' + mH + ', left=' + mW + ' scrollbars=yes, status=no, toolbar=no, location=no, directories=no, menubar=no, resizable=no, fullscreen=no');
}

// Achievement popup
function achievement () {
    msg_icon.removeClass().addClass('icon-trophy');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
}

$(document).ready(function() {
    $('a.fb').click(function() { share('facebook'); });
    $('a.tw').click(function() { share('twitter'); });
    $('a.gp').click(function() { share('google+'); });

    $('#btn_howto').click(function() { $('#info').fadeIn(); });
    $('#dismiss').click(function() { $('#info').fadeOut(); });

    W = $(window).width();
    H = $(window).height();

    msg = $('#msg');
    msg_icon = $('#msg_icon');

    best = $('#best');

    if ($.cookie('best') === undefined)
        $.cookie('best', '0', { expires: 365 });

    BEST_SCORE = $.cookie('best');

    best.html(BEST_SCORE);

    Interface = new DashGUI(
        {
            panels: ['#panel-0', '#panel-1'],
            icons:  ['#panel-0 i', '#panel-1 i'],
            score:  {main: '#score', timer: '#gauge', 
                    lives: '.lives div', points: '#counter'}
        },
        {  
            presets: 8,
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
        }
    );

    var handlers = {
        before_game : function () {},

        after_game  : function (score) {
            if (score > BEST_SCORE) {
                $.cookie('best', score, { expires: 365 });
                BEST_SCORE = score;
                best.html(BEST_SCORE);
            }
        },

        best_score  : function () {
            achievement();
        },

        lost_life   : function () {},

        got_point   : function () {},

        key_pressed : function () {}
    };

    game = new Dash(Interface, handlers).init();

    $('#btn_play').click(function(){
        game.prepare(konami ? 42 : 3, BEST_SCORE, challenges);
        game.start();
    });
});