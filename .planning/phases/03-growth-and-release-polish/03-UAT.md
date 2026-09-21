---
status: testing
phase: 03-growth-and-release-polish
source: [03-VERIFICATION.md]
started: 2026-09-21T19:54:51Z
updated: 2026-09-21T19:54:51Z
---

Test the current intended release at [https://castlew640.github.io/](https://castlew640.github.io/), checked by [Pages run 35645308662](https://github.com/castlew640/castlew640.github.io/actions/runs/35645308662). The local N=10 fixture and steps are in [docs/RELEASE.md](../../../docs/RELEASE.md). The automated smoke and headless lab measurements do not count as physical performance or visual acceptance.

## Current Test

number: 1
name: Windows Chrome physical N=2 and N=10 trace
expected: |
  Retain three complete forward/back displayed-frame journeys at both counts,
  separate cold startup, trace files and device/browser/GPU/viewport/DPR/power
  details; compare complete-frame median, p95 and worst to fixed targets.
awaiting: user response

## Tests

### 1. Windows Chrome physical N=2 and N=10 trace
expected: Use Chrome Performance on a normal-power Windows laptop for the live N=2 site and locally served isolated N=10 fixture. Capture at least three complete forward/back journeys after first usable presentation, cold startup separately; retain traces and failed recordings, note Chrome/Windows/GPU/viewport/DPR/power, and compare displayed-frame median/p95/worst with 03-PERFORMANCE-TARGETS.md.
result: [pending]

### 2. Physical iPhone Safari N=2 and N=10 rendering timeline
expected: After explicit 3D opt-in, record three complete forward/back journeys and separate cold startup with Safari Web Inspector on a connected Mac. Note model/iOS/Safari/viewport/DPR/power and compare complete displayed-frame median/p95/worst with fixed mobile targets.
result: [blocked: owner has no Mac for Safari Web Inspector; no timeline or frame percentiles collected]

### 3. Independent Windows/iPhone visitor and visual pass
expected: Complete the release guide's Windows Chrome mouse/keyboard/200–400% zoom and physical iPhone Safari still/3D/touch/pinch/browser-chrome checks. Inspect both project pages, returns, resume/contact and composition/reflections. Record device/browser versions and any issues. Carry Phase 01/02 UAT results in their own files.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 1

## Gaps

- No Mac is available for the physical iPhone Safari rendering timeline. PERF-01 remains open.
