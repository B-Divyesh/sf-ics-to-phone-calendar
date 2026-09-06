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
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://ics-to-phone-calendar.sociobot.in/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
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
  await page.getByRole('button', { name: 'Download repaired ICS' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('repaired-calendar.ics');
});

test('works at 390px without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const sampleAction = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  const realAction = await page.getByText('Choose an ICS file', { exact: true }).first().boundingBox();
  expect(sampleAction?.y).toBeLessThan(844);
  expect(realAction?.y).toBeLessThan(844);
  await page.setInputFiles('#file-input', { name: 'invite.ics', mimeType: 'text/calendar', buffer: Buffer.from(calendar) });
  await expect(page.locator('#results')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('shared navigation and demo controls have 44px touch targets without overflow', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/not-a-real-route']) {
    await page.goto(route);
    const controls = page.locator('header a, footer nav a, #demo-banner button, #demo-banner a').filter({ visible: true });
    const count = await controls.count();
    expect(count, `${route} should expose shared navigation controls`).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index);
      const label = (await control.getAttribute('aria-label')) ?? (await control.innerText()).trim();
      const box = await control.boundingBox();
      expect(box, `${route} ${label} should have a rendered hit area`).not.toBeNull();
      expect(box!.width, `${route} ${label} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${route} ${label} height`).toBeGreaterThanOrEqual(44);
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      `${route} should not overflow horizontally`,
    ).toBe(true);
  }
});

test('serves real demo, legal, and 404 routes with route focus', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — ICS Rescue');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('.event-card')).toHaveCount(3);

  const homeResponse = await page.goto('/');
  expect(homeResponse?.headers()['referrer-policy']).toBe('no-referrer');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page).toHaveTitle('Privacy — ICS Rescue');
  expect(await page.evaluate(() => document.referrer)).toBe('');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Privacy, in plain language.');

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Add an ICS invite to your phone calendar.');
  await expect(page.getByRole('link', { name: 'Terms' }).first()).toBeVisible();

  const response = await page.goto('/not-a-real-route');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — ICS Rescue');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This invite took a wrong turn.');
  await expect(page.getByRole('link', { name: 'Return to ICS Rescue' })).toBeVisible();
});

test('every route has metadata, landmarks, one h1, and no serious axe issue', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/not-a-real-route']) {
    const errors: string[] = [];
    const listener = (message: import('@playwright/test').ConsoleMessage) => { if (message.type() === 'error') errors.push(message.text()); };
    page.on('console', listener);
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.title()).not.toBe('');
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
    const unexpectedErrors = route === '/not-a-real-route'
      ? errors.filter((message) => !message.includes('status of 404'))
      : errors;
    expect(unexpectedErrors, route).toEqual([]);
    page.off('console', listener);
  }
});
