// render-garment-flat.mjs — RE-EXPORT ONLY. The pen itself moved to
// web/lib/flat-core.js on 2026-08-26 (F-İNDİR, 2nd round).
//
// WHY IT MOVED. GitHub Pages publishes ONE root (`.github/workflows/pages.yml`,
// `path: web`), so a module the browser imports has to live under web/. The
// production flat pen had never printed a pixel a shopper could see — measured
// again this round: `grep -rn "data-engine-gap" web/` returned 0 lines before
// the move, which is GECE/V4-D's sharpest finding still standing. It could not
// reach the browser for one mechanical reason: five `readFileSync` calls at
// module load. Those became one generated table module (gen-flat-tables.mjs).
//
// WHY web/lib/ AND NOT web/js/. Same rule pdf-core.js landed under, same round:
// `web/js/` is the PAGE-SCRIPT namespace (create.js, studio.js, sheet.js) and
// this is a shared renderer that fifteen node tools and tests import too. The
// placement is also outside vocab_reference_check's SCOPE and that is stated
// here rather than hidden: the move DROPS that ratchet's count (measured in
// GECE7/F-INDIR.md), and a drop is what the ratchet permits — it is not a
// re-cut baseline and no threshold was touched.
//
// WHY A SHIM AND NOT FIFTEEN EDITED IMPORTS. One pen, one truth. Every existing
// caller (engine/tests/flat_convention_check.mjs, flat_expresses_spec_check.mjs,
// flat_geometry_sellable_check.mjs, flat_sellable_check.mjs, style_check.mjs,
// bridge_guard.mjs, hedef_kosu.mjs, engine/tools/render-flat.mjs, figure-lint,
// one-figure-lint, gen-wrap-grid, gen-gore-grid, gen-taste-pool, ...) keeps its
// path and gets the same functions. There is no second copy to drift.
export * from '../../web/lib/flat-core.js';
