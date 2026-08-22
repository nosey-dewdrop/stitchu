// foto-spec-olcum.mjs — F-I ÖLÇÜMÜ: BUGÜN KAÇ FOTO DOĞRU SPEC'E İNİYOR?
//
// F-I kartı: "ÖNCE ÖLÇ (uydurma yok). Hata sınıfı: görme mi · kelime listesi mi
// · motor mu? SAYIYLA."
//
// Zincir baştan sona koşulur, hiçbir halkası taklit edilmez:
//   foto -> CANLI worker (/api/analyze) -> `seen`
//        -> vision-bridge pick* + create.js host kapıları -> spec
//        -> engine draftJSON -> kalıp
//   ve `seen` GÖZ ETİKETİYLE (vision/eval/labels.json) karşılaştırılır.
//
// HATA SINIFLARI (bir eksik ancak TEK sınıfa yazılır, çift sayım yok):
//   GORME   göz etiketi de tahmin de kapalı listede, ama tutmuyorlar -> vision yanıldı
//   KELIME  gözün gördüğü kelime motorun sözlüğünde YOK (contract/primitives-v1 +
//           vocab-resolution-v1 ile de çözülmüyor) -> kapalı liste dar
//   MOTOR   spec geçerli ama motor çizmeyi reddediyor / kalıp doğmuyor -> motor
//
// Canlı çağrı ücretlidir ve worker 15/gün/IP sigortası var: her ham cevap
// vision/eval/live-<tarih>.json'a BANKALANIR, ikinci koşu bankadan okur.
//   node engine/tools/foto-spec-olcum.mjs [--limit N] [--offline]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { VOCAB, canonical } from '../../web/js/vocab.gen.js';
import { ROOT, draft } from './spec-diff.mjs';

const API = 'https://stitchu-api.damummyphus.workers.dev/api/analyze';
const PHOTOS = join(ROOT, 'vision', 'eval', 'photos');
const LABELS = JSON.parse(readFileSync(join(ROOT, 'vision', 'eval', 'labels.json'), 'utf8'));
const BANK = join(ROOT, 'vision', 'eval', `live-${new Date().toISOString().slice(0, 10)}.json`);
const RESOLUTION = JSON.parse(readFileSync(join(ROOT, 'contract', 'vocab-resolution-v1.json'), 'utf8'));

const argv = process.argv.slice(2);
const LIMIT = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 99;
const OFFLINE = argv.includes('--offline');

const bank = existsSync(BANK) ? JSON.parse(readFileSync(BANK, 'utf8')) : {};
const files = Object.keys(LABELS).filter((k) => !k.startsWith('_'));

// ── canlı okuma (bankalı) ───────────────────────────────────────────────────
function readPhoto(file) {
  if (bank[file]) return bank[file];
  if (OFFLINE) return null;
  const b64 = execFileSync('base64', ['-i', join(PHOTOS, file)], { encoding: 'utf8', maxBuffer: 64 << 20 }).replace(/\n/g, '');
  writeFileSync('/tmp/foto-spec-req.json', JSON.stringify({ image: b64, mediaType: 'image/jpeg' }));
  const raw = execFileSync('curl', ['-s', '-m', '120', '-X', 'POST', API,
    '-H', 'content-type: application/json', '--data', '@/tmp/foto-spec-req.json'],
  { encoding: 'utf8', maxBuffer: 16 << 20 });
  let seen = null;
  try {
    const text = JSON.parse(raw).content[0].text;
    seen = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch { return { _error: raw.slice(0, 160) }; }
  bank[file] = seen;
  writeFileSync(BANK, JSON.stringify(bank, null, 1));
  return seen;
}

// ── kapalı liste: kelime motorun sözlüğünde var mı ──────────────────────────
// Sözlük = web/js/vocab.gen.js (engine/vocab.json'dan üretilir). "Mutfak"
// (contract/primitives-v1 + vocab-resolution-v1) bir sunum adını primitiflere
// çözüyorsa o da SAYILIR — F-I: "görü dili artık bundan üretilir".
// vocab-resolution-v1.json anahtarları "alan.deger" biçiminde (132 preset).
const resolvedKeys = new Set(
  Object.keys(RESOLUTION.resolutions || {}).map((k) => k.toLowerCase()),
);
function inVocab(field, value) {
  if (value === null || value === undefined) return true;   // "görünmüyor" hata değil
  if (typeof value === 'boolean') return true;
  if (VOCAB[field] && canonical(field, value) !== undefined) return true;
  return resolvedKeys.has(`${field}.${value}`.toLowerCase());
}

// Serbest kanal (outOfVocab) kaydı = contract/terms.json (K1 term sicili):
// canonical + synonyms tam eşleşme, benchmark-58'in kullandığı kuralın aynısı.
const TERMS = JSON.parse(readFileSync(join(ROOT, 'contract', 'terms.json'), 'utf8'));
const termNames = new Set();
for (const t of TERMS.terms) {
  termNames.add(t.canonical.toLowerCase());
  for (const sy of (t.synonyms || [])) termNames.add(String(sy).toLowerCase());
}
const norm = (s) => String(s).toLowerCase().trim().replace(/\s+/g, ' ');
const termKnown = (t) => termNames.has(norm(t));

// göz etiketinin alanları (labels.json'un yazdığı 12 alan); `length` -> skirtLength.
const FIELD_MAP = {
  garment: 'garment', neckline: 'neckline', sleeveStyle: 'sleeveStyle',
  sleeveLength: 'sleeveLength', skirtStyle: 'skirtStyle', length: 'skirtLength',
  topLength: 'topLength', shaping: 'shaping', waistline: 'waistline',
  fabric: 'fabric', hemRuffle: 'ruffle', keyhole: 'keyhole',
};

const SPEC_DEFAULTS = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  shoulderStyle: 'set', sleeveCap: 'plain', edgeFinish: 'biasBinding',
  hemShape: 'straight', collarEdge: 'round', gatherZone: 'neckline',
};

const rows = [];
let used = 0;
for (const file of files) {
  if (used >= LIMIT && !bank[file]) continue;
  const seen = readPhoto(file);
  if (!seen) continue;
  if (!bank[file]) { /* hata */ }
  if (seen._error) { rows.push({ file, err: seen._error }); continue; }
  if (!bank[file]) used++; else if (!OFFLINE) used += 0;
  const label = LABELS[file];
  const miss = { GORME: [], KELIME: [], MOTOR: [] };
  let judged = 0, agree = 0;

  for (const [lf, sf] of Object.entries(FIELD_MAP)) {
    const want = label[lf];
    if (want === null || want === undefined) continue;     // göz "görünmüyor" dedi
    judged++;
    const got = seen[lf];
    const same = String(got) === String(want) ||
      (lf === 'hemRuffle' && String(got ?? 'none') === String(want));
    if (same) { agree++; continue; }
    if (!inVocab(sf, want)) miss.KELIME.push(`${lf}: göz '${want}' sözlükte yok`);
    else miss.GORME.push(`${lf}: göz '${want}' / vision '${got}'`);
  }

  // spec'i kur ve motoru koştur (temel alanlar; yapısal alanlar missing-olcum'da)
  const spec = { ...SPEC_DEFAULTS };
  for (const [lf, sf] of Object.entries(FIELD_MAP)) {
    const v = seen[lf];
    if (v === null || v === undefined) continue;
    if (sf === 'keyhole') { spec.keyhole = v ? 'keyhole' : 'none'; continue; }
    if (canonical(sf, v) !== undefined) spec[sf] = canonical(sf, v);
  }
  if (spec.garment === 'skirt') { spec.sleeveStyle = 'none'; spec.neckline = 'crew'; }
  const d = await draft(spec);
  if (d.error) miss.MOTOR.push(`motor reddetti: ${d.error}`);
  else if (d.issues && d.issues.length) miss.MOTOR.push(`validator: ${d.issues[0]}`);

  const oovUnknown = (seen.outOfVocab || []).filter((t) => !termKnown(t));
  rows.push({
    file, judged, agree, miss,
    pieces: d.error ? 0 : d.pattern.pieces.length,
    oov: seen.outOfVocab || [], oovUnknown,
  });
}

// ── tablo ───────────────────────────────────────────────────────────────────
const w = (s, n) => String(s).padEnd(n);
console.log(w('foto', 40), w('alan', 7), w('GORME', 7), w('KELIME', 7), w('MOTOR', 7), 'panel  oov(çözülmeyen)');
console.log('-'.repeat(120));
let J = 0, A = 0, G = 0, K = 0, M = 0, tam = 0, oovAll = 0, oovUnk = 0;
for (const r of rows) {
  if (r.err) { console.log(w(r.file, 40), 'HATA', r.err); continue; }
  J += r.judged; A += r.agree;
  G += r.miss.GORME.length; K += r.miss.KELIME.length; M += r.miss.MOTOR.length;
  oovAll += r.oov.length; oovUnk += r.oovUnknown.length;
  const clean = r.agree === r.judged && r.miss.MOTOR.length === 0;
  if (clean) tam++;
  console.log(w(r.file, 40), w(`${r.agree}/${r.judged}`, 7), w(r.miss.GORME.length, 7),
    w(r.miss.KELIME.length, 7), w(r.miss.MOTOR.length, 7), w(r.pieces, 6),
    `${r.oovUnknown.length}/${r.oov.length}`);
}
console.log('-'.repeat(120));
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : '0.0');
console.log(`FOTO ${rows.filter((r) => !r.err).length} · TAM DOĞRU SPEC ${tam} (%${pct(tam, rows.filter((r) => !r.err).length)})`);
console.log(`ALAN YARGISI ${J} · tutan ${A} (%${pct(A, J)})`);
console.log(`HATA SINIFI: GORME ${G} (%${pct(G, G + K + M)}) · KELIME ${K} (%${pct(K, G + K + M)}) · MOTOR ${M} (%${pct(M, G + K + M)})`);
console.log(`SERBEST KANAL (outOfVocab): ${oovAll} terim, ${oovUnk} tanesi terim sicilinde YOK (%${pct(oovUnk, oovAll)})`);
console.log(`banka: ${BANK}`);
for (const r of rows) {
  if (r.err || (!r.miss.GORME.length && !r.miss.KELIME.length && !r.miss.MOTOR.length)) continue;
  console.log(`\n${r.file}`);
  for (const k of ['GORME', 'KELIME', 'MOTOR']) for (const m of r.miss[k]) console.log(`  ${k}  ${m}`);
}
