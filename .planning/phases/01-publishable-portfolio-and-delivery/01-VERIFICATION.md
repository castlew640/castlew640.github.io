---
phase: 01-publishable-portfolio-and-delivery
verified: 2026-09-19T22:38:25Z
status: human_needed
score: 8/9 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Open the public home page and case study in a desktop browser and a narrow mobile viewport."
    expected: "The warm-ivory catalogue, construction-line motif, and plans-becoming-places progression look deliberate, while text and controls remain readable and unobscured."
    why_human: "Visual quality and whether the design feels deliberate are subjective and cannot be established by DOM, CSS, or screenshot-bound checks alone."
  - test: "Use only Tab, Shift+Tab, and Enter from the skip link through primary navigation, the case study, external evidence, resume/contact actions, and return navigation."
    expected: "Focus follows a logical order, remains clearly visible and unobscured, and every destination can be activated without a focus trap."
    why_human: "Automated focus tests cover representative controls, but an end-to-end real-browser keyboard review is required by the deferred plan checkpoint."
  - test: "View both public routes at 200% and 400% browser zoom, including a 320 CSS-pixel viewport."
    expected: "Text reflows without overlap, clipping, hidden controls, or two-dimensional page scrolling; evidence images stay within their figures and viewport."
    why_human: "CI tests 320-pixel reflow and enlarged text, but actual browser zoom behavior and legibility still require human observation."
  - test: "Disable JavaScript and complete home to case study to resume/contact and back-to-projects navigation."
    expected: "Profile, three-contract case study, screenshots, resume, email, profile links, and return navigation remain available."
    why_human: "CI exercises JavaScript-disabled routes, but the published cross-destination journey is an explicit end-of-phase manual checkpoint."
  - test: "Enable the operating-system reduced-motion preference and repeat the home, project, return, resume, and contact journey."
    expected: "All content and actions remain available with no nonessential motion or smooth scrolling."
    why_human: "Computed-style checks pass in CI, but perceived motion and full published-route usability require human confirmation."
  - test: "Open the resume, email action, supplied profile links, and Eiffel Technologies live link from the public site."
    expected: "The resume opens, the email action targets castlew640@gmail.com, supplied profiles use the approved destinations, and the client link is additive to a complete local case study."
    why_human: "External application and third-party destination behavior depends on the user's browser and installed handlers."
  - test: "Inspect failed workflow run 35472453422 beside the surrounding successful releases."
    expected: "The build failed, artifact upload and deploy were skipped, no deployment exists for the failed SHA, and the earlier public release remained available."
    why_human: "The APIs verify this mechanically, but the plan explicitly defers a human confirmation of the release-safety proof."
---

# Phase 1: Publishable Portfolio and Delivery Verification Report

**Phase Goal:** As a prospective employer, I want to use a public portfolio to understand William Castle's work and reach his resume and contact details, so that I can assess his ability and contact him while checked updates publish reliably.
**Verified:** 2026-09-19T22:38:25Z
**Status:** human_needed
**Re-verification:** No — initial verification after the approved format-only MVP goal correction

## User Flow Coverage

User story: “As a prospective employer, I want to use a public portfolio to understand William Castle's work and reach his resume and contact details, so that I can assess his ability and contact him while checked updates publish reliably.”

| Step | Expected | Evidence | Status |
| --- | --- | --- | --- |
| Open the portfolio | The public account-site root loads and identifies William Castle | Live root returns HTTP 200; `src/pages/index.astro:10-15`; final deployment `6546449451` is successful | ✓ VERIFIED |
| Understand the work | A visitor can open a complete client story with three distinct engagements and evidence | Live project route returns HTTP 200; `src/pages/projects/[...slug].astro:19-54`; live HTML contains all three contract titles and three figures/captions | ✓ VERIFIED |
| Reach resume and contact | Resume, email, GitHub, LinkedIn, and Indeed are ordinary initial-HTML links | `src/data/profile.ts:17-23`; `src/pages/index.astro:83-98`; live resume returns HTTP 200 | ✓ VERIFIED |
| Assess ability and contact William | The evidence and actions are present, but whether the presentation communicates ability clearly is a human judgment | Complete local narrative and tested actions exist; see Human Verification items 1 and 6 | ? HUMAN |
| Receive reliable checked updates | Successful updates deploy the checked artifact; failed checks cannot replace it | Runs `35472362500`, `35472453422`, `35472513054`, and final run `35473534794`; workflow wiring at `.github/workflows/pages.yml:13-50` | ✓ VERIFIED |

## Goal Achievement

### Observable Truths

The five roadmap success criteria were merged with plan-level must-haves. Clear restatements were deduplicated; four additional plan-specific contracts remain, producing nine observable truths.

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Visitors can read the confirmed introduction, open the real resume, and use contact links on desktop/mobile with keyboard focus and reflow intact. | ✓ VERIFIED | Profile and actions are ordinary HTML (`src/data/profile.ts:11-23`, `src/pages/index.astro:10-15,75-98`); CI run `35473534794` passed the 320px, enlarged-text, keyboard/focus, no-JS, and axe journeys. |
| 2 | Visitors can directly open and refresh a canonical case-study URL containing three accurately distinguished contracts, approved screenshots, and the confirmed live link without JavaScript. | ✓ VERIFIED | Static route generation and content rendering are wired at `src/pages/projects/[...slug].astro:6-56`; live route is HTTP 200 and contains three contract titles, three figures/captions, canonical metadata, and the Eiffel URL. |
| 3 | One validated content collection rejects invalid metadata, duplicate IDs/slugs, and missing assets, while drafts remain absent from routes, lists, and serialized output. | ✓ VERIFIED | `src/content.config.ts:6-17`, `src/lib/project-validation.ts:23-46`, and `src/lib/projects.ts:4-9`; final CI passed 5/5 validation tests and built-output checks. `verification-draft` is absent from `dist/`. |
| 4 | A successful default-branch update publishes the exact checked artifact, while a failed check prevents publication and preserves the prior release. | ✓ VERIFIED | Workflow build uploads `dist` only after `npm run check`, deploy needs build and never rebuilds (`pages.yml:13-50`). Failure run `35472453422` has failed build, skipped upload/deploy, zero artifacts, and zero deployments; restored and final runs succeeded. |
| 5 | The early site has a deliberate readable visual identity and verified owner-supplied content, with publication inputs and hosting resolved. | ? HUMAN | Owner-approved content, assets, public repository, Pages configuration, and visual implementation exist. Whether the composition feels deliberate and remains visually strong on real desktop/mobile displays is subjective; see Human Verification item 1. |
| 6 | The reproducible dependency set is limited to the approved Phase 1 Astro/checking stack with exact direct pins and a lockfile. | ✓ VERIFIED | `package.json:17-24` contains only Astro plus approved checking/test dependencies at exact versions; no React/Three/canvas dependency or source import exists; `package-lock.json` is committed. |
| 7 | Home and case-study routes share one published-project query boundary. | ✓ VERIFIED | `getCollection('projects')` appears only in `src/lib/projects.ts:5`; home calls `getPublishedProjects()` at `src/pages/index.astro:4-6`, and route generation calls it at `src/pages/projects/[...slug].astro:4-10`. |
| 8 | Reduced-motion visitors retain the complete readable journey with nonessential CSS motion disabled. | ✓ VERIFIED | Reduced-motion CSS is global; the named CI test at `tests/portfolio.spec.ts:96-115` exercises home → project → return and asserts auto scroll/no animation/no transition. |
| 9 | Pull requests and default-branch pushes run content/type/build/artifact/browser checks before any deploy step. | ✓ VERIFIED | `.github/workflows/pages.yml:3-39` triggers both event types, gives build read-only contents permission, runs the aggregate check, uploads only afterward, and gates deploy on `needs: build` plus default-branch push. |

**Score:** 8/9 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `package.json` / `package-lock.json` | Pinned reproducible release commands and dependency graph | ✓ VERIFIED | Aggregate check has one production build and current lockfile installs in final CI. |
| `src/data/profile.ts` | Confirmed identity, resume, email, and profiles | ✓ VERIFIED | Real approved values are rendered by home and shared metadata. |
| `src/pages/index.astro` | Static profile, direct navigation, and project listing | ✓ VERIFIED | Substantive semantic sections; project list consumes live collection data. |
| `src/layouts/BaseLayout.astro` | Metadata, canonical URL, skip link, shared navigation | ✓ VERIFIED | Imported by both routes; imports global CSS and renders the page shell. |
| `src/styles/global.css` | Responsive catalogue, focus, evidence sizing, reduced-motion policy | ✓ VERIFIED | 135 substantive lines; final fix `7f980e7` removed overflow masking and bounds images responsively. |
| `src/content.config.ts` / `src/lib/project-schema.ts` | Typed content and image validation | ✓ VERIFIED | Nonblank trimmed strings, HTTPS URL constraint, exact contract array length, and Astro `image()` sources. |
| `src/lib/project-validation.ts` | Collection-wide publication checks | ✓ VERIFIED | Exported `validateProjectRecords()` rejects duplicate published slugs, invalid contract sets, non-HTTPS/missing URLs, blank metadata, and missing screenshot evidence. |
| `src/lib/projects.ts` | Sole public collection boundary | ✓ VERIFIED | Validates all records, filters drafts, and sorts by exhibition order. |
| `src/content/projects/featured-client/index.md` and JPEGs | Evidence-backed three-contract story | ✓ VERIFIED | Three distinct structured contracts, complete local prose, confirmed URL, and exactly three local approved JPEGs. |
| `src/pages/projects/[...slug].astro` | Canonical generated case-study route | ✓ VERIFIED | Builds paths solely from published projects and renders prose, contracts, figures, captions, and return link. |
| `public/resume/william-castle-resume.pdf` | Actual selected resume | ✓ VERIFIED | Valid two-page PDF; local and live asset both return successfully. |
| `src/content/projects/verification-draft.md` | Unpublished sentinel | ✓ VERIFIED | Source exists with `published: false`; route and serialized built token are absent. |
| `scripts/verify-built-content.mjs` | Built artifact checks | ✓ VERIFIED | Checks routes/assets, required identifiers, draft/placeholder absence, and incorrect base prefixes. |
| `tests/project-validation.test.ts` / `tests/skeleton.spec.ts` / `tests/portfolio.spec.ts` | Validation and visitor regression coverage | ✓ VERIFIED | Final CI run reports 5/5 Node validation tests and 11/11 Playwright tests. |
| `.github/workflows/pages.yml` | Checked-artifact Pages pipeline | ✓ VERIFIED | Full-SHA action pins, least privilege, one aggregate build/check, dependent deploy without rebuild. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/pages/index.astro` | `src/data/profile.ts` | Import and rendered fields | ✓ WIRED | Name, intro, background, resume, email, and profiles are rendered. |
| `BaseLayout.astro` | `src/styles/global.css` | Global stylesheet import | ✓ WIRED | Both page routes consume BaseLayout. |
| Home and project route | `src/lib/projects.ts` | `getPublishedProjects()` | ✓ WIRED | Both consumers use the sole collection query. |
| `src/lib/projects.ts` | Content collection and validation | `getCollection` then `validateProjectRecords` | ✓ WIRED | Validation occurs before draft filtering and sorting. |
| Project entry | Dynamic route | `render(project)` and structured `data` | ✓ WIRED | Markdown body, contracts, screenshots, and URL all flow into the generated route. |
| `package.json` | Built verifier and browser suites | Aggregate `check` command | ✓ WIRED | CI job invokes the same command before upload. |
| Build job | Deploy job | Checked `dist` Pages artifact and `needs: build` | ✓ WIRED | Build has no Pages authority; deploy has no checkout/install/build. |

The generic key-link helper missed three links because it does not follow the layout indirection or multiline Astro expressions; manual source tracing above resolves those false negatives. Its export parser also failed to recognize the literal `export function` declarations in both library files; the exports and imports are present and exercised.

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| Home project card | `projects` | `getPublishedProjects()` → Astro collection → `featured-client/index.md` | Yes — live title, summary, slug, and order render | ✓ FLOWING |
| Case-study page | `project`, `data`, `Content` | Generated path props from the same published collection entry | Yes — prose, contracts, URL, image metadata, and captions render | ✓ FLOWING |
| Profile/resume/contact | `profile` | Confirmed constants in `src/data/profile.ts` | Yes — approved values appear in live HTML | ✓ FLOWING |
| Pages deploy | `dist/` artifact | `npm run check` creates and tests `dist`, upload action packages it, dependent deploy consumes it | Yes — artifact `10593592244` produced deployment `6546449451` | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command/evidence | Result | Status |
| --- | --- | --- | --- |
| Current source checks/builds and emits required artifact | `npm run check` in verifier sandbox | Astro 0 errors, two routes built, artifact verified, Node tests passed; browser server bind stopped by sandbox `listen EPERM` | ? ENVIRONMENT-LIMITED |
| Full current release gate | GitHub run `35473534794`, build job `105978703804` | Completed success; 5/5 validation and 11/11 Playwright/accessibility tests | ✓ PASS |
| Exact checked artifact deploys | Run `35473534794`, artifact `10593592244`, deploy job `105978825361`, deployment `6546449451` | All successful; deployment status points to the public URL | ✓ PASS |
| Public routes and resume are available | HTTP checks for `/`, `/projects/featured-client/`, and resume PDF | All returned HTTP 200 | ✓ PASS |
| Failed checks preserve release | Run `35472453422` and GitHub artifact/deployment APIs | Build failed; upload and deploy skipped; zero artifacts/deployments for failed SHA; live routes remained 200 | ✓ PASS |
| Normal restoration works | Revert `6a77fab`, run `35472513054` | Build and deploy succeeded without history rewrite | ✓ PASS |

### Probe Execution

No probe scripts are declared in the Phase 1 plans/summaries, and no conventional `scripts/*/tests/probe-*.sh` files exist. Step 7c is not applicable.

### Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
| --- | --- | --- | --- |
| PROF-01 | 01-01 | ✓ SATISFIED | Confirmed name, introduction, and graduate background are present in initial HTML and live site. |
| PROF-02 | 01-02 | ✓ SATISFIED | Clearly labeled resume link targets the approved live two-page PDF. |
| PROF-03 | 01-02 | ✓ SATISFIED | Clearly labeled email and supplied profile destinations are ordinary links. |
| WORK-01 | 01-02 | ✓ SATISFIED | Structured and rendered website, manual planner, and limited AI MVP contracts remain distinct. |
| WORK-02 | 01-02 | ✓ SATISFIED | Three local approved images render with nonempty alt text, dimensions, and visible captions. |
| WORK-03 | 01-02 | ✓ SATISFIED | Confirmed HTTPS client link is additive to a complete local narrative. |
| WORK-04 | 01-02 | ✓ SATISFIED | Canonical direct HTML route has descriptive title/summary and returns HTTP 200. |
| NAV-01 | 01-02 | ✓ SATISFIED | Projects, About, Resume, and Contact anchors target existing visible landmarks. |
| ACCESS-01 | 01-02 | ✓ SATISFIED | Static HTML and no-JavaScript CI journey expose all essential content/actions. |
| ACCESS-02 | 01-03 | ✓ SATISFIED | Semantic links, skip link, visible focus, logical route actions, and axe scans pass. |
| ACCESS-03 | 01-03 | ✓ SATISFIED | 320px, enlarged-text, evidence-bound, and overflow checks pass; real-browser zoom remains in UAT. |
| GROW-02 | 01-02/01-03 | ✓ SATISFIED | Schema/build and pure tests reject invalid metadata, duplicate slugs/contracts, unsafe URL/evidence, and unresolved local image references. |
| GROW-03 | 01-03 | ✓ SATISFIED | Draft sentinel is filtered before routes/lists and rejected by artifact scan if serialized. |
| SHIP-01 | 01-03 | ✓ SATISFIED | PR/push CI runs content/type/build/artifact/validation/browser checks. |
| SHIP-02 | 01-03 | ✓ SATISFIED | Successful exact-artifact delivery and failed-check preservation are recorded and independently queried. |

All 15 Phase 1 requirement IDs appear in plan frontmatter. No additional Phase 1 requirement is orphaned.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
| --- | --- | --- | --- |
| `scripts/verify-built-content.mjs:44` | `console.log` | ℹ Info | Intentional CLI success output, not a stub or handler implementation. |
| `tests/project-validation.test.ts` | `example.com` fixtures | ℹ Info | Test-only HTTPS/HTTP inputs; the built artifact scanner prevents placeholder publication. |

No unreferenced `TBD`, `FIXME`, or `XXX` markers, placeholder UI, empty production handlers, hollow props, or orphaned production artifacts were found. Commit `7f980e7` resolves the earlier responsive/schema review findings, and the clean re-review at commit `5b3a3ce` records zero critical, warning, or informational findings.

### Disconfirmation Pass

- **Partially automatable requirement:** The code and tests establish semantic structure and responsive bounds, but the roadmap's “deliberate readable visual identity” still needs human judgment. It is intentionally not counted as verified.
- **Potentially misleading evidence checked:** A local aggregate command cannot start Playwright in this verifier sandbox because localhost binding is prohibited. This is not treated as a pass; the same current commit's final CI job is the behavioral evidence for the 11 browser tests.
- **External/error path checked:** The client site can become unavailable, but the case-study narrative, screenshots, and contract evidence are local and do not depend on that site. The third-party experience itself remains part of UAT.

### Human Verification Required

#### 1. Desktop and mobile visual identity

**Test:** Open the public home page and case study on desktop and at a narrow mobile viewport.
**Expected:** Warm ivory, construction lines, and the plans-becoming-places progression are intentional and never obscure or reorder content.
**Why human:** Visual quality is subjective.

#### 2. Full keyboard journey

**Test:** Use only Tab, Shift+Tab, and Enter through the skip link, navigation, project, evidence links, resume/contact, and return link.
**Expected:** Focus order is logical, focus is always visible/unobscured, and no trap exists.
**Why human:** CI covers representative focus behavior, while this checks the complete published journey.

#### 3. Real browser zoom and reflow

**Test:** Test both routes at 200% and 400% zoom, including a 320 CSS-pixel viewport.
**Expected:** No overlap, clipping, hidden controls, or two-dimensional scrolling; evidence images remain bounded.
**Why human:** Actual browser zoom and readability require observation.

#### 4. Published no-JavaScript journey

**Test:** Disable JavaScript and complete home → case study → resume/contact → return.
**Expected:** All essential content and actions remain available.
**Why human:** This confirms the automated contract against the actual deployed user flow.

#### 5. Reduced-motion journey

**Test:** Enable reduced motion and repeat home → project → return → resume/contact.
**Expected:** Complete access with no nonessential motion or smooth scrolling.
**Why human:** Perceived motion is not fully captured by computed-style assertions.

#### 6. External destinations

**Test:** Open the resume, email action, approved profiles, and client link.
**Expected:** Each resolves to the intended approved destination; the local story remains useful independently.
**Why human:** Browser handlers and third-party destinations are external integration points.

#### 7. Failed-release record

**Test:** Inspect workflow run `35472453422` between successful runs.
**Expected:** Failed build, skipped upload/deploy, no artifact/deployment, and uninterrupted prior release.
**Why human:** Explicit deferred plan checkpoint, despite matching API evidence.

### Gaps Summary

No implementation blocker or unresolved automated gap was found. The phase remains `human_needed` solely because the MVP flow and Plan 01-03 explicitly require final real-browser visual, zoom, keyboard, reduced-motion, external-destination, and failed-release review. Automated evidence supports all technical claims, but subjective visual acceptance must not be inferred from code or CI.

---

_Verified: 2026-09-19T22:38:25Z_
_Verifier: the agent (gsd-verifier)_
