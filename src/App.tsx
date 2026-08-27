import { useEffect } from "react";
import { useGame } from "./engine/useGame";
import { canonicalize } from "./core/canonical";
import type { TableSize } from "./data/charts";
import { Table } from "./components/Table";
import { RevealPanel } from "./components/RevealPanel";
import { StatsBar } from "./components/StatsBar";
import { CHARTS } from "./data/charts";

const TABLE_SIZES: TableSize[] = [2, 6, 9];

function App() {
  const { tableSize, hand, stats, act, next, setTableSize } = useGame(6);
  const handLabel = canonicalize(hand.cards).label;
  const seatLabel = CHARTS[tableSize][hand.situation.seatIndex].label;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (hand.phase === "AWAITING_ACTION") {
        if (k === "f") act("FOLD");
        else if (k === " " || k === "p") {
          e.preventDefault();
          act("PLAY");
        }
      } else if (hand.phase === "REVEALED" && (k === "n" || k === " ")) {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hand.phase, act, next]);

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col items-center gap-6 px-4 py-8">
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-paper">Fold or Play</h1>
          <p className="font-mono text-[11px] text-paper/40">preflop, unopened pot</p>
        </div>

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
      </header>

      <StatsBar stats={stats} />

      <Table tableSize={tableSize} seatIndex={hand.situation.seatIndex} heroCards={hand.cards} />

      <div className="flex w-full flex-col items-center gap-4">
        {hand.phase === "AWAITING_ACTION" ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-xs text-paper/45">
              you are <span className="text-paper/80">{handLabel}</span> in the{" "}
              <span className="text-paper/80">{seatLabel}</span> seat &mdash; action is on you
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => act("FOLD")}
                className="rounded-lg border-2 border-fold/50 bg-fold-soft px-8 py-3 font-display text-lg font-bold text-fold transition-colors hover:bg-fold/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fold"
              >
                Fold <span className="ml-1 font-mono text-xs opacity-60">(F)</span>
              </button>
              <button
                type="button"
                onClick={() => act("PLAY")}
                className="rounded-lg border-2 border-play/50 bg-play-soft px-8 py-3 font-display text-lg font-bold text-play transition-colors hover:bg-play/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-play"
              >
                Play <span className="ml-1 font-mono text-xs opacity-60">(Space)</span>
              </button>
            </div>
          </div>
        ) : hand.verdict ? (
          <RevealPanel verdict={hand.verdict} action={hand.action!} handLabel={handLabel} onNext={next} />
        ) : null}
      </div>
    </div>
  );
}

export default App;
