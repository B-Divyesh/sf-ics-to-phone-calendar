# Add an ICS invite to your phone calendar — repair 3 handoff

- Work order: `ics-to-phone-calendar-repair-3`
- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Starting documentation SHA: `2508b466cf02a28e3135d59354f82f56d4598a1a`
- Deployed implementation SHA: `ac282e20ef772fbc47d9065fd5a3e5198fb0debd`
- Verified: 2026-09-06 UTC

## Result: PASS

The low-severity touch-target finding from verification 3 is fixed. No current finding remains open.

## What changed

- Header and footer navigation links now have centered hit areas of at least 44 by 44 CSS pixels in both application and legal-page styles.
- Reset demo and Start for real are at least 44 pixels high on desktop as well as phone layouts.
- The browser suite now measures rendered target rectangles on Home, Demo, Privacy, Terms, and 404 at desktop and phone widths. It also checks for horizontal overflow.
- The service-worker cache advanced to `ics-rescue-v5`, so returning visitors receive the repaired shared styles.

The converter, sample data, provider URLs, generated files, visual system, public wording, and privacy boundary were not changed.

## First screen and demo

Fresh 1440 by 900 and 390 by 664 browser contexts opened at scroll position zero.

- Job: “Add an ICS invite to your phone calendar.”
- Audience: iPhone users whose invite opens but will not import, plus people sending those invites.
- First action: “Try it with sample data.”
- The action ended at y=514.69 on desktop and y=315.89 on phone, before scrolling.
- The sample rendered Neighborhood garden planning, Farmers market pickup, and School concert.
- “Demo — sample data, nothing is saved” remained visible after scrolling.
- Reset demo restored all three events after the sample was changed.
- Start for real returned to an empty real-input state.
- No real calendar data was used.

## Finding disposition

| Source | Finding | Current evidence |
| --- | --- | --- |
| Verification 3 F-3-1 | Navigation and demo targets below 44 by 44 pixels | Fixed. Every visible shared target measured at least 44 by 44 on all five routes at both widths. The shortest desktop and phone targets measured exactly 44 by 44. Demo controls measured 105.36 by 44 and 109.25 by 44 on desktop. |
| Review 1 B1 | Job, audience, and first action absent above the fold | Remains fixed; both fresh viewports showed all three before scrolling. |
| Review 1 B2 | Demo sandbox absent | Remains fixed; one click loaded three events, the persistent label, reset, and exit controls. |
| Review 1 B3 and C01–C44 | Claims registry and claim coverage absent | Remains fixed; seven registered claim commands passed independently. No unlisted public claim was introduced. |
| Review 1 B4 | Apple action overpromised a direct add | Remains fixed; it says “Download ICS for Apple,” and the downloaded sample retained its title and repeat rule. |
| Review 1 B5 | Demo and unknown routes rendered Home | Remains fixed; Demo returned 200 and an unknown route returned the designed HTTP 404. |
| Review 1 M1–M4 | Metadata, shared shell, section order, and external-link disclosure | Remain fixed; route scan, metadata checks, keyboard navigation, and link inspection passed. |
| Review 2 F-2-1 | Route focus failed under `no-referrer` | Remains fixed; Home → Privacy → Back focused and announced each current heading live. |
| Review 2 F-2-2 and F-2-3 | README sentence length and heading wording | Remain fixed; the current copy audit has no sentence over 22 words and headings are contextual. |
| Verification 1 | Requested implementation was unavailable | Superseded; the exact implementation above is pushed, deployed, and all 21 public build files match live HTTPS. |
| Verification 2 | No defects in its earlier candidate | No regression found in its covered paths. |

## Clean-checkout verification

A new checkout at the exact implementation SHA used Node.js 22 and the documented setup.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 92 packages installed and 0 vulnerabilities reported |
| `npm test` | Pass; 8 of 8 unit tests |
| `npm run build` | Pass; `dist/index.html` produced |
| Seven commands from `.factory/claims.json` | Pass; each command ran independently |
| `npm run test:e2e` | Pass; 25 passed and one expected desktop-only skip |

Build output remained within budget: initial JavaScript was 20.57 kB raw and 8.23 kB gzip; CSS was 17.65 kB raw and 5.04 kB gzip; the deferred QR chunk was 25.84 kB raw and 10.14 kB gzip. The 768-pixel AVIF hero remains 21.77 kB. There are no web fonts.

## Live verification

- The existing `sf-ics-to-phone-calendar` Static Web App in `eastus2` was reused. Both deployment uploads succeeded, and final HTTPS returned 200.
- The factory URL verifier passed in 777 ms with no console errors, one `h1`, `lang=en`, a main landmark, image alternatives, and labelled buttons.
- Fresh phone and desktop route checks covered Home, Demo, Privacy, Terms, and 404. Each had one `h1`, one `main`, the expected title/status, no horizontal overflow, and zero serious or critical Axe findings.
- The demo and Apple-download flow made only same-origin requests. Local storage, session storage, IndexedDB, and cookies remained empty.
- A fresh service-worker context reloaded the three-event demo offline, showed the offline notice, and downloaded the Apple ICS. The active cache was `ics-rescue-v5`.
- All 21 public files in the local build matched live HTTPS byte for byte. The deployment-only `staticwebapp.config.json` was excluded.
- Live mobile Lighthouse scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was 1.0 seconds, LCP 1.1 seconds, total blocking time 30 ms, and CLS 0.

Evidence is in `/work/.evidence/ics-to-phone-calendar-repair-3/`. The catalog description was copied to `/work/.evidence/catalog-description.txt` and matches `.factory/catalog-description.txt`.

## Known constraints and next steps

Apple Calendar may still ask the user to confirm after opening the downloaded ICS file. Outlook links represent the first occurrence of repeating events because its link format cannot carry the repeat rule. Both limits are already stated in the product.

This is a static, free product. Backend tenancy, SQLite persistence, health checks, rate limits, billing registration, and license validation do not apply. No follow-up repair is required from this work order.
