/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur').Rrecur
    , RRule
    , moment = require('moment')
    , p
    ;

  function addSubtract(m, rule, method, int) {
    var doubleInt = (rule.interval || 1) * int
      , d = m
      ;

    switch(rule.freq) {
    case 'yearly':
      d[method](doubleInt, 'years');
      break;
    case 'monthly':
      d[method](doubleInt, 'months');
      break;
    case 'weekly':
      d[method](doubleInt, 'weeks');
      break;
    case 'daily':
      d[method](doubleInt, 'days');
      break;
    case 'hourly':
      d[method](doubleInt, 'hours');
      break;
    case 'minutely':
      d[method](doubleInt, 'minutes');
      break;
    case 'secondly':
      d[method](doubleInt, 'seconds');
      break;
    }

    return d.toDate().toISOString();
  }
  function add(m, rule) {
    return addSubtract(m, rule, 'add', 1);
  }

  function subtract(m, rule) {
    return addSubtract(m, rule, 'subtract', 1);
  }

  function getDtStart(m, ruleObj, method) {
    var d = moment(m)
      ;

    return addSubtract(d, ruleObj, method, 2);
  }

  Rrecur.create = Rrecur;

  Rrecur.fromISOStringToLocale = function (iso, locale) {
    var offset = Rrecur.getOffsetFromLocale(locale)
      , str
      ;

    str = moment(new Date(iso)).zone(offset).toString();
    str = str.replace(/GMT-.*$/, 'GMT-0000');
    str = new Date(str).toISOString();
    str = str.replace(/Z$/, offset);

    return str;
  };

  Rrecur.adustByTzid = function (date, tzid) {
    // TODO convert from tzid to whatever moment understands
    // http://www.twinsun.com/tz/tz-link.htm
    // http://www.unicode.org/cldr/charts/latest/supplemental/zone_tzid.html
    throw new Error("Not Implemented", tzid);
  };
  Rrecur.adustByLocale = function (date, locale) {
    return new Date(date.toString().replace(/GMT.*/, locale));
  };
  Rrecur.adustByOffset = function (date, tzoffset) {
    // this is to keep 10am, but change which offset it is in
    // so that UTC will change to the appropriate zone
    tzoffset = tzoffset || '-0000';
    return new Date(date.toString().replace(/GMT.*/, 'GMT' + tzoffset/* + ' (' + abbr + ')'*/));
    /*
    if ('string' === tzoffset) {
      // convert from "-0430" to "-04:30"
      tzoffset = tzoffset.replace(/\d{2}\d{2}/, "$1:$2");
    }
    */
  };
  p = Rrecur.prototype;
  p.init = function (thing, today, dtstartZoneless, locale) {
    // TODO must be ISO / Zulu time
    var me = this
      , dtstartZulu
      ;

    RRule = RRule || exports.RRule || require('rrule').RRule;
    moment = moment || exports.moment || require('moment');

    if (!thing) {
      return;
    }
    me._firstTime = true;
    me._serverLocale = Rrecur.getLocaleFromGmtString(new Date());
    me._serverOffset = Rrecur.getOffsetFromLocale(me._serverLocale);

    // TODO strictly check incoming formats
    if ('string' === typeof thing) {
      me.__rfcString = thing;
      me.__rruleObj = Rrecur.parse(thing);
    } else {
      me.__rfcString = Rrecur.stringify(thing);
      me.__rruleObj = thing;
    }

    me._rule = {};
    Object.keys(me.__rruleObj).forEach(function (key) {
      if (Array.isArray(me.__rruleObj[key])) {
        me._rule[key] = me.__rruleObj[key].slice(0);
      } else {
        me._rule[key] = me.__rruleObj[key];
      }
    });

    if (locale) {
      me._rule.locale = locale;

      if (dtstartZoneless) {
        dtstartZulu = new Date(Rrecur.fromZonelessDtstartToRrule(dtstartZoneless, locale))
          .toISOString()
          ;

        me._rule.dtstart = dtstartZulu;
      }
    }

    // TODO datestr -> locale
    today = (today||"").toString();
    if (!today) {

      if (!me._rule.dtstart) {
        // Rrecur.toLocaleISOString(new Date());
        me._rule.dtstart = new Date().toISOString();
        console.error("DTSTART was not specified, falling back to '" + me._rule.dtstart + "'" );
      }

      if (me._rule.tzid) {
        console.error('TZIDs are not yet implemented, falling back to Locale');
        console.warn('TODO use moment timezone');
      }

      if (!me._rule.locale) {
        me._rule.locale = locale;
      }

      if (!me._rule.locale) {
        me._rule.locale = 'GMT-0000 (UTC)'; //new Date().toString();
        console.error("Locale was not specified, falling back to '" + me._rule.locale + "'");
      }

      me._rule.locale = Rrecur.getLocaleFromGmtString(me._rule.locale);
      me._rule.offset = Rrecur.getOffsetFromLocale(me._rule.locale);

      //today = me._rule.dtstart;
      today = new Date();
    }

    if (!dtstartZulu) {
      if ('object' === typeof today) {
        today = today.toISOString();
      }
      dtstartZulu = (me._rule.dtstart || today).toString();
    }

    Rrecur.toDateFromISOString = function (iso, locale) {
      var offset = Rrecur.getOffsetFromLocale(locale)
        ;

      return new Date(iso.replace(/Z/, '') + offset);
    };

    Rrecur.dtstartDefaults(
      me._rule.freq
      // dtstartZ
    , Rrecur.toDateFromISOString(dtstartZoneless || dtstartZulu, locale || '-0000')
    , me._rule
    , me._rule.locale
    );

    /*
    me._zoneless = datestr
      .toString()                                     // handles Date, Moment, and String
      ;

    if (/GMT/.test(me._zoneless)) {
      me._zoneless = me._zoneless
        .replace(/GMT[+\-]\d{4}.*$/, me._serverLocale)   // handles LocaleString
        ;
    } else {
      me._zoneless = me._zoneless
        .replace(/[+\-]\d{4}.*$/, 'Z', me._serverOffset) // handles ISOString
        ;
    }

    me._m = moment(me._zoneless);
    */
    me._m = moment(today);

    if (me._rule.count) {
      delete me._rule.count;
    }

    // create a string in the timezone of the server
    me._locale = me._rule.locale;
    me._offset = me._rule.offset;
    delete me._rule.locale;
    delete me._rule.offset;

    me._rfcString = Rrecur.stringify(me._rule, me._locale);
    // Rrule doesn't support TZID or (my own) LOCALE
    me._rrule = RRule.fromString(me._rfcString);
  };
  p.previous = function () {
    var me = this
      , date
      , odate
      ;

    if (!me._rule.dtstart) {
      me._rule.dtstart = getDtStart(me._m, me._rule, 'subtract');
    }

    //subtract(me._m, me._rule);
    date = me._m.toDate();
    odate = me._m.toDate();

    date = me._rrule.before(odate);
    me._m = moment(date);

    if (date && me._firstTime) {
      me._firstTime = false;
    }

    date = me._m.toDate();

    if ('Invalid Date' === date.toString()) {
      me._m = moment(odate);
      return null;
    }

    return Rrecur.toLocaleISOString(date, me._locale);
  };
  p.next = function () {
    var me = this
      , date
      , odate
      ;

    /*
    if (!me._rule.until) {
      me._rule.until = getDtStart(me._m, me._rule, 'add');
    }
    */

    /*
    add(me._m, me._rule);
    //return me._rrule.after(me._m.toDate(), true);
    //*/

    date = me._m.toDate();
    odate = me._m.toDate();

    me._m = moment(me._rrule.after(date, me._firstTime));

    if (me._firstTime) {
      me._firstTime = false;
    }

    date = me._m.toDate();
    if ('Invalid Date' === date.toString()) {
      me._m = moment(odate);
      return null;
    }

    console.log('NEXT', Rrecur.toLocaleISOString(date, me._locale));
    return Rrecur.toLocaleISOString(date, me._locale);
  };

  exports.Rrecur = Rrecur;
}('undefined' !== typeof exports && exports || new Function('return this')()));
