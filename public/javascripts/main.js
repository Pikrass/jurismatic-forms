var FormVal = Backbone.Model.extend({
});

var InputView = Backbone.View.extend({
	tagName: 'input',

	initialize: function() {
		this.listenTo(this.model, 'change:value', this.render);

		this.$el.change(function(model) {
			model.set('value', this.value);
		}.bind(this.el, this.model));
	},

	render: function() {
		var val = this.model.get('value');
		if(val != undefined)
			this.el.value = val;
	}
});

var input_helper = function(name, options) {
	return '<input type="text" placeholder="'+name+'" name="'+name+'">';
};
Handlebars.registerPartial('input', input_helper);

var Doc = Backbone.Model.extend({
	idAttribute: 'name',

	initialize: function() {
		this.template = Handlebars.compile(this.get('html'));
		this.form_vals = {};
	},

	getFormVal: function(name) {
		if(!this.form_vals[name])
			this.form_vals[name] = new FormVal;
		return this.form_vals[name];
	}
});

var docs = new Backbone.Collection;
docs.url = '/docs';
docs.model = Doc;

var ListView = Backbone.View.extend({
	tagName: 'ul',

	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		var view = this;
		this.$el.empty();

		this.model.forEach(function(doc) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			li.appendChild(a);
			a.appendChild(document.createTextNode(doc.get('name')));
			a.href = 'javascript:;';
			a.addEventListener('click',
					Backbone.history.navigate.bind(
						Backbone.history, '/docs/'+doc.get('name'), {trigger:true}),
					false);
			view.$el.append(li);
		});

		return this;
	},
});

var DocView = Backbone.View.extend({
	render: function() {
		var topModel = this.model; // Only for the joke
		this.$el.html(this.model.template());

		this.$('input').each(function(i, elem) {
			var view = new InputView({
				model: topModel.getFormVal(elem.name),
				el: elem
			});
			view.render();
		});
	}
});

var Router = Backbone.Router.extend({
	routes: {
		'':           'list_docs',
		'docs/:name': 'display_form'
	},

	list_docs: function() {
	},

	display_form: function(name) {
		var doc_view = new DocView({model: docs.get(name)});
		doc_view.render();
		document.body.appendChild(doc_view.el);
	}
});

$(function() {
	new Router();
	var list_view = new ListView({model: docs});
	list_view.render();
	document.body.appendChild(list_view.el);
	Backbone.history.start();
});
