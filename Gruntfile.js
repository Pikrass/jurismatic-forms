var route_doc = require('./routes/docs');
var jade = require('jade');
var fs = require('fs-extra');

module.exports = function(grunt) {
	grunt.registerTask('default',
			'Génère tous les fichiers nécessaires au site statique', function() {
		var done = this.async();

		var nbSteps = 4;
		var step = function() {
			if(--nbSteps == 0)
				done(true);
		}

		fs.copy('node_modules/underscore/underscore-min.js',
			'javascripts/underscore-min.js', step);
		fs.copy('node_modules/backbone/backbone-min.js',
			'javascripts/backbone-min.js', step);
		fs.copy('node_modules/handlebars/dist/handlebars.min.js',
			'javascripts/handlebars.min.js', step);

		route_doc.doc_processor(function(docs) {
			var html = jade.renderFile('views/index.jade',
				{filename: 'index.jade', docs: docs});

			var fd = fs.openSync('index.html', 'w');
			fs.writeSync(fd, html, 0, 'utf-8');
			fs.closeSync(fd);

			step();
		});
	});
};
