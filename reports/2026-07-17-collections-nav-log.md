# Collections as its own nav section — sequential log (2026-07-17)

Goal: make Collections a top-level navbar section, separate from the Pattern Blog;
remove the folded 60s/70s section from the Patterns page; build a scalable
Collections landing that lists collections and grows.

## 1. Rebase / clean history
- `git fetch origin && git rebase origin/main` — dirty WIP (DEVAM-RAY-LOOP.md,
  backend/worker.js) stashed, rebased onto origin/main (1afd116), stash popped.
  Those two files plus web/css/landing.css were never staged (constraint honored).

## 2. Collections added to the canonical nav (position confirmed)
- New nav order, every header-carrying page:
  **Create · Closet · Pattern Blog · Collections · Benchmark · Patch Notes · API**
- Collections sits between the Pattern Blog link and Benchmark (verified live, both
  index and patterns pages: ORDER OK via curl grep of the exact sequence).
- `data-en="Collections"` / `data-tr="Koleksiyonlar"`, Title Case.
- Updated the three canonical-nav generators identically:
  - engine/tools/gen-pattern-pages.mjs (patterns/, subdir `../collections/index.html`)
  - engine/tools/gen-style-pages.mjs (styles/, subdir)
  - engine/tools/gen-vintage-page.mjs (collection-60s70s.html, root href, Collections = active)
- Hand-written pages (index, create, closet, benchmark, patches, showcase, api,
  privacy) each got exactly one Collections nav entry inserted after Pattern Blog.
- The new collections/index.html marks Collections active; collection-60s70s.html
  marks Collections active too (it is a collection).
- guide/ pages intentionally left alone: they carry a separate local nav (guide +
  styles), excluded from header-diff, not part of the canonical bar.

## 3. 60s/70s removed from the Patterns page
- gen-pattern-pages.mjs: deleted the `vintageSection` block (the folded
  "The Sixties Seventies Collection." `<section class="sec">`), its `${vintageSection}`
  insertion, the now-unused `vintageCard()` function and `vintageMeta` import, and the
  "plus the sixties seventies collection" phrase from the page description.
- Regenerated patterns/index.html + page-2.html: 0 occurrences of
  "Sixties Seventies"/"vintage6070"/"collection-60s70s" (was the full 16-card section).
- Live patterns page now: 9-card 3x3 grid, pager, straight to the create CTA. Verified.

## 4. Collections index built + scalable structure
- New generator engine/tools/gen-collections-page.mjs → web/collections/index.html.
- Data-driven: a `COLLECTIONS` array. Each entry = one card (slug, href, thumb,
  EN/TR name+desc+count). Adding a 2nd/3rd collection = append one entry + its page.
  Nothing else changes; the index, sitemap, and ld+json ItemList all derive from the array.
- Currently one entry: "The Sixties Seventies Collection" (16 looks) → ../collection-60s70s.html.
- Design: calm navy-on-white, hairline-border cards, gingham hairline top, Didot
  headings, EN/TR on every string, no emoji/gradient/pill/cream, no em dashes.
  Chose a clean listing page (scales) over a header dropdown.

## 5. Design-rule + guard passes
- Title Case on headings/nav/labels; body sentence-case; no em dashes (checked EN+TR).
- No purple/default links: playwright computed-color sweep = 0 purple links on
  collections, patterns, index, collection-60s70s. Fixed one pre-existing default-blue
  `.cta2` link on index.html (page I touched) → explicit var(--navy) + dashed underline.
- style-lint.mjs: added `collections` to its scan dirs → **OK, clean across 54 pages + 7 css.**
- header-diff.mjs: added collections/index.html to the checked set + a `__COLLECTIONS__`
  normalisation token (root `collections/index.html` vs the index's self `index.html`)
  → **OK, header identical across 46 pages (10 main + 24 styles + 12 patterns).**

## 6. Cache-bust
- Highest was v83 → bumped everything touched to **v84** (HTML ?v= + footer version
  spans + the three generators' hardcoded version). guide/ (v80) left untouched (not touched).

## 7. Headless render
- python3 -m http.server + playwright chromium. All pages status 200, **no console
  errors**, nav order correct, no purple links.
- Screenshots: /tmp/collections.png (clean index, Collections active, one Sixties card)
  and /tmp/patterns-clean.png (grid + pager + CTA, no 60s/70s section).

## 8. Commit + deploy
- Commit **bc936c3b3557929c6ab2185c0e98329c6f6cf3ac** on main.
- Author: `nosey-dewdrop <damummyphus@gmail.com>`. Message:
  "collections: own nav section, move sixties out of patterns, scalable collections index".
- Co-author trailer: **none** (git log -1 --format='%b' clean; commit-msg hook installed + passed).
- Pushed main (9cef15d..bc936c3), no force.
- gh-pages: `git subtree split --prefix web main` → f543e9c46 → force-pushed to gh-pages.

## 9. Live curl verification (nosey-dewdrop.github.io/stitchu)
- /collections/ → 200; lists "The Sixties Seventies Collection", links ../collection-60s70s.html.
- index + patterns nav: Pattern Blog → Collections → Benchmark (ORDER OK).
- /patterns/ → 0 sixties/vintage occurrences (clean).
- version live: v84. collection-60s70s.html → 200 (Collections active).

Files owned/changed: engine/tools/gen-collections-page.mjs (new), gen-pattern-pages.mjs,
gen-style-pages.mjs, gen-vintage-page.mjs, header-diff.mjs, style-lint.mjs,
web/collections/index.html (new), web/sitemap.xml, 8 hand-written pages, 24 style pages,
12 pattern pages, collection-60s70s.html. Untouched: DEVAM-RAY-LOOP.md, backend/worker.js,
web/css/landing.css, guide/, the engine.
