---
phase: 02-one-handed-surreal-exhibition
plan: 07
subsystem: ui
tags: [three, webgl, astro, accessibility, playwright]
requires:
  - phase: 02-06
    provides: Demand-rendered ivory corridor, shared stone and ink, canonical tap controller
provides:
  - On-axis ivory exhibit portals with shared DOM screenshot textures and panel-only picking
  - Legible desktop overlay and accessible mobile document-flow continuation
  - Computed framing, actual mesh navigation, asset recovery and contrast regression coverage
affects: [02-08, 03-performance-and-growth]
tech-stack:
  added: []
  patterns:
    - One decoded DOM image supplies its GPU texture without another network request
    - Panel hits read the live stop data-slug and delegate navigation to the canonical anchor
    - Mobile title and CTA precede complete project text in ordinary document scrolling
key-files:
  created: [src/scripts/exhibition/scene/exhibit.ts]
  modified:
    - src/scripts/exhibition/scene/index.ts
    - src/components/exhibition/ExhibitSection.astro
    - src/styles/global.css
    - tests/exhibition-navigation.spec.ts
    - tests/exhibition-travel.spec.ts
    - tests/exhibition-resilience.spec.ts
key-decisions:
  - Prioritize complete readable content over the mathematically impossible 52svh mobile height cap; retain the plate, 104px bottom padding and native document scrolling.
  - Interpret the sill's 3.0m datum as its lower face, preserving the strict walkway clearance and placing its upper rear behind the image.
  - Keep one panel material per exhibit and include portal ink in the existing renderer budget diagnostics.
requirements-completed: [ART-01, ART-02, NAV-05, NAV-04, ACCESS-05]
duration: 17 min
completed: 2026-09-20
status: complete
---

# Phase 2 Plan 7: Screenshot Exhibit Portals Summary

**Real client screenshots occupy pickable ivory portals, with a single canonical navigation path, readable DOM overlays and graceful image recovery.**

## Performance

- Started: 2026-09-20T19:43:00Z (approximate)
- Completed: 2026-09-20T19:59:32Z
- Tasks: 3
- Implementation/test files: 7

## Accomplishments

- Built paired piers, lintel, image reveal, deep sill, dashed pediment/pilasters, deterministic index-based flanking variations, rust leader/dot and three sill ticks. Solid mass shares the existing stone material; lines share the existing ink materials; panel geometry is shared.
- The actual DOM image is decoded once and reused by a colour-correct sRGB texture with capped anisotropy and centre cover cropping. Each panel adds exactly one material. Teardown disposes textures/materials/geometries and removes listeners and figure aria-hidden state.
- Only panel meshes enter the raycaster. Their current DOM data-slug feeds the existing validated anchor-click path. Removing data-slug prevents navigation. Non-panel architecture and ink do not act as links.
- Desktop text sits on the required paper plate at 46svh. Portrait places the title and CTA at 48svh, with the complete summary and contract labels continuing beneath the first viewport on the same plate. No nested scrolling, per-frame DOM transforms, clipping or duplicate copy is used.
- Failed images retain the original image element and accessible alt text; a visible authored description and caption replace the browser's broken bitmap icon while the portal shows its ink frame and a 0.3-opacity hatch.

## Task Commits

1. Portal, image texture and picking — `7648f37` (feat)
2. Overlay, mobile continuation and fallback styling — `d0ca08d` (feat)
3. Framing, gesture, recovery and layout verification — `be5e244` (test)

## Verification

- Final exact-source `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run check` passed. **58/58 Chromium browser cases**, the three existing unit-test files, Astro check, production build, built-content verification, scene boundary and axe all passed. Log: `/tmp/02-07-final-check.log`. No implementation/test changes followed this gate.
- New tests prove computed panel framing at 1440×810, 390×664 touch/DPR3 and 844×390; the landscape top margin is **5.15%**, above the 5% floor. All panel extents, constant camera pose, image identity and sRGB diagnostics pass.
- Positive touch opens exactly `/projects/featured-client/` through the visible anchor. Long press, wandering press, scrolling press, two pointers, pier taps, missing slugs, lintel/sill/walkway/sky taps do not navigate.
- A full page load requests exactly one screenshot asset. Failed scene-chunk and image requests recover as specified. Existing null-WebGL and actual context-loss/restoration cases remain present exactly once and pass.
- Measurements: **9 materials, 635 ink segments, 47–48 draw calls, about 4,148 triangles, zero walkway obstructions**. Resource counts remain stable across three remounts. Diagnostics expose only numbers/booleans.
- Desktop 1440×900 overlay top **414.25px**, width **544px**. Portrait 390×664 overlay top **319.02px**, width **390px**, bottom padding **104px**, CTA centre in the required thumb band. At 320px/200% text the CTA ends **539.98px** and controls start **560px**, providing **20px clearance** with no horizontal overflow.
- Contrast is tested against a worst-case black scene through the 88% paper plate, both active and after teardown. No forbidden runtime navigation, per-frame DOM transforms, exhibitionOrder keying, production stubs or additional trust boundary was introduced.
- Documentation checked against official [Texture](https://threejs.org/docs/pages/Texture.html) and [Raycaster](https://threejs.org/docs/pages/Raycaster.html) APIs and installed r186 types. Context7 MCP/CLI are unavailable. No dependency was added.

## Visual Evidence

Inspected final screenshots in `/tmp/02-07-visual/`:

- `desktop.png`, `portrait.png`, `landscape.png`
- `portrait-200.png`, `narrow-200.png`
- `portrait-continuation.png`, `portrait-200-continuation.png`, `narrow-200-continuation.png`
- `counts.json` contains numeric layout and renderer measurements.

All automation and captures use **Chromium**, with software rendering in this environment. They establish correctness, not representative-device frame performance or Safari-engine behavior. Safari and physical-device confirmation remain the D-18 manual pass in 02-08.

## Deviations from Plan

1. **[Rule 2 — Correctness] Mobile cap replaced with document-flow continuation.** At 390×664, 52svh is only 345.28px. Prescribed vertical padding consumes 128px before the title, eyebrow, 44px link, chips or summary; the complete normal-sized content requires substantially more, and 200% text requires more again. The orchestrator explicitly approved readable content over this impossible combination. The sheet now has `min-height:52svh`, retains 104px bottom padding, places the CTA before the summary visually, and continues complete text below the viewport on the full plate. Short landscape gets a narrower 36vw overlay and early CTA to clear the arrows. Final enlarged-text tests require at least 16px actual CTA clearance. Commits: `d0ca08d`, `be5e244`.
2. **[Rule 2 — Correctness] Sill clearance datum reconciled.** A 0.2m sill centred at y=3.0 would occupy y=2.9 and violate the strict no-solid-mass-below-3.0 rule. Its lower face is at 3.0, centre at 3.1, with its upper rear behind the screenshot and its ticks beginning at 3.0. No panel extent or standoff changes. Commit: `7648f37`.
3. **[Rule 2 — Verification] Extend the existing material invariant.** The prior exact total of eight materials necessarily becomes eight plus the number of panels. The assertion now enforces that exact relationship; remount equality, budgets and every previous behavioral assertion remain. Portal ink is also included in the segment count. Commits: `7648f37`, `be5e244`.

## Issues Encountered

- Preview/Chromium and git index writes required normal sandbox escalation. Hooks were not bypassed.
- The first expanded gate caught insufficient 320px enlarged-link clearance; ordinary inline wrapping and 1.2 line height preserve enlarged type and restore the required gap.
- Existing schema/shadow-map deprecation hints and the uncompressed bundle-size advisory remain; Astro reports zero errors and zero warnings.

## Pending Human Verification

- Confirm the rust leader reads as an annotation from screenshot into the overlay/case-study link.
- Confirm sill ticks visually rhyme with the three contract labels and screenshot colour/cropping is faithful.
- Review the mobile title/CTA-first continuation on the representative physical devices.

## Next Plan Readiness

02-08 can add its planned reflection and transformations using the live portals. Those effects were not implemented here. Phase 2 remains in progress; requirement IDs above record only this plan's assigned slice. The existing user edit to Phase 1 `01-CONTEXT.md` was preserved and excluded from commits.

## Self-Check: PASSED

The created exhibit module, all seven implementation/test files and this summary exist. All three task commits resolve, contain no file deletions and passed the final deployment gate. Final screenshot artifacts exist; generated artifacts remain outside the repository. No new production stub blocks this plan.
