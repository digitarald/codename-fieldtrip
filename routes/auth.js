var passport = require('passport')
    , attStrat = require('../lib/passport-atnt').Strategy;

passport.use(new attStrat({
    clientID: process.env.ATNT_ID,
    clientSecret: process.env.ATNT_SECRET,
    callbackURL: '127.0.0.1:' + process.env.PORT + '/att/auth/callback'
},
function(token, secret, profile, done){
	console.log(arguments);
}));

module.exports = function(app) {

	app.get('/', function(req, res) {

		res.render('index.jade', {
			title: 'Project Fieldtrip',
			env: {}
		});

	});

	app.get('/login', function(){
		res.render('index.jade');
	})

    app.get('/att/auth', passport.authenticate('atnt'), function(req, res){

    });

    app.get('/att/auth/callback',
    	passport.authenticate('atnt`', { failureRedirect: '/login' }),
    	function(req, res){
    		res.redirect('/');
    	});

};