---
phase: 03-growth-and-release-polish
plan: "03"
subsystem: exhibition-route
tags: [threejs, native-scroll, bezier-route, webgl, playwright, accessibility]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Native-scroll controller, vanilla Three.js scene, panel picking, demand rendering, and lifecycle contracts
  - phase: 03-growth-and-release-polish
    plan: "01"
    provides: Stable published project ordering and isolated N=0/1/10 growth fixtures
provides:
  - Deterministic fixed-segment winding route with append-invariant world frames
  - Stable stop-identity scene travel, transformed evidence projection, and route-mounted architecture
  - Phase 3 UI amendment and route-aware browser/unit regression contracts
affects: [03-04, 03-05, 03-06, 03-07, exhibition-scene, project-growth]
tech-stack:
  added: []
  patterns: [scalar-station scene boundary, fixed piecewise route frames, stable stop-id panel selection, actual-corner projection]
key-files:
  created:
    - .planning/phases/03-growth-and-release-polish/03-UI-AMENDMENT.md
    - src/scripts/exhibition/scene/path.ts
    - tests/exhibition-path.test.ts
    - tests/exhibition-route.spec.ts
  modified:
    - src/scripts/exhibition/controller.ts
    - src/scripts/exhibition/scene/index.ts
    - src/scripts/exhibition/scene/architecture.ts
    - src/scripts/exhibition/scene/exhibit.ts
    - tests/exhibition-stops.test.ts
    - tests/exhibition-travel.spec.ts
    - tests/exhibition-navigation.spec.ts
    - tests/exhibition-resilience.spec.ts
    - tests/exhibition-budget.spec.ts
key-decisions:
  - "Keep signed stop.z values as the native-scroll scalar and convert once at the scene boundary to positive station."
  - "Build every 18 m route segment from a 12 m straight followed by a 6 m cubic transition whose endpoint derivatives stay horizontal."
  - "Select panels by stable DOM stop ID and project all four transformed local corners instead of inferring bounds from world z."
patterns-established:
  - "Route append invariance: fixed anchor patterns continue beyond the current catalogue end, so earlier frames never depend on N."
  - "Scene diagnostics may be strings as well as numbers/booleans when identity is part of the contract."
requirements-completed: [GROW-04]
status: complete
metrics:
  duration: 30 min
  completed: 2026-09-21
---

# Phase 3 Plan 3: Stable Winding Route Summary

**A deterministic winding Three.js route now carries native scroll through level camera frames, route-mounted architecture, and stable pickable evidence without moving earlier exhibits when projects are appended.**

## Performance

- **Duration:** 30 min
- **Started:** 2026-09-21T04:25:14Z
- **Completed:** 2026-09-21T04:55:25Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments

- Replaced straight world-z camera travel with fixed 18 m route segments that wind laterally and vertically while retaining zero pitch/roll and bounded yaw.
- Mounted the continuous walkway, threshold/landing architecture, exhibit portals, evidence planes, and route-following light offsets on the shared spatial frame.
- Preserved canonical anchor navigation and panel-only picking while selecting panels by stable stop ID and publishing all four actual projected corners.
- Added explicit N=0/1/2/10 append-invariance tests and route-aware browser coverage at 1440x810, 390x664, and 844x390.
- Replaced obsolete fixed-axis/one-project assertions while retaining input, focus/history, failure recovery, suspension, teardown, reflection, and resource-budget coverage.

## Task Commits

1. **Task 1: Specify and fail the winding-route visitor contract** - `c08b8c9` (test)
2. **Task 2: Navigate a shared route with mounted architecture and pickable evidence** - `e825ac4` (feat)
3. **Task 3: Replace superseded assertions while preserving one-handed regression coverage** - `2b4fb8b` (test)

## Files Created/Modified

- `.planning/phases/03-growth-and-release-polish/03-UI-AMENDMENT.md` - Names the superseded Phase 2 sections and active route, framing, phone, copy, and budget values without altering prior UAT results.
- `src/scripts/exhibition/scene/path.ts` - Samples append-invariant line/cubic route frames and finite station bounds.
- `src/scripts/exhibition/controller.ts` - Sends positive station plus stable stop ID across the lazy scene boundary.
- `src/scripts/exhibition/scene/index.ts` - Applies route camera/light poses, stable panel selection, four-corner projection, and widened diagnostics.
- `src/scripts/exhibition/scene/architecture.ts` - Builds the continuous route-following walkway and mounts architectural masses/ink in route frames.
- `src/scripts/exhibition/scene/exhibit.ts` - Mounts unwarped evidence portals on route frames and adds portal 2's completion-only right pier.
- `tests/exhibition-path.test.ts` - Covers continuity, finite clamping, anchor patterns, and N=0/1/2/10 invariance.
- `tests/exhibition-route.spec.ts` - Covers full route travel, level horizon, framing, real picking, and both browser/explicit returns.
- `tests/exhibition-stops.test.ts` - Extends stop/portal invariance to world route frames and stable identity.
- `tests/exhibition-travel.spec.ts` - Uses DOM-derived exhibit counts and actual transformed corners across reference viewports.
- `tests/exhibition-navigation.spec.ts` - Uses actual panel corners for activation and non-panel rejection checks.
- `tests/exhibition-resilience.spec.ts` - Verifies sampled route poses and string-capable diagnostics while preserving lifecycle coverage.
- `tests/exhibition-budget.spec.ts` - Retains measured ceilings with DOM-derived N formulas and scalar-station transformation checks.

## Decisions Made

- Existing `stop.z` and `ScrollProgress.z` remain deterministic signed layout scalars; only the scene converts them to `station = -progress.z`.
- Fixed anchor patterns repeat independently of total project count, preventing appended work from re-normalizing earlier world poses.
- Camera orientation derives directly from a horizontal route tangent with world up `(0,1,0)`; there is no smoothing or secondary motion state.
- Panel identity comes from the measured DOM stop ID. Picking still delegates only to the matching validated canonical anchor.
- The N>=2 impossible portal keeps its right pier drawn-only in the visible world and supplies the solid counterpart only to the completed layer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Calibrated route assertions to native browser semantics**
- **Found during:** Task 2
- **Issue:** Fractional DOM offsets can yield a station within thousandths of the stop, and browser Back restores native scroll without inventing an arrival hash or focus event.
- **Fix:** Asserted station tolerance, native Back scroll restoration, and the explicit return link's hash/focus behavior separately.
- **Files modified:** `tests/exhibition-route.spec.ts`
- **Verification:** Route suite passes all five cases.
- **Committed in:** `e825ac4`

**2. [Rule 1 - Bug] Preserved texture readiness before an exhibit becomes current**
- **Found during:** Task 3
- **Issue:** Stable stop selection intentionally has no current panel at Entrance, but the first implementation also withheld the route-independent texture-ready diagnostic used by navigation tests.
- **Fix:** Report aggregate panel texture readiness/reuse when the current stop has no panel, while leaving `panelStopId` empty.
- **Files modified:** `src/scripts/exhibition/scene/index.ts`
- **Verification:** All 33 route/travel/navigation checks and the full inherited suite pass.
- **Committed in:** `2b4fb8b`

**3. [Rule 1 - Bug] Corrected curved-world cornice support accounting**
- **Found during:** Task 3
- **Issue:** The inherited world-axis bounding-box scan misclassified two nearby curved walkway samples as solid cornice supports.
- **Fix:** Track the four deliberately completion-only supports at construction time; visible solid support count remains zero.
- **Files modified:** `src/scripts/exhibition/scene/architecture.ts`
- **Verification:** All five budget cases report two inherited impossible constructions and zero visible cornice supports.
- **Committed in:** `2b4fb8b`

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** The fixes preserve native browser behavior and accurate diagnostics without expanding product scope or budgets.

## Authentication Gates

None.

## Issues Encountered

- Local Chromium still lacks NSPR/NSS/ALSA system libraries. The previously verified official Ubuntu packages were downloaded and extracted only under `/tmp/phase03-playwright-libs.oGwxik`; tests used that temporary `LD_LIBRARY_PATH`. No system package was installed.
- Concurrent user/agent edits to `01-CONTEXT.md`, `STATE.md`, `ROADMAP.md`, and a new Phase 4 planning directory were preserved and excluded from task commits.

## Verification

- `node --experimental-strip-types --test tests/exhibition-path.test.ts tests/exhibition-stops.test.ts` - 12 passed.
- `npm run test:e2e -- tests/exhibition-route.spec.ts --workers=1` - 5 passed.
- `npm run test:e2e -- tests/exhibition-route.spec.ts tests/exhibition-travel.spec.ts tests/exhibition-navigation.spec.ts --workers=2` - 33 passed.
- `npm run test:e2e -- tests/exhibition-resilience.spec.ts tests/exhibition-budget.spec.ts --workers=2` - resilience and budget contracts pass; budget rerun 5/5.
- `npm run check` - Astro/type check, build, built-content and scene-boundary guards, 35 unit tests, and 69 inherited browser tests passed.
- Scene budget - lazy scene 158,211 / 190,000 B gzip; controller 3,849 B gzip; screenshot 37,132 B at 1600x780; no-clock guard passed.

## Known Stubs

None. Empty arrays and nullable renderer resources in the modified source are lifecycle state, not UI/content placeholders.

## Next Phase Readiness

- Plan 03-04 can warp architectural forms and completed-world reflection on the shared route frame without changing native scroll or panel identity.
- Plan 03-05 can implement the already specified still-first phone policy, opaque label surface, copy changes, and contact glass.
- Physical-device performance evidence remains pending for Plan 03-07; no iPhone/Windows field result is inferred here.

## Self-Check: PASSED

- All four created artifacts exist on disk.
- Task commits `c08b8c9`, `e825ac4`, and `2b4fb8b` exist in repository history.
- Full project verification and direct route acceptance are green.

---
*Phase: 03-growth-and-release-polish*
*Completed: 2026-09-21*
