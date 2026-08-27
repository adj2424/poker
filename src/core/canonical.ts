import { RANKS, type Card, type RankChar } from "./cards";

/**
 * Preflop hole cards collapse to 169 canonical classes: suits are
 * interchangeable, so only rank pair + suited/offsuit/pair shape matters.
 * Index layout: row-major 13x13, row < col => suited, row > col => offsuit,
 * row === col => pair. Both axes run A..2 (index 0..12).
 */
export function rankIndex(r: RankChar): number {
  return RANKS.indexOf(r);
}

export function classIndex(hi: number, lo: number, suited: boolean): number {
  return suited ? hi * 13 + lo : lo * 13 + hi;
}

export function classLabel(row: number, col: number): string {
  if (row === col) return RANKS[row] + RANKS[row];
  if (row < col) return RANKS[row] + RANKS[col] + "s";
  return RANKS[col] + RANKS[row] + "o";
}

export function combosForClass(row: number, col: number): number {
  if (row === col) return 6;
  return row < col ? 4 : 12;
}

/** hole cards -> {index 0..168, row, col, label} */
export function canonicalize(cards: [Card, Card]): { index: number; row: number; col: number; label: string } {
  const [a, b] = cards;
  const ai = rankIndex(a.rank);
  const bi = rankIndex(b.rank);
  const suited = a.suit === b.suit;

  if (ai === bi) {
    return { index: classIndex(ai, ai, true), row: ai, col: ai, label: classLabel(ai, ai) };
  }

  const hi = Math.min(ai, bi); // lower array index = stronger rank
  const lo = Math.max(ai, bi);
  const row = suited ? hi : lo;
  const col = suited ? lo : hi;
  return { index: classIndex(hi, lo, suited), row, col, label: classLabel(row, col) };
}
