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
//   KONUM   terim bir yapı elemanının YERİNİ söylüyor ("at hip", "front neck",
//           "empire waist", "back") ama üretilen spec o yeri HİÇBİR alanında
//           taşımıyor -> spec'in yer ekseni yok. Serbest kanal (outOfVocab)
//           terimleri üstünde ölçülür, alan yargısıyla ÇAKIŞMAZ.
//
// Canlı çağrı ücretlidir ve worker 15/gün/IP sigortası var: her ham cevap
// vision/eval/live-<tarih>.json'a BANKALANIR, ikinci koşu bankadan okur.
//   node engine/tools/foto-spec-olcum.mjs [--limit N] [--offline] [--bank <yol>]
//   node engine/tools/foto-spec-olcum.mjs --v2 <okuma-dosyasi>   (v2 ifade edilebilirliği)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { VOCAB, canonical } from '../../web/js/vocab.gen.js';
import { ROOT, draft, anchorNames } from './spec-diff.mjs';

const API = 'https://stitchu-api.damummyphus.workers.dev/api/analyze';
const PHOTOS = join(ROOT, 'vision', 'eval', 'photos');
const LABELS = JSON.parse(readFileSync(join(ROOT, 'vision', 'eval', 'labels.json'), 'utf8'));
const RESOLUTION = JSON.parse(readFileSync(join(ROOT, 'contract', 'vocab-resolution-v1.json'), 'utf8'));

const argv = process.argv.slice(2);
const LIMIT = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 99;
const OFFLINE = argv.includes('--offline');
// --bank <yol>: bankayı AÇIKÇA seç. Varsayılan banka adı tarih damgalıdır
// (`live-<bugün>.json`), yani dünkü koşuyu bugün tekrar etmek imkânsızdı:
// --offline boş `FOTO 0` basıyordu. Sahte tarihli kopya bırakmak yerine bayrak.
const BANK = argv.includes('--bank')
  ? (argv[argv.indexOf('--bank') + 1].startsWith('/')
    ? argv[argv.indexOf('--bank') + 1]
    : join(ROOT, argv[argv.indexOf('--bank') + 1]))
  : join(ROOT, 'vision', 'eval', `live-${new Date().toISOString().slice(0, 10)}.json`);

const bank = existsSync(BANK) ? JSON.parse(readFileSync(BANK, 'utf8')) : {};
const files = Object.keys(LABELS).filter((k) => !k.startsWith('_'));

// ── --v2 <okuma-dosyasi>: v2 İFADE EDİLEBİLİRLİĞİ ───────────────────────────
// v2 sözleşmesinin KENDİ kuralı (topology._role): bir eksen değeri, `requires`
// listesindeki operatörlerden biri `shipped` DEĞİLSE ifade edilemez ve red o
// operatörün ADIYLA verilir. Burada uydurulan tek şey görü alanı -> eksen
// değeri eşlemesidir; kural sözleşmeden okunur.
// Sözleşmenin YOLU burada harf harf yazılmaz: üretilmiş eşleme kontratının
// `generatedFrom.v2` alanından gelir (spec-diff.mjs ile aynı tek kaynak).
if (argv.includes('--v2')) {
  const src = argv[argv.indexOf('--v2') + 1];
  const V2_PATH = JSON.parse(readFileSync(join(ROOT, 'contract', 'spec-v1-v2-map.json'), 'utf8')).generatedFrom.v2;
  const V2 = JSON.parse(readFileSync(join(ROOT, V2_PATH), 'utf8'));
  const ST = Object.fromEntries(Object.entries(V2.operators).map(([k, v]) => [k, v.status]));
  const TOPO = V2.topology;
  const reads = JSON.parse(readFileSync(src.startsWith('/') ? src : join(ROOT, src), 'utf8'));

  // görü alanı -> v2 eksen değeri. Karşılığı OLMAYAN okuma `null` döner ve
  // "enum'da yok" diye ayrı sayılır (operatör suçlanmaz).
  const GARMENT = { dress: 'sheathDress', top: 'top', skirt: 'skirt' };
  const SKIRT = { straight: 'straight', aLine: 'aLine', gathered: 'gathered', pleated: 'pleated' };
  const SLEEVE = { none: 'none', straight: 'setIn', balloon: 'puff', cap: 'cap' };
  const SUPPR = { dart: 'dart', princess: 'seamOnly' };

  const pad = (s2, n) => String(s2).padEnd(n);
  const rowsV2 = [];
  for (const [file, r] of Object.entries(reads)) {
    const axes = [];        // [eksen, okuma, v2 değeri|null]
    axes.push(['garment', r.garment, GARMENT[r.garment] ?? null]);
    const hasSkirt = r.garment === 'dress' || r.garment === 'skirt';
    if (hasSkirt && r.skirtStyle) axes.push(['skirtShape', r.skirtStyle, SKIRT[r.skirtStyle] ?? null]);
    if (r.garment !== 'skirt') {
      const sl = r.sleeveStyle ?? 'none';
      axes.push(['sleeve', sl, SLEEVE[sl] ?? null]);
    }
    if (r.shaping) axes.push(['suppression', r.shaping, SUPPR[r.shaping] ?? null]);
    axes.push(['collar', r.collar?.type ?? 'none', TOPO.collar.values[r.collar?.type ?? 'none'] ? (r.collar?.type ?? 'none') : null]);

    const blockers = [];    // operatör adıyla red
    const noEnum = [];      // eksen enum'unda karşılık yok
    for (const [ax, read, val] of axes) {
      if (val === null) { noEnum.push(`${ax}='${read}'`); continue; }
      for (const op of (TOPO[ax].values[val].requires || [])) {
        if (ST[op] !== 'shipped') blockers.push({ ax, read, val, op, st: ST[op] });
      }
    }
    rowsV2.push({ file, blockers, noEnum });
  }

  const N = rowsV2.length;
  const ok = rowsV2.filter((r) => !r.blockers.length && !r.noEnum.length).length;
  const byOp = {};
  for (const r of rowsV2) for (const o of new Set(r.blockers.map((b) => b.op))) byOp[o] = (byOp[o] || 0) + 1;
  const soleSleeve = rowsV2.filter((r) => !r.noEnum.length
    && r.blockers.length && new Set(r.blockers.map((b) => b.op)).size === 1
    && r.blockers[0].op === 'sleeve').length;
  const anySleeve = rowsV2.filter((r) => r.blockers.some((b) => b.op === 'sleeve')).length;

  const pc = (a, b) => (b ? (100 * a / b).toFixed(1) : '0.0');
  console.log(`v2 İFADE EDİLEBİLİRLİK · kaynak ${src} · sözleşme ${V2_PATH}@${V2.version}`);
  console.log(`FOTO ${N} · İFADE EDİLEBİLİR ${ok} (%${pc(ok, N)}) · DÜŞEN ${N - ok} (%${pc(N - ok, N)})`);
  console.log(`  'sleeve' absent yüzünden düşen (BAŞKA engeli olmayan): ${soleSleeve} (%${pc(soleSleeve, N)})`);
  console.log(`  'sleeve' engelinin GEÇTİĞİ foto (tek engel olmasa da): ${anySleeve} (%${pc(anySleeve, N)})`);
  console.log('OPERATÖR BAŞINA ENGEL (foto sayısı, çakışabilir):');
  for (const [o, c] of Object.entries(byOp).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pad(o, 24)} ${ST[o] === 'shipped' ? 'shipped' : ST[o].toUpperCase()}  ${c} foto (%${pc(c, N)})`);
  }
  const ne = {};
  for (const r of rowsV2) for (const x of r.noEnum) ne[x] = (ne[x] || 0) + 1;
  console.log('EKSEN ENUM\'UNDA KARŞILIĞI YOK (operatör suçlanmadı):');
  for (const [x, c] of Object.entries(ne).sort((a, b) => b[1] - a[1])) console.log(`  ${pad(x, 24)} ${c} foto`);
  console.log('ASSERT EDİLMEYEN EKSENLER: shoulder, closure — görü çıktısı bu ikisini okumuyor,');
  console.log('  bu yüzden yargılanmadı. shoulder=shoulderSeam FLAGGED olduğu için, okunabilseydi');
  console.log('  ifade edilebilir oran DÜŞERDİ (bu sayı bir TAVAN).');
  process.exit(0);
}

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

// ── İKİNCİ SİCİL: dataset/vocab-canonical.json ──────────────────────────────
// terms.json (K1) ile aynı soruyu ayrı bir sicile sorar. Bu dosya anahtar->
// kanonik terim eşlemesidir; hem anahtarlar hem değerler "bilinen" sayılır.
const VCANON = JSON.parse(readFileSync(join(ROOT, 'dataset', 'vocab-canonical.json'), 'utf8'));
const canonNames = new Set();
for (const [k, v] of Object.entries(VCANON)) {
  if (k.startsWith('_')) continue;
  canonNames.add(norm(k));
  canonNames.add(norm(v));
}
const canonKnown = (t) => canonNames.has(norm(t));

// ── KONUM SINIFI ────────────────────────────────────────────────────────────
// Tanım (V6-A kartı): terim bir yapı elemanının YERİNİ söylüyor ("at hip",
// "front neck", "empire waist", "back") ama üretilen spec o yeri HİÇBİR
// alanında taşımıyor. Konum ibaresi taşımayan terim bu sınıfa girmez.
const KONUM_WORDS = [
  'front', 'back', 'side', 'centre', 'center', 'left', 'right',
  'neck', 'neckline', 'shoulder', 'bust', 'chest', 'waist', 'empire',
  'hip', 'hem', 'underarm', 'armhole', 'armscye', 'cuff', 'sleeve',
  'bodice', 'skirt', 'yoke', 'upper', 'lower', 'high', 'low', 'drop',
  'dropped', 'natural', 'shoulder-to-shoulder',
];
function konumWords(term) {
  const toks = norm(term).split(/[^a-z]+/).filter(Boolean);
  return [...new Set(toks.filter((t) => KONUM_WORDS.includes(t)))];
}
// spec o yeri taşıyor mu: alan ADI ya da alan DEĞERİ o konum sözcüğünü içeriyorsa taşır.
// camelCase de ayrılır: 'vNeck' -> [v, neck], 'topLength' -> [top, length].
const words = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .toLowerCase().split(/[^a-z]+/).filter(Boolean);
function specCarries(spec, word) {
  for (const [k, v] of Object.entries(spec)) {
    if (words(k).includes(word) || words(v).includes(word)) return true;
  }
  return false;
}

// ── KONUM KAPASİTESİ: ÖNCE / SONRA ─────────────────────────────────────────
// ÖNCE: spec'in konumu ifade edebilmesinin TEK yolu, bir alan ADININ ya da
// DEĞERİNİN o sözcüğü tesadüfen taşımasıydı (specCarries). Çıpa ekseni YOKTU.
// SONRA: konumlu edit artık `anchor` (ÜRETİLMİŞ çıpa sözlüğünden bir AD) + `t`
// (0..1) ile ifade edilir. Bu ölçüm, 26 serbest terimin konum ibaresi
// taşıyanlarının kaçının ARTIK bir ÇIPAYLA karşılandığını sayar.
//
// İKİ SAYI BASILIR, çünkü eşlemenin bir kısmı BENİM:
//   SIKI  — konum sözcüğü bir çıpa ADININ içinde kelime olarak geçiyor
//           (backZone -> back, skirt.waist -> skirt/waist). Uydurma YOK.
//   İLANLI— artı aşağıda AÇIKÇA yazılmış eşanlamlılar. Tartışmaya açıktır.
const ANCHOR_SYNONYM = {
  front: 'cfZone', centre: 'cfZone', center: 'cfZone',   // cf = centre front
  neckline: 'neckZone',
  empire: 'waistZone', dropped: 'waistZone', drop: 'waistZone', natural: 'waistZone',
};
const anchorTokenIndex = () => {
  const idx = new Map();      // sözcük -> [çıpa adları]
  for (const ad of anchorNames()) {
    for (const t of ad.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-z]+/).filter(Boolean)) {
      if (t === 'zone') continue;
      if (!idx.has(t)) idx.set(t, []);
      idx.get(t).push(ad);
    }
  }
  return idx;
};

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
  const miss = { GORME: [], KELIME: [], MOTOR: [], KONUM: [] };
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

  const oov = seen.outOfVocab || [];
  const oovUnknown = oov.filter((t) => !termKnown(t));              // sicil 1: contract/terms.json
  const oovUnknown2 = oov.filter((t) => !canonKnown(t));            // sicil 2: dataset/vocab-canonical.json
  const oovUnknownBoth = oov.filter((t) => !termKnown(t) && !canonKnown(t));
  // KONUM: terim konum ibaresi taşıyor VE spec o konumu hiçbir alanda taşımıyor.
  const konum = [];
  for (const t of oov) {
    const ws = konumWords(t);
    if (!ws.length) continue;
    const missing = ws.filter((wd) => !specCarries(spec, wd));
    if (missing.length) konum.push(`${t} → konum '${missing.join(',')}' spec'te yok`);
  }
  miss.KONUM = konum;
  rows.push({
    file, judged, agree, miss,
    pieces: d.error ? 0 : d.pattern.pieces.length,
    oov, oovUnknown, oovUnknown2, oovUnknownBoth,
    oovKonumlu: oov.filter((t) => konumWords(t).length).length,
    spec,
  });
}

// ── tablo ───────────────────────────────────────────────────────────────────
const w = (s, n) => String(s).padEnd(n);
console.log(w('foto', 40), w('alan', 7), w('GORME', 7), w('KELIME', 7), w('MOTOR', 7), w('KONUM', 7), 'panel  oov(çözülmeyen)');
console.log('-'.repeat(130));
let J = 0, A = 0, G = 0, K = 0, M = 0, P = 0, tam = 0;
let oovAll = 0, oovUnk = 0, oovUnk2 = 0, oovUnkBoth = 0, oovKonumlu = 0;
for (const r of rows) {
  if (r.err) { console.log(w(r.file, 40), 'HATA', r.err); continue; }
  J += r.judged; A += r.agree;
  G += r.miss.GORME.length; K += r.miss.KELIME.length; M += r.miss.MOTOR.length;
  P += r.miss.KONUM.length;
  oovAll += r.oov.length; oovUnk += r.oovUnknown.length;
  oovUnk2 += r.oovUnknown2.length; oovUnkBoth += r.oovUnknownBoth.length;
  oovKonumlu += r.oovKonumlu;
  const clean = r.agree === r.judged && r.miss.MOTOR.length === 0;
  if (clean) tam++;
  console.log(w(r.file, 40), w(`${r.agree}/${r.judged}`, 7), w(r.miss.GORME.length, 7),
    w(r.miss.KELIME.length, 7), w(r.miss.MOTOR.length, 7), w(r.miss.KONUM.length, 7), w(r.pieces, 6),
    `${r.oovUnknown.length}/${r.oov.length}`);
}
console.log('-'.repeat(130));
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : '0.0');
console.log(`FOTO ${rows.filter((r) => !r.err).length} · TAM DOĞRU SPEC ${tam} (%${pct(tam, rows.filter((r) => !r.err).length)})`);
console.log(`ALAN YARGISI ${J} · tutan ${A} (%${pct(A, J)})`);
console.log(`HATA SINIFI: GORME ${G} (%${pct(G, G + K + M)}) · KELIME ${K} (%${pct(K, G + K + M)}) · MOTOR ${M} (%${pct(M, G + K + M)})`);
console.log(`KONUM (ayrı sınıf, alan yargısıyla ÇAKIŞMAZ — serbest kanal terimleri üstünde): ${P} / ${oovAll} terim (%${pct(P, oovAll)})`);
console.log(`  konum ibaresi TAŞIYAN terim: ${oovKonumlu}/${oovAll} (%${pct(oovKonumlu, oovAll)}) · bunların ${P}'i spec'te yer bulamıyor`);
console.log(`SERBEST KANAL (outOfVocab): ${oovAll} terim`);
console.log(`  SİCİL 1 contract/terms.json          : ${oovUnk}  YOK (%${pct(oovUnk, oovAll)})`);
console.log(`  SİCİL 2 dataset/vocab-canonical.json : ${oovUnk2} YOK (%${pct(oovUnk2, oovAll)})`);
console.log(`  İKİSİNDE DE YOK                      : ${oovUnkBoth} (%${pct(oovUnkBoth, oovAll)})`);
console.log(`banka: ${BANK}`);

// ── KONUM KAPASİTESİ ÖNCE/SONRA ────────────────────────────────────────────
{
  const idx = anchorTokenIndex();
  const anchors = anchorNames();
  const konumlu = [];   // {term, words, once, sonraSiki, sonraIlanli, cipa}
  for (const r of rows) {
    if (r.err) continue;
    for (const t of r.oov) {
      const ws = konumWords(t);
      if (!ws.length) continue;
      const per = ws.map((wd) => {
        const spec = r.spec && specCarries(r.spec, wd);
        const siki = idx.get(wd) || [];
        const ilanli = ANCHOR_SYNONYM[wd] && anchors.includes(ANCHOR_SYNONYM[wd]) ? [ANCHOR_SYNONYM[wd]] : [];
        return { wd, spec, siki, ilanli };
      });
      konumlu.push({
        term: t, words: ws, per,
        once: per.every((p) => p.spec),
        sonraSiki: per.every((p) => p.spec || p.siki.length),
        sonraIlanli: per.every((p) => p.spec || p.siki.length || p.ilanli.length),
      });
    }
  }
  const N = konumlu.length;
  const once = konumlu.filter((k) => k.once).length;
  const sSiki = konumlu.filter((k) => k.sonraSiki).length;
  const sIlan = konumlu.filter((k) => k.sonraIlanli).length;
  console.log('');
  console.log(`KONUM KAPASİTESİ (çıpa sözlüğü: ${anchors.length} çıpa, contract/anchors-v1.json)`);
  console.log(`  konum ibaresi taşıyan serbest terim (payda): ${N} / ${oovAll}`);
  console.log(`  ÖNCE  (yalnız spec alan adı/değeri tesadüfen taşıyor)   : ${once}/${N} (%${pct(once, N)})`);
  console.log(`  SONRA (SIKI: konum sözcüğü bir çıpa ADINDA kelime olarak): ${sSiki}/${N} (%${pct(sSiki, N)})`);
  console.log(`  SONRA (İLANLI: + bu dosyada açık yazılı eşanlamlılar)     : ${sIlan}/${N} (%${pct(sIlan, N)})`);
  console.log(`  İLANLI eşanlamlı tablosu: ${Object.entries(ANCHOR_SYNONYM).map(([a, b]) => `${a}->${b}`).join(', ')}`);
  const kalan = {};
  for (const k of konumlu) {
    if (k.sonraIlanli) continue;
    for (const p of k.per) if (!p.spec && !p.siki.length && !p.ilanli.length) kalan[p.wd] = (kalan[p.wd] || 0) + 1;
  }
  console.log(`  ÇIPASI OLMAYAN konum sözcükleri (kalan iş): ${Object.entries(kalan).sort((a, b) => b[1] - a[1]).map(([w2, c]) => `${w2}×${c}`).join(', ') || '-'}`);
  console.log('  terim terim:');
  for (const k of konumlu) {
    const dur = k.once ? 'ÖNCE+SONRA' : (k.sonraSiki ? 'SONRA(sıkı)' : (k.sonraIlanli ? 'SONRA(ilanlı)' : 'HÂLÂ YOK'));
    const cip = k.per.map((p) => `${p.wd}=${p.spec ? 'spec' : (p.siki[0] || p.ilanli[0] || '—')}`).join(' ');
    console.log(`    ${w(dur, 13)} ${w(k.term, 52)} ${cip}`);
  }
}
for (const r of rows) {
  if (r.err || (!r.miss.GORME.length && !r.miss.KELIME.length && !r.miss.MOTOR.length && !r.miss.KONUM.length)) continue;
  console.log(`\n${r.file}`);
  for (const k of ['GORME', 'KELIME', 'MOTOR', 'KONUM']) for (const m of r.miss[k]) console.log(`  ${k}  ${m}`);
}
