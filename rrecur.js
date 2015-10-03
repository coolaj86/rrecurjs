/*jshint -W054 */
(function (exports) {
  'use strict';

  var rrkeys
    , localeWarn1 = true
    , localeWarn2 = true
    ;

  rrkeys = [
    'FREQ'

  , 'INTERVAL'
  , 'UNTIL'
  , 'COUNT'

  , 'BYWEEKNO'
  , 'BYYEARDAY'
  , 'BYDAY'
  , 'BYMONTH'
  , 'BYMONTHDAY'
  , 'BYHOUR'
  , 'BYMINUTE'
  , 'BYSECOND'

  , 'WKST'
  , 'BYSETPOS'

  , 'DTSTART' // non-standard as part of this string, but used by rrule
  ]
  ;

  function pad(str, len, padchar, rpad) {
    if ('number' === typeof str) {
      padchar = padchar || '0';
    } else if ('string' === typeof str) {
      padchar = padchar || ' ';
    }
    str = str.toString();
    while (str.length < len) {
      if (rpad) {
        str += padchar;
      } else {
        str = padchar + str;
      }
    }
    return str;
  }

  function Rrecur(rules, date) {
    var me = this
      ;

    if (!(me instanceof Rrecur)) {
      return new Rrecur(rules, date);
    }

    me.init(rules, date);
  }

  Rrecur.toAdjustedISOString = function (date, locale) {
    locale = Rrecur.getLocaleFromGmtString(locale.toString());
    return new Date(Rrecur.toLocaleISOString(date, locale)).toISOString();
  };

  Rrecur.toLocaleISOString = function (date, useoffset) {
    // This outputs local time in ISO format with a UTC offset
    var str
      ;

    // YYYY-MM-DDTHH:MM:SS.sss+nnnn
    // d.getTimezoneOffset()
    str = date.getFullYear()
      + '-'
      + pad(date.getMonth() + 1, 2, '0')
      + '-'
      + pad(date.getDate(), 2, '0')
      + 'T'
      + pad(date.getHours(), 2, '0')
      + ':'
      + pad(date.getMinutes(), 2, '0')
      + ':'
      + pad(date.getSeconds(), 2, '0')
      + '.'
      + pad(date.getMilliseconds(), 3, '0')
      ;

    if ('undefined' === typeof useoffset) {
      useoffset = true;
    }

    if ('boolean' !== typeof useoffset) {
      // perhaps GMT-0600 (MDT) or just -0600
      str += Rrecur.getOffsetFromLocale(useoffset);
    } else {
      // GMT-0400 (MDT) => -0400
      // -04:00 => -0400
      str += date
        .toString()
        .replace(/.*GMT([+\-]\d{2}:?\d{2})\s.*/, '$1')
        .replace(/:/, '')
        ;
    }

    return str;
  };

  function parseDateStr(vstr) {
    return vstr.replace(/-/, '').replace(/:/, '').replace(/Z.*/, 'Z');
  }

  Rrecur.toRruleDateString = function (vstr) {
    if ('object' === typeof vstr) {
      // TODO timezone
      vstr = parseDateStr(Rrecur.toLocaleISOString(vstr, false));
    }
    if ('string' === typeof vstr) {
      vstr = parseDateStr(vstr);
    }
    var m
      , str
      ;

    m = /(\d{4,4})(\d{2,2})(\d{2,2})(T(\d{2,2})(\d{2,2})(\d{2,2})(Z)?)?$/.exec(vstr);

    if (!m) {
      return '';
    }

    str = m[1] + '-' + m[2] + '-' + m[3];

    // TODO handle local time
    // TODO handle tz DTSTART;TZID=US-Eastern:19970714T133000
    if (m[4]) {
      str += 'T' + m[5] + ':' + m[6] + ':' + m[7] + '.000' + (m[8] || '');
    }

    return str;
  };

  // DTSTART is not part of RRULE
  function parse(str) {
    str = str.replace(/\n/, ';');
    str = str.replace(/RRULE:/, '');
    str = str.replace(/DTSTART;/, 'DTSTART__SEMI__');
    var pairs = str.split(';')
      , obj = {}
      ;

    pairs.forEach(function (pair) {
      pair = pair.replace(/DTSTART__SEMI__/, 'DTSTART;');
      var parts = pair.split('=')
        , k = parts[0]
        , ks
        , param
        , tzid
        , vstr = parts[1]
        , v
        ;

      // Handle case of DTSTART;TZID=US-Eastern:{{yyyymmddThhmmss}} // NO Z ALLOWED
      ks = k.split(';');
      k = ks[0];

      // TZID exists
      if ('TZID' === ks[1]) {
        param = ks[1].split(':');
        tzid = param[0];
        obj.tzid = tzid;
        v = param[1];
      }

      // Handle case of DTSTART;LOCALE=GMT-0600 (MDT):{{yyyymmddThhmmss}} // NO Z ALLOWED
      // obj.locale = obj.locale || stringifyGmtZone(obj.dtstart);
      if ('LOCALE' === ks[1]) {
        if (localeWarn2) {
          console.warn('[parse] falling back to non-standard locale definition for timezone');
          localeWarn2 = false;
        }
        param = vstr.split(':');
        obj.locale = param[0];

        // Continue with DTSTART
        k = ks[0];
        vstr = v = param[1];
      }

      switch (k) {
      case 'DTSTART':
      case 'UNTIL':
        v = Rrecur.toRruleDateString(vstr);
        break;
      case 'FREQ':
      case 'WKST':
        v = vstr.toLowerCase();
        break;
      case 'INTERVAL':
      case 'COUNT':
        v = vstr;
        break;
      case 'BYWEEKDAY':
        console.warn('converting rrule.js BYWEEKDAY to rrule rfc BYDAY');
        k = 'BYDAY';
        /* fall through */
      case 'BYSETPOS':
      case 'BYYEARDAY':
      case 'BYMONTH':
      case 'BYWEEKNO':
      case 'BYDAY':
      case 'BYMONTHDAY':
      case 'BYHOUR':
      case 'BYMINUTE':
      case 'BYSECOND':
      case 'BYEASTER':
        v = vstr.split(',');
        v.forEach(function (val, i) {
          v[i] = val.toLowerCase();
        });
        break;
      }

      obj[k.toLowerCase()] = v;
    });

    return obj;
  }

  function stringifyGmtZone(date) {
    if ('string' === typeof date) {
      date = stringifyDateStr(date);
    }
    if ('object' !== typeof date) {
      date = new Date(date);
    }
    return Rrecur.getLocaleFromGmtString(date.toString());
  }
  Rrecur.stringifyGmtZone = stringifyGmtZone;
  Rrecur.getLocaleFromGmtString = function (locale) {
    // 'Mon Jun 23 2014 10:30:00 GMT-0600 (MDT)' => 'GMT-0600 (MDT)'
    // 'Mon Jun 23 2014 10:30:00 GMT-0600' => 'GMT-0600'
    // 'GMT-0600 (MDT)' => 'GMT-0600 (MDT)'
    // '-0600 (MDT)' => 'GMT-0600 (MDT)'
    // 'GMT-0600' => 'GMT-0600'
    // '-0600' => 'GMT-0600'
    return locale
      .replace(/.*(?:GMT)?([\-+]\d{2}):?(00)(\s\(\w{1,6}\))?$/g, 'GMT$1$2$3')
      ;
  };
  Rrecur.swapLocale = function (date, locale) {
    return date
      .toString()
      .replace(/(.*)GMT.*$/g, '$1' + locale)
      ;
  };
  Rrecur.getOffsetFromLocale = function (locale) {
    // GMT-0600 (MDT) => -0600
    // -0600 (MDT) => -0600
    // GMT-0600 => -0600
    // -0600 => -0600
    return locale
      .toString()
      .replace(/.*(?:GMT)?([\-+]\d{2}):?(00)\s?(\(\w{1,6}\))?$/g, '$1$2') // $3 is EST/MDT/etc
      ;
  };
  Rrecur.swapOffset = function (date, locale) {
    return date
      .toString()
      .replace(/(.*)GMT.*$/g, '$1' + Rrecur.getOffsetFromLocale(locale))
      ;
  };

  function stringifyDateStr(str) {
    return str.replace(
      /(\d{4})-?(\d{2})-?(\d{2})T(\d{2}):?(\d{2}):?(\d{2})(?:\.\d+)?([-+Z]\d*)?(.*)/
    , "$1-$2-$3T$4:$5:$6$7$8"
    );
  }
  function stringifyRruleDate(v, forceZ) {
    if ('number' === typeof v) {
      v = Rrecur.toLocaleISOString(new Date(v), false);
    } else if ('object' === typeof v) {
      v = Rrecur.toLocaleISOString(v, false);
    }

    if (forceZ && !/Z/.test(v)) {
      if ('string' === typeof forceZ) {
        v = new Date(v + forceZ).toISOString();
      } else {
        v = v += 'Z';
      }
    }

    v = v
      .replace(/[\-+]\d{4}(\s \(\w{1,6}\))?$/, '')
      .replace(/\-|:/g, '')
      .replace(/\.\d+/, '')
      ;

    return v;
  }
  Rrecur.stringify = function (orig) {
    var pairs = []
      , lkeys
      , obj = {}
      ;

    Object.keys(orig).forEach(function (k) {
      obj[k] = orig[k];
    });

    if (obj.tzid) {
      console.error('[stringify] tzid not yet supported');
      //pairs.push('DTSTART;TZID' + '=' + obj.tzid + ':' + stringifyRruleDate(obj.dtstart));
      //delete obj.dtstart;
      //delete obj.tzid;
    }
    
    if (obj.dtstart) {
      if (localeWarn1) {
        console.warn('[stringify] falling back to non-standard locale definition for timezone');
        localeWarn1 = false;
      }

      if (obj.locale) {
        if (!/UTC/.test(obj.locale)) {
          pairs.push('DTSTART;LOCALE' + '=' + obj.locale + ':' + stringifyRruleDate(obj.dtstart));
          delete obj.dtstart;
        }
        delete obj.locale;
      }
    }

    // compensate for RRULE.js non-standardness
    // (although it does happen to make more sense than the standard)
    if (obj.byweekday) {
      console.warn('converting rrule.js obj.byweekday to rrule rfc obj.byday');
      obj.byday = obj.byweekday;
      delete obj.byweekday;
    }

    lkeys = Object.keys(obj);

    // http://www.ietf.org/rfc/rfc2445.txt
    // 4.3.10 Recurrence Rule
    lkeys.forEach(function (k) {
      var v
        , vs
        ;

      v = obj[k.toLowerCase()];
      k = k.toUpperCase();

      if (!v) {
        return;
      }

      if ('UNTIL' === k || 'DTSTART' === k) {
        v = stringifyRruleDate(v, Rrecur.getOffsetFromLocale(obj.locale || new Date()));
      }

      if (Array.isArray(v)) {
        vs = [];
        v.forEach(function (val) {
          if ('string' === typeof val) {
            val = val.toUpperCase();
          }
          vs.push(val);
        });
        v = vs;
      } else if ('string' === typeof v) {
        v = v.toUpperCase();
      }
      // if array, it'll join with ',' automatically
      pairs.push(k + '=' + v);
    });

    return pairs.join(';');
  };

  // TODO timezone support (in dtstart)? // -0400 +0530
  function defaults(freq, dtstart, rrule/*, tzoffset*/) {
    rrule = rrule || {};

    if ('object' !== typeof dtstart) {
      if ('string' === typeof dtstart) {
        dtstart = stringifyDateStr(dtstart);
      }
      dtstart = new Date(dtstart);
    }
    switch(freq) {
      case 'secondly':
        break;
      case 'minutely':
        if (!rrule.bysecond) {
          rrule.bysecond = [dtstart.getUTCSeconds()];
        }
        /* falls through */
      case 'hourly':
        if (!rrule.byminute) {
          rrule.byminute = [dtstart.getUTCMinutes()];
        }
        /* falls through */
      case 'daily':
        if (!rrule.byhour) {
          rrule.byhour = [dtstart.getUTCHours()];
        }
        /* falls through */
      case 'weekly':
        if (!rrule.byday) {
          rrule.byday = [Rrecur.weekdays[dtstart.getUTCDay()]];
        }
        /* falls through */
      case 'monthly':
        if (!rrule.bymonthday) {
          rrule.bymonthday = [dtstart.getUTCDate()];
        }
        /* falls through */
      case 'yearly':
        if (!rrule.bymonth) {
          rrule.bymonth = [dtstart.getUTCMonth() + 1];
        }
        /* falls through */
    }

    return rrule;
  }
  Rrecur.create = Rrecur;

  exports.Rrecur = Rrecur;
  exports.Rrecur.parse = parse;
  exports.Rrecur.parseDtstart = Rrecur.toRruleDateString;
  exports.Rrecur.weekdays = ['su','mo','tu','we','th','fr','sa','su']; // sunday is 0 and 7
  exports.Rrecur.dtstartDefaults = defaults;
}('undefined' !== typeof exports && exports || new Function('return this')()));
