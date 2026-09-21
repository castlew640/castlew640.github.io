---
phase: 03-growth-and-release-polish
plan: "02"
subsystem: project-media
tags: [astro, threejs, video, webvtt, content-validation, playwright]
requires:
  - phase: 03-growth-and-release-polish
    plan: "01"
    provides: Flexible project schema and isolated growth runner
  - phase: 03-growth-and-release-polish
    plan: "03"
    provides: Route-mounted 4 by 2 metre panels and four-corner projection
provides:
  - Optional accessible native project-page video with optimized local poster and still-only gallery
  - Published-only MP4 and WebVTT filesystem containment and public-media whitelist
  - Shared uncropped evidence fit and bounded image output in HTML and WebGL
affects: [03-06-expanded-growth, 03-07-performance, 03-08-release, project-authoring]
tech-stack:
  added: []
  patterns: [published-media audit before Astro output, one DOM image and one GPU texture per exhibit, shared evidence fit]
key-files:
  created:
    - src/lib/project-media.ts
    - src/lib/evidence-fit.ts
    - tests/project-media.test.ts
    - tests/project-media.spec.ts
    - tests/evidence-fit.test.ts
    - tests/fixtures/projects/silent-demo.mp4
  modified:
    - src/content.config.ts
    - src/lib/project-schema.ts
    - src/lib/projects.ts
    - src/pages/projects/[...slug].astro
    - src/components/exhibition/ExhibitSection.astro
    - src/scripts/exhibition/scene/exhibit.ts
    - scripts/verify-built-content.mjs
    - docs/AUTHORING.md
key-decisions:
  - "Use local MP4 only on canonical project pages with native controls, preload none, an optimized local poster, description, download and captions when audio is meaningful."
  - "Audit every public/media file against paths owned by published entries before Astro copies public assets."
  - "Keep the existing pickable panel and its DOM image texture; shade contained letterbox regions in the panel material without a new GPU texture."
patterns-established:
  - "Terminal and diagram evidence always contains; other cover crops are capped at 10% per source dimension."
  - "Media tests generate artificial stills only in OS-temporary builds, while a checked-in, self-authored MP4 removes encoder dependence from CI."
requirements-addressed: [GROW-01, PERF-01]
requirements-completed: [GROW-01]
duration: 94min
completed: 2026-09-21
status: complete
---

# Phase 3 Plan 2: Honest Project Media Summary

**Optional page-only native video and publication-safe local media now complement fully readable still evidence in both the catalogue and route-mounted 3D panels.**

## Performance

- **Elapsed:** 94 min, including an executor interruption and resume
- **Started:** 2026-09-21T05:20:00Z
- **Completed:** 2026-09-21T06:54:18Z
- **Tasks:** 3/3
- **Files created/modified:** 20

## Accomplishments

- Added optional video with an Astro-resolved local poster, visible description, native keyboard/pointer controls, `playsinline`, `preload="none"`, download link and WebVTT captions for meaningful audio. The home page and WebGL scene continue to use a still image only.
- Enforced slug-owned, existing, regular MP4/VTT files no larger than 25,000,000 bytes; rejected traversal, encoded paths, symlinks, missing files, malformed/empty media and any public media not referenced by a published entry. The built-artifact verifier independently checks that no orphan or fixture media escaped.
- Optimized stills to at most 1600 px on the long edge. Terminal and diagram images are always contained; cover is allowed only under a 10% per-dimension crop ceiling. WebGL uses the same decoded DOM image as its sole texture, with stone-lit letterboxing inside the unchanged pickable panel.
- Documented the exact authoring paths, caption/description contract, draft-media boundary, budget, and real-browser verification responsibility.

## Task Commits

1. **Task 1: Failing media journeys and containment contract** — `8d4d7ee` (`test`).
2. **Task 2: Accessible video and public-media boundary** — `78e95b1` (`feat`).
3. **Task 3 RED: Uncropped fit math** — `fd9eb0a` (`test`).
4. **Task 3 GREEN: Shared still and panel fit, verifier, authoring** — `41ad845` (`feat`).
5. **Schema correctness follow-up** — `30a7a92` (`fix`).

## Verification

- `node scripts/check-project-growth.mjs --count 10 --suite media` — 3/3 isolated Chromium browser checks passed; the self-authored 256×144, approximately 0.93-second H.264/MP4 decoded before the temporary build. Fixture SHA-256 and regeneration method are recorded in `tests/fixtures/projects/entries.mjs` and `create-media-fixture.mjs`.
- `node --experimental-strip-types --test tests/evidence-fit.test.ts tests/project-media.test.ts` — passed fit and media-boundary tests.
- `npm run check` — Astro check, production build, built-content and scene-budget guards, inherited unit tests, and 69/69 browser tests passed. Production contains the featured-client route, its three approved evidence figures, and no portfolio video or fixture media.
- Scene gzip: 158,598/190,000 bytes. First exhibit preview: 37,132/180,000 bytes at 1600×780. No limit was raised.
- Test runner confirmed unchanged checkout content and `dist` hashes before/after the artificial catalogue build.

Chromium fixture decoding and activation are browser-fixture evidence only. They do **not** establish playback or performance on a physical iPhone Safari or representative Windows Chrome device. No owner video was supplied or published. PERF-01 remains pending its separately required physical-device and frame-time evidence; this plan contributes the image/scene budget and media behavior but does not complete that milestone requirement.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Resolve public media from the build checkout, not the bundled module location.**
- **Found during:** Task 2 isolated Astro build.
- **Issue:** `import.meta.url` referred to Astro's prerender chunk inside `dist`, causing a valid temporary MP4 to appear missing.
- **Fix:** Resolve `public/` from the build working directory before the publication audit.
- **Files modified:** `src/lib/projects.ts`
- **Verification:** Isolated media build and production build passed.
- **Committed in:** `78e95b1`

**2. [Rule 1 - Bug] Use Astro's optimized poster URL and a real native keyboard activation.**
- **Found during:** Task 2 browser journey.
- **Issue:** The raw poster URL did not meet the optimized-still contract, and a fixed-coordinate native-control click missed at responsive dimensions.
- **Fix:** Generate the poster through `getImage`; exercise the native player's focused Space control in Chromium.
- **Files modified:** `src/pages/projects/[...slug].astro`, `tests/project-media.spec.ts`
- **Verification:** Native video journey passed in the isolated browser suite.
- **Committed in:** `78e95b1`

**3. [Rule 2 - Missing Critical] Require a poster in the exported video contract.**
- **Found during:** Pre-summary schema review.
- **Issue:** The collection's `image()` rejected a missing poster, but the reusable base schema accepted one.
- **Fix:** Reject absent/null poster metadata in the base schema and add a regression case.
- **Files modified:** `src/lib/project-schema.ts`, `tests/project-media.test.ts`
- **Verification:** Focused media tests and Astro check passed.
- **Committed in:** `30a7a92`

**Total deviations:** 3 auto-fixed (2 bugs, 1 missing critical validation). **Impact:** Correctness and test reliability only; no package or infrastructure change.

## Issues Encountered

- The installed Chromium can record the declared H.264/MP4 fixture, but local browser runs require the previously provisioned temporary Ubuntu libraries and localhost sandbox approval. No dependency was installed and no encoder is needed in CI.
- The plan lists PERF-01 among its addressed requirements. Project accuracy constraints and the requirement text prevent marking it complete without physical target evidence; it remains pending in `REQUIREMENTS.md`.
- Concurrent Phase 1, Phase 4, STATE and ROADMAP edits were preserved, not included in task commits.

## Known Stubs

None in shipped UI. Example video paths in `docs/AUTHORING.md` are instructional and never loaded as project content. Empty renderer collections and nullable lifecycle resources are not rendered placeholders.

## Threat Surface

No unplanned endpoint or trust boundary was introduced. The new local public-media surface is covered by the plan's T-03-04 through T-03-06 mitigations and by the independent built-artifact whitelist.

## Next Phase Readiness

- Plans 03-06 and 03-07 can test expanded catalogues and target-device performance with stable media URLs, bounded stills, and one texture per exhibit.
- No real personal project or video is a prerequisite. Physical-browser/UAT evidence remains pending and must not be inferred from emulation.

## Self-Check: PASSED

- All 20 task-owned source, test, fixture, and documentation files exist.
- Commits `8d4d7ee`, `78e95b1`, `fd9eb0a`, `41ad845`, and `30a7a92` exist in Git history.
- The focused media suite, production build, built-content guard, budget check, and inherited browser suite passed; no blocking stub remains.
