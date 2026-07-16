# engine/tools

Build, proof and guard scripts for stitchu.

## Deploy guards (run both before every site deploy)

- `node engine/tools/header-diff.mjs` proves the canonical header is byte-identical on all 44 pages.
- `node engine/tools/style-lint.mjs` proves the house style: no em dash in visible text, no single-side accent bars, no pill capsules, sentence-case headings are punctuated, and brand copy never says "we/our". Legit exceptions live in `style-lint.allow.json`. Run this before every site deploy.
