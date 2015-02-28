// Default values
var TITLE = 'Try to be as fast as you can in Dash!';
var URL = 'http://breno.io/dash';
var W, H;

// Function used for sharing on social networks
function share (media) {
    var url;

    switch (media) {
        case 'facebook': 
            url = 'http://www.facebook.com/share.php?u=' + URL + '&title=' + TITLE;
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

$(document).ready(function() {
    $('a.fb').click(function() { share('facebook'); });
    $('a.tw').click(function() { share('twitter'); });
    $('a.gp').click(function() { share('google+'); });

    $('#btn_howto').click(function() { $('#info').fadeIn(); });
    $('#dismiss').click(function() { $('#info').fadeOut(); });

    W = $(window).width();
    H = $(window).height();
});