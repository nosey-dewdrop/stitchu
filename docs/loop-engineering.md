# Loop engineering: branch-on-measurement agent chains

How stitchu ships: a tree-structured, self-branching chain of single-purpose
agents, where every branch decision is made by a measured number, not by
judgement in the moment. Written for developers; candidate for the public
dev blog once the blog exists.

## The pattern in one line

> A loop hits a problem → it forks a branch → the branch must deliver back
> a number.

No mid-session pivots. When a loop discovers a problem outside its scope,
the problem becomes a new branch with its own fresh-context agent, its own
single deliverable, and its own measurement. The trunk only reads numbers.

## Anatomy of a chain

1. **Diagnosis root (fixes nothing).** The first agent only labels and
   counts: which layer produced each failure (vision / bridge / engine),
   which field dominates, how many contradictions exist, is the paid API
   budget available. Output is a typed JSON contract, not prose.
2. **Conditional branches.** Each subsequent loop is gated by root data:
   - dominant error field decides WHERE the repair branch aims
   - contradiction count == 0 → the front/back branch never opens
   - no API budget → the branch runs in smoke mode and marks its numbers
     "pending", instead of inventing them
3. **Regression guard inside every branch.** Each repair branch re-measures
   after its change. If the headline metric drops, the branch reverts its
   own commit and reports `reverted: true`. Reverting is a deliverable,
   not a failure.
4. **Verdict leaf.** A final agent puts every branch's before/after numbers
   in one table and applies a written decision rubric ("if vision accuracy
   >= 85% but full-pattern gain < +3, invest in the bridge next"). The
   human returns to a recommendation backed by a table, not a story.

## Contracts over vibes

Every agent returns the same JSON schema (metric before/after, blocked
reason, reverted flag, commit hash). Two effects: branches are comparable,
and the chain is scriptable — the orchestration is deterministic code with
`if`s, the intelligence lives inside the branches.

## Side effects are mandatory, not optional

Each branch must also leave: a patch-notes entry (public changelog), a row
plus ASCII bar in a shared scoreboard file (source: the raw results
snapshot, never hand-typed), and a build-in-public content drop. If a
branch moved nothing, the honest "why it moved nothing" is the content.

## Why this is a moat

Anyone can call the same model; both we and our competitors do. What can't
be bought is the harness: measure before repairing, branch on numbers,
demand honesty from every branch, auto-revert regressions. The same model
praised our competitor's marketing and fabricated a failure story about our
live repo, on the same day. What settled the truth was this harness. In the
AI era the engineering didn't disappear; it moved into the structure that
directs the AI.

## Origin

Born 2026-07-16, after four capability loops moved the 58-photo benchmark
less than expected. The diagnosis root found the real brake in a different
layer than we'd been polishing (vision word instability, not engine
geometry). The first full chain: patch 2.0 taxonomy → 2.1 storefront →
2.2 targeted repair → 2.3 conditional consistency repair → verdict.

Its scoreboard used to live at `reports/stitchu-vision-progress.md`. Checked again on
25 Aug 2026: that file does not exist — neither `reports/` in this repo nor the reports
directory outside it holds it. The link is kept here rather than deleted, so
the reader knows the scoreboard existed and where it was: the numbers behind the 2.x chain
cannot be re-read today. The vision accuracy figure that chain produced is still auditable
from a different artefact — `vision/eval/live-2026-08-22.json`, printed by
`engine/tools/foto-spec-olcum.mjs`.
