<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="author" content="Breno Lima de Freitas"/>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">

    <!-- Open Graph metadata -->
    <meta property="og:title" content="Dash"/>
    <meta property="og:image" content="http://breno.io/dash/img/logo.png"/>
    <meta property="og:image:type" content="image/png">
    <meta property="fb:app_id" content="903632352992329"/>
    <meta property="og:description" content="How fast can you dash?">

    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">

    <title>Dash</title>

    <link href="img/favicon.png" rel="icon" type="image/x-icon"/>
    <link href='http://fonts.googleapis.com/css?family=Noto+Sans:400,700|Josefin+Sans:100,400' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="css/css.css"/>
    <link rel="stylesheet" type="text/css" href="css/medias.css"/>
    <link rel="stylesheet" type="text/css" href="css/fontello.css"/>

    <script src="https://apis.google.com/js/platform.js" async defer></script>
    <script type="text/javascript" async src="//platform.twitter.com/widgets.js"></script>
</head>
<body>
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId      : '903632352992329',
          xfbml      : true,
          version    : 'v2.2'
        });
      };

      (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));

      function onLogin(response) {
          if (response.status == 'connected') {
            FB.api('/me?fields=first_name', function(data) {
              var welcomeBlock = document.getElementById('fb-welcome');
              welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
            });
          }
        }

        FB.getLoginStatus(function(response) {
          // Check login status on load, and if the user is
          // already logged in, go directly to the welcome message.
          if (response.status == 'connected') {
            onLogin(response);
          } else {
            // Otherwise, show Login dialog first.
            FB.login(function(response) {
              onLogin(response);
            }, {scope: 'user_friends, email'});
          }
        });
    </script>

    <div class="wrapper">
        <h1>DASH</h1>

        <div class="menu">
            <div>Your best score is <span id="best"></span></div>

            <a class="main_btn" id="btn_play">Start game</a>
            <a class="main_btn" id="btn_howto">How to play</a>
            <a class="main_btn" id="btn_full">Toggle fullscreen</a>
            <!-- <a class="main_btn" id="btn_leader" class="disabled">Leaderboard</a> -->

            <a class="fb" id="fb_share"><i class="icon-facebook"></i></a>

            <a class="tw" href="https://twitter.com/intent/tweet?text=How%20fast%20can%20you%20dash%3F&url=http://dash.breno.io/"><i class="icon-twitter"></i></a>

            <a class="gp"><i class="icon-gplus"></i></a>

            <div class="clear"></div>
        </div>

        <div class="clear"></div>

        <div class="copyright"><a href="http://breno.io" target="_blank">Made by Breno</a></div>
    </div>

    <!-- <section id="panel-0" class="preset-0" style="display: block; left:50%;top:0;"><i class="icon-angle-down"></i></section> -->
    <section id="panel-0"><i></i></section>
    <section id="panel-1"><i></i></section>

    <div class="score" id="score">
        <div class="counter" id="counter">10</div>
        <div class="timer">
            <div class="fill" id="gauge"></div>
        </div>
        <div class="lives">
            <div></div>
            <div class="middle"></div>
            <div></div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="score msg" id="msg">
        <i id="msg_icon"></i>
    </div>

    <div class="info" id="end_game_view">
        <span class="dismiss">&times;</span>

        <h2>Game over!</h2>

        <div class="centering">
            <div>
                Your final score is <b id="last_score">888</b>!
            </div> 

            <div>
                You've endured for <b id="last_time">10</b> seconds!
            </div>

            <div class="buttons">
                <a id="btn_again">Play again</a>
            </div>

            <div style="display: none;">
                <a id="fb_share_score"><i class="icon-facebook"></i> Share on Facebook</a>
                <div class="clear"></div>
            </div>

            <div>
                <a id="tw_share_score"><i class="icon-twitter"></i> Share on Twitter</a>
                <div class="clear"></div>
            </div> 

            <script type="text/javascript">
                google_ad_client = "ca-pub-3758610824903714";
                google_ad_slot = "1970973182";
                google_ad_width = 250;
                google_ad_height = 250;
            </script>
            <!-- New small Dash -->
            <script type="text/javascript"
            src="//pagead2.googlesyndication.com/pagead/show_ads.js">
            </script>

        </div>
    </div>

    <div class="info" id="info">
        <span class="dismiss">&times;</span>

        <h2>How to play</h2>

        <div class="centering">
            <a id="tutorial_on">Enable in-game tutorial</a>
            <a id="tutorial_off" style="display: none;">Disable in-game tutorial</a>
        </div>

        <div>The rule is simple: send the panel to the correct direction, if you can! In DASH you must press the arrow accordingly to what is being shown within the remaining time and the number of lives. You have 3 lives, a timer that will be each round tighter and that will eventually vanish!</div>

        <div>Too easy? There are also some things you must pay attention in order to dash!</div>

        <div class="block">
            <img src="img/tut/common.png" alt="common arrow" class="l" />
            <div>
                <h3>Simple arrow</h3>
                The simple arrow is the most basic and classic thing! Just press the right key in time and you're good.
            </div>
            <div class="clear"></div>
        </div>

        <div class="block">
            <img src="img/tut/reverse.png" alt="common arrow" class="r" />
            <div>
                <h3>Reverse</h3>
                It's a trap! If the background is striped, then you must take the opposite action that is being shown. For instance, if the image shows a right arrow, press the left key; If it shows up, then press down, and so on and so forth.
            </div>
            <div class="clear"></div>
        </div>

        <div class="block">
            <img src="img/tut/double.png" alt="common arrow" class="l" />
            <div>
                <h3>Double arrow</h3>
                To dismiss a panel like this, you must double press the required key in the same amount of time. As easy as pie!
            </div>
            <div class="clear"></div>
        </div>

        <div class="block">
            <img src="img/tut/previous.png" alt="common arrow" class="r" />
            <div>
                <h3>Previous action</h3>
                This one may seem tricky. <b>DASH</b> is not only about being fast, but also being attentive! If you ever see a symbol like this, then it is a previous arrow! It means you must repeat your last action!
            </div>
            <div class="clear"></div>
        </div>

        <div class="block">
            <img src="img/tut/pressed.png" alt="common arrow" class="l" />
            <div>
                <h3>Pressed arrow</h3>
                Have you paid close attention to what happens when you press the correct key? Yes, the arrow turns into white. However, what should you do if the panel came with a white arrow? Simple: do not press anything. At all. Seriously.
            </div>
            <div class="clear"></div>
        </div>
    </div>


    <div class="message" id="tutorial"></div>
</body>

<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.0.min.js"></script>
<script type="text/javascript" src="js/jquery.cookie.js"></script>
<script type="text/javascript" src="js/jquery.animate-enhanced.min.js"></script>
<script type="text/javascript" src="js/keypress-2.1.0.min.js"></script>
<script type="text/javascript" src="js/hammer.min.js"></script>
<script type="text/javascript" src="js/dash-utils.min.js"></script>
<script type="text/javascript" src="js/dash-level.min.js"></script>
<script type="text/javascript" src="js/dash-gui.min.js"></script>
<script type="text/javascript" src="js/dash.min.js"></script>
<script type="text/javascript" src="js/common.min.js"></script>

<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-60178881-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

</html>