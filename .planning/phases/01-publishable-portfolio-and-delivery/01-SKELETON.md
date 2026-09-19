# Walking Skeleton — Surreal Portfolio

**Phase:** 1
**Generated:** 2026-09-19

## Capability Proven End-to-End

William's confirmed profile and one validated client case study flow from versioned local content into readable static HTML, pass built-artifact checks, and publish unchanged to the selected GitHub Pages account site.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro 7 static output with strict TypeScript | Produces initial HTML and canonical project routes without a runtime server. |
| Data layer | One local Markdown content collection plus typed profile data | One validated source can drive routes, the home index, and Phase 2 exhibit metadata without a database or CMS. |
| Auth | None | The public portfolio has no account or protected-data requirement. |
| Deployment target | GitHub Pages at `https://castlew640.github.io`, deployed by GitHub Actions | This is the locked public destination and supports promotion of a checked static artifact. |
| Directory layout | Astro routes/layouts/components under `src/`, project Markdown under `src/content/projects/`, public resume under `public/`, checks under `tests/` and `scripts/` | Separates owned content, rendering, static assets, and release checks while keeping the project small. |

## Stack Touched in Phase 1

- [ ] Project scaffold — Astro, strict TypeScript, npm lockfile, Playwright
- [ ] Routing — `/` and at least one canonical `/projects/{id}/` route
- [ ] Data flow — validated Markdown/profile read and static `dist/` write (the architecture intentionally has no database)
- [ ] UI — native navigation and project links exercising the generated routes without JavaScript or an API
- [ ] Deployment — the checked `dist/` artifact published unchanged by GitHub Actions to GitHub Pages

## Out of Scope (Deferred to Later Slices)

- React, React Three Fiber, Three.js, WebGL, and the scroll-driven corridor (Phase 2)
- Renderer navigation, exhibit-return state, reduced-motion scene policy, and scene-failure handling (Phase 2)
- Repeatable addition of new completed exhibits and final performance/release polish (Phase 3)
- A database, API server, authentication, hosted CMS, contact-form backend, or private client source code
- Resume editing, invented client details, unsupported metrics, and unapproved evidence

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without replacing its static HTML, canonical route, or checked-artifact boundaries:

- Phase 2: add the one-handed surreal corridor as a progressive enhancement driven by native document scrolling.
- Phase 3: prove repeatable project growth, measured performance, production smoke checks, and rollback.
