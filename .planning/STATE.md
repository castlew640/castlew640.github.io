---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 03
current_phase_name: growth-and-release-polish
status: executing
stopped_at: Completed 03-08-PLAN.md; physical acceptance pending
last_updated: "2026-09-24T09:30:00.000Z"
last_activity: 2026-09-24
last_activity_desc: Quick task 260924-3fy rebuilt the exhibition as a clickable Dalí dreamscape on branch quick/260924-3fy-surreal-overhaul; owner review before merge
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 19
  completed_plans: 19
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-19)

**Core value:** Help employers understand real software delivery through a memorable, one-handed portfolio.
**Current focus:** Phase 03 — growth-and-release-polish

## Current Position

Phase: 03 (growth-and-release-polish) — AWAITING HUMAN VERIFICATION
Plan: 8 of 8
Status: All plans executed; final acceptance pending
Last activity: 2026-09-24 - Completed quick task 260924-3fy: Surreal exhibition overhaul (click-to-travel, in-place exhibit viewer, melting clocks and Dalí details); awaiting owner review on branch `quick/260924-3fy-surreal-overhaul`

**Progress:** [██████████] 100%

Next action: collect the three pending checks in `.planning/phases/03-growth-and-release-polish/03-UAT.md`; use `$gsd-verify-work 3` when results are available. All eight Phase 03 plans have summaries. Five of six Phase 03 requirements have evidence; PERF-01 is still open.

Outstanding from Phase 02: all eight implementation plans and automated checks (33 unit and 69 browser tests) passed, but the four checks in `.planning/phases/02-one-handed-surreal-exhibition/02-UAT.md` remain pending: composition/reflections, Windows Chrome input/real zoom, actual iPhone Safari, and landing clearance. Phase 03 explicitly revises the route, phone defaults and copy; its plans preserve the remaining acceptance obligations without inventing previous results. Phase 02 remains open.

Phase 03 live production smoke and observed ordinary-revert recovery passed on 2026-09-21. [Release evidence](phases/03-growth-and-release-polish/03-RELEASE-EVIDENCE.md) records four successful Pages runs and exact live hashes; the intended content is restored at `2407476`. Actual Windows/iPhone performance evidence and independent device checks remain `human_needed`. The owner has no Mac for the iPhone Safari rendering timeline.

Deployment for UAT: on 2026-09-21 the owner authorized pushing Phase 02. Commit `0f0507e0101ab68072002049c3cc9089072847f1` deployed successfully through [Pages run 35552310047](https://github.com/castlew640/castlew640.github.io/actions/runs/35552310047). The CI build passed all 33 unit and 69 browser tests, including real WebGL scene contracts. `https://castlew640.github.io/` returned HTTP 200 and its HTML exactly matched the tested local build. Test the exhibition at that URL; human results remain pending.

Outstanding from Phase 01: verification status is `human_needed` and 01-UAT.md is still `testing` — the subjective live visual/keyboard passes have not been signed off. Phase 1 is not closed.

## Performance Metrics

- Total plans completed: 19
- Average duration: 47 min
- Total recorded execution time: 654 min (including waits and review)

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 20 min | 3 tasks | 11 files |
| Phase 01 P02 | 35 | 3 tasks | 11 files |
| Phase 01 P03 | 20 min | 3 tasks | 8 files |
| Phase 02 P01 | 20 min | 3 tasks | 5 files |
| Phase 02 P02 | 11 min | 3 tasks | 9 files |
| Phase 02 P03 | 9 min | 2 tasks | 6 files |
| Phase 02 P04 | 10 min | 3 tasks | 11 files |
| Phase 02 P05 | 13 min | 3 tasks | 10 files |
| Phase 02 P06 | 33 min | 3 tasks | 8 files |
| Phase 02 P07 | 17 min | 3 tasks | 7 files |
| Phase 02 P08 | 330 min | 3 tasks | 11 files |
| Phase 03 P01 | 12min | 3 tasks | 12 files |
| Phase 03 P03 | 30min | 3 tasks | 13 files |
| Phase 03 P02 | 94 min | 3 tasks | 20 files |
| Phase 03 P04 | approximately 2 sessions | 3 tasks | 6 files |
| Phase 03 P05 | approximately 1 session | 3 tasks | 13 files |
| Phase 03 P06 | approximately 1 session | 3 tasks | 12 files |
| Phase 03 P07 | 50min | 3 tasks | 17 files |
| Phase 03 P08 | multiple sessions | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md.

- Autonomous routine work; three broad MVP phases; independent parallel agents; inherit session model; research/review/verification enabled.
- Astro/static content plus a React Three Fiber/Three.js WebGL2 scene is the planning baseline; exact compatible versions are checked during setup.
- Native scroll drives the corridor; real tap controls and canonical HTML project routes preserve one-handed operation and direct access.
- Release credible readable content early; the initial milestone still includes the finished surreal experience.
- One client case study covers three contracts; personal exhibits appear as real projects are completed.
- [Phase 01]: Phase 1 decisions are captured in .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md. Bespoke ivory exhibition catalogue; plans becoming places express time through things taking shape; introduction integrated into the architectural composition.
- [Phase 01]: William Castle is the sole developer across three paid client contracts. Supabase/Vercel served the website and manual planner; AWS Lightsail served the AI MVP. Emphasize understanding client goals and practical delivery judgment.
- [Phase 01]: Public name/introduction and email-first contact are selected. Plan public castlew640/castlew640.github.io with GitHub Pages/Actions at https://castlew640.github.io. Resume review is deferred; availability and actual publication inputs remain to be checked.
- [Phase 01 execution]: Owner approved castlew640@gmail.com as the public email and the selected uploading account, https://github.com/castlew640, as the public GitHub profile. No LinkedIn destination was supplied.
- [Phase 01 execution]: Runtime configuration corrected to Codex with workflow.use_worktrees=false; dependent plans execute sequentially in the shared checkout.
- [Phase 01]: Plan 01-01 completed: approved pins installed; static profile and confirmed email/GitHub pass five browser contracts without JavaScript, with keyboard focus and 320px reflow. Resume and client screenshots remain pending.
- [Phase 01]: Owner confirmed public client name eiffeltechnologies LLC and https://eiffeltechnology.com; parent verified HTTP 200 over HTTPS. Use these in Plan 01-02.
- [Phase 01]: Publish approved resume, screenshots, confirmed Eiffel Technologies URL, and profile destinations; omit unconfirmed dates and metrics. — Owner supplied and approved finite public evidence.
- [Phase 01]: Deploy only the checked dist artifact; the least-privilege deploy job never rebuilds source. — Successful checks must promote the exact tested files.
- [Phase 01]: Use the actual master default branch and GitHub Pages workflow publishing at the account-site root. — The new repository adopted the existing local branch and account-site naming needs no base path.
- [Phase 01]: Preserve release history with an approved controlled failure followed by a normal git revert; never force-push. — Recorded evidence proves failed checks cannot replace the live site without rewriting history.
- [Phase 02]: Plan 02-01: three@0.186.0 + @types/three@0.186.0 installed at exact pins (developer-approved via package-legitimacy gate); no React/R3F. scripts/verify-scene-boundary.mjs wired into npm run check. — Measured React+R3F bundle (308,170 B gzipped) exceeds the UI-SPEC 190 KB budget by 62%; vanilla-three (151,848 B gzipped) fits with headroom
- [Phase 02]: 02-UI-SPEC.md reconciled with the shipping stack (11 corrections); 02-RESEARCH.md's six Open Questions marked RESOLVED with per-question resolution notes. — 02-UI-SPEC.md is the artifact Success Criterion 1 is checked against; every later Phase 2 plan reads it as the spec
- [Phase 02]: Plan 02-02 labels the landing with resume-title and contact-title so its accessible name differs from the nested Contact region. — The prescribed duplicate Contact landmark failed axe; the combined label preserves both headings and passes the full deployment gate.
- [Phase 02]: Plan 02-03 shares local SVG defs/use geometry between unfinished architecture and completed reflections, with per-exhibit IDs scoped by index. — Preserves the reflection concept without runtime code, duplicate path sets or document ID collisions.
- [Phase 02]: Plan 02-04 disables asset inlining to emit the required hashed controller; explicit motion choices also persist in memory when storage is blocked. — The controller precedes the renderer import, and policy must remain correct even under storage failures.
- [Phase 02]: Plan 02-05 keeps travel controls in one stable DOM position, delegates validated taps to canonical anchors, and recognizes native fractional-pixel stop arrivals. — Preserves one-handed focus and history; isolated pointer regressions prove tap gates before the real renderer arrives.
- [Phase 02]: Plan 02-06 uses a shared warm stone bounce term with the exact light rig, layout-preserving active text plates, and a counts-only demand-rendering lifecycle. — Visual review exposed dark physical shading and asynchronous layout changes; the final gate proves recovery, idle suspension, native restoration, resource cleanup, and lazy loading.
- [Phase 02]: Plan 02-07 uses a title/CTA-first mobile sheet with complete readable text continuing in native document flow; the impossible 52svh content cap becomes a minimum height while preserving the full plate and104px bottom padding.
- [Phase 03]: Default omitted project kind to client and format to case-study. — The approved client entry remains backward compatible while personal projects opt into their own branch.
- [Phase 03]: Require described local still evidence for personal projects while allowing repository-only publication. — Non-hosted tools can publish honest evidence without inventing a demo or client contracts.
- [Phase 03]: Run artificial growth catalogues only in OS temporary checkout copies guarded by content and dist hashes. — Fixtures prove N=0/1/10 behavior without becoming public accomplishments or deployable artifacts.
- [Phase 03]: Plan 03-03 keeps signed stop.z values as native-scroll scalars and converts once to positive scene station. — Preserves existing stop/layout contracts while isolating Three.js world geometry.
- [Phase 03]: Plan 03-03 uses fixed 12m-line plus 6m-cubic segments so appended work cannot move earlier route frames. — Fixed piecewise anchors preserve GROW-04 append invariance.
- [Phase 03]: Plan 03-03 selects panels by stable DOM stop ID and projects all four transformed corners. — Navigation identity and visual bounds stay correct on the winding route.
- [Phase 03]: Use optional local MP4 only on canonical pages with native controls, optimized poster, visible description, download and captions for meaningful audio — Preserves a still-only one-handed exhibition while making real demonstrations accessible without a player package
- [Phase 03]: Audit every public/media file against slug-owned published project references before Astro output — Static public files otherwise bypass draft filtering and can leak orphan or draft-only assets
- [Phase 03]: Use one decoded DOM image and one GPU texture for contained route-mounted evidence panels — Stone letterboxing preserves every source corner without altering picking geometry or scene resource budgets

- [Quick 260924-3fy]: The exhibition is a golden-hour Dalí plain with clickable exhibits (walk there, then open an in-place viewer), reactive props, fixed placards and a shared travel/view dock. Browsers that draw WebGL in software now default to the illustrated view (explicit choice › reduced motion › phone › software graphics); ambient animation runs only on hardware that keeps up and rests when hidden, offscreen, under the viewer or idle. Supersedes the Phase 2/3 corridor, reflection and on-demand-only rendering decisions; D-15 and D-22 are kept.

### Pending Todos

Phase 02 execution is complete; the four acceptance checks are tracked in `02-UAT.md`, not implementation todos. Scene gzip is 157,185 B / 190,000 B. The original three-texture estimate is exceeded by five actual allocations; four are attributed, one remains unidentified. This and the native-flow mobile sheet are disclosed for human acceptance. Review and goal verification used explicitly documented reused-agent fallbacks.

None yet.

### Blockers/Concerns

Remaining publication inputs and environment notes:

- Plan 01-01 Task 1 approval honored: user replied "approved" to astro@7.3.3, @playwright/test@1.63.0, typescript@6.0.3, @astrojs/check@0.9.10, and @axe-core/playwright@4.13.0. All pins are installed and locked; Node 24.14.1/npm 11.11.0 build/check/browser compatibility verified.
- Local Chromium requires temporary official Ubuntu libraries through `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu`; see 01-01-SUMMARY.md. CI should use the standard Playwright `--with-deps` installer.

- Phase 2 visual contract and representative device/budget choices; physical-device evidence is required before claiming final performance verification.
- Tooling note: GSD health reports no project errors but flags 15 missing optional global agent definitions. The core research agents ran successfully; workflows requiring missing types need an available fallback or a separate installation update.
- Publication inputs now supplied: PDF resume `/mnt/c/Users/castl/Downloads/William_Castle_Resume.pdf`; LinkedIn `https://linkedin.com/in/will-castle-swefh`; Indeed `https://profile.indeed.com/?hl=en_US&co=US&from=gnav-homepage--homepage-frontend`; approved screenshots `clientScreenshot1.jpg`, `clientscreenshot2.jpg`, `clientScreenshot3.jpg` from `/mnt/c/Users/castl/Downloads/`. Profile/contact, client name `eiffeltechnologies LLC`, and `https://eiffeltechnology.com` are confirmed; parent verified HTTPS 200. Dates and metrics remain omitted.
- Case-study facts for public copy: dates, blueprint extension, exact MVP scenarios, and any outcome claims; omit unresolved details. Deployment split and sole-developer role are confirmed.
- Delivery is live at `https://castlew640.github.io/`; the public source repository is `https://github.com/castlew640/castlew640.github.io`. Initial and restored runs succeeded, while controlled run `35472453422` failed with no artifact or deployment and left the prior release available.
- Subjective desktop/mobile appearance, zoom, and reduced-motion review remains for the Phase 1 verification/UAT gate; automated equivalents pass.
- Wave 1 post-wave verification: static build and 5/5 Chromium tests pass. Schema drift gate does not block; codebase drift check skips because no STRUCTURE.md exists. Upcoming Plan 01-02 links to new collection/project/resume files remain intentionally pending; existing profile and navigation links verify.

### Quick Tasks Completed

| # | Description | Date | Commit | Status | Directory |
|---|-------------|------|--------|--------|-----------|
| 260924-3fy | Surreal exhibition overhaul: click-to-travel, in-place exhibit viewer, melting clocks and Dalí details | 2026-09-24 | 5e988cf | Checks pass; owner review and device checks pending | [260924-3fy-surreal-exhibition-overhaul-click-to-tra](./quick/260924-3fy-surreal-exhibition-overhaul-click-to-tra/) |
| 260924-igc | Prune old Pages deployments, workflow runs and artifacts after each deploy | 2026-09-24 | 3262fdd | Verified on run 36033430777 | [260924-igc-prune-old-pages-deployments-workflow-run](./quick/260924-igc-prune-old-pages-deployments-workflow-run/) |

### Roadmap Evolution

- Phase 1 edited: edited fields: goal (MVP user-story format; meaning preserved)
- Phase 4 added: Personality and Media

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Experience | In-place project dialogs, optional extra rooms, development journal | Optional v2 | Initialization |
| Content | ChudCode and other future personal projects | Add when status/evidence is confirmed | Initialization |

## Session Continuity

Last session: 2026-09-21T19:53:54.676Z
Stopped at: Completed 03-08-PLAN.md; physical acceptance pending
Resume file: None
