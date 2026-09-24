---
quick_id: 260924-3fy
type: quick
completed: 2026-09-24
branch: quick/260924-3fy-surreal-overhaul
status: implemented; automated checks pass; owner review and device checks pending
---

# Quick Task 260924-3fy Summary: Surreal exhibition overhaul

The 3D exhibition was rebuilt as a Dalí golden-hour dreamscape with clickable exhibits, an in-place viewer, playful reactive props and placards that no longer cover the scene. The illustrated still view, the beer glass and the phone layout were reworked with it.

## What changed for visitors

- **World.** Gradient sky with a daytime moon, ochre desert, checkerboard causeway, golden headland and sea, long shadows and a sky-derived reflection map. The old ivory corridor, ink construction lines and reflection pool are gone.
- **Exhibits.** Each project is a gilded frame on an easel, forked crutches or spindly legs, with a brass nameplate and a melting clock slumped over the top rail. The camera eases to a stop in front of each frame (lens-shifted so the placard never covers it) and dwells there while the visitor scrolls a little.
- **Motifs.** Melting clocks that show the visitor's real time (tap the Persistence block to spin them backwards), the orange pocket watch with ants, three long-legged elephants carrying obelisks across the horizon, a floating castle (a Magritte nod to "Castle") as the destination beacon, an egg where new work hatches, a Mae West lips sofa at About, a chest of drawers whose top drawer holds a draped resume, and a lobster telephone beside a giant pint at Contact.
- **Clickability.** Tap anything far away to walk there; tap the exhibit you are standing at to open it. Landmarks act on arrival (the cabinet opens the resume PDF, the telephone rings the email link, the pint takes a sip, the sofa puckers). A Google-Maps-style chevron on the ground walks on to the next stop. Mouse hover shows a label ("Walk to …", "View …", "Turn back time") and a pointer cursor.
- **Viewer (v2 DETAIL-01).** A native `<dialog>` per project: every approved screenshot in a scroll-snap carousel (buttons, arrow keys or swipe), captions, the three contracts for the client, and case-study/live/repository links. Opening adds a history entry, so Back closes it; focus returns to **View exhibit**. It works in both views; in the catalogue the screenshot itself also opens it.
- **Placards.** In 3D each stop's HTML is one fixed museum placard (bottom-left card on desktop, bottom sheet on phones, title and actions first) that crossfades with the current stop. Keyboard focus in another stop walks there; in-page links and hash arrivals travel to the stop that holds their target.
- **Dock.** Back/Forward, a current-stop label with progress dots, and the view switch (**3D** / **Still**) share one fixed dock: a floating card in 3D and a full-width bottom bar in the catalogue, so the view choice is reachable anywhere and nothing is covered.
- **Glass (D-22 kept).** Redrawn as a nonic pint on a coaster at the heading baseline; tapping pours amber with bubbles, a foam head and a slow foam drip. Label: "Pour a pint" / "Empty the pint".
- **Catalogue.** New illustrations (Persistence block and soft clocks, lips sofa, drawers/telephone/castle) with CSS-only motion that reduced motion disables; exhibits laid out image-beside-text; view toggle out of the way of headings.

## Policy and performance decisions

- **D-Q11 (new): software graphics default to the illustrated view.** A 10 ms probe reads the WebGL renderer name before first paint. SwiftShader/llvmpipe/WARP visitors get the still view with a notice and the same **3D** button (explicit choice › reduced motion › phone › software graphics). On explicit opt-in the scene starts at quality level 5 and renders only while travelling or reacting. Missing WebGL is not treated as software: the scene still fails with its own message and retry.
- **Motion.** Native scroll remains the only travel authority; the camera follows a damped copy with dwell zones. Ambient animation runs only on hardware that keeps up, only while visible, and rests after 60 s without input; hidden tabs, an offscreen exhibition and the open viewer suspend the loop. The old "no clock in the scene" source guard became a guard that animation stays on the suspendable frame loop.
- **Budgets.** Renderer chunk 161,485 / 190,000 B gzip (was 157,185). At the stops: ≤ 76 draw calls and ≤ 60k triangles at 1440×900; texture uploads stay within ±1 exhibit of the visitor.

## Verification

- `npm run check` passed end to end on 2026-09-24 (commit `5e988cf`, after two earlier green runs): `astro check` 0 errors; build; content and scene-boundary checks; scene budget 161,474 / 190,000 B; 45 exhibition unit tests plus the existing validation, media and evidence-fit tests; 6 production-smoke tests; **94 browser tests** at `--workers=2`; growth fixtures N=0, N=1 and N=10 including the media and performance suites. Local Chromium used SwiftShader, so every browser test exercised the software-graphics path; full-quality rendering was reviewed by screenshots only.
- New unit tests: route/layout growth invariance, arrival framing never covered by the placard at 1440×900, 1024×768, 390×844 and 844×390, dwell/damping, path continuity; view-policy decision table and head-script regex parity; tap picks.
- New browser specs: `exhibition-scene.spec.ts` (placards, hover labels, click-to-walk, ground arrow, landmarks, toys, focus-follow, link travel, phone tap) and `exhibition-viewer.spec.ts` (carousel, contracts, Back/Forward, backdrop, restored-after-return, axe, phone full-screen, no JavaScript). Retired: reflection, overhead-route and old budget specs.
- Real bugs found by the rewritten tests and fixed: travel arrows ignored clicks in 3D (inherited `pointer-events: none`); a disabled carousel button dropped keyboard focus out of the dialog; dialog focus restoration overrode the return to **View exhibit**; the PMREM render target leaked on dispose; the placard covered part of the evidence at 1024 px and phone landscape.
- Physical-device checks are **not** done: PERF-01 and the Phase 02/03 device UAT remain pending, and the release checklist in `docs/RELEASE.md` was updated for the new journeys.

## Not done / follow-ups

- Owner review of the new look, copy and motifs before pushing (pushing `master` deploys).
- Real Windows Chrome and iPhone Safari passes, including frame timing on a GPU.
- Phones still default to the illustrated view (D-15). Changing that is a one-line policy edit if wanted.
