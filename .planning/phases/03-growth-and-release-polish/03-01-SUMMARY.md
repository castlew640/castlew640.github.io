---
phase: 03-growth-and-release-polish
plan: "01"
subsystem: content
tags: [astro, content-collections, playwright, authoring, validation]
requires:
  - phase: 02-one-handed-surreal-exhibition
    provides: Shared published-project gateway, canonical routes, exhibits, and stable return anchors
provides:
  - Discriminated client and personal project publication contracts
  - Content-only canonical page, catalogue, and exhibit generation for personal projects
  - Isolated N=0/1/10 growth fixtures with production content and artifact hash protection
  - Copyable unpublished starter and concise project-authoring guide
affects: [03-02-project-media, 03-05-portfolio-case-study, 03-06-expanded-growth, 03-07-check-wiring]
tech-stack:
  added: []
  patterns: [discriminated content schemas, published-only uniqueness validation, OS-temporary fixture builds, repository-only project presentation]
key-files:
  created:
    - scripts/check-project-growth.mjs
    - playwright.growth.config.ts
    - tests/fixtures/projects/entries.mjs
    - tests/project-growth.spec.ts
    - docs/project-starter/index.md
    - docs/AUTHORING.md
  modified:
    - src/content.config.ts
    - src/lib/project-schema.ts
    - src/lib/project-validation.ts
    - src/pages/projects/[...slug].astro
    - src/components/exhibition/ExhibitSection.astro
    - tests/project-validation.test.ts
key-decisions:
  - "Keep the existing client entry backward compatible by defaulting omitted kind to client and format to case-study."
  - "Require published personal projects to provide described local still evidence, while allowing repository-only projects without an invented hosted demo."
  - "Exercise artificial catalogues only in OS temporary copies linked to installed dependencies, with production content and dist hashes checked before and after."
patterns-established:
  - "All supplied project links use reusable HTTPS validation, including draft links."
  - "Published slugs and exhibition orders are unique; personal formats change narrative depth without bespoke route or exhibit code."
requirements-completed: [GROW-01, GROW-04]
duration: 12min
completed: 2026-09-21
status: complete
---

# Phase 3 Plan 1: Flexible project publishing and isolated growth proof

**Discriminated Astro content now publishes honest personal projects through the canonical page, catalogue, and exhibit path, backed by isolated N=0/1/10 browser fixtures and a copyable authoring starter.**

## Performance

- **Duration:** 12 minutes
- **Started:** 2026-09-21T04:10:25Z
- **Completed:** 2026-09-21T04:21:54Z
- **Tasks:** 3
- **Files created/modified:** 12, excluding summary and progress metadata

## Accomplishments

- Added client and personal branches to the one Astro collection. Existing client frontmatter remains valid without edits; personal projects support case-study, showcase, or deep-dive narratives plus optional HTTPS repository/demo links.
- Updated canonical project pages and exhibits to use the same validated entry, branch presentation without empty controls, expose evidence kind/fit hooks for 03-02, and preserve exact `Read case study →` links and stable return anchors.
- Added an isolated growth runner that copies the checkout into fresh OS temporary roots, links existing installed dependencies without installing anything, builds/previews only the copy on port 4322, and verifies that real content and `dist` hashes never change.
- Added an unpublished starter and concise owner workflow covering real evidence, stable slugs, append-only order, narrative depth, checks, review, commit, push, and the future `docs/RELEASE.md` handoff.

## Task Commits

1. **Task 1: Failing isolated personal-project browser contract** — `347dd0a` (`test`).
2. **Task 2: Flexible collection and both visitor surfaces** — `04ffd9e` (`feat`).
3. **Task 3: Validation coverage and repeatable authoring** — `2fb31af` (`docs`).

## TDD Gate Compliance

- **RED:** `347dd0a` captured the expected client-only schema failure for `fixture-personal-01`; the failure reached Astro content validation rather than failing on imports, binaries, or preview setup.
- **GREEN:** `04ffd9e` generalized the schema and renderers; the same N=10 and personal-only journeys passed.
- **REFACTOR:** No separate refactor commit was needed.

## Validation

- `node scripts/check-project-growth.mjs --count 0 --suite growth` — passed the empty and personal-only isolated builds and 4 total browser checks.
- `node scripts/check-project-growth.mjs --count 1 --suite growth` — passed the real-client-only and personal-only isolated builds and 4 total browser checks.
- `node scripts/check-project-growth.mjs --count 10 --suite growth` — passed the expanded client-plus-nine-personal and personal-only builds and 4 total browser checks.
- Every isolated run reported absolute temporary root/output paths and identical before/after hashes for `src/content` and the production `dist`.
- `node --experimental-strip-types --test tests/project-validation.test.ts` — 7/7 tests passed.
- `npm run build` — production built only `/` and `/projects/featured-client/`.
- `node scripts/verify-built-content.mjs` — passed with 11 files and all three required routes/assets; no draft, fixture, or starter entry shipped.
- `npm exec -- astro check` — 0 errors; only the pre-existing Three.js deprecation hints plus a Zod method deprecation hint were reported.

Local Playwright used the already-provisioned temporary Ubuntu runtime libraries through `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu`. No package was installed or substituted.

## Publication Guarantees

- Client projects retain an HTTPS live URL, approved screenshots, and exactly one website, manual-planner, and AI-MVP contract.
- Published personal projects require at least one still with nonblank alt text and caption, but may publish with a repository link and no live demo.
- Every supplied live or repository URL is valid HTTPS, including links on drafts.
- Published slugs and nonnegative integer exhibition orders are unique; drafts do not reserve public slugs.
- Templates and fixture sources remain outside `src/content/projects` and `public`; only validated published entries reach routes, lists, and exhibit metadata.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Offset generated personal-project orders after the retained client.**
- **Found during:** Task 2 GREEN verification
- **Issue:** The first personal fixture initially reused the featured client's `exhibitionOrder: 1`, so the new uniqueness guard correctly stopped the expanded build.
- **Fix:** Personal fixtures in mixed catalogues now start after the client while personal-only fixtures retain order 1.
- **Files modified:** `tests/fixtures/projects/entries.mjs`
- **Verification:** N=0/1/10 and personal-only fixture builds all passed.
- **Commit:** `04ffd9e`

**Total deviations:** 1 auto-fixed bug. **Impact:** The correction makes the fixture represent the append-only publishing contract; production content was unchanged.

## Issues Encountered

- Sandbox networking denied the temporary preview bind, and the system Chromium lacked global `libnspr4.so`. Verification ran with approved localhost access and the existing Phase 1 temporary browser-library path. This was an execution-environment constraint, not a product or package failure.

## Known Stubs

The starter intentionally contains conspicuous instructional replacement values under `docs/project-starter/`. It is outside the content loader and public tree, defaults to `published: false`, and is authoring material rather than a rendered or serialized product stub. No production stub remains.

## Threat Flags

None. The new authored-content, link, and fixture-copy surfaces are the exact trust boundaries covered by T-03-01 through T-03-03; validation, Astro escaping, temporary roots, published-only filtering, and hash checks implement the planned mitigations.

## Next Phase Readiness

- Plan 03-02 can consume `evidence.kind`, `evidence.fit`, and the exposed DOM data attributes to add contained evidence rendering and optional page-only video.
- Plan 03-07 still owns aggregate `package.json` check wiring, so this plan did not modify the shared check command.
- No actual personal project was fabricated or published; the production catalogue still contains only the approved featured client.

## Self-Check: PASSED

- All 12 plan-owned source, test, fixture, and documentation files exist.
- Task commits `347dd0a`, `04ffd9e`, and `2fb31af` exist in Git history.
- Every task acceptance criterion and the plan-level N=0/1/10, production-build, and built-content commands passed.
- No blocking stub or unplanned security surface remains.
