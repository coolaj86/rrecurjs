/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , ruleObj
    , recur
    , i
    , prev
    ;

  ruleObj = {
    freq: 'weekly'
  , interval: '2'
  //, dtstart: '2014-01-01T10:30:00Z' // beginning of year
  , dtstart: '2014-05-16T10:30:00' // a month ago
  , locale: 'GMT-0400 (EDT)'
  //, tzid: "america/new-york"
  //, dtstart: '2014-07-16T10:30:00Z' // in the future
  , until: '2014-07-16T10:30:00Z'
  , byday: [ 'tu', 'su' ]
  , wkst: 'su'
  };

  recur = Rrecur.create(ruleObj, new Date('2014-06-22T10:30:00-0400'));

  console.log('prev', recur.previous());
  /*
  do (prev = recur.previous()) {
    console.log('prev', prev);
  } while()
  */
  for (i = 0; i < 10; i += 1) {
    console.log(i, recur.next());
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
