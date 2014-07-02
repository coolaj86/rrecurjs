'use strict';

var Rrecur = require('./rrecur-iterator').Rrecur
  , result
  ;

//console.log(new Date().toISOString());
//result = Rrecur.fromISOStringToLocale(new Date(), "-0400 (EDT)");
result = Rrecur.fromISOStringToZonelessLocale(new Date(), "-0400 (EDT)");
//console.log(result);

//console.log(new Date(result).toISOString());
//result = Rrecur.stripZone(result);
//console.log(result);

console.log('BLAH');
console.log(Rrecur.getLocaleFromGmtString(new Date().toString()));
console.log(Rrecur.getLocaleFromGmtString(new Date().toISOString()));
