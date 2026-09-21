---
phase: 03-growth-and-release-polish
plan: "05"
subsystem: presentation
tags: [phone, accessibility, copy, astro, native-scroll]
requires:
  - phase: 03-growth-and-release-polish
    plan: "04"
    provides: Completed curved route and reflection
provides:
  - Still-first phone policy with deliberate 3D opt-in
  - Opaque readable exhibit and landing plates
  - Accepted practical profile voice and accessible contact glass
affects: [03-06, 03-07, 03-08]
key-files:
  created: [src/components/ContactGlass.astro, tests/presentation-polish.spec.ts]
  modified: [src/scripts/exhibition/policy.ts, src/scripts/exhibition/controller.ts, src/styles/global.css, src/data/profile.ts, src/pages/index.astro, src/layouts/BaseLayout.astro, package.json, scripts/measure-scene-budget.mjs]
status: complete
metrics:
  completed: 2026-09-21
---

# Phase 3 Plan 5: Still-First Presentation and Contact

Fresh phone visits now open the complete illustrated catalogue. A visible control deliberately enters the 3D exhibition, while explicit saved or session choices retain priority over phone and reduced-motion defaults.

## Task Commits

1. Failing phone, copy, glass and opacity journeys — `b509ff4` (test).
2. Phone policy, opaque plates and existing scene regression updates — `0b10c7d` (feat).
3. Practical copy, contact glass and complete aggregate gate — `270e2c1` (feat).

## Implementation

- The policy matches narrow phones and coarse-pointer short landscapes before lazy scene import. Toggle labels state the available action; implicit changes preserve the measured scroll fraction and explicit choices survive storage failure or rotation.
- Exhibit and essential landing text use opaque paper plates, full normal-flow text and a 24px bordered landing surface. Existing one-handed controls, complete HTML and graphics-failure recovery remain available.
- The introduction remains verbatim. About now explains practical choices among software, an existing tool and research while retaining the three confirmed client contracts. W/C reads “Software & solutions.”; the landing says “Talk shop with me.” and keeps the visible email link.
- The small outlined glass is static without JavaScript. JavaScript enhances it into a native 44px button with pressed state and reversible amber fill; reduced motion removes its transition.
- Artifact measurement now separates the always-loaded controller from the glass script and reports their combined transfer. The aggregate browser gate uses two workers to avoid the observed four-worker headless WebGL initialization timeouts.

## Verification

- The new presentation contract failed six cases before implementation, then passed 9/9 including portrait and landscape phones, blocked/invalid storage, keyboard and reduced-motion glass use, and no-JavaScript drawing.
- `npm run check` passed Astro check, build, built-content and scene-boundary guards, scene budget, 35 unit cases and 78 browser cases with two workers. Scene gzip remained 159,545 / 190,000 B; controller 4,014 B and all essential scripts 4,294 B gzip.
- Local 1440x900 moving and 390x664 still captures were inspected. The contact glass initially wrapped below the desktop heading; the final layout keeps it beside the heading. These captures do not replace owner composition or physical-device acceptance.

## Deviations from Plan

- The interrupted earlier four-worker browser gate was made deterministic with a two-worker check command. Existing route/reflection browser tests were updated to opt in on phones where they assert the 3D scene.
- The inherited budget script expected exactly one always-loaded script; it now identifies the controller and accounts for the glass enhancement separately.

## Issues Encountered

- The first aggregate check stopped at the obsolete one-script budget assumption. After correcting the measurement, the full gate passed.

## Next Phase Readiness

Plan 03-06 can capture the final presentation and publish the real portfolio case study. Physical Windows/iPhone performance and earlier human UAT remain pending.

## Self-Check: PASSED

All three task commits exist; the complete local gate and presentation journeys pass.
