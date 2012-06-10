
var User = module.exports = Backbone.Model.extend({

	idAttribute: 'session',

	defaults: {
		answers: [],
		name: '',
		session: null
	}


});