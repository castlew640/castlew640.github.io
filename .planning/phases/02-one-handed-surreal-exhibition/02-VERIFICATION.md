---
phase: 02-one-handed-surreal-exhibition
verified: 2026-09-21T01:43:58Z
status: human_needed
score: 11/13 must-haves verified
behavior_unverified: 0
overrides_applied: 0
verification_method: reused-agent verifier fallback
human_verification:
  - test: "Approve the complete architectural composition and completed-world reflection."
    expected: "The actual one-exhibit journey feels complete; warm architecture, precise ink, water, impossible supports, and the quiet landing form the approved visual language."
    why_human: "Geometry, layers, pixels, and screenshots establish implementation but cannot establish ART-01/D-05 visual acceptance."
  - test: "Complete the journey on a Windows laptop in Chrome, first with mouse only and then keyboard only, including real 200% and 400% browser zoom."
    expected: "Travel, project entry/return, resume, contact, focus, still view, and all text remain usable without simultaneous inputs or obstructing controls."
    why_human: "Headless Chromium and enlarged-text tests do not reproduce physical operation or actual browser zoom."
  - test: "Complete the journey on an actual iPhone 12 Pro in Safari and record the browser version."
    expected: "Swipe, tap, pinch/pan, thumb-operated arrows, project return, still view, and URL-bar changes work; exhibit and landing text remain reachable and legible."
    why_human: "The automated 390-by-664 DPR-3 touch context is Chromium emulation; Safari, grip, browser chrome, and WebP texture decoding require the device."
  - test: "Review the documented numeric design adjustments with the final composition."
    expected: "Accept or request changes to the native-flow mobile sheet, visible placement corrections, and measured five-allocation texture ceiling with one allocation still unattributed."
    why_human: "The implementation and measurements are explicit; this report does not fabricate a user-approved verification override for differences from the original UI contract."
---

# Phase 2: One-Handed Surreal Exhibition Verification

**Phase goal:** Visitors can explore a memorable surreal corridor, open the real work, and return to their place using one hand, with a complete still presentation available.

**Status: human_needed.** No implementation blocker was identified. Eleven of thirteen merged observable truths are verified; composition acceptance and the required physical/manual validation remain uncertain. The nine requirement implementations are present, but ART-01 and physical one-handed acceptance are not signed off.

This is a **reused-agent verifier fallback**, following `/home/castlewr/.codex/agents/gsd-verifier.toml` because the agent limit prevented a fresh typed verifier. This agent previously implemented part of this phase; the report does not claim independent fresh-agent verification. Actual source, tests, final execution logs, screenshots, and data paths were inspected, rather than accepting summary completion statements as proof. No source was changed and no tests were redundantly rerun during this verification.

Initial verification: no previous `02-VERIFICATION.md` existed. All eight plans/summaries, CONTEXT, UI-SPEC, REQUIREMENTS, ROADMAP, STATE, REVIEW, and final MEASUREMENTS informed coverage. The roadmap labels this phase `mvp` while intentionally retaining a prose goal rather than the verifier template's `As a …` syntax. This metadata caveat is reported without rewriting the goal; the authorized phase outcome and all five roadmap criteria remain the verification contract. No requirement or truth is passed through an override.

## User Flow Coverage

| Step | Expected | Evidence | Status |
|---|---|---|---|
| Arrive | Real introduction, first project, navigation, resume and contact exist before enhancement | `src/pages/index.astro`, validated collection, no-JavaScript and built-content checks | VERIFIED |
| Travel | Native scroll/swipe or labeled arrows move along bounded stops | `scroll.ts`, `controls.ts`, controller synchronization; travel, fractional-endpoint and touch tests | VERIFIED in automated contexts |
| Open work | Screenshot tap and visible link open the same real case study | `scene/exhibit.ts` slug metadata → panel-only raycast → `tap.ts` → existing anchor | VERIFIED |
| Return | Explicit return and browser history preserve a sensible exhibit and focus | Hash handling, native scroll restoration, pageshow/popstate logic; navigation tests | VERIFIED |
| Finish | About, landing, resume and contact remain ordinary readable document content | Home stop sections and real links; complete-content tests; landing screenshot | VERIFIED for availability; physical clearance in UAT |
| Choose still view or encounter failure | Full illustrated catalogue and links remain available | Policy before import, still toggle, recovery and asset-failure tests | VERIFIED |
| Experience the finished work | Coherent composition and comfortable physical one-handed use | Implemented geometry and final captures; device checklist is blank | UNCERTAIN — human acceptance required |

## Observable Truths

The first five rows preserve the roadmap contract. The remaining rows merge distinct plan details without reducing roadmap scope.

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | The corridor matches the original Dalí-inspired composition, lighting, typography, and motifs and feels intentionally complete at the actual exhibit count with a clear ending. | UNCERTAIN — WARNING | Real vestibule, threshold, roofless water gallery, typography, portal, cornice, landing and end announcement exist. Desktop exhibit and portrait landing captures inspected. Aesthetic approval, D-05 clarity, and landing composition require human judgment. |
| 2 | Native scroll/swipe and large labeled arrows travel forward/back with predictable endpoints; no simultaneous inputs or dragging are required. | VERIFIED | No wheel/touch scroll hijack; DOM stop measurements own camera progress. Controls use live positions and a 0.5 CSS-pixel arrival tolerance, keep focus, and do not push history. Passing tests cover segment midpoints, first/interior/final stops, fractional DPR-3 arrival, target sizes, and one-finger touch travel. |
| 3 | Mesh tap or equivalent HTML link opens the project; browser Back/Forward and explicit return restore a sensible exhibit and focus. | VERIFIED | Only actual screenshot meshes are picked. Validated slug selects the existing case-study anchor. Passing tests exercise genuine touch activation, swipe/hold/movement/multiple-pointer rejection, canonical route, return focus, native history, reload and persisted pageshow. |
| 4 | Reduced motion is honored before animation, still view is visible, and scene/asset/context failures preserve complete content. | VERIFIED | `policy.ts` runs before the sole dynamic scene import; failed storage retains session choice. Tests cover reduced motion, explicit preference, import/init/image/context failures, one deliberate retry, and real image/caption accessibility. |
| 5 | A representative scene is exercised with mouse, touch and keyboard, mobile swipe versus tap, and browser zoom; preliminary device/asset constraints guide subsequent work. | UNCERTAIN — WARNING | Automated input, enlarged-text/reflow, counts and byte gates pass. Actual Windows Chrome, iPhone Safari and real 200%/400% zoom checks remain unperformed. Emulation and SwiftShader do not establish these manual results. |
| 6 | The complete still catalogue uses actual published content and four authored architectural drawing types, with no fabricated exhibits. | VERIFIED | Home maps `getPublishedProjects()` into `ExhibitSection`; entrance/exhibit/about/landing SVG components are used and decorative. Zero-project copy is a real empty state. Case study, screenshots, three contract labels, resume and contact are real HTML. |
| 7 | Native DOM order generates stable camera stops for zero, one and multiple projects, preserving existing exhibit offsets when a project is appended. | VERIFIED | Pure `stops.ts` formula is consumed by controller/scene; passing unit cases cover zero/one/many and append invariants. Current published runtime fixture has one exhibit; expanded runtime growth rehearsal belongs to Phase 3. |
| 8 | One lazily loaded WebGL scene renders only when needed and releases resources on teardown or partial initialization failure. | VERIFIED | Controller generation guards reject stale mounts. Scene cleanup stack is installed immediately after renderer construction; cancellation, observers, listeners, geometry/materials, reflection, canvas and context are disposed safely. Passing tests cover repeated entry/exit, idle/hidden/offscreen suspension and a 2D-only context denial before handle return, including retry. |
| 9 | The portal displays the existing screenshot accurately, shares its URL with HTML, uses the actual slug, and frames itself from aspect/FOV. | VERIFIED | `getImage` emits one 1600-pixel WebP; panel reads the real DOM image and uses sRGB texture/UV crop. Tests check one URL/request, geometric projection, portrait/landscape framing, pointer pass-through, and asset-failure alternatives. Caption and alt text stay in the accessibility tree while the canvas is decorative. |
| 10 | The reflection contains completed architecture independent of above-water progress, with a bounded target and a usable failure fallback. | VERIFIED | Completed group and descendants use layer 2 exclusively; reflector camera and all three lights include that layer. Render target validates renderable float support and framebuffer completeness, restores prior target state, and disposes invalid targets. Tests cover layer masks, one reflection pass, size/fallback reversal, denied extensions and incomplete framebuffer. Perceptual D-05 approval remains under truth 1. |
| 11 | Exactly three transformations depend only on camera distance, reverse exactly, and leave the cornice/drawn-pier impossibilities clear of the walkway. | VERIFIED | `approachProgress` computes clamped smoothstep from distance; opacity, ink, hatch and shadow threshold share that progress. Geometry builds three elements, four drawn cornice supports, no solid cornice support, and a drawn-only landing right pier. Tests and final scene audit verify progress/reversal, shadow threshold, counts and idle invariance. |
| 12 | Actual build and scene costs are measured honestly and constrained before further work. | VERIFIED with documented contract variance | Scene 157,185 B gzip; controller 3,824 B; screenshot 37,132 B at 1600×780. Final measured calls/triangles/materials/lines/targets pass gates. The original three-texture estimate is corrected to five raw renderer allocations; four are attributed and one explicitly remains unidentified. This is disclosed, not reported as compliance with the original total of three. |
| 13 | Mobile/enlarged content has native document continuation, readable backing, reachable CTA, and equivalent accessible image evidence. | VERIFIED in tested contexts | CSS title/CTA-first portrait layout allows summary/chips to continue in normal flow, avoiding an inner scroll area or clipped maximum height. Passing 320/390-pixel enlarged-text tests check reachability, contrast and control clearance for the exhibit; active image/caption accessibility is tested. Landing and physical zoom clearance remain explicit manual checks. |

**Score: 11/13 verified; 0 present-but-behavior-unverified implementation truths; 2 uncertain human acceptance truths.** There are no FAILED truths or BLOCKER findings. Behavioral verification is limited to the tested contexts, not an assertion about untested devices.

## Required Artifacts and Wiring

All artifacts below exist, contain substantive implementation, and are connected to their callers; none is a placeholder or orphan.

| Artifacts | Responsibility and verified connection |
|---|---|
| `src/pages/index.astro`, `src/lib/projects.ts`, `ExhibitionShell.astro`, `StopSection.astro`, `ExhibitSection.astro` | Validated published collection → real sections and screenshot → home-only controller startup. |
| `src/pages/projects/[...slug].astro` | Same published collection → static canonical case-study route, actual contract evidence, image alternatives and explicit exhibit return. No renderer import. |
| `src/components/exhibition/drawings/{Entrance,Exhibit,About,Landing}Drawing.astro` | Authored inline SVGs are used by the corresponding still sections; scene activation preserves their measured boxes for native restoration. |
| `src/lib/exhibition/stops.ts`, `src/scripts/exhibition/{controller,policy,scroll,controls,tap}.ts` | Native offsets/progress → controls and camera; preference → guarded import; eligible pointer gesture → panel slug → existing anchor. |
| `src/scripts/exhibition/scene/{index,architecture,ink,exhibit,quality,reflection,transformations}.ts` | Actual renderer, camera/lights, geometry, six shared ink styles, screenshot portal, quality policy, completed reflection and reversible transformations are instantiated and disposed by the scene owner. |
| `src/styles/global.css` | Scene layering, paper text backing, native-flow exhibit sheet, visible preference/arrows, focus, real-image accessibility and failure presentation. |
| `scripts/measure-scene-budget.mjs`, `package.json`, exhibition test files | The deployment check invokes actual chunk/asset/no-clock gates, unit tests and all six browser suites. |

Key links inspected beyond imports: `ExhibitionShell → start`; `start → policy → import('./scene')`; `scroll progress → controls.update + setCameraZ`; `scene → createExhibits → real figure image`; `panel.userData.slug → hitPanel → tap anchor.click`; `cameraZ → transformations.update`; `completed groups → reflection layer 2`; `quality/reflection failure → mirrored ink`; `dispose/failure → canvas/context/resource cleanup`. Each has a real call path and behavioral coverage in the final gate.

Orchestrator post-wave checks: schema drift does not block; codebase drift is skipped because no `STRUCTURE.md` exists. The generic 02-08 key-link query reports two pattern misses: it preserves escaped regex backslashes, and the light link names a prose target rather than `scene/index.ts`. Direct source inspection finds all three `layers.enable(2)` calls in `scene/index.ts:109–111` and the budget script in `package.json:11`; the final layer and budget tests also pass. These are query limitations, not claimed passing query results.

## Real Data Trace

| Rendered result | Upstream data | Verification |
|---|---|---|
| Exhibit title, summary, contract chips and link | Content collection → validation → published filter/order → `ExhibitSection` props | Real published client record; three distinct contract labels, no mock array. |
| Portal pixels and accessible screenshot | First actual project screenshot → Astro image output → HTML `img` → Three texture | Same emitted URL; authored alternative/caption retained; failed texture restores visible fallback. |
| Case-study route and explicit return | Same published record and slug → static path and `/#exhibit-${slug}` | Direct case study and return tested; picking activates the same ordinary anchor. |
| Background, resume and contact | Existing profile content and real routes/URLs → home sections | Built-content and no-JavaScript tests preserve access independent of renderer state. |

## Behavioral Evidence and Measurements

The orchestrator ran the final exact-source gate once after the last source corrections. This verifier inspected `/tmp/phase02-final-check.log`, relevant test implementations, `/tmp/02-08-inspect.log`, source wiring and final measurements. No separate browser re-execution is claimed.

| Check | Result |
|---|---|
| `npm run check` | Exit 0; Astro check/build, built-content verification, scene import boundary, byte/asset/no-clock guard, **33 unit tests and 69 Chromium browser tests passed**. |
| Navigation and gestures | Native travel, halfway/fractional endpoints, focus/history, genuine touch tap, swipe/hold/multiple-pointer rejection and canonical link equivalence covered. |
| Accessibility and resilience | No-JavaScript content, axe, reduced motion before import, preference persistence/failure, visible failure recovery, real image/caption accessibility, texture/context loss and repeated disposal covered. |
| Recovery fault injection | Only 2D contexts denied: no residual scene canvases or live WebGL contexts after failure/retry. Unsupported float target and incomplete framebuffer: working scene/content with mirrored fallback and no reflection target. |
| Final scene audit | Exit 0; `/tmp/02-08-inspect.log` ends `PASS camera-derived transformations, shadows and idle pause`. Detailed counts in `/tmp/02-08-visual/counts.json`. |
| Actual resource costs | Desktop exhibit 44 calls/8,258 triangles; portrait 43/8,246; sampled travel max 45/8,934. Materials 17 live/16 fallback; lines 883/1,057; textures 5; reflection at most one pass and 1024×512. |

No phase-declared shell probe file is missing. The budget script is part of the successful integrated command. The temporary negative 1 KB/clock probes are documented executor evidence, not independently rerun verifier probes. Local Chromium uses ANGLE/SwiftShader; these are correctness, asset and count measurements, not frame-rate or physical-device performance results.

## Requirements Coverage

| Requirement | Source plans | Result and evidence |
|---|---|---|
| NAV-02 | 02, 04, 05, 06 | VERIFIED: native scrolling/swiping, bounded camera, normal viewport and preserved browser gesture behavior; physical Safari pinch/pan pending. |
| NAV-03 | 02, 05 | VERIFIED: labeled 56/64-pixel controls, focus retained, true boundary states, between-stop behavior tested. |
| NAV-04 | 02, 05, 07, 08 | Implementation VERIFIED: successive single-input navigation, project return, resume/contact and still choice. Physical one-handed journey/ergonomics pending. |
| NAV-05 | 05, 07 | VERIFIED: only screenshot panel is pickable; canonical HTML anchor equivalence and gesture rejection tested. |
| NAV-06 | 04, 05, 07 | VERIFIED: explicit return, browser Back/Forward, focus and native restoration tests. |
| ART-01 | 01, 02, 03, 06, 07, 08 | UNCERTAIN — WARNING: approved motifs and geometry are implemented; final composition and D-05 visual approval remain human decisions. |
| ART-02 | 02, 03, 07, 08 | VERIFIED: one actual client exhibit with its three contracts, count-derived corridor/landing and no invented future-work placeholder. |
| ACCESS-04 | 01, 02, 03, 04, 06, 08 | VERIFIED: OS policy before scene import, visible still toggle and complete illustrated catalogue; policy tests pass. |
| ACCESS-05 | 01, 02, 04, 06, 07, 08 | VERIFIED: import/initialization/asset/context failures retain content; partial cleanup, target validation and one deliberate retry tested. |

Every Phase 2 requirement is accounted for. Execution checkboxes in REQUIREMENTS and `requirements-completed` summary metadata do not constitute human visual/device acceptance.

## Anti-Patterns and Contract Adjustments

No blocking stubs, disconnected visitor handlers, mock project data, accidental Three imports outside the lazy boundary, authored scene clocks, or open source-review findings were identified. `02-REVIEW.md` reports a clean 37-file review after navigation, accessibility, partial-initialization and framebuffer fixes. No-op raycasts on decorative geometry intentionally restrict picking; null failure handles intentionally preserve the catalogue.

Documented differences from the initial numeric design contract remain visible for human acceptance:

- The portrait sheet uses a minimum height and native continuation because the original height cap plus padding could not contain the complete text. Title and CTA appear first; the remaining text has its own continuous paper backing.
- The cornice is placed ahead of its stop so it is visible, the outboard transforming arch is oriented clear of the walkway, and the sill datum uses its lower face. Exact scene lights are retained with the documented shared warm stone material adjustment.
- Five real texture allocations exceed the original three-total estimate. The raw renderer count is preserved; the fifth allocation is explicitly unattributed. The revised bound is a regression guard, not proof of an irreducible minimum.
- Successful source figures use opacity and pointer pass-through instead of hiding accessible images/captions. This fixes a concrete accessibility failure while retaining measured document geometry.

These are disclosed implementation/measurement decisions, not silent verifier overrides. No `accepted_by` approval has been invented.

## Human Verification Required

1. **Composition and D-05 reflection.** On Windows Chrome, inspect entrance, threshold, real exhibit, About cornice, and landing as one journey. Confirm warm light/ink/type coherence, completed architecture visibly contrasting with drawn structures above water, and a complete ending with one exhibit. Check that the rust leader reads as a link cue, three sill ticks relate to contract chips, and screenshot color/crop remains faithful. Automated geometry cannot establish these visual judgments.

2. **Physical desktop operation and real zoom.** Complete the whole journey using only the mouse, then only the keyboard. Open and return from the case study; reach resume/contact and toggle still view. Repeat at actual browser 200% and 400% zoom. All words, links, focus outlines and controls must remain reachable and readable without simultaneous inputs.

3. **Actual iPhone 12 Pro Safari.** Record the actual browser/version. Swipe both ways, tap the screenshot, swipe ending on it, return to the exhibit, operate arrows with one thumb, pinch/pan, and toggle still view. Retract and restore browser chrome. Confirm WebP texture display, stable fixed scene and control positions, and complete exhibit/landing reading. Chromium touch emulation is not Safari evidence.

4. **Landing clearance and documented adjustments.** The inspected `/tmp/02-08-visual/portrait-landing.png` shows the Resume heading intersecting the fixed arrows at the captured stop. Text continues in native document flow and the screenshot does not establish permanent inaccessibility; neither does it prove acceptable placement. Explicitly scroll through all resume/contact text at portrait and real zoom and confirm no word or link remains trapped beneath controls. Review the mobile-flow and measured-budget adjustments above; accept them or request a targeted correction.

Useful final evidence: `/tmp/02-08-visual/desktop-exhibit-featured-client.png`, `portrait-exhibit-featured-client.png`, `desktop-landing.png`, `portrait-landing.png`, and the `*-about-geometry.png` / `*-landing-geometry.png` captures. Geometry-only captures intentionally hide document UI and must not be used to claim overlay clearance.

## Remaining Work and Scope

There is no identified implementation gap requiring a closure plan. Keep Phase 2 awaiting human verification and collect the four checks above through end-of-phase UAT. Final 02-08 Task 3 is committed as `95fcde8`; all task references are recorded in the completed summary.

Phase 3 owns physical-device performance evidence for PERF-01, broader content-growth rehearsal and production delivery/recovery checks. Those later goals do not substitute for Phase 2's composition and D-18 manual journey acceptance. A1/A2/A3 Safari assumptions remain unproven in `02-MEASUREMENTS.md`. Post-verification deployment evidence: [Pages run 35552310047](https://github.com/castlew640/castlew640.github.io/actions/runs/35552310047) passed all 33 unit and 69 browser tests, establishing A7 CI WebGL availability, and deployed `0f0507e` successfully. Public HTML matched the tested local build; human verification status is unchanged.

_Verifier: reused-agent fallback applying the installed GSD verifier procedure; report only, no commit._
