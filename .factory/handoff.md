# Add an ICS invite to your phone calendar — verification 3 handoff

- Work order: ics-to-phone-calendar-verify-3
- Live URL: https://ics-to-phone-calendar.sociobot.in
- Implementation reviewed: 05ed4facc5c25843ec526dfab17df10cd84cd6f9
- Earlier verification record: e50363672a663f050b024a590f933990992102ba
- Documentation commit reviewed: 9a63a517f7673119da233dfba3eb1c6ea18e2af9
- Verified: 2026-09-05 UTC
- Full report: .factory/verification-3.md

## Result: FAIL

Independent QA found one low-severity defect and no untested claims. Several header and footer links have active rectangles narrower than the required 44 CSS pixels. The desktop demo banner’s Reset demo and Start for real controls are 40 pixels high. Product code was not changed because this work order is report-only.

Everything else tested in scope passed:

- The first screen names the phone-calendar job, the iPhone audience, and “Try it with sample data” before scrolling.
- The sample loads three realistic events and keeps the demo label visible.
- Reset demo restores the sample. Start for real returns to empty real mode without browser-stored calendar data.
- Selected file, paste, drag and drop, invalid input, repair recovery, exact capacity boundaries, provider URLs, ICS downloads, and QR output passed.
- All seven declared claim commands passed independently. No claim is untested.
- npm test passed 8 of 8; npm run build produced dist; npm run test:e2e passed 23 with one expected skip.
- Home, Demo, Privacy, Terms, and 404 passed live desktop and phone structure and Axe scans.
- Home to Privacy to Back focus and announcements passed with the live no-referrer policy.
- Live offline demo reload and Apple ICS download passed.
- The live browser flow made only same-origin requests before a provider link opened and left calendar data out of browser storage.
- All 21 public build files matched live HTTPS byte for byte.
- Live mobile Lighthouse scored 100 for performance, accessibility, best practices, and SEO. LCP was 1.1 seconds and CLS was 0.

## How to verify

From a clean checkout with Node.js 20 or newer:

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e
```

Run each command in .factory/claims.json separately for the contract-level claim result. Evidence from this verification is under /work/.evidence/ics-to-phone-calendar-verify-3/.

## Earlier findings

All Review 1 and Review 2 findings remain fixed. This includes the first-screen actions, demo sandbox, claims registry, honest Apple download wording, designed 404, metadata, shared shell, page order, external-link disclosure, route focus under no-referrer, and both README wording fixes. Verification 1’s unavailable-candidate issue is superseded because the current implementation commit exists and all live build files match it.

## Next step

Increase affected header, footer, and demo-banner controls to at least 44 by 44 CSS pixels without adding phone overflow. Then repeat the target measurements, claims, route scans, and full browser suite. No other repair is indicated.
