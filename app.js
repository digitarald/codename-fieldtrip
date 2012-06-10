var connect = require('connect'),
	express = require('express'),
	async = require('async'),
	jade = require('jade'),
	stylus = require('stylus'),
	nib = require('nib'),
	qs = require('querystring'),
	sio = require('socket.io'),
	fs = require('fs'),
	path = require('path');

// Populate values .env (usually done by `foreman` cmd)

if (!process.env.APIG_APP && path.existsSync(__dirname + '/.env')) {
	var buffer = fs.readFileSync(__dirname + '/.env', 'utf8');

	buffer.split(/\n/).forEach(function(line) {
		line = line.split('=');
		process.env[line[0]] = line[1];
	});
}
if (!process.env.ENV) {
	process.env.ENV = 'development';
}
if (!process.env.PORT) {
	process.env.PORT = 5000;
}


// apig.get(apigUrl + '/mixtapes', apigToken, function(err, response) {
//	try {
//		response = JSON.parse(response);
//	} catch (e) {}
// });


// Express configuration

var app = module.exports = express.createServer(),
	sessionStore = new express.session.MemoryStore();

app.configure(function() {

	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');

	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.methodOverride());

	var aday = 24 * 60 * 60 * 1000;

	app.use(express.session({
		store: sessionStore,
		key: 'sid',
		maxAge: aday,
		expires: aday,
		secret: process.env.SESSION_SECRET || 'secret123'
	}));

	app.use(connect.compress());

	app.use(stylus.middleware({
    src: __dirname + '/public',
    dest: __dirname + '/public',
    compile: function(str, path) {
      var compiler = stylus(str);
      compiler.set('filename', path);
      compiler.set('compress', app.enabled('uglify'));
      compiler.set('include css', true);
      compiler.use(nib());
      return compiler;
    }
  }));

	//ATT Oauth
	require('./oauth/atnt').init(app);

	app.use(app.router);

	app.use(express.static(__dirname + '/public'), {
		maxAge: 31557600000
	});

});

app.configure('development', function() {

	app.set('view options', {
		pretty: true
	});

	app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));

});

app.configure('production', function() {

	// custom config
	app.enable('uglify');

	app.use(express.errorHandler());

});


// Build

require('./build')(app);

// Socket IO

var io = sio.listen(app);
app.set('socket', io); // reference for routes

io.configure(function() {

	io.set('log level', 1);
	io.set('transports', ['xhr-polling']);
	io.set('polling duration', 10);

});

// http://www.danielbaulig.de/socket-ioexpress/

var parseCookie = require('./node_modules/express/node_modules/connect/lib/utils').parseCookie;

io.set('authorization', function(data, accept) {
	// check if there's a cookie header
	if (!data.headers.cookie) {
		return accept(new Error('No cookie transmitted.'), null);
	}

	// if there is, parse the cookie
	data.cookie = parseCookie(data.headers.cookie);
	// note that you will need to use the same key to grad the
	// session id, as you specified in the Express setup.
	data.sessionID = data.cookie.sid;

	// console.log('authorization', data.sessionID);

	sessionStore.load(data.sessionID, function(err, session) {
		if (err || !session) {
			// if we cannot grab a session, turn down the connection
			return accept(new Error('invalid session'), null);
		}

		// save the session data and accept the connection
		data.session = session;
		accept(null, true);
	});
});

var sockets = {}, dashboards = [];
app.set('sockets', sockets);

var db = require('./lib/db')(app);

io.sockets.on('connection', function(socket) {

	var sessionID = socket.handshake.sessionID;
	var sess = socket.handshake.session;

	var current;

	db.getUserBySession(sessionID, function(err, user) {

		db.saveUser(sessionID, {online: true}, function(err, user) {
			current = user;
			if (current) {
				var data = {user: current};
				if (current.name) {
					data.message = 'joined and is ready for catching that!';
				} else {
					data.message = 'Somebody joined and can quiz as soon as he named himself!';
				}
				io.sockets.emit('dashboard_activity', data);
			}
		});

		socket.emit('user', user);

		io.sockets.emit('dashboard_user', user);
	});
	db.getQuiz(function(err, quiz) {
		socket.emit('quiz', {quiz: quiz});
	});


	// console.log('connection', sessionID);

	socket.log.info(socket.handshake.sessionID, 'connected');
	socket.on('set value', function(val) {
		sess.reload(function() {
			sess.value = val;
			sess.touch().save();
		});
	});

	sockets[sessionID] = socket;

	socket.on('disconnect', function() {
		io.sockets.emit('dashboard_name', current);

		delete sockets[sessionID];
		// io.sockets.emit('users', Object.keys(sockets).length);
		db.saveUser(sessionID, {online: false}, function() {});
	});


	socket.on('name', function(name) {
		db.saveUser(sessionID, {name: name}, function(err, user) {
			io.sockets.emit('dashboard_name', user);

			current = user;

			if (current) {
				var data = {
					user: current,
					message: 'is ready for the quiz!'
				};
				io.sockets.emit('dashboard_activity', data);
			}
		});
	});

	socket.on('answer', function(answers) {
		db.saveUser(sessionID, {answers: answers}, function(err, user) {
			io.sockets.emit('dashboard_answer', user);

			var data = {
					user: current,
					message: 'answered a question!'
				};
				io.sockets.emit('dashboard_activity', data);
		});
	});

	socket.on('dashboard', function() {
		if (dashboards.indexOf(sessionID) == -1) {
			dashboards.push(sessionID);
		}

		db.getUsers(function(err, users) {
			io.sockets.emit('users', users);
		});
	});

});


// Routes

require('./routes')(app);

// Misc routes
app.get('/channel', function(req, res) {

	res.setHeader('Cache-Control', 'public, max-age=' + (31557600000 / 1000)); // 1y
	res.send('<script src="//connect.facebook.net/en_US/all.js"></script>');

});

app.get('/manifest.webapp', function(req, res) {

	res.contentType('application/x-web-app-manifest+json');
	res.sendfile(__dirname + '/public/manifest.webapp');

});

app.get('/deleteAll', function(req, res) {
	db.deleteAll();
});


// Start server

var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log('Listening on %d in %s mode', port, app.settings.env);
});


