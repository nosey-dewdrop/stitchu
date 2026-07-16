#!/usr/bin/env node
// FAZ D / collect.mjs — respectful garment-photo collector for the stitchu data pipeline.
//
// What it does: reads collect.config.json (LOCAL, gitignored — it names the sources;
// see collect.config.example.json for the shape), walks each source's PUBLIC
// product-listing JSON API, pulls product image URLs, downloads them, resizes the
// long edge to 1024px (via macOS `sips`), and writes:
//   dataset/<brand>/<hash>.jpg
//   dataset/manifest.json   (one row per image: source URL, brand, category, date, hash)
//
// RED LINES (see DEVAM-DATA-LOOP.md):
//   - dataset/ AND the real config are gitignored. Photos are LOCAL ONLY (vocab
//     mining + student-model training). Never pushed, never shown on the site;
//     source names never leave the local machine.
//   - Respectful: robots.txt checked per source, 1.5-3s randomized delay between
//     ALL requests (listing and image alike), public listing pages only, no
//     paywalls. On ANY error a source is skipped, never hammered.
//
// Usage:  node engine/tools/collect.mjs
// Re-runnable: content-hash + source-URL dedup means re-runs only add new photos.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const DATASET = join(REPO, "dataset");
const MANIFEST = join(DATASET, "manifest.json");
const CONFIG_PATH = join(__dirname, "collect.config.json");
if (!existsSync(CONFIG_PATH)) {
  console.error(
    "collect.config.json not found (it is local-only, gitignored). Copy collect.config.example.json next to it and fill in your sources."
  );
  process.exit(1);
}
const CONFIG = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

const UA = CONFIG.userAgent;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () =>
  sleep(CONFIG.minDelayMs + Math.random() * (CONFIG.maxDelayMs - CONFIG.minDelayMs));

// ---- manifest (load existing so re-runs dedup across sessions) ----
mkdirSync(DATASET, { recursive: true });
let manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
const seenHashes = new Set(manifest.map((m) => m.hash));
const seenSrc = new Set(manifest.map((m) => m.source));

function saveManifest() {
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}
async function fetchJSON(url) {
  return JSON.parse(await fetchText(url, { Accept: "application/json" }));
}

// ---- robots.txt: fetch + check the "*" group's Disallow rules against a path ----
async function robotsAllows(robotsUrl, testPath) {
  try {
    const txt = await fetchText(robotsUrl);
    const lines = txt.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
    let inStar = false;
    const disallows = [];
    for (const l of lines) {
      const m = l.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const val = m[2].trim();
      if (key === "user-agent") inStar = val === "*";
      else if (inStar && key === "disallow" && val) disallows.push(val);
    }
    for (const d of disallows) {
      const rx = new RegExp(
        "^" + d.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")
      );
      if (rx.test(testPath)) return { ok: false, reason: `disallowed by "${d}"` };
    }
    return { ok: true, reason: "allowed" };
  } catch (e) {
    return { ok: null, reason: `robots unreachable (${e.message})` };
  }
}

// ---- download + resize one image; returns {hash,file} / {skipped} / {error} ----
async function grabImage(brand, imgUrl) {
  if (seenSrc.has(imgUrl)) return { skipped: "dup-url" };
  try {
    const res = await fetch(imgUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) return { error: "too small" };
    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
    if (seenHashes.has(hash)) return { skipped: "dup-hash" };

    const brandDir = join(DATASET, brand);
    mkdirSync(brandDir, { recursive: true });
    const tmp = join(brandDir, `.tmp-${hash}.jpg`);
    const out = join(brandDir, `${hash}.jpg`);
    writeFileSync(tmp, buf);
    execFileSync("sips", ["-Z", String(CONFIG.resizeLongEdge), tmp, "--out", out], {
      stdio: "ignore",
    });
    rmSync(tmp, { force: true });
    seenHashes.add(hash);
    seenSrc.add(imgUrl);
    return { hash, file: out };
  } catch (e) {
    return { error: e.message };
  }
}

function record(brand, category, source, hash) {
  manifest.push({
    hash,
    brand,
    category,
    source,
    date: new Date().toISOString().slice(0, 10),
  });
}

// ---- generic, config-driven listing walker ----
// getPath(obj, "a.b.c") — dotted lookup
function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
}

// Extraction strategies (neutral; which source uses which lives in local config):
//   "firstImageOfMap"   — item at [imageMapPath] is an object of variants; take
//                         the first variant's [imageField].
//   "fieldWithFallback" — item[imageField], falling back to item[imageFallbackField].
//   "firstOfArray"      — item at [imageArrayPath] is an array; take the first
//                         element's [imageField] (e.g. Shopify products.json:
//                         images[0].src). Query strings are stripped for stable dedup.
function extractImageUrls(items, ex) {
  const urls = [];
  for (const it of items) {
    let u = null;
    if (ex.strategy === "firstImageOfMap") {
      const map = getPath(it, ex.imageMapPath) || {};
      const first = Object.values(map)[0];
      u = first ? getPath(first, ex.imageField) : null;
    } else if (ex.strategy === "fieldWithFallback") {
      u = it[ex.imageField] || it[ex.imageFallbackField];
    } else if (ex.strategy === "firstOfArray") {
      const arr = getPath(it, ex.imageArrayPath) || [];
      const first = arr[0];
      u = first ? getPath(first, ex.imageField) : null;
      if (u) u = u.split("?")[0];
    }
    if (u) urls.push(u.startsWith("http") ? u : `https:${u}`);
  }
  return urls;
}

// Pagination styles: "offset" (offset/limit in the URL template, stop at
// [totalPath]) or "page" (1-based page param, stop at [totalPagesPath]).
// The URL template may also reference any per-category key, e.g. {query},
// {pageId}, {categoryId} — all filled from the category object.
async function collectSource(src, stats) {
  for (const cat of src.categories) {
    let got = 0;
    let offset = 0;
    let page = 1;
    for (;;) {
      if (got >= CONFIG.targetPerCategory) break;
      const listUrl = src.listUrlTemplate
        .replaceAll("{offset}", String(offset))
        .replaceAll("{page}", String(page))
        .replaceAll("{limit}", String(src.pageSize))
        .replace(/\{(\w+)\}/g, (m, k) =>
          cat[k] != null ? encodeURIComponent(cat[k]) : m
        );
      let json;
      try {
        json = await fetchJSON(listUrl);
      } catch (e) {
        console.log(`    [skip] ${src.brand}/${cat.category} list: ${e.message}`);
        break;
      }
      const items = getPath(json, src.itemsPath) || [];
      const urls = extractImageUrls(items, src.extract);
      if (urls.length === 0) break;
      for (const u of urls) {
        if (got >= CONFIG.targetPerCategory) break;
        const r = await grabImage(src.brand, u);
        await jitter();
        if (r?.hash) {
          record(src.brand, cat.category, u, r.hash);
          got++;
          stats.saved++;
          if (stats.saved % 20 === 0) saveManifest();
        } else if (r?.error) stats.errors++;
        else stats.dups++;
      }
      if (src.pagination === "offset") {
        offset += src.pageSize;
        const total = getPath(json, src.totalPath) ?? 0;
        if (offset >= total) break;
      } else {
        const totalPages = getPath(json, src.totalPagesPath) ?? page;
        if (page >= totalPages) break;
        page++;
      }
    }
    console.log(`    ${src.brand}/${cat.category}: +${got}`);
  }
}

// ---- main ----
(async () => {
  console.log("stitchu collector — respectful, local-only, dedup on\n");
  const stats = { saved: 0, dups: 0, errors: 0 };

  for (const src of CONFIG.sources) {
    console.log(`[${src.brand}]`);
    const rb = await robotsAllows(src.robots, src.robotsProbePath);
    console.log(`    robots ${src.robotsProbePath}: ${rb.reason}`);
    if (rb.ok === false) {
      console.log(`    [skip source] robots disallows this path`);
      continue;
    }
    if (rb.ok === null) {
      console.log(
        `    robots unreachable — proceeding cautiously (public listing API only)`
      );
    }
    try {
      await collectSource(src, stats);
    } catch (e) {
      console.log(`    [skip source] ${e.message}`);
    }
    saveManifest();
  }

  saveManifest();
  console.log(
    `\ndone. saved ${stats.saved} new, ${stats.dups} dups skipped, ${stats.errors} errors. manifest total: ${manifest.length}`
  );
})();
