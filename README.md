# ICS Rescue

Repair ICS invites and open them in Apple, Google, or Outlook calendars. ICS Rescue is for iPhone users whose invites preview but will not import. It also helps people sending those invites.

Live: <https://ics-to-phone-calendar.sociobot.in>

Demo: <https://ics-to-phone-calendar.sociobot.in/?demo=1>

## What it does

- Creates repaired ICS downloads plus Google and Outlook calendar links.
- Fixes text formatting, missing end times, event IDs, and common Windows time zones.
- Keeps supported dates, locations, notes, URLs, all-day events, and repeat rules.
- Reads up to 100 events or 2 MB.
- Works offline after the first visit for ICS repair and downloads.
- Needs no account or payment. It does not upload, save, track, or send calendar data before a provider link opens.
- Encodes each event’s Google Calendar link in its QR code.

The Apple action downloads an ICS file. Open that file in Apple Calendar and review it before saving. Outlook links open the first occurrence of a repeating event because the Outlook link format used here does not carry its repeat rule.

## Demo sandbox

`/?demo=1` loads three rendered sample events. `/demo` opens the same sandbox. The demo is memory-only. **Reset demo** restores the bundled sample, and **Start for real** discards it.

See [`.factory/demo.md`](.factory/demo.md) for the sample and isolation details. Every product claim and its exact sandbox command is registered in [`.factory/claims.json`](.factory/claims.json).

## Privacy and legal

Calendar input stays in browser memory. Google or Microsoft receives event details only after you open that provider’s link. See [`/privacy/`](https://ics-to-phone-calendar.sociobot.in/privacy/) and [`/terms/`](https://ics-to-phone-calendar.sociobot.in/terms/).

## Develop

```sh
npm ci
npm run dev
```

## Test

```sh
npm test
npm run build
npm run test:claims
npm run test:e2e
```

The browser version is pinned to Playwright 1.58.2. If its Chromium binary is missing, run `npx playwright install chromium` once.

## Deploy

Run `npm run build`, then deploy `dist/` as an Azure Static Web App.

## Project notes

- Opportunity: [`.factory/brief.json`](.factory/brief.json)
- Visual system and artwork source: [`.factory/design.md`](.factory/design.md)
- Repair handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT
