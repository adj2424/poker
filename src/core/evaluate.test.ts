import { describe, expect, it } from "vitest";
import { RANK_VALUE, type Card, type RankChar, type Suit } from "./cards";
import { evaluate5, evaluateBest7 } from "./evaluate";

function c(spec: string): Card {
  const rank = spec[0] as RankChar;
  const suit = spec[1] as Suit;
  return { rank, suit, value: RANK_VALUE[rank] };
}

function hand(spec: string): Card[] {
  return spec.split(" ").map(c);
}

describe("evaluate5 category ordering", () => {
  it("ranks straight flush above quads", () => {
    expect(evaluate5(hand("9s 8s 7s 6s 5s"))).toBeGreaterThan(evaluate5(hand("Ah Ad Ac As Kh")));
  });

  it("ranks quads above a full house", () => {
    expect(evaluate5(hand("Ah Ad Ac As Kh"))).toBeGreaterThan(evaluate5(hand("Kh Kd Kc Qh Qd")));
  });

  it("ranks a full house above a flush", () => {
    expect(evaluate5(hand("Kh Kd Kc Qh Qd"))).toBeGreaterThan(evaluate5(hand("2h 5h 9h Jh Kh")));
  });

  it("ranks a flush above a straight", () => {
    expect(evaluate5(hand("2h 5h 9h Jh Kh"))).toBeGreaterThan(evaluate5(hand("9s 8h 7d 6c 5s")));
  });

  it("ranks a straight above trips", () => {
    expect(evaluate5(hand("9s 8h 7d 6c 5s"))).toBeGreaterThan(evaluate5(hand("7h 7d 7c Ks 2h")));
  });

  it("ranks trips above two pair", () => {
    expect(evaluate5(hand("7h 7d 7c Ks 2h"))).toBeGreaterThan(evaluate5(hand("Jh Jd 4c 4h 2s")));
  });

  it("ranks two pair above one pair", () => {
    expect(evaluate5(hand("Jh Jd 4c 4h 2s"))).toBeGreaterThan(evaluate5(hand("9h 9d Kc 4h 2s")));
  });

  it("ranks one pair above high card", () => {
    expect(evaluate5(hand("9h 9d Kc 4h 2s"))).toBeGreaterThan(evaluate5(hand("Ah Kd Qc 4h 2s")));
  });
});

describe("evaluate5 straight edge cases", () => {
  it("scores the wheel (A-2-3-4-5) as a straight, ace playing low", () => {
    const wheel = evaluate5(hand("Ah 2d 3c 4h 5s"));
    const sixHigh = evaluate5(hand("6h 5d 4c 3h 2s"));
    expect(wheel).toBeLessThan(sixHigh);
    // still a straight (category 4), not high card (category 0..3 range)
    const highCard = evaluate5(hand("Ah Kd Qc Jh 9s"));
    expect(wheel).toBeGreaterThan(highCard);
  });

  it("scores a broadway (ace-high) straight above the wheel", () => {
    const wheel = evaluate5(hand("Ah 2d 3c 4h 5s"));
    const broadway = evaluate5(hand("Th Jd Qc Kh As"));
    expect(broadway).toBeGreaterThan(wheel);
  });

  it("scores a steel wheel (A-2-3-4-5 suited) as a straight flush", () => {
    const steelWheel = evaluate5(hand("Ah 2h 3h 4h 5h"));
    const quads = evaluate5(hand("Ah Ad Ac As Kh"));
    expect(steelWheel).toBeGreaterThan(quads);
  });
});

describe("evaluateBest7", () => {
  it("picks the best 5-card combination out of 7", () => {
    // Board makes a flush; hero's two off-suit cards should be ignored.
    const cards = hand("2h 5h 9h Jh Kh 3c 4d");
    const boardOnly = evaluate5(hand("2h 5h 9h Jh Kh"));
    expect(evaluateBest7(cards)).toBe(boardOnly);
  });

  it("prefers a 7-card full house over an incidental flush draw", () => {
    const cards = hand("Kh Kd Kc Qh Qd 2h 7c");
    expect(evaluateBest7(cards)).toBe(evaluate5(hand("Kh Kd Kc Qh Qd")));
  });
});
