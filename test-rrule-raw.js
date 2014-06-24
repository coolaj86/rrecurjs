(function () {
  'use strict';

  var Rrecur = require('./rrecur').Rrecur
    , RRule = require('rrule').RRule
    , moment = require('moment')
    , ruleObj
    , rfcString
    , rrule
    , m = moment(new Date('2014-06-16T10:30:00.000-0600')) // new Date()
    , previous
    , current
    , current2
    , next
    ;

  ruleObj = {
    freq: 'weekly'
  , interval: '2'
  , byday: [ 'tu', 'su' ]
  , wkst: 'su'
  };

  if (ruleObj.count) {
    delete ruleObj.count;
  }

  function getDtStart(ruleObj, method) {
    var doubleInt
      , d = moment(m)
      ;

    doubleInt = (ruleObj.interval || 1) * 2;

    switch(ruleObj.freq) {
    case 'yearly':
      d[method](doubleInt, 'years');
      break;
    case 'monthly':
      d[method](doubleInt, 'months');
      break;
    case 'weekly':
      d[method](doubleInt, 'weeks');
      break;
    case 'daily':
      d[method](doubleInt, 'days');
      break;
    case 'hourly':
      d[method](doubleInt, 'hours');
      break;
    case 'minutely':
      d[method](doubleInt, 'minutes');
      break;
    case 'secondly':
      d[method](doubleInt, 'seconds');
      break;
    }

    return d.toDate().toISOString();
  }

  if (!ruleObj.dtstart) {
    ruleObj.dtstart = getDtStart(ruleObj, 'subtract');
  }
  if (!ruleObj.until) {
    ruleObj.until = getDtStart(ruleObj, 'add');
  }

  rfcString = Rrecur.stringify(ruleObj);

  console.log(rfcString);
  rrule = RRule.fromString(rfcString);
  previous = rrule.before(m.toDate());
  current = rrule.after(m.toDate(), true);
  current2 = rrule.after(m.toDate());

  if (current.toISOString() === current2.toISOString()) {
    next = rrule.after(current);
  } else {
    next = current2;
  }

  console.log('Previous:', previous);
  console.log('Current:', current);
  console.log('Next:', next);
}());
