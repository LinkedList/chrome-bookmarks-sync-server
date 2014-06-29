var mongoose = require('mongoose')
var GoogleStrategy = require('passport-google').Strategy;
var User = mongoose.model('User')

module.exports = function (passport) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  var server_url = process.env.NODE_ENV === 'development' ? "http://localhost:3000/" : "http://chrome-bookmarks.herokuapp.com/";

  passport.use(new GoogleStrategy({
      returnURL: server_url + 'auth/google/return',
      realm: server_url
    },
    function(identifier, profile, done) {
      User.findOne({identifier: identifier}, function (err, user) {
        if(!user) {
          var new_user = new User();
          new_user.identifier = identifier;
          new_user.displayName = profile.displayName;
          new_user.emails = profile.emails;

          new_user.save(function (err) {
            if(err) {
              console.log(err);
              return;
            }

            console.log("User created");
            done(err, new_user)
          });
        } else {
          done(err, user);
        }
      })
    }
  ));
}
