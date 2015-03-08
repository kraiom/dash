window.fbAsyncInit = function() {
  FB.init({
    appId      : '903632352992329',
    xfbml      : true,
    version    : 'v2.2',
    cookie : true
  });

  window.fb_update_score = function (score) {
    if (window.FB_LOGGED !== true)
      return;

    FB.api(
        "/me/scores",
        "POST",
        {
            "score": score
        },
        function (response) {
          if (response.error)
            console.log(response);
        }
    );
  }

  window.fb_update_leaderboard = function () {
      if (window.FB_LOGGED !== true)
        return;

      FB.api(
          "/app/scores?fields=score,user.limit(40)",
          function (response) {
            $('#loading').hide();

            if (response && !response.error) {
              response = response.data;
              var length = response.length;
              var ranking = $('#ranking').empty();

              if (length === 0)
                $('#error_msg').toggle();

              for (var i = 0; i < length; i++) {
                ranking.append(
                  '<tr>' + 
                    '<td>' + (i + 1) + '.</td>' +
                    '<td><img src="http://graph.facebook.com/' + response[i].user.id + 
                    '/picture?type=square" alt="' + response[i].user.name + '"/></td>' +
                    '<td>' + response[i].user.name + '</td>' +
                    '<td style="text-align: center;">' + response[i].score + '</td>' +
                    '</tr>');
              }
            } else 
              $('#no_leaderboard').show();
          }
      );
  }

  function onLogin(response) {
    if (response.status == 'connected') {
      FB.api('/me?fields=first_name,picture', function(data) {
        var welcomeBlock = document.getElementById('user_name');
        welcomeBlock.innerHTML = data.first_name + ', ';
      });

      FB.api(
          "/me/scores",
          function (response) {
            if (response && !response.error) {
              var fb_score = response.data[0].score;

              if (fb_score > BEST_SCORE) {
                BEST_SCORE = fb_score;
                best.html(BEST_SCORE);
                store('best', BEST_SCORE);
              } else if (fb_score < BEST_SCORE)
                fb_update_score (BEST_SCORE);
            }
          }
      );

      fb_update_leaderboard();
    }
  }

  window.fb_login = function () {
    FB.login(function(response) {
      window.FB_LOGGED = true;
      onLogin(response);
      $('#loading').toggle();
      $('#btn_login').toggle();
      fb_update_leaderboard();
    }, {scope: 'user_friends, email, publish_actions'});
  }

  FB.getLoginStatus(function(response) {
    // Check login status on load, and if the user is
    // already logged in, go directly to the welcome message.
    $('#error_msg').toggle();

    if (response.status == 'connected') {
      window.FB_LOGGED = true;
      onLogin(response);
      $('#loading').toggle();
      fb_update_leaderboard();
    } else
      $('#btn_login').toggle();
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));