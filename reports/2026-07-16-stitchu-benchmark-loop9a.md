# stitchu — BENCHMARK-58 Loop 9a: drawstring / shirred / smocked gathering (büzgü)

> Reconciliation note: two agents were dispatched to this same loop in parallel
> (queue #9a, "Loop 8" in one brief). Both built the identical GatherBlock design;
> the committed code is one agent's (commit 2385ac9). This report is written from a
> FRESH live 59-photo run (7m12s) — its per-photo FULL list is the authoritative
> live measurement and differs cosmetically from the other agent's 0-call cache
> reclassify (same 19/54 total). Only ONE gather block exists; no duplicate code.

2026-07-16. First drawing loop that **moved the FULL number**: 14/54 → **19/54 (+5)**,
element accuracy 37/103 (35.9%) → **48/103 (46.6%)**. The marginal-gain reform
(2026-07-16) predicted gathering +6; live delivered +5 (one gathering photo lost
to a vision parse error). This closes the "does the motor path actually work"
question: yes — the engine learns a construction, and when that construction is a
photo's last blocker, the photo goes FULL.

## What shipped — the gathering block (GatherBlock, opt-in post-pass)

The engine now drafts three gathering sub-types as a **separate gathered panel
piece** whose gathered edge is trued to the drafted zone edge. Off by default
(`GatherType::None`) → every golden dump byte-identical (23034 lines, 0.000000 mm).

- **DRAWSTRING** (kanal + ip, ratio 1.8): a flat panel + a folded casing channel
  (two stitch lines, casingDepth 22 mm) + two centre eyelet marks + a SEPARATE
  self-fabric **Drawstring Cord** piece (a tie-style folded tube). Couture drawstring
  waist / babydoll neckline.
- **SHIRRED** (paralel elastik sıralar, ratio 2.0 = ASG "2in→1in"): a flat panel +
  4 parallel shirring guide rows (shirRowGap 12 mm).
- **SMOCKED** (dekoratif shirring, ratio 3.0 = ASG "3in→1in"): the shirred base +
  6 rows + a smocking dot **grid** between the top rows to gauge the pleats.

Zone (neckline / bust / waist / sleeve) drives which drafted edge is measured:
neckline = the same neck-point scan the collar uses (2·front-half + 2·back-half);
bust/waist = the front+back side-seam x in that y-band ×2 (works across princess
Center+Side and dart splits); sleeve = the bicep band. `finishedEdge × ratio` is
the panel's flat gathered edge → **trued to 0.00 mm** (gather_check).

**Segmentation:** a very wide flat edge (extreme bodies at ratio 3) is cut in
N = ceil(flatEdge / 1400 mm) segments (one fabric width) joined at the sides — the
drawn tile is one segment so it packs on A4; the cut note gives N + the full flat
edge. On the benchmark bodies N = 1. (This fixed a web-fuzz 130-sheet backstop.)

## Difference from the earlier loops (why this is a NEW construction)

- A **ruffle** (Loop 0) is a separate frill strip stitched to a hem.
- A **tie** (Loop 4b) is a plain applied strip; Loop 4b deliberately left
  drawstring-that-GATHERS honest. This loop pays that debt.
- Here the **PANEL ITSELF gathers** — the neckline/bust/yoke is cut wide and drawn
  up to fit. That is the babydoll / milkmaid / smocked-yoke construction.

## Honest boundary (kept)

- A drawstring **SLEEVE** (a casing round the arm) is a different piece and stays
  honest (missing.js) even when a neckline/bust panel is drawn — DRAWN_SINCE and the
  outOfVocab suppressor both exclude `sleeve`.
- A fully hand-smocked couture panel (shaped honeycomb) is approximated (panel × 3
  + gauge dots) with the smocking **noted, not silently claimed**.

## Proof

- **golden byte-identical**: 23034 lines, max delta 0.000000 mm (gather off).
- **ctest 16/16** incl. new `gather_check`: extra piece(s), existing outlines
  byte-identical, base + gather drafts validator-clean, flat edge == finished ×
  ratio (0.00 mm), ratio ordering smocked > shirred > drawstring, drawstring adds a
  cord (shirred does not), placement notch on a body piece.
- **precision** worst pair 0.00 mm, 0 fail.
- **web-fuzz** 19740 drafts, **0 failures** (120 new gather drafts across type ×
  zone × dress/top × princess/dart, packed clip-clean, max 91 sheets).
- **vocab-sweep** 37800/0 (base coverage unaffected).
- **render-pages**: drawstring-neck-dress (9 pieces incl. Drawstring Yoke Panel +
  Drawstring Cord, casing + eyelets), shirred-bust-top, smocked-yoke-dress — panels
  + labels + control marks render, strip clean, issues [].
- **missing.js honesty**: drawstring neckline drawn → not listed; shirred yoke drawn
  → not listed; drawstring SLEEVE → stays listed (honest); gather-not-chosen → stays
  listed.

## Live benchmark (fresh, 59 vision calls, 7m12s, FAST token)

- **FULL PATTERN 19/54** (+5 over 14). MISSING 27, WRONG 7, correct-reject 4/5 (1
  REJECT-FAIL = a pattern-drawing image read as a dress, vision noise; 1 ERROR =
  Alli pinafore vision parse_fail, would stay MISSING regardless — drawstring sleeve).
- **ELEMENT ACCURACY 48/103 = 46.6%** (+10.7 pp; 6 distinct gathering oov terms
  drawn across their repeats, sleeve gathering excluded).
- **New to FULL (gathering-driven):** Mira Dress ×2 (gathered bust panel), Lua
  Babydoll (milkmaid drawstring), Blair Babydoll ×2 (shirred/smocked yoke). Plus
  Heloise (boat fit&flare) swung back to FULL on vision variance, and Boat Neck
  flat-sketch swung to WRONG (shaping princess vs dart) — pure vision noise, ±0 net
  from that pair.
- The 5 gathering photos are the marginal-gain prediction (+6) minus one
  gathering photo lost to the vision parse ERROR (Alli, which also has an undrawn
  sleeve casing so it would stay MISSING anyway).

## Files

- `engine/src/gather.hpp` / `gather.cpp` — GatherBlock (new).
- `engine/tests/gather_check.cpp` — new ctest.
- `engine/src/measurements.hpp` (spec fields), `garment.cpp` (opt-in call),
  `CMakeLists.txt`, `wasm/bindings.cpp` (2 trailing params, both wasm rebuilt).
- `web/js/engine.js`, `web/js/create.js` (pickGather + manual pickers + gatherDrawn),
  `web/js/missing.js` (honesty suppression), `backend/draft.js` (whitelist + call;
  also completed a pre-existing gap where the grade path never forwarded
  collarType/collarEdge).
- `engine/tools/benchmark-58.mjs` (DRAWN_SINCE loop 8 rule), `web-fuzz.js` +
  `render-pages.mjs` (gather coverage), `engine/build-wasm.sh` (gather.cpp × 2),
  `engine/FORMULAS.md` (gathering section).

## Deploy

- v56 → **v57** (?v bump + git add web/ ALL + subtree gh-pages).
- Worker VISION unchanged (no wrangler redeploy needed for vision). The
  backend/draft.js grade-path fix + gather params affect the /api/draft & /api/grade
  worker engine only; the live foto→pattern product path uses the browser wasm.

## Strategy note

Loops 4b–7 added tie + puff cap + collar family but FULL stayed 14 because those
elements clustered with other missing items. Loop 8 was chosen by **marginal gain**,
not frequency — and it moved the number for the first time (+5). Confirms the
2026-07-16 metric reform: element accuracy is the daily compass, and FULL moves when
you target a photo's LAST blocker. Next by marginal gain: open-back cutout (+4).
