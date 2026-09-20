# Phase 2: One-Handed Surreal Exhibition - Context

**Gathered:** 2026-09-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the one-handed surreal exhibition: a readable portfolio remains directly accessible while visitors can travel through a bounded architectural gallery with native scroll or swipe, large tap arrows, project exhibits, return navigation, reduced-motion presentation, and a complete fallback when 3D fails.

The gallery should feel like an emerging place rather than a generic game level. Phase 3 owns final performance acceptance, growth tooling, and production polish.

</domain>

<decisions>
## Implementation Decisions

### World and atmosphere
- **D-01:** The world is an emerging gallery. A partly enclosed ivory entrance opens into a roofless gallery above a still reflective surface.
- **D-02:** The atmosphere is sunlit and quietly uncanny: warm ivory architecture, pale sky, long shadows, and calm stillness.
- **D-03:** The signature impossibility is impossible construction. Solid ivory architecture can rest on thin drawing lines; columns, arches, and unfinished outlines need not obey ordinary structural logic.
- **D-04:** Precise architectural ink is the language of unfinished elements: fine dark lines, deliberate curves, and restrained construction marks.
- **D-05:** The reflective surface is part of the concept. Reflections reveal completed architecture even where the visible structure remains fragmentary or drawn.
- **D-06:** Different stages coexist, with a few deliberate transformations tied to approach. For example, a drawn arch may gain depth or a supporting structure may assemble as the visitor nears it.

### Exhibits and project evidence
- **D-07:** Each project is an architectural display: real software imagery held inside a structure that is partly solid and partly drawn.
- **D-08:** The initial client case study is one substantial exhibit with one main screenshot, a short introduction, and three clearly labeled contracts: Website, Manual Wi-Fi planner, and AI planner MVP.
- **D-09:** A fine construction-line annotation leads from the exhibit to a visible **“Read case study →”** link. The image and ordinary HTML link remain discoverable without hover.
- **D-10:** Future exhibits share a recognizable design language but vary their surrounding arches, supports, and unfinished geometry so the exhibition gains character without losing navigational familiarity.

### Visitor journey and controls
- **D-11:** The first exhibit is visible just beyond the entrance, with William's name and introduction integrated into the opening architecture.
- **D-12:** Travel follows a clear, mostly straight forward axis. Exhibits face the visitor; arches, reflections, and incomplete walls provide variation around the path.
- **D-13:** The visit ends at a quiet final landing: one last arch frames the reflective horizon, with an invitation to get in touch plus resume and contact access.
- **D-14:** Large labeled ground-inspired forward/back arrows sit low in the view, aligned with the walkway and rendered in the architectural ink language. They supplement native document scrolling and single-finger swiping.
- **D-15:** Opening a project and returning preserves the visitor's understandable place in the gallery; the equivalent visible HTML link remains available.

### Narrow-screen, motion, and test targets
- **D-16:** On a phone, the experience remains an immersive portrait view. One exhibit and its readable label are framed clearly at a time, with arrows within easy reach.
- **D-17:** Still view and reduced motion use an illustrated exhibition catalogue: ordinary scrolling, real project images, static architectural drawings, and reflection motifs, with no camera travel or ambient animation required.
- **D-18:** Representative manual test targets are an iPhone 12 Pro and a Windows laptop using Chrome. Confirm the mobile browser during implementation testing; Safari is the expected default unless the owner specifies another browser.

### the agent's Discretion
- Exact architectural dimensions, camera framing, ink stroke widths, color values, typography, asset formats, scene graph organization, and transition timing remain implementation and research choices.
- Choose the smallest scene and asset set that communicates these decisions while preserving direct HTML access and a complete still fallback.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, requirements NAV-02 through NAV-06, ART-01 through ART-02, and planning notes.
- `.planning/REQUIREMENTS.md` — authoritative one-handed navigation, visual, accessibility, performance, and delivery requirements.
- `.planning/PROJECT.md` — core value, original corridor concept, one-handed constraint, and content boundaries.

### Architecture and technical baseline
- `.planning/research/ARCHITECTURE.md` — native document scroll as travel authority, canonical project routes, one scene boundary, and failure behavior.
- `.planning/research/STACK.md` — Astro static output, TypeScript, and focused React Three Fiber/Three.js enhancement baseline.
- `.planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md` — Phase 1 visual identity, content decisions, direct-navigation contract, and confirmed repository/host choices.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 1's semantic home, project routes, content collection, and shared layout should remain the source of truth for exhibit metadata and direct links.

### Established Patterns
- Native document scrolling owns travel; camera position is derived from it. Essential content and navigation remain ordinary HTML.
- A complete motion-free and renderer-failure presentation is required from the start, rather than being added after the 3D scene.

### Integration Points
- The scene consumes published project/exhibit metadata from the validated content boundary.
- Exhibit links connect to canonical project routes and return to the same gallery location.
- Shared navigation keeps Projects, About, Resume, and Contact directly reachable without traversing the scene.

</code_context>

<specifics>
## Specific Ideas

- A continuous ivory floor can guide visitors from the partly enclosed entrance into the roofless gallery.
- The open gallery may stand over a still reflective surface; reflections can show the finished form of incomplete architecture.
- The composition should feel calm and believable before the construction impossibilities reveal themselves.
- The first client display should be substantial enough to make a one-project exhibition feel complete.

</specifics>

<deferred>
## Deferred Ideas

- Extra rooms, in-place project dialogs, development journal features, and other optional surprises remain outside this phase unless the roadmap changes.
- Final physical-device performance claims and expanded-content budgets belong to Phase 3; Phase 2 only establishes representative testing and preliminary measurements.

</deferred>

---

*Phase: 02-one-handed-surreal-exhibition*
*Context gathered: 2026-09-19*
