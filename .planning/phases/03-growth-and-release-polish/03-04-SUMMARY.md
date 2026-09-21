---
phase: 03-growth-and-release-polish
plan: "04"
subsystem: exhibition-scene
tags: [threejs, reflection, route, architecture, performance]
requires:
  - phase: 03-growth-and-release-polish
    plan: "03"
    provides: Stable winding route frames and stop identity
provides:
  - Curved upper architecture with shared solid and ink deformation
  - Station-based reversible emerging construction
  - Route-sized planar completed reflection and mirrored-edge fallback
affects: [03-05, 03-06, 03-07, exhibition-scene]
key-files:
  created: [tests/exhibition-reflection.spec.ts]
  modified: [src/scripts/exhibition/scene/architecture.ts, src/scripts/exhibition/scene/transformations.ts, src/scripts/exhibition/scene/index.ts, src/scripts/exhibition/scene/reflection.ts, tests/exhibition-budget.spec.ts]
requirements-completed: [GROW-04]
status: complete
metrics:
  completed: 2026-09-21
---

# Phase 3 Plan 4: Curved World and Completed Reflection

The route now carries curved overhead architecture, reversible construction and a completed-world reflection through the landing. Evidence panels and the six-metre walkway remain unwarped.

## Task Commits

1. Reflection and curved-world browser contract — `9bc1558` (test).
2. Curved architecture and station-based transformations — `c138464` (feat).
3. Route-aware water, completed edges, fallback and diagnostics — `7f8ea34` (feat).

## Implementation

- Warped upper members, their ink and completed counterparts share route frames. Structural bend is measured from actual geometry; evidence panels retain planar local bounds.
- The three approach constructions use scalar station distance and the same 16-to-8-metre smoothstep in either travel direction. One shadow-casting light follows the route; idle travel produces no ongoing render loop.
- One bounded, subdivided water plane spans the route through landing plus 36 metres. Vertex route distances drive the 3-to-26-metre reflection fade. Completed structural edges are selected from transformed geometry and mirrored by negating only world y for fallback ink.
- The reflector retains layer 2, one capped target and one reflection pass. Switching to the small-surface fallback releases the target and restoration recreates it. Resources remain owned by the scene lifecycle.

## Verification

- `npm run build`, `npx astro check` and `node scripts/measure-scene-budget.mjs` passed. Scene gzip: 159,545 / 190,000 B; screenshot: 37,132 / 180,000 B.
- Reflection and budget suites: 8/8 passed with two browser workers. The final reflection suite: 3/3 passed with visual captures saved to Playwright output and a rendered-pixel comparison between live and fallback views.
- `npm run check`: 35/35 unit cases and 66/69 browser cases passed with four workers; three WebGL initialization waits timed out under concurrent load. Those exact three passed on a two-worker rerun. This is a test-environment concurrency limit, not evidence of a visual acceptance result.
- Reviewed the live and fallback landing captures. They show a coherent completed arch and separate water treatments; owner composition approval remains pending.

## Deviations from Plan

- The interrupted Task 3 draft was reconciled in place. The temporary browser libraries from the prior session had expired; official Ubuntu NSPR/NSS/ALSA packages were downloaded and extracted under `/tmp/phase03-playwright-libs-resume` for testing, without a system install.
- The live/fallback visual assertion samples rendered screenshots. Physical-device reflection and performance acceptance remain pending.

## Issues Encountered

- Four simultaneous headless WebGL workers caused three five-second readiness timeouts in the inherited full suite. Each case passed when rerun with two workers.

## Next Phase Readiness

Plan 03-05 can adjust phone defaults, labels, copy and contact UI on this scene. Physical Windows/iPhone measurements and Phase 1/2 UAT remain outstanding; no device result is inferred here.

## Self-Check: PASSED

All three task commits exist. The scene builds, budget check passes, and targeted reflection and fallback journeys pass.
