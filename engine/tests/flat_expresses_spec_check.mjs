#!/usr/bin/env node
// flat_expresses_spec_check.mjs — İFADE KAPISI (V4-B, 2026-08-24;
//                                 DEĞER ALANI TÜRETİLDİ V4-E, 2026-08-24).
//
// ===========================================================================
// V4-E — HAKEMİN BULDUĞU KUSUR VE ONARIMI (hüküm tartışılmadı, onarıldı)
// ===========================================================================
// V4-B'de bu kapının kol değer alanı ELLE YAZILMIŞTI:
//     const SLEEVE_VALUES = ['none', 'set', 'raglan', 'puff', 'cap'];
// Bağımsız hakem bunu ölçtü: liste tam olarak o gece onarılan iki değer + zaten
// ayrışan üçüydü — yani kapı, GEÇTİĞİ ŞEYE GÖRE şekillenmişti. Alan dışı
// yoklandığında `straight · balloon · bishop · kimono · dolman · ZZZNONSENSE`
// altısının altısı da `set` ile eleman kümesi ÖZDEŞ, kontur 2705.08u, fark
// 0.00u çıkıyordu. Ve fiilen kullanılan değerler tam da bunlardı: takipli
// JSON'larda `straight` 237, `balloon` 35 kez geçiyor, `raglan`/`puff`/`set`
// SIFIR kez. RULES invariant 1 ihlali en çok kullanılan değerlerin üstünde
// duruyordu ve kapı oraya hiç bakmıyordu.
//
// ONARIM: ALAN ARTIK ELLE YAZILMIYOR, KAYNAKTAN TÜRETİLİYOR (§DOMAIN altında,
// beş kaynak, hepsi diskten okunuyor). Kapının kendi kanaati yok; bir değer
// alana girer çünkü ya bir sözleşme onu BEYAN ediyordur ya da repodaki spec
// JSON'larında FİİLEN geçiyordur.
//
// İKİ KOVA VAR, ÜÇÜNCÜSÜ YOK:
//   İFADE EDİLDİ  — aynı taban spec'te başka her kanonik değerden geometrik
//                   olarak FARKLI çizim (fark > 0; eşik yok, eşitlik/eşitsizlik).
//   UNEXPRESSED   — çizim başka bir değerinkiyle ÖZDEŞ, AMA kalem o değeri
//                   ADIYLA `data-engine-gap`'e damgalıyor ve kapı onu ADIYLA
//                   sayıyor. Damgasız özdeşlik (sessiz çökertme) = KIRMIZI.
// UNEXPRESSED bir gevşetme değil, DÜRÜSTLÜKTÜR: bugün ifade edilemeyeni yeşile
// boyamak yerine bir SAYIYA bağlıyoruz ve o sayı RATCHET'lı — yalnız düşebilir.
//
// EŞANLAM İSTİSNASI (uydurma değil, BEYANLI): engine/vocab.json
// kol alaninin beyanli esanlamlari: `puff->balloon`, `bishop->balloon`,
// `set-in->straight`, `fitted->straight` diyor. Beyanlı eşanlamların AYNI
// çizmesi doğrudur; kapı onları ÖNCE kanonikleştirir ve ayrıca eşanlamın
// kanoniğiyle özdeş çizdiğini DE şart koşar (beyanı yalanlayan eşanlam da bir
// kusurdur).
//
// ===========================================================================
// NEDEN AYRI DOSYA (§7.5 sayacının 2/3'ü): bu kapı ayrı bir TEST ADI olmak
// zorunda. flat_convention_check bugün YEŞİL bir ad; içine yazılsaydı geliştirme
// boyunca o ad kırmızıya döner ve RULES 9'un saydığı kırmızı AD kümesi 6'dan
// 7'ye çıkardı. Yargıladığı şey de başka: konvansiyon kapısı "flat AYNI
// MODELDEN mi çıkmış" diye sorar (aynılık), bu kapı "flat FARKLI GİYSİYİ farklı
// mı çiziyor" diye sorar (ayrım).
//
// İKİ AYRI OTORİTE VAR — ÖLÇÜLEREK AYRILDI (V4-B, ayakta):
//   (1) contract/flat-convention-v1.json  -> FLAT'in kanunu (croquis.sleeveLaw).
//   (2) contract/garment-spec-v2.json     -> KALIP motorunun sicili. `sleeve` ve
//       `collarFamily` operatörleri bugün **absent**.
// Kolu sicile bakıp SİLMEK denendi ve flat_geometry_sellable_check S5/S6
// kırmızıya döndü (o kapı kollu stillerin kolu ÇİZMESİNİ şart koşuyor) — yani
// kırmızı AD kümesi 6'dan 7'ye çıkıyordu, RULES 9. Silme GERİ ALINDI. Hüküm:
// flat'in ifade gücünü (1) tanımlar, (2) ise KALIP boşluğunu ADLANDIRIR.
//
// FARKIN ÖLÇÜSÜ SHA DEĞİL GEOMETRİDİR. sha bir bayt imzasıdır; bir boşluk
// değişikliği onu oynatır, yani "farklı çizdim" diye yalan söylemeyi kolaylaştırır.
// Bu kapı SVG'nin ÇİZEN ELEMAN KÜMESİNİ çıkarır (her path'in d'si + her çizili
// ilkelin geometri imzası) ve ayrıca toplam KONTUR UZUNLUĞUNU sayar.

import { readFileSync } from 'node:fs';
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
const pen = await import(join(root, 'engine/tools/render-garment-flat.mjs'));

// ALAN ADLARI DA ELLE YAZILMIYOR. engine/vocab.json her alani bir enum TIPINE
// bagliyor; alan adi o tipten bulunuyor. Boylece kapinin metninde tek bir alan
// adi elle yazili kalmiyor (V4-E kusur 1'in ayni ilkesi, bir kat asagida).
const fieldOf = (enumType) => {
  const k = Object.keys(VOCAB.fields).find((f) => VOCAB.fields[f].enum === enumType);
  if (!k) throw new Error(`engine/vocab.json icinde ${enumType} tipli alan YOK`);
  return k;
};
const F_SLEEVE = fieldOf('SleeveStyle');
const F_COLLAR = fieldOf('CollarType');
const F_SHOULDER = fieldOf('ShoulderStyle');
const { renderGarmentFlat, expressibility } = pen;

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);

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

// Kağıt zemini (paper fill) ve <text> DIŞARIDA — biri arka plan, diğeri yazı.
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

// ---------------------------------------------------------------------------
// DOMAIN — DEĞER ALANI KAYNAKTAN TÜRETİLİR (V4-E kusur 1'in onarımı)
// ---------------------------------------------------------------------------
// KAYNAK 1 — repodaki spec JSON'larında FİİLEN geçen değerler. Takipli JSON
// listesi git'ten alınır; "hangi klasöre bakayım" diye bir seçim YAPILMAZ, o da
// bir elle-seçme olurdu. Aynı sayıyı kabuktan basan komut:
//   F=<alan-adi>; git ls-files -z '*.json' | xargs -0 grep -ho "\"$F\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" \
//     | sed 's/.*: *"//;s/"//' | sort | uniq -c | sort -rn
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

console.log('flat_expresses_spec_check');
console.log('  flat kanunu : contract/flat-convention-v1.json  (ifade gucunu BU tanimlar)');
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
console.log('    kullanim: ' + sortedByUse([...USE_SLEEVE.keys()], USE_SLEEVE).map((v) => `${v} ${USE_SLEEVE.get(v)}`).join(' · '));
console.log('');

// --- YAKA ALANI -------------------------------------------------------------
// Yaka alani SAYIDIR. Sayi -> ad eslemesi engine/vocab.json'un kapali enum'unun
// SIRASIDIR (CollarType), uydurulmus bir tablo degil.
const COLLAR_NAMES = VOCAB.fields[F_COLLAR].values;              // index = int deger
const USE_COLLAR = census(F_COLLAR, false);
const COLLAR_DOMAIN = sortedByUse(uniq([...COLLAR_NAMES.keys()].map(String).concat([...USE_COLLAR.keys()])), USE_COLLAR)
  .map(Number).filter((v) => Number.isInteger(v) && v >= 0 && v < COLLAR_NAMES.length);
const collarName = (i) => COLLAR_NAMES[i] || `#${i}`;
console.log('--- DOMAIN: yaka degeri alani TURETILDI (elle yazilmadi)');
console.log(`    engine/vocab.json fields.${F_COLLAR}.values          ${COLLAR_NAMES.join(' ')}`);
console.log(`    contract/garment-spec.schema.json draftSpec.${F_COLLAR} ${(SCHEMA.$defs.draftSpec.properties[F_COLLAR].enum || []).join(' ')}`);
console.log('    spec JSON kullanimi: ' + sortedByUse([...USE_COLLAR.keys()], USE_COLLAR).map((v) => `${v}(${collarName(Number(v))}) ${USE_COLLAR.get(v)}`).join(' · '));
console.log(`    => ALAN (${COLLAR_DOMAIN.length}): ${COLLAR_DOMAIN.map((i) => `${i}=${collarName(i)}`).join(' ')}`);
console.log('');

// ---------------------------------------------------------------------------
// ORTAK YARGI — iki kova, ucuncusu yok.
// ---------------------------------------------------------------------------
// canonicalOf : deger -> kanonik deger (beyanli esanlam cozumu). Esanlamlar
// birbirinin AYNISI cizmek ZORUNDA; kanonikler birbirinden FARKLI cizmek zorunda.
function judge(axisLabel, domain, patchOf, labelOf, canonicalOf, stampNeedle) {
  const drawn = domain.map((v) => ({ v, ...draw(patchOf(v)) }));
  for (const d of drawn) {
    console.log(`    ${axisLabel} ${labelOf(d.v).padEnd(16)} eleman ${String(d.geo.count).padStart(3)}  kontur ${d.geo.length.toFixed(2)}u` +
      (d.gap ? `  kalip-boslugu="${d.gap}"` : ''));
  }
  // 1) BEYANLI ESANLAM: kanonigiyle OZDES cizmek zorunda.
  const byV = new Map(drawn.map((d) => [d.v, d]));
  for (const d of drawn) {
    const c = canonicalOf(d.v);
    if (c === d.v || !byV.has(c)) continue;
    if (byV.get(c).geo.key === d.geo.key) OK(`(SYN) '${labelOf(d.v)}' beyanli esanlam '${labelOf(c)}' ile OZDES ciziyor`);
    else FAIL(`(SYN) '${labelOf(d.v)}' vocab'da '${labelOf(c)}' esanlami ilan edilmis ama FARKLI ciziyor (kontur ${d.geo.length.toFixed(2)}u vs ${byV.get(c).geo.length.toFixed(2)}u)`);
  }
  // 2) KANONIKLER: geometri anahtarina gore kumele. Bir kumede birden cok
  //    kanonik varsa, ILKI (en cok kullanilan) ifade edilmis sayilir, kalanlar
  //    UNEXPRESSED — ve ADIYLA damgali olmak ZORUNDA.
  const canon = drawn.filter((d) => canonicalOf(d.v) === d.v);
  const clusters = new Map();
  for (const d of canon) {
    if (!clusters.has(d.geo.key)) clusters.set(d.geo.key, []);
    clusters.get(d.geo.key).push(d);
  }
  const unexpressed = [];
  for (const [, group] of clusters) {
    if (group.length === 1) { OK(`(A) '${labelOf(group[0].v)}' IFADE EDILDI (alandaki her kanonik degerden farkli)`); continue; }
    const [keep, ...rest] = group;
    OK(`(A) '${labelOf(keep.v)}' IFADE EDILDI (kumenin en cok kullanilani)`);
    for (const d of rest) {
      const needle = stampNeedle(d.v);
      if (!d.gap.includes(needle)) {
        FAIL(`(A) '${labelOf(d.v)}' ile '${labelOf(keep.v)}' AYNI flat'i uretiyor (eleman kumesi ozdes, kontur farki 0.00u) ve damga onu ADIYLA saymiyor: "${d.gap}" — SESSIZ COKERTME`);
      } else {
        console.log(`UNEX  '${labelOf(d.v)}' == '${labelOf(keep.v)}' (kontur ${d.geo.length.toFixed(2)}u, fark 0.00u); damga "${d.gap}" -> UNEXPRESSED`);
        unexpressed.push(labelOf(d.v));
      }
    }
  }
  return { unexpressed, drawn };
}

console.log('--- (A) KOL: her deger IFADE EDILDI mi, UNEXPRESSED mi? (olcu: cizen eleman kumesi + kontur uzunlugu)');
const SYN = VOCAB.fields[F_SLEEVE].synonyms || {};
const sleeveCanon = (v) => (SYN[v] && SLEEVE_DOMAIN.includes(SYN[v]) ? SYN[v] : v);
const sleeveRes = judge(F_SLEEVE, SLEEVE_DOMAIN, (v) => ({ [F_SLEEVE]: v }), (v) => v, sleeveCanon, (v) => `${F_SLEEVE}=${v}:`);

console.log('');
console.log('--- (A) YAKA: her deger IFADE EDILDI mi, UNEXPRESSED mi?');
const collarRes = judge(F_COLLAR, COLLAR_DOMAIN, (v) => ({ [F_COLLAR]: v }), (v) => `${v}=${collarName(v)}`, (v) => v, (v) => `${F_COLLAR}=${v}:`);

// --- OMUZ EKSENI ------------------------------------------------------------
// `raglan` bir KOL degeri DEGILDIR (V4-E olcumu): hicbir kaynak onu kol
// alanina koymuyor; engine/vocab.json ve garment-spec.schema.json onu OMUZ
// ekseninde ilan ediyor. V4-B kalemi raglan'i yanlis eksene
// baglamisti. Eksen buraya TURETILEREK giriyor ve raglan onarimi boylece bir
// KAPIYLA korunuyor: raglan omuz dikissiz topolojidir, `set` ile ozdes cizerse
// kirmizi duser.
const SHOULDER_DOMAIN = uniq([
  ...(VOCAB.fields[F_SHOULDER] ? VOCAB.fields[F_SHOULDER].values : []),
  ...((SCHEMA.$defs.draftSpec.properties[F_SHOULDER] || {}).enum || []),
]);
console.log('');
console.log('--- DOMAIN: omuz degeri alani TURETILDI (elle yazilmadi)');
console.log(`    engine/vocab.json fields.${F_SHOULDER}.values         ${(VOCAB.fields[F_SHOULDER] || {}).values.join(' ')}`);
console.log(`    contract/garment-spec.schema.json draftSpec.${F_SHOULDER} ${((SCHEMA.$defs.draftSpec.properties[F_SHOULDER] || {}).enum || []).join(' ')}`);
console.log(`    => ALAN (${SHOULDER_DOMAIN.length}): ${SHOULDER_DOMAIN.join(' ')}`);
console.log('--- (A) OMUZ: her deger IFADE EDILDI mi, UNEXPRESSED mi?');
// Omuz ekseni ancak KOLLU bir giyside okunur (kol yoksa cizilecek raglan dikisi
// de yoktur). Taban spec'e kolun en cok kullanilan yazimi eklenir — bu da elle
// secilmiyor, kullanim sayimindan geliyor.
const TOP_SLEEVE = sortedByUse([...USE_SLEEVE.keys()].filter((v) => v !== 'none'), USE_SLEEVE)[0];
console.log(`    taban kol = '${TOP_SLEEVE}' (spec JSON'larinda en cok kullanilan kolsuz-olmayan yazim, ${USE_SLEEVE.get(TOP_SLEEVE)} kez)`);
const shoulderRes = judge(F_SHOULDER, SHOULDER_DOMAIN,
  (v) => ({ [F_SLEEVE]: TOP_SLEEVE, [F_SHOULDER]: v }), (v) => v, (v) => v, (v) => `${F_SHOULDER}=${v}:`);

// ---------------------------------------------------------------------------
// (B) SICILIN KESEMEDIGI HER DEGER `data-engine-gap`'te ADIYLA GECECEK
// ---------------------------------------------------------------------------
console.log('');
console.log('--- (B) KALIP BOSLUGU ADLANDIRILIYOR MU? (sicil: garment-spec-v2 operators)');
for (const written of SLEEVE_DOMAIN) {
  const v2 = pen.sleeveV2(written);
  const d = draw({ [F_SLEEVE]: written });
  const e = v2 === undefined ? { ok: false, unknown: true, missing: [] } : expressibility('sleeve', v2);
  if (written === 'none' || e.ok) { OK(`(B) sleeve '${written}' -> ${v2} sicilde shipped/bosluksuz`); continue; }
  const needle = `${F_SLEEVE}=${written}:`;
  if (!d.gap.includes(needle)) {
    FAIL(`(B) sleeve '${written}' motorda kesilemiyor (eksik: ${e.missing.join('+') || 'sicilde yok'}) ama data-engine-gap onu ADIYLA saymiyor: "${d.gap}"`);
  } else if (!e.unknown && !e.missing.every((op) => d.gap.includes(op))) {
    FAIL(`(B) sleeve '${written}' adlandirildi ama EKSIK OPERATORU saymiyor (eksik: ${e.missing.join('+')}, damga: "${d.gap}")`);
  } else {
    OK(`(B) sleeve '${written}' -> ${d.gap}`);
  }
}
for (const ct of COLLAR_DOMAIN) {
  if (ct === 0) { OK(`(B) ${F_COLLAR} 0=none — yaka yok, bosluk yok`); continue; }
  const d = draw({ [F_COLLAR]: ct });
  if (!d.gap.includes(`${F_COLLAR}=${ct}:collarFamily`)) {
    FAIL(`(B) ${F_COLLAR} ${ct}=${collarName(ct)} motorda kesilemiyor (collarFamily absent) ama data-engine-gap onu ADIYLA saymiyor: "${d.gap}"`);
  } else {
    OK(`(B) ${F_COLLAR} ${ct}=${collarName(ct)} -> ${d.gap}`);
  }
}

// ---------------------------------------------------------------------------
// (C) SICILIN KAPALI ENUM'UNUN HER DEGERININ BIR CIZIM DALI OLACAK
// ---------------------------------------------------------------------------
// Sicile yeni bir kol degeri girerse dali olmayan deger sessizce duz kola
// dusemez. Bu sart alani da elle yazilmaktan korur: enum buyurse kapi buyur.
console.log('');
console.log('--- (C) SICIL ENUM KAPSAMI (garment-spec-v2 topology.sleeve.values)');
for (const v2 of Object.keys(SICIL.topology.sleeve.values)) {
  const hit = SLEEVE_DOMAIN.filter((w) => pen.sleeveV2(w) === v2);
  if (!hit.length) FAIL(`(C) sicil degeri '${v2}' icin alanda TEK BIR yazim yok — kalem onu hicbir yoldan alamaz`);
  else OK(`(C) sicil '${v2}' <- ${hit.join(', ')}`);
}

// ---------------------------------------------------------------------------
// RATCHET — UNEXPRESSED sayisi BUGUN OLCULEN degerle tavanlanir, yalniz DUSER.
// ---------------------------------------------------------------------------
// Emsal: V3'un `UNMEASURED 3/6, ratchet tavani 3`. Tavan 24 Agu V4-E turunda
// OLCULDU (asagidaki liste kapinin kendi ciktisidir, elle sayilmadi):
//   kol   UNEXPRESSED 0
//   yaka  UNEXPRESSED 4   (mock · flat · shirt · crescent, hepsi stand'in bandi)
//   omuz  UNEXPRESSED 1   (dropped, set ile ozdes)
// Bu kova DURUSTLUKTUR, gevsetme degil: bugun ifade edilemeyeni yesile boyamak
// yerine SAYIYA bagliyoruz. Artiran commit kapida kirmizi duser.
const RATCHET = { [F_SLEEVE]: 0, [F_COLLAR]: 4, [F_SHOULDER]: 1 };
const GOT = { [F_SLEEVE]: sleeveRes, [F_COLLAR]: collarRes, [F_SHOULDER]: shoulderRes };
console.log('');
console.log('--- RATCHET (UNEXPRESSED yalniz DUSEBILIR)');
for (const [axis, cap] of Object.entries(RATCHET)) {
  const got = GOT[axis].unexpressed;
  const line = `${axis} UNEXPRESSED ${got.length}/${cap}` + (got.length ? `  [${got.join(' · ')}]` : '');
  if (got.length > cap) FAIL(`RATCHET ${line} — TAVAN ASILDI`);
  else OK(`RATCHET ${line}`);
}

console.log('');
console.log(`flat_expresses_spec_check: ${fails} FAIL`);
process.exit(fails ? 1 : 0);
