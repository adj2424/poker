import { useEffect, useReducer } from "react";
import { makeDeck, shuffle, type Card } from "../core/cards";
import { CHARTS, type TableSize } from "../data/charts";
import { evaluateSituation, scoreAction, type Action, type Situation, type Verdict } from "../advisor/advisor";

type IdleHandle = number;
const requestIdle: (cb: () => void) => IdleHandle =
  typeof requestIdleCallback === "function" ? requestIdleCallback : (cb) => window.setTimeout(cb, 0);
const cancelIdle: (handle: IdleHandle) => void =
  typeof cancelIdleCallback === "function" ? cancelIdleCallback : (handle) => window.clearTimeout(handle);

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

export interface State {
  tableSize: TableSize;
  hand: HandState;
  stats: SessionStats;
}

type Reducer =
  | { type: "ACT"; action: Action }
  | { type: "NEXT" }
  | { type: "SET_TABLE_SIZE"; tableSize: TableSize };

export function reducer(state: State, ev: Reducer): State {
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
      if (ev.tableSize === state.tableSize) return state;
      return { ...state, tableSize: ev.tableSize, hand: dealHand(ev.tableSize), stats: EMPTY_STATS };
    default:
      return state;
  }
}

export function init(tableSize: TableSize): State {
  return { tableSize, hand: dealHand(tableSize), stats: EMPTY_STATS };
}

export function useGame(initialTableSize: TableSize) {
  const [state, dispatch] = useReducer(reducer, initialTableSize, init);

  // Warm the equity simulation's memoization cache off the click path, so
  // the ACT dispatch below almost always hits a warm cache instead of
  // blocking the UI on a synchronous Monte Carlo run.
  useEffect(() => {
    if (state.hand.phase !== "AWAITING_ACTION") return;
    const handle = requestIdle(() => {
      evaluateSituation(state.hand.cards, state.hand.situation);
    });
    return () => cancelIdle(handle);
  }, [state.hand]);

  const act = (action: Action) => dispatch({ type: "ACT", action });
  const next = () => dispatch({ type: "NEXT" });
  const setTableSize = (tableSize: TableSize) => dispatch({ type: "SET_TABLE_SIZE", tableSize });

  return { tableSize: state.tableSize, hand: state.hand, stats: state.stats, act, next, setTableSize };
}
