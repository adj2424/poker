import { makeDeck, cardKey, type Card } from "./cards";
import { canonicalize } from "./canonical";
import { evaluateBest7 } from "./evaluate";

function partialShuffle(arr: Card[], m: number, rng: () => number): void {
  const n = arr.length;
  for (let i = 0; i < m; i++) {
    const j = i + Math.floor(rng() * (n - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * True Monte Carlo equity: hero's two cards vs `numOpponents` holding
 * uniformly random cards, run to a full board every trial. No lookup
 * table — this is the actual simulation the system design's offline
 * pipeline would otherwise precompute, run lazily in the browser instead.
 */
export function simulateEquityVsRandom(
  hero: [Card, Card],
  numOpponents: number,
  trials: number,
  rng: () => number = Math.random,
): number {
  const heroKeys = new Set([cardKey(hero[0]), cardKey(hero[1])]);
  const remaining = makeDeck().filter((c) => !heroKeys.has(cardKey(c)));
  const m = numOpponents * 2 + 5;

  let wins = 0;
  let ties = 0;

  for (let t = 0; t < trials; t++) {
    partialShuffle(remaining, m, rng);
    const board = remaining.slice(numOpponents * 2, numOpponents * 2 + 5);
    const heroScore = evaluateBest7([hero[0], hero[1], ...board]);

    let maxOpp = -1;
    for (let o = 0; o < numOpponents; o++) {
      const oc = [remaining[o * 2], remaining[o * 2 + 1]];
      const s = evaluateBest7([oc[0], oc[1], ...board]);
      if (s > maxOpp) maxOpp = s;
    }

    if (heroScore > maxOpp) wins++;
    else if (heroScore === maxOpp) ties++;
  }

  return (wins + ties * 0.5) / trials;
}

const cache = new Map<string, number>();

/**
 * Same simulation, memoized by canonical hand class + opponent count.
 * Valid because equity vs random is suit-isomorphic: AKs vs 4 random
 * has one true value regardless of which suit "s" happens to be.
 */
export function equityVsRandom(
  hero: [Card, Card],
  numOpponents: number,
  trials = 600,
): number {
  const { index } = canonicalize(hero);
  const key = `${index}:${numOpponents}:${trials}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const eq = simulateEquityVsRandom(hero, numOpponents, trials);
  cache.set(key, eq);
  return eq;
}
