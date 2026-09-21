---
phase: 03-growth-and-release-polish
plan: "08"
subsystem: release-verification
tags: [github-pages, production-smoke, recovery, playwright]
requires:
  - phase: 03-growth-and-release-polish
    plan: "07"
    provides: Checked N=2/N=10 artifact, transfer and lifecycle evidence, pending physical targets
provides:
  - Repeatable exact-artifact live HTTPS smoke and concise owner runbooks
  - Observed known-good restoration and intended-content restoration through ordinary commits
  - SHA, run, artifact, deployment, live hash and timing record
affects: [release-verification]
key-files:
  created: [README.md, docs/RELEASE.md, scripts/production-smoke.mjs, tests/production-smoke.test.mjs, .planning/phases/03-growth-and-release-polish/03-RELEASE-EVIDENCE.md]
  modified: [package.json, docs/AUTHORING.md, src/content/projects/portfolio/index.md]
requirements-completed: [SHIP-03, SHIP-04]
requirements-pending: [PERF-01]
status: complete
metrics:
  completed: 2026-09-21
---

# Phase 3 Plan 8: Live release and recovery

The Pages site now has a checked, repeatable production smoke and an observed history-preserving recovery drill. The final public content includes the accurate portfolio sentence “The view switch preserves the current exhibit.” Physical performance and independent device/UAT review remain open.

## Task commits

1. Controlled smoke failures for stale or fallback HTML, missing routes, wrong asset/PDF bytes and broken destinations — `731ac99`.
2. Exact-artifact HTTP/browser smoke, package command and short authoring/release entry points — `6d01465`.
3. Reviewed sentence `d0e13a7`, ordinary revert `dfd2cd9`, and intended restoration `2407476`; each had a full passing local check and successful checked Pages run. The release record and this summary are documentation after the observed drill.

## Verification

- The smoke runner passed its six controlled tests. The release candidate's full `npm run check` passed 47 unit tests, six smoke tests, 90 production browser tests and isolated N=0/N=1/N=10/media/performance gates. The C, recovery and restored intended commits each passed the same full local gate and their CI build/deploy jobs.
- The known-good K, C, recovery R and intended release each passed live smoke against the **downloaded successful run's artifact**: 19 exact public file hashes, two direct project routes and returns, navigation, contact/resume destinations, no-JavaScript pages and phone still/opt-in journeys.
- R restored all 19 known-good live hashes and removed the sentence; the intended release restored all 19 C live hashes and the sentence. [03-RELEASE-EVIDENCE.md](03-RELEASE-EVIDENCE.md) records full SHAs, run/artifact/deployment IDs, UTC times, HTML hashes, retained artifact/report paths and elapsed restoration. Final report: `/tmp/phase03-production-smoke.json`.
- `docs/RELEASE.md` gives the owner the independent Windows Chrome and physical iPhone Safari visitor checklist and separate timing protocol. This automated Chromium journey is not a physical-device pass.

## Open acceptance

**PERF-01 remains `human_needed`.** The Windows Chrome displayed-frame trace and physical iPhone Safari rendering timeline were not collected. The owner has no Mac to run Safari Web Inspector, so iPhone frame percentiles are pending. The physical visitor checklist and Phase 01/02 UAT are also pending. SHIP-03/04 are supported by observed live evidence; no device acceptance is inferred from it.

## Self-check: PASSED

Plan artifacts, tests, release runbooks, checked deployments, exact-artifact smoke and recovery evidence exist. The intended public content is restored; remaining human checks are explicit.
