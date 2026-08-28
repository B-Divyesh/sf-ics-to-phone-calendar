# Adversarial first-read review 1

- Product: ICS Rescue (`ics-to-phone-calendar`)
- Live URL: <https://ics-to-phone-calendar.sociobot.in>
- Reviewed: 2026-08-28
- Candidate: `36c2a77bb7dcee4201e56450f4525320bc95cf3c`
- Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context
- Verdict: **FAIL**

The review has five blocking findings. A pass requires zero blocking findings and no more than three minor findings.

## Blocking findings

### B1 — The first screen does not identify the audience or provide a first product action

**Quote:** “Turn a stuck .ics into a calendar event.” “Drop or paste the invite. We repair common file problems and give you clean Apple, Google, and Outlook actions—right here on your device.” The only above-fold links at both tested sizes were “ICS Rescue” and “Private by design.”

**Cold-read result:**

| Question | Answer after the first screen |
| --- | --- |
| What does this do? | Repairs an ICS invite and offers calendar-provider actions. |
| For whom? | Cannot determine. The page does not mention iPhone users, failed iOS imports, or people sending those invites. |
| What should I click first? | Cannot determine. There is no product action in the first viewport. “Private by design” is the only non-home action. |

At 390 × 844, “Open your calendar file” begins at y=772 and its explanatory line is cut off at the bottom; the file control is below the viewport. At 1440 × 900, the section label starts at y=850 and the control is also below the viewport. A visitor has to infer that scrolling is the first action.

**Why this loses a first-time visitor:** the artwork consumes the action area, while the copy omits the specific failed-import situation. The user cannot verify that this solves an iPhone problem or start the task within 30 seconds without exploring.

**Concrete fix:** keep this first screen above the fold at 390 px:

- Headline: “Add an ICS invite to your phone calendar.”
- Audience sentence: “For iPhone users whose invite opens but will not import, and for people sending those invites.”
- Primary action: “Try it with sample data.”
- Adjacent real action: “Choose an ICS file.”
- Outcome note: “Shows repaired events and Apple, Google, and Outlook options.”
- Facts: “No account or upload”; “Works offline after the first visit” only after adding its claim test; “Free.”

Reduce or move the hero art so both actions remain in the first 390 × 844 viewport.

### B2 — There is no one-click demo or sandbox

**Quote:** no “Try it with sample data” action exists. `/demo` and `/?demo=1` both return the ordinary landing page with the same title and headline. Neither has “Demo — sample data, nothing is saved,” “Reset demo,” or “Start for real.” README provides no demo URL.

**Why this loses a first-time visitor:** evaluating the product requires finding or constructing an ICS file. There is no immediate example of repaired events, provider actions, or the iPhone handoff. Reset behavior and separation from real data cannot be verified because demo mode does not exist.

**Concrete fix:** add `/demo` with a realistic multi-event ICS fixture that is already rendered on arrival. Include at least one repaired Windows time zone, one all-day event, and one recurring event. Keep a persistent “Demo — sample data, nothing is saved” banner with “Reset demo” and “Start for real.” Use a `demo:` storage namespace, or document that the demo is memory-only, and add `.factory/demo.md`. Verify that resetting restores the fixture and that leaving demo discards it without reading or writing normal-state data.

### B3 — The required claims registry and claim tests do not exist

**Quote:** `.factory/claims.json` is absent, and the repository contains no `@claim:` test tags.

**Why this misleads a visitor:** the live page and README make functional, privacy, offline, compatibility, capacity, and security claims with no required one-to-one sandbox tests. There were therefore no listed claim commands to run. Passing untagged unit/E2E tests cannot establish which published claims are protected from regression.

**Concrete fix:** add `.factory/claims.json`; add exactly one `@claim:<id>` test for each claim in the unlisted-claims table below; run each declared command from `/demo` in a fresh context. Remove or qualify claims that cannot be tested.

### B4 — The core Apple action promises a result it does not name honestly or test

**Quote:** button: “Add to Apple.” README: “Add to Apple therefore opens the native file-share flow where supported and otherwise downloads a repaired .ics; depending on the iOS release, Apple may require one confirmation or a share-sheet choice.”

**Observed result:** in the 390 px Chromium check, `navigator.canShare({files})` was unavailable and pressing “Add to Apple” downloaded `neighborhood-garden-planning.ics`. The test suite never presses this button and explicitly runs its iPhone 13 project with Chromium, not WebKit. No iPhone/Safari or Apple-import claim test exists.

**Why this misleads a visitor:** “Add” promises a calendar result, but the implemented fallback produces a file and may require more choices. That distinction is the product's core iPhone job.

**Concrete fix:** label the present behavior “Download ICS for Apple” or “Share ICS for Apple,” with “You may need to confirm in Calendar.” If the product retains “Add to Apple,” add a reproducible WebKit/iOS-oriented test that asserts the actual handoff and state the unavoidable confirmation step beside the button.

### B5 — Unknown and demo routes silently render the home page

**Quote:** `/not-a-real-route` returns HTTP 200, the home title, and “Turn a stuck .ics into a calendar event.” `/demo` does the same.

**Why this loses a first-time visitor:** mistyped and expected deep links appear valid but show unrelated content. This is broken routing, and there is no designed 404 or way to explain the bad address.

**Concrete fix:** add a product-styled 404 with a clear “Return to ICS Rescue” link and configure hosting to serve it for unknown routes with a 404 status. Add a real `/demo`, route-specific “Demo — ICS Rescue” title, and include it in `sitemap.xml` only when it exists.

## Other findings

### M1 — Required route metadata is incomplete

**Quote:** the home, Privacy, and Terms pages have no canonical link, Open Graph metadata, Twitter card metadata, or 180 px Apple touch icon. Privacy and Terms also omit `theme-color`. There is no 1200 × 630 share image.

**Why this matters:** shared links have no controlled preview or canonical URL, and an iPhone-focused product lacks the expected home-screen icon metadata.

**Concrete fix:** add canonical, OG, Twitter, theme-color, SVG favicon, 180 px touch icon, and product-art-derived 1200 × 630 image metadata to every route. Keep the current route title pattern; the existing titles are under 60 characters.

### M2 — Header, footer, and route focus are inconsistent

**Quote:** the home header is “ICS Rescue / Private by design,” while legal-page headers contain only “← ICS Rescue.” Legal footers have no Privacy or Terms links. No footer says “Built by Param Factory” or gives a version/build ID.

When the Privacy link was opened, `document.activeElement` was `BODY`, not the new `h1`. Back navigation restored the home URL and scroll position, but focus remained on `BODY`.

**Why this matters:** visitors and screen-reader users lose the shared site structure when changing pages, and the required builder/version attribution is absent.

**Concrete fix:** use one header and footer on all routes: linked wordmark, Demo, Privacy, Terms, product one-liner, “Built by Param Factory,” and build ID. On client-side route changes, focus the new `h1` and announce it. For full-page navigation, provide a consistent landmark structure and verify the initial focus/announcement behavior.

### M3 — The landing-page skeleton is out of order

**Quote:** the page places the privacy section before “A small repair, not a sync.” There is no first-screen demo action, and the live product starts below the hero art.

**Why this matters:** visitors see an abstract promise and large illustration before they can try the tool, then encounter privacy before the three-step explanation.

**Concrete fix:** use this order: header; first-screen promise/actions/facts; live tool or seeded preview; “How it works”; limitations/privacy; footer.

### M4 — External-link behavior is not disclosed

**Quote:** footer link “Sociobot” opens `https://sociobot.in/` in the same tab and has no external-site label.

**Why this matters:** the visitor can leave the converter without warning and lose their current in-memory calendar.

**Concrete fix:** label it “Sociobot (external)” and open it in a new tab with `rel="noopener noreferrer"`, or warn before replacing a populated in-memory state.

## Unlisted claim findings

Every row is an unlisted-claim finding because `.factory/claims.json` is absent. Similar wording may share one claim entry only when one test proves every quoted outcome and every listed location.

| ID | Exact claim and location | Why it needs proof | Concrete fix / required test |
| --- | --- | --- | --- |
| C01 | Home title/headline: “Add an ICS event to your phone calendar”; “Turn a stuck .ics into a calendar event.” | This is the core outcome. | Demo test: load sample, invoke each supported destination, and assert the resulting file or provider compose URL. |
| C02 | Hero: “We repair common file problems and give you clean Apple, Google, and Outlook actions—right here on your device.” | Combines repair, output, and local-processing claims. | Split the sentence; test repairs/output separately and intercept the full flow for local processing. |
| C03 | Hero: “Nothing is uploaded.” | Visitors may rely on this privacy promise. | Intercept the complete demo flow and assert no calendar content and no non-same-origin request before a provider link is chosen. |
| C04 | Hero: “Multiple events welcome.” | The supported count and output behavior are unspecified. | State the limit and test two events plus the maximum accepted count. |
| C05 | Hero: “Time zones preserved.” | Unknown zones are removed, so the absolute wording is not always true. | Replace with “Shows time-zone repairs before you save,” then test IANA, mapped Windows, and unknown zones. |
| C06 | Offline notice: “File repair and Apple downloads still work; Google and Outlook open when you reconnect.” | Offline behavior depends on the service worker and provider blocking. | Fresh-context demo test: warm once, go offline, reload, repair/download, confirm provider links do not navigate, reconnect, and confirm they do. |
| C07 | Import note: “Up to 2 MB.” | This is a quantitative limit. | Test exactly 2 MB and just over 2 MB with the stated boundary. |
| C08 | Import note: “stays on this device.” | This is a privacy promise. | Run the upload/network interception test and inspect Cache Storage, IndexedDB, localStorage, and sessionStorage for fixture text. |
| C09 | Results: “Calendar repaired and ready”; “Calendar checked and ready”; “Repaired for you.” | “Repaired” asserts output correctness. | Fixture tests must compare exact normalized ICS output for every repair type. |
| C10 | Button: “Download fixed .ics.” | A button label claims a valid downloadable result. | Assert filename, MIME type, CRLF structure, reparsing, and event parity. |
| C11 | Button: “Share fixed .ics.” | Sharing is conditional and browser-dependent. | Test the supported `navigator.share` path and download fallback, or label availability explicitly. |
| C12 | Button: “Add to Apple.” | The observed fallback only downloads a file. | Apply B4: rename it or test the exact Apple handoff in a representative environment. |
| C13 | Button: “Open in Google.” | The URL must preserve observable event fields. | Assert decoded Google parameters for title, dates, zone, location, details, and recurrence. |
| C14 | Button: “Open in Outlook.” | The URL must preserve the supported event fields. | Assert decoded Outlook parameters and document/test excluded recurrence. |
| C15 | Result note: “Apple and Google preserve the repeat rule.” | Recurrence handling is a compatibility claim. | Use a recurring demo event and assert the downloaded ICS and Google URL retain its exact RRULE. |
| C16 | Result note: “Outlook opens the first occurrence for review.” | The Outlook degradation is still an asserted outcome. | Assert start/end values in the Outlook URL and absence of a recurrence claim. |
| C17 | Result note: “Apple uses your phone’s share/download flow; iOS may ask you to confirm once more.” | Browser/iOS behavior is central and version-sensitive. | Test supported and fallback branches; reword as a conditional instruction rather than a universal result. |
| C18 | Privacy: “This converter runs entirely in your browser.” | Visitors rely on local execution. | Intercept the seeded flow and assert only static same-origin code/assets are requested. |
| C19 | Privacy: “We do not upload, store, inspect, or track calendar contents.” | Four privacy promises require storage and network evidence. | Intercept requests and inspect all browser storage/cache namespaces for a unique sample marker. |
| C20 | Privacy: “Google and Outlook receive event details only if you choose their link.” | Provider disclosure timing matters. | Assert no provider request before click and assert the chosen URL contains the disclosed event fields. |
| C21 | How it works: “Your browser opens the text. No account or upload.” | This repeats local-processing and account claims. | Cover with the privacy test and an unauthenticated fresh context. |
| C22 | How it works: “We normalize line endings, missing end times, IDs, and common time-zone names.” | Lists four repair guarantees. | Parameterized fixtures must assert each exact repair in serialized output. |
| C23 | How it works: “Use a provider link, scan a QR, or keep the repaired ICS.” | Claims three output routes. | Test both provider URLs, decode the QR payload, and reparse the downloaded ICS. |
| C24 | QR dialog: “The event is encoded in this QR.” | A rendered canvas alone does not prove its payload. | Decode the generated QR and compare it with the expected Google URL. |
| C25 | QR dialog: “It is generated on this device and not uploaded by us.” | This is another local/privacy promise. | Intercept QR generation and assert only a same-origin lazy chunk is requested. |
| C26 | README: “Handles up to 100 events / 2 MB and unfolds RFC 5545 continuation lines.” | Contains two quantitative/boundary guarantees and a parser guarantee. | Test 100 vs. 101 events, 2 MB boundary, and folded lines. |
| C27 | README: “Repairs LF line endings, missing event IDs, missing or invalid end times, untitled events, common Windows time-zone names, and unrecognized time-zone labels (with a visible review warning).” | Enumerates repair behavior beyond what one happy path proves. | Add a parameterized repair matrix and assert both output and visible warnings. |
| C28 | README: “Keeps multi-event files, all-day events, durations, descriptions, locations, URLs, recurrence rules, and safe unrecognized event properties.” | Preservation failures can silently change an event. | Round-trip fixtures for every listed field and nested/unrecognized properties. |
| C29 | README: “Creates per-event Google and Outlook compose links, local Apple-compatible ICS files, QR handoffs, and one repaired multi-event download.” | Claims four output families and Apple compatibility. | Test each artifact from the demo; define and assert “Apple-compatible.” |
| C30 | README: “Caches the app shell for repeat/offline use.” | This is an offline/PWA promise. | Fresh-context service-worker install, offline reload, and static-asset availability test. |
| C31 | README: “Calendar content is never written to that cache.” | This is a privacy promise about storage. | Search every cached response/request for a unique fixture marker after the full demo flow. |
| C32 | README: “Apple does not publish a general add-event web URL, and `webcal://` requires the calendar contents to be hosted.” | This external-platform claim supports the product limitation. | Cite a dated Apple source in README, or narrow it to “This product does not use a hosted `webcal://` feed.” |
| C33 | README: “This static, privacy-first product does not upload them.” | “privacy-first” is vague; non-upload is testable. | Use “ICS Rescue does not upload calendar data” and cover it with C03/C19. |
| C34 | README: the complete “Add to Apple” share/download/iOS-confirmation sentence. | The sentence is version- and API-dependent. | Split it, use exact conditional wording, and cover both code branches plus representative WebKit behavior. |
| C35 | README: “Google and Outlook links open their review screens directly.” | Provider URLs and redirects can change. | Assert the generated URLs and, where sandbox-safe, their destination response/redirect. |
| C36 | README: “There are no accounts, analytics, cookies, third-party scripts, or calendar uploads.” | This is a compound privacy/security promise. | Inspect cookies/storage and requests through the complete demo; assert no auth UI or third-party runtime resource. |
| C37 | README: “Google or Microsoft receives an event only after the user chooses that provider link.” | This repeats disclosure timing. | Cover with C20 and name both provider origins in the assertion. |
| C38 | README: “Dynamic user text is placed into DOM text nodes rather than HTML.” | This is an injection-resistance claim. | Use HTML/script-like fixture text and assert it renders as text with no DOM execution. |
| C39 | README: “Production headers include a restrictive content security policy, no-referrer policy, and permissions policy.” | “Restrictive” is subjective, but header presence/value is testable. | Remove “restrictive”; assert exact production header directives against the live URL. |
| C40 | README: “Requires Node.js 20 or newer.” | This is a compatibility floor. | Add an engines field and CI on the minimum supported Node version. |
| C41 | README: “It type-checks the TypeScript and writes the static site to `dist/`, with `dist/index.html` at its root.” | This describes the reproducible build result. | Add a build-contract test that checks type-check failure behavior and required output paths. |
| C42 | README: “The browser suite covers desktop and a 390 px mobile viewport, console errors, paste/file paths, repairs, QR generation, download, overflow, and serious/critical Axe findings.” | The current suite does not test all repair types or Apple behavior. | Split the sentence and make the test list match actual tagged cases; add missing cases before claiming coverage. |
| C43 | README: deployment config “supplies the navigation fallback, security headers, and immutable asset caching.” | The fallback currently causes the broken 404. | Test known deep links, unknown-route 404 status/content, headers, and immutable asset headers. |
| C44 | README: “No server or environment variables are required.” | This is a deployment/runtime claim. | Build and serve in a clean environment with no product variables; assert the demo and core conversion work. |

## Copy audit

Counts use `Intl.Segmenter('en', {granularity: 'word'})`; numbers count as words. UI templates are listed once with bracketed dynamic values. User-provided event text, formatted dates, and ICS code in the textarea placeholder are excluded. No attached-skill banned word appears. Flags below cover length, jargon/marketing language, inconsistent terms, unclear headings, and non-result-naming controls.

### Landing page and interactive states

| ID | Words | Copy | Flag |
| --- | ---: | --- | --- |
| L01 | 4 | Skip to calendar converter | — |
| L02 | 2 | ICS Rescue | — |
| L03 | 3 | Private by design | CW01 |
| L04 | 6 | Your event has somewhere to go | CW02 |
| L05 | 8 | Turn a stuck .ics into a calendar event. | — |
| L06 | 5 | Drop or paste the invite. | — |
| L07 | 19 | We repair common file problems and give you clean Apple, Google, and Outlook actions—right here on your device. | CW03 |
| L08 | 3 | Nothing is uploaded | — |
| L09 | 3 | Multiple events welcome | CW04 |
| L10 | 3 | Time zones preserved | CW05 |
| L11 | 4 | 01 / Bring the invite | — |
| L12 | 4 | Open your calendar file | — |
| L13 | 9 | Choose the route that is easiest on this device. | CW06 |
| L14 | 2 | You’re offline. | — |
| L15 | 14 | File repair and Apple downloads still work; Google and Outlook open when you reconnect. | — |
| L16 | 4 | Drop your .ics here | — |
| L17 | 8 | or choose it from Files, Mail, or Downloads | — |
| L18 | 4 | Choose an ICS file | — |
| L19 | 4 | Up to 2 MB | — |
| L20 | 4 | stays on this device | — |
| L21 | 4 | or paste its text | — |
| L22 | 3 | ICS calendar text | — |
| L23 | 3 | Read pasted calendar | CW07 |
| L24 | 5 | We couldn’t read that calendar. | — |
| L25 | 2 | Dismiss error | — |
| L26 | 4 | 02 / Choose a calendar | — |
| L27 | 4 | Your events are ready | — |
| L28 | 3 | [count] event/events found. | — |
| L29 | 5 | Review each one before saving. | — |
| L30 | 2 | Start over | CW08 |
| L31 | 4 | [count] issue/issues were repaired. | — |
| L32 | 4 | Calendar repaired and ready. | — |
| L33 | 4 | Calendar checked and ready. | — |
| L34 | 4 | Need the whole calendar? | — |
| L35 | 9 | Keep every event and repair in one clean file. | CW09 |
| L36 | 3 | Download fixed .ics | — |
| L37 | 3 | Share fixed .ics | — |
| L38 | 3 | Repaired for you | — |
| L39 | 3 | Add to Apple | CW10 |
| L40 | 3 | Open in Google | — |
| L41 | 3 | Open in Outlook | — |
| L42 | 3 | Show QR code | CW11 |
| L43 | 7 | Apple and Google preserve the repeat rule. | — |
| L44 | 7 | Outlook opens the first occurrence for review. | — |
| L45 | 15 | Apple uses your phone’s share/download flow; iOS may ask you to confirm once more. | — |
| L46 | 3 | A quiet promise | CW12 |
| L47 | 6 | Your plans never leave the room. | CW13 |
| L48 | 7 | This converter runs entirely in your browser. | — |
| L49 | 10 | We do not upload, store, inspect, or track calendar contents. | — |
| L50 | 12 | Google and Outlook receive event details only if you choose their link. | — |
| L51 | 2 | What happens | — |
| L52 | 6 | A small repair, not a sync. | CW14 |
| L53 | 2 | Read locally | — |
| L54 | 5 | Your browser opens the text. | — |
| L55 | 4 | No account or upload. | — |
| L56 | 2 | Mend safely | CW15 |
| L57 | 13 | We normalize line endings, missing end times, IDs, and common time-zone names. | CW16 |
| L58 | 3 | Hand it onward | CW17 |
| L59 | 12 | Use a provider link, scan a QR, or keep the repaired ICS. | — |
| L60 | 2 | Phone handoff | CW18 |
| L61 | 6 | Scan to add in Google Calendar | — |
| L62 | 7 | The event is encoded in this QR. | — |
| L63 | 11 | It is generated on this device and not uploaded by us. | — |
| L64 | 9 | This event is too detailed for a reliable QR. | — |
| L65 | 5 | Use the Google link instead. | — |
| L66 | 3 | Close QR code | — |
| L67 | 10 | A tiny local-first tool from the Sociobot utility garden. | CW19 |
| L68 | 9 | Hero artwork was generated for this product with AI. | — |
| L69 | 1 | Privacy | — |
| L70 | 1 | Terms | — |
| L71 | 1 | Sociobot | — |
| L72 | 14 | A paper calendar slips through a coral portal into a phone-shaped night garden | — |
| L73 | 3 | ICS Rescue home | — |
| L74 | 2 | Site header | — |
| L75 | 2 | Product benefits | — |
| L76 | 1 | Footer | — |
| L77 | 2 | QR code | — |
| L78 | 10 | ICS Rescue — Add an ICS event to your phone calendar | CW10 |
| L79 | 15 | Repair an ICS file locally and add its events to Apple, Google, or Outlook Calendar. | CW10 |
| I01 | 6 | The file could not be read. | — |
| I02 | 4 | Try another ICS file. | — |
| I03 | 6 | That file is over 2 MB. | — |
| I04 | 5 | Choose a smaller ICS file. | — |
| I05 | 6 | The file could not be opened. | — |
| I06 | 9 | Try saving it to Files and choosing it again. | — |
| I07 | 9 | Paste calendar text or choose an .ics file first. | — |
| I08 | 6 | That calendar is over 2 MB. | — |
| I09 | 4 | Choose a smaller file. | — |
| I10 | 8 | This does not look like an ICS calendar. | — |
| I11 | 3 | It needs BEGIN:VCALENDAR. | — |
| I12 | 7 | An event is incomplete: END:VEVENT is missing. | CW20 |
| I13 | 7 | No events were found in this calendar. | CW21 |
| I14 | 7 | This calendar has more than 100 events. | — |
| I15 | 6 | Split it into smaller files first. | — |
| I16 | 7 | A date has an unsupported value: [value]. | CW22 |
| I17 | 6 | A date is not valid: [value]. | — |
| I18 | 9 | Check the day and time in the source invite. | — |
| I19 | 6 | Event [number] has no start date. | CW23 |
| I20 | 6 | Changed time zone “[source]” to “[replacement]”. | — |
| I21 | 13 | Removed the unrecognized time zone “[zone]”; review this event’s local time before saving. | — |
| I22 | 6 | Normalized line endings for calendar apps. | CW24 |
| I23 | 6 | Added a missing end (next day). | — |
| I24 | 7 | Added a missing end (one hour later). | — |
| I25 | 12 | Replaced an end time that was not after the start (next day). | — |
| I26 | 13 | Replaced an end time that was not after the start (one hour later). | — |
| I27 | 5 | Added a stable event ID. | CW25 |
| I28 | 4 | Named an untitled event. | CW26 |
| I29 | 8 | Checked the calendar structure; no repairs were needed. | — |
| I30 | 3 | Drop it here | — |
| I31 | 2 | All day | — |
| I32 | 1 | Repeats | — |
| I33 | 2 | Untitled event | — |
| I34 | 7 | Show a QR code for [event name] | — |

No landing-page sentence exceeds 22 words. The copy still fails the first-screen shape because there is no audience sentence or primary action there.

### README

| ID | Words | Copy | Flag |
| --- | ---: | --- | --- |
| R01 | 2 | ICS Rescue | — |
| R02 | 15 | ICS Rescue turns an existing `.ics` attachment or pasted calendar into usable phone-calendar actions. | CW27 |
| R03 | 26 | It is aimed at iPhone users who can preview an invite but cannot get iOS to import it, and at anyone sending an invite to them. | CW28, over 22 |
| R04 | 6 | Live: https://ics-to-phone-calendar.sociobot.in | — |
| R05 | 3 | What it does | — |
| R06 | 11 | Reads dropped, selected, or pasted ICS text entirely in the browser. | — |
| R07 | 13 | Handles up to 100 events / 2 MB and unfolds RFC 5545 continuation lines. | CW29 |
| R08 | 29 | Repairs LF line endings, missing event IDs, missing or invalid end times, untitled events, common Windows time-zone names, and unrecognized time-zone labels (with a visible review warning). | CW30, over 22 |
| R09 | 18 | Keeps multi-event files, all-day events, durations, descriptions, locations, URLs, recurrence rules, and safe unrecognized event properties. | CW31 |
| R10 | 21 | Creates per-event Google and Outlook compose links, local Apple-compatible ICS files, QR handoffs, and one repaired multi-event download. | CW32 |
| R11 | 8 | Caches the app shell for repeat/offline use. | CW33 |
| R12 | 8 | Calendar content is never written to that cache. | — |
| R13 | 19 | Apple does not publish a general add-event web URL, and `webcal://` requires the calendar contents to be hosted. | CW34 |
| R14 | 9 | This static, privacy-first product does not upload them. | CW35 |
| R15 | 33 | “Add to Apple” therefore opens the native file-share flow where supported and otherwise downloads a repaired `.ics`; depending on the iOS release, Apple may require one confirmation or a share-sheet choice. | CW36, over 22 |
| R16 | 9 | Google and Outlook links open their review screens directly. | — |
| R17 | 3 | Privacy and security | — |
| R18 | 12 | There are no accounts, analytics, cookies, third-party scripts, or calendar uploads. | — |
| R19 | 14 | Google or Microsoft receives an event only after the user chooses that provider link. | — |
| R20 | 12 | Dynamic user text is placed into DOM text nodes rather than HTML. | CW37 |
| R21 | 14 | Production headers include a restrictive content security policy, no-referrer policy, and permissions policy. | CW38 |
| R22 | 4 | See `/privacy/` and `/terms/`. | — |
| R23 | 1 | Develop | — |
| R24 | 5 | Requires Node.js 20 or newer. | — |
| R25 | 6 | The required reproducible production command is: | — |
| R26 | 3 | npm run build | — |
| R27 | 18 | It type-checks the TypeScript and writes the static site to `dist/`, with `dist/index.html` at its root. | CW39 |
| R28 | 1 | Test | — |
| R29 | 2 | npm test | — |
| R30 | 15 | For browser flows and Axe accessibility checks, install the Chromium test browser once and run: | CW40 |
| R31 | 4 | npx playwright install chromium | — |
| R32 | 3 | npm run test:e2e | — |
| R33 | 26 | The browser suite covers desktop and a 390 px mobile viewport, console errors, paste/file paths, repairs, QR generation, download, overflow, and serious/critical Axe findings. | CW41, over 22 |
| R34 | 1 | Deploy | — |
| R35 | 11 | Deploy the contents of `dist/` as an Azure Static Web App. | — |
| R36 | 18 | `public/staticwebapp.config.json` is copied into the build and supplies the navigation fallback, security headers, and immutable asset caching. | CW42 |
| R37 | 7 | No server or environment variables are required. | — |
| R38 | 2 | Project notes | — |
| R39 | 4 | Product brief: `.factory/brief.json` | — |
| R40 | 8 | Visual system and generated-art provenance: `.factory/design.md` | CW43 |
| R41 | 4 | Build handoff: `.factory/handoff.md` | — |
| R42 | 2 | License: MIT | — |

### Flagged-copy findings and rewrites

| Finding | Quote | Problem | Proposed rewrite |
| --- | --- | --- | --- |
| CW01 | “Private by design” | A navigation link does not name its destination; “by design” is an unsupported adjective. | “Privacy” |
| CW02 | “Your event has somewhere to go” | Metaphor does not identify the job or audience. | “For invites that open but will not import” |
| CW03 | “clean … actions” | “Clean” is marketing language and “actions” does not name the outputs. | “We repair common ICS errors and create Apple downloads plus Google and Outlook links.” |
| CW04 | “Multiple events welcome” | Friendly marketing phrase hides the actual limit. | “Reads up to 100 events” after adding C04/C26 tests. |
| CW05 | “Time zones preserved” | Absolute wording conflicts with removal of unknown time zones. | “Shows time-zone repairs before you save” after testing it. |
| CW06 | “Choose the route that is easiest on this device.” | “Route” is interface jargon and gives no action. | “Choose an ICS file or paste its text.” |
| CW07 | “Read pasted calendar” | The button names processing, not the result. | “Show calendar events” |
| CW08 | “Start over” | The result of the destructive reset is unclear. | “Clear this calendar” |
| CW09 | “one clean file” | “Clean” is undefined. | “Keep every repaired event in one ICS file.” |
| CW10 | “Add to Apple” | The fallback downloads or shares a file; it does not directly add the event. | “Download ICS for Apple” |
| CW11 | QR icon with tooltip “Show QR code” | The visible button has no result-naming words. | Show the visible label “Show QR code.” |
| CW12 | “A quiet promise” | The heading has no meaning out of context. | “How your calendar data is handled” |
| CW13 | “Your plans never leave the room.” | Metaphor is broader than the disclosed provider-link behavior. | “Calendar data stays in this browser until you open a provider link.” |
| CW14 | “A small repair, not a sync.” | “Sync” is unexplained and the heading does not name the section. | “How ICS repair works” |
| CW15 | “Mend safely” | Metaphor plus an untested safety adjective. | “Repair common errors” |
| CW16 | “normalize line endings” | Parser jargon on visitor-facing copy. | “Fix text formatting, missing end times, event IDs, and common time-zone names.” |
| CW17 | “Hand it onward” | Metaphor hides the user action. | “Choose a calendar” |
| CW18 | “Phone handoff” | “Handoff” is product jargon. | “Open this event on your phone” |
| CW19 | “A tiny local-first tool from the Sociobot utility garden.” | “local-first” and “utility garden” require context and do not state the job. | “Repair ICS files in your browser.” |
| CW20 | “An event is incomplete: END:VEVENT is missing.” | Explains the fault but not the next action. | “An event is missing `END:VEVENT`. Add it to the ICS text, then try again.” |
| CW21 | “No events were found in this calendar.” | Gives no recovery action. | “No events were found. Choose an ICS file that contains at least one `VEVENT`.” |
| CW22 | “A date has an unsupported value: [value].” | Gives no accepted format or next action. | “The date [value] is unsupported. Use `YYYYMMDD` or `YYYYMMDDTHHMMSS`, then try again.” |
| CW23 | “Event [number] has no start date.” | Gives no recovery action. | “Event [number] has no start date. Add `DTSTART`, then try again.” |
| CW24 | “Normalized line endings for calendar apps.” | “Line endings” is developer jargon. | “Fixed text formatting required by calendar apps.” |
| CW25 | “Added a stable event ID.” | “Stable event ID” is unexplained. | “Added the unique event identifier required by calendar apps.” |
| CW26 | “Named an untitled event.” | The result is circular. | “Added the title ‘Untitled event.’” |
| CW27 | “usable phone-calendar actions” | “Usable” is marketing language; “actions” is vague. | “ICS Rescue turns an ICS file or pasted ICS text into Apple downloads and Google or Outlook links.” |
| CW28 | 26-word audience sentence | Exceeds 22 words and joins two audiences. | “It is for iPhone users whose invites preview but will not import. It also helps people sending those invites.” |
| CW29 | “unfolds RFC 5545 continuation lines” | Standards jargon interrupts the feature summary. | “Handles up to 100 events or 2 MB and joins wrapped ICS lines.” |
| CW30 | 29-word repair list with “LF” | Exceeds 22 words and mixes jargon with seven outcomes. | “Repairs missing IDs, invalid end times, untitled events, and common Windows time zones. It also fixes line breaks and warns about unknown zones.” |
| CW31 | “durations … recurrence rules … unrecognized event properties” | Dense schema terms make the preservation claim hard to scan. | “Keeps event length, notes, places, links, repeats, and extra ICS fields it can copy safely.” |
| CW32 | “per-event … compose links … QR handoffs” | Compound jargon obscures the outputs. | “Creates Google and Outlook links for each event, Apple ICS downloads, QR codes, and one repaired calendar file.” |
| CW33 | “app shell for repeat/offline use” | “App shell” and “repeat use” are developer terms. | “After the first visit, it caches public app files for offline use.” |
| CW34 | “general add-event web URL” / “`webcal://`” | Platform jargon is not explained. | “Apple provides no public link for adding any event. Calendar subscriptions would require us to host your data.” |
| CW35 | “static, privacy-first product” | Architecture and marketing labels replace the concrete behavior. | “ICS Rescue does not upload calendar data.” |
| CW36 | 33-word “Add to Apple” sentence | Exceeds 22 words and buries the actual fallback. | “For Apple, ICS Rescue shares the repaired file when supported. Otherwise, it downloads the file. iOS may ask for another confirmation.” |
| CW37 | “DOM text nodes rather than HTML” | Implementation jargon. | “The interface displays pasted text as text. It does not run it as webpage code.” |
| CW38 | “restrictive content security policy, no-referrer policy, and permissions policy” | “Restrictive” is subjective and the header names are unexplained. | “Production headers restrict loaded code, referrer data, and device permissions.” |
| CW39 | “type-checks the TypeScript” | Developer jargon can be stated as an outcome. | “The command checks TypeScript, then writes deployable files to `dist/`.” |
| CW40 | “Axe accessibility checks” | Tool name is unexplained. | “For browser flows and automated accessibility checks, install Chromium once and run:” |
| CW41 | 26-word test-coverage sentence | Exceeds 22 words and compresses unrelated checks. | “The browser suite covers desktop and a 390 px viewport. It checks loading, imports, repair, QR, downloads, overflow, and serious Axe issues.” |
| CW42 | “navigation fallback” / “immutable asset caching” | Deployment jargon obscures behavior; the fallback is currently faulty. | “The config supplies route and security headers. It also caches versioned assets.” |
| CW43 | “generated-art provenance” | Project-note jargon. | “Visual system and artwork source: `.factory/design.md`” |

### Terminology consistency

| Concept | Current terms | Use consistently |
| --- | --- | --- |
| Imported object | invite, `.ics`, ICS, calendar, calendar file, ICS file, attachment, pasted calendar | “ICS file” for a file; “ICS text” for pasted input |
| Contained item | event, invite | “event” |
| Repaired output | clean file, fixed `.ics`, repaired ICS, Apple-compatible ICS | “repaired ICS file” |
| Apple destination | Apple, Apple Calendar, phone calendar | “Apple Calendar”; describe the action as download/share unless direct add is proven |
| Provider output | actions, provider link, compose link, review screen | “calendar link” in visitor copy; reserve “compose URL” for technical notes |
| Reset | Start over, Reset demo (required but absent) | “Clear this calendar” for real input; “Reset demo” for sample state |

## Demo, privacy, and offline observations

- There is no demo entry point, banner, reset, real-mode exit, sample fixture, `.factory/demo.md`, or demo storage namespace.
- A manually supplied realistic event rendered one event, mapped `Eastern Standard Time` to `America/New_York`, added a one-hour end and event ID, generated Google/Outlook URLs and a QR, and downloaded `repaired-calendar.ics`.
- During load and that conversion/QR/download flow, every observed request was same-origin. QR generation fetched the same-origin lazy chunk `/assets/browser-CqDbEFy1.js`.
- After the flow, localStorage and sessionStorage were empty, IndexedDB had no databases, and Cache Storage contained only public shell URLs. The unique sample title was absent from cached responses.
- After one online load, an offline reload succeeded; the sample still parsed and downloaded. Clicking Google while offline stayed on the product and showed the offline notice.
- These manual observations support the implementation but are not replacements for the missing claim registry and clean-demo claim tests.

## Structure, accessibility, and link checks

| Check | Result |
| --- | --- |
| Existing route titles | Pass: home 52 characters; Privacy 20; Terms 18. Pattern is clear. |
| One `h1`, `lang`, `main`, image alt | Pass on home, Privacy, and Terms. |
| Meta descriptions | Present and under 155 characters on all three existing pages. |
| Canonical / OG / Twitter / apple-touch | Fail: absent. |
| Favicon | Partial: SVG favicon exists; 180 px Apple touch icon is absent. |
| 404 | Fail/blocking: unknown paths return the home page with 200. |
| Deep links | Partial: `/privacy/` and `/terms/` reload correctly; `/demo` is not implemented. |
| Back button | URL and prior scroll position restored in the tested full-page flow. |
| Route focus | Fail: Privacy load and back restoration left focus on `BODY`. |
| Links | Pass for status: all unique home/Privacy/Terms/Sociobot targets returned 200. |
| Header/footer | Fail: inconsistent legal layout; missing Demo, cross-links, Param Factory credit, and build ID. |
| Visual identity | Pass: the paper/coral/night-garden editorial treatment is distinct and matches `.factory/design.md`; it is not a generic SaaS hero. The art's height contributes to B1. |
| Axe | Pass: zero violations at 390 × 844 and 1440 × 900 on home, Privacy, and Terms. |
| Keyboard smoke | Pass: skip link, home, Privacy, file input, textarea, parse button, and footer links were reachable in order. |
| Console / overflow | Pass: no page/console errors and no horizontal overflow at either viewport. |
| Reduced motion | Pass by inspection: `prefers-reduced-motion: reduce` reduces animation and transition durations. |
| Security headers | Pass for the tested live response: CSP, no-referrer, permissions policy, nosniff, and HSTS were present. |
| Script budget | Pass: build reported 7.67 kB gzip initial JS and 10.14 kB gzip lazy QR JS. |

The factory `verify-url.sh` passed the live home page with title, `lang=en`, one `h1`, `<main>`, complete image alt text, labeled buttons, and no console errors.

## Repository verification

The repository was cloned with `git clone --no-hardlinks /work/repo <temp>/repo` before documentation changes.

| Command | Result |
| --- | --- |
| `test -f .factory/claims.json` | **FAIL:** file absent |
| search for `@claim:` | **FAIL:** no tagged claim tests |
| `npm ci` | Pass: 90 packages, 0 vulnerabilities |
| `npm test` | Pass: 8 unit tests |
| `npm run build` | Pass; `dist/` created |
| `npm run test:e2e` | Pass: 5 passed, 1 expected project-specific skip |

No product code was modified during this review.
