// satis-pdf-proof.mjs — raster scale proof for a gen-satis-pdf.mjs pack.
// The claim "this PDF prints at true scale" is measured, not asserted (RULES
// invariant 3 / prove-don't-claim): the PRODUCED pdf is rasterized with
// pdftoppm at a known dpi, the two scale squares and one drafted piece are
// located as dark-pixel edge clusters, and the pixel distances are converted
// back to mm and compared against the engine's own numbers from the sidecar
// manifest (<out>.pdf.json — written at generation time, not re-derived here).
//
// Edge model: a square/rectangle edge is a row (or column) whose longest
// consecutive dark run inside the crop window is >= minRun. Marked rows are
// clustered; the distance between the FIRST and LAST cluster centers is the
// center-to-center stroke distance, which equals the drawn dimension exactly
// (strokes are centered on the path). Interior clutter (labels, grainline,
// fold lines) produces short runs or interior clusters and cannot move the
// first/last cluster centers.
//
// usage: node satis-pdf-proof.mjs <pack.pdf> [--piece <name-substr>] [--axes wh|w|h]
//                                 [--probeFrac 0..1] [--dpi 300] [--tol 1.0]
import { execFileSync } from 'child_process';
import { readFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const args = process.argv.slice(2);
const pdfPath = args[0];
if (!pdfPath) {
  console.error('usage: node satis-pdf-proof.mjs <pack.pdf> [--piece <substr>] [--axes wh|w|h] [--probeFrac f] [--dpi n] [--tol mm]');
  process.exit(2);
}
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const DPI = Number(opt('dpi', '300'));
const TOL = Number(opt('tol', '1.0'));
const pieceQuery = opt('piece', null);
const axes = opt('axes', 'wh');
const probeFrac = Number(opt('probeFrac', '0.6'));
const PX = DPI / 25.4; // px per mm

const manifest = JSON.parse(readFileSync(`${pdfPath}.json`, 'utf8'));
const { pageWmm: PAGE_W, pageHmm: PAGE_H, padX, padY } = manifest;

// ---- PGM (P5) loader ----------------------------------------------------
function loadPGM(path) {
  const buf = readFileSync(path);
  // header: P5 <w> <h> <max> then binary. Tokens may be separated by any
  // whitespace; comments (#...) are legal but pdftoppm never writes them.
  let pos = 0, tokens = [];
  while (tokens.length < 4) {
    while (pos < buf.length && /\s/.test(String.fromCharCode(buf[pos]))) pos++;
    let start = pos;
    while (pos < buf.length && !/\s/.test(String.fromCharCode(buf[pos]))) pos++;
    tokens.push(buf.slice(start, pos).toString('ascii'));
  }
  pos++; // single whitespace after maxval
  const [magic, w, h] = [tokens[0], Number(tokens[1]), Number(tokens[2])];
  if (magic !== 'P5') throw new Error(`not a P5 PGM: ${path}`);
  return { w, h, data: buf.slice(pos, pos + w * h) };
}

const tmp = mkdtempSync(join(tmpdir(), 'satis-proof-'));
function rasterPage(page) {
  execFileSync('pdftoppm', ['-gray', '-r', String(DPI), '-f', String(page), '-l', String(page),
    pdfPath, join(tmp, `pg${page}`)]);
  // pdftoppm pads the page number; find the file it wrote.
  const pad = String(page).padStart(String(manifest.pages.firstSheet + manifest.pages.sheetCount).length, '0');
  for (const cand of [`pg${page}-${page}.pgm`, `pg${page}-${pad}.pgm`, `pg${page}-0${page}.pgm`]) {
    try { return loadPGM(join(tmp, cand)); } catch { /* next */ }
  }
  throw new Error(`pdftoppm output for page ${page} not found`);
}

const DARK = 128;
// Longest consecutive dark run in a row (axis 'h') or column (axis 'w')
// within the crop, in px.
function longestRun(img, fixed, from, to, horizontal) {
  let best = 0, run = 0;
  for (let i = from; i <= to; i++) {
    const v = horizontal ? img.data[fixed * img.w + i] : img.data[i * img.w + fixed];
    if (v < DARK) { run++; if (run > best) best = run; } else run = 0;
  }
  return best;
}

// Measure the center-to-center distance between the first and last edge
// clusters along `axis` inside cropMM ({x0,x1,y0,y1} in page mm).
// axis 'h': horizontal edges scanned over rows -> a height.
// axis 'w': vertical edges scanned over columns -> a width.
function measureEdges(img, cropMM, axis, minRunMM) {
  const px = (v) => Math.round(v * PX);
  const x0 = Math.max(0, px(cropMM.x0)), x1 = Math.min(img.w - 1, px(cropMM.x1));
  const y0 = Math.max(0, px(cropMM.y0)), y1 = Math.min(img.h - 1, px(cropMM.y1));
  const minRun = minRunMM * PX;
  const marked = [];
  if (axis === 'h') {
    for (let y = y0; y <= y1; y++) if (longestRun(img, y, x0, x1, true) >= minRun) marked.push(y);
  } else {
    for (let x = x0; x <= x1; x++) if (longestRun(img, x, y0, y1, false) >= minRun) marked.push(x);
  }
  if (marked.length < 2) return { error: `only ${marked.length} edge lines found in crop` };
  // cluster: consecutive marked indices with gaps <= 10px belong together
  const clusters = [];
  let cur = [marked[0]];
  for (let i = 1; i < marked.length; i++) {
    if (marked[i] - marked[i - 1] <= 10) cur.push(marked[i]);
    else { clusters.push(cur); cur = [marked[i]]; }
  }
  clusters.push(cur);
  if (clusters.length < 2) return { error: 'edges collapsed into one cluster' };
  const center = (cl) => cl.reduce((a, b) => a + b, 0) / cl.length;
  const distPx = center(clusters[clusters.length - 1]) - center(clusters[0]);
  return { mm: distPx / PX, clusters: clusters.length };
}

const results = [];
const check = (label, measured, expected) => {
  if (measured.error) {
    results.push({ label, error: measured.error, pass: false });
    return;
  }
  const delta = measured.mm - expected;
  results.push({ label, expected, measured: measured.mm, delta, pass: Math.abs(delta) <= TOL });
};

// ---- 1) the two scale squares on the scale page -------------------------
{
  const img = rasterPage(manifest.pages.scale);
  for (const [key, rect, margin] of [['square100', manifest.scaleRects.square100, 4],
                                     ['square30', manifest.scaleRects.square30, 2]]) {
    const crop = { x0: rect.x - margin, x1: rect.x + rect.w + margin,
                   y0: rect.y - margin, y1: rect.y + rect.h + margin };
    check(`${key} height`, measureEdges(img, crop, 'h', 0.7 * rect.w), rect.h);
    check(`${key} width`, measureEdges(img, crop, 'w', 0.7 * rect.h), rect.w);
  }
}

// ---- 2) one drafted piece against the engine's mm -----------------------
if (pieceQuery) {
  const piece = manifest.pieces.find((e) => e.name.toLowerCase().includes(pieceQuery.toLowerCase()));
  if (!piece) { console.error(`piece '${pieceQuery}' not in manifest`); process.exit(2); }
  const s = piece.stripSew;
  const cellOf = (v, size) => Math.floor(v / size);
  const pageOf = (col, row) => {
    const hit = manifest.sheets.find((e) => e.col === col && e.row === row);
    if (!hit) throw new Error(`sheet col=${col} row=${row} not printed`);
    return hit;
  };
  const WINDOW = 20; // probe window, mm

  for (const axis of axes.split('')) {
    // measured extent lies along `axis`; the probe window slides along the other
    if (axis === 'h') {
      const row = cellOf(s.minY, PAGE_H);
      if (cellOf(s.maxY, PAGE_H) !== row) { results.push({ label: `${piece.name} height`, error: 'piece crosses a row boundary', pass: false }); continue; }
      const probeX = s.minX + probeFrac * (s.maxX - s.minX) - WINDOW / 2;
      const col = cellOf(probeX, PAGE_W);
      if (cellOf(probeX + WINDOW, PAGE_W) !== col) { results.push({ label: `${piece.name} height`, error: 'probe window crosses a column boundary', pass: false }); continue; }
      const sheet = pageOf(col, row);
      const img = rasterPage(sheet.page);
      const crop = { x0: probeX - col * PAGE_W + padX, x1: probeX + WINDOW - col * PAGE_W + padX,
                     y0: s.minY - row * PAGE_H + padY - 5, y1: s.maxY - row * PAGE_H + padY + 5 };
      check(`${piece.name} height (sheet ${sheet.code})`, measureEdges(img, crop, 'h', 0.7 * WINDOW), piece.sewH);
    } else {
      const col = cellOf(s.minX, PAGE_W);
      if (cellOf(s.maxX, PAGE_W) !== col) { results.push({ label: `${piece.name} width`, error: 'piece crosses a column boundary', pass: false }); continue; }
      const probeY = s.minY + probeFrac * (s.maxY - s.minY) - WINDOW / 2;
      const row = cellOf(probeY, PAGE_H);
      if (cellOf(probeY + WINDOW, PAGE_H) !== row) { results.push({ label: `${piece.name} width`, error: 'probe window crosses a row boundary', pass: false }); continue; }
      const sheet = pageOf(col, row);
      const img = rasterPage(sheet.page);
      const crop = { x0: s.minX - col * PAGE_W + padX - 5, x1: s.maxX - col * PAGE_W + padX + 5,
                     y0: probeY - row * PAGE_H + padY, y1: probeY + WINDOW - row * PAGE_H + padY };
      check(`${piece.name} width (sheet ${sheet.code})`, measureEdges(img, crop, 'w', 0.7 * WINDOW), piece.sewW);
    }
  }
}

rmSync(tmp, { recursive: true, force: true });

// ---- report -------------------------------------------------------------
console.log(`PROOF ${resolve(pdfPath)}  dpi=${DPI}  tol=${TOL}mm  (pdf sha256=${manifest.pdfSha256})`);
let fails = 0;
for (const r of results) {
  if (r.error) { console.log(`  FAIL ${r.label}: ${r.error}`); fails++; continue; }
  const line = `${r.pass ? 'PASS' : 'FAIL'} ${r.label}: expected ${r.expected.toFixed(2)} mm, measured ${r.measured.toFixed(3)} mm, delta ${(r.delta >= 0 ? '+' : '')}${r.delta.toFixed(3)} mm`;
  console.log(`  ${line}`);
  if (!r.pass) fails++;
}
console.log(fails === 0 ? `RESULT: ${results.length}/${results.length} measurements within ${TOL} mm` :
  `RESULT: ${fails} of ${results.length} measurements FAILED the ${TOL} mm tolerance`);
process.exit(fails === 0 ? 0 : 1);
