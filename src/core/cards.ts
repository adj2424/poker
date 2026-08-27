export const RANKS = "AKQJT98765432" as const;
export type RankChar = (typeof RANKS)[number];

// Ace-high value used by the evaluator (2..14).
export const RANK_VALUE: Record<RankChar, number> = {
  A: 14, K: 13, Q: 12, J: 11, T: 10,
  "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2,
};

export const SUITS = ["s", "h", "d", "c"] as const;
export type Suit = (typeof SUITS)[number];

export interface Card {
  rank: RankChar;
  suit: Suit;
  value: number; // 2..14
}

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank: rank as RankChar, suit, value: RANK_VALUE[rank as RankChar] });
    }
  }
  return deck;
}

/** Fisher-Yates, mutates and returns the array. */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cardKey(c: Card): string {
  return c.rank + c.suit;
}

const SUIT_GLYPH: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
export function suitGlyph(s: Suit): string {
  return SUIT_GLYPH[s];
}

export function isRed(s: Suit): boolean {
  return s === "h" || s === "d";
}
