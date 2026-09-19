# Feature Research: Surreal Portfolio

**Domain:** Employment-focused portfolio with a growing 3D exhibition  
**Researched:** 2026-09-19  
**Confidence:** MEDIUM for researched guidance and recommendations. The GSD `classify-confidence --provider websearch --verified` seam returned MEDIUM; sources below are official documentation. User-established scope comes from `PROJECT.md`. Product priorities are recommendations, not evidence of hiring outcomes.

## Recommendation

Build one complete, readable portfolio and enhance it with a surreal corridor. Start with the real client case study, introduction, résumé, and contact information. A short, intentional exhibition can be distinctive with one substantial case study; no invented personal projects or empty frames are needed.

Publish the useful HTML foundation early, then add the first finished corridor experience within the initial milestone. The corridor remains part of the accepted project scope. Its arrival should not delay a credible application link if the underlying content is ready.

## Must-have capabilities

| Capability | Visitor value | Complexity | Scope and acceptance |
|---|---|---|---|
| Clear identity and direct navigation | Understand who built the work and reach it immediately | Low | Public name, concise introduction, Projects, About, Résumé, Contact. Never require walking to reach these destinations. Owner must supply actual identity and links. |
| One credible client case study | See real delivery evidence | Medium | Distinguish the website, manual Wi-Fi planner, and constrained chatbot/tool-use MVP as three contracts. Explain problem, contribution, constraints, solution, and substantiated result; include permitted screenshots and live link. |
| Readable project URLs | Share and revisit a specific piece of work | Medium | Pre-rendered HTML case-study pages, headings, image descriptions, working anchor links, page titles, and sharing metadata. Core content remains usable when the scene or JavaScript fails. [S6, S7] |
| One-handed corridor movement | Explore without learning game controls | High | Native downward scroll/swipe advances; upward input retreats. Ground-inspired forward/back controls are actual labeled buttons with stable screen-space hit areas. Wheel, touchpad, touchscreen, and keyboard journeys work independently. [S1–S3] |
| Click/tap project access | Open evidence from the exhibit | Medium | Each exhibit has an equivalent HTML link. No hover-only action, timed gesture, pointer lock, pinch, or simultaneous key-and-pointer requirement. [S1, S2] |
| Predictable return navigation | Resume browsing without losing place | Medium | Project link opens a canonical page; browser Back restores corridor location. Test refresh and direct entry. Prefer normal pages for launch; overlays are optional and require additional focus/history handling. [S8, S9] |
| Complete motion-free experience | Read everything without forced camera travel | Medium | Respect `prefers-reduced-motion` from first render; provide a visible motion control. Motion-free mode uses the same content and direct navigation without camera interpolation, parallax, or ambient movement. [S4, S5] |
| Responsive and accessible HTML controls | Read and operate on small screens and assistive tools | Medium | Visible focus, meaningful labels, logical tab order, sufficient contrast, browser zoom and text reflow. Adopt at least 44×44 CSS px for primary navigation targets as a project design goal; WCAG 2.2 AA's target-size minimum is 24×24 with exceptions. [S1] |
| Loading and graphics failure handling | Reach work on restricted or weak devices | Medium | Show content immediately while 3D loads independently; provide a usable fallback on renderer startup failure, asset failure, or context loss. Scene failure must not hide navigation. [S10, S11] |
| Data-driven project growth | Publish new completed work frequently | Medium | One validated content record supplies list, case-study URL, and exhibit. Stable slug, explicit order, status, image descriptions, and optional public source link. Adding one completed project extends the corridor without rewriting navigation. |
| Tested automated delivery | Keep a public application link reliable | Medium | Version-controlled content, build/content checks, preview or staging validation, deployment after checks, production smoke check, and a documented rollback. Record the pipeline as portfolio evidence only once implemented. |

## Distinctive features worth building

| Feature | Why it fits this portfolio | Timing |
|---|---|---|
| One coherent surreal visual language | Impossible architecture, unusual scale, lighting, and floating exhibits can establish identity without a large asset collection | Initial corridor; choose a small number of original motifs in the UI design phase |
| Expanding spatial chronology | The path visibly grows with completed work while the client story stays easy to find | Basic ordering in v1; additional exhibits arrive only as work exists |
| Case study showing three engagements | Shows the evolution from website to planning tool to a limited AI interface | Foundation; use accurate distinctions instead of splitting one client into misleading employer entries |
| Portfolio engineering case study | The visitor can experience the frontend and inspect publicly shareable delivery work | After the relevant rendering, accessibility, and CI/CD capabilities are implemented |

## Optional additions

- An overlay presentation for project previews, if ordinary pages already satisfy direct links and return navigation. Follow the WAI dialog pattern when implementing a modal. [S8]
- Adaptive scene quality after measuring the baseline on real devices; retain explicit motion-off behavior regardless of quality settings.
- Small contextual surprises or extra room variants once core navigation is reliable. Essential content must not depend on discovering them.
- ChudCode or another personal project once its completion status, actual behavior, evidence, and public repository are confirmed. No weekly publication promise or fixed project quota.
- A build journal only if the owner wants to maintain it. It is not a launch requirement.

## Exclusions

| Exclusion | Reason | Use instead |
|---|---|---|
| Free roaming, WASD plus mouse, or pointer lock | Conflicts with the chosen one-handed path interaction | Bidirectional native scroll and individual tap controls |
| Mandatory loading/intro sequence before résumé or projects | Delays the portfolio's main purpose | Immediately usable HTML navigation and content |
| Continuous auto-walking, camera bob, or obligatory cinematic transitions | Creates motion and control problems | Visitor-driven progress with a motion-free option |
| Rebuilding or embedding the client's complete planner | Expands scope and creates ownership and dependency issues | Screenshots, a bounded explanation, and a live link |
| Chatbot inside this portfolio, user accounts, or a database-driven CMS | No established visitor need; introduces ongoing complexity | Version-controlled content and direct contact links |
| Placeholder achievements, fake usage statistics, or filler projects | Misrepresents the available evidence | Launch with the real work and grow honestly |

## Dependencies and roadmap implications

1. **Content foundation and delivery:** define case-study records and canonical URLs; collect real résumé/contact/assets; implement readable pages and automated deployment. This can produce the earliest useful public release.
2. **Visual and interaction foundation:** approve the visual motif, screen-space controls, motion modes, and initial performance budgets; prototype one corridor segment using native scroll.
3. **Integrated exhibition:** connect exhibits to the same records and routes; verify back navigation, graphics failure, keyboard/touch input, and reduced motion before extending the scene.
4. **Growth and launch hardening:** exercise adding a real or test-only draft record, confirm previous routes stay stable, validate the production deployment, and document maintenance. Test fixtures must not ship as public accomplishments.

The reusable record format precedes both the corridor and weekly additions. Motion alternatives and HTML routes precede visual polish because they determine how the experience is structured. Performance validation begins with the first representative scene rather than waiting for all visual work to finish.

## Content readiness still required

Before publishing, obtain the owner's display name, introduction, résumé, contact destinations, actual live client URL, and permitted screenshots. Confirm client naming, contract dates, supported blueprint extension (verbal “dfx,” possibly DXF), exact three MVP scenarios, deployment boundaries, and any outcome claims. The illustrative coverage percentage is not a verified metric. No assumption about a particular target job title is needed.

## Sources

All accessed 2026-09-19. W3C's WCAG 2.2 recommendation incorporates its December 2024 republication; the interaction-animation guidance shows a September 2025 update. MDN touch-action shows an April 2026 update. These are documentation checks, not a competitor-conversion study.

- **S1:** [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — keyboard, focus, contrast, reflow, and target sizing.
- **S2:** [W3C Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) — simple pointer alternatives; keyboard alone does not replace them.
- **S3:** [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) — native panning and zoom behavior.
- **S4:** [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — operating-system motion preference.
- **S5:** [W3C Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) — disabling nonessential motion; this criterion is AAA, adopted here as an explicit product requirement.
- **S6:** [Google Search: developer guidance](https://developers.google.com/search/docs/fundamentals/get-started-developers) — HTML links, URLs, and canvas indexing limitation.
- **S7:** [Google Search: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) — pre-rendering and crawlable content.
- **S8:** [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus entry, contained focus, closing, and focus return.
- **S9:** [MDN scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) — browser scroll restoration behavior.
- **S10:** [MDN WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) — resource and rendering concerns.
- **S11:** [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event) — context-loss detection and simulation.
