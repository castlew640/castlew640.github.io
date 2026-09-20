# Roadmap: Surreal Portfolio

## Overview

Create an early, credible application link backed by real client work, then deliver the distinctive one-handed surreal exhibition and prove that it grows reliably as new work is completed. All three phases belong to v1.0: an early readable release is an intermediate delivery, not a replacement for the 3D corridor. Each phase delivers an end-to-end visitor or owner capability. Phase boundaries are not week estimates or a personal-project publication quota.

Planning baseline: Astro static HTML/content collections, TypeScript, and a React Three Fiber/Three.js WebGL2 enhancement. Exact compatible versions, GitHub destination, and hosting are selected during Phase 1 planning. The first content is one featured client story covering three distinct contracts.

## Phases

- [x] **Phase 1: Publishable Portfolio and Delivery** - Present real professional evidence through a readable site and working automated delivery. (completed 2026-09-19)
- [ ] **Phase 2: One-Handed Surreal Exhibition** - Let visitors explore a distinctive corridor and its projects with scroll, swipe, or simple taps.
- [ ] **Phase 3: Growth and Release Polish** - Make additions repeatable and verify performance, visual refinement, and production reliability.

## Phase Details

### Phase 1: Publishable Portfolio and Delivery

**Goal:** As a prospective employer, I want to use a public portfolio to understand William Castle's work and reach his resume and contact details, so that I can assess his ability and contact him while checked updates publish reliably.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** PROF-01, PROF-02, PROF-03, WORK-01, WORK-02, WORK-03, WORK-04, NAV-01, ACCESS-01, ACCESS-02, ACCESS-03, GROW-02, GROW-03, SHIP-01, SHIP-02
**UI hint:** yes
**Success Criteria:**

1. A visitor can read the owner's confirmed introduction, open the real resume, and use contact links through direct navigation on desktop and mobile, with keyboard focus and zoom/reflow intact.
2. A visitor can directly open and refresh a shareable client case-study URL containing three accurately distinguished contracts, approved screenshots, and the confirmed live link; essential content works without JavaScript.
3. The owner can build from one validated content collection; invalid metadata, duplicate IDs, and missing local assets fail checks, while drafts stay absent from public routes, lists, and serialized content.
4. A successful default-branch update publishes the checked artifact to the selected public host; a deliberately failing check prevents publication and leaves the prior release available.
5. The early site has a deliberate readable visual identity and verified owner-supplied content. Required repository/hosting choices and real publication inputs are resolved before it is presented as live.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Prove the static profile walking skeleton with a package legitimacy gate and browser-first contract.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Turn approved owner/client evidence into validated content, canonical case-study HTML, and real resume/contact navigation.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Enforce accessibility/content checks and deploy the exact checked artifact to GitHub Pages with failure-preservation evidence.

Planning notes: establish project structure, typed content, basic UI contract, and meaningful route/content checks. Obtain actual identity/assets and destination choices rather than inventing public values. Use a vertical delivery slice; avoid completing disconnected technical layers before a usable page exists. The richer surreal scene remains Phase 2 scope.

### Phase 2: One-Handed Surreal Exhibition

**Goal:** Visitors can explore a memorable surreal corridor, open the real work, and return to their place using one hand, with a complete still presentation available.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, ART-01, ART-02, ACCESS-04, ACCESS-05
**UI hint:** yes
**Success Criteria:**

1. The working corridor matches the UI design contract's original Dali-inspired composition, lighting, typography, and motifs; it feels intentionally complete with the real published exhibit count and a clear ending.
2. A visitor can advance and retreat using native scroll/swipe or labeled large tap arrows, reach both endpoints predictably, and complete the full visit without simultaneous inputs or required dragging.
3. A visitor can click/tap an exhibit or use its visible HTML link to open a project; browser Back/Forward and the explicit return link lead back to the expected exhibit with sensible focus.
4. Reduced motion is honored before spatial animation begins, a visible still-view control is available, and scene/asset/context failures preserve complete readable navigation and content.
5. The initial representative scene is exercised with mouse, touch, and keyboard, including mobile swipe-versus-tap behavior and browser zoom; preliminary device and asset measurements constrain further visual work.

**Plans:** TBD during phase planning

Planning notes: create the visual/interaction contract before extensive asset work. Use native document scroll as the authoritative travel position, one scene boundary, canonical project routes, and motion/failure policy from the start. Ground arrows may be visual meshes, but simple HTML controls must retain stable target sizes. A modal is optional future scope. Phase 3 owns final performance acceptance; it is not the first time performance is measured.

### Phase 3: Growth and Release Polish

**Goal:** The owner can extend the exhibition with completed projects while visitors retain a polished, responsive experience and a reliable live application link.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** GROW-01, GROW-04, PERF-01, PERF-02, SHIP-03, SHIP-04
**UI hint:** yes
**Success Criteria:**

1. Following the authoring guide, the owner can add a project and assets to generate its route, index entry, and exhibit without renderer/navigation edits; existing URLs and earlier exhibit ordering remain stable. Verification fixtures do not publish as accomplishments.
2. The complete exhibition is measured against the documented desktop/mobile and transfer/frame-time budgets, including an expanded content fixture; resource counts stabilize across repeated visits and hidden/inactive rendering stops.
3. Visual refinement preserves the agreed surreal identity and the complete one-handed, keyboard, narrow-screen, reduced-motion, and graphics-failure journeys from earlier phases.
4. Production smoke checks verify HTTPS, direct project refresh, images, resume, contact destinations, and navigation on the actual chosen host.
5. The owner can recover a prior known-good release using the documented rollback procedure, and any public description of this site's rendering or CI/CD reflects demonstrated behavior.

**Plans:** TBD during phase planning

Planning notes: require real device evidence for claims about physical-device performance; record any checks still awaiting hardware access. Refine the existing art direction and budgets rather than expand into new scenes, a CMS, or unrequested product features. This completes the initial immersive milestone; subsequent completed projects are normal content updates.

## Progress

Execution order: Phase 1 → Phase 2 → Phase 3.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Publishable Portfolio and Delivery | 3/3 | Complete   | 2026-09-19 |
| 2. One-Handed Surreal Exhibition | 0/TBD | Not started | - |
| 3. Growth and Release Polish | 0/TBD | Not started | - |

## Coverage

30 v1 requirements map to exactly one phase: 15 in Phase 1, 9 in Phase 2, and 6 in Phase 3. Complete traceability is in [REQUIREMENTS.md](REQUIREMENTS.md). No implementation plans or application features are complete yet.

---
*Created: 2026-09-19 under the approved autonomous, coarse-granularity workflow*
