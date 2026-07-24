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
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { VOCAB, canonical, enumInt } from '../../web/js/vocab.gen.js';
import {
  pickGather, pickTiePlacement, pickCollar, pickBackOpening, pickHemSlit,
  pickRuffledStraps, pickPeplum, pickPocket, pickCuff, pickHemShape,
  pickPlacket, pickBackDetail, pickExposedZip, pickBardot,
} from '../../web/js/vision-bridge.js';
import { CONTRACT } from '../../web/js/contract.gen.js';
import { canonicalize } from './canonicalize.mjs';

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

const require2 = createRequire(import.meta.url);
const engine = await require2(join(root, 'engine', 'dist', 'stitchu-engine.js'))();

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

// ---- K1 TERM REGISTRY (2026-07-19): the DRAWN_SINCE regex list is RETIRED.
// Capability is now a DECLARATION in contract/terms.json: every construction
// word has an id, a status (drawable | honest), a capability and, for
// piece-adding constructions, an evidence pattern the drafted piece names must
// match. The counter looks a phrase up by EXACT normalized match (lowercase,
// trimmed, collapsed spaces) against canonical + synonyms. An unmatched phrase
// counts HONEST (never drawable by accident) and is reported in the UNMAPPED
// leak scan below — a regex can leak, a dictionary miss is visible.
const TERMS = JSON.parse(readFileSync(join(root, 'contract', 'terms.json'), 'utf8')).terms;
const normPhrase = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const TERM_BY_PHRASE = new Map();
for (const term of TERMS) {
  for (const p of [term.canonical, ...(term.synonyms || [])]) {
    TERM_BY_PHRASE.set(normPhrase(p), term);
  }
}
const UNMAPPED = new Map(); // phrase -> occurrence count (leak scan)
function termFor(phrase) {
  const t = TERM_BY_PHRASE.get(normPhrase(phrase));
  if (!t) UNMAPPED.set(phrase, (UNMAPPED.get(phrase) || 0) + 1);
  return t || null;
}
const isDrawable = (phrase) => {
  const t = termFor(phrase);
  return !!t && t.status === 'drawable';
};

// (The retired regex list lived here, 16 rules, benchmark-58.mjs:93-194 in the
// pre-K1 tree; verdict history preserved in git. Registry replaces it 1:1.)


// ---- 0.9 DRAFT-PROOF (2026-07-18): "FULL" is no longer a count, it is a
// measurement. A photo only counts FULL if the vision spec actually DRAFTS
// through the real engine and (1) a promised sleeve produces a Sleeve piece,
// (2) no classified field silently falls to a default in the mapping, (3) every
// element the classifier says is now-drawable leaves EVIDENCE in the drafted
// pieces. Anything that fails is PARTIAL — drafted, but not the photographed
// garment. ('puff' -> None once made a sleeveless dress count as FULL here.)
// K1: the vision-word -> engine-word translation is CONTRACT data
// (contract/tables.json mappings.sleeveHeadToSleeveCap), ints via the vocab.
const SLEEVE_CAP_MAP = Object.fromEntries(
  Object.entries(CONTRACT.mappings.sleeveHeadToSleeveCap)
    .map(([visionWord, engineWord]) => [visionWord, enumInt('sleeveCap', engineWord)]),
);

// Maps the vision spec to the engine spec with the SAME pick* bridge the web
// product uses (web/js/vision-bridge.js) — the counter scores the REAL chain,
// not a private copy of it.
function mapVisionSpec(seen, fieldMisses) {
  const str = (field, dflt) => {
    const v = seen[field];
    if (v === undefined || v === null || v === '') return dflt;
    const c = canonical(field, v) ?? canonical(field, String(v).toLowerCase());
    if (c === undefined) { fieldMisses.push(`${field}='${v}' has no engine mapping (would fall to '${dflt}')`); return dflt; }
    return c;
  };
  const o = {
    garment: str('garment', 'dress'),
    shaping: str('shaping', 'dart'),
    waistline: str('waistline', 'natural'),
    fabric: str('fabric', 'woven'),
    neckline: str('neckline', 'crew'),
    sleeveStyle: str('sleeveStyle', 'none'),
    sleeveLength: str('sleeveLength', 'short'),
    skirtStyle: str('skirtStyle', 'aLine'),
    skirtLength: str('skirtLength', 'midi'),
    topLength: str('topLength', 'hip'),
  };
  if (seen.sleeveHead) {
    const cap = SLEEVE_CAP_MAP[String(seen.sleeveHead).toLowerCase()];
    if (cap === undefined) fieldMisses.push(`sleeveHead='${seen.sleeveHead}' has no engine mapping`);
    else if (cap) { o.sleeveCap = cap; if (o.sleeveStyle === 'none' && cap !== 3) o.sleeveStyle = 'straight'; if (cap === 3) o.sleeveStyle = 'straight'; }
  }
  const iv = (field, name) => (name ? Math.max(0, enumInt(field, name)) : 0);
  o.tieClosure = iv('tieClosure', pickTiePlacement(seen));
  const collar = pickCollar(seen);
  if (collar) { o.collarType = iv('collarType', collar.type); o.collarEdge = iv('collarEdge', collar.edge); }
  const gather = pickGather(seen);
  if (gather) { o.gatherType = iv('gatherType', gather.type); o.gatherZone = iv('gatherZone', gather.zone); }
  o.backOpening = iv('backOpening', pickBackOpening(seen));
  o.backSlit = iv('backSlit', pickHemSlit(seen));
  if (o.sleeveStyle === 'none' && o.neckline !== 'halter') o.ruffledStraps = iv('ruffledStraps', pickRuffledStraps(seen));
  o.peplum = iv('peplum', pickPeplum(seen));
  o.pocketStyle = iv('pocketStyle', pickPocket(seen));
  if (o.sleeveStyle === 'straight') o.cuffStyle = iv('cuffStyle', pickCuff(seen));
  o.hemShape = iv('hemShape', pickHemShape(seen));
  const frontButtons = !!(seen.closure && ['buttons', 'placket'].includes(seen.closure.type));
  o.placketStyle = iv('placketStyle', pickPlacket(seen, frontButtons));
  if (!o.placketStyle && frontButtons) o.frontPlacket = true;
  o.backDetail = iv('backDetail', pickBackDetail(seen));
  o.exposedZip = iv('exposedZip', pickExposedZip(seen));
  if (o.shaping === 'dart' && o.neckline !== 'halter') o.bardotStyle = iv('bardotStyle', pickBardot(seen));
  return o;
}

// drawnNow phrase -> evidence expected in the drafted pieces. K1: the evidence
// pattern is the term's own declaration (contract/terms.json evidence field).
// Terms whose output is a marking/reshape (placket lines, hem shape, cowl
// remark, slits) declare evidence:null and pass on a clean draft; piece-adding
// terms must SHOW the piece.

function draftProof(entry, spec) {
  const fieldMisses = [];
  const mapped = mapVisionSpec(spec, fieldMisses);
  const body = { bust: 90, waist: 72, hip: 98, shoulder: 38, backLength: 40, armLength: 58, neck: 36 };
  let out;
  try {
    out = JSON.parse(engine.draftJSON(mapped, body));
  } catch (e) {
    return { ok: false, why: `engine threw: ${String(e).slice(0, 120)}` };
  }
  if (out.error) return { ok: false, why: `engine refused: ${out.error}` };
  if (out.issues && out.issues.length) return { ok: false, why: `validator blocked: ${out.issues[0]}` };
  const reasons = [...fieldMisses];
  const names = out.pattern.pieces.map((x) => x.name).join(' | ');
  // (1) a promised sleeve must be drawn
  if (mapped.sleeveStyle !== 'none' && !/sleeve/i.test(names)) reasons.push('sleeve promised but no Sleeve piece drafted');
  // (3) every now-drawable element must leave the evidence its term declares
  const drawnNow = (entry.oov || []).filter((t) => isDrawable(t));
  for (const phrase of drawnNow) {
    const term = termFor(phrase);
    if (term && term.evidence && !new RegExp(term.evidence, 'i').test(names)) {
      reasons.push(`'${phrase}' (${term.id}) counted drawable but no matching piece (pieces: ${names.slice(0, 90)})`);
    }
  }
  return reasons.length ? { ok: false, why: reasons.join('; ') } : { ok: true };
}

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
    let got = spec[field] === undefined ? null : spec[field];
    // Honest equivalence, not a measurement trick: contract data now
    // (contract/tables.json mappings.nullEquivalence) — for a declared field a
    // null reading and the declared value mean the SAME garment and draft
    // identically (sleeveStyle: no sleeve is no sleeve).
    const nullEq = CONTRACT.mappings.nullEquivalence[field];
    if (nullEq !== undefined && got === null && accepted.includes(nullEq)) got = nullEq;
    if (!accepted.includes(got)) misses.push(`${field}=${JSON.stringify(got)} not in ${JSON.stringify(accepted)}`);
  }
  if (misses.length) return { cls: 'WRONG', why: misses.join('; ') };
  const oovLeft = (entry.oov || []).filter((t) => !isDrawable(t));
  const drawnNow = (entry.oov || []).filter((t) => isDrawable(t));
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
// Reclassify cached entries against the CURRENT term registry (capability
// declarations move loop by loop; the cached spec is still valid, only the
// verdict moves).
let reclassified = 0;
for (const entry of MANIFEST.photos) {
  const r = results[entry.file];
  if (r && r.spec) {
    Object.assign(r, classify(entry, r.spec));
    r.clsOldMethod = r.cls; // the pre-0.9 counting method, published side by side
    if (r.cls === 'FULL') {
      const proof = draftProof(entry, r.spec);
      if (!proof.ok) { r.cls = 'PARTIAL'; r.why = `draft-proof failed: ${proof.why}`; }
    }
    reclassified += 1;
  }
}
// Persist the reclassified verdicts so a pure cache reclassify (0 live calls)
// still leaves a snapshot on disk — the summary and the file agree.
if (reclassified && existsSync(OUT)) writeFileSync(OUT, JSON.stringify(results, null, 1));
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
const oldFull = Object.values(results).filter((r) => r.clsOldMethod === 'FULL').length;
console.log(`\nFULL PATTERN (old method, pre-0.9 counting): ${oldFull}/${garmentTotal}`);
console.log(`FULL PATTERN (0.9 draft-proof: sleeve drawn + no silent field fall + element evidence): ${counts.FULL || 0}/${garmentTotal}   PARTIAL: ${counts.PARTIAL || 0}`);
console.log(`correct-reject: ${counts['REJECT-OK'] || 0}/${rejectTotal}`);

// VISION-ACCURACY (V0 taxonomy, 2026-07-16): the FULL count blames the ENGINE
// (clustered oov it can't draw), but the real brake is the VISION layer reading
// a garment's CRITICAL fields wrong. vision-accuracy = fraction of garment
// photos whose critical fields (neckline, shaping, silhouette, closure.type) all
// match the manifest — i.e. no vision misread on a field that changes the block.
// A photo is critical-clean when it is draftable AND none of its expect-misses
// land in a critical field. This is LOOP 2's before value. Independent of oov.
{
  const CRIT_FIELDS = new Set([
    'neckline', 'shaping', 'waistline', 'skirtStyle', 'length', 'topLength', 'closure',
  ]);
  let clean = 0, total = 0, necklineMiss = 0;
  for (const p of MANIFEST.photos) {
    if (p.category !== 'garment') continue;
    const r = results[p.file];
    if (!r || !r.spec) continue;
    total += 1;
    const spec = r.spec;
    if (!DRAFTABLE.includes(spec.garment)) continue; // real garment rejected = not clean
    let critBad = false;
    for (const [field, accepted] of Object.entries(p.expect || {})) {
      const got = spec[field] === undefined ? null : spec[field];
      if (!accepted.includes(got) && CRIT_FIELDS.has(field)) {
        critBad = true;
        if (field === 'neckline') necklineMiss += 1;
      }
    }
    if (!critBad) clean += 1;
  }
  console.log(`\n== VISION-ACCURACY (V0, critical-field clean) ==`);
  console.log(`vision-accuracy: ${clean}/${total} = ${(100 * clean / total).toFixed(1)}%   (neckline misreads: ${necklineMiss})`);
}

// ELEMENT ACCURACY (Metric Reform, 2026-07-16): the FULL-PATTERN count is the
// upper target but it is CLUSTERED — one photo with 3 missing items stays
// "not full" even when the engine adds one of them, so single-element loops
// look like they moved nothing. The daily compass is element-level accuracy:
// of EVERY out-of-vocab element across the set (with repeats = N), what
// fraction can the engine NOW draw (D)? This does not punish clustering and
// shows the engine's real progress loop by loop. K1: computed straight from
// the frozen manifest oov[] against the TERM REGISTRY (contract/terms.json) —
// zero vision calls, so it is stable and reclassify-friendly.
{
  let N = 0, D = 0;
  const remaining = {}; // remaining term id (or raw phrase) -> photo count
  for (const p of MANIFEST.photos) {
    if (p.category !== 'garment') continue;
    for (const t of (p.oov || [])) {
      N += 1;
      if (isDrawable(t)) D += 1;
      else {
        const term = termFor(t);
        const key = term ? `${term.id} (${t})` : t;
        remaining[key] = (remaining[key] || 0) + 1;
      }
    }
  }
  console.log('\n== ELEMENT ACCURACY (daily compass, term-ID base) ==');
  console.log(`engine now draws ${D}/${N} of all out-of-vocab elements (${(100 * D / N).toFixed(1)}%)`);
  const top = Object.entries(remaining).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('top still-missing elements (freq):');
  for (const [t, n] of top) console.log(`  ${String(n).padStart(2)}  ${t}`);
}

// K1 LEAK SCAN: a manifest phrase that resolves to NO registry term would fall
// honest silently — print it loudly instead. Green = empty.
{
  for (const p of MANIFEST.photos) for (const t of (p.oov || [])) termFor(t);
  console.log('\n== TERM REGISTRY LEAK SCAN (unmapped manifest phrases) ==');
  if (!UNMAPPED.size) console.log('0 unmapped — every 58-set oov phrase resolves to a term id');
  else for (const [t, n] of UNMAPPED) console.log(`  UNMAPPED x${n}: ${t}`);
}

// K1 SECOND NUMBER — FREQUENCY-WEIGHTED CORPUS COVERAGE. The 58-set says how
// the engine does on Damla's curated photos; this says how it does on the WILD
// corpus: over every oov occurrence in the mine-vocab label bank
// (dataset/labels/, local + gitignored), what share of occurrences is a
// DRAWABLE term? Occurrences that match no registry term count in the
// denominator (honest: unknown is not drawable). Published NEXT TO the 58-set
// number, never instead of it. Offline, zero calls.
{
  const LABELS_DIR = join(root, 'dataset', 'labels');
  if (!existsSync(LABELS_DIR)) {
    console.log('\n== FREQUENCY-WEIGHTED CORPUS COVERAGE ==\n(dataset/labels absent on this machine — metric needs the local label bank)');
  } else {
    const { readdirSync } = await import('node:fs');
    // Registry lookup on the canonicalized form too: bank phrasing varies, the
    // miner's canonicalizer collapses it, and we index every term phrase both raw
    // and canonicalized. Deterministic, no fuzzy matching.
    const CANON_INDEX = new Map();
    for (const term of TERMS) {
      for (const p of [term.canonical, ...(term.synonyms || [])]) {
        CANON_INDEX.set(canonicalize(p), term);
      }
    }
    let occ = 0, drawableOcc = 0, mappedOcc = 0, files = 0;
    const topDrawable = {}, topHonestMapped = {};
    for (const f of readdirSync(LABELS_DIR)) {
      if (!f.endsWith('.json')) continue;
      let rec;
      try { rec = JSON.parse(readFileSync(join(LABELS_DIR, f), 'utf8')); } catch { continue; }
      files += 1;
      for (const t of (rec.outOfVocab || [])) {
        occ += 1;
        const term = TERM_BY_PHRASE.get(normPhrase(t)) || CANON_INDEX.get(canonicalize(t)) || null;
        if (!term) continue;
        mappedOcc += 1;
        if (term.status === 'drawable') { drawableOcc += 1; topDrawable[term.id] = (topDrawable[term.id] || 0) + 1; }
        else topHonestMapped[term.id] = (topHonestMapped[term.id] || 0) + 1;
      }
    }
    console.log('\n== FREQUENCY-WEIGHTED CORPUS COVERAGE (second number, term-ID base) ==');
    console.log(`label bank: ${files} labels, ${occ} oov occurrences`);
    console.log(`drawable share of ALL occurrences: ${drawableOcc}/${occ} = ${(100 * drawableOcc / (occ || 1)).toFixed(1)}%`);
    console.log(`registry-mapped occurrences: ${mappedOcc}/${occ} = ${(100 * mappedOcc / (occ || 1)).toFixed(1)}% (unmapped counts as not drawable, honest)`);
    const fmt = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k}:${n}`).join('  ');
    console.log(`top drawable in the wild: ${fmt(topDrawable)}`);
    console.log(`top mapped-but-honest:    ${fmt(topHonestMapped)}`);
  }
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
