// Default values
var W, H;
var SITE = escape('http://breno.io/dash');
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

// Achievement popup
function achievement () {
    msg_icon.removeClass().addClass('icon-trophy');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
}

$(document).ready(function() {
    $('#btn_howto').click(function() { $('#info').fadeIn(); });
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

    $('.gp').click(function () {
        var left = ~~((W - 600) / 2);
        var top = ~~((H - 600) / 2);

        window.open('https://plus.google.com/share?url=' + SITE, 'Dash', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600,left=' + left + ',top=' + top);
    });

    if ($.cookie('best') === undefined)
        $.cookie('best', '0', { expires: 365 });

    if (window.localStorage.getItem('best') === null)
        window.localStorage.setItem('best', 0);

    BEST_SCORE = $.cookie('best') || window.localStorage.getItem('best');

    best.html(BEST_SCORE);

    $('#fb_share').click(function () {
        FB.ui({
            name: 'Dash',
            method: 'share',
            href: 'http://breno.io/dash/',
            caption: 'Try to be as fast as you can in Dash!',
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
            var toc = (new Date()).getTime();
            var elapsed = ~~((toc - tic) / 1000);

            last_time.html(elapsed);
            last_score.html(score);

            var text = 'I\'ve made ' + score + ' points in Dash! Try to get over it! #dash';
            text = escape(text);

            shares.tw.attr('href', 'https://twitter.com/intent/tweet?text=' + text + '&url=' + SITE);

            shares.fb.click(function () {
                FB.ui({
                    name: 'Dash',
                    method: 'share',
                    caption: unescape(text),
                    href: 'http://breno.io/dash/',
                    app_id: '903632352992329'
                }, function(response){});
            });

            end_game_view.fadeIn();

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

        key_pressed : function () {}
    };

    game = new Dash(Interface, handlers).init();

    $('#btn_play').click(function(){
        game.prepare(konami ? 42 : 3, BEST_SCORE, challenges);
        tic = (new Date()).getTime();
        game.start();
    });

    $('#btn_again').click(function(){
        game.prepare(konami ? 42 : 3, BEST_SCORE, challenges);
        tic = (new Date()).getTime();
        game.start();
        end_game_view.fadeOut();
    });
});