# Review 2 handoff

- Work order: `ics-to-phone-calendar-review-2`
- Role: reviewer
- Result: **FAIL** — no product code was modified.

## What was done

- Ran an adversarial live first-read review in fresh 390 × 844 and 1440 × 900 Chromium contexts.
- Reviewed the brief, design, claims, demo documentation, review 1, both verification records, and prior handoff.
- Cloned the source into a fresh temporary directory, ran `npm ci`, `npm test`, `npm run build`, every claims command independently, and `npm run test:e2e`.
- Verified live demo isolation, outgoing request origins, browser storage, offline reload, route metadata/404, links, console, and Axe across the five public routes.
- Wrote the complete report to `.factory/review-2.md`.

## Findings left

1. Same-site navigation and Back do not focus/announce the new page heading on production because `route-focus.js` relies on `document.referrer`, while the live no-referrer policy clears it. This reopens review 1 finding M2.
2. One README sentence is 23 words; the “What it does” README heading is context-free.

## How to verify after repair

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

Also test the deployed site with its `Referrer-Policy: no-referrer` header: Home → Privacy → Back must leave the visible page’s `<h1>` focused and announce the route.

## Known gaps

The review remains failing until all three reported findings are repaired and confirmed live.

# Prior perfection loop round 1 handoff

- Work order: `ics-to-phone-calendar-polish-1`
- Product: ICS Rescue (`ics-to-phone-calendar`)
- Source review: `27c735bde550b1cf6aaa5ef2ca38690da33719be`
- Repair commits: `0911cd2`, `361fe85`, and `5b73fd5`
- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Deployment: Azure Static Web Apps, production deployment `f1af71c5-7711-4e78-b726-2fd39696df14`
- Verified: 2026-08-28 UTC

## Outcome

All five blocking findings in `.factory/review-1.md` are resolved.

- **B1:** The 390 × 844 first screen now names iPhone users, explains the failed-import situation, and shows sample and real-file actions. Both actions are above the fold. The original calendar-garden art remains as a short editorial strip.
- **B2:** `/?demo=1` and `/demo` enter a memory-only sandbox with three rendered events. The persistent banner says “Demo — sample data, nothing is saved” and provides **Reset demo** and **Start for real**.
- **B3:** `.factory/claims.json` registers seven visitor-facing claims. Each ID occurs on exactly one tagged browser test. `.factory/demo.md` documents the fixture and isolation boundary.
- **B4:** The Apple action is now **Download ICS for Apple**. Its note explains that the user opens the file in Apple Calendar and may need to confirm. Tests assert the downloaded filename, MIME-backed content path, CRLF structure, event fields, and repeat rule.
- **B5:** `/demo` is a real configured route with `Demo — ICS Rescue` metadata. Unknown paths render the product-styled 404 with HTTP 404 and a return link.

The non-blocking findings were also repaired: canonical/OG/Twitter metadata, a 1200 × 630 social image, 180 px touch icon, shared headers and footers, legal cross-links, route focus and announcements, corrected landing-section order, Param Factory/version credit, and disclosed external-link behavior. The first-screen, error, action, and README language follows the review rewrites. `.factory/copy-audit.md` records word counts and terminology.

## Product behavior

- The sample fixture includes a recurring event with a repaired Windows time zone, an all-day event, and an event with notes and a URL.
- Demo state and real input state stay in page memory. Reset restores the bundled fixture. Leaving demo reloads a blank real state.
- Calendar input is not sent or written to localStorage, sessionStorage, IndexedDB, cookies, or Cache Storage.
- Google and Outlook links are blocked while offline. ICS repair and downloads remain available from the cached app.
- The service worker precaches the built entry assets and ignores `Vary` only for its own same-origin cache lookup. This fixed offline reloads under the Windows-like Playwright user agent.

## Verification evidence

### Clean clone

Verified from `/tmp/ics-polish-final.uAJQb6/repo`, cloned with `git clone --no-hardlinks /work/repo` at repair commit `5b73fd52f3db1b8383cb07a5c1773ecbd06a8a2c`.

| Command | Result |
| --- | --- |
| `npm ci` | 92 packages installed; 0 vulnerabilities |
| `npm test` | 8/8 unit tests passed |
| `npm run build` | Passed; `dist/index.html` present |
| Every `test` command in `.factory/claims.json` | 7/7 commands passed independently in fresh browser contexts |
| `npm run test:e2e` | 23 passed; 1 intentional desktop skip for the mobile-only overflow case |

Individual clean-clone claim results: `calendar-outputs` 1 passed; `repair-matrix` 1 passed; `local-private-flow` 1 passed; `offline-reload` 1 passed; `input-limits` 1 passed; `demo-sandbox` 1 passed; `qr-payload` 1 passed.

The browser matrix covers desktop Chromium and Chromium at 390 × 844. It checks sample/file/paste input, exact repairs, downloads, provider URLs, QR decoding, 100/101 event and 2 MB boundaries, demo reset/isolation, request origins, all browser storage, cookies, offline reload/download, focus, metadata, 404 status, console errors, overflow, and Axe.

### Accessibility, performance, and budgets

- Route-wide Playwright Axe scans on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 returned 0 serious or critical findings at 1440 × 900 and 390 × 844.
- The factory `verify-url.sh` passed locally and live: title, `lang=en`, one `h1`, `<main>`, image alt text, labeled buttons, and no application console errors. Live measured load was 711 ms in that smoke test.
- Local mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.2 s, CLS 0, total blocking time 0 ms.
- Build sizes: initial JS 20.57 kB raw / 8.23 kB gzip; CSS 17.57 kB raw / 5.04 kB gzip; lazy QR chunk 25.84 kB raw / 10.14 kB gzip. The mobile AVIF hero is 22 kB.
- Reduced-motion rules remove meaningful transition duration. Touch targets are at least 44 px. The mobile browser suite found no horizontal overflow.

### Production

`/opt/fleet/lib/deploy-static.sh ics-to-phone-calendar dist` deployed successfully. The custom domain was already Ready and returned HTTPS 200 after deployment.

| Live route | Status / evidence |
| --- | --- |
| `/` | 200; correct home title; no severe Axe issue |
| `/demo` | 200; demo title, banner, three events, reset restored three events |
| `/?demo=1` | 200; same isolated demo entry point |
| `/privacy/` | 200; route title and shared shell |
| `/terms/` | 200; route title and shared shell |
| `/not-a-real-route` | 404; `Page not found — ICS Rescue` |

The live 1440 px and 390 px sweep found no overflow and 0 serious/critical Axe findings on every route above. A new live context installed the service worker, went offline, reloaded `/?demo=1`, rendered all three events, and showed the offline notice. Production responses include CSP, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `X-Content-Type-Options: nosniff`. Hashed JS returns `cache-control: public, max-age=31536000, immutable`.

## Known limitations

No known blocking finding remains.

- Apple receives a downloaded ICS file rather than a direct add-event web action. The interface and terms state that the user must open and confirm it in Calendar.
- The Outlook link opens the first occurrence of a repeating event. The repaired ICS and Google link keep the repeat rule; the result card states this difference.

## Next steps

No release work is required. Re-run the registered claim commands if a calendar provider changes its URL format or if the service-worker asset strategy changes.
