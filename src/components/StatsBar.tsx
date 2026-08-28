import type { ReactNode } from "react";
import type { SessionStats } from "../engine/useGame";
import { Term } from "./Term";

export function StatsBar({ stats }: { stats: SessionStats }) {
  const graded = stats.correct + stats.leaks;
  const accuracy = graded > 0 ? (stats.correct / graded) * 100 : null;
  const evPer100 = stats.hands > 0 ? (stats.evLostBb / stats.hands) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-paper/55">
      <Stat label="Hands" value={String(stats.hands)} />
      <Stat label="Accuracy" value={accuracy === null ? "—" : `${accuracy.toFixed(0)}%`} />
      <Stat label="Streak" value={String(stats.streak)} accent={stats.streak >= 5} />
      <Stat
        label={<Term id="ev">Chips lost / 100</Term>}
        value={`${evPer100.toFixed(1)} bb`}
        warn={evPer100 > 0.5}
      />
      <Stat label={<Term id="leak">Leaks</Term>} value={String(stats.leaks)} />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: ReactNode;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="uppercase tracking-widest text-paper/35">{label}</span>
      <span className={`tabular font-semibold ${accent ? "text-accent" : warn ? "text-fold" : "text-paper/85"}`}>
        {value}
      </span>
    </span>
  );
}
