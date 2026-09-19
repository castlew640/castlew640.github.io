# Project Research Summary

**Project:** Surreal Portfolio
**Domain:** Employment-focused portfolio with a growing, one-handed 3D exhibition
**Researched:** 2026-09-19
**Confidence:** MEDIUM — official sources support the capabilities; the visual result, integrated package versions, and device performance still need implementation evidence.

## Executive Summary

Build a complete static portfolio and progressively enhance its exhibition route with a surreal corridor. The initial content is one client case study covering three separate contracts, plus the owner's introduction, resume, and contact information. The full first milestone includes the promised immersive experience; an earlier readable release can support applications while that experience is developed.

Use Astro, TypeScript, local Markdown content collections, and one React Three Fiber/Three.js WebGL2 scene. Let native document scroll drive camera travel, and let real HTML buttons move to the previous or next exhibit. Give every case study a normal static URL. This keeps one-handed navigation, direct sharing, browser history, and fallback content grounded in ordinary browser behavior.

The main risks are losing visitors behind a loading screen, making scroll and touch unpredictable, publishing unverified client claims, and exceeding the capabilities of phones. Address these in the first working scene, then validate the complete experience before calling the immersive milestone finished. Hosting and GitHub repository selection remain open; no public deployment has occurred.

## Key Findings

### Recommended Stack

See [STACK.md](STACK.md) for evidence and alternatives.

- **Astro static output and content collections:** real HTML routes and one validated source for project pages and exhibits.
- **TypeScript and local Markdown:** maintainable project records without a backend or CMS.
- **React 19 / React Three Fiber 9 / Three.js WebGL2:** a documented compatible major-version direction for the scene. Resolve exact published releases and peer dependencies at setup; the research is not a tested lockfile.
- **Node 24 LTS and npm:** a proposed supported build runtime; verify and pin the appropriate patch during setup.
- **GitHub Actions:** check and build changes, then deploy only the passing artifact. GitHub Pages is a lean host candidate if repository visibility/account plan permit it; Cloudflare Workers Static Assets is an alternative.
- **Focused browser checks:** direct routes, one-handed controls, return navigation, motion settings, scene failure, and content updates. Physical-device review complements automation.

These are project recommendations, not claims that only this stack can meet the brief. Final host, domain, repository name, visibility, and owner remain undecided.

### Expected Features

See [FEATURES.md](FEATURES.md).

**Must have:** authentic professional content; permitted screenshots and live link; introduction/resume/contact; direct static project URLs; a distinctive surreal corridor; bidirectional scroll/swipe; large tap controls; selectable exhibits; sensible Back/return behavior; complete motion-free and graphics-failure presentations; repeatable additions; gated automated delivery.

**Distinctive scope:** one coherent art direction, a visible journey that grows with completed work, and the three-contract story showing how the client's requests evolved. A short exhibition with real evidence is sufficient at launch.

**Defer:** in-place project modals, a blog/build journal, elaborate easter eggs, extra room variants, and advanced postprocessing. ChudCode and other personal projects become exhibits only when their actual status and evidence are established.

### Architecture Approach

See [ARCHITECTURE.md](ARCHITECTURE.md).

1. Validated public content generates static routes, visible links, and a lightweight ordered exhibit manifest.
2. Native document position is the single source for corridor progress. Buttons scroll that document; the camera follows it.
3. The scene is optional and independent of essential content. Project detail pages do not require loading the corridor.
4. Browser Back restores the gallery's document position; explicit return links target the same exhibit anchor. A custom history controller is unnecessary unless a later design requires exact in-place restoration.
5. One shared experience policy handles reduced motion, a visible static-view choice, renderer errors, and rendering lifecycle.
6. Checks build a static artifact; the selected host serves that artifact only after checks pass.

### Critical Pitfalls

See [PITFALLS.md](PITFALLS.md).

1. **Canvas-only evidence:** keep content and real links available without JavaScript or successful rendering.
2. **Competing scroll owners:** avoid global wheel/touch interception and nested full-screen scrollers; preserve browser zoom and simple taps.
3. **Motion preference that still animates the camera:** provide a complete still presentation from first render and a visible choice.
4. **Lost place or focus:** specify direct visits, refresh, Back/Forward, and return-to-exhibit behavior before adding overlays.
5. **Excessive scene cost:** measure the first representative scene, bound asset loading and resolution, and repeat checks after adding exhibits.
6. **Overstated professional claims:** distinguish three contracts and an MVP; confirm uncertain formats, scenarios, dates, and results before publication.

## Implications for Roadmap

Use three broad, end-to-end phases. This follows the approved coarse granularity and early-publication goal; it is not a weekly schedule.

### Phase 1: Publishable Portfolio and Delivery

**Rationale:** Establish real evidence, canonical routes, content validation, and a working delivery path that can support applications before the full corridor is complete.

**Delivers:** owner introduction/resume/contact, the client case study, a readable responsive visual foundation, static URLs, draft handling, CI/CD, and the earliest public release after content and destination are supplied.

**Avoids:** canvas-only content, inaccurate client stories, and a deployment pipeline postponed until the end.

### Phase 2: One-Handed Surreal Exhibition

**Rationale:** Prove the distinctive visual concept and input model against real content before producing a large scene.

**Delivers:** the initial surreal corridor, native forward/back travel, large tap arrows, clickable exhibits, return navigation, and complete motion/graphics fallbacks.

**Avoids:** game-control requirements, scroll hijacking, tiny projected targets, and losing the visitor's place.

### Phase 3: Growth and Release Polish

**Rationale:** Confirm that the initial corridor stays useful and reliable as the owner publishes more work.

**Delivers:** documented content additions without renderer edits, stable routes and ordering, measured asset/render budgets, refined composition, production smoke checks, and an exercised rollback path.

**Avoids:** weekly additions becoming manual scene reconstruction and desktop-only performance confidence.

### Phase Ordering Rationale

- Shared records and routes precede both the exhibition and its growth.
- CI/CD begins with the readable release and gains interaction checks as the scene exists.
- Accessibility and motion choices are architectural inputs in Phase 2, not a final repair step.
- Phase 3 owns final growth/performance acceptance; representative performance measurement starts in Phase 2.

### Research Flags

- **Phase 1:** verify published package compatibility, select repository/host, and confirm host base-path/deep-link behavior.
- **Phase 2:** create a UI design contract and small visual/input prototype; settle target placement, mobile feel, motion alternatives, and preliminary budgets.
- **Phase 3:** profile actual assets on representative hardware and validate the selected host's release/rollback procedure. Research only new integration gaps.

## Confidence Assessment

| Area | Confidence | Remaining uncertainty |
|------|------------|-----------------------|
| Stack | MEDIUM | Exact stable versions and the integrated scene must be tested during setup |
| Features | MEDIUM | Product priorities follow the user brief; no evidence of a guaranteed hiring outcome |
| Architecture | MEDIUM | Browser patterns are documented; visual layout and restoration need real tests |
| Pitfalls | MEDIUM | Failure mechanisms are documented; proposed budgets need device measurements |

### Gaps to Address

- Owner name, introduction, resume, contact destinations, live client URL, and approved screenshots are needed before the early release.
- Confirm which client details may be named, contract dates, file extension, scenario names, deployment boundaries, and supported outcome claims. Do not publish the illustrative coverage percentage as a result.
- Select GitHub owner/repository/visibility and hosting before publication. GitHub authentication currently lists `castlew640` active and `castlewr` also available; this repository has no remote.
- Approve a concrete visual contract and representative device/performance criteria during phase planning. Research suggested transfer and frame-rate budgets are provisional, not measured results or universal standards.

## Sources

Primary sources consulted by the research agents; detailed claim-to-source links are in the four reports.

- [Astro islands](https://docs.astro.build/en/concepts/islands/) and [content collections](https://docs.astro.build/en/guides/content-collections/) — static content and interactive boundaries.
- [React Three Fiber installation](https://r3f.docs.pmnd.rs/getting-started/installation) — React/Fiber compatibility.
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) — renderer capabilities.
- [W3C Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — alternative inputs, focus, reading, and targets.
- [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) and [scroll restoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) — motion and browser navigation behavior.
- [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — rendering resource constraints.
- [Astro GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/) and [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) — a possible delivery path and account constraints.
- [Cloudflare static Astro deployment](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/) — alternative static hosting.

---
*Research completed: 2026-09-19*
*Ready for roadmap: yes; implementation and publication decisions remain explicitly open.*
