
var Users = require('../collections/users');

module.exports = Backbone.View.extend({

	events: {
		'click .answer': 'answer'
	},

	collection: new Users(),

	template: require('../../bundles/templates/question'),

	initialize: function() {
		App.quiz.on('change', this.render, this);
	},

	answer: function(evt) {
		var answers = App.user.get('answers');
		var questionId = this.questionId;
		var answerId = $(evt.target).closest('.answer').data('id');
		answers[questionId] = answerId;
		App.user.set('answers', answers);

		App.navigate('', {trigger: true});

		App.user.get('answers')[questionId] = answerId;

		App.socket.emit('answer', App.user.get('answers'));
	},

	render: function() {
		var quiz = App.quiz;
		if (!this.questionId || !quiz.has('questions'))
			return;
		var answers = App.user.get('answers');
		this.model = quiz.get('questions')[this.questionId];
		this.model['answerId'] = answers[this.questionId];
		this.model['quizTitle'] = App.quiz.get('title');
		var str = this.template(this.model);
		this.$el.html(str);
	}

});