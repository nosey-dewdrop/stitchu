# stitchu FAZ D / LOOP D1 — collector + first batch (2026-07-16)

NOTE: this repo is public, and the FAZ D red line says collection-source names
never go public. Working sources are therefore "source A / source B" here; the
full mapping lives in the gitignored `dataset/SOURCES-local.md`.

## Result
**392 photos, 2 high-street sources, 0 download errors.** Target was 300–600
total from 2–3 brands across women's dress/top/skirt — met. All photos are
LOCAL ONLY: `dataset/` was added to .gitignore and committed BEFORE any photo
landed (commit 4accc02); `git check-ignore dataset/` confirms. Nothing in
dataset/ is ever pushed (same regime as benchmark-58/).

## Numbers
| source | dress | top | skirt | total |
|--------|------:|----:|------:|------:|
| source A | 77 | 18 | 27 | 122 |
| source B | 90 | 90 | 90 | 270 |
| **total** | 167 | 108 | 117 | **392** |

- Dedup: sha256 content hash (16-hex prefix) + source-URL, across sessions.
  18 duplicates skipped during the run; manifest has 392 rows = 392 unique
  hashes (verified programmatically).
- Images resized long-edge 1024 px via macOS `sips` (spot check: 682×1024).
- Dataset on disk: 298 MB.
- Source A honestly undershot the 90/category target on top (18) and skirt (27):
  its catalog simply has fewer matching items (19 and 35 respectively, minus
  colorway duplicates caught by hash dedup). Not padded.
- Photo genre is exactly what the engine needs: flat/front e-commerce product
  shots, the same class as the benchmark-58 Etsy screenshots. Source B even
  serves a flat ghost-mannequin product image separate from the worn model
  shot — the collector prefers the flat one.

## Sample manifest rows (dataset/manifest.json — local, brand field redacted here)
```json
{"hash":"8f2021156690e712","brand":"<A>","category":"dress","source":"https://<A-cdn>/.../usgoods_38_482982_3x4.jpg","date":"2026-07-16"}
{"hash":"eef906f4ee254290","brand":"<B>","category":"dress","source":"https://<B-cdn>/assets/.../c819fec324e00dccb36874af4871d104.jpg","date":"2026-07-16"}
{"hash":"c358b61b33006d81","brand":"<B>","category":"skirt","source":"https://<B-cdn>/assets/.../46ac196ca0e24ddc3591eedf6b2cce90.jpg","date":"2026-07-16"}
```

## What worked / what did not (probed politely first, never forced)
The loop brief asked for 2–3 of Zara / Bershka / Stradivarius / Mango. **None of
the four is respectfully scrapeable** — each got one polite probe and was skipped:
- **Zara, Bershka, Stradivarius (Inditex)** — category AND product pages are
  ~2 KB SPA shells with zero server-rendered image URLs; product data comes from
  an internal bot-gated JSON API. Stradivarius product sitemaps ARE open (329
  product URLs per file) but resolve to the same empty shells. Reverse-
  engineering the private API would break the "respectful" red line → skipped.
- **Mango** — every `services/*` JSON endpoint returns an Akamai Access Denied
  (403); the HTML is a 105 KB SPA shell with no image URLs → skipped.
Also probed and skipped: one big fast-fashion site whose HTML pages are 403
bot-walled end-to-end (its public listing JSON API works though — became a
working source), one whose API resets the connection, one that is fully
client-rendered.

Per the brief ("olmuyorsa raporla ve alternatife geç"), two alternative
high-street brands with genuinely public, robots-clean product-listing JSON
APIs were used instead (see SOURCES-local.md). For source A, robots.txt is
readable and the API path is not disallowed (only HTML search pages are). For
source B, the API host publishes no robots at all and the image CDN has no
robots.txt (404 = unrestricted); the listing endpoint serves without any bot
challenge.

## The tool (re-runnable, committed; sources stay local)
- `engine/tools/collect.mjs` — generic, config-driven collector. Committed.
- `engine/tools/collect.config.json` — the REAL source list. Gitignored
  (source names never go public). `collect.config.example.json` documents the
  shape and is committed.
- Config drives everything: listing URL template with `{placeholders}`,
  items/total JSON paths, pagination style (offset or page), one of two neutral
  image-extraction strategies, per-category query keys, delays, resize edge.
- Respectful by construction: robots.txt fetched and parsed per source (a
  disallowed path skips the source), randomized 1.5–3 s delay between EVERY
  request (listing and image alike), single-threaded, public listing pages
  only, no paywalls, any error skips rather than retries.
- Re-runs are safe: manifest loaded at start; dedup by content hash AND source
  URL across sessions — only genuinely new photos are added.
- Run: `node engine/tools/collect.mjs` (~25 min full pass at the polite pace).
- Extraction logic re-verified against both live sources after the
  config-generalization refactor (24/24 and 30/30 listing items → image URLs).

## What this unblocks
D2 (vocab mining): sample 50–100 of these through live /api/analyze
(x-sb-bench, FAST) → `dataset/vocab-frequency.md`, the new FAZ M compass.
D3 stage 1 (label warehouse) is a free by-product of D2. Benchmark-58 remains
untouched / held-out.

## Red-line compliance checklist
- dataset/ gitignored before first download: YES (commit 4accc02).
- Photos pushed anywhere / shown anywhere: NO.
- Source names public: NO (this report + patches.html entry are anonymized;
  real names only in gitignored collect.config.json + dataset/SOURCES-local.md).
- robots.txt checked: YES (per source, in-code, disallow → skip).
- Rate limiting: YES (1.5–3 s jitter on every request, single-threaded).
- Paywalled sources: NONE.
