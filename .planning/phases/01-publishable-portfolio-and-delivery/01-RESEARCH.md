# Phase 1: Publishable Portfolio and Delivery - Research

**Researched:** 2026-09-19
**Domain:** Static Astro portfolio, validated local content, accessible case-study delivery, and GitHub Pages CI/CD
**Confidence:** MEDIUM — current official documentation and registry metadata were checked; publication content and the remote repository still require human-supplied inputs/setup.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### First impression and layout
- **D-01:** Use a dreamlike exhibition-catalogue direction: warm ivory, expressive typography, spacious project imagery, and subtle surreal details. The user explicitly wants an original, bespoke design and rejects a copy-and-paste internet template.
- **D-02:** The unifying idea is **plans becoming places**. Architectural drawings and construction geometry acquire structure, detail, and purpose. Express the passage of time through things taking shape: growth, discovery, and ideas becoming working software.
- **D-03:** Integrate William's name and short introduction into deliberate spaces in a custom architectural composition. Construction lines can guide the eye toward the featured work. The opening should introduce the person within the drawing.
- **D-04:** Keep Projects, About, Resume, and Contact directly accessible. The visual metaphor must support readable content and immediate access to evidence. Establish it through the Phase 1 page composition without making the Phase 2 scene a prerequisite.

### Client case-study story and evidence
- **D-05:** Keep one featured client case study with three clearly distinguished paid contracts: initial website, manual Wi-Fi planner, and AI planner MVP. Do not imply continuous employment or merge the manual algorithm and limited AI demo into one production product.
- **D-06:** William confirms he was the sole developer and coded the entire work across those contracts. Describe his individual contribution directly.
- **D-07:** Lead with both end-to-end delivery and understanding the client's underlying goal. Show how William applied technical judgment to the client's objectives, budget, and preferences.
- **D-08:** The first and second contracts used **Supabase and Vercel**. William recommended this setup to match expected modest traffic and reduce billed setup effort and cost. Describe the reasoning; no measured savings, actual traffic statistics, or verified capacity claims were supplied.
- **D-09:** The third contract, the AI MVP, used **AWS Lightsail** to meet the client's AWS preference. More predictable billing was William's selection rationale. This is not a guarantee that costs remain fixed regardless of usage.
- **D-10:** William understood the AI MVP's purpose as demonstrating the product idea to potential customers, making it easy to understand, and including visible AI interactions. Present the delivered demo and its limited scope accurately; do not claim a completed production AI planner or verified commercial outcomes.
- **D-11:** Use permitted screenshots, explanatory captions, and confirmed live links as public evidence. William can produce screenshots, but none were supplied during this discussion. Client-owned source code must remain private.

### Identity, resume, and contact
- **D-12:** Public display name: **William Castle**. Keep initial role positioning broad; include his computer science graduate background in About.
- **D-13:** Use the selected direct, work-focused introduction: **"I build software around what people are trying to achieve, from the first idea to deployment."**
- **D-14:** Make email the primary contact action, with LinkedIn and/or GitHub profile links alongside it. The exact email address and selected profile URLs remain to be supplied.
- **D-15:** A PDF resume and an online resume already exist. William is unsure whether updates are needed and explicitly deferred review and selection of the version to publish. Continue planning and implementation preparation; obtain the actual chosen resume before claiming the public resume requirement is complete.

### Repository and publishing
- **D-16:** Use a **public** portfolio repository owned by **castlew640**, allowing employers to inspect this site's code and delivery work.
- **D-17:** Selected repository: **castlew640/castlew640.github.io**. Selected initial production address: **https://castlew640.github.io**. Check whether the account site/repository already exists before setup, and preserve any existing work. Availability was not checked during this discussion.
- **D-18:** Use **GitHub Pages with GitHub Actions**. A custom domain is not part of the initial choice; no hosting purchase was selected.
- **D-19:** Preserve the roadmap's delivery contract: automated content/type/build and focused visitor-journey checks; successful default-branch updates deploy the exact checked artifact; failed checks leave the last working release available. This discussion selected destinations but did not create a remote, configure deployment, or publish a site.

### Remaining publication inputs
These are content/setup inputs, not blockers to planning or reasons to invent public values:
- Chosen actual resume PDF/path or online URL; resume review remains deferred at the user's request.
- Exact public email address and desired LinkedIn/GitHub profile URLs.
- Permitted screenshots and the confirmed live client URL.
- Public client naming and any dates used in the story.
- Actual blueprint file extension; exact names of the three AI demo scenarios if the copy names them; any additional technical specifics or outcome claims. Omit uncertain details until confirmed.
- Repository/account-site availability and production setup verification.

The public name, introduction, sole-developer role, contract-to-host mapping, GitHub owner/visibility, host, and target URL are now decided. Where earlier project/research notes leave these open or loosely associate the initial website with Lightsail, **this discussion's confirmed decisions take precedence**.

### the agent's Discretion
No additional user-facing choices were explicitly delegated during this discussion. Existing authorization for routine implementation choices in PROJECT.md still applies. Exact fonts, colors, architectural forms, spacing, page components, screenshot layouts, and package versions remain work for UI design, research, and planning within these decisions. Do not treat illustrative visual examples as a finalized art specification.

### Deferred Ideas (OUT OF SCOPE)
- Resume review and selection of the final public version are explicitly deferred. Existing PDF and online versions are available to the user; neither was provided here. This is a pending Phase 1 publication input, not removal of the resume requirement.
- Spatial realization of the architectural growth/time concept belongs to the already-planned Phase 2 corridor.
- No new capabilities were added to the roadmap.
</user_constraints>

## Summary

Phase 1 should be planned as a vertical slice: a static Astro 7 site that starts with William's readable profile and direct navigation, renders one real client case study from one build-time Markdown collection, then adds content/asset checks, focused Playwright journeys, and deployment of that exact checked `dist/` artifact. React, React Three Fiber, Three.js, and the scroll corridor do not belong in this phase. [VERIFIED: .planning/ROADMAP.md] [CITED: https://docs.astro.build/en/guides/content-collections/]

Astro's current content layer provides the core primitives needed here: `src/content.config.ts`, the `glob()` loader, Zod 4 schemas through `astro/zod`, `getCollection()` filtering, `render()`, and static route generation through `getStaticPaths()`. The collection should include an explicit publication state, stable slug, summary, ordered contract data, external evidence URL, and screenshots whose `src` uses the schema `image()` helper; one shared `getPublishedProjects()` query must feed the home index, routes, and future exhibit manifest so drafts cannot leak through a forgotten unfiltered query. [CITED: https://docs.astro.build/en/guides/content-collections/] [CITED: https://docs.astro.build/en/reference/modules/astro-content/]

The selected GitHub account exists, but a read-only GitHub API check on 2026-09-19 found no repository named `castlew640/castlew640.github.io`; the local repository also has no configured remote. Recheck immediately before setup, then create/configure the public account-site repository without a `base` path, set `site: 'https://castlew640.github.io'`, select GitHub Actions as the Pages source, and deploy only from a job that `needs` the successful build/check job. [VERIFIED: GitHub API via `gh api users/castlew640` and `gh repo view castlew640/castlew640.github.io`] [CITED: https://docs.astro.build/en/guides/deploy/github/] [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]

**Primary recommendation:** Plan four deliverable slices—foundation/profile, validated case study, accessibility/browser checks, and checked Pages publication—with human input gates before any placeholder resume/contact/client evidence is treated as complete. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Profile, About, Projects, Resume, Contact navigation | CDN / Static HTML | Browser / Client | All essential content and links must arrive in initial HTML and work without JavaScript. [VERIFIED: .planning/REQUIREMENTS.md] |
| Case-study authoring and contract distinctions | Build tooling / Content | CDN / Static HTML | A validated Markdown entry is transformed at build time into one canonical article. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Draft exclusion and stable project routes | Build tooling / Content | CDN / Static HTML | One filtered query selects publishable entries before static route and list generation. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Screenshot validation and optimization | Build tooling / Assets | CDN / Static assets | Content-schema `image()` resolves local images, and Astro's asset pipeline emits optimized static media. [CITED: https://docs.astro.build/en/reference/modules/astro-content/] |
| Type/content/build/browser checks | GitHub Actions runner | Build tooling | CI installs from the lockfile and runs the same commands used locally before artifact upload. [CITED: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs] |
| Public deployment | GitHub Pages deployment service | GitHub Actions runner | A dependent deployment job publishes the previously uploaded Pages artifact. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |
| External client link | Browser / Client | External client host | The portfolio provides an ordinary link; the article remains complete if the destination is unavailable. [VERIFIED: .planning/REQUIREMENTS.md] |

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| PROF-01 | A visitor can read the owner's confirmed name, introduction, and recent computer science graduate background without implying an unchosen job specialization. | Static semantic profile/About content with context-locked copy. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md] |
| PROF-02 | A visitor can open or download the owner's actual resume through a clearly labeled link. | Put the chosen PDF in `public/` or use the chosen online URL; gate completion on the actual supplied resume. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| PROF-03 | A visitor can reach an owner-supplied contact destination through a clearly labeled link. | Use an ordinary labeled `mailto:` link plus supplied profiles; do not invent destinations. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md] |
| WORK-01 | A visitor can read one featured client case study distinguishing the website, manual Wi-Fi planner, and AI planner MVP as three contracts, with the owner's contribution and confirmed constraints/results for each. | Validate three explicit contract records and render them as three labeled sections. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md] |
| WORK-02 | A visitor can inspect permitted client screenshots with readable captions and appropriate text alternatives. | Pair every schema-validated local image with required `alt` and `caption` fields and render `<figure>`. [CITED: https://docs.astro.build/en/reference/modules/astro-content/] |
| WORK-03 | A visitor can follow the confirmed live client link from the case study, with the case study remaining useful if that external site is unavailable. | Make the evidence link additive; keep all explanatory content and screenshots local. [VERIFIED: .planning/REQUIREMENTS.md] |
| WORK-04 | A visitor can open, refresh, and share a canonical HTML URL for each published project, with a descriptive page title and summary. | Use static `getStaticPaths()`, `site`, canonical metadata, and direct-route browser checks. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| NAV-01 | A visitor can jump directly to Projects, About, Resume, and Contact without traversing the corridor or waiting for its assets. | Use visible semantic anchor links in the static header and keep Phase 2 code absent. [VERIFIED: .planning/REQUIREMENTS.md] |
| ACCESS-01 | A visitor can read the introduction and project content and use resume/contact links from the initial HTML when JavaScript or 3D is unavailable. | Astro static output plus a Playwright project with `javaScriptEnabled: false`. [CITED: https://playwright.dev/docs/api/class-testoptions] |
| ACCESS-02 | A keyboard visitor can operate every control and link with logical focus order, visible focus, meaningful labels, and no focus trap. | Native links, DOM order, durable `:focus-visible`, keyboard journey, and axe scan. [CITED: https://www.w3.org/TR/WCAG22/] |
| ACCESS-03 | A visitor can read and operate the portfolio at narrow mobile widths and enlarged text/zoom with legible contrast, reflowing content, and unobscured controls. | Test 320 CSS-pixel reflow equivalent, text spacing overrides, zoom, contrast, and focus obscuring; automation supplements manual inspection. [CITED: https://www.w3.org/TR/WCAG22/] |
| GROW-02 | The owner receives build-time feedback for invalid project metadata, duplicate route identifiers, and missing referenced local assets before publication. | Zod schema, Astro duplicate-slug errors, `image()` resolution, and negative fixture checks. [CITED: https://docs.astro.build/en/reference/errors/invalid-content-entry-data-error/] [CITED: https://docs.astro.build/en/reference/errors/duplicate-content-entry-slug-error/] |
| GROW-03 | The owner can keep draft projects excluded from public pages, indexes, and the serialized exhibition content. | Central published-only query plus `dist/` assertions that a known draft ID/title/route is absent. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| SHIP-01 | The owner receives automated content/type/build checks and focused visitor-journey checks for proposed changes, with checks expanding as scene capabilities are added. | `astro check`, production build, Playwright routes/no-JS/keyboard/mobile/axe checks on built output. [CITED: https://docs.astro.build/en/guides/typescript/] [CITED: https://playwright.dev/docs/test-webserver] |
| SHIP-02 | A successful default-branch update automatically deploys the exact checked artifact to the chosen public host; failed checks preserve the last successful release. | Upload `dist/` only after all checks, then deploy it from a dependent GitHub Pages job; never rebuild in deploy. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |

</phase_requirements>

## Project Constraints (from AGENTS.md)

- Prioritize credible work and employer contact; visual novelty must support the hiring goal. [VERIFIED: AGENTS.md]
- Every visitor action must remain one-handed; no required simultaneous or chorded controls. [VERIFIED: AGENTS.md]
- Launch a useful version soon and permit iteration; a large initial content collection is not a prerequisite. [VERIFIED: AGENTS.md]
- Publish screenshots, descriptions, and live links only; never include private client source code. [VERIFIED: AGENTS.md]
- Keep the three contracts, manual planner, and limited AI MVP accurate and distinct; confirm uncertain claims before publication. [VERIFIED: AGENTS.md]
- Content updates must be repeatable and automated rather than rebuilding pages by hand. [VERIFIED: AGENTS.md]
- Use one validated content source for static routes and exhibit metadata; preserve ordinary HTML access and rendering-failure resilience. [VERIFIED: AGENTS.md]
- Implementation edits must later run through a GSD execution workflow; this research artifact is being produced inside `$gsd-plan-phase`. [VERIFIED: AGENTS.md]
- No project-defined skills were found in `.codex/skills/` or `.agents/skills/`. [VERIFIED: filesystem inspection]

## Standard Stack

### Core

| Library / Service | Verified version or policy | Purpose | Why standard here |
|-------------------|----------------------------|---------|-------------------|
| `astro` [WARNING: legitimacy seam flagged the latest release as suspicious only because it was published recently; planner must add a human verification checkpoint before install.] | 7.3.3, published 2026-09-16 | Static pages, layouts, routing, Markdown content layer, assets | Current official docs cover the exact static/content/Pages workflow required. [CITED: https://docs.astro.build/en/guides/content-collections/] [CITED: https://www.npmjs.com/package/astro] |
| TypeScript | 6.0.3, published 2026-04-16 | Strict project and content contracts | This is the newest checked 6.x release accepted by `@astrojs/check@0.9.10` (`^5 || ^6`); TypeScript 7.0.2 is current but outside that peer range. [VERIFIED: npm registry] [CITED: https://docs.astro.build/en/guides/typescript/] |
| Astro content collections + `astro/zod` | Built into Astro 7.3.3 | Markdown loading, Zod 4 validation, typed queries, static routes | No separate Zod dependency is needed for this phase; Astro re-exports the supported Zod API. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| GitHub Pages + GitHub Actions | Managed service; account-site root URL | Static hosting and checked default-branch publication | This is the locked host; official Pages workflows accept a build artifact and deploy from a dependent job. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |

### Supporting

| Library | Verified version | Purpose | When to use |
|---------|------------------|---------|-------------|
| `@astrojs/check` | 0.9.10, published 2026-07-27 | `.astro` diagnostics and TypeScript checks | Run before every production build in CI. [VERIFIED: npm registry] [CITED: https://docs.astro.build/en/guides/typescript/] |
| `@playwright/test` [WARNING: legitimacy seam flagged the latest release as suspicious only because it was recently published; planner must add a human verification checkpoint before install.] | 1.63.0, published 2026-09-04 | Focused built-output visitor journeys | Test direct routes, no-JS, keyboard, links/assets, and narrow viewport. [CITED: https://playwright.dev/docs/test-webserver] [CITED: https://www.npmjs.com/package/@playwright/test] |
| `@axe-core/playwright` | 4.13.0, published 2026-08-11 | Automated accessibility scan inside Playwright | Run on home and case-study pages, while retaining manual checks. [VERIFIED: npm registry] [CITED: https://playwright.dev/docs/accessibility-testing] |
| Node.js | 24.14.1 available locally; Astro requires Node `>=22.12.0` | Build runtime | Pin Node 24 in project metadata and CI to match the available LTS-line runtime. [VERIFIED: local environment and npm registry] |

### Alternatives Considered

The user has already locked Astro/static output and GitHub Pages, so this phase must not reopen Vite SPA, Cloudflare, Vercel, or a CMS as competing choices. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

React, `@astrojs/react`, Three.js, and React Three Fiber are deferred to Phase 2; installing them now adds transfer/build surface without satisfying any Phase 1 requirement. [VERIFIED: .planning/ROADMAP.md]

**Installation (after required human package-verification checkpoint):**

```bash
npm install astro@7.3.3
npm install --save-dev typescript@6.0.3 @astrojs/check@0.9.10 @playwright/test@1.63.0 @axe-core/playwright@4.13.0
npx playwright install --with-deps chromium
```

Exact pins were registry-checked on 2026-09-19; commit `package-lock.json` and use `npm ci` in CI. [VERIFIED: npm registry] [CITED: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs]

## Package Legitimacy Audit

| Package | Registry | Age / latest publication | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|--------------------------|-----------|-------------|---------|-------------|
| `astro` | npm | Established project; latest 2026-09-16 | 4,183,408/week | `github.com/withastro/astro` | SUS (`too-new`) | Flagged — planner must add `checkpoint:human-verify` before install. [CITED: https://docs.astro.build/] |
| `@astrojs/check` | npm | Latest 2026-07-27 | 2,365,487/week | `github.com/withastro/astro` | OK | Approved. [VERIFIED: npm registry] |
| `typescript` | npm | Established project; selected 6.0.3 published 2026-04-16 | 203,317,042/week | `github.com/microsoft/TypeScript` | OK | Approved; pin 6.0.3 for `@astrojs/check` peer compatibility. [VERIFIED: npm registry] |
| `@playwright/test` | npm | Established project; latest 2026-09-04 | 44,909,641/week | `github.com/microsoft/playwright` | SUS (`too-new`) | Flagged — planner must add `checkpoint:human-verify` before install. [CITED: https://playwright.dev/docs/intro] |
| `@axe-core/playwright` | npm | Latest 2026-08-11 | 7,267,599/week | `github.com/dequelabs/axe-core-npm` | OK | Approved. [VERIFIED: npm registry] |

No package exposed a registry `postinstall` script in the checked metadata. [VERIFIED: npm registry]

**Packages removed due to SLOP verdict:** none. [VERIFIED: package-legitimacy seam]

**Packages flagged as suspicious (SUS):** `astro`, `@playwright/test`; both are confirmed by official documentation, but the mandatory seam conservatively flagged their recent latest releases. The planner must insert a human verification checkpoint before installation. [VERIFIED: package-legitimacy seam] [CITED: https://docs.astro.build/] [CITED: https://playwright.dev/docs/intro]

## Architecture Patterns

### System Architecture Diagram

```text
Owner-supplied profile + resume/contact + approved project Markdown/assets
                                  |
                    schema + publication validation
                 invalid / duplicate / missing? --yes--> fail check
                                  |
                                 no
                                  v
                   getPublishedProjects() boundary
                       |                    |
                       v                    v
                 home/index HTML     /projects/{slug}/ HTML
                       |                    |
                       +--------- dist/ ---+
                                  |
             Playwright built-output journeys + axe scan
                       fail ------+------ pass
                                            |
                              upload immutable Pages artifact
                                            |
                                  deploy-pages (main only)
                                            |
                               https://castlew640.github.io
```

This flow keeps publication decisions at build time and makes the deploy job a consumer—not a rebuilder—of the artifact that passed checks. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]

### Recommended Project Structure

```text
src/
├── content.config.ts              # Projects schema: metadata, contracts, evidence, screenshots
├── content/projects/              # One Markdown file per case study/draft
├── data/profile.ts                # Typed confirmed profile and contact/resume destinations
├── lib/projects.ts                # getPublishedProjects(), ordering, validation boundary
├── layouts/BaseLayout.astro       # Metadata, skip link, persistent navigation, footer
├── components/
│   ├── SiteHeader.astro
│   ├── ProjectCard.astro
│   ├── ContractSection.astro
│   └── ScreenshotFigure.astro
├── pages/
│   ├── index.astro
│   └── projects/[...id].astro
└── styles/global.css              # Tokens, focus, reflow, catalogue composition
public/
└── resume/                        # Actual selected PDF only
tests/
├── portfolio.spec.ts              # Core navigation/direct route/assets
├── no-js.spec.ts                  # Initial-HTML journey
└── accessibility.spec.ts          # axe + focused DOM assertions
scripts/
└── verify-built-content.mjs       # Draft/route/asset assertions over dist/
.github/workflows/
└── pages.yml                      # check -> upload -> deploy exact artifact
```

This is a recommended mapping inferred from the locked architecture; filenames may be adjusted during planning without changing the boundaries. [VERIFIED: .planning/research/ARCHITECTURE.md]

### Pattern 1: One published-content boundary

**What:** Export one helper used by every public consumer, rather than scattering draft filters across pages. [CITED: https://docs.astro.build/en/guides/content-collections/]

**When to use:** Home cards, `getStaticPaths()`, metadata generation, and Phase 2's serialized exhibit manifest. [VERIFIED: .planning/research/ARCHITECTURE.md]

```typescript
// Source: Astro content collections docs, adapted for this project.
import { getCollection } from 'astro:content';

export async function getPublishedProjects() {
  return (await getCollection('projects', ({ data }) => data.published))
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
```

Astro documents that collection order is platform-dependent, so explicit sorting is required. [CITED: https://docs.astro.build/en/guides/content-collections/]

### Pattern 2: Schema evidence, not free-form claims

**What:** Keep accuracy-critical metadata structured: `published`, `title`, `summary`, `exhibitionOrder`, `liveUrl`, exactly three known contract identifiers, and screenshot objects containing `src`, `alt`, and `caption`. Render contract labels from those fields and reserve Markdown body prose for the narrative. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

**When to use:** The featured client entry and all future project entries that feed public pages. [VERIFIED: .planning/REQUIREMENTS.md]

```typescript
// Source: https://docs.astro.build/en/guides/content-collections/
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

Add a collection-wide validation function to assert that the three contract IDs are unique and exactly match the expected set, and that any `published: true` project has at least one screenshot and its required confirmed evidence values; per-entry array length alone does not prevent repeated IDs, while allowing an empty screenshot array keeps incomplete drafts buildable but unpublished. [VERIFIED: code-level inference from the schema and project constraints]

### Pattern 3: Build once, test once, deploy once

**What:** Run lockfile install, content/type checks, production build, built-output assertions, and browser journeys in the build job; upload `dist/`; make deployment depend on that job and consume the uploaded Pages artifact. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]

**When to use:** Pull requests run through checks without deployment; default-branch pushes run checks and then deploy. [CITED: https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site]

The account-site repository uses `site: 'https://castlew640.github.io'` and no `base`, because its name matches the special `<username>.github.io` pattern. [CITED: https://docs.astro.build/en/guides/deploy/github/]

### Pattern 4: Semantic HTML first

**What:** Use a skip link, landmark elements, a single logical heading hierarchy, native links, `<figure>/<figcaption>`, descriptive page titles, canonical links, and CSS `:focus-visible`. [CITED: https://www.w3.org/TR/WCAG22/]

**When to use:** Every Phase 1 page; no control should depend on JavaScript. [VERIFIED: .planning/REQUIREMENTS.md]

### Anti-Patterns to Avoid

- **Three.js/React setup in Phase 1:** it violates the roadmap boundary and creates no Phase 1 evidence. [VERIFIED: .planning/ROADMAP.md]
- **Draft filtering only in the home page:** an unfiltered `getStaticPaths()` or future manifest can still publish a draft. Use one helper and assert `dist/` absence. [CITED: https://docs.astro.build/en/guides/content-collections/]
- **Copying project metadata into components:** duplicated titles, summaries, screenshots, or URLs will drift from the canonical route. [VERIFIED: .planning/research/ARCHITECTURE.md]
- **Using a string path for local content images:** use the collection `image()` helper so missing/invalid local image references fail. [CITED: https://docs.astro.build/en/reference/errors/local-image-used-wrongly/]
- **Rebuilding during deployment:** it breaks the requirement that production receive the exact artifact that browser checks exercised. [VERIFIED: .planning/REQUIREMENTS.md]
- **Treating axe as accessibility completion:** Playwright explicitly says automated tests find only some accessibility problems. [CITED: https://playwright.dev/docs/accessibility-testing]
- **Publishing placeholders:** no fake email, resume, client name, screenshots, dates, URL, metrics, scenarios, or file types may reach production. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
- **Absolute-positioned catalogue layout without reflow:** test the bespoke composition at 320 CSS pixels and 400% zoom equivalence before accepting it. [CITED: https://www.w3.org/TR/WCAG22/]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown loading and typed metadata | Custom filesystem parser | Astro `glob()` content loader + `astro/zod` | Official loader/schema integration produces typed entries and build feedback. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Project routing | Manual HTML file per project | Astro `getStaticPaths()` | Produces canonical static routes from the collection. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Responsive screenshot generation | Ad hoc image scripts | Astro assets and `<Image>` | Local imported/content images are processed by the supported pipeline. [CITED: https://docs.astro.build/en/guides/images/] |
| Browser journey runner | Custom Puppeteer harness | Playwright Test | Provides config, fixtures, assertions, JavaScript-disabled contexts, and viewport/device emulation. [CITED: https://playwright.dev/docs/api/class-testoptions] |
| Accessibility rules engine | Custom DOM heuristics | `@axe-core/playwright` plus manual WCAG checks | Automated rules catch common issues; manual review covers semantics and usability automation cannot decide. [CITED: https://playwright.dev/docs/accessibility-testing] |
| Pages artifact protocol | Shell-copying to a branch | Official Pages artifact and deploy actions | GitHub documents the upload/deploy artifact contract and required permissions/environment. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |

**Key insight:** The custom work should be the portfolio's story and visual composition; routing, schema validation, image resolution, browser automation, and artifact publication already have maintained standard mechanisms. [VERIFIED: synthesis of official sources]

## Common Pitfalls

### Pitfall 1: Accurate prose drifts from structured metadata

**What goes wrong:** The home summary says one thing while the article merges the manual planner and AI MVP or associates the wrong host. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

**Why it happens:** Accuracy-critical facts are repeated as unvalidated prose across templates. [VERIFIED: project-specific inference]

**How to avoid:** Store three explicit contract records in the case-study entry and render labels/stack/rationale from them; add content assertions for `website`, `manual-planner`, and `ai-mvp`. [VERIFIED: project-specific inference]

**Warning signs:** “the planner” is used without distinguishing manual vs. AI, continuous-employment language appears, or Lightsail is attributed to the first two contracts. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

### Pitfall 2: Drafts leak through one consumer

**What goes wrong:** A draft has no home card but still gets a generated route or future manifest record. [CITED: https://docs.astro.build/en/guides/content-collections/]

**Why it happens:** Each consumer repeats its own `getCollection()` filter. [VERIFIED: architecture inference]

**How to avoid:** Centralize `getPublishedProjects()` and scan `dist/` for a known draft ID, title, and path in CI. [VERIFIED: architecture inference]

**Warning signs:** Direct `getCollection('projects')` calls appear outside the content library. [VERIFIED: architecture inference]

### Pitfall 3: CI passes a different artifact than production

**What goes wrong:** The deploy job checks out and rebuilds, so production may differ from the browser-tested files. [VERIFIED: .planning/REQUIREMENTS.md]

**Why it happens:** Build and deploy examples are combined without preserving the artifact boundary. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]

**How to avoid:** Upload `dist/` after checks and make `deploy` consume that Pages artifact with `needs: build`. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]

**Warning signs:** `npm run build` appears in the deploy job or deploy can run when build is skipped/failed. [VERIFIED: workflow inference]

### Pitfall 4: A polished page fails zoom and keyboard use

**What goes wrong:** Fixed decorative geometry overlaps text, sticky navigation obscures focus, or focus outlines disappear against warm ivory. [CITED: https://www.w3.org/TR/WCAG22/]

**Why it happens:** Desktop screenshots are treated as accessibility verification. [VERIFIED: project-specific inference]

**How to avoid:** Build composition with normal document flow and progressive decoration; manually inspect keyboard order, 200%/400% zoom, text-spacing overrides, and 320 CSS-pixel reflow. [CITED: https://www.w3.org/TR/WCAG22/]

**Warning signs:** Horizontal page scrolling, clipped headings, icon-only links, hover-only content, or hidden focus. [CITED: https://www.w3.org/TR/WCAG22/]

### Pitfall 5: Missing publication inputs are silently replaced

**What goes wrong:** Placeholder resume/contact/client evidence is shipped and Phase 1 is incorrectly marked complete. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

**Why it happens:** Greenfield implementation needs sample values before the owner has supplied real ones. [VERIFIED: project state]

**How to avoid:** Use a non-public draft fixture for development, insert a human content-input checkpoint, and make production checks reject known placeholder tokens. [VERIFIED: project-specific inference]

**Warning signs:** `example.com`, lorem ipsum, generic screenshots, or an unreviewed resume appear under `public/`. [VERIFIED: project-specific inference]

### Pitfall 6: Account-site path is configured like a project site

**What goes wrong:** Links/assets receive an erroneous `/castlew640.github.io/` prefix. [CITED: https://docs.astro.build/en/guides/deploy/github/]

**Why it happens:** Generic Pages examples usually show repository project paths. [CITED: https://docs.astro.build/en/guides/deploy/github/]

**How to avoid:** Set only `site: 'https://castlew640.github.io'`; omit `base` for this specially named account repository. [CITED: https://docs.astro.build/en/guides/deploy/github/]

**Warning signs:** Built links begin with `/castlew640.github.io/`. [VERIFIED: URL configuration inference]

## Code Examples

### Generate only published static project routes

```astro
---
// Source: https://docs.astro.build/en/guides/content-collections/
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

### Exercise the initial-HTML journey with JavaScript disabled

```typescript
// Source: https://playwright.dev/docs/api/class-testoptions
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

### Scan built pages for automatically detectable accessibility issues

```typescript
// Source: https://playwright.dev/docs/accessibility-testing
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### Configure the account-site canonical origin

```typescript
// Source: https://docs.astro.build/en/guides/deploy/github/
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://castlew640.github.io',
});
```

## State of the Art

| Old / risky approach | Current approach | When changed / current status | Impact |
|----------------------|------------------|-------------------------------|--------|
| Legacy Astro collection directories with implicit loading | `src/content.config.ts` plus `glob()`/`file()` build-time loaders | Content Layer introduced in Astro 5; current Astro 7 docs use loaders | Plan against current loader/schema APIs, not pre-v5 examples. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| `z` imported from `astro:content` in older examples | `z` imported from `astro/zod` | Current Astro 7 docs | Avoid stale snippets during setup. [CITED: https://docs.astro.build/en/guides/content-collections/] |
| Unified as Astro's default Markdown processor | Sätteri is the default | Astro 7 | Do not add a Markdown processor/plugin unless the actual content needs it. [CITED: https://docs.astro.build/en/guides/markdown-content/] |
| Branch-based Pages publishing for a generated site | GitHub Actions uploads and deploys a Pages artifact | Current GitHub Pages custom workflow | Preserves an explicit checked-artifact boundary. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |
| Mutable action version tags as the strongest pin | Full commit SHA for immutable action code | Current GitHub secure-use guidance | Pin Actions to verified full SHAs while commenting the release tag. [CITED: https://docs.github.com/en/actions/reference/security/secure-use] |

**Deprecated/outdated:** Do not use Astro's legacy content collection API or pre-Content-Layer folder conventions in a new Astro 7 project. [CITED: https://docs.astro.build/en/guides/content-collections/]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Recommendations are either user/project constraints, local inspection results, or current official-source findings. | — | — |

## Open Questions

1. **Which actual resume is public?**
   - What we know: A PDF and online resume exist, and resume review was deferred. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - What's unclear: The selected file/URL and whether it is current enough to publish. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - Recommendation: Plan a human input checkpoint and do not satisfy PROF-02 with a placeholder. [VERIFIED: requirement inference]

2. **What public contact and evidence values may ship?**
   - What we know: Email is primary; profile links, screenshots, live client URL, public client naming, and dates remain unsupplied. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - What's unclear: Exact values and publication permission for each asset. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - Recommendation: Build the schema/components first, keep the entry unpublished, then switch `published` only when real inputs pass review. [VERIFIED: workflow inference]

3. **What exact visual tokens satisfy the Phase 1 identity?**
   - What we know: Warm ivory, expressive typography, architectural construction lines, spacious imagery, and “plans becoming places” are locked. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - What's unclear: Exact fonts, colors, spacing, shapes, and screenshot composition. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]
   - Recommendation: UI planning should define these before visual implementation while preserving reflow and contrast checks. [VERIFIED: planning inference]

4. **What is the final repository/default branch setup?**
   - What we know: The `castlew640` account exists; the selected account-site repository was absent on 2026-09-19; this local repository has no remote and its current branch is `master`. [VERIFIED: GitHub API and local git inspection]
   - What's unclear: Whether the repository will be created before execution and whether the default branch will be `main` or `master`. [VERIFIED: current state]
   - Recommendation: Recheck, create the public repository if still absent, choose/confirm the default branch, then bind the workflow trigger to that actual branch. [VERIFIED: setup inference]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Astro build/check | ✓ | 24.14.1 | Pin the same Node 24 line in CI. [VERIFIED: local environment] |
| npm | Dependency install and scripts | ✓ | 11.11.0 | None needed. [VERIFIED: local environment] |
| Git | Version control | ✓ | 2.43.0 | None needed. [VERIFIED: local environment] |
| GitHub CLI | Repository availability/setup checks | ✓ | 2.45.0 | GitHub web UI/API. [VERIFIED: local environment] |
| GitHub account `castlew640` | Public repository ownership | ✓ | Account created 2025-01-24 | None needed. [VERIFIED: GitHub API] |
| Repository `castlew640/castlew640.github.io` | Pages deployment | ✗ | Not found 2026-09-19 | Recheck, then create public repository during setup. [VERIFIED: GitHub API] |
| Local remote | Push/deploy connection | ✗ | No remotes configured | Add only after target repository is verified/created. [VERIFIED: local git inspection] |
| Project manifest/dependencies | Application build | ✗ | No `package.json`, lockfile, or `node_modules` | Wave/setup task scaffolds and pins the verified stack. [VERIFIED: filesystem inspection] |
| Playwright browser | Browser journeys | ✗ | No system Chromium/Chrome found | Install Playwright Chromium after package verification. [VERIFIED: local environment] |
| Context7 | Documentation lookup | ✗ | MCP and CLI unavailable | Official primary documentation was used through web search. [VERIFIED: tool/environment inspection] |

**Missing dependencies with no fallback:** Actual resume/contact/client evidence is unavailable and blocks truthful public completion, though not implementation planning. [VERIFIED: .planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md]

**Missing dependencies with fallback:** The target repository, project manifest, dependencies, and browser binaries can be created/installed during execution after the required checks. [VERIFIED: environment inspection]

## Security Domain

Security enforcement is enabled at ASVS Level 1 in `.planning/config.json`. [VERIFIED: .planning/config.json]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No | No accounts, login, or protected content exists in Phase 1. [VERIFIED: .planning/REQUIREMENTS.md] |
| V3 Session Management | No | The static portfolio creates no application session. [VERIFIED: .planning/REQUIREMENTS.md] |
| V4 Access Control | No runtime access control | Repository/Pages administration remains a GitHub account concern, not site application logic. [VERIFIED: architecture scope] |
| V5 Validation, Sanitization and Encoding | Yes | Validate content with `astro/zod`; render owner-controlled Markdown with Astro; avoid arbitrary `set:html`; restrict link schemes and keep private assets out of the repository. [CITED: https://docs.astro.build/en/guides/content-collections/] [CITED: https://docs.astro.build/en/guides/markdown-content/] |
| V6 Stored Cryptography | No | The site stores no passwords, secrets, or regulated data and must not implement cryptography. [VERIFIED: .planning/REQUIREMENTS.md] |

### Known Threat Patterns for Astro + GitHub Pages

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Private client code/assets accidentally committed to a public repository | Information Disclosure | Publication allowlist/review; only approved screenshots/descriptions/links enter the repo. [VERIFIED: AGENTS.md] |
| Unsafe raw HTML or URL schemes in content | Tampering / Elevation | Owner-controlled content only, Zod URL validation plus allowed-scheme refinement, no arbitrary `set:html`. [CITED: https://docs.astro.build/en/guides/markdown-content/] |
| Compromised/moved GitHub Action tag | Tampering / Supply chain | Pin actions to reviewed full commit SHAs and grant least-privilege job permissions. [CITED: https://docs.github.com/en/actions/reference/security/secure-use] |
| Build job receives deployment write privileges | Elevation | Build job uses `contents: read`; only dependent deploy job gets `pages: write` and `id-token: write`. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages] |
| Secrets exposed to pull-request code | Information Disclosure | This static Pages workflow needs no custom production secret; do not use `pull_request_target` to build untrusted changes. [CITED: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target] |
| External client site outage or content change | Availability / Spoofing | Keep complete local case-study evidence and label the outbound link clearly; external availability is not a build/runtime dependency. [VERIFIED: .planning/REQUIREMENTS.md] |

## Sources

### Primary (MEDIUM confidence after GSD classifier)

- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — current Astro 7 build-time loaders, schemas, filtering, sorting, rendering, and static route generation. [CITED: https://docs.astro.build/en/guides/content-collections/]
- [Astro content API](https://docs.astro.build/en/reference/modules/astro-content/) — schema `image()` helper and collection API. [CITED: https://docs.astro.build/en/reference/modules/astro-content/]
- [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/) — account-site `site`/`base` rules and official workflow. [CITED: https://docs.astro.build/en/guides/deploy/github/]
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) — artifact format, job dependency, permissions, and environment. [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]
- [Playwright web server](https://playwright.dev/docs/test-webserver), [test options](https://playwright.dev/docs/api/class-testoptions), and [accessibility testing](https://playwright.dev/docs/accessibility-testing) — built-output server, no-JS/viewport contexts, and axe integration. [CITED: https://playwright.dev/docs/]
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility success criteria used for manual and automated acceptance. [CITED: https://www.w3.org/TR/WCAG22/]
- [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use) — immutable SHA pins and least privilege. [CITED: https://docs.github.com/en/actions/reference/security/secure-use]
- npm registry metadata and GSD package-legitimacy results checked 2026-09-19. [VERIFIED: npm registry]
- GitHub API account/repository checks performed 2026-09-19 with authenticated `gh`. [VERIFIED: GitHub API]

### Project Sources (HIGH authority for scope)

- `.planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md` — locked identity, story, visual, and publishing decisions. [VERIFIED: local project]
- `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` — Phase 1 requirement ownership and success criteria. [VERIFIED: local project]
- `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` — project-wide technical baseline and boundaries. [VERIFIED: local project]
- `AGENTS.md` — mandatory project constraints and workflow rules. [VERIFIED: local project]

### Secondary / Tertiary

- None used for prescriptive findings; all external findings came from official project/vendor/standards documentation or registry/API inspection. [VERIFIED: research log]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — current versions and official docs were checked, but two latest releases triggered the mandatory recent-release warning and require a human install checkpoint. [VERIFIED: npm registry and package-legitimacy seam]
- Architecture: HIGH — the static-content/artifact boundaries are locked by project context and supported by current official APIs. [VERIFIED: local project] [CITED: https://docs.astro.build/en/guides/content-collections/]
- Accessibility: MEDIUM — WCAG requirements and automation capabilities are authoritative, while visual/manual conformance awaits implemented pages and owner review. [CITED: https://www.w3.org/TR/WCAG22/]
- Deployment: MEDIUM — official Pages requirements are current and the target account/repository state was checked, but the repository/Pages environment is not yet created. [VERIFIED: GitHub API] [CITED: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages]
- Pitfalls: HIGH — primarily derived from locked accuracy, accessibility, and checked-artifact requirements. [VERIFIED: local project]

**Validation Architecture:** Intentionally omitted because `.planning/config.json` explicitly sets `workflow.nyquist_validation` to `false`; SHIP-01 still requires the focused browser/content checks described above. [VERIFIED: .planning/config.json] [VERIFIED: .planning/REQUIREMENTS.md]

**Research date:** 2026-09-19

**Valid until:** 2026-09-26 for package/action versions and repository availability; 2026-10-19 for stable architecture/accessibility guidance. [VERIFIED: research policy]
