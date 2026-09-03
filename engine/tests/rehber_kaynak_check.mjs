#!/usr/bin/env node
// rehber_kaynak_check.mjs — KAPI (M5-rehber, 2026-09-03).
//
// Damla, madde 10: "sadece kalıp ve flat alıp gitmeyecekler; rehber, püf
// noktalar da bulunacak. bir terzilik hesabı bunlar."
//
// F9 shipped a Turkish guide. This gate is about the three things it did NOT
// have, and about one thing it was quietly lying about.
//
// ⚠ THE LIE THIS GATE EXISTS TO STOP. Before M5 the printed Turkish guide wrote
// its OWN needle paragraph, and for every woven it printed:
//     "KAYNAK-YOK: bu kumaş için yayınlanmış bir iğne/dikiş ölçümü repodaki
//      hiçbir katalogda yok."
// The engine's `sew.needle` advice existed at that moment, carried a source,
// and was rendered on the result SCREEN. The page the buyer takes to the
// machine simply never printed a single engine advice. So the product told the
// buyer "we don't know" about something the engine knew — and no gate could
// see it, because guide_completeness_check only ever looked at the C++ side.
// This gate looks at the PAGE.
//
// SIX LEGS
//   1  THE PAGE PRINTS THE ENGINE'S ADVICE. Every advice the engine emitted is
//      on the page, and every advice paragraph on the page carries a source /
//      basis line under it. kayıtsız cümle = 0.
//   2  EVERY PRINTED NUMBER IS ACCOUNTED FOR, on the PAGE, in Turkish: it is
//      either a number this draft computed (in the advice's own basis) or a
//      number the cited row of contract/guide-sources.json is registered as
//      carrying. Same law as guide_completeness_check leg 4, applied to the
//      rendered bytes instead of the C++ string.
//   3  THE ADVICE FOLLOWS THE BOLT. All five shipped fabrics get a DIFFERENT
//      needle+stitch answer. (Different SENTENCES: three of the five are light
//      wovens and the published chart bands them together, so they share a
//      needle NUMBER. That is what the chart says and the engine prints it —
//      leg 3b measures how many distinct numbers there are and reports it
//      rather than demanding five.)
//   4  ÜÇ ZOR NOKTA, SAYILI. At least three `zor.*` advices, each carrying at
//      least two measured numbers, and each of those numbers on the page.
//   5  BEDEN SERİSİ PAKETTE. The package carries the chosen size AND its
//      neighbours, drafted by the engine's own gradeJSON, printed as a layer
//      table in the guide.
//   6  THE PACKAGE IS WHOLE. Pattern PDF (A4 + A0), flat SVG, guide, cut plan,
//      size run — the files a buyer pays for, produced in this run.
//
// SIFIR API ÇAĞRISI. Everything comes from the shipped wasm and the shipped
// pure builders. PAKET_DIR (env) also writes the package to that directory —
// that is how KOSU/ciktilar/paket-02 is produced.

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} };

const { patternA4Pdf, patternA0Pdf, flatSVG } = await import(join(ROOT, 'web/js/download.js'));
const { rehberHTML, basisAyristir } = await import(join(ROOT, 'web/lib/rehber-tr.js'));
const { FABRIC_CATALOG } = await import(join(ROOT, 'web/js/fabric-catalog.js'));
const { engineSpec, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));
const KOKEN = await import(join(ROOT, 'web/js/provenance.js'));

const OUT = join(ROOT, 'Logs', 'rehber-kaynak');
mkdirSync(OUT, { recursive: true });
const PAKET = process.env.PAKET_DIR ? join(ROOT, process.env.PAKET_DIR) : null;
if (PAKET) mkdirSync(PAKET, { recursive: true });

const fails = [];
const note = [];
const check = (name, cond, detail) => {
  (cond ? note : fails).push(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  return cond;
};

// ── the registry, and the numbers each row is allowed to put on a page ───────
const REGISTRY = JSON.parse(readFileSync(join(ROOT, 'contract/guide-sources.json'), 'utf8'));
function registeredValues(id) {
  const row = REGISTRY.sources[id];
  return new Set(row && Array.isArray(row.values) ? row.values : []);
}
// Numeric tokens as a HUMAN reads them off the page: 10, 1.5, 1.01.01, 80.
// Same reader guide_completeness_check.cpp uses, so the two gates agree on what
// "a number on the page" means.
function numbersIn(s) {
  return String(s).match(/\d+(?:\.\d+)*/g) || [];
}
const stripTags = (h) => String(h)
  .replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ── the design the package is built from ────────────────────────────────────
const BEDEN = 'EU38';
const KOMSU = 3;                 // Damla madde 10: seçilen bedenin ±3 komşusu
const BASE_SPEC = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'straight', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  shoulderStyle: 'set', sleeveCap: 'plain', edgeFinish: 'biasBinding',
  hemShape: 'straight', collarEdge: 'round', gatherZone: 'neckline',
};
const guideData = JSON.parse(readFileSync(join(ROOT, 'web/data/sewing-guide.json'), 'utf8'));

function draftFor(fabricId, sizeLabel) {
  const spec = { ...BASE_SPEC, fabricPreset: fabricId };
  const m = bodyForSize(sizeLabel);
  const d = JSON.parse(engine.draftJSON(engineSpec(spec), {
    bust: m.bust, waist: m.waist, hip: m.hip, shoulder: m.shoulder,
    backLength: m.backLength, armLength: m.armLength, neck: m.neck,
    upperBust: m.upperBust || 0,
  }));
  return { spec, body: m, drafted: d };
}

// ── LEG 1 + 2 + 3 + 4, over all five shipped bolts ──────────────────────────
const FABRICS = Object.keys(FABRIC_CATALOG);
check('katalogdaki beş kumaşın beşi de sınanıyor', FABRICS.length === 5, FABRICS.join(', '));

const igneCumleleri = new Map();     // fabricId -> the rendered needle+stitch text
const igneNumaralari = new Map();    // fabricId -> the needle number(s) it names
let kayitsizCumle = 0;
let hesapsizSayi = 0;
const sayfalar = new Map();

for (const fabricId of FABRICS) {
  const { spec, drafted } = draftFor(fabricId, BEDEN);
  if (!check(`${fabricId}: motor kalıbı çizdi`, !drafted.error && drafted.pattern,
             drafted.error || '')) continue;
  const p = drafted.pattern;
  const html = rehberHTML(p, spec, fabricId, guideData, { baslik: 'M5 kapı', beden: BEDEN });
  sayfalar.set(fabricId, html);

  // Every advice paragraph, with the id it was rendered from.
  const paras = [...html.matchAll(/<p class="ad" data-advice="([^"]+)">([\s\S]*?)<\/p>\s*<p class="kaynak">([\s\S]*?)<\/p>/g)];
  const basilanIds = new Set(paras.map((x) => x[1]));

  // LEG 1 — every engine advice is ON THE PAGE.
  const eksik = p.rehber.map((a) => a.id).filter((id) => !basilanIds.has(id));
  check(`${fabricId}: motorun ürettiği ${p.rehber.length} tavsiyenin hepsi sayfada`,
        eksik.length === 0, eksik.length ? `basılmayan: ${eksik.join(', ')}` : `${paras.length} paragraf`);

  const byId = new Map(p.rehber.map((a) => [a.id, a]));
  for (const [, id, govde, kaynakSatiri] of paras) {
    const a = byId.get(id);
    if (!a) { kayitsizCumle++; continue; }
    // LEG 1 — a sentence with no reason under it is a sentence with no source.
    if (!kaynakSatiri.trim()) { kayitsizCumle++; continue; }
    const { kaynaklar } = basisAyristir(a.basis);
    const izinli = new Set();
    for (const sid of kaynaklar) for (const v of registeredValues(sid)) izinli.add(v);
    if (kaynaklar.some((sid) => !REGISTRY.sources[sid])) {
      fails.push(`  FAIL ${fabricId}/${id}: kayıtta olmayan kaynak — ${kaynaklar.join('+')}`);
    }
    // LEG 2 — every number the TURKISH sentence prints is accounted for.
    for (const n of numbersIn(stripTags(govde))) {
      if (a.basis.includes(n) || izinli.has(n)) continue;
      hesapsizSayi++;
      fails.push(`  FAIL ${fabricId}/${id}: sayfada ${n} sayısı var, ne bu çizim hesapladı ne de kaynak taşıyor`);
    }
  }

  // LEG 3 — the needle + stitch answer for THIS bolt.
  const igne = p.rehber.find((a) => a.id === 'sew.needle');
  const dikis = p.rehber.find((a) => a.id === 'sew.stitch');
  const sayfaIgne = paras.filter((x) => x[1] === 'sew.needle' || x[1] === 'sew.stitch')
    .map((x) => stripTags(x[2]).replace(/\s+/g, ' ').trim()).join(' || ');
  igneCumleleri.set(fabricId, sayfaIgne);
  const { kv } = basisAyristir(igne ? igne.basis : '');
  igneNumaralari.set(fabricId, kv.needle || (kv.needleLow ? `${kv.needleLow}–${kv.needleHigh}` : 'YOK'));
  check(`${fabricId}: iğne ve dikiş tavsiyesi sayfada, kaynaklı`,
        !!igne && !!dikis && sayfaIgne.length > 40, igneNumaralari.get(fabricId));

  // LEG 4 — üç zor nokta, sayılı.
  const zor = p.rehber.filter((a) => a.id.startsWith('zor.') && a.id !== 'zor.ozet');
  const zorSayili = zor.filter((a) => {
    const { kv: z } = basisAyristir(a.basis);
    const olculen = Object.values(z).filter((v) => /^-?\d/.test(v)).length;
    return olculen >= 2 && numbersIn(stripTags(a.text)).length >= 2;
  });
  check(`${fabricId}: en az üç ZOR NOKTA ve her biri en az iki ölçülmüş sayı taşıyor`,
        zor.length >= 3 && zorSayili.length === zor.length,
        `${zor.length} zor nokta (${zor.map((a) => a.id.replace('zor.', '')).join(', ')}), sayılı ${zorSayili.length}`);
  const zorSayfada = zor.every((a) => basilanIds.has(a.id));
  check(`${fabricId}: zor noktaların hepsi sayfada basılı`, zorSayfada);
}

check('kayıtsız (kaynak satırı olmayan) tavsiye cümlesi = 0', kayitsizCumle === 0, `${kayitsizCumle} cümle`);
check('sayfada hesapsız/kaynaksız sayı = 0', hesapsizSayi === 0, `${hesapsizSayi} sayı`);

// LEG 3 — five bolts, five different needle/stitch answers.
const ayriCumle = new Set(igneCumleleri.values());
check('5 kumaşın 5\'i için FARKLI iğne/dikiş tavsiyesi (cümle bazında)',
      ayriCumle.size === FABRICS.length, `${ayriCumle.size}/${FABRICS.length} ayrı cümle`);
// LEG 3b — and this is what the needle NUMBERS actually are. Reported, not
// demanded: three of the five bolts are light wovens and the published chart
// gives them one band. Demanding five distinct numbers would force an invented
// sub-band rule, which is the failure this whole file is written against.
const ayriNumara = new Map();
for (const [f, n] of igneNumaralari) ayriNumara.set(n, [...(ayriNumara.get(n) || []), f]);
note.push(`  bilgi iğne numaraları: ${[...ayriNumara].map(([n, fs]) => `${n} <- ${fs.join('+')}`).join(' · ')}`);
check('iğne numarası en az iki ayrı cevap veriyor (tek donmuş paragraf değil)',
      ayriNumara.size >= 2, `${ayriNumara.size} ayrı numara/aralık`);

// ── LEG 5 — BEDEN SERİSİ: seçilen beden ±3, motorun kendi gradeJSON'undan ────
const PAKET_FABRIC = 'cotton-lawn';
const { spec: paketSpec, drafted: paketDraft } = draftFor(PAKET_FABRIC, BEDEN);
check('paket kalıbı çizildi (issues boş)',
      !paketDraft.error && paketDraft.pattern && !(paketDraft.issues || []).length,
      paketDraft.error || `${(paketDraft.issues || []).length} issue`);
const pattern = paketDraft.pattern;

const CHART = JSON.parse(readFileSync(join(ROOT, 'contract/tables.json'), 'utf8')).draft.euSizeChart;
// ⚠ The chart object carries a `_sources` key next to the size rows. Reading
// Object.keys() raw made '_sources' the first "size", and ±3 from EU38 then
// asked the engine to grade a size called _sources. Caught by this gate's own
// count leg on its first run. Metadata keys start with '_' by convention here.
const LABELS = Object.keys(CHART).filter((k) => !k.startsWith('_'));
const merkezIdx = LABELS.indexOf(BEDEN);
const lo = Math.max(0, merkezIdx - KOMSU);
const hi = Math.min(LABELS.length - 1, merkezIdx + KOMSU);
const seriLabels = LABELS.slice(lo, hi + 1);
// ±3 is CLAMPED at the ends of the published chart, and the clamp is said out
// loud rather than silently returning a short run: EU38 is the third row, so
// the low side stops at EU34 and the run is 6 sizes, not 7.
const kirpildi = (merkezIdx - KOMSU < 0 ? `alt uç ${KOMSU - merkezIdx} beden kırpıldı (çizelge ${LABELS[0]}'te başlıyor)` : '') ||
                 (merkezIdx + KOMSU > LABELS.length - 1 ? `üst uç kırpıldı (çizelge ${LABELS[LABELS.length - 1]}'te bitiyor)` : '') || 'kırpılmadı';

const gradeJSON = JSON.parse(engine.gradeJSON(engineSpec(paketSpec),
  { from: LABELS[lo], to: LABELS[hi] }));
check('gradeJSON beden serisini çizdi', !gradeJSON.error && Array.isArray(gradeJSON.sizes),
      gradeJSON.error || `${(gradeJSON.sizes || []).length} beden`);
check(`beden serisi ${LABELS[lo]}..${LABELS[hi]} — ${seriLabels.length} beden`,
      (gradeJSON.sizes || []).length === seriLabels.length,
      `${(gradeJSON.sizes || []).map((s) => s.size).join(', ')} · ${kirpildi}`);
const kirikBeden = (gradeJSON.sizes || []).filter((s) => !s.draft || !s.draft.pattern ||
  (s.draft.issues || []).length);
check('serideki her beden temiz çizildi (issue yok)', kirikBeden.length === 0,
      kirikBeden.map((s) => s.size).join(', '));
check(`merkez beden ${BEDEN} seride ve ±${KOMSU} komşusu tam`,
      seriLabels.includes(BEDEN) && seriLabels.length >= KOMSU + 1,
      seriLabels.join(', '));

const bedenSerisi = {
  merkez: BEDEN,
  komsu: KOMSU,
  kirpildi,
  bedenler: (gradeJSON.sizes || []).map((s) => ({
    size: s.size,
    bust: s.body.bust, waist: s.body.waist, hip: s.body.hip,
    pieces: s.draft.pattern.pieces.length,
    meters: s.draft.pattern.fabricMeters140,
  })),
};

// ── the package the buyer gets ───────────────────────────────────────────────
const BASLIK = 'stitchu — a-line dress, short straight sleeve';
const KOKEN_ALANLARI = [...new Set([...Object.keys(paketSpec), 'beden'])];
const koken = KOKEN.yeniKoken(KOKEN_ALANLARI);
KOKEN.isaretle(koken, 'fabricPreset', 'soruldu', 'bilinmiyor', 'kumaş kartından seçildi');
KOKEN.isaretle(koken, 'beden', 'soruldu', 'bilinmiyor', `vitrin bedeni ${BEDEN}`);

const rehber = rehberHTML(pattern, paketSpec, PAKET_FABRIC, guideData, {
  baslik: BASLIK, beden: BEDEN, bedenSerisi,
  kokenSatiri: `${KOKEN.ilanEdilecek(koken).length}/${KOKEN_ALANLARI.length} alan kuraldan türetildi`,
});
check('rehber beden serisi tablosunu basıyor',
      rehber.includes('Beden serisi') && bedenSerisi.bedenler.every((b) => rehber.includes(`>${b.size}`)),
      bedenSerisi.bedenler.map((b) => b.size).join(', '));
check('rehber dikiş payını mm ile veriyor',
      rehber.includes(`dikiş payı ${Math.round(pattern.pieces[0].seamAllowance)} mm`));
check('rehber inşa sırasını motorun adımlarından basıyor',
      (rehber.match(/<li>/g) || []).length === (pattern.guideSteps || []).length,
      `${(rehber.match(/<li>/g) || []).length}/${(pattern.guideSteps || []).length} adım`);
check('rehber kesim planını parça parça veriyor',
      pattern.pieces.every((pc) => rehber.includes(pc.name)), `${pattern.pieces.length} parça`);

const a4 = patternA4Pdf(pattern, BASLIK, koken, KOKEN_ALANLARI);
const a0 = patternA0Pdf(pattern, BASLIK);
const a4text = Buffer.from(a4).toString('latin1');
const a0text = Buffer.from(a0).toString('latin1');
check('A4 kalıp PDF gerçek PDF baytı',
      a4text.startsWith('%PDF-1.') && a4text.trimEnd().endsWith('%%EOF'), `${a4.length} bayt`);
check('A0 kalıp PDF gerçek PDF baytı',
      a0text.startsWith('%PDF-1.') && a0text.trimEnd().endsWith('%%EOF'), `${a0.length} bayt`);
const MM = 72 / 25.4;
let sq100 = null;
for (const mm of a4text.matchAll(/([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+) re/g)) {
  const w = Number(mm[3]) / MM, h = Number(mm[4]) / MM;
  if (Math.abs(w - h) < 0.01 && Math.abs(w - 100) < 0.5) { sq100 = w; break; }
}
check('A4\'te 100 mm kalibrasyon karesi (ölçüldü)',
      sq100 !== null && Math.abs(sq100 - 100) < 0.01,
      sq100 === null ? 'kare yok' : `${sq100.toFixed(3)} mm`);

const flat = await flatSVG(paketSpec, { size: BEDEN }, koken, KOKEN_ALANLARI);
check('flat SVG bir belge', flat.svg.startsWith('<svg') && flat.svg.trimEnd().endsWith('</svg>'),
      `${flat.svg.length} bayt`);

// Kesim planı as its own file — the buyer prints this and takes it to the table.
const kesimPlani = [
  `# kesim planı — ${BASLIK} (${BEDEN}, ${FABRIC_CATALOG[PAKET_FABRIC].trLabel})`,
  '',
  `dikiş payı: ${Math.round(pattern.pieces[0].seamAllowance)} mm (kesim çizgisine DAHİL)`,
  `kumaş: ${pattern.fabricMeters140} m @ 140 cm`,
  '',
  ...pattern.pieces.map((pc, i) => `${i + 1}. ${pc.name} — ${pc.cutInstruction}`),
].join('\n');

// The size run as machine-readable data, one layer per size.
const seriJSON = JSON.stringify({
  _role: 'BEDEN SERİSİ — seçilen beden ve ±3 komşusu, motorun kendi gradeJSON çıktısından. Pakette her beden AYRI bir A4 kalıp PDF\'idir (kalip-A4-<beden>.pdf); tek dosyada PDF KATMANI değil — bugünkü PDF yazıcısı optional-content katmanı yazmıyor ve öyle demek yalan olurdu.',
  merkez: BEDEN, komsu: KOMSU, kirpildi,
  bedenler: bedenSerisi.bedenler,
}, null, 2);

// ⚠ ONE PDF PER SIZE, AND THE GUIDE SAYS SO. The first draft of this run wrote
// ONE pattern PDF (the centre size) while the guide told the buyer the
// neighbours were "ayrı katman" in a layered PDF. That was a promise the
// package did not keep — caught by looking at the rendered page. The size run
// is now cut into real files, one per size, and the guide names them.
const bedenDosyalari = (gradeJSON.sizes || []).map((sz) => [
  `kalip-A4-${sz.size}.pdf`,
  patternA4Pdf(sz.draft.pattern, `${BASLIK} — ${sz.size}`, koken, KOKEN_ALANLARI),
]);
check(`beden serisinin her bedeni ayrı A4 kalıp PDF'i olarak pakette`,
      bedenDosyalari.length === seriLabels.length &&
      bedenDosyalari.every(([, d]) => Buffer.from(d).toString('latin1').startsWith('%PDF-1.')),
      bedenDosyalari.map(([n, d]) => `${n}:${d.length}`).join(' '));

const files = [
  ['kalip-A4.pdf', a4],
  ['kalip-A0.pdf', a0],
  ...bedenDosyalari,
  ['flat.svg', flat.svg],
  ['rehber.html', rehber],
  ['kesim-plani.md', kesimPlani],
  ['beden-serisi.json', seriJSON],
];
for (const [name, data] of files) {
  writeFileSync(join(OUT, name), data);
  if (PAKET) writeFileSync(join(PAKET, name), data);
}
if (PAKET) for (const [f, html] of sayfalar) writeFileSync(join(PAKET, `rehber-${f}.html`), html);
if (PAKET) {
  const readme = [
    `# ${BASLIK} — ${BEDEN}`,
    '',
    `kumaş: ${FABRIC_CATALOG[PAKET_FABRIC].trLabel} · dikiş payı ${Math.round(pattern.pieces[0].seamAllowance)} mm (kesim çizgisine dahil) · ${pattern.pieces.length} parça · ${pattern.fabricMeters140} m @ 140 cm`,
    '',
    '## pakette ne var',
    '',
    '| dosya | ne |',
    '|---|---|',
    '| `rehber.html` | dikiş rehberi — her cümle ya bu çizimin ölçtüğü bir sayıdan ya kayıtlı bir kaynaktan; altında hangisi olduğu yazılı |',
    '| `rehber-onizleme.png` | aynı rehberin okunabilir görüntüsü |',
    '| `kalip-A4.pdf` | 1:1 kalıp, A4 sayfalarda, 100 mm kalibrasyon karesiyle |',
    '| `kalip-A0.pdf` | aynı kalıp, tek A0 sayfada (matbaa) |',
    ...bedenSerisi.bedenler.map((b) => `| \`kalip-A4-${b.size}.pdf\` | beden serisi: ${b.size} (göğüs ${b.bust} / bel ${b.waist} / kalça ${b.hip} cm)${b.size === BEDEN ? ' ← seçilen beden' : ''} |`),
    '| `flat.svg` / `flat-onizleme.png` | teknik çizim (ön + arka), kalıbın izdüşümü |',
    '| `kesim-plani.md` | parça parça kesim talimatı, motorun kendi sözleriyle |',
    '| `beden-serisi.json` | beden serisinin ölçüleri, makine okunur |',
    ...FABRICS.map((f) => `| \`rehber-${f}.html\` | aynı kalıbın ${FABRIC_CATALOG[f].trLabel} için rehberi — iğne/dikiş/tela/zor noktalar o kumaşa göre değişir |`),
    '',
    '## beden serisi',
    '',
    `seçilen beden **${BEDEN}**, yanında ±${KOMSU} komşu (${kirpildi}). Hepsi aynı çizimden, motorun kendi \`gradeJSON\`'undan.`,
    '',
    '| beden | göğüs | bel | kalça | parça | kumaş |',
    '|---|---|---|---|---|---|',
    ...bedenSerisi.bedenler.map((b) => `| ${b.size}${b.size === BEDEN ? ' ★' : ''} | ${b.bust} | ${b.waist} | ${b.hip} | ${b.pieces} | ${b.meters} m |`),
    '',
    '## nasıl üretildi',
    '',
    '`node engine/tests/rehber_kaynak_check.mjs` (PAKET_DIR=KOSU/ciktilar/paket-02). Sıfır API çağrısı:',
    'kalıp sevk edilen wasm motorundan, rehber cümleleri motorun kendi `rehber` alanından,',
    'sayıların kaynağı `contract/guide-sources.json`. Kapı bu paketi ÜRETİR ve yargılar —',
    'yani buradaki her dosya, yeşil bir kapının kendi çıktısıdır.',
  ].join('\n');
  writeFileSync(join(PAKET, 'README.md'), readme);
}

check('paket altı dosyayı da üretti', files.every(([, d]) => d && d.length > 200),
      files.map(([n, d]) => `${n}:${d.length}`).join(' '));

console.log('rehber_kaynak_check — satın alınan paket: kalıp + flat + REHBER (kaynaklı) + beden serisi');
console.log(note.join('\n'));
if (fails.length) {
  console.log(fails.slice(0, 40).join('\n'));
  if (fails.length > 40) console.log(`  ... ve ${fails.length - 40} kırmızı daha`);
  console.log(`SONUÇ: ${note.length} yeşil, ${fails.length} KIRMIZI`);
  process.exit(1);
}
console.log(`  yazıldı: ${OUT}`);
if (PAKET) console.log(`  paket: ${PAKET}`);
console.log(`SONUÇ: ${note.length} kontrol yeşil, 0 kırmızı`);
