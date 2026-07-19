// Faithful node port of web/js/print.js pagination for visual inspection.
const createEngine = require(require('path').join(__dirname, '../dist/stitchu-engine.js'));
const fs = require('fs');
const PAGE_W = 190, PAGE_H = 250, GUTTER = 12;
const M = { bust: 88, waist: 70, hip: 94, shoulder: 37, backLength: 40.5, armLength: 58, neck: 35 };

function pathD(commands, scale) {
  return commands.map((c) => {
    switch (c.type) {
      case 'move': return `M ${(c.x*scale).toFixed(1)} ${(c.y*scale).toFixed(1)}`;
      case 'line': return `L ${(c.x*scale).toFixed(1)} ${(c.y*scale).toFixed(1)}`;
      case 'curve': return `C ${(c.cp1x*scale).toFixed(1)} ${(c.cp1y*scale).toFixed(1)} ${(c.cp2x*scale).toFixed(1)} ${(c.cp2y*scale).toFixed(1)} ${(c.x*scale).toFixed(1)} ${(c.y*scale).toFixed(1)}`;
      case 'close': return 'Z';
      default: return '';
    }
  }).join(' ');
}
function bounds(piece) {
  const xs = [], ys = [];
  for (const c of [...piece.commands, ...piece.markings]) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  if (piece.grainline) { xs.push(piece.grainline.fromX, piece.grainline.toX); ys.push(piece.grainline.fromY, piece.grainline.toY); }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}
function shelfPack(dims, cols) {
  const stripW = cols * PAGE_W;
  const sorted = [...dims].sort((a, b) => b.h - a.h);
  let shelfY = 0, shelfH = 0, x = 0;
  for (const d of sorted) {
    if (x > 0 && x + d.w > stripW) { shelfY += shelfH + GUTTER; x = 0; shelfH = 0; }
    d.x0 = x; d.y0 = shelfY; d.ox = x - d.b.minX; d.oy = shelfY - d.b.minY;
    x += d.w + GUTTER; shelfH = Math.max(shelfH, d.h);
  }
  return { placed: sorted, cols, stripW, stripH: shelfY + shelfH };
}
function countSheets(layout) {
  const rows = Math.ceil(layout.stripH / PAGE_H);
  let used = 0;
  for (let row = 0; row < rows; row++) for (let col = 0; col < layout.cols; col++) {
    const x0 = col*PAGE_W, y0 = row*PAGE_H;
    if (layout.placed.some(d => d.x0 < x0+PAGE_W && d.x0+d.w > x0 && d.y0 < y0+PAGE_H && d.y0+d.h > y0)) used++;
  }
  return used;
}
function packPieces(pieces) {
  const dims = pieces.map((p) => { const b = bounds(p); return { p, b, w: b.maxX-b.minX, h: b.maxY-b.minY }; });
  const maxW = Math.max(...dims.map(d => d.w));
  const minCols = Math.min(5, Math.max(1, Math.ceil(maxW / PAGE_W)));
  let bestCols = minCols, bestSheets = Infinity;
  for (let cols = minCols; cols <= 5; cols++) {
    const sheets = countSheets(shelfPack(dims, cols));
    console.log('cols', cols, '->', sheets, 'sheets');
    if (sheets < bestSheets) { bestCols = cols; bestSheets = sheets; }
  }
  return shelfPack(dims, bestCols);
}
function pieceGroup(d) {
  let inner = `<path d="${pathD(d.p.commands,1)}" fill="none" stroke="#111" stroke-width="0.6"/>`;
  if (d.p.markings.length) inner += `<path d="${pathD(d.p.markings,1)}" fill="none" stroke="#111" stroke-width="0.45" stroke-dasharray="4 3"/>`;
  if (d.p.grainline) { const g = d.p.grainline; inner += `<line x1="${g.fromX}" y1="${g.fromY}" x2="${g.toX}" y2="${g.toY}" stroke="#111" stroke-width="0.45"/>` +
    `<path d="M ${g.fromX-2.5} ${g.fromY+4} L ${g.fromX} ${g.fromY} L ${g.fromX+2.5} ${g.fromY+4} M ${g.toX-2.5} ${g.toY-4} L ${g.toX} ${g.toY} L ${g.toX+2.5} ${g.toY-4}" fill="none" stroke="#111" stroke-width="0.45"/>`; }
  inner += `<text x="${d.b.minX+6}" y="${d.b.minY+14}" font-family="Helvetica" font-size="7" fill="#555">${d.p.name}</text>` +
           `<text x="${d.b.minX+6}" y="${d.b.minY+21}" font-family="Helvetica" font-size="4.5" fill="#888">${d.p.cutInstruction}</text>`;
  return `<g transform="translate(${d.ox.toFixed(1)} ${d.oy.toFixed(1)})">${inner}</g>`;
}
function sheetSVG(layout, col, row) {
  const x0 = col*PAGE_W, y0 = row*PAGE_H;
  let inner = `<rect x="${x0+0.3}" y="${y0+0.3}" width="${PAGE_W-0.6}" height="${PAGE_H-0.6}" fill="none" stroke="#bbb" stroke-width="0.3"/>`; // page frame for INSPECTION only
  const ghosts = [];
  for (const d of layout.placed) {
    if (d.x0 < x0+PAGE_W && d.x0+d.w > x0 && d.y0 < y0+PAGE_H && d.y0+d.h > y0) {
      inner += pieceGroup(d);
      const lx = d.x0+6, ly = d.y0+14;
      if (lx < x0 || lx > x0+PAGE_W || ly < y0 || ly > y0+PAGE_H) ghosts.push(d.p.name);
    }
  }
  if (ghosts.length) inner += `<text x="${x0+4}" y="${y0+6}" font-family="Helvetica" font-size="4" fill="#999">on this sheet: ${ghosts.join(' · ')}</text>`;
  inner += `<text x="${x0+4}" y="${y0+PAGE_H-3}" font-family="Helvetica" font-size="4" fill="#999">sheet ${String.fromCharCode(65+row)}${col+1}</text>`;
  const t = 6;
  inner += `<line x1="${x0}" y1="${y0+PAGE_H/2}" x2="${x0+t}" y2="${y0+PAGE_H/2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0+PAGE_W-t}" y1="${y0+PAGE_H/2}" x2="${x0+PAGE_W}" y2="${y0+PAGE_H/2}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0+PAGE_W/2}" y1="${y0}" x2="${x0+PAGE_W/2}" y2="${y0+t}" stroke="#111" stroke-width="0.4"/>` +
           `<line x1="${x0+PAGE_W/2}" y1="${y0+PAGE_H-t}" x2="${x0+PAGE_W/2}" y2="${y0+PAGE_H}" stroke="#111" stroke-width="0.4"/>`;
  return `<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${PAGE_W} ${PAGE_H}">${inner}</svg>`;
}
createEngine().then(e => {
  const p = JSON.parse(e.draftJSON({ garment: 'dress', shaping: 'princess', waistline: 'natural', fabric: 'woven', neckline: 'scoop', sleeveStyle: 'straight', sleeveLength: 'short', skirtStyle: 'aLine', skirtLength: 'midi', topLength: 'hip', ruffleHem: false, ruffleTiers: 1, keyhole: false }, M)).pattern;
  const layout = packPieces(p.pieces);
  const rows = Math.ceil(layout.stripH / PAGE_H);
  fs.mkdirSync('/tmp/pdf', { recursive: true });
  let n = 0;
  for (let row = 0; row < rows; row++) for (let col = 0; col < layout.cols; col++) {
    const x0 = col*PAGE_W, y0 = row*PAGE_H;
    const used = layout.placed.some(d => d.x0 < x0+PAGE_W && d.x0+d.w > x0 && d.y0 < y0+PAGE_H && d.y0+d.h > y0);
    if (used) fs.writeFileSync(`/tmp/pdf/sheet-${String.fromCharCode(65+row)}${col+1}.svg`, sheetSVG(layout, col, row));
    n += used ? 1 : 0;
  }
  console.log('pieces:', p.pieces.length, '| cols:', layout.cols, '| strip:', Math.round(layout.stripW)+'x'+Math.round(layout.stripH), '| sheets:', n);
});
