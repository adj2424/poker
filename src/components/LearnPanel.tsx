import { useEffect, useRef } from "react";
import { ONBOARDING_STEPS as STEPS } from "../content/onboardingSteps";
import { GLOSSARY } from "../content/glossary";
import { rangeFor } from "../advisor/advisor";
import { RangeGrid } from "./RangeGrid";
import { canonicalize } from "../core/canonical";
import type { Card } from "../core/cards";
import type { TableSize } from "../data/charts";
import { useFocusTrap } from "../engine/useFocusTrap";

export function LearnPanel({
  tableSize,
  seatIndex,
  seatLabel,
  heroCards,
  onClose,
}: {
  tableSize: TableSize;
  seatIndex: number;
  seatLabel: string;
  heroCards: [Card, Card];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const range = rangeFor(tableSize, seatIndex);
  const { index: heroIndex } = canonicalize(heroCards);

  useFocusTrap(panelRef);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/60">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="learn-panel-title"
        tabIndex={-1}
        className="flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-paper/15 bg-rail p-5 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 id="learn-panel-title" className="font-display text-lg font-bold text-paper">
            Learn
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-paper/15 px-2 py-1 font-mono text-xs text-paper/60 hover:text-paper"
          >
            Close (Esc)
          </button>
        </div>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-paper/40">The basics</h3>
          <ol className="mt-2 flex flex-col gap-2.5">
            {STEPS.map((step) => (
              <li key={step.title}>
                <p className="text-sm font-semibold text-paper/85">{step.title}</p>
                <p className="text-xs leading-snug text-paper/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-paper/40">
            {seatLabel}'s opening range
          </h3>
          <div className="mt-2">
            <RangeGrid range={range} heroIndex={heroIndex} seatLabel={seatLabel} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-paper/40">Glossary</h3>
          <dl className="mt-2 flex flex-col gap-2.5">
            {Object.values(GLOSSARY).map((entry) => (
              <div key={entry.term}>
                <dt className="text-sm font-semibold text-paper/85">{entry.term}</dt>
                <dd className="text-xs leading-snug text-paper/60">{entry.plain}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
