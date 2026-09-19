# Pitfalls Research: Surreal Portfolio

**Domain:** Scroll-driven 3D portfolio with frequent content updates  
**Researched:** 2026-09-19  
**Confidence:** MEDIUM throughout for externally researched findings and product recommendations, as returned by `classify-confidence --provider websearch --verified`. Sources are official documentation; proposed budgets and release practices are engineering judgments to validate, not established measurements of this site.

## Critical pitfalls

### 1. Making work reachable only through the scene

**Failure:** A stalled canvas, unavailable WebGL, slow asset, or assistive reading path prevents access to the résumé and evidence. Search engines cannot extract content drawn only inside a canvas. [S1]

**Cause:** Building exhibits first and treating HTML as a later fallback duplicates content and couples navigation to graphics.

**Prevention:** Build canonical HTML pages and real links first; use the same records for the exhibition. Start the renderer independently of essential content. Keep direct navigation visible during loading and expose the readable experience on asset errors, initialization failure, and context loss. Google also recommends pre-rendering because not every bot executes JavaScript. [S2, S7]

**Detection:** Disable JavaScript, block a scene asset, simulate context loss, and directly load a case-study URL. The introduction, project story, résumé, and contact must remain usable. Check actual response HTML, not only a hydrated developer-tools DOM.

**Address in:** Content foundation; confirm again before public release.

### 2. Calling the experience one-handed while hijacking browser input

**Failure:** Trackpad inertia overshoots exhibits; a touch drag unexpectedly opens a project; a nested panel scrolls the camera behind it; browser zoom stops working. Tiny projected arrows shrink as the camera moves.

**Cause:** Treating raw wheel deltas as travel, globally cancelling touch events, and relying exclusively on raycast targets.

**Prevention:** Use one authoritative native scroll position for progress. Ground-inspired arrows should have stable, labeled HTML button counterparts that advance to defined stops. Preserve browser panning and zoom rather than blanket `touch-action: none`; the latter can inhibit zoom. [S3] Ensure all project actions are available by a simple click/tap and by keyboard. W3C explicitly distinguishes simple-pointer alternatives from keyboard alternatives. [S4]

**Detection:** Complete the same journey using only a mouse, only touch, then only keyboard. Check forward/back input, page zoom, resize, first/last stop, tap cancellation after dragging, and reading a long case study. No operation may require simultaneous input devices.

**Address in:** Interaction prototype, before visual complexity.

### 3. Reducing animation speed instead of removing spatial motion

**Failure:** “Reduced motion” still moves the camera through the corridor, or ambient animation starts before the preference is checked.

**Cause:** Implementing the preference as shorter CSS transitions while the JavaScript render loop keeps animating.

**Prevention:** A shared motion policy must govern camera, background, transitions, and smooth scrolling. Honor the OS setting from first render and offer a visible control. Supply an equally complete static presentation. Interaction-triggered motion is still motion; W3C specifically discusses scrolling effects and parallax. [S5, S6]

**Detection:** Enable reduced motion before first load, change it during a visit, and activate every navigation path. Verify camera position does not interpolate and no decorative motion continues. Static mode must retain the visual identity and all content.

**Address in:** Visual/interaction specification and initial scene architecture.

### 4. Losing place, focus, or browser history when opening projects

**Failure:** Back exits the portfolio unexpectedly, closing a detail view jumps to the corridor entrance, or keyboard focus stays on obscured exhibits.

**Cause:** Using project selection solely as local component state and treating routes, scroll, and focus as unrelated mechanisms.

**Prevention:** Start with ordinary case-study URLs and real links. Specify direct entry, refresh, Back/Forward, and return-to-gallery behavior before choosing overlays. If adding a modal, move focus inside, keep background controls inert, include a visible close button and Escape, and return focus to the invoker or a logical replacement. [S8] Let normal browser restoration work where possible; custom restoration needs explicit tests. [S9]

**Detection:** Open from the corridor, return, revisit with browser Forward, refresh the detail URL, and open it in a new tab. Test a keyboard journey and screen-reader reading order. Preserve the selected exhibit and sensible scroll position; never add history entries every animation frame.

**Address in:** Foundation routing and exhibit integration.

### 5. A beautiful development scene that stalls on phones

**Failure:** Large image textures, multiple effects, or unrestricted render resolution overwhelm the GPU. Adding projects steadily increases download and memory costs. A good page-load score hides uneven corridor frame pacing.

**Cause:** Validating only on a fast laptop and importing every exhibit asset at startup. Compressed file size is confused with decoded texture memory.

**Prevention:** Establish budgets before asset production; lazy-load distant assets, reuse geometry/materials, limit internal render resolution, and release unused GPU resources. MDN recommends smaller buffers, fewer draw calls, and explicit resource budgeting. [S10] Keep screenshots readable as HTML images independently of their lower-resolution scene thumbnails.

**Provisional targets to validate in the first representative scene:**

- Essential HTML/CSS/JS/fonts/visible content transfer at most 1 MB compressed; optional 3D startup payload at most 3 MB compressed. Count actual network transfer and set separate caps for textures, models, and scripts after the prototype. These values are project proposals, not browser standards.
- Desktop interaction near 60 fps and a lower-end physical phone baseline near 30 fps; record frame-time spikes over a sustained traversal. Reduce scene quality or offer the static view if the baseline fails. Device choice and measurement procedure belong in the phase plan.
- Use current “good” Core Web Vitals targets: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 at the 75th percentile. Lab measurements can diagnose readiness; they do not prove field percentiles, especially before traffic exists. [S11]

**Detection:** Profile cold load, repeated traversal, open/close cycles, mobile orientation changes, and an expanded fixture gallery on an actual phone. Record transfer sizes, GPU resource counts, frame pacing, and a stable page-load profile. Recheck after a substantial asset or renderer change.

**Address in:** First scene prototype and content-growth verification; do not postpone to the final polish phase.

### 6. Publishing a more impressive story than the evidence supports

**Failure:** The three contracts become implied continuous employment; the limited AI scenario demo becomes a production platform; an illustrative coverage number becomes a claimed achievement.

**Cause:** Filling copy gaps from conversational shorthand or optimizing the story before verifying facts.

**Prevention:** Maintain an explicit publication checklist from `PROJECT.md`: exact contract dates, individual contribution, actual live URL, permitted screenshots, file extension, scenario names, deployment boundaries, and supported results. Use qualitative delivered capabilities where metrics are unavailable. Keep client source private. Review screenshots for private customer details before including them.

**Detection:** Every published claim can be tied to owner-confirmed information or visible evidence. No “98% coverage” result, invented usage figure, uncertain scenario name, or unimplemented pipeline claim appears as fact.

**Address in:** Content foundation and release review. This is established project context, not external market research.

## Update and release pitfalls

| Pitfall | Consequence | Prevention and verification |
|---|---|---|
| New content requires manual scene coordinates everywhere | Weekly additions become redesign work | Validated records, stable slugs, explicit ordering, and deterministic layout. Exercise adding/removing a draft fixture without publishing it. |
| A new project changes existing route identifiers | Application links and shared case studies break | Keep slugs stable independently of list position; verify old URLs and unknown-route behavior in preview. |
| Shipping future work as a completed exhibit | Visitor cannot inspect the claimed result | Explicit draft/published status; only real completed evidence publishes. An optional progress note must be honestly labeled. |
| A green build is treated as a successful release | Asset paths, résumé downloads, or direct URLs fail only on hosting | Smoke-test the deployed HTTPS URL, direct case-study refresh, image and résumé URLs, navigation, and motion-off mode. |
| Automatic deployment bypasses quality checks | A content typo or broken scene reaches every application recipient | Ensure production is gated by build/content checks; preview changes, record release identity, and verify the rollback procedure for the selected host. |
| External client demo becomes unavailable | Case study loses its only evidence | Keep approved screenshots and a written walkthrough; use a normal external link rather than making the client service a runtime dependency. |
| CI/CD is designed after the visual work | First useful publication slips | Establish the deployment path with the HTML foundation and evolve checks as features arrive. |

These pipeline practices are project recommendations. Exact CI provider, hosting integration, and rollback commands need stack-specific verification during planning.

## Release readiness checks

- [ ] Actual identity, contact, résumé, screenshot permissions, live URL, and case-study claims are confirmed; no filler achievements ship.
- [ ] A visitor can reach all important content without entering or waiting for the scene.
- [ ] Mouse-only, touch-only, and keyboard-only journeys work; browser zoom and narrow-screen text reflow remain available.
- [ ] Motion-free mode works on first render, and graphics initialization/context loss has a usable recovery path.
- [ ] Direct case-study load, refresh, Back/Forward, and gallery return preserve understandable focus and position.
- [ ] Production content is present in HTML, routes and assets resolve, and social/title metadata describes the actual owner and work.
- [ ] Representative physical-device performance is recorded against chosen budgets; no claim of field performance is based solely on a lab score.
- [ ] Adding a project does not break previous routes, navigation, asset budgets, or publication status filtering.
- [ ] The chosen host's production checks and rollback have been exercised; the live site is verified after deployment.

## Sources

All accessed 2026-09-19. Official living documentation was checked directly; Three.js manual pages returned fetch errors, so this report relies on MDN for GPU lifecycle guidance instead of claiming their contents were verified.

- **S1:** [Google Search developer guidance](https://developers.google.com/search/docs/fundamentals/get-started-developers).
- **S2:** [Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- **S3:** [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action).
- **S4:** [W3C Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html).
- **S5:** [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- **S6:** [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- **S7:** [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).
- **S8:** [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- **S9:** [MDN scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration).
- **S10:** [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).
- **S11:** [web.dev Web Vitals](https://web.dev/articles/vitals).
