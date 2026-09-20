---
phase: 02-one-handed-surreal-exhibition
plan: 02
subsystem: ui
tags: [astro, static-html, accessibility, exhibition, playwright]
requires:
  - phase: 01-publishable-portfolio-and-delivery
    provides: Published project collection, approved evidence, profile routes, and deployment checks
  - phase: 02-one-handed-surreal-exhibition
    provides: Approved UI contract and scene import boundary from plan 02-01
provides:
  - Static exhibition catalogue with entrance, published exhibit, about, and landing stops
  - Same-origin sized WebP exhibit image and authoritative data-slug metadata
  - Exhibit-specific case-study return anchor and enforced 200-character summaries
  - Exhibition CSS layer, palette, typography, and preserved direct navigation
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08]
tech-stack:
  added: []
  patterns:
    - Ordinary HTML is the exhibition presentation before any enhancement
    - StopSection emits focusable stops and optional explicit slug metadata
    - Build-time getImage creates the shared panel asset with intrinsic dimensions
key-files:
  created:
    - src/components/exhibition/ExhibitionShell.astro
    - src/components/exhibition/StopSection.astro
    - src/components/exhibition/ExhibitSection.astro
  modified:
    - src/pages/index.astro
    - src/pages/projects/[...slug].astro
    - src/content.config.ts
    - src/styles/global.css
    - tests/portfolio.spec.ts
    - scripts/verify-built-content.mjs
key-decisions:
  - Label the landing with both resume-title and contact-title so it has a unique accessible name distinct from its nested Contact landmark.
patterns-established:
  - Exhibit slugs are emitted as data-slug; future scene consumers must read that attribute.
  - The exhibit arrow contributes to the exact accessible name Read case study →.
  - Full-height stops use 100svh and zero scroll margin while existing profile anchors retain their semantics.
requirements-completed: [ART-01, ART-02, NAV-05, NAV-06, ACCESS-04]
duration: 11 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 2: Exhibition Catalogue Summary

**Static full-height exhibition stops present approved project evidence, preserve direct profile navigation, and return case studies to their own exhibit anchors without JavaScript.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-09-20T18:08:39Z
- **Completed:** 2026-09-20T18:19:38Z
- **Tasks:** 3
- **Files modified:** 9 implementation/test files, plus execution documentation

## Accomplishments

- Replaced the home project cards with an accessible catalogue while preserving the shipped hero drawing, profile copy, four navigation headings, and section order.
- Added one real exhibit from the validated published-project source, with a 1600px WebP image, explicit dimensions, three contract labels, exact link copy, and runtime slug metadata.
- Added the exhibition cascade layer and eleven palette tokens, full-height stops, catalogue typography, centre-cropped images, and styling hooks for plan 02-03's drawings. Existing tokens, breakpoints, and reduced-motion rules remain intact.
- Updated case-study return navigation and the deployment gate; overlong summaries and retired home-link wording now fail checks.

## Task Commits

Each task was committed atomically with normal hooks:

1. **Build the exhibition catalogue document structure** — `9d8d79d` (feat)
2. **Add the exhibition cascade layer, palette, and catalogue typography** — `b3b682d` (feat)
3. **Move the return path onto the exhibit anchor and update the shipped gate** — `18010f3` (feat)

## Files Created/Modified

- `src/components/exhibition/ExhibitionShell.astro` — Static exhibition wrapper and slot.
- `src/components/exhibition/StopSection.astro` — Shared stop ID, class, focus target, heading label, and optional slug attributes.
- `src/components/exhibition/ExhibitSection.astro` — Published evidence, image processing, contract labels, and canonical case-study link.
- `src/pages/index.astro` — Catalogue tree, real empty state, preserved profile sections, and uniquely named landing landmark.
- `src/pages/projects/[...slug].astro` — Ordinary return link to the corresponding exhibit.
- `src/content.config.ts` — Build-time summary limit of 200 characters.
- `src/styles/global.css` — Exhibition layer, extended palette, typography, image crop, and drawing/horizon styles.
- `tests/portfolio.spec.ts` — Exactly six existing statements updated and two copy assertions added; no protected assertions removed.
- `scripts/verify-built-content.mjs` — Checks the exhibit identifier, approved link wording, retired copy absence, and return anchor.

## Verification

- Task 1 and Task 2 each passed `npm run build` and all five unchanged `tests/skeleton.spec.ts` tests.
- Source/build acceptance checks passed for required IDs, stop focus attributes, exhibit-only `data-slug`, explicit eager image dimensions, one canonical exhibit link, eleven palette tokens, `100svh`, reused breakpoints, and byte-identical original reduced-motion block/tokens.
- Reversible negative checks passed: a 201-character summary failed content validation naming `summary` and the 200-character limit; adding retired wording to the home source failed the built-content gate; zero published projects produced the exact empty-state copy with no exhibit or slug metadata. Original source files were restored.
- Final `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed on the final source tree: Astro check reported **0 errors, 0 warnings, 1 pre-existing hint**; build, built-content gate, scene boundary, **5/5 unit tests**, and **11/11 browser tests** passed.
- Browser coverage includes no-JavaScript direct navigation and exhibit return at 320px, reduced motion, keyboard focus, enlarged text, reflow at 320/390/768/1440px, and **zero axe violations on both routes**.
- `tests/skeleton.spec.ts`, `src/lib/project-schema.ts`, and all published project content are unchanged. The existing figure-count, project visibility, and reduced-motion assertions are preserved.
- No `set:html`, `innerHTML`, stubs, or new unmodeled trust boundaries were introduced.

## Decisions Made

The landing references `resume-title contact-title` instead of only `contact-title`. This gives the outer region the distinct accessible name “Resume Contact” while retaining both nested sections and their shipped headings.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Give the landing a unique landmark name**
- **Found during:** Task 3 full deployment check.
- **Issue:** The prescribed landing and nested Contact section both referenced `contact-title`, producing axe's `landmark-unique` violation.
- **Fix:** Reference both existing heading IDs on the landing wrapper. No copy or navigation assertions were weakened.
- **Files modified:** `src/pages/index.astro`.
- **Verification:** Full deployment check passed, including zero axe violations.
- **Committed in:** `18010f3`.

**Total deviations:** 1 auto-fixed correctness issue. No scope expansion.

## Issues Encountered

- The sandbox blocked the local browser/server, git index writes, and a git subprocess in a source-comparison check. The required checks and commits succeeded through the tool escalation flow; no hooks were bypassed.
- The existing `z.string().url()` deprecation hint was left unchanged and recorded in `deferred-items.md` because it predates this task.

## User Setup Required

None — no dependencies, publication inputs, or external configuration were added.

## Next Phase Readiness

- Ready for plans 02-03 and 02-04: the catalogue and its stop/slug contracts are in place for static drawings and optional motion/navigation enhancement.
- Requirements listed above describe this plan's static catalogue slice. Scene rendering, mesh taps, scroll restoration enhancements, and complete phase acceptance remain with later plans.
- No later plan was executed and Phase 2 is not finalized.

---
*Phase: 02-one-handed-surreal-exhibition*
*Completed: 2026-09-20*

## Self-Check: PASSED

All three created components and this summary exist. All three task commits resolve in git. Required checks passed, source fixtures were restored, no unexpected deletions were committed, and the pre-existing Phase 1 context edit was preserved.
