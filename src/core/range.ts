import { RANKS } from "./cards";
import { classIndex } from "./canonical";

/**
 * Range notation grammar, comma-separated tokens:
 *   22+          pairs 22 and better
 *   A2s+         A2s through AKs
 *   ATo+         ATo through AKo
 *   98s          a single hand
 *   44:0.5       mixed — play at this frequency (default 1.0)
 * Returns a Float32Array(169) of play frequencies indexed by classIndex.
 */
export function parseRange(spec: string): Float32Array {
  const f = new Float32Array(169);
  if (!spec) return f;

  for (const raw of spec.split(",")) {
    let tok = raw.replace(/\s+/g, "");
    if (!tok) continue;

    let freq = 1;
    const colon = tok.indexOf(":");
    if (colon !== -1) {
      const parsed = parseFloat(tok.slice(colon + 1));
      freq = Number.isFinite(parsed) ? parsed : 1;
      tok = tok.slice(0, colon);
    }

    const plus = tok.charAt(tok.length - 1) === "+";
    if (plus) tok = tok.slice(0, -1);

    const a = RANKS.indexOf(tok.charAt(0).toUpperCase());
    const b = RANKS.indexOf(tok.charAt(1).toUpperCase());
    if (a < 0 || b < 0) continue;

    if (a === b) {
      for (let p = plus ? 0 : a; p <= a; p++) f[classIndex(p, p, true)] = freq;
      continue;
    }

    const hi = Math.min(a, b);
    const lo = Math.max(a, b);
    const suitTag = tok.charAt(2)?.toLowerCase();
    if (suitTag !== "s" && suitTag !== "o") continue;
    const suited = suitTag === "s";

    const from = plus ? hi + 1 : lo;
    for (let k = lo; k >= from; k--) f[classIndex(hi, k, suited)] = freq;
  }

  return f;
}
