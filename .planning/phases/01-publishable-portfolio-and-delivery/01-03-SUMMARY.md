---
phase: 01-publishable-portfolio-and-delivery
plan: "03"
subsystem: delivery
tags: [github-actions, github-pages, playwright, accessibility, ci-cd]
requires:
  - phase: 01-publishable-portfolio-and-delivery
    provides: Static Astro profile, validated project content, approved resume, and client evidence
provides:
  - Source, built-artifact, browser, accessibility, and reduced-motion release gates
  - Immutable-action GitHub Pages workflow that deploys the already checked dist artifact
  - Public account-site repository and verified live root/direct project routes
  - Recorded failed-check proof showing the previous release remains live
affects: [one-handed-surreal-exhibition, repeatable-growth-and-release-polish]
tech-stack:
  added: [GitHub Actions, GitHub Pages]
  patterns: [single checked build artifact, least-privilege dependent deployment, reversible failed-release proof]
key-files:
  created: [.github/workflows/pages.yml, scripts/verify-built-content.mjs, tests/project-validation.test.ts, tests/portfolio.spec.ts, src/content/projects/verification-draft.md]
  modified: [package.json, src/lib/project-validation.ts, src/styles/global.css]
key-decisions:
  - "Deploy only the dist artifact produced by the build job after the aggregate release check passes; the deploy job never checks out or rebuilds source."
  - "Use the repository's actual master default branch and GitHub Pages workflow publishing at the account-site root."
  - "Prove failed-release preservation with an approved reversible content failure followed by a normal git revert, without rewriting history."
patterns-established:
  - "Release gate: type/content checks, one production build, built-output assertions, Node validation tests, and browser journeys run before artifact upload."
  - "Deployment gate: only default-branch pushes can run the pages/OIDC-authorized job, which needs the successful build job."
requirements-completed: [ACCESS-02, ACCESS-03, GROW-02, GROW-03, SHIP-01, SHIP-02]
duration: 20 min
completed: 2026-09-19
status: complete
---

# Phase 1 Plan 3: Checked GitHub Pages Delivery Summary

**A single-build release gate now publishes its exact tested artifact to the public account site, with recorded evidence that a failed content check cannot replace the working release.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-09-19T21:51:59Z
- **Completed:** 2026-09-19T22:12:20Z
- **Tasks:** 3/3
- **Files modified:** 8 implementation/test/workflow files plus planning state

## Accomplishments

- Added deterministic validation, built-output, no-JavaScript, direct-route, keyboard/focus, 320px reflow, reduced-motion, and axe checks; the final release gate passes 4/4 Node tests and 10/10 browser tests.
- Published the public source repository at `https://github.com/castlew640/castlew640.github.io` and the checked site at `https://castlew640.github.io/` using a full-SHA-pinned, least-privilege Pages workflow.
- Demonstrated release preservation with a failed default-branch run that produced no artifact or deployment while the prior live root and project route remained healthy, then restored through a normal revert commit and successful redeployment.

## Task Commits

1. **Task 1: Enforce source and built-artifact visitor contracts** — `f560834` (test)
2. **Task 2: Confirm the selected public repository is safe to connect and authorize the delivery proof** — owner approval checkpoint; no code commit
3. **Task 3: Publish the checked artifact and prove failed checks cannot replace it** — `249b999` (ci)
4. **Controlled failed-check proof** — `3861ed4` (test)
5. **Normal restoration revert** — `6a77fab` (revert)

## Delivery Evidence

### Initial checked release

- Workflow run: `35472362500` — `https://github.com/castlew640/castlew640.github.io/actions/runs/35472362500`
- Source SHA: `249b9998515a9d384ddacccad9ad693f5dabc2e2`
- Build job: `105975515240`
- Deploy job: `105975634698`
- Pages artifact: `10593290429`
- GitHub deployment: `6546244396`

### Controlled failed release

- Commit: `3861ed4fc5bafbff4a3e0335462fa6076a3e1958`
- Workflow run: `35472453422` — `https://github.com/castlew640/castlew640.github.io/actions/runs/35472453422`
- Build job: `105975773130` — failed during `npm run check` on deliberately invalid published content
- Deploy job: `105975856146` — skipped because `build` failed
- Artifact API result: `total_count: 0`
- Deployment API result for the failed SHA: `[]`
- Live preservation: root and direct case-study route remained HTTP 200 and retained the prior checked content

### Restored release

- Revert commit: `6a77fab032271c16cecab254fab48403e100593d`
- Workflow run: `35472513054` — `https://github.com/castlew640/castlew640.github.io/actions/runs/35472513054`
- Build job: `105975945123`
- Deploy job: `105976058929`
- Pages artifact: `10593875562`
- GitHub deployment: `6546271096`
- Live verification: `https://castlew640.github.io/` and `https://castlew640.github.io/projects/featured-client/` both return HTTP 200; the controlled failure token is absent

## Verification

- Final `npm run check` passes: Astro diagnostics report 0 errors, the production build emits both routes, artifact verification passes, Node validation passes 4/4, and Playwright passes 10/10.
- GitHub records the expected success → failure → restored-success run sequence.
- Pages reports `build_type: workflow`, HTTPS enforcement, no custom domain, and the account-site URL.
- The workflow has one aggregate release command, uploads `dist/` only after it succeeds, and gives Pages/OIDC write permissions only to the dependent default-branch deploy job.
- Automated keyboard, narrow viewport, JavaScript-disabled, reduced-motion, metadata, link, screenshot-semantic, and axe journeys pass. Final subjective desktop/mobile visual inspection remains for the phase verification/UAT gate.

## Files Created/Modified

- `.github/workflows/pages.yml` — immutable-action build/upload/deploy pipeline with per-job least privilege.
- `package.json` — one aggregate check sequence with a single production build.
- `scripts/verify-built-content.mjs` — required route/asset/content and draft/base-path assertions over `dist/`.
- `src/content/projects/verification-draft.md` — unmistakable unpublished sentinel proving draft exclusion.
- `src/lib/project-validation.ts` and `tests/project-validation.test.ts` — exact contract, slug, URL, and published evidence regression checks.
- `tests/portfolio.spec.ts` — no-JavaScript, keyboard, narrow reflow, metadata, evidence, axe, and reduced-motion journeys.
- `src/styles/global.css` — reduced-motion override preserving readable content and actions.
- `.gitignore` — existing Phase 1 entries were verified to exclude dependencies, build/cache output, browser reports/results, and local environment files while preserving approved public assets.

## Decisions Made

- Kept `master` because the newly created repository adopted the local branch as its actual default branch; triggers and deploy guards use that exact branch.
- Resolved reviewed official Actions to immutable commits with release-tag comments: checkout `v7.0.1`, setup-node `v7.0.0`, upload-pages-artifact `v5.0.0`, and deploy-pages `v5.0.1`.
- Used the approved content-check failure and a standard `git revert`; no force push or history rewrite occurred.

## Deviations from Plan

None — the plan's checks, public repository, exact-artifact pipeline, failed-release proof, and normal restoration were executed as specified.

## Issues Encountered

- The sandbox initially denied Playwright's localhost preview bind; the same release check passed outside the sandbox with the existing approved browser runtime libraries.
- Repository creation selected SSH, but no SSH key was available. The repository-specific origin was safely changed to HTTPS.
- The active `castlew640` OAuth token initially lacked `workflow` scope. The owner completed GitHub's device authorization, after which the token showed `repo` and `workflow` scopes and the push succeeded.

## Authentication Gates

- **Task 3:** GitHub device authorization added the required `workflow` scope to the active `castlew640` account. The gate completed successfully; no credentials were added to the repository.

## Known Stubs

No public stubs. `src/content/projects/verification-draft.md` is an intentional unpublished test sentinel; automated source and built-output checks prove that it has no route or serialized public output.

## User Setup Required

None. The repository, Pages Actions source, workflow, and HTTPS account site are configured. Subjective human visual checks are intentionally handled by the phase verification/UAT workflow.

## Next Phase Readiness

The static portfolio has a reliable public baseline for Phase 2's progressive 3D enhancement. Later work can add the one-handed exhibition while preserving the current semantic routes, accessibility journeys, and failed-release protection.

---
*Phase: 01-publishable-portfolio-and-delivery*
*Completed: 2026-09-19*

## Self-Check: PASSED

All five release-check/workflow artifacts and this summary exist; implementation, workflow, controlled-failure, and restoration commits are present in history; final local, CI, Pages API, root URL, and direct-route verification passed.
