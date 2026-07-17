// render-flat.mjs — shared SVG rendering for the pattern-library / collection
// pages. ONE source for: (1) the scattered nested-piece layout (the existing
// gallery thumbnail) and (2) the clean FRONT + BACK flat technical sketch that
// a commercial Etsy pattern shows. Both draw the engine's own drafted pieces
// only (no source photo, ever) with cut line, sewing line, darts/markings,
// BALANCE NOTCHES, GRAINLINE arrows and the CLOSURE mark (STEP 2 + STEP 3).
//   imported by render-patterns.mjs and render-vintage6070.mjs
import { pathD, bounds, shelfPack } from '../../web/js/sheet.js';

const NAVY = '#1f3a5f';
const CUT = '#8fbfe8';
const MARK = '#3f74a8';

export const svgDoc = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" ` +
  `width="100%" role="img"><rect width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#fff"/>${inner}</svg>`;

// Draw one placed piece (cut line, sewing line, markings, notches, grainline,
// closure glyph, label) at a plain translate offset.
export function drawPiece(pc, ox, oy, labelX, labelY) {
  const off = `translate(${ox.toFixed(1)} ${oy.toFixed(1)})`;
  let s = '';
  if (pc.cutLine && pc.cutLine.length) {
    s += `<path transform="${off}" d="${pathD(pc.cutLine, 1)}" fill="none" ` +
      `stroke="${CUT}" stroke-width="1.1" stroke-dasharray="5 4"/>`;
  }
  s += `<path transform="${off}" d="${pathD(pc.commands, 1)}" fill="rgba(63,116,168,.06)" ` +
    `stroke="${NAVY}" stroke-width="1.4"/>`;
  if (pc.markings && pc.markings.length) {
    s += `<path transform="${off}" d="${pathD(pc.markings, 1)}" fill="none" ` +
      `stroke="${MARK}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
  }
  // Balance notches + closure glyph (STEP 3) — solid, thin, always visible.
  if (pc.notches && pc.notches.length) {
    s += `<path transform="${off}" d="${pathD(pc.notches, 1)}" fill="none" ` +
      `stroke="${NAVY}" stroke-width="1.0"/>`;
  }
  if (pc.grainline) {
    const g = pc.grainline;
    // Draw a real grainline arrow (double-headed) so it reads as a grainline.
    s += `<line transform="${off}" x1="${g.fromX.toFixed(1)}" y1="${g.fromY.toFixed(1)}" ` +
      `x2="${g.toX.toFixed(1)}" y2="${g.toY.toFixed(1)}" stroke="${MARK}" stroke-width="0.9"/>`;
  }
  if (labelX !== undefined) {
    s += `<text transform="${off}" x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" ` +
      `font-family="Helvetica,Arial,sans-serif" font-size="11" fill="${NAVY}">${pc.name}</text>`;
    if (pc.closure) {
      s += `<text transform="${off}" x="${labelX.toFixed(1)}" y="${(labelY + 13).toFixed(1)}" ` +
        `font-family="Helvetica,Arial,sans-serif" font-size="9" fill="${MARK}">${pc.closure}</text>`;
    }
  }
  return s;
}

// The existing SQUAREST scattered layout of every piece (gallery thumbnail).
export function renderScattered(pieces) {
  const dims = pieces.map((pc) => {
    const b = bounds(pc);
    return { p: pc, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  const minCols = Math.max(1, Math.ceil((Math.max(...dims.map((d) => d.w)) + 1) / 190));
  let layout = null, bestScore = Infinity;
  for (let c = minCols; c <= minCols + 5; c++) {
    const l = shelfPack(dims.map((d) => ({ ...d })), c, false);
    const score = Math.abs(Math.log((l.stripW / l.stripH) / 1.15));
    if (score < bestScore) { bestScore = score; layout = l; }
  }
  let inner = '';
  for (const d of layout.placed) {
    inner += drawPiece(d.p, d.ox, d.oy, d.b.minX + 4, d.b.minY + 14);
  }
  return svgDoc(layout.stripW, layout.stripH, inner);
}

// Split pieces into the FRONT view group and the BACK view group. A commercial
// flat sketch shows the whole garment front and the whole garment back. Pieces
// named "...Front" go to the front view, "...Back" to the back view. Shared
// structural pieces (Sleeve, Collar, Cap) appear in BOTH so each view reads as
// a complete garment. Notions (bias binding, tie, cord, drawstring) go to the
// front view once (they are strips, not part of the silhouette either way).
function classifyView(pieces) {
  const front = [], back = [];
  for (const pc of pieces) {
    const n = pc.name;
    const isFront = /front/i.test(n);
    const isBack = /back/i.test(n);
    const shared = /sleeve|collar|\bcap\b/i.test(n) && !isFront && !isBack;
    const strip = /bias binding|ruffle|\btie\b|cord|drawstring cord|binding/i.test(n);
    if (isFront) front.push(pc);
    else if (isBack) back.push(pc);
    else if (shared) { front.push(pc); back.push(pc); }
    else if (strip) front.push(pc);
    else { front.push(pc); back.push(pc); } // unnamed side -> show in both
  }
  return { front, back };
}

// Lay one view's pieces into a single column-packed panel and return
// {inner, w, h}. Panel content is placed at (0,0)-origin; caller offsets it.
function packPanel(pieces) {
  if (!pieces.length) return { inner: '', w: 0, h: 0 };
  const dims = pieces.map((pc) => {
    const b = bounds(pc);
    return { p: pc, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  const minCols = Math.max(1, Math.ceil((Math.max(...dims.map((d) => d.w)) + 1) / 190));
  let layout = null, bestScore = Infinity;
  for (let c = minCols; c <= minCols + 3; c++) {
    const l = shelfPack(dims.map((d) => ({ ...d })), c, false);
    const score = Math.abs(Math.log((l.stripW / l.stripH) / 0.85)); // taller panel
    if (score < bestScore) { bestScore = score; layout = l; }
  }
  let inner = '';
  for (const d of layout.placed) {
    inner += drawPiece(d.p, d.ox, d.oy, d.b.minX + 4, d.b.minY + 14);
  }
  return { inner, w: layout.stripW, h: layout.stripH };
}

// Clean FRONT + BACK flat technical sketch: two labelled panels side by side,
// the front pieces on the left, the back pieces on the right, each drawn with
// its cut/sew lines, notches, grainline and (on the back) the closure mark.
export function renderFrontBack(pieces) {
  const { front, back } = classifyView(pieces);
  const fp = packPanel(front);
  const bp = packPanel(back);
  const HEAD = 46;   // header band height for the FRONT / BACK label
  const GAP = 60;    // gap between the two panels
  const PAD = 20;
  const panelH = Math.max(fp.h, bp.h);
  const W = PAD + fp.w + GAP + bp.w + PAD;
  const H = HEAD + panelH + PAD;
  const head = (x, w, label) =>
    `<text x="${(x + w / 2).toFixed(1)}" y="30" text-anchor="middle" ` +
    `font-family="Helvetica,Arial,sans-serif" font-size="26" font-weight="600" ` +
    `letter-spacing="2" fill="${NAVY}">${label}</text>`;
  let inner = '';
  inner += head(PAD, fp.w, 'FRONT');
  inner += `<g transform="translate(${PAD} ${HEAD})">${fp.inner}</g>`;
  if (bp.w > 0) {
    const bx = PAD + fp.w + GAP;
    inner += head(bx, bp.w, 'BACK');
    inner += `<g transform="translate(${bx} ${HEAD})">${bp.inner}</g>`;
    // Thin divider rule between the two views.
    const dx = (PAD + fp.w + GAP / 2).toFixed(1);
    inner += `<line x1="${dx}" y1="${HEAD}" x2="${dx}" y2="${(HEAD + panelH).toFixed(1)}" ` +
      `stroke="#d8e2ee" stroke-width="1"/>`;
  }
  return svgDoc(W, H, inner);
}
