module.exports = Backbone.View.extend({

    template: require('../../bundles/templates/location'),

    initialize: function() {
        // TODO: Set localStorage

        // Re-render if a user gets added
        App.socket.on('location', _.bind(function(location) {
            if (location.latitude) {
                this.render();
            }
        }, this));
    },

    render: function(main) {
        var str = this.template();
        this.$el.html(str);
    }

});