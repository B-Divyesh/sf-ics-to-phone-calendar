# ICS Rescue

ICS Rescue turns an existing `.ics` attachment or pasted calendar into usable phone-calendar actions. It is aimed at iPhone users who can preview an invite but cannot get iOS to import it, and at anyone sending an invite to them.

Live: <https://ics-to-phone-calendar.sociobot.in>

## What it does

- Reads dropped, selected, or pasted ICS text entirely in the browser.
- Handles up to 100 events / 2 MB and unfolds RFC 5545 continuation lines.
- Repairs LF line endings, missing event IDs, missing or invalid end times, untitled events, common Windows time-zone names, and unrecognized time-zone labels (with a visible review warning).
- Keeps multi-event files, all-day events, durations, descriptions, locations, URLs, recurrence rules, and safe unrecognized event properties.
- Creates per-event Google and Outlook compose links, local Apple-compatible ICS files, QR handoffs, and one repaired multi-event download.
- Caches the app shell for repeat/offline use. Calendar content is never written to that cache.

Apple does not publish a general add-event web URL, and `webcal://` requires the calendar contents to be hosted. This static, privacy-first product does not upload them. “Add to Apple” therefore opens the native file-share flow where supported and otherwise downloads a repaired `.ics`; depending on the iOS release, Apple may require one confirmation or a share-sheet choice. Google and Outlook links open their review screens directly.

## Privacy and security

There are no accounts, analytics, cookies, third-party scripts, or calendar uploads. Google or Microsoft receives an event only after the user chooses that provider link. Dynamic user text is placed into DOM text nodes rather than HTML. Production headers include a restrictive content security policy, no-referrer policy, and permissions policy. See `/privacy/` and `/terms/`.

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The required reproducible production command is:

```sh
npm run build
```

It type-checks the TypeScript and writes the static site to `dist/`, with `dist/index.html` at its root.

## Test

```sh
npm test
```

For browser flows and Axe accessibility checks, install the Chromium test browser once and run:

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite covers desktop and a 390 px mobile viewport, console errors, paste/file paths, repairs, QR generation, download, overflow, and serious/critical Axe findings.

## Deploy

Deploy the contents of `dist/` as an Azure Static Web App. `public/staticwebapp.config.json` is copied into the build and supplies the navigation fallback, security headers, and immutable asset caching. No server or environment variables are required.

## Project notes

- Product brief: [`.factory/brief.json`](.factory/brief.json)
- Visual system and generated-art provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT
