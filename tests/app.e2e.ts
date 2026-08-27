import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const calendar = `BEGIN:VCALENDAR\r
VERSION:2.0\r
BEGIN:VEVENT\r
SUMMARY:Moon garden opening\r
DTSTART;TZID=Eastern Standard Time:20260902T183000\r
LOCATION:Glasshouse\r
DESCRIPTION:Bring the paper invitation\r
RRULE:FREQ=WEEKLY;COUNT=3\r
END:VEVENT\r
END:VCALENDAR\r
`;

test('loads cleanly and passes an axe scan', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/ICS Rescue/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('pastes, repairs, exports, and opens a QR', async ({ page }) => {
  await page.goto('/');
  await page.locator('#ics-text').fill(calendar);
  await page.locator('#ics-text').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('.event-title')).toHaveText('Moon garden opening');
  await expect(page.locator('.repair-list')).toContainText('Added a missing end');
  await expect(page.locator('a.google')).toHaveAttribute('href', /calendar\.google\.com/);
  await page.getByRole('button', { name: /Show a QR code/ }).click();
  await expect(page.locator('#qr-dialog')).toBeVisible();
  await expect(page.locator('#qr-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Close QR code' }).click();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download fixed .ics' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('repaired-calendar.ics');
});

test('works at 390px without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.setInputFiles('#file-input', { name: 'invite.ics', mimeType: 'text/calendar', buffer: Buffer.from(calendar) });
  await expect(page.locator('#results')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
