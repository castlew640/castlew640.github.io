---
phase: 02-one-handed-surreal-exhibition
plan: 04
subsystem: ui
tags: [astro, typescript, accessibility, reduced-motion, playwright]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Published catalogue stops, slug metadata, approved UI contract, and scene import boundary from plans 02-01/02-02
provides:
  - Pure content-derived stop table with append invariance
  - Native-scroll controller with measured interpolation and restoration-aware focus
  - Persistent still-view control with reduced-motion policy and session-only storage fallback
  - Automated motion, navigation, gesture, storage, and layout-resilience coverage
affects: [02-05, 02-06, 02-07, 02-08]
tech-stack:
  added: []
  patterns:
    - Policy is resolved before scheduling client work or entering the future renderer import gate
    - Measured stop index and local progress preserve place across reflow
    - Client controls are injected only when JavaScript runs
key-files:
  created:
    - src/lib/exhibition/types.ts
    - src/lib/exhibition/stops.ts
    - src/scripts/exhibition/policy.ts
    - src/scripts/exhibition/scroll.ts
    - src/scripts/exhibition/controller.ts
    - tests/exhibition-stops.test.ts
    - tests/exhibition-resilience.spec.ts
  modified:
    - astro.config.ts
    - src/components/exhibition/ExhibitionShell.astro
    - src/styles/global.css
    - package.json
key-decisions:
  - Disable Vite asset inlining so Astro emits the required hashed controller module even before the scene import exists.
  - Keep explicit choices in memory as well as validated storage so blocked storage cannot defeat the motion gate.
  - Use navigation timing to avoid stealing focus on reload or browser Back when the URL still contains an exhibit hash.
patterns-established:
  - The future scene import belongs only inside enterMovingView after motionPermitted succeeds.
  - Reserve a preference row above the header so the fixed toggle and notice do not cover primary navigation.
requirements-completed: [NAV-02, NAV-06, ART-02, ACCESS-04, ACCESS-05]
duration: 10 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 4: Motion Policy and Native Scroll Summary

**A persistent still-view control honors reduced motion before the future renderer gate, while measured corridor stops preserve position and browser navigation.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-09-20T18:38:08Z
- **Completed:** 2026-09-20T18:47:40Z
- **Tasks:** 3
- **Files modified:** 11 implementation/test/config files

## Accomplishments

- Added the import-free stop table for zero, one, and multiple published projects, proving earlier exhibits and portals stay fixed when projects are appended.
- Added the first processed Astro client entry: passive, frame-coalesced scrolling; measured offsets; resize/orientation/ResizeObserver handling; bfcache derivation without scrolling; hash-arrival focus without changing native restoration.
- Added a single-tap, keyboard-accessible still-view button, OS notice, strict storage validation, session-only override when storage is blocked, and stable stop restoration when switching modes.
- Preserved native touch gestures, pinch zoom, no-JavaScript navigation, primary navigation, skip-link focus, and static text selection. Scoped pointer-event changes to an active scene.

## Task Commits

Each task was committed atomically with normal hooks:

1. **Pure stop table and unit tests** — `6442789` (feat)
2. **Motion policy, measured scroll derivation, and client entry** — `4392fae` (feat)
3. **Visible still-view control and resilience coverage** — `603cd79` (feat)

## Verification

- Final `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed on the final source tree, also providing combined shared-tree wave evidence for plans 02-02/02-03/02-04.
- Astro check: **0 errors, 0 warnings, 1 pre-existing deprecation hint**. Static build, built-content verification, and scene boundary all passed.
- **12/12 unit tests**: five project-validation cases, five stop-table cases, and two measured-scroll interpolation/clamping cases.
- **21/21 Chromium tests**: eleven existing contracts and ten new resilience cases. Both routes retain zero axe violations.
- New browser coverage proves zero scene requests under reduced motion, valid persistent choices, invalid-choice rejection, blocked reads/writes, live OS preference changes, exhibit-preserving toggles, no-JS navigation, 44px targets at 390/1440px, untouched native gesture/viewport policies, Back/reload behavior, and resize/text-reflow preservation.
- Source checks found no wheel/touch interception, prohibited CSS gesture restrictions, unsafe HTML insertion, or restoration-setting writes. The generated homepage references a separate hashed module. The stop table has no imports.
- UI-SPEC §A.6 already contained the requested active-scene-only pointer rule and text-selection rationale from plan 02-01; it was verified and left unchanged.

## Decisions Made

- A session-local preference supplements storage, while storage reads retain the strict `'still' | 'moving'` allow-list.
- A hash retained in a reload or history traversal does not trigger script focus. Actual hash arrivals still focus with `preventScroll`.
- The injected preference row gives the fixed toggle and OS notice space without hiding the shipped primary links.
- The scene gate remains intentionally empty until plan 02-06; no fake renderer or test-only scene API was added.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prevent Astro from inlining the controller**
- **Found during:** Task 2 artifact acceptance.
- **Issue:** A processed script alone was auto-inlined because this controller was below Astro's size threshold, violating the required separate hashed module.
- **Fix:** Set `vite.build.assetsInlineLimit: 0` in `astro.config.ts`, verified against the installed Astro script-build plugin and [Astro script processing documentation](https://docs.astro.build/en/guides/client-side-scripts/).
- **Verification:** The built homepage references `/_astro/ExhibitionShell...js` with `type="module"`; the full deployment gate passed.
- **Committed in:** `4392fae`.

**Total deviations:** One blocking build-output adjustment. No dependencies or scene functionality were added.

## Issues Encountered

- The sandbox blocked preview-server startup and git index writes. Standard escalation allowed the required checks and normal commits; no hooks were bypassed.
- The existing content-schema URL deprecation hint remains recorded in the phase's existing deferred-items document.

## Known Stubs

- `src/scripts/exhibition/controller.ts:6` — `enterMovingView()` deliberately stops after checking policy; its permitted branch contains only the plan 02-06 integration comment. This is explicitly required by plan 02-04. Both mode choices currently show the complete static catalogue. Renderer creation, moving presentation, and renderer failure handling belong to plan 02-06.

## User Setup Required

None — no new package or external configuration is required.

## Next Phase Readiness

- Ready for plan 02-05 travel controls and plan 02-06 renderer integration.
- Requirement IDs describe this plan's policy/static resilience slice; scene failure and complete phase acceptance remain with later plans. Phase 2 remains in progress.
- The existing uncommitted Phase 1 context edit was preserved and excluded from every commit.

## Self-Check: PASSED

All seven created source/test files exist. All three task commits resolve in git and contain no file deletions. The final deployment check passed; no generated files remain untracked. The summary exists at its canonical path.
