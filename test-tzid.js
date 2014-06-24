/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , ruleObj
    , ruleStr
    ;

  // TODO https://github.com/coolaj86/rrecurjs/issues/5
  // http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  // http://www.timeanddate.com/library/abbreviations/timezones/na/mst.html
  // http://www.timeanddate.com/library/abbreviations/timezones/africa/
  ruleObj = {
    freq: 'weekly'
  , interval: '2'
  //, dtstart: '2014-01-01T10:30:00Z' // beginning of year
  , dtstart: '2014-05-16T10:30:00Z' // a month ago
  , tzid: 'US-Eastern'
  //, dtstart: '2014-07-16T10:30:00Z' // in the future
  , until: '2014-07-16T10:30:00Z'
  , byday: [ Rrecur.weekdays[2], Rrecur.weekdays[0] ]
  , wkst: 'su'
  };

  ruleStr = Rrecur.stringify(ruleObj);
  ruleObj = Rrecur.parse(ruleStr);
  console.log(ruleStr);
  console.log(ruleObj);
}('undefined' !== typeof exports && exports || new Function('return this')()));
