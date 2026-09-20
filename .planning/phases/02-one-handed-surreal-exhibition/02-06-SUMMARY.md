---
phase: 02-one-handed-surreal-exhibition
plan: 06
subsystem: ui
tags: [three, webgl2, architecture, accessibility, playwright]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Illustrated catalogue, motion policy, measured native scroll and tap/navigation controller from plans 02-03 through 02-05
provides:
  - Lazy WebGL2 scene with bounded scroll-derived camera and deliberate catalogue recovery
  - Ivory vestibule, coffered ceiling break, threshold arch, water and six shared architectural inks
  - Demand rendering, independent visibility suspension, reversible measured-cost quality and complete resource teardown
  - Deployment-gated failure, camera, ink, resource, idle and lazy-chunk regression coverage
affects: [02-07, 02-08, 03-performance-and-growth]
tech-stack:
  added: []
  patterns:
    - A single motion-permitted dynamic import owns renderer creation
    - Six CSS-pixel line materials and one vertex-coloured stone material are shared throughout the architecture
    - Native scroll alone invalidates camera travel; no continuous animation loop
    - Counts-only diagnostics and explicit disposal keep renderer ownership testable
key-files:
  created:
    - src/scripts/exhibition/scene/index.ts
    - src/scripts/exhibition/scene/ink.ts
    - src/scripts/exhibition/scene/architecture.ts
    - src/scripts/exhibition/scene/quality.ts
  modified:
    - src/scripts/exhibition/controller.ts
    - src/styles/global.css
    - scripts/verify-built-content.mjs
    - tests/exhibition-resilience.spec.ts
key-decisions:
  - Retain the exact approved three-light rig and add one shared warm stone emissive term to meet the intended ivory shadow palette under physical lighting.
  - Active-scene paper text plates and hidden drawings preserve existing layout boxes so lazy mounting cannot disturb native browser restoration.
  - Apply measured quality changes before the next requested draw, avoiding a cleared canvas after the final idle frame.
requirements-completed: [ART-01, NAV-02, ACCESS-04, ACCESS-05]
duration: 33 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 6: Scroll-Driven Ivory Architecture Summary

**A lazy WebGL2 corridor joins shared architectural ink and sunlit ivory mass to native scroll, with idle suspension and complete catalogue recovery.**

## Performance

- **Duration:** 33 min
- **Started:** 2026-09-20T19:07:44Z
- **Completed:** 2026-09-20T19:40:26Z
- **Tasks:** 3
- **Files modified:** 8 implementation/test files

## Accomplishments

- Built the actual ivory vestibule, coffered partial roof ending at z=-8, dashed continuing ribs, solid 5 m threshold arch at z=-12, uninterrupted 6 m walkway, flat water and flanking drawn-only colonnades. One rough stone material uses the four approved vertex colours; six shared inks retain their prescribed CSS-pixel widths, colours and stable model-space dash lengths.
- The camera follows only measured document scroll, remains at x=0/y=1.62/zero pitch, clamps to the landing stop, and recomputes the approved horizontal-framing FOV rule on resize. The three lights and camera-following shadow frustum use the specified positions and values.
- The motion gate precedes the single renderer import. Generation tokens cancel stale asynchronous mounts. Failed imports, unavailable WebGL and lost contexts converge on the readable catalogue, with generic copy and one deliberate retry. A real restored context does not restart the scene.
- Rendering uses one pending frame and pauses independently for an offscreen exhibition or hidden document. Teardown releases architecture, inks, water, shadow resources, renderer and context, and removes scene listeners/observer. The quality ladder uses sustained submission cost with hysteresis and never schedules idle work.
- Added deployed-artifact checks for renderer separation, static dependency chains, preload references and project-route exclusion. Existing resilience assertions remain; new cases cover exact camera/ink settings, resource remounts, idle/resume, actual downloaded scene source and reversible quality steps.

## Task Commits

1. **Renderer, camera, light rig and failure recovery** — `98796a6` (feat)
2. **Shared ink and ivory entrance/threshold architecture** — `7c1f50b` (feat)
3. **Demand suspension, resource ownership and lazy-chunk verification** — `afe3b87` (feat)

## Verification

- Final exact-source `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed: **33 unit tests and 41 browser tests**. Browser suite duration was 19.8 s. No implementation/test source changed after this final gate.
- Astro reported **0 errors, 0 warnings**, with the existing schema deprecation hint and two hints for the explicitly required `PCFSoftShadowMap`. Build, static-content verification and scene import boundary passed. The existing bundle-size warning concerns uncompressed size; the lazy scene measures **150,432 gzip bytes**, below the 190 KB design guardrail. Controller: **3,677 gzip bytes**.
- Temporarily replacing the dynamic scene import with a static import made `verify-built-content.mjs` fail with `Scene chunk is eagerly referenced by index.html`. Restored the source before the final gate. Proof: `/tmp/02-06-eager-rejection.log`.
- Browser checks prove real WebGL startup, null-context recovery, a retained `WEBGL_lose_context` extension followed by an actual `webglcontextrestored` event, no automatic restart, single retry, usable/focusable case-study navigation and complete static content.
- At 1440×900 and 390×844 CSS pixels, DPR 2 input produces the prescribed caps of 2 and 1.75, with shadow maps 1024 and 512. Both captures report **8 materials, 464 ink segments, 23 draw calls, 3,742 triangles, 21 geometries, 3 renderer textures and 0 walkway obstructions** at the threshold sample. All six ink resolutions match CSS pixels. No page errors occurred.
- Three deliberate remounts retain first-mount resource counts and dispose geometries to zero. Debug properties contain only numbers/booleans. Rendering remains unchanged across idle samples, stops for independently hidden/offscreen states, and resumes once.
- Source checks find exactly one motion-gated dynamic import and one `preventDefault`, confined to context loss. No clock, elapsed-time animation, device-information query, production console call or narrow line material was added.
- Library lookup used official [renderer](https://threejs.org/docs/pages/WebGLRenderer.html), [wide-line material](https://threejs.org/docs/pages/LineMaterial.html) and [directional shadow](https://threejs.org/docs/pages/DirectionalLightShadow.html) documentation plus installed r186 source; Context7 MCP/CLI were unavailable.

## Visual Evidence

Final actual-page screenshots are saved in `/tmp/02-06-visual/`:

- `1440-entrance.png`, `1440-threshold.png`, `1440-about.png`, `1440-landing.png`, `1440-contact.png`
- `390-entrance.png`, `390-threshold.png`, `390-about.png`, `390-landing.png`, `390-contact.png`
- `1440-architecture.png` and `390-architecture.png` intentionally hide DOM content solely for isolated geometry review. `counts.json` records numeric diagnostics; these are not alternative production presentations.

Chromium uses software rendering in this environment. These captures establish rendering and layout correctness, **not representative device frame performance**. Physical iPhone/Windows review remains pending with the phase's later verification.

## Decisions Made

- Keep the exact light count, light intensities and vertex-colour palette. A shared warm emissive/bounce term on the stone material corrects the visually dark output of the specified physical light rig without a new light, texture, material or shader.
- Give all presently exposed active-scene text a paper backing. Hide redundant decorative catalogue drawings with `visibility`, retaining their layout boxes; resizing/removing those boxes during lazy initialization disturbed browser Back restoration.
- Publish a real layer-1 raycaster through `hitPanel`; with no panels yet it correctly returns null. The architecture returns its actual built/drawn groups, stone material and flat water object for the subsequent plans.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical verification] Separate still and active gesture assertions**
- **Found during:** Task 1.
- **Issue:** A shipped test requires `#exhibition` pointer-events:auto, whereas the approved active-scene stacking contract requires none.
- **Fix:** Added reduced-motion setup to that existing test without removing or changing its assertions. Added a moving-scene test proving canvas/container auto gestures, exhibition pass-through, camera/FOV and lights.
- **Files:** `tests/exhibition-resilience.spec.ts`.
- **Verification:** Both modes pass in the full deployment gate.
- **Commit:** `98796a6`.

**2. [Rule 1 - Bug] Correct actual stone brightness while preserving the approved light rig**
- **Found during:** Task 2 screenshot review.
- **Issue:** The specified 0.55 hemisphere/0.12 ambient physical lighting yielded dark olive shadows, contradicting the intended pale ivory palette.
- **Fix:** Added `emissive: '#ece6d6', emissiveIntensity: 0.42` to the one shared stone material. Geometry still receives real directional shadows; no extra material or light was added.
- **Files:** `src/scripts/exhibition/scene/architecture.ts`.
- **Verification:** Desktop/mobile captures now show pale ivory shadowed surfaces; exact light and material budgets still pass.
- **Commit:** `7c1f50b`.

**3. [Rule 2 - Missing critical functionality] Protect text contrast and actual canvas targeting**
- **Found during:** Task 2 screenshot review.
- **Issue:** Existing catalogue text had no backing over the new scene, decorative still drawings competed with geometry, and the full-height page-frame could intercept canvas input despite exhibition pass-through.
- **Fix:** Scoped paper plates and page-frame pass-through to active scenes, restoring pointer access on actual content/navigation. Drawing visibility changes preserve native layout boxes; an initial display:none approach was removed after it exposed a Back-restoration offset regression.
- **Files:** `src/styles/global.css`.
- **Verification:** Complete prior navigation/restoration, text reflow and axe coverage passes; visual captures retain legible content.
- **Commit:** `7c1f50b`.

**4. [Rule 2 - Missing critical verification] Put lifecycle and budget assertions in the existing CI spec**
- **Found during:** Task 3.
- **Issue:** Counts/idle/resource acceptance needed durable assertions beyond one execution-time inspection.
- **Fix:** Added actual lazy-response inspection, idle and independent suspension checks, remount cleanup, exact inks and reversible quality checks. Context restoration now retains the original extension and waits for a real restored event, eliminating a possible no-op test path.
- **Files:** `tests/exhibition-resilience.spec.ts`.
- **Verification:** All 41 browser cases pass, including the strengthened restored-context path.
- **Commit:** `afe3b87`.

## Issues Encountered

- Browser/server startup and git index writes required ordinary sandbox escalation; hooks were not bypassed.
- Test-only typing adjustments avoided adding Node type dependencies. Camera zero-pitch assertions use the specified strict equality, correctly treating three's negative zero as zero.
- Quality changes are applied before the next requested render because renderer buffer resizing clears the canvas; applying them after the last frame would blank an otherwise idle scene.
- No new unmitigated trust boundary or production placeholder was introduced. No private client data or additional dependency was added.

## Planned Extensions

- Flat water is intentional in this plan; the real reflection pass and completed architecture belong to 02-08. The diagnostic reflection flag currently describes quality permission, not an already-mounted reflector.
- Panel meshes/textures and exhibit overlays belong to 02-07. About/landing architecture and transformations remain 02-08 work. This summary closes only this plan's assigned requirement slice; Phase 2 is still in progress.

## User Setup Required

None. The local capture preview was stopped after verification.

## Next Phase Readiness

- Ready for 02-07 to build panels on the actual scene and existing canonical DOM navigation.
- The final gate log is `/tmp/02-06-final-check.log`; visual artifacts remain outside git for review.
- The pre-existing user edit to Phase 1 `01-CONTEXT.md` was preserved and excluded from every commit.

## Self-Check: PASSED

All four created scene modules and this summary exist. All three task commits resolve and contain no deletions. The exact-source deployment gate passed, final visual artifacts exist, and no generated files remain untracked in the repository.
