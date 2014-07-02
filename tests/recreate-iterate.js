/*jshint -W054 */
(function (exports) {
  'use strict';

  var Rrecur = exports.Rrecur || require('./rrecur-iterator').Rrecur
    , sched
    , recur
    , nexttime
    , today = '2014-07-01T10:47:00-0600'
    ;

  sched = {
    dtstart: {
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

  console.log('[TDY]', new Date(today), '\n');
  recur = Rrecur.create(sched);
  //recur = Rrecur.create(sched.rrule, today, sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[SRV]', new Date(nexttime), '\n');

  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[SRV]', new Date(nexttime), '\n');

  nexttime = new Date(new Date(nexttime).valueOf() + (10 * 1000));
  recur = Rrecur.create(sched, new Date(nexttime), false);
  //recur = Rrecur.create(sched.rrule, new Date(nexttime), sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[SRV]', new Date(nexttime), '\n');

  nexttime = new Date(new Date(nexttime).valueOf() + (10 * 1000));
  recur = Rrecur.create(sched.rrule, new Date(nexttime), sched.dtstart.zoneless, sched.dtstart.locale);
  nexttime = recur.next();
  console.log('[NXT]', nexttime);
  console.log('[SRV]', new Date(nexttime), '\n');

/* EXPECTED OUTPUT
[TDY] Tue Jul 01 2014 10:47:00 GMT-0600 (MDT)

[NXT] 2014-07-01T14:30:00.000-0400
[SRV] Tue Jul 01 2014 12:30:00 GMT-0600 (MDT)

[NXT] 2014-07-06T14:30:00.000-0400
[SRV] Sun Jul 06 2014 12:30:00 GMT-0600 (MDT)

[NXT] 2014-07-08T14:30:00.000-0400
[SRV] Tue Jul 08 2014 12:30:00 GMT-0600 (MDT)

[NXT] 2014-07-13T14:30:00.000-0400
[SRV] Sun Jul 13 2014 12:30:00 GMT-0600 (MDT)
*/

}('undefined' !== typeof exports && exports || new Function('return this')()));
