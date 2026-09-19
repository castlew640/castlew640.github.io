# Stack Research

**Project:** Surreal Portfolio
**Domain:** Accessible personal portfolio with a scroll-driven 3D exhibition
**Researched:** 2026-09-19
**Confidence:** MEDIUM — verified primary web documentation; exact package releases and device performance remain setup/prototype checks.

## Recommendation

Use **Astro static output, TypeScript, local Markdown content, and one React Three Fiber scene powered by Three.js WebGL2**. Build the readable portfolio and real project URLs first, then progressively enhance the main exhibition with the corridor. Use **GitHub Actions for checks and deployment**, with **GitHub Pages as the lean hosting default if the chosen repository visibility and account plan support it**. Cloudflare Workers Static Assets is a good alternative when a separate hosting account and preview deployments are desirable.

This recommendation is a project-specific inference: the urgent deliverable is a convincing, shareable portfolio; the expensive interactive portion is one scene. Separating them lets content ship immediately and gives the scene a dependable HTML fallback. It also lets a new Markdown entry become both a case-study page and an exhibit without another hand-built page. No database, application server, CMS, user accounts, or contact-form service is necessary for the stated scope.

## Core Technologies

All recommendations and capability findings below have **MEDIUM confidence**, following the GSD confidence classifier for verified web research. Version ranges indicate verified compatibility families, not claims that a particular patch is the latest.

| Technology | Version policy | Purpose | Why recommended |
|------------|----------------|---------|-----------------|
| Astro | Choose the current published stable release at setup; pin it and its official integrations together | Static pages, layouts, routing, content build | Astro prerenders by default. This fits public portfolio content and preserves direct links without a server. [Rendering](https://docs.astro.build/en/guides/on-demand-rendering/) |
| TypeScript | Compatible stable version selected during scaffold; strict configuration | Content and scene contracts | Typed project metadata and camera configuration catch mistakes when adding work. Run `astro check`; a successful transpilation alone does not establish type correctness. [TypeScript](https://docs.astro.build/en/guides/typescript/) |
| `@astrojs/react`, React, React DOM | Official integration compatible with selected Astro; React/React DOM 19 release pair compatible with the chosen Fiber release | Interactive scene boundary | Astro officially supports React hydration. Keep React focused on the scene and its tightly coupled controls. [Integration](https://docs.astro.build/en/guides/integrations-guide/react/) |
| `three`, `@react-three/fiber` | Fiber 9 with a supported React 19 minor; pin a tested Three.js release | Declarative 3D scene, camera, picking, lifecycle | Fiber documents the React 19/Fiber 9 pairing. Reusable components suit repeating frames, room segments, and future exhibits. [Installation](https://r3f.docs.pmnd.rs/getting-started/installation) |
| Astro content collections + Markdown | Built into selected Astro; use its documented schema API | Project case studies and exhibit metadata | One validated collection can supply static project routes and a small scene manifest. Use ordinary Markdown initially; MDX is optional only when actual interactive prose needs it. [Collections](https://docs.astro.build/en/guides/content-collections/) |
| CSS and semantic HTML | Platform APIs, no component framework required | Navigation, typography, project text, large controls | A small bespoke visual system gives this site its own identity. Keep important labels and links in the DOM, with a clear focus state and readable details. This is a design recommendation, not an automatic framework accessibility guarantee. |
| Node.js + npm | Node 24 LTS; pin a current supported patch at setup and match CI | Build runtime and reproducible dependency installation | Node confirms 24 is an LTS line; Astro currently requires Node 22.12 or later and excludes odd-numbered releases. Commit `package-lock.json`; run `npm ci` in CI. [Node](https://nodejs.org/en/blog/migrations/v22-to-v24), [Astro prerequisites](https://docs.astro.build/en/install-and-setup/), [CI installation](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) |

## Astro versus Vite/React

| Criterion | Recommended: Astro + React scene | Alternative: Vite + React application |
|-----------|----------------------------------|--------------------------------------|
| Project content at first response | Static HTML and generated project routes are the normal architecture | A basic client-rendered React app needs an explicit prerendering/HTML strategy to meet the same requirement |
| Content workflow | Local collection schema and Markdown rendering are provided | Build or add a content loader and route generation strategy |
| Scene development | React island contains the whole scene; boundary must be deliberate | One React tree makes shared state and persistent scene transitions straightforward |
| Complexity cost | Two component syntaxes and a serialized content boundary | Fewer framework concepts initially, but more work for equivalent content delivery |
| Best fit | Public content with one immersive enhancement | A mostly interactive application, particularly if the owner already works much faster in React |

Choose Astro for this scope. Vite is viable and Fiber documents it as working out of the box; it is not disqualified. A Vite build produces deployable static assets, but that alone should not be confused with prerendered case-study content. If substantial prior Vite expertise emerges, reconsider after comparing the actual HTML/fallback work. [Fiber Vite setup](https://r3f.docs.pmnd.rs/getting-started/installation), [Vite deployment](https://vite.dev/guide/static-deploy.html)

Astro already uses Vite internally; do not add an independently versioned Vite application alongside it. A second application would add another deployment and content synchronization problem without a current requirement. [Astro setup](https://docs.astro.build/en/install-and-setup/)

## Scene Loading, Rendering, and Input

### Keep useful content outside the canvas

Render the introduction, project index, résumé link, contact links, and case-study pages as normal Astro HTML. Pass only published exhibit metadata into the client: identifiers, titles, asset URLs, route URLs, and ordering. Keep public screenshots separate from any private client materials. A client-only component's loading fallback is useful for a scene poster, but permanent project access belongs outside that temporary fallback.

Use one scene boundary rather than many independent React islands that must coordinate camera state. `client:only="react"` avoids server-rendering a browser-only scene, but it **loads immediately**; it is not a lazy-loading instruction. Use a lightweight loader and dynamic import within that boundary when deferring the heavy scene until capability/preferences are known. `client:visible` or `client:idle` can suit a server-safe wrapper, but choose deliberately based on initial layout. [Astro directives](https://docs.astro.build/en/reference/directives-reference/)

### Use WebGL2 for launch

Three.js `WebGLRenderer` now uses WebGL2; WebGL1 support was removed in r163. Therefore the fallback for a device without usable WebGL2 must be the readable portfolio. Check initialization failure as well as capability detection, and preserve access if the context is lost. [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)

WebGPU is a future enhancement, not a launch dependency. Three.js documents a WebGL2 fallback within `WebGPURenderer`, but also marks that renderer experimental and describes incompatible custom-material and postprocessing APIs. Switching renderers is not a harmless configuration toggle if the project uses GLSL `ShaderMaterial` or the older `EffectComposer`. Keep the launch renderer consistent with its chosen effects; revisit WebGPU only for a demonstrated visual or performance benefit. [Renderer guidance](https://threejs.org/manual/pages/webgpurenderer)

### Start with a native scroll source

Use document or clearly defined DOM-region scroll progress as the input to a bounded camera path. Ground-arrow visuals should have large, semantic button hit targets that change the same progress state. A button click must work without a drag, simultaneous key, or pointer lock. Keep ordinary project-detail scrolling independent from camera movement.

Drei `ScrollControls` is a candidate for a prototype, not a mandatory abstraction. It creates its own HTML scroll container in front of the canvas, so it can complicate document scroll, overlays, touch behavior, and direct anchors. Adopt it only if those interactions remain simple in the actual layout. Avoid installing Lenis, GSAP, and another scroll library by default; one input model is enough initially. [Drei ScrollControls](https://drei.docs.pmnd.rs/controls/scroll-controls)

Honor reduced motion before enabling continuous camera travel, and provide an explicit motion choice. The same complete portfolio should work in a still or DOM presentation. The browser exposes the user's preference through `prefers-reduced-motion`. [Motion preference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)

### Bound rendering cost before adding effects

Use reusable geometry/materials, conservative pixel density, and only the nearby exhibits' heavy assets. Prefer geometry, color, fog, composition, and lighting over several fullscreen effects to create the surreal identity. These are proposed art/performance choices, not proof of a particular frame rate.

Fiber's demand rendering can rest when the scene is still, but camera damping or ambient animation must continue invalidating frames until complete. A permanently moving scene will still need a continuous frame loop. Do not claim that selecting `frameloop="demand"` alone eliminates GPU cost. [Fiber performance guidance](https://raw.githubusercontent.com/pmndrs/react-three-fiber/master/docs/advanced/scaling-performance.mdx)

## Supporting Libraries and Tools

| Tool | Policy | Purpose / when to add |
|------|--------|-----------------------|
| `@react-three/drei` | Optional, compatible release pinned with Fiber; use selected helpers | Add only when a specific helper such as model loading or performance adaptation removes real work. Current upstream peer metadata targets Fiber 9 and React 19; validate the published release. [Manifest](https://raw.githubusercontent.com/pmndrs/drei/master/package.json) |
| Astro image tools | Built into Astro | Process public case-study screenshots at build time. Supply sizes and alt text; do not load original full-resolution screenshots as every distant frame texture. [Images](https://docs.astro.build/en/guides/images/) |
| `@astrojs/check` + TypeScript | Development dependencies compatible with Astro | Fail CI on template/content typing problems. [Checking](https://docs.astro.build/en/guides/typescript/) |
| `@playwright/test` + `@axe-core/playwright` | Pin stable versions when browser tests are introduced | Verify actual routes and critical visitor actions; run automated DOM accessibility checks. Automation needs manual accessibility assessment alongside it. [Accessibility testing](https://playwright.dev/docs/accessibility-testing) |
| Browser developer tools | No application dependency | Inspect download size, long tasks, real GPU behavior, and touch interaction on representative phones/laptops. Browser automation is not a reliable stand-in for physical-device GPU testing. |

Start tests around direct case-study loading, project opening/return, résumé/contact access, arrow-only navigation, reduced-motion behavior, and failed/no scene initialization. Include a no-JavaScript check of the content base. Test touch behavior and keyboard focus manually in the scene prototype; avoid a large unit-test suite that merely repeats the scene implementation.

## Lean CI/CD

### Default: GitHub Actions and GitHub Pages

Recommended workflow:

1. Pull requests: install from the committed lockfile, type/content checks, production build, then focused browser checks against that build.
2. Default-branch pushes: run those checks and deploy only the artifact produced by the passing build.
3. Record the workflow and a real content update in the portfolio's engineering case study once demonstrated.

Astro documents an official Pages deployment flow. Configure `site` and, for a repository project URL, `base`; asset URLs and project links must work under the deployed base path. Prefer a root user site or eventual custom domain when available, but do not choose an account or create a repository during research. [Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/)

Pages availability depends on repository visibility and the account plan: public repositories are supported on GitHub Free, while private-repository Pages requires an eligible paid plan. The portfolio source can be public without exposing the client's source, provided only permitted case-study assets and descriptions enter this repository. No repository visibility or account choice is assumed here. [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

### Alternative: Cloudflare Workers Static Assets

Choose this when Cloudflare hosting and preview URLs are preferred. Current Astro guidance recommends Workers for new Cloudflare projects. A wholly static Astro site can serve `dist/` through Workers Static Assets without an SSR adapter or Worker application entry point. Avoid a generic full-stack scaffold that changes this portfolio to request-time rendering unnecessarily. [Astro Cloudflare direction](https://docs.astro.build/en/guides/deploy/cloudflare/), [Static Astro configuration](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)

Workers supports Git integration and previews. Keep one production deployment owner: either a deploy job after GitHub Actions checks, or a hosted build command that itself performs required checks before deployment. Two independent push-triggered pipelines can otherwise publish before validation finishes. This sequencing is a project recommendation. [Cloudflare frontend deployments](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)

Do not select Lightsail just because the client project runs there. A static portfolio does not currently need virtual-machine administration. Likewise, avoid Docker, Terraform, multiple environments, or a bespoke asset service solely to make the pipeline sound more impressive. A small pipeline with demonstrable checks and repeatable releases is sufficient evidence.

## Version Compatibility and Setup Policy

| Boundary | Verified fact | Setup action |
|----------|---------------|--------------|
| React ↔ Fiber | Documentation pairs React 19 with Fiber 9; React 18 with Fiber 8 | Resolve a compatible published React/React DOM/Fiber tuple, not unrelated latest versions. [Installation](https://r3f.docs.pmnd.rs/getting-started/installation) |
| React minor ↔ Fiber release | Current upstream Fiber manifest restricts React to `>=19 <19.3`; upstream is not a release guarantee | Inspect the exact published package's peers before pinning. A supported major does not imply every future minor works. [Manifest](https://raw.githubusercontent.com/pmndrs/react-three-fiber/master/packages/fiber/package.json) |
| Astro ↔ integration | Current upstream integration accepts React 19 and declares its own build dependencies | Let the selected stable Astro release determine its integration version; inspect published peers/engines. [Integration manifest](https://raw.githubusercontent.com/withastro/astro/main/packages/integrations/react/package.json) |
| Three.js ↔ types/helpers | Fiber and Drei declare minimum Three.js versions, not proof that all future releases have been tested | Pin Three.js and its matching type definitions; smoke-test scene creation, loading, and clicking before art work expands. |
| Renderer ↔ materials/effects | WebGPU and WebGL use materially different shader/postprocessing paths | Launch on WebGL2 with compatible materials; isolate later renderer experiments. |
| Runtime ↔ CI | Node 24 LTS satisfies the documented Astro minimum | Pin the same supported patch locally and in CI; commit the dependency lockfile. |

Exact Astro, Three.js, helper, test-tool, and action revisions are intentionally deferred to setup. The workspace has no package manifest yet, and upstream `main`/`master` is not an npm release tag. Verify stable package metadata, lock one working set, and record it in the setup summary. Do not copy version numbers from documentation examples as an integrated, tested lockfile.

Planned setup sequence (research only; nothing installed): scaffold Astro into the existing repository while preserving `.planning`, enable the official React integration, install the verified Fiber/Three/React tuple and matching types, add the minimal checking/browser tools, and commit the resulting lockfile. Use the official integration command after Astro exists; do not blindly run a second project generator over the workspace.

## Explicit Deferrals

- **Backend, database, CMS, authentication:** no current requirement; local content and contact links cover launch.
- **WebGPU-only rendering:** incompatible with the intended fallback strategy and unnecessary for the initial corridor.
- **Physics engine, free-roam controls, pointer lock:** no need for a bounded, one-handed camera path.
- **Global state library:** one scene can start with local state/refs and a small typed navigation controller.
- **Advanced postprocessing and large downloaded environments:** add only after an art prototype is memorable and measured on target devices.
- **Headless content service or auto-import of GitHub projects:** explicit curated project entries preserve truthful status and avoid filling the exhibition with unfinished repositories.

## Remaining Checks for Planning

1. Select the GitHub account/repository, visibility, hosting provider, and optional domain before publication configuration. No remote existed in the supplied context; authentication alone is not a repository connection.
2. Establish actual content and asset availability. There is one confirmed client story, not a finished collection of personal projects.
3. Prototype scroll direction, ground-arrow hit targets, motion alternatives, and return-to-exhibit behavior before committing to a scroll helper.
4. Validate the visual approach and frame/download budgets on representative devices; performance is not established by documentation research.

## Research Method

Read project/config context and the supplied stack template. The GSD research-plan seam selected Context7 for library questions and web search for deployment. Context7 MCP and its CLI were unavailable, so primary official web documentation and upstream manifests supplied the findings. The required confidence classifier (`websearch --verified`) returned **MEDIUM**. Digests were stored in the temporary research cache, leaving this agent's repository changes limited to this file. All cited URLs were consulted on the research date; rolling docs and upstream manifests must be rechecked when pinning versions.
