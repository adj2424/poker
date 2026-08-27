import { isRed, suitGlyph, type Card as CardModel } from "../core/cards";

const SIZES = {
  sm: { w: "w-7", h: "h-10", rank: "text-[10px]", glyph: "text-[10px]" },
  md: { w: "w-11", h: "h-15", rank: "text-sm", glyph: "text-sm" },
  lg: { w: "w-16", h: "h-22", rank: "text-xl", glyph: "text-lg" },
} as const;

export function PlayingCard({
  card,
  faceDown = false,
  size = "md",
}: {
  card?: CardModel;
  faceDown?: boolean;
  size?: keyof typeof SIZES;
}) {
  const s = SIZES[size];

  if (faceDown || !card) {
    return (
      <div
        className={`${s.w} ${s.h} rounded-md border border-rail-edge/70 bg-gradient-to-br from-felt-light to-felt-dark shadow-[inset_0_0_0_2px_rgba(244,241,230,0.06)]`}
        aria-hidden="true"
      />
    );
  }

  const red = isRed(card.suit);

  return (
    <div
      className={`${s.w} ${s.h} rounded-md bg-paper border border-black/10 shadow-md flex flex-col items-center justify-center leading-none select-none`}
      role="img"
      aria-label={`${card.rank === "T" ? "10" : card.rank} of ${
        { s: "spades", h: "hearts", d: "diamonds", c: "clubs" }[card.suit]
      }`}
    >
      <span className={`${s.rank} font-mono font-semibold ${red ? "text-card-red" : "text-card-black"}`}>
        {card.rank === "T" ? "10" : card.rank}
      </span>
      <span className={`${s.glyph} ${red ? "text-card-red" : "text-card-black"}`}>{suitGlyph(card.suit)}</span>
    </div>
  );
}
