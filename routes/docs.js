var express = require('express');
var paths = require('path');
var fs = require('fs');
var pandoc = require('pdc');
var router = express.Router();

var docsHash = {};
var docs = new Array;

var process_doc = function(path, key) {
	fs.readFile(path, function(err, data) {
		if(err)
			return;

		var doc = {name: key};

		data = data.toString();

		// Find all inputs in the document
		doc.form = find_inputs(data);

		// Generate HTML
		pandoc(data, 'markdown', 'html', handle_html.bind(null, doc, function() {
			console.log("Processed "+key);
			docsHash[key] = doc;
			docs.push(doc);
		}));
	});
};

var regInput = /\[(.+?)(?:\|(.+?))?\]/g;

var find_inputs = function(doc) {
	var inputs = new Array();

	var matches;
	while(matches = regInput.exec(doc)) {
		inputs.push({
			key: matches[1],
			placeholder: matches[2] || matches[1]
		});
	}

	return inputs;
};

var handle_html = function(doc, next, err, html) {
	if(err)
		return console.error(err.toString());

	// Replace input placeholders by handlebars placeholders
	html = html.replace(regInput, '{{>input name="$1" placeholder="$2"}}');

	doc.html = html;
	next();
};

fs.readdir(paths.join(__dirname, '../docs'), function(err, files) {
	if(err) {
		console.error(err.toString());
		process.exit(1);
	}

	for(var f in files) {
		var basename = files[f].replace(/\..*$/, ''),
			path = paths.join(__dirname, '../docs', files[f]);
		process_doc(path, basename);
	}
});

router.get('/', function(req, res) {
	res.json(docs);
});

router.get('/:key', function(req, res, next) {
	var key = req.params.key;

	if(!docsHash[key])
		return next('');

	res.json(docsHash[key]);
});

module.exports = {
	router: router,
	docs: docs
};
