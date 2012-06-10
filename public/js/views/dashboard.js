
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

		if (!this.rendered || !partial) {

			this.rendered = true; // Limit to one initial render()

			var data = {
				quiz: quiz,
				users: users,
				user_length: users
			};

			var str = this.template(data);
			this.$el.html(str);

	}

		var questions = {},
			user_length = users.length;

		users.forEach(function(user) {
			user.answers.forEach(function(answer_id, question_id) {

				if (!questions[question_id]) {
					questions[question_id] = {
						total: quiz.questions[question_id].answers.length,
						unanswered: 0
					}
				}
				var question = questions[question_id];

				if (!answer_id) {
					question.unanswered = (question.unanswered || 0) + 1;
					return;
				}

				question[answer_id] = (question[answer_id] || 0) + 1;
			});
		});

		console.log(questions);

		for (var question_id in questions) {
			var answers = questions[question_id];
			for (var answer_id in answers) {
				var value = answers[answer_id] || 0;
				console.log(question_id, answer_id, value);
				this.$el.find('#answer-' + question_id + '-' + answer_id).css('width', value + '%');
			}
		}
	}

});