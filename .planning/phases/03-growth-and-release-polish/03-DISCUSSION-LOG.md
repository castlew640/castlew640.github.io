# Phase 3: Growth and Release Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves alternatives and clarifications.

**Date:** 2026-09-20 (America/New_York; completed 2026-09-21 UTC)
**Phase:** 03-growth-and-release-polish
**Areas discussed:** Adding personal projects, Presenting the portfolio's engineering, Polish priorities, Professional voice and wording, Release handoff

The owner selected all four originally presented areas and added professional voice and wording during the polish discussion. Questions were discussed in text mode. The handoff discussion ended after two focused questions when the owner emphasized minimal review effort; no additional preferences were inferred from unanswered questions.

A selection mark includes supported combinations; the recorded response governs defaults, qualifications, and freeform revisions.

---

## Adding personal projects

### When a project is ready to publish, how would you prefer to add it?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Copy a starter folder (recommended): add screenshots, edit a Markdown template, and follow a short publishing guide. | ✓ |
| 2 | Run a guided local command: answer prompts to create the project entry, then add screenshots and edit the write-up. |  |
| 3 | Give the agent the details and assets: the agent prepares the entry; the repository still includes a template and guide for independent updates. |  |

**User's choice / clarification:** Copy a starter folder. Add screenshots, edit a Markdown template, and follow a short publishing guide.

### How much detail should a personal project's page contain?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Short case study (recommended): what it does, why it was built, key decisions, and the result, with screenshots and repository/demo links. | ✓ |
| 2 | Compact showcase: a brief description, screenshots, and links. | ✓ |
| 3 | Technical deep dive: architecture, tradeoffs, experiments, and lessons learned. | ✓ |

**User's choice / clarification:** Default to a short case study, but support all three formats per project. Technical open-source projects may need architecture, tradeoffs, and experiments; fun projects may use a compact showcase. Do not force the same depth or sections onto every project.

### For projects without a conventional app screenshot, such as CLI tools or libraries, what should their exhibit show?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Real usage (recommended): a readable terminal capture, output, or example of the tool working. |  |
| 2 | An explanatory visual: a diagram or illustration that communicates what the project does. |  |
| 3 | Choose per project: support either, with real usage as the default. | ✓ |

**User's choice / clarification:** Choose media per project, favoring real usage. The owner also requested the ability to include a video demo.

### How should visitors watch a video demo?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | On the project page (recommended): keep a still preview in the gallery; let visitors start the video on the case-study page. | ✓ |
| 2 | Through an external link: keep a still preview and link to the hosted demo. |  |
| 3 | Either, per project: support both approaches, defaulting to playback on the project page. |  |

**User's choice / clarification:** On the project page. Keep a still preview in the gallery and let visitors start the video on the case-study page. Playback starts only when the visitor chooses it; no autoplay. This selection does not request video playing on the 3D exhibit or a custom video player.

### Next area: presenting the portfolio's engineering, or discuss adding projects further?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Next area: presenting the portfolio's engineering | ✓ |
| 2 | Discuss adding projects further |  |

**User's choice / clarification:** Next area: presenting the portfolio's engineering.

---

## Presenting the portfolio's engineering

### Where should employers discover how this site was built?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Its own project exhibit (recommended): a case study after the client work, covering the interactive exhibition, accessibility, and automated deployment. | ✓ |
| 2 | A separate About this site page: linked from About or the footer, outside the project gallery. |  |
| 3 | A short section in About: a concise explanation with a link to the public repository. |  |

**User's choice / clarification:** Its own project exhibit after the client work, with a case study covering the interactive exhibition, accessibility, and automated deployment. Describe only implemented and verified capabilities.

### What should its case study lead with?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Making an ambitious visual experience usable (recommended): one-handed travel, readable content, accessibility, and graceful graphics failure. | ✓ |
| 2 | Building the surreal world: the architectural concept, rendering choices, reflections, and visual iteration. |  |
| 3 | Making the site reliable and easy to extend: validated content, automated checks, deployment, and repeatable project additions. |  |

**User's choice / clarification:** Making an ambitious visual experience usable: one-handed travel, readable content, accessibility, and graceful graphics failure. Rendering and delivery decisions support that story.

### What evidence should make those usability choices clear?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Annotated screenshots (recommended): show the immersive gallery alongside its still view, highlighting readable content and accessible controls. | ✓ |
| 2 | A short walkthrough video: demonstrate one-handed travel, opening a project, returning, and switching to still view. |  |
| 3 | Both: screenshots for a quick scan, plus an optional click-to-play walkthrough. |  |

**User's choice / clarification:** Annotated screenshots of the immersive gallery and still view, highlighting readable content and accessible controls. A walkthrough video is not required for this case study.

### How should readers dig into the technical work behind those decisions?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Decision notes with focused links (recommended): briefly explain key tradeoffs and link to the relevant source, tests, or deployment workflow. | ✓ |
| 2 | Inline code excerpts: show selected implementation details directly in the case study, with explanations. |  |
| 3 | One repository link: keep the page focused on the experience and let readers explore the code independently. | ✓ |

**User's choice / clarification:** The owner combined options one and three: concise decision notes explaining tradeoffs, plus a clear repository link for deeper exploration. Inline code excerpts and a collection of focused source/test links are not requirements.

### Next area: polish priorities, or discuss the engineering case study further?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Next area: polish priorities | ✓ |
| 2 | Discuss the engineering case study further |  |

**User's choice / clarification:** Next area: polish priorities.

---

## Polish priorities

### Where should refinement start in the current exhibition?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Readability and phone comfort (recommended): clear project labels, reachable controls, and unobscured resume/contact content; existing acceptance notes flag mobile landing clearance. |  |
| 2 | Visual composition and atmosphere: framing, lighting, reflections, and the balance of solid architecture and drawing lines. |  |
| 3 | Travel and transitions: entering, moving between exhibits, and returning from projects. |  |

**User's choice / clarification:** Refine transitions, visual composition, and readability. Current translucent/low-opacity labels do not look good. Increase visual impact. Extensive phone-specific visual tuning is a low priority; the owner suggested a simpler mobile default.

### For mobile, should we revise the earlier immersive-by-default direction?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Still catalogue by default (recommended): phones open the readable illustrated portfolio, with an option to enter the 3D exhibition. | ✓ |
| 2 | Keep 3D by default: preserve the current mobile experience, focusing further work on readability and essential usability fixes. |  |

**User's choice / clarification:** Still catalogue by default on phones, with an option to enter 3D. This explicitly revises the Phase 2 immersive phone default. Projects, resume, and contact remain directly accessible; low mobile-polish priority does not remove essential readability or one-handed access.

### Where should the extra wow come from?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Stronger architectural reveals (recommended): reveal existing impossible structures and drawn-to-solid transformations more clearly on approach. |  |
| 2 | More striking light and reflections: emphasize depth, contrast, and unfinished architecture versus its completed reflection. |  |
| 3 | Bolder compositions: stronger silhouettes and more deliberate framing for existing architectural forms. |  |

**User's choice / clarification:** The current experience feels too much like walking straight through a corridor. Make it wonkier: the path should rise, dip, and move left and right gently, and architecture should curve over and warp. Avoid excessive motion and maintain clarity for exhibits, resume, and contact. This revises the earlier straight-axis path; it is refinement of the existing exhibition, not a request for new rooms or free roaming.

### How should the viewpoint follow the path?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Turn gently with the bends (recommended): follow the route naturally as it rises and shifts sideways, while keeping the horizon level. | ✓ |
| 2 | Keep facing mostly forward: move up, down, left, and right with minimal turning, letting the warped architecture provide most of the effect. |  |

**User's choice / clarification:** Turn gently with the bends, with a level horizon. Native scrolling still controls forward and backward travel; exhibits and resume/contact areas provide calm, readable places to land.

### Next area: release handoff, or explore architecture and transitions further?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Next area: release handoff |  |
| 2 | Explore the architecture and transitions further |  |

**User's choice / clarification:** The owner added a discussion of professional framing and wording before moving to the release handoff.

---

## Professional voice and wording

### How would you describe yourself and what you enjoy about building software to someone you have just met?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Freeform description in the owner's natural voice. |  |

**User's choice / clarification:** Good at talking with someone, understanding technical details, identifying their actual goal, and using the full range of expertise to help them reach it. The answer may be custom software, pre-made software, or research. Do not narrow the value proposition to writing new code.

### What current wording should remain or change?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Owner-initiated feedback on the current site. |  |

**User's choice / clarification:** The owner likes the introduction and the emphasis on understanding the client's goal. Remove the exact slogan 'Ideas, considered. Software, delivered.' Replace 'What could we build together?' The site's occasional corporate wording feels unlike the owner; revise the overall copy consistently.

### Which wordmark feels right?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | W/C — Software: simple, with the introduction explaining the approach. |  |
| 2 | W/C — Software & possibilities: retain the exploratory character. |  |
| 3 | W/C — Software & solutions: emphasize practical outcomes. | ✓ |

**User's choice / clarification:** Initially leaned toward Software & solutions, discussed alternatives, and ultimately retained Software & solutions.

### Does the broader description sound closer to you, or still too much like a pitch?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Alternate labels: Making things work; Software & problem-solving; William Castle. |  |
| 2 | Draft framing: talking through the goal, then writing software, finding an existing tool, or researching what makes sense. |  |

**User's choice / clarification:** The owner corrected the framing: a pitch is appropriate for this portfolio. It should communicate competence/confidence and the sense of a reasonable person people would be comfortable working with for many hours. Avoid corporate jargon and inflated slogans, not selling the owner's skills. Add concrete details and personality.

### How does the revised About draft feel?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Close to the right voice. | ✓ |
| 2 | Still too formal: make it more conversational. |  |
| 3 | Too restrained: give it more confidence and personality. |  |

**User's choice / clarification:** Close to the right voice. Use the following as the accepted voice reference/working draft, while preserving accuracy and the existing introduction the owner likes.

**Draft discussed:**

> I’m good at talking through a problem with someone, getting into the technical details, and figuring out what they actually need. Sometimes that means building software. Sometimes an existing tool makes more sense, or we need to do some research before deciding.
>
> I’ve been the sole developer across three client contracts: a website, a Wi-Fi planner, and an AI demo. That involved figuring out what mattered to the client, making choices within their budget, and getting the work running.

### With that framing settled, which wordmark feels right?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | W/C — Software & solutions | ✓ |
| 2 | W/C — Software & possibilities |  |
| 3 | W/C — Making things work |  |

**User's choice / clarification:** Retain Software & solutions. The owner floated 'git shit done' to explain the practical attitude, but leaned toward Software & solutions as the actual public wordmark. Do not publish the joke as the tagline.

### What should replace What could we build together?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Get in touch (recommended) |  |
| 2 | Let's talk |  |
| 3 | Email me |  |

**User's choice / clarification:** The owner explored Buy me a beer or an after-five joke for personality, then refined the idea to Talk shop with me with a small clickable beer glass. These earlier alternatives were exploratory, not final copy or availability restrictions.

### Use Get in touch / Happy to talk shop. Beer optional., keep the heading alone, or try another joke?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Use that direction |  |
| 2 | Keep Get in touch on its own |  |
| 3 | Try a different joke or personal detail |  |

**User's choice / clarification:** Rejected Beer optional as unfunny and not the desired voice. Proposed Talk shop with me beside a small glass that fills with beer when clicked.

### Keep Talk shop with me with an outlined clickable beer glass and move to release handoff, or refine further?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | Keep this and move to release handoff | ✓ |
| 2 | Refine the wording or interaction further |  |

**User's choice / clarification:** Keep it and move on. Contact heading: Talk shop with me. A small outlined beer glass matches the architectural drawing style and fills with amber beer on click/tap. The email remains clearly visible underneath as the actual contact link. This is an optional decorative interaction, not a donation, booking, or payment feature.

---

## Release handoff

### How much guidance would be useful to you?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | A concise runbook (recommended): commands, expected results, and short checklists for publishing, checking the live site, and rolling back. | ✓ |
| 2 | A detailed walkthrough: explain each step and the reasoning, assuming a return after several months. |  |
| 3 | You handle the handoff details: choose a practical format and verification steps to meet the phase requirements. |  |

**User's choice / clarification:** A concise runbook with commands, expected results, and short publishing/recovery checklists. Keep the existing checked GitHub Pages deployment.

### How would you prefer to do the final visual and device review?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 | A guided pass together (recommended): a short sequence on the Windows laptop and iPhone, with issues recorded. |  |
| 2 | A checklist you run independently: review when convenient and report results. | ✓ |

**User's choice / clarification:** An independent checklist. The owner explicitly wants low review effort: as long as the site is live and working, there is not much they want to look over. Keep the checklist short, practical, and focused on the live visitor journey; avoid a prolonged subjective review ceremony. The agent handles automated checks during implementation. Unrun physical-device checks remain clearly marked; this does not establish device-performance evidence or sign off pending Phase 2 tests.

---

## Final readiness

After the recap, the owner selected **1 — Ready: write the Phase 3 context** rather than discussing another area. This completed the discussion; it did not request implementation or deployment during this turn.

## Agent's Discretion

Routine implementation choices remain delegated by the project context. No question received an explicit blanket "you decide" selection. Exact design dimensions, path curves, labels, video mechanics, content fields, and verification methods remain research/planning choices within the captured requirements.

## Deferred Ideas

No new backlog items. Extra rooms, project dialogs, and development journals remain previously deferred. Rejected taglines, donation wording, and after-five jokes were not selected as future features.
