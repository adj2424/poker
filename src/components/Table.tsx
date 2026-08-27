import { CHARTS, type TableSize } from "../data/charts";
import { Seat } from "./Seat";
import type { Card as CardModel } from "../core/cards";

interface Props {
  tableSize: TableSize;
  seatIndex: number;
  heroCards: [CardModel, CardModel];
}

function seatOffset(i: number, heroIndex: number, n: number) {
  const theta = ((90 + (i - heroIndex) * (360 / n)) * Math.PI) / 180;
  const rx = 43;
  const ry = 39;
  const x = 50 + rx * Math.cos(theta);
  const y = 50 + ry * Math.sin(theta);
  return { left: `${x}%`, top: `${y}%` };
}

export function Table({ tableSize, seatIndex, heroCards }: Props) {
  const seats = CHARTS[tableSize];
  const n = seats.length;

  return (
    <div className="relative mx-auto aspect-[16/10] w-[min(100%,672px)]">
      {/* rail */}
      <div className="absolute inset-0 rounded-[46%] bg-rail-edge shadow-2xl" />
      {/* felt */}
      <div className="absolute inset-[3%] rounded-[46%] bg-gradient-to-b from-felt-light to-felt-dark shadow-[inset_0_0_60px_rgba(0,0,0,0.55)] ring-1 ring-black/30" />

      {/* center pot / info */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45">
          {tableSize === 2 ? "Heads-up" : `${tableSize}-max`} &middot; folded to you
        </span>
        <span className="font-mono text-xs text-paper/30">0.5 / 1 bb</span>
      </div>

      {seats.map((seat, i) => {
        const pos = seatOffset(i, seatIndex, n);
        const state = i === seatIndex ? "hero" : i < seatIndex ? "folded" : "waiting";
        return (
          <div
            key={seat.label + i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={pos}
          >
            <Seat
              label={i === seatIndex ? "You" : seat.label}
              state={state}
              isButton={seat.label === "BTN" || (tableSize === 2 && seat.label === "BTN")}
              isSB={seat.label === "SB" || (tableSize === 2 && seat.label === "BTN")}
              isBB={seat.label === "BB"}
              heroCards={i === seatIndex ? heroCards : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
