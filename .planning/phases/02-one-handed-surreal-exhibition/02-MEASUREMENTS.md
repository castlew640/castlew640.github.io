# Phase 02 preliminary measurements

Measured against one published exhibit (`N = 1`), with the final gate and visual audit completed on 2026-09-21 UTC (2026-09-20 local time). These are build bytes, pixel dimensions, object counts, and correctness checks. **No frame-rate or field-performance claim is made in this phase.** Local Chromium uses ANGLE/SwiftShader, a CPU rasteriser. Phase 3 owns PERF-01 and physical-device evidence.

## Transfer and assets

`scripts/measure-scene-budget.mjs` measures the actual Vite/Rolldown output with gzip level 9, separately identifies the always-loaded controller, reads the emitted WebP dimensions, and rejects clocks in authored scene source. The phase's earlier esbuild proxy was 151,848 B. The pre-Phase-2 screenshot baseline was 137,353 B at 1901 × 927. The live-response check recorded in 02-RESEARCH.md verified GitHub Pages `content-encoding: gzip`; gzip is therefore the deployment transfer encoding, though server compression settings can produce slightly different byte counts.

| Artifact | Measured output | Guardrail | Result |
|---|---|---|---|
| Lazily imported scene JavaScript | 157,185 B gzip | ≤ 190,000 B gzip | Pass; 32,815 B headroom |
| Always-loaded controller JavaScript | 3,824 B gzip | Report separately from scene | Final successful gate |
| Shared exhibit screenshot | 37,132 B; 1600 × 780 WebP | ≤ 180,000 B; ≤ 1600 px long edge | Pass; one URL for HTML and WebGL |
| Locally baked fallback gradient | 64 × 256; zero transfer bytes | ≤ 16 KB additional fetch | Pass; no fetch, 65,536 B decoded RGBA pixels |

The real scene is 5,337 B larger than the 151,848 B proxy. The screenshot is 100,221 B smaller than the pre-Phase-2 baseline. All bytes above come from the final successful integrated gate, including the navigation and recovery corrections.

## Renderer accounting

`renderer.info.autoReset = false` and one explicit reset before the top-level render include main, shadow, and reflection submissions in the draw and triangle counts. Materials count actual unique scene materials, including hidden fallback resources. Line segments include the active mirrored fallback outlines. Texture counts remain the unmodified `renderer.info.memory.textures`; authored image assets and renderer attachments are reported separately.

The original three-total-texture guardrail omitted renderer attachments. The regression bound is five actual allocated textures at N = 1, with one additional screenshot allocation per added exhibit. This is a measured contract correction, not a relabeling of the renderer's count. Four allocations are identified below; the fifth is explicitly unattributed. Even the four identified allocations exceed the original total of three. Five is the observed regression ceiling, not a claim that all five are a proven architectural minimum.

| Texture accounting | Live reflection | Small-surface fallback | Evidence |
|---|---|---|---|
| Authored screenshot uploaded to the panel | 1 | 1 | `panelGpuTextures`; same map shared with completed panel |
| Sun shadow target color and depth textures | 2 | 2 | `shadowGpuTextures`; r186 `WebGLShadowMap.js` creates a render-target color texture and a `DepthTexture` |
| Active water resource | 1 reflection target color texture | 1 locally generated gradient texture | `waterGpuTextures`; actual allocated texture handles |
| Allocation not identified by these resource handles | 1 | 1 | Difference from the renderer's total; identity not established by this audit |
| **Actual renderer total** | **5** | **5** | Unmodified `renderer.info.memory.textures` |

The single screenshot URL is shared by the DOM and panel material. The fallback gradient adds no image download. Reflection render-target count stays at most one, and fallback mode has none; the sun retains its independent shadow target while shadows are enabled. The budget suite keeps the five-allocation ceiling, and the existing repeated teardown/re-entry contracts check against accumulating scene resources. Allocation attribution is an instrumentation limit, not omitted from the reported total.

### N = 1 measured counts

| Quantity | Laptop exhibit | Portrait exhibit | 600 × 800 fallback exhibit | Guardrail |
|---|---:|---:|---:|---|
| Draw calls, including shadow/reflection work | 44 | 43 | 43 | ≤ 90 |
| Triangles, including shadow/reflection work | 8,258 | 8,246 | 7,236 | ≤ 120,000 |
| Unique scene materials | 17 | 17 | 16 | ≤ 18; +1 panel material per added exhibit |
| Actual GPU texture allocations | 5 | 5 | 5 | Corrected measured ceiling 5; +1 panel per added exhibit |
| Active line segments | 883 | 883 | 1,057 | ≤ 1,200; +400 per added exhibit |
| Mirrored fallback segments included above | 0 | 0 | 174 | Included in line total |
| Shadow-casting lights / all lights | 1 / 3 | 1 / 3 | 1 / 3 | Exactly 1 shadow-casting light |
| Reflection renders per top-level rendered frame | 1 | 1 | 0 | ≤ 1 |
| Reflection target dimensions | 1024 × 405 | 1024 × 512 | None | ≤ 1024 × 512 |
| Shadow map dimensions | 1024² | 512² | 512² | 1024² desktop; 512² below 768 CSS px |
| Renderer pixel ratio | 1 | 1.75 | 1 | Capped at 1.75; portrait input DPR is 3 |
| Uploaded geometries at exhibit | 29 | 29 | 29 | Reported; no separate §I cap |

Across the additional desktop travel samples, the largest observed values were 45 calls, 8,934 triangles, and 33 uploaded geometries. About and landing samples remained below those counts. The fallback's earlier 1,303-segment result failed the unchanged 1,200 guardrail; simplifying slender mirrored members to single datum strokes reduced the final fallback to 1,057, while preserving broad completed silhouettes.

At every audited stop: reflection camera layer mask 4; zero completed objects on layer 0; all three lights on layers 0 and 2; three transformations; two impossible constructions; four dashed cornice supports and zero solid supports; zero meshes in the landing's drawn right pier; zero walkway obstructions. Camera x = 0, y = 1.62, and x rotation = 0. The three viewport tests passed `fovY` within 0.01°: laptop 38.7320°, portrait 68°, ultrawide 36°. All transformation progress/shadow/reversal checks and the mid-transformation idle check passed.

## Automated coverage and limits

The regression suite covers a 1440 × 810 laptop viewport, a **390 × 664** iPhone 12 Pro-shaped Chromium context with `hasTouch: true` and `deviceScaleFactor: 3`, and a 1730 × 800 ultrawide viewport. It checks all three field-of-view regimes, layer-2-only completed architecture, lights present on both layers, exactly three reversible camera-distance transformations, shadow activation at progress 0.5, two impossible constructions, resource budgets, idle suspension, and reversible reflection fallback. Other phase browser contracts cover lazy loading, native travel, history return, tap-versus-swipe, zoom/reflow, reduced motion, texture failure, context loss, and repeated scene disposal.

Playwright's WebKit browser is not installed locally or in CI: **a Chromium pass is not a Safari pass**. Touch emulation does not establish thumb reach, browser chrome stability, or physical-device performance.

The budget gate was also tested negatively: a temporary 1 KB scene limit rejected the actual chunk and reported its measured size; a temporary `new Clock()` probe rejected the named scene source file. Both probes were removed and the real guardrails restored before final validation.

### Validation record and visual evidence

- Final scene audit: `/tmp/02-08-inspect.log` and `/tmp/02-08-visual/counts.json`; exit 0, with the transformation, shadow, reversal, and idle checks passing.
- Final `npm run check`: `/tmp/phase02-final-check.log`; exit 0, with **33 unit tests and 69 browser tests passing** (browser suite 56.7 seconds), including all five new budget cases and the navigation/accessibility/recovery corrections. Suite duration is execution metadata, not rendering performance evidence.
- Inspected desktop and portrait exhibit captures: `/tmp/02-08-visual/desktop-exhibit-featured-client.png` and `portrait-exhibit-featured-client.png`. The completed column reflections are visible beside the walkway, and the title/CTA-first mobile plate remains legible.
- Inspected about and landing geometry: `/tmp/02-08-visual/desktop-about-geometry.png`, `desktop-landing-geometry.png`, `portrait-about-geometry.png`, and `portrait-landing-geometry.png`. These show the floating cornice and the arch on a drawn right pier.
- Final full landing UI captures: `/tmp/02-08-visual/desktop-landing.png` and `portrait-landing.png`. The audit removes its temporary style after every geometry capture, so full UI files include controls and document content. Resume content continues in normal page flow; final mobile placement and thumb reach remain part of human sign-off.
- Inspected fallback geometry: `/tmp/02-08-visual/fallback-exhibit-featured-client-geometry.png`; the mirrored drawing is retained without a reflection target.

Visual inspection supports the implemented motifs. It does not replace the developer's ART-01/D-05 composition sign-off or either physical-device pass below.

## Outstanding assumptions

| Assumption | Evidence still required | Status |
|---|---|---|
| A1 | iPhone Safari `position: fixed` and `100svh` behavior while its URL bar retracts and returns | Physical-device pass pending |
| A2 | Actual iPhone 12 Pro small-viewport height and overlay/control clearance | Physical-device pass pending; 390 × 664 is emulation |
| A3 | Screenshot WebP decoding as a WebGL texture in iPhone Safari | Safari pass pending |
| A7 | WebGL2 availability in the first CI Chromium run of this phase | Verified in [Pages run 35552310047](https://github.com/castlew640/castlew640.github.io/actions/runs/35552310047): all 69 browser tests passed, including mounted scene, reflection and budget contracts |

## D-18 manual device pass

The end-of-phase gate retains these checks. Record the mobile browser actually used; Safari is the intended iPhone target. No manual result is inferred from automation.

| Device and check | Result |
|---|---|
| Windows laptop, Chrome: vestibule, threshold, roofless water gallery, exhibit, floating cornice, and quiet landing read as one complete exhibition | |
| Windows laptop, Chrome: water visibly shows completed structures where the structure above is drawn-only | |
| Windows laptop, Chrome: complete the journey with mouse only and then keyboard only; open the case study and return to the exhibit | |
| Windows laptop, Chrome: 200% and 400% browser zoom preserve content, focus, and one-handed controls | |
| iPhone 12 Pro, Safari: single-finger swipe travels both directions; pinch-zoom and pan remain available | |
| iPhone 12 Pro, Safari: both arrows are reachable with one thumb without changing grip | |
| iPhone 12 Pro, Safari: tap screenshot opens the case study; swipe ending on it does not; return restores the exhibit | |
| iPhone 12 Pro, Safari: still-view toggle works and content stays readable | |
| iPhone 12 Pro, Safari: URL bar retract/reappear causes no corridor resize or jitter | |
| Mobile browser and version actually used | |

Phase 02 verification is `human_needed`; composition/device sign-off remains pending. On 2026-09-21, the owner authorized deployment of `0f0507e`. The Pages run linked above passed 33 unit and 69 browser tests and deployed successfully. The public HTML at `https://castlew640.github.io/` returned HTTP 200 and exactly matched the tested local build. CI rendering establishes correctness in that environment, not physical-device performance.
