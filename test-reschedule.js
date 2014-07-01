/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , ruleObj
    , recur
    , nexttime
    , nextnext
    ;

  ruleObj = {
    freq: 'weekly'
  , interval: '2'
  , dtstart: '2014-05-16T10:30:00' // a month ago
  , locale: 'GMT-0400 (EDT)'
  //, tzid: "america/new-york"
  , until: '2014-07-16T10:30:00Z'
  , byday: [ 'tu', 'su' ]
  , wkst: 'su'
  };

  console.log('nexttime');
  recur = Rrecur.create(ruleObj, new Date());
  nexttime = recur.next();
  console.log(nexttime);

  console.log('nexttime');
  recur = Rrecur.create(ruleObj, new Date(nexttime));
  nextnext = recur.next();
  if (nextnext === nexttime) {
    nexttime = recur.next();
  } else {
    nexttime = nextnext;
  }
  console.log(nexttime);
}('undefined' !== typeof exports && exports || new Function('return this')()));
