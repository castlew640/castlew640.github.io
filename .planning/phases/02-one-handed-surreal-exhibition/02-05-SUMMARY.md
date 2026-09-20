---
phase: 02-one-handed-surreal-exhibition
plan: 05
subsystem: ui
tags: [typescript, accessibility, pointer-events, playwright, navigation]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Validated exhibit anchors, measured stops, motion policy, and restoration-aware controller from plans 02-02/02-04
provides:
  - Labelled fixed travel buttons with focusable endpoints and history-free scrolling
  - Six-condition passive tap discrimination through the canonical DOM anchor
  - CI coverage for one-handed travel, native gestures, return focus, and fractional stop boundaries
affects: [02-06, 02-07, 02-08]
tech-stack:
  added: []
  patterns:
    - Controls derive endpoint state from measured native scroll progress
    - Pointer navigation validates the scene slug and delegates to the matching data-slug anchor
    - Renderer-independent tap tests prove positive and negative gesture gates before WebGL exists
key-files:
  created:
    - src/scripts/exhibition/controls.ts
    - src/scripts/exhibition/tap.ts
    - tests/exhibition-tap.test.ts
    - tests/exhibition-travel.spec.ts
    - tests/exhibition-navigation.spec.ts
  modified:
    - src/scripts/exhibition/controller.ts
    - src/scripts/exhibition/scroll.ts
    - src/styles/global.css
    - tests/exhibition-stops.test.ts
    - package.json
key-decisions:
  - Append travel controls once as the last page-frame child, after main and the existing footer, preserving stable content-before-controls tab order.
  - Test tap acceptance and every rejection condition independently of the renderer; retain the null scene-handle seam until plan 02-06.
  - Match stop-index boundaries to native CSS-pixel rounding so mobile arrow taps and hash returns advance reliably.
requirements-completed: [NAV-02, NAV-03, NAV-04, NAV-05, NAV-06]
duration: 13 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 5: One-Handed Travel and Tap Selection Summary

**Fixed accessible travel buttons and a six-condition tap state machine preserve native scrolling, canonical project links, and browser restoration.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-09-20T18:51:16Z
- **Completed:** 2026-09-20T19:04:20Z
- **Tasks:** 3
- **Files modified:** 10 implementation/test/config files

## Accomplishments

- Added real Back/Forward buttons with 24px architectural chevrons, 56px desktop and 64px phone targets, a 12px gap, endpoint announcements, unchanged focus rings, and a stable thumb-reachable position.
- Travel uses only native scrolling, keeps focus on the activated button, and preserves history and the arrival hash. Endpoint buttons stay in the tab order through aria-disabled.
- Added passive pointer tracking for duration, maximum excursion, scroll displacement, concurrent pointers, scroll cancellation, and panel hit testing. Cancellation, leaving the canvas, lost window focus, secondary clicks, unsafe slugs, absent scenes, and missing anchors cannot navigate.
- Successful taps validate the slug and activate the existing matching data-slug project anchor. No renderer imports or alternative navigation APIs were introduced.
- Added deployment-gated coverage for direct/return links, Back/Forward, persisted pageshow handling, keyboard travel, target sizing, thumb reach, landscape, enlarged text, real Chromium touch scrolling, and the single-tap journey to resume/contact.

## Task Commits

1. **Labelled travel controls and endpoint semantics** — `d344c7f` (feat)
2. **Tap-versus-swipe discrimination and isolated regressions** — `69532bf` (feat)
3. **Travel/navigation CI coverage and fractional-stop correction** — `73f07af` (test)

## Verification

- Final exact-source `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed. No implementation changed after that gate.
- Astro: **0 errors, 0 warnings, one pre-existing content-schema deprecation hint**. Static build, built-content validation, and scene import boundary all passed.
- **33/33 unit tests**, including 20 tap cases and the newly exposed fractional-stop regression.
- **34/34 Chromium tests**, including 13 new travel/navigation cases. Existing skeleton, portfolio, reduced-motion, no-JavaScript, storage, and axe checks passed unchanged.
- Source checks confirmed no alternate navigation APIs, gesture cancellation, wheel/touch listeners, new width breakpoint, or bare disabled attribute. Both new browser specs and the tap unit tests run in the check script.
- Real touch events use the documented [Playwright CDP session](https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session) and [Chromium touch input protocol](https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchTouchEvent). Context7 was unavailable; official references supplied the lookup.
- Persisted pageshow is dispatched deterministically after actual Back navigation to exercise the bfcache handler even when Chromium chooses to reload. This proves handler behavior, not guaranteed cache admission or physical Safari behavior.

## Decisions Made

- The nav is injected once as the last `.page-frame` child, rather than moving through the DOM as the current stop changes. This implements the plan's stable-order refinement; the existing footer remains before it.
- No decorative ground mesh is needed: the inline SVGs carry the approved arrow language while hit targets stay fixed in CSS pixels.
- The tap module publishes only a structural hitPanel interface. Plan 02-06 can supply its real scene handle without importing Three.js into the controller's gesture code.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical verification] Added renderer-independent tap regression tests**
- **Found during:** Task 2.
- **Issue:** Before the renderer exists, a browser test showing that swipes do not navigate cannot prove the six tap gates or successful anchor delegation.
- **Fix:** Added `tests/exhibition-tap.test.ts` with threshold-boundary acceptance, every rejection path, exact-anchor delegation, slug validation, multi-pointer recovery, and passive-listener assertions. Added it to the deployment gate in Task 3.
- **Verification:** All 20 cases pass without introducing a production scene stub or any dependency.
- **Committed in:** `69532bf`, CI wiring in `73f07af`.

**2. [Rule 1 - Bug] Recognize fractional stop arrivals after native scroll rounding**
- **Found during:** Task 3's 390px single-tap journey.
- **Issue:** Native scrolling rounded the exhibit's fractional offset down, leaving the controller at index 0 despite reaching the exhibit; repeated Forward taps could not advance correctly.
- **Fix:** Compare progress boundaries to rounded CSS-pixel offsets while retaining measured offsets for interpolation. Added a unit regression covering rounded-down and rounded-up arrivals.
- **Files modified:** `src/scripts/exhibition/scroll.ts`, `tests/exhibition-stops.test.ts`.
- **Verification:** The formerly failing complete touch journey and the full final check pass.
- **Committed in:** `73f07af`.

## Issues Encountered

- Preview-server/browser startup and git index writes required normal sandbox escalation. No hooks were bypassed.
- The new resume journey initially used the decorative arrow in its accessible-name locator; it now matches the shipped accessible name, `Open my resume`.
- The existing content-schema deprecation hint remains outside this plan and is already tracked in the phase's deferred items.

## Known Stubs

- `src/scripts/exhibition/controller.ts:7` — the current scene handle intentionally remains null until plan 02-06 mounts the renderer. The existing `enterMovingView()` seam at line 9 remains pending that plan. Tap selection is correctly inert in the current complete static catalogue; positive mesh selection and canvas policy checks belong to plans 02-06/02-07. No fake scene or production test API was introduced.

## User Setup Required

None — no dependencies or external service configuration were added.

## Next Phase Readiness

- Ready for plan 02-06's real renderer and handle integration. Controls, gesture policy, and return navigation are available now.
- Requirements above cover this plan's control/static-navigation slice; live mesh selection and phase acceptance remain with subsequent plans. Phase 2 remains in progress.
- The pre-existing uncommitted Phase 1 context edit was preserved and excluded from every commit.

## Self-Check: PASSED

All five created source/test files and this summary exist. All three task commits resolve in git and contain no file deletions. The final deployment gate passed, and no generated files remain untracked.
