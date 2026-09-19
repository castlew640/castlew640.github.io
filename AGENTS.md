<!-- GSD:project-start source:PROJECT.md -->

## Project

**Surreal Portfolio**

A personal portfolio for a recent computer science graduate seeking employment, presented as an expanding, surreal 3D exhibition. Visitors move forward and backward through a corridor by scrolling or swiping, then click or tap exhibits to explore real client work and, as they are completed, personal projects. The site should feel visually impressive, unique, and memorable while keeping projects, background, resume, and contact information easy to reach.

The working project name is **Surreal Portfolio**; public branding and the owner's display name are still to be supplied.

**Core Value:** Help a prospective employer understand the owner's ability to deliver useful software through a memorable, one-handed portfolio experience with clear evidence of real work.

### Constraints

- **Purpose:** Prioritize helping employers understand credible work and reach the owner — visual novelty must support the hiring goal.
- **Interaction:** All visitor actions must be possible with one hand — no required multi-key combinations or simultaneous pointer-and-keyboard controls.
- **Schedule:** Launch an initial useful version soon and iterate throughout the approximately six-week application period — an extensive initial content collection must not become a prerequisite.
- **Content ownership:** Use screenshots, descriptions, and live links for client work — do not include private client source code.
- **Accuracy:** Separate the three contracts, the manual planner, and the limited AI MVP; confirm metrics and uncertain details before publication.
- **Maintenance:** Support frequent project additions and automated deployments — content updates should not require rebuilding the experience by hand.
- **Open decisions:** Exact stack versions, hosting provider, domain, spending budget, and exact launch date have not been selected; the research-backed stack is a planning baseline.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

Planning baseline: Astro static output, TypeScript, local Markdown content collections, and one React Three Fiber/Three.js WebGL2 enhancement. Essential content and navigation remain ordinary HTML. Verify compatible published package versions during setup and commit the lockfile; dependencies are not installed yet.

GitHub Actions is the proposed delivery runner. Repository ownership, visibility, hosting, and domain remain open. GitHub Pages and Cloudflare Workers Static Assets are researched options, not configured destinations.

Read `.planning/research/STACK.md` for source-backed tradeoffs and version checks. Read `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` before planning implementation.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

This is a greenfield project. Read `.planning/research/ARCHITECTURE.md` for the proposed architecture. Use one validated content source for static case-study routes and exhibit metadata; native document scrolling owns travel, and camera position is derived from it. Preserve one-handed controls, motion-free content, and complete access when rendering fails.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `$gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `$gsd-debug` for investigation and bug fixing
- `$gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `$gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
