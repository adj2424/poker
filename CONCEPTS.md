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
