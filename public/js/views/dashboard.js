
var Question = require('../models/question'),
	User = require('../models/user'),
	Quiz = require('../models/quiz'),
	Users = require('../collections/users'),
	Questions = require('../collections/questions');

module.exports = Backbone.View.extend({

	template: require('../../bundles/templates/dashboard'),

	templateActivity: require('../../bundles/templates/activity'),

	initialize: function() {

		// Lots of new data, we can't do a partial update?
		// TODO Consolidate initial data retrieval
		// this.quiz.on('change', this.render, this);
		// this.users.on('reset', this.render, this);

		this.on('focus', _.bind(function() {

			if (this.issetup) {
				return;
			}
			this.issetup = true;

			App.socket.emit('dashboard');

			App.socket.on('dashboard_user', _.bind(function(user) {
				console.log('dashboard_user');
				if (this.users) {
					this.users.add(user);
					this.render();
				}
			}, this));

			App.socket.on('dashboard_activity', _.bind(function(data) {
				if (data.user.name) {
					this.$el.find('#activities').append('');
					this.render();
				}
			}, this));

			App.socket.on('dashboard_answer', _.bind(function(user) {
				console.log('dashboard_answer');
				if (this.users) {
					this.users.get(user.session).set('answers', user.answers);
					this.render(true);
				}
			}, this));

			App.socket.on('dashboard_name', _.bind(function(user) {
				console.log('dashboard_name');
				if (this.users) {
					this.users.get(user.session).set('name', user.name);
					this.render();
				}
			}, this));

			App.socket.on('users', _.bind(function(users) {
				this.users = new Users(users);
				this.render();
			}, this));

			App.socket.on('quiz', _.bind(function(data) {
				this.quiz = new Quiz(data.quiz);
				this.render();
			}, this));

		}, this));
	},

	render: function(partial) {

		if (!this.quiz || !this.users) {
			return;
		}

		var users = this.users.toJSON(),
			quiz = this.quiz.toJSON();

		this.rendered = true; // Limit to one initial render()

		users = users.forEach(function(user) {
			user.answered = user.answers.filter(function(answer) {
				return answer != null;
			}).length;
		});

		var data = {
			quiz: quiz,
			users: users,
			user_length: users
		};

		var str = this.template(data);
		this.$el.html(str);
	}

});