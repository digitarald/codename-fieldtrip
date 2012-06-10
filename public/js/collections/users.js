
var Users = module.exports = Backbone.Collection.extend({

	idAttribute: 'session',

	model: require('../models/user')

});