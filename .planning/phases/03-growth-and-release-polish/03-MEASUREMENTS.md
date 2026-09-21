# Phase 03 growth and performance evidence

Targets were fixed in [03-PERFORMANCE-TARGETS.md](03-PERFORMANCE-TARGETS.md) before collection. Final artifact code: `6e1641bf58c7561d956df48c4191d28372dee4d1`; the later `04d03bd` commit only logs test ownership counts. Measurements were collected on 2026-09-21 with `node scripts/measure-exhibition.mjs --base-url URL --label NAME --seconds 30 --output PATH`, against the checked production `dist` (N=2) and the isolated `performance-count-10` fixture. Each cold and warm sample included three forward and three backward route legs. JSON evidence is retained in [evidence/production-n2.json](evidence/production-n2.json) and [evidence/isolated-n10.json](evidence/isolated-n10.json). These are **headless Chromium lab observations**, not physical-device display measurements.

## Transfer and artifact budgets

`PerformanceResourceTiming.transferSize` includes response headers for same-origin navigation and resources. Warm entries were cleared before repeating travel; zero means no new requests, not a promise about a future browser cache. The local Astro preview served the checked static artifacts; actual Pages transfer needs the Phase 03 live smoke after release.

| Cold transfer | N=2 production | N=10 isolated | Target | Lab result |
|---|---:|---:|---:|---|
| Essential still view | 54,210 B | 55,350 B | ≤ 1,000,000 B | Within target |
| Optional 3D startup, essential included | 272,514 B | 249,696 B | ≤ 3,000,000 B | Within target |
| Full home traversal | 272,514 B | 462,596 B | N=10 ≤ 3,000,000 B | Within target |
| Warm repeat travel | 0 B, no requests | 0 B, no requests | Report separately | Recorded |

Final production scene JavaScript is **159,823 B gzip** (≤190,000 B); always loaded controller is 4,013 B gzip, all essential scripts 4,293 B gzip. The two published optimized exhibit previews are distinct: 37,132 B at 1600×780 and 57,350 B at 1440×900, total 94,482 encoded bytes (each ≤180,000 B and 1600 px). The N=10 fixture has **ten distinct optimized URLs and SHA-256 hashes**, total **281,024 encoded bytes**: one 1600×780 client image and nine annotated, fixture-only evidence images at 1200×675, 1000×800 or 720×1080; each is 19,810–37,132 B. All ten preview URLs appear among the final full-traversal resource entries. The exact URL, byte, dimension and hash list is reproducible from the isolated checked `dist` and was inspected during this run; the N=10 browser test rejects duplicate URLs/hashes and over-budget bytes. The normal `dist` hash was unchanged by every isolated fixture build. No fixture or draft was serialized into the production artifact.

## Browser scheduling and submission

Lab host: Linux x86_64, Chromium **153.0.8010.12**, ANGLE Vulkan **SwiftShader Device (Subzero)** software renderer, 1440×810 CSS px, DPR 1. Normal browser power and physical refresh rate were not established. `requestAnimationFrame` intervals measure browser scheduling and include the software renderer's overhead; they are **not complete displayed GPU frame times**. Submission is the synchronous `renderer.render` cost that drives the existing quality policy and is kept separate. The headless interval values exceed the physical targets and cannot pass PERF-01; physical Windows Chrome evidence is still needed to determine real laptop behavior.

| Lab interval, 30 s / six legs | Cold median / p95 / worst | Warm median / p95 / worst | Cold samples / warm samples |
|---|---|---|---:|
| N=2 rAF | 150.0 / 200.0 / 216.7 ms | 166.7 / 216.6 / 233.3 ms | 207 / 182 |
| N=10 rAF | 183.4 / 266.6 / 450.0 ms | 216.7 / 283.3 / 350.0 ms | 162 / 142 |
| N=2 submission | 0.7 / 1.3 / 24.1 ms | 0.7 / 1.2 / 1.6 ms | 206 / 180 |
| N=10 submission | 1.2 / 13.3 / 22.2 ms | 1.5 / 14.0 / 19.9 ms | 159 / 140 |

These are observed values, not adjusted limits. Both final samples ended at quality level 0; the tests separately exercise degradation and recovery. A missing or empty sample would make the measurement CLI fail.

## Scene growth and lifecycle

At the sampled entrance, N=2 used 35 draws, 18,788 triangles, 18 materials, 1,248 line segments, 6 actual textures, 2 uploaded panels and 29 geometries. N=10 used 99 draws, 37,066 triangles, 26 materials, 2,639 line segments, 6 actual textures, 2 uploaded panels and 77 geometries. Each was within its N-based ceiling; the N=10 browser suite also enforced budgets at every exhibit, including all ten real panel picks, direct routes and returns. Both samples used one reflection pass, one shadow light, 1024×405 reflection target, 1024² shadows and DPR 1. Fallback mode uses no reflection target and stays within its line budget.

The N=2 ten-remount test observed a baseline of **20 actual EventTarget registrations** after still-view load and the same count after every teardown. Identical warmed scenes held **29 geometries, 6 actual textures, 18 materials and quality level 0**. It observed **10 WebGL contexts created, 10 context-loss releases and zero live texture handles after teardown**. Five further project visits returned to the still catalogue without an active canvas. Separate browser tests observed no additional scene render after one second idle, and independently suspended work when hidden and offscreen.

### Retained failed observations

The first N=10 test decoded all **10** images at mount, violating the ≤3 current/adjacent window; [the final suite](evidence/isolated-n10.json) decodes and uploads only nearby panels. The first expanded draw test measured **212** calls against the N=10 limit of 198; per-portal stone batching brought the sampled entrance to 99 calls. The first full N=2 traversal retained the fallback gradient after live reflection resumed, reaching **7** actual textures against its ceiling of 6. The [pre-fix N=2 trace](evidence/production-n2-before-water-fix.json) and [pre-fix N=10 trace](evidence/isolated-n10-before-water-fix.json) remain retained. The final N=2 full/warm samples stayed at 6 textures, and the fallback-to-reflection regression test passed.

## Physical and human acceptance still pending

| Required evidence | Status |
|---|---|
| Windows laptop Chrome, normal power/60 Hz: complete displayed-frame median ≤16.7 ms, p95 ≤33.4 ms, worst ≤100 ms on real N=2 and locally served N=10; three forward/back traversals, cold startup separate, device/OS/browser/GPU/viewport/DPR and trace path | **Pending owner trace**. Headless rAF and submission costs above do not satisfy it. |
| Physical iPhone 12 Pro Safari after explicit 3D opt-in: median ≤33.4 ms, p95 ≤50 ms, worst ≤100 ms on N=2 and N=10, same provenance and traversal count | **Pending.** Owner has iPhone but no Mac; Apple's connected-Mac Web Inspector is unavailable for a rendering timeline. Visitor observations remain useful but do not supply frame percentiles. |
| Windows Chrome and iPhone Safari visual/touch/zoom/browser-chrome pass, plus prior Phase 01/02 UAT | **Pending independent checklist** in the release runbook and inherited UAT files. Automated Chromium emulation does not close these fields. |

**PERF-01 is unverified (`human_needed`).** Transfer and automated lifecycle/growth evidence supports GROW-01, GROW-04 and PERF-02, but it cannot establish the complete physical performance truth. No historical UAT result was changed by this plan.
