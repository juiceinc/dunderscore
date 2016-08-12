Dunderscore.js is an extension of the flexible templating of underscore.js to add chainable filters that modify template output.
These filters are inspired by the usefulness of vega's [datalib templates](http://vega.github.io/datalib/).
Dunderscore isn't just a marriage of convenience, it's a lightweight union of two projects we love.

Dunderscore is a drop-in replacement for `_.template`.

```
  __                        __
 /\ \                      /\ \                                                         __
 \_\ \    __  __    ___    \_\ \     __   _ __   ____    ___    ___   _ __    __       /\_\    ____
 /'_  \  /\ \/\ \ /' _ `\  /'_  \  /'__`\/\  __\/ ,__\  / ___\ / __`\/\  __\/'__`\     \/\ \  /',__\
/\ \ \ \/\ \ \_\ \/\ \/\ \/\ \ \ \/\  __/\ \ \//\__, `\/\ \__//\ \ \ \ \ \//\  __/  __  \ \ \/\__, `\
\ \___,_\ \ \____/\ \_\ \_\ \___,_\ \____\\ \_\\/\____/\ \____\ \____/\ \_\\ \____\/\_\ _\ \ \/\____/
 \/__,_ /  \/___/  \/_/\/_/\/__,_ /\/____/ \/_/ \/___/  \/____/\/___/  \/_/ \/____/\/_//\ \_\ \/___/
                                                                                        \ \____/
                                                                                         \/___/


```

### Filters

Filters allow interpolated values to be transformed. After a value is interpolated it can be passed through a chain of filtering functions.

```
<%= value|filter1 %>

// multiple filters can be chained

<%= value|filter1|filter2 %>
```

Filters may take one or more arguments like this.

```
<%= value|filter1:arg1,arg2 %>

// multiple filters with arguments can be chained

<%= value|filter1:arg1,arg2|filter2|filter3:arg1 %>
```

### Defining your own filters
Any method mixed into underscore via the `_.mixin` method can be used as a filter.

For example, we can define a filter to reverse a string like this:

```
  _.mixin({
    reverseFilter: function(s) {
      return s.split('').reverse().join('');
    }
  });

```

And then use it in a template like this:

```

var template = _.template('Reverse of <%= label %> is <%= label|reverseFilter %>');
template({label: 'dunderscore'});

// Outputs:
    "Reverse of dunderscore is erocsrednud"

```

Any of the existing underscore methods can also be used as filters. For example:

```

  var t = _.template('<% var f = new Function("stooge", "return stooge.age"); %> Maximum age: <%= stooges|max:f|values|last %>');
  var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
  t({stooges: stooges});

// Outputs:
    Maximum age: 60

```

### Built-in filters

Dunderscore comes with two filters:

* `emphasis`: Surrounds a string value with `<strong></strong>` tags.
* `noemphasis`: Disables emphasis for this interpolation.

You can override either/both of these by defining your own versions.

```

  _.mixin({
    emphasis: function(text) {
      return '<b>' + text + '</b>';
    }
  });

```

#### Auto-Emphasis

Dunderscore can automatically emphasize any interpolation that matches a pattern.

Add the `autoEmphasize` setting to `_.templateSettings` with the pattern to match or pass it to the `_.template` method
and if the pattern is found, the value will be automatically emphasized.

```
  var t = _.template('<%= label %> is auto emphasized!', {autoEmphasize: /label/});
  t({'label': 'Dunderscore'});

  // Outputs:
      <strong>Dunderscore</strong> is auto emphasized!
```

You can use the `noemphasis` filter to suppress the auto emphasis on certain interpolations.

```
  var t = _.template('This <%= label %> is auto emphasized but this <%= label|noemphasis %> is not.');
  t({'label': 'Dunderscore'});

  // Outputs:
    This <strong>Dunderscore</strong> is auto emphasized but this Dunderscore is not.

```



