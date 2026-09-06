# Add an ICS invite to your phone calendar — verification 4 handoff

- Work order: `ics-to-phone-calendar-verify-4`
- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Implementation reviewed: `ac282e20ef772fbc47d9065fd5a3e5198fb0debd`
- Documentation baseline reviewed: `c3b4aea888669053e2936ba9d529ccbba12949bb`
- Verified: 2026-09-06 UTC

## Result: FAIL

One low-severity copy-contract finding remains open. Product code and deployment files were not changed by this verification.

## Current finding

The live 404 page uses the metaphorical h1 “This invite took a wrong turn.” The plain-words contract requires a direct heading. Change it to a direct label such as “Page not found.” and rerun the live 404 route, keyboard return link, and title/one-h1 checks. This is the only current finding.

## Verification performed

- `npm ci`, `npm test` (8/8), `npm run build`, all seven declared claim commands, and `npm run test:e2e` (25 passed, one expected skip) passed from the checkout.
- Fresh desktop and phone live contexts confirmed the job, audience, and sample action before scrolling; populated demo output; persistent demo label; reset; real-state exit; routes; keyboard; focus; reduced motion; privacy; offline reload; and all 44 px targets.
- All 21 public files from the implementation build match live HTTPS byte for byte. The active service-worker cache is `ics-rescue-v5`.
- `/opt/fleet/lib/verify-url.sh` passed on the live landing page. Live Axe scans had no serious or critical issues.

## Product behavior confirmed

Fresh 1440 by 900 and 390 by 844 browser contexts opened at scroll position zero.

- Job: “Add an ICS invite to your phone calendar.”
- Audience: iPhone users whose invite opens but will not import, plus people sending those invites.
- First action: “Try it with sample data.”
- The action ended at y=514.69 on desktop and y=315.89 on phone, before scrolling.
- The sample rendered Neighborhood garden planning, Farmers market pickup, and School concert.
- “Demo — sample data, nothing is saved” remained visible after scrolling.
- Reset demo restored all three events after the sample was changed.
- Start for real returned to an empty real-input state.
- No real calendar data was used.

## Earlier finding disposition

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
| Verification 4 F-4-1 | Metaphorical 404 heading | Open. Replace it with a direct plain-words heading. |

## Commands to rerun after repair

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
/opt/fleet/lib/verify-url.sh https://ics-to-phone-calendar.sociobot.in /work/.evidence/ics-to-phone-calendar-verify-4
```

Run every exact command in `.factory/claims.json` independently as part of claim verification. The known clean result is 8 unit tests, 7 independent claim tests, 25 browser tests, and one expected skip. Build budgets remain below the static-product limits.

## Live verification evidence

- The factory URL verifier passed in 820 ms with no console errors, one `h1`, `lang=en`, a main landmark, image alternatives, and labelled buttons.
- Fresh phone and desktop route checks covered Home, Demo, Privacy, Terms, and 404. Each had one `h1`, one `main`, the expected title/status, no horizontal overflow, and zero serious or critical Axe findings.
- The demo and Apple-download flow made only same-origin requests. The claim suite found local storage, session storage, IndexedDB, and cookies empty.
- A fresh service-worker context reloaded the three-event demo offline, showed the offline notice, and downloaded the Apple ICS. The active cache was `ics-rescue-v5`.
- All 21 public files in the local build matched live HTTPS byte for byte. The deployment-only `staticwebapp.config.json` was excluded.

Evidence is in `/work/.evidence/ics-to-phone-calendar-verify-4/`. The detailed verification report is `.factory/verification-4.md`.

## Known product constraints and next step

Apple Calendar may still ask the user to confirm after opening the downloaded ICS file. Outlook links represent the first occurrence of repeating events because its link format cannot carry the repeat rule. Both limits are already stated in the product.

This is a static, free product. Backend tenancy, SQLite persistence, health checks, rate limits, billing registration, and license validation do not apply. The required next step is the one-line 404 heading repair described above; no other repair is indicated.
