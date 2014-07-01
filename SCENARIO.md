Actors

  * Server in Provo, UT - example.com
  * Browser in Albany, NY - Fred
  * Time as represented by UTC - Father Time

It's 9:47am on July 1st, 2014 in the quaint little town of Provo, Ut.

example.com has just booted up on this happy day and is looking forward to
a full day of requests.

So this is the current time:

  * 2014-07-01T10:47:35.000-0600 / Tue Jul 01 2014 10:47:35 GMT-0600 (MDT)
  * 2014-07-01T12:47:35.000-0400 / Tue Jul 01 2014 12:47:35 GMT-0400 (EDT)
  * 2014-07-01T16:47:35.000-0000 / Tue Jul 01 2014 16:47:35 GMT-0000 (UTC)

Fred wants to set a reminder that goes off at 2:30pm MO, WE, FR each week for the next two weeks.

Here's what freds browser will send to example.com:

```javascript
{
  dtstart: {
    zoneless: "2014-07-02T14:30:00"
  //, utc: "2014-07-02T18:30:00.000Z"
  //, locale: "Tue Jul 01 2014 14:30:00 GMT-0400 (EDT)"
    , locale: "GMT-0400 (EDT)"
//, tzid: "America/New_York" // not implemented yet
, rrule: {
    freq: 'weekly'
  , byday: ['mo', 'we', 'fr']
  , wkst: 'su'
  , until: '2014-07-16T10:30:00Z'
  }
}
```

`dtstart` MUST have both TIME and ZONE information
  * ISO zoneless + locale (no zone indication given, but in the local time of the alarm)
  * ISO UTC + locale (will be reinterpreted according to locale)
  * locale (will be parsed into two parts)

`locale` MUST be a locale string or (for the sake of simplicity) a time string
  * `GMT-0400 (EDT)`
  * `Tue Jul 01 2014 10:47:35 GMT-0600 (MDT)`

`until` MUST be a string specified in UTC

This is where the story gets complicated. `rrule.js`, which interprets the iCal rrule,
only works in server time. `reschedule.js` uses `moment.js` and its own string manipulation
magic to work around these limitations.

example.com, therefore, has to fake a time object that is adjusted two hours ahead of its time
so that it can find out when the schedule will next fire in Fred's time.

Afterwards example.com has to adjust the time back to its own timezone and, finally, into UTC
so that it can be searched in the database.

The occurences of Fred's schedule will be:

What a day!
