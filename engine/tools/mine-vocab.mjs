#!/usr/bin/env node
// mine-vocab.mjs — VOCAB MINING + LABEL WAREHOUSE (FAZ D / D2)
//
// Reads the local dataset/manifest.json (collected e-commerce product photos),
// runs each through the LIVE /api/analyze chain (same 1024px JPEG the web app
// sends, x-sb-bench bypass token, FAST tempo), and writes every response to
// dataset/labels/<hash>.json in AMBAR-YASASI (warehouse-law) form:
//   - all structural vision fields (spec)
//   - outOfVocab honesty channel
//   - workerVersion (teacher prompt version tag) + date
//   - per-field confidence: the vision schema has NO confidence field, so we do
//     NOT fabricate one. `confidence.reported` is left {} (empty) and we record
//     `confidence.source: "none-in-schema"`. Honest null > invented certainty.
//   - pool: "training" (product photos) | "couture" (runway/editorial)
//
// A label is a CACHE, not ground truth — the raw photo + source record is the
// asset. Every batch prints a HEALTH REPORT: N random human-labelled anchor
// photos from benchmark-58 run through the SAME teacher; agreement % is the
// batch's health stamp (low = batch suspect, do not train on it).
//
// Usage:
//   node engine/tools/mine-vocab.mjs                 # label every unlabelled brand-manifest photo
//   node engine/tools/mine-vocab.mjs --limit N       # cap to N new labels
//   node engine/tools/mine-vocab.mjs --openset       # label from the openset manifest instead,
//                                                     # category-BALANCED sampling (needs --limit)
//   node engine/tools/mine-vocab.mjs --pool couture  # tag this batch's pool
//   node engine/tools/mine-vocab.mjs --anchor [N]    # ONLY the health test (default 10)
//   node engine/tools/mine-vocab.mjs --aggregate     # rebuild dataset/vocab-frequency.md from labels
//
// The manifest.json is being WRITTEN by parallel collector agents — we NEVER
// write it; we copy it to /tmp and read the copy.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATASET = join(root, 'dataset');
const LABELS = join(DATASET, 'labels');
// HELD-OUT GUARD: never mine (=never label) a photo reserved for the term-end exam.
let HELDOUT = new Set();
try {
  const hm = JSON.parse(readFileSync(join(DATASET, 'heldout', 'manifest.json'), 'utf8'));
  HELDOUT = new Set((hm.photos || []).map((p) => p.hash || p));
} catch { /* no heldout set yet */ }
const API = 'https://stitchu-api.damummyphus.workers.dev/api/analyze';
const TOKEN_FILE = join(root, 'benchmark-58', '.benchmark-token');
const BENCH_TOKEN = existsSync(TOKEN_FILE) ? readFileSync(TOKEN_FILE, 'utf8').trim() : '';
const FAST = BENCH_TOKEN.length > 0;
// Teacher prompt version — bump when backend/worker.js vision prompt changes.
const WORKER_VERSION = 'v1-postV1';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d) => (has(f) ? args[args.indexOf(f) + 1] : d);
const limit = has('--limit') ? parseInt(val('--limit')) : Infinity;
const poolArg = val('--pool', 'training');
// Teacher model: default Opus. --teacher sonnet uses the cheaper vision teacher
// (worker honours x-sb-model ONLY on the bench-bypass path). Maps short names to
// the worker whitelist. teacherVersion in each label records the ACTUAL model.
const TEACHER_MAP = { opus: 'claude-opus-4-8', sonnet: 'claude-sonnet-4-6', haiku: 'claude-haiku-4-5' };
const teacherArg = val('--teacher', 'opus');
const TEACHER_MODEL = TEACHER_MAP[teacherArg] || teacherArg;
const WORKER_VERSION_TAGGED = `${WORKER_VERSION}+${TEACHER_MODEL}`;

if (!existsSync(LABELS)) mkdirSync(LABELS, { recursive: true });

function sh(cmd, argv, opts = {}) {
  return execFileSync(cmd, argv, { encoding: 'utf8', ...opts });
}
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

// Run one image file through the live chain; return {spec} or {error}.
function analyze(absPath) {
  const b64 = sh('base64', ['-i', absPath]).replace(/\n/g, '');
  const body = JSON.stringify({ image: b64, mediaType: 'image/jpeg' });
  const tmp = join('/tmp', '.mine-req.json');
  writeFileSync(tmp, body);
  const curlArgs = ['-s', '-m', '120', '-X', 'POST', API, '-H', 'content-type: application/json'];
  if (FAST) curlArgs.push('-H', `x-sb-bench: ${BENCH_TOKEN}`);
  // Model override rides the bench-bypass path only (worker ignores it otherwise).
  if (TEACHER_MODEL && TEACHER_MODEL !== 'claude-opus-4-8') curlArgs.push('-H', `x-sb-model: ${TEACHER_MODEL}`);
  curlArgs.push('--data', `@${tmp}`);
  const raw = sh('curl', curlArgs);
  let data;
  try { data = JSON.parse(raw); } catch { return { error: 'http_parse_fail', raw: raw.slice(0, 200) }; }
  if (data.error) return { error: data.error };
  const text = data?.content?.[0]?.text;
  if (!text) return { error: 'no_text' };
  try {
    return { spec: JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) };
  } catch { return { error: 'spec_parse_fail', text: text.slice(0, 200) }; }
}

// AMBAR-YASASI label record. The vision schema carries no confidence, so we do
// NOT invent one (a fabricated confidence would poison the warehouse worse than
// no confidence). We record that fact explicitly.
function labelRecord({ hash, brand, category, source, spec, pool }) {
  const { outOfVocab = [], ...structural } = spec;
  return {
    hash,
    brand,
    category,
    source,
    pool,
    workerVersion: WORKER_VERSION,
    teacherVersion: WORKER_VERSION_TAGGED, // AMBAR YASASI: records the ACTUAL model used
    teacherModel: TEACHER_MODEL,
    date: new Date().toISOString().slice(0, 10),
    spec: structural,
    outOfVocab,
    confidence: {
      source: 'none-in-schema',
      reported: {}, // schema has no per-field confidence — left empty, NOT fabricated
    },
  };
}

// ---- ANCHOR HEALTH TEST -----------------------------------------------------
// Run N random human-labelled benchmark-58 garment photos through the SAME
// teacher. For each labelled field, the teacher's value must be in the manifest's
// accepted array. Agreement % = correct-field / total-checked-field. This is the
// batch's health stamp.
function anchorTest(n) {
  const BENCH = join(root, 'benchmark-58');
  const man = JSON.parse(readFileSync(join(BENCH, 'manifest.json'), 'utf8'));
  const garments = man.photos.filter((p) => p.category === 'garment' && p.expect);
  // deterministic-ish random sample
  const shuffled = garments.map((p) => [Math.random(), p]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const sample = shuffled.slice(0, Math.min(n, shuffled.length));
  console.log(`\n== ANCHOR HEALTH TEST (${sample.length} human-labelled benchmark photos) — teacher: ${TEACHER_MODEL} ==`);
  let totalFields = 0, agreeFields = 0, photoOK = 0;
  for (let i = 0; i < sample.length; i++) {
    const entry = sample[i];
    if (i > 0) execFileSync('sleep', [FAST ? '1' : '21']);
    const res = analyze(join(BENCH, 'photos-1024', entry.file));
    if (res.error) { console.log(`  ${entry.name}: ERROR ${JSON.stringify(res.error).slice(0, 80)}`); continue; }
    const spec = res.spec;
    let pf = 0, pt = 0;
    for (const [field, accepted] of Object.entries(entry.expect)) {
      const got = spec[field] === undefined ? null : spec[field];
      pt += 1; totalFields += 1;
      if (accepted.includes(got)) { pf += 1; agreeFields += 1; }
    }
    if (pf === pt) photoOK += 1;
    console.log(`  ${String(pf).padStart(2)}/${String(pt).padEnd(2)} fields  ${entry.name}`);
  }
  const pct = totalFields ? (100 * agreeFields / totalFields) : 0;
  console.log(`\nANCHOR AGREEMENT: ${agreeFields}/${totalFields} fields = ${pct.toFixed(1)}%   (${photoOK}/${sample.length} photos fully clean)`);
  console.log(`HEALTH: ${pct >= 80 ? 'OK — batch trustworthy' : 'SUSPECT — mark batch not-for-training'}`);
  return pct;
}

// ---- CANONICALIZATION -------------------------------------------------------
// The teacher writes free-text oov terms, so the SAME construction detail arrives
// in many surface forms: "buttoned barrel cuffs" / "buttoned barrel cuff" /
// "buttoned cuffs" / "button cuffs" are one thing. We collapse them so the
// frequency table counts CONCEPTS, not phrasings. Two layers:
//   1. explicit override map dataset/vocab-canonical.json  { "surface form": "canonical key" }
//      (hand-curated; the surgeon's tool for genuine synonyms rules can't catch)
//   2. rule-based normalization (whitespace, hyphens, trailing-plural on the last
//      word, a few stem synonyms) — deterministic, applied when no override hits.
// K1 (2026-07-19): the implementation moved to canonicalize.mjs so the
// benchmark's frequency-weighted coverage metric normalizes with the SAME code.
import { canonicalize } from './canonicalize.mjs';

// ---- AGGREGATE: vocab-frequency.md ------------------------------------------
function aggregate() {
  const files = readdirSync(LABELS).filter((f) => f.endsWith('.json'));
  const oovFreq = {};      // canonical term -> {count, brands:Set, forms:Set}
  const fieldFreq = {};    // "field=value" -> count
  let totalLabels = 0, rawTermInstances = 0;
  const byBrand = {};
  for (const f of files) {
    const rec = JSON.parse(readFileSync(join(LABELS, f), 'utf8'));
    totalLabels += 1;
    byBrand[rec.brand] = (byBrand[rec.brand] || 0) + 1;
    for (const t of rec.outOfVocab || []) {
      const surface = t.trim().toLowerCase();
      const key = canonicalize(surface);
      rawTermInstances += 1;
      if (!oovFreq[key]) oovFreq[key] = { count: 0, brands: new Set(), forms: new Set() };
      oovFreq[key].count += 1;
      oovFreq[key].brands.add(rec.brand);
      oovFreq[key].forms.add(surface);
    }
    // structural field distribution (the fields that actually vary the block)
    for (const field of ['garment', 'neckline', 'sleeveStyle', 'skirtStyle', 'length', 'shaping', 'waistline', 'sleeveHead']) {
      const v = rec.spec?.[field];
      if (v === undefined) continue;
      const key = `${field}=${JSON.stringify(v)}`;
      fieldFreq[key] = (fieldFreq[key] || 0) + 1;
    }
  }
  const lines = [];
  lines.push('# vocab-frequency.md — market vocabulary map (AMBAR YASASI)');
  lines.push('');
  lines.push(`> Auto-generated by engine/tools/mine-vocab.mjs --aggregate. Source: dataset/labels/*.json (teacher ${WORKER_VERSION}). Labels are a CACHE, not ground truth.`);
  lines.push('> Terms are CANONICALIZED: synonym/plural surface forms merged (dataset/vocab-canonical.json overrides + rule normalizer). Source names kept local per the red lines.');
  lines.push('');
  const oovSorted = Object.entries(oovFreq).sort((a, b) => b[1].count - a[1].count);
  lines.push(`Total labels: ${totalLabels}  |  raw oov instances: ${rawTermInstances}  |  canonical terms: ${oovSorted.length}`);
  lines.push('');
  lines.push('## OUT-OF-VOCAB TERMS (the FAZ M compass — what the market wears that the fields cannot express)');
  lines.push('');
  lines.push('| canonical term | freq | surface forms merged |');
  lines.push('|------|-----:|--------|');
  for (const [term, d] of oovSorted) {
    const forms = d.forms.size > 1 ? d.forms.size : '';
    lines.push(`| ${term} | ${d.count} | ${forms} |`);
  }
  if (!oovSorted.length) lines.push('| _(none yet)_ | | |');
  lines.push('');
  lines.push('## STRUCTURAL FIELD DISTRIBUTION (what the in-vocab fields report across the market)');
  lines.push('');
  lines.push('| field=value | freq |');
  lines.push('|-------------|-----:|');
  for (const [k, n] of Object.entries(fieldFreq).sort((a, b) => b[1] - a[1])) lines.push(`| ${k} | ${n} |`);
  lines.push('');
  const out = join(DATASET, 'vocab-frequency.md');
  writeFileSync(out, lines.join('\n'));
  console.log(`aggregate: ${totalLabels} labels -> ${oovSorted.length} distinct oov terms. wrote ${out}`);
  console.log('\ntop 10 oov terms:');
  for (const [term, d] of oovSorted.slice(0, 10)) console.log(`  ${String(d.count).padStart(3)}  ${term}`);
}

// ---- MAIN -------------------------------------------------------------------
async function main() {
  if (has('--aggregate')) { aggregate(); return; }
  if (has('--anchor')) {
    const n = parseInt(val('--anchor', '10')) || 10;
    anchorTest(n);
    return;
  }

  const openset = has('--openset');
  let queue;
  if (openset) {
    // OPENSET RUN: read the SEPARATE openset manifest (set + category, no brand).
    // Path is dataset/openset/<set>/<hash>.jpg. Sample category-BALANCED so no
    // one garment type dominates the vocab map (dresses would otherwise swamp it).
    const srcMan = join(DATASET, 'openset', 'manifest.json');
    if (!existsSync(srcMan)) { console.error('no dataset/openset/manifest.json'); process.exit(1); }
    const manifest = JSON.parse(readFileSync(srcMan, 'utf8'));
    const unl = manifest.filter((m) => !HELDOUT.has(m.hash) && !existsSync(join(LABELS, `${m.hash}.json`)));
    // group by category, shuffle each, then round-robin draw until we hit the limit
    const byCat = {};
    for (const m of unl) { (byCat[m.category] = byCat[m.category] || []).push(m); }
    for (const c of Object.keys(byCat)) byCat[c].sort(() => Math.random() - 0.5);
    const cats = Object.keys(byCat).sort();
    queue = [];
    const cap = Number.isFinite(limit) ? limit : unl.length;
    let idx = 0;
    while (queue.length < cap) {
      let drewAny = false;
      for (const c of cats) {
        if (byCat[c][idx]) { queue.push(byCat[c][idx]); drewAny = true; if (queue.length >= cap) break; }
      }
      if (!drewAny) break;
      idx += 1;
    }
    const dist = {};
    for (const m of queue) dist[m.category] = (dist[m.category] || 0) + 1;
    console.log(`OPENSET manifest: ${manifest.length}, unlabelled: ${unl.length}, sampling (balanced): ${queue.length}, mode: ${FAST ? 'FAST' : 'SLOW'}, pool: ${poolArg}`);
    console.log(`  balance:`, dist);
  } else {
    // BRAND RUN. Copy the manifest (parallel collectors are writing it).
    const srcMan = join(DATASET, 'manifest.json');
    if (!existsSync(srcMan)) { console.error('no dataset/manifest.json'); process.exit(1); }
    const tmpMan = join('/tmp', `.mine-manifest-${Date.now()}.json`);
    copyFileSync(srcMan, tmpMan);
    const manifest = JSON.parse(readFileSync(tmpMan, 'utf8'));
    queue = manifest.filter((m) => !HELDOUT.has(m.hash) && !existsSync(join(LABELS, `${m.hash}.json`))).slice(0, limit);
    console.log(`dataset photos: ${manifest.length}, already labelled: ${manifest.length - queue.length}, running: ${queue.length}, mode: ${FAST ? 'FAST' : 'SLOW'}, pool: ${poolArg}`);
  }
  if (!FAST) console.warn('WARNING: no bench token — will hit the public rate-limit fuse.');

  let done = 0, errors = 0;
  for (let i = 0; i < queue.length; i++) {
    const m = queue[i];
    // resolve the image path: brand -> dataset/<brand>/<hash>.jpg ; openset -> dataset/openset/<set>/<hash>.jpg
    const img = openset
      ? join(DATASET, 'openset', m.set, `${m.hash}.jpg`)
      : join(DATASET, m.brand, `${m.hash}.jpg`);
    if (!existsSync(img)) { console.log(`  MISSING FILE ${openset ? 'openset/' + m.set : m.brand}/${m.hash}.jpg`); errors += 1; continue; }
    if (i > 0) await sleep(FAST ? 1000 : 21000);
    let res;
    for (let attempt = 0; attempt < 4; attempt++) {
      res = analyze(img);
      if (res.error && String(res.error).toLowerCase().includes('rate')) { await sleep(FAST ? 3000 : 45000); continue; }
      break;
    }
    if (res.error) {
      errors += 1;
      console.log(`${String(i + 1).padStart(3)}/${queue.length} ERROR  ${m.hash}  ${JSON.stringify(res.error).slice(0, 90)}`);
      continue;
    }
    const group = openset ? m.set : m.brand;
    const rec = labelRecord({ hash: m.hash, brand: group, category: m.category, source: m.source, spec: res.spec, pool: poolArg });
    writeFileSync(join(LABELS, `${m.hash}.json`), JSON.stringify(rec, null, 1));
    done += 1;
    const oov = (res.spec.outOfVocab || []).slice(0, 3).join(', ');
    console.log(`${String(i + 1).padStart(3)}/${queue.length} OK     ${m.hash} ${group}/${res.spec.garment}  oov:[${oov}]`);
  }
  console.log(`\nlabelled: ${done}, errors: ${errors}, total in warehouse: ${readdirSync(LABELS).filter((f) => f.endsWith('.json')).length}`);
}

main();
