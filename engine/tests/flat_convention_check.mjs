#!/usr/bin/env node
// flat_convention_check.mjs — FLAT KONVANSIYON KAPISI
//                             (F-D 2026-08-23 · YÜZEY HATTINA BAĞLANDI H3 2026-08-30).
//
// Damla: "iyi flat yok, oyleyse iyi kalip da olamaz." · "flatlerin hepsi ayni
// convention'da degil. hepsinin AYNI MODELDEN CIKMA gibi olmasi lazim." ·
// "flat tarz sorunu degil, CS hesap ve matematik isidir."
//
// ===========================================================================
// H3 — BU KAPI SİLİNMEDİ, YARGILADIĞI NESNE DEĞİŞTİ
// ===========================================================================
// 30 Ağustos'a kadar ölçülen kalem `engine/tools/render-garment-flat.mjs` →
// `web/lib/flat-core.js` idi: bir 2B croquis üstüne elle yazılmış eğrilerle çizen
// ÜRETİM CROQUIS KALEMİ. H3 o kalemi sildi, çünkü çizdiği croquis kalıptan AYRI
// bir nesneydi (EU38'de bel 700.0mm derken kalıp 724.89mm diyordu). Kullanıcıya
// giden teknik çizim artık kalıbın kesildiği yüzeyin projeksiyonudur:
//   engine.flatJSON(spec, body) -> web/lib/flat-from-plan.js -> SVG.
//
// KAPIYI SİLMEK ÇÖZÜM DEĞİLDİ. contract/flat-convention-v1.json bir kalemin özel
// biçim tercihi değil, DAMLA'NIN FLAT KANUNU: tek mürekkep, hiyerarşi RENKLE
// değil AĞIRLIKLA, sıfır boya, ön + arka, ilan edilmiş ölçek. Kalem öldü, kanun
// ölmedi — ve kanunun muhatabı artık yukarıdaki üç adımlık hattır. Bu kapı o
// hattı ölçer. `web/lib/flat-from-plan.js` H3'te kanuna UYDURULDU (mürekkep
// #1f3a5f, siluet `outline` 2.0, üst sınır `seam` 1.4, data-view front/back,
// data-scale + data-unit-mm); bu dosya o uyumu her koşuda YENİDEN ÖLÇER.
//
// HANGİ HÜKÜM NEREYE GİTTİ — hiçbiri kaybolmadı:
//   1  TEK CROQUIS (omuz/göğüs/bel çapaları ±2mm)  → KONUSU ÖLDÜ. Croquis diye
//      bir nesne yok; dört sınıfın dördü de AYNI GarmentSurf'ün projeksiyonu,
//      yani "aynı modelden çıkma" bir tolerans değil bir ÖZDEŞLİK. Onu ölçen
//      flat_pattern_agree_check --all (tek nesne / dugum kıyası).
//   1b BEYAN == ÇİZİLEN                            → aynı yere; artık çizilen
//      siluet kalıbın kendi halkalarına 0.1mm'de ölçülüyor.
//   1c OMUZ İÇERİDE / set-in kol yasası            → flat_geometry_sellable_check
//      (yüzey hattı bugün STRAPLESS sevk ediyor; hüküm orada CIRCIRLA duruyor).
//   1d MANKEN ÇAPASI (H6)                          → flat_pattern_agree_check --all.
//   2  ÖLÇEK BEYANI                                → BURADA, ve SIKILAŞTI (aşağı bak).
//   3  ÇİZGİ HİYERARŞİSİ · 3b ORANLAR              → BURADA, aynen.
//   4  SIFIR BOYA · 5 ÖN+ARKA · 6 TEK MÜREKKEP     → BURADA, aynen.
//
// ★ 2. ÖLÇEK — ESKİSİNDEN SIKI. Eski kapı `data-scale` dizesinin kanundaki dizeye
//   EŞİT olmasını istiyordu: bir sabitin bir sabite eşitliği, yani beyanın beyanla
//   doğrulanması. Yeni hüküm ARİTMETİK: belgenin fiziksel genişliği (mm cinsinden
//   `width` niteliği) bölü viewBox genişliği, beyan edilen `data-unit-mm`'e EŞİT
//   olmak zorunda, ve `data-scale` tam olarak `1:<unitMM>` olmak zorunda. Yalan
//   bir ölçek beyanı artık belgenin kendi geometrisiyle çelişir. (Çizilen çizginin
//   KALIBIN mm'sini tutup tutmadığı ayrı bir kapının işi: --all, 0.1mm.)
//
// ★ 3. ÖLÜ BEYAN — GEVŞETME DEĞİL, CIRCIR. Eski kapı "beyan edilmiş her sınıf en
//   az bir kez kullanılmış olmalı" diyordu ve croquis kalemi beş sınıfın beşini de
//   çiziyordu (pens, buton, fermuar hattı, sırt açıklığı...). Yüzey hattının bugün
//   çizdiği iki eğri var: siluet ve üst sınır. Üç sınıf (`mark`, `topstitch`,
//   `hidden`) bugün KULLANILMIYOR. Bu bir kusurdur ve kapı onu SAYAR, ADIYLA
//   BASAR ve sayıyı 3'te CIRCIRLAR: 3'ün üstüne çıkarsa KIRMIZI, düşerse yeşil
//   kalır ve tavanı düşürmek ayrı ve bilinçli bir commit'tir. Kullanılmayan sınıfı
//   kanundan SİLMEK de kapıyı geçirmez — silinen sınıf `ratios` beyanını kırar.
//
// ANTI-HACK: bu kapı hiçbir sabiti çiziciden import etmez. Çizicinin BASTIĞI SVG'yi
// parse eder. flat-from-plan.js'deki mürekkep/ağırlık sabitleri kanunun aynasıdır
// ve aynayı tutan kapı budur: bir bayt kayarsa burada kırmızı düşer.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const MANKEN_YOL = LAW.referenceBody && LAW.referenceBody.mannequinChart;
if (!MANKEN_YOL) throw new Error('flat-convention-v1.json referenceBody.mannequinChart beyani YOK');

const BUNDLE = join(root, 'engine/dist/stitchu-engine.js');
const FLAT_MOD = join(root, 'web/lib/flat-from-plan.js');
const INK = LAW.ink.color.toLowerCase();
const SIZE = process.env.V3C_SIZE || 'EU38';

// KULLANILMAYAN ÇİZGİ SINIFI CIRCIRI — bir TOLERANS değil, bir SAYIM tavanı.
// Bugün: mark · topstitch · hidden. Yalnız düşebilir.
const UNUSED_CLASS_RATCHET = 3;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

// ---------------------------------------------------------------------------
// MATRİS — dört giysi sınıfı (kartın saydığı dördü) artı aynı sınıfın yaka ve
// etek varyantları. Tek giysi gören kapı kapı değildir; ve "hepsi aynı
// convention'da mı" sorusu ancak birbirinden farklı spec'lerle sorulabilir.
// ---------------------------------------------------------------------------
const MATRIX = [
  ['elbise_scoop_aline', { garment: 'dress', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
  ['elbise_crew_duz',    { garment: 'dress', shaping: 'dart', fabric: 'woven', skirtStyle: 'straight', neckline: 'crew' }],
  ['etek_aline',         { garment: 'skirt', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'crew', sleeveStyle: 'none' }],
  ['top_scoop',          { garment: 'top', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'scoop' }],
  ['top_crew',           { garment: 'top', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine', neckline: 'crew' }],
  ['orme_scoop',         { garment: 'top', shaping: 'dart', fabric: 'knit', skirtStyle: 'aLine', neckline: 'scoop' }],
];

console.log('=== FLAT KONVANSIYON KAPISI — YUZEY HATTI (H3), ' + MATRIX.length + ' spec');
console.log(`    kanun: contract/flat-convention-v1.json   murekkep ${INK}   beden ${SIZE}`);
console.log('    olculen hat: engine.flatJSON(spec, body) -> web/lib/flat-from-plan.js');

if (!existsSync(BUNDLE)) FAIL(`sevk edilen wasm paketi YOK: ${BUNDLE} — engine/build-wasm.sh`);
if (!existsSync(FLAT_MOD)) FAIL(`cizici YOK: ${FLAT_MOD}`);
if (fails) { console.log(`\nFAIL flat_convention_check — ${fails} ihlal`); process.exit(1); }

const engine = await (await import(BUNDLE)).default();
const { renderFlatFromPlan } = await import(FLAT_MOD);

const rendered = [];
for (const [name, spec] of MATRIX) {
  let F;
  try { F = JSON.parse(engine.flatJSON(spec, { size: SIZE })); }
  catch (e) { FAIL(`[0 uretim] ${name}: flatJSON coktu: ${e.message}`); continue; }
  if (F.error) { FAIL(`[0 uretim] ${name}: flatJSON reddetti: ${F.error}`); continue; }
  let svg;
  try { svg = renderFlatFromPlan(F); }
  catch (e) { FAIL(`[0 uretim] ${name}: cizim uretilemedi: ${e.message}`); continue; }
  rendered.push([name, F, svg]);
}
if (rendered.length !== MATRIX.length) {
  FAIL(`[0 uretim] ${MATRIX.length} spec'in ${rendered.length}'i cizilebildi — eksik cizim = olculmemis hukum`);
}

// --- 5. ON + ARKA ----------------------------------------------------------
// Kanunun kendi adlari (views.required), motorun Turkce alan adlari degil. Her
// gorunum HEM siluet HEM ust sinir tasimak zorunda: neckline'i olmayan bir flat
// tam da H3'un bitirmek icin yazildigi sessiz eksiklik.
console.log('\n--- 5. ON + ARKA (kanun views.required)');
{
  const before = fails;
  for (const [name, , svg] of rendered) {
    for (const v of LAW.views.required) {
      for (const curve of ['siluet', 'ust-sinir']) {
        const re = new RegExp(`<path data-view="${v}" data-curve="${curve}"[^>]*d="[^"]{20,}"`);
        if (!re.test(svg)) FAIL(`[5 on+arka] ${name}: data-view="${v}" gorunumunun "${curve}" egrisi YOK`);
      }
    }
  }
  if (fails === before) OK(`5 on+arka — ${rendered.length} cizimin hepsinde ${LAW.views.required.join('+')} x (siluet+ust-sinir)`);
}

// --- 2. OLCEK BEYANI — ARITMETIK, DIZE KIYASI DEGIL ------------------------
console.log('\n--- 2. OLCEK BEYANI (belgenin kendi geometrisiyle dogrulanir)');
for (const [name, , svg] of rendered) {
  const head = /<svg\b[^>]*>/.exec(svg);
  if (!head) { FAIL(`[2 olcek] ${name}: <svg> koku okunamadi`); continue; }
  const at = (k) => { const m = new RegExp(`\\s${k}="([^"]*)"`).exec(head[0]); return m ? m[1] : null; };
  const sc = at('data-scale'), um = at('data-unit-mm');
  if (!sc) { FAIL(`[2 olcek] ${name}: kokte data-scale YOK`); continue; }
  if (!um) { FAIL(`[2 olcek] ${name}: kokte data-unit-mm YOK`); continue; }
  const unit = parseFloat(um);
  if (!Number.isFinite(unit) || unit <= 0) { FAIL(`[2 olcek] ${name}: data-unit-mm sayi degil (${um})`); continue; }
  if (sc !== `1:${um}`) FAIL(`[2 olcek] ${name}: data-scale="${sc}" ile data-unit-mm=${um} tutmuyor (beklenen "1:${um}")`);

  const wAttr = /^([\d.]+)mm$/.exec(at('width') || '');
  const hAttr = /^([\d.]+)mm$/.exec(at('height') || '');
  const vb = (at('viewBox') || '').trim().split(/\s+/).map(Number);
  if (!wAttr || !hAttr) { FAIL(`[2 olcek] ${name}: width/height mm cinsinden beyan edilmemis (${at('width')} x ${at('height')})`); continue; }
  if (vb.length !== 4 || !vb.every(Number.isFinite)) { FAIL(`[2 olcek] ${name}: viewBox okunamadi`); continue; }
  // BELGENIN KENDI OLCEGI: kagit mm / kullanici birimi. Beyanla ayni olmak
  // zorunda — degilse beyan yalan, ve yalani belgenin kendisi soyluyor.
  let sapma = 0;
  for (const [eksen, mm, u] of [['x', parseFloat(wAttr[1]), vb[2]], ['y', parseFloat(hAttr[1]), vb[3]]]) {
    const olculen = mm / u;
    if (Math.abs(olculen - unit) > 5e-4) {
      sapma += 1;
      FAIL(`[2 olcek] ${name}: ${eksen} ekseninde belge ${mm}mm / ${u}u = ${olculen.toFixed(6)} mm/birim, ` +
           `beyan data-unit-mm=${unit} — beyan cizimle celisiyor`);
    }
  }
  if (!sapma) OK(`2 olcek — ${name}: ${sc}, ${parseFloat(wAttr[1])}mm / ${vb[2]}u = ${(parseFloat(wAttr[1]) / vb[2]).toFixed(4)} mm/birim`);
}

// --- 2b. TEK MODEL — dort sinif AYNI cizelgeyi ILAN ediyor -----------------
// Bolum 1'in ("hepsi ayni croquis'ten") yuzey hattindaki karsiligi: croquis
// yok, ama her cizim hangi MANKEN cizelgesine gore degerlendigini ilan ediyor ve
// hepsinin ilani AYNI dosya + AYNI id olmak zorunda. Iki cizelge = iki model.
console.log('\n--- 2b. TEK MODEL (cizimlerin ilan ettigi manken cizelgesi tek mi)');
{
  const ilanlar = new Set(rendered.map(([, F]) => String((F.bedenlendirme || {}).cizelge || '(ILAN YOK)')));
  const MANKEN = existsSync(join(root, MANKEN_YOL))
    ? JSON.parse(readFileSync(join(root, MANKEN_YOL), 'utf8')) : null;
  if (!MANKEN) FAIL(`[2b tek model] ilan edilen manken cizelgesi diskte YOK: ${MANKEN_YOL}`);
  else if (ilanlar.size !== 1) FAIL(`[2b tek model] ${ilanlar.size} ayri cizelge ilani: {${[...ilanlar].join(' | ')}}`);
  else if (![...ilanlar][0].includes(MANKEN.id) || ![...ilanlar][0].includes(MANKEN_YOL))
    FAIL(`[2b tek model] ilan "${[...ilanlar][0]}" ne ${MANKEN.id} ne ${MANKEN_YOL} iceriyor`);
  else OK(`2b tek model — ${rendered.length} cizimin hepsi tek cizelge: ${[...ilanlar][0]}`);
}

// --- 3. CIZGI HIYERARSISI --------------------------------------------------
console.log('\n--- 3. CIZGI HIYERARSISI');
const CLASSES = LAW.lineClasses.classes;
const keyOf = (w, dash) => `${Number(w)}|${dash || ''}`;
const legal = new Map();
for (const [cname, c] of Object.entries(CLASSES)) legal.set(keyOf(c.width, c.dash), cname);
const used = new Set();
{
  const before = fails;
  for (const [name, , svg] of rendered) {
    // Grup mirasi gercek: <g stroke="..."> altindaki path stroke-width'i KENDI
    // tasiyor. Cizilen her elemani grup baglamiyla birlikte okuyoruz.
    let gStroke = null;
    for (const el of svg.matchAll(/<(g|path|line|circle|polyline|rect)\b([^>]*)>|<\/g>/g)) {
      if (el[0] === '</g>') { gStroke = null; continue; }
      const tag = el[1], at = el[2] || '';
      const get = (k) => { const m = new RegExp(`\\s${k}="([^"]*)"`).exec(at); return m ? m[1] : null; };
      if (tag === 'g') { gStroke = get('stroke') || gStroke; continue; }
      const st = get('stroke') || gStroke;
      if (!st || st === 'none') continue;
      const k = keyOf(get('stroke-width') || 1, get('stroke-dasharray') || '');
      if (!legal.has(k)) FAIL(`[3 hiyerarsi] ${name}: beyan edilmemis cizgi sinifi (width=${get('stroke-width')} dash=${get('stroke-dasharray')})`);
      else used.add(legal.get(k));
    }
  }
  if (fails === before && used.size) OK('3 hiyerarsi — cizilen her elemanin (agirlik, kesik) cifti beyanli bir sinif');
}
const unused = Object.keys(CLASSES).filter((c) => !used.has(c));
console.log(`    kullanilan sinif: ${[...used].sort().join(', ') || '(hic)'}`);
console.log(`    KULLANILMAYAN   : ${unused.join(', ') || '(yok)'}   (circir tavani ${UNUSED_CLASS_RATCHET})`);
if (unused.length > UNUSED_CLASS_RATCHET) {
  FAIL(`[3 olu beyan] ${unused.length} sinif beyan edilmis ama HIC cizilmiyor > tavan ${UNUSED_CLASS_RATCHET} — ` +
       'circir kirildi. Sinifi kanundan silmek cikis DEGIL: ratios beyani kirilir.');
} else if (unused.length < UNUSED_CLASS_RATCHET) {
  OK(`3 olu beyan — ${unused.length} < tavan ${UNUSED_CLASS_RATCHET}: tavan DUSTU. Sabitlemek ayri ve bilincli bir commit'tir (UNUSED_CLASS_RATCHET).`);
} else {
  OK(`3 olu beyan — ${unused.length} = tavan ${UNUSED_CLASS_RATCHET} (yuzey hatti bugun iki egri ciziyor: siluet + ust sinir). Sayi yalniz dusebilir.`);
}

// --- 3b. BEYAN EDILEN ORANLAR (ISO 128-2:2020 md.5.1 seri / md.5.2 +-0,1d) --
// Kaynak kunyesi: GECE/V4-R.md §1. Esik ISO md.5.2 +-0,1d; iki kalinligin orani
// icin en kotu hal (0.9a)/(1.1b) ... (1.1a)/(0.9b).
console.log('\n--- 3b. CIZGI ORANLARI (ISO 128-2:2020)');
const RATIOS = LAW.lineClasses.ratios || {};
if (!Object.keys(RATIOS).filter((k) => !k.startsWith('_')).length) {
  FAIL('[3b oran] lineClasses.ratios beyan edilmemis — bos beyan');
}
for (const [pair, declared] of Object.entries(RATIOS)) {
  if (pair.startsWith('_')) continue;
  const [a, b] = pair.split(':');
  if (!CLASSES[a] || !CLASSES[b]) { FAIL(`[3b oran] "${pair}" beyan edildi ama siniflardan biri tabloda yok`); continue; }
  const measured = CLASSES[a].width / CLASSES[b].width;
  const lo = declared * (0.9 / 1.1), hi = declared * (1.1 / 0.9);
  if (measured < lo || measured > hi) {
    FAIL(`[3b oran] ${pair}: beyan ${declared}, tablodan olculen ${measured.toFixed(4)} — ISO md.5.2 bandi [${lo.toFixed(4)}, ${hi.toFixed(4)}] disinda`);
  } else {
    OK(`3b oran — ${pair}: beyan ${declared} == olculen ${measured.toFixed(4)}`);
  }
}

// --- 4. SIFIR BOYA ---------------------------------------------------------
console.log('\n--- 4. SIFIR GOLGE / GRADYAN / TINT');
{
  const before = fails;
  const allowFill = new Set(LAW.fillLaw.allowedFills.map((s) => s.toLowerCase()));
  for (const [name, , svg] of rendered) {
    for (const bad of LAW.fillLaw.forbidden) {
      const c = (svg.match(new RegExp(bad, 'gi')) || []).length;
      if (c) FAIL(`[4 boya] ${name}: yasak "${bad}" x${c}`);
    }
    for (const f of svg.matchAll(/\sfill="([^"]+)"/g)) {
      if (!allowFill.has(f[1].toLowerCase())) FAIL(`[4 boya] ${name}: izinsiz fill="${f[1]}"`);
    }
  }
  if (fails === before) OK('4 boya — gradyan/filtre/opaklik 0, fill degerleri kanunun listesinde');
}

// --- 6. TEK KONTUR RENGI ---------------------------------------------------
console.log('\n--- 6. TEK KONTUR RENGI');
const inks = new Set();
for (const [, , svg] of rendered) for (const s of svg.matchAll(/\sstroke="([^"]+)"/g)) if (s[1] !== 'none') inks.add(s[1].toLowerCase());
if (inks.size !== 1 || !inks.has(INK)) FAIL(`[6 renk] kontur renkleri: {${[...inks].join(', ')}} — kanun {${INK}}`);
else OK(`6 renk — tek murekkep ${INK} (hiyerarsi renkle degil agirlikla)`);

console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'} flat_convention_check — ${fails} ihlal`);
process.exit(fails === 0 ? 0 : 1);
