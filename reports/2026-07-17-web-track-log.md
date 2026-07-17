# Web track log — 2026-07-17

Three web fixes on the stitchu site (worktree, branch main). Sequential log.

## 1. Round the hero chips
- Found the chips styled inline in `web/index.html` (`.chip`), not in a css file.
- Radius was `border-radius:2px` (square). Changed to `border-radius:16px` (clearly
  rounded, soft). Not a full pill (`>=100px/50%/999px`) so it stays clear of
  style-lint rule (c), which bans pill radii on chip/badge classes.
- Verified in a headless Chromium screenshot: `/tmp/web-chips-form.png`. Chips read
  as clearly rounded.

## 2. Signup side by side
- The hero email input + "Join the Beta" button (`.betaform`) were a flex row but:
  (a) `flex-wrap:wrap` + fixed `width:260px` input made them loose, and
  (b) the button inherited `.sb-btn{margin-top:30px}`, dropping it 22px below the
  input (measured: input top 479, button top 501).
- Rebuilt `.betaform` as a tight field+button pair: `max-width:520px`, input
  `flex:1 1 auto` (grows), button `flex:0 0 auto`, both `height:48px`, and set the
  button `margin-top:0` to kill the inherited drop. Added a `@media(max-width:460px)`
  wrap-to-stack fallback so tiny phones don't overflow.
- Re-measured: input and button both top 490, height 48 — perfectly aligned. The
  button is clearly a button (navy sb-primary basted signature). Screenshot
  `/tmp/web-chips-form.png`.

## 3. Collections = Pattern Blog structure (clickable + downloadable depth)
- Studied `web/patterns/index.html` -> `web/patterns/<slug>.html` and the two
  generators (`gen-pattern-pages.mjs`, `gen-pattern-pdfs.mjs`). A blog look = a
  detail page (piece list, fabric, sewing facts) + a working PDF pack (A4 tiled /
  A0 single sheet / text sewing guide), built through the WASM engine + sheet.js.
- Collections had NO clickable depth: `collections/index.html` listed the one
  collection card, and `collection-60s70s.html` listed 16 looks as static sections
  with no per-look page and no PDF. Kept Collections exactly where it is (Damla
  likes it), only added the blog's depth.
- DRY: extracted the dependency-free vector PDF core out of the blog PDF generator
  into a shared `engine/tools/pdf-core.mjs` (Pdf/Ctx writers, sheet.js SVG->PDF
  renderer, A4/A0/guide builders). Left the working blog PDF generator untouched to
  avoid a race with the parallel engine track.
- New generator `engine/tools/gen-collection-pattern.mjs`:
  - Reads all display copy (names, notes, piece names, fabric, oov, period, house)
    from `web/patterns/vintage6070/meta.json` (engine-owned DATA, read-only).
  - Holds the 16 engine draft params (mirrored from render-vintage6070.mjs, exactly
    as gen-pattern-pdfs.mjs mirrors its PATTERNS; importing the render tool would
    re-run its SVG writer into another owner's territory).
  - Builds 3 PDFs per look through the shared core into `web/collections/pdf/`
    (48 files) and writes 16 detail pages `web/collections/<slug>.html` using the
    SAME detail + download layout as the blog (breadcrumb, drafted SVG, piece/fabric
    table, honest oov note, A4/A0/guide download block, calibration note, CTAs).
  - Detail pages sit flat in web/collections/ (same "../" depth as
    collections/index.html) so their header is byte-identical to the index header
    (verified) even though header-diff does not scan them.
- Made the looks clickable: edited `gen-vintage-page.mjs` so each look on
  collection-60s70s.html links through to its detail page (clickable heading,
  clickable figure, and a "See the sewing details and download the pattern ->"
  link). Navy links, no purple.
- Regenerated collection-60s70s.html, collections/index.html at V=85. Added the 16
  collection detail URLs to `web/sitemap.xml` (valid XML).

## Verify
- `node engine/tools/style-lint.mjs`: OK, clean across 70 pages + 7 css (was 54;
  +16 collection detail pages).
- `node engine/tools/header-diff.mjs`: OK, header identical across 46 pages.
- Cache-bust: highest was v84 -> bumped every touched page to v85 (index,
  collection-60s70s, collections/index, all 16 detail pages).
- Headless Chromium (python3 -m http.server + playwright chromium):
  - index: chips rounded, form aligned side by side, 0 console errors, 0 purple links.
  - Collections -> collection-60s70s -> click a look -> lands on
    collections/<slug>.html detail page with sewing details + working A4 PDF
    (HTTP 200, application/pdf), 0 console errors, 0 purple links, 0 HTTP 400+.
  - TR toggle switches the detail page copy.
  - Screenshots: /tmp/web-chips-form.png, /tmp/web-collections-detail.png.

## Not touched
- DEVAM-RAY-LOOP.md, backend/worker.js: untouched.
- Engine track territory (engine/src, render tools, web/patterns/svg + meta.json,
  web/vendor, backend/engine): left unstaged; only my web/css-adjacent + collections
  + page-generator files committed.
