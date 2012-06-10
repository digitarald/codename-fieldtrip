module.exports = Backbone.View.extend({

    template: require('../../bundles/templates/location'),

    initialize: function() {
        // TODO: Set localStorage

        // Re-render if a user gets added
        App.socket.on('user', _.bind(function(user) {
            if (user.name) {
                this.render();
            }
        }, this));
    },

    render: function(main) {
        var str = this.template();
        this.$el.html(str);

    }

});