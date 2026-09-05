# Add an ICS invite to your phone calendar — verification 3

Verified 2026-09-05 UTC for work order ics-to-phone-calendar-verify-3.

- Live URL: https://ics-to-phone-calendar.sociobot.in
- Implementation reviewed: 05ed4facc5c25843ec526dfab17df10cd84cd6f9
- Earlier verification record: e50363672a663f050b024a590f933990992102ba
- Documentation commit reviewed: 9a63a517f7673119da233dfba3eb1c6ea18e2af9
- Method: fresh desktop and phone browser contexts plus a clean clone at the documentation commit. The only change after the implementation commit is .factory/handoff.md.

## Verdict: FAIL

Finding count: 1 low-severity finding. Untested claim count: 0.

The main calendar job, demo, claims, privacy boundary, offline path, routes, and earlier repairs pass. The site does not meet the required 44 by 44 CSS pixel target size for several navigation links and two desktop demo controls. The work order requires zero findings for PASS.

## First screen before scrolling

Fresh 1440 by 900 desktop and 390-pixel phone contexts opened the live home page at scroll position zero.

- Job: “Add an ICS invite to your phone calendar.”
- Audience: iPhone users whose invite opens but will not import, plus people sending those invites.
- First action: “Try it with sample data.”
- Desktop action position: y 466.69 to 514.69.
- Phone action position: y 267.89 to 315.89. It remained visible in the tested 390 by 664 CSS viewport.
- “Choose an ICS file” was beside the sample action in both contexts.
- Both contexts loaded with no console or page errors and only same-origin requests.

Screenshots and captured state are in /work/.evidence/ics-to-phone-calendar-verify-3/.

## Finding

### F-3-1 — Low — Some navigation and demo targets are smaller than 44 by 44 CSS pixels

At a 390-pixel phone width, the home header Privacy link measured 42.63 by 44 pixels and Terms measured 35.39 by 44 pixels. The home footer Demo and Terms links measured 37.36 by 44 and 38.13 by 44 pixels. The same short navigation targets occur on Demo, Privacy, Terms, and 404.

At 1440 pixels, header and footer Demo and Terms links remained narrower than 44 pixels. In the demo banner, Reset demo and Start for real measured 40 pixels high.

These links are separated and keyboard accessible, but their active rectangles do not meet the attached 44 by 44 CSS pixel target requirement. Axe and Lighthouse do not flag this stricter product contract. Evidence is recorded in touch-targets.json and touch-targets-desktop.json.

Required repair: give each affected header, footer, and demo-banner control a hit area of at least 44 by 44 pixels without causing phone overflow.

## Demo and calendar result

The one-click sample opened /?demo=1 with three populated events:

1. Neighborhood garden planning, including a mapped Windows time zone, missing end repair, generated event ID, and repeat rule.
2. Farmers market pickup, an all-day event.
3. School concert, including notes and a URL.

The persistent banner said “Demo — sample data, nothing is saved.” It remained visible after scrolling. Reset demo restored all three events after the sample was cleared and changed. Start for real returned to / with a hidden result area and empty ICS text. localStorage, sessionStorage, IndexedDB, and cookies remained empty.

The live Apple action downloaded neighborhood-garden-planning.ics. The file contained a valid VCALENDAR, the expected summary, and the weekly repeat rule. Google and Outlook links were inspected in the clean claim test without sending their synthetic event data. File selection, Ctrl+Enter paste, and drag and drop each produced the expected event on live HTTPS.

No real calendar data was used. All fixtures were synthetic.

## Claim results

Every command in .factory/claims.json ran separately from the clean clone. Each claim ID has exactly one matching test tag.

| Claim | Result | Evidence |
| --- | --- | --- |
| calendar-outputs | PASS | Apple ICS content and Google/Outlook URL fields checked |
| repair-matrix | PASS | Exact repairs and preserved event fields checked |
| local-private-flow | PASS | Requests, cookies, Cache Storage, IndexedDB, localStorage, and sessionStorage checked |
| offline-reload | PASS | Fresh context reloaded offline and downloaded repaired ICS |
| input-limits | PASS | 100 events and exactly 2 MiB accepted; 101 events and one extra byte rejected |
| demo-sandbox | PASS | Reset restored the fixture and Start for real discarded it |
| qr-payload | PASS | Rendered QR pixels decoded to the event’s Google link |

No claim was left untested. A cross-check of the live page, Privacy, Terms, 404, README, demo documentation, and current UI states found no public product claim outside the seven registered claim groups.

## Clean checkout checks

The clean clone was /tmp/ics-verify3.2Iwwjt/repo at 9a63a517f7673119da233dfba3eb1c6ea18e2af9. Git history proves that 05ed4fa through 9a63a51 changes only .factory/handoff.md, so the built product is the implementation candidate.

| Check | Result |
| --- | --- |
| npm ci | PASS; 92 packages, 0 vulnerabilities |
| npm test | PASS; 8 of 8 tests |
| npm run build | PASS; dist/index.html produced |
| Seven declared claim commands | PASS; 7 of 7 |
| npm run test:e2e | PASS; 23 passed, 1 expected desktop skip |
| Claim tag count | PASS; 7 registered, 7 tags, 7 unique |

Build output stayed within the product budgets: initial JavaScript was 20.57 kB raw and 8.23 kB gzip; CSS was 17.57 kB raw and 5.04 kB gzip; the deferred QR chunk was 25.84 kB raw and 10.14 kB gzip. There are no web fonts. The 768-pixel AVIF hero is 21.77 kB.

All 21 public files in the build matched live HTTPS byte for byte by SHA-256. This includes HTML, both JavaScript chunks, CSS, images, metadata files, legal pages, route-focus.js, and sw.js. staticwebapp.config.json is deployment configuration and was not treated as a public file.

## Normal, invalid, boundary, and recovery paths

- Normal: sample, selected file, pasted text, and dropped file all produced populated results.
- Invalid: empty input moved focus to an announced error. An impossible date returned “A date is not valid” with correction advice.
- Boundary: the registered test accepted 100 events and exactly 2 MiB, then rejected 101 events and 2 MiB plus one byte.
- Recovery: after an invalid input, a synthetic Eastern Standard Time event with no end or UID rendered successfully with the three expected repair messages.
- Download: per-event and full-calendar ICS files reparsed and retained the tested fields.
- Provider links: decoded Google and Outlook fields matched the sample. Outlook omitted recurrence as disclosed.
- QR: the native modal opened with focus on its close button, restored focus to the opener, and encoded the Google link.

## Accessibility, keyboard, and motion

- The factory verify-url.sh passed live in 915 ms with no console errors, one h1, lang=en, a main landmark, image alternatives, and labeled buttons.
- Axe found zero serious or critical issues on Home, Demo, Privacy, Terms, and 404 at desktop and phone widths.
- All five routes had one h1, header, main, footer, route title, description, canonical URL, and no horizontal overflow.
- Tab exposed the skip link; Enter moved the page to #main.
- Ctrl+Enter submitted ICS text. Errors received focus. Successful repair moved focus to the first result action.
- Home to Privacy to Back focused each new h1 and updated the polite route announcement while the live Referrer-Policy was no-referrer.
- Reduced motion changed animation and transition durations to 0.01 ms.
- Focus outlines are visible. The only accessibility-related defect is F-3-1.

## Privacy, offline, routes, and links

- The live demo, QR, and download flow requested only https://ics-to-phone-calendar.sociobot.in.
- Calendar text did not appear in browser storage. Cache Storage contained only the public app shell cache.
- A fresh service-worker context reloaded /?demo=1 offline, showed all three events and the offline notice, and downloaded the Apple ICS.
- /, /demo, /privacy/, and /terms/ returned 200 with their exact route titles.
- /not-a-real-route deliberately returned HTTP 404 with the designed page and a return link. This is expected behavior, not a defect.
- Every same-origin page link resolved as intended. The only 404 link result was the skip link on the deliberate 404 page because its containing URL correctly remains a 404.
- The live response included CSP, no-referrer, nosniff, Permissions-Policy, and HSTS headers.
- The product is static. Backend isolation, restart persistence, health, rate limiting, SQLite, and 429 checks do not apply.

## Performance

Fresh live mobile Lighthouse results:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP was 1.0 seconds, LCP 1.1 seconds, CLS 0, and total blocking time 0 ms.

## Earlier finding disposition

| Earlier item | Current proof |
| --- | --- |
| Review 1 B1 | Fixed: job, audience, sample action, and real file action are visible before scrolling on phone and desktop. |
| Review 1 B2 | Fixed: both demo URLs load the populated memory-only sandbox with persistent controls. |
| Review 1 B3 | Fixed: seven claims have seven unique tagged tests and every command passed. |
| Review 1 B4 | Fixed: the action says Download ICS for Apple, explains confirmation, and produces the checked file. |
| Review 1 B5 | Fixed: /demo is real and unknown paths return the designed HTTP 404. |
| Review 1 M1 | Fixed: route metadata, canonical URLs, social image, favicon, and touch icon are present. |
| Review 1 M2 | Fixed: shared headers and footers are present; live no-referrer navigation focuses and announces each h1, including Back. |
| Review 1 M3 | Fixed: the live tool follows the first screen and precedes How it works and privacy. |
| Review 1 M4 | Fixed: Sociobot is labeled external and opens a new tab with noopener and noreferrer. The verifier did not leave product scope to request that external site. |
| Review 2 F-2-1 | Fixed: live Home to Privacy to Back focus and announcements passed under Referrer-Policy: no-referrer. |
| Review 2 F-2-2 | Fixed: the Outlook limitation is now two sentences of eight and nine words. |
| Review 2 F-2-3 | Fixed: the README heading is “Turn ICS invites into calendar options.” |
| Verification 1 provenance | Superseded: the current implementation commit exists, builds, and all public live files match it. |
| Verification 2 | Its no-defect result applied to the older candidate; current behavior was checked again here. |

Review 1 claim items C01 through C44 were also checked. Current functional statements are covered by calendar-outputs, repair-matrix, local-private-flow, offline-reload, input-limits, demo-sandbox, and qr-payload. Earlier share-flow, universal iOS behavior, Apple platform explanation, DOM implementation detail, header claim, test-coverage claim, and deployment-config wording were removed or narrowed. The remaining README and live statements match the registered tests.

## Missed feature check

No missing AI, sync, import, or export step was found. Deterministic local parsing is appropriate for this privacy-sensitive task. The product supplies the brief’s file input, paste input, local repair, per-event Apple/Google/Outlook options, multi-event download, and QR transfer.

## Required next step

Increase the affected navigation and demo-control active rectangles to at least 44 by 44 CSS pixels. Re-run the phone and desktop target measurement, route scans, claim commands, and full browser suite. No other repair is indicated by this verification.
