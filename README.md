# Surreal Portfolio

William Castle’s portfolio presents real software work as a Dalí-inspired 3D exhibition: a checkerboard walk through a golden desert, with each project in a gilded frame, melting clocks that keep the visitor's real time, and an in-place viewer for every screenshot. Every project also has an ordinary, direct HTML case study. Phones, reduced-motion preferences and browsers without graphics acceleration open an illustrated still view first; visitors can choose the 3D scene from the bottom bar.

## Run locally

Requires Node 24 and npm.

```sh
npm ci
npx playwright install chromium
npm run dev
```

Open the address Astro prints. For the checked static build:

```sh
npm run check
npm run preview
```

`npm run check` validates content, builds `dist`, checks byte and scene budgets, runs unit/browser tests, and exercises isolated N=0, N=1 and N=10 growth fixtures. `npm run build` creates the static site without running those gates.

## Project content and release

- [Add a project](docs/AUTHORING.md) — copy the starter folder, add real evidence, and set a stable URL/order.
- [Publish, verify and recover](docs/RELEASE.md) — checked artifact, live smoke, short device checklist and normal-revert recovery.
- [Performance targets and measured evidence](.planning/phases/03-growth-and-release-polish/03-MEASUREMENTS.md) — transfer, resource and pending physical-device results.

The implementation uses Astro, TypeScript and a lazy vanilla Three.js scene. Native page scrolling owns travel. The same validated local project collection generates case-study routes and exhibits. GitHub Actions checks `dist` before GitHub Pages publishes it at [castlew640.github.io](https://castlew640.github.io/).
