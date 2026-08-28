import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import jsQR from 'jsqr';
import { parseCalendar } from '../src/calendar';

const demoUrl = 'http://127.0.0.1:4173/?demo=1';

async function downloadedText(download: import('@playwright/test').Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('The browser did not expose the downloaded file.');
  return readFile(path, 'utf8');
}

test('@claim:calendar-outputs creates working calendar files and provider links', async ({ page }) => {
  await page.addInitScript(() => {
    const createObjectUrl = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (object: Blob | MediaSource) => {
      (window as Window & { __downloadMime?: string }).__downloadMime = object instanceof Blob ? object.type : '';
      return createObjectUrl(object);
    };
  });
  await page.goto(demoUrl);
  await expect(page.locator('.event-card')).toHaveCount(3);

  const appleDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ICS for Apple' }).first().click();
  const apple = await appleDownload;
  expect(apple.suggestedFilename()).toBe('neighborhood-garden-planning.ics');
  const appleIcs = await downloadedText(apple);
  expect(await page.evaluate(() => (window as Window & { __downloadMime?: string }).__downloadMime)).toBe('text/calendar;charset=utf-8');
  expect(parseCalendar(appleIcs).events).toHaveLength(1);
  expect(appleIcs).toContain('SUMMARY:Neighborhood garden planning\r\n');
  expect(appleIcs).toContain('RRULE:FREQ=WEEKLY;COUNT=3\r\n');

  const google = new URL(await page.locator('a.google').first().getAttribute('href') ?? '');
  expect(google.origin).toBe('https://calendar.google.com');
  expect(google.searchParams.get('text')).toBe('Neighborhood garden planning');
  expect(google.searchParams.get('ctz')).toBe('America/New_York');
  expect(google.searchParams.get('location')).toBe('Maple Street greenhouse');
  expect(google.searchParams.get('recur')).toBe('RRULE:FREQ=WEEKLY;COUNT=3');

  const outlook = new URL(await page.locator('a.outlook').first().getAttribute('href') ?? '');
  expect(outlook.origin).toBe('https://outlook.live.com');
  expect(outlook.searchParams.get('subject')).toBe('Neighborhood garden planning');
  expect(outlook.searchParams.get('startdt')).toBe('2026-09-02T22:30:00.000Z');
  expect(outlook.searchParams.get('enddt')).toBe('2026-09-02T23:30:00.000Z');
  expect(outlook.searchParams.get('location')).toBe('Maple Street greenhouse');
  expect(outlook.searchParams.get('body')).toBe('Choose autumn plots and share watering dates.');
  expect(outlook.searchParams.has('recur')).toBe(false);

  const allDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ICS' }).click();
  const allIcs = await downloadedText(await allDownload);
  expect(parseCalendar(allIcs).events).toHaveLength(3);
  expect(allIcs.match(/BEGIN:VEVENT/g)).toHaveLength(3);
  expect(allIcs).not.toMatch(/(?<!\r)\n/);
  expect(allIcs).toContain('DTSTART;VALUE=DATE:20260905\r\n');
});

test('@claim:repair-matrix repairs and preserves the sample calendar exactly', async ({ page }) => {
  await page.goto(demoUrl);
  const first = page.locator('.event-card').first();
  await expect(first).toContainText('Changed time zone “Eastern Standard Time” to “America/New_York”.');
  await expect(first).toContainText('Added a missing end (one hour later).');
  await expect(first).toContainText('Added the unique event identifier required by calendar apps.');
  await expect(first).toContainText('Repeats');
  await expect(page.locator('.event-card').nth(1)).toContainText('All day');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download repaired ICS' }).click();
  const fixed = await downloadedText(await downloadPromise);
  expect(fixed).toContain('DTSTART;TZID=America/New_York:20260902T183000\r\n');
  expect(fixed).toContain('DTEND;TZID=America/New_York:20260902T193000\r\n');
  expect(fixed).toContain('LOCATION:Maple Street greenhouse\r\n');
  expect(fixed).toContain('DESCRIPTION:Choose autumn plots and share watering dates.\r\n');
  expect(fixed).toContain('RRULE:FREQ=WEEKLY;COUNT=3\r\n');
  expect(fixed).toContain('URL:https://example.com/concert-details\r\n');

  await page.getByRole('button', { name: 'Clear this calendar' }).click();
  await page.locator('#ics-text').fill([
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    'DTSTART;TZID=Mars/Olympus:20260912T120000',
    'DTEND;TZID=Mars/Olympus:20260912T110000',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\n'));
  await page.getByRole('button', { name: 'Show calendar events' }).click();
  await expect(page.locator('#repair-summary')).toContainText('Fixed text formatting required by calendar apps.');
  await expect(page.locator('.repair-list')).toContainText('Removed the unrecognized time zone “Mars/Olympus”');
  await expect(page.locator('.repair-list')).toContainText('Replaced an end time that was not after the start');
  await expect(page.locator('.repair-list')).toContainText('Added the unique event identifier required by calendar apps.');
  await expect(page.locator('.event-title')).toHaveText('Untitled event');
});

test('@claim:local-private-flow keeps entered calendar data off the network and storage', async ({ page, context }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(demoUrl);
  await page.getByRole('button', { name: /Show a QR code for Neighborhood/ }).click();
  await expect(page.locator('#qr-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Close QR code' }).click();

  await page.getByRole('button', { name: 'Clear this calendar' }).click();
  const marker = 'Private marker 8f0c95d1';
  const privateIcs = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:private@example.test\r\nSUMMARY:${marker}\r\nDTSTART:20260920T120000Z\r\nDTEND:20260920T130000Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
  await page.locator('#ics-text').fill(privateIcs);
  await page.getByRole('button', { name: 'Show calendar events' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ICS for Apple' }).click();
  await downloadPromise;

  expect(requests.every((value) => new URL(value).origin === 'http://127.0.0.1:4173')).toBe(true);
  const state = await page.evaluate(async (needle) => {
    const cacheText: string[] = [];
    for (const name of await caches.keys()) {
      for (const response of await (await caches.open(name)).matchAll()) {
        if (/\.(?:js|css|html)$|\/$|\/demo$/.test(new URL(response.url).pathname)) cacheText.push(await response.clone().text());
      }
    }
    return {
      local: Object.values(localStorage).join(' '),
      session: Object.values(sessionStorage).join(' '),
      databases: await indexedDB.databases(),
      cacheHasMarker: cacheText.some((text) => text.includes(needle)),
      cookie: document.cookie,
      accountOrPayment: document.body.innerText.match(/sign in|checkout|payment|credit card/i)?.[0] ?? '',
    };
  }, marker);
  expect(state.local).not.toContain(marker);
  expect(state.session).not.toContain(marker);
  expect(state.databases).toEqual([]);
  expect(state.cacheHasMarker).toBe(false);
  expect(state.cookie).toBe('');
  expect(state.accountOrPayment).toBe('');
  expect(await context.cookies()).toEqual([]);
});

test('@claim:offline-reload repairs and downloads after the first visit', async ({ page, context }) => {
  await page.goto(demoUrl);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true }));
    }
  });
  await context.setOffline(true);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => location.reload()),
  ]);
  await expect(page.locator('.event-card')).toHaveCount(3);
  await expect(page.locator('#offline-notice')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download ICS for Apple' }).first().click();
  expect(await downloadedText(await downloadPromise)).toContain('SUMMARY:Neighborhood garden planning');
  await page.locator('a.google').first().click();
  await expect(page).toHaveURL(/demo=1/);
  await context.setOffline(false);
  await expect(page.locator('a.google').first()).toHaveAttribute('aria-disabled', 'false');
});

test('@claim:input-limits accepts 100 events and 2 MB, then rejects larger input', async ({ page }) => {
  await page.goto(demoUrl);
  const event = (index: number) => `BEGIN:VEVENT\r\nUID:${index}@limit.test\r\nSUMMARY:Limit ${index}\r\nDTSTART:20260920T120000Z\r\nDTEND:20260920T130000Z\r\nEND:VEVENT\r\n`;
  const hundred = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${Array.from({ length: 100 }, (_, index) => event(index)).join('')}END:VCALENDAR\r\n`;
  await page.setInputFiles('#file-input', { name: 'hundred.ics', mimeType: 'text/calendar', buffer: Buffer.from(hundred) });
  await expect(page.locator('.event-card')).toHaveCount(100);

  await page.getByRole('button', { name: 'Clear this calendar' }).click();
  const suffix = `${event(1)}END:VCALENDAR\r\n`;
  const prefix = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nX-PADDING:';
  const maxBytes = 2 * 1024 * 1024;
  const exact = `${prefix}${'x'.repeat(maxBytes - Buffer.byteLength(prefix + '\r\n' + suffix))}\r\n${suffix}`;
  expect(Buffer.byteLength(exact)).toBe(maxBytes);
  await page.setInputFiles('#file-input', { name: 'exactly-2mb.ics', mimeType: 'text/calendar', buffer: Buffer.from(exact) });
  await expect(page.locator('.event-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear this calendar' }).click();
  await page.setInputFiles('#file-input', { name: 'over-2mb.ics', mimeType: 'text/calendar', buffer: Buffer.from(`${exact}x`) });
  await expect(page.locator('#error-box')).toContainText('over 2 MB');

  await page.setInputFiles('#file-input', { name: 'too-many.ics', mimeType: 'text/calendar', buffer: Buffer.from(`BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${Array.from({ length: 101 }, (_, index) => event(index)).join('')}END:VCALENDAR\r\n`) });
  await expect(page.locator('#error-box')).toContainText('more than 100 events');
});

test('@claim:demo-sandbox resets the memory-only sample and leaves it behind', async ({ page }) => {
  await page.goto(demoUrl);
  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await page.getByRole('button', { name: 'Clear this calendar' }).click();
  await page.locator('#ics-text').fill('changed in demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.event-title')).toHaveText(['Neighborhood garden planning', 'Farmers market pickup', 'School concert']);
  await expect(page.locator('#ics-text')).toHaveValue(/Neighborhood garden planning/);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.locator('#demo-banner')).toBeHidden();
  await expect(page.locator('#results')).toBeHidden();
  await expect(page.locator('#ics-text')).toHaveValue('');
});

test('@claim:qr-payload encodes the event Google Calendar link', async ({ page }) => {
  await page.goto(demoUrl);
  const expected = await page.locator('a.google').first().getAttribute('href');
  await page.getByRole('button', { name: /Show a QR code for Neighborhood/ }).click();
  const image = await page.locator('#qr-canvas canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('QR canvas has no 2D context.');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return { data: Array.from(pixels.data), width: pixels.width, height: pixels.height };
  });
  const decoded = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
  expect(decoded?.data).toBe(expected);
});
