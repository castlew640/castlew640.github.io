---
phase: 01-publishable-portfolio-and-delivery
reviewed: 2026-09-19T22:20:54Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - .github/workflows/pages.yml
  - .gitignore
  - astro.config.ts
  - package.json
  - playwright.config.ts
  - public/resume/william-castle-resume.pdf
  - scripts/verify-built-content.mjs
  - src/content.config.ts
  - src/content/projects/featured-client/clientScreenshot1.jpg
  - src/content/projects/featured-client/clientScreenshot3.jpg
  - src/content/projects/featured-client/clientscreenshot2.jpg
  - src/content/projects/featured-client/index.md
  - src/content/projects/verification-draft.md
  - src/data/profile.ts
  - src/layouts/BaseLayout.astro
  - src/lib/project-validation.ts
  - src/lib/projects.ts
  - src/pages/index.astro
  - src/pages/projects/[...slug].astro
  - src/styles/global.css
  - tests/portfolio.spec.ts
  - tests/project-validation.test.ts
  - tests/skeleton.spec.ts
  - tsconfig.json
findings:
  critical: 2
  warning: 2
  info: 0
  total: 4
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-09-19T22:20:54Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

The static site, content pipeline, delivery workflow, tests, and publication assets were reviewed at standard depth. The implementation has two release-blocking correctness gaps: the three evidence screenshots render at their roughly 1900-pixel intrinsic widths and are clipped on narrow screens, and the content schema treats whitespace-only copy and accessibility fields as valid metadata. The reusable content path is also coupled to this one client's three-contract story, and the browser reflow assertions can pass while content is clipped.

`astro check`, the production build, built-content verification, and the Node validation assertions completed locally. The aggregate `npm run check` reached Playwright but the preview server could not bind to localhost in the review sandbox (`EPERM`), so browser suites were assessed from their source and generated HTML/CSS rather than rerun here.

## Critical Issues

### CR-01: Evidence screenshots overflow and are clipped on mobile

**Classification:** BLOCKER

**File:** `/home/castlewr/sickProjects/personalWebsite/src/styles/global.css:23-24,96`

**Affected rendering:** `/home/castlewr/sickProjects/personalWebsite/src/pages/projects/[...slug].astro:47-50`

**Issue:** The route emits explicit intrinsic dimensions of 1901×927, 1917×922, and 1915×871, but the only rule applied to those images adds a border. There is no `max-width`, responsive `width`, or block sizing rule. At a 320-pixel viewport, each screenshot therefore remains roughly 1900 CSS pixels wide. `html { overflow-x: hidden; }` and `body { overflow-x: clip; }` hide the overflow instead of reflowing it, leaving most of the approved evidence inaccessible. This violates the phase's mobile/reflow promise and directly breaks a core case-study experience.

**Fix:** Constrain images to their containing figure while preserving aspect ratio, and remove overflow clipping once the underlying layout is responsive.

```css
figure img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--line);
}
```

### CR-02: Whitespace-only metadata passes the publication schema

**Classification:** BLOCKER

**File:** `/home/castlewr/sickProjects/personalWebsite/src/content.config.ts:7-17,23-29`

**Issue:** User-facing fields use `z.string().min(1)`, which accepts values such as `"   "`. A published project can therefore pass the schema with an effectively empty contract title/description/hosting value, stack label, screenshot alternative text, or caption. `validateProjectRecords` trims only the top-level published title and summary, so it does not close this gap. This contradicts the claimed build-time rejection of invalid metadata and can publish screenshots without meaningful accessible text or readable captions.

**Fix:** Normalize and validate every human-readable string, ideally through one shared schema. Keep the explicit published-project checks for conditional requirements.

```ts
const nonBlank = z.string().trim().min(1);

const contractSchema = z.object({
  id: z.enum(['website', 'manual-planner', 'ai-mvp']),
  title: nonBlank,
  description: nonBlank,
  stack: z.array(nonBlank).min(1),
  hosting: nonBlank,
});

const screenshotSchema = z.object({
  src: nonBlank,
  alt: nonBlank,
  caption: nonBlank,
});
```

Apply `nonBlank` to project `slug`, `title`, and `summary` as appropriate as well.

## Warnings

### WR-01: The shared project model and route hard-code one client's three-contract structure

**Classification:** WARNING

**File:** `/home/castlewr/sickProjects/personalWebsite/src/content.config.ts:5-11,28`

**Related files:** `/home/castlewr/sickProjects/personalWebsite/src/lib/project-validation.ts:42-45`; `/home/castlewr/sickProjects/personalWebsite/src/pages/projects/[...slug].astro:22,30-40`

**Issue:** Every project, including drafts and future personal work, is required to contain exactly `website`, `manual-planner`, and `ai-mvp` contracts. The supposedly generic route then labels every entry “Featured client / Three contracts” and “Three contracts.” Publishing any project that is not this Eiffel client story therefore requires renderer/schema edits or fabricated contract data. This makes the shared content boundary misleading and creates avoidable coupling before the planned growth phases consume it.

**Fix:** Move client-story-specific structure behind an explicit project kind or flexible section model. For example, use a discriminated union whose `client-case-study` variant requires these three contracts, while ordinary projects have their own validated fields; render headings conditionally from that variant rather than hard-coding them in the shared route.

### WR-02: Reflow tests can pass while responsive content is hidden

**Classification:** WARNING

**File:** `/home/castlewr/sickProjects/personalWebsite/tests/portfolio.spec.ts:23-33`

**Related files:** `/home/castlewr/sickProjects/personalWebsite/tests/skeleton.spec.ts:59-76`; `/home/castlewr/sickProjects/personalWebsite/src/styles/global.css:23-24`

**Issue:** The narrow project-route test asserts only that `document.documentElement.scrollWidth` is no greater than the viewport. Because production CSS forcibly hides/clips horizontal overflow, that assertion can succeed even when a 1900-pixel image is mostly outside the visible area, as CR-01 demonstrates. The enlarged-text branch likewise checks profile text and document width after applying 200% font sizing, but never rechecks that primary navigation remains visible, operable, and correctly sized. These tests give false confidence in the phase's mobile and zoom/reflow contract.

**Fix:** Assert bounds for the actual content that must reflow, and repeat navigation/action checks after text enlargement. For example, compare each evidence image's bounding box against the viewport, assert its computed width is no greater than its figure/container, and verify all primary navigation links remain visible and keyboard reachable after the 200% style is applied. Do not use overflow clipping as the condition that makes the width assertion pass.

---

_Reviewed: 2026-09-19T22:20:54Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
