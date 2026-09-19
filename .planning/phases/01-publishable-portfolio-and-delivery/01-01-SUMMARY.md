---
phase: 01-publishable-portfolio-and-delivery
plan: "01"
subsystem: ui
tags: [astro, typescript, playwright, static-html, accessibility]
requires: []
provides:
  - Reproducible Astro static build with the five owner-approved dependency pins
  - Confirmed profile and contact links in a responsive architectural catalogue
  - Browser contract proving no-JavaScript navigation, keyboard focus, and narrow reflow
affects: [01-02, 01-03, one-handed-surreal-exhibition]
tech-stack:
  added: [astro@7.3.3, typescript@6.0.3, "@astrojs/check@0.9.10", "@playwright/test@1.63.0", "@axe-core/playwright@4.13.0"]
  patterns: [semantic static HTML, strict TypeScript, built-artifact browser checks, confirmed profile data]
key-files:
  created: [package.json, package-lock.json, astro.config.ts, playwright.config.ts, tests/skeleton.spec.ts, tsconfig.json, src/data/profile.ts, src/layouts/BaseLayout.astro, src/pages/index.astro, src/styles/global.css, .gitignore]
  modified: []
key-decisions:
  - "Use the owner-approved email and GitHub profile immediately; keep the actual resume absent until selected."
  - "Use native HTML and a decorative inline SVG for the Phase 1 architectural composition; no client runtime or scene dependencies."
  - "Keep Astro preview in the foreground with --ignore-lock so Playwright owns its lifecycle."
patterns-established:
  - "Central profile data supplies metadata, visible identity, and public contact destinations."
  - "Build once and serve dist through Playwright; never run the browser contract against a development server."
  - "Visible native navigation and section targets preserve ordinary document flow without scripts."
requirements-completed: [PROF-01]
duration: 20 min
completed: 2026-09-19
status: complete
---

# Phase 1 Plan 1: Static Profile Walking Skeleton Summary

**A pinned Astro build renders William Castle’s confirmed profile and contact links in an ivory architectural catalogue, verified with JavaScript disabled and at narrow widths.**

## Performance

- **Duration:** 20 min (implementation continuation; earlier package review excluded)
- **Started:** 2026-09-19T20:55:15Z
- **Completed:** 2026-09-19T21:15:08Z
- **Tasks:** 3/3, including the previously satisfied package checkpoint
- **Files modified:** 11 implementation/configuration files

## Accomplishments

- Locked the five approved direct dependencies and Node `>=24 <25`; configured the account-site origin without a base prefix.
- Built the confirmed name, exact introduction, broad graduate background, public email, and GitHub link into initial HTML.
- Implemented the warm ivory/dark ink catalogue with expressive local typography, construction lines, a decorative architectural drawing, normal-flow sections, visible focus, and reduced-motion policy.
- Preserved a real RED-to-GREEN browser contract covering profile, no-JavaScript navigation, section order, keyboard skip/focus, and responsive reflow.

## Task Commits

1. **Task 1: Verify package identities** — prior audit checkpoint recorded in `0957566`; user explicitly approved all five pins before this continuation installed anything. No separate implementation commit was needed for the approval.
2. **Task 2: Scaffold and failing browser contract** — `3a256b8` (test).
3. **Task 3: Static profile catalogue** — `259f6b5` (feat).

## Verification

- RED: production scaffold build succeeded; all five browser tests failed with `PROFILE_NAV_CONTRACT_MISSING` on missing profile/navigation/skip-link content. Captured in `/tmp/phase-01-skeleton-red.log` before GREEN.
- GREEN: `npm run check` reported 0 errors, 0 warnings, 0 hints. `npm run build` produced the static home route. All five Playwright tests passed in 3.6 seconds.
- Responsive browser coverage: 320, 390, 768, and 1440 CSS pixels; 44px navigation heights; no horizontal document overflow; 200% root text with increased letter/word/paragraph spacing at 320px.
- Built-HTML assertions verified the name, exact introduction, graduate background, four section destinations, confirmed mailto/GitHub links, no script tags, and no invented example URLs.
- Direct-dependency/lockfile inspection verified all approved pins and absence of React/Three.js/Fiber; source contains no rendering-framework imports.
- Visually inspected full-page Chromium screenshots at `/tmp/phase01-desktop.png` (1440px) and `/tmp/phase01-mobile.png` (390px). No obvious overlap or clipping. These checks are not a claim of complete accessibility or physical-device conformance.

## Files Created/Modified

- `package.json`, `package-lock.json` — approved exact dependency graph, Node policy, check/build/preview/browser/combined scripts.
- `astro.config.ts`, `tsconfig.json` — account-site static output and strict Astro types.
- `playwright.config.ts`, `tests/skeleton.spec.ts` — browser-managed preview of `dist/` and five visitor contracts.
- `src/data/profile.ts` — confirmed identity/contact source and explicitly absent resume.
- `src/layouts/BaseLayout.astro` — metadata/canonical URL, skip link, semantic shell, four primary destinations.
- `src/pages/index.astro` — profile, decorative SVG, Projects/About/Resume/Contact sections.
- `src/styles/global.css` — visual tokens, responsive catalogue, typography, focus, reduced motion.
- `.gitignore` — generated dependencies/build/test output and local environment files.

## Decisions Made

Used the newly approved `castlew640@gmail.com` and `https://github.com/castlew640` immediately, superseding the plan’s earlier absent-contact assumption. Only the actual resume remains absent in profile data. No external publication occurred.

The architectural illustration is decorative inline SVG. All text and links remain normal HTML; there are no downloaded fonts, generated photos, canvas elements, or client scripts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Ignore generated and local-only files**
- **Found during:** Task 2.
- **Issue:** No ignore rules existed for dependency/build/browser output or local environment files.
- **Fix:** Added a minimal `.gitignore`; only intentional source/config files were staged.
- **Verification:** Final task status contains no untracked generated output.
- **Commit:** `3a256b8`.

**2. [Rule 3 - Blocking] Keep Astro 7 preview attached to Playwright**
- **Found during:** Task 2.
- **Issue:** Astro detects agent environments and backgrounds preview automatically, causing Playwright’s server process to exit early.
- **Fix:** Added documented `--ignore-lock` to the browser server command, stopped the task-created detached server, and retained `reuseExistingServer: false`.
- **Verification:** Genuine RED assertions and subsequent GREEN suite both ran against `dist/`.
- **Commit:** `3a256b8`.

**3. [Rule 3 - Blocking] Avoid unapproved Node type dependency**
- **Found during:** Task 3.
- **Issue:** Strict checking found `process.env.CI` in Playwright config lacked Node global types in this intentionally minimal dependency set.
- **Fix:** Set `forbidOnly: true` for every run, preserving focused-test protection without another package.
- **Verification:** `astro check` has zero diagnostics and the suite passes.
- **Commit:** `259f6b5`.

**Total deviations:** 3 auto-fixed. All support the planned build/check workflow; no architectural scope expansion.

## Issues Encountered

Sandbox restrictions required approved escalation for npm network/cache access, initial Astro configuration, local servers/browser processes, and git commits.

`npx playwright install --with-deps chromium` was attempted but system-library installation requires a sudo password unavailable to the agent. Chromium itself installed successfully. `ldd` identified missing NSPR/NSS/ALSA libraries. The configured official Ubuntu repositories supplied `libnspr4` (2:4.35-1.1build1), `libnss3` (2:3.98-1ubuntu0.2), and `libasound2t64` (1.2.11-1ubuntu0.3), extracted only under `/tmp/phase01-playwright-libs.epEDTC/root` without changing system packages. The actual test runs used:

```sh
LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu npm run test:e2e -- tests/skeleton.spec.ts
```

The temporary path is environment-specific and may disappear after the session. Normal CI should install Playwright system dependencies through the standard `--with-deps` path. No test was skipped or weakened.

## Known Stubs

These are intentional pending publication states required by this plan and resolved by Plan 01-02; neither prevents the PROF-01 walking-skeleton goal:

- `src/data/profile.ts:20` — `resumeUrl: null`; the actual public resume has not been selected or supplied. The Resume section gives an honest pending message and a real contact destination.
- `src/pages/index.astro:57` — Projects currently renders the case-study publication note; it does not invent an exhibit, screenshot, client claim, or project link. Plan 01-02 replaces it with validated published content after evidence is supplied.

## User Setup Required

No service setup is required for this completed profile slice. The next plan still needs the chosen actual resume and permitted screenshots/captions. During execution, the user supplied the client name `eiffeltechnologies LLC` and domain `eiffeltechnology.com`; the parent independently confirmed HTTPS 200 at `https://eiffeltechnology.com`. Those facts belong in Plan 01-02’s content source.

## Next Phase Readiness

Ready for Plan 01-02’s owner-evidence checkpoint and content implementation. PROF-01 is verified; the rest of Phase 1 is incomplete. No remote or public deployment was created. The parent rechecked that the selected GitHub repository is absent and local remotes remain empty.

---
*Phase: 01-publishable-portfolio-and-delivery*
*Completed: 2026-09-19*

## Self-Check: PASSED

All 11 implementation/configuration files and this summary exist. All three referenced commits exist. Required Task 2/3 acceptance checks passed, and RED precedes GREEN in git history.
