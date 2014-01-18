/*jshint -W054 */
(function (exports) {
  'use strict';

  var keys
    ;

  keys = [
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
  ]
  ;

  function parseDate(vstr) {
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
      str += 'T' + m[5] + ':' + m[6] + ':' + m[7] + '.000Z';
    }

    return str;
  }

  // DTSTART is not part of RRULE
  function parse(str) {
    var pairs = str.split(';')
      , obj = {}
      ;

    pairs.forEach(function (pair) {
      var ps = pair.split('=')
        , k = ps[0]
        , vstr = ps[1]
        , v
        ;

      switch (k) {
      case 'UNTIL':
        v = parseDate(vstr);
        break;
      case 'FREQ':
      case 'WKST':
        v = vstr.toLowerCase();
        break;
      case 'INTERVAL':
      case 'COUNT':
        v = vstr;
        break;
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

  function stringify(obj) {
    var pairs = []
      , lkeys
      ;

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
        v = v.replace(/\-|:/g, '').replace(/\.\d+/, '');
      }

      if (Array.isArray(v)) {
        vs = [];
        v.forEach(function (val) {
          vs.push(val.toUpperCase());
        });
        v = vs;
      } else {
        v = v.toUpperCase();
      }
      // if array, it'll join with ',' automatically
      pairs.push(k + '=' + v);
    });

    return pairs.join(';');
  }

  exports.Recur = {};
  exports.Recur.parse = parse;
  exports.Recur.stringify = stringify;
}('undefined' !== typeof exports && exports || new Function('return this')()));
