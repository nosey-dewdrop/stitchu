# stitchu — fixed byte-identical header + punctuation pass

Date: 2026-07-16
Scope: web/*.html (7 pages), web/css/shared-header.css, web/js/shared-header.js,
web/styles/* (24 generated pages) via engine/tools/gen-style-pages.mjs,
web/js/create.js, web/js/closet.js. No touch to dataset/, engine/src, backend.

## Complaint (evidence-backed, Damla)
1. The navbar shifted between page transitions; each page was still slightly different.
2. The punctuation rules were applied only to benchmark headings, not to ALL headings.

## GÖREV 1 — one byte-identical header

### Root cause found
Three different header structures were live:
- `index.html`: fixed `.mark` (top-left) + fixed `.topnav` (top-right) split — and
  the nav was MISSING create/closet entirely.
- `create/closet/privacy`: `<header><div class="wrap header-in"><div class="wordmark">…`
  with an SVG dashed underline; create/closet used `data-i18n` and had NO EN/TR toggle at all.
- `benchmark/api/patches`: flat `<header><a class="mark">` with `data-en/data-tr`.
Each page carried its own inline header CSS (different padding: 22px 40px vs 24px 36px,
different nav gap/margin), so the bar rendered at a different height/position per page.

### Fix
- New single source of truth: **web/css/shared-header.css** — one `.sh-header` bar
  (fixed height 74px, padding 0 40px, font from here and nowhere else) + canonical
  `.brandpatch` wordmark (navy sewn-label with inner dashed white frame) + `.sh-nav`
  + `.sh-lang` EN·TR toggle. Prefixed `sh-*` so no page style can shift it.
- New single behaviour script: **web/js/shared-header.js** — one EN/TR toggle, one
  storage key (`stitchu:lang`), translates every `[data-en]/[data-tr]` node
  (innerHTML-aware, preserves `<em>`), handles `[data-en-ph]` placeholders, reloads
  on switch so app-rendered screens (create/closet) also switch.
- The SAME header HTML block is now on all 7 pages, differing only by the `sh-active`
  class on the current page's link (privacy has none — it lives in the footer).
- Canonical nav set everywhere: create · closet · patterns · benchmark · patch notes ·
  API + EN·TR. (create/closet were missing patterns + the toggle; index was missing
  create/closet — all fixed.)
- index keeps its hero (full-viewport canvas); the canonical bar sits `position:fixed`
  over it via one index-only positioning rule. The bar's own metrics still come from
  the shared stylesheet, so no drift.
- Removed the per-page inline header CSS and per-page inline `setLang` scripts (5 copies).
- Removed the duplicate `mountLangToggle()` calls in create.js/closet.js (the header now
  owns the toggle; keeping them would double the EN/TR control).
- Style pages: **engine/tools/gen-style-pages.mjs** header rewritten to the canonical bar
  with the full nav set (relative `../` paths), links `../css/shared-header.css`, loads
  `../js/shared-header.js`, ink flipped white on the vişne ground (dimensions stay shared).
  Favicon aligned to navy. Footer em-dash → `·`. Regenerated 23 style pages + hub (24).

### Verification (mathematical, not by eye)
Extracted each page's `<header class="sh-header">…</header>` block, normalized out the
`sh-active` class, and diffed all 7 against index:

```
create vs index   → IDENTICAL
closet vs index   → IDENTICAL
benchmark vs index→ IDENTICAL
api vs index      → IDENTICAL
patches vs index  → IDENTICAL
privacy vs index  → IDENTICAL
```

**header diff: identical** (all 7, except the active-page underline class).
Nav-set count: 6 canonical links + langtoggle present on every one of the 7 pages and
on the style pages (checked collars.html + styles/index.html = 6 links each).

## GÖREV 2 — punctuation / typo pass on ALL headings

Damla's rules applied site-wide (EN + TR), em dash kept at zero (0 em dashes in all 7
main pages, confirmed).

### Changed headings (before → after)
| Page | Before | After |
|---|---|---|
| index (moat card h3) | `Fits every body, not one block` / `Tek kalıba değil, her bedene uyar` | `Fits every body, not one block.` / `Tek kalıba değil, her bedene uyar.` |
| index (moat card h3) | `Your measurements never leave` / `Ölçülerin asla çıkmaz` | `Your measurements never leave.` / `Ölçülerin asla çıkmaz.` |

Total headings corrected: **2** (both EN + TR).

### Verified already-correct (no change needed)
- benchmark: `1. The geometry holds.` / `2. Audited against the textbooks.` /
  `3. Why is this the moat?` — statement periods + question mark already right.
- index h1/h2: all statement headings already end with a period.
- index h3 `Proven to fit` — a label fragment, correctly bare (kept).
- api: `Request`, `Response`, `No LLM cost`, `Proven output`, `Private by design`,
  `Try it live`, `Grade a size run`, `Beta partners`, `Maker/Studio/Volume`,
  `Become a beta partner` — all true/section labels, correctly bare.
- patches `Patch notes`, privacy `Privacy`, closet `Closet` (i18n) — true labels, bare.
- i18n.js titles: `hero.title` (period), `create.spec.title` `What are we sewing?` (?),
  `create.result.title` `{garment}, drafted for you.` (period),
  `closet.empty.title` `No patterns yet.` (period), `How it works` / step labels
  (bare labels) — all already compliant.

No obvious body typos found in the touched pages.

## Deploy / version
Unified every `?v=62/64` asset ref → `?v=65` across the 7 pages (cache-bust), plus the
visible footer version label `v62` → `v65`. Style pages reference shared assets at `?v=65`.

## Patch note
Added patch **2.9 "One header, byte-identical, on every page"** to web/patches.html
(EN/TR, delta `7 pages + 24 style pages → one header, header diff: identical`, honest
note that no accuracy number moves — this is the shell). Demoted 2.8 from `now`.

## Note on parallel work
A parallel background agent was editing this repo concurrently (backend/worker.js,
engine/tools/gen-pattern-pages.mjs, web/patterns/*). Those are NOT part of this task and
were left to that agent; the patterns/ generator keeps its own header (out of this scope).
Commit staged only the header/punctuation files listed above.
