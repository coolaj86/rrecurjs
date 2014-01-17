(function () {
  'use strict';

  var fs = require('fs')
    , recur = require('./recur').Recur
    , strs
    ;

  strs = fs.readFileSync('./rfc2445-examples.txt', 'utf8').trim().split('\n');
  //strs = fs.readFileSync('./ical-examples.txt', 'utf8').trim().split('\n');
  strs.forEach(function (str) {
    var obj
      , rule
      ;

    obj = recur.parse(str);
    rule = recur.stringify(obj);

    if (rule !== str) {
      console.log(str);
      console.log(rule);
      console.log(obj);
    } else {
      //console.log(rule === str);
      console.log(rule);
    }
  });
}());
