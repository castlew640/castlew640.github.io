# Phase 3: Growth and Release Polish - Context

**Gathered:** 2026-09-20 (America/New_York)
**Status:** Ready for planning

<domain>
## Phase Boundary

Make adding completed projects repeatable, refine the existing surreal exhibition and public copy, and verify performance and reliable operation on the selected GitHub Pages host. Deliver the authoring and release runbooks, project-growth proof, measured release evidence, production smoke checks, and exercised recovery required by GROW-01, GROW-04, PERF-01, PERF-02, SHIP-03, and SHIP-04.

This discussion explicitly revises the earlier straight corridor and immersive mobile default. The winding path, warped architecture, copy refinement, and small contact interaction are refinements of this exhibition. Optional project-page video is part of project evidence. No new rooms, free-roaming controls, CMS, donation system, or separate product is requested.

Phase 2 implementation is complete but its recorded human/device acceptance remains pending. Discussing Phase 3 and preferring a lightweight handoff do not constitute results for those unrun checks.

</domain>

<decisions>
## Implementation Decisions

### Adding completed projects
- **D-01:** Provide a copyable starter project folder, a Markdown template, and a short publishing guide. The owner adds media and edits the entry directly. A guided scaffolding command is not required.
- **D-02:** Default to a short case study: what the project does, why it exists, key decisions, results, and relevant evidence/links. Also support compact showcases for small or playful projects and technical deep dives for projects that warrant architecture, tradeoffs, experiments, and lessons. Do not force every project into the same narrative depth or into the client's three-contract format.
- **D-03:** Choose exhibit media per project, favoring real usage. App screenshots, readable terminal/output captures, and explanatory diagrams or illustrations can suit different work. Support appropriate repository and demo links; the project type should not require inventing an app screenshot or hosted demo.
- **D-04:** Allow optional click-to-play video demos **on the project page**, with a still preview in the gallery. Playback begins only on visitor action. Native/simple accessible playback is sufficient; a custom player, video texture in the 3D gallery, and external-video-only presentation were not selected. Video hosting, formats, loading policy, and accessible supporting text remain research/planning details.
- **D-05:** Preserve the roadmap's growth contract: content plus assets generates the canonical route, index entry, and exhibit without renderer/navigation edits. Append completed work farther along the gallery while retaining earlier ordering and URLs. Keep drafts and expanded-content verification fixtures out of public accomplishments and serialized public content.

### The portfolio as a project
- **D-06:** Add a real project exhibit for this portfolio **after the client work**, with its own case study. Publish only implemented, evidenced capabilities. No placeholder personal-project collection or walkthrough-video requirement is introduced.
- **D-07:** Lead its story with making an ambitious visual experience usable: one-handed travel, readable content, accessibility, and graceful graphics failure. Rendering, content growth, and automated delivery support that story.
- **D-08:** Use annotated screenshots of the immersive gallery and illustrated still view as the main evidence. Highlight concrete readability and control choices.
- **D-09:** Include concise decision notes and tradeoffs, with a clear public repository link for deeper inspection. Inline code excerpts and a large collection of links to individual source/test files are not required.

### Visual polish and movement
- **D-10:** Prioritize transitions, composition, readability, and stronger visual impact. The owner specifically dislikes the current translucent/low-opacity labels. Refine their treatment so text feels deliberate and remains clearly legible; the exact panel treatment is delegated to design.
- **D-11:** Make the existing environment more visibly surreal: architecture should **curve over and warp**. Retain the ivory architecture, precise ink, emerging construction, reflective surface, and completed-versus-unfinished reflection concept. This is a stronger realization of that identity, not an unrelated new setting.
- **D-12:** Replace the straight-axis journey with a **gently winding path that rises, dips, and moves left and right**. The owner wants more spatial character without exaggerated motion.
- **D-13:** The viewpoint turns gently with the route while keeping the horizon level. Native document scroll/swipe remains the authority for forward and backward travel; labeled arrows, meaningful stops, canonical project routes, and understandable return location remain required.
- **D-14:** Give exhibits and resume/contact areas calm, readable framing. Warping the environment must preserve clear project evidence, usable controls, and immediate direct access to essential content.

### Mobile and motion defaults
- **D-15:** **Phones open the illustrated still catalogue by default**, with a visible option to enter the 3D exhibition. This explicitly replaces the Phase 2 immersive-by-default phone direction.
- **D-16:** Extensive phone-specific visual tuning is a low priority relative to desktop composition, transitions, and readability. Preserve a complete, readable, one-handed mobile catalogue and functional optional 3D. Continue to respect reduced motion, user view choice, failure recovery, keyboard access, and ordinary browser scrolling/zoom. This preference does not authorize reporting unrun phone tests as passed.

### Professional voice and wording
- **D-17:** William's selling point is talking with someone, understanding technical details, identifying their actual goal, and choosing a useful way to reach it. That can mean custom software, an existing tool, or research. Do not describe his value solely as writing new code.
- **D-18:** A pitch is appropriate. The copy should convey capability/confidence and a reasonable person someone would be comfortable working alongside. Use concrete details and a natural, conversational voice; avoid inflated corporate slogans. Do not overcorrect into hiding his strengths, excessive modesty, or forbidding persuasive copy.
- **D-19:** Keep the **W/C** mark and change its caption to **“Software & solutions.”** The owner considered alternatives and retained this choice. Do not revert it to “Software” or “Software & possibilities” based on the earlier recommendation.
- **D-20:** The owner likes the current introduction and the emphasis on understanding the client's goal. Preserve that substance. Remove **“Ideas, considered. Software, delivered.”** Replace **“What could we build together?”** Review the surrounding copy for a consistent voice rather than changing only those two strings.
- **D-21:** Use the accepted About draft in the Specific Ideas section as the voice reference. The owner said it was close to the right voice; it is a working draft, not a mandate to preserve every word. Retain confirmed distinctions between the three contracts and the limited AI MVP; do not invent achievements or personal history.
- **D-22:** Contact heading: **“Talk shop with me.”** Place a small outlined beer glass beside it in the site's architectural drawing style. Clicking/tapping the glass fills it with amber beer. Keep the actual email link clearly visible underneath. This is an optional playful detail, not the contact mechanism or a donation/payment/booking feature. Carry normal keyboard, motion, and fallback requirements into this small interaction.
- **D-23:** Do not use **“Beer optional”**; the owner explicitly disliked it. “Buy me a beer,” “after-five meetings only,” and “git shit done” were exploratory jokes, not final public copy, availability rules, or requests for new services. The practical attitude can inform the tone without publishing those phrases.

### Release handoff and verification
- **D-24:** Write a **concise runbook**: commands, expected results, and short checklists for publishing, checking the live site, and restoring a known-good release. Keep the established public repository and GitHub Pages/Actions destination, with successful default-branch updates deploying the exact checked artifact.
- **D-25:** Give the owner a **short checklist to run independently**, not a guided session or prolonged subjective review ceremony. The owner's practical priority is that the site is live and working. Focus their effort on the live visitor journey: project access, resume/contact, and the new presentation defaults. The agent handles repeatable automated verification and records issues/evidence.
- **D-26:** Retain the roadmap's objective release checks: documented transfer/frame-time budgets, the representative Windows Chrome and physical iPhone targets, expanded-content tests, stable resources across visits, suspension when hidden/inactive, real-host HTTPS/routes/assets/navigation checks, and exercised rollback. Keep physical-device results distinct from emulation and mark unavailable evidence pending. Minimal owner review does not waive these requirements or sign off earlier pending tests.

### Explicit precedence over prior decisions
- **D-27:** D-12/D-13 supersede the straight-axis decision in `02-CONTEXT.md` and fixed-camera-position assumptions in `02-UI-SPEC.md`. D-15 supersedes that phase's immersive phone default. D-19/D-20/D-22 supersede the affected existing wordmark, slogan, and contact copy. Planning must reconcile the design contract and affected assertions rather than treating obsolete constants or wording as immutable requirements.
- **D-28:** All unaffected commitments carry forward: the selected identity/contact destinations, accurate client story, client source privacy, one-handed input, native scrolling, complete ordinary HTML, reduced-motion/failure presentation, stable URLs/order, verified publication claims, and checked-artifact deployment. The current implementation is **Astro plus vanilla Three.js**, not React/R3F; the older research baseline was superseded during Phase 2.

### Agent's Discretion
- Routine implementation and verification choices remain delegated under the project's existing preferences. No additional product scope was delegated by selecting the concise runbook or independent checklist.
- Choose exact path curvature, elevations, architectural deformation, calm stop framing, label surfaces, visual timing, responsive thresholds, and the small glass's accessible/motion-safe implementation within the decisions above.
- Choose the smallest content/schema changes that support flexible personal projects and optional video while preserving the detailed client case study. Exact field names, starter-folder layout, video delivery mechanics, test-fixture size, and runbook organization are research/planning decisions.
- Establish evidence and adjust the implementation to fit existing budgets; do not silently raise limits or claim physical-device performance from automated Chromium measurements.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope, status, and earlier decisions
- `.planning/ROADMAP.md` — Phase 3 goal, six assigned requirements, growth/performance/release success criteria, and phase boundaries.
- `.planning/REQUIREMENTS.md` — complete functional, accessibility, content-accuracy, performance, and delivery requirements.
- `.planning/PROJECT.md` — hiring purpose, real client background, one-handed operation, and routine-work preferences. Later confirmed choices take precedence over its historical open questions.
- `.planning/STATE.md` — current execution/deployment state and outstanding acceptance; do not infer completion from discussion.
- `.planning/phases/01-publishable-portfolio-and-delivery/01-CONTEXT.md` — confirmed name, introduction, client facts, hosting/account, assets, and contact decisions. Retain unrelated local edits to this document.
- `.planning/phases/02-one-handed-surreal-exhibition/02-CONTEXT.md` — inherited world, reflection, exhibit, interaction, and test-target decisions, with the explicit overrides above.

### Design and evidence to reconcile
- `.planning/phases/02-one-handed-surreal-exhibition/02-UI-SPEC.md` — existing visual/interaction contract and budgets; amend straight-axis/mobile/copy assumptions affected by this discussion while preserving unaffected requirements.
- `.planning/phases/02-one-handed-surreal-exhibition/02-MEASUREMENTS.md` — initial scene evidence and limits, including the observed five-texture count with one unattributed allocation and outstanding physical-device evidence.
- `.planning/phases/02-one-handed-surreal-exhibition/02-UAT.md` — four pending acceptance checks, including mobile landing clearance; revised Phase 3 presentation needs matching checks, not invented previous results.

### Architectural baseline
- `.planning/research/ARCHITECTURE.md` — validated shared content, ordinary HTML, native-scroll travel, graceful failure, and checked build artifacts.
- `.planning/research/STACK.md` — background tradeoffs for static content and delivery. Current source and Phase 2 amendments supersede the earlier React/R3F proposal.

No new external specification, ADR, or third-party visual reference was supplied during this discussion. The owner referenced the current site's actual copy, examined in `src/data/profile.ts`, `src/pages/index.astro`, and `src/layouts/BaseLayout.astro`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content/projects/featured-client/` contains the real case study and permitted screenshots; keep its three-contract structure and claims intact.
- `src/lib/projects.ts` filters published entries and sorts by `exhibitionOrder`; canonical routes, the initial HTML, and scene metadata already share content.
- `src/components/exhibition/ExhibitionShell.astro`, `StopSection.astro`, and `drawings/` provide the complete illustrated document and architectural drawing language. Reuse this for the default phone presentation and glass motif.
- `src/scripts/exhibition/policy.ts` already handles reduced motion, explicit still/moving choices, and storage failure. The new phone default must integrate with that policy and the existing view toggle.
- `src/scripts/exhibition/scene/quality.ts`, `scripts/measure-scene-budget.mjs`, and existing browser tests provide initial quality/budget/lifecycle checks; the Phase 2 measurements explain their evidence limits.
- `.github/workflows/pages.yml` checks the build and deploys the uploaded artifact on successful `master` pushes to GitHub Pages. Preserve that behavior.

### Established Patterns
- Astro static output, TypeScript, bespoke CSS, and one lazy vanilla-Three.js enhancement. Essential content is ordinary HTML; project pages do not need the scene.
- Native document scroll currently maps onto scalar stop positions. View policies, large HTML arrows, canonical routes, and focus/history behavior surround that travel model.
- Draft filtering, metadata/asset validation, focused browser checks, and checked-artifact delivery are established. Additions must preserve these guarantees.
- Runtime motion derives from travel; demand rendering, resource disposal, and failure fallback already exist. Winding-path refinement must retain those lifecycle properties.

### Integration Points and Known Constraints
- `src/content.config.ts`, `src/lib/project-schema.ts`, and `src/lib/project-validation.ts` currently require the specific three client contracts; validation also requires published projects to have a live URL and screenshots. These are concrete obstacles to CLI/library/personal-project entries. Generalize appropriately without weakening validation of the existing client record.
- `src/components/exhibition/ExhibitSection.astro` assumes `screenshots[0]` and renders contract labels; `src/pages/projects/[...slug].astro` hardcodes the featured-client/three-contract presentation. Both need to accommodate the selected flexible personal-project formats, repository links, and page-only video.
- `src/lib/exhibition/stops.ts`, `src/scripts/exhibition/scroll.ts`, and the controller connect content order, travel, and return anchors. Keep append behavior and stable identifiers as the gallery grows.
- `src/scripts/exhibition/scene/index.ts` fixes camera x/y and forward look direction, selects/project-labels using z-based assumptions, and updates transformations from camera z. Scene architecture/exhibit placement also assumes the straight route. Research the whole path/framing relationship, not just cosmetic camera sway; geometry, captions, picking, shadows/reflections, and returns must agree.
- Existing tests assert fixed camera/framing facts and a one-project scene. Reconcile only genuinely superseded assertions and extend growth coverage; preserve actual behavior/accessibility checks.
- `src/data/profile.ts`, `src/pages/index.astro`, and `src/layouts/BaseLayout.astro` hold the wording discussed. `src/styles/global.css` controls the label/overlay treatment. The contact glass belongs beside the contact heading with the email remaining an ordinary link.
- No root README or dedicated authoring/release guide was found during scouting. The requested concise documentation must be created, not merely point to nonexistent guidance.

</code_context>

<specifics>
## Specific Ideas

### Accepted About voice reference

The owner selected this as close to the right voice:

> I’m good at talking through a problem with someone, getting into the technical details, and figuring out what they actually need. Sometimes that means building software. Sometimes an existing tool makes more sense, or we need to do some research before deciding.
>
> I’ve been the sole developer across three client contracts: a website, a Wi-Fi planner, and an AI demo. That involved figuring out what mattered to the client, making choices within their budget, and getting the work running.

The existing liked introduction is: “I build software around what people are trying to achieve, from the first idea to deployment.” Preserve its substance while letting About explain the broader problem-solving approach.

### Visual and personality direction
- The current world is impressive to the owner, but the straight walk feels too ordinary. Their word is **“wonkier”**: mild rises/dips/bends and buildings that curve over and warp, with clear resume/project content.
- The owner evaluates a colleague partly by whether they would want to spend many working hours with them. The copy should feel capable and approachable; a confident pitch is welcome, generic corporate slogans are not.
- The glass provides a small discoverable joke through its response to a click. No explanatory “Beer optional” punchline is wanted.
- A technical open-source project can warrant architecture and experiments; a fun small project can be a compact showcase. The template should accommodate both without unnecessary authoring work.

</specifics>

<deferred>
## Deferred Ideas

None added to the roadmap backlog. Optional video, the portfolio's own case study, revised path/mobile/copy, and the glass interaction are included in this phase's growth and polish decisions.

Existing future options such as extra rooms, in-place project dialogs, and a development journal remain outside this phase. Exploratory rejected slogans and beer/donation jokes are not deferred feature requests. No new personal-project build is a prerequisite for this release.

</deferred>

---

*Phase: 03-growth-and-release-polish*
*Context gathered: 2026-09-20 (America/New_York; completed 2026-09-21 UTC)*
