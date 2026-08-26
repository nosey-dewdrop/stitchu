// download.js — THE one place a user takes a pattern home.
//
// WHY THIS FILE EXISTS (F-İNDİR, 2026-08-26). Measured on 26 Aug: web/js/
// create.js contained ZERO lines matching `download` or `dxf`. The result
// screen offered `printPattern` and nothing else, so a shopper who uploaded a
// photo could SEE a pattern and carry nothing out of the browser. The whole
// download path lived in studio.js, bound to the recipe DSL that create.html
// never has. This module is that path lifted out of studio.js — MOVED, not
// copied: studio.js now imports these functions, so there is one SVG writer,
// one DXF caller and one PDF builder for the whole site.
//
// THE THREE FILES, AND WHY EACH IS THE MOTOR'S OWN OUTPUT AND NOT A REDRAW:
//   DXF  engine.dxfSpecJSON / dxfRecipeJSON -> dxf::exportPattern, the SAME
//        serializer the native dxf-export tool runs (ctest dxf_wasm_parity).
//   SVG  sheet.js pathD/bounds over the drafted commands — the same geometry
//        strings print.js and render-pages.mjs draw.
//   PDF  pdf-core.js, the SAME builder engine/tools/gen-collection-pattern.mjs
//        writes the published packs with, including the 3 cm calibration square.
//
// A BLOCKED DRAFT HANDS OUT NOTHING. Every builder refuses when `issues` is
// non-empty and says why (RULES invariant 1): a validator-blocked pattern that
// downloads as a clean "industry file" is how a shopper cuts fabric for a
// garment the engine already knows does not close.

import { pathD, bounds } from './sheet.js?v=136';
import * as sheet from './sheet.js?v=136';
import { makePdfCore } from '../lib/pdf-core.js?v=136';
import { dxfRecipe, dxfSpec } from './engine.js?v=136';

// Drafting-table pastels + ink: the studio's own palette, kept so the exported
// SVG looks like the pattern the user was looking at when they pressed save.
const PASTELS = ['#f4e3e0', '#eae4f1', '#f7f1e2', '#ece5d8'];
const INK = '#1f3a5f';
const GUTTER = 40; // mm between pieces on the drafting table

export function escapeXML(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Side-by-side drafting-table layout in true mm, top-aligned. This is the SCREEN
// / SVG layout; the A4 pack uses sheet.js packing instead (a printable pack has
// to fit pages, a drafting table does not).
export function layoutPieces(pieces) {
  const placed = [];
  let cursor = 0, maxH = 0;
  for (const piece of pieces) {
    const b = bounds(piece);
    const w = b.maxX - b.minX, h = b.maxY - b.minY;
    placed.push({ piece, b, tx: cursor - b.minX, ty: -b.minY });
    cursor += w + GUTTER;
    maxH = Math.max(maxH, h);
  }
  return { placed, totalW: Math.max(cursor - GUTTER, 1), totalH: maxH };
}

export function grainlineSVG(g, strokeAttrs) {
  const ang = Math.atan2(g.toY - g.fromY, g.toX - g.fromX);
  let d = `M ${g.fromX} ${g.fromY} L ${g.toX} ${g.toY}`;
  for (const [px, py, dir] of [[g.fromX, g.fromY, ang], [g.toX, g.toY, ang + Math.PI]]) {
    const a1x = px + Math.cos(dir + 0.4) * 12, a1y = py + Math.sin(dir + 0.4) * 12;
    const a2x = px + Math.cos(dir - 0.4) * 12, a2y = py + Math.sin(dir - 0.4) * 12;
    d += ` M ${a1x.toFixed(1)} ${a1y.toFixed(1)} L ${px} ${py} L ${a2x.toFixed(1)} ${a2y.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" ${strokeAttrs}/>`;
}

// One piece as SVG markup. `screen` picks px stroke widths + non-scaling stroke
// for the live canvas; the export wants mm widths that survive being opened in
// Illustrator at true size.
export function pieceSVG(piece, idx, screen) {
  const vec = screen ? 'vector-effect="non-scaling-stroke"' : '';
  const wCut = screen ? 1.5 : 0.5;      // px on screen, mm in the export
  const wFine = screen ? 1 : 0.35;
  const fill = PASTELS[idx % PASTELS.length];
  const cut = (piece.cutLine || []).length ? piece.cutLine : piece.commands;
  let s = '';
  // pastel fill on the cut outline (the paper piece), thin ink contour on top
  s += `<path class="fill" d="${pathD(cut, 1)}" fill="${fill}" stroke="none"/>`;
  s += `<path class="cutline" d="${pathD(cut, 1)}" fill="none" stroke="${INK}" stroke-width="${wCut}" ${vec}/>`;
  // fine dashed sewing line inside (the stitched line, topstitch feel)
  if ((piece.cutLine || []).length) {
    s += `<path d="${pathD(piece.commands, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" stroke-dasharray="4 3" opacity=".55" ${vec}/>`;
  }
  if ((piece.markings || []).length) {
    s += `<path d="${pathD(piece.markings, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" stroke-dasharray="6 4" opacity=".8" ${vec}/>`;
  }
  if ((piece.notches || []).length) {
    s += `<path d="${pathD(piece.notches, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" ${vec}/>`;
  }
  // CUT ON FOLD (ASTM D6673 layer 6 mirror line) — dash-dot mirror edge.
  if ((piece.foldLine || []).length >= 2) {
    s += `<path d="${pathD(piece.foldLine, 1)}" fill="none" stroke="${INK}" stroke-width="${wFine}" stroke-dasharray="10 3 2 3" ${vec}/>`;
  }
  if (piece.grainline) s += grainlineSVG(piece.grainline, `stroke-width="${wFine}" ${vec}`);
  return s;
}

// ------------------------------------------------------------------ builders
// PURE: string/bytes in, string/bytes out, no DOM. engine/tests/indir_check.mjs
// runs exactly these in node, so the gate measures the bytes the browser hands
// the user — not a parallel node-only re-implementation.

/** Full pattern as one true-mm SVG document. Throws on a blocked draft. */
export function patternSVG(pattern) {
  if (!pattern || !pattern.pieces || !pattern.pieces.length) {
    throw new Error('svg export: no drafted pieces to write');
  }
  const { placed, totalW, totalH } = layoutPieces(pattern.pieces);
  const labelH = Math.max(18, totalH * 0.05);
  let inner = '';
  placed.forEach(({ piece, b, tx, ty }, i) => {
    inner += `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)})">`;
    inner += pieceSVG(piece, i, false);
    inner += `<text x="${((b.minX + b.maxX) / 2).toFixed(1)}" y="${(b.maxY + labelH).toFixed(1)}" ` +
      `text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="14" fill="${INK}">` +
      `${escapeXML(piece.name)} · ${escapeXML(piece.cutInstruction)}</text>`;
    inner += '</g>';
  });
  const w = (totalW + 40).toFixed(1), h = (totalH + labelH * 2 + 40).toFixed(1);
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" ` +
    `viewBox="-20 -20 ${w} ${h}">\n<rect x="-20" y="-20" width="${w}" height="${h}" fill="#ffffff"/>\n` +
    inner + '\n</svg>\n';
}

// The PDF core with no engine and no body bound: the caller already HAS the
// drafted pattern (it is on screen), so core.draft() is never reached — only
// pack/a4Pdf/a0Pdf/guidePdf, which take the pattern as an argument.
const pdfCore = makePdfCore({ engine: null, sheet, body: null });

/**
 * A4-tiled printable pack for an already-drafted pattern: cover page (cut list,
 * assembly, 3 cm calibration square) + the tiled sheets with register marks.
 * `title` is what prints at the top. Returns Uint8Array of PDF bytes.
 */
export function patternA4Pdf(pattern, title) {
  if (!pattern || !pattern.pieces || !pattern.pieces.length) {
    throw new Error('pdf export: no drafted pieces to tile');
  }
  const { layout, sheets, used } = pdfCore.pack(pattern);
  return pdfCore.a4Pdf({ style: title }, pattern, layout, sheets, used);
}

/** Single-sheet A0 (print shop) for the same drafted pattern. */
export function patternA0Pdf(pattern, title) {
  if (!pattern || !pattern.pieces || !pattern.pieces.length) {
    throw new Error('pdf export: no drafted pieces to place');
  }
  const { layout } = pdfCore.pack(pattern);
  return pdfCore.a0Pdf({ style: title }, pattern, layout);
}

/**
 * DXF for whichever boundary the caller lives on. The two paths exist because
 * the two pages hold different things: studio.html holds a recipe text,
 * create.html holds a spec. Both end in dxf::exportPattern.
 *   { kind: 'spec',   spec, measurements }
 *   { kind: 'recipe', recipeText, measurements, params }
 * Returns { dxf } or { error, dxf: null } — the engine's own honest refusal.
 */
export async function patternDXF(source) {
  if (source && source.kind === 'recipe') {
    return dxfRecipe(source.recipeText, source.measurements, source.params);
  }
  if (source && source.kind === 'spec') {
    return dxfSpec(source.spec, source.measurements);
  }
  return { error: `dxf export: unknown source kind '${source && source.kind}'`, dxf: null };
}

// --------------------------------------------------------------- DOM savers
// The only DOM in this file. Kept separate from the builders above so the gate
// can run the builders in node.

/** Turn a filename fragment into something a filesystem accepts. */
export function safeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pattern';
}

export function saveBlob(filename, data, mime) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: mime }));
  a.download = filename;
  a.click();
  // Revoking in the same tick cancels the download in Safari; one frame is
  // enough for the click to have taken the URL.
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

export function saveSVG(pattern, filename) {
  saveBlob(filename, patternSVG(pattern), 'image/svg+xml');
}

export function saveA4Pdf(pattern, title, filename) {
  saveBlob(filename, patternA4Pdf(pattern, title), 'application/pdf');
}

export function saveA0Pdf(pattern, title, filename) {
  saveBlob(filename, patternA0Pdf(pattern, title), 'application/pdf');
}

/**
 * Hand the engine's DXF answer to the user, or hand back its refusal.
 * Split out of saveDXF so a gate can exercise the refusal branch without a
 * browser: this is the branch that decides whether a rejected draft still
 * reaches someone's cutting table, and it must be able to go red.
 * Returns null when the file was saved, or the refusal message.
 */
export function relayDXF(out, filename) {
  if (!out || out.error || !out.dxf) return (out && out.error) || 'no geometry';
  saveBlob(filename, out.dxf, 'application/dxf');
  return null;
}

/** Resolves to null on success, or the engine's refusal message on failure. */
export async function saveDXF(source, filename) {
  return relayDXF(await patternDXF(source), filename);
}
