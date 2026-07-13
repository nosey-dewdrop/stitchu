// v2: full piece SETS per garment, packed like a real pattern sheet.
const createEngine = require(process.env.HOME + '/damla_projects_2026/00_currently_on_working/stitchu/engine/dist/stitchu-engine.js');
const M = [88, 70, 94, 37, 40.5, 58, 35];

function pathD(cmds, s, dx, dy) {
  let d = '';
  for (const c of cmds) {
    const X = v => (v * s + dx).toFixed(1), Y = v => (v * s + dy).toFixed(1);
    if (c.type === 'move') d += `M${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'line') d += `L${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'curve') d += `C${X(c.cp1x)} ${Y(c.cp1y)} ${X(c.cp2x)} ${Y(c.cp2y)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === 'close') d += 'Z';
  }
  return d;
}
function bbox(cmds) {
  let xs = [], ys = [];
  for (const c of cmds) {
    if (c.x !== undefined) { xs.push(c.x); ys.push(c.y); }
    if (c.cp1x !== undefined) { xs.push(c.cp1x, c.cp2x); ys.push(c.cp1y, c.cp2y); }
  }
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
}
function shortName(n) {
  return n.replace(' (quarter circle)', '').toLowerCase();
}
// Greedy shelf pack into W x H (viewBox units) at scale s; null if overflow.
function pack(pieces, s, W, H, gap) {
  const items = pieces.map(p => ({ p, b: bbox(p.commands) }))
    .sort((a, b) => b.b.h * s - a.b.h * s);
  let x = 0, y = 0, rowH = 0;
  const placed = [];
  for (const it of items) {
    const w = it.b.w * s, h = it.b.h * s;
    if (w > W) return null;
    if (x + w > W) { x = 0; y += rowH + gap; rowH = 0; }
    if (y + h > H) return null;
    placed.push({ ...it, X: x, Y: y });
    x += w + gap; rowH = Math.max(rowH, h);
  }
  return placed;
}
// Full pattern sheet: all pieces with tiny labels, like a real envelope sheet.
function sheetSVG(pattern, W, H) {
  const pieces = pattern.pieces;
  let lo = 0.001, hi = 1;
  let best = null;
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    const got = pack(pieces, mid, W - 16, H - 42, 9);
    if (got) { best = { s: mid, placed: got }; lo = mid; } else hi = mid;
  }
  const { s, placed } = best;
  // center the block
  const maxX = Math.max(...placed.map(d => d.X + d.b.w * s));
  const maxY = Math.max(...placed.map(d => d.Y + d.b.h * s));
  const ox = (W - maxX) / 2, oy = 14 + (H - 42 - maxY) / 2;
  let out = `<svg viewBox="0 0 ${W} ${H}" fill="none">`;
  const labels = [];
  for (const d of placed) {
    const dx = ox + d.X - d.b.x * s, dy = oy + d.Y - d.b.y * s;
    out += `<path d="${pathD(d.p.commands, s, dx, dy)}" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round"/>`;
    if (d.p.markings.length) out += `<path d="${pathD(d.p.markings, s, dx, dy)}" stroke="#8f2038" stroke-width="1" stroke-dasharray="3 2.5"/>`;
    labels.push({ x: ox + d.X + (d.b.w * s) / 2, y: oy + d.Y + d.b.h * s + 7, t: shortName(d.p.name) });
  }
  // labels collide when pieces sit close: nudge later ones down a row
  labels.sort((a, b) => a.y - b.y || a.x - b.x);
  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(labels[i].y - labels[j].y) < 8 &&
          Math.abs(labels[i].x - labels[j].x) < (labels[i].t.length + labels[j].t.length) * 1.9) {
        labels[i].y = labels[j].y + 9;
      }
    }
  }
  for (const l of labels) {
    const cx = Math.min(W - l.t.length * 1.7 - 4, Math.max(l.t.length * 1.7 + 4, l.x));
    out += `<text x="${cx.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="6.5" fill="#8f2038" font-family="Helvetica" text-anchor="middle">${l.t}</text>`;
  }
  out += `<text x="10" y="${H - 6}" font-size="8" fill="#1a1a1a" font-family="Helvetica" font-weight="bold">${pattern.garment.toUpperCase()}</text>`;
  out += `<text x="${W - 10}" y="${H - 6}" font-size="7" fill="#8f2038" font-family="Helvetica" text-anchor="end">${pattern.pieces.length} pieces · ${pattern.fabricMeters140} m · drafted for EU38</text>`;
  return out + `</svg>`;
}
// Bodice front pair: center + side facing each other (the corset look).
function pairSVG(center, side) {
  const bc = bbox(center.commands), bs = bbox(side.commands);
  const H = Math.max(bc.h, bs.h);
  const s = Math.min(196 / (bc.w + bs.w + 14), 210 / H);
  const dyBase = 20;
  let out = `<svg viewBox="0 0 220 260" fill="none">`;
  const dx1 = 12 - bc.x * s, dy1 = dyBase - bc.y * s;
  out += `<path d="${pathD(center.commands, s, dx1, dy1)}" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (center.markings.length) out += `<path d="${pathD(center.markings, s, dx1, dy1)}" stroke="#8f2038" stroke-width="1.1" stroke-dasharray="3 2.5"/>`;
  const dx2 = 12 + bc.w * s + 14 - bs.x * s, dy2 = dyBase + (bc.h * 0.22) * s - bs.y * s;
  out += `<path d="${pathD(side.commands, s, dx2, dy2)}" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (side.markings.length) out += `<path d="${pathD(side.markings, s, dx2, dy2)}" stroke="#8f2038" stroke-width="1.1" stroke-dasharray="3 2.5"/>`;
  out += `<text x="12" y="246" font-size="10.5" fill="#1a1a1a" font-family="Helvetica" font-weight="bold">BODICE FRONT · TWO PANELS</text>`;
  out += `<text x="12" y="257" font-size="8" fill="#8f2038" font-family="Helvetica">the princess seam joins them over the bust · drafted for EU38</text>`;
  return out + `</svg>`;
}
function tilingSVG(piece, label) {
  const PW = 190, PH = 250, b = bbox(piece.commands);
  const cols = Math.max(1, Math.ceil((b.w + 24) / PW)), rows = Math.max(1, Math.ceil((b.h + 24) / PH));
  const s = Math.min(200 / (cols * PW), 205 / (rows * PH));
  const dx = (240 - cols * PW * s) / 2, dy = 18;
  let out = `<svg viewBox="0 0 240 260" fill="none">`;
  for (let c = 0; c <= cols; c++) out += `<line x1="${(dx + c * PW * s).toFixed(1)}" y1="${dy}" x2="${(dx + c * PW * s).toFixed(1)}" y2="${(dy + rows * PH * s).toFixed(1)}" stroke="#1a1a1a" stroke-width="${c === 0 || c === cols ? 1.6 : 1}"/>`;
  for (let r = 0; r <= rows; r++) out += `<line x1="${dx.toFixed(1)}" y1="${(dy + r * PH * s).toFixed(1)}" x2="${(dx + cols * PW * s).toFixed(1)}" y2="${(dy + r * PH * s).toFixed(1)}" stroke="#1a1a1a" stroke-width="${r === 0 || r === rows ? 1.6 : 1}"/>`;
  let n = 1;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
    out += `<text x="${(dx + c * PW * s + 5).toFixed(1)}" y="${(dy + r * PH * s + 12).toFixed(1)}" font-size="8" fill="#8f2038" font-family="Helvetica">${n++}</text>`;
  const pdx = dx + (cols * PW * s - b.w * s) / 2 - b.x * s, pdy = dy + (rows * PH * s - b.h * s) / 2 - b.y * s;
  out += `<path d="${pathD(piece.commands, s, pdx, pdy)}" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round"/>`;
  if (piece.markings.length) out += `<path d="${pathD(piece.markings, s, pdx, pdy)}" stroke="#8f2038" stroke-width="1.1" stroke-dasharray="3 3"/>`;
  const sq = 30 * s;
  out += `<rect x="${(dx + 5).toFixed(1)}" y="${(dy + 5).toFixed(1)}" width="${sq.toFixed(1)}" height="${sq.toFixed(1)}" stroke="#1a1a1a" stroke-width="1.2"/>`;
  out += `<text x="12" y="246" font-size="10.5" fill="#1a1a1a" font-family="Helvetica" font-weight="bold">${label}</text>`;
  out += `<text x="12" y="257" font-size="8" fill="#8f2038" font-family="Helvetica">real tiling · ${cols}x${rows} A4 sheets · square = 3 cm check</text>`;
  return out + `</svg>`;
}

createEngine().then(e => {
  const draft = (args) => JSON.parse(e.draftJSON(...args, false, 1, false, ...M)).pattern;
  const dress = draft(['dress','princess','natural','woven','scoop','none','short','aLine','midi','hip']);
  const babydoll = draft(['dress','princess','empire','woven','scoop','balloon','short','gathered','midi','hip']);
  const top = draft(['top','princess','natural','woven','scoop','none','short','aLine','midi','cropped']);
  const knit = draft(['dress','princess','natural','knit','vNeck','straight','long','straight','midi','hip']);
  const find = (p, ...names) => { for (const n of names) { const h = p.pieces.find(x => x.name === n); if (h) return h; } return p.pieces[0]; };

  const out = {};
  out.heroPair = pairSVG(find(dress,'Bodice Center Front'), find(dress,'Bodice Side Front'));
  out.heroTiling = tilingSVG(find(dress,'Bodice Center Front'), 'BODICE · CENTER FRONT');
  out.proofSheet = sheetSVG(dress, 300, 260);
  out.tiling = tilingSVG(find(dress,'Bodice Center Front'), 'BODICE · CENTER FRONT');
  out.exBabydoll = sheetSVG(babydoll, 300, 260);
  out.exTop = sheetSVG(top, 300, 260);
  out.exKnit = sheetSVG(knit, 300, 260);
  console.log(JSON.stringify(out));
});
