import { useEffect, useState } from "react";
import { useGame } from "./engine/useGame";
import { useOnboarding } from "./engine/useOnboarding";
import { canonicalize } from "./core/canonical";
import type { TableSize } from "./data/charts";
import { Table } from "./components/Table";
import { RevealPanel } from "./components/RevealPanel";
import { StatsBar } from "./components/StatsBar";
import { Term } from "./components/Term";
import type { TermId } from "./content/glossary";
import { Onboarding } from "./components/Onboarding";
import { LearnPanel } from "./components/LearnPanel";
import { useAnyTermOpen } from "./engine/useTermRegistry";
import { CHARTS } from "./data/charts";

const TABLE_SIZES: TableSize[] = [2, 6, 9];

const SEAT_TERM: Record<string, TermId> = {
  UTG: "seatUTG",
  UTG1: "seatUTG1",
  UTG2: "seatUTG2",
  LJ: "seatLJ",
  HJ: "seatHJ",
  CO: "seatCO",
  BTN: "seatBTN",
  SB: "seatSB",
  BB: "seatBB",
};

function App() {
  const { tableSize, hand, stats, act, next, setTableSize } = useGame(6);
  const onboarding = useOnboarding();
  const [learnOpen, setLearnOpen] = useState(false);
  const handLabel = canonicalize(hand.cards).label;
  const seatLabel = CHARTS[tableSize][hand.situation.seatIndex].label;
  const anyTermOpen = useAnyTermOpen();
  const overlayOpen = onboarding.open || learnOpen || anyTermOpen;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      if (overlayOpen) return;
      const target = e.target;
      if (target instanceof HTMLElement && target.closest("button, a, input, select, textarea")) return;
      const k = e.key.toLowerCase();
      if (hand.phase === "AWAITING_ACTION") {
        if (k === "arrowleft") act("FOLD");
        else if (k === "arrowright") {
          e.preventDefault();
          act("PLAY");
        }
      } else if (hand.phase === "REVEALED" && (k === "arrowleft" || k === "arrowright")) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hand.phase, act, next, overlayOpen]);

  return (
    <div className="mx-auto flex h-svh max-w-5xl flex-col items-center gap-2 overflow-y-auto px-4 py-3 sm:gap-3 sm:py-4">
      <header className="flex w-full shrink-0 flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-extrabold tracking-tight text-paper">Fold or Play</h1>
          <p className="font-mono text-[11px] text-paper/40">
            <Term id="preflop">preflop</Term>, <Term id="unopenedPot">unopened pot</Term>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-paper/10 bg-black/20 p-1">
            {TABLE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setTableSize(size)}
                className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                  tableSize === size ? "bg-accent text-ink" : "text-paper/50 hover:text-paper"
                }`}
              >
                {size === 2 ? "HU" : `${size}-max`}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLearnOpen(true)}
            className="rounded-lg border border-paper/10 bg-black/20 px-3 py-1.5 font-mono text-xs font-semibold text-paper/50 hover:text-paper"
          >
            Learn
          </button>
        </div>
      </header>

      <div className="shrink-0">
        <StatsBar stats={stats} />
      </div>

      <div className="flex w-full shrink-0 items-center justify-center">
        <Table tableSize={tableSize} seatIndex={hand.situation.seatIndex} heroCards={hand.cards} />
      </div>

      {/* Hero seat's cards/badge extend ~23px below the table's own box (seatOffset
          places it near the bottom edge) -- this margin must clear that overhang so
          the result panel never sits under it. */}
      <div className="mt-5 flex w-full shrink-0 flex-col items-center gap-4">
        {hand.phase === "AWAITING_ACTION" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-xs text-paper/45">
              you are{" "}
              <span className="text-paper/80">
                <Term id="handNotation">{handLabel}</Term>
              </span>{" "}
              in the{" "}
              <span className="text-paper/80">
                <Term id={SEAT_TERM[seatLabel] ?? "position"}>{seatLabel}</Term>
              </span>{" "}
              seat &mdash; action is on you
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => act("FOLD")}
                className="rounded-lg border-2 border-fold/50 bg-fold-soft px-8 py-3 font-display text-lg font-bold text-fold transition-colors hover:bg-fold/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fold"
              >
                Fold <span className="ml-1 font-mono text-xs opacity-60">(&larr;)</span>
              </button>
              <button
                type="button"
                onClick={() => act("PLAY")}
                className="rounded-lg border-2 border-play/50 bg-play-soft px-8 py-3 font-display text-lg font-bold text-play transition-colors hover:bg-play/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-play"
              >
                Play <span className="ml-1 font-mono text-xs opacity-60">(&rarr;)</span>
              </button>
            </div>
          </div>
        ) : hand.verdict ? (
          <RevealPanel
            verdict={hand.verdict}
            action={hand.action!}
            handLabel={handLabel}
            heroCards={hand.cards}
            situation={hand.situation}
            onNext={next}
          />
        ) : null}
      </div>

      {onboarding.open && <Onboarding heroCards={hand.cards} onClose={onboarding.close} />}
      {learnOpen && (
        <LearnPanel
          tableSize={tableSize}
          seatIndex={hand.situation.seatIndex}
          seatLabel={seatLabel}
          heroCards={hand.cards}
          onClose={() => setLearnOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
