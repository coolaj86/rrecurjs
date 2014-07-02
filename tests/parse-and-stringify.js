(function () {
  'use strict';

  var fs = require('fs')
    , recur = require('./rrecur').Rrecur
    , strs
    , pass = true
    ;

  strs = fs.readFileSync('./rfc2445-examples.txt', 'utf8').trim().split('\n');
  strs.push('RRULE:FREQ=YEARLY;UNTIL=20000131T090000Z;BYMONTH=1;BYDAY=SU,MO,TU,WE,TH,FR,SA');
  //strs = fs.readFileSync('./ical-examples.txt', 'utf8').trim().split('\n');

  strs.forEach(function (str) {
    var obj
      , rule
      ;

    obj = recur.parse(str);
    rule = recur.stringify(obj);

    if (rule !== str.replace(/^R?RULE:/, '')) {
      pass = false;
      console.warn('WARN');
      console.log(str);
      console.log(rule);
      console.log(obj);
    } else {
      //console.log(rule === str);
      //console.log('PASS:', rule);
    }
  });

  if (pass) {
    console.log('PASS');
  }
}());
