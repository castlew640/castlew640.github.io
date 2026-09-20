# Phase 2: One-Handed Surreal Exhibition - Pattern Map

**Mapped:** 2026-09-20
**Files analyzed:** 22 (16 new, 6 modified)
**Analogs found:** 14 / 22

**Stack note (binding):** The scene is **plain `three@0.186.0`** in vanilla TypeScript. No React, no `@react-three/fiber`, no `@astrojs/react`. This supersedes UI-SPEC §Design System's "one React Three Fiber island" line. Where UI-SPEC or RESEARCH say "island", read "Astro `<script>`-bundled TypeScript module". No React component patterns are mapped below.

**Codebase reality check:** `src/` currently contains **zero client-side JavaScript**. `grep -rn "<script" src/` returns nothing. Every file under `src/scripts/exhibition/**` is therefore a genuinely new category with no in-repo analog — use RESEARCH.md's code examples verbatim for those, and use the conventions extracted from the TypeScript files in `src/lib/` (strict mode, named exports, no default exports, no classes, explicit return types on exported functions) for style.

---

## File Classification

| New/Modified File | New/Mod | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|---------|------|-----------|----------------|---------------|
| `src/lib/exhibition/stops.ts` | new | utility (pure) | transform | `src/lib/project-validation.ts` | exact |
| `src/lib/exhibition/types.ts` | new | model/types | — | `src/data/profile.ts` (lines 1-8) + `src/lib/project-validation.ts` (lines 3-12) | exact |
| `src/lib/exhibition/manifest.ts` | new | service (build-time) | CRUD-read | `src/lib/projects.ts` | exact |
| `src/components/exhibition/ExhibitSection.astro` | new | component | request-response (build-time render) | `src/pages/projects/[...slug].astro` lines 44-54 + `src/pages/index.astro` lines 61-73 | exact |
| `src/components/exhibition/StopSection.astro` | new | component | build-time render | `src/layouts/BaseLayout.astro` lines 1-16, 44 | role-match |
| `src/components/exhibition/ExhibitionShell.astro` | new | component + script host | build-time render + client entry | `src/layouts/BaseLayout.astro` (structure only) | partial — **no `<script>` analog exists** |
| `src/components/exhibition/drawings/*.astro` | new | component (static SVG) | — | `src/pages/index.astro` lines 18-56 (`Fig. 01`) | exact |
| `src/scripts/exhibition/policy.ts` | new | utility (client) | event-driven | — | **none** |
| `src/scripts/exhibition/scroll.ts` | new | utility (client) | transform | `src/lib/project-validation.ts` (style only) | partial |
| `src/scripts/exhibition/controller.ts` | new | controller (client) | event-driven | — | **none** |
| `src/scripts/exhibition/scene/index.ts` | new | service (client, lazy) | event-driven | — | **none** |
| `src/scripts/exhibition/scene/ink.ts` | new | service (client) | transform | `src/pages/index.astro` lines 26-53 (stroke/colour vocabulary only) | partial |
| `src/scripts/exhibition/scene/architecture.ts` | new | service (client) | transform | — | **none** |
| `src/scripts/exhibition/scene/reflection.ts` | new | service (client) | transform | — | **none** |
| `src/scripts/exhibition/scene/quality.ts` | new | config (client) | event-driven | — | **none** |
| `src/pages/index.astro` | **mod** | page | build-time render | itself + `src/pages/projects/[...slug].astro` | exact |
| `src/styles/global.css` | **mod** | config (styles) | — | itself (lines 1-36, 39, 131-134) | exact |
| `src/lib/project-schema.ts` | **mod** | model (schema) | validation | itself (lines 1-17) | exact |
| `tests/exhibition-travel.spec.ts` | new | test (e2e) | request-response | `tests/skeleton.spec.ts` lines 59-77 | exact |
| `tests/exhibition-navigation.spec.ts` | new | test (e2e) | request-response | `tests/portfolio.spec.ts` lines 23-49, 72-86 | exact |
| `tests/exhibition-resilience.spec.ts` | new | test (e2e) | event-driven | `tests/portfolio.spec.ts` lines 96-115 | role-match |
| `tests/exhibition-stops.test.ts` | new | test (unit) | transform | `tests/project-validation.test.ts` lines 1-21 | exact |
| `tests/portfolio.spec.ts` | **mod** | test (e2e) | request-response | itself | exact |
| `package.json` (`check` script) | **mod** | config | — | itself | exact |
| `scripts/verify-built-content.mjs` | **mod** | test (build gate) | file-I/O | itself lines 36-43 | exact |

---

## Pattern Assignments

### `src/lib/exhibition/stops.ts` (utility, pure transform)

**Analog:** `src/lib/project-validation.ts` — the repo's only pure, DOM-free, Astro-free, unit-tested TS module. Copy its shape exactly.

**Module shape** (`src/lib/project-validation.ts` lines 1-3, 14, 23, 49):

```typescript
const CONTRACT_IDS = new Set(['website', 'manual-planner', 'ai-mvp']);

type ProjectRecord = { … };                       // local type, declared above use

function requireHttpsUrl(value: string, label: string): void { … }   // private helper, not exported

export function validateProjectRecords(records: ProjectRecord[]): void { … }

export { CONTRACT_IDS };                          // value re-exports at file end
```

Conventions to copy:
- **No imports at all** — this file must not import `astro:content`, `astro/zod`, or anything DOM. That is what makes it importable from both `node --test` and the client bundle.
- Named exports only; no `default`. Explicit return types on every exported function.
- Private helpers declared as plain `function`, not exported.
- Two-space indent, single quotes, semicolons, trailing `;` on type aliases.

**Content to implement:** RESEARCH.md Pattern 3 `buildStopTable(slugs: string[])`. At `N = 1` it must yield z `[0, −18, −36, −46]` and `landingArchZ = −64` (UI-SPEC §A.2).

---

### `src/lib/exhibition/types.ts` (model)

**Analog:** `src/data/profile.ts` lines 1-8 (interface-first, then typed const) and `src/lib/project-validation.ts` lines 3-12 (inline `type` alias).

```typescript
interface Profile {
  displayName: string;
  introduction: string;
  background: string;
  email: string;
  profileLinks: { label: string; url: string }[];
  resumeUrl: string;
}
```

Note the repo style: **inline object types for small nested shapes** (`{ label: string; url: string }[]`) rather than a separate named interface. `ExhibitDescriptor`, `StopTable`, `ViewMode` should follow this. `ViewMode` is `'still' | 'moving'` (RESEARCH.md Pattern 1).

---

### `src/lib/exhibition/manifest.ts` (service, build-time content read)

**Analog:** `src/lib/projects.ts` (the whole file — 10 lines):

```typescript
import { getCollection } from 'astro:content';
import { validateProjectRecords } from './project-validation';

export async function getPublishedProjects() {
  const entries = await getCollection('projects');
  validateProjectRecords(entries.map(({ id, data }) => ({ id, ...data })));
  return entries
    .filter(({ data }) => data.published)
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
```

Conventions to copy:
- **Relative imports without extensions** (`'./project-validation'`), virtual modules by bare specifier (`'astro:content'`).
- **Inferred return type** on the async collection accessor (the only place the repo omits an explicit return type — it preserves Astro's `CollectionEntry` inference; keep doing this).
- Validation is called for its throw side-effect, then the sorted array is returned.

**Rule the planner must enforce:** `manifest.ts` must call `getPublishedProjects()` — it must **not** re-query `getCollection('projects')` itself. AGENTS.md's "one validated content source" is enforced by going through `src/lib/projects.ts`.

---

### `src/components/exhibition/ExhibitSection.astro` (component, build-time render)

**Analog A — figure/img markup:** `src/pages/projects/[...slug].astro` lines 46-53:

```astro
<div class="evidence-grid">
  {data.screenshots.map((screenshot) => (
    <figure>
      <img src={screenshot.src.src} alt={screenshot.alt} width={screenshot.src.width} height={screenshot.src.height} loading="lazy" />
      <figcaption>{screenshot.caption}</figcaption>
    </figure>
  ))}
</div>
```

The explicit `width`/`height` pass-through is load-bearing: RESEARCH.md Pattern 6 depends on images reserving space so stop offsets are final in the `rAF` after `load`. **Keep explicit `width`/`height`.** For the exhibit, swap `screenshot.src.src` for the `getImage()` result (RESEARCH.md Code Example 5) and drop `loading="lazy"` on `screenshots[0]` — it is the above-the-fold panel texture source.

**Analog B — mapping a project to a card:** `src/pages/index.astro` lines 64-71 (this is the block being *replaced* by the exhibit sections):

```astro
{projects.map((project) => (
  <article class="project-card">
    <p class="eyebrow">Exhibit {String(project.data.exhibitionOrder).padStart(2, '0')}</p>
    <h3>{project.data.title}</h3>
    <p>{project.data.summary}</p>
    <a class="text-link" href={`/projects/${project.data.slug}/`}>Read the case study <span aria-hidden="true">↗</span></a>
  </article>
))}
```

Copy from it: the `padStart(2, '0')` exhibit-index idiom, `class="eyebrow"`, `class="text-link"`, the template-literal href `` `/projects/${project.data.slug}/` `` **with trailing slash**, and the `<span aria-hidden="true">` glyph wrapper.
Change per UI-SPEC: `↗` → `→`, copy `Read the case study` → `Read case study`, `<h3>` → `<h2 class="exhibit-title">`, `<article class="project-card">` → `<section id={\`exhibit-${slug}\`} tabindex="-1" data-stop data-slug={slug}>`.

**Props pattern** (from `src/layouts/BaseLayout.astro` lines 5-13 — the repo's only `Props` interface):

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = `${profile.displayName} — Software, from idea to deployment`,
  description = profile.introduction,
} = Astro.props;
---
```

Note: `interface Props` (not `type`), destructure-with-defaults from `Astro.props`, all derived consts computed in frontmatter — never inline in the template.

---

### `src/components/exhibition/StopSection.astro` (component)

**Analog:** `src/layouts/BaseLayout.astro` line 44 for the slot idiom, plus `src/pages/index.astro` lines 75-81 for the section shape:

```astro
<main id="main" tabindex="-1"><slot /></main>
```

```astro
<section id="about" class="catalogue-section" aria-labelledby="about-title">
  <div class="section-heading"><p class="eyebrow">02 / The person</p><h2 id="about-title">About</h2></div>
  <div class="section-body">…</div>
</section>
```

Copy: `aria-labelledby` pointing at an `id`'d `<h2>`, the `.section-heading` / `.section-body` pair, the `NN / Label` eyebrow numbering, and `tabindex="-1"` on the focus target (UI-SPEC §H.3 needs `section.focus({ preventScroll: true })`, which requires `tabindex="-1"` exactly as `<main>` already has it).

---

### `src/components/exhibition/ExhibitionShell.astro` (component + client script entry)

**Analog for structure:** `src/layouts/BaseLayout.astro` lines 1-16 and 32-51 — frontmatter imports (including the side-effect `import '../styles/global.css';`), `<slot />` placement, and `class="page-frame"` wrapper.

**NO ANALOG for the `<script>` block.** `grep -rn "<script" src/` returns nothing; this phase introduces the repo's first client script. Use the Astro default (processed/bundled, type-module, hoisted, deduped):

```astro
<script>
  import { start } from '../../scripts/exhibition/controller';
  start();
</script>
```

Constraints the planner must state explicitly, since there is no precedent to copy:
- **No `is:inline`** — inline scripts are not bundled or TS-transformed, and `import('./scene')` would not be code-split.
- **No `define:vars`** — it forces `is:inline`. Pass build-time data through `data-*` attributes on the rendered DOM (the shell already renders `data-stop` / `data-slug` per §D.2) and read them in the controller.
- The relative import path is resolved from the `.astro` file's own location, so `src/scripts/exhibition/**` needs no tsconfig path alias. `tsconfig.json` extends `astro/tsconfigs/strict` with `include: ["**/*"]` — new directories are covered with no config change.

**Stacking/CSS the shell depends on** — `src/styles/global.css` line 39 and line 133:

```css
.page-frame { width: min(100% - 2 * var(--gutter), 82rem); margin-inline: auto; }
.skip-link { position: absolute; top: 1rem; left: var(--gutter); z-index: 1; … }
```

Per UI-SPEC §A.6 these become `.page-frame { position: relative; z-index: 1 }` and `.skip-link { z-index: 3 }`, and per RESEARCH.md Pitfall 5 `#exhibition { pointer-events: none }` with `auto` re-enabled on `a, button, figure, .exhibit-overlay`.

---

### `src/components/exhibition/drawings/*.astro` (static inline SVG)

**Analog:** `src/pages/index.astro` lines 18-56 — the `Fig. 01` architectural study. This is the single most important analog in the phase: UI-SPEC's entire extended palette was extracted from it.

**Wrapper pattern** (lines 18-20, 55-56):

```astro
<div class="architectural-study" aria-hidden="true">
  <div class="drawing-label"><span>Fig. 01</span><span>From a line, a possibility.</span></div>
  <svg viewBox="0 0 520 590" fill="none" focusable="false">
    …
  </svg>
  <p class="drawing-caption"><span>Study in becoming</span><span>Drawing → structure</span></p>
</div>
```

Copy exactly: `aria-hidden="true"` on the wrapper, `focusable="false"` + `fill="none"` + `viewBox` with **no** `width`/`height` (global CSS line 30 sets `svg { display: block; width: 100%; height: auto; }`), and the `.drawing-label` / `.drawing-caption` two-span flex pairs.

**Ink vocabulary to reuse** (lines 22-31, 34-38, 41-47):

```astro
<pattern id="construction-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
  <path d="M0 0V7" stroke="#8e4935" stroke-width="1" />
</pattern>
…
<g stroke="#b9b3a4" stroke-width="1">                              <!-- --construction: datum/grid -->
  <path d="M20 573 450 325…" stroke-dasharray="4 7" />             <!-- construction lines -->
  <path d="M47 39h14m-7-7v14…" stroke="#656256" />                 <!-- --registration: corner crosses -->
</g>
<g stroke="#8b877b" stroke-width="1.3" stroke-dasharray="5 5">…</g> <!-- --edge-unbuilt: drawn-only -->
<path d="…" fill="#ece6d6" stroke="#4e5144" stroke-width="1.4" />   <!-- --stone-lit + --edge -->
<path d="…" fill="#d2c9b5" … />                                     <!-- --stone-shade -->
<path d="…" fill="#e4dece" />                                       <!-- --stone-floor -->
```

The `5 5` dash on `stroke-width: 1.3` drawn-only members and `1.4` on built edges is exactly UI-SPEC §B.2's stroke table. **The per-exhibit still-view drawings must reuse these literal stroke widths, dash arrays and the 35°/7px hatch**, and add the §G.2 reflection motif (a flipped silhouette at 0.35 opacity under a 1px `--line` horizon rule).

**Important:** the shipped drawing hard-codes hex values. UI-SPEC's extended palette promotes them to custom properties in `global.css`. New drawings should use `var(--stone-lit)` etc.; the shipped `Fig. 01` may keep its literals or be migrated — the planner should decide once and apply consistently.

---

### `src/pages/index.astro` (MODIFIED — page)

**Analog:** itself, lines 1-9 (this frontmatter shape must survive the restructure):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { profile } from '../data/profile';
import { getPublishedProjects } from '../lib/projects';

const projects = await getPublishedProjects();
---

<BaseLayout>
```

**Also see** `src/pages/projects/[...slug].astro` lines 6-17 for the async-props pattern if any per-exhibit `await` (e.g. `getImage()`) must happen page-side rather than in the component:

```astro
export async function getStaticPaths() {
  const projects = await getPublishedProjects();
  return Promise.all(projects.map(async (project) => ({
    params: { slug: project.data.slug },
    props: { project, rendered: await render(project) },
  })));
}
```

`Promise.all(map(async …))` is the established idiom for awaiting per-project work — use it if `getImage()` moves to the page.

**Structural assertions that constrain the rewrite** (UI-SPEC §A.6, verified against `tests/skeleton.spec.ts` lines 40-45):
- `#projects`, `#about`, `#resume`, `#contact` stay `<section>` elements with their shipped `<h2>` text.
- Among `main section[id]`, those four ids appear in order `projects, about, resume, contact`. New ids `#entrance`, `#exhibit-*`, `#landing` are outside the filter and safe.
- Only the `.project-card` list inside `#projects` is replaced.

**Also modified in this file:** `src/pages/projects/[...slug].astro` line 56 — the return link changes from `← Back to projects` / `/#projects` to `← Back to the exhibition` / `/#exhibit-{slug}` (UI-SPEC §L.1, D-15). Existing markup:

```astro
<a class="text-link project-return" href="/#projects">← Back to projects</a>
```

---

### `src/styles/global.css` (MODIFIED — config)

**Analog:** itself. The cascade-layer declaration at line 1 is the extension point:

```css
@layer base, layout, details;
```

**Token block to extend** (lines 3-21):

```css
@layer base {
  :root {
    color-scheme: light;
    --paper: #f4f0e6;
    --ink: #292e29;
    --muted: #66665a;
    --line: #c5c0b2;
    --rust: #8e4935;
    --sage: #e3e5d8;
    --serif: 'Iowan Old Style', …;
    --sans: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    --mono: 'Courier New', Courier, monospace;
    --gutter: clamp(1.25rem, 5vw, 5rem);
    font-family: var(--sans);
    color: var(--ink);
    background: var(--paper);
    font-synthesis: none;
  }
```

Add the UI-SPEC extended palette (`--stone-lit`, `--stone-shade`, `--stone-deep`, `--stone-floor`, `--edge`, `--edge-unbuilt`, `--construction`, `--registration`, `--sun`, `--horizon`, `--water`) **here**, in the same `:root` block, kebab-case, hex lowercase, one declaration per line.

**Do not touch — `portfolio.spec.ts:112` asserts on it** (lines 32-35):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
  html { scroll-behavior: auto !important; }
}
```

RESEARCH.md "Don't Hand-Roll" is explicit: do not duplicate, weaken, or add a second reduced-motion block.

**Breakpoint convention** (lines 105, 120) — the exhibition layer must reuse these two and introduce no third:

```css
@media (max-width: 48rem) { … }
@media (max-width: 30rem) { … }
```

**Touch-target precedent** (line 46, 131 in `@layer details`) — the 44px floor is already encoded; exhibition arrows raise it to 56/64:

```css
.primary-nav a { display: inline-flex; align-items: center; min-height: 44px; … }
.text-link { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 0.4rem 1.1rem; max-width: 100%; min-height: 44px; font-size: 0.875rem; }
```

**New layer:** add `exhibition` to the `@layer` list at line 1 (after `details`, so it wins ties) rather than scattering exhibition rules across `base`/`layout`/`details`.

---

### `src/lib/project-schema.ts` (MODIFIED — model/validation)

**Analog:** itself (whole file):

```typescript
import { z } from 'astro/zod';

export const nonBlank = z.string().trim().min(1);

export const contractSchema = z.object({
  id: z.enum(['website', 'manual-planner', 'ai-mvp']),
  title: nonBlank,
  description: nonBlank,
  stack: z.array(nonBlank).min(1),
  hosting: nonBlank,
});
```

UI-SPEC §Typography requires `summary: nonBlank.max(200)`. Note `summary` currently lives in `src/content.config.ts` line 10 (`summary: nonBlank`), not in this file — the planner must edit `content.config.ts`, or move the field into a shared `summarySchema` export here. Either is consistent with the existing split (`project-schema.ts` holds reusable pieces; `content.config.ts` composes them). **`z` comes from `astro/zod`, never from a `zod` dependency.**

---

### `src/scripts/exhibition/**` (NO IN-REPO ANALOG)

There is no existing client-side TypeScript. Source of truth for these files is RESEARCH.md:

| File | Source pattern |
|------|----------------|
| `policy.ts` | RESEARCH.md Pattern 1 (verbatim — `readStoredChoice` / `writeChoice` / `reduceQuery` / `motionPermitted`) |
| `scroll.ts` | RESEARCH.md Pattern 2 (`measureStops`, `progressFor`) |
| `controller.ts` | RESEARCH.md Pattern 1 (gate), 2 (rAF-coalesced scroll), 4 (`goTo`), 5 (tap FSM), 6 (scroll restoration) |
| `scene/index.ts` | RESEARCH.md Code Example 4 (demand rendering) + Pitfalls 1, 2, 4 |
| `scene/ink.ts` | `Line2`/`LineGeometry`/`LineMaterial`; Pitfalls 3 and 4 |
| `scene/reflection.ts` | `three/addons/objects/Reflector.js`; Pitfalls 1 and 2 |

**Style conventions to carry over from `src/lib/**` (the only TS in the repo):** named exports only, explicit return types on exported functions, `interface` for object shapes, no classes, no default exports, two-space indent, single quotes, extensionless relative imports.

**Enforceable boundary the planner should ship as a check:** `three` may be imported only under `src/scripts/exhibition/scene/**`.

```bash
grep -rn "from 'three" src --include='*.ts' | grep -v "scripts/exhibition/scene/"   # must be empty
```

This is a natural addition to `scripts/verify-built-content.mjs` or a dedicated `npm run check` step.

---

### `tests/exhibition-travel.spec.ts` / `exhibition-navigation.spec.ts` / `exhibition-resilience.spec.ts` (new, e2e)

**Analog A — viewport-loop + target-size assertions:** `tests/skeleton.spec.ts` lines 59-72:

```typescript
test('profile and navigation reflow at narrow widths and enlarged text', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const navigation = page.getByRole('navigation', { name: 'Primary' });
    for (const name of destinations) {
      const link = navigation.getByRole('link', { name, exact: true });
      await expect(link).toBeInViewport();
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
```

Copy for UI-SPEC §K hook #5 (56×56 / 64×64 arrow targets at both breakpoints) and the no-horizontal-overflow guard. **Caveat from RESEARCH.md Pitfall 6:** framing tests must use `devices['iPhone 12 Pro']` (390 × 664 small viewport), not `setViewportSize({width: 390, height: 844})`, and must compute the expected panel width from the measured aspect rather than a hard-coded band.

**Analog B — isolated-context options (reduced motion, no-JS, custom viewport):** `tests/portfolio.spec.ts` lines 23-25 and 96-99:

```typescript
test('direct route and navigation work with JavaScript disabled at 320px', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  …
  await context.close();
});
```

```typescript
const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 320, height: 900 } });
```

Copy exactly: the `{ browser }` fixture (not `{ page }`) whenever context options are needed, and the mandatory `await context.close()` at the end. The single `chromium` project in `playwright.config.ts` has no per-project reduced-motion or device variants, so **all device/motion variation is done per-test via `browser.newContext`** — do not add Playwright projects.

**Analog C — in-page evaluation for computed state:** `tests/portfolio.spec.ts` lines 107-112:

```typescript
const motion = await page.evaluate(() => ({
  scroll: getComputedStyle(document.documentElement).scrollBehavior,
  animation: getComputedStyle(document.body).animationName,
  transition: getComputedStyle(document.body).transitionDuration,
}));
expect(motion).toEqual({ scroll: 'auto', animation: 'none', transition: '0s' });
```

The "gather an object in one `evaluate`, assert with `toEqual`" idiom is the house style — reuse it for the frame-count assertion (§K hook #15) and the `reflectionCamera.layers.mask === 4` assertion (§K hook #8). `page.evaluateAll` on a locator (lines 19, 28-37, 43-45) is the house style for per-element measurement.

**Analog D — axe:** `tests/portfolio.spec.ts` lines 1-2, 88-94:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('axe reports no violations on home and project pages', async ({ page }) => {
  for (const path of ['/', projectPath]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, `${path} accessibility violations`).toEqual([]);
  }
});
```

This test needs **no change** but will now exercise the restructured home route. The canvas being `aria-hidden="true"` (and not `inert`) must keep it clean.

**File-level conventions** (from both spec files): `import { expect, test } from '@playwright/test';` (named, alphabetical), module-scope consts for shared paths/strings (`const projectPath = '/projects/featured-client/';`), lowercase sentence-style test titles describing visitor outcomes, and relative `page.goto('/')` relying on `baseURL` in `playwright.config.ts`.

---

### `tests/exhibition-stops.test.ts` (new, unit)

**Analog:** `tests/project-validation.test.ts` lines 1-20:

```typescript
// Node's built-in test runner is executed directly by Node 24; Astro's checker does not load Node globals.
// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { validateProjectRecords } from '../src/lib/project-validation.ts';

const valid = (overrides: Record<string, unknown> = {}) => ({ … });

test('accepts a complete published project and an incomplete draft', () => {
  assert.doesNotThrow(() => validateProjectRecords([ … ]));
});
```

Non-obvious conventions that **must** be copied or the file will fail `astro check`:
- The two `@ts-expect-error` comments with that exact justification above each `node:*` import.
- **Imports of source files carry the `.ts` extension** (`'../src/lib/project-validation.ts'`) — this file is run by `node --experimental-strip-types`, unlike every other TS file in the repo.
- `node:assert/strict` + `assert.throws(fn, /regex/)` for error assertions; factory helpers (`const valid = (overrides = {}) => ({...})`) for fixtures.

This is exactly why `src/lib/exhibition/stops.ts` must have zero imports: `node --experimental-strip-types` cannot resolve `astro:content`.

---

### `tests/portfolio.spec.ts` (MODIFIED — 6 assertions per UI-SPEC §L.1)

Current text at each line (verified today — line numbers still match the spec):

```typescript
// line 11
await expect(page.getByRole('link', { name: 'Read the case study' })).toBeVisible();
// line 43-45
await expect(page.getByRole('link', { name: /Back to projects/ })).toHaveAttribute('href', '/#projects');
await page.getByRole('link', { name: /Back to projects/ }).click();
await expect(page).toHaveURL(/\/#projects$/);
// line 103, 105
await page.getByRole('link', { name: 'Read the case study' }).click();
await page.getByRole('link', { name: /Back to projects/ }).click();
```

Required changes: `'Read the case study'` → `'Read case study →'`; `/Back to projects/` → `/Back to the exhibition/`; `'/#projects'` → `'/#exhibit-featured-client'`; `/\/#projects$/` → `/\/#exhibit-featured-client$/`.

**Must keep passing unchanged** — lines 17, 18, 20 (three `<figure>`/`img`/`figcaption` on the project route), 46, 102, 106 (`#projects` visible), 112 (reduced-motion computed styles). Strengthen, never weaken.

---

### `package.json` (MODIFIED — `check` script)

**Analog:** itself. CI (`.github/workflows/pages.yml`) runs only `npm run check`, and that script **enumerates spec files by name** — new tests are silently skipped in CI unless added here:

```json
"check": "astro check && npm run build && node scripts/verify-built-content.mjs && node --experimental-strip-types --test tests/project-validation.test.ts && npm run test:e2e -- tests/skeleton.spec.ts tests/portfolio.spec.ts"
```

Add `tests/exhibition-stops.test.ts` to the `--test` list and the three `tests/exhibition-*.spec.ts` files to the `test:e2e` list. Order of the `&&` chain (typecheck → build → artifact verify → unit → e2e) is the established gate order; preserve it.

---

### `scripts/verify-built-content.mjs` (MODIFIED — build gate)

**Analog:** itself, lines 26-43:

```javascript
const textFiles = files.filter((file) => /\.(html|json|txt|xml|js|css)$/.test(file));
for (const file of textFiles) {
  const text = await readFile(file, 'utf8');
  const token = forbiddenTokens.find((candidate) => text.includes(candidate));
  if (token) throw new Error(`Forbidden built-content token "${token}" found in ${relative(root, file)}`);
}
…
for (const identifier of ['website', 'manual-planner', 'ai-mvp', 'castlew640@gmail.com']) {
  if (!html.includes(identifier) && !project.includes(identifier)) throw new Error(`Missing required content identifier: ${identifier}`);
}
```

Plain `.mjs` (no TypeScript), `node:` prefixed imports, top-level `await`, `throw new Error` on failure, one `console.log` summary at the end. Natural Phase 2 additions using this exact shape: assert `dist/index.html` contains `exhibit-featured-client` and `Read case study`, and assert the built scene chunk is emitted as a **separate** `_astro/*.js` file that `index.html` does not eagerly `<script>`-reference (the §I / §G.1 lazy-chunk guarantee).

---

## Shared Patterns

### Astro frontmatter contract
**Source:** `src/layouts/BaseLayout.astro` lines 1-16
**Apply to:** every new `.astro` file

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { profile } from '../data/profile';
import '../styles/global.css';

interface Props { title?: string; description?: string; }

const { title = `…`, description = profile.introduction } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
```

Rules: relative extensionless imports for TS, **with** `.astro` extension for components; `interface Props`; destructure-with-defaults; all computation in frontmatter, none in the template beyond `.map()` and template literals.

### Accessible section markup
**Source:** `src/pages/index.astro` lines 61-62, 75-76; `src/layouts/BaseLayout.astro` lines 33, 44
**Apply to:** `StopSection.astro`, `ExhibitSection.astro`, restructured `index.astro`

```astro
<section id="projects" class="catalogue-section" aria-labelledby="projects-title">
  <div class="section-heading"><p class="eyebrow">01 / The work</p><h2 id="projects-title">Projects</h2></div>
```

Every landmark section: stable `id`, `aria-labelledby` → `id`'d heading, `.eyebrow` numbering. Decorative glyphs always `<span aria-hidden="true">`. Focus targets carry `tabindex="-1"`.

### Content access
**Source:** `src/lib/projects.ts` (whole file), used identically at `src/pages/index.astro:6` and `src/pages/projects/[...slug].astro:7`
**Apply to:** `manifest.ts`, `ExhibitionShell.astro`, restructured `index.astro`

```typescript
const projects = await getPublishedProjects();   // already filtered to published, sorted by exhibitionOrder
```

Never call `getCollection('projects')` directly outside `src/lib/projects.ts`. `exhibitionOrder` sorting is already done — do not re-sort.

### Image handling
**Source:** `src/pages/projects/[...slug].astro` line 49
**Apply to:** `ExhibitSection.astro`

```astro
<img src={screenshot.src.src} alt={screenshot.alt} width={screenshot.src.width} height={screenshot.src.height} loading="lazy" />
```

`screenshot.src` is an `ImageMetadata` from `image()` in `src/content.config.ts` line 15. Phase 2 adds `getImage({ src: shot.src, width: 1600, format: 'webp' })` from `astro:assets` so one hashed URL serves both the `<figure>` and the panel texture; **explicit `width`/`height` must survive** so layout offsets are stable. Assets stay colocated in `src/content/projects/{slug}/` — do not move anything to `public/` (only the resume PDF lives there).

### Error/failure handling
**Source:** `src/lib/project-validation.ts` lines 14-21, 27-45
**Apply to:** `manifest.ts`, `stops.ts`

```typescript
function requireHttpsUrl(value: string, label: string): void {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname) throw new Error();
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`);
  }
}
…
throw new Error(`Published project ${project.slug} requires a title and summary`);
```

Build-time code **throws with a template-literal message naming the offending record** — it never returns null or logs. Client-side code inverts this (RESEARCH.md Pattern 1): `try { … } catch { /* degrade to still view */ }`, never throw, never block navigation.

### Test authoring
**Source:** `tests/portfolio.spec.ts` lines 1-6; `tests/skeleton.spec.ts` lines 1-12
**Apply to:** all new specs

```typescript
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const projectPath = '/projects/featured-client/';
const contract = 'PROFILE_NAV_CONTRACT_MISSING';   // skeleton.spec.ts: failure-message constant
```

Role-based locators (`getByRole('link', { name })`) over CSS selectors; `page.goto('/')` relative to `baseURL`; `browser.newContext(...)` + `context.close()` for any test needing device/motion options; named assertion-failure messages for contract-level checks.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/scripts/exhibition/controller.ts` | controller (client) | event-driven | Repo has zero client-side JS; no event-listener, FSM, or lifecycle precedent exists. Use RESEARCH.md Patterns 1, 2, 4, 5, 6 as the source. |
| `src/scripts/exhibition/policy.ts` | utility (client) | event-driven | No `matchMedia`, `localStorage`, or browser-API usage anywhere in the repo. Use RESEARCH.md Pattern 1 verbatim. |
| `src/scripts/exhibition/scene/index.ts` | service (client, lazy) | event-driven | No WebGL, no dynamic `import()`, no renderer lifecycle precedent. RESEARCH.md Code Example 4 + Pitfalls 1/2/4 are the only guidance. |
| `src/scripts/exhibition/scene/architecture.ts` | service (client) | transform | No 3D geometry authoring exists. UI-SPEC §D.1 dimensions + §B.3 built/drawn table are the specification. |
| `src/scripts/exhibition/scene/reflection.ts` | service (client) | transform | No reflection/render-target code. `three/addons/objects/Reflector.js` + RESEARCH.md Pitfalls 1 and 2 (layer-2 lights, `getReflectionCamera(camera).layers.set(2)`). |
| `src/scripts/exhibition/scene/quality.ts` | config (client) | event-driven | No runtime perf measurement or DPR handling exists. UI-SPEC §I quality ladder. |
| `src/components/exhibition/ExhibitionShell.astro` `<script>` block | component (script host) | — | **Partial:** the `.astro` wrapper has an analog (`BaseLayout.astro`); the `<script>` block does not. First client script in the repo — explicitly forbid `is:inline` and `define:vars`. |

---

## Notable Conflicts the Planner Must Resolve

1. **UI-SPEC §Design System** says "one React Three Fiber island (`src/components/exhibition/`)". The locked decision is plain `three` + vanilla TS. Treat "island" as "Astro `<script>`-bundled module" everywhere it appears in UI-SPEC (§D.2 "the island sets `data-scene="active"`", §E.3 "rendered by the island", §G.3 "injected by the island"). No `client:*` directive, no `@astrojs/react`, no change to `astro.config.ts`.
2. **RESEARCH.md proposes `src/scripts/exhibition/**`** while UI-SPEC §Design System points at `src/components/exhibition/`. Both are new; the research split (`components/` for `.astro`, `scripts/` for client TS, `lib/` for pure build-time TS) matches the shipped `src/lib` vs `src/components`-equivalent split and should win. `tsconfig.json` (`include: ["**/*"]`) covers both with no change.
3. **`summary` max-length** lives in `src/content.config.ts` line 10, not `src/lib/project-schema.ts`. UI-SPEC's `summary: nonBlank.max(200)` addition must be applied where the field is actually declared.
4. **`package.json` `check` enumerates test files by name.** New tests added without editing it will not run in CI, so SHIP-01's "a failing check prevents publication" would silently not cover Phase 2.

---

## Metadata

**Analog search scope:** `src/` (13 files), `tests/` (3 files), `scripts/`, `.github/workflows/`, root configs
**Files scanned:** 22 (full read of every `.astro`, `.ts`, `.css`, `.mjs` and config in the repo — the codebase is small enough that exhaustive reading was cheaper than sampling)
**Pattern extraction date:** 2026-09-20
