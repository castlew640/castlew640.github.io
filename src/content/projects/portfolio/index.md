---
kind: personal
format: case-study
slug: portfolio
title: Surreal Portfolio
summary: A Dalí-inspired 3D exhibition that keeps real project evidence, readable case studies, an illustrated view, and contact within one tap.
published: true
exhibitionOrder: 2
repositoryUrl: https://github.com/castlew640/castlew640.github.io
liveUrl: https://castlew640.github.io/
evidence:
  - src: ./gallery.png
    alt: The 3D exhibition at the client exhibit, with the approved client screenshot in a gilded frame on an easel in a desert, beside a placard with a View exhibit button and case-study link, and callouts around the painting, the placard actions, the travel arrows and the view switch.
    caption: The moving exhibition settles in front of each exhibit. Tapping the painting or the placard's button opens it in place; the ordinary link leads to the full case study.
    kind: screenshot
    fit: contain
  - src: ./viewer.png
    alt: The in-place exhibit viewer showing a large client screenshot with step controls, a numbered list of the three client contracts, and a close button, with callouts around each.
    caption: The viewer shows every approved screenshot at full size beside the three contracts without leaving the exhibition. The browser's Back closes it.
    kind: screenshot
    fit: contain
  - src: ./still.png
    alt: The illustrated still view showing the client screenshot and its caption, the View exhibit button and case-study link, and the bottom bar with travel arrows and a 3D switch, with callouts around each.
    caption: The illustrated view keeps the same evidence, viewer and travel controls without asking the visitor to load the 3D scene.
    kind: screenshot
    fit: contain
---

## Making the ambitious usable

I wanted this portfolio to feel like walking into a surrealist painting without making a hiring manager work to find the evidence. The central problem was to put a strange, playful 3D world around real projects while keeping each case study, my background, resume, and contact easy to reach with one hand.

## What visitors can do

Scrolling, swiping, or the one-handed arrows walk along a checkerboard path through a Dalí-inspired desert. The camera settles in front of each exhibit so its screenshot fills the part of the screen the text leaves free. Tapping something in the distance walks there; tapping the exhibit you are standing at opens an in-place viewer with every screenshot, the project summary, and the case study link, and the browser's Back closes it. Melting clocks that keep the visitor's real time, an ant-covered pocket watch, long-legged elephants, a lips sofa, and a lobster telephone react when touched, but none of them is needed to reach anything.

Each project also has an ordinary HTML page, so the content remains available without JavaScript. Phones, reduced-motion preferences, and browsers that draw 3D without graphics acceleration open the illustrated still view first; a visible switch enters the 3D exhibition. If graphics rendering fails, the catalogue and its links remain available.

## Decisions and tradeoffs

Astro produces static pages from one validated local content collection. Adding a completed project creates its page, exhibit, and viewer from the same entry. I used vanilla Three.js for the optional scene and hold the renderer to a fixed download budget. Native page scrolling stays the single source of travel: the camera follows a smoothed copy of the scroll position and rests at each stop, and each exhibit's placement depends only on the exhibits before it, so adding a project never moves an earlier one.

Ambient animation runs only while the scene is visible and pauses when the tab is hidden, the viewer is open, or the visitor has been idle for a minute. Software-rendered browsers draw only while the visitor travels or plays with something. Screenshots and optional media are checked before publication. Browser tests exercise the view choices, the viewer, growth, navigation, recovery, and the checked-artifact deployment path.

## Evidence

The three annotated captures above come from the built site at the client exhibit: the moving exhibition, its in-place viewer, and the illustrated view. They show the same approved client screenshot in each. The public repository contains the implementation and the content, build, and browser checks behind this project.
