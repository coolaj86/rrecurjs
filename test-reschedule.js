/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , sched
    , recur
    , nexttime
    ;

  sched = {
    today: '2014-07-01T10:47:00-0600'
  , dtstart: {
      zoneless: '2014-06-16T16:30:00'
    , locale: 'GMT-0400 (EDT)'
    }
  , rrule: {
      freq: 'weekly'
    , interval: '1'
    //, tzid: "america/new-york"
    , until: '2014-07-16T10:30:00Z'
    , byday: [ 'tu', 'su' ]
    , wkst: 'su'
    }
  };

  console.log('[TDY]', new Date(sched.today));
  recur = Rrecur.create(sched.rrule, sched.today, sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[NXT]', new Date(nexttime), '\n');

  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[NXT]', new Date(nexttime), '\n');

  nexttime = new Date(new Date(nexttime).valueOf() + (10 * 1000));
  recur = Rrecur.create(sched.rrule, new Date(nexttime), sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[NXT]', new Date(nexttime), '\n');

  nexttime = new Date(new Date(nexttime).valueOf() + (10 * 1000));
  recur = Rrecur.create(sched.rrule, new Date(nexttime), sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[NXT]', new Date(nexttime), '\n');

}('undefined' !== typeof exports && exports || new Function('return this')()));
