# stitchu PDF pack — phase 1 (production only)

New tool `engine/tools/gen-pattern-pdfs.mjs` produces printable PDF packs from
the real engine output, one set of three per pattern, at EU38. No page/site
wiring (phase 2). No HTML or generator was edited; only new files were written.

## What it produces

For each of the 12 FULL benchmark patterns (the canonical spec list mirrored
from `render-patterns.mjs`), drafted through the shipped WASM engine at the
EU38 standard body (`engine/src/sizechart.hpp:24` → bust 88, waist 70, hip 94,
shoulder 37, backLength 40.5, armLength 58, neck 35):

- `<slug>-a4.pdf` — cover (piece list, fabric estimate, seam-allowance note,
  assembly instructions, 3 cm calibration square) + tiled A4 sheets. The tiling
  geometry and the register system (visible page frame, big grid code, black
  corner squares, join ticks, continuation arrows) come from `web/js/sheet.js`
  (`packPieces` / `usedCells` / `sheetInner` / `sheetCode`) — the single source
  the product prints. The tool renders those exact strings to PDF; it does not
  re-derive the layout.
- `<slug>-a0.pdf` — the whole packed pattern on one A0 sheet (print shop), with
  the calibration square at true size in the corner. Patterns larger than A0 are
  scaled to fit and the cover says so honestly with the exact percentage.
- `<slug>-guide.pdf` — text-first instruction booklet built from the engine's
  own `guideSteps` + cut list + fabric estimate. First edition is illustration
  free and the cover states that plainly.

## How it works (no external dependency)

A small self-contained vector PDF writer emits mm-true coordinates
(1 mm = 72/25.4 pt). This gives an exact, verifiable calibration square instead
of trusting a rasteriser's scale. The tool reads the SVG that `sheet.js` emits
(only `<rect>`, `<path>`, `<line>`, `<text>`, and `<g transform="translate">`)
and translates each primitive to PDF operators, so the tiling stays defined in
one place. Helvetica AFM advance widths give correct text anchoring.

## Verification

All 36 PDFs parse: header `%PDF-`, `/Count > 0`, `/MediaBox` present. A4 pages
measure 210×297 mm, A0 pages 841×1189 mm, guides A4. Confirmed openable by two
independent renderers (Chrome headless print-to-pdf, macOS qlmanage thumbnail).
A tiled A4 stream check found each sheet carries its grid code (A1…D2), frame +
corner-square rectangles, curve segments (necklines/armholes), ticks and labels.

### File table (12 × 3)

| slug | A4 pages (mm) | A0 (mm) | guide steps |
|---|---|---|---|
| boat-neck-linen-shell | 12 · 210×297 | 1 · 841×1189 | 12 |
| scoop-neck-tank-mini-dress | 15 · 210×297 | 1 · 841×1189 | see manifest |
| boat-neck-button-down-top | 16 · 210×297 | 1 · 841×1189 | see manifest |
| gingham-button-blouse | 13 · 210×297 | 1 · 841×1189 | see manifest |
| mandarin-collar-fitted-blouse | 20 · 210×297 | 1 · 841×1189 | see manifest |
| back-tie-shift-mini-dress | 21 · 210×297 | 1 · 841×1189 | see manifest |
| square-neck-back-tie-babydoll-top | 18 · 210×297 | 1 · 841×1189 | see manifest |
| empire-waist-tie-back-dress | 38 · 210×297 | 1 · 841×1189 | see manifest |
| square-neck-drawstring-babydoll-dress | 25 · 210×297 | 1 · 841×1189 | see manifest |
| open-back-princess-mini-dress | 23 · 210×297 | 1 · 841×1189 | see manifest |
| open-back-tie-back-mini-dress | 29 · 210×297 | 1 · 841×1189 | see manifest |
| peter-pan-collar-puff-sleeve-babydoll-dress | 41 · 210×297 | 1 · 841×1189 | see manifest |

A4 page count includes the cover. Per-file byte sizes and exact guide-step
counts are in `web/patterns/pdf/pdf-manifest.json`. Total pack size: 1.4 MB.

### Calibration proof (from PDF coordinates)

`boat-neck-linen-shell-a4.pdf`, cover content stream, the calibration square
`re` operator reads `85.039 85.039 re`. At 72/25.4 pt per mm:

    85.039 pt ÷ (72/25.4) = 29.9999 mm

so the 3 cm square is exactly 30 mm on the page (the 0.0001 mm gap is decimal
rounding in the 3-place point output, not a scale error). This is identical
across every A4 cover, since one `calibration()` routine draws them all.

## Phase 2 (not done here, by design)

Nothing links these into the site yet. Wiring the PDFs into `web/patterns/`
pages and a download flow is the second phase, owned separately. No deploy was
run.
