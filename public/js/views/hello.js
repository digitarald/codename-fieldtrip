
var Users = require('../collections/users');

module.exports = Backbone.View.extend({

	events: {
		'click': 'sayHello'
	},

	collection: new Users(),

	template: require('../templates/hello'),

	initialize: function() {

	},

	sayHello: function(evt) {
		console.log(arguments);
	},

	render: function(main) {

		var str = this.template();
		this.$el.html(str);

	}

});