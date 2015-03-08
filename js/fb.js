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

      var ranking = $('#ranking').empty();

      FB.api(
          "/app/scores?fields=score,user.limit(40)",
          function (response) {
            $('#loading').toggle(false);

            if (response && !response.error) {
              response = response.data;
              var length = response.length;

              if (length === 0)
                $('#error_msg').toggle(true);

              if (length === 1)
                $('#app_permissions_alert').toggle(true);

              $('#error_msg').toggle(false);
              $('#app_permissions_alert').toggle(false);

              for (var i = 0; i < length; i++) {
                ranking.append(
                  '<tr>' + 
                    '<td>' + (i + 1) + '.</td>' +
                    '<td><img src="https://graph.facebook.com/' + response[i].user.id + 
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
              var fb_score = 0;

              if (response.data !== undefined &&
                response.data[0] !== undefined && 
                response.data[0].score !== undefined)
                fb_score = response.data[0].score;
                
                BEST_SCORE = fb_score;
                best.html(BEST_SCORE);
                store('best', BEST_SCORE);
                
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
      $('#loading').toggle(true);
      $('#btn_login').toggle(false);
      fb_update_leaderboard();
    }, {scope: 'user_friends, email, publish_actions'});
  }

  FB.getLoginStatus(function(response) {
    // Check login status on load, and if the user is
    // already logged in, go directly to the welcome message.
    $('#error_msg').toggle(false);

    if (response.status == 'connected') {
      window.FB_LOGGED = true;
      onLogin(response);
      $('#loading').toggle(true);
      fb_update_leaderboard();
    } else
      $('#btn_login').toggle(true);
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));