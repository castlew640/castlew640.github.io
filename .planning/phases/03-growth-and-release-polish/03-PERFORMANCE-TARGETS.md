# Phase 03 release performance targets

Set before Phase 03 measurements on 2026-09-21. These are delegated design targets, not historical approval or measured results. A missing sample fails the measurement contract.

| Measure | Target |
|---|---:|
| Cold essential still-view transfer | ≤ 1,000,000 B |
| Cold optional 3D startup, including essential bytes | ≤ 3,000,000 B |
| Cold full N=10 home traversal | ≤ 3,000,000 B |
| Windows laptop Chrome, normal power, 60 Hz, complete displayed frames | median ≤ 16.7 ms; p95 ≤ 33.4 ms; worst ≤ 100 ms |
| Physical iPhone 12 Pro Safari, explicit 3D opt-in, complete displayed frames | median ≤ 33.4 ms; p95 ≤ 50 ms; worst ≤ 100 ms |

Measure at least three forward and backward traversals after the first usable presentation. Keep failed runs and record cold startup separately. Report warm transfer separately. Record device, OS, browser/version, GPU, viewport, DPR, commit, cache state, and evidence path. Headless Chromium animation-frame intervals are scheduling proxies; they do not establish displayed GPU frame time or either physical-device result. The scene quality policy samples synchronous submission cost only (28 ms/12-sample degradation, 14 ms/90-sample recovery, two 33 ms reflection samples).

Inherited ceilings remain: scene JS ≤ 190,000 B gzip; each preview ≤ 180,000 B and ≤ 1600 px long edge. For N published projects, draws ≤ 90 + 12(N−1), triangles ≤ 120,000 + 18,000(N−1), materials ≤ 18 + (N−1), line segments ≤ 1,200 + 400(N−1), actual GPU textures ≤ 5 + (N−1); N=0 uses N=1 bounds. The actual texture ceiling includes one still-unattributed allocation. Reflection ≤ one pass and target ≤ 1024×512; exactly one shadow light; shadows 1024² desktop or 512² narrow; DPR caps 2 desktop, 1.75 narrow, 1.25 degraded. Idle means no scene frames after one second without changes, and hidden/offscreen each suspend independently.
