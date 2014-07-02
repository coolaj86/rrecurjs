/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , origObj
    , ruleObj
    , ruleStr
    , _ = require('lodash')
    ;

  origObj = {
    freq: 'weekly'
  , interval: '2'
  //, dtstart: '2014-01-01T10:30:00Z' // beginning of year
  , dtstart: '2014-05-16T10:30:00.000' // a month ago
  , locale: 'GMT-0600 (MDT)'
  //, dtstart: '2014-07-16T10:30:00Z' // in the future
  , until: '2014-07-16T10:30:00.000Z'
  , byday: [ Rrecur.weekdays[2], Rrecur.weekdays[0] ]
  , wkst: 'su'
  };

  ruleStr = Rrecur.stringify(origObj);
  if ('DTSTART;LOCALE=GMT-0600 (MDT):20140516T103000;FREQ=WEEKLY;INTERVAL=2;UNTIL=20140716T103000Z;BYDAY=TU,SU;WKST=SU' !== ruleStr) {
    console.log('FAIL');
    console.log(ruleStr);
    return;
  }

  ruleObj = Rrecur.parse(ruleStr);
  if (!_.isEqual(origObj, ruleObj)) {
    console.log('FAIL');
    console.log('Original');
    console.log(origObj);
    console.log('Different');
    console.log(ruleObj);
    return;
  }

  console.log('PASS');
}('undefined' !== typeof exports && exports || new Function('return this')()));
