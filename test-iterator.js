/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , ruleObj
    , recur
    , i
    ;

  ruleObj = {
    freq: 'weekly'
  , interval: '2'
  , dtstart: '2014-01-01T10:30:00Z'
  , byday: [ 'tu', 'su' ]
  , wkst: 'su'
  };

  recur = Rrecur.create(ruleObj);

  console.log(recur.previous());
  for (i = 0; i < 10; i += 1) {
    console.log(i, recur.next());
  }
}('undefined' !== typeof exports && exports || new Function('return this')()));
