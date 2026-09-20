---
phase: 02-one-handed-surreal-exhibition
plan: 01
subsystem: infra
tags: [three.js, esm, scene-boundary-guard, ui-spec, package-legitimacy]

# Dependency graph
requires:
  - phase: 01-publishable-portfolio-and-delivery
    provides: Astro 7.3.3 static site, npm run check gate chain, verify-built-content.mjs house style
provides:
  - three@0.186.0 and @types/three@0.186.0 installed at exact pins with committed lockfile
  - scripts/verify-scene-boundary.mjs — source-level guard wired into npm run check
  - 02-UI-SPEC.md reconciled with the vanilla-three (no React/R3F) stack, eleven corrections applied
  - 02-RESEARCH.md Open Questions section marked RESOLVED with per-question resolution notes
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: [three@0.186.0, "@types/three@0.186.0"]
  patterns:
    - "Scene-boundary guard: only src/scripts/exhibition/scene/** may import three; enforced by a dedicated npm run check step"
    - "Package-legitimacy gate: any new npm dependency is halted behind a blocking checkpoint:human-verify before install, never auto-approved"

key-files:
  created:
    - scripts/verify-scene-boundary.mjs
  modified:
    - package.json
    - package-lock.json
    - .planning/phases/02-one-handed-surreal-exhibition/02-UI-SPEC.md
    - .planning/phases/02-one-handed-surreal-exhibition/02-RESEARCH.md

key-decisions:
  - "Locked Phase 2 stack to plain three@0.186.0 with no React, react-dom, @react-three/fiber, or @astrojs/react — the measured React+R3F bundle (308,170 B gzipped) exceeds the UI-SPEC §I 190 KB budget by 62%, while vanilla-three (151,848 B gzipped) fits with headroom."
  - "viewport-fit=cover is NOT adopted for this phase; the stated §F.3 fallbacks (24px/12px/104px) are the operative values."
  - "Automated device coverage runs under Chromium with the iPhone 12 Pro viewport preset; Safari-engine behavior is covered only by the D-18 manual device pass, never conflated with a Chromium pass."

patterns-established:
  - "Boundary-guard scripts follow scripts/verify-built-content.mjs house style: plain .mjs, node: prefixed imports, top-level await, throw new Error on failure, one console.log summary line."

requirements-completed: [ART-01]

# Metrics
duration: 20min
completed: 2026-09-20
---

# Phase 02 Plan 01: Lock the Vanilla-Three Stack and Reconcile the UI Contract Summary

**Installed three@0.186.0/@types/three@0.186.0 at exact pins behind a human-verified package-legitimacy gate, added a source-boundary guard to npm run check, and corrected eleven defects in 02-UI-SPEC.md that RESEARCH.md traced to three.js/API source, resolving all six research open questions in place.**

## Performance

- **Duration:** ~20 min (this continuation; Task 1's checkpoint was approved by the developer in a prior session)
- **Completed:** 2026-09-20T14:47:22Z
- **Tasks:** 3/3 (Task 1 checkpoint resolved by developer approval; Tasks 2–3 executed in this session)
- **Files modified:** 5 (package.json, package-lock.json, scripts/verify-scene-boundary.mjs [new], 02-UI-SPEC.md, 02-RESEARCH.md)

## Accomplishments

- Installed exactly `three@0.186.0` (runtime) and `@types/three@0.186.0` (dev) at exact pins with `--save-exact`, matching the Phase 1 no-range-prefix style; confirmed no `react`/`react-dom`/`@react-three/fiber`/`@astrojs/react` present.
- Wrote `scripts/verify-scene-boundary.mjs`, a source-level guard that throws (naming the offending file) if any `.ts`/`.astro` file outside `src/scripts/exhibition/scene/` imports `three`, and wired it into `npm run check` immediately after `verify-built-content.mjs`, preserving the existing gate order. Verified the guard both passes cleanly on the current tree and fails correctly against a deliberately introduced violation.
- Ran `npm run check` end to end (astro check, build, artifact verify, scene-boundary verify, unit tests, Playwright e2e) — all green, 11/11 Playwright tests passing.
- Amended `02-UI-SPEC.md` in place with all eleven corrections listed in the plan: dropped the React Three Fiber island description; corrected §Registry Safety's package list and budget rationale; added a "the island" reading rule; corrected §A.3's travel figure (≈3496 → ≈2776 CSS px); added the scoped `pointer-events: none` stacking rule to §A.6 that unblocks NAV-05; added a §B.2 units note distinguishing `linewidth` (CSS px) from `dashSize`/`gapSize` (model-space units); added the `layers.enable(2)` / `getReflectionCamera(...).layers.set(2)` requirements and render-target-defaults note to §C.4; stated the `viewport-fit=cover` decision (not adopted) in §F.3; replaced §K hook #6's hard-coded band with the computed `atan(2.00/12)` expectation and stated hook #8's literal `layers.mask === 4` assertion; added new §M "Automated vs. Manual Device Coverage." Frontmatter `status: approved` and the Checker Sign-Off block were left untouched.
- Renamed `02-RESEARCH.md`'s `## Open Questions` heading to `## Open Questions (RESOLVED)` and added a one-line `**Resolution:**` under each of the six questions, naming where its decision landed. Verified via `git diff` that no finding, figure, or citation changed — only the heading and six resolution lines.

## Task Commits

1. **Task 1: Package legitimacy gate for three and @types/three** — checkpoint approved by the developer in the prior session (no commit; this task changes no file per plan spec).
2. **Task 2: Install the pinned stack and gate the three import boundary in CI** — `2a52774` (feat)
3. **Task 3: Reconcile the approved UI design contract, and mark the research open questions resolved** — `cb3d376` (docs)

**Plan metadata:** (this commit, to follow)

## Files Created/Modified

- `scripts/verify-scene-boundary.mjs` - Walks `src/`, throws naming the offending file if `three` is imported outside `src/scripts/exhibition/scene/`; prints a scan-count summary on success.
- `package.json` - Added `three@0.186.0` dependency, `@types/three@0.186.0` devDependency, and `node scripts/verify-scene-boundary.mjs` to the `check` script chain.
- `package-lock.json` - Locked the two new packages and their transitive tree (7 packages added by `@types/three`'s own devDependency resolution; 1 by `three`).
- `.planning/phases/02-one-handed-surreal-exhibition/02-UI-SPEC.md` - Eleven in-place corrections reconciling the contract with the vanilla-three stack; new §M section; amendment blockquote recording the change set.
- `.planning/phases/02-one-handed-surreal-exhibition/02-RESEARCH.md` - `## Open Questions` renamed to `## Open Questions (RESOLVED)`; six `**Resolution:**` lines added.

## Decisions Made

- Used `npm install <pkg>@<version> --save-exact` (no `.npmrc` `save-exact=true` present in the repo) to match the existing Phase 1 exact-pin convention with no `^`/`~` range prefixes.
- `scripts/verify-scene-boundary.mjs` scans whole-file text with two regexes (static `import ... from 'three...'` and dynamic `import('three...')`) rather than a per-line scan, avoiding false negatives on multi-line import statements while still reporting the offending file path per the plan's acceptance criteria (which requires the file path, not a line number).
- Where §F.1's original "Verifiable acceptance bands" table stated the now-incorrect 50–58% portrait band as an assertion, it was replaced with an explanatory note (rather than left alongside a contradicting computed formula in §K hook #6), so no reader could still cite the stale hard-coded band as authoritative.

## Deviations from Plan

None — plan executed exactly as written. Task 1's checkpoint was pre-approved by the developer (documented in the resume instructions this agent received); Tasks 2 and 3 were executed per the plan's action and verification steps with no auto-fixes required.

## Issues Encountered

None. `npm run check` passed on the first attempt after both tasks, including the deliberate-violation test of the new boundary guard.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

`02-UI-SPEC.md` now accurately describes the stack every later Phase 2 plan will build against (plain `three@0.186.0`, no React), and `02-RESEARCH.md`'s six open questions are resolved with explicit pointers to the plans that consume each resolution (02-04, 02-07, 02-08). The scene-boundary guard is live in `npm run check`, so any later plan that accidentally imports `three` outside `src/scripts/exhibition/scene/` will fail the deployment gate immediately. No blockers for Wave 1 (policy + scroll + arrow + tap controller, built with no WebGL at all) or Wave 2 (the three.js scene module).

## Self-Check: PASSED

- FOUND: scripts/verify-scene-boundary.mjs
- FOUND: package.json (three@0.186.0, @types/three@0.186.0, verify-scene-boundary.mjs wired into check)
- FOUND: .planning/phases/02-one-handed-surreal-exhibition/02-UI-SPEC.md (eleven corrections + §M present)
- FOUND: .planning/phases/02-one-handed-surreal-exhibition/02-RESEARCH.md (Open Questions (RESOLVED) + 6 resolutions)
- FOUND commit 2a52774 (Task 2)
- FOUND commit cb3d376 (Task 3)

---
*Phase: 02-one-handed-surreal-exhibition*
*Completed: 2026-09-20*
