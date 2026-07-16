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

## FINAL ACCOUNTING (D1b close — verified against files on disk, downloaders stopped)
Both manifests reconciled 1:1 against the files. No orphan photos, no manifest gaps.
- Files on disk: **28,246** garment photos.
- Open-set manifest (`dataset/openset/manifest.json`): 27,854 entries, all hashes unique.
- Brand manifest (`dataset/manifest.json`): 392 entries, all hashes unique.
- 27,854 + 392 = 28,246 → matches the file count EXACTLY (0 unmanifested files).
- Cross-source dedup: 0 brand hashes also present in the open-set (content-hash sha1).
- Disk: `dataset/` = **382 MB** total, far under the ~10GB cap.

## Source distribution (final pool)
Open dataset names are kept LOCAL; publicly this is described only as "an open dataset".

| source | pool | count | disk | note |
|---|---|---|---|---|
| open dataset (in-shop e-commerce, women) | training | 26,954 | 236 MB | public academic mirror, non-commercial research/educational license |
| open dataset (public Shopify brand) | training | 900 | 108 MB | robots-clean paginated products.json, first image only, 2s delay |
| brand — uniqlo | training | 122 | 11 MB | public product CDN |
| brand — handm | training | 270 | 17 MB | public product CDN |
| **total** | | **28,246** | **382 MB** | |

### Open-dataset category balance (women, in-shop)
dresses 6,990 · blouses 6,000 · tees(capped) 3,000 · sweaters 3,036 · skirts 2,045 ·
jackets 1,895 · rompers 1,696 · cardigans 1,436 · sweatshirts 856 (= 26,954);
Shopify brand: dresses 300 · tops 300 · skirts 300 (= 900).

### Brand category balance
uniqlo: dress 77 · top 18 · skirt 27 (=122). handm: dress 90 · top 90 · skirt 90 (=270).

## Evidence
- Dedup: 0 duplicates within the open-set (all 27,854 unique by content hash);
  0 duplicates within the brand pool (392 unique); 0 cross-source collisions.
- Disk: 382 MB total — the open-set source images are small (~256px), so 26,954
  images cost only ~236 MB.
- Errors: 0 during open-set extraction; manifests reconcile exactly to files.

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
