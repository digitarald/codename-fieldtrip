
module.exports = Backbone.View.extend({

	template: require('../templates/login'),

	initialize: function() {
		// TODO: Set localStorage
	},

	render: function(main) {

		var str = this.template();
		this.$el.html(str);

	}

});