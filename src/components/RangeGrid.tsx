import { classLabel } from "../core/canonical";

/**
 * 13x13 visual range chart. Index layout matches core/canonical.ts exactly
 * (row-major, row < col => suited, row > col => offsuit, row === col =>
 * pair) -- do not reimplement the mapping, reuse classLabel so a layout
 * drift can never silently mislabel a cell.
 */
export function RangeGrid({
  range,
  heroIndex,
  seatLabel,
}: {
  range: Float32Array;
  heroIndex: number;
  seatLabel: string;
}) {
  const heroRow = Math.floor(heroIndex / 13);
  const heroCol = heroIndex % 13;

  return (
    <div>
      <div
        className="grid gap-[2px] rounded-md bg-black/20 p-1.5"
        style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
        role="img"
        aria-label={`${seatLabel}'s opening range, 13 by 13 grid of starting hands`}
      >
        {Array.from({ length: 13 }, (_, row) =>
          Array.from({ length: 13 }, (_, col) => {
            const idx = row * 13 + col;
            const fPlay = range[idx];
            const isHero = row === heroRow && col === heroCol;
            const tone =
              fPlay >= 0.85 ? "bg-play/70 text-ink" : fPlay > 0.15 ? "bg-marginal/60 text-ink" : "bg-rail-edge/40 text-paper/35";
            return (
              <div
                key={idx}
                className={`flex aspect-square items-center justify-center rounded-[2px] font-mono text-[7px] font-semibold leading-none ${tone} ${
                  isHero ? "ring-2 ring-accent ring-offset-1 ring-offset-rail" : ""
                }`}
                aria-current={isHero ? "true" : undefined}
              >
                {classLabel(row, col)}
              </div>
            );
          }),
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-paper/50">
        <Legend swatch="bg-play/70" label="opens" />
        <Legend swatch="bg-marginal/60" label="sometimes opens" />
        <Legend swatch="bg-rail-edge/40" label="folds" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
