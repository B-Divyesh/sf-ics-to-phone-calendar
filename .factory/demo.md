# Demo sandbox

Open <https://ics-to-phone-calendar.sociobot.in/?demo=1> or `/demo`.

The bundled sample contains three events: a recurring neighborhood-garden meeting with a repaired Windows time zone, an all-day market pickup, and a school concert with notes and a URL. The sample is rendered on entry.

Demo state exists only in page memory. It does not use localStorage, sessionStorage, IndexedDB, OPFS, cookies, or a server tenant. **Reset demo** reparses the bundled fixture. **Start for real** reloads `/` with an empty real-input state. No demo or real calendar state is read or written when crossing that boundary.

Claim verification uses `/?demo=1` in a new browser context for each test. Run all demo-backed claims with `npm run test:claims`.
