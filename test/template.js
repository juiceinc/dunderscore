(function() {

  var _ = typeof require == 'function' ? require('..') : window._;

  _.mixin({
    testReverse: function(s) {
      return s.split('').reverse().join('');
    },
    sum: function(list, start, end) {
      if (! end) end = list.length;
      if (! start) start = 0;
      list = list.slice(start, end);
      return _.reduce(list, function(memo, n) {
        return memo + n;
      }, 0);
    }
  });

  QUnit.test('template', function(assert) {
    var filterTemplate = _.template('Reverse of <%= label %> is <%= label|testReverse %>');
    assert.equal(filterTemplate({label: 'Moo'}), 'Reverse of Moo is ooM', 'can call a filter');

    var filterSingleArgTemplate = _.template('Size of list [20, 30, 40] is <%= [20, 30, 40]|size %>');
    assert.equal(filterSingleArgTemplate(), 'Size of list [20, 30, 40] is 3', 'can call a filter with a single argument');

    var filterMultipleArgsTemplate = _.template('Sum of first two numbers of [20, 30, 40] is <%= [20,30,40]|sum:0,2 %>');
    assert.equal(filterMultipleArgsTemplate(), 'Sum of first two numbers of [20, 30, 40] is 50', 'can call a filter with multiple arguments');

    var emphasisTemplate = _.template('Emphasize this: <%= label|emphasis %>');
    assert.equal(emphasisTemplate({label: 'Moo'}), 'Emphasize this: <strong>Moo</strong>', 'can emphasize');

    var noemphasisTemplate = _.template('Do not emphasize this: <%= label|emphasis|emphasis|noemphasis %>');
    assert.equal(noemphasisTemplate({label: 'Moo'}), 'Do not emphasize this: Moo', "doesn't emphasize");

  });

  QUnit.test('auto emphasis', function(assert) {
    var autoEmphasisTemplate = _.template('<%= label %> should be auto emphasized', {autoEmphasize: /label/});
    assert.equal(autoEmphasisTemplate({label: 'Moo'}), '<strong>Moo</strong> should be auto emphasized', 'can auto emphasize');

    var suppressAutoEmphasisTemplate = _.template('This <%= label %> is emphasized but this <%= label|noemphasis %> should not be emphasized', {autoEmphasize: /label/});
    assert.equal(suppressAutoEmphasisTemplate({label: 'Moo'}), 'This <strong>Moo</strong> is emphasized but this Moo should not be emphasized', 'can suppress auto emphasis');
  });

})();