#!/usr/bin/env node
// flat_expresses_spec_check.mjs — İFADE KAPISI (V4-B, 2026-08-24).
//
// NEDEN AYRI DOSYA (§7.5 sayacının 2/3'ü, gerekçesi burada): bu kapı ayrı bir
// TEST ADI olmak zorunda. flat_convention_check bugün YEŞİL bir ad; içine
// yazılsaydı geliştirme boyunca o ad kırmızıya döner ve RULES 9'un saydığı
// kırmızı AD kümesi 6'dan 7'ye çıkardı. Ayrıca yargıladığı şey de başka:
// konvansiyon kapısı "flat AYNI MODELDEN mi çıkmış" diye sorar (aynılık),
// bu kapı "flat FARKLI GİYSİYİ farklı mı çiziyor" diye sorar (ayrım). İkisi
// birbirinin tersi yönde baskı yapar ve tek adın altında toplanırsa hangisinin
// düştüğü okunmaz.
//
// NE YARGILAR. Konvansiyon "hepsi aynı MANKEN" demektir, "hepsi aynı ÇİZİM"
// değil. 24 Ağustos gecesi ölçüldü — üretim kalemi üç FARKLI kolu bayt bayt
// aynı çiziyordu:
//     sleeveStyle none   2537 bayt  sha 0b647b4f1df3cfa3
//     sleeveStyle set    3495 bayt  sha 70cb9c7881ce0c0a
//     sleeveStyle raglan 3495 bayt  sha 70cb9c7881ce0c0a   <-- set ile AYNI
//     sleeveStyle puff   3495 bayt  sha 70cb9c7881ce0c0a   <-- set ile AYNI
//     sleeveStyle cap    3471 bayt  sha a90b71628ae22f13
//     collarType 1/2/3   3509 bayt  sha b26b7091834573e7   <-- ÜÇÜ DE AYNI
// Sessiz eşitlik, RULES invariant 1'in yasağıdır (desteklenmeyen değer sessizce
// düşürülemez/çökertilemez) ve CLAUDE.md'de emsali vardır: *sleeveStyle 'puff'
// silently dropped, 2026-07-18*. Aynılığı zorlayan bir kapı bu sessizliği
// MÜHÜRLER, o yüzden ayrım da kapıya bağlanıyor.
//
// İKİ AYRI OTORİTE VAR — ÖLÇÜLEREK AYRILDI (V4-B).
//   (1) contract/flat-convention-v1.json  -> FLAT'in kanunu. Bu kalem bir
//       GÖSTERİM çizimidir ve kolunu bu kanundan çizer (croquis.sleeveLaw,
//       puffHemOverWidestMax 0.9327, Buğra Locket EU38 Alt Kol'dan ölçülmüş).
//   (2) contract/garment-spec-v2.json     -> KALIP motorunun sicili
//       (surfacepattern.cpp). Bugün `sleeve` ve `collarFamily` operatörleri
//       **absent**.
// Kart bu kapıyı (2)'ye bağlamayı öneriyordu. DENENDİ VE ÖLÇÜLDÜ: sicile bakıp
// kolu SİLMEK flat_geometry_sellable_check S5/S6'yı kırmızıya düşürdü (o kapı
// kollu stillerin kolu ÇİZMESİNİ şart koşuyor) — yani devralınan kırmızı AD
// kümesi 6'dan 7'ye çıkıyordu, RULES 9. Silme GERİ ALINDI. Hüküm: flat'in
// ifade gücünü (1) tanımlar, (2) ise KALIP boşluğunu ADLANDIRIR.
//
// BU KAPININ ÜÇ ŞARTI:
//   (A) Kalemin AYIRT ETTİĞİNİ İDDİA ETTİĞİ her kol değeri birbirinden
//       ÖLÇÜLEBİLİR BİÇİMDE FARKLI bir flat üretmek zorunda. Aynılık = KIRMIZI.
//   (B) Sicilin kesemediği her değer SVG kökünde `data-engine-gap` ile EKSİK
//       OPERATÖRÜN ADIYLA duracak — sessiz değil, adlandırılmış boşluk.
//   (C) Bugün AYRILAMAYAN eksenler (collarType 1/2/3) kapı tarafından AÇIKÇA
//       RAPORLANACAK. Gizlenmiyor; kuyruk kalemi GECE/V4-B.md'de.
//
// FARKIN ÖLÇÜSÜ SHA DEĞİL GEOMETRİDİR. sha bir bayt imzasıdır; bir boşluk
// değişikliği onu oynatır, yani "farklı çizdim" diye yalan söylemeyi kolaylaştırır.
// Bu kapı SVG'nin ÇİZEN ELEMAN KÜMESİNİ çıkarır (her path'in d'si + her çizili
// ilkelin geometri imzası) ve ayrıca toplam KONTUR UZUNLUĞUNU sayar. Yargı bir
// EŞİKLE değil EŞİTLİK/EŞİTSİZLİKLE verilir (fark > 0), o yüzden gevşetilemez de:
// gevşetecek bir sayı yok.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const SICIL = JSON.parse(readFileSync(join(root, 'contract/garment-spec-v2.json'), 'utf8'));
const pen = await import(join(root, 'engine/tools/render-garment-flat.mjs'));
const { renderGarmentFlat, expressibility } = pen;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

// ---------------------------------------------------------------------------
// GEOMETRİ İMZASI — sha değil. Çizen eleman kümesi + kontur uzunluğu.
// ---------------------------------------------------------------------------
// Bir path'in `d`'sindeki sayı akışını koordinat çiftlerine böler ve ardışık
// noktalar arası kiriş uzunluklarını toplar. Bezier kontrol noktaları da
// poligon köşesi sayılır: bu bir yay uzunluğu DEĞİL, kararlı bir uzunluk
// imzasıdır — kapının ihtiyacı kesinlik değil, aynı girdiye aynı sayı.
function contourLength(d) {
  const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
  let L = 0;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    L += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]);
  }
  return L;
}

// Çizen eleman kümesi: <path d>, <circle>, <rect>, <line>, <polyline>, <polygon>.
// Kağıt zemini (paper fill) ve <text> DIŞARIDA — biri arka plan, diğeri yazı;
// ikisi de giysinin geometrisi değil.
function geometry(svg) {
  const els = [];
  let L = 0;
  for (const m of svg.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)) {
    els.push('path:' + m[1]);
    L += contourLength(m[1]);
  }
  for (const tag of ['circle', 'rect', 'line', 'polyline', 'polygon']) {
    for (const m of svg.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))) {
      const s = m[0];
      if (tag === 'rect' && /fill="#f{3,6}"/i.test(s) && !/stroke=/.test(s)) continue; // kağıt
      const geo = (s.match(/\b(?:cx|cy|r|x|y|x1|y1|x2|y2|width|height|points)="[^"]*"/g) || []).join(' ');
      els.push(`${tag}:${geo}`);
    }
  }
  els.sort();
  return { els, key: els.join('\n'), count: els.length, length: L };
}

const gapStamp = (svg) => (svg.match(/data-engine-gap="([^"]*)"/) || [, ''])[1];

// TABAN SPEC — kol ve yakanın anlamlı olduğu tek bir giysi. Aynı taban spec'te
// SADECE yargılanan alan oynatılır; başka hiçbir şey değişmez.
const BASE = { garment: 'top', neckline: 'crew', shaping: 'darts', topLength: 'hip', sleeveLength: 'short' };
const draw = (patch) => { const svg = renderGarmentFlat(null, { ...BASE, ...patch }); return { svg, geo: geometry(svg), gap: gapStamp(svg) }; };

console.log('flat_expresses_spec_check');
console.log('  flat kanunu : contract/flat-convention-v1.json  (ifade gucunu BU tanimlar)');
console.log('  kalip sicili: contract/garment-spec-v2.json     (SALT OKUNUR, bosluğu ADLANDIRIR)');
console.log('');

// ---------------------------------------------------------------------------
// (A) KALEMIN AYIRT ETTIGINI IDDIA ETTIGI KOL DEGERLERI BIRBIRINDEN FARKLI OLACAK
// ---------------------------------------------------------------------------
// Bu liste kalemin KENDI dallarindan okunur (sleeveHalf): 'none' kolu hic
// cizmez, 'cap' kisa kapak, 'puff' contract sleeveLaw'dan buzgulu kol,
// 'raglan' omuz dikissiz topoloji, 'set' duz set-in kol.
const SLEEVE_VALUES = ['none', 'set', 'raglan', 'puff', 'cap'];
console.log('--- (A) KOL DEGERLERI AYRISIYOR MU? (olcu: cizen eleman kumesi + kontur uzunlugu)');
const drawn = SLEEVE_VALUES.map((v) => ({ v, ...draw({ sleeveStyle: v }) }));
for (const d of drawn) {
  console.log(`    sleeveStyle ${d.v.padEnd(7)} eleman ${String(d.geo.count).padStart(3)}  kontur ${d.geo.length.toFixed(2)}u` +
    (d.gap ? `  kalip-boslugu="${d.gap}"` : ''));
}
for (let i = 0; i < drawn.length; i += 1) {
  for (let j = i + 1; j < drawn.length; j += 1) {
    const a = drawn[i], b = drawn[j];
    const sameEls = a.geo.key === b.geo.key;
    const dL = Math.abs(a.geo.length - b.geo.length);
    if (sameEls && dL === 0) {
      FAIL(`(A) '${a.v}' ile '${b.v}' AYNI flat'i uretiyor (eleman kumesi ozdes, kontur farki 0.00u) — sessiz cokertme`);
    } else {
      OK(`(A) '${a.v}' != '${b.v}'  (eleman farki ${sameEls ? 0 : 1}, kontur farki ${dL.toFixed(2)}u)`);
    }
  }
}

// ---------------------------------------------------------------------------
// (B) SICILIN KESEMEDIGI HER DEGER `data-engine-gap`'te ADIYLA GECECEK
// ---------------------------------------------------------------------------
console.log('');
console.log('--- (B) KALIP BOSLUGU ADLANDIRILIYOR MU? (sicil: garment-spec-v2 operators)');
const SLEEVE_TO_SICIL = { set: 'setIn', puff: 'puff', cap: 'cap', none: 'none' };
for (const [written, value] of Object.entries(SLEEVE_TO_SICIL)) {
  const e = expressibility('sleeve', value);
  const d = draw({ sleeveStyle: written });
  if (e.ok) { OK(`(B) sleeve '${value}' sicilde shipped — bosluk yok`); continue; }
  const needle = `sleeveStyle=${written}:`;
  if (!d.gap.includes(needle)) {
    FAIL(`(B) sleeve '${value}' motorda kesilemiyor (eksik: ${e.missing.join('+') || 'sicilde yok'}) ama data-engine-gap onu ADIYLA saymiyor: "${d.gap}"`);
  } else if (!e.unknown && !e.missing.every((op) => d.gap.includes(op))) {
    FAIL(`(B) sleeve '${value}' adlandirildi ama EKSIK OPERATORU saymiyor (eksik: ${e.missing.join('+')}, damga: "${d.gap}")`);
  } else {
    OK(`(B) sleeve '${value}' -> ${d.gap}`);
  }
}
for (const ct of [1, 2, 3, 4]) {
  const d = draw({ collarType: ct });
  if (!d.gap.includes(`collarType=${ct}:collarFamily`)) {
    FAIL(`(B) collarType ${ct} motorda kesilemiyor (collarFamily absent) ama data-engine-gap onu ADIYLA saymiyor: "${d.gap}"`);
  } else {
    OK(`(B) collarType ${ct} -> ${d.gap}`);
  }
}

// ---------------------------------------------------------------------------
// (C) BUGUN AYRILAMAYAN EKSENLER — GIZLENMIYOR, SAYIYLA RAPORLANIYOR
// ---------------------------------------------------------------------------
// KAPI DEGIL. Bunlari ayirmak olculmus bir kanun ister (contract'ta yaka kanunu
// YOK, sicilde collarFamily absent) ve sayi uydurmak yasak. Kuyruk: GECE/V4-B.md.
console.log('');
console.log('--- (C) BUGUN AYRILAMAYAN (KAPI DEGIL, SAYI) ---');
const collars = [1, 2, 3, 4].map((c) => ({ c, ...draw({ collarType: c }) }));
for (let i = 0; i < collars.length; i += 1) {
  for (let j = i + 1; j < collars.length; j += 1) {
    const a = collars[i], b = collars[j];
    const same = a.geo.key === b.geo.key;
    console.log(`    collarType ${a.c} vs ${b.c}: ${same ? 'AYNI CIZIM (ayrilamadi)' : 'farkli'}  kontur ${a.geo.length.toFixed(2)}u / ${b.geo.length.toFixed(2)}u`);
  }
}
const straight = draw({ sleeveStyle: 'straight' }), setIn = draw({ sleeveStyle: 'set' });
console.log(`    sleeveStyle 'straight' vs 'set': ${straight.geo.key === setIn.geo.key ? 'AYNI CIZIM (ayrilamadi)' : 'farkli'}`);
console.log("    -> yaka ailesi (peterPan/stand/shirt) ve 'straight' AYRILMADI. Sebep: olculmus kanun yok,");
console.log('       sayi uydurmak yasak. Kuyruk kalemi olarak GECE/V4-B.md icinde yaziyor.');

console.log('');
console.log(`flat_expresses_spec_check: ${fails} FAIL`);
process.exit(fails ? 1 : 0);
