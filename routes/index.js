
var routes = [
	require('./auth')
	// require('./dashboard') // rendered via backbone
];

module.exports = function(app) {
	routes.forEach(function(route) {
		route(app);
	});
};
