#!/usr/bin/env node
// vision_tasima_check.mjs — F2-vision MANDALI (2026-09-01): FOTOGRAF OKUMASI
// MOTORA TAM ULASIR. Uc teshis kapatildi ve bu test uzerlerinde durur:
//
//   1) ORAN NULL'LAMASI KALKTI. Dusuk guvenli olcum atilmaz: 'belirsiz'
//      etiketiyle tasinir (seen.ratiosUncertain), kullaniciya adiyla soylenir,
//      kalip EN KISITLAYICI degeri (standart tabloyu) kullanir.
//   2) 7 SUREKLI ORANIN HEPSININ MOTOR EKSENINDE BIR TUKETICISI VAR
//      (contract/vision-tasima-v1.json oranKablolari): fixture okumada oran
//      degisince KALIP HASHI degisir — oran kaliba mm olarak iner. Esikler
//      motorun KENDI cizdigi mm'lerin orta noktalari; bu test dogrudan motoru
//      cizdirip esikleri YENIDEN TURETIR ve kontrat sayisiyla karsilastirir.
//   3) outOfVocab TELI: her sozluk-disi terim ya bir motor eksenine ESLENIR
//      (cozumu vocab-resolution-v1.json primitif demetine gider) ya ADIYLA
//      reddedilir + en yakin dikilebilir oneri. Sessiz dusme 0.
//
// Fixture'lar KAYITLI okuma JSON'lari (engine/tests/fixtures/vision/) —
// canli Claude cagrisi YOK, ag YOK, para YOK.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');

const bridge = await import(join(root, 'web/js/vision-bridge.js'));
const {
  applyMeasuredRatios, applyRatioAxes, pickSkirtFullness, refreshSkirtLengthMM,
  resolveOutOfVocab, buildSeenRecord, uncertainRatioNames,
} = bridge;
const { missingFeatures } = await import(join(root, 'web/js/missing.js'));
const { engineSpec } = await import(join(root, 'backend/spec-core.js'));
const { VISION_TASIMA } = await import(join(root, 'web/js/contract.gen.js'));
const createEngine = (await import(join(root, 'engine/dist/stitchu-engine.js'))).default;
const eng = await createEngine();

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails += 1; };

// create.js DEMO_BODY — the body the product drafts on before real measurements.
const DEMO = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40, armLength: 58, neck: 35 };

const fixture = (name) =>
  JSON.parse(readFileSync(join(here, 'fixtures/vision', name), 'utf8'));

// The SAME wiring create.js runs (the shared bridge functions; the two old
// wires' verbatim lines are pinned by photo_ratio_wire_check, the four new
// ones live in applyRatioAxes — asserted on the product source below).
function specFromReading(seenIn, olcum) {
  const seen = JSON.parse(JSON.stringify(seenIn));
  const durum = applyMeasuredRatios(seen, olcum);
  const spec = {
    garment: seen.garment, neckline: seen.neckline, sleeveStyle: seen.sleeveStyle,
    sleeveLength: seen.sleeveLength, skirtStyle: seen.skirtStyle,
    skirtLength: seen.length, waistline: seen.waistline, fabric: seen.fabric,
  };
  const fullness = pickSkirtFullness(seen);
  if (fullness) spec.skirtStyle = fullness;
  spec.skirtLengthMM = refreshSkirtLengthMM(0, seen, DEMO, false);
  applyRatioAxes(spec, seen, DEMO);
  spec.seen = { ...buildSeenRecord(spec, seen), ratiosMeasured: seen.ratiosMeasured === true };
  return { spec, seen, durum };
}

function draftHash(spec) {
  const out = JSON.parse(eng.draftJSON(engineSpec(spec), { ...DEMO, backLength: 40.5, upperBust: 0 }));
  if (out.issues.length) { fail(`draft refused: ${out.issues} for ${JSON.stringify(spec)}`); return 'REFUSED'; }
  return createHash('sha256').update(JSON.stringify(out.pattern)).digest('hex');
}

// ---- 1) 7 SUREKLI ORAN → KALIP (oran degisince hash degisir) ---------------
const ORAN = VISION_TASIMA.oranKablolari;
const ratioKeys = Object.keys(ORAN).filter((k) => !k.startsWith('_'));
if (ratioKeys.length !== 7) fail(`oranKablolari 7 oran tasimiyor (${ratioKeys.length}: ${ratioKeys})`);

const fxA = fixture('okuma-askili-elbise.json');
const fxB = fixture('okuma-kollu-elbise.json');

// worker sema mandali: kablo tablosunun 7 anahtari olcum semasinin 7 sayisal
// alaniyla birebir (photo_ratio_wire_check ayni 7'yi backend kaynagindan okur).
for (const k of ratioKeys) {
  if (!(k in fxA.olcum.ratios)) fail(`fixture olcum '${k}' alanini tasimiyor — kablo/sema kopuk`);
}

const perturb = {
  lengthToWidth: 1.8,        // 1107mm → 855mm: surekli mm degisir
  hemToWaistWidth: 2.0,      // straight → gathered (SKIRT_FULLNESS_TABLE)
  waistYToLength: 0.28,      // 445mm natural → 310mm = empire (esik 375.5)
  neckDepthToLength: 0.11,   // 74.5mm crew → 121.8mm = scoop (esik 92)
  neckWidthToShoulder: 0.50, // 0.36 dar → 0.50 = boat (esik 0.4377)
  strapWidthToShoulder: 0.06, // 8.1mm spaghetti → 22.2mm = wide (esik 15)
  sleeveLenToGarment: 0.42,  // 227mm short → 465mm = long (esikler 283.5/448.4)
};

const baseA = specFromReading(fxA.seen, fxA.olcum);
if (baseA.durum !== 'measured') fail(`fixture A olcumu 'measured' degil (${baseA.durum})`);
if (!(baseA.spec.skirtLengthMM > 0)) fail('fixture A: lengthToWidth kaliba mm olarak inmedi (skirtLengthMM 0)');
const hashA = draftHash(baseA.spec);

const baseB = specFromReading(fxB.seen, fxB.olcum);
const hashB = draftHash(baseB.spec);

for (const k of ratioKeys) {
  const fx = (k === 'sleeveLenToGarment') ? fxB : fxA;
  const baseHash = (k === 'sleeveLenToGarment') ? hashB : hashA;
  const olcum = JSON.parse(JSON.stringify(fx.olcum));
  olcum.ratios[k] = perturb[k];
  const v = specFromReading(fx.seen, olcum);
  const h = draftHash(v.spec);
  if (h === baseHash) fail(`oran '${k}' degisti (${fx.olcum.ratios[k]} → ${perturb[k]}) ama kalip hashi AYNI — oran motora ulasmiyor`);
}

// mm SUREKLILIGI: ayni oran iki farkli degerde iki farkli mm (sinif degil).
{
  const o1 = JSON.parse(JSON.stringify(fxA.olcum)); o1.ratios.lengthToWidth = 2.0;
  const o2 = JSON.parse(JSON.stringify(fxA.olcum)); o2.ratios.lengthToWidth = 2.1;
  const s1 = specFromReading(fxA.seen, o1).spec.skirtLengthMM;
  const s2 = specFromReading(fxA.seen, o2).spec.skirtLengthMM;
  if (!(s1 > 0 && s2 > 0 && s1 !== s2)) fail(`mm surekliligi kirik: L/W 2.0→${s1}mm, 2.1→${s2}mm`);
}

// ---- 1b) ESIK KAYNAK MANDALI: kontrat sayilari motorun kendi ciziminden ----
// (engine/tools/vision-esik-olc.mjs'in turetimi burada yeniden kosulur.)
{
  const draftPieces = (s) => {
    const out = JSON.parse(eng.draftJSON(engineSpec(s), { ...DEMO, backLength: 40.5, upperBust: 0 }));
    if (out.issues.length) { fail(`esik turetim cizimi reddedildi: ${out.issues}`); return []; }
    return out.pattern.pieces;
  };
  const BASE = { garment: 'dress', sleeveStyle: 'none', skirtStyle: 'aLine', skirtLength: 'midi', neckline: 'crew' };
  const front = (s) => draftPieces(s).find((p) => p.name === 'Bodice Front');
  const bboxH = (pc) => {
    const ys = [];
    for (const c of pc.commands) {
      if (c.y !== undefined) ys.push(c.y);
      if (c.cp1y !== undefined) ys.push(c.cp1y, c.cp2y);
    }
    return Math.max(...ys) - Math.min(...ys);
  };
  const near = (a, b, tol, ad) => { if (Math.abs(a - b) > tol) fail(`esik kaynagi kaydi: ${ad} kontrat ${b}, motor ${a}`); };

  const crew = front(BASE); const scoop = front({ ...BASE, neckline: 'scoop' }); const boat = front({ ...BASE, neckline: 'boat' });
  near((crew.commands[0].y + scoop.commands[0].y) / 2, ORAN.neckDepthToLength.esikMM, 0.6, 'neckDepth esikMM');
  near((crew.commands[1].x / crew.commands[2].x + boat.commands[1].x / boat.commands[2].x) / 2,
    ORAN.neckWidthToShoulder.esikOran, 0.01, 'neckWidth esikOran');
  near((bboxH(front({ ...BASE, waistline: 'natural' })) + bboxH(front({ ...BASE, waistline: 'empire' }))) / 2,
    ORAN.waistYToLength.esikMM, 0.6, 'waistY esikMM');
  const sleeveH = (sl) => bboxH(draftPieces({ ...BASE, sleeveStyle: 'straight', sleeveLength: sl }).find((p) => p.name === 'Sleeve'));
  const sh = sleeveH('short'); const el = sleeveH('elbow'); const lo = sleeveH('long');
  near((sh + el) / 2, ORAN.sleeveLenToGarment.esiklerMM[0], 0.6, 'sleeve esik 1');
  near((el + lo) / 2, ORAN.sleeveLenToGarment.esiklerMM[1], 0.6, 'sleeve esik 2');
  // strap esigi motor sabitlerinden (strap.hpp:40 spaghetti 8mm + constants
  // kStrapFinishedWidthMM 22mm); sabitler C++ kaynagindan regex'le okunur.
  const strapSrc = readFileSync(join(root, 'engine/src/strap.hpp'), 'utf8');
  const spagMatch = strapSrc.match(/spaghettiWidth\s*=\s*([\d.]+)/);
  const constSrc = readFileSync(join(root, 'engine/src/constants.gen.hpp'), 'utf8');
  const wideMatch = constSrc.match(/kStrapFinishedWidthMM\s*=\s*([\d.]+)/);
  if (!spagMatch || !wideMatch) fail('strap sabitleri kaynakta bulunamadi (strap.hpp / constants.gen.hpp)');
  else near((Number(spagMatch[1]) + Number(wideMatch[1])) / 2, ORAN.strapWidthToShoulder.esikMM, 0.01, 'strap esikMM');
}

// ---- 2) BELIRSIZ: dusuk guven ATILMAZ, etiketle tasinir --------------------
const fxU = fixture('okuma-belirsiz.json');
{
  const { spec, seen, durum } = specFromReading(fxU.seen, fxU.olcum);
  if (durum !== 'belirsiz') fail(`dusuk guvenli olcum 'belirsiz' donmedi (${durum})`);
  if (seen.ratiosMeasured !== false) fail('belirsiz okuma ratiosMeasured=false degil');
  if (!seen.ratiosUncertain) fail('belirsiz oranlar TASINMADI (ratiosUncertain bos) — null-and-forget geri gelmis');
  const names = uncertainRatioNames(seen);
  for (const n of ['lengthToWidth', 'hemToWaistWidth', 'waistYToLength']) {
    if (!names.includes(n)) fail(`belirsiz oran adi '${n}' kullaniciya soylenemiyor (uncertainRatioNames: ${names})`);
  }
  if (spec.skirtLengthMM !== 0) fail(`belirsiz oran kalibi SEKILLENDIRDI (skirtLengthMM ${spec.skirtLengthMM}) — en kisitlayici deger kurali kirik`);
  if (!spec.seen.ratiosUncertain) fail('buildSeenRecord belirsiz oranlari tasimiyor — durustluk katmani kor');
  // EN KISITLAYICI DEGER: belirsiz okumanin kalibi, olcumsuz (standart tablo)
  // kalibiyla bayt-ayni olmali.
  const noMeasure = specFromReading(fxU.seen, { ok: false, confidence: 0.3, ratios: null });
  if (draftHash(spec) !== draftHash(noMeasure.spec)) {
    fail('belirsiz okuma standart-tablo kalibindan FARKLI kalip cizdi — dusuk guvenli sayi drafta sizmis');
  }
}

// ---- 3) outOfVocab TELI: sessiz dusme 0 ------------------------------------
const fxO = fixture('okuma-oov.json');
{
  const { spec, seen } = specFromReading(fxO.seen, fxO.olcum);
  const kararlar = resolveOutOfVocab(seen, spec);
  if (kararlar.length !== fxO.seen.outOfVocab.length) {
    fail(`oov karar sayisi ${kararlar.length} != terim sayisi ${fxO.seen.outOfVocab.length} — SESSIZ DUSME`);
  }
  for (const k of kararlar) {
    if (k.durum !== 'eslendi' && k.durum !== 'reddedildi') fail(`'${k.term}' ucuncu (sessiz) yolda (${k.durum})`);
    if (k.durum === 'reddedildi' && !(k.oneri && k.oneri.tr && k.oneri.en)) {
      fail(`'${k.term}' reddedildi ama ONERISIZ — kullaniciya sonraki adim yok`);
    }
    if (k.durum === 'eslendi' && !(k.eksen && k.cozum)) {
      fail(`'${k.term}' eslendi ama eksen/cozum tasimiyor — primitif demetine yol yok`);
    }
  }
  const byTerm = Object.fromEntries(kararlar.map((k) => [k.term, k]));
  const expect = {
    'drawstring neckline': 'eslendi', 'welt pocket': 'reddedildi', 'french cuff': 'reddedildi',
    'patch pocket': 'eslendi', 'peter pan collar': 'eslendi', 'handkerchief hem': 'reddedildi',
    'watteau train hood': 'reddedildi', 'crochet lace overlay': 'reddedildi',
  };
  for (const [term, durum] of Object.entries(expect)) {
    if (!byTerm[term]) fail(`'${term}' icin karar YOK`);
    else if (byTerm[term].durum !== durum) fail(`'${term}' beklenen '${durum}', gelen '${byTerm[term].durum}'`);
  }
  if (byTerm['crochet lace overlay'] && byTerm['crochet lace overlay'].kural !== 'bilinmeyen') {
    fail(`bilinmeyen terim 'bilinmeyen' kuralina dusmedi (${byTerm['crochet lace overlay'].kural})`);
  }
  // seen kaydi karari tasir ve missing.js reddi ONERIYLE basar.
  if (!Array.isArray(spec.seen.oovKarar) || spec.seen.oovKarar.length !== kararlar.length) {
    fail('buildSeenRecord oovKarar tasimiyor — urun yolu ile olcum yolu ayristi');
  }
  const cards = missingFeatures(spec.seen, 'tr');
  const welt = cards.find((c) => /welt pocket/i.test(c.label));
  if (!welt) fail("missing.js 'welt pocket' kartini basmadi — kullanici reddi goremiyor");
  else if (!welt.note || !/en yakın|yakın/i.test(welt.note)) {
    fail(`'welt pocket' karti oneri tasimiyor (note: ${welt.note})`);
  }
}

// ---- 4) KAYNAK MANDALI: urun yolu bu kablolari gercekten cagiriyor ---------
{
  const createSrc = readFileSync(join(root, 'web/js/create.js'), 'utf8');
  if (!/applyRatioAxes\(spec, seen, values\)/.test(createSrc)) {
    fail('create.js applyRatioAxes(spec, seen, values) cagirmiyor — 4 yeni oran kablosu urun yolunda kopuk');
  }
  if (!/uncertainRatioNames/.test(createSrc) || !/create\.spec\.ratiobelirsiz/.test(createSrc)) {
    fail('create.js belirsiz oranlari kullaniciya soylemiyor (uncertainRatioNames / ratiobelirsiz kablosu yok)');
  }
  const i18nSrc = readFileSync(join(root, 'web/js/i18n.js'), 'utf8');
  if (!/create\.spec\.ratiobelirsiz/.test(i18nSrc)) fail('i18n create.spec.ratiobelirsiz anahtari yok');
  const missingSrc = readFileSync(join(root, 'web/js/missing.js'), 'utf8');
  if (!/oovKarar/.test(missingSrc)) fail('missing.js oovKarar okumuyor — red cumlesi kullaniciya ulasmiyor');
}

if (fails) { console.error(`vision_tasima_check: ${fails} FAIL`); process.exit(1); }
console.log('vision_tasima_check: OK — 7/7 oran kaliba iniyor (hash tanik), belirsiz etiketle tasiniyor, oov sessiz dusme 0');
