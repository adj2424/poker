import type { SessionStats } from "../engine/useGame";

export function StatsBar({ stats }: { stats: SessionStats }) {
  const graded = stats.correct + stats.leaks;
  const accuracy = graded > 0 ? (stats.correct / graded) * 100 : null;
  const evPer100 = stats.hands > 0 ? (stats.evLostBb / stats.hands) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-paper/55">
      <Stat label="Hands" value={String(stats.hands)} />
      <Stat label="Accuracy" value={accuracy === null ? "—" : `${accuracy.toFixed(0)}%`} />
      <Stat label="Streak" value={String(stats.streak)} accent={stats.streak >= 5} />
      <Stat label="EV lost / 100" value={`${evPer100.toFixed(1)} bb`} warn={evPer100 > 0.5} />
      <Stat label="Leaks" value={String(stats.leaks)} />
    </div>
  );
}

function Stat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="uppercase tracking-widest text-paper/35">{label}</span>
      <span className={`tabular font-semibold ${accent ? "text-accent" : warn ? "text-fold" : "text-paper/85"}`}>
        {value}
      </span>
    </span>
  );
}
