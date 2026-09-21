# Add a project

Every published entry feeds the same canonical project page, catalogue exhibit, and exhibition stop. No renderer or navigation edit is needed.

## Publish a completed project

1. Copy `docs/project-starter/` to `src/content/projects/<stable-slug>/`.
2. Rename the folder and set `slug` to the same lowercase, hyphenated value. Treat it as a permanent URL; do not change it when the title changes.
3. Replace every instructional value. Add real local stills beside `index.md` and update each `evidence.src` path.
4. Choose the narrative depth:
   - `case-study` for the usual What / Why / Decisions / Results / Evidence story.
   - `showcase` for a compact or playful project; remove sections that do not help.
   - `deep-dive` for Architecture, Tradeoffs, Experiments, and Lessons when those details are useful.
5. Set `exhibitionOrder` greater than the current published maximum (currently `1`). Preserve that value on later edits so existing exhibits do not move.
6. Keep `published: false` while drafting. Run `npm run check`; expect a successful build and test run with no draft route.
7. Review `git diff -- src/content/projects/` for placeholder text, unsupported claims, private material, and accidental files.
8. Change to `published: true`, run `npm run check` again, and open the generated page and exhibition locally.
9. Commit and publish normally:

   ```sh
   git add src/content/projects/<stable-slug>
   git commit -m "feat: publish <project name>"
   git push origin master
   ```

   The push should start the checked-artifact Pages workflow. The production verification and recovery steps live in `docs/RELEASE.md` once Phase 3 plan 03-08 creates it.

## Evidence and links

Each published personal project needs at least one real local still with nonblank `alt` and `caption` text. Choose `kind` from `screenshot`, `terminal`, `diagram`, or `illustration`; choose `fit: contain` when cropping would hide important terminal text or diagram details, otherwise use `cover`.

External `repositoryUrl` and `liveUrl` values are optional, but every supplied URL must use HTTPS—even on a draft. A non-hosted CLI or library can publish with terminal or diagram evidence plus a repository link; do not invent a live demo.

The featured client is intentionally stricter: it retains its HTTPS live URL, three approved screenshots, and exactly one `website`, `manual-planner`, and `ai-mvp` contract.

## Optional page video (completed by plan 03-02)

Still-only projects are complete and publishable now. Plan 03-02 adds an optional page-only `video` record with `src`, local `poster`, `description`, `hasAudio`, and caption records (`src`, `language`, `label`) when audio is meaningful. Video will remain click-to-play with a still in the exhibition; do not add video fields or public media until that contract is implemented and this section is finalized.

Draft media belongs beside the draft entry, not in `public/`. Never copy fixtures or the starter into the public media directory.
