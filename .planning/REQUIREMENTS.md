# Requirements: Surreal Portfolio

**Defined:** 2026-09-19
**Core Value:** Help a prospective employer understand the owner's ability to deliver useful software through a memorable, one-handed portfolio experience with clear evidence of real work.

## v1 Requirements

The first milestone includes both an early readable release and the finished initial 3D exhibition. All requirements remain unimplemented until verified. The weekly personal-project cadence is an aspiration, not a quota for this release.

### Profile and Contact

- [x] **PROF-01**: A visitor can read the owner's confirmed name, introduction, and recent computer science graduate background without implying an unchosen job specialization.
- [x] **PROF-02**: A visitor can open or download the owner's actual resume through a clearly labeled link.
- [x] **PROF-03**: A visitor can reach an owner-supplied contact destination through a clearly labeled link.

### Professional Evidence

- [x] **WORK-01**: A visitor can read one featured client case study distinguishing the website, manual Wi-Fi planner, and AI planner MVP as three contracts, with the owner's contribution and confirmed constraints/results for each.
- [x] **WORK-02**: A visitor can inspect permitted client screenshots with readable captions and appropriate text alternatives.
- [x] **WORK-03**: A visitor can follow the confirmed live client link from the case study, with the case study remaining useful if that external site is unavailable.
- [x] **WORK-04**: A visitor can open, refresh, and share a canonical HTML URL for each published project, with a descriptive page title and summary.

### Navigation

- [x] **NAV-01**: A visitor can jump directly to Projects, About, Resume, and Contact without traversing the corridor or waiting for its assets.
- [ ] **NAV-02**: A visitor can move forward and backward along the bounded corridor using native scroll or single-finger swipe input, with normal browser panning and zoom preserved.
- [ ] **NAV-03**: A visitor can move to the previous or next exhibit using labeled forward/back tap controls with at least 44 by 44 CSS pixel targets and clear endpoint behavior.
- [ ] **NAV-04**: A visitor can complete entry, travel, project selection, reading, return, resume access, and contact using successive one-handed pointer actions without required chords, held keys, or precision dragging.
- [x] **NAV-05**: A visitor can open each real exhibit with a click/tap and can reach that same project through an equivalent visible HTML link.
- [x] **NAV-06**: A visitor returning from a project reaches the same exhibit through the explicit return link, while browser Back/Forward restores an understandable location and focus without resetting to the entrance.

### Visual Experience

- [x] **ART-01**: A visitor experiences a coherent, original, Dali-inspired corridor whose composition, lighting, typography, and surreal motifs satisfy the visual contract established during UI planning.
- [x] **ART-02**: A visitor can explore a purposeful exhibition sized to the actual published work, including a useful one-project state and a clear end, without fake completed projects or empty placeholder exhibits.

### Accessible and Resilient Presentation

- [x] **ACCESS-01**: A visitor can read the introduction and project content and use resume/contact links from the initial HTML when JavaScript or 3D is unavailable.
- [x] **ACCESS-02**: A keyboard visitor can operate every control and link with logical focus order, visible focus, meaningful labels, and no focus trap.
- [x] **ACCESS-03**: A visitor can read and operate the portfolio at narrow mobile widths and enlarged text/zoom with legible contrast, reflowing content, and unobscured controls.
- [x] **ACCESS-04**: A visitor receives a complete motion-free presentation when the operating system requests reduced motion and can select it through a visible control; it removes nonessential camera travel, parallax, and ambient animation.
- [ ] **ACCESS-05**: A visitor retains complete project/navigation access if scene loading, an asset, renderer initialization, or the WebGL context fails during a visit.

### Ongoing Project Growth

- [ ] **GROW-01**: The owner can add a completed project through a documented content entry and its assets, producing its page, index entry, and corridor exhibit without editing renderer or navigation code.
- [x] **GROW-02**: The owner receives build-time feedback for invalid project metadata, duplicate route identifiers, and missing referenced local assets before publication.
- [x] **GROW-03**: The owner can keep draft projects excluded from public pages, indexes, and the serialized exhibition content.
- [ ] **GROW-04**: The owner can append completed work farther along the exhibition while preserving existing project URLs and the ordering of earlier exhibits.

### Performance

- [ ] **PERF-01**: Visitors on the representative desktop and physical mobile targets defined during planning receive responsive navigation and readable content within recorded transfer/frame-time budgets, with measured evidence before the immersive release.
- [ ] **PERF-02**: A visitor's browser stops unnecessary scene work when the exhibition is hidden or inactive, and repeated project visits do not accumulate scene listeners or owned rendering resources.

### Delivery and Release

- [x] **SHIP-01**: The owner receives automated content/type/build checks and focused visitor-journey checks for proposed changes, with checks expanding as scene capabilities are added.
- [x] **SHIP-02**: A successful default-branch update automatically deploys the exact checked artifact to the chosen public host; failed checks preserve the last successful release.
- [ ] **SHIP-03**: The owner can verify the deployed HTTPS site, direct project routes, screenshot/resume assets, navigation, and contact links through documented production smoke checks.
- [ ] **SHIP-04**: The owner can restore a previous working release using a documented and exercised rollback procedure for the selected host.

## v2 Requirements

Deferred options, not commitments in the current roadmap:

- **DETAIL-01**: A visitor can preview a project in an accessible in-place dialog that preserves route/history and return focus.
- **JOURNAL-01**: A visitor can follow a maintained development journal if the owner chooses to publish one.
- **ART-03**: A visitor can discover additional room variants or optional visual surprises after the initial scene meets its performance and navigation requirements.

New completed personal projects are routine content additions under GROW-01, not a deferred platform capability. Building those separate projects has its own scope.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Client-owned source code | The portfolio may show approved evidence and link to the live product, not publish the implementation |
| Full client planner rebuild or embedded runtime dependency | This is a portfolio; the client product remains external |
| WASD-plus-mouse movement, pointer lock, or required complex gestures | Conflicts with one-handed path navigation |
| Mandatory cinematics or loading gates | Important content must stay directly available |
| A portfolio chatbot, user accounts, database, or hosted CMS | No established need in the agreed visitor journey |
| A required personal-project count before launch | Real client evidence is available now; the gallery grows over time |
| Invented achievements, unsupported metrics, or an inflated MVP description | Published claims must match confirmed evidence |
| Exact library patches, a public GitHub repository, or a hosting purchase selected by assumption | Versions need setup checks; repository and publication destination remain open |

## Definition of Done and Publication Inputs

Each requirement is complete only after implementation, appropriate verification, and a committed result. The early Phase 1 release does not mark the immersive milestone complete.

- Obtain the actual owner name/bio, resume, contact destinations, approved screenshots, and live client URL before publishing the early release.
- Confirm client naming, contract dates, blueprint extension, the three demo scenarios, deployment boundaries, and any outcome claims; omit unresolved facts from public copy.
- Choose GitHub account, repository, visibility, host, and production URL before publication configuration. Authentication alone does not connect this repository or authorize an external publication.
- Establish the visual contract and representative devices/budgets during planning. Research budget figures are proposals; do not report lab checks as field performance or unrun physical-device checks as passing.
- Verify mouse-only, touch-only, and keyboard-only journeys; reduced motion; no JavaScript; renderer/context failure; direct routes; Back/Forward; and project addition.
- Include only completed, evidenced capabilities when describing the portfolio's own rendering and CI/CD work.

## Traceability

Every v1 requirement is owned by exactly one phase. Later phases preserve and regression-check earlier requirements without changing their ownership.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROF-01 | Phase 1 | Complete |
| PROF-02 | Phase 1 | Complete |
| PROF-03 | Phase 1 | Complete |
| WORK-01 | Phase 1 | Complete |
| WORK-02 | Phase 1 | Complete |
| WORK-03 | Phase 1 | Complete |
| WORK-04 | Phase 1 | Complete |
| NAV-01 | Phase 1 | Complete |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| NAV-04 | Phase 2 | Pending |
| NAV-05 | Phase 2 | Complete |
| NAV-06 | Phase 2 | Complete |
| ART-01 | Phase 2 | Complete |
| ART-02 | Phase 2 | Complete |
| ACCESS-01 | Phase 1 | Complete |
| ACCESS-02 | Phase 1 | Complete |
| ACCESS-03 | Phase 1 | Complete |
| ACCESS-04 | Phase 2 | Complete |
| ACCESS-05 | Phase 2 | Pending |
| GROW-01 | Phase 3 | Pending |
| GROW-02 | Phase 1 | Complete |
| GROW-03 | Phase 1 | Complete |
| GROW-04 | Phase 3 | Pending |
| PERF-01 | Phase 3 | Pending |
| PERF-02 | Phase 3 | Pending |
| SHIP-01 | Phase 1 | Complete |
| SHIP-02 | Phase 1 | Complete |
| SHIP-03 | Phase 3 | Pending |
| SHIP-04 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-09-19*
*Last updated: 2026-09-19 after initial research and roadmap creation under approved autonomous workflow preferences*
