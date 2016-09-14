//    Dunderscore
//    dunderscore.js 0.1.0
//    (c) 2016 Juice Analytics Inc.
//    Dunderscore may be freely distributed under the MIT license.


(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `require` it on the server.
  if (typeof exports === 'object') {
    _ = module.exports = require('underscore');
  }


  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // Setup new _.template function that can handle '|' delimited filters.
  _.mixin({
    template: function(text, settings, oldSettings) {
      if (!settings && oldSettings) settings = oldSettings;
      settings = _.defaults({}, settings, _.templateSettings, {autoEmphasize: noMatch});

      // Combine delimiters into one regular expression via alternation.
      var matcher = RegExp([
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
      ].join('|') + '|$', 'g');


      // Setup regular expressions for finding filters. (filter and args regex courtesy vega datalib.)
      var filterRe = /(?:"[^"]*"|\'[^\']*\'|[^\|"]+|[^\|\']+)+/g,
          argsRe = /(?:"[^"]*"|\'[^\']*\'|[^,"]+|[^,\']+)+/g;

      var orRe = /(?:\|\|)+/g;

      // Compile the template source, escaping string literals appropriately.
      var index = 0;
      var source = "__p+='";
      text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset).replace(escaper, escapeChar);
        index = offset + match.length;

        if (escape) {
          source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
        } else if (interpolate) {
          // Check for filters.
          var orClauses = [],
              allProps = [];

          // To not mistake an "or clause" (`||`) for a filter, we check if the interpolate expression is made up of "or
          // clauses". And then split the interpolate expression into each "or clause".
          if (interpolate.match(orRe)) {
            orClauses = interpolate.split(orRe);
          } else {
            orClauses.push(interpolate);
          }

          // For each "or clause", we check if the `|` delimited filter syntax is used.
          orClauses.forEach(function(c) {

            var filters = c.match(filterRe);
            var prop = filters.shift().trim();

            var autoEmphasize = false;
            if (prop.match(settings.autoEmphasize)) autoEmphasize = true;

            // If we find any filters, we apply the `_.chain` method and chain all the filters together.
            if (filters.length) {
              prop = '_.chain(' + prop + ')';

              for (var i = 0; i < filters.length; ++i) {
                var f = filters[i].trim(), args = null, idx;

                // Don't auto-emphasize if the `noemphasis` filter is applied.
                if (f === 'noemphasis') autoEmphasize = false;

                if ((idx = f.indexOf(':')) > 0) {
                  f = f.slice(0, idx);
                  args = filters[i].slice(idx + 1)
                    .match(argsRe)
                    .map(function(s) {
                      s = s.trim();
                      return s;
                    });
                }
                f = f.trim();

                prop += '.' + f + '(' + args + ')';
              }

              if (autoEmphasize) {
                prop += '.emphasis()';
              }

              // Call the `_.value()` function after all the filters have been chained.
              prop += '.value()';
            } else if (autoEmphasize) {
              prop = '_.chain(' + prop + ').emphasis().value()';
            }

            allProps.push(prop);
          });

          source += "'+\n((__t=(" + allProps.join(' || ') + "))==null?'':__t)+\n'";
        } else if (evaluate) {
          source += "';\n" + evaluate + "\n__p+='";
        }

        // Adobe VMs need the match returned to produce the correct offest.
        return match;
      });
      source += "';\n";

      // If a variable is not specified, place data values in local scope.
      if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

      source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

      var render;
      try {
        render = new Function(settings.variable || 'obj', '_', source);
      } catch (e) {
        e.source = source;
        throw e;
      }

      var template = function(data) {
        return render.call(this, data, _);
      };

      // Provide the compiled source as a convenience for precompilation.
      var argument = settings.variable || 'obj';
      template.source = 'function(' + argument + '){\n' + source + '}';

      return template;
    }
  });


  // Setup `emphasis` and `noemphasis` filters.

  // Emphasize `text` by surrounding it with <strong></strong> tags.
  function emphasis(text) {
    return text ? '<strong>' + text + '</strong>' : '';
  }

  // Suppress `text` emphasis
  function noemphasis(text) {
    text = text.replace(/<strong>/g, '');
    text = text.replace(/<\/strong>/g, '');
    return text;
  }

  // Add them.
  _.mixin({
    emphasis: emphasis,
    noemphasis: noemphasis
  });

}).call(this);
