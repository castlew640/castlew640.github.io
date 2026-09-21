---
phase: 03-growth-and-release-polish
plan: "06"
subsystem: content-and-evidence
tags: [astro-content, playwright, portfolio, evidence, growth]
requires:
  - phase: 03-growth-and-release-polish
    plan: "05"
    provides: Final phone, label and copy presentation
provides:
  - Real second project exhibit and canonical portfolio case study
  - Annotated captures of the actual moving and illustrated client exhibit
  - Multi-exhibit browser regression coverage
affects: [03-07, 03-08, portfolio-content]
key-files:
  created: [tests/portfolio-project.spec.ts, scripts/capture-portfolio-evidence.mjs, src/content/projects/portfolio/index.md, src/content/projects/portfolio/gallery.png, src/content/projects/portfolio/still.png]
  modified: [tests/portfolio.spec.ts, tests/exhibition-budget.spec.ts, tests/exhibition-navigation.spec.ts, tests/exhibition-reflection.spec.ts, tests/exhibition-resilience.spec.ts, tests/exhibition-travel.spec.ts, package.json]
requirements-completed: [GROW-01]
status: complete
metrics:
  completed: 2026-09-21
---

# Phase 3 Plan 6: Real Portfolio Exhibit

Surreal Portfolio is now a genuine second project after the Eiffel Technologies client story. Its canonical page explains the usability problem, native one-handed travel, ordinary HTML, still-first phones, graphics fallback and the concrete static/Three.js tradeoffs, with a public repository link.

## Task Commits

1. Failing portfolio acceptance and preserved client contracts — `3e6580c` (test).
2. Script and initial actual-site captures at N=1 — `239a2e6` (feat).
3. Content-only portfolio publication — `69bb03d` (feat).
4. Final N=2 recapture — `3e2f857` (docs; moving image changed, still image remained byte-identical).
5. Multi-exhibit scene regression updates and aggregate gate — `dd3eb4d` (test).

## Evidence and Claims

- `scripts/capture-portfolio-evidence.mjs` opened the built site at 1440x900, DPR 1. It recorded source `69bb03d9618495b3c2d02039fa458a28de369b27` and captured the final moving view at 2026-09-21T17:25:31.580Z and still view at 2026-09-21T17:25:31.723Z. Temporary DOM callouts identify actual links, plates, view choice, authored caption, illustration and arrows; they are removed after each screenshot.
- The final moving capture shows the real client screenshot and the second portfolio exhibit in the distance. The still capture shows the same approved client screenshot and caption with the illustrated architecture. Both were inspected before publication. No fixture or private source image was used.
- Native scroll, direct HTML routes, phone policy, graphics fallback and checked deployment are supported by the implemented source and browser checks. The public story does not assert physical frame rates, commercial impact or a rollback that has not yet been exercised.
- The featured client's canonical route, three distinct contracts, three approved figures and return path remain intact. The portfolio adds two captioned optimized figures and the public repository link through the same validated content collection.

## Verification

- Before content publication, the existing client suite passed 6/6 and the new portfolio tests failed only on the missing exhibit/route.
- With two published projects, portfolio/client suites passed 8/8; four inherited scene suites passed 58/58 after deriving stop counts, stations and line budgets from the DOM.
- Winding route and reflection suites passed 7/8 initially; the sole failure was the test's implicit phone switch during a narrow fallback resize. Keeping an explicit moving choice made the targeted fallback test pass, preserving the real phone policy.
- `npm run check` passed Astro/build/content/boundary/budget checks, 35 unit cases and 80 browser cases with two workers. Scene gzip remained 159,545 / 190,000 B. Optimized exhibit previews measured 37,132 B and 57,350 B, each below 180,000 B.

## Deviations from Plan

- Final evidence was recaptured after committing the content entry so the capture log could name a source SHA containing the published story. The still image did not change between N=1 and N=2 because it depicts the same first client exhibit; the moving image changed to show the appended world.
- Legacy tests with collection-wide locators or fixed one-project stop coordinates were revised to preserve the same visitor assertions under N=2. No public rendering logic changed for the content append.

## Issues Encountered

- The first full N=2 run exposed 22 obsolete one-project assertions. Updated scoping and N-derived station/resource formulas brought the full gate back to green.

## Next Phase Readiness

Plan 03-07 can measure and harden the real N=2 release and isolated N=10 growth. Windows Chrome and physical iPhone Safari performance remain unobserved; no headless result is presented as their substitute.

## Self-Check: PASSED

The portfolio route, two local image sources, capture script and task commits exist; the final built two-project site passes its aggregate local gate.
