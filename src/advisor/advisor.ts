import type { Card } from "../core/cards";
import { canonicalize } from "../core/canonical";
import { parseRange } from "../core/range";
import { equityVsRandom } from "../core/equity";
import { CHARTS, type TableSize } from "../data/charts";

export type Action = "FOLD" | "PLAY";
export type VerdictKind = "correct" | "defensible" | "leak";

export interface Situation {
  tableSize: TableSize;
  seatIndex: number; // index into CHARTS[tableSize]
}

export interface Verdict {
  kind: VerdictKind;
  fPlay: number; // chart frequency of playing this exact hand, 0..1
  chartPct: number; // this seat's overall range width, 0..1 — for context
  equityVsRandom: number; // Monte Carlo, this hand vs opponentsRemaining random hands
  evPlayBb: number;
  evFoldBb: number; // always 0 — blinds are sunk
  costBb: number; // how much the chosen action cost vs the better one
  position: string;
  opponentsRemaining: number;
}

// Chart-frequency thresholds that separate a clear open/fold from a mixed
// ("defensible") hand. Shared with RangeGrid so the picture and the verdict
// can never disagree.
export const PLAY_THRESHOLD = 0.85;
export const FOLD_THRESHOLD = 0.15;

// EV proxy constants — an explicit, documented heuristic, not solver output.
// See system design §04. Never surfaced in the UI as "GTO" or "solver".
const OPEN_SIZE_BB = 2.5;
const CONTINUE_FREQ_PER_OPPONENT = 0.11;
const REALIZATION_IN_POSITION = 1.05;
const REALIZATION_OUT_OF_POSITION = 0.88;

const rangeCache = new Map<string, Float32Array>();
export function rangeFor(tableSize: TableSize, seatIndex: number): Float32Array {
  const key = `${tableSize}:${seatIndex}`;
  const hit = rangeCache.get(key);
  if (hit) return hit;
  const spec = CHARTS[tableSize][seatIndex].spec ?? "";
  const r = parseRange(spec);
  rangeCache.set(key, r);
  return r;
}

function isInPosition(tableSize: TableSize, seatIndex: number): boolean {
  // Folded-to-hero pot: everyone left to act is behind hero, so hero acts
  // first postflop only from the blinds. Every other seat has position.
  const seat = CHARTS[tableSize][seatIndex];
  return seat.label !== "SB" && seat.label !== "BB";
}

export function evaluateSituation(hero: [Card, Card], situation: Situation): Omit<Verdict, "kind" | "costBb"> {
  const { tableSize, seatIndex } = situation;
  const seat = CHARTS[tableSize][seatIndex];
  const range = rangeFor(tableSize, seatIndex);
  const { index } = canonicalize(hero);
  const fPlay = range[index];

  let chartWeighted = 0;
  for (let i = 0; i < 169; i++) chartWeighted += range[i];
  const chartPct = chartWeighted / 169; // rough unweighted proxy, fine for a context stat

  const k = seat.opponentsRemaining;
  const eq = k > 0 ? equityVsRandom(hero, k) : 0.5;

  const pFoldRound = Math.pow(1 - CONTINUE_FREQ_PER_OPPONENT, k);
  const potIfCalled = 2 * OPEN_SIZE_BB + 0.5;
  const R = isInPosition(tableSize, seatIndex) ? REALIZATION_IN_POSITION : REALIZATION_OUT_OF_POSITION;
  // Folded-around pot: hero's own blind is sunk (evFoldBb below), so only the
  // OTHER blind is genuinely won money. From the SB that's just the BB (1.0);
  // from every other seat it's both blinds (1.5).
  const deadMoney = seat.label === "SB" ? 1.0 : 1.5;

  const evPlayBb =
    pFoldRound * deadMoney + (1 - pFoldRound) * (R * eq * potIfCalled - OPEN_SIZE_BB);
  const evFoldBb = 0;

  return {
    fPlay,
    chartPct,
    equityVsRandom: eq,
    evPlayBb,
    evFoldBb,
    position: seat.label,
    opponentsRemaining: k,
  };
}

/** Resolve the verdict against the actual action taken. */
export function scoreAction(hero: [Card, Card], situation: Situation, action: Action): Verdict {
  const base = evaluateSituation(hero, situation);
  const { fPlay, evPlayBb, evFoldBb } = base;

  let kind: VerdictKind;
  if (fPlay > FOLD_THRESHOLD && fPlay < PLAY_THRESHOLD) {
    kind = "defensible";
  } else {
    const chartWantsPlay = fPlay >= PLAY_THRESHOLD;
    const tookPlay = action === "PLAY";
    kind = chartWantsPlay === tookPlay ? "correct" : "leak";
  }

  // Cost is measured against the chart, not the EV heuristic: a chart-correct
  // action never costs anything, even when the EV proxy still prefers the
  // other action (e.g. fold equity keeps evPlayBb positive on some folds).
  const chosenEv = action === "PLAY" ? evPlayBb : evFoldBb;
  const bestEv = Math.max(evPlayBb, evFoldBb);
  const costBb = kind === "leak" ? Math.max(0, bestEv - chosenEv) : 0;

  return { ...base, kind, costBb };
}
