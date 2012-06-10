
// Easy access
window.Backbone = require('./vendor/backbone');
window._ = require('./vendor/underscore');

var User = require('./models/user');
var Quiz = require('./models/quiz');

var Application = Backbone.Router.extend({

	routes: {
		'': 'quiz',
		'login': 'login',
		'auth': 'attAuth',
		'auth/att/location': 'location',
		'dashboard': 'dashboard',
		'question/:id': 'question'
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

		// TODO Just debug
		socket.on('user', function(user) {
			console.log('user', user);

			if ( !user.name && (this.currentView != this.loginView || this.currentView != this.attAuthView) ) {
				App.navigate('login')
			}
			App.user.set(user);
		});

		socket.on('quiz', _.bind(function(data) {
			App.quiz.set(data.quiz);
		}, this));

		// Start up!
		setTimeout(_.bind(this.setup, this), 1);
	},

	setup: function() {

		App.user = new User(env.user || null);
		App.quiz = new Quiz();

		this.currentView = null;

		// views are delayed since their constructor might access window.App
		var LoginView = require('./views/login');
		this.loginView = new LoginView();

		var QuizView = require('./views/quiz');
		this.quizView = new QuizView();

		var QuestionView = require('./views/question');
		this.questionView = new QuestionView();

		var DashboardView = require('./views/dashboard');
		this.dashboardView = new DashboardView();

		var attAuthView = require('./views/attAuth');
		this.attAuthView = new attAuthView();

		var attLocationView = require('./views/location');
		this.attLocationView = attLocationView;

		// Hide all views
		this.loginView.$el.hide();
		this.quizView.$el.hide();
		this.dashboardView.$el.hide();

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

	dashboard: function() {
		this.changeView(this.dashboardView);
	},

	login: function() {
		this.changeView(this.loginView);
	},

	quiz: function() {
		this.changeView(this.quizView);
	},

	question: function(id) {
		this.questionView.questionId = id;
		this.changeView(this.questionView);
	},

	attAuth: function(){
		this.changeView(this.attAuthView);
	},

	location: function(){
		this.changeView(this.attLocation);
	}

});

window.App = new Application();

