# Add an ICS invite to your phone calendar — verification 4

Verified 2026-09-06 UTC for work order `ics-to-phone-calendar-verify-4`.

- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Implementation candidate reviewed: `ac282e20ef772fbc47d9065fd5a3e5198fb0debd`
- Documentation baseline reviewed: `c3b4aea888669053e2936ba9d529ccbba12949bb`
- Method: fresh `npm ci` checkout, independent declared-claim commands, full local browser suite, and new live desktop and iPhone-13-emulated Chromium contexts. No product source, deployment configuration, or real calendar data was changed.

## Verdict: FAIL

Finding count: **1 low**. Untested claim count: **0**.

The calendar conversion path, demo sandbox, privacy boundary, offline flow, accessibility checks, deployment parity, and previous touch-target repair pass. The explicit plain-words contract is not met by the live 404 heading. A PASS requires zero findings.

## Finding

### F-4-1 — Low — The 404 page uses a metaphor as its heading

The live 404 page has the `<h1>` **“This invite took a wrong turn.”** The plain-words contract prohibits metaphor or mood headings and requires headings to name the section or state directly. The page already says “404 / Page not found” and explains the address is invalid, so the user path is not broken; this is a low-severity copy-contract defect.

Required repair: replace the heading with a direct label such as **“Page not found.”** Preserve the existing explanation and return link. Recheck the live 404 title, one-h1 rule, and keyboard return path.

## First screen and demo

Fresh contexts opened the live landing page at scroll position zero.

| Check | Desktop 1440 × 900 | Phone 390 × 844 |
| --- | --- | --- |
| Job | “Add an ICS invite to your phone calendar.” | Same |
| Audience | iPhone users whose invite opens but will not import, and people sending those invites | Same |
| First action | “Try it with sample data” | Same |
| Sample-action position | y=466.69–514.69 | y=267.89–315.89 |
| Real-action position | y=466.69–514.69 | y=267.89–315.89 |

Both actions were visible without scrolling. The fresh sample opened three realistic events: Neighborhood garden planning, Farmers market pickup, and School concert. The persistent “Demo — sample data, nothing is saved” label remained visible after scrolling. After changing the sample, **Reset demo** restored all three bundled events. **Start for real** returned to `/`, hid results, and left the ICS field empty. No real calendar input was used.

## Declared claims

Every command listed in `.factory/claims.json` ran independently after `npm ci`. Each passed one matching `@claim:` test. No claim was untested.

| Claim | Command result | Observable evidence |
| --- | --- | --- |
| `calendar-outputs` | PASS | Apple download reparsed; Google and Outlook fields matched the sample |
| `repair-matrix` | PASS | Repairs and preserved recurring, all-day, detailed event fields matched |
| `local-private-flow` | PASS | Synthetic input stayed off network and browser storage before provider navigation |
| `offline-reload` | PASS | Fresh context reloaded and downloaded while offline |
| `input-limits` | PASS | 100 events and 2 MiB passed; 101 events and one extra byte failed |
| `demo-sandbox` | PASS | Reset restored sample; leaving demo discarded it |
| `qr-payload` | PASS | Rendered QR decoded to the event Google Calendar link |

The local full suite also passed: **25 passed, 1 expected skip**. The expected skip is the desktop duplicate of the mobile-only viewport assertion.

## Clean build and deployment parity

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 92 packages, 0 vulnerabilities reported |
| `npm test` | PASS; 8 of 8 unit tests |
| `npm run build` | PASS; `dist/index.html` produced |
| All seven declared claim commands | PASS; 7 of 7 |
| `npm run test:e2e` | PASS; 25 passed, 1 expected skip |
| Live file parity | PASS; all 21 public build files matched HTTPS SHA-256 bytes |

The later documentation commit differs from the implementation only in `.factory/copy-audit.md` and `.factory/handoff.md`; it does not require a different product image. Built initial JavaScript was 20.57 kB raw / 8.23 kB gzip, CSS was 17.65 kB raw / 5.04 kB gzip, and the deferred QR chunk was 25.84 kB raw / 10.14 kB gzip. No web fonts load.

## Live browser, accessibility, privacy, and offline checks

- `/`, `/demo`, `/privacy/`, and `/terms/` returned 200. The deliberate unknown URL returned the designed 404 page with HTTP 404; that status is expected.
- Home, Demo, Privacy, Terms, and 404 each had one `h1`, one `main`, their route title, no horizontal overflow, and no serious or critical Axe violations in desktop and phone contexts.
- All rendered shared navigation and demo controls measured at least 44 × 44 CSS pixels. The repair for verification 3 remains live.
- The URL verifier passed: 200, no console errors on initial load, title, `lang=en`, main landmark, image alternatives, and labelled buttons.
- Keyboard Tab reached the skip link; Enter moved to `#main`. Invalid pasted ICS announced a specific date correction. Reduced motion set the tested transition duration to `0.01ms`.
- The normal sample and Apple download worked on live HTTPS. Before provider navigation, requests were same-origin only. The private-flow claim also confirmed empty cookies, local/session storage, IndexedDB, and calendar-text-free cache content.
- A new live service-worker context reached `ics-rescue-v5`, went offline, reloaded the three-event demo, showed the offline notice, and downloaded `neighborhood-garden-planning.ics`.
- HTTPS uses HSTS, `no-referrer`, `nosniff`, Permissions-Policy, and a self-only CSP. Privacy and Terms are present and usable.

## Earlier finding disposition

| Earlier item | Current disposition |
| --- | --- |
| Review 1 B1 | Fixed: job, audience, sample action, and file action appear before scrolling in both contexts. |
| Review 1 B2 | Fixed: `/demo` and `?demo=1` load the populated, memory-only sample with persistent reset and exit controls. |
| Review 1 B3 and C01–C44 | Fixed: seven registered claims have unique tagged tests; all commands passed and no new public functional claim is untested. |
| Review 1 B4 | Fixed: Apple action is honestly named “Download ICS for Apple” and produces the tested file. |
| Review 1 B5 | Fixed: demo is real; unknown URLs serve a designed HTTP 404. |
| Review 1 M1, M3, M4 | Fixed: metadata, information order, and labelled external link remain correct. |
| Review 1 M2 / Review 2 F-2-1 | Fixed: live Home → Privacy → Back focuses and announces the current h1 under `no-referrer`. |
| Review 2 F-2-2 and F-2-3 | Fixed: the Outlook limitation copy and README heading remain within the contract. |
| Verification 1 candidate availability | Superseded: `ac282e2` exists, builds, and matches all public live files. |
| Verification 2 | No regression in its covered behavior. |
| Verification 3 F-3-1 | Fixed: every measured rendered target is at least 44 × 44 CSS pixels. |

F-4-1 is new and remains open. It is the sole reason for this FAIL verdict.

## Scope notes

This is a static local-first web product. Backend tenant isolation, SQLite restart persistence, health endpoints, live rate limits, and `429`/`Retry-After` checks do not apply. No AI feature is needed for deterministic, privacy-sensitive ICS repair; the required import, repair, export, provider-link, and QR paths are present.

Evidence: `/work/.evidence/ics-to-phone-calendar-verify-4/verify.json` and `full-e2e.log`.
