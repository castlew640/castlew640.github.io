---
kind: personal
format: case-study
slug: portfolio
title: Surreal Portfolio
summary: A winding 3D portfolio that keeps real project evidence, readable case studies, a still view, and contact within easy reach.
published: true
exhibitionOrder: 2
repositoryUrl: https://github.com/castlew640/castlew640.github.io
liveUrl: https://castlew640.github.io/
evidence:
  - src: ./gallery.png
    alt: Moving exhibition at the client exhibit, with an image panel above a readable case-study plate and callouts around the ordinary link, view choice, and travel arrows.
    caption: The moving exhibit keeps the real client screenshot, project summary, direct case-study link, view switch, and one-handed arrows in the same visit.
    kind: screenshot
    fit: contain
  - src: ./still.png
    alt: Illustrated still catalogue showing the client's approved website screenshot, its caption, architectural drawing, view switch, and travel arrows.
    caption: The still catalogue retains the authored screenshot and caption without asking the visitor to load the 3D scene.
    kind: screenshot
    fit: contain
---

## Making the ambitious usable

I wanted this portfolio to feel like an exhibition without making a hiring manager work to find the evidence. The central problem was to put a winding 3D space around real projects while keeping each case study, my background, resume, and contact easy to reach with one hand.

## What visitors can do

Native document scrolling and one-handed arrows move through the exhibits. Each project has an ordinary HTML link to a direct, readable case-study page, so the content remains available without JavaScript. Phones open the illustrated still catalogue first; the visible view choice enters the 3D exhibition when a visitor wants it. Reduced-motion preferences and an explicit still choice are respected. If graphics rendering fails, the catalogue and its links remain available.

The view switch preserves the current exhibit.

## Decisions and tradeoffs

Astro produces static pages from one validated local content collection. Adding a completed project creates its page and exhibit from the same entry. I used vanilla Three.js for the optional scene after measuring a React-based version against the scene budget. A fixed route frame maps scroll position to camera and architecture, so adding another project does not move earlier exhibits. The scene renders on demand and has a cheaper completed-world reflection fallback.

Screenshots and optional media are checked before publication. Browser tests exercise growth, navigation, recovery, and the checked-artifact deployment path. These choices keep the visual experiment tied to clear evidence and a maintainable release process.

## Evidence

The two annotated captures above come from the actual built client exhibit in its moving and illustrated views. They show the same approved client screenshot in both modes, with the readable project link and view choice called out. The public repository contains the implementation and the content, build, and browser checks behind this project.
