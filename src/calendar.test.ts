import { describe, expect, it } from 'vitest';
import { displayDate, eventIcs, googleUrl, outlookUrl, parseCalendar } from './calendar';

const base = (body: string) => `BEGIN:VCALENDAR\nVERSION:2.0\n${body}\nEND:VCALENDAR`;

describe('parseCalendar', () => {
  it('repairs a minimal LF-only event with no end or UID', () => {
    const parsed = parseCalendar(base('BEGIN:VEVENT\nSUMMARY:Lunch\nDTSTART:20260901T120000Z\nEND:VEVENT'));
    expect(parsed.events).toHaveLength(1);
    expect(parsed.events[0].end.raw).toBe('20260901T130000Z');
    expect(parsed.events[0].uid).toContain('@ics-rescue.local');
    expect(parsed.events[0].repairs).toContain('Added a missing end (one hour later).');
    expect(parsed.fixedIcs).toContain('DTEND:20260901T130000Z\r\n');
    expect(parsed.fixedIcs).not.toMatch(/(?<!\r)\n/);
  });

  it('adds one day to an all-day event', () => {
    const parsed = parseCalendar(base('BEGIN:VEVENT\nDTSTART;VALUE=DATE:20261231\nSUMMARY:New year\nEND:VEVENT'));
    expect(parsed.events[0].end.raw).toBe('20270101');
    expect(eventIcs(parsed.events[0])).toContain('DTEND;VALUE=DATE:20270101');
  });

  it('maps a common Windows time zone and carries it into Google', () => {
    const parsed = parseCalendar(base([
      'BEGIN:VEVENT',
      'UID:1@example.com',
      'SUMMARY:Breakfast',
      'DTSTART;TZID=Eastern Standard Time:20261002T090000',
      'DTEND;TZID=Eastern Standard Time:20261002T100000',
      'END:VEVENT',
    ].join('\n')));
    const event = parsed.events[0];
    expect(event.start.tzid).toBe('America/New_York');
    expect(event.repairs[0]).toContain('America/New_York');
    expect(new URL(googleUrl(event)).searchParams.get('ctz')).toBe('America/New_York');
    expect(new URL(outlookUrl(event)).searchParams.get('startdt')).toBe('2026-10-02T13:00:00.000Z');
  });

  it('unfolds escaped text and preserves recurrence', () => {
    const parsed = parseCalendar(base([
      'BEGIN:VEVENT',
      'UID:weekly@example.com',
      'SUMMARY:Garden\\, weekly',
      'DESCRIPTION:Bring gloves and',
      ' water',
      'DTSTART:20260903T170000Z',
      'DTEND:20260903T180000Z',
      'RRULE:FREQ=WEEKLY;COUNT=4',
      'END:VEVENT',
    ].join('\n')));
    expect(parsed.events[0].summary).toBe('Garden, weekly');
    expect(parsed.events[0].description).toBe('Bring gloves andwater');
    expect(new URL(googleUrl(parsed.events[0])).searchParams.get('recur')).toBe('RRULE:FREQ=WEEKLY;COUNT=4');
  });

  it('reads multiple events and formats a known UTC date', () => {
    const parsed = parseCalendar(base([
      'BEGIN:VEVENT', 'UID:a', 'SUMMARY:A', 'DTSTART:20260827T120000Z', 'DTEND:20260827T130000Z', 'END:VEVENT',
      'BEGIN:VEVENT', 'UID:b', 'SUMMARY:B', 'DTSTART:20260828T120000Z', 'DTEND:20260828T130000Z', 'END:VEVENT',
    ].join('\n')));
    expect(parsed.events).toHaveLength(2);
    expect(displayDate(parsed.events[0].start, 'en-US')).toContain('Aug 27, 2026');
  });

  it('rejects non-calendars, empty calendars, and incomplete events', () => {
    expect(() => parseCalendar('hello')).toThrow('BEGIN:VCALENDAR');
    expect(() => parseCalendar(base('METHOD:PUBLISH'))).toThrow('No events');
    expect(() => parseCalendar(base('BEGIN:VEVENT\nSUMMARY:Lost'))).toThrow('END:VEVENT');
    expect(() => parseCalendar(base('BEGIN:VEVENT\nDTSTART:20261340T250000Z\nEND:VEVENT'))).toThrow('not valid');
  });

  it('flags an unknown time zone and repairs an impossible end', () => {
    const parsed = parseCalendar(base([
      'BEGIN:VEVENT', 'SUMMARY:Review me',
      'DTSTART;TZID=Mars/Olympus:20260827T120000',
      'DTEND;TZID=Mars/Olympus:20260827T110000', 'END:VEVENT',
    ].join('\n')));
    expect(parsed.events[0].start.tzid).toBeUndefined();
    expect(parsed.events[0].end.raw).toBe('20260827T130000');
    expect(parsed.events[0].repairs.join(' ')).toContain('review this event’s local time');
    expect(parsed.events[0].repairs.join(' ')).toContain('not after the start');
  });

  it('keeps embedded time-zone definitions and complete alarms', () => {
    const parsed = parseCalendar(base([
      'BEGIN:VTIMEZONE', 'TZID:America/New_York', 'BEGIN:STANDARD',
      'DTSTART:19701101T020000', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500',
      'END:STANDARD', 'END:VTIMEZONE',
      'BEGIN:VEVENT', 'UID:alarm@example.com', 'SUMMARY:Wake up',
      'DTSTART;TZID=America/New_York:20261102T070000',
      'DTEND;TZID=America/New_York:20261102T073000',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Wake up', 'TRIGGER:-PT10M', 'END:VALARM',
      'END:VEVENT',
    ].join('\n')));
    expect(parsed.fixedIcs).toContain('BEGIN:VTIMEZONE\r\nTZID:America/New_York');
    expect(parsed.fixedIcs).toContain('BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Wake up\r\nTRIGGER:-PT10M\r\nEND:VALARM');
  });
});
