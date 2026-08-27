# Visual thesis — The impossible calendar garden

## Direction and rationale

The product uses **surreal editorial scenery**: a cream paper event ticket crosses a coral aperture into a midnight-blue phone-calendar garden. The scene turns the invisible job—repairing a tiny text file so a phone can accept it—into one clear physical metaphor. The interface itself stays calm and tool-like; the surreal world appears at the opening and in small botanical/astronomical details, never behind form text.

This is a deliberately single-mode, warm-light experience. A dark theme would invert the paper metaphor and weaken recognition of the drop surface, so the page explicitly paints every background.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F4ECDD` | page background |
| Chalk | `#FFF9EF` | input and event surfaces |
| Ink | `#17283B` | primary text, 12.9:1 on Paper |
| Slate | `#506071` | secondary text, 5.7:1 on Paper |
| Coral | `#D94F3D` | primary actions, marks, focus accents |
| Deep coral | `#A93427` | hover/pressed, 5.3:1 with white |
| Cobalt | `#1E4F8F` | Google/Outlook action family |
| Moss | `#3E6A55` | valid/repaired status |
| Ochre | `#9A5B08` | warning status |
| Danger | `#A6333C` | invalid state |
| Night | `#102337` | footer and illustration depth |

Color is never the only state signal; every status has an icon and text.

## Type

- Editorial display: Georgia, `Times New Roman`, serif. Its high-contrast shapes make the utility feel like a printed almanac without downloading a font.
- Interface: `Inter`-like native system stack (`ui-sans-serif`, `-apple-system`, BlinkMacSystemFont, `Segoe UI`, sans-serif) for crisp iPhone controls and zero font payload.
- Scale: 15 / 17 / 20 / 28 / clamp(38–64) px. Body is 17 px, with 1.55 leading and a 68-character reading measure. Event dates use tabular numerals.

## Spacing and composition

An 8 px base rhythm with half-step 4 px accents. Major sections use 64–112 px vertical breathing room. The desktop opening is an asymmetric editorial spread (copy 7/12, art 5/12); the phone version drops the extended scene crop, stacks the art below the promise, and keeps the import control in the first viewport. Independent events are cards; instructions are grouped by proximity without card chrome.

Corners are mostly 18–28 px, like clipped ticket stock. Fine 1 px ink rules and offset shadows evoke print registration. Touch targets are at least 44 px.

## Interaction grammar

- The dashed drop field is the single gateway. Dragging a file moves its inner paper edge inward and changes the explicit label to “Drop it here.”
- Parsing reveals an event ledger directly below the gateway. Status lines explain repairs before actions appear.
- Provider actions are verb-led and consistent: “Add to Apple”, “Open in Google”, “Open in Outlook”. Apple generates a fresh standards-compliant ICS download because public `webcal://` requires hosting user data, which this product refuses to do.
- A “Start over” action returns to the empty state; file input, paste area, and keyboard paste all converge on the same parser.

## Motion

On first paint, copy and hero fade/translate 10 px over 260 ms. Event cards enter from the import gateway over 220 ms with small stagger. Buttons compress by 1 px on press. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and stagger are removed and all transitions become effectively instant.

## Asset plan and provenance

### `public/hero-calendar-portal.webp`

- Purpose: opening editorial illustration explaining “a stuck event passes safely into the phone calendar.”
- Use case: `stylized-concept`; generated raster, then cropped and optimized to WebP with ImageMagick.
- Generator: Azure AI Foundry via `/opt/fleet/lib/gen-image.sh`, deployment `factory-image`.
- Date: 2026-08-27.
- License/provenance: original AI-generated image commissioned for this product; no source photography, brands, or copyrighted characters.
- Prompt: “Surreal editorial still life for a privacy-first web utility. A folded ivory calendar event card passes through a small vermilion circular portal and emerges inside a deep midnight-blue smartphone-shaped garden, where tiny paper moons, clock hands, and moss-green leaves grow in orderly calendar squares. Tactile cut-paper, painted plaster, subtle grain, crisp sculptural shadows, warm museum light, poetic but precise, palette of parchment cream, coral red, midnight navy, cobalt and moss. Landscape composition with visual interest on the right and calm negative space on the left, no people. No text, no numbers, no interface labels, no logos, no watermark, no recognizable brands, no gradients, no neon, no generic 3D app icons.”
- Review checklist: no people/anatomy; no brands or recognizable UI; no legible/generated text; portal and paper path read clearly; palette matches tokens; no misleading product function.

Hand-authored SVG icons in the UI use simple original line geometry and are part of the source code; there is no third-party icon set.
