
var routes = [
	require('./auth')
];

module.exports = function(app) {
	routes.forEach(function(route) {
		route(app);
	});
};
