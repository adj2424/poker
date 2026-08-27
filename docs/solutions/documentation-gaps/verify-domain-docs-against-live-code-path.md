---
title: Verify AI-generated domain docs against the live code path
date: 2026-08-27
category: documentation-gaps
module: docs
problem_type: documentation_gap
component: documentation
severity: medium
applies_when:
  - "Reverse-engineering architecture or domain docs from source with no prior design doc to check the reconstruction against"
  - "Two or more functions in the codebase compute similarly-shaped values, and only one is actually wired into the UI or entry point"
symptoms:
  - "Plan's docs/DOMAIN.md section (U2 item 6) described verdict grading as a two-way correct/defensible split sourced from evaluateSituation's unused kind field, omitting the leak outcome that scoreAction actually returns to the UI"
root_cause: unverified_source_claim
resolution_type: documentation_update
tags: [documentation, doc-review, source-verification, ai-generated-docs, grounding]
---

# Verify AI-generated domain docs against the live code path

## Context
This repo's `docs/DOMAIN.md` and `AGENTS.md` were written by reconstructing domain logic straight from
source — there was no separate design doc to check the reconstruction against, and the plan driving the
work said as much in its own authority hierarchy ("the existing source code is authoritative on domain
facts — the docs describe the code, never the other way around").

While planning the `docs/DOMAIN.md` section on verdict grading, the plan described the scoring logic as a
two-way split: `fPlay >= 0.85` or `<= 0.15` is the "correct" zone, the band between is "defensible." That
description matches the `kind` value computed by `evaluateSituation()`
(`src/advisor/advisor.ts:74-76`) — a field that function computes but never returns anywhere the UI
reads. The verdict actually shown to the player comes from `scoreAction()`
(`src/advisor/advisor.ts:91-108`), the only one of the two functions `useGame.ts` calls
(`src/engine/useGame.ts:69`). `scoreAction` resolves the hero's actual action against the chart and
produces a third outcome, `"leak"`, whenever that action doesn't match the chart's recommendation outside
the mixed band — and `"leak"` is load-bearing elsewhere in the app: it drives `SessionStats.leaks`, the
"Leak" chip in `RevealPanel`, and the streak reset in `useGame`'s reducer.

A coherence-reviewer subagent, dispatched as part of `ce-doc-review`'s parallel review of the plan, caught
the contradiction before any doc was written (confidence 100), by tracing the plan's claim back to both
candidate functions and noting only one is reachable from the code path the player actually exercises.

## Guidance
When writing documentation that reconstructs domain logic from source, don't stop at the first function
whose name and shape match the claim being documented:

1. Find every function that computes the value being documented.
2. For each candidate, check its call sites — is it actually invoked from the code path the user
   experiences (the UI, the API handler, the entry point), or only from other computation functions that
   are themselves unused downstream?
3. Prefer the version wired to production behavior. A plausibly-named field on an internal helper is not
   evidence it's the one users see — dead code can compute something entirely reasonable-looking.
4. Run an adversarial or coherence documentation review pass before publishing. It's cheap in a workflow
   like `ce-doc-review`'s parallel reviewer dispatch, and it is what caught this exact error before the
   doc was written.

## Why This Matters
`docs/DOMAIN.md`'s stated purpose is that a reader "never has to reverse-engineer [the domain logic] from
source again." A doc built by an agent reconstructing behavior from a partial read is exactly the kind of
artifact that can quietly encode a plausible-but-wrong story, then get trusted as ground truth by every
future reader or agent that cites it instead of re-deriving it from source. The claim at risk here was the
app's central scoring mechanism — the thing session stats, the leak indicator, and streak resets all hang
off of — so an unnoticed error would have propagated into every future onboarding read and every future
agent's context load, not just one section of one doc.

## When to Apply
- Writing or regenerating architecture/domain docs by reading source, especially when no prior design doc
  exists to check the reconstruction against.
- Multiple functions in the same file compute similarly-shaped values (e.g. two `kind`-like fields), and
  only one is reachable from the UI.
- Before treating an LLM-authored plan's or doc's characterization of business logic as fact — confirm it
  names the specific function invoked from the entry point, not just a function that could plausibly
  produce the described value.

## Examples
Before (plan text — matches the discarded helper, `evaluateSituation`):
> `fPlay >= 0.85` or `<= 0.15` is "correct" zone, the band between is "defensible."

After (matches `scoreAction`, `src/advisor/advisor.ts:91-108` — the function `useGame.ts:69` actually
calls, published in `docs/DOMAIN.md`):
> `fPlay` strictly between 0.15 and 0.85 is always "defensible" — the chart itself is mixed on the hand.
> Outside that band, the chart has a clear recommendation; the verdict is "correct" when the hero's action
> matches it, "leak" when it doesn't. `leak` drives `SessionStats.leaks`, the "Leak" chip in
> `RevealPanel`, and the streak reset in `useGame`'s reducer.

## Related
- `docs/DOMAIN.md` — the corrected doc this learning produced
- `docs/plans/2026-08-27-1345-docs-agent-harness-developer-docs-plan.md` — the plan where the finding was
  caught (coherence review, U2 item 6) and fixed
