
var path = require('path');
var fs = require('fs');
var jade = require('jade');
var browserify = require('browserify');
var uglifyjs = require('uglify-js');

module.exports = function(app) {

	// Reusable compress filter, only when enabled!
	var filter = app.enabled('uglify') ? function(code) {

		var jsp = uglifyjs.parser,
			pro = uglifyjs.uglify,
			ast = jsp.parse(code);

		ast = pro.ast_mangle(ast);
		ast = pro.ast_squeeze(ast);

		return pro.gen_code(ast);
	} : function(code) {
		return code;
	};

	var js = __dirname + '/public/js',
		folder = js + '/templates',
		re = /\.jade$/,
		options = {
			client: true,
			compileDebug: !app.enabled('uglify')
		};

	// Pre-compile templates

	// Going sync here, to control server start-up
	function walk(file) {

		var stat = fs.lstatSync(file);

		if (stat.isDirectory()) {
			var files = fs.readdirSync(file);
			files.forEach(function(filename) {
				walk(file + '/' + filename);
			});
			return;
		}

		if (!stat.isFile() || !re.test(file)) {
			return;
		}

		var str = fs.readFileSync(file, 'utf8');

		options.filename = file;

		var fn = jade.compile(str, options).toString(),
			save = path.join(folder, path.basename(file).replace(re, '.js'));

		fs.writeFileSync(save, 'module.exports = ' + fn + ';');
		console.log('Build: %s', save);
	}

	walk(folder);

	// Browserify!

	var buffer = browserify({
		debug: !app.enabled('uglify'),
		require: [],
		entry: [
			js + '/vendor/jquery.js',
			js + '/vendor/underscore.js',
			js + '/vendor/backbone.js',
			js + '/vendor/socket.io.js',
			__dirname + '/node_modules/jade/runtime.js',
			js + '/app.js'
		],
		filter: filter
	}).bundle();

	fs.writeFileSync(js + '/bundle.js', filter(buffer));

};
