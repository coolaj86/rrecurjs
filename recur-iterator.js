/*jshint -W054 */
(function (exports) {
  'use strict';

  var Recur = exports.Recur || require('./recur').Recur
    , RRule
    , moment
    ;

  function addSubtract(m, rule, method, int) {
    var doubleInt = (rule.interval || 1) * int
      , d = m
      ;

    switch(rule.freq) {
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
  function add(m, rule) {
    return addSubtract(m, rule, 'add', 1);
  }

  function subtract(m, rule) {
    return addSubtract(m, rule, 'subtract', 1);
  }

  function getDtStart(m, ruleObj, method) {
    var d = moment(m)
      ;

    return addSubtract(d, ruleObj, method, 2);
  }

  Recur.create = Recur;
  Recur.prototype.init = function (thing) {
    RRule = RRule || exports.RRule || require('rrule').RRule;
    moment = moment || exports.moment || require('moment');

    if (!thing) {
      return;
    }

    var me = this
      ;

    me._firstTime = true;

    if ('string' === typeof thing) {
      me._rfcString = thing;
      me._rruleObj = Recur.parse(thing);
    } else {
      me._rfcString = Recur.stringify(thing);
      me._rruleObj = thing;
    }

    me._rule = {};
    Object.keys(me._rruleObj).forEach(function (key) {
      if (Array.isArray(me._rruleObj[key])) {
        me._rule[key] = me._rruleObj[key].slice(0);
      } else {
        me._rule[key] = me._rruleObj[key];
      }
    });

    me._m = moment();

    if (me._rule.count) {
      delete me._rule.count;
    }

    me._rrule = RRule.fromString(me._rfcString);
  };
  Recur.prototype.previous = function () {
    var me = this
      , date
      ;

    if (!me._rule.dtstart) {
      me._rule.dtstart = getDtStart(me._m, me._rule, 'subtract');
    }

    //subtract(me._m, me._rule);
    date = me._m.toDate();
    console.log('[debug]', date);
    date = me._rrule.before(date);
    me._m = moment(date);

    if (date && me._firstTime) {
      me._firstTime = false;
    }

    return me._m.toDate();
    /*
    me._m = moment(me._rrule.before(me._m.toDate()));
    return me._m.toDate();
    */
  };
  Recur.prototype.next = function () {
    var me = this
      , date
      ;

    /*
    if (!me._rule.until) {
      me._rule.until = getDtStart(me._m, me._rule, 'add');
    }
    */

    /*
    add(me._m, me._rule);
    //return me._rrule.after(me._m.toDate(), true);
    //*/

    date = me._m.toDate();
    me._m = moment(me._rrule.after(date, me._firstTime));

    if (me._firstTime) {
      me._firstTime = false;
    }
    return me._m.toDate();
  };

  exports.Recur = Recur;
}('undefined' !== typeof exports && exports || new Function('return this')()));
