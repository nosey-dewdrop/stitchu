# stitchu LOOP B — A4 pattern merge (patch 3.2)

Date: 2026-07-17. Layer touched: L4 output only (web/js/sheet.js, web/js/print.js,
web/css/app.css, patches.html). Engine (engine/src, C++) and vision (worker.js)
NOT touched. Golden/ctest not affected (no engine change).

## 1. Verification: register continuity is already clean (the bug is NOT alignment)

New harness `engine/tools/register-continuity.mjs` drafts multi-page patterns
(Jackie-like back-waist-tie dress + smocked yoke + puff sleeve + maxi slit skirt),
parses the EXACT sheet.js markup the product prints, and asserts every register
mark on a shared page edge lands on the same strip point as its partner on the
neighbour, in mm.

Checks per neighbour pair:
- corner squares complete across the joint (both pages carry a square at the
  shared corner, same strip coordinate),
- edge ticks at 1/4, 1/2, 3/4 meet across the joint (A-right pos == B-left pos),
- no piece footprint covers a cell that is not in the printed set (no clipping).

Result: **150 neighbour pairs, all corner squares, edge ticks and piece cells
align within 0.01 mm. CONTINUITY OK.** A negative control (deliberately shifted
tick) makes the harness FAIL, so it has teeth.

Conclusion: the register system shipped in Blok 1 (v50) is mathematically correct
— taped together, the squares complete and the ticks meet. Damla's "puzzle won't
join" feeling was NOT an alignment bug. The real pain is (a) too many sheets, and
(b) no piece-to-sheet map. Both are addressed below.

## 2. Blok 3 — packing (rotation + wider search), fewer sheets, zero regression

sheet.js `shelfPack` now takes `allowRotate`. A genuinely long-and-thin piece
(aspect >= 2.2: a 670 mm waist tie, a maxi panel) can lie 90 deg on its side so it
stops eating rows of near-empty sheets. `packPieces` searches cols (up to 7) x
{rotation on, rotation off} and keeps the fewest-sheets layout, so rotation can
only ever help; a tie never wins over the unrotated result.

SAFETY PROVEN:
- Rotation is a rigid transform. Harness proved every adjacent vertex pair keeps
  its EXACT distance after the transform (translate/rotate only); the outline path
  strings are byte-identical, only the SVG group transform changes. Footprint =
  orientation-swapped raw bbox. No piece is ever reshaped by being packed.
- register-continuity still passes with rotation ON (141 pairs, < 0.01 mm).
- Nested grading run forces `allowRotate=false` so every size registers on the
  same placement; verified nested render path unchanged (0 rotated pieces, all
  ox/oy defined, renders without throwing).

MICRO-LOOP (clip bug found + fixed): with rotation on, a piece whose rotated width
exceeds the strip was silently clipped, and a wide 1109 mm gathered yoke panel
overflowed the strip UNROTATED too (a pre-existing latent bug: countSheets
under-counts overflow). Fix: rotate only when the rotated footprint still fits one
strip; and packPieces REJECTS any (cols,rot) candidate where a piece footprint is
wider than the strip, with a fallback that widens to fit the widest piece. Return
point: re-ran continuity, clean.

SHEET COUNT (21 real photo->pattern specs, EU38):
- before: 462 sheets total
- after:  437 sheets total  (-25, -5.4%), ZERO regressions (every spec <= baseline)
- Jackie 20 -> 17; smocked yoke 36 -> 34; drawstring 32 -> 27; shirred 19 -> 16;
  openback-lowv 29 -> 24; gathered 20 -> 18; peterpan 17 -> 15.

## 3. Blok 2 — numbered cutting list on the cover (Bugra-quality)

sheet.js `pieceSheetMap(layout)` returns, per piece, the grid codes it prints on.
print.js cover now renders a numbered table (no | piece | cut | sheets), EN+TR,
styled `.print-cuttable`. Example (Jackie): "3 Bodice Front / cut 1 on fold /
C1, C2, D1, D2". A piece split over four pages is found at a glance.

## 4. Vitrin + content

- web/patches.html: patch 3.2 entry (EN/TR, no em dash, no "biz", style-lint clean).
  Updated date to 2026-07-17. HTML asset versions bumped ?v=70 -> ?v=71;
  JS module import chain bumped ?v=55 -> ?v=56 across web/js.
- linkedin.md (icerik/): Essay 19 "Kalıp doğruydu ama kağıtta birleşmiyordu"
  (numbered chain, ses Damla, 0 em dash).
- devlog.md (icerik/): seri BB (BB1/BB2/BB3, hook + bullets + Görsel/Format).

## 5. Proof summary

- register-continuity.mjs: 150 pairs (rotation off) + 141 pairs (rotation on), all < 0.01 mm.
- rigid-rotation proof: distances preserved exactly, outline byte-identical.
- web-fuzz: 19960 drafts, 0 failures (engine untouched).
- style-lint: clean, 44 pages + 7 css, 0 violations.
- render-pages: Jackie + smocked strips rendered, visually confirmed corner
  squares complete, ticks meet, rotated pieces intact.

## 6. Damla test print (final proof, only she can)

Register merge is proven in software but the ultimate judge is a printed dress.
NEXT STEP FOR DAMLA: **print Jackie again** (A4 pack), tape it, confirm the pieces
join and the pattern is now fewer pages with a numbered cutting list on the cover.

## Notes / backlog

- engine/tools/web-fuzz.js carries a STALE private mirror of the packer
  (predates the sheet.js extraction) and points at the main-checkout engine dist.
  It still validates engine drafts but does NOT exercise rotation. Syncing it to
  import sheet.js (one truth) is a clean follow-up, deferred to avoid scope creep.
- When a piece is rotated, its label + cut text read rotated 90 deg on the sheet;
  the cover cutting list gives the name upright, so this is acceptable (standard
  for tiled home-sewing PDFs).
