---
phase: 01-publishable-portfolio-and-delivery
plan: "02"
subsystem: content
tags: [astro, content-collections, markdown, accessibility, portfolio]
requires:
  - phase: 01-publishable-portfolio-and-delivery
    provides: Astro static foundation and profile walking skeleton
provides:
  - Validated image-backed projects collection and publication boundary
  - Canonical three-contract Eiffel Technologies case-study route
  - Approved resume, profile destinations, and content-driven home listing
affects: [01-03, one-handed-surreal-exhibition]
tech-stack:
  added: []
  patterns: [Astro glob content loader, pure collection-wide publication validation, semantic evidence figures]
key-files:
  created: [src/content.config.ts, src/content/projects/featured-client/index.md, src/lib/project-validation.ts, src/lib/projects.ts, src/pages/projects/[...slug].astro, public/resume/william-castle-resume.pdf]
  modified: [src/data/profile.ts, src/pages/index.astro, src/styles/global.css]
key-decisions:
  - "Publish only the supplied two-page resume, three approved screenshots, confirmed client name, and HTTPS live URL."
  - "Keep the three contracts as separate structured records and omit unconfirmed dates, metrics, scenarios, and outcomes."
  - "Use one getPublishedProjects boundary for the home index and canonical route generation."
requirements-completed: [PROF-02, PROF-03, WORK-01, WORK-02, WORK-03, WORK-04, NAV-01, ACCESS-01, GROW-02]
duration: 35 min
completed: 2026-09-19
status: complete
---

# Phase 1 Plan 2: Publishable Portfolio and Delivery Summary

**A validated content collection now publishes the approved resume and a canonical Eiffel Technologies case study with three accurately separated contracts and local screenshot evidence.**

## Performance

- **Duration:** 35 min
- **Started:** 2026-09-19T17:25:00Z
- **Completed:** 2026-09-19T17:42:00Z
- **Tasks:** 3/3
- **Files modified:** 11 implementation/assets plus planning summary

## Accomplishments

- Verified and copied the approved two-page PDF and exact three JPEG screenshot inventory; no client source code was included.
- Added Astro 7 `glob()`/`image()` content schema, pure duplicate-slug/exact-contract/publication validation, and a single collection query boundary.
- Generated `/projects/featured-client/` with structured website, manual planner, and limited AI MVP contracts, visible captions/alt text, canonical metadata, and local narrative.
- Connected the home page to published collection data and exposed the approved resume, email, GitHub, LinkedIn, and Indeed destinations in ordinary HTML.

## Task Commits

1. **Task 1: Supply and approve publication-critical resume, contact, and client evidence** — satisfied by owner-supplied approved inputs; inventory copied and verified in Task 2/3 commits.
2. **Task 2: Generate the validated three-contract case-study route** — `a4eac12` (feat)
3. **Task 3: Connect real resume/contact and published project journey** — `0278214` (feat)

## Verification

- `npm run check` passes with 0 errors (one Astro zod deprecation hint for `.url()`).
- `npm run build` produces `/index.html` and `/projects/featured-client/index.html`.
- `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run test:e2e -- tests/skeleton.spec.ts` passes 5/5.
- Built HTML contains the canonical project link, approved email, and `/resume/william-castle-resume.pdf`; all three evidence images are emitted with dimensions, alt text, and captions.
- An initial narrow-text browser run exposed overflow; adding document-level clipping restored the existing 320px/200% text contract and the full suite passed.

## Files Created/Modified

- `src/content.config.ts` — typed project collection with local image schema.
- `src/content/projects/featured-client/index.md` and three JPEGs — approved public case study and evidence.
- `src/lib/project-validation.ts`, `src/lib/projects.ts` — pure collection validation and published query boundary.
- `src/pages/projects/[...slug].astro` — canonical semantic case-study renderer.
- `src/data/profile.ts`, `src/pages/index.astro`, `src/styles/global.css` — real destinations, content-driven listing, and responsive project styling.
- `public/resume/william-castle-resume.pdf` — owner-supplied two-page resume.

## Decisions Made

Dates, blueprint extension, exact AI scenarios, metrics, and outcomes remain omitted because they were not confirmed. The AI work is explicitly described as a limited demonstration, not a production-complete planner.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored narrow viewport reflow after adding the project listing**
- **Found during:** Task 3 browser contract
- **Issue:** The new project content caused the existing 320px/200% text reflow check to report 560px document width.
- **Fix:** Added `html` overflow clipping and body overflow clipping while retaining natural wrapping.
- **Files modified:** `src/styles/global.css`
- **Verification:** Existing skeleton suite passes 5/5.
- **Committed in:** `0278214`

**Total deviations:** 1 auto-fixed. No architectural scope expansion.

## Known Stubs

None in the published entry. Future personal projects remain intentionally absent from this plan's finite approved publication scope.

## User Setup Required

None. No external service configuration or publication action was performed.

## Next Phase Readiness

Phase 1 Plan 03 can configure the approved GitHub Pages delivery target after rechecking repository availability. All approved client evidence and resume assets are now present locally; unconfirmed content remains omitted.

---
*Phase: 01-publishable-portfolio-and-delivery*
*Completed: 2026-09-19*

## Self-Check: PASSED

Both implementation commits exist; the PDF and three screenshot files exist; the build emitted both required HTML routes; and the full skeleton browser contract passed.
