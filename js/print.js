// True-scale A4 print pipeline. Engine units are millimeters; SVG rendered
// with mm dimensions prints at real size — the 3 cm calibration square on
// every sheet lets the sewist verify before cutting.
import { pathD, bounds } from './render.js';

const PAGE_W = 190;   // printable width, mm (A4 210 minus 2x10 margins)
const PAGE_H = 255;   // printable drawing height, mm (leaves a label strip)

function tileCount(span, page) {
  return Math.max(1, Math.ceil(span / page));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
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

// One tile of one piece: an SVG window (viewBox offset) at true mm scale.
function tileSVG(piece, b, col, row) {
  const x0 = b.minX + col * PAGE_W;
  const y0 = b.minY + row * PAGE_H;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', `${PAGE_W}mm`);
  svg.setAttribute('height', `${PAGE_H}mm`);
  svg.setAttribute('viewBox', `${x0} ${y0} ${PAGE_W} ${PAGE_H}`);

  let inner = `<path d="${pathD(piece.commands, 1)}" fill="none" stroke="#111" stroke-width="0.6"/>`;
  if (piece.markings.length) {
    inner += `<path d="${pathD(piece.markings, 1)}" fill="none" stroke="#111" stroke-width="0.45" stroke-dasharray="4 3"/>`;
  }
  if (piece.grainline) {
    const g = piece.grainline;
    inner += `<line x1="${g.fromX}" y1="${g.fromY}" x2="${g.toX}" y2="${g.toY}" stroke="#111" stroke-width="0.45"/>`;
  }
  // joining marks on shared edges (align the sheets edge to edge, no overlap)
  const marks = [];
  if (col > 0) marks.push(`<line x1="${x0}" y1="${y0 + PAGE_H / 2}" x2="${x0 + 6}" y2="${y0 + PAGE_H / 2}" stroke="#111" stroke-width="0.4"/>`);
  if (row > 0) marks.push(`<line x1="${x0 + PAGE_W / 2}" y1="${y0}" x2="${x0 + PAGE_W / 2}" y2="${y0 + 6}" stroke="#111" stroke-width="0.4"/>`);
  svg.innerHTML = inner + marks.join('');
  return svg;
}

export function printPattern(result) {
  const p = result.pattern;
  const root = el('div', '');
  root.id = 'print-root';

  // Cover sheet: what to expect + tiling map per piece.
  const cover = el('div', 'print-page');
  cover.appendChild(el('div', 'print-title', p.garment + ' — stitchu pattern'));
  cover.appendChild(el('div', 'print-sub',
    `${p.pieces.length} pieces · ${p.fabricMeters140} m fabric at 140 cm · seam allowance ${p.pieces[0].seamAllowance / 10} cm NOT drawn, add it while cutting`));
  const map = el('ul', 'print-map');
  let totalSheets = 0;
  for (const piece of p.pieces) {
    const b = bounds(piece);
    const cols = tileCount(b.maxX - b.minX, PAGE_W);
    const rows = tileCount(b.maxY - b.minY, PAGE_H);
    totalSheets += cols * rows;
    const li = el('li', '', `${piece.name} (${piece.cutInstruction}) — ${cols * rows} sheet${cols * rows > 1 ? 's' : ''} (${cols} across × ${rows} down)`);
    map.appendChild(li);
  }
  cover.appendChild(map);
  cover.appendChild(el('div', 'print-sub', `${totalSheets} sheets total. Tape sheets edge to edge (no overlap), matching the center edge marks. Verify the 3 cm square on any sheet first.`));
  cover.appendChild(calibrationSVG());
  root.appendChild(cover);

  // Piece tiles, left-to-right then down, labeled like B2 = row B column 2.
  for (const piece of p.pieces) {
    const b = bounds(piece);
    const cols = tileCount(b.maxX - b.minX, PAGE_W);
    const rows = tileCount(b.maxY - b.minY, PAGE_H);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const page = el('div', 'print-page');
        const label = `${piece.name} — sheet ${String.fromCharCode(65 + row)}${col + 1} of ${String.fromCharCode(65 + rows - 1)}${cols}`;
        page.appendChild(el('div', 'print-label', label));
        page.appendChild(tileSVG(piece, b, col, row));
        root.appendChild(page);
      }
    }
  }

  document.body.appendChild(root);
  const cleanup = () => {
    root.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}
