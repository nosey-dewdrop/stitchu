#!/usr/bin/env node
// flat_expresses_spec_check.mjs — İFADE KAPISI
//   (V4-B 2026-08-24 · DEĞER ALANI TÜRETİLDİ V4-E 2026-08-24
//    · YÜZEY HATTINA BAĞLANDI H3 2026-08-30).
//
// ===========================================================================
// H3 — KAPI SİLİNMEDİ, YARGILADIĞI KALEM DEĞİŞTİ VE HÜKÜM SİMETRİKLEŞTİ
// ===========================================================================
// Bu kapının sorusu hiç değişmedi: KULLANICI BİR EKSENİ OYNATTIĞINDA ÇİZİM
// DEĞİŞİYOR MU, YOKSA SESSİZCE ÇÖKERTİLİYOR MU? (emsal: CLAUDE.md, sleeveStyle
// 'puff' silently dropped, 2026-07-18). 30 Ağustos'a kadar ölçtüğü kalem
// `render-garment-flat.mjs` → `web/lib/flat-core.js` idi ve boşluğu kalemin
// kendi bastığı `data-engine-gap` damgasından okuyordu. H3 o kalemi sildi;
// çizim artık kalıbın kesildiği yüzeyin projeksiyonu, ve damganın yerinde
// motorun kendi reddi var: `flatJSON(...).desteklenmeyen_eksenler` (H2).
//
// ★ VE HÜKÜM BU YÜZDEN ESKİSİNDEN SIKI. Eski kapı TEK YÖNLÜYDÜ: "özdeş çiziyorsa
//   damgalı olsun". Yüzey hattında reddin anlamı kesin — reddedilen eksen
//   uygulanmaz, yani çizim taban spec'in çizimiyle ÖZDEŞ kalmak zorundadır. O
//   yüzden yargı artık İKİ YÖNLÜ ve bir EŞDEĞERLİKTİR:
//       ADIYLA REDDEDİLDİ  ⟺  ÇİZİM TABANLA ÖZDEŞ
//   Sol taraf sağ tarafsız = SESSİZ ÇÖKERTME (eski kusur, hâlâ kırmızı).
//   Sağ taraf sol tarafsız = YALAN REDDİ: motor "bu ekseni taşıyamıyorum" deyip
//   çizimi yine de oynatmış olur. Eski kapı bunu HİÇ göremezdi; bugün kırmızı.
//
// ★ ÜÇÜNCÜ SONUÇ: PARSE REDDİ. Türetilen alan, sevk edilen motorun kapalı
//   enum'unda HİÇ olmayan yazımlar da içerir (ör. sleeveStyle 'set'). Motor onu
//   çizmez, ADIYLA hata döndürür ("invalid sleeveStyle 'set' (valid: ...)").
//   Bu bir sessiz çökertme DEĞİLDİR — değer adıyla reddedilmiştir — ama ifade de
//   edilmemiştir, o yüzden UNEXPRESSED kovasına girer ve CIRCIRA dahildir.
//
// İKİ KOVA VAR, ÜÇÜNCÜSÜ YOK:
//   İFADE EDİLDİ  — taban spec'te o değer, tabandan geometrik olarak FARKLI bir
//                   çizim üretiyor (fark > 0; eşik yok, eşitlik/eşitsizlik).
//   UNEXPRESSED   — çizim tabanla ÖZDEŞ, AMA motor o ekseni ADIYLA reddediyor
//                   (`desteklenmeyen_eksenler`) ya da değeri adıyla parse
//                   reddine uğratıyor. Damgasız/adsız özdeşlik = KIRMIZI.
// UNEXPRESSED bir gevşetme değil, DÜRÜSTLÜKTÜR ve CIRCIRLIDIR. ★ H3-B: cırcır
// artık eksen başına elle yazılmış bir kova sayısı DEĞİL (7/6/2 öyleydi ve üçü de
// tam tavandaydı — lastik damga). Tavan tek bir sayı: motorun BÜTÜNÜYLE
// reddettiği EKSEN sayısı. Gerekçe dosyanın sonunda, cırcır bloğunda.
//
// EŞANLAM İSTİSNASI (uydurma değil, BEYANLI): engine/vocab.json kol alanının
// beyanlı eşanlamları (`puff->balloon`, `set-in->straight`, ...) AYNI çizmek
// zorundadır; beyanı yalanlayan eşanlam da bir kusurdur.
//
// FARKIN ÖLÇÜSÜ SHA DEĞİL GEOMETRİDİR. sha bir bayt imzasıdır; bir boşluk
// değişikliği onu oynatır, yani "farklı çizdim" diye yalan söylemeyi kolaylaştırır.
// Bu kapı SVG'nin ÇİZEN ELEMAN KÜMESİNİ çıkarır (her path'in d'si + her çizili
// ilkelin geometri imzası) ve ayrıca toplam KONTUR UZUNLUĞUNU sayar.
//
// DEĞER ALANI ELLE YAZILMIYOR (V4-E onarımı, H3'te AYNEN korundu): beş kaynak
// diskten okunur — takipli JSON'lardaki fiilî kullanım sayımı, engine/vocab.json
// değerleri + eşanlamları, contract/spec-grammar.json, contract/spec-v1-v2-map.json
// ve contract/garment-spec.schema.json. Kapının kendi kanaati yoktur.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const rd = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const SICIL = rd('contract/garment-spec-v2.json');
const VOCAB = rd('engine/vocab.json');
const GRAMMAR = rd('contract/spec-grammar.json');
const V1V2 = rd('contract/spec-v1-v2-map.json');
const SCHEMA = rd('contract/garment-spec.schema.json');

const BUNDLE = join(root, 'engine/dist/stitchu-engine.js');
const FLAT_MOD = join(root, 'web/lib/flat-from-plan.js');
const SIZE = process.env.V3C_SIZE || 'EU38';

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

if (!existsSync(BUNDLE)) FAIL(`sevk edilen wasm paketi YOK: ${BUNDLE}`);
if (!existsSync(FLAT_MOD)) FAIL(`cizici YOK: ${FLAT_MOD}`);
if (fails) { console.log(`\nflat_expresses_spec_check: ${fails} FAIL`); process.exit(1); }

const engine = await (await import(BUNDLE)).default();
const { renderFlatFromPlan } = await import(FLAT_MOD);

// ALAN ADLARI DA ELLE YAZILMIYOR. engine/vocab.json her alani bir enum TIPINE
// bagliyor; alan adi o tipten bulunuyor.
const fieldOf = (enumType) => {
  const k = Object.keys(VOCAB.fields).find((f) => VOCAB.fields[f].enum === enumType);
  if (!k) throw new Error(`engine/vocab.json icinde ${enumType} tipli alan YOK`);
  return k;
};
const F_SLEEVE = fieldOf('SleeveStyle');
const F_COLLAR = fieldOf('CollarType');
const F_SHOULDER = fieldOf('ShoulderStyle');

// ---------------------------------------------------------------------------
// GEOMETRİ İMZASI — sha değil. Çizen eleman kümesi + kontur uzunluğu.
// ---------------------------------------------------------------------------
function contourLength(d) {
  const nums = (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
  let L = 0;
  for (let i = 2; i + 1 < nums.length; i += 2) {
    L += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]);
  }
  return L;
}
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

// TABAN SPEC — yüzey hattının bugün SEVK ETTİĞİ giysi. Aynı taban spec'te SADECE
// yargılanan alan oynatılır; başka hiçbir şey değişmez.
const BASE = { garment: 'top', neckline: 'crew', shaping: 'dart', fabric: 'woven', skirtStyle: 'aLine' };

/** Bir spec'in ÇİZİMİ + motorun o spec icin ADIYLA reddettigi eksenler.
 *  Uc sonuc: {geo, red[]} · {parseHatasi} · {cizimHatasi} */
function draw(patch) {
  let F;
  try { F = JSON.parse(engine.flatJSON({ ...BASE, ...patch }, { size: SIZE })); }
  catch (e) { return { parseHatasi: e.message }; }
  if (F.error) return { parseHatasi: F.error };
  let svg;
  try { svg = renderFlatFromPlan(F); } catch (e) { return { cizimHatasi: e.message }; }
  return { geo: geometry(svg), red: F.desteklenmeyen_eksenler || [] };
}

const TABAN = draw({});
if (TABAN.parseHatasi || TABAN.cizimHatasi) {
  FAIL(`taban spec cizilemiyor: ${TABAN.parseHatasi || TABAN.cizimHatasi} — kapinin olcecegi referans yok`);
  console.log(`\nflat_expresses_spec_check: ${fails} FAIL`);
  process.exit(1);
}
if (TABAN.red.length) {
  FAIL(`taban spec'in kendisi ${TABAN.red.length} eksen reddediyor: [${TABAN.red.join(' · ')}] — ` +
       'taban temiz olmali, yoksa "tabanla ozdes" olcusu kirli bir referansa dayanir');
}

// ---------------------------------------------------------------------------
// DOMAIN — DEĞER ALANI KAYNAKTAN TÜRETİLİR (V4-E kusur 1'in onarımı)
// ---------------------------------------------------------------------------
function trackedJson() {
  const out = execFileSync('git', ['-C', root, 'ls-files', '-z', '*.json'], { maxBuffer: 1 << 28 });
  return out.toString('utf8').split('\0').filter(Boolean);
}
const FILES = trackedJson();
function census(field, quoted) {
  const re = new RegExp(`"${field}"\\s*:\\s*` + (quoted ? '"([^"]*)"' : '(-?\\d+)'), 'g');
  const c = new Map();
  for (const f of FILES) {
    let txt;
    try { txt = readFileSync(join(root, f), 'utf8'); } catch { continue; }
    for (const m of txt.matchAll(re)) c.set(m[1], (c.get(m[1]) || 0) + 1);
  }
  return c;
}
const uniq = (a) => [...new Set(a.filter((v) => v !== null && v !== undefined && v !== ''))];
const sortedByUse = (vals, use) => [...vals].sort((a, b) => (use.get(b) || 0) - (use.get(a) || 0) || String(a).localeCompare(String(b)));

console.log('flat_expresses_spec_check — YUZEY HATTI (H3)');
console.log('  olculen hat : engine.flatJSON(spec, body) -> web/lib/flat-from-plan.js');
console.log('  red kaynagi : flatJSON(...).desteklenmeyen_eksenler   (H2)');
console.log('  kalip sicili: contract/garment-spec-v2.json     (SALT OKUNUR, boslugu ADLANDIRIR)');
console.log(`  takipli JSON: ${FILES.length} dosya (git ls-files '*.json')`);
console.log('');

// --- KOL ALANI --------------------------------------------------------------
const USE_SLEEVE = census(F_SLEEVE, true);
const SRC_SLEEVE = [
  ['spec JSON kullanimi (git ls-files)', [...USE_SLEEVE.keys()]],
  [`engine/vocab.json fields.${F_SLEEVE}.values`, VOCAB.fields[F_SLEEVE].values],
  [`engine/vocab.json fields.${F_SLEEVE}.synonyms`, Object.keys(VOCAB.fields[F_SLEEVE].synonyms || {})],
  ['contract/spec-grammar.json slots.sleeve', Object.keys(GRAMMAR.slots.sleeve.values || {}).concat(GRAMMAR.slots.sleeve.PARK || [])],
  [`contract/spec-v1-v2-map.json axes.${F_SLEEVE}`, Object.keys(((V1V2.axes || {})[F_SLEEVE] || {}).values || {})],
  [`contract/garment-spec.schema.json draftSpec.${F_SLEEVE}`, SCHEMA.$defs.draftSpec.properties[F_SLEEVE].enum || []],
];
console.log('--- DOMAIN: kol degeri alani TURETILDI (elle yazilmadi)');
for (const [name, vals] of SRC_SLEEVE) console.log(`    ${name.padEnd(52)} ${uniq(vals).sort().join(' ') || '(bos)'}`);
const SLEEVE_DOMAIN = sortedByUse(uniq(SRC_SLEEVE.flatMap(([, v]) => v)), USE_SLEEVE);
console.log(`    => ALAN (${SLEEVE_DOMAIN.length}): ${SLEEVE_DOMAIN.join(' ')}`);
console.log('');

// --- YAKA ALANI -------------------------------------------------------------
const COLLAR_NAMES = VOCAB.fields[F_COLLAR].values;              // index = int deger
const USE_COLLAR = census(F_COLLAR, false);
const COLLAR_DOMAIN = sortedByUse(uniq([...COLLAR_NAMES.keys()].map(String).concat([...USE_COLLAR.keys()])), USE_COLLAR)
  .map(Number).filter((v) => Number.isInteger(v) && v >= 0 && v < COLLAR_NAMES.length);
const collarName = (i) => COLLAR_NAMES[i] || `#${i}`;
console.log('--- DOMAIN: yaka degeri alani TURETILDI (elle yazilmadi)');
console.log(`    engine/vocab.json fields.${F_COLLAR}.values          ${COLLAR_NAMES.join(' ')}`);
console.log(`    => ALAN (${COLLAR_DOMAIN.length}): ${COLLAR_DOMAIN.map((i) => `${i}=${collarName(i)}`).join(' ')}`);
console.log('');

// --- OMUZ ALANI -------------------------------------------------------------
// Omuz alani SAYIDIR (kapali enum'un SIRASI), tipki yaka gibi: sevk edilen motor
// bu ekseni int olarak parse ediyor.
const SHOULDER_NAMES = uniq([
  ...((VOCAB.fields[F_SHOULDER] || {}).values || []),
  ...((SCHEMA.$defs.draftSpec.properties[F_SHOULDER] || {}).enum || []),
]);
const USE_SHOULDER = census(F_SHOULDER, false);
const SHOULDER_DOMAIN = sortedByUse(uniq([...SHOULDER_NAMES.keys()].map(String).concat([...USE_SHOULDER.keys()])), USE_SHOULDER)
  .map(Number).filter((v) => Number.isInteger(v) && v >= 0 && v < SHOULDER_NAMES.length);
const shoulderName = (i) => SHOULDER_NAMES[i] || `#${i}`;
console.log('--- DOMAIN: omuz degeri alani TURETILDI (elle yazilmadi)');
console.log(`    => ALAN (${SHOULDER_DOMAIN.length}): ${SHOULDER_DOMAIN.map((i) => `${i}=${shoulderName(i)}`).join(' ')}`);
console.log('');

// ---------------------------------------------------------------------------
// ORTAK YARGI — EŞDEĞERLİK: "adiyla reddedildi" ⟺ "cizim tabanla ozdes"
// ---------------------------------------------------------------------------
//
// ★ EKSENİN KENDİ VARSAYILANI ÜÇÜNCÜ BİR KOVA DEĞİL, BİR TEKİLLİKTİR.
//   Taban spec bu eksenleri hiç SET ETMEZ, yani eksenin varsayılan değeri
//   yazıldığında çizim tabanla özdeş olur VE motor hiçbir şey reddetmez —
//   "sessiz çökertme"nin imzasıyla aynı imza. İkisini ayıran şey SAYIDIR: bir
//   eksende bu imzayı taşıyan değer TAM OLARAK BİR TANE olabilir (varsayılanın
//   kendisi). İki tane olsaydı ikincisi gerçekten sessizce çökertilmiş olurdu.
//   Kapı bu yüzden varsayılanı elle yazmaz, SAYAR ve sayının 1 olmasını şart
//   koşar. Ne bir gevşetme ne bir istisna: bir tekillik hükmü.
function judge(axisLabel, field, domain, patchOf, labelOf, canonicalOf, needlesOf) {
  const drawn = domain.map((v) => ({ v, ...draw(patchOf(v)) }));
  const unexpressed = [];
  const sessiz = drawn.filter((d) => d.geo && d.geo.key === TABAN.geo.key
    && !needlesOf(d.v).some((n) => d.red.some((r) => r.startsWith(`${field}=`) && r.includes(n))));
  if (sessiz.length !== 1) {
    FAIL(`(A) ${axisLabel}: tabanla ozdes VE adiyla reddedilmeyen deger sayisi ${sessiz.length}, olmasi gereken 1 ` +
         `(eksenin kendi varsayilani). Bulunanlar: [${sessiz.map((d) => labelOf(d.v)).join(' · ')}] — ` +
         'birden fazlaysa fazlasi SESSIZ COKERTMEDIR, sifirsa taban spec bu ekseni set ediyor demektir');
  } else {
    console.log(`    ${axisLabel} VARSAYILAN = ${labelOf(sessiz[0].v)} (tabanla ozdes, red yok — tekil, dogru)`);
  }
  const VARSAYILAN = sessiz.length === 1 ? sessiz[0].v : Symbol('yok');
  for (const d of drawn) {
    if (d.v === VARSAYILAN) continue;
    const etiket = labelOf(d.v);
    if (d.cizimHatasi) { FAIL(`(A) ${axisLabel} '${etiket}': cizim uretilemedi — ${d.cizimHatasi}`); continue; }
    if (d.parseHatasi) {
      // PARSE REDDİ. Sessiz degil: hata metni degeri ADIYLA anmak zorunda.
      const anildi = needlesOf(d.v).some((n) => d.parseHatasi.includes(n));
      if (!anildi) {
        FAIL(`(A) ${axisLabel} '${etiket}': motor reddediyor ama degeri ADIYLA anmiyor: "${d.parseHatasi}"`);
      } else {
        console.log(`UNEX  ${axisLabel} ${etiket.padEnd(16)} PARSE REDDI, adiyla: "${d.parseHatasi.slice(0, 78)}"`);
        unexpressed.push(etiket);
      }
      continue;
    }
    const ozdes = d.geo.key === TABAN.geo.key;
    const adiyla = needlesOf(d.v).some((n) => d.red.some((r) => r.startsWith(`${field}=`) && r.includes(n)));
    console.log(`    ${axisLabel} ${etiket.padEnd(16)} eleman ${String(d.geo.count).padStart(3)}  ` +
      `kontur ${d.geo.length.toFixed(2)}u  ${ozdes ? 'TABANLA OZDES' : 'FARKLI'}  red=[${d.red.join(' · ') || '-'}]`);
    if (ozdes && !adiyla) {
      FAIL(`(A) ${axisLabel} '${etiket}' TABANLA OZDES ciziyor (kontur farki 0.00u) ama motor bu ekseni ` +
           `ADIYLA REDDETMIYOR: desteklenmeyen_eksenler=[${d.red.join(' · ') || 'bos'}] — SESSIZ COKERTME`);
    } else if (!ozdes && adiyla) {
      FAIL(`(A) ${axisLabel} '${etiket}' ADIYLA REDDEDILDI ([${d.red.join(' · ')}]) ama cizim tabandan FARKLI ` +
           `(kontur ${d.geo.length.toFixed(2)}u vs taban ${TABAN.geo.length.toFixed(2)}u) — YALAN REDDI: ` +
           'reddedilen eksen uygulanmis olamaz');
    } else if (ozdes) {
      unexpressed.push(etiket);
    } else {
      OK(`(A) ${axisLabel} '${etiket}' IFADE EDILDI (tabandan geometrik olarak farkli)`);
    }
  }
  // BEYANLI ESANLAM — HÜKÜM: AYNI KOVA, ve ifade edildilerse AYNI GEOMETRI.
  //
  // Neden "bayt bayt ayni cikti" DEGIL: esanlam sozlugu (engine/vocab.json)
  // CUMLE->SPEC katmaninin sozlugudur; sevk edilen motorun kapali enum'u
  // kanonikleri tasir ve bir esanlami ADIYLA parse reddine ugratir. Ikisi de
  // birer REDDIR ve degeri ADIYLA anarlar, ama metinleri ayridir. Esanlamin
  // ihlal edebilecegi sey sudur ve kapi tam onu tutar: esanlam ile kanonigi
  // AYRI KOVAYA dusemez (biri cizilip digeri reddedilemez), ve ikisi de
  // ciziliyorsa geometrileri AYNI olmak zorundadir.
  const byV = new Map(drawn.map((d) => [d.v, d]));
  // İKİ KOVA VAR, ÜÇÜNCÜSÜ YOK (dosyanın başlığındaki hüküm). Parse reddi ayrı
  // bir kova DEĞİLDİR, UNEXPRESSED'in bir türüdür — başlık bunu açıkça söylüyor
  // ("adıyla reddedilmiştir ama ifade edilmemiştir"). Burada üçüncü bir kova
  // uydurmak, kapının kendi tanımıyla çelişmek olurdu; ayrıntı satırda basılır.
  const kova = (x) => (x.geo && x.geo.key !== TABAN.geo.key ? 'IFADE' : 'UNEXPRESSED');
  const nasil = (x) => (x.geo ? 'tabanla ozdes + adiyla red' : 'parse reddi, adiyla');
  for (const d of drawn) {
    const c = canonicalOf(d.v);
    if (c === d.v || !byV.has(c)) continue;
    const o = byV.get(c);
    if (kova(d) !== kova(o)) {
      FAIL(`(SYN) '${labelOf(d.v)}' vocab'da '${labelOf(c)}' esanlami ilan edilmis ama AYRI KOVAYA dusuyor: ` +
           `${kova(d)} vs ${kova(o)}`);
    } else if (kova(d) === 'IFADE' && d.geo.key !== o.geo.key) {
      FAIL(`(SYN) '${labelOf(d.v)}' ve kanonigi '${labelOf(c)}' ikisi de cizildi ama FARKLI geometri ` +
           `(kontur ${d.geo.length.toFixed(2)}u vs ${o.geo.length.toFixed(2)}u)`);
    } else {
      OK(`(SYN) '${labelOf(d.v)}' beyanli esanlam '${labelOf(c)}' ile ayni kovada: ${kova(d)} ` +
         `(${nasil(d)} / ${nasil(o)})`);
    }
  }
  return { unexpressed, drawn };
}

console.log('--- (A) KOL: her deger IFADE EDILDI mi, UNEXPRESSED mi?');
const SYN = VOCAB.fields[F_SLEEVE].synonyms || {};
const sleeveCanon = (v) => (SYN[v] && SLEEVE_DOMAIN.includes(SYN[v]) ? SYN[v] : v);
const sleeveRes = judge('kol', F_SLEEVE, SLEEVE_DOMAIN, (v) => ({ [F_SLEEVE]: v }), (v) => v, sleeveCanon, (v) => [String(v)]);

console.log('');
console.log('--- (A) YAKA: her deger IFADE EDILDI mi, UNEXPRESSED mi?');
const collarRes = judge('yaka', F_COLLAR, COLLAR_DOMAIN, (v) => ({ [F_COLLAR]: v }),
  (v) => `${v}=${collarName(v)}`, (v) => v, (v) => [String(v), collarName(v)]);

console.log('');
console.log('--- (A) OMUZ: her deger IFADE EDILDI mi, UNEXPRESSED mi?');
const shoulderRes = judge('omuz', F_SHOULDER, SHOULDER_DOMAIN, (v) => ({ [F_SHOULDER]: v }),
  (v) => `${v}=${shoulderName(v)}`, (v) => v, (v) => [String(v), shoulderName(v)]);

// ---------------------------------------------------------------------------
// (C) SICILIN KAPALI ENUM'UNUN HER DEGERI BIR YAZIMDAN ULASILABILIR OLACAK
// ---------------------------------------------------------------------------
// Sicile yeni bir kol degeri girerse yazimi olmayan deger sessizce duz kola
// dusemez. v1 yazim -> v2 kayit eslemesi contract/spec-v1-v2-map.json'dan
// OKUNUR (eskiden kalemin `sleeveV2` fonksiyonundan geliyordu; kalem oldu,
// esleme sozlesmede zaten yaziliydi). Sozlesmede karsiligi olmayan yazim
// KENDI ADIYLA aranir — kalemin yaptigi da buydu.
console.log('');
console.log('--- (C) SICIL ENUM KAPSAMI (garment-spec-v2 topology.sleeve.values)');
const MAPV = ((V1V2.axes || {})[F_SLEEVE] || {}).values || {};
const sleeveV2 = (w) => {
  const rec = MAPV[w];
  if (rec && typeof rec.v2 === 'string') return rec.v2.replace(/^sleeve\./, '');
  const c = sleeveCanon(w);
  if (c !== w && MAPV[c] && typeof MAPV[c].v2 === 'string') return MAPV[c].v2.replace(/^sleeve\./, '');
  return w;
};
for (const v2 of Object.keys(SICIL.topology.sleeve.values)) {
  const hit = SLEEVE_DOMAIN.filter((w) => sleeveV2(w) === v2);
  if (!hit.length) FAIL(`(C) sicil degeri '${v2}' icin alanda TEK BIR yazim yok — motor onu hicbir yoldan alamaz`);
  else OK(`(C) sicil '${v2}' <- ${hit.join(', ')}`);
}

// ---------------------------------------------------------------------------
// CIRCIR — SAYI ARTIK ELLE YAZILMIYOR (H3-B). TAVAN 15 DEGIL, 3.
// ---------------------------------------------------------------------------
// ⛔ ONCEKI HALI VE NEDEN GEVSETMEYDI. H3'un ilk kosusunda burada su duruyordu:
//     const RATCHET = { sleeveStyle: 7, collarType: 6, shoulderStyle: 2 };
// Ondan onceki taban {0, 4, 1} idi. Yani izin verilen "ifade edilemeyen" toplami
// 5'ten 15'e cikmisti (3 kat) ve UCU DE TAM TAVANDAYDI — tavani bugunku olcume
// esitlemek, kapiyi bir LASTIK DAMGAYA cevirir: tek bir degerin bile kaybi
// yakalanmaz, cunku tavan zaten oradadir, ve sayinin nereden geldigini kimse
// turetemez. Hakem bunu adiyla yazdi.
//
// ⭐ ONARIM: SAYIYI DUSURMEK DEGIL, SAYIYI KALDIRMAK. 7/6/2 SAHTE BIR SECIMDI
//   ama {0,4,1}'i geri yazmak da dogru degildi: o sayilar CROQUIS KALEMININ
//   olcumuydu ve o kalem sahte bir kol ciziyordu — kalibi olmayan bir kol.
//   Yuzey hattinda bu uc eksenin durumu bir SAYI degil, bir OLGU: motor uclerini
//   de ADIYLA reddediyor (G5 sevk edilmedi). O yuzden circir artik su:
//
//       TAVAN = MOTORUN BUTUNUYLE REDDETTIGI EKSEN SAYISI (bugun 3)
//
//   ve axis basina UNEXPRESSED sayisi TURETILIR: butunuyle reddedilen bir eksende
//   varsayilan disindaki HER degerin UNEXPRESSED olmasi bir SONUCTUR, secim
//   degil — ve kapi bunu ayrica SART kosuyor (bir deger ifade edilmisse eksen
//   "butunuyle reddedilmis" degildir ve tavan dusmustur). Butunuyle reddedilmemis
//   bir eksende ise tolerans SIFIRDIR: tek bir UNEXPRESSED bile kirmizi duser.
//
//   Boylece: (a) elle yazilmis tek bir kova sayisi kalmadi; (b) sozluge yeni bir
//   kol kelimesi eklemek tavani BUYUTMUYOR (tavan kelime saymiyor, eksen sayiyor);
//   (c) G5 sevk edilip kol cizilmeye baslayinca eksen listeden duser ve tavan
//   3 -> 2'ye iner; (d) bir ekseni sessizce dusurmek imkansiz, cunku o zaman
//   "butunuyle reddedilmis" olmaz ve sifir toleransa carpar.
const REDDEDILEN_EKSEN_TAVANI = 3;   // bugun: kol · yaka · omuz (hepsi G5)
const GOT = { [F_SLEEVE]: [sleeveRes, SLEEVE_DOMAIN], [F_COLLAR]: [collarRes, COLLAR_DOMAIN],
              [F_SHOULDER]: [shoulderRes, SHOULDER_DOMAIN] };
console.log('');
console.log('--- CIRCIR (tavan = butunuyle reddedilen EKSEN sayisi; kova sayilari TURETILIR)');
let butunuyleRed = 0;
for (const [axis, [res, domain]] of Object.entries(GOT)) {
  // Varsayilan deger kovalanmaz (tabanin kendisidir), o yuzden payda domain-1.
  const yargilanan = domain.length - 1;
  const got = res.unexpressed;
  const hepsi = got.length === yargilanan;
  const line = `${axis} UNEXPRESSED ${got.length}/${yargilanan}` + (got.length ? `  [${got.join(' · ')}]` : '');
  if (hepsi) {
    butunuyleRed += 1;
    OK(`CIRCIR ${line} — eksen BUTUNUYLE reddedilmis (G5 sevk edilmedi); sayi bir SONUC, tavan degil`);
  } else if (got.length === 0) {
    OK(`CIRCIR ${line} — eksenin her degeri IFADE EDILDI, hicbir borc yok`);
  } else {
    FAIL(`CIRCIR ${line} — eksen NE butunuyle reddedilmis NE butunuyle ifade edilmis. ` +
         'Kismi bir eksende tolerans SIFIRDIR: motor bu ekseni tasiyabildigini gosterdigine gore, ' +
         'kalan degerler ya cizilecek ya da AYRI eksenler olarak adiyla reddedilecek.');
  }
}
console.log(`    butunuyle reddedilen eksen: ${butunuyleRed}  (circir tavani ${REDDEDILEN_EKSEN_TAVANI})`);
if (butunuyleRed > REDDEDILEN_EKSEN_TAVANI) {
  FAIL(`CIRCIR — butunuyle reddedilen eksen ${butunuyleRed} > tavan ${REDDEDILEN_EKSEN_TAVANI}: ` +
       'urun bir eksen KAYBETTI');
} else if (butunuyleRed < REDDEDILEN_EKSEN_TAVANI) {
  OK(`CIRCIR — butunuyle reddedilen eksen ${butunuyleRed} < tavan ${REDDEDILEN_EKSEN_TAVANI}: tavan DUSTU. ` +
     "Sabitlemek ayri ve bilincli bir commit'tir (REDDEDILEN_EKSEN_TAVANI).");
} else {
  OK(`CIRCIR — butunuyle reddedilen eksen ${butunuyleRed} = tavan ${REDDEDILEN_EKSEN_TAVANI} (kol · yaka · omuz = G5). Sayi yalniz dusebilir.`);
}

console.log('');
console.log(`flat_expresses_spec_check: ${fails} FAIL`);
process.exit(fails ? 1 : 0);
