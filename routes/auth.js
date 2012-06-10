var passport = require('passport'),
	oauthAtnt = require('../oauth/atnt');

var ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth');
}

module.exports = function(app) {

	var db = require('../lib/db')(app);

	function index(req, res) {

		db.getUserBySession(req.sessionID, function(err, user) {
			res.render('index.jade', {
				title: 'Project Fieldtrip',
				env: {
					user: user || null
				}
			});
		})

	};

	app.get('/', index);

	app.get('/login', index);

	app.get('/dashboard', index);

	app.get('/quiz', index);

	app.get('/question/:id', index);

	app.get('/auth', index);

	app.post('/auth/req', function(req, res){
		var obj = {telephone: req.param('telephone')};

		db.saveUser(req.sessionID, obj, function(err, user){
			res.redirect('/auth/att');
		});
	});

	app.get('/auth/att', passport.authenticate('atnt', {scope: ['SMS','DC','TL']}), function(req, res){});

	app.get('/auth/att/callback',
		passport.authenticate('atnt', { failureRedirect: '/auth' }),
		function(req, res){
			res.redirect('/');
		}
	);

	app.get('/auth/att/location', passport.authenticate('atnt', { scope: ['SMS','DC','TL'], failureRedirect: '/auth' }), function(req, res){
		db.getUserBySession(req.sessionID, function(err, user){
			oauthAtnt.getDeviceLocation(null, user, function(err, data){
				// app.socket.emit('location', data);
				res.render('location.jade', {
					title: 'Project Fieldtrip',
					location: data,
					layout: false
				})
			});
		});

		// index.call(this, req, res);
	})

};