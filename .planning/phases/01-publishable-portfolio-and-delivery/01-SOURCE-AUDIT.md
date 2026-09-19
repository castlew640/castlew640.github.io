# Phase 1 Multi-Source Coverage Audit

| Source | ID | Feature / constraint | Plan | Status | Notes |
|---|---|---|---|---|---|
| GOAL | — | Public link explains William's work, reaches resume/contact, and supports checked automatic publication | 01-01, 01-02, 01-03 | COVERED | Walking skeleton → real evidence → live checked artifact. |
| REQ | PROF-01 | Confirmed name, introduction, graduate background | 01-01 | COVERED | Static profile slice. |
| REQ | PROF-02 | Actual resume link | 01-02 | COVERED | Owner input gate forbids placeholder completion. |
| REQ | PROF-03 | Owner-supplied contact destination | 01-02 | COVERED | Email-first profile data. |
| REQ | WORK-01 | Three distinct client contracts | 01-02 | COVERED | Structured contract IDs and route. |
| REQ | WORK-02 | Approved screenshots, captions, alt | 01-02 | COVERED | Owner gate plus `image()` schema and figures. |
| REQ | WORK-03 | Confirmed live link; local story remains useful | 01-02 | COVERED | External link is additive. |
| REQ | WORK-04 | Canonical, refreshable project URL and metadata | 01-02 | COVERED | Static `getStaticPaths()` route. |
| REQ | NAV-01 | Direct Projects/About/Resume/Contact access | 01-02 | COVERED | Semantic home navigation. |
| REQ | ACCESS-01 | Essential content and links without JavaScript/3D | 01-02 | COVERED | Static HTML and no-JavaScript journey. |
| REQ | ACCESS-02 | Keyboard order, labels, focus, no trap | 01-03 | COVERED | Browser journey plus end-of-phase human check. |
| REQ | ACCESS-03 | Narrow/mobile/zoom reflow and contrast | 01-03 | COVERED | 320px automation plus 200%/400% human check. |
| REQ | GROW-02 | Invalid metadata, duplicate slugs, missing assets fail | 01-02, 01-03 | COVERED | Schema/pure validator and negative checks. |
| REQ | GROW-03 | Draft absent from all public output | 01-03 | COVERED | Sentinel draft plus recursive `dist/` assertions. |
| REQ | SHIP-01 | Automated content/type/build/journey checks | 01-03 | COVERED | Single aggregate release check. |
| REQ | SHIP-02 | Exact checked artifact deploy; failure preserves prior release | 01-03 | COVERED | Dependent Pages job and controlled failure proof. |
| CONTEXT | D-01–D-04 | Catalogue identity, plans becoming places, composed introduction, direct access | 01-01, 01-02 | COVERED | Progressive decoration around ordinary HTML; no Phase 2 scene. |
| CONTEXT | D-05–D-11 | Accurate three-contract story, sole developer, stack/rationale, limited AI MVP, permitted evidence | 01-02 | COVERED | Structured data and owner evidence gate. |
| CONTEXT | D-12–D-15 | Name/introduction, broad graduate positioning, email-first contact, actual resume | 01-01, 01-02 | COVERED | Confirmed fields first, real destinations after gate. |
| CONTEXT | D-16–D-19 | Public selected repo/URL, Pages/Actions, checked artifact contract | 01-03 | COVERED | Remote preflight, least-privilege workflow, failure proof. |
| RESEARCH | — | Astro 7 static output, strict TypeScript, current content-layer APIs | 01-01, 01-02 | COVERED | Exact researched pins and Astro 7 `glob()`/`astro/zod`. |
| RESEARCH | — | Human legitimacy gate for recent Astro and Playwright releases | 01-01 | COVERED | Blocking checkpoint precedes install. |
| RESEARCH | — | Do not install React/Three/R3F in Phase 1 | 01-01 | COVERED | Explicit package/source acceptance gate. |
| RESEARCH | — | One `getPublishedProjects()` boundary and explicit ordering | 01-02 | COVERED | Index and route share it; direct collection queries prohibited. |
| RESEARCH | — | Validate publication fields, contract set, local screenshots, URL schemes | 01-02, 01-03 | COVERED | Schema, pure validation, negative tests. |
| RESEARCH | — | Semantic initial HTML, canonical metadata, skip/focus/figure markup | 01-01, 01-02 | COVERED | Layout and project route contracts. |
| RESEARCH | — | Fail closed on missing real publication inputs | 01-02 | COVERED | Human-action gate and placeholder artifact scan. |
| RESEARCH | — | Playwright no-JS/direct-route/keyboard/narrow/reduced-motion journeys plus axe and manual checks | 01-03 | COVERED | Automated suite includes a reduced-motion context; human end-of-phase review repeats the journey with reduced motion. |
| RESEARCH | — | Build once; test/upload `dist/`; deploy consumes artifact without rebuilding | 01-03 | COVERED | Node 24 setup, npm cache, Chromium installation, workflow, and acceptance assertions are explicit. |
| RESEARCH | — | Account-site origin has no repository base prefix | 01-01, 01-03 | COVERED | Astro config and built-output scan. |
| RESEARCH | — | Full-SHA Actions, least privilege, no PR deployment secrets | 01-03 | COVERED | Workflow task and STRIDE mitigations. |
| RESEARCH | — | Preserve existing remote work; repository/default branch require preflight | 01-03 | COVERED | Blocking remote checkpoint. |
| RESEARCH | — | No database, API, CMS, auth, or contact backend | all | COVERED | Walking skeleton records static content-to-artifact equivalent. |
| RESEARCH | — | 3D corridor, motion/scene failure policy, and renderer packages are later-phase scope | all | EXCLUDED | Explicitly out of Phase 1 in ROADMAP/RESEARCH. |

No source item is missing. Deferred resume review itself, spatial realization, optional dialogs/rooms/journal, and future personal-project content remain excluded exactly as recorded; the actual resume destination is still required through the Phase 1 input gate.
