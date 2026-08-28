import { describe, expect, it } from "vitest";
import { explainVerdict } from "./explain";
import type { Verdict } from "./advisor";

function verdict(overrides: Partial<Verdict>): Verdict {
  return {
    kind: "correct",
    fPlay: 1,
    chartPct: 0.3,
    equityVsRandom: 0.6,
    evPlayBb: 0.5,
    evFoldBb: 0,
    costBb: 0,
    position: "BTN",
    opponentsRemaining: 1,
    ...overrides,
  };
}

describe("explainVerdict hand shape x position x verdict coverage", () => {
  it("big pair, late position, correct play", () => {
    const v = verdict({ kind: "correct", fPlay: 1, position: "BTN", opponentsRemaining: 1 });
    const e = explainVerdict({ verdict: v, handLabel: "AA", action: "PLAY" });
    expect(e.because).toMatch(/pair/i);
    expect(e.because).toMatch(/1/);
  });

  it("small pair, early position, leak on play", () => {
    const v = verdict({ kind: "leak", fPlay: 0, position: "UTG", opponentsRemaining: 5 });
    const e = explainVerdict({ verdict: v, handLabel: "33", action: "PLAY" });
    expect(e.because).toMatch(/pair/i);
    expect(e.because).toMatch(/5/);
    expect(e.headline.toLowerCase()).toMatch(/cost|leak/);
  });

  it("suited ace, middle position, correct fold", () => {
    const v = verdict({ kind: "correct", fPlay: 0, position: "CO", opponentsRemaining: 3 });
    const e = explainVerdict({ verdict: v, handLabel: "A2s", action: "FOLD" });
    expect(e.because).toMatch(/suited ace/i);
    expect(e.because).toMatch(/3/);
  });

  it("suited broadway, late position, leak on fold", () => {
    const v = verdict({ kind: "leak", fPlay: 1, position: "BTN", opponentsRemaining: 1 });
    const e = explainVerdict({ verdict: v, handLabel: "KQs", action: "FOLD" });
    expect(e.because).toMatch(/suited broadway/i);
    expect(e.headline.toLowerCase()).toMatch(/cost|leak/);
  });

  it("suited connector, middle position, defensible", () => {
    const v = verdict({ kind: "defensible", fPlay: 0.5, position: "HJ", opponentsRemaining: 4 });
    const e = explainVerdict({ verdict: v, handLabel: "76s", action: "PLAY" });
    expect(e.because).toMatch(/suited connector/i);
    expect(e.headline.toLowerCase()).toMatch(/either|fine|mix/);
    expect(e.nuance).toBeTruthy();
  });

  it("offsuit broadway, early position, correct play", () => {
    const v = verdict({ kind: "correct", fPlay: 1, position: "UTG", opponentsRemaining: 5 });
    const e = explainVerdict({ verdict: v, handLabel: "AJo", action: "PLAY" });
    expect(e.because).toMatch(/offsuit broadway/i);
    expect(e.because).toMatch(/5/);
  });

  it("weak offsuit, early position, correct fold", () => {
    const v = verdict({ kind: "correct", fPlay: 0, position: "UTG", opponentsRemaining: 5 });
    const e = explainVerdict({ verdict: v, handLabel: "94o", action: "FOLD" });
    expect(e.because).toMatch(/offsuit/i);
  });

  it("weak offsuit, late position, leak on fold", () => {
    const v = verdict({ kind: "leak", fPlay: 1, position: "BTN", opponentsRemaining: 1 });
    const e = explainVerdict({ verdict: v, handLabel: "72o", action: "FOLD" });
    expect(e.headline.toLowerCase()).toMatch(/cost|leak/);
    expect(e.because).toMatch(/1/);
  });

  it("headline distinguishes correct play from correct fold", () => {
    const playV = verdict({ kind: "correct", fPlay: 1 });
    const foldV = verdict({ kind: "correct", fPlay: 0 });
    const playE = explainVerdict({ verdict: playV, handLabel: "AKs", action: "PLAY" });
    const foldE = explainVerdict({ verdict: foldV, handLabel: "72o", action: "FOLD" });
    expect(playE.headline).not.toBe(foldE.headline);
  });

  it("every because string names both a hand-shape reason and a seats-behind reason", () => {
    const cases: Array<[string, number, string]> = [
      ["AA", 1, "BTN"],
      ["76s", 4, "HJ"],
      ["94o", 5, "UTG"],
    ];
    for (const [handLabel, opponentsRemaining, position] of cases) {
      const v = verdict({ opponentsRemaining, position, kind: "correct", fPlay: 1 });
      const e = explainVerdict({ verdict: v, handLabel, action: "PLAY" });
      expect(e.because).toMatch(String(opponentsRemaining));
    }
  });
});
