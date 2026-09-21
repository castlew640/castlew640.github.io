---
phase: 03-growth-and-release-polish
plan: "07"
subsystem: performance-and-growth
tags: [threejs, playwright, static-artifacts, performance, lifecycle]
requires:
  - phase: 03-growth-and-release-polish
    plan: "06"
    provides: Real N=2 portfolio and client exhibits
provides:
  - Fixed transfer and complete-frame targets with honest evidence classes
  - Current/adjacent texture window and batched portal rendering
  - Isolated N=0/1/10 growth, media and performance gates
  - Retained N=2/N=10 lab measurements and pending physical fields
affects: [03-08, release-verification]
key-files:
  created: [.planning/phases/03-growth-and-release-polish/03-PERFORMANCE-TARGETS.md, .planning/phases/03-growth-and-release-polish/03-MEASUREMENTS.md, scripts/measure-exhibition.mjs, tests/performance-release.spec.ts]
  modified: [src/scripts/exhibition/scene/exhibit.ts, src/scripts/exhibition/scene/index.ts, src/scripts/exhibition/scene/reflection.ts, scripts/check-project-growth.mjs, scripts/measure-scene-budget.mjs, package.json]
requirements-completed: [GROW-01, GROW-04, PERF-02]
requirements-pending: [PERF-01]
status: complete
metrics:
  completed: 2026-09-21
---

# Phase 3 Plan 7: Growth and performance evidence

The real two-project exhibition and isolated ten-project build now keep image preparation and GPU work near the active exhibit, preserve canonical project navigation, and pass fixed transfer/resource ceilings. Physical frame-time acceptance remains pending.

## Task Commits

1. Targets, failing expanded contract, distinct fixture previews and measurement CLI — `2ac6d33` (test; the initial N=10 mount decoded all ten previews).
2. Adjacent-only texture preparation and portal stone batching — `9834237` (feat; reduced the initial expanded 212 draws to 99 sampled draws).
3. Complete aggregate and artifact gates — `0968723` (chore), followed by test typing `706f47b`, first-panel measurement readiness `58426af`, water resource correction `6e1641b`, and exact ownership logging `04d03bd`.
4. Retained four trace JSON files and measurement record — `7966e6c` (docs).

## Verification

- Final `npm run check` at production source `6e1641b` passed Astro/build/content/boundary/budget checks, **47 unit tests and 90 production browser tests** (one N=10-only skip), followed by isolated N=0, N=1, N=10, N=10 media and N=10 performance builds. Fixture runs preserved the checkout content and production `dist` hashes. A later test-only log change passed its targeted remount suite.
- N=10 browser checks exercised all ten actual panel picks, direct routes and return anchors, distinct optimized preview URLs/hashes, and N-based draw/triangle/material/line/texture limits. Current/adjacent decode and idle checks passed.
- Ten N=2 remounts returned actual listener registrations to **20**, WebGL contexts to **10 created / 10 lost**, and live test-observed texture handles to **zero**. Warm scenes matched 29 geometries, 6 actual textures, 18 materials and quality 0. Five project visits and independent idle/hidden/offscreen checks passed.
- The final long N=2 run measured 54,210 B cold still transfer and 272,514 B optional 3D/full transfer. N=10 measured 55,350 B cold still, 249,696 B startup and 462,596 B full transfer. Both satisfy the declared transfer targets. Scene JS is 159,823 B gzip against 190,000 B. [03-MEASUREMENTS.md](03-MEASUREMENTS.md) has frame interval percentiles, submission timing, device/GPU provenance, resource counts and retained JSON paths.

## Issues and decisions

- The first full traversal exposed a fallback water GPU texture retained alongside live reflection: N=2 reached 7 allocations against its ceiling of 6. The mode transition now disposes the inactive GPU handle. The final full and warm runs stayed at 6; the viewport fallback regression passed. Pre-fix JSON is retained.
- Fixture media needs a published personal entry, so the aggregate media scenario uses N=10. Windows fixture dependency links use a junction, allowing the owner's local Windows checkout to build the isolated fixture without Unix symlink privileges.
- The measurement host uses headless Chromium 153 with software SwiftShader. Its rAF intervals were far slower than the physical targets, and synchronous render submission was recorded separately. Neither is a Windows GPU or physical iPhone Safari display measurement. The owner has Windows Chrome and an iPhone but no Mac for Safari Web Inspector. **PERF-01 remains `human_needed` and unverified**; earlier Phase 01/02 device/UAT fields remain pending.

## Next Phase Readiness

Plan 03-08 can use the checked production and fixture artifacts, measurement tool, and explicit pending fields in its release smoke/runbook. Live publication, actual-host transfer and the controlled recovery drill have not yet occurred.

## Self-Check: PASSED

All plan artifacts, checks, task commits and retained evidence exist. GROW-01, GROW-04 and PERF-02 have automated evidence; PERF-01 correctly remains open for physical results.
