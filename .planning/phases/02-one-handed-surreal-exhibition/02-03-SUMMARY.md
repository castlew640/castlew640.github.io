---
phase: 02-one-handed-surreal-exhibition
plan: 03
subsystem: ui
tags: [astro, svg, accessibility, reduced-motion, exhibition]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Static stop catalogue, published exhibit source, palette and drawing styles from plan 02-02
provides:
  - Four original architectural SVG drawings at entrance, exhibit, about and landing stops
  - Completed reflected silhouettes beneath unfinished architecture in the still catalogue
  - Floating cornice, resolving stair and drawn-only landing support without JavaScript
affects: [02-05, 02-06, 02-07, 02-08]
tech-stack:
  added: []
  patterns:
    - Local SVG defs/use share geometry between unfinished structures and transformed completed reflections
    - Every decorative drawing is hidden from assistive technology and excluded from keyboard focus
    - Per-exhibit SVG IDs include the deterministic variant index to prevent document collisions
key-files:
  created:
    - src/components/exhibition/drawings/EntranceDrawing.astro
    - src/components/exhibition/drawings/ExhibitDrawing.astro
    - src/components/exhibition/drawings/AboutDrawing.astro
    - src/components/exhibition/drawings/LandingDrawing.astro
  modified:
    - src/components/exhibition/ExhibitSection.astro
    - src/pages/index.astro
key-decisions:
  - Share geometry through local SVG defs/use so the reflection completes drawn-only members without duplicating path sets.
patterns-established:
  - New drawings use palette tokens, the approved literal stroke widths/dashes, and unique definition IDs; shipped Fig. 01 stays unchanged.
  - Completed silhouette groups render beneath the horizon through translate and vertical scale at 0.35 opacity.
requirements-completed: [ART-01, ART-02, ACCESS-04]
duration: 9 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 3: Architectural Still Drawings Summary

**Four hand-authored architectural SVGs show unfinished ivory structures above completed reflections, including a floating cornice and an arch resting on a drawn pier, without scripts or animation.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-09-20T18:22:55Z
- **Completed:** 2026-09-20T18:32:16Z
- **Tasks:** 2
- **Files modified:** 6 implementation files

## Accomplishments

- Added Fig. 02–05 in document order while preserving the shipped Fig. 01 study, approved project imagery and prose, and the landing's unique accessible name.
- Drew the entrance's coffered ceiling breaking into roof ribs, plus exhibit portal variants with invariant panel/reveal, sill, three rust ticks and leader. Each published exhibit supplies its deterministic index.
- Added the About stop's floating cornice with four dashed construction supports, drawn arcades and stair treads resolving through a restrained 35°/7px rust hatch.
- Finished the catalogue with a single landing arch, a solid left pier, a drawn-only right pier, and the existing horizon gradient behind the opening.
- Reflections share the original geometry and complete its drawn-only forms at 0.35 opacity. All four drawings remain decorative, static and small.

## Task Commits

Each task was committed atomically with normal hooks:

1. **Draw the entrance and the exhibit portal** — `9f615d7` (feat)
2. **Draw the about stop and the landing, including both impossible-construction instances** — `376b7af` (feat)

## Files Created/Modified

- `src/components/exhibition/drawings/EntranceDrawing.astro` — Enclosed vestibule, abruptly unfinished ceiling, threshold arch and completed reflection.
- `src/components/exhibition/drawings/ExhibitDrawing.astro` — Deterministic profile/flanking variations, invariant evidence frame and annotation, index-scoped SVG IDs.
- `src/components/exhibition/drawings/AboutDrawing.astro` — Floating cornice, four construction lines, arcades, hatch and resolving stair; complete reflected supports.
- `src/components/exhibition/drawings/LandingDrawing.astro` — Quiet final arch resting on one drawn pier, horizon gradient and completed reflection.
- `src/components/exhibition/ExhibitSection.astro` — Drawing after the real figure and before the exhibit eyebrow, with `variant={index}`.
- `src/pages/index.astro` — Entrance, About and landing drawings within their existing semantic stops.

## Verification

- Task 1 passed `npm run build` and all **11/11** skeleton/portfolio browser tests. A separate Chromium audit confirmed **40 consecutive Tab presses never entered a drawing**.
- Final `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed: Astro check **0 errors, 0 warnings, 1 pre-existing hint**; static build, built-content check, scene boundary check, **5/5 unit tests**, **11/11 browser tests**, including **zero axe violations** on home and project routes.
- Drawing-specific Chromium checks with JavaScript disabled and reduced motion enabled confirmed exactly **five visible architectural studies**, **four completed reflection groups**, unique document IDs, the actual horizon gradient, **zero running animations**, 40 tabs outside the drawings, and all drawings visible at **320px without horizontal overflow**.
- Source/build checks verified token colors, approved stroke widths/dash arrays, four individual cornice construction lines, 35°/7px hatch, hidden wrappers, scalable unfocusable SVGs, Fig. 01–05 order, local-only references, and no scripts, raster images, external URLs or duplicate SVG IDs.
- Inspected desktop/mobile full-page captures and all four individual drawing captures. Screenshots remain temporary review artifacts: `/tmp/phase02-drawings-desktop.png`, `/tmp/phase02-drawings-mobile.png`, and `/tmp/phase02-drawing-{2,3,4,5}.png`.
- `gzip -c dist/index.html | wc -c`: **5,216 bytes** for the finished home page (Task 1: 4,044 bytes).

Extracted SVG markup at gzip level 9, each below the **12,288-byte** limit:

| Drawing | Gzipped SVG bytes |
|---------|------------------|
| Entrance / Fig. 02 | 775 |
| Exhibit / Fig. 03 | 712 |
| About / Fig. 04 | 1,080 |
| Landing / Fig. 05 | 575 |

The preserved Fig. 01 SVG measures 861 bytes. No stubs, new unmodeled trust boundaries or unexpected tracked-file deletions were introduced.

## Decisions Made

Local SVG definitions share path geometry between the visible unfinished architecture and each completed reflection. Build-time index-scoped IDs keep repeated exhibit drawings deterministic without runtime code or external asset requests.

## Deviations from Plan

None — plan executed as written. The existing Fig. 01 markup, global reduced-motion rules, content and unique landing landmark were preserved.

## Issues Encountered

- The sandbox prevented local preview/Chromium startup and git index writes. Verification and commits succeeded through the required escalation flow, with normal hooks enabled.
- The existing `z.string().url()` deprecation hint remains unchanged; it was already documented in the phase's `deferred-items.md` by plan 02-02.

## User Setup Required

None — no dependencies, account configuration or publication inputs were added.

## Next Phase Readiness

- Ready for the optional navigation and scene plans; the static illustrated catalogue and its reflection vocabulary are implemented.
- Current published content has one exhibit and exactly the two required fixed impossible constructions. No fake exhibit was added.
- Requirements above record this plan's still-catalogue slice; remaining spatial behavior and complete Phase 2 acceptance belong to subsequent plans. No later plan was executed and the phase is not finalized.

---
*Phase: 02-one-handed-surreal-exhibition*
*Completed: 2026-09-20*

## Self-Check: PASSED

All four new components and this summary exist; both task commits resolve in git. Required checks passed, no unexpected deletions occurred, and only the pre-existing Phase 1 context edit remains outside this plan's staged files.
