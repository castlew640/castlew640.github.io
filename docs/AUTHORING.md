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
5. Set `exhibitionOrder` greater than the current published maximum (currently `2`). Preserve that value on later edits so existing exhibits do not move.
6. Keep `published: false` while drafting. Run `npm run check`; expect a successful build and test run with no draft route.
7. Review `git diff -- src/content/projects/` for placeholder text, unsupported claims, private material, and accidental files.
8. Change to `published: true`, run `npm run check` again, and open the generated page and exhibition locally.
9. Commit and publish normally:

   ```sh
   git add src/content/projects/<stable-slug>
   git commit -m "feat: publish <project name>"
   git push origin master
   ```

   The push should start the checked-artifact Pages workflow. Follow `docs/RELEASE.md` for production verification and recovery.

## Evidence and links

Each published personal project needs at least one real local still with nonblank `alt` and `caption` text. Choose `kind` from `screenshot`, `terminal`, `diagram`, or `illustration`. Set `fit: contain` whenever the whole image matters. Terminal and diagram evidence is always contained even if `cover` was requested. A screenshot marked `cover` is cropped only when no more than 10% of either dimension is lost in the exhibition's 2:1 frame; otherwise it is contained. Stone-coloured letterboxing is intentional. The canonical page keeps the whole still readable. The first still becomes the gallery preview, including when a page also has video.

Still images are optimized to at most 1600 px on their long edge. Keep each exhibit preview at or below 180,000 bytes after optimization; recompress an oversized original rather than raising the budget. Provide meaningful alt text and a caption that names what the evidence proves.

External `repositoryUrl` and `liveUrl` values are optional, but every supplied URL must use HTTPS—even on a draft. A non-hosted CLI or library can publish with terminal or diagram evidence plus a repository link; do not invent a live demo.

The featured client is intentionally stricter: it retains its HTTPS live URL, three approved screenshots, and exactly one `website`, `manual-planner`, and `ai-mvp` contract.

## Optional page video

Still-only projects are complete and publishable. If a demonstration genuinely helps, add one optional `video` record to the entry:

```yaml
video:
  src: /media/my-stable-slug/demo.mp4
  poster: ./video-poster.png
  description: The command produces a report, then highlights the failed checks.
  hasAudio: true
  captions:
    src: /media/my-stable-slug/demo.vtt
    language: en
    label: English
```

Place the poster beside `index.md` and provide a still `evidence` entry for the gallery. Place the MP4 and, when needed, WebVTT captions at `public/media/<stable-slug>/` with exactly the paths declared above. Media filenames use letters, digits, dots, underscores and hyphens; the slug must match the project. Do not use external URLs, query strings or encoded paths. Each media file must exist and be no larger than 25,000,000 bytes. Captions need a nonempty WebVTT cue. Set `hasAudio: false` and omit `captions` for a silent demo, but keep a useful visible `description`. Meaningful audio requires `hasAudio: true` and captions with language and label.

The page offers native controls, a poster, text description and a download link. It does not autoplay, and the exhibition always uses the still rather than a video texture. Test the actual supplied file on the real target browsers, including iPhone Safari and Windows Chrome, before publishing; the artificial Chromium fixture only proves the test asset works in Chromium.

Draft media belongs beside the draft entry, not in `public/`. Every file under `public/media/` must be referenced by a published project; an orphan, draft-only file, missing caption or path escape stops the build. Never copy fixtures or the starter into public media.
