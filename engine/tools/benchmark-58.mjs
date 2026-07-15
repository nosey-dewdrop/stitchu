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
  const raw = sh('curl', ['-s', '-m', '120', '-X', 'POST', API,
    '-H', 'content-type: application/json', '--data', `@${tmp}`]);
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
  if ((entry.oov || []).length) return { cls: 'MISSING', why: `engine cannot draw: ${entry.oov.join(', ')}` };
  return { cls: 'FULL', why: 'in-vocab fields match, no out-of-vocab construction' };
}

const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const queue = MANIFEST.photos.filter((p) => !results[p.file]).slice(0, limit);
console.log(`photos: ${MANIFEST.photos.length}, already done: ${Object.keys(results).length}, running: ${queue.length}, ip: ${myIP}`);

// KV is eventually consistent: deletes take up to ~60s to reach the edge.
// So we stay under the 3/min fuse by pacing (>=21s/call) and clear the DAILY
// key every 8 calls, well before its 15 cap can be hit between resets.
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
let i = 0;
for (const entry of queue) {
  if (i % 8 === 0) resetFuse();
  if (i > 0) await sleep(21000);
  i += 1;
  let out;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const res = analyze(entry.file);
      if (res.error) {
        out = { cls: 'ERROR', why: JSON.stringify(res.error).slice(0, 200) };
        if (String(res.error).includes('Rate limit')) {
          resetFuse();
          await sleep(45000);
          continue;
        }
      } else {
        out = { ...classify(entry, res.spec), spec: res.spec };
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
console.log(`results: ${OUT}`);
