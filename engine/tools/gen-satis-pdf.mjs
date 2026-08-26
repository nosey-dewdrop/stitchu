// gen-satis-pdf.mjs — the customer-facing pattern pack for one RECIPE + one
// body (the sales packaging of the Gate 1 recipe path; PIPELINE Aşama 2 output,
// packaged — not a new stage). Everything printed here is compiled from the
// engine's own output: geometry from draftRecipeJSON (wasm, the SAME path the
// studio ships), tiling from web/js/sheet.js (single truth for the register
// system), cut notes / fabric estimate / sewing steps verbatim from the
// engine's guideSteps. No hand-drawn line, no invented instruction (KANUN:
// recetesiz cizgi yok). Deterministic: same recipe + body + param -> the same
// bytes (no dates, no randomness in the PDF writer).
//
// Page order:
//   1. cover        style title, measurements used, piece list (+ sheet codes),
//                   fabric requirement
//   2. scale check  10 x 10 cm square ("measure before cutting", industry
//                   standard) + the engine's own 3 cm square + 1 inch bar
//                   (guide step 1 references the 3 cm square) + print/assembly
//                   instructions
//   3..n. pattern   A4 tiled sheets with the product register system (frame,
//                   grid code, corner squares, join ticks, continuation arrows)
//   n+1.. guide     cut list + the engine's construction steps, verbatim
//
// usage: node gen-satis-pdf.mjs <recipe.json> <EU38|pear|bigNeckSmallShoulder> <paramMM> <out.pdf>
import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { Pdf, Ctx, A4, wrap, calibration, renderSvgChunk } from '../../web/lib/pdf-core.js';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const [recipePath, bodyName, paramArg, outPath] = process.argv.slice(2);
if (!recipePath || !bodyName || !paramArg || !outPath) {
  console.error('usage: node gen-satis-pdf.mjs <recipe.json> <EU38|pear|bigNeckSmallShoulder> <paramMM> <out.pdf>');
  process.exit(2);
}

// Pinned bodies — the same cm rows recipe-json-dump.cpp pins (EU38 = size
// chart row, engine/src/sizechart.hpp).
const BODIES = {
  EU38: { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 },
  pear: { bust: 96, waist: 70, hip: 116, shoulder: 37, backLength: 41, armLength: 58, neck: 36 },
  bigNeckSmallShoulder: { bust: 100, waist: 84, hip: 104, shoulder: 30, backLength: 40, armLength: 58, neck: 50 },
};
const body = BODIES[bodyName];
if (!body) { console.error(`unknown body '${bodyName}'`); process.exit(2); }

const recipeText = readFileSync(recipePath, 'utf8');
const recipeDoc = JSON.parse(recipeText);
const paramNames = Object.keys(recipeDoc.params || {});
if (paramNames.length !== 1) {
  console.error(`recipe declares ${paramNames.length} params; this tool binds exactly one positional value`);
  process.exit(2);
}
const paramName = paramNames[0];
const paramMM = Number(paramArg);

const createEngine = require(join(here, '../dist/stitchu-engine.js'));
const engine = await createEngine();
const out = JSON.parse(engine.draftRecipeJSON(recipeText, body, { [paramName]: paramMM }));
// A refused draft or a validator-blocked pattern NEVER reaches the press.
if (out.error) { console.error(`ENGINE REFUSED: ${out.error}`); process.exit(1); }
if (out.issues && out.issues.length) {
  console.error('VALIDATOR BLOCKED:');
  for (const i of out.issues) console.error(`  ${i}`);
  process.exit(1);
}
const p = out.pattern;

const sheet = await import(join(here, '../../web/js/sheet.js'));
const { PAGE_W, PAGE_H, packPieces, usedCells, sheetInner, sheetCode, pieceSheetMap } = sheet;

// Chalk pieces (bias binding, ruffle strips) are drawn straight on fabric from
// their cut note, never printed — same split the product PDFs use, never
// silently dropped (the courtney lesson).
const isChalk = (x) => /ruffle|bias binding/i.test(x.name);
const paper = p.pieces.filter((x) => !isChalk(x));
const chalk = p.pieces.filter((x) => isChalk(x));

// allowRotate=false: the PDF text renderer draws horizontal labels only, so
// the pack keeps every piece unrotated (sheet.js supports both; rotation is a
// paper-saving layout choice, not geometry). Placement stays sheet.js truth.
const layout = packPieces(paper, /*allowRotate=*/false);
const { sheets, used } = usedCells(layout);
const sheetMap = pieceSheetMap(layout);
const codesFor = (piece) => {
  const hit = sheetMap.find((e) => e.name === piece.name);
  return hit ? hit.sheets.join(' ') : '';
};

const NAVY = ['0.1216', '0.2275', '0.3725'];
const INK = ['0.0667', '0.0667', '0.0667'];
const GREY = ['0.4000', '0.4000', '0.4000'];

const pdf = new Pdf();
const fabricLine = `${p.fabricMeters140} m fabric at 140 cm wide`;
const sizeLabel = bodyName === 'EU38' ? 'EU38' : 'custom measurements';

// ---- page 1: cover ------------------------------------------------------
{
  const c = new Ctx(A4.h);
  const M = 18;
  let y = 28;
  for (const ln of wrap(recipeDoc.title, 19, A4.w - 2 * M)) { c.text(M, y, 19, NAVY, ln, null); y += 10; }
  y += 2;
  c.text(M, y, 10, GREY, `${sizeLabel}  .  ${p.pieces.length} pieces  .  ${fabricLine}`, null); y += 8;
  c.stroke(0.3, GREY); c.dash(null); c.line(M, y, A4.w - M, y); y += 10;

  c.text(M, y, 12, NAVY, 'Measurements this pattern was drafted for', null); y += 8;
  const rows = [
    ['bust', `${body.bust} cm`], ['waist', `${body.waist} cm`], ['hip', `${body.hip} cm`],
    ['shoulder', `${body.shoulder} cm`], ['back length', `${body.backLength} cm`],
    ['arm length', `${body.armLength} cm`], ['neck', `${body.neck} cm`],
    [paramName, `${paramMM} mm`],
  ];
  for (const [k, v] of rows) {
    c.text(M, y, 9, GREY, k, null);
    c.text(M + 42, y, 9, INK, v, null);
    y += 6;
  }
  y += 6;

  c.text(M, y, 12, NAVY, 'Pieces', null); y += 8;
  for (const piece of paper) {
    const sa = (piece.seamAllowance / 10).toFixed(1);
    const line = `${piece.name}  -  ${piece.cutInstruction}  -  seam allowance ${sa} cm  -  sheets ${codesFor(piece)}`;
    for (const ln of wrap(line, 9, A4.w - 2 * M)) { c.text(M, y, 9, INK, ln, null); y += 5.6; }
    y += 1.4;
  }
  if (chalk.length) {
    y += 3;
    c.text(M, y, 10, NAVY, 'Strips / notions (chalked on fabric, not printed)', null); y += 7;
    for (const piece of chalk) {
      for (const ln of wrap(`${piece.name}  -  ${piece.cutInstruction}`, 9, A4.w - 2 * M)) {
        c.text(M, y, 9, INK, ln, null); y += 5.6;
      }
      y += 1.4;
    }
  }
  y += 6;
  c.text(M, y, 9, GREY, 'seam allowance is included in the outer cut line (outer line cut, inner line sew).', null); y += 6;
  c.text(M, y, 9, GREY, 'the sewing guide at the back of this pack is the engine\'s own construction order.', null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---- page 2: scale check ------------------------------------------------
const scaleRects = {}; // page-mm rects of the two squares, for the raster proof
{
  const c = new Ctx(A4.h);
  const M = 18;
  let y = 28;
  c.text(M, y, 16, NAVY, 'Scale check', null); y += 10;
  c.text(M, y, 10, INK, 'Print at 100% scale (actual size), headers and footers off.', null); y += 10;

  // 10 x 10 cm square — industry-standard full scale check. Drawn at exactly
  // 100 mm in PDF user space (1 mm = 72/25.4 pt), provable from the stream.
  c.stroke(0.5, INK); c.dash(null);
  c.rect(M, y, 100, 100, 'S');
  scaleRects.square100 = { x: M, y, w: 100, h: 100 };
  c.text(M + 50, y + 50, 10, GREY, '10 x 10 cm', 'middle');
  c.text(M + 50, y + 107, 9, INK, 'this square measures exactly 10 x 10 cm - measure before cutting', 'middle');
  y += 118;

  // The engine's own 3 cm calibration square + 1 inch bar (guide step 1
  // references this square; same marks the product print path draws).
  calibration(c, M - 2, y);
  scaleRects.square30 = { x: M, y: y + 2, w: 30, h: 30 };
  y += 56;

  c.text(M, y, 12, NAVY, 'Assembly', null); y += 8;
  const asm = `${sheets.length} pattern sheets in a grid ${layout.cols} across (A1 top-left). ` +
    `Cut or fold along the dashed page frame and tape edge to edge: the black corner squares and edge ticks complete across each joint, ` +
    `and a piece running off a page tells you which sheet it continues on. Verify both squares on this page before cutting.`;
  for (const ln of wrap(asm, 9.5, A4.w - 2 * M)) { c.text(M, y, 9.5, INK, ln, null); y += 5.6; }
  pdf.page(A4.w, A4.h, c.s);
}

// ---- pattern sheets -----------------------------------------------------
const padX = (A4.w - PAGE_W) / 2;
const padY = (A4.h - PAGE_H) / 2;
for (const { col, row } of sheets) {
  const c = new Ctx(A4.h);
  const svg = sheetInner(layout, col, row, used);
  renderSvgChunk(c, svg, col * PAGE_W - padX, row * PAGE_H - padY);
  c.text(padX, padY - 4, 8, GREY, `${recipeDoc.title}  .  sheet ${sheetCode(row, col)}  .  grid ${layout.cols} wide`, null);
  pdf.page(A4.w, A4.h, c.s);
}

// ---- guide pages: cut list + the engine's construction steps ------------
{
  const M = 20;
  const lineH = 5.6;
  let c = new Ctx(A4.h);
  let y = 28;
  const newPage = () => { pdf.page(A4.w, A4.h, c.s); c = new Ctx(A4.h); y = 24; };
  const need = (h) => { if (y + h > A4.h - M) newPage(); };
  c.text(M, y, 16, NAVY, 'Sewing guide', null); y += 9;
  c.text(M, y, 10, GREY, `${sizeLabel}  .  ${p.pieces.length} pieces  .  ${fabricLine}`, null); y += 7;
  c.text(M, y, 9, GREY, 'text-first guide, no illustrations in this edition. Every step is the engine\'s own instruction.', null); y += 12;
  c.text(M, y, 13, NAVY, 'Cut list', null); y += 8;
  for (const piece of paper) {
    for (const ln of wrap(`${piece.name}  -  ${piece.cutInstruction}`, 9.5, A4.w - 2 * M)) {
      need(lineH); c.text(M, y, 9.5, INK, ln, null); y += lineH;
    }
  }
  if (chalk.length) {
    need(lineH + 4);
    c.text(M, y, 10.5, NAVY, 'Strips / notions (chalked on fabric, not printed)', null); y += lineH + 1;
    for (const piece of chalk) {
      for (const ln of wrap(`${piece.name}  -  ${piece.cutInstruction}`, 9.5, A4.w - 2 * M)) {
        need(lineH); c.text(M, y, 9.5, INK, ln, null); y += lineH;
      }
    }
  }
  y += 8;
  need(20);
  c.text(M, y, 13, NAVY, 'Construction order', null); y += 8;
  p.guideSteps.forEach((step, i) => {
    const lines = wrap(`${i + 1}. ${step}`, 9.5, A4.w - 2 * M - 6);
    need(lines.length * lineH + 3);
    for (const ln of lines) { c.text(M + (ln === lines[0] ? 0 : 6), y, 9.5, INK, ln, null); y += lineH; }
    y += 2.4;
  });
  newPage();
}

const buf = pdf.build();
mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(outPath, buf);
const hash = createHash('sha256').update(buf).digest('hex');

// ---- sidecar manifest: machine-readable geometry for the raster proof ----
// (satis-pdf-proof.mjs measures the printed PDF against these engine numbers;
// nothing here is re-derived at proof time, so the check stays independent.)
const sewBounds = (piece) => {
  const xs = [], ys = [];
  for (const cd of piece.commands) {
    if (cd.x !== undefined) { xs.push(cd.x); ys.push(cd.y); }
    if (cd.cp1x !== undefined) { xs.push(cd.cp1x, cd.cp2x); ys.push(cd.cp1y, cd.cp2y); }
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};
const manifest = {
  recipe: recipeDoc.id, title: recipeDoc.title, body: bodyName, measurementsCM: body,
  param: { [paramName]: paramMM }, pdfSha256: hash,
  pageWmm: PAGE_W, pageHmm: PAGE_H, padX, padY, cols: layout.cols,
  pages: { cover: 1, scale: 2, firstSheet: 3, sheetCount: sheets.length },
  sheets: sheets.map(({ col, row }, i) => ({ code: sheetCode(row, col), col, row, page: 3 + i })),
  scaleRects,
  pieces: layout.placed.map((d) => {
    const sb = sewBounds(d.p);
    return {
      name: d.p.name, rot: d.rot || 0,
      // strip-mm sewing-line bbox (placement offset applied; rot is always 0
      // here because the pack runs packPieces with allowRotate=false)
      stripSew: { minX: sb.minX + d.ox, minY: sb.minY + d.oy, maxX: sb.maxX + d.ox, maxY: sb.maxY + d.oy },
      sewW: sb.maxX - sb.minX, sewH: sb.maxY - sb.minY,
      seamAllowance: d.p.seamAllowance,
    };
  }),
};
writeFileSync(`${outPath}.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`PDF ${resolve(outPath)} sha256=${hash}`);
console.log(`pages: ${2 + sheets.length + 1}+ (cover + scale + ${sheets.length} pattern sheets + guide)  bytes: ${buf.length}`);
console.log(`garment: ${p.garment}  pieces: ${p.pieces.length} (${p.pieces.map((x) => x.name).join(' | ')})`);
console.log(`fabric: ${fabricLine}  guide steps: ${p.guideSteps.length}`);
