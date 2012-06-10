module.exports = Backbone.View.extend({

    template: require('../../bundles/templates/attAuth'),

    events: {
        'click button[type=submit]': 'submit'
    },

    initialize: function() {
        // TODO: Set localStorage
     
        // Re-render if a user gets added
        App.socket.on('user', _.bind(function(user) {
            if (user.telephone) {
                this.render()
            }
        }, this));
    },

    submit: function(evt){
        evt.preventDefault();
        var tel = this.$el.find('input#telephone').val();

        if (!tel) return;
        var form = this.$el.find('form').submit();

        // App.navigate('quiz', {trigger: true});
        // App.socket.emit('telephone', tel);
    },

    render: function(main) {
        var tel = App.user.get('telephone');
        var model = {
            user: {
                telephone: tel || ''
            }
        };

        var str = this.template(model);
        this.$el.html(str);

    }

});