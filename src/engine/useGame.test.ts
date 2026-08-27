import { describe, expect, it } from "vitest";
import { init, reducer, type State } from "./useGame";
import type { Card } from "../core/cards";
import { CHARTS } from "../data/charts";

// BTN in 6-max is index 3 (UTG, HJ, CO, BTN, SB, BB) and opens the widest
// range, so AA is a certain "play" (fPlay === 1) and 72o is a certain
// "fold" (fPlay === 0) from that seat — both land outside the mixed band,
// giving deterministic correct/leak verdicts for the tests below.
const BTN_SEAT_INDEX = CHARTS[6].findIndex((s) => s.label === "BTN");

function stateWithHand(cards: [Card, Card]): State {
  const base = init(6);
  return { ...base, hand: { ...base.hand, cards, situation: { tableSize: 6, seatIndex: BTN_SEAT_INDEX } } };
}

const ACE_ACE: [Card, Card] = [
  { rank: "A", suit: "s", value: 14 },
  { rank: "A", suit: "h", value: 14 },
];
const SEVEN_DEUCE_OFFSUIT: [Card, Card] = [
  { rank: "7", suit: "s", value: 7 },
  { rank: "2", suit: "h", value: 2 },
];

describe("reducer ACT", () => {
  it("is a no-op once the hand has already been revealed", () => {
    const afterFirst = reducer(stateWithHand(ACE_ACE), { type: "ACT", action: "PLAY" });
    expect(afterFirst.hand.phase).toBe("REVEALED");
    const afterSecond = reducer(afterFirst, { type: "ACT", action: "FOLD" });
    expect(afterSecond).toBe(afterFirst); // same reference: reducer returned early
    expect(afterSecond.stats.hands).toBe(1);
  });

  it("increments streak and bestStreak on a correct action", () => {
    const s = reducer(stateWithHand(ACE_ACE), { type: "ACT", action: "PLAY" });
    expect(s.hand.verdict?.kind).toBe("correct");
    expect(s.stats.correct).toBe(1);
    expect(s.stats.streak).toBe(1);
    expect(s.stats.bestStreak).toBe(1);
  });

  it("resets streak to 0 on a leak", () => {
    const s = reducer(stateWithHand(SEVEN_DEUCE_OFFSUIT), { type: "ACT", action: "PLAY" });
    expect(s.hand.verdict?.kind).toBe("leak");
    expect(s.stats.leaks).toBe(1);
    expect(s.stats.streak).toBe(0);
  });

  it("charges no EV cost for a chart-correct action", () => {
    const s = reducer(stateWithHand(ACE_ACE), { type: "ACT", action: "PLAY" });
    expect(s.hand.verdict?.costBb).toBe(0);
  });
});

describe("reducer SET_TABLE_SIZE", () => {
  it("resets stats when the table size actually changes", () => {
    const played = reducer(stateWithHand(ACE_ACE), { type: "ACT", action: "PLAY" });
    const resized = reducer(played, { type: "SET_TABLE_SIZE", tableSize: 9 });
    expect(resized.tableSize).toBe(9);
    expect(resized.stats.hands).toBe(0);
  });

  it("is a no-op when re-selecting the already-active table size", () => {
    const played = reducer(stateWithHand(ACE_ACE), { type: "ACT", action: "PLAY" });
    const resized = reducer(played, { type: "SET_TABLE_SIZE", tableSize: played.tableSize });
    expect(resized).toBe(played); // same reference: reducer returned early
    expect(resized.stats.hands).toBe(1);
  });
});
