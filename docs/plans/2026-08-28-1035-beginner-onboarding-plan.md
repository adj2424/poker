---
title: Beginner-Friendly Onboarding and Plain Language - Plan
type: feature
date: 2026-08-28
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-plan
execution: code
---

# Beginner-Friendly Onboarding and Plain Language - Plan

## Goal Capsule

- **Objective:** Someone who has **never played poker** can open Fold or Play, understand what they are
  being asked to decide within about 60 seconds, and learn something concrete from every graded hand —
  without leaving the app to look up a term.
- **Means:** Three additive layers over the existing single screen — a plain-language vocabulary layer
  with inline term tooltips, a skippable first-run onboarding overlay, and a reshaped reveal that leads
  with a plain-English *why* backed by a visual 13x13 range grid.
- **Authority hierarchy:** This plan is authoritative on scope and copy intent. `src/core/**` and
  `src/data/charts.ts` are authoritative on domain facts — no poker math changes here.
- **Execution profile:** Single-pass feature work in `src/components/**`, `src/App.tsx`, plus two new
  pure modules and one additive export in `src/advisor/`. `src/core/**` is not touched.
- **Stop conditions:** Do **not** change `src/core/**`, `src/data/charts.ts`, the EV heuristic, the
  verdict thresholds, or the reducer's grading logic. Do **not** add a difficulty mode, change how
  hands are dealt, add a beginner/expert toggle, or add a router or state library.
- **Tail ownership:** Repo convention is commit directly to `main` (see `AGENTS.md`); no feature branch.

## Product Contract

### Summary

Make the trainer legible to a true beginner by adding a plain-language layer (glossary + inline term
tooltips), a first-run onboarding overlay that can be reopened any time, and a reshaped `RevealPanel`
that explains *why* an action was right or wrong in words before it shows numbers — with a 13x13 range
grid that shows the player where their hand sits in the seat's opening range.

### Problem Frame

The app is currently written for someone who already studies poker. A first-time visitor is shown, with
no explanation: seat labels `UTG`/`HJ`/`CO`/`BTN`/`SB`/`BB`, hand notation like `A5s`, the phrase
"preflop, unopened pot", and a stats bar reading `EV lost / 100 · 0.4 bb`. On acting, they get a
verdict chip (`Correct` / `Defensible` / `Leak`) and three numeric tiles ("Chart says play", "Equity vs
random", "Est. cost") with no sentence explaining *why* the hand plays or folds. Nothing in the UI
defines a single one of these terms, and there is no first-run explanation of what decision is even
being asked. A player who has never played poker cannot form a mental model from this screen; they can
only guess and watch a number move.

The domain data needed to teach them is already in the app and unused by the UI: `parseRange` yields a
full 169-class frequency array per seat, `canonicalize` yields the hero's `row`/`col` in that same
13x13 grid, and `Verdict` already carries `position`, `opponentsRemaining`, `fPlay`, and
`equityVsRandom`.

### Requirements

- **R1. Plain-language vocabulary.** Every piece of jargon the UI shows has a one-line plain-English
  definition reachable in-place, without navigating away: the seat labels, `bb`, equity, EV, leak,
  defensible, preflop, unopened pot, RFI, suited/offsuit, and the `A5s` hand-notation shape.
- **R2. Plain-language surface copy.** Header, action prompt, and stats-bar labels read in plain English
  for a non-player, with the poker term available as a tooltip rather than as the primary label.
- **R3. First-run onboarding.** On first visit, a skippable overlay explains in a few short steps what
  the player holds, what they are choosing between, why position matters, and how they will be graded.
  It is dismissible, persists dismissal across reloads, and is reopenable from a always-visible control.
- **R4. Reveal explains "why" first.** After acting, the panel leads with a plain-English sentence
  naming the actual reason (hand strength shape + how many players act behind), and only then exposes
  the existing numbers behind progressive disclosure.
- **R5. Visual range grid.** The reveal (and a reusable learn surface) shows the seat's full opening
  range as a 13x13 grid with the player's hand highlighted, so "this hand is a fold from here" becomes
  a picture, not a percentage.
- **R6. Learn surface.** A single reopenable panel collects the onboarding steps, the glossary, and the
  current seat's range grid, reachable from the header at any time.
- **R7. No regressions.** Keyboard shortcuts, the one-viewport no-scroll layout, and all existing
  grading behavior are unchanged; the existing Vitest suite still passes.

### Non-Goals

- No beginner/expert mode toggle and no mode state in `useGame`.
- No difficulty scoping — dealing stays uniform-random over openable seats, table sizes stay 2/6/9.
- No hints before acting, and no change to grading language severity ("leak" stays a verdict kind).
- No teaching of postflop play, hand rankings beyond a one-line glossary entry, or bet sizing.
- No new dependencies (no tooltip/popover/animation library).

### Key Decisions

- **KD1. Glossary is data, not prose scattered in JSX.** One `src/content/glossary.ts` map keyed by a
  `TermId` union is the single source for every definition, so a term's wording can never drift between
  the tooltip, the onboarding overlay, and the learn panel.
- **KD2. The "why" sentence is generated by a pure, tested function, not inline ternaries.** A new
  `src/advisor/explain.ts` takes a `Verdict` + hand label + action and returns structured copy. Pure
  and dependency-free, so it is unit-testable alongside the existing `advisor` tests and keeps
  `RevealPanel` presentational (repo convention: `components/` is presentational only).
- **KD3. The range grid reads the chart through `advisor`, not `core`.** `rangeFor` is currently
  module-private in `advisor.ts`; export it rather than having a component call `parseRange` on
  `CHARTS[...].spec` itself. This preserves the `core -> advisor -> engine -> components` layering and
  reuses the existing `rangeCache`.
- **KD4. Onboarding state lives outside the game reducer.** A separate `useOnboarding` hook owning a
  `localStorage` flag keeps `reducer` pure and keeps `SET_TABLE_SIZE`'s session-reset semantics from
  interacting with onboarding at all.
- **KD5. Tooltips are hand-rolled buttons, not a library.** A `<Term>` renders a `<button>` with a
  dotted underline that toggles a positioned panel. Using a real `<button>` is load-bearing: `App.tsx`'s
  global key handler already bails on events inside `button, a, input, select, textarea`, so `f`/`space`
  cannot fire while a term is focused, with no change to the handler.
- **KD6. Numbers are demoted, not removed.** The three stat tiles and the Monte Carlo disclaimer stay
  verbatim behind a "Show the numbers" disclosure. The disclaimer wording is load-bearing (`AGENTS.md`:
  never describe the heuristic as GTO or solver-derived) and must be carried over unedited.

### Open Questions

- **OQ1.** Should the range grid appear inline in the reveal on every hand, or only inside the learn
  panel with a "see the whole range" link from the reveal? Inline teaches more; it also costs vertical
  space in a layout that is deliberately one-viewport (see `docs/solutions/ui-bugs/`). **Assumption for
  implementation:** collapsed by default inside the reveal's disclosure, always expanded in the learn
  panel. Revisit after the layout check in V4.

## Technical Design

### Current shape

```
core/ (untouched)  canonicalize -> {index,row,col,label}   parseRange -> Float32Array(169)
advisor/           evaluateSituation, scoreAction -> Verdict{fPlay, equityVsRandom, position,
                                                             opponentsRemaining, costBb, ...}
engine/useGame     one useReducer: {tableSize, hand, stats}
components/        Table, Seat, Card, StatsBar, RevealPanel   (presentational only)
App.tsx            layout + global keydown handler
```

### New and changed files

| File | Change | Purpose |
| --- | --- | --- |
| `src/content/glossary.ts` | **new** | `TermId` union + `GLOSSARY: Record<TermId, {term, plain, more?}>` (R1, KD1) |
| `src/components/Term.tsx` | **new** | Inline dotted-underline `<button>` + positioned definition popover (KD5) |
| `src/advisor/explain.ts` | **new, pure** | `explainVerdict(...) -> {headline, because, nuance?}` (KD2) |
| `src/advisor/explain.test.ts` | **new** | Table-driven cases across shape x position x verdict |
| `src/components/RangeGrid.tsx` | **new** | 13x13 grid from a `Float32Array(169)`, hero cell highlighted (R5) |
| `src/components/Onboarding.tsx` | **new** | Step overlay, focus-trapped, Esc to close (R3) |
| `src/components/LearnPanel.tsx` | **new** | Drawer: onboarding recap + glossary list + current range grid (R6) |
| `src/engine/useOnboarding.ts` | **new** | `localStorage` seen-flag + open/close state (KD4) |
| `src/advisor/advisor.ts` | **edit** | `export` the existing `rangeFor` (KD3). No logic change. |
| `src/components/RevealPanel.tsx` | **edit** | Lead with explanation; numbers behind disclosure (R4, KD6) |
| `src/components/StatsBar.tsx` | **edit** | Plain labels + `<Term>` wrapping (R2) |
| `src/App.tsx` | **edit** | Header help button, mount overlay/panel, suppress keys while overlay open |

### `explainVerdict` contract

```ts
// src/advisor/explain.ts  — pure, no React, no DOM
export interface Explanation {
  headline: string;   // "Folding was right." / "That fold cost you." / "Either call is fine here."
  because: string;    // the actual reason, in plain English, naming shape AND seats-behind
  nuance?: string;    // e.g. the mixed-frequency caveat, or the "close call" note
}
export function explainVerdict(args: {
  verdict: Verdict; handLabel: string; action: Action;
}): Explanation;
```

Classification inputs available with no new computation:

- **Hand shape** — derive from `handLabel` (`"77"` pair, trailing `s` suited, trailing `o` offsuit) plus
  the two rank characters. Buckets: pair (big/medium/small), suited ace, suited broadway, suited
  connector, offsuit broadway, weak offsuit.
- **Position bucket** — from `verdict.opponentsRemaining`: 0-1 late/blind, 2-3 late, 4+ early.
- **Verdict** — `verdict.kind`, with `fPlay` distinguishing "clear" (>=0.85 / <=0.15) from "mixed".

The `because` string must always name **both** the hand-shape reason and the seats-behind reason —
that pairing is the single most important idea for a beginner and is exactly what the current UI omits.

### `RangeGrid` contract

```tsx
<RangeGrid range={Float32Array /* 169 */} heroIndex={number} seatLabel={string} />
```

- 13 columns x 13 rows; cell at `(row, col)` -> `range[classIndex-equivalent]`. Reuse
  `classLabel(row, col)` and `classIndex` from `core/canonical` for labels and lookup — **do not
  reimplement the mapping**; the row-major A..2 layout with suited above the diagonal is documented in
  `canonical.ts` and any drift silently mislabels every cell.
- Cell fill: `fPlay >= 0.85` -> `play` token, `0.15 < fPlay < 0.85` -> `marginal` token,
  `<= 0.15` -> muted. Reuse the exact same thresholds `scoreAction` uses so the picture and the verdict
  can never disagree.
- Hero cell gets an `accent` ring and is announced to screen readers.
- Legend below: "opens" / "sometimes opens" / "folds", each `<Term>`-annotated.

### Onboarding steps (R3)

1. **What you're holding.** Two cards, no shared cards yet, no one has bet. Show the hero's actual cards.
2. **The one choice.** Fold (give up the hand, lose nothing more) or Play (raise and take it on).
3. **Where you sit matters.** Highlight the table; later seats have fewer players behind, so they can
   play more hands. This is the idea the whole app is built around.
4. **How you're scored.** Correct / defensible / leak, and what the numbers under them mean.

Persistence: `localStorage["foldorplay.onboarded.v1"]`. Reads must be wrapped in `try/catch` — private
browsing throws on access. On any failure, treat as "not yet seen" but never block rendering.

### Accessibility and interaction constraints

- While the overlay or learn panel is open, `App.tsx`'s global handler must return early — otherwise
  `space` both advances a step and fires `PLAY` underneath. Gate on the open flag from `useOnboarding`.
- Esc closes the overlay, the learn panel, and any open `<Term>` popover.
- Focus moves into the overlay on open and returns to the trigger on close.
- Every `<Term>` is a real focusable button with `aria-expanded`; the popover is `role="dialog"` or an
  `aria-describedby` target, not a bare `title` attribute (unreadable on touch, invisible to keyboard).
- React Compiler is on (`AGENTS.md`): do not hand-add `useMemo`/`useCallback`.

## Implementation Sequence

Each task is independently verifiable; T1-T3 have no dependency on each other and can land in any order.

- **T1 — Vocabulary layer.** Add `glossary.ts` and `Term.tsx`. Wire `<Term>` into `StatsBar` labels,
  the `App` header subtitle ("preflop, unopened pot"), and the action prompt's seat/hand names.
  *Done when:* every jargon token visible on the pre-action screen has a working tooltip, and `f`/`space`
  still work when nothing is focused.
- **T2 — Explanation engine.** Add `explain.ts` + `explain.test.ts`. Do not touch the UI yet.
  *Done when:* `npm test` passes with cases covering each shape bucket x each position bucket x each
  verdict kind, asserting that `because` mentions both the hand reason and the seats-behind reason.
- **T3 — Range grid.** Export `rangeFor` from `advisor.ts`; add `RangeGrid.tsx`.
  *Done when:* the grid renders for all three table sizes and every openable seat, with hero-cell
  highlight correct for a pair, a suited hand, and an offsuit hand.
- **T4 — Reshape the reveal.** (needs T2, T3) Rewrite `RevealPanel` to lead with `explainVerdict`
  output; move the three tiles, the Monte Carlo disclaimer (**verbatim**), and the collapsed `RangeGrid`
  behind a "Show the numbers" disclosure. Keep the `Next hand (N)` button in place and unchanged.
- **T5 — Onboarding overlay.** (needs T1) Add `useOnboarding.ts` and `Onboarding.tsx`; mount in `App`;
  add the header help button; add the key-suppression gate.
- **T6 — Learn panel.** (needs T1, T3, T5) Add `LearnPanel.tsx` reusing the same steps, glossary map,
  and grid. Reachable from the header at any time.
- **T7 — Docs.** Update `README.md` "How it works", `AGENTS.md` module map (`content/` is a new
  top-level module), and add the new beginner-facing terms to `CONCEPTS.md`.

## Verification Contract

- **V1.** `npm run build` (typecheck + build), `npm run lint`, and `npm test` all pass. The pre-existing
  `evaluate`, `range`, and `useGame` suites are unmodified and still green — proof the grading path was
  untouched.
- **V2.** New `explain.test.ts` covers every hand-shape bucket against early / late / blind positions
  for each of the three verdict kinds.
- **V3 — beginner walkthrough (manual, in the browser).** With `localStorage` cleared: load the app, and
  without clicking any tooltip, confirm the overlay alone answers "what am I holding", "what am I
  choosing", and "how am I scored". Then play five hands and confirm each reveal's first sentence names
  a concrete reason.
- **V4 — layout regression.** At 1280x800 and at mobile width, confirm no vertical scroll in the
  pre-action state and in the revealed state with the disclosure **collapsed**, and that the hero seat's
  card overhang still does not overlap the reveal panel. This regression is documented in
  `docs/solutions/ui-bugs/table-seat-overhang-overlaps-panel.md` and the guarding margin comment in
  `App.tsx` must survive the edit.
- **V5 — keyboard.** `f` / `space` / `p` / `n` behave exactly as before when no overlay is open; none of
  them fire while the overlay, learn panel, or a term popover is open; Esc closes each.
- **V6 — copy audit.** Grep the new copy for `GTO`, `solver`, and `optimal`. Zero hits outside a
  glossary entry that explicitly says this app is *not* solver-derived (`AGENTS.md` convention).

## Risks

- **Vertical space.** This is a deliberately one-viewport app with a documented overhang bug. Everything
  added to the reveal must be collapsed by default; V4 is the gate.
- **Copy volume.** A vocabulary layer is mostly writing, not engineering. Keep every `plain` definition
  to one sentence; if a term needs a paragraph, it belongs in the learn panel's `more`, not the tooltip.
- **`localStorage` in private browsing** throws on access — see the `try/catch` requirement above.

## Sources

Grounded by direct reads of `src/App.tsx`, `src/components/RevealPanel.tsx`, `src/components/StatsBar.tsx`,
`src/components/Seat.tsx`, `src/engine/useGame.ts`, `src/advisor/advisor.ts`, `src/core/canonical.ts`,
`src/core/range.ts`, `src/data/charts.ts`, `src/index.css`, `AGENTS.md`, `README.md`, and `CONCEPTS.md`
at commit `20b9533`.
