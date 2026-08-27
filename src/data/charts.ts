export type TableSize = 2 | 6 | 9;

export interface SeatChart {
  /** Position label shown in the UI. */
  label: string;
  /** Opponents who have not yet acted behind this seat (folded-to-hero pot). */
  opponentsRemaining: number;
  /** Range notation for this seat's RFI (raise-first-in) open, or null if this seat never opens (the big blind). */
  spec: string | null;
}

/**
 * v1 scope: unopened-pot open-raise ("RFI") ranges only. One table per
 * seat, keyed by table size. Approximate, hand-authored charts — not
 * solver output — chosen to be internally consistent (range width widens
 * toward the button) rather than maximally precise. See the system design
 * doc, §03/§11, for why RFI-only and why the small blind is the one
 * documented exception to strict monotonic widening.
 */
export const CHARTS: Record<TableSize, SeatChart[]> = {
  2: [
    {
      label: "BTN",
      opponentsRemaining: 1,
      spec:
        "22+, A2s+, K2s+, Q2s+, J4s+, T6s+, 96s+, 86s+, 75s+, 65s, 54s, " +
        "A2o+, K5o+, Q7o+, J8o+, T8o+, 98o",
    },
    { label: "BB", opponentsRemaining: 0, spec: null },
  ],
  6: [
    {
      label: "UTG",
      opponentsRemaining: 5,
      spec:
        "22:0.5, 33:0.5, 44+, A2s+, K9s+, Q9s+, J9s+, T8s+, 98s, 87s, 76s, 65s:0.5, " +
        "ATo:0.5, AJo+, KQo",
    },
    {
      label: "HJ",
      opponentsRemaining: 4,
      spec:
        "22+, A2s+, K8s+, Q8s+, J8s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s:0.5, " +
        "A9o:0.5, ATo+, KJo+, QJo",
    },
    {
      label: "CO",
      opponentsRemaining: 3,
      spec:
        "22+, A2s+, K5s+, Q7s+, J7s+, T7s+, 96s+, 85s+, 75s+, 64s+, 54s, " +
        "A8o+, A7o:0.5, KTo+, K9o:0.5, QTo+, JTo",
    },
    {
      label: "BTN",
      opponentsRemaining: 2,
      spec:
        "22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 95s+, 84s+, 74s+, 63s+, 53s+, 43s, " +
        "A2o+, K7o+, K6o:0.5, Q9o+, Q8o:0.5, J9o+, T9o, 98o, 87o:0.5",
    },
    {
      label: "SB",
      opponentsRemaining: 1,
      spec:
        "22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 75s+, 64s+, 54s, " +
        "A2o+, K9o+, K8o:0.5, Q9o+, J9o+, T9o",
    },
    { label: "BB", opponentsRemaining: 0, spec: null },
  ],
  9: [
    { label: "UTG", opponentsRemaining: 8, spec: "66+, ATs+, KJs+, QJs, AQo+, KQo" },
    { label: "UTG1", opponentsRemaining: 7, spec: "55+, A9s+, KTs+, QTs+, JTs, AJo+, KQo" },
    { label: "UTG2", opponentsRemaining: 6, spec: "44+, A8s+, K9s+, Q9s+, J9s+, T9s, 98s, AJo+, KQo" },
    {
      label: "LJ",
      opponentsRemaining: 5,
      spec:
        "22:0.5, 33:0.5, 44+, A2s+, K9s+, Q9s+, J9s+, T8s+, 98s, 87s, 76s, 65s:0.5, " +
        "ATo:0.5, AJo+, KQo",
    },
    {
      label: "HJ",
      opponentsRemaining: 4,
      spec:
        "22+, A2s+, K8s+, Q8s+, J8s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s:0.5, " +
        "A9o:0.5, ATo+, KJo+, QJo",
    },
    {
      label: "CO",
      opponentsRemaining: 3,
      spec:
        "22+, A2s+, K5s+, Q7s+, J7s+, T7s+, 96s+, 85s+, 75s+, 64s+, 54s, " +
        "A8o+, A7o:0.5, KTo+, K9o:0.5, QTo+, JTo",
    },
    {
      label: "BTN",
      opponentsRemaining: 2,
      spec:
        "22+, A2s+, K2s+, Q4s+, J6s+, T6s+, 95s+, 84s+, 74s+, 63s+, 53s+, 43s, " +
        "A2o+, K7o+, K6o:0.5, Q9o+, Q8o:0.5, J9o+, T9o, 98o, 87o:0.5",
    },
    {
      label: "SB",
      opponentsRemaining: 1,
      spec:
        "22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 96s+, 85s+, 75s+, 64s+, 54s, " +
        "A2o+, K9o+, K8o:0.5, Q9o+, J9o+, T9o",
    },
    { label: "BB", opponentsRemaining: 0, spec: null },
  ],
};
