export type CalendarDate = {
  raw: string;
  allDay: boolean;
  tzid?: string;
};

export type CalendarEvent = {
  uid: string;
  summary: string;
  start: CalendarDate;
  end: CalendarDate;
  location: string;
  description: string;
  url: string;
  rrule?: string;
  sourceLines: string[];
  timezoneBlocks: string[][];
  repairs: string[];
};

export type ParsedCalendar = {
  events: CalendarEvent[];
  repairs: string[];
  fixedIcs: string;
};

type Property = {
  name: string;
  params: Record<string, string>;
  value: string;
  raw: string;
};

const WINDOWS_ZONES: Record<string, string> = {
  'Eastern Standard Time': 'America/New_York',
  'Central Standard Time': 'America/Chicago',
  'Mountain Standard Time': 'America/Denver',
  'Pacific Standard Time': 'America/Los_Angeles',
  'GMT Standard Time': 'Europe/London',
  'W. Europe Standard Time': 'Europe/Berlin',
  'India Standard Time': 'Asia/Kolkata',
  'Tokyo Standard Time': 'Asia/Tokyo',
  'AUS Eastern Standard Time': 'Australia/Sydney',
};

function unfold(input: string): string[] {
  return input
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .reduce<string[]>((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length) lines[lines.length - 1] += line.slice(1);
      else lines.push(line);
      return lines;
    }, [])
    .filter((line, index, all) => line.length > 0 || (index > 0 && index < all.length - 1));
}

function splitHeader(line: string): [string, string] | null {
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === '"') quoted = !quoted;
    if (line[i] === ':' && !quoted) return [line.slice(0, i), line.slice(i + 1)];
  }
  return null;
}

function parseProperty(line: string): Property | null {
  const parts = splitHeader(line);
  if (!parts) return null;
  const [header, value] = parts;
  const segments = header.split(';');
  const name = (segments.shift() ?? '').toUpperCase();
  const params: Record<string, string> = {};
  for (const segment of segments) {
    const equal = segment.indexOf('=');
    if (equal > 0) params[segment.slice(0, equal).toUpperCase()] = segment.slice(equal + 1).replace(/^"|"$/g, '');
  }
  return { name, params, value, raw: line };
}

function textValue(value = ''): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function escapeText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function validIanaZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone }).format();
    return true;
  } catch {
    return false;
  }
}

function repairZone(zone: string): { zone?: string; changed: boolean } {
  const clean = zone.replace(/^\/(?:mozilla\.org\/[^/]+\/)?/, '');
  if (validIanaZone(clean)) return { zone: clean, changed: clean !== zone };
  const mapped = WINDOWS_ZONES[zone];
  return { ...(mapped ? { zone: mapped } : {}), changed: true };
}

function normalizeDate(prop: Property, repairs: string[]): CalendarDate {
  const raw = prop.value.trim();
  const allDay = prop.params.VALUE?.toUpperCase() === 'DATE' || /^\d{8}$/.test(raw);
  let tzid: string | undefined = prop.params.TZID;
  if (tzid) {
    const repaired = repairZone(tzid);
    if (repaired.changed) {
      repairs.push(repaired.zone
        ? `Changed time zone “${tzid}” to “${repaired.zone}”.`
        : `Removed the unrecognized time zone “${tzid}”; review this event’s local time before saving.`);
      tzid = repaired.zone;
    }
  }
  if (!/^\d{8}(T\d{6}Z?)?$/.test(raw)) throw new Error(`A date has an unsupported value: ${raw || 'empty'}.`);
  const [year, month, day, hour, minute, second] = parts(raw);
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) {
    throw new Error(`A date is not valid: ${raw}. Check the day and time in the source invite.`);
  }
  return { raw, allDay, ...(tzid ? { tzid } : {}) };
}

function parts(raw: string): number[] {
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!match) throw new Error(`Invalid date: ${raw}.`);
  return match.slice(1).map((part) => Number(part || 0));
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function dateToRaw(date: Date, allDay: boolean, utc = false): string {
  const get = (unit: 'FullYear' | 'Month' | 'Date' | 'Hours' | 'Minutes' | 'Seconds') =>
    date[`get${utc ? 'UTC' : ''}${unit}` as keyof Date] as () => number;
  const y = get('FullYear').call(date);
  const m = get('Month').call(date) + 1;
  const d = get('Date').call(date);
  if (allDay) return `${y}${pad(m)}${pad(d)}`;
  return `${y}${pad(m)}${pad(d)}T${pad(get('Hours').call(date))}${pad(get('Minutes').call(date))}${pad(get('Seconds').call(date))}${utc ? 'Z' : ''}`;
}

function addDefaultEnd(start: CalendarDate): CalendarDate {
  const [year, month, day, hour, minute, second] = parts(start.raw);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  value.setUTCMinutes(value.getUTCMinutes() + (start.allDay ? 24 * 60 : 60));
  return { ...start, raw: dateToRaw(value, start.allDay, start.raw.endsWith('Z')) };
}

function parseDuration(value: string): number | null {
  const match = value.match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (!match) return null;
  return ((Number(match[1] ?? 0) * 7 + Number(match[2] ?? 0)) * 86400 + Number(match[3] ?? 0) * 3600 + Number(match[4] ?? 0) * 60 + Number(match[5] ?? 0)) * 1000;
}

function endFromDuration(start: CalendarDate, duration: string): CalendarDate | null {
  const milliseconds = parseDuration(duration);
  if (milliseconds === null) return null;
  const [year, month, day, hour, minute, second] = parts(start.raw);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute, second) + milliseconds);
  return { ...start, raw: dateToRaw(value, start.allDay, start.raw.endsWith('Z')) };
}

function fold(line: string): string {
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  chunks.push(rest);
  return chunks.join('\r\n');
}

function serializeDate(name: string, date: CalendarDate): string {
  const params = date.allDay ? ';VALUE=DATE' : date.tzid && !date.raw.endsWith('Z') ? `;TZID=${date.tzid}` : '';
  return `${name}${params}:${date.raw}`;
}

function serializeEvent(event: CalendarEvent): string[] {
  const ignored = new Set(['BEGIN', 'END', 'DTSTART', 'DTEND', 'DURATION', 'SUMMARY', 'UID', 'LOCATION', 'DESCRIPTION', 'URL', 'RRULE']);
  const preserved: string[] = [];
  let nestedDepth = 0;
  for (const line of event.sourceLines) {
    const property = parseProperty(line);
    if (!property) continue;
    if (nestedDepth > 0 || property.name === 'BEGIN') {
      preserved.push(line);
      if (property.name === 'BEGIN') nestedDepth += 1;
      if (property.name === 'END') nestedDepth -= 1;
    } else if (!ignored.has(property.name)) preserved.push(line);
  }
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeText(event.uid)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    serializeDate('DTSTART', event.start),
    serializeDate('DTEND', event.end),
  ];
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  if (event.rrule) lines.push(`RRULE:${event.rrule}`);
  lines.push(...preserved, 'END:VEVENT');
  return lines;
}

function serializeCalendar(events: CalendarEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sociobot//ICS Rescue//EN', 'CALSCALE:GREGORIAN'];
  const neededZones = new Set(events.flatMap((event) => [event.start.tzid, event.end.tzid]).filter(Boolean));
  const seenZones = new Set<string>();
  for (const block of events.flatMap((event) => event.timezoneBlocks)) {
    const tzid = block.map(parseProperty).find((property) => property?.name === 'TZID')?.value;
    if (tzid && neededZones.has(tzid) && !seenZones.has(tzid)) {
      lines.push(...block);
      seenZones.add(tzid);
    }
  }
  for (const event of events) lines.push(...serializeEvent(event));
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

export function parseCalendar(input: string): ParsedCalendar {
  if (!input.trim()) throw new Error('Paste calendar text or choose an .ics file first.');
  if (new Blob([input]).size > 2 * 1024 * 1024) throw new Error('That calendar is over 2 MB. Choose a smaller file.');
  const lines = unfold(input);
  const hasCalendar = lines.some((line) => line.toUpperCase() === 'BEGIN:VCALENDAR');
  if (!hasCalendar) throw new Error('This does not look like an ICS calendar. It needs BEGIN:VCALENDAR.');

  const blocks: string[][] = [];
  const timezoneBlocks: string[][] = [];
  let current: string[] | null = null;
  let currentTimezone: string[] | null = null;
  for (const line of lines) {
    if (line.toUpperCase() === 'BEGIN:VTIMEZONE') currentTimezone = [line];
    else if (currentTimezone) {
      currentTimezone.push(line);
      if (line.toUpperCase() === 'END:VTIMEZONE') {
        timezoneBlocks.push(currentTimezone);
        currentTimezone = null;
      }
    } else if (line.toUpperCase() === 'BEGIN:VEVENT') current = [];
    else if (line.toUpperCase() === 'END:VEVENT' && current) {
      blocks.push(current);
      current = null;
    } else if (current) current.push(line);
  }
  if (current) throw new Error('An event is incomplete: END:VEVENT is missing.');
  if (!blocks.length) throw new Error('No events were found in this calendar.');
  if (blocks.length > 100) throw new Error('This calendar has more than 100 events. Split it into smaller files first.');

  const globalRepairs: string[] = [];
  if (input.includes('\n') && !input.includes('\r\n')) globalRepairs.push('Normalized line endings for calendar apps.');
  const events = blocks.map((sourceLines, index): CalendarEvent => {
    const properties: Property[] = [];
    let nestedDepth = 0;
    for (const line of sourceLines) {
      const property = parseProperty(line);
      if (!property) continue;
      if (property.name === 'BEGIN') nestedDepth += 1;
      else if (property.name === 'END') nestedDepth = Math.max(0, nestedDepth - 1);
      else if (nestedDepth === 0) properties.push(property);
    }
    const first = (name: string) => properties.find((property) => property.name === name);
    const repairs: string[] = [];
    const startProperty = first('DTSTART');
    if (!startProperty) throw new Error(`Event ${index + 1} has no start date.`);
    const start = normalizeDate(startProperty, repairs);
    const endProperty = first('DTEND');
    const duration = first('DURATION')?.value;
    let end = endProperty ? normalizeDate(endProperty, repairs) : duration ? endFromDuration(start, duration) : null;
    if (!end) {
      end = addDefaultEnd(start);
      repairs.push(`Added a missing end (${start.allDay ? 'next day' : 'one hour later'}).`);
    }
    if (wallTimeToDate(end).getTime() <= wallTimeToDate(start).getTime()) {
      end = addDefaultEnd(start);
      repairs.push(`Replaced an end time that was not after the start (${start.allDay ? 'next day' : 'one hour later'}).`);
    }
    const uid = textValue(first('UID')?.value) || `event-${index + 1}-${hash(sourceLines.join('\n'))}@ics-rescue.local`;
    if (!first('UID')) repairs.push('Added a stable event ID.');
    const summary = textValue(first('SUMMARY')?.value) || 'Untitled event';
    if (!first('SUMMARY')) repairs.push('Named an untitled event.');
    return {
      uid,
      summary,
      start,
      end,
      location: textValue(first('LOCATION')?.value),
      description: textValue(first('DESCRIPTION')?.value),
      url: first('URL')?.value ?? '',
      rrule: first('RRULE')?.value,
      sourceLines,
      timezoneBlocks,
      repairs,
    };
  });
  const repairCount = events.reduce((count, event) => count + event.repairs.length, 0);
  if (!repairCount && !globalRepairs.length) globalRepairs.push('Checked the calendar structure; no repairs were needed.');
  return { events, repairs: globalRepairs, fixedIcs: serializeCalendar(events) };
}

function hash(value: string): string {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return (result >>> 0).toString(36);
}

function wallTimeToDate(date: CalendarDate): Date {
  const [year, month, day, hour, minute, second] = parts(date.raw);
  if (date.raw.endsWith('Z')) return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (!date.tzid) return new Date(year, month - 1, day, hour, minute, second);
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: date.tzid,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  });
  for (let i = 0; i < 3; i += 1) {
    const got = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((item) => [item.type, item.value]));
    const represented = Date.UTC(Number(got.year), Number(got.month) - 1, Number(got.day), Number(got.hour), Number(got.minute), Number(got.second));
    guess += Date.UTC(year, month - 1, day, hour, minute, second) - represented;
  }
  return new Date(guess);
}

export function displayDate(date: CalendarDate, locale = navigator.language): string {
  const value = wallTimeToDate(date);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    ...(date.allDay ? {} : { hour: 'numeric', minute: '2-digit', timeZone: date.tzid }),
  }).format(value);
}

export function googleUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${event.start.raw.replace(/Z$/, 'Z')}/${event.end.raw.replace(/Z$/, 'Z')}`,
  });
  if (event.start.tzid && !event.start.raw.endsWith('Z')) params.set('ctz', event.start.tzid);
  if (event.location) params.set('location', event.location);
  const details = [event.description, event.url].filter(Boolean).join('\n\n');
  if (details) params.set('details', details);
  if (event.rrule) params.set('recur', `RRULE:${event.rrule}`);
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function outlookUrl(event: CalendarEvent): string {
  const format = (value: CalendarDate) => value.allDay
    ? `${value.raw.slice(0, 4)}-${value.raw.slice(4, 6)}-${value.raw.slice(6, 8)}`
    : wallTimeToDate(value).toISOString();
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.summary,
    startdt: format(event.start),
    enddt: format(event.end),
  });
  if (event.start.allDay) params.set('allday', 'true');
  if (event.location) params.set('location', event.location);
  if (event.description) params.set('body', event.description);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

export function eventIcs(event: CalendarEvent): string {
  return serializeCalendar([event]);
}
