var passport = require('passport')
    , attStrat = require('../lib/passport-atnt').Strategy
    , request = require('request')
    , db = require('../lib/db')
    , storedApp;

var baseUrl = 'https://api.att.com/';

passport.serializeUser(function(obj, done) {
  done(null, obj.attToken);
});

passport.deserializeUser(function(token, done) {
    done(null, token);
});

passport.use(new attStrat({
    clientID: process.env.ATNT_ID,
    clientSecret: process.env.ATNT_SECRET,
    callbackURL: 'http://localhost:' + process.env.PORT + '/auth/att/callback',
    passReqToCallback: true
},
function(req, token, refreshToken, profile, done){
    var obj = {attToken: token, attRefreshToken: refreshToken},
        dbObj = db(storedApp);

    // console.log('session:', req.sessionID);

    dbObj.getUserBySession(req.sessionID, function(err, user){
        dbObj.saveUser(req.sessionID, obj, function(){
            done(null, obj);
        });
    });
}));

exports.init = function(app){
    app.use(passport.initialize());
    app.use(passport.session());

    storedApp = app;
};

exports.getDeviceLocation = function(err, user, done){
    console.log(passport);
    // http.get( baseUrl + '?token=');
    request.get(baseUrl + '1/devices/tel:'+ user.telephone +'/location' + '?access_token=' + user.attToken + '&requestedAccuracy=3000' + '&tolerance=DelayTolerant', function(err, r, data){
        var json = JSON.parse(data);
        console.log('deviceLocation:', json);
        done(null, json);
    })
};