# Phase 2: One-Handed Surreal Exhibition - Research

**Researched:** 2026-09-20
**Domain:** Scroll-driven WebGL2 architectural scene inside an existing Astro 7 static site, with a complete non-WebGL presentation as the default
**Confidence:** HIGH for stack/versions/API facts (verified against installed packages, npm registry, and three.js/R3F source); MEDIUM for iOS-specific viewport behaviour (needs the D-18 device check)

---

<user_constraints>
## User Constraints (from 02-CONTEXT.md)

### Locked Decisions

**World and atmosphere**
- **D-01:** The world is an emerging gallery. A partly enclosed ivory entrance opens into a roofless gallery above a still reflective surface.
- **D-02:** The atmosphere is sunlit and quietly uncanny: warm ivory architecture, pale sky, long shadows, and calm stillness.
- **D-03:** The signature impossibility is impossible construction. Solid ivory architecture can rest on thin drawing lines; columns, arches, and unfinished outlines need not obey ordinary structural logic.
- **D-04:** Precise architectural ink is the language of unfinished elements: fine dark lines, deliberate curves, and restrained construction marks.
- **D-05:** The reflective surface is part of the concept. Reflections reveal completed architecture even where the visible structure remains fragmentary or drawn.
- **D-06:** Different stages coexist, with a few deliberate transformations tied to approach. For example, a drawn arch may gain depth or a supporting structure may assemble as the visitor nears it.

**Exhibits and project evidence**
- **D-07:** Each project is an architectural display: real software imagery held inside a structure that is partly solid and partly drawn.
- **D-08:** The initial client case study is one substantial exhibit with one main screenshot, a short introduction, and three clearly labeled contracts: Website, Manual Wi-Fi planner, and AI planner MVP.
- **D-09:** A fine construction-line annotation leads from the exhibit to a visible **"Read case study →"** link. The image and ordinary HTML link remain discoverable without hover.
- **D-10:** Future exhibits share a recognizable design language but vary their surrounding arches, supports, and unfinished geometry so the exhibition gains character without losing navigational familiarity.

**Visitor journey and controls**
- **D-11:** The first exhibit is visible just beyond the entrance, with William's name and introduction integrated into the opening architecture.
- **D-12:** Travel follows a clear, mostly straight forward axis. Exhibits face the visitor; arches, reflections, and incomplete walls provide variation around the path.
- **D-13:** The visit ends at a quiet final landing: one last arch frames the reflective horizon, with an invitation to get in touch plus resume and contact access.
- **D-14:** Large labeled ground-inspired forward/back arrows sit low in the view, aligned with the walkway and rendered in the architectural ink language. They supplement native document scrolling and single-finger swiping.
- **D-15:** Opening a project and returning preserves the visitor's understandable place in the gallery; the equivalent visible HTML link remains available.

**Narrow-screen, motion, and test targets**
- **D-16:** On a phone, the experience remains an immersive portrait view. One exhibit and its readable label are framed clearly at a time, with arrows within easy reach.
- **D-17:** Still view and reduced motion use an illustrated exhibition catalogue: ordinary scrolling, real project images, static architectural drawings, and reflection motifs, with no camera travel or ambient animation required.
- **D-18:** Representative manual test targets are an iPhone 12 Pro and a Windows laptop using Chrome. Confirm the mobile browser during implementation testing; Safari is the expected default unless the owner specifies another browser.

### Claude's Discretion
- Exact architectural dimensions, camera framing, ink stroke widths, color values, typography, asset formats, scene graph organization, and transition timing remain implementation and research choices.
- Choose the smallest scene and asset set that communicates these decisions while preserving direct HTML access and a complete still fallback.

> **Note:** Most of this discretion has already been *exercised and locked* by the approved `02-UI-SPEC.md`. Treat that document as a second constraint layer, not as open space. The exceptions this research identifies are listed under Open Questions.

### Deferred Ideas (OUT OF SCOPE)
- Extra rooms, in-place project dialogs, development journal features, and other optional surprises remain outside this phase unless the roadmap changes.
- Final physical-device performance claims and expanded-content budgets belong to Phase 3; Phase 2 only establishes representative testing and preliminary measurements.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-02 | Move forward/backward along the bounded corridor using native scroll or single-finger swipe, with browser panning and zoom preserved | Pattern 2 (scroll → cameraZ derivation); Pitfall 4; **verified** that R3F v9 and vanilla three add no non-passive wheel/touch listeners (Code Example 3, Don't Hand-Roll #1) |
| NAV-03 | Previous/next exhibit via labeled tap controls ≥ 44×44 CSS px with clear endpoint behaviour | Pattern 4 (HTML arrow nav, never a mesh); `window.scrollTo` with behaviour switched by motion policy; Pitfall 8 |
| NAV-04 | Complete journey with successive one-handed pointer actions — no chords, held keys, or precision dragging | Pattern 4 + Pattern 5; Interaction States in UI-SPEC §J; Pitfall 5 (`.page-frame` pointer interception blocks the mesh tap) |
| NAV-05 | Open each exhibit with click/tap and reach the same project via an equivalent visible HTML link | Pattern 5 (tap-vs-swipe detector + `anchor.click()`); Code Example 5 |
| NAV-06 | Return link reaches the same exhibit; Back/Forward restores an understandable location and focus without resetting to the entrance | Pattern 6 (leave `history.scrollRestoration = 'auto'`, no `scrollTo` on mount, `pageshow`/bfcache re-derivation); Pitfall 9 |
| ART-01 | Coherent original Dali-inspired corridor satisfying the UI-planning visual contract | Standard Stack (`Line2`/`LineMaterial` for ink, `Reflector` for D-05); Pitfalls 1, 2, 3, 6; Code Examples 1, 2 |
| ART-02 | Purposeful exhibition sized to real published work, with a useful one-project state and a clear end, no fake exhibits | Pattern 3 (content-derived stop table); shipped `getPublishedProjects()` already sorts by `exhibitionOrder`; empty-state copy in UI-SPEC |
| ACCESS-04 | Complete motion-free presentation on OS reduced-motion, selectable via a visible control | Pattern 1 (policy gate before any scene import); Code Example 6; Pitfall 11 |
| ACCESS-05 | Complete project/navigation access if scene loading, an asset, renderer init, or the WebGL context fails | Pattern 1 + Pattern 7; **verified** `WEBGL_lose_context` is available in the project's Playwright Chromium, so this path is automatable |
</phase_requirements>

---

## Project Constraints (from AGENTS.md)

These are directives, not suggestions. The planner must not produce tasks that contradict them.

| Directive | Consequence for Phase 2 |
|-----------|-------------------------|
| "All visitor actions must be possible with one hand — no required multi-key combinations or simultaneous pointer-and-keyboard controls." | No orbit controls, no drag, no pointer lock, no modifier keys. |
| "Verify compatible published package versions during setup and commit the lockfile; dependencies are not installed yet." *(written pre-Phase-1; deps now exist)* | **Every new dependency must be version-verified against the registry before pinning.** Done below; results in Standard Stack. |
| "Essential content and navigation remain ordinary HTML." | The document is the product; the canvas is an enhancement. |
| "Use one validated content source for static case-study routes and exhibit metadata." | The scene must read exhibit data from `getPublishedProjects()`, not a second manifest file. |
| "native document scrolling owns travel, and camera position is derived from it" | No `ScrollControls`, no Lenis/GSAP, no second scroller. |
| "Preserve one-handed controls, motion-free content, and complete access when rendering fails." | ACCESS-04/05 are structural, not a final polish task. |
| "Read `.planning/research/STACK.md` … `REQUIREMENTS.md` … `ROADMAP.md` before planning implementation." | Done; deltas from STACK.md are flagged explicitly below. |
| GSD Workflow Enforcement: "Do not make direct repo edits outside a GSD workflow" | All Phase 2 edits happen inside `gsd-execute-phase`. |
| "Conventions not yet established. Will populate as patterns emerge." | Phase 2 should record the exhibition module conventions it creates. |

---

## Summary

Phase 2 sits on a working Astro 7.3.3 static site with exactly one runtime dependency (`astro`). Everything the scene needs is a net-new dependency, and the single most consequential finding of this research is a **measured conflict between the approved UI contract's own transfer budget and the approved UI contract's own stack choice**: UI-SPEC §I caps the lazily-imported scene chunk at **≤ 190 KB gzipped**, while a realistic `three` + `React 19` + `react-dom` + `@react-three/fiber` bundle measures **308 KB gzipped** — 62% over. The same scene written against plain `three` measures **152 KB gzipped**, which fits with ~38 KB of headroom for the actual scene code. GitHub Pages was verified to serve `content-encoding: gzip` (not brotli), so the gzip figure is the real transfer size, not a lower bound.

The second consequential finding is a set of concrete, checkable defects in the otherwise excellent approved UI contract, each of which will silently produce a broken implementation if a planner transcribes it literally. In order of severity: (1) UI-SPEC §A.6's stacking rule puts `.page-frame` at `z-index: 1` over a full-viewport canvas, which means **the `.page-frame` box will intercept every pointer event over the exhibit panel and the mesh tap of §E.2 can never fire**; (2) §F.1's portrait acceptance band (50–58% panel width) was derived from a 390 × 844 viewport, but an iPhone 12 Pro's actual *small viewport* — which is what `100svh` resolves to, and exactly what Playwright's `iPhone 12 Pro` preset uses — is 390 × 664, at which the same geometry renders the panel **42.07% wide** and fails the check; (3) §C.4's layer-2 reflection pass will render **unlit black geometry** unless the three lights also have layer 2 enabled, because three.js filters lights by camera layers; and (4) §B.2 specifies dash patterns in *pixels*, but `LineMaterial.dashSize`/`gapSize` are in world/model units regardless of `worldUnits` — only `linewidth` is in CSS pixels.

Everything else is buildable exactly as specified, and the existing test rig is better than expected: Playwright's bundled Chromium was probed in this repository and reports **WebGL2 via ANGLE/SwiftShader plus the `WEBGL_lose_context` extension**, which means ACCESS-05's context-loss path and the "scene actually started" assertions are automatable today with zero config changes. Only frame-time claims are off-limits (software rasteriser).

**Primary recommendation:** Build the scene against **plain `three@0.186.0`** driven by a small hand-written TypeScript controller, and do **not** install React, react-dom, `@react-three/fiber`, or `@astrojs/react`. Split the work as: (Wave 0) restructure `index.astro` into the still catalogue with exhibit sections and update the six shipped assertions §L names; (Wave 1) the policy + scroll + arrow + tap controller with **no WebGL at all**, proving NAV-02/03/04/05/06 and ACCESS-04/05 against a scene that does not yet exist; (Wave 2) the three.js scene module, dynamically imported behind that gate. The controller is the phase's real risk; the geometry is the phase's real volume. Prove the controller first.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Exhibit metadata (slug, title, summary, order, screenshot, contracts) | Build-time (Astro content collection) | — | Already validated at build time by `src/content.config.ts` + `src/lib/project-validation.ts`. A second runtime source would violate AGENTS.md's "one validated content source". |
| Stop table / corridor length | Build-time (derived from `N` published projects) | Client (re-measured from DOM offsets) | `stopZ[]` is pure arithmetic on `N`; only the *pixel* offsets are client-measured, because they depend on viewport and text size. |
| Case-study reading | Static HTML route (`/projects/{slug}/`) | — | Already shipped. The scene never renders prose. |
| Screenshot bytes | Build-time (`getImage()` → one hashed URL) | Client (`<img>` element reused as the texture source) | One download must serve both the DOM `<figure>` and the 3D panel (§D.2). |
| Travel position | Browser (native document scroll) | — | Sole authority. `window.scrollY` is the state; nothing else may own it. |
| Camera position | Client policy module (pure function of `scrollY`) | — | Derived, never independently mutated. This is what makes "freeze scroll ⇒ freeze scene" true. |
| Motion / still-view policy | Client policy module (≈ 4 KB, always loaded) | `localStorage` (best-effort persistence only) | Must run **before** the scene chunk is requested (§G.1). Storage failure must never block the toggle. |
| Arrow nav, still-view toggle, endpoint status | Client policy module → DOM `<button>`s | — | Stable hit targets; a perspective mesh cannot hold a 56×56 CSS px target (§E.3). |
| Exhibit activation | Client policy module (tap test) → DOM `<a>.click()` | Client scene (raycast result only) | The anchor is the single navigation path (§K hook #14). The scene answers "was the panel hit?", nothing more. |
| Geometry, ink, lighting, reflection, shadows | Client scene module (lazily imported) | — | The only WebGL-aware code. Fails independently without taking navigation with it. |
| Focus management on hash arrival | Client policy module | Browser default for Back/Forward | Focus is moved only on hash-driven arrival, always `preventScroll: true` (§H.3). |
| Scroll restoration | Browser (`history.scrollRestoration = 'auto'`) | — | Application restoration is explicitly forbidden; two restorers fight. |
| Compression / delivery | Host (GitHub Pages, gzip) | — | **Verified**: no brotli. Budgets must be read as gzip. |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | `0.186.0` | WebGL2 renderer, scene graph, lights, shadows, geometry, raycasting, texture loading | The only mature WebGL2 scene library; already the project baseline in STACK.md and AGENTS.md. Published 2026-09-08. [VERIFIED: npm registry — `npm view three version` → `0.186.0`] |
| `@types/three` | `0.186.0` | TypeScript definitions | `three` ships **no** `types` field of its own — `npm view three types` returns empty — so DefinitelyTyped is required under the project's `astro/tsconfigs/strict`. Version tracks `three` exactly. [VERIFIED: npm registry] |

`three/addons/*` and `three/examples/jsm/*` both resolve via the package's `exports` map, so either import specifier works. [VERIFIED: `npm view three exports`]

**Modules used from `three/addons`** (all verified present in `three@0.186.0` and read in source):

| Module | Used for | Verified constraint |
|--------|----------|---------------------|
| `lines/Line2.js`, `lines/LineGeometry.js`, `lines/LineMaterial.js` | All architectural ink (UI-SPEC §B) | Source comment: *"This module can only be used with `WebGLRenderer`."* `linewidth` is documented in the source as *"CSS pixel units when `worldUnits` is `false` (default)"* — this is what makes §B.2's px stroke table implementable. [VERIFIED: three@0.186.0 source] |
| `objects/Reflector.js` | The D-05 reflective plane | Renders the scene into a `WebGLRenderTarget` from a mirrored camera in `onBeforeRender`; exactly one extra render per frame, matching the §I budget. Exposes `getReflectionCamera(camera)`, `getRenderTarget()`, `dispose()`, and a replaceable `shader` option. [VERIFIED: three@0.186.0 source] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | `1.63.0` (**already installed**) | Journey, reduced-motion, no-JS, context-loss, target-size, framing checks | Already configured. Its bundled Chromium provides WebGL2 — see Environment Availability. |
| `@axe-core/playwright` | `4.13.0` (**already installed**) | Automated a11y regression on the restructured home route | Re-run on the new exhibit sections; the canvas is `aria-hidden` and should be inert to axe. |
| `sharp` (transitive, via `astro`) | installed | `getImage()` resize/reformat for the shared 1600 px panel/`<img>` asset | Already present; no new dependency needed. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `three` + hand-written controller (**recommended**) | `@react-three/fiber@9.7.0` + `react@19.2.x` + `react-dom` + `@astrojs/react@6.0.6` | **Measured +156 KB gzipped** (152 → 308 KB), blowing the §I 190 KB budget by 62%. Buys declarative scene composition and reconciliation — both near-worthless here, because UI-SPEC §A.3 mandates *no* animation state, *no* easing, *no* inertia, and §B.3 mandates every animated quantity be a pure function of `cameraZ`. There is nothing for React to reconcile. Also drags `react@19.2.x` pinning (see Pitfall 12) and `zustand`/`its-fine`/`suspend-react`/`react-use-measure`/`buffer` into the tree. |
| `three/addons/objects/Reflector.js` | Hand-rolled mirrored-camera pass | Reflector costs only **+1.3 KB gzipped** over the no-reflection bundle (150.5 → 151.8 KB) and already implements the oblique near-plane clipping (Lengyel) that a hand-roll gets wrong. Use it. Its only real limitation is that render-target flags (`depthBuffer`, `generateMipmaps`) are not configurable through options — see Open Question 4. |
| `Line2`/`LineMaterial` | `LineBasicMaterial` | `LineBasicMaterial` width is clamped to 1 device pixel on every major platform; UI-SPEC §B.1 already forbids it and §K hook #9 checks for it. `Line2` costs ~17 KB gzipped over bare three core. |
| `@react-three/drei` | — | Not needed. `ScrollControls` is explicitly forbidden by CONTEXT/ARCHITECTURE; nothing else in drei is required. Do not install it. |
| CSS-scroll-driven animations (`animation-timeline: view()`) | — | Cannot drive a WebGL camera; only CSS properties. Not applicable. |

**Installation (recommended path — no React):**

```bash
npm install three@0.186.0
npm install --save-dev @types/three@0.186.0
```

**Installation (only if the user overrides Open Question 1 and keeps R3F):**

```bash
# react/react-dom MUST be 19.2.x — 19.3.0 breaks @react-three/fiber@9.7.0's peer range
npm install three@0.186.0 react@19.2.8 react-dom@19.2.8 @react-three/fiber@9.7.0
npm install --save-dev @types/three@0.186.0 @astrojs/react@6.0.6
```

**Version verification performed (2026-09-20):**

```
npm view three version                 → 0.186.0   (modified 2026-09-08)
npm view @types/three version          → 0.186.0
npm view @react-three/fiber version    → 9.7.0     (modified 2026-09-16)
npm view @react-three/fiber peerDeps   → react ">=19 <19.3", three ">=0.156"
npm view react version                 → 19.3.0    ← OUTSIDE fiber's peer range
npm view @astrojs/react version        → 6.0.6     (modified 2026-09-16), engines node >=22.12.0
npm view astro@7.3.3 dependencies.vite → ^8.0.13   (installed: vite 8.3.0, rolldown 1.2.9)
```

Resolution was dry-run inside this repository:
- `@astrojs/react@6.0.6 react@19.2.8 react-dom@19.2.8 @react-three/fiber@9.7.0 three@0.186.0` → **resolves cleanly, 63 packages**. [VERIFIED: `npm install --dry-run`]
- The same set with `react@19.3.0` → **`ERESOLVE` failure**: `peer react@">=19 <19.3" from @react-three/fiber@9.7.0`. [VERIFIED: `npm install --dry-run`]

---

## Package Legitimacy Audit

> **slopcheck was NOT available in this environment.** `pip install slopcheck` failed (`/mnt/c/.../pyenv-win/shims/pip: cannot execute`) and `python3 -m pip` reports `No module named pip`. Per the graceful-degradation rule, **every package below is tagged `[ASSUMED]`** and the planner must gate each install behind a `checkpoint:human-verify` task. Registry metadata, repository provenance, download volume and postinstall inspection were performed manually as a partial substitute.

| Package | Registry | Age (first publish) | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|---------------------|-----------|-------------|-----------|-------------|
| `three` | npm | 2012-12-07 (~14 yrs) | 11,939,827 /wk | `github.com/mrdoob/three.js` | unavailable | `[ASSUMED]` — **Recommended.** Gate behind human-verify. |
| `@types/three` | npm | 2016-05-17 (~10 yrs) | 7,851,555 /wk | `github.com/DefinitelyTyped/DefinitelyTyped` | unavailable | `[ASSUMED]` — **Recommended.** Gate behind human-verify. |
| `@react-three/fiber` | npm | 2021-01-23 (~5 yrs) | 3,886,495 /wk | `github.com/pmndrs/react-three-fiber` | unavailable | `[ASSUMED]` — **Not recommended** (budget, Open Question 1). Only if the user overrides. |
| `react` | npm | 2011-10-26 (~15 yrs) | 128,921,480 /wk | `github.com/react/react` | unavailable | `[ASSUMED]` — only if R3F is kept; **pin 19.2.8, not 19.3.0**. |
| `react-dom` | npm | 2014-05-06 (~12 yrs) | 121,518,876 /wk | `github.com/react/react` | unavailable | `[ASSUMED]` — only if R3F is kept; **pin 19.2.8**. |
| `@astrojs/react` | npm | 2022-03-18 (~4 yrs) | 1,299,014 /wk | `github.com/withastro/astro` | unavailable | `[ASSUMED]` — only if R3F is kept. |

**Postinstall inspection:** `npm view <pkg> scripts.postinstall` returned **empty for all six** packages — no install-time script executes for any of them. [VERIFIED: npm registry]

**Packages removed due to slopcheck `[SLOP]` verdict:** none (tool unavailable).
**Packages flagged as suspicious `[SUS]`:** none identified manually; all six have decade-scale histories, official org repositories and eight-figure or seven-figure weekly download volumes.

---

## Architecture Patterns

### System Architecture Diagram

```text
                          ┌──────────────── BUILD TIME (Node 24 / Astro 7.3.3) ────────────────┐
                          │                                                                    │
 src/content/projects/*   │  getCollection('projects')                                         │
   + screenshots ─────────┼─▶ validateProjectRecords()  ──▶ published[] sorted by              │
 src/data/profile.ts      │                                  exhibitionOrder   (N entries)     │
                          │            │                              │                        │
                          │            │                              ▼                        │
                          │            │                    getImage(screenshots[0],           │
                          │            │                       width 1600) → ONE hashed URL    │
                          │            ▼                              │                        │
                          │   buildStopTable(N)  ──────────┐          │                        │
                          │   (stopZ[], portalZ[] — pure)  │          │                        │
                          └────────────┬───────────────────┼──────────┼────────────────────────┘
                                       │                   │          │
                                       ▼                   ▼          ▼
        ┌──────────────────────── SHIPPED HTML (the still catalogue, always complete) ─────────┐
        │  <a.skip-link z:3>                                                                   │
        │  <div.page-frame  position:relative  z:1  pointer-events:none>                       │
        │    header/primary-nav ──▶ /#projects /#about /#resume /#contact   (NAV-01, frozen)   │
        │    <main><div#exhibition>                                                            │
        │      #entrance | #projects[ #exhibit-{slug} × N ] | #about | #landing[#resume #contact]│
        │      each stop section: min-height:100svh · inline SVG drawing · <figure><img>       │
        │      · eyebrow · h2.exhibit-title · summary · 3 contract chips                       │
        │      · <a href="/projects/{slug}/">Read case study →</a>   pointer-events:auto       │
        │    footer                                                                            │
        └──────────────────────────────────────────────────────────────────────────────────────┘
                                       │  (no JS ⇒ this is the finished product)
                                       ▼
        ┌────────── POLICY CONTROLLER  (~4 KB, plain TS, <script> in index.astro) ─────────────┐
        │  1. readStoredChoice()  try/catch  →  'still' | 'moving' | null                      │
        │  2. matchMedia('(prefers-reduced-motion: reduce)')                                   │
        │  3. inject <nav.exhibition-controls> (Back/Forward/status) + <button.view-toggle>    │
        │  4. measureStops()  → offsetTop[] per stop section (rAF after 'load')                │
        │  5. scroll(passive) / resize / ResizeObserver / orientationchange / pageshow         │
        │         └─▶ progress = {stopIndex, localProgress}  →  cameraZ = lerp(...)            │
        │  6. tap candidate FSM (≤500 ms, ≤10 px, ≤4 px scroll, 1 pointer, no scroll event)    │
        │  7. hash arrival → section.focus({preventScroll:true})                               │
        │                                                                                      │
        │      still? ──yes──▶ STOP. No import. No renderer. No rAF.   ◀── §G.1 / §K hook #1   │
        │        │no                                                                           │
        └────────┼─────────────────────────────────────────────────────────────────────────────┘
                 ▼  await import('./scene')        ← the ONLY dynamic import site
        ┌────────────── SCENE MODULE (lazy chunk, ~150–165 KB gz, three.js only) ──────────────┐
        │  createRenderer()  ──fails/throws──▶ report() ──▶ controller swaps to still view     │
        │        │ ok                                                                          │
        │        ▼                                                                             │
        │  <canvas aria-hidden=true>  fixed inset:0 height:100svh  z:0  touch-action:auto      │
        │  builtGroup(layer 0)   ── solid ivory (1 vertex-coloured MeshStandardMaterial)       │
        │                        ── ink Line2 × 6 shared LineMaterials                         │
        │  completedGroup(layer 2) ── finished silhouettes, invisible to main camera           │
        │  lights ×3 (layers 0 AND 2)  ── sun follows camera; target added to scene            │
        │  Reflector(y=0) ── reflectionCamera.layers.set(2) ── 1 RT render / frame             │
        │  panelMesh ── texture = the SAME <img> element already in the DOM                    │
        │                                                                                      │
        │  render() called ONLY on: cameraZ change · resize · texture load · view toggle       │
        │  suspended by: IntersectionObserver(#exhibition) · document.hidden                   │
        │  webglcontextlost → preventDefault → stop → dispose → controller → still view        │
        └──────────────────────────────────────────────────────────────────────────────────────┘
                 │  panel hit?  (raycast answer only — never navigation)
                 ▼
        controller → exhibitAnchor.click() → /projects/{slug}/ → "← Back to the exhibition"
                                                              → /#exhibit-{slug}
```

### Recommended Project Structure

Extends the existing tree; every new path is additive except `src/pages/index.astro` and `src/styles/global.css`.

```text
src/
├── lib/
│   └── exhibition/
│       ├── stops.ts            # pure: N → stopZ[], portalZ[], stop ids. NO DOM, NO three.
│       ├── manifest.ts         # build-time: collection entries + getImage() → ExhibitDescriptor[]
│       └── types.ts            # ExhibitDescriptor, StopTable, ViewMode
├── components/
│   └── exhibition/
│       ├── ExhibitionShell.astro   # #exhibition wrapper + the <script> controller entry
│       ├── StopSection.astro       # one stop: id, 100svh, slot
│       ├── ExhibitSection.astro    # §D.2 markup exactly
│       └── drawings/               # per-stop inline SVG (≤12 KB gz each, aria-hidden)
├── scripts/exhibition/         # client TS, bundled by Astro's <script>
│   ├── controller.ts           # policy + scroll + arrows + toggle + tap FSM + focus
│   ├── scroll.ts               # measureStops(), progressFor(scrollY)
│   ├── policy.ts               # reduced-motion + localStorage + view swap
│   └── scene/                  # ← the lazily imported chunk; ONLY place that imports three
│       ├── index.ts            # createScene(): mount/dispose/setCameraZ/hitPanel
│       ├── ink.ts              # Line2 builders + the 6 shared LineMaterials
│       ├── architecture.ts     # vertex-coloured solid geometry (entrance/arch/portal/landing)
│       ├── reflection.ts       # Reflector + layer-2 completedGroup + cheap fallback
│       └── quality.ts          # DPR cap, shadow map size, degradation ladder
└── styles/
    └── global.css              # + exhibition layer (tokens, stacking, arrow nav, sheet)
tests/
├── exhibition-travel.spec.ts   # NAV-02/03/04 + endpoints + zoom
├── exhibition-navigation.spec.ts # NAV-05/06 + focus + bfcache
├── exhibition-resilience.spec.ts # ACCESS-04/05 + no-JS + context loss + chunk block
└── portfolio.spec.ts           # UPDATED per UI-SPEC §L.1 (6 assertions)
```

**Rule the planner must enforce:** `scripts/exhibition/scene/**` is the *only* place `three` may be imported. A `grep -rn "from 'three'" src --include='*.ts' | grep -v 'scene/'` returning nothing is a cheap, reliable guard that the 190 KB chunk never leaks into the always-loaded bundle or into project routes.

---

### Pattern 1: Policy gate before import — the literal ACCESS-04 contract

**What:** The always-loaded controller decides *whether motion is permitted* before the scene chunk is even requested.
**When to use:** Always. UI-SPEC §K hook #1 and Success Criterion 4 are checked against the shape of this code.

```ts
// src/scripts/exhibition/policy.ts
export type ViewMode = 'still' | 'moving';
const KEY = 'exhibition-view';

export function readStoredChoice(): ViewMode | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'still' || v === 'moving' ? v : null;   // validate; never trust storage
  } catch { return null; }                                // private mode / blocked storage
}

export function writeChoice(v: ViewMode): void {
  try { localStorage.setItem(KEY, v); } catch { /* session-only is acceptable */ }
}

export const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

export function motionPermitted(): boolean {
  const explicit = readStoredChoice();
  if (explicit === 'still') return false;
  if (explicit === 'moving') return true;
  return !reduceQuery.matches;
}
```

```ts
// src/scripts/exhibition/controller.ts  (excerpt)
let scene: import('./scene').SceneHandle | null = null;

async function enterMovingView() {
  if (!motionPermitted()) return;                 // ← the gate
  try {
    const mod = await import('./scene');          // ← THE ONLY import('./scene') IN THE REPO
    scene = await mod.createScene({ stops, exhibits, imgFor });
    document.documentElement.dataset.scene = 'active';
  } catch {
    showSceneError();                             // stays in still view, offers ONE retry
  }
}

reduceQuery.addEventListener('change', (e) => {
  if (e.matches && readStoredChoice() !== 'moving') teardownWithinOneFrame();
});
```

**Why the branch placement matters:** a bundler hoists nothing here — `import()` inside a conditional produces a chunk that is only *fetched* when the branch runs. Downloading three.js and then freezing it would pass a naive "is anything moving?" test and fail the actual contract.

---

### Pattern 2: Native scroll is the state; camera is a projection of it

**What:** `window.scrollY` → `{stopIndex, localProgress}` → `cameraZ`. No easing, no inertia, no second scroller.
**When to use:** Always (NAV-02, ART-01, PERF-02 precursor).

```ts
// src/scripts/exhibition/scroll.ts
export interface Stop { id: string; el: HTMLElement; offsetTop: number; z: number }

export function measureStops(stops: Stop[]): void {
  const y = window.scrollY;
  for (const s of stops) s.offsetTop = s.el.getBoundingClientRect().top + y;
}

export function progressFor(scrollY: number, stops: Stop[]) {
  if (stops.length === 0) return { stopIndex: 0, localProgress: 0, z: 0 };
  let k = 0;
  while (k < stops.length - 2 && scrollY >= stops[k + 1].offsetTop) k++;
  const a = stops[k], b = stops[k + 1] ?? a;
  const span = b.offsetTop - a.offsetTop;
  const t = span > 0 ? Math.min(1, Math.max(0, (scrollY - a.offsetTop) / span)) : 0; // N=0 / zero-span guard
  const raw = a.z + (b.z - a.z) * t;
  const last = stops[stops.length - 1].z;                  // negative
  return { stopIndex: k, localProgress: t, z: Math.min(0, Math.max(last, raw)) };
}
```

Driving it:

```ts
let queued = false;
const tick = () => {
  queued = false;
  const p = progressFor(window.scrollY, stops);
  scene?.setCameraZ(p.z);          // setCameraZ internally requests exactly one render
  updateArrowState(p.stopIndex);
};
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(tick); } },
                 { passive: true });
```

**Non-negotiables this pattern encodes:**
- `{ passive: true }` on `scroll` — and **never** a `wheel`/`touchmove` listener at all. §K hook #2 is a grep.
- Offsets are *measured*, never assumed, so the retained `#projects` heading block (≈120 px) needs no special case.
- Re-measure on `resize`, `orientationchange`, and via a `ResizeObserver` on `#exhibition` — browser text-size changes and font loading move offsets without firing `resize`.
- Preserve `{stopIndex, localProgress}` across a re-measure, never a percentage of `document.scrollHeight` (§H.2).

---

### Pattern 3: Stop table is pure arithmetic over published content

**What:** One pure function maps `N` to the whole corridor. It is the GROW-04 guarantee, testable without a browser.

```ts
// src/lib/exhibition/stops.ts
export function buildStopTable(slugs: string[]) {
  const N = slugs.length;
  const stops = [{ id: 'entrance', z: 0 }];
  for (let n = 1; n <= N; n++) stops.push({ id: `exhibit-${slugs[n - 1]}`, z: -18 - 18 * (n - 1) });
  const lastExhibitZ = N > 0 ? stops[N].z : 0;
  stops.push({ id: 'about',   z: lastExhibitZ - 18 });
  stops.push({ id: 'landing', z: lastExhibitZ - 28 });
  return {
    stops,
    thresholdArchZ: -12,
    portalZ: (n: number) => stops[n].z - 12,
    landingArchZ: stops[N + 2].z - 18,
  };
}
```

At `N = 1` this yields `[0, −18, −36, −46]`, `landingArchZ = −64` — matching UI-SPEC §A.2 exactly. [VERIFIED: arithmetic reproduced against the spec table]

**Why a pure module:** it is unit-testable with `node --test` (already in `npm run check`), it proves GROW-04 (`stopZ[1]` is invariant as `N` grows) without rendering anything, and it keeps §D.4's deterministic variation (`order % k`) out of renderer code.

---

### Pattern 4: Travel controls are DOM buttons that move `scrollY`

**What:** Arrows scroll the document. They never touch the camera, never touch history.

```ts
function goTo(k: number) {
  const target = stops[Math.min(stops.length - 1, Math.max(0, k))];
  window.scrollTo({
    top: target.offsetTop,
    behavior: (reduceQuery.matches || viewMode === 'still') ? 'auto' : 'smooth',
  });
}
```

- `<button>` elements, not meshes (§E.3). A perspective mesh's hit area shrinks with distance and cannot satisfy NAV-03's stable ≥44 px target. A decorative ground-arrow mesh is permitted only with `raycast = () => {}`.
- Endpoints use `aria-disabled="true"` + `.is-endpoint`, **never** the `disabled` attribute — `disabled` removes the control from the tab order mid-journey and breaks ACCESS-02.
- Never `pushState`, never write `location.hash`. Scrolling must not create history entries, or Back becomes unusable (NAV-06).
- Focus stays on the pressed button (§H.3), so repeat taps work one-handed.

---

### Pattern 5: Tap-versus-swipe is a state machine on the window, not a framework event

**What:** A pointer FSM that only activates the exhibit when all six §E.2 conditions hold, then delegates to the DOM anchor.
**When to use:** Always (NAV-05, and the roadmap's named failure "tap selection after swiping").

```ts
type Candidate = { id: number; t0: number; x0: number; y0: number; sy0: number; maxMove: number } | null;
let cand: Candidate = null;
let extraPointers = 0;

addEventListener('pointerdown', (e) => {
  if (!e.isPrimary) { extraPointers++; cand = null; return; }          // cond. 4
  if (!isOverCanvas(e)) return;
  cand = { id: e.pointerId, t0: performance.now(), x0: e.clientX, y0: e.clientY,
           sy0: window.scrollY, maxMove: 0 };
}, { passive: true });

addEventListener('pointermove', (e) => {
  if (!cand || e.pointerId !== cand.id) return;
  cand.maxMove = Math.max(cand.maxMove, Math.hypot(e.clientX - cand.x0, e.clientY - cand.y0)); // cond. 2
}, { passive: true });

addEventListener('scroll', () => { cand = null; }, { passive: true });  // cond. 5
addEventListener('pointercancel', () => { cand = null; }, { passive: true });

addEventListener('pointerup', (e) => {
  const c = cand; cand = null; extraPointers = 0;
  if (!c || e.pointerId !== c.id) return;
  if (performance.now() - c.t0 > 500) return;                           // cond. 1
  if (c.maxMove > 10) return;                                           // cond. 2
  if (Math.abs(window.scrollY - c.sy0) > 4) return;                     // cond. 3
  const slug = scene?.hitPanel(e.clientX, e.clientY);                   // cond. 6
  if (!slug) return;
  document.querySelector<HTMLAnchorElement>(
    `#exhibit-${slug} a[href="/projects/${slug}/"]`)?.click();          // the ONLY nav path
}, { passive: true });
```

- Every listener is `{ passive: true }`. This makes `preventDefault()` structurally impossible, which is stronger than promising not to call it (§K hook #2).
- `scene.hitPanel()` returns a slug or `null`; it performs the raycast and nothing else. Navigation lives in the controller, which is what keeps `location.href = …` out of the codebase (§K hook #14).
- `isOverCanvas(e)` must be `document.elementFromPoint(e.clientX, e.clientY)` resolving to the canvas or the canvas container — see Pitfall 5 for why this needs a CSS change too.

---

### Pattern 6: Let the browser own scroll restoration

**What:** Do nothing, deliberately, and make "doing nothing" verifiable.

| Event | Required behaviour |
|-------|--------------------|
| Mount | **Never** call `scrollTo`. **Never** set `history.scrollRestoration = 'manual'`. |
| First derivation | In the `requestAnimationFrame` *after* `load`, so images (which already carry explicit `width`/`height` from Phase 1) have reserved space and offsets are final. |
| Back to the exhibition | Browser restores `scrollY`; controller re-derives `cameraZ` from it. Focus untouched. |
| `pageshow` with `event.persisted === true` | bfcache restore: re-measure and re-derive from the current `scrollY`, no scrolling. |
| Hash arrival (`/#exhibit-{slug}`, direct or via the return link) | Native anchor scroll, then `section.focus({ preventScroll: true })`. |
| `hashchange` | Same as hash arrival. |

**Anti-pattern this replaces:** a `{exhibitId, localProgress}` bookmark controller. ARCHITECTURE.md explicitly scopes that to a later need, and running an application restorer alongside the browser's is the exact bug NAV-06 fails on.

---

### Pattern 7: Failure paths converge on the shipped document

Because the still catalogue is the *shipped* HTML rather than a fallback rendered on failure, every failure mode is "stop enhancing", which is a much smaller surface than "render an alternative".

| Failure | Detection | Action |
|---------|-----------|--------|
| No JavaScript | — | Nothing happens. Document is complete. No dead control ships in initial HTML. |
| Reduced motion / stored 'still' | `motionPermitted()` | Return before `import('./scene')`. |
| Chunk fetch fails | `try/catch` around `await import()` | Error block + one `Try the exhibition again`. |
| WebGL2 unavailable / renderer constructor throws | `try/catch` around `new WebGLRenderer(...)` | Same as above. No device/browser guessing in the copy. |
| `webglcontextlost` | canvas listener | `event.preventDefault()`, stop the loop, dispose, swap to still, notice + one retry. **Never** auto-resume on `webglcontextrestored`. |
| Texture load fails | `TextureLoader` error callback / `img.onerror` | Panel renders ink frame + rust hatch; remove `data-scene="active"`-driven hiding of that `<figure>` so the real `<img alt>` returns. |
| Sustained slow frames | quality ladder (§I) | Degrade; never force a view change. |
| `N === 0` | build time | Empty-state copy; entrance/about/landing still exist; no placeholder exhibit. |

---

### Anti-Patterns to Avoid

- **A second scroll container.** `ScrollControls`, Lenis, and GSAP ScrollTrigger all install a competing scroller. Forbidden by CONTEXT, ARCHITECTURE, STACK, and UI-SPEC §E.1.
- **Per-frame DOM transforms.** UI-SPEC §D.2 forbids driving overlay position from the render loop. It jitters, breaks under zoom, and is motion a reduced-motion user cannot escape.
- **Text rendered into the WebGL scene.** Kills ACCESS-02/03 for free wins; §D.2 forbids it.
- **`inert` on the canvas.** It suppresses hit-testing, making the §E.2 mesh tap unimplementable. `aria-hidden="true"` alone achieves the a11y goal. §A.6 forbids it explicitly.
- **A clock-driven transformation.** `progress = smoothstep(16, 8, |cameraZ − elementZ|)` only. Any `elapsedTime` in that path violates ACCESS-04 *and* breaks the "zero frames after 1 s idle" assertion.
- **An invisible focusable proxy per mesh.** The visible DOM link *is* the focusable equivalent (ARCHITECTURE.md).
- **A preloader / spinner / canvas fade-in.** A fade is motion, and a gate withholds content. §G.4 forbids all three.
- **Two differently-worded links to the same URL on one page.** `Read the case study ↗` is retired; only `Read case study →` survives on `/`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Thick, constant-screen-width ink lines | A custom quad-expansion line shader | `Line2` + `LineMaterial` (`worldUnits: false`) | The instanced-segment expansion, near-plane segment trimming, dash distance attributes and `alphaToCoverage` path are all already there and all subtly wrong when hand-rolled. `linewidth` in CSS px is exactly §B.2's contract. |
| Planar mirror reflection | A hand-written mirrored camera + oblique frustum | `three/addons/objects/Reflector.js` | Costs **+1.3 KB gzipped** and already implements Lengyel oblique near-plane clipping, facing-away culling, XR/shadow-autoupdate guarding, and render-target restore. Supply a custom `shader` for the §C.4 tint + distance fade. |
| Scroll position, momentum, rubber-banding, keyboard scroll keys, find-in-page | A custom scroll engine | `window.scrollY` + `{ passive: true }` listener + `window.scrollTo` | The browser already implements every input modality NAV-02 lists, plus pinch-zoom preservation, which no library reimplements correctly. |
| Restoring the visitor's place on Back | A `{exhibitId, progress}` history controller | `history.scrollRestoration = 'auto'` (the default) | Two restorers fight and produce the "reset to entrance" bug NAV-06 forbids. Only take over if a later requirement demands exact interpolation. |
| Image resize, format negotiation, cache-busted URL | Manual `sharp` calls or a second copy of the screenshot | `getImage()` from `astro:assets` (sharp is already installed) | One hashed URL serves the DOM `<img>` and the panel texture, satisfying §D.2's "one network download, never two". |
| Motion-preference detection | UA sniffing, a settings page | `matchMedia('(prefers-reduced-motion: reduce)')` + its `change` event | The platform signal; the only thing ACCESS-04 is defined against. |
| Reduced-motion CSS enforcement | New `@media` blocks | The **already shipped** global block in `global.css` (`scroll-behavior/animation/transition`) | `portfolio.spec.ts:112` already asserts it. Do not duplicate or weaken it. |
| Contrast safety behind a moving scene | Per-frame luminance sampling | A fixed `color-mix(in srgb, var(--paper) 88%, transparent)` plate under overlay text | §Color: "Text contrast must never depend on scene state." |
| Detecting slow devices | Screen-size or UA heuristics | Measured frame cost → the §I quality ladder | §C.4 is explicit that phones take the *primary* reflection path; the width trigger exists only for genuinely tiny surfaces. |

**Key insight:** every item on this list is a place where the *browser or three.js already owns the hard edge cases*, and where a hand-rolled version passes a demo and fails a real device. The phase's genuine new code is small: a stop table, a scroll projection, a tap FSM, a policy gate, and geometry authoring. Everything else should be delegation.

---

## Common Pitfalls

### Pitfall 1 — The layer-2 reflection renders unlit black *(blocks ART-01/D-05)*

**What goes wrong:** `completedGroup` is put on layer 2, the reflection camera is set to layer 2, and the reflection comes back as black silhouettes instead of sunlit ivory.
**Why it happens:** three.js filters **lights** by camera layers exactly the same way it filters meshes. In `WebGLRenderer.projectObject`: `if ( object.isLight && object.layers.test( camera.layers ) )`. [VERIFIED: three@0.186.0 `src/renderers/WebGLRenderer.js` lines 1410 and 1428] A `DirectionalLight` on layer 0 is simply not collected when rendering with a layer-2 camera.
**How to avoid:** `sun.layers.enable(2); hemi.layers.enable(2); ambient.layers.enable(2);` — enable, do not `set`, so they still light the main pass.
**Warning signs:** reflection shows correct silhouettes with correct geometry but zero shading; `MeshStandardMaterial` appears pure black while `MeshBasicMaterial` test objects look right.

### Pitfall 2 — The reflection camera silently inherits layer 0 *(blocks D-05, fails §K hook #8)*

**What goes wrong:** the reflection mirrors the *visible fragmentary* architecture instead of the completed architecture, which inverts the entire point of D-05.
**Why it happens:** `Reflector.getReflectionCamera(camera)` lazily does `camera.clone()`, and `Object3D.copy()` executes `this.layers.mask = source.layers.mask`. [VERIFIED: three@0.186.0 `src/core/Object3D.js:1626`] The clone therefore starts on layer 0 and there is no option to configure it.
**How to avoid:** call `getReflectionCamera` yourself once, before the first render, to force creation and then override:

```ts
const reflector = new Reflector(waterGeom, { textureWidth: rtW, textureHeight: rtH, shader: waterShader });
reflector.getReflectionCamera(camera).layers.set(2);   // MUST be after the camera object exists
completedGroup.traverse((o) => o.layers.set(2));       // set(), so the main camera never sees it
```

**Warning signs:** `reflectionCamera.layers.mask === 1` instead of `4`. Make that the literal assertion for §K hook #8.

### Pitfall 3 — `LineMaterial` dashes are in world units, not pixels *(UI-SPEC §B.2 is not literally implementable)*

**What goes wrong:** `dashSize: 5, gapSize: 5` produces 5-metre dashes, and distant drawn members read as solid lines while near ones look like a barcode.
**Why it happens:** `linewidth` is genuinely in CSS pixels when `worldUnits: false` — the source documents it as *"Controls line thickness in CSS pixel units when `worldUnits` is `false`"*. But `computeLineDistances()` accumulates `_start.distanceTo(_end)` in **model space**, and the fragment shader tests `mod(vLineDistance + dashOffset, dashSize + gapSize) > dashSize` against that model-space distance scaled only by `dashScale`. There is no screen-space term. [VERIFIED: three@0.186.0 `lines/LineSegments2.js:283-305` and `lines/LineMaterial.js:346`]
**How to avoid:** treat §B.2's dash figures as *the appearance at the design standoff*. Pick world-space `dashSize`/`gapSize` that subtend ≈5 CSS px at the relevant viewing distance and record the conversion in a comment. Do **not** drive `dashScale` per-frame from distance — that is clock-free but still makes dash phase a function of camera position in a way that reads as crawling.
**Warning signs:** dashes invisible at the landing arch (18 m) but chunky at the threshold (3 m).

### Pitfall 4 — `Line2` renders at the wrong width or not at all without `resolution`

**What goes wrong:** ink lines are hairline-thin, hugely fat, or absent; raycasting against them logs `"early out if no resolution has been set"`.
**Why it happens:** the vertex shader divides the screen-space offset by `resolution.y`. If it is `(0,0)` the result is degenerate.
**How to avoid:** set `material.resolution.set(w, h)` in **CSS pixels** (`renderer.getSize(v2)`, *not* `getDrawingBufferSize`) on creation and on every resize, for all nine `LineMaterial` instances. Using drawing-buffer pixels halves the apparent width on a DPR-2 phone.
**Warning signs:** strokes look right on the laptop and half-weight on the phone — that is the CSS-vs-buffer mistake, not a DPR cap problem.

### Pitfall 5 — `.page-frame` at `z-index: 1` swallows every pointer event over the exhibit panel *(blocks NAV-05 entirely)*

**What goes wrong:** the stacking rule in UI-SPEC §A.6 correctly lifts the header/nav/overlays above the fixed canvas — but `.page-frame` is a full-width, full-document-height box. At a 1440 px viewport it spans 5%–95% horizontally; the exhibit panel renders at 36.66%–63.34% (desktop). Every `pointerdown` over the panel therefore lands on a `.page-frame` descendant, never on the canvas, and §E.2 condition 6 can never be satisfied.
**Why it happens:** hit-testing follows the element box, not visible paint. A transparent stop section is still a pointer target.
**How to avoid:** add to the exhibition layer —

```css
#exhibition { pointer-events: none; }
#exhibition a,
#exhibition button,
#exhibition figure,
#exhibition .exhibit-overlay { pointer-events: auto; }
```

`pointer-events: none` does **not** disable document scrolling (scrolling is a viewport gesture, and the underlying canvas never calls `preventDefault`), so NAV-02 is unaffected. The header, nav, footer and the fixed arrow nav keep their default `auto`.
**Warning signs:** tapping the panel does nothing while tapping the left/right gutter (outside `.page-frame`) works. That asymmetry is the tell.

### Pitfall 6 — `svh` is not the screen height, and §F.1's portrait band fails on a real iPhone *(fails §K hook #6)*

**What goes wrong:** UI-SPEC §F.1 asserts a portrait acceptance band of **50–58%** panel width and §A.3 states `svh = 844 CSS px` on an iPhone 12 Pro. Both use the device's *screen* height. `100svh` is the **small** viewport — the height with browser chrome **expanded** — which on an iPhone 12 Pro is ≈664 CSS px, exactly the viewport Playwright's `devices['iPhone 12 Pro']` preset uses (`viewport: {width: 390, height: 664}`, `screen: {width: 390, height: 844}`). [VERIFIED: `@playwright/test@1.63.0` device registry]
**Why it matters numerically** (recomputed with §F.1's own formula, which reproduces all three spec rows exactly):

| Viewport | aspect | `fovY` | `fovX` | Panel width | Panel top | In §F.1 band? |
|---|---|---|---|---|---|---|
| 390 × 844 (spec row 2) | 0.46209 | 68.00° | 34.62° | 53.47% | 28.50% | yes (50–58%) |
| **390 × 664 (real svh / Playwright preset)** | **0.58735** | **68.00°** | **43.22°** | **42.07%** | 28.50% | **NO** |
| 412 × 839 (Pixel 7) | 0.49106 | 68.00° | 36.65° | 50.32% | 28.50% | barely |
| 750 × 340 (iPhone 12 Pro landscape preset) | 2.20588 | 36.00° | 71.26° | 23.25% | 5.37% | barely (23–31%) |
| 1440 × 789 (laptop with browser chrome) | 1.82510 | 37.80° | 64.00° | 26.67% | 7.65% | yes |

The top-margin floor is unaffected (fovY clamps to 68° across the whole portrait range), and panel width is constant 26.67% for every aspect ≥ ≈1.4 because `fovX` is pinned at 64° there. Only the portrait **width** band is wrong.
**How to avoid:** make §K hook #6 *compute* the expected width from the measured aspect using the §F.1 formula rather than comparing against a hard-coded band — `expected = atan(2.00/12) / tan(fovX/2)`, assert within ±2 percentage points. Also correct §A.3's travel estimate: at `N = 1` on a real iPhone 12 Pro it is ≈ 4 × 664 + 120 ≈ **2776 CSS px**, not 3496.
**Warning signs:** the framing test passes with `page.setViewportSize({width: 390, height: 844})` and fails with `devices['iPhone 12 Pro']`.

### Pitfall 7 — `position: fixed; inset: 0` does not mean `100svh` on iOS

**What goes wrong:** the canvas resizes continuously as Safari's URL bar collapses and expands during a swipe, re-triggering renderer resize and projection-matrix updates mid-gesture.
**Why it happens:** UI-SPEC §A.6 specifies `position: fixed; inset: 0` while §F specifies `100svh`. `inset: 0` resolves against the layout viewport, which on iOS Safari tracks chrome retraction; `100svh` is pinned to the small viewport. They are different boxes.
**How to avoid:** size the canvas container explicitly — `position: fixed; top: 0; left: 0; width: 100%; height: 100svh;` — and additionally debounce renderer resize so sub-threshold height changes (< 8 px) do not re-render.
**Confidence:** the CSS units are verified (`svh`: Chrome 108, Firefox 101, Safari 15.4 [VERIFIED: mdn/browser-compat-data `css/types/length`]); the iOS fixed-element resize behaviour is `[ASSUMED]` from training and **must be confirmed on the D-18 device**.

### Pitfall 8 — Browser zoom changes both stop offsets and DPR

**What goes wrong:** at 200% zoom the corridor is half as long in CSS pixels, the camera runs to the landing far too early, and the renderer is drawing at an unnecessary resolution.
**Why it happens:** zoom changes CSS-pixel viewport size (so `100svh` sections change height) *and* `window.devicePixelRatio`.
**How to avoid:** re-measure stops **and** re-apply the DPR cap on `resize`; `ResizeObserver` on `#exhibition` catches text-size-only reflow that never fires `resize`. Preserve `{stopIndex, localProgress}` across the re-measure. ACCESS-03's 320 px / 200% assertion already exists in `skeleton.spec.ts:74`; extend it to the exhibition.

### Pitfall 9 — Focus stealing on Back breaks NAV-06

**What goes wrong:** the visitor presses Back, the browser restores `scrollY`, and then the controller focuses an exhibit section and jumps them elsewhere.
**Why it happens:** a single `focusCurrentStop()` on mount that does not distinguish arrival modes.
**How to avoid:** move focus **only** on hash-driven arrival (`location.hash` present at load, or `hashchange`), always `{ preventScroll: true }`. On plain Back/Forward and reload, touch neither scroll nor focus (§H.3).

### Pitfall 10 — `DirectionalLight.target` does nothing unless it is in the scene

**What goes wrong:** §C.1's camera-following sun produces a fixed light direction, and shadows point the wrong way for 46 m of corridor.
**Why it happens:** three.js documents on `DirectionalLight.target`: *"For the target's position to be changed to anything other than the default, it must be added to the scene."* [VERIFIED: three@0.186.0 `src/lights/DirectionalLight.js`]
**How to avoid:** `scene.add(sun); scene.add(sun.target);` then update both `sun.position` and `sun.target.position` per camera move, and re-centre `sun.shadow.camera` (orthographic 44 × 24 m) on the camera before `updateProjectionMatrix()`.

### Pitfall 11 — The screenshot texture is decoded in the wrong colour space

**What goes wrong:** the panel screenshot looks washed-out and pale against the correctly-toned ivory architecture; the visitor's only piece of real evidence looks worst.
**Why it happens:** `TextureLoader` does not assign `colorSpace`, and the renderer runs `ACESFilmicToneMapping` + `SRGBColorSpace` output per §C.1.
**How to avoid:** `texture.colorSpace = THREE.SRGBColorSpace` on every colour texture (and *not* on data textures). Better still, avoid the load entirely: build the `Texture` from the DOM `<img>` element that §D.2 already puts on the page, guaranteeing exactly one download:

```ts
const img = document.querySelector<HTMLImageElement>(`#exhibit-${slug} figure img`)!;
await (img.decode?.() ?? Promise.resolve());
const tex = new THREE.Texture(img);
tex.colorSpace = THREE.SRGBColorSpace;
tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
tex.generateMipmaps = true;
tex.needsUpdate = true;
```

### Pitfall 12 — `react@latest` is incompatible with `@react-three/fiber@9.7.0` *(only if Open Question 1 keeps R3F)*

**What goes wrong:** `npm install react react-dom @react-three/fiber` fails the install outright.
**Why it happens:** fiber 9.7.0 declares `react: ">=19 <19.3"` and `react-dom: ">=19 <19.3"`, but the registry `latest` for both is `19.3.0`.
**How to avoid:** pin `react@19.2.8` and `react-dom@19.2.8` exactly. [VERIFIED: `npm install --dry-run` succeeded with 19.2.8 and produced `ERESOLVE … peer react@">=19 <19.3" from @react-three/fiber@9.7.0` with 19.3.0]

### Pitfall 13 — Headless WebGL makes performance measurements meaningless

**What goes wrong:** frame timings from the Playwright suite get recorded as evidence and contradict real-device behaviour.
**Why it happens:** the bundled Chromium renders through ANGLE/**SwiftShader** (CPU rasteriser) — verified in this repo, see Environment Availability.
**How to avoid:** use Playwright for *correctness* (scene started, frames stop when idle, context loss handled, framing percentages, target sizes) and never for frame-rate claims. REQUIREMENTS explicitly forbids reporting lab checks as field performance. Phase 3 owns PERF-01.

### Pitfall 14 — Updating the six shipped assertions is in scope and must not weaken the rest

**What goes wrong:** `npm run check` gates deployment (SHIP-01). Two copy changes (D-09's `Read case study →`, D-15's `← Back to the exhibition`) break `tests/portfolio.spec.ts` at lines **11, 43, 44, 45, 103, 105**. A hurried fix deletes neighbouring assertions.
**How to avoid:** change exactly those six; UI-SPEC §L.2 lists the assertions that must keep passing verbatim, including `skeleton.spec.ts:41` (`section#projects` etc. must stay `<section>` elements) and `skeleton.spec.ts:43–45` (id ordering among `main section[id]`). `tests/skeleton.spec.ts` requires **no** changes if §A.6's element types and `<h2>`s are honoured.

---

## Code Examples

### 1. Shared ink materials with the §B.2 stroke table

```ts
// src/scripts/exhibition/scene/ink.ts
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Vector2, Color } from 'three';

// Exactly six shared materials — UI-SPEC §I material budget line 1.
export function createInkMaterials(cssSize: Vector2) {
  const mk = (color: string, linewidth: number, dash?: [number, number]) => {
    const m = new LineMaterial({ color: new Color(color).getHex(), linewidth });
    m.worldUnits = false;                  // linewidth in CSS pixels  [VERIFIED: three source]
    m.resolution.copy(cssSize);            // MUST be CSS px, not drawing-buffer px
    m.alphaToCoverage = true;              // antialias thin strokes
    if (dash) { m.dashed = true; m.dashSize = dash[0]; m.gapSize = dash[1]; } // WORLD units — Pitfall 3
    return m;
  };
  return {
    built:        mk('#4e5144', 1.4),
    unbuilt:      mk('#8b877b', 1.3, [0.25, 0.25]),
    construction: mk('#b9b3a4', 1.0, [0.20, 0.35]),
    arc:          mk('#b9b3a4', 1.0, [0.10, 0.30]),
    registration: mk('#656256', 1.0),
    leader:       mk('#8e4935', 1.4),
  };
}

export function polyline(points: number[], material: LineMaterial, dashed: boolean) {
  const g = new LineGeometry();
  g.setPositions(points);
  const line = new Line2(g, material);
  if (dashed) line.computeLineDistances();   // required before dashes render at all
  line.raycast = () => {};                   // §D.1: only the panel is pickable
  return line;
}

// On resize: for (const m of Object.values(inks)) m.resolution.copy(newCssSize);
```

*Source: `three@0.186.0` `examples/jsm/lines/*` read directly; dash values above are world-metre placeholders pending the Pitfall 3 conversion.*

### 2. Reflection wired for D-05

```ts
// src/scripts/exhibition/scene/reflection.ts
import { Reflector } from 'three/addons/objects/Reflector.js';
import { PlaneGeometry, Group, Vector2 } from 'three';

export function createReflection(
  scene: THREE.Scene, camera: THREE.PerspectiveCamera,
  completedGroup: Group, lights: THREE.Light[], cssSize: Vector2, dpr: number,
) {
  const rt = Math.min(1024, Math.round(cssSize.x * dpr));
  const water = new Reflector(new PlaneGeometry(60, 200), {
    textureWidth: rt,
    textureHeight: Math.round(Math.min(1024, cssSize.y * dpr) * 0.5),
    multisample: dpr > 1.5 ? 0 : 4,        // MSAA on a 1024² RT is the phone's biggest cost
    shader: waterShader,                    // custom: tint to --water, fade 0.42 → 0 at |x| = 26
  });
  water.rotateX(-Math.PI / 2);
  scene.add(water);

  // Pitfall 2 — force the camera to exist, then override its inherited layer 0.
  water.getReflectionCamera(camera).layers.set(2);
  // Pitfall 1 — lights are layer-filtered too, or the reflection renders black.
  for (const l of lights) l.layers.enable(2);
  completedGroup.traverse((o) => o.layers.set(2));
  scene.add(completedGroup);

  return {
    water,
    dispose() { water.dispose(); water.geometry.dispose(); scene.remove(water); },
  };
}
```

*Source: `three@0.186.0` `examples/jsm/objects/Reflector.js` (options list, `getReflectionCamera`, `dispose`) and `src/renderers/WebGLRenderer.js:1410` (light layer test).*

### 3. Renderer creation that fails safely (ACCESS-05)

```ts
export function createRenderer(canvas: HTMLCanvasElement, cssSize: Vector2, dpr: number) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,   // SwiftShader must still work for the test rig
    });
  } catch {
    return null;                              // caller stays in still view
  }
  renderer.setPixelRatio(dpr);
  renderer.setSize(cssSize.x, cssSize.y, false);
  renderer.setClearAlpha(0);                  // the CSS sky gradient shows through (§C.3)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();                       // required, or the context never becomes restorable
    onContextLost();                          // stop loop, dispose, swap to still view, one retry
  }, false);
  return renderer;
}
```

### 4. Demand rendering with a provable idle

```ts
let pending = false;
export function requestRender() {
  if (pending || suspended) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; render(); });
}
// Called from: setCameraZ (only when z actually changed), resize, texture ready,
// view toggle, and while any transformation progress is still changing.

const io = new IntersectionObserver(([e]) => { suspended = !e.isIntersecting; if (!suspended) requestRender(); });
io.observe(document.getElementById('exhibition')!);          // NOT the canvas — it is fixed inset:0
document.addEventListener('visibilitychange', () => {
  suspended = document.hidden; if (!suspended) requestRender();
});
```

Because every animated quantity is a pure function of `cameraZ`, §K hook #15's assertion ("zero animation frames 1 s after the last scroll") is structurally true rather than aspirational:

```ts
// Playwright
await page.evaluate(() => { (window as any).__frames = 0;
  const loop = () => { (window as any).__frames++; requestAnimationFrame(loop); }; });
await page.mouse.wheel(0, 600);
await page.waitForTimeout(1000);
const before = await page.evaluate(() => (window as any).__rendered);
await page.waitForTimeout(1000);
expect(await page.evaluate(() => (window as any).__rendered)).toBe(before);
```

### 5. One asset URL for both the `<img>` and the panel

```astro
---
// src/components/exhibition/ExhibitSection.astro
import { getImage } from 'astro:assets';
const { project, index } = Astro.props;
const shot = project.data.screenshots[0];
const panel = await getImage({ src: shot.src, width: 1600, format: 'webp' });
---
<section id={`exhibit-${project.data.slug}`} tabindex="-1" data-stop data-slug={project.data.slug}>
  <figure data-panel-source>
    <img src={panel.src} alt={shot.alt}
         width={panel.attributes.width} height={panel.attributes.height} />
    <figcaption>{shot.caption}</figcaption>
  </figure>
  <p class="eyebrow">EXHIBIT {String(index + 1).padStart(2, '0')}</p>
  <h2 class="exhibit-title">{project.data.title}</h2>
  <p>{project.data.summary}</p>
  <ul>{project.data.contracts.map((c) => <li>{LABELS[c.id]}</li>)}</ul>
  <a href={`/projects/${project.data.slug}/`}>Read case study <span aria-hidden="true">→</span></a>
</section>
```

The client reads `document.querySelector('#exhibit-x figure img')` and builds the texture from that exact element (Pitfall 11) — the browser guarantees a single decode, and there is no URL to keep in sync.

*Source: `getImage` is exported from the `astro:assets` virtual module; signature confirmed in the installed `astro@7.3.3` (`dist/assets/internal.d.ts`, `dist/assets/vite-plugin-assets.js:154-157`). `sharp` is installed.*

### 6. Forcing the failure paths in Playwright

```ts
// (a) reduced motion must never fetch the scene chunk — §K hook #1
const ctx = await browser.newContext({ reducedMotion: 'reduce' });
const page = await ctx.newPage();
const sceneRequests: string[] = [];
page.on('request', (r) => { if (/scene|three/i.test(r.url())) sceneRequests.push(r.url()); });
await page.goto('/');
await page.evaluate(() => window.scrollTo(0, 2000));
await page.waitForTimeout(500);
expect(sceneRequests).toEqual([]);

// (b) chunk failure keeps the catalogue complete
await page.route(/\/_astro\/scene.*\.js$/, (r) => r.abort());

// (c) WebGL2 unavailable
await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (t, ...a) {
    return /webgl/.test(String(t)) ? null : orig.call(this, t, ...a);
  } as any;
});

// (d) context loss — VERIFIED available in this repo's Chromium
await page.evaluate(() => {
  const c = document.querySelector('canvas') as HTMLCanvasElement;
  (c.getContext('webgl2') as WebGL2RenderingContext)
    .getExtension('WEBGL_lose_context')!.loseContext();
});
await expect(page.getByText('The exhibition stopped rendering')).toBeVisible();
await expect(page.getByRole('link', { name: 'Read case study →' })).toBeVisible();
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| WebGL1 fallback inside `WebGLRenderer` | WebGL2-only | three r163 | The fallback for a device without WebGL2 must be the HTML catalogue, not a degraded renderer. Already the ACCESS-05 design. |
| `LineBasicMaterial` for outlines | `Line2`/`LineMaterial` with CSS-pixel `linewidth` | long-standing, but now explicitly documented as CSS pixels in the r186 source | Makes the §B.2 px stroke table implementable at all. |
| `vh` for full-height sections | `svh`/`lvh`/`dvh` | Chrome 108, Firefox 101, Safari 15.4 [VERIFIED: mdn/browser-compat-data] | `100svh` stops mobile chrome collapse from resizing the corridor mid-swipe. |
| `@react-three/fiber` 8 + React 18 | fiber 9 + React **19.0–19.2** | fiber 9.x | `react@19.3.0` (current `latest`) is out of range; see Pitfall 12. |
| R3F `<Canvas>` defaulting `touch-action: none` | No `touch-action` set at all in fiber 9.7.0; all pointer/wheel listeners registered **passive** | fiber 9.x | Verified in `@react-three/fiber@9.7.0` dist: `DOM_EVENTS` registers `wheel`, `pointerdown`, `pointerup`, `pointermove`, `pointercancel` with the passive flag `true`, and no `touchAction` string exists anywhere in the package. R3F is structurally incapable of blocking NAV-02 scrolling. |
| Astro `experimental.csp` | Stable `security.csp` config emitting `<meta http-equiv="content-security-policy">` with per-page script/style hashes | present and non-experimental in the installed `astro@7.3.3` (`dist/types/public/config.d.ts:776`) | Gives a header-less host (GitHub Pages) a real CSP. See Security Domain. |
| Rollup-backed Vite | Vite 8.3.0 backed by **Rolldown 1.2.9** (both installed) | Astro 7 | Tree-shaking characteristics differ slightly from esbuild; measure the real `dist/_astro/*.js` chunk, not only the esbuild proxy below. |

**Deprecated/outdated:**
- `@react-three/drei`'s `ScrollControls` for this use case — it installs a competing scroll container in front of the canvas and is ruled out by CONTEXT, ARCHITECTURE, STACK **and** UI-SPEC §E.1.
- WebGPU / `WebGPURenderer` — `Line2` and `Reflector` both carry explicit source notes that they are `WebGLRenderer`-only (`lines/webgpu/Line2.js` and `ReflectorNode` are the separate WebGPU paths). Switching renderers is not a toggle.

---

## Preliminary Budget Measurements (Success Criterion 5)

Measured on 2026-09-20 with the repository's own `esbuild@0.28.2` (`--bundle --minify --format=esm --target=es2022`, `gzip -9`), importing a representative set of symbols for the UI-SPEC scene (renderer, scene, perspective camera, three lights, standard/plane/box/extrude geometry, fog, texture loader, raycaster, `Line2`/`LineGeometry`/`LineMaterial`, `Reflector`).

| Bundle | gzipped | vs §I budget (190 KB) |
|---|---|---|
| `three` core only (renderer + scene + mesh + light) | **132,985 B** | irreducible floor |
| `three` + `Line2` family (no Reflector) | **150,523 B** | 79% of budget |
| **`three` + `Line2` + `Reflector` (the whole scene surface)** | **151,848 B** | **80% of budget — ~38 KB headroom** |
| `react` + `react-dom/client` only | 60,083 B | — |
| **`three` + `Line2` + `Reflector` + React 19.2.8 + `@react-three/fiber@9.7.0`** | **308,170 B** | **162% of budget — 118 KB over** |

Derived: React + react-dom + R3F together add **156,322 B gzipped**; `Reflector` costs only **1,325 B**; the `Line2` family costs **17,538 B**.

**Delivery reality check:** `curl -sI -H 'Accept-Encoding: br, gzip' https://castlew640.github.io/` returns `content-encoding: gzip`. GitHub Pages does not serve brotli for this site, so the gzip column is the transfer size, not a pessimistic bound. [VERIFIED: live request 2026-09-20]

**Screenshot budget:** `screenshots[0]` (`clientScreenshot1.jpg`) is currently shipped unresized at **137,353 B / 1901 × 927**. §I allows ≤1600 px long edge and ≤180 KB. A `getImage({ width: 1600, format: 'webp' })` pass should land comfortably under both while serving the `<figure>` and the panel from one URL. The three shipped assets total 411,983 B; only the first enters the scene.

**Caveat:** esbuild is a proxy for Astro's actual bundler (Vite 8.3.0 / Rolldown 1.2.9). The planner should re-measure `dist/_astro/*.js` after the first real scene commit and record the number as the phase's preliminary measurement.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | On iOS Safari a `position: fixed; inset: 0` element resizes as the URL bar retracts, while `height: 100svh` does not | Pitfall 7 | Canvas resizes mid-swipe on the D-18 device; projection churn and possible visible jitter. Mitigated by the recommended explicit `100svh` sizing either way. Confirm on device. |
| A2 | An iPhone 12 Pro's Safari small-viewport height is ≈664 CSS px (Playwright's preset value) rather than 844 | Pitfall 6 | If the real value differs, the recomputed panel-width figure moves. Mitigated by the recommendation to *compute* the expected width from the measured aspect rather than hard-code a band. Confirm on device. |
| A3 | `getImage({ format: 'webp' })` output decodes correctly as a `THREE.Texture` source on the D-18 devices | Code Example 5 | Panel texture missing on Safari; falls back to the §G.4 hatch path, so it degrades rather than breaks. WebP support in Safari 14+ is well established but was not probed here. |
| A4 | `@astrojs/react@6.0.6` is the correct integration major for `astro@7.3.3` | Standard Stack | Only relevant if Open Question 1 keeps R3F. The package declares **no** `astro` peer dependency, so npm will not catch a mismatch; its `vite: ^8.0.13` dependency does match Astro 7.3.3's installed Vite 8.3.0, which is good evidence but not a guarantee. |
| A5 | Setting `#exhibition { pointer-events: none }` does not impair touch scrolling over the exhibition | Pitfall 5 | If wrong, NAV-02 regresses. Standard platform behaviour, but it is the single riskiest CSS line in the phase — test on touch first. |
| A6 | All six recommended packages are legitimate | Package Legitimacy Audit | slopcheck was unavailable. Every package must be gated behind `checkpoint:human-verify`. Manual provenance (decade-scale age, official org repos, 1.3M–129M weekly downloads, zero postinstall scripts) is strong but is not the required tool verdict. |
| A7 | Playwright's CI Chromium (installed via `--with-deps chromium` on `ubuntu-latest`) exposes WebGL2 the same way the local one does | Environment Availability | Scene-dependent tests would fail only in CI, blocking deployment. **Verify in the first CI run of this phase**; if absent, gate scene tests behind a capability probe rather than weakening them. |

---

## Open Questions

1. **The approved UI contract's stack and its own budget are mutually exclusive. Which gives way?** *(highest priority — blocks the stack decision and therefore Wave 0 planning)*
   - What we know: measured, on this machine, with gzip (the verified GitHub Pages encoding) — React + R3F costs **+156 KB gzipped**; the full R3F bundle is **308 KB** against a §I budget of **≤190 KB**; the vanilla-three bundle is **152 KB**. UI-SPEC §I states the rule itself: *"exceeding one is a signal to simplify the composition, not to renegotiate the budget late."*
   - What's unclear: UI-SPEC §Design System names "one React Three Fiber island" and §Registry Safety names `react`/`react-dom`/`@astrojs/react` as expected pins. The two clauses cannot both hold. `02-CONTEXT.md` never mentions React; `AGENTS.md` calls R3F a *"planning baseline"* and instructs verifying versions at setup — which this research has now done.
   - Recommendation: **drop React/R3F, build on plain `three@0.186.0`**, and amend UI-SPEC §Design System and §Registry Safety accordingly. The scene has no reconciliable state (§A.3 forbids animation state; §B.3 forbids a clock), so React's value here is near zero while its cost is 82% of the entire budget. This is a user-visible deviation from an *approved* artifact — surface it in `discuss-phase` or as an explicit plan checkpoint before any install.

2. **Should §K hook #6's portrait acceptance band be replaced with a computed expectation?**
   - What we know: the spec's band (50–58%) is arithmetically correct for 390 × 844 and arithmetically wrong for the viewport `100svh` actually produces (42.07% at 390 × 664). The formula itself reproduces all three spec rows exactly.
   - Recommendation: keep the formula, drop the hard-coded band; assert `|measured − expected(aspect)| ≤ 2` percentage points. Also correct §A.3's "≈3496 CSS px" travel figure to ≈2776 for a real iPhone 12 Pro.

3. **Does the phase adopt `viewport-fit=cover`?** §F.3 explicitly leaves this open and requires the plan to state which branch it takes. Without it, every `env(safe-area-inset-*)` is `0` and the stated fallbacks are operative (arrow `bottom: 24px`, toggle `top: 12px`, overlay `padding-block-end: 104px`). With it, overlay bottom padding must become `calc(104px + env(safe-area-inset-bottom, 0px))` and the D-18 device check must confirm the arrows still sit inside the thumb band.
   - Recommendation: **do not add it.** It is the smaller change, the stated fallbacks are already exact, and the shipped viewport meta is covered by existing passing tests.

4. **Reflector render-target flags are not configurable.** §C.4 specifies `depthBuffer: true, generateMipmaps: false`; `Reflector`'s options expose only `textureWidth`, `textureHeight`, `clipBias`, `shader`, `multisample`, `color`, and it constructs `new WebGLRenderTarget(w, h, { samples: multisample, type: HalfFloatType })` internally. `depthBuffer` defaults to `true` and `generateMipmaps` to `false` for render targets, so the spec's intent is satisfied by default — but it cannot be *asserted through the API*.
   - Recommendation: accept the defaults, document the reliance, and set `multisample: 0` on high-DPR devices where a 1024² MSAA target is the dominant cost. Do not fork Reflector for this.

5. **Is `@react-three/fiber@10` relevant?** `dist-tags` shows `alpha: 10.0.0-alpha.5` and `canary: …`; `latest` is `9.7.0`. No stable 10. Moot if Question 1 resolves to vanilla three.

6. **Should WebKit be added to the Playwright matrix for D-18?** `devices['iPhone 12 Pro']` has `defaultBrowserType: 'webkit'`, and only `chromium` is installed locally and in CI (`npx playwright install --with-deps chromium`). Running the preset as-is against Chromium tests layout/touch but not the Safari engine; adding WebKit means a CI change and an unverified question about WebGL2 availability in Linux WebKit.
   - Recommendation: use the iPhone 12 Pro **viewport + `hasTouch` + `deviceScaleFactor`** under Chromium for automated framing/target-size/tap checks, and rely on the D-18 **manual** device pass for Safari-engine behaviour. Record that split explicitly so no one later reads a Chromium pass as a Safari pass.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, checks | ✓ | 24.14.1 (`engines: >=24 <25`) | — |
| npm | Install, lockfile | ✓ | 11.11.0 | — |
| Astro | Static build | ✓ | 7.3.3 (site `https://castlew640.github.io`, `output: 'static'`) | — |
| Vite / Rolldown | Bundling the scene chunk | ✓ | vite 8.3.0 / rolldown 1.2.9 | — |
| esbuild (local) | Ad-hoc bundle-size measurement | ✓ | 0.28.2 | — |
| `sharp` | `getImage()` resize/format | ✓ | installed transitively via `astro` | — |
| TypeScript + `@astrojs/check` | `astro check` in `npm run check` | ✓ | 6.0.3 / 0.9.10 | — |
| Playwright | Journey/resilience/framing tests | ✓ | 1.63.0, Chromium build 1243 | — |
| **WebGL2 in headless Chromium** | Scene-active assertions, ACCESS-05 | ✓ | `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)` | — |
| **`WEBGL_lose_context` extension** | ACCESS-05 context-loss test | ✓ | present | `page.addInitScript` stubbing `getContext` |
| Playwright WebKit browser | Safari-engine testing of `devices['iPhone 12 Pro']` | ✗ | — | Chromium + iPhone viewport/`hasTouch` for automation; D-18 manual device pass for Safari |
| `slopcheck` | Package legitimacy gate | ✗ | — | Manual registry provenance (done); **every install gated behind `checkpoint:human-verify`** |
| Local Chromium system libs | Running Playwright on this WSL machine | ⚠ | requires `LD_LIBRARY_PATH=/tmp/phase01-playwright-libs.epEDTC/root/usr/lib/x86_64-linux-gnu` | CI uses `npx playwright install --with-deps chromium` — no workaround needed there |
| `three`, `@types/three` | The scene | ✗ | to install: `0.186.0` / `0.186.0` | none — this is the phase |
| Brotli on the host | Transfer size | ✗ | GitHub Pages returns `content-encoding: gzip` | none; read all budgets as gzip |

**Missing dependencies with no fallback:** `three` and `@types/three` — installing them *is* the phase, gated behind human verification.

**Missing dependencies with fallback:**
- `slopcheck` → manual provenance audit above + per-install `checkpoint:human-verify` tasks.
- Playwright WebKit → Chromium with the iPhone 12 Pro viewport for automation, manual device pass for the Safari engine (Open Question 6).

**Probe evidence (run 2026-09-20 in this repository):**

```
default headless   {"webgl2":true,"renderer":"ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)","loseCtx":true}
swiftshader flags  {"webgl2":true,"renderer":"ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)","loseCtx":true}
```

No extra Chromium launch flags are needed — the existing `playwright.config.ts` works unchanged.

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`. This is a static, unauthenticated, read-only site with no server, no database, no user accounts, no forms, and no user-supplied input reaching any sink. Most of ASVS L1 is structurally not applicable; what remains is supply chain, client-side storage hygiene, and delivery configuration.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface exists in this phase. |
| V3 Session Management | no | No sessions, no cookies. |
| V4 Access Control | no | All content is public by design; draft exclusion is already enforced at build by `getPublishedProjects()` + `scripts/verify-built-content.mjs`. |
| V5 Input Validation / Output Encoding | **yes** | Two inputs exist: (a) `localStorage['exhibition-view']` — must be validated against the literal set `'still' \| 'moving'` and read inside `try/catch` (Pattern 1); (b) `location.hash` — must be resolved with `document.getElementById(...)`/attribute-escaped selectors, **never** interpolated into `innerHTML` or an unescaped `querySelector`. Astro escapes all template interpolation by default; do not introduce `set:html` in this phase. |
| V6 Cryptography | no | Nothing is signed, encrypted, or hashed at runtime. |
| V7 Error Handling & Logging | **yes (low)** | §G.4 already requires failure copy that reveals nothing about the device, driver, or browser. Do not log renderer/driver strings to the console in production — `WEBGL_debug_renderer_info` output is a fingerprinting surface. |
| V12 Files & Resources | **yes** | The panel texture must be a same-origin, build-emitted asset. No runtime fetch of a remote image, no `crossOrigin` texture. Existing external links are plain `<a href>` with no `target="_blank"`, so `rel="noopener"` is not currently required — **if any Phase 2 link adds `target="_blank"`, it must also add `rel="noopener noreferrer"`.** |
| V14 Configuration | **yes** | `astro@7.3.3` ships a stable `security.csp` option that emits `<meta http-equiv="content-security-policy">` with per-page script/style hashes — the only practical CSP mechanism on a header-less host like GitHub Pages. See recommendation below. |
| V50 Web Frontend Security (supply chain) | **yes** | Six candidate new packages, slopcheck unavailable → every install gated behind `checkpoint:human-verify`; lockfile committed; `npm ci` in CI (already configured). No postinstall scripts on any candidate. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dependency confusion / typosquatted `three`-adjacent package | Tampering | Exact pins from the audited names above; committed `package-lock.json`; `npm ci`; human-verify checkpoint per install. |
| Malicious postinstall script | Tampering / Elevation | Verified absent for all six candidates; re-check on any version bump. |
| DOM XSS via `location.hash` in the focus/arrival path | Tampering | Look the element up by id with an escaped value; never `innerHTML`; never `set:html`. |
| Prototype-pollution or poisoned value from `localStorage` | Tampering | Strict allow-list validation of the stored string (Pattern 1). |
| Supply-chain injection through an unpinned GitHub Action | Tampering | Already mitigated — the shipped `.github/workflows/pages.yml` pins every action by full commit SHA. Preserve that when adding any step. |
| GPU/driver fingerprinting via error copy or console output | Information Disclosure | §G.4's copy rules; no `WEBGL_debug_renderer_info` in production paths. |
| Inline-script injection with no CSP on a header-less host | Tampering | Optional: enable `security: { csp: true }` in `astro.config.ts`. |

**CSP recommendation (discretionary, MEDIUM confidence):** enabling `security.csp` is a genuine, cheap security win for a host that cannot set headers. Two caveats the planner must verify rather than assume: (1) the lazily-imported scene chunk is loaded as an external module, so `script-src` must include `'self'`; (2) enabling CSP changes **every** shipped page, so the full existing suite (including the axe checks) must pass before and after. If either check is awkward, defer to Phase 3 — it is not a Phase 2 requirement and must not be allowed to consume the phase's risk budget.

---

## Sources

### Primary (HIGH confidence — read directly or executed in this session)

- `three@0.186.0` source via unpkg — `examples/jsm/lines/LineMaterial.js` (`linewidth` CSS-pixel doc comment, `worldUnits`/`dashed`/`dashSize`/`gapSize`/`resolution`/`alphaToCoverage` accessors, dash fragment test), `examples/jsm/lines/LineSegments2.js` (`computeLineDistances` model-space accumulation, `raycast` resolution guard), `examples/jsm/lines/Line2.js` (WebGLRenderer-only note), `examples/jsm/objects/Reflector.js` (options list, `onBeforeRender` render path, `getReflectionCamera`, `getRenderTarget`, `dispose`, `ReflectorShader`), `src/renderers/WebGLRenderer.js` (light layer test at lines 1410/1428), `src/core/Object3D.js` (`copy` copies `layers.mask`, line 1626), `src/lights/DirectionalLight.js` (target-must-be-in-scene doc)
- `@react-three/fiber@9.7.0` package contents (`npm pack`) — `dist/react-three-fiber.esm.js` Canvas wrapper styles (no `touch-action`), `dist/events-*.esm.js` `DOM_EVENTS` passive-flag table, `dist/declarations/src/**` (`CanvasProps`, `RenderProps`, `EventManager`, `Frameloop`, `invalidate`/`advance`)
- npm registry — `npm view` for `three`, `@types/three`, `@react-three/fiber`, `react`, `react-dom`, `@astrojs/react`, `astro@7.3.3` (versions, peers, engines, repository, postinstall, dist-tags); `api.npmjs.org/downloads/point/last-week` for all six
- `npm install --dry-run` in this repository — clean resolution with `react@19.2.8`; `ERESOLVE` with `react@19.3.0`
- esbuild bundle measurements in an isolated scratch install (five variants, gzip -9)
- Playwright WebGL2/`WEBGL_lose_context` probe executed against this repository's Chromium build 1243
- `curl -sI -H 'Accept-Encoding: br, gzip' https://castlew640.github.io/` → `content-encoding: gzip`
- Installed `astro@7.3.3` type definitions — `dist/types/public/config.d.ts:737-1030` (`security.csp`), `dist/assets/internal.d.ts` + `dist/assets/vite-plugin-assets.js:154-157` (`getImage` virtual-module export)
- Installed `@playwright/test@1.63.0` device registry — `devices['iPhone 12 Pro']` = `{viewport: 390×664, screen: 390×844, deviceScaleFactor: 3, defaultBrowserType: 'webkit'}`
- `mdn/browser-compat-data` `css/types/length.json` — small/dynamic viewport units: Chrome 108, Firefox 101, Safari 15.4
- Repository files read in full: `package.json`, `astro.config.ts`, `tsconfig.json`, `playwright.config.ts`, `src/content.config.ts`, `src/lib/project-schema.ts`, `src/lib/projects.ts`, `src/data/profile.ts`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`, `src/pages/projects/[...slug].astro`, `src/styles/global.css`, `tests/portfolio.spec.ts`, `tests/skeleton.spec.ts`, `scripts/verify-built-content.mjs`, `.github/workflows/pages.yml`
- Planning artifacts read in full: `02-CONTEXT.md`, `02-UI-SPEC.md` (all 880 lines), `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `research/STACK.md`, `research/ARCHITECTURE.md`, `01-PATTERNS.md`, `AGENTS.md`

### Secondary (MEDIUM confidence)

- `docs.astro.build/en/reference/directives-reference/` — `client:only` "loads, renders, and hydrates the component immediately on page load"; `client:idle`/`client:visible` defer. Corroborates STACK.md's warning that `client:only` is not a lazy-loading instruction.
- `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` — project-level prior research (self-declared MEDIUM); used for architectural direction, superseded by this document wherever a measured or source-verified fact conflicts.

### Tertiary (LOW confidence — flagged for validation)

- iOS Safari `position: fixed` vs `100svh` resize behaviour (Assumption A1) — training knowledge only; the D-18 device check must settle it.
- iPhone 12 Pro real Safari small-viewport height (Assumption A2) — inferred from Playwright's preset, not measured on hardware.
- WebP decodability as a `THREE.Texture` source on the D-18 devices (Assumption A3) — not probed.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack & versions | **HIGH** | Every version read from the live registry; both resolution outcomes proven by `npm install --dry-run` in this repository. |
| Bundle budget finding (Open Question 1) | **HIGH** | Five bundles measured locally; host compression verified by live request. Only caveat is esbuild-vs-Rolldown, which affects the figure by single-digit KB at most, not the 118 KB overrun. |
| three.js API facts (layers, lights, dashes, resolution, light target, Reflector) | **HIGH** | Read from `three@0.186.0` source, not documentation summaries. |
| R3F non-interference with native scroll | **HIGH** | Read from the shipped `@react-three/fiber@9.7.0` dist bundle; all pointer/wheel listeners registered passive, no `touch-action` string present. |
| Architecture patterns | **HIGH** | Constrained by four converging approved documents plus the shipped codebase; no invention required. |
| Pitfalls 1–5, 8–14 | **HIGH** | Each traced to verified source or to arithmetic reproduced against the spec's own formula. |
| Pitfalls 6–7 (viewport/iOS) | **MEDIUM** | Arithmetic and Playwright preset are verified; the on-device Safari behaviour is not. Assumptions A1/A2. |
| Package legitimacy | **MEDIUM** | Strong manual provenance, but slopcheck was unavailable → all six tagged `[ASSUMED]` and gated. |
| Security domain | **MEDIUM** | ASVS mapping is straightforward for a static site; the CSP recommendation is discretionary and explicitly requires verification before adoption. |

**Research date:** 2026-09-20
**Valid until:** 2026-10-20 for the three.js/Astro API facts and the architecture (stable surfaces); **2026-09-27** for the version pins and the bundle measurement — `three`, `@react-three/fiber` and `react` all published within the last two weeks, and the 190 KB-budget arithmetic depends on those exact versions.

---

*Phase: 02-one-handed-surreal-exhibition*
*Researched: 2026-09-20*
