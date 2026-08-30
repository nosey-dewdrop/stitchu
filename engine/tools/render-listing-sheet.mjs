#!/usr/bin/env node
// render-listing-sheet.mjs — the ETSY LISTING SHEET (F-E, 2026-08-23).
//
// Damla (SSB-10): "flatlerin testi SATILIR MI, ETSY'LIK MI."
//
// WHY A SECOND ARTIFACT INSTEAD OF CHANGING THE FLAT
// --------------------------------------------------
// The FLAT is a law-governed technical drawing: one ink, and a scale it DECLARES
// (contract/flat-convention-v1.json scale.declared; H3-B'de "1:3" -> "1:1" olarak
// duzeltildi, cunku sevk edilen cizim yuzeyin 1:1 projeksiyonu. H3 sonrasi o
// dosyanin kalan iki canli tuketicisinden biri bu dosyadir, kapisi degil).
// The LISTING SHEET is what a buyer actually sees in Etsy search. They are not
// the same object and they answer to different published rules. Rewriting the
// flat to satisfy Etsy would have broken the F-D law; wrapping it does not.
// The flat stays byte-identical inside the sheet — this tool never redraws it.
//
// THE THREE PUBLISHED NUMBERS THIS SHEET IS BUILT AROUND
// ------------------------------------------------------
//  (1) Etsy recommends listing photos at 4:3 landscape (or 1:1) — we emit 4:3.
//  (2) Etsy auto-crops the SEARCH THUMBNAIL to 570x456 px = 5:4 = 1.25, centred.
//      So 4:3 alone is not enough: a 4:3 upload loses 1 - 1.25/1.3333 = 6.25%
//      of its width in search. Therefore ALL INK MUST LIVE INSIDE THE CENTRED
//      5:4 SAFE BOX. That box is a derivation from (1)+(2), not a taste number.
//  (3) Etsy's listing-photo minimum is 2000 px on the SHORTEST side (below that
//      zoom does not engage). Rasterising is engine/tools/raster.mjs.
//
// Measured on the F-D shot before this tool existed:
//   locket-EU38-flat.svg is 744x262 = aspect 2.840. Under Etsy's centred 4:3
//   thumbnail crop only 46.9% of the width survives, and because FRONT sits at
//   x=184 and BACK at x=560 BOTH garments fall outside the kept band:
//   42.7% of the ink survives. The search thumbnail shows two sliced torsos.
//
// WHAT THE SHEET ADDS THAT THE BARE FLAT HAS NOTHING OF
// ------------------------------------------------------
// The bare flat carries its scale ONLY in `data-scale` — a machine attribute. A human buyer sees no size, no measurement, no size chart, no
// garment name: the F-D shot renders exactly two words, "FRONT" and "BACK".
// The sheet renders, as visible ink: garment name, size range, a scale bar
// whose drawn length is a round real-world length, and the size chart.
//
// SIZE CHART HONESTY (K10): only the three columns that contract/tables.json
// marks status="verified" (bustCM/waistCM/hipCM, burda style Damen-Masstabellen)
// are printed. shoulder/backLength/armLength/neck are the four KAYNAKSIZ columns
// awaiting Damla's decision — an unsourced number is not printed on a thing we
// would sell.
//
//   node engine/tools/render-listing-sheet.mjs <flat.svg> <out.svg> "<Title>"

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const LAW = JSON.parse(readFileSync(join(root, 'contract/flat-convention-v1.json'), 'utf8'));
const TABLES = JSON.parse(readFileSync(join(root, 'contract/tables.json'), 'utf8'));

const INK = LAW.ink.color;
const PAPER = LAW.ink.paper;
const UNIT_MM = LAW.scale.unitMM;          // mm of real garment per flat user unit
const MARK = LAW.lineClasses.classes.mark.width;

// --- published Etsy geometry -------------------------------------------------
export const ETSY = {
  uploadAspect: 4 / 3,      // recommended listing photo ratio
  thumbAspect: 570 / 456,   // = 1.25, the centred search-thumbnail crop
  minShortSidePx: 2000,     // listing-photo minimum for zoom
};

const F = 'Helvetica,Arial,sans-serif';
const n = (v) => (Math.round(v * 1000) / 1000).toFixed(3).replace(/\.?0+$/, '') || '0';

const SIZES = Object.keys(TABLES.draft.euSizeChart).filter((k) => /^EU\d+$/.test(k));
const FIELDS = TABLES.draft.euSizeChart._fields;
const SOURCES = TABLES.draft.euSizeChart._sources || {};
// only verified columns get printed (K10)
const VERIFIED = FIELDS
  .map((f, i) => ({ f, i }))
  .filter(({ f }) => (SOURCES[f] || {}).status === 'verified');

/** Pull the inner drawing out of a flat SVG: its viewBox and its content minus
 *  the paper rect (the sheet paints its own paper). The drawing is not touched. */
function openFlat(svgText) {
  const vb = svgText.match(/viewBox="([\d.\-\s]+)"/);
  if (!vb) throw new Error('flat svg has no viewBox');
  const [, , w, h] = vb[1].trim().split(/\s+/).map(Number);
  const head = /<svg\b[^>]*>/.exec(svgText);
  const at = (k) => { const m = new RegExp(`\\s${k}="([^"]*)"`).exec(head ? head[0] : ''); return m ? m[1] : null; };
  // ⭐ THE SCALE COMES FROM THE DRAWING, NOT FROM A CONSTANT IN THIS FILE (H3).
  // Until 2026-08-30 this tool assumed every flat was the croquis pen's 1:3
  // schematic and read `unitMM` off the law. The croquis pen is deleted and the
  // shipped flat is the surface line's 1:1 projection, so a hard-coded 3.0 would
  // have mislabelled the scale bar by a factor of three on the one artefact whose
  // whole job is to tell a buyer how big the garment is. The drawing declares its
  // own unit (`data-unit-mm`, gated by flat_convention_check §2); the sheet asks.
  const declared = parseFloat(at('data-unit-mm'));
  const unitMM = Number.isFinite(declared) && declared > 0 ? declared : UNIT_MM;
  let inner = svgText.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  inner = inner.replace(/<rect\b[^>]*\/>/, ''); // the paper rect only
  return { w, h, inner, unitMM, source: at('data-source'), dugum: at('data-dugum') };
}

export function renderListingSheet(flatSvgText, opts = {}) {
  const title = opts.title || 'SEWING PATTERN';
  const flat = openFlat(flatSvgText);

  // 4:3 sheet.
  const H = 900;
  const W = Math.round(H * ETSY.uploadAspect); // 1200

  // The centred 5:4 safe box — everything we draw must fit inside it.
  const safeW = H * ETSY.thumbAspect;          // 1125
  const safeX0 = (W - safeW) / 2;              // 37.5
  const SAFE_PAD = 34;
  const colX0 = safeX0 + SAFE_PAD;
  const colW = safeW - 2 * SAFE_PAD;           // 1057

  // vertical bands. The flat is a very wide drawing (front + back side by side,
  // aspect ~2.84) dropped into a 1.333 frame, so it is WIDTH-bound: giving the
  // art band more height buys nothing. The leftover height is therefore spent on
  // the things an Etsy pattern listing has to show anyway — scale bar and size
  // chart — instead of being left as dead paper.
  const TITLE_Y = 54, SUB_Y = 86;
  const ART_Y0 = 100, ART_H = 400;

  // fit the flat into the art box, uniform scale, centred
  const k = Math.min(colW / flat.w, ART_H / flat.h);
  const artW = flat.w * k, artH = flat.h * k;
  const artX = (W - artW) / 2;
  const artY = ART_Y0;

  const BAR_Y = artY + artH + 46;
  const TAB_Y0 = BAR_Y + 50;

  // The sheet applies a uniform factor k to the flat, so one SHEET unit is
  // flat.unitMM/k real millimetres — the flat's OWN declared unit, not a constant
  // here. Declared, not assumed: the gate re-derives it from the same declaration.
  const sheetUnitMM = flat.unitMM / k;

  // scale bar: a round real length, drawn at its true sheet length.
  const BAR_MM = 200;
  const barLen = BAR_MM / sheetUnitMM;
  const barX = colX0, barY = BAR_Y;
  const SW = MARK * k; // sheet furniture rides the same line class as the flat

  const t = (x, y, s, size, anchor = 'middle', weight = '400', ls = 0) =>
    `<text x="${n(x)}" y="${n(y)}" text-anchor="${anchor}" font-family="${F}" ` +
    `font-size="${size}" font-weight="${weight}"` +
    (ls ? ` letter-spacing="${ls}"` : '') + ` fill="${INK}">${s}</text>`;

  let s = '';
  s += t(W / 2, TITLE_Y, esc(title.toUpperCase()), 30, 'middle', '700', 4);
  s += t(W / 2, SUB_Y,
    `EU ${SIZES[0].slice(2)}–${SIZES[SIZES.length - 1].slice(2)} ` +
    `&#183; PDF SEWING PATTERN &#183; PRINT AT 100%`, 16, 'middle', '400', 2);

  s += `<g transform="translate(${n(artX)} ${n(artY)}) scale(${n(k)})">${flat.inner}</g>`;

  // scale bar with end ticks
  s += `<path d="M ${n(barX)} ${n(barY)} L ${n(barX + barLen)} ${n(barY)}" ` +
    `fill="none" stroke="${INK}" stroke-width="${n(SW)}"/>`;
  for (const bx of [barX, barX + barLen]) {
    s += `<path d="M ${n(bx)} ${n(barY - 7)} L ${n(bx)} ${n(barY + 7)}" ` +
      `fill="none" stroke="${INK}" stroke-width="${n(SW)}"/>`;
  }
  s += t(barX + barLen + 12, barY + 5, `${BAR_MM} mm ON THE GARMENT`, 15, 'start');

  // size chart — verified columns only
  const rowH = 24, headH = 26;
  const nCol = 1 + VERIFIED.length;
  const cw = colW / nCol; // span the full safe width, no dead right margin
  const tabX = colX0;
  s += t(tabX, TAB_Y0, 'SIZE', 15, 'start', '700', 1);
  VERIFIED.forEach(({ f }, j) => {
    s += t(tabX + cw * (j + 1), TAB_Y0, f.replace('CM', ' (CM)').toUpperCase(), 15, 'start', '700', 1);
  });
  s += `<path d="M ${n(tabX)} ${n(TAB_Y0 + 7)} L ${n(tabX + cw * nCol)} ${n(TAB_Y0 + 7)}" ` +
    `fill="none" stroke="${INK}" stroke-width="${n(SW)}"/>`;
  SIZES.forEach((sz, r) => {
    const y = TAB_Y0 + headH + rowH * r + 12;
    s += t(tabX, y, sz, 14, 'start');
    VERIFIED.forEach(({ i }, j) => {
      s += t(tabX + cw * (j + 1), y, String(TABLES.draft.euSizeChart[sz][i]), 14, 'start');
    });
  });

  const decl =
    `data-sheet="etsy-listing-v1" data-upload-aspect="4:3" ` +
    `data-thumb-safe-aspect="5:4" data-flat-scale="${n(k)}" ` +
    `data-sheet-unit-mm="${n(sheetUnitMM)}" data-scale-bar-mm="${BAR_MM}" ` +
    `data-scale-bar-units="${n(barLen)}" data-flat-unit-mm="${n(flat.unitMM)}" ` +
    // THE PROVENANCE OF THE DRAWING TRAVELS WITH THE SHEET (H3). It used to be
    // `data-croquis`, the id of a croquis that no longer exists; what identifies
    // the shipped flat now is the seam plan node it was projected from.
    `data-flat-source="${esc(flat.source || 'BEYAN YOK')}" ` +
    `data-flat-dugum="${esc(flat.dugum || 'BEYAN YOK')}" ` +
    `data-size-rows="${SIZES.length}" data-size-cols="${VERIFIED.length}"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ` +
    `width="100%" role="img" ${decl}>` +
    `<rect width="${W}" height="${H}" fill="${PAPER}"/>${s}</svg>`;
}

const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , inSvg, outSvg, title] = process.argv;
  if (!inSvg || !outSvg) {
    console.error('usage: render-listing-sheet.mjs <flat.svg> <out.svg> "<Title>"');
    process.exit(2);
  }
  writeFileSync(outSvg, renderListingSheet(readFileSync(inSvg, 'utf8'), { title }));
  console.log(`wrote ${outSvg}`);
}
