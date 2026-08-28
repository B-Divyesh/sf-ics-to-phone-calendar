# Review 1 handoff — FAIL

Reviewed the live product and base commit `36c2a77bb7dcee4201e56450f4525320bc95cf3c` for work order `ics-to-phone-calendar-review-1`.

## What was done

- Recorded cold first-screen results at 390 × 844 and 1440 × 900.
- Audited every landing-page UI copy unit and every README sentence, with word counts and proposed rewrites for each flag.
- Checked `/demo`, `/?demo=1`, reset/banner/storage requirements, and a manually supplied realistic ICS flow.
- Checked `.factory/claims.json`, claim tags, every live/README claim, and required test coverage.
- Exercised same-origin network privacy, browser storage/cache contents, offline reload, offline download, and provider blocking.
- Audited titles, headings, metadata, links, unknown routes, navigation/back/focus, shared structure, visual identity, keyboard order, Axe, console output, mobile overflow, security headers, and script size.
- Changed no product code.

## Verdict and blockers

**FAIL.** The first screen omits the audience and first product action; there is no one-click sandbox demo; the claims registry/tests are absent; “Add to Apple” overstates the observed download/share fallback and has no representative iPhone test; and unknown routes silently return the home page with HTTP 200.

Full evidence, copy inventory, claim inventory, and fixes are in `.factory/review-1.md`.

## Verification performed

From a clean local clone:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results: 8 unit tests passed; build passed and produced `dist/`; browser suite reported 5 passed and 1 expected project-specific skip. The live `verify-url.sh` check passed, and live Axe scans returned zero violations at both viewports on `/`, `/privacy/`, and `/terms/`.

## Required next steps

Resolve B1–B5 in `.factory/review-1.md`, add and run all claim tests from an isolated `/demo`, then repeat this adversarial review from a fresh mobile context. Passing the existing untagged tests alone is insufficient.
