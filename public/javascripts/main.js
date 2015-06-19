var FormVal = Backbone.Model.extend({
});

var InputView = Backbone.View.extend({
	tagName: 'span',

	initialize: function(opts) {
		this.mode = 'edit';
		this.listenTo(this.model, 'change:value', this.render);
		opts.val.click(this.changeMode.bind(this));

		this.input = opts.input;
		$(this.input).replaceWith(this.$el);
		this.$el.append(this.input);

		$(this.input).change(function(model) {
			model.set('value', this.value);
		}.bind(this.input, this.model));
	},

	render: function() {
		var val = this.model.get('value');
		if(val != undefined) {
			switch(this.mode) {
				case 'edit':
					this.input.value = val;
					break;
				case 'show':
					this.el.firstChild.data = val;
					break;
			}
		}
	},

	changeMode: function() {
		if(this.mode == 'edit') {
			this.mode = 'show';
			this.el.removeChild(this.input);
			this.$el.append(document.createTextNode(''));
		} else {
			this.mode = 'edit';
			this.$el.empty();
			this.$el.append(this.input);
		}
		this.render();
	}
});

var input_helper = function(args, options) {
	name = args['name'];
	placeholder = args['placeholder'] || args['name'];
	return '<input type="text" name="'+name+'" placeholder="'+placeholder+'">';
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
	initialize: function() {
		this.listenTo(this.model, 'change', this.render);
	},

	render: function() {
		$('#nav-doc').hide();

		var view = this;
		var title = document.createElement('h1');
		title.appendChild(document.createTextNode('Documents'));
		var list = document.createElement('ul');
		list.className = 'list-docs';

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
			list.appendChild(li);
		});

		this.$el.empty();
		this.$el.append(title);
		this.$el.append(list);

		return this;
	},
});

var DocView = Backbone.View.extend({
	initialize: function() {
		var val = document.createElement('input');
		val.type = 'button';
		val.id = 'val';
		val.value = 'Valider';
		$(val).click(function() {
			if(val.value == 'Valider')
				val.value = 'Editer';
			else
				val.value = 'Valider';
		});
		this.val = $(val);
	},

	render: function() {
		// Navbar
		var name = this.model.get('name');
		$('#nav-doc a').off('click');
		$('#nav-doc a').on('click', function() {
			Backbone.history.navigate('/docs/'+name);
		});
		$('#nav-doc a')[0].firstChild.data = name;
		$('#nav-doc').show();

		// Document
		var topView = this;
		this.$el.html(this.model.template());
		this.$el.append(this.val);

		this.$('input[id!="val"]').each(function(i, elem) {
			var view = new InputView({
				model: topView.model.getFormVal(elem.name),
				input: elem,
				val: topView.val
			});
			view.render();
		});
	}
});

var Router = Backbone.Router.extend({
	routes: {
		'(/)':           'list_docs',
		'docs/:name': 'display_form'
	},

	list_docs: function() {
		$('#view').empty();
		$('#view').append(list_view.el);
		list_view.render();
	},

	display_form: function(name) {
		var doc_view = new DocView({model: docs.get(name)});
		doc_view.render();
		$('#view').empty();
		$('#view').append(doc_view.el);
	}
});

$(function() {
	new Router();
	list_view = new ListView({model: docs});
	Backbone.history.start();
});
