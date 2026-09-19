# Surreal Portfolio

## What This Is

A personal portfolio for a recent computer science graduate seeking employment, presented as an expanding, surreal 3D exhibition. Visitors move forward and backward through a corridor by scrolling or swiping, then click or tap exhibits to explore real client work and, as they are completed, personal projects. The site should feel visually impressive, unique, and memorable while keeping projects, background, resume, and contact information easy to reach.

The working project name is **Surreal Portfolio**; public branding and the owner's display name are still to be supplied.

## Core Value

Help a prospective employer understand the owner's ability to deliver useful software through a memorable, one-handed portfolio experience with clear evidence of real work.

## Requirements

### Validated

(None yet — ship to validate.)

### Active

- [ ] Present an original, Salvador Dali-inspired corridor or exhibition with dreamlike architecture and clickable project exhibits.
- [ ] Support the full visitor journey with one hand: scroll/swipe forward to advance, scroll/swipe backward to retreat, and click/tap to open projects.
- [ ] Provide large forward/back navigation arrows, inspired by the ground arrows in Google Maps, as an alternative to scrolling.
- [ ] Give visitors direct access to projects, an introduction, resume, and contact details.
- [ ] Feature one substantial client case study that clearly distinguishes three contracts: the initial website, the blueprint-based Wi-Fi planner, and the AI planner MVP.
- [ ] Show permitted screenshots and live links while keeping the client's source code private.
- [ ] Describe the owner's individual contributions, client needs, project evolution, deployment work, and contract constraints accurately.
- [ ] Make the exhibition grow as personal projects are completed, with additional work appearing farther along the journey.
- [ ] Make adding or updating a project straightforward so publishing can accompany an approximately weekly project-building cadence.
- [ ] Establish continuous integration and continuous deployment for ongoing portfolio updates and document that engineering work as part of the portfolio's story.
- [ ] Deliver an initial public version soon enough to support the current job search, then improve it while applications and project development continue.

### Out of Scope

- Publishing client-owned source code — the user can share screenshots and live links, not the client's implementation.
- A free-roaming experience that requires combined mouse-and-keyboard controls — the chosen experience follows a scroll-controlled path and must work with one hand.
- Rebuilding or extending the client's Wi-Fi planning product inside this portfolio — the site presents the work as a case study and links to the live product.
- Requiring a finished collection of personal projects before launch — the portfolio should support applications soon and expand as projects are completed.
- Presenting unfinished projects or the constrained AI demo as fully delivered production products — published descriptions must match what exists.

## Context

### Owner and job search

- The owner graduated with a computer science degree approximately three months before project initialization.
- A specific job title or specialization has not been chosen. Initial positioning should describe demonstrated work without inventing a narrow target role.
- The owner has an approximately six-week period focused on applying for jobs and building projects, with an aspiration of roughly one personal project per week.
- The portfolio link should be usable on applications as soon as practical. No exact launch date has been agreed.
- The primary intended audience is prospective employers, including recruiters and hiring managers who reach the site from an application.

### Featured client work: three separate contracts

The owner's main professional experience is a sequence of three contracts for the same client, beginning with a website in the prior year and expanding into planning tools and an AI demo. This should be presented as distinct engagements, not assumed to be continuous full-time employment.

1. **Client website:** built the initial website. The user also deployed the work to AWS Lightsail, and a live site is available. Exact service boundaries and which deliverables share that deployment should be confirmed when writing the case study.
2. **Manual Wi-Fi planner:** users upload a building blueprint, and an algorithm recommends wireless access-point locations and estimates coverage. The user gave a 2.4 GHz coverage percentage as an illustrative example; there is no verified performance metric or customer outcome to publish yet. The file format was described verbally as "dfx"; confirm the actual extension, potentially DXF, before publishing technical copy.
3. **AI planner MVP:** added a small chatbot with tool use so users could request edits such as moving an access point or deleting access points. Contract hours were limited, so the demo was scoped to three predefined scenarios. The user recalled a retail warehouse, a restaurant, and either a coffee shop or an office; confirm the exact scenario names before publishing. Visitors can inspect an example layout and interact with the AI to change it. This was an MVP demonstrating the intended direction of the AI product.

Screenshots and a live link may be shown publicly. The client name, live URL, screenshots, precise implementation details, and supported outcomes still need to be supplied or confirmed. Source code belongs to the client and must remain private.

### Personal projects and the growing exhibition

- The owner does not yet have a confirmed set of completed personal projects to showcase.
- **ChudCode** is a possible future exhibit: a humorous coding CLI concept that prompts users to take a drink while coding. Its current completion status, public repository, exact behavior, and suitability for launch have not been established.
- Additional personal projects will be chosen and built over time. Their individual specifications belong to separate project work; this portfolio must make their addition easy.
- The portfolio itself can demonstrate interactive frontend work and its delivery pipeline once those capabilities are implemented.
- Avoid fabricated exhibits, placeholder achievements, or promises of a completed project every week. The weekly cadence is an aspiration, not a launch dependency.

### Experience and visual direction

- The original idea was a long corridor with frames or other clickable project installations, potentially using Three.js.
- The accepted direction is a surreal, Dali-inspired space rather than a conventional gallery alone. Floating frames, impossible perspectives, and unusual architecture are exploratory visual ideas, not an approved detailed art specification.
- The desired reaction is that a human visitor finds the site striking, distinctive, and worth remembering.
- Progress through the corridor should convey an expanding body of work, with new projects extending the journey.
- Scrolling forward advances the visitor; scrolling backward retraces the route. Large ground arrows offer forward/back movement without requiring a keyboard.
- A project opens with a click or tap. Important content is also directly reachable without traversing the entire corridor.
- One-handed operation is an explicit requirement, not merely a desktop input preference. Mobile behavior, readable project details, focus handling, and motion alternatives need to be addressed during research and planning.

### Starting technical state

- Greenfield workspace at `/home/castlewr/sickProjects/personalWebsite`.
- Git has been initialized; no application code or package manifest exists yet.
- Research established Astro static HTML/content collections, TypeScript, local Markdown, and a React Three Fiber/Three.js WebGL2 enhancement as the planning baseline. Exact compatible published package versions are verified during setup; no dependencies are installed yet.
- GitHub Actions is the proposed delivery runner. GitHub Pages and Cloudflare Workers Static Assets are host candidates; repository ownership/visibility, host, domain, and deployment authentication remain open.
- The client's use of AWS Lightsail does not establish a hosting requirement for this portfolio.

### Approved workflow preferences

- Work autonomously on routine project tasks and use 3–5 broad phases.
- Run independent work through parallel agents using the current session model.
- Research before planning, review plans against source, and verify delivered requirements.
- Track planning documents in Git and keep PR descriptions to the standard summary and validation.
- Research the initial stack, one-handed navigation, performance, and deployment before defining the roadmap.
- At setup, GitHub CLI is authenticated with `castlew640` active and `castlewr` also available. The local repository has no remote. Repository ownership, name, visibility, and hosting are not yet selected; checking account status did not authorize creating or publishing a remote repository.

## Constraints

- **Purpose:** Prioritize helping employers understand credible work and reach the owner — visual novelty must support the hiring goal.
- **Interaction:** All visitor actions must be possible with one hand — no required multi-key combinations or simultaneous pointer-and-keyboard controls.
- **Schedule:** Launch an initial useful version soon and iterate throughout the approximately six-week application period — an extensive initial content collection must not become a prerequisite.
- **Content ownership:** Use screenshots, descriptions, and live links for client work — do not include private client source code.
- **Accuracy:** Separate the three contracts, the manual planner, and the limited AI MVP; confirm metrics and uncertain details before publication.
- **Maintenance:** Support frequent project additions and automated deployments — content updates should not require rebuilding the experience by hand.
- **Open decisions:** Exact stack versions, hosting provider, domain, spending budget, and exact launch date have not been selected; the research-backed stack is a planning baseline.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a portfolio centered on employment | The immediate goal is to turn applications and human attention into hiring opportunities | — Pending |
| Keep role positioning broad initially | The owner has not settled on a specific role; real delivered work provides the initial narrative | — Pending |
| Use a surreal, expanding 3D corridor as the main experience | The owner wants a distinctive visual identity and a visible journey as projects accumulate | — Pending |
| Navigate along a path through bidirectional scroll/swipe input | The experience must be usable with one hand | — Pending |
| Include large forward/back arrows and click/tap exhibits | Offer simple single-pointer controls inspired by Google Maps | — Pending |
| Include direct routes to important content | Employers should be able to quickly reach evidence, resume, and contact information | — Pending |
| Lead with one client case study containing three separate contracts | This is the strongest available evidence of professional delivery | — Pending |
| Launch before the personal project collection is complete | Applications should begin using the site soon, and content can grow over time | — Pending |
| Add CI/CD as part of the portfolio implementation | Enable frequent updates and provide concrete delivery-work evidence | — Pending |
| Defer final stack and hosting selection until research | Three.js is an initial idea, and the client's infrastructure is not a portfolio constraint | — Pending |
| Use autonomous routine work, coarse phases, and parallel agents with the current model | The owner approved the proposed GSD workflow settings | — Pending |
| Plan around Astro/static content plus one React Three Fiber/Three.js WebGL2 scene | Verified research supports direct readable pages and a focused immersive enhancement; confirm exact package compatibility at setup | — Pending |
| Use native scroll as the single travel source and canonical project pages | Keep one-handed browser behavior, direct links, and return navigation manageable | — Pending |
| Deliver three end-to-end phases: readable release, immersive exhibition, growth/polish | Support early applications while retaining the complete surreal experience in the initial milestone | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with a reason.
2. Requirements validated? Move to Validated with a phase reference.
3. New requirements emerged? Add to Active.
4. Decisions to log? Add to Key Decisions.
5. Is "What This Is" still accurate? Update if it has drifted.

**After each milestone** (via `$gsd-complete-milestone`):
1. Review all sections.
2. Check whether the Core Value still reflects the priority.
3. Audit Out of Scope and its reasons.
4. Update Context with the current state.

---
*Last updated: 2026-09-19 after approved workflow preferences, project research, and roadmap creation*
