// ============================================================================
// DERLEYİCİ FAZ 3 — SENTEZ. compile(spec) → {flat, kalıp}. TEK GİRİŞ NOKTASI.
// Damla direktifi 2026-07-22.
//
// Referans motor TEK HAKİKAT: flat = render-garment-flat köprüsü (referans kalem
// _engine-full.mjs). Cerrahi kopya YOK, 2. renderer YOK. Kalıp = draftJSON (WASM
// motor). İkisini tek fonksiyonda birleştirir.
//
// KURAL: spec gramere karşı doğrulanır (validateSpec). Eksik primitif varsa
// ÜRETME → boşluk raporu döndür. İkame YASAK. Determinizm: aynı spec → aynı
// byte (flat referans kalem deterministik; kalıp draftJSON deterministik).
// ============================================================================
import {validateSpec} from './parse.mjs';
import {createHash} from 'node:crypto';

// EU38 standart vücut (draftJSON için) — sizechart.hpp EU38.
const BODY = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

// spec'i draftJSON'un beklediği tam şekle genişlet (eksik alanlar default enum).
function draftSpec(spec) {
  // full circle etek = iki yarım-daireden kesilir → motor SkirtStyle::HalfCircle
  // (halfCirclePanel) draft eder; grammar 'fullCircle' → motor 'halfCircle'.
  const skirt = ['fullCircle', 'circle', 'full', 'halfCircle'].includes(spec.skirt) ? 'halfCircle' : (spec.skirt || 'aLine');
  // cap sleeve → sleeveCap enum 'cap' (index 3, vocab.gen.hpp kSleeveCap); the
  // set-in sleeve stays 'straight', the head is capped short (sleeve.cpp capCurve).
  const isCap = spec.sleeve === 'cap';
  return {
    garment: spec.garment, shaping: spec.shaping || 'dart',
    waistline: spec.waistline || 'natural', fabric: spec.fabric || 'woven',
    // strapless bandeau: motorda ayrı bir Neckline enum'u YOK; band-top strapless
    // düz üst kenarı 'square' bodice ile draft edilir (top_bandeau preview-truth spec
    // neckline=square — mevcut çalışma şekli, ikame değil bandeau'nun motor karşılığı).
    neckline: (spec.neckline === 'straight' || spec.neckline === 'strapless') ? 'square' : (spec.neckline || 'crew'),
    sleeveStyle: isCap ? 'straight' : (spec.sleeve || 'none'), sleeveLength: spec.sleeveLength || 'short',
    sleeveCap: isCap ? 'cap' : undefined,
    skirtStyle: skirt, skirtLength: spec.length || 'midi',
    topLength: spec.topLength || 'hip',
    // draftSpec tieClosure enum idx (vocab.gen.hpp kTieClosure): tieBack=4,
    // frontWaistTie=6, wrapFront=7, frontWaistBow=8. Bel bağı dirndl dress'te
    // (id24 bow / id57 tie) motor ayrı kesim parçası çizer (tie.cpp).
    tieClosure: spec.tieClosure === 'frontWaistBow' ? 8 : spec.tieClosure === 'frontWaistTie' ? 6
      : spec.closure === 'tieBack' ? 4 : spec.closure === 'wrapFront' ? 7 : 0,
    peplum: spec.peplum === 'full' ? 1 : spec.peplum === 'half' ? 2 : spec.peplum === 'pointed' ? 3 : 0,
    gatherType: spec.shirred === 'physics' ? 2 : 0,     // shirred
    gatherZone: spec.shirred === 'physics' ? 1 : 0,     // bust
    // ASKI ailesi (2026-07-22): StrapStyle enum none/ruffled/wide/spaghetti (0-3).
    ruffledStraps: spec.straps === 'ruffled' ? 1 : spec.straps === 'wide' ? 2 : spec.straps === 'spaghetti' ? 3 : 0,
  };
}

// compile: TEK giriş. Döner:
//   { ok:true, flat, kalip, specHash }  — üretildi
//   { ok:false, uretilemez:true, eksik_primitif, ... }  — boşluk raporu
export async function compile(rawSpec, opts = {}) {
  // 1) gramere karşı doğrula — eksik/uydurma primitif varsa ÜRETME
  const { spec, eksik_primitif, reddedilen } = validateSpec(rawSpec);
  if (eksik_primitif.length > 0) {
    return { ok: false, uretilemez: true, eksik_primitif, reddedilen, anlasilan: spec };
  }
  if (!spec.garment) {
    return { ok: false, uretilemez: true, eksik_primitif: ['garment-belirtilmedi'], anlasilan: spec };
  }

  // 2) FLAT — referans kalem köprüsü (tek hakikat). referenceStyle verilmişse onu
  // kullan, yoksa köprü spec'ten çıkarır. Fallback'e düşerse ÜRETİLEMEZ (köprü eksiği).
  const { renderGarmentFlatAsync } = await import('../tools/render-garment-flat.mjs');
  const flatSpec = opts.referenceStyle ? { ...spec, referenceStyle: opts.referenceStyle } : spec;
  const flat = await renderGarmentFlatAsync(null, flatSpec);
  const isReference = flat.includes('940 680');
  if (!isReference) {
    // köprüden geçmedi = fallback şematik. İkame/yaklaşık YASAK → boşluk raporu.
    return { ok: false, uretilemez: true, eksik_primitif: ['kopru-eslesmesi-yok'],
             not: 'spec köprüden geçmedi (fallback şematik) — bu spec için referans stil eşlemesi eksik', anlasilan: spec };
  }

  // 3) KALIP — draftJSON (WASM motor, deterministik).
  let kalip = null, kalipError = null;
  try {
    const createEngine = (await import('../dist/stitchu-engine.js')).default || (await import('../dist/stitchu-engine.js'));
    const engine = typeof createEngine === 'function' ? await createEngine() : createEngine;
    const out = JSON.parse(engine.draftJSON(draftSpec(spec), { ...BODY, upperBust: 0 }));
    if (out.error) kalipError = out.error; else kalip = out.pattern || out;
  } catch (e) { kalipError = e.message; }

  const specHash = createHash('md5').update(JSON.stringify(spec)).digest('hex').slice(0, 12);
  return {
    ok: true, spec, specHash,
    flat, flatIsReference: true,
    kalip, kalipError,
    flatHash: createHash('md5').update(flat).digest('hex').slice(0, 12),
  };
}

// CLI: node compile.mjs '{"garment":"top","neckline":"crew","shaping":"dart","topLength":"cropped"}'
import {pathToFileURL} from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const spec = JSON.parse(process.argv[2] || '{}');
  compile(spec, { referenceStyle: process.argv[3] }).then(r => {
    console.log(JSON.stringify({ ok: r.ok, uretilemez: r.uretilemez, eksik: r.eksik_primitif,
      specHash: r.specHash, flatHash: r.flatHash, flatRef: r.flatIsReference,
      kalipParca: r.kalip && r.kalip.pieces ? r.kalip.pieces.length : null, kalipError: r.kalipError }, null, 1));
  });
}
