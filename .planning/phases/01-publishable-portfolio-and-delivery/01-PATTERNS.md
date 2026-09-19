# Phase 1: Publishable Portfolio and Delivery - Pattern Map

**Mapped:** 2026-09-19
**Files analyzed:** 25 new file paths or path groups
**Analogs found:** 0 / 25 implementation analogs

This is a greenfield repository. At mapping time it contains only `AGENTS.md` and `.planning/` artifacts; there is no `src/`, `tests/`, `scripts/`, `.github/`, package manifest, lockfile, application asset, or project-local skill. The sources named below are therefore specification references, not existing implementation analogs. The planner must not describe them as established codebase conventions.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | batch | `01-RESEARCH.md` Standard Stack | specification-only |
| `package-lock.json` | config | batch | `01-RESEARCH.md` Standard Stack | generated; no analog |
| `tsconfig.json` | config | transform | `01-RESEARCH.md` Standard Stack | specification-only |
| `astro.config.ts` | config | transform | `01-RESEARCH.md` lines 446-455 | reference snippet only |
| `playwright.config.ts` | config | request-response | `01-RESEARCH.md` Supporting Stack and Code Examples | specification-only |
| `src/content.config.ts` | config | file-I/O + transform | `01-RESEARCH.md` lines 250-287 | reference snippet only |
| `src/content/projects/<featured-client>.md` | model | file-I/O | `01-CONTEXT.md` D-05 through D-11 | content contract only |
| `src/content/projects/<draft-fixture>.md` | model | file-I/O | `01-RESEARCH.md` Pattern 1 / Pitfall 2 | specification-only |
| `src/content/projects/<approved-screenshot-assets>` | model | file-I/O | `01-CONTEXT.md` D-11 | owner input; no analog |
| `src/data/profile.ts` | model | transform | `01-CONTEXT.md` D-12 through D-15 | content contract only |
| `src/lib/projects.ts` | service | file-I/O + transform | `01-RESEARCH.md` lines 232-248 | reference snippet only |
| `src/layouts/BaseLayout.astro` | component | request-response | `01-RESEARCH.md` Pattern 4 | specification-only |
| `src/components/SiteHeader.astro` | component | request-response | `01-RESEARCH.md` Pattern 4 | specification-only |
| `src/components/ProjectCard.astro` | component | transform | `01-RESEARCH.md` Pattern 1 | specification-only |
| `src/components/ContractSection.astro` | component | transform | `01-RESEARCH.md` Pattern 2 | specification-only |
| `src/components/ScreenshotFigure.astro` | component | transform | `01-RESEARCH.md` Pattern 2 / Pattern 4 | specification-only |
| `src/pages/index.astro` | route | request-response | `01-RESEARCH.md` Pattern 1 / Pattern 4 | specification-only |
| `src/pages/projects/[...id].astro` | route | request-response | `01-RESEARCH.md` lines 390-413 | reference snippet only |
| `src/styles/global.css` | config | transform | `01-CONTEXT.md` D-01 through D-04 | visual contract only |
| `public/resume/<selected-resume>.pdf` | model | file-I/O | `01-CONTEXT.md` D-15 | owner input; no analog |
| `tests/portfolio.spec.ts` | test | request-response | `01-RESEARCH.md` lines 415-430 | reference snippet only |
| `tests/no-js.spec.ts` | test | request-response | `01-RESEARCH.md` lines 415-430 | reference snippet only |
| `tests/accessibility.spec.ts` | test | request-response | `01-RESEARCH.md` lines 432-444 | reference snippet only |
| `scripts/verify-built-content.mjs` | test | batch + file-I/O | `01-RESEARCH.md` Pitfalls 1, 2, and 5 | specification-only |
| `.github/workflows/pages.yml` | config | batch | `01-RESEARCH.md` Pattern 3 | specification-only |

`<featured-client>`, screenshot filenames, and `<selected-resume>` deliberately remain unresolved. The context forbids inventing client naming, screenshots, resume selection, or other publication inputs.

## Pattern Assignments

### Project foundation and tool configuration

**Files:** `package.json`, `package-lock.json`, `tsconfig.json`, `astro.config.ts`, `playwright.config.ts`

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` lines 117-167 and 446-455.

Use exact dependency pins only after the required human package-legitimacy checkpoint. Commit the npm lockfile, use strict TypeScript, configure Playwright against built output, and configure the account-site origin without a project-site `base`.

**Astro origin reference** (`01-RESEARCH.md` lines 446-455):

```typescript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://castlew640.github.io',
});
```

Do not install React, React Three Fiber, or Three.js in Phase 1.

---

### `src/content.config.ts` (config, file-I/O + transform)

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` lines 250-287.

**Imports and collection pattern:**

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    published: z.boolean().default(false),
    exhibitionOrder: z.number().int().nonnegative(),
    liveUrl: z.url().optional(),
    contracts: z.array(z.object({
      id: z.enum(['website', 'manual-planner', 'ai-mvp']),
      title: z.string().min(1),
      contribution: z.string().min(1),
      stack: z.array(z.string()).min(1),
      rationale: z.string().min(1),
    })).length(3),
    screenshots: z.array(z.object({
      src: image(),
      alt: z.string().min(1),
      caption: z.string().min(1),
    })),
  }),
});

export const collections = { projects };
```

The per-entry schema is not sufficient by itself. Add collection-wide checks that contract IDs are unique and exactly equal `website`, `manual-planner`, and `ai-mvp`. A `published: true` entry must also have real approved evidence; incomplete entries remain drafts.

---

### Project Markdown and local evidence (models, file-I/O)

**Files:** `src/content/projects/<featured-client>.md`, `src/content/projects/<draft-fixture>.md`, `src/content/projects/<approved-screenshot-assets>`

**Existing analog:** None.

**Specification sources:** `01-CONTEXT.md` D-05 through D-11 and `01-RESEARCH.md` Pattern 2.

The featured entry must model three paid contracts separately:

1. `website` — Supabase and Vercel; selected for expected modest traffic and reduced billed setup effort/cost.
2. `manual-planner` — Supabase and Vercel; do not merge it with the AI work.
3. `ai-mvp` — limited demonstrator on AWS Lightsail, selected for the client's AWS preference and more predictable billing.

Store accuracy-critical facts in structured frontmatter and render them from that source. Keep narrative prose in the Markdown body. Use `image()`-validated local screenshot references with required alt text and captions. Never add private client source, fabricated metrics, placeholder evidence, or unconfirmed outcome claims.

The draft fixture must use an unmistakable non-public ID/title so built-output checks can prove its route, listing, and serialized text are all absent.

---

### `src/data/profile.ts` (model, transform)

**Existing analog:** None.

**Specification source:** `01-CONTEXT.md` D-12 through D-15.

Centralize the confirmed display name, introduction, graduate background, resume destination, email, and profile links. The confirmed values currently available are:

```typescript
export const profile = {
  displayName: 'William Castle',
  introduction: 'I build software around what people are trying to achieve, from the first idea to deployment.',
};
```

Do not fill missing contact/profile/resume fields with examples. Model their incompleteness explicitly or gate the public build until the owner supplies real values.

---

### `src/lib/projects.ts` (service, file-I/O + transform)

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` lines 232-248.

**Published-content boundary:**

```typescript
import { getCollection } from 'astro:content';

export async function getPublishedProjects() {
  return (await getCollection('projects', ({ data }) => data.published))
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
```

This is the only public collection query. Home cards, static routes, metadata, built checks, and Phase 2's future exhibit manifest must consume it instead of repeating `getCollection('projects')` filters.

---

### Layout and presentation components

**Files:** `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/ProjectCard.astro`, `src/components/ContractSection.astro`, `src/components/ScreenshotFigure.astro`

**Existing analog:** None.

**Specification sources:** `01-CONTEXT.md` D-01 through D-04 and `01-RESEARCH.md` Pattern 4.

Use normal semantic document flow: skip link, header/navigation, main landmark, footer, native links, logical headings, and `<figure>/<figcaption>`. The base layout owns descriptive titles and canonical metadata. `ProjectCard` receives a typed collection entry; `ContractSection` receives one structured contract; `ScreenshotFigure` receives one validated image/alt/caption object. Components must not duplicate project metadata.

No component may require client-side JavaScript to expose identity, navigation, case-study evidence, resume, or contact actions.

---

### Routes

**Files:** `src/pages/index.astro`, `src/pages/projects/[...id].astro`

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` lines 390-413.

**Static route pattern:**

```astro
---
import { render } from 'astro:content';
import { getPublishedProjects } from '../../lib/projects';

export async function getStaticPaths() {
  const projects = await getPublishedProjects();
  return projects.map((project) => ({
    params: { id: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---

<Content />
```

The home route must also call `getPublishedProjects()` rather than querying the collection directly. Direct refresh of a canonical project URL must return complete HTML.

---

### `src/styles/global.css` (config, transform)

**Existing analog:** None.

**Specification sources:** `01-CONTEXT.md` D-01 through D-04 and `01-RESEARCH.md` Pitfall 4.

Define the Phase 1 design tokens and composition here: warm ivory, expressive typography, spacious imagery, architectural construction lines, and subtle “plans becoming places” details. Use progressive decoration around ordinary document flow. Include durable `:focus-visible` styling, readable contrast, responsive type/spacing, and reflow without horizontal page scrolling at the 320 CSS-pixel/400%-zoom equivalent.

Do not establish a canvas, 3D scene, scroll-camera contract, fixed desktop-only composition, or hover-only content in this phase.

---

### `public/resume/<selected-resume>.pdf` (model, file-I/O)

**Existing analog:** None.

**Specification source:** `01-CONTEXT.md` D-15.

Add only the actual owner-selected resume. Its review and selection are deferred, so implementation may prepare the destination but cannot claim PROF-02 complete until the real PDF or chosen online URL is supplied and verified.

---

### Browser journey tests

**Files:** `tests/portfolio.spec.ts`, `tests/no-js.spec.ts`, `tests/accessibility.spec.ts`, `playwright.config.ts`

**Existing analog:** None.

**Specification sources:** `01-RESEARCH.md` lines 415-444.

**No-JavaScript journey reference:**

```typescript
import { test, expect } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('profile, project, resume, and contact remain available', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /William Castle/i })).toBeVisible();
  await page.getByRole('link', { name: /featured client/i }).click();
  await expect(page).toHaveURL(/\/projects\//);
  await expect(page.getByRole('heading', { name: /manual Wi-Fi planner/i })).toBeVisible();
});
```

**Accessibility scan reference:**

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Also cover canonical direct-route refresh, keyboard-only navigation and focus visibility, contact/resume destinations, screenshot presence, narrow viewport reflow, and descriptive page metadata. Axe is supplemental; retain manual zoom, text-spacing, contrast, reading-order, and focus-obscuring review.

---

### `scripts/verify-built-content.mjs` (test, batch + file-I/O)

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` Pitfalls 1, 2, and 5.

Scan `dist/` after the production build. Fail if:

- a known draft route, title, ID, or serialized record exists;
- the three expected contract identifiers are not represented accurately;
- a published route or required local asset is absent;
- known placeholder tokens such as `example.com` or lorem ipsum appear;
- account-site links incorrectly contain `/castlew640.github.io/` as a base prefix.

This complements schema validation; it proves what was emitted, not just what source data was accepted.

---

### `.github/workflows/pages.yml` (config, batch)

**Existing analog:** None.

**Specification source:** `01-RESEARCH.md` Pattern 3 and Security Domain.

Implement a build/check job that installs from the lockfile, performs content/type checks, builds once, runs built-output verification and Playwright journeys, then uploads `dist/` as the Pages artifact. A separate deploy job must `need` the successful build job and consume that exact artifact; it must never check out and rebuild.

Use `contents: read` for build. Grant `pages: write` and `id-token: write` only to deploy. Pin reviewed official actions to full commit SHAs, avoid custom production secrets, and deploy only on the confirmed default branch while still running checks for pull requests.

## Shared Patterns

### One canonical published-content boundary

**Source:** `01-RESEARCH.md` lines 232-248

**Apply to:** `src/lib/projects.ts`, `src/pages/index.astro`, `src/pages/projects/[...id].astro`, project cards, built-output verification, and the future Phase 2 manifest.

All public consumers use `getPublishedProjects()`. No other source file should call `getCollection('projects')` directly.

### Structured accuracy

**Source:** `01-CONTEXT.md` D-05 through D-11 and `01-RESEARCH.md` lines 250-287

**Apply to:** collection schema, project Markdown, contract component, route, tests, and built-output verification.

Treat contract identity, stack, rationale, and evidence as validated fields. Never derive or duplicate these facts as disconnected template prose.

### Semantic HTML and progressive decoration

**Source:** `01-RESEARCH.md` Pattern 4

**Apply to:** every layout, component, route, and browser journey.

Essential content and controls are native HTML. Decoration must preserve keyboard order, visible focus, mobile/zoom reflow, and JavaScript-free access.

### Fail-closed publication inputs

**Source:** `01-CONTEXT.md` “Remaining publication inputs” and `01-RESEARCH.md` Pitfall 5

**Apply to:** profile data, client entry, screenshots, resume, content checks, and release acceptance.

Missing real content remains explicitly incomplete; it is never replaced with a plausible placeholder and never silently promoted to `published: true`.

### Checked artifact promotion

**Source:** `01-RESEARCH.md` Pattern 3

**Apply to:** npm scripts, verification script, Playwright configuration, and Pages workflow.

Build exactly once, test the built `dist/`, upload that directory, and deploy the same artifact only after every check passes.

### Static-site security

**Source:** `01-RESEARCH.md` Security Domain

**Apply to:** content schema, Markdown rendering, external URLs, repository contents, and workflow permissions.

Use owner-controlled Markdown, validate URL schemes, avoid arbitrary `set:html`, keep private client materials out of the public repository, and enforce least-privilege workflow permissions.

## No Analog Found

There are no implementation files to copy. Every planned path is listed here so the planner does not accidentally present a research snippet as a local convention.

| File or Path Group | Role | Data Flow | Reason |
|--------------------|------|-----------|--------|
| Root manifests/config (`package.json`, lockfile, TypeScript, Astro, Playwright) | config | batch / transform | No project manifest or tool configuration exists. |
| `src/content.config.ts` | config | file-I/O + transform | No application source exists. |
| `src/content/projects/**` | model | file-I/O | No content entries or assets exist. |
| `src/data/profile.ts` | model | transform | No data modules exist. |
| `src/lib/projects.ts` | service | file-I/O + transform | No services or content-query helpers exist. |
| `src/layouts/**` and `src/components/**` | component | request-response / transform | No Astro UI exists. |
| `src/pages/**` | route | request-response | No routes exist. |
| `src/styles/global.css` | config | transform | No stylesheet or design system exists. |
| `public/resume/**` | model | file-I/O | No public assets exist; the actual resume is unsupplied. |
| `tests/**` | test | request-response | No test harness or tests exist. |
| `scripts/verify-built-content.mjs` | test | batch + file-I/O | No verification scripts exist. |
| `.github/workflows/pages.yml` | config | batch | No workflow exists. |

## Metadata

**Analog search scope:** repository root, including hidden files, excluding `.git/`

**Files scanned:** 17 non-git files, all planning/project-instruction artifacts

**Project-local skills:** none found in `.codex/skills/` or `.agents/skills/`

**Pattern extraction date:** 2026-09-19

**Authority order:** `01-CONTEXT.md` locked user decisions → `ROADMAP.md` phase boundary → `01-RESEARCH.md` technical guidance → project-wide planning research. Where code does not exist, official framework examples recorded in `01-RESEARCH.md` are references to adapt, not local analogs.
