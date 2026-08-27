# Domain Model

> **No design doc exists for any of this.** `src/advisor/advisor.ts` and `src/data/charts.ts` both cite
> a "system design doc §03/04/11" — that document is not in this repo, and no external copy is known.
> Everything below is reconstructed from the source code and its own comments, not from that referenced
> document. Treat this file, not the missing citation, as the reference.

## Canonical hand classes

Preflop hole cards collapse to 169 distinct classes: suits are interchangeable, so only rank pair +
suited/offsuit/pair shape matters (`src/core/canonical.ts`).

- Layout is a row-major 13×13 grid, both axes running `A..2` (index `0..12`, via `RANKS.indexOf`).
- `row === col` → a pocket pair (`AA`, `KK`, ...).
- `row < col` → suited (`row` is the higher rank).
- `row > col` → offsuit.
- `classIndex(hi, lo, suited)` maps a `(row, col)` pair to a flat `0..168` index; `classLabel(row, col)`
  renders it back to a string (`"AKs"`, `"72o"`, `"TT"`).

This works because equity and range membership are suit-isomorphic — `AKs` behaves identically
regardless of which suit is "s" — so the app never needs to track actual suits for range/equity
purposes, only for rendering the cards.

## Range notation grammar

`src/core/range.ts` parses a small comma-separated grammar into a `Float32Array(169)` of play
frequencies, indexed by `classIndex`:

| Token | Meaning |
|---|---|
| `22+` | pairs 22 and better |
| `A2s+` | suited aces, A2s through AKs |
| `ATo+` | offsuit broadways, ATo through AKo |
| `98s` | a single hand |
| `44:0.5` | mixed frequency — play this hand 50% of the time (default is `1.0`) |

The `+` suffix expands a token into every hand at or above it in rank; the optional `:freq` suffix
overrides the default frequency of `1`. An unrecognized token is silently skipped (`continue`), not an
error.

## RFI charts

`src/data/charts.ts` defines the app's only range data: **unopened-pot raise-first-in (RFI) ranges**,
one per seat, keyed by table size (`2` / `6` / `9`). This is a deliberately narrow v1 scope — no 3-bet,
call, or postflop ranges exist anywhere in the app.

The charts are hand-authored, not solver output, chosen for **internal consistency** rather than
maximum precision: range width widens monotonically toward the button, with the small blind (SB) as the
one documented exception to that widening. The big blind (BB) never opens (`spec: null`) since it is
never first to act in an unopened pot.

Each `SeatChart` entry also carries `opponentsRemaining` — how many seats still have not folded to the
hero, i.e. would still get a chance to continue after the hero opens.

## Monte Carlo equity engine

`src/core/equity.ts` runs a **real Monte Carlo simulation in the browser** — there is no precomputed
equity lookup table.

- `simulateEquityVsRandom(hero, numOpponents, trials, rng)` partially Fisher-Yates-shuffles the
  remaining 50 cards, deals `numOpponents` random hands plus a 5-card board, evaluates hero and every
  opponent with `evaluateBest7`, and tallies wins/ties across `trials` full runouts.
- `equityVsRandom(hero, numOpponents, trials = 600)` memoizes that simulation by
  **canonical hand class + opponent count** (not by exact cards) — valid because equity vs. random
  opponents is suit-isomorphic, same as range membership above.
- Because it's a live simulation, the exact equity value has run-to-run sampling noise at the default
  600-trial count; it is not a fixed constant per hand class.

## Hand evaluator

`src/core/evaluate.ts` scores a 5-card hand as one integer so two hands compare with a plain `>`:
`category * 15^5 + kicker1 * 15^4 + ... + kicker5`, where `category` runs `0` (high card) to `8`
(straight flush). `evaluateBest7` finds the best 5-card score across all `C(7,5) = 21` combinations of
a 7-card hand (hero's 2 + a 5-card board).

## EV heuristic and verdict grading

`src/advisor/advisor.ts` grades the hero's fold/play decision against the RFI chart using an
**explicit, documented heuristic — not solver output**, and the source is explicit that this must never
be presented in the UI as GTO- or solver-grade (KTD3).

**Constants:**

| Constant | Value | Meaning |
|---|---|---|
| `OPEN_SIZE_BB` | `2.5` | Assumed open-raise size, in big blinds. |
| `CONTINUE_FREQ_PER_OPPONENT` | `0.11` | Assumed chance each remaining opponent continues (calls/3-bets) rather than folds. |
| `REALIZATION_IN_POSITION` | `1.05` | Equity-realization multiplier when the hero acts last postflop. |
| `REALIZATION_OUT_OF_POSITION` | `0.88` | Equity-realization multiplier when the hero is in the blinds (acts first postflop). |

**EV formula** (`evPlayBb`, in `evaluateSituation`):

```
pFoldRound   = (1 - CONTINUE_FREQ_PER_OPPONENT) ^ opponentsRemaining
potIfCalled  = 2 * OPEN_SIZE_BB + 0.5
R            = REALIZATION_IN_POSITION or REALIZATION_OUT_OF_POSITION
evPlayBb     = pFoldRound * 1.5
             + (1 - pFoldRound) * (R * equityVsRandom - OPEN_SIZE_BB)
evFoldBb     = 0   // blinds are sunk, so folding is always a 0 baseline
```

*Worked example (illustrative — equity is sampled, so the exact number varies slightly run to run):*
hero holds `AA` on the BTN at a 6-max table (`opponentsRemaining = 2`, in position). Re-running the
formula gives `pFoldRound ≈ 0.79`, `potIfCalled = 5.5`, equity vs. 2 random hands ≈ `0.74`, and
`evPlayBb ≈ +1.56 bb` — a clearly profitable open, consistent with `AA` being in every seat's `22+`
range at frequency `1.0`.

**Verdict grading** (`scoreAction`, the function whose result the UI actually shows) returns one of
three `VerdictKind` values:

- `fPlay` strictly between `0.15` and `0.85` → always **`defensible`** (the chart itself is mixed here,
  so either action is fine).
- Outside that band, the chart has a clear recommendation (`PLAY` when `fPlay >= 0.85`, `FOLD` when
  `fPlay <= 0.15`). The verdict is **`correct`** when the hero's action matches that recommendation, and
  **`leak`** when it doesn't.

`leak` is not just a label — it drives `SessionStats.leaks`, the "Leak" chip in `RevealPanel`, and the
streak reset in `useGame`'s reducer (a `defensible` hand does not reset the streak; a `leak` does).

`costBb` is `max(0, bestEv - chosenEv)` — how many bb the actual choice cost relative to the better of
`evPlayBb` / `evFoldBb`. It's tracked even on `correct` and `defensible` hands (usually `0` or small),
and summed into `SessionStats.evLostBb`.

## See also

- [ARCHITECTURE.md](./ARCHITECTURE.md) — where this logic sits in the module graph and how `useGame`
  consumes it.
- [SETUP.md](./SETUP.md) — dev environment and conventions.
