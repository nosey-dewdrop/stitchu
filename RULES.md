# RULES — invariants + build discipline

HARD CAP: this file never exceeds 50 lines. To add a rule, cut or merge one.
Agent/loop context = ENV.md + RULES.md ONLY. STRATEGY.md and full PROJECT.md are never loaded into an agent.

## Invariants
1. Unknown or unsupported enum/spec value → Result::Err (or explicit honest refusal via missing.js).
   NEVER silently drop or coerce. A documented guarantee that is not enforced in code does not exist.
2. Every spec field must ROUND-TRIP: photo/JSON → bridge → engine → drawn output, or be explicitly
   refused. Each field gets a test asserting the round-trip (sleeveStyle 'puff' silently dropped, 2026-07-18).
3. Visual verification is an OUTPUT, not a claim. The render step must produce a PNG file and the
   report must contain its file path. No file path = step NOT done. The sentences "baktım",
   "read by eye", "looked correct" are banned in reports and status lines.
4. New features are opt-in and default OFF; golden diff stays byte-identical; draft matrix stays green.
5. Validator-clean + printable (A4 segmented) before a feature counts as existing.
6. Numbers live in TEST OUTPUT, not in docs. Docs never assert "ALL PASS / 0.00mm / byte-identical /
   zero issues" as standing fact — name the tool/test that prints the number instead.
7. "Bugs: none known" is banned. PROJECT.md keeps an OPEN SUSPICIONS list; if it is empty, nobody looked.
8. Report only AFTER push, precisely (done vs not done). Blanket "done/bitti/ready" is banned.
9. ctest must be fully green before any push; a change that breaks a test is reverted, not pushed.
10. Scope is decided by what is BEST, not by decree (Damla, 2026-07-27): she is human, errs and
    under-thinks — complete and improve her ideas. Her explicit vetoes stand; contradictions are
    surfaced honestly, then the best path is taken, not the most obedient one.

## Per-feature discipline (all 7 steps, in order)
(1) real in the C++ engine, drafting a real PatternPiece;
(2) covered by a passing test: pieces + validator-clean + printable + geometry;
(3) opt-in, default OFF, golden byte-identical;
(4) validator-aware;
(5) segmented for A4 print;
(6) rendered to a PNG artifact whose file path appears in the report (invariant 3);
(7) committed + pushed — only then reported, precisely.

## Current platform/scope decisions (latest wins; history in STRATEGY.md)
- Platforms: ALL THREE (web live first; iOS then Android on the same C++ core) — Damla, 2026-07-10.
- Scope: 2D engine first, 3D-derived correctness deferred, cloth/physics later — Damla, 2026-07-15.
- Shift is BREADTH → DEPTH: prove existing patterns fit and sew up before adding vocabulary.
- Princess-seam-as-default is DECIDED but NOT CODED — treat as pending work, not current behavior.
