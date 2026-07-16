// sheet.js, PURE print-sheet geometry + SVG markup. No DOM, no imports.
// Single source of truth for pathD/bounds, shelf packing and the A4 sheet
// register system (frame, grid code, corner squares, join ticks, continuation
// arrows). print.js wraps these strings in DOM nodes for the browser;
// engine/tools/render-pages.mjs imports this file directly in node, so the
// verification harness renders the SAME pixels the product prints.

export const PAGE_W = 190;   // printable width, mm (A4 210 minus 2x10 margins)
export const PAGE_H = 250;   // printable height, mm (margin + label strip safety)
export const GUTTER = 12;    // space between packed pieces, mm

export function pathD(commands, scale) {
  return commands.map((c) => {
    switch (c.type) {
      case 'move': return `M ${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'line': return `L ${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'curve': return `C ${(c.cp1x * scale).toFixed(1)} ${(c.cp1y * scale).toFixed(1)} ` +
        `${(c.cp2x * scale).toFixed(1)} ${(c.cp2y * scale).toFixed(1)} ` +
        `${(c.x * scale).toFixed(1)} ${(c.y * scale).toFixed(1)}`;
      case 'close': return 'Z';
      default: return '';
    }
  }).join(' ');
}

export function bounds(piece) {
  const xs = [];
  const ys = [];
  // cutLine may be absent on closet entries saved before the double line.
  for (const c of [...piece.commands, ...piece.markings, ...(piece.cutLine || [])]) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  if (piece.grainline) {
    xs.push(piece.grainline.fromX, piece.grainline.toX);
    ys.push(piece.grainline.fromY, piece.grainline.toY);
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

// Shelf packing: tallest first, left to right, new shelf when the row is full.
export function shelfPack(dims, cols) {
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

export function countSheets(layout) {
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

// Try every strip width and keep whichever wastes the fewest printed sheets,
// a fixed 3-wide strip left half the pages nearly empty on tall garments.
// The widest piece always fits: cols never drops below what it needs (a 1.4 m
// ruffle segment used to be silently CLIPPED at the old 5-column cap).
export function packPieces(pieces) {
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

export const sheetCode = (row, col) => `${String.fromCharCode(65 + row)}${col + 1}`;

// The grid cells that actually carry geometry, empty cells are never printed,
// so every register mark checks its neighbour against this set first.
export function usedCells(layout) {
  const rows = Math.ceil(layout.stripH / PAGE_H);
  const used = new Set();
  const sheets = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x0 = col * PAGE_W;
      const y0 = row * PAGE_H;
      if (layout.placed.some((d) =>
        d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0)) {
        used.add(`${row},${col}`);
        sheets.push({ col, row });
      }
    }
  }
  return { sheets, used };
}

export function pieceGroup(d) {
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

// ---- register system (the puzzle glue) -------------------------------------
// Modelled on professional plotter patterns: a visible page frame, a BIG grid
// code, black corner squares that only complete when neighbouring pages meet,
// join ticks along every shared edge, and "continues on ..." arrows wherever a
// piece runs off the page. Every mark checks `used` so nothing points at a
// blank (never printed) sheet.

const SQ = 9;      // corner register square size, mm (quarter visible per page)
const TICK = 8;    // join tick length, mm

function registerMarks(layout, col, row, used) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  const has = (r, c) => used.has(`${r},${c}`);
  let inner = '';

  // Visible page frame: the puzzle piece finally has an outline to tape along.
  inner += `<rect x="${x0 + 0.2}" y="${y0 + 0.2}" width="${PAGE_W - 0.4}" height="${PAGE_H - 0.4}"` +
    ` fill="none" stroke="#888" stroke-width="0.3" stroke-dasharray="2 1.6"/>`;

  // BIG grid code, top-right, readable from across the table, clear of the
  // piece labels that live at each piece's top-left corner.
  inner += `<text x="${x0 + PAGE_W - 8}" y="${y0 + 21}" font-family="Helvetica" font-size="13" font-weight="bold" fill="#333" text-anchor="end">${sheetCode(row, col)}</text>`;

  // Black corner squares centred on shared corners: each page shows a quarter;
  // a taped joint is aligned exactly when the quarters complete the square.
  const corners = [
    { cx: x0, cy: y0, n: [[row - 1, col], [row, col - 1], [row - 1, col - 1]] },
    { cx: x0 + PAGE_W, cy: y0, n: [[row - 1, col], [row, col + 1], [row - 1, col + 1]] },
    { cx: x0, cy: y0 + PAGE_H, n: [[row + 1, col], [row, col - 1], [row + 1, col - 1]] },
    { cx: x0 + PAGE_W, cy: y0 + PAGE_H, n: [[row + 1, col], [row, col + 1], [row + 1, col + 1]] },
  ];
  for (const c of corners) {
    if (c.n.some(([r, cc]) => has(r, cc))) {
      inner += `<rect x="${c.cx - SQ / 2}" y="${c.cy - SQ / 2}" width="${SQ}" height="${SQ}" fill="#111"/>`;
    }
  }

  // Join ticks at 1/4, 1/2, 3/4 of every edge shared with a printed neighbour.
  const fr = [0.25, 0.5, 0.75];
  if (has(row, col - 1)) for (const f of fr) {
    inner += `<line x1="${x0}" y1="${y0 + PAGE_H * f}" x2="${x0 + TICK}" y2="${y0 + PAGE_H * f}" stroke="#111" stroke-width="0.5"/>`;
  }
  if (has(row, col + 1)) for (const f of fr) {
    inner += `<line x1="${x0 + PAGE_W - TICK}" y1="${y0 + PAGE_H * f}" x2="${x0 + PAGE_W}" y2="${y0 + PAGE_H * f}" stroke="#111" stroke-width="0.5"/>`;
  }
  if (has(row - 1, col)) for (const f of fr) {
    inner += `<line x1="${x0 + PAGE_W * f}" y1="${y0}" x2="${x0 + PAGE_W * f}" y2="${y0 + TICK}" stroke="#111" stroke-width="0.5"/>`;
  }
  if (has(row + 1, col)) for (const f of fr) {
    inner += `<line x1="${x0 + PAGE_W * f}" y1="${y0 + PAGE_H - TICK}" x2="${x0 + PAGE_W * f}" y2="${y0 + PAGE_H}" stroke="#111" stroke-width="0.5"/>`;
  }

  // Continuation arrows: a piece running off this page says WHERE it continues.
  const clampY = (v) => Math.min(y0 + PAGE_H - 10, Math.max(y0 + 26, v));
  const clampX = (v) => Math.min(x0 + PAGE_W - 26, Math.max(x0 + 26, v));
  for (const d of layout.placed) {
    const onPage = d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0;
    if (!onPage) continue;
    const midY = clampY((Math.max(d.y0, y0) + Math.min(d.y0 + d.h, y0 + PAGE_H)) / 2);
    const midX = clampX((Math.max(d.x0, x0) + Math.min(d.x0 + d.w, x0 + PAGE_W)) / 2);
    if (d.x0 + d.w > x0 + PAGE_W && has(row, col + 1)) {
      inner += `<text x="${x0 + PAGE_W - 3}" y="${midY}" font-family="Helvetica" font-size="5" fill="#333" text-anchor="end">&#8594; ${sheetCode(row, col + 1)}</text>`;
    }
    if (d.x0 < x0 && has(row, col - 1)) {
      inner += `<text x="${x0 + 3}" y="${midY}" font-family="Helvetica" font-size="5" fill="#333">${sheetCode(row, col - 1)} &#8592;</text>`;
    }
    if (d.y0 + d.h > y0 + PAGE_H && has(row + 1, col)) {
      inner += `<text x="${midX}" y="${y0 + PAGE_H - 3}" font-family="Helvetica" font-size="5" fill="#333" text-anchor="middle">&#8595; ${sheetCode(row + 1, col)}</text>`;
    }
    if (d.y0 < y0 && has(row - 1, col)) {
      inner += `<text x="${midX}" y="${y0 + 5.5}" font-family="Helvetica" font-size="5" fill="#333" text-anchor="middle">&#8593; ${sheetCode(row - 1, col)}</text>`;
    }
  }

  // small sheet code bottom-left stays: a loose page is never anonymous
  inner += `<text x="${x0 + 4}" y="${y0 + PAGE_H - 3}" font-family="Helvetica" font-size="4" fill="#999">sheet ${sheetCode(row, col)}</text>`;
  return inner;
}

// One A4 sheet's inner markup: a viewBox window over the packed strip.
export function sheetInner(layout, col, row, used) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
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
    inner += `<text x="${x0 + 24}" y="${y0 + 12}" font-family="Helvetica" font-size="4" fill="#999">on this sheet: ${ghosts.join(' &#183; ')}</text>`;
  }
  inner += registerMarks(layout, col, row, used);
  return inner;
}

// The cutting outline of a piece (allowance-included line if present, else the
// sewing line), nested print shows outlines only, one colour per size.
export function outlineD(piece) {
  const cmds = (piece.cutLine || []).length ? piece.cutLine : piece.commands;
  return pathD(cmds, 1);
}

// One nested A4 sheet's inner markup: the SAME viewBox window as a normal
// sheet, but every size's same-named piece is drawn over the largest size's
// placement, each in its own colour. `slots` are the largest size's placed
// dims; each slot knows which piece (by name) to pull from every size.
export function nestedSheetInner(layout, sizes, styleByLabel, col, row, used) {
  const x0 = col * PAGE_W;
  const y0 = row * PAGE_H;
  let inner = '';
  for (const d of layout.placed) {
    if (!(d.x0 < x0 + PAGE_W && d.x0 + d.w > x0 && d.y0 < y0 + PAGE_H && d.y0 + d.h > y0)) continue;
    // Draw largest -> smallest so smaller sizes sit visibly on top.
    for (let si = sizes.length - 1; si >= 0; si--) {
      const piece = sizes[si].byName.get(d.p.name);
      if (!piece) continue;
      const pb = bounds(piece);
      // Register every size at the SAME point: align each piece's top-left to
      // the largest's placed top-left (d.ox/d.oy translate largest-local ->
      // strip; subtract this size's own minX/minY so its corner lands there).
      const tx = (d.b.minX + d.ox) - pb.minX;
      const ty = (d.b.minY + d.oy) - pb.minY;
      const st = styleByLabel.get(sizes[si].size);
      const dash = st.d ? ` stroke-dasharray="${st.d}"` : '';
      inner += `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)})">` +
        `<path d="${outlineD(piece)}" fill="none" stroke="${st.c}" stroke-width="0.5"${dash}/></g>`;
    }
    // Piece name once, at the largest placement corner.
    inner += `<text x="${(d.b.minX + d.ox + 6).toFixed(1)}" y="${(d.b.minY + d.oy + 14).toFixed(1)}" font-family="Helvetica" font-size="7" fill="#555">${d.p.name}</text>`;
  }
  inner += registerMarks(layout, col, row, used);
  return inner;
}
