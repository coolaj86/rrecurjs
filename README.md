Daplie is Taking Back the Internet!
--------------

[![](https://daplie.github.com/igg/images/ad-developer-rpi-white-890x275.jpg?v2)](https://daplie.com/preorder/)

Stop serving the empire and join the rebel alliance!

* [Invest in Daplie on Wefunder](https://daplie.com/invest/)
* [Pre-order Cloud](https://daplie.com/preorder/), The World's First Home Server for Everyone

rrecur
=======

Convert between RFC2445 RRULE and its JSON equivalent.  Useful with `rrule.js`.

If you want UIs like these:

Google Calendar: http://imgur.com/a/gT7Af

Thunderbird Calendar: http://imgur.com/a/LhnWU

Kendo Calendar: http://imgur.com/a/zVLyg

You need a library like this to actually interpret `RRULE`s and schedule the events.

Usage
====

parse & stringify
---

This snippet will work both in the Browser and with Node.js
(hence the scary bit at the bottom).

From JSON to RRULE

```javascript
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('rrecur').Rrecur
    , rfcString
    ;

  rfcString = Rrecur.stringify({
    "freq": "monthly"
  , "interval": "2"
  , "count": "10"
  , "byday": ["1su","-1su"]
  });

}('undefined' !== typeof exports && exports || new Function('return this')()));
```

From RRULE to JSON

```javascript
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('rrecur').Rrecur
    , rfcString
    ;

  rfcString = Rrecur.stringify({
    "freq": "monthly"
  , "interval": "2"
  , "count": "10"
  , "byday": ["1su","-1su"]
  });

}('undefined' !== typeof exports && exports || new Function('return this')()));
```

next occurrence of an event
---

**Scenario**:
I want an alarm to go off every day at 10:30am, given my location.

Since we can't specify timezones with a JavaScript date object, we pretend internally that *local time* **is** *zoneless time*. UTC is handled exactly as UTC.

So let's say it's 8:00am on our server in Utah on the first day of summer
and we want to set an alarm for 10:30am in New York (30 minutes from now)
every mon, wed, fri:

```javascript
var rrecur
  ;

rrecur = Rrecur.create({
  dtstart: Rrecur.toLocaleISOString(new Date(2014,06,21, 10,30,0), "GMT-0400 (EDT)")
, locale: "GMT-0400 (EDT)"
, byhour: [10]
, byminute: [30]
, byday: ['mo','we','fr'] // Or [Rrecur.weekdays[1], Rrecur.weekdays[3], Rrecur.weekdays[5]]
, until: Rrecur.toAdjustedISOString(new Date(2014,06,22, 10,30,0), "GMT-0400 (EDT)")
, freq: 'daily'
, count: 1
// `bysecond` will default to 00, since that's what's specified in `dtstart`
}, new Date());

rrecur.next(); // 2014-05-21T10:30:00.000-0400
```

If you didn't specify `locale` then you would get back a time in UTC
or in `GMT-0600 (MDT)` that you would need to manually adjust.

Installation
===

### browser

**NOTE**: you only need `rrecur.js` for the basic `JSON <-> RRULE` conversion.
If you want to actually find the occurances you'll need
`underscore.js`, `rrule.js`, and `moment.js`, and `rrecur-iterator.js`.
However, in some future version I may be able to eliminate `underscore.js` and `rrule.js`.

via bower

```bash
bower install rrecur
```

via download

```bash
wget https://raw2.github.com/coolaj86/rrecurjs/master/rrecur.js
wget https://raw2.github.com/coolaj86/rrecurjs/master/rrecur-iterator.js
```

and insert the script tag, of course

```html
<script src="underscore.js"></script>
<script src="rrule.js"></script>
<script src="moment.js"></script>
<script src="rrecur.js"></script>
<script src="rrecur-iterator.js"></script>
```

```jade
script(src="underscore.js")
script(src="rrule.js")
script(src="moment.js")
script(src="rrecur.js")
script(src="rrecur-iterator.js")
```

I know, it's a lot of dependencies... but that's just how it is.
In a future version it may be reasonable to drop `underscore` and `rrule`,
but `moment` is a must. JavaScript's Date object is just too messed up.


### node.js

```bash
npm install rrecur
```

API
===

Convert between RFC2445 RRULE and its JSON equivalent.

* `Rrecur.parse(rruleStr)` - parses a string rrule (allows non-standard `dtstart` in string)
* `Rrecur.stringify(rruleObj)` - stringifies an rrule object (allows non-standard `dtstart`)

Find the next (or previous) occurence of an event in an rrule chain.

* `Rrecur.create(rrule, localeDateString)` - creates a wrapped instance from `rrule.js` from an rrule object or string
  * `localeDateString` - a string such as `Wed Jul 16 2014 10:30:00 GMT-0400 (EDT)`
  * `Rrecur#previous()` - cycles backwards through time to find a previous instance up to `dtstart`
  * `Rrecur#next()` - cycles forwards through time to find the next instance up to `until` or `count`

Utility functions

* `Rrecur.toLocaleISOString(date, [locale])` - ouput an ISO string with timezone information
  * `2014-06-21T10:00:00.000-0600` instead of `Sat Jun 21 2014 10:15:08 GMT-0600 (MDT)` or `2014-06-21T16:00:00.000Z`
  * If `locale` is specified in a format such as `-04:00` or `GMT-0400 (EDT)`, the local (not UTC) time is still used, but the offset is replaced with the supplied locale.
* `Rrecur.toAdjustedISOString(date, locale)`
  * `date` - A local date object (with the wrong timezone)
  * `locale` A JavaScript Locale string (or Date string) with the desired timezone
  * returns a UTC string adjusted to accurately represent the desired timezone

### RRULEs

You put in an object like this:

```json
{ "freq": "weekly"
, "until": "2015-01-01T10:30:00.000Z"
, "byday": ["tu", "th"]
, "byhour": [4]
, "byminute": [30]
}
```

* `freq` - `yearly|monthly|weekly|daily|hourly|minutely|secondly`
* `interval` - bi-weekly, tri-weekly, etc
* `bymonth`
* `byweekno`
* `byyearday`
* `bymonthday`
* `byday` - 0-7, su,mo,tu,we,th,fr,sa,su
* `byhour`
* `byminute`
* `bysecond`
* `until` - seems that this must be given in UTC as per spec, which is weird
* `count` - how many occurrences
* `wkst` - which day the week starts on 0-7, sa,su,mo
* `bysetpos` - not sure how this works - http://www.kanzaki.com/docs/ical/recur.html
* `dtstart` - specifies the first event (or a date close to it), non-standard as part of rrule, but is part of ical
  * If you don't specify `dtstart`, the current time will be used.
  * You cannot get `previous()` before `dtstart`
* `locale` - specifies the locale in the format `GMT-0500 (EST)` - non-standard, in general
* `tzid` - specifies the locale, non-standard as part of rrule, but is part of ical

See https://github.com/jkbr/rrule#api for implementation details.

### Examples

JSON version of iCal RRULE

```json
{ "freq": "daily"
, "until": "2015-01-01T10:30:00.000Z"
, "byday": ["tu", "th"]
, "byhour": [4]
, "byminute": [30]
}
```

Non-standard iCal directive

(once `TZID` is implemented, this will be standard)

```
DTSTART;LOCALE=GMT-0500 (EST):20140616T103000
RRULE:FREQ=DAILY;BYHOUR=10;BYMINUTE=30;BYSECOND=0;UNTIL=20150616T153000Z
```

Non-standard iCal directive (`rrule.js` flavored)

```
DTSTART=20140616T103000Z;FREQ=DAILY;BYHOUR=10;BYMINUTE=30;BYSECOND=0;UNTIL=20150616T153000Z
```

Timezones
===

Timezones are a PAIN! Right!?

Here are the problems:

  * JavaScript's native Date object has only two options - *Locale* and *UTC*
  * The server may have a different locale than the client
  * `rrule.js` only operates on *Locale* - the local time of the server
  * `RRULE`s are *zoneless* - 10:30am is meant to be in the user's time
  * `DTSTART;TZID=America/New_York` isn't *yet* supported by `rrule.js`

Here are solutions:

  * `DTSTART` you can include `LOCALE` (recommended) or use UTC (confusing)
  * `UNTIL` you must use UTC (confusing, but that's the way it is)
    * Try `Rrecur.toAdjustedISOString(new Date(2014,06,16,10,30,00), 'GMT-0600 (MDT)')`
  * `RRULE`s are *zoneless*, but we do our best to put them in the right zone.
  * Everything is calculated in local time under the hood.

Remember:

* Always specify RRULEs in local time
  * An RRULE for Monday at 10am will fire well after the sun is risen whether in California or China
  * An RRULE for Monday at 10am will have a different UTC conversion in California than in China
  * `dtstart` should always be in local time with a locale or in UTC
  * `until` must be specified in UTC
  * all calculations will be done in the local time of the server
