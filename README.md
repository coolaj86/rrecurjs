rrecurjs
=======

Convert between RFC2445 RRULE and its JSON equivalent. Useful with rrule.js.

You put in an object like this:

```json
{ "freq": "weekly"
, "until": "2015-01-01T10:30:00.000Z"
, "byday": ["tu", "th"]
}
```

And you get 

https://github.com/jkbr/rrule#api

Installation
===

### browser

via bower

```bash
bower install rrecur
```

via download

```bash
wget https://raw2.github.com/coolaj86/rrecurjs/master/rrecur.js
wget https://raw2.github.com/coolaj86/rrecurjs/master/rrecur-interval.js
```

and insert the script tag, of course

```html
<script src="underscore.js"></script>
<script src="rrule.js"></script>
<script src="moment.js"></script>
<script src="recur.js"></script>
```

```jade
script(src="underscore.js")
script(src="rrule.js")
script(src="moment.js")
script(src="recur.js")
```

I know, it's a lot of dependencies... but that's just how it is.
In a future version it may be reasonable to drop `underscore` and `rrule`,
but `moment` is a must. JavaScript's Date object is just too messed up.


### node.js

```bash
npm install recur
```

### Usage

This snippet will work both in the Browser and with Node.js
(hence the scary bit at the bottom).

```javascript
(function (exports) {
  'use strict';

  var Recur = require('recur').Recur
    , rfcString
    , rruleObj
    ;

  rruleObj = Recur.parse('FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU');

  rfcString = Recur.stringify({
    "freq": "monthly"
  , "interval": "2"
  , "count": "10"
  , "byday": ["1su","-1su"]
  });

}('undefined' !== typeof exports && exports || new Function('return this')()));
```

What'chu talkin' 'bout, Willis?
---

Recurring events, that's what Willis was talking about.

If you want UIs like these:

Google Calendar: http://imgur.com/a/gT7Af

Thunderbird Calendar: http://imgur.com/a/LhnWU

Kendo Calendar: http://imgur.com/a/zVLyg

You need a library like this to actually interpret the data.
