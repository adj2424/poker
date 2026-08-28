---
title: Hero seat overhang overlapped the Fold/Play buttons and result panel
date: 2026-08-27
category: ui-bugs
module: src/components/Table.tsx
problem_type: ui_bug
component: frontend
symptoms:
  - "Hero seat's playing cards and badge visually overlap the Fold/Play buttons or RevealPanel below the table"
  - "Overlap reproduces at common desktop resolutions (e.g. 1366x768) and was confirmed via Playwright getBoundingClientRect diffing"
  - "Regression appeared only after a prior fix tightened the flex gap between the table and the trailing action/reveal panel"
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components: [src/App.tsx, src/components/Table.tsx, src/components/Seat.tsx]
tags: [css-layout, absolute-positioning, viewport-fit, playwright-verification, regression]
---

# Hero seat overhang overlapped the Fold/Play buttons and result panel

## Problem
Tightening the vertical flex `gap` in `src/App.tsx` to make the table and hand-result panel fit within one viewport (commit `6380135`) shrank the spacing below the felt table enough that the hero seat's own cards and badge -- which are absolutely positioned and already extend past the table's bounding box -- started visually painting on top of the Fold/Play buttons and `RevealPanel`.

## Symptoms
- User report: "the text and buttons are overlapping the board please fix."
- The hero seat's large playing cards (`PlayingCard ... size="lg"`, `src/components/Seat.tsx:28-29`) and its "You" badge circle (`src/components/Seat.tsx:39-59`) visually overlapped the Fold/Play action buttons in the `AWAITING_ACTION` phase, and overlapped `RevealPanel` in the `REVEALED` phase.
- The overlap was consistent (~22.8px, measured during this fix via a throwaway Playwright script diffing `getBoundingClientRect()` -- not persisted to the repo, so treat the exact figure as this session's empirical finding rather than a reproducible assertion) at the table's natural rendered size (~420px tall), which covers most desktop/tablet widths since the table box is capped at `w-[min(100%,672px)]` (`src/components/Table.tsx:25`).
- No layout tool or DOM-box inspection caught it beforehand: the table's own flex box and its next sibling's flex box never intersected -- only the hero seat's absolutely-positioned *content*, a child of the table, painted outside the table's box and into the next sibling's rendered area.

## What Didn't Work
The shipped state right after commit `6380135` used `gap-2`/`sm:gap-3` (8-12px) between the table and the action/reveal container (`src/App.tsx:39`) -- sized purely to reclaim vertical space for the one-viewport-fit goal, without accounting for the hero seat's content overhang below the table's box. That gap was smaller than the ~22.8px overhang, so the hero seat's cards/badge overlapped the sibling below it.

The obvious-looking alternative -- just increase the shared `gap-2`/`sm:gap-3` on the flex parent (`src/App.tsx:39`) back up (e.g. to something like `gap-6`) -- was considered and rejected. That gap is a single shared value applied at *every* boundary in the column (header, statsbar, table, action area), but the overhang only exists at the one boundary below the table (the hero seat is the only seat with `size="lg"` cards and a badge sitting near the table's bottom edge, per `seatOffset`'s `theta = 90°` placement in `src/components/Table.tsx:12`). Widening the shared gap would have cost extra vertical space at every other boundary too, undoing the one-viewport-fit goal for no benefit at those other boundaries.

## Solution
Commit `1e5f979` ("Fix hero seat overlapping the Fold/Play buttons and result panel") added a dedicated `mt-5` (20px) top margin scoped only to the trailing action/reveal container, leaving the shared `gap-2`/`sm:gap-3` between the other elements untouched.

Before (as of `6380135`), `src/App.tsx`:
```tsx
      <div className="flex w-full shrink-0 flex-col items-center gap-4">
        {hand.phase === "AWAITING_ACTION" ? (
```

After, `src/App.tsx:70-74`:
```tsx
      {/* Hero seat's cards/badge extend ~23px below the table's own box (seatOffset
          places it near the bottom edge) -- this margin must clear that overhang so
          the result panel never sits under it. */}
      <div className="mt-5 flex w-full shrink-0 flex-col items-center gap-4">
        {hand.phase === "AWAITING_ACTION" ? (
```

`mt-5` stacks additively on top of the parent's existing `gap-2`/`sm:gap-3` (`src/App.tsx:39`), producing roughly 28-32px of total clearance between the table and the action/reveal area at the boundary where the overhang actually occurs -- comfortably more than the ~22.8px measured overhang, without touching spacing anywhere else in the column.

## Why This Works
The table's own DOM box (`src/components/Table.tsx:25`, `aspect-[16/10] w-[min(100%,672px)]`) and its content are two different things for layout purposes. Each seat is rendered as an `absolute -translate-x-1/2 -translate-y-1/2` child positioned by percentage (`src/components/Table.tsx:43-46`, using `left`/`top` from `seatOffset`), which means the seat's actual pixel content is free to extend beyond the parent's box edges -- CSS gives absolutely-positioned elements no clipping against their offset parent by default. The hero seat sits at `theta = 90°` (`src/components/Table.tsx:12`), i.e. its center is at `y = 50 + 39*sin(90°) = 89%` of the table's height, leaving only ~11% of the box below its center -- not enough room for its `size="lg"` cards (`src/components/Seat.tsx:28-29`) plus the `h-11 w-11` badge circle (`src/components/Seat.tsx:40`), so that content overflows below the table's bounding box by a roughly constant number of pixels.

Flexbox `gap` in the parent column (`src/App.tsx:39`) only accounts for the *box* geometry of adjacent flex items -- it inserts space between where one item's box ends and the next item's box begins. It has no visibility into content that a child renders outside its own box via `position: absolute`. So a `gap` value that looks generous by box-to-box measurement can still be smaller than the actual painted overlap, which is exactly what happened when the shared gap was tightened for the viewport-fit change.

## Prevention
- When a component intentionally (or as an accepted side effect of its design) lets absolutely-positioned children overhang its own box edge -- as `Table`/`Seat`/`seatOffset` do here -- don't size the gap to the next flow sibling by eyeballing or by trusting that "the boxes don't intersect." Measure the actual overhang with `getBoundingClientRect()` (max descendant bottom edge vs. the component's own bottom edge) and size the following gap/margin to exceed it with real margin, as this fix did (~28-32px of clearance against a ~22.8px overhang).
- Scope the extra spacing to the specific boundary where the overhang occurs (a dedicated `mt-*` on the one affected sibling, as in `src/App.tsx:73`), not a global increase to a shared flex `gap` -- the global change pays a vertical-space cost at every boundary for a problem that exists at only one.
- Add a small regression check -- e.g. a throwaway Playwright script -- that compares the max bounding-rect edge of a component's descendants against the bounding rect of the next flow sibling, across a handful of common viewport sizes (this fix was verified this way, during the session, at 1366x768, 1440x900, 1280x720, 1024x768, and 1920x1080, in both `AWAITING_ACTION` and `REVEALED` phases, all returning `overlap: false` -- the script itself was not committed, so treat this as a description of the verification method to repeat, not a persisted, re-runnable check). A pure DOM-box-adjacency check between flex siblings is not sufficient when either sibling has absolutely-positioned content that can escape its own box.

## Related Issues
- No related documentation or issues found. Only one other doc exists under `docs/solutions/` (`docs/solutions/documentation-gaps/verify-domain-docs-against-live-code-path.md`), and it covers an unrelated documentation-process problem. GitHub issue search was skipped (`gh` CLI unavailable in this environment; repo remote is `https://github.com/adj2424/poker.git`).
