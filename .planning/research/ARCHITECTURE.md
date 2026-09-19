# Architecture Research

**Project:** Surreal Portfolio
**Domain:** Static professional portfolio progressively enhanced with a scroll-driven 3D exhibition
**Researched:** 2026-09-19
**Confidence:** MEDIUM

## Recommendation

Build a static portfolio with a single content source and ordinary project URLs. Enhance the home exhibition with one client-rendered 3D scene that follows the document's native scroll position. Keep navigation, readable content, project links, resume, and contact in HTML. A visitor can then explore the corridor, follow a direct project link, or use a motion-free presentation without losing access to evidence of the owner's work.

This is an architectural recommendation inferred from the project brief and the sources below. Astro's islands model supports static content around independently hydrated interactions; its content collections support build-time validation and page generation. These capabilities fit this separation, although the boundaries also work with another static rendering framework. Exact package choices belong in `STACK.md`. [Astro islands](https://docs.astro.build/en/concepts/islands/), [Astro content collections](https://docs.astro.build/en/guides/content-collections/).

Avoid an application server, database, authentication, CMS, or contact-form backend for the initial scope. Local content and public assets already cover the confirmed requirements. Hosting remains undecided, and this recommendation does not assume a GitHub remote exists.

## System Overview

```text
Versioned project content + owner profile + public assets
                         |
                 Build-time validation
                         |
           +-------------+----------------+
           |                              |
   Static HTML routes              Small exhibit manifest
   /                               IDs, routes, thumbnails,
   /projects/{slug}/               order, scene presentation
   /about/ or /#about                     |
   /resume/ or public PDF           Optional corridor island
   /contact/ or /#contact                 |
           |                       +-----+------+
           |                       |            |
     Semantic links        Native scroll    3D renderer
     and controls          coordinator ----> camera + scene
           |                       |
           +------ project route --+

Build/check artifact --> selected static host/CDN --> browser
```

The diagram names logical boundaries, not separate services. About/contact may be sections rather than individual pages. Project details should have real static routes from the start.

### Component Responsibilities

| Component | Owns | Must not own |
|-----------|------|--------------|
| Content collection | Stable slug, title, summary, contribution, status, evidence, published order, case-study body | Camera coordinates or client secrets |
| Static page templates | Headings, readable articles, metadata, images, links, direct-entry behavior | Waiting for WebGL or loading the full scene on detail pages |
| Exhibit manifest builder | Published project list and lightweight scene descriptors derived from content | An independently maintained second project database |
| Exhibition document | Ordered DOM sections with stable anchors; accessible exhibit links | Separate virtual scrolling rules |
| Scroll coordinator | Measured section positions, current segment/progress, previous/next targets, layout changes | Project article scrolling or creating history entries on every scroll |
| Navigation boundary | Canonical links, optional return bookmark, route lifecycle and focus handoff | Continuous camera animation |
| Corridor island | Renderer lifecycle, camera path, bounded assets, optional mesh selection | Essential content or sole access to a project |
| Experience policy | Motion preference, explicit simple-view choice, initialization failure and quality settings | Device-name assumptions or hiding content when capability checks fail |

Keep these as small modules inside one site. A separate global state library is not justified initially. Pass a small immutable exhibit manifest into the island; use local state for discrete UI changes and a mutable animation value for continuous camera progress.

## Suggested Project Structure

This example is compatible with the recommended Astro/static-content direction; filenames are proposals, not existing application files.

```text
src/
├── content.config.ts              # Project collection schema
├── content/projects/              # Public case studies and completed work
├── data/profile.ts                # Owner introduction and verified links
├── pages/
│   ├── index.astro                # Exhibition + direct content navigation
│   └── projects/[...id].astro     # Canonical generated project pages
├── components/content/            # Project cards, screenshots, navigation
├── components/exhibition/         # React island and HTML movement controls
├── lib/exhibition/
│   ├── manifest.ts                # Content -> exhibit descriptors
│   ├── layout.ts                  # Deterministic stops and camera path
│   ├── scroll.ts                  # Native document progress adapter
│   └── policy.ts                  # Motion, capability, simple-view decisions
├── styles/                        # Shared tokens, readable and enhanced layouts
└── assets/projects/               # Approved, optimized case-study media
public/                           # Public resume and static files
tests/                            # Critical visitor journeys
.github/workflows/                # Conditional on selecting GitHub for CI
```

Content and layout remain separate so a new case study can create a route, a card, and an exhibit without editing renderer code. Keep the project schema small; add scene-specific fields only after the visual prototype establishes a need.

## Architectural Patterns

### 1. HTML is the durable presentation

**Recommendation:** Send the introduction, project summaries, case-study links, resume link, and contact information in initial HTML. Keep all of them usable before the scene loads. Hydrate a corridor island only on the exhibition route; use a lightweight static visual during initialization. Replace that visual after successful rendering rather than withholding the whole page behind a loader.

The canvas may be hidden from assistive technology when the HTML carries equivalent content and controls. In the enhanced view, retain visible DOM links associated with each exhibit so keyboard focus has a visible target. Do not create an invisible focusable copy of every mesh. A mesh click may activate the same project navigation action, but must not become the only route into the work.

**Evidence:** Selective hydration supports this loading boundary. It does not automatically make a canvas accessible; the equivalence between HTML controls and the visual scene is project implementation work. [Astro islands](https://docs.astro.build/en/concepts/islands/).

### 2. One document scroll drives all corridor movement

**Recommendation:** Use native vertical document scrolling. Down advances along the path; up retraces it. Native wheel, touch swipe, scrollbar, and keyboard scrolling all change that same position. The camera is a derived visual output, not a second independently controlled position.

Measure the DOM stop offsets and calculate `{segmentId, localProgress}` between adjacent stops. Map that value to the authored camera path. Scope this calculation to the exhibition section so scrolling to contact or the footer does not also stretch the whole corridor. Clamp at both ends and handle one exhibit without dividing by zero.

Large previous/next HTML buttons scroll to adjacent stops using native scroll APIs. A ground-arrow mesh can visually echo the button, but its hit area should not shrink with perspective. Use immediate movement in simple/reduced-motion mode; a brief smooth scroll can be used in the normal view. Native `scrollTo` supports these behaviors. [MDN scrollTo](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo).

Do not prevent normal wheel/touch scrolling across the viewport, install a second full-page scroller, or require pointer lock. Make touch movement over the canvas continue to pan the page and preserve browser zoom. An exhibit tap must be distinguished from the end of a swipe so scrolling past a frame does not unexpectedly open it.

**Trade-off:** Native scrolling constrains cinematic timing. It earns predictable navigation and avoids implementing inertia, accessibility input, and browser scroll behavior from scratch. These are project-specific design inferences.

### 3. Canonical project routes own reading; the gallery owns travel

**Recommendation for the first immersive release:** Clicking an exhibit opens `/projects/{slug}/`, a normal HTML page. Detail reading uses that page's document scroll. The scene does not continue moving behind the article. Direct visits, refreshes, copied links, and opening a project in another tab all work without prior gallery state.

| Action | Expected behavior |
|--------|-------------------|
| Open exhibit | Follow its canonical project link; retain the source gallery history entry |
| Browser Back from detail | Browser restores gallery scroll; scene initializes from the restored position |
| Browser Forward | Return to the project page with ordinary browser navigation |
| Explicit “Back to exhibition” | Link to `/#exhibit-{slug}` so return reaches the same exhibit, including without JavaScript |
| Direct project-page visit | Complete article plus a working link to its exhibit; no dependence on a stored visit |
| Reload gallery or visit an exhibit hash | Resolve the DOM anchor first, then derive camera position |

Leave `history.scrollRestoration` at `auto` for this document-navigation design. Do not reset scroll on scene mount, or let late scene sizing undo a browser-restored position. Reserve image dimensions and derive travel stops from DOM geometry. On resize or presentation changes, preserve the active exhibit plus local progress rather than a percentage of the entire corridor. [MDN scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration).

**If exact explicit-return position or in-place details become required:** Introduce one navigation controller that owns per-history-entry `{exhibitId, localProgress, focusId}` bookmarks. It must handle direct entry, reload, Back/Forward, and missing bookmarks. Restore layout, then scroll, then focus with no further scroll. Set manual restoration only while that controller is actually responsible; do not run browser and application restorers simultaneously. A global “last scroll” value is insufficient across several project visits.

An in-place article would additionally need independent article scroll, paused gallery input/rendering, intentional focus entry and return, and history entries representing the open detail. Avoid this initial complexity unless the design benefits justify it. `pushState` and `replaceState` do not themselves emit `popstate`; a custom controller must apply its own transitions and separately respond to traversal. [MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event).

### 4. Content extends the exhibition predictably

**Recommendation:** Give each published project a stable slug and an explicit `exhibitionOrder`. Use a `published`/draft distinction, evidence links, thumbnail alt text, and a concise summary. Keep long case-study prose out of the scene manifest. Append newly completed projects farther down the gallery rather than automatically resorting everything by update time.

Use one case-study entry for the featured client relationship, with three clearly named contract sections: website, manual Wi-Fi planner, and AI planner MVP. Those are not automatically three independent client projects. Do not publish an unconfirmed file format, metric, scenario, or fabricated achievement. Draft material must be excluded from both generated public routes and the serialized exhibit manifest.

Derive stops and frame placement from the ordered manifest. Reuse frame geometry and decorative modules; allow an optional presentation variant per project later. At one project, the corridor can be short and visually rich without fake exhibits. Stable slugs preserve links when titles change; stable order keeps earlier positions recognizable as the exhibition grows.

**Evidence:** Build-time collections can validate metadata and generate static pages from it. Using their entries as the shared source for routes and exhibit descriptors is an inference for this product. [Astro content collections](https://docs.astro.build/en/guides/content-collections/).

### 5. Degrade the visual layer while preserving the visitor journey

| Condition | Recommended response |
|-----------|----------------------|
| JavaScript unavailable | Show ordinary content, images, exhibit links, and direct navigation |
| Reduced motion preference | Default to the static presentation; no forced camera travel or smooth scrolling |
| Visitor chooses simple view | Preserve the current exhibit and show the same content without 3D |
| Scene import, asset, or WebGL initialization fails | Keep the HTML usable; stop the loading treatment and provide a simple explanation |
| WebGL context is lost | Stop scene work and retain/expose the HTML presentation; a retry must be deliberate |
| Sustained poor rendering performance | Reduce resolution/effects within a bounded quality policy; make simple view immediately available |
| Gallery leaves the viewport or tab becomes hidden | Stop unnecessary scene animation; resume from current document position |

Read motion preference before starting costly animation and respond if it changes. A visible preference control can override the default; persistence is an enhancement and must not make storage access a prerequisite. Motion reduction is not merely slowing the same long camera journey. [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

WebGL context loss is observable and can be simulated for verification. Test that failure path, not only a capability check on startup. [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).

## One-Handed Interaction Contract

The full path—enter, advance, retreat, select a project, read it, return, open resume, and contact—must be possible with successive single-pointer actions. Do not require simultaneous pointer and keyboard input, held movement keys, dragging, hover-only discovery, or device orientation.

Use visible HTML controls with a proposed 44–48 CSS pixel target size, sufficient spacing, and placement reachable on mobile without covering content or focused links. This is a project usability target: WCAG 2.2 AA's target-size criterion is 24 CSS pixels with specified exceptions, not a blanket 44-pixel minimum. W3C also documents single-pointer alternatives for gesture-based interaction. [W3C Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [W3C Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html).

Keyboard users should tab through normal links and buttons, activate them with standard keys, and scroll with normal page commands. Focus order follows content order. Reaching a focused exhibit must also bring its readable DOM control into view. Do not announce progress every animation frame. Screen-reader users receive the project list and articles rather than spatial instructions alone.

## Rendering and Asset Boundaries

Start with a small scene, shared materials, restrained lighting, and compressed/resized project imagery. Load assets around the current exhibit and the next stop; do not require downloading every future project texture before interaction. Camera movement and object transforms should avoid rerendering the entire React tree for every frame.

If React Three Fiber is selected, on-demand rendering is appropriate when the scene can settle: invalidate on scroll, resize, asset readiness, and visual state changes. Continue requesting frames while interpolation is converging, then stop. Constantly animated floating objects require continuous frames; treating them as always moving would defeat the idle-rendering saving. Its official performance guidance also describes resource reuse and adaptive quality. [React Three Fiber performance guide](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

Control drawing-buffer resolution independently of CSS size. High device pixel ratios increase GPU work sharply; use a measured cap rather than copying the device ratio without a budget. Exact pixel, texture, and frame-time thresholds need a representative mobile prototype. [Three.js responsive rendering](https://threejs.org/manual/pages/responsive.html).

Assign resource lifetime to the scene module. Remove event listeners and animation work on teardown, release owned GPU resources, and avoid disposing shared resources while another exhibit still uses them. Resource counts and browser memory should stabilize after repeated visits. This is a verification requirement, not a claim that a particular wrapper automatically manages every custom asset.

## Build and Deployment Flow

```text
Content/code change
   -> lockfile-based install
   -> content validation + type checks + production build
   -> critical browser smoke checks against built output
   -> immutable static artifact
   -> deployment on successful main-branch change
   -> verify live routes/assets and retain rollback path
```

Keep build and validation independent of hosting. If GitHub becomes the repository provider, Actions can pass build artifacts to a dependent deployment job and scope its permissions. The deploy job should publish the checked output and run only after required checks succeed. Pull-request builds, when used, should not receive production deployment credentials. [GitHub workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data), [GitHub workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions).

Choose the actual host, repository, production branch, URL, and deployment authentication during the first delivery phase. Test nested project URLs on that host, including a direct reload and its not-found behavior. Keep the last successful release usable if a build fails. Document the actual pipeline once operational as portfolio evidence; do not claim CI/CD merely because a workflow file exists.

## Verification and Lean Phase Boundaries

| Proposed slice | Working result | Main architectural proof |
|----------------|----------------|--------------------------|
| 1. Useful public portfolio | Readable verified client case study, introduction, resume/contact, static content pipeline and first automated deployment | Direct URL visits work; content does not require scene initialization |
| 2. Immersive visitor journey | Surreal corridor, bidirectional native scroll, large step arrows, exhibit selection and return | Scroll has one owner; one-handed mobile and keyboard paths work; motion/WebGL fallback already works |
| 3. Memorable polish and repeatable growth | Refined lighting/composition, measured mobile performance, content-driven additions, credible delivery evidence | Adding a published entry extends the corridor and route list without renderer edits; failure and navigation checks remain intact |

These slices are a recommended order, not a restriction to exactly three roadmap phases. Do not postpone accessibility and fallback until polish. The largest uncertainty is the visual/camera/performance combination, so prove it with a small scene before producing a large asset set.

Critical checks: no-JavaScript content; direct project reload; scroll forward then backward; tap selection after swiping; browser Back and Forward; explicit return to the same exhibit; keyboard-only traversal; narrow mobile viewport; reduced-motion changes; forced context loss; a missing asset; and adding one more published project. Verify representative devices manually for motion comfort and one-handed reach; a headless browser cannot settle those judgments.

## Scaling and Anti-Patterns

| Growth pressure | First response |
|----------------|----------------|
| More visitors | Static CDN delivery; inspect image/bundle transfer and host limits before adding infrastructure |
| More weekly exhibits | Stable content IDs/order, progressive asset loading, shared geometry, nearby-scene detail |
| More visual ambition | Profile actual devices; reduce draw resolution, effects, textures, and simultaneous moving elements |
| More project text | Generate readable detail pages; keep the scene manifest compact |

Avoid a canvas-only resume, a mandatory preloader, a separate scroll engine, camera state that overrides browser restoration, content duplicated between HTML and meshes, screenshots bundled at original huge sizes, and an always-running render loop with no visible changes. Avoid embedding the client's entire live planner: use the permitted screenshots and an ordinary external link so third-party availability and interaction do not determine whether this portfolio works.

## Evidence and Confidence Notes

The GSD research-plan seam selected Context7 for library documentation and web search for browser/accessibility questions. Context7 tools and the `ctx7` executable were unavailable; official documentation and primary repository documentation were searched and read through the available web tools. `classify-confidence --provider websearch --verified` returned **MEDIUM**, used for this research. Architectural choices above are explicitly recommendations/inferences rather than findings of a comparative benchmark.

Sources were checked on 2026-09-19. The W3C Pointer Gestures page reports an update on 2026-08-10; MDN's motion page reports 2026-06-10 and scrollTo reports 2026-08-21. Some live Three.js manual links failed; the accessible responsive-rendering page and official R3F guide/source supplied performance evidence. The R3F source was also read directly at [its official repository](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx). No exact library version, browser coverage guarantee, host cost, or performance budget is asserted here.

Open implementation decisions: visual art direction and stop spacing, whether exact explicit-return interpolation is worth a custom navigation controller, target device/performance budget, final host and domain, actual owner/resume/contact assets, and approved client screenshots and publication details.
