'use strict';

var moment = require('moment')
  ;

function parseOffset(offset) {
  var parts = offset.match(/([-+])(\d{2})(\d{2})/)
    , sign = parseInt(parts[1] + '1', 10)
    , hours = parseInt(parts[2], 10)
    , minutes = parseInt(parts[3], 10) / 60
    ;

  return sign * (hours + minutes);
}

function padOffset(n) {
  n = n.toString();
  while (n.length < 2) {
    n = '0' + '' + n;
  }
  return n;
}

function stringifyOffset(offset) {
  var parts = offset.toString().match(/(-)?(\d+)(\.\d+)?/)
    , sign = parts[1] || '+'
    , hours = padOffset(parts[2])
    , minutes = padOffset((parseInt(parts[3] || 0, 10) * 60)) 
    ;

  return sign + '' + hours + '' + minutes;
}

function commandifyOffset(offset) {
  var parts = offset.toString().match(/(-)?(\d+)(\.\d+)?/)
    , sign = parts[1] || '+'
    , hours = parseInt(parts[2] || 0, 10)
    , minutes = parseInt(parts[3] || 0, 10) * 60
    ;

  //console.log(stringifyOffset(offset));
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

  //console.log(directive);
  m[directive.operation](directive.hours, 'hours');
  m[directive.operation](directive.minutes, 'minutes');

  return m;
}

var m = moment(new Date());
console.log(m.format());
diffOffsets(m, "-0600", "-0400");
console.log(m.format());
console.log(m.toDate());
console.log(m.zone("-0400").format());
console.log(m.toDate());
