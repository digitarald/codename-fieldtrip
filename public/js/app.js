
// Easy access
window.Backbone = require('./vendor/backbone');
window._ = require('./vendor/underscore');

var Application = Backbone.Router.extend({

	routes: {
		'': 'login'
	},

	initialize: function() {

		this.container = $('#main');

		// Socket.io

		// var io = require('./vendor/socket.io'),
		var socket = this.socket = io.connect();

		// Error handling
		socket.on('reconnecting', function(time, attempts) {
			// TODO: `error` didn't :(
			if (attempts > 2) { // TODO option 'max reconnection attempts'
				location.href = location.href;
			}
		});

		// TODO Just debug
		socket.on('connect', function() {
			console.log('HELLO');
		});
		socket.on('users', function() {
			console.log(arguments);
		});

		// Start up!
		// setTimeout(_.bind(this.setup, this), 1);
	},

	setup: function() {

		// views are delayed since their constructor might access window.App

		this.currentView = null;

		// Create views
		var HelloView = require('./views/hello');
		this.helloView = new HelloView();

		var LoginView = require('./views/login');
		this.loginView = new LoginView();

		// Hide all views
		this.helloView.$el.hide();
		this.loginView.$el.hide();

		// Start up!
		Backbone.history.start({pushState: true});
	},

	changeView: function(to) {

		if (this.currentView) {
			this.currentView.trigger('blur');
			this.currentView.$el.hide();

			$(document.body).removeClass('view-' + (this.currentView.$el.attr('id') || ''));
		}

		to.render(this.container);

		$(document.body).addClass('view-' + (to.$el.attr('id') || ''));
		to.trigger('focus');

		this.container.append(to.$el);
		to.$el.fadeIn();
		to.$el.show();

		this.currentView = to;
	},

	login: function() {

		this.changeView(this.loginView);

	},

	hello: function() {

		this.changeView(this.helloView);

	}

});

window.App = new Application();

