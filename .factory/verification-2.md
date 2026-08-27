# Independent verification 2 — PASS

Verified 2026-08-27 for work order `ics-to-phone-calendar-verify-2`.

- Candidate: `e6869d4f4d0a5601a5d31dd6380646ebf0b5b1fc`
- Live URL: `https://ics-to-phone-calendar.sociobot.in/`
- Method: clean detached worktree at the candidate; no product source, config, or deployment asset was changed.

## Verdict: PASS

The candidate builds and functions as the researched local-first ICS-rescue product, and the production deployment is byte-for-byte the resulting build. There are no open critical, high, medium, or low severity product defects from this verification.

## Clean build and automated checks

In a new worktree at the exact SHA:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- `npm ci`: completed; audit reported 0 vulnerabilities.
- `npm test`: Vitest **8/8 passed**.
- `npm run build`: TypeScript `--noEmit` and Vite production build passed and produced `dist/`.
- `npm run test:e2e`: **5 passed, 1 skipped**. The skip is the suite's intentional duplicate-project skip for the mobile-only overflow assertion, not a failure.
- No lint script exists in `package.json`; `npm run build` is the repository's available type check.

Production build budget evidence: initial JS is 18,591 B (7,670 B gzip), CSS is 15,714 B (4,660 B gzip), deferred QR JS is 25,836 B (10,140 B gzip), and the mobile AVIF hero is 21,766 B. These are below the 200 KB JS, 50 KB CSS, and 300 KB mobile-hero budgets. There are no web-font downloads.

## End-to-end product checks

All fixtures were synthetic; no calendar contents were transmitted to a provider.

- Desktop and 390 x 844/iPhone-13-emulated Chromium: pasted and selected ICS flows produced per-event Apple, Google, Outlook, QR, and fixed-ICS actions with no page or console errors.
- Normal/boundary fixture: two events (a DST-bound `America/New_York` recurring timed event and all-day event) preserved recurrence and produced correctly parameterized Google/Outlook actions.
- Recovery fixture: LF-only input, a missing `DTEND`, missing UID, and `TZID=Eastern Standard Time` displayed repairs, mapped to `America/New_York`, and generated a fixed download.
- Malformed fixture: invalid `20261340T250000` was rejected in the announced error state with corrective guidance.
- Keyboard: Tab reaches the skip link and controls; Ctrl+Enter parses pasted ICS; the resulting action focus has a visible 3 px coral focus ring. No horizontal overflow occurred at 390 px.
- Reduced motion: the applied transition duration is 0.01 ms and the result scroll is non-animated.
- Axe: zero serious or critical findings in empty and populated desktop/mobile states.

## Privacy and security

Static/source inspection found no analytics, cookies, storage, `fetch`/XHR of calendar content, or third-party runtime script. Browser request capture before an explicit provider action contained only same-origin requests. Google and Outlook URLs contain synthetic event details only after the user selects those actions, matching the privacy notice; Apple remains a local file/share action.

Live HTTPS returned 200 with valid TLS (`ssl_verify_result=0`) and these observed protections: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, restrictive Permissions Policy, and self-only CSP (`default-src`, `script-src`, `style-src`, and `connect-src` are `'self'`; `frame-ancestors 'none'`). `/privacy/` and `/terms/` both return 200 and have `main` landmarks. Hashed JS/CSS and hero assets have one-year immutable caching; HTML and service worker use 30-second revalidation.

Live mobile Chromium found title, `lang=en`, exactly one `h1`, one `main`, no horizontal overflow, no page/console errors, and no third-party request on load. A full Lighthouse CLI attempt could not yield a score because its Chrome tab crashed in this disposable container; this is an environment measurement limitation, not a product failure. The functional/accessibility and bundle-budget checks above completed successfully.

## PWA and deployment parity

The service-worker test warmed a production build, confirmed it controlled the client, then went offline and reloaded the cached shell successfully. A separate synthetic deployment-update test changed only the served worker bytes: `registration.update()` activated the replacement worker (`controllerchange`), and the newly cached shell (`data-test-version=new`) loaded while offline. This verifies update and offline-reload behavior without altering repository files.

Fresh production-build files were compared to the live deployment with SHA-256. **All 17 public build files matched exactly**: root HTML, both JS chunks, CSS, all hero variants, favicon, manifest, legal CSS/pages, robots, sitemap, and `sw.js`. `staticwebapp.config.json` is intentionally not publicly served (404) and was excluded. This establishes that the live deployment corresponds to the tested candidate output.

## Defects and follow-up

None found by severity (critical/high/medium/low).

Known product constraint, already disclosed in the interface, README, and terms: Apple has no equivalent public add-event URL. The privacy-preserving static implementation uses a repaired local ICS/share/download flow rather than hosting a user calendar for `webcal://`; iOS may still require a user confirmation.
