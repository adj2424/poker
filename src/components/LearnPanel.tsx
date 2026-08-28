import { useEffect, useRef, useState } from "react";
import { ONBOARDING_STEPS as STEPS } from "../content/onboardingSteps";
import { GLOSSARY } from "../content/glossary";
import { rangeFor } from "../advisor/advisor";
import { RangeGrid } from "./RangeGrid";
import { canonicalize } from "../core/canonical";
import type { Card } from "../core/cards";
import type { TableSize } from "../data/charts";
import { useFocusTrap } from "../engine/useFocusTrap";

const TABS = ["Basics", "Range", "Glossary"] as const;
type Tab = (typeof TABS)[number];

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
  const [tabIndex, setTabIndex] = useState(0);
  const range = rangeFor(tableSize, seatIndex);
  const { index: heroIndex } = canonicalize(heroCards);
  const tab: Tab = TABS[tabIndex];

  useFocusTrap(panelRef, onClose);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const target = e.target;
      if (target instanceof HTMLElement && target.closest("input, select, textarea")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setTabIndex((i) => (i - 1 + TABS.length) % TABS.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setTabIndex((i) => (i + 1) % TABS.length);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

        <div role="tablist" className="mt-4 flex items-center gap-1 rounded-lg border border-paper/10 bg-black/20 p-1">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTabIndex(i)}
              className={`flex-1 rounded-md px-2 py-1.5 font-mono text-xs font-semibold transition-colors ${
                tab === t ? "bg-accent text-ink" : "text-paper/50 hover:text-paper"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-1.5 self-center font-mono text-[10px] text-paper/30">(&larr;/&rarr; to switch)</p>

        {tab === "Basics" && (
          <section className="mt-4">
            <ol className="flex flex-col gap-2.5">
              {STEPS.map((step) => (
                <li key={step.title}>
                  <p className="text-sm font-semibold text-paper/85">{step.title}</p>
                  <p className="text-xs leading-snug text-paper/60">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {tab === "Range" && (
          <section className="mt-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-paper/40">
              {seatLabel}'s opening range
            </h3>
            <div className="mt-2">
              <RangeGrid range={range} heroIndex={heroIndex} seatLabel={seatLabel} />
            </div>
          </section>
        )}

        {tab === "Glossary" && (
          <section className="mt-4">
            <dl className="flex flex-col gap-2.5">
              {Object.values(GLOSSARY).map((entry) => (
                <div key={entry.term}>
                  <dt className="text-sm font-semibold text-paper/85">{entry.term}</dt>
                  <dd className="text-xs leading-snug text-paper/60">{entry.plain}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}
