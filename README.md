# Fold or Play

A single-page preflop fold/play poker trainer. You're dealt two cards in an unopened pot, pick **fold**
or **play**, and get graded against a hand-authored RFI (raise-first-in) range chart plus a Monte Carlo
equity/EV estimate.

## Quick start

```bash
npm install
npm run dev
```

Opens the dev server on [localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server on port `3000`. |
| `npm run build` | Type-checks (`tsc -b`) then builds for production (`vite build`). |
| `npm run lint` | Runs ESLint over the repo. |
| `npm run preview` | Serves the production build locally. |

Full setup detail (tooling, conventions, known gaps): [`docs/SETUP.md`](docs/SETUP.md).

## How it works

You're dealt a hand at a random seat (2/6/9-max, unopened pot) and choose **fold** or **play** —
keyboard shortcuts work too (`f` fold, `space`/`p` play, `space`/`n` next hand). The app grades your
action against that seat's RFI chart and an equity estimate, then shows a **correct**, **defensible**,
or **leak** verdict alongside the EV you left on the table. Session stats (accuracy, streak, leaks, EV
lost) track across hands; switching table size resets the session.

The grading is an explicit, documented heuristic — never described as GTO or solver-derived. See
[`docs/DOMAIN.md`](docs/DOMAIN.md) for the full math (canonical hand classes, range notation, equity
simulation, and how the correct/defensible/leak verdict is computed).

## Stack

React 19 + TypeScript + Vite 8, Tailwind v4, React Compiler enabled. No backend, no external state
library — a single `useReducer` holds all app state.

## Module map

```text
core/       pure domain logic (cards, canonical hand indexing, range parsing, hand evaluation, equity)
advisor/    scoring layer — composes core/ + data/charts.ts into hand verdicts
data/       RFI range charts (the only range data in the app: unopened-pot opens)
engine/     useGame — the one useReducer holding all app state
components/ presentational only
```

Full detail, including the module-dependency diagram and component tree:
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Documentation

- [`AGENTS.md`](AGENTS.md) — compact orientation for coding agents (architecture, domain vocabulary,
  conventions and gotchas).
- [`docs/SETUP.md`](docs/SETUP.md) — dev environment, scripts, tooling, and conventions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module dependency graph, state model, component tree.
- [`docs/DOMAIN.md`](docs/DOMAIN.md) — the poker domain model: canonical hand classes, range grammar,
  RFI charts, equity simulation, and the EV/verdict heuristic.
- [`CONCEPTS.md`](CONCEPTS.md) — shared domain vocabulary (entities, named processes, status concepts)
  with project-specific meaning.
- [`docs/solutions/`](docs/solutions/) — durable learnings from past problems (bugs, best practices,
  workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`).

## Known gaps

There is currently no test suite (see [`docs/SETUP.md`](docs/SETUP.md#known-gap-no-test-suite)) and no
separate system-design doc — `docs/DOMAIN.md` is a from-source reconstruction and is treated as
authoritative in its place.
