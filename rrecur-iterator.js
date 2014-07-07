/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur').Rrecur
    , moment = moment || exports.moment || require('moment')
    , RRule = RRule || exports.RRule || require('rrule').RRule
    , proto
    ;

  function parseOffset(offset) {
    var parts = offset.match(/([-+])(\d{2})(\d{2})/)
      , sign = parseInt(parts[1] + '1', 10)
      , hours = parseInt(parts[2], 10)
      , minutes = parseInt(parts[3], 10) / 60
      ;

    return sign * (hours + minutes);
  }

  function commandifyOffset(offset) {
    var parts = offset.toString().match(/(-)?(\d+)(\.\d+)?/)
      , sign = parts[1] || '+'
      , hours = parseInt(parts[2] || 0, 10)
      , minutes = parseInt(parts[3] || 0, 10) * 60
      ;

    return {
      operation: '-' === sign ? 'subtract' : 'add'
    , hours: hours
    , minutes: minutes
    };
  }

  function diffOffsets(m, server, locale) {
    var diff = parseOffset(locale) - parseOffset(server)
      , directive = commandifyOffset(diff)
      ;

    m[directive.operation](directive.hours, 'hours');
    m[directive.operation](directive.minutes, 'minutes');

    return m;
  }
  Rrecur.diffOffsets = diffOffsets;
 
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

  function getDtStart(m, ruleObj, method) {
    var d = moment(m)
      ;

    return addSubtract(d, ruleObj, method, 2);
  }

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

  Rrecur.utcToOffset = function (utc, locale, zoneless) {
    var d = new Date(utc)
      , m = moment(d).utc()
      ;

    Rrecur.diffOffsets(
      m
    , Rrecur.getOffsetFromLocale(new Date().toString())
    , Rrecur.getOffsetFromLocale(locale)
    );

    if (zoneless) {
      return Rrecur.stripZone(Rrecur.toLocaleISOString(m.toDate(), locale));
    } else {
      return Rrecur.toLocaleISOString(m.toDate(), locale);
    }
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
  };
  Rrecur.toDateFromISOString = function (iso, locale) {
    var offset = Rrecur.getOffsetFromLocale(locale)
      ;

    return new Date(iso.replace(/Z/, '') + offset);
  };

  Rrecur.create = Rrecur;
  proto = Rrecur.prototype;
  proto.init = function (sched, today, firstTime, other) {
    if (!sched) {
      return;
    }

    var me = this
      , dtstartZulu
      ;

    me._firstTime = true;
    // MDT => MST could happen while the server is running... ugh
    me._serverLocale = Rrecur.getLocaleFromGmtString(new Date().toString());
    me._serverOffset = Rrecur.getOffsetFromLocale(me._serverLocale);

    if (!sched.dtstart || 'object' !== typeof sched.dtstart || !/object/i.test(sched.dtstart.toString())) {
      sched = {
        dtstart: {
          zoneless: firstTime
        , locale: other
        }
      , rrule: sched
      };
    } else {
      if ('boolean' === typeof firstTime) {
        me._firstTime = firstTime;
      }
    }

    today = today || sched.today;
    if (!sched.dtstart.zoneless) {
      if (!sched.dtstart.utc) {
        if (!sched.dtstart.locale) {
          throw new Error('Neither zoneless nor utc date specified!');
        }
        sched.dtstart.zoneless = Rrecur.toZonelessLocaleISOString(
          new Date(sched.dtstart.locale)
        , sched.dtstart.locale
        );
      }
      sched.dtstart.zoneless = Rrecur.utcToOffset(sched.dtstart.utc, sched.dtstart.locale, true);
    }

    if (!sched.dtstart.utc) {
      sched.dtstart.utc = Rrecur.fromZonelessDtstartToRrule(sched.dtstart.zoneless, sched.dtstart.locale);
    }

    // TODO strictly check incoming formats
    if ('string' === typeof thing) {
      me.__rfcString = sched.rrule;
      me.__rruleObj = Rrecur.parse(sched.rrule);
    } else {
      me.__rfcString = Rrecur.stringify(sched.rrule);
      me.__rruleObj = sched.rrule;
    }

    me._rule = {};
    Object.keys(me.__rruleObj).forEach(function (key) {
      if (Array.isArray(me.__rruleObj[key])) {
        me._rule[key] = me.__rruleObj[key].slice(0);
      } else {
        me._rule[key] = me.__rruleObj[key];
      }
    });

    if (me._rule.tzid) {
      throw new Error('TZIDs are not yet implemented');
    }

    if (sched.dtstart.zoneless) {
      if (!sched.dtstart.locale) {
        throw new Error("You must specifiy a locale string (or time string) such as 'GMT-0600 (MDT)'");
      }

      dtstartZulu = new Date(
        Rrecur.fromZonelessDtstartToRrule(sched.dtstart.zoneless, sched.dtstart.locale)
      ).toISOString();

      me._rule.dtstart = dtstartZulu;
      me._rule.locale = sched.dtstart.locale;
    } else if (me._rule.dtstart) {
      dtstartZulu = new Date(me._rule.dtstart).toISOString();
    } else {
      //me._rule.dtstart = new Date().toISOString();
      //console.error("DTSTART was not specified, falling back to '" + me._rule.dtstart + "'" );
      throw new Error("You must specify a start date and locale");
    }

    today = new Date(today).toString();

    if (!me._rule.locale) {
      me._rule.locale = sched.dtstart.locale;
    }

    if (!me._rule.locale) {
      me._rule.locale = 'GMT-0000 (UTC)';
      throw new Error('no locale was specified (tzid is not yet supported)');
    }

    me._rule.locale = Rrecur.getLocaleFromGmtString(me._rule.locale);
    me._rule.offset = Rrecur.getOffsetFromLocale(me._rule.locale);

    Rrecur.dtstartDefaults(
      me._rule.freq
    , Rrecur.toDateFromISOString(
        sched.dtstart.zoneless
      , me._serverLocale
      )
    , me._rule
    , me._rule.locale
    );

    // create a string in the timezone of the server
    me._locale = me._rule.locale;
    me._offset = me._rule.offset;
    delete me._rule.locale;
    delete me._rule.offset;
   
    me._m = moment(today);
    me._m = diffOffsets(me._m, me._serverOffset, me._offset); // dtstart needs needs to be adjusted by this same amount

    // we must also adjust dtstart, otherwise dtstart could be AFTER the adjusted time
    // which would erroneously put us further in the future (or past) and get the next (or previous) event
    me._rule.dtstart = diffOffsets(moment(new Date(me._rule.dtstart)), me._serverOffset, me._offset).toISOString();
    me._rfcString = Rrecur.stringify(me._rule, me._locale);
    // Rrule doesn't support TZID or (my own) LOCALE
    me._rrule = RRule.fromString(me._rfcString);
  };
  proto.previous = function () {
    var me = this
      , date
      , odate
      ;

    if (!me._rule.dtstart) {
      me._rule.dtstart = getDtStart(me._m, me._rule, 'subtract');
    }

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
  proto.next = function (firstTime) {
    var me = this
      , date
      , odate
      , ldate
      ;

    if ('boolean' === typeof firstTime) {
      me._firstTime = firstTime;
    }

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

    ldate = Rrecur.toLocaleISOString(date, me._locale);

    return ldate;
  };

  exports.Rrecur = Rrecur;
}('undefined' !== typeof exports && exports || new Function('return this')()));
