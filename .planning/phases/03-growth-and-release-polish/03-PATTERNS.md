# Phase 03: Growth and Release Polish - Pattern Map

**Mapped:** 2026-09-20 (project timezone)
**Files classified:** 19 related file/asset groups below; grouped to avoid duplicating shared assignments.
**Analogs found:** 17 / 19 groups (11 exact existing seams, 6 role matches, 2 without an existing implementation).
**Inputs:** `AGENTS.md`, `03-CONTEXT.md`, requirements/roadmap, current source, and `03-RESEARCH.md` (available before completion). No project skills were found. Current stack is Astro plus vanilla Three.js.

## File Classification

New paths below are suggested destinations, not pre-existing files. Existing seams are analogs for structure and ownership; superseded behavior must change.

| New/Modified File(s) | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/content.config.ts`, `src/lib/project-schema.ts` | config/model | batch, transform | Same files: collection `image()`, reusable Zod schemas | exact |
| `src/lib/project-validation.ts`, `src/lib/projects.ts` | utility/service | batch, transform | Same files: throwing validation, published-only ordered collection | exact |
| `src/pages/projects/[...slug].astro`, `src/components/exhibition/ExhibitSection.astro` | route/component | transform | Same files: static paths, Markdown, shared image and canonical links | exact |
| `docs/project-starter/index.md`, `src/content/projects/portfolio/index.md` + adjacent still assets | model | file-I/O | `src/content/projects/featured-client/index.md:1–44` | role-match |
| `docs/AUTHORING.md` | utility (documentation) | file-I/O | Client entry plus schema/validator error messages | role-match |
| `public/media/{slug}/` optional video/captions | model | file-I/O | No existing video asset/player contract | none |
| `src/lib/exhibition/{stops,types}.ts`, `src/scripts/exhibition/{scroll,controller}.ts` | model/controller | transform, event-driven | Same files: stable IDs, scalar travel, measured DOM segments | exact |
| `src/scripts/exhibition/scene/path.ts` | utility | transform | `stops.ts:8–24`; `scene/transformations.ts:8–12,58–62` | role-match |
| `src/scripts/exhibition/scene/{index,architecture,exhibit,transformations,reflection,quality}.ts` | service/utility | transform, event-driven | Existing scene factories, disposal and quality boundary | exact |
| `src/scripts/exhibition/policy.ts` | utility | event-driven | Same file: explicit choice, storage failure, motion preference | exact |
| `src/data/profile.ts`, `src/pages/index.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css` | model/component/config | transform | Same files: confirmed copy, semantic sections, CSS tokens | exact |
| `src/components/ContactGlass.astro` | component | event-driven | `drawings/LandingDrawing.astro:1–29`; controller native button setup | role-match |
| `tests/{project-validation,exhibition-stops}.test.ts` | test | batch, transform | Same files: Node assertions and factory overrides | exact |
| `tests/project-growth.spec.ts`, `tests/fixtures/projects/` | test/model | batch, file-I/O | Existing validation factories, stop invariance and browser budget suite | role-match |
| `tests/{exhibition-resilience,exhibition-budget,exhibition-navigation,exhibition-travel,portfolio,skeleton}.spec.ts` | test | event-driven, request-response | Existing visitor journeys and numeric scene diagnostics | exact |
| `scripts/{measure-scene-budget,verify-built-content}.mjs` | utility | batch, file-I/O | Same files: inspect actual emitted assets and reject sentinels | exact |
| `scripts/production-smoke.mjs` | utility | request-response | No existing reusable actual-host smoke runner | none |
| `package.json`, `.github/workflows/pages.yml` | config | batch, event-driven | Existing aggregate check and dependent artifact deployment | exact |
| `docs/RELEASE.md`, `03-MEASUREMENTS.md`, `03-RELEASE-EVIDENCE.md` (last two in phase directory) | utility (documentation) | file-I/O | `02-MEASUREMENTS.md`; `01-03-SUMMARY.md:60–97` | role-match |

## Pattern Assignments

### 1. Flexible projects, template and canonical rendering

**Primary analog:** `src/lib/projects.ts:1–10`; preserve this single build-time gateway:
```ts
export async function getPublishedProjects() {
  const entries = await getCollection('projects');
  validateProjectRecords(entries.map(({ id, data }) => ({ id, ...data })));
  return entries
    .filter(({ data }) => data.published)
    .sort((a, b) => a.data.exhibitionOrder - b.data.exhibitionOrder);
}
```
Imports remain relative; collection APIs come from `astro:content`, `astro/loaders`, and `astro/zod` (`content.config.ts:1–4`). Extend the schema and throwing validator together; keep the client discriminator branch's exact three distinct contract IDs, approved evidence and HTTPS live URL (`project-validation.ts:14–45`). Personal formats need independent rules; do not simply make every client constraint optional. Add published-order uniqueness beside slug uniqueness.

Copy route generation from `src/pages/projects/[...slug].astro:6–15`, Markdown rendering at line 28, and stable return link at line 56. Replace universal client heading/contracts at lines 22–42 with conditional presentation. `ExhibitSection.astro:14–19,33–35` also assumes a screenshot and client contracts; update both surfaces together. Keep existing client Markdown/claims intact. Use its adjacent-asset/frontmatter layout for the starter and portfolio entry, with personal fields and annotated real stills. Keep starter and fixture folders outside both the collection loader and `public/`.

### 2. Shared evidence images, page-only video and safe assets

**Primary analog:** `src/components/exhibition/ExhibitSection.astro:2–15,23–26` optimizes one image for HTML; `src/scripts/exhibition/scene/exhibit.ts:115–122` reuses the decoded DOM image:
```ts
        await img.decode();
        if (disposed || failed) return;
        const texture = new Texture(img);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(8, anisotropy);
        texture.generateMipmaps = true;
```
Preserve failure description/caption restoration and request-driven repaint (`exhibit.ts:102–113`), plus map/material/listener disposal (135–150). Existing UV repeat/offset at 123–126 and CSS `object-fit: cover` at `global.css:238` crop evidence: neither is a contain implementation. Fit terminal/diagram content with the entire image visible; reconcile DOM, textured quad, four projected corners and picking. The current `width: 1600` must become a long-edge bound for portrait images.

For page video, extend the route's semantic figure/caption pattern (`[...slug].astro:44–53`), using the research native `controls`/`playsinline`/`poster`/`preload="none"` contract; provide supporting description/transcript and captions when needed. No video enters scene metadata. Existing image validation does not validate public video files: add contained local-path/existence checks and publication ownership checks so draft assets cannot leak through Astro's unchanged `public/` copy.

### 3. Native travel, one shared spatial frame and curved architecture

**Primary analog:** `src/scripts/exhibition/controller.ts:124–128`; scene pose stays downstream of document position:
```ts
  const derive = (): void => {
    progress = progressFor(window.scrollY, stops);
    controls.update(progress);
    sceneHandle?.setCameraZ(progress.z);
  };
```
Replace the depth-specific handle with scalar route travel/stop identity across `types.ts`, `stops.ts`, `scroll.ts`, controller and scene together. Reuse fractional-stop rounding/clamping (`scroll.ts:21–32`), remeasurement (controller 130–141), view restoration (161–178), and history/hash focus (205–224). Keep Three.js imports inside `scene/`; new `path.ts` supplies deterministic piecewise frames independent of final project count. Preserve earlier exhibit frames when appending.

| Straight-route assumption | Existing source | Integration assignment |
|---|---|---|
| Fixed camera x/y, forward look, sun target | `scene/index.ts:93–94,189–204,349–358` | Shared centerline elevation and gentle yaw; level horizon, calm stop framing |
| Nearest panel by z; invented two world corners | `scene/index.ts:207–224` | Select by stop ID; project all actual transformed panel corners |
| Picking selected scene panels | `scene/index.ts:360–367`; `exhibit.ts:81–88` | Preserve panel-only raycasts/slug mapping; update transformed world matrices |
| Fixed portals/floor, world-x walkway clearance | `exhibit.ts:23–74`; `architecture.ts:36–71,100–160` | Place/deform geometry and ink using the same frames; check local clearance and normals |
| Approach distance and local element placement | `transformations.ts:8–12,58–76` | Use reversible route distance and matching completed geometry placement |
| World-x fade, axis-aligned fallback boxes, fixed water extent | `reflection.ts:35,61–74,121–125,159` | Route-aware fade/coverage; reflect meaningful transformed edges across one water plane |

Reuse local `Group` ownership (`transformations.ts:58–62`), shared stone/ink and static batching (`architecture.ts:163–179`), and world-matrix completion/layer 2 (`reflection.ts:76–106`). Preserve the single reflector. Expanded fixtures must expose fixed water boundaries and portal variants, including the research-noted second-portal motif.

### 4. Phone preference, readable labels, copy and glass

**Primary analog:** `src/scripts/exhibition/policy.ts:26–30`:
```ts
  const explicit = sessionChoice ?? readStoredChoice();
  if (explicit === 'still') return false;
  if (explicit === 'moving') return true;
  return !reduceQuery.matches;
```
Insert the phone default after explicit choice precedence and before scene import; preserve blocked-storage behavior (6–21). Controller 11–33 already guards async scene creation with policy and generation checks. Update controller toggle/notice text (48–55,91–106) so still-by-default phones get a clear 3D opt-in without a false reduced-motion explanation.

Copy semantic headings/email from `index.astro:93–110`, confirmed profile data from `profile.ts:10–23`, and the W/C mark from `BaseLayout.astro:35–39`. Apply “Software & solutions.” and “Talk shop with me.”; remove superseded slogans. Replace the translucent overlay surface (`global.css:193,202–212`) while preserving readable contrast and flow. Its narrow-screen title clamp at 244 also warrants review for full project-name readability.

For the glass, reuse inline SVG stroke/fill tokens and `focusable="false"` from `LandingDrawing.astro:1–29`, within a real labeled button modeled on controller 48–50/181–185. Native activation covers keyboard/touch; reduced motion uses an immediate fill. Keep the email ordinary HTML and a sensible static glass when JS is absent. No existing glass interaction is available to copy.

### 5. Growth, lifecycle, measurements and checked release

**Primary analog:** `tests/exhibition-stops.test.ts:31–36`:
```ts
test('GROW-04 invariance keeps earlier stops and portals fixed when projects are appended', () => {
  const original = buildStopTable(slugs().slice(0, 1));
  const expanded = buildStopTable(slugs());
  assert.equal(expanded.stops[1].z, original.stops[1].z);
  assert.equal(expanded.portalZ(1), original.portalZ(1));
});
```
Extend this behavioral invariant to route poses, URLs and ordering. Use `project-validation.test.ts:9–20` override factories for client/personal/invalid entries, and built-output sentinel scanning (`verify-built-content.mjs:20–33,80–85`) for draft/fixture exclusion. N=0/1/real-2/isolated-10 builds must produce routes, index and per-exhibit picks from content alone; isolate fixture output from deployable `dist/`. `package.json:11` explicitly names suites, so new tests need check-command wiring.

Reuse resource equality after remounts (`exhibition-resilience.spec.ts:279–306`), independent hidden/offscreen cancellation (309–345), and actual renderer-download checks (348–365). Phone 3D tests now opt in; fresh-phone tests assert still view and no scene fetch. Replace superseded fixed camera and one-project arrays (`exhibition-budget.spec.ts:31–34,63–76`), keeping actual draw/texture/reflection checks and inherited N-based growth budgets from research. Submission-cost quality samples are not display frame-time evidence.

Copy artifact inspection from `measure-scene-budget.mjs:28–60`; report controller bytes, full transfer/frame measurements and unexplained allocation separately. `02-MEASUREMENTS.md:3,20–32,55–59` demonstrates honest evidence limits: keep Windows/physical-iPhone results distinct from local Chromium.

The workflow already runs `npm run check`, uploads only `dist`, and deploys with `needs: build` on `master` (`pages.yml:30–50`). Keep that artifact boundary and deploy-only Pages/OIDC permissions. Live smoke must cover every published route, current assets/media/PDF, return/navigation/contact destinations and the phone default. For recovery evidence, copy SHA/run/artifact/deployment/live-result fields from `01-03-SUMMARY.md:60–89`; the earlier failed-check proof is not an exercised restoration of an already deployed release. Research selects ordinary revert, checked redeployment and fresh live verification.

## Shared Patterns

- **Lifecycle/error handling:** `scene/index.ts:52–81` registers cleanup immediately and disposes idempotently even after partial setup; request rendering is guarded by disposed/suspended/pending-frame state (254–258). Keep controller's readable failure surface and one retry (64–89). No public logging of content/credentials is needed.
- **Access and validation:** No visitor auth/backend exists. Static validated content, HTTPS links, escaped Astro text and `textContent` are the relevant patterns; preserve client source privacy and publication filtering.
- **Accessibility:** Real links, headings, captions and focusable stop sections (`StopSection.astro:12–20`) remain authoritative. Meshes only enhance navigation; keep arrows, native scroll/zoom, reduced motion and complete HTML.

## No Analog Found

Native page video/caption validation and a reusable production HTTP smoke runner are new contracts. Use `03-RESEARCH.md` for their implementation details; borrow local route markup, artifact enumeration and evidence-record format without claiming existing video or live-runner coverage.

## Metadata

**Analog search scope:** `src/`, `tests/`, `scripts/`, `.github/`, existing phase evidence; stopped at five pattern families.
**Files scanned:** 32 source/test/config/content files read, plus planning references; other test seams located by targeted search.
**Pattern extraction date:** 2026-09-20 local. Mapping only: no source edits, tests, deployment, rollback or acceptance results produced.

