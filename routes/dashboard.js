module.exports = function(app) {

	app.get('/dashboard', function(req, res) {

		res.render('dashboard.jade', {
			title: 'Project Fieldtrip',
			env: {}
		});

	});

};