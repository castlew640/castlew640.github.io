# Phase 1: Publishable Portfolio and Delivery - Context

**Gathered:** 2026-09-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a readable, publishable portfolio with William Castle's introduction, resume/contact access, one substantive client case study, canonical project URLs, validated local content, and automated checked publishing. Essential content and navigation must work in ordinary HTML, with one-handed use, keyboard access, mobile reflow, and zoom preserved.

Phase 1 establishes a deliberate visual identity. The scroll-driven 3D corridor and immersive interactions remain Phase 2; repeatable exhibition growth and final release polish remain Phase 3. Follow the requirements and success criteria assigned to Phase 1 in the roadmap.

</domain>

<decisions>
## Implementation Decisions

### First impression and layout
- **D-01:** Use a dreamlike exhibition-catalogue direction: warm ivory, expressive typography, spacious project imagery, and subtle surreal details. The user explicitly wants an original, bespoke design and rejects a copy-and-paste internet template.
- **D-02:** The unifying idea is **plans becoming places**. Architectural drawings and construction geometry acquire structure, detail, and purpose. Express the passage of time through things taking shape: growth, discovery, and ideas becoming working software.
- **D-03:** Integrate William's name and short introduction into deliberate spaces in a custom architectural composition. Construction lines can guide the eye toward the featured work. The opening should introduce the person within the drawing.
- **D-04:** Keep Projects, About, Resume, and Contact directly accessible. The visual metaphor must support readable content and immediate access to evidence. Establish it through the Phase 1 page composition without making the Phase 2 scene a prerequisite.

### Client case-study story and evidence
- **D-05:** Keep one featured client case study with three clearly distinguished paid contracts: initial website, manual Wi-Fi planner, and AI planner MVP. Do not imply continuous employment or merge the manual algorithm and limited AI demo into one production product.
- **D-06:** William confirms he was the sole developer and coded the entire work across those contracts. Describe his individual contribution directly.
- **D-07:** Lead with both end-to-end delivery and understanding the client's underlying goal. Show how William applied technical judgment to the client's objectives, budget, and preferences.
- **D-08:** The first and second contracts used **Supabase and Vercel**. William recommended this setup to match expected modest traffic and reduce billed setup effort and cost. Describe the reasoning; no measured savings, actual traffic statistics, or verified capacity claims were supplied.
- **D-09:** The third contract, the AI MVP, used **AWS Lightsail** to meet the client's AWS preference. More predictable billing was William's selection rationale. This is not a guarantee that costs remain fixed regardless of usage.
- **D-10:** William understood the AI MVP's purpose as demonstrating the product idea to potential customers, making it easy to understand, and including visible AI interactions. Present the delivered demo and its limited scope accurately; do not claim a completed production AI planner or verified commercial outcomes.
- **D-11:** Use permitted screenshots, explanatory captions, and confirmed live links as public evidence. William can produce screenshots, but none were supplied during this discussion. Client-owned source code must remain private.

### Identity, resume, and contact
- **D-12:** Public display name: **William Castle**. Keep initial role positioning broad; include his computer science graduate background in About.
- **D-13:** Use the selected direct, work-focused introduction: **"I build software around what people are trying to achieve, from the first idea to deployment."**
- **D-14:** Make email the primary contact action, with LinkedIn and/or GitHub profile links alongside it. During Phase 1 execution, William approved `castlew640@gmail.com` and the selected uploading account's public profile, `https://github.com/castlew640`. No LinkedIn destination was supplied.
- **D-15:** A PDF resume and an online resume already exist. William is unsure whether updates are needed and explicitly deferred review and selection of the version to publish. Continue planning and implementation preparation; obtain the actual chosen resume before claiming the public resume requirement is complete.

### Repository and publishing
- **D-16:** Use a **public** portfolio repository owned by **castlew640**, allowing employers to inspect this site's code and delivery work.
- **D-17:** Selected repository: **castlew640/castlew640.github.io**. Selected initial production address: **https://castlew640.github.io**. Check whether the account site/repository already exists before setup, and preserve any existing work. Availability was not checked during this discussion.
- **D-18:** Use **GitHub Pages with GitHub Actions**. A custom domain is not part of the initial choice; no hosting purchase was selected.
- **D-19:** Preserve the roadmap's delivery contract: automated content/type/build and focused visitor-journey checks; successful default-branch updates deploy the exact checked artifact; failed checks leave the last working release available. This discussion selected destinations but did not create a remote, configure deployment, or publish a site.

### Remaining publication inputs
These are content/setup inputs, not blockers to planning or reasons to invent public values:
- Chosen actual resume PDF/path or online URL; resume review remains deferred at the user's request.
- Email and GitHub profile were confirmed during execution: `castlew640@gmail.com` and `https://github.com/castlew640`. No additional profile is required.
- Permitted screenshots and the confirmed live client URL.
- Public client naming and any dates used in the story.
- Actual blueprint file extension; exact names of the three AI demo scenarios if the copy names them; any additional technical specifics or outcome claims. Omit uncertain details until confirmed.
- Repository/account-site availability and production setup verification.

The public name, introduction, sole-developer role, contract-to-host mapping, GitHub owner/visibility, host, and target URL are now decided. Where earlier project/research notes leave these open or loosely associate the initial website with Lightsail, **this discussion's confirmed decisions take precedence**.

### Agent's Discretion
No additional user-facing choices were explicitly delegated during this discussion. Existing authorization for routine implementation choices in PROJECT.md still applies. Exact fonts, colors, architectural forms, spacing, page components, screenshot layouts, and package versions remain work for UI design, research, and planning within these decisions. Do not treat illustrative visual examples as a finalized art specification.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and confirmed background
- `.planning/ROADMAP.md` — Phase 1 boundary, assigned requirements, and success criteria; later scene/growth responsibilities.
- `.planning/REQUIREMENTS.md` — authoritative requirements, content accuracy, accessibility, delivery checks, and publication inputs. Repository choices are now explicitly supplied by D-16 through D-18.
- `.planning/PROJECT.md` — original project goals, client-product descriptions, one-handed interaction constraints, and approved routine-work preferences. Apply the corrected identity/deployment/destination details above.

### Technical baseline
- `.planning/research/STACK.md` — Astro/static content, TypeScript, exact-version setup checks, GitHub Pages/Actions considerations, and the later React Three Fiber/Three.js enhancement.
- `.planning/research/ARCHITECTURE.md` — one validated content source, canonical HTML pages, persistent direct navigation, and checked build artifacts.

No additional external product specification, ADR, or user-supplied design reference was introduced.

### Hosting documentation consulted
These primary sources informed the hosting options; they do not replace local requirements:
- [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) — public repository support, account-site repository naming, and default/custom URLs.
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) — artifact-based deployment and build/deploy dependencies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield repository: planning documents and phase directories only at discussion time.
- No application components, package manifest, installed dependencies, screenshots, resume asset, or UI mocks were present.
- The existing project and research documents supply the implementation constraints.

### Established Patterns
- Planning baseline: Astro static output, TypeScript, local Markdown content collections, semantic HTML, and bespoke CSS. Verify published compatible versions during setup.
- One validated content source supplies public case-study routes and later exhibit metadata. Exclude drafts from public output and reject invalid metadata, duplicate identifiers, and missing local assets before publishing.
- Preserve initial-HTML content, direct navigation, one-handed use, keyboard access, and mobile/zoom reflow.
- The later scene derives camera travel from native document scrolling. Phase 1 should provide durable routes/content for that enhancement.

### Integration Points
- New home/about/project content, shared navigation, and resume/contact destinations.
- Static case-study routes and public asset handling.
- Content validation and draft filtering.
- GitHub Actions checks and deployment of their checked artifact to the selected account-level GitHub Pages site.

</code_context>

<specifics>
## Specific Ideas

- The user wants the passage of time to be visually interesting, with **things taking shape** as the chosen interpretation.
- An illustrative concept discussed was a recurring architectural element progressing from faint construction drawing to a dimensional structure or doorway. This is an exploration direction, not a required specific doorway, animation, or asset.
- Earlier states leaving traces and different times coexisting were discussed as alternatives; neither was selected as a required motif.
- The opening's introduction should occupy the architectural composition deliberately. The visual metaphor should extend toward actual work and its development.
- The strongest client example is practical decision-making: choosing Supabase/Vercel for the first two engagements around expected use and setup effort, then accommodating the AWS preference through Lightsail for the AI demo.
- A possible case-study sentence discussed was: "Built a focused AI-assisted Wi-Fi planning demo to help the client explain the product idea to potential customers." Treat this as draft framing; the confirmed purpose and scope above govern final copy.

</specifics>

<deferred>
## Deferred Ideas

- Resume review and selection of the final public version are explicitly deferred. Existing PDF and online versions are available to the user; neither was provided here. This is a pending Phase 1 publication input, not removal of the resume requirement.
- Spatial realization of the architectural growth/time concept belongs to the already-planned Phase 2 corridor.
- No new capabilities were added to the roadmap.

</deferred>

---

*Phase: 01-publishable-portfolio-and-delivery*
*Context gathered: 2026-09-19*
