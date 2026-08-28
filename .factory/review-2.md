# Adversarial first-read review 2

- Product: ICS Rescue (`ics-to-phone-calendar`)
- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Reviewed: 2026-08-28 UTC
- Candidate/source reviewed: `eb78308316d8275eda3c79d614962377c2c9e295`
- Browser: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The product is clear and immediately tryable. It still has three findings, so it does not meet the required zero-findings threshold.

## Cold first read

Before scrolling, the page answers all three required questions.

| Question | Answer from the first screen | Evidence |
| --- | --- | --- |
| What does this do? | It turns an ICS invite into calendar choices. | “Add an ICS invite to your phone calendar.” |
| For whom? | iPhone users whose invite will not import, and senders helping them. | “For iPhone users whose invite opens but will not import, and for people sending those invites.” |
| What should I click first? | Try the sample, or choose the real ICS file. | “Try it with sample data” and “Choose an ICS file” |

At 390 px, both actions occupied y=268–316; at desktop, y=467–515. The page had no console or page errors in either fresh context. The editorial paper/coral/night-garden treatment is distinct and matches `.factory/design.md`; it is not a generic SaaS template.

## Findings

### F-2-1 — High — M2 route-focus repair is not live

**Location / exact evidence:** Start at `/`, activate the visible **Privacy** link, and wait for the new page. On the deployed site, `document.activeElement` is `BODY`, not the `<h1>` “Privacy, in plain language.” Going Back also leaves focus on `BODY`.

`public/route-focus.js` only moves focus when `document.referrer` is same-origin. The live response sends `Referrer-Policy: no-referrer`, so that condition is false after every normal same-site navigation. The local Playwright route-focus test passes because its local preview does not supply the production header; it does not prove deployed behavior.

**Why this matters:** keyboard and screen-reader users receive neither the required new-page focus nor the polite route announcement. This is the unresolved focus part of review 1 finding **M2**, despite the header/footer portion being repaired.

**Concrete fix:** record same-origin navigation before the browser unloads (for example, a short-lived `sessionStorage` marker set by a capture-phase internal-link handler), consume it on the destination to focus and announce the new `<h1>`, and retain the `pageshow` handling for Back/Forward. Add a production-header Playwright test which serves `Referrer-Policy: no-referrer`, clicks Home → Privacy → Back, and asserts the current page’s `<h1>` has focus after both transitions.

### F-2-2 — Minor — README has a 23-word sentence

**Location / exact quote:** `README.md`, directly below the feature list: “Outlook links open the first occurrence of a repeating event because the Outlook link format used here does not carry its repeat rule.”

**Why this matters:** it exceeds the 22-word hard cap in the plain-words contract and makes an important compatibility limitation harder to scan on a phone.

**Concrete fix:** replace it with: “Outlook links open a repeating event’s first occurrence. Outlook’s link format cannot carry its repeat rule.”

### F-2-3 — Minor — README heading is context-free

**Location / exact quote:** `README.md` heading: “What it does”.

**Why this matters:** it is not meaningful in a screen-reader heading list without the preceding product name, contrary to the plain-words heading rule.

**Concrete fix:** change it to “Turn ICS invites into calendar options”.

## Copy audit

Counts below use `Intl.Segmenter('en', { granularity: 'word' })`. Dynamic event names, dates, locations, and user-provided ICS text are excluded; `[count]`, `[number]`, `[source]`, `[replacement]`, and `[zone]` are templates. There are no banned marketing terms. The only over-22 sentence is F-2-2.

### Landing page sentences and UI-state sentences

| Words | Copy |
| ---: | --- |
| 8 | For invites that open but will not import |
| 8 | Add an ICS invite to your phone calendar. |
| 16 | For iPhone users whose invite opens but will not import, and for people sending those invites. |
| 9 | Shows repaired events and Apple, Google, and Outlook options. |
| 4 | No account or upload |
| 6 | Works offline after the first visit |
| 1 | Free |
| 8 | Choose an ICS file or paste its text. |
| 2 | You’re offline. |
| 6 | Repair and ICS downloads still work. |
| 6 | Reconnect before opening Google or Outlook. |
| 8 | or choose it from Files, Mail, or Downloads |
| 8 | Reads up to 100 events or 2 MB. |
| 5 | We couldn’t read that ICS. |
| 8 | [count] events found. Review each one before saving. |
| 4 | [count] issues were repaired. |
| 4 | Calendar repaired and ready. |
| 4 | Calendar checked and ready. |
| 9 | The ICS and Google link include the repeat rule. |
| 5 | Outlook opens the first occurrence. |
| 7 | Open the downloaded file in Apple Calendar. |
| 7 | You may need to confirm before saving. |
| 8 | Download every repaired event in one ICS file. |
| 8 | Open an ICS file or paste ICS text. |
| 4 | No account is needed. |
| 12 | Fix text formatting, end times, event IDs, and common Windows time zones. |
| 11 | Download an ICS file or open a Google or Outlook link. |
| 6 | Nothing is sent while you repair. |
| 9 | ICS Rescue does not upload or save calendar data. |
| 12 | Google or Microsoft receives event details only after you open its link. |
| 8 | The QR contains this event’s Google Calendar link. |
| 9 | This event is too detailed for a reliable QR. |
| 5 | Use the Google link instead. |
| 6 | Repair ICS files in your browser. |
| 11 | The calendar-garden artwork was generated for this product with AI. |
| 9 | Paste ICS text or choose an ICS file first. |
| 6 | That file is over 2 MB. |
| 5 | Choose a smaller ICS file. |
| 6 | The file could not be opened. |
| 9 | Try saving it to Files and choosing it again. |
| 6 | This is not an ICS calendar. |
| 5 | Add BEGIN:VCALENDAR, then try again. |
| 5 | An event is missing END:VEVENT. |
| 9 | Add it to the ICS text, then try again. |
| 4 | No events were found. |
| 10 | Choose an ICS file that contains at least one VEVENT. |
| 7 | This calendar has more than 100 events. |
| 6 | Split it into smaller files first. |
| 6 | Event [number] has no start date. |
| 5 | Add DTSTART, then try again. |
| 6 | Changed time zone “[source]” to “[replacement]”. |
| 13 | Removed the unrecognized time zone “[zone]”; review this event’s local time before saving. |
| 7 | Fixed text formatting required by calendar apps. |
| 7 | Added a missing end (one hour later). |
| 10 | Replaced an end time that was not after the start. |
| 9 | Added the unique event identifier required by calendar apps. |
| 5 | Added the title “Untitled event.” |

Headings make sense out of context: “Open an ICS file”, “Review your events”, “How ICS repair works”, and “Your calendar data”. Result buttons use result-naming verbs: “Show calendar events”, “Download ICS for Apple”, “Open in Google”, “Open in Outlook”, “Show QR code”, and “Download repaired ICS”. “Reset demo” and “Start for real” are the exact sandbox controls required by the demo contract. Terms are consistent: **ICS file**, **ICS text**, **event**, **repaired ICS file**, **Apple Calendar**, and **calendar link**.

### README sentences

| Words | Copy |
| ---: | --- |
| 12 | Repair ICS invites and open them in Apple, Google, or Outlook calendars. |
| 13 | ICS Rescue is for iPhone users whose invites preview but will not import. |
| 7 | It also helps people sending those invites. |
| 10 | Creates repaired ICS downloads plus Google and Outlook calendar links. |
| 13 | Fixes text formatting, missing end times, event IDs, and common Windows time zones. |
| 12 | Keeps supported dates, locations, notes, URLs, all-day events, and repeat rules. |
| 8 | Reads up to 100 events or 2 MB. |
| 11 | Works offline after the first visit for ICS repair and downloads. |
| 5 | Needs no account or payment. |
| 15 | It does not upload, save, track, or send calendar data before a provider link opens. |
| 10 | Encodes each event’s Google Calendar link in its QR code. |
| 7 | The Apple action downloads an ICS file. |
| 11 | Open that file in Apple Calendar and review it before saving. |
| 23 | Outlook links open the first occurrence of a repeating event because the Outlook link format used here does not carry its repeat rule. **F-2-2** |
| 7 | `/?demo=1` loads three rendered sample events. |
| 5 | `/demo` opens the same sandbox. |
| 5 | The demo is memory-only. |
| 12 | Reset demo restores the bundled sample, and Start for real discards it. |
| 9 | See `.factory/demo.md` for the sample and isolation details. |
| 13 | Every product claim and its exact sandbox command is registered in `.factory/claims.json`. |
| 6 | Calendar input stays in browser memory. |
| 13 | Google or Microsoft receives event details only after you open that provider’s link. |
| 8 | The browser version is pinned to Playwright 1.58.2. |
| 12 | If its Chromium binary is missing, run `npx playwright install chromium` once. |
| 13 | Run `npm run build`, then deploy `dist/` as an Azure Static Web App. |

## Demo, claims, privacy, and history

`/demo` and `/?demo=1` both opened a memory-only demo with three already-rendered realistic events, the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real. The viewport was automatically positioned at “Review your events”; the first card was visible at y=416 on a 390 px screen. Reset restored all three bundled events. Start for real opened an empty non-demo state.

In a fresh live context, the demo/QR/download flow made only same-origin requests (HTML, JS, CSS, hero artwork, `route-focus.js`, and the same-origin lazy QR chunk). It left localStorage, sessionStorage, IndexedDB, and cookies empty. Cache Storage contained only `ics-rescue-v4`; no calendar data was persisted. After service-worker warm-up, an offline reload retained all three demo events and showed the offline notice. No unlisted claim-like sentence was found on the landing page or README: the seven current claims cover outputs, repairs, privacy/local handling, offline use, limits, demo isolation, and QR payload.

From a clean clone at the stated candidate, `npm ci`, `npm test` (8/8), `npm run build`, every registered claim command, and `npm run test:e2e` passed. The seven claim commands were run individually using the declared `@claim:` filter. The build produced `dist/`; initial JavaScript was 8.23 kB gzip.

All first-review blockers are confirmed fixed live and in code: **B1** first-screen audience/actions; **B2** demo sandbox; **B3** claim registry/tests; **B4** honest Apple download wording; and **B5** real demo plus designed 404. **M1**, **M3**, and **M4** are fixed (metadata, page order, and labelled external link). **M2** is only partially fixed: shared header/footer are present, but its route-focus failure recurs as F-2-1. The old unlisted claims were either removed/reworded or covered by the current registry. No `.factory/polish-*.md` file exists; `.factory/review-1.md`, both verification records, and the prior handoff were read.

## Structure and accessibility checks

Home, Demo, Privacy, Terms, and 404 have one `h1`, a `main`, `lang="en"`, a meta description, canonical, OG/Twitter metadata, favicon, and touch icon. Titles are route-specific and follow the product-name/what-it-does pattern. `robots.txt` and `sitemap.xml` include the public routes. `/not-a-real-route` returns the designed 404 with HTTP 404 and a return link. First-party links returned 200 except the intentional current-404 skip-anchor URL, whose containing page correctly returns 404; external Google/Outlook calendar links are labelled by their result and open in a new tab.

Live Axe scans found zero serious or critical violations on all five routes at both tested widths. There was no horizontal overflow, no console error, and reduced-motion behavior remains present. The only structure failure is F-2-1.

## Missed leverage

No missing AI, import/export, or sync feature is indicated. The brief already calls for repaired Apple ICS downloads, Google/Outlook links, multi-event export, and QR transfer; each is present. An AI step would not improve this deterministic, privacy-first conversion job and is correctly absent.

## What would make this perfect

Make same-site route focus and announcement work under the deployed no-referrer policy, then repair the two README copy findings. Re-run the route-focus test against production-equivalent headers and the full claim/browser suite. At that point this review can pass.
