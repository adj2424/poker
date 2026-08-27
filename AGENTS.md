# AGENTS.md

Agent-facing orientation for this repo. Written for any coding agent, not tied to one tool — see
`docs/` for the full depth behind each section below.

## What this is

"Fold or Play" — a single-page preflop fold/play poker trainer. The player is dealt two cards in an
unopened pot, picks fold or play, and gets graded against a hand-authored RFI (raise-first-in) chart
plus a Monte Carlo equity/EV estimate.

## Stack and commands

React 19 + TypeScript + Vite 8, Tailwind v4, React Compiler enabled. No backend, no external state
library, no test suite yet (see `docs/SETUP.md`).

- `npm run dev` — dev server on port 3000
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — serve the production build

Full detail: [`docs/SETUP.md`](docs/SETUP.md)

## Module map

```
core/       pure domain logic (cards, canonical hand indexing, range parsing, hand evaluation, equity)
advisor/    scoring layer — composes core/ + data/charts.ts into hand verdicts
data/       RFI range charts (the only range data in the app: unopened-pot opens)
engine/     useGame — the one useReducer holding all app state
components/ presentational only
```

Full detail, including the module-dependency diagram and component tree:
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Domain vocabulary

- **Canonical hand class** — the 169-class collapse of hole cards (suits don't matter individually,
  only suited/offsuit/pair shape).
- **Range notation** — the `22+` / `A2s+` / `98s:0.5` grammar the RFI charts are written in.
- **RFI chart** — the hand-authored, per-seat "should I open this hand" range data (`data/charts.ts`).
  Not solver output.
- **EV heuristic** — the explicit, documented (not solver-grade) formula that grades fold/play
  decisions and produces the `correct` / `defensible` / `leak` verdict.

Full detail: [`docs/DOMAIN.md`](docs/DOMAIN.md)

## Conventions and gotchas

- **React Compiler is on.** Don't hand-add `useMemo`/`useCallback` defensively — the compiler handles
  it.
- **The EV heuristic is explicitly not solver-grade.** Never describe it as GTO, solver-derived, or
  optimal in code, comments, or UI copy — the source itself says so (`advisor.ts`).
- **No test suite exists yet.** This is a known, flagged gap (`docs/SETUP.md`), not an oversight to
  silently work around.
- **No separate system-design doc exists.** `advisor.ts` and `charts.ts` cite one ("system design doc
  §03/04/11") that isn't in this repo; `docs/DOMAIN.md` is the reconstructed reference — treat it, not
  the missing citation, as authoritative.
- **Documented solutions** — `docs/solutions/` holds durable learnings from past problems (bugs, best
  practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`,
  `problem_type`).
- **Shared vocabulary** — `CONCEPTS.md` defines domain terms and status concepts with project-specific
  meaning.
