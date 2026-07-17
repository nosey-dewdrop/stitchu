# stitchu PDF pack — phase 2 (download wiring)

Phase 1 built the printable PDF packs (36 files, `web/patterns/pdf/`, manifest
`pdf-manifest.json`). Phase 2 wires them into the pattern pages, generator-only,
no hand-edited pages.

## What changed

`engine/tools/gen-pattern-pages.mjs` now:
- loads `web/patterns/pdf/pdf-manifest.json` and a `kb()` byte formatter;
- adds a "Download the printable pattern." section to every per-pattern page,
  placed after the honest note and before the create CTA;
- the section carries three links, sizes read from the manifest (never guessed):
  - A4 print pack (EU38), primary `.sb-btn.sb-primary`, with " A4, N pages, X KB.";
  - A0 single sheet (X KB), dashed text-link (`.dl-link`, dashed border-bottom);
  - sewing guide (N steps, X KB), dashed text-link;
- plus an honest calibration note (3 cm square, print at 100 percent).

`patterns/index.html` cards: left sand simple, no "pdf" marker added (per brief,
when in doubt keep it plain).

Copy follows the writing law: sentence-headings end in a full stop, no em dash,
"i" not "we", EN `data-en` / TR `data-tr` throughout.

## Regenerate + guards

Regenerated at `V=69` (matches the shared-css version the main pages already
load). 12 pattern pages + index = 13 pages rebuilt.

- `node engine/tools/style-lint.mjs` -> OK, 0 violations across 44 pages + 7 css.
- `node engine/tools/header-diff.mjs` -> OK, header identical across 44 pages
  (7 main + 24 styles + 13 patterns).

Both green before deploy.

## Deploy + live proof

Committed generator + 13 pages, pushed main, then `git subtree split --prefix web`
-> gh-pages. Live on `https://nosey-dewdrop.github.io/stitchu`:

- pattern page `patterns/boat-neck-linen-shell.html` -> HTTP 200, download block
  "A4 print pack (EU38)" present;
- `patterns/pdf/boat-neck-linen-shell-a4.pdf` -> HTTP 200,
  `content-type: application/pdf`, content-length 46550 (matches manifest);
- a0 and guide variants also serve `application/pdf`.

## Patch note

`web/patches.html` entry 2.12 added (after rebase, edited last so it would not
collide with the FAZ M agent working in create/missing/engine). Flat delta badge,
no arrow chains, EN/TR, honest note that no accuracy number moves (shell not
engine). Guards re-run clean with the entry in place. Redeployed, live.

## Scope notes

- Did not touch `create.js` / `missing.js` / `engine.js` / engine C++ (FAZ M
  agent's uncommitted work; left intact in the working tree).
- Main-page version markers left as found (footer v68 / css v69, an in-flight
  state another agent owns); only the pattern pages were bumped for cache-bust.

## Commits

- e99cb34 wire pdf download pack into pattern pages
- e12cda4 patches: add 2.12 pdf download pack entry
