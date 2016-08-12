(function() {
  var _ = typeof require == 'function' ? require('..') : window._;
  var templateSettings;

  QUnit.module('Utility', {

    beforeEach: function() {
      templateSettings = _.clone(_.templateSettings);
    },

    afterEach: function() {
      _.templateSettings = templateSettings;
    }

  });

  QUnit.test('template', function(assert) {
    var basicTemplate = _.template("<%= thing %> is gettin' on my noives!");
    var result = basicTemplate({thing: 'This'});
    assert.equal(result, "This is gettin' on my noives!", 'can do basic attribute interpolation');

    var sansSemicolonTemplate = _.template('A <% this %> B');
    assert.equal(sansSemicolonTemplate(), 'A  B');

    var backslashTemplate = _.template('<%= thing %> is \\ridanculous');
    assert.equal(backslashTemplate({thing: 'This'}), 'This is \\ridanculous');

    var escapeTemplate = _.template('<%= a ? "checked=\\"checked\\"" : "" %>');
    assert.equal(escapeTemplate({a: true}), 'checked="checked"', 'can handle slash escapes in interpolations.');

    var fancyTemplate = _.template('<ul><% ' +
    '  for (var key in people) { ' +
    '%><li><%= people[key] %></li><% } %></ul>');
    result = fancyTemplate({people: {moe: 'Moe', larry: 'Larry', curly: 'Curly'}});
    assert.equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var escapedCharsInJavascriptTemplate = _.template('<ul><% _.each(numbers.split("\\n"), function(item) { %><li><%= item %></li><% }) %></ul>');
    result = escapedCharsInJavascriptTemplate({numbers: 'one\ntwo\nthree\nfour'});
    assert.equal(result, '<ul><li>one</li><li>two</li><li>three</li><li>four</li></ul>', 'Can use escaped characters (e.g. \\n) in JavaScript');

    var namespaceCollisionTemplate = _.template('<%= pageCount %> <%= thumbnails[pageCount] %> <% _.each(thumbnails, function(p) { %><div class="thumbnail" rel="<%= p %>"></div><% }); %>');
    result = namespaceCollisionTemplate({
      pageCount: 3,
      thumbnails: {
        1: 'p1-thumbnail.gif',
        2: 'p2-thumbnail.gif',
        3: 'p3-thumbnail.gif'
      }
    });
    assert.equal(result, '3 p3-thumbnail.gif <div class="thumbnail" rel="p1-thumbnail.gif"></div><div class="thumbnail" rel="p2-thumbnail.gif"></div><div class="thumbnail" rel="p3-thumbnail.gif"></div>');

    var noInterpolateTemplate = _.template('<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');
    result = noInterpolateTemplate();
    assert.equal(result, '<div><p>Just some text. Hey, I know this is silly but it aids consistency.</p></div>');

    var quoteTemplate = _.template("It's its, not it's");
    assert.equal(quoteTemplate({}), "It's its, not it's");

    var quoteInStatementAndBody = _.template('<% ' +
    "  if(foo == 'bar'){ " +
    "%>Statement quotes and 'quotes'.<% } %>");
    assert.equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    var withNewlinesAndTabs = _.template('This\n\t\tis: <%= x %>.\n\tok.\nend.');
    assert.equal(withNewlinesAndTabs({x: 'that'}), 'This\n\t\tis: that.\n\tok.\nend.');

    var template = _.template('<i><%- value %></i>');
    result = template({value: '<script>'});
    assert.equal(result, '<i>&lt;script&gt;</i>');

    var stooge = {
      name: 'Moe',
      template: _.template("I'm <%= this.name %>")
    };
    assert.equal(stooge.template(), "I'm Moe");

    template = _.template('\n ' +
    '  <%\n ' +
    '  // a comment\n ' +
    '  if (data) { data += 12345; }; %>\n ' +
    '  <li><%= data %></li>\n '
    );
    assert.equal(template({data: 12345}).replace(/\s/g, ''), '<li>24690</li>');

    _.templateSettings = {
      evaluate: /\{\{([\s\S]+?)\}\}/g,
      interpolate: /\{\{=([\s\S]+?)\}\}/g
    };

    var custom = _.template('<ul>{{ for (var key in people) { }}<li>{{= people[key] }}</li>{{ } }}</ul>');
    result = custom({people: {moe: 'Moe', larry: 'Larry', curly: 'Curly'}});
    assert.equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customQuote = _.template("It's its, not it's");
    assert.equal(customQuote({}), "It's its, not it's");

    quoteInStatementAndBody = _.template("{{ if(foo == 'bar'){ }}Statement quotes and 'quotes'.{{ } }}");
    assert.equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      evaluate: /<\?([\s\S]+?)\?>/g,
      interpolate: /<\?=([\s\S]+?)\?>/g
    };

    var customWithSpecialChars = _.template('<ul><? for (var key in people) { ?><li><?= people[key] ?></li><? } ?></ul>');
    result = customWithSpecialChars({people: {moe: 'Moe', larry: 'Larry', curly: 'Curly'}});
    assert.equal(result, '<ul><li>Moe</li><li>Larry</li><li>Curly</li></ul>', 'can run arbitrary javascript in templates');

    var customWithSpecialCharsQuote = _.template("It's its, not it's");
    assert.equal(customWithSpecialCharsQuote({}), "It's its, not it's");

    quoteInStatementAndBody = _.template("<? if(foo == 'bar'){ ?>Statement quotes and 'quotes'.<? } ?>");
    assert.equal(quoteInStatementAndBody({foo: 'bar'}), "Statement quotes and 'quotes'.");

    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };

    var mustache = _.template('Hello {{planet}}!');
    assert.equal(mustache({planet: 'World'}), 'Hello World!', 'can mimic mustache.js');

    var templateWithNull = _.template('a null undefined {{planet}}');
    assert.equal(templateWithNull({planet: 'world'}), 'a null undefined world', 'can handle missing escape and evaluate settings');
  });

  QUnit.test('_.template provides the generated function source, when a SyntaxError occurs', function(assert) {
    var source;
    try {
      _.template('<b><%= if x %></b>');
    } catch (ex) {
      source = ex.source;
    }
    assert.ok(/__p/.test(source));
  });

  QUnit.test('_.template handles \\u2028 & \\u2029', function(assert) {
    var tmpl = _.template('<p>\u2028<%= "\\u2028\\u2029" %>\u2029</p>');
    assert.strictEqual(tmpl(), '<p>\u2028\u2028\u2029\u2029</p>');
  });

  QUnit.test('_.templateSettings.variable', function(assert) {
    var s = '<%=data.x%>';
    var data = {x: 'x'};
    var tmp = _.template(s, {variable: 'data'});
    assert.strictEqual(tmp(data), 'x');
    _.templateSettings.variable = 'data';
    assert.strictEqual(_.template(s)(data), 'x');
  });

  QUnit.test('#547 - _.templateSettings is unchanged by custom settings.', function(assert) {
    assert.notOk(_.templateSettings.variable);
    _.template('', {}, {variable: 'x'});
    assert.notOk(_.templateSettings.variable);
  });

  QUnit.test('#556 - undefined template variables.', function(assert) {
    var template = _.template('<%=x%>');
    assert.strictEqual(template({x: null}), '');
    assert.strictEqual(template({x: void 0}), '');

    var templateEscaped = _.template('<%-x%>');
    assert.strictEqual(templateEscaped({x: null}), '');
    assert.strictEqual(templateEscaped({x: void 0}), '');

    var templateWithProperty = _.template('<%=x.foo%>');
    assert.strictEqual(templateWithProperty({x: {}}), '');
    assert.strictEqual(templateWithProperty({x: {}}), '');

    var templateWithPropertyEscaped = _.template('<%-x.foo%>');
    assert.strictEqual(templateWithPropertyEscaped({x: {}}), '');
    assert.strictEqual(templateWithPropertyEscaped({x: {}}), '');
  });

  QUnit.test('interpolate evaluates code only once.', function(assert) {
    assert.expect(2);
    var count = 0;
    var template = _.template('<%= f() %>');
    template({f: function(){ assert.notOk(count++); }});

    var countEscaped = 0;
    var templateEscaped = _.template('<%- f() %>');
    templateEscaped({f: function(){ assert.notOk(countEscaped++); }});
  });

  QUnit.test('#746 - _.template settings are not modified.', function(assert) {
    assert.expect(1);
    var settings = {};
    _.template('', null, settings);
    assert.deepEqual(settings, {});
  });

  QUnit.test('#779 - delimeters are applied to unescaped text.', function(assert) {
    assert.expect(1);
    var template = _.template('<<\nx\n>>', null, {evaluate: /<<(.*?)>>/g});
    assert.strictEqual(template(), '<<\nx\n>>');
  });

}());
