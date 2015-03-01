// Default values
var TITLE = 'Try to be as fast as you can in Dash!';
var URL = 'http://breno.io/dash';
var W, H;
var listener = new window.keypress.Listener();
var msg = null, msg_icon = null;

listener.sequence_combo('up up down down left right left right b a enter', function() {
    lives = 42; // That should mean everything for you, shouldn't it?
    msg_icon.removeClass().addClass('icon-joystick');
    msg.fadeIn();
    setTimeout(function () { msg.fadeOut(); }, 1500);
});

// Function used for sharing on social networks
function share (media) {
    var url;

    switch (media) {
        case 'facebook': 
            url = 'https://www.facebook.com/dialog/share?app_id=1543390215934507&display=popup&href=http%3A//breno.io/dash&redirect_uri=http%3A//breno.io/dash';
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
});