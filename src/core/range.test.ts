import { describe, expect, it } from "vitest";
import { classIndex } from "./canonical";
import { parseRange } from "./range";

describe("parseRange", () => {
  it("expands a pair-plus token to every pair at or above it", () => {
    const f = parseRange("QQ+");
    expect(f[classIndex(0, 0, true)]).toBe(1); // AA
    expect(f[classIndex(1, 1, true)]).toBe(1); // KK
    expect(f[classIndex(2, 2, true)]).toBe(1); // QQ
    expect(f[classIndex(3, 3, true)]).toBe(0); // JJ excluded
  });

  it("expands a suited-plus token from the given kicker up to the top", () => {
    const f = parseRange("A2s+");
    expect(f[classIndex(0, 1, true)]).toBe(1); // AKs
    expect(f[classIndex(0, 12, true)]).toBe(1); // A2s (rank index 12 = "2")
    expect(f[classIndex(1, 2, true)]).toBe(0); // KQs untouched
  });

  it("expands an offsuit-plus token respecting the boundary (exclusive of the pair)", () => {
    const f = parseRange("ATo+");
    expect(f[classIndex(0, 4, false)]).toBe(1); // ATo (T = index 4)
    expect(f[classIndex(0, 1, false)]).toBe(1); // AKo
    expect(f[classIndex(0, 5, false)]).toBe(0); // A9o excluded
  });

  it("sets a single hand with no plus", () => {
    const f = parseRange("98s");
    const idx = classIndex(5, 6, true); // 9 = index 5, 8 = index 6
    expect(f[idx]).toBe(1);
    expect(f.reduce((a, b) => a + (b > 0 ? 1 : 0), 0)).toBe(1);
  });

  it("applies a mixed-frequency suffix", () => {
    const f = parseRange("44:0.5");
    expect(f[classIndex(10, 10, true)]).toBeCloseTo(0.5); // 4 = index 10
  });

  it("skips a malformed token without throwing", () => {
    expect(() => parseRange("22+, KJ, QQ")).not.toThrow();
    const f = parseRange("22+, KJ, QQ");
    // KJ (no s/o suffix) is dropped; 22+ and QQ still parse.
    expect(f[classIndex(1, 2, true)]).toBe(0); // KQs untouched by the bad token
    expect(f[classIndex(2, 2, true)]).toBe(1); // QQ
  });

  it("returns an all-zero array for an empty spec", () => {
    const f = parseRange("");
    expect(f.length).toBe(169);
    expect(f.every((v) => v === 0)).toBe(true);
  });
});
