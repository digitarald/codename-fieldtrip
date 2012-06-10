module.exports = Backbone.View.extend({

	template: require('../../bundles/templates/login'),

    events: {
        'click button[type=submit]': 'submit'
    },

	initialize: function() {
		// TODO: Set localStorage

        // Re-render if a user gets added
        App.socket.on('user', _.bind(function(user) {
            if (user.name) {
                this.render();
            }
        }, this));
	},

    submit: function(evt){
        evt.preventDefault();
        var name = this.$el.find('input#name').val();

        if (!name) return;

        App.navigate('quiz', {trigger: true});
        App.socket.emit('name', name);
    },

	render: function(main) {
        var name = App.user.get('name');
        var model = {
            user: {
                name: name || ''
            }
        };

		var str = this.template(model);
		this.$el.html(str);

	}

});