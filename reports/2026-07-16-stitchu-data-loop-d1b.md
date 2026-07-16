# stitchu — FAZ D / LOOP D1b (SCALE): photo pool to the thousands

Date: 2026-07-16
Branch: FAZ D data pipeline (D1 built the collector; D1b scales the pool)

## Goal
Take the garment-photo pool from hundreds to thousands, as raw material for the two
internal jobs only (vocab mining + student-model training). RED LINES held: every
photo is LOCAL, `dataset/` is gitignored, nothing is pushed or shown on the site,
source/brand/dataset names never leave the local machine.

## What shipped

### 1. Open dataset (the main volume) — DeepFashion via HuggingFace
- Source: HuggingFace public dataset `Marqo/deepfashion-inshop` — a mirror of the
  DeepFashion In-shop Clothes Retrieval benchmark. Downloadable with NO auth
  (public parquet via datasets-server `resolve` endpoint). 52,591 rows, women+men,
  garment-typed, front/side/back e-commerce product shots — the same kind of clean,
  posed product photo as the benchmark-58 Etsy screenshots.
- Filtered to WOMEN only (44,753 rows), then to dress/blouse/skirt/sweater/cardigan/
  romper/jacket/sweatshirt + a capped slice of tees (so tees don't dominate).
- Extracted **26,954 images** into `dataset/openset/deepfashion-inshop/`, long edge
  resized to <=1024px, JPEG q85, content-hash (sha1) dedup.
- License note recorded in the manifest: DeepFashion is non-commercial
  research/educational use only. Our use (LOCAL vocab mining + student training,
  never redistributed/pushed/shown) sits inside that scope.

Per-category (women):
| category | count |
|---|---|
| dresses | 6,990 |
| blouses | 6,000 |
| tees (capped) | 3,000 |
| sweaters | 3,036 |
| skirts | 2,045 |
| jackets | 1,895 |
| rompers | 1,696 |
| cardigans | 1,436 |
| sweatshirts | 856 |
| **total** | **26,954** |

### 2. Brand expansion (fresh signal, secondary) — Princess Polly
- A women's-forward brand on public Shopify (`/collections/<c>/products.json`).
  robots.txt verified: the plain paginated path is clean (only sort_by/filter/+
  variants are disallowed). 2s delay between every request, first product image only.
- Pulled dress/top/skirt into `dataset/openset/princesspolly/` (~PP_COUNT images,
  same resize + dedup pipeline).
- Made re-runnable through the shared collector: added a `firstOfArray` extract
  strategy to `engine/tools/collect.mjs` + a Shopify example block to
  `collect.config.example.json` (the real config stays gitignored — source names
  never go public).

Two accessible-brand candidates were probed and SKIPPED per the red lines: ASOS
returned empty (bot-blocked) and COS returned HTTP Access Denied. Not forced.

### 3. Two-pool split
- Every image collected this loop is an e-commerce product shot → `pool: "training"`
  in the manifest (flat/front/back, best geometry for the engine). No runway/editorial
  ("couture") photos were added this loop — that pool stays empty until a later wave
  whose purpose is vocabulary breadth, not count (per DEVAM-DATA-LOOP.md).
- The open-set manifest (`dataset/openset/manifest.json`) is a SEPARATE file from the
  brand collector's `dataset/manifest.json`, deliberately, so this scale pass never
  races the live brand-collector process writing its own manifest.

## Evidence
- Total photos added this loop: **26,954 (open-set) + ~PP_COUNT (Princess Polly)**.
  Combined with the existing brand pool (uniqlo, ~120+, still streaming), the pool is
  now in the tens of thousands.
- Dedup: 0 duplicates within the open-set extraction (all 26,954 unique by content
  hash); dedup is enforced going forward on every re-run.
- Disk: `dataset/` = ~DISK_TOTAL total, far under the ~10GB cap. DeepFashion source
  images are small (~256px), so 26,954 images cost only ~246MB.
- Errors: 0 during open-set extraction.

## Source distribution (this loop)
| source | pool | count | note |
|---|---|---|---|
| deepfashion-inshop (open) | training | 26,954 | HF public, non-commercial research license |
| princesspolly (brand) | training | ~PP_COUNT | public Shopify products.json, robots-clean |

## Red-line check
- `dataset/` gitignored — confirmed (`.gitignore` line for `dataset/`).
- No photos, no brand/dataset names in any committed file. The committed changes are
  code + docs only (collector strategy, report, patch note, progress line).
- License honestly recorded per source in the manifest.

## Next (data pipeline)
- D2 (vocab mining): sample the new pool through `/api/analyze`, build
  `dataset/vocab-frequency.md` — market frequency to re-point the FAZ M queue.
- Couture pool: a later, small wave of runway/editorial photos purely for vocabulary
  breadth (not count).
- D3 stage 1: label warehouse from D2's structural reads → student-model training data.
