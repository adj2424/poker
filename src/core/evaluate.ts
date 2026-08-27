import type { Card } from "./cards";

/**
 * Scores a 5-card hand. Higher is better. Encoded as
 * category*15^5 + kicker1*15^4 + ... so two scores compare with a
 * single numeric `>`, no tuple comparison needed.
 * Categories: 8 straight flush · 7 quads · 6 full house · 5 flush
 * 4 straight · 3 trips · 2 two pair · 1 pair · 0 high card.
 */
export function evaluate5(cards: Card[]): number {
  const values = cards.map((c) => c.value).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  const uniqueDesc = [...new Set(values)].sort((a, b) => b - a);
  let straightHigh = 0;
  for (let i = 0; i <= uniqueDesc.length - 5; i++) {
    if (uniqueDesc[i] - uniqueDesc[i + 4] === 4) {
      straightHigh = uniqueDesc[i];
      break;
    }
  }
  if (!straightHigh && uniqueDesc.includes(14) && [5, 4, 3, 2].every((v) => uniqueDesc.includes(v))) {
    straightHigh = 5; // wheel: A-2-3-4-5, ace plays low
  }
  const isStraight = straightHigh > 0;

  let category: number;
  let kickers: number[];

  if (isStraight && isFlush) {
    category = 8;
    kickers = [straightHigh];
  } else if (groups[0][1] === 4) {
    category = 7;
    kickers = [groups[0][0], groups[1][0]];
  } else if (groups[0][1] === 3 && groups[1]?.[1] >= 2) {
    category = 6;
    kickers = [groups[0][0], groups[1][0]];
  } else if (isFlush) {
    category = 5;
    kickers = values;
  } else if (isStraight) {
    category = 4;
    kickers = [straightHigh];
  } else if (groups[0][1] === 3) {
    category = 3;
    kickers = [groups[0][0], ...groups.slice(1).map((g) => g[0])];
  } else if (groups[0][1] === 2 && groups[1]?.[1] === 2) {
    category = 2;
    kickers = [groups[0][0], groups[1][0], groups[2][0]];
  } else if (groups[0][1] === 2) {
    category = 1;
    kickers = [groups[0][0], ...groups.slice(1).map((g) => g[0])];
  } else {
    category = 0;
    kickers = values;
  }

  let score = category;
  const padded = kickers.slice(0, 5);
  while (padded.length < 5) padded.push(0);
  for (const k of padded) score = score * 15 + k;
  return score;
}

const COMBO_IDX: [number, number, number, number, number][] = (() => {
  const out: [number, number, number, number, number][] = [];
  for (let a = 0; a < 3; a++)
    for (let b = a + 1; b < 4; b++)
      for (let c = b + 1; c < 5; c++)
        for (let d = c + 1; d < 6; d++)
          for (let e = d + 1; e < 7; e++) out.push([a, b, c, d, e]);
  return out;
})();

/** Best 5-card score across all C(7,5)=21 combinations of a 7-card hand. */
export function evaluateBest7(cards: Card[]): number {
  let best = -1;
  const five: Card[] = new Array(5);
  for (const [a, b, c, d, e] of COMBO_IDX) {
    five[0] = cards[a];
    five[1] = cards[b];
    five[2] = cards[c];
    five[3] = cards[d];
    five[4] = cards[e];
    const score = evaluate5(five);
    if (score > best) best = score;
  }
  return best;
}
