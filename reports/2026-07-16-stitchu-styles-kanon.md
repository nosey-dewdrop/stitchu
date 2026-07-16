# stitchu — style library pulled to full canon (patch 2.11)

Date: 2026-07-16
Scope: web/styles/* (24 pages: 23 styles + hub), generated only from `engine/tools/gen-style-pages.mjs`. No hand-edited page. dataset/, engine C++, backend untouched.

## Damla's rule applied
A convention she names once holds for the WHOLE site — no per-page demo. Today's catch: the style pages still wore the old cherry (vişne) colour world and an off-canon CTA (flat mid-blue fill, no inner dashed frame). This was deliberately deferred (STATUS: "style-library 24 sayfa GÖVDESI ... vişne kaldı — backlog"); its turn came.

## What changed (generator only)
1. **Buttons → shared-button system.** Both primary CTAs (each style page's "Print this pattern" + the hub's "Draft a pattern") now emit `class="sb-btn sb-primary"` — the canonical filled-navy button with the inner dashed white frame — and every page links `../css/shared-button.css`. Secondary links keep the canon dashed-underline text-link (`.cta2`), which is a legitimate canon secondary.
2. **Colour world → baby-blue canon.** Swapped the vişne ground (`#8f2038`, `#ffd9e2`, `rgba(80,14,26,*)`, `#ffd2da`) for the exact benchmark/patches palette: `--bb #8fbfe8 · --bb-deep #3f74a8 · --bb-pale #dceaf7 · --bb-line #bcd7ee · --navy #1f3a5f · --ink #2b4a6b`. Body = navy ink on white. Tables/cards/sketch grounds use bb-pale + bb-line. Removed the vişne-era header ink-flip (`.sh-nav a{color:#fff}`) so header ink stays navy like every other page.
3. **Flat sketches recoloured.** Sketch line language moved from white-on-vişne to navy-on-white: `INK #1f3a5f`, `INK_SOFT rgba(31,58,95,.35)`, `INK_ACCENT #3f74a8` (the taught technique now a bb-deep accent, not couture blush). Geometry/params unchanged — sketches are byte-equivalent in shape, only stroke colours differ.
4. **Cache-bust + transitions.** Added `theme-transitions.css` link (page-transition parity with the rest of the site), bumped every asset ref to `?v=67` site-wide (was uniformly v=66).

Layout, copy, numbers, presets, breadcrumbs, SEO/ld+json: **unchanged** (reskin, not redesign).

## Inventory verification (Damla's rule requires zero offenders)

| candidate | file | verdict |
|---|---|---|
| `.cta` / `.cta2` block CTA | web/styles/* (24 pages) | WAS off-canon → fixed to `.sb-btn.sb-primary` (primary) / canon dashed text-link (secondary) |
| `.btn t1..a2` | index.html hero | decorative `<img>` button-sprite PNGs, not CTAs — N/A |
| `.beta-cta` | api.html | a `<div>` section wrapper, not a button — N/A |
| `.cta betabtn` submit | index.html | already carries `sb-btn sb-primary` — canon |
| all other `<button>` | web/*.html | only EN/TR lang toggles remain — N/A |
| JS-generated buttons | web/js/*.js | none lacking `sb-btn` |

**Off-canon CTAs remaining: 0** (was 24, all in the styles family).

## Proof
- `node engine/tools/gen-style-pages.mjs` → generated 23 style pages + hub + sitemap (43 urls) + robots.txt.
- `node engine/tools/header-diff.mjs` → **OK, header identical across 44 pages** (7 main + 24 styles + 13 patterns).
- grep sweep: 0 vişne colours (`8f2038|ffd9e2|ffd2da|rgba(80,14,26|500e1a`) in web/styles/; 24 pages carry `sb-btn sb-primary`; 0 pages missing shared-button.css; 0 refs left at `?v=66`.

## Deliverables
- reports/2026-07-16-stitchu-styles-kanon.md (this file)
- web/patches.html → patch 2.11 "The style library joins the baby-blue world" (EN/TR, delta rozeti, honest note: shell not engine, no accuracy number moves; header byte-identical across 44 pages).
- 24 regenerated style pages, v++ to 67 site-wide.

## Not touched
dataset/, engine/src (C++), backend/. Accuracy number (24/54) unchanged by definition — this is the shell, not the engine.
