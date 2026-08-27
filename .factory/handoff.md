# Independent verification handoff — FAIL

Verified on 2026-08-27 for work order `ics-to-phone-calendar-verify-1`.

## Final status: FAIL

The requested candidate commit, `6dd0edc2a2293a30eae0b361bed19350d439d7e3`, is not present in this checkout or `origin` after a fresh fetch. `git cat-file -e <sha>^{commit}` fails, `git ls-remote origin <sha>` returns no ref, and GitHub's Git Commit API returns HTTP 404. Therefore this verifier cannot authenticate that commit, inspect its tree, or compare deployed assets to it. The deployed site matches the locally built `e6869d4f4d0a5601a5d31dd6380646ebf0b5b1fc` tree exactly for its index, initial CSS, and initial JS, but that is not evidence that it is commit `6dd0…`.

The product itself passed the independent source and live functional checks recorded in `.factory/verification.md`. This does not change the final FAIL: candidate provenance is a release gate.

## What was changed

No product code, configuration, or deploy assets were modified. This handoff and `.factory/verification.md` are documentation-only verification records.

## Re-run

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

For the live endpoint, use the commands and synthetic fixtures documented in `.factory/verification.md`. Obtain or push the requested commit, then rebuild that exact SHA and repeat the live-asset SHA-256 comparison before changing this result.

## Required next step

Make `6dd0edc2a2293a30eae0b361bed19350d439d7e3` reachable in the repository (or correct the supplied SHA). Then independently compare a clean build of that exact commit with the live HTML and all referenced assets. Historical status `000` also needs contemporaneous deployment/DNS/TLS logs for a conclusive causal attribution; current healthy HTTPS alone cannot prove a past failure was only convergence.
