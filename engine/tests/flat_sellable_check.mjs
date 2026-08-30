#!/usr/bin/env node
// flat_sellable_check.mjs — ETSY KAPISI (F-E, 2026-08-23).
//
// Damla (SSB-10/11/12): "flatlerin testi SATILIR MI, ETSY'LIK MI... hayirsa
// olmamis, gelistirme yollari aranacak ve DEVELOP EDILECEK. sadece hata rapor
// etmesin, hataysa COZUM DUSUNSUN."
//
// This gate measures the MECHANICAL half of "Etsy-grade". Taste is NOT gated —
// taste items go to DAMLA-KUYRUK.md and the referee is Damla.
//
// EVERY THRESHOLD HERE COMES FROM OUTSIDE THIS ENGINE (v5 SSC). No number is
// derived from our own output, because deriving a gate from the thing it judges
// is circular. The sources:
//
//   [E1] Etsy listing photo: recommended 4:3 landscape (or 1:1), minimum 2000 px
//        on the SHORTEST side (zoom does not engage below it).
//   [E2] Etsy search thumbnail: 570 x 456 px = 5:4 = 1.25, CENTRE-cropped from
//        the first photo. Anything outside that centred box is invisible in
//        search. [E1]+[E2] together force a safe box; that is a derivation,
//        not a preference.
//   [L]  contract/flat-convention-v1.json — the F-D flat law (ink, line classes,
//        scale). Re-used, never re-declared, never loosened.
//   [K10] contract/tables.json _sources — only status="verified" columns may be
//        printed on something we would sell.
//
// MEASURED BEFORE THIS GATE EXISTED (GECE/log/F-E.shots/BEFORE-*):
//   the bare F-D flat is 744x262 = aspect 2.840; under [E2] only 37.5% of its
//   ink survives, and because FRONT sits at x=184 and BACK at x=560 BOTH
//   garments fall outside the kept band. The Etsy search thumbnail of our own
//   showcase image was two sliced torsos.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));
// ===========================================================================
// H3 (2026-08-30) — KAPI SILINMEDI, SARILAN CIZIM DEGISTI.
// ===========================================================================
// Bu kapinin sorusu degismedi: SATTIGIMIZ SEYIN LISTELEME GORSELI ETSY'NIN
// YAYINLANMIS GEOMETRISINDEN gecer mi. 30 Agustos'a kadar sarilan flat croquis
// kalemininkiydi (`render-garment-flat.mjs` -> `web/lib/flat-core.js`); H3 o
// kalemi sildi ve kullaniciya giden cizim artik kalibin kesildigi yuzeyin
// projeksiyonu (engine.flatJSON -> web/lib/flat-from-plan.js). Sarmalayici
// (render-listing-sheet.mjs) ayni sarmalayicidir ve HICBIR esigi gevsetilmedi.
// Olcek: sayfa 1:3'u bir sabitten okumayi biraktı, ama KANUNU da birakmadi —
// H3-B'de capa `LAW.scale.unitMM`'e GERI baglandi ve cizimin kendi beyaninin
// kanuna esitligi ayrica sart kosuldu. (H3'un ilk kosusu capayi yalnizca cizimin
// beyanina tasimisti; hakem "kendi kendini onayliyor" dedi ve hakliydi. Kanunun
// kendisi de bu commit'te duzeltildi: 1:3 yaziyordu, urun 1:1 basiyordu.)
const BUNDLE = join(root, 'engine/dist/stitchu-engine.js');
const FLAT_MOD = join(root, 'web/lib/flat-from-plan.js');
const SIZE = process.env.V3C_SIZE || 'EU38';
const engine = await (await import(BUNDLE)).default();
const { renderFlatFromPlan } = await import(FLAT_MOD);
const { renderListingSheet, ETSY } = await import(join(root, 'engine/tools/render-listing-sheet.mjs'));
/** Sevk edilen hattin cizimi. Fikstur degil: create.js'in cagirdigi iki adim. */
function renderShippedFlat(spec) {
  const F = JSON.parse(engine.flatJSON(spec, { size: SIZE }));
  if (F.error) throw new Error(`flatJSON reddetti: ${F.error}`);
  return renderFlatFromPlan(F);
}

let fails = 0;
const FAIL = (m) => { console.log(`FAIL  ${m}`); fails += 1; };
const OK = (m) => console.log(`ok    ${m}`);
const NOTE = (m) => console.log(`note  ${m}`);

const INK = LAW.ink.color.toLowerCase();
const CLASSES = Object.entries(LAW.lineClasses.classes);

// ⭐ MATRIS 8'E GERI CIKARILDI (H3-B). H3'un ilk kosusu bunu 8'den 5'e dusurdu ve
// hakem bunu bir GEVSETME olarak yazdi — hakli: bir kapinin gordugu giysi sayisi
// onun kapsamidir. Dusmesinin SEBEBI gercekti (eski 8 spec `shaping:'darts'`,
// `sleeveStyle:'set'`, `topLength:'crop'` gibi yuzey hattinin KAPALI ENUM'unda
// hic olmayan kelimeler tasiyordu; croquis kalemi onlari sormadan cizerdi, yuzey
// hatti ADIYLA reddediyor), ama cozumu matrisi kucultmek degil YENIDEN KURMAKTI.
// Asagidaki sekizi olculerek secildi: her biri motorun kapali enum'undan gecen,
// gercekten cizilen bir spec, ve ikisi de birbirinden farkli (uc giysi sinifi x
// iki kumas x iki klos x bes yaka). Reddedilen eksenler yine ADIYLA raporlanir.
const MATRIX = [
  ['elbise scoop a-line',  { garment: 'dress', shaping: 'dart',     fabric: 'woven', skirtStyle: 'aLine',    neckline: 'scoop' }],
  ['elbise vneck duz',     { garment: 'dress', shaping: 'dart',     fabric: 'woven', skirtStyle: 'straight', neckline: 'vNeck' }],
  ['elbise princess kare', { garment: 'dress', shaping: 'princess', fabric: 'woven', skirtStyle: 'aLine',    neckline: 'square' }],
  ['etek a-line',          { garment: 'skirt', shaping: 'dart',     fabric: 'woven', skirtStyle: 'aLine',    neckline: 'crew', sleeveStyle: 'none' }],
  ['etek duz',             { garment: 'skirt', shaping: 'dart',     fabric: 'woven', skirtStyle: 'straight', neckline: 'crew', sleeveStyle: 'none' }],
  ['top scoop a-line',     { garment: 'top',   shaping: 'dart',     fabric: 'woven', skirtStyle: 'aLine',    neckline: 'scoop' }],
  ['top princess boat',    { garment: 'top',   shaping: 'princess', fabric: 'woven', skirtStyle: 'straight', neckline: 'boat' }],
  ['orme sweetheart',      { garment: 'top',   shaping: 'dart',     fabric: 'knit',  skirtStyle: 'aLine',    neckline: 'sweetheart' }],
];

const SIZES = Object.keys(TABLES.draft.euSizeChart).filter((k) => /^EU\d+$/.test(k));
const FIELDS = TABLES.draft.euSizeChart._fields;
const SRC = TABLES.draft.euSizeChart._sources || {};
const UNSOURCED = FIELDS.filter((f) => (SRC[f] || {}).status !== 'verified');

// --- geometry: every drawn point of the sheet, in sheet user units ------------
function pointsOf(d) {
  const tok = d.match(/[MLCQZ]|-?\d+(?:\.\d+)?/gi) || [];
  const out = []; let i = 0, cmd = '';
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    const t = tok[i];
    if (/^[MLCQZ]$/i.test(t)) { cmd = t.toUpperCase(); i += 1; if (cmd === 'Z') continue; }
    if (cmd === 'M' || cmd === 'L') out.push([num(), num()]);
    else if (cmd === 'C') { out.push([num(), num()], [num(), num()], [num(), num()]); }
    else if (cmd === 'Q') { out.push([num(), num()], [num(), num()]); }
    else i += 1;
  }
  return out.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

/** Parse translate()/scale() out of a transform attribute into {dx,dy,sx,sy}.
 *  scale(-1,1) is a REAL transform here (the flat mirrors its right half), so
 *  the sign is kept. An earlier version of this parser took |sx| and then pushed
 *  BOTH signs "to be safe"; that invented 8 phantom points per sheet, 1166 units
 *  outside the frame, and the gate failed all 8 styles on its own artefact.
 *  Being sloppy in the direction of "stricter" is still being wrong. */
function xf(tr) {
  const tm = (tr || '').match(/translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/);
  const sm = (tr || '').match(/scale\(\s*(-?[\d.]+)\s*(?:[\s,]+(-?[\d.]+))?\s*\)/);
  return {
    dx: tm ? parseFloat(tm[1]) : 0,
    dy: tm ? parseFloat(tm[2]) : 0,
    sx: sm ? parseFloat(sm[1]) : 1,
    sy: sm ? (sm[2] !== undefined ? parseFloat(sm[2]) : parseFloat(sm[1])) : 1,
  };
}
const compose = (c, t) => ({
  tx: c.tx + c.sx * t.dx, ty: c.ty + c.sy * t.dy,
  sx: c.sx * t.sx, sy: c.sy * t.sy,
});

/** Walk the sheet, applying nested group AND element transforms, and return
 *  every drawn point in ROOT sheet coordinates. Needed because the flat rides
 *  inside a translate+scale group and mirrors halves with an element-level
 *  scale(-1,1); measuring untransformed coords would let a drawing sit outside
 *  the safe box while the gate called it green. */
function drawnPointsRoot(svg) {
  const pts = [];
  const re = /<g\b([^>]*)>|<\/g>|<(path|line|circle)\b([^>]*?)\/?>/g;
  const stack = [{ tx: 0, ty: 0, sx: 1, sy: 1 }];
  let m;
  while ((m = re.exec(svg))) {
    if (m[0].startsWith('</g')) { if (stack.length > 1) stack.pop(); continue; }
    if (m[0].startsWith('<g')) {
      stack.push(compose(stack[stack.length - 1], xf((m[1].match(/transform="([^"]*)"/) || [])[1])));
      continue;
    }
    const tag = m[2], at = m[3] || '';
    const c = compose(stack[stack.length - 1], xf((at.match(/transform="([^"]*)"/) || [])[1]));
    const push = (x, y) => pts.push([c.tx + c.sx * x, c.ty + c.sy * y]);
    const g = (k) => parseFloat((at.match(new RegExp(`\\s${k}="([^"]*)"`)) || [])[1] || 'NaN');
    if (tag === 'path') {
      const d = at.match(/\sd="([^"]*)"/); if (!d) continue;
      for (const [x, y] of pointsOf(d[1])) push(x, y);
    } else if (tag === 'line') {
      const x1 = g('x1'), y1 = g('y1'), x2 = g('x2'), y2 = g('y2');
      if ([x1, y1, x2, y2].every(Number.isFinite)) { push(x1, y1); push(x2, y2); }
    } else if (tag === 'circle') {
      const cx = g('cx'), cy = g('cy'), r = g('r') || 0;
      if (Number.isFinite(cx) && Number.isFinite(cy)) { push(cx - r, cy - r); push(cx + r, cy + r); }
    }
  }
  return pts;
}

// =============================================================================
console.log('--- ETSY KAPISI (flat_sellable_check) ---');
console.log(`sources: [E1] etsy listing photo 4:3 / min ${ETSY.minShortSidePx}px short side`);
console.log(`         [E2] etsy search thumbnail 570x456 = ${(570 / 456).toFixed(3)} centre crop`);
console.log(`         [L]  contract/flat-convention-v1.json   [K10] contract/tables.json _sources`);

let worstSafe = 1;
for (const [name, spec] of MATRIX) {
  let flat;
  try { flat = renderShippedFlat(spec); }
  catch (e) { FAIL(`${name}: sevk edilen cizim uretilemedi — ${e.message}`); continue; }
  const sheet = renderListingSheet(flat, { title: name.replace(/_/g, ' ') });
  // OLCEK CAPASI — KANUNA GERI BAGLANDI (H3-B). H3'un ilk kosusunda capa
  // `LAW.scale.unitMM`'den cizimin KENDI beyanina tasinmisti; hakem bunu adiyla
  // yazdi ("kendi kendini onayliyor") ve hakliydi: beyanini kendi beyaniyla
  // dogrulayan bir belge hicbir sey dogrulamaz. Simdi UCU birden tutuyor —
  // cizimin beyani KANUNA esit olmak zorunda, sayfanin birimi de o kanundan
  // turemek zorunda. (Kanunun kendisi de bu commit'te duzeltildi: 1:3 yaziyordu,
  // sevk edilen cizim 1:1 basiyordu; celiskiyi kapatan kapi flat_convention_check §2.)
  const flatUnitMM = parseFloat((/<svg\b[^>]*\sdata-unit-mm="([^"]*)"/.exec(flat) || [])[1]);
  if (!Number.isFinite(flatUnitMM) || flatUnitMM <= 0) {
    FAIL(`${name}: flat kokunde data-unit-mm beyani YOK — sayfa olcegi turetilemez`);
    continue;
  }
  if (Math.abs(flatUnitMM - LAW.scale.unitMM) > 1e-12) {
    FAIL(`${name}: flat data-unit-mm=${flatUnitMM}, kanun scale.unitMM=${LAW.scale.unitMM} — cizim kanunun olceginde degil`);
    continue;
  }

  const vb = sheet.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!vb) { FAIL(`${name}: sheet has no viewBox`); continue; }
  const W = parseFloat(vb[1]), H = parseFloat(vb[2]);

  // --- 1. [E1] upload aspect is 4:3 -----------------------------------------
  const asp = W / H;
  const aspErr = Math.abs(asp - ETSY.uploadAspect) / ETSY.uploadAspect;
  if (aspErr > 0.005) FAIL(`${name}: sheet aspect ${asp.toFixed(4)} != 4:3 (err ${(aspErr * 100).toFixed(2)}%)`);

  // --- 2. [E1]+[E2] all ink inside the centred 5:4 thumbnail safe box --------
  const safeW = H * ETSY.thumbAspect;
  const x0 = (W - safeW) / 2, x1 = x0 + safeW;
  const pts = drawnPointsRoot(sheet);
  if (pts.length < 20) { FAIL(`${name}: only ${pts.length} drawn points parsed — parser blind, gate meaningless`); continue; }
  const outside = pts.filter(([x, y]) => x < x0 - 0.5 || x > x1 + 0.5 || y < -0.5 || y > H + 0.5);
  const frac = 1 - outside.length / pts.length;
  worstSafe = Math.min(worstSafe, frac);
  if (outside.length) {
    const w = outside.reduce((a, p) => Math.max(a, Math.max(x0 - p[0], p[0] - x1, -p[1], p[1] - H)), 0);
    FAIL(`${name}: ${outside.length}/${pts.length} drawn points outside the 5:4 thumbnail safe box (worst overhang ${w.toFixed(1)} u) — invisible in Etsy search`);
  }

  // --- 3. scale bar arithmetic (self-consistency, geometry) ------------------
  const A = (k) => { const m = sheet.match(new RegExp(`${k}="([^"]*)"`)); return m ? m[1] : null; };
  const kFlat = parseFloat(A('data-flat-scale'));
  const unitMM = parseFloat(A('data-sheet-unit-mm'));
  const barMM = parseFloat(A('data-scale-bar-mm'));
  const barU = parseFloat(A('data-scale-bar-units'));
  if (![kFlat, unitMM, barMM, barU].every(Number.isFinite)) {
    FAIL(`${name}: sheet does not declare flat-scale / unit-mm / scale-bar`);
  } else {
    const expUnit = LAW.scale.unitMM / kFlat;
    if (Math.abs(unitMM - expUnit) / expUnit > 0.005) FAIL(`${name}: declared sheet-unit-mm ${unitMM} != law unitMM ${LAW.scale.unitMM} / flat-scale ${kFlat} = ${expUnit.toFixed(4)}`);
    const drawnMM = barU * unitMM;
    if (Math.abs(drawnMM - barMM) / barMM > 0.005) FAIL(`${name}: scale bar is drawn ${barU.toFixed(2)} u = ${drawnMM.toFixed(1)} mm but LABELLED ${barMM} mm — the sheet lies about size`);
  }

  // --- 4. human-readable declarations (a buyer sees ink, not data-*) ---------
  const texts = [...sheet.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((t) => t[1]);
  const blob = texts.join(' | ').toUpperCase();
  for (const [need, why] of [
    [`EU ${SIZES[0].slice(2)}`, 'size range'],
    ['PDF SEWING PATTERN', 'what is being sold'],
    ['PRINT AT 100%', 'the one instruction a PDF pattern buyer must see'],
    [`${barMM} MM`, 'scale bar label'],
  ]) if (!blob.includes(need.toUpperCase())) FAIL(`${name}: sheet never renders "${need}" as visible text (${why})`);

  // --- 5. [K10] size chart complete, and NO unsourced column printed ---------
  for (const sz of SIZES) if (!texts.includes(sz)) FAIL(`${name}: size chart missing row ${sz}`);
  for (const f of UNSOURCED) {
    const label = f.replace('CM', '').toUpperCase();
    if (blob.includes(` ${label} (CM)`)) FAIL(`${name}: sheet prints UNSOURCED column "${f}" (K10 — Damla's decision, not ours)`);
  }

  // --- 6. [L] the flat law still holds on the sheet --------------------------
  for (const bad of LAW.fillLaw.forbidden) if (sheet.includes(bad)) FAIL(`${name}: sheet uses forbidden paint "${bad}"`);
  const strokes = new Set([...sheet.matchAll(/stroke="([^"]+)"/g)].map((m) => m[1].toLowerCase()));
  strokes.delete('none');
  if (strokes.size !== 1 || !strokes.has(INK)) FAIL(`${name}: sheet stroke colours {${[...strokes]}} != {${INK}}`);
  const fillsBad = [...sheet.matchAll(/\bfill="([^"]+)"/g)].map((m) => m[1].toLowerCase())
    .filter((f) => !LAW.fillLaw.allowedFills.includes(f));
  if (fillsBad.length) FAIL(`${name}: sheet fills outside the law: ${[...new Set(fillsBad)].join(',')}`);

  // every stroke width, divided out by the sheet's uniform factor, is a declared class
  const widths = [...sheet.matchAll(/<(?:path|line|circle|rect)\b[^>]*stroke-width="([\d.]+)"([^>]*)>/g)];
  for (const [, wRaw, rest] of widths) {
    const dash = (rest.match(/stroke-dasharray="([^"]+)"/) || [])[1] || null;
    const w = parseFloat(wRaw);
    const hit = CLASSES.some(([, c]) => (Math.abs(w - c.width) < 1e-6 || Math.abs(w - c.width * kFlat) < 1e-3) && (c.dash || null) === dash);
    if (!hit) FAIL(`${name}: stroke (width ${w}, dash ${dash}) is not a declared line class, at 1x or at sheet factor ${kFlat.toFixed(4)}`);
  }

  // --- 7. front + back survive into the sheet --------------------------------
  for (const v of LAW.views.required) if (!sheet.includes(`data-view="${v}"`)) FAIL(`${name}: sheet lost the "${v}" view`);

  // --- 8. ANTI-HACK: the sheet must WRAP the flat, never redraw it -----------
  const flatDs = [...flat.matchAll(/\sd="([^"]{40,})"/g)].map((m) => m[1]);
  const missing = flatDs.filter((d) => !sheet.includes(d));
  if (flatDs.length && missing.length) FAIL(`${name}: ${missing.length}/${flatDs.length} flat paths are NOT byte-identical inside the sheet — the sheet redrew the garment instead of wrapping it`);
}

// --- 9. [E1] the rasteriser can actually reach 2000 px on the short side -----
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (existsSync(CHROME)) {
  const { rasterise } = await import(join(root, 'engine/tools/raster.mjs'));
  const { writeFileSync, mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const d = mkdtempSync(join(tmpdir(), 'sellable-'));
  const sv = join(d, 's.svg'), pg = join(d, 's.png');
  writeFileSync(sv, renderListingSheet(renderShippedFlat(MATRIX[0][1]), { title: 'gate' }));
  const r = rasterise(sv, pg, ETSY.minShortSidePx);
  if (Math.min(r.W, r.H) < ETSY.minShortSidePx) FAIL(`raster short side ${Math.min(r.W, r.H)} < Etsy minimum ${ETSY.minShortSidePx}`);
  else OK(`raster ${r.W}x${r.H}, short side ${Math.min(r.W, r.H)} >= Etsy minimum ${ETSY.minShortSidePx} [E1]`);
} else {
  NOTE(`no headless Chrome at ${CHROME} — raster resolution [E1] NOT MEASURED this run (not counted green)`);
}

if (!fails) {
  OK(`aspect 4:3 on ${MATRIX.length}/${MATRIX.length} styles [E1]`);
  OK(`thumbnail safe box: ${(worstSafe * 100).toFixed(2)}% of drawn points inside on the WORST style [E2]`);
  OK(`scale bar labelled length == drawn length; size chart ${SIZES.length} rows, ${FIELDS.length - UNSOURCED.length} verified cols, 0 unsourced printed [K10]`);
  OK(`flat law preserved on the sheet: one ink, declared line classes, zero forbidden paint [L]`);
}
console.log(fails ? `\nFAILED (${fails})` : '\nPASS');
process.exit(fails ? 1 : 0);
