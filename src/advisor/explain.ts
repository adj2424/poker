import type { Action, Verdict } from "./advisor";
import { RANKS } from "../core/cards";

export interface Explanation {
  headline: string;
  because: string;
  nuance?: string;
}

const BROADWAY = new Set(["A", "K", "Q", "J", "T"]);
const BIG_PAIR = new Set(["A", "K", "Q", "J", "T"]);
const MEDIUM_PAIR = new Set(["9", "8", "7", "6"]);

function shapePhrase(handLabel: string): string {
  if (handLabel.length === 2) {
    const rank = handLabel[0];
    if (BIG_PAIR.has(rank)) return "a big pair";
    if (MEDIUM_PAIR.has(rank)) return "a medium pair";
    return "a small pair";
  }

  const [r1, r2, tag] = handLabel;
  const suited = tag === "s";

  if (suited) {
    if (r1 === "A") return "a suited ace";
    if (BROADWAY.has(r1) && BROADWAY.has(r2)) return "a suited broadway hand";
    if (Math.abs(RANKS.indexOf(r1) - RANKS.indexOf(r2)) === 1) return "a suited connector";
    return "a suited hand";
  }

  if (BROADWAY.has(r1) && BROADWAY.has(r2)) return "an offsuit broadway hand";
  return "a weak offsuit hand";
}

function seatsPhrase(opponentsRemaining: number): string {
  const players = opponentsRemaining === 1 ? "player" : "players";
  if (opponentsRemaining <= 1) {
    return `with only ${opponentsRemaining} ${players} left to act behind you, so this range plays wide`;
  }
  if (opponentsRemaining <= 3) {
    return `with ${opponentsRemaining} ${players} still to act behind you`;
  }
  return `with ${opponentsRemaining} ${players} still to act behind you, so the range has to stay tight`;
}

function headlineFor(verdict: Verdict, action: Action): string {
  if (verdict.kind === "defensible") return "Either action is fine here.";
  if (verdict.kind === "leak") {
    return action === "PLAY" ? "That play cost you." : "That fold cost you.";
  }
  return action === "PLAY" ? "Playing was right." : "Folding was right.";
}

/** Pure, dependency-free: turns a graded Verdict into a plain-English reason. */
export function explainVerdict({
  verdict,
  handLabel,
  action,
}: {
  verdict: Verdict;
  handLabel: string;
  action: Action;
}): Explanation {
  const shape = shapePhrase(handLabel);
  const seats = seatsPhrase(verdict.opponentsRemaining);
  const because = `${handLabel} is ${shape} from ${verdict.position}, ${seats}.`;

  const headline = headlineFor(verdict, action);

  if (verdict.kind === "defensible") {
    return {
      headline,
      because,
      nuance: `The chart itself is split on ${handLabel} here — it opens this hand about ${Math.round(
        verdict.fPlay * 100,
      )}% of the time, so there's no single right answer.`,
    };
  }

  return { headline, because };
}
