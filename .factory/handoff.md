# Build handoff — ICS Rescue

## Post-deploy repair verification — 2026-08-27

The factory's final post-deploy request for builder commit `eefd8d97bd64fa4f953cca644b69f520821b54d5` recorded status `000` after the Static Web Apps upload had succeeded and the custom domain had already reported `Ready`/briefly returned HTTPS 200. This was a transient managed TLS/DNS convergence result, not an application or deployment defect:

- Reproduced against `https://ics-to-phone-calendar.sociobot.in` after convergence: HTTPS **200**, valid TLS (`ssl_verify_result=0`), expected current HTML/assets, and the configured CSP/security headers.
- Five further independent HTTPS requests all returned **200** (46 ms–1.97 s) with valid TLS.
- `/opt/fleet/lib/verify-url.sh https://ics-to-phone-calendar.sociobot.in <temporary evidence directory>` passed: browser load 864 ms, zero console/page errors, title present, `lang=en`, one `h1`, a `main` landmark, zero images missing `alt`, and zero unlabeled buttons.
- A separate live 390 × 844 Chromium scan using Playwright Axe found zero serious/critical violations and zero browser console/page errors.
- No source or deployment-config defect was found. The only committed change for this repair is this evidence record; the factory deploy path may safely reassert the same static deployment.

Clean local verification performed for this repair:

- `npm ci && npm test && npm run build`: passed; Vitest **8/8** passed and `dist/` was produced. Main initial JS is 18.59 KB uncompressed (7.67 KB gzip); the deferred QR chunk is 25.84 KB; CSS is 15.71 KB.
- `npm run test:e2e`: **5 passed, 1 intentionally skipped**. Chromium desktop and iPhone 13/390 px functional checks cover paste and file import, malformed/missing-end repair, recurrence, Windows-to-IANA time-zone repair, fixed ICS download, Apple/Google/Outlook actions, QR rendering, mobile overflow, browser console errors, and Axe scans in both empty and populated states. Unit coverage separately exercises malformed input, multiple events, recurrence, time zones, VTIMEZONE preservation, and alarms.

The Chromium browser binary was absent in the disposable verification container initially and was installed with `npx playwright install chromium`; this was test-environment setup only and does not affect the repository or shipped site.

## What shipped

- A production Vite + vanilla TypeScript static app for dropped, selected, or pasted ICS calendars.
- Local-only RFC-style line unfolding and event parsing with a 2 MB / 100-event guardrail.
- Multi-event rendering with explicit date, time, location, repeat status, and per-event repair notes.
- Repairs for LF line endings, missing `DTEND`, duration-derived ends, end-before-start, missing `UID`, missing summary, common Windows time-zone IDs, and unknown time-zone IDs with a visible manual-review warning.
- Preservation of recurrence rules, custom event properties, complete nested `VALARM` components, and relevant `VTIMEZONE` definitions in repaired exports.
- Per-event Apple file/share actions, Google Calendar templates, Outlook compose links, and locally generated Google handoff QR codes.
- Repaired whole-calendar download and Web Share support when the browser accepts calendar files.
- Designed empty, drag, error, repair-success, offline, and results states; keyboard paste with Ctrl/Cmd+Enter; 390 px responsive layout; safe-area padding; visible focus; reduced-motion fallback.
- Original surreal editorial hero art with source, prompt sidecars, responsive AVIF/WebP/JPEG outputs, and provenance in `.factory/design.md`.
- Privacy and terms pages, PWA manifest, offline shell caching, robots/sitemap, Azure Static Web Apps headers and fallback, README, and MIT license.

## Verification

Run from a clean checkout with Node.js 20+:

```sh
npm ci
npm test
npm run build
```

`npm run build` is the exact deployment build command. It writes `dist/index.html` and all deployable files under `dist/`.

Executed locally on 2026-08-27:

- `npm test`: 8/8 Vitest tests passed.
- `npm run build`: passed; initial app JS 18.59 KB uncompressed (7.67 KB gzip), deferred QR chunk 25.84 KB, CSS 15.71 KB.
- `npm run test:e2e`: 5 passed, 1 intentionally skipped project duplicate; desktop Chromium and Chromium at iPhone 13/390 px. Paste, file selection, repair output, calendar links, QR rendering, fixed-file download, console, mobile overflow, and Axe were exercised.
- Axe via Playwright: zero serious or critical violations in both empty and populated states.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title present, `lang=en`, exactly one `h1`, main landmark present, 0 missing image alts, 0 unlabeled buttons, and 0 console/page errors.
- Lighthouse mobile, simulated throttling: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 0 ms, CLS 0.
- Hero payloads: 22 KB / 73 KB AVIF, 32 KB / 101 KB WebP, and 45 KB JPEG fallback; all below the 300 KB hero budget.

To repeat browser verification:

```sh
npx playwright install chromium
npm run test:e2e
npm run preview
```

## Known gaps and honest constraints

- Apple provides no public add-event URL equivalent to Google/Outlook. A reliable `webcal://` flow requires hosting the user’s calendar data, which conflicts with this static product’s local-only privacy promise. “Add to Apple” therefore invokes the native file share sheet when supported and otherwise downloads a repaired ICS. Some iOS releases may require one additional share/import confirmation. This limitation is stated in the UI, README, and terms.
- Google and Outlook receive event details in the URL only after the user chooses their action; a long description can exceed practical QR capacity, in which case the UI asks the user to use the Google button.
- Outlook’s compose URL does not represent arbitrary recurrence rules. For recurring events, the UI explicitly says Outlook opens the first occurrence; Apple ICS and Google retain the rule.
- The parser intentionally rejects unsupported/non-calendar date syntax and files over 100 events instead of guessing. It does not expand recurrence instances or sync later changes.

## Suggested next steps

- Test the Apple share/download behavior against each new public iOS release and update the in-product guidance when Apple changes Calendar import behavior.
- Add a larger standards corpus (detached recurrence instances, unusually encoded parameters, and non-Gregorian edge cases) before raising the 100-event limit.
- If the factory later approves a privacy-preserving, short-lived ICS relay with strict no-log controls, evaluate an opt-in `webcal://` path; do not add it silently.
