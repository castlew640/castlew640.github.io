---
phase: 02-one-handed-surreal-exhibition
plan: 08
subsystem: ui
tags: [threejs, reflection, accessibility, scroll, budgets, playwright]
requires:
  - phase: 02-07
    provides: Real screenshot portal, accessible document overlays, and native case-study navigation
provides:
  - Lit completed-architecture reflections with reversible mirrored-ink fallback
  - Three camera-distance transformations and two impossible constructions
  - Build-byte, asset, scene-count, field-of-view, and no-clock regression gates
  - Preliminary measurements separating software correctness from physical-device evidence
affects: [phase-02-verification, phase-03-performance, future-exhibits]
tech-stack:
  added: []
  patterns: [layer-2 completed geometry, cameraZ-only transformations, counts-only scene diagnostics, measured build budgets]
key-files:
  created:
    - src/scripts/exhibition/scene/reflection.ts
    - src/scripts/exhibition/scene/transformations.ts
    - scripts/measure-scene-budget.mjs
    - tests/exhibition-budget.spec.ts
    - .planning/phases/02-one-handed-surreal-exhibition/02-MEASUREMENTS.md
  modified:
    - src/scripts/exhibition/scene/architecture.ts
    - src/scripts/exhibition/scene/quality.ts
    - src/scripts/exhibition/scene/index.ts
    - src/scripts/exhibition/controller.ts
    - tests/exhibition-resilience.spec.ts
    - package.json
key-decisions:
  - "Measure render submission cost through a controller callback; authored scene motion remains cameraZ-derived and clock-free."
  - "Orient the outboard transforming arch along the corridor and place the floating cornice 12 m ahead of the About camera so both remain visible without obstructing travel."
  - "Keep the original 1200-line budget by simplifying slender fallback silhouettes, and batch finished stone geometry to constrain submissions."
  - "Correct the original three-total-texture estimate to a measured five-allocation ceiling; identify four resources and explicitly leave the fifth unattributed."
  - "Treat Chromium/SwiftShader as correctness evidence only; physical iPhone Safari and Windows Chrome composition/device sign-off remain outstanding."
patterns-established:
  - "Completed reflection geometry uses layer 2 exclusively; lights enable both visible and reflection layers."
  - "Reset renderer statistics once per requested frame so nested reflection and shadow work are included."
requirements-completed: [ART-01, ART-02, NAV-04, ACCESS-04, ACCESS-05]
duration: 330min
completed: 2026-09-21
status: complete
---

# Phase 2 Plan 8: Completed reflections, reversible architecture, and measured budgets

**A lit reflection of the finished gallery, three scroll-derived architectural transformations, and a quiet landing now run within measured build and scene budgets.**

## Performance

- **Duration:** Approximately 330 minutes elapsed, including tool-approval waits, shared-checkout coordination, review fixes, and validation.
- **Started:** 2026-09-20T20:07:39Z
- **Completed:** 2026-09-21T01:37:30Z
- **Tasks:** 3
- **Files created/modified in the plan scope:** 11, excluding summary/progress metadata and separately committed review fixes.

## Accomplishments

- A layer-2-only completed gallery reflects through one capped, lit Reflector pass. The main view retains drawn and partly built structures. A small surface, degraded quality, or failed target switches to a gradient and mirrored construction ink, with no reflection target.
- Exactly three elements resolve through `smoothstep(16, 8, distance)`: an arch, a column bay, and stairs. Reversing scroll reverses them exactly; mesh visibility, opacity, ink, hatch, and shadow activation use the same progress. The floating cornice and landing arch's drawn right pier provide the two impossible constructions.
- The deployment gate now measures the real compressed scene/controller chunks and shared WebP asset, rejects clocks in authored scene files, and asserts scene budgets, all three field-of-view regimes, fallback reversal, and idle suspension.

## Task Commits

1. **Task 1: Completed-architecture reflection and quality fallback** — `7fdd3ed` (`feat`).
2. **Task 2: Approach transformations, floating cornice, and landing** — `9b601f3` (`feat`).
3. **Task 3: Budget gate, regression tests, and measurements** — `95fcde8` (`test`).

Separate review corrections integrated into the successful final gate:

- `f1b2d02` — native-scroll Back/endpoint navigation corrections.
- `57ee1f6` — keep active screenshot alt text and captions in the accessibility tree.
- `b55f2c0` — clean partial scene initialization and validate reflection framebuffer completeness.

All three task commits are recorded; the orchestrator finalized summary and progress metadata in this shared checkout.

## Validation and Measurements

Final **`npm run check` passed**, exit 0: **33 unit tests and 69 browser tests**, including all five new budget cases. Evidence: `/tmp/phase02-final-check.log`. The browser suite took 56.7 seconds; this is test execution metadata, not rendering performance evidence.

Final visual/count audit passed, exit 0: `/tmp/02-08-inspect.log` and `/tmp/02-08-visual/counts.json`. Desktop and portrait exhibit/landing UI and isolated geometry were inspected. Completed column reflections, floating cornice, and the landing's drawn right support are visible; human composition approval remains pending.

| Measured item | Final result | Guardrail |
|---|---:|---:|
| Scene gzip | 157,185 B | 190,000 B |
| Controller gzip | 3,824 B | Reported separately |
| Shared screenshot | 37,132 B; 1600 × 780 | 180,000 B; 1600 px |
| Desktop exhibit calls / triangles | 44 / 8,258 | 90 / 120,000 |
| Largest observed travel calls / triangles | 45 / 8,934 | 90 / 120,000 |
| Materials, live / fallback | 17 / 16 | 18 |
| Lines, live / fallback | 883 / 1,057 | 1,200 |
| Actual allocated textures | 5 | Corrected ceiling 5 |
| Reflection passes, live / fallback | 1 / 0 | 1 |
| Largest reflection target | 1024 × 512 | 1024 × 512 |

The 1 KB negative byte-budget probe and injected-clock probe both failed as intended, named the measured size/source, and were removed before the final gate. The source gate remains in `npm run check`.

See [02-MEASUREMENTS.md](./02-MEASUREMENTS.md) for the complete allocation breakdown, three viewport results, screenshot paths, A1/A2/A3/A7 assumptions, and blank D-18 manual-device checklist. Local ANGLE/SwiftShader establishes no frame-rate or field-performance claim. **A Chromium pass is not a Safari pass.** Phase 3 owns PERF-01 and physical-device evidence.

## Files Created/Modified

- `scene/reflection.ts` — completed geometry, lit custom water shader, capped Reflector target, mirrored-ink fallback, allocation/failure disposal.
- `scene/transformations.ts` — three deterministic progress-driven elements with full completed counterparts.
- `scene/architecture.ts` — cornice, landing, final arcades, shared stone batching, and actual structural diagnostics.
- `scene/index.ts` and `scene/quality.ts` — integration, quality recovery, honest nested render counts, layer/structure diagnostics, and cleanup.
- `controller.ts` — a narrow render-duration measurement callback; no clock enters transformation logic.
- `scripts/measure-scene-budget.mjs`, `tests/exhibition-budget.spec.ts`, and `package.json` — byte/asset/no-clock gate and five scene-budget browser cases.
- `tests/exhibition-resilience.spec.ts` — updated quality/real-reflection contracts; later accessibility and recovery corrections were committed separately.
- `02-MEASUREMENTS.md` — measured evidence and explicit automated-versus-manual boundary.

## Deviations from Plan

### Auto-fixed issues and measured corrections

**1. [Rule 2 — Correctness] Preserve quality measurement outside clock-free scene source.** The existing scene sampled render duration with `performance.now()`, conflicting with the new source guard. The controller now supplies a render-measurement callback; transformations remain purely cameraZ-derived. No timing is exposed as a device-performance claim. Files: controller, scene index/quality. Commit: `7fdd3ed`.

**2. [Rule 1 — Bug] Supply shader fog uniforms and synchronize projection diagnostics.** Initial reflection startup required `UniformsLib.fog`. The more expensive render also exposed a camera-position/projection read race, resolved by updating panel projections synchronously with camera changes. The original numeric framing tolerance stayed unchanged. Files: reflection/index and resilience contract. Commit: `7fdd3ed`.

**3. [Rule 1 — Composition] Keep the outboard arch clear and the cornice visible.** The transforming arch at x = 5 faces along the corridor so its piers remain outside the walkway. The cornice retains its prescribed dimensions/height/four drawn supports but sits 12 m ahead of the About stop; directly above the camera it was outside the view. The landing dimensions, position, solid left pier, and drawn right pier are preserved. Files: transformations/architecture. Commit: `9b601f3`.

**4. [Rule 1 — Budget] Simplify mirrored ink and batch static stone.** The initial fallback reported 1,303 segments. Slender completed members now use one datum stroke, reducing the final total to 1,057 without raising the 1,200 cap. Completed and static visible stone are batched while retaining shared materials. Files: architecture/reflection/index. Commit: `9b601f3`.

**5. [Rule 2 — Accurate evidence] Correct the texture estimate instead of hiding allocations.** Actual `renderer.info.memory.textures` is 5 in both modes. Diagnostics identify panel 1, shadow color/depth 2, and active water 1; one additional allocation remains unattributed. Even the four identified resources exceed the original total of 3. The new regression ceiling is 5, with the one-panel-per-exhibit growth invariant retained. The fifth is not asserted to be a proven architectural necessity. Files: diagnostics, budget spec, measurements; documented with orchestrator approval.

### Review integration

The orchestrator assigned separate bounded fixes for fractional native-scroll endpoints, screenshot accessibility, partial-initialization cleanup, and incomplete reflection targets. Their commits are listed above and all are covered by the successful final gate. The prior title/CTA-first mobile sheet and normal document continuation from 02-07 remain intact.

## Issues Encountered

Browser and git escalations stalled in the child executor. The orchestrator took ownership of those executions and commits; no approval bypass or dependency substitution was used. The final source passed once the identified integration/recovery issues were corrected. No further source changes followed the final successful check.

## Known Stubs

None. Shader sampler initialization, empty geometry accumulators, and failure-state null handles are operational implementation details; no mock project, placeholder exhibit, or disconnected visitor action was added.

## User Setup Required

No new service configuration or dependencies. Physical Windows Chrome/iPhone Safari checks and ART-01/D-05 visual sign-off remain for the end-of-phase gate.

## Next Phase Readiness

Implementation and automated evidence passed the reused-agent verification procedure with status `human_needed`; the report does not claim independent fresh-agent verification. **Phase 02 remains in progress** pending human device/composition sign-off in `02-UAT.md`. Phase 3 must establish real-device performance; this summary does not close PERF-01 or infer Safari coverage.

## Self-Check: PASSED

- Reflection, transformations, budget script/spec, and measurements exist on disk.
- Task 1/2 and separate review commit references were confirmed by the orchestrator in this shared execution; final check and audit exited 0.
- No missing implementation artifact or blocking stub remains. All three task commit references are recorded above.
