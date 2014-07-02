'use strict';

var Rrecur = require('../rrecur-iterator').Rrecur
  , m
  ;

console.log('[LCL]', new Date('2014-07-01T18:30:00Z').toString());
console.log('[UTC] 2014-07-01T18:30:00Z');
m = Rrecur.utcToOffset('2014-07-01T18:30:00Z', 'GMT-0700 (PDT)');
console.log('[PDT]', m);
m = Rrecur.utcToOffset('2014-07-01T18:30:00Z', 'GMT-0700 (PDT)', true);
console.log('[PDT]', m);

console.log('\n');
console.log('shed.dtstart.locale (full) to zoneless, locale');
m = Rrecur.toZonelessLocaleISOString(
  new Date('Tue Jul 01 2014 10:47:35 GMT-0700 (PDT)')
, 'Tue Jul 01 2014 10:47:35 GMT-0700 (PDT)'
);
console.log(m);
