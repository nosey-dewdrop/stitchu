# stitchu — Couture-Vocabulary & Own-Vision Plan
> Written 2026-07-13 for the NEXT session (Damla will run this with Fable). Ambition set by Damla: tokens/effort are unlimited — go infinite, iterate to "v10" and beyond, until stitchu is the BEST custom-pattern tool in the sector (the "Yousician of pattern-making"). Do whatever it takes.

## North Star (non-negotiable)
Photo + YOUR measurements = a custom, sewable pattern for ANY garment — especially the curved/couture details a person CANNOT self-draft (necklines, cut-outs, halters, tiered ruffles, sleeves, facings). Own the whole stack (own vision + own engine) so the sold API has ZERO per-call LLM cost. A skirt/simple-shift drafter is a toy; the value is democratising the expert part (pattern-making) + the construction guide you can't self-know.

## IRONCLAD DISCIPLINE (learned the hard way this session — do not break it)
Damla's core grievance: things were called "done/oldu/ship-ready" that were only "logically done, not in practice." Every step here must be PROVEN, not claimed:
1. **Real in the engine.** A feature exists only when it's in the C++ engine (`engine/src`), compiled, and drafting a real `PatternPiece`. No side JS "proof" that isn't wired in.
2. **A passing test.** Add `tests/<feature>_check.cpp` (model it on `tests/ruffle_check.cpp`): asserts the feature adds the right piece(s), the base draft is byte-identical, the validator returns zero issues, each piece is printable (≤3000 mm), and the geometry math is right. Add it to `CMakeLists.txt` + `add_test`.
3. **Opt-in, matrix intact.** Every new field defaults OFF so `engine_check` (50400-draft matrix) stays **ALL PASS** and the base draft is unchanged without the feature. Never regress the matrix or the golden diff.
4. **Validator-aware.** New trim pieces (ruffle-like) must be excluded from structural checks (e.g. the skirt-waist sum already skips any piece whose name contains "Ruffle") or must pass the validator. The test MUST confirm `PatternValidator::issues(...)` is empty.
5. **Segment for print.** Any piece can exceed the 3000 mm tile cap — segment it into fabric-width pieces (like the ruffle: "cut N strips, join end to end") so every piece prints on A4.
6. **Show the piece.** Render the new piece(s) with a small C++ dumper → SVG → `qlmanage -t` → PNG → LOOK at it, then show Damla the render + the passing test output. Never "done" without the picture + the test.
7. **Then commit + push** (lowercase english message, no dashes/emojis, author Damla only, NEVER a Claude co-author trailer). Only after push, report — precisely (what's done vs not), never a blanket "bitti".

## The per-feature loop (repeat for every vocabulary item)
1. Add an opt-in `GarmentSpec` field (default off) in `engine/src/measurements.hpp`.
2. Implement the drafting geometry in `engine/src` (new `.cpp/.hpp` if a new piece; add to `CMakeLists.txt` `add_library(engine ...)`).
3. Make the validator aware (`engine/src/validator.cpp`).
4. Write `tests/<feature>_check.cpp` (+ CMake `add_executable`/`add_test`).
5. Build native (`cmake -S engine -B engine/build && cmake --build engine/build -j`) → run `<feature>_check`, `engine_check` (ALL PASS), `test_geometry`.
6. Render the piece(s) → LOOK → show Damla.
7. Wire it through the WASM binding (`engine/wasm/bindings.cpp` `draftJSON` — add the param), rebuild WASM (`engine/build-wasm.sh`, needs emcc), and add the UI control in `web/` + the vision label (below). Bump the `?v=N` cache stamp on every html/js on deploy.
8. Commit + push. Redeploy web: `git subtree split --prefix web -b t && git push -f origin t:gh-pages && git branch -D t`.

## CURRENT STATE (proven this session, committed 5c05787)
- Engine base drafter: bodice princess/dart, waistline natural/empire/babydoll, fabric woven/knit, 5 skirts incl. pleated, set-in + balloon sleeves, neck facings. **50400 matrix ALL PASS**, golden diff intact.
- **NEW: opt-in HEM RUFFLE (fırfır)** — `engine/src/ruffle.{hpp,cpp}`, `GarmentSpec.ruffleHem/ruffleFullness/ruffleDepthMM`, wired in `GarmentDrafter::draft`, hem length via `SkirtBlock::hemCircumferenceMM`, segmented for print, validator excludes "Ruffle" from the waist sum, covered by `tests/ruffle_check`. Proven end-to-end: read a real ruffled dress photo → engine drafted an 11-piece pattern including the ruffle (rendered + looked at). NOT yet wired to the WASM binding / web UI / vision label — that is step 7 of the loop for this feature too.
- Vision is currently RENTED: Opus via the Cloudflare worker `POST /api/analyze` (`backend/worker.js`), fixed vocabulary at lines ~195–208 (garment/neckline/sleeveStyle/sleeveLength/skirtStyle/length/topLength/shaping/waistline/fabric/fabricName/details).

## TRACK A — Curved vocabulary (go to "v10"/infinite)
Order = tractability × Etsy/Trendyol value. Each item is one full per-feature-loop above. Keep the engine attribute and the vision label in lockstep.
1. **Tiered ruffle (kademeli fırfır)** — extend `RuffleBlock` with `draftTiers(edge, fullness, depth, tiers, notches)`: N cascading strips, tier i edge = `edge × fullness^(i-1)`, one "Ruffle tier N" piece each; `GarmentSpec.ruffleTiers` (default 1 = current single ruffle). Highest value; directly fixes the layered-dress gap seen this session.
2. **Sweetheart neckline** — new `Neckline` enum value + front neck curve in `bodice.cpp` + matching facing. Bounded, high value.
3. **Keyhole / chest cut-out** — an enclosed opening in the front bodice + a shaped facing around the hole. New neckline/opening field + a facing piece. (This was the exact gap Damla pointed at: the neckline enum can't represent it.)
4. **Halter** — front rises to a neck strap/tie, open shoulders, often open/low back — restructures the bodice block (no normal shoulder seam). Bigger; do after 1–3.
5. **Off-shoulder / one-shoulder / cowl (draped) neckline**, **flutter / cap / bell sleeves**, **peplum**, **wrap / surplice front**, **asymmetric hem**, **cut-outs (waist/side)**. Each its own feature + test.
6. **Corset block** (its own sub-project per old notes): negative ease + panels + boning.
7. Keep going — the vocabulary is open. Add whatever a real Etsy/Trendyol garment needs, one PROVEN feature at a time, toward "reads and drafts every model".

## TRACK B — Own the vision (kill the Opus dependency; the moat for a sold API)
The vision step is BOUNDED classification into a small fixed vocabulary (much more tractable than the drafting geometry). Owning it removes per-call LLM cost + external dependency.
- **v0: CLIP zero-shot — NO training data.** A local CLIP model classifies the photo against our label vocabulary (one prompt set per attribute: "a dress with an empire waist" vs "a natural waist"; "a keyhole neckline" vs the others...). On-device, free, no dataset. Wire as an alternative to the Opus worker; hand-check accuracy vs Opus on ~30 real photos.
- **v1: distilled classifier.** Use Opus (the current worker) to auto-label a large garment-image corpus with the exact vocabulary → train a small model (frozen CLIP/DINO encoder + per-attribute heads, or fine-tune MobileNetV3) on those labels → replace Opus. Runs on-device/cheap. This is the "extractive outputs become training data" pattern.
- Grow the vision labels in lockstep with every Track A attribute.

## PRODUCT / API / DATA
- The engine IS the sellable API core (photo → attributes → pattern → A4 print + construction guide). Track B makes the API margin real (no LLM bill per call).
- Etsy blocks automated fetch (403) — do NOT scrape Etsy in the product. For validation, feed real garment photos manually (screenshot/URL) or via the live app's browser→worker (not blocked). The worker `POST /api/analyze` is public (PUBLIC_ANALYZE=on, 3/min 15/day per IP) — usable for one-off tests with a base64 image.
- Security TODO from CLAUDE.md still open: rotate the Anthropic key (it passed through chat once).

## Definition of "the best in the sector"
Every popular Etsy/Trendyol dress/blouse silhouette can be photographed and drafted to the user's measurements with an accurate pattern + a real construction guide, using stitchu's OWN vision + OWN engine — no per-call LLM cost. Physical sew test (roadmap 24) validates a fitted, curved garment on camera = the build-in-public proof.
