# QA report — The Ascent (localhost:3000)

Date: 2026-09-24 · Branch: CuriosityAIAgent/review-ascent-build-spec
Tool: gstack browse (launched mode) + puppeteer walkthrough
Viewports: 1280x900 desktop, 390x844 phone
Framework: Next.js 16.3.6, client-rendered, zustand persisted to localStorage

## Summary

| Severity | Found | Fixed | Deferred |
| --- | --- | --- | --- |
| High | 2 | 2 | 0 |
| Medium | 3 | 3 | 0 |
| Low | 1 | 0 | 1 |

Console errors across all nine screens: **0**.
Health score: 72 → 94.

Every finding was an accessibility defect. No functional or visual bugs
survived verification: the validation gates, the five-clip cap, the
over-spend refusal, the capacity haircut, brick capacity and
resume-after-reload all behaved correctly on both viewports.

## Fixed

### ISSUE-001 — Placed bricks were not keyboard-removable (High, 7799b94)
Build the route rendered placed bricks as bare clickable `span`s: 5
removable elements, 0 tab stops, no role, no name. A keyboard user could
place a brick and never take it back, so a misplacement was unrecoverable.
WCAG 2.1.1. The spec's own M4 criterion is "keyboard-only placement works".
Fix: `role="button"`, `tabIndex={0}`, Enter/Space handlers, and a name
("Remove The morning meeting from year 1"). Year columns gained names too —
theirs read as "Year 13/5The morning meetingShadow the A".

### ISSUE-002 — MaxDiff buttons carried no item context (High, 3ddd79e)
The nine-round MaxDiff is the largest block of respondent effort in the
instrument. A screen reader heard six buttons named "Taught me most" /
"Taught me least" with nothing indicating which of the three learning
sources each pair belonged to. Unanswerable non-visually. WCAG 4.1.2.
Fix: each button announces its item; each card is a labelled group;
pressed state exposed.

### ISSUE-003 — Sliders and textareas had no accessible name (Medium, 744f8f1)
Both range inputs announced a value with no question ("slider, Somewhere
else, but fine"). All four textareas relied on placeholder text, which is
not an accessible name and disappears on first keystroke. WCAG 4.1.2 / 3.3.2.

### ISSUE-004 — Base camp repeated five chip names across two questions (Medium, 8b746e3)
"What can you already do alone?" and "what do you not trust yourself on
yet?" rendered identical labels, exposing ten buttons with five duplicated
names and no group distinction. WCAG 1.3.1 / 4.1.2.

### ISSUE-005 — Trial Yes/No buttons were indistinguishable (Medium, 372c5a0)
Two trial cards each rendered a bare "Yes" and "No". WCAG 1.3.1 / 4.1.2.

## Deferred

### ISSUE-006 — Dead interstitial after the ninth MaxDiff round (Low)
Completing round nine shows "That's the nine." with no content and costs an
extra tap in a budget measured in seconds. Auto-advancing on the final
commit would remove a screen. Deferred: cosmetic, and it may be wanted as a
breath before the Handover.

## Investigated and dismissed

- **"Next does not advance"** — reproduced via browse `click @eN`, but a
  JS click advanced correctly. Stale element refs after re-render, not an
  app bug.
- **Capacity screen broken on phone** — 9 add-hour buttons, 44x44, in view,
  no overflow at 390px. The walkthrough was holding stale handles.
- **Route builder broken on phone** — all four bricks place correctly once
  scrolled into view. Puppeteer clicks miss off-screen elements silently.

Each of these was a harness artifact. The test has been hardened so none of
them can present as an app failure again.

## Notes carried from the spec review

The dark scrim (`rgba(7,13,31,0.74)`) replaces the spec's white glass
deliberately: `ink.2` on the dawn sky measures 1.0:1, which fails AA
outright. The scrim holds contrast at every time of day.
