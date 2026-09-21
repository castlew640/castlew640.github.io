# Phase 3 UI Amendment: Winding Exhibition Route

**Status:** Active implementation amendment, 2026-09-21

This document records Phase 3 decisions D-10 through D-16, D-19, D-20, D-22,
D-27, and D-28. It is an implementation contract, not a claim of new human
approval or completion of any Phase 1 or Phase 2 UAT result. The approved
Phase 2 UI specification remains authoritative except for the replacements
named below.

## Supersession map

| Phase 2 contract | Phase 3 replacement |
|---|---|
| A — straight `-Z` scene composition and fixed camera x/y | A3 below: scalar station follows a deterministic winding route; the camera has route-relative x/y and a level horizon. |
| B — axis-aligned architecture | B3 below: architecture is mounted in route frames while the ink language and line widths remain unchanged. |
| C — fixed-axis light and reflection placement | C3 below: the existing light offsets follow the current route frame; reflection and light counts stay unchanged. |
| D — axis-aligned exhibit planes and translucent labels | D3 below: evidence planes use route frames and labels are opaque paper with independent contrast. |
| F — portrait framing derived from a panel on world x=0 | F3 below: all four transformed panel corners establish framing at each reference viewport. |
| G — reduced motion as the only implicit still-view default | G3 below: phones also default to the still catalogue; explicit choices retain precedence. |
| K — fixed camera/world-z diagnostics | K3 below: station, route pose, stable stop ID, and transformed corner diagnostics replace those assertions. |
| Copy inventory | The Phase 3 copy inventory below replaces only the listed strings. |

All unaffected typography, palette, three-light rig, architectural ink,
one-handed input, failure handling, return navigation, resource ownership, and
numeric performance limits are inherited unchanged.

## A3. Route composition and camera

- Native document scroll remains the only travel authority. Existing stop
  values remain signed scalar layout values (`0`, `-18n`, About, Landing) and
  are converted once at the scene boundary to `station = -progress.z`.
- The route consists of fixed 18 m segments and is independent of the final
  project count. Each segment is straight and level for its first 12 m. Its
  final 6 m is a `CubicBezierCurve3` transition to the next anchor.
- Segment-anchor lateral offsets repeat `[0, 0.8, 0, -0.8]` m. Datum elevation
  offsets repeat `[0, 0.30, 0.10, 0]` m. These patterns continue beyond the
  current route end, so appending projects cannot move an earlier frame.
- A transition from station `s + 12` to `s + 18` has control stations
  `s + 14` and `s + 16`. The first control repeats the start x/y and the second
  repeats the end x/y, making lateral and vertical derivatives zero at every
  join.
- `sampleRoute` clamps non-finite and out-of-range station input to the finite
  bounds supplied by `routeBounds`. The returned frame has `position`, a
  horizontal normalized `forward`, horizontal `right`, and world `up=(0,1,0)`.
- The eye is 1.62 m above the sampled datum; the walkway is datum + 0.12 m.
  Camera yaw follows the horizontal route tangent and stays within 12 degrees.
  Pitch and roll are zero, with world up fixed to `(0,1,0)`.
- The exhibit portal/evidence plane is sampled 12 m ahead of its stop. The
  evidence plane is 4 m by 2 m and centred 4.1 m above its local datum. The
  local walkway remains 6 m clear. Landing is 10 m after About and remains in
  a calm straight portion.

## B3. Route-mounted architecture

Walkway samples, vestibule, threshold, portals, About construction, and landing
use the same route frames as the camera. Local x is frame `right`, local y is
world up, and forward travel follows frame `forward`. Evidence planes are never
warped. Portal 2 retains the inherited impossible construction: its right pier
is drawn-only beneath a solid lintel and panel, while layer 2 contains the
complete solid counterpart. This is separate from the deterministic outboard
member variation.

## C3. Light and reflection

The existing sun and target offsets are expressed in the current route frame so
shadows follow the visitor. The three-light rig, one shadow-casting light,
single reflection target, completed layer, fallback reflection, and all
measured texture/draw/triangle ceilings remain unchanged.

## D3. Evidence and labels

Each published project owns one stable stop ID, canonical anchor, panel mesh,
and canonical project URL. The panel is selected by stop ID rather than nearest
world z. Picking raycasts only actual panels and delegates successful activation
to the matching existing anchor. Full captions remain semantic HTML.

Labels use an opaque paper surface, `--paper` or an equivalent opaque warm
paper colour. `--ink` text must retain at least 4.5:1 contrast without depending
on the scene behind it. The 4 m by 2 m panel and its four actual transformed
local corners are the framing source of truth.

## F3. Reference viewport framing

The inherited field-of-view formula and reference viewports remain unchanged:
1440x810, 390x664, and 844x390. At every exhibit stop, all four projected panel
corners must be on screen, the uppermost corner must leave at least 5% top
margin, and the panel bounds must not overlap the semantic text plate. Phone
text stays in ordinary document flow with the inherited 104 px control
clearance.

## G3. Phone, motion, and failure policy

An explicit session or stored view choice wins first. Otherwise phones open the
illustrated still catalogue by default; non-phone devices continue to follow
the reduced-motion preference. A visible control lets phone visitors enter the
3D exhibition. Reduced motion, blocked storage, async-import generation guards,
context loss, and readable no-WebGL content retain the Phase 2 behavior.

## K3. Verification hooks

Diagnostics widen from numbers/booleans to numbers/booleans/strings and report:

- `station`, `currentStopId`, `cameraYaw`, `cameraRoll`, and
  `cameraUpX/Y/Z`;
- `panelCorner0X/Y` through `panelCorner3X/Y`, `panelFacingCamera`, and
  `panelStopId`;
- existing accurate camera, world, render-count, material, geometry, texture,
  lighting, reflection, transformation, and lifecycle values.

Tests derive project and stop counts from the published DOM. They preserve tap
rejection, endpoint rounding, canonical links, focus/history, recovery,
independent idle/hidden suspension, and the existing N-based resource formulas.
Aggregate check-command wiring remains owned by Plan 03-07.

## Phase 3 copy inventory

| Surface | Active copy/behavior |
|---|---|
| W/C caption | `Software & solutions.` |
| Contact heading | `Talk shop with me.` |
| Removed slogan | `Ideas, considered. Software, delivered.` must not appear. |
| Replaced invitation | `What could we build together?` must not remain as the landing invitation. |
| Contact glass | Small outlined architectural beer glass beside the contact heading; activation fills it amber while the email remains an ordinary visible link. |
| Phone view control | Clearly offers entry to the 3D exhibition when the implicit phone default is the still catalogue. |

The exact replacement landing sentence and glass animation are owned by Plan
03-05. No earlier UAT result is altered by this inventory.

## Unchanged numeric budgets

- Lazy scene JavaScript: <=190,000 B gzip; controller reported separately.
- Evidence image: <=180,000 B and <=1600 px long edge.
- Draw calls: <=90; triangles: <=120,000.
- Unique materials: <=18 at N=1, plus one panel material per added exhibit.
- Actual GPU textures: <=5 at N=1, plus one panel allocation per added exhibit.
- Active line segments: <=1,200 at N=1, plus 400 per added exhibit.
- Reflection renders: <=1 per top-level frame; target <=1024x512.
- Exactly one shadow-casting light; desktop shadow map <=1024 squared, narrow
  shadow map <=512 squared; pixel ratio <=1.75.

