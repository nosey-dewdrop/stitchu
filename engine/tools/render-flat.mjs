// render-flat.mjs — shared SVG rendering for the pattern-library / collection
// pages. ONE source for: (1) the scattered nested-piece layout (the existing
// gallery thumbnail) and (2) the clean FRONT + BACK flat technical sketch that
// a commercial Etsy pattern shows. Both draw the engine's own drafted pieces
// only (no source photo, ever) with cut line, sewing line, darts/markings,
// BALANCE NOTCHES, GRAINLINE arrows and the CLOSURE mark (STEP 2 + STEP 3).
//   CANLI TÜKETİCİ: web/js/sheet.js. Eski tüketicileri render-patterns.mjs ve
//   render-vintage6070.mjs 2026-08-17'de SİLİNDİ (ikisi de af49514'te silinmiş olan
//   web/patterns/ dizinine yazıyordu; sıfır canlı çağıranları kalmıştı).
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

// ⛔ renderFrontBack SİLİNDİ (H3, 2026-08-30) — ÇAĞIRANI YOKTU VE KALEMİ YOK.
// Bu, croquis kalemine (web/lib/flat-core.js -> render-garment-flat.mjs) tek
// satırlık bir yeniden-ihraç idi. Kalem H3'te silindi; ölçüldü, repoda
// `renderFrontBack` yazan başka TEK BİR SATIR yok. Yerine bir şey konmadı ve
// konmamalı: bitmiş giysinin teknik çizimi artık TEK bir yerden çıkıyor —
// engine.flatJSON -> web/lib/flat-from-plan.js — ve o çizim kalıbın kesildiği
// yüzeyin projeksiyonudur. Buraya ikinci bir çizici koymak yasak 3'tür.
