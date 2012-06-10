
var Quiz = require('../models/quiz');

module.exports = Backbone.View.extend({

	events: {
		'click .question': 'openQuestion'
	},

	model: new Quiz(),

	template: require('../../bundles/templates/quiz'),
	questionTemplate: require('../../bundles/templates/questionItem'),

	initialize: function() {
		this.model.bind('change', this.render, this);
		App.user.on('change', this.render, this);
		App.quiz.on('change', function() { this.model = App.quiz; this.render(); }, this);
	},

	openQuestion: function(evt) {
		var id = $(evt.target).closest('.question').data('id');
		App.navigate('question/' + id, {trigger: true});
	},

	render: function() {
		if (!this.model.has('questions'))
			return;
		var data = this.model.toJSON();
		data['quizTitle'] = data['title'];
		var str = this.template(data);
		this.$el.html(str);

		var questions = [];
		if (this.model.has('questions'))
			questions = this.model.get('questions');

		var $questions = this.$el.find('#questions');
		$questions.empty();
		var answers = App.user.get('answers');

		questions.forEach(function(question, i) {
			var questionId = i;
			question['id'] = questionId;
			question['answered'] = false;
			if (answers[questionId] || answers[questionId] === 0)
				question['answered'] = true;
			$questions.append(this.questionTemplate(question));
		}, this);

		this.$el.show();
	}

});