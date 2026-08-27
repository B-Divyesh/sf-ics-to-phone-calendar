# Independent verification — 2026-08-27

Work order: `ics-to-phone-calendar-verify-1`  
Requested candidate: `6dd0edc2a2293a30eae0b361bed19350d439d7e3`  
Live URL: `https://ics-to-phone-calendar.sociobot.in`

## Verdict: FAIL

This is a release-provenance failure, not a demonstrated product-function failure.

After `git fetch origin --prune --tags`, `origin/main` remained `e6869d4f4d0a5601a5d31dd6380646ebf0b5b1fc`. The requested SHA is absent locally (`git cat-file -e 6dd0…^{commit}` fails), absent as an advertised remote ref (`git ls-remote origin 6dd0…` returns no result), and unavailable from GitHub's Git Commit API (HTTP 404). It is consequently impossible to independently inspect or build the requested commit, and impossible to compare live assets to that candidate.

The live page is byte-identical to a fresh local build of the available `e6869d4…` checkout for the assets below. This is useful deployment evidence, but deliberately not substituted for candidate verification.

| Asset | SHA-256 | Bytes |
| --- | --- | ---: |
| `/` / `dist/index.html` | `fbb12859a5aa58da47131c9d77805c8a36a7a927d9d42a6168f1d3ff8431dcae` | 7,880 |
| `/assets/main-BPtBS2KE.css` | `8210879e51123ec36cabe506c629e5834832e126fdb5b4919f3bd96148b70c73` | 15,714 |
| `/assets/main-Buc85bm9.js` | `d6af72f8d4603dfd91ad3df47aab9bb7833368b00bebe804eec9109403150b91` | 18,591 |

## Clean source verification (available checkout only)

`npm ci && npm test && npm run build` passed cleanly: Vitest 8/8 passed, TypeScript typecheck passed, and Vite produced `dist/`.

The supplied Playwright suite initially could not launch because this disposable container had no Chromium binary. After `npx playwright install chromium` (test-environment setup only), `npm run test:e2e` passed: **5 passed, 1 skipped** (the desktop copy of the mobile-only overflow test).

Build budgets:

- initial JS: 18,591 bytes / 7,670 gzip (under 200 KB)
- initial CSS: 15,714 bytes / 4,660 gzip (under 50 KB)
- deferred QR JS: 25,836 bytes / 10,140 gzip
- mobile AVIF hero: 21,766 bytes (under 300 KB); no web fonts

## Live HTTPS, headers, and convergence claim

Eight independent `curl` requests on 2026-08-27 returned HTTP **200**, `ssl_verify_result=0`, and the same address (`40.67.153.174`), with end-to-end times from **0.149 s to 0.593 s**. The live certificate is valid for `ics-to-phone-calendar.sociobot.in`, issued by GeoTrust TLS RSA CA G1, valid 2026-08-27 through 2027-02-27.

`/`, `/sw.js`, `/privacy/`, and `/terms/` each returned 200. The endpoint supplies HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, restrictive Permissions Policy, and the expected self-only CSP. Hashed JS and hero assets use `cache-control: public, max-age=31536000, immutable`.

`/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 830 ms browser load, title, `lang=en`, one `h1`, main landmark, no missing image alt text, no unlabeled buttons, and no page/console errors.

This confirms repeated HTTPS is currently stable. It does **not** prove that an earlier observed status `000` was *only* TLS/DNS convergence: there are no independent contemporaneous resolver, TLS, or deployment logs supplied to establish that historical cause, and the previous handoff was not treated as evidence.

## Live browser verification

All calendar fixtures were synthetic. No real calendar contents were entered or sent.

- Desktop and 390 px/iPhone-13-emulated Chromium: zero serious/critical Axe violations; zero console/page errors.
- Keyboard: skip link received Tab focus and navigated to `#main`; controls were usable with Enter/Ctrl+Enter; visible focus was present.
- 390 px: no horizontal overflow. `prefers-reduced-motion: reduce` changed animation/transition duration to 0.01 ms.
- Inputs: malformed pasted calendar showed the alert; paste with Ctrl+Enter, file selection, and a synthetic drag/drop each parsed correctly.
- Event fixture: three events including a missing-end all-day recurring event, a folded Windows-TZID event, and an unknown-TZID end-before-start event. UI presented all expected repair notices.
- Repaired full-calendar export was inspected without recording calendar content and retained/correctly generated all-day end, RRULE, VTIMEZONE, complete VALARM, mapped `America/New_York`, missing end, and replacement end-after-start.
- Actions: Apple produced an `.ics` download; Google links contained the expected template/recur fields; Outlook links contained compose/start/end fields; QR rendered locally.
- Outbound inspection: before an explicit provider action, no third-party request occurred. Google and Outlook clicks used synthetic data only; their routes were intercepted and aborted before network transmission. Observed key names only: Google `action,dates,text`; Outlook `enddt,path,rru,startdt,subject`.
- PWA: after warming, `navigator.serviceWorker.controller` was true and the shell reloaded with the browser offline.
- Privacy and terms: both loaded live with HTTP 200 and a `main` landmark.

## Lighthouse

Live Lighthouse mobile/default throttling, run with Chromium 151 and `--headless=new --no-sandbox`:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP 1.1 s; LCP 1.1 s; total blocking time 20 ms; CLS 0; interactive 1.2 s.

## Closure condition

Fetch or publish the exact requested SHA (or provide a corrected one), build it in a clean checkout, and compare all live referenced assets—not only the initial three—to that build. Repeat the check after a fresh browser context. Only then can the candidate/deployment portion be changed from FAIL. To state that the prior `000` was solely convergence, retain contemporaneous deploy, DNS, and TLS evidence.
