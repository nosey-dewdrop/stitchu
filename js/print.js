// True-scale A4 print pipeline. Engine units are millimeters; SVG rendered
// with mm dimensions prints at real size.
//
// All pieces are shelf-packed into ONE layout (like a cutting table), then
// the layout is tiled into A4 sheets. Sheets with no geometry are skipped —
// far fewer, far fuller pages than tiling each piece separately.
import { pathD, bounds } from './render.js?v=27';

const PAGE_W = 190;   // printable width, mm (A4 210 minus 2x10 margins)
const PAGE_H = 250;   // printable height, mm (margin + label strip safety)
const GUTTER = 12;    // space between packed pieces, mm

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Shelf packing: tallest first, left to right, new shelf when the row is full.
function shelfPack(dims, cols) {
  const stripW = cols * PAGE_W;
  const sorted = [...dims].sort((a, b) => b.h - a.h);
  let shelfY = 0;
  let shelfH = 0;
  let x = 0;
  for (const d of sorted) {
    if (x > 0 && x + d.w > stripW) {
      shelfY += shelfH + GUTTER;
      x = 0;
      shelfH = 0;
    }
    d.x0 = x;
    d.y0 = shelfY;
    d.ox = x - d.b.minX;   // translate piece-local -> strip coords
    d.oy = shelfY - d.b.minY;
    x += d.w + GUTTER;
    shelfH = Math.max(shelfH, d.h);
  }
  return { placed: sorted, cols, stripW, stripH: shelfY + shelfH };
}

function countSheets(layout) {
  const rows = Math.ceil(layout.stripH / PAGE_H);
  let used = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W;
      const y0 = row * PAGE_H;
      if (layout.placed.some((d) =>
        d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0)) used++;
    }
  }
  return used;
}

// A plain rectangle strip (ruffle tiers, halter bias binding) never earns
// pattern paper: its cut note fully describes it, so it goes on the cover as
// a chalk-and-ruler line instead of eating a row of near-empty sheets.
export function isChalkPiece(p) {
  return p.name.includes('Ruffle') || p.name.includes('Bias binding');
}

// Try every strip width and keep whichever wastes the fewest printed sheets —
// a fixed 3-wide strip left half the pages nearly empty on tall garments.
// The widest piece always fits: cols never drops below what it needs (a 1.4 m
// ruffle segment used to be silently CLIPPED at the old 5-column cap).
function packPieces(pieces) {
  const dims = pieces.map((p) => {
    const b = bounds(p);
    return { p, b, w: b.maxX - b.minX, h: b.maxY - b.minY };
  });
  const maxW = Math.max(...dims.map((d) => d.w));
  const minCols = Math.max(1, Math.ceil((maxW + 1) / PAGE_W));
  let bestCols = minCols;
  let bestSheets = Infinity;
  for (let cols = minCols; cols <= Math.max(5, minCols); cols++) {
    const sheets = countSheets(shelfPack(dims, cols));
    if (sheets < bestSheets) { bestCols = cols; bestSheets = sheets; }
  }
  // re-place at the winning width: the trial runs mutate the shared dims
  return shelfPack(dims, bestCols);
}

function pieceGroup(d) {
  // Outer solid = CUTTING line (allowance included); inner fine = SEWING line.
  // Old closet saves have no cutLine and print the single line as before.
  const hasCut = (d.p.cutLine || []).length > 0;
  let inner = hasCut
    ? `<path d="${pathD(d.p.cutLine, 1)}" fill="none" stroke="#111" stroke-width="0.6"/>` +
      `<path d="${pathD(d.p.commands, 1)}" fill="none" stroke="#555" stroke-width="0.35"/>`
    : `<path d="${pathD(d.p.commands, 1)}" fill="none" stroke="#111" stroke-width="0.6"/>`;
  if (d.p.markings.length) {
    inner += `<path d="${pathD(d.p.markings, 1)}" fill="none" stroke="#111" stroke-width="0.45" stroke-dasharray="4 3"/>`;
  }
  if (d.p.grainline) {
    // grainline with real arrowheads (the legend promises an arrow)
    const g = d.p.grainline;
    inner += `<line x1="${g.fromX}" y1="${g.fromY}" x2="${g.toX}" y2="${g.toY}" stroke="#111" stroke-width="0.45"/>` +
      `<path d="M ${g.fromX - 2.5} ${g.fromY + 4} L ${g.fromX} ${g.fromY} L ${g.fromX + 2.5} ${g.fromY + 4} ` +
      `M ${g.toX - 2.5} ${g.toY - 4} L ${g.toX} ${g.toY} L ${g.toX + 2.5} ${g.toY - 4}" fill="none" stroke="#111" stroke-width="0.45"/>`;
  }
  inner += `<text x="${d.b.minX + 6}" y="${d.b.minY + 14}" font-family="Helvetica" font-size="7" fill="#555">${d.p.name}</text>` +
           `<text x="${d.b.minX + 6}" y="${d.b.minY + 21}" font-family="Helvetica" font-size="6" fill="#888">${d.p.cutInstruction}</text>`;
  return `<g transform="translate(${d.ox.toFixed(1)} ${d.oy.toFixed(1)})">${inner}</g>`;
}

// One A4 sheet: a viewBox window over the packed strip + edge join ticks.
function sheetSVG(layout, col, row) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${PAGE_W}mm`);
  svg.setAttribute('height', `${PAGE_H}mm`);
  svg.setAttribute('viewBox', `${x0} ${y0} ${PAGE_W} ${PAGE_H}`);

  let inner = '';
  const ghosts = [];
  for (const d of layout.placed) {
    if (d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0) {
      inner += pieceGroup(d);
      // the piece's own label lives at its top-left corner; on every OTHER
      // sheet the piece touches, whisper its name so no page is anonymous
      const labelX = d.x0 + 6, labelY = d.y0 + 14;
      if (labelX < x0 || labelX > x0 + PAGE_W || labelY < y0 || labelY > y0 + PAGE_H) {
        ghosts.push(d.p.name);
      }
    }
  }
  if (ghosts.length) {
    inner += `<text x="${x0 + 4}" y="${y0 + 6}" font-family="Helvetica" font-size="4" fill="#999">on this sheet: ${ghosts.join(' · ')}</text>`;
  }
  // sheet code inside the drawing area, bottom-left, so a loose page is never anonymous
  inner += `<text x="${x0 + 4}" y="${y0 + PAGE_H - 3}" font-family="Helvetica" font-size="4" fill="#999">sheet ${String.fromCharCode(65 + row)}${col + 1}</text>`;
  // join ticks at every shared edge midpoint (match tick to tick, no overlap)
  const t = 6;
  inner += `<line x1="${x0}" y1="${y0 + PAGE_H / 2}" x2="${x0 + t}" y2="${y0 + PAGE_H / 2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W - t}" y1="${y0 + PAGE_H / 2}" x2="${x0 + PAGE_W}" y2="${y0 + PAGE_H / 2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W / 2}" y1="${y0}" x2="${x0 + PAGE_W / 2}" y2="${y0 + t}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0 + PAGE_W / 2}" y1="${y0 + PAGE_H - t}" x2="${x0 + PAGE_W / 2}" y2="${y0 + PAGE_H}" stroke="#111" stroke-width="0.4"/>`;
  svg.innerHTML = inner;
  return svg;
}

function calibrationSVG() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '34mm');
  svg.setAttribute('height', '38mm');
  svg.setAttribute('viewBox', '0 0 34 38');
  svg.innerHTML =
    '<rect x="2" y="2" width="30" height="30" fill="none" stroke="#111" stroke-width="0.5"/>' +
    '<text x="17" y="37" font-family="Helvetica" font-size="3.2" fill="#111" text-anchor="middle">3 cm — measure me before cutting</text>';
  return svg;
}

export function printPattern(result) {
  const p = result.pattern;
  const chalk = p.pieces.filter(isChalkPiece);
  const paper = p.pieces.filter((piece) => !isChalkPiece(piece));
  const layout = packPieces(paper.length ? paper : p.pieces);
  const rows = Math.ceil(layout.stripH / PAGE_H);

  // keep only sheets that actually contain geometry
  const sheets = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W;
      const y0 = row * PAGE_H;
      const used = layout.placed.some((d) =>
        d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0);
      if (used) sheets.push({ col, row });
    }
  }

  const root = el('div', '');
  root.id = 'print-root';

  // Cover sheet
  const cover = el('div', 'print-page');
  cover.appendChild(el('div', 'print-title', `${p.garment} — stitchu pattern`));
  const hasCutLines = p.pieces.some((piece) => (piece.cutLine || []).length > 0);
  cover.appendChild(el('div', 'print-sub',
    `${p.pieces.length} pieces · ${p.fabricMeters140} m fabric at 140 cm · ` +
    (hasCutLines
      ? `seam allowance ${p.pieces[0].seamAllowance / 10} cm INCLUDED — cut on the OUTER line, sew on the inner fine line`
      : `seam allowance ${p.pieces[0].seamAllowance / 10} cm NOT drawn, add it while cutting`)));
  const map = el('ul', 'print-map');
  for (const piece of paper.length ? paper : p.pieces) {
    map.appendChild(el('li', '', `${piece.name} — ${piece.cutInstruction}`));
  }
  cover.appendChild(map);

  // Straight strips need a ruler, not pattern paper: their cut note IS the
  // pattern, so they live here instead of adding a row of near-empty sheets.
  if (chalk.length && paper.length) {
    cover.appendChild(el('div', 'print-sub',
      'MARK THESE DIRECTLY ON THE FABRIC with chalk and a ruler (straight strips — no printed piece needed). ' +
      'Space the gather notches evenly along each strip’s top edge:'));
    const chalkMap = el('ul', 'print-map');
    for (const piece of chalk) {
      chalkMap.appendChild(el('li', '', `${piece.name} — ${piece.cutInstruction}`));
    }
    cover.appendChild(chalkMap);
  }
  cover.appendChild(el('div', 'print-sub',
    `${sheets.length} sheets. Lay them in a grid ${layout.cols} across (sheet code = row letter + column number: A1 top-left). ` +
    'Tape edge to edge, matching the small edge ticks — no overlap. ' +
    'PRINTER SETTINGS: scale 100%, headers/footers OFF, then verify the 3 cm square below.'));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  for (const { col, row } of sheets) {
    const page = el('div', 'print-page');
    page.appendChild(el('div', 'print-label',
      `${p.garment} — sheet ${String.fromCharCode(65 + row)}${col + 1} (grid ${layout.cols} across)`));
    page.appendChild(sheetSVG(layout, col, row));
    root.appendChild(page);
  }

  document.body.appendChild(root);
  const cleanup = () => {
    root.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}
