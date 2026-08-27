import { PlayingCard } from "./Card";
import type { Card as CardModel } from "../core/cards";

export type SeatState = "folded" | "waiting" | "hero";

export function Seat({
  label,
  state,
  isButton,
  isBB,
  isSB,
  heroCards,
}: {
  label: string;
  state: SeatState;
  isButton: boolean;
  isBB: boolean;
  isSB: boolean;
  heroCards?: [CardModel, CardModel];
}) {
  const dimmed = state === "folded";

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-300 ${dimmed ? "opacity-35" : "opacity-100"}`}>
      <div className="flex gap-0.5">
        {state === "hero" && heroCards ? (
          <>
            <PlayingCard card={heroCards[0]} size="lg" />
            <PlayingCard card={heroCards[1]} size="lg" />
          </>
        ) : (
          <>
            <PlayingCard faceDown size="sm" />
            <PlayingCard faceDown size="sm" />
          </>
        )}
      </div>

      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 font-display text-[11px] font-bold tracking-wide ${
          state === "hero"
            ? "border-accent bg-accent/20 text-paper"
            : dimmed
              ? "border-rail-edge bg-rail text-paper/50"
              : "border-paper/25 bg-felt-light text-paper/90"
        }`}
      >
        {label}
        {isButton && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-rail-edge bg-gold text-[9px] font-black text-rail">
            D
          </span>
        )}
        {(isSB || isBB) && (
          <span className="absolute -bottom-1.5 rounded-full bg-rail px-1 py-px text-[8px] font-mono font-semibold text-paper/70">
            {isSB ? "sb" : "bb"}
          </span>
        )}
      </div>

      {dimmed && <span className="font-mono text-[9px] uppercase tracking-wider text-paper/40">Folded</span>}
    </div>
  );
}
