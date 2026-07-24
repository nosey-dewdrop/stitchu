#!/usr/bin/env node
// K5 eval-base candidate selector (local tool, data stays local — dataset/ is gitignored).
//
// Picks a LAYER-BALANCED set of 150 candidates for hand-labelling from the teacher
// label bank (dataset/labels/*.json). Balance targets the four cascade fields
// {garment, neckline, sleeveLength, skirtStyle}: a greedy pass always takes the photo
// whose field values are currently rarest in the picked set, so head/tail classes
// (halter, pleated, elbow...) are represented far above their corpus frequency.
//
// AMBAR YASASI filters (logged): suspect batch -> out, missing photo file -> out,
// all-four-fields-null -> out (nothing to hand-label for the cascade). A single null
// field does NOT exclude a photo (a top has no skirtStyle — that is honest).
//
// NOTE: the teacher's cached values are used ONLY for balancing the sample; they are
// NOT shown in the labelling tool (hand labels must be independent ground truth).
//
// Usage: node dataset/eval/select-candidates.mjs [--n 150]
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DATASET = join(here, '..');
const LABELS = join(DATASET, 'labels');
const FIELDS = ['garment', 'neckline', 'sleeveLength', 'skirtStyle'];
// Contract enums (visionReading layer). Teacher values OUTSIDE the enum (e.g. neckline
// "notched") are normalised to null for BALANCING — they would otherwise be treated as
// ultra-rare classes and greedily over-picked.
const ENUMS = {
  garment: ['skirt', 'dress', 'top', 'trousers', 'other'],
  neckline: ['crew', 'scoop', 'vNeck', 'square', 'boat', 'sweetheart', 'halter', 'cowl', 'pussyBow'],
  sleeveLength: ['short', 'elbow', 'long'],
  skirtStyle: ['aLine', 'straight', 'gathered', 'halfCircle', 'pleated'],
};
const NEGATIVE_QUOTA = 8; // garment "other"/"trousers" control photos (router must not misroute them)
const N = (() => { const i = process.argv.indexOf('--n'); return i > 0 ? parseInt(process.argv[i + 1]) : 150; })();

const suspectFile = join(LABELS, 'suspect-batches.json');
const suspect = existsSync(suspectFile) ? new Set(JSON.parse(readFileSync(suspectFile, 'utf8'))) : new Set();

const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const pools = readdirSync(DATASET, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'labels' && d.name !== 'eval')
  .map((d) => join(DATASET, d.name));
// one level deeper (dataset/openset/<brand>)
for (const p of [...pools]) {
  try {
    for (const d of readdirSync(p, { withFileTypes: true })) {
      if (d.isDirectory()) pools.push(join(p, d.name));
    }
  } catch { /* not a dir */ }
}
function findPhoto(brand, hash) {
  const ordered = [join(DATASET, brand || ''), ...pools];
  for (const dir of ordered) for (const e of EXTS) {
    const f = join(dir, hash + e);
    if (existsSync(f)) return f;
  }
  return null;
}

const stats = { seen: 0, kept: 0, suspect: 0, no_photo: 0, all_null: 0, no_spec: 0 };
const eligible = [];
for (const f of readdirSync(LABELS).filter((x) => x.endsWith('.json') && x !== 'suspect-batches.json').sort()) {
  let d;
  try { d = JSON.parse(readFileSync(join(LABELS, f), 'utf8')); } catch { continue; }
  stats.seen++;
  if (!d.spec) { stats.no_spec++; continue; }
  const batch = d.batch || d.teacherVersion;
  if (d.suspect || (batch && suspect.has(batch))) { stats.suspect++; continue; }
  const vals = FIELDS.map((k) => {
    const v = d.spec[k] ?? null;
    return ENUMS[k].includes(v) ? v : null; // out-of-enum -> null for balancing
  });
  if (vals.every((v) => v == null)) { stats.all_null++; continue; }
  const photo = findPhoto(d.brand, d.hash);
  if (!photo) { stats.no_photo++; continue; }
  eligible.push({ hash: d.hash, brand: d.brand, category: d.category || null,
    photo: photo.slice(DATASET.length + 1), teacher: Object.fromEntries(FIELDS.map((k, i) => [k, vals[i]])) });
  stats.kept++;
}

// Greedy balanced pick: score(photo) = sum over non-null fields of picked-count of that
// (field,value); always take the minimum score (rarest combination first). Deterministic
// (eligible sorted by hash, stable tie-break).
eligible.sort((a, b) => a.hash.localeCompare(b.hash));
const counts = {}; // "field:value" -> picked count
const picked = [];
const used = new Set();
// Fixed small quota of garment negatives (other/trousers): useful ONLY for the garment
// head; without a cap the greedy floods the set with them.
const negatives = eligible.filter((e) => e.teacher.garment === 'other' || e.teacher.garment === 'trousers');
for (const g of ['other', 'trousers']) {
  for (const e of negatives.filter((x) => x.teacher.garment === g).slice(0, NEGATIVE_QUOTA / 2)) {
    used.add(e.hash); picked.push(e);
    counts[`garment:${g}`] = (counts[`garment:${g}`] || 0) + 1;
  }
}
const mainPool = eligible.filter((e) => !used.has(e.hash) && e.teacher.garment !== 'other' && e.teacher.garment !== 'trousers');
while (picked.length < Math.min(N, eligible.length)) {
  let best = null; let bestScore = Infinity;
  for (const e of mainPool) {
    if (used.has(e.hash)) continue;
    let s = 0; let nonNull = 0;
    for (const f of FIELDS) {
      const v = e.teacher[f];
      if (v == null) continue;
      nonNull++;
      s += counts[`${f}:${v}`] || 0;
    }
    s = s / Math.max(nonNull, 1) - nonNull * 0.01; // prefer photos with more labelled fields
    if (s < bestScore) { bestScore = s; best = e; }
  }
  if (!best) break;
  used.add(best.hash);
  picked.push(best);
  for (const f of FIELDS) {
    const v = best.teacher[f];
    if (v != null) counts[`${f}:${v}`] = (counts[`${f}:${v}`] || 0) + 1;
  }
}

// Candidates file: hash + photo path + brand/category. Teacher values are kept in a
// SEPARATE sidecar (balance audit only) so the labelling tool cannot anchor on them.
writeFileSync(join(here, 'candidates.json'), JSON.stringify({
  _note: 'K5 eval-base candidates (hand-label targets). Teacher values intentionally NOT here.',
  date: new Date().toISOString().slice(0, 10),
  filter_stats: stats,
  count: picked.length,
  photos: picked.map(({ teacher, ...rest }) => rest),
}, null, 1));
writeFileSync(join(here, 'candidates-teacher-sidecar.json'), JSON.stringify({
  _note: 'Balance audit ONLY. Never show these during hand-labelling.',
  teacher: Object.fromEntries(picked.map((p) => [p.hash, p.teacher])),
}, null, 1));

const dist = {};
for (const f of FIELDS) {
  dist[f] = {};
  for (const p of picked) { const v = p.teacher[f] ?? 'null'; dist[f][v] = (dist[f][v] || 0) + 1; }
}
console.log('filter stats:', stats);
console.log(`picked ${picked.length}/${N}`);
for (const f of FIELDS) console.log(f, dist[f]);
console.log('wrote dataset/eval/candidates.json + candidates-teacher-sidecar.json');
