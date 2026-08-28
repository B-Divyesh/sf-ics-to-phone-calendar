export const DEMO_ICS = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//ICS Rescue//Sample calendar//EN\r
BEGIN:VEVENT\r
SUMMARY:Neighborhood garden planning\r
DTSTART;TZID=Eastern Standard Time:20260902T183000\r
LOCATION:Maple Street greenhouse\r
DESCRIPTION:Choose autumn plots and share watering dates.\r
RRULE:FREQ=WEEKLY;COUNT=3\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:farmers-market@sample.local\r
SUMMARY:Farmers market pickup\r
DTSTART;VALUE=DATE:20260905\r
DTEND;VALUE=DATE:20260906\r
LOCATION:Riverside market\r
END:VEVENT\r
BEGIN:VEVENT\r
UID:school-concert@sample.local\r
SUMMARY:School concert\r
DTSTART:20260910T180000Z\r
DTEND:20260910T193000Z\r
DESCRIPTION:Doors open at 5:30. Bring the paper tickets.\r
URL:https://example.com/concert-details\r
END:VEVENT\r
END:VCALENDAR\r
`;
