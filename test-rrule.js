(function () {
  'use strict';

  var recur = require('./recur').Recur
    , RRule = require('rrule').RRule
    , moment = require('moment')
    , ruleObj
    , rfcString
    , rule
    , m = moment() // new Date()
    , before
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

  rfcString = recur.stringify(ruleObj);

  console.log(rfcString);
  rule = RRule.fromString(rfcString);
  before = rule.before(m.toDate());
  current = rule.after(m.toDate(), true);
  current2 = rule.after(m.toDate());

  if (current.toISOString() === current2.toISOString()) {
    next = rule.after(current);
  } else {
    next = current2;
  }

  console.log('Previous:', before);
  console.log('Current:', current);
  console.log('Next:', next);
}());
