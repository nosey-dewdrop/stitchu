#!/usr/bin/env node
// BENCHMARK-58 Loop 0 measurement: runs every ground-truth photo through the
// LIVE chain (worker /api/analyze, same 1024px JPEG the web app sends) and
// classifies each result against benchmark-58/manifest.json:
//   FULL      spec matches the garment AND the garment has no out-of-vocab items
//   MISSING   spec matches but the garment has construction the engine cannot draw
//   WRONG     spec misreads the garment (or rejects a real garment)
//   REJECT-OK / REJECT-FAIL  the non-garment control photos
//
// The public analyze path is fused at 3/min + 15/day per IP (our own KV).
// For the benchmark run we reset our own counters via authed wrangler
// (operational, no code/deploy change). Usage:
//   node engine/tools/benchmark-58.mjs [--limit N] [--resume results.json]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PHOTOS = join(root, 'benchmark-58', 'photos-1024');
// Internal benchmark bypass token (Loop 1b): read from a gitignored local file.
// If present, the worker skips the rate-limit fuse for our calls and the run
// flies (no 21s pacing, no KV resets). If ABSENT, we fall back to the old slow
// path so the script never breaks in anyone else's hands.
const TOKEN_FILE = join(root, 'benchmark-58', '.benchmark-token');
const BENCH_TOKEN = existsSync(TOKEN_FILE) ? readFileSync(TOKEN_FILE, 'utf8').trim() : '';
const FAST = BENCH_TOKEN.length > 0;
const MANIFEST = JSON.parse(readFileSync(join(root, 'benchmark-58', 'manifest.json'), 'utf8'));
const OUT = join(root, 'benchmark-58', `results-${new Date().toISOString().slice(0, 10)}.json`);
const API = 'https://stitchu-api.damummyphus.workers.dev/api/analyze';
const KV_NS = '2927eef779f343eea0fea0bd348fde9e';
const BACKEND_DIR = join(root, 'backend');

const args = process.argv.slice(2);
const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : Infinity;

function sh(cmd, argv, opts = {}) {
  return execFileSync(cmd, argv, { encoding: 'utf8', ...opts });
}

const myIP = sh('curl', ['-s', 'https://api.ipify.org']).trim();

// Delete our own per-minute + per-day fuse counters so the run is not blocked.
function resetFuse() {
  const minute = Math.floor(Date.now() / 60000);
  const day = Math.floor(Date.now() / 86400000);
  for (const key of [`puban:${myIP}:${minute}`, `puban:${myIP}:${minute + 1}`, `pubanday:${myIP}:${day}`]) {
    try {
      sh('npx', ['wrangler', 'kv', 'key', 'delete', '--namespace-id', KV_NS, '--remote', key],
        { cwd: BACKEND_DIR, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch { /* key may not exist; fine */ }
  }
}

function analyze(file) {
  const b64 = sh('base64', ['-i', join(PHOTOS, file)]).replace(/\n/g, '');
  const body = JSON.stringify({ image: b64, mediaType: 'image/jpeg' });
  const tmp = join(root, 'benchmark-58', '.req.json');
  writeFileSync(tmp, body);
  const curlArgs = ['-s', '-m', '120', '-X', 'POST', API,
    '-H', 'content-type: application/json'];
  if (FAST) curlArgs.push('-H', `x-sb-bench: ${BENCH_TOKEN}`);
  curlArgs.push('--data', `@${tmp}`);
  const raw = sh('curl', curlArgs);
  const data = JSON.parse(raw);
  if (data.error) return { error: data.error };
  const text = data?.content?.[0]?.text;
  if (!text) return { error: 'no_text', raw: data };
  try {
    return { spec: JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) };
  } catch {
    return { error: 'parse_fail', text };
  }
}

// Same acceptance rule as web/js/analyze.js: skirt|dress|top proceeds, else rejected.
const DRAFTABLE = ['skirt', 'dress', 'top'];

// Engine vocabulary grows loop by loop: manifest oov terms the engine can NOW
// draw are filtered out (each drawing loop appends its rule; the manifest itself
// stays frozen ground truth). Module-scope so both classify() and the summary's
// element-accuracy metric share ONE source of truth.
const DRAWN_SINCE = [
  // loop 3: front button placket, grown-on stand — symmetric front only
  (t) => /placket|button front closure/i.test(t) && !/asymmetric|back|double|loop/i.test(t),
  // loop 4b: simple applied fabric ties / sash / bow / tie-back closure, drawn
  // as separate self-fabric strips + placement notch. A DRAWSTRING that
  // GATHERS the fabric (casing + shirring) is NOT drawn — it stays missing.
  (t) => /\btie\b|\bties\b|\bbow\b|\bsash\b|tie-?back/i.test(t) &&
         !/drawstring|gathered|shirr|smock/i.test(t),
  // loop 6: gathered / puff / puffed SLEEVE HEAD — the engine now raises +
  // widens the cap and gathers the crown. Only the sleeve HEAD, and only the
  // simple gather/puff. A "cap sleeve" is a SHORT-cap SHAPE (not a gathered
  // head) → NOT drawn. A "drawstring gathered sleeve" needs a casing/channel →
  // NOT drawn. Both of those stay honest/missing.
  (t) => /\bpuff(ed)?\b|gathered sleeve|puff sleeve|gathered.*sleeve head|puffed.*sleeve head|balloon shoulder|gigot/i.test(t) &&
         !/cap sleeve|drawstring|shirr|smock|casing|channel/i.test(t),
  // loop 7/8: the collar FAMILY — a separate collar piece, neck edge trued to
  // the neckline: stand / mock / mandarin / flat / peter-pan / shirt collars,
  // with a round / pointed / scalloped outer edge. A special FINISH the engine
  // does NOT draft stays missing: a bias-bound neckline (a bound raw edge, no
  // collar piece), a notched/sailor/lapel tailored collar. The phrase must name
  // a collar (so a non-collar oov term never matches).
  (t) => /collar/i.test(t) &&
         !/bias-?bound|bound neckline|notch|sailor|lapel/i.test(t),
];

function classify(entry, spec) {
  if (entry.category === 'reject') {
    return DRAFTABLE.includes(spec.garment)
      ? { cls: 'REJECT-FAIL', why: `chain thought this was a ${spec.garment}` }
      : { cls: 'REJECT-OK', why: `correctly refused (garment=${spec.garment})` };
  }
  if (!DRAFTABLE.includes(spec.garment)) {
    return { cls: 'WRONG', why: `real garment rejected (garment=${spec.garment})` };
  }
  const misses = [];
  for (const [field, accepted] of Object.entries(entry.expect || {})) {
    const got = spec[field] === undefined ? null : spec[field];
    if (!accepted.includes(got)) misses.push(`${field}=${JSON.stringify(got)} not in ${JSON.stringify(accepted)}`);
  }
  if (misses.length) return { cls: 'WRONG', why: misses.join('; ') };
  const oovLeft = (entry.oov || []).filter((t) => !DRAWN_SINCE.some((fn) => fn(t)));
  const drawnNow = (entry.oov || []).filter((t) => DRAWN_SINCE.some((fn) => fn(t)));
  if (oovLeft.length) return { cls: 'MISSING', why: `engine cannot draw: ${oovLeft.join(', ')}` };
  if (drawnNow.length) return { cls: 'FULL', why: `in-vocab + now-drawable: ${drawnNow.join(', ')}` };
  return { cls: 'FULL', why: 'in-vocab fields match, no out-of-vocab construction' };
}

// Loop 1 bridge metric: the FULL count does NOT move (engine still can't draw),
// so we measure the SCHEMA instead — for each ground-truth out-of-vocab element,
// did the new structured vision field capture it? Maps a manifest oov phrase to
// the structured field that should now carry it, then checks the returned spec.
const OOV_CATEGORY = [
  { re: /placket|button/i, field: 'closure', ok: (s) => s.closure && ['buttons', 'placket'].includes(s.closure.type) },
  { re: /tie-?back|back .*tie|tie .*back/i, field: 'backDetail', ok: (s) => s.backDetail === 'tieBack' || (s.closure && s.closure.type === 'ties') },
  { re: /open-?back|back .*cutout|cutout .*back/i, field: 'backDetail', ok: (s) => s.backDetail === 'openBack' },
  { re: /tie|bow|drawstring|lace-?up|laced/i, field: 'closure', ok: (s) => s.closure && ['ties', 'lace-up'].includes(s.closure.type) },
  { re: /collar/i, field: 'collar', ok: (s) => s.collar && s.collar.type && s.collar.type !== 'none' },
  { re: /cap sleeve/i, field: 'sleeveHead', ok: (s) => s.sleeveHead === 'capped' },
  { re: /yoke|shirr|smock/i, field: 'yoke', ok: (s) => s.yoke && s.yoke.type && s.yoke.type !== 'none' },
  { re: /ruffled strap/i, field: 'straps', ok: (s) => s.straps && s.straps.type === 'ruffled' },
  { re: /corset|cup|bustier/i, field: 'cupSeams', ok: (s) => s.cupSeams === true },
];

// Returns {expected, captured, viaOov} for a garment photo: how many of its
// ground-truth oov elements have a matching structured category, and of those
// how many the returned spec actually populated correctly. viaOov = whether the
// element also showed up in the honesty-channel outOfVocab[] array.
function structuralCoverage(entry, spec) {
  if (entry.category !== 'garment') return null;
  const oovList = entry.oov || [];
  let expected = 0, captured = 0, viaOov = 0;
  const oovText = (spec.outOfVocab || []).join(' | ').toLowerCase();
  const seen = new Set();
  for (const phrase of oovList) {
    const cat = OOV_CATEGORY.find((c) => c.re.test(phrase));
    if (!cat || seen.has(cat.field)) continue; // count each field once per photo
    seen.add(cat.field);
    expected += 1;
    if (cat.ok(spec)) captured += 1;
    const kw = phrase.toLowerCase().split(/[\s(/]+/).filter((w) => w.length > 3)[0] || '';
    if (kw && oovText.includes(kw)) viaOov += 1;
  }
  return { expected, captured, viaOov };
}

const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
// Reclassify cached entries against the CURRENT engine vocabulary (DRAWN_SINCE
// grows loop by loop; the cached spec is still valid, only the verdict moves).
for (const entry of MANIFEST.photos) {
  const r = results[entry.file];
  if (r && r.spec) Object.assign(r, classify(entry, r.spec));
}
const queue = MANIFEST.photos.filter((p) => !results[p.file]).slice(0, limit);
console.log(`photos: ${MANIFEST.photos.length}, already done: ${Object.keys(results).length}, running: ${queue.length}, ip: ${myIP}, mode: ${FAST ? 'FAST (bypass token)' : 'SLOW (21s/call fuse pacing)'}`);
const runStart = Date.now();

// KV is eventually consistent: deletes take up to ~60s to reach the edge.
// So we stay under the 3/min fuse by pacing (>=21s/call) and clear the DAILY
// key every 8 calls, well before its 15 cap can be hit between resets.
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
let i = 0;
for (const entry of queue) {
  if (!FAST && i % 8 === 0) resetFuse();
  if (i > 0) await sleep(FAST ? 250 : 21000);
  i += 1;
  let out;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const res = analyze(entry.file);
      if (res.error) {
        out = { cls: 'ERROR', why: JSON.stringify(res.error).slice(0, 200) };
        if (String(res.error).includes('Rate limit')) {
          // In FAST mode the token should never hit the fuse; if it somehow
          // does, don't spin on wrangler resets — just back off briefly.
          if (!FAST) resetFuse();
          await sleep(FAST ? 3000 : 45000);
          continue;
        }
      } else {
        out = { ...classify(entry, res.spec), spec: res.spec, coverage: structuralCoverage(entry, res.spec) };
      }
    } catch (err) {
      out = { cls: 'ERROR', why: String(err).slice(0, 200) };
    }
    break;
  }
  results[entry.file] = { category: entry.category, name: entry.name || entry.truth, ...out };
  writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(`${String(i).padStart(2)}/${queue.length} ${out.cls.padEnd(11)} ${entry.file}  ${out.why.slice(0, 110)}`);
}

// Summary
const counts = {};
for (const r of Object.values(results)) counts[r.cls] = (counts[r.cls] || 0) + 1;
const garmentTotal = MANIFEST.photos.filter((p) => p.category === 'garment').length;
const rejectTotal = MANIFEST.photos.filter((p) => p.category === 'reject').length;
console.log('\n== SUMMARY ==');
console.log(`garment photos: ${garmentTotal}  |  control (must-reject): ${rejectTotal}`);
for (const [cls, n] of Object.entries(counts).sort()) console.log(`${cls.padEnd(11)} ${n}`);
console.log(`\nFULL PATTERN: ${counts.FULL || 0}/${garmentTotal}   correct-reject: ${counts['REJECT-OK'] || 0}/${rejectTotal}`);

// ELEMENT ACCURACY (Metric Reform, 2026-07-16): the FULL-PATTERN count is the
// upper target but it is CLUSTERED — one photo with 3 missing items stays
// "not full" even when the engine adds one of them, so single-element loops
// look like they moved nothing. The daily compass is element-level accuracy:
// of EVERY out-of-vocab element across the set (with repeats = N), what
// fraction can the engine NOW draw (D)? This does not punish clustering and
// shows the engine's real progress loop by loop. Computed straight from the
// frozen manifest oov[] against the same DRAWN_SINCE filter used above — zero
// vision calls, so it is stable and reclassify-friendly.
{
  let N = 0, D = 0;
  const remaining = {}; // canonical-ish remaining term -> photo count
  for (const p of MANIFEST.photos) {
    if (p.category !== 'garment') continue;
    for (const t of (p.oov || [])) {
      N += 1;
      if (DRAWN_SINCE.some((fn) => fn(t))) D += 1;
      else remaining[t] = (remaining[t] || 0) + 1;
    }
  }
  console.log('\n== ELEMENT ACCURACY (daily compass) ==');
  console.log(`engine now draws ${D}/${N} of all out-of-vocab elements (${(100 * D / N).toFixed(1)}%)`);
  const top = Object.entries(remaining).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('top still-missing elements (freq):');
  for (const [t, n] of top) console.log(`  ${String(n).padStart(2)}  ${t}`);
}

// Loop 1 SCHEMA-BRIDGE metric: how many out-of-vocab construction elements the
// new structured fields captured. This is the number that should MOVE this loop
// (FULL does not, since the engine still cannot draw). Also reports photos where
// EVERY category element was captured.
let exp = 0, cap = 0, oov = 0, photosPerfect = 0, photosWithCat = 0;
for (const r of Object.values(results)) {
  if (!r.coverage) continue;
  const c = r.coverage;
  if (c.expected === 0) continue;
  photosWithCat += 1;
  exp += c.expected; cap += c.captured; oov += c.viaOov;
  if (c.captured === c.expected) photosPerfect += 1;
}
console.log(`\n== SCHEMA BRIDGE (Loop 1) ==`);
console.log(`structured fields captured: ${cap}/${exp} out-of-vocab elements (${photosWithCat} photos have a mappable element)`);
console.log(`photos where EVERY mappable element was captured: ${photosPerfect}/${photosWithCat}`);
console.log(`also named in outOfVocab[] honesty channel: ${oov}/${exp}`);
const elapsedS = Math.round((Date.now() - runStart) / 1000);
console.log(`\nrun time: ${Math.floor(elapsedS / 60)}m ${elapsedS % 60}s over ${queue.length} calls (${FAST ? 'FAST' : 'SLOW'} mode)`);
console.log(`results: ${OUT}`);
