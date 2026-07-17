# 2026-07-17 — code cleanup + readme/positioning honesty pass

Sequential log. Two tasks: (1) code/file cleanup without behavior change, (2) README + bio honesty pass per external-LLM advice. A parallel agent owns engine/src, web-served JS, render/collection files — those were left untouched.

## task 1 — code + file cleanup

Investigated the whole tree for dead code, stray files, stale planning docs, orphaned proof artifacts. Finding: the safely-removable surface that I *own* is essentially empty. Details:

- **unused includes (e.g. measurements.hpp)** — these live in `engine/src/*.hpp/*.cpp`, owned by the parallel agent (actively changing armhole/collar geometry + adding tests: ctest count went 23→29 during this session). Not touched, per the ownership split.
- **proof SVGs in `engine/tools/`** (halter-proof.svg, keyhole-proof.svg, ruffle-proof.svg, sweetheart-proof.svg, tiered-ruffle-proof.svg) — NOT orphaned. Each pairs with a live generator (`halter-proof.js` → `halter-proof.svg`, etc.). They're regeneratable committed output tied to active tooling; removing them is not clearly dead and risks conflict with the parallel agent's tools. Left in place.
- **DEVAM-*.md planning docs** — DEVAM-RAY-LOOP.md is a dirty WIP file (do-not-touch). DEVAM-VISION-LOOP.md, DEVAM-LANDING-LOOP.md, DEVAM-ETSY-LOOP.md, DEVAM-DATA-LOOP.md are still **live-referenced** by CLAUDE.md as loop/session pointers and by the night-chain plan. Not stale → not archived/deleted.
- **build artifacts / .DS_Store / *.log** — `engine/build/`, `.DS_Store` are already gitignored (untracked). Nothing to remove from the repo.
- **historical mockups / asset-guides** (mock.html, devlog-tr.md, asset-guide.{html,tr.html,pdf}, mocks/*, assets-src/*) — all referenced in PROJECT.md as completed checklist items; historical narrative value, not scratch. Per house rules ("kaldır denmeden içerik silme"), not deleted on my own initiative.

Net: no files removed, no code changed. Deleting Damla's live-referenced plans or history unbidden would violate the ownership split and the no-delete rule, and would gold-plate a task whose clean surface is thin.

### verification (baseline, unchanged by my work)
- **ctest: 100% passed, 29/29** (parallel agent added tests since CLAUDE.md's 23/23; engine still builds + green).
- golden / web-fuzz: **not re-run by me and not affected** — I made zero engine/web changes; my only diff is README.md, which is not compiled and not served. No behavior touched.

## task 2 — readme + positioning honesty (external-LLM advice)

The README was already strong on the benchmark-first + internal-consistency-labelling front (37/54 led-with, "internal consistency (not a fit proof)" preserved, muslin-first limit visible). What was **missing** and is now added/fixed:

**added — new section "what makes it different (honestly)"** (after the intro, in Damla's first-person lowercase voice):
- **honest FreeSewing framing**: named as the genuine competitor — "free, open-source, genuinely good, drafts to your own measurements in the browser. i'm not pretending it doesn't exist."
- **dropped the "no limits" overclaim explicitly**: "the honest answer is not 'no limits' — the engine's drafting vocabulary is a closed set with a real, known boundary." (The README never literally said "unlimited", but it never named the boundary either; now it does.)
- **defensible positioning stated**: "an engine that *knows its own limit* and can name it per boundary. nobody else in the sector does that, and that's the part that's actually sellable."
- **the three real advantages**, not slogans: (1) authored **per attribute, not per design** — orthogonal enums + isolated opt-in post-passes, so effort-per-coverage grows by multiplication not catalog; (2) the **photo → spec** layer that exists nowhere else; (3) **grading**, which FreeSewing rejects on principle.
- **the sellable sentence adapted** (not pasted verbatim): "today the engine drafts 37 of 54 real garment photos end-to-end and live, and the misses are published... coverage grows by multiplication (per attribute), not by catalog (per design). the photo → spec layer is unique. grading, freesewing won't touch; stitchu has it."

**fixed — the isolation-not-orthogonality caveat** (two places):
- inline in the per-attribute point: "honest caveat: the attributes are **not fully orthogonal** — not every combination like halter × set-in-sleeve is a valid garment. the engine composes features that make sense together and refuses the ones that don't."
- rewrote the **70,200-draft line**: was "across the whole spec space" (implied combinatorial coverage). Now: "it is an **isolation guarantee**, not a claim of a valid combinatorial product... each feature is default-off byte-identical... not that every one of the 70,200 combinations is a garment you'd actually sew."

**bio**: no separate bio file exists; the README has no author blurb. The "knows its own limit / measured per boundary" honesty is carried in the new positioning section. Nothing else to update.

Consistency check: benchmark number is **37** everywhere in the README (positioning section + "measured, not claimed"). No "unlimited"/"no limit" overclaim remains as a positive claim (only the explicit disavowal). Internal-consistency numbers stay labelled "not a fit proof". Muslin-first limit preserved.

## commit
- staged **README.md only** (parallel agent's engine/web work deliberately excluded from this commit).
- author Damla, lowercase english msg, no Co-Authored-By trailer (commit-msg hook enforces this).
