import { useCallback, useReducer } from "react";
import { makeDeck, shuffle, type Card } from "../core/cards";
import { CHARTS, type TableSize } from "../data/charts";
import { scoreAction, type Action, type Situation, type Verdict } from "../advisor/advisor";

export type Phase = "AWAITING_ACTION" | "REVEALED";

export interface HandState {
  cards: [Card, Card];
  situation: Situation;
  phase: Phase;
  action: Action | null;
  verdict: Verdict | null;
}

export interface SessionStats {
  hands: number;
  correct: number;
  defensible: number;
  leaks: number;
  evLostBb: number;
  streak: number;
  bestStreak: number;
}

const EMPTY_STATS: SessionStats = {
  hands: 0,
  correct: 0,
  defensible: 0,
  leaks: 0,
  evLostBb: 0,
  streak: 0,
  bestStreak: 0,
};

function openableSeats(tableSize: TableSize): number[] {
  return CHARTS[tableSize].map((s, i) => (s.spec !== null ? i : -1)).filter((i) => i >= 0);
}

function dealHand(tableSize: TableSize): HandState {
  const deck = shuffle(makeDeck());
  const cards: [Card, Card] = [deck[0], deck[1]];
  const seats = openableSeats(tableSize);
  const seatIndex = seats[Math.floor(Math.random() * seats.length)];
  return {
    cards,
    situation: { tableSize, seatIndex },
    phase: "AWAITING_ACTION",
    action: null,
    verdict: null,
  };
}

interface State {
  tableSize: TableSize;
  hand: HandState;
  stats: SessionStats;
}

type Reducer =
  | { type: "ACT"; action: Action }
  | { type: "NEXT" }
  | { type: "SET_TABLE_SIZE"; tableSize: TableSize };

function reducer(state: State, ev: Reducer): State {
  switch (ev.type) {
    case "ACT": {
      if (state.hand.phase !== "AWAITING_ACTION") return state;
      const verdict = scoreAction(state.hand.cards, state.hand.situation, ev.action);
      const stats = { ...state.stats };
      stats.hands += 1;
      stats.evLostBb += verdict.costBb;
      if (verdict.kind === "correct") {
        stats.correct += 1;
        stats.streak += 1;
        stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
      } else if (verdict.kind === "defensible") {
        stats.defensible += 1;
        // streak survives a defensible hand either way
      } else {
        stats.leaks += 1;
        stats.streak = 0;
      }
      return {
        ...state,
        stats,
        hand: { ...state.hand, phase: "REVEALED", action: ev.action, verdict },
      };
    }
    case "NEXT":
      return { ...state, hand: dealHand(state.tableSize) };
    case "SET_TABLE_SIZE":
      return { ...state, tableSize: ev.tableSize, hand: dealHand(ev.tableSize), stats: EMPTY_STATS };
    default:
      return state;
  }
}

function init(tableSize: TableSize): State {
  return { tableSize, hand: dealHand(tableSize), stats: EMPTY_STATS };
}

export function useGame(initialTableSize: TableSize) {
  const [state, dispatch] = useReducer(reducer, initialTableSize, init);

  const act = useCallback((action: Action) => dispatch({ type: "ACT", action }), []);
  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const setTableSize = useCallback((tableSize: TableSize) => dispatch({ type: "SET_TABLE_SIZE", tableSize }), []);

  return { tableSize: state.tableSize, hand: state.hand, stats: state.stats, act, next, setTableSize };
}
