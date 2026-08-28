# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with
project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and
ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Verdict grading

### Verdict
The graded outcome of a single fold/play decision: whether the hero's chosen action was judged
"correct," "defensible," or "leak" against the chart's recommendation and the estimated equity for the
hand.

### Correct / Defensible / Leak
The three outcomes a Verdict can take. When the chart's recommendation for the exact hand is mixed
(the chart itself doesn't clearly favor one action), the verdict is always "defensible," regardless of
which action the hero took. When the chart does have a clear recommendation, the verdict is "correct"
if the hero's action matches it and "leak" if it doesn't. A "leak" is more than a label: it resets the
player's session streak and increments the session's leak count — a "defensible" hand does neither.

## Table

### Hero
The player whose decision is being trained -- the one Seat at the table under the user's control. Every
hand deals the Hero two cards and a Seat; the Hero's Fold/Play choice is what gets graded (see Verdict)
against the RFI chart. Distinct from every other Seat at the table, which is always shown folded or
waiting and never takes an action.

### Seat
A position at the table (e.g. BTN, SB, BB, UTG) that a player occupies for a hand. Exactly one Seat is
the Hero; the rest are non-interactive opponents rendered face-down. A table's full set of Seats is
fixed by its size (heads-up, 6-max, or 9-max) and each Seat's position is a percentage placement around
the table's oval, not a pixel coordinate -- so a Seat's rendered content can extend past the table's own
edges depending on how close to that edge its percentage position sits.

## Beginner onboarding

### Term
An inline jargon helper: a dotted-underline button next to a piece of poker vocabulary (e.g. `RFI`,
`equity`, a Seat label) that toggles a plain-language definition popover in place. Every definition is
sourced from the Glossary so wording never drifts between the tooltip, the Onboarding overlay, and the
Learn panel.

### Glossary
The single source of truth (`src/content/glossary.ts`) for every jargon term's plain-language
definition. Referenced by Term, Onboarding, and the Learn panel -- never duplicated in component copy.

### Onboarding
The skippable four-step overlay shown on a player's first visit, explaining what they hold, the
fold/play choice, why Position matters, and how a hand is graded. Dismissal persists in `localStorage`
so it does not reappear on reload; it is reopenable at any time from the header's Learn button.

### Learn panel
A reopenable drawer, reached from the header, that collects the Onboarding steps, the full Glossary, and
a visual range grid for the current seat -- the one persistent surface for looking anything up outside
the moment-to-moment hand flow.

### Explanation
The plain-English reason shown first in the reveal, produced by `explainVerdict` (`src/advisor/
explain.ts`). Always names both the hand's shape (e.g. "a suited ace") and the seats-behind reason (how
many players remain to act) -- the pairing that explains *why* a seat's range is as wide or narrow as it
is, which the raw Verdict numbers alone don't state.
