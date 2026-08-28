/**
 * Plain-language definitions for poker jargon shown in the UI. Single
 * source of truth for tooltip, onboarding, and learn-panel copy (see plan
 * KD1) -- wording must never drift between those three surfaces.
 */
export type TermId =
  | "preflop"
  | "unopenedPot"
  | "rfi"
  | "position"
  | "bb"
  | "equity"
  | "ev"
  | "leak"
  | "defensible"
  | "suited"
  | "offsuit"
  | "handNotation"
  | "seatUTG"
  | "seatHJ"
  | "seatCO"
  | "seatBTN"
  | "seatSB"
  | "seatBB";

export interface GlossaryEntry {
  term: string;
  plain: string;
}

export const GLOSSARY: Record<TermId, GlossaryEntry> = {
  preflop: {
    term: "Preflop",
    plain: "The very first round of betting, before any shared cards are dealt.",
  },
  unopenedPot: {
    term: "Unopened pot",
    plain: "Nobody has bet yet this hand -- everyone before you just folded or hasn't acted.",
  },
  rfi: {
    term: "RFI (raise first in)",
    plain: "Opening the betting yourself, first, before anyone else has bet.",
  },
  position: {
    term: "Position",
    plain: "Where you sit relative to the dealer button. Acting later (closer to the button) means fewer players left who could still fight back, so you can play more hands profitably.",
  },
  bb: {
    term: "bb",
    plain: "\"Big blinds\" -- the chip unit hands are measured in, so results scale the same at any stakes.",
  },
  equity: {
    term: "Equity",
    plain: "Your rough share of the pot if the hand were played out to the river right now, estimated by dealing it out thousands of times in your browser.",
  },
  ev: {
    term: "EV (expected value)",
    plain: "The average result of a decision if you made it many times -- positive EV wins chips on average, negative EV loses them.",
  },
  leak: {
    term: "Leak",
    plain: "A decision the chart clearly disagrees with -- a costly habit worth fixing.",
  },
  defensible: {
    term: "Defensible",
    plain: "The chart itself is split on this hand, so either fold or play is a reasonable choice here.",
  },
  suited: {
    term: "Suited",
    plain: "Both hole cards share a suit (e.g. two hearts) -- written with a trailing \"s\", like A5s.",
  },
  offsuit: {
    term: "Offsuit",
    plain: "The two hole cards are different suits -- written with a trailing \"o\", like A5o.",
  },
  handNotation: {
    term: "Hand notation",
    plain: "Two ranks plus s (suited) or o (offsuit), e.g. A5s means an ace and a five of the same suit.",
  },
  seatUTG: {
    term: "UTG (under the gun)",
    plain: "The first seat to act -- every other player is still behind you, so this is the tightest seat.",
  },
  seatHJ: {
    term: "HJ (hijack)",
    plain: "Two seats before the button -- fewer players left to act than UTG, so a wider range plays.",
  },
  seatCO: {
    term: "CO (cutoff)",
    plain: "One seat before the button -- only the button and the blinds are left to act.",
  },
  seatBTN: {
    term: "BTN (button)",
    plain: "The dealer seat -- last to act after the flop every round, so the widest range plays here.",
  },
  seatSB: {
    term: "SB (small blind)",
    plain: "Posts a partial forced bet before cards are dealt, and acts first after the flop -- a real disadvantage.",
  },
  seatBB: {
    term: "BB (big blind)",
    plain: "Posts a full forced bet before cards are dealt -- last to act before the flop, but out of position after it.",
  },
};
