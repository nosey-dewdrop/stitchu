#!/usr/bin/env node
// uctan_uca_check.mjs — F9 gate: GERÇEK FOTOĞRAF -> TAM PAKET.
//
// HEDEF CÜMLESİ: fotoğraf + prompt -> kalıp + flat. Bu kapı o cümlenin SON
// yarısını uçtan uca ölçer: bankalı bir fotoğraf OKUMASINDAN başlayıp,
// kullanıcının indirdiği ÜÇ dosyanın (A4 kalıp PDF'i, flat SVG, Türkçe rehber)
// gerçekten üretildiğini ve her birinin taşıması zorunlu olanı taşıdığını
// yargılar:
//   1. PDF   gerçek PDF baytları + 100 mm kalibrasyon karesi (re operatörü
//            geri okunur, "kare var" değil "kare 100.000 mm" iddiası) +
//            dikiş payı İLANI (mm) + köken bloğu.
//   2. FLAT  kalıptan çizilen SVG + köken damgaları KÖK elementte
//            (data-koken-*), düğüm tokeni kalıpla aynı nesneden.
//   3. REHBER Türkçe rehber HTML'i: dikiş payı mm, inşa sırası (motorun kendi
//            adımları, guide-tr.js çevirisi), iğne/dikiş bölümü (kaynaklı ya
//            da adıyla KAYNAK-YOK), kesim planı, kumaş sayıları kaynağıyla.
//
// SIFIR API ÇAĞRISI. Okuma engine/tests/fixtures/analyze-biba-O122999.json'dan
// gelir; o dosyanın başlığı canlı API'nin NEDEN çağrılamadığını adıyla söyler
// (canli API DOGRULANMADI). Zincir taklit edilmez: seen -> spec köprüsü ürünün
// kendi vision-bridge.js pick*'leri, kalıp motorun sevk edilen wasm baytı,
// PDF/flat/rehber web/js/download.js + web/lib'in aynı saf builder'ları.
//
// Çıktılar Logs/uctan-uca/ altına yazılır; PAKET_DIR env verilirse oraya da
// (KOSU/ciktilar/paket-01 paketlemesi bu yoldan üretilir).

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '../..');
const require = createRequire(import.meta.url);

// DOM stub — indir_check ile aynı dört satır: sevk edilen loader node'da koşsun.
globalThis.document = {
  createElement: () => ({ click() {}, style: {} }),
  head: { appendChild: (el) => { queueMicrotask(() => el.onload && el.onload()); } },
};
const engine = await require(join(ROOT, 'engine/dist/stitchu-engine.js'))();
globalThis.window = { createStitchuEngine: () => Promise.resolve(engine) };
globalThis.URL = { ...globalThis.URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => {} };

const { patternA4Pdf, flatSVG } = await import(join(ROOT, 'web/js/download.js'));
const { rehberHTML } = await import(join(ROOT, 'web/lib/rehber-tr.js'));
const KOKEN = await import(join(ROOT, 'web/js/provenance.js'));
const { canonical } = await import(join(ROOT, 'web/js/vocab.gen.js'));
const VB = await import(join(ROOT, 'web/js/vision-bridge.js'));
const { engineSpec, bodyForSize } = await import(join(ROOT, 'web/js/engine.js'));

const MM = 72 / 25.4;
const OUT = join(ROOT, 'Logs', 'uctan-uca');
mkdirSync(OUT, { recursive: true });
const PAKET = process.env.PAKET_DIR ? join(ROOT, process.env.PAKET_DIR) : null;
if (PAKET) mkdirSync(PAKET, { recursive: true });

const fails = [];
const note = [];
const check = (name, cond, detail) => {
  (cond ? note : fails).push(`  ${cond ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

// ── 1. OKUMA (bankalı fixture — canlı API değil, başlığı sebebini söylüyor) ──
const FIXTURE = join(here, 'fixtures', 'analyze-biba-O122999.json');
const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
const seen = fx.seen;
check('fixture kendi durumunu İLAN ediyor',
  /DOGRULANMADI/.test(fx._meta && fx._meta.durum || ''), fx._meta && fx._meta.durum);
check('fixture bir fotoğrafı adıyla gösteriyor',
  /GIRDI\/hedef-fotograflar\//.test(fx._meta && fx._meta.fotograf || ''), fx._meta && fx._meta.fotograf);

// ── 2. seen -> spec, ürünün kendi köprüsüyle (hedef_kosu ile aynı yol) ──────
const SPEC_DEFAULTS = {
  garment: 'dress', shaping: 'dart', waistline: 'natural', fabric: 'woven',
  neckline: 'crew', sleeveStyle: 'none', sleeveLength: 'short',
  skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip',
  shoulderStyle: 'set', sleeveCap: 'plain', edgeFinish: 'biasBinding',
  hemShape: 'straight', collarEdge: 'round', gatherZone: 'neckline',
};
const FIELD_MAP = {
  garment: 'garment', neckline: 'neckline', sleeveStyle: 'sleeveStyle',
  sleeveLength: 'sleeveLength', skirtStyle: 'skirtStyle', length: 'skirtLength',
  topLength: 'topLength', shaping: 'shaping', waistline: 'waistline',
  fabric: 'fabric', hemRuffle: 'ruffle', keyhole: 'keyhole',
};
const spec = { ...SPEC_DEFAULTS };
const declared = new Set();
for (const [lf, sf] of Object.entries(FIELD_MAP)) {
  const v = seen[lf];
  if (v === null || v === undefined) continue;
  if (sf === 'keyhole') { spec.keyhole = v ? 'keyhole' : 'none'; declared.add(sf); continue; }
  const c = canonical(sf, v);
  if (c !== undefined) { spec[sf] = c; declared.add(sf); }
}
const put = (k, v) => { if (v && v !== 'none') { spec[k] = v; declared.add(k); } };
const g = VB.pickGather(seen);
if (g) { put('gatherType', g.gatherType); put('gatherZone', g.gatherZone); }
const col = VB.pickCollar(seen);
if (col) { put('collarType', col.collarType); put('collarEdge', col.collarEdge); }
put('backOpening', VB.pickBackOpening(seen));
put('peplum', VB.pickPeplum(seen));
put('hemFlounce', VB.pickHemFlounce(seen));
put('pocketStyle', VB.pickPocket(seen));
put('cuffStyle', VB.pickCuff(seen));
put('hemShape', VB.pickHemShape(seen));

// KUMAŞ SEÇİMİ — sitedeki kumaş kartından kullanıcının seçtiği top (F6 yolu).
// Profil ürünün kendi fabricProfile()'ından: bu spec 'gathered' ister ve
// sewing-guide.json o profil için "ince pamuklu (lawn)" ailesini adıyla verir;
// katalogdaki karşılığı cotton-lawn (87 g/m², %100 pamuk, kaynak
// GIRDI/kumaslar.md satır 4). Seçim kullanıcı eliyle olduğundan köken 'soruldu'.
spec.fabricPreset = 'cotton-lawn';

check('okunan alanlar spec\'e taşındı (>=6 eksen fotoğraftan)',
  declared.size >= 6, [...declared].sort().join(','));

// ── 3. KÖKEN kaydı (create.js semantiği: default=cikarildi, foto=gorulen) ───
const KOKEN_ALANLARI = [...new Set([...Object.keys(spec), 'beden'])];
const koken = KOKEN.yeniKoken(KOKEN_ALANLARI);
for (const f of declared) KOKEN.isaretle(koken, f, 'gorulen');
KOKEN.isaretle(koken, 'fabricPreset', 'soruldu', 'bilinmiyor', 'kumaş kartından seçildi');
KOKEN.isaretle(koken, 'beden', 'cikarildi', 'bilinmiyor', 'vitrin bedeni EU38');

// ── 4. KALIP — sevk edilen wasm, aynı engineSpec çevirisi ───────────────────
const BEDEN = 'EU38';
const m = bodyForSize(BEDEN);
const drafted = JSON.parse(engine.draftJSON(engineSpec(spec), {
  bust: m.bust, waist: m.waist, hip: m.hip, shoulder: m.shoulder,
  backLength: m.backLength, armLength: m.armLength, neck: m.neck, upperBust: m.upperBust || 0,
}));
check('motor kalıbı çizdi (issues boş)',
  !drafted.error && drafted.pattern && !(drafted.issues || []).length,
  drafted.error || `${(drafted.issues || []).length} issue`);
if (drafted.error || !drafted.pattern) {
  console.log(fails.join('\n'));
  process.exit(1);
}
const pattern = drafted.pattern;
check('dikiş payı kalıbın kendi alanında', pattern.pieces[0].seamAllowance > 0,
  `${pattern.pieces[0].seamAllowance} mm`);

// ── 5. ÜÇ DOSYA ─────────────────────────────────────────────────────────────
const baslik = 'biba 1971 paisley dress';

// 5a. A4 KALIP PDF — köken kaydıyla.
const a4 = patternA4Pdf(pattern, baslik, koken, KOKEN_ALANLARI);
const a4text = Buffer.from(a4).toString('latin1');
check('PDF gerçek PDF baytı', a4text.startsWith('%PDF-1.') && a4text.trimEnd().endsWith('%%EOF'));
// 100 mm kare: her `re` operatörü geri okunur, kare VE 100 mm olan aranır.
let sq100 = null;
for (const mm of a4text.matchAll(/([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+) re/g)) {
  const w = Number(mm[3]) / MM, h = Number(mm[4]) / MM;
  if (Math.abs(w - h) < 0.01 && Math.abs(w - 100) < 0.5) { sq100 = w; break; }
}
check('PDF\'te 100 mm kalibrasyon karesi (ölçüldü)',
  sq100 !== null && Math.abs(sq100 - 100) < 0.01,
  sq100 === null ? '100 mm kare yok' : `${sq100.toFixed(3)} mm`);
check('kare kendini adıyla ilan ediyor', a4text.includes('10 cm = 100 mm, measure me before cutting'));
// dikiş payı ilanı — mm sayısı kalıbın kendi sayısıyla.
const saMM = Math.round(pattern.pieces[0].seamAllowance);
check('PDF dikiş payını mm ile İLAN ediyor',
  a4text.includes(`seam allowance ${saMM} mm`) && a4text.includes(`dikis payi ${saMM} mm DAHIL`),
  `${saMM} mm`);
check('PDF köken bloğu taşıyor', /Origin \/ K.ken/.test(a4text));
// 3 cm karesi de yerinde durmalı (eski sözleşme bozulmadı).
check('3 cm karesi hâlâ kapakta', a4text.includes('3 cm, measure me before cutting'));

// 5b. FLAT SVG — köken damgalı, kalıpla aynı nesneden.
const flat = await flatSVG(spec, { size: BEDEN }, koken, KOKEN_ALANLARI);
const svg = flat.svg;
check('flat SVG bir belge', svg.startsWith('<svg') && svg.trimEnd().endsWith('</svg>'));
check('flat köken damgaları KÖK elementte',
  /data-koken-cikarildi="/.test(svg.slice(0, svg.indexOf('>') + 1)),
  (svg.slice(0, 200).match(/data-koken-[a-z]+/g) || []).join(','));
check('flat düğüm tokeni taşıyor (kalıpla ortak ata)',
  typeof flat.dugum === 'string' && flat.dugum.length === 16, flat.dugum);

// 5c. REHBER — Türkçe, her cümle kaynaklı.
const guideData = JSON.parse(readFileSync(join(ROOT, 'web/data/sewing-guide.json'), 'utf8'));
const derived = KOKEN.ilanEdilecek(koken);
const rehber = rehberHTML(pattern, spec, 'cotton-lawn', guideData, {
  baslik, beden: BEDEN,
  kokenSatiri: `${derived.length}/${KOKEN_ALANLARI.length} alan fotoğrafta görünmedi, kuraldan türetildi`,
});
check('rehber dikiş payını mm ile veriyor', rehber.includes(`dikiş payı ${saMM} mm`));
check('rehber inşa sırasını motorun adımlarından basıyor',
  (rehber.match(/<li>/g) || []).length === (pattern.guideSteps || []).length,
  `${(rehber.match(/<li>/g) || []).length}/${(pattern.guideSteps || []).length} adım`);
// M5-rehber: the needle section is no longer this page's own paragraph, it is
// the ENGINE's `sew.needle` advice printed with its basis. So the gate asks for
// the engine's advice by its id — a heading string could survive an empty
// section, a rendered advice id cannot.
check('rehber iğne/dikiş bölümünü MOTORUN kaynaklı tavsiyesinden basıyor',
  /data-advice="sew\.needle"/.test(rehber) && /data-advice="sew\.stitch"/.test(rehber) &&
  /guide-sources\.json/.test(rehber));
check('rehber kesim planını parça parça veriyor',
  pattern.pieces.every((p) => rehber.includes(p.name)), `${pattern.pieces.length} parça`);
check('rehber kumaş sayılarını kaynağıyla veriyor',
  rehber.includes('GIRDI/kumaslar.md') && rehber.includes('g/m'));
// kaynaksız tavsiye 0: rehberdeki her bölüm ya motor verisi ya kaynak satırı
// taşıyan bloktan gelir; kaynak satırı sayısı bölüm sayısını karşılamalı.
check('her tavsiye bölümünün altında kaynak satırı var',
  (rehber.match(/class="kaynak"/g) || []).length >= 4,
  `${(rehber.match(/class="kaynak"/g) || []).length} kaynak satırı`);

// ── 6. yaz + (istenirse) paketle ────────────────────────────────────────────
const files = [
  ['kalip-A4.pdf', a4],
  ['flat.svg', svg],
  ['rehber.html', rehber],
];
for (const [name, data] of files) {
  writeFileSync(join(OUT, name), data);
  if (PAKET) writeFileSync(join(PAKET, name), data);
}

console.log('uctan_uca_check — fotoğraf okuması -> kalıp PDF + flat + rehber');
console.log(note.join('\n'));
if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
console.log(`  yazıldı: ${files.map(([n]) => join(OUT, n)).join(' · ')}`);
if (PAKET) console.log(`  paket: ${PAKET}`);
console.log(`SONUÇ: ${note.length} kontrol yeşil, 0 kırmızı`);
