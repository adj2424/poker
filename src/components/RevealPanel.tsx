import { useState } from "react";
import type { Action, Verdict } from "../advisor/advisor";
import { rangeFor } from "../advisor/advisor";
import { explainVerdict } from "../advisor/explain";
import { canonicalize } from "../core/canonical";
import type { Card } from "../core/cards";
import type { Situation } from "../advisor/advisor";
import { RangeGrid } from "./RangeGrid";

const CHIP: Record<Verdict["kind"], { label: string; classes: string }> = {
  correct: { label: "Correct", classes: "bg-play-soft text-play border-play/40" },
  defensible: { label: "Defensible", classes: "bg-marginal-soft text-marginal border-marginal/40" },
  leak: { label: "Leak", classes: "bg-fold-soft text-fold border-fold/40" },
};

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

// equityVsRandom is a 600-trial Monte Carlo sample (~2pp standard error) —
// a tenths digit would misrepresent it as exact, unlike fPlay's chart lookup.
function pctCoarse(x: number) {
  return `${(x * 100).toFixed(0)}%`;
}

export function RevealPanel({
  verdict,
  action,
  handLabel,
  heroCards,
  situation,
  onNext,
}: {
  verdict: Verdict;
  action: Action;
  handLabel: string;
  heroCards: [Card, Card];
  situation: Situation;
  onNext: () => void;
}) {
  const [showNumbers, setShowNumbers] = useState(false);
  const chip = CHIP[verdict.kind];
  const explanation = explainVerdict({ verdict, handLabel, action });
  const { index: heroIndex } = canonicalize(heroCards);
  const range = rangeFor(situation.tableSize, situation.seatIndex);

  return (
    <div className="w-full max-w-xl rounded-xl border border-paper/10 bg-rail/90 p-4 shadow-2xl backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${chip.classes}`}>
            {chip.label}
          </span>
          <span className="font-mono text-xs text-paper/50">
            you {action === "PLAY" ? "played" : "folded"} {handLabel}
          </span>
        </div>
        <span className="font-mono text-[11px] text-paper/40">
          {verdict.position} &middot; {verdict.opponentsRemaining} to act
        </span>
      </div>

      <p className="mt-2.5 font-display text-base font-bold text-paper">{explanation.headline}</p>
      <p className="mt-1 text-sm leading-snug text-paper/80">{explanation.because}</p>
      {explanation.nuance && <p className="mt-1 text-sm leading-snug text-paper/60">{explanation.nuance}</p>}

      <button
        type="button"
        onClick={() => setShowNumbers((v) => !v)}
        aria-expanded={showNumbers}
        className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-paper/45 underline decoration-dotted hover:text-paper/70"
      >
        {showNumbers ? "Hide the numbers" : "Show the numbers"}
      </button>

      {showNumbers && (
        <div className="mt-2 border-t border-paper/10 pt-3">
          <dl className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-paper/40">Chart says play</dt>
              <dd className="tabular font-display text-lg font-bold text-paper">{pct(verdict.fPlay)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-paper/40">Equity vs random</dt>
              <dd className="tabular font-display text-lg font-bold text-paper">{pctCoarse(verdict.equityVsRandom)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-paper/40">Est. cost</dt>
              <dd className={`tabular font-display text-lg font-bold ${verdict.costBb > 0 ? "text-fold" : "text-play"}`}>
                {verdict.costBb > 0 ? `-${verdict.costBb.toFixed(2)} bb` : "0.00 bb"}
              </dd>
            </div>
          </dl>

          <p className="mt-2 font-mono text-[10.5px] leading-snug text-paper/35">
            Equity is a live Monte Carlo simulation run in your browser, not a lookup table. Cost is a
            heuristic EV estimate (fixed 2.5bb open, position-adjusted) — not solver output.
          </p>

          <div className="mt-3">
            <RangeGrid range={range} heroIndex={heroIndex} seatLabel={verdict.position} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2 font-display font-bold text-ink transition-colors hover:bg-accent-dim hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Next hand <span className="ml-1 font-mono text-xs opacity-60">(N)</span>
      </button>
    </div>
  );
}
