// gen-techpack-pdf.mjs — the HUMAN-readable factory spec sheet for a tech-pack.
// Reads the machine-readable manifest that tools/tech-pack.cpp emitted (100%
// motor-derived: size table, cut list, fabric/gramaj, marker efficiency, graded
// DXF paths) and lays it out as a production spec PDF a factory can read:
//   page 1  spec cover   : recipe + param + fabric width + gramaj + graded-size
//                          count + the cut list (per-piece cut note + seam
//                          allowance), read off the manifest
//   page 2  grade table  : every EU size — body measurements (cm), pieces,
//                          fabric metres, fabric weight (when gsm given), marker
//                          roll length + efficiency, graded DXF file name
//
// Nothing is re-derived here: every number is copied out of the manifest the
// engine wrote, so the PDF cannot drift from the machine package. Deterministic
// (no dates, no randomness) — same manifest -> the same PDF bytes.
//
// usage: node gen-techpack-pdf.mjs <manifest.json> <out.pdf>
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { createHash } from 'crypto';
import { Pdf, Ctx, A4, wrap } from './pdf-core.mjs';

const [manifestPath, outPath] = process.argv.slice(2);
if (!manifestPath || !outPath) {
  console.error('usage: node gen-techpack-pdf.mjs <manifest.json> <out.pdf>');
  process.exit(2);
}

const man = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (man.schema !== 'stitchu.techpack/1') {
  console.error(`unexpected manifest schema '${man.schema}'`);
  process.exit(1);
}

const NAVY = ['0.1216', '0.2275', '0.3725'];
const INK = ['0.0667', '0.0667', '0.0667'];
const GREY = ['0.4000', '0.4000', '0.4000'];

const paramName = Object.keys(man.param)[0];
const paramVal = man.param[paramName];
const fmt = (v, d = 1) => (v === null || v === undefined ? '-' : Number(v).toFixed(d));

const pdf = new Pdf();

// ---- page 1: spec cover + cut list --------------------------------------
{
  const c = new Ctx(A4.h);
  const M = 18;
  let y = 28;
  c.text(M, y, 20, NAVY, 'Production tech pack', null); y += 10;
  c.text(M, y, 11, GREY, `${man.recipe}  .  ${man.garment}`, null); y += 8;
  c.stroke(0.3, GREY); c.dash(null); c.line(M, y, A4.w - M, y); y += 10;

  c.text(M, y, 12, NAVY, 'Package settings', null); y += 8;
  const rows = [
    [`${paramName}`, `${fmt(paramVal)} mm`],
    ['marker fabric width', `${fmt(man.markerFabricWidthMM)} mm`],
    ['fabric estimate width', `${man.fabricEstimateWidthCM} cm`],
    ['gramaj (GSM)', man.gsm === null ? 'not supplied' : `${fmt(man.gsm, 0)} g/m2`],
    ['graded sizes clean', `${man.gradedSizesClean} / ${man.gradedSizesTotal}`],
  ];
  for (const [k, v] of rows) {
    c.text(M, y, 9, GREY, k, null);
    c.text(M + 52, y, 9, INK, v, null);
    y += 6;
  }
  y += 6;

  // Cut list — take the first clean size as the representative piece list (piece
  // names + cut notes are constant across the grade; the grade table shows the
  // dimensions per size). Honest: if no size drafted, say so.
  const sample = man.sizes.find((s) => s.pieces) || null;
  c.text(M, y, 12, NAVY, 'Cut list', null); y += 8;
  if (!sample) {
    c.text(M, y, 9, INK, 'No size drafted a pattern (see grade table for the refusal reason).', null);
    y += 6;
  } else {
    c.text(M, y, 8.5, GREY, `piece list is constant across the grade (dimensions per size on page 2).`, null);
    y += 7;
    for (const piece of sample.pieces) {
      const sa = (piece.seamAllowanceMM / 10).toFixed(1);
      const line = `${piece.name}  -  ${piece.cutInstruction}  -  seam allowance ${sa} cm`;
      for (const ln of wrap(line, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln, null); y += 5.6; }
      y += 1.2;
    }
  }
  y += 8;
  c.text(M, y, 9, GREY, 'Every number in this pack is the engine\'s own deterministic output.', null); y += 5.6;
  c.text(M, y, 9, GREY, 'Graded DXF-AAMA/ASTM files ship next to this PDF (one per size); marker efficiency is', null); y += 5.6;
  c.text(M, y, 9, GREY, 'the measured piece area over the consumed fabric rectangle at the width above.', null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---- page 2: grade table ------------------------------------------------
{
  let c = new Ctx(A4.h);
  const M = 14;
  let y = 24;
  const newPage = () => { pdf.page(A4.w, A4.h, c.s); c = new Ctx(A4.h); y = 22; };

  c.text(M, y, 16, NAVY, 'Grade table (EU 34-52)', null); y += 9;
  c.text(M, y, 9, GREY, 'bust/waist/hip in cm; fabric at 140 cm wide; marker at the package width.', null); y += 9;

  // column layout (mm from left margin), tuned to A4 width.
  const cols = [
    ['size', 0], ['bust', 22], ['waist', 40], ['hip', 58],
    ['pcs', 78], ['fabric', 94], ['weight', 118], ['roll mm', 146], ['eff %', 172], ['dxf', 190],
  ];
  const header = () => {
    c.stroke(0.4, INK); c.dash(null);
    for (const [name, x] of cols) c.text(M + x, y, 8.5, NAVY, name, null);
    y += 3; c.line(M, y, A4.w - M, y); y += 5;
  };
  header();

  for (const s of man.sizes) {
    if (y > A4.h - 20) { newPage(); c.text(M, y, 12, NAVY, 'Grade table (cont.)', null); y += 9; header(); }
    const b = s.body || {};
    const cell = (x, txt, rgb = INK) => c.text(M + x, y, 8.5, rgb, txt, null);
    cell(0, s.size, NAVY);
    if (s.draftError) {
      cell(22, `refused: ${s.draftError}`.slice(0, 60), GREY);
      y += 6;
      continue;
    }
    cell(22, fmt(b.bustCM));
    cell(40, fmt(b.waistCM));
    cell(58, fmt(b.hipCM));
    cell(78, String(s.pieceCount ?? '-'));
    cell(94, `${fmt(s.fabricMeters140)} m`);
    cell(118, s.fabricWeightG === null || s.fabricWeightG === undefined ? '-' : `${fmt(s.fabricWeightG, 0)} g`);
    if (s.marker) {
      cell(146, fmt(s.marker.rollLengthMM));
      cell(172, fmt(s.marker.efficiency * 100));
    } else {
      cell(146, s.nestError ? 'nest refused' : '-', GREY);
    }
    // dxf: show just the size fragment (the file name is recipe.size.dxf).
    cell(190, s.dxf ? 'yes' : '-', s.dxf ? INK : GREY);
    // validator flag as a trailing mark if not clean.
    if (s.validatorClean === false) { c.text(M + 200, y, 8.5, ['0.7', '0.15', '0.15'], '!', null); }
    y += 6;
  }

  y += 8;
  c.text(M, y, 8.5, GREY, 'A "!" marks a size the validator flagged (it does not ship as clean). "refused" / "nest refused"', null); y += 5;
  c.text(M, y, 8.5, GREY, 'are honest engine refusals, never a silently dropped size.', null);
  pdf.page(A4.w, A4.h, c.s);
}

const buf = pdf.build();
mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, buf);
const hash = createHash('sha256').update(buf).digest('hex');
console.log(`PDF ${resolve(outPath)} sha256=${hash}`);
console.log(`pages: 2 (spec cover + grade table)  bytes: ${buf.length}`);
console.log(`recipe: ${man.recipe}  sizes: ${man.sizes.length}  clean: ${man.gradedSizesClean}/${man.gradedSizesTotal}`);
